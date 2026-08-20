/** 본편 조립. Intro + TitleCard + 4개 장면(s1~s4) + Outro. locale 로 ko/en 을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
 *
 *  이 화는 s1(무성 - 흔들고 개봉하는 동작 자체)만 빼면 캐릭터가 화면에 얼굴을 보이며 말하는
 *  구간이 없다(s2~s4 는 전부 SodaCan 그래픽 + 내레이션 조합). 그래서 general-ep01 과 달리
 *  mouth.json 은 만들되(원칙 2, 파이프라인 표준 산출물) 어느 씬에서도 쓰지 않는다 - 립싱크가
 *  필요한 바스트샷 자체가 이 화에 없기 때문이다.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher, TitleCard,
  TITLE_CARD_FRAMES, buildCaptions, sceneFrames, sceneStarts, wrapCounts,
} from '../../../assets';
import type { SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import { S1Burst, S1_BURST_PEAK_LOCAL, S2Compare, S3Scatter, S4AllAtOnce, s4OpenWindow } from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};

/** s1(개봉·분출)은 내레이션이 없는 순수 동작 구간이라 발화 길이로 잴 대상이 없다.
 *  대본이 지정한 동작 길이(0:00-2.00)를 그대로 쓴다 (양 언어 공통). */
const SILENT_DURATION_S1 = 2.0;
/** 이 화는 리액션->설명 전환이 없으므로(v2 에서 리액션 대사 자체를 삭제) 전 구간이
 *  프로필 기본 여백(0.2초) 그대로다 - 원칙 4의 특수 전환 여백 규칙은 적용 대상이 없다. */
const NARRATED_PAD = 0.2;
const SCENE_PAD = [0, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** 효과음 SFX 프레임 길이 (fizz_open.mp3 실측 0.35초 = 30fps 약 10.5프레임 + 여유) */
const FIZZ_SFX_FRAMES = 13;

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4] = words.segments;

  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s2: wrapCounts(s2.words, locale),
    s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale),
  };
  const [linesS2, linesS3, linesS4] = buildCaptions([s2, s3, s4], lineSpec);

  const t = STRINGS[locale];

  const scenes: SceneSpec[] = [
    { Component: S1Burst as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Compare as unknown as SceneSpec['Component'],
      frames: frames[1],
      props: { lines: linesS2, beforeLabel: t.before, afterLabel: t.after },
    },
    {
      Component: S3Scatter as unknown as SceneSpec['Component'],
      frames: frames[2],
      props: { lines: linesS3, frames: frames[2] },
    },
    {
      Component: S4AllAtOnce as unknown as SceneSpec['Component'],
      frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4'];

  // s4 의 열림 구간 끝(개봉 순간)은 씬 길이에 비례해 계산된다(scenes.tsx 의 s4OpenWindow 와
  // 동일 공식을 공유) - 언어별로 s4 길이(frames[3])가 다르므로 이 값도 언어별로 다시 구한다.
  const s4Burst = s4OpenWindow(frames[3]).end;

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

        {/* s1: 흔들다가 뚜껑을 여는 순간(개봉 임팩트) - "치이익" 분출 효과음.
         *  언어 무관 공용 자산(assets/audio/fizz_open.mp3). */}
        <Sequence from={starts[0] + S1_BURST_PEAK_LOCAL} durationInFrames={FIZZ_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/fizz_open.mp3')} volume={0.85} />
        </Sequence>

        {/* s4: 순환 구조의 클라이맥스 - 다수 지점에서 동시에 터지는 순간에 같은 효과음을 재사용 */}
        <Sequence from={starts[3] + s4Burst} durationInFrames={FIZZ_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/fizz_open.mp3')} volume={0.85} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={locale === 'ko' ? '다음 편' : 'Next up'}
          nextHint={locale === 'ko' ? '다음 편에서 또 다른 궁금증이 풀려요!' : 'Another curious question, coming up!'}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFramesFor = (locale: Locale) => {
  const words = WORDS_BY_LANG[locale];
  const [s2, s3, s4] = words.segments;
  const allSegments: SegmentData[] = [
    { id: 's1', text: '', duration: SILENT_DURATION_S1, words: [] },
    s2, s3, s4,
  ];
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
