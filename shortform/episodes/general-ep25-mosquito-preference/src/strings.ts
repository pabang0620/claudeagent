/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v1.md 의 "장면" 표 "화면" 열과 1:1로 대응한다.
 *
 *  이번 배치(21~25화)는 영어 채널(Whymo) 운영 중단으로 한국어만 만든다(builder 지시 명시).
 *  그래도 STRINGS 타입은 언어별 테이블 구조를 유지한다 - 다른 화·다른 컴포넌트가
 *  `Locale = keyof typeof STRINGS` 패턴을 그대로 재사용하고, 향후 영어 채널이 재개되면
 *  `en` 한 블록만 채워 넣으면 되게 하기 위해서다.
 */
export const STRINGS = {
  ko: {
    title: '모기가 유독 나만 무는 이유',
    s2Label: '이산화탄소',
    s3Label: '냄새 탐지',
    s4LabelA: '이 사람',
    s4LabelB: '저 사람',
    s5LabelTemp: '체온',
    s5LabelSweat: '땀',
    s6Note: '연구도 있음',
    s7Badge: '유전 영향',
    outroNextTitle: '다음 편',
    outroNextHint: '다음 편에서 또 다른 궁금증이 풀려요!',
  },
} as const;

export type Locale = keyof typeof STRINGS;
