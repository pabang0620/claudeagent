/** "마그마 속에는 원래 기체가 녹아 있는데, 땅속 깊은 곳은 압력이 세서 그 기체가 갇혀
 *  있다가, 마그마가 지표로 올라오며 압력이 낮아지면 갇혀 있던 기체가 거품처럼 부풀어
 *  마그마를 밀어 올리고 터뜨린다"는 4단 사슬(전제 -> 전제2 -> 핵심 -> 결론)을 보여주는
 *  화산 땅속 단면 다이어그램(화산이 갑자기 펑 터지는 이유, general-ep85).
 *
 *  REGISTRY 확인 완료 - `PressureBoilingDiagram`(general-ep79)은 "밀폐 용기 안 압력이
 *  오르면 끓는점도 오른다"는 압력-온도 상관관계를 그래프·냄비로 보여주는 구조라 인과 방향
 *  (압력 증가 -> 끓는점 증가)이 이 화의 방향(압력 감소 -> 기체 팽창 -> 폭발)과 반대이고,
 *  화산 단면 자체를 다루는 소품이 REGISTRY에 없어 새로 만들었다. `SaltCycleDiagram`의 산
 *  실루엣 좌표 관례(MOUNTAIN_APEX/BASE_L/BASE_R)를 그대로 계승했다.
 *
 *  땅속 암반 블록(항상 표시) 안에 마그마 방(항상 magmaColor로 채워진 타원 - "녹은 뜨거운
 *  바위"는 원래 거기 있는 것이므로 progress와 무관하게 항상 그린다) + 화산 통로(conduit,
 *  risingProgress로 챔버 쪽에서 정상 쪽으로 차오름) + 산 실루엣(항상 표시, 정상은 분화구
 *  개구부만큼 평평)을 그린다. 기체는 큰 원 3개까지만 쓴다(채널 원칙 - 점 무리 금지) -
 *  챔버 안 고정 위치에서 dissolvedGasProgress로 드러나 압력에 눌린 작은 크기로 머물다
 *  (pressureProgress는 위에서 누르는 화살표만 담당하고 기포 크기에는 관여하지 않는다 -
 *  "눌려서 안 커진다"는 expandProgress가 0인 상태 그 자체로 표현된다), risingProgress로
 *  통로를 따라 정상 쪽으로 이동하며 expandProgress로 커진다. pressureProgress로 나타난
 *  압력 화살표는 risingProgress가 커질수록 자동으로 옅어져 "올라올수록 압력이 낮아진다"를
 *  별도 prop 없이 계산으로 표현한다.
 *
 *  eruptProgress + viscosity(0~1)는 정상에서의 분출 스타일을 연속으로 섞는다 - viscosity가
 *  낮을수록(묽음) 오른쪽 사면을 따라 잔잔히 흐르는 용암 줄기(flowT)가, 높을수록(끈적함)
 *  분화구 위로 둥근 마그마 방울 여러 개가 튀어오르는 격렬한 분출(burstT)이 더 두드러지게
 *  섞인다 - 두 스타일을 각각 독립 도형으로 그리고 opacity만 viscosity로 가중해 한 프레임
 *  안에서 자연스럽게 섞이게 했다(CellMergeDiagram과 같은 "여러 상태를 독립 레이어로 겹쳐
 *  opacity로 블렌드" 원칙). 폭발이 무섭게 보이지 않도록 튀는 마그마는 뾰족한 별 모양이
 *  아니라 전부 둥근 원(blob)으로만 그린다(채널 톤 원칙 - 밝고 담백하게).
 *
 *  "압력이 낮아지며 갇혀 있던 기체가 팽창해 터진다"는 구조를 갖는 다른 소재(가압 용기
 *  개방 전반 - 탄산음료 병, 스프레이 캔, 소화기 등) 재사용 가능성이 있어 에피소드 로컬이
 *  아니라 여기 등록한다.
 */
import React, { useId } from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export const VOLCANO_VB_W = 700;
export const VOLCANO_VB_H = 1000;

const GROUND_Y = 560;
const UNDERGROUND_BOTTOM = 970;

