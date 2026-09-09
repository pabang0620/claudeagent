/** 본편 조립. Intro + TitleCard + 6개 장면(s1 무성, s2~s7 유성 - s1은 화면구성표상 무성이라
 *  대사 없이 넘버링만 이어받는다) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(무성, 해변 타임랩스)은 발화 길이로 잴 대상이 없어 대본이 정한 길이(0:00-3.00)를 그대로
 *  초 단위로 쓴다(ep01/ep40/ep42의 SILENT_DURATION 패턴과 동일). s2(리액션+훅 "왜 벌써 이렇게
 *  빠졌지")만 캐릭터 본인의 대사라 립싱크(ko_mouth.json)를 연결한다. s3~s7은 3인칭 설명·
 *  다이어그램 구간이라 립싱크를 쓰지 않는다.
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
  S1Shore, S2Question, S3BulgeNear, S4BulgeFar, S5Rotate, S6Terms, S7Align,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s2("어, 아까는...")만 캐릭터 본인이 직접 말하는 구간이라 mouth.json으로 입을 움직인다.
 *  s3~s7은 다이어그램/무성 배경 재사용 장면이라 립싱크를 쓰지 않는다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무성, 해변 타임랩스)은 발화 길이로 잴 대상이 없어 대본이 정한 길이(0:00-3.00)를 그대로
 *  초 단위로 쓴다(ep01/ep40/ep42의 SILENT_DURATION 패턴과 동일). */
const S1_DURATION_SEC = 3.0;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "왜 벌써 이렇게 빠졌지") -> s3(설명 시작)로 넘어가는 전환만 여백을 늘린다
 *  (원칙 4 - 훅 질문 뒤에 숨 쉴 틈을 준다). 다른 전환은 기본 여백(0.2초)을 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
/** allSegments = [s1, s2, s3, s4, s5, s6, s7]. pad[i]는 구간 i 자신의 길이에 더해지는
 *  여백(=다음 구간 시작 전 여백)이다. 7개 구간 전부에 값이 있어야 한다. */
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** water_splash SFX. s1(무성) 안에서 수위선이 가장 뚜렷하게 빠지는 중간 지점에 물소리를 준다
 *  (원칙 7, "물로 헹구다/씻다 동작 전반 재사용 가능"으로 REGISTRY에 등록된 자산을 "물이
 *  빠지는" 무성 동작 전반으로 재사용). s1이 언어 무관 고정 길이라 starts[0](=0)은 항상 같은
 *  프레임이다. */
const WATER_SPLASH_AT_RATIO = 0.42; // s1 구간 길이 대비 비율
const WATER_SPLASH_SFX_FRAMES = 12; // water_splash.mp3 실측 0.36초(30fps 10.8프레임) + 여유

/** realize_ding SFX. s2가 "어"로 시작하는 발견의 순간(원칙 7)에 맞춘다 - ko_words.json 실측
 *  s2의 "어" 시작 0.088초(30fps 약 2.6프레임)에 맞춰 로컬 프레임 3에 건다. */
const REALIZE_DING_AT_FRAME = 3;
const REALIZE_DING_SFX_FRAMES = 10; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(words: WordsFile): SegmentData[] {
  const [s2, s3, s4, s5, s6, s7] = words.segments;
  const s1: SegmentData = { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] };
  return [s1, s2, s3, s4, s5, s6, s7];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const allSegments = buildAllSegments(words);
  const [, s2, s3, s4, s5, s6, s7] = allSegments;

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale),
    s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    [s2, s3, s4, s5, s6, s7], lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1Shore as unknown as SceneSpec['Component'], frames: frames[0], props: {} },
    {
      Component: S2Question as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth },
    },
    {
      Component: S3BulgeNear as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4BulgeFar as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Rotate as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6Terms as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Align as unknown as SceneSpec['Component'], frames: frames[6],
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
        {['s1', 's2', 's3', 's4', 's5', 's6', 's7'].map((id, i) => (
          i === 0 ? null : (
            <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
              <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
            </Sequence>
          )
        ))}

        {/* s1: 수위선이 가장 뚜렷하게 빠지는 지점 */}
        <Sequence
          from={starts[0] + Math.round(frames[0] * WATER_SPLASH_AT_RATIO)}
          durationInFrames={WATER_SPLASH_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/water_splash.mp3')} volume={0.65} />
        </Sequence>

        {/* s2: "어" 하고 알아채는 순간 */}
        <Sequence
          from={starts[1] + REALIZE_DING_AT_FRAME}
          durationInFrames={REALIZE_DING_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.8} />
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
  const words = WORDS_BY_LANG[locale];
  const allSegments = buildAllSegments(words);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
