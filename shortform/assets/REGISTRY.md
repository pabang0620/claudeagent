# 자산 레지스트리

숏폼 지식 영상 파이프라인의 **재사용 자산 목록**이다. 새 화를 만들기 전에 이 문서를 먼저 읽고
"이미 있는 것"과 "새로 만들 것"을 구분한다. 자산을 추가하면 이 문서도 같이 갱신한다.

- 라이브러리 루트: `/home/lee/project/.claude/shortform/assets/`
- 카탈로그 이미지(전 자산 한눈에): `npx remotion still src/index.ts Catalog out/catalog.png --frame=60`
- 캐릭터·팔레트·씬은 **모든 프로필(아동지식 / 사이언스 / 그 외) 공용**이다. 프로필이 바꾸는 것은
  말투·난이도·TTS 설정·배경 톤뿐이고, 마스코트와 연출 부품은 바뀌지 않는다.
  프로필별 톤 규칙은 `/home/lee/project/.claude/shortform/profiles/<프로필>.md` 에 있다.
  프로필이 "어두운 단색 배경"을 요구하면 새 배경을 만들지 말고 `PlainBg` 의 `top`/`bottom` 을
  어두운 토큰으로 넘긴다.
- **현재 운영 채널(굼구미/Whymo)의 기본 프로필은 `profiles/general.md` 다.** 이 채널은 아동용/성인용으로
  톤을 나누지 않고 프로필 하나로 한/영 양쪽 대본을 낸다(2026-08-08 확정). `kids.md`/`science.md`는
  이 채널용이 아니라 향후 다른 톤의 채널을 만들 때 쓰는 템플릿으로 보존한다.
- **포맷(9:16 세로 / 16:9 가로)은 프로필과 별개 축이다(2026-08-10 확정).** 어느 프로필이든 세로
  숏폼으로도, 가로 롱폼으로도 낼 수 있다 - 프로필이 바꾸는 건 말투·TTS·자막 스타일이고, 포맷이
  바꾸는 건 배경·브랜드(Intro/Outro/TitleCard) 자산의 캔버스 좌표뿐이다. 캐릭터·소품·씬 컴포넌트
  (Caption, Effects 등)는 화면 좌표를 직접 들고 있지 않아 포맷과 무관하게 그대로 재사용된다.
  `W`/`H`(1080x1920)를 직접 참조하거나 세로 절대좌표를 쓰는 배경·브랜드 자산만 포맷별로
  `assets/backgrounds/16x9/`, `assets/brand/16x9/`, `assets/scenes/16x9/` 처럼 폴더를 분리해 새로
  둔다("폴더식 분리" - 하나의 컴포넌트에 `format` prop 을 받아 좌표를 분기하는 방식은 쓰지 않는다).
  16:9 자산은 `assets/index.ts` 에서 `PlainBgLandscape`/`IntroLandscape`/`OutroLandscape`/
  `TitleCardLandscape` 처럼 `Landscape` 접미사로 재노출된다(세로판과 이름이 겹쳐서 별칭 필요).

import 는 항상 배럴에서 한다. 하위 파일 경로를 직접 쓰지 않는다.

```tsx
import { Actor, POSES, Caption, SavannaBg, Intro, Outro, C, SW, FontLoader } from '../../assets';
```

---

## 1. 토큰·유틸 (assets 루트)

| 자산 | 경로 | 종류 | 설명 | 주요 export | 최초 |
|---|---|---|---|---|---|
| theme | `theme.ts` | 토큰 | 색·영상규격·선굵기·레이아웃·타이포·자막스타일·채널명 SSOT | `C`, `W/H/FPS`, `W_LANDSCAPE/H_LANDSCAPE`(16:9 캔버스, 값 불변), `SW/SW_THIN`, `GROUND/FEET_VB`, `CAP_BOTTOM/CAP_SIDE`, `RADIUS`, `FONT/FS`, `CAPTION_STYLE`, `CHANNEL_NAME/CHANNEL_MARK/SUBSCRIBE_TEXT` | ep01 |
| anim | `anim.ts` | 유틸 | 프레임 -> 값 결정적 변환 (Math.random 금지) | `eyeOpenAt`, `breathe`, `sway`, `popIn`, `easeIn`, `bounceIn`, `progress`, `shake`, `clamp01`, `blendPose` | ep01 |
| timeline | `timeline.ts` | 유틸 | 음성 타임스탬프 -> 화면 타이밍. 에피소드 데이터를 인자로 받고 import 하지 않는다 | `sceneFrames`, `sceneStarts`, `totalFrames`, `wordFrame`, `makeWordFrame`, `mouthAt`, `mouthProp`, `buildCaptions`, `wrapByChars`, `wrapCounts`, `locate` | ep01 (`wrapByChars`/`wrapCounts` 는 ep01 스코프였다가 general-ep04 에서 재사용 필요해져 공용 승격) |
| FontLoader | `FontLoader.tsx` | 유틸 | 폰트를 `delayRender` 로 붙잡고 로드. 컴포지션 최상단에 1회 | props: `fonts` | ep01 |

**색 토큰** (`C`): `ink` `inkSoft` `coral` `coralSoft` `gold` `goldSoft` `paper` `sky` `hill` `hillFar`
`water` `room` `roomDeep` `seaTop` `seaDeep` `leaf` `browning` `browningSoft` `night` `nightMid` `nightSoft` `cream`

`browning`/`browningSoft`(general-ep04 추가) - 산화·갈변 계열. 사과 갈변처럼 "산소와 만나 색이
변하는" 소재 전반에서 재사용한다. paper/cream 위에 오버레이로 겹쳐 쓰는 용도라 채도를 낮게 잡았다.

`ink #252E3A` 와 `coral #FC876E` 는 캐릭터 원본 PNG 픽셀 실측값이다. 바꾸지 않는다.
`cream` 은 **어두운 배경 위 텍스트 전용**이다. 밝은 배경에 쓰면 안 된다.

**채널명** (2026-08-08 확정, 한/영 별도 채널 운영): `CHANNEL_NAME_BY_LANG['ko']` = 굼구미,
`CHANNEL_NAME_BY_LANG['en']` = Whymo. `CHANNEL_NAME`(하위 호환 별칭)은 굼구미를 가리킨다.
새 코드는 `CHANNEL_NAME_BY_LANG[lang]` 으로 조회할 것 - 언어 하나에 고정된 상수를 새로 만들지 않는다.

---

## 2. 캐릭터 (`assets/character/`) - 모든 프로필 공용 마스코트

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| Character | `character/Character.tsx` | 캐릭터 | 졸라맨 마스코트 SVG 본체. 원본 1254x1254 실측 복제 | `width` `height` `viewBox` `armL/armR{s,e}` `legL/legR{h,k}` `headTilt` `lean` `mouthOpen` `eyeOpen` `blush` `color` `accent` `fill` `strokeScale` `style` | ep01 |
| Actor | `character/Actor.tsx` | 캐릭터 | 캐릭터를 화면에 세우는 배치기. 발끝을 바닥선에 맞추고 호흡·눈깜빡임 자동 적용 | `size` `centerX` `ground` `feetVb` `pose` `mouthOpen` `breathAmp` `blinkOffset` `color` `accent` `fill` `style` | ep01 |
| BustActor | `character/Actor.tsx` | 캐릭터 | 얼굴 클로즈업(바스트샷) | `size` `left` `top` `pose` `mouthOpen` `blinkOffset` `breathAmp` `color` `accent` `fill` | ep01 |
| MiniCharacter | `character/Actor.tsx` | 캐릭터 | 카드·아이콘 칸에 넣는 정지 미니 캐릭터 (호흡·깜빡임 없음) | `width` `pose` `color` `accent` `fill` | ep01 |
| 포즈 프리셋 | `character/poses.ts` | 캐릭터 | 14종. `POSES` 로 이름 -> 포즈 조회 가능 | - | ep01 |
| 원본 참조 이미지 | `character/character_reference.png` | **참조 전용** | 사용자가 확정한 캐릭터 디자인 원본 PNG. `Character.tsx` 는 이 이미지를 픽셀 실측해 복제한 것이다 | - | ep01 |
| 채널 로고(한국어) | `character/logo_ko.png` | **채널 자산** | 유튜브 프로필 사진용. 1254x1254. 캐릭터 + "굼구미" + 코랄 링 | - | - |
| 채널 배너(한국어) | `character/banner_ko.png` | **채널 자산** | 유튜브 배너용. 1672x941 로 **유튜브 최소 규격(2048x1152) 미달** 상태(재작업 필요) | - | - |
| 채널 로고(영어) | `character/logo_en.png` | **채널 자산** | 유튜브 프로필 사진용. 479x479. 캐릭터 + "WHYMO" + 코랄 링 | - | - |
| 채널 배너(영어) | `character/banner_en.png` | **채널 자산** | 유튜브 배너용. 1983x314 로 **유튜브 최소 규격(2048x1152) 크게 미달**, 세로가 특히 부족(16:9가 아니라 약 6.3:1) - 재작업 필요 | - | - |

