/** 새(참새류) 소품. 옆모습 관례(눈 하나·날개 하나만 그림 - Mouse/Whale/DogStanding과 동일,
 *  "신체 표현은 최소한으로" 절 - 깃털을 잔선으로 채우지 않고 큰 도형 몇 개로만 구성)로 그린
 *  둥근 몸통 캐릭터. REGISTRY에 새 소품이 없어 general-ep44("전깃줄에 앉은 새가 감전되지
 *  않는 이유")를 위해 신설한다.
 *
 *  이 화의 핵심 대비 - "두 발이 같은 전선 위 가까운 자리에 있는 정상 자세" <-> "한쪽 발이
 *  멀리 뻗어 다른 지점(다른 전선·전봇대)에 닿는 위험 자세" - 를 `footGap`(0~1) 하나로
 *  연속 보간한다. 오른쪽 다리만 아래·바깥으로 뻗어나가 두 발 사이 간격이 벌어지는 형태라,
 *  같은 컴포넌트로 s3(발 클로즈업, 거의 붙음)부터 s6~s8(위험 자세, 크게 벌어짐)까지 이어서
 *  쓸 수 있다.
 *
 *  `wingSpread`(0~1)로 접은 날개(작은 새) <-> 활짝 편 날개(독수리·매 같은 큰 맹금류 실루엣,
 *  s8)를 같은 컴포넌트로 표현한다 - 별도 Raptor 컴포넌트를 만들지 않는다(원칙 0, 재사용).
 *
 *  다리는 얇은 선 + 끝에 두 갈래 발가락(Mosquito 다리 관례와 동일 - 촘촘한 발가락 다발 대신
 *  단순화)만 그린다. 이 컴포넌트는 새 자신만 그리고 전선은 그리지 않는다 - 전선·전류·스파크는
 *  `PowerlineDiagram`이 담당하고, 호출 씬이 두 컴포넌트의 좌표를 눈으로 맞춰 겹쳐 놓는다
 *  (NoodleDiagram 계열과 같은 관례 - 씬이 픽셀 좌표를 직접 계산해 배치).
 *
 *  참고 이미지 없이 이 채널 공용 스타일(단색 잉크선 + 흰/옅은 채움, 플랫)로 처음부터 그린
 *  순수 도형이라 원칙 0-1(벡터화)의 적용 대상이 아니다(Giraffe.tsx/DogFull.tsx와 동일 사유).
 */
import React from 'react';
import { C, SW_THIN } from '../theme';

export const BIRD_VB_W = 300;
export const BIRD_VB_H = 360;
/** 왼발(고정 다리)이 닿는 y - 전선 위치 기준으로 씀 (viewBox 좌표) */
export const BIRD_FOOT_BASE_Y = 250;
/** 왼발 x (viewBox 좌표) */
export const BIRD_LEFT_FOOT_X = 152;
/** 오른발 x - footGap=0 일 때 (viewBox 좌표) */
export const BIRD_RIGHT_FOOT_X_AT_0 = 180;
/** footGap=1 일 때 오른발이 추가로 이동하는 거리 (viewBox 좌표, dx/dy) */
export const BIRD_RIGHT_FOOT_SPREAD_DX = 108;
export const BIRD_RIGHT_FOOT_SPREAD_DY = 96;

