/** 이 화(general-ep59, "그 무거운 구름이 하늘에 떠 있는 이유") 전용 장면.
 *
 *  s1(캐릭터가 하늘 위 구름을 올려다봄, 무성 - CloudFloatDiagram을 progress 전부 undefined인
 *  "정지 구름" 상태로 재사용) -> s2(BustActor 'thinking' 리액션 "저 구름, 왜 안 떨어지지") ->
 *  s3(CloudFloatDiagram dropletsProgress - 구름을 확대하면 물방울들로 이루어짐) ->
 *  s4(같은 다이어그램 fallProgress - 작은 물방울과 큰 빗방울이 같은 시간 다른 거리를 낙하) ->
 *  s5(같은 다이어그램 updraftProgress - 상승기류가 물방울을 떠받침) -> s6(같은 다이어그램
 *  weighProgress - 저울 위 구름 vs 코끼리, 무게가 어마어마함) -> s7(비가 쏟아지는 전환,
 *  로컬 RainStreaks + 재사용 구름).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 작은 물방울과 큰 빗방울의 크기 대비가 중심이라
 *  s4는 비교용 물방울 딱 2개(작게 1 + 크게 1)만 그리고 화면에 흩뿌리지 않는다. 공기 저항은
 *  굵은 화살표 2개로만(s5, 작은 화살표 방사형 금지). 구름 자체는 뭉게뭉게한 단순 실루엣
 *  (CloudFloatDiagram의 Tabler cloud path 재사용, 내부 텍스처 없음). "징그럽다" 재발 방지 -
 *  물방울은 전부 매끈한 원/눈물방울 도형.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CloudFloatDiagram, CLOUD_FLOAT_VB_W, FPS, FS, Label, POSES, PlainBg, W,
  clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * S1: 하늘 위 구름을 올려다봄 (무성)
 * ================================================================ */

const S1_CLOUD_WIDTH = 620;
const S1_CLOUD_X = CX - S1_CLOUD_WIDTH / 2;
const S1_CLOUD_Y = 250;
/** 세로 하단 안전영역을 채우도록 크게(24화 결함 재발 방지 - 화면 아래쪽 여백 과다 금지).
 *  general-ep46(번개, 밤하늘 올려다보는 구도)의 ACTOR_SIZE=860/ACTOR_GROUND=1600 실측을
 *  참고해 비슷한 크기로 잡았다. */
const S1_ACTOR_SIZE = 820;
const S1_ACTOR_GROUND = 1620;

export const S1Look: React.FC<{ f: number }> = ({ f }) => {
  const settle = clamp01(f / 22);
  const pose: Pose = { ...POSES.pointUp };
  return (
    <PlainBg ground={S1_ACTOR_GROUND - 20}>
      <CloudFloatDiagram width={S1_CLOUD_WIDTH} x={S1_CLOUD_X} y={S1_CLOUD_Y} />
      <Actor
        size={S1_ACTOR_SIZE} centerX={CX} ground={S1_ACTOR_GROUND} pose={pose}
        style={{ opacity: 0.6 + 0.4 * settle }}
      />
    </PlainBg>
  );
};

