# 빌드 리포트 - general-ep04-apple-browning

대본 소스: `02-script-v3.md`("산소" 단어 복원 최신본, 최종본으로 지정됨)

## 1. 자산 (공용, 언어 무관 - 1회만 수행)

### REGISTRY 대조 결과

대본의 "자산 목록" 절을 그대로 따랐다. `assets/REGISTRY.md`를 먼저 읽고 대조했다.

**재사용(6개)**: `character/Actor.tsx`(BustActor, `surprised`/`idle` 포즈), `scenes/Caption.tsx`(Caption),
`backgrounds/PlainBg.tsx`, `scenes/Effects.tsx`(Sparkles), `scenes/TitleCard.tsx`, `scenes/SceneSwitcher.tsx` -
전부 기존 그대로 사용, 파라미터만 이 화에 맞게 넘김.

**신규 제작(2개, 대본이 지정한 그대로)**:
- `assets/props/Apple.tsx` - 사과(류 과일) 소품. `cut`(통과일/단면), `browning`(0~1, 하양→갈색 오버레이)
  두 축으로 이 화의 모든 사과 비주얼(S1 통사과, S1 단면, S2~S6 단면)을 커버. `skinColor`/`fleshColor`만
  바꾸면 바나나 등 다른 "잘라두면 산화 변색" 소재에도 재사용 가능하도록 범용 구조로 짬.
- `assets/scenes/CellMergeDiagram.tsx` - "분리된 두 요소가 벽이 갈라지며 만나 반응한다" 구조를 보여주는
  범용 다이어그램. `wallProgress`/`mergeProgress`/`catalystProgress`/`reactProgress` 4개의 독립 0~1
  progress prop으로 단계를 노출해 화학·생물 소재 전반에 재사용 가능하게 설계.

**신규 제작(효과음 1개)**: `assets/audio/chop.mp3` - 칼이 도마 위 사물을 내려찍는 "탁" 소리
(저음 감쇠파 + 고역 노이즈 트랜지언트, ffmpeg lavfi 합성). S1의 무성 구간(칼질 동작)에 원칙 7에 따라
추가했다. 기존 `bite.mp3`(크런치)는 대본이 이미 "이 화의 자르는 동작과 결이 달라 재사용 비권장"이라고
명시해뒀어서 새로 만들었다.

**신규 토큰**: `theme.ts`에 `C.browning`(#A9743C)/`C.browningSoft`(#E8C9A0) 색 토큰 추가(기존 토큰은
건드리지 않음, 순수 추가). 산화·갈변 계열 전용 오버레이 색.

**공용 유틸 승격**: `wrapByChars`/`wrapCounts`(자막 줄바꿈 헬퍼)를 general-ep01의 에피소드 로컬 함수에서
`assets/timeline.ts`로 승격했다 - 이 화에서 똑같은 로직이 다시 필요해져 원칙 0("두 번째로 필요해지면
라이브러리로")에 따라 공용화. 기존 동작·시그니처는 그대로 유지.

전부 `assets/REGISTRY.md`(1·3·4·7절)와 `props/index.ts`·`scenes/index.ts`에 등록 완료.
`npx tsc --noEmit` 통과 확인.

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz)

| 구간 | 길이(초) | 프레임(+0.2s pad) |
|---|---|---|
| s1(무성) | 2.000 | 60 |
| s2 | 2.088 | 69 |
| s3 | 5.784 | 180 |
| s4 | 4.632 | 145 |
| s5 | 5.352 | 167 |
| s6 | 5.304 | 165 |
| **본편 합계** | | **786프레임 = 26.200초** |
| **mp4 전체**(인트로69+제목카드54+본편786+아웃트로90) | | **999프레임 = 33.3초(ffprobe 실측 33.344초)** |

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz)

| 구간 | 길이(초) | 프레임(+0.2s pad) |
|---|---|---|
| s1(무성) | 2.000 | 60 |
| s2 | 2.088 | 69 |
| s3 | 6.120 | 190 |
| s4 | 4.944 | 154 |
| s5 | 5.784 | 180 |
| s6 | 4.944 | 154 |
| **본편 합계** | | **807프레임 = 26.900초** |
| **mp4 전체** | | **1020프레임 = 34.0초(ffprobe 실측 34.048초)** |

