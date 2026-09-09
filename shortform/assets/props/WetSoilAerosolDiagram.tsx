/** "액체가 다공성 표면에 부딪히는 순간, 안에 갇혀 있던 것이 공기 중으로 방출된다"는 구조를
 *  보여주는 흙 단면 다이어그램(비 온 뒤 흙냄새/지오스민 방출, general-ep26). CellMergeDiagram·
 *  HiccupDiagram과 같은 원칙(이 순간의 상태만 그림, 시간 곡선은 대부분 호출 씬이 만든다) -
 *  단, `splashProgress`만은 "빗방울 낙하 -> 충돌 -> 공기 방울 팽창 -> 파열 -> 입자 방출"이라는
 *  하나의 짧은 연쇄 동작이라 DoorFrame의 `crossProgress`/StaticChargeDiagram의
 *  `dischargeProgress`처럼 단일 progress가 내부적으로 여러 하위 단계를 스스로 나눈다.
 *
 *  "신체 표현은 최소한으로" 절과 동일한 정신으로, 미생물은 촘촘한 점 무리가 아니라 크고
 *  단순한 도형 2개(귀여운 몸통 + 눈 2개)로만, 냄새 분자(지오스민)도 소수(최대 3개)의 큼직한
 *  별 모양 입자로만 그린다 - 흙 알갱이 텍스처조차 작은 점을 여러 개 흩뿌리지 않고 큰 얼룩
 *  4개로만 표현했다.
 *
 *   - microbeProgress : 0~1. 미생물 2마리가 팝인하고(0~0.45), 그중 하나 옆에서 냄새 분자
 *     하나가 태어나듯 팝인한다(0.45~1). 미생물이 냄새 물질을 만든다는 s3/s4용.
 *   - trappedProgress : 0~1. 흙 알갱이 틈새 3곳에 냄새 분자가 이미 자리 잡은 정적 상태가
 *     순서대로 나타난다(등장 후 은은한 발광 유지, 움직이지 않음). s5용.
 *   - splashProgress   : 0~1. 빗방울이 위에서 떨어져(0~0.3) 표면에 부딪히고(~0.3~0.42),
 *     표면 바로 아래 공기 방울이 부풀었다가(~0.3~0.5) 파열하며(~0.5~0.62), trappedProgress
 *     로 이미 자리 잡아 있던 3개의 분자가 그 자리에서부터 위로 튀어 올라 화면 위쪽으로
 *     빠져나가며 옅어진다(~0.55~1, 인덱스별로 살짝 시차). 이 레이어는 trappedProgress=1인
 *     상태를 시작점으로 가정하므로 호출 씬은 trappedProgress를 별도로 0으로 낮출 필요 없다
 *     (CaffeineReceptorDiagram의 releaseProgress와 동일 설계).
 *  전부 undefined/0이면 "빈 흙 단면"만 보이는 정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const WETSOIL_VB_W = 700;
export const WETSOIL_VB_H = 760;

/** 흙 표면(공기/흙 경계) y */
const SURFACE_Y = 300;

/** 미생물 위치(2마리, 크고 단순하게) */
const MICROBE_A = { x: 230, y: 470, r: 52 };
const MICROBE_B = { x: 480, y: 590, r: 46 };

/** 미생물이 만들어내는 "첫 분자"가 태어나는 자리 (s3/s4 용) */
const BORN_MOLECULE_PT = { x: 310, y: 410 };
/** s4 "지오스민" 라벨 앵커 - 태어난 분자 바로 위, 흙 블록 안이지만 표면과 가까워 여백이 있다 */
export const WETSOIL_MOLECULE_LABEL_PT = { x: 320, y: 350 };

/** 흙 속에 갇힌 분자 3곳(트랩 상태) - splashProgress 가 이 자리에서부터 튀어오른다 */
const TRAPPED_PTS = [
  { x: 190, y: 610 },
  { x: 430, y: 470 },
  { x: 560, y: 660 },
];

/** 빗방울이 떨어지는 x (표면 충돌 지점) */
const DEFAULT_RAIN_X = 360;

const bump = (v: number, start: number, end: number) => {
  const p = clamp01((v - start) / Math.max(0.0001, end - start));
  return 4 * p * (1 - p);
};

