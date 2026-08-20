# api-contract-designer: BOOTSTRAP 모드

> `.claude/agents/api-contract-designer.md` 의 모드 파일. 계약 인프라를 1회 생성할 때만 읽는다.

## BOOTSTRAP 모드 - 계약 인프라 1회 생성

신규 프로젝트 또는 `shared/schemas/` 가 없으면 먼저 인프라 생성.

### 1. `shared/constants/enums.ts`
```typescript
/**
 * DB ENUM SSOT - DB 스키마와 동일한 값. Zod/TS/프론트에서 참조.
 */
export const USER_STATUS = ['active', 'suspended', 'deleted'] as const
export type UserStatus = typeof USER_STATUS[number]

export const WEBTOON_STATUS = ['draft', 'scheduled', 'published', 'deleted'] as const
export type WebtoonStatus = typeof WEBTOON_STATUS[number]

// ... 도메인별 ENUM 추가
```

### 2. `backend/utils/response.js`
```javascript
/**
 * 응답 포맷 통일. 모든 엔드포인트는 이 함수로만 응답.
 * ⚠️ 이 스캐폴드는 응답 유틸이 아예 없는 "신규 프로젝트" 전용 기본값이다
 *    (원칙 #2-③, wecom·modadam 2개 프로젝트에서 실증된 shape).
 *    기존 프로젝트라면 이 파일을 새로 만들지 말고 Phase 0에서 찾은
 *    실제 response.js/httpResponse.ts 의 shape을 그대로 따를 것.
 */
export const ok = (res, data, meta) => res.status(200).json({ success: true, message: '성공', data, ...(meta ? { meta } : {}) })
export const created = (res, data) => res.status(201).json({ success: true, message: '생성되었습니다', data })
export const noContent = (res) => res.status(204).end()

export const badRequest = (res, message, errors) => res.status(400).json({ success: false, message, ...(errors ? { errors } : {}) })
export const unauthorized = (res, message = '로그인이 필요합니다') => res.status(401).json({ success: false, message })
export const forbidden = (res, message = '권한이 없습니다') => res.status(403).json({ success: false, message })
export const notFound = (res, message = '리소스를 찾을 수 없습니다') => res.status(404).json({ success: false, message })
export const serverError = (res, message = '서버 오류가 발생했습니다') => {
  // 프로젝트에 logger(winston/pino)가 있으면 console.error 대신 logger.error 사용
  console.error('[serverError]', message)
  return res.status(500).json({ success: false, message })
}
```

### 3. `backend/middleware/validate.js`
```javascript
/**
 * Zod 스키마 기반 요청 검증. 실패 시 400 + 에러 메시지.
 */
import { z } from 'zod'
import { badRequest } from '../utils/response.js'

export const validate = ({ body, query, params }) => (req, res, next) => {
  try {
    if (body) req.body = body.parse(req.body)
    if (query) req.query = query.parse(req.query)
    if (params) req.params = params.parse(req.params)
    next()
  } catch (e) {
    if (e instanceof z.ZodError) {
      const msg = (e.issues ?? e.errors).map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return badRequest(res, msg)
    }
    next(e)
  }
}
```

### 4. `backend/middleware/auth.js`
```javascript
// ⚠️ req.user 구조는 프로젝트의 JWT 페이로드에 따라 다름
// Phase 0 에서 감지된 필드(user_type, is_admin 등)에 맞춰 수정할 것
// WeCom 예: req.user.user_type === 'admin' && req.user.is_admin === true
/**
 * 2층 권한 구조:
 * - authMiddleware: 세션/토큰 확인 → req.user 주입
 * - requireAdmin: req.user.role === 'admin' 확인
 * - verifyOwnership(getOwnerId): 리소스 소유자 확인
 */
import { unauthorized, forbidden } from '../utils/response.js'

import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'   // zod 파싱된 env (BOOTSTRAP에서 생성)

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return unauthorized(res)
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return unauthorized(res, '유효하지 않은 토큰')
  }
}

export const requireAdmin = (req, res, next) => {
  // Phase 0 자동 전환 규칙:
  // $USER_FIELDS에 'user_type' 또는 'is_admin' 감지 → 주석 제거하고 패턴 B 활성화
  // $USER_FIELDS에 'role'만 감지 → 기본 패턴 A (현재 활성) 유지
  // 두 가지 모두 없으면 → 패턴 A 유지 후 사용자에게 req.user 구조 확인 요청
  //
  // 패턴 A: role 필드 단일 (신규 프로젝트 권장)
  // if (req.user?.role !== 'admin') return forbidden(res, '관리자 권한 필요')
  //
  // 패턴 B: user_type + is_admin 이중 검증 (WeCom 같은 기존 프로젝트)
  // if (req.user?.user_type !== 'admin' || !req.user?.is_admin) return forbidden(res, '관리자 권한 필요')
  //
  // Phase 0 감지 결과로 한 가지만 선택해서 적용할 것
  if (req.user?.role !== 'admin') return forbidden(res, '관리자 권한 필요')
  next()
}

export const verifyOwnership = (getOwnerId) => async (req, res, next) => {
  const ownerId = await getOwnerId(req)
  if (ownerId !== req.user?.id) return forbidden(res, '본인 리소스만 접근 가능')
  next()
}
```

