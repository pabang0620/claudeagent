/** 숫자 카운터.
 *
 *  CountUp   : 0 에서 목표값까지 자동으로 올라간다 (통계·규모 제시)
 *  StepCounter: 정해진 프레임마다 1씩 올라간다 (하나, 둘, 셋... 세기)
 *
 *  둘 다 값이 바뀌는 순간 살짝 커졌다 돌아온다. 숫자가 조용히 바뀌면 눈에 안 들어온다.
 */
import React from 'react';
import { C, FONT } from '../theme';

export interface CountUpProps {
  x: number;
  y: number;
  /** 목표값 */
  to: number;
  from?: number;
  /** 카운트가 시작되는 프레임 */
  at?: number;
  /** 몇 프레임에 걸쳐 올라갈지 */
  duration?: number;
  frame: number;
  size?: number;
  color?: string;
  /** 소수 자리수 */
  digits?: number;
  prefix?: string;
  suffix?: string;
  width?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const CountUp: React.FC<CountUpProps> = ({
  x, y, to, from = 0, at = 0, duration = 30, frame,
  size = 132, color = C.coral, digits = 0, prefix = '', suffix = '',
  width = 300, align = 'center', style,
}) => {
  const t = Math.max(0, Math.min(1, (frame - at) / Math.max(1, duration)));
  const v = from + (to - from) * easeOut(t);
  const pop = 1 + 0.16 * Math.max(0, 1 - (frame - at) / 8);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width,
        transform: `${align === 'center' ? 'translateX(-50%) ' : ''}scale(${t < 1 ? 1 : pop})`,
        textAlign: align === 'center' ? 'center' : 'left',
        fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1, color,
        ...style,
      }}
    >
      {prefix}{v.toFixed(digits)}{suffix}
    </div>
  );
};

export interface StepCounterProps {
  x: number;
  y: number;
  /** 값이 1씩 올라가는 프레임 목록. length 가 최대값이 된다 */
  steps: number[];
  frame: number;
  size?: number;
  color?: string;
  width?: number;
  align?: 'left' | 'center';
  /** 0 일 때 숨길지 */
  hideZero?: boolean;
  suffix?: string;
  style?: React.CSSProperties;
}

export const StepCounter: React.FC<StepCounterProps> = ({
  x, y, steps, frame, size = 132, color = C.coral, width = 300,
  align = 'center', hideZero = true, suffix = '', style,
}) => {
  const count = steps.filter((s) => frame >= s).length;
  const last = steps[Math.max(0, count - 1)] ?? 0;
  const pop = 1 + 0.16 * Math.max(0, 1 - (frame - last) / 6);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width,
        textAlign: align === 'center' ? 'center' : 'left',
        fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1, color,
        opacity: hideZero && count === 0 ? 0 : 1,
        transform: `${align === 'center' ? 'translateX(-50%) ' : ''}scale(${pop})`,
        ...style,
      }}
    >
      {count}{suffix}
    </div>
  );
};

/** steps 배열을 만들어 주는 헬퍼. 어절 프레임 몇 개 + 그 뒤 일정 간격으로 채운다.
 *  (내레이션이 "하나, 둘, 셋... 일곱" 처럼 뒤를 몰아 읽을 때 쓴다) */
export function stepFrames(explicit: number[], total: number, tailGap = 5) {
  const out = [...explicit];
  while (out.length < total) out.push(out[out.length - 1] + tailGap);
  return out.slice(0, total);
}
