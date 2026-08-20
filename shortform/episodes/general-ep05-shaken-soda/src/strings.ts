/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '탄산음료 흔든 뒤 따면 넘치는 이유',
    before: '흔들기 전',
    after: '흔든 후',
  },
  en: {
    title: 'Why Shaken Soda Erupts the Second You Open It',
    before: 'Before shaking',
    after: 'After shaking',
  },
} as const;

export type Locale = keyof typeof STRINGS;
