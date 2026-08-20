/** 본편 조립. Intro + TitleCard + 11개 장면(s1~s11) + Outro. locale 로 ko/en 을 완전히 분기한다
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
  S1Look, S2Surprised, S3Count, S4Kepler, S5Olbers, S6Sightline, S7Travel, S8Compare, S9Fade,
  S10Poe, S11Closing,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션+훅 질문)·s11(클로징)은 캐릭터가 직접 대사를 말하는 구간이라 mouth.json 을 쓴다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(하늘 올려다보기)은 내레이션이 없는 순수 정적 구간이라 발화 길이로 잴 대상이 없다.
 *  대본이 지정한 동작 길이를 그대로 쓴다 (양 언어 공통). */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;
/** s2("근데 왜 하늘은 이렇게 깜깜하지?" 훅 질문) -> s3(설명) 전환만 원칙 4에 따라 여백을
 *  늘린다. 질문이 던져진 뒤 바로 설명이 붙으면 궁금해할 틈이 없다는 지적(ep01 v9)과 동일 패턴. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11]. pad[i]는 구간 i "끝"에
 *  붙는 여백이다. pad[1](s2)만 늘리고 나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8, s9, s10, s11,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale), s9: wrapCounts(s9.words, locale), s10: wrapCounts(s10.words, locale),
    s11: wrapCounts(s11.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8, linesS9, linesS10, linesS11] =
    buildCaptions([s2, s3, s4, s5, s6, s7, s8, s9, s10, s11], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Look as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Surprised as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Count as unknown as SceneSpec['Component'], frames: frames[2],
      props: {
        lines: linesS3, frames: frames[2], cityLabel: t.s3CityLabel, countPrefix: t.s3CountPrefix,
        countSuffix: t.s3CountSuffix, finalTo: t.s3FinalTo, finalSuffix: t.s3FinalSuffix,
      },
    },
    {
      Component: S4Kepler as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, badge: t.s4Badge, label: t.s4Label },
    },
    {
      Component: S5Olbers as unknown as SceneSpec['Component'], frames: frames[4],
      props: {
        lines: linesS5, frames: frames[4], keplerBadge: t.s4Badge, keplerLabel: t.s4Label,
        olbersLabel: t.s5Label,
      },
    },
    {
      Component: S6Sightline as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Travel as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6], label: t.s7Label },
    },
    {
      Component: S8Compare as unknown as SceneSpec['Component'], frames: frames[7],
      props: {
        lines: linesS8, frames: frames[7], shortLabel: t.s8ShortLabel, longLabel: t.s8LongLabel,
        longSub: t.s8LongSub,
      },
    },
    {
      Component: S9Fade as unknown as SceneSpec['Component'], frames: frames[8],
      props: { lines: linesS9, frames: frames[8], seeLabel: t.s9SeeLabel, unseeLabel: t.s9UnseeLabel },
    },
    {
      Component: S10Poe as unknown as SceneSpec['Component'], frames: frames[9],
      props: { lines: linesS10, badge: t.s10Badge, label: t.s10Label },
    },
    {
      Component: S11Closing as unknown as SceneSpec['Component'], frames: frames[10],
      props: {
        lines: linesS11, frames: frames[10], mouth, galaxyLabel: t.s11GalaxyLabel,
        galaxySub: t.s11GalaxySub, rumorLabel: t.s11Rumor,
      },
    },
  ];

  // s11 "속설?" 말풍선이 팝인하는 순간(S11Closing 의 bubbleIn 시작 지점과 동일 공식) - "어? 그런
  // 얘기도 있어?" 하는 발견의 순간이라 realize_ding 을 재사용한다(원칙 7, 신규 SFX 제작 없음).
  const s11BubbleStart = Math.round(frames[10] * 0.56);
  const REALIZE_DING_FRAMES = 12; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

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
        {NARRATED_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        <Sequence from={starts[10] + s11BubbleStart} durationInFrames={REALIZE_DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.75} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro
          lang={locale} dark
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
