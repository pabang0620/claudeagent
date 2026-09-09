/** "지금 겪는 일이 예전 기억과 살짝 닮아 보인다"는 이중노출 프레임(overlapProgress)과
 *  "뇌 좌우가 같은 정보를 아주 살짝 다른 타이밍에 처리한다"는 신호 시간차(processProgress)
 *  두 시각 언어를 하나로 묶은 소품(general-ep45, "처음 온 곳인데 와본 것 같은 이유" - 데자뷔의
 *  두 유력 가설).
 *
 *  "신체 표현은 최소한으로, 반복되는 작은 요소는 쓰지 않는다" 원칙에 따라 뇌를 해부도로
 *  그리지 않는다 - 굵은 선으로 둥근 사각형을 세로로 반 가르기만 한 추상 형태다. 장면(scene)도
 *  실제 골목·풍경을 그리지 않고 "장소"를 뜻하는 아이콘(map-pin) 하나를 담은 액자 프레임으로
 *  추상화했다(HeadNerveDiagram·SneezeReflexDiagram과 같은 원칙 - 새 신체 형태를 지어내지
 *  않는다).
 *
 *  두 모드는 서로 다른 progress prop으로 독립 제어된다 - 값이 없으면 그 레이어를 그리지
 *  않는다(MilkCurdleDiagram·SneezeReflexDiagram과 같은 원칙).
 *
 *  `overlapProgress`(0~1, s4): "지금" 액자(실선, 진하게, 화면 중앙)와 "예전 기억" 액자(점선,
 *  흐리게, 왼쪽 위로 어긋난 채) 두 개가 점점 가까이 겹쳐 보이지만 완전히 포개지지는 않는다
 *  (기억이 정확히 일치하진 않지만 닮았다는 뜻). 절반을 넘는 시점부터 두 중심을 잇는 점선
 *  비교선이 그려진다.
 *
 *  `processProgress`(0~1, s5): 위쪽 지각 신호점 하나가 좌/우로 반 나뉜 사각형(뇌를 추상화한
 *  형태)의 왼쪽에는 먼저, 오른쪽에는 아주 살짝 늦게 도착한다(내부 고정 지연 `HEMI_LAG`).
 *  오른쪽이 늦게 도착한 직후에만 오른쪽 신호점 옆에 옅은 잔상 점 하나가 맥동해 "한 번 더
 *  겪은 듯한" 인상을 준다(작은 점을 여러 개 뿌리지 않고 딱 하나만 쓴다).
 *
 *  "두 개의 비슷한 패턴이 완전히 일치하지 않은 채 겹쳐 보이거나, 같은 신호가 아주 살짝 다른
 *  타이밍으로 두 목적지에 도착한다"는 구조를 갖는 다른 착각·기억 소재 전반 재사용 가능성이
 *  있어 에피소드 로컬이 아니라 여기 등록한다(02-script-v1.md 자산 목록).
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

export const MEMORY_VB_W = 760;
export const MEMORY_VB_H = 760;

/* ---- overlap(s4) 레이아웃 ---- */
const FRAME_W = 380;
const FRAME_H = 260;
const FRAME_RX = 24;
const NOW_CX = MEMORY_VB_W / 2;
const NOW_CY = 420;

/* ---- process(s5) 레이아웃 ---- */
const BRAIN_W = 440;
const BRAIN_H = 300;
const BRAIN_CX = MEMORY_VB_W / 2;
const BRAIN_CY = 460;
const BRAIN_RX = 70;
const SIGNAL_SRC = { x: BRAIN_CX, y: BRAIN_CY - BRAIN_H / 2 - 90 };
const HEMI_L = { x: BRAIN_CX - 110, y: BRAIN_CY };
const HEMI_R = { x: BRAIN_CX + 110, y: BRAIN_CY };
/** 오른쪽이 왼쪽보다 이만큼 늦게 도착(processProgress 기준 고정값) */
const HEMI_LAG = 0.18;
const HEMI_TRAVEL = 0.62;

function quadPoint(
  p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, t: number,
) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function bowedPath(from: { x: number; y: number }, to: { x: number; y: number }, bow: number) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const ctrl = { x: mx + nx * bow, y: my + ny * bow };
  return { ctrl, d: `M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}` };
}

export interface MemoryOverlapDiagramProps {
  /** 씬 로컬 프레임. s5(processProgress) 도착 직후 잔상 맥동에만 쓴다 */
  f?: number;
  /** 화면상 한 변 크기(px). viewBox가 정사각형이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** s4: 이중노출 액자 두 개가 겹쳐 보이는 진행도 0~1. 생략하면 그리지 않음 */
  overlapProgress?: number;
  /** s5: 좌/우 반구 신호 도착 시간차 진행도 0~1. 생략하면 그리지 않음 */
  processProgress?: number;
  stroke?: string;
  fill?: string;
  /** "예전 기억" 액자 / 오른쪽(지연) 신호에 쓰는 강조색 */
  accentColor?: string;
  style?: React.CSSProperties;
}

