// convention-enforcer ce-002: admin*Routes.js의 requireAdmin 누락 검사
// 설치: 이 파일을 대상 프로젝트 backend/scripts/verifyAdminRoutes.js 로 복사 (glob 패키지 필요)
// 사용: 부팅 시 import { verifyAdminRoutes } 후 app.listen 직전 호출, 또는 node backend/scripts/verifyAdminRoutes.js
// ESM 기준. CommonJS 프로젝트는 require(...)로 변환.

import fs from 'fs'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

export function verifyAdminRoutes() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const projectRoot = resolve(__dirname, '../..')   // scripts/ -> backend/ -> projectRoot

  // 폴더 구조 자동 감지 (평면 vs 도메인 드리븐)
  const candidatePaths = [
    resolve(projectRoot, 'backend/routes'),
    resolve(projectRoot, 'backend/src/routes'),
    resolve(projectRoot, 'backend/src/domains'),
  ]
  let files = []
  for (const cwd of candidatePaths) {
    if (!fs.existsSync(cwd)) continue
    const found = glob.sync('**/admin*Routes.js', {
      cwd,
      absolute: true,
      ignore: ['**/node_modules/**'],
    })
    if (found.length > 0) { files = found; break }
  }

  if (files.length === 0) {
    console.warn('[ce-002] admin*Routes.js 파일 없음 - 모든 candidate 경로에서 탐지 실패')
    console.warn('  검색 경로:', candidatePaths.join(', '))
  }

  const EXEMPT_PATTERNS = [
    /^adminMasterRoutes\.js$/,  // 파일 단위 예외
  ]
  const EXEMPT_ROUTES = [
    { method: 'get', paths: ['/genres', '/universities', '/skills'] },
    { method: 'get', pathRegex: /^\/universities\/:/ },
  ]

  const errors = []
  for (const file of files) {
    let code
    try {
      code = fs.readFileSync(file, 'utf-8')
    } catch (e) {
      errors.push(`${file}: 파일 읽기 실패 - ${e.message}`)
      continue
    }
    // 멀티라인 라우트 대응: 개행·공백 압축 후 검사
    const normalized = code
      .replace(/\r?\n\s*/g, ' ')
      .replace(/\s+\./g, '.')  // 체인 메서드 공백 제거: "router .post" → "router.post"
    // [\s\S]*? 사용해 멀티라인·비탐욕 매칭
    // 1) router.get/post/put/delete/patch/use 직접 호출
    const routeRegex = /router\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]+)['"`]\s*,([\s\S]*?)\)/g
    // 2) router.route('/x').post(...) 체인 메서드 - 추가 검사
    const routeChainRegex = /router\.route\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\.(get|post|put|delete|patch)\s*\(([\s\S]*?)\)/g

    const fileName = file.split('/').pop()
    const isFileExempt = EXEMPT_PATTERNS.some((re) => re.test(fileName))

    let m
    while ((m = routeRegex.exec(normalized)) !== null) {
      const [, method, route, middlewares] = m
      if (/requireAdmin|requireRole\(['"`]admin/.test(middlewares)) continue

      // 예외 체크
      const isRouteExempt = EXEMPT_ROUTES.some((ex) =>
        ex.method === method.toLowerCase() && (
          ex.paths?.includes(route) || ex.pathRegex?.test(route)
        )
      )
      if (isFileExempt && isRouteExempt) continue

      errors.push(`${file}: ${method.toUpperCase()} ${route} - requireAdmin 누락`)
    }

    // router.route() 체인 메서드 검사
    while ((m = routeChainRegex.exec(normalized)) !== null) {
      const [, route, method, middlewares] = m
      if (/requireAdmin|requireRole\(['"`]admin/.test(middlewares)) continue

      const isRouteExempt = EXEMPT_ROUTES.some((ex) =>
        ex.method === method.toLowerCase() && (
          ex.paths?.includes(route) || ex.pathRegex?.test(route)
        )
      )
      if (isFileExempt && isRouteExempt) continue

      errors.push(`${file}: ${method.toUpperCase()} ${route} - requireAdmin 누락 (route chain)`)
    }
  }

  return errors
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const errors = verifyAdminRoutes()
  if (errors.length) {
    console.error('[convention-enforcer] Admin 라우트 권한 검증 실패:')
    errors.forEach((e) => console.error('  ' + e))
    process.exit(1)
  }
}
