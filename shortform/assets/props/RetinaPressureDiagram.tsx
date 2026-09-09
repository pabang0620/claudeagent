/** 눈 단면 확대(옆에서 본 안구 단면). "서로 다른 자극(빛/압력)이 같은 신경 경로에서 동일한
 *  신호를 만든다"는 대비 구조를 보여주는 소품(눈을 비비면 별처럼 보이는 이유, general-ep58).
 *  REGISTRY 확인 완료 - HeadNerveDiagram·SneezeReflexDiagram·CheekFlushDiagram 등은 전부
 *  이미 승인된 얼굴(BustActor) 위 오버레이 방식이라, 얼굴에 종속되지 않는 "안구 단면 그 자체"를
 *  다루는 소품은 없었다. FingertipNerveDiagram과 같은 설계(새 신체 부위를 추상 도형으로
 *  단순화해 자체 viewBox 안에 그린다, 얼굴에 종속되지 않음).
 *
 *  안구를 해부도로 그리지 않는다("신체 표현은 최소한으로" 원칙) - 타원 하나(공막/안구
 *  전체) + 앞쪽 작은 돌출(각막) + 안쪽 작은 타원(수정체) + 뒤쪽 안쪽 벽을 따라가는 굵은
 *  곡선 하나(망막)만으로 구성한다.
 *
 *  핵심 대비: `lightHitProgress`(빛이 바깥에서 일직선으로 들어와 망막 지점을 때린다 -
 *  가늘고 밝은 광선 하나, dash reveal)와 `pressureHitProgress`(손가락이 각막 쪽을 눌러
 *  들어오고, 그 압력이 굵은 화살표 하나로 안구 내부를 가로질러 **같은 망막 지점**을
 *  때린다 - 광선 없음, 각막 돌출부가 눌려 안쪽으로 들어가는 형태 변화로 "눌림"을 표현)를
 *  독립 진행도로 받는다. 두 자극 모두 도착하면 망막 지점에 같은 후광(glow)이 뜨고, 그
 *  자리에서 짧은 신호선(시신경 밑동, `RETINA_EXIT_PT`까지)이 dash reveal로 리빌된다 -
 *  "빛이든 압력이든 결과는 똑같은 신호"라는 사실을 좌표로 직접 드러낸다. 이 신호선을
 *  뇌까지 잇는 건 이 컴포넌트의 일이 아니다 - 호출 씬이 `RETINA_EXIT_PT`를 시작점으로
 *  기존 `NerveSignal`을 이어붙인다(WoundHealDiagram -> S7ToBrain과 같은 패턴).
 *
 *  `f`(선택)를 주면 망막 후광이 펄스로, 안 주면 고정 강도로 그린다(FingertipNerveDiagram과
 *  같은 f 예외 패턴, Math.random 미사용 - 원칙 3).
 *
 *  "서로 다른 종류의 자극이 같은 감각 경로에서 동일하게 해석되는" 구조를 갖는 다른 소재
 *  (착시·착각 신호 전반) 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const RETINA_PRESSURE_VB_W = 400;
export const RETINA_PRESSURE_VB_H = 300;

const CX = 210;
const CY = 155;
const EYE_RX = 128;
const EYE_RY = 100;
const INSET = 0.86;

const ptOnEllipse = (deg: number, rx = EYE_RX * INSET, ry = EYE_RY * INSET) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + rx * Math.cos(rad), y: CY + ry * Math.sin(rad) };
};

/** 망막이 자극을 받는 지점(안구 뒤쪽 중심, 광축이 정면으로 지나가는 자리) - viewBox 좌표.
 *  호출 씬이 라벨·글로우 앵커로 재사용 가능 */
export const RETINA_HIT_PT = ptOnEllipse(0);
/** 시신경이 안구 밖으로 빠져나가는 지점(신호가 뇌로 향하는 시작점) - viewBox 좌표.
 *  호출 씬이 `NerveSignal` 의 `from` 으로 이어붙인다 */
export const RETINA_EXIT_PT = { x: CX + EYE_RX + 58, y: CY + 46 };

const RETINA_TOP = ptOnEllipse(-72);
const RETINA_BOT = ptOnEllipse(72);
const RETINA_CTRL_TOP = ptOnEllipse(-34, EYE_RX * INSET * 1.05, EYE_RY * INSET * 1.05);
const RETINA_CTRL_BOT = ptOnEllipse(34, EYE_RX * INSET * 1.05, EYE_RY * INSET * 1.05);

