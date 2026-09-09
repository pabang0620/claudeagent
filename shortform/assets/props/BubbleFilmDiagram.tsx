/** "비눗방울 표면은 물과 비누로 된 아주 얇은 막인데, 빛이 이 막의 겉면과 안쪽 면 두 곳에서
 *  각각 반사돼 두 빛이 다시 만나 겹치고, 막 두께에 따라 그 겹침이 어떤 색은 강해지고 어떤
 *  색은 사라지게 만든다"는 구조를 보여주는 다이어그램(비눗방울이 무지개색으로 보이는 이유,
 *  general-ep86). LightScatterDiagram·RainbowDiagram과 같은 설계(독립 레이어를 각각
 *  progress로 노출, undefined면 그 레이어를 안 그림)를 따른다.
 *
 *  REGISTRY 확인 완료 - 30화 RainbowDiagram(빛이 물방울 안에서 굴절-내부반사-굴절해 특정
 *  각도로만 나가는 구조, "무지개")과 22화 LightScatterDiagram(빛이 매질을 통과하며 색이
 *  갈라지고 일부만 흩어지는 구조, "파란 하늘")을 먼저 확인했으나 둘 다 "얇은 막의 겉면과
 *  안쪽 면 두 곳에서 각각 반사된 두 빛이 다시 만나 겹쳐 특정 색만 남는다"(박막 간섭)는 이
 *  화의 구조는 다루지 않아 새로 만들었다. 광원 색은 두 컴포넌트와 같은 관례(C.gold =
 *  아직 어떤 색인지 정해지지 않은 빛)를 따르고, 산란 화살 대신 이 화 전용의 "막 단면 +
 *  두 반사광선" 기하 구조를 새로 짰다(지역성 우선 - 좌표계가 다르다).
 *
 *  BubbleFilmDiagram (막 단면, s3~s6):
 *   - reflectProgress(0~1): 0~0.5 구간은 입사광이 겉면에 닿아(A) 그중 일부가 즉시 튕겨
 *     나가는 과정(s3), 0.5~1 구간은 나머지가 막을 통과해(A->B) 안쪽 면에서 튕겨(B)
 *     다시 겉면을 뚫고 나가는(B->C) 과정(s4)이다. 두 반사광선(A->EYE, C->EYE)은 같은
 *     한 점(EYE)으로 모이도록 설계해 "다시 만난다"는 서술을 좌표로 그대로 보여준다
 *     (물리적으로는 근사지만, 이 채널의 다른 광학 다이어그램도 같은 수준의 단순화를
 *     쓴다 - RainbowDiagram의 42도 근사 등).
 *   - interferenceProgress(0~1, reflectProgress=1 전제): EYE 지점에 무지개 6색이 작게
 *     펼쳐졌다가, 그중 resultColor 하나만 남고 나머지 5개는 옅어져 사라진다("어떤 색은
 *     강해지고 어떤 색은 사라진다"를 색 자체로 보여준다).
 *   - filmGapPx: 막 두께(고정값). s6에서 두 인스턴스에 서로 다른 값+다른 resultColor를
 *     줘 "두께가 조금만 달라져도 남는 색이 바뀐다"를 나란히 대조한다.
 *
 *  BubbleSurface (비눗방울 전체, s1/s2 아이콘/s7/s8):
 *   - swirlT(연속값, TwinkleDiagram.twinkleT와 같은 관례): 무지개 6색 밴드가 이 값에
 *     따라 서서히 회전해 "소용돌이"처럼 보인다. 밴드는 두꺼운 호(arc)로만 그려 촘촘한
 *     점 무리를 쓰지 않는다("징그럽다" 재발 방지 원칙).
 *   - colorIntensity(0~1): 색 밴드의 선명도. 0이면 색이 거의 없는 투명한 막만 남는다.
 *   - blackenProgress(0~1, undefined면 검게 변하지 않음): 밴드 색이 BUBBLE_BLACK으로
 *     번져가며 막이 점점 얇아 보이게 한다(s8 전반부 - 색이 사라지고 까매짐).
 *   - popProgress(0~1, undefined면 터지지 않음): 방울이 살짝 오그라들며 옅어지고, 가장자리에서
 *     짧은 파열 선 6가닥이 뻗어나간다(s8 후반부 - 터짐, 점 무리 대신 선으로 - 원칙 0-1과
 *     같은 정신의 "징그럽지 않은" 파열 표현).
 *
 *  Math.random 미사용 - 전부 progress(0~1)/연속 시간값만 받는 순수 함수라 결정적이다(원칙 3).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW_THIN } from '../theme';
import {
  LIGHT_VIOLET, LIGHT_BLUE, LIGHT_GREEN, LIGHT_YELLOW, LIGHT_ORANGE, LIGHT_RED,
} from './LightScatterDiagram';

export const BUBBLE_FILM_VB = 700;
export const BUBBLE_SURFACE_VB = 700;
/** 방울이 다 얇아져 색이 사라졌을 때의 색(BubbleSurface.blackenProgress=1) */
export const BUBBLE_BLACK = '#14171D';

