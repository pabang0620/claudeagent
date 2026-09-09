/** 본편 조립. Intro + TitleCard + 7개 장면(s2는 무성 - 목뼈 개수 세기, 나머지는 3인칭 설명
 *  내레이션이라 다이어그램/소품 위에 흐르고 캐릭터 립싱크는 쓰지 않는다) + Outro.
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
  S1Hook, S2Count, S2_STEPS, S3LengthCompare, S4HandCompare, S5Commonality, S6Exception, S7Wrap,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

/** s2(목뼈 7칸 순서대로 점등)는 내레이션이 없는 무성 구간이라 발화 길이로 잴 대상이 없다.
 *  BoneStack 두 벌이 7단계까지 점등을 마치는 데 필요한 시간(2.6초)을 대본이 지정한 5초
 *  범위(0:05-0:10) 안에서 골랐다 - 실측 합계가 대본 추정보다 짧아도 늘리지 않는다는
 *  원칙에 따라, 애니메이션이 자연스럽게 끝나는 길이 그대로 쓴다(ep22 SILENT_DURATION 패턴과
 *  동일한 근거). */
const SILENT_DURATION_S2 = 2.6;
const NARRATED_PAD = 0.2;

/** allSegments = [s1, s2, s3, s4, s5, s6, s7]. pad[i]는 구간 i "끝"에 붙는 여백이다. */
const SCENE_PAD = [
  NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s1', 's3', 's4', 's5', 's6', 's7'];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s1, s3, s4, s5, s6, s7] = words.segments;
  return [
    s1,
    { id: 's2', text: '', duration: SILENT_DURATION_S2, words: [] },
    s3, s4, s5, s6, s7,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const [s1, s3, s4, s5, s6, s7] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS3, linesS4, linesS5, linesS6, linesS7] =
    buildCaptions([s1, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    {
      Component: S1Hook as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1 },
    },
    {
      Component: S2Count as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1] },
    },
    {
      Component: S3LengthCompare as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4HandCompare as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Commonality as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6Exception as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Wrap as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7 },
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
        {NARRATED_IDS.map((id, i) => {
          // starts 는 [s1, s2, s3, s4, s5, s6, s7] 순서 - s2(무성)는 오디오가 없으므로 건너뛴다.
          const sceneIndex = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'].indexOf(id);
          return (
            <Sequence key={id} from={starts[sceneIndex]} durationInFrames={frames[sceneIndex]} layout="none">
              <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
            </Sequence>
          );
        })}
        {/* s2(무성 - 목뼈 7칸 세기)는 원칙 7에 따라 핵심 액션(칸이 하나씩 켜지는 순간)마다
           ui_tap(REGISTRY 7절 - "화면 UI 탭·버튼 누름 동작 전반 재사용 가능", 무성 구간용으로
           이미 등록된 재사용 효과음)을 짧게 붙인다. 새로 합성하지 않고 기존 자산을 그대로
           재사용한다(원칙 0). 내레이션(volume=1.6)보다 낮은 0.8로 보조음 수준을 유지한다. */}
        {S2_STEPS.map((stepFrame, i) => (
          <Sequence
            key={`s2-tap-${i}`} from={starts[1] + stepFrame} durationInFrames={6} layout="none"
          >
            <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.8} />
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
  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
