---
name: postgres-patterns
description: PostgreSQL 데이터베이스 패턴, 쿼리 최적화, 스키마 설계, 인덱싱, Prisma ORM 활용법
---

# PostgreSQL 패턴

PostgreSQL 베스트 프랙티스 빠른 참조 가이드

## 언제 활성화하나

- SQL 쿼리 또는 마이그레이션 작성 시
- 데이터베이스 스키마 설계 시
- 느린 쿼리 트러블슈팅 시
- Prisma ORM 사용 시
- 커넥션 풀링 설정 시

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

### Prisma 패턴

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

**쿼리 최적화:**
```javascript
// ✅ 좋은 예: 필요한 필드만 선택
const markets = await prisma.market.findMany({
  select: {
    id: true,
    name: true,
    status: true
  },
  where: { status: 'active' },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// ❌ 나쁜 예: 모든 필드 선택
const markets = await prisma.market.findMany();
```

**관계 로딩:**
```javascript
// ✅ include로 한 번에 조회 (JOIN)
const markets = await prisma.market.findMany({
  include: {
    creator: true
  }
});

// ❌ N+1 쿼리 문제
const markets = await prisma.market.findMany();
for (const market of markets) {
  market.creator = await prisma.user.findUnique({
    where: { id: market.creatorId }
  });
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

**UPSERT (Prisma):**
```javascript
await prisma.settings.upsert({
  where: {
    userId_key: {
      userId: 123,
      key: 'theme'
    }
  },
  update: {
    value: 'dark'
  },
  create: {
    userId: 123,
    key: 'theme',
    value: 'dark'
  }
});
```

**커서 페이지네이션:**
```javascript
// ✅ O(1) - OFFSET보다 빠름
const products = await prisma.product.findMany({
  where: {
    id: { gt: lastId }
  },
  orderBy: { id: 'asc' },
  take: 20
});

// ❌ O(n) - 느림
const products = await prisma.product.findMany({
  skip: offset,
  take: 20
});
```

**트랜잭션:**
```javascript
await prisma.$transaction(async (tx) => {
  const market = await tx.market.create({ data: marketData });
  await tx.position.create({
    data: { ...positionData, marketId: market.id }
  });
});
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

### Prisma 마이그레이션

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
- [ ] N+1 쿼리 방지 (include/select 사용)
- [ ] LIMIT으로 결과 수 제한
- [ ] 커서 페이지네이션 사용 (OFFSET 대신)
- [ ] 트랜잭션으로 관련 작업 묶기

---

**참고**: `database-reviewer` 에이전트를 사용하면 전체 데이터베이스 리뷰 워크플로우를 실행할 수 있습니다.
