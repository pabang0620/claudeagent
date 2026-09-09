/** "별똥별은 별이 아니라 우주를 떠돌던 작은 돌조각이 대기와 마찰하며 타는 빛줄기"라는
 *  구조를 보여주는 범용 다이어그램(별똥별이 사실은 별이 아닌 이유). LightningThunderDiagram·
 *  TwinkleDiagram과 같은 설계(독립 레이어, undefined면 그 레이어를 안 그린다).
 *
 *  이 화의 핵심 반전은 "작은 돌조각의 실제 크기"와 "화면에 보이는 밝고 긴 빛줄기"의 크기
 *  대비다(오케스트레이터 지시). 그래서 대기 진입 레이어는 돌조각을 끝까지 작은 도형 하나로
 *  유지하고(타면서 점점 작아져 사라짐), 마찰은 굵은 빛줄기 하나(그라디언트 라인)로만
 *  표현한다 - 잔불꽃이나 파편을 잔뜩 흩뿌리지 않는다.
 *
 *  돌조각 아이콘은 손으로 좌표를 추정해 그리지 않고 tabler 아이콘 세트의 `meteor`
 *  (크레이터가 있는 불규칙한 소행성 실루엣, LightningThunderDiagram이 `cloud`/`eye`/`ear`를
 *  쓴 것과 같은 근거)를 그대로 쓴다 - 원칙 0-1의 "눈대중으로 좌표를 그리지 않는다"는
 *  기준을 아이콘 세트 재사용으로 충족한다.
 *
 *  세 레이어:
 *  - `entryProgress`(0~1): 돌조각이 대기에 진입해(ENTRY_START) 마찰열로 빛나며 타버리는
 *    지점(ENTRY_END, viewBox 정중앙)까지 이동. 돌조각은 진행할수록 작아지다 사라지고, 그
 *    뒤로 남는 빛줄기(그라디언트 라인)만 점점 굵고 밝아진다. ENTRY_END를 viewBox 정중앙에
 *    둔 이유는 `x = screenCX - width/2` 로만 계산해도 클로즈업(더 큰 width)이 항상 그 지점을
 *    화면 중심에 맞춰 확대되게 하기 위해서다(s4는 넓은 구도, s6은 같은 컴포넌트를 크게 키운
 *    클로즈업 - 두 장면이 같은 계산식을 공유).
 *  - `cometTrailProgress`(0~1): 혜성이 고정된 궤도 곡선(2차 베지어)을 따라 이동하며, 지나온
 *    자리에 작은 파편 점 5개(DEBRIS_T)가 절제된 개수로 순차 등장한다(오케스트레이터 지시 -
 *    "많아도 잔뜩 뿌리지 않는다").
 *  - `showerProgress`(0~1): 지구(tabler `world` 아이콘)가 화면 아래에서 그 궤도의 교차점까지
 *    올라온 뒤(0~0.45), 그 지점 근처에서 여러 빛줄기 4개가 살짝 시차를 두고 동시에 나타난다
 *    (0.45~1, "여러 빛줄기가 동시에" - 완전히 겹치면 안 보이므로 각도를 다르게 부채꼴로
 *    편다).
 *
 *  "작은 물체가 매질과 고속으로 부딪혀 마찰열로 빛나다 소멸하는" 구조를 갖는 다른 소재
 *  (인공위성 재진입, 우주 쓰레기 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기
 *  등록한다(general-ep82 02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01, progress } from '../anim';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';

export const METEOR_VB_W = 900;
export const METEOR_VB_H = 700;

/** 대기 진입 시작점 / 끝점(=viewBox 정중앙 - 클로즈업 중심 계산을 단순하게 만들기 위함) */
const ENTRY_START = { x: 130, y: 90 };
const ENTRY_END = { x: METEOR_VB_W / 2, y: METEOR_VB_H / 2 };

/** 혜성 궤도(2차 베지어) - cometTrailProgress·showerProgress가 공유하는 고정 곡선 */
const ORBIT_P0 = { x: 50, y: 560 };
const ORBIT_P1 = { x: 450, y: 30 };
const ORBIT_P2 = { x: 850, y: 560 };
/** 궤도 위 파편 점 5개(절제된 개수) - t값 고정 */
const DEBRIS_T = [0.16, 0.32, 0.48, 0.64, 0.8];
/** 지구가 궤도와 만나는 지점(t=0.5) */
const EARTH_CROSS_T = 0.5;
/** 유성우 빛줄기 4개 - 교차점 기준 방향(라디안)과 길이. 완전히 겹치지 않게 부채꼴로 편다 */
const SHOWER_STREAKS = [
  { angle: -2.3, len: 150, at: 0.45 },
  { angle: -1.95, len: 190, at: 0.54 },
  { angle: -1.6, len: 140, at: 0.62 },
  { angle: -2.6, len: 170, at: 0.7 },
];

function bez(t: number, p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}
const orbitAt = (t: number) => bez(clamp01(t), ORBIT_P0, ORBIT_P1, ORBIT_P2);

