/** 본편 조립. Intro + TitleCard + 5개 장면(s1 무성, s2~s5 유성) + Outro.
 *  locale 로 ko/en 을 완전히 분기한다(문자열은 strings.ts, 음성/자막 타이밍은 언어별
 *  words.json, 장면 구성·자산은 공용).
 *
 *  v5(02-script-v5.md): s1이 "눈 감고 목욕 -> 눈 뜸 -> 느낌표 팝인+SFX"의 무성 연출로
 *  재구성됐다(내레이션 "오래 목욕하고 나면" 삭제). ep01의 SILENT_DURATION 패턴을 그대로
 *  따른다 - s1은 TTS 실측 대신 scenes.tsx의 애니메이션 상수(S1_LOCAL_FRAMES)로 길이가
 *  정해지고, 언어 무관 동일 길이다. s2~s5는 v4에서 만든 TTS/립싱크 결과를 그대로 재사용한다
 *  (텍스트·rate·pitch 불변이라 재생성 불필요 - words.json/mouth.json의 s1 항목은 v4의 구버전
 *  유성 내레이션 잔재라 여기서는 읽지 않는다).
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
import { ICON_POPIN_START, S1Bath, S1_LOCAL_FRAMES, S2Wrinkle, S3Compare, S4Slip, S5Grip, wrapCounts } from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s2(쭈글쭈글 리액션, 바스트샷)는 캐릭터 본인이 직접 말하는 구간이라 mouth.json 으로 입을
 *  움직인다. s1은 v5부터 무성(립싱크 불필요), s3~s5는 다이어그램/아이콘 장면이라 캐릭터
 *  얼굴이 보이지 않으므로 립싱크를 쓰지 않는다(ep01과 동일한 원칙). */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

/** s1(무성, 눈 감음-뜸-아이콘 팝인)은 발화 길이로 잴 대상이 없어 scenes.tsx 의 애니메이션
 *  상수(S1_LOCAL_FRAMES)를 초 단위로 그대로 쓴다(ep01의 SILENT_DURATION_S1과 동일 패턴). */
const S1_DURATION_SEC = S1_LOCAL_FRAMES / 30;
const NARRATED_PAD = 0.2;
/** s2(리액션 "어, 쭈글쭈글해졌네. 왜 이러지?") -> s3(설명)로 넘어가는 전환만 여백을 늘린다.
 *  원칙 4의 5번(ep01 v9 선례)과 같은 이유 - 훅 질문 뒤에 숨 쉴 틈을 준다. 다른 전환은 기본
 *  여백(0.2초) 그대로 둔다. s1은 애니메이션 자체에 이미 홀드(비트4)가 포함돼 있어 추가 pad가
 *  필요 없다(ep01 SILENT s1과 동일하게 0).
 */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [0, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD];

/** realize_ding SFX 타이밍. s1은 언어 무관 고정 길이(S1_DURATION_SEC)라 starts[0]이 ko/en
 *  두 로케일 모두 항상 0이므로, 아이콘 팝인 시작 프레임(scenes.tsx의 ICON_POPIN_START)에
 *  맞춘 SFX 배치도 언어 공용으로 고정할 수 있다. */
const REALIZE_DING_SFX_FRAMES = 12; // realize_ding.mp3 실측 0.30초(30fps 9프레임) + 여유

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(words: WordsFile): SegmentData[] {
  const [, s2, s3, s4, s5] = words.segments;
  const s1: SegmentData = { id: 's1', text: '', duration: S1_DURATION_SEC, words: [] };
  return [s1, s2, s3, s4, s5];
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const allSegments = buildAllSegments(words);
  const [, s2, s3, s4, s5] = allSegments;

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
    { Component: S1Bath as unknown as SceneSpec['Component'], frames: frames[0] },
    {
      Component: S2Wrinkle as unknown as SceneSpec['Component'],
      frames: frames[1],
      props: { lines: linesS2, mouth },
    },
    {
      Component: S3Compare as unknown as SceneSpec['Component'],
      frames: frames[2],
      props: { frames: frames[2], lines: linesS3, locale },
    },
    {
      Component: S4Slip as unknown as SceneSpec['Component'],
      frames: frames[3],
      props: { frames: frames[3], lines: linesS4, locale },
    },
    {
      Component: S5Grip as unknown as SceneSpec['Component'],
      frames: frames[4],
      props: { frames: frames[4], lines: linesS5, locale },
    },
  ];

  const narratedIds = ['s2', 's3', 's4', 's5'];

  return (
    // SceneSwitcher 첫 장면의 8프레임 fade-in 동안 렌더 캔버스 기본색(검정)이 비치는 것을
    // 막기 위해 루트에 배경색을 지정한다(ep01 v2 검수에서 발견된 공용 결함, 같은 처리를 따름).
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

        {/* s1: 눈을 뜨는 순간 느낌표 아이콘이 팝인하는 "발견의 순간" - 경쾌한 인지 신호음.
         *  언어 무관 공용 자산(assets/audio/realize_ding.mp3). */}
        <Sequence from={starts[0] + ICON_POPIN_START} durationInFrames={REALIZE_DING_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.85} />
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
  const allSegments = buildAllSegments(words);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const mainTotal = frames.reduce((a, b) => a + b, 0);
  return INTRO_FRAMES + TITLE_CARD_FRAMES + mainTotal + OUTRO_FRAMES;
};

export default Episode;
