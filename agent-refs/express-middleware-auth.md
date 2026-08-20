# express-engineer 참조: 미들웨어·인증·업로드 구현

> `.claude/agents/express-engineer.md` 의 참조 파일이다. AppError·errorHandler·zod validate·JWT·Access/Refresh 이중 토큰·verifyOwnership·multer 업로드를 실제로 구현할 때만 읽는다.

## 미들웨어 패턴

### AppError 클래스
```javascript
// src/utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}
```

### 에러 핸들러
```javascript
// src/middlewares/errorHandler.js
import { AppError } from '../utils/AppError.js'

export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development'

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
  }

  // DB 고유 제약 위반
  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: '이미 존재하는 데이터입니다.' })
  }

  // pg 22P02: 잘못된 UUID 형식 (defense in depth - validate 미들웨어 통과 후 발생 케이스)
  if (err.code === '22P02') {
    return res.status(400).json({ success: false, error: '잘못된 ID 형식입니다.' })
  }

  console.error('[ERROR]', err)

  res.status(500).json({
    success: false,
    error: isDev ? err.message : '서버 오류가 발생했습니다.',
    ...(isDev && { stack: err.stack }),
  })
}
```

### 입력 검증 (zod)
```javascript
// src/validators/userSchema.js
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력하세요').max(50),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요').max(50).optional(),
  bio: z.string().max(500).optional(),
})

export const uuidParamSchema = z.object({
  id: z.string().uuid('올바른 UUID 형식이어야 합니다'),
})
```

### JWT 인증

> 아래 `authenticate`/`authorize`는 accessToken 검증 + 역할 검증 미들웨어 그 자체이며, 바로 뒤 "Access/Refresh 이중 토큰 패턴" 섹션에서도 변경 없이 그대로 재사용한다. 이중 토큰 패턴이 바꾸는 것은 accessToken의 **발급·보관·갱신 방식**뿐이다.

```javascript
// src/middlewares/auth.js
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('인증이 필요합니다.', 401))
  }

  const token = authHeader.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    next(new AppError('유효하지 않은 토큰입니다.', 401))
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new AppError('권한이 없습니다.', 403))
  }
  next()
}

```

```javascript
// src/config/roles.js (별도 파일 - auth.js 내부 선언 금지)
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
}
```

```javascript
// src/middlewares/auth.js (requireAdmin - ROLES import 후 정의)
import { ROLES } from '../config/roles.js'
export const requireAdmin = authorize(ROLES.ADMIN)
```

### 인증 - Access/Refresh 이중 토큰 패턴 (프로덕션 권장)

> 위 `authenticate`만으로는 accessToken 만료 시 매번 강제 재로그인이 필요하고, accessToken을 localStorage에 두면 XSS로 탈취 시 만료 전까지 계속 악용된다. 실전에서 검증된 해결책은 **accessToken=메모리 / refreshToken=HttpOnly 쿠키** 이중 보관 + 자동 갱신이다. 단순 토큰 검증만 필요하면(예: 내부 서비스 간 호출) 위 `authenticate` 단독으로 충분하니, 아래는 브라우저 세션이 있는 일반 웹앱에 한해 적용한다.

**보관 위치 원칙**
- `accessToken`: 프론트 메모리(Zustand 등 상태 저장소)에만 보관. `localStorage`/`sessionStorage` 저장 금지 - XSS로 탈취되면 만료 전까지 계속 악용 가능
- `refreshToken`: `httpOnly + secure + sameSite` 쿠키로만 전달. JS(`document.cookie`)로 접근 불가 → XSS로도 탈취 불가
- 응답 body에 `refreshToken`을 절대 포함하지 않는다 (프론트가 저장할 방법 자체를 차단)

