/** 낙타 혹 단면도(단봉낙타 혹에는 물이 아니라 지방이 들어있는 이유, general-ep92 신설).
 *
 *  REGISTRY 확인 완료 - BruiseDiagram/WoundHealDiagram(원형 단면), IceCloudinessDiagram
 *  (얼음틀 단면)이 있으나 전부 "원/사각 단면 안에서 성분이 바뀐다"는 레이아웃이라 이 화의
 *  "혹(돔 형태) 단면에서 틀린 통념(물)에 큰 X 표시가 붙고, 맞는 답(지방)으로 채워진 뒤,
 *  그 지방이 분해되며 아주 소량의 부산물 물방울만 새어나온다"는 3단 구조를 다루는 것은
 *  없어 새로 만들었다. 돔(혹) 모양 단면 + 밑변 절단선(짧은 대각선 해치 6개)으로 "이건
 *  잘라서 본 단면"임을 표시한다(BruiseDiagram과 같은 원형 단면 관례를 돔 형태로 응용).
 *
 *  단일 컴포넌트로 3장면을 커버한다(HiccupDiagram과 같은 설계):
 *   - revealProgress(0~1): 0~0.3 파란 물방울이 단면 안을 거의 채우며 등장(흔한 오해) ->
 *     0.32~0.58 그 위에 굵은 X 두 줄이 그어짐(오답 표시, 70화 사고 재발 방지 - X는 반드시
 *     "물" 위에만 찍는다) -> 0.6~1 물방울+X가 옅어지며 노란 지방 덩어리(큰 도형 1개 +
 *     하이라이트 1개, 작은 점을 흩뿌리지 않는다)가 그 자리를 채운다.
 *   - breakdownProgress(0~1, revealProgress=1 전제): 지방 덩어리가 살짝만 줄어들고
 *     (lerp(1, 0.82, ·) - 부산물 물이 "아주 적다"는 대본과 맞게 큰 변화를 주지 않는다),
 *     밑변 양쪽에서 작은 물방울 2개(그 이상 늘리지 않는다 - "작은 점 여러 개" 금지 원칙)가
 *     새어나온다.
 *   둘 다 0이면 빈 단면(밑변 절단선만 있는 돔 윤곽)만 남는다.
 *
 *  "몸속에 저장된 물질에 대한 오해를 정정하고 그 물질의 대사 부산물까지 함께 보여주는"
 *  구조를 갖는 다른 소재(지방 저장 기관 전반) 재사용 가능성이 있어 라이브러리에 등록한다.
 */
import React, { useId } from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** [a,b] 구간을 0~1로 매핑 */
const stage = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

export const CAMEL_HUMP_VB_W = 600;
export const CAMEL_HUMP_VB_H = 560;
/** "지방 창고" 등 라벨을 붙일 기준점(단면 안쪽 하단, viewBox 좌표) */
export const CAMEL_HUMP_LABEL_PT = { x: 300, y: 400 };

const DOME_D = 'M 90 460 C 90 296, 152 84, 300 78 C 448 84, 510 296, 510 460 Z';

/** 밑변(절단선) 위 짧은 대각선 해치 6개 - 촘촘한 점 대신 굵고 적은 선으로 "잘린 단면"을 표시 */
const HATCH_XS = [130, 190, 250, 350, 410, 470];

/** 물방울 아이콘 경로(중심 0,0 기준, 위로 뾰족) */
const DROP_D = 'M 0 -138 C 66 -58, 116 8, 116 66 C 116 124, 64 168, 0 168 '
  + 'C -64 168, -116 124, -116 66 C -116 8, -66 -58, 0 -138 Z';

export interface CamelHumpDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 0~1: 물방울 등장 -> X 표시 -> 지방으로 채워짐 */
  revealProgress?: number;
  /** 0~1: 지방이 살짝 줄고 소량의 물방울이 새어나옴(revealProgress=1 전제) */
  breakdownProgress?: number;
  stroke?: string;
  fill?: string;
  waterColor?: string;
  fatColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const CamelHumpDiagram: React.FC<CamelHumpDiagramProps> = ({
  width, x, y, revealProgress = 0, breakdownProgress = 0,
  stroke = C.ink, fill = C.paper, waterColor = C.waterCool, fatColor = C.gold,
  strokeWidth = SW, style,
}) => {
  const rv = clamp01(revealProgress);
  const bd = clamp01(breakdownProgress);
  const uid = useId().replace(/[:]/g, '');
  const clipId = `camelHumpClip-${uid}`;

  const dropIn = stage(rv, 0, 0.3);
  const xIn = stage(rv, 0.32, 0.58);
  const fatIn = stage(rv, 0.6, 1);
  const waterGroupOpacity = dropIn * (1 - fatIn);

  const fatScale = fatIn * lerp(1, 0.82, bd);
  const dropletA = stage(bd, 0.15, 0.55);
  const dropletB = stage(bd, 0.45, 0.85);

  return (
    <svg
      viewBox={`0 0 ${CAMEL_HUMP_VB_W} ${CAMEL_HUMP_VB_H}`}
      width={width} height={(width * CAMEL_HUMP_VB_H) / CAMEL_HUMP_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id={clipId}><path d={DOME_D} /></clipPath>
      </defs>

      {/* 돔(혹) 윤곽 - 항상 보임 */}
      <path d={DOME_D} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />

      {/* 밑변 절단선 해치 */}
      <g stroke={C.inkSoft} strokeWidth={7} strokeLinecap="round">
        {HATCH_XS.map((hx) => (
          <line key={hx} x1={hx - 12} y1={460} x2={hx + 12} y2={484} />
        ))}
      </g>
      <line x1={90} y1={460} x2={510} y2={460} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />

      <g clipPath={`url(#${clipId})`}>
        {/* 물방울(흔한 오해) + X 표시 */}
        <g
          transform={`translate(300 300) scale(${0.35 + 0.65 * dropIn})`}
          opacity={waterGroupOpacity}
        >
          <path d={DROP_D} fill={waterColor} />
          <g
            transform={`scale(${0.5 + 0.5 * xIn})`}
            opacity={xIn}
            stroke={C.coral}
            strokeWidth={30}
            strokeLinecap="round"
          >
            <line x1={-92} y1={-92} x2={92} y2={92} />
            <line x1={92} y1={-92} x2={-92} y2={92} />
          </g>
        </g>

        {/* 지방(정답) - 큰 도형 1개 + 하이라이트 1개만 */}
        <g transform={`translate(300 320) scale(${fatScale})`} opacity={fatIn}>
          <path
            d={'M -170 130 C -190 20, -140 -140, 0 -156 C 140 -140, 192 10, 172 130 '
              + 'C 120 168, -118 168, -170 130 Z'}
            fill={fatColor}
          />
          <ellipse cx={-42} cy={-52} rx={70} ry={44} fill={C.goldSoft} opacity={0.85}
            transform="rotate(-18 -42 -52)" />
        </g>
      </g>

      {/* 부산물 물방울 2개 - 밑변 바깥쪽으로 살짝 새어나옴(단면 클립 밖) */}
      <g transform={`translate(168 486) scale(${0.55 * dropletA})`} opacity={dropletA}>
        <path d={DROP_D} fill={waterColor} transform="scale(0.34)" />
      </g>
      <g transform={`translate(432 486) scale(${0.55 * dropletB})`} opacity={dropletB}>
        <path d={DROP_D} fill={waterColor} transform="scale(0.34)" />
      </g>
    </svg>
  );
};

export default CamelHumpDiagram;
