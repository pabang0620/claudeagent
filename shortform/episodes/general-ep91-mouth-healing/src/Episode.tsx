/** 본편 조립. Intro + TitleCard + 8개 장면(s1 무성 + s2~s8 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(음식을 씹다 혀를 깨물어 아파하다가 하드 컷으로 며칠 뒤 다 나은 모습)은 무성 구간이라
 *  발화 길이가 없다 - general-ep01의 S1Bite/general-ep84의 S1Bite와 같은 원칙으로 대본이
 *  지정한 고정 길이(SILENT_DURATION_S1=2.5초, 02-script-v1.md s1 구간 추정)를 그대로 쓴다.
 *
 *  s2("어? 혀 깨문 거 며칠 전인데 벌써 다 나았네. 왜 이렇게 빨리 낫지?" - 리액션+훅 질문)
 *  다음이 곧바로 s3(설명 - 침 속 보호 성분)으로 이어지는 전환이라 원칙 4에 따라 기본 여백
 *  (0.2초)보다 길게 준다(S2_TO_S3_PAD=0.6초, general-ep87·ep89와 같은 이유). s1->s2 전환은
 *  무성 동작에서 리액션으로 바로 이어지는 연속 동작이라 추가 여백 없이 0으로 둔다.
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s1에 두 SFX를 붙인다 - 혀를 깨무는 순간(cold_zing,
 *  REGISTRY "순간적 통증·놀람 리액션 전반 재사용 가능") / 하드 컷으로 이미 나은 모습을
 *  보여주는 순간(realize_ding, REGISTRY "발견·자각 리액션 전반 재사용 가능"). 둘 다
 *  내레이션(volume=1.6)보다 낮은 볼륨으로 보조음 수준을 유지한다(cold_zing 관례 0.75,
 *  realize_ding 관례 0.85).
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
  S1BiteHeal, S1_BITE_SFX_AT_FRAME, S1_CUT_FRAME,
  S2React, S3Saliva, S4VesselCompare, S5Deliver, S6DaysCompare, S7ScarCompare, S8Dental,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무성) - 발화 길이로 잴 대상이 없어 대본이 지정한 동작 길이를 쓴다 */
const SILENT_DURATION_S1 = 2.5;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문) 다음이 곧바로 설명(s3)으로 넘어가는 전환이라 원칙 4에 따라 기본
 *  여백보다 길게 준다. 다른 전환은 프로필 기본 여백(NARRATED_PAD=0.2s) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const COLD_ZING_FRAMES = 11; // cold_zing.mp3 실측 0.30초(30fps 9프레임) + 여유
const REALIZE_DING_FRAMES = 12; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] = buildCaptions(
    [s2, s3, s4, s5, s6, s7, s8], lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1BiteHeal as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Saliva as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4VesselCompare as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Deliver as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6DaysCompare as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7ScarCompare as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
    {
      Component: S8Dental as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, frames: frames[7] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'];

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
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s1: 혀를 깨무는 순간 */}
        <Sequence from={starts[0] + S1_BITE_SFX_AT_FRAME} durationInFrames={COLD_ZING_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.75} />
        </Sequence>
        {/* s1: 하드 컷으로 이미 나은 모습을 보여주는 순간 */}
        <Sequence from={starts[0] + S1_CUT_FRAME} durationInFrames={REALIZE_DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.85} />
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
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
