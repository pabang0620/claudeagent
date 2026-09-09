/** 본편 조립. Intro + TitleCard + 8개 장면(s1~s8, 전부 유성 - v3 개정) + Outro.
 *  locale 로 ko/en 을 완전히 분기한다(문자열은 strings.ts, 음성/자막 타이밍은 언어별
 *  words.json, 장면 구성·자산은 공용).
 *
 *  v3(02-script-v3.md): s1을 무성 코 클로즈업 -> 유성 강아지 등장("몽뭉아!"/"Here, boy!")으로
 *  교체했다. 개 코 클로즈업(DogNoseCloseup)은 s2로 한 칸 밀렸을 뿐 내용은 그대로다.
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
  S1Greet, S2Discover, S3Slit, S4Airflow, S5Recap, S6FastBreath, S7Footage, S8WetNose,
} from './scenes';
import { Locale, STRINGS } from './strings';

interface WordsFile { segments: SegmentData[] }
const WORDS_BY_LANG: Record<Locale, WordsFile> = {
  ko: koWordsRaw as WordsFile,
  en: enWordsRaw as WordsFile,
};
/** s1("몽뭉아!"/"Here, boy!")과 s2(리액션 "어, 콧구멍 옆에 뭔가 신기한 게 있네. 이게 뭐지?")는
 *  캐릭터 본인이 직접 말하는 구간이라 mouth.json 으로 입을 움직인다. s3~s8은 다이어그램
 *  설명 장면이라 캐릭터가 화자로 보이지 않으므로 립싱크를 쓰지 않는다(ep07/ep08/ep15/ep18과
 *  동일 원칙) - v3에서 s1이 유성화되며 이 예외 목록에 s1이 추가됐다. */
const MOUTH_BY_LANG: Record<Locale, MouthFile> = {
  ko: koMouthRaw as MouthFile,
  en: enMouthRaw as MouthFile,
};

const NARRATED_PAD = 0.2;
/** s2(리액션+훅 "이게 뭐지?") -> s3(설명, 옆트임의 정체)로 넘어가는 전환만 여백을 늘린다
 *  (원칙 4의 5번, ep06/ep08/ep11/ep15/ep18과 동일한 이유 - 훅 질문 뒤에 숨 쉴 틈을 준다).
 *  다른 구간 전환(s1->s2 포함)은 기본 여백(0.2초) 그대로 둔다 - s1("몽뭉아!")은 훅 질문이
 *  아니라 단순 부름이라 추가 여백이 필요 없다. */
const S2_TO_S3_PAD = 0.6;
const SCENE_PAD = [
  NARRATED_PAD, S2_TO_S3_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD, NARRATED_PAD,
  NARRATED_PAD, NARRATED_PAD,
];

const NARRATED_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

/** sniff_snort 효과음: v2에서는 s1(무성, 코 클로즈업)에 맞췄지만, v3에서 코 클로즈업이
 *  s2로 옮겨가며 이 SFX도 같이 옮긴다(대본 "오디오 관련 참고" 절 지시). s2 안에서 "콧구멍"
 *  단어가 나오는 시점(ko 어절 타임스탬프 0.552s ≈ 17프레임) 근방에 맞춰, 발견 리액션 딩
 *  (아래 REALIZE_SFX)과 겹치지 않게 살짝 뒤에 배치한다. s2는 항상 두 번째 장면(starts[1])
 *  이라 프레임 계산이 언어별로 갈리지 않는다(고정 오프셋을 양쪽 언어에 동일 적용하는 것은
 *  REALIZE_SFX_OFFSET과 같은 기존 관례). */
const SNIFF_SFX_FRAMES = 9; // sniff_snort.mp3 실측 0.31초(30fps 9프레임)
const SNIFF_SFX_OFFSET = 17;
/** realize_ding 효과음: s2 캐릭터가 "어?" 하고 알아채는 발견 순간에 맞춰 재생. */
const REALIZE_SFX_FRAMES = 9; // realize_ding.mp3 실측 0.30초(30fps 9프레임)
const REALIZE_SFX_OFFSET = 3;

