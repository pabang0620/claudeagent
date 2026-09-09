/** "물질이 빗물에 조금씩 녹아 나와 강물을 타고 이동한 뒤, 도착지에서 물만 빠져나가고
 *  남은 물질이 시간이 지나며 계속 쌓인다"는 순환+선택적 축적 구조를 보여주는 범용
 *  다이어그램(강물은 안 짠데 바닷물만 짠 이유, general-ep33). CellMergeDiagram·
 *  HiccupDiagram과 같은 원칙(이 순간의 상태만 그림, 시간 곡선은 호출 씬이 만든다) - 단
 *  각 progress는 CaffeineReceptorDiagram의 releaseProgress처럼 "이전 단계가 이미 1인 상태"를
 *  전제로 이어받아 하나의 긴 인과를 자연스럽게 이어 그릴 수 있게 설계했다.
 *
 *  전체 지형(구름 - 산/바위 - 강 - 바다)은 progress와 무관하게 항상 옅게 그려지는 "지도"
 *  이고(HiccupDiagram의 몸통 실루엣과 같은 역할), 그 위에서 5개의 독립 레이어가 움직인다.
 *  강·바다·산은 사실적 지형이 아니라 삼각형·물결 사각형·굵은 곡선 화살표 하나로만
 *  단순화했다(원칙 - 지도/지형을 사실적으로 그리지 않는다). 소금은 촘촘한 점 대신 크고
 *  단순한 다이아몬드 도형 2개로만 표현한다("징그럽다" 재발 방지 원칙 - WetSoilAerosolDiagram·
 *  DoughDiagram과 동일).
 *
 *   - dissolveProgress : 0~1. 구름에서 빗방울이 바위 쪽으로 떨어지고(0~0.55), 바위 표면에
 *     균열이 생기며 살짝 깎여 작아진다(0.4~1). s3용.
 *   - releaseProgress   : 0~1. dissolveProgress=1을 전제로, 바위 틈에서 소금 다이아몬드 2개가
 *     순서대로 팝인해 바위 밑 작은 웅덩이에 자리잡는다. s4용.
 *   - riverFlowProgress : 0~1. releaseProgress=1을 전제로, 강줄기가 산에서 바다까지 그려지며
 *     (strokeDashoffset 리빌) 그 위로 소금 다이아몬드 2개가 시차를 두고 강을 따라 바다까지
 *     흘러간다. s5용.
 *   - evapProgress      : 0~1. riverFlowProgress=1을 전제로(소금은 바다 표면에 이미 도착해
 *     정지), 바다 표면에서 물방울 화살표 3개가 위로 올라가 구름에 닿아 사라진다 - "물만
 *     빠져나가고 소금은 그대로 남는" 대비. s6용.
 *   - accumProgress     : 0~1. evapProgress=1을 전제로, 바다 바닥에 소금 더미(mound)가
 *     점점 높이 쌓이고 그 위에 소금 결정 2~3개가 순서대로 팝인한다("수십억 년 쌓인" 결과).
 *     s7용, CountUp 숫자와 함께 쓴다.
 *  전부 undefined/0이면 "빈 지형(구름-산-강-바다)"만 보이는 정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const SALT_VB_W = 700;
export const SALT_VB_H = 1320;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const band = (v: number, a: number, b: number) => smooth((v - a) / Math.max(0.0001, b - a));

const CLOUD_PT = { x: 430, y: 96 };
const CLOUD_RX = 118;
const CLOUD_RY = 44;

const MOUNTAIN_APEX = { x: 340, y: 176 };
const MOUNTAIN_BASE_L = { x: 110, y: 566 };
const MOUNTAIN_BASE_R = { x: 570, y: 566 };

const ROCK_PT = { x: 336, y: 352 };
const ROCK_R = 66;

const RIVER_START = { x: 336, y: 566 };
const RIVER_P1 = { x: 520, y: 700 };
const RIVER_P2 = { x: 190, y: 862 };
const SEA_ENTRY = { x: 300, y: 986 };

const SEA_TOP_Y = 986;
const SEA_FLOOR_Y = 1280;
const SEA_LEFT_X = 60;
const SEA_RIGHT_X = 640;

/** 소금 2개의 "쉬는 자리" - 바위 밑 웅덩이 */
const SALT_REST_PTS = [
  { x: ROCK_PT.x - 46, y: ROCK_PT.y + ROCK_R + 30 },
  { x: ROCK_PT.x + 42, y: ROCK_PT.y + ROCK_R + 44 },
];

