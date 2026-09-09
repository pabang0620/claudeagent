/** 초콜릿(또는 유사 지방 덩어리) 소품. `Apple.tsx`의 `browning`/`Meat.tsx`의 `sear`와 같은
 *  "단일 progress로 상태를 연속 보간" 설계를 따르되, 색 오버레이가 아니라 **윤곽선 자체를
 *  보간**한다 - 각진 초콜릿 조각(격자 홈 있는 사각 블록)에서 광택 나는 녹은 웅덩이까지
 *  형태가 바뀌어야 하기 때문이다(대본 02-script-v1.md 자산 목록).
 *
 *  구현: 고정 개수(N)의 윤곽 점을 "블록 상태"와 "웅덩이 상태" 각각 극좌표 공식으로 계산해두고
 *  (둘 다 순수 함수, Math.random 미사용 - 원칙 3), melt만큼 점 좌표를 lerp한 뒤 각 점 쌍의
 *  중점을 지나는 2차 베지어 체인(smoothClosedPath)으로 이어 부드러운 폐곡선을 만든다.
 *  49화에서 겪은 "색 보간 함수가 rgb(...) 문자열을 반환해 재보간에서 깨지는" 문제를 피하려고
 *  색 보간은 아예 쓰지 않고 고정 hex 색만 쓴다(그 대신 형태와 하이라이트 불투명도로 "녹았다"를
 *  표현한다).
 *
 *  `showGrid=false`, `color`를 옅은 노랑으로 바꾸면 버터 등 "각진 지방 덩어리가 녹는" 다른
 *  소재에도 그대로 재사용할 수 있다(색·격자 유무만 다를 뿐 형태 보간 로직은 동일).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

export const CHOCOLATE_VB = 300;

interface Pt { x: number; y: number }

const OUTLINE_N = 20;
const BLOCK_CX = 150;
const BLOCK_CY = 148;
const BLOCK_HW = 92;
const BLOCK_HH = 64;
/** 초콜릿 바 특유의 각진 모서리 - n이 클수록 사각형에 가깝다(슈퍼타원 공식) */
const BLOCK_N = 4.2;

const PUDDLE_CX = 150;
const PUDDLE_CY = 196;
const PUDDLE_HW = 140;
const PUDDLE_HH = 44;

function blockPoint(i: number): Pt {
  const angle = (i / OUTLINE_N) * Math.PI * 2;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const r = 1 / Math.pow(Math.pow(Math.abs(c), BLOCK_N) + Math.pow(Math.abs(s), BLOCK_N), 1 / BLOCK_N);
  return { x: BLOCK_CX + BLOCK_HW * r * c, y: BLOCK_CY + BLOCK_HH * r * s };
}

/** 고정 물결 보정(결정적) - 액체 웅덩이 특유의 울퉁불퉁한 가장자리를 만든다 */
function puddlePoint(i: number): Pt {
  const angle = (i / OUTLINE_N) * Math.PI * 2;
  const wob = 1 + 0.1 * Math.sin(angle * 3 + 1.1) + 0.05 * Math.sin(angle * 5 + 2.4);
  return {
    x: PUDDLE_CX + PUDDLE_HW * wob * Math.cos(angle),
    y: PUDDLE_CY + PUDDLE_HH * wob * Math.sin(angle),
  };
}

/** 점들을 각 쌍의 중점을 지나는 2차 베지어 체인으로 이어 부드러운 폐곡선 path를 만든다.
 *  (좌표를 눈대중으로 그리지 않고 절차적으로 매끄럽게 잇는 범용 기법 - 다른 "형태 보간"
 *  소품에도 재사용 가능) */
function smoothClosedPath(pts: Pt[]): string {
  const n = pts.length;
  const mid = (a: Pt, b: Pt) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const startMid = mid(pts[n - 1], pts[0]);
  let d = `M ${startMid.x} ${startMid.y} `;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const nxt = pts[(i + 1) % n];
    const m = mid(cur, nxt);
    d += `Q ${cur.x} ${cur.y} ${m.x} ${m.y} `;
  }
  return `${d}Z`;
}

export interface ChocolateProps {
  /** 화면상 폭(px). 정사각 viewBox(0 0 300 300), 비율 유지 */
  width: number;
  x: number;
  y: number;
  /** 0~1. 0=각진 고체 조각, 1=광택 나는 녹은 웅덩이 */
  melt?: number;
  /** true면 고체 상태일 때 초콜릿 바 특유의 격자 홈(2x3)을 그린다. melt가 오르면 자동으로
   *  옅어져 사라진다. false로 두면 버터 등 격자가 없는 지방 덩어리로 재사용 가능 */
  showGrid?: boolean;
  color?: string;
  meltColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Chocolate: React.FC<ChocolateProps> = ({
  width, x, y, melt = 0, showGrid = true,
  color = C.chocolate, meltColor = C.chocolateMelt,
  stroke = C.ink, strokeWidth = SW, style,
}) => {
  const m = clamp01(melt);
  const p = smooth(m);
  const cx = lerp(BLOCK_CX, PUDDLE_CX, p);
  const cy = lerp(BLOCK_CY, PUDDLE_CY, p);

  const pts: Pt[] = [];
  for (let i = 0; i < OUTLINE_N; i++) {
    const b = blockPoint(i);
    const q = puddlePoint(i);
    pts.push({ x: lerp(b.x, q.x, p), y: lerp(b.y, q.y, p) });
  }
  const d = smoothClosedPath(pts);

  const gridOpacity = showGrid ? clamp01(1 - m / 0.35) : 0;
  const glossOpacity = clamp01((m - 0.3) / 0.6);

  return (
    <svg
      viewBox={`0 0 ${CHOCOLATE_VB} ${CHOCOLATE_VB}`}
      width={width} height={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <path d={d} fill={color} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />

      {/* 격자 홈 - 고체일 때만 보이고 melt가 오르면 빠르게 사라진다 */}
      {gridOpacity > 0.01 ? (
        <g stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={gridOpacity * 0.55} strokeLinecap="round">
          <line x1={BLOCK_CX - 30} y1={BLOCK_CY - 54} x2={BLOCK_CX - 30} y2={BLOCK_CY + 54} />
          <line x1={BLOCK_CX + 30} y1={BLOCK_CY - 54} x2={BLOCK_CX + 30} y2={BLOCK_CY + 54} />
          <line x1={BLOCK_CX - 82} y1={BLOCK_CY} x2={BLOCK_CX + 82} y2={BLOCK_CY} />
        </g>
      ) : null}

      {/* 광택 하이라이트 - 녹을수록 진해진다 */}
      {glossOpacity > 0.01 ? (
        <ellipse
          cx={cx - PUDDLE_HW * 0.28} cy={cy - 10} rx={26} ry={12}
          fill={meltColor} opacity={glossOpacity * 0.8}
        />
      ) : null}
    </svg>
  );
};

export default Chocolate;
