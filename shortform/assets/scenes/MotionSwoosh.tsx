/** MotionSwoosh - "동그라미 안에서 밖으로" 뻗어나가는 간단한 동작선(speed line) 이펙트.
 *
 *  배경: 퍼둥이 활발한 움직임 데모(perdungi-demo-active)에서 팔다리가 짧아 스윙 동작 자체가
 *  잘 안 보인다는 피드백을 받았다. 캐릭터를 다시 그리거나 관절을 조작하는 대신(원칙 0-1과
 *  무관 - 이건 캐릭터가 아니라 장식용 오버레이), 팔다리 위치 옆에 부채꼴로 열린 짧은 호
 *  3개를 얹고 frame 기반 사인파로 scale을 빠르게 펄스(커졌다 작아졌다)시켜 "손을 흔든다/
 *  발을 구른다"는 만화적 인상을 준다. 사용자 표현 그대로: "선으로 그리는 동그라미 안에서
 *  밖으로 한 거 그려서 작아졌다 커졌다만 해도 구현이 되는 것".
 *
 *  내용과 완전히 무관한 범용 장식 이펙트라 scenes/ 에 둔다(규칙 2). 캐릭터 종류를 가리지
 *  않으므로 굼구미/퍼둥이 어느 캐릭터의 손·발 움직임 강조에도 재사용 가능하다.
 *
 *  Math.random 미사용 - frame 만의 순수 함수라 결정적이다(원칙 3).
 */
import React from 'react';
import { C } from '../theme';

/** 안쪽 -> 바깥쪽 호 3개의 반지름 비율(size 대비) */
const ARC_RATIOS = [0.42, 0.68, 0.94];
/** 각 호가 벌어지는 각도(도) */
const ARC_SPAN_DEG = 64;
/** 호마다 살짝 어긋나게 돌려 "여러 겹" 느낌을 준다(인덱스 기반 고정값, 무작위 아님) */
const ARC_GAP_DEG = 9;

function arcPath(r: number, offsetDeg: number): string {
  const half = (ARC_SPAN_DEG / 2) * (Math.PI / 180);
  const off = offsetDeg * (Math.PI / 180);
  const a1 = -half + off;
  const a2 = half + off;
  const x1 = r * Math.cos(a1);
  const y1 = r * Math.sin(a1);
  const x2 = r * Math.cos(a2);
  const y2 = r * Math.sin(a2);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** 0~1 사이를 periodFrames 주기로 빠르게 오간다(sin 기반, 결정적). */
function pulseNorm(frame: number, periodFrames: number): number {
  return 0.5 + 0.5 * Math.sin((frame / periodFrames) * Math.PI * 2);
}

export interface MotionSwooshProps {
  /** 이펙트가 뻗어나가는 중심 화면 x, y */
  x: number;
  y: number;
  /** 가장 바깥 호의 반지름(px, 펄스 최대치 기준) */
  size?: number;
  /** 부채꼴이 향하는 방향(도, 0 = +x 오른쪽) */
  rotation?: number;
  frame: number;
  /** 몇 프레임 주기로 커졌다 작아졌다 하는지. 작을수록 빠르다(기본 8 = 30fps 약 0.27초 주기) */
  periodFrames?: number;
  color?: string;
  /** 최대 밝기일 때의 불투명도. 펄스가 작아지는 동안 이 값에서 더 옅어진다 */
  opacity?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const MotionSwoosh: React.FC<MotionSwooshProps> = ({
  x, y, size = 34, rotation = 0, frame, periodFrames = 8,
  color = C.inkSoft, opacity = 0.6, strokeWidth = 5, style,
}) => {
  const p = pulseNorm(frame, periodFrames);
  const scale = 0.5 + 0.7 * p; // 0.5 ~ 1.2
  const a = opacity * (0.35 + 0.65 * p); // 작아질 때 같이 옅어져 "꺼졌다 켜졌다" 느낌을 더한다
  const box = size * 1.2; // svg 캔버스 여유(펄스 최대치 + 여백)

  return (
    <svg
      width={box * 2}
      height={box * 2}
      viewBox={`${-box} ${-box} ${box * 2} ${box * 2}`}
      style={{
        position: 'absolute', left: x - box, top: y - box,
        width: box * 2, height: box * 2, overflow: 'visible', pointerEvents: 'none', ...style,
      }}
    >
      <g transform={`rotate(${rotation}) scale(${scale})`} opacity={a}>
        {ARC_RATIOS.map((ratio, i) => (
          <path
            key={i}
            d={arcPath(size * ratio, (i - 1) * ARC_GAP_DEG)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
};

export default MotionSwoosh;
