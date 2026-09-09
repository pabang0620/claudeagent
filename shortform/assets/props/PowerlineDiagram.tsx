/** "전류가 흐르려면 두 지점 사이에 전압 차이(전위차)가 있어야 한다"는 구조를 보여주는
 *  전선 다이어그램(전깃줄에 앉은 새가 감전되지 않는 이유, general-ep44 신설). 전선(1~2줄) +
 *  두 접점 표시 + 접점 사이 "거의 0" 치수 브래킷 + 전류가 전선을 타고 흐르는 애니메이션 +
 *  두 전선 사이를 관통하는 위험 스파크를 함께 그린다.
 *
 *  이 컴포넌트는 좌표를 화면 절대좌표(px)로 직접 받아 전체 화면 크기의 svg 오버레이 하나에
 *  그린다(CompareBars/Ruler와 같은 설계 - 자체 축소 viewBox 를 두지 않는다). 새(Bird)를 이
 *  전선 위에 겹쳐 놓는 것은 호출 씬의 몫이다(NoodleDiagram 계열과 같은 관례).
 *
 *  전류는 굵은 화살표 한두 개로만 표현하고(오케스트레이터 지시), 작은 점이나 번개 모양을
 *  잔뜩 뿌리지 않는다. 감전 스파크(shockProgress)도 굵은 지그재그 선 1가닥뿐이고 새가
 *  다치는 모습은 그리지 않는다 - 위험은 스파크 선 + 호출 씬이 얹는 경고 아이콘으로만
 *  가볍게 표시한다.
 *
 *  "두 지점 간 전위차 유무에 따라 전류 경로가 갈린다"는 구조를 갖는 다른 회로·에너지 소재
 *  전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, H, W } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 결정적 지그재그 오프셋(고정 패턴, Math.random 미사용 - 원칙 3) */
const ZIGZAG_T = [0.16, 0.34, 0.5, 0.66, 0.84];
const ZIGZAG_SIDE = [1, -1, 1, -1, 1];

export interface PowerlineDiagramProps {
  /** 전선이 그려지는 가로 범위(화면 절대좌표) */
  left: number;
  right: number;
  /** 전선(위쪽 또는 유일한 전선) y */
  wireY: number;
  /** 두 번째 전선(위험 장면용) y. undefined면 전선 1개만 그린다 */
  wire2Y?: number;
  /** 접점 A의 x (기본 전선 위) */
  pointAX: number;
  /** 접점 B의 x. 없으면 접점을 하나만 표시(브래킷·스파크 안 그림) */
  pointBX?: number;
  /** true면 접점 B가 wire2Y 위에 있다(위험 장면 - 서로 다른 전선) */
  pointBOnWire2?: boolean;
  /** 0~1, 접점 두 곳 사이 치수 브래킷(짧은 세로선 + 가로선) 성장. 같은 전선 위 두 접점
   *  전용(pointBOnWire2가 아닐 때만 그린다) */
  gapProgress?: number;
  /** 0~1 누적(내부에서 mod 1 처리), 전류가 전선을 타고 흐르는 밝은 화살표 애니메이션 */
  currentProgress?: number;
  /** 0~1, 두 접점을 잇는 굵은 스파크(감전 순간). pointBX + wire2Y가 있을 때만 그린다 */
  shockProgress?: number;
  stroke?: string;
  wireColor?: string;
  currentColor?: string;
  sparkColor?: string;
  style?: React.CSSProperties;
}

/** 전선 하나(살짝 처진 곡선) */
const Wire: React.FC<{ left: number; right: number; y: number; color: string }> = ({
  left, right, y, color,
}) => {
  const mid = (left + right) / 2;
  return (
    <path
      d={`M ${left} ${y} Q ${mid} ${y + 16} ${right} ${y}`}
      fill="none" stroke={color} strokeWidth={9} strokeLinecap="round"
    />
  );
};

