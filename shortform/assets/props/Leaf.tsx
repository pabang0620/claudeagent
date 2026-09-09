/** 나뭇잎 소품. "초록 색소(엽록소)가 걷히면서 원래 있던 노랑·주황이 드러나고,
 *  단풍나무 잎은 그 자리에 빨간 색소가 새로 채워진다"는 2단 사슬을 하나의 컴포넌트로
 *  표현한다(general-ep49, "가을 되면 나뭇잎 색이 변하는 이유").
 *
 *  색소를 분자 도형으로 그리지 않고 색 자체로 보여준다(오케스트레이터 지시) - 잎 바탕은
 *  항상 노랑->주황 그라데이션(원래 있던 색)이고, 그 위에 초록 레이어가 덮여 있다가
 *  `chlorophyllProgress`(0~1)만큼 **잎자루 쪽(아래)부터** 걷힌다(script s4 "나무가 잎자루
 *  쪽에서 초록 층을 걷어가는 모습"을 그대로 반영 - 초록이 남는 영역은 항상 위쪽 끝에서부터
 *  아래로 줄어든다). `anthocyaninProgress`(0~1)는 이미 드러난 영역(아래쪽)에 새 빨간
 *  색소가 아래에서부터 차오르는 것으로 표현한다(단풍나무 잎에서만 씀).
 *
 *  `Apple.tsx`의 browning 오버레이(불투명도 보간) 설계를 계승하되, 여기서는 오버레이가
 *  방향성 있는 사각형 clip(아래->위로 줄어듦)이라 "걷어간다"는 동작성이 더 뚜렷하다.
 *
 *  variant='oval'  - 일반적인 타원형 잎(단풍나무가 아닌 나무들, 노랑·주황으로만 물듦)
 *  variant='maple' - 5갈래 단풍잎 실루엣(빨간 색소가 새로 생기는 나무)
 *
 *  "단풍·잎이 색을 바꾸는" 소재 전반(계절 변화, 식물 색소 등)에 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 라이브러리에 등록한다.
 */
import React from 'react';
import { C, SW } from '../theme';

/** 가을 색 팔레트. 배경 톤(C.leaf 등 파스텔)과 별개로, 잎 자체에 쓰는 진한 색이라
 *  로컬 상수로 둔다(LightScatterDiagram.tsx의 LIGHT_GREEN과 동일한 관례) */
export const AUTUMN_GREEN = '#4CAF6B';
export const AUTUMN_YELLOW = C.gold;
export const AUTUMN_ORANGE = '#F2934A';
export const AUTUMN_RED = '#E2543C';

export const LEAF_VB_W = 420;
export const LEAF_VB_H = 500;

const OVAL_PATH = 'M 200 60 C 300 100, 340 220, 300 320 C 270 390, 230 440, 200 460 '
  + 'C 170 440, 130 390, 100 320 C 60 220, 100 100, 200 60 Z';
const OVAL_STEM = 'M 200 460 L 200 500';
const OVAL_TOP = 60;
const OVAL_BOTTOM = 460;

