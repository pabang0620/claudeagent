# 묶음 C: commands/ 12개, 홈 스킬(gpt-image, test-plugin), 하위 지침(ai-hanjul-diary, 완성레포, .agents/rules/AGENTS.md)

타깃 모델: Claude Opus 5.5. synced 스킬은 보고만. 신구 판정이 git으로 안 되는 충돌은 2026-09-29 결정이 반영된 `.claude/rules`를 최신으로 가정.
그룹별: G1 9 / G2 30 / G3 1 / G4 해당 없음.

## High

| ID | 위치 | 근거 | 패턴 | 왜 낡았나 | 조치 |
|---|---|---|---|---|---|
| A1 | .agents/rules/AGENTS.md:36,85,113,116,123 | syntax-validator·linker-html-to-vue·study-notes-editor 라우팅 | G2 Volatile | 셋 다 2026-09-29 agents-archive로 보관 | 행 remove, :113 "점검만"은 build-error-resolver 점검 모드로 rewrite |
| A2 | .agents/rules/AGENTS.md:141,186,204,283,390,410,511,516,604,641-658 | `.agy/agents/`, `~/.agy/...`, `agy-sonnet-5`, 브랜치 `agy/agy_w` | G2 Volatile | "claude"→"agy" 일괄 치환 흔적. `.agy` 경로 없음, 브랜치·모델 ID까지 오염 | rewrite: 원래 `.claude/...`와 브랜치명으로 |
| A3 | .agents/rules/AGENTS.md:130 | "판정 대리 ... 모든 순간 → lee-wonho" | G2 충돌 | rules/agents.md:68 "명시적 요청 시만"(09-29) | rewrite |
| A4 | .agents/rules/AGENTS.md:139 | game-asset-artist가 gpt-image로 PNG 생성 | G2 충돌 | rules/agents.md:78 "gpt-image 완전 중단(09-19)" | rewrite |
| A5 | .agents/rules/AGENTS.md:165-169 | "코드 변경 후 필수(예외 없음) ... 반드시 code-reviewer" | G2 + G1a | agents.md:106, CLAUDE.md:75 "단건에는 붙이지 않음" | rewrite |
| A6 | .agents/rules/AGENTS.md:66,171-176 | "오케스트레이터는 절대 코드를 직접 작성하지 않는다" | G2 충돌 | CLAUDE.md:23 "메인이 직접"(09-29) | **flag**: 오래된 쪽이 금지 규칙 |
| A7 | .agents/rules/AGENTS.md:180-196,504-514 | "SONNET-ONLY ... opus 절대 금지" | G2 + G1a | performance.md:6 opus+low 3종 허용 | **flag**: 금지를 푸는 방향 |
| A8 | .agents/rules/AGENTS.md:196 vs :145-146 | "90점 이상 달성 후 배포" vs "점수 루프 금지" | G2 내부 모순 + G1c 채점 어휘 | 같은 파일 안 모순 | :196 rewrite "생성 직후 1회 점검" |
| A9 | .agents/rules/AGENTS.md:574-580 | "Use ultrathink ... multiple critique rounds" | G1b 사고 깊이 프롬프트 + G2 | Opus 5.5는 thinking 상시, 깊이는 effort. performance.md:70이 이미 폐기 | rewrite: performance.md:70 문단 |
| C1 | commands/plan.md:85-89 | "백엔드: 4-6시간 ... 총계: 9-13시간" | G1c 예시 과적합 + G2 | 일정 견적 금지 규칙, planner.md "공수 추정 안 씀" | remove |
| C2 | commands/plan.md:112-113, tdd.md:322-326 | `~/.claude/agents/planner.md`, `~/.claude/skills/tdd-workflow/` | G2 Volatile | 경로 없음. 실제는 `.claude/agents/`, tdd-workflow는 어디에도 없음 | rewrite / remove |
| C3 | commands/tdd.md:2,15,36,264,293-300 | "80%+ 커버리지 보장" | G2 충돌 | testing.md, tdd-guide.md: 80%는 인수 게이트만 | rewrite |
| C4 | commands/orchestrate.md:20 | `explorer -> tdd-guide -> code-reviewer` | G2 Volatile | explorer 에이전트 없음 | rewrite |
| C5 | commands/orchestrate.md:87-91,143,169 | "Code Reviewer Agent ... HANDOFF" | G2 Volatile | code-reviewer는 스킬 | rewrite |
| C6 | commands/dispatch.md:46 | "dispatcher 에이전트를 호출" | G2 Volatile | dispatcher는 스킬 | rewrite |
| C7 | commands/code-review.md:21 | "800줄을 초과하는 파일" | G2 충돌 | coding-style.md 500줄 | rewrite |
| C8 | commands/refactor-clean.md:12-26 | 보고서 생성 후 바로 삭제 적용 | G2 충돌 | refactor-cleaner.md 2단계(보고 → 승인 목록만 제거), CLAUDE.md 승인 없는 삭제 금지 | rewrite(더 엄격해지는 방향) |
| C9 | commands/setup-pm.md:14-23,79 | `node scripts/setup-package-manager.js` | G2 Volatile | 스크립트 없음, 파일 전체가 그 동작 설명 | remove 파일(승인 필요) |
| C10 | commands/skill-create.md:17,82-103,166-170 | `--instincts`, `/instinct-*`, `/evolve` | G2 Volatile | 커맨드 없음 | remove |
| C11 | commands/update-codemaps.md:6-10 | `codemaps/architecture.md ...` | G2 충돌 | doc-updater.md: `docs/CODEMAPS/INDEX.md` + 영역 파일 | rewrite |
| S1 | ~/.claude/skills/test-plugin/SKILL.md:3-10 | description "TODO - describe WHEN..." | G3 under-described | 플레이스홀더가 모든 세션 스킬 목록에 실림 | remove(승인 필요, **모든 프로젝트 영향**) |
| S2 | gpt-image/SKILL.md:3 | "transparent PNGs ..." 자동 발동 | G2 충돌 | agents.md:78, 메모리 "Codex 중단, 이미지는 flow-nanobanana" | **flag**: 전역 파일, `disable-model-invocation: true` 또는 링크 제거 중 사용자 결정 |

