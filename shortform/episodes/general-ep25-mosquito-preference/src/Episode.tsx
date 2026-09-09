/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7) + Outro.
 *  이번 배치(21~25화)는 영어 채널(Whymo) 운영 중단으로 한국어판만 만든다(builder 지시 명시) -
 *  locale 은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
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
  S1Group, S1_RING_SFX_FRAME,
  S2Breath,
  S3SkinDetect, S3_SNIFF_SFX_FRAME,
  S4CompareSkin,
  S5TempSweat,
  S6BloodType, S6_CARD_SFX_FRAME,
  S7Twins, S7_MOSQ_SFX_FRAME,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** 내레이션이 전부 3인칭 설명체("여러 명이 같이 있어도...")라 어느 장면도 캐릭터가 직접
 *  말하는 순간이 아니다 - ep19/ep21/ep23이 다이어그램/설명 장면에 립싱크를 안 쓰는 것과
 *  같은 원칙을 이 화 s1~s7 전 구간에 적용한다. rms_mouth.py 로 ko_mouth.json 은 만들었지만
 *  (원칙 2, 파이프라인 표준 절차) Episode.tsx/scenes.tsx 어디서도 import 하지 않는다. */

const NARRATED_PAD = 0.2;
const SCENE_PAD = [
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];
const NARRATED_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

/** 무성 핵심 액션에 붙이는 짧은 효과음(원칙 7). 전부 기존 라이브러리 파일을 재사용한다(신규
 *  합성 없음). s1: 모기가 특정 대상으로 "정해지는" 순간에 ui_tap(선택/락온 느낌).
 *  s3: 모기가 피부 냄새를 감지하는 순간에 sniff_snort("동물 킁킁·냄새 맡기 동작 전반
 *  재사용 가능"으로 REGISTRY에 등록된 그대로 재사용). s7: 쌍둥이 둘에게 동시에 모기가
 *  나타나는 순간에 bubble_pop("동시에 짝을 이루는 등장"을 알리는 팝). */
const TAP_SFX_FRAMES = 3; // ui_tap.mp3 실측 0.10초(30fps 3프레임)
const SNIFF_SFX_FRAMES = 9; // sniff_snort.mp3 실측 0.31초(30fps 9~10프레임)
const POP_SFX_FRAMES = 5; // bubble_pop.mp3 실측 0.18초(30fps 5~6프레임)

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
      Component: S1Group as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1 },
    },
    {
      Component: S2Breath as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, label: t.s2Label },
    },
    {
      Component: S3SkinDetect as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3, label: t.s3Label },
    },
    {
      Component: S4CompareSkin as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4, labelA: t.s4LabelA, labelB: t.s4LabelB },
    },
    {
      Component: S5TempSweat as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5, labelTemp: t.s5LabelTemp, labelSweat: t.s5LabelSweat },
    },
    {
      Component: S6BloodType as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6, note: t.s6Note },
    },
    {
      Component: S7Twins as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, badge: t.s7Badge },
    },
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
        {NARRATED_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 모기가 특정 대상으로 정해지는 순간 */}
        <Sequence from={starts[0] + S1_RING_SFX_FRAME} durationInFrames={TAP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.6} />
        </Sequence>
        {/* s3: 모기가 피부 냄새를 감지하는 순간 */}
        <Sequence from={starts[2] + S3_SNIFF_SFX_FRAME} durationInFrames={SNIFF_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/sniff_snort.mp3')} volume={0.7} />
        </Sequence>
        {/* s6: 혈액형 카드가 다 튀어나오는 순간 */}
        <Sequence from={starts[5] + S6_CARD_SFX_FRAME} durationInFrames={TAP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.55} />
        </Sequence>
        {/* s7: 쌍둥이 둘에게 동시에 모기가 나타나는 순간 */}
        <Sequence from={starts[6] + S7_MOSQ_SFX_FRAME} durationInFrames={POP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.6} />
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
