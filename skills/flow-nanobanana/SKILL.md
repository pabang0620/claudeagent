---
name: flow-nanobanana
description: Google Flow(flow.google.com)에서 Nano Banana 2로 이미지를, Omni 1.1 Flash로 영상을 생성하는 Playwright 자동화 스킬. "나노바나나로 생성해줘", "구글 플로우로 이미지/영상 만들어줘", "Flow에서 뽑아줘", 게임 에셋·아이콘 시트·로그인 루프 영상 생성 요청 시 사용. 출력은 항상 JPEG(알파 없음)이므로 투명 배경이 필요한 에셋은 마젠타 배경으로 뽑아 크로마키로 알파를 만든다(gpt-image/Codex는 쓰지 않는다). 로그인된 브라우저 하나를 쓰므로 한 번에 한 세션(메인 또는 서브에이전트 하나)만 실행한다.
---

# flow-nanobanana

2026-09-19/20 실측으로 확정. 전제: Google AI Pro 구독, Playwright MCP 브라우저에 Google 로그인이 되어 있다.
모든 단계는 "클릭 -> 확인 -> 실패 시" 순서로 그대로 따라 한다.

## 0. 정책

1. 이미지·영상 생성은 전부 이 스킬로 한다. Codex/gpt-image는 쓰지 않는다(2026-09-19 사용자 지시).
2. 출력은 항상 JPEG(RGB, 알파 없음). 투명이 필요하면 5절의 마젠타 + 크로마키.
3. 브라우저는 로그인된 하나뿐이라 동시에 두 세션이 조작하지 않는다. 서브에이전트에 맡길 때는 스폰한 에이전트의 도구 목록에 `mcp__playwright__*`가 있는지 먼저 확인하고, 없으면 메인 세션이 직접 실행한다.
4. 사용자 이메일을 프롬프트·URL·페이로드에 넣지 않는다.

## 1. Playwright 도구 규칙 (가장 많이 막히는 곳)

1. `browser_click`, `browser_type`의 요소 지정 파라미터는 `target`이다. `ref`가 아니다. 스키마 오류가 나면 ToolSearch로 스키마를 다시 불러온다.
2. 페이지 이동·생성 완료 뒤에는 요소 참조가 낡는다. **클릭 직전에 `browser_snapshot`을 새로 찍고** 그 결과의 참조만 쓴다.
3. 완료 대기에 `textGone:"Thinking"`을 쓰지 않는다(일찍 반환됨). `text:"Open image in editor"`도 쓰지 않는다(버튼 라벨이라 타임아웃). 대신 `browser_wait_for time:30` -> `browser_snapshot` -> 썸네일이 없으면 `time:15`를 최대 4회 반복.
4. 스냅샷이 커지면 화면의 "Start new session"으로 새 채팅 세션을 연다.
5. `.playwright-mcp/`에는 예전 다운로드가 남아 있다. **다운로드 도구 결과에 찍힌 경로만** 쓴다. 이 폴더는 rm -rf 하지 않는다.
6. `Browser is already in use` 오류: 다른 세션이 쓰는 중인지 사용자에게 먼저 확인한 뒤에만 `pkill -f "user-data-dir=<프로필 경로>"`.

## 2. 이미지 생성

1. 사용자가 프로젝트 URL을 주면 그 URL로 `browser_navigate`. 없으면 `https://flow.google.com/` -> "New project". 쿠키 배너는 "Agree".
2. 프롬프트 입력창 옆 tune 아이콘(Settings) -> 모델이 **Nano Banana 2**인지 확인. 기본 종횡비: 아이콘·시트 1:1, 배경·키아트 16:9. 바꿨으면 Save. "Confirm before generating"은 건드리지 않는다.
3. 프롬프트 맨 앞에 반드시 붙인다: `Generate a single static IMAGE (not a video): `. 빠뜨리면 영상이 나온다. 여러 장이면 `Generate N distinct static IMAGES (not a video):`.
4. 참조 이미지: "+"(Add ingredients) -> "Upload media" -> 파일 선택창이 뜨면 `browser_file_upload`에 절대경로.
5. "Start generation" 클릭 -> 1-3 방식으로 대기(보통 30~40초).
6. 썸네일 클릭 -> 편집 화면 -> "Download media" -> **1K**(원본) 또는 **2K**(업스케일). 도구 결과의 저장 경로를 기록.
7. 대상 프로젝트의 최종 위치로 `cp`. 같은 이름이 있으면 덮어쓰지 말고 `_v2`. 게임 레포면 그 레포의 `art/incoming/` 규칙을 따르고, 없으면 `<project>/generated-images/flow/`.
8. 검증은 눈이 아니라 실측:
```bash
python3 -c "from PIL import Image; im=Image.open('<경로>'); print(im.format, im.size, im.mode)"
```
구도·미감 판단은 사용자 몫. 경로와 크기만 보고한다.

