/** "굵고 매끈한 관 하나"로 단순화한 소화관(위+장) 다이어그램. 채널 원칙(신체 내부를
 *  사실적으로 그리지 않는다 - 이 md의 "신체 표현은 최소한으로" 절)에 따라 주름·혈관·질감
 *  없이 부드러운 곡선 관 하나로만 그리고, 안의 내용물(음식/가스/물)도 촘촘한 점이 아니라
 *  큰 원 2~3개로만 표현한다(general-ep34, 배 꼬르륵 소리).
 *
 *  CellMergeDiagram·SaltCycleDiagram과 같은 원칙 - 독립 progress 레이어(undefined/0이면
 *  안 그림), 시간 곡선(반복 루프 등)은 호출 씬이 만들어 넘긴다.
 *
 *   - flowT       : 0 이상 계속 증가하는 누적값(사이클 수, 예: f/90). 근육 수축 밴드가 관을
 *     따라 반복 이동하고, 내용물 3개가 그 흐름을 따라 천천히 아래로 흘러간다. 씬 경계에서
 *     튀지 않도록 "루프"가 아니라 "계속 증가하는 값"을 받아 내부에서 mod 1 처리한다.
 *   - waveAmp     : 0~1. 수축 밴드의 시각적 세기(크기·진하기) - 공복 청소 운동처럼 더 강하게
 *     움직일 때 크게 준다(s6).
 *   - contentsT   : 0~1. 음식/가스/물 표시 정도. 0이면 빈 위(공복) 상태만 남는다(s4, s7).
 *   - sweepT      : 0~1(지정 시에만). 빗자루가 관을 따라 위->아래로 훑고 지나간다(청소 운동,
 *     s5). BroomIcon을 관 중심선의 접선 방향에 맞춰 회전시킨다.
 *   - echoGlowT   : 0~1(지정 시에만). 관 벽이 은은하게 발광 - 속이 비어 소리를 흡수할 것이
 *     없어 벽에 부딪혀 울리는 연출(s7). ScentWaves(소리 파형)는 이 컴포넌트가 아니라 호출
 *     씬이 gutPointAt()으로 좌표를 얻어 직접 그린다(재사용, 원칙 0).
 *
 *  전부 undefined/0이면 "빈 관"만 보이는 정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW_THIN } from '../theme';

export const GUT_VB_W = 640;
export const GUT_VB_H = 920;

interface Pt { x: number; y: number }

const P0: Pt = { x: 340, y: 70 };
const C1: Pt = { x: 490, y: 95 };
const C2: Pt = { x: 490, y: 290 };
const P1: Pt = { x: 330, y: 335 };
const C3: Pt = { x: 170, y: 380 };
const C4: Pt = { x: 170, y: 560 };
const P2: Pt = { x: 355, y: 610 };
const C5: Pt = { x: 540, y: 655 };
const C6: Pt = { x: 540, y: 810 };
const P3: Pt = { x: 335, y: 860 };

const SEGMENTS: [Pt, Pt, Pt, Pt][] = [
  [P0, C1, C2, P1],
  [P1, C3, C4, P2],
  [P2, C5, C6, P3],
];

export const TUBE_D = `M ${P0.x} ${P0.y} `
  + `C ${C1.x} ${C1.y} ${C2.x} ${C2.y} ${P1.x} ${P1.y} `
  + `C ${C3.x} ${C3.y} ${C4.x} ${C4.y} ${P2.x} ${P2.y} `
  + `C ${C5.x} ${C5.y} ${C6.x} ${C6.y} ${P3.x} ${P3.y}`;

/** 관 옆(오른쪽 위)에 라벨을 붙이는 기본 앵커 - viewBox 좌표계 */
export const GUT_LABEL_PT: Pt = { x: 500, y: 200 };

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

/** 관 중심선 위 t(0~1) 지점의 좌표 + 진행 방향(도, atan2 규약)을 viewBox 좌표계로 반환 */
export function gutPointAt(t: number): { x: number; y: number; angle: number } {
  const tt = clamp01(t);
  const idx = Math.min(SEGMENTS.length - 1, Math.floor(tt * SEGMENTS.length));
  const localT = tt * SEGMENTS.length - idx;
  const [p0, p1, p2, p3] = SEGMENTS[idx];
  const p = cubicPoint(localT, p0, p1, p2, p3);
  const d = cubicTangent(localT, p0, p1, p2, p3);
  return { x: p.x, y: p.y, angle: (Math.atan2(d.y, d.x) * 180) / Math.PI };
}

const mod1 = (v: number) => v - Math.floor(v);
const edgeFade = (t: number, margin = 0.06) => Math.min(1, t / margin, (1 - t) / margin);

/** 관을 훑는 단순한 빗자루(손잡이 + 사다리꼴 솔 + 솔 결 3가닥). Tabler에 broom 아이콘이 없어
 *  채널 스타일(굵은 선, 단순 도형)로 직접 그렸다 - 청소·쓸어내기 동작 전반 재사용 가능하도록
 *  독립 export한다. `angle`은 손잡이->솔 방향(atan2 규약, 90=아래쪽)을 기준으로 회전시킨다. */
