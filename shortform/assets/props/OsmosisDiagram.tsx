/** "농도가 짙은 쪽 옆에 놓인 세포가, 그 세포막을 통해 물을 밖으로 빼앗긴다"는 삼투
 *  (osmosis) 구조를 보여주는 다이어그램(소금에 절이면 음식이 안 상하는 이유,
 *  general-ep67). REGISTRY 확인 완료 - MilkCurdleDiagram(general-ep36, 여러 입자가 하나로
 *  뭉치는 응집 구조)과 FermentJar(general-ep57, 밀폐 용기 바깥 시점)는 방향이 반대이거나
 *  시점이 달라 그대로 재사용할 수 없었다. 이 소재는 "물이 세포 밖으로 빠져나가 쪼그라든다"는
 *  탈수 구조라 새로 만들었다. CellMergeDiagram·SaltCycleDiagram과 같은 원칙(독립 progress,
 *  이전 단계가 1인 상태를 전제로 이어받음, undefined/0이면 그 레이어를 안 그림)을 따른다.
 *
 *  "신체 표현은 최소한으로" 원칙에 따라 세균은 촘촘한 점 무리가 아니라 도형 1마리
 *  (몸통+눈2개+미소, MilkCurdleDiagram·DoughDiagram과 동일 설계)로만 그리고, 소금은
 *  SaltCycleDiagram과 같은 다이아몬드 결정 글리프를 최대 4개까지만, 세포는 촘촘한 벌집이
 *  아니라 큼직한 알약 모양 2개로만 표현한다.
 *
 *   - saltProgress          : 0~1. 소금 결정이 최대 4개까지 순서대로 팝인. s2용.
 *   - waterOutProgress      : 0~1. saltProgress=1 전제 - 세포 2개에서 물방울 화살표가 소금
 *     쪽으로 빠져나가고, 세포 자체도 살짝 쪼그라든다. s2용.
 *   - bacteriaShrinkProgress : 0~1. waterOutProgress=1 전제 - 세균 1마리가 팝인한 뒤(0~0.25)
 *     몸속 물이 작은 화살표로 빠져나가며 몸이 쪼그라든다(0.25~1). s3용.
 *   - growthBlockProgress    : 0~1. bacteriaShrinkProgress=1 전제 - 세균 위로 증식(분열)을
 *     시도하는 화살표가 절반쯤 자라다(0~0.5) 멈추고, 그 위에 X 표시가 그려진다(0.3~1).
 *     화살표 끝에는 옅은 "미완성 분신" 원이 살짝만 비친다. s4용.
 *  전부 0이면 "빈 조직 단면 박스"만 있는 정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const OSMOSIS_VB_W = 700;
export const OSMOSIS_VB_H = 700;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BOX = { x: 60, y: 60, w: 580, h: 580 };

/** 세포 2개 - 조직 단면의 왼쪽 아래에 큼직한 알약 모양으로만 (촘촘한 벌집 금지) */
const CELL_PTS = [
  { cx: 205, cy: 470, w: 220, h: 168 },
  { cx: 355, cy: 520, w: 186, h: 140 },
];

/** 소금 결정 - 오른쪽 위 영역에 흩뿌림(최대 4개, 잔뜩 뿌리지 않음) */
const SALT_PTS = [
  { x: 470, y: 150, r: 28 },
  { x: 400, y: 108, r: 24 },
  { x: 540, y: 208, r: 22 },
  { x: 478, y: 268, r: 20 },
];

/** 물방울 화살표 - 세포 가장자리에서 소금 쪽으로, 딱 2가닥만 */
const WATER_ARROWS = [
  { from: { x: 275, y: 410 }, ctrl: { x: 350, y: 300 }, to: { x: 430, y: 236 } },
  { from: { x: 400, y: 452 }, ctrl: { x: 445, y: 360 }, to: { x: 480, y: 300 } },
];

/** 세균 - 소금 무리 아래쪽, 세포와 가까운 자리 */
const BACTERIUM_PT = { x: 512, y: 462, r: 62 };
/** 세균 몸속 물이 빠지는 작은 화살표 (세균 -> 근처 소금 결정). WATER_ARROWS[1]과 겹쳐
 *  교차하지 않도록 더 오른쪽 위(소금 결정 무리 오른쪽 가장자리)를 향하게 뺐다. */
