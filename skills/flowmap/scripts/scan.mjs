#!/usr/bin/env node
// 프로젝트를 정적 스캔해 graph.json 을 만든다. LLM 호출 없음.
// 사용법: node scan.mjs <프로젝트경로> [출력경로]
import fs from 'fs'
import path from 'path'
import { scanBackend } from './lib/backend.mjs'
import { scanFrontend, linkCalls } from './lib/frontend.mjs'
import { scanZodSchemas, scanSqlTables, buildSample } from './lib/schema.mjs'
import { clusterFlows, buildFindings } from './lib/cluster.mjs'

const root = path.resolve(process.argv[2] || process.cwd())
const outPath = path.resolve(process.argv[3] || path.join(root, 'flowmap.graph.json'))

function findPart(kind) {
  const names =
    kind === 'backend'
      ? ['backend', 'server', 'api', 'src/server']
      : ['frontend', 'client', 'web', 'app']
  for (const n of names) {
    const p = path.join(root, n)
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p
  }
  // 단일 패키지 프로젝트면 루트를 그대로 본다
  const pkgPath = path.join(root, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const deps = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).dependencies || {}
    if (kind === 'backend' && deps.express) return root
    if (kind === 'frontend' && (deps.react || deps.vue)) return root
  }
  return null
}

const backendRoot = findPart('backend')
const frontendRoot = findPart('frontend')

if (!backendRoot) {
  console.error('백엔드 디렉토리를 찾지 못했습니다. Express 프로젝트가 맞는지 확인하세요.')
  process.exit(1)
}

const { endpoints, unresolved } = scanBackend(backendRoot, root)
endpoints.forEach((ep, i) => { ep.id = `ep_${i + 1}` })

const { calls, pages } = frontendRoot
  ? scanFrontend(frontendRoot, root)
  : { calls: [], pages: [] }
const orphanCalls = linkCalls(endpoints, calls)

const zod = scanZodSchemas(backendRoot)
const tableSchemas = scanSqlTables(root)

// 엔드포인트별 요청/응답 예시를 만든다. 출처를 함께 남겨 어디까지 믿을지 알 수 있게 한다.
for (const ep of endpoints) {
  const zodName =
    (ep.schemaRef && zod[ep.schemaRef] ? ep.schemaRef : null) ||
    Object.keys(zod).find((n) => {
      const stem = (ep.handler || '').replace(/^(create|update|get|delete|patch|post|put)/i, '')
      return stem && n.toLowerCase().includes(stem.toLowerCase())
    })
  if (zodName && ep.method !== 'GET') {
    ep.request = { from: `Zod 스키마 (${zodName})`, sample: buildSample(zod[zodName]) }
  } else if (ep.method !== 'GET') {
    ep.request = { from: '미확인', sample: null }
  } else {
    ep.request = null
  }

  const primary = ep.touches.find((t) => t.ops.includes('SELECT')) || ep.touches[0]
  const cols = primary && tableSchemas[primary.table]
  if (cols) {
    const types = Object.fromEntries(cols.map((c) => [c.name, c.type]))
    // 응답에 실릴 리 없는 자격증명·소프트삭제 내부 컬럼은 예시에서 뺀다.
    // 넣으면 "이 API가 이걸 반환한다"는 잘못된 인상을 준다.
    const visible = cols
      .map((c) => c.name)
      .filter((n) => !/password|passwd|secret|salt|_hash$|refresh_token|deleted_at/i.test(n))
    const row = buildSample(visible.slice(0, 14), types)
    ep.response = {
      from: `SQL 컬럼 (${primary.table})`,
      sample: { success: true, data: ep.path.includes(':') ? row : [row] },
    }
  } else {
    ep.response = { from: '미확인', sample: null }
  }
}

const flows = clusterFlows(endpoints, pages)
const findings = buildFindings(endpoints, flows, tableSchemas)

for (const c of orphanCalls) {
  unresolved.push({ reason: `프론트 호출과 짝이 되는 백엔드 정의 없음: ${c.method} ${c.path}`, src: c.src })
}

const graph = {
  project: {
    name: path.basename(root),
    root,
    backend: path.relative(root, backendRoot) || '.',
    frontend: frontendRoot ? path.relative(root, frontendRoot) : null,
    scannedAt: new Date().toISOString().slice(0, 10),
  },
  flows,
  endpoints,
  pages,
  tables: Object.entries(tableSchemas).map(([name, columns]) => ({ name, columns })),
  findings,
  unresolved,
}

fs.writeFileSync(outPath, JSON.stringify(graph, null, 2))

console.log(JSON.stringify({
  out: outPath,
  flows: flows.length,
  endpoints: endpoints.length,
  pages: pages.length,
  tables: Object.keys(tableSchemas).length,
  unresolved: unresolved.length,
  topFlows: flows.slice(0, 8).map((f) => `${f.label}(${f.endpointIds.length})`),
  findings: {
    orphan: findings.orphan.length,
    noAuth: findings.noAuth.length,
    duplicate: findings.duplicate.length,
    unusedTables: findings.unusedTables.length,
  },
}, null, 2))
