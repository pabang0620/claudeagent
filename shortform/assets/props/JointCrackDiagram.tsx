/** "손가락 관절을 꺾을 때 나는 뚝 소리가 뼈가 부딪히는 소리가 아니라, 관절액에 녹아있던
 *  기체가 순간적으로 기포로 뭉치는 소리다"는 인과를 보여주는 손가락 관절 단면 다이어그램
 *  (general-ep102, "손가락 꺾을 때 뚝 소리 나는 이유").
 *
 *  REGISTRY 확인 완료(원칙 0) - `props/Hand.tsx`(Finger/FingerCrossSection)는 피부 주름·
 *  혈관 수축만 다뤄 관절 내부 구조(관절낭·관절액·용해 기체)가 없고, `props/SodaCan.tsx`의
 *  기포 표현은 캔 전용 좌표계라 재사용 부적합해 새로 만들었다.
 *
 *  뼈 2개(위/아래, 손가락 마디를 단순화한 둥근 사각형) 사이를 관절낭(캡슐, 관절액 채움)이
 *  감싼 단면. 독립 레이어 3개(HiccupDiagram과 같은 원칙 - "지금 이 순간의 상태"만 그리고,
 *  시간에 따른 곡선은 호출 씬이 progress()로 만들어 넘긴다):
 *
 *   - gapWiden (0~1): 0 = 평소 좁은 관절 간격, 1 = 손가락을 꺾어 순간적으로 벌어진 간격.
 *     뼈 2개가 서로 멀어지고 관절낭이 그만큼 세로로 늘어난다.
 *   - bubbleForm (0~1): 0 = 흩어진 작은 기체 방울 6개(관절액에 녹아있는 상태), 1 = 그
 *     방울들이 중앙으로 모여 하나의 큰 기포로 합쳐진 상태. 작은 방울은 중앙으로 이동하며
 *     작아지고, 중앙 기포는 그만큼 커진다(합쳐지는 총량 보존 느낌).
 *   - bubbleDissolve (0~1): bubbleForm=1로 만들어진 중앙 기포가 다시 서서히 작아지며
 *     사라진다(관절액 속으로 재용해). bubbleForm 값은 그대로 유지한 채 이 레이어만 올려서
 *     쓴다(21화 이후 결함 D - 이전 레이어 상태를 명시적으로 유지).
 *
 *  세 레이어 모두 기본값 0이라 아무것도 안 넘기면 "평소 상태"(좁은 간격 + 흩어진 기체)가
 *  나온다. 작은 점을 여러 개 뿌리는 게 아니라 "녹아있는 기체가 기포로 뭉친다"는 물리적
 *  변화 자체를 표현하는 것이라 신체 표현 관련 채널 원칙(작은 점 반복 금지)과는 다른
 *  맥락이다 - 피부 위 돌기가 아니라 액체 속 기포이고, 다른 화(SodaCan 등)에서도 이미
 *  같은 방식으로 기포를 그린다.
 *
 *  "밀폐된 액체 속에 녹아있던 기체가 압력 변화로 기포가 되어 빠져나온다"는 구조를 갖는
 *  다른 소재(탄산음료 거품, 감압증 등) 전반 재사용 가능성이 있어 라이브러리에 등록한다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const JOINT_VB_W = 480;
export const JOINT_VB_H = 640;

const CX = JOINT_VB_W / 2;
const MID_Y = 340;
const BASE_GAP = 70;
const EXTRA_GAP = 90;
const BONE_HALF_W = 100;
const BONE_TOP = 30;
const BONE_BOTTOM = JOINT_VB_H - 30;
const CAPSULE_HALF_W = 130;
const CAPSULE_PAD = 46;
const BUBBLE_R_MAX = 46;

/** 라벨 앵커(뷰박스 좌표, 호출 씬이 Label을 얹을 때 쓴다).
 *  scale = width / JOINT_VB_W, screenX = x + pt.x * scale, screenY = y + pt.y * scale
 *  (PressureBoilingDiagram과 동일한 관례) */
export const JOINT_BONE_LABEL_PT = { x: CX + BONE_HALF_W + 50, y: BONE_TOP + 60 };
export const JOINT_BUBBLE_LABEL_PT = { x: CX + CAPSULE_HALF_W + 60, y: MID_Y };

/** 관절 간격이 벌어지기 전(gapWiden=0) 기준 흩어진 기체 방울 6개의 상대 위치.
 *  dx: 캡슐 중심 대비 좌우 비율(-1~1), t: 캡슐 세로 범위 안 위치 비율(0~1), r: 반지름 */
