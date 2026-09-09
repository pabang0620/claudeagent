/** "번개가 칠 때 빛과 소리는 같은 지점에서 정확히 동시에 만들어지지만, 이동 속도가
 *  압도적으로 달라 서로 다른 시점에 관측자에게 도착한다"는 구조를 보여주는 범용
 *  다이어그램(번개 치고 천둥이 늦게 들리는 이유). ParallaxDiagram·TwinkleDiagram과 같은
 *  설계(독립 레이어, undefined면 그 레이어를 안 그림).
 *
 *  구도는 오케스트레이터 지시("두 선이 나란히 출발했다가 벌어지는 형태")를 그대로 따라
 *  구름(출발점) 하나에서 위/아래 두 수평 경로가 같은 x 에서 시작해 오른쪽 관측자(눈=빛,
 *  귀=소리)로 뻗어간다. `lightProgress`/`soundProgress`(둘 다 0~1, 구간 로컬 진행이 아니라
 *  "출발점에서 관측자까지 이동한 비율")를 각자 다른 속도로 올려주면, 같은 프레임에서 두
 *  선의 길이 차이 자체가 곧 속도 차이로 읽힌다. 빛은 굵은 직선 화살표 하나(잔가지 없음,
 *  채널 원칙 - 번개를 촘촘하게 그리지 않는다), 소리는 큰 물결 2.5주기짜리 곡선 하나로
 *  그린다(작은 점·원을 잔뜩 뿌리지 않는다, 채널 원칙).
 *
 *  "동시에 출발한 두 신호가 속도차로 도착 시점이 갈리는" 구조를 갖는 다른 소재(지진파의
 *  P파·S파 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다
 *  (general-ep46 02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';

export const LIGHTNING_THUNDER_VB_W = 900;
export const LIGHTNING_THUNDER_VB_H = 460;

const ORIGIN_X = 150;
const LIGHT_Y = 150;
const SOUND_Y = 330;
const CLOUD_Y = (LIGHT_Y + SOUND_Y) / 2;
const MAX_LEN = 580;
const TARGET_X = ORIGIN_X + MAX_LEN;

export interface LightningThunderDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 구름에서 "펑" 하고 동시에 터져나가는 순간의 envelope(0~1, 삼각형 모양으로 호출측이
   *  만들어 넘긴다). 원 하나가 순간 커졌다 사라진다 */
  launchPulse?: number;
  /** 빛이 구름(0)에서 관측자(1)까지 이동한 비율. undefined면 빛 경로를 안 그림 */
  lightProgress?: number;
  /** 소리가 구름(0)에서 관측자(1)까지 이동한 비율. undefined면 소리 경로를 안 그림 */
  soundProgress?: number;
  /** 빛이 막 도착한 순간의 envelope(0~1) - 눈 아이콘 옆에 작은 플래시 */
  lightArrivedPulse?: number;
  /** 소리가 막 도착한 순간의 envelope(0~1) - 귀 아이콘 옆에 작은 파동 */
  soundArrivedPulse?: number;
  /** 아이콘·외곽선 기본색. 어두운 배경(NightSkyBg)에서는 밝은 색(C.cream 등)으로 override */
  stroke?: string;
  lightColor?: string;
  soundColor?: string;
  style?: React.CSSProperties;
}

