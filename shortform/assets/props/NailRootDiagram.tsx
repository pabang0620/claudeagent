/** 손끝 단면(손톱판 + 손톱이 자라는 뿌리인 손톱 기질) 클로즈업. "손을 발보다 훨씬 많이
 *  써서 손끝 혈류가 활발하고, 그게 손톱이 자라는 뿌리를 더 자극한다"는 정성적 설명을
 *  보여주는 소품(손톱이 발톱보다 빨리 자라는 이유, general-ep87). REGISTRY 확인 완료 -
 *  `FingertipNerveDiagram`(ep38, 신경 다발)과 `Hand.tsx`의 FingerCrossSection(ep02, 혈관
 *  수축)을 먼저 봤으나 둘 다 손톱이 자라는 뿌리(조모/기질) 구조를 다루지 않아 새로 만들었다.
 *  실루엣 규약은 FingertipNerveDiagram과 동일(viewBox 300x420, 몸체 rect + 손톱 ellipse,
 *  CX=150/HALF_W=80/BASE_Y=388/nail cy=80)을 그대로 재사용해 같은 손끝 소재 소품끼리 크기가
 *  맞게 했다(원칙 0-1 - 좌표를 눈대중으로 새로 짓지 않는다).
 *
 *  이 화는 원인 설명(사용 빈도 -> 혈류 -> 자극)을 확신도 낮은 "정성적 설명"으로 다룬다
 *  (오케스트레이터 지시). 그래서 혈관을 사실적으로 그리지 않고 굵은 곡선 화살+맥동(펄스)으로만
 *  "혈류가 활발하다"를 표현하고, 손의 움직임/부딪힘은 점을 여러 개 뿌리지 않고 몸체 윤곽선을
 *  살짝 어긋나게 겹친 옅은 잔상 2겹으로만 표현한다(채널 원칙 - 신체 표현 최소화, 점 무리 금지).
 *
 *  `bloodFlowProgress`(0~1)와 `stimulateProgress`(0~1)는 서로 독립된 진행도다.
 *  `f`(선택, 프레임)를 주면 두 효과 모두 반복되는 맥동/흔들림으로 편다(FingertipNerveDiagram과
 *  같은 f 예외 패턴, Math.random 미사용 - 원칙 3).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const NAIL_ROOT_VB_W = 300;
export const NAIL_ROOT_VB_H = 420;
/** 손톱이 자라는 뿌리(손톱 기질) 중심점 - 라벨·글로우 앵커로 호출부가 재사용 가능 */
export const NAIL_ROOT_PT = { x: 150, y: 148 };

const CX = 150;
const HALF_W = 80;
const BASE_Y = 388;
const NAIL_CY = 80;
const ROOT = NAIL_ROOT_PT;

/** 혈류 화살 2가닥의 끝점과 그 지점에서의 진행 방향(제어점 -> 끝점, 채워진 삼각형 화살촉
 *  방향 계산용). 곡선 좌표(아래 M/Q path)와 반드시 같은 값을 써야 화살촉이 선 끝에 정확히
 *  붙는다 - 렌더 시점에 다시 추정하지 않는다. */
const LEFT_ARROW_TIP = { x: ROOT.x - 22, y: ROOT.y + 26 };
const RIGHT_ARROW_TIP = { x: ROOT.x + 22, y: ROOT.y + 26 };
const LEFT_ARROW_CTRL = { x: CX - 58, y: 220 };
const RIGHT_ARROW_CTRL = { x: CX + 58, y: 220 };

/** 채워진 삼각형 화살촉 path. tip 을 향해 ctrl->tip 방향으로 뾰족하게 만든다(열린 쉐브론
 *  2개를 마주보게 두면 X 표시처럼 보이는 문제를 피하려고 단일 채워진 삼각형으로 바꿨다). */
function arrowHeadPath(tip: { x: number; y: number }, ctrl: { x: number; y: number }, size = 15) {
  const dx = tip.x - ctrl.x;
  const dy = tip.y - ctrl.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const backX = tip.x - ux * size;
  const backY = tip.y - uy * size;
  const half = size * 0.6;
  const leftX = backX + px * half;
  const leftY = backY + py * half;
  const rightX = backX - px * half;
  const rightY = backY - py * half;
  return `M ${tip.x} ${tip.y} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`;
}

const LEFT_ARROW_HEAD = arrowHeadPath(LEFT_ARROW_TIP, LEFT_ARROW_CTRL);
const RIGHT_ARROW_HEAD = arrowHeadPath(RIGHT_ARROW_TIP, RIGHT_ARROW_CTRL);

