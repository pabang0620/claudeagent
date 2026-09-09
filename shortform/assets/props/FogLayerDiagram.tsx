/** "밤사이 식은 지표면이 그 위 공기를 함께 식히고, 차가워진 공기가 수증기를 다 못 붙잡아
 *  아주 작은 물방울로 바뀌는데 이 물방울은 표면에 붙지 않고 공중에 뜬 채로 뭉쳐 안개가
 *  된다"는 인과를 보여주는 다이어그램(새벽에 안개가 자욱해지는 이유, general-ep66).
 *  SaltCycleDiagram·CloudFloatDiagram과 같은 설계(독립 레이어, undefined면 그 레이어는
 *  그리지 않는다) - 단 이 화는 s1~s7 화면 구성이 서로 크게 달라 레이어마다 자기 완결적인
 *  하위 구성을 갖는다.
 *
 *  오케스트레이터 지시(이 화 시각 주의사항) 반영:
 *   - "맑은 공기 vs 안개 낀 공기" 대비가 중심이라, 안개는 화면을 뿌옇게 덮는 낮은 채도의
 *     넓은 면으로 표현하고 작은 점을 촘촘히 뿌리지 않는다(WindowPane.tsx의 fogProgress
 *     레시피 - 거의 불투명한 단색 면 + 큰 물결선 2~3가닥만 - 를 그대로 계승했다).
 *   - 지표면이 식는 것은 색 변화(따뜻한 톤 -> 차가운 톤)로만 보여준다(텍스트·숫자 없음).
 *   - 물방울이 작아 공중에 떠 있다는 점은 53화 CondensationDroplets(개별 물방울 아이콘)
 *     보다 훨씬 작고 흐릿한 "면" 형태로 표현하고, 점을 잔뜩 뿌리는 방식은 쓰지 않는다.
 *   - 새벽/아침 풍경은 단순한 실루엣(하늘 + 완만한 언덕 곡선 하나)으로 충분하다.
 *
 *  독립 레이어(전부 undefined면 하늘+언덕 실루엣만 있는 정지 배경이 된다):
 *   - coolProgress        : 0~1. 언덕(지표면)과 그 바로 위 공기층 색이 따뜻한 톤에서
 *     차가운 톤으로 바뀐다. s2용("지표면 냉각").
 *   - dropletProgress     : 0~1. 언덕 바로 위, 좁은 범위에 뿌연 면이 옅게 맺히기 시작한다
 *     ("물방울로 응결"이 막 시작되는 좁고 낮은 패치). s3용.
 *   - floatProgress       : 0~1. 뿌연 면이 옆으로 넓게 퍼지며 언덕 위로 살짝 뜬 채(작은
 *     틈을 둬 "표면에 안 붙음"을 표현) 짙어진다 - 값이 커질수록 화면 폭 전체를 덮는 두꺼운
 *     안개층이 된다(s4의 "공중에 뜸"과 s5의 "두껍게 깔린 안개"를 한 progress로 이어서
 *     처리, s5는 s4의 연속). `floatBadge`(기본 true)가 true일 때만 "표면에 안 붙는다"는
 *     대비 배지(작은 표면선+동그라미 위에 X)를 우상단에 띄운다 - s5에서는 이미 안개
 *     자체로 요점이 전달돼 배지 없이(false) 쓴다.
 *   - cloudCompareProgress: 0~1. 다른 모든 레이어를 무시하고 "높은 곳의 구름"(위쪽,
 *     CloudFloatDiagram을 progress 없이 재사용한 정지 실루엣 - REGISTRY "구름 실루엣 재사용
 *     가능" 확인 완료) vs "땅 위의 안개"(아래쪽, 같은 뿌연 면 레시피)를 세로로 나란히
 *     놓고 점선으로 연결하는 비교 패널로 전환한다. s6용.
 *   - clearProgress       : 0~1. floatProgress=1 상태(두꺼운 안개)를 전제로 안개가 옅어져
 *     사라지고, 해가 떠오르며(ThemedIcon "sun") 지표면·공기 색이 다시 따뜻해진다. s7용.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { CloudFloatDiagram, CLOUD_FLOAT_VB_W, CLOUD_FLOAT_VB_H } from './CloudFloatDiagram';

export const FOG_VB_W = 900;
export const FOG_VB_H = 620;

const SKY_H = 380;
const HILL_TOP_Y = SKY_H;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 안개 물결선 위치(고정, Math.random 미사용 - 원칙 3). WindowPane.FOG_WISPS와 동일 정신 */
const HAZE_WISPS = [
  { dx: -0.3, delay: 0, hFrac: 0.16 },
  { dx: 0.03, delay: 9, hFrac: 0.2 },
  { dx: 0.32, delay: 4, hFrac: 0.14 },
];