const DOTS = [
  { dx: -0.52, t: 0.20, r: 11 },
  { dx: 0.44, t: 0.16, r: 9 },
  { dx: -0.16, t: 0.5, r: 10 },
  { dx: 0.5, t: 0.58, r: 12 },
  { dx: 0.1, t: 0.84, r: 9 },
  { dx: -0.46, t: 0.8, r: 10 },
];

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export interface JointCrackDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0 = 평소 좁은 간격, 1 = 순간적으로 벌어진 간격 */
  gapWiden?: number;
  /** 0 = 흩어진 기체 방울, 1 = 중앙 기포 하나로 합쳐짐 */
  bubbleForm?: number;
  /** bubbleForm=1로 만들어진 중앙 기포가 서서히 사라짐 (bubbleForm은 그대로 유지) */
  bubbleDissolve?: number;
  stroke?: string;
  fill?: string;
  liquidColor?: string;
  gasColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const JointCrackDiagram: React.FC<JointCrackDiagramProps> = ({
  width, x = 0, y = 0, gapWiden = 0, bubbleForm = 0, bubbleDissolve = 0,
  stroke = C.ink, fill = C.paper, liquidColor = 'rgba(95,169,214,0.30)', gasColor = C.paper,
  strokeWidth = SW, style,
}) => {
  const gw = clamp01(gapWiden);
  const bf = smooth(clamp01(bubbleForm));
  const bd = smooth(clamp01(bubbleDissolve));

  const gap = BASE_GAP + EXTRA_GAP * gw;
  const boneTopBottom = MID_Y - gap / 2;
  const boneBottomTop = MID_Y + gap / 2;

  const capsuleTop = MID_Y - gap / 2 - CAPSULE_PAD;
  const capsuleBottom = MID_Y + gap / 2 + CAPSULE_PAD;
  const capsuleH = capsuleBottom - capsuleTop;

  // 중앙 기포: bubbleForm으로 자라고, bubbleDissolve로 다시 줄어든다(같은 배율을 반지름·
  // 불투명도에 함께 적용해 "작아지며 사라진다"는 느낌을 준다)
  const dissolveFactor = 1 - bd;
  const bubbleR = BUBBLE_R_MAX * bf * dissolveFactor;
  const bubbleOpacity = bf * dissolveFactor;

  return (
    <svg
      viewBox={`0 0 ${JOINT_VB_W} ${JOINT_VB_H}`}
      width={width}
      height={(width * JOINT_VB_H) / JOINT_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 관절낭(캡슐) - 관절액 채움, 간격이 벌어질수록 세로로 늘어난다 */}
      <rect
        x={CX - CAPSULE_HALF_W} y={capsuleTop} width={CAPSULE_HALF_W * 2} height={capsuleH}
        rx={CAPSULE_HALF_W} fill={liquidColor} stroke={stroke} strokeWidth={strokeWidth * 0.6}
      />

      {/* 위쪽 뼈 마디 */}
      <rect
        x={CX - BONE_HALF_W} y={BONE_TOP} width={BONE_HALF_W * 2} height={boneTopBottom - BONE_TOP}
        rx={BONE_HALF_W * 0.55} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />
      {/* 아래쪽 뼈 마디 */}
      <rect
        x={CX - BONE_HALF_W} y={boneBottomTop} width={BONE_HALF_W * 2} height={BONE_BOTTOM - boneBottomTop}
        rx={BONE_HALF_W * 0.55} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />

      {/* 흩어진 기체 방울 - bubbleForm이 커질수록 중앙으로 모이며 작아진다 */}
      {DOTS.map((d, i) => {
        const baseX = CX + d.dx * CAPSULE_HALF_W;
        const baseY = capsuleTop + d.t * capsuleH;
        const dx = baseX + (CX - baseX) * bf;
        const dy = baseY + (MID_Y - baseY) * bf;
        const r = d.r * (1 - bf);
        if (r <= 0.5) return null;
        return (
          <circle key={i} cx={dx} cy={dy} r={r} fill={gasColor} stroke={stroke} strokeWidth={SW_THIN * 0.5} />
        );
      })}

      {/* 중앙 기포 (여러 방울이 합쳐진 상태) */}
      {bubbleOpacity > 0.01 ? (
        <>
          <circle cx={CX} cy={MID_Y} r={bubbleR} fill={gasColor} stroke={stroke} strokeWidth={strokeWidth * 0.55} opacity={bubbleOpacity} />
          <ellipse
            cx={CX - bubbleR * 0.32} cy={MID_Y - bubbleR * 0.32} rx={bubbleR * 0.28} ry={bubbleR * 0.18}
            fill={C.sky} opacity={bubbleOpacity * 0.8}
          />
        </>
      ) : null}
    </svg>
  );
};

export default JointCrackDiagram;
