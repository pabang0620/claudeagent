/** "관측자가 짧게 이동할 때, 가까운 물체는 보이는 각도가 크게 바뀌고 먼 물체는 거의 안
 *  바뀐다"는 시차(관측 각도 변화) 구조를 보여주는 범용 다이어그램(차 타고 가면 달이 계속
 *  따라오는 것처럼 보이는 이유).
 *
 *  근거리(near)/원거리(far) 두 레이어를 독립 진행도로 받는다(undefined면 그 레이어를 안
 *  그린다, TwinkleDiagram·SneezeReflexDiagram과 같은 설계). 각 레이어는 자체적으로
 *  "관측자가 A -> B 로 짧게 이동 -> 그 동안 목표물을 보는 시선이 얼마나 꺾이는지" 를
 *  완결된 미니 다이어그램으로 그린다:
 *    - 목표물(T)까지 가는 두 선분 - "이동 전" 선(T-A, 옅은 점선 기준선)과 "이동 중" 선
 *      (T-이동 중 위치, 실선 - progress 에 따라 A 에서 B 로 미끄러진다)
 *    - 두 선분이 만나는 T 지점에 각도 호(포물선이 아니라 실제 벡터 각도를 매 프레임 그대로
 *      계산한 값 - progress 가 올라갈수록 자연스럽게 벌어진다)
 *    - 관측자 이동을 보여주는 짧은 화살표(관측자가 "조금만" 움직였다는 것 자체도 같이 보임)
 *  근거리 레이어는 목표물을 가깝고 낮게(단독 표시 기준 moveDist 360px 절반에 대해 목표까지
 *  세로거리 220px) 둬서 이동만으로도 각도가 크게(~73°) 벌어지고, 원거리 레이어는 목표물을
 *  화면 꼭대기 가까이 아주 높게(세로거리 430px) 둬서 같은 종류의 이동에도 각도가 훨씬
 *  작게(~18°) 벌어진다(둘 다 넘겨 좌우로 나란히 그릴 때는 근거리 레이어만 절반 크기로
 *  줄인다 - 원거리는 원래도 폭이 좁아 줄일 필요가 없다, 크기를 줄여도 각도는 그대로다) -
 *  실제 축척(달까지 38만km)을 그대로 그릴 수는 없으니, "굵은 선과 각도로 단순하게
 *  표현한다"(오케스트레이터 지시)는 채널 원칙에 따라 두 각도差가 뚜렷이 대비되게만 잡았다.
 *
 *  둘 다 넘기면(near+far) 화면을 좌우로 나눠 나란히 그린다(대비가 핵심인 s8 - 가까운
 *  논밭 vs 먼 산). 하나만 넘기면 그 레이어를 화면 중앙에 크게 그린다(s3의 근거리 단독,
 *  또는 s6의 "짧은 이동 화살표(근거리 자리 재사용) vs 거의 0인 각도(원거리)" 대비).
 *
 *  distanceProgress 는 완전히 별도 모드다(위 근거리/원거리 각도 레이어와 동시에 쓰지
 *  않는다) - 두 아이콘(기본 지구/달) 사이에 점선 거리선이 좌->우로 자라나고, distanceLabel
 *  (예: "약 38만 km", strings.ts 에서 읽어 호출부가 넘긴다)이 끝에 나타난다(s5, 지구-달
 *  사이의 압도적인 거리 자체를 보여주는 용도라 각도 개념이 필요 없다).
 *
 *  "짧게 이동해도 가까운 것과 먼 것이 다르게 보이는" 구조를 갖는 다른 소재(차창 밖 풍경,
 *  기차 창밖 근경/원경, 비행기 창밖 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라
 *  여기 등록한다(02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

export const PARALLAX_VB_W = 900;
export const PARALLAX_VB_H = 560;

const GROUND_Y = 470;

const smoothstep = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Pt { x: number; y: number }

/** T 를 중심으로, T->A 방향에서 T->P 방향까지 원호를 다각선으로 근사해 그린다.
 *  실제 벡터 각도를 그대로 쓰므로 progress 가 올라갈수록 자연스럽게 벌어진다. */
