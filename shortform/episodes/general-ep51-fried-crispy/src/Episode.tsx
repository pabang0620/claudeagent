/** 본편 조립. Intro + TitleCard + 7개 장면(s1 무성 + s2~s7 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  s1(뜨거운 기름에 튀김 반죽을 넣음)은 무성 동작 구간이라 발화 길이가 없다 -
 *  general-ep01의 S1Bite와 같은 원칙으로 대본이 지정한 고정 길이(SILENT_DURATION_S1)를
 *  그대로 쓴다.
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
  S1Fry, S1_BUBBLE_POP_FRAMES, S2React, S3Steam, S4Pore, S5Crack, S6Compare,
  S7Resoak, crackSnapFrame,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

/** s1(뜨거운 기름에 튀김 반죽을 넣음)은 무성 - 발화 길이로 잴 대상이 없어 대본이 지정한
 *  동작 길이를 쓴다 */
const SILENT_DURATION_S1 = 2.5;
const NARRATED_PAD = 0.2;
/** s2("이 소리, 뭔가 계속 보글보글 올라오네" - 리액션+훅 질문) 다음이 곧바로 설명(s3)으로
 *  넘어가는 전환이라 원칙 4에 따라 기본 여백보다 길게 준다(general-ep47의 S2_TO_S3_PAD와
 *  같은 이유 - 궁금해할 틈 없이 바로 설명이 붙지 않게 한다). 다른 전환은 프로필 기본
 *  여백(NARRATED_PAD=0.2s) 그대로 둔다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** s1 SFX: 반죽이 기름에 닿는 순간 + "보글보글" 기포 3회(scenes.tsx가 export하는 로컬
 *  프레임 상수를 그대로 쓴다 - 손으로 다시 맞추지 않는다) */
const BUBBLE_SFX_FRAMES = 6; // bubble_pop.mp3 실측 0.18초(30fps 5.4프레임) + 여유
const BITE_SFX_FRAMES = 8; // bite.mp3 실측 0.23초(30fps 6.9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5, s6, s7] = words.segments;

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale), s4: wrapCounts(s4.words, locale),
    s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale), s7: wrapCounts(s7.words, locale),
  };
  const [linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    [s2, s3, s4, s5, s6, s7], lineSpec,
  );

  const scenes: SceneSpec[] = [
    { Component: S1Fry as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2React as unknown as SceneSpec['Component'], frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    {
      Component: S3Steam as unknown as SceneSpec['Component'], frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4Pore as unknown as SceneSpec['Component'], frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Crack as unknown as SceneSpec['Component'], frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
    {
      Component: S6Compare as unknown as SceneSpec['Component'], frames: frames[5],
      props: { lines: linesS6, frames: frames[5] },
    },
    {
      Component: S7Resoak as unknown as SceneSpec['Component'], frames: frames[6],
      props: { lines: linesS7, frames: frames[6] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5', 's6', 's7'];
  const s5CrackSnap = crackSnapFrame(frames[4]);

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

        {/* s1: 반죽이 기름에 닿는 순간(첫 기포) + 이어지는 "보글보글" 기포 - 언어 무관
            공용 자산. 첫 기포(S1_BUBBLE_POP_FRAMES[0]=22)가 착지 직후 순간이라 별도
            "퐁당" SFX를 더 얹지 않는다(거의 동시에 겹쳐 재생되면 뭉개져 들린다) */}
        {S1_BUBBLE_POP_FRAMES.map((lf, i) => (
          <Sequence key={`bubble${i}`} from={starts[0] + lf} durationInFrames={BUBBLE_SFX_FRAMES} layout="none">
            <Audio src={staticFile('audio/bubble_pop.mp3')} volume={0.7} />
          </Sequence>
        ))}

        {/* s5: 균열이 갈라지는 순간 - 씹는 크런치 소리. 1차 렌더 실측(volumedetect)에서
            volume=1.0일 때 피크(-2.3dB)가 인접 내레이션 피크(-2.3~-2.9dB)와 사실상
            같아 원칙 7("SFX 개별 피크가 내레이션 피크보다 낮아야 한다")을 확실히
            만족하지 못했다. 0.65로 낮춰 재렌더 후 재측정한다. */}
        <Sequence from={starts[4] + s5CrackSnap} durationInFrames={BITE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bite.mp3')} volume={0.65} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={STRINGS[locale].outroNextTitle} nextHint={STRINGS[locale].outroNextHint} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4, s5, s6, s7,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
