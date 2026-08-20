# 빌드 리포트 - general-ep03-recorded-voice ("녹음된 내 목소리가 낯선 이유")

대상 대본: `02-script-v2.md` (가장 최신 버전, critique r1 반영본). 대본 문장은 수정하지 않았다.

---

## 1. 공용 자산 (언어 무관, 1회 작업)

### 재사용 (REGISTRY 기존 자산)
`character/Actor`, `character/BustActor`, `character/poses`(`idle`, `surprised`, `present` 등
기존 포즈), `backgrounds/PlainBg`, `scenes/Caption`, `scenes/Effects`(`Appear`),
`scenes/SceneSwitcher`, `scenes/TitleCard`, `props/ThemedIcon`(Tabler `device-mobile`,
`player-play`, `microphone` - 캐시에 없어 `scripts/sync_icons.mjs device-mobile microphone`로
추가, `player-play`는 기존 캐시에 이미 존재), `brand/Intro`, `brand/Outro`,
`assets/audio/intro_ding.mp3`, `assets/audio/outro_ding.mp3`, `timeline.ts`(`sceneFrames`,
`sceneStarts`, `buildCaptions`, `mouthAt`, `mouthProp`), `FontLoader` - 총 14종 재사용.

### 신규 제작 (2개)
1. **`assets/props/VoicePathDiagram.tsx`** - 대본이 지정한 대로 신규 제작. 공기 경로(머리
   바깥을 크게 도는 얇은 물결선)와 뼈 경로(머리 안쪽 짧은 물결선, `boneThickness`로 굵기·진폭
   강조)를 각각 growth(`showAirPath`/`showBonePath`) + 마이크 포착(`micCapture`)으로 제어.
   귀 좌표(`VOICE_EAR_PT`)는 지어낸 임의값이 아니라 `Character.tsx`의 실측 머리 윤곽 테이블
   (`HEAD_R`, 5도 간격 레이캐스트)에서 `theta=0` 지점을 그대로 가져왔다. `assets/REGISTRY.md`
   3절에 등록 완료, `src/Catalog.tsx`에도 데모 칸 추가 후 카탈로그 재렌더로 기존 자산 회귀
   없음을 확인했다.
2. **`assets/audio/ui_tap.mp3`** - s1(녹음 앱 무성 구간)의 정지/재생 버튼 탭에 쓰는 짧은
   "톡" 클릭음(0.10초). ffmpeg lavfi(`aevalsrc` 2200Hz 사인 + `volume=15dB` + `alimiter` +
   `afade`)로 코드 합성, 실측 피크 -3.2dB. `assets/REGISTRY.md` 7절에 "화면 UI 탭 동작 전반
   재사용 가능"으로 등록.

### 문자열 테이블
`episodes/general-ep03-recorded-voice/src/strings.ts` - `title` 키 하나(제목 카드용). 이 화는
정적 라벨이 없어(모든 화면 텍스트가 자막 또는 제목뿐) 그 외 키는 없다.

### 발견·수정한 결함 (렌더 전 개발 중, VoicePathDiagram)
1. **뼈 경로가 입 모양과 겹쳐 보임** - 최초 제어점(`BONE_C1/C2`)이 입 바로 아래를 스치듯
   지나가 입술 곡선과 시각적으로 뒤섞였다. `npx remotion still ... Catalog`로 확대 검수해
   발견 후, 제어점을 턱 쪽으로 더 크게 내렸다가 귀로 올라가는 경로로 재조정.
2. **귀 좌표가 지어낸 값이었음** - 처음엔 "머리 반지름 약 255" 어림값으로 귀 위치를 잡았는데,
   `Character.tsx`의 실측 `HEAD_R` 테이블을 뒤늦게 발견해 `theta=0` 지점(882.3, 452)의 정확한
   실측값으로 교체했다.

---

## 2. 언어별 제작

### TTS (scripts/tts.py, general.md 프로필 설정 + s2 리액션 오버라이드)
- ko: `voice=ko-KR-SunHiNeural rate=+20% pitch=+30Hz`(기본, s3~s5) / s2만
  `rate=+32% pitch=+55Hz`(리액션 오버라이드, ep01 v9 기준값 준용) →
  `public/audio/ko_s2~s5.mp3` + `ko_words.json`
