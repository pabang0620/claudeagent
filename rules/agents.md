# Agent Orchestration

> **이 파일이 에이전트 라우팅·목록의 SSOT다.** 에이전트 추가/변경 시 여기(STEP1 표 + Available Agents 표)부터 갱신하고, 다른 문서는 이 파일을 참조한다.

## ORCHESTRATOR MANDATORY CHECKLIST (매 요청마다 반드시 실행)

> 오케스트레이터는 절대 코드를 직접 작성하지 않는다. 아래 체크리스트를 순서대로 확인하고 해당 에이전트를 호출한다.

### STEP 1: 요청 분류 (하나라도 해당되면 즉시 해당 에이전트 실행)

| 요청 유형 | 판단 기준 | 필수 에이전트 |
|----------|----------|-------------|
| **기능 구현** | "만들어", "구현해", "추가해", "개발해", 새 API/컴포넌트/페이지 | planner → 전문 에이전트 |
| **버그 수정** | "안 돼", "에러", "고쳐", "수정해", "버그" | tdd-guide → 전문 에이전트 |
| **리팩토링** | "리팩토링", "정리", "개선", "분리해" | planner → refactor-cleaner |
| **아키텍처** | "설계", "구조", "어떻게 만들까", "방향" | architect |
| **DB 관련** | 테이블 설계, 쿼리, 마이그레이션, 스키마 | database-reviewer |
| **보안 관련** | 인증, 권한, API 키, 사용자 입력 처리 | security-reviewer |
| **빌드 에러** | 빌드 실패, 타입 에러, 컴파일 에러 | build-error-resolver |
| **프론트엔드** | React 컴포넌트, hooks, 상태관리, UI | react-specialist |
| **백엔드** | Express 라우터, 미들웨어, API 엔드포인트 | express-engineer |
| **HWPX 문서 생성** | 계약서, 용역계약서, 제안요청서, 보고서, 공문, 기안문, 계획서, 회의록 → .hwpx 파일 생성 | hwp-generator |
| **DOCX 문서 생성** | 계약서, 보고서, 제안서, 공문서 → .docx 파일 생성 (md/README/마크다운은 해당 없음) | doc-generator |
| **PT/발표자료** | "PT 만들어", "제안서 슬라이드", "발표자료", RFP 제안 발표자료, PPTX | proposal-pt-builder |
| **PPTX 에셋 조각 생성** | "pptx 에셋 생성", "슬라이드 조각 만들어줘", "python-pptx로 생성", "compose.mjs 수정/디버깅", "매니페스트 등록", "audit.py 실패 수정" → 에셋 라이브러리 조각 생성·병합·검증 (최종 PT 조립은 proposal-pt-builder) | pptx-asset-generator |
| **Playwright 검증** | "playwright", "검증", "기능 눌러봐", "개발자모드 켜고", "브라우저 운전", "기능 전체 검증" | playwright-verify-loop |
| **E2E 테스트 코드** | "E2E 테스트 작성", "playwright test 스위트", "테스트 코드 만들어" | e2e-runner |
| **에이전트 평가** | 에이전트 정의파일 품질 점검·개선 | agent-evaluator-v2 |
| **스킬 평가** | 스킬(.md) 품질 점검·개선 | skill-evaluator |
| **리뷰 플랜 수립** | "검증해줘", "플랜 만들어줘", "수정 계획 세워줘", "리뷰 결과 반영", "이슈 플랜" | review-plan-builder |
| **회의록(보고용)** | "보고용 회의록", "정식 회의록", "업무회의록 만들어줘", "회의록 정리해서 보고" → 발주처·상급자 보고용 정선 회의록 | meeting-report-writer |
| **회의 전체정리(확인용)** | "회의 전체 정리", "빠짐없이 정리", "내가 확인용", "검토용 회의 정리", "녹취록 전체 요약" → 우리 발표까지 포함한 종합정리 | meeting-full-summarizer |
| **외부 웹 리서치** | "크롤링", "조사해줘", "긁어와", "회사/경쟁사 조사", "자료 수집", "있는지 확인" → 외부 사이트·SNS·뉴스·공공기관·학술 정보 수집 (앱 검증 아님) | web-crawler |
| **타입·문법 검증** | TypeScript 타입 오류·문법·임포트·async/await·데코레이터 정적 검증 (발견·보고만, 수정 안 함) | syntax-validator |
| **함수 로직 검증** | 특정 함수 비즈니스 로직·엣지케이스·에러 처리·부작용 정적 검증 (발견·보고만) | function-validator |
| **스키마 필드명 정합성 검증** | "필드가 저장이 안 됨", "값이 null로 들어감", "API로 보냈는데 DB에 반영 안 됨", Zod 스키마 검증, 필드명 정합성, 스키마 drift → Zod↔Repository SQL↔프론트 전송필드 3축 대조 (발견·보고만, Zod+raw SQL 스택 한정) | schema-drift-auditor |
| **LINKER HTML→Vue 변환** | "linker 변환", "html to vue", "linker 컴파일", "vue로 변환" → HTML 1개를 Vue 3 SFC로 1:1 변환 | linker-html-to-vue |

