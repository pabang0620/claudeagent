/** 연출 이펙트 모음. 내용과 완전히 무관한 것들만 둔다.
 *
 *  CountdownRing : 남은 시간을 원형으로 (생각할 시간 주기)
 *  Sparkles      : 반짝임 파티클 (정답·성공 순간)
 *  FlashOverlay  : 흰 섬광 (충격·전환 강조)
 *  Shake         : 자식 전체를 잠깐 흔든다
 *  Appear        : 등장 래퍼 (위/아래/좌/우/확대)
 */
import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { C, FONT, SW } from '../theme';
import { shake as shakeAt } from '../anim';

/* ================= 카운트다운 링 ================= */

export const CountdownRing: React.FC<{
  x: number;
  y: number;
  /** 지름 */
  size?: number;
  /** 시작 프레임 */
  at: number;
  /** 몇 프레임에 걸쳐 한 바퀴 */
  duration: number;
  frame: number;
  /** 표시할 최대 숫자 (3 이면 3,2,1) */
  from?: number;
  ring?: string;
  track?: string;
  bg?: string;
  textColor?: string;
  style?: React.CSSProperties;
}> = ({
  x, y, size = 200, at, duration, frame, from = 3,
  ring = C.coral, track = C.hill, bg = C.paper, textColor = C.ink, style,
}) => {
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + duration], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const R = size * 0.37;
  const CIRC = 2 * Math.PI * R;
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: x, top: y, ...style }}>
      <circle cx={size / 2} cy={size / 2} r={R} fill={bg} stroke={track} strokeWidth={14} />
      <circle
        cx={size / 2} cy={size / 2} r={R} fill="none" stroke={ring} strokeWidth={14}
        strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * p}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2} y={size / 2 + size * 0.11} textAnchor="middle"
        style={{ fontFamily: FONT, fontWeight: 700, fontSize: size * 0.31, fill: textColor }}
      >
        {Math.max(0, Math.ceil(from - p * from))}
      </text>
    </svg>
  );
};

/* ================= 반짝임 ================= */

/** 고정 배치. 프레임마다 위치가 달라지면 안 되므로 상수 배열로 둔다 */
const SPARKS = [
  [0.10, 0.18, 1.0], [0.86, 0.12, 0.8], [0.22, 0.62, 0.7], [0.78, 0.66, 1.0],
  [0.48, 0.06, 0.9], [0.06, 0.44, 0.6], [0.94, 0.42, 0.75], [0.36, 0.86, 0.65],
  [0.66, 0.9, 0.85], [0.16, 0.82, 0.5], [0.9, 0.8, 0.6], [0.54, 0.5, 0.55],
];

export const Sparkles: React.FC<{
  /** 반짝임이 퍼질 영역 */
  box: { x: number; y: number; w: number; h: number };
  /** 0~1 진행도. 0.5 부근에서 가장 크다 */
  t: number;
  colorA?: string;
  colorB?: string;
  /** 파티클 크기 배율 */
  scale?: number;
}> = ({ box, t, colorA = C.coral, colorB = C.gold, scale = 1 }) => (
  <svg
    width={box.w} height={box.h}
    style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}
  >
    {SPARKS.map(([fx, fy, ph], i) => {
      const local = Math.max(0, Math.min(1, (t - ph * 0.25) * 1.5));
      const s = Math.sin(Math.PI * local);
      if (s <= 0.01) return null;
      const r = (14 + 16 * ph) * scale;
      return (
        <g key={i} transform={`translate(${fx * box.w} ${fy * box.h}) scale(${s}) rotate(${i * 27})`}>
          <path
            d={`M 0 ${-r} Q 4 -4 ${r} 0 Q 4 4 0 ${r} Q -4 4 ${-r} 0 Q -4 -4 0 ${-r} Z`}
            fill={i % 3 === 0 ? colorA : colorB}
          />
        </g>
      );
    })}
  </svg>
);

/* ================= 섬광 ================= */

/** 임팩트 순간 화면 전체가 한 번 밝아진다. at 프레임에 터지고 금방 사라진다 */
export const FlashOverlay: React.FC<{
  frame: number;
  at: number;
  color?: string;
  peak?: number;
  /** 최대 밝기까지 프레임 */
  rise?: number;
  /** 사라지기까지 프레임 */
  fall?: number;
}> = ({ frame, at, color = C.paper, peak = 0.8, rise = 4, fall = 16 }) => {
  const a = interpolate(frame, [at, at + rise, at + fall], [0, peak, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (a <= 0.001) return null;
  return <AbsoluteFill style={{ background: color, opacity: a, pointerEvents: 'none' }} />;
};

/* ================= 흔들기 ================= */

export const Shake: React.FC<{
  frame: number;
  at: number;
  duration?: number;
  amp?: number;
  children: React.ReactNode;
}> = ({ frame, at, duration = 12, amp = 10, children }) => {
  const s = shakeAt(frame, at, duration, amp);
  return (
    <AbsoluteFill style={{ transform: `translate(${s}px, ${s * 0.4}px)` }}>{children}</AbsoluteFill>
  );
};

/* ================= 등장 래퍼 ================= */

export type AppearFrom = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

/** 아무 요소나 감싸면 등장 모션이 붙는다. progress 는 spring 결과를 그대로 넣는다 */
export const Appear: React.FC<{
  progress: number;
  from?: AppearFrom;
  /** 이동 거리(px) */
  distance?: number;
  origin?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ progress, from = 'up', distance = 48, origin = '50% 50%', children, style }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return null;
  const d = (1 - p) * distance;
  const move =
    from === 'up' ? `translateY(${d}px)`
      : from === 'down' ? `translateY(${-d}px)`
        : from === 'left' ? `translateX(${-d}px)`
          : from === 'right' ? `translateX(${d}px)`
            : '';
  const sc = from === 'scale' ? `scale(${0.3 + 0.7 * p})` : `scale(${0.86 + 0.14 * p})`;
  return (
    <div
      style={{
        opacity: from === 'fade' ? p : Math.min(1, p * 2),
        transform: `${move} ${from === 'fade' ? '' : sc}`.trim(),
        transformOrigin: origin,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 강조 링: 대상 뒤에 깔아 시선을 모으는 맥동하는 원 */
export const PulseRing: React.FC<{
  x: number;
  y: number;
  size: number;
  frame: number;
  progress?: number;
  color?: string;
  opacity?: number;
  periodFrames?: number;
}> = ({ x, y, size, frame, progress = 1, color = C.coralSoft, opacity = 0.55, periodFrames = 56 }) => {
  const pulse = 1 + 0.06 * Math.sin((frame / periodFrames) * Math.PI * 2);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: size, height: size,
        borderRadius: size / 2, background: color,
        transform: `scale(${pulse * (0.7 + 0.3 * progress)})`,
        opacity: opacity * progress,
      }}
    />
  );
};

/** 어두운 배경 위에서 라인 캐릭터가 묻히지 않도록 흰 원 안에 넣는 액자 */
export const SpotlightCircle: React.FC<{
  x: number;
  y: number;
  size: number;
  progress?: number;
  bg?: string;
  border?: string;
  borderWidth?: number;
  children: React.ReactNode;
}> = ({ x, y, size, progress = 1, bg = C.paper, border = C.ink, borderWidth = SW, children }) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: size, height: size,
        borderRadius: size / 2, background: bg, border: `${borderWidth}px solid ${border}`,
        overflow: 'hidden', opacity: p,
        transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + 0.15 * p})`,
      }}
    >
      {children}
    </div>
  );
};
