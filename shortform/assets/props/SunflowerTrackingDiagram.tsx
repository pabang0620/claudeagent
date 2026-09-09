/** "어린 해바라기는 낮에는 해를 따라 서쪽으로 고개를 돌렸다가 밤사이 다시 동쪽으로
 *  돌아가고, 다 자라 꽃이 피면 줄기가 굳어 대부분 동쪽을 향한 채 고정된다"는 인과를
 *  보여주는 다이어그램(해바라기가 해를 따라 도는 이유, general-ep78).
 *
 *  StarlightDiagram·LightScatterDiagram과 같은 설계 원칙 - 독립 레이어(각각 undefined면
 *  그 레이어는 그리지 않는다):
 *   - trackingProgress(0~1) : 하루 주기 타임랩스. 0~DAY_END(해가 동쪽 지평선에서 떠서
 *     하늘 위를 지나 서쪽 지평선으로 지는 낮 구간) 동안 해는 오른쪽(동)에서 위를 거쳐
 *     왼쪽(서)으로 이동하고, 줄기는 그 해의 수평 위치를 따라 동->수직->서로 기운다.
 *     DAY_END~1(밤 구간)은 하늘이 어두워지고 별·달이 뜨며, 줄기는 다시 서->동으로
 *     되돌아간다(밤새 동쪽을 보도록 리셋). "낮에는 서쪽으로, 밤에는 동쪽으로"라는 대본
 *     서술을 줄기 기울기 하나로 표현한다.
 *   - matureProgress(0~1)  : 줄기가 가늘고 움직이던 상태(base)에서 두껍고 동쪽으로
 *     고정된 상태(LOCK_LEAN_DEG, trackingProgress의 새벽/동쪽 각도와 동일)로 전환.
 *     꽃 머리도 어린 크기->다 자란 크기로 커지고, 0.55 이후 정지 아이콘(일시정지 막대
 *     2개)이 배지 형태로 페이드인해 "더는 움직이지 않는다"를 표시한다.
 *     trackingProgress와 함께 넘기면 "낮 동안 움직이던 각도"에서 "동쪽 고정 각도"로
 *     보간되고, 단독으로 넘기면(클로즈업 장면용) 수직(0도) 기준에서 고정 각도로 보간된다.
 *   - pollinatorProgress(0~1) : trackingProgress/matureProgress와 별개로, 동쪽을 보는
 *     꽃(오른쪽)과 그 반대(왼쪽)를 나란히 놓고 동쪽 꽃에만 아침 햇살(대각선 화살 몇 가닥)과
 *     온기 후광이 커지며, 벌 한 마리가 중앙에서 동쪽 꽃으로 날아간다. 이 레이어가 있으면
 *     단일 해바라기 장면 대신 이 비교 패널만 그린다(장면마다 둘 중 하나만 씀).
 *
 *  꽃·줄기는 단순 도형(직선/완만한 곡선 줄기, 짧은 타원 꽃잎 8장, 원판 중심)으로만
 *  그린다 - 촘촘한 꽃잎이나 점 텍스처를 쓰지 않는다(오케스트레이터 지시). 별·달은 고정
 *  좌표 배열로 결정적으로 그린다(원칙 3, Math.random 미사용).
 *
 *  SunflowerIcon은 다이어그램 내부에서 쓰는 단일 꽃 도형을 별도로도 노출한다 - s2(어린
 *  vs 다 자란 실루엣 비교), s5(들판 항공샷), s7(마무리 컷)처럼 다이어그램 애니메이션 없이
 *  정지된 꽃 여러 개를 배치하는 장면에서 재사용한다. "식물이 자라며 상태가 바뀌는" 소재
 *  전반(다른 식물·꽃 화)에서도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React from 'react';
import { C, SW } from '../theme';
import { AUTUMN_GREEN } from './Leaf';

export const SUNFLOWER_VB_W = 900;
export const SUNFLOWER_VB_H = 900;

/** 낮 구간이 전체 주기(0~1)에서 차지하는 비율. 나머지는 밤 구간 */
const DAY_END = 0.72;
/** 줄기가 기울 수 있는 최대 각도(수직 기준, degree). +값 = 오른쪽(동)으로 기욺 */
const MAX_LEAN_DEG = 32;
/** 다 자라 고정되는 각도 = 새벽(동쪽) 각도와 동일 */
const LOCK_LEAN_DEG = MAX_LEAN_DEG;

