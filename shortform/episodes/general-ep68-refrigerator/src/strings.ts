/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v1.md 의 "장면" 표 화면 라벨: s2 "냉매", s3 "팽창 -> 온도 뚝", s4 "열 흡수",
 *  s5 "압축 -> 온도 확", s6 "열 방출".
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 동일한 Locale 패턴 재사용).
 */
export const STRINGS = {
  ko: {
    title: '냉장고 안이 차가워지는 진짜 이유',
    s2Label: '냉매',
    s3Label: '팽창 -> 온도 뚝',
    s4Label: '열 흡수',
    s5Label: '압축 -> 온도 확',
    s6Label: '열 방출',
    s7Label: '열을 계속 밖으로 퍼내는 중',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