`character_reference.png` 는 **렌더에 쓰는 자산이 아니다.** 아래 규칙 8의 "이미지 파일 자산을 쓰지
않는다" 는 여전히 유효하다. 이 파일은 캐릭터를 수정하거나 다른 환경에서 원본과 대조할 때 보는
기준 이미지이며, 코드에서 import 하지 않는다.

**포즈 15종**: `idle` `pointUp` `shrug` `count` `surprised` `measure` `present` `thinking` `wave`
`wide` `cheer` `touchNeck` `waveBye` `touchForehead` `crouch`

- `touchNeck` / `waveBye` / `touchForehead` 는 **바스트샷 전용**이다. 전신으로 쓰면 팔 위치가 어색하다.
  `touchForehead` 는 차가운 음식을 먹고 이마가 찌릿한 리액션용(눈 살짝 찡그림, 입 살짝 벌림)이다.
- `crouch` 는 발끝이 올라오므로 `feetVb: 955` 가 포즈 안에 들어 있다. Actor 가 자동으로 읽는다.
- 팔을 드는 포즈는 어깨각 `|s|` 를 **105~120** 에 둔다. 이 캐릭터는 머리 반지름(255)이 팔 전체
  길이(191)보다 커서 그냥 들면 손이 머리에 파묻힌다. `armStretch()` 가 어깨각에 따라 팔을
  늘려 보정하지만 `|s|` 가 150 을 넘으면 다시 파묻힌다.
- 포즈를 갈아끼울 때는 `blendPose(a, b, t)` 로 보간한다. 뚝 바뀌면 눈에 띈다.

---

## 3. 씬 컴포넌트 (`assets/scenes/`) - 내용과 무관한 연출 부품

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| Caption | `scenes/Caption.tsx` | 씬 | 자막. 지금 말하는 어절이 코랄로 강조된다 | `line` `t` `dark` `emphasis` `fontSize` `bottom` `side` `maxWidth` `style` | ep01 |
| Label | `scenes/Caption.tsx` | 씬 | 화면 텍스트(제목·라벨) 위치 지정 배치 | `x` `y` `text` `size` `color` `align` `weight` `wrapWidth` | ep01 |
| Card | `scenes/Card.tsx` | 씬 | 카드 1장 (그림 + 라벨 + 원형 뱃지) | `x` `y` `w` `h` `label` `badge` `progress` `bg` `border` `borderWidth` `radius` `labelColor` `labelSize` `badgeColor` `badgeSize` `artBottom` | ep01 |
| CardGrid | `scenes/Card.tsx` | 씬 | 카드 격자. 카드마다 등장 프레임을 어긋나게 준다 | `items[{label,badge,art}]` `x` `y` `size` `height` `gap` `columns` `appearAt(i)` `frame` `cardProps` | ep01 |
| CompareBars | `scenes/CompareBars.tsx` | 씬 | 값 비교 막대. Ruler 와 같은 `pxPerUnit` 을 쓰면 눈금과 맞는다 | `items[{label,value,color,thickness,at,valueText}]` `x` `y` `pxPerUnit` `rowGap` `labelGap` `frame` `stroke` `strokeWidth` `labelColor` `labelSize` `minLength` | ep01 |
| CountUp | `scenes/Counter.tsx` | 씬 | 0에서 목표값까지 올라가는 숫자 | `x` `y` `to` `from` `at` `duration` `frame` `size` `color` `digits` `prefix` `suffix` `width` `align` `commas`(천단위 쉼표, 기본 false, general-ep06 추가) | ep01 |
| StepCounter | `scenes/Counter.tsx` | 씬 | 정해진 프레임마다 1씩 증가 ("하나, 둘, 셋...") | `x` `y` `steps[]` `frame` `size` `color` `width` `align` `hideZero` `suffix` | ep01 |
| SpeechBubble | `scenes/SpeechBubble.tsx` | 씬 | 원형 확대 풍선 / 사각 말풍선. 꼬리 방향 지정 | `x` `y` `r` `w` `h` `shape('round'\|'rect')` `tail` `progress` `bg` `border` `borderWidth` `text` `textColor` `textSize` | ep01 |
| ChoiceList | `scenes/ChoiceList.tsx` | 씬 | 선택지 목록(3지선다 등) + 정답 공개 | `items[{badge,text}]` `x` `y` `width` `rowHeight` `rowGap` `appearAt(i)` `frame` `correct` `revealAt` `bg` `correctBg` `border` `textColor` `textSize` `badgeColor` | ep01 |
| CountdownRing | `scenes/Effects.tsx` | 씬 | 원형 카운트다운 (생각할 시간) | `x` `y` `size` `at` `duration` `frame` `from` `ring` `track` `bg` `textColor` | ep01 |
| Sparkles | `scenes/Effects.tsx` | 씬 | 반짝임 파티클 (정답·성공) | `box{x,y,w,h}` `t` `colorA` `colorB` `scale` | ep01 |
| FlashOverlay | `scenes/Effects.tsx` | 씬 | 화면 전체 섬광 (임팩트) | `frame` `at` `color` `peak` `rise` `fall` | ep01 |
| Shake | `scenes/Effects.tsx` | 씬 | 자식 전체를 잠깐 흔든다 | `frame` `at` `duration` `amp` | ep01 |
| Appear | `scenes/Effects.tsx` | 씬 | 등장 모션 래퍼 (up/down/left/right/scale/fade) | `progress` `from` `distance` `origin` | ep01 |
| PulseRing | `scenes/Effects.tsx` | 씬 | 대상 뒤에 까는 맥동 원 (시선 유도) | `x` `y` `size` `frame` `progress` `color` `opacity` `periodFrames` | ep01 |
| SpotlightCircle | `scenes/Effects.tsx` | 씬 | 어두운 배경에서 라인 캐릭터가 묻히지 않게 감싸는 흰 원 액자 | `x` `y` `size` `progress` `bg` `border` `borderWidth` | ep01 |
| SceneSwitcher | `scenes/SceneSwitcher.tsx` | 씬 | 장면 크로스페이드 전환. 씬에 **구간 로컬 프레임 `f`** 를 넘긴다 | `scenes[{Component,frames,props}]` `starts` `xfade` `fadeIn` `zoom` | ep01 |
| TitleCard | `scenes/TitleCard.tsx` | 씬 | **표준 요소 - 모든 화 공용.** 인트로 직후~본편(s1) 시작 전 1.5~2초(기본 54프레임) 노출되는 제목 카드. Intro 의 fade_minimal 톤(오버슛 없는 opacity+미세 이동)을 그대로 따름. accent 점 -> 제목 -> 밑줄을 flex column 으로 쌓아 언어별 줄바꿈 차이에도 안 겹침. `pointUp` 포즈 캐릭터가 제목을 가리키며 등장(옵션). Intro/Outro 와 같은 이유로 `frame` 생략 시 `useCurrentFrame()` 을 직접 씀(SceneSwitcher 배열이 아니라 자체 Sequence 전용이라 규칙 5 예외) | `title`(필수, 화면 문구 하드코딩 금지) `frame` `durationInFrames` `bgTop` `bgBottom` `textColor` `accent` `fontSize` `showCharacter` `pose` | general-ep01 |
| MotionSwoosh | `scenes/MotionSwoosh.tsx` | 씬 | "동그라미 안에서 밖으로" 뻗는 짧은 호 3개를 부채꼴로 배치하고 frame 기반 sin으로 scale·opacity를 빠르게 펄스시키는 장식용 동작선(speed line) 이펙트. 캐릭터를 다시 그리거나 관절을 조작하지 않고 팔다리 등 짧은 부위 옆에 얹기만 해도 "빠르게 움직인다"는 만화적 인상을 준다 - **손·발 움직임 강조에 범용 재사용 가능**(굼구미 캐릭터에도 그대로 쓸 수 있다, 캐릭터 종류 무관). **크기가 22~34px 라 "너무 작아서 안 보인다"는 피드백을 받았다(perdungi-demo-dynamic 착수 배경) - 눈에 띄게 큰 임팩트가 필요하면 아래 `DustCloud`/`ImpactBurst` 를 쓸 것** | `x` `y` `size` `rotation` `frame` `periodFrames` `color` `opacity` `strokeWidth` `style` | 폐기됨(구 perdungi-demo-active), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| DustCloud | `scenes/ImpactEffects.tsx` | 씬 | 발밑에서 확 퍼졌다 위로 살짝 뜨며 옅어지는 큰 먼지 뭉치. openclipart "Simple Dust Cloud"(qubodup, Public Domain/CC0) 원본 path 13개의 좌표를 그대로 사용하고(재해석·재작도 없음, 원칙 0-1과 동일 정신), `frame`/`at`/`duration` 로 등장(확대)-소멸(축소+상승) 애니메이션만 얹었다. 기본 `size`=320px 로 MotionSwoosh(22~34px) 대비 대폭 키웠다 - **도약·착지·달리기 등 발밑에서 먼지가 나는 동작 전반 재사용 가능**(캐릭터 종류 무관) | `x` `y` `frame` `at` `duration` `size` `color` `rise` `style` | perdungi-demo-dynamic |
| ImpactBurst | `scenes/ImpactEffects.tsx` | 씬 | 착지·충돌 순간 짧게 팝인했다 사라지는 만화식 별 모양 충격파. openclipart "Comic Burst - Explosion - Abstract 005"(TikiGiki, Public Domain/CC0) 원본 polygon 좌표를 그대로 사용, 색만 테마 토큰(`C.gold`/`C.ink`)으로 바꿨다. 기본 `size`=360px, `duration`=18프레임(짧게 짧아야 "순간 임팩트"로 읽힌다) - **착지·충돌·타격 등 순간 임팩트 강조 전반 재사용 가능**(캐릭터 종류 무관) | `x` `y` `frame` `at` `duration` `size` `color` `stroke` `strokeWidth` `style` | perdungi-demo-dynamic |
| CellMergeDiagram | `scenes/CellMergeDiagram.tsx` | 씬 | "원래 분리된 두 요소가 벽이 갈라지며 만나 반응한다" 는 구조를 보여주는 범용 다이어그램(칸 상자 + 벽이 중앙에서 갈라져 사라짐 + 원 2개가 중앙으로 이동해 겹침 + 위에서 촉매 방울이 내려와 자리잡음 + 합쳐진 자리에서 반응색이 번짐, 4단계 각각 독립 progress). 전부 0이면 "분리된 정적 상태"만 보여주는 정지 다이어그램이 된다 | `width` `x` `y` `leftLabel` `rightLabel` `leftColor` `rightColor` `wallProgress`(0~1) `mergeProgress`(0~1) `catalystProgress`(0~1) `catalystLabel` `catalystColor` `reactProgress`(0~1) `reactColor` `stroke` `fill` `style` | general-ep04 |
| TitleCardLandscape | `scenes/16x9/TitleCard.tsx` (배럴에서는 `TitleCardLandscape`) | 씬 | **TitleCard 의 16:9(가로) 판.** 세로판과 같은 톤(accent 점 -> 제목 -> 밑줄, fade_minimal)이지만 좌표는 1920x1080 캔버스에 새로 잡았다 - 텍스트 블록을 화면 상단부에 좁게 모으고 `pointUp` 캐릭터를 그 아래 중앙에 작게 둔 세로 스택 구조(가로 폭이 넓다고 좌우 분할하지 않음 - "제목을 가리키는" 의미가 흐트러지는 걸 피함). props·기본 길이(`TITLE_CARD_FRAMES_LANDSCAPE`=54)는 세로판과 동일 | `title`(필수) `frame` `durationInFrames` `bgTop` `bgBottom` `textColor` `accent` `fontSize` `showCharacter` `pose` | 신규(포맷 인프라, 2026-08-10) |

