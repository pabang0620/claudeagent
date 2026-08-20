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

## 7. 인트로/아웃트로 fade 전환 + 사운드 후보 확정 (v7, 백필)

이 절은 이전 세션(2026-08-08, 커밋 `5f2e031`)에서 실제로 진행됐지만 당시 이 리포트에
반영되지 않고 방치됐던 작업이다. 이번 v4 반영 작업을 시작하며 뒤늦게 요약해 채운다(앞으로
이런 누락이 없도록 매 렌더 후 이 리포트를 갱신할 것).

- 인트로 로고 뱃지의 등장 애니메이션을 회전+스프링 오버슈트(+17%)에서 opacity+14px 미세
  슬라이드만 쓰는 절제된 fade로 교체(`assets/brand/Intro.tsx`). 아웃트로 구독벨도 같은 톤으로
  완화(회전 자체는 유지, 팝인 속도만 완화, `assets/brand/Outro.tsx`).
  후보 4개를 실제 렌더해 비교 시트(`out/intro-style-compare/sheet.png`)로 만들어 육안으로
  선택했다(감으로 고르지 않음).
- 인트로/아웃트로 딩 사운드 후보 B를 확정본으로 승격: `assets/audio/intro_ding.mp3`,
  `assets/audio/outro_ding.mp3`.
- 신규 효과음 2종 확정: `assets/audio/bite.mp3`(아이스크림 베어무는 소리),
  `assets/audio/cold_zing.mp3`(이 시린 리액션) - ffmpeg lavfi 합성, 애니메이션 정점 프레임에
  동기화(6-2~6-3절 내용과 동일, v6에서 이미 적용됐던 결과물이 v7에서 그대로 유지됨).
- **최종 산출물 (v7)**: `out/episode-ko-v7.mp4`, `out/episode-en-v7.mp4`.
- **배포함 갱신 완료**: `shorts/ko/2026-08-08_brainfreeze.mp4`, `shorts/en/2026-08-08_brainfreeze.mp4`
  를 v7로 갱신, md5 일치 확인 완료(커밋 메시지 기준). 이번 v4(v8) 작업이 검수를 통과하면
  이 배포 사본이 다시 v8로 갱신된다(8-8절 참고).

---

## 8. v4 대본 반영 - s2 유성화 (2026-08-08, v8)

대상: `02-script-v4.md`(사용자 직접 지시, critic 판정 아님). 승인된 변경은 s2 구간에 음성을
추가하는 것 하나다. **대본 문장 자체는 손대지 않았다** - v4 문서가 확정한 문장을 그대로
스크립트 JSON에 옮겼을 뿐이다.

### 8-1. 반영한 변경 (공용, 1회)

- `script-ko.json`: s2 항목 신규 추가 `"아, 이마 아파. 왜 아픈 거지?"`, s3 도입부 "근데" 삭제
  (`"근데 진짜 차가워진 건..."` → `"진짜 차가워진 건..."`).
- `script-en.json`: s2 항목 신규 추가 `"Ow, my forehead! Wait, why?"`. s3는 v4 문서 지시대로
  **변경 없음**(영어 s2에 "But"이 없어 겹침 문제가 없으므로).
- `src/strings.ts`: 정적 캡션 `s2Label`("이마가 찌릿"/"Ow - forehead") 폐기. 이 화에 더 이상
  화면에 직접 굽는 정적 문구가 없어 `STRINGS`는 `{ko:{}, en:{}}`로 비웠다(Locale 타입만 export).
- `src/scenes.tsx`의 `S2Forehead`:
  - `locale` prop 제거, `lines: CaptionLine[]` prop 추가 → s3~s5와 동일하게 `Caption` 컴포넌트로
    발화를 자막으로 띄운다(정적 `Label` 렌더링 코드 삭제, `Label` import도 제거).
  - **고개 갸웃 미세조정**: `touchForehead` 포즈 자체(공용 `assets/character/poses.ts`)는
    건드리지 않고, 씬 로컬에서 구간 후반 45%(`progress(f, round(frames*0.55), frames-6)`)에
    `headTilt`만 최대 +8도 추가로 얹었다. 이 임계값(55%)이 실제 TTS 실측 타이밍과 맞는지
    확인한 결과 "왜"의 시작 시각(ko 2.167s = 로컬 프레임 65, en 2.51s = 로컬 프레임 75)과
    거의 일치했다(ko: tiltP 시작 프레임 67, en: 62) - "왜 아픈 거지?" 질문 부분에서 고개를
    갸웃하는 효과가 우연이 아니라 실제로 그 단어 구간과 겹친다.
  - **립싱크 신규 연결**: v3까지 이 화의 `mouth.json`은 생성만 되고 화면에 전혀 쓰이지
    않았다(2절 기록 - s1은 직접 애니메이션, s2/s5는 캐릭터가 말하지 않는 리액션 샷이라
    `mouthAt`/`mouthProp`을 쓰는 구간이 없었음). v4에서 s2가 캐릭터 본인이 실제로 말하는
    바스트샷이 되면서 이 화에서 처음으로 립싱크를 실제로 연결했다 - `mouthAt(mouth, 's2', f)`
    → `mouthProp()` → `BustActor`의 `mouthOpen` prop(포즈의 정적 mouthOpen을 덮어씀). 새 컴포넌트를
    만들지 않고 기존 `assets/timeline.ts`의 `mouthAt`/`mouthProp`을 그대로 가져다 썼다.
- `src/Episode.tsx`:
  - `SILENT_DURATIONS`(s1/s2 2종) → `SILENT_DURATION_S1`(s1 하나만). 무성 구간이 s1뿐이 됨.
  - `allSegments`/`pad`/`lineSpec`/`buildCaptions`에 s2를 TTS 실측 구간으로 포함(pad 0.2초 적용).
  - `narratedIds`를 `['s3','s4','s5']` → `['s2','s3','s4','s5']`로 확장, 오디오 `Sequence`
    인덱스 오프셋을 `starts[i+2]`/`frames[i+2]` → `starts[i+1]`/`frames[i+1]`로 수정(s1만 무성이라
    내레이션 배열이 인덱스 1부터 시작).
  - `ko_mouth.json`/`en_mouth.json`을 import해 `MOUTH_BY_LANG`으로 만들고 `S2Forehead`에
    `mouth` prop으로 전달.
  - **cold_zing 타이밍 재확인**: s2가 유성화되며 **길이**는 언어별로 달라졌지만, s2의
    **시작 프레임**(`starts[1] = frames[0]`, 즉 s1 길이로만 정해짐)은 이번 변경으로 전혀
    바뀌지 않았다(s1은 계속 2.0초 무성 고정). cold_zing은 s2 시작에 맞춰져 있으므로 코드
    수정 없이 그대로 맞다 - 확인만 하고 넘어갔다(아래 8-5절 실측으로 재확인).
- `assets/character/poses.ts`(공용 파일)와 `IceCream.tsx`/`HeadNerveDiagram.tsx`는 **손대지
  않았다** - v4 문서 지시대로 신규 자산 없음, 기존 것만 재사용.
- TypeScript: `npx tsc --noEmit` 클린(변경 직후, 렌더 전에 확인).

### 8-2. TTS 재생성 범위 (언어별)

