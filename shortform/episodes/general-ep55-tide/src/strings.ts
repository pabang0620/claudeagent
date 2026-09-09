/** 이 화(general-ep55, "바다가 하루 두 번 들어왔다 나가는 이유") 전용 화면 문구.
 *  언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 동일한 Locale 패턴 재사용).
 */
export const STRINGS = {
  ko: {
    title: '바다가 하루 두 번 들어왔다 나가는 이유',
    s3Label: '달 쪽으로 볼록',
    s4Label: '반대쪽도 볼록',
    s5Label: '하루 두 번',
    s6Label: '밀물 · 썰물',
    s6In: '밀물',
    s6Out: '썰물',
    s7Label: '사리',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
