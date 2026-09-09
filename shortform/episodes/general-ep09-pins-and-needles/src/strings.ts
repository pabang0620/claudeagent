/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v3.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 *  v3: 신규 s3("피 때문?" 취소선) 추가로 구 s3~s7 -> 신 s4~s8 로 재번호(제목도 변경).
 */
export const STRINGS = {
  ko: {
    title: '다리 눌렸다 풀리면 찌릿한 이유',
    s3Label: '피 때문?',
    s4Label: '신경이 눌려 신호가 약해짐',
    s5Label: '신호가 고르지 못하게 튐',
    s6Label: '양반다리 자세',
    s7Label: '이마에 십자 긋기 - 민간요법',
    s8Label: '약 1분 후',
  },
  en: {
    title: "Why Your Leg Tingles When It 'Wakes Up'",
    s3Label: 'Blood flow?',
    s4Label: 'The compressed nerve goes quiet',
    s5Label: 'Signals fire unevenly',
    s6Label: 'Sitting cross-legged',
    s7Label: 'Drawing a cross on your forehead - old folk trick',
    s8Label: 'About a minute later',
  },
} as const;

export type Locale = keyof typeof STRINGS;
