# db-schema-architect: MIGRATE 모드

> `.claude/agents/db-schema-architect.md` 의 모드 파일. 마이그레이션 파일을 생성할 때만 읽는다.

### MIGRATE 모드 — 마이그레이션 파일 생성

기존 스키마에 변경이 필요할 때:

**원칙**:
- `wecom_schema.sql` 직접 수정 금지 — 반드시 `migrations/YYYYMMDD_HHMM_<desc>.sql` 파일 생성
- 롤백 가능하도록 `-- DOWN` 섹션 포함
- 운영 DB 영향 평가: 락 유발(ALTER), 다운타임 필요 여부 주석

### DOWN 섹션 필수 (롤백 보장)

모든 마이그레이션 파일에 DOWN 섹션을 반드시 포함한다:

```sql
-- UP
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);

-- DOWN (롤백 시 실행, 순서는 UP의 역순)
ALTER TABLE users DROP COLUMN display_name;
```

**DOWN 작성 원칙:**
- ADD COLUMN → DROP COLUMN
- CREATE TABLE → DROP TABLE
- CREATE INDEX → DROP INDEX
- ADD CONSTRAINT → DROP CONSTRAINT
- 데이터 손실이 발생하는 DOWN은 `-- ⚠️ 데이터 손실 주의: 롤백 전 백업 필수` 주석 추가
- ENUM 값 제거는 안전한 롤백 불가 → `-- DOWN: ENUM 값 제거 불가, 수동 절차 필요` 기록

#### 패턴 0: 컬럼 RENAME (예약어 충돌 수정)
```sql
-- ======================================================================
-- 패턴 0: 컬럼 RENAME (예약어 충돌 수정) — MySQL 8.0.4+ 지원
-- ALGORITHM=INPLACE, LOCK=NONE 가능 (무락 DDL)
-- ⚠️ 애플리케이션 코드(Repository SQL, Zod 스키마) 동시 수정 필수
-- ======================================================================

-- UP
ALTER TABLE results
  RENAME COLUMN `rank` TO award_rank,
  ALGORITHM=INPLACE, LOCK=NONE;

-- 애플리케이션 코드 수정 안내:
-- 1. grep -rn 'rank' backend/repositories/ 로 참조 전수 탐색
-- 2. Repository SQL, Zod 스키마, 프론트 타입 동시 수정
-- 3. 코드 배포 후 마이그레이션 실행

-- DOWN
ALTER TABLE results
  RENAME COLUMN award_rank TO `rank`,
  ALGORITHM=INPLACE, LOCK=NONE;
```

#### 패턴 1: 인덱스 추가 (안전, 무락)
```sql
-- ==========================================================================
-- Migration: 20260409_1430_add_webtoon_view_count_index
-- 영향: webtoons 인덱스 추가. ALGORITHM=INPLACE, LOCK=NONE 지원 → 무락
-- ==========================================================================

-- UP
ALTER TABLE webtoons
  ADD INDEX idx_webtoon_view_count (view_count DESC),
  ALGORITHM=INPLACE, LOCK=NONE;

-- DOWN
-- ALTER TABLE webtoons DROP INDEX idx_webtoon_view_count;
```

#### 패턴 2: ENUM 값 추가 (끝에 추가 = INSTANT, 무락)
```sql
-- ==========================================================================
-- Migration: 20260409_1500_add_webtoon_status_enum_value
-- 영향: webtoons.status ENUM **끝에** 값 추가.
--   ✅ ALGORITHM=INSTANT 가능 (운영 락 없음, 즉시 반영)
--   ⚠️ 중간 삽입 또는 기존 값 제거 시 ALGORITHM=COPY (테이블 풀 락 → 다운타임)
-- ==========================================================================

-- UP: 기존 값 전체 + 신규 값 (기존 값 순서 유지 필수)
ALTER TABLE webtoons
  MODIFY COLUMN status ENUM('draft','scheduled','published','archived','deleted') NOT NULL DEFAULT 'draft',
  ALGORITHM=INSTANT;

-- shared/constants/enums.ts 동시 수정 필수
-- export const WEBTOON_STATUS = ['draft','scheduled','published','archived','deleted'] as const
-- (api-contract-designer 에게 위임: Zod 스키마는 enums.ts 를 import 하여 자동 동기화)

-- DOWN: ⚠️ 위험 — ENUM 값 제거는 해당 값 보유 row 를 '' (빈 문자열)로 변환하는 파괴적 동작
-- 1) 롤백 전 반드시 확인:
--    SELECT COUNT(*) FROM webtoons WHERE status = 'archived';
--    -- 위 count가 0 이 아니면 롤백 금지 또는 값 마이그레이션 먼저 수행
-- 2) 안전 확인 후에만:
-- ALTER TABLE webtoons
--   MODIFY COLUMN status ENUM('draft','scheduled','published','deleted') NOT NULL DEFAULT 'draft';
```

#### ENUM ALTER 안전 절차 (운영 DB 무중단)

