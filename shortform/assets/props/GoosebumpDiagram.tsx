/** "소름 돋는 이유"(general-ep08) 신설 소품. 피부 단면 클로즈업(모낭·입모근) +
 *  조상 실루엣 비교 패널을 한 컴포넌트로 묶는다. REGISTRY 3절 확인 완료 - 기존
 *  `props/`에 피부·체모 반응을 그린 자산이 없었다(Hand.tsx는 손가락 주름/혈관이라
 *  구조가 다르다).
 *
 *  두 레이어를 독립 progress 로 노출한다(CellMergeDiagram/StarlightDiagram과 같은 설계):
 *   - contractProgress(0~1): 0 = 근육 이완(털이 눕고 피부 평평), 1 = 근육 수축(털이
 *     곧게 서고 피부가 살짝 부풀어 돌기가 생김). 털은 모낭(bulb)을 중심으로 회전하고,
 *     입모근(coral 띠)은 모낭 쪽 고정점과 털 중간 지점을 잇는데 progress가 커질수록
 *     굵어져(조여지는 느낌) 눈에 보인다.
 *   - vestigeProgress(0~1): 조상 실루엣(온몸이 털로 덮인 인물)의 등장 정도를 직접
 *     의미한다(0=안 보임, 1=완전히 보임). "잠깐 나타났다 사라짐" 같은 등장-소멸 곡선은
 *     이 컴포넌트가 만들지 않는다 - 호출부(scenes.tsx)가 progress()를 두 번 조합해
 *     올라갔다 내려오는 envelope 를 만들어 넘긴다(다른 소품과 동일한 관례).
 *
 *  두 레이어 모두 undefined/0 이면 안 그린다 - s3(진행 애니메이션만)·s5(같은 애니메이션
 *  재생, 실루엣 없음)·s4(실루엣 포함)를 이 컴포넌트 하나로 커버한다.
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const RAD = Math.PI / 180;

export interface GoosebumpDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0 = 이완(눕고 평평), 1 = 수축(서고 돌기 생김) */
  contractProgress?: number;
  /** 0 = 조상 실루엣 안 보임, 1 = 완전히 보임(호출부가 등장/소멸 곡선을 만들어 넘긴다) */
  vestigeProgress?: number;
  stroke?: string;
  fill?: string;
  /** 입모근(수축하는 근육) 색 */
  accent?: string;
  style?: React.CSSProperties;
}

export const GOOSEBUMP_VB_W = 620;
export const GOOSEBUMP_VB_H = 520;
/** 실루엣 없이 그릴 때(피부 단면만) 실제 그림이 채우는 영역의 중심 x(viewBox 기준).
 *  호출부가 화면 중앙에 맞춰 배치할 때 이 값으로 보정한다(실루엣이 있으면 GOOSEBUMP_VB_W/2 사용). */
export const GOOSEBUMP_SKIN_ONLY_CENTER_X = 230;
const VB_W = GOOSEBUMP_VB_W;
const VB_H = GOOSEBUMP_VB_H;
const FOLLICLE_X = 220;
const SKIN_Y = 220;
const BULB_TOP_Y = 348;
const BULB_CY = 372;

