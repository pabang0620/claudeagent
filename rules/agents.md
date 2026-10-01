# Agent Orchestration

> **이 파일이 에이전트 라우팅·목록의 SSOT다.** 에이전트 추가/변경 시 여기(STEP1 표 + Available Agents 표)부터 갱신하고, 다른 문서는 이 파일을 참조한다.

## 위임 라우팅

> 작은·중간 작업은 메인이 직접 한다(`CLAUDE.md` "작업 방식"). 이 파일은 **위임하기로 했을 때** 담당을 찾는 표다.

### STEP 0: general-purpose 사용 규율 (2026-08-20 실측 기반 신설)

> 전체 스폰 1,658건 중 general-purpose가 442건(27%)으로 1위였고, 그중 112건(25%)은
> **담당 전문 에이전트가 이미 존재하는데도** general-purpose로 갔다.
> 최다 사례는 교육자료·이북 편집 50건 - `ebook-editor`가 32회나 쓰인 상위 에이전트인데도
> 이 표에 등재돼 있지 않아서 존재를 인지하지 못한 것이 원인이었다.

1. general-purpose를 스폰하기 전에 아래 STEP 1 표를 먼저 대조한다. 담당이 있으면 그쪽으로 보낸다.
2. 표에 담당이 없으면 general-purpose로 보내되, **같은 유형의 요청이 2회째면 그 자리에서 STEP 1 표에 행을 추가한다.**
   (전문 에이전트를 새로 만들라는 뜻이 아니다. 담당이 general-purpose임을 표에 명시하라는 뜻이다.)
3. 담당 없이 반복되는 것으로 실측된 영역 - 아래는 general-purpose가 맡되 표기된 주의사항을 지킨다.

| 반복 영역 | 실측 건수 | 담당 | 필수 주의사항 |
|----------|---------|------|-------------|
| 파일·레포 잡무 (커밋·푸시·이동·삭제·정리) | ~30 | **repo-janitor** | 금지 명령 목록·커밋 전 파일목록 확인 절차가 에이전트 정의에 내장됨 |
| 홈서버 운영·배포 (PM2·포트·크론·Tailscale Funnel) | 17 | **ops-deployer** | `funnel status` 선확인, serve 서브커맨드 금지, 외부 검증은 WebFetch가 정의에 내장됨 |
| 엑셀·스프레드시트 가공 (xlsx 편집·표 재구성·업로드 템플릿) | 23 | **spreadsheet-editor** | 원본 무덮어쓰기·산출 후 대조가 정의에 내장됨 |
| 개인 학습자료 편집 (정보처리기사 노트 등) | ~20 | general-purpose (study-notes-editor는 2026-09-29 미사용 보관) | li 개수 불변·계산 재검증·탭 숫자 정합을 스폰 프롬프트에 적는다 |
| 에이전트·스킬·룰 정의 자체 수정 (메타작업) | ~25 | 오케스트레이터 직접 | 정의파일 1개당 수정 범위를 좁게. 파일 전체 재작성 금지 |
| 숏폼 제작 부수작업 (캐릭터 SVG·인트로/TTS·파일 재배치) | ~45 | shortform-builder | 렌더 파이프라인 밖 잡무여도 자산 REGISTRY 선조회 원칙은 동일 적용 |

### STEP 1: 담당 표 (위임할 때 참조)

