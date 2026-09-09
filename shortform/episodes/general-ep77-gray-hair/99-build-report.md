# 77화 "나이 들면 흰머리가 나는 이유" 빌드 리포트

프로필: general (굼구미). 언어: 한국어만(영어 채널 Whymo 운영 중단, 2026-09-02 오케스트레이터 지시).
동시 작업 중이던 76화(`general-ep76-wet-fabric-darker`) 폴더는 건드리지 않았다. `assets/REGISTRY.md`,
`assets/props/index.ts`는 기존 줄을 그대로 두고 파일 끝에만 덧붙였다. `episodes/README.md`는
건드리지 않았다(사전에 이미 77화 행이 표에 있었다).

## 자산

### 재사용(REGISTRY 대조 완료)
- `assets/backgrounds/PlainBg` - 배경
- `assets/scenes/Caption`의 `Label` - 화면 라벨
- `assets/scenes/CompareBars` - s3 나이대별 색소 세포 수 감소 그래프
- `assets/props/Symbols`의 `QMark`(glyph="X") - s6 속설 X 표시. 대본 자산 목록은 별도
  `MythLabel.tsx` 컴포넌트 신설을 "새로 만들어야 함"으로 적었으나, 70화가 이미 이 X 표시를
  `QMark(glyph="X") + Label` 조합으로 구현해 둔 패턴이라 REGISTRY 우선 원칙(원칙 0)에 따라
  그대로 재사용했다(29화와 같은 판단 - 신규 지정이라도 기존 조합으로 충분하면 새로 만들지
  않는다). 별도 MythLabel 컴포넌트는 만들지 않았다.
- `assets/props/Hand`의 `FingerGrip` - s6 "손으로 흰머리를 뽑는 모습"(기존 두 손가락 집게
  소품을 재사용, `beadColor`만 흰머리 톤 회색으로 override)
- `assets/character/Actor`의 `BustActor`, `assets/character/poses`의 `POSES.touchForehead`,
  `blendPose` - s1 캐릭터 클로즈업
- `assets/timeline.ts`의 `sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`
- `assets/brand`의 `Intro`/`Outro`, `assets/scenes/TitleCard`

### 신규 제작 - REGISTRY 등록 완료
- `assets/props/HairFollicleDiagram.tsx` (`HairFollicleDiagram`, export
  `HAIR_FOLLICLE_VB_W`/`HAIR_FOLLICLE_VB_H`/`HAIR_STRAND_VB`/`HAIR_HEAD_VB_W`/`HAIR_HEAD_VB_H`/
  `HAIR_FOLLICLE_ROOT_PT`/`HAIR_PIGMENT_LABEL_PT`) - REGISTRY 확인 완료. `GoosebumpDiagram`
  (general-ep08)이 모낭·피부 단면을 다루지만 "입모근 수축"이 주제라 색소 세포·머리카락 색
  변화 구조가 없어 새로 만들었다. `mode`('follicle'|'strand'|'head')로 세 화면을 한 컴포넌트로
  커버한다. `pigmentCellProgress`(색소 세포 2개의 크기·불투명도), `transparentProgress`(머리카락
  색 - 진한 색 <-> 옅고 속이 비침), `reflectProgress`(strand 전용 - 공기 방울 + 빛 반사로
  흰색처럼 보임), `grayProgress`(head 전용 - 머리채 5가닥이 순서대로 흰색으로 바뀜)를 독립
  진행도로 받는다. 색소 세포는 큰 도형 2개로만(점 무리 금지), 공기 방울도 3개로만 표현했다.
  `assets/props/index.ts`, `assets/REGISTRY.md`(추록 절, 파일 끝에 덧붙임 - 동시 작업 중인
  76화 REGISTRY 편집과 충돌 없음) 양쪽에 등록했다.

### 이 화 전용(등록 안 함)
- 없음. `scenes.tsx`의 s6 신화 아이콘(원 안에 두 갈래 선)은 70화 S6Myth의 회전 아이콘과 같은
  "일회성 중립 아이콘" 패턴이라 별도 컴포넌트로 분리하지 않고 씬 로컬 SVG로 그렸다(70·75화와
  동일 판단).

## 실측 길이 (한국어, TTS 실측 기준)