**백엔드 - 발급/갱신/복원 엔드포인트**
```javascript
// src/config/cookie.js
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // localhost는 HTTPS가 없어 strict 강제 시 개발 환경에서 쿠키가 아예 안 붙는다
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
}
```
```javascript
// src/controllers/authController.js
export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body)
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    return successResponse(res, { accessToken, user }) // refreshToken은 body에 넣지 않음
  } catch (err) { next(err) }
}

// 롤링 리프레시: 호출될 때마다 refreshToken도 재발급 (탈취된 구 토큰의 유효기간을 최소화)
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken // body가 아닌 쿠키에서만 읽음
    if (!token) return next(new AppError('로그인이 필요합니다.', 401))
    const { accessToken, refreshToken, user } = await authService.rotateRefreshToken(token)
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    return successResponse(res, { accessToken, user })
  } catch (err) { next(err) }
}

// 새로고침 시 프론트 메모리가 비어있는 상태에서 세션 복원용 - refresh와 동일 로직 재사용
export const me = (req, res, next) => refresh(req, res, next)

export const logout = (req, res) => {
  res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: undefined })
  return successResponse(res, null)
}
```
- CORS에 `credentials: true` + `app.use(cookieParser())` 필수 - 빠지면 브라우저가 쿠키를 아예 전송하지 않는다: `app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))`

**프론트엔드 - refresh 뮤텍스/큐 (핵심)**
동시에 여러 요청이 401을 맞으면 각 요청이 독립적으로 `/auth/refresh`를 호출하기 쉽다. refreshToken이 롤링 방식이면 두 번째 refresh 호출은 이미 무효화된 토큰으로 실패해 세션이 레이스로 끊긴다. **진행 중인 refresh를 플래그+큐로 공유**해 반드시 1회만 호출되게 막는다.
```javascript
// src/config/apiClient.js
import axios from 'axios'
import { useAuthStore } from '../store/authStore.js'

const MAX_QUEUE_SIZE = 100
const apiClient = axios.create({ baseURL: '/api', withCredentials: true })

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken // 메모리에서 읽음, localStorage 아님
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue = [] // 진행 중인 refresh를 기다리는 요청들

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthEndpoint = original.url?.includes('/auth/login') || original.url?.includes('/auth/refresh')
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error) // refresh 자체의 401까지 재시도하면 무한루프
    }
    original._retry = true

    if (isRefreshing) {
      // 이미 refresh 진행 중 → 새로 호출하지 않고 큐에서 대기
      if (refreshQueue.length >= MAX_QUEUE_SIZE) return Promise.reject(error)
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { // refresh 호출이 응답 없이 멈추는 경우 대비
          refreshQueue = refreshQueue.filter((q) => q.reject !== reject)
          reject(error)
        }, 10000)
        refreshQueue.push({ resolve, reject: (e) => { clearTimeout(timer); reject(e) } })
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
      const newToken = data.data.accessToken
      useAuthStore.getState().setAccessToken(newToken)
      refreshQueue.forEach(({ resolve }) => resolve(newToken)) // 대기 중이던 요청 전부 재개
      refreshQueue = []
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch (err) {
      refreshQueue.forEach(({ reject }) => reject(err)) // 대기열도 함께 실패 처리 - 안 하면 pending 상태로 멈춘다
      refreshQueue = []
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false // try/catch 어느 쪽이든 반드시 해제 - try 안에서만 풀면 refresh 실패 시 락이 영구히 걸린다
    }
  }
)

export default apiClient
```

**상태 저장소 - accessToken은 메모리만**
```javascript
// src/store/authStore.js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,       // 메모리 - 새로고침하면 사라지는 게 의도된 동작
  isAuthenticated: false,
  isInitialized: false,    // /auth/me 완료 여부 - 라우트 가드가 이 값으로 로딩 분기
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isInitialized: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: () => set({ isInitialized: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isInitialized: true }),
}))
```

