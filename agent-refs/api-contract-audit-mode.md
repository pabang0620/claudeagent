# api-contract-designer: AUDIT 모드

> `.claude/agents/api-contract-designer.md` 의 모드 파일. 기존 API를 감사할 때만 읽는다.

## AUDIT 모드 - 기존 API 감사

**시작 전 필수**: 프로젝트 실제 폴더 구조 동적 탐지 (backend/src/domains 패턴 vs backend/controllers 평면 구조 모두 대응)

```bash
# Phase 0: 실제 경로 탐지
CONTROLLER_DIR=$(find backend/ -name "*Controller.js" -type f 2>/dev/null | head -1 | xargs -r dirname || echo "backend/controllers")
ROUTES_DIR=$(find backend/ -name "*Routes.js" -type f 2>/dev/null | head -1 | xargs -r dirname || echo "backend/routes")
echo "controllers=$CONTROLLER_DIR routes=$ROUTES_DIR"
```

```bash
# 하드코딩 도메인/포트 감지 (변경 시 반드시 실행)
grep -rE "(https?://[a-z0-9.-]+\.[a-z]{2,}|localhost:[0-9]{4})" \
  --include="*.ts" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.test.*" --exclude="*.spec.*" .

# insertId 단독 반환 탐지 (주석 제외)
grep -rn "insertId" "$CONTROLLER_DIR"/ | grep -v "^\s*//" | head -20

# 응답 포맷 미준수 (res.json 직접 호출)
grep -rn "res\.json" "$CONTROLLER_DIR"/ | grep -v "success" | head

# admin 파일 requireAdmin 누락 (convention-enforcer ce-002와 2중 방어)
grep -rL "requireAdmin\|requireRole.*admin" "$ROUTES_DIR"/ 2>/dev/null | grep -i admin

# FormData + Content-Type 오염 (uploadClient 외)
grep -rn "Content-Type.*json" frontend/src/api/ | grep -v uploadClient
```

### A. 라우트 등록 교차검증

라우트 파일은 존재하지만 엔트리포인트에서 실제로 마운트(`app.use()`)되지 않은 "죽은 엔드포인트"를 탐지한다.

```bash
ENTRY=$(find backend/ -maxdepth 3 \( -iname "app.js" -o -iname "index.js" \) 2>/dev/null | grep -v node_modules | head -1)
ROUTE_FILES=$(find backend/ \( -iname "*Routes.js" -o -iname "*routes.js" \) 2>/dev/null | grep -v node_modules)

for f in $ROUTE_FILES; do
  BASE=$(basename "$f" .js)
  IMPORTED=$(grep -rl "$BASE" backend/ --include="*.js" 2>/dev/null | grep -v "^$f$")
  if [ -z "$IMPORTED" ]; then
    echo "[CRITICAL] $f - 어디에서도 import되지 않음 (등록 누락 또는 죽은 파일)"
    continue
  fi
  # import는 됐는데 app.use()/router.use() 호출 흔적이 없는지 (휴리스틱)
  IMPORT_FILE=$(echo "$IMPORTED" | head -1)
  grep -q "use(" <(grep -A1 "$BASE" "$IMPORT_FILE") \
    || echo "[CRITICAL] $f - $IMPORT_FILE 에서 import는 되었으나 app.use()/router.use() 호출 확인 안 됨 (직접 Read로 재확인 필요)"
done
```

⚠️ 이 스크립트는 휴리스틱이다 - CRITICAL 판정 전 `$ENTRY` 파일을 Read로 직접 열어 실제 마운트 경로(`app.use('/api/webtoons', webtoonRoutes)`)를 육안 확인할 것.

### B. 응답 shape vs 소비부 불일치

