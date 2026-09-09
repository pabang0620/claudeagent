/** "소리는 공기가 떨리는 것인데, 이 떨림이 벽에 부딪히면 벽 자체가 아주 살짝 함께 떨리고,
 *  그 떨림이 벽 반대쪽 공기를 다시 흔들면서 전달된다"는 3단 사슬을 보여주는 다이어그램
 *  (벽 너머로 소리가 들리는 이유, general-ep89 신설).
 *
 *  REGISTRY 확인 완료 - LightningThunderDiagram(번개·천둥, ep46)은 빛·소리가 각자 독립적으로
 *  "출발점에서 관측자까지" 이동하는 구조라 "한 매질(공기)의 떨림이 벽이라는 다른 매질로
 *  넘어갔다가 다시 반대쪽 공기로 넘어간다"는 이 화의 3단 계전 구조와 다르다. WindowPane
 *  (창문, ep53)은 온도차에 의한 김서림·결로를 다루는 소품이라 진동 전달과 무관하다. 둘 다
 *  재사용할 수 없어 새로 만든다.
 *
 *  viewBox를 세로로 긴 700x1000 비율로 잡았다(가로로 넓은 LightningThunderDiagram의
 *  900x460과 다른 판단) - 9:16 세로 캔버스에 이 소품 하나만 크게 띄우는 장면이 많아,
 *  벽을 천장까지 닿는 세로로 긴 블록으로 그려 세로 화면을 자연스럽게 채운다(처음 900x520
 *  가로 비율로 만들었다가 스틸 선점검에서 화면 상하 여백이 과다한 것을 발견해 다시 잡았다,
 *  원칙 5). LightningThunderDiagram·StarlightDiagram과 같은 설계(독립 레이어, undefined면
 *  그 레이어를 안 그림)는 그대로 유지한다. 물결선은 채널 원칙("굵게 2~3개, 작은 점 금지")에
 *  따라 각 구간마다 굵은 sine 폴리라인 하나로만 그린다. 벽은 단순한 사각 블록 하나(오케스트
 *  레이터 지시 - 벽돌 무늬 등 질감 묘사 없음)로 그린다.
 *
 *  `emitProgress`(0~1, 음원에서 벽까지 물결선이 자라남), `vibrateProgress`(0~1, 벽 블록이
 *  아주 살짝 좌우로 떨리고(±3px, "아주 살짝" - 눈에 안 보일 만큼 미세하게) 벽 위·아래 면을
 *  따라 짧은 가로 떨림선 2가닥이 옅게 나타남 - `f`를 주면 계속 흔들리는 반복 떨림이 된다),
 *  `transmitProgress`(0~1, 벽 반대쪽 면에서 귀까지 새 물결선이 자라남)를 기본 단일 경로
 *  레이어로 받는다.
 *
 *  `freqProgress`(0~1, undefined면 비교 모드를 안 그림)는 별도 비교 모드다 - 같은 벽을
 *  위/아래 두 줄로 나눠 짧고 촘촘한 물결(높은 소리)과 길고 성긴 물결(낮은 소리)을 나란히
 *  통과시키되, 벽을 통과한 뒤(오른쪽 구간)의 진폭을 고음은 크게 줄이고(22%) 저음은 거의
 *  유지(78%)해 "낮은 소리가 벽을 더 쉽게 통과한다"를 좌표(진폭)로 직접 보여준다(과장·왜곡
 *  없이 파장은 그대로 두고 진폭 감쇠율만 다르게 설계). 0~0.5는 음원->벽 구간이, 0.5~1은
 *  벽->귀 구간이 자란다.
 *
 *  "한 매질의 떨림이 경계를 넘어 다른 매질로 전달되고, 전달 효율이 파장(진동수)에 따라
 *  달라지는" 구조를 갖는 다른 소재(방음재, 지진파 감쇠 등) 전반 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 여기 등록한다(general-ep89 02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';

export const WALL_VIBRATION_VB_W = 700;
export const WALL_VIBRATION_VB_H = 1000;

const WALL_X = 300;
const WALL_W = 100;
const WALL_Y = 70;
const WALL_H = 860;
const WALL_CY = WALL_Y + WALL_H / 2;

const SOURCE_X = 100;
const SOURCE_Y = WALL_CY;
const EAR_X = 600;
const EAR_Y = WALL_CY;
const ICON_SIZE = 130;

const HIGH_Y = 280;
const LOW_Y = 720;
const FREQ_ICON_SIZE = 92;

/** 벽 중앙 지점(호출 씬이 강조 링 등을 얹을 때 앵커로 쓴다) */
export const WALL_VIBRATION_WALL_PT = { x: WALL_X + WALL_W / 2, y: WALL_CY };
export const WALL_VIBRATION_HIGH_LABEL_PT = { x: WALL_X / 2 + WALL_W / 2, y: HIGH_Y - 110 };
export const WALL_VIBRATION_LOW_LABEL_PT = { x: WALL_X / 2 + WALL_W / 2, y: LOW_Y - 110 };

