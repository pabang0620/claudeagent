/** 고양이 목 클로즈업 + 성대 근육 떨림 다이어그램 (general-ep28, "고양이가 골골거리는 이유").
 *  REGISTRY 확인 완료 - `VoicePathDiagram`(소리가 두 경로로 귀까지 가는 구조)·`HiccupDiagram`
 *  (근육 경련->통로 폐쇄)은 있으나 "성대 근육이 빠르게 실룩여 좁은 틈을 반복해서 여닫는다"는
 *  구조를 보여주는 자산이 없어 신설한다.
 *
 *  `DogNoseCloseup`과 같은 설계 원칙(HiccupDiagram·GoosebumpDiagram과 동일 - "지금 이 순간의
 *  상태"만 그리고 시간 변화는 호출부가 0~1 progress로 넘긴다)이되, 빠른 떨림(`vibrateT`)만은
 *  반복 주기 애니메이션이라 `f`(프레임)를 직접 받는 예외를 쓴다(Math.random 은 쓰지 않는다,
 *  원칙 3 - DogNoseCloseup의 sniffT/f 패턴과 동일 예외).
 *
 *  진동 표현은 오케스트레이터 지시대로 "작은 점 무리"가 아니라 **큰 물결선 2~3개**로만
 *  한다(양옆으로 뻗는 물결 파형 2개). 성대 틈(gap)도 촘촘한 텍스처 없이 단일 슬릿 도형
 *  하나로 표현한다.
 *
 *  `inhaleProgress`/`exhaleProgress`(0~1, 반복 위상 - 호출부가 `(f % cycle)/cycle`로 계산)는
 *  DogNoseCloseup과 동일한 방식으로 성대 틈을 지나 위(날숨, 입 쪽)/아래(들숨, 폐 쪽)로 흐르는
 *  화살표를 그린다. 화살표 색은 DogNoseCloseup과 같은 의미 규약을 재사용한다
 *  (들숨=C.seaDeep 차가운 공기, 날숨=C.coral 나가는 공기) - 채널 전체에서 "들숨/날숨" 색
 *  의미를 통일해 다른 화와 시각 문법이 어긋나지 않게 한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const CAT_PURR_VB_W = 640;
export const CAT_PURR_VB_H = 820;

const CX = 320;
const HEAD_CY = 150;
const HEAD_R = 148;
const NECK_TOP = 258;
const NECK_BOTTOM = 706;
const NECK_HALF_W = 132;
const GAP_CY = 482;
const GAP_HALF_W = 74;

/** 성대 틈(gap) 라벨 앵커 - 머리(귀) 바로 아래, 근육 타원 위쪽의 빈 목 공간에 둔다.
 *  viewBox 맨 위 여백(y=6)에 두면 귀 삼각형이 y=-82(끝)~54(밑변)까지 걸쳐 있어 라벨과
 *  겹친다(general-ep28 실측 - DOG_SLIT_LABEL_PT를 그대로 흉내 냈다가 f008에서 겹침 발견,
 *  이 컴포넌트는 DogNose와 달리 귀가 위쪽 여백을 침범하는 형태라 같은 좌표를 못 쓴다).
 *  head 아래(298) ~ 근육 위(442) 사이가 비어 있어 그 중간(360)에 둔다. */
export const CAT_PURR_LABEL_PT = { x: CX, y: 360 };
/** 성대 틈 중심 좌표 - 화살표·물결선 등 외부 이펙트를 배치할 때 쓴다 */
export const CAT_PURR_GAP_PT = { x: CX, y: GAP_CY };

/** 빠른 떨림 반복 주기(프레임). "1초에 수십 번"을 30fps에서 그대로 재현할 순 없지만,
 *  짧은 주기로 계속 흔들려야 "빠르게 떨린다"는 인상을 준다 */
const VIBRATE_PERIOD = 5;
/** 큰 물결선 파동 주기 */
const WAVE_PERIOD = 22;