| 요청 유형 | 판단 기준 | 필수 에이전트 |
|----------|----------|-------------|
| **기능 구현** | "만들어", "구현해", "추가해", "개발해", 새 API/컴포넌트/페이지 | planner → 전문 에이전트 |
| **버그 수정** | "안 돼", "에러", "고쳐", "수정해", "버그" | 단건은 메인 직접 또는 전문 에이전트. tdd-guide는 재현이 어렵거나 회귀 위험이 큰 버그에만 앞에 붙인다 |
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
| **숏폼·롱폼 지식영상 제작** | "숏폼 만들어줘", "쇼츠 1화 뽑아줘", "지식 영상 만들어줘", `/shortform <프로필> <주제>` → 주제발굴·대본·렌더 전체 파이프라인 (9:16 숏폼 `ep<NN>` / 16:9 롱폼 `long<NN>` 둘 다 같은 파이프라인) | `/shortform` 스킬 (shortform-planner → 사용자 대본 승인 → shortform-builder 순서로 오케스트레이션. shortform-critic은 파이프라인에서 제거됨 - 파일은 보존하되 호출하지 않는다) |
| **회의록 작성** | 요점메모·녹취록 기반 실제 업무회의록 작성 (기존 정본 양식 실측 우선) | meeting-minutes-writer |
| **외부 웹 리서치 (대상 특정)** | "조사해줘", "회사/경쟁사 조사" → **볼 사이트가 이미 정해진** 대상(회사·URL·제품)의 사실 수확 (앱 검증 아님) | web-crawler |
| **외부 웹 리서치 (주제형)** | "근거자료 찾아줘", "통계 찾아줘" → **어디 있는지 모르는** 공공기관·연구기관 보고서·PDF 발굴 | `deep-research` 스킬 |
| **함수 로직 검증** | 특정 함수 비즈니스 로직·엣지케이스·에러 처리·부작용 정적 검증 (발견·보고만) | function-validator |
| **스키마 필드명 정합성 검증** | Zod 스키마 검증, 필드명 정합성, 스키마 drift → Zod↔Repository SQL↔프론트 전송필드 3축 대조 (발견·보고만, Zod+raw SQL 스택 한정) | schema-drift-auditor |
| **이북 교육자료 검증** | 제로베이스 독자 시점 정독·막힘 보고 (읽기 전용) | ebook-student |
| **이북 교육자료 수정** | 확정 스타일에 맞춰 본문·요약·퀴즈·체크포인트 연쇄 갱신 | ebook-editor |
| **후속사업 사전영업 자료** | 정식 RFP 공고 전 선점용 회사소개 겸 어필 콘텐츠 | gov-followup-outreach-writer |
| **홈서버 운영·배포** | "공개 URL 노출" → 서버 운영 전반 (앱 코드 수정 아님) | ops-deployer |
| **레포 잡무** | "파일 옮겨줘" → git·파일 정리 (코드 내용 수정 아님) | repo-janitor |
| **엑셀·스프레드시트** | xlsx/csv 가공 | spreadsheet-editor |
| **문서·코드맵 갱신** | "README 갱신", "코드맵 갱신", 기능 완료 후 문서 반영 | doc-updater |
| **프로젝트 구조·데이터흐름 파악** | "데이터플로우 그려줘", "이 프로젝트 구조 파악해줘", "API 뭐뭐 있는지 보여줘", AI가 짜준 코드를 넘겨받아 훑어야 할 때 → 단일 HTML 지도 생성 (읽기 전용, 코드 수정 안 함) | `flowmap` 스킬 |
| **신규 API 계약 설계** | 새 엔드포인트, 업로드 API, 관리자 API → Zod 스키마 1개에서 백엔드·프론트·타입 동시 생성 | api-contract-designer |
| **디자인 토큰·CSS 일관성** | "공용 컴포넌트 만들어줘", 하드코딩 컬러·radius 정리 | ui-design-system |
| **자소서·지원서** | "자소서 써줘" | jasoseo-writer |
| **PastLetter 이미지 프롬프트** | 모두의창업2차 지원서 `[사진: 설명]` 자리·홍보용 이미지 생성 프롬프트 작성 (PastLetter 전용, 실제 이미지 생성은 안 함) | pastletter-image-prompt-writer |
| **판정 대리** | 사용자가 "판정 에이전트 써", "lee-wonho한테 물어봐"처럼 명시적으로 요청했을 때만. 질문 전 자동 경유 금지(2026-09-29) | lee-wonho |
| **웰콘 사업 자문 판단** | 콘텐츠 해외진출 기업정보 구축 기획(1단계) 웰콘 프로젝트 관련 설계 판단 | welcon-advisor |

