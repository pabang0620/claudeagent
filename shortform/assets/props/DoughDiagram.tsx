/** "작은 생물이 먹이를 먹고 기체를 만들어내고, 그 기체가 그물 구조 안에 갇혀 전체 부피가
 *  커진다"는 발효 구조를 보여주는 반죽 단면 다이어그램(general-ep27, 빵이 부풀어 오르는 이유).
 *  CellMergeDiagram·MagnetDiagram과 같은 원칙(독립 레이어를 각각 progress로 노출, undefined면
 *  그 레이어를 안 그림) + Meat.tsx의 `sear` 오버레이 기법(생색 -> 구운색 연속 보간)을 그대로
 *  가져와 오븐 굽기 단계에 적용했다.
 *
 *  "신체 표현은 최소한으로" 절과 동일한 정신으로, 효모는 촘촘한 점 무리가 아니라 크고 단순한
 *  도형 2마리(몸통 + 눈 2개 + 미소, WetSoilAerosolDiagram의 미생물과 같은 설계)로, 당분은
 *  작은 다이아몬드 2~3개로, 이산화탄소 기포는 큰 원 3개로만 그린다(반죽 안에 점을 여러 개
 *  흩뿌리는 방식은 쓰지 않는다 - builder 원칙, "징그럽다" 재발 방지).
 *
 *   - riseProgress : 0~1. 효모 2마리가 당분을 먹으며(0~0.45, 당분 다이아몬드가 하나씩
 *     줄어들다 사라짐) 기포 3개가 생겨나 절반 크기까지 자란다(0.45~1). s3용.
 *   - netProgress   : 0~1. 반죽을 가로지르는 그물(글루텐)이 순서대로 드러나고(0~0.45),
 *     이미 있던 기포 3개가 그 칸 안에 갇혀 나머지 절반만큼 더 커진다(0.25~1).
 *     riseProgress=1(효모가 이미 기포를 만든 상태)을 전제로 한다. s4용.
 *   - swellProgress : 0~1. 반죽 덩어리 전체가 풍선처럼 커진다(바깥 스케일만 커짐, 내부
 *     구조는 그대로 유지). riseProgress=1·netProgress=1을 전제로 한다. s5용.
 *   - bakeProgress  : 0~1. 오븐 열로 한 번 더 살짝 부풀고(0~0.3), 표면이 옅은 반죽색에서
 *     진한 갈색으로 굳어간다(0.15~1, Meat.sear와 동일한 오버레이 불투명도 보간). 갈색이
 *     짙어질수록 안쪽 기포·그물이 크러스트에 덮여 옅어진다("겉이 구워지며 속이 가려진다").
 *     swellProgress=1을 전제로 한다. s6용.
 *  전부 undefined/0이면 "효모·기포·그물이 없는 매끈한 생반죽 덩어리"만 보이는 정지
 *  다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const DOUGH_VB_W = 700;
export const DOUGH_VB_H = 680;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 반죽 덩어리 윤곽 - 매끈한 비대칭 블롭(참고 이미지 없이 손으로 그린 도형이라 원칙 0-1
 *  벡터화 대상이 아니다, Meat.BODY_D와 동일한 제작 방식) */
const DOUGH_D = `
  M 130,380
  C 96,280 150,168 300,140
  C 430,116 580,150 610,260
  C 636,352 604,464 486,526
  C 372,584 208,574 148,492
  C 104,432 108,420 130,380
  Z
`;

/** 효모 2마리 (WetSoilAerosolDiagram의 미생물과 동일 설계 - 몸통+눈2개+미소). 아래쪽에
 *  넓게 벌려 두어, 위쪽에 자리잡은 기포 3개와 겹치지 않는다(2026-09-02 검수 발견 - 기존
 *  좌표는 기포가 최대 크기로 자랐을 때 효모 얼굴을 덮어버려 "눈이 두 겹"으로 보이는
 *  결함이 있었다) */
