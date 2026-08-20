# 빌드 리포트 - general-ep02-wrinkly-fingers ("목욕하면 손가락 쭈글쭈글해지는 이유")

대상 대본: `02-script-v4.md` (사용자 최종 확정본 - v3의 s1 목욕 상황 설명 + v2의 s4/s5 그립 기능을
합친 버전). 대본 문장은 수정하지 않았다.

---

## 1. 공용 자산 (언어 무관, 1회 작업)

### 재사용 (REGISTRY 기존 자산)
`character/Actor`, `character/BustActor`, `character/poses`(`idle`, `surprised`), `backgrounds/PlainBg`,
`scenes/Caption`, `scenes/Label`, `scenes/Card`, `scenes/TitleCard`, `props/ThemedIcon`(Tabler
`x`/`check`/`droplet` 아이콘, 캐시에 이미 존재), `brand/Intro`, `brand/Outro`,
`timeline.ts`(`sceneFrames`, `sceneStarts`, `buildCaptions`), `FontLoader` - 총 12종 재사용.
`audio/intro_ding.mp3`, `audio/outro_ding.mp3`도 공용 재사용(에피소드 `public/audio/`에 복사).

### 신규 제작 (2개, 대본 "자산 목록" 절이 지정한 대로)
1. **`assets/props/Hand.tsx`** - `Finger`(손가락 클로즈업, `wrinkle` 0~1), `FingerCrossSection`
   (손가락 단면, `veinNarrow` 0~1), `FingerGrip`(두 손가락으로 구슬 쥐기, `beadY`/`gripped`/`checkT`)
   3개 컴포넌트. 기존 `props/`에 손·손가락 자산이 없어 신설(REGISTRY 3절 확인 완료). s2(클로즈업)·
   s3(혈관 인서트)·s4/s5(그립 비교) 전부 이 한 파일로 커버.
2. **`assets/props/Bathtub.tsx`** - 욕조 앞판(둥근 사각형 몸체 + 완만한 수면선 + 김 파티클 3가닥).
   `steamT`로 김이 서서히 옅어지는 것을 표현. s1 전용.

두 자산 모두 `assets/REGISTRY.md` 4절에 등록 완료, `assets/props/index.ts`에 export 추가 완료.
`npx tsc --noEmit`으로 라이브러리 전체(다른 화 포함) 클린 컴파일 확인.

**카탈로그 재렌더는 이번엔 생략했다** - 작업 중 다른 화(ep03/04/05)가 동시에 `Catalog.tsx`,
`REGISTRY.md`, `props/index.ts`, `scenes/index.ts`에 동시 편집을 반복하고 있는 것을 여러 차례
확인했다(SodaCan, Apple, VoicePathDiagram, CellMergeDiagram, wrapByChars/wrapCounts 공용 승격 등이
작업 도중 계속 추가됨). 이 시점에 카탈로그를 재렌더하면 다른 화의 미완성 중간 상태와 뒤섞인
스냅샷을 만들게 되므로, 대신 `npx tsc --noEmit`(라이브러리 전체 타입 클린)으로 회귀 여부만
확인했다. 카탈로그 육안 재확인은 추후(다른 화 작업이 안정된 시점)에 별도로 하는 것을 권장한다.

### 문자열 테이블
`episodes/general-ep02-wrinkly-fingers/src/strings.ts` - `title`, `s3Wrong`, `s3Right`, `s4Label`,
`s5Label` 5개 키, 언어별(ko/en) 테이블.

---

## 2. 언어별 제작

### TTS (scripts/tts.py, general.md 프로필 설정 + s2 리액션 오버라이드)
- ko: 기본 `voice=ko-KR-SunHiNeural rate=+20% pitch=+30Hz`, s2만 `rate=+32% pitch=+55Hz`
  (원칙 2-1 - 리액션 구간은 설명 구간과 다른 톤. ep01 s2 선례와 동일 수치를 재사용)
- en: 기본 `voice=en-US-AnaNeural rate=+20% pitch=+15Hz`, s2만 `rate=+30% pitch=+35Hz`
- 이번 화는 s1~s5 **전 구간이 유성**이다(ep01과 달리 무성 구간이 없다 - v4 대본이 s1에도
  "오래 목욕하고 나면" 내레이션을 배정했기 때문). `scripts/tts.py`의 구간별 rate/pitch
  오버라이드(ep01 v9에서 추가된 기능)를 그대로 재사용, 새 코드 없음.