| **신규 2D 액션 게임 제작 (전체 파이프라인)** | "2D 게임 만들어줘", "이런 게임 Unity로", `/game2d <컨셉>` -> lantern-rite 템플릿 복제 -> 설계 3문서 -> 골격 -> 이미지 시트 -> 절단 -> 손맛 -> 3중 검증 -> 플레이테스트. 에이전트 4종 배정 순서는 스킬이 정한다 | `game2d-pipeline` 스킬 |
| **굼구미 시네마틱 과학 영상** | "굼구미 시네마틱", "시네마틱 과학 영상", "코드로 과학 애니메이션", `/gumgumi-cinematic <주제>` -> TTS 내레이션 과학 쇼츠(채널 인트로·제목카드·아웃트로 포함, 기본 9:16, 60초 이하). 영상 생성 AI 없이 코드로 매 프레임을 그림(엔진 `claude-animation/engine/`, 기준 샘플 `claude-animation/gumgumi-intro/`). planner(설명 사슬 먼저·스토리보드·자막) -> explain-reviewer(시청자 시점 설명 검토) -> 사용자 승인 -> animator(장면 코드·도식 헬퍼·정지컷 점검·렌더) -> `shorts/ko` 배포(2026-09-28부로 en 미제작) | `gumgumi-cinematic` 스킬 (gumgumi-cinematic-planner -> gumgumi-explain-reviewer -> gumgumi-animator) |
| **Readdy Interactive Cinematic 영상 생성** | "영상 생성해줘", "트레일러 만들어줘", "로그인 화면 움직이는 영상", "Readdy로 영상", "인터랙티브 시네마틱" -> 기획(필요 영상 목록·체이닝 여부) -> 첫/마지막 프레임 이미지 준비(재사용 우선) -> 영어 프롬프트 작성(얼굴/눈 잠금 등 하드룰) -> Playwright로 탭별 생성요청 제출(기본은 제출만, 대기 안 함) -> 완료 후 다운로드·검증. 실제 화면 배선(엔진 코드)은 대상 프로젝트 구현 에이전트가 이어받는다 | `readdy-cinematic` 스킬 |
| **Lantern Rite / Unity 2D 벨트액션 구현** | `/mnt/c/Users/admin/Desktop/games/lantern-rite/` 의 C# 코드·SceneBuilder·ArtImporter·BuildGame 헤드리스 파이프라인 작성/수정 ("씬 만들어줘", "빌더 고쳐줘", "프리팹 배선"). 신규 2D 액션 게임도 이 4종을 그대로 쓴다 (`lantern-rite/docs/PLAYBOOK.md`가 절차 SSOT) | unity2d-scene-architect |
| **Lantern Rite 손맛 튜닝** | 콤보 버퍼·런처/저글·히트스톱·흔들림·접점·밀어내기·깊이 판정 등 전투 감각 코드 조정 ("타격감", "손맛", "판정 이상해") - 결함 판정은 오케스트레이터가 코드를 직접 읽고 내린 뒤 위임 | game-feel-tuner |
| **AI 스프라이트 시트 절단** | 사용자가 웹에서 만든 시트(`art/incoming/NN_*.png`)를 `art/tools/process_incoming.py`로 프레임화·수치 검증·오버뷰 생성 ("시트 잘라줘", "프레임 정렬", "캐릭터 잘림/작아짐"은 이미지 단계 문제) | sprite-sheet-slicer |
| **Unity 빌드 3중 검증** | 배치 로그 + .prefab/.unity guid 참조 개수 + `-lr-autoshot` 게임 내부 스크린샷/Player.log. 창 활성화·SendKeys 절대 금지 ("빌드 검증", "배선 확인") | unity-build-verifier |
| **게임 에셋 생성** | "에셋 생성해줘", "이미지 뽑아줘", "캐릭터 시트 만들어줘", "에셋 프롬프트 써줘" → 대상 게임 프로젝트(Unity·Godot 등 무관) 기준으로 프롬프트 작성부터 실제 이미지 생성까지 한 에이전트가 전담(2026-09-01 asset-prompt-writer+game-asset-generator 통합, 특정 프로젝트 한정 없음). 2026-09-19부로 Codex 기반 gpt-image는 완전히 쓰지 않는다("코덱스는 안써 이제") - 알파(투명 배경)가 필요한 에셋도 예외 없이 flow-nanobanana로 마젠타 배경을 생성한 뒤 자체 크로마키 도구로 알파를 만든다 - 상세는 game-asset-artist.md "사용 도구" 절. 스폰된 에이전트에 Playwright 도구가 전달되지 않는 세션에서는 브라우저 조작만 오케스트레이터가 flow-nanobanana 스킬대로 직접 한다(2026-09-20 실측). 씬/엔진 배선은 대상 프로젝트의 구현 에이전트가 이어받는다 | game-asset-artist |

> **Lantern Rite 에이전트 4종은 심볼릭 링크다** (2026-09-15). 원본 `lantern-rite/.claude/agents/`, `project/.claude/agents/`에는 링크. 교훈 SSOT는 `lantern-rite/docs/LESSONS.md`, 재현 절차는 `docs/PLAYBOOK.md`, 프롬프트 규칙은 `docs/PROMPT_RULES.md`. 이미지 결함(잘림·축소·정렬)은 코드가 아니라 절단 도구/재생성으로 고친다(사용자 지시).

### STEP 1-1: 평가 에이전트 사용 제약 (agent-evaluator-v2 / skill-evaluator)

> 두 에이전트는 **신규 생성·대폭 수정 직후 1회 점검**에만 쓴다.
> 90점/100점 목표로 반복 재평가하는 **점수 루프는 금지**한다 (메모리 `feedback_no_agent_score_loop`).
> "최상급"의 기준은 점수가 아니라 실제 안전성·정확성 개선이다.

### STEP 1-2: 낭비 금지 (2026-09-16 실측 기반 신설)

> 사용자 지적: "웹개발은 피드백이 빠른데 너무 느리고 토큰을 항상 많이 먹는다. 쓸데없이 낭비하는 건 안 된다."
> 아래는 게임 레포 실측으로 확정했고, 느림의 4분의 3이 구조가 아니라 오케스트레이터 습관이었다.

