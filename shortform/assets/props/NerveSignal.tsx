/** "한 지점에서 다른 지점으로 신호/경로가 이동한다"는 구조를 보여주는 범용 오버레이.
 *
 *  HeadNerveDiagram/LegNerveDiagram 은 캐릭터 몸 위에 정확히 겹치는 신경선 전용이라 얼굴·다리
 *  형태에 종속된다. 이 컴포넌트는 그런 종속 없이 "화면 위 두 점 A, B 를 곡선으로 잇고, 그 선을
 *  progress 만큼 그리고, 그 위를 신호(또는 이동 물질)가 지나간다" 는 순수한 기하 구조만 다룬다.
 *  general-ep13(매운맛) s4·s5 의 "성분 -> 신경 -> 뇌" 경로, s8 의 "캡사이신 -> 지방(우유)로
 *  이동" 경로가 첫 사용처지만, 두 지점을 잇는 신호 이동 연출 전반(전기 신호, 물질 이동, 경로
 *  비교 등)에 재사용 가능하다.
 *
 *  곡선은 2차 베지어 한 가닥이다. from-to 를 잇는 직선의 수직 방향으로 `bow`(px) 만큼
 *  휘어지는 제어점을 자동 계산한다 - 호출부가 직접 제어점을 계산할 필요가 없다.
 *  경로가 그려지는 정도(`showPath`)는 SVG `pathLength=1` 트릭(HeadNerveDiagram 과 동일 원리)
 *  으로, 신호 위치(`signalT`)는 같은 베지어 공식을 JS 로 재계산해 정확히 선 위에 찍는다.
 */
import React from 'react';
import { C, W, H } from '../theme';

function quadPoint(
  p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, t: number
) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface NerveSignalProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** 직선에서 수직으로 얼마나 휠지(px). 음수면 반대 방향으로 휜다 */
  bow?: number;
  /** 경로가 그려지는 진행도 0~1 (기본 1 = 다 그려짐) */
  showPath?: number;
  /** 경로 위를 이동하는 신호의 위치 0~1. 생략하면 신호 점을 그리지 않는다 */
  signalT?: number;
  pathColor?: string;
  strokeWidth?: number;
  dotColor?: string;
  dotRadius?: number;
  dotStroke?: string;
  style?: React.CSSProperties;
}

/** 화면 전체를 덮는 절대좌표 SVG 오버레이. from/to 는 화면(px) 좌표를 그대로 받는다. */
export const NerveSignal: React.FC<NerveSignalProps> = ({
  from, to, bow = 70, showPath = 1, signalT,
  pathColor = C.ink, strokeWidth = 9, dotColor = C.coral, dotRadius = 16, dotStroke = C.ink, style,
}) => {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const ctrl = { x: mx + nx * bow, y: my + ny * bow };

  const p = clamp01(showPath);
  const sig = signalT === undefined ? null : clamp01(signalT);
  const pos = sig !== null ? quadPoint(from, ctrl, to, sig) : null;

  return (
    <svg
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style }}
    >
      {p > 0.001 ? (
        <path
          d={`M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`}
          fill="none" stroke={pathColor} strokeWidth={strokeWidth} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}
        />
      ) : null}
      {pos ? <circle cx={pos.x} cy={pos.y} r={dotRadius} fill={dotColor} stroke={dotStroke} strokeWidth={5} /> : null}
    </svg>
  );
};

export default NerveSignal;
