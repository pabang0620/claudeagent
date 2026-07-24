---
name: postgres-patterns
description: PostgreSQL 데이터베이스 패턴, 쿼리 최적화, 스키마 설계, 인덱싱 — raw SQL(node-postgres/pg) 기본, Prisma는 요청 시에만. 적용 조건 — package.json에 `pg` 의존성이 있는 프로젝트 한정(예: modadam). MySQL 프로젝트(wecom·speetalk·cosmic-renew)에는 적용하지 않음
---

# PostgreSQL 패턴

PostgreSQL 베스트 프랙티스 빠른 참조 가이드

## 언제 활성화하나

- SQL 쿼리 또는 마이그레이션 작성 시
- 데이터베이스 스키마 설계 시
- 느린 쿼리 트러블슈팅 시
- 커넥션 풀링 설정 시

> **기본은 raw SQL (node-postgres/pg)입니다.** 아래 예시는 모두 parameterized pg 쿼리를 1순위로 제시합니다. Prisma는 이 프로젝트에서 미지향이며, 명시적으로 요청된 경우에만 문서 하단의 "Prisma (미지향)" 섹션을 참고하세요.

## 빠른 참조

### 인덱스 치트 시트

| 쿼리 패턴 | 인덱스 타입 | 예시 |
|-----------|-------------|------|
| `WHERE col = value` | B-tree (기본) | `CREATE INDEX idx ON t (col)` |
| `WHERE col > value` | B-tree | `CREATE INDEX idx ON t (col)` |
| `WHERE a = x AND b > y` | 복합 인덱스 | `CREATE INDEX idx ON t (a, b)` |
| `WHERE jsonb @> '{}'` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| `WHERE tsv @@ query` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| 시계열 범위 | BRIN | `CREATE INDEX idx ON t USING brin (col)` |

### 데이터 타입 빠른 참조

| 용도 | 올바른 타입 | 피해야 할 타입 |
|------|------------|----------------|
| ID | `uuid` | `int`, random UUID |
| 문자열 | `text` | `varchar(255)` |
| 타임스탬프 | `timestamptz` | `timestamp` |
| 금액 | `numeric(10,2)` | `float` |
| 플래그 | `boolean` | `varchar`, `int` |

### raw SQL 패턴 (node-postgres/pg — 기본)

**테이블 정의 (DDL):**
```sql
CREATE TABLE markets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  status      varchar(20) NOT NULL,
  volume      numeric(10, 2) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  creator_id  uuid NOT NULL REFERENCES users (id)
);

CREATE INDEX idx_markets_status ON markets (status);
CREATE INDEX idx_markets_created_at ON markets (created_at);
CREATE INDEX idx_markets_creator_id ON markets (creator_id);
```

**쿼리 최적화 (필요한 컬럼만 선택):**
```javascript
import { pool } from '../config/database.js'

// ✅ 좋은 예: 필요한 컬럼만 + 파라미터 바인딩 + LIMIT/OFFSET
const { rows: markets } = await pool.query(
  `SELECT id, name, status
   FROM markets
   WHERE status = $1
   ORDER BY created_at DESC
   LIMIT $2 OFFSET $3`,
  ['active', take, skip]
)

// ❌ 나쁜 예: 모든 컬럼 선택 + LIMIT 없음
const { rows: all } = await pool.query('SELECT * FROM markets')
```

**관계 로딩 (JOIN으로 N+1 방지):**
```javascript
// ✅ JOIN 한 번으로 조회
const { rows } = await pool.query(
  `SELECT m.id, m.name, m.status,
          u.id AS creator_id, u.name AS creator_name
   FROM markets m
   JOIN users u ON u.id = m.creator_id
   WHERE m.status = $1`,
  ['active']
)

// ❌ N+1 쿼리 문제 (루프 안에서 매번 조회)
const { rows: markets } = await pool.query('SELECT id, name, creator_id FROM markets')
for (const market of markets) {
  const { rows } = await pool.query('SELECT id, name FROM users WHERE id = $1', [market.creator_id])
  market.creator = rows[0]
}
```

### 일반 패턴

**복합 인덱스 순서:**
```sql
-- 동등 조건 컬럼 먼저, 범위 조건은 나중에
CREATE INDEX idx ON orders (status, created_at);
-- 동작: WHERE status = 'pending' AND created_at > '2024-01-01'
```

**커버링 인덱스:**
```sql
CREATE INDEX idx ON users (email) INCLUDE (name, created_at);
-- 테이블 조회를 피함: SELECT email, name, created_at
```

**부분 인덱스:**
```sql
CREATE INDEX idx ON users (email) WHERE deleted_at IS NULL;
-- 더 작은 인덱스, 활성 사용자만 포함
```

