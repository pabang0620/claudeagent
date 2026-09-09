/** "성대(목 안의 얇은 두 겹 막)가 빠르게 부딪히고 떨려서 목소리가 난다 -> 크게 소리 지르면
 *  훨씬 세고 빠르게 부딪혀 마찰이 커지고 붓는다 -> 부은 성대는 매끄럽게 못 떨고 울퉁불퉁
 *  떨려서 목소리가 거칠어진다 -> 속삭이면 오히려 성대를 꽉 조인 채로 억지로 바람을 내보내
 *  마찰이 더 커진다"를 보여주는 목 단면 다이어그램(소리 지르면 목이 쉬는 이유, general-ep73).
 *
 *  REGISTRY 확인 완료 - `VocalResonanceDiagram`(general-ep56, 헬륨 목소리)은 성대를 "캡슐 하나
 *  + 그 안의 파형"으로만 표현해 공명(resonance) 대비에 최적화돼 있고, "두 겹 막이 서로
 *  부딪힌다"는 이번 화의 핵심(충돌 강도·붓기·불규칙 떨림)을 보여주기엔 구조가 다르다.
 *  `CatPurrDiagram`(general-ep28)은 "근육이 반복적으로 틈을 여닫는다"는 같은 계열이지만
 *  고양이 목 클로즈업 전용 좌표라 재사용하지 않고, 같은 설계 원칙만 계승해 새로 만들었다.
 *
 *  오케스트레이터 지시대로 성대를 사실적인 해부도로 그리지 않는다 - **단순한 캡슐 도형
 *  두 개가 서로를 향해 움직이며 부딪히는 형태**로만 표현한다(HiccupDiagram·CellMergeDiagram과
 *  같은 원칙: "지금 이 순간의 상태"만 그리고 시간 변화는 호출부가 0~1 progress로 넘긴다).
 *  단, 빠른 떨림 자체는 반복 주기 애니메이션이라 `f`(프레임)를 직접 받는 예외를 쓴다
 *  (DogNoseCloseup·CatPurrDiagram과 동일 예외, Math.random은 쓰지 않는다 - 원칙 3).
 *
 *  독립 progress 5개:
 *   - vibrateProgress : 0=가만히 열린 채 정지 -> 1=규칙적으로 부드럽게 진동(평소 발성).
 *   - strainProgress   : 0=평소 진폭·주기 -> 1=훨씬 크게 벌어졌다 훨씬 빠르고 세게(쾅쾅)
 *     부딪힘(고함). 부딪히는 순간(closeFrac이 1에 가까워질 때) strainProgress가 높을수록
 *     짧은 충격선(impact flash)이 함께 터진다 - "부딪히기" 핵심 액션 강조(원칙 7).
 *   - swellProgress    : 0=평소 색·두께 -> 1=표면이 붉게 붓고(색 보간) 살짝 두꺼워짐(bulge).
 *     색 보간은 lerpColor가 hex 문자열을 반환하고 그 결과를 재보간하지 않는다(49화 사고 재발
 *     방지, VocalResonanceDiagram과 동일 관례).
 *   - hoarseProgress   : 0=매끄럽고 규칙적인 진동 -> 1=주기·진폭이 어긋나는 불규칙한 떨림.
 *     불규칙함은 서로 다른 두 개의 결정적 사인파 합(주파수가 다른 두 개)으로 만든다
 *     (Math.random 미사용, 원칙 3).
 *   - whisperProgress  : 0=평소 -> 1=성대가 꽉 조여진 좁은 틈으로 강제됨 + 그 틈으로
 *     바람이 억지로 지나가는 마찰(큰 물결선 2개, 점 무리 금지 - "신체 표현은 최소한으로" 원칙)
 *     을 보여준다. 진동 상태와 별개 축이라 whisperProgress>0이면 vibrateProgress/strainProgress
 *     보다 우선해 틈을 강제로 좁힌다.
 *
 *  같은 파일에 `VoiceWaveform`(성대 다이어그램과 짝을 이루는 "목소리 파형" 표시)도 함께
 *  둔다 - roughness(0=매끈한 정현파=맑은 목소리 -> 1=불규칙한 파형=쉰 목소리)를 결정적
 *  사인파 합으로 표현한다. 다른 화의 "목소리 품질" 소재 전반에도 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW } from '../theme';
import { clamp01 } from '../anim';

const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** 두 hex 색을 t(0~1)로 보간해 hex 문자열을 반환한다. 반환값을 다시 보간에 넣지 않는다
 *  (49화 rgb() 재보간 사고 재발 방지 - VocalResonanceDiagram과 동일 관례). */
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* ============================================================
 * VocalCordVibrationDiagram
 * ============================================================ */

