/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성, s2~s7 유성) + Outro.
 *  23화(커피 마시면 잠이 깨는 이유)는 영어 채널(Whymo) 운영 중단으로 한국어판만 만든다
 *  (builder 지시 명시). 그래도 STRINGS/words/mouth 는 다른 화와 같은 언어별 테이블 구조를
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
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
  S1Sip, S1_SIP_SFX_FRAME, S1_TOTAL_FRAMES, S1_YAWN_SFX_FRAME,
  S2Reaction, S3Buildup, S4Block, S5Blocked, S6Conclusion, S7Rush,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s2(리액션 "어, 커피 마시니까 잠이 확 깨네. 왜 이러지?")는 캐릭터 본인이 직접 말하는
 *  구간이라 mouth.json 으로 입을 움직인다. s1은 무성(scenes.tsx 의 buildPeakRelease 곡선을
 *  직접 씀), s3~s5·s7은 다이어그램 설명 장면, s6은 결론 정지 장면이라 캐릭터가 화자로
 *  보이지 않으므로 립싱크를 쓰지 않는다(ep07/ep08/ep15/ep18/ep19/ep21과 동일 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무성, 하품 -> 커피 한 모금)은 발화 길이로 잴 대상이 없어 scenes.tsx 의 애니메이션
 *  길이를 초 단위로 그대로 쓴다(ep01/ep02/ep08의 SILENT_DURATION 과 동일 패턴). */
const S1_DURATION_SEC = S1_TOTAL_FRAMES / 30;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "왜 이러지?") -> s3(설명, 아데노신이 쌓이는 원리)로 넘어가는 전환만 여백을
 *  늘린다(원칙 4의 5번, ep06/ep08/ep11/ep15/ep18/ep19와 동일한 이유 - 훅 질문 뒤에 숨 쉴
 *  틈을 준다). 다른 구간 전환은 기본 여백(0.2초) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7'];

/** 무성 구간·핵심 액션에 붙이는 짧은 효과음(원칙 7). s1: 하품 정점에 yawn_sigh, 커피를
 *  한 모금 마시는 정점에 sip_slurp(신규, general-ep23). s2: "확 깨네"를 말하는 순간에
 *  realize_ding. s4: 카페인이 자리에 완전히 정착하는 순간에 ui_tap("딱 들어맞는" 클릭감).
 *  s5: 신호가 막혀 X 표시가 뜨는 순간에 bubble_pop("차단됨"을 알리는 팝). */
const YAWN_SFX_FRAMES = 18; // yawn_sigh.mp3 실측 0.6초(30fps 18프레임)
const SIP_SFX_FRAMES = 9; // sip_slurp.mp3 실측 0.3초(30fps 9프레임)
const REALIZE_SFX_FRAMES = 9; // realize_ding.mp3 실측 0.30초(30fps 9프레임)
const REALIZE_SFX_OFFSET = 48; // s2 어절 "확"(1.613s ≈ 48프레임) 근방
const TAP_SFX_FRAMES = 3; // ui_tap.mp3 실측 0.10초(30fps 3프레임)
const TAP_SFX_OFFSET = 120; // s4 blockProgress 가 거의 1에 도달하는 시점(S4_BLOCK_END)
const POP_SFX_FRAMES = 5; // bubble_pop.mp3 실측 0.18초(30fps 5~6프레임)
const POP_SFX_OFFSET = 50; // s5 X 표시가 등장하기 시작하는 시점(S5_BLOCK_MARK_START)

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7] = words.segments;
  return [
    { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] },
    s2, s3, s4, s5, s6, s7,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] =
    buildCaptions([s2, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Sip as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Reaction as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Buildup as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2], label: t.s3Label },
    },
    {
      Component: S4Block as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], label: t.s4Label },
    },
    {
      Component: S5Blocked as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Conclusion as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Rush as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
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
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 하품 정점 */}
        <Sequence from={starts[0] + S1_YAWN_SFX_FRAME} durationInFrames={YAWN_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/yawn_sigh.mp3')} volume={0.75} />
        </Sequence>
        {/* s1: 커피를 한 모금 마시는 정점 */}
        <Sequence from={starts[0] + S1_SIP_SFX_FRAME} durationInFrames={SIP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/sip_slurp.mp3')} volume={0.8} />
        </Sequence>
        {/* s2: "확 깨네"를 말하는 발견 순간 */}
        <Sequence from={starts[1] + REALIZE_SFX_OFFSET} durationInFrames={REALIZE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.7} />
        </Sequence>
        {/* s4: 카페인이 자리에 완전히 정착하는 순간 */}
        <Sequence from={starts[3] + TAP_SFX_OFFSET} durationInFrames={TAP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.6} />
        </Sequence>
        {/* s5: 신호가 막혀 X 표시가 뜨는 순간 */}
        <Sequence from={starts[4] + POP_SFX_OFFSET} durationInFrames={POP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.65} />
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