function AngleArc({
  t, a, p, radius, color, opacity,
}: { t: Pt; a: Pt; p: Pt; radius: number; color: string; opacity: number }) {
  const angA = Math.atan2(a.y - t.y, a.x - t.x);
  const angP = Math.atan2(p.y - t.y, p.x - t.x);
  let delta = angP - angA;
  // 최단 방향으로 스윕한다 (-PI~PI 범위로 정규화)
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  if (Math.abs(delta) < 0.01) return null;
  const steps = 20;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const ang = angA + (delta * i) / steps;
    pts.push(`${(t.x + Math.cos(ang) * radius).toFixed(1)},${(t.y + Math.sin(ang) * radius).toFixed(1)}`);
  }
  return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" opacity={opacity} />;
}

interface PanelSpec {
  cx: number;
  progress: number;
  moveDist: number;
  targetDx: number;
  targetDy: number;
  arcRadius: number;
  icon: string;
  iconSize: number;
  accent: string;
  stroke: string;
  mutedStroke: string;
  fill: string;
  markerId: string;
}

function Panel({
  cx, progress, moveDist, targetDx, targetDy, arcRadius, icon, iconSize, accent,
  stroke, mutedStroke, fill, markerId,
}: PanelSpec) {
  const pr = clamp01(progress);
  if (pr <= 0.001) return null;
  const moveT = smoothstep(pr);
  const a: Pt = { x: cx - moveDist / 2, y: GROUND_Y };
  const b: Pt = { x: cx + moveDist / 2, y: GROUND_Y };
  const p: Pt = { x: lerp(a.x, b.x, moveT), y: GROUND_Y };
  const t: Pt = { x: cx + targetDx, y: GROUND_Y + targetDy };
  const iconOpacity = clamp01(pr / 0.15);
  const moveOpacity = clamp01((pr - 0.04) / 0.2);

  return (
    <g>
      {/* 목표물 */}
      <g opacity={iconOpacity} transform={`translate(${t.x - iconSize / 2} ${t.y - iconSize / 2})`}>
        <ThemedIcon name={icon} size={iconSize} color={stroke} strokePx={11} />
      </g>

      {/* 기준선(이동 전) - 옅은 점선, 처음부터 고정 */}
      <line x1={t.x} y1={t.y} x2={a.x} y2={a.y} stroke={mutedStroke} strokeWidth={SW_THIN} strokeDasharray="12 10" opacity={iconOpacity * 0.8} />
      {/* 이동 중 선 - 실선, 관측자 현재 위치까지 */}
      <line x1={t.x} y1={t.y} x2={p.x} y2={p.y} stroke={accent} strokeWidth={SW_THIN} strokeLinecap="round" opacity={iconOpacity} />

      <AngleArc t={t} a={a} p={p} radius={arcRadius} color={stroke} opacity={iconOpacity} />

      {/* 바닥선 + 관측자 이동 화살표 */}
      <line x1={a.x - 40} y1={GROUND_Y} x2={b.x + 40} y2={GROUND_Y} stroke={mutedStroke} strokeWidth={6} opacity={iconOpacity * 0.6} />
      <circle cx={a.x} cy={GROUND_Y} r={13} fill={fill} stroke={mutedStroke} strokeWidth={5} opacity={moveOpacity * 0.8} />
      <circle cx={p.x} cy={GROUND_Y} r={17} fill={accent} stroke={stroke} strokeWidth={5} opacity={iconOpacity} />
      {moveT > 0.06 ? (
        <line
          x1={a.x} y1={GROUND_Y + 34} x2={lerp(a.x, b.x, moveT)} y2={GROUND_Y + 34}
          stroke={stroke} strokeWidth={7} strokeLinecap="round"
          markerEnd={`url(#${markerId})`} opacity={moveOpacity}
        />
      ) : null}
    </g>
  );
}

let uid = 0;

export interface ParallaxDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 근거리 목표물을 보는 각도가 짧은 이동만으로 크게 바뀌는 레이어. 0~1 */
  nearAngleProgress?: number;
  /** 원거리 목표물을 보는 각도가 같은 이동에도 거의 안 바뀌는 레이어. 0~1 */
  farAngleProgress?: number;
  nearIcon?: string;
  farIcon?: string;
  /** 두 지점 사이 거리 표시 모드. near/far 각도 레이어와 동시에 쓰지 않는다. 0~1 */
  distanceProgress?: number;
  distanceLabel?: string;
  distanceNearIcon?: string;
  distanceFarIcon?: string;
  /** 선·아이콘·글자 기본색. 어두운 배경(NightSkyBg 등) 위에서는 밝은 색(C.cream 등)으로
   *  override한다(원칙 - 캐릭터·소품 윤곽선이 배경과 명확히 구분돼야 함) */
  stroke?: string;
  /** 옅은 기준선·바닥선 색. 어두운 배경에서는 stroke보다 한 톤 낮은 밝은 색을 쓴다 */
  mutedStroke?: string;
  /** 관측자 시작점 등에 쓰는 채움색(기본 배경과 대비되는 값). 밝은 배경은 paper, 어두운
   *  배경은 night 계열을 쓴다 */
  fill?: string;
  style?: React.CSSProperties;
}

