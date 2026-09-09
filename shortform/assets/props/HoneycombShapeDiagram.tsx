/** "벌집은 벌이 재료(밀랍)를 아끼려고 고른 최적의 모양"이라는 구조를 보여주는 다이어그램
 *  (벌집이 육각형인 이유, general-ep88 신설).
 *
 *  REGISTRY 확인 완료 - `WaterMoleculeLattice`(general-ep17)와 `SnowflakeGrowth`/`SnowflakeIcon`
 *  (general-ep20)은 둘 다 "물 분자가 정해진 각도로 붙어 육각형 결정이 된다"는 결정 구조 전용이라
 *  "여러 도형(원/사각형/육각형)을 같은 재료(둘레)로 타일링했을 때 생기는 빈틈·면적 차이를
 *  비교"하는 이 화의 개념과 원리 자체가 달라 재사용할 수 없었다(대본 자체가 이 반전 - 눈송이는
 *  분자 결합 각도, 벌집은 재료 효율을 위한 기하학적 선택 - 을 s3에서 명시적으로 짚는다).
 *  도형 타일링 효율 비교를 보여줄 기존 자산이 없어 새로 만든다.
 *
 *  두 가지 독립된 모드를 한 컴포넌트가 커버한다(HiccupDiagram/PressureBoilingDiagram과 같은
 *  "mode 하나로 여러 화면 커버" 설계와 유사하되, 여기서는 prop 존재 여부로 모드를 가른다):
 *
 *   1. `honeycombGrowth`(0~1, 지정 시 이 모드) - 벌 한 마리가 육각형 방 3칸을 순서대로 짓는
 *      성장 애니메이션(s1, 무성). 3칸을 균등한 1/3 구간으로 나눠 팝인시키고, 작은 벌 글리프가
 *      지금 짓고 있는 칸으로 이동한다. "벌을 여러 마리 잔뜩 그리지 않는다"(오케스트레이터
 *      지시)에 따라 벌은 정확히 1마리만 그린다.
 *
 *   2. `shapeIndex`(0=원/1=사각형/2=육각형, 정수 사이는 크로스페이드) + `fillProgress`(0~1,
 *      0~0.5=클러스터가 순서대로 팝인, 0.5~1=핵심 강조 - 원은 "빈틈"이, 사각형·육각형은
 *      "면적"이 드러남) - 세 도형의 타일링 효율을 비교하는 모드(s5~s6). 원은 3개가 서로 맞닿는
 *      삼각형 배치로 두면 가운데 곡선 삼각형 모양의 틈이 반드시 남는다(고전적인 원 packing
 *      결과 - 삼각형 뒤에 gapColor를 채우고 그 위에 원 3개를 base fill로 덮는 방식으로
 *      정확한 곡선 틈 모양을 얻는다, 눈대중 근사가 아니라 기하로 유도). 사각형은 한 줄로 3개를
 *      이어 붙여 틈이 없음을 보여주고, 육각형은 실제 벌집처럼 3칸이 서로 맞닿는 삼각형 배치를
 *      쓴다(honeycombGrowth 모드와 같은 육각 중심 좌표계를 공유 - axial 육각좌표 공식으로 계산한
 *      실제 인접 벌집 칸 위치라 틈 없이 맞물린다는 것이 좌표 자체로 보장된다, 눈대중 배치 아님).
 *      사각형·육각형의 상대 크기는 "같은 둘레(P_REF)로 만들 수 있는 도형"이라는 실제 등둘레
 *      공식(정사각형 한 변 = P/4, 정육각형 한 변 = P/6, 정육각형 둘레 대비 넓이가 정사각형보다
 *      약 15.5% 더 크다 - `(2*Math.sqrt(3))/3` 배)에서 그대로 유도했다(숫자를 임의로 지어내지
 *      않음) - 그래서 hexSide < squareSide(변 하나는 더 짧음)인데도 정육각형 실루엣이 실제로는
 *      더 넓게(폭이 더 크게) 보인다. 원은 타일링 목적이 아니라 "틈이 생긴다"는 것 자체를
 *      보여주는 용도라 같은 P_REF를 쓰지 않고 별도 반지름을 둔다.
 *
 *  두 모드 모두 CellMergeDiagram과 같은 원칙("지금 이 순간의 상태"만 그리는 순수 함수)을
 *  따르고, 좌표는 전부 모듈 로드 시 1회 계산되는 결정적 값이다(Math.random 미사용, 원칙 3).
 *  "여러 후보 도형 중 틈 없이 타일링되면서도 같은 재료로 가장 넓은 면적을 만드는 모양을
 *  비교한다"는 구조를 갖는 다른 최적화·효율 소재 전반 재사용 가능성이 있어 에피소드 로컬이
 *  아니라 라이브러리에 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

interface Pt { x: number; y: number }

const SQRT3 = Math.sqrt(3);

/** flat-top 정육각형의 axial 좌표 -> 픽셀 변환 (Red Blob Games 표준 공식).
 *  size = 중심~꼭짓점 거리(= 정육각형 한 변 길이). */
