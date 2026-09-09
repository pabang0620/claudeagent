/** 이 화(general-ep77, "나이 들면 흰머리가 나는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 */
export const STRINGS = {
  ko: {
    title: '나이 들면 흰머리가 나는 이유',
    s2RootLabel: '모낭 = 머리카락 뿌리',
    s2PigmentLabel: '멜라닌을 만드는 세포',
    s3Gauge: '색소 세포 수',
    s3Age10: '10대',
    s3Age30: '30대',
    s3Age50: '50대',
    s3Age70: '70대',
    s4LabelPigment: '색소 있음',
    s4LabelClear: '색소 없음(투명)',
    s5Label: '빛이 반사돼 하얗게 보임',
    s6MythLabel: '속설: 뽑으면 두 개 난다?',
    s6RealLabel: '사실 아님',
    s6SubLabel: '모낭 하나 = 머리카락 하나',
    s7Label: '머리 전체에서 반복되면',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
