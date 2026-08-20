# Agent Orchestration

> **이 파일이 에이전트 라우팅·목록의 SSOT다.** 에이전트 추가/변경 시 여기(STEP1 표 + Available Agents 표)부터 갱신하고, 다른 문서는 이 파일을 참조한다.

## ORCHESTRATOR MANDATORY CHECKLIST (매 요청마다 반드시 실행)

> 오케스트레이터는 절대 코드를 직접 작성하지 않는다. 아래 체크리스트를 순서대로 확인하고 해당 에이전트를 호출한다.

### STEP 0: general-purpose 사용 규율 (2026-08-20 실측 기반 신설)

> 전체 스폰 1,658건 중 general-purpose가 442건(27%)으로 1위였고, 그중 112건(25%)은
> **담당 전문 에이전트가 이미 존재하는데도** general-purpose로 갔다.
> 최다 사례는 교육자료·이북 편집 50건 - `ebook-editor`가 32회나 쓰인 상위 에이전트인데도
> 이 표에 등재돼 있지 않아서 존재를 인지하지 못한 것이 원인이었다.

1. general-purpose를 스폰하기 전에 **반드시 아래 STEP 1 표를 먼저 대조한다.** 담당이 있으면 그쪽으로 보낸다.
2. 표에 담당이 없으면 general-purpose로 보내되, **같은 유형의 요청이 2회째면 그 자리에서 STEP 1 표에 행을 추가한다.**
   (전문 에이전트를 새로 만들라는 뜻이 아니다. 담당이 general-purpose임을 표에 명시하라는 뜻이다.)
3. 담당 없이 반복되는 것으로 실측된 영역 - 아래는 general-purpose가 맡되 표기된 주의사항을 지킨다.

| 반복 영역 | 실측 건수 | 담당 | 필수 주의사항 |
|----------|---------|------|-------------|
| 파일·레포 잡무 (커밋·푸시·이동·삭제·정리) | ~30 | **repo-janitor** | 금지 명령 목록·커밋 전 파일목록 확인 절차가 에이전트 정의에 내장됨 |
| 홈서버 운영·배포 (PM2·포트·크론·Tailscale Funnel) | 17 | **ops-deployer** | `funnel status` 선확인, serve 서브커맨드 금지, 외부 검증은 WebFetch가 정의에 내장됨 |
| 엑셀·스프레드시트 가공 (xlsx 편집·표 재구성·업로드 템플릿) | 23 | **spreadsheet-editor** | 원본 무덮어쓰기·산출 후 대조가 정의에 내장됨 |
| 개인 학습자료 편집 (정보처리기사 노트 등) | ~20 | **study-notes-editor** | li 개수 불변·계산 재검증·탭 숫자 정합이 정의에 내장됨 |
| 에이전트·스킬·룰 정의 자체 수정 (메타작업) | ~25 | 오케스트레이터 직접 | 정의파일 1개당 수정 범위를 좁게. 파일 전체 재작성 금지 |
| 숏폼 제작 부수작업 (캐릭터 SVG·인트로/TTS·파일 재배치) | ~45 | shortform-builder | 렌더 파이프라인 밖 잡무여도 자산 REGISTRY 선조회 원칙은 동일 적용 |

### STEP 1: 요청 분류 (하나라도 해당되면 즉시 해당 에이전트 실행)

