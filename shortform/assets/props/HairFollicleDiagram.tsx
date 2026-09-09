/** "모낭 속 색소를 만드는 세포(멜라닌 세포)가 나이 들면서 줄고 활동이 약해져, 새로 나는
 *  머리카락에 색소가 덜 들어가 투명하게 자라고, 그 투명한 머리카락 속에 공기가 차 빛이
 *  산란해 하얗게 보인다"는 2단 사슬을 보여주는 다이어그램(나이 들면 흰머리가 나는 이유,
 *  general-ep77 신설).
 *
 *  REGISTRY 확인 완료 - GoosebumpDiagram(general-ep08)이 모낭·피부 단면을 다루지만
 *  "입모근 수축"이 주제라 색소 세포·머리카락 색 변화 구조가 없어 새로 만들었다.
 *  BruiseDiagram(general-ep61)의 hex lerp 색 진행도(반환값을 다시 보간에 넣지 않는 원칙)와
 *  Leaf(general-ep49)의 "색소는 점이 아니라 색 자체로 표현" 원칙을 계승한다.
 *
 *  `mode`로 세 화면을 한 컴포넌트로 커버한다(HiccupDiagram/BruiseDiagram과 같은 설계):
 *   - 'follicle' : 모낭 세로 단면(피부 표면 - 관 - 뿌리 벌브) + 색소 세포 2개(큰 도형,
 *     점 무리 금지) + 그 위로 자라는 머리카락 한 가닥. s2(색소 세포 소개)·s6(모낭 하나 =
 *     머리카락 하나 실제 설명)에 쓴다.
 *   - 'strand'   : 머리카락 단면(원) 확대. s4(색소 있음 vs 투명 비교)·s5(투명 단면 속
 *     공기 방울 + 빛 반사로 하얗게 보임)에 쓴다.
 *   - 'head'     : 머리 전체에 걸쳐 같은 과정이 반복되며 흰머리가 늘어나는 몽타주(s7).
 *     굵은 머리채 5가닥만 그리고(점 무리 금지) 각자 다른 시점에 색이 바뀐다.
 *
 *  `pigmentCellProgress`(0~1, follicle 전용 - 색소 세포 2개의 크기·불투명도. 1=가득,
 *  0=사라짐), `transparentProgress`(0~1, follicle·strand 공용 - 머리카락 색. 0=색소로
 *  진하게 물듦, 1=색소가 빠져 색이 옅어지고 불투명도도 낮아져 "속이 비치는" 상태),
 *  `reflectProgress`(0~1, strand 전용 - 투명한 머리카락 속에 공기 방울이 맺히고 빛이
 *  반사되며 흰색으로 보이게 됨 - transparentProgress=1을 전제로 이어받는다), `grayProgress`
 *  (0~1, head 전용 - 5가닥 머리채가 순서대로 하나씩 진한 색에서 옅은 색으로 바뀜)를
 *  독립 진행도로 받는다. 전부 undefined/0이면 해당 레이어가 초기 상태(색소 가득/진한 머리)로
 *  그려진다.
 *
 *  색소 세포는 CellMergeDiagram류처럼 몇 개의 큰 도형으로만 표현하고(오케스트레이터 지시 -
 *  "작은 점을 잔뜩 뿌리지 않는다"), 모낭·두피는 사실적으로 그리지 않는다(빌더 정의파일
 *  "신체 표현은 최소한으로" 원칙).
 *
 *  "색소를 만드는 세포가 줄어들며 색이 옅어지고, 속이 빈 구조 때문에 빛이 산란해 다른 색으로
 *  보인다"는 구조를 갖는 다른 노화·색 변화 소재(눈썹, 수염, 동물 털색 등) 전반 재사용
 *  가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** 두 hex 색을 t(0~1)로 보간해 hex 문자열을 반환한다. 반환값을 다시 보간에 넣지 않는다
 *  (BruiseDiagram과 동일 원칙 - 49화 rgb() 재보간 버그 재발 방지). */
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const HAIR_FOLLICLE_VB_W = 400;
export const HAIR_FOLLICLE_VB_H = 650;
export const HAIR_STRAND_VB = 320;
export const HAIR_HEAD_VB_W = 480;
export const HAIR_HEAD_VB_H = 320;

/** 흰머리 계열 로컬 색(테마 C에 회색 톤이 없어 이 소재 전용으로 둔다, BruiseDiagram의
 *  vesselColor와 같은 관례) */
const HAIR_GRAY = '#D7DBE2';

/* ---------------- follicle 좌표 ---------------- */
const F_CX = 200;
const F_SKIN_Y = 170;
const F_TUBE_HALF = 46;
const F_BULB_TOP_Y = 380;
const F_BULB_CY = 470;
const F_BULB_RX = 95;
const F_BULB_BOTTOM_Y = 550;
const F_HAIR_TOP_Y = 100;
const F_HAIR_HALF = 15;