function bez(t: number, p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) {
  const mt = 1 - t;
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}

const RIVER_D = `M ${RIVER_START.x} ${RIVER_START.y} C ${RIVER_P1.x} ${RIVER_P1.y} ${RIVER_P2.x} ${RIVER_P2.y} ${SEA_ENTRY.x} ${SEA_ENTRY.y}`;
const RIVER_LEN = (() => {
  let len = 0;
  let prev = RIVER_START;
  for (let i = 1; i <= 48; i++) {
    const t = i / 48;
    const p = bez(t, RIVER_START, RIVER_P1, RIVER_P2, SEA_ENTRY);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
})();

function seaSurfacePath() {
  return `M ${SEA_LEFT_X} ${SEA_TOP_Y} Q ${(SEA_LEFT_X + SEA_RIGHT_X) / 2 - 60} ${SEA_TOP_Y - 22} ${(SEA_LEFT_X + SEA_RIGHT_X) / 2} ${SEA_TOP_Y} T ${SEA_RIGHT_X} ${SEA_TOP_Y}`;
}

function SaltDiamond({
  x, y, r, appear, color, stroke,
}: { x: number; y: number; r: number; appear: number; color: string; stroke: string }) {
  const a = clamp01(appear);
  if (a <= 0.001) return null;
  const s = 0.4 + 0.6 * a;
  return (
    <g style={{ opacity: a }} transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={`M 0 ${-r} L ${r * 0.82} 0 L 0 ${r} L ${-r * 0.82} 0 Z`}
        fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.75} strokeLinejoin="round"
      />
      <line x1={-r * 0.3} y1={-r * 0.28} x2={r * 0.2} y2={-r * 0.05} stroke="#FFFFFF" strokeWidth={SW_THIN * 0.5} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

function CloudShape({ cx, cy, rx, ry, color }: { cx: number; cy: number; rx: number; ry: number; color: string }) {
  return (
    <g>
      <ellipse cx={cx - rx * 0.42} cy={cy + ry * 0.2} rx={rx * 0.5} ry={ry * 0.72} fill={color} />
      <ellipse cx={cx + rx * 0.4} cy={cy + ry * 0.22} rx={rx * 0.54} ry={ry * 0.76} fill={color} />
      <ellipse cx={cx} cy={cy - ry * 0.18} rx={rx * 0.62} ry={ry * 0.82} fill={color} />
    </g>
  );
}

export interface SaltCycleDiagramProps {
  width: number;
  x: number;
  y: number;
  dissolveProgress?: number;
  releaseProgress?: number;
  riverFlowProgress?: number;
  evapProgress?: number;
  accumProgress?: number;
  stroke?: string;
  rockColor?: string;
  riverColor?: string;
  seaColor?: string;
  cloudColor?: string;
  saltColor?: string;
  style?: React.CSSProperties;
}

export const SaltCycleDiagram: React.FC<SaltCycleDiagramProps> = ({
  width, x, y,
  dissolveProgress = 0, releaseProgress = 0, riverFlowProgress = 0, evapProgress = 0, accumProgress = 0,
  stroke = C.ink, rockColor = C.hillFar, riverColor = C.water, seaColor = C.seaDeep,
  cloudColor = C.inkSoft, saltColor = C.paper, style,
}) => {
  const scale = width / SALT_VB_W;
  const height = SALT_VB_H * scale;

  const dp = clamp01(dissolveProgress);
  const rp = clamp01(releaseProgress);
  const fp = clamp01(riverFlowProgress);
  const ep = clamp01(evapProgress);
  const ap = clamp01(accumProgress);

  // 바위: 균열은 dp 0.2~0.55, 크기 축소는 dp 0.4~1
  const crackA = band(dp, 0.2, 0.55);
  const rockShrink = 1 - 0.16 * band(dp, 0.4, 1);

  // 빗방울 3개(시차) - dp 구간 안에서 한 번씩 낙하
  const rainDrops = [0, 0.18, 0.34].map((off) => {
    const t = band(dp, off, off + 0.42);
    return t;
  });

  // 바위 밑 웅덩이에서 소금 2개가 팝인
  const saltAtRock = [0, 0.28].map((off) => band(rp, off, off + 0.6));

  // 강 리빌 + 소금이 강을 따라 흐름
  const riverReveal = fp;
  const saltFlowT = [
    clamp01(fp),
    clamp01((fp - 0.3) / 0.7),
  ];

  // 바다 위 소금 도착 여부(강물 흐름이 끝에 가까워지면 도착 상태로 전환)
  const arrived = fp >= 0.995;

  // 증발 화살표 3개(시차)
  const evapArrows = [0, 0.22, 0.44].map((off) => band(ep, off, off + 0.5));

  // 소금 더미(축적) 높이
  const moundH = 170 * smooth(ap);
  const crystalA = [0.15, 0.45, 0.75].map((off) => band(ap, off, off + 0.35));

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${SALT_VB_W} ${SALT_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* ---- 지형(항상 옅게) ---- */}
      <path
        d={`M ${MOUNTAIN_APEX.x} ${MOUNTAIN_APEX.y} L ${MOUNTAIN_BASE_R.x} ${MOUNTAIN_BASE_R.y} L ${MOUNTAIN_BASE_L.x} ${MOUNTAIN_BASE_L.y} Z`}
        fill={rockColor} stroke={stroke} strokeWidth={SW_THIN} opacity={0.5}
      />
      <path
        d={RIVER_D} fill="none" stroke={riverColor} strokeWidth={SW_THIN * 1.4}
        strokeLinecap="round" opacity={0.35}
      />
      <path d={seaSurfacePath()} fill="none" stroke={stroke} strokeWidth={SW_THIN} opacity={0.3} />
      <rect x={SEA_LEFT_X} y={SEA_TOP_Y} width={SEA_RIGHT_X - SEA_LEFT_X} height={SEA_FLOOR_Y - SEA_TOP_Y} fill={seaColor} opacity={0.4} />
      <CloudShape cx={CLOUD_PT.x} cy={CLOUD_PT.y} rx={CLOUD_RX} ry={CLOUD_RY} color={cloudColor} />

      {/* ---- 바위(침식) ---- */}
      <g transform={`translate(${ROCK_PT.x} ${ROCK_PT.y}) scale(${rockShrink})`}>
        <circle cx={0} cy={0} r={ROCK_R} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
        <path
          d={`M ${-ROCK_R * 0.3} ${-ROCK_R * 0.4} L ${ROCK_R * 0.1} ${-ROCK_R * 0.05} L ${-ROCK_R * 0.05} ${ROCK_R * 0.3}`}
          fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.6} strokeLinecap="round" opacity={crackA}
        />
      </g>

      {/* ---- 빗방울 ---- */}
      {rainDrops.map((t, i) => {
        if (t <= 0.001 || t >= 0.999) return null;
        const sx = CLOUD_PT.x - 30 + i * 30;
        const sy = CLOUD_PT.y + CLOUD_RY * 0.7;
        const ex = ROCK_PT.x - 20 + i * 20;
        const ey = ROCK_PT.y - ROCK_R + 4;
        const py = lerp(sy, ey, t);
        const fadeOut = t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1;
        return (
          <line
            key={i} x1={sx} y1={py} x2={sx} y2={py + 34}
            stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" opacity={0.55 * fadeOut}
          />
        );
      })}

      {/* ---- 바위 밑 웅덩이 + 소금 릴리즈 ---- */}
      <ellipse
        cx={ROCK_PT.x} cy={ROCK_PT.y + ROCK_R + 34} rx={70} ry={20}
        fill={riverColor} opacity={0.35 * Math.max(saltAtRock[0], saltAtRock[1])}
      />
      {saltAtRock.map((a, i) => (
        <SaltDiamond key={i} x={SALT_REST_PTS[i].x} y={SALT_REST_PTS[i].y} r={30} appear={fp > 0 ? 0 : a} color={saltColor} stroke={stroke} />
      ))}

      {/* ---- 강줄기 리빌 ---- */}
      <path
        d={RIVER_D} fill="none" stroke={riverColor} strokeWidth={SW * 0.8}
        strokeLinecap="round"
        strokeDasharray={RIVER_LEN}
        strokeDashoffset={RIVER_LEN * (1 - riverReveal)}
        opacity={riverReveal > 0.01 ? 0.9 : 0}
      />

      {/* ---- 소금이 강을 따라 흐름 ---- */}
      {!arrived && saltFlowT.map((t, i) => {
        if (t <= 0.001 || t >= 0.999) return null;
        const p = bez(t, RIVER_START, RIVER_P1, RIVER_P2, SEA_ENTRY);
        return <SaltDiamond key={i} x={p.x} y={p.y} r={28} appear={1} color={saltColor} stroke={stroke} />;
      })}

      {/* ---- 바다 표면에 도착한 소금(정지) ---- */}
      {arrived && (
        <>
          <SaltDiamond x={SEA_ENTRY.x - 30} y={SEA_ENTRY.y + 26} r={30} appear={1} color={saltColor} stroke={stroke} />
          <SaltDiamond x={SEA_ENTRY.x + 46} y={SEA_ENTRY.y + 44} r={30} appear={1} color={saltColor} stroke={stroke} />
        </>
      )}

      {/* ---- 증발: 물방울 화살표가 바다에서 구름으로 ---- */}
      {evapArrows.map((t, i) => {
        if (t <= 0.001 || t >= 0.999) return null;
        const sx = SEA_LEFT_X + 140 + i * 150;
        const sy = SEA_TOP_Y - 10;
        const ex = CLOUD_PT.x - 60 + i * 50;
        const ey = CLOUD_PT.y + CLOUD_RY;
        const px = lerp(sx, ex, t);
        const py = lerp(sy, ey, t);
        const fadeOut = t > 0.82 ? 1 - (t - 0.82) / 0.18 : 1;
        return (
          <g key={i} opacity={0.85 * fadeOut}>
            <line x1={px} y1={py + 22} x2={px} y2={py} stroke={riverColor} strokeWidth={SW_THIN} strokeLinecap="round" />
            <path d={`M ${px - 9} ${py + 10} L ${px} ${py - 4} L ${px + 9} ${py + 10}`} fill="none" stroke={riverColor} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}

      {/* ---- 바다에 남아 소금이 계속 쌓임(축적) ---- */}
      {ap > 0.001 && (
        <>
          <path
            d={`M ${SEA_ENTRY.x - 90} ${SEA_FLOOR_Y} Q ${SEA_ENTRY.x} ${SEA_FLOOR_Y - moundH * 1.15} ${SEA_ENTRY.x + 110} ${SEA_FLOOR_Y} Z`}
            fill={saltColor} stroke={stroke} strokeWidth={SW_THIN} opacity={0.95}
          />
          {crystalA.map((a, i) => {
            if (a <= 0.001) return null;
            const cx = SEA_ENTRY.x - 40 + i * 45;
            const cy = SEA_FLOOR_Y - moundH * (0.55 + i * 0.18);
            return <SaltDiamond key={i} x={cx} y={cy} r={26} appear={a} color={saltColor} stroke={stroke} />;
          })}
        </>
      )}
    </svg>
  );
};

export default SaltCycleDiagram;
