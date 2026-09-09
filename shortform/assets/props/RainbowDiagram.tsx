/** "빗방울 하나하나가 빛을 굴절-반사-굴절시켜 특정 각도로만 돌려보내고, 그 각도를 만족하는
 *  수많은 빗방울을 이으면 하늘에 원이 그려지는데 땅이 아래 절반을 가려 반원만 보인다"는 구조를
 *  보여주는 범용 다이어그램(general-ep30, 무지개가 반원인 이유). StarlightDiagram·
 *  LightScatterDiagram과 같은 설계(독립 레이어를 각각 progress로 노출, undefined면 그 레이어를
 *  안 그림)를 그대로 따른다.
 *
 *   - rayProgress  : 0~1. 빗방울 하나(원) 클로즈업. 태양광선이 들어와(0~0.22) 굴절해
 *     내부를 가로질러(0.22~0.48) 뒤쪽 안쪽면에서 반사하고(0.48~0.52) 다시 내부를 가로질러
 *     (0.52~0.75) 앞쪽에서 굴절해 빠져나간다(0.75~0.80). 마지막 구간(0.80~1)에서 "빛이
 *     휘지 않았다면 이렇게 갔을 것"이라는 점선 기준선과 실제 빠져나가는 광선 사이의 각도호를
 *     그린다(각도 숫자 라벨은 이 컴포넌트가 아니라 호출 씬이 `RAINBOW_ANGLE_LABEL_PT`
 *     위치에 `Label`로 얹는다 - CatPurrDiagram의 라벨 분리 관례와 동일). s3용.
 *   - arcProgress   : 0~1. 42도를 만족하는 빗방울 여러 개가 하늘 위 원 둘레를 따라 점으로
 *     하나씩 나타나고(0~0.6), 점들을 이으며 굵은 색 띠(3겹, 얇은 선 여러 겹 대신 두꺼운
 *     밴드로 - "징그럽다"류 촘촘한 표현 금지 원칙과 같은 정신)가 원을 그린다(0.6~1). s4용.
 *     s5/s6에서도 완성된 원을 계속 보여주려면 1로 고정해서 넘긴다(장면 전환 시 이전 상태
 *     유지 원칙).
 *   - groundMask    : 0~1. 원의 아래쪽 절반을 초록 지평선이 덮어 올라오는 진행도. 0=안 덮임,
 *     1=원의 정확히 아래 절반까지 덮여 위쪽 반원만 남는다. undefined면 마스크를 그리지
 *     않는다(원 전체가 다 보인다 - s6 비행기 창문 장면에서 씀). s5용.
 *
 *  Math.random 미사용 - 전부 progress(0~1)만 받는 순수 함수라 결정적이다(원칙 3).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C } from '../theme';
import { LIGHT_BLUE, LIGHT_GREEN, LIGHT_ORANGE, LIGHT_RED } from './LightScatterDiagram';

export const RAINBOW_VB_W = 700;
export const RAINBOW_VB_H = 700;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Pt { x: number; y: number }
const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const angPt = (c: Pt, r: number, deg: number): Pt => {
  const rad = (deg * Math.PI) / 180;
  return { x: c.x + r * Math.cos(rad), y: c.y + r * Math.sin(rad) };
};

/* ---------------- 단일 빗방울 클로즈업 (rayProgress) ---------------- */

const DROP_C: Pt = { x: 370, y: 420 };
const DROP_R = 180;
const ENTRY = angPt(DROP_C, DROP_R, 200);
const BOUNCE = angPt(DROP_C, DROP_R, 350);
const EXIT = angPt(DROP_C, DROP_R, 110);
const SUN: Pt = { x: DROP_C.x - 280, y: DROP_C.y - 260 };

const outDir = (() => {
  const dx = EXIT.x - BOUNCE.x;
  const dy = EXIT.y - BOUNCE.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
})();
const OUT: Pt = { x: EXIT.x + outDir.x * 230, y: EXIT.y + outDir.y * 230 };

const inDir = (() => {
  const dx = ENTRY.x - SUN.x;
  const dy = ENTRY.y - SUN.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
})();
/** "휘지 않았다면 이렇게 곧장 갔을 것" 기준선 - 실제 굴절 경로와 대비시키는 점선 */
const DASHED_END: Pt = { x: EXIT.x + inDir.x * 230, y: EXIT.y + inDir.y * 230 };

/** 호출 씬이 각도 숫자 라벨(`t.s3Label`)을 얹을 위치. exit 지점 살짝 바깥쪽 */
export const RAINBOW_ANGLE_LABEL_PT: Pt = { x: EXIT.x - 120, y: EXIT.y + 150 };

