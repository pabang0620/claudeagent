/** 이 화(general-ep46, "번개 치고 천둥이 늦게 들리는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher가 넘기는 구간 로컬 프레임 f를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props로만 받는다).
 *
 *  전 장면이 밤하늘(NightSkyBg) 위에서 진행되는 단일 배경 화라, general-ep06과 동일한 문제
 *  (캐릭터 팔다리 선이 어두운 배경에 묻힘)가 그대로 재현될 걸 예상해 general-ep06과 같은
 *  NIGHT_GLOW_STYLE(크림색 drop-shadow)을 그대로 재사용한다(원칙 0 - 새로 만들지 않는다).
 *  LightningThunderDiagram·CompareBars도 전부 stroke/labelColor를 C.cream 계열로 override해
 *  어두운 배경에서 대비를 확보한다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, BustActor, C, Caption, CompareBars, FPS, FS, H, Label, LightningThunderDiagram,
  NightSkyBg, POSES, PopIn, StepCounter, ThemedIcon, W, blendPose, clamp01, mouthAt, mouthProp,
  progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 삼각 envelope(0 -> 1 -> 0). ep16 등과 동일 패턴, 화 전용이라 로컬로 다시 둔다. */
function bump(f: number, at: number, dur: number) {
  const rise = progress(f, at, at + dur * 0.4);
  const fall = 1 - progress(f, at + dur * 0.4, at + dur);
  return Math.min(rise, fall);
}

/** general-ep06과 동일한 크림색 외곽 글로우. 원본 ink 선은 그대로 두고 실루엣 알파를 따라
 *  밝은 halo만 추가해, 얼굴 디테일은 안 바뀌고 가는 팔다리 선만 밤하늘 배경과 분리되어
 *  보이게 한다(shortform-builder 원칙 5 예방책 (a)). 에피소드 로컬 스타일이라 공용
 *  character/Actor.tsx는 건드리지 않는다. */
const NIGHT_GLOW_STYLE: React.CSSProperties = {
  filter:
    'drop-shadow(0 0 4px rgba(255,244,228,0.95)) drop-shadow(0 0 12px rgba(255,244,228,0.6)) drop-shadow(0 0 22px rgba(255,244,228,0.35))',
};

/** 공용 배경 래퍼. 전 장면이 같은 밤하늘이라 화마다 반복하지 않는다(REGISTRY 규칙 2 -
 *  에피소드 전용 조합이라 라이브러리 등록 불필요). */
const Sky: React.FC<{ horizon?: number | null; children?: React.ReactNode }> = ({
  horizon = null, children,
}) => (
  <AbsoluteFill>
    <NightSkyBg stars={34} moon={null} horizon={horizon} />
    {children}
  </AbsoluteFill>
);

/** 성긴 빗줄기 6개. "화면 가득 뿌리지 않는다"는 채널 원칙에 따라 개수를 적게 고정하고,
 *  프레임 modulo로 결정론적으로 떨어뜨린다(Math.random 금지, 원칙 3). */
const RAIN_DROPS = [
  { x: 120, ph: 0 }, { x: 300, ph: 40 }, { x: 520, ph: 18 },
  { x: 720, ph: 55 }, { x: 880, ph: 8 }, { x: 980, ph: 30 },
];
const RAIN_CYCLE = 70;
const RainStreaks: React.FC<{ f: number; opacity?: number }> = ({ f, opacity = 0.4 }) => (
  <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
    {RAIN_DROPS.map((d, i) => {
      const t = ((f + d.ph) % RAIN_CYCLE) / RAIN_CYCLE;
      const y = -60 + t * 760;
      return (
        <line
          key={i} x1={d.x} y1={y} x2={d.x - 18} y2={y + 46}
          stroke={C.nightSoft} strokeWidth={5} strokeLinecap="round" opacity={opacity}
        />
      );
    })}
  </svg>
);

