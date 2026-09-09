# 빌드 리포트 - general-ep69-nervous-sweat (긴장하면 손에 땀이 나는 이유)

## 1. 자산 재사용/신규

**재사용 (신규 제작 없음)**
- `backgrounds/PlainBg`
- `character/Actor` + `POSES.thinking`
- `scenes/Caption`의 `Label`
- `assets/brand/Intro`, `assets/brand/Outro`, `assets/scenes/TitleCard`
- `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`)
- `scripts/tts.py`, `scripts/rms_mouth.py`

**신규 제작 1건**
- `assets/props/PalmSweatDiagram.tsx` (`PalmSweatDiagram` + `SweatDroplet`) - REGISTRY에 등록 완료(추록 절 끝에 추가, 기존 줄 미변경). `assets/props/index.ts`도 끝에 export만 추가.
  - REGISTRY 확인 결과: 47화 `CheekFlushDiagram`, 40화 `SensoryConflictDiagram`을 먼저 봤으나 둘 다 얼굴 오버레이 전용이라 손발 땀샘 밀도·종류 구분에는 재사용할 수 없어 새로 만들었다.
  - `mode`(`'hand'|'body'|'ancestor'|'polygraph'`)로 4가지 화면(s2·s3 / s4 / s5·s6 / s7)을 한 컴포넌트에 묶었다.
  - 점은 전부 인덱스 기반 고정 배열 + `staggerReveal()`로 팝인시켜 `Math.random`을 쓰지 않았다(원칙 3).
  - 오케스트레이터 지시("땀방울은 큰 물방울 2~3개로만")를 반영해 점묘와 분리된 `SweatDroplet`(teardrop)을 별도 export했다. `<svg>` 안에 `position:absolute` 자식 `<svg>`를 중첩하면 좌표가 깨지는 결함(21화 이후 반복된 결함 A절)을 피하려고, PalmSweatDiagram 내부(ancestor 모드)에서는 `<svg>` 래퍼 없는 내부 헬퍼 `DropletGroup`을 쓰고, HTML/div 컨텍스트(scenes.tsx의 s6 크로스페이드에서 Actor 옆에 배치)에는 자체 `<svg>`로 감싼 `SweatDroplet`을 썼다.

에피소드 로컬 소품 1건(REGISTRY 미등록, 재사용 가능성 낮은 단순 장식): `scenes.tsx`의 `ExamPaper`(s1 배경 시험지).

## 2. 언어별 실측 길이

한국어판만 제작(원칙 6 - 영어 채널 Whymo 운영 중단, 2026-09-02 오케스트레이터 명시 지시). 영어 TTS·립싱크·렌더는 수행하지 않았다.

- TTS: `ko-KR-SunHiNeural`, rate `+20%`, pitch `+30Hz` (프로필 general 기본값, 오버라이드 없음)
- 구간별 실측: s1 4.800s / s2 5.016s / s3 5.208s / s4 6.048s / s5 6.384s / s6 5.064s / s7 5.472s
- 본편 합계: 1181프레임(39.37초, 구간당 +0.2초 여백 포함)
- 전체(Intro 69 + TitleCard 54 + 본편 1181 + Outro 90 = 1394프레임): **46.528초** (ffprobe 실측)
- 대본 추정치(약 52초) 대비 짧게 나왔으나 장면을 늘리지 않고 실측값 그대로 냈다(원칙 4).

## 3. 기술 점검 항목별 관찰 기록

`node scripts/precheck.mjs episodes/general-ep69-nervous-sweat` - **에러 0**, 경고 1(`SHAREDOUT`: 공용 루트 `shortform/out/`에 `frames-en/`·`frames-ko/`가 있음 - 타임스탬프 확인 결과 2026-08-20 생성분으로 이 화와 무관한 과거 잔여물, 원칙에 따라 삭제하지 않고 그대로 둠).

렌더 전 스틸 선점검(`npx remotion still`, 절대경로): 각 구간 시작+피크 프레임 13장 + 타이틀카드 1장을 뽑아 직접 Read로 확인.
- **스틸 단계에서 잡아 렌더 전에 고친 결함 1건**: S4(전신 비교, body 모드) 다이어그램이 `BODY_DIA_W=640`일 때 화면 대비 지나치게 작게 나와(콘텐츠가 실제 svg 박스의 약 47%×76%만 차지하는 구조라 640에서는 체감 크기가 작음) 시인성이 떨어졌다. `BODY_DIA_W`를 640→880, `BODY_DIA_Y`를 420→360으로 조정해 재확인, 라벨·자막과 겹치지 않으면서 눈에 띄게 커진 것을 스틸로 재확인 후 렌더를 진행했다.
- 그 외 결함은 스틸 단계에서 발견되지 않았고, 최종 mp4 검수(아래)에서도 추가로 발견된 결함은 없었다(즉 이번 화는 렌더 후에야 발견한 결함이 없다 - 스틸 선점검이 유일한 사전 발견 경로였다).

렌더 1회(`node scripts/render.mjs general-ep69-nervous-sweat ko`) - 1394/1394프레임 성공, 재렌더 없음.

최종 mp4에서 ffmpeg로 구간별 시작/중간 프레임 37장을 절대경로(`out/frames-ko/`)로 추출해 Read로 확인(관찰 기록):

