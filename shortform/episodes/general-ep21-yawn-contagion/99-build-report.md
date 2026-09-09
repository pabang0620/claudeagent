# 21화 빌드 보고 - 남이 하품하면 나도 옮는 이유

**이번 배치(21~25화)는 영어 채널(Whymo) 운영 중단으로 한국어판만 제작한다.** TTS·립싱크·렌더 모두
한국어만 수행했고, `EpisodeEn` Composition은 등록하지 않았다.

## 자산 (공용, 언어 무관 - 1회만 조립)

### 재사용
- `Actor`/`BustActor`(캐릭터 배치기), `POSES.idle`/`POSES.surprised`류 기존 포즈 체계
- `PlainBg`, `Caption`, `Label`, `PopIn`, `PulseRing`, `ThemedIcon`(`heart-filled`), `CompareBars`
- `DogStanding`(`props/DogFull.tsx`, general-ep19 원본) - 전신 강아지
- `Intro`/`Outro`/`TitleCard` 브랜드 자산, `SceneSwitcher`, `sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`(timeline.ts)
- 효과음 `intro_ding.mp3`/`outro_ding.mp3`(기존 확정본)

### 신규 제작 (REGISTRY.md 등록 완료)
1. **`YAWN` 포즈** (`assets/character/poses.ts`) - 하품/기지개 포즈. 팔을 넓게 뻗고 `mouthOpen=1`,
   `eyeOpen=0.12`로 크게 벌린 입 + 질끈 감은 눈. `POSES.yawn`으로 조회 가능. 포즈 프리셋 14종 -> 15종.
2. **`DogStanding.mouthOpen`** (`assets/props/DogFull.tsx`) - 개 전신 컴포넌트에 하품용 `mouthOpen`(0~1)
   optional prop 추가. 기본값 0이면 기존 미소 곡선 그대로 그려져 ep19 렌더와 픽셀 동일 - 과거 화에
   영향 없음(추가만 된 optional prop). 코랄 색 타원 입으로 렌더해 다크 톤 코 가죽과 명확히 구분되게
   조정(1차 렌더에서 stroke색 입이 노즈 색과 뭉쳐 잘 안 보이는 문제를 발견해 코랄+얇은 잉크 테두리로
   수정, 위치도 살짝 아래로 이동해 코와 겹치지 않게 함).
3. **`GrowthTimeline`** (`assets/props/GrowthTimeline.tsx`, 신규 파일) - "나이/발달 단계에 따라
   실루엣이 3단계로 커진다"는 타임라인. 머리=원, 몸통=캡슐형 타원만으로 단순화(신체 표현 최소화
   원칙 준수, 팔다리·얼굴 디테일 없음). `revealProgress`로 3단계+점선 화살표가 순서대로 팝인,
   `empathyGlow`로 마지막 단계에 은은한 발광. s7(아기->어린이, 공감 능력 발달)에서 사용.
4. **`buildPeakRelease`** (`assets/anim.ts`) - build-peak-release 3단 사다리꼴 envelope 함수(0~1).
   하품처럼 "서서히 커졌다 잠깐 유지되다 가라앉는" 반응 애니메이션 전반에 재사용 가능해 공용
   유틸로 승격(anim.ts에 이미 있던 `progress`/`clamp01`과 같은 위치).
5. **`yawn_sigh.mp3`** (`assets/audio/yawn_sigh.mp3`) - 하품 날숨 효과음. ffmpeg lavfi로 코드
   합성(핑크노이즈 밴드패스 + 하강 사인 톤, 220->140Hz). 0.6초, 실측 피크 -4.2dB. 원칙 7(무성
   반응 순간 효과음)에 따라 s1(A/B 하품 정점)·s6(주인 하품 정점) 3곳에 배치.

전부 `assets/REGISTRY.md`에 등록 완료(파일경로/파라미터/재사용 가능성 명시).

## 언어별 실측

### 한국어(ko) - 유일 제작 언어
- 음성: `ko-KR-SunHiNeural`, rate `+20%`, pitch `+30Hz` (프로필 기본값 그대로, `tts.py` PRESETS와
  동일해 별도 오버라이드 없음)
