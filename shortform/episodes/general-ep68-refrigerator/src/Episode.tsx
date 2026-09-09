/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  모든 구간이 3인칭 설명(리액션+훅 질문 구간 없음)이라 전 구간 프로필 기본 여백(0.2초)만
 *  쓴다(원칙 4의 확대 여백 규칙은 리액션->설명 전환에만 적용되고 이 화에는 해당 구간이 없다).
 *  s1만 캐릭터가 직접 말하는 구간이라 ko_mouth.json을 s1에만 연결한다.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import {
  S1Open, S2Reveal, S3Expand, S4Absorb, S5Compress, S6Release, S7Summary,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

const PAD = 0.2;
const SCENE_PAD = [PAD, PAD, PAD, PAD, PAD, PAD, PAD];

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7];

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(allSegments, lineSpec);

  const scenes: SceneSpec[] = [
    {
      Component: S1Open as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, frames: frames[0], mouth },
    },
    {
      Component: S2Reveal as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1] },
    },
    {
      Component: S3Expand as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Absorb as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Compress as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Release as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Summary as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
  ];

  const narratedIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={TITLE_CARD_FRAMES} layout="none">
        <TitleCard title={STRINGS[locale].title} />
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
        <Outro lang={locale} nextTitle={STRINGS[locale].outroNextTitle} nextHint={STRINGS[locale].outroNextHint} />
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