- en: `voice=en-US-AnaNeural rate=+20% pitch=+15Hz`(기본, s3~s5) / s2만
  `rate=+30% pitch=+35Hz`(리액션 오버라이드) → `en_s2~s5.mp3` + `en_words.json`
- s1은 무성 구간(대본 지정)이라 TTS 대상에서 제외. 구간 id는 s2~s5로 ko/en 동일 개수(4개)·
  순서, text만 다르다.
- `scripts/tts.py`의 기존 구간별 rate/pitch 오버라이드 기능(ep01 v9에서 이미 추가된 것)을
  그대로 재사용했다 - 스크립트를 다시 고치지 않았다.

### 립싱크 (scripts/rms_mouth.py)
- ko/en 각각 `--prefix ko`/`--prefix en`로 실행 → `ko_mouth.json`, `en_mouth.json` 생성
  (콘솔 출력: ko `s2: 73 frames mean=0.399 max=0.930`, en `s2: 66 frames mean=0.315 max=0.974`
  등 4개 구간씩).
- 이 화에서 `mouthAt`/`mouthProp`을 실제로 쓰는 구간은 **s2 하나**(캐릭터가 직접 대사를 말하는
  바스트샷 리액션). s1은 스크립트 애니메이션(입 벌림을 직접 sin 함수로), s3~s5는 다이어그램
  장면이라 립싱크 대상이 아니다(ep01의 S3~S5와 동일 패턴).

### 타임코드 확정 (언어별 파일)
`02-script-final-ko.md`, `02-script-final-en.md` 참고. 요약:

| | ko | en |
|---|---|---|
| s1(무성, 대본 지정) | 2.000s (60f) | 2.000s (60f, 동일) |
| s2(리액션) | 3.033s (91f, 여백 0.6s 포함) | 2.800s (84f, 여백 0.6s 포함) |
| s3 | 5.800s (174f) | 6.767s (203f) |
| s4 | 6.067s (182f) | 6.800s (204f) |
| s5 | 6.933s (208f) | 8.467s (254f) |
| 본편 합계 | 23.833s (715f) | 26.833s (805f) |
| 인트로+제목카드+본편+아웃트로 | **30.933s** (928f) | **33.933s** (1018f) |

두 언어 총 길이 차이(en이 +3.0초 더 김)는 정상이며 맞추지 않았다 - 상세 원인(en 문장이 같은
정보를 더 많은 단어로 풀어 씀)은 `02-script-final-en.md` 하단에 기재. 60초 상한 대비 양쪽 다
여유가 크다(ko 30.93초, en 33.93초).

실제 렌더 결과(ffprobe 실측): ko mp4 **928프레임/30.976초**, en mp4 **1018프레임/33.984초** -
계산값과 프레임 수 완전 일치(초 단위 소수점 차이는 컨테이너 오버헤드).

---

## 3. 렌더 횟수 및 발견·수정한 결함

**렌더 횟수**: 언어별 2회씩(v1 → 결함 발견 → 수정 → v2), 총 4회 전체 mp4 렌더. 그 외
`remotion still`로 프레임 단위 확인을 10회 이상 반복(VoicePathDiagram 좌표 조정, S1 위치
디버깅 등).

### 발견하고 고친 것 (v1 → v2)
1. **[언어 무관 공용 결함] S1(녹음 앱 무성 구간)에서 스마트폰 아이콘이 캐릭터의 오른쪽 눈을
   가림** - 최초 배치(`PHONE_X = CX+210, PHONE_Y = 640`)가 캐릭터 머리 영역(화면상 대략
   x 235~845, y 378~988) 안쪽에 들어가 눈과 정확히 겹쳤다. ko v1 `out/frames-ko-v1/f004.png`
   (abs148, 정지 탭 시점)에서 실제로 확인. `PHONE_X = CX+300, PHONE_Y = 1000`(머리 바깥,
   오른쪽 어깨 옆)으로 재배치해 해결. `remotion still`로 record/stop/play 3개 상태 전부
   재확인 후 재렌더(v2). ko v2 `out/frames-ko-v2/f004.png`(abs133, record 상태)·`f005.png`
   (abs148, stop 상태)에서 더 이상 얼굴과 겹치지 않음을 확인.

