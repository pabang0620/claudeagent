/** "밀폐된 용기 안에서 압력이 올라가면 물이 끓는 온도(끓는점)도 같이 올라간다"는 인과와,
 *  그 인과를 실제로 이용하는 압력밥솥(압력↑ -> 끓는점↑ -> 더 뜨거운 물로 빨리 익힘) +
 *  반대 사례인 높은 산(압력↓ -> 끓는점↓ -> 설익음)까지 한 파일에서 다루는 다이어그램
 *  (압력밥솥이 밥을 빨리 익히는 이유, general-ep79).
 *
 *  REGISTRY 확인 완료 - `MicrowaveDiagram`/`PlateFoodIcon`(general-ep31, 가전제품+온도
 *  변화)과 `FridgeCycleDiagram`(general-ep68, 밀폐 용기 안 압력·상태 변화)을 먼저 검토했으나
 *  둘 다 "압력이 오르면 끓는점도 같이 오른다"는 압력-온도 상관관계 자체와 그래프 형태의
 *  표현은 다루지 않아 새로 만들었다.
 *
 *  `PalmSweatDiagram`과 같은 원칙으로 `mode`(`'graph'|'cooker'|'altitude'|'bowl'`) 하나에
 *  시각적으로 전혀 다른 4개 화면을 묶는다 - 4개 화면이 같은 압력-끓는점 상관관계를 다른
 *  각도(그래프/압력밥솥 단면/높은 산 대조/완성된 밥)에서 보여주기 때문에 한 파일에 두는 것이
 *  다음 화에서 "압력-온도 관계"를 다시 쓸 때 찾기 쉽다.
 *
 *  이 컴포넌트는 텍스트를 전혀 그리지 않는다(숫자 "100"만 예외 - 원칙 6 "숫자만 있는
 *  그래픽은 언어 무관"에 해당). 화면 문구는 호출 씬이 아래 export 된 앵커 포인트
 *  (`PB_LOW_PT`/`PB_HIGH_PT` 등)에 `Label`을 얹어 strings.ts 문구로 그린다
 *  (`HairFollicleDiagram`/`FridgeCycleDiagram`과 동일한 관례).
 *
 *  채널 원칙(작은 점을 여러 개 뿌리지 않는다)에 따라 기포는 큰 원 2개까지만, 쌀알은 큰
 *  타원 3~6개까지만 그린다. 밥솥·냄비·산은 전부 단순한 형태로 그린다(오케스트레이터 지시).
 *
 *  mode='graph' - 압력(x) vs 끓는점(y) 상관관계.
 *    `axisProgress`  (0~1, 축+100도 기준선+대각 상관선 dash reveal, s2)
 *    `markersProgress` (0~1, axisProgress=1 전제 - 낮은/높은 압력 지점 2개가 각각 축까지
 *      점선 드롭라인과 함께 팝인, s2)
 *    `pressureProgress` (0~1, 독립 - 왼쪽 압력 화살표가 위로 자라는 동안 대각선 위를 따라
 *      강조 점이 낮은 지점->높은 지점으로 같이 이동한다. "압력이 오르면 끓는점도 같이
 *      오른다"는 애니메이션, s3)
 *  mode='cooker' - 압력밥솥 단면.
 *    `revealProgress` (0~1, 냄비 몸통+물+쌀알 등장, 기본 1)
 *    `sealProgress`   (0~1, 뚜껑이 내려와 밀폐되며 틈으로 새던 증기가 멎고 뚜껑 위 압력
 *      게이지 바늘이 올라감, s4)
 *    `overboilProgress` (0~1, sealProgress=1 전제 - 옆 온도계가 "100" 눈금을 넘어 계속
 *      오르고 쌀알이 옅은 생쌀색에서 윤기나는 흰색으로 바뀜, s5)
 *  mode='altitude' - 높은 산 대조 사례(반대 방향).
 *    `altitudeProgress` (0~1, 산이 솟아오르며 압력 게이지 바늘이 낮은 쪽으로 내려가고,
 *      옆 냄비 온도계는 "100" 눈금 아래에 머물며 기포가 오르고, 쌀알은 생쌀색 그대로 남아
 *      "설익음"을 보여줌, s6)
 *  mode='bowl' - 완성된 밥 클로즈업.
 *    `bowlProgress` (0~1, 그릇+윤기나는 밥알이 팝인하고 김 두 가닥이 옅게 피어오름, s7)
 *
 *  `f`(선택, 기본 0)는 기포·김·게이지 바늘의 은은한 맥동에만 쓴다(Math.random 미사용,
 *  원칙 3).
 *
 *  "밀폐 공간의 압력이 오르면 그 안의 어떤 물리량(끓는점 등)도 같이 오르고, 압력이 내리면
 *  반대로 내린다"는 대조 구조를 갖는 다른 소재(고산병, 진공 조리, 압력솥 계열 조리기구
 *  전반) 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const PRESSURE_VB_W = 720;
export const PRESSURE_VB_H = 820;

/* 앵커 포인트(뷰박스 좌표) - 호출 씬이 Label 을 얹을 때 쓴다.
 *   scale = width / PRESSURE_VB_W
 *   screenX = x + pt.x * scale, screenY = y + pt.y * scale */