const BACTERIA_DRAIN_ARROW = { from: { x: 492, y: 412 }, ctrl: { x: 528, y: 340 }, to: { x: 556, y: 288 } };
/** 증식 시도 화살표 - 세균 바로 위로 곧게 */
const GROWTH_ARROW_FROM = { x: BACTERIUM_PT.x, y: BACTERIUM_PT.y - BACTERIUM_PT.r - 14 };
const GROWTH_ARROW_TO = { x: BACTERIUM_PT.x, y: BACTERIUM_PT.y - BACTERIUM_PT.r - 118 };
const GROWTH_GHOST_PT = { x: GROWTH_ARROW_TO.x, y: GROWTH_ARROW_TO.y - 6, r: 34 };
const GROWTH_X_CENTER = { x: GROWTH_ARROW_FROM.x, y: (GROWTH_ARROW_FROM.y + GROWTH_ARROW_TO.y) / 2 };

function angleOf(ctrl: { x: number; y: number }, to: { x: number; y: number }) {
  return (Math.atan2(to.y - ctrl.y, to.x - ctrl.x) * 180) / Math.PI;
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
      <line
        x1={-r * 0.3} y1={-r * 0.28} x2={r * 0.2} y2={-r * 0.05}
        stroke="#FFFFFF" strokeWidth={SW_THIN * 0.5} strokeLinecap="round" opacity={0.7}
      />
    </g>
  );
}

/** 물방울 화살표 - strokeDasharray pathLength 트릭으로 리빌, 끝에 삼각 화살촉 */
function WaterArrow({
  from, ctrl, to, reveal, color,
}: {
  from: { x: number; y: number }; ctrl: { x: number; y: number }; to: { x: number; y: number };
  reveal: number; color: string;
}) {
  const r = clamp01(reveal);
  if (r <= 0.001) return null;
  const ang = angleOf(ctrl, to);
  const headAlpha = smooth(clamp01((r - 0.7) / 0.3));
  return (
    <g opacity={r}>
      <path
        d={`M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`}
        fill="none" stroke={color} strokeWidth={SW_THIN * 0.85} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r}
      />
      {headAlpha > 0.01 ? (
        <g transform={`translate(${to.x} ${to.y}) rotate(${ang})`} opacity={headAlpha}>
          <path d="M 0 0 L -22 -12 L -22 12 Z" fill={color} />
        </g>
      ) : null}
    </g>
  );
}

/** 세균 1마리 - MilkCurdleDiagram의 Bacterium과 동일 설계(몸통+눈2개+미소) */
function Bacterium({
  x, y, r, appear, stroke, fill,
}: { x: number; y: number; r: number; appear: number; stroke: string; fill: string }) {
  if (appear <= 0.001) return null;
  const s = 0.5 + 0.5 * appear;
  return (
    <g style={{ opacity: appear }} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.88} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={-r * 0.3} cy={-r * 0.06} r={r * 0.1} fill={stroke} />
      <circle cx={r * 0.3} cy={-r * 0.06} r={r * 0.1} fill={stroke} />
      <path
        d={`M ${-r * 0.24} ${r * 0.32} Q 0 ${r * 0.48} ${r * 0.24} ${r * 0.32}`}
        fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.7} strokeLinecap="round"
      />
    </g>
  );
}

export interface OsmosisDiagramProps {
  /** 화면상 폭(px). viewBox(700x700)는 정사각이라 높이도 같다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 소금 결정이 최대 4개까지 순서대로 팝인. 기본 0(안 보임) */
  saltProgress?: number;
  /** 0~1. 세포에서 물방울이 소금 쪽으로 빠져나가고 세포가 살짝 쪼그라듦. saltProgress=1 전제 */
  waterOutProgress?: number;
  /** 0~1. 세균이 팝인한 뒤 몸속 물이 빠지며 쪼그라듦. waterOutProgress=1 전제 */
  bacteriaShrinkProgress?: number;
  /** 0~1. 증식 시도 화살표가 절반쯤 자라다 멈추고 X 표시로 막힘. bacteriaShrinkProgress=1 전제 */
  growthBlockProgress?: number;
  stroke?: string;
  boxFill?: string;
  cellColor?: string;
  saltColor?: string;
  bacteriaColor?: string;
  waterColor?: string;
  blockColor?: string;
  style?: React.CSSProperties;
}