/** 호출 씬이 Label 을 궤도 위 고정 지점에 앵커할 때 쓰는 지점(NeckVertebraeDiagram 등의
 *  `*_LABEL_PT` 관례와 동일 - `x + PT.x*scale, y + PT.y*scale` 로 화면 좌표로 변환한다) */
const _comet = orbitAt(0.12);
export const METEOR_COMET_LABEL_PT = { x: _comet.x, y: _comet.y - 46 };
const _debris = orbitAt(0.66);
export const METEOR_DEBRIS_LABEL_PT = { x: _debris.x, y: _debris.y - 46 };
const _cross = orbitAt(EARTH_CROSS_T);
export const METEOR_SHOWER_LABEL_PT = { x: _cross.x - 40, y: _cross.y - 110 };

export interface MeteorEntryDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 돌조각이 대기에 진입해 마찰열로 빛나다 타버리는 과정. undefined면 이 레이어를 안 그림 */
  entryProgress?: number;
  /** 혜성이 궤도를 따라 이동하며 파편 트레일을 남기는 과정. undefined면 이 레이어를 안 그림 */
  cometTrailProgress?: number;
  /** 지구가 궤도를 통과하며 여러 빛줄기(유성우)가 동시에 나타나는 과정. undefined면 안 그림 */
  showerProgress?: number;
  /** 아이콘·궤도선 기본색(어두운 배경 대비용 - 기본 밝은 크림색) */
  stroke?: string;
  rockColor?: string;
  glowColor?: string;
  hotColor?: string;
  earthColor?: string;
  /** 그라디언트 id 충돌 방지용 접미사(화면에 두 인스턴스를 동시에 쓸 때만 지정) */
  idSuffix?: string;
  style?: React.CSSProperties;
}

