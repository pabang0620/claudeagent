/** 고양이(이름 미정) 전신 - general-ep28, "고양이가 골골거리는 이유"의 s1(무릎 위에 앉아
 *  골골거리는 고양이)에서 처음 쓴다. REGISTRY 3~4절 확인 완료 - 개(`DogStanding`)는 있으나
 *  고양이 소품이 없어 신설한다(오케스트레이터 지시 명시).
 *
 *  참고 이미지 없이 이 채널 공용 스타일(단색 잉크선 + 흰/옅은 채움, 플랫, 그림자 없음)로 처음부터
 *  그린 순수 도형이라 원칙 0-1(참고 이미지 벡터화)의 적용 대상이 아니다(`DogStanding`/`Giraffe`와
 *  동일 사유).
 *
 *  조형 언어는 `DogStanding`과 동일하게 맞춘다(오케스트레이터 지시) - 둥근 도형, 굵은 선, 단순한
 *  눈. 앉은 자세(무릎 위/바닥에 웅크려 앉은 고양이 실루엣)로 몸통을 둥근 "식빵" 형태로 그리고,
 *  머리는 몸통 대비 크게(귀여움), 눈은 하나만(옆모습 관례 - Mouse/Whale/DogStanding과 동일),
 *  귀는 뾰족한 삼각형 2개(고양이의 대표 실루엣이라 DogStanding의 "귀 하나" 관례의 예외로 둘 다
 *  그린다 - 앞쪽 귀를 크게, 뒤쪽 귀를 작게 겹쳐 원근을 준다). 수염은 2~3가닥만(신체 표현은
 *  최소한으로 - "징그럽다" 재발 방지, shortform-builder.md 해당 절).
 *
 *  viewBox 620x700, 화면 픽셀과 1:1(DogStanding과 동일 설계). 바닥선(엉덩이/앞발이 닿는 y) = 660.
 *
 *  꼬리 흔들기(tailSwayT)는 frame 기반 결정적 sin 함수로만 움직인다(Math.random 미사용, 원칙 3,
 *  DogStanding의 tailWagT와 동일 예외 - REGISTRY 3절 "무작위 금지"이지 "프레임 금지" 아님).
 *  팔다리(다리)는 리깅하지 않는다(정적 실루엣 + 꼬리 스윙만 움직임 - 퍼둥이 캐릭터 교훈과 동일
 *  원칙, feedback_perdungi_no_limb_rigging).
 *
 *  `hurt`(0~1, general-ep28 s6 "다치거나 움츠린 모습")는 새 형태를 그리지 않고 기존 실루엣을
 *  변형한다 - 눈이 감기듯 가늘어지고(eyeOpen 축소), 꼬리가 아래로 축 처지며(스윙 진폭이 줄고
 *  낮게 처짐), 몸이 살짝 웅크려(scale 축소 + 아주 약간의 lean) 움츠린 인상을 준다. 붕대·상처
 *  등 별도 장식은 그리지 않는다(신체 표현 최소화 원칙).
 */
import React from 'react';
import { C, SW } from '../theme';

export const CAT_STANDING_VB_W = 620;
export const CAT_STANDING_VB_H = 700;
/** 바닥선(엉덩이/앞발이 닿는 화면 y, viewBox 좌표) */
export const CAT_STANDING_GROUND_VB = 660;

/** 꼬리 회전 기준점(viewBox 좌표) - 몸통과 만나는 지점 */
const TAIL_BASE = { x: 168, y: 500 };
/** 꼬리 스윙 반복 주기(프레임). 강아지보다 느긋하게 - 고양이 특유의 여유로운 움직임 */
const TAIL_SWAY_PERIOD = 46;
const TAIL_SWAY_DEG = 20;