/** 호출 씬이 "모낭 = 머리카락 뿌리" 라벨을 얹는 화면 좌표 앵커(follicle 전용, viewBox 좌표계).
 *  머리카락 기둥(F_HAIR_TOP_Y=100)보다 위(y=50)에 둬서 라벨과 머리카락이 겹치지 않게 한다 -
 *  라벨 기본색(C.ink)과 진한 머리카락 색(hairColorDark 기본값도 C.ink)이 같아서 겹치면
 *  다크온다크로 글자가 안 보이는 결함이 실측(스틸 선점검)에서 발견됐다. */
export const HAIR_FOLLICLE_ROOT_PT = { x: F_CX, y: 50 };
/** 색소 세포 라벨 앵커 */
export const HAIR_PIGMENT_LABEL_PT = { x: F_CX, y: F_BULB_BOTTOM_Y + 60 };

const PIGMENT_L = { x: F_CX - 55, y: 488 };
const PIGMENT_R = { x: F_CX + 55, y: 488 };
const PIGMENT_BASE_R = 32;

const FOLLICLE_D = `M ${F_CX - F_TUBE_HALF} ${F_SKIN_Y}
  L ${F_CX - F_TUBE_HALF} ${F_BULB_TOP_Y}
  Q ${F_CX - F_BULB_RX} ${F_BULB_TOP_Y + 40} ${F_CX - F_BULB_RX} ${F_BULB_CY}
  Q ${F_CX - F_BULB_RX} ${F_BULB_CY + 62} ${F_CX} ${F_BULB_BOTTOM_Y}
  Q ${F_CX + F_BULB_RX} ${F_BULB_CY + 62} ${F_CX + F_BULB_RX} ${F_BULB_CY}
  Q ${F_CX + F_BULB_RX} ${F_BULB_TOP_Y + 40} ${F_CX + F_TUBE_HALF} ${F_BULB_TOP_Y}
  L ${F_CX + F_TUBE_HALF} ${F_SKIN_Y} Z`;

/* ---------------- strand 좌표 ---------------- */
const S_CX = HAIR_STRAND_VB / 2;
const S_CY = HAIR_STRAND_VB / 2;
const S_R = 120;
const BUBBLES = [
  { x: S_CX - 30, y: S_CY + 14, r: 16, at: 0 },
  { x: S_CX + 36, y: S_CY + 36, r: 12, at: 0.24 },
  { x: S_CX + 2, y: S_CY - 42, r: 10, at: 0.46 },
];

/* ---------------- head 좌표 ---------------- */
const H_BASE_Y = 260;
const LOCK_XS = [80, 180, 250, 320, 400];
const LOCK_APEX_DY = [140, 190, 150, 210, 150];
const LOCK_THRESHOLDS = [0.06, 0.3, 0.5, 0.68, 0.86];
const LOCK_HALF = 24;

export interface HairFollicleDiagramProps {
  mode?: 'follicle' | 'strand' | 'head';
  width: number;
  x?: number;
  y?: number;
  /** 0~1. follicle 전용 - 색소 세포 2개의 크기·불투명도(1=가득, 0=사라짐) */
  pigmentCellProgress?: number;
  /** 0~1. follicle·strand 공용 - 머리카락 색(0=진하게 물듦, 1=색소 빠져 옅고 속이 비침) */
  transparentProgress?: number;
  /** 0~1. strand 전용 - 공기 방울 + 빛 반사로 흰색으로 보이게 됨 */
  reflectProgress?: number;
  /** 0~1. head 전용 - 머리채 5가닥이 순서대로 흰색으로 바뀜 */
  grayProgress?: number;
  stroke?: string;
  fill?: string;
  pigmentColor?: string;
  hairColorDark?: string;
  hairColorLight?: string;
  bubbleColor?: string;
  style?: React.CSSProperties;
}

