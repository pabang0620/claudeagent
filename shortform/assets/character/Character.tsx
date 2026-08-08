/**
 * 공용 마스코트 캐릭터 (졸라맨). 분야가 바뀌어도 그대로 쓰는 채널 고정 자산이다.
 *
 * 원본 PNG(캐릭터.png, 1254x1254)를 픽셀 실측해 복제한 SVG 를 그대로 포팅했다.
 * viewBox 가 원본과 같은 "0 0 1254 1254" 라서 원본 이미지와 겹쳐 비교할 수 있다.
 *
 * 각도 규약: 0 = 아래(+y). 양수 = SVG rotate() 방향 = 화면 왼쪽으로 벌어짐.
 *   dir(a) = (-sin a, cos a)
 *
 * 사용 예:
 *   <Character width={720} {...POSES.pointUp} mouthOpen={0.6} />
 *   <Character width={300} color={C.nightSoft} accent={C.nightSoft} fill={C.nightSoft} />  // 실루엣
 */
import React from 'react';
import { C } from '../theme';

/* ---------------- 실측 색상 (원본 픽셀 샘플링) ----------------
 * 기본값은 theme 토큰을 따르고, props 로 개별 교체할 수 있다. */
export const INK = C.ink;
export const CORAL = C.coral;
export const PAPER = C.paper;

/* ---------------- 실측 치수 ---------------- */
export const RIG = {
  W: 1254,
  H: 1254,
  CX: 626.5,

  SW: 22,
  SW_ARM: 22,
  SW_LEG: 24,
  SW_HAIR: 22,
  SW_MOUTH: 16,

  HEAD_CX: 626.5,
  HEAD_CY: 452,
  HEAD_PIVOT: { x: 626.5, y: 606 },
  HEAD_ARC_START: 250,
  HEAD_ARC_END: -70,

  SHOULDER: { x: 560, y: 647 },
  UPPER_ARM: 117,
  FOREARM: 76.6,
  HAND_R: 25,

  HIP: { x: 569, y: 820 },
  THIGH: 90.2,
  SHIN: 90.2,
  FOOT: { dx: -50.6, dy: 26.0 },

  LEAN_PIVOT: { x: 626.5, y: 820 },

  EYE: { dx: 102, y: 442.5, rx: 28, ry: 44 },
  BLUSH: { dx: 167.5, y: 502.5, rx: 27.5, ry: 23 },
  MOUTH: { cx: 627, y: 505 },
} as const;

/** 얼굴만 잘라 쓰는 바스트샷 viewBox */
export const BUST_VIEWBOX = '236 132 780 780';
/** 카드 안 미니 캐릭터용 viewBox (여백 최소) */
export const MINI_VIEWBOX = '150 140 954 954';

const RAD = Math.PI / 180;
const n = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 각도 a(0=아래, +=시계방향)가 가리키는 단위벡터 */
export function dir(a: number) {
  return { x: -Math.sin(a * RAD), y: Math.cos(a * RAD) };
}

export interface ArmAngles {
  /** 어깨각 */
  s: number;
  /** 팔꿈치각 (위팔 기준 상대각) */
  e: number;
}
export interface LegAngles {
  /** 고관절각 */
  h: number;
  /** 무릎각 (허벅지 기준 상대각) */
  k: number;
}

/** 포즈만 담는 부분집합. poses.ts 의 프리셋 타입이다. */
export interface Pose {
  armL?: ArmAngles;
  armR?: ArmAngles;
  legL?: LegAngles;
  legR?: LegAngles;
  /** 머리만 기울인다 (몸통 고정) */
  headTilt?: number;
  /** 상체 전체를 기울인다 (다리 고정) */
  lean?: number;
  /** 0 = 다문 입, 0.45 = 원본 기본 상태, 1 = 크게 벌린 입 */
  mouthOpen?: number;
  /** 0 = 감은 눈(선), 1 = 원본 크기, 1.5 까지 확대 가능 */
  eyeOpen?: number;
  /** 볼터치 진하기. 0 = 없음, 1 = 원본, 1 초과 시 살짝 커진다(최대 1.5) */
  blush?: number;
  /** 발끝이 viewBox 안에서 오는 y. 앉은 포즈처럼 발이 올라오는 경우 지정한다 */
  feetVb?: number;
}

