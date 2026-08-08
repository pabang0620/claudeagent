/** 머리 옆모습 다이어그램. "입천장과 이마가 신경을 공유한다" 류의 설명에 재사용한다
 *  (1화 s3~s5: 냉기·혈관 펄스 -> 신경선 -> 신호 오작동).
 *
 *  얼굴은 화면 오른쪽을 향한다. 안쪽에 두 지점을 표시한다.
 *   - MOUTH_PT : 입천장(구강) 부근
 *   - FOREHEAD_PT : 이마 안쪽 부근
 *  둘을 잇는 신경선은 3차 베지어 한 가닥으로, SVG 의 `pathLength=1` 트릭으로 그려서
 *  showNerve(0~1) 진행도만큼 stroke-dashoffset 을 줄이면 그려지는 것처럼 보인다.
 *  signalT(0~1) 로 넘긴 위치는 같은 베지어 제어점을 JS 로 다시 계산해 정확히 그 선 위에 찍는다
 *  (DOM measurement 없이 같은 곡선식을 공유하는 방식이라 프레임 결정론이 깨지지 않는다).
 *
 *  highlightMouth 가 켜지면 로컬 프레임 f 기준으로 혈관이 좁아졌다 넓어지는 펄스가
 *  자동으로 재생된다 (v3: 신규 prop 을 늘리지 않고 이 prop 범위 안에서 처리).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const VB_W = 640;
const VB_H = 760;

/** 옆모습 실루엣 (뒤통수 -> 정수리 -> 이마 -> 코 -> 입 -> 턱 -> 목 -> 뒤통수) */
const HEAD_D =
  'M 140 140 ' +
  'C 60 220, 60 340, 100 420 ' +
  'C 120 470, 160 500, 200 520 ' +
  'L 220 650 L 360 650 L 380 520 ' +
  'C 430 480, 460 460, 480 440 ' +
  'C 500 415, 515 400, 505 385 ' +
  'C 495 372, 515 378, 520 365 ' +
  'C 528 350, 545 330, 560 300 ' +
  'C 572 280, 555 268, 500 260 ' +
  'C 505 230, 515 205, 520 190 ' +
  'C 500 140, 480 110, 460 90 ' +
  'C 400 50, 340 35, 300 40 ' +
  'C 230 48, 175 80, 140 140 Z';

/** 입천장(구강 안쪽) 표시 지점 */
export const MOUTH_PT = { x: 498, y: 348 };
/** 이마 안쪽 표시 지점 */
export const FOREHEAD_PT = { x: 478, y: 128 };
/** 신경선 제어점 (입천장 -> 뇌 안쪽 -> 이마) */
const NERVE_C1 = { x: 558, y: 268 };
const NERVE_C2 = { x: 536, y: 188 };

function cubicPoint(
  p0: { x: number; y: number }, p1: { x: number; y: number },
  p2: { x: number; y: number }, p3: { x: number; y: number }, t: number
) {
  const u = 1 - t;
  const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
  const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}

export interface HeadNerveDiagramProps {
  /** 씬 로컬 프레임 (SceneSwitcher 가 자동으로 넘긴다). 펄스·신호 애니메이션에 쓴다 */
  f: number;
  /** 화면상 폭(px) */
  width: number;
  x?: number;
  y?: number;
  /** 입천장 냉기 표시 + 혈관 좁아졌다 넓어지는 펄스 (v3: 같은 prop 범위에서 처리) */
  highlightMouth?: boolean;
  /** 이마 통증 표시 */
  highlightForehead?: boolean;
  /** 신경선 그려지는 진행도 0~1. 생략하면 신경선을 그리지 않는다 */
  showNerve?: number;
  /** 신경선 위를 이동하는 신호 위치 0~1. 생략하면 표시하지 않는다 */
  signalT?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const HeadNerveDiagram: React.FC<HeadNerveDiagramProps> = ({
  f, width, x = 0, y = 0, highlightMouth, highlightForehead, showNerve, signalT,
  stroke = C.ink, fill = C.paper, style,
}) => {
  // 혈관 펄스: 좁아졌다 넓어지는 리듬 (0.8초 주기)
  const pulse = 0.5 + 0.5 * Math.sin(f / 12.7);
  const coldR = 30 + 14 * pulse;
  const coldOpacity = 0.35 + 0.25 * pulse;

  const nerveP = Math.max(0, Math.min(1, showNerve ?? 0));
  const sigP = signalT === undefined ? null : Math.max(0, Math.min(1, signalT));
  const sigPos = sigP !== null ? cubicPoint(MOUTH_PT, NERVE_C1, NERVE_C2, FOREHEAD_PT, sigP) : null;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <path d={HEAD_D} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
      {/* 귀 */}
      <ellipse cx={170} cy={330} rx={26} ry={40} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />

      {/* 입천장 냉기 + 혈관 펄스 */}
      {highlightMouth ? (
        <g>
          <circle cx={MOUTH_PT.x} cy={MOUTH_PT.y} r={coldR + 20} fill={C.seaTop} opacity={coldOpacity * 0.6} />
          <circle cx={MOUTH_PT.x} cy={MOUTH_PT.y} r={coldR} fill="none" stroke={C.seaDeep} strokeWidth={7} opacity={coldOpacity + 0.25} />
          <circle cx={MOUTH_PT.x} cy={MOUTH_PT.y} r={10} fill={C.seaDeep} />
        </g>
      ) : null}

      {/* 신경선 */}
      {showNerve !== undefined ? (
        <path
          d={`M ${MOUTH_PT.x} ${MOUTH_PT.y} C ${NERVE_C1.x} ${NERVE_C1.y}, ${NERVE_C2.x} ${NERVE_C2.y}, ${FOREHEAD_PT.x} ${FOREHEAD_PT.y}`}
          fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - nerveP}
        />
      ) : null}

      {/* 이동하는 신호 */}
      {sigPos ? (
        <circle cx={sigPos.x} cy={sigPos.y} r={16} fill={C.coral} stroke={C.ink} strokeWidth={5} />
      ) : null}

      {/* 이마 통증 표시 */}
      {highlightForehead ? (
        <g>
          <circle
            cx={FOREHEAD_PT.x} cy={FOREHEAD_PT.y} r={40 + 6 * pulse}
            fill={C.coralSoft} opacity={0.7}
          />
          <g transform={`translate(${FOREHEAD_PT.x - 26} ${FOREHEAD_PT.y - 26})`}>
            <ThemedIcon name="bolt" size={52} color={C.coral} strokePx={10} />
          </g>
        </g>
      ) : null}
    </svg>
  );
};

export default HeadNerveDiagram;
