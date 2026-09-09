/** "체액 속 보호 성분 + 조직의 촘촘한 혈관망이 합쳐져 회복이 빨라진다"는 구조를 보여주는
 *  범용 다이어그램(혀 깨물었을 때 상처가 금방 낫는 이유, general-ep91).
 *
 *  REGISTRY 확인 완료 - `WoundCrossSectionDiagram`(general-ep38)·`WoundHealDiagram`
 *  (general-ep54)은 둘 다 "표면 절개 상처가 낫는 단계"(딱지·신경 노출)를 다뤄 이 화의
 *  "침 성분 + 혈관 밀도 차이로 회복 속도 자체가 달라진다"는 주제와 목적이 달라 새로 만들었다.
 *  단, 원형 단면(피부 원 + 안쪽 옅은 조직 톤, CX/CY/R_OUTER/R_INNER) 시각 문법은 그대로
 *  재사용해 "단면을 볼 때는 이 원 그림"이라는 채널 관례를 유지한다.
 *
 *  3개의 독립 레이어를 받는다(LightScatterDiagram·CloudFloatDiagram과 같은 설계 - 각
 *  progress가 undefined면 그 레이어를 안 그린다. 한 씬에는 보통 하나만 넘긴다):
 *   - `salivaProgress`(0~1): 침방울(ThemedIcon droplet 재사용) 하나가 팝인하고, 그 안에
 *     작은 성분 입자 2개(원 도형만, 점 무리 금지)가 떠오른다. 후반부에는 침방울 옆에
 *     세균(virus 아이콘) 하나가 나타났다가 X 표시로 막히는 것을 보여줘 "세균을 막아준다"는
 *     내레이션을 좌표로 직접 드러낸다.
 *   - `vesselCompareProgress`(0~1): 입 안 점막 단면과 팔 피부 단면을 나란히 놓고, 입 안
 *     쪽에만 혈관(굵은 선, 점 무리 아님)을 6가닥, 피부 쪽엔 2가닥만 그려 밀도 차이를
 *     dash-reveal로 드러낸다. 안쪽 조직 톤도 입 안은 혈색이 도는 코랄, 피부는 옅은 톤으로
 *     달리한다.
 *   - `deliverProgress`(0~1): 입 안 쪽 촘촘한 혈관에서 작은 입자 3개(WoundHealDiagram의
 *     histamineProgress와 같은 "이동하는 물질" 언어, 표면 반복 요소 아님)가 상처 지점
 *     (`MOUTH_HEAL_WOUND_PT`)으로 빠르게 몰려들어 도착 시 짧은 후광을 남긴다. 이 레이어를
 *     쓰는 씬은 vesselCompareProgress=1도 함께 유지해서 넘겨야 한다(21화 이후 결함 D -
 *     이전 상태를 명시적으로 유지).
 *
 *  `f`(선택, 프레임)를 주면 도착 후광이 펄스로, 안 주면 고정 강도로 빛난다
 *  (FingertipNerveDiagram과 같은 f 예외 패턴, Math.random 미사용 - 원칙 3. 혈관 곡선은
 *  고정 각도(deg)의 삼각함수로 계산한 결정적 좌표다).
 *
 *  "체액 성분과 조직 혈류 밀도가 합쳐져 회복 속도를 좌우한다"는 구조를 갖는 다른 소재
 *  (장기별 회복 속도 비교 등) 재사용 가능성이 있어 에피소드 로컬이 아니라 레지스트리에
 *  등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export const MOUTH_HEAL_VB_W = 760;
export const MOUTH_HEAL_VB_H = 760;

/* ---------------- 침방울 레이어 좌표 ----------------
 * TearDropDiagram(general-ep81)이 물방울을 viewBox 폭의 약 70%로 채우는 비율을 참고해,
 * 침방울도 viewBox의 절반을 넘게 채운다(스틸 선점검에서 처음 260px 크기가 화면 대비 너무
 * 작다는 것을 발견해 키움, 원칙 5). */
