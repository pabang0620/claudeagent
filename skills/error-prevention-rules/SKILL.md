---
name: error-prevention-rules
description: React 런타임 에러(무한 렌더, race condition, stale closure, cleanup 누락, 무한 루프) 사전 차단 정적 검사 스킬. useEffect 의존성/cleanup, AbortController, IntersectionObserver/MutationObserver/PerformanceObserver/setTimeout 해제, onError 자기 해제, Mutation pending ref, stale closure, Zustand selector, array key index, localStorage try/catch, BroadcastChannel cleanup, click 핸들러 isMounted 가드 등 14개 룰. `.jsx/.tsx` 저장 시점 자동 적용. WeCom 회고 근거 — React/렌더링 fix 14건, cleanup/race condition fix 36건 차단.
---

# error-prevention-rules

> WeCom 회고 근거: `e95ea5b` Zustand 무한 렌더, `fa3dc46` img onError 9파일 무한 루프, `4b5168f` mutation 버튼 중복 제출, AbortController 누락 12+건, IntersectionObserver/setTimeout cleanup 누락 다수.

## 적용 트리거
1. **자동** — `.jsx/.tsx` 저장 직후
2. **수동** — `/error-prevention-check <경로>`
3. **planner 사전 체크** — useEffect·fetch·hook 설계 단계에서 룰 사전 주입

## 핵심 원칙
- **useEffect는 언마운트 = 잠재적 버그**. cleanup 없이 side effect 걸면 메모리 누수·stale setState
- **비동기는 반드시 cleanup**. AbortController, IntersectionObserver, setTimeout, WebSocket, EventSource 전부
- **렌더 중 객체/함수 생성 금지**. 매 렌더 새 참조 → 자식 리렌더·무한 루프
- **사용자 입력은 pending 락**. 중복 제출 방지

---

## 체크리스트 룰 (ep-001 ~ ep-014)

### ep-001 — useEffect AbortController 강제 (error, autofix: hint)
**match**: `useEffect` 내부에서 다음 중 하나 + cleanup `return` 없음
- `fetch(` 직접 호출
- `axios.` 또는 `axios(` 호출
- `api.` 또는 `api(` 호출 (apiClient 포함)
- `fetch` 로 시작하는 API 레이어 함수 호출 (`fetchUsers(`, `fetchEvents(`, `fetchUniversities(` 등) → warn
- `get*`, `load*`, `request*` 접두사 async 함수 호출 → warn
- ⚠️ false positive 가능성 명시: API 레이어가 AbortController 를 내부 처리하는 경우
- 내부 async 함수 선언 후 즉시 호출 패턴:
  - `const \w+ = async (...) => { ... }` + `\w+()`
  - `(async () => { ... })()` IIFE
  - `async function \w+() { ... }` + `\w+()`
- 이들 async 함수 내부에 `await fetch|axios|api`
**antipattern**:
```jsx
useEffect(() => {
  fetch(`/api/user/${id}`).then(r => r.json()).then(setUser)
}, [id])
```
**correct** (동기 then 체인):
```jsx
useEffect(() => {
  const ac = new AbortController()
  fetch(`/api/user/${id}`, { signal: ac.signal })
    .then(r => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
  return () => ac.abort()
}, [id])
```

**correct** (async IIFE 패턴 — WeCom에서 가장 흔한 형태):
```jsx
useEffect(() => {
  const ac = new AbortController()
  const load = async () => {
    try {
      const data = await fetchUser(id, { signal: ac.signal })
      setUser(data)
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    }
  }
  load()
  return () => ac.abort()
}, [id])
```

**antipattern** (추가):
```jsx
// 패턴: named async function (useAdminDashboard.js 실제 WeCom 패턴)
useEffect(() => {
  async function loadStats() {
    const data = await fetchDashboardStats()
    setStats({ ... })
  }
  loadStats()
  // ❌ return 없음 → error
}, [])
```

**correct** (named async + cleanup):
```jsx
useEffect(() => {
  const ac = new AbortController()
  async function loadStats() {
    try {
      const data = await fetchDashboardStats({ signal: ac.signal })
      setStats(data)
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    }
  }
  loadStats()
  return () => ac.abort()
}, [])
```
**근거**: WeCom fetch fix 12+건에서 언마운트 후 setState 발생 → React 경고 + stale 상태

