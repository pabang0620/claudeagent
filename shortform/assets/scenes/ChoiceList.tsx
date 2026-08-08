/** 선택지 목록 (3지선다 퀴즈, 단계 목록, 후보 나열).
 *
 *  왼쪽에서 하나씩 밀려 들어온다. 정답 공개용 correct 인덱스를 주면 그 항목만
 *  강조색으로 바뀌고 나머지는 흐려진다.
 */
import React from 'react';
import { spring, useVideoConfig } from 'remotion';
import { C, FONT, RADIUS, SW } from '../theme';

export interface ChoiceItem {
  /** 앞의 원형 뱃지 안 내용 (번호·기호) */
  badge?: React.ReactNode;
  text: React.ReactNode;
}

export interface ChoiceListProps {
  items: ChoiceItem[];
  x: number;
  y: number;
  width: number;
  rowHeight?: number;
  rowGap?: number;
  /** 항목 i 가 등장하는 프레임 */
  appearAt?: (i: number) => number;
  frame?: number;
  /** 정답 인덱스. 이 프레임 이후 강조된다 */
  correct?: number;
  revealAt?: number;
  bg?: string;
  correctBg?: string;
  border?: string;
  borderWidth?: number;
  textColor?: string;
  textSize?: number;
  badgeColor?: string;
}

export const ChoiceList: React.FC<ChoiceListProps> = ({
  items, x, y, width, rowHeight = 152, rowGap = 34, appearAt, frame = 0,
  correct, revealAt, bg = C.paper, correctBg = C.goldSoft, border = C.ink,
  borderWidth = SW, textColor = C.ink, textSize = 68, badgeColor = C.gold,
}) => {
  const { fps } = useVideoConfig();
  const revealed = revealAt !== undefined && frame >= revealAt;
  return (
    <>
      {items.map((it, i) => {
        const at = appearAt ? appearAt(i) : 0;
        const p = appearAt
          ? spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.6, stiffness: 150 } })
          : 1;
        if (p <= 0.001) return null;
        const isCorrect = revealed && correct === i;
        const dimmed = revealed && correct !== undefined && correct !== i;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y + i * (rowHeight + rowGap),
              width, height: rowHeight,
              transform: `translateX(${(1 - p) * -80}px) scale(${(0.9 + 0.1 * p) * (isCorrect ? 1.04 : 1)})`,
              opacity: dimmed ? p * 0.4 : p,
              background: isCorrect ? correctBg : bg,
              border: `${borderWidth}px solid ${border}`,
              borderRadius: RADIUS.lg,
              display: 'flex', alignItems: 'center', paddingLeft: 34, gap: 30,
              boxSizing: 'border-box',
            }}
          >
            {it.badge !== undefined ? (
              <div
                style={{
                  width: 92, height: 92, borderRadius: 46, background: badgeColor,
                  border: `9px solid ${border}`, display: 'flex', flexShrink: 0,
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, fontWeight: 700, fontSize: 52, color: C.ink,
                }}
              >
                {it.badge}
              </div>
            ) : null}
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: textSize, color: textColor }}>
              {it.text}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChoiceList;
