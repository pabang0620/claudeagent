/** 본편 조립. Intro + TitleCard + 8개 장면(s1 무성 + s2~s8 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만
 *  만든다 - locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는
 *  그대로 유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 21~100화 시리즈의 마지막 화지만, 대본에 자축·감사 인사·구독 유도 문구가
 *  없어(오케스트레이터 지시) 조립 순서·인트로·아웃트로는 다른 화와 완전히 동일한
 *  표준 템포로 만든다 - 특별 연출을 추가하지 않는다.
 *
 *  s1(캐릭터가 걷다 멈춰 이상한 구름을 올려다봄)은 무성 구간이라 발화 길이가 없다 -
 *  general-ep92/95/97과 같은 원칙으로 대본이 지정한 고정 길이(SILENT_DURATION_S1=2.5초)를
 *  그대로 쓴다.
 *
 *  s2("어, 저 구름은 왜 저렇게 생겼지? ... 자꾸 궁금해지네" - 리액션+훅 질문) 다음이
 *  곧바로 s3(설명)로 이어지는 전환이라 원칙 4에 따라 기본 여백(0.2초)보다 길게 준다
 *  (S2_TO_S3_PAD=0.6초, general-ep89/96/99와 같은 이유).
 *
 *  s7 자막 텍스트 보정: edge-tts WordBoundary가 "'왜?'를"(따옴표+물음표로 감싼 단어)을
 *  "왜"/"를" 두 토큰으로 쪼개면서 물음표와 양쪽 홑따옴표를 전부 누락시킨다(대사 자체·
 *  오디오 발음은 정상 - general-ep94 "'달'이라는" 사고와 같은 유형, 자막 표시 텍스트만
 *  보정한다, 21화 이후 결함 목록 "따옴표 등 특수문자" 항목). 두 토큰을 하나로 합쳐
 *  "'왜?'를"로 표시하고 타이밍은 두 토큰을 아우르는 구간(첫 토큰 시작 ~ 둘째 토큰 끝)을
 *  그대로 쓴다.
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s1이 구름을 알아채는 순간에 realize_ding SFX를
 *  붙인다(scenes.tsx의 S1_REALIZE_SFX_FRAME 참고).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData, WordTs } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import {
  S1Walk, S1_REALIZE_SFX_FRAME, S2React, S3Predict, S4Mismatch, S5Curiosity, S6Reward,
  S7Resume, S8Montage,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(캐릭터가 걷다 멈춰 구름을 올려다보는 동작)은 무성 - 발화 길이로 잴 대상이 없어
 *  대본이 지정한 동작 길이를 쓴다 */
const SILENT_DURATION_S1 = 2.5;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문) 다음이 곧바로 설명(s3)으로 넘어가는 전환이라 원칙 4에 따라 기본
 *  여백보다 길게 준다. 다른 전환은 프로필 기본 여백(NARRATED_PAD=0.2s) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

const REALIZE_DING_FRAMES = 15; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

/** edge-tts WordBoundary가 "'왜?'를"을 "왜"/"를" 두 토큰으로 쪼개며 따옴표·물음표를
 *  누락시키는 결함(general-ep94와 같은 유형)을 자막 표시 텍스트만 보정한다. 오디오는
 *  손대지 않는다 - 발음 자체는 정상이다. */
function fixS7Quote(words: WordTs[]): WordTs[] {
  const out: WordTs[] = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i].w === '왜' && words[i + 1]?.w === '를') {
      out.push({ w: "'왜?'를", s: words[i].s, e: words[i + 1].e });
      i += 1;
    } else {
      out.push(words[i]);
    }
  }
  return out;
}

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7Raw, s8] = words.segments;
  const s7: SegmentData = { ...s7Raw, words: fixS7Quote(s7Raw.words) };

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
    s8: wrapCounts(s8.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] = buildCaptions(
    [s2, s3, s4, s5, s6, s7, s8], lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Walk as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0] },
    },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Predict as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Mismatch as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Curiosity as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Reward as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Resume as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6], mouth },
    },
    {
      Component: S8Montage as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, frames: frames[7] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'];

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
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s1: 구름을 알아채는 순간 realize_ding (원칙 7) */}
        <Sequence from={starts[0] + S1_REALIZE_SFX_FRAME} durationInFrames={REALIZE_DING_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.8} />
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
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7, s8,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
