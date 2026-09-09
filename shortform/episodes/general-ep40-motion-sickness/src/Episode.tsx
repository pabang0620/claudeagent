/** 본편 조립. Intro + TitleCard + 8개 장면(s1 무성, s2~s8 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1은 무성(달리는 차 안, 정지된 느낌 vs 빠르게 스치는 창밖) - ep01/ep02의
 *  SILENT_DURATION 패턴을 그대로 따른다(대본이 정한 길이 0:00-2.00 = 2.0초를 그대로 쓴다.
 *  원칙 4 - 길이를 채우려고 늘리지 않는다). s2(리액션+훅 "왜 이러지?")만 캐릭터 본인의
 *  대사라 립싱크를 연결한다. s3~s8은 3인칭 설명/전신 리액션 구간이라 립싱크를 쓰지 않는다.
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
  S1CarRide, S2Queasy, S3EyeEar, S4Collision, S4_SPARK_SFX_AT, S5BrainConfused, S6FullQueasy,
  S7Resolve, S8Screen,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s2(리액션 "왜 이러지?")만 캐릭터 본인이 직접 말하는 구간이라 mouth.json으로 입을
 *  움직인다. s3~s8은 다이어그램/전신 리액션 장면이라 3인칭 설명이거나 대사가 없어
 *  립싱크를 쓰지 않는다(ep01/ep34 등과 동일한 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무성, 달리는 차 안)은 발화 길이로 잴 대상이 없어 대본이 정한 길이(0:00-2.00)를
 *  그대로 초 단위로 쓴다(ep01/ep02의 SILENT_DURATION 패턴과 동일). */
const S1_DURATION_SEC = 2.0;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "왜 이러지?") -> s3(설명 시작)로 넘어가는 전환만 여백을 늘린다(원칙 4 -
 *  훅 질문 뒤에 숨 쉴 틈을 준다). s1(무성)->s2 전환과 나머지 전환은 기본 여백(0.2초)을
 *  그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
/** allSegments = [s1, s2, s3, s4, s5, s6, s7, s8]. pad[i]는 구간 i 자신의 길이에 더해지는
 *  여백(=다음 구간 시작 전 여백)이다. 8개 구간 전부에 값이 있어야 한다 - 마지막(s8) 항목을
 *  빠뜨리면 s8->Outro 전환에 여백 없이 뚝 끊긴다. */
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
  NARRATED_PAD,
];

/** realize_ding SFX. s2 리액션이 "왜 이러지?"라고 자문하는 시점(원칙 7, 발견·자각 리액션
 *  전반 재사용 가능하다고 REGISTRY에 이미 명시된 용도)에 맞춘다. s1이 언어 무관 고정 길이라
 *  starts[1](s2 시작)은 로케일과 무관하게 항상 같은 프레임이다. */
const REALIZE_DING_AT = 0.08; // s2 구간 길이 대비 비율
const REALIZE_DING_SFX_FRAMES = 12; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

/** bubble_pop SFX. s4에서 두 신호가 충돌하는 스파크 정점(scenes.tsx S4_SPARK_SFX_AT과 같은
 *  비율)에 맞춘다(원칙 7). */
const BUBBLE_POP_SFX_FRAMES = 6; // bubble_pop.mp3 실측 0.18초(30fps 5.4프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(words: WordsFile): SegmentData[] {
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;
  const s1: SegmentData = { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] };
  return [s1, s2, s3, s4, s5, s6, s7, s8];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const allSegments = buildAllSegments(words);
  const [, s2, s3, s4, s5, s6, s7, s8] = allSegments;

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale),
    s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] = buildCaptions(
    [s2, s3, s4, s5, s6, s7, s8], lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1CarRide as unknown as SceneSpec['Component'], frames: frames[0], props: {} },
    {
      Component: S2Queasy as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth },
    },
    {
      Component: S3EyeEar as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Collision as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5BrainConfused as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6FullQueasy as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Resolve as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7 },
    },
    {
      Component: S8Screen as unknown as SceneSpec['Component'], frames: frames[7],
      props: { frames: frames[7], lines: linesS8 },
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
        {['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map((id, i) => (
          i === 0 ? null : (
            <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
              <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
            </Sequence>
          )
        ))}

        {/* s2: "왜 이러지?" 자문 시작 시점 */}
        <Sequence
          from={starts[1] + Math.round(frames[1] * REALIZE_DING_AT)}
          durationInFrames={REALIZE_DING_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.8} />
        </Sequence>

        {/* s4: 두 신호가 충돌하는 스파크 정점 */}
        <Sequence
          from={starts[3] + Math.round(frames[3] * S4_SPARK_SFX_AT)}
          durationInFrames={BUBBLE_POP_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.75} />
        </Sequence>
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
  const words = WORDS_BY_LANG[locale];
  const allSegments = buildAllSegments(words);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
