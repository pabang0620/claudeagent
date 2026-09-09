/** "지구 겉을 감싼 두 암석판이 경계에서 계속 밀고 부딪히는데, 마찰 때문에 매끄럽게
 *  미끄러지지 못하고 꽉 붙잡힌 채 오랫동안 힘이 쌓이다가, 그 힘이 마찰의 한계를 넘으면
 *  한순간에 미끄러지며 에너지를 터뜨리고, 그 뒤로도 작은 흔들림(여진)이 잦아들며 이어진다"는
 *  사슬을 보여주는 판 경계 단면 다이어그램(지진이 나는 이유, general-ep90 신설).
 *
 *  REGISTRY 확인 완료 - VolcanoDiagram(화산, ep85)은 마그마 속 기체 압력이 낮아지며 팽창해
 *  터지는 구조라 이 화(판이 서로 밀다가 마찰로 미끄러지는 구조)와 원리가 다르다(오케스트레이터
 *  지시로 재사용 금지, 마그마·분출 이미지를 섞지 않는다). WallVibrationDiagram(벽 너머 소리,
 *  ep89)은 진동이 매질을 넘어 전달되는 구조라 이 화의 "정적 마찰-응력 누적-슬립" 구조와
 *  다르다. PressureBoilingDiagram(ep79)의 게이지 개념(압력↔온도 상관)도 인과 방향이 달라
 *  그대로 가져다 쓸 수 없어 이 다이어그램 안에 별도로 작은 게이지를 새로 그렸다. 위 셋 다
 *  재사용할 수 없어 새로 만든다.
 *
 *  판은 굵은 블록 2개로만 단순화한다(오케스트레이터 지시 - 판구조·지층을 사실적으로 그리지
 *  않는다). 경계의 "맞물려 꽉 붙잡힌" 느낌은 톱니 모양 지그재그 선 하나로만 표현하고(점·잔
 *  요소를 뿌리지 않는다), 힘이 쌓이는 것은 (a) 경계 주변이 옅게 번지는 색 오버레이와
 *  (b) 오른쪽에 세로로 차오르는 단순 게이지 막대 두 가지로만 표현한다 - 전부 채널 원칙(굵고
 *  단순하게, 점 무리 금지)을 따른다.
 *
 *  `plateDriftProgress`(0~1, undefined면 안 그림) - 두 블록 위쪽에 서로를 향한 화살표가
 *  나타나 "늘 아주 천천히 서로 미는 방향으로 움직인다"를 보여준다(s1 개관·s2 확대 공용,
 *  호출 씬이 `width`로 확대율만 바꾼다). `f`를 주면 화살표가 아주 약하게 숨쉬듯 맥동한다.
 *
 *  `stressProgress`(0~1, undefined면 경계를 안 그림) - 내부적으로 0~0.35 구간에서 톱니
 *  경계가 맞물리며 나타나고(s3, "꽉 붙잡힘"), 0.35~1 구간에서 경계 주변 색 오버레이와
 *  오른쪽 게이지가 차오른다(s4, "힘이 쌓임"). 씬은 s3에서 0->0.35, s4에서 0.35->1로
 *  이어서 넘기면 된다(21화 이후 결함 D - 다음 장면에서 이전 상태를 명시적으로 유지).
 *
 *  `slipProgress`(0~1, undefined면 슬립을 안 그림) - 0->1로 오르면 톱니 맞물림과 색
 *  오버레이·게이지가 빠르게 풀리며(에너지 방출) 왼쪽 블록은 위로, 오른쪽 블록은 아래로
 *  절반씩 어긋난다(가위처럼 미끄러지는 단순화된 슬립). 각 블록을 가로지르는 점선 기준선이
 *  슬립량만큼 어긋나 보이는 것으로 "미끄러진 양"을 직접 보여준다. slip이 0.5를 넘으면 경계
 *  지점에서 동심원이 바깥으로 퍼져나간다(s6 슬립 순간~s7 흔들림 전파 공용). `f`를 주면
 *  동심원이 계속 반복해서 퍼진다(s7에서 slipProgress=1을 유지한 채 f로 지속 재생).
 *
 *  `aftershockProgress`(0~1, undefined면 안 그림) - 화면 아래쪽에 진폭이 줄어드는 지진파
 *  파형이 왼쪽부터 오른쪽으로 그려진다(s8, "큰 흔들림 뒤 작은 흔들림이 몇 번 더"). 파형은
 *  고정된 감쇠 펄스 함수로 결정론적으로 계산한다(Math.random 미사용, 원칙 3).
 *
 *  "정적 마찰로 꽉 붙잡힌 채 힘이 쌓이다가 한계를 넘으면 한순간에 풀려나는" 구조를 갖는 다른
 *  소재(고체 마찰·정지마찰 한계 초과 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라
 *  여기 등록한다(general-ep90 02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

/** 세로 캔버스(9:16)를 자연스럽게 채우도록 세로로 긴 비율(700x1000에 가까움)로 잡았다
 *  (WallVibrationDiagram과 같은 판단 - 처음 정사각형에 가까운 860x920으로 만들었다가 스틸
 *  선점검에서 화면 상하 여백이 과다한 것을 발견해 다시 잡았다, 원칙 5). */
