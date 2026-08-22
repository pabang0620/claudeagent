import path from 'path'
import { walk, read, stripComments, lineOf, normalizePath, rel } from './util.mjs'

const VERBS = ['get', 'post', 'put', 'patch', 'delete']

// pages/job/jobApi.js → "job",  pages/auth/login/loginApi.js → "auth/login"
function pageOf(file, frontendRoot) {
  const relPath = path.relative(frontendRoot, file).split(path.sep).join('/')
  const m = relPath.match(/(?:^|\/)(?:pages|views|screens|routes)\/(.+)$/)
  if (!m) return null
  const parts = m[1].split('/')
  parts.pop() // 파일명 제거
  return parts.length ? parts.join('/') : null
}

export function scanFrontend(frontendRoot, projectRoot) {
  const calls = []
  const pages = new Map()

  for (const file of walk(frontendRoot)) {
    const code = stripComments(read(file))
    if (!/apiClient|axios|fetch\s*\(/.test(code)) continue
    const page = pageOf(file, frontendRoot)
    const relFile = rel(projectRoot, file)

    // apiClient.get('/jobs'), api.post(`/orders/${id}`), axios.put('/x')
    const clientRe = new RegExp(
      `(?:apiClient|api|axios|http|instance)\\.(${VERBS.join('|')})\\(\\s*['\`]([^'\`]+)['\`]`,
      'g'
    )
    let m
    while ((m = clientRe.exec(code))) {
      calls.push({
        method: m[1].toUpperCase(),
        path: normalizePath(m[2]),
        page,
        src: `${relFile}:${lineOf(code, m.index)}`,
      })
    }

    // fetch('/api/orders', { method: 'POST' })
    const fetchRe = /fetch\(\s*['`]([^'`]+)['`]\s*(?:,\s*\{([^}]*)\})?/g
    while ((m = fetchRe.exec(code))) {
      const methodMatch = (m[2] || '').match(/method\s*:\s*['"]([A-Za-z]+)['"]/)
      calls.push({
        method: (methodMatch ? methodMatch[1] : 'GET').toUpperCase(),
        path: normalizePath(m[1]),
        page,
        src: `${relFile}:${lineOf(code, m.index)}`,
      })
    }

    if (page && !pages.has(page)) {
      pages.set(page, { id: `page_${page.replace(/[^A-Za-z0-9]/g, '_')}`, label: page, files: [] })
    }
    if (page) pages.get(page).files.push(relFile)
  }

  return { calls, pages: [...pages.values()] }
}

// 프론트 호출 경로와 백엔드 정의 경로를 맞춘다.
// 프론트는 baseURL '/api' 를 쓰므로 접두사가 붙거나 빠질 수 있어 양쪽 다 시도한다.
export function linkCalls(endpoints, calls) {
  const index = new Map()
  for (const ep of endpoints) {
    const key = `${ep.method} ${normalizePath(ep.path)}`
    if (!index.has(key)) index.set(key, [])
    index.get(key).push(ep)
  }

  const orphanCalls = []
  for (const call of calls) {
    const variants = [
      call.path,
      call.path.replace(/^\/api/, ''),
      `/api${call.path}`,
    ].map((p) => normalizePath(p))

    let matched = null
    for (const v of variants) {
      const hit = index.get(`${call.method} ${v}`)
      if (hit && hit.length) { matched = hit; break }
    }
    if (!matched) { orphanCalls.push(call); continue }
    for (const ep of matched) {
      if (call.page && !ep.calledBy.includes(call.page)) ep.calledBy.push(call.page)
    }
  }
  return orphanCalls
}
