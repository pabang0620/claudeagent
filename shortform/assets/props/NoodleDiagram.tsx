/** 라면 면발 - 곧은 면이 벨트 위에서 구불구불하게 접히는 과정, 그 틈으로 열/물이
 *  통과하는 애니메이션, 구불한 면이 원형 컵 단면에 들어차는 배치를 한 파일에 묶는다
 *  (general-ep43 "라면이 다 꼬불꼬불한 이유").
 *
 *  면발은 굵은 선 3~5가닥(STRAND_COUNT=4)만 쓴다 - 가는 선을 촘촘히 다발로 그리지
 *  않는다(오케스트레이터 시각 주의사항). 각 가닥은 ink 외곽선 위에 gold 계열 색을 겹쳐
 *  그리는 이중 스트로크(캐릭터 선화와 같은 방식)로 "굵은 리본형 면발" 느낌을 낸다.
 *
 *  NoodleDiagram: waveProgress(0~1, 곧은 선 -> 접힘이 왼쪽에서 오른쪽으로 번지며 완전히
 *  구불구불해짐) + flowProgress(누적값, undefined/0이면 안 그림 - 내부에서 mod 1 처리해
 *  구불한 면 사이 틈으로 flowMode에 따라 뜨거운 바람(위로 상승, gold 화살촉)이나 물(아래로
 *  스며듦, 파란 물방울)이 반복해서 통과)을 독립 진행도로 받는다. 실제 벨트/열풍기 기계
 *  디테일은 그리지 않고
 *  면발의 형태 변화 자체로 곧은 면<->구불한 면의 대비를 보여준다(오케스트레이터 지시:
 *  "곧은 면과 꼬불꼬불한 면의 대비가 중심").
 *
 *  NoodleCupFit: cupFit(0~1, 원형 컵 단면 안에 같은 파형이 빈틈없이 들어차는 정도).
 *  컵 안 내용물이 아니라 "그릇에 담긴 음식의 부피" 소재라는 점에서 PlateFoodIcon과
 *  이웃하지만, PlateFoodIcon은 온도(heat) 연속보간이 핵심이고 이건 파형이 원형에
 *  맞춰 들어차는 게 핵심이라 별도 컴포넌트로 분리했다.
 *
 *  "곧은 선이 파형으로 바뀌며, 그 틈으로 무언가 흐르고, 그 결과물이 다른 그릇 모양에
 *  맞춰 들어찬다" 구조를 갖는 다른 소재(주름진 포장재, 골판지 등) 전반 재사용
 *  가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ================= NoodleDiagram: 접힘 + 틈 사이 흐름 ================= */

export const NOODLE_VB_W = 880;
export const NOODLE_VB_H = 640;

const X_INSET = 60;
const INNER_W = NOODLE_VB_W - X_INSET * 2; // 760
const STRAND_COUNT = 4;
const BASE_YS = [190, 290, 390, 490];
const AMP = 42;
const WAVE_COUNT = 4.5;
const FREQ = (2 * Math.PI * WAVE_COUNT) / INNER_W;
const TRANS_W = 220; // 접힘이 번지는 전환 폭
const N_SAMPLES = 72;

/** x, i, waveProgress -> 그 x 위치에서 가닥 i 의 y (viewBox 좌표) */
function strandY(xLocal: number, i: number, waveProgress: number) {
  const front = lerp(-TRANS_W, INNER_W + TRANS_W, clamp01(waveProgress));
  const localT = clamp01((front - xLocal) / TRANS_W);
  const amp = AMP * localT;
  const phase = i * 1.15;
  return BASE_YS[i] - amp * Math.sin(xLocal * FREQ + phase);
}