function axialToPixel(q: number, r: number, size: number): Pt {
  return { x: size * 1.5 * q, y: size * (SQRT3 / 2 * q + SQRT3 * r) };
}

/** 서로 맞닿는(인접) 육각형 3칸의 중심 좌표를 axial 좌표로 구하고, 그 3칸의 무게중심이
 *  원점에 오도록 이동한다. (0,0)/(1,0)/(0,1) 은 축좌표계에서 서로 이웃하는 3칸이므로
 *  이 좌표로 그린 육각형은 좌표 자체로 이미 틈 없이 맞물린다(눈대중 배치 아님). */
function adjacentHexCentersLocal(size: number): [Pt, Pt, Pt] {
  const raw: Pt[] = [axialToPixel(0, 0, size), axialToPixel(1, 0, size), axialToPixel(0, 1, size)];
  const cx = (raw[0].x + raw[1].x + raw[2].x) / 3;
  const cy = (raw[0].y + raw[1].y + raw[2].y) / 3;
  return [
    { x: raw[0].x - cx, y: raw[0].y - cy },
    { x: raw[1].x - cx, y: raw[1].y - cy },
    { x: raw[2].x - cx, y: raw[2].y - cy },
  ];
}

/** flat-top 정육각형 6꼭짓점 문자열 (중심 cx,cy 기준, 반지름 r = 중심~꼭짓점 거리) */
function hexPointsStr(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const rad = (Math.PI / 180) * (60 * i);
    pts.push(`${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`);
  }
  return pts.join(' ');
}

/* ================= 좌표 상수 (viewBox 800x800, 패널 중심 400,420) ================= */
const VB = 800;
const PANEL_CX = 400;
const PANEL_CY = 420;

/** "같은 재료(둘레)"라는 서술을 그대로 반영한 등둘레 예산. 임의 숫자가 아니라 시각적으로
 *  보기 좋은 스케일 하나를 고른 것 뿐이고, 이 값에서 아래 두 변의 길이가 실제 공식으로 유도된다. */
const P_REF = 1000;
/** 정사각형 한 변 = 둘레/4 */
const SQUARE_SIDE = P_REF / 4; // 250
/** 정육각형 한 변(= 중심~꼭짓점 반지름) = 둘레/6 */
const HEX_SIDE = P_REF / 6; // 166.67

/** 원은 타일링 비교 목적이 아니라 "틈이 생긴다"는 사실 자체를 보여주는 용도라 별도 반지름.
 *  HEX_SIDE 기준 클러스터 바운딩박스(약 650)와 비슷한 화면 크기가 되도록 잡았다(스틸
 *  선점검 실측 - 처음엔 도형이 800 뷰박스 안에서 너무 작게 보여 키웠다). */
const CIRCLE_R = 150;

const HEX_CENTERS_LOCAL = adjacentHexCentersLocal(HEX_SIDE);
const HEX_CENTERS = HEX_CENTERS_LOCAL.map((p) => ({ x: p.x + PANEL_CX, y: p.y + PANEL_CY }));

/** 사각형은 3개를 한 줄로 이으면(HEX_SIDE 기준 스케일에서) 뷰박스 폭(800)을 넘어가 잘리므로
 *  2x2 격자(4칸)로 배치한다 - 어느 배치든 "빈틈 없이 이어 붙는다"는 요점은 동일하게 보여준다. */