/** 별 모양(냄새 분자) 경로 - 점 무리 대신 큼직한 도형 하나로 "물질"을 표시한다 */
function moleculeStar(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  const spikes = 4;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const ang = (Math.PI / spikes) * i - Math.PI / 2;
    pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function Microbe({
  x, y, r, appear, stroke, fill,
}: { x: number; y: number; r: number; appear: number; stroke: string; fill: string }) {
  if (appear <= 0.001) return null;
  const s = 0.5 + 0.5 * appear;
  return (
    <g style={{ opacity: appear }} transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={r} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={-r * 0.32} cy={-r * 0.08} r={r * 0.1} fill={stroke} />
      <circle cx={r * 0.32} cy={-r * 0.08} r={r * 0.1} fill={stroke} />
      <path
        d={`M ${-r * 0.28} ${r * 0.32} Q 0 ${r * 0.5} ${r * 0.28} ${r * 0.32}`}
        fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.7} strokeLinecap="round"
      />
    </g>
  );
}

function Molecule({
  x, y, r, appear, glow, color, stroke,
}: { x: number; y: number; r: number; appear: number; glow?: number; color: string; stroke: string }) {
  if (appear <= 0.001) return null;
  const s = 0.4 + 0.6 * appear;
  return (
    <g style={{ opacity: appear }} transform={`translate(${x} ${y}) scale(${s})`}>
      {glow && glow > 0.01 ? <circle cx={0} cy={0} r={r * 2.1} fill={color} opacity={glow * 0.28} /> : null}
      <path d={moleculeStar(0, 0, r)} fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.8} strokeLinejoin="round" />
    </g>
  );
}

export interface WetSoilAerosolDiagramProps {
  /** 화면상 폭(px). viewBox(700x760) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 미생물 2마리 팝인 + 분자 하나 탄생 */
  microbeProgress?: number;
  /** 0~1. 분자 3개가 흙 틈에 이미 갇혀 있는 정적 상태 */
  trappedProgress?: number;
  /** 0~1. 빗방울 낙하 -> 충돌 -> 공기방울 파열 -> 분자 방출 (trappedProgress=1을 전제) */
  splashProgress?: number;
  /** 빗방울이 떨어지는 x 좌표 (viewBox 기준) */
  raindropX?: number;
  stroke?: string;
  fill?: string;
  soilColor?: string;
  microbeColor?: string;
  moleculeColor?: string;
  style?: React.CSSProperties;
}