- [x] **자막이 화면 밖으로 나가지 않는가** - f007~f034(s1~s7) 전 구간 확인, 가장 긴 문장(s4 "체온 조절용 땀은 온몸의 땀샘이 담당하고" 등)도 자막 박스 좌우 여백 안에 들어옴. 좌우 잘림 없음.
- [x] **장면 전환 시 캐릭터 잔상** - f008/f012/f016/f020/f024/f028/f032(각 구간 시작 8프레임 후, SceneSwitcher fadeIn 구간)를 개별 확인. 이전 장면 요소가 남아 겹쳐 보이는 잔상 없음.
- [x] **등장 전 요소가 점처럼 남아 있지 않은가** - PalmSweatDiagram의 점묘는 `staggerReveal()`로 opacity 0→1 전환이라 scale 0 잔상 없음. s2/s3/s4 시작 프레임(f011/f015/f019)에서 아직 안 나타난 점이 화면에 점으로 박혀 있지 않음을 확인.
- [x] **라벨이 화면 밖에서 잘리지 않는가** - 모든 `Label`이 `align="center"`로 `x=CX`에 고정, f011~f034에서 라벨 텍스트가 화면 안에 완전히 들어옴을 확인.
- [x] **요소끼리 겹치지 않는가** - s3(f017, 손바닥 코랄/중립 점 구분)와 s4(f021/f033, 전신 비교/거짓말탐지기) 피크 프레임에서 점·신호선·라벨·캐릭터가 서로 겹치지 않음을 확인. s6 크로스페이드 중간 프레임(f029)은 조상 실루엣과 현대인 캐릭터가 의도적으로 겹치는 전환 연출이며(50% 지점), 이는 정상적인 크로스페이드 동작이다.
- [x] **화면 아래쪽 여백이 과다하지 않은가** - s1/s6(캐릭터 전신, f009/f036)은 발이 GROUND(1250)에 닿고 자막이 하단 23% 지점에 위치, 하단 여백 과다 없음. s2~s5·s7(다이어그램)은 화면 상단(라벨)~중단(다이어그램)~하단(자막)까지 고르게 채움을 확인.
- [x] **음량이 충분한가** - `ffmpeg -af loudnorm=print_format=summary`: Input Integrated -13.6 LUFS, Input True Peak -1.9 dBTP. 너무 작지 않은 수준으로 확인(내레이션 `volume={1.6}` 적용).
- [x] **자막이 프로필 스타일(폰트·크기·위치)을 따르는가** - `Caption` 컴포넌트를 그대로 사용, `CAPTION_STYLE`/`FS.caption` 등 프로필 커스터마이즈 없이 공용 값 그대로 적용됨을 프레임에서 확인.
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가** - 전 장면 배경이 `C.sky`/`C.paper`/`C.goldSoft`(밝은 톤)이고 캐릭터 스트로크는 기본 `C.ink`(진한 남색). 어두운 배경(`C.night` 계열)을 쓴 장면이 없어 발광·색 override가 필요한 경우 자체가 없었다.
- 영어판 관련 체크(화면 문자열 언어별 분기 대조)는 **해당 없음** - 영어판을 만들지 않았다(원칙 6).

## 4. 프로필(general) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 긴장하면 손에 땀나는 경험은 보편적이고, "땀샘 종류가 다르다"는 사실은 검색까진 잘 안 해봤을 지식. 부합.
- [x] 어미가 유아어·학술 문어체로 치우치지 않고 친근한 대화체를 유지했는가 - "~거든요", "~해요", "~인 거죠" 류 확인(대본 원문 그대로, 수정 없음).
- [x] 전문용어가 등장한 자리에서 바로 쉬운 말로 풀렸는가 - "긴장 반응 땀샘"/"체온 조절용 땀" 같은 표현 자체가 이미 쉬운 말이라 별도 용어 풀이가 필요한 전문용어 없음.
- [x] 자막 한 줄이 한국어 20자를 넘지 않는가 - `wrapCounts()`(공용 `timeline.ts` 기본값) 그대로 사용, f007~f034에서 모든 자막 줄이 한 줄 안에 자연스럽게 들어감을 확인.
- [x] 60초 상한을 넘지 않는가 - 본편만 39.37초, 전체 46.528초로 상한 이내.

## 5. 렌더 횟수 및 배포

- 렌더 횟수: **1회** (스틸 선점검에서 S4 크기 문제를 렌더 전에 잡아 재렌더가 필요 없었음)
- 기술 점검(위 3·4절) 통과 확인 후 즉시 배포:
  - 배포 경로: `/home/lee/project/shorts/ko/[69화] 긴장하면 손에 땀이 나는 이유.mp4`
  - md5 대조로 배포본과 렌더 산출물이 동일함을 확인(`4195e6b8ad9395df7c24e5852b9b6e3e`)
  - 배포 확인 후 `episodes/general-ep69-nervous-sweat/out/episode-ko.mp4` 삭제 완료(`out/frames-ko/`, `out/stills/`는 검수 기록으로 보존)

이 보고는 관찰된 사실의 기록이다. "검수 통과"·"합격" 같은 최종 판정은 이 에이전트의 권한이 아니며, 최종 확인은 사용자 몫이다.
