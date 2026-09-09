/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 *
 *  s3(문지방 효과 이름)은 v2-2 수정으로 목소리가 이름을 직접 말하므로, 화면에는 같은
 *  단어를 중복 표기하지 않는다(원칙 3 화면 중복 낭독 금지) - 그래서 s3 라벨은 없다.
 */
export const STRINGS = {
  ko: {
    title: '방문을 넘으면 방금 생각이 날아가는 이유',
    s1Bubble: '물 가지러 가야지',
    s4Label: '문 = 생각이 정리되는 경계',
    s5Label: '이전 생각 보관됨',
    s7Label: '가상의 방에서도 똑같이',
    s8Bubble: '아, 물!',
  },
  en: {
    title: 'Why You Forget Why You Walked Into a Room',
    s1Bubble: 'Gotta grab some water',
    s4Label: 'Doorway = where thoughts get filed away',
    s5Label: 'Old thought: filed away',
    s7Label: 'Even in a virtual room',
    s8Bubble: 'Oh, water!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
