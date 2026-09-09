/** 이 화(general-ep41) 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에
 *  문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '재채기할 때 눈이 저절로 감기는 이유',
    s2Label: '재채기 반사',
    s3LabelMouth: '코·입',
    s3LabelEye: '눈꺼풀',
    s5Label: '보호 효과',
    s6LabelA: '그런 얘기가 있어요',
    s6LabelB: '(사실 아님)',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
