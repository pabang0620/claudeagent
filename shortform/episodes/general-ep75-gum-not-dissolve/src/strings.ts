/** 이 화(general-ep75, "껌은 씹어도 안 녹는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '껌은 씹어도 안 녹는 이유',
    s1LabelGum: '껌',
    s1LabelCandy: '사탕',
    s2Label: '단맛·향만 침에 녹아 나감',
    s3Gauge: '껌맛',
    s4Label: '껌 베이스',
    s4Sub: '물에는 안 녹음',
    s5Label: '안 사라짐',
    s6LabelChoco: '기름진 음식',
    s6Sub: '기름에는 풀어짐',
    s7MythLabel: '속설: 삼키면 7년',
    s7RealLabel: '실제로는 며칠 안에 통과',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
