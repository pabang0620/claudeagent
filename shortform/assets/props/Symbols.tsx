/** 직접 그린 기호·아이콘. Tabler 아이콘으로 대체되지 않는(우리 스타일이 필요한) 것만 둔다. */
import React from 'react';
import { C, FONT, SW, SW_THIN } from '../theme';

/** 큰 물음표. 텍스트 기반이라 폰트 로딩 후에만 정상 표시된다(FontLoader 필수). */
export const QMark: React.FC<{
  size: number;
  /** 채움 (기본 gold) */
  color?: string;
  /** 외곽선 (기본 ink) */
  outline?: string;
  /** 표시 문자. '!' 등으로 바꿔 느낌표로도 쓴다 */
  glyph?: string;
  style?: React.CSSProperties;
}> = ({ size, color = C.gold, outline = C.ink, glyph = '?', style }) => (
  <div
    style={{
      position: 'absolute',
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1,
      color,
      WebkitTextStroke: `${Math.max(4, size * 0.05)}px ${outline}`,
      paintOrder: 'stroke fill',
      ...style,
    }}
  >
    {glyph}
  </div>
);

/** 원 + 작은 핵(nucleus) 점 하나로 그리는 "세포" 글리프(백혈구·면역세포 등).
 *  BruiseDiagram(general-ep61)의 로컬 WhiteCell과 같은 시각 문법을 두 번째로 쓰게 되어
 *  (general-ep97 NasalImmuneDiagram) 공용으로 승격했다(REGISTRY 원칙 0 - 두 번째로 쓰이면
 *  라이브러리로). 점 무리가 아니라 "큰 원 하나"로 그려 "징그럽다" 재발을 방지한다
 *  (21화 이후 결함 - 신체 표현은 최소한으로). */
export const ImmuneCell: React.FC<{
  cx: number;
  cy: number;
  r: number;
  /** 0~1. 0이면 그리지 않는다 */
  appear: number;
  stroke?: string;
  fill?: string;
  nucleusColor?: string;
  style?: React.CSSProperties;
}> = ({ cx, cy, r, appear, stroke = C.ink, fill = C.paper, nucleusColor = C.gold, style }) => {
  if (appear <= 0.001) return null;
  const s = 0.5 + 0.5 * appear;
  return (
    <g style={{ opacity: appear, ...style }} transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle r={r} fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
      <circle r={r * 0.42} fill={nucleusColor} opacity={0.85} />
    </g>
  );
};

/** 사람 상반신 실루엣 (목·어깨가 보이는 미니 아이콘). "사람은 이런데" 대비용. */
export const HumanNeckIcon: React.FC<{
  width: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({ width, stroke = C.ink, fill = C.paper, strokeWidth = SW, style }) => (
  <svg viewBox="0 0 240 330" width={width} style={style} shapeRendering="geometricPrecision">
    <path d="M 66 300 C 66 240, 78 214, 96 200 L 148 200 C 166 214, 178 240, 178 300"
      fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <circle cx={120} cy={116} r={82} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    <circle cx={94} cy={108} r={12} fill={stroke} />
    <circle cx={146} cy={108} r={12} fill={stroke} />
    <path d="M 98 148 C 110 160, 130 160, 142 148" fill="none" stroke={stroke} strokeWidth={9}
      strokeLinecap="round" />
  </svg>
);
