# db-schema-architect: REVIEW 모드

> `.claude/agents/db-schema-architect.md` 의 모드 파일. 기존 스키마를 감사할 때만 읽는다.

### REVIEW 모드 - 기존 스키마 감사

> 이 모드는 설계·마이그레이션 직전의 자체 사전점검용이다. 설계 맥락 없는 독립 스키마·쿼리 감사 요청은 database-reviewer 로 위임한다.

```bash
# 0. 스키마 파일 동적 탐색
SCHEMA_FILE=$(find . -name "*.sql" -path "*schema*" | head -1)
if [ -z "$SCHEMA_FILE" ]; then
  echo "스키마 파일을 찾을 수 없습니다. 경로를 지정해주세요."
  exit 1
fi
echo "REVIEW 대상 파일: $SCHEMA_FILE"
# 이후 모든 grep/awk에서 wecom_schema.sql → "$SCHEMA_FILE" 으로 사용

# .claude/db-review-reports/ 내 리뷰 보고서는 스캔에서 제외
grep -rE "ENUM|FOREIGN KEY" --include="*.sql" --exclude-dir=".claude" .

# 1. 예약어 충돌 (공식 목록 기반, ERE + 백틱 지원) - status 는 비예약이므로 제외
# ※ 이 grep이 기준 패턴 - DESIGN 자기검증 grep과 동일한 목록 유지 필수
grep -iEn "(^|,)[[:space:]]*\`?(rank|order|group|key|desc|read|value|values|match|condition|interval|event|over|window|groups|rows|lead|lag|dense_rank|row_number|cume_dist|percent_rank|first_value|last_value|nth_value|system|current|usage|recursive|precision|function|procedure|trigger|primary|unique)\`?[[:space:]]+(INT|BIGINT|VARCHAR|CHAR|DATETIME|TIMESTAMP|ENUM|TINYINT|SMALLINT|TEXT|DECIMAL|JSON|BOOLEAN|FLOAT|DOUBLE)" "$SCHEMA_FILE"
# event # 비예약어이지만 혼동 방지를 위해 포함

# 2. 이중 ID 미준수 테이블 (gawk/mawk 공통 방식)
# POSIX 호환 주의: Ubuntu 기본 AWK(mawk)는 3-arg match() 미지원
# match($0, /pat/, arr) 대신: match($0, /pat/) 후 substr($0, RSTART, RLENGTH) 사용
awk '/^CREATE TABLE/{
  if (match($0, /CREATE TABLE[[:space:]]+(IF NOT EXISTS[[:space:]]+)?`?[a-z_][a-z0-9_]*`?/)) {
    cur = substr($0, RSTART, RLENGTH); sub(/.*[[:space:]]/, "", cur); gsub(/`/, "", cur)
  }
  has_uuid = 0
}
/CHAR\(36\).*UNIQUE/{ has_uuid = 1 }
/^\);/{
  if (!has_uuid && cur != "") print "NO_UUID: " cur
  cur = ""
}' "$SCHEMA_FILE"

# 3. deleted_at 누락 테이블 (로그·pivot·인증·설정 테이블 제외)
ALL_TABLES=$(grep -E "^CREATE TABLE" "$SCHEMA_FILE" \
  | sed -E 's/CREATE TABLE (IF NOT EXISTS )?[`"]?([a-z0-9_]+)[`"]?.*/\2/i' \
  | grep -vE "(_logs$|_genres$|_skills$|_tags$|email_verifications|phone_verifications|password_reset_tokens|social_accounts|user_notification_settings|file_uploads|admin_logs|ratings|likes)")
TABLES_WITH_DELETED=$(awk '/^CREATE TABLE/{ if (match($0, /CREATE TABLE[[:space:]]+(IF NOT EXISTS[[:space:]]+)?`?[a-z_][a-z0-9_]*`?/)) { cur = substr($0, RSTART, RLENGTH); sub(/.*[[:space:]]/, "", cur); gsub(/`/, "", cur) } } /deleted_at/{print cur}' "$SCHEMA_FILE" | sort -u)
echo "=== deleted_at 누락 테이블 (예외 제외 후) ==="
comm -23 <(echo "$ALL_TABLES" | sort -u) <(echo "$TABLES_WITH_DELETED")

# 4. JSON 컬럼 잔존 (audit_logs 외)
grep -iEn "^[[:space:]]+[a-z0-9_]+[[:space:]]+JSON([[:space:]]|,|$)" "$SCHEMA_FILE" | grep -v "audit_log"

# 5. Polymorphic VARCHAR target_type
grep -iEn "target_type[[:space:]]+VARCHAR" "$SCHEMA_FILE"

