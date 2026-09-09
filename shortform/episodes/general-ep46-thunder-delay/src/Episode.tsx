/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성, s2~s7 유성) + Outro.
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
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import {
  S1Flash, S2_BOOM_AT, S2Startle, S3Launch, S4Race, S5SpeedBars, S6_LIGHT_ARRIVE_RATIO,
  S6_SOUND_ARRIVE_END_OFFSET, S6Arrival, S7Count,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s2(리액션 "어, 방금 번쩍했는데 왜 천둥은 이제 들리지?")는 캐릭터 본인이 직접 말하는
 *  구간이라 mouth.json으로 입을 움직인다. s1은 무성, s3~s7은 다이어그램/막대비교/카운터 등
 *  화자가 클로즈업되지 않는 장면이라 립싱크를 쓰지 않는다(ep16과 동일 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무성, 밤하늘에 번개가 번쩍이는 순간 자체)은 발화 길이로 잴 대상이 없어 대본 지시
 *  ("0:00-2.00") 그대로 2.0초를 쓴다(ep01/ep02/ep16 등의 SILENT_DURATION과 동일 패턴). */
const S1_LOCAL_FRAMES = 60; // 2.0초
const S1_DURATION_SEC = S1_LOCAL_FRAMES / 30;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "왜 천둥은 이제 들리지?") -> s3(설명, 동시 발생 전제)로 넘어가는 전환만
 *  여백을 늘린다(원칙 4의 5번, ep16과 동일한 이유 - 훅 질문 뒤에 숨 쉴 틈을 준다). 다른
 *  전환은 기본 여백(0.2초) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7'];

/** SFX 재생 길이 - 각 mp3 실측(assets/REGISTRY.md 오디오 절)보다 살짝 여유를 둔 프레임 수 */
const THUNDER_BOOM_SFX_FRAMES = 20; // thunder_boom.mp3 실측 0.60초(18프레임) + 여유
const REALIZE_DING_SFX_FRAMES = 12; // realize_ding.mp3 실측 0.30초(9프레임) + 여유

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

  // s6 인덱스는 allSegments 기준 5번째(0=s1) - S6Arrival 내부와 동일한 식으로 도착 프레임을 구해
  // SFX를 정확히 그 순간에 맞춘다.
  const s6Frames = frames[5];
  const s6LightArriveAt = Math.max(10, Math.round(s6Frames * S6_LIGHT_ARRIVE_RATIO));
  const s6SoundArriveAt = Math.max(s6LightArriveAt + 24, s6Frames - S6_SOUND_ARRIVE_END_OFFSET);

  const scenes: SceneSpec[] = [
    { Component: S1Flash as unknown as SceneSpec['Component'], frames: frames[0], props: {} },
    {
      Component: S2Startle as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Launch as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Race as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5SpeedBars as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5, lightLabel: t.s5LightLabel, soundLabel: t.s5SoundLabel },
    },
    {
      Component: S6Arrival as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Count as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, distanceLabel: t.s7Label },
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

        {/* s1 -> s2: 침묵 뒤에 천둥이 뒤늦게 도착해 캐릭터가 움찔하는 순간(원칙 7 - 무성
            구간 다음의 핵심 액션에 짧은 효과음). s1 자체는 대본 지시대로 무음을 유지하고,
            소리는 s2 시작과 동시에 "도착"한다 - 이 화의 핵심 개념(빛은 먼저 보이고 소리는
            늦게 들린다)을 SFX 배치 자체로 재현한다. */}
        <Sequence from={starts[1] + S2_BOOM_AT} durationInFrames={THUNDER_BOOM_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/thunder_boom.mp3')} volume={0.9} />
        </Sequence>

        {/* s6: 빛이 눈에 막 도착하는 순간 - 밝고 경쾌한 인지 신호음 */}
        <Sequence from={starts[5] + s6LightArriveAt} durationInFrames={REALIZE_DING_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.8} />
        </Sequence>

        {/* s6: 소리가 귀에 한참 늦게 도착하는 순간 - 낮은 우르릉(thunder_boom 재사용, 더 조용히) */}
        <Sequence from={starts[5] + s6SoundArriveAt} durationInFrames={THUNDER_BOOM_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/thunder_boom.mp3')} volume={0.6} />
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
