/** 기린. 1화(기린 목뼈)에서 만들었지만 동물 편에서 계속 쓸 수 있어 라이브러리에 보존한다.
 *
 *  viewBox 620x1000, 화면 픽셀과 1:1. 바닥선 y = 950.
 *  drink 0 = 서 있음, 1 = 앞다리를 벌리고 고개를 숙여 물을 마심 (그 사이는 연속 보간).
 */
import React from 'react';
import { C, SW } from '../theme';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const RAD = Math.PI / 180;

export interface GiraffeProps {
  width: number;
  /** 0 = 서 있음, 1 = 물 마시는 자세 */
  drink?: number;
  /** 선 색 (기본 ink) */
  stroke?: string;
  /** 채움 (기본 paper) */
  fill?: string;
  /** 무늬 색 (기본 coral) */
  spot?: string;
  /** 전부 한 색으로 칠한 실루엣. 지정하면 stroke/fill/spot 을 모두 덮는다 */
  silhouette?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Giraffe: React.FC<GiraffeProps> = ({
  width, drink = 0, stroke, fill, spot, silhouette, strokeWidth = SW, style,
}) => {
  const d = Math.max(0, Math.min(1, drink));
  const st = silhouette ?? stroke ?? C.ink;
  const bg = silhouette ?? fill ?? C.paper;
  const sp = silhouette ?? spot ?? C.coral;

  // 목: 수직 기준 각도, 길이, 시작점. drink 로 서 있는 상태 <-> 물 마시는 상태를 보간한다.
  const ang = lerp(20, 156, d) * RAD;
  const len = lerp(392, 368, d);
  const bx = 366;
  const by = lerp(566, 600, d);
  const dx = Math.sin(ang);
  const dy = -Math.cos(ang);
  const px = -dy;
  const py = dx;
  const hw0 = 54;
  const hw1 = 35;
  const tipX = bx + dx * len;
  const tipY = by + dy * len;
  const neckD =
    `M ${bx + px * hw0} ${by + py * hw0} ` +
    `L ${tipX + px * hw1} ${tipY + py * hw1} ` +
    `L ${tipX - px * hw1} ${tipY - py * hw1} ` +
    `L ${bx - px * hw0} ${by - py * hw0} Z`;

  const headRot = lerp(-12, 68, d);
  const hx = tipX + dx * 22;
  const hy = tipY + dy * 22;

  // 앞다리: 물을 마실 때 앞뒤로 쫙 벌어진다
  const fl1 = lerp(326, 232, d);
  const fl2 = lerp(388, 486, d);
  const bodyRot = lerp(-9, 3, d);

  return (
    <svg viewBox="0 0 620 1000" width={width} style={style} shapeRendering="geometricPrecision">
      <g stroke={st} strokeWidth={20} strokeLinecap="round" fill="none">
        <line x1={204} y1={676} x2={190} y2={950} />
        <line x1={244} y1={680} x2={254} y2={950} />
        <line x1={336} y1={676} x2={fl1} y2={950} />
        <line x1={374} y1={680} x2={fl2} y2={950} />
        {/* 꼬리 */}
        <path d="M 140 578 C 116 622, 114 664, 126 690" strokeWidth={10} />
      </g>
      <circle cx={126} cy={696} r={14} fill={st} />

      {/* 목 */}
      <path d={neckD} fill={bg} stroke={st} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {[0.3, 0.5, 0.7, 0.88].map((t, i) => {
        const sx = bx + dx * len * t + px * (i % 2 ? 15 : -15);
        const sy = by + dy * len * t + py * (i % 2 ? 15 : -15);
        return (
          <ellipse
            key={t} cx={sx} cy={sy} rx={16} ry={12} fill={sp}
            transform={`rotate(${ang / RAD} ${sx} ${sy})`}
          />
        );
      })}

      {/* 몸통 */}
      <g transform={`rotate(${bodyRot} 270 616)`}>
        <ellipse cx={270} cy={616} rx={142} ry={106} fill={bg} stroke={st} strokeWidth={strokeWidth} />
        {[[216, 570], [316, 566], [252, 650], [346, 634], [180, 630]].map(([sx, sy]) => (
          <ellipse key={`${sx}-${sy}`} cx={sx} cy={sy} rx={26} ry={20} fill={sp} />
        ))}
      </g>

      {/* 머리 */}
      <g transform={`translate(${hx} ${hy}) rotate(${headRot})`}>
        <g stroke={st} strokeWidth={strokeWidth} strokeLinecap="round">
          <line x1={0} y1={-32} x2={-14} y2={-80} />
          <line x1={34} y1={-34} x2={28} y2={-84} />
        </g>
        <circle cx={-14} cy={-80} r={13} fill={st} />
        <circle cx={28} cy={-84} r={13} fill={st} />
        <ellipse cx={-22} cy={-16} rx={30} ry={16} fill={bg} stroke={st} strokeWidth={strokeWidth}
          transform="rotate(-40 -22 -16)" />
        <ellipse cx={46} cy={4} rx={74} ry={42} fill={bg} stroke={st} strokeWidth={strokeWidth} />
        <circle cx={24} cy={-14} r={9} fill={st} />
        <circle cx={104} cy={10} r={6} fill={st} />
        <path d="M 92 26 C 100 32, 112 30, 116 22" fill="none" stroke={st} strokeWidth={7}
          strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default Giraffe;
