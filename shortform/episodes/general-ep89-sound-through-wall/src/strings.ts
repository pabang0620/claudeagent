/** 이 화(general-ep89, "벽 너머로 소리가 들리는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 *
 *  화면에 노출되는 문자는 이 화 전체에서 s6(고음/저음 비교 라벨) 2개뿐이다
 *  (02-script-v1.md 장면 표 "화면 문자" 열 참고). s7은 리듬만 시각적으로 도드라지게
 *  표현하고 텍스트를 쓰지 않는다(대본에 화면 문자 지정 없음).
 */
export const STRINGS = {
  ko: {
    title: '벽 너머로 소리가 들리는 이유',
    s6HighLabel: '높은 소리',
    s6LowLabel: '낮은 소리',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
