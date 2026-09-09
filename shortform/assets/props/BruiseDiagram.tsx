/** "피부 속 작은 혈관이 터져 피가 못 빠져나가고 살 안에 고이고(웅덩이), 며칠에 걸쳐 그 피 속
 *  헤모글로빈이 단계적으로 분해되면서 색이 빨강 -> 보라 -> 초록 -> 노랑 순으로 바뀌다가
 *  옅어져 사라진다"는 구조를 보여주는 범용 다이어그램(멍이 시간 지나며 색 변하는 이유,
 *  general-ep61 신설).
 *
 *  REGISTRY 확인 완료 - `WoundCrossSectionDiagram`(general-ep38)·`WoundHealDiagram`
 *  (general-ep54)은 둘 다 "표면 절개 상처"를 다뤄 딱지·신경 노출 구조가 이 화의 "혈관이
 *  터져 피부 속에 피가 고이고 그 색이 여러 단계로 바뀐다"는 주제와 근본적으로 달라(딱지·
 *  절개선이 없다, 대신 색이 연속적으로 바뀌는 것 자체가 핵심 그림이다) 새로 만들었다. 같은
 *  원형 단면 시각 문법(피부 원 + 안쪽 옅은 조직 톤, CX/CY/R_OUTER/R_INNER을 그 두 컴포넌트와
 *  동일하게 재사용)은 유지해 "단면을 볼 때는 이 원 그림"이라는 채널 관례를 지킨다.
 *
 *  `mode`('surface'|'cross-section')로 s1(팔 겉면에 이미 든 멍 자국을 보는 장면)과
 *  s3~s7(단면에서 피가 고이고 색이 바뀌는 과정)을 한 컴포넌트로 커버한다(HiccupDiagram과
 *  같은 "단일 컴포넌트로 여러 화면 커버" 설계). `poolProgress`(0~1, cross-section 전용 -
 *  혈관 아래에서 웅덩이가 커지며 피가 고임), `healProgress`(0~1, 색 진행도 - 0=빨강,
 *  ~0.22=보라, ~0.58=초록, 1=노랑이며 그 이후 옅어짐. **네 단계 색은 인접 단계와 섞여
 *  보이지 않도록 뚜렷이 구분한다** - 오케스트레이터 지시), `cellsProgress`(0~1,
 *  cross-section 전용 - 백혈구 2개가 바깥에서 웅덩이 쪽으로 다가옴)를 독립 진행도로 받는다.
 *  전부 색소 입자를 점으로 뿌리지 않고 색 자체(연속 보간)로 표현한다(49화 단풍잎과 같은
 *  접근, "징그럽다" 재발 방지 - 오케스트레이터 지시). 웅덩이는 정원이 아니라 고정 좌표
 *  10점을 부드러운 곡선으로 이은 얼룩 모양이라 실제 멍처럼 보인다(Math.random 미사용,
 *  원칙 3).
 *
 *  네 단계 색은 실제 빛의 색 팔레트인 `LightScatterDiagram`의 `LIGHT_RED`/`LIGHT_VIOLET`/
 *  `LIGHT_GREEN`/`LIGHT_YELLOW`를 그대로 재사용한다(REGISTRY 우선 원칙 - 채널 팔레트 `C`
 *  토큰에는 보라/초록 계열이 없고, 이미 등록된 4색이 정확히 이 화에 필요한 색 그대로라
 *  새 색을 추가하지 않았다). 반환값을 다시 보간에 넣지 않는 hex->hex lerp를 쓴다(49화
 *  rgb() 재보간 버그 재발 방지 - VocalResonanceDiagram과 동일 원칙).
 *
 *  "고여 있는 무언가의 성분이 시간에 따라 여러 단계를 거쳐 색이 순서대로 바뀐다"는 구조를
 *  갖는 다른 소재(식물 잎의 변색, 산화 반응 등) 재사용 가능성이 있어 에피소드 로컬이 아니라
 *  라이브러리에 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { LIGHT_GREEN, LIGHT_RED, LIGHT_VIOLET, LIGHT_YELLOW } from './LightScatterDiagram';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export const BRUISE_VB_W = 300;
export const BRUISE_VB_H = 300;

const CX = 150;
const CY = 150;
const R_OUTER = 122;
const R_INNER = 98;

/* ---------------- 색 진행도 (빨강 -> 보라 -> 초록 -> 노랑) ---------------- */

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** 두 hex 색을 t(0~1)로 보간해 hex 문자열을 반환한다. 반환값을 다시 보간에 넣지 않는다. */
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** healProgress 0~1을 4단계 색(빨강[0] -> 보라[0.22] -> 초록[0.58] -> 노랑[1])으로 매핑한다.
 *  단계 사이는 연속 보간되지만, 각 정지점(stop) 자체는 서로 다른 색상이라 인접 단계끼리
 *  섞여 애매해 보이지 않는다(오케스트레이터 지시 - "네 단계 색이 뚜렷이 구분되게"). */
