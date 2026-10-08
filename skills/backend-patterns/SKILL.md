---
name: backend-patterns
description: Node.js/Express 백엔드 코드를 작성·수정할 때 자동 적용하는 이 사용자의 컨벤션. Router/Controller/Service/Repository 3계층, 응답 shape 확인 순서, DB 드라이버(pg/mysql2/Prisma 프로젝트별 감지), 중앙 errorHandler, zod validate, 이중 ID, WeCom 회고 기반 금지 사항. 일반 Express 지식은 담지 않는다. 신규 API 계약 설계는 api-contract-designer, 쿼리 감사는 database-reviewer.
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

### 응답 형식 예시 (shape은 아래 "API 응답 포맷" 확인 순서로 프로젝트 실측을 우선한다. 예시는 기본값 `message` 형)
```javascript
// 성공
res.json({ success: true, data: result })
res.json({ success: true, data: list, meta: { total, page, limit, totalPages } })
res.status(201).json({ success: true, data: created })

// 에러
res.status(400).json({ success: false, message: '메시지' })
res.status(404).json({ success: false, message: '리소스를 찾을 수 없습니다.' })
// 401/403/409/500도 같은 shape. 컨트롤러에서 직접 쓰지 말고 next(err)로 중앙 errorHandler에 넘긴다 (rules/coding-style.md A)
```

---

## Repository 패턴

### PostgreSQL (pg) - pg 감지 시 (예: modadam)
```javascript
import { pool } from '../config/database.js'

// 외부 노출·조회는 uuid 컬럼(user_id)으로. 내부 id는 JOIN·FK 전용 (CLAUDE.md 이중 ID)
export const findByUuid = async (userId) => {
  const { rows } = await pool.query(
    'SELECT user_id, email, name, created_at FROM users WHERE user_id = $1 AND deleted_at IS NULL',
    [userId]
  )
  return rows[0] ?? null
}

export const create = async ({ email, password, name }) => {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING user_id, email, name, created_at',
    [email, password, name]
  )
  return rows[0]
}
```

### MySQL2 - mysql2 감지 시 (wecom·speetalk·cosmic-renew 등 MySQL 프로젝트)
```javascript
import { pool } from '../config/database.js'

export const findByUuid = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT user_id, email, name, created_at FROM users WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  )
  return rows[0] ?? null
}
```

> Prisma 프로젝트(예: cosmic-kuji-market)는 Prisma 관례를 따른다. raw SQL 프로젝트에는 Prisma를 새로 도입하지 않는다.

---

## 미들웨어 패턴

### 에러 핸들러 (중앙 1개, 컨트롤러는 next(err)만)
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
    return res.status(err.statusCode).json({ success: false, message: err.message })
  }
  if (err.code === '23505') { // pg 고유키 위반
    return res.status(409).json({ success: false, message: '이미 존재하는 데이터입니다.' })
  }
  if (err.code === 'ER_DUP_ENTRY') { // mysql2 고유키 위반
    return res.status(409).json({ success: false, message: '이미 존재하는 데이터입니다.' })
  }

  console.error('[ERROR]', err)
  const isDev = process.env.NODE_ENV === 'development'
  res.status(500).json({
    success: false,
    message: isDev ? err.message : '서버 오류가 발생했습니다.',
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
      message: '입력값이 올바르지 않습니다.',
      errors: result.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }
  req.body = result.data // 검증된 데이터로 교체
  next()
}
```

### JWT 인증
- 토큰 검증 미들웨어(authMiddleware) + 역할 검사(requireAdmin 등) 2층으로 나눈다. 실패는 `next(new AppError(..., 401|403))`.
- JWT payload에는 외부용 uuid만 넣는다. AUTO_INCREMENT id 금지 (CLAUDE.md 이중 ID).
- 프로젝트에 기존 미들웨어가 있으면 그 이름·시그니처를 따른다. 새로 만들지 않는다.

---

## DB 연결 설정

### PostgreSQL (pg)
```javascript
import pg from 'pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 미설정')

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
})
```

### MySQL2
```javascript
import mysql from 'mysql2/promise'

if (!process.env.DB_HOST) throw new Error('DB_HOST 미설정')

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

## N+1 방지

루프 안에서 쿼리하지 않는다. id 배열로 한 번에 조회(`WHERE id IN (...)`)하거나 JOIN으로 가져온다.

---

## WeCom 회고 기반 백엔드 패턴 (347 fix 분석 교훈)

### API 응답 포맷
- **shape을 전역 고정하지 말 것** - 다음 우선순위로 확인:
  1. 로컬 `.claude/CLAUDE.md` 또는 로컬 에이전트가 실제 shape을 문서화했으면 그것 최우선
  2. 없으면 `backend/src/utils/response.js`(또는 동등 래퍼)를 직접 읽어 실제 shape 확인 후 그대로 따름
  3. 둘 다 없는 신규 프로젝트에 한해 기본값 `{ success: boolean, data?: T, message?: string, errors?: unknown, meta?: { total, page, limit } }` 사용 (wecom·modadam 실증). `error`/`details`/`code`는 speetalk·cosmic-renew 등에서 관찰되는 변형이며 기본값이 아님 - 기존 프로젝트에 붙일 땐 그 프로젝트 실측 response.js를 따를 것
- 프로젝트에 응답 래퍼(response.js 등)가 있으면 그것을 쓰고, 없으면 res.json을 쓴다
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
