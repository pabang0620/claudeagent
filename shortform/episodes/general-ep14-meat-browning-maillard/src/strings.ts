/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '고기가 구워야만 갈색 되는 이유',
    s2Oxygen: '산소 때문?',
    s3Protein: '단백질',
    s3Sugar: '당분',
    s3Heat: '열',
    s3Maillard: '마이야르 반응',
    s4WaterLabel: '물의 최고 온도: 100도',
    s4MeatLabel: '고기 겉면 온도: 140도+',
    s5Mark: '100°C',
  },
  en: {
    title: 'Why Only Grilling Turns Meat Brown',
    s2Oxygen: 'From oxygen?',
    s3Protein: 'Protein',
    s3Sugar: 'Sugar',
    s3Heat: 'Heat',
    s3Maillard: 'Maillard Reaction',
    s4WaterLabel: 'Boiling water: 100°C',
    s4MeatLabel: 'Seared surface: 140°C+',
    s5Mark: '100°C',
  },
} as const;

export type Locale = keyof typeof STRINGS;
