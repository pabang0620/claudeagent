/** 이 화(general-ep44, "전깃줄에 앉은 새가 감전되지 않는 이유") 전용 화면 문구.
 *  언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '전깃줄에 앉은 새가 감전되지 않는 이유',
    s2Label: '전압 차이(전위차)',
    s3Label: '전압 차이 거의 0',
    s4LabelBird: '새 몸',
    s4LabelWire: '전선',
    s6Label: '위험',
    s7Label: '위험',
    s8Label: '두 줄에 걸치면 위험',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
