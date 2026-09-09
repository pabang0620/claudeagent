/** 이 화(general-ep94, "달 모양이 바뀌는 게 그림자 때문이 아닌 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 */
export const STRINGS = {
  ko: {
    title: '달 모양이 바뀌는 게 그림자 때문이 아닌 이유',
    s2EclipseLabel: '월식',
    s5CrescentLabel: '초승달',
    s5HalfLabel: '반달',
    s5FullLabel: '보름달',
    s6MoonWord: '달',
    s6CycleLabel: '한 바퀴 도는 데 약 한 달',
    s4EarthViewLabel: '지구에서 보이는 모습',
    s6FolkloreBadge: '이런 이야기가 있어요',
    s7NewMoonLabel: '그믐',
    s7FullMoonLabel: '보름',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
