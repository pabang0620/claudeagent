/** "손길이 예상 가능한지에 따라 반응(스파크) 크기가 달라진다" 는 구조를 보여주는 범용
 *  다이어그램. general-ep10("내가 나를 못 간지럽히는 이유")에서 처음 필요해 만들었다 -
 *  예측·반응을 다루는 다른 화(감각 적응, 놀람 반사 등)에서도 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 props/ 에 등록한다.
 *
 *  HeadNerveDiagram·LegNerveDiagram 과 같은 원칙: 새 신체를 정교하게 그리지 않고, 옆구리
 *  실루엣 위에 접근하는 손(또는 로봇 팔)과 예측 신호만 오버레이한다.
 *
 *  mode='unpredictable' - 손이 지그재그 경로로 접근(예측 불가) -> 접촉 시 큰 스파크.
 *  mode='predicted'     - 손(또는 로봇 팔)이 직선 경로로 접근 + 뇌 아이콘에서 점선 화살표가
 *                          손보다 먼저 도착(예측 신호) -> 접촉 시 작은 스파크.
 *  agent='robot' + delayProgress - 예측 가능한 직선 경로라도 접촉 직전 짧게 멈칫하는
 *  시간차가 있으면(delayProgress 로 표시) 예측이 깨져 스파크가 다시 커진다(호출 씬이
 *  sparkSize 를 다시 키워 넘긴다).
 *
 *  전부 touchProgress/predictArrowProgress/delayProgress(0~1) 로만 움직이는 순수 함수다 -
 *  frame 을 직접 받지 않는다(Math.random 없음, 원칙 3).
 */
import React from 'react';
import { C, SW } from '../theme';
import { ThemedIcon } from './ThemedIcon';

export interface TouchPredictionDiagramProps {
  mode: 'unpredictable' | 'predicted';
  /** 접근하는 손(또는 로봇 팔)의 진행도 0~1. 1이면 접촉 지점에 도달 */
  touchProgress: number;
  /** 접촉 스파크 크기 0~1. 생략(0)이면 스파크를 안 그린다 */
  sparkSize?: number;
  /** 뇌 -> 접촉 지점 점선 화살표 진행도 0~1. mode='predicted' 일 때만 그린다 */
  predictArrowProgress?: number;
  /** 접근 주체 아이콘. 기본 'hand' */
  agent?: 'hand' | 'robot';
  /** 접촉 직전 멈칫하는 "시간차" 표시 진행도 0~1. 생략(0)이면 표시 안 함 */
  delayProgress?: number;
  width: number;
  x?: number;
  y?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

const VB_W = 600;
const VB_H = 520;

type Pt = { x: number; y: number };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/* 몸통(옆구리) 실루엣 - 좌측 가장자리가 접촉면 */
const TORSO_X = 380;
const TORSO_Y = 40;
const TORSO_W = 200;
const TORSO_H = 440;

const TOUCH: Pt = { x: 390, y: 260 };
const START: Pt = { x: -110, y: 260 };
const DELAY_T = 0.55;

const BRAIN_POS: Pt = { x: 40, y: 40 };
const BRAIN_ICON_SIZE = 104;
const ARROW_START: Pt = { x: 148, y: 132 };

const ZIGZAG_CYCLES = 3;
const ZIGZAG_AMP = 52;

const ICON_SIZE = 120;

/** SPARKS: 접촉 지점에서 방사형으로 뻗는 광선. 고정 각도 배열 - Math.random 미사용 */
const SPARK_RAY_COUNT = 8;
const SPARK_ANGLES = Array.from({ length: SPARK_RAY_COUNT }, (_, i) => (i / SPARK_RAY_COUNT) * Math.PI * 2);

function agentPos(t: number, mode: 'unpredictable' | 'predicted'): Pt {
  const base = lerpPt(START, TOUCH, t);
  if (mode === 'unpredictable') {
    const perp = ZIGZAG_AMP * Math.sin(t * ZIGZAG_CYCLES * Math.PI * 2);
    return { x: base.x, y: base.y + perp };
  }
  return base;
}

export const TouchPredictionDiagram: React.FC<TouchPredictionDiagramProps> = ({
  mode, touchProgress, sparkSize = 0, predictArrowProgress = 0, agent = 'hand',
  delayProgress = 0, width, x = 0, y = 0, stroke = C.ink, fill = C.paper, style,
}) => {
  const tp = clamp01(touchProgress);
  const spark = clamp01(sparkSize);
  const arrowP = clamp01(predictArrowProgress);
  const delayP = clamp01(delayProgress);
  const height = width * (VB_H / VB_W);

  const pos = agentPos(tp, mode);

  const arrowDx = TOUCH.x - ARROW_START.x;
  const arrowDy = TOUCH.y - ARROW_START.y;
  const arrowAngleDeg = (Math.atan2(arrowDy, arrowDx) * 180) / Math.PI;
  const arrowHeadSize = 20;

  const delayPos = lerpPt(START, TOUCH, DELAY_T);
  const pathDx = TOUCH.x - START.x;
  const pathDy = TOUCH.y - START.y;
  const pathLen = Math.max(1e-6, Math.hypot(pathDx, pathDy));
  const perpX = (-pathDy / pathLen) * 24;
  const perpY = (pathDx / pathLen) * 24;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 몸통(옆구리) 실루엣 */}
        <rect
          x={TORSO_X} y={TORSO_Y} width={TORSO_W} height={TORSO_H} rx={TORSO_W / 2}
          fill={fill} stroke={stroke} strokeWidth={SW}
        />