| 요청 유형 | 판단 기준 | 필수 에이전트 |
|----------|----------|-------------|
| **기능 구현** | "만들어", "구현해", "추가해", "개발해", 새 API/컴포넌트/페이지 | planner → 전문 에이전트 |
| **버그 수정** | "안 돼", "에러", "고쳐", "수정해", "버그" | tdd-guide → 전문 에이전트 |
| **리팩토링** | "리팩토링", "정리", "개선", "분리해" | planner → refactor-cleaner |
| **아키텍처** | "어떻게 만들까" | architect |
| **DB 관련** | 기존 쿼리·인덱스·스키마 감사 → database-reviewer / 신규 스키마 설계·마이그레이션 파일 생성 → db-schema-architect | database-reviewer 또는 db-schema-architect |
| **보안 관련** | 인증, 권한, API 키, 사용자 입력 처리 | security-reviewer |
| **빌드 에러 / 타입 에러** | 빌드 실패, 타입 에러, 컴파일 에러 - **고쳐달라는 요청은 전부 여기** (기본 경로) | build-error-resolver |
| **프론트엔드** | React 컴포넌트, hooks, 상태관리, UI | react-specialist |
| **백엔드** | Express 라우터, 미들웨어, API 엔드포인트 | express-engineer |
| **HWPX 문서 생성** | 계약서, 용역계약서, 제안요청서, 보고서, 공문, 기안문, 계획서, 회의록 → .hwpx 파일 생성 | hwp-generator |
| **DOCX 문서 생성** | 계약서, 보고서, 제안서, 공문서 → .docx 파일 생성 (md/README/마크다운은 해당 없음) | doc-generator |
| **PT/발표자료** | RFP 제안 발표자료, PPTX | proposal-pt-builder |
| **PPTX 에셋 조각 생성** | 에셋 라이브러리 조각 생성·병합·검증 (최종 PT 조립은 proposal-pt-builder) | pptx-asset-generator |
| **Playwright 검증** | "기능 눌러봐", "브라우저 운전" | playwright-verify-loop |
| **에이전트 평가** | 에이전트 정의파일 품질 점검·개선 | agent-evaluator-v2 |
| **스킬 평가** | 스킬(.md) 품질 점검·개선 | skill-evaluator |
| **숏폼 지식영상 제작** | "숏폼 만들어줘", "쇼츠 1화 뽑아줘", "지식 영상 만들어줘", `/shortform <프로필> <주제>` → 주제발굴·대본·비평·렌더 전체 파이프라인 | `/shortform` 스킬 (shortform-planner → shortform-critic → shortform-builder 순서로 오케스트레이션) |
| **회의록 작성** | 요점메모·녹취록 기반 실제 업무회의록 작성 (기존 정본 양식 실측 우선) | meeting-minutes-writer |
| **외부 웹 리서치** | "조사해줘", "회사/경쟁사 조사" → 외부 사이트·SNS·뉴스·공공기관·학술 정보 수집 (앱 검증 아님) | web-crawler |
| **타입·문법 "점검만"** | **수정하지 말라는 단서가 붙었을 때만.** "고치지 말고 타입 오류만 알려줘", "점검만 해줘", "어디가 문제인지 목록으로" - TypeScript 타입·문법·임포트·async/await·데코레이터 정적 검증. 단서 없이 "타입 에러 났어"면 위 build-error-resolver로 보낸다 | syntax-validator |
| **함수 로직 검증** | 특정 함수 비즈니스 로직·엣지케이스·에러 처리·부작용 정적 검증 (발견·보고만) | function-validator |
| **스키마 필드명 정합성 검증** | Zod 스키마 검증, 필드명 정합성, 스키마 drift → Zod↔Repository SQL↔프론트 전송필드 3축 대조 (발견·보고만, Zod+raw SQL 스택 한정) | schema-drift-auditor |
| **LINKER HTML→Vue 변환** | HTML 1개를 Vue 3 SFC로 1:1 변환 | linker-html-to-vue |
| **이북 교육자료 검증** | 제로베이스 독자 시점 정독·막힘 보고 (읽기 전용) | ebook-student |
| **이북 교육자료 수정** | 확정 스타일에 맞춰 본문·요약·퀴즈·체크포인트 연쇄 갱신 | ebook-editor |
| **후속사업 사전영업 자료** | 정식 RFP 공고 전 선점용 회사소개 겸 어필 콘텐츠 | gov-followup-outreach-writer |
| **홈서버 운영·배포** | "공개 URL 노출" → 서버 운영 전반 (앱 코드 수정 아님) | ops-deployer |
| **레포 잡무** | "파일 옮겨줘" → git·파일 정리 (코드 내용 수정 아님) | repo-janitor |
| **엑셀·스프레드시트** | xlsx/csv 가공 | spreadsheet-editor |
| **개인 학습자료 편집** | 자격증 단일 HTML 노트 (이북은 ebook-editor) | study-notes-editor |
| **문서·코드맵 갱신** | "README 갱신", "코드맵 갱신", 기능 완료 후 문서 반영 | doc-updater |
| **신규 API 계약 설계** | 새 엔드포인트, 업로드 API, 관리자 API → Zod 스키마 1개에서 백엔드·프론트·타입 동시 생성 | api-contract-designer |
| **디자인 토큰·CSS 일관성** | "공용 컴포넌트 만들어줘", 하드코딩 컬러·radius 정리 | ui-design-system |
| **자소서·지원서** | "자소서 써줘" | jasoseo-writer |
| **판정 대리 (사용자에게 물어보기 직전)** | Claude가 사용자에게 선택·승인·확인을 요청하려는 모든 순간. "이렇게 할까요", "A와 B 중 어느 쪽", "이것도 할까요", 완료 보고 직전, 스코프 확장 검토 시 | lee-wonho |
| **웰콘 사업 자문 판단** | 콘텐츠 해외진출 기업정보 구축 기획(1단계) 웰콘 프로젝트 관련 설계 판단 | welcon-advisor |
| **Godot 게임 구현** | Lighthaven Depths(`/mnt/c/Users/admin/Desktop/games/dungeon-legends`) 게임플레이·전투·스킬·UI·에셋 배선 구현. ※게임 세션은 그 레포의 `CLAUDE.md`+`docs/plans/`가 작업 SSOT | godot-game-developer |
| **게임 인프라·멀티** | 오토로드/InputMap·콜리전 레이어 기반 공사/멀티플레이(ENet·GodotSteam)/세이브 (게임 레포 로컬 에이전트) | godot-netcode-engineer |
| **게임 데이터·밸런스** | `data/` .tres 테이블 작성·수치 조정 (게임 레포 로컬 에이전트) | game-data-designer |
| **게임 레벨 배치** | 맵 씬 발판/몬스터/포탈 배치, 존 추가 (게임 레포 로컬 에이전트) | game-level-designer |
| **게임 규칙 리뷰** | 멀티-safe/표준 준수 검사, 읽기 전용 (게임 레포 로컬 에이전트) | multiplayer-safety-reviewer |
| **게임 에셋 생성 프롬프트 작성** | "에셋 프롬프트 만들어줘", "이미지 생성 프롬프트 줘" → 이미지/오디오 생성 프롬프트만 작성(생성·배선은 안 함) | asset-prompt-writer |