/* ================================================================
 * S2: "저 구름, 왜 안 떨어지지" 리액션 (바스트샷, 립싱크)
 * ================================================================ */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = { ...POSES.thinking };

  return (
    <PlainBg ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * 공용: CloudFloatDiagram 고정 배치(s3~s6) + 라벨 위치
 * ================================================================ */
const DIAG_WIDTH = 600;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 300;
const LABEL_Y = 1150;
/** s6 저울 오른쪽 접시 위 "코끼리" 라벨 - CloudFloatDiagram 내부 weighProgress 저울 좌표
 *  (PIVOT={320,470}, BEAM_HALF=220, ROPE_LEN=96, ELE_SCALE=0.62)를 그대로 따라 코끼리 귀
 *  꼭대기 위치를 프레임 전수 스캔해 계산한 고정 위치. wp(0~1)에 따라 코끼리 접시가 최대
 *  15도까지 기울며 위로 움직이는데, 귀 꼭대기가 가장 높이(=화면상 가장 위로) 올라가는
 *  지점은 weighProgress가 거의 1(장면 후반, 코끼리 2마리 모두 완전히 팝인)일 때로
 *  local y 최소값이 약 400.9다(1차 시도 local y=370은 스틸 선점검에서 장면 후반 프레임에
 *  귀와 라벨 글자가 겹치는 게 실제로 관찰돼 위로 더 올렸다 - "라벨이 도형·돌출부와
 *  겹치지 않는지" 원칙, FS.small=34 기준 텍스트 줄높이(~41px 로컬 환산 시 ~44)까지
 *  포함해 20px 이상 여유를 두도록 local y=335로 조정). */
const ELEPHANT_LABEL_X = DIAG_X + (533 / CLOUD_FLOAT_VB_W) * DIAG_WIDTH;
const ELEPHANT_LABEL_Y = DIAG_Y + (335 / CLOUD_FLOAT_VB_W) * DIAG_WIDTH;

/* ================================================================
 * S3: 구름은 작은 물방울 수십억 개
 * ================================================================ */

export const S3Droplets: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const dropletsProgress = progress(f, frames * 0.06, frames * 0.92);
  const labelA = progress(f, frames * 0.4, frames * 0.6);
  return (
    <PlainBg>
      <CloudFloatDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} dropletsProgress={dropletsProgress} />
      <Label x={CX} y={LABEL_Y} text={t.s3Label} size={52} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 아주 작은 물방울과 큰 빗방울 - 같은 시간, 다른 낙하 거리
 * ================================================================ */

export const S4Fall: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const fallProgress = progress(f, frames * 0.1, frames * 0.98);
  const labelA = progress(f, frames * 0.35, frames * 0.55);
  return (
    <PlainBg>
      <CloudFloatDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} fallProgress={fallProgress} />
      <Label x={CX} y={LABEL_Y} text={t.s4Label} size={52} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 상승기류가 물방울을 떠받침
 * ================================================================ */

export const S5Updraft: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const updraftProgress = progress(f, frames * 0.08, frames * 0.95);
  const labelA = progress(f, frames * 0.4, frames * 0.6);
  return (
    <PlainBg>
      <CloudFloatDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} updraftProgress={updraftProgress} />
      <Label x={CX} y={LABEL_Y} text={t.s5Label} size={52} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 저울 위 구름 vs 코끼리 - 무게는 어마어마함
 * ================================================================ */

export const S6Weigh: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const weighProgress = progress(f, frames * 0.1, frames * 0.9);
  const labelA = progress(f, frames * 0.55, frames * 0.75);
  /** 코끼리 접시(elephant1A)가 눈에 띄기 시작한 직후부터 서서히 나타나 끝까지 유지.
   *  코끼리 실루엣이 확대해도 코끼리로 뚜렷이 읽히지 않는다는 피드백(사용자 지시)에 따라
   *  "코끼리"라는 짧은 라벨을 추가한다 - 대본·타임코드는 건드리지 않는 순수 시각 보강. */
  const elephantLabelA = progress(f, frames * 0.22, frames * 0.42);
  return (
    <PlainBg>
      <CloudFloatDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} weighProgress={weighProgress} />
      <Label
        x={ELEPHANT_LABEL_X} y={ELEPHANT_LABEL_Y} text={t.s6ElephantLabel} size={FS.small}
        color={C.ink} align="center" style={{ opacity: elephantLabelA }}
      />
      <Label x={CX} y={LABEL_Y} text={t.s6Label} size={52} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 비가 쏟아지는 전환 - 그 무게가 한꺼번에 떨어짐
 * ================================================================ */

const RAIN_CLOUD_WIDTH = 500;
const RAIN_CLOUD_X = CX - RAIN_CLOUD_WIDTH / 2;
const RAIN_CLOUD_Y = 260;
/** 구름 아래에서 시작하는 빗줄기 7가닥 - 굵은 선 위주(채널 원칙), 잔뜩 뿌리지 않는다 */
const RAIN_STREAK_DX = [-190, -130, -55, 10, 80, 145, 205];
const RAIN_TOP = 560;
const RAIN_BOTTOM = 1180;
const RAIN_PERIOD = 20;
const RAIN_PHASE = [0, 5, 11, 3, 15, 8, 18];
const GROUND_Y = 1200;

export const S7Rain: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const introA = progress(f, 0, 16);
  return (
    <PlainBg ground={null}>
      <CloudFloatDiagram width={RAIN_CLOUD_WIDTH} x={RAIN_CLOUD_X} y={RAIN_CLOUD_Y} style={{ opacity: introA }} />
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={-200} y1={GROUND_Y} x2={W + 200} y2={GROUND_Y} stroke={C.hill} strokeWidth={10} strokeLinecap="round" opacity={introA} />
        {RAIN_STREAK_DX.map((dx, i) => {
          const local = (f + RAIN_PHASE[i]) % RAIN_PERIOD;
          const p = local / RAIN_PERIOD;
          const yMid = RAIN_TOP + p * (RAIN_BOTTOM - RAIN_TOP);
          const edgeFade = Math.min(1, Math.min(p, 1 - p) * 5);
          const op = introA * (0.35 + 0.55 * edgeFade);
          return (
            <line
              key={i}
              x1={CX + dx} y1={yMid - 34} x2={CX + dx + 10} y2={yMid + 34}
              stroke={C.waterCool} strokeWidth={11} strokeLinecap="round" opacity={op}
            />
          );
        })}
      </svg>
      <Label x={CX} y={LABEL_Y} text={t.s7Label} size={52} style={{ opacity: progress(f, frames * 0.4, frames * 0.6) }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