const MOUNTAIN_BASE_L = { x: 130, y: GROUND_Y };
const MOUNTAIN_BASE_R = { x: 570, y: GROUND_Y };
const MOUNTAIN_APEX_L = { x: 315, y: 120 };
const MOUNTAIN_APEX_R = { x: 385, y: 120 };
const CRATER_PT = { x: 350, y: 120 };

const CONDUIT_TOP_Y = 150;
const CONDUIT_BOTTOM_Y = 670;
const CONDUIT_TOP_HALF_W = 35;
const CONDUIT_BOTTOM_HALF_W = 95;

const CHAMBER_CENTER = { x: 350, y: 790 };
const CHAMBER_RX = 175;
const CHAMBER_RY = 120;

/** 호출 씬이 라벨을 얹을 앵커(산 정상 위) */
export const VOLCANO_CRATER_LABEL_PT = { x: CRATER_PT.x, y: MOUNTAIN_APEX_L.y - 34 };
/** 호출 씬이 라벨을 얹을 앵커(산 아래, 두 화산 비교용) */
export const VOLCANO_BASE_LABEL_PT = { x: CRATER_PT.x, y: MOUNTAIN_BASE_L.y + 30 };

type GasHome = { x: number; y: number; rMax: number; rise: { x: number; y: number } };

/** 기체 방울 3개 - 챔버 속 고정 위치(home)에서 통로를 따라 정상 근처(rise)로 이동한다.
 *  Math.random 미사용(원칙 3) - 전부 고정 배열 */
const GAS_BUBBLES: GasHome[] = [
  { x: 300, y: 760, rMax: 34, rise: { x: 316, y: 205 } },
  { x: 410, y: 745, rMax: 28, rise: { x: 384, y: 185 } },
  { x: 352, y: 845, rMax: 30, rise: { x: 350, y: 232 } },
];

const REVEAL_AT = [0, 0.18, 0.34];

const PRESSURE_ARROW_X = [258, 350, 442];

/** 격렬한 분출(viscosity 높음) 때 튀는 마그마 방울 4개 - 크라터 중심에서의 고정 오프셋.
 *  전부 둥근 원(blob)만 써서 무섭지 않게 한다 */
const BURST_BLOBS = [
  { dx: -72, dy: -96, r: 34 },
  { dx: 58, dy: -112, r: 28 },
  { dx: -14, dy: -148, r: 24 },
  { dx: 104, dy: -58, r: 22 },
];

function ArrowDown({
  x, topY, bottomY, opacity, color,
}: { x: number; topY: number; bottomY: number; opacity: number; color: string }) {
  if (opacity <= 0.001) return null;
  const headW = 16;
  const headLen = 22;
  return (
    <g opacity={clamp01(opacity)}>
      <line x1={x} y1={topY} x2={x} y2={bottomY - headLen} stroke={color} strokeWidth={9} strokeLinecap="round" />
      <path d={`M ${x} ${bottomY} L ${x - headW} ${bottomY - headLen} L ${x + headW} ${bottomY - headLen} Z`} fill={color} />
    </g>
  );
}

export interface VolcanoDiagramProps {
  /** 화면상 폭(px). viewBox 700x1000, 세로로 긴 단면 - height 는 자동 계산된다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 마그마 방 속 기체 방울 3개가 순서대로 드러남(작은 크기로 고정) */
  dissolvedGasProgress?: number;
  /** 0~1. 마그마 방 위에서 누르는 압력 화살표 3개가 나타남. risingProgress가 커지면
   *  "올라올수록 압력이 낮아진다"를 표현하려 자동으로 옅어진다 */
  pressureProgress?: number;
  /** 0~1. 마그마가 화산 통로를 따라 챔버 -> 정상 쪽으로 차오른다 */
  risingProgress?: number;
  /** 0~1. 기체 방울이 부풀어 커진다(위치는 risingProgress가 담당, 크기만 담당) */
  expandProgress?: number;
  /** 0~1. 정상에서 분출한다. viscosity로 흐름/폭발 스타일을 섞는다 */
  eruptProgress?: number;
  /** 0(묽음, 잔잔히 흐름) ~ 1(끈적함, 격렬히 튐, 기본값). eruptProgress>0일 때만 보인다 */
  viscosity?: number;
  stroke?: string;
  rockColor?: string;
  mountainColor?: string;
  magmaColor?: string;
  gasColor?: string;
  ashColor?: string;
  style?: React.CSSProperties;
}

