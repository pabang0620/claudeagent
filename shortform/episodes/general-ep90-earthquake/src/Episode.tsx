/** 본편 조립. Intro + TitleCard + 8개 장면(전부 무성 캐릭터 없는 다이어그램 - 립싱크 연결
 *  없음, 원칙과 동일하게 순수 설명 내레이션 구조) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s6(슬립이 순간적으로 튀는 순간, "확 풀려나가요")에 thunder_boom SFX(원칙 7, general-ep46
 *  신규 - "폭발·먼 충격음 등 낮은 rumble 전반 재사용 가능"으로 이미 등록돼 있어 새로 합성하지
 *  않고 그대로 재사용) 를 얹는다. scenes.tsx의 S6_SNAP_AT_FRAC(스냅이 튀는 지점)에 맞춰
 *  SFX 시작 프레임을 계산한다.
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
  S1Drift, S2Push, S3Lock, S4Build, S5Compare, S6Slip, S6_SNAP_AT_FRAC, S7Quake, S8Aftershock,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

const NARRATED_PAD = 0.2;
const SCENE_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
const SCENE_PAD = SCENE_IDS.map(() => NARRATED_PAD);

/** s6: 암석이 순간적으로 미끄러지는 지점에 낮은 우르릉 소리(원칙 7) */
const THUNDER_SFX_FRAMES = 18; // thunder_boom.mp3 실측 0.60초(30fps 18프레임)

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7, s8] = words.segments;
  const allSegments = [s1, s2, s3, s4, s5, s6, s7, s8];

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale), s8: wrapCounts(s8.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] = buildCaptions(
    allSegments, lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1Drift as unknown as SceneSpec['Component'], frames: frames[0], props: { frames: frames[0], lines: linesS1 } },
    { Component: S2Push as unknown as SceneSpec['Component'], frames: frames[1], props: { frames: frames[1], lines: linesS2 } },
    { Component: S3Lock as unknown as SceneSpec['Component'], frames: frames[2], props: { frames: frames[2], lines: linesS3 } },
    { Component: S4Build as unknown as SceneSpec['Component'], frames: frames[3], props: { frames: frames[3], lines: linesS4 } },
    { Component: S5Compare as unknown as SceneSpec['Component'], frames: frames[4], props: { frames: frames[4], lines: linesS5 } },
    { Component: S6Slip as unknown as SceneSpec['Component'], frames: frames[5], props: { frames: frames[5], lines: linesS6 } },
    { Component: S7Quake as unknown as SceneSpec['Component'], frames: frames[6], props: { frames: frames[6], lines: linesS7 } },
    { Component: S8Aftershock as unknown as SceneSpec['Component'], frames: frames[7], props: { frames: frames[7], lines: linesS8 } },
  ];

  // s6: 슬립이 순간적으로 튀는 지점(scenes.tsx S6_SNAP_AT_FRAC과 동일 계산) 직후 우르릉 소리
  const s6SnapAt = Math.round(frames[5] * S6_SNAP_AT_FRAC);

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
        {SCENE_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s6: 암석이 순간적으로 미끄러지는 지점의 우르릉 소리 */}
        <Sequence from={starts[5] + s6SnapAt} durationInFrames={THUNDER_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/thunder_boom.mp3')} volume={0.85} />
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
  const allSegments = words.segments;
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
