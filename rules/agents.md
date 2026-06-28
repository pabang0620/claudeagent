# Agent Orchestration

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
| **에이전트 평가** | 에이전트 정의파일 품질 점검·개선 | agent-evaluator-v2 |
| **스킬 평가** | 스킬(.md) 품질 점검·개선 | skill-evaluator |

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

## 에이전트 모델 제약 (PERMANENT)

> **opus 절대 금지** — 모든 에이전트 정의파일의 `model:` 필드에 opus 사용 불가.
> 허용: `model: sonnet` 또는 `model: haiku`만 사용.
> `flutter-game-builder`는 빌드 워커 특성상 `model: haiku` 의도적 사용 (예외 아님, 정상).
>
> **신규 에이전트 생성 시 필수 체크리스트**:
> - [ ] frontmatter: `name`, `description`, `tools`, `model` 4개 필드 모두 포함
> - [ ] `model:` 값이 `sonnet` 또는 `haiku` 인지 확인 (opus 입력 시 즉시 거부)
> - [ ] `description`이 "언제 사용하는가"를 한 문장으로 설명하는지 확인
> - [ ] 생성 후 agent-evaluator 평가 → 90점 이상 달성 후 배포

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
| e2e-runner | E2E 테스트 | 핵심 사용자 플로우 |
| refactor-cleaner | 코드 정리·불필요 코드 제거 | 리팩토링 실행 |
| database-reviewer | DB 리뷰 (리뷰 전용) | 기존 쿼리/스키마/인덱스 감사 |
| doc-updater | 문서·코드맵 업데이트 | 기능 완료 후 |
| doc-generator | DOCX/한글 문서 생성 (계약서·보고서·제안서) | 문서 생성 요청 시 |
| project-bootstrapper | 신규 프로젝트 Day 0 셋업 | 새 프로젝트 초기화 |
| ui-design-system | 디자인 시스템·토큰 생성 | 디자인 토큰, 공용 컴포넌트 |
| jasoseo-writer | 자소서·지원서 작성 | 자소서, 자기소개서 요청 |
| flutter-game-builder | Flutter 게임 APK·웹 빌드 | Flutter 빌드 요청 |
| agent-evaluator | 에이전트 정의파일 품질 평가 (기본) | 에이전트 생성·수정 후 |
| agent-evaluator-v2 | 에이전트 정의파일 9관점 100점 평가·개선 | 에이전트 생성·수정 후 (권장) |
| skill-evaluator | 스킬(.md) 품질 평가·개선 (100점 척도) | 스킬 생성·수정 후 |
| proposal-pt-builder | 정부사업 RFP 제안 PT → Marp+PPTX | PT/발표자료 요청 시 |
| hwp-generator | HWPX 공문서 생성 (계약서·제안요청서·보고서·공문·계획서·회의록) | "hwp 만들어", "계약서", "제안요청서", ".hwpx" 요청 시 |
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
