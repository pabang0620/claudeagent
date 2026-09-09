/** 이 화(general-ep79, "압력밥솥이 밥을 빨리 익히는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 */
export const STRINGS = {
  ko: {
    title: '압력밥솥이 밥을 빨리 익히는 이유',
    s1PotLabel: '일반 냄비',
    s1CookerLabel: '압력밥솥',
    s1PotTime: '약 40분',
    s1CookerTime: '약 15분',
    s2AxisPressure: '압력',
    s2AxisBoil: '끓는점',
    s2LowLabel: '낮은 압력',
    s2HighLabel: '높은 압력',
    s5TempSuffix: '˚C',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