export const LightningThunderDiagram: React.FC<LightningThunderDiagramProps> = ({
  width, x = 0, y = 0, launchPulse, lightProgress, soundProgress,
  lightArrivedPulse, soundArrivedPulse,
  stroke = C.cream, lightColor = C.gold, soundColor = C.sky, style,
}) => {
  const scale = width / LIGHTNING_THUNDER_VB_W;
  const height = LIGHTNING_THUNDER_VB_H * scale;
  const showLight = lightProgress !== undefined;
  const showSound = soundProgress !== undefined;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        width={width} height={height}
        viewBox={`0 0 ${LIGHTNING_THUNDER_VB_W} ${LIGHTNING_THUNDER_VB_H}`}
        style={{ overflow: 'visible' }}
      >
        {/* 구름(출발점) */}
        {showLight || showSound ? (
          <g transform={`translate(${ORIGIN_X - 74} ${CLOUD_Y - 60})`}>
            <ThemedIcon name="cloud" size={148} color={stroke} strokePx={13} />
          </g>
        ) : null}

        {/* 동시 출발 "펑" 버스트 */}
        {launchPulse !== undefined && launchPulse > 0.01 ? (
          <circle
            cx={ORIGIN_X} cy={CLOUD_Y} r={26 + 100 * clamp01(launchPulse)}
            fill={lightColor} opacity={0.5 * (1 - clamp01(launchPulse))}
          />
        ) : null}

        {/* 관측자: 눈(빛 목적지) */}
        {showLight ? (
          <g transform={`translate(${TARGET_X - 46} ${LIGHT_Y - 46})`}>
            <ThemedIcon name="eye" size={92} color={stroke} strokePx={11} />
          </g>
        ) : null}
        {/* 관측자: 귀(소리 목적지) */}
        {showSound ? (
          <g transform={`translate(${TARGET_X - 46} ${SOUND_Y - 46})`}>
            <ThemedIcon name="ear" size={92} color={stroke} strokePx={11} />
          </g>
        ) : null}

        {/* 빛 경로 - 굵은 직선 화살표 하나 */}
        {showLight ? (() => {
          const lp = clamp01(lightProgress as number);
          const tipX = ORIGIN_X + MAX_LEN * lp;
          if (lp <= 0.003) return null;
          return (
            <g>
              <line
                x1={ORIGIN_X} y1={LIGHT_Y} x2={tipX} y2={LIGHT_Y}
                stroke={lightColor} strokeWidth={17} strokeLinecap="round"
              />
              {lp > 0.02 ? (
                <polygon
                  points={`${tipX - 4},${LIGHT_Y - 22} ${tipX + 36},${LIGHT_Y} ${tipX - 4},${LIGHT_Y + 22}`}
                  fill={lightColor}
                />
              ) : null}
            </g>
          );
        })() : null}

        {/* 소리 경로 - 큰 물결 하나(2.5주기), 촘촘한 점 없이 */}
        {showSound ? (() => {
          const sp = clamp01(soundProgress as number);
          const len = MAX_LEN * sp;
          if (len < 6) return null;
          const cycles = 2.5;
          const amp = 32;
          const steps = Math.max(2, Math.round(len / 12));
          const pts: string[] = [];
          for (let i = 0; i <= steps; i++) {
            const localX = (len * i) / steps;
            const xx = ORIGIN_X + localX;
            const yy = SOUND_Y + Math.sin((localX / MAX_LEN) * Math.PI * 2 * cycles) * amp;
            pts.push(`${xx.toFixed(1)},${yy.toFixed(1)}`);
          }
          return (
            <polyline
              points={pts.join(' ')} fill="none" stroke={soundColor} strokeWidth={14}
              strokeLinecap="round" strokeLinejoin="round"
            />
          );
        })() : null}

        {/* 도착 플래시 */}
        {lightArrivedPulse !== undefined && lightArrivedPulse > 0.01 ? (
          <circle
            cx={TARGET_X} cy={LIGHT_Y} r={26 + 46 * clamp01(lightArrivedPulse)}
            fill={lightColor} opacity={0.55 * (1 - clamp01(lightArrivedPulse))}
          />
        ) : null}
        {soundArrivedPulse !== undefined && soundArrivedPulse > 0.01 ? (
          <circle
            cx={TARGET_X} cy={SOUND_Y} r={26 + 46 * clamp01(soundArrivedPulse)}
            fill={soundColor} opacity={0.55 * (1 - clamp01(soundArrivedPulse))}
          />
        ) : null}
      </svg>
    </div>
  );
};

export default LightningThunderDiagram;
