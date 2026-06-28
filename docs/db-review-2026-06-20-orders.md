# DB 리뷰 보고서 — orders 테이블

**리뷰 대상**: orders 테이블 스키마 + 쿼리 2건
**DB**: PostgreSQL (멀티테넌트 SaaS)
**리뷰 일시**: 2026-06-20

---

## 발견된 문제 목록

---

### [CRITICAL] orders 테이블 — RLS 미적용 (멀티테넌트 데이터 격리 실패)

현재:
```sql
-- RLS 설정 없음
```

개선:
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- Supabase 패턴
CREATE POLICY orders_tenant_policy ON orders
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 자체 인증 패턴
CREATE POLICY orders_tenant_policy ON orders
  FOR ALL
  USING ((SELECT current_setting('app.current_user_id'))::int = user_id);
```

이유: 멀티테넌트 SaaS에서 RLS 미적용은 애플리케이션 레이어 버그 한 줄로 모든 테넌트 데이터가 노출되는 치명적 보안 취약점이다. DB 레벨 강제 격리가 반드시 필요하다. `FORCE ROW LEVEL SECURITY`를 함께 설정해야 테이블 소유자(superuser 제외)에게도 정책이 적용된다.

---

### [CRITICAL] orders 테이블 — `amount float` 타입 사용 (금액 정밀도 손실)

현재:
```sql
amount float
```

개선:
```sql
amount numeric(12, 2)
```

이유: `float`은 IEEE 754 부동소수점으로 금액 계산 시 정밀도 손실이 발생한다. 예: `0.1 + 0.2 = 0.30000000000000004`. 주문 금액, 정산, 환불 계산에서 데이터 불일치가 누적된다. 금액 컬럼은 반드시 `numeric(precision, scale)`을 사용해야 한다.

---

### [CRITICAL] orders 테이블 — PRIMARY KEY `int` 타입 (21억 오버플로우 위험)

현재:
```sql
id int PRIMARY KEY
```

개선:
```sql
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

이유: SaaS 환경에서 주문 수는 빠르게 증가한다. `int`의 최대값은 약 21억(2,147,483,647)으로, 멀티테넌트 서비스에서 오버플로우 발생 시 삽입 실패 또는 ID 충돌이 발생한다. `bigint`는 약 922경까지 수용한다. `GENERATED ALWAYS AS IDENTITY`는 `SERIAL`보다 SQL 표준에 부합하며 시퀀스 조작 위험이 낮다.

---

### [HIGH] orders 테이블 — FK 컬럼 인덱스 전무 (풀 테이블 스캔)

현재:
```sql
-- user_id, product_id 인덱스 없음
SELECT * FROM orders WHERE user_id = 42 AND status = 'pending';
SELECT * FROM orders WHERE product_id = 10 ORDER BY created_at DESC;
```

개선:
```sql
-- 쿼리 1: user_id + status 복합 인덱스 (동등 조건 user_id 먼저, status 두 번째)
CREATE INDEX orders_user_id_status_idx ON orders (user_id, status);

-- 쿼리 2: product_id + created_at 복합 인덱스 (동등 조건 먼저, 정렬 컬럼 나중)
CREATE INDEX orders_product_id_created_at_idx ON orders (product_id, created_at DESC);
```

이유: 인덱스 없으면 모든 쿼리가 Seq Scan(풀 테이블 스캔)으로 실행된다. 주문 데이터가 수십만 건을 초과하면 응답 시간이 선형으로 증가한다. 복합 인덱스는 동등 조건 컬럼을 앞에, 범위/정렬 컬럼을 뒤에 배치해야 인덱스를 최대한 활용할 수 있다.

---

### [HIGH] orders 테이블 — `status` 컬럼 타입이 varchar (ENUM 또는 CHECK 제약 없음)

현재:
```sql
status varchar(20)
```

개선:
```sql
-- 방법 1: PostgreSQL ENUM (타입 안전, 빠름)
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded');

ALTER TABLE orders
  ALTER COLUMN status TYPE order_status USING status::order_status;

-- 방법 2: CHECK 제약 (유연, ENUM 추가가 잦을 때 선호)
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'));
```

이유: `varchar(20)`은 `'PENDING'`, `'Pending'`, `'pendig'` 등 잘못된 값이 DB에 저장되는 것을 막지 못한다. 멀티테넌트 환경에서 상태 불일치는 집계 오류로 이어진다. ENUM은 또한 스토리지 효율도 높다.

---

### [HIGH] orders 테이블 — `created_at timestamp` (타임존 정보 없음)

현재:
```sql
created_at timestamp
```

개선:
```sql
created_at timestamptz NOT NULL DEFAULT now()
```

이유: `timestamp`는 타임존 정보를 저장하지 않는다. 멀티테넌트 SaaS에서 테넌트가 여러 국가에 걸쳐 있으면 시간 데이터가 일관되지 않게 해석된다. `timestamptz`는 UTC로 저장하고 세션 타임존에 맞게 자동 변환한다. `DEFAULT now()`를 추가해 애플리케이션에서 누락 시 DB가 자동 설정한다.

---

### [HIGH] orders 테이블 — `updated_at` 컬럼 누락

현재:
```sql
-- updated_at 없음
```