### ep-002 — img onError 자기 해제 (error, autofix: hint)
**match**: `<img` 또는 `<Image` JSX 에 `onError` 속성이 있고, 핸들러 내부에 **`e.target.src = ` 또는 `e.currentTarget.src = `** (fallback src 재할당) 존재 + `e.target.onerror = null` (또는 `e.currentTarget.onerror = null`) 없음
**예외 (통과)**:
- `e.currentTarget.style.display = 'none'` 또는 `style.visibility = 'hidden'` 만 조작 — 이미지 숨김 후 onError 재발화 없음
- Set/Map 등 상태 업데이트만 수행하고 src 재할당 없는 경우 (예: failedThumbnails Set)
- SafeImage 컴포넌트 사용
**antipattern**:
```jsx
<img src={url} onError={(e) => { e.target.src = '/fallback.png' }} />
```
**correct**:
```jsx
<img src={url} onError={(e) => {
  e.target.onerror = null                  // ★ 핵심: 자기 해제 (무한 루프 차단의 근본 방어)
  e.target.src = '/fallback.png'
}} />
// 더 나은 방법: ui-design-system 의 SafeImage 컴포넌트 사용
```
**핵심 방어는 `onerror = null`** — endsWith 가드는 동적 fallback URL(`/fallback/${type}.png`) 에서 무력화되므로 자기 해제가 필수.
**근거**: `fa3dc46` 9파일에서 fallback URL도 404일 때 무한 루프

### ep-003 — Zustand 전체 구독 금지 (error, autofix: hint)
→ convention-enforcer ce-003 와 동일. 본 스킬은 "감지" 동일하되 에러 메시지에 **무한 렌더 원인**을 설명

### ep-004 — setTimeout/setInterval cleanup (error, autofix: hint)
**match**: `useEffect` 내부 `setTimeout(` 또는 `setInterval(` + cleanup 누락
**antipattern**:
```jsx
useEffect(() => {
  setTimeout(() => setVisible(true), 1000)  // 언마운트 후에도 발동 → stale setState
}, [])
```
**correct**:
```jsx
useEffect(() => {
  const t = setTimeout(() => setVisible(true), 1000)
  return () => clearTimeout(t)
}, [])
```

### ep-005 — IntersectionObserver/ResizeObserver cleanup (error, autofix: hint)
**match**: 다음 Observer 생성 + cleanup 누락
- `new IntersectionObserver(`
- `new ResizeObserver(`
- `new MutationObserver(`
- `new PerformanceObserver(`
**antipattern**:
```jsx
useEffect(() => {
  const io = new IntersectionObserver(onIntersect)
  io.observe(ref.current)
  // disconnect 누락
}, [])
```
**correct**:
```jsx
useEffect(() => {
  const io = new IntersectionObserver(onIntersect)
  io.observe(ref.current)
  return () => io.disconnect()
}, [])
```
```jsx
// MutationObserver 예시
useEffect(() => {
  const mo = new MutationObserver(onMutation)
  mo.observe(ref.current, { childList: true, subtree: true })
  return () => mo.disconnect()
}, [])
```

### ep-006 — Mutation 버튼 pending ref (error, autofix: hint)
**match**: `onClick` 이 async 함수 + API 호출 + `useState` 로 pending 관리
**antipattern**:
```jsx
const [submitting, setSubmitting] = useState(false)
const handleSubmit = async () => {
  setSubmitting(true)
  await api.create(data)       // 사용자가 2번 클릭하면 2번 호출됨 (setState 비동기)
  setSubmitting(false)
}
```
**correct**:
```jsx
const pendingRef = useRef(false)
const [submitting, setSubmitting] = useState(false)
const handleSubmit = async () => {
  if (pendingRef.current) return   // 즉시 락 (ref 는 동기)
  pendingRef.current = true
  setSubmitting(true)
  try { await api.create(data) }
  finally {
    pendingRef.current = false
    setSubmitting(false)
  }
}
<button disabled={submitting} onClick={handleSubmit}>제출</button>
```
**근거**: `4b5168f` mutation 중복 제출 → 주문 2건 생성 버그