const BRUISE_STOPS: Array<[number, string]> = [
  [0, LIGHT_RED],
  [0.22, LIGHT_VIOLET],
  [0.58, LIGHT_GREEN],
  [1, LIGHT_YELLOW],
];

export function bruiseColorAt(healProgress: number): string {
  const t = clamp01(healProgress);
  for (let i = 0; i < BRUISE_STOPS.length - 1; i++) {
    const [t0, c0] = BRUISE_STOPS[i];
    const [t1, c1] = BRUISE_STOPS[i + 1];
    if (t <= t1 || i === BRUISE_STOPS.length - 2) {
      const localT = t1 === t0 ? 0 : clamp01((t - t0) / (t1 - t0));
      return lerpColor(c0, c1, localT);
    }
  }
  return BRUISE_STOPS[BRUISE_STOPS.length - 1][1];
}

/** healProgress가 끝에 다다르면(0.82~1) 웅덩이 색이 옅어지며 "서서히 사라진다". */
function bruiseFadeOpacity(healProgress: number): number {
  const t = clamp01(healProgress);
  return 1 - 0.7 * smooth((t - 0.82) / 0.18);
}

/* ---------------- 웅덩이(얼룩) 모양 - 고정 10점을 부드러운 곡선으로 잇는다 ---------------- */

const BLOB_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
const BLOB_RADII = [1.0, 0.86, 1.08, 0.82, 1.1, 0.88, 1.05, 0.8, 1.12, 0.9];

function blotchPathD(cx: number, cy: number, baseR: number): string {
  const n = BLOB_ANGLES.length;
  const pts = BLOB_ANGLES.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const r = baseR * BLOB_RADII[i];
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => (
    { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  );
  const start = mid(pts[n - 1], pts[0]);
  let d = `M ${start.x} ${start.y}`;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const m = mid(cur, next);
    d += ` Q ${cur.x} ${cur.y} ${m.x} ${m.y}`;
  }
  return `${d} Z`;
}

/* ---------------- 백혈구 (점 무리 아닌 큰 원 2개, "징그럽다" 재발 방지) ---------------- */

function WhiteCell({
  cx, cy, r, appear, stroke, fill, nucleusColor,
}: {
  cx: number; cy: number; r: number; appear: number; stroke: string; fill: string; nucleusColor: string;
}) {
  if (appear <= 0.001) return null;
  const s = 0.5 + 0.5 * appear;
  return (
    <g style={{ opacity: appear }} transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle r={r} fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
      <circle r={r * 0.42} fill={nucleusColor} opacity={0.85} />
    </g>
  );
}

/* ---------------- 좌표 ---------------- */

/** 혈관(cross-section 전용) - 안쪽 위쪽에 자리한 짧은 캡슐 */
const VESSEL_CX = CX;
const VESSEL_CY = 100;
const VESSEL_W = 76;
const VESSEL_H = 24;
/** 호출 씬이 "혈관" 라벨을 얹는 화면 좌표 앵커(viewBox 좌표계) */
export const BRUISE_VESSEL_PT = { x: VESSEL_CX, y: VESSEL_CY - 22 };

/** 웅덩이 중심 - 모드별로 다르다(cross-section은 혈관 바로 아래, surface는 살결 밴드 중앙) */
const POOL_CENTER_CROSS = { x: CX, y: 182 };
const POOL_CENTER_SURFACE = { x: CX, y: CY };
const POOL_MAX_R = 58;

/** 백혈구 시작/도착 좌표 (cross-section 전용, 웅덩이 좌우 가장자리로 모여든다) */
const CELL_L_START = { x: 66, y: 214 };
const CELL_L_TARGET = { x: 116, y: 196 };
const CELL_R_START = { x: 234, y: 214 };
const CELL_R_TARGET = { x: 184, y: 196 };
/** 호출 씬이 "백혈구" 라벨을 얹는 화면 좌표 앵커 - 원(R_OUTER) 바로 아래 바깥쪽에 둬서
 *  백혈구가 웅덩이 가장자리까지 다 모여들어도 라벨과 겹치지 않는다(실측 결함 수정 -
 *  기존 y=226은 CELL_TARGET(y~196)과 너무 가까워 백혈구가 도착하면 글자를 가렸다). */
export const BRUISE_CELL_LABEL_PT = { x: CX, y: CY + R_OUTER + 40 };

/** surface 모드의 살결 밴드(팔 일부를 단순한 도형 하나로만 표현, 사실적 피부 묘사 없음) */
const SKIN_BAND = { x: 20, y: 78, w: 260, h: 144, rx: 72 };

export interface BruiseDiagramProps {
  mode?: 'surface' | 'cross-section';
  width: number;
  x?: number;
  y?: number;
  /** 0~1. cross-section 전용 - 혈관에서 터진 피가 웅덩이로 고이며 커짐 */
  poolProgress?: number;
  /** 0~1. 멍 색 진행도(0=빨강, ~0.22=보라, ~0.58=초록, 1=노랑 이후 옅어짐) */
  healProgress?: number;
  /** 0~1. cross-section 전용 - 백혈구 2개가 웅덩이 쪽으로 다가옴 */
  cellsProgress?: number;
  stroke?: string;
  fill?: string;
  vesselColor?: string;
  cellColor?: string;
  style?: React.CSSProperties;
}