const LIGHT_START = { x: CX - EYE_RX - 112, y: CY };
const FINGER_FAR = { x: CX - EYE_RX - 150, y: CY - 78 };
const FINGER_TOUCH = { x: CX - EYE_RX - 8, y: CY - 8 };

/** 화살촉(빛 광선·압력 화살표 끝에 공용으로 쓰는 삼각형) */
function ArrowHead({ x, y, angle, size, color }: {
  x: number; y: number; angle: number; size: number; color: string;
}) {
  const a1 = angle + 2.5;
  const a2 = angle - 2.5;
  const p1 = { x: x - size * Math.cos(a1), y: y - size * Math.sin(a1) };
  const p2 = { x: x - size * Math.cos(a2), y: y - size * Math.sin(a2) };
  return <polygon points={`${x},${y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={color} />;
}

export interface RetinaPressureDiagramProps {
  /** 망막 후광 펄스에 쓰는 씬 로컬 프레임 (생략하면 고정 강도) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 빛이 바깥에서 들어와 망막을 때리는 진행도 */
  lightHitProgress?: number;
  /** 0~1. 손가락이 눌러 압력이 망막을 때리는 진행도 */
  pressureHitProgress?: number;
  stroke?: string;
  fill?: string;
  retinaColor?: string;
  lightColor?: string;
  pressureColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const RetinaPressureDiagram: React.FC<RetinaPressureDiagramProps> = ({
  f, width, x = 0, y = 0, lightHitProgress = 0, pressureHitProgress = 0,
  stroke = C.ink, fill = C.paper, retinaColor = C.coral, lightColor = C.gold,
  pressureColor = C.ink, strokeWidth = SW, style,
}) => {
  const lp = clamp01(lightHitProgress);
  const pp = clamp01(pressureHitProgress);

  // 빛: 바깥 -> 망막 지점까지 일직선(광축이 각막 중심을 지나 정면 망막에 닿는 단순화)
  const rayReveal = clamp01(lp / 0.7);
  const lightArrived = clamp01((lp - 0.7) / 0.3);

  // 압력: 손가락 접근(~0.3) -> 각막이 눌려 들어감(0.15~0.5) -> 압력 화살표 리빌(0.35~0.75)
  const approachT = clamp01(pp / 0.3);
  const pressDepth = clamp01((pp - 0.15) / 0.35);
  const armReveal = clamp01((pp - 0.35) / 0.4);
  const pressureArrived = clamp01((pp - 0.75) / 0.25);

  const arrived = Math.max(lightArrived, pressureArrived);

  const fingerX = lerp(FINGER_FAR.x, FINGER_TOUCH.x, approachT);
  const fingerY = lerp(FINGER_FAR.y, FINGER_TOUCH.y, approachT);

  // 각막 돌출부 - 평소엔 바깥으로 볼록, 눌리면 안쪽으로 들어가 평평/오목해진다
  // (수정체와 겹치지 않도록 안쪽 한계를 수정체 앞쪽 여유 안으로 제한 - 스틸 선점검에서
  // 32px 안쪽까지 밀면 수정체와 손가락이 뒤엉켜 보이는 결함이 실측 확인됨)
  const corneaApexX = lerp(CX - EYE_RX - 24, CX - EYE_RX + 18, pressDepth);
  const corneaTop = { x: CX - EYE_RX * 0.7, y: CY - EYE_RY * 0.6 };
  const corneaBot = { x: CX - EYE_RX * 0.7, y: CY + EYE_RY * 0.6 };

  const pulse = f === undefined ? 1 : 0.6 + 0.4 * Math.sin((f / 34) * Math.PI * 2);
  const glowR = (26 + 9 * pulse) * (0.7 + 0.3 * arrived);
  const glowOpacity = arrived > 0.02 ? (0.4 + 0.35 * pulse) * arrived : 0;

  const pressAngle = Math.atan2(RETINA_HIT_PT.y - FINGER_TOUCH.y, RETINA_HIT_PT.x - FINGER_TOUCH.x);
  const pressArmEndX = lerp(FINGER_TOUCH.x, RETINA_HIT_PT.x, armReveal);
  const pressArmEndY = lerp(FINGER_TOUCH.y, RETINA_HIT_PT.y, armReveal);

  return (
    <svg
      viewBox={`0 0 ${RETINA_PRESSURE_VB_W} ${RETINA_PRESSURE_VB_H}`}
      width={width} height={(width * RETINA_PRESSURE_VB_H) / RETINA_PRESSURE_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 안구 전체(공막) */}
      <ellipse cx={CX} cy={CY} rx={EYE_RX} ry={EYE_RY} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

      {/* 각막 돌출부 - pressDepth 에 따라 볼록 <-> 오목 */}
      <path
        d={`M ${corneaTop.x} ${corneaTop.y} Q ${corneaApexX} ${CY} ${corneaBot.x} ${corneaBot.y}`}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />

      {/* 수정체 */}
      <ellipse
        cx={CX - EYE_RX + 55} cy={CY} rx={16} ry={32}
        fill={C.sky} stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity={0.85}
      />

      {/* 망막 - 안쪽 뒷벽을 따라가는 굵은 곡선 */}
      <path
        d={`M ${RETINA_TOP.x} ${RETINA_TOP.y} Q ${RETINA_CTRL_TOP.x} ${RETINA_CTRL_TOP.y} ${RETINA_HIT_PT.x} ${RETINA_HIT_PT.y} Q ${RETINA_CTRL_BOT.x} ${RETINA_CTRL_BOT.y} ${RETINA_BOT.x} ${RETINA_BOT.y}`}
        fill="none" stroke={retinaColor} strokeWidth={strokeWidth * 1.15} strokeLinecap="round"
      />

      {/* 빛 광선 - 바깥에서 망막 지점까지 일직선, 압력 모드에는 절대 등장하지 않음(대비) */}
      {rayReveal > 0.01 ? (
        <g>
          <line
            x1={LIGHT_START.x} y1={LIGHT_START.y} x2={RETINA_HIT_PT.x} y2={RETINA_HIT_PT.y}
            stroke={lightColor} strokeWidth={SW_THIN * 0.9} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rayReveal}
          />
          {rayReveal > 0.92 ? (
            <ArrowHead x={RETINA_HIT_PT.x} y={RETINA_HIT_PT.y} angle={0} size={16} color={lightColor} />
          ) : null}
        </g>
      ) : null}

      {/* 손가락 - 바깥에서 각막 쪽으로 다가와 닿는다. 회전한 사각형 대신 두께가 다른
          선 2겹(굵은 잉크선 + 얇은 살색선)으로 캡슐을 표현한다 - 접근 방향이 매번 달라
          회전값을 고정하면 손끝이 접촉점에서 벗어나 떠 보이는 결함이 있었다(스틸 선점검
          에서 실측) - 이 방식은 FINGER_FAR -> 현재 위치를 그대로 잇기만 하면 되므로
          항상 접촉점에 정확히 닿는다. */}
      {approachT > 0.01 ? (
        <g opacity={approachT} strokeLinecap="round">
          <line x1={FINGER_FAR.x} y1={FINGER_FAR.y} x2={fingerX} y2={fingerY} stroke={stroke} strokeWidth={54} />
          <line
            x1={FINGER_FAR.x} y1={FINGER_FAR.y} x2={fingerX} y2={fingerY}
            stroke={fill} strokeWidth={54 - strokeWidth * 1.4}
          />
        </g>
      ) : null}

      {/* 압력 화살표 - 손가락 접촉점에서 망막 지점까지, 광선 없이도 같은 지점을 때린다(대비) */}
      {armReveal > 0.01 ? (
        <g>
          <line
            x1={FINGER_TOUCH.x} y1={FINGER_TOUCH.y} x2={RETINA_HIT_PT.x} y2={RETINA_HIT_PT.y}
            stroke={pressureColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - armReveal}
          />
          {armReveal > 0.92 ? (
            <ArrowHead x={pressArmEndX} y={pressArmEndY} angle={pressAngle} size={20} color={pressureColor} />
          ) : null}
        </g>
      ) : null}

      {/* 망막 후광 - 빛이든 압력이든 도착하면 같은 자리에서 같은 강도로 뜬다 */}
      {glowOpacity > 0.01 ? (
        <circle cx={RETINA_HIT_PT.x} cy={RETINA_HIT_PT.y} r={glowR} fill={C.goldSoft} opacity={glowOpacity} />
      ) : null}

      {/* 신호선 밑동 - 망막 지점에서 시신경이 빠져나가는 방향으로 짧게 리빌 */}
      {arrived > 0.02 ? (
        <line
          x1={RETINA_HIT_PT.x} y1={RETINA_HIT_PT.y} x2={RETINA_EXIT_PT.x} y2={RETINA_EXIT_PT.y}
          stroke={retinaColor} strokeWidth={SW_THIN} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrived}
        />
      ) : null}
    </svg>
  );
};

export default RetinaPressureDiagram;
