# 묶음 R: .claude/CLAUDE.md + rules/ 8개

타깃 모델: Claude Opus 5.5 (이 세션 모델). `~/.claude/CLAUDE.md`는 0줄이라 finding 없음. 신구 판정은 `git blame` 기준.

## High

| # | 위치 | 근거 | 패턴 | 왜 낡았나 | 조치 |
|---|---|---|---|---|---|
| R1 | CLAUDE.md:58-65 | "project/ ├── frontend/ ├── backend/ └── tests/" | G2 Volatile specifics | `project/frontend`, `backend`, `tests` 모두 없다(backend는 git status상 삭제됨). 실제는 하위 프로젝트 여러 개를 담는 작업 루트 | rewrite: 작업 루트 + 하위 프로젝트별 `.claude/CLAUDE.md` 설명 |
| R2 | rules/performance.md:45-48 | "Sonnet 5: $3 / $15", "Opus 5 ... 약 1.7배" | G2 Volatile specifics | 현재 가격표와 다르다(Sonnet 5 계열 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50). 모델 상향 판단 근거가 틀린 숫자 | rewrite: 현행 모델·가격 |
| R3 | rules/testing.md:24, :31 | "Use tdd-guide agent", "tdd-guide - Use PROACTIVELY for new features" | G2 충돌 | rules/agents.md:35(2026-10-01)와 tdd-guide 정의는 "재현 어렵거나 회귀 위험 큰 경우만". testing.md는 2026-03-10 | rewrite |
| R4 | rules/agents.md:36 | "리팩토링 ... '분리해' → planner → refactor-cleaner" | G2 충돌 | refactor-cleaner 정의(10-01)는 "컴포넌트 분리·구조 개편은 대상 아님". 행은 2026-04-21 | rewrite: 구조 개편과 미사용 정리를 나눔 |
| R5 | rules/agents.md:34, :134-140 | 기능 구현은 항상 planner, 표준 워크플로우에 code-reviewer·tdd-guide 고정 | G2 충돌 | CLAUDE.md:34,:75(09-29)는 "plan→implement→review는 여러 파일 신규 기능에만, code-reviewer는 단건에 붙이지 않음". 행은 04-21 | rewrite |

## Medium

| # | 위치 | 근거 | 패턴 | 왜 낡았나 | 조치 |
|---|---|---|---|---|---|
| R6 | rules/agents.md:23 | STEP 0 "파일·레포 잡무 (커밋·푸시·...) → repo-janitor" | G2 충돌(같은 파일) | 같은 파일 STEP 1-2 #1과 CLAUDE.md:23은 "커밋·푸시는 메인이 Bash로 직접" | rewrite: 커밋·푸시 제외 |
| R7 | rules/performance.md:14 | "나머지 작업은 계속 Sonnet으로 돌아간다" | G2 Volatile specifics | 메인 세션 기본 모델이 Opus 5.5로 바뀌었다(2026-09-29 /model) | rewrite: "원래 모델 그대로" |
| R8 | rules/performance.md:55-66 | "Avoid last 20% of context window for..." | G1d 화석 / G2 | 자동 compaction이 있어 컨텍스트 끝을 피할 이유가 없고, 하네스는 "일찍 정리할 필요 없다"고 지시. 2026-03-10 템플릿 원문 | remove |
| R9 | rules/performance.md:80-86 | "If build fails: 1. Use build-error-resolver agent 2. Analyze... 4. Verify" | G2 충돌 + G1c | CLAUDE.md:23(09-29)은 빌드·테스트를 메인이 직접. 2~4단계는 일반 상식 | rewrite: 단건은 직접, 길면 위임 |
| R10 | rules/performance.md:10 | "Opus 4 베이스(claude-opus-4)는 2026-06-15 deprecated" | G1d 화석 | 아무 행동도 바꾸지 않는 퇴역 모델 메모 | remove |
| R11 | rules/coding-style.md:3, :44 | "Immutability (CRITICAL)", "ALWAYS handle errors comprehensively" | G1a 압력 언어 | 이유 없는 대문자 강조. 현재 모델은 과적용 | rewrite |
| R12 | rules/coding-style.md:60-70 | Code Quality Checklist 8항목 | G2 row 1 / G1c | 가독성·짧은 함수·깊은 중첩은 모델 기본값. 500줄·불변은 같은 파일 위에 이미 있음 | rewrite: 프로젝트 고유 2항목만 |
| R13 | rules/security.md 전체 | "Before ANY commit: [ ] ... Rate limiting on all endpoints", "STOP immediately", 일반 예제 코드 | G1d 강제 안 되는 지시 + G1a + G2 row 1 | 훅이 없어(rules/hooks.md) 커밋 전 체크리스트를 강제하는 장치가 없고, 항목 대부분이 일반 지식 | rewrite: 비밀키·security-reviewer 위임만 |
| R14 | rules/hooks.md:9-12, :22-25 | skill-fog 제거 이력·백업 경로, "TodoWrite 활용" | G2 History narratives / Volatile | 이력은 행동을 바꾸지 않음. TodoWrite는 현재 세션 도구 목록에 없음 | remove |
| R15 | rules/git-workflow.md:37 | "planner → 전문 에이전트 → code-reviewer" | G2 (R5 연동) | R5 수정 후 표현을 맞춤 | rewrite |

## Low / flag

- **F-R1 rules/git-workflow.md:13** "Attribution disabled globally via ~/.claude/settings.json": settings는 읽지 않아 확인 불가. 이 세션 하네스는 커밋에 Co-Authored-By를 붙이라고 안내했고 실제 커밋(0486d1c, 18541ce)에 붙었다. 의도와 다르면 사용자가 정할 것.
- **F-R2 CLAUDE.md:75** "실사용 1위(264회)": 날짜 없는 통계. 판단에 영향 적음.
- **F-R3 rules/agents.md:9-27** STEP 0 "실측 건수" 열: 이력 수치. 행동에는 영향 없음.
