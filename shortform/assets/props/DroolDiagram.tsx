/** "반사 신호가 반복되는 주기 자체가 빨랐다가 느려지고, 그 결과 액체가 고여 넘친다"는
 *  구조를 보여주는 범용 다이어그램(general-ep95, "자고 일어나면 베개가 젖어 있는 이유").
 *
 *  REGISTRY 확인 완료 - `NerveSignal`은 두 지점 간 단발성 신호 이동만 표현해 "반복 주기
 *  자체가 빨라졌다 느려진다"는 이번 구조를 못 그린다. `DogNoseCloseup`(general-ep19)의
 *  `sniffRateBoost`(반복 주기 자체를 느림<->빠름으로 바꾸는 기법)를 그대로 가져와
 *  `swallowRateBoost`로 이름만 바꿨다(값 의미도 동일 - 0=느긋한 리듬, 1=촘촘한 리듬).
 *  입 안 단면은 `MouthHealDiagram`(general-ep91)이 이미 확립한 "단면을 볼 때는 원 하나로
 *  그린다"는 채널 관례(원형 단면 = 안쪽 조직/공간)를 그대로 재사용해 좌표를 눈대중으로
 *  다시 그리지 않았다.
 *
 *  채널 원칙(작은 점을 여러 개 뿌리지 않는다, "징그럽다" 재발 방지)에 따라 침은 큰 물방울
 *  하나(pool)와 큰 물방울 하나(drip)로만 표현하고, 신호는 화살표 하나로만 표현한다.
 *
 *  독립 진행도 4개를 받는다(undefined면 기본값으로 그 레이어가 안 보이거나 정지 상태):
 *   - `swallowRateBoost`(0~1): 목 안 삼킴 신호(화살표 하나)가 식도 통로를 따라 아래로
 *     반복해서 흐르는 주기 자체를 느림(0, 잠든 상태) <-> 빠름(1, 깨어있는 상태)으로 바꾼다.
 *     반사가 "멈추는" 게 아니라 "느려지는" 것이라 boost=0 이어도 아주 가끔은 흐른다
 *     (SWALLOW_PERIOD_SLOW 가 유한값).
 *   - `poolLevel`(0~1): 입 안 단면 바닥에 침이 서서히 고인다(원 안을 채우는 파란 액체,
 *     원 바깥으로는 절대 넘치지 않는다 - clipPath로 원 안에 가둠).
 *   - `dripProgress`(0~1): 입가(원 둘레의 한 점)에서 침 한 방울이 큰 물방울 하나로
 *     떨어져 나와 아래로 흘러내린다.
 *   - `gravityTilt`(-1~1): dripProgress 로 흘러내리는 방향(가로 오프셋)을 바꾼다. 옆으로
 *     누운 자세를 나란히 비교하는 곁가지(s7)에서 이 다이어그램을 작게 두 번 써서
 *     gravityTilt=0(똑바로, 안 흐름)과 gravityTilt=±1(옆으로, 크게 흐름)을 대비시킨다.
 *
 *  `f`(프레임)는 침샘 맥동·삼킴 신호 반복에 쓴다(DogNoseCloseup과 동일 예외 패턴,
 *  Math.random 미사용 - 원칙 3).
 *
 *  "반사 주기가 느려져 결과물이 고여 넘친다"는 구조를 갖는 다른 소재(눈 깜빡임 둔화로
 *  안구가 건조해지는 것의 반대 사례, 심박·호흡 리듬 둔화 등) 전반 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

export const DROOL_VB_W = 700;
export const DROOL_VB_H = 860;

const CX = 350;
const CY = 340;
const R_OUTER = 210;

/** 침샘 위치(입 안 단면 안쪽 위) */
const GLAND_PT = { x: CX + 78, y: CY - 118 };
/** 입가(원 둘레의 한 점) - 여기서 침이 흘러나온다 */
const CORNER_PT = { x: CX + R_OUTER * 0.82, y: CY + R_OUTER * 0.52 };

/** 침샘 라벨 앵커 - 호출 씬이 이 지점 위에 Label("침샘" 등)을 얹는다. 침샘이 원 테두리에
 *  가까워(GLAND_PT.y=222, 원 상단=CY-R_OUTER=130) 침샘 위쪽 기준으로 잡으면 라벨이 원
 *  테두리에 걸친다(general-ep95 s3 스틸 선점검에서 발견) - 그래서 원 바깥 위쪽 여백에
 *  고정한다(x만 침샘과 맞추고 y는 원 상단 훨씬 위). Label의 y는 텍스트 박스 상단이므로
 *  (Caption.tsx Label 참고) 글자 높이(약 48px, size 40 기준)만큼 더 위로 뺀다. */
export const DROOL_GLAND_LABEL_PT = { x: GLAND_PT.x, y: CY - R_OUTER - 96 };
/** 입가(침이 흘러나오는 지점) 앵커 - 호출 씬이 화살표·라벨을 이 지점에 앵커링할 때 쓴다 */
export const DROOL_CORNER_PT = CORNER_PT;

/** 삼킴 신호 반복 주기(프레임). boost=0 이어도 아주 가끔은 흐른다(멈추는 게 아니라 느려짐) */
const SWALLOW_PERIOD_SLOW = 70;
const SWALLOW_PERIOD_FAST = 24;

/** TearDropDiagram(general-ep81)/PalmSweatDiagram과 같은 물방울 윤곽 공식(재사용, 좌표
 *  재발명 없음). w/h를 받아 <path>+하이라이트 <ellipse>를 반환한다. */