```sql
-- ⚠️ MySQL ENUM ALTER: 운영 DB에서 잠금 발생 가능
-- 안전한 COPY 방식 (무중단)
-- 1. 새 ENUM 값 추가 (기존 값 마지막에 추가는 즉시 적용)
ALTER TABLE orders MODIFY COLUMN status ENUM('pending','processing','completed','cancelled','refunded') NOT NULL DEFAULT 'pending';
-- 2. 삭제 또는 순서 변경은 테이블 재빌드 필요 → pt-online-schema-change 또는 gh-ost 권장
-- 3. ENUM 순서 변경 시 반드시 shared/constants/enums.ts 동시 업데이트 (ENUM SSOT 원칙)

-- ⚠️ ALGORITHM=COPY 시 LOCK=NONE 사용 불가 (MySQL 제약)
-- COPY는 테이블 전체 재빌드 → 배타 락(LOCK=EXCLUSIVE) 발생 불가피
-- 대안: gh-ost 또는 pt-online-schema-change 사용 (무중단 대규모 변경)
```

#### 패턴 3: 컬럼 추가 (NULL 허용 = INSTANT)
```sql
-- UP: NULL 허용 컬럼은 INSTANT 가능
ALTER TABLE webtoons
  ADD COLUMN subtitle VARCHAR(300) NULL AFTER title,
  ALGORITHM=INSTANT;
-- DOWN
-- ALTER TABLE webtoons DROP COLUMN subtitle;
```

#### 패턴 4: NOT NULL 컬럼 추가 (MySQL 버전별 전략)
```sql
-- 패턴 4: NOT NULL 컬럼 추가 (MySQL 버전별 전략)
-- ✅ MySQL 8.0.29+ : NOT NULL + DEFAULT 컬럼 추가 시 ALGORITHM=INSTANT 가능
--    → WeCom(MySQL 8.4) 은 INSTANT 사용 가능, 운영 락 없이 추가
-- ⚠️ MySQL 8.0.12 ~ 8.0.28 : NOT NULL 은 ALGORITHM=INPLACE (테이블 락 발생 가능)
--    → 2단계 배포 권장: (1) NULL 허용 컬럼 추가 + 백필 → (2) NOT NULL 전환
-- ⚠️ MySQL 5.7 이하 : 항상 ALGORITHM=COPY (테이블 풀 락, 다운타임)

-- WeCom 예시 (MySQL 8.4, INSTANT 사용):
ALTER TABLE webtoons
  ADD COLUMN original_language VARCHAR(10) NOT NULL DEFAULT 'ko' AFTER title,
  ALGORITHM=INSTANT;
```

#### 트랜잭션 가이드
- **DDL (ALTER/CREATE/DROP TABLE)** 는 MySQL에서 **암묵적 COMMIT** — 트랜잭션 롤백 불가
- 마이그레이션 파일에 여러 DDL 이 있을 경우 각 DDL 을 독립 실행 가능하게 설계 (중간 실패 시 이전 DDL 은 이미 적용됨)
- **DML 백필**(예: UPDATE ... SET ... WHERE)만 포함된 단계는 `START TRANSACTION; ... COMMIT;` 래핑 가능
- 다중 테이블 연관 변경 시 **순서 설계**:
  1. 새 컬럼 추가 (NULL 허용) — 기존 코드 영향 없음
  2. 백필 DML — 트랜잭션으로 래핑 가능
  3. NOT NULL 전환 — 모든 코드가 새 컬럼 쓰는지 확인 후
  4. 구 컬럼 DROP — 충분한 배포 검증 후

#### 다중 테이블 CASCADE 삭제 정책
WeCom은 FK 미사용이므로 CASCADE는 애플리케이션 레이어 책임:
- `{domain}s` 가 소프트 삭제(`deleted_at` 설정)될 때 관련 `{domain}_files`, `{domain}_logs`, `{domain}_entries` 도 함께 `deleted_at` 설정하는 트랜잭션 필요
- Service 계층에서 `await db.beginTransaction()` → 여러 UPDATE → `commit()` 패턴
- cron 배치로 `deleted_at < NOW() - INTERVAL 30 DAY` 인 행 물리 삭제 고려

#### 자기검증 (MIGRATE 모드)
- UP/DOWN 섹션 모두 존재 여부
- ALGORITHM 명시 (INSTANT/INPLACE/COPY) + LOCK 레벨
- ENUM 변경 시 enums.ts 동시 수정 안내 주석 포함
- DOWN 섹션에 데이터 파괴 경고 포함 (해당 시)
- **컬럼 추가 시 해당 테이블의 모든 INSERT/UPDATE 호출부를 grep해 컬럼 목록에 포함시켰는지 확인** — SELECT만 확인하고 넘어가면, 신규 레코드가 DB 기본값으로 조용히 저장되고 에러가 나지 않아 발견이 늦어진다.
  ```bash
  # 컬럼명으로 INSERT/UPDATE 호출부 전수 탐색 (Repository 계층)
  grep -rn "INSERT INTO webtoons\|UPDATE webtoons" backend/repositories/ | grep -v "is_public"
  # → is_public 을 포함하지 않는 INSERT/UPDATE 문이 나오면 누락 의심, 해당 파일 직접 확인
  ```
  WeCom 회고: `1b64853`(createWebtoon INSERT에서 is_public 누락 → 비공개 설정이 무시됨), `a562ea2`(comments_enabled 동일 패턴)