function wavePoints(x0: number, x1: number, y: number, amp: number, cycles: number): string {
  const len = x1 - x0;
  if (len < 4) return '';
  const steps = Math.max(2, Math.round(len / 8));
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const lx = (len * i) / steps;
    const xx = x0 + lx;
    const yy = y + Math.sin((lx / len) * Math.PI * 2 * cycles) * amp;
    pts.push(`${xx.toFixed(1)},${yy.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** 자라나는 구간 하나(0~1)를 그린다. p<=0.003 이면 아무것도 안 그림(막 시작한 점 잔상 방지) */
const GrowingWave: React.FC<{
  x0: number; x1: number; y: number; p: number; amp: number; cycles: number; color: string;
  strokeWidth?: number;
}> = ({ x0, x1, y, p, amp, cycles, color, strokeWidth = 15 }) => {
  const cp = clamp01(p);
  if (cp <= 0.003) return null;
  const tipX = x0 + (x1 - x0) * cp;
  const pts = wavePoints(x0, tipX, y, amp, cycles * cp);
  if (!pts) return null;
  return (
    <polyline
      points={pts} fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
    />
  );
};

export interface WallVibrationDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 음원(왼쪽)에서 벽까지 물결선이 자라나는 진행도. undefined면 안 그림 */
  emitProgress?: number;
  /** 벽이 아주 살짝 떨리는 진행도(잔떨림선 포함). undefined면 벽을 안 그림 */
  vibrateProgress?: number;
  /** 벽 반대쪽 면에서 귀까지 물결선이 자라나는 진행도. undefined면 안 그림 */
  transmitProgress?: number;
  /** 고음/저음 비교 모드(0~1). 지정하면 emit/vibrate/transmit 레이어 대신 이 모드를 그린다 */
  freqProgress?: number;
  /** 벽 떨림에 반복 위상을 주는 프레임(선택 - DogNoseCloseup류와 같은 f 예외, Math.random 미사용) */
  f?: number;
  stroke?: string;
  waveColor?: string;
  wallColor?: string;
  style?: React.CSSProperties;
}

export const WallVibrationDiagram: React.FC<WallVibrationDiagramProps> = ({
  width, x = 0, y = 0, emitProgress, vibrateProgress, transmitProgress, freqProgress, f,
  stroke = C.ink, waveColor = C.coral, wallColor = C.roomDeep, style,
}) => {
  const scale = width / WALL_VIBRATION_VB_W;
  const height = WALL_VIBRATION_VB_H * scale;
  const freqMode = freqProgress !== undefined;
  const showWall = freqMode || emitProgress !== undefined || vibrateProgress !== undefined
    || transmitProgress !== undefined;

  const jitterAmp = 3.4 * clamp01(vibrateProgress ?? 0);
  const jitterDx = f !== undefined
    ? jitterAmp * (0.6 * Math.sin(f * 1.7) + 0.4 * Math.sin(f * 3.1 + 1.3))
    : jitterAmp * 0.5;
  const trillP = clamp01(((vibrateProgress ?? 0) - 0.1) / 0.7);
  const trillPhase = f !== undefined ? f * 2.1 : 0;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        width={width} height={height}
        viewBox={`0 0 ${WALL_VIBRATION_VB_W} ${WALL_VIBRATION_VB_H}`}
        style={{ overflow: 'visible' }}
      >
        {/* 벽 - 단순한 사각 블록 하나(천장까지 닿는 느낌으로 세로로 길게) */}
        {showWall ? (
          <g transform={`translate(${jitterDx} 0)`}>
            <rect
              x={WALL_X} y={WALL_Y} width={WALL_W} height={WALL_H} rx={10}
              fill={wallColor} stroke={stroke} strokeWidth={10}
            />
            {trillP > 0.01 ? (
              <>
                <polyline
                  points={(() => {
                    const x0 = WALL_X + WALL_W * 0.22; const x1 = WALL_X + WALL_W * 0.78; const len = x1 - x0;
                    const steps = 10; const amp = 4 + 7 * trillP;
                    const pts: string[] = [];
                    for (let i = 0; i <= steps; i++) {
                      const lx = (len * i) / steps;
                      const yy = WALL_Y - 22 + Math.sin((lx / len) * Math.PI * 2.5 + trillPhase) * amp;
                      pts.push(`${(x0 + lx).toFixed(1)},${yy.toFixed(1)}`);
                    }
                    return pts.join(' ');
                  })()}
                  fill="none" stroke={waveColor} strokeWidth={8} strokeLinecap="round" opacity={trillP}
                />
                <polyline
                  points={(() => {
                    const x0 = WALL_X + WALL_W * 0.22; const x1 = WALL_X + WALL_W * 0.78; const len = x1 - x0;
                    const steps = 10; const amp = 4 + 7 * trillP;
                    const pts: string[] = [];
                    for (let i = 0; i <= steps; i++) {
                      const lx = (len * i) / steps;
                      const yy = WALL_Y + WALL_H + 22 + Math.sin((lx / len) * Math.PI * 2.5 + trillPhase + 1.4) * amp;
                      pts.push(`${(x0 + lx).toFixed(1)},${yy.toFixed(1)}`);
                    }
                    return pts.join(' ');
                  })()}
                  fill="none" stroke={waveColor} strokeWidth={8} strokeLinecap="round" opacity={trillP}
                />
              </>
            ) : null}
          </g>
        ) : null}

        {!freqMode ? (
          <>
            {emitProgress !== undefined ? (
              <>
                <g transform={`translate(${SOURCE_X - ICON_SIZE / 2} ${SOURCE_Y - ICON_SIZE / 2})`}>
                  <ThemedIcon name="music" size={ICON_SIZE} color={stroke} strokePx={12} />
                </g>
                <GrowingWave
                  x0={SOURCE_X + ICON_SIZE / 2 + 16} x1={WALL_X} y={SOURCE_Y}
                  p={emitProgress} amp={26} cycles={2.1} color={waveColor}
                />
              </>
            ) : null}
            {transmitProgress !== undefined ? (
              <>
                <g transform={`translate(${EAR_X - ICON_SIZE / 2} ${EAR_Y - ICON_SIZE / 2})`}>
                  <ThemedIcon name="ear" size={ICON_SIZE} color={stroke} strokePx={12} />
                </g>
                <GrowingWave
                  x0={WALL_X + WALL_W} x1={EAR_X - ICON_SIZE / 2 - 16} y={EAR_Y}
                  p={transmitProgress} amp={26} cycles={2.1} color={waveColor}
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            {[
              { laneY: HIGH_Y, cyclesIn: 4.2, ampOutRatio: 0.22 },
              { laneY: LOW_Y, cyclesIn: 1.3, ampOutRatio: 0.78 },
            ].map((lane, i) => {
              const inP = clamp01((freqProgress as number) / 0.5);
              const outP = clamp01(((freqProgress as number) - 0.5) / 0.5);
              const ampIn = 24;
              return (
                <React.Fragment key={i}>
                  <g transform={`translate(${SOURCE_X - FREQ_ICON_SIZE / 2} ${lane.laneY - FREQ_ICON_SIZE / 2})`}>
                    <ThemedIcon name="music" size={FREQ_ICON_SIZE} color={stroke} strokePx={10} />
                  </g>
                  <g transform={`translate(${EAR_X - FREQ_ICON_SIZE / 2} ${lane.laneY - FREQ_ICON_SIZE / 2})`}>
                    <ThemedIcon name="ear" size={FREQ_ICON_SIZE} color={stroke} strokePx={10} />
                  </g>
                  <GrowingWave
                    x0={SOURCE_X + FREQ_ICON_SIZE / 2 + 12} x1={WALL_X} y={lane.laneY}
                    p={inP} amp={ampIn} cycles={lane.cyclesIn} color={waveColor} strokeWidth={12}
                  />
                  <GrowingWave
                    x0={WALL_X + WALL_W} x1={EAR_X - FREQ_ICON_SIZE / 2 - 12} y={lane.laneY}
                    p={outP} amp={ampIn * lane.ampOutRatio} cycles={lane.cyclesIn} color={waveColor}
                    strokeWidth={12}
                  />
                </React.Fragment>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
};

export default WallVibrationDiagram;