---

## 4. 소품 (`assets/props/`) - 직접 그린 것

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| Giraffe | `props/Giraffe.tsx` | 소품 | 기린. `drink` 0~1 로 서 있음 <-> 물 마시는 자세 연속 보간 | `width` `drink` `stroke` `fill` `spot` `silhouette` `strokeWidth` `style` | ep01 |
| Mouse | `props/Animals.tsx` | 소품 | 쥐 | `width` `stroke` `fill` `spot` `silhouette` `strokeWidth` `style` | ep01 |
| Whale | `props/Animals.tsx` | 소품 | 고래 | 위와 동일 | ep01 |
| Sloth | `props/Animals.tsx` | 소품 | 나무늘보 (가지에 매달린 자세, 실루엣용으로 자주 씀) | 위와 동일 | ep01 |
| BoneStack | `props/BoneStack.tsx` | 소품 | 블록을 아래에서 위로 쌓아 개수를 보여주는 스택 | `count` `lit` `blockW` `blockH` `gap` `litColor` `offColor` `stroke` `strokeWidth` `radiusRatio` `popAt(i)` | ep01 |
| Ruler | `props/Ruler.tsx` | 소품 | 눈금자. 단위 무관(cm/m/초) | `max` `pxPerUnit` `originX` `top` `height` `majorEvery` `labels` `markAt` `markColor` `stroke` `fill` `labelColor` `strokeWidth` `width` `svgHeight` | ep01 |
| QMark | `props/Symbols.tsx` | 소품 | 큰 물음표(느낌표로도 씀). 텍스트 기반이라 FontLoader 필요 | `size` `color` `outline` `glyph` `style` | ep01 |
| HumanNeckIcon | `props/Symbols.tsx` | 소품 | 사람 상반신 미니 실루엣 | `width` `stroke` `fill` `strokeWidth` | ep01 |
| ThemedIcon | `props/ThemedIcon.tsx` | 소품 | Tabler Icons(MIT)를 우리 선굵기·색으로 렌더 | `name` `size` `color` `strokePx` `bg` `bgPad` `style` | 신규 |
| IconBrowser | `props/ThemedIcon.tsx` | 소품 | **Studio 전용** 아이콘 탐색기 (@iconify/react API 조회). 렌더에 넣지 말 것 | `names[]` `size` | 신규 |
| IceCream | `props/IceCream.tsx` | 소품 | 아이스크림콘 (스쿱 1~2단 + 콘 와플격자). 음식류 소재 재사용 | `width` `scoopColor` `coneColor` `stroke` `strokeWidth` `doubleScoop` `style` | general-ep01 |
| HeadNerveDiagram | `props/HeadNerveDiagram.tsx` | 소품 | 캐릭터 얼굴 오버레이 방식으로 전면 재설계, 2026-08-08. 새 얼굴 형태를 그리지 않고 BustActor + 하이라이트 오버레이로 구성 | `f` `width` `x` `y` `highlightMouth`(냉기+혈관펄스) `highlightForehead`(통증) `showNerve`(0~1 신경선 진행도) `signalT`(0~1 이동신호) `stroke` `fill` `style` | general-ep01 |
| VoicePathDiagram | `props/VoicePathDiagram.tsx` | 소품 | "소리/신호가 몸에서 두 경로로 귀(또는 다른 목적지)까지 간다" 류에 재사용하는 오버레이. HeadNerveDiagram과 같은 원칙(새 얼굴 안 그림, BustActor 위에 오버레이만). 공기 경로(머리 바깥을 도는 얇은 선)와 뼈 경로(머리 안쪽을 지나는 짧은 선, 실측 머리 윤곽 HEAD_R 테이블의 theta=0 지점을 귀로 사용)를 각각 물결치는 폴리라인(파형)으로 그려 굵기·진폭으로 "풍부함"을 표현한다 | `f` `width` `x` `y` `showAirPath`(0~1) `showBonePath`(0~1) `boneThickness`(0~1, 굵기·파형 진폭 강조) `micCapture`(0~1 진행도 - 대본 문서엔 bool로 적혀 있었으나 마이크 팝인+뼈경로 소멸 애니메이션을 위해 진행도로 구현) `stroke` `fill` `style`. `VOICE_EAR_PT` export(귀 좌표, 실측 head outline 기반) | general-ep03 |
| SodaCan | `props/SodaCan.tsx` | 소품 | 탄산음료 캔. `shaken` 0~1 로 벽에 붙은 기포 소수 <-> 음료 속 다수 분산을 연속 보간, `open` 0~1 로 뚜껑 닫힘 <-> 열림(+뚜껑 위 미세 팝 스파크)을 표현. `Giraffe`의 `drink` 연속보간 설계를 참고해 개봉·비교·확산·동시분출 4장면을 컴포넌트 하나로 커버(화면 전체를 덮는 큰 파티클 임팩트는 `Sparkles`/`FlashOverlay`를 씬에서 별도로 얹는다) | `width` `shaken` `open` `fill` `lidColor` `bubbleColor` `stroke` `strokeWidth` `style`, 별도 export `CAN_GRIP`(캔을 쥐는 지점) | general-ep05 |
| Apple | `props/Apple.tsx` | 소품 | 사과(류 과일). `cut=false` 면 통 과일 실루엣(줄기+잎), `cut=true` 면 잘린 단면(껍질 링+속살+씨앗 별모양)을 그린다. `browning`(0~1)이 속살 위에 갈색을 오버레이해 하얀색->갈색 진행을 표현. skinColor/fleshColor만 바꾸면 바나나 등 "잘라두면 산화 변색되는" 다른 과일에도 재사용 가능 | `width` `browning`(0~1) `cut` `skinColor` `fleshColor` `brownColor` `stroke` `strokeWidth` `style` | general-ep04 |
| Finger | `props/Hand.tsx` | 소품 | 손가락 클로즈업. `wrinkle` 0~1 로 매끈함 <-> 쭈글쭈글함을 표면 잔주름 선의 진폭·불투명도로 연속 보간(실루엣 자체는 고정). "손·손가락" 소재 전반 재사용 가능 | `width` `wrinkle`(0~1) `stroke` `fill` `strokeWidth` `style` | general-ep02 |
| FingerCrossSection | `props/Hand.tsx` | 소품 | 손가락 단면. 중심 혈관(캡슐)이 `veinNarrow` 0~1 에 따라 좁아지고, 좁아짐을 가리키는 화살촉 2개가 안쪽으로 이동 | `width` `veinNarrow`(0~1) `stroke` `fill` `veinColor` `strokeWidth` `style` | general-ep02 |
| FingerGrip | `props/Hand.tsx` | 소품 | 위/아래 두 손가락이 구슬을 집는 그림. `gripped=false`면 `beadY` 0~1 로 구슬이 틈 아래로 미끄러져 빠지는 모습을, `gripped=true`면 구슬이 중앙에 고정되고 `checkT`로 체크 배지가 팝인하는 모습을 표현. `wrinkle`로 양쪽 손가락 질감 전환 | `width` `wrinkle`(0~1) `beadY`(0~1) `gripped` `checkT`(0~1) `stroke` `fill` `beadColor` `strokeWidth` `style` | general-ep02 |
| Bathtub | `props/Bathtub.tsx` | 소품 | 욕조 앞판(둥근 사각형 몸체 + 완만한 수면선 + 김 파티클 3가닥). 캐릭터(Actor)보다 나중에 그려 하반신을 가리는 용도. 김은 `steamT` 0~1 로 서서히 옅어져 사라진다(장면 진행에 맞춰 호출부가 계산). "물에 몸/손발을 담그는" 소재 전반 재사용 가능 | `f`(김의 살랑거림에만 사용) `waterY` `steamT`(0~1) `tubColor` `waterColor` `stroke` `strokeWidth` `style` | general-ep02 |
| StarlightDiagram | `props/StarlightDiagram.tsx` | 소품 | "빛이 관측자에게 도달하는 과정" 범용 다이어그램. 3개 독립 레이어(각자 undefined면 안 그림): `sightlineProgress`(중심에서 8방향 방사형 점선, 끝에 나무/별 크로스페이드 - "어느 쪽을 보든 뭔가에 닿는다" 비유), `travelProgress`(광원->관측자 빛줄기 이동, "도중에 멈춤" 연출은 호출부가 progress를 캡해서 넘김), `waveProgress`(좌->우로 파장이 늘어지고 옅어지는 파동, 적색편이 비유). CellMergeDiagram과 같은 다단계 독립 progress 설계 | `width` `x` `y` `sightlineProgress`(0~1) `sightlineTargetMix`(0=나무,1=별) `travelProgress`(0~1) `travelLength`(px) `waveProgress`(0~1) `stroke` `fill` `style` | general-ep06 |
| AnalogClock | `props/AnalogClock.tsx` | 소품 | 아날로그 시계. 문자판(12시 기준 눈금) + 시침/분침/초침(각도 지정, 12시=0도·시계방향) + 초침 끝에 붙는 옅은 글로우 링(`freeze` - "멈춘 듯" 보이는 하이라이트). 시간·타이밍을 소재로 한 향후 화(시차·타임랩스 등)에서도 재사용 가능성이 높아 에피소드 로컬이 아니라 여기 등록 | `width` `x` `y` `hourDeg` `minuteDeg` `secondDeg` `freeze`(0~1) `stroke` `fill` `faceColor` `secondColor` `strokeWidth` `style` | general-long01 |
| LegNerveDiagram | `props/LegNerveDiagram.tsx` | 소품 | 다리 옆모습(허벅지+종아리+발 캡슐 실루엣) + 무릎 뒤쪽을 지나는 신경 경로 오버레이. HeadNerveDiagram과 같은 원칙(새 신체를 정교하게 그리지 않음). `compressProgress`(0~1, 위에서 체중이 실려 눌리는 막대 애니메이션 + 무릎 구간 신경 신호가 옅어짐)와 `releaseProgress`(0~1, 눌림이 풀리며 신경 경로 여러 지점에서 frame 기반 결정적 위상차로 불균일하게 스파크가 튐)를 독립 진행도로 받아 "오래 눌리면 무감각해지고 풀리면 찌릿해지는" 신경 압박/재개통 서사 전체를 컴포넌트 하나로 커버한다 - 자세·눌림을 소재로 한 다른 화(저림·마비 등)에서도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록 | `f` `width` `x` `y` `compressProgress`(0~1) `releaseProgress`(0~1) `stroke` `fill` `style` | general-ep09 |

