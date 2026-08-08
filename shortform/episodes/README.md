# episodes/

에피소드별 Remotion 프로젝트가 들어가는 자리다. 폴더 하나 = 영상 한 편.

여기 있는 코드는 **에피소드 전용**이다. 다음 화에서도 쓸 만한 것을 여기에 두면 다음 화에서
다시 짜게 된다. 재사용 가능한 것은 `../assets/` 로 올리고 `../assets/REGISTRY.md` 에 등록할 것.

## 폴더 구조

```
episodes/<프로필>-ep<NN>-<주제슬러그>/     예) kids-ep02-giraffe-neck, science-ep01-quantum
├── script.json          구간별 대본 (tts.py 입력)
├── public/
│   ├── audio/           tts.py / rms_mouth.py 산출물 (mp3, *_words.json, *_mouth.json)
│   └── fonts/           ../../public/fonts 에서 복사 또는 심볼릭 링크
├── src/
│   ├── index.ts         registerRoot
│   ├── Root.tsx         Composition 등록
│   ├── Episode.tsx      본편 조립 (Intro + 장면들 + Outro)
│   ├── scenes.tsx       이 화 전용 장면들
│   └── strings.ts       이 화 전용 화면 문구 + 자막 줄 나누기 규칙
├── package.json
├── remotion.config.ts
└── out/                 렌더 산출물
```

## 제작 순서

1. **대본 확정** -> `script.json`
   ```json
   [{"id": "s1", "text": "..."}, {"id": "s2", "text": "..."}]
   ```
2. **음성 + 어절 타임스탬프**
   ```bash
   python ../../scripts/tts.py --script script.json --out public/audio --lang ko
   ```
3. **립싱크 값**
   ```bash
   python ../../scripts/rms_mouth.py --audio public/audio --prefix ko
   ```
4. **타임코드 확정** - `assets/timeline.ts` 의 `sceneFrames(segments, pad)` 로 실측 길이에서 뽑는다.
   기획 문서의 예상 길이가 아니라 **실측 발화 길이**를 기준으로 한다. 음성을 늘리거나 줄여
   문서에 맞추지 않는다.
5. **장면 조립** - `assets/REGISTRY.md` 를 먼저 읽고 재사용할 자산을 정한 뒤 부족한 것만 새로 만든다.
6. **인트로·아웃트로 부착** - `Intro` / `Outro` 를 `Sequence` 로 앞뒤에 붙인다.
7. **렌더 -> 대표 프레임 육안 검수** -> 결함 있으면 고치고 재렌더.

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

인트로·아웃트로까지 포함한 전체 타임라인은 `Intro`(54F) -> 본편 -> `Outro`(75F) 순으로
`Sequence` 를 겹치지 않게 이어 붙인다.

## 하지 말 것

- 1화 프로젝트(`/tmp/.../remotion-kids-ep01/`)를 통째로 복사해 고쳐 쓰기.
  그렇게 하면 이 라이브러리를 안 쓰게 되고 자산이 다시 갈라진다.
- 자산 파일을 에피소드 폴더 안으로 복사해서 수정하기. 고쳐야 하면 `assets/` 원본을 고치고
  기존 화가 깨지지 않는지 카탈로그를 다시 렌더해 확인한다.
- `theme.ts` 를 거치지 않은 색·선굵기 하드코딩.