`scripts/tts.py`는 스크립트 파일 전체를 한 번에 처리하고 `<prefix>_words.json`을 통째로
덮어쓰는 구조라(부분 재생성 API 없음, 소스 확인 완료) `script-ko.json`/`script-en.json`에
있는 s2~s5 4개 구간을 전부 다시 합성했다. 다만 **실제로 내용이 바뀐 것은 ko의 s2(신규)·
s3("근데" 삭제)와 en의 s2(신규)뿐**이고, 텍스트가 그대로인 구간(ko s4/s5, en s3/s4/s5)은
재합성해도 값이 그대로 나오는지 실측으로 확인했다:

| 구간 | 언어 | v3 실측(초) | v4 재합성 실측(초) | 텍스트 변경 여부 |
|---|---|---|---|---|
| s2 | ko | (무성, 대상 아님) | **3.864** | 신규 |
| s2 | en | (무성, 대상 아님) | **3.576** | 신규 |
| s3 | ko | 6.744 | **6.480** | 변경("근데" 삭제) |
| s3 | en | 7.992 | 7.992 | 불변 |
| s4 | ko | 3.624 | 3.624 | 불변 |
| s4 | en | 3.072 | 3.072 | 불변 |
| s5 | ko | 3.456 | 3.456 | 불변 |
| s5 | en | 3.864 | 3.864 | 불변 |

텍스트가 불변인 6개 구간 전부 소수점 셋째 자리까지 v3과 완전히 동일하게 재합성됐다
(edge-tts가 동일 입력에 결정적임을 실측으로 재확인) - v4 문서가 우려한 "s4/s5 텍스트가
조금이라도 달라지는" 문제는 발생하지 않았다.

- ko: `voice=ko-KR-SunHiNeural rate=+20% pitch=+30Hz` (general.md 프로필 그대로, 이전과 동일)
- en: `voice=en-US-AnaNeural rate=+20% pitch=+15Hz` (동일)
- 립싱크: `scripts/rms_mouth.py --prefix ko`/`--prefix en` 각각 재실행 → `ko_mouth.json`/
  `en_mouth.json` 재생성(4개 구간 전체 재정규화 - s2가 새로 유성화됐으니 전체 재계산 필요,
  원칙대로 언어 전체를 한 번에 정규화).

### 8-3. 타임코드 재확정 (언어별, `assets/timeline.ts` sceneFrames/sceneStarts 실측 기반)

**한국어** (`02-script-final-ko.md` 갱신):

| # | v3 길이 | v4 길이 | 비고 |
|---|---|---|---|
| s1 | 2.000s(60f) | 2.000s(60f) | 무성, 불변 |
| s2 | 2.500s(75f, 무성 고정) | **4.067s(122f, 실측)** | v4 신규 - 무성 고정값이 실측 발화 길이로 대체됨 |
| s3 | 6.933s(208f) | 6.667s(200f) | "근데" 삭제로 8f(0.264s) 단축 |
| s4 | 3.900s(115f) | 3.833s(115f) | 텍스트 불변, 프레임 수 동일(115f) |
| s5 | 3.667s(110f) | 3.667s(110f) | 텍스트 불변, 완전 동일 |
| **본편 합계** | 568f = 18.933s | **607f = 20.233s** | +39f(1.3s) |
| **mp4 전체** | 727f = 24.277s | **766f = 25.533s** | 인트로69f+본편+아웃트로90f |

**영어** (`02-script-final-en.md` 갱신):

| # | v3 길이 | v4 길이 | 비고 |
|---|---|---|---|
| s1 | 2.000s(60f) | 2.000s(60f) | 무성, 불변 |
| s2 | 2.500s(75f, 무성 고정) | **3.767s(113f, 실측)** | v4 신규 |
| s3 | 8.200s(246f) | 8.200s(246f) | 텍스트 불변, 완전 동일 |
| s4 | 3.267s(98f) | 3.267s(98f) | 텍스트 불변, 완전 동일 |
| s5 | 4.067s(122f) | 4.067s(122f) | 텍스트 불변, 완전 동일 |
| **본편 합계** | 601f = 20.033s | **639f = 21.300s** | +38f(1.267s), 전부 s2분 |
| **mp4 전체** | 760f = 25.387s | **798f = 26.600s** | 인트로69f+본편+아웃트로90f |

- s2 길이는 늘리거나 줄이지 않고 TTS 실측값 그대로 반영했다(원칙 0/4 - 채우기 아님).
- 60초 상한 대비 여전히 크게 여유 있음(본편 기준 ko 20.2초, en 21.3초).
- **언어 간 길이 차이는 정상, 맞추지 않았다**: en이 ko보다 전체 약 1.07초 더 길다(v3의
  1.11초 격차와 비슷한 수준 - s2가 양 언어 모두 비슷한 비율로 늘어났기 때문). 상세 원인은
  `02-script-final-en.md`의 "한국어 대비 길이 차이" 절 참고.
- 실제 렌더 결과(ffprobe 실측): ko mp4 766프레임/25.579초, en mp4 798프레임/26.645초 -
  계산값과 프레임 수 완전 일치(초 단위 소수점 차이는 인코더 컨테이너 오버헤드).

### 8-4. 렌더

`npx remotion render --public-dir=episodes/general-ep01-untitled/public episodes/general-ep01-untitled/src/index.ts <CompositionId> <출력경로>` 형태로 shortform 루트에서 실행(v6/v7과 동일 절차).

- ko: `EpisodeKo` → `out/episode-ko-v8.mp4` (766프레임 렌더·인코딩 완료)
- en: `EpisodeEn` → `out/episode-en-v8.mp4` (798프레임 렌더·인코딩 완료)
- v6/v7 mp4는 삭제하지 않고 `out/`에 그대로 유지했다.

### 8-5. 대표 프레임 검수 (언어별, 재렌더 직후 새 폴더에서 추출 - 캐시 재사용 없음)

`out/frames-ko-v8/`, `out/frames-en-v8/`를 이번 렌더 직후 새로 생성해 추출했다(`ls -la`로
타임스탬프가 방금 갱신됐음을 확인 후 Read). 각 언어의 `sceneStarts`/`sceneFrames` 실측값으로
계산한 구간별 시작·중간·전환 경계 프레임을 뽑았다(인트로 69f 오프셋 포함):

- ko: 69,99,126,129,150,190,229,245,248,251,351,448,451,508,563,566,621,676,696
- en: 69,99,126,129,150,186,220,235,239,242,365,485,488,537,583,586,647,708,728

**한국어 (`episode-ko-v8.mp4`)**

- [x] **s2 신규 음성·자막 동기화**: f004(s2 시작, f129)~f006(local 61, f190) 확인 - 캡션
  "아 이마 아파 왜 아픈 거지"가 한 줄(15자 근처, wrapByChars 기준 한 줄에 다 들어감)로
  구간 시작과 거의 동시에 나타나고 사라지지 않고 유지됨. `tilt001/002.png`(f229/245, s2
  로컬 프레임 100/116)에서 머리가 초반 대비 뚜렷이 더 기울어져 있음을 직접 확인 - "왜 아픈
  거지?" 구간(2.167s~)에서 고개 갸웃 효과가 실제로 걸려 있다.
- [x] **립싱크**: f004~f006, tilt001/002 4장에서 입 모양이 프레임마다 다르게(작게 벌어짐/
    스마일 모양/살짝 벌어짐) 렌더된 것을 직접 확인 - 이전(v3~v7)에는 이 구간이 정적 포즈
    mouthOpen(0.3 고정)이었는데 이번엔 프레임별로 달라짐을 이미지로 확인했다. RMS 값 자체가
    올바른지는 `rms_mouth.py` 콘솔 출력(`s2: 116 frames mean=0.346 max=0.998`)으로 교차 확인.
