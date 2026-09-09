# 빌드 리포트 - general-ep19-dog-nose-slit (개가 숨 쉬면서도 냄새 맡는 이유 / Why Dogs Never Stop Smelling)

## 0. v3 개정 (2026-08-21) - "처음에 개인지 몰랐어" 피드백 반영

아래 1~9절은 v2(초판) 기록이다. v3는 `02-script-v3.md` 대본으로 **s1 전면 교체 + s2 문장 수정**만
했고, s3~s8은 손대지 않았다. 이 절이 v3에서 실제로 한 일의 기록이다.

### 0-1. 무엇을 바꿨나

- **s1**: 무성 코 클로즈업(`S1Sniff`, `DogNoseCloseup`) -> 유성 "강아지 전신 등장"(`S1Greet`).
  캐릭터가 `idle`→`wave`로 "몽뭉아!"(`Here, boy!`)를 부르고, 화면 왼쪽 밖에서 강아지 전신
  (`DogStanding`, 신규)이 통통 튀며 들어와 캐릭터 옆에 멈춰 서고 꼬리를 흔든다.
- **s2**: 개 코 클로즈업(`DogNoseCloseup`)이 여기로 한 칸 밀려왔다(내용·파라미터는 v2와 동일).
  대사만 "어, 콧구멍 옆에 틈이 있네"→"어, 콧구멍 옆에 뭔가 신기한 게 있네"로 수정(en도 동일
  판단으로 재작성, 02-script-v3.md "영어판 의역 메모" 참고).
- **s3~s8**: 코드·대사·타이밍 전부 무변경. 재렌더는 됐지만(파일 하나로 조립되는 구조라
  s1/s2 프레임 수가 바뀌면 전체 mp4를 다시 뽑아야 한다) 내용 자체는 손대지 않았다.

### 0-2. 신규 자산: `props/DogFull.tsx` (`DogStanding`)

**비교한 안**: 참고 이미지가 없는 신규 캐릭터라 원칙 0-1(벡터화) 적용 대상이 아니고, 대신
"여러 안을 렌더해서 비교하고 고른다" 원칙에 따라 손으로 그린 SVG 초안을 `cairosvg`(venv 기존
설치, `KimchiPiece.tsx` 제작 때와 동일 방식)로 빠르게 래스터화해 비교했다(실제 remotion 렌더가
아니라 순수 SVG 좌표 검토용 - React 컴포넌트 자체는 검토 후 한 번에 작성).

1. **1차 3안(양쪽 귀 대칭, 옆모습이 아닌 준정면형)**: 몸통 크기(작음/보통/큼) 3가지로 비교.
   결과: "먼 쪽 귀"가 주둥이 옆에 뾰족한 삼각형처럼 겹쳐 보여 "알처럼" 보이는 결함 발견 -
   전부 기각.
2. **2차 3안(옆모습, 눈 하나·귀 하나 - `Animals.tsx`의 Mouse/Whale과 동일 관례로 전환)**: 머리
   비율(작음/보통/큼) 3가지로 비교. 귀를 머리 원보다 먼저 그리면(머리가 위에 덮어 귀 대부분이
   가려짐) vs 나중에 그리면(귀가 머리 위로 온전히 드러남) 차이도 함께 확인 - **나중에 그리는
   쪽을 채택**(처음엔 몸통을 먼저 그려 귀가 거의 안 보였다).
3. **비율 보정**: 머리 반지름 163 -> 140(스케일 0.859, 머리 클러스터 전체를 앵커 기준 축소)로
   조정해 "머리가 전체 높이의 약 50%"(지시 범위 45~55%) 근방에 맞췄다(163일 때 실측 59%,
   140일 때 실측 53%).
