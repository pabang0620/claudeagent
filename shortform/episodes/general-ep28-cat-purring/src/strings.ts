/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v1.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 *
 *  영어 채널(Whymo) 운영 중단(오케스트레이터 지시 명시)으로 한국어만 만든다. 그래도 STRINGS
 *  타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가 `Locale = keyof typeof STRINGS`
 *  패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '고양이가 골골거리는 이유',
    s3Label: '1초에 수십 번 떨림',
    s4Label: '들숨에도, 날숨에도',
    s6Badge: '아플 때도 골골',
    s7Badge: '그런 얘기도 있대요',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