export interface NailRootDiagramProps {
  /** 맥동·잔상 펄스에 쓰는 씬 로컬 프레임 (생략하면 고정 강도) */
  f?: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 뿌리 쪽으로 향하는 혈류 화살+글로우가 맥동하며 강조되는 정도 */
  bloodFlowProgress?: number;
  /** 0~1. 손이 움직이고 부딪히는 잔상(윤곽선 2겹)과 뿌리 자극 글로우가 강해지는 정도 */
  stimulateProgress?: number;
  stroke?: string;
  fill?: string;
  rootColor?: string;
  bloodColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const NailRootDiagram: React.FC<NailRootDiagramProps> = ({
  f, width, x = 0, y = 0, bloodFlowProgress = 0, stimulateProgress = 0,
  stroke = C.ink, fill = C.paper, rootColor = C.goldSoft, bloodColor = C.coral,
  strokeWidth = SW, style,
}) => {
  const bp = clamp01(bloodFlowProgress);
  const sp = clamp01(stimulateProgress);
  const pulse = f === undefined ? 1 : 0.55 + 0.45 * Math.sin((f / 26) * Math.PI * 2);
  const shakeOsc = f === undefined ? 1 : Math.sin((f / 10) * Math.PI * 2);

  const rootGlowR = 46 + 10 * pulse * bp;
  const rootGlowOpacity = bp > 0.03 ? (0.3 + 0.35 * pulse) * bp : 0;
  const stimGlowOpacity = sp > 0.03 ? (0.25 + 0.3 * pulse) * sp : 0;
  const ghostDx = 10 * sp * shakeOsc;

  return (
    <svg
      viewBox={`0 0 ${NAIL_ROOT_VB_W} ${NAIL_ROOT_VB_H}`}
      width={width} height={(width * NAIL_ROOT_VB_H) / NAIL_ROOT_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 움직임/부딪힘 잔상 - 몸체 윤곽선을 살짝 어긋나게 겹친 옅은 흔적 2겹(점 무리 금지) */}
      {sp > 0.02 ? (
        <g opacity={0.18 * sp} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.7}>
          <rect x={CX - HALF_W + ghostDx} y={18} width={HALF_W * 2} height={BASE_Y - 18} rx={HALF_W} />
          <rect x={CX - HALF_W - ghostDx} y={18} width={HALF_W * 2} height={BASE_Y - 18} rx={HALF_W} />
        </g>
      ) : null}

      {/* 뿌리(손톱 기질) 자극 글로우 - 혈류 글로우보다 바깥쪽, 자극이 강할수록 넓게 번짐 */}
      {stimGlowOpacity > 0.01 ? (
        <circle cx={ROOT.x} cy={ROOT.y} r={64 + 14 * pulse} fill={bloodColor} opacity={stimGlowOpacity * 0.6} />
      ) : null}

      {/* 뿌리(손톱 기질) 부위 - 피부 아래 얕은 하이라이트 영역, 항상 표시 */}
      <ellipse cx={ROOT.x} cy={ROOT.y} rx={46} ry={32} fill={rootColor} opacity={0.75} />

      {/* 손가락 몸체 (고정 실루엣, FingertipNerveDiagram과 동일 규약) */}
      <rect
        x={CX - HALF_W} y={18} width={HALF_W * 2} height={BASE_Y - 18} rx={HALF_W}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />

      {/* 혈류 글로우 (뿌리 위, 나머지 위) */}
      {rootGlowOpacity > 0.01 ? (
        <circle cx={ROOT.x} cy={ROOT.y} r={rootGlowR} fill={C.coralSoft} opacity={rootGlowOpacity} />
      ) : null}

      {/* 혈류 화살(맥동) - 뿌리 쪽으로 향하는 굵은 곡선 화살 2가닥. 혈관을 사실적으로 그리지
          않고 굵은 선+펄스로만 "활발하다"를 표현한다(오케스트레이터 지시). 화살촉은 열린
          쉐브론 2개 대신 채워진 삼각형 1개씩으로 그린다 - 열린 쉐브론 2개를 뿌리 근처에
          마주보게 두면 X 표시(이 채널에서 "틀림"을 뜻하는 기호)처럼 보일 수 있어 피했다. */}
      {bp > 0.02 ? (
        <g opacity={(0.55 + 0.4 * pulse) * bp}>
          <path
            d={`M ${CX - 46} ${300} Q ${CX - 58} ${220} ${LEFT_ARROW_TIP.x} ${LEFT_ARROW_TIP.y}`}
            stroke={bloodColor} strokeWidth={SW_THIN * 1.1} strokeLinecap="round" fill="none"
          />
          <path
            d={`M ${CX + 46} ${300} Q ${CX + 58} ${220} ${RIGHT_ARROW_TIP.x} ${RIGHT_ARROW_TIP.y}`}
            stroke={bloodColor} strokeWidth={SW_THIN * 1.1} strokeLinecap="round" fill="none"
          />
          <path d={LEFT_ARROW_HEAD} fill={bloodColor} stroke="none" />
          <path d={RIGHT_ARROW_HEAD} fill={bloodColor} stroke="none" />
        </g>
      ) : null}

      {/* 큐티클(피부 접힘) 선 - 손톱과 뿌리 부위를 시각적으로 구분 */}
      <path
        d={`M ${CX - 46} ${132} Q ${CX} ${146} ${CX + 46} ${132}`}
        stroke={stroke} strokeWidth={SW_THIN * 0.7} fill="none" opacity={0.55}
      />

      {/* 손톱 */}
      <ellipse
        cx={CX} cy={NAIL_CY} rx={40} ry={50} fill={C.paper} stroke={stroke}
        strokeWidth={strokeWidth * 0.7} opacity={0.96}
      />
    </svg>
  );
};

export default NailRootDiagram;
