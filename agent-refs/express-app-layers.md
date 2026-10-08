# express-engineer 참조: 프로젝트 구조·앱 설정·레이어 코드

> `.claude/agents/express-engineer.md` 의 참조 파일이다. 신규 프로젝트를 세팅하거나 Router/Controller/Service/Repository 파일을 실제로 작성할 때만 읽는다.

## 프로젝트 구조 (도메인 드리븐 - wecom·modadam 실측, project-structure-guide 스킬과 동일)

```
backend/
├── src/
│   ├── app.js                      # Express 앱 설정 (미들웨어 등록)
│   ├── server.js                   # 서버 진입점 (listen)
│   ├── routes/index.js             # 도메인 라우터 통합 등록
│   ├── domains/
│   │   ├── user/                   # 도메인 1개 = 4~5파일
│   │   │   ├── userRoutes.js
│   │   │   ├── userController.js
│   │   │   ├── userService.js
│   │   │   ├── userRepository.js
│   │   │   └── userSchemas.js      # zod (modadam 명명. wecom은 *Validation.js)
│   │   └── common/                 # upload·search·notifications·nav
│   ├── middleware/                 # authMiddleware·roleMiddleware·validationMiddleware·errorHandler·rateLimiter·uploadMiddleware
│   ├── utils/                      # response.js 등 순수 유틸
│   └── config/                     # database.js, env.js
└── tests/
```

아래 예시 코드의 import 경로는 설명용이다. 실제 파일은 `domains/<도메인>/` 안에 두고, 미들웨어 디렉토리 이름(`middleware/` 단수)과 파일명(`authMiddleware.js` 등)은 기존 프로젝트 것을 그대로 따른다. 타입별 폴더(`controllers/`, `services/`)로 나누지 않는다.

---

## Express 앱 기본 설정

```javascript
// src/app.js
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { errorHandler } from './middlewares/errorHandler.js'
import routes from './routes/index.js'

const app = express()

// 보안 미들웨어
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',')
    ?? (process.env.NODE_ENV !== 'production'
      ? ['http://localhost:5173', 'http://localhost:3000']
      : []),
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' }, // 응답 shape은 프로젝트 response.js와 맞춘다
})
app.use('/api', limiter)

// 파싱
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 라우터
app.use('/api', routes)

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler)

export default app
```

---

## 레이어별 책임 분리

### Router - 라우트 정의만
```javascript
// src/routes/users.js
import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { verifyOwnership } from '../middlewares/verifyOwnership.js'
import { validate } from '../middlewares/validate.js'
import { createUserSchema, updateUserSchema, uuidParamSchema } from '../validators/userSchema.js'
import { UserRepository } from '../repositories/userRepository.js'
import * as userController from '../controllers/userController.js'

const router = Router()

router.get('/', authenticate, userController.getUsers)
router.get('/:id', authenticate, userController.getUserById)
router.post('/', validate(createUserSchema), userController.createUser)
router.put('/:id', authenticate, validate(uuidParamSchema, 'params'), verifyOwnership(UserRepository), validate(updateUserSchema), userController.updateUser)
router.delete('/:id', authenticate, validate(uuidParamSchema, 'params'), verifyOwnership(UserRepository), userController.deleteUser)

export default router
```

### Controller - 요청 파싱 + 응답만
```javascript
// src/controllers/userController.js
import * as userService from '../services/userService.js'
import { AppError } from '../utils/AppError.js'
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js'

// [금지] 직접 res.json() - 래퍼를 통해 응답 포맷 통일. 래퍼 시그니처는 프로젝트 response.js 실측(wecom·modadam: successResponse(res, data, message, statusCode))
// res.json({ data: users })

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const { data, meta } = await userService.getUsers({
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      search,
    })
    return paginatedResponse(res, data, meta)
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404)
    return successResponse(res, user)
  } catch (err) {
    next(err)
  }
}

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    return successResponse(res, user, 201)
  } catch (err) {
    next(err)
  }
}
```

### Service - 비즈니스 로직만
```javascript
// src/services/userService.js
import * as userRepository from '../repositories/userRepository.js'
import { AppError } from '../utils/AppError.js'
import { hashPassword } from '../utils/crypto.js'

export const getUsers = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit
  const { users, total } = await userRepository.findAll({ offset, limit, search })

  return {
    data: users,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export const getUserById = async (uuid) => {
  return userRepository.findByUuid(uuid)
}

export const createUser = async ({ email, password, name }) => {
  const existing = await userRepository.findByEmail(email)
  if (existing) throw new AppError('이미 사용 중인 이메일입니다.', 409)

  const hashedPassword = await hashPassword(password)
  return userRepository.create({ email, password: hashedPassword, name })
}
```

### Repository - DB 접근만
```javascript
// src/domains/user/userRepository.js - raw SQL (pg, modadam 계열) 예시. mysql2(wecom·speetalk·cosmic-renew)는 `?` 바인딩 + `const [rows] = await pool.execute(...)` + INSERT 후 insertId로 재조회 - 예시는 express-wecom-patterns.md
import { pool } from '../config/database.js'
import { AppError } from '../utils/AppError.js'

export const findAll = async ({ offset, limit, search }) => {
  const searchCondition = search ? `AND (name ILIKE $3 OR email ILIKE $3)` : ''
  const params = search ? [limit, offset, `%${search}%`] : [limit, offset]

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT uuid, email, name, created_at
       FROM users
       WHERE deleted_at IS NULL ${searchCondition}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    ),
    pool.query(
      `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL ${searchCondition}`,
      search ? [`%${search}%`] : []
    ),
  ])

  return {
    users: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
  }
}

export const findByUuid = async (uuid) => {
  const result = await pool.query(
    'SELECT uuid, email, name, user_id, created_at FROM users WHERE uuid = $1 AND deleted_at IS NULL',
    [uuid]
  )
  return result.rows[0] ?? null
}

export const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT uuid FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  )
  return result.rows[0] ?? null
}

export const create = async ({ email, password, name }) => {
  const result = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING uuid, email, name, created_at',
    [email, password, name]
  )
  return result.rows[0]
}

// UPDATE - UPDATABLE_COLS 화이트리스트로 동적 컬럼 차단 (defense in depth)
const UPDATABLE_COLS = ['name', 'email', 'bio', 'avatar_url']

export const updateByUuid = async (uuid, data) => {
  const cols = Object.keys(data).filter((k) => UPDATABLE_COLS.includes(k))
  if (cols.length === 0) throw new AppError('수정할 필드가 없습니다.', 400)
  const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ')
  const values = cols.map((c) => data[c])
  const { rows } = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE uuid = $${cols.length + 1} AND deleted_at IS NULL RETURNING uuid, email, name, bio, avatar_url, updated_at`,
    [...values, uuid]
  )
  return rows[0] ?? null
}

export const softDeleteByUuid = async (uuid) => {
  const { rows } = await pool.query(
    `UPDATE users SET deleted_at = NOW() WHERE uuid = $1 AND deleted_at IS NULL RETURNING uuid`,
    [uuid]
  )
  return rows[0] ?? null
}

// 그룹 export - verifyOwnership(UserRepository) 등 named import 해소
export const UserRepository = { findByUuid, findAll, findByEmail, create, updateByUuid, softDeleteByUuid }
```