### STEP 1-1: 평가 에이전트 사용 제약 (agent-evaluator-v2 / skill-evaluator)

> 두 에이전트는 **신규 생성·대폭 수정 직후 1회 점검**에만 쓴다.
> 90점/100점 목표로 반복 재평가하는 **점수 루프는 금지**한다 (메모리 `feedback_no_agent_score_loop`).
> "최상급"의 기준은 점수가 아니라 실제 안전성·정확성 개선이다.

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

> **`model: sonnet` 단일 정책** - 사용자 지시(2026-07-02): "소넷 외에는 쓰지 않는다."
> 모든 에이전트 정의파일의 `model:` 필드는 `sonnet` 고정. opus/haiku/fable 절대 금지.
> (이건 **정의파일 필드** 기준이다. 막혔을 때 `Agent` 도구의 `model` 파라미터로 그 작업 1건만 승인 후 상향하는 것은 별개로 허용 - `rules/performance.md`)
>
> **정의파일 500줄 제한**: 정의파일에는 판단 규칙만 둔다. 코드 예제·구현 골격이 길어지면 `.claude/agent-refs/<주제>.md` 로 분리하고, 정의파일 상단에 "참조 파일 (필요할 때만 읽는다)" 표로 **언제 읽는지** 조건을 명시한다. `agents/` 하위에 두면 에이전트로 스캔될 수 있으므로 반드시 `agent-refs/` 에 둔다.
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

