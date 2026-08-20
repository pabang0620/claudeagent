# db-schema-architect: DESIGN 모드

> `.claude/agents/db-schema-architect.md` 의 모드 파일. 신규 도메인 스키마를 설계할 때만 읽는다.

### DESIGN 모드 - 신규 도메인 스키마 생성

#### 입력 수집
1. **도메인 이름** - 예: `webtoon`, `event`, `notification`
   ⚠️ 입력 받은 도메인 이름을 즉시 예약어 블랙리스트와 대조 - 충돌 시 사용자에게 대체명 제안 후 중단

   사용자가 대체명 확정 시:
   → 확정된 이름을 {domain}으로 치환하여 입력 수집 2번(엔티티 목록)부터 재개
   → notifications.target_type ENUM의 도메인 참조값도 대체명으로 수정 필요 여부 확인

2. 엔티티 목록 + 관계
3. 상태 머신 여부 (로그테이블 필요 판단)
4. 알림 필요 여부 (notifications 연계)
5. 파일 첨부 유형 (이미지/동영상/문서 → 전용 테이블 or FK)

#### 출력 1: `migrations/YYYYMMDD_HHMM_<domain>.sql`

**템플릿**:
```sql
-- ==========================================================================
-- {domain} 도메인 스키마
-- 생성일: YYYY-MM-DD
-- ==========================================================================

-- 상태 ENUM은 shared/constants/enums.ts 와 동기화 필수
-- ENUM 목록:
--   {domain}_status: draft, scheduled, published, deleted
--   ...

CREATE TABLE IF NOT EXISTS {domain}s (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  {domain}_id    CHAR(36) NOT NULL UNIQUE COMMENT 'UUID - 애플리케이션에서 생성 (uuid.v4()). MySQL 8.0.13+ 에서는 DEFAULT (UUID()) 사용 가능',

  -- 핵심 컬럼
  title          VARCHAR(200) NOT NULL,
  author_id      CHAR(36) NOT NULL COMMENT 'users.user_id 참조 (FK는 애플리케이션 레이어)',
  summary        TEXT NULL,
  cover_image_url VARCHAR(500) NULL,

  -- 상태
  status         ENUM('draft','scheduled','published','deleted') NOT NULL DEFAULT 'draft',
  published_at   DATETIME NULL,

  -- 집계 캐시 (백엔드에서 주기적 갱신)
  view_count     INT UNSIGNED NOT NULL DEFAULT 0,
  like_count     INT UNSIGNED NOT NULL DEFAULT 0,

  -- 타임스탬프 + 소프트삭제 (모든 테이블 필수)
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME NULL,

  -- 인덱스 디폴트
  INDEX idx_{domain}_author (author_id),
  INDEX idx_{domain}_status_deleted (status, deleted_at),
  INDEX idx_{domain}_published (published_at DESC),
  INDEX idx_{domain}_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 상태 로그 (append-only, updated_at 금지)
CREATE TABLE IF NOT EXISTS {domain}_logs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  log_id         CHAR(36) NOT NULL UNIQUE,
  {domain}_id    CHAR(36) NOT NULL,
  prev_status    ENUM('draft','scheduled','published','deleted') NULL,
  next_status    ENUM('draft','scheduled','published','deleted') NOT NULL,
  changed_by     CHAR(36) NOT NULL,
  changed_by_type ENUM('user','admin','system') NOT NULL,
  reason         VARCHAR(500) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_{domain}_logs_target ({domain}_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 출력 2: `shared/constants/enums.ts` 패치
```typescript
// 파일이 없으면 생성, 있으면 병합
export const WEBTOON_STATUS = ['draft', 'scheduled', 'published', 'deleted'] as const
export type WebtoonStatus = typeof WEBTOON_STATUS[number]

