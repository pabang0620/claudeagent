# database-reviewer 참조: PostgreSQL RLS

> `.claude/agents/database-reviewer.md` 의 참조 파일. **PostgreSQL 프로젝트에서만** 읽는다. MySQL 프로젝트에는 해당 없음.

## 보안 및 Row Level Security (RLS)

### RLS 적용 컨텍스트 판단 (먼저 확인)

| 컨텍스트 | 판단 기준 | RLS 누락 심각도 |
|---------|---------|--------------|
| 멀티테넌트 SaaS | 여러 조직/사용자의 데이터가 같은 테이블에 공존 | **CRITICAL** |
| 싱글테넌트 앱 | 단일 사용자 또는 내부 사용자만 접근 | MEDIUM |
| 관리자 전용 내부 툴 | 공개 접근 없음 | LOW |

RLS 누락을 CRITICAL로 보고하기 전, 스키마에서 멀티테넌트 여부를 먼저 확인한다 (user_id/tenant_id/org_id FK 패턴).

### 1. 다중 테넌트 데이터를 위한 RLS 활성화

**영향:** 치명적 - 데이터베이스 강제 테넌트 격리

```sql
-- ❌ 나쁨: 애플리케이션만의 필터링
SELECT * FROM orders WHERE user_id = $current_user_id;
-- 버그는 모든 주문이 노출됨을 의미!

-- ✅ 좋음: 데이터베이스 강제 RLS
-- ※ 전제 조건: 테넌트 격리 컬럼(user_id/tenant_id/org_id)이 테이블에 존재해야 RLS 적용 가능.
--   해당 컬럼 자체가 없으면 RLS 정책보다 먼저 [CRITICAL] 컬럼 부재로 보고한다.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- raw PostgreSQL 패턴 (WITH CHECK 필수 - INSERT/UPDATE 시 다른 테넌트 데이터 쓰기 차단)
CREATE POLICY orders_user_policy ON orders
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::bigint)
  WITH CHECK (user_id = current_setting('app.current_user_id')::bigint);

-- Supabase 패턴 ((SELECT ...) 래핑으로 캐싱 - 행마다 함수 호출 방지)
CREATE POLICY orders_user_policy ON orders
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

### RLS + RBAC 결합 패턴

```sql
-- PostgreSQL ROLE 기반 접근 제어와 RLS 결합
-- service_role은 RLS를 우회한다 - 백엔드 서버는 app_user 역할을 사용해야 함
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO app_user;

-- service_role(관리자/백엔드 직접 쿼리)은 RLS 정책 적용 제외
-- app_user(일반 사용자 연결)만 RLS 적용됨
GRANT ALL ON orders TO service_role;  -- RLS 우회
```

> 주의: `service_role` 자격증명을 프론트엔드에 노출하면 RLS 전체가 무력화됨. 반드시 서버 사이드에만 사용.

### 2. RLS 정책 최적화

**영향:** 5-10배 빠른 RLS 쿼리

```sql
-- ❌ 나쁨: 행마다 함수 호출
CREATE POLICY orders_policy ON orders
  USING (auth.uid() = user_id);  -- 100만 행에 대해 100만 번 호출!

-- ✅ 좋음: SELECT로 감싸기 (캐시됨, 한 번 호출)
CREATE POLICY orders_policy ON orders
  USING ((SELECT auth.uid()) = user_id);  -- 100배 빠름

-- 항상 RLS 정책 컬럼 인덱싱
CREATE INDEX orders_user_id_idx ON orders (user_id);
```
