/** 이 화(general-ep70, "태풍이 소용돌이 모양인 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '태풍이 소용돌이 모양인 이유',
    inflowLabel: '저기압 중심으로 빨려듦',
    coriolisLabel: '지구 자전으로 휘어짐',
    spiralLabel: '소용돌이 형성',
    hemisphereNorthLabel: '북반구: 반시계',
    hemisphereSouthLabel: '남반구: 시계',
    equatorLabel: '적도',
    earthSpinLabel: '지구 자전',
    mythLabel: '속설: 사실 아님',
    mythRotationSubLabel: '회전 방향 때문?',
    mythDrainSubLabel: '배수구 모양 때문',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
