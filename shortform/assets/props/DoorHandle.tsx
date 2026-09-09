/** 레버형 문손잡이 (문 표면 + 백플레이트 + 레버).
 *
 *  "정전기가 금속에 닿는 순간 방전된다"는 general-ep16("겨울에 문손잡이를 잡으면 따끔한
 *  이유")을 위해 만들었지만, 금속 손잡이/레버가 필요한 다른 소재(문·가전·차량 등 "만지면
 *  반응이 생기는 금속 접점") 전반에 재사용할 수 있도록 door 자체는 순수 도형만 그리고
 *  캐릭터의 손 움직임은 호출하는 씬이 담당한다(DoorFrame·HiccupDiagram과 같은 설계 원칙 -
 *  "이 순간의 상태"만 그린다). `DOOR_HANDLE_GRIP_PT`(viewBox 좌표계)를 함께 export해
 *  호출 씬이 손·스파크·라벨을 레버 위 정확한 지점에 앵커할 수 있게 했다.
 *
 *  glow(0~1): 접촉 순간 백플레이트 뒤에 은은한 하이라이트가 번진다(방전 직전 긴장감 연출).
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const DOOR_HANDLE_VB_W = 320;
export const DOOR_HANDLE_VB_H = 460;
/** 레버 중심(스파크·손·키가 닿는 지점), viewBox 좌표계 */
export const DOOR_HANDLE_GRIP_PT = { x: 168, y: 224 };

export interface DoorHandleProps {
  /** 화면상 폭(px). 높이는 viewBox 비율(320:460)로 자동 결정 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 접촉 순간의 은은한 하이라이트 */
  glow?: number;
  stroke?: string;
  doorColor?: string;
  plateColor?: string;
  glowColor?: string;
  style?: React.CSSProperties;
}

export const DoorHandle: React.FC<DoorHandleProps> = ({
  width, x = 0, y = 0, glow = 0,
  stroke = C.ink, doorColor = C.browningSoft, plateColor = C.hillFar, glowColor = C.goldSoft,
  style,
}) => {
  const height = (width * DOOR_HANDLE_VB_H) / DOOR_HANDLE_VB_W;
  const g = clamp01(glow);
  return (
    <svg
      width={width} height={height}
      viewBox={`0 0 ${DOOR_HANDLE_VB_W} ${DOOR_HANDLE_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 문 표면 */}
      <rect
        x={0} y={0} width={DOOR_HANDLE_VB_W} height={DOOR_HANDLE_VB_H} rx={22}
        fill={doorColor} stroke={stroke} strokeWidth={SW} strokeLinejoin="round"
      />
      {/* 목재 결 장식선 */}
      <line x1={40} y1={20} x2={40} y2={DOOR_HANDLE_VB_H - 20} stroke={stroke} strokeWidth={3} opacity={0.14} />
      <line x1={DOOR_HANDLE_VB_W - 40} y1={20} x2={DOOR_HANDLE_VB_W - 40} y2={DOOR_HANDLE_VB_H - 20} stroke={stroke} strokeWidth={3} opacity={0.14} />

      {/* 접촉 글로우 */}
      {g > 0.01 ? (
        <circle
          cx={DOOR_HANDLE_GRIP_PT.x} cy={DOOR_HANDLE_GRIP_PT.y} r={92}
          fill={glowColor} opacity={g * 0.75}
        />
      ) : null}

      {/* 백플레이트 */}
      <rect
        x={100} y={70} width={110} height={280} rx={38}
        fill={plateColor} stroke={stroke} strokeWidth={SW * 0.85} strokeLinejoin="round"
      />
      {/* 열쇠 구멍 */}
      <circle cx={155} cy={330} r={12} fill={stroke} opacity={0.55} />
      <rect x={150} y={336} width={10} height={16} fill={stroke} opacity={0.55} />

      {/* 레버 (살짝 아래로 기운 형태) */}
      <g transform={`rotate(-8 ${DOOR_HANDLE_GRIP_PT.x} ${DOOR_HANDLE_GRIP_PT.y})`}>
        <rect
          x={DOOR_HANDLE_GRIP_PT.x - 18} y={DOOR_HANDLE_GRIP_PT.y - 22} width={36} height={44} rx={18}
          fill={plateColor} stroke={stroke} strokeWidth={SW * 0.85}
        />
        <rect
          x={DOOR_HANDLE_GRIP_PT.x - 6} y={DOOR_HANDLE_GRIP_PT.y - 18} width={150} height={36} rx={18}
          fill={plateColor} stroke={stroke} strokeWidth={SW * 0.85}
        />
      </g>
    </svg>
  );
};

export default DoorHandle;
