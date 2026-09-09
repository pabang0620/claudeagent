/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v1.md 의 "장면" 표 "화면 문구" 열과 1:1로 대응한다.
 *
 *  영어 채널(Whymo) 운영 중단(오케스트레이터 지시 명시)으로 한국어만 만든다. 그래도 STRINGS
 *  타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가 `Locale = keyof typeof STRINGS`
 *  패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '고수가 비누 맛으로 느껴지는 이유',
    s3Label: '알데하이드',
    // s5는 "화면 문구: (없음)"이지만 장면 지시가 "두 캐릭터가 각각 대사 자막만 뜨는 정지 컷"을
    // 명시한다 - 내레이션 s5(향긋하다/비누처럼)와 지시 대상이 맞는 짧은 반응어를 화면 문구로 둔다.
    s5LeftQuote: '비누 맛이야...',
    s5RightQuote: '향긋해!',
    s6Badge: '얘기가 있어요: 자꾸 먹으면 비누 맛이 옅어진다?',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
