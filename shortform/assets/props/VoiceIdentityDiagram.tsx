/** "목소리는 성대(목 안의 얇은 근육)가 떨며 나는 기본음에서 시작되는데, 이 성대의 길이·
 *  두께가 사람마다 달라 기본음의 높낮이가 갈린다 -> 거기에 목·입·코 안에서 소리가 울리는
 *  공명 공간의 크기도 사람마다 달라서 같은 떨림도 다르게 물든다 -> 그래서 성대와 공명
 *  공간이 둘 다 다른 만큼 목소리도 사람마다 완전히 다르다 -> 사춘기 때 목소리가 굵어지는
 *  것도 성대가 자라기 때문이다"를 보여주는 범용 다이어그램(사람마다 목소리가 다 다른 이유,
 *  general-ep99).
 *
 *  REGISTRY 확인 완료 - `VocalResonanceDiagram`(general-ep56)은 헬륨이 소리 속도를 바꿔
 *  공명이 "일시적으로" 변하는 현상 전용이라 "타고난 개인차"를 표현하지 못하고,
 *  `VocalCordVibrationDiagram`(general-ep73)은 "두 겹 막이 서로 부딪히는 강도·붓기·불규칙
 *  떨림"(고함/속삭임으로 목이 쉬는 과정)을 보여주는 구조라 "성대 치수 자체의 개인차"라는
 *  이번 화의 핵심과 다르다. 둘 다 재사용하지 못해 새로 만들었지만, 설계 원칙(신체를
 *  해부도로 그리지 않고 단순 캡슐/타원 도형만 쓰는 것, 색 보간이 hex 문자열을 반환하고
 *  재보간하지 않는 것)은 그대로 계승한다. 짝을 이루는 `VoiceWaveform`(general-ep73)에는
 *  이 화에서 필요해진 `cycles`(파형 주파수) optional prop 을 추가했다(기본값 5 로 기존
 *  73화 동작은 그대로 유지 - 기존 컴포넌트를 고칠 땐 기본값을 바꾸지 않고 optional prop만
 *  더한다는 원칙).
 *
 *  오케스트레이터 지시대로 "여러 사람 캐릭터를 그리기보다, 한 캐릭터의 성대·공명 공간
 *  치수를 슬라이더처럼 바꿔가며 대비를 보여준다" - 그래서 이 다이어그램 자체는 캐릭터를
 *  전혀 그리지 않고, 성대는 단순 캡슐(세로 길이=성대 길이, 가로 폭=성대 두께) 하나로,
 *  공명 공간은 단순 타원(크기=공명 공간 크기) 하나로만 표현한다("신체 표현은 최소한으로"
 *  원칙 - 해부도·점 무리 없음).
 *
 *  독립 progress 3개(undefined 면 그 레이어를 그리지 않는다, LightScatterDiagram과 같은
 *  설계):
 *   - cordCompareProgress : 저음(길고 두꺼운 캡슐, 왼쪽)과 고음(짧고 얇은 캡슐, 오른쪽)
 *     성대 모양이 먼저 팝인하고(0~0.55 구간), 이어서 각각에 대응하는 파형(저음=넓은
 *     간격, 고음=촘촘한 간격)이 뒤따라 리빌된다(0.45~1 구간, 겹치는 구간을 둬 매끄럽게
 *     이어진다 - GrowthTimeline과 같은 "한 progress로 다단 리빌" 원칙). s3(모양만)이
 *     progress를 0~0.55까지 올리고, s4(파형 추가)가 이어받아 0.55~1까지 마저 올린다
 *     (21화 이후 결함 D - 다음 장면에서 이전 상태를 유지).
 *   - resonanceCompareProgress : 작은 공명 공간(위)과 큰 공명 공간(오른쪽 큰 타원, 아래)
 *     타원이 먼저 팝인하고(0~0.45), 왼쪽에서 같은 회색 파형이 들어와 타원을 지나며 각
 *     타원에 배정된 색(작은 공간=코랄, 큰 공간=골드)으로 물들어 오른쪽으로 빠져나간다
 *     (0.3~1, 겹치는 구간). "같은 기본음이 통과하는 공간만 달라 다르게 들린다"를
 *     보여주기 위해 두 파형은 진동수·진폭이 완전히 같고 색만 다르다.
 *   - pubertyGrowProgress : 성대 캡슐 하나가 어린이 치수(짧고 얇음)에서 청소년 치수
 *     (길고 두꺼움, cordCompareProgress의 저음 캡슐과 같은 최종 치수)로 자라난다.
 *     오른쪽에 작은 성장 화살표가 함께 옅게 페이드인한다.
 *
 *  "발생 기관의 치수 차이 + 통과 공간의 형태 차이가 합쳐져 최종 결과물이 갈린다"는 구조를
 *  갖는 다른 소재(악기 개체차 등) 전반 재사용 가능성이 있어 등록한다.
 */