개선:
```sql
updated_at timestamptz NOT NULL DEFAULT now()

-- 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

이유: 주문 상태 변경(pending → confirmed 등)이 발생하는 테이블에 `updated_at`이 없으면 변경 이력 추적, 캐시 무효화, 동기화 로직 구현이 불가능하다.

---

### [HIGH] 쿼리 패턴 — `SELECT *` 사용 (불필요한 컬럼 전송)

현재:
```sql
SELECT * FROM orders WHERE user_id = 42 AND status = 'pending';
SELECT * FROM orders WHERE product_id = 10 ORDER BY created_at DESC;
```

개선:
```sql
-- 필요한 컬럼만 명시
SELECT id, user_id, product_id, status, created_at, amount
FROM orders
WHERE user_id = 42 AND status = 'pending';

-- 커버링 인덱스 활용 가능한 형태
SELECT id, status, created_at
FROM orders
WHERE product_id = 10
ORDER BY created_at DESC;
```

이유: `SELECT *`는 스키마 변경 시 예상치 못한 컬럼이 애플리케이션으로 전달되고, 인덱스 온리 스캔(Index Only Scan) 최적화를 방해한다. 대용량 텍스트/JSONB 컬럼이 추가될 경우 네트워크 비용이 크게 증가한다.

---

### [MEDIUM] orders 테이블 — `user_id`, `product_id` FK 제약 없음

현재:
```sql
user_id int,
product_id int,
```

개선:
```sql
user_id bigint NOT NULL REFERENCES users(id),
product_id bigint NOT NULL REFERENCES products(id),
```

이유: FK 제약 없이 참조 무결성을 애플리케이션 레이어에만 의존하면 삭제된 사용자/상품을 참조하는 고아 레코드(orphan record)가 발생한다. FK 컬럼에는 NOT NULL도 함께 적용해야 한다.

---

### [MEDIUM] orders 테이블 — 소프트 삭제 패턴 미적용

현재:
```sql
-- deleted_at 없음
```

개선:
```sql
deleted_at timestamptz DEFAULT NULL

-- 활성 주문만 조회하는 뷰
CREATE VIEW active_orders AS
  SELECT * FROM orders WHERE deleted_at IS NULL;

-- 소프트 삭제 적용 시 부분 인덱스 활용
CREATE INDEX orders_active_user_status_idx
  ON orders (user_id, status)
  WHERE deleted_at IS NULL;
```

이유: SaaS 환경에서 주문 레코드를 물리 삭제하면 감사 로그, 환불 처리, 분쟁 해결 시 데이터 복구가 불가능하다. 부분 인덱스(`WHERE deleted_at IS NULL`)를 함께 사용하면 삭제 레코드를 인덱스에서 제외해 성능 저하 없이 소프트 삭제를 구현할 수 있다.

---

### [LOW] 향후 OFFSET 페이지네이션 위험 (선제 경고)

현재 쿼리에는 없지만, `ORDER BY created_at DESC` 패턴에서 향후 OFFSET 페이지네이션 적용 시 문제가 예상된다.

개선 (향후 페이지네이션 구현 시):
```sql
-- 피할 것: OFFSET은 데이터 증가 시 O(n) 스캔
-- SELECT * FROM orders WHERE product_id = 10
-- ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- 커서 기반 페이지네이션
SELECT id, status, created_at, amount
FROM orders
WHERE product_id = 10
  AND (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

이유: 주문 데이터가 수십만 건을 넘으면 OFFSET 방식은 이전 행을 모두 스캔하므로 성능이 선형 저하된다. 커서 기반 페이지네이션은 인덱스를 통해 항상 O(log n)으로 동작한다.

---

## 최종 스키마 개선안

```sql
-- ENUM 타입 정의
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'
);

-- 개선된 테이블 정의
CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id),
  product_id  bigint NOT NULL REFERENCES products(id),
  status      order_status NOT NULL DEFAULT 'pending',
  amount      numeric(12, 2) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz DEFAULT NULL
);

-- 인덱스 (소프트 삭제 부분 인덱스 적용)
CREATE INDEX orders_user_id_status_idx
  ON orders (user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX orders_product_id_created_at_idx
  ON orders (product_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY orders_tenant_policy ON orders
  FOR ALL
  USING ((SELECT current_setting('app.current_user_id'))::bigint = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 활성 주문 뷰
CREATE VIEW active_orders AS
  SELECT * FROM orders WHERE deleted_at IS NULL;
```

---

## 총 위반 요약

```
총 위반: CRITICAL 3 / HIGH 5 / MEDIUM 2 / LOW 1

CRITICAL 3건 존재.
CRITICAL 0건이 되어야 db-schema-architect MIGRATE 진행 가능.
```

| 등급 | 항목 |
|------|------|
| CRITICAL | RLS 미적용, float 금액 타입, int PK 오버플로우 위험 |
| HIGH | 인덱스 전무, status 타입 미검증, timestamp 타임존 없음, updated_at 누락, SELECT * |
| MEDIUM | FK 제약 없음, 소프트 삭제 미적용 |
| LOW | 향후 OFFSET 페이지네이션 위험 선제 경고 |

---

**마이그레이션 권고**: CRITICAL 3건 해소 후 db-schema-architect MIGRATE 모드 호출 권장.
입력: [이 리뷰 보고서] + [대상 스키마 파일 경로]