export interface CharacterProps extends Pose {
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  /** 선 색 (기본 ink). 실루엣으로 쓸 때 배경 대비색으로 바꾼다 */
  color?: string;
  /** 볼터치·입 색 (기본 coral) */
  accent?: string;
  /** 머리·몸통 채움 (기본 paper) */
  fill?: string;
  /** 선 굵기 배율. 1 = 원본(22) */
  strokeScale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DEFAULT_POSE = {
  headTilt: 0,
  lean: 0,
  armL: { s: 44.83, e: 21.29 } as ArmAngles,
  armR: { s: -44.83, e: -21.29 } as ArmAngles,
  legL: { h: 3.8, k: 0 } as LegAngles,
  legR: { h: -3.8, k: 0 } as LegAngles,
  mouthOpen: 0.45,
  eyeOpen: 1,
  blush: 1,
};

/* ---------------- 2링크 IK (포즈 저작 도구) ---------------- */
/** 어깨 S 에서 목표 T 에 손끝이 닿는 (어깨각, 팔꿈치 상대각) 을 구한다 */
export function armIK(
  S: { x: number; y: number },
  T: { x: number; y: number },
  L1 = RIG.UPPER_ARM,
  L2 = RIG.FOREARM,
  elbowSign: 1 | -1 = 1
): ArmAngles {
  const dx = T.x - S.x;
  const dy = T.y - S.y;
  const raw = Math.hypot(dx, dy) || 1e-6;
  const d = clamp(raw, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
  const ux = (dx / raw) * d;
  const uy = (dy / raw) * d;
  const base = Math.atan2(-ux, uy) / RAD;
  const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1);
  const a = Math.acos(cosA) / RAD;
  const t1 = base + elbowSign * a;
  const E = { x: S.x + L1 * dir(t1).x, y: S.y + L1 * dir(t1).y };
  let rel = Math.atan2(-(S.x + ux - E.x), S.y + uy - E.y) / RAD - t1;
  while (rel > 180) rel -= 360;
  while (rel < -180) rel += 360;
  return { s: n(t1), e: n(rel) };
}

/* ---------------- 팔 신축 (만화적 표현) ----------------
 * 이 캐릭터는 머리 반지름(255)이 팔 전체 길이(191)보다 커서, 팔을 들면 손이
 * 머리 실루엣 안으로 파묻힌다. 어깨가 올라갈수록 상완/전완이 함께 늘어나게 해서
 * 손이 머리 바깥으로 나오게 만든다.
 *
 * 규약
 *  - u = (1 - cos s) / 2 : 0 = 팔이 완전히 아래, 0.5 = 수평, 1 = 완전히 위
 *  - u <= START 구간은 계수가 정확히 1.0 이다. 기본 자세(|s| = 44.83, u = 0.145)는
 *    원본과 픽셀 단위로 동일하다. 하한이 1.0 이라 팔을 내려도 짧아지지 않는다.
 *  - smoothstep 이라 임계점에서 기울기가 0 이고 각도에 대해 연속이다 (튀는 지점 없음).
 *
 * 한계: 팔을 정확히 수직(|s| ~ 180)으로 들면 어깨 자체가 머리 원 안에 있어
 * 어떤 현실적 배율로도 손이 머리 밖으로 못 나온다. 실사용 각도(|s| 100~140)에서는
 * 손이 머리 윤곽 밖으로 확실히 나온다.
 */
export const ARM_STRETCH = { START: 0.35, MAX: 0.7 };

/** 어깨각에 따른 팔 길이 배율 (항상 1.0 이상) */
export function armStretch(shoulderAngle: number) {
  const u = (1 - Math.cos(shoulderAngle * RAD)) / 2;
  const t = clamp((u - ARM_STRETCH.START) / (1 - ARM_STRETCH.START), 0, 1);
  const s = t * t * (3 - 2 * t);
  return 1 + ARM_STRETCH.MAX * s;
}

/** 신축을 반영한 손 끝 좌표 (소품을 손에 붙일 때 사용) */
export function handPos(side: 'L' | 'R', a: ArmAngles) {
  const S = side === 'L' ? shoulderL() : shoulderR();
  const k = armStretch(a.s);
  const d1 = dir(a.s);
  const d2 = dir(a.s + a.e);
  return {
    x: S.x + RIG.UPPER_ARM * k * d1.x + RIG.FOREARM * k * d2.x,
    y: S.y + RIG.UPPER_ARM * k * d1.y + RIG.FOREARM * k * d2.y,
  };
}

export const shoulderL = () => ({ x: RIG.SHOULDER.x, y: RIG.SHOULDER.y });
export const shoulderR = () => ({ x: 2 * RIG.CX - RIG.SHOULDER.x, y: RIG.SHOULDER.y });
export const hipL = () => ({ x: RIG.HIP.x, y: RIG.HIP.y });
export const hipR = () => ({ x: 2 * RIG.CX - RIG.HIP.x, y: RIG.HIP.y });

/* ---------------- 머리 아웃라인 (원본 레이캐스트 실측 r(theta)) ----------------
 * 머리 중심 (626.5,452) 기준 5도 간격 스트로크 중심선 반지름.
 * theta: 0=오른쪽, 90=위, 반시계. 75~95(머리카락에 가림) 는 보간,
 * 235~250(팔·몸통에 가림) 은 220~230 추세로 외삽했다.
 */
const HEAD_R: Record<number, number> = {
  0: 255.8, 5: 255.0, 10: 255.0, 15: 253.5, 20: 251.8, 25: 250.5, 30: 248.5,
  35: 246.8, 40: 244.2, 45: 241.5, 50: 238.5, 55: 236.0, 60: 233.0, 65: 230.2,
  70: 227.8, 75: 226.5, 80: 225.2, 85: 224.2, 90: 223.5, 95: 224.0, 100: 224.5,
  105: 226.2, 110: 227.8, 115: 230.2, 120: 232.8, 125: 235.8, 130: 238.0,
  135: 241.0, 140: 243.5, 145: 245.8, 150: 247.8, 155: 249.2, 160: 250.5,
  165: 252.5, 170: 254.0, 175: 255.0, 180: 256.2, 185: 256.0, 190: 256.0,
  195: 255.8, 200: 253.8, 205: 251.5, 210: 247.8, 215: 243.2, 220: 237.5,
  225: 231.0, 230: 224.2, 235: 217.0, 240: 209.5, 245: 201.5, 250: 193.5,
  255: 186.0, 260: 179.0, 265: 173.0, 270: 170.0, 275: 173.0, 280: 179.0,
  285: 186.0, 290: 193.5, 295: 201.5, 300: 209.5, 305: 217.0, 310: 225.0,
  315: 231.5, 320: 238.0, 325: 243.5, 330: 248.2, 335: 252.2, 340: 255.0,
  345: 256.2, 350: 257.0, 355: 257.0,
};

function headPoint(deg: number) {
  const d = ((deg % 360) + 360) % 360;
  const lo = Math.floor(d / 5) * 5;
  const r = lerp(HEAD_R[lo], HEAD_R[(lo + 5) % 360], (d - lo) / 5);
  return {
    x: RIG.HEAD_CX + r * Math.cos(deg * RAD),
    y: RIG.HEAD_CY - r * Math.sin(deg * RAD),
  };
}

/* ---------------- 몸통 아웃라인 (원본 레이캐스트 실측 중심선) ----------------
 * 왼쪽 절반만 정의하고 오른쪽은 미러링. 상단(y<640)은 머리에 가려 실측 불가라 곡률 연장.
 */
const BODY_LEFT: [number, number][] = [
  [626.5, 598], [592, 601], [566, 615], [553, 643], [543, 664], [536, 678],
  [530, 698], [528, 714], [524, 733], [520.9, 751.4], [519.0, 770.0],
  [518.7, 789], [521.0, 798.3], [523.1, 807.6], [527.5, 816.2], [533.2, 823.9],
  [540.9, 829.9], [548.7, 835.2], [557.4, 839.1], [568, 844.5], [590.6, 847.0],
  [605.5, 848.5], [626.5, 849.0],
];

/** Catmull-Rom -> cubic bezier */
function smoothPath(pts: { x: number; y: number }[], closed = false) {
  const N = pts.length;
  const get = (i: number) => (closed ? pts[(i + N) % N] : pts[clamp(i, 0, N - 1)]);
  let d = `M ${n(pts[0].x)} ${n(pts[0].y)}`;
  const last = closed ? N : N - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(p2.x)} ${n(p2.y)}`;
  }
  return closed ? d + ' Z' : d;
}

// 정적 경로 - 모듈 로드 시 1회만 계산된다
const HEAD_D = (() => {
  const pts = [];
  for (let a = RIG.HEAD_ARC_START; a >= RIG.HEAD_ARC_END; a -= 3) pts.push(headPoint(a));
  return smoothPath(pts, false);
})();

const BODY_D = (() => {
  const left = BODY_LEFT.map(([x, y]) => ({ x, y }));
  const right = BODY_LEFT.slice(1, -1).reverse().map(([x, y]) => ({ x: 2 * RIG.CX - x, y }));
  return smoothPath(left.concat(right), true);
})();

/** 머리카락(안테나) - 원본 실측 3차 베지어. 좌우가 비대칭인 것이 원본 그대로다. */
const HAIR_L_D = 'M 630 236 C 624 199, 608 180, 596 175';
const HAIR_R_D = 'M 641 236 C 648 198, 680 176, 703 172';

/** 입: mouthOpen 0~1. 원본 기본 상태 = 0.45 (중심선 폭 77 / 깊이 39) */
export function mouthPathD(open: number) {
  const o = clamp(open, 0, 1);
  const k = Math.pow(o, 0.6);
  const hw = 41.3 - 4.35 * k;
  const depth = 5 + 53.8 * k;
  const cx = RIG.MOUTH.cx;
  const y0 = RIG.MOUTH.y;
  const sag = 3;
  const d1 = depth / 0.75;
  // 크게 벌린 입이 뾰족한 물방울로 보이지 않도록 아래 곡선 제어점을 바깥으로 벌린다
  const cf = 0.62 + 0.85 * Math.max(0, k - 0.632);
  return (
    `M ${n(cx - hw)} ${n(y0)} ` +
    `Q ${n(cx)} ${n(y0 + sag * 2)} ${n(cx + hw)} ${n(y0)} ` +
    `C ${n(cx + hw * cf)} ${n(y0 + d1)} ${n(cx - hw * cf)} ${n(y0 + d1)} ${n(cx - hw)} ${n(y0)} Z`
  );
}

/** 눈 세로 반경: eyeOpen 0 이면 선, 1 이면 원본 크기 */
export function eyeRy(eyeOpen: number) {
  return Math.max(4, RIG.EYE.ry * clamp(eyeOpen, 0, 1.5));
}

/* ---------------- 파트 ---------------- */

interface Skin { ink: string; accent: string; paper: string; k: number }

const Joint: React.FC<{ x: number; y: number; a: number; children: React.ReactNode }> = ({ x, y, a, children }) => (
  <g transform={`translate(${n(x)} ${n(y)}) rotate(${n(a)})`}>{children}</g>
);

const Bone: React.FC<{ len: number; w: number; color: string }> = ({ len, w, color }) => (
  <line x1={0} y1={0} x2={0} y2={n(len)} stroke={color} strokeWidth={w} strokeLinecap="round" />
);

const Leg: React.FC<{ side: 'L' | 'R'; a: LegAngles; sk: Skin }> = ({ side, a, sk }) => {
  const S = side === 'L' ? hipL() : hipR();
  const fdx = side === 'L' ? RIG.FOOT.dx : -RIG.FOOT.dx;
  return (
    <Joint x={S.x} y={S.y} a={a.h}>
      <Bone len={RIG.THIGH} w={RIG.SW_LEG * sk.k} color={sk.ink} />
      <Joint x={0} y={RIG.THIGH} a={a.k}>
        <Bone len={RIG.SHIN} w={RIG.SW_LEG * sk.k} color={sk.ink} />
        <g transform={`translate(0 ${RIG.SHIN})`}>
          <line
            x1={0} y1={0} x2={n(fdx)} y2={n(RIG.FOOT.dy)}
            stroke={sk.ink} strokeWidth={RIG.SW_LEG * sk.k} strokeLinecap="round"
          />
        </g>
      </Joint>
    </Joint>
  );
};

const Arm: React.FC<{ side: 'L' | 'R'; a: ArmAngles; sk: Skin }> = ({ side, a, sk }) => {
  const S = side === 'L' ? shoulderL() : shoulderR();
  // 팔을 들수록 늘어난다. 손 크기와 선 굵기는 그대로 둬서 팔만 뻗은 것으로 읽히게 한다.
  const k = armStretch(a.s);
  const upper = RIG.UPPER_ARM * k;
  const fore = RIG.FOREARM * k;
  return (
    <Joint x={S.x} y={S.y} a={a.s}>
      <Bone len={upper} w={RIG.SW_ARM * sk.k} color={sk.ink} />
      <Joint x={0} y={n(upper)} a={a.e}>
        <Bone len={fore} w={RIG.SW_ARM * sk.k} color={sk.ink} />
        <circle cx={0} cy={n(fore)} r={RIG.HAND_R} fill={sk.ink} />
      </Joint>
    </Joint>
  );
};

const Face: React.FC<{ mouthOpen: number; eyeOpen: number; blush: number; sk: Skin }> = ({
  mouthOpen, eyeOpen, blush, sk,
}) => {
  const ry = eyeRy(eyeOpen);
  const b = clamp(blush, 0, 1.5);
  const bs = 1 + 0.18 * Math.max(0, b - 1);
  return (
    <>
      {b > 0 && (
        <g opacity={n(Math.min(1, b))}>
          <ellipse cx={n(RIG.CX - RIG.BLUSH.dx)} cy={RIG.BLUSH.y} rx={n(RIG.BLUSH.rx * bs)} ry={n(RIG.BLUSH.ry * bs)} fill={sk.accent} />
          <ellipse cx={n(RIG.CX + RIG.BLUSH.dx)} cy={RIG.BLUSH.y} rx={n(RIG.BLUSH.rx * bs)} ry={n(RIG.BLUSH.ry * bs)} fill={sk.accent} />
        </g>
      )}
      <ellipse cx={n(RIG.CX - RIG.EYE.dx)} cy={RIG.EYE.y} rx={RIG.EYE.rx} ry={n(ry)} fill={sk.ink} />
      <ellipse cx={n(RIG.CX + RIG.EYE.dx)} cy={RIG.EYE.y} rx={RIG.EYE.rx} ry={n(ry)} fill={sk.ink} />
      <path
        d={mouthPathD(mouthOpen)}
        fill={sk.accent}
        stroke={sk.ink}
        strokeWidth={RIG.SW_MOUTH * sk.k}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </>
  );
};

/* ---------------- 본체 ----------------
 * z-order (뒤 -> 앞): 다리 -> 몸통(흰 채움) -> 머리(흰 채움) -> 머리카락 -> 얼굴 -> 팔
 * 몸통이 다리 윗부분을, 머리가 몸통 윗부분을 흰색으로 덮어 원본의 "이음매 없는" 실루엣을 만든다.
 * 팔은 맨 앞에 둬서 어떤 각도로 회전해도 머리/몸통에 파묻히지 않는다.
 *
 * 알아둘 것: 이 캐릭터는 머리가 매우 크고(반지름 255) 팔이 짧다(전체 191).
 * 팔을 들면 손이 머리 실루엣 안으로 들어가는 구조라, armStretch() 로 어깨가
 * 올라갈수록 팔이 늘어나게 보정한다 (위 ARM_STRETCH 주석 참고).
 * 기본 자세에서는 배율이 1.0 이라 원본과 완전히 동일하다.
 */
export const CharacterGroup: React.FC<CharacterProps> = (props) => {
  const headTilt = props.headTilt ?? DEFAULT_POSE.headTilt;
  const lean = props.lean ?? DEFAULT_POSE.lean;
  const armL = { ...DEFAULT_POSE.armL, ...props.armL };
  const armR = { ...DEFAULT_POSE.armR, ...props.armR };
  const legL = { ...DEFAULT_POSE.legL, ...props.legL };
  const legR = { ...DEFAULT_POSE.legR, ...props.legR };
  const mouthOpen = props.mouthOpen ?? DEFAULT_POSE.mouthOpen;
  const eyeOpen = props.eyeOpen ?? DEFAULT_POSE.eyeOpen;
  const blush = props.blush ?? DEFAULT_POSE.blush;
  const sk: Skin = {
    ink: props.color ?? INK,
    accent: props.accent ?? CORAL,
    paper: props.fill ?? PAPER,
    k: props.strokeScale ?? 1,
  };

  return (
    <>
      <Leg side="L" a={legL} sk={sk} />
      <Leg side="R" a={legR} sk={sk} />
      <g transform={`rotate(${n(lean)} ${RIG.LEAN_PIVOT.x} ${RIG.LEAN_PIVOT.y})`}>
        <path d={BODY_D} fill={sk.paper} stroke={sk.ink} strokeWidth={RIG.SW * sk.k} strokeLinejoin="round" />
        <g transform={`rotate(${n(headTilt)} ${RIG.HEAD_PIVOT.x} ${RIG.HEAD_PIVOT.y})`}>
          <path d={HEAD_D} fill={sk.paper} stroke={sk.ink} strokeWidth={RIG.SW * sk.k} strokeLinecap="round" strokeLinejoin="round" />
          <path d={HAIR_L_D} fill="none" stroke={sk.ink} strokeWidth={RIG.SW_HAIR * sk.k} strokeLinecap="round" />
          <path d={HAIR_R_D} fill="none" stroke={sk.ink} strokeWidth={RIG.SW_HAIR * sk.k} strokeLinecap="round" />
          <Face mouthOpen={mouthOpen} eyeOpen={eyeOpen} blush={blush} sk={sk} />
        </g>
        <Arm side="L" a={armL} sk={sk} />
        <Arm side="R" a={armR} sk={sk} />
      </g>
    </>
  );
};

export const Character: React.FC<CharacterProps> = (props) => {
  const { width = 420, height, viewBox = `0 0 ${RIG.W} ${RIG.H}`, className, style } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      className={className}
      style={style}
      shapeRendering="geometricPrecision"
    >
      <CharacterGroup {...props} />
    </svg>
  );
};

export default Character;