export const WetSoilAerosolDiagram: React.FC<WetSoilAerosolDiagramProps> = ({
  width, x = 0, y = 0, microbeProgress = 0, trappedProgress = 0, splashProgress,
  raindropX = DEFAULT_RAIN_X,
  stroke = C.ink, fill = C.paper, soilColor = C.browningSoft,
  microbeColor = C.leaf, moleculeColor = C.gold, style,
}) => {
  const height = (width * WETSOIL_VB_H) / WETSOIL_VB_W;
  const microbeP = clamp01(microbeProgress);
  const trappedP = clamp01(trappedProgress);
  const splashP = splashProgress === undefined ? undefined : clamp01(splashProgress);

  const microbesAppear = clamp01(microbeP / 0.45);
  const bornMoleculeAppear = clamp01((microbeP - 0.45) / 0.55);

  // splash 하위 단계
  const dropFallP = splashP === undefined ? 0 : clamp01(splashP / 0.3);
  const dropVisible = splashP !== undefined && splashP < 0.34;
  const impactFlash = splashP === undefined ? 0 : bump(splashP, 0.28, 0.44);
  const bubbleGrow = splashP === undefined ? 0 : clamp01((splashP - 0.28) / (0.5 - 0.28));
  const bubbleFade = splashP === undefined ? 1 : (splashP > 0.48 ? 1 - clamp01((splashP - 0.48) / 0.14) : 1);
  const burstFlash = splashP === undefined ? 0 : bump(splashP, 0.48, 0.66);
  const releaseP = splashP === undefined ? 0 : clamp01((splashP - 0.55) / 0.45);

  const dropY = -30 + (SURFACE_Y + 20 - -30) * dropFallP;
  const bubbleR = 12 + 46 * bubbleGrow;
  const bubbleCx = raindropX - 16;
  const bubbleCy = SURFACE_Y + 44;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${WETSOIL_VB_W} ${WETSOIL_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
      >
        {/* 흙 블록 */}
        <rect
          x={40} y={SURFACE_Y} width={WETSOIL_VB_W - 80} height={WETSOIL_VB_H - SURFACE_Y - 20}
          rx={34} ry={34} fill={soilColor} stroke={stroke} strokeWidth={SW}
        />
        {/* 흙 알갱이 텍스처 - 작은 점을 여러 개 찍지 않고 큰 얼룩 4개로만 */}
        <ellipse cx={190} cy={420} rx={92} ry={58} fill={C.browning} opacity={0.22} />
        <ellipse cx={480} cy={380} rx={108} ry={68} fill={C.browning} opacity={0.2} />
        <ellipse cx={300} cy={600} rx={128} ry={78} fill={C.browning} opacity={0.18} />
        <ellipse cx={540} cy={660} rx={100} ry={66} fill={C.browning} opacity={0.2} />
        {/* 표면선 */}
        <line x1={20} y1={SURFACE_Y} x2={WETSOIL_VB_W - 20} y2={SURFACE_Y} stroke={stroke} strokeWidth={SW_THIN} />

        {/* 미생물 2마리 */}
        <Microbe x={MICROBE_A.x} y={MICROBE_A.y} r={MICROBE_A.r} appear={microbesAppear} stroke={stroke} fill={microbeColor} />
        <Microbe x={MICROBE_B.x} y={MICROBE_B.y} r={MICROBE_B.r} appear={microbesAppear} stroke={stroke} fill={microbeColor} />

        {/* 미생물이 만든 첫 분자 (s3/s4) */}
        <Molecule
          x={BORN_MOLECULE_PT.x} y={BORN_MOLECULE_PT.y} r={26} appear={bornMoleculeAppear}
          glow={bornMoleculeAppear} color={moleculeColor} stroke={stroke}
        />

        {/* 흙 틈에 갇힌 분자 3개 (s5, splash 의 출발점) */}
        {TRAPPED_PTS.map((pt, i) => {
          const seg = 1 / TRAPPED_PTS.length;
          const localAppear = clamp01((trappedP - i * seg * 0.5) / (1 - i * seg * 0.5));
          if (splashP !== undefined) {
            // splash 단계에서는 이 정적 렌더 대신 아래 release 애니메이션이 담당한다
            const localRelease = clamp01((releaseP - i * 0.13) / (1 - i * 0.13));
            if (localRelease > 0.001) return null;
          }
          return (
            <Molecule
              key={i} x={pt.x} y={pt.y} r={22} appear={localAppear} glow={localAppear * 0.6}
              color={moleculeColor} stroke={stroke}
            />
          );
        })}

        {/* 방출되는 분자 (splash 전용) */}
        {splashP !== undefined ? TRAPPED_PTS.map((pt, i) => {
          const localRelease = clamp01((releaseP - i * 0.13) / (1 - i * 0.13));
          if (localRelease <= 0.001) return null;
          const riseY = pt.y - (pt.y - -60) * localRelease;
          const driftX = pt.x + (raindropX - pt.x) * 0.25 * localRelease;
          const fadeOut = localRelease > 0.6 ? 1 - clamp01((localRelease - 0.6) / 0.4) : 1;
          return (
            <Molecule
              key={`r${i}`} x={driftX} y={riseY} r={22} appear={fadeOut}
              color={moleculeColor} stroke={stroke}
            />
          );
        }) : null}

        {/* 공기 방울 (표면 바로 아래, 빗방울 충격으로 부풀었다 터짐) */}
        {splashP !== undefined && bubbleGrow > 0.01 && bubbleFade > 0.01 ? (
          <circle
            cx={bubbleCx} cy={bubbleCy} r={bubbleR} fill={fill} stroke={stroke}
            strokeWidth={SW_THIN * 0.8} opacity={0.75 * bubbleFade}
          />
        ) : null}
        {/* 파열 플래시 */}
        {burstFlash > 0.01 ? (
          <circle cx={bubbleCx} cy={bubbleCy} r={30 + 60 * burstFlash} fill={C.gold} opacity={burstFlash * 0.5} />
        ) : null}

        {/* 표면 충돌 임팩트 링 */}
        {impactFlash > 0.01 ? (
          <ellipse
            cx={raindropX} cy={SURFACE_Y} rx={30 + 70 * impactFlash} ry={10 + 16 * impactFlash}
            fill="none" stroke={C.waterCool} strokeWidth={SW_THIN} opacity={impactFlash}
          />
        ) : null}

        {/* 빗방울 */}
        {dropVisible ? (
          <path
            d={`M ${raindropX} ${dropY - 26} C ${raindropX + 20} ${dropY - 6} ${raindropX + 20} ${dropY + 14} ${raindropX} ${dropY + 22} C ${raindropX - 20} ${dropY + 14} ${raindropX - 20} ${dropY - 6} ${raindropX} ${dropY - 26} Z`}
            fill={C.waterCool} stroke={stroke} strokeWidth={SW_THIN * 0.7}
          />
        ) : null}
      </svg>
    </div>
  );
};

export default WetSoilAerosolDiagram;
