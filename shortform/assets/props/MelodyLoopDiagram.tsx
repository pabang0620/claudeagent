/** "짧은 구간이 원형 경로를 따라 계속 반복 재생되는" 루프 구조를 보여주는 다이어그램
 *  (general-ep50, "노래가 하루 종일 맴도는 이유" - 이어웜의 핵심 시각 언어).
 *
 *  "음표를 화면에 잔뜩 뿌리지 않는다. 큰 음표 2~3개로 충분하다"는 오케스트레이터 지시에
 *  따라 노트는 기본 3개만 쓰고(`noteCount`), 전부 `ThemedIcon name="music"`(단일 크기,
 *  작은 점 무리 아님)이다. 뇌·귀 등 신체 내부는 그리지 않는다(원칙 - 신체 표현 최소화).
 *
 *  `f`(프레임)로 계속 회전하는 위상을 직접 계산한다 - DogNoseCloseup·CatPurrDiagram과 같은
 *  예외(반복 재생 자체가 소재의 핵심이라 frame을 직접 받아야 "계속 돈다"는 느낌이 산다,
 *  Math.random 미사용·순수 함수, 원칙 3).
 *
 *  `loopProgress`(0~1): 루프 전체의 "존재감"이다. 0이면 아무것도 그리지 않고, 1이면 완전한
 *  루프가 선명하게 돈다. 등장(0->1)뿐 아니라 s9처럼 "돌던 루프가 멎는" 연출에도 그대로
 *  1->0으로 줄여 쓴다 - 값이 줄면 전체가 중심 쪽으로 살짝 오그라들며 옅어져 "잦아든다"는
 *  인상을 준다(회전 자체를 멈추지 않고 크기·불투명도로만 표현해 뚝 끊기지 않는다).
 *
 *  `cutProgress`(0~1, undefined/0이면 안 그림): 트랙 위 고정된 한 지점(`GAP_CENTER_DEG`)에
 *  끊긴 틈이 자란다. 0을 넘는 순간 노트 회전은 멈추고(더는 반복하지 못하고 그 자리에
 *  얼어붙는다는 뜻), 노트들은 틈 반대편부터 트랙을 채우며 정렬된다 - 그중 트랙을 거의 다
 *  돌아 틈 바로 앞에서 멈춘 노트 하나만 cutProgress에 비례해 아래로 살짝 처지며 옅어진다
 *  ("끝까지 다 부르지 못하고 중간에 끊겼다"는 인상, 작은 점 여러 개가 아니라 노트 1개의
 *  위치·불투명도 변화만으로 표현).
 *
 *  "정보가 완결되지 않아 계속 재생/반복되려는" 구조를 갖는 다른 소재(습관적 되새김, 미완료
 *  작업 알림 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다
 *  (02-script-v1.md 자산 목록).
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const MELODY_VB_W = 700;
export const MELODY_VB_H = 700;

const CENTER = { x: MELODY_VB_W / 2, y: MELODY_VB_H / 2 };
const TRACK_R = 230;
/** 트랙이 끊기는 고정 지점(도, 0=오른쪽·시계방향 증가). 항상 같은 자리라 어느 화면에서도
 *  "여기서 끊긴다"는 위치가 흔들리지 않는다 */
const GAP_CENTER_DEG = 250;
const MAX_GAP_DEG = 72;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export interface MelodyLoopDiagramProps {
  /** 씬 로컬 프레임. 회전 위상 계산에만 쓴다(끊긴 상태일 땐 위상을 얼려 무시) */
  f?: number;
  /** 화면상 한 변 크기(px). viewBox가 정사각이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** 루프 전체의 존재감 0~1. undefined/0이면 아무것도 그리지 않는다 */
  loopProgress?: number;
  /** 끊긴 정도 0~1. undefined/0이면 닫힌 루프가 계속 돈다 */
  cutProgress?: number;
  /** 노트 개수(기본 3 - 잔뜩 뿌리지 않는다) */
  noteCount?: number;
  /** 회전 한 바퀴에 걸리는 프레임 수(기본 150 = 5초@30fps) */
  periodFrames?: number;
  stroke?: string;
  noteColor?: string;
  style?: React.CSSProperties;
}

