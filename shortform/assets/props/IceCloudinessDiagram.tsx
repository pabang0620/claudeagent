/** "물속 입자(공기·미네랄)가 결정화 과정에서 얼음 결정에 못 들어가고 아직 안 언 쪽으로
 *  밀려나 갇히고, 그렇게 갇힌 입자들이 빛을 이리저리 흩어 놓아 뿌옇게 보인다"는 구조를
 *  보여주는 범용 다이어그램(집에서 얼린 얼음이 뿌연 이유, general-ep83).
 *
 *  REGISTRY 확인 완료 - `WaterMoleculeLattice`(general-ep17)는 "조밀한 액체 배열 -> 육각형
 *  고체 결정 격자"라는 상전이(결정화) 자체의 조밀함 변화만 다루는 구조라, "결정에 못 들어간
 *  불순물이 특정 위치로 밀려나 농축된다"는 이 화의 구조와 목적이 달라 재사용할 수 없었다.
 *  `TearDropDiagram`(general-ep81)의 `SaltDiamond` 글리프 공식을 미네랄 입자에 그대로
 *  재사용했다(원칙 0-1 - 좌표 재발명 없음). 빛 산란은 `LightScatterDiagram`(general-ep22)의
 *  화살(선+화살촉) 어휘를 로컬로 재구현했다(`WetFabricLightDiagram`과 같은 판단 - 좌표계가
 *  달라 그대로 import하지 않는다, 지역성 우선).
 *
 *  CellMergeDiagram과 같은 원칙(각 progress는 "이 순간의 상태"만 그리는 순수 함수, 이전
 *  단계가 1인 상태를 전제로 이어받는다)을 따른다 - 컴포넌트 자체는 시간에 따라 스스로
 *  애니메이션하지 않고, 호출 씬이 progress()로 원하는 프레임 구간에 매핑한다.
 *
 *  하나의 정사각 "얼음틀 한 칸" 단면을 s3(물방울 클로즈업, dissolveProgress만) ~
 *  s5(가운데 뭉친 기포 + 빛 산란, trapProgress/scatterProgress)까지 같은 레이아웃으로
 *  이어서 쓴다 - 호출 씬이 width로 확대율만 바꾼다(HiccupDiagram과 같은 "단일 컴포넌트로
 *  여러 화면 커버" 설계).
 *
 *  `mode`:
 *   - 'trapped'(기본, 집 얼음): 얼음 결정이 4면에서 가운데로 균일하게 좁혀 들어오고, 입자는
 *     가운데로 밀려나 갇힌 채 남는다(pushProgress로 이동, trapProgress로 뭉쳐 뿌옇게 됨).
 *   - 'directional'(가게 얼음): 얼음 결정이 왼쪽에서 오른쪽 한 방향으로만 자라 들어오고,
 *     입자는 아직 안 언 오른쪽으로 계속 밀려나다 결국 화면 오른쪽 밖으로 빠져나간다
 *     (freezeProgress=1이면 안 언 구간이 남지 않아 입자가 갇힐 자리 자체가 없다 - "공기가
 *     빠져나갈 틈을 준다"를 별도 분기 없이 같은 계산식으로 표현).
 *
 *  채널 원칙(작은 점을 여러 개 뿌리지 않는다, 오케스트레이터 지시)에 따라 입자는 4개(공기
 *  원 2개 + 미네랄 다이아몬드 2개)까지만 그리고, 갇힌 기포 뭉침도 큰 반투명 원 3개를
 *  겹치는 것으로만 "뿌옇다"를 표현한다(작은 점 다수 살포 금지). 색은 고정 hex만 쓰고
 *  런타임에 rgb()를 다시 보간하지 않는다(49화 색 보간 버그 재발 방지) - opacity만 진행도로
 *  바꾼다. Math.random 미사용(원칙 3) - 입자 좌표는 전부 고정 배열이다.
 *
 *  "결정화 과정에서 불순물이 특정 위치로 밀려나 농축된다" 구조를 갖는 다른 소재(합금 응고,
 *  서리 형성 등) 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export const ICE_CLOUD_VB_W = 700;
export const ICE_CLOUD_VB_H = 700;

const BOX = { x: 70, y: 70, w: 560, h: 560 };
const BOX_CX = BOX.x + BOX.w / 2; // 350
const BOX_CY = BOX.y + BOX.h / 2; // 350
const CORE = 210; // 가운데 남는(트랩되는) 최종 코어 정사각 한 변

/** 라벨 앵커 - 호출 씬이 strings.ts 문구를 Label로 얹는다(하드코딩 문자열 없음) */
export const ICE_AIR_LABEL_PT = { x: 260, y: 100 };
export const ICE_MINERAL_LABEL_PT = { x: 530, y: 130 };
export const ICE_DIRECTIONAL_LABEL_PT = { x: BOX_CX, y: BOX.y + BOX.h + 40 };

