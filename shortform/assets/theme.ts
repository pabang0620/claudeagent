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
 * 한국어 채널과 영어 채널을 별도로 운영한다(2026-08-08 확정). 채널명은 언어별로 다르다.
 * 다른 파일에 채널명 문자열을 직접 쓰지 말 것. CHANNEL_NAME_BY_LANG['ko'|'en'] 로 조회한다.
 */
export const CHANNEL_NAME_KO = '굼구미';
export const CHANNEL_NAME_EN = 'Whymo';
export const CHANNEL_MARK_KO = '?';
export const CHANNEL_MARK_EN = '?';
/** 유튜브 쇼츠뿐 아니라 인스타 릴스에도 같은 영상을 올리므로, "구독"(유튜브 전용 용어) 단독 문구는
 *  릴스에서 어색하다. 두 플랫폼 모두에 자연스럽게 통하는 표현을 쓴다.
 *  ko: "구독"과 "팔로우"를 가운뎃점으로 병기(이 코드베이스가 "말투·난이도·TTS"처럼
 *      가운뎃점 나열을 쓰는 관례를 따름). en: "follow"는 인스타·유튜브 양쪽에서 자연스러워 통일. */
export const SUBSCRIBE_TEXT_KO = '구독·팔로우하고 다음 편 보기';
export const SUBSCRIBE_TEXT_EN = 'Follow for more';

export const CHANNEL_NAME_BY_LANG = { ko: CHANNEL_NAME_KO, en: CHANNEL_NAME_EN } as const;
export const CHANNEL_MARK_BY_LANG = { ko: CHANNEL_MARK_KO, en: CHANNEL_MARK_EN } as const;
export const SUBSCRIBE_TEXT_BY_LANG = { ko: SUBSCRIBE_TEXT_KO, en: SUBSCRIBE_TEXT_EN } as const;

/** 하위 호환: 기존에 CHANNEL_NAME 을 참조하는 코드(Intro/Outro 기본값 등)가 깨지지 않도록 유지.
 *  새 코드는 CHANNEL_NAME_BY_LANG[lang] 을 쓴다. */
export const CHANNEL_NAME = CHANNEL_NAME_KO;
export const CHANNEL_MARK = CHANNEL_MARK_KO;
export const SUBSCRIBE_TEXT = SUBSCRIBE_TEXT_KO;

/* ================= 하위 호환 별칭 =================
 * 1화 코드가 쓰던 이름. 새 코드에서는 위의 토큰을 직접 쓸 것.
 */
export const INK = C.ink;
export const CORAL = C.coral;
export const PAPER = C.paper;
