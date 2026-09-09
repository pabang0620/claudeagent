/** 본편 조립. Intro + TitleCard + 6개 장면(s1 무성, s2~s6 유성) + Outro.
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
  S1Shrug, S1_TOTAL_FRAMES, S2Surprised, S3Muscle, S4Vestige, S5Animals, S6WordOrigin,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션 "어, 팔이 왜 이렇게 오돌토돌하지?")는 캐릭터 본인이 직접 말하는 구간이라
 *  mouth.json 으로 입을 움직인다. s1은 무성, s3~s6은 다이어그램/라벨 장면이라 캐릭터
 *  얼굴이 보이지 않으므로 립싱크를 쓰지 않는다(ep01·ep02와 동일한 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(무성, 찬바람 -> 웅크리고 떨림 -> 팔에 소름)은 발화 길이로 잴 대상이 없어 scenes.tsx 의
 *  애니메이션 길이를 초 단위로 그대로 쓴다(ep01/ep02의 SILENT_DURATION 과 동일 패턴).
 *  v2(2026-08-20): "추워서 떠는" 모션이 1.5~2.5초는 필요해 2.0초 -> 3.2초로 늘렸다
 *  (scenes.tsx S1_TOTAL_FRAMES 가 실제 애니메이션 길이의 SSOT). */
const S1_LOCAL_FRAMES = S1_TOTAL_FRAMES; // 96프레임 = 3.2초
const S1_DURATION_SEC = S1_LOCAL_FRAMES / 30;
const NARRATED_PAD = 0.2;
/** s2(리액션 "어, 팔이 왜 이렇게 오돌토돌하지?") -> s3(설명)로 넘어가는 전환만 여백을
 *  늘린다(원칙 4의 5번, ep01 v9/ep02/ep06 과 동일한 이유 - 훅 질문 뒤에 숨 쉴 틈을 준다).
 *  다른 전환은 기본 여백(0.2초) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6'];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6] = words.segments;
  return [
    { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] },
    s2, s3, s4, s5, s6,
  ];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6] =
    buildCaptions([s2, s3, s4, s5, s6], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Shrug as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Surprised as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Muscle as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2], label: t.s3Label },
    },
    {
      Component: S4Vestige as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], label: t.s4Label },
    },
    {
      Component: S5Animals as unknown as SceneSpec['Component'], frames: frames[4],
      props: {
        lines: linesS5, frames: frames[4], animal1: t.s5Animal1, animal2: t.s5Animal2,
        tagline: t.s5Tagline,
      },
    },
    {
      Component: S6WordOrigin as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, word: t.s6Word, meaning: t.s6Meaning },
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
