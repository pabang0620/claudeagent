/** 본편 조립. Intro + TitleCard + 7개 장면(s1·s6·s7만 립싱크) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words/mouth)는
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
  S1Hook, S2Vibrate, S3Compare, S3_IMPACT_FRAC, S4Swell, S5Hoarse, S6Whisper, S6_WHOOSH_FRAC, S7Rest,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s1·s6·s7(캐릭터가 화면에 등장하는 구간)만 mouth.json을 쓴다. s2~s5는 다이어그램만
 *  진행되는 3인칭 설명 구간이라 캐릭터가 등장하지 않는다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
const SEGMENT_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
const SCENE_PAD = SEGMENT_IDS.map(() => NARRATED_PAD);

/** hop_thump.mp3(부딪힘) 실측 0.15초(30fps 4.5프레임) + 여유. */
const IMPACT_SFX_FRAMES = 9;
/** head_whoosh.mp3(마찰 바람) 실측 0.24초(30fps 7.2프레임) + 여유. */
const WHOOSH_SFX_FRAMES = 12;

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
  const mouth = MOUTH_BY_LANG[locale].mouth;
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
    { Component: S1Hook as unknown as SceneSpec['Component'], frames: frames[0], props: { frames: frames[0], lines: linesS1, mouth } },
    { Component: S2Vibrate as unknown as SceneSpec['Component'], frames: frames[1], props: { frames: frames[1], lines: linesS2 } },
    { Component: S3Compare as unknown as SceneSpec['Component'], frames: frames[2], props: { frames: frames[2], lines: linesS3 } },
    { Component: S4Swell as unknown as SceneSpec['Component'], frames: frames[3], props: { frames: frames[3], lines: linesS4 } },
    { Component: S5Hoarse as unknown as SceneSpec['Component'], frames: frames[4], props: { frames: frames[4], lines: linesS5 } },
    { Component: S6Whisper as unknown as SceneSpec['Component'], frames: frames[5], props: { frames: frames[5], lines: linesS6, mouth } },
    { Component: S7Rest as unknown as SceneSpec['Component'], frames: frames[6], props: { frames: frames[6], lines: linesS7, mouth } },
  ];

  // s3: 오른쪽("소리 지를 때") 다이어그램이 세게 부딪히는 지점 - S3Compare의 strainA 계산과
  // 같은 비율(S3_IMPACT_FRAC)에 hop_thump.mp3를 맞춘다(원칙 7).
  const s3ImpactLocal = Math.round(frames[2] * S3_IMPACT_FRAC);
  // s6: 좁은 틈으로 마찰 바람이 뚜렷해지는 지점 - S6Whisper의 whisperA 계산과 같은 비율
  // (S6_WHOOSH_FRAC)에 head_whoosh.mp3를 맞춘다.
  const s6WhooshLocal = Math.round(frames[5] * S6_WHOOSH_FRAC);

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

        {/* s3: 성대가 세게 부딪히는 순간 - 언어 무관 공용 자산(assets/audio/hop_thump.mp3 재사용). */}
        <Sequence from={starts[2] + s3ImpactLocal} durationInFrames={IMPACT_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/hop_thump.mp3')} volume={0.8} />
        </Sequence>

        {/* s6: 좁은 틈으로 바람이 억지로 지나가는 마찰 - 언어 무관 공용 자산(head_whoosh.mp3 재사용). */}
        <Sequence from={starts[5] + s6WhooshLocal} durationInFrames={WHOOSH_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/head_whoosh.mp3')} volume={0.7} />
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
