---
name: game2d-pipeline
description: 유튜브 레퍼런스나 한 줄 컨셉에서 시작해 Unity 2D 액션 게임(벨트스크롤·횡스크롤 등)을 "실제 게임으로 보이는 완성도"로 한 번에 만드는 오케스트레이션 스킬. "2D 게임 만들어줘", "이런 게임 Unity로 만들어줘", "/game2d <컨셉>" 요청 시 사용. lantern-rite 레포를 템플릿으로 복제하고 설계 3문서 -> 골격 -> 이미지 프롬프트 시트 -> 절단 -> 손맛 -> 3중 검증 순으로 에이전트 4종(unity2d-scene-architect, sprite-sheet-slicer, game-feel-tuner, unity-build-verifier)을 배정한다. 3D 게임·Godot·웹게임은 대상이 아니다.
disable-model-invocation: false
---

# game2d-pipeline

Lantern Rite(2026-09-14/15) 제작에서 실측으로 확정된 절차. 원천 문서는 레포 `/mnt/c/Users/admin/Desktop/games/lantern-rite/docs/`의 `PLAYBOOK.md`(절차), `LESSONS.md`(함정 17개), `PROMPT_RULES.md`(이미지 규칙)이며 이 스킬은 그 문서를 언제 어떤 에이전트로 실행하는지만 정한다. 절차가 바뀌면 그 문서를 고치고 여기는 참조만 유지한다.

## 0. 시작 전 고정 원칙
- 오케스트레이터는 설계·판정·검수만 한다. 구현·손맛 수정은 담당 에이전트 정의의 모델로 하고, 막히면 `rules/performance.md` 절차로 상향 승인을 받는다. 손맛 결함 판정은 오케스트레이터가 코드를 직접 읽고 내린다.
- 이미지 결함(잘림·축소·정렬·프레임 수)은 코드가 아니라 절단 도구나 재생성으로 고친다.
- 검증은 3중 계약(배치 로그 / .prefab·.unity guid 참조 개수 / `-lr-autoshot` 게임 내부 캡처 + Player.log). PowerShell 창 활성화·키 주입은 절대 금지.
- 화면 판정이 필요한 스크린샷은 오케스트레이터가 직접 본다(에이전트 자체 보고 신뢰 금지).
- 사용자가 플레이테스트한다. 오케스트레이터는 빌드 오류·참조 누락·런타임 예외만 잡는다.

## 1. Inspect (에이전트 없이 1회성 조회)
`ls games/`, Unity 버전(`/mnt/c/Program Files/Unity/Hub/Editor/`), 실행 중 Unity/Blender 프로세스. 이미지 생성 경로는 flow-nanobanana(메인 세션 Playwright)다. 막히면 사용자에게 웹 생성을 부탁해 IMAGE_PROMPTS 파일을 주고 `art/incoming/NN_*.png`로 받는다.

## 2. Design (오케스트레이터 직접, 짧게)
새 레포 `games/<name>/`를 lantern-rite에서 복제한다: `gh repo create pabang0620/<name> --template pabang0620/lantern-rite --private --clone` 또는 로컬 `git clone`. 복제 후 유지할 것: `art/tools/**`, `client/Assets/LanternRite/Editor/**`(이름만 바꿔 씀), `Scripts/Anim`, `Scripts/FX`, `Scripts/Debug`(AutoShot·InputOverride·HitboxOverlay), `Scripts/Combat`(LaneSpace·AttackDef·HitReaction·TimeController), `.claude/agents/`, `docs/PLAYBOOK.md·LESSONS.md·PROMPT_RULES.md`. 교체할 것: `docs/DESIGN.md`, `docs/ASSET_MANIFEST.md`, `docs/ART_DIRECTION.md`, `docs/IMAGE_PROMPTS.md`, `art/incoming/*`, `art/characters|env|ui|vfx|props_painted/*`, `StageData.cs`, 적 파생 클래스.
세 문서는 lantern-rite 것과 같은 구조로 쓴다(DESIGN 10절, ASSET_MANIFEST 6절 경로·캔버스·프레임 수·히트 프레임, ART_DIRECTION 팔레트·조명·공통 접미사). 장황한 기획서 금지.

## 3. Skeleton (unity2d-scene-architect, Sonnet)
DESIGN/ASSET_MANIFEST를 코드로. 산출: SceneOnly/BuildWindows 성공, 플레이스홀더로 완주 가능한 빌드. 직렬화 가능한 런타임 데이터만, 머티리얼 에셋화, TimeController 단일 소유, 스테이지 폭 >= 화면폭 x3, 카메라 가시범위에서 계산한 레이어 좌표, FullScreenWindow. 완료 후 code-reviewer 스킬 1회.

## 4. Feel (오케스트레이터가 읽고 판정 -> game-feel-tuner)
PlayerCombat·PlayerController·EnemyBase·HitReaction·CameraController·AttackDef를 직접 읽는다. 체크: 공격 중 입력 폴링 유지+버퍼, 런처 후속 창, 접점=피격체 몸통, 흔들림 배선, 플래시 셰이더, 슈퍼아머, 슬롯 AI, 밀어내기, 깊이 허용치, 그림자. 결함 목록을 수치까지 적어 위임한다.

## 5. Art (game-asset-artist x 병렬 3 또는 사용자 웹 생성)
순서: 앵커 1~2장 -> 플레이어 시트 3장 -> 적 시트 -> 배경 3레이어 x 스테이지 -> UI 킷 1장 -> VFX 시트 -> 소품 시트 -> 로고·아이콘. 모든 생성에 앵커를 참조 이미지로 첨부하고 "attached sheet와 같은 스케일" 명시. 프롬프트는 IMAGE_PROMPTS.md에 번호·파일명과 함께 적어 두고 그대로 쓴다. Blender 헤드리스 소품은 페인팅 배경과 안 맞으니 2D 페인팅 게임에서는 쓰지 않는다.

## 6. Slice + Integrate (sprite-sheet-slicer -> unity2d-scene-architect)
`process_incoming.py --report --contact`. 오케스트레이터가 `_frames_overview.png`와 대표 프레임 몽타주(대기·공격·공중·필살기 나란히)를 직접 본다. 실측: 프레임 수, 가장자리 투명, 몸통 높이 비율(시트 간 8% 이내, 아니면 시트별 스케일 보정표), 절단선 검출 0. 통과 후 `art/** -> client/Assets/<Game>/Art/**` 복사, 빌드.

## 7. Verify + Playtest (unity-build-verifier -> 사용자)
3중 검증 PASS 후 스크린샷을 오케스트레이터가 확인(캐릭터 비율 약 화면 높이 1/4, 바닥이 하단을 채움, HUD 겹침 없음, 소품이 바닥선에 앉음). 게임을 켜 주고 플레이 피드백을 받는다. 피드백은 "이미지 문제 / 코드 문제"로 먼저 가른 뒤 5·6 또는 4로 되돌린다.

## 8. 마무리
오케스트레이터가 Bash로 직접 커밋·푸시한다(커밋 전 `git status --porcelain`으로 파일 목록 확인, logs/·builds/·Library/ 제외). LESSONS.md에 새로 발견한 함정을 추가하고, 이 스킬과 `rules/agents.md`가 아니라 레포 문서를 갱신한다.
