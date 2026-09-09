/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7, 전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 처음부터 끝까지 3인칭 설명 내레이션이고(자산 목록에 캐릭터가 없다, 62화
 *  EarthOrbitDiagram과 같은 순수 다이어그램 구성), 리액션+훅 질문 구간이 없어(원칙 4의 5번,
 *  전환 여백 확대 대상은 "캐릭터가 놀라며 훅 질문을 던진 뒤 설명으로 넘어가는" 전환인데
 *  이 화는 그런 캐릭터 반응 장면 자체가 없다) 모든 구간 전환에 프로필 기본 여백(0.2초)을
 *  동일하게 적용한다.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import {
  S1Myth, S2Eclipse, S3LitHalf, S4Orbit, S5Sequence, S6Cycle, S7NewFull,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

const NARRATED_PAD = 0.2;
const SCENE_PAD = [
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7];

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  // edge-tts WordBoundary가 "'달'이라는"(따옴표로 감싼 단어)의 여는 따옴표를 자막 어절
  // 토큰에서 누락시켜 "달'이라는"으로 나온다(대사 자체·오디오 발음은 정상 - 자막 표시
  // 어절 텍스트만 어긋난 TTS 토크나이저의 알려진 한계, 스틸 선점검에서 발견). 타이밍(s/e)은
  // 그대로 두고 표시 텍스트만 보정한다 - 대본 문장을 고치는 것이 아니라 자막 렌더링
  // 표시값만 바로잡는 것이다.
  const s6Fixed: SegmentData = {
    ...s6,
    words: s6.words.map((w) => (w.w === "달'이라는" ? { ...w, w: "'달'이라는" } : w)),
  };
  const captionSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6Fixed, s7];

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6Fixed.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    captionSegments, lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Myth as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, frames: frames[0] },
    },
    {
      Component: S2Eclipse as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1] },
    },
    {
      Component: S3LitHalf as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Orbit as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Sequence as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Cycle as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7NewFull as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
  ];

  const narratedIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

  return (
    <AbsoluteFill style={{ background: C.night }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={TITLE_CARD_FRAMES} layout="none">
        <TitleCard title={t.title} />
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={t.outroNextTitle} nextHint={t.outroNextHint} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