## 3. 영상 생성

1. 모델 Omni 1.1 Flash, 1건 15 크레딧. 생성 전에 **"Approve" 라디오**가 보이면 선택한다(한국어 UI 프레임 모드에서는 없이 바로 시작된다).
   - 2026-09-25 한국어 UI 실측: 설정 트리거 -> 모드 `동영상` -> 동영상 유형 `프레임`(시작/종료 이미지 지정) 또는 `소재` -> 길이 4/6/8/10초 라디오 -> 해상도. 8초 720p = 12 크레딧, Approve 라디오 없이 바로 시작됐다. 프레임 모드에서는 소재(+) 버튼이 없다.
2. 길이는 설정 라디오와 프롬프트 문장 둘 다 맞춘다: `Generate a 10 second VIDEO: ...`.
3. 참조 이미지는 먼저 2절로 2K 이미지를 새로 만들어 첨부한다(기존 그림 재사용은 사용자가 시킬 때만).
4. 루프용은 `locked-off camera, no camera movement, cyclical motion`을 넣는다. 카메라가 움직이면 시작과 끝이 안 맞는다.
5. 다운로드: 720p(즉시) / 1080p 업스케일(수 분, `time:60` 반복 대기).
6. 부메랑 루프 + 워터마크 잘라내기 + 무음(1920x1080 기준, 다른 해상도는 비율 환산. 워터마크가 있는 우측 하단을 빼고 16:9로 잘라낸 뒤 원래 크기로 되돌린다):
```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]crop=1500:844:210:0,scale=1920:1080,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0" -an -c:v libx264 -crf 18 -preset slow -movflags +faststart out.mp4
```

## 4. 워터마크

1. Nano Banana 2는 우측 하단에 반투명 반짝이 로고를 찍는다.
2. 마젠타 배경 위에서는 약 (255,76,255)로 섞여 크로마키 때 자동으로 지워진다.
3. 복잡한 배경에서는 남는다. 지우지 않고(delogo·패치 복사는 번진 자국이 남는다) 워터마크가 빠지도록 화면을 잘라낸다. 위치는 자동 bbox 검출을 믿지 말고(금속 하이라이트를 오인한 사례) 우측 하단 모서리 픽셀을 직접 확인한다.

## 5. 투명 배경 (마젠타 + 크로마키)

프롬프트에 그대로 붙인다:
```
The background is one flat uniform pure magenta #FF00FF filled edge to edge, fully opaque, not a transparent PNG, no alpha transparency, no pattern, no gradient, no checkerboard, no shadow.
```
- 키 조건 기본: `(r>140) & (b>140) & (g<110)`. 아이템이 빛을 내뿜는 그림은 분홍 헤일로가 남으므로 `g<170`. 공용 절단 도구는 고치지 않고 1회용 사본을 쓴다.
- 절단·정렬 판정은 알파 픽셀 실측(연결요소 수, 바운딩박스).

## 6. 아이콘 시트 규칙

1. 슬롯당 2x2 시트 1장, 읽기 순서 = 일반, 희귀, 영웅, 전설. 한 시트에 8개 이상 금지.
2. 프롬프트에 `NO border, NO frame, NO card, NO panel`. 등급 테두리는 게임 UI가 따로 그린다(넣으면 이중 테두리).
3. 절단 후 256 캔버스. lantern-rite는 `art/tools/slice_fx_grid.py` 로직, 결과는 `art/ui/items/item_<slot>_<grade>.png`.

## 체크리스트 (제출 전)

- [ ] 프롬프트가 `IMAGE (not a video)` 또는 `N second VIDEO`로 시작하는가
- [ ] 클릭 직전에 스냅샷을 새로 찍었는가, 파라미터가 `target`인가
- [ ] 영상이면 Approve 라디오 유무를 확인했는가
- [ ] 다운로드 경로를 도구 결과에서 가져왔는가(옛 파일 아님)
- [ ] 최종 위치로 복사했고 기존 파일을 덮어쓰지 않았는가
- [ ] PIL 실측을 했는가