import React from 'react';
import { C } from '../theme';
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
 *  (49화 rgb() 재보간 사고 재발 방지 - VocalResonanceDiagram·VocalCordVibrationDiagram과
 *  동일 관례). */
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** 수평 사인파 폴리라인 "d" 문자열 (VocalResonanceDiagram의 sineWaveD와 같은 방식,
 *  export되어 있지 않아 지역성 우선 원칙에 따라 이 파일 안에서 다시 짠다). */
function sineWaveD(x0: number, y0: number, length: number, amplitude: number, cycles: number, phase = 0, segments = 48): string {
  const parts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = x0 + t * length;
    const y = y0 + amplitude * Math.sin(t * cycles * Math.PI * 2 + phase);
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(' ');
}

export const VOICE_ID_VB_W = 700;
export const VOICE_ID_VB_H = 700;

const CX = 350;

/* ============================================================
 * 성대 비교 (cordCompareProgress)
 * ============================================================ */
const CORD_CY = 320;
const CORD_LOW_CX = 190;
const CORD_HIGH_CX = 510;
/** 저음(길고 두꺼움) / 고음(짧고 얇음) 성대 캡슐 치수. 사춘기 성장 레이어의 "청소년" 치수와
 *  같은 값을 저음 캡슐이 그대로 쓴다(치수가 같은 만큼 낮은 음역이라는 의미 일관성). */
const CORD_LOW = { length: 230, thickness: 68 };
const CORD_HIGH = { length: 125, thickness: 36 };

const CORD_WAVE_Y = 540;
const CORD_WAVE_LEN = 200;
const CORD_WAVE_LOW = { cycles: 1.6, amp: 30 };
const CORD_WAVE_HIGH = { cycles: 4.4, amp: 18 };

/** 성대 캡슐 라벨 앵커 - 각 캡슐 위 여백 (호출 씬이 원하면 Label을 얹을 수 있다) */
export const VOICE_ID_LOW_PT = { x: CORD_LOW_CX, y: CORD_CY - CORD_LOW.length / 2 - 46 };
export const VOICE_ID_HIGH_PT = { x: CORD_HIGH_CX, y: CORD_CY - CORD_HIGH.length / 2 - 46 };

function CordUnit({
  cx, cy, length, thickness, opacity, stroke, fill,
}: {
  cx: number; cy: number; length: number; thickness: number; opacity: number; stroke: string; fill: string;
}) {
  if (opacity <= 0.005) return null;
  const scale = 0.72 + 0.28 * opacity;
  const rx = Math.min(thickness / 2, 26);
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
      <rect
        x={cx - thickness / 2} y={cy - length / 2} width={thickness} height={length} rx={rx}
        fill={fill} stroke={stroke} strokeWidth={9}
      />
    </g>
  );
}

/* ============================================================
 * 공명 공간 비교 (resonanceCompareProgress)
 * ============================================================ */
const RES_ROW_SMALL_Y = 210;
const RES_ROW_LARGE_Y = 500;
const RES_SMALL = { rx: 68, ry: 54 };
const RES_LARGE = { rx: 128, ry: 98 };
const RES_WAVE_LEFT_X = 46;
const RES_WAVE_RIGHT_X = 654;
const RES_WAVE_CYCLES = 2.2;
const RES_WAVE_AMP = 15;

function ResonanceRow({
  cy, rx, ry, tintColor, opacity, waveOpacity, stroke, fill, phase,
}: {
  cy: number; rx: number; ry: number; tintColor: string; opacity: number; waveOpacity: number;
  stroke: string; fill: string; phase: number;
}) {
  if (opacity <= 0.005) return null;
  const scale = 0.75 + 0.25 * opacity;
  return (
    <g>
      <g opacity={opacity} transform={`translate(${CX} ${cy}) scale(${scale}) translate(${-CX} ${-cy})`}>
        <ellipse cx={CX} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={8} opacity={0.9} />
      </g>
      {waveOpacity > 0.01 ? (
        <g opacity={waveOpacity}>
          <path
            d={sineWaveD(RES_WAVE_LEFT_X, cy, CX - rx - RES_WAVE_LEFT_X, RES_WAVE_AMP, RES_WAVE_CYCLES, phase)}
            fill="none" stroke={C.inkSoft} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d={sineWaveD(CX + rx, cy, RES_WAVE_RIGHT_X - (CX + rx), RES_WAVE_AMP, RES_WAVE_CYCLES, phase)}
            fill="none" stroke={tintColor} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"
          />
        </g>
      ) : null}
    </g>
  );
}

/* ============================================================
 * 사춘기 성장 (pubertyGrowProgress)
 * ============================================================ */
const GROW_CX = 350;
const GROW_CY = 350;
const GROW_CHILD = { length: 92, thickness: 26 };
const GROW_TEEN = CORD_LOW; // 다 자란 상태 = 저음 캡슐과 동일 치수

