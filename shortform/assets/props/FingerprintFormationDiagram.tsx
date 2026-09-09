/** 손끝 피부 단면(표피/진피 경계) + 완성된 지문 무늬 아이콘. "지문은 왜 사람마다 다른가"
 *  (general-ep65)를 위해 신설했다. REGISTRY 확인 완료 - `props/Hand.tsx`의
 *  FingerCrossSection(혈관 좁아짐)과 `props/FingertipNerveDiagram.tsx`(신경 다발)는 둘 다
 *  손가락 단면·클로즈업을 다루지만 "두 피부층이 다른 속도로 자라며 경계가 굴곡진 패턴으로
 *  자리 잡는다"는 발생 과정도, "완성된 지문 무늬 자체"도 다루지 않아 새로 만들었다.
 *
 *  두 부분으로 구성:
 *   - FingerprintFormationDiagram: 손끝 피부를 옆에서 자른 사각 슬랩(둥근 모서리 블록)으로
 *     단순화하고, 표피(위, 얇은 밴드)와 진피(아래, 두꺼운 밴드)의 경계선을 `growProgress`
 *     (0~1)로 평평한 직선 -> 물결치는 곡선으로 보간한다. 촘촘한 융선을 그리지 않는다
 *     (오케스트레이터 지시, "신체 표현은 최소한으로") - 굵은 경계 곡선 하나(레이어 채움)만
 *     으로 표현한다.
 *   - FingerprintSwirl: 완성된 지문 무늬 아이콘. 실제 지문처럼 촘촘한 융선을 그리지 않고
 *     동심 루프 4~5겹(큰 곡선)으로 단순화했다(오케스트레이터 지시). `variantSeed`(정수,
 *     SnowflakeDiagram의 variant처럼 결정적으로 각 루프 점을 살짝 흔드는 값, Math.random
 *     미사용 - 원칙 3)로 "비슷하지만 다른" 지문 여러 개를 만들 수 있다(쌍둥이 비교 등).
 *
 *  "성장 속도 차이로 표면 패턴이 자리 잡는" 구조를 갖는 다른 소재(주름, 나이테 등)에도
 *  재사용 가능성이 있어 에피소드 로컬이 아니라 라이브러리에 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ============================================================
 * FingerprintFormationDiagram: 피부 단면(표피/진피 경계가 자라며 굴곡짐)
 * ============================================================ */

export const FP_FORM_VB_W = 420;
export const FP_FORM_VB_H = 320;
/** 표피 라벨 앵커 (viewBox 좌표) - 호출부가 화면 좌표로 환산해 Label 을 얹는다 */
export const FP_FORM_EPI_PT = { x: 210, y: 62 };
/** 진피 라벨 앵커 */
export const FP_FORM_DERMIS_PT = { x: 210, y: 236 };

const BLOCK_X = 20;
const BLOCK_Y = 20;
const BLOCK_W = 380;
const BLOCK_H = 280;
const BOUNDARY_BASE_Y = 130;
/** 경계 물결의 고정 위상(6개 지점, 좌우 끝은 항상 기준선에서 시작/끝나 블록 가장자리와
 *  자연스럽게 맞물린다). 값은 진폭 배율이며 growProgress*amp 로 실제 y 오프셋을 만든다. */
const WAVE_T = [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1];
const WAVE_DIR = [0, -1, 0.65, -1.05, 0.6, -0.8, 0];
const MAX_AMP = 34;

function wavePoints(amp: number): Array<[number, number]> {
  return WAVE_T.map((t, i) => [BLOCK_X + BLOCK_W * t, BOUNDARY_BASE_Y + WAVE_DIR[i] * amp]);
}

/** 인접한 두 점 사이를 부드러운 S자 곡선(수평 제어점)으로 잇는 큐빅 경로 조각 하나 */
function smoothSeg(x0: number, y0: number, x1: number, y1: number): string {
  const dx = (x1 - x0) / 2;
  return `C ${x0 + dx} ${y0} ${x1 - dx} ${y1} ${x1} ${y1}`;
}

/** 경계선 자체(왼쪽->오른쪽) - 스트로크용 */
function boundaryStrokePath(amp: number): string {
  const pts = wavePoints(amp);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += ` ${smoothSeg(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])}`;
  return d;
}

/** 표피 채움 영역(블록 상단 + 경계선으로 닫은 폐곡선) */
function epidermisFillPath(amp: number): string {
  const pts = wavePoints(amp);
  const right = pts[pts.length - 1];
  let d = `M ${BLOCK_X} ${BLOCK_Y} L ${BLOCK_X + BLOCK_W} ${BLOCK_Y} L ${right[0]} ${right[1]} `;
  for (let i = pts.length - 1; i > 0; i--) {
    d += `${smoothSeg(pts[i][0], pts[i][1], pts[i - 1][0], pts[i - 1][1])} `;
  }
  d += 'Z';
  return d;
}

