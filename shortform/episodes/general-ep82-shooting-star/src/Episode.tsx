/** 본편 조립. Intro + TitleCard + 9개 장면(전부 3인칭 설명 내레이션 - 캐릭터가 화면에
 *  등장하지 않아 립싱크는 쓰지 않는다) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  원칙 7(핵심 액션 효과음): s1(별똥별이 대각선으로 스치는 순간)과 s6(마찰로 타버리는
 *  클라이맥스)에 새로 합성한 meteor_streak(REGISTRY 오디오 추록, "쐐액" 하강 스윕 + 마찰
 *  노이즈)을 짧게 붙인다. 내레이션(volume=1.6)보다 낮은 0.9로 보조음 수준을 유지한다.
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
  S1Hook, S2Drift, S3SizeCompare, S4Entry, S5SpeedCompare, S6Burn, S7Wrap, S8Comet, S9Shower,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

const NARRATED_PAD = 0.2;
const SCENE_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'];
const SCENE_PAD = SCENE_IDS.map(() => NARRATED_PAD);

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const allSegments = words.segments;

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec: Record<string, number[]> = {};
  allSegments.forEach((s) => { lineSpec[s.id] = wrapCounts(s.words, locale); });
  const allLines = buildCaptions(allSegments, lineSpec);
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8, linesS9] = allLines;

  const scenes: SceneSpec[] = [
    { Component: S1Hook as unknown as SceneSpec['Component'], frames: frames[0], props: { frames: frames[0], lines: linesS1 } },
    { Component: S2Drift as unknown as SceneSpec['Component'], frames: frames[1], props: { frames: frames[1], lines: linesS2 } },
    { Component: S3SizeCompare as unknown as SceneSpec['Component'], frames: frames[2], props: { frames: frames[2], lines: linesS3 } },
    { Component: S4Entry as unknown as SceneSpec['Component'], frames: frames[3], props: { frames: frames[3], lines: linesS4 } },
    { Component: S5SpeedCompare as unknown as SceneSpec['Component'], frames: frames[4], props: { frames: frames[4], lines: linesS5 } },
    { Component: S6Burn as unknown as SceneSpec['Component'], frames: frames[5], props: { frames: frames[5], lines: linesS6 } },
    { Component: S7Wrap as unknown as SceneSpec['Component'], frames: frames[6], props: { frames: frames[6], lines: linesS7 } },
    { Component: S8Comet as unknown as SceneSpec['Component'], frames: frames[7], props: { frames: frames[7], lines: linesS8 } },
    { Component: S9Shower as unknown as SceneSpec['Component'], frames: frames[8], props: { frames: frames[8], lines: linesS9 } },
  ];

  // 원칙 7 핵심 액션 효과음 큐: s1(streak 통과) 프레임 20, s6(타버리는 클라이맥스) 끝에서 28
  const sfxCues = [
    { from: starts[0] + 20, },
    { from: starts[5] + Math.max(10, frames[5] - 28) },
  ];

  return (
    <AbsoluteFill style={{ background: C.night }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={TITLE_CARD_FRAMES} layout="none">
        <TitleCard title={t.title} />
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {SCENE_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {sfxCues.map((cue, i) => (
          <Sequence key={`sfx-${i}`} from={cue.from} durationInFrames={16} layout="none">
            <Audio src={staticFile('audio/meteor_streak.mp3')} volume={0.9} />
          </Sequence>
        ))}
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
  const frames = sceneFrames(words.segments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
