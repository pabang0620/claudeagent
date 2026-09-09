/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v2.md 의 "장면" 표 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '소름이 오돌토돌 돋는 이유',
    s3Label: '입모근 (털을 세우는 근육)',
    s4Label: '털로 덮여 있던 조상',
    s5Animal1: '고양이',
    s5Animal2: '고슴도치',
    s5Tagline: '같은 원리',
    s6Word: '구스범프스',
    s6Meaning: '= 거위 살 / 닭살',
  },
  en: {
    title: 'Why Goosebumps Make Your Skin Bumpy',
    s3Label: 'Tiny muscle at the root contracts',
    s4Label: 'Our fur-covered ancestors',
    s5Animal1: 'Cats',
    s5Animal2: 'Hedgehogs',
    s5Tagline: 'Same trick',
    s6Word: 'Goosebumps',
    s6Meaning: '= plucked goose skin',
  },
} as const;

export type Locale = keyof typeof STRINGS;
