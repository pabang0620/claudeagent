/** 아이스크림콘 소품. 캐릭터가 손에 들고 한입 베어 무는 도입부(1화 s1)를 위해 만들었지만
 *  음식류 소재가 다시 나오면 재사용한다.
 *
 *  구성: 콘(삼각형 + 와플 격자선) + 스쿱 1~2단. 스쿱 색은 accent 로 바꿔 맛을 구분할 수 있다.
 *  스타일 규약(잉크 선 + 흰/액센트 채움, 둥근 선끝)을 그대로 따른다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

export interface IceCreamProps {
  /** 화면상 폭(px). 비율 유지, viewBox 는 화면 픽셀과 1:1 */
  width: number;
  /** 스쿱 채움색 (기본 coral) */
  scoopColor?: string;
  /** 콘 채움색 (기본 gold) */
  coneColor?: string;
  /** 선 색 (기본 ink) */
  stroke?: string;
  strokeWidth?: number;
  /** 스쿱을 2단으로 쌓을지 */
  doubleScoop?: boolean;
  style?: React.CSSProperties;
}

export const IceCream: React.FC<IceCreamProps> = ({
  width, scoopColor = C.coral, coneColor = C.gold, stroke = C.ink,
  strokeWidth = SW, doubleScoop = false, style,
}) => (
  <svg viewBox="0 0 220 320" width={width} style={style} shapeRendering="geometricPrecision">
    {/* 콘 */}
    <path
      d="M 60 150 L 160 150 L 112 300 C 108 306, 100 306, 96 300 Z"
      fill={coneColor} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
    />
    {/* 와플 격자선 (콘 안쪽에만 보이도록 clip) */}
    <g stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={0.55} clipPath="url(#coneClip)">
      <line x1={70} y1={170} x2={150} y2={190} />
      <line x1={78} y1={205} x2={140} y2={220} />
      <line x1={87} y1={238} x2={128} y2={250} />
      <line x1={97} y1={270} x2={116} y2={278} />
      <line x1={80} y1={150} x2={125} y2={295} />
      <line x1={100} y1={150} x2={140} y2={260} />
      <line x1={140} y1={150} x2={100} y2={260} />
    </g>
    <clipPath id="coneClip">
      <path d="M 60 150 L 160 150 L 112 300 C 108 306, 100 306, 96 300 Z" />
    </clipPath>

    {/* 스쿱 (기본 1단, doubleScoop 이면 2단) */}
    {doubleScoop ? (
      <>
        <circle cx={110} cy={128} r={54} fill={scoopColor} stroke={stroke} strokeWidth={strokeWidth} />
        <circle cx={110} cy={64} r={42} fill={C.paper} stroke={stroke} strokeWidth={strokeWidth} />
      </>
    ) : (
      <circle cx={110} cy={110} r={68} fill={scoopColor} stroke={stroke} strokeWidth={strokeWidth} />
    )}
  </svg>
);

export default IceCream;
