/** 본편 조립. Intro + TitleCard + 7개 장면(전부 3인칭 설명 내레이션) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import {
  S1Hook, S2Dry, S3Wetting, S4Absorb, S5Compare, S6Montage, S7Dry, s4LockFrame, s6ArriveFrame,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

const NARRATED_PAD = 0.2;
const SEGMENT_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
const SCENE_PAD = SEGMENT_IDS.map(() => NARRATED_PAD);

/** ui_tap 효과음: s4에서 정지 배지가 뚜렷해지는 프레임(scenes.tsx의 s4LockFrame)에
 *  맞춰 재생(원칙 7). realize_ding 효과음: s6에서 벌이 동쪽 꽃에 도달하는 프레임
 *  (s6ArriveFrame)에 맞춰 재생. 두 장면 모두 언어별로 길이가 달라 프레임도 언어별로
 *  다시 계산한다(ep76 water_splash와 동일 패턴). */
const UI_TAP_FRAMES = 3; // ui_tap.mp3 실측 0.10초(30fps 3프레임)
const REALIZE_DING_FRAMES = 9; // realize_ding.mp3 실측 0.30초(30fps 9프레임)

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
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [
    linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7,
  ] = buildCaptions([s1, s2, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Hook as unknown as SceneSpec['Component'], frames: frames[0], props: { frames: frames[0], lines: linesS1 } },
    { Component: S2Dry as unknown as SceneSpec['Component'], frames: frames[1], props: { frames: frames[1], lines: linesS2 } },
    { Component: S3Wetting as unknown as SceneSpec['Component'], frames: frames[2], props: { frames: frames[2], lines: linesS3 } },
    { Component: S4Absorb as unknown as SceneSpec['Component'], frames: frames[3], props: { frames: frames[3], lines: linesS4 } },
    { Component: S5Compare as unknown as SceneSpec['Component'], frames: frames[4], props: { frames: frames[4], lines: linesS5 } },
    { Component: S6Montage as unknown as SceneSpec['Component'], frames: frames[5], props: { frames: frames[5], lines: linesS6 } },
    { Component: S7Dry as unknown as SceneSpec['Component'], frames: frames[6], props: { frames: frames[6], lines: linesS7 } },
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
        {SEGMENT_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s4: 정지 배지가 뚜렷해지는 순간 - "톡" 클릭음(원칙 7, ui_tap.mp3 재사용 -
         *  줄기가 멈춰 고정되는 무성 액션에) */}
        <Sequence from={starts[3] + s4LockFrame(frames[3])} durationInFrames={UI_TAP_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.9} />
        </Sequence>

        {/* s6: 벌이 동쪽 꽃에 도달하는 순간 - 발견의 딩(원칙 7, realize_ding.mp3 재사용 -
         *  "왜 이 꽃에 벌이 더 오는지" 발견하는 순간에) */}
        <Sequence from={starts[5] + s6ArriveFrame(frames[5])} durationInFrames={REALIZE_DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.85} />
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
