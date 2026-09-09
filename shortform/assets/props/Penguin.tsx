/** 펭귄 전신 소품(정면 응시, 서 있는 자세). REGISTRY 4절 확인 완료 - 기존 동물 소품
 *  (Giraffe/Mouse/Whale/Sloth/DogStanding/CatFull/Bird)에 펭귄이 없어 신설한다.
 *
 *  다른 동물 소품(Mouse/Whale/DogStanding/CatFull/Bird)은 "눈 하나·귀(날개) 하나만 그리는
 *  옆모습 관례"를 쓰지만, 이 화(발이 시리지 않은 이유)는 "두 발이 얼음 위에 서 있는 모습"
 *  자체가 핵심 그림이라 정면(두 발이 동시에 보여야 함)으로 그렸다 - 정면이라 눈도 두 개
 *  그린다(측면 관례의 예외 사유를 남겨 둔다).
 *
 *  몸통은 머리-몸이 이어진 하나의 실루엣(볼링핀형 path)이고, 그 안에 흰 배 패치를 겹쳐
 *  그린다("신체 표현은 최소한으로" 원칙 - 깃털을 잔선으로 채우지 않고 큰 도형 몇 개:
 *  몸통 1 + 배 패치 1 + 부리 1 + 날개(지느러미) 2 + 발 2 + 눈 2 만으로 구성).
 *
 *  9절(예방 체크리스트) 대응: 배경이 밝은 얼음·눈 톤이라 흰 배 패치가 배경에 묻히지
 *  않도록 배 패치에도 몸통과 같은 두께의 ink 외곽선을 반드시 두른다(테두리 없는 흰
 *  도형을 흰 배경 위에 놓지 않는다).
 *
 *  참고 이미지 없이 이 채널 공용 스타일(단색 잉크선 + 채움, 플랫)로 처음부터 그린 순수
 *  도형이라 원칙 0-1(벡터화)의 적용 대상이 아니다(Bird.tsx/CatFull.tsx와 동일 사유).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

export const PENGUIN_VB_W = 300;
export const PENGUIN_VB_H = 460;
/** 발이 얼음/바닥에 닿는 viewBox y (Actor 배치 관례와 동일하게 "바닥 기준" 값을 export) */
export const PENGUIN_GROUND_VB = 452;

/** 몸통 실루엣 - 머리(위, 좁음)에서 몸(아래, 넓음)으로 매끄럽게 이어지는 볼링핀형 path.
 *  눈·부리는 이 실루엣 위쪽(머리 영역)에, 배 패치는 아래쪽 2/3에 겹쳐 그린다. */
const BODY_PATH = 'M 150 28 '
  + 'C 206 28, 246 76, 246 146 '
  + 'C 246 146, 268 244, 268 314 '
  + 'C 268 388, 214 430, 150 430 '
  + 'C 86 430, 32 388, 32 314 '
  + 'C 32 244, 54 146, 54 146 '
  + 'C 54 76, 94 28, 150 28 Z';

/** 흰 배 패치 - 부리 아래에서 발 위까지, 몸통 안쪽에 겹쳐 그린다 */
const BELLY_PATH = 'M 150 148 '
  + 'C 194 148, 214 190, 214 262 '
  + 'C 214 330, 198 388, 150 400 '
  + 'C 102 388, 86 330, 86 262 '
  + 'C 86 190, 106 148, 150 148 Z';

export interface PenguinProps {
  /** 화면상 폭(px). 세로는 내부 비율(PENGUIN_VB_H/PENGUIN_VB_W)로 자동 계산 */
  width: number;
  /** 중심 x (화면 좌표) */
  x: number;
  /** 발이 닿는 y (화면 좌표, PENGUIN_GROUND_VB 기준) */
  y: number;
  stroke?: string;
  /** 몸통(등) 색 */
  fill?: string;
  /** 배 패치 색 */
  bellyColor?: string;
  /** 부리 색 */
  beakColor?: string;
  /** 발 색 */
  footColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Penguin: React.FC<PenguinProps> = ({
  width, x, y, stroke = C.ink, fill = '#2B3444', bellyColor = C.paper,
  beakColor = C.gold, footColor = C.gold, strokeWidth = SW, style,
}) => {
  const height = (width * PENGUIN_VB_H) / PENGUIN_VB_W;
  const scale = width / PENGUIN_VB_W;
  const left = x - width / 2;
  const top = y - PENGUIN_GROUND_VB * scale;

  return (
    <div style={{ position: 'absolute', left, top, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${PENGUIN_VB_W} ${PENGUIN_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        {/* 발 2개 - 몸통보다 먼저 그려 몸통 아래로 살짝 가려지며 자연스럽게 이어진다.
            웹발(물갈퀴)은 촘촘한 발가락 다발 대신 앞쪽에 짧은 틈 2개만 낸다(Bird 다리 관례와
            동일하게 단순화) */}
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
          <path
            d="M 76 400 L 66 434 Q 64 448 78 450 L 108 450 Q 120 448 116 434 L 108 400 Z"
            fill={footColor}
          />
          <path d="M 82 436 L 82 448 M 98 438 L 98 450" stroke={stroke} strokeWidth={SW_THIN} fill="none" strokeLinecap="round" />
          <path
            d="M 224 400 L 234 434 Q 236 448 222 450 L 192 450 Q 180 448 184 434 L 192 400 Z"
            fill={footColor}
          />
          <path d="M 218 436 L 218 448 M 202 438 L 202 450" stroke={stroke} strokeWidth={SW_THIN} fill="none" strokeLinecap="round" />
        </g>

        {/* 날개(지느러미) 2개 - 몸통 옆에 살짝 뒤쪽으로 붙는 작은 타원, 몸통보다 먼저 그려
            몸통 실루엣 경계에 자연스럽게 붙는다 */}
        <g stroke={stroke} strokeWidth={strokeWidth} fill={fill}>
          <path d="M 46 190 C 14 210, 8 268, 26 316 C 40 300, 52 250, 54 200 Z" />
          <path d="M 254 190 C 286 210, 292 268, 274 316 C 260 300, 248 250, 246 200 Z" />
        </g>

        {/* 몸통 */}
        <path d={BODY_PATH} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

        {/* 배 패치 - 흰 배경에 묻히지 않도록 몸통과 동일 두께의 외곽선을 두른다 */}
        <path d={BELLY_PATH} fill={bellyColor} stroke={stroke} strokeWidth={strokeWidth} />

        {/* 부리 - 배 패치 위쪽, 눈 사이 아래에 작은 쐐기 모양 */}
        <path d="M 128 132 L 172 132 L 150 168 Z" fill={beakColor} stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round" />

        {/* 눈 2개 - 정면이라 측면 관례(눈 하나) 예외로 둘 다 그린다. 흰자+검은 동공 */}
        <circle cx={116} cy={104} r={20} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
        <circle cx={184} cy={104} r={20} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
        <circle cx={120} cy={106} r={9} fill={stroke} />
        <circle cx={188} cy={106} r={9} fill={stroke} />
      </svg>
    </div>
  );
};

export default Penguin;