export const MeteorEntryDiagram: React.FC<MeteorEntryDiagramProps> = ({
  width, x = 0, y = 0, entryProgress, cometTrailProgress, showerProgress,
  stroke = C.cream, rockColor = C.nightSoft, glowColor = C.gold, hotColor = C.coral,
  earthColor = C.water, idSuffix = '', style,
}) => {
  const scale = width / METEOR_VB_W;
  const height = METEOR_VB_H * scale;
  const entryGradId = `meteor-entry-grad${idSuffix}`;
  const orbitGradId = `meteor-orbit-grad${idSuffix}`;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        width={width} height={height}
        viewBox={`0 0 ${METEOR_VB_W} ${METEOR_VB_H}`}
        style={{ overflow: 'visible' }}
      >
        {/* ---------------- 대기 진입: 돌조각 -> 빛줄기 -> 소멸 ---------------- */}
        {entryProgress !== undefined ? (() => {
          const ep = clamp01(entryProgress);
          const pos = {
            x: ENTRY_START.x + (ENTRY_END.x - ENTRY_START.x) * ep,
            y: ENTRY_START.y + (ENTRY_END.y - ENTRY_START.y) * ep,
          };
          const rockScale = clamp01(1 - ep * 1.15); // 완전히 타버리기 직전 0에 도달
          const rockSize = 96 * rockScale;
          const streakWidth = 7 + 24 * ep;
          const impactFlash = progress(ep, 0.04, 0.14) * (1 - progress(ep, 0.14, 0.3));
          const heat = ep; // 0(흰빛) -> 1(주황빛)이 강해짐

          return (
            <g>
              {ep > 0.01 ? (
                <>
                  <defs>
                    <linearGradient
                      id={entryGradId} gradientUnits="userSpaceOnUse"
                      x1={ENTRY_START.x} y1={ENTRY_START.y} x2={pos.x} y2={pos.y}
                    >
                      <stop offset="0%" stopColor={glowColor} stopOpacity={0} />
                      <stop offset="55%" stopColor={glowColor} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={heat > 0.5 ? hotColor : glowColor} stopOpacity={0.95} />
                    </linearGradient>
                  </defs>
                  <line
                    x1={ENTRY_START.x} y1={ENTRY_START.y} x2={pos.x} y2={pos.y}
                    stroke={`url(#${entryGradId})`} strokeWidth={streakWidth} strokeLinecap="round"
                  />
                </>
              ) : null}

              {impactFlash > 0.02 ? (
                <circle cx={pos.x} cy={pos.y} r={22 + 60 * impactFlash} fill={glowColor} opacity={0.4 * impactFlash} />
              ) : null}

              {rockScale > 0.02 ? (
                <g transform={`translate(${pos.x - rockSize / 2} ${pos.y - rockSize / 2})`}>
                  <ThemedIcon name="meteor" size={rockSize} color={rockColor} strokePx={13} />
                </g>
              ) : null}
            </g>
          );
        })() : null}

        {/* ---------------- 혜성 궤도 + 파편 트레일 ---------------- */}
        {cometTrailProgress !== undefined ? (() => {
          const ct = clamp01(cometTrailProgress);
          const head = orbitAt(ct);
          const tail = orbitAt(Math.max(0, ct - 0.09));
          const orbitD = `M ${ORBIT_P0.x} ${ORBIT_P0.y} Q ${ORBIT_P1.x} ${ORBIT_P1.y} ${ORBIT_P2.x} ${ORBIT_P2.y}`;

          return (
            <g>
              {/* 궤도 자취(옅은 점선) - 혜성이 지나간 만큼만 드러난다 */}
              <path
                d={orbitD} fill="none" stroke={stroke} strokeWidth={5} strokeDasharray="4 14"
                strokeLinecap="round" opacity={0.28}
              />
              {ct > 0.01 ? (
                <>
                  <defs>
                    <linearGradient
                      id={orbitGradId} gradientUnits="userSpaceOnUse"
                      x1={tail.x} y1={tail.y} x2={head.x} y2={head.y}
                    >
                      <stop offset="0%" stopColor={glowColor} stopOpacity={0} />
                      <stop offset="100%" stopColor={glowColor} stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <line
                    x1={tail.x} y1={tail.y} x2={head.x} y2={head.y}
                    stroke={`url(#${orbitGradId})`} strokeWidth={12} strokeLinecap="round"
                  />
                </>
              ) : null}

              {DEBRIS_T.map((dt, i) => {
                const dp = progress(ct, dt - 0.05, dt + 0.03);
                if (dp <= 0.02) return null;
                const dpos = orbitAt(dt);
                return <circle key={i} cx={dpos.x} cy={dpos.y} r={6 + 3 * dp} fill={stroke} opacity={0.6 * dp} />;
              })}

              {ct > 0.005 ? (
                <g transform={`translate(${head.x - 34} ${head.y - 34})`}>
                  <ThemedIcon name="meteor" size={68} color={rockColor} strokePx={13} />
                </g>
              ) : null}
            </g>
          );
        })() : null}

        {/* ---------------- 지구가 궤도를 통과하며 나타나는 유성우 ---------------- */}
        {showerProgress !== undefined ? (() => {
          const sp = clamp01(showerProgress);
          const cross = orbitAt(EARTH_CROSS_T);
          const earthStart = { x: cross.x - 70, y: METEOR_VB_H + 40 };
          const approach = progress(sp, 0, 0.45);
          const earthPos = {
            x: earthStart.x + (cross.x - earthStart.x) * approach,
            y: earthStart.y + (cross.y + 70 - earthStart.y) * approach,
          };
          const earthSize = 108;

          return (
            <g>
              <path
                d={`M ${ORBIT_P0.x} ${ORBIT_P0.y} Q ${ORBIT_P1.x} ${ORBIT_P1.y} ${ORBIT_P2.x} ${ORBIT_P2.y}`}
                fill="none" stroke={stroke} strokeWidth={5} strokeDasharray="4 14"
                strokeLinecap="round" opacity={0.28}
              />

              {approach > 0.02 ? (
                <g transform={`translate(${earthPos.x - earthSize / 2} ${earthPos.y - earthSize / 2})`}>
                  <ThemedIcon name="world" size={earthSize} color={earthColor} strokePx={13} />
                </g>
              ) : null}

              {SHOWER_STREAKS.map((s, i) => {
                const sProg = progress(sp, s.at, s.at + 0.16);
                if (sProg <= 0.02) return null;
                const originX = earthPos.x + Math.cos(s.angle) * 20;
                const originY = earthPos.y + Math.sin(s.angle) * 20;
                const tipX = originX + Math.cos(s.angle) * s.len * sProg;
                const tipY = originY + Math.sin(s.angle) * s.len * sProg;
                const gid = `${orbitGradId}-s${i}`;
                return (
                  <g key={i}>
                    <defs>
                      <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={originX} y1={originY} x2={tipX} y2={tipY}>
                        <stop offset="0%" stopColor={glowColor} stopOpacity={0} />
                        <stop offset="100%" stopColor={glowColor} stopOpacity={0.95} />
                      </linearGradient>
                    </defs>
                    <line x1={originX} y1={originY} x2={tipX} y2={tipY} stroke={`url(#${gid})`} strokeWidth={9} strokeLinecap="round" />
                  </g>
                );
              })}
            </g>
          );
        })() : null}
      </svg>
    </div>
  );
};

/** 우주를 떠도는 작은 돌조각 하나(tabler `meteor` 아이콘). s2(등장)·s3(크기 대비)처럼
 *  대기 진입 이전, 정적인 장면에서 단독으로 쓴다. */
export interface MeteorRockProps {
  size: number;
  color?: string;
  strokePx?: number;
  style?: React.CSSProperties;
}
export const MeteorRock: React.FC<MeteorRockProps> = ({ size, color = C.nightSoft, strokePx = 13, style }) => (
  <ThemedIcon name="meteor" size={size} color={color} strokePx={strokePx} style={style} />
);

export default MeteorEntryDiagram;