export const VOCAL_CORD_VB_W = 640;
export const VOCAL_CORD_VB_H = 640;

const CX = 320;
const TUBE_TOP = 60;
const TUBE_BOTTOM = 590;
const TUBE_HALF_W = 200;
const FOLD_CY = 330;
const FOLD_H_BASE = 62;
const FOLD_OUTER_X = TUBE_HALF_W - 10; // 벽에서 살짝 안쪽

/** "성대" 라벨 앵커 - 관 위쪽 여백(folds보다 한참 위, 벽 상단과도 안 겹침) */
export const VOCAL_CORD_LABEL_PT = { x: CX, y: FOLD_CY - 170 };
/** 두 겹이 부딪히는 중심점 - 외부에서 임팩트 이펙트를 얹고 싶을 때 쓴다 */
export const VOCAL_CORD_GAP_PT = { x: CX, y: FOLD_CY };

/** 진동 주기(프레임) - 평소(느림) ~ 고함(빠름) */
const PERIOD_NORMAL = 26;
const PERIOD_STRAIN = 10;
/** 열렸을 때 중심에서 안쪽 끝까지 거리(gapHalf) 최대치 */
const GAP_OPEN_NORMAL = 34;
const GAP_OPEN_STRAIN = 60;
/** 닫히는 동작의 날카로움(값이 클수록 열려 있는 시간이 길고 순간적으로 쾅 닫힘) */
const SHARP_NORMAL = 1.0;
const SHARP_STRAIN = 2.6;
/** 정지 상태(진동 없음)일 때 기본으로 열려 있는 폭 */
const REST_GAP_HALF = 74;
/** 속삭임 상태로 강제될 때 남는 아주 좁은 틈 */
const WHISPER_GAP_HALF = 9;

/** 붓기 상태 색 - 다른 화의 상처·멍 색(BruiseDiagram의 LIGHT_RED 등)과 별개로,
 *  이 화의 라벨 텍스트 색도 맞춰 쓸 수 있도록 export한다. */
export const VOCAL_CORD_SWELL_COLOR = '#E2503F';