const MAPLE_PATH = 'M 200.0 75.0 L 207.2 76.2 L 214.2 79.9 L 220.6 85.9 L 226.3 93.9 L 231.1 103.6 '
  + 'L 234.9 114.5 L 237.7 126.4 L 239.4 138.6 L 240.3 150.7 L 240.5 162.3 L 240.1 173.0 L 239.5 182.4 '
  + 'L 239.1 190.2 L 239.0 196.3 L 239.7 200.6 L 241.3 203.1 L 244.2 203.9 L 248.6 203.1 L 254.4 201.1 '
  + 'L 261.8 198.2 L 270.7 194.6 L 281.0 190.8 L 292.4 187.1 L 304.8 183.9 L 317.6 181.4 L 330.7 179.9 '
  + 'L 343.4 179.7 L 355.5 180.7 L 366.5 183.2 L 376.0 187.1 L 383.5 192.3 L 388.7 198.7 L 391.5 206.0 '
  + 'L 391.6 214.0 L 389.0 222.4 L 383.7 230.9 L 376.1 239.2 L 366.5 246.9 L 355.3 253.9 L 343.0 260.0 '
  + 'L 330.2 265.1 L 317.6 269.3 L 305.8 272.5 L 295.1 275.1 L 286.2 277.1 L 279.2 279.0 L 274.3 281.0 '
  + 'L 271.7 283.3 L 271.2 286.3 L 272.7 290.1 L 275.9 295.0 L 280.5 301.0 L 286.1 308.2 L 292.3 316.6 '
  + 'L 298.7 325.9 L 304.8 336.1 L 310.2 346.9 L 314.6 357.9 L 317.8 368.9 L 319.4 379.4 L 319.3 389.1 '
  + 'L 317.5 397.6 L 314.0 404.6 L 308.8 409.8 L 302.2 413.0 L 294.4 414.0 L 285.7 413.0 L 276.4 409.9 '
  + 'L 266.8 404.9 L 257.2 398.2 L 248.1 390.3 L 239.4 381.4 L 231.6 372.1 L 224.7 362.8 L 218.7 353.9 '
  + 'L 213.6 346.0 L 209.4 339.4 L 205.9 334.4 L 202.8 331.3 L 200.0 330.3 L 197.2 331.3 L 194.1 334.4 '
  + 'L 190.6 339.4 L 186.4 346.0 L 181.3 353.9 L 175.3 362.8 L 168.4 372.1 L 160.6 381.4 L 151.9 390.3 '
  + 'L 142.8 398.2 L 133.2 404.9 L 123.6 409.9 L 114.3 413.0 L 105.6 414.0 L 97.8 412.9 L 91.3 409.7 '
  + 'L 86.1 404.4 L 82.7 397.4 L 81.0 388.8 L 81.1 378.9 L 82.9 368.3 L 86.2 357.2 L 91.0 346.0 '
  + 'L 96.7 335.0 L 103.2 324.7 L 109.9 315.2 L 116.4 306.8 L 122.4 299.5 L 127.4 293.5 L 131.0 288.6 '
  + 'L 133.0 284.7 L 133.1 281.7 L 131.3 279.4 L 127.4 277.4 L 121.6 275.6 L 114.0 273.6 L 104.9 271.3 '
  + 'L 94.6 268.3 L 83.6 264.6 L 72.4 260.0 L 61.3 254.5 L 50.9 248.3 L 41.6 241.3 L 33.9 233.7 '
  + 'L 28.0 225.8 L 24.4 217.8 L 23.0 210.1 L 24.1 202.8 L 27.5 196.3 L 33.1 190.9 L 40.8 186.6 '
  + 'L 50.1 183.6 L 60.8 182.1 L 72.4 181.8 L 84.6 182.9 L 96.7 185.0 L 108.5 187.9 L 119.6 191.4 '
  + 'L 129.7 195.0 L 138.4 198.4 L 145.7 201.3 L 151.5 203.2 L 155.8 203.9 L 158.7 203.1 L 160.3 200.6 '
  + 'L 161.0 196.3 L 160.9 190.2 L 160.5 182.4 L 159.9 173.0 L 159.5 162.3 L 159.7 150.7 L 160.6 138.6 '
  + 'L 162.3 126.4 L 165.1 114.5 L 168.9 103.6 L 173.7 93.9 L 179.4 85.9 L 185.8 79.9 L 192.8 76.2 Z';
const MAPLE_STEM = 'M 200 414 L 200 470';
const MAPLE_TOP = 75;
const MAPLE_BOTTOM = 414;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface LeafProps {
  /** 화면상 폭(px) */
  width: number;
  variant?: 'oval' | 'maple';
  /** 0~1. 초록이 잎자루 쪽(아래)부터 걷히며 원래 있던 노랑·주황이 드러나는 진행도 */
  chlorophyllProgress?: number;
  /** 0~1. 이미 드러난 영역에 새 빨간 색소가 아래에서부터 채워지는 진행도(단풍나무용) */
  anthocyaninProgress?: number;
  stroke?: string;
  strokeWidth?: number;
  /** 같은 화면에 같은 variant 잎이 여러 장 있을 때 clipPath id 충돌 방지용 */
  idSuffix?: string;
  style?: React.CSSProperties;
}