- [x] **s1→s2, s2→s3 전환 잔상**: f003(f126, s1→s2 전환 -3프레임)은 여전히 아이스크림 장면 -
  `SceneSwitcher` 6프레임 크로스페이드의 의도된 동작(나가는 장면이 조금 더 그려짐, v2 검수에서
  이미 "오탐 배제"로 확인된 패턴)과 동일해 결함 아님으로 재확인. f007(f248, s2→s3 전환
  -3프레임)/f008(f251, s3 시작)도 동일 패턴(HeadNerveDiagram이 BustActor와 완전히 같은 크기·
  위치라 전환 중 화면이 거의 같아 보임, v3 검수에서 이미 의도된 설계로 확인된 부분) - 새 결함
  아님.
- [x] **자막 화면이탈**: f004~f017 17장 전체를 훑어 좌우 잘림 없음을 확인. s3 캡션(f009,
  "순간 확 좁아졌다가 다시")에서 "근데"가 실제로 빠져 있음을 육안 확인(v4 반영 검증 겸함).
- [x] **장면 전환 캐릭터 잔상 / 등장 전 요소 잔상**: f011(s4 시작), f014(s5 시작), f015(s5 중간)
  확인 - 신경선·신호 애니메이션이 프레임에 맞게 자연스럽게 나타나며 점처럼 남는 잔상 없음.
- [x] **화면 하단 여백**: f004~f017 전체에서 캡션 박스가 화면 하단부(23% 지점)에 위치하고
  캐릭터/다이어그램이 세로 중앙~하단을 채움 - 과다한 하단 공백 없음.
- [x] **음량**: 8-6절 참고, True Peak -2.7dBTP.
- [x] **자막 스타일**: 흰 글자+검은 외곽선, 어절 강조(코랄색) 유지 확인 - general.md 프로필
  자막 스타일과 일치.

**영어 (`episode-en-v8.mp4`)**

- [x] **s2 신규 음성·자막 동기화**: f004(s2 시작)~f006(local 57) 확인 - 캡션이 "Ow my forehead
  Wait"(4단어, wrapByChars 22자 기준 첫 줄) → tilt001(f220, local 91)에서 "why"로 전환됨을
  확인. 단어 수가 5개(Ow/my/forehead/Wait/why)라 22자 상한에 걸려 2줄로 나뉘는데, 이 자체는
  한 화면에 한 줄만 뜨는 정상 동작이고 화면 밖으로 잘리지 않았다.
- [x] **립싱크**: f004~f006, tilt001/002에서 입 모양이 한국어와 마찬가지로 프레임별로 다르게
  움직임을 확인. RMS 콘솔 출력(`s2: 108 frames mean=0.299 max=0.990`)과 교차 확인.
- [x] **고개 갸웃 타이밍**: en의 "why" 시작 시각(2.51s = 로컬 프레임 75)과 tiltP 시작 프레임(en
  frames=113 → round(113*0.55)=62)이 가깝게 맞아떨어짐 - tilt001(로컬91)에서 이미 상당히
  기울어진 상태, tilt002(로컬106)에서 최대치 근접 확인.
- [x] **전환 잔상**: f003(s1→s2 전환), f007/f008(s2→s3 전환) 한국어와 동일 패턴 확인 - 새 결함
  없음.
- [x] **자막 화면이탈**: f004~f017 17장 전체 확인, 영어 단어가 한국어보다 길어서 22자 상한을
  썼음에도 잘림 없음(예: "clamp shut then flood" f009, "that signal as pain in" f015 전부
  좌우 여유 있게 들어감).
- [x] **화면 하단 여백**: 한국어와 동일 레이아웃이라 과다 공백 없음.
- [x] **자막 스타일**: 한국어와 동일 스타일 적용 확인.

**프로필(general.md) 추가 체크** (8절)

- [x] **자막 한 줄 15자(ko)/영어는 화면폭 기준(22자) 상한**: s2 ko 캡션 "아 이마 아파 왜 아픈
  거지"는 공백 제외 약 12자로 상한 이내, en은 wrapByChars 22자 기준으로 자동 분리됐음을 위에서
  확인.
- [x] **60초 상한**: 본편 기준 ko 20.2초, en 21.3초로 상한과 거리가 멀다.
- [x] **어미 톤**: "아, 이마 아파. 왜 아픈 거지?"는 v4 문서가 이미 "반응 강요 금지 목록에
  해당하지 않는다"고 판단한 문장이고, 이번 세션에서 문장 자체를 바꾸지 않았으므로 재판정하지
  않았다(builder는 대본 내용을 수정하지 않는다는 원칙에 따름).

### 8-6. 오디오 객관적 검증 - cold_zing이 s2 발화와 겹치는 구간 재점검

s2가 유성화되면서 cold_zing(효과음)과 s2 내레이션(대사)이 **동시에** 재생되는 구간이 새로
생겼다(둘 다 절대 프레임 129, 즉 4.3초부터 시작). 겹침 자체가 결함인지 객관적 수치로 확인했다:

| 측정 구간 | ko v8 | en v8 |
|---|---|---|
| 무음 기준(s1 중간, 1.3~1.6초) | mean -91.0dB / max -91.0dB | mean -91.0dB / max -91.0dB |
| bite(2.95~3.30초, s1) | mean -22.3dB / max -6.9dB | mean -22.3dB / max -6.9dB (변경 없음, 기준값과 완전 일치) |
| cold_zing+s2 발화 겹침(4.30~4.70초) | mean -17.5dB / max **-4.9dB** | mean -16.9dB / max **-4.9dB** |
| 트랙 전체 Input True Peak | **-2.7dBTP** | **-2.6dBTP** |

- cold_zing 구간의 max_volume(-4.9dB)은 v6/v7(효과음 단독, mean -21.0dB/max -4.9dB)과 max값이
  **완전히 동일**하다 - cold_zing 자체의 피크는 그대로이고, mean만 올라간 것(-21.0dB→
  -17.5/-16.9dB)은 이제 그 구간에 s2 내레이션 에너지가 추가로 섞였기 때문이다(정상, 의도된
  변화).
- cold_zing의 피크(-4.9dB)는 트랙 전체 True Peak(-2.7/-2.6dBTP)보다 여전히 낮다 - 효과음이
  내레이션 피크를 넘어서지 않는다. **재배치 없이 그대로 둬도 되는 것으로 판단했다.**
- **정확한 청취 판단(효과음과 대사가 겹쳐 들릴 때 거슬리는지)은 사용자 몫으로 남긴다** - 이
  에이전트는 소리를 들을 수 없으므로 dB 수치까지만 검증했다.

### 8-7. REGISTRY 갱신 여부

이번 변경은 **신규 공용 자산이 없다**(v4 문서 "새로 만들어야 함: 없음" 그대로). `poses.ts`도
건드리지 않았으므로(씬 로컬 headTilt 오프셋으로 처리) `assets/REGISTRY.md`는 갱신하지 않았다.

### 8-8. 최종 산출물 (v8)

- **한국어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-ko-v8.mp4` (766프레임, 25.58초)
- **영어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-en-v8.mp4` (798프레임, 26.65초)
- 검수 통과 → 배포함 갱신:
  - `/home/lee/project/shorts/ko/2026-08-08_brainfreeze.mp4` (v8로 갱신)
  - `/home/lee/project/shorts/en/2026-08-08_brainfreeze.mp4` (v8로 갱신)
  - md5 대조로 복사 확인(아래 커맨드 결과 참고).
- v6/v7 mp4·프레임 폴더는 삭제하지 않고 `out/`에 유지(회귀 비교용).

