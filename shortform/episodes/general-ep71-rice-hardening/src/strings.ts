/** 이 화(general-ep71, "식은 밥이 딱딱해지는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '식은 밥이 딱딱해지는 이유',
    s2Label: '전분 알갱이',
    s3Label: '물을 밀어냄',
    s4LabelSoft: '말랑함',
    s4LabelHard: '뻣뻣함',
    s5Label: '다시 데우기',
    s5Gauge: '부드러움',
    s6LabelCold: '찬밥',
    s6LabelHot: '뜨거운 밥',
    s7LabelFridge: '냉장실',
    s7LabelFreezer: '냉동실',
    s7Highlight: '더 빨리 딱딱해짐',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
