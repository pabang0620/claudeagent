/** 본편 조립. Intro + TitleCard + 8개 장면(s1~s8) + Outro. locale로 ko/en을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
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
import {
  S1IcePour, S2Reaction, S3Molecules, S4Volume, S5Density, S6Pipe, S7Lake, S8Mpemba,
  s6CrackFrame,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션, 캐릭터 얼굴이 보임)만 립싱크(mouth.json)가 필요하다. s3~s8은 전부 순수 도식이라
 *  캐릭터가 화면에 없다(대본 "화면이 담당" 열에 캐릭터 언급이 없음) - s1은 캐릭터가 있지만
 *  무성 구간이라 애초에 mouth 값이 없다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(캐릭터가 물을 따르고 얼음을 넣는 모습)은 내레이션이 없는 순수 정적 구간이라 발화
 *  길이로 잴 대상이 없다. 대본이 지정한 동작 길이(0:00-2.00, 2.2초 - 낙하+안착+bobbing
 *  애니메이션이 여유 있게 끝나도록 원안 2.0초에 소폭의 연출 여유만 더함)를 그대로 쓴다
 *  (양 언어 공통, 원칙 4). */
const SILENT_DURATION_S1 = 2.2;
const NARRATED_PAD = 0.2;
/** s2("근데 왜 다른 건 안 그렇지?" 훅 질문) -> s3(분자 배열 설명) 전환만 원칙 4에 따라
 *  여백을 늘린다. 질문이 던져진 뒤 바로 설명이 붙으면 궁금해할 틈이 없다. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6, s7, s8]. pad[i]는 구간 i "끝"에 붙는 여백이다.
 *  pad[1](s2)만 늘리고 나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] =
    buildCaptions([s2, s3, s4, s5, s6, s7, s8], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1IcePour as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Reaction as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Molecules as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Volume as unknown as SceneSpec['Component'], frames: frames[3],
      props: {
        lines: linesS4, sameWeightLabel: t.s4SameWeight, waterLabel: t.s4Water, iceLabel: t.s4Ice,
      },
    },
    {
      Component: S5Density as unknown as SceneSpec['Component'], frames: frames[4],
      props: {
        lines: linesS5, densityLabel: t.s5Density, iceLowerLabel: t.s5IceLower,
        waterHigherLabel: t.s5WaterHigher,
      },
    },
    {
      Component: S6Pipe as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5], label: t.s6Label },
    },
    {
      Component: S7Lake as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6], surfaceLabel: t.s7Surface, belowLabel: t.s7Below },
    },
    {
      Component: S8Mpemba as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, frames: frames[7], label: t.s8Label },
    },
  ];

  // 무성 구간·핵심 액션에 짧은 효과음을 붙인다(원칙 7). 애니메이션 정점 프레임에 정확히
  // 맞추기 위해 씬 코드가 export한 상수/함수를 그대로 가져다 쓴다(손으로 다시 맞추지 않음).
  const SPLASH_FRAMES = 10; // ink_splat.mp3 실측 0.28초(30fps 8.4프레임) + 여유
  const CRACK_FRAMES = 11; // cold_zing.mp3 실측 0.30초(30fps 9프레임) + 여유
  const S1_SPLASH_FRAME = 40; // S1IcePour의 floatCube 안착(settle) 지점 부근(progress(f,14,54)의 후반)
  const s6Crack = s6CrackFrame(frames[5]);

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
        {['s2', 's3', 's4', 's5', 's6', 's7', 's8'].map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 얼음이 수면에 떨어져 튀는 소리 (무성 구간, 원칙 7) */}
        <Sequence from={starts[0] + S1_SPLASH_FRAME} durationInFrames={SPLASH_FRAMES} layout="none">
          <Audio src={staticFile('audio/ink_splat.mp3')} volume={0.7} />
        </Sequence>
        {/* s6: 수도관이 얼어 터지는 순간 - 찌릿한 크랙 사운드 */}
        <Sequence from={starts[5] + s6Crack} durationInFrames={CRACK_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.8} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro
          lang={locale}
          nextTitle={locale === 'ko' ? '다음 편' : 'Next up'}
          nextHint={locale === 'ko' ? '다음 편에서 또 다른 궁금증이 풀려요!' : 'Another curious question, coming up!'}
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
