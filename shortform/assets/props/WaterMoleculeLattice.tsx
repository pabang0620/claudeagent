/** 물 분자 배열 다이어그램 - "빽빽하게 채워진 액체 배열"에서 "육각형 모양으로 성기게 벌어진
 *  격자(고체 얼음)"로 바뀌는 모습을 분자(점)와 육각 고리(결합선)로 보여준다.
 *
 *  `crystallizeProgress` 0~1 하나로 전체 상태를 결정하는 순수 함수 컴포넌트
 *  (`CellMergeDiagram`/`HiccupDiagram`과 같은 원칙 - 시간 곡선은 호출 씬이 만든다).
 *  분자 위치는 전부 모듈 로드 시 1회 계산되는 고정 배열이라 Math.random 을 쓰지 않는다
 *  (원칙 3) - 액체 상태는 촘촘한 격자에 인덱스 기반 결정적 지터를 준 배치, 얼음 상태는
 *  실제 물 분자 배열의 근거인 육각형 벌집(허니콤) 격자 꼭짓점 배치를 쓴다. 두 배치는 점 개수가
 *  같아 인덱스별로 그대로 보간(lerp)된다 - 얼음 쪽 배치가 액체보다 훨씬 넓게 퍼져 있어
 *  progress 가 올라갈수록 전체 바운딩박스가 커지는 것 자체가 "부피가 커진다"는 결론(s4)의
 *  복선이 된다.
 *
 *  "분자·입자가 조밀한 배열에서 규칙적인 결정 격자로 바뀐다"는 구조를 갖는 다른 소재(결정화,
 *  상전이 전반)에도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

interface Pt { x: number; y: number }

/** 육각형(flat-top) 6 꼭짓점 */
function hexVerts(cx: number, cy: number, r: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return out;
}

const HEX_R = 78;
const COLS = 3;
const ROWS = 2;
const DX = HEX_R * 1.5;
const DY = HEX_R * Math.sqrt(3);

/** 육각형 셀들(꼭짓점 6개 배열, 원점 기준 - 아직 센터링 전) */
const RAW_HEX_CELLS: Pt[][] = (() => {
  const cells: Pt[][] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cx = col * DX;
      const cy = row * DY + (col % 2 === 1 ? DY / 2 : 0);
      cells.push(hexVerts(cx, cy, HEX_R));
    }
  }
  return cells;
})();

/** 전체 꼭짓점의 centroid(중심) - 얼음/액체 배치, 육각 고리 셀 전부 이 값만큼 원점으로 이동 */
const ICE_CENTROID: Pt = (() => {
  const all = RAW_HEX_CELLS.flat();
  return {
    x: all.reduce((s, p) => s + p.x, 0) / all.length,
    y: all.reduce((s, p) => s + p.y, 0) / all.length,
  };
})();

/** 육각 고리 셀 - centroid 를 원점으로 이동해 ICE_POINTS 와 같은 좌표계를 쓴다 */
const HEX_CELLS: Pt[][] = RAW_HEX_CELLS.map((cell) =>
  cell.map((p) => ({ x: p.x - ICE_CENTROID.x, y: p.y - ICE_CENTROID.y })));

/** 꼭짓점 중복 제거(공유 꼭짓점은 분자 하나로 취급) - 얼음(고체) 분자 위치 */
const ICE_POINTS: Pt[] = (() => {
  const map = new Map<string, Pt>();
  for (const cell of HEX_CELLS) {
    for (const p of cell) {
      const key = `${Math.round(p.x)}_${Math.round(p.y)}`;
      if (!map.has(key)) map.set(key, p);
    }
  }
  return Array.from(map.values());
})();

/** 같은 개수만큼 촘촘한 격자에 인덱스 기반 결정적 지터를 준 배치 - 액체 분자 위치 */
const LIQUID_POINTS: Pt[] = (() => {
  const n = ICE_POINTS.length;
  const spacing = HEX_R * 0.6;
  const cols = Math.ceil(Math.sqrt(n));
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jx = Math.sin(i * 12.9898) * spacing * 0.22;
    const jy = Math.cos(i * 78.233) * spacing * 0.22;
    pts.push({ x: col * spacing + jx, y: row * spacing + jy });
  }
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return pts.map((p) => ({ x: p.x - cx, y: p.y - cy }));
})();

/** 전체를 감싸는 뷰박스 크기(얼음 상태 바운딩박스 실측 390x338 + 여백 - 실측보다 훨씬 크게
 *  잡으면 분자 점이 화면에서 작고 성기게 보인다, general-ep17 s3 프레임 검수로 확인) */
const VB = 460;

export interface WaterMoleculeLatticeProps {
  width: number;
  x: number;
  y: number;
  /** 0 = 빽빽한 액체 배열, 1 = 성기게 벌어진 육각 얼음 격자 */
  crystallizeProgress: number;
  moleculeColor?: string;
  bondColor?: string;
  style?: React.CSSProperties;
}

export const WaterMoleculeLattice: React.FC<WaterMoleculeLatticeProps> = ({
  width, x, y, crystallizeProgress, moleculeColor = C.waterCool, bondColor = C.ink, style,
}) => {
  const p = smooth(crystallizeProgress);
  const hexOpacity = clamp01((crystallizeProgress - 0.6) / 0.4);

  const pts = ICE_POINTS.map((ice, i) => {
    const liq = LIQUID_POINTS[i];
    return { x: lerp(liq.x, ice.x, p), y: lerp(liq.y, ice.y, p) };
  });

  return (
    <svg
      viewBox={`${-VB / 2} ${-VB / 2} ${VB} ${VB}`}
      width={width} height={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 육각 고리 - 결정화가 진행될수록 서서히 드러난다("육각형 모양으로 배열") */}
      {hexOpacity > 0.01 ? (
        <g stroke={bondColor} strokeWidth={SW_THIN * 0.55} opacity={hexOpacity * 0.55} fill="none">
          {HEX_CELLS.map((cell, ci) => (
            <path key={ci} d={`M ${cell.map((v) => `${v.x} ${v.y}`).join(' L ')} Z`} />
          ))}
        </g>
      ) : null}

      {/* 분자(점) - 액체 <-> 얼음 위치를 보간 */}
      <g fill={moleculeColor} stroke={bondColor} strokeWidth={2}>
        {pts.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={16} />
        ))}
      </g>
    </svg>
  );
};

export default WaterMoleculeLattice;
