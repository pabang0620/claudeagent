/** "빛이 매질을 통과하며 색이 갈라지고, 일부 색만 유독 심하게 흩어진다"를 보여주는 범용
 *  다이어그램(general-ep22 신설). 세 레이어를 독립 progress로 노출한다(StarlightDiagram과
 *  같은 설계 - undefined면 그 레이어를 안 그린다).
 *
 *   1. splitProgress - 흰 빛줄기가 프리즘을 통과하듯 무지개색 부채꼴로 갈라진다(s3: "햇빛에는
 *      여러 색이 다 섞여 있다").
 *   2. scatterProgress - 지정한 지점(들, scatterOrigins)에서 빛이 공기 알갱이에 부딪혀
 *      화살 다발이 사방으로 튀어나간다(s4: "파란빛만 유독 심하게 흩어진다"). convergeTo를
 *      지정하면 화살들이 사방 대신 그 한 점(예: 눈)을 향해 모이는 다발로 바뀐다(s5: "하늘
 *      전체에서 흩어진 파란빛이 눈으로 쏟아져 들어온다"). scatterOrigins를 여러 개, 경로를
 *      길게 잡으면(s7: 노을) 경로를 따라가며 점점 더 많은 지점에서 파란빛이 빠져나가는
 *      모습을 표현할 수 있다.
 *   3. pathFrom/pathTo/pathProgress - 광원(해)에서 도착점까지의 경로를 옅은 빛깔 -> surviveColor
 *      로 물드는 그라데이션 선으로 그린다("산란될수록 이 색만 남는다"는 것을 경로 자체의
 *      색 변화로 보여준다, s7).
 *
 *  "피부 위에 점 여러 개를 흩뿌리는" 방식(예전 BumpCluster 등, "징그럽다" 피드백)과 달리
 *  산란은 전부 방향이 뚜렷한 화살(선+화살촉)로 그린다 - 촘촘한 점 무리를 쓰지 않는다.
 *
 *  Math.random 미사용 - 전부 progress(0~1)만 받는 순수 함수라 결정적이다(원칙 3).
 */
import React from 'react';
import { C } from '../theme';

export interface ScatterPoint { x: number; y: number }

/** 산란되는 색(파랑) - 채널 팔레트에 없는 실제 빛 색이라 로컬로 정의한다.
 *  s8(보라 vs 파랑 산란량 비교)에서도 같은 톤을 쓰도록 export한다. */
export const LIGHT_VIOLET = '#8E6FE0';
export const LIGHT_BLUE = '#4F8FE0';
export const LIGHT_GREEN = '#4FB88A';
export const LIGHT_YELLOW = '#F5C94B';
export const LIGHT_ORANGE = '#F2954F';
export const LIGHT_RED = '#EF5B4B';

const RAINBOW = [LIGHT_VIOLET, LIGHT_BLUE, LIGHT_GREEN, LIGHT_YELLOW, LIGHT_ORANGE, LIGHT_RED];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: ScatterPoint, b: ScatterPoint, t: number): ScatterPoint => ({
  x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t),
});

const VB = 700;

/** 화살(선 + 화살촉 삼각형) 하나. reveal(0~1)만큼 뻗는다 - "튀어나가는 방향"이 읽히도록
 *  촘촘한 점 대신 이 형태를 산란 표현 전체에 쓴다. */
