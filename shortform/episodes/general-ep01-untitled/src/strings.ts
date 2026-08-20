/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v4.md 의 "화면 문자" 열과 1:1로 대응한다.
 *
 *  v4: s2가 무성 -> 유성으로 바뀌면서 정적 캡션(s2Label: "이마가 찌릿"/"Ow - forehead")이
 *  폐기되고 s3~s5와 동일하게 Caption 컴포넌트가 발화를 그대로 자막으로 띄운다.
 *
 *  v10: 인트로 직후 제목 카드(TitleCard) 표준 요소 추가. 문구는 10-title.md 확정본(후보 A) -
 *  KO "아이스크림 먹다 이마가 아픈 이유" / EN "Why Ice Cream Hurts Your Forehead".
 */
export const STRINGS = {
  ko: { title: '아이스크림 먹다 이마가 아픈 이유' },
  en: { title: 'Why Ice Cream Hurts Your Forehead' },
} as const;

export type Locale = keyof typeof STRINGS;
