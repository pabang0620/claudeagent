# episodes/

에피소드별 Remotion 프로젝트가 들어가는 자리다. 폴더 하나 = 영상 한 편.

여기 있는 코드는 **에피소드 전용**이다. 다음 화에서도 쓸 만한 것을 여기에 두면 다음 화에서
다시 짜게 된다. 재사용 가능한 것은 `../assets/` 로 올리고 `../assets/REGISTRY.md` 에 등록할 것.

## 폴더 구조

```
episodes/<프로필>-ep<NN>-<주제슬러그>/     예) kids-ep02-giraffe-neck, science-ep01-quantum
├── script-ko.json        구간별 한국어 대본 (tts.py 입력)
├── script-en.json        구간별 영어 대본 (tts.py 입력)
├── public/
│   ├── audio/             tts.py / rms_mouth.py 산출물, 언어별 접두사
│   │   ├── ko_<id>.mp3, ko_words.json, ko_mouth.json
│   │   └── en_<id>.mp3, en_words.json, en_mouth.json
│   └── fonts/             ../../public/fonts 에서 복사 또는 심볼릭 링크
├── src/
│   ├── index.ts           registerRoot
│   ├── Root.tsx            Composition 등록 (locale prop 으로 ko/en 분기)
│   ├── Episode.tsx         본편 조립 (Intro + 장면들 + Outro, locale 을 받아 Intro/Outro 의 lang 으로 그대로 전달)
│   ├── scenes.tsx          이 화 전용 장면들 (언어 무관 - 문구는 strings.ts 에서 읽는다)
│   └── strings.ts          이 화 전용 화면 문구, { ko: {...}, en: {...} } 구조
├── package.json
├── remotion.config.ts
└── out/
    ├── episode-ko.mp4, frames-ko/
    └── episode-en.mp4, frames-en/
```

이 채널은 한국어 채널(굼구미)과 영어 채널(Whymo)을 별도 운영하므로 **에피소드 1개의 완성 산출물은 mp4 2개**다. 한쪽만 렌더하고 끝내지 않는다. 상세 근거는 `.claude/skills/shortform/references/pipeline.md`.

## 제작 순서

1. **대본 확정** -> `script-ko.json`, `script-en.json` (둘 다 작성. 영어는 한국어 직역이 아니라 재작성)
   ```json
   [{"id": "s1", "text": "..."}, {"id": "s2", "text": "..."}]
   ```
2. **음성 + 어절 타임스탬프** (언어별로 각각 실행)
   ```bash
   python ../../scripts/tts.py --script script-ko.json --out public/audio --lang ko
   python ../../scripts/tts.py --script script-en.json --out public/audio --lang en
   ```
3. **립싱크 값** (언어별로 각각)
   ```bash
   python ../../scripts/rms_mouth.py --audio public/audio --prefix ko
   python ../../scripts/rms_mouth.py --audio public/audio --prefix en
   ```
4. **타임코드 확정** - `assets/timeline.ts` 의 `sceneFrames(segments, pad)` 로 **언어별로 각각** 실측 길이에서 뽑는다.
   기획 문서의 예상 길이가 아니라 **실측 발화 길이**를 기준으로 한다. 음성을 늘리거나 줄여
   문서에 맞추지 않는다. 두 언어의 발화 길이가 다르므로 타임코드도 다르게 나오는 게 정상이다 -
   한쪽 타임코드를 다른 쪽에 그대로 복사하지 않는다.
5. **장면 조립** - `assets/REGISTRY.md` 를 먼저 읽고 재사용할 자산을 정한 뒤 부족한 것만 새로 만든다.
   자산(캐릭터·소품·배경·씬)은 언어 무관 공용이라 한 번만 만든다.
6. **인트로·아웃트로 부착** - `Intro lang={locale}` / `Outro lang={locale}` 를 `Sequence` 로 앞뒤에
   붙인다. **`lang` 을 반드시 명시한다** - 안 넘기면 기본값이 `'ko'`라서 영어 영상에도 한국어
   채널명이 나온다.
7. **렌더 (언어별로 각각) -> 대표 프레임 육안 검수** -> 결함 있으면 고치고 재렌더.
   한 언어만 렌더하고 다음 단계로 넘어가지 않는다.

## 자산 import 규약

하위 파일을 직접 가리키지 말고 배럴에서 가져온다.

```tsx
import { Actor, POSES, Caption, SavannaBg, Intro, Outro, C, FontLoader } from '../../../assets';
```

## 본편 조립 뼈대

```tsx
const scenes = [
  { Component: S1, frames: SCENE_FRAMES[0] },
  { Component: S2, frames: SCENE_FRAMES[1] },
];
const starts = sceneStarts(SCENE_FRAMES);

<AbsoluteFill>
  <FontLoader />
  <SavannaBg pan={pan} />
  <SceneSwitcher scenes={scenes} starts={starts} />
  {segments.map((seg, i) => (
    <Sequence key={seg.id} from={starts[i]} durationInFrames={SCENE_FRAMES[i]} layout="none">
      <Audio src={staticFile(`audio/ko_${seg.id}.mp3`)} volume={1.5} />
    </Sequence>
  ))}
  <Caption line={line} t={t} />
</AbsoluteFill>
```

인트로·아웃트로까지 포함한 전체 타임라인은 `Intro`(`INTRO_FRAMES`, 현재 69F) -> 본편 -> `Outro`
(`OUTRO_FRAMES`, 현재 90F) 순으로 `Sequence` 를 겹치지 않게 이어 붙인다. 프레임 수는 상수로
가져다 쓰고 하드코딩하지 않는다 - 두 상수는 브랜드 구간이 조정될 때마다 바뀔 수 있다.

## 하지 말 것

- 1화 프로젝트(`/tmp/.../remotion-kids-ep01/`)를 통째로 복사해 고쳐 쓰기.
  그렇게 하면 이 라이브러리를 안 쓰게 되고 자산이 다시 갈라진다.
- 자산 파일을 에피소드 폴더 안으로 복사해서 수정하기. 고쳐야 하면 `assets/` 원본을 고치고
  기존 화가 깨지지 않는지 카탈로그를 다시 렌더해 확인한다.
- `theme.ts` 를 거치지 않은 색·선굵기 하드코딩.
