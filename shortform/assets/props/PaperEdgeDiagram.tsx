/** 종이 단면(톱니 모양) vs 칼날 단면(매끈함) 비교 + 그 톱니 모양이 살을 뜯듯 가르는
 *  애니메이션. general-ep38("종이에 베이면 유독 아픈 이유") s3·s4 전용으로 신설했다.
 *  REGISTRY 3절 확인 완료 - 자르는 표면의 요철을 다루는 기존 자산이 없었다.
 *
 *  오케스트레이터 시각 주의사항을 그대로 반영한다: 톱니는 촘촘한 잔니가 아니라 큼직한
 *  요철 3개로 단순화하고(`EDGE_POINTS`), 살이 갈라지는 표현은 붉은 액체 없이 두 조각이
 *  같은 톱니선을 따라 살짝 벌어지는 것으로만 보여준다(단면 채움은 `C.paper` - Finger와
 *  같은 "흰 몸체 + ink 외곽선" 규약을 그대로 따라 사실적 살색을 쓰지 않는다).
 *
 *  두 레이어를 독립 progress로 노출한다(GoosebumpDiagram·TwinkleDiagram과 같은 설계):
 *   - edgeRevealProgress(0~1): s3 전반부. 종이 블록이 나타나고 톱니 단면선이 그려진다.
 *   - compareProgress(0~1): s3 후반부. 칼날 블록(매끈한 직선 단면)이 종이 옆에 나타난다.
 *   - tearProgress(0~1): s4 전용. 종이 톱니선과 같은 모양의 절개선을 따라 피부 단면이
 *     위/아래로 살짝 벌어진다(뜯기듯 갈라짐). edgeReveal/compare와 같은 씬에서 같이 쓰지
 *     않는다(호출부가 필요한 progress만 넘기고 나머지는 생략).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const PAPER_EDGE_VB_W = 640;
export const PAPER_EDGE_VB_H = 680;

/* ---------------- s3: 종이 단면(톱니) vs 칼날 단면(매끈) ---------------- */

const PAPER_X0 = 90;
const PAPER_EDGE_X = 300;
/** 종이 오른쪽 단면 - 큼직한 요철 3개(촘촘한 잔니 금지) */
const PAPER_EDGE_PTS: [number, number][] = [
  [PAPER_EDGE_X, 70], [PAPER_EDGE_X - 30, 112], [PAPER_EDGE_X, 154],
  [PAPER_EDGE_X - 30, 196], [PAPER_EDGE_X, 238], [PAPER_EDGE_X - 30, 280], [PAPER_EDGE_X, 320],
];
const PAPER_Y0 = 70;
const PAPER_Y1 = 320;

/** 종이 라벨 앵커 (viewBox 좌표, 호출부가 <Label> 로 위에 얹는다) */
export const PAPER_EDGE_LABEL_PT = { x: (PAPER_X0 + PAPER_EDGE_X) / 2, y: PAPER_Y0 - 110 };

const BLADE_X0 = 90;
const BLADE_EDGE_X = 300;
const BLADE_Y0 = 400;
const BLADE_Y1 = 650;
/** 칼날 라벨 앵커 */
export const BLADE_EDGE_LABEL_PT = { x: (BLADE_X0 + BLADE_EDGE_X) / 2, y: BLADE_Y0 - 70 };

