/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v3.md 의 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    s2Label: '이마가 찌릿',
  },
  en: {
    s2Label: 'Ow - forehead',
  },
} as const;

export type Locale = keyof typeof STRINGS;
