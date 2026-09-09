/** "무언가가 한 방향으로 퍼져 나간다"(냄새·소리·신호 등)를 작은 점을 여러 개 흩뿌리지 않고
 *  2~3개의 큰 호(arc)로 표현하는 범용 다이어그램. 채널 원칙("이산화탄소나 냄새를 표현할 때도
 *  작은 점을 흩뿌리지 말고 큰 물결선이나 화살표 2~3개로 방향만 보여준다")을 그대로 구현한다.
 *
 *  cx/cy 를 발신원(입·코 등)에, angle(도, 0=오른쪽) 로 퍼지는 방향을 잡는다. `progress`(0~1)
 *  로 호가 순서대로 바깥으로 퍼지며 나타났다 옅어지는 것을 표현한다(반복 루프가 아니라
 *  1회성 등장 - 반복이 필요하면 호출부가 progress 를 프레임 기반 톱니파로 만들어 넘긴다).
 *  "숨결이 CO2 를 퍼뜨린다", "냄새가 퍼진다", "소리가 퍼진다" 등 다른 소재에도
 *  재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';
import { clamp01 } from '../anim';

export interface ScentWavesProps {
  /** 발신원 x (화면 좌표) */
  cx: number;
  cy: number;
  /** 퍼지는 방향(도). 0 = 오른쪽, 180 = 왼쪽 */
  angle?: number;
  /** 호 몇 개(2~3 권장, 점을 여러 개 찍지 않는다) */
  count?: number;
  /** 가장 바깥 호까지의 거리(px) */
  spread?: number;
  /** 0~1. 0 이면 아무것도 안 그린다. 호가 순서대로 나타나며 바깥으로 밀려난다 */
  progress?: number;
  /** 호 하나의 부채꼴 반각(도) */
  fanDeg?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const ScentWaves: React.FC<ScentWavesProps> = ({
  cx, cy, angle = 0, count = 3, spread = 260, progress = 1, fanDeg = 34,
  color = C.inkSoft, strokeWidth = SW_THIN, style,
}) => {
  const p = clamp01(progress);
  if (p <= 0.001) return null;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const size = spread * 2 + 40;

  return (
    <svg
      width={size} height={size}
      style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, overflow: 'visible', ...style }}
    >
      {Array.from({ length: count }).map((_, i) => {
        // 호 i 는 전체 진행도 중 자기 구간에서만 나타났다가(등장) 계속 바깥으로 밀려나며 옅어진다
        const seg = 1 / count;
        const localP = clamp01((p - i * seg * 0.6) / (1 - i * seg * 0.6));
        if (localP <= 0.001) return null;
        const baseR = spread * ((i + 1) / count);
        const r = baseR * (0.72 + 0.28 * localP);
        const fadeOut = localP > 0.7 ? 1 - (localP - 0.7) / 0.3 : 1;
        const a1 = angle - fanDeg;
        const a2 = angle + fanDeg;
        const p1 = { x: size / 2 + r * Math.cos(rad(a1)), y: size / 2 + r * Math.sin(rad(a1)) };
        const p2 = { x: size / 2 + r * Math.cos(rad(a2)), y: size / 2 + r * Math.sin(rad(a2)) };
        const large = fanDeg * 2 > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`}
            fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            opacity={Math.min(1, localP * 2) * fadeOut}
          />
        );
      })}
    </svg>
  );
};

export default ScentWaves;