---

## 5. 배경 (`assets/backgrounds/`)

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| PlainBg | `backgrounds/PlainBg.tsx` | 배경 | 기본형. 단색 + 아주 옅은 세로 그라데이션 + 선택적 바닥선 | `top` `bottom` `stop` `ground` `groundColor` `floor` `floorOpacity` | 신규 |
| SavannaBg | `backgrounds/SavannaBg.tsx` | 배경 | 사바나·야외. 나무 배치·시차·물웅덩이·밤 오버레이 | `pan` `pond` `night` `sun` `ground` `trees[]` `skyTop` `skyBottom` `hillColor` `hillFarColor` `waterColor` | ep01(일반화) |
| NightSkyBg | `backgrounds/NightSkyBg.tsx` | 배경 | 우주·밤하늘. 별(고정 시드) + 달 차오름 + 선택적 지평선 | `stars` `seed` `frame` `moon` `moonX` `moonY` `moonR` `horizon` `top` `bottom` `starColor` `horizonColor` | 신규 |
| LabBg | `backgrounds/LabBg.tsx` | 배경 | 실내·실험실. 선반 + 유리병 실루엣 + 벽 격자 | `wall` `wallDeep` `line` `liquid` `ground` `shelves[]` `grid` | 신규 |
| OceanBg | `backgrounds/OceanBg.tsx` | 배경 | 바다. 수면 물결 + 거품 + 해저 모래 | `surface` `seabed` `bubbles` `seed` `frame` `skyColor` `waterTop` `waterDeep` `sandColor` `lineColor` | 신규 |
| PlainBgLandscape | `backgrounds/16x9/PlainBg.tsx` (배럴에서는 `PlainBgLandscape`) | 배경 | **PlainBg 의 16:9(가로) 판.** 세로판과 같은 톤(단색 + 아주 옅은 세로 그라데이션 + 선택적 바닥선, 특정 장소 고정 안 함)이되 좌표는 1920x1080 캔버스에 새로 계산했다(세로판 좌표를 늘린 게 아님). 바닥선 기본 y 는 세로판 `GROUND/H` 비율(≈0.651)을 그대로 적용한 703 | `top` `bottom` `stop` `ground` `groundColor` `floor` `floorOpacity` | 신규(포맷 인프라, 2026-08-10) |

