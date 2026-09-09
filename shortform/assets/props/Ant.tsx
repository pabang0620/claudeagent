/** 개미. 위에서 내려다본 시점(top-down) 전용 곤충 캐릭터다. "신체 표현은 최소한으로" 절을
 *  지켜 몸통 3덩이(머리·가슴·배, 배는 가슴보다 확실히 큰 타원)만 그리고, 다리는 실제
 *  6개가 아니라 좌우 2쌍(4개)으로 단순화했다(Mosquito가 다리 6개를 2개로 단순화한 것과
 *  같은 원칙). 눈은 머리 위 작은 점 2개(양쪽 하나씩, 겹눈을 점 무리로 그리지 않는다), 더듬이는
 *  2가닥의 단일 곡선(촘촘한 털 없음)뿐이다.
 *
 *  `f`(프레임)로 다리 스윙을 결정적 사인파로 계산한다(Math.random 미사용, 원칙 3) - 항상
 *  걷는 상태를 표현하고, 별도 "정지" prop은 두지 않았다(개미는 화면에 나올 때 대부분 이동
 *  중이라 Mosquito의 landed 같은 이분 상태가 필요 없었다). `angle`(도, atan2 규약 - 0=오른쪽)
 *  로 진행 방향을 정하면 몸 전체가 그 방향을 향해 회전한다(위치·경로 계산은 호출 씬이
 *  담당 - DogStanding/Mosquito와 동일 원칙). `sensing`(0~1)을 주면 더듬이가 평소보다 크게
 *  좌우로 흔들려 "냄새를 맡고 있다"는 상태를 표현한다(페로몬 자국을 따라가는 장면 전용).
 *
 *  "작은 곤충이 줄지어 이동하는" 소재 전반 재사용 가능성이 있어 에피소드 로컬이 아니라
 *  여기 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

export interface AntProps {
  /** 현재 프레임 (다리 스윙·더듬이 흔들림 위상 계산용) */
  f: number;
  /** 화면상 가로 폭(px, 머리끝~배끝 기준). 세로는 내부 비율(0.6)로 자동 계산 */
  width: number;
  /** 중심 x (화면 좌표) */
  x: number;
  /** 중심 y (화면 좌표) */
  y: number;
  /** 진행 방향 회전(도, atan2 규약). 0 = 머리가 오른쪽을 향함 */
  angle?: number;
  /** 0~1. 더듬이를 더 크게 흔들어 "냄새를 감지하는 중"을 표현 */
  sensing?: number;
  stroke?: string;
  fill?: string;
  accent?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const VB_W = 200;
const VB_H = 120;

export const Ant: React.FC<AntProps> = ({
  f, width, x, y, angle = 0, sensing = 0,
  stroke = C.ink, fill = C.paper, accent = C.coral, strokeWidth = SW_THIN, style,
}) => {
  const height = (width * VB_H) / VB_W;
  const walkPhase = f * 0.5;
  // 다리 두 그룹이 서로 반대 위상으로 스윙(교차보행) - 결정적 사인파, Math.random 미사용
  const swingA = Math.sin(walkPhase) * 7;
  const swingB = Math.sin(walkPhase + Math.PI) * 7;
  // 더듬이는 평소에도 아주 살짝 흔들리고, sensing=1이면 훨씬 크게 흔들린다
  const antennaWag = Math.sin(f * 0.7) * (4 + sensing * 14);

  return (
    <div
      style={{
        position: 'absolute', left: x - width / 2, top: y - height / 2, width, height,
        transform: `rotate(${angle}deg)`,
        ...style,
      }}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" shapeRendering="geometricPrecision">
        {/* 더듬이 2가닥 - 머리 앞쪽에서 뻗어나간다 */}
        <path
          d={`M 178 52 Q 196 ${34 - antennaWag} 208 ${18 - antennaWag * 1.4}`}
          fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.8} strokeLinecap="round"
        />
        <path
          d={`M 178 68 Q 196 ${86 + antennaWag} 208 ${102 + antennaWag * 1.4}`}
          fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.8} strokeLinecap="round"
        />
        {sensing > 0.15 ? (
          <circle cx={208} cy={60} r={14 * sensing} fill={accent} opacity={0.22 * sensing} />
        ) : null}

        {/* 다리 2쌍(4개, 실제 6개를 단순화) - 가슴 근처에서 위/아래로 뻗는다 */}
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
          <path d={`M 128 50 L 148 ${26 + swingA} L 166 ${14 + swingA}`} />
          <path d={`M 128 70 L 148 ${94 + swingB} L 166 ${106 + swingB}`} />
          <path d={`M 96 50 L 76 ${26 + swingB} L 56 ${13 + swingB}`} />
          <path d={`M 96 70 L 76 ${94 + swingA} L 56 ${107 + swingA}`} />
        </g>

        {/* 배(가장 큰 타원) - 허리(잘록한 마디)로 가슴과 연결 */}
        <ellipse cx={56} cy={60} rx={40} ry={27} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1={90} y1={60} x2={100} y2={60} stroke={stroke} strokeWidth={strokeWidth * 0.85} />
        {/* 가슴 */}
        <circle cx={112} cy={60} r={16} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* 머리 */}
        <circle cx={162} cy={60} r={18} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* 눈 - 점 2개만(겹눈을 점 무리로 표현하지 않는다) */}
        <circle cx={166} cy={52} r={4} fill={stroke} />
        <circle cx={166} cy={68} r={4} fill={stroke} />
        {/* 큰턱(단일 액센트 삼각형) */}
        <path d="M 178 60 L 190 55 L 190 65 Z" fill={accent} />
      </svg>
    </div>
  );
};

export default Ant;
