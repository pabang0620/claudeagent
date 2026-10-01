# 묶음 B: skills 18종 (dispatcher, mobile-first-checker, shortform, bgm-factory, postgres-patterns, deep-research, quote-builder, project-structure-guide, feature-critic, flowmap, code-reviewer, verify, checkpoint, readdy-cinematic, test-coverage, gumgumi-cinematic, flow-nanobanana, game2d-pipeline)

타깃 모델: frontmatter `model: sonnet` 6개(dispatcher, shortform, deep-research, feature-critic, flowmap, code-reviewer)는 Sonnet 5.5, 나머지 Opus 5.5.
그룹별: G1 4 / G2 26 / G3·G4 해당 없음.

## High

| # | 위치 | 근거 | 왜 낡았나 | 조치 |
|---|---|---|---|---|
| 1 | shortform/SKILL.md:5,47-67,77-93,156-158 / references/pipeline.md:9,60-75,129,140-141,170-172 | "기본 산출물은 언어별 mp4 2개", "한 언어만 만들고 끝내는 것" 금지 | G2 충돌. 스킬 08-08, shortform-builder/planner(10-01)는 "한국어 1개" | rewrite |
| 2 | gumgumi-cinematic/SKILL.md:76,83 | "출력 경로 2개", "최종 파일 2개" | G2 같은 파일 35행(09-29) "ko만"이 더 새로움 | rewrite |
| 3 | game2d-pipeline/SKILL.md:19,32 | gpt-image 프로브, `--reference` | G2 충돌. gpt-image 완전 중단(09-19) | rewrite: flow-nanobanana 경로 |
| 4 | game2d-pipeline/SKILL.md:41 | "repo-janitor로 커밋·푸시" | G2 충돌. STEP 1-2 #1 커밋은 메인 직접(09-16) | rewrite |
| 5 | game2d-pipeline/SKILL.md:12,28 | "손맛 결정 파일 수정은 Opus" | G2 충돌. opus는 코드검증 3종, 그 외는 승인 상향(09-29) | rewrite |
| 6 | code-reviewer/SKILL.md:7 | "Automatically triggers after any code changes" | G2 충돌. CLAUDE.md:75 단건엔 안 붙임. 내용이 반대라 keep list 6번 보호 안 됨 | rewrite |
| 7 | code-reviewer/SKILL.md:79,128 | ">800 lines", "200-400 lines typical" | G2 충돌. coding-style.md 500줄 | rewrite / remove |
| 8 | code-reviewer/SKILL.md:47 | "No duplicate code" | G2 충돌. 지역성 우선 | rewrite |
| 9 | project-structure-guide/SKILL.md:191,193,205 | "400 lines maximum" | G2 충돌. 500줄 규칙(07-28)이 더 새로움 | rewrite |
| 10 | postgres-patterns/SKILL.md:36,46-53 | ID 타입 uuid PK | G2 충돌. CLAUDE.md:95 이중 ID(bigserial PK + uuid). 같은 표 내부 모순도 해소 | rewrite |
| 11 | dispatcher/SKILL.md:84,97,103,121,124-125,137-138,169 | tdd-workflow, verification-loop, continuous-learning, /learn, /evolve | G2 Volatile, 모두 없음 | remove |
| 12 | dispatcher/SKILL.md:183 | "모든 에이전트는 model: sonnet 고정" | G2 충돌(같은 파일 186행, rules/agents.md) | rewrite |
| 13 | dispatcher/SKILL.md:214-290 | Auto-Matching, Workflow Templates | G2 충돌. 표준 워크플로우·CLAUDE.md와 다름 | rewrite: rules/agents.md 참조 한 줄 |
| 14 | checkpoint/SKILL.md:34 | `git add -A && git commit` | G2 충돌. CLAUDE.md:46 커밋 전 파일 목록 확인 | rewrite |
| 15 | quote-builder/SKILL.md:35,205 | "em대시(-) 금지, 하이픈(-) 사용", "em대시(-) 0개" | G2 일괄 치환으로 금지 문자가 하이픈이 됨 | rewrite |
| 16 | mobile-first-checker/SKILL.md:32,316 | "mf-000 ~ mf-008" | G2 같은 파일 mf-009~011이 실행 순서에서 빠짐 | rewrite |
| 17 | flow-nanobanana/SKILL.md:50-52,59 vs bgm-factory/SKILL.md:285 | delogo로 지운다 vs 잘라낸다 | G2 충돌, 같은 커밋이라 선후 불명. 메모리는 "자를 것" | **flag** |

## Medium

| # | 위치 | 근거 | 왜 낡았나 | 조치 |
|---|---|---|---|---|
| 18 | shortform/references/pipeline.md:124 vs 131-132 | "확인을 기다린다" vs "승인 질문 없이 복사" | G2 같은 파일 충돌 | rewrite |
| 19 | shortform/SKILL.md:106, pipeline.md:84,131,146,161 | "(2026-08-09 변경 ...)", "원칙은 폐기" | G1d 이전 버전 기준 서술 / G2 이력 | remove 괄호 이력 |
| 20 | flow-nanobanana/SKILL.md:44-45,80 | Approve 라디오 필수 vs 없이 시작됨 | G2 같은 파일 모순 | rewrite |
| 21 | flow-nanobanana/SKILL.md:15, bgm-factory/SKILL.md:17 | "서브에이전트는 Playwright를 못 받는다" | G2, rules/agents.md는 조건부 표현 | **flag** |
| 22 | readdy-cinematic/SKILL.md:12 | "브라우저 조작이지 위임 대상인 코드 작성이 아니다" | G2, 폐기된 "오케스트레이터 직접 금지" 전제 | rewrite |
| 23 | code-reviewer/SKILL.md:51,84 | "Good test coverage exists", "Missing tests" High | G2 충돌, testing.md 커버리지 비강제 | rewrite |
| 24 | test-coverage/SKILL.md:3,9,96 | "reach the 80% minimum" | G2 충돌, 80%는 인수 게이트만 | rewrite |
| 25 | project-structure-guide/SKILL.md:202 | "APIs used across multiple domains live in common/" | G2 충돌, 지역성 우선 | rewrite |
| 26 | mobile-first-checker/SKILL.md:326 | CLAUDE.md "파일 수정 승낙" 원칙 | G2 없는 참조 | rewrite |

## Low (flag)
- 27 mobile-first-checker:12,371-381 "자동 - 저장 직후"(훅 없음), WeCom 탐지 기대 수치 고정
- 28 bgm-factory:152 `ListAgents` 도구 전제, :250 `python` vs venv-main 불일치
- 29 gumgumi-cinematic:8-10 "퀄리티 미쳤네" 이력 서술
- 30 feature-critic:10 "Always use before ..." 트리거 문구, 라우팅 표에 없음
- 31 checkpoint:34 `checkpoint:` 접두사가 git-workflow types에 없음
- 32 game2d-pipeline:15,38 스크린샷 직접 확인 vs 메모리 "화면 검증 금지(Lantern Rite)"

## 깨끗함
deep-research, flowmap, verify. 경로 실재 확인 결과는 원 보고 기준(shortform·bgm·flowmap·readdy 스크립트 모두 존재, tdd-workflow 등 스킬·커맨드는 없음).