**언어 간 차이**: EN이 KO보다 21프레임(0.704초) 더 길다. s3·s5 영어 문장("the browning enzyme and
the stuff it reacts with actually start out separated", "the tartness gets in the way of that
reaction")이 한국어 원문보다 어절 수가 많아서다. s1·s2·s4·s6은 두 언어가 거의 동일 길이. 어느 쪽도
늘리거나 줄이지 않았다 - 실측 그대로다. 60초 상한 대비 양쪽 다 크게 여유 있다.

## 3. 렌더 (언어별 각 2회 - v1 초안 → 검수 결함 발견 → 수정 → v2 최종)

```
npx remotion render --public-dir=episodes/general-ep04-apple-browning/public \
  episodes/general-ep04-apple-browning/src/index.ts EpisodeKo out/episode-ko-vN.mp4
npx remotion render --public-dir=episodes/general-ep04-apple-browning/public \
  episodes/general-ep04-apple-browning/src/index.ts EpisodeEn out/episode-en-vN.mp4
```
shortform 루트(`package.json`/`remotion.config.ts` 위치)에서 실행.

- v1: ko 999프레임, en 1020프레임 - 렌더 자체는 성공했으나 아래 4절의 결함 4건을 검수에서 발견
- v2: 동일 프레임 수(타이밍 변경 없음, 시각적 수정만) - 4건 모두 수정 확인

## 4. 검수에서 발견하고 수정한 결함 (v1 → v2)

전부 **실제로 관찰한 사실**을 근거로 판정했다(추측 아님). ffmpeg로 재렌더 직후 새 폴더
(`out/frames-ko-v2/`, `out/frames-en-v2/`)에 프레임을 뽑아 타임스탬프가 방금 갱신됐음을
`ls -la`로 확인한 뒤 Read했다.

1. **기본 바닥선/바닥면이 사과 단면·다이어그램 한가운데를 가로지름** - `PlainBg`의 기본 `ground`
   (GROUND=1250)가 이 화의 모든 장면(사과가 공중에 떠 있는 구도)에 불필요하게 적용되고 있었다.
   f005(KO, s1 cut-reveal 프레임146) 픽셀 샘플링(`(540,1245)=(223,228,233)`, `(540,1250)=(223,233,242)`
   - 배경 paper `(255,255,255)`와 다른 회색 라인)으로 확인. `scenes.tsx`의 모든 `<PlainBg>` 호출에
   `ground={null}`을 명시해 해결. 재렌더 후 동일 지점이 `(255,255,255)`로 확인됨(수정 확인).
2. **영어 CellMergeDiagram 라벨 겹침** - "Browning enzyme"/"Color compound"가 칸 중앙 분리선을
   넘어 서로 겹쳐 보였다(f011 EN v1 육안 확인, 두 텍스트가 divider 위에서 맞물림). 라벨 폰트를
   40→30으로 줄이고, 8자를 넘는 라벨에 `textLength`(SVG 속성)로 칸 폭(260) 안에 강제로 눌러 담는
   로직을 추가(`CellMergeDiagram.tsx`). 재렌더 후 f011 EN v2에서 두 라벨이 분리선 양쪽에 여유
   있게 들어감을 육안 확인.
3. **레몬즙 라벨이 세리프 폰트로 렌더링** - S5Compare의 "Lemon juice"/"레몬즙" 라벨 div에
   `fontFamily`가 누락되어 브라우저 기본 세리프 폰트(Georgia류)로 렌더링되고 있었다(f017 EN v1에서
   "Lemon juice"가 다른 화면 텍스트와 다른 서체로 보임을 육안 확인 - 한국어는 CJK 기본 폰트가 우연히
   비슷해 보여 v1 검수 1차 통과에서는 놓쳤던 결함). `fontFamily: FONT` 추가 후 f017 EN v2에서
   NanumSquareRound로 정상 렌더링 확인.
4. **반응색 번짐 원이 라벨·다이어그램 전체를 삼킴** - S4 종료 시점(reactProgress=1)에서 반경이
   150(내부 좌표계)까지 커져 두 원·라벨 대부분을 가려 "무엇이 반응했는지" 안 읽혔다(f015 KO/EN v1
   육안 확인, 라벨이 원 가장자리에 간신히 걸쳐 보임). 반경 상한을 150→105로 축소. 재렌더 후 f015
   EN v2에서 두 원(코랄/골드)과 양쪽 라벨이 모두 원 밖에서 온전히 읽힘을 확인.

추가로 S1의 컷 단면 프레임을 상단 여백이 과했던 위치(top:620)에서 위로 살짝 당겼다(top:520) -
결함이라기보다 세로 프레이밍 개선.

`remotion still --frame=470`과 렌더된 mp4에서 동일 프레임을 직접 추출해 픽셀 diff(mean/max/>20dB
비율)로 대조하는 과정에서, S4 애니메이션(wallProgress→mergeProgress→catalystProgress→reactProgress
순차 진행)이 의도한 수식대로 정확히 동작함을 별도로 확인했다(diff mean 0, 완전 일치 - 첫 육안
관찰에서 프레임을 서로 착각했던 것으로 밝혀졌고, 실제 애니메이션 로직 자체는 결함이 아니었다).

## 5. 검수 체크리스트 (v2 최종본, 언어별 관찰 기록)

프레임 추출: 그 언어의 `sceneStarts`/`sceneFrames` 실측값으로 구간별 시작·중간·전환경계 프레임을
계산해 나열(원칙 5). 인트로 69 + 제목카드 54 = 123 오프셋 포함.

- KO: 20,90,123,143,146,180,183,217,249,252,300,429,432,470,574,577,620,741,744,826,906,954 (22장)
- EN: 20,90,123,143,146,180,183,217,249,252,347,439,442,519,593,596,686,773,776,853,927,975 (22장)

### 한국어 (`episode-ko-v2.mp4`, `out/frames-ko-v2/`)

- [x] **자막 화면이탈**: f007(s2, "어 색깔이 변했네"), f011(s3, "사과 속에는 갈변...그러니까"),
  f016(s5, "레몬즙"+비교 캡션), f020(s6, "썩은 게 아니라 산소랑 만나") 등 캡션이 있는 프레임 전체를
  훑어 좌우 잘림 없음을 확인. 가장 긴 s3 캡션도 박스 안에 여유 있게 들어감.
- [x] **장면 전환 캐릭터 잔상**: f006(f180, s1→s2 전환부)·f009(f249, s2→s3 전환부)를 s1/s2/s3의
  일반 프레임과 대조 - SceneSwitcher 크로스페이드(6프레임) 도중 이전 장면이 살짝 더 오래 보이는
  것은 general-ep01에서 이미 "의도된 동작"으로 확인된 패턴과 동일. 새로운 유형의 잔상 없음.
- [x] **등장 전 요소 잔상**: f013(s4 시작, 프레임432) - CellMergeDiagram의 벽이 온전한 상태로
  시작, O2 방울·반응색 원이 전부 opacity 0으로 안 보임(점처럼 남는 잔상 없음) 확인.
- [x] **라벨 잘림**: f011(s3, "갈변 효소"/"색 성분")·f016(s5, "레몬즙") 라벨 전부 박스 밖 잘림 없음.
- [x] **요소 겹침**: f015(s4→s5 전환부, 프레임574) - 반응색 원(수정 후 반경105) 안에서도 두 원과
  라벨이 서로 겹치지 않고 구분됨 확인(4절 결함4 수정 후).
- [x] **바닥선 결함 재확인**: f005(f146)에서 사과 단면 중앙(540,940) 픽셀이 `(255,255,255)`(순백,
  배경과 동일)임을 재확인 - 4절 결함1 수정 확인.
- [x] **화면 하단 여백 과다**: f008(s2 중간)·f020(s6 중간) - 캐릭터+사과가 화면 세로 중앙~하단을
  채우고 캡션이 23% 지점에 위치, 하단 공백 과다 없음.
- [x] **음량**: `ffmpeg loudnorm` 측정 Integrated -13.6 LUFS / True Peak -1.9 dBTP(클리핑 없음).
  RMS 직접 계산(20ms hop)으로 구간별 피크 대조 - 내레이션(s2~s6) 피크 약 -9.8~-9.9dB, chop 효과음
  피크 -15.0dB, 인트로/아웃트로 딩 피크 -14.6~-14.8dB - 효과음이 전부 내레이션보다 조용함(원칙 7
  요구사항 충족). true silence 구간(중간 인트로 애니메이션, 1.0~1.5s)은 -120dB(디지털 무음)로
  확인, 배경 잡음 없음.
- [x] **효과음 타이밍**: chop.mp3 - 계산상 절대 프레임 143(=4.767초)에 재생 예정, RMS 직접 계산으로
  4.80초 지점에서 -15.0dB 피크 확인(오차 1프레임 이내, 20ms 빈 크기 감안). 지식 검증: 값이 s1의
  칼 접촉 프레임(로컬20)과 정확히 일치.
- [x] **프로필 자막 스타일**: 폰트 크기·위치(23% 지점)·색(흰 바탕/검은 글자, 진행 어절 코랄)이
  `theme.ts` CAPTION_STYLE·general.md 5절 값 그대로 적용됨을 육안 확인.
- [x] **(프로필 추가) 자막 15자 제한**: "사과 속에는 갈변 그러니까"(13자, 공백 포함) 등 캡션 줄
  전부 15자 이내로 wrapCounts(ko,15)가 정확히 자름을 확인.
- [x] **(프로필 추가) 60초 상한**: 33.3초, 크게 여유.

### 영어 (`episode-en-v2.mp4`, `out/frames-en-v2/`)

- [x] **자막 화면이탈**: f008(s2, "Whoa it turned brown")·f011(s3, "the stuff it reacts")·
  f017(s5, "down the tartness gets")·f020(s6, "rotten It's just") 등 wrapCounts(en,22) 기준으로
  분절된 캡션 줄 전부 박스 안에 들어가고 좌우 잘림 없음.
- [x] **CellMergeDiagram 라벨 겹침(4절 결함2)**: f011·f014 EN v2에서 "Browning enzyme"/
  "Color compound"가 분리선 양쪽에서 서로 침범하지 않고 완전히 분리되어 보임 - 수정 확인.
- [x] **레몬즙 라벨 폰트(4절 결함3)**: f017 EN v2에서 "Lemon juice"가 NanumSquareRound(다른 화면
  텍스트와 동일 서체)로 렌더링됨 확인 - 세리프 폰트 결함 해소.
- [x] **반응색 원이 라벨 삼킴(4절 결함4)**: f015 EN v2 - 반경 축소 후 코랄/골드 원과 양쪽 라벨
  ("Browning enzyme"/"Color compound") 모두 원 밖에서 온전히 보임.
- [x] **바닥선 결함**: 한국어와 동일 컴포넌트를 공유하므로 동일하게 `ground={null}` 적용 - f005
  EN v2에서 사과 단면 주변에 이질적인 가로줄 없음을 육안 확인(공용 컴포넌트 수정이라 언어 무관하게
  같이 해결됨).
- [x] **아웃트로 채널명**: f022(outro 중간)에서 "Whymo"(영어 채널명), "Next up", "Follow for more"
  전부 영어로 표시됨을 확인 - `lang="en"`이 Outro에 정확히 전달됨(한국어 채널명 누출 없음).
- [x] **화면 하단 여백**: f008·f020 - 한국어와 동일 레이아웃 공유, 과다 여백 없음.
- [x] **(프로필 추가) 60초 상한**: 34.0초, 크게 여유.

## 6. 관찰되었으나 결함으로 판정하지 않은 것 (참고용 기록)

- **첫 장면(s1) 시작 직후 8프레임(0.27초) 정도 화면이 흰 배경만 보임**: `SceneSwitcher`의
  `fadeIn=8` 기본값이 모든 장면(첫 장면 포함)에 동일하게 적용되는 설계 때문이다. general-ep01도
  동일 구조(첫 장면도 0→1 페이드인)를 그대로 쓰고 있어 이 화만의 새 결함이 아니라 기존 설계를
  그대로 물려받은 것으로 판단해 수정하지 않았다. 다만 사용자가 보기에 어색하면 `SceneSwitcher`의
  `fadeIn`을 씬별로 다르게 줄 수 있는 옵션을 추가하는 별도 개선 과제가 될 수 있다(공용 컴포넌트
  변경이라 이번 화 범위를 벗어나 손대지 않았다).
- s5(레몬즙 비교) 캡션이 "down the tartness gets"처럼 문장 중간에서 시작하는 줄로 끊기는 지점이
  있다 - `wrapCounts`의 자동 22자 분절 결과이며 단어가 잘리거나 화면을 벗어나진 않는다. 문체상
  더 자연스러운 분절점을 원하면 `lineSpec`을 수동으로 조정할 수 있으나, 원칙 5 기준(화면이탈·
  잘림 등 객관적 결함)에는 해당하지 않아 그대로 뒀다.

## 7. 최종 산출물

- `out/episode-ko-v2.mp4` - 999프레임 / 33.344초 (ffprobe 실측) / aac 48kHz stereo
- `out/episode-en-v2.mp4` - 1020프레임 / 34.048초 (ffprobe 실측) / aac 48kHz stereo
- `out/frames-ko-v2/`, `out/frames-en-v2/` - 검수용 프레임 22장씩
- v1(`episode-ko-v1.mp4`/`episode-en-v1.mp4`, 결함 발견 전 초안)은 회귀 비교용으로 `out/`에 그대로
  남겨뒀다. 정리는 `shorts/` 배포 승인 이후에 한다(파괴적 작업 승인 규칙).

## 8. 하지 않은 것

- `shorts/ko`·`shorts/en` 배포 복사 - 진행하지 않았다. 사용자 승인 필요.
- "검수 통과"·"합격" 판정 - 위 체크리스트는 전부 **관찰한 사실**만 기록했다. 최종 판단은 사용자
  몫이다.

---

**위 관찰 결과(특히 4절의 결함 발견·수정 내역과 5절의 프레임별 관찰 기록)를 사용자에게 제시하고
확인을 기다립니다.**

---

## 9. 배포 (2026-08-09, 사용자 승인 후)

- `shorts/ko/[4화] 사과 잘라두면 갈색이 되는 이유.mp4` <- `out/episode-ko-v2.mp4` 복사
- `shorts/en/[Ep. 4] Why Cut Apples Turn Brown.mp4` <- `out/episode-en-v2.mp4` 복사
- 원본은 `out/`에 그대로 유지(삭제하지 않음)
- md5sum 비교: 한/영 두 쌍 모두 소스·대상 일치 확인 완료

shorts/ 배포 완료, md5 일치 확인.