export const FAULT_VB_W = 760;
export const FAULT_VB_H = 1000;

const CX = 380;
const GAP = 36;
const BLOCK_W = 270;
const BLOCK_TOP = 150;
const BLOCK_BOTTOM = 860;
const BLOCK_CY = (BLOCK_TOP + BLOCK_BOTTOM) / 2;

const LEFT_X = CX - GAP / 2 - BLOCK_W;
const RIGHT_X = CX + GAP / 2;

const TEETH_N = 9;
const MAX_TEETH_AMP = 24;
const SLIP_OFFSET_MAX = 74;

const GAUGE_X = RIGHT_X + BLOCK_W + 36;
const GAUGE_W = 24;
const GAUGE_TOP = BLOCK_TOP;
const GAUGE_BOTTOM = BLOCK_BOTTOM;
const GAUGE_H = GAUGE_BOTTOM - GAUGE_TOP;

const RING_COUNT = 3;
const RING_PERIOD = 42;
const RING_MAX_R = 250;

const AFTERSHOCK_X0 = 60;
const AFTERSHOCK_X1 = 700;
const AFTERSHOCK_Y = 940;

/** 경계 중앙점(호출 씬이 "단층"·"지진" 라벨·강조 링 앵커로 쓴다) */
export const FAULT_BOUNDARY_PT = { x: CX, y: BLOCK_CY };
/** 게이지 상단점(라벨 앵커) */
export const FAULT_GAUGE_TOP_PT = { x: GAUGE_X + GAUGE_W / 2, y: GAUGE_TOP };

