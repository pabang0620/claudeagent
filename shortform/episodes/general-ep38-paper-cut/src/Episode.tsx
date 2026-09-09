/** 본편 조립. Intro + TitleCard + 6개 장면(s1~s6 전부 유성) + Outro.
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 만든다 -
 *  locale은 'ko' 하나뿐이지만, 다른 화와 같은 언어별 테이블 구조(STRINGS/words)는
 *  그대로 유지해 향후 영어 채널이 재개되면 en 블록만 채우면 되게 한다.
 *
 *  이 화는 대본 s1이 "리액션+훅" 역할을 겸한다(질문형 훅이 아니라 사실 진술형 도입 -
 *  general 프로필 3절). 그래서 다른 화(s1 무성 + s2 훅질문)와 달리 s1부터 립싱크를
 *  연결한다(builder 원칙 5 예방 체크리스트 - 리액션 대사 장면에 립싱크 누락 금지).
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
  S1Cut, S2NerveDensity, S3PaperVsBlade, S4Tear, S5LittleBlood, S6NerveExposed,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
};
/** s1(리액션+훅 진술)만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json을 쓴다. s2~s6은
 *  3인칭 설명 내레이션이 다이어그램 위에 흐르는 구간이라 캐릭터가 등장하지 않는다
 *  (ep06/ep22/ep24/ep33/ep35/ep37 등과 동일하게 다이어그램 장면엔 립싱크를 쓰지 않는다). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
/** s1(리액션+훅) -> s2(설명 시작) 전환만 원칙 4에 따라 여백을 늘린다. 다른 전환은
 *  프로필 기본 여백(0.2s)을 그대로 쓴다. */
const S1_TO_S2_PAD = 0.6;

/** allSegments = [s1, s2, s3, s4, s5, s6]. pad[i]는 구간 i "끝"에 붙는 여백이다. */
const SCENE_PAD = [S1_TO_S2_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** s1 - 종이 끝에 손가락이 닿는 순간(scenes.tsx S1Cut의 cutAt = frames*0.56)에 맞춘
 *  통증 SFX(원칙 7, cold_zing 재사용 - REGISTRY 설명 "순간적 통증·놀람 리액션 전반
 *  재사용 가능"과 정확히 일치해 신규 합성 없이 그대로 썼다). */
const S1_CUT_SFX_AT = 0.56;
const CUT_SFX_FRAMES = 9; // cold_zing.mp3 실측 0.30초(30fps 9프레임)

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s1, s2, s3, s4, s5, s6] = words.segments;

  const allSegments = words.segments;
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6] = buildCaptions(
    [s1, s2, s3, s4, s5, s6], lineSpec,
  );

  const scenes: SceneSpec[] = [
    {
      Component: S1Cut as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1, mouth },
    },
    {
      Component: S2NerveDensity as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2 },
    },
    {
      Component: S3PaperVsBlade as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3 },
    },
    {
      Component: S4Tear as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5LittleBlood as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6NerveExposed as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
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
        {['s1', 's2', 's3', 's4', 's5', 's6'].map((id, i) => (
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}
        {/* s1: 종이 끝에 손가락이 닿는 순간 */}
        <Sequence
          from={starts[0] + Math.round(frames[0] * S1_CUT_SFX_AT)}
          durationInFrames={CUT_SFX_FRAMES} layout="none"
        >
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.85} />
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
