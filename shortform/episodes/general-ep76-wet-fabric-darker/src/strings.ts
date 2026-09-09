/** 이 화(general-ep76, "옷이 물에 젖으면 색이 진해지는 이유") 전용 화면 문구. 언어별
 *  테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '옷이 물에 젖으면 색이 진해지는 이유',
    dryFiberLabel: '마른 섬유',
    wetFiberLabel: '물이 채운 섬유',
    absorbLabel: '흡수 증가',
    reflectedLightLabel: '눈으로 돌아오는 빛',
    dryStateLabel: '마른 상태',
    wetStateLabel: '젖은 상태',
    roadLabel: '비 온 도로',
    treeLabel: '젖은 나무',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
