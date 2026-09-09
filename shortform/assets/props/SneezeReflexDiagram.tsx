/** "하나의 반사 신호가 뇌에서 나가 두 근육군(코·입 / 눈꺼풀)으로 동시에 분기된다"는 구조를
 *  보여주는 오버레이(재채기할 때 눈이 저절로 감기는 이유, general-ep41). HeadNerveDiagram·
 *  VoicePathDiagram과 같은 원칙(새 얼굴을 그리지 않고 이미 승인된 BustActor 위에 오버레이만
 *  얹음, breathAmp=0으로 숨쉬기 모션을 꺼 오버레이와 정렬 유지). 좌표는 전부 기존에 실측·승인된
 *  RIG 앵커에서 가져온다 - NOSE_PT(CilantroDiagram이 이미 export하는 코 위치, 눈·입 좌표
 *  중점), FOREHEAD_PT(HeadNerveDiagram이 이미 export하는 지점 - 여기서는 "뇌"를 상징하는
 *  자리로 재사용), MOUTH_PT(HeadNerveDiagram이 이미 export하는 입 위치). 눈꺼풀 목적지만
 *  새로 잡았다(SNEEZE_EYE_PT = RIG.EYE 실측 좌표에서 오른쪽 눈을 그대로 가져옴 - 새 얼굴
 *  좌표를 지어내지 않는다).
 *
 *  세 갈래 신호선을 시각적으로 구분하기 위해 상승선(코->뇌)은 왼쪽으로, 분기선 둘(뇌->입,
 *  뇌->눈)은 오른쪽으로 bow를 줘서 서로 겹쳐 보이지 않게 했다. HeadNerveDiagram과 동일하게
 *  `pathLength=1` dashoffset 트릭으로 선이 그려지는 것처럼 표현한다. 도착 지점에는 highlight
 *  글로우 + 아이콘(코·입=wind 아이콘, 눈꺼풀=감은 눈 곡선 하나 - "신체 표현은 최소한으로"
 *  원칙에 따라 사실적인 눈을 그리지 않고 커브 하나로만 표현)을 얹는다.
 *
 *  `itchGlow`(0~1, 코 자극), `ascendProgress`(0~1, 코->뇌 신호선 리빌 + 이동 신호점),
 *  `branchProgress`(0~1, 뇌->코입/눈꺼풀 두 갈래가 "동시에" 리빌되며 도착 마커가 페이드인),
 *  `syncPulse`(0~1, 두 마커가 정확히 같은 타이밍에 반짝이는 정도 - 호출 씬이 이미 완성한
 *  envelope를 넘기고, 이 컴포넌트는 밝기·스케일에 그대로 반영만 한다)를 독립 진행도로 받는다.
 *  "하나의 신호가 두 목적지로 동시에 갈라진다"는 구조를 갖는 다른 신체 반사 소재 전반(재채기
 *  외 다른 복합 반사) 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';
import { NOSE_PT } from './CilantroDiagram';
import { MOUTH_PT, FOREHEAD_PT } from './HeadNerveDiagram';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** "눈꺼풀" 목적지 - 오른쪽 눈(RIG.EYE 실측 좌표 그대로, 새 좌표 안 지어냄) */
export const SNEEZE_EYE_PT = { x: RIG.HEAD_CX + RIG.EYE.dx, y: RIG.EYE.y };
/** "뇌"를 상징하는 지점 - HeadNerveDiagram의 FOREHEAD_PT를 그대로 재사용 */
export const SNEEZE_BRAIN_PT = FOREHEAD_PT;

type Pt = { x: number; y: number };

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

// 상승 경로: 코 -> 뇌, 왼쪽으로 bow (얼굴 중심선 왼쪽에 머물러 head 실루엣 안쪽)
const ASCEND_C1: Pt = { x: 588, y: 428 };
const ASCEND_C2: Pt = { x: 582, y: 366 };
// 분기 A: 뇌 -> 입(코·입 근육), 오른쪽으로 bow해 상승 경로와 겹치지 않게 함
const BRANCH_MOUTH_C1: Pt = { x: 674, y: 358 };
const BRANCH_MOUTH_C2: Pt = { x: 676, y: 458 };
// 분기 B: 뇌 -> 눈(눈꺼풀 근육)
const BRANCH_EYE_C1: Pt = { x: 700, y: 344 };
const BRANCH_EYE_C2: Pt = { x: 716, y: 402 };

const ICON_SIZE = 78;

export interface SneezeReflexDiagramProps {
  /** 화면상 한 변 크기(px). BUST_VIEWBOX 가 정사각형이라 폭=높이다 */
  width: number;
  x?: number;
  y?: number;
  /** 코 자극(간지럼) 표시 0~1 */
  itchGlow?: number;
  /** 코 -> 뇌 신호선 리빌 + 이동 신호점 0~1. 생략하면 그리지 않는다 */
  ascendProgress?: number;
  /** 뇌 -> 코·입 / 뇌 -> 눈꺼풀 두 갈래 동시 리빌 + 도착 마커 페이드인 0~1. 생략하면 그리지 않는다 */
  branchProgress?: number;
  /** 두 도착 마커가 정확히 같은 타이밍에 반짝이는 정도 0~1 (호출 씬이 envelope를 만들어 넘김) */
  syncPulse?: number;
  /** 캐릭터 선 색 (기본 ink) */
  stroke?: string;
  /** 캐릭터 채움 색 (기본 paper) */
  fill?: string;
  style?: React.CSSProperties;
}