export const MelodyLoopDiagram: React.FC<MelodyLoopDiagramProps> = ({
  f = 0, width, x = 0, y = 0, loopProgress, cutProgress, noteCount = 3, periodFrames = 150,
  stroke = C.ink, noteColor = C.coral, style,
}) => {
  const loopP = clamp01(loopProgress ?? 0);
  if (loopP <= 0.001) return null;

  const cutT = clamp01(cutProgress ?? 0);
  const gapDeg = cutT * MAX_GAP_DEG;
  const scale = 0.55 + 0.45 * loopP;
  const r = TRACK_R * scale;
  const noteSize = 96 * (0.7 + 0.3 * scale);

  const halfGap = gapDeg / 2;
  const gapStart = GAP_CENTER_DEG + halfGap;
  const gapEnd = GAP_CENTER_DEG - halfGap + 360;
  const showGap = gapDeg > 1;

  // ---- 노트 각도(도) ----
  const noteAngles: number[] = [];
  if (cutT <= 0.02) {
    // 정상 루프: 계속 회전
    const phaseDeg = (f / periodFrames) * 360;
    for (let i = 0; i < noteCount; i++) noteAngles.push((i / noteCount) * 360 + phaseDeg);
  } else {
    // 끊긴 상태: 회전을 멈추고 틈 반대편부터 트랙을 채운다
    const spanDeg = 360 - gapDeg;
    for (let i = 0; i < noteCount; i++) noteAngles.push(gapStart + ((i + 1) / (noteCount + 1)) * spanDeg);
  }
  // 틈 바로 앞(트랙을 거의 다 돈 지점)에서 멈춘 노트 - 아래로 처지며 옅어짐
  const fallIndex = cutT > 0.02 ? noteCount - 1 : -1;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${MELODY_VB_W} ${MELODY_VB_H}`} width={width} height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {showGap ? (
          <>
            <path
              d={`M ${polar(CENTER.x, CENTER.y, r, gapStart).x} ${polar(CENTER.x, CENTER.y, r, gapStart).y} A ${r} ${r} 0 1 1 ${polar(CENTER.x, CENTER.y, r, gapEnd).x} ${polar(CENTER.x, CENTER.y, r, gapEnd).y}`}
              fill="none" stroke={stroke} strokeWidth={9} strokeDasharray="16 14" strokeLinecap="round"
              opacity={0.55 * loopP}
            />
            {[gapStart, gapEnd].map((deg, i) => {
              const p = polar(CENTER.x, CENTER.y, r, deg);
              const tickOut = polar(CENTER.x, CENTER.y, r + 20, deg);
              return (
                <line
                  key={i} x1={p.x} y1={p.y} x2={tickOut.x} y2={tickOut.y}
                  stroke={C.coral} strokeWidth={11} strokeLinecap="round" opacity={0.9 * loopP}
                />
              );
            })}
          </>
        ) : (
          <circle
            cx={CENTER.x} cy={CENTER.y} r={r} fill="none" stroke={stroke} strokeWidth={9}
            strokeDasharray="16 14" opacity={0.55 * loopP}
          />
        )}

        {noteAngles.map((deg, i) => {
          const p = polar(CENTER.x, CENTER.y, r, deg);
          const isFalling = i === fallIndex;
          const dy = isFalling ? cutT * 30 : 0;
          const op = (isFalling ? 1 - cutT * 0.45 : 1) * loopP;
          return (
            <g key={i} transform={`translate(${p.x - noteSize / 2} ${p.y - noteSize / 2 + dy})`} opacity={op}>
              <ThemedIcon name="music" size={noteSize} color={noteColor} strokePx={13} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MelodyLoopDiagram;
