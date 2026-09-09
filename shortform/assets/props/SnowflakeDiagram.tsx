/** 눈송이 다이어그램 - 6방향 대칭 가지가 뻗어나가는 성장 애니메이션(`SnowflakeGrowth`)과
 *  완성된 눈송이 실루엣 아이콘(`SnowflakeIcon`)을 함께 제공한다(general-ep20).
 *
 *  재사용 판단(원칙 0): s3의 "물 분자가 정해진 각도로 붙어 육각 결정 구조를 만드는" 장면은
 *  general-ep17이 만든 `WaterMoleculeLattice`(분자 점 + 육각 고리, crystallizeProgress 0~1)를
 *  그대로 재사용한다 - 분자가 육각형으로 배열되는 것 자체가 이미 그 컴포넌트의 목적과
 *  정확히 같다. 하지만 눈송이 가지의 성장(6방향 대칭으로 뻗어나가는 나뭇가지 모양)과 완성된
 *  눈송이 실루엣은 분자 격자와는 전혀 다른 스케일·형태(점·고리가 아니라 뻗어나가는 선)라
 *  WaterMoleculeLattice로 표현할 수 없다 - 이 부분만 새로 만든다.
 *
 *  기하는 전부 모듈 로드 시 1회 계산되는 결정적 배열/함수다(Math.random 미사용, 원칙 3).
 *  6방향 대칭은 "가지 하나"(12시 방향 기준)를 만들고 60도씩 회전 복제해 만든다.
 *  "중심에서 여러 방향으로 대칭 성장하는" 구조를 갖는 다른 소재(결정 성장, 방사형 균열 등)
 *  전반에도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

interface Pt { x: number; y: number }

/** 벡터 (dx,dy) 를 원점 기준 angleDeg 만큼 회전 (시계방향, 화면 좌표계 y-down 기준) */
function rotate(dx: number, dy: number, angleDeg: number): Pt {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

/** 가지 위 옆가지 마디 하나. t = 중심에서 이 마디까지 거리(반지름 대비 비율 0~1),
 *  sideAngle = 가지 축과 옆가지 사이 각도(도), sideLen = 옆가지 길이(반지름 대비 비율) */
interface BranchNode { t: number; sideAngle: number; sideLen: number }

/** variant 별 옆가지 패턴(전부 고정 상수 - 결정적).
 *  0 = 표준, 1 = 뾰족(가지가 좁고 길게 - "더 뾰족한 버전"),
 *  2 = 넓적(가지가 짧고 여러 갈래 - "더 넓적한 버전") */
export type SnowflakeVariant = 0 | 1 | 2;

function branchNodes(variant: SnowflakeVariant): BranchNode[] {
  if (variant === 1) {
    return [
      { t: 0.36, sideAngle: 30, sideLen: 0.15 },
      { t: 0.54, sideAngle: 28, sideLen: 0.19 },
      { t: 0.72, sideAngle: 26, sideLen: 0.15 },
      { t: 0.88, sideAngle: 24, sideLen: 0.10 },
    ];
  }
  if (variant === 2) {
    return [
      { t: 0.26, sideAngle: 50, sideLen: 0.20 },
      { t: 0.40, sideAngle: 48, sideLen: 0.24 },
      { t: 0.56, sideAngle: 46, sideLen: 0.24 },
      { t: 0.72, sideAngle: 44, sideLen: 0.20 },
      { t: 0.88, sideAngle: 42, sideLen: 0.14 },
    ];
  }
  return [
    { t: 0.32, sideAngle: 38, sideLen: 0.18 },
    { t: 0.50, sideAngle: 36, sideLen: 0.22 },
    { t: 0.68, sideAngle: 34, sideLen: 0.18 },
    { t: 0.85, sideAngle: 32, sideLen: 0.13 },
  ];
}

interface Seg { x1: number; y1: number; x2: number; y2: number }

/** 성장 창(마디에 도달한 뒤 옆가지가 완전히 자라기까지 걸리는 g 폭) */
const GROW_WINDOW = 0.15;

/** 가지 하나(인덱스 k, 0=12시 방향에서 60도씩 회전)의 선분들을 g(0~1, 중심에서 이 가지가
 *  얼마나 뻗어나갔는지)만큼 생성 */
function armSegments(k: number, radius: number, nodes: BranchNode[], g: number): Seg[] {
  const dir = rotate(0, -1, k * 60);
  const tip = clamp01(g);
  const segs: Seg[] = [];
  if (tip > 0.001) {
    segs.push({ x1: 0, y1: 0, x2: dir.x * radius * tip, y2: dir.y * radius * tip });
  }
  for (const node of nodes) {
    if (node.t > tip) continue;
    const localG = clamp01((tip - node.t) / GROW_WINDOW);
    if (localG <= 0.001) continue;
    const base = { x: dir.x * radius * node.t, y: dir.y * radius * node.t };
    const len = node.sideLen * radius * localG;
    for (const sign of [1, -1]) {
      const sd = rotate(dir.x, dir.y, sign * node.sideAngle);
      segs.push({ x1: base.x, y1: base.y, x2: base.x + sd.x * len, y2: base.y + sd.y * len });
    }
  }
  return segs;
}

/** 전체 뷰박스 크기(px, 정사각) - 가지 반지름 R = VB*0.41 로 여백을 둔다 */
const VB = 560;
const RADIUS = VB * 0.41;

/** 눈송이 전체(6가지) 선분을 g 와 variant 로 계산 */
function snowflakeSegments(g: number, variant: SnowflakeVariant): Seg[] {
  const nodes = branchNodes(variant);
  const out: Seg[] = [];
  for (let k = 0; k < 6; k++) out.push(...armSegments(k, RADIUS, nodes, g));
  return out;
}

/** 중심에 작게 두는 육각 고리 - s3(WaterMoleculeLattice)의 육각 결정 구조에서 눈송이가
 *  자라난다는 시각적 연속성을 위한 장식(기능적으로는 불필요, 초반 g 에서 함께 페이드인) */
function centerHex(radius: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    out.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
  }
  return out;
}
const CENTER_HEX = centerHex(RADIUS * 0.09);

