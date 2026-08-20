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
| 파일·레포 잡무 (커밋·푸시·이동·삭제·정리) | ~30 | general-purpose | 위임 프롬프트에 `git reset` / `git checkout .` / `git clean -f` **명시적 금지 목록**을 반드시 포함 (메모리 `feedback_subagent_git_destructive_incident`). 파일 삭제·덮어쓰기는 사용자 승인 후에만 |
| 홈서버 운영·배포 (PM2·포트·크론·Tailscale Funnel) | 17 | general-purpose | 신규 서비스 노출 전 `funnel status` 선확인 필수 (메모리 `project_home_server` - boothflow가 note-server를 덮어쓴 사고) |
| 엑셀·스프레드시트 가공 (xlsx 편집·표 재구성·업로드 템플릿) | 23 | general-purpose | 기존 파일 덮어쓰기 금지, 새 파일로 산출 후 대조 |
| 개인 학습자료 편집 (정보처리기사 노트 등) | ~20 | general-purpose | - |
| 에이전트·스킬·룰 정의 자체 수정 (메타작업) | ~25 | 오케스트레이터 직접 | 정의파일 1개당 수정 범위를 좁게. 파일 전체 재작성 금지 |
| 숏폼 제작 부수작업 (캐릭터 SVG·인트로/TTS·파일 재배치) | ~45 | shortform-builder | 렌더 파이프라인 밖 잡무여도 자산 REGISTRY 선조회 원칙은 동일 적용 |

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
| **에이전트 평가** | 에이전트 정의파일 품질 점검·개선 | agent-evaluator-v2 |
| **스킬 평가** | 스킬(.md) 품질 점검·개선 | skill-evaluator |
| **숏폼 지식영상 제작** | "숏폼 만들어줘", "쇼츠 1화 뽑아줘", "지식 영상 만들어줘", `/shortform <프로필> <주제>` → 주제발굴·대본·비평·렌더 전체 파이프라인 | `/shortform` 스킬 (planner → critic → builder 순서로 오케스트레이션) |
| **회의록 작성** | "회의록 작성해줘", "업무회의록 만들어줘", "자문위원회 회의록", "녹취록으로 회의록 써줘", "회의 정리해줘" → 요점메모·녹취록 기반 실제 업무회의록 작성 (기존 정본 양식 실측 우선) | meeting-minutes-writer |
| **외부 웹 리서치** | "크롤링", "조사해줘", "긁어와", "회사/경쟁사 조사", "자료 수집", "있는지 확인" → 외부 사이트·SNS·뉴스·공공기관·학술 정보 수집 (앱 검증 아님) | web-crawler |
| **타입·문법 검증** | TypeScript 타입 오류·문법·임포트·async/await·데코레이터 정적 검증 (발견·보고만, 수정 안 함) | syntax-validator |
| **함수 로직 검증** | 특정 함수 비즈니스 로직·엣지케이스·에러 처리·부작용 정적 검증 (발견·보고만) | function-validator |
| **스키마 필드명 정합성 검증** | "필드가 저장이 안 됨", "값이 null로 들어감", "API로 보냈는데 DB에 반영 안 됨", Zod 스키마 검증, 필드명 정합성, 스키마 drift → Zod↔Repository SQL↔프론트 전송필드 3축 대조 (발견·보고만, Zod+raw SQL 스택 한정) | schema-drift-auditor |
| **LINKER HTML→Vue 변환** | "linker 변환", "html to vue", "linker 컴파일", "vue로 변환" → HTML 1개를 Vue 3 SFC로 1:1 변환 | linker-html-to-vue |
| **이북 교육자료 검증** | "학생 시점 검증", "이북 챕터 이해도 검사", "비전공자가 읽고 막히는 곳 찾아줘" → 제로베이스 독자 시점 정독·막힘 보고 (읽기 전용) | ebook-student |
| **이북 교육자료 수정** | "이북 챕터 개선", "학생 피드백 반영", "1주차-1 스타일로 고쳐줘" → 확정 스타일에 맞춰 본문·요약·퀴즈·체크포인트 연쇄 갱신 | ebook-editor |
| **후속사업 사전영업 자료** | "후속 사업 소개서", "사전영업 자료", "발주처에 미리 보낼 자료", "고도화 사업 선점" → 정식 RFP 공고 전 선점용 회사소개 겸 어필 콘텐츠 | gov-followup-outreach-writer |
| **판정 대리 (사용자에게 물어보기 직전)** | Claude가 사용자에게 선택·승인·확인을 요청하려는 모든 순간. "이렇게 할까요", "A와 B 중 어느 쪽", "이것도 할까요", 완료 보고 직전, 스코프 확장 검토 시 | lee-wonho |
| **웰콘 사업 자문 판단** | "자문위원이라면 어떻게 볼까", "이 설계 괜찮은지 검토해줘", "웰콘 사업 관점에서 판단해줘", "과업 범위에 맞는지 봐줘" - 콘텐츠 해외진출 기업정보 구축 기획(1단계) 웰콘 프로젝트 관련 설계 판단 | welcon-advisor |

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