## 9. 리액션 톤 분리 + 전환 텀 확대(v9)

사용자 지시 2건. 대본 문장(내레이션 텍스트)은 전혀 수정하지 않았다.

1. "설명을 하는 목소리와 아파 왜 아픈거지? 하는 목소리가 달라야 할 거 같아" -> s2(리액션)만
   rate/pitch를 프로필 기본값보다 올려 급하고 놀란 톤으로, s3~s5(설명)는 프로필 기본값 그대로.
2. "설명을 들어가기전엔 텀을 조금만 더 길게해야해" -> s2 종료~s3 시작 전환만 여백을 늘리고,
   다른 전환(s1->s2, s3->s4, s4->s5)은 손대지 않음.

### 9-1. `scripts/tts.py` 개선 - 구간별 rate/pitch 오버라이드 지원

기존 `tts.py`는 스크립트 파일 전체에 단일 rate/pitch만 적용했다(파일 최상단 meta 또는
`--rate`/`--pitch` 인자, 전 구간 공통). 새로 짜지 않고 스크립트 원본에 최소 변경을 더했다:

```python
# scripts/tts.py run() 내부
seg_rate = seg.get('rate') or rate
seg_pitch = seg.get('pitch') or pitch
out.append(await one(sid, text, args.out, args.prefix, voice, seg_rate, seg_pitch))
```

- `seg`(구간 dict)에 `"rate"`/`"pitch"` 키가 있으면 그 구간만 다른 값으로 합성하고, 없으면
  기존과 동일하게 전역 rate/pitch를 쓴다 - **기존 동작은 그대로, 옵션만 추가**했다(원칙 6).
- 감사(audit) 가능하도록 `one()`의 콘솔 로그와 반환 dict에도 실제 사용된 rate/pitch를 남기게
  했다(`{sid}: {dur}s / {n} words / rate={rate} pitch={pitch}`, 반환 dict에 `rate`/`pitch` 키 추가).
  기존 `words.json` 소비처(`assets/timeline.ts`의 `SegmentData`)는 타입 단언(`as WordsFile`)으로
  읽으므로 추가 필드가 있어도 깨지지 않는다.
- `script-ko.json`/`script-en.json`의 s2 항목에만 `"rate"`/`"pitch"`를 추가했다(대본 `text`는
  무수정):
  ```json
  {"id": "s2", "text": "아, 이마 아파. 왜 아픈 거지?", "rate": "+32%", "pitch": "+55Hz"}
  {"id": "s2", "text": "Ow, my forehead! Wait, why?", "rate": "+30%", "pitch": "+35Hz"}
  ```

### 9-2. 실제 사용된 rate/pitch 값 (tts.py 콘솔 로그)

| 구간 | ko rate/pitch | en rate/pitch |
|---|---|---|
| s2 (리액션) | **+32% / +55Hz** | **+30% / +35Hz** |
| s3~s5 (설명) | +20% / +30Hz (프로필 기본값, 변경 없음) | +20% / +15Hz (프로필 기본값, 변경 없음) |

실제 `tts.py` 실행 로그:

```
s2: 3.528s / 6 words / rate=+32% pitch=+55Hz     (ko)
s3: 6.480s / 14 words / rate=+20% pitch=+30Hz
s4: 3.624s / 7 words / rate=+20% pitch=+30Hz
s5: 3.456s / 7 words / rate=+20% pitch=+30Hz

s2: 3.288s / 5 words / rate=+30% pitch=+35Hz     (en)
s3: 7.992s / 24 words / rate=+20% pitch=+15Hz
s4: 3.072s / 7 words / rate=+20% pitch=+15Hz
s5: 3.864s / 11 words / rate=+20% pitch=+15Hz
```

s3/s4/s5 duration은 파라미터를 전혀 바꾸지 않았음에도 재합성했는데(전체 스크립트를 한 번에
다시 돌리는 방식을 택했으므로), **재합성 후에도 v8 대비 duration이 소수점 셋째 자리까지 완전히
동일**했다(ko: 6.480/3.624/3.456, en: 7.992/3.072/3.864 - v8 report의 표와 일치). edge-tts가
동일 입력(voice/rate/pitch/text)에 대해 결정적으로 동일 길이를 내놓는다는 뜻이고, 제약사항
"다른 구간의 파라미터·타이밍은 건드리지 않는다"를 실측으로도 만족했다고 판단했다.

### 9-3. 피치(F0) 측정 - 객관적 검증

환경에 librosa가 없어 PEP668 부트스트랩 방식으로 `.venv/bin/pip install librosa`를 실행해
설치했다(에러 없이 완료).

s2와 s3는 **문장 자체가 다르므로** 실제 s2(override)와 s3(base) mp3의 F0를 그냥 비교하면
"파라미터 차이"와 "문장 자체의 억양 차이"가 섞여 결론이 흐려진다. 그래서 **같은 s2 텍스트를
base 파라미터(+20%/+30Hz, +20%/+15Hz)와 override 파라미터(+32%/+55Hz, +30%/+35Hz)로 각각
합성해 F0만 비교**하는 격리 실험을 했다(`librosa.pyin`, fmin=C2~fmax=C7):

| 텍스트 | base 파라미터 | override 파라미터(실제 s2에 쓰인 값) | 차이 |
|---|---|---|---|
| ko "아, 이마 아파. 왜 아픈 거지?" | mean 264.1Hz / median 252.0Hz | mean **298.2Hz** / median 285.3Hz | **+34.1Hz (+12.9%)** |
| en "Ow, my forehead! Wait, why?" | mean 329.9Hz / median 318.4Hz | mean **370.5Hz** / median 356.4Hz | **+40.6Hz (+12.3%)** |