/** SaltCycleDiagram/TearDropDiagram 의 SaltDiamond 와 동일한 결정 글리프 공식(재사용) */
function CrystalDiamond({
  x, y, r, opacity, color, stroke,
}: { x: number; y: number; r: number; opacity: number; color: string; stroke: string }) {
  if (opacity <= 0.001) return null;
  const s = 0.4 + 0.6 * clamp01(opacity);
  return (
    <g style={{ opacity: clamp01(opacity) }} transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={`M 0 ${-r} L ${r * 0.82} 0 L 0 ${r} L ${-r * 0.82} 0 Z`}
        fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.75} strokeLinejoin="round"
      />
      <line x1={-r * 0.3} y1={-r * 0.28} x2={r * 0.2} y2={-r * 0.05} stroke="#FFFFFF" strokeWidth={SW_THIN * 0.5} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

/** 공기 방울 글리프 - 원 + 흰 하이라이트 초승달(점 무리 대신 큰 원 하나) */
function AirBubble({
  x, y, r, opacity, color, stroke,
}: { x: number; y: number; r: number; opacity: number; color: string; stroke: string }) {
  if (opacity <= 0.001) return null;
  const s = 0.4 + 0.6 * clamp01(opacity);
  return (
    <g style={{ opacity: clamp01(opacity) }} transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.75} />
      <ellipse cx={-r * 0.32} cy={-r * 0.32} rx={r * 0.28} ry={r * 0.16} fill="#FFFFFF" opacity={0.75} />
    </g>
  );
}

/** 화살(선+화살촉) - LightScatterDiagram 어휘를 로컬 좌표계로 재구현(지역성 우선) */
function LightArrow({
  x1, y1, x2, y2, opacity, color, width = 9,
}: { x1: number; y1: number; x2: number; y2: number; opacity: number; color: string; width?: number }) {
  if (opacity <= 0.001) return null;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const headLen = 22;
  const headW = 13;
  const tipX = x2;
  const tipY = y2;
  const baseX = tipX - ux * headLen;
  const baseY = tipY - uy * headLen;
  const nx = -uy;
  const ny = ux;
  return (
    <g opacity={clamp01(opacity)}>
      <line x1={x1} y1={y1} x2={baseX} y2={baseY} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <path
        d={`M ${tipX} ${tipY} L ${baseX + nx * headW} ${baseY + ny * headW} L ${baseX - nx * headW} ${baseY - ny * headW} Z`}
        fill={color}
      />
    </g>
  );
}

type Particle = { home: { x: number; y: number }; r: number; kind: 'air' | 'mineral' };

const PARTICLES: Particle[] = [
  { home: { x: 190, y: 200 }, r: 34, kind: 'air' },
  { home: { x: 520, y: 220 }, r: 26, kind: 'mineral' },
  { home: { x: 220, y: 520 }, r: 30, kind: 'air' },
  { home: { x: 490, y: 500 }, r: 24, kind: 'mineral' },
];

/** 가운데로 밀려나 갇힌 뒤 최종 정착 지점(트랩 모드) - 완전히 겹치지 않도록 살짝 흩어둔다 */
const TRAPPED_TARGETS = [
  { x: BOX_CX - 34, y: BOX_CY - 30 },
  { x: BOX_CX + 40, y: BOX_CY - 34 },
  { x: BOX_CX - 38, y: BOX_CY + 36 },
  { x: BOX_CX + 34, y: BOX_CY + 34 },
];

/** 안 언 오른쪽으로 계속 떠밀려 화면 밖으로 빠져나가는 지점(방향성 모드) */
const EXIT_TARGETS = [
  { x: 700, y: 200 },
  { x: 730, y: 220 },
  { x: 700, y: 520 },
  { x: 730, y: 500 },
];

