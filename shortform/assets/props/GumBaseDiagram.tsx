/** "물에 녹는 성분(단맛·향)은 침에 씻겨 빠져나가고, 물에 안 녹는 성분(껌 베이스 그물망)은
 *  그대로 남는다 -> 그런데 기름을 만나면 그 그물망이 풀어진다"는 3단 대비를 보여주는 껌
 *  단면 다이어그램(general-ep75, 껌은 씹어도 안 녹는 이유). REGISTRY 확인 완료 -
 *  SoapMicelleDiagram(general-ep18, 물/기름이 서로 밀어내며 안 섞이는 구조)은 "두 물질이
 *  안 섞인다"는 다른 개념이라 이 화의 "한쪽은 녹고 한쪽은 안 녹는" 선택적 용해 대비에는
 *  맞지 않아 새로 만들었다. DoughDiagram(글루텐 그물)·StarchGranuleDiagram(물방울-입자
 *  흡수/방출)과 같은 원칙(독립 progress, 이전 단계가 1인 상태를 전제로 이어받음,
 *  undefined/0이면 그 레이어를 안 그림)을 따른다.
 *
 *  "작은 점을 여러 개 뿌리지 않는다" 원칙에 따라 껌 베이스 그물망은 굵은 곡선 5가닥으로만,
 *  단맛·향 입자는 큰 다이아몬드 3개로만, 물방울·기름방울도 큼직한 물방울 도형 각 2~3개로만
 *  그린다(오케스트레이터 지시).
 *
 *   - flavorDissolve : 0~1. 물방울 3개가 각각 위에서 떨어져(0~0.5, 입자별 시차) 단맛·향
 *     다이아몬드 3개에 닿아 줄어들며 사라지고(0.35~1, 입자별 시차), 물방울은 다이아몬드를
 *     지나 계속 아래로 흘러가며 옅어진다("맛이 침에 녹아 빠져나감"). 그물망(껌 베이스)은
 *     이 단계에서 아무 변화 없이 항상 그대로 그려진다. s2/s3용.
 *   - baseInsoluble  : 0~1. flavorDissolve=1(맛이 이미 다 빠진 상태)을 전제로, 물방울 1개가
 *     옆에서 들어와 그물망 표면 위를 스치듯 지나가지만(0~0.6) 그물망 구조·블롭 윤곽은 전혀
 *     바뀌지 않고 그대로 남는다("물에는 안 녹는 재질") - 물방울은 표면을 스친 뒤 그대로
 *     비껴 나가며 옅어진다(0.55~1). s4용.
 *   - oilDissolve    : 0~1. flavorDissolve=1·baseInsoluble=1을 전제로, 기름방울 2개가
 *     좌우에서 그물망 쪽으로 다가와(0~0.4) 닿으면 그물 가닥이 점선처럼 성글어지며 서로
 *     벌어지고(0.25~1, strokeDasharray 확대), 블롭 아래쪽 가장자리에서 처짐(drip) 3개가
 *     자라나며 늘어진다(0.3~1) - "기름에는 잘 풀어진다"를 표현한다. s6용.
 *  전부 undefined/0이면 "그물망(껌 베이스) + 다이아몬드 3개(단맛·향)가 그대로 있는 매끈한
 *  껌 단면"만 보이는 정지 다이어그램이 된다(s1의 "계속 씹히는 껌"에도 그대로 재사용).
 *
 *  "물질이 녹는 성질" 개념을 다루는 다른 소재(코팅·캡슐 성분이 선택적으로 녹는 약, 세제의
 *  특정 얼룩만 지우는 원리 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const GUM_VB_W = 640;
export const GUM_VB_H = 580;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 껌 조각 단면 윤곽 - 매끈한 비대칭 블롭(참고 이미지 없이 손으로 그린 도형이라
 *  원칙 0-1 벡터화 대상이 아니다, DoughDiagram.DOUGH_D와 동일한 제작 방식) */
const BLOB_D = `
  M 130,300
  C 110,190 190,110 320,104
  C 452,98 546,168 542,290
  C 538,404 460,468 330,470
  C 200,472 118,414 130,300
  Z
`;

/** 그물망(껌 베이스) - 세로 3가닥 + 가로 2가닥, 완만한 곡선(DoughDiagram의 글루텐 그물과
 *  동일 기법). 그물은 항상 그려진다(껌 베이스는 늘 존재하는 물리적 구조라 별도 reveal
 *  progress를 두지 않는다) */
