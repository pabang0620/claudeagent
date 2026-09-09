/** 본편 조립. Intro + TitleCard + 7개 장면(전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화(김치가 시어지고 익는 이유)는 s1~s7 전부 서술문이고 물음표로 끝나는 훅 질문이
 *  없다(general-ep49-autumn-leaves와 동일 패턴). 그래서 리액션 다음 설명으로 넘어가는
 *  확장 여백(0.5~0.7초) 규칙이 적용될 구간이 없고, 전 구간 기본 여백(NARRATED_PAD=0.2s)만
 *  쓴다. 캐릭터가 등장하는 장면이 없어 mouth.json은 routine으로만 로드하고 실제 씬에서는
 *  쓰지 않는다.
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
  S1Compare, S2Taste, S3Bacteria, S4Seal, S5Acid, S6Bubble, S7Timelapse,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
const SCENE_PAD = [NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** s6: 기포가 위쪽에서 사라지는 순간(로컬 프레임 비율) 근처에 "톡톡" 기포 SFX 2회 -
 *  bubbleProgress가 각 기포(phase 0/0.32/0.6)의 local이 0.85 부근(위에서 사라지기 직전)에
 *  도달하는 시점을 scenes.tsx의 bubbleProgress 계산식(progress(f, frames*0.15, frames*0.95))
 *  과 동일한 비율로 역산했다. */
const S6_BUBBLE_SFX_RATIOS = [0.45, 0.72];
const BUBBLE_SFX_FRAMES = 6; // bubble_pop.mp3 실측 0.18초(30fps 5.4프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    [s1, s2, s3, s4, s5, s6, s7], lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Compare as unknown as SceneSpec['Component'], frames: frames[0],
      props: { lines: linesS1, frames: frames[0] },
    },
    {
      Component: S2Taste as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1] },
    },
    {
      Component: S3Bacteria as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Seal as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Acid as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Bubble as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Timelapse as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
  ];

  const narratedIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

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
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s6: 기포 SFX 2회 - 내레이션보다 낮은 볼륨 */}
        {S6_BUBBLE_SFX_RATIOS.map((ratio, i) => (
          <Sequence
            key={`bubble${i}`}
            from={starts[5] + Math.round(frames[5] * ratio)}
            durationInFrames={BUBBLE_SFX_FRAMES} layout="none"
          >
            <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.6} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={STRINGS[locale].outroNextTitle} nextHint={STRINGS[locale].outroNextHint} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [s1, s2, s3, s4, s5, s6, s7];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