배경 공통 규칙: 캐릭터(잉크 라인 + 흰 채움)가 묻히지 않도록 **채도를 낮게** 유지한다.
어두운 배경(NightSkyBg)에서는 캐릭터를 `SpotlightCircle` 안에 넣거나 `color` 를 밝게 바꾼다.
(16:9 는 현재 `PlainBg` 만 포맷 분리했다. `NightSkyBg`/`SavannaBg`/`LabBg`/`OceanBg` 의 16:9 판은
아직 없다 - 필요해지면 같은 "폴더식 분리" 방식으로 `backgrounds/16x9/` 에 추가할 것. 세로판
`NightSkyBg` 는 내부에서 `theme.W`/`H`(세로값)를 하드코딩하고 있어 16:9 캔버스에 그대로 쓰면
별이 화면 왼쪽 1080px 안에만 찍힌다 - 16:9 로 쓰려면 새로 만들어야 한다(brand/16x9/Outro.tsx 의
`dark` 모드가 이 문제를 우회한 선례 참고).

---

## 6. 브랜드 (`assets/brand/`)

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| Intro | `brand/Intro.tsx` | 브랜드 | 인트로 69프레임(2.3초). 캐릭터가 튀어오르며 링·반짝임, 로고 뱃지 -> 채널명 -> 밑줄. `lang`으로 언어별 채널명·로고기호 자동 전환. 로고 뱃지가 팝인하는 프레임(12)에 맞춰 `audio/intro_ding.mp3` 재생(2026-08-08 추가, 코드에 내장돼 있어 별도 props 없음) | `channelName` `mark` `tagline` `durationInFrames` `bgTop` `bgBottom` `accent` `lang` | 신규 |
| Outro | `brand/Outro.tsx` | 브랜드 | 아웃트로 90프레임(3.0초). 다음 편 예고 카드 + 구독 유도(종) + 손 흔드는 캐릭터. `lang`으로 언어별 채널명·구독문구 자동 전환. 구독 벨이 팝인하는 프레임(21)에 맞춰 `audio/outro_ding.mp3` 재생(2026-08-08 추가, 코드에 내장돼 있어 별도 props 없음) | `nextHint` `nextTitle` `subscribeText` `channelName` `durationInFrames` `dark` `accent` `lang` | 신규 |
| IntroLandscape | `brand/16x9/Intro.tsx` (배럴에서는 `IntroLandscape`) | 브랜드 | **Intro 의 16:9(가로) 판.** 같은 톤(같은 비트 타이밍·같은 fade_minimal 로고 연출)이지만 세로판의 "캐릭터 위 -> 로고뱃지~태그라인 아래" 세로 스택 대신 **캐릭터는 왼쪽, 로고뱃지~태그라인 블록은 오른쪽**의 좌우 배치로 새로 구성(세로 캔버스 좌표를 그대로 늘리지 않음). 길이·딩 사운드 타이밍은 세로판과 동일(`INTRO_FRAMES_LANDSCAPE`=69) | `channelName` `mark` `tagline` `durationInFrames` `bgTop` `bgBottom` `accent` `lang` | 신규(포맷 인프라, 2026-08-10) |
| OutroLandscape | `brand/16x9/Outro.tsx` (배럴에서는 `OutroLandscape`) | 브랜드 | **Outro 의 16:9(가로) 판.** 손 흔드는 캐릭터를 왼쪽에, 채널명~다음 편 카드~구독 유도를 오른쪽 컬럼에 배치(Intro 16x9 와 동일 원칙). `dark` 모드는 세로판의 `NightSkyBg`(내부에 세로 W/H 하드코딩 - 16:9 에 그대로 쓰면 별이 왼쪽에만 찍힘) 대신 어두운 톤 `PlainBgLandscape`(night/nightMid)를 쓴다. `nextHint`가 2~3줄로 늘어나도 카드-구독블록이 안 겹치도록 카드 폭·폰트·구독블록 간격을 조정했다(렌더 검수로 발견해 반영, `OUTRO_FRAMES_LANDSCAPE`=90) | `nextHint` `nextTitle` `subscribeText` `channelName` `durationInFrames` `dark` `accent` `lang` | 신규(포맷 인프라, 2026-08-10) |

- `INTRO_FRAMES = 69`, `OUTRO_FRAMES = 90` 상수를 함께 export 한다. 타임라인 계산에 쓸 것.
  16:9 판은 `INTRO_FRAMES_LANDSCAPE`/`OUTRO_FRAMES_LANDSCAPE`(값은 세로판과 동일 69/90).
- **채널명은 미정이다.** `theme.ts` 의 `CHANNEL_NAME = '채널명'` 이 플레이스홀더다.
  확정되면 그 한 줄만 바꾸면 인트로·아웃트로에 동시에 반영된다. 다른 파일에 채널명 문자열을
  직접 쓰지 말 것. 로고 기호는 `CHANNEL_MARK`(현재 `?`).
- 인트로는 2초를 넘기지 않는다. 숏폼에서 인트로가 길면 그 자리에서 이탈한다.
- **`lang?: 'ko' | 'en'` prop (기본값 `'ko'`, 하위호환).** `channelName`/`mark`/`subscribeText`를
  명시적으로 안 넘기면 `theme.ts`의 `CHANNEL_NAME_BY_LANG[lang]` / `CHANNEL_MARK_BY_LANG[lang]` /
  `SUBSCRIBE_TEXT_BY_LANG[lang]`에서 자동으로 그 언어 값을 쓴다. 명시적으로 넘긴 값은 여전히 우선한다.
  builder가 언어별 렌더 시 `lang`을 안 넘기면 영어 영상에도 한국어 채널명이 나오므로,
  두 언어를 각각 렌더할 때 반드시 `lang="ko"` / `lang="en"`을 명시해서 넘긴다.
- 아웃트로의 `nextHint` 는 매 화 바뀌는 값이므로 반드시 props 로 넘긴다.

---

## 7. 오디오 (`assets/audio/`) - 코드 합성 효과음, 모든 프로필 공용

전부 **ffmpeg lavfi 필터(`anoisesrc`/`aevalsrc`)로 코드 합성**했다. 외부 음원(Freesound 등)은
상업 이용 라이선스 제약이 있어 쓰지 않는다(2026-08-08 조사 완결). 새 효과음이 필요하면 이 방식을
그대로 따른다 - 노이즈 버스트 계열(씹기·타격·마찰)은 `anoisesrc` + `highpass`/`lowpass` + `afade`,
톤 계열(딩·삑·스윕)은 `aevalsrc` 의 `sin()` 표현식으로 만든다. 전부 mono 44.1kHz mp3, 피크
-1~-3dBFS 대(클리핑 방지, 기존 딩 사운드 실측 피크 -3.1dB 기준에 맞춤), 길이 0.2~0.5초 내외로
짧게 유지한다 - 내레이션·자막을 방해하면 안 된다.

**렌더 시 주의**: `staticFile()` 은 각 에피소드의 `public/audio/` 를 기준으로 찾는다. 이 표의
`assets/audio/` 는 원본(레지스트리) 보관 위치이고, 실제 렌더가 파일을 찾으려면 에피소드별
`public/audio/` 에 **복사본**을 넣어야 한다(폰트가 `public/fonts/` 에 복사되는 것과 같은 패턴).

| 자산 | 경로(원본) | 종류 | 설명 | 길이 | 합성 방식 | 재사용 | 최초 |
|---|---|---|---|---|---|---|---|
| intro_ding | `audio/intro_ding.mp3` | 효과음 | 인트로 로고 뱃지 팝인 사운드. 후보 4종(a~d) 중 사용자가 b 선택, 정식 채택 | 0.28초 | ffmpeg `sine` 계열 신스(제작 스크립트는 보존 안 됨, encoder 메타데이터로 ffmpeg lavfi 합성 확인) | 모든 화 공용 브랜드 자산(Intro.tsx 에 내장) | ep01(후보 제작) / 2026-08-08 확정 반영 |
| outro_ding | `audio/outro_ding.mp3` | 효과음 | 아웃트로 구독 벨 팝인 사운드. 후보 3종(a~c) 중 사용자가 b 선택, 정식 채택 | 0.32초 | 위와 동일 | 모든 화 공용 브랜드 자산(Outro.tsx 에 내장) | ep01(후보 제작) / 2026-08-08 확정 반영 |
| bite | `audio/bite.mp3` | 효과음 | "아삭" 크런치. 흰 노이즈 버스트 2개를 90ms 간격으로 겹쳐 "씹는" 느낌을 냄 | 0.23초 | `anoisesrc=color=white` 2개(대역 1000~6500Hz, 1400~7500Hz) + `afade` 짧은 어택/디케이 + `adelay` 90ms 오프셋 + `amix` | **음식·씹기 소재 전반 재사용 가능** (과자·사과 등 다른 화에서도 그대로 쓸 수 있다) | general-ep01 |
| cold_zing | `audio/cold_zing.mp3` | 효과음 | 날카로운 "찌릿"한 시린/통증 느낌. 하이피치 상승 스윕 2겹(크리스탈 느낌) | 0.30초 | `aevalsrc` 선형 처프(chirp) `sin(2*PI*(f0*t+k*t^2))*exp(-decay*t)` 2개(3200->16200Hz, 4700->19700Hz 근사) 를 `amix`, 끝에 `afade` out | **순간적 통증·놀람 리액션 전반 재사용 가능** (감전·따끔거림 등 다른 화 리액션 연출에도 적용 가능) | general-ep01 |
| fizz_open | `audio/fizz_open.mp3` | 효과음 | 탄산음료 뚜껑을 딸 때 확 뿜어져 나오는 "치이익" 스프레이 느낌 | 0.35초(페이드 포함) | `anoisesrc=color=white` + `anoisesrc=color=pink` 2개를 서로 다른 대역(2600~9500Hz / 1800~7000Hz)으로 필터링, 25ms `adelay` 오프셋 후 `amix`, 양쪽 다 `afade` 짧은 어택/디케이. 실측 피크 -3.9dB(클리핑 없음) | **탄산·스프레이·분출류 리액션 전반 재사용 가능** (다른 화의 "확 뿜어져 나옴" 연출에도 적용 가능) | general-ep05 |
| chop | `audio/chop.mp3` | 효과음 | 칼로 도마 위 사물을 내려찍는 "탁" 소리. 저음 뭉툭한 타격(thump) + 짧은 고역 노이즈 트랜지언트(칼날이 스치는 질감)를 겹침 | 0.30초 | `aevalsrc` 저음 사인 감쇠파(`0.9*sin(2*PI*160*t)*exp(-38*t)`) + `anoisesrc=color=white`(대역 900~4200Hz, 90ms) 를 8ms 딜레이로 겹쳐 `amix`, 끝에 `afade` out | **칼질·타격 동작 전반 재사용 가능** (다른 재료를 써는 도입부 등) | general-ep04 |
| ui_tap | `audio/ui_tap.mp3` | 효과음 | 화면 속 버튼(정지/재생 등)을 탭하는 짧은 "톡" 클릭음. 사인파 한 번을 아주 짧게 끊음 | 0.10초 | `aevalsrc` 2200Hz 사인파 + `volume=15dB` + `alimiter`(클리핑 방지) + `afade` 아주 짧은 어택/디케이. 실측 피크 -3.2dB | **화면 UI 탭·버튼 누름 동작 전반 재사용 가능** (앱 화면·스위치·클릭 연출 등 무성 구간 액션에) | general-ep03 |
| realize_ding | `audio/realize_ding.mp3` | 효과음 | "어? 뭔가 알아챘다"는 발견의 순간에 쓰는 짧고 밝은 딩 한 번. cold_zing(날카로운 통증)과 달리 경쾌한 인지 신호 톤 | 0.30초 | `aevalsrc` 감쇠 사인 2겹(`0.42*sin(2*PI*1700*t)*exp(-13*t) + 0.27*sin(2*PI*2550*t)*exp(-15*t)`, 배음 관계로 종소리 느낌) + `afade` in 8ms/out 100ms + `alimiter`. 실측 피크 -4.2dB | **눈을 뜨거나 화면을 보다가 "어?" 하고 알아채는 발견·자각 리액션 전반 재사용 가능** (전구/느낌표 아이콘 팝인과 짝을 이루는 용도) | general-ep02(v5, s1 무성 재연출) |
| head_whoosh | `audio/head_whoosh.mp3` | 효과음 | 고개를 홱 돌리는 짧은 "휙" 바람 소리. 무성 구간(원칙 7)에 붙여 "지금 뭘 하는지"를 읽히게 한다 | 0.24초 | `anoisesrc=color=white`(대역 500~3800Hz) + `afade` in 20ms/out 100ms(iqsin) + `volume=-3dB`. 실측 피크 -5.6dB | **고개·시선을 빠르게 돌리는 무성 동작 전반 재사용 가능** | general-long01 |

효과음 볼륨은 내레이션(narration `volume=1.6`)보다 낮게(`volume=0.7~0.9`)두어 보조적인 느낌을
유지한다. 정확한 청취 판단(듣기 좋은지)은 사용자 몫이다 - Claude 는 ffprobe/volumedetect 로
"의도한 프레임에 정확히 재생되는지", "피크가 내레이션을 넘지 않는지"만 객관적으로 확인한다.

---

## 8. 공용 스크립트 (`scripts/`)

| 스크립트 | 설명 | 사용 |
|---|---|---|
| `tts.py` | edge-tts 로 구간별 mp3 + 어절 타임스탬프(WordBoundary) 생성 | `python scripts/tts.py --script script.json --out <ep>/public/audio --lang ko` |
| `rms_mouth.py` | mp3 -> 30fps 프레임별 입벌림 0~1 (RMS) | `python scripts/rms_mouth.py --audio <ep>/public/audio --prefix ko` |
| `sync_icons.mjs` | Tabler 아이콘을 로컬 캐시 JSON 으로 추출 | `npm run sync-icons` |

TTS·립싱크 근거와 실측 수치는 `/home/lee/project/아동지식채널/02_무료도구_실측검증.md` 참고.
요약: 자막 싱크는 edge-tts WordBoundary(오차 0), 립싱크는 RMS(52초를 0.16초에 처리),
whisper 는 외부 음성 자막화 등 예외 상황 전용.

---

## 9. 퍼둥이 파일럿 전용 자산 (신규 채널 - 굼구미/Whymo 와 무관, 별도 네임스페이스)

**이 절의 자산은 위 1~8절(굼구미/Whymo 공용 라이브러리)과 완전히 분리된 신규 채널 파일럿
전용이다.** `character/`·`props/`·`assets/index.ts` 배럴은 건드리지 않았고, 이 절의 컴포넌트는
그 배럴을 거치지 않고 자기 폴더에서 직접 import 한다(`assets/character-perdungi`,
`assets/props-perdungi`). 코드도 새로 작성했다(굼구미 Character/Actor 코드를 공유하지 않음) -
공유한 것은 `theme.ts` 의 색·레이아웃 토큰(`C`, `GROUND` 등, 프로젝트 공용 팔레트)과 `anim.ts`
의 결정적 유틸(`breathe`, `clamp01`, `easeIn`, `popIn`)뿐이다.

**v4(2026-08-10) 전면 재구축 - 9포즈, 원본 벡터 소스를 그대로 사용.** v1(2026-08-08)은 눈 위치
비율만 실측하고 몸통·귀·다리는 새로 창작해 원본과 많이 달랐다. v2~v3는 원본 PNG(`퍼둥이.png`)를
cv2 컨투어/육안 판독으로 "재실측"해 손으로 베지어를 새로 그렸지만 그때마다 충실도 지적을 받았다
("내가 준 캐릭터를 너무 변형시켰다"). **v2~v3의 이 서술은 전부 낡은 것이다 - 지금은 v4가 정본이고,
아래는 v4 기준으로만 읽는다.**

v4는 방식을 근본적으로 바꿨다. 사용자가 외부 AI에게 정밀 벡터 트레이싱을 맡겨 받은 **9개 포즈
SVG**(WSL 경로 `/mnt/c/Users/admin/Downloads/zip_session_ea059002ef719d05b2899021685160fc_86911b48ee649ad333d3b88be2e70974/`,
`01_뒤돌아보기.svg` ~ `09_기둥옆_조금만보임.svg`)를 **최종 정답 소스**로 삼고, 그 SVG의
`<path d="...">` 값을 좌표 재계산·재해석 없이 **그대로** 옮겼다(`character-perdungi/poseArt.ts`).
이 9개 SVG는 potrace류 트레이서 산출물이라 몸통·눈·코·입이 색상/id로 분리돼 있지 않고, 포즈 1개당
1~10개의 `<path>`(전부 fill=#000000 단색 잉크)로 이미 합쳐진 완성 아트워크다 - v1~v3처럼 "몸통
fill + 눈/코/입 파츠를 따로 겹쳐 그리는" 조립식이 아니라 **포즈 전체가 하나의 완성 그림**이다.

이 구조 때문에 v4는 v3까지 있던 프레임 단위 표정 파라미터(`eyeOpen` 깜빡임, `mouthOpen` 입벌림,
`eyeWide` 눈확대, `earPerk`)를 지원하지 않는다 - 원본이 눈·코·입을 독립 도형으로 안 줘서, 이걸
흉내내려면 다시 "재해석"(원본에 없는 도형을 창작)해야 하기 때문이다. 대신 **9개 포즈 중 스토리에
맞는 포즈로 전환**하는 만화컷 같은 연출로 감정을 표현한다. 유지한 파라미터는 `lean`(몸 전체
회전 - path를 안 건드리고 group rotate만 적용)과 `color`(단색 잉크 색상 교체)뿐이다.

Actor 배치용 앵커(`cx`/`feetY`, 발끝 정렬)와 이펙트 타겟팅용 얼굴 중심(`faceX`/`faceY`, 눈+코+입
뭉치)은 이 9개 SVG **자체를 cairosvg로 래스터화해 측정**한 값이다(원본 PNG 재실측이 아니라 이
SVG의 렌더 결과 측정 - 캐릭터 형태 자체엔 관여하지 않는 순수 레이아웃 좌표). `pillarNarrow`/
`pillarPeek`는 기둥에 얼굴이 대부분 가려 자동 검출이 안 돼 근사값(bboxTop + 0.35*bboxH)을 썼다
(`poseArt.ts` 상단 주석에 `faceIsFallback: true`로 표시). 측정 절차는 `character-perdungi/
Character.tsx`/`poseArt.ts` 파일 상단 주석 참고.

9개 소스 SVG와 실제 렌더 결과(Remotion Character 컴포넌트 출력)를 나란히 놓은 대조 시트:
`character-perdungi/comparison-sheet-v4.png` (구버전 `comparison-sheet.png`/`comparison-sheet-v3.png`는
v2/v3 산출물이라 더 이상 정본이 아니다 - 지우지 않고 남겨뒀지만 참고하지 말 것).

**v5(2026-08-10) 부위 분리 리깅 - 몸통이 한 덩어리라 움직임이 딱딱하다는 피드백 반영.**
`poseArt.ts`(v4, 불변 - 원본 소스)의 `<path d>` 값을 좌표 재계산 없이 svgpathtools로 subpath
파싱 -> 위치/면적/winding 기하 분석으로 body/face/armRight 재분류한 결과가
`character-perdungi/poseRig.ts`(신규)다. **stand/cry 2포즈에서만 오른팔(armRight) 분리에
성공했다** - 원본 몸통 링이 팔까지 포함한 하나의 연속 윤곽선이라, 팔이 몸통에 붙는 실제 절단
지점(진행 경로가 급격히 꺾이는 정점)을 찾아 그 지점에서 잘라 별도 링으로 재구성했다(이음매는
body 레이어에 가려짐 - 표준 2D 컷아웃 리깅, 새 좌표 발명 아님). **face(눈+코+입 뭉치)는
lookback/think/wine/dizzy/stand/cry/pillarWide 7포즈에서 분리 성공**(원본에서 이미 몸통과
물리적으로 분리된 별도 잉크 영역이라 절단 불필요, faceX/faceY 앵커 기준 자동 분류).
pillarNarrow/pillarPeek는 기둥에 가려 원본 자체가 몸통과 한 덩어리라 분리 불가. lookback/
dizzy/wine의 팔·pillarWide/Narrow/Peek의 다리는 몸통과의 경계가 뚜렷하지 않거나 확신도가
낮아 보류(poseRig.ts 상단 주석 및 Character.tsx 상단 주석에 포즈별 성공/보류 사유 명시).
Character.tsx가 body(숨쉬기 scale 진동)·armRight(어깨 이음매 중심 회전)·face(미세 sway)를
각각 독립 `<g>`로 렌더하고 frame 기반 결정적 사인파로 미세 애니메이션을 준다(Math.random
미사용, 이 컴포넌트 전용 신규 구현 - `anim.ts`의 `breathe`와 별개 레이어). 포즈 전환
크로스페이드는 캐릭터 코드가 아니라 이 화의 `scenes.tsx`(에피소드 로컬, 라이브러리 미승격)에
있다 - 두 포즈의 회전각이 비슷할 때만(stand<->lookback, BeatSpray 내부 lookback<->dizzy)
자연스럽게 녹았고, dizzy(회전된 실루엣)<->cry(직립 실루엣)는 겹쳐보니 오히려 지저분해 하드컷을
유지했다(실측 관찰 기반 판단, 99-build-report.md 12절 참고).

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| Character(퍼둥이) | `character-perdungi/Character.tsx` | 캐릭터 | 9개 원본 SVG의 path 데이터를 body/face/armRight로 재분류해(`poseRig.ts`) 독립 `<g>`로 렌더. 몸통 숨쉬기·팔 흔들림·얼굴 sway 자동 적용(frame 기반 결정적) | `width` `height` `pose`(9종 - 아래) `lean` `color` `style` | 폐기됨(구 perdungi-pilot-squid-ink v4/리깅v5), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| POSE_ART / PoseId9 | `character-perdungi/poseArt.ts` | 데이터 | 9포즈 원본 path·viewBox·앵커(cx/feetY/faceX/faceY) 테이블(불변 소스). 포즈 id: `lookback`(01 뒤돌아보기, 앉아서 옆을 보는 자세+팔 제스처) `think`(02 생각중, 전구) `wine`(03 와인 들고 서있기) `dizzy`(04 거꾸로/어지러움, 별 표시) `stand`(05 서있기, 기본 정지 자세) `cry`(06 우는중, 눈물/웅덩이) `pillarWide`/`pillarNarrow`/`pillarPeek`(07/08/09, 기둥 옆에 많이/좁게/조금만 보이는 자세 - 몰래 등장·인트로/아웃트로 연출용) | - | 폐기됨(구 perdungi-pilot-squid-ink v4), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| POSE_RIG / PoseRig | `character-perdungi/poseRig.ts` | 데이터 | 9포즈를 body/face/armRight(+armPivotRaw 어깨 회전중심)로 재분류한 결과(poseArt.ts에서 프로그램적으로 생성, 좌표 재창작 없음). 다음 화가 이 캐릭터의 팔/얼굴을 독립 조작하려면 여기부터 확인 | - | 폐기됨(구 perdungi-pilot-squid-ink v5), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| Actor(퍼둥이) | `character-perdungi/Actor.tsx` | 캐릭터 | 발끝 정렬 배치기 + 호흡(breathe) 자동 적용. `POSE_ART[poseId]`에서 직접 anchor를 읽어 3포즈 하드코딩 분기 없음 | `size` `centerX` `ground` `pose` `breathAmp` `color` `style` | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| faceScreenCenter | `character-perdungi/Actor.tsx` | 유틸 | size/centerX/poseId 기준 얼굴(눈+코+입 뭉치) 중심의 화면 좌표 반환(먹물 등 이펙트 정렬용). v4부터 poseId 필수 인자 | `(size, centerX, ground?, poseId)` | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| PERDUNGI_POSES | `character-perdungi/poses.ts` | 캐릭터 | 9개 원본 포즈 전부를 lean=0 기본값으로 노출 - 다음 화가 이 캐릭터를 쓸 때는 여기부터 확인 | - | 폐기됨(구 perdungi-pilot-squid-ink v4), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| SQUID_PILOT_BEAT_POSE | `character-perdungi/poses.ts` | 캐릭터 | 오징어 먹물 파일럿 전용 - 스토리 비트별로 고른 포즈 매핑(feed→stand, watch→lookback, impact→dizzy, aftermath→cry) | - | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| Squid | `props-perdungi/Squid.tsx` | 소품 | 오징어(외투막+지느러미+눈+다리 다발+입/부리 점). `squeeze` 로 분사 직전 움츠림 | `width` `squeeze` `stroke` `fill` `style` | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| InkSpray | `props-perdungi/Squid.tsx` | 소품 | 입에서 목표 지점까지 날아가는 먹물 방울(고정 배열 기반, Math.random 미사용) - "먹물/액체를 뿜는" 소재 전반 재사용 가능 | `originX` `originY` `targetX` `targetY` `progress` `color` | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| InkSplatFace | `props-perdungi/Squid.tsx` | 소품 | 명중 후 얼굴에 남는 얼룩(눈 구멍 2개만 뚫려 캐릭터 눈이 비침 - 징그럽지 않게 하는 핵심 장치) + 흘러내리는 물방울 | `x` `y` `size` `progress` `dripProgress` `eyeGap` `color` | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |

배럴이 없어(굼구미 `assets/index.ts` 미변경) import 는 폴더에서 직접 한다:
```tsx
import { Actor, SQUID_PILOT_BEAT_POSE, PoseId9 } from '../../../assets/character-perdungi';
import { Squid, InkSpray, InkSplatFace } from '../../../assets/props-perdungi';
```

### 오디오(신규 SFX, `assets/audio/` 에 원본 보관 - 위 7절 표와 같은 위치, 공용 재사용 가능)

| 자산 | 경로(원본) | 설명 | 길이 | 합성 방식 | 재사용 | 최초 |
|---|---|---|---|---|---|---|
| feed_gulp | `audio/feed_gulp.mp3` | 액체를 먹이는 "글룩글룩" 소리. 하강 피치 사인 2회(90ms 오프셋) | 0.33초 | `aevalsrc` 하강 처프 2겹 + `adelay` + `amix` + `afade` + `alimiter`. 실측 피크 -4.8dB | **먹이다/마시다 소재 전반 재사용 가능** | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| anticipate_pop | `audio/anticipate_pop.mp3` | 기대감을 나타내는 밝은 "뿅" 상승 치프 | 0.22초 | `aevalsrc` 상승 처프 1겹 + `afade` + `alimiter`. 실측 피크 -4.4dB | **기대·설렘 리액션 전반 재사용 가능** | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| ink_splat | `audio/ink_splat.mp3` | 액체가 얼굴에 정통으로 맞는 "철퍽" 소리. 저음 thump + 필터링된 젖은 노이즈 | 0.28초 | `aevalsrc` 저음 감쇠 사인 + `anoisesrc=color=brown`(lowpass 1400Hz/highpass 150Hz) + `amix` + `afade` + `alimiter` + `volume=-2.5dB`. 실측 피크 -2.8dB | **액체가 얼굴/사물에 정통으로 맞는 임팩트 전반 재사용 가능** | 폐기됨(구 perdungi-pilot-squid-ink), 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10) |
| hop_thump | `audio/hop_thump.mp3` | 가벼운 착지음("통") - 캐릭터가 제자리 홉·점프에서 바닥에 닿는 순간 | 0.15초 | `aevalsrc` 저음(85Hz) 감쇠 사인 + `anoisesrc=color=brown`(highpass 150Hz/lowpass 900Hz, volume 0.5) + `amix` + `afade` + `volume=6dB` + `alimiter`. 실측 피크 -2.3dB | **홉·점프·착지 등 캐릭터 움직임 전반 재사용 가능**(발소리류) | perdungi-demo-dynamic (최초 제작은 구 perdungi-demo-active, 폐기됨 - 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10). 오디오 자체는 perdungi-demo-dynamic이 계속 재사용 중이라 유지) |