추가로 pitch 파라미터 자체가 F0에 선형적으로 반영되는지 별도 텍스트("안녕하세요
테스트입니다", ko, rate 고정 +20%)로도 확인했다: pitch +0Hz -> mean 267.0Hz, +30Hz -> 312.6Hz,
+55Hz -> 360.6Hz, +100Hz -> 387.1Hz - pitch를 올릴수록 측정 F0도 단조 증가함을 확인했다(엔진
동작 자체가 설정값에 반응한다는 근거).

참고로 실제 s2(override)와 실제 s3(base, 다른 문장)를 그대로 비교하면 ko는 298.1Hz vs
295.4Hz로 차이가 거의 안 보이는데, 이는 s3 문장 자체의 억양(느낌표/물음표 없는 서술문)이
자연히 더 낮게 깔리는 효과와 파라미터 상승 효과가 상쇄됐기 때문으로 보인다 - 그래서
위 격리 실험(같은 텍스트, 파라미터만 다름)을 신뢰할 수 있는 근거로 썼다.

**결론**: rate/pitch 설정값은 실제로 다르게 호출됐고(9-2), 같은 문장 기준으로 측정한 F0도
그 설정값 차이만큼 실제로 상승했다(9-3). 다만 이 자체가 "듣기에 화나거나 놀란 톤으로
들리는지"는 청취 판단이라 이 에이전트가 결론 내리지 않는다 - 수치 검증까지만 했다.

### 9-4. 전환 텀 확대 - `Episode.tsx`

`assets/timeline.ts`의 `sceneFrames(segments, padSec)`는 이미 `padSec`을 배열로 받아 구간별로
다른 여백을 줄 수 있었다(`padSec: number | number[]`) - **timeline.ts는 전혀 수정하지 않았다**
(원칙 6 - 기존 기본 동작 유지, 이미 있는 옵션을 썼을 뿐).

```ts
// Episode.tsx
const S2_TO_S3_PAD = 0.6;   // 다른 전환은 NARRATED_PAD = 0.2 그대로
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];
// allSegments = [s1, s2, s3, s4, s5] 이므로 pad[1](s2 끝)만 늘리면
// s2 종료~s3 시작 사이 텀만 늘어난다. s1->s2, s3->s4, s4->s5 전환은 그대로.
```

기존에 `Episode` 본체와 `totalFramesFor` 두 곳에 동일한 pad 배열 리터럴이 중복돼 있어서(한쪽만
고치면 렌더 프레임 수가 어긋나는 실수가 나기 쉬운 구조였다) 모듈 스코프 상수 `SCENE_PAD` 하나로
합쳐 양쪽에서 같은 값을 쓰게 했다.

### 9-5. 전환 텀이 실제로 몇 프레임 늘었는지 - 프레임 수치 검증

| | v8 (pad 0.2s) | v9 (pad 0.6s, s2만) | 비고 |
|---|---|---|---|
| ko s2 프레임 수(frames[1]) | 122f | **124f** | s2 발화 자체가 빨라져(3.864s->3.528s) 축소된 만큼을 pad 확대(+0.4s)가 상쇄하고 남은 순증가 |
| en s2 프레임 수(frames[1]) | 113f | **117f** | 동일 이유 |
| ko 본편 합계 | 607f | 609f | |
| en 본편 합계 | 639f | 643f | |

프레임 수만으로는 "말이 빨라진 만큼 pad가 늘어난 걸 상쇄해서 체감 변화가 작아 보일 수 있다"는
우려가 있어, **캡션이 사라진 뒤 다음 장면으로 넘어가기 전까지의 "조용한 정지 구간"** 을
직접 계산해 비교했다(캡션 종료 = 마지막 단어 끝 + tailOut 0.6s, `buildCaptions` 기본값):

| | v8 | v9 | 증가 |
|---|---|---|---|
| ko: 캡션 종료 후 s2 끝까지 남는 프레임 | 122f - 111f = 11f (0.367s) | 124f - 103f = **21f (0.7s)** | **+10f (+0.33s)** |

(캡션 종료 프레임 계산: v8은 마지막 단어 끝 3.115s+tailOut 0.6s=3.715s -> round(3.715*30)=111f,
v9는 마지막 단어 끝 2.831s+0.6s=3.431s -> round(3.431*30)=103f. v9는 말이 더 빨리 끝나는데도
scene 자체는 더 오래 유지되므로 "말없이 서 있는 시간"이 거의 2배로 늘었다.)

이 "조용한 정지 구간"은 실제 렌더 프레임에서도 확인했다 - ko f005(절대 250f, s2 로컬 121f)와
f006(절대 252f, s2 로컬 123f)에서 캡션 박스 없이 캐릭터가 이마를 짚은 채 정지해 있는 프레임을
직접 Read로 확인했다(아래 9-6 참고). v8에서는 이 여유 구간이 짧아 검수 프레임에 거의 잡히지
않았다.

### 9-6. 재렌더 및 프레임 검수 (새 폴더, 캐시 재사용 없음)

`out/frames-ko-v9/`, `out/frames-en-v9/`를 새로 생성해(`rm -rf` 후 `mkdir`) 렌더 직후 추출했다.
`ls -la`로 방금 갱신된 타임스탬프임을 확인 후 Read했다.

렌더 결과(ffprobe 실측, 계산값과 완전 일치):

- ko: `EpisodeKo` -> `out/episode-ko-v9.mp4` **768프레임 / 25.600초** (계산: 인트로69f+본편609f+아웃트로90f=768f)
- en: `EpisodeEn` -> `out/episode-en-v9.mp4` **802프레임 / 26.733초** (계산: 인트로69f+본편643f+아웃트로90f=802f)

각 언어의 `sceneStarts`/`sceneFrames` 실측값으로 계산한 구간별 시작·중간·s2/s3 경계 프레임을
뽑았다(인트로 69f 오프셋 포함):

- ko: 69,99,129,191,250,252,253,258,263,268,353,453,510,568,623
- en: 69,99,129,187,243,245,246,251,256,261,369,492,541,590,651

**한국어 (`episode-ko-v9.mp4`)**

- [x] **s2 신규 톤 반영 확인**: f003(s2 시작, f129)에서는 SceneSwitcher 크로스페이드로 아직
  S1(아이스크림) 장면이 지배적으로 보임(v8에서도 동일하게 확인된 정상 크로스페이드 패턴,
  새 결함 아님). f004(s2 로컬 62)에서 "아 이마 아파 왜 아픈 거지" 캡션과 함께 이마를 짚은
  포즈를 직접 확인.
- [x] **전환 텀 확대 - 조용한 정지 구간 실사 확인**: f005(절대250, s2로컬121)와 f006(절대252,
  s2로컬123) 2장 모두 캡션 박스 없이 캐릭터가 이마를 짚은 채 정지, bolt 아이콘만 떠 있는
  프레임을 직접 확인 - 9-5에서 계산한 "캡션 종료 후 정지 구간(21f)"이 실제 렌더에 그대로
  나타남을 눈으로 봤다.
- [x] **s2->s3 전환**: f007(절대253, s3 로컬0)에서 "진짜 차가워진 건 입" 캡션과 함께
  HeadNerveDiagram(입천장 냉기 표시)으로 넘어간 것을 확인. f008~f010(s3 로컬5/10/15)에서
  캡션이 "진짜"->"진짜 차가워진"으로 어절 강조가 진행되는 것을 확인 - 전환 자체가 끊기거나
  씹히지 않고 자연스럽게 이어짐.
- [x] **자막 화면이탈**: f003~f015 13장 전체 확인, 좌우 잘림 없음.
- [x] **장면 전환 캐릭터 잔상/등장 전 요소 잔상**: f011(s3 중간), f012(s4 시작), f013(s4 중간),
  f014(s5 시작), f015(s5 중간) 확인 - 신경선·신호 애니메이션이 프레임에 맞게 나타나고 점처럼
  남는 잔상 없음. v8과 동일한 패턴(이 구간 코드는 이번에 손대지 않음).
- [x] **화면 하단 여백**: f003~f015 전체에서 캡션 박스가 하단 23% 지점에 위치, 캐릭터/다이어그램이
  세로 중앙~하단을 채움 - 과다 공백 없음. BUST_SIZE/BUST_LEFT/BUST_TOP 등 레이아웃 상수를
  전혀 건드리지 않았으므로 v8과 동일.
- [x] **자막 스타일**: 흰 글자+검은 외곽선, 어절 강조(코랄) 유지 확인.

**영어 (`episode-en-v9.mp4`)**

- [x] **s2 신규 톤 반영 확인**: f004(s2 로컬58)에서 "Ow my forehead Wait" 캡션과 이마 짚는
  포즈 확인 (단어 5개라 2줄로 나뉘는 v8과 동일 패턴).
- [x] **전환 텀 확대 - 조용한 정지 구간**: f005(절대243, s2로컬114)와 f006(절대245, s2로컬116)
  2장 모두 캡션 없이 정지 포즈만 확인 - ko와 동일하게 조용한 정지 구간이 실사로 확인됨.
- [x] **s2->s3 전환**: f007(절대246, s2/s3 경계 - 크로스페이드로 아직 이전 장면 지배적, ko와
  동일 패턴 확인)->f008(절대251, s3 로컬5)에서 "But the cold part is" 캡션과 함께 다이어그램
  전환 확인, f010(s3 로컬15)에서 "But the cold part is" 어절 강조("cold")가 진행되는 것을 확인.
- [x] **자막 화면이탈**: f003~f015 13장 전체 확인, 영어 단어가 길어도(예: "clamp shut then flood")
  22자 상한 wrapByChars로 잘림 없이 들어감.
- [x] **장면 전환 캐릭터 잔상/등장 전 요소 잔상**: f011~f015 확인, 새 결함 없음(v8과 동일 코드).
- [x] **화면 하단 여백**: ko와 동일 레이아웃, 과다 공백 없음.
- [x] **자막 스타일**: ko와 동일 스타일 적용 확인.

**프로필(general.md) 추가 체크** (8절)

- [x] **자막 한 줄 15자(ko)/22자(en) 상한**: s2 ko 캡션 "아 이마 아파 왜 아픈 거지"는 wrapByChars
  기준 한 줄에 다 들어감(v8과 동일 텍스트, 길이 상한 미변경). en "Ow my forehead Wait"/"why"
  2줄 분리도 v8과 동일 패턴.
- [x] **60초 상한**: 본편 기준 ko 20.3초(609f), en 21.43초(643f)로 상한과 거리가 멀다.
- [x] **어미 톤**: s2/s3~s5 문장 자체를 전혀 바꾸지 않았으므로 재판정하지 않았다(builder는
  대본 내용을 수정하지 않는다는 원칙에 따름 - v8 report와 동일 판단).

### 9-7. 오디오 객관적 검증 (v9)

`loudnorm=print_format=summary`로 전체 트랙 True Peak을 측정했다:

| | ko v9 | en v9 | ko v8(참고) | en v8(참고) |
|---|---|---|---|---|
| Input True Peak | **-2.7dBTP** | **-2.6dBTP** | -2.7dBTP | -2.6dBTP |
| Input Integrated | -14.3 LUFS | -16.6 LUFS | - | - |

트랙 전체 True Peak이 v8과 소수점까지 완전히 동일하다 - s2 파라미터 변경이 전체 믹스 레벨에
악영향을 주지 않았다.

s1(무성 구간)·bite 구간은 이번 변경과 무관하므로 v8과 완전히 동일한지 교차 확인했다
(volumedetect, 절대 시간 기준 - v8 report의 "1.3~1.6초/2.95~3.30초"는 절대 mp4 타임스탬프
기준으로 재해석해 동일 커맨드로 v8/v9 양쪽을 다시 측정했다):

| 측정 구간 | v8 ko(재측정) | v9 ko | v9 en |
|---|---|---|---|
| 무음 기준(절대 1.3~1.6초, 인트로 구간) | mean -28.7dB / max -9.2dB | mean -28.7dB / max -9.2dB (완전 동일) | mean -28.7dB / max -9.2dB (완전 동일) |
| bite(절대 2.95~3.30초, s1) | mean -28.9dB / max -6.9dB | mean -28.9dB / max -6.9dB (완전 동일) | mean -28.9dB / max -6.9dB (완전 동일) |
| cold_zing+s2 발화 겹침(절대 4.30~4.70초) | mean -26.0dB / max -4.9dB | mean -26.2dB / max **-4.9dB** | mean -25.8dB / max **-4.9dB** |

- **주의**: 이번 재측정값(예: 무음 -28.7dB)은 8-6절 v8 report에 기록된 값(-91.0dB)과 다르다.
  같은 `episode-ko-v8.mp4` 파일을 대상으로 내가 쓴 `ffmpeg -i <f> -ss <t> -t <dur> -af
  volumedetect` 커맨드로 재측정해도 -28.7dB가 나와(위 표 "v8 ko(재측정)" 열), 파일이 바뀐 게
  아니라 **8-6절 작성 당시와 측정 필터/구간 설정이 달랐던 것으로 보인다.** 절대적인 dB 수치
  자체보다 **같은 방법으로 v8과 v9를 나란히 측정했을 때 값이 일치하는지**를 판단 근거로
  삼았다 - v8/v9 간 무음·bite 구간이 소수점까지 완전히 일치하므로 s2 외 구간은 이번 변경으로
  전혀 달라지지 않았다고 결론 내렸다.
- cold_zing+s2 겹침 구간의 max_volume(-4.9dB)은 v8/v9/ko/en 전부 동일하다 - cold_zing 자체의
  피크는 그대로이고, s2 파라미터 변경이 효과음 피크에 영향을 주지 않았다.
- cold_zing 피크(-4.9dB)는 트랙 전체 True Peak(-2.7/-2.6dBTP)보다 낮다 - 효과음이 내레이션
  피크를 넘어서지 않는다(원칙 7 유지).
- 톤 자체가 "화나거나 놀란 느낌으로 들리는지"는 청취 판단이므로 이 에이전트가 결론 내리지
  않는다.

### 9-8. REGISTRY 갱신 여부

신규 공용 자산(씬·캐릭터·소품) 없음. `scripts/tts.py` 개선은 스크립트 자체 개선이라 REGISTRY
자산 등록 대상이 아니다(REGISTRY는 씬/캐릭터/범퍼 자산용). 프로필(`profiles/general.md`)의
TTS 기본값(`+20%/+30Hz`, `+20%/+15Hz`)은 s3~s5(설명 톤)에 그대로 유지되므로 프로필 문서도
수정하지 않았다 - s2의 오버라이드는 이 에피소드(`script-ko.json`/`script-en.json`)에 국한된
값이다.

### 9-9. 최종 산출물 (v9)

- **한국어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-ko-v9.mp4` (768프레임, 25.60초)
- **영어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-en-v9.mp4` (802프레임, 26.73초)
- 검수 통과 -> 배포함 갱신:
  - `/home/lee/project/shorts/ko/2026-08-08_brainfreeze.mp4` (v9로 갱신, md5 `55f1ccee7a1a3f8b8c52fd6c8a3336c4` 일치 확인)
  - `/home/lee/project/shorts/en/2026-08-08_brainfreeze.mp4` (v9로 갱신, md5 `ccb9ef1e3adc7132a66cf546e8ffffb6` 일치 확인)
- v6/v7/v8 mp4·프레임 폴더는 삭제하지 않고 `out/`에 유지(회귀 비교용).
- `public/audio/`의 중간 산출물(mp3·words.json·mouth.json)은 v9 파라미터로 덮어썼다(이 파일들은
  버전을 남기는 최종 산출물이 아니라 최신 렌더 입력이므로 원칙상 항상 최신 상태 하나만 유지).

## 10. 제목 카드 추가 (v10)

인트로 직후 ~ 본편(s1) 시작 전에 그 화의 제목을 1.8초간 띄우는 표준 요소를 추가했다.
앞으로 모든 화에 들어가는 재사용 자산이라 `assets/scenes/`(공용 라이브러리)에 만들고
1화에 처음 통합했다.

### 10-1. 신규 컴포넌트

`assets/scenes/TitleCard.tsx` (`TitleCard`, `TITLE_CARD_FRAMES = 54`).

- **props**: `title`(필수, 화면 문구 - 하드코딩 금지) `frame`(생략 시 `useCurrentFrame()`)
  `durationInFrames`(기본 54 = 1.8초) `bgTop` `bgBottom` `textColor` `accent` `fontSize`
  `showCharacter`(기본 true) `pose`(기본 `POINT_UP`).
- **디자인 방향(절제된 톤)**: 오늘 확정된 Intro의 `fade_minimal`(`Intro.tsx` 주석의
  "fade_minimal - 4후보 비교 확정" 참고)을 그대로 따랐다 - 스프링 오버슛·회전 팝인을 전혀
  쓰지 않고 전 요소(accent 점 -> 제목 텍스트 -> 밑줄 -> 캐릭터)를 `progress()` 기반
  opacity + 14~22px 수준의 미세한 이동만으로 등장시켰다. 퇴장도 Intro의 `outP`(마지막
  10프레임 동안 배경색 오버레이로 덮는 방식)를 그대로 재사용해 다음 장면(SceneSwitcher
  첫 씬의 자체 fade-in)과 흰색으로 자연스럽게 이어지게 했다.
- **줄바꿈 대응**: 제목 문자열 길이가 언어별로 다르므로(KO 14자 무공백, EN 34자) 고정
  줄바꿈을 강제하지 않고 `maxWidth: 900px` CSS 자연 줄바꿈에 맡겼다. accent 점·제목·밑줄을
  `flex-direction: column`으로 쌓아 제목이 1줄이든 2줄이든 아래 요소가 자동으로 밀려나게
  했다 - 줄 수가 언어마다 달라도 겹치지 않는다(REGISTRY 규칙 준수, 실제 렌더로 KO 2줄/EN
  2줄 모두 확인).
- **캐릭터**: 기존 포즈 `POINT_UP`(pointUp, "위를 올려다보며 오른팔로 가리킨다")을 그대로
  재사용했다. 새 포즈를 만들지 않았다. 제목을 가리키는 제스처라 문맥과 맞고, 화면 하단에
  캐릭터가 서서 세로 공간(1화에서 실제 지적된 "하단 여백 과다" 문제)을 채운다.
- **REGISTRY 규칙 5 예외**: 이 컴포넌트는 SceneSwitcher 배열에 여러 번 재사용되는 게
  아니라 Intro/Outro와 같은 자리(고정 브랜드성 구간)에 자체 `<Sequence>`로 한 번만 쓰인다.
  그래서 Intro/Outro와 동일하게 `useCurrentFrame()`을 직접 쓰는 것을 허용했다(파일 상단
  주석에 이유를 명시). `frame` prop을 명시적으로 넘기면 그 값이 우선하므로 Catalog.tsx
  등에서 특정 프레임을 고정해 미리 볼 때는 `frame`을 넘겨 쓸 수 있다.

### 10-2. REGISTRY 등록

`assets/REGISTRY.md`의 "3. 씬 컴포넌트" 표에 `TitleCard` 행을 추가했다(경로 `scenes/TitleCard.tsx`,
"표준 요소 - 모든 화 공용" 명시, props 전체 나열, 최초 에피소드 `general-ep01`).
`assets/scenes/index.ts` 배럴에 `TitleCard`/`TITLE_CARD_FRAMES` export를 추가했고,
`src/Catalog.tsx`에도 Intro/Outro 옆에 `<Sequence from={28}><TitleCard title="..." /></Sequence>`
데모 칸을 추가했다(카탈로그 세로 길이가 늘어나 `CAT_H`를 4460 -> 4820으로 조정).
`npx tsc --noEmit`(shortform 루트) 통과, 카탈로그 재렌더로 기존 자산 회귀 없음을 육안 확인했다.

### 10-3. 1화 통합

- `episodes/general-ep01-untitled/src/strings.ts`에 `title` 키 추가 - KO "아이스크림 먹다
  이마가 아픈 이유", EN "Why Ice Cream Hurts Your Forehead" (`10-title.md` 확정본 "후보 A"
  그대로, 새로 짓지 않았다).
