/** 바다 배경. 해양 생물·물 관련 주제용.
 *
 *  수면(surface) 위쪽은 하늘, 아래쪽은 물속이다. surface 를 화면 위로 올리면
 *  거의 전부 물속 장면이 되고, 아래로 내리면 물가 장면이 된다.
 *  물결·거품은 frame 을 넘기면 아주 느리게 움직인다(넘기지 않으면 정지).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, H, W } from '../theme';

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface OceanBgProps {
  /** 수면 y. 0 이하로 두면 전면 물속 */
  surface?: number;
  /** 해저 바닥 y. null 이면 바닥 없음(먼바다) */
  seabed?: number | null;
  /** 거품 개수 */
  bubbles?: number;
  seed?: number;
  /** 애니메이션용 프레임. 없으면 정지 화면 */
  frame?: number;
  skyColor?: string;
  waterTop?: string;
  waterDeep?: string;
  sandColor?: string;
  lineColor?: string;
}

export const OceanBg: React.FC<OceanBgProps> = ({
  surface = 420, seabed = 1560, bubbles = 22, seed = 3, frame,
  skyColor = C.sky, waterTop = C.seaTop, waterDeep = C.seaDeep,
  sandColor = C.hillFar, lineColor = C.water,
}) => {
  const dots = React.useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: bubbles }, () => ({
      x: r() * W,
      y0: r() * H,
      s: 5 + r() * 16,
      sp: 0.25 + r() * 0.7,
    }));
  }, [bubbles, seed]);

  const t = frame ?? 0;
  const top = Math.max(0, surface);

  return (
    <AbsoluteFill style={{ background: waterTop, overflow: 'hidden' }}>
      {surface > 0 ? (
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: top, background: skyColor }} />
      ) : null}
      <div
        style={{
          position: 'absolute', left: 0, top, width: W, height: H - top,
          background: `linear-gradient(180deg, ${waterTop} 0%, ${waterDeep} 100%)`,
        }}
      />

      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* 수면 물결 */}
        {surface > 0
          ? [0, 1, 2].map((i) => {
              const off = Math.sin(t / (40 + i * 11)) * 26;
              const y = top + i * 16;
              return (
                <path
                  key={i}
                  d={`M ${-60 + off} ${y} Q ${W * 0.25} ${y - 16} ${W * 0.5} ${y}
                      T ${W + 60} ${y}`}
                  fill="none" stroke={lineColor} strokeWidth={9 - i * 2}
                  strokeLinecap="round" opacity={0.85 - i * 0.22}
                />
              );
            })
          : null}

        {/* 거품 */}
        {dots.map((b, i) => {
          const y = ((b.y0 - t * b.sp) % (H - top) + (H - top)) % (H - top) + top;
          return <circle key={i} cx={b.x} cy={y} r={b.s} fill={C.paper} opacity={0.28} />;
        })}

        {/* 해저 모래 */}
        {seabed !== null ? (
          <>
            <ellipse cx={W * 0.25} cy={seabed + 150} rx={620} ry={200} fill={sandColor} />
            <ellipse cx={W * 0.85} cy={seabed + 190} rx={540} ry={210} fill={sandColor} />
            <rect x={-200} y={seabed + 90} width={W + 400} height={H} fill={sandColor} />
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

export default OceanBg;
