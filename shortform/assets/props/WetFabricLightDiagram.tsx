/** "마른 섬유는 사이사이가 비어(공기) 있어서 빛이 표면에서 바로 사방으로 흩어져 나가지만,
 *  물이 그 빈틈을 채우면 빛이 겉에서 못 튕겨나가고 안으로 더 들어가 이리저리 튕기다가
 *  색소에 흡수되는 양이 늘어난다"는 인과를 보여주는 섬유 단면 다이어그램
 *  (옷이 물에 젖으면 색이 진해지는 이유, general-ep76).
 *
 *  HeatBlanketDiagram·FogLayerDiagram과 같은 설계 원칙(독립 레이어, undefined면 그
 *  레이어는 그리지 않는다)을 계승했다. 섬유 표면을 사실적으로 그리지 않고(오케스트레이터
 *  지시) "확대한 단면을 단순한 굴곡선으로 표현"한다 - 촘촘한 실 가닥이나 점 텍스처 대신
 *  물결치는 두꺼운 곡선 3가닥(fiber bundle)만으로 섬유 단면을 나타낸다. 물이 스며드는
 *  것은 큰 물방울 텍스처가 아니라 각 틈(gap)에 차오르는 파란 면 + 물결선으로 표현한다
 *  (지시사항의 "큰 물방울이나 물결선" 중 물결선 방식 채택 - 점 텍스처를 쓰지 않는다는
 *  채널 원칙과도 맞다). 빛은 LightScatterDiagram과 동일한 화살(선+화살촉) 어휘로 그린다 -
 *  점을 뿌리지 않는다.
 *
 *  독립 레이어(전부 undefined면 섬유 단면 실루엣만 있는 정지 배경이 된다):
 *   - wetProgress     : 0~1. 섬유 사이 두 틈(gap)이 위 틈부터 살짝 시차를 두고 아래에서
 *     위로 파랗게 차오른다("물이 그 빈틈을 채운다"). 각 틈의 물 표면에 잔물결선을 그려
 *     "물결선" 표현 지시를 만족한다.
 *   - scatterProgress : 0~1. 맨 위 섬유 굴곡선 위 세 지점에서 빛 화살이 사방(위쪽 부채꼴)
 *     으로 튀어나간다("마른 표면은 빛을 바로 흩어 보낸다"). 위에서 내려오는 입사광 한
 *     가닥도 함께 그려 "빛이 표면에 닿는다"는 맥락을 준다.
 *   - absorbProgress  : 0~1. scatterProgress와 같은 입사 지점에서 시작해, 빛이 표면에서
 *     못 튕겨나가고 안으로 꺾여 들어가 두 틈을 오가며 4번 꺾이는(지그재그) 경로를 그린다.
 *     구간이 깊어질수록 화살 불투명도가 낮아지고(에너지 손실), 마지막 지점에서
 *     `pigmentColor` 점이 나타나 "색소에 흡수됨"을 표시한다. 낮은 값(예: 0~0.3)만 써서
 *     "안으로 꺾여 들어가는 첫 구간"만 보여주는 것도 가능하다(전환 장면용).
 *
 *  Math.random 미사용 - 전부 progress(0~1)만 받는 순수 함수라 결정적이다(원칙 3).
 *  "빛이 매질 표면/내부에서 반사되거나 흡수된다"는 구조를 갖는 다른 소재(젖은 도로,
 *  젖은 나무껍질, 종이 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React from 'react';
import { C, SW } from '../theme';

export const WETFABRIC_VB_W = 900;
export const WETFABRIC_VB_H = 680;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

interface Fiber { y: number; amp: number; phase: number }
const FIBERS: Fiber[] = [
  { y: 190, amp: 24, phase: 0.4 },
  { y: 380, amp: 20, phase: 2.0 },
  { y: 570, amp: 26, phase: 3.6 },
];

/** gap[0] = fiber0~fiber1 사이, gap[1] = fiber1~fiber2 사이 */
const GAPS = [
  { top: 220, bottom: 355 },
  { top: 405, bottom: 540 },
];

function waveY(f: Fiber, xFrac: number) {
  return f.y + Math.sin(xFrac * Math.PI * 3 + f.phase) * f.amp;
}

