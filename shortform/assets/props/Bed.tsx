/** 침대 소품. Bathtub.tsx 와 같은 원칙(캐릭터 하반신을 앞판이 가리는 방식) 을 그대로 따른다.
 *  단, 이불(앞판)만 있는 Bathtub 과 달리 베개는 캐릭터 **뒤**로 가야 자연스러워서
 *  `layer` prop 으로 그리는 부분을 나눈다 - 헤드보드+베개는 `Actor` 보다 먼저(뒤 레이어),
 *  이불(하반신을 가리는 앞판)은 `Actor` 보다 나중(앞 레이어)에 그린다.
 *
 *    <Bed layer="back" blanketY={Y} />
 *    <Actor ... />
 *    <Bed layer="front" blanketY={Y} />
 *
 *  새 신체를 그리지 않고 기존 Actor 를 그대로 쓰는 원칙(HeadNerveDiagram 등과 동일 - 원칙
 *  0-1 은 참고 이미지가 있는 캐릭터에만 해당하고 이 소품은 참고 이미지 없는 단순 가구 도형이라
 *  대상이 아니다).
 *
 *  general-ep29("잠들기 직전 몸이 움찔하는 이유")에서 "침대에서 잠드는 장면"이 필요해 신설 -
 *  수면·잠 소재 전반(악몽, 수면 마비, 잠꼬대 등) 재사용 가능성이 있어 에피소드 로컬이 아니라
 *  여기 등록한다.
 */
import React from 'react';
import { C, H, SW, W } from '../theme';

export interface BedProps {
  /** 이불(앞판) 윗선 화면 y. 이 아래를 전부 덮어 하반신을 가린다 */
  blanketY: number;
  /** 어느 레이어를 그릴지. 'both' 는 캐릭터 없이 침대만 보여줄 때(정지 컷 등) 쓴다 */
  layer?: 'back' | 'front' | 'both';
  /** 베개 중심 x (기본 화면 중앙) */
  pillowCX?: number;
  headboardColor?: string;
  blanketColor?: string;
  stripeColor?: string;
  pillowColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Bed: React.FC<BedProps> = ({
  blanketY, layer = 'both', pillowCX,
  headboardColor = C.roomDeep, blanketColor = C.water, stripeColor = C.coralSoft,
  pillowColor = C.paper, stroke = C.ink, strokeWidth = SW, style,
}) => {
  const cx = pillowCX ?? W / 2;
  const pillowW = 460;
  const pillowH = 180;
  const pillowY = blanketY - 60;
  const showBack = layer === 'back' || layer === 'both';
  const showFront = layer === 'front' || layer === 'both';
  return (
    <svg
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', left: 0, top: 0, ...style }}
    >
      {showBack ? (
        <>
          {/* 헤드보드: 베개 뒤로 살짝 보이는 침대 상단 프레임 */}
          <rect
            x={cx - 480} y={pillowY - 220} width={960} height={340} rx={54}
            fill={headboardColor} stroke={stroke} strokeWidth={strokeWidth}
          />
          {/* 베개: 캐릭터 머리 뒤에 깔린다 */}
          <ellipse
            cx={cx} cy={pillowY} rx={pillowW / 2} ry={pillowH / 2}
            fill={pillowColor} stroke={stroke} strokeWidth={strokeWidth}
          />
          <path
            d={`M ${cx - pillowW * 0.32} ${pillowY} Q ${cx} ${pillowY + 26} ${cx + pillowW * 0.32} ${pillowY}`}
            fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity={0.5}
          />
        </>
      ) : null}
      {showFront ? (
        <>
          {/* 이불 앞판: 수면 아래 전부를 덮는다(Bathtub 의 물 앞판과 동일 구조) */}
          <rect
            x={-40} y={blanketY} width={W + 80} height={H - blanketY + 40} rx={60}
            fill={blanketColor} stroke={stroke} strokeWidth={strokeWidth}
          />
          {/* 이불 윗단 - 접힌 단처럼 보이는 강조 띠 */}
          <path
            d={`M -40 ${blanketY} Q ${cx * 0.5} ${blanketY - 10} ${cx} ${blanketY} Q ${cx * 1.5} ${blanketY + 10} ${W + 40} ${blanketY} L ${W + 40} ${blanketY + 46} L -40 ${blanketY + 46} Z`}
            fill={stripeColor} opacity={0.9}
          />
          <path
            d={`M -40 ${blanketY} Q ${cx * 0.5} ${blanketY - 10} ${cx} ${blanketY} Q ${cx * 1.5} ${blanketY + 10} ${W + 40} ${blanketY}`}
            fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.7}
          />
        </>
      ) : null}
    </svg>
  );
};

export default Bed;
