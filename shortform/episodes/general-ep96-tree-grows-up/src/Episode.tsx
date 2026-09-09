/** 본편 조립. Intro + TitleCard + 8개 장면(s1은 무성 - 언덕 위 나무들, 나머지는 s2 리액션
 *  +립싱크 / s3~s8 다이어그램 설명) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(무성)은 발화 길이로 잴 대상이 없어 대본이 지정한 고정 길이(SILENT_DURATION_S1=2.5초,
 *  general-ep93의 SILENT_DURATION_S1과 같은 원칙)를 쓴다.
 *
 *  s2("왜 다 이 방향으로만 자라는 거지?" - 리액션+훅 질문) 다음이 곧바로 s3(설명 - 중력
 *  감지)로 이어지는 전환이라 원칙 4에 따라 기본 여백(0.2초)보다 길게 준다
 *  (S2_TO_S3_PAD=0.6초, general-ep87·ep89·ep91·ep93과 같은 이유). s1->s2 전환은 무성
 *  장면에서 리액션으로 바로 이어지는 연속 동작이라 추가 여백 없이 0으로 둔다.
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s1(카메라 팬 중간)에 leaf_rustle, s3(감지 기관이
 *  자리를 잡는 순간)과 s8(화분이 마침내 곧게 서는 결론 순간)에 realize_ding을 붙인다.
 *  내레이션(volume=1.6)보다 낮은 볼륨(0.8)으로 보조음 수준을 유지한다.
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
  S1Hillside, S1_RUSTLE_AT_FRAME,
  S2React,
  S3Sense, S3_DING_AT_FRAME,
  S4MultiAngle,
  S5Auxin,
  S6Dark,
  S7Confused,
  S8TiltCorrect, S8_DING_AT_FRAME,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

const SILENT_DURATION_S1 = 2.5;
const NARRATED_PAD = 0.2;
const S2_TO_S3_PAD = 0.6;
/** allSegments = [s1, s2, s3, s4, s5, s6, s7, s8]. pad[i]는 구간 i "끝"에 붙는 여백이다. */
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'];
const RUSTLE_FRAMES = 14; // leaf_rustle.mp3 실측 0.40초(12프레임) + 여유
const DING_FRAMES = 11; // realize_ding.mp3 실측 0.30초(9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
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
      Component: S1Hillside as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0] },
    },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth },
    },
    {
      Component: S3Sense as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4MultiAngle as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Auxin as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6Dark as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Confused as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7 },
    },
    {
      Component: S8TiltCorrect as unknown as SceneSpec['Component'], frames: frames[7],
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
        {NARRATED_IDS.map((id, i) => {
          // starts 는 [s1, s2, s3, s4, s5, s6, s7, s8] 순서 - s1(무성)은 오디오가 없으므로 건너뛴다.
          const sceneIndex = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].indexOf(id);
          return (
            <Sequence key={id} from={starts[sceneIndex]} durationInFrames={frames[sceneIndex]} layout="none">
              <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
            </Sequence>
          );
        })}
        <Sequence from={starts[0] + S1_RUSTLE_AT_FRAME} durationInFrames={RUSTLE_FRAMES} layout="none">
          <Audio src={staticFile('audio/leaf_rustle.mp3')} volume={0.8} />
        </Sequence>
        <Sequence from={starts[2] + S3_DING_AT_FRAME} durationInFrames={DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.8} />
        </Sequence>
        <Sequence from={starts[7] + S8_DING_AT_FRAME} durationInFrames={DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.8} />
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
  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