export const ParallaxDiagram: React.FC<ParallaxDiagramProps> = ({
  width, x = 0, y = 0, nearAngleProgress, farAngleProgress,
  nearIcon = 'tree', farIcon = 'moon',
  distanceProgress, distanceLabel,
  distanceNearIcon = 'world', distanceFarIcon = 'moon',
  stroke = C.ink, mutedStroke = C.inkSoft, fill = C.paper,
  style,
}) => {
  const scale = width / PARALLAX_VB_W;
  const height = PARALLAX_VB_H * scale;
  const markerId = React.useMemo(() => `parallax-arrow-${uid++}`, []);

  const dp = distanceProgress !== undefined ? clamp01(distanceProgress) : undefined;
  const hasNear = nearAngleProgress !== undefined;
  const hasFar = farAngleProgress !== undefined;
  const both = hasNear && hasFar;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        width={width} height={height}
        viewBox={`0 0 ${PARALLAX_VB_W} ${PARALLAX_VB_H}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker id={markerId} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={stroke} />
          </marker>
        </defs>

        {dp !== undefined ? (
          <g>
            {(() => {
              const leftPt = { x: 150, y: 300 };
              const rightPt = { x: 750, y: 210 };
              const curX = lerp(leftPt.x, rightPt.x, dp);
              const curY = lerp(leftPt.y, rightPt.y, dp);
              const labelOpacity = clamp01((dp - 0.55) / 0.35);
              return (
                <>
                  <line
                    x1={leftPt.x} y1={leftPt.y} x2={curX} y2={curY}
                    stroke={mutedStroke} strokeWidth={8} strokeDasharray="18 14" strokeLinecap="round"
                  />
                  <g transform={`translate(${leftPt.x - 60} ${leftPt.y - 60})`}>
                    <ThemedIcon name={distanceNearIcon} size={120} color={stroke} strokePx={11} />
                  </g>
                  <g transform={`translate(${rightPt.x - 46} ${rightPt.y - 46})`}>
                    <ThemedIcon name={distanceFarIcon} size={92} color={stroke} strokePx={11} />
                  </g>
                  {distanceLabel ? (
                    <foreignObject
                      x={PARALLAX_VB_W / 2 - 220} y={GROUND_Y - 40} width={440} height={80}
                      opacity={labelOpacity}
                    >
                      <div
                        style={{
                          width: '100%', textAlign: 'center', fontFamily: "'NanumSquareRound', sans-serif",
                          fontWeight: 800, fontSize: 44, color: stroke, whiteSpace: 'nowrap',
                        }}
                      >
                        {distanceLabel}
                      </div>
                    </foreignObject>
                  ) : null}
                </>
              );
            })()}
          </g>
        ) : (
          <>
            {hasNear ? (
              <Panel
                cx={both ? 240 : PARALLAX_VB_W / 2}
                progress={nearAngleProgress ?? 0}
                moveDist={both ? 198 : 360} targetDx={both ? 50 : 90} targetDy={both ? -121 : -220}
                arcRadius={both ? 42 : 68}
                icon={nearIcon} iconSize={both ? 92 : 140} accent={C.coral}
                stroke={stroke} mutedStroke={mutedStroke} fill={fill} markerId={markerId}
              />
            ) : null}
            {hasFar ? (
              <Panel
                cx={both ? 660 : PARALLAX_VB_W / 2}
                progress={farAngleProgress ?? 0}
                moveDist={140} targetDx={10} targetDy={-430} arcRadius={40}
                icon={farIcon} iconSize={90} accent={C.gold}
                stroke={stroke} mutedStroke={mutedStroke} fill={fill} markerId={markerId}
              />
            ) : null}
            {both ? (
              <line
                x1={PARALLAX_VB_W / 2} y1={20} x2={PARALLAX_VB_W / 2} y2={GROUND_Y + 40}
                stroke={mutedStroke} strokeWidth={4} strokeDasharray="10 12" opacity={0.35}
              />
            ) : null}
          </>
        )}
      </svg>
    </div>
  );
};

export default ParallaxDiagram;
