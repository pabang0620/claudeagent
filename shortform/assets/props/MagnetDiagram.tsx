/** "물질 속 작은 자석(전자)들이 같은 방향으로 정렬되면 전체가 하나의 큰 자석이 된다" +
 *  "N극에서 나온 힘의 흐름이 S극으로 되돌아 들어가려 하고, 반대 극을 마주 놓으면 그 흐름이
 *  이어지며 서로 끌어당긴다"를 보여주는 다이어그램(general-ep24 신설). LightScatterDiagram과
 *  같은 설계 - 독립된 레이어를 각각 progress로 노출하고, undefined면 그 레이어를 안 그린다.
 *
 *   1. alignProgress - 3x3 격자의 작은 화살(전자)이 무질서한 방향에서 같은 방향(위쪽)으로
 *      정렬되고, 정렬이 끝나갈수록 격자를 감싼 테두리가 N(위)/S(아래) 라벨이 붙은 하나의
 *      큰 자석 색으로 물든다(s3).
 *   2. fieldFlowProgress - 막대자석 하나의 N극에서 나온 큰 화살(둥근 궤적)이 자기 S극으로
 *      들어가는 모습을 그린다. attractProgress를 함께 주면 반대 극(S)을 가진 두 번째
 *      자석이 오른쪽에서 다가오고, 화살의 목적지·굴곡이 "자기 자신의 S극"에서 "다가온
 *      자석의 S극"으로 자연스럽게 옮겨가며 짧아진다("흐름이 이어지며 끌어당긴다", s4).
 *
 *  전자 정렬 격자는 3x3(9개)로 제한하고, 자기장 화살도 자석 하나당 1개만 그린다 - 피부 위에
 *  점 여러 개를 흩뿌리는 방식과 달리("징그럽다" 재발 방지, builder 원칙) 화살은 "크고 적게"
 *  그린다. 무질서 방향은 모듈 로드 시 고정된 상수 배열이라 Math.random 없이 항상 같은
 *  결과를 낸다(원칙 3, WaterMoleculeLattice와 같은 원칙).
 *
 *  "작은 단위가 같은 방향으로 정렬되면 전체 성질이 바뀐다"는 구조는 결정·자성 소재 전반에
 *  재사용 가능성이 있어(WaterMoleculeLattice의 상전이 재사용성과 같은 맥락) 에피소드 로컬이
 *  아니라 여기 등록한다. `BarMagnet`·`CompassNeedle`은 자석·나침반이 등장하는 다른 장면에서
 *  이 파일의 나머지 레이어 없이도 단독으로 재사용할 수 있도록 별도 export한다.
 */