> **`model: sonnet` 단일 정책** — 사용자 지시(2026-07-02): "소넷 외에는 쓰지 않는다."
> 모든 에이전트 정의파일의 `model:` 필드는 `sonnet` 고정. opus/haiku/fable 절대 금지.
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

Located in `.claude/agents/` (project-local, not `~/.claude/agents/`):

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
| refactor-cleaner | 코드 정리·불필요 코드 제거 | 리팩토링 실행 |
| database-reviewer | DB 리뷰 (리뷰 전용) | 기존 쿼리/스키마/인덱스 감사 |
| doc-updater | 문서·코드맵 업데이트 | 기능 완료 후 |
| doc-generator | DOCX/한글 문서 생성 (계약서·보고서·제안서) | 문서 생성 요청 시 |
| ui-design-system | 디자인 시스템·토큰 생성 | 디자인 토큰, 공용 컴포넌트 |
| jasoseo-writer | 자소서·지원서 작성 | 자소서, 자기소개서 요청 |
| agent-evaluator-v2 | 에이전트 정의파일 3계층 100점 평가 (정적 린트·트리거 F1 → 9 judge 병렬 → 근거잠금 채점·회귀 비교). v1은 agents-archive/로 퇴역 | 에이전트 생성·수정 후 (표준) |
| skill-evaluator | 스킬(.md) 품질 평가·개선 (100점 척도) | 스킬 생성·수정 후 |
| proposal-pt-builder | 정부사업 RFP 제안 PT → 에셋 라이브러리 조합 네이티브 PPTX (standard/gov 듀얼 트랙 자동 인지) | PT/발표자료 요청 시 |
| pptx-asset-generator | PPT 에셋 "조각"(표·KPI·프로세스·비교표·타임라인·조직도·차트·헤더) python-pptx/OOXML 생성·병합·검증, compose.mjs 파이프라인 확장. 최종 PT 조립은 담당 아님(→ proposal-pt-builder) | "pptx 에셋 생성", "슬라이드 조각 만들어줘", "compose.mjs 수정/디버깅", "매니페스트 등록" |
| hwp-generator | HWPX 공문서 생성 (계약서·제안요청서·보고서·공문·계획서·회의록) | "hwp 만들어", "계약서", "제안요청서", ".hwpx" 요청 시 |
| shortform-planner | 숏폼 지식영상 주제 발굴 + 주장별 사실검증(확실성 A/B/C 등급, C면 주제 교체) + 타임코드 대본. 길이는 "채우기"가 아니라 "이해에 필요한 최소" | "숏폼 기획", "쇼츠 주제 잡아줘", `/shortform` 실행 시 |
| shortform-critic | 숏폼 대본 문장 단위 쳐내기 (읽기 전용, 대본 파일 수정 안 함). "빼면 이해가 안 되나?" 기준으로 삭제·압축 판정. 작성자와 반드시 분리 | planner가 대본 쓴 직후, "필러 잡아줘", "쓸데없는 말 빼줘" |
| shortform-builder | 확정 대본 → 씬 라이브러리 조립 + edge-tts + RMS 립싱크 + Remotion 렌더 → mp4. REGISTRY 선조회 후 없는 것만 신규 제작·등록 | "숏폼 렌더", "영상 뽑아줘", 대본 확정 후 |
| meeting-minutes-writer | 요점메모+녹취록(1개 이상)으로 업무회의록 작성. 기존 정본 회의록 양식 실측 우선(추측 금지), 화자 매핑(요점메모↔참석자N, 확신 없으면 확인 필요로 표시), 외부 의견자는 이름 태그+의견1)/2)/3) 번호, 우리측은 주어생략 개조식 서술 | "회의록 작성해줘", "업무회의록 만들어줘", "자문위원회 회의록", "녹취록으로 회의록 써줘" |
| web-crawler | 외부 웹 리서치 크롤러 (기업 사이트·SNS·뉴스·공공기관·학술, WebSearch→WebFetch→Playwright, 단일타겟 병렬). 앱 검증 playwright-verify-loop와 구별 | "크롤링", "조사해줘", "경쟁사 분석", "자료 수집", "있는지 확인" |
| syntax-validator | TypeScript 타입·문법·임포트·async/await·데코레이터 정적 검증 (발견·보고 전용, 수정 안 함) | 코드 리뷰 전 사전 검증, 병렬 함수 단위 검증 |
| function-validator | 함수 비즈니스 로직 정확성·엣지케이스·에러 처리·부작용 정적 분석 (발견·보고 전용, 수정 안 함) | 병렬 파일·함수 단위 기능 검증 |
| schema-drift-auditor | Zod 스키마 ↔ Repository SQL ↔ 프론트 전송 필드 3축 정합성 정적 검증, Zod strip으로 인한 silent 데이터 유실 탐지 (발견·보고 전용, 수정 안 함, Zod+raw SQL 스택 한정) | "필드가 저장이 안 됨", "값이 null로 들어감", "API로 보냈는데 DB에 반영 안 됨", "필드명 정합성", "스키마 drift" |
| linker-html-to-vue | LINKER 프로젝트 HTML 1개 → Vue 3 Composition API SFC 1:1 변환 (CSS 무변경, 클래스 기반 표시제어) | "linker 변환", "html to vue", "vue로 변환" |
| ebook-student | 이북 교육자료를 "완전 제로베이스 비전공자" 시점으로 정독하고 막히는 지점 보고 (발견·보고 전용, 수정 안 함) | "학생 시점 검증", "이북 챕터 이해도 검사" |
| ebook-editor | ebook-student가 보고한 막힘 지점 해소. 본문 수정 시 요약·퀴즈·체크포인트까지 연쇄 갱신 (저자 확정 스타일 9원칙 준수) | "이북 챕터 개선", "학생 피드백 반영" |
| gov-followup-outreach-writer | 수행 중 사업 공고문에 명시된 후속 사업을 정식 RFP 전에 선점하는 사전 어필 자료 콘텐츠 작성 (최종 파일 산출은 hwp-generator/doc-generator 위임) | "후속 사업 소개서", "사전영업 자료", "고도화 사업 선점" |
| lee-wonho | 이원호 의사결정 대리 판정 (아이디어 생성 안 함, 판정만). ADOPT / REJECT / CLAUDE_DISCRETION / ESCALATE 4종 출력, 규칙 ID 71개 | 사용자에게 질문하려는 순간, 선택지 앞에서 멈출 때, 완료 보고 직전, 자발적 확장 검토 시 |
| welcon-advisor | 웰콘(콘텐츠 해외진출 기업정보 구축 기획 1단계) 프로젝트 전용 AI 자문위원. RFP·실행계획서·자문위원 8인 원문·이성민 교수 자문·실측 DB를 직접 읽고 근거 등급([직접 근거]/[데이터 근거]/[추론]/[미확인])을 밝혀 의견 제시(lee-wonho와 달리 의견 창작 가능). 과업 범위(1단계=기획, 2단계 개발 아님) 이탈 여부도 확인 | "자문위원이라면 어떻게 볼까", "이 설계 괜찮은지 검토해줘", "웰콘 사업 관점에서 판단해줘", "과업 범위에 맞는지 봐줘" |
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
playwright-verify-loop 에이전트 사용
- 브라우저를 직접 운전하며 기능 전체 워크스루
- 콘솔·네트워크·서버로그 수집 → 병렬 원인조사 → 리포트 → 수정 위임 → 재검증 루프
- npx playwright test 스위트 실행이 아님 (전용 e2e-runner는 미사용으로 2026-08-20 아카이빙)
```

### 필드명 전면 변경 (DB+백엔드+프론트)
```
1. 영향범위 스캔 — schema-drift-auditor 또는 grep으로 필드명 등장 지점 전수 수집
   (DB 스키마/마이그레이션, Repository SQL, Service, Controller, Zod 스키마,
    프론트 API 함수·폼·store·라벨·CSS 클래스명) + 동명이인 필드(타 테이블 동일명) 충돌 확인
   → [승인 게이트] 스캔 결과 사용자 확인
2. db-schema-architect MIGRATE 모드로 UP/DOWN(롤백) SQL 파일만 생성 — 실행하지 않음
   → [승인 게이트] 마이그레이션 SQL 검토
3. 사용자가 직접 마이그레이션 실행 (백업 확인 후) — 에이전트는 ALTER TABLE 실행 금지
   → [승인 게이트] 실행 완료 확인
4. 코드 반영 — 백엔드(Repository→Service→Controller→Zod) → 프론트(API 함수→폼→store→표시 라벨)
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
