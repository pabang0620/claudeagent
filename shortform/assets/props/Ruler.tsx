/** 눈금자. 길이를 "감으로" 말하지 않고 눈에 보이는 기준으로 대는 용도.
 *
 *  1화에서는 30cm 자로 기린 목뼈 25cm 를 쟀다. 단위 문자열을 props 로 받으므로
 *  cm 뿐 아니라 m, km, 초 등 임의 눈금에도 쓸 수 있다.
 *
 *  좌표 규약: x = originX + value * pxPerUnit. 막대(CompareBar)와 같은 스케일을
 *  쓰면 막대 끝이 눈금과 정확히 맞는다.
 */
import React from 'react';
import { C, FONT, FS, SW } from '../theme';

export interface RulerProps {
  /** 눈금 최대값 (0 부터 이 값까지) */
  max: number;
  /** 1 단위당 px */
  pxPerUnit: number;
  /** 0 눈금의 x 좌표 */
  originX?: number;
  /** 자 몸통 상단 y (svg 안 좌표) */
  top?: number;
  /** 자 몸통 높이 */
  height?: number;
  /** 큰 눈금 간격 (기본 5) */
  majorEvery?: number;
  /** 숫자를 표시할 눈금 값 목록. 기본은 majorEvery 배수 */
  labels?: number[];
  /** 강조 마커를 찍을 값 (없으면 표시 안 함) */
  markAt?: number;
  markColor?: string;
  stroke?: string;
  fill?: string;
  labelColor?: string;
  strokeWidth?: number;
  /** svg 전체 폭·높이 */
  width?: number;
  svgHeight?: number;
  style?: React.CSSProperties;
}

export const Ruler: React.FC<RulerProps> = ({
  max, pxPerUnit, originX = 0, top = 40, height = 96,
  majorEvery = 5, labels, markAt, markColor = C.coral,
  stroke = C.ink, fill = C.paper, labelColor = C.inkSoft, strokeWidth = SW,
  width, svgHeight = 200, style,
}) => {
  const w = width ?? originX + max * pxPerUnit + 40;
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);
  const nums = labels ?? ticks.filter((i) => i % majorEvery === 0);
  return (
    <svg width={w} height={svgHeight} style={style} shapeRendering="geometricPrecision">
      <rect
        x={originX} y={top} width={max * pxPerUnit} height={height} rx={16}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />
      {ticks.map((i) => {
        const x = originX + i * pxPerUnit;
        const big = i % majorEvery === 0;
        return (
          <line
            key={i} x1={x} y1={top} x2={x} y2={top + (big ? height * 0.46 : height * 0.25)}
            stroke={stroke} strokeWidth={big ? 6 : 3} strokeLinecap="round"
          />
        );
      })}
      {nums.map((v) => (
        <text
          key={v} x={originX + v * pxPerUnit} y={top + height * 0.88} textAnchor="middle"
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: FS.tiny, fill: labelColor }}
        >
          {v}
        </text>
      ))}
      {markAt !== undefined ? (
        <g transform={`translate(${originX + markAt * pxPerUnit} 0)`}>
          <line x1={0} y1={0} x2={0} y2={top} stroke={markColor} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={0} r={9} fill={markColor} />
        </g>
      ) : null}
    </svg>
  );
};

export default Ruler;