const YEAST_PTS = [
  { x: 210, y: 470, r: 36 },
  { x: 460, y: 460, r: 32 },
];

/** 당분 입자 2개 (효모 옆, 먹히면서 줄어듦) - 작은 다이아몬드 */
const SUGAR_PTS = [
  { x: 175, y: 420, r: 20 },
  { x: 505, y: 410, r: 18 },
];

/** 이산화탄소 기포 3개 - 효모(아래쪽)와 분리된 윗쪽 영역에 배치해 겹치지 않는다 */
const BUBBLE_PTS = [
  { x: 255, y: 250, rMax: 56 },
  { x: 390, y: 250, rMax: 46 },
  { x: 250, y: 365, rMax: 58 },
];

/** 글루텐 그물 - 세로 3가닥 + 가로 2가닥, 완만한 곡선(직선 격자보다 "쫄깃한 그물" 느낌).
 *  기포 3개가 각자 다른 칸 안에 들어오도록 좌표를 기포 배치에 맞춰 잡았다 */
const NET_V = [190, 320, 450];
const NET_H = [300, 420];
const NET_TOP = 190;
const NET_BOTTOM = 520;
const NET_LEFT = 160;
const NET_RIGHT = 560;

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

function Yeast({
  x, y, r, appear, stroke, fill,
}: { x: number; y: number; r: number; appear: number; stroke: string; fill: string }) {
  if (appear <= 0.001) return null;
  const s = 0.5 + 0.5 * appear;
  return (
    <g style={{ opacity: appear }} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.92} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={-r * 0.3} cy={-r * 0.08} r={r * 0.11} fill={stroke} />
      <circle cx={r * 0.3} cy={-r * 0.08} r={r * 0.11} fill={stroke} />
      <path
        d={`M ${-r * 0.26} ${r * 0.3} Q 0 ${r * 0.48} ${r * 0.26} ${r * 0.3}`}
        fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.7} strokeLinecap="round"
      />
    </g>
  );
}

export interface DoughDiagramProps {
  /** 화면상 폭(px). viewBox(700x680) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 효모가 당분을 먹고(0~0.45) 기포가 생겨 절반 크기까지 자라는(0.45~1) 진행도. s3용 */
  riseProgress?: number;
  /** 0~1. 그물이 드러나고(0~0.45) 기포가 갇혀 나머지 절반만큼 더 커지는(0.25~1) 진행도.
   *  riseProgress=1을 전제로 한다. s4용 */
  netProgress?: number;
  /** 0~1. 반죽 전체가 풍선처럼 커지는 진행도. riseProgress=1·netProgress=1을 전제로 한다. s5용 */
  swellProgress?: number;
  /** 0~1. 오븐에서 한 번 더 부풀고(0~0.3) 표면이 갈색으로 굳는(0.15~1) 진행도.
   *  swellProgress=1을 전제로 한다. s6용 */
  bakeProgress?: number;
  stroke?: string;
  doughColor?: string;
  bakedColor?: string;
  yeastColor?: string;
  style?: React.CSSProperties;
}