export const SneezeReflexDiagram: React.FC<SneezeReflexDiagramProps> = ({
  width, x = 0, y = 0, itchGlow, ascendProgress, branchProgress, syncPulse,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const itchP = clamp01(itchGlow ?? 0);
  const ascendP = ascendProgress === undefined ? null : clamp01(ascendProgress);
  const branchP = branchProgress === undefined ? null : clamp01(branchProgress);
  const pulseP = clamp01(syncPulse ?? 0);

  const signalPos = ascendP !== null
    ? cubicPoint(NOSE_PT, ASCEND_C1, ASCEND_C2, SNEEZE_BRAIN_PT, ascendP)
    : null;

  const markerOpacity = branchP !== null ? clamp01((branchP - 0.7) / 0.3) : 0;
  const pulseScale = 1 + 0.32 * pulseP;
  const pulseOpacityBoost = 0.4 * pulseP;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      {/* 캐릭터 얼굴 그대로. 오버레이와 어긋나지 않도록 숨쉬기 모션을 끈다 */}
      <BustActor size={width} left={0} top={0} pose={POSES.idle} breathAmp={0} color={stroke} fill={fill} />

      <svg
        viewBox={BUST_VIEWBOX}
        width={width}
        height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 코 간지럼 자극. NOSE_PT 는 눈·입 중점이라 입 바로 위에 붙어있어, 글로우를 살짝
            위로 띄우고 반경을 줄여 입 곡선과 겹치지 않게 한다(general-ep41 s2 실측 조정) */}
        {itchP > 0.001 ? (
          <g opacity={itchP}>
            <circle cx={NOSE_PT.x} cy={NOSE_PT.y - 14} r={30} fill={C.goldSoft} opacity={0.8} />
            <g transform={`translate(${NOSE_PT.x - 28} ${NOSE_PT.y - 14 - 28})`}>
              <ThemedIcon name="bolt" size={56} color={C.gold} strokePx={10} />
            </g>
          </g>
        ) : null}

        {/* 상승 경로: 코 -> 뇌 */}
        {ascendP !== null ? (
          <path
            d={`M ${NOSE_PT.x} ${NOSE_PT.y} C ${ASCEND_C1.x} ${ASCEND_C1.y}, ${ASCEND_C2.x} ${ASCEND_C2.y}, ${SNEEZE_BRAIN_PT.x} ${SNEEZE_BRAIN_PT.y}`}
            fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ascendP}
          />
        ) : null}
        {signalPos ? (
          <circle cx={signalPos.x} cy={signalPos.y} r={15} fill={C.coral} stroke={C.ink} strokeWidth={5} />
        ) : null}

        {/* 뇌 지점 표시 (상승 신호가 진행 중일 때) */}
        {ascendP !== null && ascendP > 0.05 ? (
          <circle
            cx={SNEEZE_BRAIN_PT.x} cy={SNEEZE_BRAIN_PT.y} r={22} fill="none"
            stroke={C.ink} strokeWidth={6} opacity={Math.min(1, ascendP * 1.4)}
          />
        ) : null}

        {/* 분기 A: 뇌 -> 입 (코·입 근육) */}
        {branchP !== null ? (
          <path
            d={`M ${SNEEZE_BRAIN_PT.x} ${SNEEZE_BRAIN_PT.y} C ${BRANCH_MOUTH_C1.x} ${BRANCH_MOUTH_C1.y}, ${BRANCH_MOUTH_C2.x} ${BRANCH_MOUTH_C2.y}, ${MOUTH_PT.x} ${MOUTH_PT.y}`}
            fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - branchP}
          />
        ) : null}

        {/* 분기 B: 뇌 -> 눈 (눈꺼풀 근육) */}
        {branchP !== null ? (
          <path
            d={`M ${SNEEZE_BRAIN_PT.x} ${SNEEZE_BRAIN_PT.y} C ${BRANCH_EYE_C1.x} ${BRANCH_EYE_C1.y}, ${BRANCH_EYE_C2.x} ${BRANCH_EYE_C2.y}, ${SNEEZE_EYE_PT.x} ${SNEEZE_EYE_PT.y}`}
            fill="none" stroke={C.waterCool} strokeWidth={9} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - branchP}
          />
        ) : null}

        {/* 도착 마커: 코·입 (같은 markerOpacity 를 써서 정확히 같은 타이밍에 페이드인) */}
        {markerOpacity > 0.001 ? (
          <g opacity={Math.min(1, markerOpacity + pulseOpacityBoost)}>
            <circle cx={MOUTH_PT.x} cy={MOUTH_PT.y} r={38 * pulseScale} fill={C.coralSoft} />
            <g
              transform={`translate(${MOUTH_PT.x - ICON_SIZE / 2} ${MOUTH_PT.y - ICON_SIZE / 2})`}
              style={{ transformOrigin: `${MOUTH_PT.x}px ${MOUTH_PT.y}px`, transform: `scale(${pulseScale})` }}
            >
              <ThemedIcon name="wind" size={ICON_SIZE} color={C.coral} strokePx={11} />
            </g>
          </g>
        ) : null}

        {/* 도착 마커: 눈꺼풀 (감은 눈 곡선 하나로만 표현, 사실적 눈을 새로 그리지 않는다) */}
        {markerOpacity > 0.001 ? (
          <g opacity={Math.min(1, markerOpacity + pulseOpacityBoost)}>
            <circle cx={SNEEZE_EYE_PT.x} cy={SNEEZE_EYE_PT.y} r={38 * pulseScale} fill={C.seaTop} />
            <path
              d={`M ${SNEEZE_EYE_PT.x - 26} ${SNEEZE_EYE_PT.y} Q ${SNEEZE_EYE_PT.x} ${SNEEZE_EYE_PT.y + 16 * pulseScale}, ${SNEEZE_EYE_PT.x + 26} ${SNEEZE_EYE_PT.y}`}
              fill="none" stroke={C.waterCool} strokeWidth={9} strokeLinecap="round"
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default SneezeReflexDiagram;