### STEP 2: 코드 변경 후 필수 (예외 없음)

```
에이전트가 코드를 작성/수정한 후 → 반드시 code-reviewer 스킬 실행
```

### STEP 3: 단순 작업 기준 (에이전트 생략 가능한 유일한 경우)

아래 **모두** 해당할 때만 직접 처리 가능:
- 단일 파일의 단순 텍스트 수정 (변수명, 주석, 설정값)
- 코드 로직 변경 없음
- 1-3줄 이하 변경

---

## 에이전트 모델 제약 (PERMANENT, SONNET-ONLY)

> **`model: sonnet` 단일 정책** — 사용자 지시(2026-07-02): "소넷 외에는 쓰지 않는다."
> 모든 에이전트 정의파일의 `model:` 필드는 `sonnet` 고정. opus/haiku/fable 절대 금지.
> (기존 flutter-game-builder haiku 예외도 2026-07-02 sonnet으로 통일 완료)
>
> **신규 에이전트 생성 시 필수 체크리스트** (공식 문서 기준):
> - [ ] frontmatter: `name`, `description`, `tools`, `model` 4개 필드 모두 포함
> - [ ] `name`: 소문자+하이픈만 사용, 전체 scope에서 유일 (`/doctor`로 중복 감지 가능)
> - [ ] `model: sonnet` 확인 (다른 값 입력 시 즉시 거부)
> - [ ] `description`: "무엇을 하는가" + **"언제 사용하는가"(트리거 키워드)** 명시.
>       자동 위임을 원하면 "~시 사전에 적극 활용(use proactively when ~)" 패턴 포함
> - [ ] `tools`: 최소 권한 allowlist. 읽기 전용 에이전트에 Write/Edit 금지,
>       서브에이전트 스폰이 필요할 때만 `Agent` 포함
> - [ ] 생성 후 agent-evaluator-v2 평가 → 90점 이상 달성 후 배포