function arrowPoints(tipX: number, tipY: number, dirX: number, dirY: number, size: number): string {
  const len = Math.hypot(dirX, dirY) || 1;
  const dx = dirX / len;
  const dy = dirY / len;
  const nx = -dy;
  const ny = dx;
  const backX = tipX - dx * size;
  const backY = tipY - dy * size;
  return (
    `${tipX},${tipY} ${backX + nx * size * 0.6},${backY + ny * size * 0.6} ` +
    `${backX - nx * size * 0.6},${backY - ny * size * 0.6}`
  );
}

/** 성대 틈 밖으로 뻗는 큰 물결선 하나(작은 점 무리 대신 물결 파형 하나) */
function waveLine(cx: number, cy: number, sign: 1 | -1, len: number, f: number, seed: number, opacity: number) {
  const steps = 14;
  const pts: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const px = cx + sign * (26 + t * len);
    const py = cy + Math.sin(t * Math.PI * 2.2 + f / WAVE_PERIOD + seed) * (10 + 22 * t);
    pts.push(`${s === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return <path d={pts.join(' ')} fill="none" stroke={C.gold} strokeWidth={9} strokeLinecap="round" opacity={opacity} />;
}

export interface CatPurrDiagramProps {
  /** 씬 로컬 프레임. 빠른 떨림·물결선 파동에 쓴다 */
  f: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 성대 근육이 빠르게 실룩이는 진동 세기(0=고요, 1=완전히 떨림). s3~s5 동안 유지 */
  vibrateT?: number;
  /** 0~1. 반복 위상 - 성대 틈 아래(폐 쪽)로 흐르는 들숨 화살표 (s4) */
  inhaleProgress?: number;
  /** 0~1. 반복 위상 - 성대 틈 위(입 쪽)로 흐르는 날숨 화살표 (s4) */
  exhaleProgress?: number;
  stroke?: string;
  /** 목 피부색 */
  fill?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const CatPurrDiagram: React.FC<CatPurrDiagramProps> = ({
  f, width, x = 0, y = 0,
  vibrateT = 0, inhaleProgress = 0, exhaleProgress = 0,
  stroke = C.ink, fill = '#F0B87B', strokeWidth = SW, style,
}) => {
  const height = (width * CAT_PURR_VB_H) / CAT_PURR_VB_W;
  const vib = clamp01(vibrateT);
  const wave = Math.sin((f / VIBRATE_PERIOD) * Math.PI * 2);
  const jitterHalfH = 6 + 30 * vib * (0.5 + 0.5 * Math.abs(wave));

  const musclePulse = 0.5 + 0.5 * Math.sin(f / (VIBRATE_PERIOD * 3));
  const muscleFill = vib > 0.01 ? C.coral : C.coralSoft;
  const muscleOpacity = vib > 0.01 ? 0.35 + 0.4 * vib * musclePulse : 0.25;

  const inhaleT = clamp01(inhaleProgress);
  const inhaleOpacity = Math.sin(Math.PI * inhaleT);
  const inhaleY = GAP_CY + 40 + inhaleT * (NECK_BOTTOM - GAP_CY - 100);

  const exhaleT = clamp01(exhaleProgress);
  const exhaleOpacity = Math.sin(Math.PI * exhaleT);
  const exhaleY = GAP_CY - 40 - exhaleT * (GAP_CY - NECK_TOP - 60);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${CAT_PURR_VB_W} ${CAT_PURR_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
        shapeRendering="geometricPrecision"
      >
        {/* 목 (뒤쪽 배경, 클로즈업 프레이밍) */}
        <path
          d={`M ${CX - NECK_HALF_W} ${NECK_TOP} L ${CX - NECK_HALF_W - 14} ${NECK_BOTTOM}
              Q ${CX} ${NECK_BOTTOM + 26} ${CX + NECK_HALF_W + 14} ${NECK_BOTTOM}
              L ${CX + NECK_HALF_W} ${NECK_TOP} Z`}
          fill={fill} stroke={stroke} strokeWidth={strokeWidth}
        />

        {/* 머리(위쪽 일부만 - 클로즈업이라 프레임 위로 살짝 걸침) */}
        <circle cx={CX} cy={HEAD_CY} r={HEAD_R} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* 귀 2개 */}
        <path d={`M ${CX - 78} ${HEAD_CY - 96} L ${CX - 96} ${HEAD_CY - 232} L ${CX - 10} ${HEAD_CY - 108} Z`}
          fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <path d={`M ${CX + 78} ${HEAD_CY - 96} L ${CX + 96} ${HEAD_CY - 232} L ${CX + 10} ${HEAD_CY - 108} Z`}
          fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* 감은 눈 두 개(만족스러운 표정, 반달) */}
        <path d={`M ${CX - 74} ${HEAD_CY + 14} Q ${CX - 44} ${HEAD_CY - 4} ${CX - 14} ${HEAD_CY + 14}`}
          fill="none" stroke={stroke} strokeWidth={SW * 0.6} strokeLinecap="round" />
        <path d={`M ${CX + 14} ${HEAD_CY + 14} Q ${CX + 44} ${HEAD_CY - 4} ${CX + 74} ${HEAD_CY + 14}`}
          fill="none" stroke={stroke} strokeWidth={SW * 0.6} strokeLinecap="round" />

        {/* 목 중심 안내선(해부학적 정교함 없이 위치만 암시) */}
        <line x1={CX} y1={NECK_TOP + 18} x2={CX} y2={GAP_CY - 60} stroke={stroke} strokeWidth={SW_THIN} opacity={0.18} />
        <line x1={CX} y1={GAP_CY + 60} x2={CX} y2={NECK_BOTTOM - 20} stroke={stroke} strokeWidth={SW_THIN} opacity={0.18} />

        {/* 성대 근육(좌우, 실룩임에 따라 색이 진해짐) - 큰 도형 2개, 점 없음 */}
        <ellipse cx={CX - GAP_HALF_W - 38} cy={GAP_CY} rx={54} ry={40} fill={muscleFill} opacity={muscleOpacity} />
        <ellipse cx={CX + GAP_HALF_W + 38} cy={GAP_CY} rx={54} ry={40} fill={muscleFill} opacity={muscleOpacity} />

        {/* 큰 물결선 2개 - 진동이 퍼지는 모습(점 무리 대신) */}
        {vib > 0.02 ? (
          <g opacity={0.5 + 0.5 * vib}>
            {waveLine(CX - GAP_HALF_W, GAP_CY, -1, 150 * vib, f, 0, vib)}
            {waveLine(CX + GAP_HALF_W, GAP_CY, 1, 150 * vib, f, 2.1, vib)}
          </g>
        ) : null}

        {/* 성대 틈(gap) - 단일 슬릿, 빠르게 여닫힘 */}
        <path
          d={`M ${CX - GAP_HALF_W} ${GAP_CY} Q ${CX} ${GAP_CY - jitterHalfH} ${CX + GAP_HALF_W} ${GAP_CY}
              Q ${CX} ${GAP_CY + jitterHalfH} ${CX - GAP_HALF_W} ${GAP_CY} Z`}
          fill={C.night}
        />

        {/* 들숨 화살표 - 성대 틈에서 아래(폐 쪽)로 */}
        {inhaleOpacity > 0.02 ? (
          <polygon points={arrowPoints(CX, inhaleY, 0, 1, 24)} fill={C.seaDeep} opacity={inhaleOpacity} />
        ) : null}
        {/* 날숨 화살표 - 성대 틈에서 위(입 쪽)로 */}
        {exhaleOpacity > 0.02 ? (
          <polygon points={arrowPoints(CX, exhaleY, 0, -1, 24)} fill={C.coral} opacity={exhaleOpacity} />
        ) : null}
      </svg>
    </div>
  );
};

export default CatPurrDiagram;
