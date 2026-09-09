/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v1.md 의 "장면" 표 "화면 문자" 열에 s3 "전자 정렬 = 자석", s4 "N -> S",
 *  s6 "지구도 하나의 자석"이 지정돼 있다. 나머지 구간은 제목 카드와 캡션뿐이다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '자석이 서로 붙는 이유',
    s3Label: '전자 정렬 = 자석',
    s4Label: 'N → S',
    s6Label: '지구도 하나의 자석',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
