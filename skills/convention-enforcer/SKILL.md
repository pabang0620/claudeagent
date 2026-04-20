---
name: convention-enforcer
description: React + Express 프로젝트의 네이밍·라우팅·권한·상태관리·파일구조 컨벤션을 파일 저장 시점·pre-commit·부팅 시점에 강제하는 정적 검사 스킬. 라우팅 상수(ROUTES) 강제, admin 라우트 requireAdmin 강제, Zustand 셀렉터 단일 필드 구독, useParams 네이밍 일치, 파일명 prefix 규칙, 경로 문자열 리터럴 금지. WeCom 회고 근거 — admin 권한 누락 7+회, 경로 리터럴 10+회, Zustand 무한 렌더, useParams 불일치 등 50+건 fix 반복 차단.
---

# convention-enforcer

> WeCom 회고 근거: `895043a` (admin 5개 라우트 `requireAdmin` 누락 일괄 수정), `cb917df`·`7e26d6c` (경로 리터럴 10+회), `e95ea5b` (Zustand 무한 렌더), `c6d79e7` (useParams 이름 불일치). 전부 **컨벤션 강제만으로 0건 예방** 가능했음.

## 적용 트리거

1. **자동** — `.jsx/.tsx/.js/.ts` 저장 직후 (파일 경로와 내용 기준으로 룰 적용)
2. **pre-commit** — `git commit` 직전 staged 파일 검사, 위반 시 커밋 거부
3. **서버 부팅** — Express 앱 부팅 시 `admin*Routes.js` 파일 정적 검증. `requireAdmin` 누락 시 `process.exit(1)`
4. **수동** — `/convention-check <경로>` 또는 "컨벤션 검사해줘"

## 레드 라인 (절대 금지)

| # | 룰 | 심각도 | 근거 |
|---|---|---|---|
| RL-1 | `admin*Routes.js` 에 `requireAdmin` 미사용 | error (부팅 실패) | `895043a` 5개 라우트 일괄 |
| RL-2 | `navigate('/...')` 또는 `<Link to="/...">` 에 문자열 리터럴 | error | `cb917df` 10+회 |
| RL-3 | `useStore((s) => s)` 또는 `useStore()` 전체 객체 구독 | error | `e95ea5b` 무한 렌더 |
| RL-4 | `useParams()` 변수명이 라우트 정의와 불일치 | error | `c6d79e7` |
| RL-5 | 컴포넌트 파일 `.jsx/.tsx` 가 PascalCase 아님 | warn | 일반 컨벤션 |
| RL-6 | 훅 파일명이 `use` 로 시작하지 않음 | warn | 일반 컨벤션 |
| RL-7 | `pages/mobile/*` 복제 파일 | error | mobile-first-checker mf-000 중복 감지 |

---

## 체크리스트 룰

### ce-001 — 라우팅 상수 ROUTES 강제 (error, autofix: hint)

**match**: `.jsx/.tsx/.js/.ts` 파일 내 다음 패턴
- `navigate('/...')`, `navigate("/...")`, `navigate(` + 백틱 템플릿 리터럴
- `<Link to="/..." />`, `<Link to={'/...'}>`
- `<Navigate to="/..." />`
- `href="/..."`, `href={'/...'}`
- `useNavigate()(...)` 에 리터럴

**antipattern**:
```jsx
navigate('/webtoon/' + uuid)
navigate(`/m/university/${id}`)
<Link to="/notifications">알림</Link>
<Navigate to="/login" replace />
```

**correct**:
```jsx
import { ROUTES } from '@/constants/routes'

navigate(ROUTES.WEBTOON_DETAIL(uuid))
navigate(ROUTES.M_UNIVERSITY_DETAIL(id))
<Link to={ROUTES.NOTIFICATIONS}>알림</Link>
<Navigate to={ROUTES.LOGIN} replace />
```