export interface SnowflakeGrowthProps {
  width: number;
  x: number;
  y: number;
  /** 0 = 중심점만, 1 = 완전히 다 자람 */
  growProgress: number;
  variant?: SnowflakeVariant;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

/** 6방향 대칭으로 가지가 뻗어나가는 성장 애니메이션(타임랩스 성장, s4 용) */
export const SnowflakeGrowth: React.FC<SnowflakeGrowthProps> = ({
  width, x, y, growProgress, variant = 0, color = C.waterCool, opacity = 1, style,
}) => {
  const g = clamp01(growProgress);
  const segs = snowflakeSegments(g, variant);
  const hexOpacity = clamp01(g / 0.12);

  return (
    <svg
      viewBox={`${-VB / 2} ${-VB / 2} ${VB} ${VB}`}
      width={width} height={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', opacity, ...style }}
    >
      {hexOpacity > 0.01 ? (
        <path
          d={`M ${CENTER_HEX.map((p) => `${p.x} ${p.y}`).join(' L ')} Z`}
          fill="none" stroke={C.ink} strokeWidth={SW_THIN * 0.5} opacity={hexOpacity * 0.5}
        />
      ) : null}
      <g stroke={color} strokeWidth={SW_THIN} strokeLinecap="round" fill="none">
        {segs.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
        ))}
      </g>
    </svg>
  );
};

export interface SnowflakeIconProps {
  width: number;
  x: number;
  y: number;
  variant?: SnowflakeVariant;
  color?: string;
  /** 0 = 안 보임, 1 = 완전 등장(페이드+스케일 팝인). 기본 1(즉시 완성 상태) */
  progress?: number;
  opacity?: number;
  style?: React.CSSProperties;
}

/** 완성된 눈송이 실루엣 아이콘(정지 또는 팝인). g=1 고정으로 SnowflakeGrowth 를 감싼 것 -
 *  s5(완성된 큰 눈송이), s6(가지 모양이 다른 실루엣 2개), s8(여러 눈송이 나열)에서 쓴다 */
export const SnowflakeIcon: React.FC<SnowflakeIconProps> = ({
  width, x, y, variant = 0, color = C.ink, progress = 1, opacity = 1, style,
}) => {
  const p = clamp01(progress);
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width, height: width,
        opacity: opacity * Math.min(1, p / 0.6),
        transform: `scale(${0.5 + 0.5 * p})`,
        transformOrigin: '50% 50%',
      }}
    >
      <SnowflakeGrowth width={width} x={0} y={0} growProgress={1} variant={variant} color={color} style={style} />
    </div>
  );
};

export default SnowflakeGrowth;