- 구간별 실측 길이(초): s1 4.248 / s2 3.960 / s3 4.968 / s4 5.664 / s5 5.352 / s6 5.088 / s7 5.880
- 내레이션 총합: 35.16초 (프로필 상한 60초 이내, 여유 충분 - 늘리지 않음)
- 구간 프레임(pad 0.2초 균일 - 리액션->설명 전환에 해당하는 훅 질문이 대본에 없어 원칙 4의 추가
  여백 규칙 적용 대상 아님): [133, 125, 155, 176, 167, 159, 182] = 본편 1097프레임
- 전체(인트로 69F + 제목카드 54F + 본편 1097F + 아웃트로 90F) = **1310프레임 = 43.712초**
  (ffprobe 실측, 렌더 산출물과 일치)
- 렌더 횟수: 2회 (1차 - 전체 파이프라인, 2차 - `DogStanding.mouthOpen` 색상 조정 후 재렌더)

### 영어(en)
- 미제작. 폴더에 `script-en.json`도 만들지 않았다(이번 배치 명시적 예외).

## 립싱크 사용 여부

`ko_mouth.json`은 원칙 2(파이프라인 표준 절차)에 따라 `rms_mouth.py`로 생성했으나, 이 화의 내레이션이
전부 3인칭 설명체("누가 하품하는 걸 보기만 해도...")라 어느 장면도 캐릭터가 직접 말하는 순간이
아니다(ep07/ep08/ep15/ep18/ep19가 다이어그램 설명 장면에 립싱크를 안 쓰는 것과 같은 원칙을 s1~s7
전체에 적용). s1(두 캐릭터가 순서대로 하품)·s2(글자를 읽다가 하품)·s6(주인이 하품)의 입 모양은
RMS 값 대신 `buildPeakRelease` + `YAWN` 포즈로 직접 만든 하품 mouthOpen 곡선을 쓴다. 그래서
`Episode.tsx`/`scenes.tsx` 어디서도 `ko_mouth.json`을 import하지 않는다.

## 기술 검증 (관찰 기록, 전부 한국어판)

**mp4 자체(`out/episode-ko.mp4`, 배포 전)에서 ffmpeg로 프레임을 추출해 확인했다. 프레임 번호는
`sceneFrames`/`sceneStarts` 실측 계산값(위 "구간 프레임" 절)에서 뽑았다.**

- [x] **자막 화면이탈**: intro(f10)·titlecard(f90)·s1(f169,189,213,250)·s2(f269,318)·s3(f458)·
  s4(f624)·s5(f795)·s6(f926,950)·s7(f1129,1188)·outro(f1265) 16장 전체 확인. 모든 자막 박스가
  좌우 여백(`CAP_SIDE`) 안에 들어오고 텍스트가 잘리지 않음.
- [x] **장면 전환 시 캐릭터 잔상**: s1->s2, s5->s6, s6->s7 전환 경계 프레임(각 구간 끝 3프레임
  전후) 확인, SceneSwitcher 크로스페이드만 보이고 이전 장면 요소가 남아있지 않음.
- [x] **등장 전 요소가 점처럼 남는 문제**: s3/s5 하트(PopIn 사용), s2 "하품" 글자(PopIn 사용),
  s6/s7 배지(pillBadgeStyle - position+opacity+transform 한 div 결합, PopIn과 동일 원칙) 전부
  등장 전 완전히 안 보였다가 팝인. 점 잔상 없음.
- [x] **라벨 화면 밖 잘림**: s4 "가족·친구"/"낯선 사람" 라벨, s6 "개도 옮는다", s7 "공감 능력 발달"
  배지 전부 화면 안에 여유 있게 들어옴(원 밖 삐져나옴 없음 - 6화 결함 유형 재확인).
- [x] **요소 겹침**: s1/s3 두 캐릭터(centerX 300/780, 290/790) 팔을 벌린 YAWN 포즈 정점 프레임에서도
  겹치지 않음(f169/f213 확인). s2 word 텍스트(y=420)와 BustActor(top=640) 사이 겹침 없음.
