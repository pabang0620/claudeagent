/** 이 화 전용 화면 문구. 언어별 테이블에서만 읽는다 - 씬 컴포넌트 안에 문자열을 박지 않는다.
 *  02-script-v1.md 의 "화면 문자" 열 + "제목" 절과 1:1로 대응한다.
 *
 *  s8Badge 는 원형 뱃지 안에 두 줄로 접어 넣는다(줄바꿈 지점은 레이아웃 결정이라 '\n' 로
 *  표시하고 컴포넌트가 split('\n') 해서 렌더한다 - 문구 자체는 여전히 이 테이블 소유).
 *  s9To/Prefix/Suffix 는 언어별 숫자 표기 관행이 달라(한국어 "10만" vs 영어 "100,000")
 *  숫자 자체도 언어별 값으로 둔다(ep06 s3FinalTo 와 같은 선례).
 */
export const STRINGS = {
  ko: {
    title: '시계 보면 초침이 멈춰 보이는 이유',
    s4Term: '사카드',
    s8Badge: '2000년대\n초',
    s8Label: '크로노스타시스',
    s9To: 10,
    s9Prefix: '약 ',
    s9Suffix: '만 번/하루',
    s10Label: '눈이 감겨 있는 시간',
    s11Cue: '눈이 움직이는 순간',
  },
  en: {
    title: "Why a Clock's Second Hand Looks Frozen for a Moment",
    s4Term: 'Saccade',
    s8Badge: 'Early\n2000s',
    s8Label: 'Chronostasis',
    s9To: 100000,
    s9Prefix: '~',
    s9Suffix: ' times/day',
    s10Label: 'Eyes effectively shut',
    s11Cue: 'the moment your eyes jump',
  },
} as const;

export type Locale = keyof typeof STRINGS;
