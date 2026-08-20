/** 오징어 소품 + 먹물 분사/얼룩 이펙트.
 *
 *  "먹물을 뿜는 소재" 전반에 재사용 가능하도록 만들었다(REGISTRY 규칙 2 - 그림 자체는 이
 *  파일럿 전용이지만 라이브러리에 남겨 다음에도 쓸 수 있게 함).
 *
 *  Squid        : 몸통(외투막) + 지느러미 + 눈 + 다리 다발. squeeze 로 분사 직전 움츠림 표현
 *  InkSpray     : 입에서 목표 지점까지 날아가는 먹물 방울들(고정 배열, Math.random 금지)
 *  InkSplatFace : 얼굴에 명중한 뒤 남는 얼룩(눈 구멍 2개만 뚫린 검은 마스크) + 흘러내리는 방울
 */
import React from 'react';
import { C } from '../theme';

export const SQUID_VB = { w: 500, h: 700 };

const MANTLE_D =
  'M 250 40 C 190 40 140 90 130 170 C 122 230 130 260 130 300 ' +
  'C 130 330 165 350 250 350 C 335 350 370 330 370 300 ' +
  'C 370 260 378 230 370 170 C 360 90 310 40 250 40 Z';

const FIN_L_D = 'M 128 150 C 70 155 30 185 40 220 C 48 248 95 250 132 226 Z';
const FIN_R_D = 'M 372 150 C 430 155 470 185 460 220 C 452 248 405 250 368 226 Z';

/** 다리 다발. 각 다리는 고정된 위상만 다른 S자 곡선(무작위 아님) */
const LEGS = [0, 1, 2, 3, 4, 5, 6].map((i) => {
  const baseX = 150 + i * 33;
  const sway = 18 * Math.sin(i * 1.3);
  const len = 230 + 26 * Math.cos(i * 0.9);
  return { baseX, sway, len };
});

export interface SquidProps {
  width: number;
  /** 0~1: 분사 직전 몸통을 움츠리는 정도 */
  squeeze?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const Squid: React.FC<SquidProps> = ({
  width, squeeze = 0, stroke = C.ink, fill = C.coralSoft, style,
}) => {
  const h = (width * SQUID_VB.h) / SQUID_VB.w;
  const sq = 1 - squeeze * 0.12; // 움츠릴 때 세로로 살짝 눌림
  return (
    <svg
      width={width} height={h} viewBox={`0 0 ${SQUID_VB.w} ${SQUID_VB.h}`}
      style={{ overflow: 'visible', ...style }}
    >
      <g stroke={stroke} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* 다리 */}
        {LEGS.map((leg, i) => (
          <path
            key={i}
            d={`M ${leg.baseX} 330 C ${leg.baseX + leg.sway} ${330 + leg.len * 0.5} ${leg.baseX - leg.sway} ${330 + leg.len * 0.85} ${leg.baseX + leg.sway * 0.4} ${330 + leg.len}`}
          />
        ))}
        {/* 지느러미 */}
        <path d={FIN_L_D} fill={fill} />
        <path d={FIN_R_D} fill={fill} />
        {/* 몸통 */}
        <g transform={`translate(250 195) scale(1 ${sq}) translate(-250 -195)`}>
          <path d={MANTLE_D} fill={fill} />
          {/* 눈 */}
          <circle cx={205} cy={230} r={26} fill={C.paper} strokeWidth={12} />
          <circle cx={205} cy={230} r={11} fill={stroke} stroke="none" />
          <circle cx={295} cy={230} r={26} fill={C.paper} strokeWidth={12} />
          <circle cx={295} cy={230} r={11} fill={stroke} stroke="none" />
          {/* 입(부리) - 색소를 먹이는/먹물이 나오는 지점을 눈으로 알아볼 수 있게 표시 */}
          <circle cx={250} cy={300} r={14} fill={stroke} stroke="none" />
        </g>
      </g>
    </svg>
  );
};

/** 입(먹물이 나오는 지점)의 squid 자체 viewBox 좌표 - 스케일 시 화면 좌표 환산용 */
export const SQUID_MOUTH_VB = { x: 250, y: 300 };