export interface FingerprintFormationDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0 = 평평한 직선 경계, 1 = 물결치는 굴곡 패턴으로 자리 잡음 */
  growProgress?: number;
  stroke?: string;
  fill?: string;
  epidermisColor?: string;
  dermisColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FingerprintFormationDiagram: React.FC<FingerprintFormationDiagramProps> = ({
  width, x = 0, y = 0, growProgress = 0, stroke = C.ink, fill,
  epidermisColor = C.coralSoft, dermisColor = C.coral, strokeWidth = SW, style,
}) => {
  const g = clamp01(growProgress);
  const amp = g * MAX_AMP;
  const clipId = React.useId();
  return (
    <svg
      viewBox={`0 0 ${FP_FORM_VB_W} ${FP_FORM_VB_H}`}
      width={width} height={(width * FP_FORM_VB_H) / FP_FORM_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={BLOCK_H} rx={44} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={BLOCK_H} fill={fill ?? dermisColor} />
        <path d={epidermisFillPath(amp)} fill={epidermisColor} />
        <path
          d={boundaryStrokePath(amp)} fill="none" stroke={stroke}
          strokeWidth={strokeWidth * 0.55} opacity={0.55} strokeLinecap="round"
        />
      </g>
      <rect
        x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={BLOCK_H} rx={44}
        fill="none" stroke={stroke} strokeWidth={strokeWidth}
      />
    </svg>
  );
};

/* ============================================================
 * FingerprintSwirl: 완성된 지문 무늬 (동심 루프 4~5겹, variantSeed 로 미세 변주)
 * ============================================================ */

export const FP_SWIRL_VB = 300;

const LOOP_COUNT = 5;
const LOOP_RADII = [30, 52, 74, 96, 118];
const LOOP_POINTS = 8;

/** frame·인덱스 없이 seed·i 만으로 계산되는 결정적 흔들림(0~1). Math.random 미사용(원칙 3) */
function seededWobble(seed: number, li: number, i: number): number {
  const v = Math.sin(seed * 12.9898 + li * 7.233 + i * 3.71) * 43758.5453;
  return v - Math.floor(v);
}

function loopPath(cx: number, cy: number, r: number, seed: number, li: number): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < LOOP_POINTS; i++) {
    const angle = (i / LOOP_POINTS) * Math.PI * 2;
    const jitter = (seededWobble(seed, li, i) - 0.5) * r * 0.13;
    const rr = r + jitter;
    pts.push([cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr * 0.86]);
  }
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const dx = (x1 - x0) / 2;
    const dy = (y1 - y0) / 2;
    d += ` C ${(x0 + dx).toFixed(2)} ${(y0 + dy).toFixed(2)} ${(x1 - dx).toFixed(2)} ${(y1 - dy).toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return `${d} Z`;
}

export interface FingerprintSwirlProps {
  width: number;
  x?: number;
  y?: number;
  /** 결정적 무늬 변주 (정수, 기본 0). 값이 다르면 루프 흔들림 위상이 달라져 "비슷하지만
   *  다른" 지문이 된다 */
  variantSeed?: number;
  /** 0 = 안 보임, 1 = 완전히 등장. 단일 progress 로 전체 등장을 스케일+불투명도 보간한다 */
  drawProgress?: number;
  stroke?: string;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FingerprintSwirl: React.FC<FingerprintSwirlProps> = ({
  width, x = 0, y = 0, variantSeed = 0, drawProgress = 1, stroke,
  color = C.ink, strokeWidth = SW_THIN, style,
}) => {
  const p = clamp01(drawProgress);
  if (p <= 0.001) return null;
  const cx = FP_SWIRL_VB / 2;
  const cy = FP_SWIRL_VB / 2;
  const c = stroke ?? color;
  return (
    <svg
      viewBox={`0 0 ${FP_SWIRL_VB} ${FP_SWIRL_VB}`}
      width={width} height={width}
      style={{
        position: 'absolute', left: x, top: y, overflow: 'visible',
        opacity: p, transform: `scale(${0.82 + 0.18 * p})`, transformOrigin: 'center center',
        ...style,
      }}
      shapeRendering="geometricPrecision"
    >
      <circle cx={cx} cy={cy} r={10} fill={c} />
      {LOOP_RADII.map((r, li) => (
        <path
          key={li}
          d={loopPath(cx, cy, r, variantSeed, li)}
          fill="none" stroke={c} strokeWidth={strokeWidth} strokeLinejoin="round"
          opacity={0.9 - li * 0.06}
        />
      ))}
    </svg>
  );
};

export default FingerprintFormationDiagram;
