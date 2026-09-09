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
  S1Tickle, S1_TICKLE_START_FRAME, S2SelfPoke, S2_POKE_FRAME, S3Aristotle, S4Unpredictable,
  S5Predicted, S6Fizzle, S7RobotDelay, S8Settle, s4ContactFrame, s7ContactFrame,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션+훅)·s3(회상 카드, 구석 캐릭터)·s6(무표정)·s8(마무리)은 캐릭터 얼굴이 화면에 보이는
 *  구간이라 mouth.json을 쓴다. s4·s5·s7은 다이어그램만 보이는 구간이라 립싱크가 필요 없다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(반대팔로 겨드랑이를 간지럽혀 보는 모습)은 내레이션이 없는 순수 정적 구간이라 발화
 *  길이로 잴 대상이 없다. 사용자 피드백(2026-08-20)에 따라 간지럼 시도 동작을 최소 1초 이상
 *  반복해서 보여주도록 0:00-3.40(3.4초)로 늘렸다(양 언어 공통, scenes.tsx의
 *  S1_TOTAL_FRAMES=102와 반드시 같은 값 - 3.4*30=102). */
const SILENT_DURATION_S1 = 3.4;
const NARRATED_PAD = 0.2;
/** s2("어, 하나도 안 간지럽네. 왜 그런 거지?" 훅 질문) -> s3(회상 일화) 전환만 원칙 4에 따라
 *  여백을 늘린다. 질문이 던져진 뒤 바로 다음 말이 붙으면 궁금해할 틈이 없다(ep06·ep09에서도
 *  동일 패턴 적용). */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6, s7, s8]. pad[i]는 구간 i "끝"에 붙는 여백이다.
 *  pad[1](s2)만 늘리고 나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'];

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
    { Component: S1Tickle as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2SelfPoke as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Aristotle as unknown as SceneSpec['Component'], frames: frames[2],
      props: {
        lines: linesS3, mouth, eraLabel: t.s3EraLabel, nameLabel: t.s3NameLabel, storyTag: t.s3StoryTag,
      },
    },
    {
      Component: S4Unpredictable as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], label: t.s4Label },
    },
    {
      Component: S5Predicted as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4], label: t.s5Label },
    },
    {
      Component: S6Fizzle as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, mouth },
    },
    {
      Component: S7RobotDelay as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6], label: t.s7Label },
    },
    {
      Component: S8Settle as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, frames: frames[7], mouth },
    },
  ];

  // 무성 구간·핵심 액션에 짧은 효과음을 붙인다(원칙 7). 애니메이션 정점 프레임에 정확히
  // 맞추기 위해 씬 코드가 export한 상수/함수를 그대로 가져다 쓴다(손으로 다시 맞추지 않음).
  const UI_TAP_FRAMES = 5; // ui_tap.mp3 실측 0.10초(30fps 3프레임) + 여유
  const COLD_ZING_FRAMES = 11; // cold_zing.mp3 실측 0.30초(30fps 9프레임) + 여유
  const s4Contact = s4ContactFrame(frames[3]);
  const s7Contact = s7ContactFrame(frames[6]);

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

        {/* s1: 반대팔이 겨드랑이에 처음 닿는 접촉음 (무성 구간, 원칙 7) */}
        <Sequence from={starts[0] + S1_TICKLE_START_FRAME} durationInFrames={UI_TAP_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.75} />
        </Sequence>
        {/* s2: 자기 손으로 찔러보는 접촉음 */}
        <Sequence from={starts[1] + S2_POKE_FRAME} durationInFrames={UI_TAP_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.7} />
        </Sequence>
        {/* s4: 예상 못한 손길 - 큰 스파크 접촉 */}
        <Sequence from={starts[3] + s4Contact} durationInFrames={COLD_ZING_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.75} />
        </Sequence>
        {/* s7: 로봇 팔 시간차 - 예측이 깨지며 다시 큰 스파크 */}
        <Sequence from={starts[6] + s7Contact} durationInFrames={COLD_ZING_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.75} />
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
