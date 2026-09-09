/** 종이 한 장(거시 시점) - 반으로 접는 동작 / 펼친 뒤 남은 접힌 선(자국) / 오리가미 완성작.
 *  general-ep98 전용. PaperFiberDiagram(섬유 단위 클로즈업)과 짝을 이루는 "매크로" 시점이다.
 *  REGISTRY 3절 확인 완료 - 종이를 접는 매크로 동작을 보여줄 기존 자산이 없었다.
 *
 *  PaperSheetFold: foldProgress(0~1, 접히는 동작 - CSS 3D 없이 오른쪽 패널의 폭을 줄이고
 *  약간 스큐를 줘 "덮이는" 착시만 낸다) 와 creaseMarkProgress(0~1, 펼친 평평한 종이 위에
 *  접힌 선 자국이 그려짐) 는 같은 물체의 서로 다른 상태라 한쪽만 렌더한다(둘 다 undefined면
 *  아무것도 안 그림). 이 둘은 PaperFiberDiagram의 "여러 레이어를 동시에 켤 수 있는" 설계와
 *  달리 상호 배타적 상태 전환이다 - 주석으로 명시해 다음 화 재사용 시 혼동을 막는다.
 *
 *  OrigamiCrane: 종이접기 활용 사례를 가볍게 보여주는 정적 실루엣(revealProgress로 등장 +
 *  접힌 선이 순차적으로 그려짐). 사실적 형태보다 "접힌 선이 뚜렷하게 남아 모양을 유지한다"는
 *  개념 전달이 목적이라 극단적으로 단순화했다(원칙 - 신체/사실적 묘사 대신 개념 스케치).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ============================================================
 * PaperSheetFold
 * ============================================================ */
export interface PaperSheetFoldProps {
  width: number;
  x?: number;
  y?: number;
  aspect?: number; // height / width
  /** 0~1. 오른쪽 패널이 접혀 왼쪽 위로 덮인다 */
  foldProgress?: number;
  /** 0~1. 평평하게 펼친 종이 위에 접힌 선 자국이 그려짐(foldProgress와 동시에 쓰지 않는다) */
  creaseMarkProgress?: number;
  stroke?: string;
  fill?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const PaperSheetFold: React.FC<PaperSheetFoldProps> = ({
  width, x = 0, y = 0, aspect = 4 / 3, foldProgress, creaseMarkProgress,
  stroke = C.ink, fill = C.paper, accent = C.coral, style,
}) => {
  const height = width * aspect;

  if (foldProgress !== undefined) {
    const fp = clamp01(foldProgress);
    // 오른쪽 패널 폭이 접힌 선 쪽으로 줄어들며 왼쪽 패널 위로 겹쳐진다 - 진짜 3D/스큐 없이
    // scaleX 하나만으로 "접히는" 착시를 낸다(Remotion 헤드리스 렌더 안정성 우선). 스큐를
    // 넣었더니 패널이 옆으로 펄럭이는 것처럼 보여 제거했다(스틸 선점검에서 발견, v1).
    const rightScaleX = lerp(1, 0.06, fp);
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, width: width / 2, height,
          background: fill, border: `${SW}px solid ${stroke}`, borderRadius: 10,
        }}
        />
        <div style={{
          position: 'absolute', left: width / 2, top: 0, width: width / 2, height,
          transformOrigin: '0% 50%',
          transform: `scaleX(${rightScaleX})`,
          background: fill, border: `${SW}px solid ${stroke}`, borderRadius: 10,
          boxShadow: fp > 0.15 ? `-6px 0 ${10 + 14 * fp}px rgba(37,46,58,${0.1 + 0.18 * fp})` : 'none',
        }}
        />
        <div style={{
          position: 'absolute', left: width / 2 - SW / 2, top: 0, width: SW, height,
          background: stroke, opacity: 0.16 + 0.5 * fp,
        }}
        />
      </div>
    );
  }

  if (creaseMarkProgress !== undefined) {
    const cp = clamp01(creaseMarkProgress);
    const midX = width / 2;
    return (
      <svg
        width={width} height={height}
        style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
        shapeRendering="geometricPrecision"
      >
        <rect x={0} y={0} width={width} height={height} rx={14} fill={fill} stroke={stroke} strokeWidth={SW} />
        <line
          x1={midX} y1={16} x2={midX} y2={height - 16}
          stroke={stroke} strokeWidth={4} opacity={0.55}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cp}
        />
        <line
          x1={midX - 5} y1={16} x2={midX - 5} y2={height - 16}
          stroke={accent} strokeWidth={2.5} opacity={cp * 0.6}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cp}
        />
      </svg>
    );
  }

  return null;
};

/* ============================================================
 * OrigamiCrane - 종이접기 활용 사례 (가볍게)
 * ============================================================ */
export const ORIGAMI_VB_W = 480;
export const ORIGAMI_VB_H = 480;

const CRANE_CREASES = [
  'M 240 140 L 240 430',
  'M 150 270 L 330 270',
  'M 240 140 L 300 235',
  'M 240 140 L 180 235',
  'M 300 205 L 330 270',
];

export interface OrigamiCraneProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 몸체가 나타난 뒤 접힌 선이 순차적으로 그려짐 */
  revealProgress?: number;
  stroke?: string;
  fill?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const OrigamiCrane: React.FC<OrigamiCraneProps> = ({
  width, x = 0, y = 0, revealProgress = 1, stroke = C.ink, fill = C.paper, accent = C.gold, style,
}) => {
  const rp = clamp01(revealProgress);
  const bodyA = Math.min(1, rp / 0.3);
  const bodyScale = lerp(0.85, 1, bodyA);

  return (
    <svg
      viewBox={`0 0 ${ORIGAMI_VB_W} ${ORIGAMI_VB_H}`}
      width={width} height={(width * ORIGAMI_VB_H) / ORIGAMI_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      <g opacity={bodyA} transform={`translate(240 270) scale(${bodyScale}) translate(-240 -270)`}>
        {/* 몸통 */}
        <path d="M 240 140 L 330 270 L 240 430 L 150 270 Z" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
        {/* 왼쪽 날개 */}
        <path d="M 240 140 L 50 60 L 180 235 Z" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
        {/* 오른쪽 날개 */}
        <path d="M 240 140 L 430 60 L 300 235 Z" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
        {/* 목·머리 */}
        <path d="M 300 200 L 410 90 L 330 270 Z" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 400 110 L 430 70 L 410 90 Z" fill={accent} stroke={stroke} strokeWidth={SW_THIN * 0.8} strokeLinejoin="round" />
        {/* 꼬리 */}
        <path d="M 170 330 L 40 400 L 150 270 Z" fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
      </g>
      {rp > 0.25
        ? CRANE_CREASES.map((d, i) => {
          const stagger = 0.25 + (i / CRANE_CREASES.length) * 0.5;
          const cp = clamp01((rp - stagger) / 0.35);
          if (cp <= 0) return null;
          return (
            <path
              key={i} d={d} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round"
              opacity={0.75} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cp}
            />
          );
        })
        : null}
    </svg>
  );
};

export default PaperSheetFold;
