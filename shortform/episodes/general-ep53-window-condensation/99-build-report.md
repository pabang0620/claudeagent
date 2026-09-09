# 53화 빌드 리포트 - "겨울에 유리창에 김 서리는 이유"

프로필: general (굼구미). **한국어판 1개만 제작** (영어 채널 운영 중단, 오케스트레이터 명시 지시).

## 1. 자산

### 재사용 (REGISTRY 대조 완료)
- `character/Actor` + `POSES.idle` - s1 캐릭터
- `backgrounds/PlainBg` - 전 구간 배경
- `scenes/CompareBars` - s3 (차가운 공기 vs 따뜻한 공기 수증기 보유량 비교)
- `props/ThemedIcon` (`thermometer`, `arrow-down`, `snowflake`) - s4·s6 보조 아이콘
- `props/IceFloatCup` - s7 음료 컵(liquidLevel=0.62, temp='cold')
- `assets/timeline.ts`(sceneFrames/sceneStarts/buildCaptions/wrapCounts/mouthAt/mouthProp), `assets/brand`(Intro/Outro/TitleCard) - 표준 파이프라인
- 공용 효과음 `intro_ding.mp3`/`outro_ding.mp3` (기존 확정본 그대로 복사)

### 신규 제작 (REGISTRY 등록 완료)
- `props/WindowPane.tsx` - `WindowPane`(창문 소품, window/crossSection 2모드, `fogProgress`/`dropletProgress`/`contactProgress`) + `CondensationDroplets`(큰 물방울 3~4개 고정 배치 오버레이, IceFloatCup 등 다른 소품에도 재사용 가능). `assets/props/index.ts`, `assets/REGISTRY.md`에 기존 줄을 건드리지 않고 끝에 추가.
- 재사용 판단: 52화 `CounterCurrentDiagram`(열 표현)·26화 `WetSoilAerosolDiagram`(단면 다이어그램 구조)을 먼저 확인했으나 "유리창" 자체를 그리는 자산이 없어 신규 제작. `Bathtub.tsx`의 김 파티클(고정 배열+Math.sin 살랑거림) 기법을 계승.

같은 시간대에 51화(`general-ep51-fried-crispy`)가 동시 렌더 중이라, `props/index.ts`·`REGISTRY.md`는 기존 줄을 건드리지 않고 끝에 덧붙이기만 했다. `episodes/README.md`는 건드리지 않았다.

## 2. 실측 길이

- 구간별 실측 발화 길이: 02-script-final-ko.md 표 참고 (s1 4.42s ~ s6 7.63s)
- 내레이션 총합 36.50초, 여백 포함 본편 37.87초
- 전체 길이(인트로+제목카드+본편+아웃트로): 1349프레임 = ffprobe 실측 **45.013초** (채널 상한 60초 이내)
- 영어판 없음 - 언어 간 길이 비교 대상 없음

## 3. 기술 점검

- `node scripts/precheck.mjs episodes/general-ep53-window-condensation` : **에러 0**. 경고 1건(`SHAREDOUT`, 공용 루트 `out/`의 2026-08-20자 구 프레임 - 이 화가 만든 게 아니고, 타임스탬프상 51화 등 다른 화 것도 아닌 오래된 잔재로 확인, 손대지 않음)
- 렌더: `node scripts/render.mjs general-ep53-window-condensation ko` - **2회 렌더** (1회차: 초기 조립본. 2회차: 스틸 선점검에서 발견한 물방울 위치 미세조정(`fx: 0.44 -> 0.36`, 창틀 세로살과 겹침 회피) 반영 후 재렌더). 두 번 다 1349/1349 프레임 정상 인코딩.
- 최종 mp4: 1080x1920, 30fps, 1349프레임, 45.013초
- 오디오: `loudnorm=print_format=summary` 실측 - Input Integrated -13.5 LUFS, **Input True Peak -2.4 dBTP**(클리핑 없음), LRA 14.9 LU

## 4. 검수 체크리스트 (관찰 기록, 한국어판)