export const DoughDiagram: React.FC<DoughDiagramProps> = ({
  width, x = 0, y = 0,
  riseProgress = 0, netProgress = 0, swellProgress = 0, bakeProgress = 0,
  stroke = C.ink, doughColor = C.browningSoft, bakedColor = C.browning, yeastColor = C.gold,
  style,
}) => {
  const height = (width * DOUGH_VB_H) / DOUGH_VB_W;
  const riseP = clamp01(riseProgress);
  const netP = clamp01(netProgress);
  const swellP = clamp01(swellProgress);
  const bakeP = clamp01(bakeProgress);

  // s3: 효모 등장 -> 당분 먹기 -> 기포 생성(절반 크기까지)
  const yeastAppear = clamp01(riseP / 0.3);
  const eatP = clamp01((riseP - 0.15) / 0.4);
  const bubbleStage1 = clamp01((riseP - 0.45) / 0.55);

  // s4: 그물 등장 -> 기포가 갇혀 더 커짐(나머지 절반)
  const netLineP = clamp01(netP / 0.45);
  const bubbleStage2 = clamp01((netP - 0.25) / 0.75);

  const bubbleRadiusRatio = smooth(bubbleStage1) * (0.55 + 0.45 * smooth(bubbleStage2));

  // s6: 오븐 - 추가 팽창 + 갈변
  const puffP = clamp01(bakeP / 0.3);
  const brownP = clamp01((bakeP - 0.15) / 0.85);
  const innerFade = 1 - brownP * 0.85;

  const overallScale = (1 + 0.3 * smooth(swellP)) * (1 + 0.07 * smooth(puffP));

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style,
      }}
    >
      <div
        style={{
          width, height, transform: `scale(${overallScale})`, transformOrigin: '50% 100%',
        }}
      >
        <svg viewBox={`0 0 ${DOUGH_VB_W} ${DOUGH_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
          {/* 반죽 덩어리 밑칠 */}
          <path d={DOUGH_D} fill={doughColor} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />

          {/* 당분 입자 - 먹히면서 줄어들다 사라짐 */}
          {SUGAR_PTS.map((pt, i) => {
            const localEat = clamp01((eatP - i * 0.25) / (1 - i * 0.25));
            const s = 1 - localEat;
            if (s <= 0.02 || riseP <= 0.001) return null;
            return (
              <path
                key={`sugar${i}`} d={diamond(pt.x, pt.y, pt.r * s)} fill={C.gold} stroke={stroke}
                strokeWidth={SW_THIN * 0.7} opacity={s}
              />
            );
          })}

          {/* 효모 2마리 */}
          {YEAST_PTS.map((pt, i) => (
            <Yeast key={`yeast${i}`} x={pt.x} y={pt.y} r={pt.r} appear={yeastAppear} stroke={stroke} fill={yeastColor} />
          ))}

          {/* 글루텐 그물 - 세로 3 + 가로 2, 순서대로 드러남 */}
          {netLineP > 0.001 ? (
            <g fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.85} strokeLinecap="round" opacity={innerFade}>
              {NET_V.map((vx, i) => {
                const reveal = clamp01((netLineP - i * 0.12) / (1 - i * 0.12));
                if (reveal <= 0.001) return null;
                return (
                  <path
                    key={`nv${i}`} d={wavyV(vx, 20)} strokeDasharray={1} strokeDashoffset={1 - reveal}
                    pathLength={1}
                  />
                );
              })}
              {NET_H.map((hy, i) => {
                const reveal = clamp01((netLineP - 0.2 - i * 0.15) / (1 - 0.2 - i * 0.15));
                if (reveal <= 0.001) return null;
                return (
                  <path
                    key={`nh${i}`} d={wavyH(hy, 16)} strokeDasharray={1} strokeDashoffset={1 - reveal}
                    pathLength={1}
                  />
                );
              })}
            </g>
          ) : null}

          {/* 이산화탄소 기포 3개 */}
          {bubbleRadiusRatio > 0.02 ? (
            <g opacity={innerFade}>
              {BUBBLE_PTS.map((pt, i) => (
                <circle
                  key={`bubble${i}`} cx={pt.x} cy={pt.y} r={pt.rMax * bubbleRadiusRatio}
                  fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.75} opacity={0.92}
                />
              ))}
            </g>
          ) : null}

          {/* 굽기 오버레이 - Meat.sear 와 동일한 오버레이 불투명도 보간 */}
          {brownP > 0.001 ? (
            <path d={DOUGH_D} fill={bakedColor} opacity={brownP * 0.9} />
          ) : null}
        </svg>
      </div>
    </div>
  );
};

export default DoughDiagram;