- [x] **화면 하단 여백 과다**: s1~s7 전 장면이 세로 중앙~하단까지 캐릭터/다이어그램+자막으로 채워짐
  (1화 결함 유형 재확인, 안전영역 안에서 콘텐츠가 하단까지 이어짐).
- [x] **음량**: `ffmpeg loudnorm=print_format=summary` 측정 - Input Integrated -13.4 LUFS,
  Input True Peak -2.4 dBTP. 클리핑 없음, 과거 화 대비 통상 범위.
- [x] **자막 스타일**: `FS.caption`(50px)·`CAPTION_STYLE`·어절별 강조 전부 공용 `Caption` 컴포넌트
  그대로 사용, 프로필 값 임의 변경 없음.
- [x] **언어별 문자열 분기**: 이번 화는 한국어 단일 제작이라 ko/en 대조 자체는 대상 아님. 대신
  화면 문자열 전부(`title`/`s2Word`/`s4Label*`/`s6Badge`/`s7Badge`/`outroNextTitle`/`outroNextHint`)가
  `strings.ts`를 거쳐 props로 전달되는지 코드로 확인(precheck.mjs KO-STR 경고 0건).
- [x] **캐릭터 윤곽선-배경 대비**: 배경이 전부 `PlainBg`(밝은 톤)라 대비 문제 대상 아님(어두운
  `C.night` 계열 배경 미사용).
- [x] **팝인 중간 프레임**: s2 word(f269, 진행 중), s3/s5 하트(등장 애니메이션 스프링 진행 중 프레임
  포함 다수 확인), s6/s7 배지 등장 중간 프레임(f926에서 s6 배지 fade-in 35% 지점 확인) - 중간
  프레임에서 좌표가 튀거나(-994px류 결함) 벗어나는 현상 없음. `PopIn.tsx`/`pillBadgeStyle`(position+
  opacity+transform 단일 div 결합) 원칙 그대로 사용.
- [x] **`Math.random()` 미사용**: `precheck.mjs` RANDOM 규칙 에러 0건으로 확인(에피소드 코드 + 신규
  자산 `GrowthTimeline.tsx`/`buildPeakRelease` 전부 frame 기반 결정적 함수).
- [x] **`precheck.mjs` 정적 검사**: 에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `shortform/out/`의
  다른 화 잔여물, 이 화가 만든 게 아님. 타임스탬프 Aug 20으로 이 세션과 무관해 손대지 않음).

렌더 후 발견해 즉시 수정한 결함 1건: `DogStanding.mouthOpen`의 열린 입 색이 기본 `stroke`(잉크색)로
그려져 다크 톤 코 가죽 바로 아래에서 뭉쳐 잘 안 보였다(1차 렌더 s6 확대 검수로 발견). 코랄 색 +
얇은 잉크 테두리로 바꾸고 y좌표를 10px 내려 코와의 여백을 늘려 2차 렌더에서 명확히 보이는 것을
확인했다.

## 산출물

- **배포 완료**: `/home/lee/project/shorts/ko/[21화] 남이 하품하면 나도 옮는 이유.mp4`
  (md5 대조로 `out/` 원본과 동일 확인 후 `out/`의 mp4는 삭제 - "산출물" 절 정책)
- **실측 재생시간**: 43.712초 (1310프레임, 30fps)
- `out/frames-ko/`는 검수 완료 후 비움(정책상 프레임 폴더 자체는 유지, 내용물만 정리)

## 확인 요청

위 체크리스트 항목은 전부 실제로 프레임을 열어 관찰한 기록입니다. 최종적으로 이 영상을 실제 채널에
써도 되는지는 사용자분 확인 부탁드립니다. 특히 s6 강아지 하품 표정(코랄 색 타원)이 귀엽게 읽히는지,
전체적인 하품 애니메이션(팔 벌리기+눈 감기+입 벌리기 조합)이 자연스러운지는 직접 봐주시면 좋겠습니다.
