/** 이 화(general-ep45, "처음 온 곳인데 와본 것 같은 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '처음 온 곳인데 와본 것 같은 이유',
    s2Term: '데자뷔',
    s2Sub: '프랑스어로 "이미 봤다"',
    s4Label: '가설 1',
    s5Label: '가설 2',
    s6Label: '전기 자극 실험',
    s7Age1: '10대',
    s7Age2: '20대',
    s7Age3: '30대',
    s7Age4: '40대',
    s7Age5: '50대+',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
