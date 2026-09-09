/** "감기 바이러스가 코 점막에 들어오면 몸이 반응해 콧속 혈관이 넓어지고 점액이 늘어나는데,
 *  이 콧물이 바이러스·먼지를 붙잡아 씻어내는 것이고, 콧물 색이 짙어지는 건 그 과정에서 싸운
 *  면역세포가 섞인 것뿐이다"는 구조를 보여주는 코 점막 단면 다이어그램(감기에 걸리면 콧물이
 *  나는 이유, general-ep97 신설).
 *
 *  REGISTRY 확인 완료 - `MouthHealDiagram`(general-ep91)이 "체액이 세균을 막아준다"는
 *  침방울+세균+X 표시 어휘를 갖고 있어 참고했지만, 그 화는 회복 속도 비교가 목적이라
 *  "바이러스 침입 -> 면역 반응 -> 분비물 증가 -> 분비물 색이 단계적으로 바뀐다"는 이 화의
 *  3단 진행 구조는 다루지 않아 새로 만들었다. `WoundCrossSectionDiagram`/`BruiseDiagram`과
 *  같은 원형 단면 시각 문법(피부/점막 원 + 안쪽 옅은 조직 톤)을 재사용해 "단면을 볼 때는
 *  이 원 그림"이라는 채널 관례를 유지한다.
 *
 *  3개의 독립 레이어를 받는다(undefined면 그 레이어를 안 그린다, MouthHealDiagram·
 *  BruiseDiagram과 같은 설계):
 *   - `immuneProgress`(0~1): 점막 왼쪽 위 공간에 바이러스 입자(ThemedIcon virus, 1개만)가
 *     팝인하고, 벽 쪽에서 면역세포(`ImmuneCell` 2개, 점 무리 아닌 큰 원+핵) 가 그 주변으로
 *     모여든다.
 *   - `mucusProgress`(0~1): 점막 안 혈관 3가닥이 굵어지며 넓어지고(dash-reveal이 아니라
 *     stroke-width 자체가 두꺼워지는 것으로 "확장"을 표현), 아래쪽 분비샘에서 점액 방울
 *     (ThemedIcon droplet)이 자라나며, 그 옆에 작은 바이러스 입자 1개+먼지 조각 1개(작은
 *     마름모, 점 무리 아님)가 나타났다가 방울에 흡수돼 옅어진다. 후반부(0.55~1)엔 방울이
 *     바깥 경계 쪽으로 살짝 흘러가며(밖으로 씻어내는 동작) 옅게 페이드된다.
 *   - `colorProgress`(0~1): mucusProgress가 만든 그 방울의 색 자체를 맑음(연한 파랑,
 *     C.waterCool) -> 노랑(C.gold) -> 초록(LightScatterDiagram의 LIGHT_GREEN, 이미 등록된
 *     초록 톤을 재사용 - 새 색 추가하지 않음)으로 3단 보간한다. 동시에 방울 안쪽에 작은
 *     면역세포(`ImmuneCell`) 최대 2개가 옅게 섞여 늘어나 "면역세포가 많이 섞여서 그렇다"는
 *     내레이션을 좌표로 드러낸다 - 세균 감염을 뜻하는 표시(X 등)는 이 파일 안에 굽지 않는다
 *     (70화 사고 재발 방지 - 정정 연출은 호출하는 씬이 SpeechBubble+QMark로 별도로 얹는다).
 *     이 레이어를 쓰는 씬은 mucusProgress=1도 함께 유지해서 넘겨야 한다(21화 이후 결함 D).
 *
 *  "이물질 침입에 대한 신체의 방어 반응과 그 결과물(분비물)의 변화"라는 구조를 갖는 다른
 *  소재(다른 점막·염증 반응 전반) 재사용 가능성이 있어 에피소드 로컬이 아니라 레지스트리에
 *  등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { LIGHT_GREEN } from './LightScatterDiagram';
import { ImmuneCell } from './Symbols';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export const NASAL_VB_W = 760;
export const NASAL_VB_H = 760;

const CX = 380;
const CY = 380;
const R_OUTER = 280;
const R_INNER = 224;

/* ---------------- 바이러스·면역세포 레이어 좌표 ---------------- */
const VIRUS_ENTER = { x: 20, y: 300 };
const VIRUS_REST = { x: 250, y: 288 };
const CELL_A_START = { x: 336, y: 108 };
const CELL_A_TARGET = { x: VIRUS_REST.x - 56, y: VIRUS_REST.y - 44 };
const CELL_B_START = { x: 128, y: 458 };
const CELL_B_TARGET = { x: VIRUS_REST.x + 12, y: VIRUS_REST.y + 58 };