const GROUND_Y = 760;
const CX = SUNFLOWER_VB_W / 2;
const SUN_R = 320;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const STEM_GREEN = AUTUMN_GREEN;
const STEM_GREEN_DARK = '#33804E';
const PETAL_GOLD = C.gold;
const DISC_BROWN = '#8A5A2E';

/* ============================================================
 * 별·달 (밤 하늘, 고정 좌표 - 결정적)
 * ============================================================ */
const STARS: Array<{ x: number; y: number; r: number }> = [
  { x: 120, y: 140, r: 5 }, { x: 260, y: 90, r: 4 }, { x: 400, y: 160, r: 6 },
  { x: 560, y: 100, r: 4 }, { x: 700, y: 150, r: 5 }, { x: 800, y: 220, r: 4 },
  { x: 180, y: 260, r: 4 }, { x: 640, y: 260, r: 5 }, { x: 470, y: 70, r: 4 },
  { x: 320, y: 300, r: 3 },
];

/* ============================================================
 * SunflowerIcon: 단일 꽃 도형 (다이어그램 내부 + 정적 장면 재사용)
 * ============================================================ */
export interface SunflowerIconProps {
  /** 밑동(땅에 닿는 지점) 좌표 */
  cx: number;
  cy: number;
  /** 수직 기준 기울기(도). + = 오른쪽으로 기욺 */
  angleDeg?: number;
  headR?: number;
  stemLen?: number;
  stemWidth?: number;
  petalColor?: string;
  discColor?: string;
  stemColor?: string;
  stroke?: string;
  strokeWidth?: number;
  showLeaves?: boolean;
  opacity?: number;
  /** 0~1, 1이면 머리 위에 정지(일시정지 막대) 배지를 그린다 */
  lockBadge?: number;
  style?: React.CSSProperties;
}

export const SunflowerIcon: React.FC<SunflowerIconProps> = ({
  cx, cy, angleDeg = 0, headR = 70, stemLen = 300, stemWidth = 14,
  petalColor = PETAL_GOLD, discColor = DISC_BROWN, stemColor = STEM_GREEN,
  stroke = C.ink, strokeWidth = SW, showLeaves = true, opacity = 1, lockBadge = 0, style,
}) => {
  if (opacity <= 0.01) return null;
  const rad = (angleDeg * Math.PI) / 180;
  const headCx = cx + Math.sin(rad) * stemLen;
  const headCy = cy - Math.cos(rad) * stemLen;
  const midCx = cx + Math.sin(rad) * stemLen * 0.55;
  const midCy = cy - Math.cos(rad) * stemLen * 0.55;
  const bowX = Math.cos(rad) * stemLen * 0.05;
  const bowY = Math.sin(rad) * stemLen * 0.05;
  const stemPath = `M ${cx} ${cy} Q ${midCx + bowX} ${midCy + bowY} ${headCx} ${headCy}`;

  const petalCount = 8;
  const petalLen = headR * 0.85;
  const petalW = headR * 0.42;

  return (
    <g opacity={opacity} style={style}>
      {/* 줄기 */}
      <path d={stemPath} fill="none" stroke={stemColor} strokeWidth={stemWidth} strokeLinecap="round" />
      <path d={stemPath} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" opacity={0.35} />

      {/* 잎 2장 (줄기 중간, 단순 타원) */}
      {showLeaves ? (
        <>
          <ellipse
            cx={midCx - 46} cy={midCy + 10} rx={44} ry={20}
            fill={stemColor} stroke={stroke} strokeWidth={strokeWidth * 0.55}
            transform={`rotate(${-20 + angleDeg * 0.3} ${midCx - 46} ${midCy + 10})`}
          />
          <ellipse
            cx={midCx + 46} cy={midCy - 26} rx={40} ry={18}
            fill={stemColor} stroke={stroke} strokeWidth={strokeWidth * 0.55}
            transform={`rotate(${20 + angleDeg * 0.3} ${midCx + 46} ${midCy - 26})`}
          />
        </>
      ) : null}

      {/* 꽃 머리: 꽃잎 8장 + 중심 원판 */}
      <g transform={`translate(${headCx} ${headCy})`}>
        {Array.from({ length: petalCount }).map((_, i) => {
          const a = (i / petalCount) * 360;
          return (
            <ellipse
              key={i}
              cx={0} cy={-(headR * 0.62)} rx={petalW / 2} ry={petalLen / 2}
              fill={petalColor} stroke={stroke} strokeWidth={strokeWidth * 0.5}
              transform={`rotate(${a})`}
            />
          );
        })}
        <circle r={headR * 0.42} fill={discColor} stroke={stroke} strokeWidth={strokeWidth * 0.6} />
      </g>

      {/* 정지 배지 (일시정지 막대 2개) */}
      {lockBadge > 0.01 ? (
        <g transform={`translate(${headCx + headR * 0.86} ${headCy - headR * 0.86})`} opacity={lockBadge}>
          <circle r={34} fill={C.paper} stroke={stroke} strokeWidth={strokeWidth * 0.55} />
          <rect x={-13} y={-14} width={9} height={28} rx={3} fill={stroke} />
          <rect x={4} y={-14} width={9} height={28} rx={3} fill={stroke} />
        </g>
      ) : null}
    </g>
  );
};

