/** 이 화(general-ep92, "낙타 혹에 물이 들어 있지 않은 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 */
export const STRINGS = {
  ko: {
    title: '낙타 혹에 물이 들어 있지 않은 이유',
    s5WaterLabel: '부산물로 만들어지는 물',
    s5NeedLabel: '낙타에게 필요한 물',
    s7FatLabel: '지방 창고',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
