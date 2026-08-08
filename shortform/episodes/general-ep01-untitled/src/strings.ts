/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v4.md 의 "화면 문자" 열과 1:1로 대응한다.
 *
 *  v4: s2가 무성 -> 유성으로 바뀌면서 정적 캡션(s2Label: "이마가 찌릿"/"Ow - forehead")이
 *  폐기되고 s3~s5와 동일하게 Caption 컴포넌트가 발화를 그대로 자막으로 띄운다.
 *  현재 이 화에는 화면에 직접 굽는 정적 문구가 없어 STRINGS 가 비어 있다 - locale 타입만
 *  여기서 export 한다.
 */
export const STRINGS = {
  ko: {},
  en: {},
} as const;

export type Locale = keyof typeof STRINGS;
