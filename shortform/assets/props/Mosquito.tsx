/** 모기. 사실적으로 그리면 징그러워지는 소재라("신체 표현은 최소한으로" 절) 둥근 몸통 2덩이
 *  + 날개 2장 + 다리 2개(단순화, 촘촘하게 여러 개 그리지 않음) + 눈 1개(원 하나, 겹눈을
 *  점 무리로 표현하지 않음) + 뾰족한 침(단일 선) 으로만 구성한 귀여운 도형 캐릭터다.
 *
 *  f(프레임)로 날개 파닥임을 결정적 사인파로 계산한다(Math.random 미사용, 원칙 3).
 *  `landed`(0~1)로 "날아다니는 상태"(날개를 계속 파닥임) <-> "내려앉은 상태"(날개를 접고
 *  다리로 몸을 지지)를 하나의 컴포넌트로 이어서 표현한다. 위치·경로 계산(궤도 비행 등)은
 *  이 컴포넌트가 아니라 호출 씬이 x/y 를 프레임마다 계산해 넘긴다(DogStanding 과 동일 원칙).
 *  "작고 날아다니며 특정 대상 주위를 맴도는 곤충/생물" 소재 전반 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

export interface MosquitoProps {
  /** 현재 프레임 (날개 파닥임 위상 계산용) */
  f: number;
  /** 화면상 가로 폭(px). 세로는 내부 비율(0.6)로 자동 계산 */
  width: number;
  /** 중심 x (화면 좌표) */
  x: number;
  /** 중심 y (화면 좌표) */
  y: number;
  /** 0=비행(날개를 계속 파닥임) 1=착지(날개를 접고 다리로 지지) */
  landed?: number;
  /** 몸통 방향 회전(도). 0 = 침이 왼쪽을 향함 */
  angle?: number;
  /** true 면 좌우 반전(침이 오른쪽을 향함) */
  flip?: boolean;
  stroke?: string;
  fill?: string;
  accent?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const VB_W = 200;
const VB_H = 120;

export const Mosquito: React.FC<MosquitoProps> = ({
  f, width, x, y, landed = 0, angle = 0, flip = false,
  stroke = C.ink, fill = C.paper, accent = C.coral, strokeWidth = SW_THIN, style,
}) => {
  const land = Math.max(0, Math.min(1, landed));
  // 날개 파닥임 - 착지할수록 진폭이 줄어든다(완전 착지 시 15%만 남아 살짝만 떤다)
  const flapAmp = 1 - land * 0.85;
  const flap = Math.sin(f * 1.9);
  const wingScaleY = (0.5 + 0.5 * Math.abs(flap)) * flapAmp + 0.06;
  const height = (width * VB_H) / VB_W;

  return (
    <div
      style={{
        position: 'absolute', left: x - width / 2, top: y - height / 2, width, height,
        transform: `rotate(${angle}deg) scaleX(${flip ? -1 : 1})`,
        ...style,
      }}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" shapeRendering="geometricPrecision">
        {/* 날개 2장 - 몸통 위쪽에서 파닥인다 */}
        <ellipse
          cx={78} cy={42} rx={30} ry={13} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
          opacity={0.88} transform={`translate(0 ${-6 * wingScaleY}) scale(1 ${wingScaleY})`}
        />
        <ellipse
          cx={78} cy={42} rx={30} ry={13} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
          opacity={0.88} transform={`translate(0 ${6 * wingScaleY}) scale(1 ${wingScaleY})`}
        />
        {/* 다리 2개(단순화 - 촘촘하게 여러 개 그리지 않는다) - 착지할수록 진하게 */}
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" opacity={0.3 + 0.7 * land}>
          <path d="M 100 62 L 88 94 L 74 102" />
          <path d="M 112 62 L 122 92 L 136 100" />
        </g>
        {/* 몸통 - 가슴(작은 원) + 배(길쭉한 타원) */}
        <ellipse cx={92} cy={54} rx={20} ry={17} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <ellipse cx={134} cy={58} rx={36} ry={15} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* 눈 - 원 하나만(겹눈을 점 무리로 표현하지 않는다) */}
        <circle cx={78} cy={48} r={6.5} fill={stroke} />
        {/* 침(단일 선, 끝만 액센트) */}
        <line x1={62} y1={56} x2={28} y2={58} stroke={stroke} strokeWidth={strokeWidth * 0.75} strokeLinecap="round" />
        <circle cx={26} cy={58} r={4.5} fill={accent} />
      </svg>
    </div>
  );
};

export default Mosquito;
