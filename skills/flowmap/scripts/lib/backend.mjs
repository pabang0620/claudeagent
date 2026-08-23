import path from 'path'
import fs from 'fs'
import { walk, read, stripComments, lineOf, joinPath, rel, splitFunctions } from './util.mjs'

const VERBS = ['get', 'post', 'put', 'patch', 'delete', 'all']
const AUTH_HINT = /auth|require|admin|permission|guard|verify|protect/i

// import 이름 → 실제 파일 절대경로.
// default / namespace(* as X) / named({a, b}) 세 형태를 모두 받는다.
function importMap(code, fromFile) {
  const map = Object.create(null)
  const re = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(code))) {
    const [, clause, spec] = m
    if (!spec.startsWith('.')) continue
    const base = path.resolve(path.dirname(fromFile), spec)
    let resolved = null
    for (const cand of [base, `${base}.js`, `${base}.mjs`, `${base}.ts`, `${base}/index.js`]) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) { resolved = cand; break }
    }
    if (!resolved) continue
    for (const id of clause.match(/[A-Za-z0-9_$]+/g) || []) {
      if (id === 'as' || id === 'from') continue
      map[id] = resolved
    }
  }
  return map
}

// app, router, xxxRouter 처럼 라우터로 볼 수 있는 식별자만 대상으로 삼는다.
// req.get() / res.status() 같은 무관한 호출이 섞이는 것을 막는다.
const ROUTER_OBJ = '(?:app|router|[A-Za-z0-9_$]*[Rr]outer)'

// `(` 위치에서 시작해 짝이 맞는 `)` 까지의 인자 문자열을 반환한다.
// validate(createSchema) 처럼 중첩 호출이 인자로 들어오는 경우가 흔해서
// [^)]* 로는 인자를 잘못 자른다.
function readArgs(code, openIdx) {
  let depth = 0
  for (let i = openIdx; i < code.length; i++) {
    const c = code[i]
    if (c === '(') depth++
    else if (c === ')') {
      depth--
      if (depth === 0) return code.slice(openIdx + 1, i)
    }
  }
  return ''
}

