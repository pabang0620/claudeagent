/** 실내·실험실 배경. 과학 실험, 발명, "직접 해 보자" 구간용.
 *
 *  선반과 유리병은 배경 소품이라 캐릭터보다 훨씬 옅은 색으로만 그린다.
 *  선반 개수·위치·병 배치는 props 로 바꾼다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GROUND, H, W } from '../theme';

export interface ShelfSpec {
  /** 선반 상단 y */
  y: number;
  x?: number;
  width?: number;
  /** 선반 위에 올릴 병 종류. 0 = 플라스크, 1 = 시험관, 2 = 비커 */
  items?: (0 | 1 | 2)[];
}

const DEFAULT_SHELVES: ShelfSpec[] = [
  { y: 470, x: 60, width: 420, items: [0, 2, 1] },
  { y: 760, x: 660, width: 380, items: [2, 0] },
];

const Flask: React.FC<{ x: number; y: number; s: number; color: string; accent: string }> = ({
  x, y, s, color, accent,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -14 -70 L -14 -30 L -40 20 A 8 8 0 0 0 -33 32 L 33 32 A 8 8 0 0 0 40 20 L 14 -30 L 14 -70 Z"
      fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -30 6 L 30 6 L 33 32 A 8 8 0 0 1 26 32 L -26 32 A 8 8 0 0 1 -33 32 Z" fill={accent} opacity={0.55} />
    <line x1={-20} y1={-70} x2={20} y2={-70} stroke={color} strokeWidth={9} strokeLinecap="round" />
  </g>
);

const Tube: React.FC<{ x: number; y: number; s: number; color: string; accent: string }> = ({
  x, y, s, color, accent,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -13 -64 L -13 14 A 13 13 0 0 0 13 14 L 13 -64" fill="none" stroke={color}
      strokeWidth={9} strokeLinejoin="round" />
    <path d="M -13 -14 L 13 -14 L 13 14 A 13 13 0 0 1 -13 14 Z" fill={accent} opacity={0.55} />
  </g>
);

const Beaker: React.FC<{ x: number; y: number; s: number; color: string; accent: string }> = ({
  x, y, s, color, accent,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -26 -56 L -26 26 A 6 6 0 0 0 -20 32 L 20 32 A 6 6 0 0 0 26 26 L 26 -56"
      fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -26 -8 L 26 -8 L 26 26 A 6 6 0 0 1 20 32 L -20 32 A 6 6 0 0 1 -26 26 Z"
      fill={accent} opacity={0.5} />
    <line x1={-26} y1={-56} x2={26} y2={-56} stroke={color} strokeWidth={9} strokeLinecap="round" />
  </g>
);

export interface LabBgProps {
  wall?: string;
  wallDeep?: string;
  /** 선반·유리병 선 색 (배경이므로 옅게) */
  line?: string;
  /** 병 안 액체 색 */
  liquid?: string;
  ground?: number;
  shelves?: ShelfSpec[];
  /** 벽 타일 격자 표시 */
  grid?: boolean;
}

export const LabBg: React.FC<LabBgProps> = ({
  wall = C.room, wallDeep = C.roomDeep, line = C.roomDeep, liquid = C.water,
  ground = GROUND, shelves = DEFAULT_SHELVES, grid = true,
}) => (
  <AbsoluteFill style={{ background: wall, overflow: 'hidden' }}>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.paper} 0%, ${wall} 58%)` }} />
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {grid
        ? Array.from({ length: 7 }, (_, i) => (
            <line
              key={i} x1={(i + 1) * 155} y1={0} x2={(i + 1) * 155} y2={ground}
              stroke={wallDeep} strokeWidth={3} opacity={0.35}
            />
          ))
        : null}

      {shelves.map((sh, i) => {
        const x = sh.x ?? 60;
        const w = sh.width ?? 420;
        const items = sh.items ?? [];
        const step = w / (items.length + 1);
        return (
          <g key={i}>
            {items.map((kind, j) => {
              const ix = x + step * (j + 1);
              const props = { x: ix, y: sh.y - 34, s: 1, color: line, accent: liquid };
              if (kind === 0) return <Flask key={j} {...props} />;
              if (kind === 1) return <Tube key={j} {...props} />;
              return <Beaker key={j} {...props} />;
            })}
            <rect x={x} y={sh.y} width={w} height={16} rx={8} fill={wallDeep} />
          </g>
        );
      })}

      {/* 작업대 상판 + 바닥 */}
      <rect x={-200} y={ground} width={W + 400} height={H - ground} fill={wallDeep} opacity={0.5} />
      <line x1={-200} y1={ground} x2={W + 200} y2={ground} stroke={wallDeep} strokeWidth={12}
        strokeLinecap="round" />
    </svg>
  </AbsoluteFill>
);

export default LabBg;