export interface BirdProps {
  /** 화면상 가로 폭(px). 세로는 내부 비율로 자동 계산 */
  width: number;
  /** 중심 x (화면 좌표) */
  x: number;
  /** 중심 y (화면 좌표) - BIRD_FOOT_BASE_Y 부근이 발이 닿는 지점이다 */
  y: number;
  /** 0 = 두 발이 가까이 붙음(정상 전선 위 자세), 1 = 오른발이 멀리 뻗어 다른 지점에 닿음(위험 자세) */
  footGap?: number;
  /** 0 = 날개를 접음(작은 새), 1 = 활짝 펼침(큰 맹금류 실루엣) */
  wingSpread?: number;
  /** true면 좌우 반전 */
  flip?: boolean;
  stroke?: string;
  fill?: string;
  /** 부리색 (기본 gold) */
  accent?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Bird: React.FC<BirdProps> = ({
  width, x, y, footGap = 0, wingSpread = 0, flip = false,
  stroke = C.ink, fill = C.paper, accent = C.gold, strokeWidth = SW_THIN, style,
}) => {
  const gap = Math.max(0, Math.min(1, footGap));
  const spread = Math.max(0, Math.min(1, wingSpread));
  const height = (width * BIRD_VB_H) / BIRD_VB_W;

  const rightFootX = BIRD_RIGHT_FOOT_X_AT_0 + gap * BIRD_RIGHT_FOOT_SPREAD_DX;
  const rightFootY = BIRD_FOOT_BASE_Y + gap * BIRD_RIGHT_FOOT_SPREAD_DY;

  /* 날개 - 접힘(몸에 붙은 작은 삼각형)~펼침(몸통 뒤쪽 위로 높이 들어올린 큰 실루엣, 독수리·매)
   *  연속 보간. tip을 베지어 제어점이 아니라 경로 위의 실제 꼭짓점으로 둬서 - 베지어
   *  제어점은 곡선이 절반도 못 따라가는 문제가 실측됐다 - spread=1에서 확실히 위로
   *  튀어나오게 한다. 머리 쪽(왼쪽)이 아니라 꼬리 쪽(오른쪽, 몸통 뒤)으로 올려서 얼굴을
   *  가리지 않는다 */
  const wingTipX = 140 + spread * 80;
  const wingTipY = 130 - spread * 112;

  return (
    <div
      style={{
        position: 'absolute', left: x - width / 2, top: y - height / 2, width, height,
        transform: flip ? 'scaleX(-1)' : undefined, ...style,
      }}
    >
      <svg viewBox={`0 0 ${BIRD_VB_W} ${BIRD_VB_H}`} width="100%" height="100%" shapeRendering="geometricPrecision">
        {/* 다리 2개 + 발가락(두 갈래만, 단순화) */}
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
          <path d={`M 154 208 L ${BIRD_LEFT_FOOT_X} ${BIRD_FOOT_BASE_Y}`} />
          <path
            d={`M ${BIRD_LEFT_FOOT_X - 12} ${BIRD_FOOT_BASE_Y + 16} L ${BIRD_LEFT_FOOT_X} ${BIRD_FOOT_BASE_Y}
                L ${BIRD_LEFT_FOOT_X + 14} ${BIRD_FOOT_BASE_Y + 14}`}
          />
          <path d={`M 172 208 L ${rightFootX} ${rightFootY}`} />
          <path
            d={`M ${rightFootX - 12} ${rightFootY + 16} L ${rightFootX} ${rightFootY}
                L ${rightFootX + 14} ${rightFootY + 14}`}
          />
        </g>

        {/* 꼬리 - 뒤쪽 작은 부채꼴 */}
        <path
          d="M 230 138 L 284 112 L 276 154 L 284 182 Z"
          fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
        />

        {/* 몸통 */}
        <ellipse cx={168} cy={154} rx={72} ry={62} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

        {/* 머리 */}
        <circle cx={92} cy={96} r={46} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        {/* 부리 - 작은 삼각형 */}
        <path
          d="M 48 96 L 10 88 L 48 112 Z" fill={accent} stroke={stroke} strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* 눈 - 원 하나만(옆모습 관례) */}
        <circle cx={76} cy={84} r={8} fill={stroke} />

        {/* 날개 - 접힘~펼침 연속 보간. tip이 실제 꼭짓점이라 spread=1에서 머리 왼쪽 위로
            확실히 튀어나온다. 머리보다 나중에 그려 가려지지 않는다 */}
        <path
          d={`M 180 116 L ${wingTipX} ${wingTipY} L 112 148 Q 150 138 180 116 Z`}
          fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Bird;