export const PB_AXIS_PRESSURE_PT = { x: 610, y: 706 };
export const PB_AXIS_BOIL_PT = { x: 70, y: 116 };
export const PB_LOW_PT = { x: 176, y: 606 };
export const PB_HIGH_PT = { x: 556, y: 190 };
export const PB_GAUGE_PT = { x: 470, y: 214 };
export const PB_THERMO_PT = { x: 40, y: 300 };
export const PB_MOUNTAIN_PT = { x: 470, y: 250 };
export const PB_ALT_THERMO_PT = { x: 560, y: 470 };

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lerpColor(a: string, b: string, t: number) {
  const k = clamp01(t);
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * k);
  const g = Math.round(pa.g + (pb.g - pa.g) * k);
  const bl = Math.round(pa.b + (pb.b - pa.b) * k);
  return `rgb(${r},${g},${bl})`;
}

/** 쌀알 - 큰 타원 하나. glossy=true면 왼쪽 위에 작은 하이라이트를 더해 "윤기"를 표현 */
const RiceGrain: React.FC<{
  cx: number; cy: number; w: number; h: number; rot?: number; fill: string; stroke: string; glossy?: boolean;
}> = ({ cx, cy, w, h, rot = 0, fill, stroke, glossy }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={w / 2} ry={h / 2} fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.4} />
    {glossy ? <ellipse cx={-w * 0.16} cy={-h * 0.18} rx={w * 0.15} ry={h * 0.11} fill={C.paper} opacity={0.85} /> : null}
  </g>
);

/** 원형 압력 게이지 - 바늘 각도(deg, 0=정오, 음수=반시계/낮음, 양수=시계/높음) */
const PressureDial: React.FC<{
  cx: number; cy: number; r: number; angleDeg: number; opacity: number; stroke: string; needleColor: string;
}> = ({ cx, cy, r, angleDeg, opacity, stroke, needleColor }) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={r} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.75} />
    <line
      x1={cx} y1={cy} x2={cx} y2={cy - r * 0.68}
      stroke={needleColor} strokeWidth={9} strokeLinecap="round"
      transform={`rotate(${angleDeg} ${cx} ${cy})`}
    />
    <circle cx={cx} cy={cy} r={9} fill={needleColor} />
  </g>
);

/** 세로 온도계 - level 0(아래, 차가움)~1(위, 뜨거움). markAt 위치에 "100" 눈금선을 긋는다 */
const MiniThermo: React.FC<{
  cx: number; topY: number; height: number; level: number; markAt: number; color: string; stroke: string;
}> = ({ cx, topY, height, level, markAt, color, stroke }) => {
  const stemW = 24;
  const bulbR = 19;
  const bottomY = topY + height;
  const lv = clamp01(level);
  const fillH = height * lv;
  const fillTopY = bottomY - fillH;
  const markY = bottomY - height * clamp01(markAt);
  return (
    <g>
      <rect x={cx - stemW / 2} y={topY} width={stemW} height={height} rx={stemW / 2} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.65} />
      <circle cx={cx} cy={bottomY + bulbR * 0.5} r={bulbR} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.65} />
      {fillH > 0.5 ? (
        <rect x={cx - stemW / 2 + 4} y={fillTopY} width={stemW - 8} height={fillH} rx={(stemW - 8) / 2} fill={color} />
      ) : null}
      <circle cx={cx} cy={bottomY + bulbR * 0.5} r={bulbR - 6} fill={color} />
      {/* "100" 기준 눈금 - 숫자만이라 언어 무관(원칙 6) */}
      <line x1={cx + stemW / 2 - 2} y1={markY} x2={cx + stemW / 2 + 22} y2={markY} stroke={stroke} strokeWidth={SW_THIN * 0.55} strokeLinecap="round" />
      <text x={cx + stemW / 2 + 28} y={markY + 11} style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: 26, fill: stroke }}>100</text>
    </g>
  );
};

