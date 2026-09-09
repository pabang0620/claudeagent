/** 이 화(general-ep53, "겨울에 유리창에 김 서리는 이유") 전용 화면 문구.
 *  언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 동일한 Locale 패턴 재사용).
 */
export const STRINGS = {
  ko: {
    title: '겨울에 유리창에 김 서리는 이유',
    s2Badge: '눈에 안 보임',
    s2Label: '수증기',
    s3CoolAir: '차가운 공기',
    s3WarmAir: '따뜻한 공기',
    s6Outdoor: '실외',
    s6Indoor: '실내',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
