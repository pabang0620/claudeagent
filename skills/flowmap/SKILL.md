---
name: flowmap
description: >
  프로젝트를 정적 스캔해 데이터 흐름을 클릭 가능한 단일 HTML 지도로 만든다.
  플로우 → 그 플로우의 API 목록 → API별 요청/응답 데이터 예시까지 3단 드릴다운.
  AI가 만들어 놓은 코드를 사람이 빠르게 파악하려는 상황이 주 용도다.
  "데이터플로우 그려줘", "이 프로젝트 구조 파악해줘", "API 뭐뭐 있는지 보여줘",
  "flowmap", "/flowmap <경로>" 요청 시 사용한다.
  대상 프로젝트의 코드는 절대 수정하지 않는다(읽기 전용).
version: 1.0.0
model: sonnet
allowed-tools: Bash, Read, Grep, Glob, Agent
---

# flowmap

## 스캐너가 읽을 수 있는 형태

스택 제한이 아니라 **정규식이 알아보는 코드 모양**의 문제다. 아래 형태면 읽는다.

| 대상 | 읽는 모양 |
|---|---|
| 라우트 정의 | `app/router/*Router` 의 `.get/.post/.put/.patch/.delete('경로', ...)` |
| 라우트 마운트 | 같은 객체의 `.use('접두사', 하위라우터)` |
| DB 접근 | 코드 안의 SQL 문자열 (`FROM` `JOIN` `INSERT INTO` `UPDATE ... SET` `DELETE FROM`) |
| 프론트 호출 | `apiClient/api/axios/http.get('경로')` 또는 `fetch('경로', {method})` |
| 요청 스키마 | `validate(xxxSchema)` 또는 `z.object({...})` |
| 응답 컬럼 | `.sql` 파일의 `CREATE TABLE` |

이 중 없는 것은 그 항목만 비고 나머지는 나온다. 라우트를 하나도 못 읽으면
아래 "검출 실패 시" 절차를 따른다. **못 읽는다고 지어내지 않는다.**

## 무엇을 만드는가

대상 프로젝트 루트에 `flowmap.html` 하나를 만든다. 외부 의존성 없는 단일 파일이라
브라우저로 바로 열린다. 데이터는 HTML 안에 인라인된다.

```
좌측  플로우 목록 (주문 / 회원 / 상품 …) + 점검 항목
본문  화면 → API → DB 테이블 다이어그램 + 그 플로우의 API 표
모달  API 클릭 → 요청 예시 / 응답 예시 / DB / 호출 화면
```

## 절차

### 1. 대상 경로 확정
인자가 있으면 그 경로, 없으면 현재 작업 디렉토리. 절대경로로 확정한다.

### 2. 스캔 (LLM 호출 없음)
```bash
node <스킬경로>/scripts/scan.mjs <대상경로>
```
`<대상경로>/flowmap.graph.json` 이 생기고, 표준출력으로 요약 지표가 JSON으로 나온다.
**이 요약만 읽는다. graph.json 전문을 Read 하지 않는다** (수천 줄이라 컨텍스트가 낭비된다).

### 3. 결과 판정

| 상황 | 조치 |
|---|---|
| `endpoints`가 실제 라우트 수의 90% 이상 | 4번으로 진행 |
| `endpoints`가 0이거나 현저히 적음 | 아래 "검출 실패 시"로 |
| `unresolved`가 20건 초과 | flowmap-resolver 에이전트 병렬 스폰 |

실제 라우트 수는 이 명령으로 빠르게 대조한다.
```bash
grep -rEo "\b(app|router|[A-Za-z0-9_]*[Rr]outer)\.(get|post|put|patch|delete)\(" \
  --include=*.js <대상경로> | grep -v node_modules | wc -l
```

### 4. 렌더
```bash
node <스킬경로>/scripts/render.mjs <대상경로>/flowmap.graph.json
```

### 5. 보고
요약 지표와 `flowmap.html` 경로만 보고한다. 파일 내용을 출력하지 않는다.

## 검출 실패 시

`endpoints`가 0이면 라우트 등록 방식이 스캐너가 아는 형태와 다른 것이다.
직접 고치려 하지 말고 먼저 실제 형태를 1개만 확인한다.

```bash
grep -rn "\.get(\|\.post(\|\.use(" --include=*.js <백엔드경로> | grep -v node_modules | head -5
```

- 라우터 변수명이 `app`/`router`/`*Router` 가 아니면 `scripts/lib/backend.mjs`의
  `ROUTER_OBJ` 에 추가한다.
- 엔트리 파일이 `app.js`/`server.js`/`routes/index.js` 가 아니면 `scanBackend`의
  `entries` 필터에 추가한다.
- **그 외의 이유라면 스캐너를 추측으로 고치지 말고 사용자에게 실제 구조를 보고한다.**

## flowmap-resolver 에이전트

`unresolved` 항목이 많을 때만 쓴다. 항목을 파일 단위로 쪼개 **병렬로** 스폰하고,
각 에이전트에는 담당 파일 절대경로와 해당 항목만 전달한다. 반환된 JSON 조각을
`graph.json` 에 병합한 뒤 4번(렌더)을 다시 실행한다.

## 금지

- 대상 프로젝트의 코드를 수정하지 않는다. 산출물은 `flowmap.graph.json` 과 `flowmap.html` 뿐이다.
- 소스 파일 전문을 메인 컨텍스트로 올리지 않는다. 탐색이 필요하면 에이전트에 위임한다.
- 스캐너가 못 잡은 것을 지어내서 채우지 않는다. `unresolved` 로 남기는 것이 정답이다.
- 기존 `flowmap.html` 이 있으면 덮어쓰기 전에 알린다.

## 구조

| 파일 | 역할 |
|---|---|
| `scripts/scan.mjs` | 수집 + 클러스터링 → graph.json |
| `scripts/lib/backend.mjs` | 라우트 추적, SQL 테이블 추출, 핸들러 호출 그래프 |
| `scripts/lib/frontend.mjs` | API 호출부 추출, 화면 ↔ API 연결 |
| `scripts/lib/schema.mjs` | Zod / CREATE TABLE 추출, 필드명 기반 샘플 생성 |
| `scripts/lib/cluster.mjs` | 플로우 묶기, 점검 항목 계산 |
| `scripts/render.mjs` | graph.json + 템플릿 → 단일 HTML |
| `templates/viewer.html` | 고정 UI. 데이터만 바뀐다 |

## 실측 검출률 (2026-08-22)

| 프로젝트 | 검출 / 실제 |
|---|---|
| wecom | 137 / 142 |
| modadam | 29 / 29 |
| boothflow | 49 / 53 |
| cosmic-renew | 119 / 119 |