export const BruiseDiagram: React.FC<BruiseDiagramProps> = ({
  mode = 'cross-section', width, x = 0, y = 0,
  poolProgress = 1, healProgress = 0, cellsProgress = 0,
  stroke = C.ink, fill = C.paper,
  vesselColor = '#E0483A', // CheekFlushDiagram의 혈관 색과 동일 톤(채널 내 "혈관" 관례)
  cellColor = C.gold,
  style,
}) => {
  const pool = clamp01(poolProgress);
  const poolT = smooth(pool);
  const cells = clamp01(cellsProgress);
  const color = bruiseColorAt(healProgress);
  const fade = bruiseFadeOpacity(healProgress);

  const center = mode === 'cross-section' ? POOL_CENTER_CROSS : POOL_CENTER_SURFACE;
  const blotchD = blotchPathD(center.x, center.y, POOL_MAX_R);
  const blotchOpacity = (0.5 + 0.4 * poolT) * fade;

  const cellLStagger = clamp01((cells - 0) / 1);
  const cellRStagger = clamp01((cells - 0.12) / 0.88);
  const cellLPos = {
    x: CELL_L_START.x + (CELL_L_TARGET.x - CELL_L_START.x) * smooth(cellLStagger),
    y: CELL_L_START.y + (CELL_L_TARGET.y - CELL_L_START.y) * smooth(cellLStagger),
  };
  const cellRPos = {
    x: CELL_R_START.x + (CELL_R_TARGET.x - CELL_R_START.x) * smooth(cellRStagger),
    y: CELL_R_START.y + (CELL_R_TARGET.y - CELL_R_START.y) * smooth(cellRStagger),
  };

  return (
    <svg
      viewBox={`0 0 ${BRUISE_VB_W} ${BRUISE_VB_H}`}
      width={width} height={(width * BRUISE_VB_H) / BRUISE_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id="bruise-inner-clip">
          {mode === 'cross-section' ? (
            <circle cx={CX} cy={CY} r={R_INNER} />
          ) : (
            <rect x={SKIN_BAND.x} y={SKIN_BAND.y} width={SKIN_BAND.w} height={SKIN_BAND.h} rx={SKIN_BAND.rx} />
          )}
        </clipPath>
      </defs>

      {mode === 'cross-section' ? (
        <>
          {/* 단면 원 (WoundCrossSectionDiagram/WoundHealDiagram과 같은 규약) */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill={fill} stroke={stroke} strokeWidth={SW} />
          <circle cx={CX} cy={CY} r={R_INNER} fill={C.coralSoft} opacity={0.18} />
        </>
      ) : (
        /* 팔 일부를 단순한 도형 하나로만 표현(사실적 피부 묘사 없음) */
        <rect
          x={SKIN_BAND.x} y={SKIN_BAND.y} width={SKIN_BAND.w} height={SKIN_BAND.h} rx={SKIN_BAND.rx}
          fill={fill} stroke={stroke} strokeWidth={SW}
        />
      )}

      {/* 웅덩이(얼룩) - 색 자체로 진행도를 표현(점 무리 없음) */}
      {pool > 0.01 ? (
        <g clipPath="url(#bruise-inner-clip)">
          <g transform={`translate(${center.x} ${center.y}) scale(${poolT}) translate(${-center.x} ${-center.y})`}>
            <path d={blotchD} fill={color} opacity={blotchOpacity} />
          </g>
        </g>
      ) : null}

      {mode === 'cross-section' ? (
        <>
          {/* 혈관 -> 웅덩이 연결선 */}
          <line
            x1={VESSEL_CX} y1={VESSEL_CY + VESSEL_H / 2} x2={center.x} y2={center.y - POOL_MAX_R * 0.5}
            stroke={vesselColor} strokeWidth={SW_THIN * 0.55} opacity={poolT * 0.6}
          />
          {/* 혈관(항상 그려짐) */}
          <rect
            x={VESSEL_CX - VESSEL_W / 2} y={VESSEL_CY - VESSEL_H / 2} width={VESSEL_W} height={VESSEL_H}
            rx={VESSEL_H / 2} fill={vesselColor} stroke={stroke} strokeWidth={SW_THIN * 0.6}
          />
          {/* 백혈구 2개 */}
          <WhiteCell
            cx={cellLPos.x} cy={cellLPos.y} r={17} appear={cells > 0.02 ? Math.min(1, cells / 0.85) : 0}
            stroke={stroke} fill={C.paper} nucleusColor={cellColor}
          />
          <WhiteCell
            cx={cellRPos.x} cy={cellRPos.y} r={17} appear={cells > 0.14 ? Math.min(1, (cells - 0.14) / 0.85) : 0}
            stroke={stroke} fill={C.paper} nucleusColor={cellColor}
          />
        </>
      ) : null}
    </svg>
  );
};

export default BruiseDiagram;
