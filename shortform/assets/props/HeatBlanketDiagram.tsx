/** "대기 중 수증기·구름이 지표의 열을 담요처럼 붙잡아 낮과 밤의 기온 차이를 줄여주는데,
 *  사막은 그 수증기가 거의 없어서 낮엔 열이 그대로 들어오고 밤엔 그대로 빠져나간다"는
 *  인과를 보여주는 대기 단면도(사막이 낮엔 뜨겁고 밤엔 추운 이유, general-ep74).
 *
 *  FogLayerDiagram(general-ep66)과 같은 설계 원칙(독립 레이어, undefined면 그 레이어는
 *  그리지 않는다 / 뿌연 안개는 낮은 채도의 넓은 면 + 큰 물결선 2~3가닥만, 점을 뿌리지
 *  않는다)을 계승했다. FogLayerDiagram은 안개가 "지표에 낮게 깔리는" 그림이라 언덕
 *  바로 위에 haze band를 그렸지만, 이 화는 "하늘 전체에 걸친 수증기층이 담요처럼 지표를
 *  덮는다"는 게 요지라 band를 하늘 중간에 가로로 넓게 걸쳐 그린다 - 그 위(우주 쪽)엔
 *  해/달, 그 아래(지표 쪽)엔 땅이 있고, 화살표는 이 band를 뚫고 땅과 하늘 사이를 오간다.
 *
 *  독립 레이어(전부 undefined면 하늘+땅 실루엣만 있는 정지 배경이 된다):
 *   - blanketProgress : 0~1. 정상(습한) 상태 - band 자리에 옅은 황금빛 뿌연 면(수증기)이
 *     꽉 차서 나타나고, band 아래쪽에서 위로 향하다 다시 아래로 휘어 돌아오는 작은 곡선
 *     화살표 1개("붙잡힌 열이 빠져나가지 못하고 다시 되돌아온다")가 함께 페이드인한다.
 *   - dryProgress     : 0~1. 사막(건조) 상태 - 같은 band 자리를 점선 윤곽선만으로 그려
 *     "원래 있어야 할 자리인데 비어 있다"를 보여주고, 우측 상단에 작은 배지(물방울+대각선
 *     X)를 띄운다. blanketProgress와 동시에 켜지 않는 것을 전제로 한다(같은 화면에 두면
 *     서로 겹쳐 혼란스럽다 - 호출 씬에서 상태별로 하나만 넘긴다).
 *   - dayHeatIn       : 0~1. 해에서 band 자리(비어 있음을 전제)를 그대로 뚫고 땅까지
 *     내리꽂히는 굵은 화살표 3개 + 땅·지표 공기색이 따뜻한 톤으로 물든다.
 *   - nightHeatOut    : 0~1. 땅에서 band 자리를 그대로 뚫고 화면 위로 빠져나가는 굵은
 *     화살표 3개 + 땅·지표 공기색이 차가운 톤으로 물든다.
 *
 *  "대기 중 보온층의 유무가 지표 열의 출입을 좌우한다"는 구조를 갖는 다른 기상 소재
 *  전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const HEAT_VB_W = 900;
export const HEAT_VB_H = 700;

const GROUND_Y = 560;
const BAND_CY = 250;
const BAND_H = 130;
const BAND_W = HEAT_VB_W * 0.86;
const BAND_CX = HEAT_VB_W / 2;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

const GROUND_D = `M 0 ${GROUND_Y + 30} Q ${HEAT_VB_W * 0.26} ${GROUND_Y - 24} ${HEAT_VB_W * 0.52} `
  + `${GROUND_Y + 10} Q ${HEAT_VB_W * 0.78} ${GROUND_Y + 44} ${HEAT_VB_W} ${GROUND_Y - 6} `
  + `L ${HEAT_VB_W} ${HEAT_VB_H} L 0 ${HEAT_VB_H} Z`;

/** 안개 물결선 위치(고정, Math.random 미사용 - 원칙 3). FogLayerDiagram.HAZE_WISPS와 동일 정신 */
const BAND_WISPS = [
  { dx: -0.28, delay: 0, hFrac: 0.18 },
  { dx: 0.02, delay: 8, hFrac: 0.22 },
  { dx: 0.3, delay: 4, hFrac: 0.16 },
];

/** 화살표 x 위치 3개(band 폭 안에서 고정 배치, Math.random 미사용) */
const ARROW_XS = [BAND_CX - BAND_W * 0.28, BAND_CX, BAND_CX + BAND_W * 0.28];

