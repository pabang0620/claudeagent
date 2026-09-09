/** "고무 표면은 꽉 막혀 보여도 분자들 사이사이에 아주 작은 틈이 있고, 그 틈으로 기체 알갱이가
 *  천천히 빠져나간다"는 기체 투과(permeation) 구조를 보여주는 다이어그램(general-ep72, "안 터진
 *  풍선이 쪼그라드는 이유"). 56화 VocalResonanceDiagram(성대 떨림+공명 오버레이, 소리가 주제)과
 *  67화 OsmosisDiagram(삼투, 세포막을 통한 물 이동)을 먼저 확인했으나 둘 다 "막을 이루는
 *  분자 그물망 사이 틈으로 기체가 빠진다"는 이 화의 구조와 달라(56화는 소리 매질, 67화는
 *  물이 반대 방향인 액체 삼투) 재사용하지 못했고, 새로 만들었다. OsmosisDiagram과 같은 설계
 *  원칙(독립 progress, 이전 단계가 1인 상태를 전제, undefined/0이면 그 레이어를 안 그림)을
 *  따른다. "신체 표현은 최소한으로" 원칙에 따라 틈은 촘촘한 점 무리가 아니라 큼직한 곡선
 *  그물망 몇 가닥 + 링 강조 2개로만, 기체 알갱이는 촘촘한 점이 아니라 큰 원 2~3개로만
 *  표현한다.
 *
 *   - gapVisible              : 0~1. 고무 단면(가운데 띠) 안에 물결 모양 그물망 3가닥과 짧은
 *     연결 가닥이 그려지고, 그 위 특정 두 지점에 "여기 틈이 있다"는 점선 링이 강조된다. s2용.
 *   - leakProgress            : 0~1. gapVisible=1 전제 - 안쪽(띠 아래, 기체가 있는 쪽)에서
 *     그 틈을 통해 바깥쪽(띠 위)으로 기체 알갱이 3개가 시차를 두고 하나씩 빠져나간다. s3용.
 *   - moleculeCompareProgress : 0~1. 독립 레이어(다이어그램 중앙에 위치) - 헬륨 알갱이(작은
 *     원)와 공기 알갱이(큰 원)를 나란히 팝인시켜 크기 차이만 보여준다. s5용.
 *   - materialCompareProgress : 0~1. 독립 레이어 - 왼쪽엔 성긴 그물망(고무, 틈이 큼), 오른쪽엔
 *     촘촘한 그물망(은박, 틈이 훨씬 촘촘)을 나란히 팝인시켜 재질별 촘촘함 차이를 보여준다. s7용.
 *  네 progress 모두 0이면 빈 사각 캔버스만 있는 정지 상태가 된다. 뷰박스(700x700) 안에서
 *  네 레이어 모두 중심을 (350,350) 근처에 맞춰뒀다 - 어느 레이어를 켜든 같은 중앙정렬 배치
 *  계산식을 그대로 쓸 수 있다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const BALLOON_PERM_VB = 700;

const smooth = (v: number) => { const c = clamp01(v); return c * c * (3 - 2 * c); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ============================================================
 * 고무 단면 띠 (가운데 가로 밴드) - 안(아래)과 밖(위)을 가르는 벽
 * ============================================================ */
const BAND = { x: 60, y: 260, w: 580, h: 180 };
const STRAND_YS = [300, 350, 400];
const GAP_PTS = [{ x: 230, y: 350 }, { x: 470, y: 350 }];
const LINKS = [
  { x1: 130, y1: 300, x2: 160, y2: 400 },
  { x1: 330, y1: 300, x2: 300, y2: 400 },
  { x1: 400, y1: 300, x2: 430, y2: 400 },
  { x1: 590, y1: 300, x2: 560, y2: 400 },
];

function wavePath(y: number) {
  return `M 60 ${y} C 150 ${y - 22} 200 ${y + 22} 290 ${y} `
    + `C 380 ${y - 22} 430 ${y + 22} 520 ${y} C 570 ${y - 10} 600 ${y + 10} 640 ${y}`;
}

/* ============================================================
 * 기체 알갱이가 안 -> 틈 -> 밖 으로 이동하는 3개 경로 (시차를 두고 leakProgress 로 재생)
 * ============================================================ */
