# express-engineer 참조: DB 연결·트랜잭션·비동기·테스트

> `.claude/agents/express-engineer.md` 의 참조 파일이다. DB 연결 설정, 트랜잭션 헬퍼, 병렬/스트리밍 처리, Supertest 테스트를 작성할 때만 읽는다.

## DB 연결 설정

### PostgreSQL (pg) - pg 감지 시 (예: modadam)
```javascript
// src/config/database.js
import pg from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.')
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true, ca: process.env.DB_SSL_CA }
    : false,
})

pool.on('error', (err) => {
  console.error('DB 연결 오류:', err)
})
```

### MySQL2 - mysql2 감지 시 (wecom·speetalk·cosmic-renew 등 MySQL 프로젝트)
```javascript
// src/config/database.js
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
})
```

### MySQL2 트랜잭션 헬퍼
```javascript
// src/config/mysql.js
export async function withTransaction(pool, fn) {
  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// 사용 예시:
const result = await withTransaction(mysqlPool, async (conn) => {
  const [rows] = await conn.execute(
    'INSERT INTO users (name, email, created_at) VALUES (?, ?, NOW())',
    [userData.name, userData.email]
  )
  return rows
})
```

### Prisma - 미지향 (명시 요청 시에만)
```javascript
// 사용자가 명시적으로 Prisma 사용을 요청한 경우에만
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```


## 비동기 처리 패턴

### 병렬 처리
```javascript
// ❌ 순차 실행 (느림)
const user = await getUser(id)
const orders = await getOrders(id)
const reviews = await getReviews(id)

// ✅ 병렬 실행
const [user, orders, reviews] = await Promise.all([
  getUser(id),
  getOrders(id),
  getReviews(id),
])
```

### 스트리밍 대용량 데이터
```javascript
import { pipeline } from 'stream/promises'
import { createReadStream } from 'fs'

export const downloadFile = async (req, res) => {
  const filePath = getFilePath(req.params.filename)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`)
  await pipeline(createReadStream(filePath), res)
}
```

---

### pg 트랜잭션 패턴
```javascript
// src/utils/withTransaction.js
import { pool } from '../config/database.js'
export const withTransaction = async (callback) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
```

---

## 테스트 (Supertest + Jest)

```javascript
// tests/users.test.js
import request from 'supertest'
import app from '../src/app.js'
import { pool } from '../src/config/database.js'

describe('GET /api/users', () => {
  it('인증 없이 접근 시 401 반환', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('유효한 토큰으로 사용자 목록 반환', async () => {
    const token = generateTestToken({ id: 1, role: 'admin' })
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.meta).toHaveProperty('total')
  })
})

describe('POST /api/users', () => {
  it('이메일 누락 시 400 반환', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ password: 'password123', name: '테스트' })

    expect(res.status).toBe(400)
    expect(res.body.details[0].field).toBe('email')
  })
})

afterAll(async () => {
  await pool.end()
})
```
