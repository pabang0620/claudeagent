/** "빛이 대기를 통과하며 흔들려 반짝여 보인다"는 구조를 보여주는 범용 다이어그램
 *  (별은 유독 반짝이는데 행성은 덜 반짝이는 이유). StarlightDiagram·LightScatterDiagram과
 *  같은 설계(독립 레이어, undefined면 안 그린다) - 단 광원(별/행성)의 "형태"(pointProgress·
 *  diskProgress)와 "빛줄기가 대기를 지나며 겪는 일"(beamProgress·jitterProgress·
 *  diskAverageProgress)을 분리했다.
 *
 *  1. pointProgress - 광원이 큰 별 모양에서 작은 점 하나로 좁혀진다(별은 너무 멀어서 점
 *     하나로 보인다는 전제, s3).
 *  2. beamProgress  - 광원에서 관측자(눈)까지 곧은 빛줄기가 대기층 3겹(굵은 물결선, 잔물결
 *     아님 - 채널 원칙)을 지나 내려오는 리빌(s4).
 *  3. jitterProgress - 그 빛줄기가 각 대기층 경계에서 살짝씩 꺾이는 지그재그 경로 리빌
 *     (beamProgress=1 전제, s5).
 *  4. twinkleT      - 점이 실제로 반짝이는 것처럼 밝기·크기가 계속 진동하는 누적 시간값
 *     (mod 처리, GutTubeDiagram.flowT와 같은 관례). pointProgress=1과 함께 쓴다(s6).
 *  5. diskProgress  - 광원을 점에서 작은 원반(행성)으로 확장한다. 점과 원반의 크기 차이를
 *     분명히 보여주려고 원반이 다 그려지면 옅은 점선 원(예전 점 크기)을 함께 남긴다(s7).
 *  6. diskAverageProgress - 원반 가장자리 여러 지점(4곳)에서 각각 독립적으로 흔들리는
 *     광선이 나오다가, 진행도가 올라갈수록 그 광선들은 옅어지고 가운데 굵고 안정된 빛줄기
 *     하나로 수렴한다("여러 지점의 흔들림이 서로 상쇄된다", diskProgress=1 전제, s8).
 *
 *  "매질을 통과하며 신호가 흔들리는" 구조를 갖는 다른 소재(신기루, 아지랑이 등) 전반
 *  재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW_THIN } from '../theme';

export interface TwinkleDiagramProps {
  width: number;
  x: number;
  y: number;

  pointProgress?: number;
  diskProgress?: number;
  twinkleT?: number;

  beamProgress?: number;
  jitterProgress?: number;
  diskAverageProgress?: number;

  stroke?: string;
  sourceColor?: string;
  bandColors?: [string, string, string];
  style?: React.CSSProperties;
}

export const TWINKLE_VB_W = 700;
export const TWINKLE_VB_H = 820;

const SOURCE_PT = { x: 350, y: 108 };
const EYE_PT = { x: 350, y: 726 };
const BAND_YS = [286, 428, 570];

const DOT_R = 11;
const STAR_OUTER_R = 62;
const STAR_INNER_R = 26;
const DISK_R = 46;
const SW_HAIR_LOCAL = 6;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

/** 5각 별 path (중심 기준 상대 좌표, StarlightDiagram과 동일 절차) */
function starPath(outerR: number, innerR: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${r * Math.cos(a)} ${r * Math.sin(a)}`);
  }
  return `M ${pts[0]} ` + pts.slice(1).map((p) => `L ${p}`).join(' ') + ' Z';
}

/** 굵은 물결선 하나(잔물결 아님) - x 12구간을 사인파로 이어 그린다 */
function wavyLineD(cy: number, amp: number, phase: number) {
  const n = 12;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const px = (TWINKLE_VB_W / n) * i;
    const py = cy + Math.sin((i / n) * Math.PI * 2.4 + phase) * amp;
    pts.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
  }
  return pts.join(' ');
}

/** 시작점 -> 대기층 3겹 경계를 지그재그로 꺾으며 -> 끝점(눈)까지 가는 경로.
 *  kinks는 각 대기층 경계에서의 x 편차(고정 상수, Math.random 미사용) */
function jitterPathD(startX: number, startY: number, endX: number, endY: number, kinks: [number, number, number]) {
  const ys = BAND_YS;
  const xs = ys.map((by, i) => {
    const t = (by - startY) / (endY - startY);
    return lerp(startX, endX, t) + kinks[i];
  });
  return (
    `M ${startX} ${startY} ` +
    `L ${xs[0]} ${ys[0]} L ${xs[1]} ${ys[1]} L ${xs[2]} ${ys[2]} ` +
    `L ${endX} ${endY}`
  );
}

const RAY_ANGLES_DEG = [-42, -14, 14, 42];
const RAY_KINKS: [number, number, number][] = [
  [16, -20, 24],
  [-22, 18, -12],
  [20, -16, 22],
  [-18, 24, -20],
];

function EyeIcon({ opacity }: { opacity: number }) {
  return (
    <g opacity={opacity}>
      <path
        d={`M ${EYE_PT.x - 58} ${EYE_PT.y} Q ${EYE_PT.x} ${EYE_PT.y - 40} ${EYE_PT.x + 58} ${EYE_PT.y} Q ${EYE_PT.x} ${EYE_PT.y + 40} ${EYE_PT.x - 58} ${EYE_PT.y} Z`}
        fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN}
      />
      <circle cx={EYE_PT.x} cy={EYE_PT.y} r={16} fill={C.ink} />
    </g>
  );
}

export const TwinkleDiagram: React.FC<TwinkleDiagramProps> = ({
  width, x, y,
  pointProgress, diskProgress, twinkleT,
  beamProgress, jitterProgress, diskAverageProgress,
  stroke = C.ink, sourceColor = C.gold, bandColors = [C.sky, C.water, C.hillFar],
  style,
}) => {
  const scale = width / TWINKLE_VB_W;
  const height = TWINKLE_VB_H * scale;

  const showBands = beamProgress !== undefined || jitterProgress !== undefined || diskAverageProgress !== undefined;
  const showEye = showBands;

  const pp = pointProgress === undefined ? undefined : clamp01(pointProgress);
  const dp = diskProgress === undefined ? undefined : clamp01(diskProgress);
  const bp = beamProgress === undefined ? 0 : clamp01(beamProgress);
  const jp = jitterProgress === undefined ? 0 : clamp01(jitterProgress);
  const dap = diskAverageProgress === undefined ? 0 : clamp01(diskAverageProgress);

  // 광원 형태: 별(pointProgress) -> 점 -> 원반(diskProgress). 두 progress는 서로 다른
  // 시점(s3 vs s7)에 쓰이므로 겹쳐 쓰지 않는 게 정상이지만, 겹치더라도 diskProgress가
  // 최종 형태를 덮어써 자연스럽게 이어지도록 한다.
  const starShrink = pp === undefined ? 0 : smooth(pp);
  const starOuterR = lerp(STAR_OUTER_R, DOT_R, starShrink);
  const starInnerR = lerp(STAR_INNER_R, DOT_R * 0.5, starShrink);
  const starOpacity = pp === undefined ? 0 : 1 - starShrink * 0.94; // 완전히 사라지지 않고 점으로 남음

  const diskGrow = dp === undefined ? 0 : smooth(dp);
  const sourceR = dp === undefined ? DOT_R : lerp(DOT_R, DISK_R, diskGrow);

  // 트윙클: 여러 주기의 사인을 더해 불규칙해 보이는 반짝임을 만든다(결정적, Math.random 없음)
  const twinkleK = twinkleT === undefined ? 0 : (
    0.5 +
    0.28 * Math.sin(twinkleT / 5.2) +
    0.16 * Math.sin(twinkleT / 2.3 + 1.1) +
    0.12 * Math.sin(twinkleT / 1.1 + 2.4)
  );
  const twinkleScale = twinkleT === undefined ? 1 : lerp(0.72, 1.28, clamp01(twinkleK));
  const twinkleOpacity = twinkleT === undefined ? 1 : lerp(0.45, 1, clamp01(twinkleK));

  const jitterKinks: [number, number, number] = [24, -30, 18];

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${TWINKLE_VB_W} ${TWINKLE_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* ---- 대기층(굵은 물결선 3겹, 잔물결 아님) ---- */}
      {showBands && BAND_YS.map((by, i) => (
        <path
          key={i} d={wavyLineD(by, 22, i * 1.7)} fill="none"
          stroke={bandColors[i]} strokeWidth={38} strokeLinecap="round" strokeLinejoin="round"
          opacity={0.65}
        />
      ))}

      {/* ---- 곧은 빛줄기(beamProgress) ---- */}
      {bp > 0.001 && (
        <line
          x1={SOURCE_PT.x} y1={SOURCE_PT.y} x2={EYE_PT.x} y2={EYE_PT.y}
          stroke={sourceColor} strokeWidth={SW_THIN} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - bp}
          opacity={jp > 0.02 ? 1 - jp : 1}
        />
      )}

      {/* ---- 꺾이는 빛줄기(jitterProgress, 대기층 경계마다 살짝씩 꺾임) ---- */}
      {jp > 0.001 && (
        <path
          d={jitterPathD(SOURCE_PT.x, SOURCE_PT.y, EYE_PT.x, EYE_PT.y, jitterKinks)}
          fill="none" stroke={sourceColor} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - jp}
        />
      )}

      {/* ---- 원반(행성) 여러 지점 광선 -> 평균화 수렴(diskAverageProgress) ---- */}
      {dap > 0.001 && (() => {
        const reveal = clamp01(dap / 0.35);
        const fadeOut = 1 - clamp01((dap - 0.5) / 0.5);
        const mergedT = clamp01((dap - 0.35) / 0.65);
        return (
          <>
            {RAY_ANGLES_DEG.map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const rimX = SOURCE_PT.x + Math.sin(rad) * DISK_R * 0.72;
              const rimY = SOURCE_PT.y + (1 - Math.cos(rad)) * DISK_R * 0.3;
              return (
                <path
                  key={i}
                  d={jitterPathD(rimX, rimY, EYE_PT.x, EYE_PT.y, RAY_KINKS[i])}
                  fill="none" stroke={sourceColor} strokeWidth={SW_HAIR_LOCAL} strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - reveal}
                  opacity={0.8 * fadeOut}
                />
              );
            })}
            {mergedT > 0.001 && (
              <line
                x1={SOURCE_PT.x} y1={SOURCE_PT.y} x2={EYE_PT.x} y2={EYE_PT.y}
                stroke={stroke} strokeLinecap="round"
                strokeWidth={lerp(SW_THIN, 30, mergedT)} opacity={mergedT}
              />
            )}
          </>
        );
      })()}

      {showEye && <EyeIcon opacity={Math.max(bp, jp, dap) > 0.02 ? 1 : 0} />}

      {/* ---- 광원(별/점/원반) ---- */}
      <g
        transform={`translate(${SOURCE_PT.x} ${SOURCE_PT.y}) scale(${twinkleScale})`}
        opacity={twinkleOpacity}
      >
        {pp !== undefined && dp === undefined && (
          <path d={starPath(starOuterR, starInnerR)} fill={sourceColor} stroke={stroke} strokeWidth={SW_HAIR_LOCAL} opacity={starOpacity} />
        )}
        {(pp !== undefined || dp !== undefined) && (
          <circle r={dp !== undefined ? sourceR : DOT_R} fill={sourceColor} stroke={stroke} strokeWidth={SW_HAIR_LOCAL} />
        )}
        {/* 점 크기와 원반 크기를 직접 대비시키는 참조 점. 원반 "안"에 점선 링으로 겹쳐 그리면
         *  원반 채움색에 가려 사실상 안 보인다(실측 확인) - 그래서 옆으로 띄워 별개의 원으로
         *  나란히 둔다. dp가 어느 정도 자란 뒤에만 페이드인한다. */}
        {dp !== undefined && dp > 0.15 && (
          <circle
            cx={-(DISK_R + DOT_R + 40)} cy={0} r={DOT_R} fill={sourceColor} stroke={stroke}
            strokeWidth={SW_HAIR_LOCAL} opacity={clamp01((dp - 0.15) / 0.3)}
          />
        )}
      </g>
    </svg>
  );
};


export default TwinkleDiagram;
