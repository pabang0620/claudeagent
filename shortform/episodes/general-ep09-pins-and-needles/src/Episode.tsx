/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7) + Outro. locale로 ko/en을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
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
  S1Press, S1_COMPRESS_LAND_FRAME, S2Surprised, S3Weaken, S4Release, S5CrossLegged,
  S6FolkTrick, S7Recovery,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션+훅 질문)·s6(민간요법 설명)은 캐릭터가 직접 대사를 말하는 바스트샷 구간이라
 *  mouth.json을 쓴다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(다리가 눌리는 모습)은 내레이션이 없는 순수 정적 구간이라 발화 길이로 잴 대상이 없다.
 *  대본이 지정한 동작 길이(약 2.2초)를 그대로 쓴다(양 언어 공통). */
const SILENT_DURATION_S1 = 2.2;
const NARRATED_PAD = 0.2;
/** s2("으엇, 다리가 왜 이렇게 찌릿찌릿하지?" 훅 질문) -> s3(설명) 전환만 원칙 4에 따라
 *  여백을 늘린다. 질문이 던져진 뒤 바로 설명이 붙으면 궁금해할 틈이 없다는 지적(ep01 v9,
 *  ep06에서도 동일 패턴 적용)과 같다. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6, s7]. pad[i]는 구간 i "끝"에 붙는 여백이다.
 *  pad[1](s2)만 늘리고 나머지는 프로필 기본 여백(0.2s) 그대로 쓴다. */
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6', 's7'];

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
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
    { Component: S1Press as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Surprised as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Weaken as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, label: t.s3Label },
    },
    {
      Component: S4Release as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], label: t.s4Label },
    },
    {
      Component: S5CrossLegged as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, label: t.s5Label },
    },
    {
      Component: S6FolkTrick as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, label: t.s6Label },
    },
    {
      Component: S7Recovery as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6], label: t.s7Label },
    },
  ];

  // s1이 완전히 눌린 순간(무성 구간, 원칙 7) - hop_thump로 "지금 뭘 하는지"를 읽히게 한다.
  // s2 리액션 순간(찌릿찌릿) - cold_zing으로 따끔거리는 느낌을 보탠다(REGISTRY: "순간적
  // 통증·놀람 리액션 전반 재사용 가능"으로 이미 등록된 효과음, 신규 제작 없음).
  const HOP_THUMP_FRAMES = 6; // hop_thump.mp3 실측 0.15초(30fps 4.5프레임) + 여유
  const COLD_ZING_FRAMES = 11; // cold_zing.mp3 실측 0.30초(30fps 9프레임) + 여유
  const S2_REACT_START = 4;

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

        <Sequence from={starts[0] + S1_COMPRESS_LAND_FRAME} durationInFrames={HOP_THUMP_FRAMES} layout="none">
          <Audio src={staticFile('audio/hop_thump.mp3')} volume={0.8} />
        </Sequence>
        <Sequence from={starts[1] + S2_REACT_START} durationInFrames={COLD_ZING_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.75} />
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
