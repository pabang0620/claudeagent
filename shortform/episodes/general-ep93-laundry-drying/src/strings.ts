/** 이 화(general-ep93, "젖은 빨래가 마르는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 *
 *  이 화는 s3~s6이 전부 그래픽(EvaporationDiagram) 중심이고 화면에 노출되는 텍스트가
 *  없다(대본 "화면 문자" 열이 전 구간 없음) - title/outro 문구만 필요하다.
 */
export const STRINGS = {
  ko: {
    title: '젖은 빨래가 마르는 이유',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
