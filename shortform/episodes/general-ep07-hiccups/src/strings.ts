/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '딸꾹질 소리가 나는 진짜 이유',
    s1Pop: '딸꾹!',
    s3DiaphragmLabel: '횡격막 (숨 쉬는 근육)',
    s4ThroatLabel: '목 입구가 탁 닫힘',
    s5UsualLabel: '보통은 몇 분',
    s5RecordLabel: '최장 기록',
    s5RecordSuffix: '년',
    s6MythLabel: '숨 참기 - 효과 있다는 설',
  },
  en: {
    title: "Why Hiccups Sound Like 'Hic'",
    s1Pop: 'Hic!',
    s3DiaphragmLabel: 'Diaphragm (breathing muscle)',
    s4ThroatLabel: 'Throat snaps shut',
    s5UsualLabel: 'Usually just minutes',
    s5RecordLabel: 'Record:',
    s5RecordSuffix: ' years',
    s6MythLabel: 'Hold your breath - some say it helps',
  },
} as const;

export type Locale = keyof typeof STRINGS;