/* ---------------- S1: 밤하늘, 번개가 번쩍 (무성) ---------------- */

const ACTOR_SIZE = 860;
const ACTOR_GROUND = 1600;
const LOOK_UP_POSE: Pose = { ...POSES.idle, headTilt: -14 };
const S1_FLASH_AT = 40;

export const S1Flash: React.FC<{ f: number }> = ({ f }) => {
  const lookT = progress(f, 0, 16);
  const shockT = progress(f, S1_FLASH_AT - 4, S1_FLASH_AT + 12);
  const pose: Pose = blendPose(blendPose(POSES.idle, LOOK_UP_POSE, lookT), POSES.surprised, shockT);
  const boltP = bump(f, S1_FLASH_AT, 16);

  return (
    <Sky horizon={1650}>
      <RainStreaks f={f} opacity={0.32} />
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} style={NIGHT_GLOW_STYLE} />
      {boltP > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: CX - 150, top: 260, opacity: boltP,
            transform: `scale(${0.7 + 0.5 * boltP})`,
          }}
        >
          <ThemedIcon name="bolt" size={300} color={C.gold} strokePx={16} />
        </div>
      ) : null}
      {boltP > 0.01 ? (
        <AbsoluteFill style={{ background: C.cream, opacity: boltP * 0.55, pointerEvents: 'none' }} />
      ) : null}
    </Sky>
  );
};

/* ---------------- S2: 천둥에 움찔 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const BUST_SIZE = 950;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 430;
export const S2_BOOM_AT = 2;

export const S2Startle: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = POSES.surprised;
  const shakeAmp = 8 * (1 - progress(f, S2_BOOM_AT, S2_BOOM_AT + 20));
  const dy = Math.sin(f * 2.4) * shakeAmp;
  const dx = Math.sin(f * 2.1 + 1) * shakeAmp * 0.6;

  return (
    <Sky horizon={null}>
      <RainStreaks f={f} opacity={0.26} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${dx}px, ${dy}px)` }}>
        <BustActor
          size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen}
          style={NIGHT_GLOW_STYLE}
        />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S3: 구름에서 빛+소리가 동시에 "펑" 출발 ---------------- */

const DIAG_WIDTH = 900;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 760;