/** 큰 기포 하나(점 무리 대신) */
const Bubble: React.FC<{ cx: number; cy: number; r: number; opacity: number; stroke: string }> = ({ cx, cy, r, opacity, stroke }) => (
  <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.5} opacity={opacity} />
);

export interface PressureBoilingDiagramProps {
  mode: 'graph' | 'cooker' | 'altitude' | 'bowl';
  width: number;
  x?: number;
  y?: number;
  f?: number;
  /* graph */
  axisProgress?: number;
  markersProgress?: number;
  pressureProgress?: number;
  /* cooker */
  revealProgress?: number;
  sealProgress?: number;
  overboilProgress?: number;
  /* altitude */
  altitudeProgress?: number;
  /* bowl */
  bowlProgress?: number;
  stroke?: string;
  potColor?: string;
  lidColor?: string;
  waterColor?: string;
  riceRawColor?: string;
  riceCookedColor?: string;
  coldColor?: string;
  hotColor?: string;
  style?: React.CSSProperties;
}

export const PressureBoilingDiagram: React.FC<PressureBoilingDiagramProps> = ({
  mode, width, x = 0, y = 0, f = 0,
  axisProgress = 0, markersProgress = 0, pressureProgress = 0,
  revealProgress = 1, sealProgress = 0, overboilProgress = 0,
  altitudeProgress = 0, bowlProgress = 0,
  stroke = C.ink, potColor = C.paper, lidColor = C.room, waterColor = C.waterCool,
  riceRawColor = C.browningSoft, riceCookedColor = C.paper,
  coldColor = C.waterCool, hotColor = C.coral, style,
}) => {
  const height = (width * PRESSURE_VB_H) / PRESSURE_VB_W;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${PRESSURE_VB_W} ${PRESSURE_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        {mode === 'graph' ? (() => {
          const axisA = clamp01(axisProgress);
          const markA = clamp01(markersProgress);
          const presA = clamp01(pressureProgress);
          const AX_X0 = 100; const AX_X1 = 640;
          const AX_Y0 = 700; const AX_Y1 = 130;
          const BASE_Y = 400;
          const low = PB_LOW_PT;
          const high = PB_HIGH_PT;
          const lineLen = Math.hypot(high.x - low.x, high.y - low.y);
          const dot = { x: low.x + (high.x - low.x) * presA, y: low.y + (high.y - low.y) * presA };
          const arrowTopY = AX_Y0 - (AX_Y0 - AX_Y1) * 0.72 * presA;
          return (
            <g opacity={axisA}>
              {/* 축 */}
              <line x1={AX_X0} y1={AX_Y0} x2={AX_X1} y2={AX_Y0} stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
              <line x1={AX_X0} y1={AX_Y0} x2={AX_X0} y2={AX_Y1} stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
              <path d={`M ${AX_X1 - 4} ${AX_Y0 - 16} L ${AX_X1 + 18} ${AX_Y0} L ${AX_X1 - 4} ${AX_Y0 + 16}`} fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${AX_X0 - 16} ${AX_Y1 + 4} L ${AX_X0} ${AX_Y1 - 18} L ${AX_X0 + 16} ${AX_Y1 + 4}`} fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round" />

              {/* 100도 기준선 */}
              <line x1={AX_X0} y1={BASE_Y} x2={AX_X1} y2={BASE_Y} stroke={C.inkSoft} strokeWidth={SW_THIN * 0.6} strokeDasharray="12 10" />
              <text x={AX_X0 - 14} y={BASE_Y + 10} textAnchor="end" style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: 28, fill: C.inkSoft }}>100</text>

              {/* 상관선 (dash reveal) */}
              <path
                d={`M ${low.x} ${low.y} L ${high.x} ${high.y}`} fill="none" stroke={stroke} strokeWidth={SW}
                strokeLinecap="round" strokeDasharray={lineLen} strokeDashoffset={lineLen * (1 - axisA)}
              />

              {/* 낮은/높은 지점 마커 (s2) */}
              {markA > 0.02 ? (
                <g opacity={markA}>
                  <line x1={low.x} y1={low.y} x2={low.x} y2={AX_Y0} stroke={coldColor} strokeWidth={SW_THIN * 0.55} strokeDasharray="8 8" />
                  <line x1={low.x} y1={low.y} x2={AX_X0} y2={low.y} stroke={coldColor} strokeWidth={SW_THIN * 0.55} strokeDasharray="8 8" />
                  <circle cx={low.x} cy={low.y} r={16} fill={coldColor} stroke={stroke} strokeWidth={SW_THIN * 0.5} />

                  <line x1={high.x} y1={high.y} x2={high.x} y2={AX_Y0} stroke={hotColor} strokeWidth={SW_THIN * 0.55} strokeDasharray="8 8" />
                  <line x1={high.x} y1={high.y} x2={AX_X0} y2={high.y} stroke={hotColor} strokeWidth={SW_THIN * 0.55} strokeDasharray="8 8" />
                  <circle cx={high.x} cy={high.y} r={16} fill={hotColor} stroke={stroke} strokeWidth={SW_THIN * 0.5} />
                </g>
              ) : null}

              {/* 압력 화살표 + 이동하는 강조 점 (s3) */}
              {presA > 0.02 ? (
                <g>
                  <line x1={56} y1={AX_Y0} x2={56} y2={arrowTopY} stroke={hotColor} strokeWidth={16} strokeLinecap="round" />
                  <path d={`M 40 ${arrowTopY + 14} L 56 ${arrowTopY - 10} L 72 ${arrowTopY + 14}`} fill="none" stroke={hotColor} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={dot.x} cy={dot.y} r={20} fill={hotColor} stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={0.5 + 0.5 * Math.sin(f / 6)} />
                  <circle cx={dot.x} cy={dot.y} r={11} fill={hotColor} />
                </g>
              ) : null}
            </g>
          );
        })() : null}

        {mode === 'cooker' ? (() => {
          const revA = smooth(revealProgress);
          const sealA = clamp01(sealProgress);
          const overA = clamp01(overboilProgress);
          const POT_X = 200; const POT_W = 320;
          const POT_TOP = 420; const POT_H = 260;
          const LID_CLOSED_Y = POT_TOP - 46;
          const LID_OPEN_Y = LID_CLOSED_Y - 84;
          const lidY = LID_OPEN_Y + (LID_CLOSED_Y - LID_OPEN_Y) * smooth(sealA);
          const gap = LID_CLOSED_Y - lidY;
          const grainColor = lerpColor(riceRawColor, riceCookedColor, overA);
          const grains: [number, number, number][] = [[-42, 0, -8], [10, -14, 6], [52, 6, -14]];
          const thermoLevel = 0.5 + 0.5 * smooth(overA);
          const thermoColor = lerpColor(coldColor, hotColor, overA);
          return (
            <g opacity={revA}>
              {/* 온도계 (overboilProgress) */}
              {overA > 0.01 ? (
                <MiniThermo cx={40} topY={300} height={170} level={thermoLevel} markAt={0.5} color={thermoColor} stroke={stroke} />
              ) : null}

              {/* 냄비 몸통 */}
              <path
                d={`M ${POT_X} ${POT_TOP} L ${POT_X - 14} ${POT_TOP + POT_H} Q ${POT_X - 14} ${POT_TOP + POT_H + 30} ${POT_X + 30} ${POT_TOP + POT_H + 30} L ${POT_X + POT_W - 30} ${POT_TOP + POT_H + 30} Q ${POT_X + POT_W + 14} ${POT_TOP + POT_H + 30} ${POT_X + POT_W + 14} ${POT_TOP + POT_H} L ${POT_X + POT_W} ${POT_TOP} Z`}
                fill={potColor} stroke={stroke} strokeWidth={SW}
              />
              {/* 손잡이 2개 */}
              <rect x={POT_X - 46} y={POT_TOP + 40} width={40} height={22} rx={11} fill={potColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
              <rect x={POT_X + POT_W + 6} y={POT_TOP + 40} width={40} height={22} rx={11} fill={potColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
              {/* 물 */}
              <path
                d={`M ${POT_X + 8} ${POT_TOP + POT_H - 60} L ${POT_X + POT_W - 8} ${POT_TOP + POT_H - 60} L ${POT_X + POT_W - 20} ${POT_TOP + POT_H + 10} Q ${POT_X + POT_W / 2} ${POT_TOP + POT_H + 26} ${POT_X + 20} ${POT_TOP + POT_H + 10} Z`}
                fill={waterColor} opacity={0.55}
              />
              {/* 쌀알 3개 */}
              {grains.map((g, i) => (
                <RiceGrain
                  key={i} cx={POT_X + POT_W / 2 + g[0]} cy={POT_TOP + POT_H - 34 + g[1]} w={46} h={30} rot={g[2]}
                  fill={grainColor} stroke={stroke} glossy={overA > 0.55}
                />
              ))}

              {/* 뚜껑 밑 틈으로 새는 증기 (밀폐 전) */}
              {gap > 10 ? (
                <g opacity={clamp01((gap - 10) / 40)}>
                  <path
                    d={`M ${POT_X + 60} ${lidY - 10} q 14 -20 0 -40 q -14 -20 0 -40`}
                    fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.6} strokeLinecap="round"
                  />
                  <path
                    d={`M ${POT_X + POT_W - 60} ${lidY - 10} q -14 -20 0 -40 q 14 -20 0 -40`}
                    fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.6} strokeLinecap="round"
                  />
                </g>
              ) : null}

              {/* 뚜껑 */}
              <path
                d={`M ${POT_X - 20} ${lidY} Q ${POT_X + POT_W / 2} ${lidY - 70} ${POT_X + POT_W + 20} ${lidY} Z`}
                fill={lidColor} stroke={stroke} strokeWidth={SW}
              />
              <rect x={POT_X - 20} y={lidY - 12} width={POT_W + 40} height={20} rx={10} fill={lidColor} stroke={stroke} strokeWidth={SW_THIN} />

              {/* 밀폐 클립 (sealProgress 후반) */}
              {sealA > 0.6 ? (
                <g opacity={clamp01((sealA - 0.6) / 0.4)}>
                  <rect x={POT_X - 34} y={LID_CLOSED_Y - 4} width={26} height={44} rx={8} fill={C.ink} />
                  <rect x={POT_X + POT_W + 8} y={LID_CLOSED_Y - 4} width={26} height={44} rx={8} fill={C.ink} />
                </g>
              ) : null}

              {/* 압력 게이지 */}
              <PressureDial
                cx={POT_X + POT_W / 2} cy={lidY - 70} r={30}
                angleDeg={-60 + 120 * smooth(sealA)} opacity={smooth(clamp01(sealA * 1.3))}
                stroke={stroke} needleColor={hotColor}
              />
            </g>
          );
        })() : null}

        {mode === 'altitude' ? (() => {
          const altA = clamp01(altitudeProgress);
          const grow = smooth(altA);
          const bubbleP1 = ((f * 0.01) % 1 + 1) % 1;
          const bubbleP2 = ((f * 0.01 + 0.5) % 1 + 1) % 1;
          const potX = 300; const potW = 200; const potTop = 480; const potH = 130;
          const grains: [number, number, number][] = [[-30, 0, -8], [8, -10, 10], [34, 4, -16]];
          return (
            <g opacity={0.3 + 0.7 * grow}>
              {/* 산 */}
              <path
                d={`M 60 ${700} L 300 ${230 + (1 - grow) * 120} L 420 ${380} L 560 ${180 + (1 - grow) * 140} L 660 ${700} Z`}
                fill={C.hillFar} stroke={stroke} strokeWidth={SW}
              />
              <path d={`M 300 ${230 + (1 - grow) * 120} L 340 300 L 262 300 Z`} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
              <path d={`M 560 ${180 + (1 - grow) * 140} L 596 250 L 524 250 Z`} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.7} />

              {/* 저기압 게이지 */}
              <PressureDial cx={560} cy={470} r={30} angleDeg={-55 * grow} opacity={0.85 * grow} stroke={stroke} needleColor={coldColor} />

              {/* 작은 냄비 (뚜껑 없음) */}
              <path
                d={`M ${potX} ${potTop} L ${potX - 10} ${potTop + potH} Q ${potX - 10} ${potTop + potH + 22} ${potX + 22} ${potTop + potH + 22} L ${potX + potW - 22} ${potTop + potH + 22} Q ${potX + potW + 10} ${potTop + potH + 22} ${potX + potW + 10} ${potTop + potH} L ${potX + potW} ${potTop} Z`}
                fill={potColor} stroke={stroke} strokeWidth={SW}
              />
              <path
                d={`M ${potX + 6} ${potTop + potH - 44} L ${potX + potW - 6} ${potTop + potH - 44} L ${potX + potW - 16} ${potTop + potH + 6} Q ${potX + potW / 2} ${potTop + potH + 18} ${potX + 16} ${potTop + potH + 6} Z`}
                fill={waterColor} opacity={0.5}
              />
              {grains.map((g, i) => (
                <RiceGrain
                  key={i} cx={potX + potW / 2 + g[0]} cy={potTop + potH - 24 + g[1]} w={36} h={24} rot={g[2]}
                  fill={riceRawColor} stroke={stroke}
                />
              ))}
              {altA > 0.15 ? (
                <>
                  <Bubble cx={potX + potW * 0.4} cy={potTop + potH - 20 - bubbleP1 * 70} r={10} opacity={altA * (1 - bubbleP1) * 0.8} stroke={stroke} />
                  <Bubble cx={potX + potW * 0.62} cy={potTop + potH - 10 - bubbleP2 * 70} r={8} opacity={altA * (1 - bubbleP2) * 0.8} stroke={stroke} />
                </>
              ) : null}

              {/* 온도계 - 100도 아래에 머무름 */}
              <MiniThermo cx={230} topY={410} height={150} level={0.5 - 0.3 * grow} markAt={0.5} color={coldColor} stroke={stroke} />
            </g>
          );
        })() : null}

        {mode === 'bowl' ? (() => {
          const bowlA = clamp01(bowlProgress);
          const grow = smooth(bowlA);
          const cx = PRESSURE_VB_W / 2; const bowlY = 520; const bowlW = 380; const bowlH = 120;
          const grains: [number, number, number][] = [
            [-90, -46, -10], [-30, -66, 6], [40, -60, -14], [90, -40, 10],
            [-10, -30, 0], [-56, -10, 12], [50, -14, -8],
          ];
          return (
            <g opacity={0.3 + 0.7 * grow} transform={`translate(${cx} ${bowlY}) scale(${0.82 + 0.18 * grow}) translate(${-cx} ${-bowlY})`}>
              <path
                d={`M ${cx - bowlW / 2} ${bowlY} Q ${cx} ${bowlY + bowlH} ${cx + bowlW / 2} ${bowlY} L ${cx + bowlW / 2 + 10} ${bowlY - 12} L ${cx - bowlW / 2 - 10} ${bowlY - 12} Z`}
                fill={potColor} stroke={stroke} strokeWidth={SW}
              />
              {grains.map((g, i) => (
                <RiceGrain key={i} cx={cx + g[0]} cy={bowlY - 30 + g[1]} w={54} h={34} rot={g[2]} fill={riceCookedColor} stroke={stroke} glossy />
              ))}
              {/* 김 두 가닥 */}
              <path
                d={`M ${cx - 60} ${bowlY - 90} q 18 -30 0 -60 q -18 -30 0 -60`}
                fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.6} strokeLinecap="round"
                opacity={0.5 * bowlA * (0.6 + 0.4 * Math.sin(f / 8))}
              />
              <path
                d={`M ${cx + 60} ${bowlY - 90} q -18 -30 0 -60 q 18 -30 0 -60`}
                fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.6} strokeLinecap="round"
                opacity={0.5 * bowlA * (0.6 + 0.4 * Math.sin(f / 8 + 2))}
              />
            </g>
          );
        })() : null}
      </svg>
    </div>
  );
};

export default PressureBoilingDiagram;