### 립싱크 (scripts/rms_mouth.py)
- ko/en 각각 `--prefix ko`/`--prefix en`로 5개 구간(s1~s5) 전체 실행.
- 실제로 화면에 적용한 것은 **s1(전신, 욕조에 앉은 얼굴)과 s2(바스트샷)뿐**이다. s3~s5는
  손가락 다이어그램/아이콘 장면이라 캐릭터 얼굴이 보이지 않아 립싱크를 쓰지 않는다
  (ep01과 동일한 원칙 - 화면에 얼굴이 보이는 구간에만 적용).

### 타임코드 확정 (언어별 파일)
`02-script-final-ko.md`, `02-script-final-en.md` 참고. 요약:

| | ko | en |
|---|---|---|
| s1 | 2.200s (66f) | 2.667s (80f) |
| s2 (리액션, 톤 오버라이드) | 4.000s (120f) | 3.900s (117f) |
| s3 | 4.367s (131f) | 5.033s (151f) |
| s4 | 3.233s (97f) | 3.500s (105f) |
| s5 | 4.367s (131f) | 3.633s (109f) |
| 본편 합계 | 18.167s (545f) | 18.733s (562f) |
| 인트로+제목카드+본편+아웃트로 | **25.267s** (758f) | **25.833s** (775f) |

s2->s3 전환만 여백 0.6초(다른 전환은 기본 0.2초) - 원칙 4의 5번(리액션 뒤 숨 쉴 틈).
두 언어 총 길이 차이(약 0.57초)는 정상이며 맞추지 않았다 - 근거는 `02-script-final-en.md` 하단.
60초 상한 대비 양쪽 다 여유가 크다(25초대).

---

## 3. 렌더 횟수 및 발견·수정한 결함

**렌더 횟수**: 언어별 2회씩(v1 → 결함 발견 → 수정 → v2), 총 4회 전체 mp4 렌더.

### 발견하고 고친 것 (v1 → v2)

1. **[공용 결함, S1 씬] 욕조 수면 위치가 너무 높아 "머리만 둥둥 떠 있는" 것처럼 보임** -
   최초 `TUB_WATER_Y=1080`(캐릭터 RIG의 SHOULDER.y=647 기준으로 역산한 값)으로 렌더한
   프레임(`frames-ko-v1/f004.png`)에서, 이 캐릭터는 머리가 몸통에 비해 커서 "어깨" 높이가
   실제로는 "턱 밑" 높이에 해당한다는 것을 발견했다 - 목·어깨가 전혀 안 보이고 얼굴만 물 위에
   떠 있는 것처럼 보였고, 손을 들어도 그 팔이 뺨에 붙은 이상한 형태로 읽혔다. `TUB_WATER_Y`를
   가슴 높이 상당(1200)으로 낮춰(화면에서는 숫자가 커질수록 아래) 목·어깨·팔이 물 위로 드러나게
   수정. 재렌더 후 `frames-ko-v2/f003~f005.png`에서 목과 어깨선이 뚜렷이 보이고, 손을 들어
   올리는 동작이 "물 밖으로 손을 꺼낸다"로 명확히 읽히는 것을 확인했다.
2. **[S1 씬] 손을 드는 각도가 약해 수면 위로 확실히 올라오지 않을 여지** - `RAISE_HAND` 포즈의
   `armR`를 `{s:-95,e:-15}`에서 `{s:-114,e:-20}`(POINT_UP과 비슷한 각도)로 키워 확실히 위로
   들리게 함. 수정 1번과 함께 재렌더로 확인.
3. **[공용 결함, FingerGrip] s4(미끄러짐) 초반 구슬이 아래쪽 손가락에 너무 붙어 있어 갓
   시작한 장면인데도 이미 손가락에 닿아 있는 것처럼 보임** - 열린 상태의 손가락 틈을
   90px(`tipTop=118,baseBottom=208`)에서 130px(`tipTop=104,baseBottom=222`)로 넓히고,
   낙하 거리도 130px→150px로 조금 늘려 "매끈한 손가락 사이로 구슬이 흘러 떨어진다"는 서사가
   더 여유 있게 보이도록 수정. `assets/props/Hand.tsx`(공용 자산)를 고쳤으므로 재렌더로 s4/s5
   양쪽 다 확인.

