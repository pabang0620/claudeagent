/** 자막. edge-tts WordBoundary 어절 타임스탬프에 맞춰 지금 말하는 어절이 강조된다.
 *
 *  숏폼이라 크게, 화면 중하단 안전영역 안에 둔다.
 *  emphasis 정규식에 걸리는 어절은 배경 하이라이트가 붙는다(숫자·핵심어용).
 */
import React from 'react';
import { interpolate } from 'remotion';
import { C, CAP_BOTTOM, CAP_SIDE, CAPTION_STYLE, FONT } from '../theme';
import { CaptionLine } from '../timeline';

export interface CaptionProps {
  /** 지금 표시할 줄. null 이면 아무것도 안 그린다 */
  line: CaptionLine | null;
  /** 구간 로컬 시각(초) */
  t: number;
  /** 어두운 배경용 색 반전 */
  dark?: boolean;
  /** 강조할 어절 판별. 정규식 또는 함수 */
  emphasis?: RegExp | ((word: string) => boolean);
  fontSize?: number;
  bottom?: number;
  side?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const Caption: React.FC<CaptionProps> = ({
  line, t, dark = false, emphasis,
  fontSize = CAPTION_STYLE.fontSize, bottom = CAP_BOTTOM, side = CAP_SIDE,
  maxWidth = CAPTION_STYLE.maxWidth, style,
}) => {
  if (!line) return null;

  // 등장/퇴장 페이드 (뚝뚝 끊기지 않게)
  const inA = interpolate(t, [line.start, line.start + 0.14], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outA = interpolate(t, [line.end - 0.16, line.end], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const a = Math.min(inA, outA);
  const rise = (1 - inA) * 14;

  const sk = dark ? CAPTION_STYLE.dark : CAPTION_STYLE.light;
  const isEmph = (w: string) => {
    if (!emphasis) return false;
    return typeof emphasis === 'function' ? emphasis(w) : emphasis.test(w);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: side,
        right: side,
        bottom,
        display: 'flex',
        justifyContent: 'center',
        opacity: a,
        transform: `translateY(${rise}px)`,
        ...style,
      }}
    >
      <div
        style={{
          background: sk.bg,
          border: `${CAPTION_STYLE.borderWidth}px solid ${sk.border}`,
          borderRadius: CAPTION_STYLE.radius,
          padding: CAPTION_STYLE.padding,
          maxWidth,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: CAPTION_STYLE.gap,
        }}
      >
        {line.words.map((w, i) => {
          const active = t >= w.s - 0.05 && t < w.e + 0.12;
          const emph = isEmph(w.w);
          return (
            <span
              key={`${w.w}-${i}`}
              style={{
                position: 'relative',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize,
                lineHeight: CAPTION_STYLE.lineHeight,
                letterSpacing: CAPTION_STYLE.letterSpacing,
                color: active ? sk.active : sk.fg,
                display: 'inline-block',
                transform: `translateY(${active ? -5 : 0}px)`,
                padding: emph ? '0 10px' : 0,
                borderRadius: 14,
                background: emph ? sk.emphBg : 'transparent',
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 자막이 아닌 화면 텍스트(라벨·제목). 위치·크기·색을 전부 props 로 받는다 */
export const Label: React.FC<{
  x: number;
  y: number;
  text: React.ReactNode;
  size?: number;
  color?: string;
  /** center 면 x 가 텍스트 중심 */
  align?: 'left' | 'center' | 'right';
  weight?: number;
  wrapWidth?: number;
  style?: React.CSSProperties;
}> = ({ x, y, text, size = 46, color = C.ink, align = 'center', weight = 700, wrapWidth, style }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: align === 'center' ? 'translateX(-50%)' : align === 'right' ? 'translateX(-100%)' : 'none',
      fontFamily: FONT,
      fontWeight: weight,
      fontSize: size,
      color,
      whiteSpace: wrapWidth ? 'normal' : 'nowrap',
      wordBreak: 'keep-all',
      width: wrapWidth,
      textAlign: align === 'center' ? 'center' : align,
      ...style,
    }}
  >
    {text}
  </div>
);