function strandPath(i: number, waveProgress: number) {
  const pts: string[] = [];
  for (let s = 0; s <= N_SAMPLES; s += 1) {
    const xLocal = (s / N_SAMPLES) * INNER_W;
    const yy = strandY(xLocal, i, waveProgress);
    pts.push(`${s === 0 ? 'M' : 'L'} ${(X_INSET + xLocal).toFixed(1)} ${yy.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** 흐름 표시(열/물) 앵커 x 위치 - 가닥 사이 "틈"에 해당하는 지점(가닥과 가닥 사이 중앙) */
const FLOW_COUNT = 5;
function flowAnchorX(k: number) {
  return X_INSET + ((k + 1) / (FLOW_COUNT + 1)) * INNER_W;
}

/** 노란 면발과 겹쳐도 잘 보이도록 coral(면발 gold와 대비되는 색)을 쓰고, ink 외곽선을
 *  먼저 굵게 깐 뒤 coral을 얇게 겹치는 이중 스트로크로 대비를 한 번 더 준다 */
const HeatChevron: React.FC<{ x: number; y: number; size: number; opacity: number }> = ({
  x, y, size, opacity,
}) => {
  const d = `M ${x - size} ${y + size * 0.6} L ${x} ${y - size * 0.6} L ${x + size} ${y + size * 0.6}`;
  return (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const WaterDrop: React.FC<{ x: number; y: number; size: number; opacity: number }> = ({
  x, y, size, opacity,
}) => (
  <path
    d={`M ${x} ${y - size} C ${x + size * 0.85} ${y - size * 0.1}, ${x + size * 0.6} ${y + size}, ${x} ${y + size} C ${x - size * 0.6} ${y + size}, ${x - size * 0.85} ${y - size * 0.1}, ${x} ${y - size} Z`}
    fill={C.waterCool} stroke={C.ink} strokeWidth={4} opacity={opacity}
  />
);

export interface NoodleDiagramProps {
  /** 화면상 폭(px). viewBox(880x640)와 같은 비율로 스케일 */
  width: number;
  x: number;
  y: number;
  /** 0~1. 0=완전히 곧은 면발, 1=왼쪽부터 접힘이 번져 전체가 구불구불해짐 */
  waveProgress: number;
  /** 누적값(0 이상, 초 단위 등). undefined/0이면 흐름 표시를 안 그림. 내부에서 mod 1 처리해
   *  면 사이 틈으로 열/물이 반복해서 흐르는 것을 표현한다(GutTubeDiagram의 flowT와 동일 원칙 -
   *  0~1로 가둔 값이 아니라 계속 증가하는 값을 받아야 씬 경계 없이 계속 흐른다) */
  flowProgress?: number;
  /** 'heat' = 뜨거운 바람이 위로 상승(gold 화살촉) / 'water' = 물이 아래로 스며듦(청색 물방울) */
  flowMode?: 'heat' | 'water';
  stroke?: string;
  noodleColor?: string;
  style?: React.CSSProperties;
}

export const NoodleDiagram: React.FC<NoodleDiagramProps> = ({
  width, x, y, waveProgress, flowProgress, flowMode = 'heat',
  stroke = C.ink, noodleColor = C.gold, style,
}) => {
  // flowProgress는 0~1에 갇힌 값이 아니라 계속 누적되는 값을 받는다(GutTubeDiagram의
  // flowT와 같은 원칙) - 내부에서 mod 1 처리해 반복 흐름을 만들기 때문에 clamp01을 걸면
  // 1을 넘는 순간부터 흐름이 멈춰버린다. 렌더 여부만 0 근처인지로 판단한다.
  const fp = flowProgress ?? 0;
  const fpActive = fp > 0.0005;

  return (
    <svg
      viewBox={`0 0 ${NOODLE_VB_W} ${NOODLE_VB_H}`}
      width={width}
      height={width * (NOODLE_VB_H / NOODLE_VB_W)}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 바닥 기준선(벨트 자리 - 장식 없이 옅은 선 하나로만 표시) */}
      <line
        x1={X_INSET - 20} y1={BASE_YS[STRAND_COUNT - 1] + AMP + 46}
        x2={NOODLE_VB_W - X_INSET + 20} y2={BASE_YS[STRAND_COUNT - 1] + AMP + 46}
        stroke={C.hill} strokeWidth={10} strokeLinecap="round"
      />

      {/* 면발 가닥: ink 외곽선 + noodleColor 채움의 이중 스트로크 */}
      {Array.from({ length: STRAND_COUNT }).map((_, i) => (
        <React.Fragment key={i}>
          <path d={strandPath(i, waveProgress)} fill="none" stroke={stroke} strokeWidth={SW + 8} strokeLinecap="round" />
          <path d={strandPath(i, waveProgress)} fill="none" stroke={noodleColor} strokeWidth={SW} strokeLinecap="round" />
        </React.Fragment>
      ))}

      {/* 틈 사이 흐름(열/물) - 가닥 사이 앵커 지점을 따라 반복 이동 */}
      {fpActive ? (
        <g>
          {Array.from({ length: FLOW_COUNT }).map((_, k) => {
            const ax = flowAnchorX(k);
            const offset = k / FLOW_COUNT;
            const topY = BASE_YS[0] - AMP - 60;
            const bottomY = BASE_YS[STRAND_COUNT - 1] + AMP + 30;
            const u = (fp * 1.6 + offset) % 1; // 0~1 반복 루프
            const localY = flowMode === 'heat' ? lerp(bottomY, topY, u) : lerp(topY, bottomY, u);
            const fade = Math.sin(Math.PI * clamp01(u)); // 양 끝에서 페이드
            const size = flowMode === 'heat' ? 20 : 16;
            return flowMode === 'heat' ? (
              <HeatChevron key={k} x={ax} y={localY} size={size} opacity={fade} />
            ) : (
              <WaterDrop key={k} x={ax} y={localY} size={size} opacity={fade} />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

/* ================= NoodleCupFit: 원형 컵 단면에 구불한 면이 들어참 ================= */

export const NOODLE_CUP_VB_W = 640;
export const NOODLE_CUP_VB_H = 640;

const CUP_CX = 320;
const CUP_CY = 330;
const CUP_R = 260;
const FILL_ROWS = 7;
const FILL_AMP = 26;
const FILL_FREQ = (2 * Math.PI * 5.5) / (CUP_R * 2);
const FILL_SAMPLES = 60;

function fillRowPath(rowIndex: number) {
  const baseY = CUP_CY - CUP_R + (rowIndex + 0.5) * ((CUP_R * 2) / FILL_ROWS);
  const phase = rowIndex * 1.3;
  const startX = CUP_CX - CUP_R - 20;
  const endX = CUP_CX + CUP_R + 20;
  const pts: string[] = [];
  for (let s = 0; s <= FILL_SAMPLES; s += 1) {
    const xx = lerp(startX, endX, s / FILL_SAMPLES);
    const yy = baseY - FILL_AMP * Math.sin((xx - startX) * FILL_FREQ + phase);
    pts.push(`${s === 0 ? 'M' : 'L'} ${xx.toFixed(1)} ${yy.toFixed(1)}`);
  }
  return pts.join(' ');
}

export interface NoodleCupFitProps {
  width: number;
  x: number;
  y: number;
  /** 0~1. 0=컵 단면이 비어 보임, 1=구불한 면이 빈틈없이 들어참 */
  cupFit: number;
  stroke?: string;
  cupColor?: string;
  noodleColor?: string;
  style?: React.CSSProperties;
}

export const NoodleCupFit: React.FC<NoodleCupFitProps> = ({
  width, x, y, cupFit, stroke = C.ink, cupColor = C.paper, noodleColor = C.gold, style,
}) => {
  const t = smooth(clamp01(cupFit));
  const clipId = 'noodle-cup-fit-clip';
  const rimOpacity = clamp01(cupFit * 4);

  return (
    <svg
      viewBox={`0 0 ${NOODLE_CUP_VB_W} ${NOODLE_CUP_VB_H}`}
      width={width}
      height={width * (NOODLE_CUP_VB_H / NOODLE_CUP_VB_W)}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={CUP_CX} cy={CUP_CY} r={CUP_R * t} />
        </clipPath>
      </defs>

      {/* 컵 안쪽 바탕(비어 보이는 흰 원) */}
      <circle cx={CUP_CX} cy={CUP_CY} r={CUP_R} fill={cupColor} opacity={rimOpacity * 0.6} />

      {/* 구불한 면 채움 - 원 안쪽으로만 자름 */}
      <g clipPath={`url(#${clipId})`} opacity={t > 0.01 ? 1 : 0}>
        {Array.from({ length: FILL_ROWS }).map((_, r) => (
          <React.Fragment key={r}>
            <path d={fillRowPath(r)} fill="none" stroke={stroke} strokeWidth={SW + 6} strokeLinecap="round" />
            <path d={fillRowPath(r)} fill="none" stroke={noodleColor} strokeWidth={SW - 2} strokeLinecap="round" />
          </React.Fragment>
        ))}
      </g>

      {/* 컵 테두리(단면 윤곽선) */}
      <circle
        cx={CUP_CX} cy={CUP_CY} r={CUP_R} fill="none" stroke={stroke} strokeWidth={SW}
        opacity={rimOpacity}
      />
    </svg>
  );
};

export default NoodleDiagram;
