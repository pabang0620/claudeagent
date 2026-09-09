/** "액체 속에 고르게 흩어진 입자들이, 세균이 만든 산성 물질이 늘어날수록 서로 밀어내던
 *  힘을 잃고 뭉쳐 하나의 덩어리를 이룬다"는 구조를 보여주는 우유 응고(curdling) 확대
 *  다이어그램(general-ep36, "우유가 상하면 덩어리지는 이유").
 *
 *  SoapMicelleDiagram(성질이 다른 두 물질이 특수 분자에 둘러싸여 뭉친다)·CellMergeDiagram
 *  (분리된 두 요소가 만나 반응한다)과는 구조가 달라 그대로 재사용할 수 없었다(REGISTRY 확인
 *  완료, 02-script-v1.md 참고). "고르게 퍼진 여러 입자가 하나의 조건(산성화)이 진행될수록
 *  서로를 향해 모여 하나의 덩어리로 합쳐진다"는 다대일 응집(aggregation) 구조는 이번이
 *  처음이라 새로 만들었다. CellMergeDiagram·DoughDiagram·SaltCycleDiagram과 같은 원칙
 *  (독립 progress, undefined/0이면 그 레이어를 안 그림)을 그대로 따른다.
 *
 *  "신체 표현은 최소한으로" 원칙(builder 지침)에 따라 세균은 촘촘한 점 무리가 아니라
 *  크고 단순한 도형 1마리(몸통+눈2개+미소, DoughDiagram의 효모·WetSoilAerosolDiagram의
 *  미생물과 동일 설계)로, 당분은 다이아몬드 2개로, 산성 물질(젖산)도 최대 3개의 큼직한
 *  원으로만 그린다(작은 점을 여러 개 흩뿌리지 않는다). 단백질(카세인)도 큰 원 4개로만
 *  표현하고, 뭉치는 과정은 CellMergeDiagram과 동일하게 "원 여러 개가 한 지점으로
 *  이동해 겹친다"는 방식으로 표현한다(복잡한 블롭 유니온 연산 없이 겹침만으로 "하나의
 *  덩어리"라는 인상을 준다).
 *
 *   - bacteriaProgress : 0~1. 세균 1마리 + 당분 다이아몬드 2개가 팝인. s3용
 *   - acidProgress      : 0~1. 당분이 먹히며 줄어들다 사라지고(0~0.5), 산성 물질(붉은 원)이
 *     최대 3개까지 순서대로 나타난다(0.15~1). bacteriaProgress=1을 전제로 한다. s3용
 *   - proteinAppear      : 0~1. 카세인 단백질 원 4개가 흩어진 제자리에서 페이드+팝인.
 *     "원래 이렇게 골고루 퍼져 있었다"는 도입 상태를 보여준다. s3 후반~s4용
 *   - curdProgress        : 0~1. 단백질 원 4개가 각자 자리에서 중앙 한 지점 근처로 모여들어
 *     서로 겹치며 하나의 덩어리처럼 보인다. 뭉친 자리 뒤로 은은한 발광이 번진다.
 *     proteinAppear=1을 전제로 한다. s4용
 *  전부 0이면 "빈 유리컵 확대 배경만 있는" 정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const MILK_VB_W = 700;
export const MILK_VB_H = 700;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BOX = { x: 60, y: 60, w: 580, h: 580 };

function diamond(cx: number, cy: number, r: number) {
  return `M ${cx},${cy - r} L ${cx + r * 0.72},${cy} L ${cx},${cy + r} L ${cx - r * 0.72},${cy} Z`;
}

/** 세균 1마리 - DoughDiagram의 Yeast와 동일 설계(몸통+눈2개+미소). 색만 다르게 받는다 */
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

/** 세균·당분·산성 물질(젖산) 자리 - 박스 왼쪽 아래 영역 */
const BACTERIUM_PT = { x: 170, y: 500, r: 58 };
const SUGAR_PTS = [
  { x: 100, y: 440, r: 20 },
  { x: 235, y: 570, r: 18 },
];
const ACID_PTS = [
  { x: 300, y: 460, r: 24 },
  { x: 235, y: 360, r: 22 },
  { x: 385, y: 440, r: 20 },
];

