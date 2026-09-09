/** 고기(살코기) 소품. `props/Apple.tsx`의 `browning`(0~1) 연속 보간 설계를 그대로 참고해
 *  만들었다 - 생고기색(연분홍)에서 구워진 갈색까지 오버레이 불투명도 방식으로 표현한다
 *  (실제 색 보간 계산 없이 Apple과 동일한 스타일 규약을 따름, general-ep14 신설).
 *
 *  `sear`(0~1)가 핵심이다. 0 = 생고기, 1 = 완전히 잘 구워진 진한 갈색. 대본(02-script-v2.md)의
 *  s1(옅은 분홍 -> 짙은 갈색 연속 보간)·s5(고기 겉면, 이미 구워짐)·s6(3분할 비교)·s7(팬 위
 *  갈색 고기 vs 냄비 속 옅은 고기)에서 이 하나의 컴포넌트를 sear 값만 바꿔가며 재사용한다.
 *
 *  sear > 0.5 부터는 그릴 자국(대각선)이 옅게 겹쳐져 "표면이 실제로 그을렸다"는 질감을 더한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface MeatProps {
  /** 화면상 폭(px). viewBox(0 0 320 220) 비율 유지 */
  width: number;
  /** 0~1. 굽기 진행도. 0=생고기, 1=완전히 구워진 진한 갈색 */
  sear?: number;
  /** 생고기 기본색 */
  rawColor?: string;
  /** 완전히 구워졌을 때의 색 */
  searColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const BODY_D = `
  M 46,118
  C 28,78 54,34 118,26
  C 168,20 226,26 262,54
  C 300,82 300,140 268,172
  C 232,208 168,206 118,196
  C 66,186 24,158 46,118
  Z
`;

export const Meat: React.FC<MeatProps> = ({
  width, sear = 0, rawColor = C.meatRaw, searColor = C.browning,
  stroke = C.ink, strokeWidth = SW, style,
}) => {
  const s = clamp01(sear);
  const grillOpacity = s > 0.5 ? (s - 0.5) * 1.4 : 0;

  return (
    <svg viewBox="0 0 320 220" width={width} style={style} shapeRendering="geometricPrecision">
      {/* 몸통 - 생고기색 밑칠 */}
      <path d={BODY_D} fill={rawColor} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />

      {/* 지방(마블링) 결 - 옅은 흰 줄무늬, 항상 은은히 보임 */}
      <g stroke={C.paper} strokeWidth={SW_THIN * 0.6} opacity={0.4} fill="none">
        <path d="M 96,66 C 132,88 150,118 122,158" />
        <path d="M 182,50 C 202,90 210,128 182,168" />
        <path d="M 64,140 C 96,150 128,150 158,140" />
      </g>

      {/* 굽기 오버레이 - sear 만큼 불투명해진다 (Apple.browning 과 동일 규약) */}
      {s > 0.001 ? (
        <path d={BODY_D} fill={searColor} opacity={s * 0.88} />
      ) : null}

      {/* 그릴 자국 - sear 가 절반을 넘으면 옅게 겹쳐진다 */}
      {grillOpacity > 0.01 ? (
        <g stroke={stroke} strokeWidth={SW_THIN * 0.75} opacity={grillOpacity * 0.55} strokeLinecap="round">
          <line x1={70} y1={58} x2={236} y2={150} />
          <line x1={96} y1={38} x2={258} y2={126} />
          <line x1={50} y1={104} x2={210} y2={192} />
        </g>
      ) : null}
    </svg>
  );
};

export default Meat;