function RaindropClose({ p, stroke, dropFill }: { p: number; stroke: string; dropFill: string }) {
  const p1 = clamp01(p / 0.22); // 태양 -> 진입점
  const p2 = clamp01((p - 0.22) / 0.26); // 진입점 -> 반사점 (내부)
  const p3 = clamp01((p - 0.48) / 0.27); // 반사점 -> 탈출점 (내부)
  const p4 = clamp01((p - 0.80) / 0.20); // 점선 기준선 + 실제 탈출광선 + 각도호

  const inEnd = lerpPt(SUN, ENTRY, p1);
  const midEnd = lerpPt(ENTRY, BOUNCE, p2);
  const backEnd = lerpPt(BOUNCE, EXIT, p3);
  const dashEnd = lerpPt(EXIT, DASHED_END, p4);
  const outEnd = lerpPt(EXIT, OUT, p4);

  return (
    <g>
      {/* 빗방울 몸통 - 둥근 원 하나(실제 작은 빗방울은 거의 구형이다, 광학 다이어그램 관례).
          왼쪽 위에 작은 하이라이트 점 하나만 얹어 "물방울"임을 읽히게 한다(점 무리 금지 원칙) */}
      <circle cx={DROP_C.x} cy={DROP_C.y} r={DROP_R} fill={dropFill} stroke={stroke} strokeWidth={12} />
      <ellipse
        cx={DROP_C.x - DROP_R * 0.42} cy={DROP_C.y - DROP_R * 0.5} rx={22} ry={34}
        fill={C.paper} opacity={0.55} transform={`rotate(-28 ${DROP_C.x - DROP_R * 0.42} ${DROP_C.y - DROP_R * 0.5})`}
      />

      {p1 > 0.01 ? (
        <line x1={SUN.x} y1={SUN.y} x2={inEnd.x} y2={inEnd.y} stroke={C.gold} strokeWidth={11} strokeLinecap="round" />
      ) : null}
      {p1 > 0.9 ? <circle cx={SUN.x} cy={SUN.y} r={22} fill={C.gold} stroke={stroke} strokeWidth={6} /> : null}

      {p2 > 0.01 ? (
        <line x1={ENTRY.x} y1={ENTRY.y} x2={midEnd.x} y2={midEnd.y} stroke={C.gold} strokeWidth={11} strokeLinecap="round" />
      ) : null}
      {p3 > 0.01 ? (
        <line x1={BOUNCE.x} y1={BOUNCE.y} x2={backEnd.x} y2={backEnd.y} stroke={C.gold} strokeWidth={11} strokeLinecap="round" />
      ) : null}

      {p4 > 0.01 ? (
        <>
          <line
            x1={EXIT.x} y1={EXIT.y} x2={dashEnd.x} y2={dashEnd.y}
            stroke={stroke} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={0.55}
          />
          <line x1={EXIT.x} y1={EXIT.y} x2={outEnd.x} y2={outEnd.y} stroke={LIGHT_RED} strokeWidth={14} strokeLinecap="round" />
          {p4 > 0.4 ? (
            <AngleArc center={EXIT} r={90} from={DASHED_END} to={OUT} reveal={clamp01((p4 - 0.4) / 0.6)} stroke={stroke} />
          ) : null}
        </>
      ) : null}

      {[ENTRY, BOUNCE, EXIT].map((pt, i) => {
        const show = i === 0 ? p1 > 0.95 : i === 1 ? p2 > 0.95 : p3 > 0.95;
        if (!show) return null;
        return <circle key={i} cx={pt.x} cy={pt.y} r={11} fill={C.paper} stroke={stroke} strokeWidth={6} />;
      })}
    </g>
  );
}

/** 두 방향(중심 기준) 사이의 짧은 호. 정확한 각도 계산 대신 두 방향을 보간한 원호로
 *  "이만큼 꺾였다"는 인상만 준다(보조선 최소화 원칙 - 정밀 부채꼴 계산은 하지 않는다) */
function AngleArc({
  center, r, from, to, reveal, stroke,
}: { center: Pt; r: number; from: Pt; to: Pt; reveal: number; stroke: string }) {
  const a0 = Math.atan2(from.y - center.y, from.x - center.x);
  const a1 = Math.atan2(to.y - center.y, to.x - center.x);
  const steps = 18;
  const pts: Pt[] = [];
  const n = Math.max(1, Math.round(steps * clamp01(reveal)));
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / steps);
    pts.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
  }
  if (pts.length < 2) return null;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return <path d={d} fill="none" stroke={stroke} strokeWidth={6} strokeLinecap="round" opacity={0.8} />;
}

