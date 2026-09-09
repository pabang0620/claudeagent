/** 이 화(general-ep69, "긴장하면 손에 땀이 나는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '긴장하면 손에 땀이 나는 이유',
    s2Label: '땀샘 밀도 높음',
    s3Label: '긴장 반응 땀샘',
    s4Label: '체온용 vs 감정용',
    s5Label: '미끄럼 방지',
    s6Label: '지금도 남은 반응',
    s7Label: '땀 반응 측정',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