**UPSERT (INSERT ... ON CONFLICT):**
```javascript
await pool.query(
  `INSERT INTO settings (user_id, key, value)
   VALUES ($1, $2, $3)
   ON CONFLICT (user_id, key)
   DO UPDATE SET value = EXCLUDED.value`,
  [123, 'theme', 'dark']
)
// 전제: UNIQUE (user_id, key) 제약이 있어야 ON CONFLICT가 동작
```

**커서 페이지네이션:**
```javascript
// ✅ O(1) - OFFSET보다 빠름 (인덱스된 컬럼 기준 커서)
const { rows: products } = await pool.query(
  `SELECT id, name FROM products
   WHERE id > $1
   ORDER BY id ASC
   LIMIT $2`,
  [lastId, 20]
)

// ❌ O(n) - OFFSET이 커질수록 느림
const { rows: slow } = await pool.query(
  'SELECT id, name FROM products ORDER BY id ASC LIMIT $1 OFFSET $2',
  [20, offset]
)
```

**트랜잭션 (BEGIN / COMMIT / ROLLBACK):**
```javascript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  const { rows } = await client.query(
    'INSERT INTO markets (name, status) VALUES ($1, $2) RETURNING id',
    [marketData.name, marketData.status]
  )
  await client.query(
    'INSERT INTO positions (market_id, side, size) VALUES ($1, $2, $3)',
    [rows[0].id, positionData.side, positionData.size]
  )
  await client.query('COMMIT')
} catch (err) {
  await client.query('ROLLBACK')
  throw err
} finally {
  client.release()
}
```

### 안티패턴 감지

**인덱스 없는 외래 키 찾기:**
```sql
SELECT conrelid::regclass, a.attname
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );
```

**느린 쿼리 찾기:**
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;
```

**테이블 비대화 확인:**
```sql
SELECT relname, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### Prisma (미지향 — 요청 시에만 참고)

> 이 프로젝트의 **기본은 raw SQL (pg)** 입니다. 아래는 사용자가 Prisma 사용을 명시적으로 요청한 경우에만 참고할 대체 예시입니다.

**모델 정의:**
```prisma
model Market {
  id          String   @id @default(uuid())
  name        String   @db.Text
  status      String   @db.VarChar(20)
  volume      Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now()) @db.Timestamptz
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id])

  @@index([status])
  @@index([createdAt])
  @@index([creatorId])
}
```

**쿼리 최적화 / 관계 로딩:**
```javascript
// 필요한 필드만 선택
const markets = await prisma.market.findMany({
  select: { id: true, name: true, status: true },
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// include로 한 번에 조회 (JOIN) — N+1 방지
const withCreator = await prisma.market.findMany({ include: { creator: true } });
```

**UPSERT / 커서 페이지네이션 / 트랜잭션:**
```javascript
await prisma.settings.upsert({
  where: { userId_key: { userId: 123, key: 'theme' } },
  update: { value: 'dark' },
  create: { userId: 123, key: 'theme', value: 'dark' }
});

const products = await prisma.product.findMany({
  where: { id: { gt: lastId } },
  orderBy: { id: 'asc' },
  take: 20
});

await prisma.$transaction(async (tx) => {
  const market = await tx.market.create({ data: marketData });
  await tx.position.create({ data: { ...positionData, marketId: market.id } });
});
```

**마이그레이션:**
```bash
# 마이그레이션 생성
npx prisma migrate dev --name add_market_index

# 프로덕션 마이그레이션 적용
npx prisma migrate deploy

# 스키마와 DB 동기화 (개발 전용)
npx prisma db push

# 현재 DB에서 스키마 생성 (역방향)
npx prisma db pull
```

### 설정 템플릿

```sql
-- 연결 제한 (RAM에 맞게 조정)
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '8MB';

-- 타임아웃
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '30s';

-- 모니터링
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 보안 기본값
REVOKE ALL ON SCHEMA public FROM public;

SELECT pg_reload_conf();
```

### 쿼리 최적화 체크리스트

- [ ] 필요한 컬럼만 SELECT
- [ ] WHERE 절에 사용되는 컬럼에 인덱스
- [ ] JOIN 전에 데이터 필터링
- [ ] N+1 쿼리 방지 (JOIN 또는 배치 IN 조회 사용)
- [ ] LIMIT으로 결과 수 제한
- [ ] 커서 페이지네이션 사용 (OFFSET 대신)
- [ ] 트랜잭션으로 관련 작업 묶기

---

**참고**: `database-reviewer` 에이전트를 사용하면 전체 데이터베이스 리뷰 워크플로우를 실행할 수 있습니다.