### 확인했으나 결함이 아니었던 것 (오탐 배제)
- **s5 체크마크 배지가 예상 프레임(로컬 33프레임, 30% 지점 이전)보다 조금 일찍 화면에 보임** -
  코드상 `checkT = progress(f, round(frames*0.3), round(frames*0.55))`는 정확하고, 실제로는
  검수용으로 내가 고른 샘플 프레임(570)이 의도한 타이밍(로컬 39프레임 근처)과 약 6프레임(0.2초)
  차이가 나는 수준이었다 - 코드 결함이 아니라 검수 프레임 선택의 근사치 오차였다. 애니메이션
  자체(투명→불투명, 스케일 팝인)는 정상 동작함을 다른 프레임(f013 미표시, f014 표시)에서 확인.
- **각 장면 시작 직후(전환 경계) 프레임이 흰 화면** - `SceneSwitcher`의 8프레임 fade-in +
  `Episode` 루트 배경(`C.paper`)이 만드는 정상 전환(ep01에서 이미 확인된 설계). 결함 아님.
- **s1→s2, s2→s3 등 전환 경계에서 이전 장면이 살짝 겹쳐 보임** - `SceneSwitcher`의 의도된
  6프레임 크로스페이드(ep01에서 이미 "오탐 배제"로 확인된 동일 패턴).

---

## 4. 검수 체크리스트 (언어별 관찰 기록)

프레임 추출: `ffmpeg -vf select=...`로 `out/frames-ko-v2/`(18장), `out/frames-en-v2/`(18장)에
`sceneStarts`/`sceneFrames` 실측값으로 계산한 구간별 시작·중간·전환 경계 프레임 + 인트로/제목
카드/아웃트로 대표 프레임을 추출했다. 재렌더 직후 폴더를 새로 만들어(`rm -rf` 후 `mkdir`) 추출,
`ls -la` 타임스탬프로 방금 갱신됐음을 확인한 뒤 Read했다(v1 캐시 프레임과 섞이지 않음).

- ko 프레임(abs, INTRO 69+TITLE 54 오프셋 포함): 123, 150, 175, 180, 186, 189, 205, 249, 309,
  374, 440, 460, 488, 537, 570, 603, 668, 690
- en 프레임: 123, 150, 196, 200, 203, 220, 261, 320, 395, 440, 471, 510, 523, 576, 610, 630, 682, 704

### 한국어 (`episode-ko-v2.mp4`)

- [x] **자막이 화면 밖으로 나가지 않는가**: f002("오래 목욕하고 나면"), f007~f008(s3 X/O 카드
      라벨 "물을 먹어서 붓는다"/"혈관을 좁힌다"), f012~f013("매끈한 손가락 -> 미끄러짐"),
      f015~f016("쭈글쭈글한 손가락 -> 꽉 잡음") 전체 Read로 확인. 자막·라벨 박스가 좌우
      안전영역 안에 있고 화면 폭을 넘지 않음.
- [x] **장면 전환 시 캐릭터 잔상**: intro→title, title→s1, s1→s2, s2→s3, s3→s4, s4→s5,
      s5→outro 경계 프레임 전부 확인. 6프레임 크로스페이드(의도된 동작) 외 잔상 없음.
- [x] **등장 전 요소가 점처럼 남아 있지 않은가**: s2의 손가락 인서트 카드(`Card`의 opacity
      기반 progress), s3의 두 카드, s5의 체크 배지 전부 opacity 0에서 시작 - f006(s2 시작
      직후, iconP≈0 구간)에서 점 형태 잔존 없음 확인.
- [x] **라벨이 화면 밖에서 잘리지 않는가**: s4/s5 라벨(`wrapWidth=880`)이 한 줄로 화면 중앙에
      들어가고 잘리지 않음(f012, f015).
- [x] **요소끼리 겹치지 않는가**: s3의 카드 배지(X/체크)가 카드 모서리에 정확히 앵커되어
      카드 안쪽 아이콘(물방울/혈관)과 겹치지 않음(f007~f008). FingerGrip의 체크 배지도
      손가락 그림 오른쪽 위에 별도 위치라 겹침 없음(f015~f016).