const RAINBOW = [LIGHT_VIOLET, LIGHT_BLUE, LIGHT_GREEN, LIGHT_YELLOW, LIGHT_ORANGE, LIGHT_RED];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
interface Pt { x: number; y: number }
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(t))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* ============================================================
 * BubbleFilmDiagram - 막 단면(겉면/안쪽 면 이중 반사 + 간섭)
 * ============================================================ */

const SUN: Pt = { x: 90, y: 150 };
const A: Pt = { x: 330, y: 420 };
const EYE: Pt = { x: 610, y: 130 };

export interface BubbleFilmDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 0~1: 0~0.5=입사광이 겉면(A)에서 즉시 튕겨나감(s3), 0.5~1=나머지가 막을 통과해
   *  안쪽 면(B)에서 튕겨 겉면(C)을 뚫고 나감(s4). undefined면 안 그림 */
  reflectProgress?: number;
  /** 0~1: EYE 지점에서 두 빛이 겹쳐 무지개색 중 resultColor만 남고 나머지는 사라짐.
   *  undefined면 안 그림 (reflectProgress=1 전제, s5/s6) */
  interferenceProgress?: number;
  /** 막 두께(px, 고정). s6에서 두 인스턴스를 다르게 줘 결과색 차이를 대조한다 */
  filmGapPx?: number;
  /** 간섭 결과로 남는 색 (RAINBOW 중 하나 권장) */
  resultColor?: string;
  stroke?: string;
  filmFill?: string;
  style?: React.CSSProperties;
}

