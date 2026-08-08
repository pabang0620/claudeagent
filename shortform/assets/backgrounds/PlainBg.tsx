/** 기본 배경. 단색 + 아주 옅은 세로 그라데이션 + (선택) 바닥선.
 *
 *  어떤 주제에도 안 튀는 기본값이다. 배경으로 뭘 쓸지 정하지 못했으면 이것을 쓴다.
 *  캐릭터가 묻히지 않도록 채도를 낮게 유지하고, 색을 진하게 바꾸고 싶으면
 *  theme 의 배경 계열 토큰(sky/room/seaTop 등) 안에서 고른다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GROUND, H, W } from '../theme';

export interface PlainBgProps {
  /** 위쪽 색 */
  top?: string;
  /** 아래쪽 색 */
  bottom?: string;
  /** 그라데이션이 아래쪽 색으로 다 바뀌는 지점 (0~1) */
  stop?: number;
  /** 바닥선 y. null 이면 바닥선을 그리지 않는다 */
  ground?: number | null;
  groundColor?: string;
  /** 바닥 아래 면을 옅게 채울지 */
  floor?: boolean;
  floorOpacity?: number;
  children?: React.ReactNode;
}

export const PlainBg: React.FC<PlainBgProps> = ({
  top = C.sky, bottom = C.paper, stop = 0.62,
  ground = GROUND, groundColor = C.hill, floor = true, floorOpacity = 0.55,
  children,
}) => (
  <AbsoluteFill style={{ background: bottom, overflow: 'hidden' }}>
    <AbsoluteFill
      style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} ${Math.round(stop * 100)}%)` }}
    />
    {ground !== null ? (
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {floor ? (
          <rect
            x={-200} y={ground} width={W + 400} height={H - ground}
            fill={groundColor} opacity={floorOpacity * 0.6}
          />
        ) : null}
        <line
          x1={-200} y1={ground} x2={W + 200} y2={ground}
          stroke={groundColor} strokeWidth={10} strokeLinecap="round"
        />
      </svg>
    ) : null}
    {children}
  </AbsoluteFill>
);

export default PlainBg;
