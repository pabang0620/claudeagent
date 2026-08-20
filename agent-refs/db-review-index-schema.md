# database-reviewer 참조: 인덱스·스키마 설계 패턴

> `.claude/agents/database-reviewer.md` 의 참조 파일. 인덱스나 컬럼 타입·기본키 전략을 지적할 때만 읽는다.

## 인덱스 패턴

### 1. WHERE 및 JOIN 컬럼에 인덱스 추가

**영향:** 대형 테이블에서 100-1000배 빠른 쿼리

```sql
-- ❌ 나쁨: 외래 키에 인덱스 없음
CREATE TABLE orders (
  id bigint PRIMARY KEY,
  customer_id bigint REFERENCES customers(id)
  -- 인덱스 누락!
);

-- ✅ 좋음: 외래 키에 인덱스
CREATE TABLE orders (
  id bigint PRIMARY KEY,
  customer_id bigint REFERENCES customers(id)
);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

### 2. 적절한 인덱스 타입 선택

| 인덱스 타입 | 사용 사례 | 연산자 |
|------------|----------|-----------|
| **B-tree** (기본) | 동등, 범위 | `=`, `<`, `>`, `BETWEEN`, `IN` |
| **GIN** | 배열, JSONB, 전문 검색 | `@>`, `?`, `?&`, `?\|`, `@@` |
| **BRIN** | 대형 시계열 테이블 | 정렬된 데이터의 범위 쿼리 |
| **Hash** | 동등만 | `=` (B-tree보다 약간 빠름) |

```sql
-- ❌ 나쁨: JSONB 포함에 B-tree
CREATE INDEX products_attrs_idx ON products (attributes);
SELECT * FROM products WHERE attributes @> '{"color": "red"}';

-- ✅ 좋음: JSONB에 GIN
CREATE INDEX products_attrs_idx ON products USING gin (attributes);
```

### 3. 다중 컬럼 쿼리를 위한 복합 인덱스

**영향:** 다중 컬럼 쿼리 5-10배 빠름

```sql
-- ❌ 나쁨: 별도 인덱스
CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_created_idx ON orders (created_at);

-- ✅ 좋음: 복합 인덱스 (동등 컬럼 먼저, 그 다음 범위)
CREATE INDEX orders_status_created_idx ON orders (status, created_at);
```

## 스키마 설계 패턴

### 1. 데이터 타입 선택

```sql
-- ❌ 나쁨: 잘못된 타입 선택
CREATE TABLE users (
  id int,                           -- 21억에서 오버플로우
  email varchar(255),               -- 인위적 제한
  created_at timestamp,             -- 타임존 없음
  is_active varchar(5),             -- boolean이어야 함
  balance float                     -- 정밀도 손실
);

-- ✅ 좋음: 적절한 타입
CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  balance numeric(10,2)
);
```

### 2. 기본 키 전략

```sql
-- ✅ 단일 데이터베이스: IDENTITY (기본, 권장)
CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);

-- ✅ 분산 시스템: UUIDv7 (시간 순서)
CREATE EXTENSION IF NOT EXISTS pg_uuidv7;
CREATE TABLE orders (
  id uuid DEFAULT uuid_generate_v7() PRIMARY KEY
);

-- ❌ 피할 것: 랜덤 UUID는 인덱스 조각화 유발
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY  -- 조각난 삽입!
);
```