const SQUARE_CENTERS = [-1, 1].flatMap((sx) => [-1, 1].map((sy) => (
  { x: PANEL_CX + sx * (SQUARE_SIDE / 2), y: PANEL_CY + sy * (SQUARE_SIDE / 2) }
)));

const CIRCLE_CENTROID_R = (2 * CIRCLE_R) / SQRT3;
const CIRCLE_CENTERS = [-90, 30, 150].map((deg) => {
  const rad = (Math.PI / 180) * deg;
  return { x: PANEL_CX + CIRCLE_CENTROID_R * Math.cos(rad), y: PANEL_CY + CIRCLE_CENTROID_R * Math.sin(rad) };
});

export const HONEYCOMB_VB_W = VB;
export const HONEYCOMB_VB_H = VB;

/** HEX_SIDE 기준으로 벌 글리프 크기를 비례시키는 배율(벌 내부 치수는 HEX_SIDE=113.33
 *  기준으로 잡혀 있었으므로 그 비율로 스케일한다 - 스틸 선점검에서 벌이 점처럼 작게
 *  보이는 결함을 실측으로 발견해 수정) */
const BEE_SCALE = HEX_SIDE / 113.33;

/* ================= 벌 글리프 (단순하고 귀여운 도형, 1마리만) ================= */
const Bee: React.FC<{ cx: number; cy: number; scale: number; f: number; stroke: string }> = ({
  cx, cy, scale, f, stroke,
}) => {
  const bob = Math.sin(f / 9) * 4;
  const wingFlap = 0.6 + 0.4 * Math.abs(Math.sin(f / 3));
  return (
    <g transform={`translate(${cx} ${cy + bob}) scale(${scale})`}>
      {/* 날개 2장 (몸통 뒤) */}
      <ellipse cx={-10} cy={-18} rx={16 * wingFlap} ry={22} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.55} opacity={0.85} transform="rotate(-18 -10 -18)" />
      <ellipse cx={12} cy={-18} rx={16 * wingFlap} ry={22} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.55} opacity={0.85} transform="rotate(18 12 -18)" />
      {/* 몸통 */}
      <ellipse cx={0} cy={0} rx={28} ry={22} fill={C.gold} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
      {/* 줄무늬 2가닥 */}
      <path d="M -10 -19 A 22 22 0 0 0 -10 19" fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.6} strokeLinecap="round" />
      <path d="M 6 -21.5 A 22 22 0 0 1 6 21.5" fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.6} strokeLinecap="round" />
      {/* 눈 1개(옆모습 관례) + 더듬이 */}
      <circle cx={22} cy={-6} r={3.2} fill={stroke} />
      <path d="M 20 -18 Q 26 -28 32 -30" fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.4} strokeLinecap="round" />
    </g>
  );
};

/* ================= 모드 1: 벌집 성장 ================= */
export interface HoneycombShapeDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 지정하면 성장 모드(s1) - 육각형 방 3칸을 순서대로 짓는다 */
  honeycombGrowth?: number;
  /** 0(원)~1(사각형)~2(육각형). 지정하면 비교 모드(s5~s6). 정수 사이는 크로스페이드 */
  shapeIndex?: number;
  /** 0~1. 비교 모드에서 클러스터 팝인(0~0.5)과 강조 반영(0.5~1) 진행도. 기본 0 */
  fillProgress?: number;
  /** 성장 모드에서 벌 글리프를 그릴지. 완성된 아이콘으로만 쓸 때(s3 비교샷) false */
  showBee?: boolean;
  /** 은은한 맥동/날갯짓용 프레임(선택, 기본 0) */
  f?: number;
  stroke?: string;
  fill?: string;
  gapColor?: string;
  roomColor?: string;
  style?: React.CSSProperties;
}

