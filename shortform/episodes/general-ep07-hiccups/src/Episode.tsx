/** 본편 조립. Intro + TitleCard + 6개 장면(s1~s6) + Outro. locale 로 ko/en 을 완전히 분기한다
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
  S1Impact, S1_IMPACT_LOCAL_FRAME, S2Surprised, S3Diaphragm, S4Snap, S4_SNAP_END_FRAC,
  S5Record, S6Myth,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(리액션+훅 질문)·s6(속설, 전신)은 캐릭터가 직접 대사를 말하는 구간이라 mouth.json 을 쓴다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(딸꾹질 임팩트)은 내레이션이 없는 순수 동작 구간이라 발화 길이로 잴 대상이 없다.
 *  대본이 지정한 동작 길이를 그대로 쓴다 (양 언어 공통). */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;
/** s2("왜 갑자기 딸꾹질이 나지?" 훅 질문) -> s3(설명) 전환만 원칙 4에 따라 여백을 늘린다.
 *  다른 전환은 프로필 기본 여백(0.2s)을 그대로 쓴다. */
const S2_TO_S3_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6]. pad[i]는 구간 i "끝"에 붙는 여백이다.
 *  pad[1](s2)만 늘리고 나머지는 프로필 기본 여백 그대로 쓴다. */
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

const NARRATED_IDS = ['s2', 's3', 's4', 's5', 's6'];

/** hiccup_pop.mp3 재생 길이(프레임). 실측 0.20초(30fps 6프레임) + 여유(원칙 7 패턴). */
const HICCUP_POP_SFX_FRAMES = 10;

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6] = words.segments;
  return [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
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
  const [linesS2, linesS3, linesS4, linesS5, linesS6] = buildCaptions([s2, s3, s4, s5, s6], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Impact as unknown as SceneSpec['Component'], frames: frames[0], props: { popText: t.s1Pop } },
    {
      Component: S2Surprised as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Diaphragm as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, label: t.s3DiaphragmLabel },
    },
    {
      Component: S4Snap as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3], label: t.s4ThroatLabel },
    },
    {
      Component: S5Record as unknown as SceneSpec['Component'], frames: frames[4],
      props: {
        lines: linesS5, frames: frames[4], usualLabel: t.s5UsualLabel, recordLabel: t.s5RecordLabel,
        recordSuffix: t.s5RecordSuffix,
      },
    },
    {
      Component: S6Myth as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, mouth, mythLabel: t.s6MythLabel },
    },
  ];

  // s4의 목 입구가 완전히 닫히는 순간(S4Snap의 snapProgress 계산과 동일 공식) - hiccup_pop.mp3를
  // 여기에 정확히 맞춘다(원칙 7). s1의 임팩트 순간은 scenes.tsx가 export하는 상수를 그대로 쓴다.
  const s4SnapPeakLocal = Math.round(frames[3] * S4_SNAP_END_FRAC);

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

        {/* s1: 딸꾹질이 터지는 순간(Shake·FlashOverlay 정점) - "딸꾹" 소리 자체.
         *  언어 무관 공용 자산(assets/audio/hiccup_pop.mp3). */}
        <Sequence from={starts[0] + S1_IMPACT_LOCAL_FRAME} durationInFrames={HICCUP_POP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/hiccup_pop.mp3')} volume={0.85} />
        </Sequence>

        {/* s4: 목 입구가 완전히 닫히는 순간 - 같은 "딸꾹" 소리를 다이어그램 시점에서 다시 재생
         *  (대본 지시 - 화면이 "그때 나는 소리가 바로 이거예요"를 가리키는 지점과 동기화). */}
        <Sequence from={starts[3] + s4SnapPeakLocal} durationInFrames={HICCUP_POP_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/hiccup_pop.mp3')} volume={0.85} />
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