export const BubbleFilmDiagram: React.FC<BubbleFilmDiagramProps> = ({
  width, x, y, reflectProgress, interferenceProgress, filmGapPx = 70,
  resultColor = LIGHT_GREEN, stroke = C.ink, filmFill = C.sky, style,
}) => {
  const dx = filmGapPx * 0.55;
  const B: Pt = { x: A.x + dx, y: A.y + filmGapPx };
  const Cx: Pt = { x: A.x + dx * 2, y: A.y };

  const rp = reflectProgress !== undefined ? clamp01(reflectProgress) : undefined;
  const p1 = rp !== undefined ? clamp01(rp / 0.3) : 0; // SUN -> A
  const p2 = rp !== undefined ? clamp01((rp - 0.3) / 0.2) : 0; // A -> EYE (ray1)
  const p3 = rp !== undefined ? clamp01((rp - 0.5) / 0.12) : 0; // A -> B (transmit)
  const bounceOn = (rp ?? 0) >= 0.62;
  const p4 = rp !== undefined ? clamp01((rp - 0.68) / 0.14) : 0; // B -> C
  const p5 = rp !== undefined ? clamp01((rp - 0.82) / 0.18) : 0; // C -> EYE (ray2)

  const sunToA = lerpPt(SUN, A, p1);
  const aToEye = lerpPt(A, EYE, p2);
  const aToB = lerpPt(A, B, p3);
  const bToC = lerpPt(B, Cx, p4);
  const cToEye = lerpPt(Cx, EYE, p5);

  const ip = interferenceProgress !== undefined ? clamp01(interferenceProgress) : undefined;
  const resultIdx = Math.max(0, RAINBOW.indexOf(resultColor));

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
      <svg width={width} height={width} viewBox={`0 0 ${BUBBLE_FILM_VB} ${BUBBLE_FILM_VB}`} style={{ overflow: 'visible' }}>
        {/* 막 단면 - 겉면(위 선) / 안쪽 면(아래 선), 사이는 옅은 막 채움 */}
        <rect x={-40} y={A.y} width={BUBBLE_FILM_VB + 80} height={filmGapPx} fill={filmFill} opacity={0.55} />
        <line x1={-40} y1={A.y} x2={BUBBLE_FILM_VB + 40} y2={A.y} stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
        <line
          x1={-40} y1={A.y + filmGapPx} x2={BUBBLE_FILM_VB + 40} y2={A.y + filmGapPx}
          stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round"
        />

        {rp !== undefined ? (
          <g>
            {p1 > 0.01 ? (
              <line x1={SUN.x} y1={SUN.y} x2={sunToA.x} y2={sunToA.y} stroke={C.gold} strokeWidth={12} strokeLinecap="round" />
            ) : null}
            {p1 > 0.9 ? <circle cx={SUN.x} cy={SUN.y} r={20} fill={C.gold} stroke={stroke} strokeWidth={6} /> : null}

            {p1 > 0.95 ? <circle cx={A.x} cy={A.y} r={12} fill={C.paper} stroke={stroke} strokeWidth={6} /> : null}

            {p2 > 0.01 ? (
              <line x1={A.x} y1={A.y} x2={aToEye.x} y2={aToEye.y} stroke={C.gold} strokeWidth={12} strokeLinecap="round" opacity={0.92} />
            ) : null}

            {p3 > 0.01 ? (
              <line x1={A.x} y1={A.y} x2={aToB.x} y2={aToB.y} stroke={C.gold} strokeWidth={10} strokeLinecap="round" opacity={0.75} />
            ) : null}

            {bounceOn ? <circle cx={B.x} cy={B.y} r={12} fill={C.paper} stroke={stroke} strokeWidth={6} /> : null}

            {p4 > 0.01 ? (
              <line x1={B.x} y1={B.y} x2={bToC.x} y2={bToC.y} stroke={C.gold} strokeWidth={10} strokeLinecap="round" opacity={0.75} />
            ) : null}

            {p4 > 0.95 ? <circle cx={Cx.x} cy={Cx.y} r={12} fill={C.paper} stroke={stroke} strokeWidth={6} /> : null}

            {p5 > 0.01 ? (
              <line x1={Cx.x} y1={Cx.y} x2={cToEye.x} y2={cToEye.y} stroke={C.gold} strokeWidth={12} strokeLinecap="round" opacity={0.92} />
            ) : null}
          </g>
        ) : null}

        {ip !== undefined ? (
          <g>
            {RAINBOW.map((color, i) => {
              if (i === resultIdx) return null;
              const local = clamp01((ip - 0.1) / 0.55);
              const fadeOut = clamp01((ip - 0.35) / 0.55);
              const angle = -160 + i * 32;
              const rad = (angle * Math.PI) / 180;
              const r = 46 * Math.min(1, local * 2.4);
              const px = EYE.x + Math.cos(rad) * 60;
              const py = EYE.y + Math.sin(rad) * 60;
              const opacity = Math.min(1, local * 3) * (1 - fadeOut);
              if (opacity <= 0.01) return null;
              return <circle key={i} cx={px} cy={py} r={r * (1 - fadeOut * 0.6)} fill={color} opacity={opacity * 0.85} />;
            })}
            {(() => {
              const local = clamp01((ip - 0.1) / 0.55);
              const grow = clamp01((ip - 0.3) / 0.6);
              const r = lerp(20, 46, grow);
              const glowR = r + 24 * grow;
              if (local <= 0.02) return null;
              return (
                <g>
                  {grow > 0.02 ? <circle cx={EYE.x} cy={EYE.y} r={glowR} fill={resultColor} opacity={0.22 * grow} /> : null}
                  <circle cx={EYE.x} cy={EYE.y} r={r} fill={resultColor} stroke={stroke} strokeWidth={6} opacity={Math.min(1, local * 3)} />
                </g>
              );
            })()}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============================================================
 * BubbleSurface - 비눗방울 전체(소용돌이 무지개 막, s1/s2/s7/s8)
 * ============================================================ */

const BANDS: { r: number; sweep: number; phase: number }[] = [
  { r: 170, sweep: 118, phase: 0 },
  { r: 205, sweep: 96, phase: 55 },
  { r: 150, sweep: 132, phase: 140 },
  { r: 230, sweep: 84, phase: 210 },
  { r: 190, sweep: 104, phase: 280 },
  { r: 160, sweep: 120, phase: 320 },
];

function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
  const a0 = (startDeg * Math.PI) / 180;
  const a1 = ((startDeg + sweepDeg) * Math.PI) / 180;
  const sx = cx + r * Math.cos(a0);
  const sy = cy + r * Math.sin(a0);
  const ex = cx + r * Math.cos(a1);
  const ey = cy + r * Math.sin(a1);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

export interface BubbleSurfaceProps {
  width: number;
  x: number;
  y: number;
  /** 연속 시간값(프레임 등) - 밴드가 이 값에 따라 천천히 회전해 소용돌이처럼 보인다 */
  swirlT?: number;
  /** 0~1: 색 밴드의 선명도. 0이면 거의 무색 */
  colorIntensity?: number;
  /** 0~1: 밴드 색이 BUBBLE_BLACK으로 번짐(막이 얇아지며 색이 사라짐). undefined면 안 그림 */
  blackenProgress?: number;
  /** 0~1: 방울이 오그라들며 파열 선이 뻗어나감(터짐). undefined면 안 그림 */
  popProgress?: number;
  stroke?: string;
  style?: React.CSSProperties;
}

export const BubbleSurface: React.FC<BubbleSurfaceProps> = ({
  width, x, y, swirlT = 0, colorIntensity = 1, blackenProgress, popProgress, stroke = C.ink, style,
}) => {
  const clipId = React.useId().replace(/[:]/g, '');
  const CX = BUBBLE_SURFACE_VB / 2;
  const CY = BUBBLE_SURFACE_VB / 2;
  const R = 300;

  const pop = popProgress !== undefined ? clamp01(popProgress) : 0;
  const scale = 1 - pop * 0.32;
  const wholeOpacity = 1 - pop * 0.85;
  const black = blackenProgress !== undefined ? clamp01(blackenProgress) : 0;
  const rot = (swirlT * 6) % 360;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
      <svg width={width} height={width} viewBox={`0 0 ${BUBBLE_SURFACE_VB} ${BUBBLE_SURFACE_VB}`} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id={clipId}><circle cx={CX} cy={CY} r={R} /></clipPath>
        </defs>
        <g style={{ opacity: wholeOpacity, transformOrigin: `${CX}px ${CY}px`, transform: `scale(${scale})` }}>
          <circle cx={CX} cy={CY} r={R} fill={C.paper} opacity={0.14} />
          <g clipPath={`url(#${clipId})`}>
            {BANDS.map((b, i) => {
              const baseColor = RAINBOW[i % RAINBOW.length];
              const color = black > 0 ? lerpHex(baseColor, BUBBLE_BLACK, black) : baseColor;
              return (
                <path
                  key={i}
                  d={arcPath(CX, CY, b.r, b.phase + rot, b.sweep)}
                  fill="none" stroke={color} strokeWidth={54} strokeLinecap="round"
                  opacity={0.5 * colorIntensity}
                />
              );
            })}
          </g>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
          <ellipse
            cx={CX - R * 0.42} cy={CY - R * 0.48} rx={34} ry={54}
            fill={C.paper} opacity={0.5} transform={`rotate(-28 ${CX - R * 0.42} ${CY - R * 0.48})`}
          />
        </g>
        {pop > 0.15
          ? Array.from({ length: 6 }).map((_, i) => {
              const deg = i * 60 + 18;
              const rad = (deg * Math.PI) / 180;
              const local = clamp01((pop - 0.15) / 0.7);
              const len = 60 * local;
              const startR = R * scale + 10;
              const sx = CX + Math.cos(rad) * startR;
              const sy = CY + Math.sin(rad) * startR;
              const ex = sx + Math.cos(rad) * len;
              const ey = sy + Math.sin(rad) * len;
              return (
                <line
                  key={i} x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={stroke} strokeWidth={7} strokeLinecap="round" opacity={(1 - local) * 0.9}
                />
              );
            })
          : null}
      </svg>
    </div>
  );
};

export default BubbleFilmDiagram;
