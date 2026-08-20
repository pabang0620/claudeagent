/** 본편 조립. Intro + TitleCard + 13개 장면(s1~s13) + Outro. locale 로 ko/en 을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
 *
 *  16:9(가로) 롱폼 첫 화 - IntroLandscape/OutroLandscape/TitleCardLandscape 를 쓴다(세로판 금지).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, IntroLandscape as Intro, INTRO_FRAMES_LANDSCAPE as INTRO_FRAMES,
  OutroLandscape as Outro, OUTRO_FRAMES_LANDSCAPE as OUTRO_FRAMES, SceneSwitcher,
  TitleCardLandscape as TitleCard, TITLE_CARD_FRAMES_LANDSCAPE as TITLE_CARD_FRAMES,
  buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import enMouthRaw from '../public/audio/en_mouth.json';
import {
  S1Look, S2Surprised, S3Compare, S4Saccade, S5Blackout, S6Stretch, S7Payoff, S8Name, S9Count,
  S10Accumulate, S11Sync, S12Ear, S13Closing,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션+훅 질문)·s13(클로징)은 캐릭터가 직접 대사를 말하는 구간이라 mouth.json 을 쓴다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(고개를 홱 돌린다)은 내레이션이 없는 순수 정적 구간이라 발화 길이로 잴 대상이 없다.
 *  대본이 지정한 동작 길이를 그대로 쓴다 (양 언어 공통). */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;
/** s2("어? 방금 초침이... 왜 이러지?" 훅 질문) -> s3(설명) 전환만 원칙 4에 따라 여백을
 *  늘린다. 질문이 던져진 뒤 바로 설명이 붙으면 궁금해할 틈이 없다(ep01 v9·ep06 s2 와 동일 패턴). */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, ..., s13]. pad[i]는 구간 i "끝"에 붙는 여백이다.
 *  pad[1](s2)만 늘리고 나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = [
  's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13',
];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale), s9: wrapCounts(s9.words, locale), s10: wrapCounts(s10.words, locale),
    s11: wrapCounts(s11.words, locale), s12: wrapCounts(s12.words, locale), s13: wrapCounts(s13.words, locale),
  };
  const [
    linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8, linesS9, linesS10, linesS11,
    linesS12, linesS13,
  ] = buildCaptions([s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Look as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Surprised as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Compare as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3 },
    },
    {
      Component: S4Saccade as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, term: t.s4Term },
    },
    {
      Component: S5Blackout as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Stretch as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Payoff as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
    {
      Component: S8Name as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, badge: t.s8Badge, label: t.s8Label },
    },
    {
      Component: S9Count as unknown as SceneSpec['Component'], frames: frames[8],
      props: { lines: linesS9, frames: frames[8], to: t.s9To, prefix: t.s9Prefix, suffix: t.s9Suffix },
    },
    {
      Component: S10Accumulate as unknown as SceneSpec['Component'], frames: frames[9],
      props: { lines: linesS10, frames: frames[9], label: t.s10Label },
    },
    {
      Component: S11Sync as unknown as SceneSpec['Component'], frames: frames[10],
      props: { lines: linesS11, cue: t.s11Cue },
    },
    {
      Component: S12Ear as unknown as SceneSpec['Component'], frames: frames[11],
      props: { lines: linesS12, frames: frames[11] },
    },
    {
      Component: S13Closing as unknown as SceneSpec['Component'], frames: frames[12],
      props: { lines: linesS13, frames: frames[12], mouth },
    },
  ];

  // s1 "고개를 홱 돌린다" 순간(S1Look 의 turnP 시작 지점과 동일 공식) - 무성 구간이라 원칙 7에
  // 따라 짧은 휙 소리를 붙인다.
  const S1_WHOOSH_AT = 5;
  const HEAD_WHOOSH_FRAMES = 8; // head_whoosh.mp3 실측 0.24초(30fps 7.2프레임) + 여유

  // s7 페이오프(초침이 멈췄다 다시 움직이는 순간, S7Payoff 의 resumeAt 과 동일 공식) - 핵심
  // 액션이라 원칙 7에 따라 짧은 "톡" 틱 소리를 붙인다(ui_tap 재사용).
  const s7ResumeAt = Math.round(frames[6] * 0.55);
  const UI_TAP_FRAMES = 5;

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

        <Sequence from={starts[0] + S1_WHOOSH_AT} durationInFrames={HEAD_WHOOSH_FRAMES} layout="none">
          <Audio src={staticFile('audio/head_whoosh.mp3')} volume={0.85} />
        </Sequence>

        <Sequence from={starts[6] + s7ResumeAt} durationInFrames={UI_TAP_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.8} />
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
