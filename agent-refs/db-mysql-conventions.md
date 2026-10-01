# 사용자 MySQL 설계 컨벤션 (database-reviewer 참조)

MySQL 프로젝트 감사 시 읽는다. 원문 그대로 옮겼다(2026-09-29).

## 사용자 DB 설계 컨벤션 (MySQL 프로젝트 시 반드시 적용)

### ID 구조 (이중 ID 패턴)
```sql
id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY  -- 내부 인덱스 전용
{table}_id  CHAR(36) NOT NULL UNIQUE                 -- UUID, 외부 식별자
-- FK 참조는 UUID 컬럼으로 (애플리케이션 레이어에서 UUID 사용)
```

### 공통 컬럼 (모든 테이블 필수)
```sql
created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 소프트 삭제
- 실제 DELETE 사용 안 함 - `deleted_at` 설정 또는 `status` 변경으로 처리
- `deleted_at DATETIME` : NULL이면 정상, 값 있으면 소프트 삭제
- comments처럼 구조 보존 필요 시 `is_deleted TINYINT(1)` 사용 (행 유지, 내용 마스킹)
- users는 `status = 'deleted'` + `deleted_at` 병행 사용

### 로그 테이블 (status 변경이 중요한 엔티티 필수)
대상: 돈(정산), 계약(지원), 심사(공모전), 회원 상태
```sql
{entity}_logs
  prev_status      -- 이전 상태
  next_status      -- 변경 후 상태
  changed_by       CHAR(36)                          -- 변경 주체 UUID
  changed_by_type  ENUM('user','admin','system')
  reason           VARCHAR(500)                      -- 변경 사유
```

### 비회원(Guest) 처리
- 비회원은 DB에 저장하지 않음 - user_type ENUM에 추가 금지
- 비회원 허용 기능(열람, view_count 증가): 백엔드에서 `user_id = null`로 처리
- 좋아요·댓글·별점 등 상호작용: 로그인 필수 (부정 방지)

### view_count 관리
- `view_count INT UNSIGNED` 컬럼을 테이블에 직접 보유
- 캐시 컬럼 추가 없이 백엔드(Redis 등)에서 집계·캐싱 처리 후 주기적 DB 반영

### JSON 사용 지양
- 관리자에서 관리 가능한 데이터는 별도 테이블로 설계
- JSON은 고정값 데이터나 외부 API 응답 저장 등 제한적으로만 사용

### 기능 명세 기반 설계
- 기능명세서에 없는 기능 테이블 추가 금지
- 추후 확장 가능성이 있어도 현재 명세 기준으로만 설계

### DB 엔진 및 문자셋 (MySQL)
```sql
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
-- MySQL 8.0+
```

### 로그 테이블 구조 (append-only 엄수)
- `updated_at` 절대 추가 금지 - 로그는 수정하지 않는다
- `created_at` 만 보유
- 대상: `*_logs` 패턴 테이블 전체

### 관리자 관리 테이블 네이밍
- 관리자 페이지에서 설정/수정하는 마스터·설정 테이블: `admin_` 접두사 필수
- 예: `admin_genres`, `admin_universities`, `admin_banners`, `admin_notices`, `admin_job_skills`
- 일반 도메인 테이블은 접두사 없이 복수형 (`webtoons`, `users`, `episodes`)

### 통합 테이블 설계 선호
- 유사한 구조는 별도 테이블 대신 `type` 컬럼으로 통합
  ```sql
  -- ✅ 좋음: 하나의 conversations 테이블
  conversation_type ENUM('offer','job_application')
  -- ❌ 나쁨: offers 테이블 + job_applications 테이블 분리
  ```
- 행사/대회/전시 → `events` 하나로 + 플래그 컬럼으로 구분
  ```sql
  allows_work_submission       TINYINT(1) DEFAULT 0
  allows_company_participation TINYINT(1) DEFAULT 0
  ```

### 폴리모픽 테이블 (comments, likes, ratings)
```sql
target_type  ENUM('webtoon','webtoon_episode','comment', ...)  -- 명시적 ENUM 사용
target_id    CHAR(36) NOT NULL                                 -- 대상 UUID
```
- 무한 확장 가능한 VARCHAR 대신 ENUM으로 허용 타입 제한

### 댓글 depth 제한
```sql
depth  TINYINT UNSIGNED NOT NULL DEFAULT 0
-- 0: 최상위, 1: 대댓글, 2: 대댓글의 대댓글 (최대 depth=2)
-- depth >= 3 쓰기 백엔드에서 거부
```

### 좋아요 reaction_type
```sql
reaction_type  ENUM('like','dislike') NOT NULL DEFAULT 'like'
```
- 단순 좋아요만 있는 경우에도 나중 확장 고려해 ENUM 사용

### 별점 단위
- 별점은 **에피소드 단위** (`target_type = 'webtoon_episode'`)
- 작품(webtoon) 단위 별점 없음 - 집계는 백엔드에서 episode 평균으로 표시

### Phase 기반 설계 원칙
- Phase 1~2 범위 외 기능 테이블은 추가하지 않음
- 결제·정산(settlements) = Phase 3 → 현재 스키마에 FK 연결만 준비, 구현 보류
- "나중에 필요할 것 같아서" 테이블 추가 금지 - 기능명세서 기준

### 이미지 크기 컬럼 타입 (MySQL)
- width/height: `INT UNSIGNED` 사용 (SMALLINT 금지 - 65535 초과 가능. WeCom `images.width SMALLINT` → `INT UNSIGNED` 후행 변경 발생)

### MySQL 8 예약어 블랙리스트
컬럼/테이블명에 다음 사용 금지 (백틱으로도 피할 것):
- 기획 흔한: `rank`→award_rank, `order`→sort_order, `group`→group_name, `key`→key_name, `desc`→description, `read`→read_at, `value`→value_text, `match`→match_score, `condition`→condition_text, `interval`→time_interval
- 윈도우 함수: `over`, `window`, `lead`, `lag`, `dense_rank`, `row_number`, `cume_dist`, `percent_rank`
- 시스템: `system`, `current`, `usage`, `recursive`, `precision`, `function`, `procedure`, `trigger`
- 근거: WeCom `event_results.rank` 컬럼이 2회 수정됨 (`1275e75`, `6ceae13`)

### ENUM 단일 소스 원칙 (SSOT)
- DB `ENUM('a','b','c')` 정의 시 반드시 `shared/constants/enums.ts` 에도 동일 값 export
- Zod 스키마는 `enums.ts` 에서 import 하여 `z.enum(DOMAIN_STATUS)` 형태로만 참조
- DB↔코드 ENUM 수기 동기화 금지 - WeCom 에서 ENUM drift 8건 발생

### FK 미사용 시 리스크 (WeCom 회고)
- FK 없으면 존재하지 않는 컬럼 참조 버그 발생 가능 (WeCom 3건: `author_note`, `deleted_at`, `start_date→started_at`)
- 보완: `schema-drift-auditor` 또는 유사 스키마↔코드 정합성 검증 도구 함께 사용 권장


## MySQL 진단 쿼리

```sql
-- MySQL: FK 인덱스 누락 확인
SELECT
  kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE kcu