### ep-007 — useEffect stale closure 감지 (warn, autofix: hint)
**match**: `useEffect(() => { ... }, [])` (빈 의존성 배열) + 콜백 내부 `setInterval`/`setTimeout`/콜백 등록 + `useState`/`useReducer`로 선언된 상태 변수 직접 참조 (컴포넌트 스코프 변수)
**antipattern**:
```jsx
useEffect(() => {
  const t = setInterval(() => {
    console.log(count)   // count 는 초기값에 바인딩 (stale)
  }, 1000)
  return () => clearInterval(t)
}, [])  // 빈 의존성
```
**correct**:
```jsx
const countRef = useRef(count)
useEffect(() => { countRef.current = count }, [count])
useEffect(() => {
  const t = setInterval(() => console.log(countRef.current), 1000)
  return () => clearInterval(t)
}, [])
```

### ep-008 — 렌더 중 객체/배열 리터럴 전달 금지 (warn, autofix: hint)
**match**: JSX prop에 인라인 객체/배열/함수 리터럴 전달 (memo 여부 무관 — 매 렌더 새 참조 생성 자체가 문제)
**예외** (warn 하향):
- **단일 레벨 객체이며 모든 값이 원시값**(string|number|boolean) 인 경우
  - 예: `style={{ color: 'red', padding: 8 }}`
  - 예: `autoplay={{ delay: 3500, disableOnInteraction: false }}` (Swiper 프레임워크 prop)
- **warn 유지**:
  - 중첩 객체, 배열, 함수를 값으로 포함하는 경우
  - 예: `config={{ items: [...], onClick: () => ... }}`
**antipattern**:
```jsx
<MemoChild options={{ size: 'lg' }} list={[1,2,3]} onSelect={(v) => setX(v)} />
// 매 렌더마다 새 참조 → memo 무효화 → 자식 리렌더
```
**correct**:
```jsx
const OPTIONS = { size: 'lg' }
const LIST = [1, 2, 3]
const handleSelect = useCallback((v) => setX(v), [])
<MemoChild options={OPTIONS} list={LIST} onSelect={handleSelect} />
```

### ep-009 — array key index 금지 (warn, autofix: hint)
**match**: `.map((item, i) => <Component key={i}`
**antipattern**:
```jsx
items.map((it, i) => <Card key={i} data={it} />)
// 중간 삽입/삭제 시 React reconciliation 오류 → 입력값 섞임
```
**correct**:
```jsx
items.map((it) => <Card key={it.id} data={it} />)
```
**예외**: 절대 불변 정적 리스트 (생성 후 순서 변경 없음) — 주석으로 명시 시 통과

### ep-010 — localStorage/sessionStorage try/catch (warn, autofix: hint)
**match**:
- `localStorage.setItem(` 또는 `sessionStorage.setItem(` 단독 호출 — try/catch 없음 (iOS Safari 프라이빗 모드 / QuotaExceededError)
- `JSON.parse(localStorage.getItem(` 또는 `JSON.parse(sessionStorage.getItem(` — try/catch 없음 (SyntaxError)
**제외**: `getItem(` 단독 호출은 throw 하지 않음, try/catch 불필요
**antipattern**:
```jsx
const user = JSON.parse(localStorage.getItem('user'))  // 값 null / 파싱 오류 시 throw
localStorage.setItem('user', JSON.stringify(user))     // QuotaExceededError 가능
```
**correct**:
```jsx
const safeGet = (key) => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') }
  catch { return null }
}
const safeSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) }
  catch (e) { console.warn('storage 저장 실패', e) }
}
```
**이유**: iOS Safari 프라이빗 모드·용량 초과 시 throw. 대부분의 앱은 이 보호 없이 충돌

### ep-011 — WebSocket/EventSource/BroadcastChannel cleanup (error, autofix: hint)
**match**: `new WebSocket(` 또는 `new EventSource(` 또는 `new BroadcastChannel(` + cleanup 누락
**correct**:
```jsx
useEffect(() => {
  const ws = new WebSocket(url)
  ws.onmessage = handleMessage
  return () => ws.close()
}, [url])
```
```jsx
useEffect(() => {
  const bc = new BroadcastChannel('notifications')
  bc.onmessage = handleMessage
  return () => bc.close()
}, [])
```

