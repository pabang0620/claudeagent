/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7 전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는
 *  그대로 유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 7개 구간 전부 실제 발화(narration)가 있다(무성 구간 없음) - 그래서 다른 화와
 *  달리 SILENT_DURATION 상수가 없다.
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
  S1Embarrassed, S2Mechanism, S3AlwaysOn, S4Emptying, S5Sweep, S6Repeating, S7Echo,
  S1_GROWL_AT, S2_GROWL_AT, S6_GROWL_AT, S7_GROWL_AT, GROWL_SFX_FRAMES,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** 이 화는 어느 구간도 캐릭터 1인칭 대사(따옴표)가 아니라 3인칭 설명 내레이션이라
 *  mouthAt() 립싱크를 쓰지 않는다(scenes.tsx 상단 주석 참고). ko_mouth.json은 파이프라인
 *  표준 절차(원칙 2)에 따라 public/audio/에 생성만 해 두고, 이 화 코드에서는 참조하지 않는다. */

const NARRATED_PAD = 0.2;
const SCENE_PAD = [
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];
const NARRATED_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  return words.segments;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    [s1, s2, s3, s4, s5, s6, s7], lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Embarrassed as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1 },
    },
    {
      Component: S2Mechanism as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2 },
    },
    {
      Component: S3AlwaysOn as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Emptying as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Sweep as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6Repeating as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Echo as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7 },
    },
  ];

  const growlSeq = (sceneIdx: number, at: number, volume: number) => (
    <Sequence
      key={`growl-${sceneIdx}`}
      from={starts[sceneIdx] + Math.round(frames[sceneIdx] * at)}
      durationInFrames={GROWL_SFX_FRAMES} layout="none"
    >
      <Audio src={staticFile('audio/stomach_growl.mp3')} volume={volume} />
    </Sequence>
  );

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
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* 꼬르륵 소리(원칙 7) - s1(당황), s2(기본 설명), s6(반복/커짐), s7(울림)에서 재생.
         *  내레이션(volume 1.6)보다 낮게 유지하되, s6/s7은 "소리가 유독 크게/더 크게"라는
         *  대본 지시에 맞춰 s1/s2보다 살짝 크게 준다. */}
        {growlSeq(0, S1_GROWL_AT, 0.75)}
        {growlSeq(1, S2_GROWL_AT, 0.70)}
        {growlSeq(5, S6_GROWL_AT, 0.95)}
        {growlSeq(6, S7_GROWL_AT, 0.90)}
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
