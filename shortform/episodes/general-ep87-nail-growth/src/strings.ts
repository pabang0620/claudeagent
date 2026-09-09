/** 이 화(general-ep87, "손톱이 발톱보다 빨리 자라는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 *
 *  이 화는 원인 설명(사용 빈도 -> 혈류 -> 자극)을 확신도 낮은 정성적 설명으로 다룬다
 *  (01-research.md 주장 2, 오케스트레이터 지시). s6 라벨은 "그런 얘기도 있음"으로
 *  원칙 1-2 속설 가드레일을 명시한다 - 확정된 사실처럼 단정하지 않는다.
 */
export const STRINGS = {
  ko: {
    title: '손톱이 발톱보다 빨리 자라는 이유',
    s3FingerLabel: '손톱',
    s3ToeLabel: '발톱',
    s3FingerValue: '약 3mm/월',
    s3ToeValue: '약 1mm/월',
    s4RootLabel: '손톱이 자라는 뿌리',
    s6Badge: '그런 얘기도 있음',
    s6DominantLabel: '자주 쓰는 손',
    s6OtherLabel: '반대쪽 손',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
