/** 사과(또는 유사 과일) 소품. 통 사과 실루엣 <-> 잘린 단면 두 모드를 지원한다.
 *
 *  핵심은 `browning`(0~1) prop 이다 - 잘린 단면(cut=true)의 속살 색을 흰색에서 갈색으로
 *  덮어 칠한다(불투명도 오버레이 방식, 실제 색 보간 계산 없이 스타일 규약을 그대로 따름).
 *  `browning`/`brownColor` 로직은 사과에 한정하지 않았다 - 다음 화에서 바나나 등
 *  "잘라두면 산화로 변색되는" 다른 과일 소재가 나와도 skinColor/fleshColor 만 바꿔 그대로
 *  재사용할 수 있도록 이름만 Apple 이고 구조는 범용으로 짰다(대본 02-script-v3.md 자산 목록 메모).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

export interface AppleProps {
  /** 화면상 폭(px). 정사각 viewBox(0 0 300 300), 비율 유지 */
  width: number;
  /** 0~1. 잘린 단면의 갈변 진행도. cut=false 면 무시된다 */
  browning?: number;
  /** true 면 잘린 단면(속살+씨앗+갈변), false 면 통 과일 실루엣 */
  cut?: boolean;
  /** 껍질 색 (기본 coral - 빨간 사과) */
  skinColor?: string;
  /** 갈변 전 속살 기본색 (기본 paper - 흰색) */
  fleshColor?: string;
  /** 완전히 갈변했을 때의 색 (기본 theme browning 토큰) */
  brownColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Apple: React.FC<AppleProps> = ({
  width, browning = 0, cut = false,
  skinColor = C.coral, fleshColor = C.paper, brownColor = C.browning,
  stroke = C.ink, strokeWidth = SW, style,
}) => {
  const b = Math.max(0, Math.min(1, browning));

  return (
    <svg viewBox="0 0 300 300" width={width} style={style} shapeRendering="geometricPrecision">
      {cut ? (
        <>
          {/* 껍질 링 (바깥) */}
          <circle cx={150} cy={150} r={128} fill={skinColor} stroke={stroke} strokeWidth={strokeWidth} />
          {/* 속살 (기본 흰색) */}
          <circle cx={150} cy={150} r={114} fill={fleshColor} stroke={stroke} strokeWidth={strokeWidth * 0.6} />
          {/* 갈변 오버레이 - browning 만큼 불투명해진다 */}
          {b > 0.001 ? (
            <circle cx={150} cy={150} r={114} fill={brownColor} opacity={b * 0.88} />
          ) : null}
          {/* 씨앗(핵) - 중심에 별 모양으로 5개 */}
          <g stroke={C.inkSoft} strokeWidth={SW_THIN * 0.5} opacity={0.45} fill="none">
            <path d="M 150 118 L 168 138 L 190 132 L 176 150 L 190 168 L 168 162 L 150 182 L 132 162 L 110 168 L 124 150 L 110 132 L 132 138 Z" />
          </g>
          <g fill={stroke} opacity={0.85}>
            {[0, 72, 144, 216, 288].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = 150 + Math.cos(rad) * 26;
              const cy = 150 + Math.sin(rad) * 26;
              return (
                <ellipse
                  key={deg}
                  cx={cx}
                  cy={cy}
                  rx={9}
                  ry={13}
                  transform={`rotate(${deg + 90} ${cx} ${cy})`}
                />
              );
            })}
          </g>
        </>
      ) : (
        <>
          {/* 통 사과 실루엣 - 위쪽이 살짝 오목한 하트형 몸통 */}
          <path
            d="M150,58
               C122,22 68,38 52,84
               C34,144 46,204 92,242
               C112,260 130,270 150,270
               C170,270 188,260 208,242
               C254,204 266,144 248,84
               C232,38 178,22 150,58 Z"
            fill={skinColor}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* 줄기 */}
          <path
            d="M150,58 C150,58 156,34 172,20"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.7}
            strokeLinecap="round"
          />
          {/* 잎 */}
          <path
            d="M164,32 C186,20 208,28 210,44 C192,50 172,46 164,32 Z"
            fill={C.leaf}
            stroke={stroke}
            strokeWidth={strokeWidth * 0.6}
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
};

export default Apple;
