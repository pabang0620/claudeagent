/** "출발점(둥지)에서 도착점(먹이)까지 이어지는 여러 갈래 길 위에, 얼마나 오갔는지에 따라
 *  냄새(페로몬) 자국이 진해지거나 옅어진다"는 구조를 보여주는 범용 다이어그램(개미가 한 줄로
 *  다니는 이유). 25화 ScentWaves는 "한 지점에서 사방으로 퍼지는" 확산을 호(arc)로 표현하는
 *  용도라, 이 화처럼 "바닥에 남아 길게 이어지는 자국"이라는 다른 개념에는 맞지 않아 새로
 *  만들었다(오케스트레이터 지시 - 호로 뿌리지 말고 바닥에 남는 자국 형태로).
 *
 *  경로는 둥지(NEST)에서 먹이(FOOD)까지 이어지는 3개의 프리셋 곡선(왼쪽으로 휘는 길 / 가운데
 *  길 / 오른쪽으로 휘는 길)만 미리 정의해뒀다("여러 갈래 길"을 2~3개로 단순화하라는 지시를
 *  그대로 구현 - 복잡한 미로를 그리지 않는다). `paths`(경로별 상태 배열, 길이 2 또는 3)의
 *  각 원소가 `strength`(0~1, 냄새 진하기 - 값이 커질수록 자국이 굵고 진하고 점선 간격이
 *  촘촘해진다)와 `from`/`to`(0~1, 경로 중 이 구간만 그린다 - 개미가 걸어간 만큼만 자국이
 *  자라나는 것을 표현할 때 쓴다. 기본은 전체 구간)를 받는다. strength가 0에 가까우면 그
 *  경로는 아예 그리지 않아 "냄새가 옅어지다 사라진다"를 표현한다.
 *
 *  `pheromonePointAt(pathIndex, t)`로 경로 위 임의 지점의 좌표+진행방향(atan2 규약)을
 *  반환해, 호출 씬이 그 위를 걷는 Ant를 정확히 얹을 수 있다(GutTubeDiagram의 gutPointAt과
 *  동일 패턴).
 *
 *  "여러 후보 경로 중 많이 쓰인 것만 강화되고 나머지는 옅어져 사라지는" 구조를 갖는 다른
 *  소재(길찾기, 습관 형성 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW_THIN } from '../theme';

export const PHEROMONE_VB_W = 700;
export const PHEROMONE_VB_H = 1000;

interface Pt { x: number; y: number }

export const PHEROMONE_NEST_PT: Pt = { x: 350, y: 90 };
export const PHEROMONE_FOOD_PT: Pt = { x: 350, y: 910 };

/** 3개 프리셋 곡선(왼쪽 / 가운데 / 오른쪽) - 전부 둥지에서 먹이까지 이어지는 단일 3차 베지어 */
const PRESETS: [Pt, Pt, Pt, Pt][] = [
  [PHEROMONE_NEST_PT, { x: 120, y: 340 }, { x: 110, y: 650 }, PHEROMONE_FOOD_PT],
  [PHEROMONE_NEST_PT, { x: 350, y: 340 }, { x: 350, y: 650 }, PHEROMONE_FOOD_PT],
  [PHEROMONE_NEST_PT, { x: 580, y: 340 }, { x: 590, y: 650 }, PHEROMONE_FOOD_PT],
];

function cubicPoint(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

function cubicTangent(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  return {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

/** presetIndex(0~2) 곡선 위 t(0~1) 지점의 좌표 + 진행 방향(도, atan2 규약)을 viewBox 좌표계로 */
export function pheromonePointAt(presetIndex: number, t: number): { x: number; y: number; angle: number } {
  const idx = Math.max(0, Math.min(PRESETS.length - 1, presetIndex));
  const tt = clamp01(t);
  const [p0, p1, p2, p3] = PRESETS[idx];
  const p = cubicPoint(tt, p0, p1, p2, p3);
  const d = cubicTangent(tt, p0, p1, p2, p3);
  return { x: p.x, y: p.y, angle: (Math.atan2(d.y, d.x) * 180) / Math.PI };
}

export interface PheromonePathState {
  /** 0~1. 냄새 진하기 - 굵기·불투명도·점선 밀도를 함께 결정한다. 0에 가까우면 안 그린다 */
  strength: number;
  /** 0~1. 경로 중 이 지점부터 그린다(기본 0 = 둥지부터) */
  from?: number;
  /** 0~1. 경로 중 이 지점까지 그린다(기본 1 = 먹이까지) */
  to?: number;
}

export interface PheromoneTrailDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 경로별 상태(길이 2 또는 3). 2개면 왼쪽·오른쪽 프리셋을 쓴다(가장 갈림이 또렷하다) */
  paths: PheromonePathState[];
  showNest?: boolean;
  showFood?: boolean;
  stroke?: string;
  trailColor?: string;
  nestColor?: string;
  foodColor?: string;
  style?: React.CSSProperties;
}

export const PheromoneTrailDiagram: React.FC<PheromoneTrailDiagramProps> = ({
  width, x, y, paths, showNest = true, showFood = true,
  stroke = C.ink, trailColor = C.coral, nestColor = C.browning, foodColor = C.gold, style,
}) => {
  const scale = width / PHEROMONE_VB_W;
  const height = PHEROMONE_VB_H * scale;
  const order = paths.length <= 2 ? [0, 2] : [0, 1, 2];

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
      <svg viewBox={`0 0 ${PHEROMONE_VB_W} ${PHEROMONE_VB_H}`} width="100%" height="100%" shapeRendering="geometricPrecision">
        {paths.map((state, i) => {
          const strength = clamp01(state.strength);
          if (strength <= 0.02) return null;
          const from = clamp01(state.from ?? 0);
          const to = clamp01(state.to ?? 1);
          if (to <= from) return null;
          const preset = PRESETS[order[i] ?? i];
          const segs = 26;
          let d = '';
          for (let s = 0; s <= segs; s++) {
            const t = from + (to - from) * (s / segs);
            const p = cubicPoint(t, preset[0], preset[1], preset[2], preset[3]);
            d += `${s === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
          }
          const strokeWidth = 5 + 20 * strength;
          const dash = 16;
          const gap = 6 + 46 * (1 - strength);
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={trailColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              opacity={0.1 + 0.85 * strength}
            />
          );
        })}
        {showNest ? (
          <g transform={`translate(${PHEROMONE_NEST_PT.x} ${PHEROMONE_NEST_PT.y})`}>
            <path d="M -46 20 Q 0 -46 46 20 Z" fill={nestColor} stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round" />
            <ellipse cx={-14} cy={20} rx={9} ry={5} fill={stroke} />
            <ellipse cx={16} cy={20} rx={9} ry={5} fill={stroke} />
          </g>
        ) : null}
        {showFood ? (
          <g transform={`translate(${PHEROMONE_FOOD_PT.x} ${PHEROMONE_FOOD_PT.y})`}>
            <circle cx={-14} cy={0} r={26} fill={foodColor} stroke={stroke} strokeWidth={SW_THIN} />
            <circle cx={20} cy={12} r={17} fill={foodColor} stroke={stroke} strokeWidth={SW_THIN} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default PheromoneTrailDiagram;