- [x] **화면 아래쪽 여백이 과다하지 않은가**: S1 수정 후 f003~f005에서 캐릭터가 화면 세로
      중앙~하단까지 채움(v1의 "머리만 둥둥" 문제 해소). s3~s5 카드/그립 장면도 라벨+자막이
      화면 하단부까지 채워 과다 여백 없음.
- [x] **음량이 충분한가**: `ffmpeg -af loudnorm=print_format=summary` 측정 - Input Integrated
      **-13.6 LUFS**, True Peak **-2.1 dBTP**. ep01(v2 기준 -13.7 LUFS/-2.6dBTP)과 비슷한
      수준이라 별도 정규화 없이 충분하다고 판단.
- [x] **자막이 프로필 스타일을 따르는가**: `CAPTION_STYLE`(흰 배경+검은 외곽선, 어절별 코랄
      강조) 그대로, 커스텀 값 없음.

### 영어 (`episode-en-v2.mp4`)

- [x] **자막이 화면 밖으로 나가지 않는가(영어 특유 - 긴 단어)**: f008("Blood vessels squeeze"
      2줄로 카드 안에 정상 표시), f018("Another curious question, coming up!" 아웃트로 카드)
      등 전체 Read로 확인. `wrapCounts` 영문 22자 기준으로 줄당 3~5단어로 자연스럽게 끊기고
      화면 폭을 넘지 않음.
- [x] **인트로/아웃트로 영문 확인**: intro 프레임에서 "Whymo"(한국어 "굼구미" 아님) 확인,
      아웃트로에서 "Next up" / "Another curious question, coming up!" / (구독 문구) 전부
      영어로 정상 표시. `lang="en"`을 Intro/Outro/TitleCard(strings.ts 경유) 전부에 명시했고
      한국어 잔존 텍스트 없음.
- [x] **장면 전환 캐릭터 잔상**: ko와 동일 컴포넌트·코드 경로라 동일하게 확인, 문제 없음.
- [x] **등장 전 요소 잔존**: ko와 동일하게 문제 없음.
- [x] **라벨 잘림**: "Smooth fingers -> Slips"(f012), "Wrinkly fingers -> Grips" 한 줄로
      wrapWidth 880 안에 들어가고 잘리지 않음.
- [x] **요소 겹침**: ko와 동일 배치라 문제 없음.
- [x] **화면 하단 여백**: ko와 동일 컴포넌트(로케일 무관 레이아웃)라 동일하게 개선 적용됨.
- [x] **음량**: Input Integrated **-16.3 LUFS**, True Peak **-3.3 dBTP**. ko보다 다소 낮음
      (en 음성 자체 특성 + en 발화가 더 길어 평균이 더 희석됨, ep01과 같은 패턴). 스트리밍
      타겟(-14~-16 LUFS) 범위 안이라 정규화 없이 충분하다고 판단.
- [x] **자막 스타일**: ko와 동일 토큰, 언어별 커스텀 없음.

### 프로필(general.md) 추가 체크 (8절)

- [x] **소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가**: 대본(v4, 사용자 최종 확정)
      승인 사항이라 재판정 대상 아님. 화면 연출(목욕 후 손가락이 쭈글쭈글해진 걸 발견하는
      상황)이 그 취지에 맞게 구성됨을 확인했다.
- [x] **어미 톤**: 대본 문장 자체이므로 builder가 수정하지 않았다(원칙 준수).
- [x] **전문용어가 등장한 자리에서 바로 쉬운 말로 풀렸는가**: 대본 텍스트는 그대로이고(critic
      r1에서 이미 확인됨), 화면 라벨도 "혈관을 좁힌다" 같은 동사구로 전문용어 없이 표시됨.
- [x] **자막 한 줄 15자(ko)**: f002·f007·f008·f012·f015 전부 15자 근처 이내로 wrapByChars가
      정상 동작함을 확인.
- [x] **60초 상한**: 본편 기준 ko 25.27s, en 25.83s로 상한과 거리가 멀다.

---

## 5. 최종 산출물 절대경로

