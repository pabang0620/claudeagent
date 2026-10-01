# db-schema-architect 참조 - MySQL 8 예약어 블랙리스트

db-schema-architect 정의파일에서 옮긴 내용이다(2026-10-01 prompt-audit). 정의파일이 가리킬 때만 읽는다.

## 1. MySQL 8 예약어 블랙리스트 (공식 목록 기준)

## MySQL 8 예약어 블랙리스트 (공식 목록 기준)

MySQL 8.0/8.4 공식 Reserved Words 중 **컬럼/테이블명에서 자주 충돌**하는 것들. 감지 시 error + 대체어 제안:

### 기획·도메인 흔한 단어 (최우선 차단)
```
rank        → award_rank, ranking, rank_position
order       → sort_order, display_order, order_no
group       → group_name, category_group
key         → key_name, api_key, access_key
desc        → description, sort_desc
read        → read_at, is_read, read_status
status      → MySQL 8.0/8.4 비예약 키워드 (예약어 아님). 일부 ORM (Sequelize v6) 에서 오탐 가능, 백틱 사용 권장
value       → value_text, item_value, numeric_value
values      → value_list
match       → match_score, similarity_score
condition   → condition_text, requirement, condition_name
interval    → time_interval, period
event       → event_entry, event_record, webtoon_event (테이블명), ev_type (컬럼명)
```

### 윈도우 함수·계산식 관련
```
over              → overlap, override_value
window            → window_name, time_window
groups            → group_list
rows              → row_list
lead / lag        → next_value, prev_value
dense_rank        → dense_rank_position
row_number        → row_number_position
cume_dist         → cumulative_distribution
percent_rank      → percent_rank_value
first_value       → first_val
last_value        → last_val
nth_value         → nth_val
```

### 시스템·타입·문법 키워드
```
system      → system_name, sys_type
current     → current_value, cur_state (CURRENT_TIMESTAMP 충돌)
usage       → usage_count, used_amount
recursive   → is_recursive
precision   → decimal_precision
function    → function_name
procedure   → procedure_name
trigger     → trigger_name
primary     → is_primary (PRIMARY KEY 충돌)
unique      → is_unique
```

### 공식 참조
- <https://dev.mysql.com/doc/refman/8.0/en/keywords.html>
- <https://dev.mysql.com/doc/mysqld-version-reference/en/keywords-8-4.html>

### Grep 검증 (ERE 플래그로 크로스 플랫폼)
```bash
grep -iEn "(^|,)[[:space:]]*\`?(rank|order|group|key|desc|read|value|values|match|condition|interval|event|over|window|groups|rows|lead|lag|dense_rank|row_number|cume_dist|percent_rank|first_value|last_value|nth_value|system|current|usage|recursive|precision|function|procedure|trigger|primary|unique)\`?[[:space:]]+(INT|BIGINT|VARCHAR|CHAR|DATETIME|TIMESTAMP|ENUM|TINYINT|SMALLINT|TEXT|DECIMAL|JSON|BOOLEAN|FLOAT|DOUBLE)" <대상파일>
# event # 비예약어이지만 혼동 방지를 위해 포함
```
**중요**: `` `rank` INT `` 처럼 백틱으로 감싸도 감지되도록 `\`?` 포함.