export const GoosebumpDiagram: React.FC<GoosebumpDiagramProps> = ({
  width, x = 0, y = 0, contractProgress = 0, vestigeProgress = 0,
  stroke = C.ink, fill = C.paper, accent = C.coral, style,
}) => {
  const c = clamp01(contractProgress);
  const v = clamp01(vestigeProgress);

  // 피부 돌기(mound) - 수축할수록 볼록해진다
  const bumpHeight = 8 + 46 * c;
  const skinPath =
    `M 30 ${SKIN_Y} L ${FOLLICLE_X - 92} ${SKIN_Y} ` +
    `Q ${FOLLICLE_X} ${SKIN_Y - bumpHeight * 2} ${FOLLICLE_X + 92} ${SKIN_Y} ` +
    `L 430 ${SKIN_Y}`;
  const dermisPath = `${skinPath} L 430 470 L 30 470 Z`;

  // 털 - 모낭(BULB_TOP_Y)을 축으로 회전. 이완(c=0)일 때 크게 눕고, 수축(c=1)일 때 곧게 선다
  const leanDeg = 52 - 46 * c;
  const hairLen = 150;
  const dx = Math.sin(leanDeg * RAD);
  const dy = -Math.cos(leanDeg * RAD);
  const hairBaseX = FOLLICLE_X;
  const hairBaseY = BULB_TOP_Y;
  const hairTipX = hairBaseX + hairLen * dx;
  const hairTipY = hairBaseY + hairLen * dy;

  // 입모근(arrector pili) - 피부 쪽 고정 지점(A)과 털대 위 지점(B)을 잇는 띠.
  // 수축할수록 굵어지고(조여짐) A-B 거리가 짧아진다(털이 서면서 B가 A 쪽으로 붙는다).
  const muscleAX = FOLLICLE_X - 74;
  const muscleAY = SKIN_Y - 4;
  const muscleBX = hairBaseX + hairLen * 0.42 * dx;
  const muscleBY = hairBaseY + hairLen * 0.42 * dy;
  const muscleWidth = 9 + 11 * c;

  // 조상 실루엣(온몸이 털로 덮인 인물) - 우측 패널, vestigeProgress로만 보인다.
  // 몸통은 타원 하나로 단순화하고, 그 타원 둘레를 따라 방사형으로 뻗는 작은 삼각 돌기
  // (furSpikes)를 붙여 "털로 덮여 있다"를 표현한다(원 둘레 각도 기반 - 결정론적).
  const silCx = 505;
  const silHeadCy = 210;
  const silHeadR = 42;
  const silBodyCy = 330;
  const silBodyRx = 62;
  const silBodyRy = 108;
  const FUR_SPIKES = 16;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={(width * VB_H) / VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 진피층 (피부 아래) */}
      <path d={dermisPath} fill={C.coralSoft} opacity={0.4} />
      {/* 피부 표면선(돌기 포함) */}
      <path d={skinPath} fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />

      {/* 입모근 (모낭 쪽 고정점 -> 털대) */}
      <line
        x1={muscleAX} y1={muscleAY} x2={muscleBX} y2={muscleBY}
        stroke={accent} strokeWidth={muscleWidth} strokeLinecap="round"
      />
      <circle cx={muscleAX} cy={muscleAY} r={muscleWidth * 0.6} fill={accent} />

      {/* 모낭(bulb) */}
      <ellipse cx={FOLLICLE_X} cy={BULB_CY} rx={28} ry={36} fill={fill} stroke={stroke} strokeWidth={SW * 0.75} />

      {/* 털 (모낭 -> 피부 -> 바깥) */}
      <line
        x1={hairBaseX} y1={hairBaseY} x2={hairTipX} y2={hairTipY}
        stroke={stroke} strokeWidth={7} strokeLinecap="round"
      />

      {/* 조상 실루엣 패널 - 몸통 타원 둘레를 따라 삼각 돌기(fur)를 방사형으로 붙인다 */}
      {v > 0.005 ? (
        <g opacity={v * 0.55} transform={`translate(${silCx} 0) scale(${0.92 + 0.08 * v})`}>
          <circle cx={0} cy={silHeadCy} r={silHeadR} fill={C.inkSoft} />
          <ellipse cx={0} cy={silBodyCy} rx={silBodyRx} ry={silBodyRy} fill={C.inkSoft} />
          {Array.from({ length: FUR_SPIKES }).map((_, i) => {
            const theta = (i / FUR_SPIKES) * 360 * RAD;
            const nx = Math.cos(theta);
            const ny = Math.sin(theta);
            const baseX = nx * silBodyRx;
            const baseY = silBodyCy + ny * silBodyRy;
            const spikeLen = 15 + (i % 3) * 5;
            const tipX = baseX + nx * spikeLen;
            const tipY = baseY + ny * spikeLen;
            const perpX = -ny * 6;
            const perpY = nx * 6;
            return (
              <path
                key={i}
                d={`M ${baseX - perpX} ${baseY - perpY} L ${tipX} ${tipY} L ${baseX + perpX} ${baseY + perpY} Z`}
                fill={C.inkSoft}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

export default GoosebumpDiagram;