### 다운로드 벡터 소스 (`assets/research/downloads/motion-effects/`) - 원칙 0-1 적용 사례

라이선스가 확인된(CC BY 3.0 / Public Domain-CC0) 모션 이펙트 SVG를 다운로드해 출처를 실측
기록해뒀다(`assets/research/downloads/motion-effects/SOURCES.md`에 다운로드 페이지·라이선스
URL·저작자 전부 명시). **path/polygon 좌표를 눈대중으로 다시 그리지 않고 그대로 가져다 쓰는
것이 원칙**(위 원칙 0-1)이라 이 폴더의 파일들은 코드로 옮길 때 좌표 재해석을 하지 않는다.
`DustCloud`/`ImpactBurst`(위 표)가 이 소스 중 2개(`openclipart-simple-dust-cloud.svg`,
`openclipart-comic-burst-explosion-abstract-005.svg`)를 이미 통합했다. 나머지
(`gameicons-dust-cloud.svg`, `gameicons-impact-point.svg`, `openclipart-swirl-motion-lines.svg`,
`gameicons-whirlwind.svg`)는 아직 코드로 통합되지 않은 후보 - 소용돌이/방향전환류 이펙트가
필요해지면 여기서 먼저 확인할 것. `openclipart-trailing-lines.svg`/`freesvg-whoosh.svg`는
필터 기반이거나 타이포그래피라 단순 path 통합에 부적합하다고 SOURCES.md에 이미 판정돼 있다 -
다시 조사하지 말 것. game-icons.net(Lorc) 소스를 실제 영상에 쓸 경우 크레딧 표기
"Icons by Lorc (game-icons.net), CC BY 3.0"가 필요하다(SOURCES.md에 명시).