        {/* 예측 신호: 뇌 -> 접촉 지점 점선 화살표 (predicted 전용) */}
        {mode === 'predicted' && arrowP > 0.02 ? (
          <>
            <g transform={`translate(${BRAIN_POS.x} ${BRAIN_POS.y})`} opacity={clamp01(arrowP * 3)}>
              <circle
                cx={BRAIN_ICON_SIZE / 2} cy={BRAIN_ICON_SIZE / 2} r={BRAIN_ICON_SIZE / 2 + 16}
                fill={C.goldSoft}
              />
              <ThemedIcon name="brain" size={BRAIN_ICON_SIZE} color={stroke} strokePx={11} />
            </g>
            <path
              d={`M ${ARROW_START.x} ${ARROW_START.y} L ${TOUCH.x} ${TOUCH.y}`}
              fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round"
              strokeDasharray="4 22" pathLength={1} strokeDashoffset={1 - arrowP}
            />
            {arrowP > 0.9 ? (
              <polygon
                transform={`translate(${TOUCH.x} ${TOUCH.y}) rotate(${arrowAngleDeg})`}
                points={`0,0 ${-arrowHeadSize},${arrowHeadSize * 0.55} ${-arrowHeadSize},${-arrowHeadSize * 0.55}`}
                fill={C.gold}
                opacity={clamp01((arrowP - 0.9) / 0.1)}
              />
            ) : null}
          </>
        ) : null}

        {/* 시간차(지연) 표시: 접근 도중 잠깐 멈칫하는 지점 마커 */}
        {delayP > 0.02 ? (
          <g opacity={delayP}>
            <line
              x1={delayPos.x - perpX} y1={delayPos.y - perpY}
              x2={delayPos.x + perpX} y2={delayPos.y + perpY}
              stroke={C.coral} strokeWidth={7} strokeLinecap="round"
            />
            <g transform={`translate(${delayPos.x - 27} ${delayPos.y - 96})`}>
              <ThemedIcon name="clock" size={54} color={C.coral} strokePx={9} />
            </g>
          </g>
        ) : null}

        {/* 접근하는 손 / 로봇 팔 */}
        {tp > 0.01 ? (
          <g transform={`translate(${pos.x - ICON_SIZE / 2} ${pos.y - ICON_SIZE / 2})`}>
            <ThemedIcon name={agent === 'robot' ? 'robot' : 'hand-finger'} size={ICON_SIZE} color={stroke} strokePx={SW} />
          </g>
        ) : null}

        {/* 접촉 스파크 */}
        {spark > 0.02 ? (
          <g opacity={spark}>
            <circle cx={TOUCH.x} cy={TOUCH.y} r={12 + 34 * spark} fill={C.gold} stroke={stroke} strokeWidth={5} />
            {SPARK_ANGLES.map((a, i) => {
              const rInner = 18 + 20 * spark;
              const rOuter = rInner + 26 + 60 * spark;
              const x1 = TOUCH.x + Math.cos(a) * rInner;
              const y1 = TOUCH.y + Math.sin(a) * rInner;
              const x2 = TOUCH.x + Math.cos(a) * rOuter;
              const y2 = TOUCH.y + Math.sin(a) * rOuter;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.coral} strokeWidth={7} strokeLinecap="round" />
              );
            })}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default TouchPredictionDiagram;