/* ---------------- 하늘의 큰 원 (arcProgress / groundMask) ---------------- */

export const RAINBOW_ARC_CENTER: Pt = { x: 350, y: 350 };
export const RAINBOW_ARC_RADIUS = 230;
const DOT_COUNT = 10;
const BANDS = [
  { dr: -32, color: LIGHT_BLUE, w: 28 },
  { dr: -6, color: LIGHT_GREEN, w: 28 },
  { dr: 20, color: LIGHT_ORANGE, w: 28 },
  { dr: 46, color: LIGHT_RED, w: 28 },
];

function SkyArc({ arcProgress, stroke, dotFill }: { arcProgress: number; stroke: string; dotFill: string }) {
  const ap = clamp01(arcProgress);
  const ringP = clamp01((ap - 0.6) / 0.4);

  return (
    <g>
      {ringP > 0.01
        ? BANDS.map((b, i) => {
            const r = RAINBOW_ARC_RADIUS + b.dr;
            const c = 2 * Math.PI * r;
            return (
              <circle
                key={i}
                cx={RAINBOW_ARC_CENTER.x} cy={RAINBOW_ARC_CENTER.y} r={r}
                fill="none" stroke={b.color} strokeWidth={b.w} strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c * (1 - ringP)}
                transform={`rotate(-90 ${RAINBOW_ARC_CENTER.x} ${RAINBOW_ARC_CENTER.y})`}
              />
            );
          })
        : null}
      {Array.from({ length: DOT_COUNT }).map((_, i) => {
        const startAt = (i / DOT_COUNT) * 0.55;
        const local = clamp01((ap - startAt) / Math.max(0.001, 1 - startAt));
        if (local <= 0.01) return null;
        const deg = (360 / DOT_COUNT) * i;
        const pt = angPt(RAINBOW_ARC_CENTER, RAINBOW_ARC_RADIUS, deg);
        const scale = 0.4 + 0.6 * Math.min(1, local * 2.4);
        return (
          <circle
            key={i} cx={pt.x} cy={pt.y} r={14 * scale}
            fill={dotFill} stroke={stroke} strokeWidth={5} opacity={Math.min(1, local * 3)}
          />
        );
      })}
    </g>
  );
}

export interface RainbowDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 0~1: 빗방울 하나(클로즈업)의 굴절-반사-굴절 경로. undefined면 안 그림 (s3) */
  rayProgress?: number;
  /** 0~1: 42도를 만족하는 빗방울들이 하늘에 원을 그리는 과정. undefined면 안 그림 (s4~s6) */
  arcProgress?: number;
  /** 0~1: 원의 아래쪽 절반이 지평선에 가려지는 진행도. undefined면 마스크 없음 (s5) */
  groundMask?: number;
  stroke?: string;
  dropFill?: string;
  dotFill?: string;
  groundColor?: string;
  style?: React.CSSProperties;
}

export const RainbowDiagram: React.FC<RainbowDiagramProps> = ({
  width, x, y, rayProgress, arcProgress, groundMask,
  stroke = C.ink, dropFill = C.water, dotFill = C.water, groundColor = C.leaf, style,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
    <svg width={width} height={width} viewBox={`0 0 ${RAINBOW_VB_W} ${RAINBOW_VB_H}`} style={{ overflow: 'visible' }}>
      {rayProgress !== undefined ? <RaindropClose p={clamp01(rayProgress)} stroke={stroke} dropFill={dropFill} /> : null}
      {arcProgress !== undefined ? <SkyArc arcProgress={arcProgress} stroke={stroke} dotFill={dotFill} /> : null}
      {groundMask !== undefined
        ? (() => {
            const gm = clamp01(groundMask);
            const topY = lerp(RAINBOW_VB_H, RAINBOW_ARC_CENTER.y, gm);
            if (topY >= RAINBOW_VB_H - 0.5) return null;
            return (
              <g>
                <rect x={-40} y={topY} width={RAINBOW_VB_W + 80} height={RAINBOW_VB_H - topY + 40} fill={groundColor} />
                <line x1={-40} y1={topY} x2={RAINBOW_VB_W + 40} y2={topY} stroke={stroke} strokeWidth={10} strokeLinecap="round" />
              </g>
            );
          })()
        : null}
    </svg>
  </div>
);

export default RainbowDiagram;