export const MemoryOverlapDiagram: React.FC<MemoryOverlapDiagramProps> = ({
  f = 0, width, x = 0, y = 0, overlapProgress, processProgress,
  stroke = C.ink, fill = C.paper, accentColor = C.coral, style,
}) => {
  const oP = overlapProgress === undefined ? null : clamp01(overlapProgress);
  const pP = processProgress === undefined ? null : clamp01(processProgress);

  // --- overlap(s4) 계산 ---
  const thenOffset = oP === null ? 0 : lerp(64, 20, oP);
  const thenCx = NOW_CX - thenOffset;
  const thenCy = NOW_CY - thenOffset;
  const thenAlpha = oP === null ? 0 : clamp01(oP / 0.3) * 0.55;
  const linkP = oP === null ? 0 : clamp01((oP - 0.35) / 0.5);

  // --- process(s5) 계산 ---
  const leftT = pP === null ? 0 : clamp01(pP / HEMI_TRAVEL);
  const rightT = pP === null ? 0 : clamp01((pP - HEMI_LAG) / HEMI_TRAVEL);
  const leftPath = bowedPath(SIGNAL_SRC, HEMI_L, -60);
  const rightPath = bowedPath(SIGNAL_SRC, HEMI_R, 60);
  const leftPos = leftT > 0.001 ? quadPoint(SIGNAL_SRC, leftPath.ctrl, HEMI_L, leftT) : null;
  const rightPos = rightT > 0.001 ? quadPoint(SIGNAL_SRC, rightPath.ctrl, HEMI_R, rightT) : null;
  const echoRaise = pP === null ? 0 : clamp01((pP - (HEMI_LAG + HEMI_TRAVEL)) / 0.16);
  const echoPulse = 0.6 + 0.4 * Math.sin(f / 8);
  const echoP = echoRaise * echoPulse;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${MEMORY_VB_W} ${MEMORY_VB_H}`} width={width} height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* ---- s4: 이중노출 액자 ---- */}
        {oP !== null ? (
          <>
            {thenAlpha > 0.001 ? (
              <g opacity={thenAlpha}>
                <rect
                  x={thenCx - FRAME_W / 2} y={thenCy - FRAME_H / 2} width={FRAME_W} height={FRAME_H}
                  rx={FRAME_RX} fill={fill} stroke={C.inkSoft} strokeWidth={9} strokeDasharray="18 14"
                />
                <g transform={`translate(${thenCx - 60} ${thenCy - 60})`}>
                  <ThemedIcon name="map-pin" size={120} color={C.inkSoft} strokePx={11} />
                </g>
              </g>
            ) : null}

            {linkP > 0.001 ? (
              <path
                d={`M ${thenCx} ${thenCy} L ${NOW_CX} ${NOW_CY}`}
                fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round"
                strokeDasharray="4 16" pathLength={1} strokeDashoffset={1 - linkP} opacity={0.85}
              />
            ) : null}

            <rect
              x={NOW_CX - FRAME_W / 2} y={NOW_CY - FRAME_H / 2} width={FRAME_W} height={FRAME_H}
              rx={FRAME_RX} fill={fill} stroke={stroke} strokeWidth={13}
            />
            <g transform={`translate(${NOW_CX - 60} ${NOW_CY - 60})`}>
              <ThemedIcon name="map-pin" size={120} color={stroke} strokePx={13} />
            </g>
          </>
        ) : null}

        {/* ---- s5: 좌우 반구 시간차 ---- */}
        {pP !== null ? (
          <>
            <rect
              x={BRAIN_CX - BRAIN_W / 2} y={BRAIN_CY - BRAIN_H / 2} width={BRAIN_W} height={BRAIN_H}
              rx={BRAIN_RX} fill={fill} stroke={stroke} strokeWidth={13}
            />
            <line
              x1={BRAIN_CX} y1={BRAIN_CY - BRAIN_H / 2} x2={BRAIN_CX} y2={BRAIN_CY + BRAIN_H / 2}
              stroke={stroke} strokeWidth={9}
            />
            <circle cx={SIGNAL_SRC.x} cy={SIGNAL_SRC.y} r={22} fill={C.gold} stroke={stroke} strokeWidth={7} />

            {leftT > 0.001 ? (
              <path
                d={leftPath.d} fill="none" stroke={C.waterCool} strokeWidth={10} strokeLinecap="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - leftT}
              />
            ) : null}
            {rightT > 0.001 ? (
              <path
                d={rightPath.d} fill="none" stroke={accentColor} strokeWidth={10} strokeLinecap="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rightT}
              />
            ) : null}
            {leftPos ? (
              <circle cx={leftPos.x} cy={leftPos.y} r={18} fill={C.waterCool} stroke={stroke} strokeWidth={5} />
            ) : null}
            {rightPos ? (
              <circle cx={rightPos.x} cy={rightPos.y} r={18} fill={accentColor} stroke={stroke} strokeWidth={5} />
            ) : null}

            {echoP > 0.02 ? (
              <circle
                cx={HEMI_R.x + 24} cy={HEMI_R.y - 20} r={16} fill={accentColor} opacity={echoP * 0.65}
              />
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default MemoryOverlapDiagram;
