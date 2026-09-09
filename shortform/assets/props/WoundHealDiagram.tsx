/** 딱지 앉은 상처가 "낫는 중"인 상태의 단면 클로즈업. "새 살이 차오르며 피부가 다시
 *  이어지고, 그 과정에서 히스타민이 방출돼 신경을 자극하고, 딱지가 마르며 당겨져 같은
 *  신경을 또 건드린다" 는 3단 인과에 쓴다(general-ep54 s1·s3~s6). REGISTRY 확인 완료 -
 *  `WoundCrossSectionDiagram`(general-ep38)은 "갓 베인 상처가 얕고 딱지가 잘 안 덮여
 *  신경이 노출된" 정반대 단계(딱지 커버리지가 자라는 중, 중앙 틈 존재, 피 표시 포함)를
 *  다뤄 이 화의 "이미 딱지가 앉아 덮인 상태에서 안쪽이 낫는" 단계와 구조가 달라 별도로
 *  만들었다. 같은 원형 단면 시각 문법(피부 원 + 안쪽 옅은 조직 톤, `WoundCrossSectionDiagram`과
 *  동일 CX/CY/R_OUTER/R_INNER)은 그대로 재사용해 "단면을 볼 때는 이 원 그림"이라는 채널
 *  관례를 유지한다.
 *
 *  `healProgress`(0~1, 안쪽 바닥에서 차오르는 큰 도형 하나 - 오케스트레이터 지시대로
 *  점 무리 대신 단일 채움 도형으로 "새살이 차오름"을 표현), `histamineProgress`(0~1,
 *  딱지 밑 한 점에서 작은 입자 3개가 고정된 방향으로 퍼져나감 - 피부 표면 반복 요소가
 *  아니라 CaffeineReceptorDiagram류의 "이동하는 물질" 언어), `scabTightenProgress`(0~1,
 *  기존 딱지 도형이 살짝 오그라들며 짧은 주름선 2개가 나타남), `nerveGlow`(0~1, 굵은 선
 *  1가닥짜리 신경선의 강조 - 점 무리 없음, `f`(선택)를 주면 펄스)를 독립 진행도로 받는다.
 *  전부 0이면 "딱지만 앉아 있는 정지 상태"가 된다(CellMergeDiagram/HiccupDiagram과 같은
 *  설계 원칙 - 이 순간의 상태만 그리고, 시간 곡선은 호출 씬이 만든다).
 *
 *  "국소 손상이 복구되며 화학물질이 방출돼 신경을 자극하는" 구조를 갖는 다른 소재(알레르기
 *  반응, 염증 등) 재사용 가능성이 있어 에피소드 로컬이 아니라 라이브러리에 등록한다.
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const WOUND_HEAL_VB_W = 300;
export const WOUND_HEAL_VB_H = 300;

const CX = 150;
const CY = 150;
const R_OUTER = 122;
const R_INNER = 98;

/** 딱지(이미 앉아 있는 상태, 항상 그려진다) - 안쪽 위쪽에 자리한 도톰한 도형 하나 */
const SCAB_CX = CX;
const SCAB_CY = 95;
const SCAB_RX = 60;
const SCAB_RY = 38;

/** 신경선 - 딱지 바로 아래를 지나는 얕은 호 (점 무리 없이 굵은 선 1가닥) */
const NERVE_LEFT = { x: CX - 76, y: 178 };
const NERVE_RIGHT = { x: CX + 76, y: 178 };
const NERVE_CTRL_Y = 158;
/** 다른 씬(s7)이 신경선 -> 뇌 로 이어지는 NerveSignal 을 그릴 때 쓰는 화면 좌표 앵커
 *  (viewBox 좌표계, 호출부가 width/300 스케일로 화면 좌표로 변환한다) */
export const WOUND_HEAL_NERVE_PT = { x: CX, y: NERVE_CTRL_Y + 10 };

/** 히스타민 방출 원점 - 딱지 바로 밑, 신경 바로 위 */
const HISTAMINE_ORIGIN = { x: CX, y: 188 };
/** 3개 입자가 퍼지는 고정 방향(도, 0=수직 위 기준 시계방향) - Math.random 미사용 */
const HISTAMINE_ANGLES = [-55, -6, 48];
const HISTAMINE_DIST = 70;
/** 다른 씬(s5)이 "입자 -> 신경" NerveSignal 을 그릴 때 쓰는 화면 좌표 앵커 */
export const WOUND_HEAL_HISTAMINE_PT = HISTAMINE_ORIGIN;

/** 새살이 차오르는 범위 (안쪽 원 바닥 ~ 신경선 바로 아래까지) */
const HEAL_BOTTOM_Y = CY + R_INNER; // 248
const HEAL_TOP_Y = NERVE_CTRL_Y + 30; // 188 - 신경선 아래까지만 차오르고 넘지 않는다

export interface WoundHealDiagramProps {
  /** 신경 글로우 펄스에 쓰는 씬 로컬 프레임 (생략하면 고정 강도) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 안쪽 바닥에서 차오르는 새살(단일 도형) */
  healProgress?: number;
  /** 0~1. 딱지 밑에서 방출되는 입자 3개 */
  histamineProgress?: number;
  /** 0~1. 딱지가 오그라들며 당겨짐 */
  scabTightenProgress?: number;
  /** 0~1. 신경선 강조 */
  nerveGlow?: number;
  stroke?: string;
  fill?: string;
  nerveColor?: string;
  scabColor?: string;
  healColor?: string;
  histamineColor?: string;
  style?: React.CSSProperties;
}

