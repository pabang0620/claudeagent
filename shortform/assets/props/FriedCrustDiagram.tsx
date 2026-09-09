/** 튀김옷 단면 다이어그램(general-ep51, 튀김이 유독 바삭한 이유). "반죽 속 물이 뜨거운 기름
 *  열에 순식간에 수증기로 빠져나가고, 그 자리에 빈 구멍이 남아 마른 껍질이 된다 -> 그 마른
 *  구조가 씹으면 파삭 부서진다 -> 시간이 지나면 구멍에 수분이 되돌아온다"는 4단 인과를 하나의
 *  단면(겉 크러스트 + 속 촉촉한 재료)으로 보여준다.
 *
 *  `props/DoughDiagram.tsx`와 같은 원칙(독립 레이어를 각각 progress로 노출, undefined/0이면
 *  그 레이어를 안 그림) + Meat.tsx/DoughDiagram.bakeProgress의 오버레이 불투명도 보간 기법을
 *  그대로 가져와 크러스트가 마르며 짙어지는 색 변화에 적용했다.
 *
 *  구멍은 오케스트레이터 지시대로 큰 원 4개로만 표현한다(작은 구멍을 촘촘하게 뚫지 않는다).
 *  물방울도 같은 4자리에서 시작해 사라지며 그 자리에 구멍이 남는 방식이라 "물이 빠진 자리에
 *  구멍이 남는다"는 인과가 좌표로 직접 드러난다. 기름 방울 등 추가 장식은 넣지 않는다
 *  (오케스트레이터 지시 - 기름 방울을 화면에 잔뜩 뿌리지 않는다).
 *
 *   - steamProgress  : 0~1. 크러스트 안 물방울 4개가 순서대로 줄어들며 사라지고, 그 자리 위로
 *     작은 김(증기) 고리가 떠올라 옅어진다. s3용.
 *   - poreProgress    : 0~1. steamProgress로 물이 빠진 같은 4자리에 빈 구멍(큰 원)이 순서대로
 *     나타나고, 크러스트 밴드 전체가 옅은 반죽색에서 마른 갈색으로 짙어진다(도넛 모양 오버레이
 *     불투명도 보간 - 속 재료는 가려지지 않는다). s4용.
 *   - crackProgress   : 0~1. 크러스트 위쪽에 지그재그 균열선이 리빌되고(0~0.4), 균열 틈이
 *     밝게 벌어지며(0.35~1) 작은 부스러기 조각 2개가 살짝 튀어나간다(0.55~1). poreProgress=1을
 *     전제로 한다. s5용.
 *   - resoakProgress  : 0~1. 이미 있는 구멍 4개 안쪽에 옅은 물색이 차오른다(물기가 되돌아옴).
 *     poreProgress=1을 전제로 한다. s7용.
 *  전부 undefined/0이면 "구멍도 균열도 없는 매끈한 생반죽 덩어리"만 보이는 정지 다이어그램이
 *  된다 - s1의 튀김 반죽 소품으로 그대로 재사용했다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const FRIED_CRUST_VB_W = 640;
export const FRIED_CRUST_VB_H = 620;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 겉 크러스트 바깥 윤곽 - 매끈한 비대칭 블롭(참고 이미지 없이 손으로 그린 도형이라
 *  원칙 0-1 벡터화 대상이 아니다, DoughDiagram.DOUGH_D와 동일한 제작 방식) */
const CRUST_D = `
  M 300,78
  C 445,64 548,168 556,308
  C 564,444 468,542 320,548
  C 176,554 78,452 82,310
  C 86,172 168,96 300,78
  Z
`;

/** 속 재료 윤곽 - 크러스트보다 한 단계 작은 블롭, 같은 중심 */
const FILLING_D = `
  M 320,168
  C 402,160 465,222 468,310
  C 471,396 408,458 322,463
  C 238,468 176,405 174,310
  C 172,224 234,175 320,168
  Z
`;

/** 물방울(steam) -> 구멍(pore) 자리 4곳. 크러스트 밴드 안(속 재료 바깥, 겉 윤곽 안쪽)에
 *  고르게 대각선 4방향으로 배치해 서로도, 속 재료 경계와도 겹치지 않는다 */
const PORE_PTS = [
  { x: 453, y: 443, r: 34 }, // 남동
  { x: 187, y: 443, r: 32 }, // 남서
  { x: 187, y: 177, r: 30 }, // 북서
  { x: 453, y: 177, r: 33 }, // 북동
];

/** 균열선 - 북서/북동 구멍 사이(x 221~419) 빈 공간에만 위치시켜 구멍과 겹치지 않는다 */
const CRACK_D = 'M 270,95 L 302,140 L 266,170 L 312,208';
const CRACK_CHIPS = [
  { x: 302, y: 140, dx: -22, dy: -16, rot: -18 },
  { x: 266, y: 170, dx: -26, dy: 6, rot: 14 },
];

function chipPath(size: number) {
  return `M 0,${-size} L ${size * 0.9},${size * 0.6} L ${-size * 0.9},${size * 0.6} Z`;
}

export interface FriedCrustDiagramProps {
  /** 화면상 폭(px). viewBox(640x620) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 물방울 4개가 순서대로 줄어들며 증기가 떠오르는 진행도. s3용 */
  steamProgress?: number;
  /** 0~1. 같은 4자리에 구멍이 남고 크러스트가 마른 갈색으로 짙어지는 진행도. s4용 */
  poreProgress?: number;
  /** 0~1. 균열이 갈라지고 부스러기가 튀는 진행도. poreProgress=1을 전제로 한다. s5용 */
  crackProgress?: number;
  /** 0~1. 구멍 안쪽으로 물기가 되돌아오는 진행도. poreProgress=1을 전제로 한다. s7용 */
  resoakProgress?: number;
  stroke?: string;
  doughColor?: string;
  driedColor?: string;
  fillingColor?: string;
  dropletColor?: string;
  style?: React.CSSProperties;
}

