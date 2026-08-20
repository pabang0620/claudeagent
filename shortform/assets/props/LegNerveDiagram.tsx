/** "다리를 오래 눌러 앉으면 왜 찌릿한가" 류 설명에 쓰는 다리 옆모습 다이어그램.
 *  general-ep09("다리 저림")에서 처음 필요해 만들었다 - 시간·자세를 소재로 한 다른 화에서도
 *  재사용 가능성이 있어 에피소드 로컬이 아니라 props/ 에 등록한다(대본 자산 목록의 제안을 따름).
 *
 *  HeadNerveDiagram과 같은 원칙: 새 얼굴/신체를 정교하게 그리지 않고, 단순 실루엣(허벅지+종아리+발
 *  캡슐 도형) 위에 신경 경로선과 압박 표시만 오버레이한다. 신경 경로는 무릎 뒤쪽(허벅지-종아리
 *  이음부)을 지나가도록 배치했다(script s5 "무릎 뒤쪽을 지나가는 신경"과 일치).
 *
 *  compressProgress(0~1) - 위에서 체중이 실려 눌리는 모습(무게 막대가 위에서 내려와 허벅지에
 *  닿음) + 무릎 통과 구간의 신경 신호가 옅어짐(집게 표시 등장).
 *  releaseProgress(0~1) - 눌림이 풀리며 신경 경로 여러 지점에서 불균일하게 스파크가 튐
 *  (frame 기반 결정적 sin 위상차로 "고르지 못하게 튀는" 느낌을 낸다, Math.random 미사용).
 *  두 progress는 독립적이라 s1(compress만) · s3(compress 유지) · s4(compress 감소 + release
 *  증가) · s5(compress만 재사용)를 이 컴포넌트 하나로 커버한다.
 */
import React from 'react';
import { C, SW } from '../theme';

export interface LegNerveDiagramProps {
  /** 씬 로컬 프레임 (SceneSwitcher가 자동으로 넘긴다). 스파크 깜빡임에 쓴다 */
  f: number;
  /** 화면상 한 변(폭) 크기(px) */
  width: number;
  x?: number;
  y?: number;
  /** 위에서 눌리는 압박 진행도 0~1. 생략(0)이면 압박 막대·집게 표시를 안 그린다 */
  compressProgress?: number;
  /** 눌림이 풀리며 튀는 스파크 진행도 0~1. 생략(0)이면 스파크를 안 그린다 */
  releaseProgress?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

const VB_W = 520;
const VB_H = 760;

/** 신경 경로를 3구간으로 나눈다 - 무릎(이음부) 구간만 압박에 따라 크게 옅어지게 하기 위함.
 *  좌표는 아래 실루엣(허벅지 rect 40,120,300,150 / 종아리 rect 265,140,135,470)의 뒤쪽
 *  가장자리를 따라 지난다. */
const NERVE_THIGH = 'M 90 232 C 170 246, 250 248, 316 256';
const NERVE_KNEE = 'M 316 256 C 344 260, 356 292, 344 326';
const NERVE_CALF = 'M 344 326 C 322 400, 304 480, 300 585';

/** 스파크가 튈 후보 지점(신경 경로 위 근사 좌표) + 결정적 위상(ph) - Math.random 미사용 */
const SPARK_PTS = [
  { x: 120, y: 238, ph: 0.0 },
  { x: 210, y: 249, ph: 1.4 },
  { x: 290, y: 254, ph: 2.7 },
  { x: 332, y: 292, ph: 0.6 },
  { x: 336, y: 320, ph: 3.6 },
  { x: 316, y: 400, ph: 1.9 },
  { x: 305, y: 470, ph: 4.3 },
  { x: 301, y: 545, ph: 2.3 },
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const LegNerveDiagram: React.FC<LegNerveDiagramProps> = ({
  f, width, x = 0, y = 0, compressProgress = 0, releaseProgress = 0,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const cp = clamp01(compressProgress);
  const rp = clamp01(releaseProgress);
  const height = width * (VB_H / VB_W);

  // 압박 막대: 화면 위쪽(-160)에서 허벅지 위(30)까지 cp 에 따라 내려온다
  const barStartY = -160;
  const barRestY = 30;
  const barY = barStartY + (barRestY - barStartY) * cp;

  const thighOpacity = 1 - 0.25 * cp;
  const kneeOpacity = 1 - 0.85 * cp;
  const calfOpacity = 1 - 0.2 * cp;
  const pinchOpacity = clamp01((cp - 0.15) / 0.4);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 다리 실루엣: 허벅지(가로 캡슐) + 종아리(세로 캡슐) + 발(타원) - 앉아서 무릎이
            직각으로 꺾인 옆모습 */}
        <rect x={40} y={120} width={300} height={150} rx={75} fill={fill} stroke={stroke} strokeWidth={SW} />
        <rect x={265} y={140} width={135} height={470} rx={65} fill={fill} stroke={stroke} strokeWidth={SW} />
        <ellipse cx={330} cy={628} rx={98} ry={54} fill={fill} stroke={stroke} strokeWidth={SW} />

        {/* 신경 경로 (항상 보이되, 압박이 심해질수록 무릎 구간이 크게 옅어진다) */}
        <path d={NERVE_THIGH} fill="none" stroke={C.coral} strokeWidth={10} strokeLinecap="round" opacity={thighOpacity * 0.9} />
        <path d={NERVE_KNEE} fill="none" stroke={C.coral} strokeWidth={10} strokeLinecap="round" opacity={kneeOpacity * 0.9} />
        <path d={NERVE_CALF} fill="none" stroke={C.coral} strokeWidth={10} strokeLinecap="round" opacity={calfOpacity * 0.9} />

        {/* 무릎 압박 지점 집게 표시 */}
        {pinchOpacity > 0.01 ? (
          <g opacity={pinchOpacity}>
            <path d="M 296 216 L 328 258" stroke={stroke} strokeWidth={8} strokeLinecap="round" />
            <path d="M 366 216 L 334 258" stroke={stroke} strokeWidth={8} strokeLinecap="round" />
          </g>
        ) : null}

        {/* 위에서 눌리는 압박 막대 (체중) */}
        {cp > 0.02 ? (
          <rect x={10} y={barY} width={350} height={48} rx={22} fill={C.inkSoft} opacity={0.55 + 0.35 * cp} />
        ) : null}

        {/* 눌림이 풀리며 불균일하게 튀는 스파크 (frame 기반 결정적 위상차) */}
        {rp > 0.02 ? SPARK_PTS.map((p, i) => {
          const flick = 0.5 + 0.5 * Math.sin(f / 4 + p.ph * 3);
          const threshold = 1 - rp * 0.85;
          if (flick < threshold) return null;
          const r = 9 + 9 * flick;
          return (
            <circle key={i} cx={p.x} cy={p.y} r={r} fill={C.gold} stroke={stroke} strokeWidth={4} opacity={rp} />
          );
        }) : null}
      </svg>
    </div>
  );
};

export default LegNerveDiagram;
