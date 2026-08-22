// 경로 첫 세그먼트를 플로우 단위로 삼는다. admin 같은 네임스페이스 접두사는
// 그 자체로는 도메인이 아니라서 한 단계 더 내려간다.
const NAMESPACES = new Set(['admin', 'api', 'v1', 'v2', 'manage', 'internal', 'public'])

const LABELS = {
  auth: '인증', user: '회원', users: '회원', member: '회원', account: '계정',
  order: '주문', orders: '주문', cart: '장바구니', payment: '결제', payments: '결제',
  product: '상품', products: '상품', item: '상품', items: '상품', goods: '상품',
  post: '게시글', posts: '게시글', board: '게시판', comment: '댓글', comments: '댓글',
  notice: '공지', notices: '공지', banner: '배너', banners: '배너',
  upload: '업로드', file: '파일', files: '파일', image: '이미지',
  search: '검색', notification: '알림', notifications: '알림',
  admin: '관리자', dashboard: '대시보드', stat: '통계', stats: '통계',
  settlement: '정산', settlements: '정산', event: '이벤트', events: '이벤트',
  job: '채용', jobs: '채용', like: '좋아요', likes: '좋아요',
  rating: '평점', ratings: '평점', review: '리뷰', reviews: '리뷰',
  webtoon: '웹툰', webtoons: '웹툰', episode: '회차', episodes: '회차',
  conversation: '대화', chat: '채팅', message: '메시지', messages: '메시지',
  home: '홈', nav: '네비게이션', master: '기준정보', checkin: '체크인',
}

function labelFor(key) {
  const parts = key.split('/')
  return parts.map((p) => LABELS[p] || p).join(' · ')
}

// `:param` 은 리소스 이름이 아니므로 건너뛴다.
// /api/events/:eventId/companies → ['events','companies']
function segsOf(pathStr) {
  return pathStr
    .replace(/^\/api(?=\/|$)/, '')
    .split('/')
    .filter((s) => s && !s.startsWith(':'))
}

function flowKey(pathStr) {
  const segs = segsOf(pathStr)
  if (!segs.length) return 'root'
  if (NAMESPACES.has(segs[0]) && segs[1]) return `${segs[0]}/${segs[1]}`
  return segs[0]
}

// 한 플로우에 너무 많이 몰리면 두 번째 세그먼트로 한 단계 더 쪼갠다.
// /events/:id/companies 같은 중첩 리소스에서 전부 "events"로 뭉치는 것을 막는다.
const SPLIT_THRESHOLD = 20

function refineKeys(endpoints) {
  const groups = new Map()
  for (const ep of endpoints) {
    const key = flowKey(ep.path)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(ep)
  }
  const keyOf = new Map()
  for (const [key, list] of groups) {
    const seconds = new Set(list.map((ep) => segsOf(ep.path)[1] || ''))
    seconds.delete('')
    if (list.length > SPLIT_THRESHOLD && seconds.size >= 2 && !key.includes('/')) {
      for (const ep of list) {
        const second = segsOf(ep.path)[1]
        keyOf.set(ep, second ? `${key}/${second}` : key)
      }
    } else {
      for (const ep of list) keyOf.set(ep, key)
    }
  }
  return keyOf
}

export function clusterFlows(endpoints, pages) {
  const flows = new Map()
  const keyOf = refineKeys(endpoints)
  for (const ep of endpoints) {
    const key = keyOf.get(ep)
    if (!flows.has(key)) {
      flows.set(key, {
        id: `f_${key.replace(/[^A-Za-z0-9]/g, '_')}`,
        key,
        label: labelFor(key),
        endpointIds: [],
        tables: new Set(),
        pages: new Set(),
      })
    }
    const flow = flows.get(key)
    flow.endpointIds.push(ep.id)
    ep.flowId = flow.id
    ep.touches.forEach((t) => flow.tables.add(t.table))
    ep.calledBy.forEach((p) => flow.pages.add(p))
  }

  const list = [...flows.values()].map((f) => ({
    id: f.id,
    key: f.key,
    label: f.label,
    endpointIds: f.endpointIds,
    tables: [...f.tables].sort(),
    pages: [...f.pages].sort(),
  }))

  // 엔드포인트가 많은 순 = 프로젝트에서 비중이 큰 순
  list.sort((a, b) => b.endpointIds.length - a.endpointIds.length)
  return list
}

// 그래프 데이터에서 그대로 계산되는 점검 항목. 추가 분석 없이 나온다.
export function buildFindings(endpoints, flows, tableSchemas) {
  const orphan = endpoints
    .filter((ep) => ep.calledBy.length === 0)
    .map((ep) => ({ label: `${ep.method} ${ep.path}`, src: ep.src }))

  const noAuth = endpoints
    .filter((ep) => !ep.auth && !/^\/(api\/)?(auth|health)/.test(ep.path))
    .map((ep) => ({ label: `${ep.method} ${ep.path}`, src: ep.src }))

  // 같은 메서드 + 같은 테이블을 건드리는데 경로가 다른 것 = 중복 구현 의심
  const bySignature = new Map()
  for (const ep of endpoints) {
    if (!ep.touches.length) continue
    const sig = `${ep.method}|${ep.touches.map((t) => t.table).sort().join(',')}`
    if (!bySignature.has(sig)) bySignature.set(sig, [])
    bySignature.get(sig).push(ep)
  }
  const duplicate = []
  for (const [, group] of bySignature) {
    if (group.length < 2) continue
    const paths = [...new Set(group.map((e) => e.path))]
    if (paths.length < 2) continue
    duplicate.push({
      label: `${group[0].method} · ${group[0].touches.map((t) => t.table).join(', ')}`,
      items: group.map((e) => ({ label: e.path, src: e.src })),
    })
  }

  const used = new Set(endpoints.flatMap((ep) => ep.touches.map((t) => t.table)))
  const unusedTables = Object.keys(tableSchemas)
    .filter((t) => !used.has(t))
    .map((t) => ({ label: t, src: '' }))

  return { orphan, noAuth, duplicate, unusedTables }
}
