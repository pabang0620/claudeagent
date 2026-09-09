/** 중심점 기준으로 팝인하는 래퍼 (`Appear` 대신 쓰는 안전한 등장 헬퍼).
 *
 *  `Appear`(scenes/Effects.tsx)는 opacity·transform 을 "감싸는 별도 div" 에 얹는다. 그 div 가
 *  `AbsoluteFill`(display:flex; flexDirection:column)의 flex item 이 되는데, 내용물이 전부
 *  `position:absolute`(정상 흐름에 기여하지 않음)면 래퍼 자신은 폭만 꽉 차고 높이 0 으로
 *  collapse 된다. 그러면 `transform-origin:50% 50%` 가 곧 "화면 최상단 중앙" 이 되어,
 *  애니메이션 진행 중(p<1)에는 `Δy = top × (스케일 - 1)` 만큼 위로 쏠린 채 나타났다가
 *  p=1 이 돼서야 제자리를 찾는다(실측: general-ep13 s5 아이콘이 150px 이상 어긋남).
 *
 *  이 컴포넌트는 position·opacity·transform 을 전부 같은 div 하나에 얹어 그 결함을 원천 차단한다
 *  (`Card.tsx`/`CompareBars.tsx` 와 동일 원칙 - 좌표를 가진 요소 자신이 애니메이션도 스스로 갖는다).
 *  화면에 떠 있는 아이콘·소품을 팝인시킬 때는 `Appear` 대신 이걸 쓴다.
 */
import React from 'react';

export interface PopInProps {
  /** 중심 x (화면 좌표) */
  cx: number;
  /** 중심 y (화면 좌표) */
  cy: number;
  /** 박스 한 변. height 를 주지 않으면 정사각 */
  size: number;
  height?: number;
  /** 0 = 없음, 1 = 완전 등장. 0 이면 아무것도 안 그린다 */
  progress: number;
  /** 시작 스케일 (기본 0.3 = 작게 튀어나옴). 1 이면 스케일 없이 페이드만 */
  fromScale?: number;
  /** 불투명도가 1 에 도달하는 진행도 (기본 0.5 = progress 절반에서 이미 선명) */
  fadeInBy?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PopIn: React.FC<PopInProps> = ({
  cx, cy, size, height, progress, fromScale = 0.3, fadeInBy = 0.5, style, children,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return null;
  const h = height ?? size;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - size / 2,
        top: cy - h / 2,
        width: size,
        height: h,
        opacity: fadeInBy > 0 ? Math.min(1, p / fadeInBy) : 1,
        transform: `scale(${fromScale + (1 - fromScale) * p})`,
        transformOrigin: '50% 50%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PopIn;