# 6. 픽셀 SMALLINT 잔존
grep -iEn "(width|height|pixel|size)[[:space:]]+SMALLINT" "$SCHEMA_FILE"

# 7. TINYINT role (ENUM 권장)
grep -iEn "[[:space:]]role[[:space:]]+TINYINT" "$SCHEMA_FILE"

# 8. FK 인덱스 누락 (CHAR(36) 참조 컬럼 vs INDEX 매칭)
awk '/^CREATE TABLE/{
  if (match($0, /CREATE TABLE[[:space:]]+(IF NOT EXISTS[[:space:]]+)?`?[a-z_][a-z0-9_]*`?/)) { cur = substr($0, RSTART, RLENGTH); sub(/.*[[:space:]]/, "", cur); gsub(/`/, "", cur) }
  for (k in fks) delete fks[k]; for (k in indexed) delete indexed[k]
}
/CHAR\(36\)/{
  if (match($0, /[a-z_]+_id/) && !/UNIQUE/) {
    fkcol = substr($0, RSTART, RLENGTH)
    if (fkcol != cur"_id") fks[fkcol] = 1
  }
}
/INDEX[[:space:]]+idx_/{
  if (match($0, /\(([a-z_,[:space:]]+)\)/)) {
    cols_str = substr($0, RSTART+1, RLENGTH-2)
    n = split(cols_str, cols, /[,[:space:]]+/)
    for (i=1;i<=n;i++) if (cols[i] != "") indexed[cols[i]] = 1
  }
}
/^\);/{
  for (col in fks) if (!(col in indexed)) print "FK_NO_IDX: " cur "." col
  cur = ""
}' "$SCHEMA_FILE"

# 9. UNIQUE KEY 누락 탐지 (likes, comments, reactions 같은 폴리모픽 테이블)
grep -iEn "UNIQUE KEY|UNIQUE INDEX" "$SCHEMA_FILE"

# 10. 로그 테이블 updated_at 금지 위반 (테이블당 1회만 출력)
awk '/^CREATE TABLE[[:space:]]+(IF NOT EXISTS[[:space:]]+)?`?[a-z_]+_logs`?/{inlog=1; lname=$0; warned=0; next}
     inlog && /updated_at/ && !warned {print "WARN: 로그테이블 updated_at 위반 - " lname; warned=1}
     /^\);/{inlog=0; warned=0}' "$SCHEMA_FILE"
```

#### REVIEW 리포트 포맷
```
🔍 스키마 감사 리포트

[CRITICAL]
- 예약어 충돌: results.rank (라인 142)
  → award_rank 또는 rank_position 으로 변경 권장

[HIGH]
- deleted_at 누락 테이블: comments, likes, admin_genres
- JSON 컬럼 잔존: webtoons.genre_tags (정규화 필요)

[MEDIUM]
- FK 인덱스 누락: episodes.webtoon_id
- 이중 ID 미준수: tags (UUID 컬럼 없음)

[LOW]
- admin_users.role TINYINT - ENUM 마이그레이션 권장
- images.width SMALLINT - 픽셀 4096 초과 가능성, INT UNSIGNED 권장

총 위반: critical 1 / high 3 / medium 2 / low 2
```

#### REVIEW 완료 후 처리

CRITICAL/HIGH 항목 발견 시 → MIGRATE 모드로 전환하여 수정 파일 생성:
- 예약어 충돌: `RENAME COLUMN` 마이그레이션 필요
- deleted_at 누락: `ADD COLUMN deleted_at DATETIME NULL` 마이그레이션
- JSON 컬럼 잔존: 정규화 마이그레이션 (복잡도 높음 - planner 먼저 협의)

REVIEW 결과를 사용자에게 보고 후 MIGRATE 진행 여부 확인 필수.

#### 알려진 예외 (LOW 분류)

WeCom wecom_schema.sql 의 기존 위반 중 설계 의도된 예외:

| 위반 | 사유 | 분류 |
|---|---|---|
| `admin_logs.target_type VARCHAR(100)` | 감사 로그 특성상 어떤 엔티티든 기록 가능해야 함. ENUM 으로 제한 시 신규 도메인 로깅 누락 위험 | LOW - 기존 유지 |
| `ai_shorts_requests.result_files JSON` | AI 결과 파일 URL 배열 (가변 개수). 정규화 테이블 오버엔지니어링 | LOW - 기존 유지 |
| `admin_logs.detail JSON` | 감사 로그 (원칙 6 명시 예외) | 정상 |

REVIEW 스크립트가 이 3건을 탐지하면 자동으로 LOW 로 분류. 신규 도메인에는 여전히 원칙 적용.
