/** 이 화(general-ep67, "소금에 절이면 음식이 안 상하는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '소금에 절이면 음식이 안 상하는 이유',
    s2Label: '삼투 현상',
    s3Label: '세균도 수분 뺏김',
    s4Label: '증식 멈춤',
    s5SpoiledLabel: '세균 우글우글',
    s5PreservedLabel: '세균 없어 멀쩡',
    s6Label: '냉장고 없던 시절 저장법',
    s7Label: '충분한 소금 필요',
    s7Weak: '소금 적음',
    s7Enough: '소금 충분',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