const DROP_CX = 380;
const DROP_CY = 380;
const DROP_SIZE = 460;
const PARTICLE_GOLD = { x: DROP_CX - 60, y: DROP_CY + 55 };
const PARTICLE_CORAL = { x: DROP_CX + 70, y: DROP_CY - 35 };
const GERM_PT = { x: DROP_CX + 280, y: DROP_CY - 140 };

/* ---------------- 단면 비교 레이어 좌표 ---------------- */
const CY = 380;
const MOUTH_CX = 200;
const SKIN_CX = 560;
const R_OUTER = 190;
const R_INNER = 152;

export const MOUTH_HEAL_MOUTH_LABEL_PT = { x: MOUTH_CX, y: CY - R_OUTER - 46 };
export const MOUTH_HEAL_SKIN_LABEL_PT = { x: SKIN_CX, y: CY - R_OUTER - 46 };
/** 입 안 단면 안쪽, 상처 자리(deliverProgress가 입자를 이 지점으로 모은다) */
export const MOUTH_HEAL_WOUND_PT = { x: MOUTH_CX, y: CY - 70 };

interface VesselDef { ox: number; oy: number; angle: number; len: number; bulgeSign: 1 | -1 }
/** 입 안 - 촘촘한 혈관망(6가닥). 각도·오프셋은 고정값(삼각함수로 계산, Math.random 미사용) */
const MOUTH_VESSELS: VesselDef[] = [
  { ox: -58, oy: -74, angle: 18, len: 162, bulgeSign: 1 },
  { ox: -74, oy: 8, angle: -10, len: 177, bulgeSign: -1 },
  { ox: -51, oy: 79, angle: 22, len: 152, bulgeSign: 1 },
  { ox: 10, oy: -89, angle: 96, len: 139, bulgeSign: -1 },
  { ox: 38, oy: -8, angle: 84, len: 165, bulgeSign: 1 },
  { ox: 18, oy: 76, angle: 100, len: 137, bulgeSign: -1 },
];
/** 피부 - 성긴 혈관(2가닥만) */
const SKIN_VESSELS: VesselDef[] = [
  { ox: -28, oy: -38, angle: 20, len: 114, bulgeSign: 1 },
  { ox: 18, oy: 42, angle: -14, len: 106, bulgeSign: -1 },
];