## Medium

| ID | 위치 | 근거 | 왜 낡았나 | 조치 |
|---|---|---|---|---|
| M1 | commands/tdd.md:7,19-36 | tdd-guide가 구현까지 한다 | tdd-guide.md: 테스트만 쓰고 구현 위임, 단건엔 안 씀 | rewrite |
| M2 | commands/tdd.md:49-254, plan.md:38-92, e2e.md:43-207,288-307,327-333 | 예측시장 앱 예시(유동성, Supabase, 지갑) | G1c 예시 과적합, 사용자 스택과 무관 | remove/축약 (plan.md 블록은 hunk 분리 불가로 패치 제외) |
| M3 | commands/orchestrate.md:14,26, dispatch.md:32-37 | feature/refactor/bug 체인 | agents.md 표준 워크플로우와 다름 | rewrite |
| M4 | commands/code-review.md:40 | "CRITICAL/HIGH 발견 시 커밋 차단" | G1d 강제 장치 없음(훅 없음) | rewrite "커밋 보류 권장" |
| M5 | commands/build-fix.md:29 | "한 번에 하나의 에러만 수정합니다!" | build-error-resolver는 같은 패턴 5개 이상 일괄 허용 | rewrite |
| M6 | commands/e2e.md:345 | "agents.md 표 2곳에 재등재" | Available Agents 표 없어짐 | rewrite "STEP 1 표" |
| M7 | commands/e2e.md:282 | `actions/upload-artifact@v3` | G2 버전 고정, v3 지원 종료(외부 사실) | rewrite @v4 |
| M8 | commands/skill-create.md:4 | `allowed_tools:` | 키는 `allowed-tools`(하이픈), 지금은 미적용 | rewrite |
| M9 | gpt-image/SKILL.md:142 | "request a Star politely" | G3 행동 끼워넣기, 서드파티 홍보가 응답에 섞임 | remove (**모든 프로젝트 영향**) |
| M10 | .agents/rules/AGENTS.md:41-56 | "일괄 분석 엄격히 금지 ... 반드시 함수별 1:1" | G1c + G1a, 낭비 금지와 충돌 | rewrite |
| M11 | .agents/rules/AGENTS.md:263,270-277 | "ALWAYS parallel", Multi-Perspective 5역할 | 최신 .claude 본에서 삭제됨 | rewrite / remove |
| M12 | .agents/rules/AGENTS.md:62 | "이 파일이 라우팅 SSOT" | .claude/rules/agents.md도 같은 주장, 정본 이중 | **flag** |
| M13 | 완성레포/CLAUDE.md:9 | "작업이 끝나면 깃허브에 push" | 완성레포에 .git 없음, 상위 레포가 push 대상이 됨 | **flag**(독자 배포물) |

## Low (flag)
- L1 .agents/rules/AGENTS.md:21 "Gemini 3.8 Flash High" 모델 고정
- L2 commands/e2e.md:9-10 "주의 (2026-08-20) ... 아카이빙" 이력 서술
- L3 gpt-image/references/platform-setup.md:40 설치 승인을 문서가 대신 부여한다는 주장
- L4 ai-hanjul-diary·완성레포 CLAUDE.md:57 / AGENTS.md:13 하위 `code-reviewer` 에이전트와 상위 `code-reviewer` 스킬 이름 중복
- L5 두 디렉토리 AGENTS.md가 독자용 안내문이라 AGENTS.md를 읽는 도구는 규칙을 못 받음(충돌은 아님)

## 깨끗함 / 보고만
- commands/update-docs.md 깨끗함. gpt-image references 2개 깨끗함.
- ai-hanjul-diary: CLAUDE.md와 AGENTS.md 내용은 다르나 모순 없음, 언급 경로·심볼 실재 확인.
- synced(보고만): docs, docx, import-memory, morning, pdf, pptx, skill-creator, xlsx, google-workspace
