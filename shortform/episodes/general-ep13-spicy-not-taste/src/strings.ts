/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '매운맛이 사실 맛이 아닌 이유',
    s2Sweet: '단맛',
    s2Salty: '짠맛',
    s2Sour: '신맛',
    s2Bitter: '쓴맛',
    s2Umami: '감칠맛',
    s3Spicy: '매운맛?',
    s4Label: '캡사이신',
    s7Label: '스코빌 지수',
    s8Water: '물',
    s8Milk: '우유',
    outroTitle: '다음 편',
    outroHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
  en: {
    title: "Why 'Spicy' Isn't Actually a Taste",
    s2Sweet: 'sweet',
    s2Salty: 'salty',
    s2Sour: 'sour',
    s2Bitter: 'bitter',
    s2Umami: 'umami',
    s3Spicy: 'Spicy?',
    s4Label: 'Capsaicin',
    s7Label: 'Scoville Scale',
    s8Water: 'Water',
    s8Milk: 'Milk',
    outroTitle: 'Next up',
    outroHint: 'Another curious question, coming up!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
