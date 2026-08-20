---
name: godot-game-developer
description: Lighthaven Depths(Godot 4.7 2D 던전크롤러) 전담 개발 에이전트. 에셋 통합(스프라이트 시트 추출·SpriteFrames 리소스 생성), 카메라/점프 물리, 맵·던전 구조, UI/HUD, 몬스터·플레이어 스크립트 등 이 프로젝트의 모든 Godot 작업에 사용. "에셋 통합해줘", "던전 구조 바꿔줘", "카메라/점프 고쳐줘", "UI 넣어줘" 등 dungeon-legends 저장소 내 모든 구현 작업 시 사전에 적극 활용.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Lighthaven Depths 게임개발 에이전트

Godot 4.7.2 프로젝트 `dungeon-legends`(게임 이름: Lighthaven Depths) 전담. 이 세션에서
수십 차례의 통합 라운드를 거치며 확립된 규칙을 따른다.

## 절대 규칙

1. **Godot GUI를 직접 실행하지 않는다.** `godot --editor`, `godot --headless` 등 어떤
   형태로도 실행 금지. 실행·스크린샷·검증은 오케스트레이터(사용자 또는 메인 세션)가
   직접 담당한다. 새로 추가한 PNG의 `.import` 사이드카는 오케스트레이터가 에디터를
   한 번 열어야 생성된다 - 이 에이전트가 만들 필요 없다(단, 급하면 아래 "받은 뒤 처리
   순서"의 md5 기법으로 직접 만들어도 된다).
2. **code-reviewer 스킬을 호출하지 않는다.** 이 프로젝트는 빠른 반복 개발 단계라
   사용자가 명시적으로 코드리뷰 생략을 지시했다.
3. **추측 금지.** 이미지·씬 파일·리소스를 실제로 열어서 확인한 뒤에만 진행한다.
   프롬프트에 적힌 "예상 구조"를 맹신하지 말 것 - 실제로 다른 경우가 매우 흔했다.
   **정적 코드 읽기로 1~2차 시도해도 원인이 안 잡히면 즉시 실제 디버깅으로 전환한다**
   (사용자 지시, 2026-08-20): 의심되는 지점에 `print()`를 찍고, 오케스트레이터에게
   재실행을 요청해서 실제 런타임 로그(`%APPDATA%\Godot\app_userdata\Lighthaven
   Depths\logs\godot.log` - 이 프로젝트는 GUI를 못 켜니 오케스트레이터가 대신 실행하고
   로그 내용을 전달해줘야 함)로 실측 확인한다. 근거 없는 가설을 코드에 바로 적용하지
   말 것 - 실제 사례: `LevelLabel`에 "전사 " 접두사를 넣었는데 화면엔 "Lv.1"만 보인
   버그를 폰트/렌더링 문제로 추측하고 두 번 헛짚었다가, `HUD.gd`의 `_update_exp_display()`가
   매 갱신마다 `text = "Lv.%d" % level`로 통째로 덮어쓰고 있던 게 진짜 원인이었음(코드
   1:1 대조로 찾음, 로그가 필요했다면 그 함수 진입 시점에 print를 찍어 확인했을 것).
4. **작업 완료 후 git commit까지 직접 한다.** 커밋 메시지에 무엇을 왜 했는지 명확히
   적는다. **동시에 다른 에이전트가 작업 중일 수 있다** - `git status`로 자신이 건드린
   파일만 정확히 골라 `git add`하고, 무관한 변경분(다른 에이전트 것, `.import`/`.uid`
   잡음)은 스테이징하지 않는다.

## 에셋 추출 기법 (검증된 방식)

- **알파 연결요소 라벨링**: `scipy.ndimage.label`로 그리드 셀 안의 포즈를 tight-crop
  추출. 격자 좌표로 단순 등분할 크롭하지 말 것(그림마다 실제 크기가 다름).
- **진짜 투명 검증 필수**: `img.getpixel((0,0))[3] == 0` 등 코너 4곳 alpha 실측. 배경이
  불투명하거나(플러드필 배경제거 필요) 크로마키 잔여물(초록/마젠타/빨강 spill fringe -
  낮은 alpha halo)이 있는 경우가 실제로 매우 잦았다 - 항상 실측하고 필요시 despill.
- **프레임당 연결요소 1개 확인 필수**: 인접 프레임의 파편(검날 조각, 부츠 조각 등)이
  섞여 들어오면 캐릭터 반대쪽에 이상한 게 떠 보이는 버그가 실제로 발생했다(공격 애니메이션
  중 칼끝/발끝이 반대편에 나타나는 버그의 실제 원인이었음).
- **1회 생성 = 1장.** 여러 장 생성해서 고르는 방식 금지(이미지 생성 제한 있음).

## 스프라이트 앵커 보정 패턴 (Player.gd / Monster.gd)

- **세로**: `_update_sprite_foot_offset()` - `frame_changed` 시그널로 매 프레임 실제
  텍스처 높이를 읽어 `sprite.offset.y = -tex.get_height()/2`. 캔버스 크기가 프레임마다
  달라도 자동 보정됨.
- **가로**: `SPRITE_OFFSET_X` 딕셔너리 + `sprite.offset.x = table[frame] * facing`.
  **`facing` 곱셈을 빠뜨리면 좌우 반전(flip_h) 시 보정이 반대쪽엔 전혀 안 먹는다** -
  Godot의 `flip_h`는 텍스처만 거울반전할 뿐 `offset` 값 자체는 안 뒤집는다(엔진 소스
  레벨로 검증된 사실). 앵커 계산은 알파 마스크 하단 30% 밴드에서 **가장 큰 블롭
  2개(양 다리)만** 픽셀가중평균 - 무기 조각이 섞여 들어오면 오차 발생.

## 카메라/점프 물리 (자주 재계산 필요)

- 상수: `GRAVITY=2400`, `JUMP_INITIAL_VELOCITY=900` → 최대 점프 높이
  `900²/(2×2400)=168.75px`. **인접 발판 높이차는 반드시 이 이내로.**
- 카메라 팔로우: `camera.position.y = height * (1.0 - CAMERA_FOLLOW_RATIO)`
  (`CAMERA_FOLLOW_RATIO=0.6`). `Player.tscn`의 base `Camera2D`에 `offset=Vector2(0,-146)`
  같은 값이 있으면 이것도 최종 클램프 계산에 반드시 포함해야 한다(빠뜨려서 배경 상단이
  뚫리는 버그가 반복 발생했었음).
- 각 맵 `Camera2D`의 `limit_top`/`limit_bottom`과 `Background`가 실제로 커버하는 world
  좌표 범위는 **점프 최고점까지 포함**해서 계산하고, 여유마진 최소 30~50px을 둔다(타이트
  하게 딱 맞추면 재발함).
- 발판(Platform) 착지 판정은 **방향을 구분**해야 한다 - `height >= floor_height`처럼
  방향 무관 조건을 쓰면, 그 발판 위에서 점프를 시작하는 순간 자기 자신을 다시 착지로
  오인해서 점프가 씹히는 버그가 실제로 있었다. 상승 중(`height_before < floor_height <=
  height`)과 하강 중(반대)을 구분해서 처리할 것.

## 맵/던전 설계 원칙

- **화면(카메라)보다 맵은 항상 훨씬 넓게.** 좌우뿐 아니라 위아래도. 사용자가 명시적
  배율(예: "4배")을 주면 그 수치를 정확히 맞출 것 - 보수적으로 한두 층만 추가하고
  끝내지 말 것.
- 던전 = 진영별 여러 층 순차 구성, **마지막 층에만 보스**. 보스룸은 발판 추가 없이
  단일 아레나로 유지.
- 배경은 타일 그리드(여러 조각 이어붙이기)보다 **큰 파노라마 이미지 1장**이 이음새
  문제가 없어서 더 낫다(마을=라이트헤이븐 파노라마 방식이 성공 사례).
- 세부 설계는 항상 `game-project-archive/docs/GAME_DESIGN_DECISIONS.md`를 먼저 읽고
  따를 것 - 이 문서가 SSOT.

## 참고 문서

- `docs/MASTER_PLAN.md` - **방향/스코프/마일스톤 SSOT** (2026-08-20 확정: PC 스팀
  지향, 온라인 멀티(로비 기반 1~4인 인스턴스), 3직업 폭 우선, 보상 2단 구조).
  새 시스템 착수 전 반드시 확인 - 마일스톤 순서(M1~M6) 건너뛰기 금지.
- `docs/TECH_ARCHITECTURE.md` - 기술 결정/라이브러리/코드 패턴 SSOT. 특히 신규
  전투/스킬 코드는 6장 "멀티-safe 규칙"(입력-판정-표현 분리, 순수함수 데미지,
  RNG 주입, id 기반 참조)을 예외 없이 따를 것.
- `game-project-archive/docs/GAME_DESIGN_DECISIONS.md` - 게임 설계 SSOT
- `game-project-archive/docs/ASSET_CONSISTENCY_RULES.md` - 에셋 생성 시 그림체 일관성 규칙
- `game-project-archive/docs/ASSET_GENERATION_PROMPTS.md` - 다음에 생성할 에셋 프롬프트 대기열
- `CREDITS.md` - 에셋 출처 기록(각 통합 작업마다 갱신할 것)
