/** 본편 조립. Intro + TitleCard + 8개 장면(s1 무성 + s2~s8 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(코를 훌쩍이며 음식을 한 입 먹는데 표정이 밍밍한 동작)은 무성 구간이라 발화 길이가 없다 -
 *  general-ep01의 S1Bite/general-ep81의 S1Wipe와 같은 원칙으로 대본이 지정한 고정 길이
 *  (SILENT_DURATION_S1=2.6초 - 훌쩍임+한 입 먹기+밍밍한 정지, 세 박자를 담기 위해
 *  ep81의 2.0초보다 살짝 길게 잡았다)를 그대로 쓴다.
 *
 *  s2("어? 이거 원래 이런 맛이었나. 왜 아무 맛도 안 나지?" - 리액션+훅 질문) 다음이 곧바로
 *  s3(설명)로 이어지는 전환이라 원칙 4에 따라 기본 여백(0.2초)보다 길게 준다
 *  (S2_TO_S3_PAD=0.6초, general-ep50·ep81과 같은 이유). s1->s2 전환은 무성 동작에서
 *  리액션으로 바로 이어지는 연속 동작이라 추가 여백 없이 0으로 둔다(ep81의 s1->s2와 동일 판단).
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s1(훌쩍이는 순간에 sniff_snort, 한 입 먹는 순간에
 *  bite - 둘 다 재사용 SFX, general-ep19/ep01에서 이미 검증)과 s8(사탕을 무는 순간에 bite
 *  재사용)에 짧은 효과음을 붙인다. 전부 내레이션(volume=1.6)보다 낮은 0.8~0.85로 보조음
 *  수준을 유지한다.
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
  S1Bite, S1_BITE_SFX_AT_FRAME, S1_SNIFF_SFX_AT_FRAME,
  S2React, S3Tastes, S4Point, S5Pathway, S6Blocked, S7Contrast, S8Confused,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(무성) - 발화 길이로 잴 대상이 없어 대본이 지정한 동작 길이를 쓴다 */
const SILENT_DURATION_S1 = 2.6;
const NARRATED_PAD = 0.2;
/** s2(리액션+훅 질문) 다음이 곧바로 설명(s3)으로 넘어가는 전환이라 원칙 4에 따라 기본
 *  여백보다 길게 준다. 다른 전환은 프로필 기본 여백(NARRATED_PAD=0.2s) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [
  0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
];

/** s1: 훌쩍이는 순간 sniff_snort, 한 입 먹는 순간 bite (원칙 7). scenes.tsx의 로컬 프레임
 *  상수를 그대로 가져다 쓴다 - 여기서 다시 추정하지 않는다 */
const SNIFF_SFX_FRAMES = 9; // sniff_snort.mp3 실측 0.31초(30fps 9프레임)
const BITE_SFX_FRAMES = 7; // bite.mp3 실측 0.23초(30fps 7프레임)
/** s8: 사탕을 무는 순간(candyA가 최고조에서 사그라들기 시작하는 지점, scenes.tsx candyA 정의와
 *  동일한 비율 - frames*0.5) bite 재사용 */
const S8_BITE_SFX_AT_RATIO = 0.5;

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7, s8] = words.segments;

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
    { Component: S1Bite as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Tastes as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Point as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], mouth },
    },
    {
      Component: S5Pathway as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Blocked as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Contrast as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
    {
      Component: S8Confused as unknown as SceneSpec['Component'], frames: frames[7],
      props: { lines: linesS8, frames: frames[7], mouth },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7', 's8'];
  const s8BiteSfxAt = starts[7] + Math.round(frames[7] * S8_BITE_SFX_AT_RATIO);

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
        {/* s1: 훌쩍임 + 한 입 먹기 */}
        <Sequence from={starts[0] + S1_SNIFF_SFX_AT_FRAME} durationInFrames={SNIFF_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/sniff_snort.mp3')} volume={0.75} />
        </Sequence>
        <Sequence from={starts[0] + S1_BITE_SFX_AT_FRAME} durationInFrames={BITE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bite.mp3')} volume={0.85} />
        </Sequence>
        {/* s8: 사탕을 무는 순간 */}
        <Sequence from={s8BiteSfxAt} durationInFrames={BITE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bite.mp3')} volume={0.8} />
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
