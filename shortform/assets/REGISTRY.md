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

import 는 항상 배럴에서 한다. 하위 파일 경로를 직접 쓰지 않는다.

```tsx
import { Actor, POSES, Caption, SavannaBg, Intro, Outro, C, SW, FontLoader } from '../../assets';
```

---

## 1. 토큰·유틸 (assets 루트)

| 자산 | 경로 | 종류 | 설명 | 주요 export | 최초 |
|---|---|---|---|---|---|
| theme | `theme.ts` | 토큰 | 색·영상규격·선굵기·레이아웃·타이포·자막스타일·채널명 SSOT | `C`, `W/H/FPS`, `SW/SW_THIN`, `GROUND/FEET_VB`, `CAP_BOTTOM/CAP_SIDE`, `RADIUS`, `FONT/FS`, `CAPTION_STYLE`, `CHANNEL_NAME/CHANNEL_MARK/SUBSCRIBE_TEXT` | ep01 |
| anim | `anim.ts` | 유틸 | 프레임 -> 값 결정적 변환 (Math.random 금지) | `eyeOpenAt`, `breathe`, `sway`, `popIn`, `easeIn`, `bounceIn`, `progress`, `shake`, `clamp01`, `blendPose` | ep01 |
| timeline | `timeline.ts` | 유틸 | 음성 타임스탬프 -> 화면 타이밍. 에피소드 데이터를 인자로 받고 import 하지 않는다 | `sceneFrames`, `sceneStarts`, `totalFrames`, `wordFrame`, `makeWordFrame`, `mouthAt`, `mouthProp`, `buildCaptions`, `locate` | ep01 |
| FontLoader | `FontLoader.tsx` | 유틸 | 폰트를 `delayRender` 로 붙잡고 로드. 컴포지션 최상단에 1회 | props: `fonts` | ep01 |

**색 토큰** (`C`): `ink` `inkSoft` `coral` `coralSoft` `gold` `goldSoft` `paper` `sky` `hill` `hillFar`
`water` `room` `roomDeep` `seaTop` `seaDeep` `leaf` `night` `nightMid` `nightSoft` `cream`

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
| CountUp | `scenes/Counter.tsx` | 씬 | 0에서 목표값까지 올라가는 숫자 | `x` `y` `to` `from` `at` `duration` `frame` `size` `color` `digits` `prefix` `suffix` `width` `align` | ep01 |
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

---

## 5. 배경 (`assets/backgrounds/`)

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| PlainBg | `backgrounds/PlainBg.tsx` | 배경 | 기본형. 단색 + 아주 옅은 세로 그라데이션 + 선택적 바닥선 | `top` `bottom` `stop` `ground` `groundColor` `floor` `floorOpacity` | 신규 |
| SavannaBg | `backgrounds/SavannaBg.tsx` | 배경 | 사바나·야외. 나무 배치·시차·물웅덩이·밤 오버레이 | `pan` `pond` `night` `sun` `ground` `trees[]` `skyTop` `skyBottom` `hillColor` `hillFarColor` `waterColor` | ep01(일반화) |
| NightSkyBg | `backgrounds/NightSkyBg.tsx` | 배경 | 우주·밤하늘. 별(고정 시드) + 달 차오름 + 선택적 지평선 | `stars` `seed` `frame` `moon` `moonX` `moonY` `moonR` `horizon` `top` `bottom` `starColor` `horizonColor` | 신규 |
| LabBg | `backgrounds/LabBg.tsx` | 배경 | 실내·실험실. 선반 + 유리병 실루엣 + 벽 격자 | `wall` `wallDeep` `line` `liquid` `ground` `shelves[]` `grid` | 신규 |
| OceanBg | `backgrounds/OceanBg.tsx` | 배경 | 바다. 수면 물결 + 거품 + 해저 모래 | `surface` `seabed` `bubbles` `seed` `frame` `skyColor` `waterTop` `waterDeep` `sandColor` `lineColor` | 신규 |

배경 공통 규칙: 캐릭터(잉크 라인 + 흰 채움)가 묻히지 않도록 **채도를 낮게** 유지한다.
어두운 배경(NightSkyBg)에서는 캐릭터를 `SpotlightCircle` 안에 넣거나 `color` 를 밝게 바꾼다.

---

## 6. 브랜드 (`assets/brand/`)

| 자산 | 경로 | 종류 | 설명 | props | 최초 |
|---|---|---|---|---|---|
| Intro | `brand/Intro.tsx` | 브랜드 | 인트로 54프레임(1.8초). 캐릭터가 튀어오르며 링·반짝임, 로고 뱃지 -> 채널명 -> 밑줄. `lang`으로 언어별 채널명·로고기호 자동 전환 | `channelName` `mark` `tagline` `durationInFrames` `bgTop` `bgBottom` `accent` `lang` | 신규 |
| Outro | `brand/Outro.tsx` | 브랜드 | 아웃트로 75프레임(2.5초). 다음 편 예고 카드 + 구독 유도(종) + 손 흔드는 캐릭터. `lang`으로 언어별 채널명·구독문구 자동 전환 | `nextHint` `nextTitle` `subscribeText` `channelName` `durationInFrames` `dark` `accent` `lang` | 신규 |

- `INTRO_FRAMES = 54`, `OUTRO_FRAMES = 75` 상수를 함께 export 한다. 타임라인 계산에 쓸 것.
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

## 7. 공용 스크립트 (`scripts/`)

| 스크립트 | 설명 | 사용 |
|---|---|---|
| `tts.py` | edge-tts 로 구간별 mp3 + 어절 타임스탬프(WordBoundary) 생성 | `python scripts/tts.py --script script.json --out <ep>/public/audio --lang ko` |
| `rms_mouth.py` | mp3 -> 30fps 프레임별 입벌림 0~1 (RMS) | `python scripts/rms_mouth.py --audio <ep>/public/audio --prefix ko` |
| `sync_icons.mjs` | Tabler 아이콘을 로컬 캐시 JSON 으로 추출 | `npm run sync-icons` |

TTS·립싱크 근거와 실측 수치는 `/home/lee/project/아동지식채널/02_무료도구_실측검증.md` 참고.
요약: 자막 싱크는 edge-tts WordBoundary(오차 0), 립싱크는 RMS(52초를 0.16초에 처리),
whisper 는 외부 음성 자막화 등 예외 상황 전용.

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
