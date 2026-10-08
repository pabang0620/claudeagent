# express-engineer 참조: DB 연결·트랜잭션·비동기·테스트

> `.claude/agents/express-engineer.md` 의 참조 파일이다. DB 연결 설정, 트랜잭션 헬퍼, Supertest 테스트를 작성할 때만 읽는다.

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
// src/config/database.js (wecom 실측 기준)
import mysql from 'mysql2/promise'

for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
  if (!process.env[key]) throw new Error(`${key} 환경변수가 설정되지 않았습니다.`) // 값 없으면 부팅 차단 (rules/security.md)
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+09:00', // db-schema-architect 원칙: 시간대 누락 시 날짜 버그
})

pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+09:00'")
})
```

### MySQL2 트랜잭션 헬퍼
wecom은 헬퍼 없이 Service/Repository 안에서 `pool.getConnection()` → `beginTransaction()` → `commit/rollback` → `release()`를 직접 쓴다. 기존 프로젝트는 그 관례를 따르고, 헬퍼는 새로 만들 때만(cosmic-renew는 `src/utils/withTransaction.js`에 있음) 아래처럼 둔다.
```javascript
// src/utils/withTransaction.js
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

### Prisma - Prisma 프로젝트(예: cosmic-kuji-market)에서만
```javascript
// package.json에 @prisma/client가 있는 프로젝트에서만. raw SQL 프로젝트에 새로 들이지 않는다
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```


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

이 프로젝트군에서 틀리기 쉬운 점만 적는다. Supertest 문법 자체는 설명하지 않는다.
- `app`(listen 안 함)을 import하고 `server.js`는 import하지 않는다. `afterAll`에서 `pool.end()`를 호출하지 않으면 Jest가 종료되지 않는다.
- 검증 실패 응답은 프로젝트마다 다르다: wecom·modadam은 `422` + `body.errors[{field,message}]`, 이 참조의 신규 기본 `validate`는 `400` + `body.details[...]`. 테스트 기대값은 실제 `validationMiddleware.js`를 읽고 맞춘다.
- 토큰은 프로젝트의 `utils/jwt.js` 발급 함수로 만든다(`req.user`에 들어가는 필드명이 `user_type`인지 `role`인지 프로젝트마다 다르다).
- 테스트 DB는 `.env.test`로 분리하고 운영 DB 접속 정보로 테스트를 돌리지 않는다.
