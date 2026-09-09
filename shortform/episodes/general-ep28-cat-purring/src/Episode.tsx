/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성 + s2~s7 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(오케스트레이터 지시 명시)으로 한국어판만 만든다 - locale은
 *  'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words/mouth)는 그대로 유지해
 *  향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
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
  S1RestPurr, S2Reaction, S3Vibrate, S4Breath, S5Conclusion, S6HurtStill, S7Recovery,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s2(리액션+훅 질문)만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json을 쓴다. s3~s7은
 *  3인칭 설명 내레이션이 고양이/다이어그램 위에 흐르는 구간이라 립싱크를 쓰지 않는다
 *  (원칙 - ep24/ep07과 동일). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무릎 위에서 편안히 골골거리는 고양이)은 내레이션이 없는 순수 동작 구간이라 발화
 *  길이로 잴 대상이 없다. 대본이 지정한 길이(2.0초)를 그대로 쓴다 - cat_purr_loop.mp3
 *  실측 2.2초(66프레임)가 이 구간 길이(2.0+0.2초=66프레임)와 정확히 맞아떨어진다. */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문 "이 소리는 대체 어떻게 내는 거지?") -> s3(설명 시작) 전환만 원칙 4에
 *  따라 여백을 늘린다. 다른 전환은 프로필 기본 여백(0.2s)을 그대로 쓴다. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6, s7]. pad[i]는 구간 i "끝"에 붙는 여백이다. */
const SCENE_PAD = [
  NARRATED_PAD, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7'];

/** cat_purr_loop 효과음(원칙 7): 무성 구간(s1)에 골골 소리 자체를 들려준다. 구간 길이와
 *  정확히 같은 길이(66프레임)라 구간 시작과 동시에 재생하면 끝에서도 자연스럽게 잘린다. */
const CAT_PURR_LOOP_FRAMES = 66;

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] =
    buildCaptions([s2, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1RestPurr as unknown as SceneSpec['Component'], frames: frames[0], props: {} },
    {
      Component: S2Reaction as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Vibrate as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3, label: t.s3Label },
    },
    {
      Component: S4Breath as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4, label: t.s4Label },
    },
    {
      Component: S5Conclusion as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5 },
    },
    {
      Component: S6HurtStill as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6, badge: t.s6Badge },
    },
    {
      Component: S7Recovery as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, badge: t.s7Badge },
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
        {/* s1: 골골 소리 자체(구간 시작과 동시 재생, 구간 길이와 실측 일치) */}
        <Sequence from={starts[0]} durationInFrames={CAT_PURR_LOOP_FRAMES} layout="none">
          <Audio src={staticFile('audio/cat_purr_loop.mp3')} volume={0.75} />
        </Sequence>
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
