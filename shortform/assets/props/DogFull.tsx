/** 강아지(몽뭉이) 전신 - general-ep19 v3, "개가 숨 쉬면서도 냄새 맡는 이유"의 s1(강아지 등장)에서
 *  처음 쓴다. `props/DogNose.tsx`(코 클로즈업)와 같은 개로 보이도록 색을 맞춘다 -
 *  fill(주둥이·몸통 털) #F3E6D0, noseColor(코 가죽) #3B4451는 `DogNoseCloseup`의 기본값과 동일하다.
 *
 *  참고 이미지 없이 이 채널 공용 스타일(단색 잉크선 + 흰/옅은 채움, 플랫, 그림자 없음)로 처음부터
 *  그린 순수 도형이라 원칙 0-1(참고 이미지 벡터화)의 적용 대상이 아니다(`DogNose.tsx`/`Giraffe.tsx`
 *  와 동일 사유).
 *
 *  비례: 머리(원)를 몸통 대비 크게 잡아(대략 전체 높이의 50% 안팎) "엄청 귀여운" 요구사항을
 *  충족한다. 팔다리(다리)는 짧고 통통하게, 몸통은 둥근 타원으로 통통하게, 눈은 크고 둥글게(검은
 *  원 + 흰 하이라이트 점), 귀는 한쪽만 그린 처진 귀(이 채널의 기존 옆모습 동물 - Mouse/Whale -
 *  과 동일하게 "눈 하나·귀 하나" 옆모습 관례를 따른다), 꼬리는 위로 살짝 말린 짧은 형태.
 *
 *  신체 표현은 최소한으로 - 피부 위에 점·돌기 등 작은 요소를 반복해서 찍지 않는다(원칙,
 *  shortform-builder.md "신체 표현은 최소한으로" 절). 액센트는 코랄(collar) 1개만 쓴다
 *  (general 프로필 6절 "2색을 넘기지 않는다").
 *
 *  viewBox 620x700, 화면 픽셀과 1:1(Giraffe.tsx 620x1000/바닥선 950과 같은 설계 원칙 - 세로로
 *  넉넉히 잡고 바닥선을 하단 근처에 고정). 바닥선(발 밑) y = 660.
 *
 *  꼬리 흔들기(tailWagT)는 frame 기반 결정적 sin 함수로만 움직인다(Math.random 미사용, 원칙 3).
 *  DogNoseCloseup의 sniffT/f 패턴과 동일한 예외(REGISTRY 3절 "무작위 금지"이지 "프레임 금지"
 *  아님)로 frame(f)을 직접 받는다. 팔다리는 리깅하지 않는다(정적 실루엣 + 꼬리 회전만 움직임 -
 *  퍼둥이 캐릭터 교훈과 동일 원칙, feedback_perdungi_no_limb_rigging).
 */
import React from 'react';
import { C, SW } from '../theme';

export const DOG_STANDING_VB_W = 620;
export const DOG_STANDING_VB_H = 700;
/** 바닥선(발이 닿는 화면 y, viewBox 좌표) */
export const DOG_STANDING_GROUND_VB = 660;

/** 꼬리 회전 기준점(viewBox 좌표) - 몸통과 만나는 지점 */
const TAIL_BASE = { x: 138, y: 478 };
/** 꼬리 흔들기 반복 주기(프레임). 짧고 빠르게 - 신난 강아지의 잦은 흔들림 */
const TAIL_WAG_PERIOD = 10;
/** 말린 짧은 꼬리는 회전축(피벗)에서 끝까지 거리가 짧아, 각도를 크게 줘야 화면에서
 *  실제로 "살랑거리는" 움직임으로 읽힌다(22도로는 육안 확인 결과 거의 안 보였다 - 확대
 *  프레임 비교로 실측). 34도로 올려 재확인. */
const TAIL_WAG_DEG = 34;

