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
