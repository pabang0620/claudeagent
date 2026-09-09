/** 본편 조립. Intro + TitleCard + 8개 장면(s1 무성, s2~s8 유성) + Outro.
 *  locale 로 ko/en 을 완전히 분기한다(문자열은 strings.ts, 음성/자막 타이밍은 언어별
 *  words.json, 장면 구성·자산은 공용).
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
  S1Decide, S2Cross, S3Name, S4Mechanism, S5Filed, S6Chain, S7Virtual, S8Return,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션 "어, 갑자기 하나도 기억이 안 나네...")는 캐릭터 본인이 직접 말하는 구간이라
 *  mouth.json 으로 입을 움직인다. s1은 무성, s3~s8은 설명/디스플레이 장면이라 캐릭터가
 *  화자로 보이지 않으므로 립싱크를 쓰지 않는다(ep07·ep08과 동일 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(무성, 결심 -> 문 쪽으로 걷기)은 발화 길이로 잴 대상이 없어 대본 지시("0:00-3.00")
 *  그대로 3.0초를 쓴다(ep01/ep02/ep08의 SILENT_DURATION과 동일 패턴). */
const S1_LOCAL_FRAMES = 90; // 3.0초
const S1_DURATION_SEC = S1_LOCAL_FRAMES / 30;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "내가 여기 왜 왔더라?") -> s3(설명, 이름 소개)로 넘어가는 전환만 여백을
 *  늘린다(원칙 4의 5번, ep06/ep08과 동일한 이유 - 훅 질문 뒤에 숨 쉴 틈을 준다).
 *  다른 전환은 기본 여백(0.2초) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
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
    { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] },
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
    {
      Component: S1Decide as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], bubble: t.s1Bubble },
    },
    {
      Component: S2Cross as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth, oldBubble: t.s1Bubble },
    },
    {
      Component: S3Name as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Mechanism as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4, label: t.s4Label },
    },
    {
      Component: S5Filed as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5, label: t.s5Label, oldBubble: t.s1Bubble },
    },
    {
      Component: S6Chain as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Virtual as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, label: t.s7Label },
    },
    {
      Component: S8Return as unknown as SceneSpec['Component'], frames: frames[7],
      props: { frames: frames[7], lines: linesS8, bubble: t.s8Bubble },
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
