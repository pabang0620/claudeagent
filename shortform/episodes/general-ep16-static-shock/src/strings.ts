/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '겨울에 정전기가 더 잘 통하는 이유',
    s4Summer: '여름 - 습함',
    s4Winter: '겨울 - 건조함',
    s6Badge: '고대 그리스',
    s6Label: '호박 = elektron',
    s7SparkLabel: '정전기 스파크 - 훨씬 높음',
    s7OutletLabel: '벽 콘센트 - 낮음',
    s8Label: '효과 있다는 얘기?',
  },
  en: {
    title: 'Why Static Shocks Are Worse in Winter',
    s4Summer: 'Summer - Humid',
    s4Winter: 'Winter - Dry',
    s6Badge: 'Ancient Greece',
    s6Label: 'Amber = "elektron"',
    s7SparkLabel: 'Static Spark - Much Higher',
    s7OutletLabel: 'Wall Outlet - Lower',
    s8Label: 'Does it actually work?',
  },
} as const;

export type Locale = keyof typeof STRINGS;