export const FriedCrustDiagram: React.FC<FriedCrustDiagramProps> = ({
  width, x = 0, y = 0,
  steamProgress = 0, poreProgress = 0, crackProgress = 0, resoakProgress = 0,
  stroke = C.ink, doughColor = C.browningSoft, driedColor = C.browning,
  fillingColor = C.cream, dropletColor = C.waterCool,
  style,
}) => {
  const height = (width * FRIED_CRUST_VB_H) / FRIED_CRUST_VB_W;
  const steamP = clamp01(steamProgress);
  const poreP = clamp01(poreProgress);
  const crackP = clamp01(crackProgress);
  const resoakP = clamp01(resoakProgress);

  // s4: 구멍 등장(순서대로) + 크러스트 밴드가 마른 갈색으로 짙어짐(도넛 오버레이)
  const holeReveal = clamp01(poreP / 0.55);
  const brownP = clamp01((poreP - 0.1) / 0.9);

  // s5: 균열 리빌 -> 틈 벌어짐 -> 부스러기 튐
  const crackReveal = clamp01(crackP / 0.4);
  const gapOpen = clamp01((crackP - 0.35) / 0.65);
  const chipPop = clamp01((crackP - 0.55) / 0.45);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${FRIED_CRUST_VB_W} ${FRIED_CRUST_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 겉 크러스트 밑칠 - 아직 안 마른 옅은 반죽색 */}
        <path d={CRUST_D} fill={doughColor} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />

        {/* 마른 갈색 오버레이 - 겉 윤곽 + 속 윤곽을 evenodd로 겹쳐 크러스트 밴드만 짙어지고
            속 재료는 가려지지 않는다(도넛 클립, DoughDiagram.bakeProgress와 동일 원칙) */}
        {brownP > 0.001 ? (
          <path d={`${CRUST_D} ${FILLING_D}`} fillRule="evenodd" fill={driedColor} opacity={brownP * 0.92} />
        ) : null}

        {/* 속 재료 - 항상 같은 촉촉한 톤 */}
        <path d={FILLING_D} fill={fillingColor} stroke={stroke} strokeWidth={SW_THIN} />

        {/* 물방울 4개 - 순서대로 줄어들며 사라지고, 그 자리 위로 증기 고리가 떠오름 */}
        {steamP > 0.001 ? (
          <g>
            {PORE_PTS.map((pt, i) => {
              // local=0(steamP가 이 물방울의 시작 임계치 i*0.15에 아직 못 미친 상태)이면
              // "아직 안 사라짐" = 물방울이 원래 크기 그대로 보여야 한다. 여기서 조기
              // return 하면 임계치 전까지 물방울 자체가 안 보이는 결함이 생긴다(2026-09-02
              // out/stills-preview/f350 실측으로 발견 - 4개 중 2개가 아예 안 보였다).
              const local = clamp01((steamP - i * 0.15) / (1 - i * 0.15));
              const dropR = pt.r * 0.52 * (1 - local);
              const ringT = clamp01((local - 0.15) / 0.85);
              const ringR = lerp(9, 30, ringT);
              const ringOpacity = (1 - ringT) * 0.85;
              const ringY = pt.y - ringT * 76;
              return (
                <g key={`drop${i}`}>
                  {dropR > 0.6 ? (
                    <circle cx={pt.x} cy={pt.y} r={dropR} fill={dropletColor} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
                  ) : null}
                  {ringOpacity > 0.02 && local > 0.02 ? (
                    <circle cx={pt.x} cy={ringY} r={ringR} fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.7} opacity={ringOpacity} />
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}

        {/* 빈 구멍 4개 - steamProgress로 물이 빠진 같은 자리에 남는다 */}
        {holeReveal > 0.001 ? (
          <g>
            {PORE_PTS.map((pt, i) => {
              const local = clamp01((holeReveal - i * 0.18) / (1 - i * 0.18));
              if (local <= 0.001) return null;
              const s = 0.4 + 0.6 * local;
              const soak = resoakP > 0.001 ? clamp01((resoakP - i * 0.12) / (1 - i * 0.12)) : 0;
              return (
                <g key={`hole${i}`} style={{ opacity: local }} transform={`translate(${pt.x} ${pt.y}) scale(${s})`}>
                  <circle cx={0} cy={0} r={pt.r} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.85} />
                  {soak > 0.02 ? (
                    <circle cx={0} cy={0} r={pt.r * 0.62 * soak} fill={dropletColor} opacity={0.8 * soak} />
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}

        {/* 균열 - 리빌 -> 틈 벌어짐(밝은 넓은 선) -> 부스러기 튐 */}
        {crackReveal > 0.001 ? (
          <g>
            {gapOpen > 0.02 ? (
              <path
                d={CRACK_D} fill="none" stroke={C.paper} strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={4 + gapOpen * 16} opacity={gapOpen}
              />
            ) : null}
            <path
              d={CRACK_D} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={SW_THIN} strokeDasharray={1} strokeDashoffset={1 - crackReveal} pathLength={1}
            />
            {chipPop > 0.02 ? CRACK_CHIPS.map((c, i) => (
              <g
                key={`chip${i}`}
                style={{ opacity: chipPop }}
                transform={`translate(${c.x + c.dx * chipPop} ${c.y + c.dy * chipPop}) rotate(${c.rot * chipPop}) scale(${0.6 + 0.4 * chipPop})`}
              >
                <path d={chipPath(13)} fill={driedColor} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
              </g>
            )) : null}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default FriedCrustDiagram;