/** 카세인 단백질 4개 - 박스 오른쪽 위 영역에 흩어져 있다가, 아래 CURD_TARGETS로 모인다 */
const PROTEIN_HOME = [
  { x: 200, y: 150, r: 54 },
  { x: 460, y: 130, r: 52 },
  { x: 560, y: 350, r: 50 },
  { x: 350, y: 230, r: 56 },
];
const CURD_TARGETS = [
  { x: 370, y: 205 },
  { x: 415, y: 195 },
  { x: 405, y: 245 },
  { x: 365, y: 240 },
];
const CURD_CENTER = { x: 390, y: 220 };

export interface MilkCurdleDiagramProps {
  /** 화면상 폭(px). viewBox(700x700)는 정사각이라 높이도 같다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 세균 + 당분이 팝인. 기본 0(안 보임) */
  bacteriaProgress?: number;
  /** 0~1. 당분이 줄어 사라지고 산성 물질(붉은 원)이 순서대로 나타남. bacteriaProgress=1 전제 */
  acidProgress?: number;
  /** 0~1. 단백질 4개가 제자리에서 페이드+팝인 */
  proteinAppear?: number;
  /** 0~1. 단백질 4개가 중앙으로 모여 겹치며 하나의 덩어리를 이룬다. proteinAppear=1 전제 */
  curdProgress?: number;
  stroke?: string;
  boxFill?: string;
  bacteriaColor?: string;
  sugarColor?: string;
  acidColor?: string;
  proteinColor?: string;
  style?: React.CSSProperties;
}

export const MilkCurdleDiagram: React.FC<MilkCurdleDiagramProps> = ({
  width, x = 0, y = 0,
  bacteriaProgress = 0, acidProgress = 0, proteinAppear = 0, curdProgress = 0,
  stroke = C.ink, boxFill = C.paper,
  bacteriaColor = C.leaf, sugarColor = C.gold, acidColor = C.coral, proteinColor = C.goldSoft,
  style,
}) => {
  const height = (width * MILK_VB_H) / MILK_VB_W;
  const bactP = clamp01(bacteriaProgress);
  const acidP = clamp01(acidProgress);
  const protAppearP = clamp01(proteinAppear);
  const curdP = clamp01(curdProgress);

  const bactAppear = smooth(clamp01(bactP / 0.7));
  const eatP = smooth(clamp01(acidP / 0.5));
  const curdEase = smooth(curdP);
  const haloP = smooth(clamp01((curdP - 0.55) / 0.45));

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${MILK_VB_W} ${MILK_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 확대 배경 박스(유리컵 속 액체를 확대해서 보는 자리) */}
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={44} fill={boxFill} stroke={stroke} strokeWidth={SW} />

        {/* 뭉친 자리 뒤 은은한 발광 - "여러 개가 하나로 합쳐졌다"는 인상을 보강 */}
        {haloP > 0.01 ? (
          <circle cx={CURD_CENTER.x} cy={CURD_CENTER.y} r={70 + haloP * 78} fill={proteinColor} opacity={haloP * 0.5} />
        ) : null}

        {/* 카세인 단백질 4개 - 흩어진 제자리 -> 중앙 근처로 모여 겹침 */}
        {protAppearP > 0.01 ? (
          PROTEIN_HOME.map((home, i) => {
            const local = clamp01((curdEase - i * 0.05) / (1 - i * 0.05));
            const t = smooth(local);
            const target = CURD_TARGETS[i];
            const cx = lerp(home.x, target.x, t);
            const cy = lerp(home.y, target.y, t);
            return (
              <circle
                key={`prot${i}`} cx={cx} cy={cy} r={home.r} fill={proteinColor} stroke={stroke}
                strokeWidth={SW_THIN} opacity={protAppearP}
              />
            );
          })
        ) : null}

        {/* 산성 물질(젖산) - 최대 3개, 순서대로 등장 */}
        {ACID_PTS.map((pt, i) => {
          const local = clamp01((eatP - i * 0.32) / (1 - i * 0.32));
          if (local <= 0.001) return null;
          const s = 0.4 + 0.6 * local;
          return (
            <circle
              key={`acid${i}`} cx={pt.x} cy={pt.y} r={pt.r * s} fill={acidColor} stroke={stroke}
              strokeWidth={SW_THIN * 0.7} opacity={local}
            />
          );
        })}

        {/* 당분 - 세균이 먹으며 줄어들다 사라짐 */}
        {SUGAR_PTS.map((pt, i) => {
          if (bactP <= 0.001) return null;
          const localEat = clamp01((eatP - i * 0.2) / (1 - i * 0.2));
          const s = 1 - localEat;
          if (s <= 0.02) return null;
          return (
            <path
              key={`sugar${i}`} d={diamond(pt.x, pt.y, pt.r * s)} fill={sugarColor} stroke={stroke}
              strokeWidth={SW_THIN * 0.7} opacity={s}
            />
          );
        })}

        {/* 세균 1마리 */}
        <Bacterium
          x={BACTERIUM_PT.x} y={BACTERIUM_PT.y} r={BACTERIUM_PT.r} appear={bactAppear}
          stroke={stroke} fill={bacteriaColor}
        />
      </svg>
    </div>
  );
};

