/** 이 화(general-ep101, "손등 핏줄이 파랗게 보이는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02)으로 한국어만 만든다. STRINGS 타입은
 *  다른 화와 같은 Locale 패턴을 유지한다.
 */
export const STRINGS = {
  ko: {
    title: '손등 핏줄이 파랗게 보이는 이유',
    blueLightLabel: '파란빛',
    redLightLabel: '빨간빛',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
