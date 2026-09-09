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
  S1Cheer, S2Calendar, S3History, S4BarsStart, S5BarsGrow, S6Compare, S7Story,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션+훅)·s3(역사 회상)은 캐릭터가 바스트샷으로 직접 대사를 말하는 구간이라
 *  mouth.json으로 립싱크한다. 그 외 장면은 캐릭터가 멀리/작게 보이는 전신샷이라
 *  다른 화(ep09 S7Recovery 등)와 동일하게 립싱크를 적용하지 않는다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
/** s2("어, 벌써 한 해가 다 갔네. 왜 이렇게 빨리 가지?" 훅 질문) -> s3(100년 넘은 이론 설명)
 *  전환만 원칙 4에 따라 여백을 늘린다. 질문이 던져진 뒤 바로 설명이 붙으면 궁금해할 틈이
 *  없다는 지적(ep01 v9, ep06, ep09에서도 동일 패턴 적용)과 같다. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1..s7]. pad[i]는 구간 i "끝"에 붙는 여백이다. pad[1](s2)만 늘리고
 *  나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [
  NARRATED_PAD, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
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
      Component: S1Cheer as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, label: t.s1Bar },
    },
    {
      Component: S2Calendar as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth },
    },
    {
      Component: S3History as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, mouth, label: t.s3Label },
    },
    {
      Component: S4BarsStart as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4 },
    },
    {
      Component: S5BarsGrow as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, bar1: t.s5Bar1, bar2: t.s5Bar2, bar3: t.s5Bar3 },
    },
    {
      Component: S6Compare as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, bar1: t.s5Bar1, bar2: t.s5Bar2, bar3: t.s5Bar3 },
    },
    {
      Component: S7Story as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, tag: t.s7Tag, storyTag: t.s7Story },
    },
  ];

  const ALL_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

  // s2 "어," 자각 순간에 realize_ding을 맞춘다(원칙 7 - 무성 구간은 아니지만 리액션 정점을
  // 짧은 효과음으로 한 번 더 강조한다. REGISTRY에 "재사용 가능"으로 이미 등록된 효과음,
  // 이 화의 자산 목록에도 "s2 자각 시점 재사용 가능"으로 명시돼 신규 제작 없이 그대로 썼다).
  const REALIZE_DING_FRAMES = 10; // 실측 0.30초(30fps 9프레임) + 여유
  const S2_REACT_START = 2;

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

        <Sequence from={starts[1] + S2_REACT_START} durationInFrames={REALIZE_DING_FRAMES} layout="none">
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