export interface CatFullProps {
  /** 씬 로컬 프레임. 꼬리 스윙 위상에 쓴다 */
  f: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 꼬리 스윙 진폭(0=정지, 1=완전히 흔듦) */
  tailSwayT?: number;
  /** 0~1. 다치거나 움츠린 인상(s6). 0 = 평상시 편안한 모습 그대로 */
  hurt?: number;
  stroke?: string;
  /** 몸통 털색 */
  fill?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const CatFull: React.FC<CatFullProps> = ({
  f, width, x = 0, y = 0, tailSwayT = 1, hurt = 0,
  stroke = C.ink, fill = '#F0B87B', strokeWidth = SW, style,
}) => {
  const height = (width * CAT_STANDING_VB_H) / CAT_STANDING_VB_W;
  const hurtK = Math.max(0, Math.min(1, hurt));
  const swayAmp = Math.max(0, Math.min(1, tailSwayT)) * (1 - 0.55 * hurtK);
  const swayAngle = Math.sin((f / TAIL_SWAY_PERIOD) * Math.PI * 2) * TAIL_SWAY_DEG * swayAmp;
  // 움츠릴수록 꼬리를 아래로 축 처지게(회전 기준점 자체를 살짝 내림 대신, 정지 각도를 낮춘다)
  const tailDroop = hurtK * 26;
  // 눈: 평상시엔 만족스러운 곡선(반달눈), 움츠릴수록 더 가늘어진다(원, 점 무리 아님 - 곡선 하나)
  const eyeCloseK = hurtK; // 0 = 반달, 1 = 거의 감김
  const bodyScale = 1 - 0.04 * hurtK;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${CAT_STANDING_VB_W} ${CAT_STANDING_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
        shapeRendering="geometricPrecision"
      >
        <g transform={`translate(310 480) scale(${bodyScale}) translate(-310 -480)`}>
          {/* 꼬리 - 몸통과 만나는 지점을 기준으로 좌우 스윙, 움츠릴수록 아래로 처짐 */}
          <path
            d="M 168 500 C 108 486, 78 428, 108 384 C 132 350, 172 358, 176 396"
            fill="none" stroke={stroke} strokeWidth={26} strokeLinecap="round"
            transform={`rotate(${swayAngle + tailDroop} ${TAIL_BASE.x} ${TAIL_BASE.y})`}
          />

          {/* 앞발 (짧고 통통, 앉은 자세) */}
          <g stroke={stroke} strokeWidth={20} strokeLinecap="round" fill="none">
            <line x1={248} y1={560} x2={244} y2={648} />
            <line x1={392} y1={560} x2={398} y2={648} />
          </g>
          <ellipse cx={244} cy={654} rx={28} ry={15} fill={fill} stroke={stroke} strokeWidth={10} />
          <ellipse cx={398} cy={654} rx={28} ry={15} fill={fill} stroke={stroke} strokeWidth={10} />

          {/* 몸통 - 둥근 "식빵" 형태로 앉음 */}
          <path
            d="M 168 660 C 140 660, 132 540, 176 470 C 220 402, 320 388, 400 420
               C 470 448, 486 540, 468 610 C 452 656, 400 660, 320 660 Z"
            fill={fill} stroke={stroke} strokeWidth={strokeWidth}
          />

          {/* 뒤쪽 귀(작게, 원근) */}
          <path d="M 372 232 L 400 118 L 448 240 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

          {/* 머리 */}
          <circle cx={430} cy={272} r={148} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

          {/* 앞쪽 귀(크게) */}
          <path d="M 352 210 L 330 66 L 430 202 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M 358 190 L 348 108 L 400 188 Z" fill="none" stroke={stroke} strokeWidth={SW * 0.5} opacity={0.4} />

          {/* 볼터치 */}
          <ellipse cx={448} cy={318} rx={19} ry={11} fill={C.coral} opacity={0.45} />

          {/* 목줄 - 코랄 액센트 1개 (general 프로필 6절, "2색을 넘기지 않는다") */}
          <path d="M 356 384 Q 408 410 388 444" fill="none" stroke={C.coral} strokeWidth={18} strokeLinecap="round" />
          <circle cx={386} cy={436} r={11} fill={C.gold} stroke={stroke} strokeWidth={5} />

          {/* 주둥이 */}
          <ellipse cx={508} cy={310} rx={62} ry={46} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          {/* 코 */}
          <path d="M 552 292 L 566 306 L 552 320 Z" fill={C.coral} stroke={stroke} strokeWidth={6} />
          {/* 입 */}
          <path d="M 548 322 Q 560 334 574 322" fill="none" stroke={stroke} strokeWidth={7} strokeLinecap="round" />

          {/* 수염 - 2~3가닥만 (촘촘한 텍스처 금지) */}
          <g stroke={stroke} strokeWidth={SW * 0.35} strokeLinecap="round" opacity={0.55}>
            <line x1={548} y1={296} x2={606} y2={282} />
            <line x1={552} y1={310} x2={612} y2={310} />
          </g>

          {/* 눈 - 하나(옆모습 관례). 평상시 반달눈(만족), 움츠릴수록 더 가늘어짐 */}
          <path
            d={`M ${402 - 8} 264 Q 430 ${264 - 14 * (1 - eyeCloseK)} ${458 - 8} 264`}
            fill="none" stroke={stroke} strokeWidth={eyeCloseK > 0.85 ? SW * 0.7 : SW * 0.55}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default CatFull;