---

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose | Specific Triggers |
|-------|---------|-----------------|
| planner | 구현 계획 수립 | 모든 기능 구현/리팩토링 시작 전 |
| architect | 시스템 설계 | "설계", "구조", 신규 서비스/모듈 |
| tdd-guide | TDD 워크플로우 | 모든 버그 수정, 신규 기능 |
| react-specialist | React 19 + Vite 7 | 프론트엔드 코드 작성 |
| express-engineer | Node.js + Express | 백엔드 코드 작성 |
| api-contract-designer | API 엔드포인트 SSOT 설계 | 신규 API, 업로드, 관리자 엔드포인트 |
| db-schema-architect | MySQL 8.0 스키마 설계·마이그레이션 | WeCom DB, 신규 테이블, 마이그레이션 |
| security-reviewer | 보안 분석 (진단 전용) | 인증/권한/민감 데이터 |
| build-error-resolver | 빌드 에러 수정 | 빌드/타입 실패 시 |
| playwright-verify-loop | 브라우저 직접 운전 검증 루프 (개발자모드·콘솔·네트워크 수집 → 리포트 → 수정 위임 → 재검증) | "playwright", "검증", "기능 눌러봐", "개발자모드 켜고" |
| e2e-runner | E2E 테스트 코드 작성·유지·실행 (npx playwright test 스위트 전용) | "테스트 코드 작성", "playwright test 스위트" |
| refactor-cleaner | 코드 정리·불필요 코드 제거 | 리팩토링 실행 |
| database-reviewer | DB 리뷰 (리뷰 전용) | 기존 쿼리/스키마/인덱스 감사 |
| doc-updater | 문서·코드맵 업데이트 | 기능 완료 후 |
| doc-generator | DOCX/한글 문서 생성 (계약서·보고서·제안서) | 문서 생성 요청 시 |
| project-bootstrapper | 신규 프로젝트 Day 0 셋업 | 새 프로젝트 초기화 |
| ui-design-system | 디자인 시스템·토큰 생성 | 디자인 토큰, 공용 컴포넌트 |
| jasoseo-writer | 자소서·지원서 작성 | 자소서, 자기소개서 요청 |
| flutter-game-builder | Flutter 게임 APK·웹 빌드 | Flutter 빌드 요청 |
| agent-evaluator-v2 | 에이전트 정의파일 3계층 100점 평가 (정적 린트·트리거 F1 → 9 judge 병렬 → 근거잠금 채점·회귀 비교). v1은 agents-archive/로 퇴역 | 에이전트 생성·수정 후 (표준) |
| skill-evaluator | 스킬(.md) 품질 평가·개선 (100점 척도) | 스킬 생성·수정 후 |
| proposal-pt-builder | 정부사업 RFP 제안 PT → 에셋 라이브러리 조합 네이티브 PPTX (standard/gov 듀얼 트랙 자동 인지) | PT/발표자료 요청 시 |
| pptx-asset-generator | PPT 에셋 "조각"(표·KPI·프로세스·비교표·타임라인·조직도·차트·헤더) python-pptx/OOXML 생성·병합·검증, compose.mjs 파이프라인 확장. 최종 PT 조립은 담당 아님(→ proposal-pt-builder) | "pptx 에셋 생성", "슬라이드 조각 만들어줘", "compose.mjs 수정/디버깅", "매니페스트 등록" |
| hwp-generator | HWPX 공문서 생성 (계약서·제안요청서·보고서·공문·계획서·회의록) | "hwp 만들어", "계약서", "제안요청서", ".hwpx" 요청 시 |
| review-plan-builder | 리뷰 결과 재검토 → 수정 플랜 수립 → 병렬 검증 루프(2회 연속 클린) → FINAL_PLAN.md → 실행 직전 중단 | "검증해줘", "플랜 만들어줘", "수정 계획 세워줘" |
| meeting-report-writer | 【보고용】 요점메모(1차)+녹취록(보조)으로 발주처 보고용 정식 업무회의록 작성. 발주처 반응·승인·지시 중심, 우리 발표는 축소, 화자 매핑(콘진원팀장님↔참석자N) | "보고용 회의록", "정식 회의록", "업무회의록 만들어줘" |
| meeting-full-summarizer | 【확인용】 녹취록(1차) 전체 통독으로 우리 발표까지 포함한 회의 전체를 주제별 종합정리. 사용자 본인 검토·대조용, 누락 방지 최우선 | "회의 전체 정리", "빠짐없이 정리", "내가 확인용", "검토용 회의 정리" |
| web-crawler | 외부 웹 리서치 크롤러 (기업 사이트·SNS·뉴스·공공기관·학술, WebSearch→WebFetch→Playwright, 단일타겟 병렬). 앱 검증 playwright-verify-loop·E2E e2e-runner와 구별 | "크롤링", "조사해줘", "경쟁사 분석", "자료 수집", "있는지 확인" |
| syntax-validator | TypeScript 타입·문법·임포트·async/await·데코레이터 정적 검증 (발견·보고 전용, 수정 안 함) | 코드 리뷰 전 사전 검증, 병렬 함수 단위 검증 |
| function-validator | 함수 비즈니스 로직 정확성·엣지케이스·에러 처리·부작용 정적 분석 (발견·보고 전용, 수정 안 함) | 병렬 파일·함수 단위 기능 검증 |
| schema-drift-auditor | Zod 스키마 ↔ Repository SQL ↔ 프론트 전송 필드 3축 정합성 정적 검증, Zod strip으로 인한 silent 데이터 유실 탐지 (발견·보고 전용, 수정 안 함, Zod+raw SQL 스택 한정) | "필드가 저장이 안 됨", "값이 null로 들어감", "API로 보냈는데 DB에 반영 안 됨", "필드명 정합성", "스키마 drift" |
| linker-html-to-vue | LINKER 프로젝트 HTML 1개 → Vue 3 Composition API SFC 1:1 변환 (CSS 무변경, 클래스 기반 표시제어) | "linker 변환", "html to vue", "vue로 변환" |
| **code-reviewer** | **스킬** (에이전트 아님) | `code-reviewer` 스킬로 호출 |

---

## 표준 워크플로우

### 기능 구현 요청
```
1. planner (계획 수립)
2. react-specialist 또는 express-engineer (구현)
3. code-reviewer (리뷰)
4. [필요 시] tdd-guide (테스트)
```

### 버그 수정 요청
```
1. tdd-guide (재현 테스트 작성)
2. react-specialist 또는 express-engineer (수정)
3. code-reviewer (리뷰)
```

### 아키텍처/설계 요청
```
1. architect (설계)
2. [승낙 후] planner (구현 계획)
```

### Playwright 검증 요청 ("playwright", "검증해", "기능 눌러봐", "개발자모드 켜고")
```
playwright-verify-loop 에이전트 사용 (e2e-runner 금지)
- 브라우저를 직접 운전하며 기능 전체 워크스루
- 콘솔·네트워크·서버로그 수집 → 병렬 원인조사 → 리포트 → 수정 위임 → 재검증 루프
- npx playwright test 실행이 아님
```

---

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```
GOOD: 여러 파일 리뷰 → 파일당 에이전트 1개 병렬 실행
BAD:  파일 1 리뷰 완료 → 파일 2 리뷰 시작 (순차)
```

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
