---
name: backend-patterns
description: Node.js/Express 백엔드 아키텍처 패턴. API 설계, 레이어 분리, DB 접근(pg 기본/Prisma 요청 시), 보안, 캐싱, 에러 처리 베스트 프랙티스
---

# 백엔드 개발 패턴 (Node.js + Express)

## 레이어 아키텍처

```
Router → Controller → Service → Repository
  ↓          ↓           ↓           ↓
라우트    요청/응답   비즈니스    DB 접근
정의      처리       로직만      계층만
```

- **Router**: URL 매핑 + 미들웨어 체인
- **Controller**: req 파싱 → Service 호출 → res 반환 (로직 없음)
- **Service**: 비즈니스 규칙, 유효성 검사, 트랜잭션
- **Repository**: DB 쿼리 추상화 (SQL or ORM)

---

## API 설계

### RESTful URL 컨벤션
```
GET    /api/users           → 목록
GET    /api/users/:id       → 단일
POST   /api/users           → 생성
PUT    /api/users/:id       → 전체 수정
PATCH  /api/users/:id       → 부분 수정
DELETE /api/users/:id       → 삭제

# 중첩 리소스
GET    /api/users/:id/orders
POST   /api/users/:id/orders

# 필터·정렬·페이지네이션
GET /api/users?status=active&sort=created_at&order=desc&page=1&limit=20
```

### 응답 형식 (일관성 필수)
```javascript
// 성공
res.json({ success: true, data: result })
res.json({ success: true, data: list, meta: { total, page, limit, totalPages } })
res.status(201).json({ success: true, data: created })

// 에러
res.status(400).json({ success: false, error: '메시지' })
res.status(401).json({ success: false, error: '인증이 필요합니다.' })
res.status(403).json({ success: false, error: '권한이 없습니다.' })
res.status(404).json({ success: false, error: '리소스를 찾을 수 없습니다.' })
res.status(409).json({ success: false, error: '이미 존재합니다.' })
res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' })
```

---

## Repository 패턴

### PostgreSQL (pg) — 기본
```javascript
import { pool } from '../config/database.js'

export const findAll = async ({ offset = 0, limit = 20, search }) => {
  const searchWhere = search ? `AND (name ILIKE $3 OR email ILIKE $3)` : ''
  const params = search ? [limit, offset, `%${search}%`] : [limit, offset]

  const [rows, count] = await Promise.all([
    pool.query(
      `SELECT id, email, name, created_at FROM users
       WHERE deleted_at IS NULL ${searchWhere}
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    ),
    pool.query(
      `SELECT COUNT(*) FROM users WHERE deleted_at IS NULL ${searchWhere}`,
      search ? [`%${search}%`] : []
    ),
  ])

  return { users: rows.rows, total: parseInt(count.rows[0].count) }
}

export const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, email, name, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id]
  )
  return rows[0] ?? null
}

export const create = async ({ email, password, name }) => {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, password, name]
  )
  return rows[0]
}
```

### MySQL2 (WeCom 등 MySQL 프로젝트)
```javascript
import { pool } from '../config/database.js'

export const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id, email, name, created_at FROM users WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return rows[0] ?? null
}
```

### Prisma — 요청 시에만 사용
```javascript
// 사용자가 명시적으로 Prisma를 요청한 경우에만
import { prisma } from '../config/prisma.js'

export const findAll = async ({ skip, take }) =>
  prisma.user.findMany({ skip, take, where: { deletedAt: null } })
```

---

## 미들웨어 패턴

### 에러 핸들러 (필수)
```javascript
// utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  if (err.name === 'AppError') {
    return res.status(err.statusCode).json({ success: false, error: err.message })
  }
  if (err.code === '23505') { // pg 고유키 위반
    return res.status(409).json({ success: false, error: '이미 존재하는 데이터입니다.' })
  }
  if (err.code === 'ER_DUP_ENTRY') { // mysql2 고유키 위반
    return res.status(409).json({ success: false, error: '이미 존재하는 데이터입니다.' })
  }

  console.error('[ERROR]', err)
  const isDev = process.env.NODE_ENV === 'development'
  res.status(500).json({
    success: false,
    error: isDev ? err.message : '서버 오류가 발생했습니다.',
    ...(isDev && { stack: err.stack }),
  })
}
```

### 입력 검증 (zod)
```javascript
// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: '입력값이 올바르지 않습니다.',
      details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }
  req.body = result.data // 검증된 데이터로 교체
  next()
}
```

### JWT 인증
```javascript
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.slice(7) // 'Bearer ' 제거
  if (!token) return next(new AppError('인증이 필요합니다.', 401))

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    next(new AppError('유효하지 않은 토큰입니다.', 401))
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return next(new AppError('권한이 없습니다.', 403))
  next()
}
```

---

## 비동기 처리

### 병렬 실행 — 항상 우선 고려
```javascript
// ❌ 순차 (느림)
const user = await getUser(id)
const orders = await getOrders(id)

