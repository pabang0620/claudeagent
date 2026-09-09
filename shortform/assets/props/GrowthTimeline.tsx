/** "나이가 들며 몸/능력이 단계적으로 커진다"를 보여주는 3단 성장 타임라인.
 *  general-ep21("남이 하품하면 나도 옮는 이유")의 s7(아기->어린이, 공감 능력 발달)에서 처음 쓴다.
 *
 *  HiccupDiagram·GoosebumpDiagram과 같은 원칙(신체를 정교하게 그리지 않고, 순수 실루엣 도형만
 *  씀 - 원칙 "신체 표현은 최소한으로": 머리는 원, 몸은 캡슐형 타원 하나로 단순화하고 팔다리·
 *  얼굴 디테일은 그리지 않는다). 3단계(작은 머리 비율 큰 아기 -> 중간 -> 머리 비율이 작아지고
 *  키가 커지는 아이)를 화면 가로로 늘어놓고, 그 사이를 점선 화살표로 잇는다.
 *
 *  `revealProgress`(0~1) 하나로 3단계가 순서대로 팝인하고 화살표가 함께 자란다 - 호출부가
 *  단계별로 값을 따로 계산할 필요가 없다. 마지막 단계(아이)에만 `empathyGlow`(0~1)로 은은한
 *  발광 원을 덧대 "공감하는 마음이 자란다"는 결론을 시각적으로 강조할 수 있다.
 *
 *  "나이/발달 단계에 따라 실루엣이 커진다" 구조를 갖는 다른 소재(성장, 발달 단계 비교 등)
 *  전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const GROWTH_VB_W = 900;
export const GROWTH_VB_H = 420;
const BASELINE_Y = 380;

/** 단계별 형태 (머리 반지름, 몸통 반폭/반높이, x 위치) - 나이가 들수록 머리 비율은 작아지고
 *  키(몸통 ry)는 커진다 */
const STAGES = [
  { x: 150, headR: 44, bodyRx: 32, bodyRy: 42 }, // 아기
  { x: 450, headR: 52, bodyRx: 38, bodyRy: 76 }, // 유아
  { x: 750, headR: 56, bodyRx: 44, bodyRy: 116 }, // 어린이
];

/** 단계 하나가 등장하기 시작/끝나는 revealProgress 구간 (겹치지 않게 3등분) */
function stageWindow(i: number): [number, number] {
  const span = 1 / STAGES.length;
  return [i * span, i * span + span * 0.85];
}

export interface GrowthTimelineProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 3단계 + 화살표가 순서대로 팝인 */
  revealProgress?: number;
  /** 0~1. 마지막(가장 큰) 단계 둘레에 은은한 발광 원 - "공감 능력이 자란다"는 결론 강조용 */
  empathyGlow?: number;
  stroke?: string;
  fill?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const GrowthTimeline: React.FC<GrowthTimelineProps> = ({
  width, x = 0, y = 0, revealProgress = 1, empathyGlow = 0,
  stroke = C.ink, fill = C.inkSoft, accent = C.coral, style,
}) => {
  const height = (width * GROWTH_VB_H) / GROWTH_VB_W;
  const r = clamp01(revealProgress);
  const glow = clamp01(empathyGlow);

  // 화살표(점선)는 첫 단계가 다 나타난 뒤부터 마지막 단계가 나타나기 직전까지 자란다
  const arrowP = clamp01((r - 0.18) / 0.68);
  const arrowX2 = STAGES[0].x + (STAGES[2].x - STAGES[0].x) * arrowP;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${GROWTH_VB_W} ${GROWTH_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
        shapeRendering="geometricPrecision"
      >
        {/* 바닥선 */}
        <line x1={60} y1={BASELINE_Y} x2={840} y2={BASELINE_Y} stroke={stroke} strokeWidth={6} opacity={0.35} />

        {/* 성장 화살표 (점선) */}
        <line
          x1={STAGES[0].x} y1={BASELINE_Y + 34} x2={arrowX2} y2={BASELINE_Y + 34}
          stroke={accent} strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round"
        />
        {arrowP > 0.05 ? (
          <path
            d={`M ${arrowX2 - 18} ${BASELINE_Y + 22} L ${arrowX2} ${BASELINE_Y + 34} L ${arrowX2 - 18} ${BASELINE_Y + 46}`}
            fill="none" stroke={accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
            opacity={arrowP}
          />
        ) : null}

        {STAGES.map((s, i) => {
          const [a, b] = stageWindow(i);
          const p = clamp01((r - a) / Math.max(1e-6, b - a));
          if (p <= 0.001) return null;
          const scale = 0.4 + 0.6 * p;
          const bodyTop = BASELINE_Y - s.bodyRy * 2;
          const headCy = bodyTop - s.headR * 0.7;
          const isLast = i === STAGES.length - 1;
          return (
            <g
              key={i}
              opacity={Math.min(1, p / 0.6)}
              transform={`translate(${s.x} ${BASELINE_Y}) scale(${scale}) translate(${-s.x} ${-BASELINE_Y})`}
            >
              {isLast && glow > 0.01 ? (
                <circle
                  cx={s.x} cy={headCy - s.headR * 0.3} r={s.headR + s.bodyRy * 0.55}
                  fill={accent} opacity={glow * 0.22}
                />
              ) : null}
              {/* 몸통 (캡슐형 - 팔다리·디테일 없음) */}
              <rect
                x={s.x - s.bodyRx} y={bodyTop} width={s.bodyRx * 2} height={s.bodyRy * 2}
                rx={s.bodyRx} fill={fill} stroke={stroke} strokeWidth={SW * 0.8}
              />
              {/* 머리 */}
              <circle cx={s.x} cy={headCy} r={s.headR} fill={fill} stroke={stroke} strokeWidth={SW * 0.8} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GrowthTimeline;