LEFT JOIN information_schema.STATISTICS s
  ON s.TABLE_SCHEMA = kcu.TABLE_SCHEMA
  AND s.TABLE_NAME  = kcu.TABLE_NAME
  AND s.COLUMN_NAME = kcu.COLUMN_NAME
WHERE kcu.TABLE_SCHEMA = DATABASE()
  AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
  AND s.INDEX_NAME IS NULL;

-- MySQL: ENUM drift 확인 (DB ENUM 값 추출)
SHOW COLUMNS FROM {table} LIKE '{column}'\G
-- 출력의 Type 필드와 shared/constants/enums.ts 배열을 수동 비교
-- 불일치 발견 시 [CRITICAL] ENUM drift 로 보고

-- MySQL: 슬로우 쿼리 로그 활성화 여부 확인
SHOW VARIABLES LIKE 'slow_query_log%';
SHOW VARIABLES LIKE 'long_query_time';
```

## PostgreSQL 진단 명령

```bash
# pg_stat_statements 설치 여부 확인 후 분기
PG_STAT=$(psql "$DATABASE_URL" -Atc "SELECT COUNT(*) FROM pg_extension WHERE extname='pg_stat_statements';" 2>/dev/null || echo "0")
if [ "$PG_STAT" = "1" ]; then
  psql "$DATABASE_URL" -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
else
  echo "WARN: pg_stat_statements 미설치 - pg_stat_activity로 대체"
  psql "$DATABASE_URL" -c "SELECT query, state, wait_event_type FROM pg_stat_activity WHERE state = 'active';"
fi

# 테이블 크기 확인
psql "$DATABASE_URL" -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;"

# 인덱스 사용 확인
psql "$DATABASE_URL" -c "SELECT indexrelname, idx_scan, idx_tup_read FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"

# 외래 키에 누락된 인덱스 찾기
psql "$DATABASE_URL" -c "SELECT conrelid::regclass, a.attname FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) WHERE c.contype = 'f' AND NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey));"
```

## MySQL ALTER TABLE 잠금 특성 (운영 DB 변경 리뷰 시 보고서 말미에 포함)

- `ADD COLUMN NULL`: ALGORITHM=INSTANT (무락, MySQL 8.0.12+)
- `ADD COLUMN NOT NULL DEFAULT`: ALGORITHM=INSTANT (MySQL 8.0.29+)
- `ENUM 끝에 값 추가`: ALGORITHM=INSTANT
- `ENUM 중간 삽입/제거`: ALGORITHM=COPY (테이블 풀 락!)
- `ADD INDEX`: ALGORITHM=INPLACE, LOCK=NONE
- `DROP COLUMN`: ALGORITHM=INPLACE, LOCK=NONE (MySQL 8.0.29+)