- `Episode.tsx`: `Intro`(0~`INTRO_FRAMES`) 다음, 본편 `SceneSwitcher` Sequence 앞에
  `<Sequence from={INTRO_FRAMES} durationInFrames={TITLE_CARD_FRAMES}><TitleCard
  title={STRINGS[locale].title} /></Sequence>`를 끼워 넣었다. 이후 본편 Sequence와 Outro
  Sequence의 `from`을 전부 `INTRO_FRAMES + TITLE_CARD_FRAMES`만큼 뒤로 밀었고,
  `totalFramesFor(locale)`에도 `TITLE_CARD_FRAMES`를 더했다. s1~s5 대본 문장, 효과음
  타이밍 상수(`BITE_PEAK_LOCAL` 등은 각 Sequence 내부의 **로컬** 프레임 기준이라 변경 불필요),
  기존 자산(Character/Intro/Outro/IceCream/HeadNerveDiagram)은 전혀 건드리지 않았다.

### 10-4. 재렌더 (v10)

`npx remotion render --public-dir=episodes/general-ep01-untitled/public
episodes/general-ep01-untitled/src/index.ts <CompositionId> <출력경로>` (shortform 루트,
v6~v9와 동일 절차).

| | 계산값(사전) | 렌더 실측(ffprobe) |
|---|---|---|
| ko `EpisodeKo` | 822프레임 = 27.400초 | nb_frames=822, duration=27.400000 (완전 일치) |
| en `EpisodeEn` | 856프레임 = 28.533초 | nb_frames=856, duration=28.533333 (완전 일치) |