export const WoundHealDiagram: React.FC<WoundHealDiagramProps> = ({
  f, width, x = 0, y = 0, healProgress = 0, histamineProgress = 0, scabTightenProgress = 0, nerveGlow = 0,
  stroke = C.ink, fill = C.paper, nerveColor = C.coral, scabColor = C.goldSoft, healColor = C.coral,
  histamineColor = C.gold, style,
}) => {
  const heal = clamp01(healProgress);
  const hist = clamp01(histamineProgress);
  const tighten = clamp01(scabTightenProgress);
  const glow = clamp01(nerveGlow);
  const pulse = f === undefined ? 1 : 0.55 + 0.45 * Math.sin((f / 36) * Math.PI * 2);

  const healTop = HEAL_BOTTOM_Y - heal * (HEAL_BOTTOM_Y - HEAL_TOP_Y);
  const scabScaleX = 1 - 0.12 * tighten;
  const scabScaleY = 1 - 0.06 * tighten;

  return (
    <svg
      viewBox={`0 0 ${WOUND_HEAL_VB_W} ${WOUND_HEAL_VB_H}`}
      width={width} height={(width * WOUND_HEAL_VB_H) / WOUND_HEAL_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id="wound-heal-inner-clip">
          <circle cx={CX} cy={CY} r={R_INNER} />
        </clipPath>
      </defs>

      {/* 단면 원 (WoundCrossSectionDiagram과 같은 규약) */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={fill} stroke={stroke} strokeWidth={13} />
      <circle cx={CX} cy={CY} r={R_INNER} fill={C.coralSoft} opacity={0.22} />

      {/* 새살 - 안쪽 바닥에서 차오르는 도형 하나 (점 무리 없음) */}
      {heal > 0.01 ? (
        <g clipPath="url(#wound-heal-inner-clip)">
          <rect
            x={CX - R_INNER} y={healTop} width={R_INNER * 2} height={HEAL_BOTTOM_Y - healTop}
            fill={healColor} opacity={0.32 + 0.28 * heal}
          />
        </g>
      ) : null}

      {/* 신경선 - 딱지 바로 아래를 지나는 굵은 선 1가닥 */}
      <path
        d={`M ${NERVE_LEFT.x} ${NERVE_LEFT.y} Q ${CX} ${NERVE_CTRL_Y} ${NERVE_RIGHT.x} ${NERVE_RIGHT.y}`}
        fill="none" stroke={nerveColor} strokeWidth={SW_THIN}
        opacity={0.5 + glow * (0.35 + 0.2 * pulse)}
        strokeLinecap="round"
      />
      {glow > 0.02 ? (
        <circle
          cx={WOUND_HEAL_NERVE_PT.x} cy={WOUND_HEAL_NERVE_PT.y} r={20 + 6 * pulse} fill={C.goldSoft}
          opacity={glow * (0.35 + 0.25 * pulse)}
        />
      ) : null}

      {/* 히스타민 입자 3개 - 고정 방향으로 퍼짐 (점 무리 아님, 큰 원 3개) */}
      {hist > 0.02 ? (
        <g>
          {HISTAMINE_ANGLES.map((deg, i) => {
            const stagger = i * 0.14;
            const t = clamp01((hist - stagger) / (1 - stagger));
            if (t <= 0) return null;
            const rad = (deg * Math.PI) / 180;
            const dist = t * HISTAMINE_DIST;
            const px = HISTAMINE_ORIGIN.x + Math.sin(rad) * dist;
            const py = HISTAMINE_ORIGIN.y - Math.cos(rad) * dist;
            return (
              <circle
                key={i} cx={px} cy={py} r={11 + 6 * t}
                fill={histamineColor} opacity={0.85 * t}
              />
            );
          })}
        </g>
      ) : null}

      {/* 딱지 - 항상 그려짐. tighten이 커질수록 살짝 오그라들고 주름선이 생긴다 */}
      <g transform={`translate(${SCAB_CX} ${SCAB_CY}) scale(${scabScaleX} ${scabScaleY}) translate(${-SCAB_CX} ${-SCAB_CY})`}>
        <ellipse
          cx={SCAB_CX} cy={SCAB_CY} rx={SCAB_RX} ry={SCAB_RY}
          fill={scabColor} stroke={stroke} strokeWidth={SW_THIN * 0.6}
        />
        {tighten > 0.25 ? (
          <>
            <path
              d={`M ${SCAB_CX - 26} ${SCAB_CY - 6} Q ${SCAB_CX - 12} ${SCAB_CY - 16} ${SCAB_CX + 2} ${SCAB_CY - 6}`}
              fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.45} strokeLinecap="round"
              opacity={(tighten - 0.25) / 0.75}
            />
            <path
              d={`M ${SCAB_CX + 6} ${SCAB_CY + 10} Q ${SCAB_CX + 20} ${SCAB_CY} ${SCAB_CX + 32} ${SCAB_CY + 10}`}
              fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.45} strokeLinecap="round"
              opacity={(tighten - 0.25) / 0.75}
            />
          </>
        ) : null}
      </g>
    </svg>
  );
};

export default WoundHealDiagram;
