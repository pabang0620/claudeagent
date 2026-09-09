/** 개 코 클로즈업 다이어그램 (general-ep19, "개가 숨 쉬면서도 냄새 맡는 이유").
 *  REGISTRY 3~4절 확인 완료 - `props/Animals.tsx`(Mouse/Whale/Sloth)에 개 자산이 없어 신설한다.
 *  실사진 벤치마크가 아니라 이 채널의 기존 클로즈업 다이어그램(HiccupDiagram/GoosebumpDiagram
 *  과 동일 원칙 - "지금 이 순간의 상태"만 그리고, 시간에 따른 변화는 호출부가 0~1 progress로
 *  넘긴다)과 같은 방식으로 처음부터 그린 순수 도형이라 원칙 0-1(참고 이미지 벡터화)의
 *  적용 대상이 아니다(참고 이미지 자체가 없다).
 *
 *  구조: 콧구멍(둥근 구멍, 들숨이 드나드는 곳)과 그 바로 옆 "옆트임"(가늘고 긴 갈라진
 *  틈, 날숨 전용 통로)을 좌우 대칭으로 그린다. 오른쪽(화면 기준)을 "히어로" 쪽으로 잡아
 *  하이라이트 링·라벨 앵커(DOG_SLIT_LABEL_PT)를 오른쪽 옆트임에만 둔다(대본 s2 "카메라가
 *  콧구멍 옆쪽으로 살짝 더 확대"가 한쪽을 클로즈업하는 연출이기 때문).
 *
 *  프레임을 직접 받는다(HeadNerveDiagram/VoicePathDiagram과 동일 예외 - REGISTRY 3절 원칙은
 *  "무작위 금지"이지 "프레임 금지"가 아니다). 실룩임(sniffT)과 하이라이트 링 펄스는 반복
 *  주기 애니메이션이라 frame 기반 sin이 필요하고, `sniffRateBoost`(0~1)로 그 반복 주기 자체를
 *  s1(느림) -> s6(빠름)로 바꾼다(Math.random 은 어디에도 쓰지 않는다 - 원칙 3).
 *
 *  inhaleProgress/exhaleProgress 는 "한 번 채워지는 진행도"가 아니라 호출부가
 *  `(f % cycleFrames) / cycleFrames` 로 만든 **반복되는 0~1 위상**이다. 화살표가 각 주기마다
 *  나타났다 이동하며 사라지는 흐름 애니메이션이 된다(대본 s4 "화살표 2개가 동시에 움직임").
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** viewBox 크기(px). 라벨을 이 다이어그램 밖에서 Label 로 얹으려면
 *    scale = width / DOG_NOSE_VB_W
 *    screenX = diagramX + anchor.x * scale, screenY = diagramY + anchor.y * scale */
export const DOG_NOSE_VB_W = 640;
export const DOG_NOSE_VB_H = 520;

const CX = 320;
const LOBE_CY = 300;
const HOLE_DX = 95;
const HOLE_RX = 42;
const HOLE_RY = 50;
const SLIT_DX = 165;
const SLIT_CY = 248;
const SLIT_HALF_W = 18;
const SLIT_HALF_H = 48;

/** 오른쪽(히어로) 옆트임의 화면 앵커 - "옆트임"/"Side slit" 라벨을 이 위에 얹는다.
 *  링 바로 위(SLIT_CY - SLIT_HALF_H - 46 근방)에 두면 링 상단(최대 SLIT_CY - 84 = 164)과
 *  겹친다(general-ep19 s3 실측 확인). 대신 viewBox 맨 위 여백(코 가죽 최상단 y=40 보다도
 *  위)에 둬서 어떤 pulse 값에도 겹칠 여지 자체를 없앤다. */
export const DOG_SLIT_LABEL_PT = { x: CX + SLIT_DX, y: 6 };
/** 콧구멍 중심 앵커 (좌/우) - MotionSwoosh 등 외부 이펙트를 콧구멍 옆에 배치할 때 쓴다 */
export const DOG_HOLE_R_PT = { x: CX + HOLE_DX, y: LOBE_CY };
export const DOG_HOLE_L_PT = { x: CX - HOLE_DX, y: LOBE_CY };

/** 실룩임 반복 주기(프레임). rateBoost=0 이면 느긋한 s1 리듬, 1이면 s6 의 촘촘한 리듬 */
const SNIFF_PERIOD_NORMAL = 16;
const SNIFF_PERIOD_FAST = 7;
/** 하이라이트 링 펄스 주기 - HeadNerveDiagram 의 PULSE_PERIOD_FRAMES 와 같은 값 */
const RING_PULSE_PERIOD = 46;