export interface VocalCordVibrationDiagramProps {
  /** 씬 로컬 프레임. 진동·불규칙 떨림·마찰 흐름에 쓴다 */
  f: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0=정지(열린 채) -> 1=규칙적으로 부드럽게 진동 */
  vibrateProgress?: number;
  /** 0~1. 0=평소 진폭·주기 -> 1=훨씬 크고 빠르고 세게 부딪힘(고함) */
  strainProgress?: number;
  /** 0~1. 0=평소 색 -> 1=붉게 붓고 두꺼워짐 */
  swellProgress?: number;
  /** 0~1. 0=매끄럽고 규칙적 -> 1=불규칙하게 어긋나는 떨림 */
  hoarseProgress?: number;
  /** 0~1. 0=평소 -> 1=꽉 조여진 좁은 틈 + 마찰 바람 흐름(속삭임) */
  whisperProgress?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const VocalCordVibrationDiagram: React.FC<VocalCordVibrationDiagramProps> = ({
  f, width, x = 0, y = 0,
  vibrateProgress = 0, strainProgress = 0, swellProgress = 0, hoarseProgress = 0, whisperProgress = 0,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const vibP = clamp01(vibrateProgress);
  const strainP = clamp01(strainProgress);
  const swellP = clamp01(swellProgress);
  const hoarseP = clamp01(hoarseProgress);
  const whisperP = clamp01(whisperProgress);
  const height = width; // viewBox 정사각형

  const period = lerp(PERIOD_NORMAL, PERIOD_STRAIN, strainP);
  const gapOpenMax = lerp(GAP_OPEN_NORMAL, GAP_OPEN_STRAIN, strainP);
  const sharp = lerp(SHARP_NORMAL, SHARP_STRAIN, strainP);

  // 불규칙 떨림 - 서로 다른 두 결정적 사인파 합 (Math.random 미사용, 원칙 3)
  const phaseJitter = hoarseP * 0.7 * (Math.sin(f * 0.31 + 0.4) * 0.6 + Math.sin(f * 0.11 + 2.2) * 0.4);
  const ampJitter = hoarseP * 0.38 * (Math.sin(f * 0.53 + 1.1) * 0.5 + Math.sin(f * 0.19 + 2.7) * 0.5);

  const phase = (f / period) * Math.PI * 2 + phaseJitter;
  const closeFracRaw = (Math.sin(phase - Math.PI / 2) + 1) / 2;
  const closeFrac = clamp01(closeFracRaw ** sharp + ampJitter * closeFracRaw);

  const vibratingGapHalf = gapOpenMax * (1 - closeFrac);
  let gapHalf = lerp(REST_GAP_HALF, vibratingGapHalf, vibP);

  // 속삭임 - 진동 상태와 무관하게 좁은 틈으로 강제(약한 떨림만 남김)
  const whisperTremor = 3 * Math.sin(f * 0.4);
  gapHalf = lerp(gapHalf, WHISPER_GAP_HALF + whisperTremor, whisperP);
  gapHalf = Math.max(2, gapHalf);

  // 부딪힘 임팩트 - strainProgress가 높고 실제로 거의 닫혔을 때만 짧게 반짝
  const impactStrength = whisperP > 0.01 ? 0
    : strainP * vibP * clamp01((closeFrac - 0.86) / 0.14);

  const foldColor = lerpColor(fill, VOCAL_CORD_SWELL_COLOR, swellP);
  const foldStroke = lerpColor(stroke, VOCAL_CORD_SWELL_COLOR, swellP * 0.7);
  const foldH = FOLD_H_BASE * (1 + 0.24 * swellP);
  const foldTopY = FOLD_CY - foldH / 2;

  const leftInnerX = CX - gapHalf;
  const rightInnerX = CX + gapHalf;
  const leftOuterX = CX - FOLD_OUTER_X;
  const rightOuterX = CX + FOLD_OUTER_X;
  const leftW = Math.max(4, leftInnerX - leftOuterX);
  const rightW = Math.max(4, rightOuterX - rightInnerX);
  const rx = Math.min(foldH / 2, 28);

  // 속삭임 마찰 - 좁은 틈으로 지나가는 큰 물결선 2개 (점 무리 금지)
  const frictionWave = (sign: -1 | 1, seed: number) => {
    const steps = 18;
    const pts: string[] = [];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const py = TUBE_TOP + 30 + t * (TUBE_BOTTOM - TUBE_TOP - 60);
      const bendT = Math.abs(py - FOLD_CY) < foldH * 1.4 ? 0.35 : 1; // 틈 근처만 살짝 흔들리게
      const px = CX + sign * (gapHalf * 0.55 + bendT * (10 + 16 * Math.sin(t * Math.PI * 3.2 + f * 0.5 + seed)));
      pts.push(`${s === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${VOCAL_CORD_VB_W} ${VOCAL_CORD_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 목 안 통로 벽 - 해부도가 아니라 순수 채널 형태 */}
        <path
          d={`M ${CX - TUBE_HALF_W} ${TUBE_TOP} L ${CX - TUBE_HALF_W} ${TUBE_BOTTOM}
              Q ${CX - TUBE_HALF_W} ${TUBE_BOTTOM + 34} ${CX} ${TUBE_BOTTOM + 34}
              Q ${CX + TUBE_HALF_W} ${TUBE_BOTTOM + 34} ${CX + TUBE_HALF_W} ${TUBE_BOTTOM}
              L ${CX + TUBE_HALF_W} ${TUBE_TOP}`}
          fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round" opacity={0.5}
        />

        {/* 속삭임 마찰 물결선 - 틈 사이로 지나가는 바람 */}
        {whisperP > 0.02 ? (
          <>
            <path d={frictionWave(-1, 0)} fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={whisperP * 0.85} />
            <path d={frictionWave(1, 3.3)} fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={whisperP * 0.85} />
          </>
        ) : null}

        {/* 부딪힘 임팩트 - 접촉점에서 짧게 방사하는 충격선 */}
        {impactStrength > 0.03 ? (
          <g opacity={impactStrength}>
            {[-1, 1].map((sx) => [-1, 1].map((sy) => (
              <line
                key={`${sx}-${sy}`}
                x1={CX + sx * 14} y1={FOLD_CY + sy * 10}
                x2={CX + sx * (14 + 30 * impactStrength)} y2={FOLD_CY + sy * (10 + 22 * impactStrength)}
                stroke={C.gold} strokeWidth={7} strokeLinecap="round"
              />
            )))}
          </g>
        ) : null}

        {/* 왼쪽 겹(fold) - 캡슐 도형 */}
        <rect
          x={leftOuterX} y={foldTopY} width={leftW} height={foldH} rx={rx}
          fill={foldColor} stroke={foldStroke} strokeWidth={SW * 0.72}
        />
        {/* 오른쪽 겹(fold) - 캡슐 도형 */}
        <rect
          x={rightInnerX} y={foldTopY} width={rightW} height={foldH} rx={rx}
          fill={foldColor} stroke={foldStroke} strokeWidth={SW * 0.72}
        />
      </svg>
    </div>
  );
};

/* ============================================================
 * VoiceWaveform - 성대 상태와 짝을 이루는 "목소리 파형" 표시
 * ============================================================ */

export interface VoiceWaveformProps {
  f: number;
  /** 파형 가로 길이(px) */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0=매끈한 정현파(맑은 목소리) -> 1=불규칙한 파형(쉰 목소리) */
  roughness?: number;
  /** 0~1. 파형 자체의 노출(등장 progress) */
  reveal?: number;
  /** 파형 주기 수(가로 길이 안에 몇 번 출렁이는지). 기본 5(73화 원래 동작 그대로) -
   *  값이 클수록 촘촘한(높은) 파형, 작을수록 성긴(낮은) 파형으로 보인다(general-ep99에서
   *  성대 치수별 대비를 위해 optional prop으로 추가 - 기본값을 바꾸지 않았다). */
  cycles?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** 결정적 사인파 합으로 매끈함<->불규칙함을 연속적으로 표현한다(Math.random 미사용, 원칙 3). */
export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  f, width, x = 0, y = 0, roughness = 0, reveal = 1, cycles = 5, color = C.ink, strokeWidth = 10, style,
}) => {
  const rough = clamp01(roughness);
  const rev = clamp01(reveal);
  if (rev <= 0.005) return null;
  const height = width * 0.34;
  const cy = height / 2;
  const ampBase = height * 0.32;
  const phase = f * 0.16;
  const segments = 72;
  const visibleLen = width * rev;

  const pts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const px = t * width;
    if (px > visibleLen) break;
    const smoothY = Math.sin(t * cycles * Math.PI * 2 + phase);
    const noiseY = Math.sin(t * cycles * Math.PI * 2 * 3.4 + phase * 1.6 + 1.7) * 0.5
      + Math.sin(t * cycles * Math.PI * 2 * 6.8 + phase * 0.7 + 4.2) * 0.3;
    const yy = cy + ampBase * ((1 - rough) * smoothY + rough * (smoothY * 0.45 + noiseY));
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${yy.toFixed(1)}`);
  }

  return (
    <svg
      width={width} height={height}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default VocalCordVibrationDiagram;
