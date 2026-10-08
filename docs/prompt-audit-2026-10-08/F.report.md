# 묶음 F 보고: 게임 레포 에이전트 14종 + starspire-common.md

정본 경로를 직접 편집했다(starspire main, dotRPG wonho). 게임 코드·문서·CLAUDE.md는 건드리지 않았고 커밋하지 않았다.
근거: 정의파일 정독 + 참조 경로·심볼 전수 ls/grep + 10-01 이후 스폰 프롬프트 표본(dotrpg-backend-coder 3, server-architect 2, economy-auditor 2, client-net 2, splitter 2, starspire-backend-coder 2, economy-auditor 2) + 메모리 11건.

## 적용

| 파일 | 변경 | 근거 |
|---|---|---|
| starspire-backend-coder.md | 에러 관용구를 실제 코드로 교정: `Object.assign(new Error)`(코드에 0건) -> `httpError(msg, status, code)`(181건) | 정의가 틀려 Sonnet이 코드와 다른 방식으로 쓸 위험 |
| 〃 | 돈 규칙 2(멱등성)를 실제 구현으로 교정: Service 안 재구현이 아니라 라우트에 `idempotency('<METHOD> <경로>')` 미들웨어, 다른 본문이면 409 | `middleware/idempotency.js` 실측 |
| 〃 | "이미 있는 공용 코드 먼저 쓴다" 목록(idempotency·rateLimiter·httpError·kst·clock·gameData·response, tests/helpers) 추가 | 스폰 프롬프트마다 반복해 적던 내용 |
| 〃 | "동시 작업·git" 절 신설: 소유 파일만, 시작 시 git status 기록, git 쓰기 명령 금지 | 서버 3종은 starspire-common.md를 참조하지 않아 git·동시작업 규칙이 없었다. 스폰 프롬프트마다 "커밋 금지" 반복 |
| 〃 | "프롬프트가 설계를 대신한다" 예외 명시 | 실측 스폰 전부가 이 문구를 썼는데 정의는 "설계 없으면 멈춤"만 있었다 |
| 〃 | `npm test` 전체 -> 바뀐 도메인만 `npm test -- tests/<도메인>`, 전체는 메인이 묶음 끝 1회. 테스트만 쓰는 작업의 버그는 `it.todo`+보고 | feedback_test_logic_first, feedback_starspire_light_testing |
| 〃 | 보고에 한국어·돌린 테스트 파일 명시 | - |
| starspire-server-architect.md | 산출물 `docs/server/<단계>_mapping.md` -> 실제 파일 `docs/server/mapping.md`(단일) | 실측: mapping.md 하나만 존재 |
| 〃 | 하지 않는 것에 git 쓰기·일정 견적·"확정" 요구 변경 추가 | feedback_no_timeline_estimates, 스폰 프롬프트 "확정, 바꾸지 말 것" 반복 |
| starspire-economy-auditor.md | Bash 허용을 대상 도메인 테스트로 한정, "다른 에이전트가 쓰는 중" 제외 영역 존중, 보고 한국어 | 스폰 프롬프트 반복 문구, 경량 테스트 정책 |
| starspire-common.md | 특정 세션의 더러운 파일 9개 열거(휘발성, `tools/flow/debug/`는 이미 없음) -> "시작 시 git status로 적어 두고 손대지 않는다" 규칙 + 영구 제외 3개 | 열거 목록은 한 세션 스냅샷이라 금방 낡는다 |
| 〃 | Unity 공식 플러그인 스킬 선독 규칙 추가(경로·대표 매핑·보고 명시·충돌 시 스킬 우선) | feedback_use_unity_plugin_skills(사용자 2026-09-16 지시)가 Unity 에이전트 4종 어디에도 없었다 |
| dotrpg-backend-coder.md | "동시 작업·git" 절 신설(브랜치 wonho 확인만, git 쓰기 금지, 소유 파일만, git status 기록) | dotRPG 6종 전부 git·브랜치 규칙이 없었고 스폰 프롬프트마다 "브랜치 wonho, 커밋 금지" 반복 |
| 〃 | 공용 코드 목록(AppError·idempotency·response·test/helpers)과 테스트 위치 `server/test/<이름>.test.ts` 명시 | 실측 |
| 〃 | "프롬프트가 설계를 대신한다" 예외 / `npm run build`+전체 `npm test` -> `npx tsc --noEmit`(타인 파일 오류 무시)+자기 테스트만 / `it.todo` 규칙 / 보고 한국어 | 실측 스폰 3건 전부 이 지시를 반복, IMPROVEMENT_PLAN 진행 원칙과 일치 |
| dotrpg-server-architect.md | 하지 않는 것에 git 쓰기·일정 견적·"확정" 요구 변경 추가 | 위와 같음 |
| dotrpg-economy-auditor.md | Bash 허용 범위 한정, 제외 영역 존중, 보고 한국어 | 스폰 1건이 영어로 나갔고 정의에 언어 지정이 없었다 |
| dotrpg-client-net-engineer.md, dotrpg-unity-splitter.md | 브랜치 wonho·git 쓰기 금지 한 줄(splitter는 `git show HEAD:` 읽기 허용 명시) | - |
| dotrpg-doc-syncer.md | git 금지 한 줄. "작업 방식" 절의 wt/* 워크트리 서술은 옛 체계라 main·jaein·wonho로 고쳐도 된다는 예외 | project_dotrpg_branches(2026-10-02 사용자 결정). 기존 규칙 4("결정 기록 불변")만으로는 낡은 브랜치 서술을 영영 못 고친다 |

확인한 것(수정 불필요): 참조 경로 50여 개 전부 존재(`tools/flow/debug/`만 없었고 삭제). 섹션 번호(SERVER_DEV_PLAN 3·6·7절, PLAN_SERVER §3·§5·§9, PLAN_ONLINE §5, PRELAUNCH 3절 J1·F6) 일치. AppError(status, message, code) 시그니처 일치. 모델·effort는 정책대로(구현 sonnet medium, 감사 2종 opus low). 읽기 전용 에이전트에 Write/Edit 없음. em-dash·이모지 없음. 서브에이전트가 할 수 없는 지시(사용자에게 묻기) 없음. starspire-deploy-engineer의 "y 입력 확인"은 배포 스크립트 설계 요구라 문제없음. 전부 250줄 상한 안(최대 54줄).

## flag (사용자·오케스트레이터 판단)

1. **dotRPG 공통 ref 부재.** 6종이 git·동시작업·보고 규칙을 각자 들고 있다. starspire처럼 `dotRPG/.claude/agent-refs/dotrpg-common.md`를 만들면 중복이 줄지만 새 파일 금지라 만들지 않았다.
2. **starspire 서버 3종이 starspire-common.md를 참조하지 않는다.** common은 C# 규칙 위주라 이번엔 서버 쪽에 필요한 줄만 복사해 넣었다. common을 "클라·서버 공통 절 + 클라 절"로 나누면 참조로 바꿀 수 있다.
3. **dotRPG 테스트 전체 실행 비용.** `npm test`는 매번 embedded-postgres를 새로 띄운다(scripts/test.mjs). 자기 테스트만 돌려도 DB 기동 비용은 같다. 테스트 파일 여러 개를 한 번에 `npm test -- a b c`로 묶어 돌리라는 지시를 스폰 프롬프트에 넣는 편이 낫다.
4. **starspire CLAUDE.md의 "자동 플레이 -autoplay" 줄.** 정책상 게임 실행은 요청 시만인데 CLAUDE.md 게임 절에 테스트 수단으로 나란히 적혀 있다(읽기만 했으므로 미수정).
5. **dotrpg-unity-splitter의 트리거 "개선 계획의 R 작업"**은 IMPROVEMENT_PLAN(2026-10-08 1회성)에 묶여 있다. 계획이 끝나면 description에서 그 문구를 빼는 게 맞다.

## 오케스트레이터 요청

- `rules/agents.md` STEP 1 "dotRPG 게임 서버" 행: 스폰 프롬프트에 "브랜치 wonho, 커밋 금지"를 더 적지 않아도 된다(정의에 들어감). 대신 **소유 파일 범위**와 **돌릴 테스트 파일 이름**은 계속 프롬프트에 적어야 한다.
- 같은 행에 "스폰 프롬프트가 설계를 대신할 때는 그 문구를 넣는다"를 한 줄 추가하면 backend-coder의 예외 규칙과 짝이 맞는다.
- dotRPG 에이전트 심볼릭 링크 6개가 `/home/lee/project/.claude`에서 untracked(`??`)다. 커밋 시 포함할 것.
- 게임 레포 두 곳의 `.claude/` 변경은 각 레포에서 따로 커밋해야 한다(starspire main, dotRPG wonho).

## 통계

| 파일 | 전 | 후 |
|---|---|---|
| starspire-backend-coder.md | 45 | 51 |
| starspire-server-architect.md | 40 | 42 |
| starspire-economy-auditor.md | 35 | 35 |
| starspire-common.md | 23 | 24 |
| starspire-battle/client-content/client-economy/deploy/ui | 29/24/25/26/26 | 변경 없음 |
| dotrpg-backend-coder.md | 48 | 54 |
| dotrpg-server-architect.md | 39 | 39 |
| dotrpg-economy-auditor.md | 35 | 35 |
| dotrpg-client-net-engineer.md | 38 | 38 |
| dotrpg-unity-splitter.md | 44 | 44 |
| dotrpg-doc-syncer.md | 31 | 31 |

diff: starspire `.claude/` 4 files +19/-10, dotRPG `.claude/` 6 files +17/-11. 커밋 안 함.

## 추가 적용 (flag 1·2·4 승인분)

1. **dotRPG 공통 ref 신설**: `/mnt/c/Users/admin/Desktop/games/dotRPG/.claude/agent-refs/dotrpg-common.md`(25줄, untracked). 브랜치·git / 동시 작업 / 하지 않는 것(컴파일·빌드·실행, 일정 견적, 확정 요구 변경, 설계 없는 테이블·API와 "프롬프트가 설계를 대신한다" 예외) / 서버 검증(tsc --noEmit, 자기 테스트만 묶어서 1회, it.todo) / 보고 형식. 6종 정의파일 상단에 "참조 파일 (필요할 때만 읽는다)" 표(매번, 작업 시작 전)로 연결하고, 중복됐던 git·브랜치·소유 파일·검증 줄을 지웠다. 남긴 고유 규칙: backend-coder 공용 코드 목록·실행 권한, net-engineer 서버 보장·재시도 규칙, splitter 분할 방법·검증 1~4, doc-syncer 브랜치 서술 예외, auditor Bash 읽기 전용 범위.
2. **starspire-common.md 재구성**(24 -> 34줄): "1. 클라·서버 공통"(동시 작업 / 하지 않는 것 / 보고)과 "2. 클라이언트(C#)"(코드 규칙 / 검증). 서버 3종(backend-coder, server-architect, economy-auditor)에 1절 참조 표를 넣고, 이전 회차에 복사해 넣었던 git·동시 작업·일정 견적 줄을 지웠다. 클라 5종은 이미 파일 전체를 "먼저 읽을 것 1번"으로 읽으므로 변경 없음.
3. **starspire `.claude/CLAUDE.md`** 게임 절 테스트 줄만: "게임 실행·자동 플레이(-autoplay ...)는 사용자가 요청할 때만". 다른 줄은 그대로.

검증: 교체 24건 전부 1회 일치, em-dash 0, 정의파일 최대 54줄. diff: starspire `.claude/` 5 files +47/-20(CLAUDE.md 1줄 포함), dotRPG `.claude/` 6 files 수정 + agent-refs/ 신규. 커밋 안 함.