export interface IceCloudinessDiagramProps {
  /** 화면상 한 변 크기(px). viewBox 는 정사각(0 0 700 700) */
  width: number;
  x?: number;
  y?: number;
  mode?: 'trapped' | 'directional';
  /** 0~1. 물속에 녹아 있던 입자(공기·미네랄) 4개가 순서대로 드러남 */
  dissolveProgress?: number;
  /** 0~1. 얼음 결정이 자라 들어가는 진행도. trapped=4면에서 가운데로, directional=왼쪽에서
   *  오른쪽 한 방향으로 */
  freezeProgress?: number;
  /** 0~1. 입자가 결정 경계를 피해 안 언 쪽으로 밀려나는 진행도(freezeProgress=1 전제) */
  pushProgress?: number;
  /** 0~1. trapped 모드에서 가운데 뭉친 기포가 짙어지는 진행도(pushProgress=1 전제) */
  trapProgress?: number;
  /** 0~1. 빛줄기가 갇힌 기포에 부딪혀 사방으로 흩어지는 진행도(trapped=trapProgress=1,
   *  directional=freezeProgress=1 전제) */
  scatterProgress?: number;
  stroke?: string;
  waterColor?: string;
  iceColor?: string;
  cloudColor?: string;
  airColor?: string;
  mineralColor?: string;
  lightColor?: string;
  style?: React.CSSProperties;
}

