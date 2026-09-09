/** 본편 조립. Intro + TitleCard + 6개 장면(s1 무성 + s2~s7 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(낙타가 사막을 걸으며 카메라가 혹으로 줌인)은 무성 구간이라 발화 길이가 없다 -
 *  general-ep01의 S1Bite/general-ep83의 S1Drop과 같은 원칙으로 대본이 지정한 고정 길이
 *  (SILENT_DURATION_S1=3.0초)를 그대로 쓴다.
 *
 *  s2("혹 안에 물이 가득 차 있는 거 아니었어? ..." - 리액션+훅 질문) 다음이 곧바로 s3(설명)로
 *  이어지는 전환이라 원칙 4에 따라 기본 여백(0.2초)보다 길게 준다(S2_TO_S3_PAD=0.6초,
 *  general-ep83/ep87과 같은 이유). s1->s2 전환은 걷다가 바로 반응하는 연속 동작이라 추가
 *  여백 없이 0으로 둔다.
 *
 *  s1 무성 구간 - 낙타 걸음이 땅에 닿는 순간 "통" 소리(hop_thump, 원칙 7, 재사용).
 *  s6(물웅덩이에서 벌컥벌컥 마심)은 내레이션이 있는 구간이지만 "마시는" 핵심 액션이라
 *  sip_slurp(원칙 7, 재사용)를 두 번 짧게 겹쳐 "벌컥벌컥"을 소리로도 보강한다 - 시각적으로는
 *  과장하지 않되(오케스트레이터 지시) 소리 리듬으로만 여러 번 마시는 느낌을 준다.
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
  S1Walk, S1_STEP_AT, S2React, S3Reveal, S4Breakdown, S5Compare, S6Drink, S6_SIP_AT, S7Final,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(낙타가 사막을 걸어가는 동작)은 무성 - 발화 길이로 잴 대상이 없어 대본이 지정한
 *  동작 길이를 쓴다 */
const SILENT_DURATION_S1 = 3.0;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문) 다음이 곧바로 설명(s3)으로 넘어가는 전환이라 원칙 4에 따라 기본
 *  여백보다 길게 준다. 다른 전환은 프로필 기본 여백(NARRATED_PAD=0.2s) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const HOP_THUMP_SFX_FRAMES = 5; // hop_thump.mp3 실측 0.15초(30fps 4.5 -> 5프레임)
const SIP_SLURP_SFX_FRAMES = 9; // sip_slurp.mp3 실측 0.30초(30fps 9프레임)
/** s6 "벌컥벌컥" - sip_slurp 를 짧게 두 번 겹쳐 여러 번 마시는 리듬을 낸다(SFX 파일 자체는
 *  9프레임 길이라 15프레임 간격이면 겹치지 않고 이어진다) */
const S6_SIP_GAP = 15;

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
      Component: S1Walk as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0] },
    },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Reveal as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Breakdown as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Compare as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Drink as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Final as unknown as SceneSpec['Component'], frames: frames[6],
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
        <TitleCard title={t.title} />
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s1: 낙타 걸음이 땅에 닿는 순간 */}
        <Sequence from={starts[0] + S1_STEP_AT} durationInFrames={HOP_THUMP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/hop_thump.mp3')} volume={0.7} />
        </Sequence>
        {/* s6: 벌컥벌컥 마시는 순간 - 짧게 두 번 */}
        <Sequence from={starts[5] + S6_SIP_AT} durationInFrames={SIP_SLURP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/sip_slurp.mp3')} volume={0.75} />
        </Sequence>
        <Sequence from={starts[5] + S6_SIP_AT + S6_SIP_GAP} durationInFrames={SIP_SLURP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/sip_slurp.mp3')} volume={0.7} />
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
