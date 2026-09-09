/** 이 화(general-ep82, "별똥별이 사실은 별이 아닌 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 */
export const STRINGS = {
  ko: {
    title: '별똥별이 사실은 별이 아닌 이유',
    s2RockLabel: '돌조각',
    s3SandLabel: '모래알',
    s3GravelLabel: '자갈',
    s3RockLabel: '돌조각',
    s4SpeedLabel: '초속 몇십 킬로미터',
    s5BulletLabel: '총알',
    s5RockLabel: '돌조각',
    s5RockValueText: '수십 배 빠름',
    s8CometLabel: '혜성',
    s8DebrisLabel: '돌조각 파편',
    s9ShowerLabel: '유성우',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