export const VolcanoDiagram: React.FC<VolcanoDiagramProps> = ({
  width, x = 0, y = 0,
  dissolvedGasProgress = 0, pressureProgress = 0, risingProgress = 0, expandProgress = 0,
  eruptProgress = 0, viscosity = 1,
  stroke = C.ink, rockColor = C.hillFar, mountainColor = C.hill, magmaColor = C.coral,
  gasColor = C.gold, ashColor = C.goldSoft,
  style,
}) => {
  const scale = width / VOLCANO_VB_W;
  const height = VOLCANO_VB_H * scale;
  const uid = useId().replace(/[:]/g, '');
  const clipId = `volcano-conduit-clip-${uid}`;

  const dissolveP = clamp01(dissolvedGasProgress);
  const pressureP = clamp01(pressureProgress);
  const risingP = clamp01(risingProgress);
  const expandP = clamp01(expandProgress);
  const eruptP = clamp01(eruptProgress);
  const viscP = clamp01(viscosity);

  // 올라올수록(risingP) 압력이 낮아지는 것을 별도 prop 없이 계산으로 표현
  const pressureOpacity = pressureP * (1 - smooth(risingP) * 0.85);

  const conduitRevealH = smooth(risingP) * (CONDUIT_BOTTOM_Y - CONDUIT_TOP_Y);
  const conduitClipY = CONDUIT_BOTTOM_Y - conduitRevealH;

  const conduitD = `M ${CRATER_PT.x - CONDUIT_BOTTOM_HALF_W} ${CONDUIT_BOTTOM_Y} `
    + `L ${CRATER_PT.x - CONDUIT_TOP_HALF_W} ${CONDUIT_TOP_Y} `
    + `L ${CRATER_PT.x + CONDUIT_TOP_HALF_W} ${CONDUIT_TOP_Y} `
    + `L ${CRATER_PT.x + CONDUIT_BOTTOM_HALF_W} ${CONDUIT_BOTTOM_Y} Z`;

  // 분출이 시작되면 챔버-통로에 있던 기체 방울은 빠르게 사라지고 분출 도형으로 대체된다
  const bubbleFade = eruptP > 0.001 ? clamp01(1 - eruptP / 0.32) : 1;

  const flowT = (1 - viscP) * smooth(eruptP);
  const burstT = viscP * smooth(eruptP);

  // 묽은 마그마: 정상 오른쪽 사면을 따라 잔잔히 흘러내리는 용암 줄기
  const flowD = `M ${MOUNTAIN_APEX_R.x - 14} ${MOUNTAIN_APEX_R.y + 24} `
    + `C ${MOUNTAIN_APEX_R.x + 60} ${MOUNTAIN_APEX_R.y + 90}, `
    + `${MOUNTAIN_APEX_R.x + 20} ${MOUNTAIN_APEX_R.y + 170}, `
    + `${MOUNTAIN_APEX_R.x + 90} ${MOUNTAIN_APEX_R.y + 230} `
    + `C ${MOUNTAIN_APEX_R.x + 150} ${MOUNTAIN_APEX_R.y + 280}, `
    + `${MOUNTAIN_APEX_R.x + 110} ${MOUNTAIN_APEX_R.y + 340}, `
    + `${MOUNTAIN_BASE_R.x - 20} ${MOUNTAIN_BASE_R.y - 10}`;

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${VOLCANO_VB_W} ${VOLCANO_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={conduitClipY} width={VOLCANO_VB_W} height={VOLCANO_VB_H - conduitClipY} />
        </clipPath>
      </defs>

      {/* 땅속 암반 블록 (항상 표시) */}
      <rect
        x={30} y={GROUND_Y} width={VOLCANO_VB_W - 60} height={UNDERGROUND_BOTTOM - GROUND_Y}
        rx={30} fill={rockColor} stroke={stroke} strokeWidth={SW}
      />

      {/* 산 실루엣 (항상 표시, 정상은 분화구 개구부만큼 평평) */}
      <path
        d={`M ${MOUNTAIN_BASE_L.x} ${MOUNTAIN_BASE_L.y} L ${MOUNTAIN_APEX_L.x} ${MOUNTAIN_APEX_L.y} `
          + `L ${MOUNTAIN_APEX_R.x} ${MOUNTAIN_APEX_R.y} L ${MOUNTAIN_BASE_R.x} ${MOUNTAIN_BASE_R.y} Z`}
        fill={mountainColor} stroke={stroke} strokeWidth={SW}
      />

      {/* 통로(비어 있을 때의 옅은 안내선) */}
      <path d={conduitD} fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={0.28} />

      {/* 분화구 개구부(어두운 구멍) */}
      <ellipse cx={CRATER_PT.x} cy={CRATER_PT.y} rx={CONDUIT_TOP_HALF_W} ry={13} fill={stroke} opacity={0.22} />

      {/* 마그마 방 (항상 magmaColor 로 채워짐 - 녹은 바위는 원래 거기 있다) */}
      <ellipse
        cx={CHAMBER_CENTER.x} cy={CHAMBER_CENTER.y} rx={CHAMBER_RX} ry={CHAMBER_RY}
        fill={magmaColor} stroke={stroke} strokeWidth={SW}
      />

      {/* 화산 통로 안에서 차오르는 마그마(risingProgress) */}
      <g clipPath={`url(#${clipId})`}>
        <path d={conduitD} fill={magmaColor} />
      </g>

      {/* 위에서 누르는 압력 화살표 3개 */}
      {PRESSURE_ARROW_X.map((ax, i) => (
        <ArrowDown
          key={i} x={ax} topY={GROUND_Y + 26} bottomY={CHAMBER_CENTER.y - CHAMBER_RY - 8}
          opacity={pressureOpacity} color={stroke}
        />
      ))}

      {/* 기체 방울 3개 */}
      {GAS_BUBBLES.map((b, i) => {
        const span = 1 - REVEAL_AT[i] || 1;
        const reveal = smooth((dissolveP - REVEAL_AT[i]) / span);
        const moved = smooth(risingP);
        const px = lerp(b.x, b.rise.x, moved);
        const py = lerp(b.y, b.rise.y, moved);
        const r = lerp(10, b.rMax, smooth(expandP));
        const opacity = clamp01(reveal) * bubbleFade;
        if (opacity <= 0.001) return null;
        return (
          <g key={i} opacity={opacity}>
            <circle cx={px} cy={py} r={r} fill={gasColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
            <ellipse cx={px - r * 0.3} cy={py - r * 0.3} rx={r * 0.26} ry={r * 0.15} fill="#FFFFFF" opacity={0.7} />
          </g>
        );
      })}

      {/* 묽은 마그마: 잔잔히 흐르는 용암 줄기 */}
      {flowT > 0.01 ? (
        <>
          <path d={flowD} fill="none" stroke={magmaColor} strokeWidth={20} strokeLinecap="round" opacity={flowT} />
          <ellipse cx={MOUNTAIN_BASE_R.x - 30} cy={MOUNTAIN_BASE_R.y - 6} rx={46} ry={16} fill={magmaColor} opacity={flowT * 0.9} />
        </>
      ) : null}

      {/* 끈적한 마그마: 격렬히 튀는 둥근 마그마 방울 + 옅은 김(무섭지 않게 뾰족한 모양 없음) */}
      {burstT > 0.01 ? (
        <>
          <circle cx={CRATER_PT.x} cy={CRATER_PT.y - 40} r={70 * smooth(eruptP)} fill={ashColor} opacity={burstT * 0.5} />
          {BURST_BLOBS.map((b, i) => (
            <circle
              key={i}
              cx={CRATER_PT.x + b.dx * smooth(eruptP)}
              cy={CRATER_PT.y + b.dy * smooth(eruptP)}
              r={b.r * (0.5 + 0.5 * smooth(eruptP))}
              fill={magmaColor}
              opacity={burstT}
            />
          ))}
        </>
      ) : null}
    </svg>
  );
};

export default VolcanoDiagram;
