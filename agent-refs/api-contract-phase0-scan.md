# API 계약 Phase 0 사전 스캔 상세

api-contract-designer 참조. 원문 그대로 옮겼다(2026-09-29).

### Phase 0: 사전 스캔
```bash
# 프로젝트 구조 확인
ls backend/ frontend/src/ shared/ 2>/dev/null
cat package.json | head -30
find . -name "schemas" -type d 2>/dev/null
find . -name "mocks" -type d 2>/dev/null

# 우선순위 ①: 로컬 CLAUDE.md에 응답 shape이 이미 문서화되어 있는지 확인
if [ -f ".claude/CLAUDE.md" ]; then
  CLAUDE_MD_HIT=$(grep -inE "success|response.*(shape|format|포맷)|응답.*(shape|형식|포맷)" .claude/CLAUDE.md | head -10)
  if [ -n "$CLAUDE_MD_HIT" ]; then
    echo "① .claude/CLAUDE.md 에 응답 포맷 문서화 발견 - 이것이 최우선:"
    echo "$CLAUDE_MD_HIT"
  fi
fi

# 우선순위 ②: 기존 응답 유틸 모듈 탐색 (하드코딩 충돌 방지)
# 단순히 backend/*.js 만 보면 speetalk(src/shared/httpResponse.ts, backend/ 없음),
# cosmic-kuji-market(kuji-be/, NestJS) 같은 프로젝트를 놓치고 "없음"으로 오판한다.
# 저장소 전체(node_modules 제외)에서 이름·확장자 조합을 넓게 탐색한다.
RESPONSE_FILE=$(find . -path "*/node_modules" -prune -o \
  \( -iname "response.js" -o -iname "response.ts" \
     -o -iname "httpResponse.js" -o -iname "httpResponse.ts" \
     -o -iname "apiResponse.js" -o -iname "apiResponse.ts" \) \
  -print 2>/dev/null | head -1)

if [ -n "$RESPONSE_FILE" ]; then
  echo "② 응답 유틸 발견: $RESPONSE_FILE"
  RESPONSE_FUNCS=$(grep -E "^export (const|function)" "$RESPONSE_FILE" | sed -E "s/^export (const|function) ([a-zA-Z]+).*/\2/")
  echo "기존 응답 함수: $RESPONSE_FUNCS"
  echo "이 파일을 Read로 직접 열어 실제 응답 shape(필드명: message vs error 등)을 확인할 것 - 함수명만으로 shape 단정 금지"
else
  echo "② 응답 유틸 모듈을 찾지 못함 (response.*/httpResponse.*/apiResponse.* 미발견) - 신규 프로젝트로 간주하기 전에 ①(.claude/CLAUDE.md)도 비어 있는지 재확인할 것. 둘 다 없을 때만 신규 프로젝트 기본값(원칙 #2-③) 적용"
fi

# 도메인 폴더 구조 감지 (평면 vs 도메인드리븐)
CTRL_SAMPLE=$(find backend/ -name "*Controller.js" 2>/dev/null | head -1)
if [ -n "$CTRL_SAMPLE" ]; then
  if echo "$CTRL_SAMPLE" | grep -q "domains/"; then
    STRUCTURE="domain-driven"  # backend/src/domains/<domain>/
  else
    STRUCTURE="flat"           # backend/controllers/
  fi
  echo "폴더 구조: $STRUCTURE"
fi

# DB 연결 파일 + 변수명 감지
DB_FILE=$(find backend/ -name "database.js" -o -name "db.js" 2>/dev/null | head -1)
if [ -n "$DB_FILE" ]; then
  DB_VAR=$(grep -E "^export (const|default)" "$DB_FILE" | head -1)
  echo "DB 파일: $DB_FILE / export: $DB_VAR"
fi

# auth 미들웨어 req.user 필드 감지
AUTH_FILE=$(find backend/ -name "auth*.js" -path "*middleware*" 2>/dev/null | head -1)
if [ -n "$AUTH_FILE" ]; then
  USER_FIELDS=$(grep -oE "req\.user\.[a-z_]+" "$AUTH_FILE" | sort -u)
  echo "req.user 필드: $USER_FIELDS"
fi

# requireAdmin vs requireRole 관례 감지
ADMIN_PATTERN=$(grep -rh "requireAdmin\|requireRole" backend/ 2>/dev/null | head -1)
echo "관리자 권한 패턴: $ADMIN_PATTERN"

# URL 파라미터 camelCase vs snake_case 컨벤션
PARAM_SAMPLE=$(grep -rh "req\.params\." backend/ 2>/dev/null | head -5)
echo "param 샘플: $PARAM_SAMPLE"

# TypeScript 프로젝트 여부
if [ -f "frontend/tsconfig.json" ] || [ -f "tsconfig.json" ]; then
  USE_TS=true
else
  USE_TS=false
fi
echo "TypeScript: $USE_TS"

# *Validation.js 위치 확인 (기존 프로젝트 Zod 스키마 위치 패턴 감지)
VALIDATION_IN_DOMAIN=$(find backend/ -name "*Validation.js" 2>/dev/null | grep -c "domains/" || echo 0)
VALIDATION_IN_SHARED=$(find shared/ -name "*.ts" 2>/dev/null | grep -c "schemas/" || echo 0)

if [ "$VALIDATION_IN_DOMAIN" -gt 0 ]; then
  SCHEMA_LOCATION="domain"
  echo "스키마 위치: 도메인 폴더 내 *Validation.js (예: backend/src/domains/webtoon/webtoonValidation.js)"
elif [ "$VALIDATION_IN_SHARED" -gt 0 ]; then
  SCHEMA_LOCATION="shared"
  echo "스키마 위치: shared/schemas/ (프로젝트 최상위)"
else
  SCHEMA_LOCATION="shared"  # 신규 프로젝트 기본값
  echo "스키마 위치: 신규 - shared/schemas/ 기본 사용"
fi

# Validation 미들웨어 parse 패턴 감지
VALIDATE_PATTERN="body.parse"  # 기본값
if [ -f "backend/src/middleware/validationMiddleware.js" ]; then
  if grep -q "schema\.parse({ body" backend/src/middleware/validationMiddleware.js; then
    VALIDATE_PATTERN="wrapped"  # z.object({ body: ... }) 래핑 방식
  fi
fi
echo "validate 패턴: $VALIDATE_PATTERN"
```

