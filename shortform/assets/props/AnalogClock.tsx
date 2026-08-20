/** 아날로그 시계. 문자판 + 시침/분침/초침(각도 지정) + "멈춘 듯" 보일 때 초침 끝에 붙는 옅은
 *  글로우 링(freeze 하이라이트).
 *
 *  general-long01("시계 초침이 순간 멈춰 보이는 이유")에서 처음 필요해 만들었다. 시간·타이밍을
 *  소재로 한 향후 화(시차·타임랩스 등)에서도 재사용 가능성이 높아 에피소드 로컬이 아니라
 *  props/ 에 등록한다(대본 자산 목록의 제안을 그대로 따름).
 *
 *  각도 규약: 12시 방향이 0도, 시계방향으로 증가(디자인 관용 - 시침/분침/초침 전부 동일).
 */
import React from 'react';
import { C, SW } from '../theme';

export interface AnalogClockProps {
  /** 화면상 한 변 크기(px) */
  width: number;
  x: number;
  y: number;
  /** 시침 각도 (12시=0, 시계방향, 도) */
  hourDeg?: number;
  /** 분침 각도 */
  minuteDeg?: number;
  /** 초침 각도 */
  secondDeg?: number;
  /** 초침 끝 "멈춘 듯" 글로우 링 (0~1, undefined/0 이면 안 그림) */
  freeze?: number;
  stroke?: string;
  fill?: string;
  faceColor?: string;
  secondColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const VB = 600;
const CX = VB / 2;
const CY = VB / 2;
const R = VB * 0.44;

function tip(deg: number, len: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + len * Math.cos(rad), y: CY + len * Math.sin(rad) };
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  width, x, y, hourDeg = 0, minuteDeg = 0, secondDeg = 0, freeze = 0,
  stroke = C.ink, fill = C.paper, faceColor, secondColor = C.coral,
  strokeWidth = SW, style,
}) => {
  const hourTip = tip(hourDeg, R * 0.5);
  const minTip = tip(minuteDeg, R * 0.72);
  const secTip = tip(secondDeg, R * 0.82);
  const secTail = tip(secondDeg + 180, R * 0.16);

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const outer = tip(deg, R * 0.94);
    const inner = tip(deg, R * (i % 3 === 0 ? 0.8 : 0.86));
    return { outer, inner, major: i % 3 === 0 };
  });

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
      <svg width={width} height={width} viewBox={`0 0 ${VB} ${VB}`} style={{ overflow: 'visible' }}>
        <circle cx={CX} cy={CY} r={R} fill={faceColor ?? fill} stroke={stroke} strokeWidth={strokeWidth} />

        {ticks.map((t, i) => (
          <line
            key={i} x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y}
            stroke={stroke} strokeWidth={t.major ? strokeWidth * 0.6 : strokeWidth * 0.34}
            strokeLinecap="round" opacity={t.major ? 0.9 : 0.55}
          />
        ))}

        {freeze > 0.001 ? (
          <circle
            cx={secTip.x} cy={secTip.y} r={26 + 14 * freeze} fill="none" stroke={C.gold}
            strokeWidth={10} opacity={0.75 * freeze}
          />
        ) : null}

        <line x1={CX} y1={CY} x2={hourTip.x} y2={hourTip.y} stroke={stroke}
          strokeWidth={strokeWidth * 1.3} strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={minTip.x} y2={minTip.y} stroke={stroke}
          strokeWidth={strokeWidth * 0.95} strokeLinecap="round" />
        <line x1={secTail.x} y1={secTail.y} x2={secTip.x} y2={secTip.y} stroke={secondColor}
          strokeWidth={strokeWidth * 0.42} strokeLinecap="round" />

        <circle cx={CX} cy={CY} r={strokeWidth * 0.9} fill={secondColor} stroke={stroke}
          strokeWidth={strokeWidth * 0.3} />
      </svg>
    </div>
  );
};

export default AnalogClock;
