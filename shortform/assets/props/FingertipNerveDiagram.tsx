/** 손가락 끝 신경 다발 클로즈업. "손끝은 몸에서 신경이 가장 촘촘한 부위" 류의 설명에
 *  재사용하는 소품(general-ep38, "종이에 베이면 유독 아픈 이유" s2). REGISTRY 3절 확인
 *  완료 - HeadNerveDiagram·LegNerveDiagram·VoicePathDiagram은 각각 머리·다리 신경이고,
 *  손가락 끝 신경 밀도를 다루는 자산은 없었다.
 *
 *  `props/Hand.tsx`의 Finger와 같은 실루엣 규약(몸체 rect + 손톱 ellipse, 고정 실루엣)을
 *  그대로 따르되, 이 컴포넌트만의 목적인 "신경 다발이 끝으로 갈수록 촘촘히 모인다"를
 *  보여주기 위해 밑동 5곳에서 시작해 손끝 한 점으로 모이는 굵은 선 5가닥을 얹는다
 *  (오케스트레이터 지시 - 점 무리로 뿌리지 않고 굵은 선 몇 가닥으로 표현).
 *
 *  `nerveProgress`(0~1)는 HeadNerveDiagram과 같은 `pathLength=1` dashoffset 트릭으로
 *  신경 다발이 그려지는 것처럼 보이게 한다. 끝 지점의 은은한 글로우는 `f`(선택, 프레임)를
 *  받으면 펄스로, 안 받으면 고정 강도로 그린다(DogNoseCloseup과 같은 f 예외 패턴,
 *  Math.random 미사용 - 원칙 3).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const FINGERTIP_NERVE_VB_W = 300;
export const FINGERTIP_NERVE_VB_H = 420;
/** 신경 다발이 모이는 손끝 지점 (viewBox 좌표) - 라벨·글로우 앵커로 호출부가 재사용 가능 */
export const FINGERTIP_NERVE_TIP_PT = { x: 150, y: 66 };

const CX = 150;
const HALF_W = 80;
const BASE_Y = 388;
const TIP = FINGERTIP_NERVE_TIP_PT;
/** 밑동에서 갈라져 나오는 신경 다발 5가닥의 시작 x (몸체 폭 안에서 고르게) */
const BASE_XS = [96, 123, 150, 177, 204];

export interface FingertipNerveDiagramProps {
  /** 손끝 글로우 펄스에 쓰는 씬 로컬 프레임 (생략하면 고정 강도) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 신경 다발이 밑동에서 손끝으로 그려지는 진행도 */
  nerveProgress?: number;
  stroke?: string;
  fill?: string;
  nerveColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FingertipNerveDiagram: React.FC<FingertipNerveDiagramProps> = ({
  f, width, x = 0, y = 0, nerveProgress = 0, stroke = C.ink, fill = C.paper,
  nerveColor = C.coral, strokeWidth = SW, style,
}) => {
  const np = clamp01(nerveProgress);
  const pulse = f === undefined ? 1 : 0.55 + 0.45 * Math.sin((f / 40) * Math.PI * 2);
  const glowR = 30 + 8 * pulse;
  const glowOpacity = np > 0.05 ? (0.35 + 0.35 * pulse) * np : 0;

  return (
    <svg
      viewBox={`0 0 ${FINGERTIP_NERVE_VB_W} ${FINGERTIP_NERVE_VB_H}`}
      width={width} height={(width * FINGERTIP_NERVE_VB_H) / FINGERTIP_NERVE_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 손끝 글로우 (신경선 뒤에, 몸체 위에 - 밀도가 높다는 인상을 주는 은은한 후광) */}
      {glowOpacity > 0.01 ? (
        <circle cx={TIP.x} cy={TIP.y + 14} r={glowR} fill={C.goldSoft} opacity={glowOpacity} />
      ) : null}

      {/* 손가락 몸체 (고정 실루엣, Finger 와 동일한 규약) */}
      <rect
        x={CX - HALF_W} y={18} width={HALF_W * 2} height={BASE_Y - 18} rx={HALF_W}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />
      {/* 손톱 */}
      <ellipse
        cx={CX} cy={80} rx={40} ry={50} fill={C.coralSoft} stroke={stroke}
        strokeWidth={strokeWidth * 0.7} opacity={0.9}
      />

      {/* 신경 다발 5가닥 - 밑동에서 손끝 한 점으로 모인다.
          np가 정확히 0일 때 dashoffset=1이 dash/gap 경계(대시 길이=간격 길이=1)라 5가닥이
          만나는 TIP에 서브픽셀 점 아티팩트가 뭉쳐 보일 수 있어(실측 확인) np>0일 때만 그린다. */}
      {np > 0.001 ? (
      <g fill="none" strokeLinecap="round">
        {BASE_XS.map((bx, i) => {
          const c1x = bx * 0.55 + TIP.x * 0.45;
          const c1y = BASE_Y * 0.35 + TIP.y * 0.65;
          const c2x = bx * 0.2 + TIP.x * 0.8;
          const c2y = BASE_Y * 0.08 + TIP.y * 0.92;
          return (
            <path
              key={i}
              d={`M ${bx} ${BASE_Y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${TIP.x} ${TIP.y}`}
              stroke={nerveColor} strokeWidth={SW_THIN * 0.85}
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - np}
              opacity={0.85}
            />
          );
        })}
      </g>
      ) : null}
    </svg>
  );
};

export default FingertipNerveDiagram;
