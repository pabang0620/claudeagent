/** 상처 단면 클로즈업. "상처가 얕아 피가 적게 나고, 피딱지가 잘 안 덮여 신경이 계속
 *  공기에 노출된다" 류의 설명에 쓴다(general-ep38 s5·s6). REGISTRY 3절 확인 완료 -
 *  `FingerCrossSection`(props/Hand.tsx)은 혈관이 좁아지는 소재라 구조가 다르고,
 *  얕은 상처·피딱지를 다루는 자산은 없었다.
 *
 *  `FingerCrossSection`과 같은 "원형 단면(피부 원 + 안쪽 옅은 조직 톤)" 언어를 그대로
 *  재사용해 채널 안에서 "단면을 볼 때는 이 원 그림"이라는 시각 문법을 유지한다.
 *  표면 위쪽에 작은 V자 절개(가는 선 하나)만 내고, 그 밑을 지나는 신경선(굵은 선 1가닥,
 *  점 무리 없음)을 항상 그린다.
 *
 *  피는 방울 하나(ThemedIcon droplet)로만 표시하고 `bloodAmount`로 아주 작게만 키운다
 *  (오케스트레이터 지시 - 붉은 액체 흥건함·벌어진 살 묘사 금지). 색은 이 라이브러리가
 *  이미 "혈관/피"에 쓰는 코랄을 그대로 따른다(FingerCrossSection의 veinColor 기본값과 통일).
 *
 *  `scabProgress`(0~1)는 절개 양옆에서 자라나는 딱지 두 조각이되, 항상 중앙에 일정한
 *  틈을 남겨(최대 커버리지를 제한) "잘 안 덮인다"는 사실 자체를 형태로 보여준다.
 *  `nerveGlow`(0~1)는 그 틈으로 드러난 신경선을 강조한다. `f`(선택, 프레임)를 주면
 *  펄스로, 안 주면 고정 강도로 빛난다(FingertipNerveDiagram과 같은 f 예외 패턴).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const WOUND_VB_W = 300;
export const WOUND_VB_H = 300;

const CX = 150;
const CY = 150;
const R_OUTER = 122;
const R_INNER = 98;
/** 절개(슬릿) 꼭짓점 - 표면(원 위쪽) 한 점에서 살짝 아래로 파고든다 */
const NOTCH_TOP_Y = CY - R_OUTER + 6; // 34
const NOTCH_TIP = { x: CX, y: NOTCH_TOP_Y + 34 }; // 68
/** 신경선 - 절개 바로 아래를 지나는 얕은 호 (표면 가까이) */
const NERVE_LEFT = { x: CX - 78, y: NOTCH_TIP.y + 20 };
const NERVE_RIGHT = { x: CX + 78, y: NOTCH_TIP.y + 20 };
/** 딱지가 최대로 자라도 남는 중앙 틈(px, viewBox 기준 half-width) */
const SCAB_GAP_HALF = 16;
const SCAB_MAX_HALF = 46;

export interface WoundCrossSectionDiagramProps {
  /** 신경 글로우 펄스에 쓰는 씬 로컬 프레임 (생략하면 고정 강도) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 절개 틈에 맺히는 핏방울 크기 (매우 작게만 키운다) */
  bloodAmount?: number;
  /** 0~1. 딱지 두 조각이 양옆에서 자라지만 중앙 틈은 항상 남는다 */
  scabProgress?: number;
  /** 0~1. 틈으로 드러난 신경선 강조 */
  nerveGlow?: number;
  stroke?: string;
  fill?: string;
  nerveColor?: string;
  scabColor?: string;
  bloodColor?: string;
  style?: React.CSSProperties;
}

export const WoundCrossSectionDiagram: React.FC<WoundCrossSectionDiagramProps> = ({
  f, width, x = 0, y = 0, bloodAmount = 0, scabProgress = 0, nerveGlow = 0,
  stroke = C.ink, fill = C.paper, nerveColor = C.coral, scabColor = C.goldSoft,
  bloodColor = C.coral, style,
}) => {
  const blood = clamp01(bloodAmount);
  const scab = clamp01(scabProgress);
  const glow = clamp01(nerveGlow);
  const pulse = f === undefined ? 1 : 0.55 + 0.45 * Math.sin((f / 36) * Math.PI * 2);

  const scabHalf = SCAB_GAP_HALF + scab * (SCAB_MAX_HALF - SCAB_GAP_HALF);
  const dropSize = 18 + blood * 26; // 매우 작은 방울 하나만

  return (
    <svg
      viewBox={`0 0 ${WOUND_VB_W} ${WOUND_VB_H}`}
      width={width} height={(width * WOUND_VB_H) / WOUND_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 단면 원 (FingerCrossSection과 같은 규약) */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={fill} stroke={stroke} strokeWidth={SW} />
      <circle cx={CX} cy={CY} r={R_INNER} fill={C.coralSoft} opacity={0.3} />

      {/* 신경선 - 절개 바로 아래를 지나는 굵은 선 1가닥 (점 무리 없음) */}
      <path
        d={`M ${NERVE_LEFT.x} ${NERVE_LEFT.y} Q ${CX} ${NERVE_LEFT.y - 22} ${NERVE_RIGHT.x} ${NERVE_RIGHT.y}`}
        fill="none" stroke={nerveColor} strokeWidth={SW_THIN}
        opacity={0.55 + glow * (0.35 + 0.2 * pulse)}
        strokeLinecap="round"
      />
      {glow > 0.02 ? (
        <circle
          cx={CX} cy={NOTCH_TIP.y + 6} r={20 + 6 * pulse} fill={C.goldSoft}
          opacity={glow * (0.35 + 0.25 * pulse)}
        />
      ) : null}

      {/* 딱지 두 조각 - 양옆에서 자라지만 중앙 틈(scabHalf)은 항상 남는다 */}
      {scab > 0.02 ? (
        <g fill={scabColor} stroke={stroke} strokeWidth={SW_THIN * 0.6}>
          <path
            d={`M ${CX - scabHalf} ${NOTCH_TIP.y - 8} L ${CX - R_INNER * 0.5} ${NOTCH_TIP.y - 4} L ${CX - R_INNER * 0.5} ${NOTCH_TIP.y + 22} L ${CX - scabHalf} ${NOTCH_TIP.y + 12} Z`}
          />
          <path
            d={`M ${CX + scabHalf} ${NOTCH_TIP.y - 8} L ${CX + R_INNER * 0.5} ${NOTCH_TIP.y - 4} L ${CX + R_INNER * 0.5} ${NOTCH_TIP.y + 22} L ${CX + scabHalf} ${NOTCH_TIP.y + 12} Z`}
          />
        </g>
      ) : null}

      {/* 절개(슬릿) - 가는 선 하나로만 표시 */}
      <path
        d={`M ${CX - 12} ${NOTCH_TOP_Y} L ${NOTCH_TIP.x} ${NOTCH_TIP.y} L ${CX + 12} ${NOTCH_TOP_Y}`}
        fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.85} strokeLinecap="round" strokeLinejoin="round"
      />

      {/* 핏방울 하나 - 아주 작게만 */}
      {blood > 0.02 ? (
        <g
          transform={`translate(${NOTCH_TIP.x - dropSize / 2} ${NOTCH_TIP.y - dropSize * 0.3})`}
          opacity={0.55 + blood * 0.45}
        >
          <ThemedIcon name="droplet" size={dropSize} color={bloodColor} strokePx={10} />
        </g>
      ) : null}
    </svg>
  );
};

export default WoundCrossSectionDiagram;