export const OsmosisDiagram: React.FC<OsmosisDiagramProps> = ({
  width, x = 0, y = 0,
  saltProgress = 0, waterOutProgress = 0, bacteriaShrinkProgress = 0, growthBlockProgress = 0,
  stroke = C.ink, boxFill = C.paper,
  cellColor = C.coralSoft, saltColor = C.paper, bacteriaColor = C.leaf,
  waterColor = C.waterCool, blockColor = C.coral,
  style,
}) => {
  const height = (width * OSMOSIS_VB_H) / OSMOSIS_VB_W;
  const saltP = clamp01(saltProgress);
  const waterP = clamp01(waterOutProgress);
  const shrinkP = clamp01(bacteriaShrinkProgress);
  const blockP = clamp01(growthBlockProgress);

  const cellShrinkT = smooth(waterP);
  const cellScale = lerp(1, 0.86, cellShrinkT);

  const bactAppear = smooth(clamp01(shrinkP / 0.25));
  const bactShrinkT = smooth(clamp01((shrinkP - 0.25) / 0.75));
  const bactR = lerp(BACTERIUM_PT.r, BACTERIUM_PT.r * 0.5, bactShrinkT);
  const drainReveal = clamp01((shrinkP - 0.3) / 0.5);

  const growReveal = clamp01(blockP / 0.5);
  const ghostAlpha = smooth(growReveal) * 0.3;
  const xReveal = clamp01((blockP - 0.3) / 0.7);
  const gx = GROWTH_X_CENTER;
  const xSize = 30;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${OSMOSIS_VB_W} ${OSMOSIS_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 조직 단면 박스 */}
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={44} fill={boxFill} stroke={stroke} strokeWidth={SW} />

        {/* 세포 2개 - 알약 모양, 물이 빠지며 살짝 쪼그라듦 */}
        {CELL_PTS.map((c, i) => (
          <rect
            key={`cell${i}`}
            x={c.cx - c.w / 2} y={c.cy - c.h / 2} width={c.w} height={c.h} rx={c.h / 2}
            fill={cellColor} stroke={stroke} strokeWidth={SW_THIN}
            transform={`translate(${c.cx} ${c.cy}) scale(${cellScale}) translate(${-c.cx} ${-c.cy})`}
          />
        ))}

        {/* 물방울 화살표 - 세포 -> 소금 쪽 */}
        {WATER_ARROWS.map((a, i) => {
          const local = clamp01((waterP - i * 0.15) / (1 - i * 0.15));
          return <WaterArrow key={`warr${i}`} from={a.from} ctrl={a.ctrl} to={a.to} reveal={local} color={waterColor} />;
        })}

        {/* 소금 결정 - 최대 4개, 순서대로 팝인 */}
        {SALT_PTS.map((pt, i) => {
          const local = clamp01((saltP - i * 0.22) / (1 - i * 0.22));
          return <SaltDiamond key={`salt${i}`} x={pt.x} y={pt.y} r={pt.r} appear={local} color={saltColor} stroke={stroke} />;
        })}

        {/* 증식 시도 화살표 + X 표시 (세균 뒤에 그려 세균이 앞에 오도록) */}
        {growReveal > 0.001 ? (
          <g opacity={growReveal}>
            <path
              d={`M ${GROWTH_ARROW_FROM.x} ${GROWTH_ARROW_FROM.y} L ${GROWTH_ARROW_TO.x} ${GROWTH_ARROW_TO.y}`}
              fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.85} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - growReveal}
            />
            {ghostAlpha > 0.01 ? (
              <circle
                cx={GROWTH_GHOST_PT.x} cy={GROWTH_GHOST_PT.y} r={GROWTH_GHOST_PT.r}
                fill={bacteriaColor} stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={ghostAlpha}
              />
            ) : null}
          </g>
        ) : null}
        {xReveal > 0.001 ? (
          <g opacity={xReveal}>
            <line
              x1={gx.x - xSize} y1={gx.y - xSize} x2={gx.x + xSize} y2={gx.y + xSize}
              stroke={blockColor} strokeWidth={SW_THIN} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, xReveal * 2)}
            />
            <line
              x1={gx.x + xSize} y1={gx.y - xSize} x2={gx.x - xSize} y2={gx.y + xSize}
              stroke={blockColor} strokeWidth={SW_THIN} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, xReveal * 2 - 1))}
            />
          </g>
        ) : null}

        {/* 세균 몸속 물이 빠지는 작은 화살표 */}
        <WaterArrow
          from={BACTERIA_DRAIN_ARROW.from} ctrl={BACTERIA_DRAIN_ARROW.ctrl} to={BACTERIA_DRAIN_ARROW.to}
          reveal={drainReveal} color={waterColor}
        />

        {/* 세균 1마리 */}
        <Bacterium x={BACTERIUM_PT.x} y={BACTERIUM_PT.y} r={bactR} appear={bactAppear} stroke={stroke} fill={bacteriaColor} />
      </svg>
    </div>
  );
};

export default OsmosisDiagram;