**constants/routes.js 구조 (없으면 생성 제안)**:
```javascript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  NOTIFICATIONS: '/notifications',

  WEBTOON_LIST: '/webtoon',
  WEBTOON_DETAIL: (id) => `/webtoon/${id}`,

  // 모바일 접두사 M_
  M_HOME: '/m',
  M_WEBTOON_DETAIL: (id) => `/m/webtoon/${id}`,
  M_UNIVERSITY_DETAIL: (id) => `/m/university/${id}`,

  // 관리자
  ADMIN_DASHBOARD: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_USERS: '/admin/users',
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_NOTICES: '/admin/notices',
  ADMIN_EVENTS: '/admin/events',
}
```

**예외**: 외부 URL (`http://`, `https://`, `mailto:`, `tel:`), 동일 파일 내 앵커 (`#section`)

---

### ce-002 — Admin 라우트 requireAdmin 강제 (error, 부팅 실패)

**match**: 파일명 `admin*Routes.js` 또는 `admin*Controller.js` (대소문자 무관)

**검사 방법**:
```javascript
// backend/scripts/verifyAdminRoutes.js
// ESM 프로젝트 기준. CommonJS 프로젝트는 require(...)로 변환 필요.

import fs from 'fs'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '../..')   // scripts/ → backend/ → projectRoot

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
  console.warn('[ce-002] admin*Routes.js 파일 없음 — 모든 candidate 경로에서 탐지 실패')
  console.warn('  검색 경로:', candidatePaths.join(', '))
  process.exit(0)
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
    errors.push(`${file}: 파일 읽기 실패 — ${e.message}`)
    continue
  }
  // 멀티라인 라우트 대응: 개행·공백 압축 후 검사
  const normalized = code
    .replace(/\r?\n\s*/g, ' ')
    .replace(/\s+\./g, '.')  // 체인 메서드 공백 제거: "router .post" → "router.post"
  // [\s\S]*? 사용해 멀티라인·비탐욕 매칭
  // 1) router.get/post/put/delete/patch/use 직접 호출
  const routeRegex = /router\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]+)['"`]\s*,([\s\S]*?)\)/g
  // 2) router.route('/x').post(...) 체인 메서드 — 추가 검사
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

    errors.push(`${file}: ${method.toUpperCase()} ${route} — requireAdmin 누락`)
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

    errors.push(`${file}: ${method.toUpperCase()} ${route} — requireAdmin 누락 (route chain)`)
  }
}

if (errors.length) {
  console.error('[convention-enforcer] Admin 라우트 권한 검증 실패:')
  errors.forEach((e) => console.error('  ' + e))
  process.exit(1)
}
```

**검사 한계 (명시)**:
- 배열 형태 미들웨어(`router.post('/x', [auth, requireAdmin], fn)`)는 정규식에 잡히지만 JSON.stringify 유사 패턴은 false negative 가능성 존재
- `app.use(router)` 전체 체인에 requireAdmin 적용한 경우는 감지 못함 → 이 경우 Claude 수동 확인 권장
- Controller 파일(`admin*Controller.js`) 내부 permission 체크는 검사 범위 외 (Routes에서 먼저 차단하는 것이 정석)

**예외 (통과)**:
- `adminMasterRoutes.js` 의 GET 라우트 중 다음 경로는 requireAdmin 면제 (비로그인 드롭다운 조회용):
  - `GET /genres`
  - `GET /universities`, `GET /universities/:universityId`
  - `GET /skills`
- 일반화: GET 메서드 + 경로가 마스터데이터(genre/university/skill/tag 등) 이며 쓰기 작업이 없는 경우는 허용

**antipattern**:
```javascript
// backend/routes/adminNoticeRoutes.js
router.post('/notices', authMiddleware, adminNoticeController.create)  // requireAdmin 누락!
router.delete('/notices/:id', authMiddleware, adminNoticeController.delete)  // 마찬가지
```

**correct**:
```javascript
// authMiddleware + requireAdmin 2층 구조 강제
router.post('/notices', authMiddleware, requireAdmin, adminNoticeController.create)
router.delete('/notices/:id', authMiddleware, requireAdmin, adminNoticeController.delete)
```

**부팅 통합**: `backend/app.js` 또는 `server.js` 의 app.listen() 호출 직전에 `verifyAdminRoutes()` 호출 필수.

**왜 부팅 시점인가**: ESLint 룰이 감지해도 개발자가 무시할 수 있음. 부팅 실패로 강제하면 배포 전 발견 100% 보장.

---

### ce-003 — Zustand 셀렉터 단일 필드 구독 (error, autofix: hint)

**match**: Zustand `useStore` 호출 (프로젝트에 Zustand 설치된 경우)
- `useXxxStore()` 전체 객체 반환
- `useXxxStore((s) => s)` 전체 구독
- `useXxxStore((s) => ({ ...s }))` 구조분해 + 재객체화

**antipattern**:
```jsx
const state = useUserStore()             // 전체 구독, 모든 state 변경에 리렌더
const all = useUserStore((s) => s)       // 동일 문제
const { user, logout } = useUserStore((s) => ({ user: s.user, logout: s.logout }))
// ↑ shallow 비교 없이 새 객체 반환 → 매 렌더마다 다른 참조 → 무한 렌더 위험
```

**correct**:
```jsx
// 개별 셀렉터 — 각 필드마다 단일 useStore 호출
const user = useUserStore((s) => s.user)
const logout = useUserStore((s) => s.logout)