### ep-013 — window/document addEventListener cleanup (error, autofix: hint)
**match**: `useEffect` 콜백 내부에서 `window.addEventListener(` 또는 `document.addEventListener(` 호출 + cleanup `return` 에 `removeEventListener` 없음
**antipattern**:
```jsx
useEffect(() => {
  const onKey = (e) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', onKey)  // 언마운트 후에도 리스너 잔존 → stale setState
}, [])
```
**correct**:
```jsx
useEffect(() => {
  const onKey = (e) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])
```
**근거**: WeCom EpisodeViewerPage 에서 scroll/touch/keydown 리스너 4개 사용. 현재는 cleanup 되어 있으나 신규 코드 작성 시 누락 위험 높음. mf-005 는 드래그 전용이지만 이 룰은 일반 이벤트 리스너 전반.

### ep-014 — Click 핸들러 내 Promise.all/allSettled isMounted 가드 (warn, autofix: hint)
**match**: 컴포넌트 함수 내 async 이벤트 핸들러 (`onClick`, `onSubmit` 등) 에서 `Promise.all(` 또는 `Promise.allSettled(` 호출 후 결과로 setState
**antipattern**:
```jsx
// useMyWebtoon.js 실제 WeCom 패턴
const handleCreateSubmit = async () => {
  const createdUuid = await createWebtoon(data)
  const results = await Promise.allSettled(
    selectedEventIds.map((eid) => submitEventEntry(eid, createdUuid))
  )
  setResults(results)  // 언마운트 후 stale setState 위험
}
```
**correct** (isMounted ref 가드):
```jsx
const isMountedRef = useRef(true)
useEffect(() => {
  isMountedRef.current = true
  return () => { isMountedRef.current = false }
}, [])

const handleCreateSubmit = async () => {
  const createdUuid = await createWebtoon(data)
  const results = await Promise.allSettled(
    selectedEventIds.map((eid) => submitEventEntry(eid, createdUuid))
  )
  if (!isMountedRef.current) return
  setResults(results)
}
```
**근거**: useEffect 외부 핸들러는 언마운트 시 자동 취소되지 않음. 여러 비동기 완료 후 각 setState 가 stale 상태로 적용됨.

### ep-012 — useEffect 의존성 배열 누락 경고 (warn, autofix: no)
**match**: `useEffect` 콜백 내부에서 사용한 식별자가 의존성 배열에 없음
**처리**: ESLint `react-hooks/exhaustive-deps` 에 위임하되, 프로젝트에 ESLint 설정이 없으면 이 스킬이 감지 후 ESLint 설정 추가 제안

---

## 실행 프로토콜

0. **환경 확인**: `package.json` 의 `eslintConfig` 또는 `eslint.config.*` / `.eslintrc*` 파일 존재 체크
   - 없으면: ep-012 실행 전 "ESLint react-hooks/exhaustive-deps 플러그인 설정을 권장합니다" 출력 후 진행
1. **변경 파일 수집**: 저장된 `.jsx/.tsx` 파일
2. **룰 적용 순서**: error 심각도 먼저 (ep-001/002/004/005/006/011/013) → warn (ep-007/008/009/010/012/014)
3. **각 룰**: Grep + JSX 구조 정적 분석
4. **출력 형식**:
   ```
   🚨 error-prevention-check 결과

   | 파일 | 라인 | 룰 | 심각도 | 메시지 |
   |---|---|---|---|---|
   | UserPage.jsx | 34 | ep-001 | error | useEffect 내 fetch — AbortController 누락 |
   | ListPage.jsx | 12 | ep-009 | warn  | key={i} 사용 — item.id 권장 |

   통과: X건 / 경고: Y건 / 에러: Z건
   ```

---

## 탐지 한계 (명시)