/** 텍스처용 고정 점(모공) 배치. 프레임마다 달라지면 안 되므로 상수 배열로 둔다(원칙 3) */
const PORES: [number, number][] = [
  [270, 350], [300, 400], [340, 400], [370, 350], [255, 200], [385, 200],
];

function lensPathD(cx: number, cy: number, halfW: number, halfH: number, sign: 1 | -1): string {
  const outerX = cx + sign * halfW;
  const innerX = cx - sign * halfW * 0.5;
  return (
    `M ${cx} ${cy - halfH} Q ${outerX} ${cy} ${cx} ${cy + halfH} ` +
    `Q ${innerX} ${cy} ${cx} ${cy - halfH} Z`
  );
}

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

export interface DogNoseCloseupProps {
  /** 씬 로컬 프레임. 실룩임·하이라이트 링 펄스·슐리렌 잔물결에 쓴다 */
  f: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 콧구멍 실룩임 애니메이션 세기(0=정지, 1=완전 실룩임). 주기는 sniffRateBoost 가 정한다 */
  sniffT?: number;
  /** 0~1. 오른쪽 옆트임 강조 링 등장 진행도 (s3) */
  slitHighlight?: number;
  /** 0~1. 반복 위상(호출부가 (f % cycle)/cycle 로 계산) - 콧구멍으로 들어가는 들숨 화살표 (s4) */
  inhaleProgress?: number;
  /** 0~1. 반복 위상 - 옆트임으로 빠지는 날숨 화살표 (s4) */
  exhaleProgress?: number;
  /** 0~1. 실룩임 반복 주기를 느림(0) -> 빠름(1)으로 (s6) */
  sniffRateBoost?: number;
  /** 0~1. 오른쪽 옆트임에서 옆으로 빠지는 공기 흐름을 슐리렌 촬영처럼 옅은 파형으로 (s7) */
  schlierenOverlay?: number;
  /** 0~1. 코 표면 촉촉한 광택 (s8) */
  wetShineOpacity?: number;
  stroke?: string;
  /** 주둥이(털) 배경색 */
  fill?: string;
  /** 코 가죽(비문) 색 */
  noseColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const DogNoseCloseup: React.FC<DogNoseCloseupProps> = ({
  f, width, x = 0, y = 0,
  sniffT = 0, slitHighlight = 0, inhaleProgress = 0, exhaleProgress = 0,
  sniffRateBoost = 0, schlierenOverlay = 0, wetShineOpacity = 0,
  stroke = C.ink, fill = '#F3E6D0', noseColor = '#3B4451', strokeWidth = SW, style,
}) => {
  const height = (width * DOG_NOSE_VB_H) / DOG_NOSE_VB_W;

  const period = lerp(SNIFF_PERIOD_NORMAL, SNIFF_PERIOD_FAST, sniffRateBoost);
  const wave = Math.sin((f / period) * Math.PI * 2);
  const wiggleAmp = 0.24 * clamp01(sniffT);
  const holeScaleX = 1 + wiggleAmp * wave;
  const slitScaleY = 1 + wiggleAmp * 0.5 * wave;

  const ringPulse = 0.5 + 0.5 * Math.sin(f / RING_PULSE_PERIOD);
  const highlightP = clamp01(slitHighlight);

  const inhaleT = clamp01(inhaleProgress);
  const inhaleOpacity = Math.sin(Math.PI * inhaleT);
  const exhaleT = clamp01(exhaleProgress);
  const exhaleOpacity = Math.sin(Math.PI * exhaleT);

  const schlierenP = clamp01(schlierenOverlay);
  const shineP = clamp01(wetShineOpacity);

  const holeColor = C.night;

  function side(sign: 1 | -1) {
    const holeCx = CX + sign * HOLE_DX;
    const slitCx = CX + sign * SLIT_DX;
    const isHero = sign === 1;

    const inhaleY = lerp(LOBE_CY - 115, LOBE_CY - 28, inhaleT);
    const exhaleX = lerp(slitCx + sign * 4, slitCx + sign * 96, exhaleT);
    const exhaleY = SLIT_CY;

    return (
      <g key={sign}>
        {/* 콧구멍 (둥근 구멍, 들숨이 드나드는 곳) - sniffT/sniffRateBoost 로 실룩임 */}
        <g transform={`translate(${holeCx} ${LOBE_CY}) scale(${holeScaleX} 1) translate(${-holeCx} ${-LOBE_CY})`}>
          <ellipse cx={holeCx} cy={LOBE_CY} rx={HOLE_RX} ry={HOLE_RY} fill={holeColor} />
          <ellipse cx={holeCx - sign * 10} cy={LOBE_CY - 14} rx={9} ry={11} fill={fill} opacity={0.22} />
        </g>

        {/* 옆트임 (가늘고 긴 틈, 날숨 전용 통로) */}
        <g transform={`translate(${slitCx} ${SLIT_CY}) scale(1 ${slitScaleY}) translate(${-slitCx} ${-SLIT_CY})`}>
          <path d={lensPathD(slitCx, SLIT_CY, SLIT_HALF_W, SLIT_HALF_H, sign)} fill={holeColor} />
        </g>

        {/* 히어로(오른쪽) 옆트임 강조 링 - s3 */}
        {isHero && highlightP > 0.001 ? (
          <ellipse
            cx={slitCx} cy={SLIT_CY} rx={SLIT_HALF_W + 34 + 6 * ringPulse} ry={SLIT_HALF_H + 30 + 6 * ringPulse}
            fill="none" stroke={C.gold} strokeWidth={9}
            opacity={highlightP * (0.55 + 0.3 * ringPulse)}
          />
        ) : null}

        {/* 들숨 화살표 - 콧구멍 안쪽으로 이동 */}
        {inhaleOpacity > 0.02 ? (
          <polygon
            points={arrowPoints(holeCx, inhaleY, 0, 1, 20)}
            fill={C.seaDeep} opacity={inhaleOpacity}
          />
        ) : null}

        {/* 날숨 화살표 - 옆트임 밖으로 이동 */}
        {exhaleOpacity > 0.02 ? (
          <polygon
            points={arrowPoints(exhaleX, exhaleY, sign, 0, 20)}
            fill={C.coral} opacity={exhaleOpacity}
          />
        ) : null}

        {/* 슐리렌(공기 흐름) 잔물결 - 히어로 쪽에만, s7 */}
        {isHero && schlierenP > 0.001 ? (
          <g opacity={schlierenP * 0.8}>
            {[0, 1, 2].map((i) => {
              const baseY = SLIT_CY - 26 + i * 26;
              const ripple = Math.sin(f / 20 + i * 1.4) * 5;
              const len = 130 * schlierenP;
              const pts: string[] = [];
              const steps = 10;
              for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const px = slitCx + sign * (16 + t * len);
                const py = baseY + Math.sin(t * Math.PI * 2.4 + f / 14 + i) * (6 + ripple * t);
                pts.push(`${s === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
              }
              return (
                <path key={i} d={pts.join(' ')} fill="none" stroke={C.sky} strokeWidth={5}
                  strokeLinecap="round" opacity={0.85 - i * 0.18} />
              );
            })}
          </g>
        ) : null}
      </g>
    );
  }

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${DOG_NOSE_VB_W} ${DOG_NOSE_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
        shapeRendering="geometricPrecision"
      >
        {/* 주둥이(털) 배경 - 화면 가장자리로 번지듯 크게 깔아 "클로즈업" 프레이밍을 만든다 */}
        <ellipse cx={CX} cy={LOBE_CY - 40} rx={460} ry={380} fill={fill} />

        {/* 코 가죽(비문) */}
        <path
          d={`M ${CX} 70 C ${CX - 50} 40, ${CX - 115} 45, ${CX - 155} 90
              C ${CX - 210} 150, ${CX - 225} 230, ${CX - 212} 305
              C ${CX - 198} 385, ${CX - 145} 452, ${CX} 465
              C ${CX + 145} 452, ${CX + 198} 385, ${CX + 212} 305
              C ${CX + 225} 230, ${CX + 210} 150, ${CX + 155} 90
              C ${CX + 115} 45, ${CX + 50} 40, ${CX} 70 Z`}
          fill={noseColor} stroke={stroke} strokeWidth={strokeWidth}
        />

        {/* 인중(중앙 세로 홈) */}
        <path
          d={`M ${CX} 110 Q ${CX - 8} 270 ${CX} 430`}
          fill="none" stroke={stroke} strokeWidth={SW_THIN} opacity={0.3}
        />

        {/* 텍스처(모공) */}
        {PORES.map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={4.5} fill={stroke} opacity={0.18} />
        ))}

        {side(1)}
        {side(-1)}

        {/* 촉촉한 광택 - s8 */}
        {shineP > 0.001 ? (
          <g opacity={shineP}>
            <ellipse cx={CX - 60} cy={160} rx={70} ry={34} fill={fill} opacity={0.45}
              transform={`rotate(-22 ${CX - 60} 160)`} />
            <ellipse cx={CX + 100} cy={210} rx={26} ry={14} fill={fill} opacity={0.55}
              transform={`rotate(-10 ${CX + 100} 210)`} />
            <ellipse cx={CX - 130} cy={330} rx={20} ry={11} fill={fill} opacity={0.4} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default DogNoseCloseup;