### 데모 화 (스토리 없는 캐릭터/리그 데모, 굼구미 파이프라인과 무관)

| 화 | 경로 | 목적 | 사용 포즈·기법 |
|---|---|---|---|
| ~~perdungi-demo-active~~ (폐기됨, 폴더 삭제됨) | `episodes/perdungi-demo-active/` (삭제됨) | 폐기됨, 이유: 팔다리 애니메이션 방향 접음, 정적 포즈 방식으로 전환(2026-08-10). v5 부위분리 리그(body 숨쉬기·armRight 흔들림·face sway)를 보여주는 7초 무언극 데모였음. 새 팔다리 동작 창작 없이 기존 9포즈 중 stand/lookback/dizzy만 재사용 | 제자리 홉(squash&stretch) + stand<->lookback 크로스페이드(파일럿 v5에서 검증된 조합 재사용) + 점프 정점에서 dizzy 하드컷(공중 스핀 암시) + 카메라 전체 bounce 펄스. `poseBlend()` 헬퍼(이벤트 배열 기반 크로스페이드, 이 화 로컬)는 다음 화가 여러 번 포즈를 스위칭할 때 재사용 가능 |
| perdungi-demo-dynamic | `episodes/perdungi-demo-dynamic/` | perdungi-demo-active의 MotionSwoosh가 "너무 작다"는 피드백을 받아, 제자리 홉 반복 대신 단일 큰 도약->착지 1회로 단순화하고 `DustCloud`/`ImpactBurst`(큰 임팩트 이펙트)를 얹은 5초 무언극 데모 | 크라우치->도약->정점(dizzy 하드컷)->낙하->착지(bounceIn recoil) 물리는 perdungi-demo-active의 BeatJump 곡선을 그대로 재사용(좌표 재발명 없음). 도약 순간(frame 15) 작은 DustCloud, 착지 순간(frame 90) 큰 DustCloud+ImpactBurst 동시 발동 + hop_thump SFX 2회(도약 약하게/착지 강하게) |