const LEAK_PATHS = [
  { from: { x: 200, y: 610 }, gap: GAP_PTS[0], to: { x: 165, y: 140 }, offset: 0 },
  { from: { x: 470, y: 615 }, gap: GAP_PTS[1], to: { x: 505, y: 150 }, offset: 0.28 },
  { from: { x: 300, y: 600 }, gap: GAP_PTS[0], to: { x: 335, y: 110 }, offset: 0.56 },
];

function LeakMolecule({
  from, gap, to, offset, leakProgress, color, stroke,
}: {
  from: { x: number; y: number }; gap: { x: number; y: number }; to: { x: number; y: number };
  offset: number; leakProgress: number; color: string; stroke: string;
}) {
  const local = clamp01((leakProgress - offset) / 0.44);
  if (local <= 0.001) return null;
  const rise = local < 0.5 ? local / 0.5 : 1;
  const drift = local > 0.5 ? (local - 0.5) / 0.5 : 0;
  const cx = local < 0.5 ? lerp(from.x, gap.x, smooth(rise)) : lerp(gap.x, to.x, smooth(drift));
  const cy = local < 0.5 ? lerp(from.y, gap.y, smooth(rise)) : lerp(gap.y, to.y, smooth(drift));
  const scale = 0.6 + 0.4 * smooth(clamp01(local * 2.4));
  return (
    <g opacity={clamp01(local * 3)}>
      <circle cx={cx} cy={cy} r={22 * scale} fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.75} />
      <ellipse cx={cx - 6 * scale} cy={cy - 6 * scale} rx={6 * scale} ry={4 * scale} fill="#FFFFFF" opacity={0.55} />
    </g>
  );
}

/* ============================================================ */

export interface BalloonPermeationDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 고무 그물망 + 틈 강조 링 등장 */
  gapVisible?: number;
  /** 0~1. gapVisible=1 전제 - 기체 알갱이 3개가 틈으로 하나씩 빠져나감 */
  leakProgress?: number;
  /** 0~1. 헬륨(작은 원) vs 공기(큰 원) 알갱이 크기 비교 */
  moleculeCompareProgress?: number;
  /** 0~1. 고무(성긴 틈) vs 은박(촘촘한 틈) 그물망 비교 */
  materialCompareProgress?: number;
  stroke?: string;
  meshColor?: string;
  gapRingColor?: string;
  insideColor?: string;
  outsideColor?: string;
  moleculeColor?: string;
  heliumColor?: string;
  airColor?: string;
  style?: React.CSSProperties;
}