**세션 복원 - 새로고침 시 `/auth/me`**
메모리는 새로고침하면 비워진다. 앱 진입점에서 마운트 1회 `/auth/me`를 호출해 쿠키의 refreshToken으로 세션을 복원한다. 실패(비로그인)는 정상 케이스이므로 throw하지 않고 `isInitialized`만 true로 만든다.
```jsx
useEffect(() => {
  axios.get('/api/auth/me', { withCredentials: true })
    .then(({ data }) => setAuth(data.data.user, data.data.accessToken))
    .catch(() => setInitialized()) // 비로그인 상태는 에러가 아니라 정상 흐름
}, [])
```
라우트 가드는 `isInitialized`가 true가 될 때까지 대기한 뒤 `isAuthenticated`를 판단한다. 대기 없이 판단하면 새로고침 직후 항상 비로그인으로 오판해 로그인 페이지로 튕긴다.

**역할 가드**
위에서 정의한 `authorize(...roles)` / `requireAdmin`을 그대로 얹는다 - `authenticate`(accessToken 검증) 뒤에 역할 검증을 쌓는 2층 구조는 동일하다. 이중 토큰 패턴이 바뀌는 것은 accessToken의 발급·저장·갱신 방식뿐, 라우트의 권한 계층 구조는 변하지 않는다.

**절대 하지 말 것**
- `localStorage.setItem('refreshToken', ...)` 및 `accessToken`도 마찬가지로 localStorage/sessionStorage 저장 금지
- `req.body.refreshToken`으로 refresh 처리 금지 - 반드시 쿠키에서만 읽는다
- 개발 환경에서 `secure: true` 강제 금지 - localhost는 HTTPS가 없어 쿠키 자체가 브라우저에서 버려진다
- `/auth/me` 실패를 에러로 throw 금지 - 비로그인 상태는 정상 흐름이다
- refresh 뮤텍스(플래그+큐) 없이 인터셉터 작성 금지 - 동시 401 시 롤링 refreshToken이 레이스로 무효화되어 세션이 끊긴다
- refresh 실패 시 대기 큐를 비워두지 말 것 - `reject` 처리 없이 두면 대기 중이던 요청들이 영원히 pending 상태로 멈춘다


---

### verifyOwnership 미들웨어 구현
```javascript
// src/middlewares/verifyOwnership.js
import { AppError } from '../utils/AppError.js'
import { ROLES } from '../config/roles.js'

export function verifyOwnership(Model, ownerField = 'user_id') {
  return async (req, res, next) => {
    try {
      const record = await Model.findByUuid(req.params.id)
      if (!record) return next(new AppError('리소스를 찾을 수 없습니다.', 404))
      if (record[ownerField] !== req.user?.id && req.user?.role !== ROLES.ADMIN) {
        return next(new AppError('접근 권한이 없습니다.', 403))
      }
      req.resource = record
      next()
    } catch (err) {
      next(err)
    }
  }
}

// 사용 예시 (validate params → verifyOwnership 순서 필수):
router.put('/:id', authenticate, validate(uuidParamSchema, 'params'), verifyOwnership(PostRepository, 'author_id'), postController.update)
```

---

## 파일 업로드 (multer) 구현
- 패턴:
  ```javascript
  import path from 'path'
  import crypto from 'crypto'
  import multer from 'multer'
  import { AppError } from '../utils/AppError.js'
  import { mkdirSync } from 'fs'

  // 업로드 디렉토리 자동 생성 (없으면 multer ENOENT 오류)
  const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads/avatars'
  mkdirSync(UPLOAD_DIR, { recursive: true })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `${crypto.randomUUID()}${ext}`) // userId 노출 금지
    },
  })

  const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('허용되지 않는 파일 형식입니다.', 400), false)
    }
  }

  export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })

  // src/middlewares/errorHandler.js 에 추가
  const MULTER_ERROR_MESSAGES = {
    LIMIT_FILE_SIZE: '파일 크기는 5MB를 초과할 수 없습니다.',
    LIMIT_FILE_COUNT: '파일 개수 초과입니다.',
    LIMIT_UNEXPECTED_FILE: '허용되지 않는 필드입니다.',
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message })
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: MULTER_ERROR_MESSAGES[err.code] ?? '파일 업로드 오류',
    })
  }
  ```