export interface DogStandingProps {
  /** 씬 로컬 프레임. 꼬리 흔들기 위상에 쓴다(반복 애니메이션 예외 - DogNoseCloseup과 동일) */
  f: number;
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 꼬리 흔들기 진폭(0=정지, 1=완전히 흔듦). 등장 직후 0->1로 올리면 자연스럽다 */
  tailWagT?: number;
  /** 0~1. 입 벌림(하품 등 반응용, general-ep21 신설). 0 = 기존 미소 곡선 그대로,
   *  1에 가까울수록 미소 곡선이 옅어지며 그 자리에 벌어진 타원 입이 진해진다 - 과거 화(ep19)는
   *  이 prop을 넘기지 않으므로 기본값 0에서 기존 렌더와 완전히 동일하다. */
  mouthOpen?: number;
  stroke?: string;
  /** 몸통·주둥이 털색 (기본값을 DogNoseCloseup의 fill과 동일하게 맞춰 "같은 개"로 보이게 한다) */
  fill?: string;
  /** 코 가죽색 (DogNoseCloseup의 noseColor와 동일 기본값) */
  noseColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const DogStanding: React.FC<DogStandingProps> = ({
  f, width, x = 0, y = 0, tailWagT = 1, mouthOpen = 0,
  stroke = C.ink, fill = '#F3E6D0', noseColor = '#3B4451', strokeWidth = SW, style,
}) => {
  const height = (width * DOG_STANDING_VB_H) / DOG_STANDING_VB_W;
  const wagAmp = Math.max(0, Math.min(1, tailWagT));
  const wagAngle = Math.sin((f / TAIL_WAG_PERIOD) * Math.PI * 2) * TAIL_WAG_DEG * wagAmp;
  const mouthK = Math.max(0, Math.min(1, mouthOpen));

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${DOG_STANDING_VB_W} ${DOG_STANDING_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
        shapeRendering="geometricPrecision"
      >
        {/* 다리 (짧고 통통) */}
        <g stroke={stroke} strokeWidth={18} strokeLinecap="round" fill="none">
          <line x1={215} y1={555} x2={205} y2={650} />
          <line x1={400} y1={555} x2={408} y2={650} />
        </g>

        {/* 꼬리 - 몸통과 만나는 지점을 기준으로 좌우 회전 */}
        <path
          d="M 138 478 C 92 462, 86 412, 122 396 C 150 384, 170 407, 152 428"
          fill="none" stroke={stroke} strokeWidth={24} strokeLinecap="round"
          transform={`rotate(${wagAngle} ${TAIL_BASE.x} ${TAIL_BASE.y})`}
        />

        {/* 몸통 */}
        <ellipse cx={300} cy={505} rx={168} ry={122} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

        {/* 머리 */}
        <circle cx={415} cy={270} r={140} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

        {/* 귀 (처진 귀 하나 - 옆모습 관례, Mouse/Whale과 동일) */}
        <path
          d="M 333.4 188.4 C 277.6 201.3 243.2 261.4 257.8 325.8 C 269.0 374.8 316.2 388.5 335.1 357.6
             C 316.2 330.1 309.3 287.2 316.2 244.2 C 321.4 214.2 342.0 197.0 333.4 188.4 Z"
          fill={fill} stroke={stroke} strokeWidth={strokeWidth}
        />

        {/* 목줄 - 코랄 액센트 1개 (general 프로필 6절, "2색을 넘기지 않는다") */}
        <path d="M 340 378 Q 392 404 372 438" fill="none" stroke={C.coral} strokeWidth={18} strokeLinecap="round" />
        <circle cx={370} cy={430} r={10} fill={C.coral} stroke={stroke} strokeWidth={5} />

        {/* 주둥이 */}
        <ellipse cx={492.3} cy={315.5} rx={70.4} ry={53.3} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

        {/* 코 가죽 (DogNoseCloseup과 동일 noseColor) */}
        <ellipse cx={546.4} cy={307.8} rx={25.8} ry={20.6} fill={noseColor} stroke={stroke} strokeWidth={8} />
        <path d="M 520.7 343.9 Q 535.3 358.5 552.4 344.7" fill="none" stroke={stroke} strokeWidth={8}
          strokeLinecap="round" opacity={1 - mouthK} />
        {mouthK > 0.01 ? (
          <ellipse
            cx={534} cy={360} rx={8 + 13 * mouthK} ry={4 + 17 * mouthK}
            fill={C.coral} stroke={stroke} strokeWidth={5} opacity={mouthK}
          />
        ) : null}

        {/* 눈 (하나 - 옆모습) */}
        <circle cx={436.5} cy={251.1} r={22.3} fill={stroke} />
        <circle cx={428.7} cy={242.5} r={6.9} fill={C.paper} />

        {/* 볼터치 */}
        <ellipse cx={445.1} cy={298.3} rx={17.2} ry={9.4} fill={C.coral} opacity={0.5} />

        {/* 발 */}
        <ellipse cx={205} cy={656} rx={26} ry={14} fill={fill} stroke={stroke} strokeWidth={10} />
        <ellipse cx={408} cy={656} rx={26} ry={14} fill={fill} stroke={stroke} strokeWidth={10} />
      </svg>
    </div>
  );
};

export default DogStanding;