export interface EpisodeProps {
  locale: Locale;
}

function buildAllSegments(locale: Locale): SegmentData[] {
  const words = WORDS_BY_LANG[locale];
  return words.segments; // v3: s1~s8 전부 words.json 에서 온다(더 이상 합성 구간 없음)
}

export const Episode: React.FC<EpisodeProps> = ({ locale }) => {
  const t = STRINGS[locale];
  const words = WORDS_BY_LANG[locale];
  const mouth = MOUTH_BY_LANG[locale].mouth;
  const [s1, s2, s3, s4, s5, s6, s7, s8] = words.segments;

  const allSegments = buildAllSegments(locale);
  const frames = sceneFrames(allSegments, SCENE_PAD);
  const starts = sceneStarts(frames);
  const mainTotal = frames.reduce((a, b) => a + b, 0);

  const lineSpec = {
    s1: wrapCounts(s1.words, locale), s2: wrapCounts(s2.words, locale), s3: wrapCounts(s3.words, locale),
    s4: wrapCounts(s4.words, locale), s5: wrapCounts(s5.words, locale), s6: wrapCounts(s6.words, locale),
    s7: wrapCounts(s7.words, locale), s8: wrapCounts(s8.words, locale),
  };
  const [linesS1, linesS2, linesS3, linesS4, linesS5, linesS6, linesS7, linesS8] =
    buildCaptions([s1, s2, s3, s4, s5, s6, s7, s8], lineSpec);

  const scenes: SceneSpec[] = [
    {
      Component: S1Greet as unknown as SceneSpec['Component'], frames: frames[0],
      props: { frames: frames[0], lines: linesS1, mouth },
    },
    {
      Component: S2Discover as unknown as SceneSpec['Component'], frames: frames[1],
      props: { frames: frames[1], lines: linesS2, mouth },
    },
    {
      Component: S3Slit as unknown as SceneSpec['Component'], frames: frames[2],
      props: { frames: frames[2], lines: linesS3, label: t.s3Label },
    },
    {
      Component: S4Airflow as unknown as SceneSpec['Component'], frames: frames[3],
      props: { frames: frames[3], lines: linesS4 },
    },
    {
      Component: S5Recap as unknown as SceneSpec['Component'], frames: frames[4],
      props: { frames: frames[4], lines: linesS5 },
    },
    {
      Component: S6FastBreath as unknown as SceneSpec['Component'], frames: frames[5],
      props: { frames: frames[5], lines: linesS6 },
    },
    {
      Component: S7Footage as unknown as SceneSpec['Component'], frames: frames[6],
      props: { frames: frames[6], lines: linesS7, badge: t.s7Badge },
    },
    {
      Component: S8WetNose as unknown as SceneSpec['Component'], frames: frames[7],
      props: { frames: frames[7], lines: linesS8, badge: t.s8Badge },
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
          <Sequence key={id} from={starts[i]} durationInFrames={frames[i]} layout="none">
            <Audio src={staticFile(`audio/${locale}_${id}.mp3`)} volume={1.6} />
          </Sequence>
        ))}

        {/* s2: 카메라가 콧구멍으로 확대되는 순간(v3에서 s1->s2로 재배치) - "킁킁" 숨소리
         *  (원칙 7, general-ep19 신설 sniff_snort.mp3, REGISTRY 7절 "동물 킁킁·냄새 맡기
         *  동작 전반 재사용 가능") */}
        <Sequence from={starts[1] + SNIFF_SFX_OFFSET} durationInFrames={SNIFF_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/sniff_snort.mp3')} volume={0.8} />
        </Sequence>

        {/* s2: 캐릭터가 "어?" 하고 알아채는 발견 순간 - 기존 realize_ding 재사용 */}
        <Sequence from={starts[1] + REALIZE_SFX_OFFSET} durationInFrames={REALIZE_SFX_FRAMES} layout="none">
          <Audio src={staticFile('audio/realize_ding.mp3')} volume={0.9} />
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
