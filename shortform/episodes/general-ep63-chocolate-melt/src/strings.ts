/** 이 화(general-ep63, "초콜릿이 입에서 순식간에 녹는 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다.
 */
export const STRINGS = {
  ko: {
    title: '초콜릿이 입에서 순식간에 녹는 이유',
    s3Label: '카카오버터',
    s4RoomTemp: '상온',
    s4MeltPoint: '녹는점',
    s4BodyTemp: '체온',
    s4CloseLabel: '거의 같음',
    s5Temp: '37도',
    s7Butter: '버터',
    s7Chocolate: '초콜릿',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