function vesselPath(cx: number, cy: number, v: VesselDef) {
  const rad = (v.angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const half = v.len / 2;
  const x1 = cx + v.ox - dx * half;
  const y1 = cy + v.oy - dy * half;
  const x2 = cx + v.ox + dx * half;
  const y2 = cy + v.oy + dy * half;
  const bulge = v.len * 0.16 * v.bulgeSign;
  const mx = cx + v.ox - dy * bulge;
  const my = cy + v.oy + dx * bulge;
  const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  return { d, len: v.len * 1.08, mid: { x: mx, y: my } };
}

export interface MouthHealDiagramProps {
  /** 도착 후광 펄스에 쓰는 씬 로컬 프레임 (생략하면 고정 강도) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 침방울 팝인 + 성분 입자 2개 + 후반 세균 차단 */
  salivaProgress?: number;
  /** 0~1. 입 안/피부 단면을 나란히 놓고 혈관 밀도 차이를 dash-reveal */
  vesselCompareProgress?: number;
  /** 0~1. 입 안 혈관에서 상처 지점으로 입자 3개가 빠르게 몰려듦 (vesselCompareProgress=1과 함께 사용) */
  deliverProgress?: number;
  stroke?: string;
  fill?: string;
  vesselColor?: string;
  mouthTintColor?: string;
  skinTintColor?: string;
  salivaColor?: string;
  style?: React.CSSProperties;
}

export const MouthHealDiagram: React.FC<MouthHealDiagramProps> = ({
  f, width, x = 0, y = 0,
  salivaProgress, vesselCompareProgress, deliverProgress,
  stroke = C.ink, fill = C.paper, vesselColor = C.coral,
  mouthTintColor = C.coralSoft, skinTintColor = C.room, salivaColor = C.waterCool,
  style,
}) => {
  const pulse = f === undefined ? 1 : 0.6 + 0.4 * Math.sin((f / 30) * Math.PI * 2);

  const saliva = salivaProgress === undefined ? undefined : clamp01(salivaProgress);
  const vessel = vesselCompareProgress === undefined ? undefined : clamp01(vesselCompareProgress);
  const deliver = deliverProgress === undefined ? undefined : clamp01(deliverProgress);

  const dropScale = saliva === undefined ? 0 : smooth(clamp01(saliva / 0.35));
  const goldT = saliva === undefined ? 0 : clamp01((saliva - 0.3) / 0.35);
  const coralT = saliva === undefined ? 0 : clamp01((saliva - 0.42) / 0.35);
  const germT = saliva === undefined ? 0 : clamp01((saliva - 0.55) / 0.3);
  const blockT = saliva === undefined ? 0 : clamp01((saliva - 0.75) / 0.25);

  return (
    <svg
      viewBox={`0 0 ${MOUTH_HEAL_VB_W} ${MOUTH_HEAL_VB_H}`}
      width={width} height={(width * MOUTH_HEAL_VB_H) / MOUTH_HEAL_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* ---------------- 침방울 레이어 ---------------- */}
      {saliva !== undefined && dropScale > 0.01 ? (
        <g
          transform={`translate(${DROP_CX} ${DROP_CY}) scale(${dropScale}) translate(${-DROP_CX} ${-DROP_CY})`}
        >
          <g transform={`translate(${DROP_CX - DROP_SIZE / 2} ${DROP_CY - DROP_SIZE / 2})`}>
            <ThemedIcon name="droplet" size={DROP_SIZE} color={salivaColor} strokePx={11} />
          </g>
        </g>
      ) : null}
      {saliva !== undefined && goldT > 0.01 ? (
        <circle
          cx={PARTICLE_GOLD.x} cy={PARTICLE_GOLD.y - goldT * 24} r={26}
          fill={C.gold} stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={goldT}
        />
      ) : null}
      {saliva !== undefined && coralT > 0.01 ? (
        <circle
          cx={PARTICLE_CORAL.x} cy={PARTICLE_CORAL.y - coralT * 30} r={23}
          fill={C.coral} stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={coralT}
        />
      ) : null}
      {saliva !== undefined && germT > 0.01 ? (
        <g opacity={germT * (blockT > 0.01 ? 1 : 0.9)}>
          <g transform={`translate(${GERM_PT.x - 52} ${GERM_PT.y - 52})`}>
            <ThemedIcon name="virus" size={104} color={C.inkSoft} strokePx={10} />
          </g>
          {blockT > 0.01 ? (
            <g transform={`translate(${GERM_PT.x - 40} ${GERM_PT.y - 40})`} opacity={blockT}>
              <ThemedIcon name="x" size={80} color={C.coral} strokePx={13} />
            </g>
          ) : null}
        </g>
      ) : null}

      {/* ---------------- 단면 비교 레이어 (입 안 vs 피부) ---------------- */}
      {vessel !== undefined ? (
        <>
          {/* 입 안 단면 */}
          <circle cx={MOUTH_CX} cy={CY} r={R_OUTER} fill={fill} stroke={stroke} strokeWidth={SW} />
          <circle cx={MOUTH_CX} cy={CY} r={R_INNER} fill={mouthTintColor} opacity={0.55} />
          {MOUTH_VESSELS.map((v, i) => {
            const { d, len } = vesselPath(MOUTH_CX, CY, v);
            const start = (i / MOUTH_VESSELS.length) * 0.35;
            const t = smooth(clamp01((vessel - start) / 0.55));
            return (
              <path
                key={`mv${i}`} d={d} fill="none" stroke={vesselColor} strokeWidth={SW_THIN}
                strokeLinecap="round"
                strokeDasharray={len} strokeDashoffset={len * (1 - t)} opacity={t > 0.02 ? 1 : 0}
              />
            );
          })}

          {/* 피부 단면 */}
          <circle cx={SKIN_CX} cy={CY} r={R_OUTER} fill={fill} stroke={stroke} strokeWidth={SW} />
          <circle cx={SKIN_CX} cy={CY} r={R_INNER} fill={skinTintColor} opacity={0.6} />
          {SKIN_VESSELS.map((v, i) => {
            const { d, len } = vesselPath(SKIN_CX, CY, v);
            const start = (i / SKIN_VESSELS.length) * 0.3;
            const t = smooth(clamp01((vessel - start) / 0.55));
            return (
              <path
                key={`sv${i}`} d={d} fill="none" stroke={vesselColor} strokeWidth={SW_THIN}
                strokeLinecap="round"
                strokeDasharray={len} strokeDashoffset={len * (1 - t)} opacity={t > 0.02 ? 1 : 0}
              />
            );
          })}
        </>
      ) : null}

      {/* ---------------- 상처로 몰려드는 입자 (deliverProgress) ---------------- */}
      {deliver !== undefined ? (() => {
        const sources = [MOUTH_VESSELS[0], MOUTH_VESSELS[3], MOUTH_VESSELS[4]];
        const arrivals: number[] = [];
        // 스태거 시작점을 넓게 벌려(0, 0.15, 0.3) + 구간 길이를 늘려(0.7) 중간 진행도에서도
        // 세 입자가 뚜렷이 다른 위치에 있도록 한다(첫 설계는 0.16 간격 + 0.5 구간이라
        // deliver=0.5 시점에 첫 입자가 이미 도착해 겹쳐 보였다 - 스틸 선점검에서 발견,
        // 원칙 5). 마지막 입자는 deliver=1에서 정확히 도착(0.3+0.7=1.0)한다.
        const STARTS = [0, 0.15, 0.3];
        const DUR = 0.7;
        const particles = sources.map((v, i) => {
          const { mid } = vesselPath(MOUTH_CX, CY, v);
          const start = STARTS[i] ?? i * 0.15;
          const t = smooth(clamp01((deliver - start) / DUR));
          arrivals.push(t);
          const px = lerp(mid.x, MOUTH_HEAL_WOUND_PT.x, t);
          const py = lerp(mid.y, MOUTH_HEAL_WOUND_PT.y, t);
          return { px, py, t };
        });
        const arrivalMax = Math.max(0, ...arrivals);
        const glowT = clamp01((arrivalMax - 0.85) / 0.15);
        return (
          <>
            {/* 상처 자리 - 가는 선 하나짜리 슬릿 (피·진물 없음) */}
            <path
              d={`M ${MOUTH_HEAL_WOUND_PT.x - 18} ${MOUTH_HEAL_WOUND_PT.y - 8} L ${MOUTH_HEAL_WOUND_PT.x} ${MOUTH_HEAL_WOUND_PT.y + 10} L ${MOUTH_HEAL_WOUND_PT.x + 18} ${MOUTH_HEAL_WOUND_PT.y - 8}`}
              fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.8} strokeLinecap="round" strokeLinejoin="round"
            />
            {glowT > 0.01 ? (
              <circle
                cx={MOUTH_HEAL_WOUND_PT.x} cy={MOUTH_HEAL_WOUND_PT.y} r={30 + 10 * pulse}
                fill={C.goldSoft} opacity={glowT * (0.4 + 0.3 * pulse)}
              />
            ) : null}
            {particles.map((p, i) => (
              p.t > 0.02 ? (
                <circle
                  key={`p${i}`} cx={p.px} cy={p.py} r={15}
                  fill={i === 1 ? C.gold : C.coral} stroke={stroke} strokeWidth={SW_THIN * 0.5}
                  opacity={p.t}
                />
              ) : null
            ))}
          </>
        );
      })() : null}
    </svg>
  );
};

export default MouthHealDiagram;