/** 사춘기 성장 레이어 상단 여백 앵커 (호출 씬이 원하면 Label을 얹을 수 있다) */
export const VOICE_ID_GROW_PT = { x: GROW_CX, y: GROW_CY - GROW_TEEN.length / 2 - 46 };

export interface VoiceIdentityDiagramProps {
  /** 씬 로컬 프레임(선택). 파형 위상에만 쓴다 */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 저음/고음 성대 모양 + 대응 파형 비교 */
  cordCompareProgress?: number;
  /** 0~1. 작은/큰 공명 공간 + 같은 기본음이 다르게 물드는 파형 비교 */
  resonanceCompareProgress?: number;
  /** 0~1. 어린이 치수 -> 청소년 치수로 성대가 자라는 애니메이션 */
  pubertyGrowProgress?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const VoiceIdentityDiagram: React.FC<VoiceIdentityDiagramProps> = ({
  f = 0, width, x = 0, y = 0,
  cordCompareProgress, resonanceCompareProgress, pubertyGrowProgress,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const height = width; // viewBox 정사각형
  const phase = f * 0.06;

  const cordP = cordCompareProgress === undefined ? null : clamp01(cordCompareProgress);
  const resP = resonanceCompareProgress === undefined ? null : clamp01(resonanceCompareProgress);
  const growP = pubertyGrowProgress === undefined ? null : clamp01(pubertyGrowProgress);

  const shapesP = cordP === null ? 0 : clamp01(cordP / 0.55);
  const wavesP = cordP === null ? 0 : clamp01((cordP - 0.45) / 0.55);

  const blobsP = resP === null ? 0 : clamp01(resP / 0.45);
  const flowP = resP === null ? 0 : clamp01((resP - 0.3) / 0.7);

  const growLength = growP === null ? 0 : lerp(GROW_CHILD.length, GROW_TEEN.length, growP);
  const growThickness = growP === null ? 0 : lerp(GROW_CHILD.thickness, GROW_TEEN.thickness, growP);
  const growArrowOpacity = growP === null ? 0 : clamp01((growP - 0.15) / 0.5);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${VOICE_ID_VB_W} ${VOICE_ID_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* ---------------- 성대 비교 ---------------- */}
        {cordP !== null ? (
          <>
            <CordUnit cx={CORD_LOW_CX} cy={CORD_CY} length={CORD_LOW.length} thickness={CORD_LOW.thickness} opacity={shapesP} stroke={stroke} fill={fill} />
            <CordUnit cx={CORD_HIGH_CX} cy={CORD_CY} length={CORD_HIGH.length} thickness={CORD_HIGH.thickness} opacity={shapesP} stroke={stroke} fill={fill} />
            {wavesP > 0.01 ? (
              <g opacity={wavesP}>
                <path
                  d={sineWaveD(CORD_LOW_CX - CORD_WAVE_LEN / 2, CORD_WAVE_Y, CORD_WAVE_LEN, CORD_WAVE_LOW.amp, CORD_WAVE_LOW.cycles, phase)}
                  fill="none" stroke={C.coral} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d={sineWaveD(CORD_HIGH_CX - CORD_WAVE_LEN / 2, CORD_WAVE_Y, CORD_WAVE_LEN, CORD_WAVE_HIGH.amp, CORD_WAVE_HIGH.cycles, phase)}
                  fill="none" stroke={C.gold} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
                />
              </g>
            ) : null}
          </>
        ) : null}

        {/* ---------------- 공명 공간 비교 ---------------- */}
        {resP !== null ? (
          <>
            <ResonanceRow
              cy={RES_ROW_SMALL_Y} rx={RES_SMALL.rx} ry={RES_SMALL.ry} tintColor={C.coral}
              opacity={blobsP} waveOpacity={flowP} stroke={stroke} fill={fill} phase={phase}
            />
            <ResonanceRow
              cy={RES_ROW_LARGE_Y} rx={RES_LARGE.rx} ry={RES_LARGE.ry} tintColor={C.gold}
              opacity={blobsP} waveOpacity={flowP} stroke={stroke} fill={fill} phase={phase}
            />
          </>
        ) : null}

        {/* ---------------- 사춘기 성장 ---------------- */}
        {growP !== null ? (
          <>
            <CordUnit cx={GROW_CX} cy={GROW_CY} length={growLength} thickness={growThickness} opacity={growP > 0.01 ? 1 : 0} stroke={stroke} fill={lerpColor(fill, C.coralSoft, growP * 0.4)} />
            {growArrowOpacity > 0.01 ? (
              <g opacity={growArrowOpacity} transform={`translate(${GROW_CX + growThickness / 2 + 54} ${GROW_CY})`}>
                <line x1={0} y1={growLength / 2 + 10} x2={0} y2={-growLength / 2 - 10} stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
                <path d={`M ${-16} ${-growLength / 2 + 14} L 0 ${-growLength / 2 - 10} L 16 ${-growLength / 2 + 14}`} fill="none" stroke={C.gold} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default VoiceIdentityDiagram;