function pathFromPts(pts: [number, number][]) {
  return pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${px} ${py}`).join(' ');
}

/* ---------------- s4: 톱니선을 따라 피부 단면이 벌어진다 ---------------- */

const TEAR_X0 = 60;
const TEAR_X1 = 580;
const TEAR_BASE_Y = 340;
/** 가로로 누운 톱니선 - s3 의 세로 톱니와 같은 "큼직한 요철 3개" 언어를 90도 돌려 재사용 */
const TEAR_PTS: [number, number][] = [
  [TEAR_X0, TEAR_BASE_Y], [148, TEAR_BASE_Y - 30], [246, TEAR_BASE_Y + 26],
  [344, TEAR_BASE_Y - 30], [442, TEAR_BASE_Y + 26], [540, TEAR_BASE_Y - 4], [TEAR_X1, TEAR_BASE_Y],
];
const SKIN_TOP = 210;
const SKIN_BOTTOM = 470;
/** 최대로 벌어지는 간격(px) - 사실적인 상처가 아니라 "살짝 뜯기는" 정도로 작게 잡는다 */
const MAX_GAP = 22;

export interface PaperEdgeDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 종이 블록 등장 + 톱니 단면선 그려짐 */
  edgeRevealProgress?: number;
  /** 0~1. 칼날 블록(매끈한 단면) 등장 */
  compareProgress?: number;
  /** 0~1. 피부 단면이 톱니선을 따라 위/아래로 벌어짐 (edgeReveal/compare와 별도 씬에서 사용) */
  tearProgress?: number;
  stroke?: string;
  fill?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const PaperEdgeDiagram: React.FC<PaperEdgeDiagramProps> = ({
  width, x = 0, y = 0, edgeRevealProgress, compareProgress, tearProgress,
  stroke = C.ink, fill = C.paper, accent = C.coral, style,
}) => {
  const rp = edgeRevealProgress === undefined ? undefined : clamp01(edgeRevealProgress);
  const cp = compareProgress === undefined ? undefined : clamp01(compareProgress);
  const tp = tearProgress === undefined ? undefined : clamp01(tearProgress);

  const blockOpacity = rp === undefined ? 0 : Math.min(1, rp / 0.3);
  const edgeDraw = rp === undefined ? 0 : rp < 0.3 ? 0 : (rp - 0.3) / 0.7;

  const bladeOpacity = cp ?? 0;
  const bladeDx = 30 * (1 - (cp ?? 0));

  const gap = (tp ?? 0) * MAX_GAP;

  return (
    <svg
      viewBox={`0 0 ${PAPER_EDGE_VB_W} ${PAPER_EDGE_VB_H}`}
      width={width} height={(width * PAPER_EDGE_VB_H) / PAPER_EDGE_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* --------- s3: 종이 블록 (톱니 단면) --------- */}
      {rp !== undefined ? (
        <g opacity={blockOpacity}>
          <path
            d={`${pathFromPts([[PAPER_X0, PAPER_Y1], [PAPER_X0, PAPER_Y0], ...PAPER_EDGE_PTS])} Z`}
            fill={fill} stroke={stroke} strokeWidth={SW}
          />
          {/* 톱니 단면선 강조(코랄) - dashoffset 으로 그려지는 것처럼 */}
          <path
            d={pathFromPts(PAPER_EDGE_PTS)}
            fill="none" stroke={accent} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - edgeDraw}
          />
        </g>
      ) : null}

      {/* --------- s3: 칼날 블록 (매끈한 단면) --------- */}
      {cp !== undefined ? (
        <g opacity={bladeOpacity} transform={`translate(${bladeDx} 0)`}>
          <path
            d={`M ${BLADE_X0} ${BLADE_Y1} L ${BLADE_X0} ${BLADE_Y0} L ${BLADE_EDGE_X} ${BLADE_Y0} L ${BLADE_EDGE_X} ${BLADE_Y1} Z`}
            fill={fill} stroke={stroke} strokeWidth={SW}
          />
          <line
            x1={BLADE_EDGE_X} y1={BLADE_Y0} x2={BLADE_EDGE_X} y2={BLADE_Y1}
            stroke={accent} strokeWidth={SW_THIN} strokeLinecap="round"
          />
        </g>
      ) : null}

      {/* --------- s4: 피부 단면이 톱니선을 따라 벌어진다 --------- */}
      {tp !== undefined ? (
        <g>
          {/* 위쪽 살 - 톱니선이 아래 경계, gap 만큼 위로 이동 */}
          <path
            transform={`translate(0 ${-gap})`}
            d={`${pathFromPts([[TEAR_X0, SKIN_TOP], [TEAR_X1, SKIN_TOP], ...[...TEAR_PTS].reverse()])} Z`}
            fill={fill} stroke={stroke} strokeWidth={SW}
          />
          {/* 아래쪽 살 - 톱니선이 위 경계, gap 만큼 아래로 이동 */}
          <path
            transform={`translate(0 ${gap})`}
            d={`${pathFromPts([...TEAR_PTS, [TEAR_X1, SKIN_BOTTOM], [TEAR_X0, SKIN_BOTTOM]])} Z`}
            fill={fill} stroke={stroke} strokeWidth={SW}
          />
          {/* 벌어진 틈(살짝) 안쪽에 옅은 그림자만 - 붉은 색 없이 톤만 살짝 어둡게 */}
          {gap > 1 ? (
            <path
              d={pathFromPts(TEAR_PTS)} fill="none" stroke={C.inkSoft} strokeWidth={2}
              opacity={Math.min(1, gap / MAX_GAP)}
            />
          ) : null}
        </g>
      ) : null}
    </svg>
  );
};

export default PaperEdgeDiagram;