// 또는 shallow 비교 명시
import { useShallow } from 'zustand/react/shallow'
const { user, logout } = useUserStore(useShallow((s) => ({ user: s.user, logout: s.logout })))

// 액션 포함 케이스 (clearUser 같은 함수 + 상태 혼용)
const clearUser = useAuthStore((s) => s.clearUser)
const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

// 또는 액션만 묶을 경우 useShallow 허용
import { useShallow } from 'zustand/react/shallow'
const { clearUser, initAuth } = useAuthStore(
  useShallow((s) => ({ clearUser: s.clearUser, initAuth: s.initAuth }))
)
```

**감지 알고리즘**:
1. `use[A-Z][a-zA-Z]*Store\(\s*\)` (인자 없음) → error
2. `use[A-Z][a-zA-Z]*Store\(\s*\(.*?\)\s*=>\s*s\s*\)` (전체 반환) → error
3. `use[A-Z][a-zA-Z]*Store\(\s*\(.*?\)\s*=>\s*\(?\s*\{` (객체 반환 패턴) → useShallow import 확인
   - import 없음 → error (무한 렌더 위험)
   - import 있음 + `useShallow(` 로 감싼 패턴 → pass

**근거**: `e95ea5b` "Zustand 전체 구독으로 무한 렌더 → 브라우저 freeze"

---

### ce-004 — useParams 변수명과 라우트 정의 일치 (error)

**match**: `useParams()` 호출이 있는 파일

**antipattern**:
```jsx
// 라우트 정의: /webtoon/:webtoonId
const { id } = useParams()  // 라우트는 webtoonId인데 id로 받음 → undefined
```

**correct**:
```jsx
// 라우트 정의: /webtoon/:webtoonId
const { webtoonId } = useParams()  // 이름 일치
```

**검사 방법**:
1. 해당 컴포넌트를 참조하는 라우트 정의 파일(`App.jsx`, `router.jsx`, `routes/*.jsx`) Grep으로 탐색
2. `<Route path="/path/:paramName" element={<TargetComponent`} 패턴에서 `:paramName` 추출
3. TargetComponent 파일에서 `useParams()` 구조분해 키 이름과 비교

**검사 한계 (명시)**:
- 동적 import / lazy loading / 중첩 라우터(nested `<Routes>`)는 정적 분석 불가 → 수동 확인 권장
- 라우트 파일이 여러 개로 분산된 경우(예: adminRoutes.jsx + userRoutes.jsx) 교차 탐색 필요
- 이 룰은 AST 파서 없이는 100% 자동화 불가. Claude가 "확신 못할 경우 수동 확인 필요" 를 출력해야 함
- autofix: 수동 (hint만 제공, 파일 자동 수정 금지)

**근거**: `c6d79e7` useParams 이름 불일치로 undefined, 상세 페이지 공백 렌더

---

### ce-005 — 컴포넌트 파일 PascalCase (warn, autofix: hint)

**match**: `.jsx/.tsx` 파일명
**antipattern**: `homePage.jsx`, `user_profile.jsx`, `my-page.jsx`, `mypage.jsx`
**correct**: `HomePage.jsx`, `UserProfile.jsx`, `MyPage.jsx`
**예외**: `index.jsx`, `_app.jsx`, `_document.jsx` (프레임워크 예약)

---

### ce-006 — 훅 파일 use 접두사 (warn, autofix: hint)

**match**: `hooks/*.js`, `hooks/*.ts`
**antipattern**: `hooks/userFetch.js`, `hooks/counter.js`
**correct**: `hooks/useUserFetch.js`, `hooks/useCounter.js`
**예외**: `hooks/index.js` (barrel export)

---

### ce-007 — 파일 크기 제한 (warn, autofix: no)

**룰**:
- 함수 50줄 초과: warn
- 파일 800줄 초과: warn
- 파일 1500줄 초과: error

**근거**: CLAUDE.md 코딩 스타일. WeCom에서 `HomePage.jsx` 가 2000+ 줄로 비대해져 81회 재수정 발생.

**조치**: 800줄 초과 시 "분리 권장" 메시지 + 분리 후보 (하위 컴포넌트/섹션 단위) 자동 제안.

---

### ce-008 — 폴더 구조 일관성 (warn)

**프로젝트 표준 구조** (감지 후 일관성 강제):
```
src/
├── components/
│   └── common/        # 공용 컴포넌트
│   └── {domain}/      # 도메인별 컴포넌트
├── pages/             # 라우트 단위 페이지 (PC/모바일 단일 파일)
├── hooks/             # use* 훅
├── store/             # Zustand 등 상태관리
├── api/               # 백엔드 API 클라이언트
├── utils/             # 순수 함수 유틸
├── constants/         # routes.js, enums.js 등
├── styles/            # tokens.css, reset.css
└── mocks/             # MSW 핸들러 (있을 경우)
```

**위반 예시**: `pages/mobile/`, `helpers/` (utils와 중복), `services/` (api와 중복)

---

### ce-009 — admin 접두사 테이블명·라우트명 일관성 (warn)

**프로젝트**: 백엔드 Express 또는 DB 파일

**룰**:
- DB 테이블 `admin_*` 접두사 → 백엔드 라우트 `/admin/*` 매칭
- Controller/Service 파일명 `admin*Controller.js`, `admin*Service.js` 일관

**근거**: WeCom CLAUDE.md 명시된 관리자 테이블 네이밍 컨벤션. 위반 시 회고 `#5 필드명 미스매치`와 유사한 혼란 유발.

---

### ce-010 — ENV 필수 변수 정적 검증 (error, 부팅 시)

**match**: 서버 진입점 (`backend/app.js`, `backend/server.js`)

**룰**: `process.env.XXX` 참조가 있는 모든 변수를 `.env.example` 과 비교. `.env.example` 에 없는 변수를 코드에서 읽으면 error.

**correct 패턴**:
```javascript
// backend/config/env.js
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)
// 부팅 시점에 유효성 검증 → 실패 시 process.exit
```

**근거**: `.env.example` 부재로 인한 DB명/CORS/mysql2 옵션 10+회 반복 수정.

---

### ce-011 — POST 응답에 AutoIncrement id 직접 노출 금지 (warn, autofix: hint)

**match**: 백엔드 컨트롤러 파일에서 `res.json` 또는 `successResponse` 호출에 `insertId`, `result.id`, `row.id` (내부 AUTO_INCREMENT) 노출
**antipattern**:
```javascript
const result = await repo.insert(data)
return res.json({ success: true, data: { id: result.insertId } })  // 내부 INT 노출
```
**correct**:
```javascript
const uuid = await repo.insert(data)      // Repository는 UUID 반환
const row = await repo.findById(uuid)     // 전체 재조회
return res.json({ success: true, data: row })   // 전체 리소스
```
**근거**: WeCom 이중 ID 컨벤션 — 외부 식별자는 UUID(`{table}_id`), AUTO_INCREMENT id 는 내부 전용. API 응답에 AUTO_INCREMENT id 노출 시 순차 스캐닝 공격·DB 구조 추측 가능.

---

## 실행 프로토콜

### Phase 0: 사전 확인
1. `.husky/pre-commit` 파일 존재 여부 확인
   - 없음: "husky pre-commit 미설치 — project-bootstrapper 에이전트 호출 권장" warn
2. `backend/scripts/verifyAdminRoutes.js` 존재 확인
   - 없음: "ce-002 부팅 검증 스크립트 미설치 — project-bootstrapper 에이전트에 생성 요청" error
3. 실제 `admin*Routes.js` 파일을 대상으로 한 번 시뮬레이션 실행 후 결과 보고

### 스킬이 호출될 때

1. **변경 파일 수집**:
   - 자동 트리거: 저장된 파일
   - pre-commit: `git diff --cached --name-only`
   - 수동: 사용자 지정 경로

2. **파일별 룰 매핑**:
   - `admin*Routes.js` → ce-002 (부팅 수준)
   - `.jsx/.tsx` → ce-001, ce-003, ce-004, ce-005, ce-007
   - `hooks/*.js` → ce-006
   - `.js/.ts` 전반 → ce-001 (네비게이션 패턴)

3. **룰 적용 순서**: 심각도 error 먼저 → warn 나중

4. **결과 취합**:
   ```
   ✗ src/pages/HomePage.jsx:42  ce-001 error  navigate('/webtoon/' + id) → ROUTES.WEBTOON_DETAIL(id)
   ✗ src/store/userStore.js:18  ce-003 error  useUserStore((s) => s) 전체 구독 → 개별 셀렉터로 분리
   ✓ backend/routes/userRoutes.js (ce-002 해당 없음)
   ```

5. **요약**:
   ```
   총 N개 파일 검사 / error X건 / warn Y건
   ```

### pre-commit 훅 통합

**`.husky/pre-commit` (실제 동작 스크립트)**:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# ce-002: Admin 라우트 권한 검증
node backend/scripts/verifyAdminRoutes.js || exit 1

# ce-001: staged JSX/TSX 파일에서 경로 리터럴 탐지
STAGED=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(jsx|tsx|js|ts)$' || true)
if [ -n "$STAGED" ]; then
  VIOLATION=0
  for f in $STAGED; do
    if grep -nE "(navigate\s*\(|<Link[^>]+to=|<Navigate[^>]+to=|href=)\{?[\"'\`][/]" "$f" 2>/dev/null \
       | grep -vE "(http|https|mailto|tel|^[[:space:]]*//)"; then
      echo "[ce-001] $f: 경로 리터럴 감지 — ROUTES 상수 사용"
      VIOLATION=1
    fi
    # ce-003: Zustand 전체 구독 (macOS BSD grep 호환 POSIX 문자 클래스)
    if grep -nE "use[A-Z][a-zA-Z]*Store[[:space:]]*\([[:space:]]*\)|use[A-Z][a-zA-Z]*Store[[:space:]]*\([[:space:]]*\([a-z]\)[[:space:]]*=>[[:space:]]*[a-z][[:space:]]*\)" "$f" 2>/dev/null; then
      echo "[ce-003] $f: Zustand 전체 구독 감지 — 개별 셀렉터 사용"
      VIOLATION=1
    fi
  done
  [ $VIOLATION -eq 1 ] && exit 1
fi
```

### 서버 부팅 훅

**`backend/app.js` 또는 `backend/server.js`**:
```javascript
import { verifyAdminRoutes } from './scripts/verifyAdminRoutes.js'
import { env } from './config/env.js'   // zod 파싱 실패 시 여기서 종료

verifyAdminRoutes()   // ce-002 실패 시 process.exit(1)

app.listen(env.PORT)
```

---

## 충돌 회피 (다른 스킬과의 경계)

- **mobile-first-checker (mf-000)** — 모바일 복제 파일 감지. convention-enforcer ce-008 폴더 구조와 중복이나 심각도가 다름: mf-000 error, ce-008 warn.
- **ui-design-system** — 디자인 토큰/컴포넌트 생성 담당. convention-enforcer는 네이밍/권한/라우팅만. CSS 값 규칙은 ui-design-system 의 stylelint가 담당.
- **database-reviewer** — DB 스키마·쿼리. convention-enforcer는 admin 테이블 접두사 일관성만 체크 (ce-009).
- **security-reviewer** — 권한·취약점 전반. convention-enforcer 는 `requireAdmin` 미사용만 한정 (ce-002).

---

## ESLint 커스텀 플러그인 매핑 (선택적 CI/CD 통합)

grep 기반 대신 ESLint 네이티브 룰로 통합하려면 다음 매핑 사용:

```javascript
// .eslintrc.js 또는 eslint.config.js
{
  rules: {
    'no-restricted-syntax': [
      'error',
      // ce-001: navigate 리터럴 경로
      {
        selector: "CallExpression[callee.name='navigate'] > Literal[value=/^\\//]",
        message: '[ce-001] 경로 리터럴 금지 — ROUTES 상수 사용'
      },
      // ce-003: Zustand 전체 구독 (인자 없음)
      {
        selector: "CallExpression[callee.type='Identifier'][callee.name=/^use[A-Z].*Store$/]:not(:has(ArrowFunctionExpression))",
        message: '[ce-003] Zustand 전체 구독 금지 — 개별 셀렉터 사용'
      },
      // ce-003: Zustand selector 가 s => s 패턴
      {
        selector: "CallExpression[callee.name=/^use[A-Z].*Store$/] > ArrowFunctionExpression[body.type='Identifier']",
        message: '[ce-003] Zustand selector 전체 반환 금지 — 개별 필드 분리'
      },
    ]
  }
}
```

ce-002 (admin 권한) 와 ce-004 (useParams) 는 AST 만으로 검증 불가 → grep/awk 스크립트 유지.

---

## 자기검증 시나리오

1. **기본**: 신입이 `backend/routes/adminBannerRoutes.js` 에 `requireAdmin` 없이 POST 추가 + 서버 부팅
   → 부팅 실패 (`ce-002`) + 명확한 메시지 "POST /banners — requireAdmin 누락"

2. **엣지**: 숙련자가 `useParams()` 에서 `{ id }` 로 받았는데 라우트는 `/university/:universityId`
   → `ce-004` error + autofix 힌트 `{ universityId }`

3. **복합**: 한 파일에 `navigate('/admin/login')` + `useUserStore()` 전체 구독 + 파일명 `myPage.jsx`
   → `ce-001` error, `ce-003` error, `ce-005` warn (3건 동시 감지)

---

## 이 스킬이 하지 않는 것

- 동작 버그 감지 (stale closure, race condition) — `error-prevention-rules` 담당
- SQL/API 계약 검증 — `api-contract-designer`, `database-reviewer` 담당
- CSS 토큰 강제 — `ui-design-system` stylelint 담당
- 타입 검증 — TypeScript 컴파일러 위임

## 성공 지표

- **admin 권한 누락 fix**: WeCom 7+건 → 0건 (부팅 실패로 강제)
- **경로 리터럴**: 10+건 → 0건 (pre-commit 차단)
- **Zustand 무한 렌더**: 5+건 → 0건
- **useParams 불일치**: 3건 → 0건
- **pre-commit 차단율**: 컨벤션 위반 커밋 100% 차단

## 참고 커밋 (WeCom 회고)
`895043a` · `cb917df` · `7e26d6c` · `e95ea5b` · `c6d79e7` · `1275e75` `8dbd501` `aaaf771` (env 미검증)