### 확인했으나 결함이 아니었던 것 (오탐 배제)
- **`BustActor`(S2 리액션·VoicePathDiagram 내부)가 얼굴만 크롭되지 않고 팔다리까지 다 보임** -
  처음엔 이 화에서 새로 발견한 결함이라고 생각했으나, 이미 배포된 `general-ep01-untitled`의
  실제 렌더(`episodes/general-ep01-untitled/out/frames-ko-v10/` 대신 직접
  `remotion still ... EpisodeKo --frame=200`로 재확인)에서도 **동일하게 팔다리가 보이는 것을
  확인**했다. `assets/character/Actor.tsx`의 `BustActor`가 `BUST_VIEWBOX`로 카메라 좌표만
  옮길 뿐 실제 SVG 클리핑을 하지 않는 것으로 보이며(원인 후보), Catalog.tsx의 데모 카드가
  `overflow:hidden`인 별도 `Cell` 안에 있어서 그동안 "크롭되는 것처럼" 보였을 뿐이었다. 이미
  ep01이 이 동작 그대로 출시·승인됐으므로 **채널의 기존 시각 언어로 보고 이번 화에서 별도로
  수정하지 않았다** - 공용 컴포넌트를 고치는 것은 이 작업의 범위를 벗어나고(REGISTRY 규칙 6 -
  기존 자산 동작을 함부로 바꾸지 않는다), ep01의 승인된 결과물에 영향을 줄 위험이 있다. 다만
  다음 화 작업자가 다시 헷갈리지 않도록 여기 기록해 둔다(진짜 결함인지 기존 스타일인지 판단할
  근거).
- **인트로/제목카드/S1/S2/S3/S5/아�웃트로 각 경계 프레임(abs 123, 183, 274, 630, 838)에서
  전 프레임 요소가 옅게 남아 보임** - `SceneSwitcher`/`Sequence`의 8프레임 fade-in, 6프레임
  크로스페이드가 의도한 동작이다(ep01에서 이미 "정상 동작"으로 확인된 패턴과 동일). 예:
  abs123·abs838(각각 S1·아웃트로 시작 정확히 그 프레임)은 완전한 흰 배경(fade-in 진행 전),
  abs183(S1→S2 경계)은 아직 S1 내용이 보임(S1의 outA가 그 프레임에 아직 1) - 전부 재확인해
  결함 아님으로 판정.

---

## 4. 검수 체크리스트 (언어별 관찰 기록)

프레임 추출: `ffmpeg -vf select=...`로 `out/frames-ko-v2/`, `out/frames-en-v2/`에 각 20장
(구간별 시작·중간·전환 경계, `sceneStarts`/`sceneFrames` 실측값 기준. 인트로/제목카드/아웃트로
포함). 재렌더 후 새 폴더명(`-v2`)으로 뽑았고 `ls -la`로 타임스탬프가 방금 갱신됐음을 확인한 뒤
Read했다 - 이전 폴더(`-v1`)를 재사용하지 않았다.

### 한국어 (episode-ko-v2.mp4, 928프레임)

프레임 절대값: 34,96,123,133,148,165,183,200,228,274,320,361,448,500,539,630,690,734,838,883