// ✅ 병렬
const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
```

### 재시도 (지수 백오프)
```javascript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
}
```

---

## DB 연결 설정

### PostgreSQL (pg)
```javascript
import pg from 'pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 미설정')

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
```

### MySQL2
```javascript
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
})
```

---

## 캐싱 (Redis)

### Cache-Aside 패턴
```javascript
async function getCachedUser(id) {
  const key = `user:${id}`
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const user = await userRepository.findById(id)
  if (user) await redis.setex(key, 300, JSON.stringify(user)) // 5분
  return user
}

async function invalidateUser(id) {
  await redis.del(`user:${id}`)
}
```

---

## 보안 체크리스트

```javascript
// app.js 필수 설정
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json({ limit: '10mb' }))

// 절대 하지 말 것
// ❌ SQL 문자열 직접 조합 → 인젝션 위험
const q = `SELECT * FROM users WHERE id = ${req.params.id}`

// ✅ 파라미터 바인딩
pool.query('SELECT * FROM users WHERE id = $1', [req.params.id])

// ❌ 비밀번호 평문 응답
res.json({ id: user.id, password: user.password })

// ✅ 민감 필드 제외
const { password, ...safeUser } = user
res.json({ success: true, data: safeUser })
```

---

## 구조화된 로깅

```javascript
const log = {
  info: (msg, ctx = {}) => console.log(JSON.stringify({ level: 'info', msg, ...ctx, ts: new Date().toISOString() })),
  error: (msg, err, ctx = {}) => console.error(JSON.stringify({ level: 'error', msg, error: err.message, ...ctx, ts: new Date().toISOString() })),
}

// 사용
router.get('/users', async (req, res, next) => {
  const reqId = crypto.randomUUID()
  log.info('사용자 목록 조회', { reqId })
  try {
    const data = await userService.getUsers()
    res.json({ success: true, data })
  } catch (err) {
    log.error('사용자 조회 실패', err, { reqId })
    next(err)
  }
})
```

---

## N+1 방지

```javascript
// ❌ N+1 (루프 안에서 쿼리)
for (const order of orders) {
  order.user = await getUser(order.userId) // orders.length번 쿼리
}

// ✅ 배치 조회
const userIds = [...new Set(orders.map(o => o.userId))]
const users = await getUsersByIds(userIds) // 1번 쿼리
const userMap = new Map(users.map(u => [u.id, u]))
orders.forEach(o => { o.user = userMap.get(o.userId) })

// ✅ JOIN 사용
pool.query(`
  SELECT o.*, u.name as user_name, u.email
  FROM orders o
  JOIN users u ON u.id = o.user_id
  WHERE o.status = $1
`, ['pending'])
```

---

**핵심**: Express는 unopinionated입니다. 레이어를 처음부터 분리하면 리팩토링 비용이 없습니다.

---

## WeCom 회고 기반 백엔드 패턴 (347 fix 분석 교훈)

### API 응답 포맷
- 통일: `{ success: boolean, data?: T, error?: string, meta?: { total, page, limit } }`
- res.json 직접 호출 금지 → 응답 유틸 래퍼 사용
- POST/PATCH: 전체 리소스 재조회 반환 (insertId 단독 금지)

### 인증
- authMiddleware + requireAdmin 2층 필수
- admin 라우트 requireAdmin 누락 시 서버 부팅 실패 강제
- JWT payload 에 AUTO_INCREMENT id 노출 금지 → UUID 만

### 파일 업로드
- uploadClient 래퍼 (Content-Type 자동 제거, boundary 브라우저 위임)
- multer 에러: 글로벌 에러 핸들러로 등록, 전부 400 정규화
- S3 ACL 설정 금지 → 버킷 정책으로 퍼블릭 제어

### DB 패턴
- MySQL 8 예약어 블랙리스트 (rank/order/group/key/desc/value/match 등 → 대체어 사용)
- ENUM 변경 시: DB + shared/constants/enums.ts + Zod 3곳 동시 업데이트
- Repository UPDATE: UPDATABLE_COLS 화이트리스트 (SQL 인젝션 defense in depth)
