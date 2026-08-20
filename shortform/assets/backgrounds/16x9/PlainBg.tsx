/** 기본 배경 - 16:9(가로) 캔버스 버전. 단색 + 아주 옅은 세로 그라데이션 + (선택) 바닥선.
 *
 *  `assets/backgrounds/PlainBg.tsx`(세로 9:16)와 같은 톤이다. 좌표만 1920x1080 캔버스에 맞게
 *  새로 계산했다(세로 버전 좌표를 그대로 늘리지 않았다). 특정 장소를 고정하지 않는 기본값이라는
 *  성격도 동일하게 유지한다 - 어떤 주제에도 안 튀는 기본 배경.
 *
 *  바닥선 기본 y(=ground)는 세로 버전의 비율(GROUND/H = 1250/1920 ≈ 0.651)을 그대로
 *  16:9 캔버스 높이(1080)에 적용해 703으로 잡았다. 화면이 넓어 바닥선이 화면 아래쪽에 있는
 *  인상은 세로판과 동일하게 유지된다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, H_LANDSCAPE, W_LANDSCAPE } from '../../theme';

/** 세로판 GROUND(1250)/H(1920) 비율을 그대로 적용한 값. 이 파일 전용 상수(세로판 theme.GROUND 를
 *  그대로 쓰지 않는다 - 캔버스 높이가 다르면 절대값을 그대로 재사용하면 안 된다). */
const GROUND_LANDSCAPE = 703;

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
  ground = GROUND_LANDSCAPE, groundColor = C.hill, floor = true, floorOpacity = 0.55,
  children,
}) => (
  <AbsoluteFill style={{ background: bottom, overflow: 'hidden' }}>
    <AbsoluteFill
      style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} ${Math.round(stop * 100)}%)` }}
    />
    {ground !== null ? (
      <svg width={W_LANDSCAPE} height={H_LANDSCAPE} style={{ position: 'absolute', left: 0, top: 0 }}>
        {floor ? (
          <rect
            x={-200} y={ground} width={W_LANDSCAPE + 400} height={H_LANDSCAPE - ground}
            fill={groundColor} opacity={floorOpacity * 0.6}
          />
        ) : null}
        <line
          x1={-200} y1={ground} x2={W_LANDSCAPE + 200} y2={ground}
          stroke={groundColor} strokeWidth={10} strokeLinecap="round"
        />
      </svg>
    ) : null}
    {children}
  </AbsoluteFill>
);

export default PlainBg;