### 5. `backend/middleware/uploadErrorHandler.js`
```javascript
/**
 * multer 에러를 모두 400으로 정규화. 500 누출 방지.
 */
import multer from 'multer'
import { badRequest } from '../utils/response.js'

export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: '파일 크기 초과',
      LIMIT_UNEXPECTED_FILE: '예상치 못한 파일 필드',
      LIMIT_FILE_COUNT: '파일 개수 초과',
    }
    return badRequest(res, messages[err.code] || err.message)
  }
  if (err && /Only image/.test(err.message)) {
    return badRequest(res, err.message)
  }
  next(err)
}
```

### 6. `frontend/src/api/client.js`
```javascript
/**
 * axios 인스턴스. 응답 포맷 자동 언래핑.
 * ⚠️ 에러 필드명은 프로젝트마다 다름(message vs error) - Phase 0에서
 *    backend/src/utils/response.js 를 직접 읽어 실제 필드명을 확인하고
 *    아래 message/error 우선순위를 그 프로젝트 실측값으로 맞출 것.
 * Content-Type 자동 설정 금지 - uploadClient 사용.
 */
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (res) => {
    // message 우선, 없으면 error로 폴백 - 필드명은 프로젝트 response.js 실측값을 따를 것
    if (res.data?.success === false) throw new Error(res.data.message ?? res.data.error)
    return res.data?.data ?? res.data
  },
  (err) => {
    const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message
    return Promise.reject(new Error(msg))
  }
)
```

### 7. `frontend/src/api/uploadClient.js`
```javascript
/**
 * FormData 업로드 전용 클라이언트.
 * - Content-Type 명시 금지 (브라우저가 boundary 자동 설정)
 * - apiClient의 JSON Content-Type 인터셉터 우회
 */
import axios from 'axios'

export const uploadClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// ⚠️ Content-Type 헤더 설정 금지. 자동 삭제 인터셉터.
uploadClient.interceptors.request.use((config) => {
  delete config.headers['Content-Type']   // boundary 자동 생성 위해 제거
  return config
})

uploadClient.interceptors.response.use(
  (res) => res.data?.data ?? res.data,
  (err) => {
    // message 우선, 없으면 error로 폴백 - 필드명은 프로젝트 response.js 실측값을 따를 것 (apiClient와 동일 원칙)
    const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message
    return Promise.reject(new Error(msg))
  }
)

export const uploadFile = (path, file, extraFields = {}) => {
  const fd = new FormData()
  fd.append('file', file)
  Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v))
  return uploadClient.post(path, fd)
}
```

### 8. `frontend/src/mocks/handlers.js` (MSW)
```javascript
import { http, HttpResponse } from 'msw'
// 각 도메인 핸들러는 별도 파일에서 import
export const handlers = [
  // ...auto-generated
]
```

### BOOTSTRAP 완료 메시지
```
✓ shared/constants/enums.ts
✓ backend/config/env.js (dotenv + Zod 환경변수 검증, auth.js 의존)
✓ backend/utils/response.js (ok/created/badRequest/unauthorized/forbidden/notFound/serverError)
✓ backend/middleware/validate.js (Zod)
✓ backend/middleware/auth.js (authMiddleware/requireAdmin/verifyOwnership)
✓ backend/middleware/uploadErrorHandler.js (multer 400 정규화)
✓ frontend/src/api/client.js (JSON)
✓ frontend/src/api/uploadClient.js (FormData + boundary 자동)
✓ frontend/src/mocks/handlers.js (MSW)
```

### BOOTSTRAP 체크리스트

- [ ] `shared/constants/enums.ts` 생성
- [ ] `backend/utils/response.js` 생성
- [ ] `backend/middleware/validate.js` 생성
- [ ] `backend/middleware/auth.js` 생성
- [ ] `backend/middleware/uploadErrorHandler.js` 생성
- [ ] `frontend/src/api/client.js` 생성
- [ ] `frontend/src/api/uploadClient.js` 생성
- [ ] `frontend/src/mocks/handlers.js` 생성
- [ ] `backend/config/env.js` 생성 - `dotenv.config()` 호출 후 필수 환경변수 Zod로 검증 (없으면 프로세스 즉시 종료)
  ```javascript
  // backend/config/env.js
  import 'dotenv/config'
  import { z } from 'zod'
  const schema = z.object({
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
  })
  export const env = schema.parse(process.env) // 검증 실패 시 즉시 throw
  ```
