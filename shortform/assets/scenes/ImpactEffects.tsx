/** DustCloud / ImpactBurst - "역동적인 동작"을 강조하는 큰 임팩트 이펙트 2종.
 *
 *  배경: 퍼둥이 데모(perdungi-demo-active)의 MotionSwoosh(작은 동작선)는 "너무 작아서 잘 안
 *  보인다"는 피드백을 받았다(perdungi-demo-dynamic 착수 배경). 이번엔 원칙 0-1(참고 이미지가
 *  있는 캐릭터·소품은 벡터화 도구를 거친다)과 같은 정신으로, AI가 눈대중으로 먼지·폭발 모양을
 *  새로 그리지 않고 **라이선스 확인된 기존 벡터 소스의 path/polygon 좌표를 그대로** 가져다
 *  썼다. 좌표 자체는 원본 그대로이고, 이 파일이 추가한 것은 (a) 원본 그룹 구조를 보존한 채
 *  `fill` 색만 테마 토큰으로 바꾸는 것과 (b) `frame`/`at`/`duration` 기반 등장-확대-소멸
 *  애니메이션(스케일·투명도·미세 이동)을 얹는 것뿐이다 - 도형 자체를 재해석하지 않는다.
 *
 *  DustCloud   : openclipart "Simple Dust Cloud"(qubodup, Public Domain/CC0,
 *                https://openclipart.org/detail/177836/simple-dust-cloud) 원본 path 13개를
 *                그대로 사용. 발밑에서 확 퍼졌다 위로 살짝 뜨며 사라지는 먼지 뭉치.
 *  ImpactBurst : openclipart "Comic Burst - Explosion - Abstract 005"(TikiGiki,
 *                Public Domain/CC0, https://openclipart.org/detail/170774/) 원본 polygon
 *                points를 그대로 사용. 착지 순간 짧게 팝인했다 사라지는 만화식 별 모양 충격파.
 *
 *  둘 다 캐릭터 종류를 가리지 않는 범용 장식 이펙트라 scenes/ 에 둔다(REGISTRY 규칙 2,
 *  MotionSwoosh와 같은 분류). Math.random 미사용 - frame 만의 순수 함수(원칙 3).
 */
import React from 'react';
import { interpolate } from 'remotion';
import { C } from '../theme';

/* ================= DustCloud ================= */

/** openclipart-simple-dust-cloud.svg 의 <path> 13개를 원본 구조(2단 group transform +
 *  path별 transform) 그대로 옮긴 것. 좌표를 재계산하지 않았다 - 원본 파일 참고:
 *  assets/research/downloads/motion-effects/openclipart-simple-dust-cloud.svg */
