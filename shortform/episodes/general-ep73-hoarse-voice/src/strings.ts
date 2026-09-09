/** 이 화(general-ep73, "소리 지르고 나면 목이 쉬는 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '소리 지르고 나면 목이 쉬는 이유',
    vocalCordsLabel: '성대',
    normalLabel: '평소',
    screamLabel: '소리 지를 때',
    swellLabel: '붓고 상함',
    hoarseLabel: '울퉁불퉁 불규칙하게 떨림',
    roughVoiceLabel: '거칠어진 목소리',
    mythTopLabel: '속삭임: 사실 아님',
    mythSubLabel: '속삭이면 편할까?',
    truthSubLabel: '성대를 더 꽉 조임',
    restLabel: '휴식',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
