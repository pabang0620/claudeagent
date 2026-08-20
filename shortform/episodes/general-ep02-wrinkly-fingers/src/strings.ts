/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v4.md 의 "화면 문자" 열과 1:1로 대응한다.
 */
export const STRINGS = {
  ko: {
    title: '목욕하면 손가락 쭈글쭈글해지는 이유',
    s3Wrong: '물을 먹어서 붓는다',
    s3Right: '혈관을 좁힌다',
    s4Label: '매끈한 손가락 -> 미끄러짐',
    s5Label: '쭈글쭈글한 손가락 -> 꽉 잡음',
  },
  en: {
    title: 'Why Your Fingers Get Pruney in the Bath',
    s3Wrong: 'Soaks up water',
    s3Right: 'Blood vessels squeeze',
    s4Label: 'Smooth fingers -> Slips',
    s5Label: 'Wrinkly fingers -> Grips',
  },
} as const;

export type Locale = keyof typeof STRINGS;
