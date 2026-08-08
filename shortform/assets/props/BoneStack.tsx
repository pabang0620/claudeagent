/** 블록을 아래에서 위로 쌓아 개수를 보여주는 스택.
 *
 *  1화에서는 목뼈였지만 "N개를 하나씩 세는" 연출은 어떤 주제에서도 쓴다
 *  (행성 개수, 단계 수, 층 수 등). 블록 크기·색·개수를 전부 props 로 받는다.
 *
 *  lit: 아래에서부터 점등된 개수 (0 ~ count)
 *  popAt(i): 블록 i 의 등장 진행도 0~1. 점등 순간 살짝 커졌다 돌아온다
 */
import React from 'react';
import { C, SW } from '../theme';

export interface BoneStackProps {
  /** 총 블록 수 */
  count?: number;
  /** 아래에서부터 켜진 개수 */
  lit: number;
  blockW: number;
  blockH: number;
  gap: number;
  /** 켜진 블록 색 */
  litColor?: string;
  /** 꺼진 블록 색 */
  offColor?: string;
  stroke?: string;
  strokeWidth?: number;
  /** 모서리 둥글기 비율 (짧은 변 대비). 0 = 각진 사각형 */
  radiusRatio?: number;
  popAt?: (i: number) => number;
  style?: React.CSSProperties;
}

export const BoneStack: React.FC<BoneStackProps> = ({
  count = 7, lit, blockW, blockH, gap,
  litColor = C.gold, offColor = C.paper, stroke = C.ink, strokeWidth = SW,
  radiusRatio = 0.36, popAt, style,
}) => {
  const totalH = count * blockH + (count - 1) * gap;
  const w = blockW + strokeWidth * 2;
  return (
    <svg
      viewBox={`0 0 ${w} ${totalH + strokeWidth * 2}`} width={w} height={totalH + strokeWidth * 2}
      style={style} shapeRendering="geometricPrecision"
    >
      {Array.from({ length: count }).map((_, i) => {
        const y = strokeWidth + (count - 1 - i) * (blockH + gap); // 아래에서 위로 1번부터
        const on = i < lit;
        const p = popAt ? popAt(i) : 1;
        const s = 1 + 0.12 * Math.sin(Math.PI * Math.min(1, p));
        const cx = w / 2;
        const cy = y + blockH / 2;
        return (
          <rect
            key={i}
            x={strokeWidth} y={y} width={blockW} height={blockH}
            rx={Math.min(blockW, blockH) * radiusRatio}
            fill={on ? litColor : offColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
            transform={`translate(${cx} ${cy}) scale(${on ? s : 1}) translate(${-cx} ${-cy})`}
          />
        );
      })}
    </svg>
  );
};

export default BoneStack;
