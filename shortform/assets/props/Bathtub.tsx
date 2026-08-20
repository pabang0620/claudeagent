/** 욕조 소품. 앞판이 캐릭터 하반신을 가리는 용도로, 캐릭터(Actor)보다 나중에(위 레이어에)
 *  그려서 쓴다. 단순 도형(둥근 사각형 몸체 + 수면선 + 김 파티클)이라 새로 그리는 비용이 낮다
 *  (general-ep02, "목욕" 상황을 구체화하려고 신설. REGISTRY 3절 확인 완료, 유사 자산 없음).
 *
 *  프레임을 직접 받지 않는 게 원칙(REGISTRY 규칙 3)이지만, 김이 살랑거리는 움직임은
 *  프레임마다 계속 흔들려야 자연스러워서 `f`를 받는다 - `Math.sin(f)` 기반 결정적 계산이라
 *  Math.random 금지 규칙(원칙 3)은 위반하지 않는다. 김이 "옅어져 사라지는" 진행도(steamT)는
 *  호출부가 anim.ts 의 `progress()`로 계산해 넘긴다.
 */
import React from 'react';
import { C, H, SW, SW_THIN, W } from '../theme';

export interface BathtubProps {
  /** 씬 로컬 프레임. 김의 살랑거림에만 쓴다 */
  f: number;
  /** 수면(=욕조 앞판 윗선) 화면 y */
  waterY: number;
  /** 김 불투명도 배율 0~1. 1이면 진하게, 0이면 완전히 사라짐(장면 끝 무렵) */
  steamT?: number;
  tubColor?: string;
  waterColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** 김 가닥 3개. 위치·시작 위상을 고정 배열로 둔다(원칙 3 - Math.random 금지) */
const STEAM_WISPS = [
  { dx: -110, delay: 0, h: 150 },
  { dx: 0, delay: 14, h: 190 },
  { dx: 110, delay: 7, h: 140 },
];

export const Bathtub: React.FC<BathtubProps> = ({
  f, waterY, steamT = 1, tubColor = C.water, waterColor = C.seaTop,
  stroke = C.ink, strokeWidth = SW, style,
}) => {
  const cx = W / 2;
  const t = Math.max(0, Math.min(1, steamT));
  return (
    <svg
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', left: 0, top: 0, ...style }}
    >
      {/* 욕조 앞판: 수면 아래를 전부 덮어 하반신을 가린다 */}
      <rect
        x={-40} y={waterY} width={W + 80} height={H - waterY + 40} rx={60}
        fill={tubColor} stroke={stroke} strokeWidth={strokeWidth}
      />
      {/* 수면선: 아주 완만한 물결 + 수면 위 옅은 색 띠 */}
      <path
        d={`M -40 ${waterY} Q ${cx * 0.5} ${waterY - 10} ${cx} ${waterY} Q ${cx * 1.5} ${waterY + 10} ${W + 40} ${waterY} L ${W + 40} ${waterY + 24} L -40 ${waterY + 24} Z`}
        fill={waterColor} opacity={0.9}
      />
      <path
        d={`M -40 ${waterY} Q ${cx * 0.5} ${waterY - 10} ${cx} ${waterY} Q ${cx * 1.5} ${waterY + 10} ${W + 40} ${waterY}`}
        fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.7}
      />

      {/* 김: 시간이 지날수록 서서히 옅어져 사라진다 */}
      {t > 0.01 ? (
        <g opacity={t * 0.55} stroke={stroke} strokeWidth={SW_THIN} fill="none" strokeLinecap="round">
          {STEAM_WISPS.map((s) => {
            const sway = Math.sin((f + s.delay) / 18) * 14;
            const x0 = cx + s.dx;
            return (
              <path
                key={s.dx}
                d={`M ${x0} ${waterY} C ${x0 + sway} ${waterY - s.h * 0.35}, ${x0 - sway} ${waterY - s.h * 0.65}, ${x0 + sway * 0.6} ${waterY - s.h}`}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

export default Bathtub;