const NET_V = [230, 320, 410];
const NET_H = [230, 370];
const NET_TOP = 160;
const NET_BOTTOM = 430;
const NET_LEFT = 190;
const NET_RIGHT = 460;

function wavyV(x: number, amp: number) {
  const midY = NET_TOP + (NET_BOTTOM - NET_TOP) / 2;
  return `M ${x},${NET_TOP} C ${x - amp},${NET_TOP + (midY - NET_TOP) * 0.7} ${x + amp},${midY + (NET_BOTTOM - midY) * 0.3} ${x},${NET_BOTTOM}`;
}
function wavyH(y: number, amp: number) {
  const midX = NET_LEFT + (NET_RIGHT - NET_LEFT) / 2;
  return `M ${NET_LEFT},${y} C ${NET_LEFT + (midX - NET_LEFT) * 0.7},${y - amp} ${midX + (NET_RIGHT - midX) * 0.3},${y + amp} ${NET_RIGHT},${y}`;
}

function diamond(cx: number, cy: number, r: number) {
  return `M ${cx},${cy - r} L ${cx + r * 0.72},${cy} L ${cx},${cy + r} L ${cx - r * 0.72},${cy} Z`;
}

function teardrop(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy - r * 1.3}
    C ${cx + r} ${cy - r * 0.2} ${cx + r} ${cy + r * 0.7} ${cx} ${cy + r}
    C ${cx - r} ${cy + r * 0.7} ${cx - r} ${cy - r * 0.2} ${cx} ${cy - r * 1.3}
    Z`;
}

/** 단맛·향 입자 3개 자리 (그물 칸 안에 겹치지 않게 배치) */
const FLAVOR_PTS = [
  { x: 262, y: 250, r: 30 },
  { x: 388, y: 262, r: 28 },
  { x: 322, y: 392, r: 28 },
];

/** flavorDissolve용 물방울 3개 - 각각 대응하는 입자 바로 위에서 떨어져 닿은 뒤 계속
 *  아래로 흘러가며 사라진다 */
const FLAVOR_DROPS = [
  { startX: 262, startY: 30, exitY: 540 },
  { startX: 388, startY: 44, exitY: 552 },
  { startX: 322, startY: 20, exitY: 560 },
];

/** oilDissolve용 기름방울 2개 - 좌우에서 그물망 쪽으로 다가온다 */
const OIL_DROPS = [
  { startX: -60, startY: 300, toX: 205, toY: 300 },
  { startX: 700, startY: 300, toX: 445, toY: 300 },
];

/** oilDissolve용 처짐(drip) 3개 - 블롭 아래 가장자리에서 자라난다 */
const DRIP_PTS = [
  { x: 230, y: 462, rMax: 34 },
  { x: 330, y: 470, rMax: 40 },
  { x: 420, y: 460, rMax: 30 },
];

export interface GumBaseDiagramProps {
  /** 화면상 폭(px). viewBox(640x580) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 단맛·향이 물방울에 씻겨 빠져나가는 진행도. s2/s3용 */
  flavorDissolve?: number;
  /** 0~1. flavorDissolve=1을 전제로, 물이 표면을 스치지만 그물망은 안 녹는 진행도. s4용 */
  baseInsoluble?: number;
  /** 0~1. flavorDissolve=1·baseInsoluble=1을 전제로, 기름에 그물망이 풀어지는 진행도. s6용 */
  oilDissolve?: number;
  stroke?: string;
  blobColor?: string;
  netColor?: string;
  flavorColor?: string;
  waterColor?: string;
  oilColor?: string;
  style?: React.CSSProperties;
}

export const GumBaseDiagram: React.FC<GumBaseDiagramProps> = ({
  width, x = 0, y = 0,
  flavorDissolve = 0, baseInsoluble = 0, oilDissolve = 0,
  stroke = C.ink, blobColor = C.goldSoft, netColor = C.inkSoft, flavorColor = C.gold,
  waterColor = C.waterCool, oilColor = C.browning,
  style,
}) => {
  const height = (width * GUM_VB_H) / GUM_VB_W;
  const flavorP = clamp01(flavorDissolve);
  const insolubleP = clamp01(baseInsoluble);
  const oilP = clamp01(oilDissolve);

  // s6: 그물이 성글어지는 정도 - 가닥이 더 크게 휘고(amp) 점선 간격이 벌어진다(dash)
  const netLooseAmp = oilP * 30;
  const netDashOn = lerp(0, 16, smooth(oilP));
  const netDashOff = lerp(0, 34, smooth(oilP));
  const netOpacity = lerp(1, 0.62, smooth(oilP));

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${GUM_VB_W} ${GUM_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 껌 조각 단면 */}
        <path d={BLOB_D} fill={blobColor} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />

        {/* 껌 베이스 그물망 - 항상 그려짐. oilDissolve가 오르면 성글어진다 */}
        <g fill="none" stroke={netColor} strokeWidth={SW_THIN} strokeLinecap="round" opacity={netOpacity}>
          {NET_V.map((vx, i) => (
            <path
              key={`nv${i}`} d={wavyV(vx, 18 + netLooseAmp)}
              strokeDasharray={netDashOn > 0.01 ? `${netDashOn} ${netDashOff}` : undefined}
            />
          ))}
          {NET_H.map((hy, i) => (
            <path
              key={`nh${i}`} d={wavyH(hy, 14 + netLooseAmp)}
              strokeDasharray={netDashOn > 0.01 ? `${netDashOn} ${netDashOff}` : undefined}
            />
          ))}
        </g>

        {/* 단맛·향 입자 3개 - 물방울에 닿으면 줄어들며 사라진다 */}
        {FLAVOR_PTS.map((pt, i) => {
          const localP = clamp01((flavorP - i * 0.18) / (1 - i * 0.18));
          const shrinkP = smooth(clamp01((localP - 0.4) / 0.6));
          const s = 1 - shrinkP;
          if (s <= 0.02) return null;
          return (
            <path
              key={`flavor${i}`} d={diamond(pt.x, pt.y, pt.r * s)} fill={flavorColor}
              stroke={stroke} strokeWidth={SW_THIN * 0.75} opacity={s}
            />
          );
        })}

        {/* flavorDissolve: 물방울 3개 - 낙하 -> 입자에 닿아 흡수 -> 계속 흘러가며 소멸 */}
        {flavorP > 0.001 && FLAVOR_DROPS.map((d, i) => {
          const pt = FLAVOR_PTS[i];
          const localP = clamp01((flavorP - i * 0.18) / (1 - i * 0.18));
          const fallP = smooth(clamp01(localP / 0.4));
          const flowP = clamp01((localP - 0.4) / 0.6);
          const cy = fallP < 1
            ? lerp(d.startY, pt.y, fallP)
            : lerp(pt.y, d.exitY, flowP);
          const op = fallP < 0.02 ? 0 : lerp(1, 0, smooth(flowP));
          if (op <= 0.02) return null;
          return (
            <path
              key={`drop${i}`} d={teardrop(d.startX, cy, 22)} fill={waterColor}
              stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={op}
            />
          );
        })}

        {/* baseInsoluble: 물방울 1개가 표면을 스치듯 지나가지만 그물망은 그대로 남는다 */}
        {insolubleP > 0.001 && (() => {
          const enterP = smooth(clamp01(insolubleP / 0.55));
          const exitP = clamp01((insolubleP - 0.55) / 0.45);
          const cx = enterP < 1 ? lerp(70, 500, enterP) : lerp(500, 600, exitP);
          const cy = 150 - Math.sin(Math.min(1, enterP) * Math.PI) * 26;
          const op = lerp(1, 0, exitP);
          if (op <= 0.02) return null;
          return (
            <path
              d={teardrop(cx, cy, 24)} fill={waterColor}
              stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={op}
            />
          );
        })()}

        {/* oilDissolve: 기름방울 2개가 그물망 쪽으로 다가온다 */}
        {oilP > 0.001 && OIL_DROPS.map((d, i) => {
          const enterP = smooth(clamp01(oilP / 0.4));
          const cx = lerp(d.startX, d.toX, enterP);
          const cy = lerp(d.startY, d.toY, enterP);
          return (
            <ellipse
              key={`oil${i}`} cx={cx} cy={cy} rx={26} ry={22} fill={oilColor}
              stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={0.92}
            />
          );
        })}

        {/* oilDissolve: 아래쪽 가장자리 처짐(drip) - 그물이 풀어지며 늘어지는 표현 */}
        {oilP > 0.001 && DRIP_PTS.map((d, i) => {
          const dripP = smooth(clamp01((oilP - 0.3) / 0.7));
          const len = d.rMax * dripP;
          if (len <= 0.5) return null;
          return (
            <path
              key={`drip${i}`}
              d={teardrop(d.x, d.y + len * 0.6, Math.max(8, len * 0.6))}
              fill={blobColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={0.95}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default GumBaseDiagram;
