/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '양파를 썰면 눈물이 나는 진짜 이유',
    s3EnzymeLabel: '효소',
    s3SulfurLabel: '황 성분',
    s5ChillLabel: '차갑게',
    s5SharpenLabel: '칼 갈기',
  },
  en: {
    title: 'Why Cutting Onions Makes You Cry',
    s3EnzymeLabel: 'Enzyme',
    s3SulfurLabel: 'Sulfur compound',
    s5ChillLabel: 'Chill it',
    s5SharpenLabel: 'Sharpen it',
  },
} as const;

export type Locale = keyof typeof STRINGS;