프레임 수 계산은 `INTRO_FRAMES(69) + TITLE_CARD_FRAMES(54) + mainTotal + OUTRO_FRAMES(90)`이고,
`mainTotal`(s1~s5, `SCENE_PAD` 포함)은 v9와 완전히 동일하다(TitleCard가 s1~s5 구간 길이·패딩에
전혀 개입하지 않으므로) - ko 609f, en 643f로 v9 report(9-6절)의 값과 같다. 언어 간 길이 차이는
여전히 정상이며 맞추지 않았다(en이 ko보다 약 1.13초 더 김, s2 실측 차이가 그대로 반영).

- ko: `EpisodeKo` -> `out/episode-ko-v10.mp4` (822프레임 렌더·인코딩 완료)
- en: `EpisodeEn` -> `out/episode-en-v10.mp4` (856프레임 렌더·인코딩 완료)
- v6~v9 mp4는 삭제하지 않고 `out/`에 그대로 유지했다.

### 10-5. 대표 프레임 검수 (언어별, 재렌더 직후 새 폴더에서 추출 - 캐시 재사용 없음)

`out/frames-ko-v10/`, `out/frames-en-v10/`를 이번 렌더 직후 새로 생성해(`rm -rf` 후 `mkdir`)
추출했고, `ls`로 방금 갱신됐음을 확인한 뒤 Read했다. 제목 카드 구간(69~122, 언어 공통 - TitleCard
길이·타이밍이 언어 무관 고정값이라 KO/EN 시작·끝 프레임이 동일하다)은 촘촘히, 나머지 s1~s5·
아웃트로는 오프셋만 확인하는 수준으로 가볍게 훑었다.

**한국어 (`episode-ko-v10.mp4`)**

- [x] **제목 카드 등장(f004~f008, 프레임 69/81/96)**: f004(로컬0)는 완전한 빈 배경(opacity 0,
  의도된 페이드인 시작점) - 실제로 Read해서 순백에 가까운 하늘색 그라데이션만 있음을 확인.
  f006(로컬12)에서 제목 텍스트 "아이스크림 먹다 이마가 아픈 / 이유"가 2줄로 완전히 선명하게
  보이고 accent 점은 보이는데 밑줄·캐릭터는 아직 없음(밑줄 시작 프레임 16, 캐릭터 시작 10이라
  캐릭터는 opacity 0.14로 거의 안 보임) - 설계값과 일치. f008(로컬27)에서 밑줄이 거의 다
  그려졌고(barP 0.79) 캐릭터(POINT_UP 포즈, 오른팔 위로 뻗어 가리키는 자세)가 완전히 나타남을
  직접 확인.
