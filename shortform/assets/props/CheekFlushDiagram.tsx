/** "피부 아래 혈관이 넓어지며 얼굴이 붉게 달아오른다"를 보여주는 얼굴 오버레이(술 마시면
 *  얼굴 빨개지는 이유). HeadNerveDiagram·SneezeReflexDiagram과 같은 원칙(새 얼굴을 그리지
 *  않고 이미 승인된 BustActor 위에 오버레이만 얹음, breathAmp=0으로 정렬 유지).
 *
 *  좌표는 새로 지어내지 않고 Character.tsx의 RIG.BLUSH(볼터치 실측 위치)를 그대로 재사용한다.
 *  혈관은 점을 여러 개 뿌리지 않고 볼마다 굵은 곡선 3가닥만 그린다("신체 표현은 최소한으로"
 *  원칙 - 점 여러 개가 징그럽다는 8화 재발 방지와 같은 이유로 선 개수도 소수로 제한).
 *  `flushProgress`가 오르면 (1) BustActor의 blush 값 자체가 1.0->1.5로 깊어지고,
 *  (2) 볼 바깥으로 뻗은 3가닥 선이 옅고 가는 상태에서 진하고 굵은 상태로 바뀐다(선이
 *  길어지는 게 아니라 두께·채도로 "넓어짐"을 표현 - 혈관이 자라나는 게 아니라 이미 있는
 *  혈관이 확장되는 현상이라 길이 변화보다 두께 변화가 더 정확한 은유다).
 *
 *  "체온·감정·자극 등으로 피부 혈관이 확장되며 붉어지는" 다른 소재(운동 후 홍조, 화끈거림
 *  등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C } from '../theme';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX, Pose } from '../character/Character';
import { POSES } from '../character/poses';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 볼 중심 - Character.tsx의 볼터치 실측 좌표 그대로(새 좌표 지어내지 않음) */
export const CHEEK_L_PT = { x: RIG.CX - RIG.BLUSH.dx, y: RIG.BLUSH.y };
export const CHEEK_R_PT = { x: RIG.CX + RIG.BLUSH.dx, y: RIG.BLUSH.y };

const VESSEL_COLOR = '#E0483A';
const VESSEL_LEN = 30;

/** 한 볼에서 바깥쪽으로 뻗는 3가닥 - degrees, 0=오른쪽. outward는 볼마다 부호가 다르다 */
const FAN_DEG = [-24, 0, 24];

function vesselPath(center: { x: number; y: number }, outwardDeg: number, deg: number, len: number) {
  const a = ((outwardDeg + deg) * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const ex = center.x + dx * len;
  const ey = center.y + dy * len;
  // 살짝 휘는 곡선을 위한 제어점 (수직 방향으로 소폭 오프셋)
  const nx = -dy;
  const ny = dx;
  const mx = center.x + dx * (len * 0.55) + nx * 6;
  const my = center.y + dy * (len * 0.55) + ny * 6;
  return `M ${center.x} ${center.y} Q ${mx} ${my}, ${ex} ${ey}`;
}

export interface CheekFlushDiagramProps {
  /** 씬 로컬 프레임(선택). 넘기면 아주 은은한 맥동을 얹는다 */
  f?: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX가 정사각형이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0=평상시(기본 볼터치만), 1=완전히 달아오름(혈관 3가닥씩 진하게 확장) */
  flushProgress: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const CheekFlushDiagram: React.FC<CheekFlushDiagramProps> = ({
  f = 0, width, x = 0, y = 0, flushProgress, stroke = C.ink, fill = C.paper, style,
}) => {
  const flushP = clamp01(flushProgress);
  const pulse = flushP > 0.01 ? 0.5 + 0.5 * Math.sin((f / 50) * Math.PI * 2) : 0;

  const pose: Pose = { ...POSES.idle, blush: 1 + flushP * 0.5 };
  const strokeW = 3 + 8 * flushP + pulse * 1.2;
  const opacity = 0.12 + 0.7 * flushP;

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style,
      }}
    >
      <BustActor size={width} left={0} top={0} pose={pose} breathAmp={0} color={stroke} fill={fill} />

      {flushP > 0.02 ? (
        <svg
          viewBox={BUST_VIEWBOX} width={width} height={width}
          style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        >
          <g opacity={opacity} stroke={VESSEL_COLOR} strokeWidth={strokeW} strokeLinecap="round" fill="none">
            {FAN_DEG.map((deg) => (
              <path key={`l-${deg}`} d={vesselPath(CHEEK_L_PT, 180, deg, VESSEL_LEN)} />
            ))}
            {FAN_DEG.map((deg) => (
              <path key={`r-${deg}`} d={vesselPath(CHEEK_R_PT, 0, deg, VESSEL_LEN)} />
            ))}
          </g>
        </svg>
      ) : null}
    </div>
  );
};

export default CheekFlushDiagram;