/** 컵(예: IceFloatCup) 수면 위에 얹는 "덩어리진 우유" 오버레이. MilkCurdleDiagram의 카세인
 *  뭉침(원 4개가 겹쳐 하나의 덩어리로 보이는 표현)과 같은 시각 언어를 매크로 샷(컵을 든
 *  실제 장면)에도 그대로 쓰기 위해 분리했다. ScentWaves와 같은 원칙으로 cx/cy(화면 좌표)를
 *  직접 받는 독립 오버레이라 어떤 배경 위에도 자유롭게 얹을 수 있다.
 *
 *  `curdle`(0~1)로 "아직 매끈한 액체"(0, 입자가 작고 넓게 퍼짐) -> "몽글몽글 뭉친 덩어리"
 *  (1, 입자가 크고 겹쳐 하나처럼 보임) 사이를 보간한다. s1(이미 뭉쳐 있는 정지 컷,
 *  curdle=1 고정)·s5(뭉친 덩어리가 뜬 정지 컷, curdle=1 고정 + 호출부가 살짝 bobbing을
 *  얹음)·s6(레몬즙 한 방울에 순식간에 뭉치는 연출, curdle 0->1 빠르게 애니메이션)에 재사용. */
const CLUMP_PTS = [
  { dx: -0.18, dy: -0.08, r: 0.30 },
  { dx: 0.16, dy: -0.14, r: 0.27 },
  { dx: 0.18, dy: 0.13, r: 0.28 },
  { dx: -0.14, dy: 0.16, r: 0.26 },
];

export interface MilkClumpProps {
  /** 중심 x (화면 좌표) */
  cx: number;
  cy: number;
  /** 덩어리 기준 지름(px) */
  size: number;
  /** 0~1. 0=아직 매끈한 액체(입자가 작고 넓게 퍼짐), 1=뭉친 덩어리(입자가 커지며 겹침) */
  curdle?: number;
  color?: string;
  stroke?: string;
  style?: React.CSSProperties;
}

export const MilkClump: React.FC<MilkClumpProps> = ({
  cx, cy, size, curdle = 1, color = C.goldSoft, stroke = C.ink, style,
}) => {
  const p = smooth(clamp01(curdle));
  if (p <= 0.001) return null;
  const spread = lerp(2.1, 1, p); // 0일수록 넓게 퍼짐, 1일수록 한 자리로 모임
  const scale = lerp(0.55, 1, p); // 0일수록 작은 입자, 1일수록 큰 덩어리
  const opacity = 0.35 + 0.65 * p;
  const box = size * 1.3;

  return (
    <svg
      width={box} height={box}
      style={{ position: 'absolute', left: cx - box / 2, top: cy - box / 2, overflow: 'visible', ...style }}
    >
      <g opacity={opacity}>
        {CLUMP_PTS.map((pt, i) => (
          <circle
            key={i}
            cx={box / 2 + pt.dx * size * spread}
            cy={box / 2 + pt.dy * size * spread}
            r={pt.r * size * scale}
            fill={color}
            stroke={stroke}
            strokeWidth={SW_THIN * 0.6}
          />
        ))}
      </g>
    </svg>
  );
};

export default MilkCurdleDiagram;