상세 표는 `02-script-final-ko.md` 참고. 본편 합계 38.57s. 인트로(2.3s)+제목카드(1.8s)+본편+
아웃트로(3.0s) 전체 45.67s(1370프레임 @30fps). 프로필 상한(60초, 본편 기준)을 넘지 않아 대본을
되돌릴 필요 없었다. 영어판은 만들지 않았으므로 언어 간 길이 비교는 해당 없음.

## 기술 점검

- `npx tsc --noEmit` - 신규 파일(`HairFollicleDiagram.tsx`, ep77 `src/*.tsx`)에서 에러 0.
  (저장소 전체에 다른 화의 기존 `noUnusedLocals` 경고가 다수 있으나 이 화와 무관해 손대지 않았다.)
- `node scripts/precheck.mjs episodes/general-ep77-gray-hair` - 에러 0 / 경고 1
  (`SHAREDOUT`: 공용 루트 `shortform/out/`에 2026-08-20 타임스탬프의 오래된 `frames-ko/en`이
  남아 있었다 - 이번 화가 만든 것이 아니고 76화 동시 렌더와도 무관한 구파일로 확인, 건드리지 않았다).
- 렌더 전 스틸 선점검(`npx remotion still`) - 대표 프레임 11장(s1 포즈전환/렌즈, s2 시작/피크,
  s3 중간/끝, s4 끝, s5 시작/피크, s6 X등장/끝, s7 끝) 확인. 이 단계에서 결함 2건을 발견해
  렌더 전에 고쳤다(아래 "발견한 결함" 절).
- 최종 렌더(`node scripts/render.mjs general-ep77-gray-hair ko`) - **1회 성공**(재렌더 없음,
  스틸 선점검에서 결함을 먼저 잡았기 때문).
- `ffprobe` - 1080x1920, 30fps, 1370프레임, 재생시간 45.717333s. 포맷 일치 확인.
- `ffmpeg loudnorm` - Input Integrated -13.6 LUFS, Input True Peak -2.5 dBTP(클리핑 없음).
  전 구간 내레이션만 있고 무성 구간·핵심 액션(먹기/부딪히기 등)이 없어 원칙 7의 신규 효과음
  부착 대상이 없었다(인트로·아웃트로 딩 사운드는 기존 공용 자산 그대로 사용).
- 최종 mp4에서 프레임 18장 추출(ffmpeg, `out/frames-ko/`) - 인트로(f30)·제목카드(f90)·
  s1~s7 각 구간 시작 직후 + 중간 지점(언어별 sceneStarts/sceneFrames 계산값 기반) +
  아웃트로 2장(f1290, f1335) 확인.

### 스틸 선점검에서 잡은 결함 (렌더 전)

1. **s2 "모낭 = 머리카락 뿌리" 라벨이 머리카락 기둥과 겹쳐 다크온다크로 안 보임.**
   라벨 기본색(`C.ink`)과 진한 머리카락 기본색(`hairColorDark` 기본값도 `C.ink`)이 같아서,
   `HAIR_FOLLICLE_ROOT_PT`가 머리카락 컬럼과 같은 x·y 위치에 있으면 글자가 배경에 묻혀
   사라졌다. `F_HAIR_TOP_Y`를 30->100으로 낮추고 `HAIR_FOLLICLE_ROOT_PT`를 y=120->50으로
   올려 라벨이 머리카락 기둥 위쪽 빈 공간에 오도록 좌표를 분리했다.
2. **s4/s5 "색소 없음(투명)" 원이 왼쪽 원과 크게 다르지 않아 보임.** `transparentProgress=1`
   에서의 불투명도 감쇠 계수가 0.62라 배경과 대비가 약했다. 0.82로 올려 "색소 빠진 채
   투명하게 자란다"는 서술이 화면에서 뚜렷이 읽히게 했다(reflectProgress가 이어받아 다시
   불투명해지는 s5 연출 로직은 그대로 유지).

두 결함 모두 재사용 가능성이 있는 공용 컴포넌트(`HairFollicleDiagram.tsx`) 안에서 고쳤고,
수정 후 s2/s4/s5 스틸을 다시 뽑아 확인했다(고정 파일명이 아니라 재추출 후 타임스탬프로
갱신 확인).

### 렌더 후에야 발견한 결함

없음. 최종 mp4 18프레임 검수에서 스틸 선점검을 통과한 상태 그대로 재확인만 했고, 새로
발견된 결함은 없었다.

### 검수 체크리스트 (관찰 기록)