// Zod 사용 시:
// z.enum(WEBTOON_STATUS) 로 참조
```

#### 출력 2-b: 파일 첨부 테이블 (이미지/동영상/문서 첨부 요청 시)
```sql
-- 도메인에 파일 첨부가 있으면 별도 테이블로 분리 (1:N 관계)
-- append-only 전략: 파일 교체 시 기존 row 삭제(deleted_at 설정) 후 신규 INSERT
-- updated_at 컬럼 의도적 제외 (파일 메타데이터는 수정 대상이 아닌 불변 레코드)
CREATE TABLE IF NOT EXISTS {domain}_files (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_id         CHAR(36) NOT NULL UNIQUE,
  {domain}_id     CHAR(36) NOT NULL COMMENT '{domain}s.{domain}_id 참조',
  file_type       ENUM('image','document','video','audio') NOT NULL,
  file_url        VARCHAR(500) NOT NULL,
  original_name   VARCHAR(200) NOT NULL,
  mime_type       VARCHAR(100) NOT NULL,
  file_size       INT UNSIGNED NOT NULL COMMENT '바이트',
  width           INT UNSIGNED NULL COMMENT '이미지/비디오만',
  height          INT UNSIGNED NULL COMMENT '이미지/비디오만',
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL,
  INDEX idx_{domain}_files_domain ({domain}_id, sort_order),
  INDEX idx_{domain}_files_type (file_type, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**선택**: 단일 대표 이미지 1개만 필요한 경우 `{domain}s.cover_image_url VARCHAR(500)` 컬럼으로 처리. 복수 파일은 위 테이블 사용.

#### 출력 3: 알림 동시 설계 (필요 시)
```sql
-- notifications 가 없으면 함께 생성
CREATE TABLE IF NOT EXISTS notifications (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  notification_id CHAR(36) NOT NULL UNIQUE,
  user_id        CHAR(36) NOT NULL,
  -- Polymorphic: VARCHAR 금지, ENUM 명시
  target_type    ENUM('webtoon','episode','comment','event','admin_notice') NOT NULL,
  target_id      CHAR(36) NOT NULL,
  message        VARCHAR(500) NOT NULL,
  is_read        TINYINT(1) NOT NULL DEFAULT 0,
  read_at        DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at     DATETIME NULL,
  INDEX idx_notif_user_unread (user_id, is_read, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_notification_settings (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        CHAR(36) NOT NULL UNIQUE,
  push_enabled   TINYINT(1) NOT NULL DEFAULT 1,
  email_enabled  TINYINT(1) NOT NULL DEFAULT 1,
  -- 카테고리별 on/off 는 별도 테이블 user_notification_category_settings 로 분리
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## notifications.target_type ENUM 갱신 (신규 도메인 시 필수)
notifications 테이블이 이미 존재하는 경우:
```sql
ALTER TABLE notifications
  MODIFY COLUMN target_type ENUM('webtoon','episode','comment','event','admin_notice','{domain}')
  NOT NULL,
  ALGORITHM=INSTANT;
```
shared/constants/enums.ts의 NOTIFICATION_TARGET_TYPE 상수도 동시 갱신 필수

---

## 자기검증 체크리스트 (DESIGN 모드 완료 시)

```bash
# 1. 예약어 사용 여부 (REVIEW grep과 동일한 완전한 목록 유지 - 기준 패턴과 항상 동기화)
grep -iEn "^[[:space:]]+\`?(rank|order|group|key|desc|read|value|values|match|condition|interval|event|over|window|groups|rows|lead|lag|dense_rank|row_number|cume_dist|percent_rank|first_value|last_value|nth_value|system|current|usage|recursive|precision|function|procedure|trigger|primary|unique)\`?[[:space:]]+(INT|BIGINT|VARCHAR|CHAR|DATETIME|TIMESTAMP|ENUM|TINYINT|SMALLINT|TEXT|DECIMAL|JSON|BOOLEAN|FLOAT|DOUBLE)" migrations/<new-file>.sql
# event # 비예약어이지만 혼동 방지를 위해 포함

# 2. 이중 ID 준수 (ERE + 다중 공백 대응)
grep -cE "CHAR\(36\)[[:space:]]+NOT NULL[[:space:]]+UNIQUE" migrations/<new-file>.sql   # 테이블 개수와 일치해야

# 3. 타임스탬프 3종 (ERE 플래그 - 크로스 플랫폼 호환)
grep -cE "(created_at|updated_at|deleted_at)" migrations/<new-file>.sql

# 4. JSON 컬럼 0 (audit_logs 예외)
grep -iE "^\s+\w+\s+JSON\b" migrations/<new-file>.sql | grep -v audit

# 5. ENUM 정의와 enums.ts 동기
grep -E "ENUM\('([^']+)'" migrations/<new-file>.sql
# ↑ 출력된 값들이 shared/constants/enums.ts 에 있는지 확인

# 6. utf8mb4_unicode_ci 설정
grep -c "utf8mb4_unicode_ci" migrations/<new-file>.sql

# 7. 인덱스 디폴트 - 최소 1개 이상
grep -c "INDEX idx_" migrations/<new-file>.sql
```

모든 체크가 통과되어야 DESIGN 완료로 판정.

---
