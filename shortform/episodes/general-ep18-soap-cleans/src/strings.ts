/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '비누가 기름을 씻어내는 이유',
    s4Head: '물을 좋아함',
    s4Tail: '기름을 좋아함',
    s4Term: '계면활성제',
    s5Micelle: '미셀',
    s6Suffix: '초',
    s7Before: '기름막',
    s7After: '무력화',
    s8Badge: '아주 오래전',
    s8Label: '기름 + 재 = 비누의 시작',
  },
  en: {
    title: "Why Soap Can Wash Away Oil (But Water Can't)",
    s4Head: 'Loves Water',
    s4Tail: 'Loves Oil',
    s4Term: 'Surfactant',
    s5Micelle: 'Micelle',
    s6Suffix: 's',
    s7Before: 'Fatty Layer',
    s7After: 'Destroyed',
    s8Badge: 'Ancient Times',
    s8Label: 'Fat + Ash = First Soap',
  },
} as const;

export type Locale = keyof typeof STRINGS;