4. **최종 채택**: 옆모습(눈 하나·귀 하나, 처진 귀), 머리:몸 비율 약 53%, 짧고 통통한 다리 2개,
   말린 짧은 꼬리, 코랄 목줄 1개(액센트 1색). `DogNoseCloseup`과 동일한 `fill`(#F3E6D0)·
   `noseColor`(#3B4451) 기본값으로 "같은 개"임을 색으로 확정.

**`DogNoseCloseup`과 같은 개로 보이는지**: 색 2개(`#F3E6D0`/`#3B4451`)를 그대로 기본값 공유,
주둥이 끝 코 가죽을 둥근 타원(`DogNoseCloseup`의 코 가죽 곡선과 같은 "둥글게 튀어나온" 인상)으로
그려 맞췄다. s2 프레임(전신 -> 클로즈업 전환)을 나란히 보면 털색·코색이 동일해 위화감이 없다
(`out/frames-ko/f009.png` 전후 확인).

**굼구미와의 크기 비율**: `S1_ACTOR_SIZE=760`(ep11 doorway 등 기존 화의 "서 있는 전신" 표준
스케일과 동일), `S1_DOG_WIDTH=280`(강아지 viewBox 620x700, 실제 렌더 높이 약 316px) - 강아지
전체 높이가 캐릭터 서 있는 높이(실측 약 517px)의 약 61%로, "무릎~허리 높이" 지시에 부합하는
비율로 나왔다(`out/frames-ko/f006.png`, `f008.png`에서 실측 확인 - 캐릭터 다리 중간~허리
사이에 강아지 머리 꼭대기가 온다).

### 0-3. 등장 애니메이션 - 실측으로 잡은 결함 1건

`S1Greet`가 화면 밖(왼쪽, x=-320)에서 목표 지점(x=90)까지 강아지를 이동시키는 이징 곡선을
처음엔 `1-(1-p)^3`(ease-out cubic)로 짰다. **`remotion still`로 중간 프레임을 직접 확인한 결과,
SceneSwitcher의 기본 페이드인(8프레임) 동안 이미 58%가 이동해버려 실제로 보이는 구간에서는
"화면 밖에서 들어온다"는 느낌이 거의 없었다**(f=8/32일 때 58% 진행 - 실측). smoothstep
(`p*p*(3-2*p)`)으로 바꾸니 같은 지점에서 16%로 줄어 화면 밖 출발이 눈에 보이게 됐다(코드 주석에
실측값 남김). 통통 튀는 세로 움직임(hop)은 `Math.abs(sin(f/11*π))`에 `(1-travelEase)` 감쇠를
곱해 도착할수록 잦아들게 했다 - Math.random 미사용(원칙 3).

**꼬리 흔들기도 실측으로 진폭 재조정**: 처음 22도로 짰다가 확대 프레임 비교(`tailzoom_compare.png`
류, 스크래치패드에서 검토 후 삭제)에서 거의 안 보임을 확인 - 말린 짧은 꼬리는 피벗에서 끝까지
거리가 짧아 각도를 크게 줘야 화면에서 움직임으로 읽힌다. 34도로 올려 재확인 - 완성 프레임에서
프레임 간 회전 차이가 뚜렷이 보임(코드 주석에 실측 근거 남김).

**검수 시 중간 프레임 포함**: 등장 구간(로컬 f=0,8,16,25,29,32,40,48)과 꼬리 흔들기 극값
프레임(로컬 f≈41, 47)을 각각 뽑아 실제로 움직이는지 확인했다(정지 한 장이 아니라 최소 8장
연속 비교 - `DogStanding` 첫 렌더에서 tailWagT 진폭이 22도일 때 "거의 안 보임"을 실측으로
잡아낸 것도 이 방식 덕분이다).

### 0-4. TTS 재합성 범위 (s1·s2만)

- **재합성**: s1("몽뭉아!"/"Here, boy!", 프로필 기본 rate/pitch 그대로 - 단순 부름이라 리액션
  톤 오버라이드 불필요로 판단), s2(문장 변경, 기존과 동일한 리액션 톤 유지 - ko rate+32%/
  pitch+55Hz, en rate+30%/pitch+35Hz)를 별도 scratch 디렉터리에 `tts.py`로 합성한 뒤,
  기존 `public/audio/{ko,en}_words.json`의 s3~s8 항목은 그대로 두고 s1(신규 추가)·s2(교체)만
  파이썬으로 병합했다. `ko_s1.mp3`/`ko_s2.mp3`/`en_s1.mp3`/`en_s2.mp3`만 새로 썼고,
  `{ko,en}_s3.mp3`~`{ko,en}_s8.mp3`는 v2 파일을 그대로 재사용했다(디스크상 파일 자체를 건드리지
  않음 - `ls -la` 타임스탬프로 재확인 가능).
- **립싱크**: `rms_mouth.py`는 언어 전 구간을 한 번에 정규화하는 구조라(스크립트 원본,
  원칙 1의 "정규화는 그 언어의 전 구간을 한 번에 모아 계산한다") s1/s2만 부분 재추출은 지원하지
  않는다. 대신 병합된 `words.json`(8구간 전체, mp3는 s3~s8 기존 파일 + s1/s2 신규 파일)을 입력
  으로 **`ko_mouth.json`/`en_mouth.json` 전체를 다시 뽑았다** - TTS API를 다시 호출한 게 아니라
  기존 mp3(s3~s8)까지 포함해 로컬에서 RMS 재계산만 한 것이라 "낭비"에 해당하지 않는다(네트워크
  호출 없음, 수 초 내 완료).

### 0-5. 언어별 실측 길이 (v3)

| | KO | EN |
|---|---|---|
| s1 | 1.976s (59프레임, dur 1.776 + pad 0.2) | 1.976s (59프레임, 동일) |
| s2 | 4.896s (147프레임, dur 4.296 + pad 0.6) | 5.4s (162프레임, dur 4.8 + pad 0.6) |
| s3~s8 (v2와 동일 대사) | 33.795s (838프레임) | 40.29s (1146프레임) |
| 본편(s1~s8) 합계 | 40.667s (1220프레임) | 45.567s (1367프레임) |
| 전체(인트로+제목카드+본편+아웃트로) | 47.767s (1433프레임) | 52.667s (1580프레임) |

v2 대비 ko는 47.33s -> 47.77s(+0.44s), en은 52.73s -> 52.67s(-0.06s)로 소폭만 변했다 - s1이
무성 고정 2.0s에서 유성 1.976s로 사실상 비슷해졌고, s2 문장이 "뭔가 신기한 게"로 약간 길어진
만큼만 늘었다. **두 언어의 총 길이 차이(4.9s)는 정상이다** - 억지로 맞추지 않았다.

### 0-6. 렌더 · precheck

- `node scripts/precheck.mjs episodes/general-ep19-dog-nose-slit` - **에러 0**. 경고
  `SHAREDOUT` 1건은 공용 루트 `shortform/out/`에 남아 있던 다른 화(타임스탬프 2026-08-20
  20:56, 이 화와 무관 - ep19는 8/21 작업)의 잔여 `frames-ko/`·`frames-en/`였다. 삭제하지
  않고 보고만 남김(다른 화가 렌더 중일 가능성 배제 못 함).
- `node scripts/render.mjs general-ep19-dog-nose-slit both` - ko/en 각 1회, 둘 다 성공.
  최종 프레임 수: ko 1433 / en 1580 (ffprobe 실측과 일치).
- 렌더 전 `npx remotion still`로 s1 구간 중간 프레임을 여러 장 뽑아 등장 모션·꼬리 흔들기를
  먼저 확인한 뒤(0-3절) 최종 렌더를 걸었다 - 이 프리뷰 이미지는 검수 완료 후 삭제했다.

### 0-7. 검수 관찰 기록 (v3, 언어별)

각 언어의 `sceneStarts`/`sceneFrames`를 파이썬으로 재계산(timeline.ts와 동일 로직)해 구간별
시작+8프레임+중간 프레임을 뽑았다(`out/frames-ko/`, `out/frames-en/`, 각 29장 - s1은 등장 모션
확인을 위해 로컬 f=0,8,16,25,29,32,40,48을 추가로 포함). 재렌더 전 기존 `frames-ko/`·`frames-en/`
(v2 산출물)를 삭제하고 새로 뽑았고, `ls -la` 타임스탬프(10:47)로 최신본임을 확인했다.

- [x] **s1 강아지 등장이 실제로 움직이는가**: f001(로컬f0, 페이드인 중이라 거의 안 보임) ->
  f002(로컬f8, 왼쪽 끝에 살짝 걸침) -> f003(로컬f16) -> f004(로컬f25) -> f006(로컬f32, 도착)
  까지 연속 프레임에서 강아지가 화면 왼쪽 밖에서 점진적으로 들어와 멈추는 것을 확인
  (`out/frames-ko/f001~f006.png`)
- [x] **꼬리가 실제로 움직이는가**: 로컬 f=32(정지, 각도 0) / f=41(약 +13도) / f=47(약 -21도,
  진폭 34도로 조정 후 실측)에서 꼬리 곡선의 방향이 눈에 띄게 다름을 확대 크롭으로 확인(스크래치
  패드 `tailzoom_compare2.png`, 최종 리포트에는 결론만 남기고 이미지는 삭제)
- [x] **`DogNoseCloseup`과 같은 개로 보이는가**: s1(전신)과 s2(클로즈업) 전환 프레임
  (`f008`->`f009`)에서 털색(#F3E6D0)·코색(#3B4451)이 동일하게 이어짐을 확인
- [x] **자막 화면이탈**: s1 "몽뭉아"/"Here boy" 포함 전 구간 자막이 좌우 안전영역 안에 들어옴
  (ko/en 전체 29장 확인)
- [x] **팝인 도중 위로 쏠림 함정 회피**: `S1Greet`는 `Appear`/`PopIn`을 쓰지 않고 `DogStanding`
  자신의 `x`/`y`를 매 프레임 직접 계산해 넘기는 방식이라(REGISTRY 4절 함정의 전제조건인
  "position 없는 div에 transform + absolute 자식" 구조 자체가 없음) 이 함정 대상이 아니다 -
  중간 프레임에서도 위로 쏠리는 현상 없음을 확인(f002~f006)
- [x] **s3~s8 무변경 확인**: v2 build report의 옆트임 라벨 겹침 수정 결과, "Real footage"/
  "They say" 배지, 슐리렌 흐름 등이 f012~f029에서 v2와 동일하게 나타남을 확인 - 재렌더로
  인한 회귀 없음
- [x] **언어별 화면 문자열 분기**: en 프레임(`out/frames-en/`) 전체 29장에 한글 미검출,
  "Here boy"/"Side slit"/"Real footage"/"They say" 전부 strings.ts en 테이블 값과 일치
- [x] **음량**: ko Input Integrated -13.5 LUFS/True Peak -1.8dBTP, en -16.8 LUFS/-2.3dBTP -
  클리핑 없음(v2와 거의 동일 - s3~s8 오디오 파일 자체가 안 바뀌었으므로 당연한 결과)
- [x] **SFX 배치 재확인(원칙 7)** - sniff_snort가 s1→s2로 재배치되며 offset도 다시 잡았다.
  ffmpeg volumedetect의 `-ss`/`-to` 구간 잘라내기는 AAC 디코더 프레임 경계 아티팩트로 순간
  스파이크(-9dB)를 오탐 보고하는 것을 발견해, 대신 **wav로 통짜 추출 후 python RMS(30ms
  hop)로 직접 측정**하는 방식으로 재확인했다: 진짜 무음 구간(제목카드, 2.2~4.15s) 전부
  -120dB, realize_ding 온셋 t=6.17s(기대값 6.167s와 일치, ko s2 시작 6.067s+오프셋0.1s) ->
  피크 약 -16dB, sniff_snort 온셋 t≈6.68s(기대값 6.633s, s2 시작+0.567s) -> 주변 레벨
  -12~-26dB. 둘 다 무음 대비 명확한 에너지가 있고, 내레이션 자체 피크(-3.7dB, s2 구간
  volumedetect 실측)보다 낮다

### 0-8. 배포 (v3)

기술적 검증(precheck 에러 0, 렌더 성공, 프레임 29장×2언어 확인, 오디오 레벨 재확인)을 통과해
곧바로 `shorts/`에 덮어썼다(파일명 무변경 - 제목은 v3에서도 그대로).

- `/home/lee/project/shorts/ko/[19화] 개가 숨 쉬면서도 냄새 맡는 이유.mp4`
  (md5 `1d56dd63965b42c68dcf2ca5e625c783`, `out/episode-ko.mp4`와 일치 확인 후 `out/` 삭제)
- `/home/lee/project/shorts/en/[Ep. 19] Why Dogs Never Stop Smelling.mp4`
  (md5 `c85f8ea2f6cc92a12c8e0e1a5a0e2a8a`, `out/episode-en.mp4`와 일치 확인 후 `out/` 삭제)
- `episodes/general-ep19-dog-nose-slit/out/`에는 현재 `frames-ko/`·`frames-en/`(v3 검수용,
  29장씩)만 남아 있고 mp4는 없다

### 0-9. 신규/변경 자산 REGISTRY 반영

- `props/DogFull.tsx`(`DogStanding`) 신규 - `assets/REGISTRY.md` 4절에 등록 완료
  (파라미터·설계 원칙·재사용 가능성 기재)
- `assets/props/index.ts`에 export 추가(`DogStanding`, `DOG_STANDING_VB_W/H`,
  `DOG_STANDING_GROUND_VB`)

### 0-10. 확인 요청 (v3)

위 관찰은 전부 실제로 프레임을 열어 보거나 오디오를 수치로 측정한 결과다("검수 통과"라는
자체 판정이 아니다). 특히 등장 이징 곡선(ease-out -> smoothstep)과 꼬리 흔들기 각도
(22도 -> 34도)는 1차 시도에서 실제로 결함(거의 안 보임)을 실측으로 잡아내 수정한 것이다.
강아지 캐릭터 디자인(2단계 6안 비교 후 확정), 등장 연출, `DogNoseCloseup`과의 일관성이
실제로 만족스러운지는 사용자가 `shorts/ko`·`shorts/en`에서 직접 확인해 주시길 부탁드립니다.

---

## 1. 자산 재사용 / 신규 (v2 초판 기록)

### 재사용 (REGISTRY 대조 완료, 공용)
- `character/Actor.tsx`(`BustActor`), `character/poses.ts`(`idle`, `surprised`)
- `scenes/Caption.tsx`(`Caption`, `Label`)
- `backgrounds/PlainBg.tsx`
- `scenes/Effects.tsx`(`Sparkles`)
- `scenes/MotionSwoosh.tsx`
- `scenes/PopIn.tsx` - 이번 화에서는 직접 쓰지 않음(팝업 애니메이션을 `pillBadgeStyle`류 단일 div 결합 방식으로 처리해서 - S3 라벨, S7/S8 배지 - `Appear`/`PopIn` 둘 다 필요 없었다). `Appear` 안에 absolute 자식을 넣는 함정은 처음부터 회피
- `FontLoader.tsx`, `theme.ts`, `timeline.ts`, `anim.ts`, `Intro`/`Outro`/`TitleCard`
- `audio/intro_ding.mp3`, `audio/outro_ding.mp3`(브랜드 공용), `audio/realize_ding.mp3`(s2 발견 리액션에 재사용)

### 신규 제작 (REGISTRY 등록 완료)
- `props/DogNose.tsx`(`DogNoseCloseup`) - 이 채널에 개 코 자산이 없어 신설(REGISTRY 3~4절 확인, `props/Animals.tsx`에 개 없음 확인). 참고 이미지 없이 처음부터 그린 순수 도형이라 원칙 0-1(벡터화)의 적용 대상이 아니다. 파라미터 7개(`sniffT`, `slitHighlight`, `inhaleProgress`, `exhaleProgress`, `sniffRateBoost`, `schlierenOverlay`, `wetShineOpacity`)로 대본 s1~s8의 모든 시각 상태를 하나의 컴포넌트로 커버. viewBox 앵커 3개(`DOG_SLIT_LABEL_PT`, `DOG_HOLE_R_PT`, `DOG_HOLE_L_PT`)를 함께 export
- `audio/sniff_snort.mp3` - s1(무성) 킁킁 숨소리, ffmpeg lavfi 핑크노이즈 합성(원칙 7). REGISTRY 등록 완료, "동물 킁킁·냄새 맡기 동작 전반 재사용 가능"으로 명시

## 2. 렌더 전 정적 검사

`node scripts/precheck.mjs episodes/general-ep19-dog-nose-slit` - **에러 0**. 경고는 `SHAREDOUT`(공용 루트 `out/`에 다른 화 - ep20 등 - 산출물 존재) 1건뿐이었고 이 화와 무관해 건드리지 않았다.

## 3. 언어별 실측 길이

| | KO | EN |
|---|---|---|
| 본편(s1~s8) 합계 | 40.23s | 45.63s |
| 전체(인트로+제목카드+본편+아웃트로) | 47.33s (1420프레임) | 52.73s (1582프레임) |

**두 언어의 총 길이 차이(5.40s)는 정상이다** - s4/s6/s7에서 영어 문장이 한국어보다 어절 수가 많아 발화가 길어졌다. 어느 쪽도 배속·트리밍으로 맞추지 않았다.

구간별 타임코드는 `02-script-final-ko.md`, `02-script-final-en.md` 참고.

## 4. TTS

- 프로필 `general.md` 기본값: ko `ko-KR-SunHiNeural` rate+20%/pitch+30Hz, en `en-US-AnaNeural` rate+20%/pitch+15Hz
- s2(리액션+훅 "이게 뭐지?"/"what's that for?")만 별도 톤으로 합성: ko rate+32%/pitch+55Hz, en rate+30%/pitch+35Hz (ep18과 동일 기준값 - 화자는 유지하고 rate·pitch만 확실히 올림)
- `tts.py --lang ko|en` 각각 실행, `rms_mouth.py --prefix ko|en` 각각 실행. s2만 립싱크 사용(BustActor가 직접 대사하는 유일한 구간), s3~s8은 다이어그램 설명 장면이라 립싱크 미사용(ep07/ep08/ep15/ep18과 동일 원칙)

## 5. 렌더 횟수

- ko: 2회 (1차 - intro_ding/outro_ding 누락으로 실패 후 자산 복사해 재시도 성공, 2차 - S3 라벨 겹침 수정 후 재렌더)
- en: 2회 (동일 사유)
- 최종 프레임 수: ko 1420 / en 1582 (재렌더 전후 프레임 수 동일 - 수정이 타이밍에 영향 없음을 확인)

## 6. 검수 관찰 기록 (언어별)

프레임은 각 언어의 `sceneStarts`/`sceneFrames` 실측으로 계산한 구간별 시작+8프레임(팝인 중간)+중간 지점을 뽑았다(`out/frames-ko/`, `out/frames-en/`, 27장씩). 재렌더 후 프레임을 새로 뽑아 타임스탬프로 최신본임을 확인했다(`ls -la` 갱신 시각 확인).

### 공통 체크리스트

- [x] **자막 화면이탈**: ko/en 전 프레임에서 자막이 좌우 여백(CAP_SIDE=70) 안에 들어옴을 확인. en s4("When it exhales...")처럼 긴 문장도 wrapCounts(29자)로 줄바꿈되어 한 줄 안에 들어감(f014 en 확인)
- [x] **장면 전환 캐릭터 잔상**: s1→s2, s4→s5 전환 프레임(f006/f015 등)에서 SceneSwitcher 기본 크로스페이드(6프레임)로 이전/다음 장면이 겹쳐 보이는 것을 확인 - 이는 의도된 크로스페이드이지 잔상 결함이 아니다(전환 종료 후 프레임 f007/f016에서 깨끗이 정리됨을 확인)
- [x] **등장 전 요소 잔상**: DogNoseCloseup의 모든 진행도(`slitHighlight`/`inhaleProgress`/`exhaleProgress`/`schlierenOverlay`/`wetShineOpacity`)는 `opacity`로 게이팅되어 0일 때 아무것도 그리지 않음(scale 0 방식 미사용) - s3 시작 직후(f009/f010) 하이라이트 링이 옅게 페이드인하는 것만 보이고 점 잔상 없음을 확인
- [x] **라벨 화면 밖 잘림**: S3 라벨("옆트임"/"Side slit")은 viewBox 상단 여백에 고정 배치, en "Side slit"도 진단 박스 안(x 110~970)에 들어옴 확인(f011 en)
- [x] **요소 겹침**: **실측으로 결함 1건 발견 -> 수정 완료.** 최초 렌더(v1)의 S3 프레임(ko f011)에서 "옆트임" 라벨이 강조 링과 겹쳐 텍스트가 잘 안 읽히는 문제를 발견했다. 원인은 `DOG_SLIT_LABEL_PT`의 y 오프셋(-46)이 링의 최대 반경(SLIT_HALF_H+30+6pulse=84)보다 작아 링 상단(y=164)과 라벨이 실질적으로 붙어버린 것. `DogNose.tsx`에서 라벨 앵커를 viewBox 최상단 여백(y=6)으로 옮겨 어떤 pulse 값에서도 겹치지 않게 고정한 뒤 ko/en 재렌더, f011(ko)/f011(en) 재확인으로 겹침이 해소됐음을 확인했다
- [x] **하단 여백 과다**: 모든 씬이 캐릭터/다이어그램을 화면 중상단~중하단까지 채우고, S5(핵심 결론 정리)만 다이어그램+캐릭터 사이에 넉넉한 공백이 있지만 자막·배지 없이 조용한 장면이라 과다로 보이지 않음(f016/f017 확인)
- [x] **음량**: `loudnorm=print_format=summary` 측정 - ko Input Integrated -13.6 LUFS / True Peak -1.8 dBTP, en -16.8 LUFS / -2.3 dBTP. 클리핑 없음
- [x] **자막 스타일**: 프로필 지정 폰트 크기(50px)·하단 위치·흰 배경+검정 테두리 그대로 적용 확인(전 프레임)
- [x] **언어별 화면 문자열 분기**: ko/en 프레임을 나란히 대조 - en 프레임(intro/title/s3/s7/s8/outro)에 한글이 전혀 섞이지 않음을 확인(Whymo 채널명, "Side slit"/"Real footage"/"They say" 전부 strings.ts en 테이블에서 옴)
- [x] **캐릭터 윤곽선-배경 대비**: 배경이 전부 밝은 톤(PlainBg 기본값, sky/paper)이라 `C.ink` 기본 스트로크로 충분한 대비, 별도 글로우 불필요

### 프로필(general) 추가 체크
- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 개를 키우거나 본 적 있는 사람이면 누구나 "왜 계속 킁킁대지"라는 느낌은 있지만 옆트임 구조까지 검색해보진 않는 소재로 채널 톤에 부합
- [x] 어미 톤 - "~거든요", "~있어요", "~얘기가 있어요" 등 친근한 대화체 유지, 유아어·학술 문어체 없음
- [x] 전문용어 - "옆트임"(자체 조어, 화면 라벨로 즉시 풀이) 외 전문용어 없음
- [x] 자막 한 줄 상한(ko 20자/en 29자) - `wrapCounts` 기본값 그대로 사용, 전 프레임에서 상한 초과 없음
- [x] 60초 상한 - ko 47.33s, en 52.73s 모두 여유 있게 통과

### 속설 가드레일 (원칙 1-2, s8)
- [x] s8("개 코가 촉촉한 것도 ... 얘기가 있어요"/"they say")에 화면 라벨 "그런 얘기가 있어요"/"They say"가 골드 배지로 명확히 표시됨을 ko f026 / en f026에서 확인. 내레이션도 단정형이 아닌 "~라는 얘기가 있어요"/"they say" 헤지 표현 유지

## 7. 오디오 SFX 배치 (원칙 7) - 객관적 관찰

- **sniff_snort.mp3** (s1 무성 구간, 첫 실룩임 프레임 S1_SNIFF_FRAME=6): true-silence 구간(제목카드 중간, 2.5~2.9s) 실측 -91.0dB 대비, SFX 윈도(4.0~4.6s) 실측 피크 -12.8dB로 명확한 에너지 존재 확인. s2 내레이션 피크(-3.6dB)보다 낮음
- **realize_ding.mp3** (s2 발견 리액션, 시작+3프레임): 윈도(5.9~6.5s) 실측 피크 -8.1dB, 마찬가지로 내레이션 피크(-3.6dB)보다 낮음
- 두 SFX 모두 "무음 대비 에너지 존재 + 내레이션보다 낮은 피크" 조건을 실측으로 확인했다. 실제로 듣기 좋은지·타이밍이 체감상 맞는지는 사용자 판단 영역

## 8. 배포

기술적 검증(precheck 에러 0, 렌더 성공, 프레임 검수, 오디오 레벨 확인)을 통과해 곧바로 배포했다.

- `/home/lee/project/shorts/ko/[19화] 개가 숨 쉬면서도 냄새 맡는 이유.mp4` (md5 `bfcfb4af9bfd4652ac5e66a93d2f6e8b`, out/episode-ko.mp4와 일치 확인 후 out/ 삭제)
- `/home/lee/project/shorts/en/[Ep. 19] Why Dogs Never Stop Smelling.mp4` (md5 `28c535e1c85f1bd65e9a0b1b09187a5c`, out/episode-en.mp4와 일치 확인 후 out/ 삭제)
- `episodes/general-ep19-dog-nose-slit/out/`에는 현재 `frames-ko/`, `frames-en/`(검수용, 27장씩)만 남아 있고 mp4는 없다

## 9. 확인 요청

위 체크리스트 항목은 전부 실제로 관찰한 사실을 적었다("검수 통과"라는 자체 판정이 아니다). 특히 S3 라벨 겹침은 1차 렌더에서 실제로 발견된 결함이었고, 수정 후 재렌더로 해소된 것을 프레임으로 재확인했다. 최종적으로 이 영상을 채널에 그대로 써도 되는지, 그리고 DogNoseCloseup의 시각적 스타일(개 코를 이렇게 단순화해 그린 것)이 채널 톤에 맞는지는 사용자가 직접 `shorts/ko`·`shorts/en`에서 확인해 주시길 부탁드립니다.