// 최상위 콤마로만 인자를 쪼갠다 (중첩 괄호 안의 콤마는 무시)
function topLevelArgs(argStr) {
  const out = []
  let depth = 0
  let cur = ''
  for (const c of argStr) {
    if (c === '(' || c === '[' || c === '{') depth++
    else if (c === ')' || c === ']' || c === '}') depth--
    if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue }
    cur += c
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// 라우터 마운트 지점을 재귀적으로 따라가며 prefix를 누적한다.
// routes/index.js 의 router.use('/webtoons', webtoonRoutes) → webtoonRoutes.js 의
// router.get('/:id') 가 최종적으로 GET /webtoons/:id 가 된다.
function collectRoutes(file, prefix, endpoints, unresolved, root, seen) {
  if (seen.has(file)) return
  seen.add(file)
  const raw = read(file)
  const code = stripComments(raw)
  const imports = importMap(code, file)

  const useRe = new RegExp(`\\b${ROUTER_OBJ}\\.use\\s*\\(`, 'g')
  let m
  while ((m = useRe.exec(code))) {
    const args = topLevelArgs(readArgs(code, m.index + m[0].length - 1))
    const first = args[0] || ''
    const sub = first.match(/^['"`]([^'"`]*)['"`]$/)?.[1] ?? ''
    const child = args
      .flatMap((a) => a.match(/[A-Za-z0-9_$]+/g) || [])
      .map((id) => imports[id])
      .find(Boolean)
    if (child) collectRoutes(child, joinPath(prefix, sub), endpoints, unresolved, root, seen)
  }

  const verbRe = new RegExp(`\\b${ROUTER_OBJ}\\.(${VERBS.join('|')})\\s*\\(`, 'g')
  while ((m = verbRe.exec(code))) {
    const verb = m[1]
    const args = topLevelArgs(readArgs(code, m.index + m[0].length - 1))
    const pathLit = (args[0] || '').match(/^['"`]([^'"`]*)['"`]$/)
    if (!pathLit) {
      unresolved.push({
        reason: '경로가 변수로 조립되어 정적 확정 불가',
        src: `${rel(root, file)}:${lineOf(code, m.index)}`,
      })
      continue
    }
    const rest = args.slice(1)
    // 미들웨어는 인자 전체 문자열로 판정하고, 핸들러는 마지막 인자의 식별자로 잡는다
    const middlewares = rest.slice(0, -1).filter((a) => AUTH_HINT.test(a)).map((a) => a.split('(')[0])
    const lastArg = rest[rest.length - 1] || ''
    const idents = lastArg.match(/[A-Za-z0-9_$]+/g) || []
    const handler = idents.pop() || null
    // 핸들러가 정의된 파일을 확정해 둔다. 프로젝트 전체에 같은 함수명이 여러 개일 때
    // (boothflow 실측 60건) 이름만으로 찾으면 엉뚱한 도메인의 SQL이 붙는다.
    //   named  : import { getWebtoons } from './webtoonController.js' → imports[handler]
    //   namespace: companiesController.create                          → imports[한정자]
    const handlerFile = imports[handler] || (idents.length ? imports[idents[0]] : null) || null
    // validate(createWebtoonSchema) 처럼 라우트에 검증 스키마가 명시돼 있으면
    // 이름 추측 없이 그대로 쓴다. 요청 예시의 가장 정확한 근거다.
    const schemaRef = rest
      .map((a) => a.match(/\b(?:validate|validateBody|validation|zodValidate)\s*\(\s*([A-Za-z0-9_$]+)/)?.[1])
      .find(Boolean) || null
    endpoints.push({
      method: verb.toUpperCase(),
      path: joinPath(prefix, pathLit[1]),
      src: `${rel(root, file)}:${lineOf(code, m.index)}`,
      auth: middlewares.length ? middlewares.join(' + ') : null,
      handler,
      handlerFile,
      routeDir: path.dirname(file),
      schemaRef,
      touches: [],
      calledBy: [],
      confidence: 'high',
    })
  }

}

// SQL 문자열에서 건드리는 테이블과 연산을 뽑는다
export function tablesFromSql(text) {
  const found = new Map()
  const add = (name, op) => {
    if (!name) return
    const t = name.replace(/[`"']/g, '').toLowerCase()
    if (!/^[a-z][a-z0-9_]*$/.test(t)) return
    if (['select', 'dual', 'where', 'set', 'values'].includes(t)) return
    const prev = found.get(t) || new Set()
    prev.add(op)
    found.set(t, prev)
  }
  for (const m of text.matchAll(/\bFROM\s+([`"]?[A-Za-z0-9_]+[`"]?)/gi)) add(m[1], 'SELECT')
  for (const m of text.matchAll(/\bJOIN\s+([`"]?[A-Za-z0-9_]+[`"]?)/gi)) add(m[1], 'SELECT')
  for (const m of text.matchAll(/\bINSERT\s+INTO\s+([`"]?[A-Za-z0-9_]+[`"]?)/gi)) add(m[1], 'INSERT')
  for (const m of text.matchAll(/\bUPDATE\s+([`"]?[A-Za-z0-9_]+[`"]?)\s+SET/gi)) add(m[1], 'UPDATE')
  for (const m of text.matchAll(/\bDELETE\s+FROM\s+([`"]?[A-Za-z0-9_]+[`"]?)/gi)) add(m[1], 'DELETE')
  return [...found].map(([table, ops]) => ({ table, ops: [...ops] }))
}

// 함수명 → 후보 노드 목록. 같은 이름이 여러 파일에 있을 수 있으므로 배열로 둔다.
function buildFunctionGraph(files, root) {
  const byName = Object.create(null)
  for (const file of files) {
    const code = stripComments(read(file))
    const fns = splitFunctions(code)
    for (const [name, body] of Object.entries(fns)) {
      const calls = new Set()
      for (const m of body.matchAll(/\b([A-Za-z0-9_$]{3,})\s*\(/g)) calls.add(m[1])
      ;(byName[name] ||= []).push({
        name,
        absFile: file,
        dir: path.dirname(file),
        file: rel(root, file),
        tables: tablesFromSql(body),
        calls: [...calls],
      })
    }
  }
  return byName
}

// 같은 이름의 후보 중 하나를 고른다.
//  1) 한정자로 파일이 확정됐으면 그 파일
//  2) 후보가 원래 하나뿐이면 그것
//  3) 여럿이면 같은 도메인 폴더 안의 것만 인정. 폴더 밖이면 추측하지 않고 포기한다
//     (틀린 테이블을 붙이느니 비워 두는 게 낫다)
// 이미 지나온 노드는 제외한다. controller와 service가 같은 함수명을 쓰는 구조에서
// 체인이 한 칸씩 내려가려면 이 제외가 필요하다.
function pickNode(byName, name, wantFile, nearDir, seen) {
  const all = byName[name]
  if (!all || !all.length) return null
  const cands = all.filter((c) => !seen.has(c.absFile + '::' + name))
  if (!cands.length) return null
  if (wantFile) {
    const hit = cands.find((c) => c.absFile === wantFile)
    if (hit) return hit
  }
  if (all.length === 1) return cands[0]
  if (nearDir) {
    const same = cands.filter((c) => c.dir === nearDir)
    if (same.length === 1) return same[0]
  }
  return null
}

// 핸들러에서 시작해 호출 그래프를 타고 내려가 도달하는 모든 테이블을 모은다.
// 도메인 폴더(controller/service/repository가 한 폴더)를 따라가므로
// nearDir 을 물려주면 동명이인 함수에 잘못 붙는 것을 막을 수 있다.
function resolveTables(name, byName, opts = {}) {
  const { wantFile = null, nearDir = null, depth = 0, seen = new Set() } = opts
  if (!name || depth > 5) return []
  const node = pickNode(byName, name, wantFile, nearDir, seen)
  if (!node) return []
  seen.add(node.absFile + '::' + name)
  const out = [...node.tables]
  for (const callee of node.calls) {
    out.push(...resolveTables(callee, byName, {
      nearDir: node.dir, depth: depth + 1, seen,
    }))
  }
  return out
}

function mergeTables(list) {
  const merged = new Map()
  for (const { table, ops } of list) {
    const prev = merged.get(table) || new Set()
    ops.forEach((o) => prev.add(o))
    merged.set(table, prev)
  }
  return [...merged].map(([table, ops]) => ({ table, ops: [...ops] }))
}

export function scanBackend(backendRoot, projectRoot) {
  const endpoints = []
  const unresolved = []
  const files = walk(backendRoot)

  // 진입 순서가 결과를 바꾼다. app.js 의 `app.use('/api', routes)` 를 먼저 보지 않으면
  // routes/index.js 를 직접 들어가 `/api` 접두사가 통째로 빠진다.
  // 파일 순회 순서에 맡기지 않고 우선순위를 못박는다.
  const ENTRY_RANK = [/server\.(js|mjs|ts)$/, /app\.(js|mjs|ts)$/, /routes\/index\.(js|mjs|ts)$/, /index\.(js|mjs|ts)$/]
  const norm = (f) => f.replace(/\\/g, '/')
  const rankOf = (f) => {
    const i = ENTRY_RANK.findIndex((re) => re.test(norm(f)))
    return i === -1 ? 99 : i
  }
  const entries = files
    .filter((f) => rankOf(f) < 99 && /\/(routes|src)\//.test(norm(f)))
    // 라우터가 아닌 index.js (cron/, socket/, workers/ 등)는 제외
    .filter((f) => !/\/(cron|socket|jobs?|workers?|scripts?|migrations?)\//.test(norm(f)))
    .sort((a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b))
  const seen = new Set()
  for (const entry of entries) collectRoutes(entry, '', endpoints, unresolved, projectRoot, seen)

  const byName = buildFunctionGraph(files, projectRoot)
  for (const ep of endpoints) {
    ep.touches = mergeTables(
      resolveTables(ep.handler, byName, {
        wantFile: ep.handlerFile,
        nearDir: ep.handlerFile ? path.dirname(ep.handlerFile) : ep.routeDir,
      })
    )
    if (!ep.touches.length) ep.confidence = 'medium'
    delete ep.handlerFile
    delete ep.routeDir
  }

  // 중복 정의 제거 (같은 파일이 두 경로로 진입한 경우)
  const uniq = new Map()
  for (const ep of endpoints) uniq.set(`${ep.method} ${ep.path} ${ep.src}`, ep)

  return { endpoints: [...uniq.values()], unresolved }
}
