# 에이전트·스킬·오케스트레이터 전면 감사 (2026-10-08)

사용자 지시: "에이전트·스킬·오케스트레이터 개선점을 아주 공격적으로 세밀하게 찾아서 전부 개선". 직전 감사(2026-10-01)가 지침 간 충돌·죽은 참조를 정리했으므로, 이번에는 (1) 실사용 실측 기반 구조 개선, (2) 하네스 변화(fork·Explore·메인 Fable) 반영, (3) 파일별 정독으로 남은 사실 오류·비대·서브에이전트 불가능 지시를 찾았다.

## 방법
- 오케스트레이터 층(CLAUDE.md, rules/, commands/, dispatcher, Cursor 규칙, docs)은 메인이 직접.
- 나머지는 8개 묶음을 `fork`(메인 모델·전체 맥락 상속)로 병렬 감사·수정. 묶음별 보고서는 이 폴더의 `*.report.md`(적용 / flag / 오케스트레이터 요청 / 통계).
- 수정 규칙: in-place Edit, 파일 삭제·이동 없음, 새 파일은 스크립트·참조 분리에만. 한국어, em-dash·이모지 0건, frontmatter 유효, 상한(일반 150줄·파이프라인 250줄) 전수 통과.

## 실측 (09-29 이후, 스폰 465건 중복 제거)
general-purpose 99(21%) > gumgumi 3종 159 > fork 28 > Explore 25 > dotRPG 6종 48 > starspire 8종 24 > express/react 각 2. code-reviewer 스킬 7회 전부 사용자 요청. 결론: 담당 에이전트는 잘 쓰이고 있으나 "맥락이 필요한 전수 점검·묶음 구현"과 "주제형 외부 조사"가 general-purpose로 새고 있었다.

## 오케스트레이터 층 변경
- rules/agents.md: STEP 0-1 "위임 수단 선택" 신설(fork / Explore / 전문 / general-purpose / deep-research). DB 행에 PostgreSQL·Prisma 설계 담당(메인) 명시, 버그 워크플로우를 tdd-guide RED-only에 맞춤, 게임 에셋 행 Codex 정책 현행화, 2D 게임 행 "전담 없음", 회의록·후속사업·PT 행에 2단계 스폰·입력 선취 규칙, 표 깨짐(빈 줄) 수정.
- rules/performance.md: 에스컬레이션 사다리를 "Sonnet 서브 → 메인/fork 직접 → 보고 후 멈춤"으로 개정(메인이 Fable이라 상위 모델 서브가 없다).
- rules/testing.md: "손테스트 직전 항상 E2E"가 자동 트리거로 오독되던 문장을 요청 시만으로 교정. git-workflow.md attribution 실측, hooks.md에 hooks.json 템플릿 잔재 경고.
- CLAUDE.md: Context7 MCP(미설치) 절 교체, 커맨드 개수 제거, 수단 선택 포인터, 막혔을 때 원칙 개정.
- commands/ 11개 전부 재작성(962 → 278줄): frontmatter description 추가, 정책과 반대되던 워크플로우(항상 code-reviewer·tdd-guide·CONTRIB/RUNBOOK 생성·30% 초과 시 사용자 승인) 제거, rules/agents.md를 가리키기만.
- skills/dispatcher: 303 → 38줄, 영어·`Task`·fork+sonnet 제거, 수단 순서를 09-29 정책에 맞춤.
- .cursor/rules 2개: "AI는 코드를 직접 쓰지 않는다"·e2e-runner·flutter-game-builder·.env 커밋 허용·80% 커버리지를 현행 정책으로 교체.
- docs/agents-reference.md 퇴역 표 보강, agents/.quality-tracking.md 제약 갱신, 메모리 3건 갱신(ios sticky, flow default, shortform channel).

## 묶음별 핵심 (상세는 각 보고서)
- B1 개발 에이전트 19: code-reviewer 자동 실행 지시 6곳 삭제, tdd-guide·schema-drift-auditor·agent-evaluator-v2의 중첩 스폰 제거(Agent 도구 삭제), 구현 에이전트 8종에 삭제·git 쓰기 금지 + 보고 상한, wecom·modadam 실측과 반대였던 express 규칙 5곳 교정.
- B2 참조 15: 실제 코드와 반대인 규칙 4건(래퍼 시그니처·err.status·Service 검사·422), 살아 있는 DOWN SQL, 부트스트랩 `rm -rf`·자동 재시도, Playwright 병렬 → 순차.
- C1 자동 적용 스킬 6: 2,784 → 1,663줄. 일반 지식 제거, mf-012(iOS sticky) 신설, 검사 3종을 "묶음 끝 1회"로, 스크립트 전문을 `convention-enforcer/scripts/`로 분리.
- C2 보조 스킬 9: code-reviewer opus·한국어·80줄 상한, feature-critic 자동 발동 제거, quote-builder 정본을 templates 파일로(205 → 74), postgres-patterns 304 → 75.
- D 문서·비즈니스 17: "되묻기" 7곳 → 가정+보고, meeting-minutes·gov-followup Agent 제거(2단계 스폰), welcon-advisor 250 → 113, 메모리 규칙 4건 반영.
- E1 숏폼·굼구미: 스폰 프롬프트마다 반복되던 규칙을 정의파일로, 5편 병렬 기획·1편 순차 제작·STATUS 갱신 규칙 신설, 영어판 부활 경로(episodes/README) 차단.
- E2 생성 도구: Flow Codex 정책 현행화·제출 간격 규칙, game-asset-artist 233 → 127, Flow 스크립트 2종을 `skills/*/helpers/` 정본으로 복사, game2d-pipeline 실행 불가 표시.
- F 게임 레포 14: 실측 오류(httpError·idempotency 미들웨어·mapping.md) 교정, dotrpg-common.md 신설, starspire-common 공통/C# 분리, Unity 플러그인 스킬 선독 규칙 추가.

## 사용자 결정 대기 (flag, 적용 안 함)
1. 퇴역·삭제 후보: `skills/game2d-pipeline`(실행 불가), `agents/pastletter-image-prompt-writer`(접수 마감 경과), `commands/skill-create`(템플릿 잔재), `project-structure-guide`(wecom 로컬로 이관 여부).
2. 템플릿 잔재 파일: `contexts/`, `hooks/hooks.json`, `mcp-configs/`, `plugins/README.md`, `everything-claude-code-README.md`, `the-*-guide.md`, `references/`. 로드되지 않으니 비용은 없고 삭제는 승인 사항.
3. `.agents/skills/`(Codex용 사본 48개)·`.codex/agents/`: Codex를 안 쓰기로 한 뒤에도 drift 상태로 남아 있다. 삭제 또는 동기화 중단 선언 필요.
4. tdd-guide GREEN 위임 제거(설계 변경), agent-evaluator-v2 L2 정적화: 되돌리려면 해당 파일만 `git checkout`.
5. welcon-advisor 지식 베이스 09-02 이후 미반영, jasoseo-data/profile.md 유실, bgm-factory 8절(사업 메모) 이관, 정본 스크립트의 nyang-bakja node_modules 의존.
6. 커밋: `.claude`(103 파일, dotRPG 심볼릭 링크 6개 스테이징 포함), 상위 레포 `.cursor/rules` 2개, starspire(main) `.claude/` 5개, dotRPG(wonho) `.claude/` 7개. 전부 미커밋.