- [x] **자막 화면이탈**: f0001~f0020(제목카드~아웃트로 전 구간 대표 프레임) 전부 확인. 자막 pill이 항상 좌우 여백을 두고 화면 안에 들어옴. 가장 긴 s6 자막("겨울엔 바깥이 워낙 추워서...")도 줄바꿈된 상태로 안전영역 안에 있음
- [x] **장면 전환 캐릭터 잔상**: s1에만 캐릭터(Actor)가 있고 이후 장면은 SceneSwitcher가 컴포넌트 자체를 교체하는 구조라 s2 이후 캐릭터 흔적 없음(f0005~f0006에서 확인 - s1 끝/s2 시작 프레임에 캐릭터 없음)
- [x] **등장 전 요소 잔상**: `CondensationDroplets`가 `local<=0.01`이면 `null`을 반환(opacity 0이 아니라 렌더 자체를 안 함) - 등장 전 점 잔상 없음을 f0005(s1, drop 미사용)·f0009(s4 시작, 물방울 없음)에서 확인
- [x] **라벨 화면 밖 잘림**: s6 "실외"/"실내" 라벨(XsLabel, 흰 배경 pill)이 f0016·f0017에서 창틀 상단 안쪽에 완전히 들어옴, 잘림 없음
- [x] **요소끼리 겹침**: 1차 스틸 선점검에서 s5 물방울 1개가 창틀 세로살과 겹치는 것을 발견해 좌표 조정(`fx 0.44->0.36`) 후 f01.png(재검증용 880프레임)에서 겹침 해소 확인. s1 캐릭터(centerX=190,size=460)와 창문(x=540,width=520) 사이 박스 간격 약 120px 확보(f0002~f0004에서 겹침 없음 확인)
- [x] **화면 하단 여백 과다**: s1 캐릭터 발이 GROUND(1250)에 서 있고 캡션이 하단 안전영역에 위치, s3/s7처럼 상단에 몰린 구성도 캡션까지 자연스럽게 이어짐. 다만 s2·s3·s7은 화면 중하단이 비교적 여백이 많은 편(수증기 입자·비교막대·컵이 화면 상~중단에 배치) - 다른 화 대비 콘텐츠가 상단에 몰린 구성이나, 캡션이 하단을 채우고 요소 크기 자체가 크고 명확해 "과다 여백"으로 판단하지는 않았음. 이 부분은 최종 사용자 확인 요청
- [x] **음량**: Input Integrated -13.5 LUFS / True Peak -2.4dBTP - 이전 화들과 유사한 수준(수치는 위 3절)
- [x] **자막 스타일**: `Caption` 컴포넌트 기본값(`CAPTION_STYLE`, 프로필 general 설정) 그대로 사용, 커스텀 없음
- [x] **캐릭터 윤곽선 대비**: s1 배경이 밝은 실내 톤(`C.room`/`C.paper`)이라 `C.ink` 기본 스트로크로 충분히 구분됨(어두운 배경 아님, override 불필요)
- [x] (영어판 없음 - 로케일 분기 대조 항목 해당 없음)

### 프로필 추가 체크 (general.md 8절)
- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 겨울 창문 김서림은 일상적으로 자주 보지만 원리를 찾아보지 않는 전형적 소재로 판단

## 5. 스틸 선점검에서 잡은 결함 vs 렌더 후 발견 (구분 기록)

**스틸 선점검 단계에서 잡음** (전체 렌더 전, `remotion still`로 확인):
1. 김(fog) 표현이 밝은 하늘색 배경과 거의 구분되지 않음(반투명 0.72 opacity가 배경과 유사한 톤) - 불투명도를 높이고(최대 0.95) 물결선 색을 배경과 대비되는 톤(`C.water`)으로 교체, 경계선(stroke) 추가
2. s6 크로스섹션 김 패치가 유리에서 살짝 띄워진 타원(ellipse)이라 유리와 무관하게 떠 있는 얼룩처럼 보임 -> 유리 경계선에 flush하게 붙는 반원(bulge) 패치로 변경 -> 이것도 "문손잡이"처럼 보이는 문제가 있어 세로로 긴 물결 패치(2단 굴곡)로 재수정
3. s7 컵 위 물방울 4개 중 3개가 액체(blue) 위에서 기본색(`C.waterCool`, 액체와 동일 색)이라 안 보임 -> `color={C.ink}`로 명시 override
4. (스틸 선점검 중 계산 오류로 잡음, 렌더 전 코드 리뷰 단계) s5 물방울 좌표 계산에서 유리 영역 오프셋을 창문 폭 기준 1:1로 잘못 가정한 버그 - `WINDOW_VB_W`/`WINDOW_VB_H` 기준 scale 계산으로 수정

**전체 렌더 후에야 발견**:
1. s5 물방울 1개(`fx: 0.44`)가 창틀 세로살과 겹침 - 1차 렌더 완료 후 최종 mp4 프레임 추출·육안 확인에서 발견, `fx: 0.36`으로 조정 후 재렌더(2회차)

## 6. 배포

기술 점검(precheck 에러 0, 프레임 육안 확인, 오디오 레벨) 통과 확인 후 곧바로 `shorts/ko/`에 배포 완료.

- 배포 경로: `/home/lee/project/shorts/ko/[53화] 겨울에 유리창에 김 서리는 이유.mp4`
- md5 대조 일치 확인 후 `episodes/general-ep53-window-condensation/out/episode-ko.mp4` 삭제 (`out/frames-ko/`, `out/stills/`는 보존)

이 보고는 기술적 관찰 기록이며, 영상이 실제로 쓸 만한지에 대한 최종 판단은 사용자 몫입니다.