import React from 'react';
import { C, FONT, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

interface Pt { x: number; y: number }
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/** 짧은 각도 보간(항상 가까운 방향으로 회전하도록 -180~180 범위로 보정) */
function lerpAngleDeg(a: number, b: number, t: number) {
  const diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lerpColor(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca.r, cb.r, t))}, ${Math.round(lerp(ca.g, cb.g, t))}, ${Math.round(lerp(ca.b, cb.b, t))})`;
}

/** 실제 자석의 N/S 관례(빨강/파랑)를 따르되, 채널 팔레트 안에서 고른다 - 새 색을 하나만
 *  들여온다(파랑 계열은 이미 `theme.ts`의 `C.waterCool`). 코랄+골드 2색 원칙(general 프로필
 *  6절)의 예외지만, N/S는 실제 자석 관례라 색으로 구분하지 않으면 개념 자체가 안 읽힌다
 *  (LightScatterDiagram이 실제 빛 색을 팔레트 밖에서 쓴 것과 같은 이유). */
export const MAGNET_N_COLOR = C.coral;
export const MAGNET_S_COLOR = C.waterCool;

const VB = 700;

/* ---------------- 막대자석 (단독 재사용 가능) ---------------- */

export interface BarMagnetProps {
  /** 중심 x, y (부모 svg 좌표계) */
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  /** true면 왼쪽이 N/오른쪽이 S로 뒤집는다(기본은 왼쪽 S, 오른쪽 N) */
  flip?: boolean;
  stroke?: string;
  nColor?: string;
  sColor?: string;
  labelSize?: number;
}

export const BarMagnet: React.FC<BarMagnetProps> = ({
  cx, cy, w = 220, h = 110, flip = false, stroke = C.ink,
  nColor = MAGNET_N_COLOR, sColor = MAGNET_S_COLOR, labelSize = 56,
}) => {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const leftColor = flip ? nColor : sColor;
  const rightColor = flip ? sColor : nColor;
  const leftLabel = flip ? 'N' : 'S';
  const rightLabel = flip ? 'S' : 'N';
  return (
    <g>
      <rect x={x0} y={y0} width={w / 2} height={h} fill={leftColor} />
      <rect x={x0 + w / 2} y={y0} width={w / 2} height={h} fill={rightColor} />
      <rect x={x0} y={y0} width={w} height={h} rx={16} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
      <text
        x={x0 + w * 0.25} y={cy}
        textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: FONT, fontWeight: 800, fontSize: labelSize, fill: C.paper }}
      >
        {leftLabel}
      </text>
      <text
        x={x0 + w * 0.75} y={cy}
        textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: FONT, fontWeight: 800, fontSize: labelSize, fill: C.paper }}
      >
        {rightLabel}
      </text>
    </g>
  );
};

/* ---------------- 나침반 바늘 (단독 재사용 가능) ---------------- */

export interface CompassNeedleProps {
  cx: number;
  cy: number;
  /** 바깥 원 지름 */
  size: number;
  /** 바늘 각도(도). 0 = 정북(위쪽) */
  angleDeg?: number;
  stroke?: string;
}

export const CompassNeedle: React.FC<CompassNeedleProps> = ({
  cx, cy, size, angleDeg = 0, stroke = C.ink,
}) => {
  const r = size / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
      {[0, 90, 180, 270].map((a) => {
        const rad = (a * Math.PI) / 180;
        const x1 = cx + Math.sin(rad) * (r - 16);
        const y1 = cy - Math.cos(rad) * (r - 16);
        const x2 = cx + Math.sin(rad) * (r - 4);
        const y2 = cy - Math.cos(rad) * (r - 4);
        return (
          <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
        );
      })}
      <g transform={`rotate(${angleDeg} ${cx} ${cy})`}>
        <path
          d={`M ${cx} ${cy - r * 0.72} L ${cx - r * 0.17} ${cy} L ${cx + r * 0.17} ${cy} Z`}
          fill={MAGNET_N_COLOR}
        />
        <path
          d={`M ${cx} ${cy + r * 0.72} L ${cx - r * 0.17} ${cy} L ${cx + r * 0.17} ${cy} Z`}
          fill={C.inkSoft}
        />
      </g>
      <circle cx={cx} cy={cy} r={11} fill={stroke} />
    </g>
  );
};

/* ---------------- 화살(선+화살촉) - 중심점 기준 대칭으로 그린다 ---------------- */

function DipoleArrow({
  cx, cy, angleDeg, len, color, strokeWidth = SW_THIN,
}: { cx: number; cy: number; angleDeg: number; len: number; color: string; strokeWidth?: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const half = len / 2;
  const tailX = cx - dx * half;
  const tailY = cy - dy * half;
  const tipX = cx + dx * half;
  const tipY = cy + dy * half;
  const headLen = Math.min(26, len * 0.34);
  const backX = tipX - dx * headLen;
  const backY = tipY - dy * headLen;
  const perpX = -dy;
  const perpY = dx;
  const headW = headLen * 0.62;
  return (
    <g>
      <line
        x1={tailX} y1={tailY} x2={backX} y2={backY}
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      />
      <path
        d={`M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`}
        fill={color}
      />
    </g>
  );
}

/* ---------------- 전자 정렬 격자(3x3, 고정 배치 - 원칙 3) ---------------- */

const BOX_X = 90;
const BOX_Y = 130;
const BOX_W = 520;
const BOX_H = 460;
const GRID_COLS = [BOX_X + 90, BOX_X + BOX_W / 2, BOX_X + BOX_W - 90];
const GRID_ROWS = [BOX_Y + 90, BOX_Y + BOX_H / 2, BOX_Y + BOX_H - 90];
/** 무질서 상태의 고정 각도(도) 9개 - Math.random 미사용, 눈으로 봤을 때 방향이 제각각이면
 *  충분하므로 임의로 흩어 놓은 상수다. */
const DISORDERED_ANGLES = [25, 160, 260, 340, 95, 200, 130, 310, 60];
/** 정렬 완료 시 방향: 위쪽(-90deg) */
const ALIGNED_ANGLE = -90;

/* ---------------- 메인 컴포넌트 ---------------- */

export interface MagnetDiagramProps {
  width: number;
  x: number;
  y: number;

  /** 0~1: 전자(작은 화살) 격자가 무질서 -> 정렬로 바뀌고, 격자 테두리가 N/S 라벨이 붙은
   *  자석으로 물드는 진행도(s3). undefined면 이 레이어를 안 그린다 */
  alignProgress?: number;

  /** 0~1: 막대자석의 N극에서 나온 화살이 S극으로 들어가는 궤적의 reveal 진행도(s4).
   *  undefined면 자석·화살 레이어 전체를 안 그린다 */
  fieldFlowProgress?: number;
  /** 0~1: 반대 극을 가진 두 번째 자석이 오른쪽에서 다가오는 진행도. 지정하면 화살의
   *  목적지가 자기 자신의 S극에서 다가온 자석의 S극으로 옮겨가며 짧아진다. undefined면
   *  두 번째 자석 없이 자기 자신에게 돌아가는 궤적만 그린다 */
  attractProgress?: number;

  stroke?: string;
  style?: React.CSSProperties;
}

export const MagnetDiagram: React.FC<MagnetDiagramProps> = ({
  width, x, y, alignProgress, fieldFlowProgress, attractProgress, stroke = C.ink, style,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
    <svg width={width} height={width} viewBox={`0 0 ${VB} ${VB}`} style={{ overflow: 'visible' }}>
      {alignProgress !== undefined ? (() => {
        const ap = smooth(alignProgress);
        const arrowColor = lerpColor(C.inkSoft, MAGNET_N_COLOR, ap);
        const borderColor = lerpColor(C.hill, stroke, ap);
        const washT = smooth(clamp01((alignProgress - 0.55) / 0.45));
        const labelT = smooth(clamp01((alignProgress - 0.65) / 0.35));
        const arrowsOpacity = clamp01(alignProgress * 6);
        return (
          <g opacity={arrowsOpacity}>
            {washT > 0.01 ? (
              <g opacity={washT}>
                <rect
                  x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H / 2}
                  fill={MAGNET_N_COLOR} opacity={0.22}
                />
                <rect
                  x={BOX_X} y={BOX_Y + BOX_H / 2} width={BOX_W} height={BOX_H / 2}
                  fill={MAGNET_S_COLOR} opacity={0.22}
                />
              </g>
            ) : null}
            <rect
              x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={28}
              fill="none" stroke={borderColor} strokeWidth={SW_THIN}
            />
            {GRID_ROWS.map((cy, ri) => GRID_COLS.map((cx, ci) => {
              const idx = ri * 3 + ci;
              const angle = lerpAngleDeg(DISORDERED_ANGLES[idx], ALIGNED_ANGLE, ap);
              return (
                <DipoleArrow key={idx} cx={cx} cy={cy} angleDeg={angle} len={108} color={arrowColor} strokeWidth={12} />
              );
            }))}
            {labelT > 0.01 ? (
              <g opacity={labelT}>
                <text
                  x={BOX_X + BOX_W / 2} y={BOX_Y - 34}
                  textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, fill: MAGNET_N_COLOR }}
                >
                  N
                </text>
                <text
                  x={BOX_X + BOX_W / 2} y={BOX_Y + BOX_H + 40}
                  textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, fill: MAGNET_S_COLOR }}
                >
                  S
                </text>
              </g>
            ) : null}
          </g>
        );
      })() : null}

      {fieldFlowProgress !== undefined ? (() => {
        const magCx = 230;
        const magCy = 390;
        const magW = 220;
        const magH = 110;
        const hasB = attractProgress !== undefined;
        const attract = clamp01(attractProgress ?? 0);

        const nPt: Pt = { x: magCx + magW / 2, y: magCy - magH / 2 };
        const selfS: Pt = { x: magCx - magW / 2, y: magCy - magH / 2 };
        const farBCenter = magCx + magW / 2 + magW / 2 + 160;
        const touchBCenter = magCx + magW / 2 + magW / 2;
        const bCenter = hasB ? lerp(farBCenter, touchBCenter, attract) : farBCenter;
        const bLeftTop: Pt = { x: bCenter - magW / 2, y: magCy - magH / 2 };
        const targetS = hasB ? lerpPt(selfS, bLeftTop, attract) : selfS;
        const apexAbove = lerp(230, 55, hasB ? attract : 0);
        const apex: Pt = { x: (nPt.x + targetS.x) / 2, y: Math.min(nPt.y, targetS.y) - apexAbove };
        const pathD = `M ${nPt.x} ${nPt.y} Q ${apex.x} ${apex.y} ${targetS.x} ${targetS.y}`;

        const reveal = clamp01(fieldFlowProgress);
        const headT = smooth(clamp01((reveal - 0.8) / 0.2));
        const headDx = targetS.x - apex.x;
        const headDy = targetS.y - apex.y;
        const headAngle = (Math.atan2(headDy, headDx) * 180) / Math.PI;

        return (
          <g>
            <path
              d={pathD} fill="none" stroke={MAGNET_N_COLOR} strokeWidth={13} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - reveal}
            />
            {headT > 0.01 ? (
              <g opacity={headT}>
                <path
                  d={(() => {
                    const rad = (headAngle * Math.PI) / 180;
                    const dx = Math.cos(rad);
                    const dy = Math.sin(rad);
                    const perpX = -dy;
                    const perpY = dx;
                    const headLen = 28;
                    const headW = 17;
                    const backX = targetS.x - dx * headLen;
                    const backY = targetS.y - dy * headLen;
                    return `M ${targetS.x.toFixed(1)} ${targetS.y.toFixed(1)} L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`;
                  })()}
                  fill={MAGNET_N_COLOR}
                />
              </g>
            ) : null}
            <BarMagnet cx={magCx} cy={magCy} w={magW} h={magH} stroke={stroke} />
            {hasB ? <BarMagnet cx={bCenter} cy={magCy} w={magW} h={magH} stroke={stroke} /> : null}
          </g>
        );
      })() : null}
    </svg>
  </div>
);

export default MagnetDiagram;
