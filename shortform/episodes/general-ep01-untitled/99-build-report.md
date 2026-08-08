# 빌드 리포트 - general-ep01-untitled ("차가운 거 먹으면 왜 이마가 아플까")

대상 대본: `02-script-v3.md` (critic 통과 확정본). 대본 문장은 수정하지 않았다.

---

## 1. 공용 자산 (언어 무관, 1회 작업)

### 재사용 (REGISTRY 기존 자산)
`character/Actor`, `character/BustActor`, `character/poses`(idle 등 기존 포즈), `backgrounds/PlainBg`,
`scenes/Caption`, `scenes/Label`, `scenes/Appear`, `scenes/SceneSwitcher`, `props/ThemedIcon`(Tabler
`bolt` 아이콘, 캐시에 이미 존재), `brand/Intro`, `brand/Outro`, `timeline.ts`(`sceneFrames`,
`sceneStarts`, `buildCaptions`), `FontLoader` — 총 12종 재사용.

### 신규 제작 (3개, 대본이 지정한 대로)
1. **`assets/props/IceCream.tsx`** — 아이스크림콘 소품(스쿱 1~2단 + 콘 와플격자). `width`
   `scoopColor` `coneColor` `stroke` `strokeWidth` `doubleScoop` `style` props.
2. **`assets/props/HeadNerveDiagram.tsx`** — 머리 옆모습 다이어그램. `highlightMouth`(냉기+혈관
   펄스, v3 요구대로 별도 prop 신설 없이 기존 prop 범위 확장으로 처리), `highlightForehead`,
   `showNerve`(0~1 진행도), `signalT`(0~1 이동신호) props로 s3·s4·s5를 한 컴포넌트로 처리.
3. **`character/poses.ts`의 `touchForehead` 포즈** — 바스트샷 전용. 최초 각도(armR s:-100~-178)는
   팔이 얼굴을 수직으로 관통해 "막대기"처럼 보이는 문제가 있어 `handPos()` 역산으로 3차 조정,
   최종적으로 관자놀이를 대각선으로 짚는 각도(`s:-125, e:-95`)로 확정했다(아래 5절 참고).

세 자산 모두 `assets/REGISTRY.md`에 등록 완료. `Catalog.tsx`에도 칸을 추가하고
`npx remotion still ... Catalog` 로 재렌더해 기존 자산이 깨지지 않았는지 육안 확인했다
(포즈 그리드 9열→touchForehead가 기존 "BustActor 데모" 칸과 겹치는 문제 발견 → 데모 칸을
touchForehead 겸용으로 재배치, 소품 섹션도 7칸→9칸으로 폭 재계산해 겹침 없이 수정).