export const BalloonPermeationDiagram: React.FC<BalloonPermeationDiagramProps> = ({
  width, x = 0, y = 0,
  gapVisible = 0, leakProgress = 0, moleculeCompareProgress = 0, materialCompareProgress = 0,
  stroke = C.ink, meshColor = C.inkSoft, gapRingColor = C.coral,
  insideColor = C.coralSoft, outsideColor = C.paper,
  moleculeColor = C.gold, heliumColor = C.gold, airColor = C.coral,
  style,
}) => {
  const height = width;
  const meshA = clamp01(gapVisible);
  const leakA = clamp01(leakProgress);
  const molA = clamp01(moleculeCompareProgress);
  const matA = clamp01(materialCompareProgress);

  const meshDrawA = smooth(clamp01(meshA / 0.6));
  const ringA = smooth(clamp01((meshA - 0.4) / 0.6));

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${BALLOON_PERM_VB} ${BALLOON_PERM_VB}`} width={width} height={height} style={{ overflow: 'visible' }}>

        {/* ---- 레이어 1: 고무 단면 + 그물망 + 틈 + 기체 누출 ---- */}
        {meshA > 0.001 ? (
          <g>
            <rect x={40} y={80} width={BALLOON_PERM_VB - 80} height={BAND.y - 100} rx={20} fill={outsideColor} stroke={stroke} strokeWidth={SW_THIN * 0.5} opacity={0.5 * meshDrawA} />
            <rect x={0} y={BAND.y + BAND.h} width={BALLOON_PERM_VB} height={200} rx={20} fill={insideColor} opacity={0.6 * meshDrawA} />
            <rect x={BAND.x} y={BAND.y} width={BAND.w} height={BAND.h} rx={16} fill="none" stroke={stroke} strokeWidth={SW} opacity={meshDrawA} />
            <g opacity={meshDrawA} stroke={meshColor} strokeWidth={SW_THIN * 0.85} fill="none" strokeLinecap="round">
              {STRAND_YS.map((yy, i) => <path key={`strand${i}`} d={wavePath(yy)} />)}
              {LINKS.map((ln, i) => (
                <line key={`link${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} strokeWidth={SW_THIN * 0.6} opacity={0.75} />
              ))}
            </g>
            {ringA > 0.01 ? GAP_PTS.map((g, i) => (
              <circle
                key={`gap${i}`} cx={g.x} cy={g.y} r={30} fill="none" stroke={gapRingColor}
                strokeWidth={SW_THIN * 0.85} strokeDasharray="7 9" opacity={ringA}
                style={{ transformOrigin: `${g.x}px ${g.y}px`, transform: `scale(${0.7 + 0.3 * ringA})` }}
              />
            )) : null}
            {leakA > 0.001 ? LEAK_PATHS.map((p, i) => (
              <LeakMolecule key={`leak${i}`} {...p} leakProgress={leakA} color={moleculeColor} stroke={stroke} />
            )) : null}
          </g>
        ) : null}

        {/* ---- 레이어 2: 헬륨 vs 공기 알갱이 크기 비교 ---- */}
        {molA > 0.001 ? (
          <g>
            {(() => {
              const heA = smooth(clamp01(molA / 0.6));
              const airA = smooth(clamp01((molA - 0.25) / 0.75));
              return (
                <>
                  <g opacity={heA} style={{ transformOrigin: '230px 350px', transform: `scale(${0.5 + 0.5 * heA})` }}>
                    <circle cx={230} cy={350} r={45} fill={heliumColor} stroke={stroke} strokeWidth={SW_THIN} />
                    <ellipse cx={214} cy={334} rx={12} ry={8} fill="#FFFFFF" opacity={0.5} />
                  </g>
                  <g opacity={airA} style={{ transformOrigin: '470px 350px', transform: `scale(${0.5 + 0.5 * airA})` }}>
                    <circle cx={470} cy={350} r={78} fill={airColor} stroke={stroke} strokeWidth={SW_THIN} />
                    <ellipse cx={444} cy={324} rx={18} ry={12} fill="#FFFFFF" opacity={0.5} />
                  </g>
                </>
              );
            })()}
          </g>
        ) : null}

        {/* ---- 레이어 3: 고무 vs 은박 그물망(틈 촘촘함) 비교 ---- */}
        {matA > 0.001 ? (
          <g>
            {(() => {
              const leftA = smooth(clamp01(matA / 0.55));
              const rightA = smooth(clamp01((matA - 0.3) / 0.7));
              const leftBox = { x: 130, y: 210, w: 190, h: 280 };
              const rightBox = { x: 380, y: 210, w: 190, h: 280 };
              const rubberYs = [280, 360, 440];
              const mylarYs = [250, 300, 350, 400, 450];
              return (
                <>
                  <g opacity={leftA}>
                    <rect x={leftBox.x} y={leftBox.y} width={leftBox.w} height={leftBox.h} rx={16} fill={insideColor} stroke={stroke} strokeWidth={SW} />
                    {rubberYs.map((yy, i) => (
                      <path
                        key={`rub${i}`}
                        d={`M ${leftBox.x + 10} ${yy} C ${leftBox.x + 60} ${yy - 26} ${leftBox.x + 130} ${yy + 26} ${leftBox.x + leftBox.w - 10} ${yy}`}
                        fill="none" stroke={meshColor} strokeWidth={SW_THIN * 0.85} strokeLinecap="round"
                      />
                    ))}
                  </g>
                  <g opacity={rightA}>
                    <rect x={rightBox.x} y={rightBox.y} width={rightBox.w} height={rightBox.h} rx={16} fill="#E9EDF2" stroke={stroke} strokeWidth={SW} />
                    {mylarYs.map((yy, i) => (
                      <path
                        key={`myl${i}`}
                        d={`M ${rightBox.x + 8} ${yy} C ${rightBox.x + 50} ${yy - 10} ${rightBox.x + 130} ${yy + 10} ${rightBox.x + rightBox.w - 8} ${yy}`}
                        fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.55} strokeLinecap="round"
                      />
                    ))}
                  </g>
                </>
              );
            })()}
          </g>
        ) : null}

      </svg>
    </div>
  );
};

export default BalloonPermeationDiagram;
