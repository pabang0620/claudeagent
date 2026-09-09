/** 본편 조립. Intro + TitleCard + 8개 장면(s1~s8, 전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는
 *  그대로 유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
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
  S1JoltAwake, S1_JOLT_SFX_FRAME, S2MuscleRelax, S3BrainWarning, S3_ALERT_SFX_FRAME,
  S4SignalArrow, S5JoltUp, S5_JOLT_SFX_FRAME, S6CavemanTree, S6_CATCH_SFX_FRAME,
  S7FallFlash, S7_WHOOSH_SFX_FRAME, S8CoffeeStress,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** mouth.json은 tts/rms_mouth 표준 파이프라인 산출물이라 그대로 생성해 두지만, 8개 구간
 *  전부 3인칭 설명 내레이션이라(scenes.tsx 상단 주석 참고) 어느 장면도 mouthAt을 쓰지 않는다 -
 *  general-ep21과 동일한 판단. import 는 barrel 타입 정합만 맞추고 실제 사용은 없다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};
void MOUTH_BY_LANG;

const NARRATED_PAD = 0.2;
const SCENE_PAD = [
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

/** SFX 재생 길이 - 각 mp3 실측(assets/REGISTRY.md 오디오 절)보다 살짝 여유를 둔 프레임 수 */
const COLD_ZING_SFX_FRAMES = 12; // 실측 0.30초(9프레임) + 여유
const REALIZE_DING_SFX_FRAMES = 12; // 실측 0.30초(9프레임) + 여유
const HOP_THUMP_SFX_FRAMES = 8; // 실측 0.15초(5프레임) + 여유
const HEAD_WHOOSH_SFX_FRAMES = 10; // 실측 0.24초(7프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  return words.segments;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7, s8] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale), s8: wrapCounts(s8.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] = buildCaptions(
    [s1, s2, s3, s4, s5, s6, s7, s8], lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1JoltAwake as unknown as SceneSpec['Component'], frames: frames[0], props: { lines: linesS1 } },
    { Component: S2MuscleRelax as unknown as SceneSpec['Component'], frames: frames[1], props: { lines: linesS2 } },
    { Component: S3BrainWarning as unknown as SceneSpec['Component'], frames: frames[2], props: { lines: linesS3 } },
    { Component: S4SignalArrow as unknown as SceneSpec['Component'], frames: frames[3], props: { lines: linesS4 } },
    { Component: S5JoltUp as unknown as SceneSpec['Component'], frames: frames[4], props: { lines: linesS5 } },
    { Component: S6CavemanTree as unknown as SceneSpec['Component'], frames: frames[5], props: { lines: linesS6 } },
    { Component: S7FallFlash as unknown as SceneSpec['Component'], frames: frames[6], props: { lines: linesS7 } },
    { Component: S8CoffeeStress as unknown as SceneSpec['Component'], frames: frames[7], props: { lines: linesS8 } },
  ];

  const narratedIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

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
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 침대에서 잠들다 "움찔하면서" 어절에 맞춰 놀람 리액션 사운드 */}
        <Sequence from={starts[0] + S1_JOLT_SFX_FRAME} durationInFrames={COLD_ZING_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.9} />
        </Sequence>

        {/* s3: 뇌가 "위험" 신호로 착각하는 순간 - 경고 아이콘 팝인에 맞춘 인지 신호음 */}
        <Sequence from={starts[2] + S3_ALERT_SFX_FRAME} durationInFrames={REALIZE_DING_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.85} />
        </Sequence>

        {/* s5: 그 바람에 몸이 튀어 오르는 클라이맥스 - 착지/스냅 통 소리 */}
        <Sequence from={starts[4] + S5_JOLT_SFX_FRAME} durationInFrames={HOP_THUMP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/hop_thump.mp3')} volume={1.0} />
        </Sequence>

        {/* s6: 나무에서 미끄러지다 붙잡는 순간 - 같은 놀람 리액션 사운드 재사용(주제상 동일 반사) */}
        <Sequence from={starts[5] + S6_CATCH_SFX_FRAME} durationInFrames={COLD_ZING_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.9} />
        </Sequence>

        {/* s7: 번쩍임 직전 스치는 느낌 - 휙 소리 */}
        <Sequence from={starts[6] + S7_WHOOSH_SFX_FRAME} durationInFrames={HEAD_WHOOSH_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/head_whoosh.mp3')} volume={0.75} />
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