### 문자열 테이블
`episodes/general-ep01-untitled/src/strings.ts` — `s2Label`(ko: "이마가 찌릿" / en: "Ow -
forehead") 1개 키. 나머지 화면 텍스트는 자막(어절 타임스탬프 기반)이라 별도 테이블 불필요.

---

## 2. 언어별 제작

### TTS (scripts/tts.py, general.md 프로필 설정 그대로 사용)
- ko: `voice=ko-KR-SunHiNeural rate=+20% pitch=+30Hz` → `public/audio/ko_s3.mp3`~`ko_s5.mp3` +
  `ko_words.json`
- en: `voice=en-US-AnaNeural rate=+20% pitch=+15Hz` → `en_s3.mp3`~`en_s5.mp3` + `en_words.json`
- s1·s2는 대본상 내레이션이 없는(무성) 구간이라 TTS 대상에서 제외했다. 구간 id는 s3·s4·s5로
  한국어/영어 동일하고 개수(3개)·순서도 동일, text만 다르다.

### 립싱크 (scripts/rms_mouth.py)
- ko/en 각각 `--prefix ko`/`--prefix en`로 실행 → `ko_mouth.json`, `en_mouth.json` 생성.
- 다만 이번 화는 s1(아이스크림 씹는 동작은 직접 애니메이션)·s2/s5(캐릭터가 말하지 않는 리액션
  샷)라 실제로 `mouthAt`/`mouthProp`을 쓰는 구간이 없다. 생성은 원칙대로 완료했지만 화면에는
  적용되지 않는다(이 화 대본 구조상 그런 것이지 스킵한 것이 아니다).

### 타임코드 확정 (언어별 파일)
`02-script-final-ko.md`, `02-script-final-en.md` 참고. 요약:

| | ko | en |
|---|---|---|
| s1(무성) | 2.000s (60f) | 2.000s (60f, 동일 동작) |
| s2(무성) | 2.500s (75f) | 2.500s (75f, 동일 동작) |
| s3 | 6.933s (208f) | 8.200s (246f) |
| s4 | 3.900s (115f) | 3.267s (98f) |
| s5 | 3.667s (110f) | 4.067s (122f) |
| 본편 합계 | 18.933s (568f) | 20.033s (601f) |
| 인트로+본편+아웃트로 | **24.277s** (727f) | **25.387s** (760f) |

두 언어 총 길이 차이(약 1.11초)는 정상이며 맞추지 않았다 - 근거는 `02-script-final-en.md` 하단에
기재. 60초 상한 대비 양쪽 다 여유가 크다.

---

## 3. 렌더 횟수 및 발견·수정한 결함

**렌더 횟수**: 언어별 2회씩(v1 → 결함 발견 → 수정 → v2), 총 4회 전체 mp4 렌더. 그 외 개발 중
`remotion still`로 프레임 단위 확인을 20회 이상 반복했다(포즈 각도·레이아웃 조정 시마다).

### 발견하고 고친 것 (v1 → v2)
1. **[공용 결함] 인트로→본편 경계 검정 프레임(black flash)** — `SceneSwitcher`의 첫 장면이
   0→1로 8프레임에 걸쳐 fade-in 하는데, `Episode` 루트 `AbsoluteFill`에 배경색을 지정하지 않아
   그 8프레임 동안 렌더 캔버스 기본색(검정)이 노출됐다. ko/en 공통 프레임 69(인트로 직후)에서
   실제로 확인(`out/check_boundary.png`가 완전 검정). **원인은 에피소드 루트의 배경 누락**이라
   `SceneSwitcher` 자체는 건드리지 않고 `Episode.tsx` 루트에 `background: C.paper`를 지정해
   해결. 재렌더 후 같은 프레임이 흰색(주변 장면과 자연스럽게 섞임)으로 바뀐 것을 확인했다.
2. **[공용 결함] s1 캐릭터가 작고 화면 상단에 치우쳐 하단 여백 과다** — 최초 `ACTOR_SIZE=760,
   ground=1250`(테마 기본값)으로 렌더한 프레임(`check_s1.png`)에서 캐릭터가 화면의 중간 정도
   높이에 작게 떠 있고 위아래 여백이 과도했다. `ACTOR_SIZE=1600, ground=1370`으로 확대해
   머리 끝이 안전영역(240px) 바로 아래, 발끝이 하단 안전영역(1400px) 바로 위에 오도록 재조정.
   아이스크림 위치도 `handPos()` 기반 계산이라 자동으로 따라와 재조정 불필요했다.
3. **[공용 결함] `touchForehead` 포즈의 팔이 얼굴을 수직으로 관통** — 처음 이마 꼭대기를 정확히
   짚게 하려고 `armR: {s:-178, e:2}`로 각도를 잡았더니 팔이 거의 다 펴진 직선이 되어 "막대기가
   머리에 꽂힌" 것처럼 보였다(`check_s2c.png`). `handPos()`로 여러 각도를 역산 비교한 끝에
   목표 지점을 이마 꼭대기 대신 관자놀이 부근으로 낮춰(`s:-125, e:-95`) 팔꿈치가 뚜렷이 꺾이는
   자연스러운 "관자놀이를 짚는" 동작으로 확정(`check_s2d.png`에서 확인). 포즈는 라이브러리
   자산이라 이 화·다음 화 모두에 이 수정이 적용된다.
4. **[공용 결함, 경미] 다이어그램 장면(s3~s5) 상단 여백이 다소 큼** — `DIAG_W=700, DIAG_Y=430`
   →`DIAG_W=780, DIAG_Y=350`으로 확대해 완화. 다이어그램-자막 사이 여백이 일부 남아 있으나
   심각한 결함은 아니라고 판단해 추가 조정은 하지 않았다(아래 체크리스트 참고).

### 확인했으나 결함이 아니었던 것 (오탐 배제)
- **s1→s2 전환 시 s1의 마지막 포즈(아이스크림 든 자세)가 s2 시작 프레임까지 짧게 이어 보임** —
  `SceneSwitcher`의 의도된 6프레임 크로스페이드 오버랩이다(나가는 장면이 `frames+xfade` 동안
  더 그려짐). "잔상 버그"가 아니라 정상 동작임을 `check_s1b.png`/`check_s2b.png` 사이 프레임을
  비교해 확인했다.
- **각 구간 시작 정확히 0프레임째에 자막이 안 보임** — `Caption` 컴포넌트 자체의 0.14초 페이드인
  설계(라이브러리 원본 로직, 이 화에서 건드리지 않음) 때문이다. 4프레임(133ms) 이내에 나타나므로
  체감상 문제없다.

---

## 4. 검수 체크리스트 (언어별 관찰 기록)

프레임 추출: `ffmpeg -vf select=...` 로 `out/frames-ko/`, `out/frames-en/`에 각 13장(구간별
시작+중간 지점, `sceneStarts`/`sceneFrames` 계산값 기준. 인트로/아웃트로 포함).

### 한국어 (episode-ko-v2.mp4)

- [x] **자막 화면 이탈**: f006(s3 시작 근처)·f007(s3 중간)·f009(s4 중간)·f011(s5 중간)·
      f012~f013(아웃트로) 전체 Read로 확인. 자막 박스가 좌우 안전영역(70px) 안에 있고 화면
      폭을 넘지 않음. s3 첫 줄 "순간 확 좁아졌다가 다시"(15자, wrapCounts ko 15자 기준)가
      한 줄에 정확히 들어감.
- [x] **장면 전환 캐릭터 잔상**: intro↔s1, s1↔s2, s2↔s3, s3↔s4, s4↔s5, s5↔outro 경계 프레임
      전부 확인. s1↔s2 사이 6프레임 크로스페이드(의도된 동작, 위 3절 참고) 외 잔상 없음.
- [x] **등장 전 요소가 점처럼 남음**: s2의 bolt 아이콘·라벨은 `Appear`(opacity 기반)라 등장 전
      완전히 투명 - f004(s2 시작, iconP/labelP≈0 구간)에서 점 형태 잔존 없음 확인.
- [x] **라벨 화면 밖 잘림**: s2 "이마가 찌릿"(f005·f006), s5 캐릭터 컷 전환(f011) 모두
      wrapWidth/maxWidth 안에서 줄바꿈되고 잘리지 않음.
- [x] **요소끼리 겹침**: HeadNerveDiagram의 forehead bolt 아이콘이 blush 마커와 인접하지만
      의도된 배치(통증 강조)이고 자막·라벨과는 겹치지 않음. f007~f011 확인.
- [x] **화면 하단 여백 과다**: v1에서 s1이 과도하게 비어 보이던 문제를 3절 2번으로 수정, f003·
      f004에서 캐릭터가 화면 세로 중앙~하단까지 채우는 것을 확인. s3~s5 다이어그램 장면은
      DIAG_W/Y 확대로 완화했으나 다이어그램-자막 사이 여백이 약 200px 정도 남아있음(f007·f009).
      캡션이 하단에 차 있고 안전영역 규칙은 지켰으므로 심각한 결함으로 보지 않았다.
- [x] **음량**: `ffmpeg -af loudnorm=print_format=summary` 측정 - Input Integrated **-13.7
      LUFS**, True Peak -2.6 dBTP. 무성 구간(s1+s2=4.5초) 포함 전체 평균이라 실제 발화 구간
      음량은 더 크다. 별도 정규화 없이 충분히 들리는 수준으로 판단.
- [x] **자막 스타일**: general 프로필의 `CAPTION_STYLE` 토큰(흰 배경+검은 외곽선, 어절별 코랄
      강조) 그대로 사용, 커스텀 값 없음.

### 영어 (episode-en-v2.mp4)

- [x] **자막이 화면 폭을 넘는지(영어 특유)**: f007("clamp shut then flood")·f009("forehead
      share one")·f011("that signal as pain in") 전부 Read로 확인. wrapCounts en 22자 기준으로
      줄당 3~4단어로 자연스럽게 끊겨 박스 안에 들어가고 화면 폭을 넘지 않음.
- [x] **인트로/아웃트로 영문 확인**: f001에서 "Whymo"(한국어 "굼구미" 아님), f013에서 "Whymo" +
      "Follow for more" + "Another curious question, coming up!" 전부 영어로 정상 표시.
      `lang="en"`을 Intro/Outro 양쪽에 명시했고 한국어 잔존 텍스트 없음을 확인.
- [x] **장면 전환 캐릭터 잔상**: ko와 동일 컴포넌트·동일 코드 경로라 f001~f013 전체에서 동일하게
      확인, 문제 없음.
- [x] **등장 전 요소 잔존**: ko와 동일하게 문제 없음(f004).
- [x] **라벨 잘림**: "Ow - forehead"(f005·f006) 한 줄로 wrapWidth 880 안에 들어가고 잘리지 않음.
- [x] **요소 겹침**: ko와 동일 배치라 문제 없음.
- [x] **화면 하단 여백**: ko와 동일 컴포넌트(로케일 무관 레이아웃)라 동일하게 개선 적용됨,
      f003·f004·f005 확인.
- [x] **음량**: Input Integrated **-16.3 LUFS**, True Peak -2.6 dBTP. ko보다 다소 낮음(en 음성
      자체 특성 + en 발화가 더 길어 평균이 더 희석됨). 일반적 스트리밍 타겟(-14~-16 LUFS) 범위
      안이라 정규화 없이 충분하다고 판단.
- [x] **자막 스타일**: ko와 동일 토큰, 언어별 커스텀 없음.

### 프로필(general.md) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 — 대본(v3, critic 통과) 승인
      사항이라 재판정 대상 아님. 화면 연출(아이스크림 먹다 이마가 찌릿한 상황)이 그 취지에
      맞게 구성됐음을 확인했다.
- [x] 어미 톤 — 대본 문장 자체이므로 builder가 수정하지 않았다(원칙 준수).
- [x] 전문용어가 등장한 자리에서 풀렸는가 — 대본 텍스트는 그대로이고, "혈관"·"신경" 등은
      HeadNerveDiagram 시각화로 보조했다(화면 중복 낭독 아님 - 대본이 이미 말로 풀어서 설명).
- [x] 자막 한 줄 15자(한국어) — wrapCounts(ko)로 강제, f006·f007·f009·f011·f012 전부 15자 이내
      확인.
- [x] 60초 상한 — ko 24.28s, en 25.39s로 여유 있게 하회.

---

## 5. 최종 산출물 절대경로

- **한국어 mp4 (최종, v2)**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-ko-v2.mp4` (24.277초)
- **영어 mp4 (최종, v2)**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-en-v2.mp4` (25.387초)
- (참고, 결함 있던 구버전 - 덮어쓰지 않고 보존) `out/episode-ko.mp4`, `out/episode-en.mp4`:
  인트로→본편 경계 검정 프레임 결함이 있는 v1. **배포에는 v2를 쓸 것.**
- 검수 프레임: `out/frames-ko/f001.png`~`f013.png`, `out/frames-en/f001.png`~`f013.png`
- 확정 타임코드: `02-script-final-ko.md`, `02-script-final-en.md`
- 신규 자산: `assets/props/IceCream.tsx`, `assets/props/HeadNerveDiagram.tsx`,
  `assets/character/poses.ts`(`touchForehead` 추가) — 전부 `assets/REGISTRY.md` 등록 완료
- 소스: `episodes/general-ep01-untitled/src/{index.ts,Root.tsx,Episode.tsx,scenes.tsx,strings.ts}`

---

## 6. 사운드 추가 (v6, 2026-08-08) - 영상·자막·대본은 v5와 동일, 소리만 추가

기존 v5까지는 내레이션 음성만 있고 효과음이 전혀 없었다("아이스크림 먹는 소리·시린 소리가
없으니 소리를 꺼두면 뭘 하는지 모르겠다"는 피드백). 이번 작업은 화면 애니메이션·자막 타이밍·
대본 문장을 전혀 건드리지 않고 사운드만 추가했다.

### 6-1. 인트로/아웃트로 딩 사운드 확정

- 사용자가 후보 7개 중 `intro_ding_b.mp3` / `outro_ding_b.mp3` 를 최종 선택.
- `assets/audio/candidates/` 에서 `assets/audio/intro_ding.mp3` / `assets/audio/outro_ding.mp3` 로
  이동(정식 자산 위치 승격). 나머지 후보 5개(intro a/c/d, outro a/c)는 `candidates/` 에 그대로 보존.
- `assets/brand/Intro.tsx`: 로고 뱃지가 팝인하는 spring 원점 프레임(`badgeP`, `frame: f - 12`)과
  정확히 같은 프레임(12)에 `<Audio src={staticFile('audio/intro_ding.mp3')} volume={0.7} />` 를
  `Sequence from={12} durationInFrames={15}` 로 삽입.
- `assets/brand/Outro.tsx`: 구독 벨이 팝인하는 spring 원점 프레임(`subP`, `frame: f - 21`)과 같은
  프레임(21)에 `<Audio src={staticFile('audio/outro_ding.mp3')} volume={0.7} />` 를
  `Sequence from={21} durationInFrames={16}` 로 삽입.
- REGISTRY 표의 Intro/Outro 행도 실제 프레임 수(69F/2.3초, 90F/3.0초 - 기존 표는 54F/75F로 낡아
  있었다)로 같이 바로잡았다.

### 6-2. 신규 효과음 2종 - 코드 합성(ffmpeg lavfi), 외부 소스 미사용

기존 딩 사운드의 mp3 메타데이터(`encoder: Lavf62.3.100`, mono 44.1kHz)로 미루어 ffmpeg lavfi
신스로 만들어진 것으로 판단하고 같은 방식을 그대로 따랐다. 제작에 쓴 원본 생성 스크립트는
보존되어 있지 않아(후보만 남아 있었음), 이번엔 아래 필터 체인을 새로 구성해 톤을 맞췄다.

- **`bite.mp3`** ("아삭" 크런치, 0.23초): `anoisesrc=color=white` 로 만든 흰 노이즈 버스트 2개를
  각각 다른 대역(1000~6500Hz / 1400~7500Hz)으로 필터링하고 90ms 간격(`adelay`)으로 겹쳐(`amix`)
  "씹는" 느낌의 이중 타격음을 만들었다. 각 버스트는 `afade` 로 짧은 어택(4ms)·빠른 디케이
  (70~90ms)를 줘 타격감을 냈다.
- **`cold_zing.mp3`** ("찌릿"한 시린 느낌, 0.30초): `aevalsrc` 표현식으로 선형 처프(chirp) 2개
  (약 3200->16200Hz, 4700->19700Hz)를 만들고 `exp(-decay*t)` 로 빠르게 감쇠시켜 "크리스탈이
  튕기는" 듯한 하이피치 스윕을 얻었다. 두 스윕을 `amix` 로 겹쳐 배음처럼 들리게 하고 끝에
  `afade` out.
- 게인은 기존 딩 사운드의 실측 피크(-3.1dB)에 맞춰 조정했다. 최종 피크: bite -2.4dB, cold_zing
  -1.2dB (클리핑 없음, 볼륨 검증은 6-4 참고).
- 저장 위치: `assets/audio/bite.mp3`, `assets/audio/cold_zing.mp3`.

### 6-3. Episode.tsx 배치 (언어 무관 공용 타이밍)

s1(아이스크림 한입)·s2(이마 찌릿)는 `SILENT_DURATIONS`(각 2.0초/2.5초)로 고정된 무성 연출
구간이라 `starts[0]`/`starts[1]` 이 ko/en 두 로케일 모두 항상 0/60프레임으로 동일하다. 따라서
이 두 효과음의 배치 프레임도 언어와 무관하게 하나의 상수로 고정할 수 있었다.

- **bite.mp3**: `scenes.tsx` 의 `S1Bite` 애니메이션 `bite = sin(min(1,progress(f,12,34))*PI)` 가
  최고점(진폭 1)을 찍는 로컬 프레임 23(`progress(f,12,34)` 의 중간값 0.5 지점 = 12+(34-12)*0.5)에
  맞춰 재생. 절대 프레임 = `INTRO_FRAMES(69) + starts[0](0) + 23 = 92` (2.9~3.4초 구간에서 재생,
  ko/en 공통).
- **cold_zing.mp3**: s2 장면 시작 프레임(`starts[1]`)에 맞춰 재생. 절대 프레임 =
  `INTRO_FRAMES(69) + starts[1](60) = 129` (4.15~4.55초 구간, ko/en 공통).
- 두 `<Audio>` 를 `Sequence`(from/durationInFrames)로 감싸 narratedIds(s3~s5) 오디오 옆에 추가.
  볼륨 0.9(내레이션 1.6보다 낮게 - 보조적인 느낌 유지).

### 6-4. 렌더 이슈: staticFile() 이 에피소드 public/ 을 찾지 못함 (해결)

`assets/audio/*.mp3` 에만 파일을 두고 렌더했더니 `Error while downloading .../public/audio/
intro_ding.mp3: 404` 로 실패했다. 원인: Remotion 의 `staticFile()` 은 **렌더 시점의
public 디렉토리**(기본값은 Remotion root의 `public/`, 이번 경우 `--public-dir` 로 명시한
`episodes/general-ep01-untitled/public/`)를 기준으로 찾지, `assets/audio/`(레지스트리 원본
보관 위치)를 보지 않는다. 폰트가 `public/fonts/` 에 복사돼야 하는 것과 같은 패턴이다.
`assets/audio/{intro_ding,outro_ding,bite,cold_zing}.mp3` 4개를
`episodes/general-ep01-untitled/public/audio/` 에 복사한 뒤 재렌더해 해결했다. 이 규칙을
REGISTRY.md 7절(오디오)에 명시해뒀다.

또한 이번 렌더는 `npx remotion render --public-dir=episodes/general-ep01-untitled/public
episodes/general-ep01-untitled/src/index.ts <CompositionId> <출력경로>` 형태로
`shortform` 루트(`package.json`/`remotion.config.ts` 위치)에서 실행했다 - Remotion 은 entry
파일 경로와 무관하게 "Remotion root"를 package.json 이 있는 디렉토리로 고정하고, 그 root 의
`public/` 을 기본 public 디렉토리로 삼기 때문에 `--public-dir` 명시가 필요했다.

### 6-5. 오디오 트랙 객관적 검증 (ko/en 동일 결과 - 언어 무관 타이밍이므로)

**Claude 는 소리를 들을 수 없으므로 "잘 들린다"는 청취 판단을 하지 않았다.** 아래는 ffprobe/
ffmpeg 로 확인 가능한 객관적 수치만이다.

- **오디오 트랙 존재**: `ffprobe` 로 ko/en v6 mp4 모두 `Stream #0:1: Audio: aac (LC), 48000 Hz,
  stereo` 확인. v2(사운드 없음) 대비 오디오 트랙 자체는 이전에도 있었지만(내레이션), 이번엔
  효과음 4개가 추가로 섞여 들어간 트랙이다.
- **타이밍 정확도**: `ffmpeg ... -af volumedetect` 로 각 효과음 예상 구간(±0.15~0.2초 창)과
  아무 소리도 없어야 할 기준 구간(s1 중간, 1.3~1.6초)을 대조했다.
  - 기준(무음) 구간: mean/max **-91.0dB** (사실상 디지털 무음)
  - 인트로 딩(0.30~0.65초): mean -22.5dB / max **-9.2dB**
  - bite(2.95~3.30초): mean -22.5dB / max **-6.9dB**
  - cold_zing(4.15~4.50초): mean -21.0dB / max **-4.9dB**
  - 아웃트로 딩(ko 21.75~22.10초 / en 22.85~23.20초, `INTRO_FRAMES+mainTotal+21` 프레임 기준
    언어별로 절대시각만 다름): mean -21.9~-22.0dB / max **-9.2dB**
  - ko/en 두 mp4 모두 동일한 패턴(수치까지 거의 동일) - 효과음이 언어 무관 공용 타이밍이라는
    설계가 그대로 반영됐음을 확인.
- **내레이션 대비 볼륨**: 전체 트랙 `loudnorm=print_format=summary` 로 Input True Peak 확인 -
  ko v6 **-2.6dBTP**, en v6 **-2.6dBTP** (v2 문서상 나레이션 True Peak 값과 동일). 효과음 4개의
  개별 피크(-9.2~-4.9dB)가 이 True Peak 보다 전부 낮으므로, 효과음이 내레이션 피크를 넘어서지
  않는다 - 효과음이 내레이션을 덮지 않는다는 뜻이다.
- Input Integrated(전체 평균 라우드니스): ko v6 -14.3 LUFS(참고: v2 -13.7 LUFS), en v6 -16.6
  LUFS(참고: v2 -16.3 LUFS). 0.3~0.6 LU 수준의 미세한 변화로, 효과음 4개(전부 합쳐 1초 남짓)가
  24~25초 트랙 평균에 주는 영향은 크지 않다고 판단했다.
- **정확한 청취 판단(소리가 자연스러운지·거슬리지 않는지)은 사용자 몫으로 남긴다.**

### 6-6. 화면(영상) 검수 - v5와 동일해야 하므로 가볍게만 확인

Episode.tsx/Intro.tsx/Outro.tsx 변경분은 전부 `<Audio>` `<Sequence>` 추가뿐이고 기존 시각 요소의
좌표·타이밍·JSX 는 하나도 건드리지 않았다. `npx tsc --noEmit` 클린 통과 확인 후, 대표 프레임
4장(인트로 뱃지 등장 직후 f020, s1 bite 피크 f092, s2 시작 f129, 아웃트로 벨 등장 직후 f679(ko))
을 ko/en 각각 뽑아 육안 확인 - 인트로 로고·"이마가 찌릿" 라벨·아이스크림 콘·아웃트로 다음편
카드가 전부 정상 렌더됐고 깨짐·잔상 없음. s2 시작 프레임(f129)에서 S1의 아이스크림이 여전히
보이는 것은 v2 검수에서 이미 "오탐 배제"로 확인된 `SceneSwitcher` 6프레임 크로스페이드의
의도된 동작(나가는 장면이 조금 더 그려짐)이라 재확인만 하고 결함으로 잡지 않았다.

### 6-7. 최종 산출물 (v6)

- **한국어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-ko-v6.mp4` (24.28초)
- **영어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-en-v6.mp4` (25.39초)
- 신규 공용 자산: `assets/audio/{intro_ding,outro_ding,bite,cold_zing}.mp3` - `assets/REGISTRY.md`
  7절에 등록 완료.
- **`shorts/ko`·`shorts/en` 배포함은 이번엔 갱신하지 않았다.** 사용자가 v6 사운드를 직접 듣고
  확인한 뒤 승인하면 그때 배포 사본을 갱신한다.