실존 에이전트의 이름·역할·트리거는 **하네스가 매 세션 "Available agent types" 목록으로 자동 주입**한다(각 정의파일의 `description` 필드가 원본). 같은 내용을 여기 표로 다시 적으면 상시 로드 컨텍스트만 두 배로 먹고 drift가 생기므로, 목록을 중복 기재하지 않는다.

- 실제 목록 확인: 자동 주입된 에이전트 목록 또는 `ls .claude/agents/*.md`
- **역할·트리거 정의를 바꾸려면** 해당 `agents/<name>.md`의 `description`을 고친다(그게 SSOT다)
- **요청 → 에이전트 라우팅**은 위 STEP 1 표가 담당한다(트리거 한국어 표현 기준, description에 없는 정보)
- 퇴역한 에이전트는 아래 "아카이빙 이력" 참조
- `code-reviewer`는 에이전트가 아니라 스킬이다

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
playwright-verify-loop 에이전트 사용
- 브라우저를 직접 운전하며 기능 전체 워크스루
- 콘솔·네트워크·서버로그 수집 → 병렬 원인조사 → 리포트 → 수정 위임 → 재검증 루프
- npx playwright test 스위트 실행이 아님 (전용 e2e-runner는 미사용으로 2026-08-20 아카이빙)
```

### 필드명 전면 변경 (DB+백엔드+프론트)
```
1. 영향범위 스캔 - schema-drift-auditor 또는 grep으로 필드명 등장 지점 전수 수집
   (DB 스키마/마이그레이션, Repository SQL, Service, Controller, Zod 스키마,
    프론트 API 함수·폼·store·라벨·CSS 클래스명) + 동명이인 필드(타 테이블 동일명) 충돌 확인
   → [승인 게이트] 스캔 결과 사용자 확인
2. db-schema-architect MIGRATE 모드로 UP/DOWN(롤백) SQL 파일만 생성 - 실행하지 않음
   → [승인 게이트] 마이그레이션 SQL 검토
3. 사용자가 직접 마이그레이션 실행 (백업 확인 후) - 에이전트는 ALTER TABLE 실행 금지
   → [승인 게이트] 실행 완료 확인
4. 코드 반영 - 백엔드(Repository→Service→Controller→Zod) → 프론트(API 함수→폼→store→표시 라벨)
5. schema-drift-auditor로 3축 정합성 재확인 + 앱 기동 확인 → code-reviewer
```
> 전용 에이전트를 만들지 않은 이유: ALTER TABLE 실행 권한을 가진 자율 에이전트는
> "파괴적 작업 절대 금지" 승인 규칙과 구조적으로 충돌한다.

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

---

## 아카이빙 이력

`.claude/agents-archive/`로 퇴역한 에이전트는 라우팅 대상이 아니다. 필요해지면 파일을 `agents/`로 되돌리고 위 표 2곳(STEP 1 + Available Agents)에 다시 등재한다.

| 에이전트 | 퇴역일 | 사유 |
|---|---|---|
| e2e-runner | 2026-08-20 | 전체 세션 로그 실측 호출 0회. playwright-verify-loop가 실질 대체 |
| project-bootstrapper | 2026-08-20 | 호출 0회. Day 0 셋업 시나리오 미발생 |
| review-plan-builder | 2026-08-20 | 호출 0회 |
| flutter-game-builder | 2026-08-20 | 호출 0회. 대상 게임 프로젝트 전부 폐기 |
| manus-liaison | 2026-08-20 | raid-forge 폐기로 위임 대상 소멸 |
| audio-transcriber | 2026-07-24 | (이전 퇴역) |
