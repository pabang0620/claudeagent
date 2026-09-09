/** 이 화(general-ep80, "기린 목뼈가 사람과 개수가 같은 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 */
export const STRINGS = {
  ko: {
    title: '기린 목뼈가 사람과 개수가 같은 이유',
    s2HumanLabel: '사람',
    s2GiraffeLabel: '기린',
    s3HumanLabel: '사람 목뼈',
    s3GiraffeLabel: '기린 목뼈',
    s4BoneLabel: '기린 목뼈 하나',
    s4PalmLabel: '사람 손바닥',
    s5MouseLabel: '쥐',
    s5WhaleLabel: '고래',
    s5HumanLabel: '사람',
    s5GiraffeLabel: '기린',
    s6ExceptionLabel: '예외인 동물도 있어요',
    s6SlothLabel: '나무늘보',
    s6ManateeLabel: '매너티',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
