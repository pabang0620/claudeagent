/** 이 화(general-ep74, "사막이 낮엔 뜨겁고 밤엔 추운 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '사막이 낮엔 뜨겁고 밤엔 추운 이유',
    dayLabel: '낮',
    nightLabel: '밤',
    holdHeatLabel: '열을 붙잡음',
    littleVaporLabel: '수증기 거의 없음',
    heatInLabel: '태양열이 그대로 들어옴',
    heatOutLabel: '열이 그대로 빠져나감',
    daytimeLabel: '낮',
    nighttimeLabel: '밤',
    desertLabel: '사막',
    humidLabel: '습한 지역',
    dailyRangeLabel: '낮밤 기온 차이',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
