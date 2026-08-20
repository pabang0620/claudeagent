/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '다리 저릴 때 찌릿한 이유',
    s3Label: '신경이 눌려 신호가 약해짐',
    s4Label: '신호가 고르지 못하게 튐',
    s5Label: '양반다리 자세',
    s6Label: '이마에 십자 긋기 - 민간요법',
    s7Label: '약 1분 후',
  },
  en: {
    title: "Why Your Leg Feels 'Pins and Needles'",
    s3Label: 'The compressed nerve goes quiet',
    s4Label: 'Signals fire unevenly',
    s5Label: 'Sitting cross-legged',
    s6Label: 'Drawing a cross on your forehead - old folk trick',
    s7Label: 'About a minute later',
  },
} as const;

export type Locale = keyof typeof STRINGS;
