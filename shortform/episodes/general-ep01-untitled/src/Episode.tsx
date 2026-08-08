/** 본편 조립. Intro + 5개 장면 + Outro. locale 로 ko/en 을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher,
  buildCaptions, sceneFrames, sceneStarts,
} from '../../../assets';
import type { SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import { S1Bite, S2Forehead, S3Cold, S4Nerve, S5Signal, wrapCounts } from './scenes';
import { Locale } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};

/** s1(아이스크림 한입)·s2(이마 찌릿)는 내레이션이 없는 순수 동작 구간이다.
 *  발화 길이로 측정할 대상이 없으므로 대본이 지정한 동작 길이를 그대로 쓴다 (양 언어 공통). */
const SILENT_DURATIONS: Record<string, number> = { s1: 2.0, s2: 2.5 };
const NARRATED_PAD = 0.2;

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const [s3, s4, s5] = words.segments;

  // 전 구간(s1~s5) 을 하나의 SegmentData 배열로 만들어 timeline.sceneFrames 로 한 번에 프레임화한다.
  // s1/s2 는 duration 을 대본 지정값으로, s3~s5 는 TTS 실측값으로 채운다.
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATIONS.s1, words: [] },
    { id: 's2', text: '', duration: SILENT_DURATIONS.s2, words: [] },
    s3, s4, s5,
  ];
  const pad = [0, 0, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];
  const frames = sceneFrames(allSegments, pad);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale),
  };
  const [linesS3, linesS4, linesS5] = buildCaptions([s3, s4, s5], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Bite as unknown as SceneSpec['Component'], frames: frames[0] },
    { Component: S2Forehead as unknown as SceneSpec['Component'], frames: frames[1], props: { locale } },
    { Component: S3Cold as unknown as SceneSpec['Component'], frames: frames[2], props: { lines: linesS3 } },
    {
      Component: S4Nerve as unknown as SceneSpec['Component'],
      frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Signal as unknown as SceneSpec['Component'],
      frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
  ];

  const narratedIds = ['s3', 's4', 's5'];

  return (
    // 배경을 명시하지 않으면 SceneSwitcher 의 첫 장면 fade-in(0->1, 8프레임) 동안
    // 렌더 캔버스 기본색(검정)이 인트로->본편 경계에서 한 프레임 정도 비쳐 보인다.
    // 본편 장면들이 전부 밝은 배경이라 paper 로 맞춰 그 결함을 없앤다.
    <AbsoluteFill style={{ background: C.paper }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i + 2]} durationInFrames={frames[i + 2]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={INTRO_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={locale === 'ko' ? '다음 편' : 'Next up'}
          nextHint={locale === 'ko' ? '다음 편에서 또 다른 궁금증이 풀려요!' : 'Another curious question, coming up!'}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s3, s4, s5] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATIONS.s1, words: [] },
    { id: 's2', text: '', duration: SILENT_DURATIONS.s2, words: [] },
    s3, s4, s5,
  ];
  const pad = [0, 0, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];
  const frames = sceneFrames(allSegments, pad);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
