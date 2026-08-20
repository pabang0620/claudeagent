# database-reviewer 참조: 데이터 접근 패턴

> `.claude/agents/database-reviewer.md` 의 참조 파일. 배치 삽입·N+1·커서 페이지네이션·derived table 전환을 제안할 때만 읽는다.

## 데이터 접근 패턴

### 1. 배치 삽입

**영향:** 대량 삽입 10-50배 빠름

```sql
-- ❌ 나쁨: 개별 삽입
INSERT INTO events (user_id, action) VALUES (1, 'click');
INSERT INTO events (user_id, action) VALUES (2, 'view');
-- 1000 번의 왕복

-- ✅ 좋음: 배치 삽입
INSERT INTO events (user_id, action) VALUES
  (1, 'click'),
  (2, 'view'),
  (3, 'click');
-- 1번의 왕복

-- ✅ 최고: 대형 데이터셋에 COPY
COPY events (user_id, action) FROM '/path/to/data.csv' WITH (FORMAT csv);
```

### 2. N+1 쿼리 제거

```bash
# 루프 내 await 쿼리 패턴 감지 (Node.js/Express)
grep -rEn \
  "for.*await.*find|forEach.*await.*query|map.*await.*select|for.*of.*await|reduce.*await.*push|Promise\.all.*\.map.*await" \
  backend/ src/ --exclude-dir=node_modules
```

```sql
-- ❌ 나쁨: N+1 패턴
SELECT id FROM users WHERE active = true;  -- 100개 ID 반환
-- 그 다음 100개 쿼리:
SELECT * FROM orders WHERE user_id = 1;
SELECT * FROM orders WHERE user_id = 2;
-- ... 98개 더

-- ✅ 좋음: ANY로 단일 쿼리
SELECT * FROM orders WHERE user_id = ANY(ARRAY[1, 2, 3, ...]);

-- ✅ 좋음: JOIN
SELECT u.id, u.name, o.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = true;
```

### 3. 커서 기반 페이지네이션

**영향:** 페이지 깊이와 관계없이 일관된 O(1) 성능

```sql
-- ❌ 나쁨: OFFSET은 깊이에 따라 느려짐
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 199980;
-- 200,000 행 스캔!

-- ✅ 좋음: 커서 기반 (항상 빠름)
SELECT * FROM products WHERE id > 199980 ORDER BY id LIMIT 20;
-- 인덱스 사용, O(1)
```

### 4. Correlated Subquery → Derived Table LEFT JOIN

**판별 기준:** `SELECT` 절 또는 `ORDER BY` 절 안에 `(SELECT ... WHERE 외부쿼리의_컬럼 = ...)` 형태가 있으면 correlated subquery다 — 행마다 반복 실행되어 느리다. MySQL/PostgreSQL 공통 패턴이며, `ROW_NUMBER() OVER (...)` 변환은 두 DB 모두 지원(MySQL 8.0+, PostgreSQL 전 버전)하므로 아래 레시피는 그대로 적용 가능하다.

**변환 레시피**

```sql
-- COUNT
-- ❌ before
SELECT w.title,
  (SELECT COUNT(*) FROM likes l WHERE l.target_id = w.id) AS like_count
FROM webtoons w

-- ✅ after
SELECT w.title, COALESCE(lk.like_count, 0) AS like_count
FROM webtoons w
LEFT JOIN (
  SELECT target_id, COUNT(*) as like_count
  FROM likes GROUP BY target_id
) lk ON lk.target_id = w.id
```

```sql
-- SUM
-- ❌ before
(SELECT SUM(e.view_count) FROM episodes e WHERE e.webtoon_id = w.id) AS total_views

-- ✅ after (LEFT JOIN + GROUP BY, SELECT에서 COALESCE(..., 0))
LEFT JOIN (
  SELECT webtoon_id, SUM(view_count) as total_views
  FROM episodes GROUP BY webtoon_id
) ev ON ev.webtoon_id = w.id
```

```sql
-- AVG
-- ❌ before
(SELECT ROUND(AVG(r.score), 1) FROM ratings r WHERE r.target_id = e.id) AS avg_rating

-- ✅ after (NULL 허용 — COALESCE 불필요, 평점 없음과 0점을 구분해야 하면 그대로 NULL 유지)
LEFT JOIN (
  SELECT target_id, ROUND(AVG(score), 1) as avg_rating
  FROM ratings GROUP BY target_id
) rt ON rt.target_id = e.id
```