/* ---------------- 혈관 좌표 (band 안, 오른쪽·아래쪽에 배치해 바이러스/면역세포 자리와 겹치지 않음) ---------------- */
interface VesselDef { ox: number; oy: number; angle: number; len: number; bulgeSign: 1 | -1 }
const VESSELS: VesselDef[] = [
  { ox: 78, oy: -112, angle: 12, len: 148, bulgeSign: 1 },
  { ox: 132, oy: -4, angle: 92, len: 132, bulgeSign: -1 },
  { ox: 84, oy: 108, angle: 58, len: 126, bulgeSign: 1 },
];

function vesselPath(cx: number, cy: number, v: VesselDef) {
  const rad = (v.angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const half = v.len / 2;
  const x1 = cx + v.ox - dx * half;
  const y1 = cy + v.oy - dy * half;
  const x2 = cx + v.ox + dx * half;
  const y2 = cy + v.oy + dy * half;
  const bulge = v.len * 0.16 * v.bulgeSign;
  const mx = cx + v.ox - dy * bulge;
  const my = cy + v.oy + dx * bulge;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/* ---------------- 분비샘·점액 방울 레이어 좌표 ----------------
 * 방울이 다 자란 정지 상태(흘러가기 전)에는 조직 원 경계(R_OUTER) 안에 들어오도록 잡는다 -
 * 처음엔 DROP_CY를 gland 바로 위(-46)로, 크기를 360으로 잡았더니 흐르기도 전인데 이미
 * 바깥 경계를 60px 넘게 뚫고 나가 있어 "방울이 원 밖으로 새는 결함"처럼 보였다(스틸
 * 선점검에서 발견, 원칙 5). DROP_CY를 위로 더 올리고(-86) 크기를 줄여(300) 정지 상태에서는
 * 경계 안쪽에 머물게 하고, `flowT`(밖으로 흐르는 후반 단계)가 커질 때만 경계를 넘어가게
 * 했다 - 그래야 "흐르기 전/후"가 시각적으로 구분된다. */
const GLAND_PT = { x: CX, y: CY + R_INNER - 18 };
const DROP_CX = CX;
const DROP_CY = GLAND_PT.y - 86;
const DROP_SIZE_MAX = 300;
/** 방울에 흡수되는 바이러스·먼지 - 방울 왼쪽 위 가장자리 (방울 반지름 축소(180->150)에
 *  맞춰 오프셋도 같은 비율(300/360)로 줄였다) */
const CAUGHT_VIRUS_PT = { x: DROP_CX - 125, y: DROP_CY - 50 };
const CAUGHT_DUST_PT = { x: DROP_CX + 108, y: DROP_CY - 75 };
/** 방울 안에 섞이는 여분 면역세포(colorProgress 전용) */
const MIX_CELL_A = { x: DROP_CX - 58, y: DROP_CY + 8 };
const MIX_CELL_B = { x: DROP_CX + 55, y: DROP_CY - 25 };

/* ---------------- 방울 색 (맑음 -> 노랑 -> 초록), 반환값을 다시 보간에 넣지 않는다 ---------------- */
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
const NASAL_COLOR_STOPS: Array<[number, string]> = [
  [0, C.waterCool],
  [0.5, C.gold],
  [1, LIGHT_GREEN],
];
export function nasalMucusColorAt(colorProgress: number): string {
  const t = clamp01(colorProgress);
  for (let i = 0; i < NASAL_COLOR_STOPS.length - 1; i++) {
    const [t0, c0] = NASAL_COLOR_STOPS[i];
    const [t1, c1] = NASAL_COLOR_STOPS[i + 1];
    if (t <= t1 || i === NASAL_COLOR_STOPS.length - 2) {
      const localT = t1 === t0 ? 0 : clamp01((t - t0) / (t1 - t0));
      return lerpColor(c0, c1, localT);
    }
  }
  return NASAL_COLOR_STOPS[NASAL_COLOR_STOPS.length - 1][1];
}

export interface NasalImmuneDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 바이러스 입자 등장 + 면역세포 2개가 그 주변으로 모여듦 */
  immuneProgress?: number;
  /** 0~1. 혈관 3가닥이 굵어지고, 분비샘에서 점액 방울이 자라 바이러스+먼지를 흡수하며 밖으로 흘러감 */
  mucusProgress?: number;
  /** 0~1. mucusProgress가 만든 방울의 색을 맑음->노랑->초록으로 바꾸고 면역세포가 옅게 섞임(mucusProgress=1과 함께 사용) */
  colorProgress?: number;
  stroke?: string;
  fill?: string;
  tissueColor?: string;
  vesselColor?: string;
  cellColor?: string;
  style?: React.CSSProperties;
}

export const NasalImmuneDiagram: React.FC<NasalImmuneDiagramProps> = ({
  width, x = 0, y = 0,
  immuneProgress, mucusProgress, colorProgress,
  stroke = C.ink, fill = C.paper, tissueColor = C.coralSoft,
  vesselColor = '#E0483A', cellColor = C.gold,
  style,
}) => {
  const immune = immuneProgress === undefined ? undefined : clamp01(immuneProgress);
  const mucus = mucusProgress === undefined ? undefined : clamp01(mucusProgress);
  const color = colorProgress === undefined ? undefined : clamp01(colorProgress);

  /* 바이러스: 0~0.35 등장, 0.35~1 정지(면역세포가 도착할 때까지 자리를 지킴) */
  const virusT = immune === undefined ? 0 : smooth(clamp01(immune / 0.35));
  const virusPos = {
    x: lerp(VIRUS_ENTER.x, VIRUS_REST.x, virusT),
    y: lerp(VIRUS_ENTER.y, VIRUS_REST.y, virusT),
  };
  const cellAT = immune === undefined ? 0 : smooth(clamp01((immune - 0.25) / 0.7));
  const cellBT = immune === undefined ? 0 : smooth(clamp01((immune - 0.38) / 0.62));
  const cellAPos = {
    x: lerp(CELL_A_START.x, CELL_A_TARGET.x, cellAT),
    y: lerp(CELL_A_START.y, CELL_A_TARGET.y, cellAT),
  };
  const cellBPos = {
    x: lerp(CELL_B_START.x, CELL_B_TARGET.x, cellBT),
    y: lerp(CELL_B_START.y, CELL_B_TARGET.y, cellBT),
  };

  /* 혈관 확장 */
  const vesselT = mucus === undefined ? 0 : smooth(clamp01(mucus / 0.3));
  const vesselWidth = lerp(SW_THIN * 0.45, SW_THIN * 1.7, vesselT);

  /* 점액 방울 등장 -> 바이러스/먼지 흡수 -> 바깥으로 흘러감(옅어짐) */
  const dropT = mucus === undefined ? 0 : smooth(clamp01((mucus - 0.12) / 0.42));
  const catchT = mucus === undefined ? 0 : clamp01((mucus - 0.28) / 0.3);
  const absorbT = mucus === undefined ? 0 : clamp01((mucus - 0.5) / 0.25);
  const flowT = mucus === undefined ? 0 : smooth(clamp01((mucus - 0.58) / 0.42));
  const dropSize = DROP_SIZE_MAX * dropT;
  const dropShift = { x: flowT * 26, y: flowT * 58 };
  const dropOpacity = dropT > 0.01 ? 1 - 0.25 * flowT : 0;
  const dropFill = color === undefined ? nasalMucusColorAt(0) : nasalMucusColorAt(color);

  /* colorProgress 전용 - 방울 안에 섞이는 면역세포 */
  const mixAT = color === undefined ? 0 : clamp01((color - 0.3) / 0.5);
  const mixBT = color === undefined ? 0 : clamp01((color - 0.5) / 0.5);

  return (
    <svg
      viewBox={`0 0 ${NASAL_VB_W} ${NASAL_VB_H}`}
      width={width} height={(width * NASAL_VB_H) / NASAL_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 점막 단면 (WoundCrossSectionDiagram/BruiseDiagram과 같은 규약) */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={fill} stroke={stroke} strokeWidth={SW} />
      <circle cx={CX} cy={CY} r={R_INNER} fill={tissueColor} opacity={0.32} />

      {/* ---------------- 혈관 (mucusProgress) ---------------- */}
      {mucus !== undefined ? VESSELS.map((v, i) => (
        <path
          key={`ves${i}`}
          d={vesselPath(CX, CY, v)}
          fill="none" stroke={vesselColor} strokeWidth={vesselWidth} strokeLinecap="round"
          opacity={0.35 + 0.65 * vesselT}
        />
      )) : null}

      {/* ---------------- 분비샘 + 점액 방울 (mucusProgress, 색은 colorProgress가 override) ---------------- */}
      {mucus !== undefined ? (
        <>
          {/* 분비샘 - 항상 보이는 작은 캡슐 */}
          <rect
            x={GLAND_PT.x - 46} y={GLAND_PT.y - 15} width={92} height={30} rx={15}
            fill={vesselColor} stroke={stroke} strokeWidth={SW_THIN * 0.55} opacity={0.5 + 0.5 * vesselT}
          />
          {dropSize > 1 ? (
            <g
              transform={`translate(${dropShift.x} ${dropShift.y})`}
              opacity={dropOpacity}
            >
              <g transform={`translate(${DROP_CX - dropSize / 2} ${DROP_CY - dropSize / 2})`}>
                <ThemedIcon name="droplet" size={dropSize} color={dropFill} strokePx={11} />
              </g>
              {/* 흡수되는 바이러스+먼지 (mucusProgress 자체 안에서만 진행되는 하위 단계) */}
              {catchT > 0.01 ? (
                <g opacity={catchT * (1 - absorbT)} transform={`translate(${CAUGHT_VIRUS_PT.x - 34} ${CAUGHT_VIRUS_PT.y - 34})`}>
                  <ThemedIcon name="virus" size={68} color={C.inkSoft} strokePx={9} />
                </g>
              ) : null}
              {catchT > 0.01 ? (
                <rect
                  x={CAUGHT_DUST_PT.x - 16} y={CAUGHT_DUST_PT.y - 16} width={32} height={32}
                  fill={C.inkSoft} opacity={catchT * (1 - absorbT)}
                  transform={`rotate(45 ${CAUGHT_DUST_PT.x} ${CAUGHT_DUST_PT.y})`}
                />
              ) : null}
              {/* colorProgress - 방울 안에 옅게 섞이는 면역세포 최대 2개 */}
              <ImmuneCell
                cx={MIX_CELL_A.x} cy={MIX_CELL_A.y} r={30} appear={mixAT * 0.92}
                stroke={stroke} fill={C.paper} nucleusColor={cellColor}
              />
              <ImmuneCell
                cx={MIX_CELL_B.x} cy={MIX_CELL_B.y} r={26} appear={mixBT * 0.9}
                stroke={stroke} fill={C.paper} nucleusColor={cellColor}
              />
            </g>
          ) : null}
        </>
      ) : null}

      {/* ---------------- 바이러스 + 면역세포 (immuneProgress) ---------------- */}
      {immune !== undefined && immune > 0.01 ? (
        <g transform={`translate(${virusPos.x - 34} ${virusPos.y - 34})`} opacity={virusT}>
          <ThemedIcon name="virus" size={68} color={C.inkSoft} strokePx={9} />
        </g>
      ) : null}
      {immune !== undefined ? (
        <>
          <ImmuneCell
            cx={cellAPos.x} cy={cellAPos.y} r={30} appear={cellAT}
            stroke={stroke} fill={C.paper} nucleusColor={cellColor}
          />
          <ImmuneCell
            cx={cellBPos.x} cy={cellBPos.y} r={30} appear={cellBT}
            stroke={stroke} fill={C.paper} nucleusColor={cellColor}
          />
        </>
      ) : null}
    </svg>
  );
};

export default NasalImmuneDiagram;