function dropletOutline(w: number, h: number, stroke: string, fill: string, strokeWidth: number) {
  return (
    <>
      <path
        d={`M ${w / 2} 0
            C ${w * 0.1} ${h * 0.42} 0 ${h * 0.6} 0 ${h * 0.76}
            A ${w / 2} ${w / 2} 0 0 0 ${w} ${h * 0.76}
            C ${w} ${h * 0.6} ${w * 0.9} ${h * 0.42} ${w / 2} 0 Z`}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
      />
      <ellipse cx={w * 0.36} cy={h * 0.6} rx={w * 0.09} ry={w * 0.15} fill="#FFFFFF" opacity={0.45} />
    </>
  );
}

export interface DroolDiagramProps {
  /** 씬 로컬 프레임. 침샘 맥동·삼킴 신호 반복 위상에 쓴다 */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 삼킴 신호 반복 주기(0=느긋한 s5, 1=촘촘한 s4) */
  swallowRateBoost?: number;
  /** 0~1. 입 안 단면 바닥에 침이 고이는 정도 */
  poolLevel?: number;
  /** 0~1. 입가에서 침 한 방울이 흘러내리는 정도 */
  dripProgress?: number;
  /** -1~1. dripProgress 로 흘러내리는 방향(가로 오프셋) - 0=똑바로 아래, ±1=옆으로 크게 */
  gravityTilt?: number;
  stroke?: string;
  /** 입 안 단면 채움색 */
  cavityFill?: string;
  /** 침(액체) 색 */
  liquidColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const DroolDiagram: React.FC<DroolDiagramProps> = ({
  f = 0, width, x = 0, y = 0,
  swallowRateBoost = 0, poolLevel = 0, dripProgress = 0, gravityTilt = 0,
  stroke = C.ink, cavityFill = C.coralSoft, liquidColor = C.waterCool,
  strokeWidth = SW, style,
}) => {
  const height = (width * DROOL_VB_H) / DROOL_VB_W;
  const clipId = React.useId();

  const period = lerp(SWALLOW_PERIOD_SLOW, SWALLOW_PERIOD_FAST, swallowRateBoost);
  const swallowPhase = (f % period) / period;
  const swallowOpacity = Math.sin(Math.PI * swallowPhase);
  const throatTop = CY + R_OUTER - 26;
  const throatBottom = CY + R_OUTER + 168;
  const swallowY = lerp(throatTop, throatBottom, swallowPhase);

  const glandPulse = 0.5 + 0.5 * Math.sin(f / 20);

  const pool = clamp01(poolLevel);
  const poolH = pool * R_OUTER * 1.5;
  const poolTop = CY + R_OUTER - poolH;

  const drip = clamp01(dripProgress);
  const dripW = 66 * (0.55 + 0.45 * drip);
  const dripH = dripW * 1.28;
  const dripDx = gravityTilt * 96 * drip;
  const dripCx = CORNER_PT.x + dripDx;
  const dripCy = CORNER_PT.y + drip * 300;
  const dripOpacity = drip <= 0.001 ? 0 : Math.min(1, drip * 3.2);

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${DROOL_VB_W} ${DROOL_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={CX} cy={CY} r={R_OUTER - strokeWidth * 0.4} />
        </clipPath>
      </defs>

      {/* 목 통로(식도) - 입 안 단면 아래로 이어지는 좁은 관 */}
      <path
        d={`M ${CX - 74} ${throatTop} L ${CX - 46} ${throatBottom}
            Q ${CX} ${throatBottom + 24} ${CX + 46} ${throatBottom}
            L ${CX + 74} ${throatTop}`}
        fill={C.roomDeep} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
      />

      {/* 입 안 단면 - 원 하나 (MouthHealDiagram과 동일 관례) */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={cavityFill} stroke={stroke} strokeWidth={strokeWidth} />

      {/* 고인 침 - 원 안쪽에만 채워지는 액체(클립으로 원 밖으로 안 넘침) */}
      {pool > 0.005 ? (
        <rect
          x={CX - R_OUTER - 10} y={poolTop} width={(R_OUTER + 10) * 2} height={poolH + 40}
          fill={liquidColor} opacity={0.82} clipPath={`url(#${clipId})`}
        />
      ) : null}
      {pool > 0.005 ? (
        <path
          d={`M ${CX - R_OUTER} ${poolTop} Q ${CX - R_OUTER / 2} ${poolTop - 10} ${CX} ${poolTop} Q ${CX + R_OUTER / 2} ${poolTop + 10} ${CX + R_OUTER} ${poolTop}`}
          fill="none" stroke={liquidColor} strokeWidth={strokeWidth * 0.7} opacity={0.9}
          clipPath={`url(#${clipId})`}
        />
      ) : null}

      {/* 침샘 - 항상 존재(자는 동안에도 침이 계속 만들어진다는 전제), 은은한 맥동 */}
      <circle
        cx={GLAND_PT.x} cy={GLAND_PT.y} r={30 + 3 * glandPulse}
        fill={C.gold} stroke={stroke} strokeWidth={strokeWidth * 0.75}
      />

      {/* 삼킴 신호 - 목 통로를 따라 반복해서 흐르는 화살표 하나(점 무리 대신 화살표 하나) */}
      {swallowOpacity > 0.02 ? (
        <polygon
          points={`${CX},${swallowY + 22} ${CX - 22},${swallowY - 16} ${CX + 22},${swallowY - 16}`}
          fill={C.gold} stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity={swallowOpacity}
        />
      ) : null}

      {/* 입가에서 흘러내리는 침 한 방울 - 큰 물방울 하나 */}
      {dripOpacity > 0.01 ? (
        <g
          transform={`translate(${dripCx - dripW / 2} ${dripCy - dripH / 2})`}
          opacity={dripOpacity}
        >
          {dropletOutline(dripW, dripH, stroke, liquidColor, strokeWidth * 0.7)}
        </g>
      ) : null}
    </svg>
  );
};

export default DroolDiagram;