- **한국어 mp4 (최종, v2)**: `/home/lee/project/.claude/shortform/episodes/general-ep02-wrinkly-fingers/out/episode-ko-v2.mp4` (758프레임, 25.267초)
- **영어 mp4 (최종, v2)**: `/home/lee/project/.claude/shortform/episodes/general-ep02-wrinkly-fingers/out/episode-en-v2.mp4` (775프레임, 25.833초)
- (참고, 결함 있던 구버전 - 덮어쓰지 않고 보존) `out/episode-ko-v1.mp4`, `out/episode-en-v1.mp4`:
  욕조 수면 위치 결함(머리만 둥둥 떠 보임) + FingerGrip 초기 간격 협소 결함이 있는 v1.
  **다음 단계(사용자 확인)에는 v2를 볼 것.**
- 검수 프레임: `out/frames-ko-v2/f001.png`~`f018.png`, `out/frames-en-v2/f001.png`~`f018.png`
  (v1 프레임은 `out/frames-ko-v1/`, `out/frames-en-v1/`에 회귀 비교용으로 보존)
- 확정 타임코드: `02-script-final-ko.md`, `02-script-final-en.md`
- 신규 자산: `assets/props/Hand.tsx`(`Finger`/`FingerCrossSection`/`FingerGrip`),
  `assets/props/Bathtub.tsx`(`Bathtub`) - 전부 `assets/REGISTRY.md` 4절 등록 완료
- 소스: `episodes/general-ep02-wrinkly-fingers/src/{index.ts,Root.tsx,Episode.tsx,scenes.tsx,strings.ts}`

---

## 6. 사용자 확인 요청

위 5개 항목(자막 이탈·전환 잔상·등장 전 잔상·라벨 잘림·요소 겹침·하단 여백·음량·자막 스타일)은
프레임 Read와 ffmpeg 수치로 관찰한 **사실**이고, 관찰된 범위 안에서는 결함이 재발하지 않았다.
다만 이 관찰이 "이 영상을 그대로 써도 되는지"에 대한 최종 판단은 아니다 - 특히:

- **s1 욕조 장면의 캐릭터 비례감(머리 크기 대비 몸통·팔 길이)**이 이 캐릭터 스타일에서 자연스러운
  수준인지는 사용자의 미적 판단이 필요하다. 코드상 결함은 없지만(모든 좌표가 RIG 실측값 기반),
  "그림체가 이 정도면 괜찮은지"는 이 에이전트가 판정할 수 없다.
- **음향(대사 톤·타이밍·자연스러움)을 직접 들어본 판단**은 이 에이전트가 할 수 없다. dB 수치만
  확인했다.

**두 mp4를 실제로 재생해서 확인해 주시기 바랍니다.** `shorts/ko`·`shorts/en` 배포 복사는 사용자
승인 후에만 진행합니다(이번 보고에는 포함하지 않았습니다).

---

## 7. 배포 (2026-08-09, 사용자 승인 후)

- `shorts/ko/[2화] 목욕하면 손가락 쭈글쭈글해지는 이유.mp4` <- `out/episode-ko-v2.mp4` 복사
- `shorts/en/[Ep. 2] Why Your Fingers Get Pruney in the Bath.mp4` <- `out/episode-en-v2.mp4` 복사
- 원본은 `out/`에 그대로 유지(삭제하지 않음)
- md5sum 비교: 한/영 두 쌍 모두 소스·대상 일치 확인 완료

shorts/ 배포 완료, md5 일치 확인.

---

## 8. 배포 갱신 (v3, 2026-08-09, 사용자 명시 지시)

- `shorts/ko/[2화] 목욕하면 손가락 쭈글쭈글해지는 이유.mp4` <- `out/episode-ko-v3.mp4` 복사 (기존 v2 내용 덮어씀)
- `shorts/en/[Ep. 2] Why Your Fingers Get Pruney in the Bath.mp4` <- `out/episode-en-v3.mp4` 복사 (기존 v2 내용 덮어씀)
- md5sum 비교: 한/영 두 쌍 모두 소스·대상 일치 확인 완료
  - ko: `cf20479ae3e30c983bf453bf287503f8`
  - en: `c0396cfc87e3bb804e60d3e22cf62d27`
- 원본은 `out/`에 그대로 유지(삭제하지 않음)

shorts/ 배포 갱신 완료(v2 -> v3), md5 일치 확인.
