/** 본편 조립. Intro + 5개 장면 + Outro. locale 로 ko/en 을 완전히 분기한다
 *  (문자열은 strings.ts, 음성/자막 타이밍은 언어별 words.json, 장면 구성·자산은 공용).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import {
  C, FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES, SceneSwitcher,
  buildCaptions, sceneFrames, sceneStarts,
} from '../../../assets';
import type { MouthFile, SceneSpec, SegmentData } from '../../../assets';
import koWordsRaw from '../public/audio/ko_words.json';
import enWordsRaw from '../public/audio/en_words.json';
import koMouthRaw from '../public/audio/ko_mouth.json';
import enMouthRaw from '../public/audio/en_mouth.json';
import { S1Bite, S2Forehead, S3Cold, S4Nerve, S5Signal, wrapCounts } from './scenes';
import { Locale } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(v4부터 유성)의 립싱크 - 캐릭터가 직접 대사를 말하는 바스트샷이라 mouth.json 을 쓴다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** v4: s2(이마 리액션)가 무성 -> 유성으로 바뀌면서 이제 내레이션이 없는 순수 동작 구간은
 *  s1(아이스크림 한입)뿐이다. 발화 길이로 측정할 대상이 없으므로 대본이 지정한 동작 길이를
 *  그대로 쓴다 (양 언어 공통). */
const SILENT_DURATION_S1 = 2.0;
const NARRATED_PAD = 0.2;

/** v9: "왜 아픈 거지?" 라는 질문으로 s2 가 끝나고 곧바로 설명(s3)이 시작되면 시청자가
 *  궁금해할 틈이 없다는 지적(사용자 피드백)에 따라 **이 전환만** 여백을 늘린다. 다른 전환
 *  (s1->s2, s3->s4, s4->s5)은 프로필 기본 여백(NARRATED_PAD=0.2s)을 그대로 쓴다.
 *  timeline.ts 의 sceneFrames 는 이미 padSec 을 배열로 받아 구간별로 다른 여백을 줄 수 있게
 *  되어 있어(원칙 6 - 기존 기본 동작은 그대로, 옵션만 얹음) timeline.ts 자체는 손대지 않았다. */
const S2_TO_S3_PAD = 0.6;
/** allSegments = [s1, s2, s3, s4, s5]. pad[i] 는 구간 i "끝"에 붙는 여백이므로 pad[1](s2)을
 *  늘리면 s2 종료~s3 시작 사이의 텀만 늘어난다. Episode 본체와 totalFramesFor 양쪽에서 같은
 *  배열을 써야 프레임 수가 어긋나지 않으므로 모듈 스코프 상수 하나로 공유한다. */
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** 효과음 타이밍. s1 은 언어 무관 고정 길이(SILENT_DURATION_S1)라 starts[0] 이 ko/en 두
 *  로케일 모두 항상 같은 값(0)이 되므로 bite 타이밍은 언어 공용으로 고정할 수 있다.
 *  s2 는 v4부터 유성(발화 길이)이라 **길이**는 언어별로 달라지지만, s2의 **시작 프레임**
 *  (starts[1] = frames[0], 즉 s1 길이만으로 정해짐)은 여전히 두 언어 모두 동일하다 -
 *  cold_zing 은 s2 시작에 맞춰져 있으므로 이번 변경으로 재조정할 필요가 없었다(확인 완료).
 *
 *  - BITE_PEAK_LOCAL: scenes.tsx 의 S1Bite `bite = sin(min(1,progress(f,12,34))*PI)` 가
 *    최고점(진폭 1)을 찍는 로컬 프레임. progress(f,12,34) 의 중간값 0.5 지점 = 12+(34-12)*0.5 = 23.
 *    입이 가장 크게 벌어져 "베어 무는" 순간과 정확히 맞춘다.
 *  - COLD_ZING_AT_S2_START: s2(이마 짚는 리액션) 로컬 프레임 0, 즉 그 장면이 시작하는 순간. */
const BITE_PEAK_LOCAL = 23;
const BITE_SFX_FRAMES = 10; // bite.mp3 실측 0.23초(30fps 약 6.9프레임) + 여유
const COLD_ZING_SFX_FRAMES = 12; // cold_zing.mp3 실측 0.30초(30fps 9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s2, s3, s4, s5] = words.segments;

  // 전 구간(s1~s5) 을 하나의 SegmentData 배열로 만들어 timeline.sceneFrames 로 한 번에 프레임화한다.
  // s1 은 duration 을 대본 지정값으로, s2~s5 는 TTS 실측값으로 채운다(v4부터 s2도 실측).
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
    { Component: S1Bite as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Forehead as unknown as SceneSpec['Component'],
      frames: frames[1],
      props: { lines: linesS2, frames: frames[1], mouth },
    },
    { Component: S3Cold as unknown as SceneSpec['Component'], frames: frames[2], props: { lines: linesS3 } },
    {
      Component: S4Nerve as unknown as SceneSpec['Component'],
      frames: frames[3],
      props: { lines: linesS4, frames: frames[3] },
    },
    {
      Component: S5Signal as unknown as SceneSpec['Component'],
      frames: frames[4],
      props: { lines: linesS5, frames: frames[4] },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5'];

  return (
    // 배경을 명시하지 않으면 SceneSwitcher 의 첫 장면 fade-in(0->1, 8프레임) 동안
    // 렌더 캔버스 기본색(검정)이 인트로->본편 경계에서 한 프레임 정도 비쳐 보인다.
    // 본편 장면들이 전부 밝은 배경이라 paper 로 맞춰 그 결함을 없앤다.
    <AbsoluteFill style={{ background: C.paper }}>
      <FontLoader />

      <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
        <Intro lang={locale} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={mainTotal} layout="none">
        <SceneSwitcher scenes={scenes} starts={starts} />
        {narratedIds.map((id, i) => (
          <Sequence key={id} from={starts[i + 1]} durationInFrames={frames[i + 1]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s1: 아이스크림을 크게 베어 무는 순간(bite 애니메이션 피크) - "아삭" 효과음.
         *  언어 무관 공용 자산(assets/audio/bite.mp3). */}
        <Sequence from={starts[0] + BITE_PEAK_LOCAL} durationInFrames={BITE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/bite.mp3')} volume={0.9} />
        </Sequence>

        {/* s2 시작: 이마를 짚으며 놀라는 리액션 - "찌릿"한 시린 느낌 효과음.
         *  언어 무관 공용 자산(assets/audio/cold_zing.mp3). */}
        <Sequence from={starts[1]} durationInFrames={COLD_ZING_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/cold_zing.mp3')} volume={0.9} />
        </Sequence>
      </Sequence>

      <Sequence from={INTRO_FRAMES + mainTotal} durationInFrames={OUTRO_FRAMES} layout="none">
        <Outro lang={locale} nextTitle={locale === 'ko' ? '다음 편' : 'Next up'}
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
  return INTRO_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