/** 고정 파티클 배치(Math.random 금지 - 인덱스 기반 결정적 값) */
const INK_PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  along: 0.15 + (i % 5) * 0.17, // 이동 경로상 위치(0~1), 파티클마다 살짝 어긋난 지연
  lateral: Math.sin(i * 2.1) * 0.16, // 경로 수직 방향 흔들림
  size: 22 + 14 * Math.cos(i * 1.7),
}));

export interface InkSprayProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  /** 0~1 분사 진행도 */
  progress: number;
  color?: string;
}

/** 입에서 목표 지점까지 날아가는 먹물 방울들 */
export const InkSpray: React.FC<InkSprayProps> = ({ originX, originY, targetX, targetY, progress, color = C.ink }) => {
  if (progress <= 0.001 || progress >= 1) return null;
  const dx = targetX - originX;
  const dy = targetY - originY;
  const nx = -dy;
  const ny = dx;
  const norm = Math.max(1, Math.hypot(nx, ny));
  return (
    <svg
      width="100%" height="100%"
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      {INK_PARTICLES.map((p, i) => {
        const local = Math.max(0, Math.min(1, (progress - p.along * 0.5) * 1.6));
        if (local <= 0.01) return null;
        const cx = originX + dx * local + (nx / norm) * p.lateral * 90;
        const cy = originY + dy * local + (ny / norm) * p.lateral * 90;
        const r = p.size * (0.5 + 0.5 * local);
        return <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={0.94} />;
      })}
    </svg>
  );
};

/** 고정 물방울(흘러내림) 배치 */
const DRIPS = [
  { dx: -34, w: 14 }, { dx: 6, w: 20 }, { dx: 42, w: 12 },
];

export interface InkSplatFaceProps {
  x: number;
  y: number;
  size: number;
  /** 0~1: 등장(임팩트 직후 팝) */
  progress: number;
  /** 0~1: 시간이 지나며 아래로 흘러내리는 정도 */
  dripProgress?: number;
  eyeGap?: number;
  color?: string;
}

/** 명중 후 얼굴에 남는 검은 얼룩. 눈 위치에 작은 구멍 2개를 뚫어 캐릭터 눈이 살짝 비친다(귀여움 유지) */
export const InkSplatFace: React.FC<InkSplatFaceProps> = ({
  x, y, size, progress, dripProgress = 0, eyeGap = size * 0.32, color = C.ink,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return null;
  const scale = 0.55 + 0.45 * p;
  return (
    <svg
      width={size * 1.6} height={size * 2}
      style={{
        position: 'absolute', left: x - size * 0.8, top: y - size * 0.85,
        overflow: 'visible', pointerEvents: 'none',
      }}
    >
      <g transform={`translate(${size * 0.8} ${size * 0.85}) scale(${scale})`} opacity={p}>
        <path
          d={`M ${-size * 0.62} ${-size * 0.1}
              C ${-size * 0.7} ${-size * 0.55} ${-size * 0.2} ${-size * 0.68} 0 ${-size * 0.5}
              C ${size * 0.22} ${-size * 0.68} ${size * 0.7} ${-size * 0.5} ${size * 0.6} ${-size * 0.05}
              C ${size * 0.7} ${size * 0.3} ${size * 0.3} ${size * 0.6} 0 ${size * 0.5}
              C ${-size * 0.32} ${size * 0.62} ${-size * 0.68} ${size * 0.28} ${-size * 0.62} ${-size * 0.1} Z`}
          fill={color}
        />
        {/* 눈 구멍 2개(캐릭터의 실측 눈 간격을 그대로 씀) */}
        <circle cx={-eyeGap / 2} cy={0} r={size * 0.1} fill={C.paper} opacity={0.9} />
        <circle cx={eyeGap / 2} cy={-size * 0.06} r={size * 0.12} fill={C.paper} opacity={0.9} />
        {DRIPS.map((d, i) => (
          <rect
            key={i}
            x={d.dx - d.w / 2}
            y={size * 0.4}
            width={d.w}
            height={size * 0.7 * dripProgress}
            rx={d.w / 2}
            fill={color}
          />
        ))}
      </g>
    </svg>
  );
};

export default Squid;
