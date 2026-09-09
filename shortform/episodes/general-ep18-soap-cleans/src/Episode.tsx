/** 본편 조립. Intro + TitleCard + 8개 장면(s1 무성, s2~s8 유성) + Outro.
 *  locale 로 ko/en 을 완전히 분기한다(문자열은 strings.ts, 음성/자막 타이밍은 언어별
 *  words.json, 장면 구성·자산은 공용).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import enMouthRaw from '../public/audio/en_mouth.json';
import {
  S1_SPLASH_FRAME, S1Rinse, S2Shrug, S3Separate, S4Surfactant, S5Float, S6Wash, S7Virus,
  S8History, s7BurstFrame,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션 "어? 물로만 헹구는데 기름이 계속 남아있네. 왜 이러지?")는 캐릭터 본인이 직접
 *  말하는 구간이라 mouth.json 으로 입을 움직인다. s1은 무성, s3~s8은 다이어그램/아이콘/카드
 *  설명 장면이라 캐릭터가 화자로 보이지 않으므로 립싱크를 쓰지 않는다(ep07·ep08·ep15와
 *  동일 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(무성, 캐릭터가 물로만 접시를 헹구는데 기름이 그대로 남음)은 발화 길이로 잴 대상이
 *  없어 대본 지시("0:00-2.00") 그대로 2.0초를 쓴다(ep01/ep02/ep08/ep11/ep15의
 *  SILENT_DURATION과 동일 패턴). */
const S1_LOCAL_FRAMES = 60; // 2.0초
const S1_DURATION_SEC = S1_LOCAL_FRAMES / 30;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "왜 이러지?") -> s3(설명, 물/기름이 안 섞이는 이유)로 넘어가는 전환만
 *  여백을 늘린다(원칙 4의 5번, ep06/ep08/ep11/ep15와 동일한 이유 - 훅 질문 뒤에 숨 쉴 틈을
 *  준다). 다른 구간 전환은 기본 여백(0.2초) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'];

/** water_splash 효과음: s1 에서 첫 물방울이 접시(다이어그램 물통)에 닿는 프레임
 *  (scenes.tsx 의 S1_SPLASH_FRAME)에 정확히 맞춰 재생(원칙 7 - 무성 구간엔 핵심 액션에
 *  짧은 효과음). s1은 언어 무관 고정 길이라 starts[0]은 항상 0 - 언어 공용으로 고정할 수
 *  있다(ep04/ep15와 동일 패턴). */
const WATER_SFX_FRAMES = 11; // water_splash.mp3 실측 0.36초(30fps 11프레임)
/** bubble_pop 효과음: s7 에서 비누 분자가 바이러스의 기름막을 터뜨리는 순간
 *  (scenes.tsx 의 s7BurstFrame(frames))에 정확히 맞춰 재생. s7은 언어별로 길이가 달라
 *  starts[6]+s7BurstFrame(frames[6])을 언어별로 각각 계산한다. */
const BUBBLE_SFX_FRAMES = 6; // bubble_pop.mp3 실측 0.18초(30fps 6프레임)

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;
  return [
    { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] },
    s2, s3, s4, s5, s6, s7, s8,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] =
    buildCaptions([s2, s3, s4, s5, s6, s7, s8], lineSpec);

  const scenes: SceneSpec[] = [
    {
      Component: S1Rinse as unknown as SceneSpec['Component'], frames: frames[0],
      props: {},
    },
    {
      Component: S2Shrug as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth },
    },
    {
      Component: S3Separate as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Surfactant as unknown as SceneSpec['Component'], frames: frames[3],
      props: {
        frames: frames[3], lines: linesS4, headLabel: t.s4Head, tailLabel: t.s4Tail, termLabel: t.s4Term,
      },
    },
    {
      Component: S5Float as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5, micelleLabel: t.s5Micelle },
    },
    {
      Component: S6Wash as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6, suffix: t.s6Suffix },
    },
    {
      Component: S7Virus as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, beforeLabel: t.s7Before, afterLabel: t.s7After },
    },
    {
      Component: S8History as unknown as SceneSpec['Component'], frames: frames[7],
      props: { frames: frames[7], lines: linesS8, badge: t.s8Badge, label: t.s8Label },
    },
  ];

  const s7Start = starts[6];
  const s7BurstAt = s7Start + s7BurstFrame(frames[6]);

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

        {/* s1: 물방울이 접시에 닿는 순간 - "촤르르" 물소리(원칙 7, general-ep18 신설
         *  water_splash.mp3, REGISTRY 7절 "물로 헹구다/씻다 동작 전반 재사용 가능") */}
        <Sequence from={starts[0] + S1_SPLASH_FRAME} durationInFrames={WATER_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/water_splash.mp3')} volume={0.85} />
        </Sequence>

        {/* s7: 비누 분자가 바이러스의 기름막을 터뜨리는 순간 - "톡" 파열음(원칙 7,
         *  general-ep18 신설 bubble_pop.mp3, REGISTRY 7절 "막·거품이 터지는 순간 전반
         *  재사용 가능"). s7은 언어별 길이가 달라 burst 프레임도 언어별로 다시 계산한다. */}
        <Sequence from={s7BurstAt} durationInFrames={BUBBLE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.9} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro
          lang={locale}
          nextTitle={locale === 'ko' ? '다음 편' : 'Next up'}
          nextHint={locale === 'ko' ? '다음 편에서 또 다른 궁금증이 풀려요!' : 'Another curious question, coming up!'}
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
