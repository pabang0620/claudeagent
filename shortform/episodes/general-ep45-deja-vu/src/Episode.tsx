/** 본편 조립. Intro + TitleCard + 7개 장면(s1~s7 전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는 그대로
 *  유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 s1~s7 전부 내레이션이 있는 구간이다(대본에 무성 구간이나 리액션+훅 질문 구간이
 *  없음 - 첫 문장부터 사실로 바로 시작하는 general 프로필 규칙을 그대로 따름). 그래서 전
 *  구간이 실측 TTS 길이를 그대로 쓰고, 립싱크(mouthAt)도 쓰지 않는다 - 전 구간이 3인칭
 *  설명 내레이션이 화면 위에 흐르는 구조라 캐릭터가 대사를 "말하는" 장면이 없다
 *  (ep06/ep22/ep24/ep33/ep35/ep37/ep39/ep41과 같은 원칙).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import {
  S1Enter, S2Term, S3Wonder, S4Overlap, S5_ECHO_AT, S5Process, S6Electrode, S6_CONTACT_FRAME,
  S7AgeBars,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};

const NARRATED_PAD = 0.2;
const SCENE_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];


/** realize_ding SFX. s5에서 오른쪽(지연) 반구 신호가 도착해 잔상이 맥동하기 시작하는 순간
 *  (MemoryOverlapDiagram의 S5_ECHO_AT 비율, 원칙 7 - 핵심 액션에 짧은 효과음)에 맞춘다. */
const REALIZE_DING_SFX_FRAMES = 10; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

/** cold_zing SFX. s6에서 전극이 이마에 닿는 순간(S6_CONTACT_FRAME)에 맞춘다. */
const COLD_ZING_SFX_FRAMES = 10; // cold_zing.mp3 실측 0.30초(30fps 9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const allSegments = words.segments;
  const [s1, s2, s3, s4, s5, s6, s7] = allSegments;

  const frames = sceneFrames(allSegments, NARRATED_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7] = buildCaptions(
    [s1, s2, s3, s4, s5, s6, s7], lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Enter as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1 },
    },
    {
      Component: S2Term as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2 },
    },
    {
      Component: S3Wonder as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Overlap as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Process as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6Electrode as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7AgeBars as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7 },
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
        {SCENE_IDS.map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s5: 오른쪽(지연) 반구 신호가 도착해 잔상이 맥동하기 시작하는 순간 */}
        <Sequence
          from={starts[4] + Math.round(frames[4] * S5_ECHO_AT)}
          durationInFrames={REALIZE_DING_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.75} />
        </Sequence>

        {/* s6: 전극이 이마에 닿는 순간 */}
        <Sequence
          from={starts[5] + S6_CONTACT_FRAME}
          durationInFrames={COLD_ZING_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.8} />
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
  const frames = sceneFrames(words.segments, NARRATED_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