- **React hooks rules** (`react-hooks/rules-of-hooks`): ESLint에 위임 (조건부 훅 호출 등)
- **useEffect exhaustive-deps**: ESLint `react-hooks/exhaustive-deps` 에 위임 (ep-012)
- **AST 기반 심층 분석**: 이 스킬은 Grep + 패턴 매칭. 복잡한 JSX 트리(조건부 렌더 내부)는 false negative 가능
- **Async/await 체인**: `.then()` 내부 revoke, `try/finally` 배치는 Claude 수동 추론 의존
- **API 레이어 AbortController 자체 관리**: `fetchXxx()` 함수가 내부적으로 signal 을 받고 AbortController 를 처리하는 경우 ep-001 false positive 발생 가능 → 해당 커스텀 훅(`useXxxFetch`)에 `signal` 파라미터 있는지 수동 확인 필요
- **React 19 `use(promise)` 패턴**: 렌더 함수 내 `use(fetch(...))` 또는 캐시된 promise 전달 — ep-001 대상 외. 컴포넌트 외부 promise 캐시(React Query, SWR, 전역 캐시)와 동일하게 Suspense boundary 에서 관리되므로 제외.
- **Strict Mode 이중 렌더링 주의**: React 19 Strict Mode 는 개발환경에서 effect 를 2회 실행. ep-006 의 pendingRef 는 useEffect cleanup 에서 false 로 리셋해야 false positive 방지. `useEffect(() => { return () => { pendingRef.current = false } }, [])` 추가 권장.
- **Promise.all/Promise.allSettled 병렬 fetch**: 단일 AbortController 로는 cleanup 불충분. 배열 controller 패턴 필요 — 현재 룰 미커버, 수동 검토 권장
  ```jsx
  useEffect(() => {
    const ac1 = new AbortController()
    const ac2 = new AbortController()
    Promise.allSettled([
      fetch('/api/a', { signal: ac1.signal }),
      fetch('/api/b', { signal: ac2.signal }),
    ])
    return () => { ac1.abort(); ac2.abort() }
  }, [])
  ```

## 충돌 회피

- **convention-enforcer ce-003** (Zustand 전체 구독): 동일 감지, 이 스킬은 "무한 렌더 원인 설명" 메시지 첨부
- **mobile-first-checker mf-008** (blob URL cleanup): 본 스킬은 blob 이 아닌 일반 리소스 cleanup 담당
- **ui-design-system SafeImage**: ep-002는 raw `<img>` 대상. SafeImage 사용 시 통과
- **api-contract-designer**: API 응답 형식·계약 담당, 본 스킬은 클라이언트 호출 패턴만

## 자기검증 시나리오

1. **기본**: `useEffect` 내 fetch cleanup 없음 → ep-001 error + AbortController 템플릿 힌트
2. **엣지**: `<img onError={e => e.target.src = '/x.png'} />` → ep-002 error (자기 해제 + 가드 힌트)
3. **복합**: `setInterval` + stale count + 인라인 객체 prop + `key={i}` → ep-004/007/008/009 동시 4건

## 성공 지표
- **fetch cleanup 관련 fix**: 12+건 → 2건 이하
- **img onError 무한 루프 fix**: 9건 → 0건
- **mutation 중복 제출 fix**: 여러 건 → 0건
- **IntersectionObserver cleanup 누락**: 감지율 100%

## 자기검증 — WeCom 현재 기준 예상 탐지

이 스킬을 현재 WeCom frontend/src 에 적용하면 다음을 탐지해야 한다:
- ep-001: useNotices/useAdminDashboard/Header/MobileLayout 4+건 (fetch cleanup 없음)
- ep-002: UniversityDetailPage/MobileJobPostDetailPage/AdminBannersPage (onerror=null 없이 src 재할당) — 단 style.display='none' 만 조작하는 건 예외
- ep-004: setTimeout/setInterval cleanup (MobileEventDetailPage 는 정상)
- ep-008: Swiper autoplay={{ delay: 3500 }} 는 원시값 단일 레벨 예외 적용 → warn 하향
- ep-009: BannerPositionPreview/MyEpisodePage key={i} (정적 리스트 예외 해당 가능)

이 예상치에서 크게 벗어나면 룰 동작 이상.

## 참고 커밋
`e95ea5b` (Zustand) · `fa3dc46` (img onError 9파일) · `4b5168f` (mutation pending) · `c1e8d2c` · WeCom fetch/useEffect fix 다수