- [x] **자막 화면 이탈**: f008(s2, "어 목소리가 다르게 들려"), f011~f012(s3, "가지 길로 귀에
      와요 이 중"), f014~f015(s4, "굵어요 그래서 평소 내"), f017~f018(s5, "소리만 담아요 그
      묵직한") 전부 Read로 확인. 자막 박스가 좌우 안전영역 안에 있고 화면 폭을 넘지 않음.
      한 줄이 15자 근처(wrapCounts ko 15자 기준)로 자연스럽게 끊김.
- [x] **장면 전환 캐릭터 잔상**: intro↔titlecard, titlecard↔s1, s1↔s2, s2↔s3, s3↔s4, s4↔s5,
      s5↔outro 경계 프레임(f003, f007, f010, f013, f016, f019) 전부 확인. SceneSwitcher의
      의도된 6프레임 크로스페이드(3절 "오탐 배제" 참고) 외 이상 잔상 없음.
- [x] **등장 전 요소가 점처럼 남음**: s2의 player-play 아이콘 배지는 `Appear`(opacity+scale
      기반)라 등장 전 완전히 투명 - f006(s2 시작 직후, iconP≈0 구간)에서 점 형태 잔존 없음
      확인. VoicePathDiagram의 공기/뼈 경로도 `strokeDashoffset` 기반이라 진행도 0일 때
      완전히 안 그려짐(길이 0의 점도 남지 않음) - f009(s3 시작 근처, 진행도 낮음)에서 확인.
- [x] **라벨 화면 밖 잘림**: 해당 없음(정적 라벨 없음, 자막만 존재). 스마트폰/재생/마이크
      아이콘 배지 전부 화면 안전영역 안에 위치(f004~f005 폰 아이콘 우측 어깨 옆, f006 재생
      배지 우상단, f017~f018 마이크 배지 귀 옆) - 화면 경계 벗어남 없음.
- [x] **요소끼리 겹침**: S1의 스마트폰 아이콘이 캐릭터 얼굴과 겹치던 결함을 3절에서 수정,
      f004·f005에서 더 이상 겹치지 않음을 확인. VoicePathDiagram의 공기/뼈 경로가 캐릭터
      얼굴 위에 겹쳐 그려지는 것은 의도된 오버레이 디자인(HeadNerveDiagram과 같은 원칙)이라
      결함이 아님.
- [x] **화면 하단 여백 과다**: f004·f005(S1 전신)에서 캐릭터가 화면 세로 중앙~하단까지 채움.
      S2~S5(바스트/다이어그램)도 캐릭터가 화면 하단 절반 이상을 채우고 자막이 하단에 붙어
      과다한 공백 없음 확인.
- [x] **음량**: `ffmpeg -af loudnorm=print_format=summary` 측정 - Input Integrated
      **-13.9 LUFS**, True Peak **-2.2 dBTP**(클리핑 없음). 효과음 타이밍 정밀 검증(atrim 기반,
      frame-accurate): 기준 무음 구간(s1 record phase, 4.33~4.60s) mean/max **-91.0dB**(완전
      디지털 무음), 정지 탭 sfx(4.93~5.13s) max **-8.6dB**, 재생 탭 sfx(5.50~5.70s) max
      **-8.6dB**, 인트로 딩(0.40~0.90s) max **-9.2dB**, 아웃트로 딩(28.63~29.17s) max
      **-9.2dB** - 전부 무음 기준 대비 뚜렷한 에너지 상승 확인, 전부 트랙 전체 True Peak
      (-2.2dBTP)보다 낮아 내레이션/전체 피크를 넘지 않음.
- [x] **자막 스타일**: general 프로필의 `CAPTION_STYLE` 토큰(흰 배경+검은 외곽선, 어절별 코랄
      강조) 그대로 사용, 커스텀 값 없음.

### 영어 (episode-en-v2.mp4, 1018프레임)

프레임 절대값: 34,96,123,133,148,165,183,205,225,267,320,368,470,520,572,674,730,801,928,973

- [x] **자막이 화면 폭을 넘는지(영어 특유)**: f008("Huh that sounds"), f012("up the sound
      that"), f017~f018(s5 자막) 전부 Read로 확인. wrapCounts en 22자 기준으로 줄당 3~4단어로
      자연스럽게 끊겨 박스 안에 들어가고 화면 폭을 넘지 않음.
- [x] **인트로/아웃트로 영문 확인**: f001에서 "Whymo"(한국어 "굼구미" 아님), f002(제목 카드)
      에서 "Why Your Recorded Voice Sounds Like a Stranger's" 영어 제목 정상 표시, f020(아웃트로)
      에서 "Whymo" + "Next up" + "Another curious question, coming up!" + "Follow for more"
      전부 영어로 정상 표시. `lang="en"`을 Intro/Outro/TitleCard(간접, strings.ts 경유) 전부에
      명시했고 한국어 잔존 텍스트 없음을 확인했다.
- [x] **장면 전환 캐릭터 잔상**: ko와 동일 컴포넌트·동일 코드 경로(언어 무관 공용 씬)라 동일
      패턴 확인, 문제 없음.
- [x] **등장 전 요소 잔존**: ko와 동일하게 문제 없음.
- [x] **라벨 잘림**: 해당 없음(정적 라벨 없음). 아이콘 배지 전부 안전영역 안(ko와 동일 좌표계).
- [x] **요소 겹침**: ko와 동일 배치라 문제 없음(S1 폰 위치 수정도 언어 무관 공용 컴포넌트라
      en에도 동일하게 적용됨).
- [x] **화면 하단 여백**: ko와 동일 컴포넌트(로케일 무관 레이아웃)라 동일하게 확인, 과다 공백
      없음.
- [x] **음량**: Input Integrated **-16.3 LUFS**, True Peak **-2.3 dBTP**(클리핑 없음). ko보다
      다소 낮음(en 음성 자체 특성 + en 발화가 더 길어 평균이 더 희석됨, ep01에서도 관찰된
      동일 패턴). 일반적 스트리밍 타겟(-14~-16 LUFS) 범위 안이라 별도 정규화 없이 판단은
      사용자에게 맡긴다.
- [x] **자막 스타일**: ko와 동일 토큰, 언어별 커스텀 없음.

### 프로필(general.md) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 대본(v2, critique r1 통과)
      승인 사항이라 builder가 재판정하지 않았다. 화면 연출(녹음-재생-놀람-원리 설명)이 그
      취지에 맞게 구성됐음을 확인했다.
- [x] 어미 톤 - 대본 문장 자체이므로 builder가 수정하지 않았다(원칙 준수).
- [x] 전문용어가 등장한 자리에서 풀렸는가 - 대본 자체에 "골전도" 등 전문용어가 전혀 없고
      "몸속 길", "낮고 굵어요" 등 쉬운 말로만 되어 있음(critique r1에서 이미 확인됨). 화면도
      텍스트 라벨 없는 순수 시각 다이어그램이라 전문용어 노출 없음.
- [x] 자막 한 줄 15자(ko)/22자(en, 화면폭 기준) 상한: 위 자막 화면이탈 체크에서 함께 확인.
- [x] 60초 상한: ko 30.93초, en 33.93초로 여유 있게 하회.

---

## 5. 최종 산출물 절대경로

- **한국어 mp4 (최종, v2)**: `/home/lee/project/.claude/shortform/episodes/general-ep03-recorded-voice/out/episode-ko-v2.mp4` (928프레임, 30.976초)
- **영어 mp4 (최종, v2)**: `/home/lee/project/.claude/shortform/episodes/general-ep03-recorded-voice/out/episode-en-v2.mp4` (1018프레임, 33.984초)
- (참고, 결함 있던 구버전 - 덮어쓰지 않고 보존) `out/episode-ko-v1.mp4`, `out/episode-en-v1.mp4`:
  S1 스마트폰 아이콘이 얼굴(눈)을 가리는 결함이 있던 v1. **v2를 정본으로 볼 것.**
- 검수 프레임: `out/frames-ko-v2/f001.png`~`f020.png`, `out/frames-en-v2/f001.png`~`f020.png`
  (구버전 `out/frames-ko-v1/`, `out/frames-en-v1/`도 회귀 비교용으로 보존)
- 확정 타임코드: `02-script-final-ko.md`, `02-script-final-en.md`
- 신규 자산: `assets/props/VoicePathDiagram.tsx`, `assets/audio/ui_tap.mp3` - 전부
  `assets/REGISTRY.md` 등록 완료(신규 아이콘 `device-mobile`/`microphone`도
  `scripts/icons.txt`/`assets/props/tabler-cache.json`에 추가)
- 소스: `episodes/general-ep03-recorded-voice/src/{index.ts,Root.tsx,Episode.tsx,scenes.tsx,strings.ts}`

**`shorts/ko`·`shorts/en` 배포함은 갱신하지 않았다.** 이 리포트의 검수 절은 관찰된 객관적
사실(자막 위치·잔상 여부·dB 수치 등)이며, "이 정도면 배포해도 되는지"의 최종 판단은 사용자
몫이다. 사용자가 v2를 확인하고 승인하면 그때 `shorts/ko`·`shorts/en`에 복사한다.

---

## 6. 배포 (2026-08-09, 사용자 승인 후)

- `shorts/ko/[3화] 녹음된 내 목소리가 낯선 이유.mp4` <- `out/episode-ko-v2.mp4` 복사
- `shorts/en/[Ep. 3] Why Your Recorded Voice Sounds Like a Stranger's.mp4` <- `out/episode-en-v2.mp4` 복사
- 원본은 `out/`에 그대로 유지(삭제하지 않음)
- md5sum 비교: 한/영 두 쌍 모두 소스·대상 일치 확인 완료

shorts/ 배포 완료, md5 일치 확인.
