/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성 + s2~s7 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(냉동실에서 꺼낸 얼음 하나를 컵에 떨어뜨리는 동작)은 무성 구간이라 발화 길이가 없다 -
 *  general-ep01의 S1Bite/general-ep81의 S1Wipe와 같은 원칙으로 대본이 지정한 고정 길이
 *  (SILENT_DURATION_S1=2.2초)를 그대로 쓴다.
 *
 *  s2("어? 이 얼음, 가운데만 왜 이렇게 뿌옇지?" - 리액션+훅 질문) 다음이 곧바로 s3(설명)로
 *  이어지는 전환이라 원칙 4에 따라 기본 여백(0.2초)보다 길게 준다(S2_TO_S3_PAD=0.6초,
 *  general-ep81과 같은 이유). s1->s2 전환은 컵에 얼음을 떨어뜨리는 동작에서 바로 반응으로
 *  이어지는 연속 동작이라 추가 여백 없이 0으로 둔다(ep81의 s1->s2와 동일 판단).
 *
 *  s1 무성 구간 - 얼음이 컵 바닥에 닿는 순간 "쨍" 소리(ice_clink, 원칙 7, general-ep83 신규
 *  SFX). scenes.tsx S1Drop의 낙하 진행도(S1_DROP_START~S1_DROP_END_FRAC*frames) 안에서
 *  IceFloatCup.floatCube가 실제로 안착하는 지점(약 75%)에 맞춰 SFX 시작 프레임을 계산한다 -
 *  두 파일이 각자 매직넘버를 갖지 않도록 scenes.tsx가 export한 상수를 그대로 가져다 쓴다.
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
  S1Drop, S1_DROP_END_FRAC, S1_DROP_START, S1_LANDING_FRAC,
  S2React, S3Dissolve, S4Freeze, S5Scatter, S6Compare, S7Final,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(얼음을 컵에 떨어뜨리는 동작)은 무성 - 발화 길이로 잴 대상이 없어 대본이 지정한
 *  동작 길이를 쓴다 */
const SILENT_DURATION_S1 = 2.2;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문) 다음이 곧바로 설명(s3)으로 넘어가는 전환이라 원칙 4에 따라 기본
 *  여백보다 길게 준다. 다른 전환은 프로필 기본 여백(NARRATED_PAD=0.2s) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** s1: 얼음이 컵 바닥에 닿는 순간 ice_clink(원칙 7). scenes.tsx의 낙하 진행도 공식과
 *  동일한 계산으로 SFX 시작 프레임을 구한다(매직넘버 중복 없이 상수를 그대로 가져다 씀). */
const ICE_CLINK_SFX_FRAMES = 7; // ice_clink.mp3 실측 0.22초(30fps 6.6프레임 -> 7프레임)

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
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
    {
      Component: S1Drop as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0] },
    },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Dissolve as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Freeze as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Scatter as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Compare as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Final as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7'];

  // s1 낙하 진행도(scenes.tsx S1Drop과 동일 공식) 안에서 안착 지점을 계산해 SFX 시작 프레임을 맞춘다
  const s1DropEnd = Math.round(frames[0] * S1_DROP_END_FRAC);
  const s1ClinkAt = Math.round(S1_DROP_START + S1_LANDING_FRAC * (s1DropEnd - S1_DROP_START));

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
        {/* s1: 얼음이 컵 바닥에 닿는 순간 */}
        <Sequence from={starts[0] + s1ClinkAt} durationInFrames={ICE_CLINK_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/ice_clink.mp3')} volume={0.85} />
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