export const HairFollicleDiagram: React.FC<HairFollicleDiagramProps> = ({
  mode = 'follicle', width, x = 0, y = 0,
  pigmentCellProgress = 0, transparentProgress = 0, reflectProgress = 0, grayProgress = 0,
  stroke = C.ink, fill = C.paper,
  pigmentColor = C.browning, hairColorDark = C.ink, hairColorLight = HAIR_GRAY,
  bubbleColor = C.waterCool,
  style,
}) => {
  const hairT = clamp01(transparentProgress);
  const hairFillColor = lerpColor(hairColorDark, hairColorLight, smooth(hairT));
  // s4/s5 스틸 선점검에서 "색소 없음(투명)" 원이 왼쪽 원과 크게 다르지 않게 보이는 결함
  // 발견 - 0.62였던 감쇠 계수를 0.82로 올려 transparentProgress=1에서 뚜렷하게 옅어 보이게
  // 한다(reflectProgress가 이어받아 다시 불투명해지는 s5 연출은 그대로 유지된다).
  const hairOpacity = 1 - 0.82 * hairT;

  if (mode === 'strand') {
    const reflT = clamp01(reflectProgress);
    const whiteT = smooth(reflT) * 0.85;
    const strandColor = lerpColor(hairFillColor, '#FFFFFF', whiteT);
    const strandOpacity = Math.min(1, hairOpacity + (1 - hairOpacity) * whiteT);
    return (
      <svg
        viewBox={`0 0 ${HAIR_STRAND_VB} ${HAIR_STRAND_VB}`}
        width={width} height={width}
        style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
        shapeRendering="geometricPrecision"
      >
        <circle cx={S_CX} cy={S_CY} r={S_R} fill={strandColor} opacity={strandOpacity}
          stroke={stroke} strokeWidth={SW} />
        {BUBBLES.map((b, i) => {
          const bt = clamp01((reflT - b.at) / 0.32);
          if (bt <= 0.01) return null;
          return (
            <circle key={i} cx={b.x} cy={b.y} r={b.r * (0.5 + 0.5 * smooth(bt))}
              fill={bubbleColor} opacity={0.55 * bt} stroke={stroke} strokeWidth={SW_THIN * 0.4} />
          );
        })}
        {reflT > 0.15 ? (
          <path
            d={`M ${S_CX - 60} ${S_CY - 70} A 90 90 0 0 1 ${S_CX + 34} ${S_CY - 92}`}
            fill="none" stroke="#FFFFFF" strokeWidth={SW_THIN} strokeLinecap="round"
            opacity={clamp01((reflT - 0.15) / 0.5) * 0.9}
          />
        ) : null}
      </svg>
    );
  }

  if (mode === 'head') {
    return (
      <svg
        viewBox={`0 0 ${HAIR_HEAD_VB_W} ${HAIR_HEAD_VB_H}`}
        width={width} height={(width * HAIR_HEAD_VB_H) / HAIR_HEAD_VB_W}
        style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
        shapeRendering="geometricPrecision"
      >
        <line x1={20} y1={H_BASE_Y} x2={HAIR_HEAD_VB_W - 20} y2={H_BASE_Y}
          stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" opacity={0.4} />
        {LOCK_XS.map((lx, i) => {
          const gt = clamp01((grayProgress - LOCK_THRESHOLDS[i]) / 0.22);
          const lockColor = lerpColor(hairColorDark, hairColorLight, smooth(gt));
          const apexY = H_BASE_Y - LOCK_APEX_DY[i];
          const d = `M ${lx - LOCK_HALF} ${H_BASE_Y} Q ${lx} ${apexY} ${lx + LOCK_HALF} ${H_BASE_Y} Z`;
          return <path key={i} d={d} fill={lockColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} />;
        })}
      </svg>
    );
  }

  // mode === 'follicle'
  const pig = clamp01(pigmentCellProgress);
  const pigOpacity = pig > 0.01 ? clamp01(pig * 1.3) : 0;
  const pigScale = 0.4 + 0.6 * smooth(pig);

  return (
    <svg
      viewBox={`0 0 ${HAIR_FOLLICLE_VB_W} ${HAIR_FOLLICLE_VB_H}`}
      width={width} height={(width * HAIR_FOLLICLE_VB_H) / HAIR_FOLLICLE_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 피부 표면선 (사실적 피부 질감 없음) */}
      <line x1={0} y1={F_SKIN_Y} x2={F_CX - F_TUBE_HALF - 8} y2={F_SKIN_Y}
        stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
      <line x1={F_CX + F_TUBE_HALF + 8} y1={F_SKIN_Y} x2={HAIR_FOLLICLE_VB_W} y2={F_SKIN_Y}
        stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />

      {/* 모낭 관 + 뿌리 벌브 */}
      <path d={FOLLICLE_D} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />

      {/* 머리카락 한 가닥 - 벌브 안쪽에서 피부 위까지 이어진다 */}
      <rect x={F_CX - F_HAIR_HALF} y={F_HAIR_TOP_Y} width={F_HAIR_HALF * 2}
        height={510 - F_HAIR_TOP_Y} rx={F_HAIR_HALF}
        fill={hairFillColor} opacity={hairOpacity} stroke={stroke} strokeWidth={SW_THIN * 0.5} />

      {/* 색소 세포 2개 - 큰 도형만(점 무리 금지) */}
      {pigOpacity > 0.01 ? (
        <>
          <g transform={`translate(${PIGMENT_L.x} ${PIGMENT_L.y}) scale(${pigScale})`} opacity={pigOpacity}>
            <circle r={PIGMENT_BASE_R} fill={pigmentColor} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
          </g>
          <g transform={`translate(${PIGMENT_R.x} ${PIGMENT_R.y}) scale(${pigScale})`} opacity={pigOpacity}>
            <circle r={PIGMENT_BASE_R} fill={pigmentColor} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
          </g>
        </>
      ) : null}
    </svg>
  );
};

export default HairFollicleDiagram;