---

# 새 자산을 추가할 때 지키는 규칙

이 규칙은 앞으로 다른 에이전트가 읽고 따른다. 순서대로 수행한다.

## 규칙 1. 먼저 이 문서를 검색한다

만들기 전에 위 표에서 같은 역할의 자산을 찾는다. 이름이 달라도 역할이 같으면 그것을 쓴다.
없을 때만 새로 만든다. **비슷한 것을 하나 더 만드는 것이 가장 흔한 실패다.**

## 규칙 2. 폴더를 고른다

| 넣을 곳 | 기준 | 예 |
|---|---|---|
| `character/` | 마스코트 본체·포즈·배치기. **새 캐릭터를 만들지 않는다** | 새 포즈 프리셋 |
| `scenes/` | **에피소드 내용을 몰라도 성립하는 연출 부품** | 타임라인, 순위표, 진행바 |
| `props/` | 화면에 등장하는 사물·동물·기호 그림 | 화산, 심장, 태양계 |
| `backgrounds/` | 화면 전체를 덮는 배경 | 도시, 사막, 세포 내부 |
| `brand/` | 채널 고정 구간 | 워터마크, 챕터 타이틀 |

판단이 애매하면 이렇게 가른다. **"다음 화에서 텍스트만 바꿔 그대로 쓸 수 있나?"**
- 그렇다 -> `scenes/`
- 그림 자체가 그 주제 전용이다 -> `props/` (그래도 라이브러리에 보존한다. 기린·쥐·고래도
  1화 전용이었지만 동물 편에서 다시 쓴다)
- 이 화에서만 성립한다 -> 라이브러리에 넣지 말고 `episodes/<화>/src/scenes.tsx` 에 둔다

## 규칙 3. props 로 반드시 노출할 것

하드코딩된 좌표·색·크기를 그대로 옮기지 않는다. 최소한 아래는 props 여야 한다.

1. **위치**: `x` `y` (또는 배치기를 쓰는 경우 `centerX` `ground`)
2. **크기**: `width` 또는 `size`. 내부는 viewBox 로 비율 유지
3. **색**: 선 `stroke`(또는 `color`), 채움 `fill`, 액센트 `spot`/`accent`.
   기본값은 반드시 `theme.ts` 의 `C.*` 토큰이어야 한다. 리터럴 색상 코드를 기본값으로 쓰지 않는다
4. **선 굵기**: `strokeWidth`, 기본값 `SW`
5. **시간**: 애니메이션이 있으면 `frame` 또는 `progress`(0~1) 중 하나를 받는다.
   컴포넌트 안에서 `useCurrentFrame()` 을 직접 부르면 `Sequence` 안에서 재사용할 때 타이밍이
   어긋난다. 배치기(`Actor`, `BustActor`)만 예외다
6. **텍스트**: 화면에 나오는 문구는 전부 props. 컴포넌트 안에 한국어 문자열을 박지 않는다
   (다국어 전환과 다음 화 재사용을 동시에 막는다)

## 규칙 4. 결정론을 지킨다

- `Math.random()` 금지. 무작위가 필요하면 `NightSkyBg`/`OceanBg` 처럼 시드 기반 PRNG 를 쓰고
  `React.useMemo` 로 고정한다. 프레임마다 값이 달라지면 화면이 떨린다
- `Date.now()` 금지
- 프레임 -> 값 계산은 순수 함수여야 한다 (같은 프레임이면 항상 같은 결과)

## 규칙 5. 등록 절차

1. 파일을 알맞은 폴더에 만든다. 파일 상단에 **무엇이고 왜 이렇게 만들었는지** 주석을 단다
2. 해당 폴더의 `index.ts` 에 export 를 추가한다 (타입도 함께)
3. **이 문서의 표에 한 줄 추가**한다. 열은 `자산 / 경로 / 종류 / 설명 / props / 최초`.
   `최초` 에는 그 자산을 처음 만든 에피소드 식별자를 적는다 (`ep03` 등)
4. `src/Catalog.tsx` 에 한 칸 추가한다
5. `npx tsc --noEmit` 통과 확인
6. 카탈로그를 다시 렌더해 **눈으로 확인**한다
   ```bash
   npx remotion still src/index.ts Catalog out/catalog.png --frame=60
   ```
   기존 자산이 깨지지 않았는지도 같이 본다

## 규칙 6. 기존 자산을 고칠 때

- 기존 화가 이미 쓰고 있으므로 **props 를 제거하거나 기본값을 바꾸지 않는다.**
  동작을 바꿔야 하면 새 props 를 추가하고 기본값은 기존 동작으로 둔다
- 고친 뒤 카탈로그를 다시 렌더해 회귀를 확인한다
- 에피소드 폴더로 파일을 복사해서 고치지 않는다. 그렇게 하면 자산이 갈라진다

## 규칙 7. 외부 아이콘 추가

렌더 중에는 네트워크를 쓰지 않는다. 새 아이콘이 필요하면 캐시에 넣는다.

```bash
node scripts/sync_icons.mjs volcano wave-sawtooth   # scripts/icons.txt 에 누적된다
```

- 출처는 **Tabler Icons(MIT)** 로 통일한다. 라이선스가 다른 아이콘 세트를 섞지 않는다
- 캐시에 없는 이름을 `ThemedIcon` 에 주면 코랄 점선 상자로 눈에 띄게 표시된다.
  렌더가 끝난 뒤 발견하는 것을 막기 위한 장치다. 조용히 넘어가게 고치지 말 것
- 선 굵기는 `strokePx`(기본 `SW`=13px)로 **화면상 절대 두께**를 맞춘다.
  Tabler 원본의 `stroke-width="2"` 는 요소 속성이라 상속으로 못 덮으므로 문자열 치환으로 바꾼다

## 규칙 8. 스타일 일관성

새 그림은 기존 자산 옆에 놓아도 튀지 않아야 한다.

- 선: `C.ink` / `strokeWidth: SW` / `strokeLinecap="round"` / `strokeLinejoin="round"`
- 채움: `C.paper` (흰색), 액센트는 `C.coral` 또는 `C.gold`
- 그림자·그라데이션·둥근 모서리 남발 금지. 배경의 아주 옅은 세로 그라데이션만 허용
- viewBox 는 화면 픽셀과 1:1 로 잡는다. 그래야 `SW` 를 그대로 써도 캐릭터와 굵기가 맞는다
- 이미지 파일(png/jpg) 자산을 쓰지 않는다. 전부 코드로 그린다 (해상도 자유, diff 가능)