function Arrow({
  origin, angleDeg, length, reveal, color, strokeWidth = 8,
}: {
  origin: ScatterPoint; angleDeg: number; length: number; reveal: number; color: string; strokeWidth?: number;
}) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const len = length * r;
  const tipX = origin.x + dx * len;
  const tipY = origin.y + dy * len;
  const headLen = Math.min(20, len * 0.4);
  const backX = tipX - dx * headLen;
  const backY = tipY - dy * headLen;
  const perpX = -dy;
  const perpY = dx;
  const headW = headLen * 0.62;
  const p1 = `${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
  const p2 = `${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)}`;
  const p3 = `${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)}`;
  return (
    <g opacity={Math.min(1, r * 4)}>
      <line
        x1={origin.x} y1={origin.y} x2={backX} y2={backY}
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      />
      {len > headLen ? <path d={`M ${p1} L ${p2} L ${p3} Z`} fill={color} /> : null}
    </g>
  );
}

export interface LightScatterDiagramProps {
  width: number;
  x: number;
  y: number;

  /** 0~1: 흰 빛줄기가 프리즘처럼 무지개색 부채꼴로 갈라지는 진행도(s3). undefined면 안 그림 */
  splitProgress?: number;

  /** 0~1: 지정한 지점(들)에서 빛이 흩어지는(화살 다발) 진행도(s4/s5/s7). undefined면 안 그림 */
  scatterProgress?: number;
  /** 산란 지점들(viewBox 700 기준 좌표). 기본 [{x:350,y:350}] 한 점 */
  scatterOrigins?: ScatterPoint[];
  /** 산란되어 튀어나가는 색. 기본 LIGHT_BLUE */
  scatterColor?: string;
  /** 지점당 화살 개수. 기본 7(사방 산란) / convergeTo 지정 시 기본 5(수렴 다발) */
  scatterArrowCount?: number;
  /** 화살 길이(px). 기본 90 */
  scatterArrowLength?: number;
  /** 지정하면 화살이 사방 대신 이 한 점(눈 등)을 향해 모이는 다발이 된다(s5) */
  convergeTo?: ScatterPoint;

  /** 광원 -> 도착점 경로(옅은 빛깔 -> surviveColor 그라데이션). 둘 다 지정해야 그려진다(s4/s7) */
  pathFrom?: ScatterPoint;
  pathTo?: ScatterPoint;
  /** 경로가 어디까지 그려졌는지(0~1). 기본 1 */
  pathProgress?: number;
  /** 경로 끝(=산란되지 않고 남는 색). 기본 LIGHT_RED */
  surviveColor?: string;

  stroke?: string;
  style?: React.CSSProperties;
}

/** 산란 지점 인덱스별로 시작 시점을 다르게 줘서(0~0.5 사이 스태거) 한꺼번에 "팡" 터지지
 *  않고 경로를 따라 순서대로 흩어지는 것처럼 보이게 한다. */
function originLocalProgress(scatterProgress: number, index: number, count: number) {
  const start = count > 1 ? (index / count) * 0.5 : 0;
  return clamp01((scatterProgress - start) / Math.max(0.001, 1 - start));
}

export const LightScatterDiagram: React.FC<LightScatterDiagramProps> = ({
  width, x, y,
  splitProgress,
  scatterProgress, scatterOrigins = [{ x: 350, y: 350 }],
  scatterColor = LIGHT_BLUE, scatterArrowCount, scatterArrowLength = 90, convergeTo,
  pathFrom, pathTo, pathProgress = 1, surviveColor = LIGHT_RED,
  stroke = C.ink, style,
}) => {
  const gradId = React.useId().replace(/[:]/g, '');
  const ENTRY: ScatterPoint = { x: 350, y: 50 };
  const PRISM: ScatterPoint = { x: 350, y: 270 };
  const arrowCount = scatterArrowCount ?? (convergeTo ? 5 : 7);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
      <svg width={width} height={width} viewBox={`0 0 ${VB} ${VB}`} style={{ overflow: 'visible' }}>
        <defs>
          {pathFrom && pathTo ? (
            <linearGradient
              id={gradId} gradientUnits="userSpaceOnUse"
              x1={pathFrom.x} y1={pathFrom.y} x2={pathTo.x} y2={pathTo.y}
            >
              <stop offset="0%" stopColor={C.gold} />
              <stop offset="100%" stopColor={surviveColor} />
            </linearGradient>
          ) : null}
        </defs>

        {pathFrom && pathTo ? (
          (() => {
            const p = clamp01(pathProgress);
            const end = lerpPt(pathFrom, pathTo, p);
            return (
              <g>
                <line
                  x1={pathFrom.x} y1={pathFrom.y} x2={end.x} y2={end.y}
                  stroke={stroke} strokeWidth={20} strokeLinecap="round" opacity={0.3}
                />
                <line
                  x1={pathFrom.x} y1={pathFrom.y} x2={end.x} y2={end.y}
                  stroke={`url(#${gradId})`} strokeWidth={13} strokeLinecap="round"
                />
                <circle cx={pathFrom.x} cy={pathFrom.y} r={18} fill={C.gold} stroke={stroke} strokeWidth={5} />
                {p > 0.97 ? (
                  <circle cx={pathTo.x} cy={pathTo.y} r={16} fill={surviveColor} stroke={stroke} strokeWidth={5} />
                ) : null}
              </g>
            );
          })()
        ) : null}

        {splitProgress !== undefined ? (
          (() => {
            const sp = clamp01(splitProgress);
            const beamP = clamp01(sp / 0.35);
            const fanP = clamp01((sp - 0.35) / 0.65);
            const beamEnd = lerpPt(ENTRY, PRISM, beamP);
            const N = RAINBOW.length;
            return (
              <g>
                <line
                  x1={ENTRY.x} y1={ENTRY.y} x2={beamEnd.x} y2={beamEnd.y}
                  stroke={stroke} strokeWidth={17} strokeLinecap="round" opacity={0.3}
                />
                <line
                  x1={ENTRY.x} y1={ENTRY.y} x2={beamEnd.x} y2={beamEnd.y}
                  stroke={C.gold} strokeWidth={11} strokeLinecap="round"
                />
                {fanP > 0.02 ? (
                  <g transform={`translate(${PRISM.x} ${PRISM.y}) rotate(45)`}>
                    <path
                      d="M -22 -22 L 22 -22 L 0 22 Z"
                      fill="#FFF6DE" stroke={stroke} strokeWidth={5} opacity={0.9}
                    />
                  </g>
                ) : null}
                {RAINBOW.map((color, i) => {
                  const angle = -60 + i * (120 / (N - 1)) + 90; // 90 = 아래쪽(+y) 기준
                  const localStart = i * 0.1;
                  const local = clamp01((fanP - localStart) / (1 - localStart));
                  if (local <= 0.02) return null;
                  const rad = (angle * Math.PI) / 180;
                  const len = 260 * local;
                  const tx = PRISM.x + Math.cos(rad) * len;
                  const ty = PRISM.y + Math.sin(rad) * len;
                  return (
                    <g key={i} opacity={Math.min(1, local * 4)}>
                      <line
                        x1={PRISM.x} y1={PRISM.y} x2={tx} y2={ty}
                        stroke={color} strokeWidth={9} strokeLinecap="round"
                      />
                      <circle cx={tx} cy={ty} r={13} fill={color} stroke={stroke} strokeWidth={4} />
                    </g>
                  );
                })}
              </g>
            );
          })()
        ) : null}

        {scatterProgress !== undefined ? (
          <g>
            {scatterOrigins.map((origin, oi) => {
              const local = originLocalProgress(scatterProgress, oi, scatterOrigins.length);
              if (local <= 0.02) return null;
              const molScale = 0.5 + 0.5 * Math.min(1, local * 2.2);
              let baseAngle = 90;
              let spread = 360;
              // 지점마다 수렴점까지 실제 거리가 다르므로, 화살이 도중에 끊기거나 지나치지
              // 않고 정확히 그 점에 도달하도록 지점별 길이를 계산한다.
              const arrowLen = convergeTo
                ? Math.hypot(convergeTo.x - origin.x, convergeTo.y - origin.y)
                : scatterArrowLength;
              if (convergeTo) {
                baseAngle = (Math.atan2(convergeTo.y - origin.y, convergeTo.x - origin.x) * 180) / Math.PI;
                spread = 44;
              }
              return (
                <g key={oi}>
                  <circle
                    cx={origin.x} cy={origin.y} r={14 * molScale}
                    fill="#FFF6DE" stroke={stroke} strokeWidth={5} opacity={Math.min(1, local * 2)}
                  />
                  {Array.from({ length: arrowCount }).map((_, ai) => {
                    const t = arrowCount > 1 ? ai / (arrowCount - 1) : 0.5;
                    const angle = convergeTo
                      ? baseAngle - spread / 2 + t * spread
                      : (360 / arrowCount) * ai;
                    // 화살마다 살짝 다른 시점에 뻗어 "한꺼번에 팡"이 아니라 다발처럼 보이게 한다
                    const arrowStart = (ai % 3) * 0.06;
                    const arrowLocal = clamp01((local - arrowStart) / Math.max(0.001, 1 - arrowStart));
                    return (
                      <Arrow
                        key={ai} origin={origin} angleDeg={angle} length={arrowLen}
                        reveal={arrowLocal} color={scatterColor}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default LightScatterDiagram;
