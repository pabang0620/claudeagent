/** 이 화(general-ep72, "안 터진 풍선이 쪼그라드는 이유") 전용 화면 문구. 언어별 테이블에서만
 *  읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *
 *  영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어만 만든다.
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '안 터진 풍선이 쪼그라드는 이유',
    beforeLabel: '며칠 전',
    afterLabel: '지금',
    noHoleLabel: '구멍 없음',
    gapLabel: '미세한 틈',
    leakLabel: '기체가 조금씩 빠져나감',
    shrinkOverTimeLabel: '시간이 지날수록',
    heliumMoleculeLabel: '헬륨 알갱이',
    airMoleculeLabel: '공기 알갱이',
    heliumBalloonLabel: '헬륨 풍선',
    airBalloonLabel: '공기 풍선',
    shrinkSpeedLabel: '쪼그라드는 빠르기',
    coatingLabel: '특수 코팅',
    rubberBalloonLabel: '고무 풍선',
    mylarBalloonLabel: '은박 풍선',
    rubberGapLabel: '틈: 성김',
    mylarGapLabel: '틈: 촘촘함',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