export const IceCloudinessDiagram: React.FC<IceCloudinessDiagramProps> = ({
  width, x = 0, y = 0, mode = 'trapped',
  dissolveProgress = 0, freezeProgress = 0, pushProgress = 0, trapProgress = 0, scatterProgress = 0,
  stroke = C.ink, waterColor = C.water, iceColor = '#EAF6FB', cloudColor = '#FFFFFF',
  airColor = '#DCEFFA', mineralColor = C.gold, lightColor = C.gold,
  style,
}) => {
  const dissolveP = clamp01(dissolveProgress);
  const freezeP = clamp01(freezeProgress);
  const pushP = clamp01(pushProgress);
  const trapP = clamp01(trapProgress);
  const scatterP = clamp01(scatterProgress);

  // 입자 4개는 시차를 두고 순서대로 드러난다(고정 스태거, Math.random 미사용)
  const revealAt = [0, 0.15, 0.3, 0.45];

  // trapped: liquidRect 가 가운데로 좁혀 들어와 CORE 크기까지 줄어든다
  // directional: liquid 영역이 왼쪽에서 오른쪽으로 한 방향으로만 줄어든다(오른쪽 벽에 닿으면 소멸)
  const liquidSizeTrapped = lerp(BOX.w, CORE, freezeP);
  const liquidXTrapped = BOX_CX - liquidSizeTrapped / 2;
  const liquidYTrapped = BOX_CY - liquidSizeTrapped / 2;

  const iceWidthDirectional = freezeP * BOX.w;
  const liquidXDirectional = BOX.x + iceWidthDirectional;
  const liquidWDirectional = Math.max(0, BOX.w - iceWidthDirectional);

  const targets = mode === 'trapped' ? TRAPPED_TARGETS : EXIT_TARGETS;

  // 기포 뭉침(트랩 모드) 중심 - 최종적으로 CORE 정중앙
  const cloudR = 30 + 96 * smooth(trapP);
  const cloudOpacity = 0.85 * smooth(trapP);

  // 빛줄기: 위에서 내려와 트랩 모드에선 갇힌 기포 뭉침에 부딪혀 사방으로 흩어지고,
  // 방향성 모드에선 그대로 바닥까지 곧게 통과한다(산란 없음 = 투명하다는 뜻)
  const beamTopY = 20;
  const hitY = mode === 'trapped' ? BOX_CY - cloudR * 0.55 : BOX.y + BOX.h - 20;
  const beamOpacity = scatterP > 0.001 ? 1 : 0;

  const FAN_ANGLES = mode === 'trapped'
    ? [-140, -100, -55, 15, 60, 110, 150]
    : [88, 92]; // directional: 거의 그대로 직진(약간의 흔들림만)
  const fanLen = mode === 'trapped' ? 150 : 90;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${ICE_CLOUD_VB_W} ${ICE_CLOUD_VB_H}`} width={width} height={width} style={{ overflow: 'visible' }}>
        {/* 얼음틀 한 칸 바깥 테두리 */}
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={36} fill={waterColor} stroke={stroke} strokeWidth={SW} />

        {/* 얼음 결정(결 무늬가 있는 프레임) - liquid 영역 바깥은 전부 이 색 위에 남는다 */}
        {freezeP > 0.001 ? (
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={36} fill={iceColor} />
        ) : null}

        {/* 아직 안 언 물 영역 */}
        {mode === 'trapped' ? (
          liquidSizeTrapped > 1 ? (
            <rect
              x={liquidXTrapped} y={liquidYTrapped} width={liquidSizeTrapped} height={liquidSizeTrapped}
              rx={Math.min(28, liquidSizeTrapped / 2)} fill={waterColor}
              stroke={freezeP > 0.02 && freezeP < 0.98 ? C.waterCool : 'none'} strokeWidth={SW_THIN * 0.6}
            />
          ) : null
        ) : (
          liquidWDirectional > 1 ? (
            <rect
              x={liquidXDirectional} y={BOX.y} width={liquidWDirectional} height={BOX.h}
              fill={waterColor}
            />
          ) : null
        )}

        {/* 결정 프레임 위에 다시 바깥 테두리(윤곽선)를 그려 결이 상자 밖으로 안 새어 보이게 함 */}
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={36} fill="none" stroke={stroke} strokeWidth={SW} />

        {/* 입자 4개(공기 원 2 + 미네랄 다이아몬드 2) - dissolveProgress로 등장, pushProgress로
         *  home -> target(trapped=가운데 / directional=오른쪽 밖) 이동 */}
        {PARTICLES.map((p, i) => {
          const reveal = smooth((dissolveP - revealAt[i]) / 0.45);
          const moved = smooth(pushP);
          const target = targets[i];
          const px = lerp(p.home.x, target.x, moved);
          const py = lerp(p.home.y, target.y, moved);
          // directional 모드에서 상자 오른쪽 벽(BOX.x+BOX.w)을 넘어서면 서서히 옅어지며 빠져나간다
          let exitFade = 1;
          if (mode === 'directional') {
            const edge = BOX.x + BOX.w;
            exitFade = px <= edge ? 1 : clamp01(1 - (px - edge) / 60);
          }
          // trapped 모드에서는 기포 뭉침(trapProgress)이 짙어지면 개별 입자는 서서히 그 안에 묻힌다
          const engulf = mode === 'trapped' ? 1 - 0.55 * smooth(trapP) : 1;
          const opacity = clamp01(reveal) * exitFade * engulf;
          return p.kind === 'air'
            ? <AirBubble key={i} x={px} y={py} r={p.r} opacity={opacity} color={airColor} stroke={stroke} />
            : <CrystalDiamond key={i} x={px} y={py} r={p.r} opacity={opacity} color={mineralColor} stroke={stroke} />;
        })}

        {/* 가운데 뭉친 기포(트랩 모드) - 큰 반투명 원 3개를 겹쳐 "뿌옇다"를 표현(점 무리 금지) */}
        {mode === 'trapped' && cloudOpacity > 0.01 ? (
          <g opacity={cloudOpacity}>
            <circle cx={BOX_CX - 20} cy={BOX_CY - 14} r={cloudR} fill={cloudColor} />
            <circle cx={BOX_CX + 26} cy={BOX_CY + 10} r={cloudR * 0.82} fill={cloudColor} />
            <circle cx={BOX_CX - 4} cy={BOX_CY + 30} r={cloudR * 0.7} fill={cloudColor} />
          </g>
        ) : null}

        {/* 빛줄기 - 위에서 내려와 트랩 모드에선 기포 뭉침에서 사방으로 흩어지고,
         *  방향성 모드에선 거의 그대로 바닥까지 통과한다 */}
        {beamOpacity > 0.01 ? (
          <>
            <LightArrow x1={BOX_CX} y1={beamTopY} x2={BOX_CX} y2={hitY} opacity={beamOpacity} color={lightColor} width={10} />
            {FAN_ANGLES.map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const len = fanLen * smooth(scatterP);
              const ex = BOX_CX + Math.cos(rad) * len;
              const ey = hitY + Math.sin(rad) * len;
              return (
                <LightArrow
                  key={i} x1={BOX_CX} y1={hitY} x2={ex} y2={ey}
                  opacity={beamOpacity * smooth(scatterP)} color={lightColor} width={7}
                />
              );
            })}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default IceCloudinessDiagram;
