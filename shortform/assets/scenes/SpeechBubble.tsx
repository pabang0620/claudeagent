/** 말풍선 / 확대 풍선.
 *
 *  round  : 원형 풍선. 확대해서 보여주는 용도(현미경으로 들여다보듯)
 *  rect   : 둥근 사각 말풍선. 대사·문구용
 *  꼬리는 tail 방향으로 점 두 개(원형) 또는 삼각형(사각형)으로 붙는다.
 */
import React from 'react';
import { C, FONT, RADIUS, SW } from '../theme';

export type BubbleTail = 'none' | 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export interface SpeechBubbleProps {
  /** 풍선 중심 (round) 또는 좌상단 (rect) */
  x: number;
  y: number;
  /** round 일 때 반지름 */
  r?: number;
  /** rect 일 때 크기 */
  w?: number;
  h?: number;
  shape?: 'round' | 'rect';
  tail?: BubbleTail;
  /** 0~1 등장 진행도. 중심에서 커진다 */
  progress?: number;
  bg?: string;
  border?: string;
  borderWidth?: number;
  /** rect 일 때 텍스트 */
  text?: React.ReactNode;
  textColor?: string;
  textSize?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  x, y, r = 250, w = 560, h = 220, shape = 'round', tail = 'bottomLeft', progress = 1,
  bg = C.paper, border = C.ink, borderWidth = SW,
  text, textColor = C.ink, textSize = 54, children, style,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return null;
  const scale = 0.8 + 0.2 * p;

  if (shape === 'round') {
    const dir = tail.includes('Left') ? -1 : 1;
    const up = tail.includes('top') ? -1 : 1;
    const pad = borderWidth + 4;
    const box = (r + pad) * 2;
    return (
      <div
        style={{
          position: 'absolute', left: x - box / 2, top: y - box / 2,
          width: box, height: box, opacity: p,
          transform: `scale(${scale})`, transformOrigin: '50% 50%',
          ...style,
        }}
      >
        <svg width={box} height={box} style={{ position: 'absolute', overflow: 'visible' }}>
          {tail !== 'none' ? (
            <>
              <circle
                cx={box / 2 + dir * r * 0.98} cy={box / 2 + up * r * 0.98} r={22}
                fill={bg} stroke={border} strokeWidth={borderWidth}
              />
              <circle
                cx={box / 2 + dir * r * 0.72} cy={box / 2 + up * r * 0.72} r={34}
                fill={bg} stroke={border} strokeWidth={borderWidth}
              />
            </>
          ) : null}
          <circle cx={box / 2} cy={box / 2} r={r} fill={bg} stroke={border} strokeWidth={borderWidth} />
        </svg>
        <div
          style={{
            position: 'absolute', inset: pad, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: textSize, color: textColor,
            textAlign: 'center',
            wordBreak: 'keep-all',
          }}
        >
          {children ?? text}
        </div>
      </div>
    );
  }

  const tw = 34;
  const dir = tail.includes('Left') ? 1 : -1;
  const tx = tail.includes('Left') ? w * 0.24 : w * 0.76;
  const up = tail.includes('top');
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, opacity: p,
        transform: `scale(${scale})`, transformOrigin: '50% 50%',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0, background: bg,
          border: `${borderWidth}px solid ${border}`, borderRadius: RADIUS.lg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT, fontWeight: 700, fontSize: textSize, color: textColor,
          textAlign: 'center',
          wordBreak: 'keep-all', padding: '0 28px', boxSizing: 'border-box',
        }}
      >
        {children ?? text}
      </div>
      {tail !== 'none' ? (
        <svg
          width={tw * 2} height={tw + borderWidth}
          style={{ position: 'absolute', left: tx - tw, top: up ? -tw : h - 1, overflow: 'visible' }}
        >
          <path
            d={up
              ? `M 0 ${tw} L ${tw * (1 + dir * 0.5)} 0 L ${tw * 2} ${tw} Z`
              : `M 0 0 L ${tw * (1 + dir * 0.5)} ${tw} L ${tw * 2} 0 Z`}
            fill={bg} stroke={border} strokeWidth={borderWidth} strokeLinejoin="round"
          />
          <rect x={2} y={up ? tw - 2 : -borderWidth} width={tw * 2 - 4} height={borderWidth + 3} fill={bg} />
        </svg>
      ) : null}
    </div>
  );
};

export default SpeechBubble;
