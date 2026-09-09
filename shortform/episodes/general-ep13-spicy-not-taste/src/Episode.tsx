/** 본편 조립. Intro + TitleCard + 9개 장면(s1~s9) + Outro. locale로 ko/en을 완전히 분기한다
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
  S1Reaction, S2Tastes, S3NoSpicy, S4Capsaicin, S5DualSignal, S6SweatHeart, S7Scoville,
  S8WaterMilk, S9Recap,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s1(리액션 전신샷)·s6(땀·심장 리액션)·s9(마무리 복귀)는 캐릭터가 직접 말하는 장면이라
 *  mouth.json으로 립싱크한다(ep08 S1Shrug/S2Surprised와 동일 원칙 - 바스트샷이 아니어도
 *  전신 Actor에 mouthOpen을 그대로 먹인다). 나머지(s2~s5, s7, s8)는 아이콘·다이어그램이
 *  주인공인 디스플레이 장면이라 캐릭터가 아예 없어 립싱크가 필요 없다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
/** s1(리액션+훅 질문 "맛이긴 한 걸까?") -> s2(다섯 가지 맛 설명) 전환만 원칙 4에 따라
 *  여백을 늘린다. 질문이 던져진 뒤 바로 설명이 붙으면 궁금해할 틈이 없다는 지적
 *  (ep01 v9, ep06, ep09, ep12에서도 동일 패턴 적용). */
const S1_TO_S2_PAD = 0.6;

/** allSegments = [s1..s9]. pad[i]는 구간 i "끝"에 붙는 여백이다. pad[0](s1)만 늘리고
 *  나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [
  S1_TO_S2_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

export interface EpisodeProps {
  locale: Locale;
}

function allSegments(locale: Locale): SegmentData[] {
  return WORDS_BY_LANG[locale].segments;
}

/** s1 놀람 정점(입 주변 열감 펄스가 막 커지는 시점)에 맞춘 순간 효과음.
 *  cold_zing은 REGISTRY에 "순간적 통증·놀람 리액션 전반 재사용 가능"으로 이미 등록된
 *  공용 효과음이라 신규 제작 없이 그대로 썼다(원칙 7). */
const COLD_ZING_AT = 4;
const COLD_ZING_FRAMES = 10;

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s1, s2, s3, s4, s5, s6, s7, s8, s9] = words.segments;

  const segs = allSegments(locale);
  const frames = sceneFrames(segs, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale), s8: wrapCounts(s8.words, locale), s9: wrapCounts(s9.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8, linesS9] =
    buildCaptions([s1, s2, s3, s4, s5, s6, s7, s8, s9], lineSpec);

  const tasteLabels = {
    sweet: t.s2Sweet, salty: t.s2Salty, sour: t.s2Sour, bitter: t.s2Bitter, umami: t.s2Umami,
  };

  const scenes: SceneSpec[] = [
    {
      Component: S1Reaction as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, mouth },
    },
    {
      Component: S2Tastes as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, labels: tasteLabels },
    },
    {
      Component: S3NoSpicy as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3, labels: tasteLabels, spicyText: t.s3Spicy },
    },
    {
      Component: S4Capsaicin as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4, label: t.s4Label },
    },
    {
      Component: S5DualSignal as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6SweatHeart as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, mouth },
    },
    {
      Component: S7Scoville as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, label: t.s7Label },
    },
    {
      Component: S8WaterMilk as unknown as SceneSpec['Component'], frames: frames[7],
      props: { frames: frames[7], lines: linesS8, waterLabel: t.s8Water, milkLabel: t.s8Milk },
    },
    {
      Component: S9Recap as unknown as SceneSpec['Component'], frames: frames[8],
      props: { frames: frames[8], lines: linesS9, mouth },
    },
  ];

  const ALL_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'];

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

        <Sequence from={starts[0] + COLD_ZING_AT} durationInFrames={COLD_ZING_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.8} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={t.outroTitle} nextHint={t.outroHint} />
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
