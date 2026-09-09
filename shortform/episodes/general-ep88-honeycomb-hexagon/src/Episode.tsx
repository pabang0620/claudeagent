/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성 + s2~s7 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(무성, 벌이 육각형 방 3칸을 짓는다) - `SILENT_DURATION_S1`(대본 지정 3.0초, 언어 무관
 *  고정 길이 - ep01 s1과 동일 패턴)에 wax_tap SFX를 칸이 완성되는 3번 순간(scenes.tsx가
 *  export하는 `S1_HEX_TAP_FRAMES`, 매직넘버 중복 없이 그대로 가져다 씀)에 맞춰 재생한다.
 *
 *  s2(리액션+훅 질문, "와, 벌집은 다 육각형이네. 근데 눈송이 육각형이랑 같은 이유일까?")는
 *  script-ko.json에서 rate/pitch를 프로필 기본값보다 높여 급하고 놀란 톤으로 합성했다(1화
 *  브레인프리즈 v9와 동일 판단 - +32%/+55Hz). s2->s3(설명 시작) 전환만 여백을 0.6초로 늘려
 *  훅 질문이 숨 쉴 틈을 준다(원칙 4의 5번, 다른 전환은 프로필 기본 0.2초 그대로).
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
  S1Growth, S2React, S3Contrast, S4Energy, S5CircleSquare, S6Hexagon, S7Recap,
  S1_HEX_TAP_FRAMES,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(벌이 방을 짓는 무성 구간)은 발화가 없어 실측할 대상이 없으므로 대본이 지정한 동작
 *  길이를 그대로 쓴다(ep01 s1과 동일 패턴, 언어 무관 고정 길이). */
const SILENT_DURATION_S1 = 3.0;
const NARRATED_PAD = 0.2;
/** "같은 이유일까?"라는 훅 질문(s2) 다음 설명(s3)으로 바로 넘어가면 궁금해할 틈이 없다
 *  (원칙 4의 5번, ep01 v9와 동일 판단) - 이 전환만 늘린다. */
const S2_TO_S3_PAD = 0.6;
/** allSegments = [s1, s2, s3, s4, s5, s6, s7]. pad[i]는 구간 i "끝"에 붙는 여백이다. */
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** wax_tap.mp3 실측 0.18초(30fps 5.4프레임 -> 6프레임) */
const WAX_TAP_SFX_FRAMES = 6;

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7] = words.segments;

  // 전 구간(s1~s7)을 하나의 SegmentData 배열로 만들어 timeline.sceneFrames로 한 번에
  // 프레임화한다. s1은 duration을 대본 지정값으로, s2~s7은 TTS 실측값으로 채운다.
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
    { Component: S1Growth as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Contrast as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Energy as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], t },
    },
    {
      Component: S5CircleSquare as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Hexagon as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Recap as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6], mouth },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7'];
  const narratedFrames = [frames[1], frames[2], frames[3], frames[4], frames[5], frames[6]];
  const narratedStarts = [starts[1], starts[2], starts[3], starts[4], starts[5], starts[6]];

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
          <Sequence key={id} from={narratedStarts[i]} durationInFrames={narratedFrames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s1: 벌이 방 3칸을 완성하는 순간마다 wax_tap */}
        {S1_HEX_TAP_FRAMES.map((tapF, i) => (
          <Sequence key={`tap${i}`} from={starts[0] + tapF} durationInFrames={WAX_TAP_SFX_FRAMES} layout="none">
            <Audio src={staticFile('audio/wax_tap.mp3')} volume={0.7} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={t.outroNextTitle} nextHint={t.outroNextHint} />
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
