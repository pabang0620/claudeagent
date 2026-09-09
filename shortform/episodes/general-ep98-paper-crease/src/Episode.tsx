/** 본편 조립. Intro + TitleCard + 7개 장면(전부 내레이션 있음 - 리액션/훅 질문 전환이 없어
 *  구간 간 여백은 전부 기본값 0.2초) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 대본에 캐릭터가 등장하지 않는다(02-script-v1.md 장면표에 캐릭터 언급 없음,
 *  general-ep82·ep94와 같은 전례). 전부 종이/섬유 다이어그램으로 진행한다.
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s2(종이가 접히는 순간)와 s6(손톱으로 눌러 자국을
 *  심화시키는 순간)에 paper_crease를 붙인다. 두 곳 다 내레이션이 있는 구간이지만, 원칙 7은
 *  "핵심 액션"에도 적용된다(무성 구간 한정이 아니다) - 접힘·누름이라는 순간적 동작에 소리가
 *  없으면 화면만으로 "지금 뭘 하는지"가 덜 읽힌다. 내레이션(volume=1.6)보다 낮은 볼륨(0.8).
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
  S1Weave,
  S2Fold, S2_CREASE_SFX_FRAME,
  S3SingleFiber,
  S4Compare,
  S5CreaseMark,
  S6Press, S6_CREASE_SFX_FRAME,
  S7Origami,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};
void MOUTH_BY_LANG; // 이 화는 캐릭터 립싱크가 없어 mouth.json을 참조하지 않는다(생성만 원칙대로 수행)

const NARRATED_PAD = 0.2;
const IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;
const SCENE_PAD = IDS.map(() => NARRATED_PAD);

const CREASE_SFX_FRAMES = 12; // paper_crease.mp3 실측 0.22초(7프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const [s1, s2, s3, s4, s5, s6, s7] = words.segments;
  const allSegments = words.segments;

  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] =
    buildCaptions([s1, s2, s3, s4, s5, s6, s7], lineSpec);

  const scenes: SceneSpec[] = [
    { Component: S1Weave as unknown as SceneSpec['Component'], frames: frames[0], props: { frames: frames[0], lines: linesS1 } },
    { Component: S2Fold as unknown as SceneSpec['Component'], frames: frames[1], props: { frames: frames[1], lines: linesS2 } },
    { Component: S3SingleFiber as unknown as SceneSpec['Component'], frames: frames[2], props: { frames: frames[2], lines: linesS3 } },
    { Component: S4Compare as unknown as SceneSpec['Component'], frames: frames[3], props: { frames: frames[3], lines: linesS4 } },
    { Component: S5CreaseMark as unknown as SceneSpec['Component'], frames: frames[4], props: { frames: frames[4], lines: linesS5 } },
    { Component: S6Press as unknown as SceneSpec['Component'], frames: frames[5], props: { frames: frames[5], lines: linesS6 } },
    { Component: S7Origami as unknown as SceneSpec['Component'], frames: frames[6], props: { frames: frames[6], lines: linesS7 } },
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
        {IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        <Sequence from={starts[1] + S2_CREASE_SFX_FRAME} durationInFrames={CREASE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/paper_crease.mp3')} volume={0.8} />
        </Sequence>
        <Sequence from={starts[5] + S6_CREASE_SFX_FRAME} durationInFrames={CREASE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/paper_crease.mp3')} volume={0.8} />
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
  const words = WORDS_BY_LANG[locale];
  const frames = sceneFrames(words.segments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
