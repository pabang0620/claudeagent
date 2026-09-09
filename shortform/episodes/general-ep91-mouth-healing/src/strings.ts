/** 이 화(general-ep91, "혀 깨물었을 때 상처가 금방 낫는 이유") 전용 화면 문구.
 *  씬 컴포넌트 안에 문자열을 박지 않고 이 언어별 테이블에서만 읽는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다(다른 화와 같은 Locale 패턴).
 *
 *  s6(회복 일수 비교)의 "약 7일"/"약 3일"은 내레이션이 읽지 않는 화면 전용 예시 수치다
 *  (대본 s6 "화면에 일수만 표기, 내레이션은 안 읽음"). 같은 크기 상처를 기준으로 피부
 *  상처가 완전히 아무는 데 흔히 1~2주, 입 안 점막은 그보다 뚜렷이 빠르다는 통상적으로
 *  알려진 차이를 비교 막대로 보여주기 위한 예시 값이며, 특정 임상 수치를 인용한 것이
 *  아니다(ep87의 손톱/발톱 mm·월 수치와 같은 "예시 수치" 관례).
 */
export const STRINGS = {
  ko: {
    title: '혀 깨물었을 때 상처가 금방 낫는 이유',
    s4MouthLabel: '입 안 점막',
    s4SkinLabel: '팔 피부',
    s6SkinLabel: '피부',
    s6MouthLabel: '입 안',
    s6SkinValue: '약 7일',
    s6MouthValue: '약 3일',
    s7SkinLabel: '피부',
    s7MouthLabel: '입 안',
    s7ScarLabel: '흉터 남음',
    s7CleanLabel: '흔적 없음',
    s8FastLabel: '회복이 빨라요',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
