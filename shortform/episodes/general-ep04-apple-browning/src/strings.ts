/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v3.md 의 "제목"·"화면 문자" 열과 1:1로 대응한다.
 *
 *  "O₂" 라벨(s4)은 화학식 기호라 숫자·기호와 같은 취급(profiles/general.md 5절의 "숫자 처리"
 *  규칙과 동일한 맥락 - 원칙 6의 "숫자만 있는 그래픽은 언어 무관"에 해당)으로 보고 테이블에
 *  넣지 않았다. 두 언어 모두 scenes.tsx 에서 동일 리터럴 "O₂"를 그대로 쓴다.
 */
export const STRINGS = {
  ko: {
    title: '사과 잘라두면 갈색이 되는 이유',
    enzymeLabel: '갈변 효소',
    colorLabel: '색 성분',
    lemonLabel: '레몬즙',
  },
  en: {
    title: 'Why Cut Apples Turn Brown',
    enzymeLabel: 'Browning enzyme',
    colorLabel: 'Color compound',
    lemonLabel: 'Lemon juice',
  },
} as const;

export type Locale = keyof typeof STRINGS;