function lerpColor(a: string, b: string, t: number): string {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** 톱니 지그재그 경계선 좌표. amp<0.5 면 그냥 직선(막 맞닿기만 한 상태) */
function teethPoints(amp: number, offsetHalf: number): string {
  if (amp < 0.5) {
    return `${CX},${BLOCK_TOP - offsetHalf} ${CX},${BLOCK_BOTTOM + offsetHalf}`;
  }
  const step = (BLOCK_BOTTOM - BLOCK_TOP) / TEETH_N;
  const pts: string[] = [];
  for (let i = 0; i <= TEETH_N; i++) {
    const y = BLOCK_TOP + step * i;
    const x = CX + (i % 2 === 0 ? -amp : amp);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** 채워진 삼각 화살촉 (NailRootDiagram과 같은 방식, 파일 로컬 - 지역성 우선) */
function arrowHead(tip: { x: number; y: number }, from: { x: number; y: number }, size = 16): string {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const backX = tip.x - ux * size;
  const backY = tip.y - uy * size;
  const half = size * 0.62;
  return `M ${tip.x} ${tip.y} L ${backX + px * half} ${backY + py * half} L ${backX - px * half} ${backY - py * half} Z`;
}

/** 아주 미세한 감쇠 지진파 파형 - 고정 펄스(주요 흔들림 1 + 여진 여러 개) 함수. t: 0~1 */
function seismoOffset(t: number): number {
  const pulses = [
    { c: 0.05, h: 48, w: 0.02 },
    { c: 0.26, h: 24, w: 0.024 },
    { c: 0.44, h: 15, w: 0.022 },
    { c: 0.6, h: 9, w: 0.02 },
    { c: 0.74, h: 6, w: 0.018 },
    { c: 0.86, h: 3.5, w: 0.016 },
  ];
  let y = 0;
  for (const p of pulses) {
    const g = Math.exp(-((t - p.c) ** 2) / (2 * p.w * p.w));
    y += p.h * g * Math.sin(((t - p.c) / p.w) * 9);
  }
  return y;
}

function seismoPath(revealT: number): string {
  const rt = clamp01(revealT);
  if (rt < 0.002) return '';
  const steps = Math.max(2, Math.round(360 * rt));
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (rt * i) / steps;
    const x = AFTERSHOCK_X0 + (AFTERSHOCK_X1 - AFTERSHOCK_X0) * t;
    const y = AFTERSHOCK_Y + seismoOffset(t);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export interface FaultStressDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 두 판이 서로를 향해 아주 천천히 움직이는 화살표. undefined면 안 그림 */
  plateDriftProgress?: number;
  /** 0~1. 경계가 맞물려 꽉 붙잡히고(0~0.35) 힘이 쌓이는(0.35~1) 진행도. undefined면 경계를 안 그림 */
  stressProgress?: number;
  /** 0~1. 순간적으로 미끄러지며 힘이 풀리는 진행도. undefined면 슬립을 안 그림 */
  slipProgress?: number;
  /** 0~1. 화면 아래쪽에 감쇠하는 여진 파형이 좌->우로 그려지는 진행도. undefined면 안 그림 */
  aftershockProgress?: number;
  /** 반복 맥동·동심원 애니메이션용 프레임(선택 - 없으면 정지 상태로 그림, Math.random 미사용) */
  f?: number;
  stroke?: string;
  blockColorL?: string;
  blockColorR?: string;
  stressColor?: string;
  style?: React.CSSProperties;
}

export const FaultStressDiagram: React.FC<FaultStressDiagramProps> = ({
  width, x = 0, y = 0,
  plateDriftProgress, stressProgress, slipProgress, aftershockProgress, f,
  stroke = C.ink, blockColorL = C.hillFar, blockColorR = C.hill, stressColor = C.coral,
  style,
}) => {
  const scale = width / FAULT_VB_W;
  const height = FAULT_VB_H * scale;

  const drift = plateDriftProgress === undefined ? undefined : clamp01(plateDriftProgress);
  const stress = stressProgress === undefined ? undefined : clamp01(stressProgress);
  const slip = clamp01(slipProgress ?? 0);
  const aftershock = aftershockProgress === undefined ? undefined : clamp01(aftershockProgress);

  const lockT = stress === undefined ? 0 : clamp01(stress / 0.35);
  const buildT = stress === undefined ? 0 : clamp01((stress - 0.35) / 0.65);

  const teethAmp = MAX_TEETH_AMP * lockT * (1 - slip);
  const teethColor = lerpColor(stroke, stressColor, buildT * (1 - slip));
  const teethOpacity = lockT > 0.01 ? 0.35 + 0.65 * lockT : 0;

  const blockOffset = SLIP_OFFSET_MAX * slip;
  const glowOpacity = 0.5 * buildT * (1 - slip);
  const gaugeFillT = clamp01(buildT * (1 - slip));

  const pulse = f === undefined ? 1 : 0.7 + 0.3 * Math.sin((f / 34) * Math.PI * 2);
  const ringActive = clamp01((slip - 0.5) / 0.5);

  const showBlocks = drift !== undefined || stress !== undefined || slip > 0.001 || aftershock !== undefined;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${FAULT_VB_W} ${FAULT_VB_H}`} style={{ overflow: 'visible' }}>
        {/* 응력 글로우 - 경계 주변이 옅게 번지며 "힘이 쌓인다"를 색으로 표현 */}
        {glowOpacity > 0.01 ? (
          <rect
            x={CX - 170} y={BLOCK_TOP} width={340} height={BLOCK_BOTTOM - BLOCK_TOP}
            fill={stressColor} opacity={glowOpacity}
          />
        ) : null}

        {showBlocks ? (
          <>
            {/* 왼쪽 판 */}
            <g transform={`translate(0 ${-blockOffset / 2})`}>
              <rect
                x={LEFT_X} y={BLOCK_TOP} width={BLOCK_W} height={BLOCK_BOTTOM - BLOCK_TOP} rx={20}
                fill={blockColorL} stroke={stroke} strokeWidth={SW}
              />
              {lockT > 0.01 ? (
                <line
                  x1={LEFT_X + 24} y1={BLOCK_CY} x2={LEFT_X + BLOCK_W} y2={BLOCK_CY}
                  stroke={stroke} strokeWidth={SW_THIN} strokeDasharray="18 14" opacity={0.5 * lockT}
                />
              ) : null}
            </g>
            {/* 오른쪽 판 */}
            <g transform={`translate(0 ${blockOffset / 2})`}>
              <rect
                x={RIGHT_X} y={BLOCK_TOP} width={BLOCK_W} height={BLOCK_BOTTOM - BLOCK_TOP} rx={20}
                fill={blockColorR} stroke={stroke} strokeWidth={SW}
              />
              {lockT > 0.01 ? (
                <line
                  x1={RIGHT_X} y1={BLOCK_CY} x2={RIGHT_X + BLOCK_W - 24} y2={BLOCK_CY}
                  stroke={stroke} strokeWidth={SW_THIN} strokeDasharray="18 14" opacity={0.5 * lockT}
                />
              ) : null}
            </g>
          </>
        ) : null}

        {/* 톱니 경계 - "맞물려 꽉 붙잡힘" */}
        {teethOpacity > 0.01 ? (
          <polyline
            points={teethPoints(teethAmp, 0)}
            fill="none" stroke={teethColor} strokeWidth={SW * 0.85}
            strokeLinecap="round" strokeLinejoin="round" opacity={teethOpacity}
          />
        ) : null}

        {/* 게이지 - 오른쪽에 힘이 차오르는 단순 세로 막대 */}
        {stress !== undefined ? (
          <>
            <rect
              x={GAUGE_X} y={GAUGE_TOP} width={GAUGE_W} height={GAUGE_H} rx={GAUGE_W / 2}
              fill={C.paper} stroke={stroke} strokeWidth={SW_THIN}
            />
            {gaugeFillT > 0.01 ? (
              <rect
                x={GAUGE_X} y={GAUGE_TOP + GAUGE_H * (1 - gaugeFillT)} width={GAUGE_W}
                height={GAUGE_H * gaugeFillT} rx={GAUGE_W / 2}
                fill={stressColor}
              />
            ) : null}
          </>
        ) : null}

        {/* 이동 화살표 - 두 판이 서로를 향해 아주 천천히 움직인다 */}
        {drift !== undefined && drift > 0.01 ? (
          <g opacity={drift * (0.7 + 0.3 * pulse)}>
            <path
              d={`M ${LEFT_X + 40} ${BLOCK_TOP - 70} L ${CX - 90} ${BLOCK_TOP - 70}`}
              stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round"
            />
            <path d={arrowHead({ x: CX - 60, y: BLOCK_TOP - 70 }, { x: LEFT_X + 40, y: BLOCK_TOP - 70 })} fill={stroke} />
            <path
              d={`M ${RIGHT_X + BLOCK_W - 40} ${BLOCK_TOP - 70} L ${CX + 90} ${BLOCK_TOP - 70}`}
              stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round"
            />
            <path d={arrowHead({ x: CX + 60, y: BLOCK_TOP - 70 }, { x: RIGHT_X + BLOCK_W - 40, y: BLOCK_TOP - 70 })} fill={stroke} />
          </g>
        ) : null}

        {/* 동심원 - 슬립이 절반을 넘으면 경계 지점에서 흔들림이 퍼져나간다 */}
        {ringActive > 0.01 ? (
          Array.from({ length: RING_COUNT }).map((_, i) => {
            const phase = f === undefined
              ? i / RING_COUNT
              : ((f + i * (RING_PERIOD / RING_COUNT)) % RING_PERIOD) / RING_PERIOD;
            const r = 36 + phase * RING_MAX_R;
            const op = (1 - phase) * ringActive * 0.55;
            if (op <= 0.01) return null;
            return (
              <circle
                key={i} cx={CX} cy={BLOCK_CY} r={r} fill="none" stroke={stressColor}
                strokeWidth={SW_THIN} opacity={op}
              />
            );
          })
        ) : null}

        {/* 여진 파형 - 화면 아래쪽에 진폭이 줄어드는 흔들림이 좌->우로 그려진다 */}
        {aftershock !== undefined ? (
          <>
            <line
              x1={AFTERSHOCK_X0} y1={AFTERSHOCK_Y} x2={AFTERSHOCK_X1} y2={AFTERSHOCK_Y}
              stroke={stroke} strokeWidth={SW_THIN * 0.6} strokeDasharray="4 14" opacity={0.25}
            />
            {aftershock > 0.002 ? (
              <polyline
                points={seismoPath(aftershock)}
                fill="none" stroke={stressColor} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round"
              />
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default FaultStressDiagram;
