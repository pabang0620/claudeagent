/** 눈물방울 단면(대부분 물, 그 안에 작은 소금 알갱이 소수가 녹아 있음)을 보여주는 소품
 *  (울고 나면 입가가 짭짤한 이유 - "눈물은 거의 다 물이지만 소금기가 녹아 있다").
 *
 *  REGISTRY 확인 완료 - `WaterMoleculeLattice`는 "조밀한 액체 -> 육각형 고체 결정 격자"로
 *  상전이(결정화)를 보여주는 다이어그램이라, 이 화처럼 "액체 방울 안에 소량의 다른 성분이
 *  녹아 있다"(용해)는 구조와 목적이 다르다(결정화 vs 용해). `PalmSweatDiagram`의
 *  `dropletShape`(물방울 윤곽 path 공식)과 `SaltCycleDiagram`의 `SaltDiamond`(소금 결정
 *  글리프 - 다이아몬드 + 흰 하이라이트 선)를 그대로 재사용해 새 좌표를 눈대중으로 그리지
 *  않았다(원칙 0-1 - 이미 검증된 파라메트릭 공식 재사용).
 *
 *  채널 원칙(작은 점을 여러 개 뿌리지 않는다, 오케스트레이터 지시)에 따라 소금 알갱이는
 *  최대 2개까지만 그린다. 물 입자도 점 무리로 표시하지 않고 옅은 반투명 채움 하나로만
 *  "대부분 물"을 표현한다.
 *
 *  `saltRevealProgress`(0~1) 하나로 전체 상태가 정해지는 순수 함수(CellMergeDiagram과
 *  같은 원칙) - 0이면 투명한 물방울만, 1이면 소금 알갱이 2개가 모두 드러난다.
 *
 *  "액체 방울 안에 소량의 용해 성분이 녹아 있다"는 구조를 갖는 다른 체액 소재(땀·혈장 등)
 *  재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

export const TEAR_VB_W = 640;
export const TEAR_VB_H = 800;

/** PalmSweatDiagram.dropletShape 과 동일한 물방울 윤곽 path 공식(재사용, 좌표 재발명 없음).
 *  w/h 를 받아 <path>+하이라이트 <ellipse> 를 반환한다(자체 <svg> 래퍼 없음 - 호출측 <svg> 안에서 쓴다). */
function dropletOutline(w: number, h: number, stroke: string, fill: string, strokeWidth: number) {
  return (
    <>
      <path
        d={`M ${w / 2} 0
            C ${w * 0.1} ${h * 0.42} 0 ${h * 0.6} 0 ${h * 0.76}
            A ${w / 2} ${w / 2} 0 0 0 ${w} ${h * 0.76}
            C ${w} ${h * 0.6} ${w * 0.9} ${h * 0.42} ${w / 2} 0 Z`}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
      />
      <ellipse cx={w * 0.36} cy={h * 0.6} rx={w * 0.09} ry={w * 0.15} fill={C.paper} opacity={0.55} />
    </>
  );
}

/** SaltCycleDiagram.SaltDiamond 과 동일한 소금 결정 글리프 공식(재사용). */
function SaltDiamond({
  x, y, r, appear, color, stroke,
}: { x: number; y: number; r: number; appear: number; color: string; stroke: string }) {
  const a = clamp01(appear);
  if (a <= 0.001) return null;
  const s = 0.4 + 0.6 * a;
  return (
    <g style={{ opacity: a }} transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={`M 0 ${-r} L ${r * 0.82} 0 L 0 ${r} L ${-r * 0.82} 0 Z`}
        fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.75} strokeLinejoin="round"
      />
      <line x1={-r * 0.3} y1={-r * 0.28} x2={r * 0.2} y2={-r * 0.05} stroke="#FFFFFF" strokeWidth={SW_THIN * 0.5} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

export interface TearDropDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 0~1. 소금 알갱이(최대 2개)가 순서대로 드러나는 정도 */
  saltRevealProgress?: number;
  stroke?: string;
  waterFill?: string;
  saltColor?: string;
  style?: React.CSSProperties;
}

export const TearDropDiagram: React.FC<TearDropDiagramProps> = ({
  width, x, y, saltRevealProgress = 0,
  stroke = C.ink, waterFill = C.water, saltColor = C.waterCool, style,
}) => {
  const h = (width * TEAR_VB_H) / TEAR_VB_W;
  const p = clamp01(saltRevealProgress);
  // 두 알갱이를 시차를 두고 순서대로 드러낸다(스태거) - Math.random 없이 고정 구간 계산
  const salt1 = smooth((p - 0) / 0.55);
  const salt2 = smooth((p - 0.4) / 0.55);

  const dropW = TEAR_VB_W * 0.7;
  const dropH = dropW * 1.3;
  const dropX = (TEAR_VB_W - dropW) / 2;
  const dropY = (TEAR_VB_H - dropH) / 2 - 20;

  return (
    <svg
      width={width} height={h} viewBox={`0 0 ${TEAR_VB_W} ${TEAR_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <g transform={`translate(${dropX} ${dropY})`}>
        {dropletOutline(dropW, dropH, stroke, waterFill, 10)}
        {/* 소금 알갱이는 물방울 아래쪽 절반 안쪽에만 둔다(윤곽선에 겹치지 않도록) */}
        <SaltDiamond x={dropW * 0.42} y={dropH * 0.62} r={30} appear={salt1} color={saltColor} stroke={stroke} />
        <SaltDiamond x={dropW * 0.62} y={dropH * 0.78} r={26} appear={salt2} color={saltColor} stroke={stroke} />
      </g>
    </svg>
  );
};