⚠️ **하드코딩된 shape을 기준으로 삼지 않는다.** Phase 0에서 이미 확인한 **프로젝트 실측 응답 shape**(핵심 원칙 #2 - `$CLAUDE_MD_HIT`/`$RESPONSE_FILE`/`$RESPONSE_FUNCS`)을 기준으로, 백엔드가 실제로 내보내는 필드명과 프론트가 읽는 필드명이 그 기준과 어긋나는지만 검사한다. wecom·modadam(`{success,message,data,meta?}`)과 speetalk(`{success,data,error}`), cosmic-renew(`{success,data}`)는 shape이 다르므로 서로를 기준으로 판정하지 말 것.

```bash
# 1. 백엔드가 실제 내보내는 응답 함수 사용처
grep -rn "${RESPONSE_FUNCS:-successResponse\|paginatedResponse\|res\.json}" "$CONTROLLER_DIR"/ 2>/dev/null | head -30

# 2. 응답 유틸 함수 내부의 실제 반환 필드명 (message vs error, data 래핑 여부) - 직접 Read 권장
grep -A2 "^export" "$RESPONSE_FILE" 2>/dev/null

# 3. 프론트가 읽는 필드명 - api 클라이언트/훅의 .data.xxx / result.xxx 접근 패턴
grep -rnE "\.data\.[a-zA-Z_]+|res(ult)?\.[a-zA-Z_]+" frontend/src --include="api*.js" --include="use*.js" 2>/dev/null | head -30
```

**판정 기준**: 2번(실측 shape)과 3번(프론트 접근 패턴)을 나란히 비교 - 백엔드가 `{success,data,meta}`로 응답하는데 프론트가 `result.users`/`result.items`처럼 존재하지 않는 키에 접근하면 CRITICAL. 필드명 drift 감지 시 `db-schema-architect` 호출 권장(원칙 위 기존 규칙과 동일).

### C. 페이지네이션 meta 유실

목록(GET 컬렉션) 엔드포인트를 대상으로 (1) 백엔드가 `total/page/limit`(또는 `meta`)을 응답에 포함하는지, (2) 프론트가 그 meta를 실제로 소비하는지 교차 확인한다.

```bash
# meta/total 없이 배열만 반환하는 목록 컨트롤러
grep -rLE "meta|total" "$CONTROLLER_DIR"/*.js 2>/dev/null | xargs -r grep -l "^export const list\|findAll\|\.list ="

# API 함수가 meta를 버리는 패턴 (return data.data만)
grep -rn "return data\.data\b" frontend/src --include="api*.js" 2>/dev/null

# 프론트가 meta를 쓰는 곳 (있다면 위 패턴과 충돌)
grep -rln "\.meta\.\|totalPages" frontend/src --include="use*.js" 2>/dev/null
```

**판정 기준**: 프론트에 페이지 번호·"더보기"·총 개수 UI가 있는데 API 함수가 meta를 버리면 → HIGH. 단순 목록 렌더링뿐이고 그런 UI가 없으면 meta 누락은 지적하지 않음(불필요한 노이즈 방지).

### D. 업로드 용량 정합성

결과만 나열하지 말고 **계산 과정을 리포트에 포함**할 것.

**D1. rate limit / body limit vs 실제 업로드 패턴**
```bash
grep -rn "rateLimit(" backend/ --include="*.js" 2>/dev/null | grep -v node_modules
grep -rn "express\.json(\|bodyParser\.json(" backend/ --include="*.js" 2>/dev/null
grep -rn "MAX_.*FILE\|maxFiles\|multiple" frontend/src --include="*.jsx" --include="*.js" 2>/dev/null | head
```
- `업로드 1회당 API 요청 수 × 최대 동시/연속 업로드 개수 ≤ rateLimiter.max`(같은 windowMs 내). 예: 파일당 개별 POST 방식으로 30장을 올리면 `max ≥ 30 + 여유분` 필요 - 미달이면 정상 사용 중 429 발생(CRITICAL).
- `express.json` limit은 파일 바이너리는 포함하지 않음(multer가 별도 스트림 처리) - 단 URL 배열/텍스트 필드를 JSON body로 함께 보내는 엔드포인트는 `필드 개수 × 평균 길이`로 추정해 limit과 비교, 부족하면 413(HIGH).

**D2. S3 URL 저장 컬럼 길이**
```bash
grep -rniE "url.*varchar\(([0-9]+)\)" wecom_schema.sql backend/**/*.sql 2>/dev/null
grep -rn "s3.*[Kk]ey\|buildS3Key" backend/ --include="*.js" 2>/dev/null | head
```
- 실제 생성되는 S3 URL 길이 = `버킷 도메인(https://{bucket}.s3.{region}.amazonaws.com/ 또는 CloudFront 도메인) + 폴더 경로(예: webtoons/{uuid}/{uuid}/episodes/) + 파일명(uuid+확장자)` 합산으로 실측 → `VARCHAR(500)` 같은 컬럼과 비교.
- presigned URL(쿼리스트링 포함)을 저장하는 경우 500자를 쉽게 초과 - 별도 확인 필요. 초과 위험 있으면 CRITICAL(런타임에 조용히 truncate되어 깨진 URL 저장).

**탐지 후 처리**:
1. 결과를 심각도 분류 (`CRITICAL / HIGH / MEDIUM`) 후 사용자에게 보고
2. **자동 수정 금지** - 감사 결과는 목록화만. 실제 수정은 사용자 승인 후 진행 (CLAUDE.md 승낙 원칙)
3. 필드명 drift 감지 시 `db-schema-architect` 호출 권장

**심각도 분류 예시**:
```
[CRITICAL] backend/src/domains/webtoon/webtoonController.js:45 - insertId 단독 반환, 전체 재조회 누락
[HIGH]     backend/src/domains/admin/adminNoticeRoutes.js - requireAdmin 미사용 (convention-enforcer 부팅 검증과 2중 방어)
[MEDIUM]   frontend/src/api/webtoon.ts:12 - FormData에 JSON Content-Type 오염 가능성
```

**Fix-priority (여러 항목 발견 시 처리 순서)** - 상위 항목을 고치지 않으면 하위 항목 검증 자체가 무의미해지는 순서:

| 순위 | 카테고리 | 이유 |
|---|---|---|
| 1 | A. 라우트 등록 누락 | 엔드포인트 자체가 죽어있으면 그 아래 응답/페이지네이션 검증이 무의미 |
| 2 | B. 응답 shape vs 소비부 불일치(CRITICAL급 - 존재하지 않는 키 접근) | 런타임에 undefined로 화면이 비거나 크래시 |
| 3 | D. 업로드 용량 정합성(rate/body limit, S3 URL 컬럼) | 정상 사용 패턴에서 429/413/URL 손실 발생 |
| 4 | requireAdmin 누락·insertId 단독 반환 등 기존 체크리스트 | GENERATE 모드가 예방하는 패턴의 회귀 여부 확인 |
| 5 | C. 페이지네이션 meta 유실 | UI에 실사용처 없으면 후순위로 미뤄도 되는 폴리시 항목 |