- 자막 화면 이탈: 18장 전체에서 자막 박스가 좌우 여백을 두고 화면 안에 들어옴을 확인.
  가장 긴 s6 대사도 여러 줄로 분리돼 잘리지 않음(f013~f015에서 확인).
- 장면 전환 잔상: SceneSwitcher 크로스페이드 프레임(f005, f007, f009, f011, f013, f015)에서
  이전/다음 장면이 반투명하게 겹쳐 보이는 것을 확인 - 이는 6프레임 크로스페이드의 의도된
  동작이라 결함이 아니다. 완전 백지·클리핑 프레임은 없었다.
- 등장 전 요소 잔상: `HairFollicleDiagram`의 색소 세포·공기 방울·머리채는 progress<=0.01
  조건으로 null 반환하는 방식이라(예: `pigOpacity > 0.01 ? ... : null`) 등장 전 점처럼
  남지 않음(s2/s5 스틸에서 확인).
- 라벨 화면 밖 잘림: 없음. s2 "모낭=머리카락 뿌리"/"멜라닌을 만드는 세포", s3 나이대 라벨,
  s4/s5 "색소 있음"/"색소 없음(투명)"/"빛이 반사돼 하얗게 보임", s6 속설 라벨 2종, s7 요약
  라벨 전부 화면 안쪽에 위치.
- 요소 겹침: s6에서 위쪽 FingerGrip과 아래쪽 X아이콘/실제 다이어그램이 세로로 겹치지 않게
  좌표를 분리했고 f013/f014(스틸)·f013(최종프레임)에서 확인. 원래 지적된 다크온다크 겹침
  (위 "잡은 결함" 1번)을 고친 뒤로는 겹침 없음.
- 하단 여백 과다: s1~s7 전부 화면 세로 중앙~하단까지 캐릭터·다이어그램·자막이 채움. s3
  그래프는 상단~중앙에 집중되지만 자막이 하단을 채워 전체적으로 여백이 과하지 않음.
- 음량: 위 loudnorm 결과 참고, Input Integrated -13.6 LUFS로 충분한 수준.
- 자막 스타일: 프로필 기본 `CAPTION_STYLE`(흰 배경, 검은 테두리 필박스) 그대로 사용.
- 화면 문자열 언어 분기: 한국어판만 제작(영어 채널 운영 중단)이라 해당 없음. `strings.ts`
  구조 자체는 언어별 테이블 형태(`Locale = keyof typeof STRINGS`)로 유지해 향후 영어 채널
  재개 시 en 블록만 채우면 되게 했다.
- 캐릭터 윤곽선 대비: 이 화는 어두운 배경(`C.night` 등)을 쓰는 장면이 없어(전부 `PlainBg`
  밝은 톤) 해당 없음.

### 속설 정정 장면 확인 (원칙 - 70화 사고 재발 방지)

대본에 "흰머리를 뽑으면 두 개가 난다"는 속설이 s6에 실제로 있었다. X 표시는 왼쪽의
"뽑으면 두 개 난다?"는 틀린 통념 아이콘(원 안에 두 갈래 선)에만 붙였고, 오른쪽의 실제
설명 다이어그램(`HairFollicleDiagram` follicle 모드 - 모낭 하나에 머리카락 한 가닥)에는
X를 붙이지 않았다. 스틸 선점검(`s6_x_f1050.png`, `s6_end_f1110.png`)과 최종 mp4 프레임
(`f013`, `f014`)에서 X가 어느 쪽에 붙는지 직접 눈으로 확인했다 - 두 시점 모두 왼쪽 아이콘
위에만 코랄색 X가 있고 오른쪽 다이어그램은 깨끗한 상태였다.

## 배포

기술 점검(precheck 에러 0, 스틸+최종 프레임 검수, loudnorm, ffprobe 포맷 확인)을 통과해
별도 승인 질문 없이 곧바로 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[77화] 나이 들면 흰머리가 나는 이유.mp4`
- md5 대조: `out/episode-ko.mp4`와 배포본이 `c9fc447ed0ae8038342b4781110f7b6e`로 일치 확인 후
  `out/episode-ko.mp4`는 삭제했다. `out/frames-ko/`, `out/stills/`는 남겨뒀다.

이상은 실제로 관찰한 사실이다. 최종 "이 영상을 써도 되는지"의 판단은 사용자 몫이다.