function lerp3(hexA: string, hexB: string, t: number): string {
  const c = clamp01(t);
  const pa = hexToRgb(hexA);
  const pb = hexToRgb(hexB);
  const r = Math.round(pa.r + (pb.r - pa.r) * c);
  const g = Math.round(pa.g + (pb.g - pa.g) * c);
  const b = Math.round(pa.b + (pb.b - pa.b) * c);
  return `rgb(${r}, ${g}, ${b})`;
}
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

export interface HeatBlanketDiagramProps {
  /** 씬 로컬 프레임. band 물결선의 살랑거림과 화살표 흐름 표시에만 쓴다(옵션, 기본 0=정지) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 하늘 톤(해/달). 기본 false(낮) */
  night?: boolean;
  blanketProgress?: number;
  dryProgress?: number;
  dayHeatIn?: number;
  nightHeatOut?: number;
  stroke?: string;
  skyColor?: string;
  groundWarmColor?: string;
  groundCoolColor?: string;
  groundNeutralColor?: string;
  bandColor?: string;
  bandAccent?: string;
  hotArrowColor?: string;
  coldArrowColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const HeatBlanketDiagram: React.FC<HeatBlanketDiagramProps> = ({
  f = 0, width, x = 0, y = 0, night = false,
  blanketProgress, dryProgress, dayHeatIn, nightHeatOut,
  stroke = C.ink,
  skyColor,
  groundWarmColor = C.coral, groundCoolColor = C.waterCool, groundNeutralColor = C.browningSoft,
  bandColor = C.goldSoft, bandAccent = C.gold,
  hotArrowColor = C.coral, coldArrowColor = C.waterCool,
  strokeWidth = SW, style,
}) => {
  const height = width * (HEAT_VB_H / HEAT_VB_W);

  const sky = skyColor ?? (night ? C.night : C.sky);
  const blanketT = blanketProgress !== undefined ? smooth(clamp01(blanketProgress)) : 0;
  const dryT = dryProgress !== undefined ? smooth(clamp01(dryProgress)) : 0;
  const inT = dayHeatIn !== undefined ? smooth(clamp01(dayHeatIn)) : 0;
  const outT = nightHeatOut !== undefined ? smooth(clamp01(nightHeatOut)) : 0;

  const warmth = dayHeatIn !== undefined ? inT : nightHeatOut !== undefined ? -outT : 0;
  const groundFill = warmth >= 0
    ? lerp3(groundNeutralColor, groundWarmColor, warmth)
    : lerp3(groundNeutralColor, groundCoolColor, -warmth);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${HEAT_VB_W} ${HEAT_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        <rect x={0} y={0} width={HEAT_VB_W} height={HEAT_VB_H} fill={sky} />

        {/* 땅 */}
        <path d={GROUND_D} fill={groundFill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />

        {/* 담요(수증기) 상태 - 정상 대기: band 가득 채운 뿌연 면 + 되돌아오는 곡선 화살표 */}
        {blanketProgress !== undefined && blanketT > 0.02 ? (
          <>
            <rect
              x={BAND_CX - BAND_W / 2} y={BAND_CY - BAND_H / 2} width={BAND_W} height={BAND_H}
              rx={BAND_H * 0.5} fill={bandColor} opacity={Math.min(0.92, blanketT * 1.1)}
              stroke={C.inkSoft} strokeWidth={SW_THIN * 0.8}
            />
            <g
              opacity={Math.min(0.85, blanketT * 1.1)} stroke={bandAccent} strokeWidth={SW_THIN * 1.2}
              fill="none" strokeLinecap="round"
            >
              {BAND_WISPS.map((wsp) => {
                const sway = Math.sin((f + wsp.delay) / 20) * 9;
                const wx = BAND_CX + wsp.dx * BAND_W;
                const wy = BAND_CY + BAND_H * (wsp.hFrac - 0.1);
                const wh = BAND_H * wsp.hFrac;
                return (
                  <path
                    key={wsp.dx}
                    d={`M ${wx - BAND_W * 0.13} ${wy + wh} Q ${wx + sway} ${wy}, ${wx + BAND_W * 0.13} ${wy + wh}`}
                  />
                );
              })}
            </g>
            {blanketT > 0.55 ? (
              <path
                d={`M ${BAND_CX - 20} ${GROUND_Y - 60} Q ${BAND_CX - 60} ${BAND_CY + 40} ${BAND_CX} ${BAND_CY + 6} `
                  + `Q ${BAND_CX + 60} ${BAND_CY - 24} ${BAND_CX + 24} ${GROUND_Y - 72}`}
                fill="none" stroke={groundWarmColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round"
                markerEnd="url(#heatBackArrow)"
                opacity={Math.min(1, (blanketT - 0.55) / 0.35)}
              />
            ) : null}
          </>
        ) : null}

        {/* 담요 부재(건조) 상태 - 사막: band 자리에 점선 윤곽선만 + 배지 */}
        {dryProgress !== undefined && dryT > 0.02 ? (
          <>
            <rect
              x={BAND_CX - BAND_W / 2} y={BAND_CY - BAND_H / 2} width={BAND_W} height={BAND_H}
              rx={BAND_H * 0.5} fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN}
              strokeDasharray="16 14" opacity={dryT}
            />
            <g style={{ opacity: Math.min(1, dryT * 1.3) }} transform={`translate(${HEAT_VB_W - 168} 24)`}>
              <rect x={0} y={0} width={140} height={96} rx={18} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
              <circle cx={70} cy={48} r={20} fill={bandAccent} opacity={0.5} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
              <line x1={20} y1={16} x2={120} y2={80} stroke={C.coral} strokeWidth={SW_THIN * 1.4} strokeLinecap="round" />
              <line x1={120} y1={16} x2={20} y2={80} stroke={C.coral} strokeWidth={SW_THIN * 1.4} strokeLinecap="round" />
            </g>
          </>
        ) : null}

        {/* 화살표 정의 - orient="auto"는 이 marker를 "지역좌표에서 그린 그대로"가 아니라
            "path 진행 방향(접선각)만큼 돌려서" 배치한다. 그래서 모양 자체는 항상 오른쪽을
            가리키는 삼각형(뾰족한 끝=refX/refY, 즉 marker가 찍히는 좌표)으로 그려야 한다 -
            "아래로 향하는 화살표"라고 지역좌표에서부터 아래쪽을 가리키게 그리면(이전 버전의
            결함), auto 회전이 한 번 더 걸려 옆으로 눕는다(스틸 선점검에서 실제로 화살촉이
            옆을 향해 발견됨). 세 marker 모두 이 원칙으로 통일했다. */}
        <defs>
          <marker id="heatDownArrow" markerWidth={12} markerHeight={12} refX={10} refY={5} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={hotArrowColor} />
          </marker>
          <marker id="heatUpArrow" markerWidth={12} markerHeight={12} refX={10} refY={5} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill={coldArrowColor} />
          </marker>
          <marker id="heatBackArrow" markerWidth={10} markerHeight={10} refX={8} refY={4} orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 Z" fill={groundWarmColor} />
          </marker>
        </defs>

        {/* 낮: 해 -> 땅으로 그대로 꽂히는 화살표 */}
        {dayHeatIn !== undefined && inT > 0.02 ? (
          <g opacity={inT}>
            {ARROW_XS.map((ax, i) => {
              const topY = 30;
              const botY = GROUND_Y - 14;
              const flow = ((f / 26 + i * 0.34) % 1);
              return (
                <g key={ax}>
                  <line
                    x1={ax} y1={topY} x2={ax} y2={botY}
                    stroke={hotArrowColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" opacity={0.55}
                    markerEnd="url(#heatDownArrow)"
                  />
                  <circle cx={ax} cy={topY + (botY - topY) * flow} r={9} fill={hotArrowColor} />
                </g>
              );
            })}
          </g>
        ) : null}

        {/* 밤: 땅 -> 하늘 위로 그대로 빠져나가는 화살표 */}
        {nightHeatOut !== undefined && outT > 0.02 ? (
          <g opacity={outT}>
            {ARROW_XS.map((ax, i) => {
              const topY = 30;
              const botY = GROUND_Y - 14;
              const flow = ((f / 26 + i * 0.34) % 1);
              return (
                <g key={ax}>
                  <line
                    x1={ax} y1={botY} x2={ax} y2={topY}
                    stroke={coldArrowColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" opacity={0.55}
                    markerEnd="url(#heatUpArrow)"
                  />
                  <circle cx={ax} cy={botY - (botY - topY) * flow} r={9} fill={coldArrowColor} />
                </g>
              );
            })}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default HeatBlanketDiagram;
