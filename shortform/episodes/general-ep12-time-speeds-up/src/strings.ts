/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '나이 들수록 시간이 빨리 가는 이유',
    s1Bar: '5살: 1년 = 인생의 20%',
    s3Label: '100년 넘은 이론',
    s5Bar1: '5살: 20%',
    s5Bar2: '20살: 5%',
    s5Bar3: '50살: 2%',
    s7Tag: '새로운 경험 → 길게 느껴짐?',
    s7Story: '이야기?',
  },
  en: {
    title: 'Why Time Speeds Up As You Get Older',
    s1Bar: 'Age 5: 1 year = 20% of your life',
    s3Label: 'A theory over 100 years old',
    s5Bar1: 'Age 5: 20%',
    s5Bar2: 'Age 20: 5%',
    s5Bar3: 'Age 50: 2%',
    s7Tag: 'New experiences -> feels longer?',
    s7Story: 'Story?',
  },
} as const;

export type Locale = keyof typeof STRINGS;
