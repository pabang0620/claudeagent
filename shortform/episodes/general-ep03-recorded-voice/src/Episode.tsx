/** 본편 조립. Intro + TitleCard + 5개 장면 + Outro. locale 로 ko/en 을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import enMouthRaw from '../public/audio/en_mouth.json';
import {
  S1RecordTap, S1_PLAY_TAP_FRAC, S1_STOP_TAP_FRAC, S2React, S3VoicePaths, S4VoicePaths,
  S5VoicePaths, wrapCounts,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(녹음 -> 정지 -> 재생 탭)은 내레이션이 없는 순수 동작 구간이라 대본이 지정한 길이를
 *  그대로 쓴다(양 언어 공통, 대본 추정치 0.0~2.0초와 일치). */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;

/** s2(리액션 "어, 목소리가 다르게 들려.")가 끝나고 곧바로 s3(설명)이 시작되면 리액션이 던진
 *  궁금증이 숨 쉴 틈이 없다 - ep01 v9 에서 확정된 원칙(shortform-builder.md 원칙 4)을 그대로
 *  따라 **이 전환만** 여백을 늘린다. 다른 전환(s1->s2, s3->s4, s4->s5)은 기본 여백 그대로. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5] = words.segments;

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale),
    s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5] = buildCaptions([s2, s3, s4, s5], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1RecordTap as unknown as SceneSpec['Component'], frames: frames[0], props: { frames: frames[0] } },
    {
      Component: S2React as unknown as SceneSpec['Component'],
      frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3VoicePaths as unknown as SceneSpec['Component'],
      frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4VoicePaths as unknown as SceneSpec['Component'],
      frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5VoicePaths as unknown as SceneSpec['Component'],
      frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5'];

  // s1 은 언어 무관 고정 길이라 starts[0]=0 이 항상 같다 - "정지"/"재생" 탭 효과음 프레임을
  // scenes.tsx 의 S1RecordTap 과 같은 비율 상수(S1_STOP_TAP_FRAC/S1_PLAY_TAP_FRAC)로 계산해
  // 시각 애니메이션과 어긋나지 않게 한다.
  const s1Frames = frames[0];
  const stopTapFrame = Math.round(s1Frames * S1_STOP_TAP_FRAC);
  const playTapFrame = Math.round(s1Frames * S1_PLAY_TAP_FRAC);
  const TAP_SFX_FRAMES = 6; // ui_tap.mp3 실측 0.10초(30fps 3프레임)에 여유를 더했다

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
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 정지 버튼 탭 - "톡" 클릭음 (언어 무관 공용 자산) */}
        <Sequence from={starts[0] + stopTapFrame} durationInFrames={TAP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.75} />
        </Sequence>
        {/* s1: 재생 버튼 탭 - 같은 "톡" 클릭음 재사용 */}
        <Sequence from={starts[0] + playTapFrame} durationInFrames={TAP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/ui_tap.mp3')} volume={0.75} />
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
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
