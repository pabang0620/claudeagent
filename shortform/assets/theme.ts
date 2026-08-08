/** 디자인 토큰 SSOT.
 *
 *  모든 자산은 색·선굵기·폰트·자막 스타일을 여기서만 가져온다.
 *  값을 하드코딩한 컴포넌트는 라이브러리에 넣지 않는다 (REGISTRY.md 등록 규칙 참고).
 *
 *  색의 출발점은 1화 캐릭터 원본 PNG 픽셀 실측값(ink / coral)이고,
 *  나머지는 그 두 색과 어울리도록 최소한으로만 확장했다.
 */

/* ================= 색 ================= */

export const C = {
  /** 라인·텍스트 기본색 (캐릭터 실측) */
  ink: '#252E3A',
  /** 보조 텍스트 (눈금 숫자, 캡션 등) */
  inkSoft: '#67738A',
  /** 액센트 1 (캐릭터 실측, 볼터치·입·강조) */
  coral: '#FC876E',
  coralSoft: '#FFE2DA',
  /** 액센트 2 (뱃지·점등·강조 하이라이트) */
  gold: '#FFC24B',
  goldSoft: '#FFF0CE',
  /** 기본 배경·채움 */
  paper: '#FFFFFF',

  /* 배경용 연한 톤 (캐릭터가 묻히지 않도록 채도를 낮게 유지한다) */
  sky: '#EAF2F8',
  hill: '#DFE9F2',
  hillFar: '#EEF3F8',
  water: '#CFE4F2',
  /** 실내·실험실 계열 */
  room: '#F1F0EC',
  roomDeep: '#E3E1DA',
  /** 바다 계열 */
  seaTop: '#DCEEF6',
  seaDeep: '#BCDCEE',
  /** 자연 계열 (풀·잎) */
  leaf: '#DCEBDF',

  /* 어두운 배경 계열 */
  night: '#1B2331',
  nightMid: '#2E3A4D',
  nightSoft: '#68799A',
  /** 어두운 배경 위 텍스트 전용. 밝은 배경에는 절대 쓰지 않는다 */
  cream: '#FFF4E4',
} as const;

export type ColorToken = keyof typeof C;

/* ================= 영상 규격 ================= */

/** 숏폼 세로 9:16 */
export const W = 1080;
export const H = 1920;
export const FPS = 30;

/* ================= 선 굵기 =================
 * 캐릭터를 폭 760 으로 렌더할 때 화면상 22*760/1254 = 13.3px 이 된다.
 * 소품은 viewBox 를 화면 픽셀과 1:1 로 잡고 SW 를 그대로 쓰면 캐릭터와 굵기가 맞는다.
 */
export const SW = 13;
export const SW_THIN = 9;
export const SW_HAIR = 7;

/* ================= 레이아웃 ================= */

/** 캐릭터·소품이 서는 기본 바닥선 (화면 y) */
export const GROUND = 1250;

/** 캐릭터 SVG viewBox(1254) 안에서의 발끝 / 머리끝 y */
export const FEET_VB = 1026;
export const HEAD_TOP_VB = 172;

/** 자막 안전영역 */
export const CAP_BOTTOM = 300;
export const CAP_SIDE = 70;

/** 상단 안전영역 (유튜브 숏폼 UI 가림 방지) */
export const SAFE_TOP = 240;
/** 하단 안전영역 */
export const SAFE_BOTTOM = 520;

export const RADIUS = {
  sm: 14,
  md: 22,
  lg: 44,
  pill: 999,
} as const;

/* ================= 타이포 ================= */

export const FONT = "'NanumSquareRound', sans-serif";

export const FS = {
  /** 자막 */
  caption: 66,
  /** 화면 대사·강조 큰 숫자 */
  hero: 210,
  title: 96,
  label: 46,
  small: 34,
  tiny: 30,
} as const;

/** 자막 박스 스타일 토큰 (밝은 배경 / 어두운 배경) */
export const CAPTION_STYLE = {
  fontSize: FS.caption,
  lineHeight: 1.32,
  letterSpacing: '-0.5px',
  padding: '22px 40px 26px',
  radius: RADIUS.lg,
  borderWidth: 7,
  maxWidth: 900,
  gap: '0 18px',
  light: { fg: C.ink, bg: C.paper, border: C.ink, active: C.coral, emphBg: C.goldSoft },
  dark: { fg: C.cream, bg: C.ink, border: C.cream, active: C.coral, emphBg: 'rgba(255,194,75,0.28)' },
} as const;

/* ================= 채널 브랜드 =================
 * 채널명이 확정되면 CHANNEL_NAME 한 줄만 바꾸면 인트로·아웃트로·워터마크에 전부 반영된다.
 * 다른 파일에 채널명 문자열을 직접 쓰지 말 것.
 */
export const CHANNEL_NAME = '굼구미';
/** 로고 뱃지 안에 들어가는 짧은 기호(1~2자). 채널명 확정 시 함께 정한다 */
export const CHANNEL_MARK = '?';
/** 아웃트로 기본 구독 문구 */
export const SUBSCRIBE_TEXT = '구독하고 다음 편 보기';

/* ================= 하위 호환 별칭 =================
 * 1화 코드가 쓰던 이름. 새 코드에서는 위의 토큰을 직접 쓸 것.
 */
export const INK = C.ink;
export const CORAL = C.coral;
export const PAPER = C.paper;
