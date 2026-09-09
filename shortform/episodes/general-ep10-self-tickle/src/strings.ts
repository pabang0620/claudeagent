/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '내가 나를 못 간지럽히는 이유',
    s3EraLabel: '고대 그리스',
    s3NameLabel: '아리스토텔레스',
    s3StoryTag: '이야기?',
    s4Label: '예상 못한 손길 = 큰 반응',
    s5Label: '뇌가 미리 계산 = 작은 반응',
    s7Label: '로봇 팔 + 시간차 = 다시 간지럽다',
  },
  en: {
    title: "Why You Can't Tickle Yourself",
    s3EraLabel: 'Ancient Greece',
    s3NameLabel: 'Aristotle',
    s3StoryTag: 'Story?',
    s4Label: 'Unpredictable touch = big reaction',
    s5Label: 'Brain predicts it = tiny reaction',
    s7Label: "Robot arm + delay = tickle's back",
  },
} as const;

export type Locale = keyof typeof STRINGS;
