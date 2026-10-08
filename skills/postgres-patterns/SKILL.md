---
name: postgres-patterns
description: "PostgreSQL 데이터베이스 패턴, 쿼리 최적화, 스키마 설계, 인덱싱 - raw SQL(node-postgres/pg) 기본, Prisma는 요청 시에만. 적용 조건 - package.json에 `pg` 의존성이 있는 프로젝트 한정(예: modadam). MySQL 프로젝트(wecom·speetalk·cosmic-renew)에는 적용하지 않음"
---

# PostgreSQL 패턴

`pg` 의존 프로젝트(modadam 등)에서 SQL·스키마를 쓸 때 지키는 프로젝트 규칙. 일반 PostgreSQL 지식은 적지 않는다.

## 언제 활성화하나

- `pg` 의존 프로젝트에서 SQL 쿼리·마이그레이션·스키마를 쓰거나 고칠 때
- MySQL 프로젝트(wecom·speetalk·cosmic-renew)와 Prisma 프로젝트에는 적용하지 않는다

> **기본은 raw SQL (node-postgres/pg)이다.** 예시는 모두 parameterized pg 쿼리다. Prisma는 사용자가 명시적으로 요청한 프로젝트(ORM 관례를 따르는 cosmic-kuji-market 등)에서만 쓰고, 그 경우 이 스킬 대신 해당 프로젝트 CLAUDE.md를 따른다.

## 프로젝트 규칙

### 데이터 타입 (이 사용자의 선택)

| 용도 | 올바른 타입 | 피해야 할 타입 |
|------|------------|----------------|
| ID | 내부 PK `bigserial` + 외부 노출 `uuid` 컬럼(이중 ID) | 외부에 PK 직접 노출 |
| 문자열 | `text` | `varchar(255)` |
| 타임스탬프 | `timestamptz` | `timestamp` |
| 금액 | `numeric(10,2)` | `float` |
| 플래그 | `boolean` | `varchar`, `int` |

### raw SQL 형태 (node-postgres/pg)

**테이블 정의 (DDL):**
```sql
CREATE TABLE markets (
  id          bigserial PRIMARY KEY,
  uuid        uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  status      varchar(20) NOT NULL,
  volume      numeric(10, 2) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  creator_id  bigint NOT NULL REFERENCES users (id)
);

CREATE INDEX idx_markets_status ON markets (status);
CREATE INDEX idx_markets_created_at ON markets (created_at);
CREATE INDEX idx_markets_creator_id ON markets (creator_id);
```

**쿼리 형태 (파라미터 바인딩 강제, 문자열 연결 금지):**
```javascript
import { pool } from '../config/database.js'

// 좋은 예: 필요한 컬럼만 + 파라미터 바인딩 + LIMIT/OFFSET
const { rows: markets } = await pool.query(
  `SELECT id, name, status
   FROM markets
   WHERE status = $1
   ORDER BY created_at DESC
   LIMIT $2 OFFSET $3`,
  ['active', take, skip]
)

// 나쁜 예: 모든 컬럼 선택 + LIMIT 없음
const { rows: all } = await pool.query('SELECT * FROM markets')
```

### 그 밖의 규칙

- 마이그레이션은 raw SQL 스크립트 파일로 쓴다(ORM 마이그레이션 도구 금지). 스키마 설계·마이그레이션 파일 생성은 db-schema-architect 담당.
- 소프트삭제 컬럼(`deleted_at`)이 있는 테이블은 조회 인덱스를 `WHERE deleted_at IS NULL` 부분 인덱스로 만든다.
- UPSERT는 `ON CONFLICT (...)` 대상에 UNIQUE 제약이 실제로 있는지 스키마에서 확인한 뒤 쓴다.
- 인덱스·N+1·커서 페이지네이션 같은 일반 최적화는 모델 지식으로 처리하고 여기 적지 않는다. 기존 쿼리 감사는 database-reviewer.

---

**참고**: 기존 쿼리·인덱스·스키마 감사는 `database-reviewer` 에이전트, 신규 스키마 설계·마이그레이션 파일 생성은 `db-schema-architect` 에이전트가 담당한다(`rules/agents.md` STEP 1).
