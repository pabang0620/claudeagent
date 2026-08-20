/** 본편 조립. Intro + 제목 카드 + 6개 장면(s1 무성 + s2~s6 발화) + Outro.
 *  locale 로 ko/en 을 완전히 분기한다(문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json,
 *  장면 구성·자산은 공용).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import enMouthRaw from '../public/audio/en_mouth.json';
import { S1Cut, S1_KNIFE_CONTACT_FRAME, S2Browning, S3Separated, S4React, S5Compare, S6Wrap } from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(사과를 자르는 도입부)는 발화가 없다. 대본이 지정한 동작 길이를 그대로 쓴다(양 언어 공통,
 *  원칙 0/4 - 채우기가 아니라 연출에 필요한 만큼만). */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;
const SCENE_PAD = [0, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** chop 효과음: s1 에서 칼이 사과에 닿는 프레임(scenes.tsx 의 KNIFE_CONTACT_FRAME)에 정확히
 *  맞춰 재생. s1 은 언어 무관 고정 길이라 starts[0] 은 항상 0 - 언어 공용으로 고정할 수 있다. */
const CHOP_SFX_FRAMES = 9; // chop.mp3 실측 0.30초(30fps 9프레임)

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6] = words.segments;

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale),
    s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale),
    s6: wrapCounts(s6.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6] = buildCaptions([s2, s3, s4, s5, s6], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Cut as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Browning as unknown as SceneSpec['Component'],
      frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Separated as unknown as SceneSpec['Component'],
      frames: frames[2],
      props: { lines: linesS3, locale },
    },
    {
      Component: S4React as unknown as SceneSpec['Component'],
      frames: frames[3],
      props: { lines: linesS4, locale, frames: frames[3] },
    },
    {
      Component: S5Compare as unknown as SceneSpec['Component'],
      frames: frames[4],
      props: { lines: linesS5, locale, frames: frames[4] },
    },
    {
      Component: S6Wrap as unknown as SceneSpec['Component'],
      frames: frames[5],
      props: { lines: linesS6, mouth },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6'];

  return (
    // 본편 장면이 전부 밝은 배경이라 인트로->본편 경계의 첫 프레임 틈에 캔버스 기본색(검정)이
    // 비치지 않도록 paper 로 맞춘다 (general-ep01 v6 검수에서 확인된 결함 재발 방지).
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
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 칼이 사과에 닿는 순간 - "탁" 절단 효과음. 언어 무관 공용 자산(assets/audio/chop.mp3) */}
        <Sequence from={starts[0] + S1_KNIFE_CONTACT_FRAME} durationInFrames={CHOP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/chop.mp3')} volume={0.9} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={locale === 'ko' ? '다음 편' : 'Next up'}
          nextHint={locale === 'ko' ? '다음 편에서 또 다른 궁금증이 풀려요!' : 'Another curious question, coming up!'}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