```sql
-- CASE WHEN 다중 조건 집계 (같은 테이블을 여러 subquery가 반복 스캔하는 경우 하나로 합침)
-- ❌ before
(SELECT COUNT(*) FROM episodes e WHERE e.webtoon_id = w.id AND e.deleted_at IS NULL) as episode_count,
(SELECT COUNT(*) FROM episodes e WHERE e.webtoon_id = w.id AND e.published_at IS NULL) as unpublished_count,

-- ✅ after (단일 JOIN)
LEFT JOIN (
  SELECT webtoon_id,
    COUNT(*) as episode_count,
    COUNT(CASE WHEN published_at IS NULL THEN 1 END) as unpublished_count
  FROM episodes WHERE deleted_at IS NULL
  GROUP BY webtoon_id
) ep_stats ON ep_stats.webtoon_id = w.id
```

```sql
-- ROW_NUMBER (latest row 패턴 — "최근 메시지 1건" 등)
-- ❌ before
(SELECT content FROM messages m WHERE m.conv_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message

-- ✅ after (MySQL 8.0+ / PostgreSQL 공통)
LEFT JOIN (
  SELECT conv_id, content,
    ROW_NUMBER() OVER (PARTITION BY conv_id ORDER BY created_at DESC) as rn
  FROM messages
) last_msg ON last_msg.conv_id = c.id AND last_msg.rn = 1
```

**변환 금지 케이스 (레시피만큼 중요 — 변환하면 오히려 손해)**
- `WHERE EXISTS (SELECT 1 ...)` — 옵티마이저가 이미 잘 처리한다. derived table로 바꾸면 불필요한 GROUP BY 오버헤드만 추가됨.
- `WHERE col IN (SELECT id FROM lookup_table)` — lookup 대상이 소형 테이블이면 그대로 둔다.
- `COALESCE(cached_col, (SELECT ...))` 형태의 **캐시 폴백 subquery** — 캐시 컬럼이 채워져 있으면 subquery 자체가 실행되지 않는다(단락 평가). derived table JOIN으로 바꾸면 캐시 유무와 무관하게 매번 JOIN이 발생해 오히려 느려진다. 발견 시 주석으로 "캐시 폴백 — 변환 제외" 표시만 하고 건드리지 않는다.
- PK 조건으로 단일 행이 보장되는 subquery(`WHERE user_id = w.user_id` 등 UNIQUE/PK 컬럼 매칭) — JOIN으로 바꿔도 이론상 맞지만 성능 영향이 미미해 우선순위 낮음.

**변환 시 반드시 지킬 체크리스트 (필드명·파라미터 순서 보존)**
- [ ] 반환 필드명(AS 별칭) 변경 금지 — 호출부(Service/Controller)가 이 이름으로 필드에 접근하므로, 별칭을 바꾸면 조용히 `undefined`가 반환된다.
- [ ] COUNT/SUM은 `COALESCE(..., 0)`으로 NULL을 0으로 치환, AVG는 값 없음(NULL)과 0점을 구분해야 하면 COALESCE 하지 않는다.
- [ ] derived table 안에 새 `?`(MySQL) 또는 `$N`(PostgreSQL) 플레이스홀더가 생기면, 호출부에 전달하는 파라미터 배열의 **순서**를 그 위치에 맞게 조정한다 — 쿼리문만 바꾸고 파라미터 배열을 그대로 두면 다른 값이 바인딩된다.
- [ ] 기존 `WHERE`/`ORDER BY`/`LIMIT`/`OFFSET`/`GROUP BY` 절 유지.
- [ ] derived table alias 중복 금지(같은 쿼리 안에 alias 2개 필요하면 `lk1`, `lk2`로 구분).
- [ ] subquery 내부에 있던 `WHERE` 조건(예: `target_type = 'webtoon'`)은 derived table **내부**로 옮겨야 한다 — 바깥 JOIN 조건에 두면 결과 row 자체가 필터링되어 의미가 달라진다.
- [ ] 메인 쿼리에 이미 `GROUP BY`가 있었다면 JOIN 추가 후에도 유지되는지 확인한다.