const HILL_D = `M 0 ${HILL_TOP_Y + 44} Q ${FOG_VB_W * 0.25} ${HILL_TOP_Y - 6} ${FOG_VB_W * 0.5} `
  + `${HILL_TOP_Y + 26} Q ${FOG_VB_W * 0.75} ${HILL_TOP_Y + 56} ${FOG_VB_W} ${HILL_TOP_Y + 16} `
  + `L ${FOG_VB_W} ${FOG_VB_H} L 0 ${FOG_VB_H} Z`;

export interface FogLayerDiagramProps {
  /** 씬 로컬 프레임. 안개 물결선의 살랑거림에만 쓴다(옵션, 기본 0 = 정지) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  coolProgress?: number;
  dropletProgress?: number;
  floatProgress?: number;
  /** floatProgress가 정의됐을 때만 유효. 기본 true(s4용), s5에서는 false로 끈다 */
  floatBadge?: boolean;
  cloudCompareProgress?: number;
  clearProgress?: number;
  stroke?: string;
  skyColor?: string;
  groundWarmColor?: string;
  groundCoolColor?: string;
  airWarmColor?: string;
  airCoolColor?: string;
  hazeColor?: string;
  hazeAccent?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FogLayerDiagram: React.FC<FogLayerDiagramProps> = ({
  f = 0, width, x = 0, y = 0,
  coolProgress, dropletProgress, floatProgress, floatBadge = true,
  cloudCompareProgress, clearProgress,
  stroke = C.ink,
  skyColor = C.sky, groundWarmColor = C.browningSoft, groundCoolColor = C.waterCool,
  airWarmColor = C.goldSoft, airCoolColor = C.water,
  hazeColor = C.paper, hazeAccent = C.water,
  strokeWidth = SW, style,
}) => {
  const scale = width / FOG_VB_W;
  const height = width * (FOG_VB_H / FOG_VB_W);

  if (cloudCompareProgress !== undefined) {
    return (
      <CompareLayout
        f={f} width={width} x={x} y={y} progress={clamp01(cloudCompareProgress)}
        stroke={stroke} skyColor={skyColor} hazeColor={hazeColor} hazeAccent={hazeAccent}
        strokeWidth={strokeWidth} style={style}
      />
    );
  }

  /* 지표 냉각: coolProgress가 없으면, 뒤 단계(물방울/부유/걷힘)가 이미 지나간 뒤라
     "이미 식어 있는" 상태를 기본값으로 삼는다. clearProgress는 반대로 다시 데워지는
     방향이라 별도로 계산한다. */
  const coolT = coolProgress !== undefined
    ? smooth(clamp01(coolProgress))
    : clearProgress !== undefined
      ? 1 - smooth(clamp01(clearProgress))
      : (dropletProgress !== undefined || floatProgress !== undefined) ? 1 : 0;

  const dropT = dropletProgress !== undefined ? smooth(clamp01(dropletProgress)) : 0;
  const floatT = floatProgress !== undefined ? smooth(clamp01(floatProgress)) : 0;
  const clearT = clearProgress !== undefined ? smooth(clamp01(clearProgress)) : 0;

  /* 안개 면의 존재감(hazeBase)과 퍼짐 정도(spreadT) - floatProgress가 있으면 그것이
     우선이고(넓게 퍼지며 짙어짐), 없고 dropletProgress만 있으면 좁고 낮은 초기 패치,
     둘 다 없고 clearProgress만 있으면 "이미 꽉 찬 안개"(1)에서 옅어지는 것으로 본다. */
  const hazeBase = floatProgress !== undefined
    ? floatT
    : dropletProgress !== undefined
      ? dropT
      : clearProgress !== undefined ? 1 : 0;
  const spreadT = floatProgress !== undefined
    ? floatT
    : clearProgress !== undefined ? 1 : Math.min(1, dropT * 0.42);
  const hazeOpacity = clearProgress !== undefined ? hazeBase * (1 - clearT) : hazeBase;

  const groundFill = lerp3(groundWarmColor, groundCoolColor, coolT);
  const airFill = lerp3(airWarmColor, airCoolColor, coolT);
  const airOpacity = 0.12 + 0.36 * coolT;

  const bandW = lerp(FOG_VB_W * 0.34, FOG_VB_W * 0.96, spreadT);
  const bandH = lerp(96, 168, spreadT);
  const gap = lerp(2, 44, spreadT);
  const bandCx = FOG_VB_W / 2;
  const bandBottomY = HILL_TOP_Y + 20 - gap;
  const bandTopY = bandBottomY - bandH;

  const sunT = clearProgress !== undefined ? smooth(clamp01(clearProgress)) : 0;
  const sunLocalX = FOG_VB_W * 0.82;
  const sunLocalY = lerp(SKY_H * 0.86, 70, sunT);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${FOG_VB_W} ${FOG_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        {/* 하늘 */}
        <rect x={0} y={0} width={FOG_VB_W} height={SKY_H + 30} fill={skyColor} />
        {sunT > 0.02 ? (
          <g style={{ opacity: sunT }} transform={`translate(${sunLocalX - 52} ${sunLocalY - 52})`}>
            <ThemedIcon name="sun" size={104} color={C.gold} strokePx={8} />
          </g>
        ) : null}

        {/* 지표면 위 공기층 (지표 냉각이 위로 번지는 느낌) */}
        <rect x={0} y={HILL_TOP_Y - 96} width={FOG_VB_W} height={96} fill={airFill} opacity={airOpacity} />

        {/* 언덕(지표면) */}
        <path d={HILL_D} fill={groundFill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />

        {/* 안개: 뿌연 불투명 면 + 큰 물결선 2~3가닥(WindowPane.fogProgress와 동일 레시피) */}
        {hazeOpacity > 0.02 ? (
          <>
            <rect
              x={bandCx - bandW / 2} y={bandTopY} width={bandW} height={bandH} rx={bandH * 0.5}
              fill={hazeColor} opacity={Math.min(0.94, hazeOpacity * 1.12)}
              stroke={C.inkSoft} strokeWidth={SW_THIN * 0.8}
            />
            <g
              opacity={Math.min(0.85, hazeOpacity * 1.1)} stroke={hazeAccent} strokeWidth={SW_THIN * 1.2}
              fill="none" strokeLinecap="round"
            >
              {HAZE_WISPS.map((wsp) => {
                const sway = Math.sin((f + wsp.delay) / 20) * 10 * spreadT;
                const wx = bandCx + wsp.dx * bandW;
                const wy = bandTopY + bandH * (0.5 + wsp.hFrac * 0.3);
                const wh = bandH * wsp.hFrac;
                return (
                  <path
                    key={wsp.dx}
                    d={`M ${wx - bandW * 0.14} ${wy + wh} Q ${wx + sway} ${wy}, ${wx + bandW * 0.14} ${wy + wh}`}
                  />
                );
              })}
            </g>
          </>
        ) : null}

        {/* "표면에 안 붙는다" 대비 배지 - 표면선 위 동그라미(물방울) + 대각선 X */}
        {floatProgress !== undefined && floatBadge && floatT > 0.04 ? (
          <g style={{ opacity: Math.min(1, floatT * 1.4) }} transform={`translate(${FOG_VB_W - 150} 26)`}>
            <rect x={0} y={0} width={122} height={102} rx={18} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
            <line x1={20} y1={78} x2={102} y2={78} stroke={stroke} strokeWidth={SW_THIN * 0.9} />
            <circle cx={61} cy={66} r={16} fill={hazeAccent} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
            <line x1={14} y1={14} x2={108} y2={90} stroke={C.coral} strokeWidth={SW_THIN * 1.4} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/** 16진 색 두 개를 t(0~1)로 선형 보간해 rgb() 문자열로 반환.
 *  49화 결함(색 보간 함수 반환형을 다시 보간에 넣어 값이 깨짐)을 피하려고, 이 함수는
 *  항상 최종 rgb() 문자열만 반환하고 그 반환값을 다시 이 함수에 넣지 않는다. */
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
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/* ============================================================
 * cloudCompareProgress 전용: "구름 = 높은 안개" 세로 비교 패널
 * ============================================================ */

const CompareLayout: React.FC<{
  f: number; width: number; x: number; y: number; progress: number;
  stroke: string; skyColor: string; hazeColor: string; hazeAccent: string;
  strokeWidth: number; style?: React.CSSProperties;
}> = ({ f, width, x, y, progress: p, stroke, skyColor, hazeColor, hazeAccent, strokeWidth, style }) => {
  const scale = width / FOG_VB_W;
  const height = width * (FOG_VB_H / FOG_VB_W);

  const cloudT = smooth(clamp01(p / 0.45));
  const lineT = smooth(clamp01((p - 0.28) / 0.4));
  const fogT = smooth(clamp01((p - 0.55) / 0.45));

  /* 구름(위) - CloudFloatDiagram을 progress 없이 재사용 = 정지 구름 실루엣만 그려짐 */
  const cloudLocalW = 260;
  const cloudLocalH = cloudLocalW * (CLOUD_FLOAT_VB_H / CLOUD_FLOAT_VB_W);
  const cloudLocalX = FOG_VB_W / 2 - cloudLocalW / 2;
  const cloudLocalY = 30;

  /* 안개(아래) - 넓고 낮은 뿌연 면, FogLayerDiagram 본 레이아웃의 haze 레시피 축소판 */
  const fogW = FOG_VB_W * 0.72;
  const fogH = 92;
  const fogX = FOG_VB_W / 2 - fogW / 2;
  const fogY = FOG_VB_H - 150;

  const lineX1 = FOG_VB_W / 2;
  const lineY1 = cloudLocalY + cloudLocalH + 14;
  const lineY2 = fogY - 10;
  const lineLen = Math.max(1, lineY2 - lineY1);

  /* CloudFloatDiagram은 그 자신이 <svg style={position:'absolute', left, top}}>을 직접
     반환하는 컴포넌트다(부모 div 없이 화면 절대좌표를 그대로 쓴다). 여기서 position:absolute
     div로 한 번 더 감싼 뒤 그 안에 넣으면 자식의 left/top이 "그 div 기준"으로 다시 풀려
     좌표가 두 번 더해지는 결함이 난다("21화 이후 반복된 결함" A절과 같은 종류의 함정) -
     그래서 이 레이아웃은 감싸는 div 없이 Fragment로 두 절대좌표 요소를 형제로 배치한다. */
  return (
    <>
      <svg
        viewBox={`0 0 ${FOG_VB_W} ${FOG_VB_H}`} width={width} height={height}
        style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
        shapeRendering="geometricPrecision"
      >
        <rect x={0} y={0} width={FOG_VB_W} height={FOG_VB_H} fill={skyColor} opacity={0.5} />

        {lineT > 0.02 ? (
          <line
            x1={lineX1} y1={lineY1} x2={lineX1} y2={lineY1 + lineLen * lineT}
            stroke={stroke} strokeWidth={SW_THIN} strokeDasharray="10 12" strokeLinecap="round" opacity={0.7}
          />
        ) : null}

        {fogT > 0.02 ? (
          <>
            <rect
              x={fogX} y={fogY} width={fogW} height={fogH} rx={fogH * 0.5}
              fill={hazeColor} opacity={Math.min(0.94, fogT * 1.15)}
              stroke={C.inkSoft} strokeWidth={SW_THIN * 0.8}
            />
            <path
              d={`M ${fogX + fogW * 0.2} ${fogY + fogH * 0.75} Q ${fogX + fogW * 0.5 + Math.sin(f / 20) * 8} `
                + `${fogY + fogH * 0.25}, ${fogX + fogW * 0.8} ${fogY + fogH * 0.75}`}
              fill="none" stroke={hazeAccent} strokeWidth={SW_THIN * 1.2} strokeLinecap="round"
              opacity={Math.min(0.85, fogT * 1.1)}
            />
          </>
        ) : null}
      </svg>

      {cloudT > 0.02 ? (
        <CloudFloatDiagram
          width={cloudLocalW * scale}
          x={x + cloudLocalX * scale}
          y={y + cloudLocalY * scale}
          style={{ opacity: cloudT }}
        />
      ) : null}
    </>
  );
};

export default FogLayerDiagram;
