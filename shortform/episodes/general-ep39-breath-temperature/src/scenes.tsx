/** 이 화(general-ep39, "하~는 따뜻한데 후~는 시원한 이유") 전용 장면.
 *
 *  s1(무성, 손이 시린 캐릭터가 두 손을 비비다 입 가까이 가져감) -> s2(리액션+훅 질문,
 *  립싱크) -> s3(하~ - 크게 벌린 입 옆으로 넓고 느린 공기 흐름, BreathFlowDiagram
 *  mode='wide') -> s4(후~ - 좁게 오므린 입 옆으로 빠르고 좁은 공기 + 주변 찬 공기가
 *  딸려 들어와 섞임, BreathFlowDiagram mode='narrow') -> s5(결론, 손 위 온도 아이콘
 *  비교) -> s6(선풍기도 같은 원리, ElectricFan + ScentWaves).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 입 모양 대비가 중심 - 크게 벌린 입과
 *  좁게 오므린 입을 확실히 다르게 그린다. 공기 흐름은 굵은 선 2~3가닥으로만(작은
 *  화살표·점 흩뿌리기 금지). 따뜻함/시원함은 색 대비(따뜻한 톤/차가운 톤)로. 주변 공기가
 *  딸려 들어와 섞이는 것은 굵은 화살표 2개가 합류하는 형태로 단순하게.
 */
import React from 'react';
import {
  Actor, BreathFlowDiagram, BustActor, C, Caption, ElectricFan, FPS, Label, PlainBg, POSES,
  PopIn, ScentWaves, ThemedIcon, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- S1: 손이 시려 두 손을 비비다 입 가까이 가져간다 (무성) ---------------- */

const ACTOR_SIZE = 900;
const ACTOR_GROUND = 1650;

export const S1Rub: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const rubT = progress(f, 0, frames * 0.75);
  const pose: Pose = blendPose(POSES.idle, POSES.shrug, rubT);
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} breathAmp={1} />
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- 공용: 입김 다이어그램 배치(s3/s4 고정 카메라) ---------------- */

const BREATH_WIDTH = 760;
const BREATH_X = (W - BREATH_WIDTH) / 2;
const BREATH_Y = 300;
const BREATH_LABEL_PT = { x: CX, y: BREATH_Y - 60 };

/* ---------------- S3: 하~ (크게 벌린 입, 넓고 느린 공기) ---------------- */

export const S3Warm: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const airSpeed = progress(f, frames * 0.12, frames * 0.85);
  const labelA = progress(f, frames * 0.18, frames * 0.34);
  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <BreathFlowDiagram width={BREATH_WIDTH} x={BREATH_X} y={BREATH_Y} mode="wide" airSpeed={airSpeed} />
      <Label x={BREATH_LABEL_PT.x} y={BREATH_LABEL_PT.y} text={t.s3Label} size={54} color={C.coral} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 후~ (좁게 오므린 입, 빠르고 좁은 공기 + 찬 공기 합류) ---------------- */

export const S4Cool: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const airSpeed = progress(f, frames * 0.1, frames * 0.5);
  const mixWithCold = progress(f, frames * 0.48, frames * 0.92);
  const labelA = progress(f, frames * 0.14, frames * 0.3);
  return (
    <PlainBg top={C.seaTop} bottom={C.paper} ground={null}>
      <BreathFlowDiagram
        width={BREATH_WIDTH} x={BREATH_X} y={BREATH_Y} mode="narrow"
        airSpeed={airSpeed} mixWithCold={mixWithCold}
      />
      <Label x={BREATH_LABEL_PT.x} y={BREATH_LABEL_PT.y} text={t.s4Label} size={54} color={C.waterCool} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론 - 손 위 온도 아이콘(따뜻/시원) 비교 ---------------- */

const HAND_SIZE = 260;
const HAND_Y = 820;
const HAND_L_X = CX - 250;
const HAND_R_X = CX + 250;
const BADGE_SIZE = 108;

const TempHandBadge: React.FC<{
  cx: number; y: number; progressT: number; mirror?: boolean; badgeIcon: string; badgeColor: string; badgeBg: string;
}> = ({ cx, y, progressT, mirror, badgeIcon, badgeColor, badgeBg }) => (
  <PopIn cx={cx} cy={y} size={HAND_SIZE} progress={progressT}>
    <div style={{ position: 'relative', width: HAND_SIZE, height: HAND_SIZE }}>
      <ThemedIcon
        name="hand-finger" size={HAND_SIZE} color={C.ink}
        style={{ position: 'absolute', left: 0, top: 0, transform: mirror ? 'scaleX(-1)' : undefined }}
      />
      <div style={{ position: 'absolute', right: mirror ? undefined : -BADGE_SIZE * 0.22, left: mirror ? -BADGE_SIZE * 0.22 : undefined, top: -BADGE_SIZE * 0.18 }}>
        <ThemedIcon name={badgeIcon} size={BADGE_SIZE * 0.58} color={badgeColor} bg={badgeBg} />
      </div>
    </div>
  </PopIn>
);

export const S5Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const leftP = progress(f, frames * 0.1, frames * 0.35);
  const rightP = progress(f, frames * 0.3, frames * 0.55);
  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <TempHandBadge cx={HAND_L_X} y={HAND_Y} progressT={leftP} mirror badgeIcon="flame" badgeColor={C.coral} badgeBg={C.coralSoft} />
      <TempHandBadge cx={HAND_R_X} y={HAND_Y} progressT={rightP} badgeIcon="snowflake" badgeColor={C.waterCool} badgeBg={C.seaTop} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 선풍기도 같은 원리 ---------------- */

const FAN_SIZE = 420;
const FAN_X = CX + 60;
const FAN_Y = 900;
const FAN_ACTOR_SIZE = 820;
const FAN_ACTOR_CENTER_X = CX - 220;
const WIND_PERIOD = 42;

export const S6Fan: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const enterT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.wide, 0.35 + 0.15 * Math.sin(f / 24));
  const labelA = progress(f, 10, 26);
  const spinDeg = (f * 26) % 360;
  const windProgress = ((f % WIND_PERIOD) / WIND_PERIOD) * enterT;
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <ElectricFan width={FAN_SIZE} x={FAN_X} y={FAN_Y} spinDeg={spinDeg} />
      <ScentWaves
        cx={FAN_X + 20} cy={FAN_Y + 150} angle={180} count={3} spread={260}
        progress={windProgress} fanDeg={20} color={C.waterCool} strokeWidth={11}
      />
      <Actor size={FAN_ACTOR_SIZE} centerX={FAN_ACTOR_CENTER_X} ground={ACTOR_GROUND} pose={pose} breathAmp={1} />
      <Label x={CX} y={220} text={t.s6Label} size={50} color={C.inkSoft} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

export const S6_WIND_PERIOD = WIND_PERIOD;
export const S1_RUB_SFX_AT = 0.4; // s1 프레임 수 기준 비율
export const S6_FAN_SFX_AT_FRAME = 6; // s6 시작 후 프레임 - 스위치 켜는 순간
