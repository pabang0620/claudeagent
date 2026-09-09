/** 본편 조립. Intro + TitleCard + 8개 장면(s1~s7, s2a/s2b 2개 포함) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  모든 구간이 발화가 있는 설명 구간이고(리액션+훅 질문 구간이 없다), 리액션 톤 별도 합성이나
 *  전환 여백 확대(원칙 4)가 필요한 지점이 없어 전 구간에 프로필 기본 여백(0.2초)만 쓴다.
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
  S1Still, S2aZoom, S2bVessels, S3Heat, S4CompareTemp, S5CompareIce, S6FeetCloseup, S7Compare,
} from './scenes';
import { Locale, STRINGS } from './strings';

// 이 화는 사람 호스트 캐릭터(Actor/BustActor)가 등장하지 않는다 - 대본 전 구간이 펭귄/다이어그램
// 위주 설명이라 립싱크(ko_mouth.json)를 쓰는 장면이 없다. 그래도 원칙 1·2에 따라
// tts.py/rms_mouth.py는 다른 화와 동일하게 실행해 ko_mouth.json을 만들어 두었다(파이프라인
// 표준 절차) - 다만 이 Episode.tsx에서는 소비하는 장면이 없어 import하지 않는다.
interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

const PAD = 0.2;
const SCENE_PAD = [PAD, PAD, PAD, PAD, PAD, PAD, PAD, PAD];

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const [s1, s2a, s2b, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [s1, s2a, s2b, s3, s4, s5, s6, s7];

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2a: wrapCounts(s2a.words, locale), s2b: wrapCounts(s2b.words, locale),
    s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale),
    s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2a, linesS2b, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    allSegments, lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Still as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, frames: frames[0] },
    },
    {
      Component: S2aZoom as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2a, frames: frames[1] },
    },
    {
      Component: S2bVessels as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS2b, frames: frames[2] },
    },
    {
      Component: S3Heat as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS3, frames: frames[3] },
    },
    {
      Component: S4CompareTemp as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS4, frames: frames[4] },
    },
    {
      Component: S5CompareIce as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS5, frames: frames[5] },
    },
    {
      Component: S6FeetCloseup as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS6, frames: frames[6] },
    },
    {
      Component: S7Compare as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS7, frames: frames[7] },
    },
  ];

  const narratedIds = ['s1', 's2a', 's2b', 's3', 's4', 's5', 's6', 's7'];

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
  const [s1, s2a, s2b, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [s1, s2a, s2b, s3, s4, s5, s6, s7];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
