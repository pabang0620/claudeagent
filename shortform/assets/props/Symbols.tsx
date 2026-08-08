/** 직접 그린 기호·아이콘. Tabler 아이콘으로 대체되지 않는(우리 스타일이 필요한) 것만 둔다. */
import React from 'react';
import { C, FONT, SW } from '../theme';

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