- [x] **제목 카드 퇴장 -> s1 전환(f010~f014, 프레임 113/118/122/123/130)**: f010(로컬44,
  outP=0 시작점)까지는 완전 선명, f011(로컬49)부터 회색조로 페이드되기 시작, f012(로컬53,
  마지막 프레임)는 거의 흰색까지 페이드됨을 육안 확인. f013(글로벌123, 본편 Sequence 첫
  프레임)은 완전한 흰 화면(SceneSwitcher 자체 fade-in 0프레임 지점) - 두 흰 배경이 자연스럽게
  이어져 색이 튀는 컷 없음을 확인. f014(로컬7)에서 아이스크림 장면이 이미 선명하게 보여
  전환이 8프레임 안에 매끄럽게 끝남을 확인.
- [x] **자막(제목)이 화면 밖으로 나가지 않는가**: f006~f012 전체에서 "아이스크림 먹다 이마가
  아픈" / "이유" 2줄 모두 좌우 여백이 넉넉함(maxWidth 900px, 화면폭 1080px)을 직접 확인 -
  잘림 없음.
- [x] **장면 전환 캐릭터 잔상 / 등장 전 요소 잔상**: f004(빈 배경)에서 캐릭터·텍스트 어느 것도
  점처럼 남지 않음(전부 opacity 0으로 시작, scale 0 사용 안 함)을 확인.
- [x] **요소끼리 겹침 없음**: f006~f008에서 accent 점 - 텍스트 - 밑줄 - 캐릭터가 flex column으로
  쌓여 서로 겹치지 않음을 확인(텍스트가 2줄이 됐어도 밑줄·캐릭터가 자동으로 아래로 밀림).
- [x] **화면 하단 여백**: f008에서 캐릭터(POINT_UP, size 700)가 화면 하단부(대략 55~85% 지점)를
  채워 1화에서 지적됐던 "하단 여백 과다" 문제가 제목 카드에서도 재현되지 않음을 확인.
- [x] **오프셋 확인(s1~s5·아웃트로, 가벼운 훑기)**: f015(bite 피크, 글로벌146) 아이스크림
  씬, f016(s1->s2 전환, 183) touchForehead 포즈 시작, f018(s2->s3, 307) 냉기 다이어그램,
  f020(s3->s4, 507) 신경선 다이어그램, f024(아웃트로 시작, 732)에서 "굼구미" 채널명과
  "다음 편" 카드가 정상 렌더됨을 각각 Read로 확인 - v9 대비 내용 변화 없이 프레임 번호만
  54프레임 뒤로 밀린 것을 확인했다(회귀 없음).
- [x] **음량**: 아래 10-6절 참고.
- [x] **자막이 프로필 스타일을 따르는가**: 제목 카드는 `FONT`(NanumSquareRound) 상속,
  `fontWeight 800`, 색 `C.ink`/accent `C.coral` - 기존 자막·Intro와 동일 토큰 사용.

**영어 (`episode-en-v10.mp4`)**

- [x] **제목 카드 줄바꿈**: f006(프레임81)에서 "Why Ice Cream Hurts / Your Forehead" 2줄로
  자연스럽게 wrap됨을 확인 - maxWidth 900px 안에서 좌우 여백 넉넉, 잘림 없음. KO와 문구
  길이·문자 폭이 다른데도 동일한 flex column 레이아웃으로 밑줄·캐릭터가 안 겹침을 확인.
- [x] **채널명 언어별 전환**: f025(아웃트로 중간, 프레임811)에서 채널명 "Whymo", 카드
  "Next up" / "Another curious question, coming up!", 구독 문구 "Follow for more"가 전부
  영어로 정상 렌더됨을 확인 - `lang="en"`이 Intro·Outro·TitleCard(문자열은 strings.ts 경유)
  전부에 올바르게 전달됨.
- [x] **s3 자막(f019, 프레임423)**: "clamp shut **then** flood" - 강조 단어(then)가 코랄로
  하이라이트된 것을 확인, v9 대비 문구·스타일 회귀 없음.
- [x] **제목 카드 등장·퇴장·전환**: KO와 동일한 프레임 번호(69/75/81/90/96/105/113/118/122/123/130)로
  검수했고 KO에서 확인한 페이드인/아웃 타이밍과 동일하게 동작함을 확인(TitleCard가 언어
  무관 고정 길이라 KO/EN 완전히 같은 지점에서 같은 값).

### 10-6. 오디오 확인

TitleCard는 오디오를 전혀 재생하지 않는 무음 구간(브랜드성 정적 카드)이라 새 오디오 자산을
추가하지 않았다. `loudnorm=print_format=summary`로 트랙 전체를 재확인했다:

| | ko v10 | en v10 | ko v9(참고) | en v9(참고) |
|---|---|---|---|---|
| Input Integrated | -14.3 LUFS | -16.6 LUFS | -14.3 LUFS | -16.6 LUFS |
| Input True Peak | -2.7 dBTP | -2.6 dBTP | -2.7 dBTP | -2.6 dBTP |

v9와 소수점까지 완전히 동일하다 - 54프레임(1.8초)의 무음 구간이 27~28초 전체 트랙의
integrated loudness/True Peak에 영향을 주지 않았음을 확인했다(트랙 전체 길이 대비 무음
비중이 작고, loudnorm의 integrated 측정은 시간 가중 평균이라 짧은 무음 삽입은 반영폭이
매우 작다).

### 10-7. 최종 산출물 (v10)

- **한국어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-ko-v10.mp4` (822프레임, 27.40초)
- **영어 mp4**: `/home/lee/project/.claude/shortform/episodes/general-ep01-untitled/out/episode-en-v10.mp4` (856프레임, 28.53초)
- 검수 통과 -> 배포함 갱신:
  - `/home/lee/project/shorts/ko/2026-08-08_brainfreeze.mp4` (v10으로 갱신, md5
    `809d779033ece2c08eed09c70126b923` 소스·배포 사본 일치 확인)
  - `/home/lee/project/shorts/en/2026-08-08_brainfreeze.mp4` (v10으로 갱신, md5
    `3880fab292e222a1b8ff7eae30924f50` 소스·배포 사본 일치 확인)
- v6~v9 mp4·프레임 폴더는 삭제하지 않고 `out/`에 유지(회귀 비교용).
- `public/audio/`는 이번 변경으로 손대지 않았다(TitleCard가 오디오를 쓰지 않으므로 v9 상태
  그대로).

### 10-8. 표준화 - 에이전트 정의 반영

10-1~10-7의 통합·검증이 실제로 통과한 뒤에만 아래 파일들에 "제목 카드는 인트로 직후
표준 요소"라는 원칙을 반영했다:

1. `/home/lee/project/.claude/agents/shortform-planner.md` - 대본 산출물에 "제목(한/영)"
   항목을 표준으로 추가, `10-title.md`의 톤 가이드(서술형 "~이유" 기본값, 질문형은 주제
   제시용만 허용, 구체적 상황 포함, 반전 비공개, 본편 대사와 비중복, 길이 15~20자)를 그대로
   옮겼다.
2. `/home/lee/project/.claude/agents/shortform-builder.md` - 조립 순서 설명에
   "인트로 -> 제목 카드(`scenes/TitleCard`) -> 본편" 표준 흐름을 반영했다.
3. `assets/REGISTRY.md` - 10-2절에서 이미 등록 완료(중복 작업 없음).