/* ============================================================
 * SunflowerTrackingDiagram
 * ============================================================ */
export interface SunflowerTrackingDiagramProps {
  width: number;
  x?: number;
  y?: number;
  trackingProgress?: number;
  matureProgress?: number;
  pollinatorProgress?: number;
  stroke?: string;
  style?: React.CSSProperties;
}

export const SunflowerTrackingDiagram: React.FC<SunflowerTrackingDiagramProps> = ({
  width, x = 0, y = 0, trackingProgress, matureProgress, pollinatorProgress,
  stroke = C.ink, style,
}) => {
  const height = width * (SUNFLOWER_VB_H / SUNFLOWER_VB_W);

  /* ---------- 화분매개 비교 패널 (별도 모드) ---------- */
  if (pollinatorProgress !== undefined) {
    const p = smooth(pollinatorProgress);
    const westX = 260;
    const eastX = 640;
    const flowerY = GROUND_Y - 40;
    const beeT = smooth(clamp01(pollinatorProgress / 0.85));
    const beeX = lerp(CX, eastX + 10, beeT);
    const beeY = lerp(GROUND_Y - 120, flowerY - 170, beeT);
    const glowR = lerp(46, 150, p);
    const rayA = clamp01((pollinatorProgress - 0.15) / 0.5);

    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
        <svg width={width} height={height} viewBox={`0 0 ${SUNFLOWER_VB_W} ${SUNFLOWER_VB_H}`} style={{ overflow: 'visible' }}>
          <line x1={40} y1={GROUND_Y} x2={SUNFLOWER_VB_W - 40} y2={GROUND_Y} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={0.5} />

          {/* 서쪽(반대편)을 보는 꽃 - 아침 햇살을 못 받아 그대로 */}
          <SunflowerIcon
            cx={westX} cy={flowerY} angleDeg={-LOCK_LEAN_DEG} headR={78} stemLen={260}
            stemWidth={26} stroke={stroke} opacity={0.82}
          />

          {/* 동쪽을 보는 꽃 - 온기 후광 + 아침 햇살 */}
          <circle cx={eastX} cy={flowerY - 190} r={glowR} fill={C.gold} opacity={0.28 * p} />
          {rayA > 0.01 ? (
            <g opacity={rayA} stroke={C.gold} strokeWidth={10} strokeLinecap="round">
              <line x1={eastX + 120} y1={flowerY - 320} x2={eastX + 60} y2={flowerY - 250} />
              <line x1={eastX + 165} y1={flowerY - 260} x2={eastX + 95} y2={flowerY - 210} />
              <line x1={eastX + 150} y1={flowerY - 195} x2={eastX + 90} y2={flowerY - 165} />
            </g>
          ) : null}
          <SunflowerIcon
            cx={eastX} cy={flowerY} angleDeg={LOCK_LEAN_DEG} headR={78} stemLen={260}
            stemWidth={26} stroke={stroke}
          />

          {/* 벌 (단순 도형: 몸통 타원 + 날개 2장) */}
          <g transform={`translate(${beeX} ${beeY})`} opacity={smooth(clamp01(pollinatorProgress / 0.15))}>
            <ellipse cx={-16} cy={-4} rx={17} ry={9} fill={C.gold} stroke={stroke} strokeWidth={4} transform="rotate(-18 -16 -4)" />
            <ellipse cx={11} cy={4} rx={22} ry={11} fill={C.ink} stroke={stroke} strokeWidth={4} transform="rotate(-8 11 4)" />
            <ellipse cx={2} cy={-18} rx={15} ry={9} fill={C.paper} opacity={0.75} transform="rotate(-24 2 -18)" />
            <ellipse cx={-8} cy={-20} rx={13} ry={8} fill={C.paper} opacity={0.6} transform="rotate(-40 -8 -20)" />
          </g>
        </svg>
      </div>
    );
  }

  /* ---------- 낮/밤 타임랩스 + 성숙 고정 (단일 꽃 모드) ---------- */
  const t = trackingProgress;
  let baseAngle = 0;
  let sunOpacity = 0;
  let nightOpacity = 0;
  let sunX = CX + SUN_R;
  let sunY = GROUND_Y;

  if (t !== undefined) {
    if (t <= DAY_END) {
      const theta = clamp01(t / DAY_END) * Math.PI;
      baseAngle = MAX_LEAN_DEG * Math.cos(theta);
      sunX = CX + SUN_R * Math.cos(theta);
      sunY = GROUND_Y - SUN_R * Math.sin(theta);
      sunOpacity = 1 - smooth(clamp01((t - (DAY_END - 0.08)) / 0.16));
    } else {
      const nightT = smooth(clamp01((t - DAY_END) / (1 - DAY_END)));
      baseAngle = lerp(-MAX_LEAN_DEG, MAX_LEAN_DEG, nightT);
      sunOpacity = 0;
    }
    // 밤 오버레이: DAY_END 근처에서 페이드인, 끝부분(새벽 임박)에서 다시 페이드아웃
    const inT = smooth(clamp01((t - DAY_END) / 0.14));
    const outT = smooth(clamp01((t - 0.90) / 0.10));
    nightOpacity = Math.max(0, inT - outT);
  }

  const m = matureProgress;
  const angle = m !== undefined ? lerp(baseAngle, LOCK_LEAN_DEG, smooth(m)) : baseAngle;
  const stemWidth = m !== undefined ? lerp(14, 30, smooth(m)) : 14;
  const headR = m !== undefined ? lerp(66, 108, smooth(m)) : 66;
  const stemLen = m !== undefined ? lerp(300, 320, smooth(m)) : 300;
  const lockBadge = m !== undefined ? smooth(clamp01((m - 0.55) / 0.45)) : 0;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${SUNFLOWER_VB_W} ${SUNFLOWER_VB_H}`} style={{ overflow: 'visible' }}>
        {t !== undefined ? (
          <>
            {/* 밤 하늘 오버레이 */}
            <rect x={-20} y={-20} width={SUNFLOWER_VB_W + 40} height={GROUND_Y + 20} fill={C.night} opacity={0.72 * nightOpacity} />
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C.cream} opacity={nightOpacity * 0.9} />
            ))}
            <circle cx={CX + 130} cy={230} r={54} fill={C.cream} opacity={nightOpacity * 0.85} />

            {/* 해 */}
            {sunOpacity > 0.01 ? (
              <g opacity={sunOpacity}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const a = (i / 8) * Math.PI * 2;
                  const r1 = 62;
                  const r2 = 84;
                  return (
                    <line
                      key={i}
                      x1={sunX + Math.cos(a) * r1} y1={sunY + Math.sin(a) * r1}
                      x2={sunX + Math.cos(a) * r2} y2={sunY + Math.sin(a) * r2}
                      stroke={C.gold} strokeWidth={10} strokeLinecap="round"
                    />
                  );
                })}
                <circle cx={sunX} cy={sunY} r={50} fill={C.gold} stroke={stroke} strokeWidth={SW * 0.6} />
              </g>
            ) : null}
          </>
        ) : null}

        {/* 지평선 */}
        <line x1={30} y1={GROUND_Y} x2={SUNFLOWER_VB_W - 30} y2={GROUND_Y} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={0.5} />

        <SunflowerIcon
          cx={CX} cy={GROUND_Y} angleDeg={angle} headR={headR} stemLen={stemLen}
          stemWidth={stemWidth} stroke={stroke} lockBadge={lockBadge}
        />
      </svg>
    </div>
  );
};

export default SunflowerTrackingDiagram;
