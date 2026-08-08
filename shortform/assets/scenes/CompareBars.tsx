/** 값 비교 막대. "A는 이만한데 B는 이만큼" 연출 전용.
 *
 *  같은 pxPerUnit 을 Ruler 에 넘기면 막대 끝이 눈금과 정확히 맞는다.
 *  막대마다 등장 프레임을 따로 줄 수 있어, 내레이션 어절에 맞춰 하나씩 자라게 할 수 있다.
 */
import React from 'react';
import { spring, useVideoConfig } from 'remotion';
import { C, FONT, SW } from '../theme';

export interface BarItem {
  label?: React.ReactNode;
  /** 실제 값 (단위는 호출측이 정한다) */
  value: number;
  color?: string;
  /** 막대 두께 */
  thickness?: number;
  /** 이 막대가 자라기 시작하는 프레임 */
  at?: number;
  /** 값 텍스트 (막대 끝에 붙는다) */
  valueText?: React.ReactNode;
}

export interface CompareBarsProps {
  items: BarItem[];
  /** 막대 왼쪽 시작 x */
  x: number;
  /** 첫 막대 라벨의 y */
  y: number;
  /** 1 단위당 px */
  pxPerUnit: number;
  /** 항목 하나가 차지하는 세로 간격 */
  rowGap?: number;
  /** 라벨과 막대 사이 간격 */
  labelGap?: number;
  frame?: number;
  stroke?: string;
  strokeWidth?: number;
  labelColor?: string;
  labelSize?: number;
  /** 막대 최소 길이 (0 일 때도 보이게) */
  minLength?: number;
}

export const CompareBars: React.FC<CompareBarsProps> = ({
  items, x, y, pxPerUnit, rowGap = 148, labelGap = 56, frame = 0,
  stroke = C.ink, strokeWidth = SW, labelColor = C.ink, labelSize = 42, minLength = 30,
}) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {items.map((it, i) => {
        const at = it.at ?? 0;
        const p = spring({ frame: frame - at, fps, config: { damping: 14, mass: 0.8, stiffness: 110 } });
        const th = it.thickness ?? 52;
        const rowY = y + i * rowGap;
        const len = Math.max(minLength, it.value * pxPerUnit * p);
        return (
          <React.Fragment key={i}>
            {it.label ? (
              <div
                style={{
                  position: 'absolute', left: x, top: rowY,
                  fontFamily: FONT, fontWeight: 700, fontSize: labelSize, color: labelColor,
                  whiteSpace: 'nowrap',
                }}
              >
                {it.label}
              </div>
            ) : null}
            <div
              style={{
                position: 'absolute', left: x, top: rowY + labelGap,
                width: len, height: th,
                background: it.color ?? C.coral,
                border: `${strokeWidth}px solid ${stroke}`,
                borderRadius: th / 2,
                boxSizing: 'border-box',
                opacity: p > 0.01 ? 1 : 0,
              }}
            />
            {it.valueText !== undefined && p > 0.4 ? (
              <div
                style={{
                  position: 'absolute', left: x + len + 20, top: rowY + labelGap + th * 0.1,
                  fontFamily: FONT, fontWeight: 700, fontSize: labelSize * 0.9, color: labelColor,
                  opacity: (p - 0.4) / 0.6, whiteSpace: 'nowrap',
                }}
              >
                {it.valueText}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default CompareBars;
