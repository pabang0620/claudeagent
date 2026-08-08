/** 카드 1장과 카드 격자.
 *
 *  "여러 대상을 나란히 놓고 같은 값을 보여준다"는 연출은 주제와 무관하게 반복된다
 *  (동물 4종, 행성 4개, 방법 3가지...). 안에 뭘 넣을지는 art 로 받는다.
 */
import React from 'react';
import { spring, useVideoConfig } from 'remotion';
import { C, FONT, RADIUS, SW } from '../theme';

export interface CardProps {
  x: number;
  y: number;
  w: number;
  h: number;
  /** 카드 아래 라벨 */
  label?: React.ReactNode;
  /** 오른쪽 위 원형 뱃지 (숫자·기호) */
  badge?: React.ReactNode;
  /** 0 = 없음, 1 = 완전 등장. 0 이면 아무것도 안 그린다 */
  progress?: number;
  bg?: string;
  border?: string;
  borderWidth?: number;
  radius?: number;
  labelColor?: string;
  labelSize?: number;
  badgeColor?: string;
  badgeSize?: number;
  /** 카드 안 그림 영역의 아래 여백 (라벨 자리) */
  artBottom?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  x, y, w, h, label, badge, progress = 1,
  bg = C.paper, border = C.ink, borderWidth = SW, radius = RADIUS.lg,
  labelColor = C.ink, labelSize = 46, badgeColor = C.gold, badgeSize = 86,
  artBottom = 84, children, style,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h,
        transform: `translateY(${(1 - p) * 48}px) scale(${0.86 + 0.14 * p})`,
        opacity: p,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0, background: bg,
          border: `${borderWidth}px solid ${border}`, borderRadius: radius,
        }}
      />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 26, bottom: label ? artBottom : 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        {children}
      </div>
      {label ? (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: labelSize, color: labelColor,
          }}
        >
          {label}
        </div>
      ) : null}
      {badge !== undefined && badge !== null ? (
        <div
          style={{
            position: 'absolute', right: -badgeSize * 0.23, top: -badgeSize * 0.23,
            width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2,
            background: badgeColor, border: `9px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: badgeSize * 0.58, color: C.ink,
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
};

export interface CardItem {
  key?: string;
  label?: React.ReactNode;
  badge?: React.ReactNode;
  art?: React.ReactNode;
}

export interface CardGridProps {
  items: CardItem[];
  /** 격자 좌상단 */
  x: number;
  y: number;
  /** 카드 한 변 (h 를 주지 않으면 정사각) */
  size: number;
  height?: number;
  gap?: number;
  columns?: number;
  /** 카드 i 가 등장을 시작하는 프레임 */
  appearAt?: (i: number) => number;
  /** 현재 프레임. appearAt 를 쓰면 필수 */
  frame?: number;
  cardProps?: Partial<CardProps>;
}

/** 카드 격자. appearAt 로 카드마다 등장 시점을 어긋나게 한다
 *  (내레이션 어절 프레임을 그대로 넣으면 말과 그림이 자동으로 맞는다). */
export const CardGrid: React.FC<CardGridProps> = ({
  items, x, y, size, height, gap = 30, columns = 2, appearAt, frame = 0, cardProps,
}) => {
  const { fps } = useVideoConfig();
  const h = height ?? size;
  return (
    <>
      {items.map((it, i) => {
        const at = appearAt ? appearAt(i) : 0;
        const p = appearAt
          ? spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.6, stiffness: 150 } })
          : 1;
        return (
          <Card
            key={it.key ?? i}
            x={x + (i % columns) * (size + gap)}
            y={y + Math.floor(i / columns) * (h + gap)}
            w={size}
            h={h}
            label={it.label}
            badge={it.badge}
            progress={p}
            {...cardProps}
          >
            {it.art}
          </Card>
        );
      })}
    </>
  );
};
