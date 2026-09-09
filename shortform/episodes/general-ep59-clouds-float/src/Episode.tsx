/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성 + s2~s7 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(하늘 위 구름을 올려다봄)은 무성 동작 구간이라 발화 길이가 없다 - general-ep51/ep55와
 *  같은 원칙으로 대본이 지정한 고정 길이(SILENT_DURATION_S1)를 그대로 쓴다.
 *  s2("저 구름, 왜 안 떨어지지" - 리액션+훅 질문) 다음이 곧바로 설명(s3)으로 넘어가는
 *  전환이라 원칙 4에 따라 기본 여백보다 길게 준다(S2_TO_S3_PAD).
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
  S1Look, S2React, S3Droplets, S4Fall, S5Updraft, S6Weigh, S7Rain,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(하늘 위 구름을 올려다봄)은 무성 - 발화 길이로 잴 대상이 없어 대본이 지정한
 *  동작 길이를 쓴다(02-script-v1.md s1 구간 추정 0.0-3.0s) */
const SILENT_DURATION_S1 = 3.0;
const NARRATED_PAD = 0.2;
/** s2("저 구름, 다 물로 됐다는데 왜 안 떨어지고 계속 떠 있지" - 리액션+훅 질문) 다음이
 *  곧바로 설명(s3)으로 넘어가는 전환이라 원칙 4에 따라 기본 여백보다 길게 준다
 *  (general-ep47/ep51의 S2_TO_S3_PAD와 같은 이유). 다른 전환은 기본 여백 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** s1 SFX: 캐릭터가 구름을 가리키며 "알아채는" 순간(POINT_UP 팔이 다 올라간 직후) *
 *  realize_ding.mp3 - "어? 뭔가 알아챘다" 발견의 순간 사운드(REGISTRY 재사용, 신규 제작 없음) */
const S1_REALIZE_FRAME = 24;
const REALIZE_SFX_FRAMES = 10; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유
/** s7 SFX: 비가 쏟아지기 시작하는 순간 water_splash.mp3(REGISTRY 재사용, "촤르르" 물소리) */
const S7_RAIN_START_FRAME = 10;
const RAIN_SFX_FRAMES = 11; // water_splash.mp3 실측 0.36초(30fps 10.8프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    [s2, s3, s4, s5, s6, s7], lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1Look as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Droplets as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Fall as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Updraft as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Weigh as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Rain as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7'];

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={TITLE_CARD_FRAMES} layout="none">
        <TitleCard title={STRINGS[locale].title} />
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 알아채는 순간 딩 */}
        <Sequence from={starts[0] + S1_REALIZE_FRAME} durationInFrames={REALIZE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.75} />
        </Sequence>

        {/* s7: 비가 쏟아지기 시작하는 순간 물소리 */}
        <Sequence from={starts[6] + S7_RAIN_START_FRAME} durationInFrames={RAIN_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/water_splash.mp3')} volume={0.6} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={STRINGS[locale].outroNextTitle} nextHint={STRINGS[locale].outroNextHint} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