export const HoneycombShapeDiagram: React.FC<HoneycombShapeDiagramProps> = ({
  width, x = 0, y = 0,
  honeycombGrowth, shapeIndex, fillProgress = 0, showBee = true, f = 0,
  stroke = C.ink, fill = C.paper, gapColor = C.coralSoft, roomColor = C.goldSoft,
  style,
}) => {
  const isGrowth = honeycombGrowth !== undefined;

  if (isGrowth) {
    const g = clamp01(honeycombGrowth as number);
    const t3 = g * 3;
    const activeIdx = Math.min(2, Math.floor(t3));
    const prevIdx = Math.max(0, activeIdx - 1);
    const segF = clamp01(t3 - activeIdx);
    // 벌이 이전 칸에서 지금 짓는 칸으로 재빨리(0~0.3 구간) 이동한 뒤 그 자리에서 짓는다
    const hop = clamp01(segF / 0.3);
    const from = HEX_CENTERS[prevIdx];
    const to = HEX_CENTERS[activeIdx];
    const bee = { x: from.x + (to.x - from.x) * hop, y: from.y + (to.y - from.y) * hop };

    return (
      <svg
        viewBox={`0 0 ${VB} ${VB}`} width={width} height={width}
        style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      >
        <g stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round">
          {HEX_CENTERS.map((c, i) => {
            const localT = clamp01(t3 - i);
            if (localT <= 0.001) return null;
            const s = smooth(localT);
            const opacity = clamp01(localT * 2.2);
            return (
              <polygon
                key={i}
                points={hexPointsStr(0, 0, HEX_SIDE)}
                fill={fill}
                opacity={opacity}
                transform={`translate(${c.x} ${c.y}) scale(${0.15 + 0.85 * s})`}
              />
            );
          })}
        </g>
        {showBee ? <Bee cx={bee.x} cy={bee.y - HEX_SIDE * 0.55} scale={BEE_SCALE} f={f} stroke={stroke} /> : null}
      </svg>
    );
  }

  const shapeIdx = shapeIndex ?? 0;
  const lo = Math.max(0, Math.min(2, Math.floor(shapeIdx)));
  const hi = Math.min(2, lo + 1);
  const frac = clamp01(shapeIdx - lo);
  const fp = clamp01(fillProgress);

  const buildT = (i: number) => clamp01((fp * 1.4 - i * 0.16) / 0.6);
  const highlightT = clamp01((fp - 0.55) / 0.45);

  const renderShape = (idx: number, opacity: number) => {
    if (opacity <= 0.01) return null;
    if (idx === 0) {
      // 원 3개(삼각형 배치) - 뒤에 gapColor 삼각형, 앞에 원 3개
      const tri = `M ${CIRCLE_CENTERS[0].x} ${CIRCLE_CENTERS[0].y} L ${CIRCLE_CENTERS[1].x} ${CIRCLE_CENTERS[1].y} L ${CIRCLE_CENTERS[2].x} ${CIRCLE_CENTERS[2].y} Z`;
      return (
        <g key="circle" opacity={opacity}>
          <path d={tri} fill={gapColor} opacity={0.9 * highlightT} />
          {CIRCLE_CENTERS.map((c, i) => {
            const bt = smooth(buildT(i));
            if (bt <= 0.001) return null;
            return (
              <circle
                key={i} cx={c.x} cy={c.y} r={CIRCLE_R * bt}
                fill={fill} stroke={stroke} strokeWidth={SW_THIN}
              />
            );
          })}
        </g>
      );
    }
    if (idx === 1) {
      return (
        <g key="square" opacity={opacity}>
          {SQUARE_CENTERS.map((c, i) => {
            const bt = smooth(buildT(i));
            if (bt <= 0.001) return null;
            const half = (SQUARE_SIDE / 2) * bt;
            return (
              <g key={i}>
                <rect
                  x={c.x - half} y={c.y - half} width={half * 2} height={half * 2}
                  fill={fill} stroke={stroke} strokeWidth={SW_THIN}
                />
                <rect
                  x={c.x - half} y={c.y - half} width={half * 2} height={half * 2}
                  fill={roomColor} opacity={0.7 * highlightT}
                />
              </g>
            );
          })}
        </g>
      );
    }
    return (
      <g key="hex" opacity={opacity}>
        {HEX_CENTERS.map((c, i) => {
          const bt = smooth(buildT(i));
          if (bt <= 0.001) return null;
          const r = HEX_SIDE * bt;
          const pts = hexPointsStr(c.x, c.y, r);
          return (
            <g key={i}>
              <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round" />
              <polygon points={pts} fill={roomColor} opacity={0.7 * highlightT} />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`} width={width} height={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {renderShape(lo, 1 - frac)}
      {hi !== lo ? renderShape(hi, frac) : null}
    </svg>
  );
};

export default HoneycombShapeDiagram;
