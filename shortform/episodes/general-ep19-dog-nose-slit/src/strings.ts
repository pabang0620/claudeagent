/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '개가 숨 쉬면서도 냄새 맡는 이유',
    s3Label: '옆트임',
    s7Badge: '실제 촬영 이미지',
    // 원칙 1-2 가드레일 - 속설임을 화면에 명시적으로 표시한다 (s8)
    s8Badge: '그런 얘기가 있어요',
  },
  en: {
    title: 'Why Dogs Never Stop Smelling',
    s3Label: 'Side slit',
    s7Badge: 'Real footage',
    s8Badge: 'They say',
  },
} as const;

export type Locale = keyof typeof STRINGS;