확인 항목:
- `shared/schemas/` 존재 여부 (없으면 BOOTSTRAP 모드)
- Zod 설치 여부 (`zod` in package.json)
- 응답 유틸 존재 여부 (`backend/utils/response.js`)
- MSW 설치 여부 (`msw` in package.json)
- `USE_TS=false` 시 `.ts` 대신 `.js` 생성, Zod 스키마도 `.js` 형태로 export

### USE_TS=false 시 JavaScript 출력 가이드

TypeScript 프로젝트가 아닐 경우 (`USE_TS=false`):
- `.ts` → `.js` 파일명 사용
- `z.infer<typeof Schema>` → JSDoc `@typedef` 로 교체
- `import type` → 일반 `import` 사용

```javascript
// shared/constants/enums.js (JS 버전, USE_TS=false 시)
export const USER_STATUS = Object.freeze(['active', 'suspended', 'deleted'])
/** @typedef {'active'|'suspended'|'deleted'} UserStatus */
```

```javascript
// shared/schemas/webtoon.js (JS 버전)
import { z } from 'zod'
import { WEBTOON_STATUS } from '../constants/enums.js'

export const WebtoonSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200),
  status: z.enum(WEBTOON_STATUS),
})
// TypeScript 타입 없음 - JSDoc 사용 권장
/** @typedef {z.infer<typeof WebtoonSchema>} Webtoon */
```

**적응형 템플릿 결정 규칙**:
- `$STRUCTURE=domain-driven` → `backend/src/domains/<domain>/` 경로 사용
- `$STRUCTURE=flat` → `backend/controllers/`, `backend/routes/` 경로 사용
- `$RESPONSE_FUNCS` 에 `successResponse/errorResponse` 감지 시 → 그것들 사용, `ok/created` 금지
- `$DB_VAR` 에 default export (pool) 감지 시 → `import pool from ...` + `pool.query`
- `$USER_FIELDS` 에 `user_type/is_admin` 감지 시:
  → auth.js requireAdmin 함수 내부를 패턴 B로 치환하여 생성:
    `if (req.user?.user_type !== 'admin' || !req.user?.is_admin) return forbidden(res, '관리자 권한 필요')`
  그 외 (기본):
  → 패턴 A 유지: `if (req.user?.role !== 'admin') return forbidden(res, '관리자 권한 필요')`
- `$ADMIN_PATTERN` 이 `requireRole` 기반이면 → `requireRole('admin')` 사용
- PARAM 컨벤션이 camelCase (예: `req.params.webtoonUuid`) → 템플릿도 camelCase 통일

**응답 유틸 시그니처 매핑** (기존 프로젝트에 successResponse 등이 있을 때):

| 에이전트 템플릿 (flat) | WeCom / 기존 프로젝트 (감지된 경우) |
|---|---|
| `ok(res, data)` | `successResponse(res, data)` |
| `ok(res, items, meta)` | `paginatedResponse(res, items, meta)` |
| `created(res, data)` | `successResponse(res, data, 'created', 201)` |
| `noContent(res)` | `successResponse(res, null, '', 204)` |
| `notFound(res, msg)` | `errorResponse(res, msg ?? '리소스 없음', 404)` |
| `badRequest(res, err)` | `errorResponse(res, err, 400)` |
| `unauthorized(res, msg)` | `errorResponse(res, msg ?? '로그인 필요', 401)` |
| `forbidden(res, msg)` | `errorResponse(res, msg ?? '권한 없음', 403)` |
| `serverError(res, err)` | `errorResponse(res, err ?? '서버 오류', 500)` |

**원칙**: Phase 0 감지 결과가 `successResponse/errorResponse/paginatedResponse` 패턴이면 위 매핑대로 템플릿 치환. 새로 `response.js` 생성 시에만 `ok/created` 사용. 기존 파일 수정 금지.

**Zod 스키마 위치 결정**:
- `$SCHEMA_LOCATION=domain` → 기존 프로젝트 컨벤션 유지
  - 파일: `backend/src/domains/<domain>/<domain>Validation.js`
  - Zod 스키마를 named export 로 (예: `export const createWebtoonSchema = z.object({ body: ... })`)
  - TS 타입 export 는 동일 파일
  - `shared/schemas/` 폴더 생성 금지
- `$SCHEMA_LOCATION=shared` → 신규 프로젝트
  - `shared/schemas/<domain>.ts` 생성

