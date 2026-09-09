/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7) + Outro. locale로 ko/en을 완전히 분기한다
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
  S1Sear, S2Oxygen, S3Maillard, S4Compare, S5DryOff, S6SameReaction, S7Wrap,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s1(리액션+훅)·s7(마무리)만 캐릭터가 바스트샷으로 직접 대사를 말하는 구간이라 mouth.json
 *  으로 립싱크한다(ep12/ep04와 동일 원칙 - 나머지는 다이어그램·소품 위주 그래픽 장면). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
/** s1("와, 색깔 진하게 잘 익었다... 왜 이 색이 안 나오지?" 훅 질문) -> s2("이 갈색, 사실
 *  산소 때문에...") 전환만 원칙 4에 따라 여백을 늘린다. 질문이 던져진 뒤 바로 설명이 붙으면
 *  궁금해할 틈이 없다는 지적(ep01/ep06/ep09/ep12에서도 동일 패턴 적용)과 같다. */
const S1_TO_S2_PAD = 0.6;

/** allSegments = [s1..s7]. pad[i]는 구간 i "끝"에 붙는 여백이다. pad[0](s1)만 늘리고
 *  나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [
  S1_TO_S2_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

export interface EpisodeProps {
  locale: Locale;
}

function allSegments(locale: Locale): SegmentData[] {
  return WORDS_BY_LANG[locale].segments;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;

  const segs = allSegments(locale);
  const frames = sceneFrames(segs, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] =
    buildCaptions([s1, s2, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    {
      Component: S1Sear as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1, mouth },
    },
    {
      Component: S2Oxygen as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, label: t.s2Oxygen },
    },
    {
      Component: S3Maillard as unknown as SceneSpec['Component'], frames: frames[2],
      props: {
        frames: frames[2], lines: linesS3, proteinLabel: t.s3Protein, sugarLabel: t.s3Sugar,
        heatLabel: t.s3Heat, maillardLabel: t.s3Maillard,
      },
    },
    {
      Component: S4Compare as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4, waterLabel: t.s4WaterLabel, meatLabel: t.s4MeatLabel },
    },
    {
      Component: S5DryOff as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5, markLabel: t.s5Mark },
    },
    {
      Component: S6SameReaction as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6 },
    },
    {
      Component: S7Wrap as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, mouth },
    },
  ];

  const ALL_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

  // s1 "와, 색깔 진하게 잘 익었다" 놀람 리액션 정점에 realize_ding을 맞춘다(원칙 7 - REGISTRY에
  // "재사용 가능"으로 이미 등록된 효과음, ep12의 s2 리액션과 동일 용법). s2~s7은 전부 내레이션이
  // 있는 구간이고(대본에 순수 무성 구간이 없다) 별도 SFX를 억지로 얹지 않았다.
  const REALIZE_DING_FRAMES = 10; // 실측 0.30초(30fps 9프레임) + 여유
  const S1_REACT_START = 3;

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
        {ALL_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        <Sequence from={starts[0] + S1_REACT_START} durationInFrames={REALIZE_DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.75} />
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
  const segs = allSegments(locale);
  const frames = sceneFrames(segs, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
