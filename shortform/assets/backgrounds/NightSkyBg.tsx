/** 우주·밤하늘 배경. 천문·야행성 동물·"다음 편 예고" 구간에 쓴다.
 *
 *  어두운 배경이므로 캐릭터를 그대로 올리면 잉크색 라인이 묻힌다.
 *  캐릭터는 흰 원 안에 넣거나(brand/Outro 참고) color 를 밝게 바꿔 실루엣으로 쓸 것.
 *  자막은 CAPTION_STYLE.dark 를 쓴다.
 *
 *  별 배치는 고정 시드 의사난수라 프레임마다 흔들리지 않는다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, H, W } from '../theme';

/** 결정적 의사난수 (mulberry32). Math.random 금지 - 프레임마다 값이 바뀌면 화면이 떤다 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface NightSkyBgProps {
  /** 별 개수 */
  stars?: number;
  /** 별 배치 시드. 바꾸면 다른 하늘이 된다 */
  seed?: number;
  /** 반짝임 위상용 프레임. 넘기지 않으면 정지 */
  frame?: number;
  /** 달 표시. 0~1 로 차오름(0 = 초승달, 1 = 보름달) */
  moon?: number | null;
  moonX?: number;
  moonY?: number;
  moonR?: number;
  /** 지평선 y. null 이면 지평선 없이 우주로 */
  horizon?: number | null;
  top?: string;
  bottom?: string;
  starColor?: string;
  horizonColor?: string;
}

export const NightSkyBg: React.FC<NightSkyBgProps> = ({
  stars = 60, seed = 7, frame, moon = 0.8, moonX = 830, moonY = 300, moonR = 96,
  horizon = null, top = C.night, bottom = C.nightMid,
  starColor = C.cream, horizonColor = C.nightSoft,
}) => {
  const pts = React.useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: stars }, () => ({
      x: r() * W,
      y: r() * (horizon ?? H * 0.86),
      s: 1.4 + r() * 3.4,
      ph: r() * Math.PI * 2,
    }));
  }, [stars, seed, horizon]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`, overflow: 'hidden' }}>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {pts.map((p, i) => {
          const tw = frame === undefined ? 1 : 0.55 + 0.45 * Math.sin(frame / 14 + p.ph);
          return <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={starColor} opacity={0.35 + 0.45 * tw} />;
        })}

        {moon !== null ? (
          <g>
            <circle cx={moonX} cy={moonY} r={moonR * 1.5} fill={starColor} opacity={0.06} />
            <circle cx={moonX} cy={moonY} r={moonR} fill={C.goldSoft} opacity={0.92} />
            {/* 차오름: 배경색 원을 겹쳐 초승달을 만든다 */}
            {moon < 1 ? (
              <circle
                cx={moonX - moonR * (1 - moon) * 1.5} cy={moonY} r={moonR}
                fill={top} opacity={0.96}
              />
            ) : null}
          </g>
        ) : null}

        {horizon !== null ? (
          <>
            <ellipse cx={W * 0.2} cy={horizon + 220} rx={700} ry={260} fill={horizonColor} opacity={0.28} />
            <ellipse cx={W * 0.9} cy={horizon + 250} rx={620} ry={240} fill={horizonColor} opacity={0.22} />
            <line
              x1={-200} y1={horizon} x2={W + 200} y2={horizon}
              stroke={horizonColor} strokeWidth={10} strokeLinecap="round" opacity={0.6}
            />
          </>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

export default NightSkyBg;