const DUST_PUFFS: { transform: string; d: string }[] = [
  { transform: 'matrix(-1 0 0 -1 2879 -292.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1 0 0 -1 2883 -294.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1 0 0 -1 2884 -298.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1 0 0 -1 2880 -301.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1 0 0 -1 2875 -300.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1 0 0 -1 2873 -296.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1 0 0 -1 2875 -293.61)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'matrix(-1.3333 0 0 -1.3333 2982 -284.67)', d: 'm315 35.815c0 1.6569-1.3432 3-3 3s-3-1.3431-3-3 1.3432-3 3-3 3 1.3431 3 3z' },
  { transform: 'translate(2248 -499.24)', d: 'm324 156.82c0 0.55228-0.44772 1-1 1s-1-0.44772-1-1 0.44772-1 1-1 1 0.44772 1 1z' },
  { transform: 'translate(2242 -502.24)', d: 'm324 156.82c0 0.55228-0.44772 1-1 1s-1-0.44772-1-1 0.44772-1 1-1 1 0.44772 1 1z' },
  { transform: 'translate(2236 -483.24)', d: 'm324 156.82c0 0.55228-0.44772 1-1 1s-1-0.44772-1-1 0.44772-1 1-1 1 0.44772 1 1z' },
  { transform: 'translate(2252 -482.24)', d: 'm324 156.82c0 0.55228-0.44772 1-1 1s-1-0.44772-1-1 0.44772-1 1-1 1 0.44772 1 1z' },
  { transform: 'translate(2237 -499.24)', d: 'm324 156.82c0 0.55228-0.44772 1-1 1s-1-0.44772-1-1 0.44772-1 1-1 1 0.44772 1 1z' },
];

export interface DustCloudProps {
  /** 뭉치 바닥 중심의 화면 좌표 (발밑 지점) */
  x: number;
  y: number;
  frame: number;
  /** 이펙트가 시작되는 프레임 */
  at: number;
  /** 확대~소멸 전체 길이(프레임) */
  duration?: number;
  /** 렌더 폭(px). 기본값을 MotionSwoosh(22~34px)보다 대폭 키웠다 - "눈에 띄게 크게" 요청 반영 */
  size?: number;
  color?: string;
  /** 사라지는 동안 위로 뜨는 거리(px) */
  rise?: number;
  style?: React.CSSProperties;
}

/** 발밑에서 확 퍼졌다 위로 살짝 뜨며 옅어지는 먼지 뭉치. */
export const DustCloud: React.FC<DustCloudProps> = ({
  x, y, frame, at, duration = 30, size = 320, color = C.inkSoft, rise = 40, style,
}) => {
  if (frame < at - 1 || frame > at + duration + 1) return null;
  const scale = interpolate(
    frame, [at, at + duration * 0.22, at + duration],
    [0.22, 1, 1.4],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const opacity = interpolate(
    frame, [at, at + duration * 0.16, at + duration * 0.65, at + duration],
    [0, 0.88, 0.5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (opacity <= 0.01) return null;
  const dy = interpolate(frame, [at, at + duration], [0, -rise], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const box = size;

  return (
    <svg
      width={box} height={box} viewBox="0 0 48 48"
      style={{
        position: 'absolute', left: x - box / 2, top: y - box * 0.62 + dy,
        overflow: 'visible', opacity,
        transform: `scale(${scale})`, transformOrigin: '50% 62%',
        pointerEvents: 'none', ...style,
      }}
    >
      <g transform="translate(-2248 35.586)">
        <g transform="matrix(2.0285 0 0 2.0285 -2935.2 668.82)" fill={color}>
          {DUST_PUFFS.map((p, i) => (
            <path key={i} transform={p.transform} d={p.d} />
          ))}
        </g>
      </g>
    </svg>
  );
};

/* ================= ImpactBurst ================= */

/** openclipart-comic-burst-explosion-abstract-005.svg 의 <polygon points> 를 그대로 옮긴 것.
 *  원본 viewBox 0 0 377 225. */
const BURST_POINTS =
  '163.85 59.219 187.7 24.587 213.43 58.455 291.65 28.584 275.12 81.86 354.61 84.526 304.27 111.17 ' +
  '354.61 155.13 272.48 159.12 240.68 199.08 190.35 168.45 124.1 200.41 137.35 140.47 21.823 164.24 ' +
  '113.5 115.16 12.817 88.524 116.16 88.524 76.412 47.228';
const BURST_VB_W = 377;
const BURST_VB_H = 225;

export interface ImpactBurstProps {
  /** 별 중심의 화면 좌표 */
  x: number;
  y: number;
  frame: number;
  at: number;
  /** 팝인~소멸 전체 길이(프레임). 짧게(기본 18) 둬야 "순간 임팩트"로 읽힌다 */
  duration?: number;
  /** 렌더 폭(px) */
  size?: number;
  color?: string;
  stroke?: string;
  /** viewBox 단위 선굵기(원본은 3.7691, 우리 굵은 잉크선 톤에 맞춰 기본을 더 두껍게 잡았다) */
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** 착지·충돌 순간 짧게 팝인했다 사라지는 만화식 별 충격파. */
export const ImpactBurst: React.FC<ImpactBurstProps> = ({
  x, y, frame, at, duration = 18, size = 360, color = C.gold, stroke = C.ink, strokeWidth = 7, style,
}) => {
  if (frame < at - 1 || frame > at + duration + 1) return null;
  const scale = interpolate(
    frame, [at, at + duration * 0.3, at + duration],
    [0.1, 1.3, 0.95],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const opacity = interpolate(
    frame, [at, at + duration * 0.12, at + duration * 0.55, at + duration],
    [0, 1, 0.85, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (opacity <= 0.01) return null;
  const h = size * (BURST_VB_H / BURST_VB_W);

  return (
    <svg
      width={size} height={h} viewBox={`0 0 ${BURST_VB_W} ${BURST_VB_H}`}
      style={{
        position: 'absolute', left: x - size / 2, top: y - h / 2,
        overflow: 'visible', opacity,
        transform: `scale(${scale})`, transformOrigin: '50% 50%',
        pointerEvents: 'none', ...style,
      }}
    >
      <polygon points={BURST_POINTS} fill={color} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
};

export default DustCloud;
