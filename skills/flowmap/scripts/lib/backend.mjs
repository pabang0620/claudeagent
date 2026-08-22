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
    const handler = (lastArg.match(/[A-Za-z0-9_$]+/g) || []).pop() || null
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

// 함수명 → 그 함수가 직접 만지는 테이블, 그리고 그 함수가 호출하는 다른 함수명
function buildFunctionGraph(files, root) {
  const nodes = Object.create(null)
  for (const file of files) {
    const code = stripComments(read(file))
    const fns = splitFunctions(code)
    for (const [name, body] of Object.entries(fns)) {
      const calls = new Set()
      for (const m of body.matchAll(/\b([A-Za-z0-9_$]{3,})\s*\(/g)) calls.add(m[1])
      nodes[name] = {
        name,
        file: rel(root, file),
        tables: tablesFromSql(body),
        calls: [...calls],
      }
    }
  }
  return nodes
}

// 핸들러에서 시작해 호출 그래프를 타고 내려가 도달하는 모든 테이블을 모은다
function resolveTables(handler, graph, depth = 0, seen = new Set()) {
  if (!handler || depth > 4 || seen.has(handler)) return []
  seen.add(handler)
  const node = graph[handler]
  if (!node || !Array.isArray(node.tables)) return []
  const out = [...node.tables]
  for (const callee of node.calls) {
    if (callee === handler) continue
    out.push(...resolveTables(callee, graph, depth + 1, seen))
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

  const entries = files.filter((f) =>
    /(routes\/index|app|server|index)\.(js|mjs|ts)$/.test(f.replace(/\\/g, '/')) &&
    /\/(routes|src)\//.test(f.replace(/\\/g, '/'))
  )
  const seen = new Set()
  for (const entry of entries) collectRoutes(entry, '', endpoints, unresolved, projectRoot, seen)

  const graph = buildFunctionGraph(files, projectRoot)
  for (const ep of endpoints) {
    ep.touches = mergeTables(resolveTables(ep.handler, graph))
    if (!ep.touches.length) ep.confidence = 'medium'
    delete ep.dir
  }

  // 중복 정의 제거 (같은 파일이 두 경로로 진입한 경우)
  const uniq = new Map()
  for (const ep of endpoints) uniq.set(`${ep.method} ${ep.path} ${ep.src}`, ep)

  return { endpoints: [...uniq.values()], unresolved, functionGraph: graph }
}