export interface BroomIconProps {
  x: number;
  y: number;
  size: number;
  angle?: number;
  color?: string;
  headColor?: string;
  style?: React.CSSProperties;
}
export const BroomIcon: React.FC<BroomIconProps> = ({
  x, y, size, angle = 90, color = C.ink, headColor = C.gold, style,
}) => (
  <svg
    width={size} height={size} viewBox="0 0 100 100"
    style={{
      position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible',
      transform: `rotate(${angle - 90}deg)`, transformOrigin: '50% 50%', ...style,
    }}
  >
    <line x1={50} y1={8} x2={50} y2={54} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <path d="M 34 54 L 66 54 L 74 90 L 26 90 Z" fill={headColor} stroke={color} strokeWidth={5} strokeLinejoin="round" />
    <line x1={41} y1={59} x2={35} y2={91} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={50} y1={59} x2={50} y2={93} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <line x1={59} y1={59} x2={65} y2={91} stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const CONTENTS = [
  { baseT: 0.07, r: 36, kind: 'food' as const },
  { baseT: 0.16, r: 24, kind: 'gas' as const },
  { baseT: 0.25, r: 28, kind: 'liquid' as const },
];

export interface GutTubeDiagramProps {
  width: number;
  x: number;
  y: number;
  flowT?: number;
  waveAmp?: number;
  contentsT?: number;
  sweepT?: number;
  echoGlowT?: number;
  stroke?: string;
  tubeColor?: string;
  foodColor?: string;
  gasColor?: string;
  liquidColor?: string;
  style?: React.CSSProperties;
}

export const GutTubeDiagram: React.FC<GutTubeDiagramProps> = ({
  width, x, y,
  flowT = 0, waveAmp = 0, contentsT = 0, sweepT, echoGlowT,
  stroke = C.ink, tubeColor = C.coralSoft,
  foodColor = C.gold, gasColor = C.paper, liquidColor = C.waterCool,
  style,
}) => {
  const scale = width / GUT_VB_W;
  const height = GUT_VB_H * scale;

  const bandT = mod1(flowT);
  const amp = clamp01(waveAmp);
  const cT = clamp01(contentsT);
  const tubeStroke = 132;

  const bandPt = gutPointAt(bandT);
  const bandRot = bandPt.angle + 90;
  const bandLen = tubeStroke * (1.30 + 0.34 * amp);
  const bandThick = tubeStroke * (0.34 + 0.30 * amp);

  const sweep = sweepT === undefined ? null : clamp01(sweepT);
  const sweepPt = sweep === null ? null : gutPointAt(0.05 + sweep * 0.80);
  // BroomIcon은 자기 자신이 <svg style={position:absolute}> 를 그리는 컴포넌트다. HTML
  // div 안에서는 그 CSS로 잘 배치되지만, 부모가 이미 <svg> 인 경우 중첩 <svg> 자식에는
  // position:absolute 가 적용되지 않고 원점(0,0) 근처에 그대로 눌러앉는다(실측 버그,
  // general-ep34 s5 - 관을 따라 움직여야 할 빗자루가 sweepT 값과 무관하게 항상 관 시작점
  // 근처에 고정되어 있었다). 그래서 BroomIcon은 이 <svg> 안이 아니라 바깥(형제)에서
  // 화면 절대좌표로 그린다.
  const sweepScreenPt = sweepPt ? { x: x + sweepPt.x * scale, y: y + sweepPt.y * scale, angle: sweepPt.angle } : null;

  const glow = echoGlowT === undefined ? 0 : clamp01(echoGlowT);

  const colorFor = (kind: string) => (kind === 'food' ? foodColor : kind === 'gas' ? gasColor : liquidColor);

  return (
    <>
    <svg
      width={width} height={height} viewBox={`0 0 ${GUT_VB_W} ${GUT_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {glow > 0.001 && (
        <path
          d={TUBE_D} fill="none" stroke={C.coral} strokeWidth={tubeStroke * 1.22}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.30 * glow}
        />
      )}

      {/* 관 본체 - 굵은 외곽선(ink) 위에 조금 얇은 채움(tubeColor)을 덮어 테두리만 남긴다 */}
      <path
        d={TUBE_D} fill="none" stroke={stroke} strokeWidth={tubeStroke + 14}
        strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d={TUBE_D} fill="none" stroke={tubeColor} strokeWidth={tubeStroke}
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* 내용물(음식/가스/물) - 큰 원 3개만, 흐름을 따라 천천히 이동하며 이음매에서 페이드 */}
      {cT > 0.001 && CONTENTS.map((c, i) => {
        const raw = c.baseT + flowT * 0.16;
        const t = mod1(raw);
        const p = gutPointAt(t);
        const op = cT * edgeFade(t);
        if (op <= 0.01) return null;
        return (
          <g key={c.kind} style={{ opacity: op }}>
            <circle
              cx={p.x} cy={p.y} r={c.r} fill={colorFor(c.kind)} stroke={stroke}
              strokeWidth={SW_THIN * 0.65}
              opacity={c.kind === 'gas' ? 0.75 : 1}
            />
            <circle cx={p.x - c.r * 0.3} cy={p.y - c.r * 0.3} r={c.r * 0.26} fill="#FFFFFF" opacity={0.45} />
          </g>
        );
      })}

      {/* 근육 수축 밴드 - 관을 따라 반복 이동하는 "물결" */}
      {amp > 0.001 && (
        <g transform={`translate(${bandPt.x} ${bandPt.y}) rotate(${bandRot})`}>
          <rect
            x={-bandThick / 2} y={-bandLen / 2} width={bandThick} height={bandLen} rx={bandThick / 2}
            fill={C.coral} opacity={0.5 + 0.35 * amp}
          />
        </g>
      )}

    </svg>
    {sweepScreenPt && sweep !== null && sweep > 0.001 && sweep < 0.999 && (
      <BroomIcon x={sweepScreenPt.x} y={sweepScreenPt.y} size={150 * scale} angle={sweepScreenPt.angle} />
    )}
    </>
  );
};

export default GutTubeDiagram;
