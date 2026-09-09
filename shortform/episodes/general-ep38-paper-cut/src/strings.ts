/** 이 화(general-ep38) 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에
 *  문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '종이에 베이면 유독 아픈 이유',
    s2Label: '신경 밀도 최고',
    s3PaperLabel: '종이 단면',
    s3BladeLabel: '칼날 단면',
    s5Label: '피 적음',
    s6Label: '공기에 그대로 노출',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
