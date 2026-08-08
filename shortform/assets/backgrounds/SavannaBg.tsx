/** 사바나·야외 배경. 1화(기린)에서 만든 것을 일반화했다.
 *
 *  아카시아 나무 배치를 props 로 받으므로 나무 수·위치·크기를 바꿔 다른 야외로도 쓴다.
 *  pan 으로 아주 느린 시차 이동(먼 것은 덜, 가까운 것은 더)을 준다.
 *  pond / night 오버레이는 0~1 로 켜고 끈다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GROUND, H, W } from '../theme';

export interface TreeSpec {
  /** 화면 x */
  x: number;
  /** 밑동 y (기본 바닥선) */
  y?: number;
  /** 크기 배율 */
  s: number;
  /** 원경(far) 이면 시차가 적게 움직이고 색이 더 옅다 */
  far?: boolean;
}

const DEFAULT_TREES: TreeSpec[] = [
  { x: 140, y: GROUND - 60, s: 0.9, far: true },
  { x: 1180, y: GROUND - 40, s: 1.05, far: true },
  { x: 980, y: GROUND, s: 1.25 },
];

const Acacia: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 L 0 -120 M 0 -78 L -40 -120 M 0 -86 L 38 -126" fill="none" stroke={color}
      strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-146} rx={126} ry={38} fill={color} />
    <ellipse cx={-58} cy={-124} rx={62} ry={24} fill={color} />
    <ellipse cx={62} cy={-128} rx={66} ry={26} fill={color} />
  </g>
);

export interface SavannaBgProps {
  /** 가로 시차 이동량(px). 보통 0 -> 200 정도를 영상 전체에 걸쳐 준다 */
  pan?: number;
  /** 물웅덩이 표시 0~1 */
  pond?: number;
  /** 밤 오버레이 0~1 */
  night?: number;
  /** 해 표시 여부 */
  sun?: boolean;
  ground?: number;
  trees?: TreeSpec[];
  skyTop?: string;
  skyBottom?: string;
  hillColor?: string;
  hillFarColor?: string;
  waterColor?: string;
}

export const SavannaBg: React.FC<SavannaBgProps> = ({
  pan = 0, pond = 0, night = 0, sun = true, ground = GROUND, trees = DEFAULT_TREES,
  skyTop = C.sky, skyBottom = C.paper,
  hillColor = C.hill, hillFarColor = C.hillFar, waterColor = C.water,
}) => (
  <AbsoluteFill style={{ background: skyBottom, overflow: 'hidden' }}>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBottom} 62%)` }} />
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {sun ? <circle cx={900 - pan * 0.25} cy={214} r={104} fill={C.goldSoft} opacity={0.7} /> : null}

      <g transform={`translate(${-pan * 0.45} 0)`}>
        {trees.filter((t) => t.far).map((t, i) => (
          <Acacia key={`f${i}`} x={t.x} y={t.y ?? ground} s={t.s} color={hillFarColor} />
        ))}
      </g>

      <g transform={`translate(${-pan} 0)`}>
        <ellipse cx={220} cy={ground + 210} rx={640} ry={250} fill={hillFarColor} />
        <ellipse cx={1000} cy={ground + 240} rx={560} ry={230} fill={hillFarColor} />
        {trees.filter((t) => !t.far).map((t, i) => (
          <Acacia key={`n${i}`} x={t.x} y={t.y ?? ground} s={t.s} color={hillColor} />
        ))}
      </g>

      <line x1={-200} y1={ground} x2={W + 200} y2={ground} stroke={hillColor} strokeWidth={10}
        strokeLinecap="round" />
      <rect x={-200} y={ground} width={W + 400} height={H - ground} fill={hillFarColor} opacity={0.55} />
    </svg>

    {/* 물웅덩이 - 바닥선보다 아래에 깔리는 전경 물가 띠.
        캐릭터·동물은 물가에 서고 주둥이만 수면에 닿는다. */}
    {pond > 0 ? (
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: pond }}>
        <path
          d="M -20 1356 C 160 1330, 360 1376, 548 1350 C 736 1324, 920 1368, 1100 1344
             L 1100 1940 L -20 1940 Z"
          fill={waterColor} stroke={C.ink} strokeWidth={11} strokeLinejoin="round"
        />
      </svg>
    ) : null}

    {night > 0 ? (
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.night} 0%, ${C.nightMid} 100%)`,
          opacity: night,
        }}
      />
    ) : null}
  </AbsoluteFill>
);

export default SavannaBg;
