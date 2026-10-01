# C 패치 인덱스 (finding ID -> 파일:라인)

- C.patch: `cd /home/lee/project && patch -p1 < C.patch` (70 hunk, dry-run 성공)
- C-global.patch: `cd /home/lee && patch -p1 < C-global.patch` (3 hunk, dry-run 성공) - **모든 프로젝트 영향**
- 라인 번호는 원본 기준. 한 hunk에는 한 finding만 들어 있다. 한 finding이 여러 hunk로 나뉜 경우는 아래에 모두 적었다.
- 원본 사본: `audit/C/orig/`(프로젝트), `audit/C/orig-global/`(/home/lee 기준). 수정본: `audit/C/new/`, `audit/C/new-global/`.
- AGENTS.md, tdd.md는 인접 finding이 한 hunk로 합쳐지지 않도록 `-U0`(무문맥)으로 만들었다. 나머지는 `-U1`.
- AGENTS.md에는 CRLF 줄이 섞여 있다(24, 296, 372, 416, 454, 496, 589, 633, 664행). 수정 대상이 아니어서 그대로 유지했다.

## C.patch (프로젝트)

| ID | 파일:원본라인 | hunk 헤더 | 비고 |
|---|---|---|---|
| A1 | .agents/rules/AGENTS.md:36 | @@ -36 +36 @@ | syntax-validator 언급 제거 |
| A1 | .agents/rules/AGENTS.md:85 | @@ -85 +70,0 @@ | study-notes-editor 행 삭제 |
| A1 | .agents/rules/AGENTS.md:113 | @@ -113 +98 @@ | 점검만 행을 build-error-resolver 점검 모드로 |
| A1 | .agents/rules/AGENTS.md:116 | @@ -116 +100,0 @@ | linker-html-to-vue 행 삭제 |
| A1 | .agents/rules/AGENTS.md:123 | @@ -123 +106,0 @@ | study-notes-editor 행 삭제 |
| M10 | .agents/rules/AGENTS.md:41-56 | @@ -41,16 +41,2 @@ | 함수 단위 병렬 강제를 선택형으로 |
| A3 | .agents/rules/AGENTS.md:130 | @@ -130 +113 @@ | .claude/rules/agents.md:68 문구 |
| A4 | .agents/rules/AGENTS.md:139 | @@ -139 +122 @@ | .claude/rules/agents.md:78 문구 |
| A2 | .agents/rules/AGENTS.md:141 | @@ -141 +124 @@ | .agy -> .claude |
| A5 | .agents/rules/AGENTS.md:165-169 | @@ -165 +148 @@, @@ -167,3 +150 @@ | code-reviewer 예외 없음 -> 여러 파일 변경 시 |
| A2 | .agents/rules/AGENTS.md:186 | @@ -186 +167 @@ | .agy/agent-refs -> .claude/agent-refs |
| A8 | .agents/rules/AGENTS.md:196 | @@ -196 +177 @@ | 90점 배포 -> 1회 점검(점수 루프 금지) |
| A2 | .agents/rules/AGENTS.md:204 | @@ -204 +185 @@ | ls .agy/agents -> .claude/agents |
| M11 | .agents/rules/AGENTS.md:263 | @@ -263 +244 @@ | ALWAYS 제거 |
| M11 | .agents/rules/AGENTS.md:270-278 | @@ -270,9 +250,0 @@ | Multi-Perspective 절 삭제 |
| A2 | .agents/rules/AGENTS.md:283 | @@ -283 +255 @@ | .agy/agents-archive |
| A2 | .agents/rules/AGENTS.md:288-289 | @@ -288,2 +260,2 @@ | project/.agy/agents |
| A2 | .agents/rules/AGENTS.md:390 | @@ -390 +362 @@ | ~/.agy/settings.json |
| A2 | .agents/rules/AGENTS.md:410 | @@ -410 +382 @@ | 브랜치명 agy/agy_w -> claude/claude_w |
| A2 | .agents/rules/AGENTS.md:511 | @@ -511 +483 @@ | agy-sonnet-5 -> claude-sonnet-5 (A7 sonnet 단일 정책 본문은 미변경) |
| A2 | .agents/rules/AGENTS.md:516 | @@ -516 +488 @@ | agy-opus-4 -> claude-opus-4 |
| A9 | .agents/rules/AGENTS.md:574-580 | @@ -574 +546 @@, @@ -576,5 +548 @@ | performance.md:68-70 문단으로 교체 |
| A2 | .agents/rules/AGENTS.md:604 | @@ -604 +572 @@ | .agy/CLAUDE.md |
| A2 | .agents/rules/AGENTS.md:641 | @@ -641 +609 @@ | ~/.agy/settings.json |
| A2 | .agents/rules/AGENTS.md:648-650 | @@ -648,3 +616,3 @@ | ~/.agy 백업 경로 |
| A2 | .agents/rules/AGENTS.md:658 | @@ -658 +626 @@ | ~/.agy/settings.json |
| M5 | .claude/commands/build-fix.md:2 | @@ -2,2 +2,4 @@ | build-error-resolver 위임 줄 추가 |
| M5 | .claude/commands/build-fix.md:29 | @@ -28,2 +30,2 @@ | 일괄 수정 허용 |
| C7 | .claude/commands/code-review.md:21 | @@ -20,3 +20,3 @@ | 800 -> 500줄 |
| M4 | .claude/commands/code-review.md:40 | @@ -39,3 +39,3 @@ | 커밋 차단 -> 커밋 보류 권장 |
| M3 | .claude/commands/dispatch.md:32-33 | @@ -31,4 +31,4 @@ | 기능·버그 워크플로우 |
| M3 | .claude/commands/dispatch.md:37 | @@ -36,3 +36,3 @@ | 리팩토링 워크플로우 |
| C6 | .claude/commands/dispatch.md:46 | @@ -45,3 +45,3 @@ | dispatcher 에이전트 -> 스킬 |
| M2 | .claude/commands/e2e.md:43-207 | @@ -43,165 +43,7 @@ | 예측시장 예시 -> 출력 골격 |
| M7 | .claude/commands/e2e.md:282 | @@ -281,3 +123,3 @@ | upload-artifact@v3 -> @v4 |
| M2 | .claude/commands/e2e.md:288-308 | @@ -287,23 +129,2 @@ | 지갑·거래 우선순위 플로우 삭제 |
| M2 | .claude/commands/e2e.md:327-334 | @@ -326,10 +147,2 @@ | 테스트넷·금융 주의 삭제 |
| M6 | .claude/commands/e2e.md:345 | @@ -344,3 +157,3 @@ | 표 2곳 -> STEP 1 표 |
| M3 | .claude/commands/orchestrate.md:14 | @@ -13,3 +13,3 @@ | feature 체인 |
| C4 | .claude/commands/orchestrate.md:20 | @@ -19,3 +19,3 @@ | explorer 제거 |
| M3 | .claude/commands/orchestrate.md:26 | @@ -25,3 +25,3 @@ | refactor 체인 |
| C5 | .claude/commands/orchestrate.md:87 | @@ -86,3 +86,3 @@ | code-reviewer는 스킬 |
| C5 | .claude/commands/orchestrate.md:91 | @@ -90,3 +90,3 @@ | HANDOFF 출력 -> 결과 전달 |
| C5 | .claude/commands/orchestrate.md:143 | @@ -142,3 +142,2 @@ | 병렬 단계에서 code-reviewer 제거 |
| C5 | .claude/commands/orchestrate.md:169 | @@ -168,3 +167,3 @@ | 항상 -> 여러 파일 변경이면 |
| C1 | .claude/commands/plan.md:86-89 | @@ -85,6 +85,2 @@ | 시간 견적 삭제 |
| C2 | .claude/commands/plan.md:113 | @@ -112,2 +108,2 @@ | ~/.claude/agents -> .claude/agents |
| C8 | .claude/commands/refactor-clean.md:12-30 | @@ -11,20 +11,8 @@ | 2단계(보고 후 승인 목록만 제거) |
| C9 | .claude/commands/setup-pm.md:1-80 | @@ -1,80 +0,0 @@ | **파일 삭제 - 승인 필요** (+++ /dev/null) |
| M8 | .claude/commands/skill-create.md:4 | @@ -3,3 +3,3 @@ | allowed_tools -> allowed-tools |
| C10 | .claude/commands/skill-create.md:17 | @@ -16,3 +16,2 @@ | --instincts 사용법 삭제 |
| C10 | .claude/commands/skill-create.md:25 | @@ -24,3 +23,2 @@ | 본능 생성 단계 삭제 |
| C10 | .claude/commands/skill-create.md:82-104 | @@ -81,25 +79,2 @@ | 단계 4 본능 생성 절 삭제 |
| C10 | .claude/commands/skill-create.md:166-171 | @@ -165,8 +140,2 @@ | /instinct-*, /evolve 관련 명령 삭제 |
| C3 | .claude/commands/tdd.md:2 | @@ -2 +2 @@ | description 80% 보장 |
| M1 | .claude/commands/tdd.md:7 | @@ -7 +7 @@ | 구현은 위임 |
| C3 | .claude/commands/tdd.md:15 | @@ -15 +15 @@ | 커버리지 측정만 |
| M1 | .claude/commands/tdd.md:20-24 | @@ -20,5 +20,3 @@ | 사용 범위 축소 |
| M1 | .claude/commands/tdd.md:33 | @@ -33 +31 @@ | 구현 위임 |
| C3 | .claude/commands/tdd.md:36 | @@ -36 +34 @@ | 80% 미만 보강 -> 측정만 |
| M2 | .claude/commands/tdd.md:49-254 | @@ -49 +47 @@, @@ -52,202 +50,6 @@ | 유동성 점수 예시 -> 출력 골격 |
| C3 | .claude/commands/tdd.md:264 | @@ -264 +66 @@ | 모범 사례 80% |
| C3 | .claude/commands/tdd.md:293-300 | @@ -293 +95 @@, @@ -295,6 +97 @@ | 커버리지 요구사항 절 |
| C2 | .claude/commands/tdd.md:323-326 | @@ -323,4 +120 @@ | 에이전트 경로 수정, tdd-workflow 삭제 |
| C11 | .claude/commands/update-codemaps.md:2-10 | @@ -2,2 +2,4 @@, @@ -5,7 +7,5 @@ | doc-updater 위임 + docs/CODEMAPS 규격 |