export const S3Launch: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const launchPulse = bump(f, 10, 22);
  const growT = progress(f, 6, Math.max(20, frames - 10));
  const launchGrow = 0.02 + growT * 0.09;

  return (
    <Sky horizon={null}>
      <LightningThunderDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        launchPulse={launchPulse} lightProgress={launchGrow} soundProgress={launchGrow}
        stroke={C.cream} lightColor={C.gold} soundColor={C.sky}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S4: 출발선에서 나란히 뻗어나가기 시작 ---------------- */

export const S4Race: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const t = progress(f, 4, Math.max(20, frames - 8));
  const lightProgress = 0.11 + t * 0.36;
  const soundProgress = 0.11 + t * 0.30;

  return (
    <Sky horizon={null}>
      <LightningThunderDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        lightProgress={lightProgress} soundProgress={soundProgress}
        stroke={C.cream} lightColor={C.gold} soundColor={C.sky}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S5: 빛-소리 속도 막대 비교 ---------------- */

const BARS_X = 150;
const BARS_Y = 800;
const BARS_ROW_GAP = 340;
const BARS_PX_PER_UNIT = 8;

const BarLabel: React.FC<{ icon: string; iconColor: string; text: string }> = ({ icon, iconColor, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
    <ThemedIcon name={icon} size={46} color={iconColor} strokePx={11} />
    <span>{text}</span>
  </div>
);

export const S5SpeedBars: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; lightLabel: string; soundLabel: string;
}> = ({ f, frames, lines, lightLabel, soundLabel }) => (
  <Sky horizon={null}>
    <CompareBars
      x={BARS_X} y={BARS_Y} pxPerUnit={BARS_PX_PER_UNIT} rowGap={BARS_ROW_GAP} labelGap={70}
      frame={f} stroke={C.cream} labelColor={C.cream} labelSize={44}
      items={[
        {
          label: <BarLabel icon="bolt" iconColor={C.gold} text={lightLabel} />,
          value: 100, color: C.gold, at: 8, thickness: 74,
        },
        {
          label: <BarLabel icon="wave-sine" iconColor={C.sky} text={soundLabel} />,
          value: 0.2, color: C.sky, at: 30, thickness: 74,
        },
      ]}
    />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
  </Sky>
);

/* ---------------- S6: 빛은 순식간에, 소리는 한참 늦게 도착 ---------------- */

export const S6_LIGHT_ARRIVE_RATIO = 0.18;
export const S6_SOUND_ARRIVE_END_OFFSET = 10;

export const S6Arrival: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const lightRampEnd = Math.max(10, Math.round(frames * S6_LIGHT_ARRIVE_RATIO));
  const soundRampEnd = Math.max(lightRampEnd + 24, frames - S6_SOUND_ARRIVE_END_OFFSET);

  const lightProgress = progress(f, 4, lightRampEnd);
  const soundProgress = progress(f, 4, soundRampEnd);
  const lightArrivedPulse = bump(f, lightRampEnd, 16);
  const soundArrivedPulse = bump(f, soundRampEnd, 20);

  return (
    <Sky horizon={null}>
      <LightningThunderDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        lightProgress={lightProgress} soundProgress={soundProgress}
        lightArrivedPulse={lightArrivedPulse} soundArrivedPulse={soundArrivedPulse}
        stroke={C.cream} lightColor={C.gold} soundColor={C.sky}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S7: 초를 세며 폭풍 거리 가늠 ---------------- */

const S7_ACTOR_SIZE = 820;
const S7_ACTOR_GROUND = 1560;
const COUNT_POSE: Pose = { ...POSES.count, headTilt: -8 };

export const S7Count: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; distanceLabel: string;
}> = ({ f, frames, lines, distanceLabel }) => {
  const poseT = progress(f, 4, 20);
  const pose: Pose = blendPose(POSES.idle, COUNT_POSE, poseT);
  const steps = [
    Math.round(frames * 0.2), Math.round(frames * 0.42), Math.round(frames * 0.64),
  ];
  const lastStep = steps[steps.length - 1];
  const labelP = clamp01((f - lastStep - 4) / 14);

  return (
    <Sky horizon={1620}>
      <div style={{ position: 'absolute', left: W - 260, top: 220, opacity: 0.55 }}>
        <ThemedIcon name="cloud" size={150} color={C.nightSoft} strokePx={13} />
      </div>
      <Actor size={S7_ACTOR_SIZE} centerX={CX - 90} ground={S7_ACTOR_GROUND} pose={pose} style={NIGHT_GLOW_STYLE} />
      <StepCounter
        x={CX + 210} y={S7_ACTOR_GROUND - 620} steps={steps} frame={f} size={130} color={C.cream}
        width={260} align="center" style={{ whiteSpace: 'nowrap' }}
      />
      {labelP > 0.01 ? (
        // 캐릭터 얼굴(head top ~ ground-560)과 겹치지 않도록 머리 위 트인 하늘 공간에 띄운다
        // (원칙 5 예방 체크리스트 - 라벨이 도형과 겹치면 안 됨. 첫 배치는 몸 중앙과 겹쳐서
        // 렌더 후 프레임 확인으로 발견해 이 위치로 수정했다).
        <PopIn cx={CX} cy={S7_ACTOR_GROUND - 880} size={520} height={140} progress={labelP}>
          <div
            style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: C.ink, border: `7px solid ${C.cream}`, borderRadius: 999,
            }}
          >
            <Label x={260} y={44} text={distanceLabel} size={FS.label} color={C.cream} align="center" wrapWidth={480} />
          </div>
        </PopIn>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};