function wavePathD(f: Fiber, w: number, samples = 28) {
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const xFrac = i / samples;
    const x = w * xFrac;
    const y = waveY(f, xFrac);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

function ripplePathD(atY: number, w: number, amp: number, phase: number, samples = 20) {
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const xFrac = i / samples;
    const x = w * xFrac;
    const y = atY + Math.sin(xFrac * Math.PI * 4 + phase) * amp;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** 화살(선 + 화살촉 삼각형) 하나. LightScatterDiagram.Arrow와 동일 레시피(지역성 우선,
 *  원칙 - 공용 유틸로 억지로 뽑지 않는다) */
function Arrow({
  x1, y1, x2, y2, reveal, color, strokeWidth = 8, opacity = 1,
}: {
  x1: number; y1: number; x2: number; y2: number; reveal: number; color: string;
  strokeWidth?: number; opacity?: number;
}) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const tipX = x1 + dx * r;
  const tipY = y1 + dy * r;
  const len = Math.hypot(dx, dy) * r;
  const headLen = Math.min(18, len * 0.4);
  const ux = len > 0 ? (dx * r) / len : 0;
  const uy = len > 0 ? (dy * r) / len : 0;
  const backX = tipX - ux * headLen;
  const backY = tipY - uy * headLen;
  const perpX = -uy;
  const perpY = ux;
  const headW = headLen * 0.62;
  return (
    <g opacity={Math.min(1, r * 4) * opacity}>
      <line x1={x1} y1={y1} x2={backX} y2={backY} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {len > headLen ? (
        <path
          d={`M ${tipX.toFixed(1)} ${tipY.toFixed(1)} `
            + `L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} `
            + `L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`}
          fill={color}
        />
      ) : null}
    </g>
  );
}

/** 지점별 시차 진행도(LightScatterDiagram.originLocalProgress와 동일 레시피) */
function staggered(progress: number, index: number, count: number, spread = 0.5) {
  const start = count > 1 ? (index / count) * spread : 0;
  return clamp01((progress - start) / Math.max(0.001, 1 - start));
}

const SCATTER_XFRACS = [0.25, 0.5, 0.75];
const SCATTER_ANGLES = [-160, -120, -60, -20];

/** absorbProgress 지그재그 경로(고정 좌표, Math.random 미사용) */
function absorbPath(entryX: number, entryY: number, w: number) {
  return [
    { x: entryX, y: entryY },
    { x: w * 0.30, y: 262 },
    { x: w * 0.68, y: 332 },
    { x: w * 0.45, y: 462 },
    { x: w * 0.62, y: 516 },
  ];
}

export interface WetFabricLightDiagramProps {
  width: number;
  x?: number;
  y?: number;
  wetProgress?: number;
  scatterProgress?: number;
  absorbProgress?: number;
  stroke?: string;
  fabricColor?: string;
  waterColor?: string;
  lightColor?: string;
  pigmentColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const WetFabricLightDiagram: React.FC<WetFabricLightDiagramProps> = ({
  width, x = 0, y = 0,
  wetProgress, scatterProgress, absorbProgress,
  stroke = C.ink,
  fabricColor = C.inkSoft,
  waterColor = C.waterCool,
  lightColor = C.gold,
  pigmentColor = '#3B4252',
  strokeWidth = SW * 1.5,
  style,
}) => {
  const height = width * (WETFABRIC_VB_H / WETFABRIC_VB_W);
  const entryX = WETFABRIC_VB_W * 0.5;
  const entryY = waveY(FIBERS[0], 0.5);
  const path = absorbPath(entryX, entryY, WETFABRIC_VB_W);
  const segOpacity = [1, 0.8, 0.6, 0.42];

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${WETFABRIC_VB_W} ${WETFABRIC_VB_H}`} style={{ overflow: 'visible' }}>
        {wetProgress !== undefined ? (
          <g>
            {GAPS.map((gap, gi) => {
              const local = smooth(staggered(wetProgress, gi, GAPS.length, 0.3));
              if (local <= 0.01) return null;
              const gapH = gap.bottom - gap.top;
              const waterH = gapH * local;
              const waterTop = gap.bottom - waterH;
              return (
                <g key={gi} opacity={Math.min(1, local * 3)}>
                  <rect x={0} y={waterTop} width={WETFABRIC_VB_W} height={waterH} fill={waterColor} opacity={0.8} />
                  <path
                    d={ripplePathD(waterTop, WETFABRIC_VB_W, 9, gi * 1.7)}
                    fill="none" stroke={waterColor} strokeWidth={6} opacity={0.95} strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>
        ) : null}

        {FIBERS.map((f, i) => (
          <path key={i} d={wavePathD(f, WETFABRIC_VB_W)} fill="none" stroke={fabricColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {scatterProgress !== undefined ? (
          <g>
            <Arrow
              x1={entryX} y1={20} x2={entryX} y2={entryY} reveal={1} color={lightColor} strokeWidth={11}
              opacity={clamp01(scatterProgress / 0.25)}
            />
            {SCATTER_XFRACS.map((xf, oi) => {
              const local = staggered(scatterProgress, oi, SCATTER_XFRACS.length);
              if (local <= 0.01) return null;
              const ox = WETFABRIC_VB_W * xf;
              const oy = waveY(FIBERS[0], xf);
              return (
                <g key={oi}>
                  <circle cx={ox} cy={oy} r={12} fill={lightColor} stroke={stroke} strokeWidth={4} opacity={Math.min(1, local * 2)} />
                  {SCATTER_ANGLES.map((deg, ai) => {
                    const arrowStart = (ai % 3) * 0.08;
                    const arrowLocal = clamp01((local - arrowStart) / Math.max(0.001, 1 - arrowStart));
                    const rad = (deg * Math.PI) / 180;
                    const len = 72;
                    return (
                      <Arrow
                        key={ai} x1={ox} y1={oy} x2={ox + Math.cos(rad) * len} y2={oy + Math.sin(rad) * len}
                        reveal={arrowLocal} color={lightColor} strokeWidth={7}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        ) : null}

        {absorbProgress !== undefined ? (
          <g>
            <Arrow
              x1={entryX} y1={20} x2={entryX} y2={entryY} reveal={1} color={lightColor} strokeWidth={11}
              opacity={clamp01(absorbProgress / 0.15)}
            />
            {path.slice(0, -1).map((p, i) => {
              const segLocal = clamp01((absorbProgress - i * 0.25) / 0.25);
              const next = path[i + 1];
              return (
                <Arrow
                  key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y} reveal={segLocal}
                  color={lightColor} strokeWidth={9} opacity={segOpacity[i]}
                />
              );
            })}
            {(() => {
              const last = path[path.length - 1];
              const dotA = clamp01((absorbProgress - 0.88) / 0.12);
              if (dotA <= 0.01) return null;
              return (
                <circle cx={last.x} cy={last.y} r={16 + 6 * dotA} fill={pigmentColor} stroke={stroke} strokeWidth={4} opacity={dotA} />
              );
            })()}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default WetFabricLightDiagram;