1. **커밋·푸시는 오케스트레이터가 Bash로 직접 한다.** 에이전트를 스폰하지 않는다.
   근거: 커밋 에이전트 4회에 45~63k 토큰씩, 합계 20만 토큰 초과. 실제 작업은 git 3줄이었다.
   커밋 전 `git status --porcelain`은 눈으로 확인한다.
2. **스폰 전에 대상 파일 경로·함수명을 프롬프트에 박아준다.** 레포에 코드맵이 있으면 거기서 찾아 적는다.
   근거: 경로를 안 주고 보낸 작업이 도구 호출 190회, 42만 토큰, 37분. 대부분 "어디에 뭐가 있나" 탐색이었다.
3. **단순 수치·문자열·픽셀 조정은 위임하지 않는다.** 직접 고치고 필요한 검증만 태운다.
   "좌우 20px 줄여줘"에 전수조사·재검증·테스트 스위트를 붙이지 않는다.
4. **요구되지 않은 자체 검증을 붙이지 않는다.** 스크린샷·플레이·회귀 전수조사는 사용자가 요청했을 때만.
5. **검증·빌드는 배치 끝에 1회.** 항목마다 돌리지 않는다.
6. **보고 줄 수 상한을 프롬프트에 적는다.** 로그 원문·코드 블록 붙여넣기를 금지한다.

### STEP 2: 코드 리뷰

여러 파일에 걸친 코드 변경 뒤에는 code-reviewer 스킬을 실행한다. 단건·소규모 수정에는 붙이지 않는다.

---

## 에이전트 모델·effort 정책 (2026-09-29 개정)

> 기본은 `model: sonnet` + `effort: low|medium`. **sonnet high는 쓰지 않는다** - high가 필요한 작업은 `model: opus` + `effort: low`로 한다(사용자 지시 2026-09-29 "소넷 high로 할 바에 opus low로 하지").
> high급 작업은 **코드 검증에 한한다**(현재 security-reviewer·database-reviewer·function-validator). 코드 검증 외에는 high를 쓰지 않는다. haiku·fable은 정의파일에 쓰지 않는다.
> (막혔을 때 `Agent` 도구의 `model` 파라미터로 그 작업 1건만 승인 후 상향하는 것은 별개 - `rules/performance.md`)
>
> **정의파일 줄 수 상한 (2026-09-29 개정)**: 일반 에이전트 150줄, 프로젝트 특화 파이프라인(shortform·gumgumi·game 등) 250줄. 스타 상위 레포 표본(약 330개)의 중앙값 80~290줄, 500줄 초과 0개 기준. 남길 줄의 기준은 "이 줄을 빼면 Claude가 실수하나?"이고, 모델이 이미 아는 일반 지식(OWASP 예제·테스트 프레임워크 문법·범용 체크리스트)은 쓰지 않는다. 정의파일에는 판단 규칙만 둔다. 코드 예제·구현 골격이 길어지면 `.claude/agent-refs/<주제>.md` 로 분리하고, 정의파일 상단에 "참조 파일 (필요할 때만 읽는다)" 표로 **언제 읽는지** 조건을 명시한다. `agents/` 하위에 두면 에이전트로 스캔될 수 있으므로 반드시 `agent-refs/` 에 둔다.
>
---

## Available Agents

실존 에이전트의 이름·역할·트리거는 **하네스가 매 세션 "Available agent types" 목록으로 자동 주입**한다(각 정의파일의 `description` 필드가 원본). 같은 내용을 여기 표로 다시 적으면 상시 로드 컨텍스트만 두 배로 먹고 drift가 생기므로, 목록을 중복 기재하지 않는다.

- 실제 목록 확인: 자동 주입된 에이전트 목록 또는 `ls .claude/agents/*.md`
- **역할·트리거 정의를 바꾸려면** 해당 `agents/<name>.md`의 `description`을 고친다(그게 SSOT다)
- **요청 → 에이전트 라우팅**은 위 STEP 1 표가 담당한다(트리거 한국어 표현 기준, description에 없는 정보)
- 퇴역한 에이전트·신규 생성 체크리스트·필드명 전면 변경 절차는 `docs/agents-reference.md`
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
1. [재현 어렵거나 회귀 위험 클 때만] tdd-guide (재현 테스트 작성)
2. 메인 직접 또는 react-specialist / express-engineer (수정)
3. [여러 파일 수정 시에만] code-reviewer (리뷰)
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

---

## Parallel Task Execution

독립 작업은 병렬로 실행한다:

```
GOOD: 여러 파일 리뷰 → 파일당 에이전트 1개 병렬 실행
BAD:  파일 1 리뷰 완료 → 파일 2 리뷰 시작 (순차)
```
