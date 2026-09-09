/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '얼음이 물 위에 뜨는 이유',
    s4SameWeight: '같은 무게',
    s4Water: '물',
    s4Ice: '얼음(부피 더 큼)',
    s5Density: '밀도',
    s5IceLower: '얼음 - 낮음',
    s5WaterHigher: '물 - 높음',
    s6Label: '수도관 동파',
    s7Surface: '표면 - 얼음',
    s7Below: '아래쪽 - 물(액체)',
    s8Label: '음펨바 효과 - 아직 논쟁 중',
  },
  en: {
    title: 'Why Ice Floats Instead of Sinking',
    s4SameWeight: 'Same Weight',
    s4Water: 'Water',
    s4Ice: 'Ice (More Volume)',
    s5Density: 'Density',
    s5IceLower: 'Ice - Lower',
    s5WaterHigher: 'Water - Higher',
    s6Label: 'Frozen Pipe Bursts',
    s7Surface: 'Surface - Ice',
    s7Below: 'Below - Still Water',
    s8Label: 'The Mpemba Effect - Still Debated',
  },
} as const;

export type Locale = keyof typeof STRINGS;
