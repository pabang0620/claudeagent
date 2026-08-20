/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "제목" 절 확정본(후보 A)을 그대로 옮겼다 - 재작성하지 않는다.
 */
export const STRINGS = {
  ko: { title: '녹음된 내 목소리가 낯선 이유' },
  en: { title: "Why Your Recorded Voice Sounds Like a Stranger's" },
} as const;

export type Locale = keyof typeof STRINGS;
