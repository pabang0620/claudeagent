/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7) + Outro.
 *  이번 배치(21~25화)는 영어 채널(Whymo) 운영 중단으로 한국어판만 만든다(builder 지시 명시) -
 *  locale 은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words/mouth)는
 *  그대로 유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
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
  S1SeeYawn, S2ReadWord, S3Closeness, S4CompareBars, S5Pulse, S6Dog, S7Growth,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** 내레이션이 전부 3인칭 설명체("누가 하품하는 걸 보기만 해도...")라 어느 장면도 캐릭터가
 *  직접 말하는 순간이 아니다 - ep07/ep08/ep15/ep18/ep19가 다이어그램 설명 장면에 립싱크를
 *  안 쓰는 것과 같은 원칙을, 이 화는 s1~s7 전 구간에 적용한다. s1(두 캐릭터가 하품을 따라
 *  하는 순간)·s2(글자를 읽다가 하품)·s6(주인이 하품)의 입 모양은 mouth.json(RMS) 대신
 *  각 씬이 계산한 하품 mouthOpen 곡선(YAWN 포즈 기반)을 쓴다 - 그래서 이 화는 rms_mouth.py로
 *  ko_mouth.json 을 만들었지만(원칙 2, 파이프라인 표준 절차) Episode.tsx/scenes.tsx 어디서도
 *  import 하지 않는다. */

const NARRATED_PAD = 0.2;
const SCENE_PAD = [
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

/** yawn_sigh 효과음(원칙 7, general-ep21 신설): 무성 반응 순간(캐릭터가 실제로 하품하는
 *  정점)에 짧게 붙인다. s1은 두 캐릭터가 순서대로 하품하므로 두 번(A/B) 배치한다. */
const YAWN_SFX_FRAMES = 18; // yawn_sigh.mp3 실측 0.6초(30fps 18프레임)

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  return WORDS_BY_LANG[locale].segments;
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
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] =
    buildCaptions([s1, s2, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    {
      Component: S1SeeYawn as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1 },
    },
    {
      Component: S2ReadWord as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, word: t.s2Word },
    },
    {
      Component: S3Closeness as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4CompareBars as unknown as SceneSpec['Component'], frames: frames[3],
      props: {
        frames: frames[3], lines: linesS4,
        closeLabel: t.s4LabelClose, strangerLabel: t.s4LabelStranger,
      },
    },
    {
      Component: S5Pulse as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6Dog as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6, badge: t.s6Badge },
    },
    {
      Component: S7Growth as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, badge: t.s7Badge },
    },
  ];

  // s1: 두 캐릭터가 순서대로 하품하는 정점 프레임(S1SeeYawn 내부 buildPeakRelease 인자로
  // 계산한 값과 동일해야 효과음이 애니메이션 정점에 정확히 맞는다 - scenes.tsx 의
  // S1_A_START/BUILD/PEAK, S1_B_START/BUILD/PEAK 참고: A는 [6+28, 6+28+24]=[34,58] 중간,
  // B는 [50+28, 50+28+24]=[78,102] 중간)
  const S1_A_YAWN_PEAK = 46;
  const S1_B_YAWN_PEAK = 90;
  // s6: 주인(Actor) 하품 정점(scenes.tsx 의 S6_OWNER_START/BUILD/PEAK: [10+26, 10+26+22]
  // =[36,58] 중간)
  const S6_OWNER_YAWN_PEAK = 47;

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
        {NARRATED_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 캐릭터 A가 먼저 하품하는 정점 */}
        <Sequence from={starts[0] + S1_A_YAWN_PEAK} durationInFrames={YAWN_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/yawn_sigh.mp3')} volume={0.75} />
        </Sequence>
        {/* s1: 캐릭터 B가 따라 하품하는 정점 */}
        <Sequence from={starts[0] + S1_B_YAWN_PEAK} durationInFrames={YAWN_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/yawn_sigh.mp3')} volume={0.65} />
        </Sequence>
        {/* s6: 주인이 하품하는 정점 */}
        <Sequence from={starts[5] + S6_OWNER_YAWN_PEAK} durationInFrames={YAWN_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/yawn_sigh.mp3')} volume={0.7} />
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
