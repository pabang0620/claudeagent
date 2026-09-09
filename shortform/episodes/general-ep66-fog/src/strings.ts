/** 이 화(general-ep66, "새벽에 안개가 자욱해지는 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02)으로 한국어만 만든다. 그래도 STRINGS 타입은
 *  언어별 테이블 구조를 유지한다.
 */
export const STRINGS = {
  ko: {
    title: '새벽에 안개가 자욱해지는 이유',
    s2Label: '지표면 냉각',
    s3Label: '물방울로 응결',
    s4Label: '공중에 떠 있음',
    s5Label: '안개',
    s6CloudLabel: '구름',
    s6FogLabel: '안개',
    s6EqualLabel: '같음, 높이만 다름',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