export const Leaf: React.FC<LeafProps> = ({
  width, variant = 'oval', chlorophyllProgress = 0, anthocyaninProgress = 0,
  stroke = C.ink, strokeWidth = SW, idSuffix = variant, style,
}) => {
  const chloroT = clamp01(chlorophyllProgress);
  const anthoT = clamp01(anthocyaninProgress);
  const height = (width * LEAF_VB_H) / LEAF_VB_W;

  const shapePath = variant === 'maple' ? MAPLE_PATH : OVAL_PATH;
  const stemPath = variant === 'maple' ? MAPLE_STEM : OVAL_STEM;
  const top = variant === 'maple' ? MAPLE_TOP : OVAL_TOP;
  const bottom = variant === 'maple' ? MAPLE_BOTTOM : OVAL_BOTTOM;

  const clipId = `leaf-clip-${idSuffix}`;
  const gradId = `leaf-grad-${idSuffix}`;

  // 초록이 남아있는 영역: 항상 맨 위(top)에서 시작해 아래쪽 경계가 위로 올라온다
  // (잎자루=아래쪽부터 걷힌다). chloroT=0 이면 leaf 전체, 1 이면 남는 영역 없음.
  const greenBottom = bottom - (bottom - top) * chloroT;
  const greenHeight = Math.max(0, greenBottom - top);

  // 이미 드러난 영역(greenBottom ~ bottom) 안에서, 아래쪽부터 빨간 색소가 차오른다.
  const exposedTop = greenBottom;
  const redTop = bottom - (bottom - exposedTop) * anthoT;
  const redHeight = Math.max(0, bottom - redTop);

  return (
    <svg
      viewBox={`0 0 ${LEAF_VB_W} ${LEAF_VB_H}`}
      width={width}
      height={height}
      style={style}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={AUTUMN_YELLOW} />
          <stop offset="1" stopColor={AUTUMN_ORANGE} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={shapePath} />
        </clipPath>
      </defs>

      {/* 줄기 */}
      <path d={stemPath} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} strokeLinecap="round" />

      {/* 원래 있던 색 (항상 잎 전체에 깔려 있음) */}
      <path d={shapePath} fill={`url(#${gradId})`} />

      {/* 새로 생기는 빨간 색소 - 드러난 영역 안에서 아래부터 */}
      {redHeight > 0.5 ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={redTop} width={LEAF_VB_W} height={redHeight} fill={AUTUMN_RED} opacity={0.9} />
        </g>
      ) : null}

      {/* 아직 안 걷힌 초록 - 위쪽부터 남아 있음 */}
      {greenHeight > 0.5 ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={top} width={LEAF_VB_W} height={greenHeight} fill={AUTUMN_GREEN} />
        </g>
      ) : null}

      {/* 잎맥 - 색과 무관하게 항상 위에 옅게 */}
      <g clipPath={`url(#${clipId})`} opacity={0.3}>
        <path d={`M 200 ${top + 30} L 200 ${bottom - 30}`} fill="none" stroke={C.ink} strokeWidth={strokeWidth * 0.4} />
        {[0.28, 0.48, 0.68].map((f) => {
          const y = top + (bottom - top) * f;
          const dy = (bottom - top) * 0.12;
          return (
            <path
              key={f}
              d={`M 200 ${y} L ${200 + 60} ${y + dy} M 200 ${y} L ${200 - 60} ${y + dy}`}
              fill="none" stroke={C.ink} strokeWidth={strokeWidth * 0.32} strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* 외곽선 - 맨 위에 다시 그려 색 오버레이 위에서도 선명하게 */}
      <path d={shapePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
};

export default Leaf;
