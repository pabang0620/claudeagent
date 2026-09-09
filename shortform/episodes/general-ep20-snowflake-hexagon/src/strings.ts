/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '눈송이가 육각형인 이유',
    s3Label: '육각형 결정 구조',
    s7Badge: '1885년',
    s8Text: '얘기가 있어요: 세상에 똑같은 눈송이는 없다?',
  },
  en: {
    title: 'Why Every Snowflake Has Six Sides',
    s3Label: 'Six-sided crystal structure',
    s7Badge: '1885',
    s8Text: 'They say: no two snowflakes are alike?',
  },
} as const;

export type Locale = keyof typeof STRINGS;
