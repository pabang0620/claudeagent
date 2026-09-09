/** 접시 + 음식 조합 소품. "접시와 음식의 온도 차이를 색으로 비교"하는 자산이 REGISTRY에
 *  없어 새로 만들었다(`Apple`/`Meat`의 `browning`/`sear` 연속 보간 설계를 그대로 따름).
 *
 *  접시는 항상 같은 톤(물기가 거의 없어 온도가 잘 안 변한다는 설정)이고, 음식만 `heat`
 *  (0~1)로 차가운 톤 -> 뜨거운 톤을 연속 보간한다. `plateWarmT`(0~1)는 음식이 닿은 접시
 *  가장자리 한 곳만 옅은 노랑으로 살짝 데워지는 것을 표현한다(대본 s5의 "접시는 안 뜨거운데
 *  닿은 부분만 살짝 뜨끈해진다"는 비교를 그대로 시각화).
 *
 *  "그릇에 담긴 음식의 온도"를 비교하는 다른 소재 전반에도 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerpColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255; const ag = (pa >> 8) & 255; const ab = pa & 255;
  const br = (pb >> 16) & 255; const bg = (pb >> 8) & 255; const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
};

export const PLATE_FOOD_VB_W = 500;
export const PLATE_FOOD_VB_H = 340;

export interface PlateFoodIconProps {
  width: number;
  x: number;
  y: number;
  /** 0~1. 음식 색 - 0=차가운 톤(cold), 1=뜨거운 톤(hot) */
  heat?: number;
  /** 0~1. 음식이 닿은 접시 가장자리가 옅은 노랑으로 살짝 데워지는 정도(페이드인) */
  plateWarmT?: number;
  stroke?: string;
  plateColor?: string;
  coldColor?: string;
  hotColor?: string;
  warmColor?: string;
  style?: React.CSSProperties;
}

export const PlateFoodIcon: React.FC<PlateFoodIconProps> = ({
  width, x, y, heat = 0, plateWarmT = 0, stroke = C.ink,
  plateColor = C.sky, coldColor = C.waterCool, hotColor = C.coral, warmColor = C.goldSoft,
  style,
}) => {
  const h = clamp01(heat);
  const wt = clamp01(plateWarmT);
  const foodColor = lerpColor(coldColor, hotColor, h);
  const cx = PLATE_FOOD_VB_W / 2;

  return (
    <svg
      viewBox={`0 0 ${PLATE_FOOD_VB_W} ${PLATE_FOOD_VB_H}`}
      width={width} height={(width * PLATE_FOOD_VB_H) / PLATE_FOOD_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 접시 - 항상 같은 톤(물기가 거의 없어 온도가 잘 안 변한다) */}
      <ellipse cx={cx} cy={260} rx={220} ry={58} fill={plateColor} stroke={stroke} strokeWidth={SW} />
      <ellipse cx={cx} cy={254} rx={168} ry={40} fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={0.55} />

      {/* 접시 가장자리 - 음식이 닿은 쪽만 옅은 노랑으로 데워짐 */}
      {wt > 0.01 ? (
        <path
          d={`M ${cx - 150},258 A 168 40 0 0 1 ${cx + 150},258`}
          fill="none" stroke={warmColor} strokeWidth={22} strokeLinecap="round" opacity={0.85 * wt}
        />
      ) : null}

      {/* 음식 덩어리 - 접시 위 중앙, heat 로 색이 연속 보간된다 */}
      <path
        d={`
          M ${cx - 130},220
          C ${cx - 150},150 ${cx - 80},92 ${cx - 6},96
          C ${cx + 70},100 ${cx + 150},146 ${cx + 132},214
          C ${cx + 118},252 ${cx - 116},254 ${cx - 130},220
          Z
        `}
        fill={foodColor} stroke={stroke} strokeWidth={SW}
      />
    </svg>
  );
};

export default PlateFoodIcon;