export const PowerlineDiagram: React.FC<PowerlineDiagramProps> = ({
  left, right, wireY, wire2Y, pointAX, pointBX, pointBOnWire2 = false,
  gapProgress = 0, currentProgress = 0, shockProgress = 0,
  stroke = C.ink, wireColor = C.ink, currentColor = C.gold, sparkColor = C.coral, style,
}) => {
  const gap = clamp01(gapProgress);
  const shock = clamp01(shockProgress);
  const pointBY = pointBOnWire2 && wire2Y !== undefined ? wire2Y : wireY;
  const hasBracket = pointBX !== undefined && !pointBOnWire2 && gap > 0.001;
  const hasShock = pointBX !== undefined && pointBOnWire2 && wire2Y !== undefined && shock > 0.001;

  return (
    <svg
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style }}
    >
      <Wire left={left} right={right} y={wireY} color={wireColor} />
      {wire2Y !== undefined ? <Wire left={left} right={right} y={wire2Y} color={wireColor} /> : null}

      {/* 접점 A */}
      <circle cx={pointAX} cy={wireY} r={9} fill={stroke} />
      {/* 접점 B */}
      {pointBX !== undefined ? <circle cx={pointBX} cy={pointBY} r={9} fill={stroke} /> : null}

      {/* 전류 애니메이션 - 전선을 따라 흐르는 밝은 화살표 3개 (누적값 mod 1) */}
      {currentProgress > 0.001 ? (() => {
        const span = right - left;
        const phase = currentProgress % 1;
        const arrows = [phase, phase + 0.34, phase + 0.68].map((raw) => raw % 1);
        return (
          <g>
            {arrows.map((t, i) => {
              const cx = left + t * span;
              const fadeEdge = Math.min(t * 6, (1 - t) * 6, 1);
              return (
                <path
                  key={i}
                  d={`M ${cx - 22} ${wireY - 10} L ${cx + 6} ${wireY} L ${cx - 22} ${wireY + 10}`}
                  fill="none" stroke={currentColor} strokeWidth={9} strokeLinecap="round"
                  strokeLinejoin="round" opacity={0.9 * clamp01(fadeEdge)}
                />
              );
            })}
          </g>
        );
      })() : null}

      {/* 치수 브래킷 - 같은 전선 위 두 접점 사이 "거의 0" 간격 표시 */}
      {hasBracket ? (() => {
        const ax = pointAX;
        const bx = pointBX as number;
        const midX = (ax + bx) / 2;
        const bw = (bx - ax) * gap;
        const tickTop = wireY - 46;
        return (
          <g opacity={gap}>
            <line x1={ax} y1={tickTop} x2={ax} y2={wireY - 14} stroke={stroke} strokeWidth={6} strokeLinecap="round" />
            <line x1={bx} y1={tickTop} x2={bx} y2={wireY - 14} stroke={stroke} strokeWidth={6} strokeLinecap="round" />
            <line
              x1={midX - bw / 2} y1={tickTop} x2={midX + bw / 2} y2={tickTop}
              stroke={stroke} strokeWidth={6} strokeLinecap="round"
            />
          </g>
        );
      })() : null}

      {/* 감전 스파크 - 두 접점(서로 다른 전선)을 잇는 굵은 지그재그 선 1가닥만 */}
      {hasShock ? (() => {
        const ax = pointAX;
        const bx = pointBX as number;
        const ay = wireY;
        const by = wire2Y as number;
        const pts = [`${ax} ${ay}`];
        ZIGZAG_T.forEach((t, i) => {
          const bx0 = ax + (bx - ax) * t;
          const by0 = ay + (by - ay) * t;
          const nx = -(by - ay);
          const ny = (bx - ax);
          const len = Math.hypot(nx, ny) || 1;
          const off = ZIGZAG_SIDE[i] * 20;
          pts.push(`${(bx0 + (nx / len) * off).toFixed(1)} ${(by0 + (ny / len) * off).toFixed(1)}`);
        });
        pts.push(`${bx} ${by}`);
        const env = shock < 0.5 ? shock / 0.5 : Math.max(0, 1 - (shock - 0.5) / 0.5);
        return (
          <polyline
            points={pts.join(' ')} fill="none" stroke={sparkColor} strokeWidth={13}
            strokeLinecap="round" strokeLinejoin="round" opacity={Math.max(0.35, env)}
          />
        );
      })() : null}
    </svg>
  );
};

export default PowerlineDiagram;
