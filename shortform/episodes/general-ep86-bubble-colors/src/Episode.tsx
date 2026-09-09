/** 본편 조립. Intro + TitleCard + 8개 장면(전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 8구간 전부 내레이션이 있어(무성 구간 없음) 프로필 기본 여백(0.2초)만 쓴다 -
 *  "리액션+훅 질문 다음 설명" 유형의 전환도 없어(대본에 물음표 없음) 추가 여백도 필요 없다.
 *
 *  s8(막이 얇아지다 터지는 핵심 액션) - 시각적으로 터지는 순간(scenes.tsx S8_POP_START_FRAC)에
 *  bubble_pop SFX(원칙 7, general-ep18 신설·"비눗방울 터짐 등 재사용 가능"으로 REGISTRY에
 *  이미 명시된 재사용 대상)를 맞춰 재생한다.
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
  S1Blow, S2Compare, S3OuterReflect, S4InnerReflect, S5Interfere, S6ThicknessCompare,
  S7Swirl, S8FadeToBlack, S8_POP_START_FRAC,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
const SCENE_PAD = Array(8).fill(NARRATED_PAD);

/** bubble_pop.mp3 실측 0.18초(30fps 5.4프레임 -> 6프레임) */
const BUBBLE_POP_SFX_FRAMES = 6;

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s1, s2, s3, s4, s5, s6, s7, s8] = words.segments;
  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7, s8];

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale), s8: wrapCounts(s8.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] = buildCaptions(
    allSegments, lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Blow as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, frames: frames[0], mouth },
    },
    {
      Component: S2Compare as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1] },
    },
    {
      Component: S3OuterReflect as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4InnerReflect as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Interfere as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6ThicknessCompare as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Swirl as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
    {
      Component: S8FadeToBlack as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, frames: frames[7] },
    },
  ];

  const allIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

  // s8 파열 시점(scenes.tsx S8_POP_START_FRAC와 동일 공식) - 매직넘버 중복 없이 상수를 그대로 가져다 씀
  const s8PopAt = Math.round(frames[7] * S8_POP_START_FRAC);

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
        {allIds.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s8: 방울이 터지는 순간 */}
        <Sequence from={starts[7] + s8PopAt} durationInFrames={BUBBLE_POP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.8} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={t.outroNextTitle} nextHint={t.outroNextHint} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7, s8] = words.segments;
  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7, s8];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