## C-global.patch (/home/lee 기준) - 모든 프로젝트 영향

| ID | 파일:원본라인 | hunk 헤더 | 비고 |
|---|---|---|---|
| S1 | ~/.claude/skills/test-plugin/SKILL.md:1-10 | @@ -1,10 +0,0 @@ | **파일 삭제 - 승인 필요**, 모든 프로젝트 영향. 삭제되는 원문 3행에 em-dash 포함(원본 그대로) |
| S1 | ~/.claude/skills/test-plugin/.claude-plugin/plugin.json:1-13 | @@ -1,13 +0,0 @@ | **파일 삭제 - 승인 필요**, 모든 프로젝트 영향. 빈 디렉토리 2개는 patch가 지우지 않으므로 별도 정리 필요 |
| M9 | project/tools/gpt-image-skill/gpt-image/SKILL.md:142 (~/.claude/skills/gpt-image 링크 대상) | @@ -141,3 +141,3 @@ | Star 요청 문구 삭제, 모든 프로젝트 영향 |

## 포함하지 않은 finding

- A6, A7, M12, M13, S2: 지시에 따라 제외(flag).
- L1-L5: Low라서 제외.
- M2 중 plan.md 예시(38-84행): C1(86-89행)과 같은 예시 블록 안이라 hunk를 finding별로 분리할 수 없어 제외. C1만 반영.
