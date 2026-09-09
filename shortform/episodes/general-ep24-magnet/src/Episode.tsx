/** 본편 조립. Intro + TitleCard + 6개 장면(s1 무성 + s2~s6 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는
 *  그대로 유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
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
  S1Snap, S2Question, S3Align, S4Attract, S5Conclusion, S6Earth,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s2(리액션+훅 질문)만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json을 쓴다. s3~s6은
 *  3인칭 설명 내레이션이 다이어그램 위에 흐르는 구간이라 캐릭터가 등장하지 않는다(원칙 -
 *  ep06/ep22 등과 동일하게 다이어그램 장면엔 립싱크를 쓰지 않는다). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(책상 위 자석 두 개가 저절로 끌려 붙음)은 내레이션이 없는 순수 동작 구간이라 발화
 *  길이로 잴 대상이 없다. 대본이 지정한 길이(2.0초)를 그대로 쓴다. */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문 "왜 이러는 거지?") -> s3(설명 시작) 전환만 원칙 4에 따라 여백을
 *  늘린다. 다른 전환은 프로필 기본 여백(0.2s)을 그대로 쓴다. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6]. pad[i]는 구간 i "끝"에 붙는 여백이다. */
const SCENE_PAD = [NARRATED_PAD, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6'];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6] = buildCaptions([s2, s3, s4, s5, s6], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Snap as unknown as SceneSpec['Component'], frames: frames[0], props: {} },
    {
      Component: S2Question as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Align as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Attract as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Conclusion as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5 },
    },
    {
      Component: S6Earth as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
  ];

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={TITLE_CARD_FRAMES} layout="none">
        <TitleCard title={t.title} />
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {NARRATED_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro
          lang={locale}
          nextTitle={t.outroNextTitle}
          nextHint={t.outroNextHint}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
