/** 이 화(general-ep33, "강물은 안 짠데 바닷물만 짠 이유") 전용 장면.
 *
 *  s1(무성, 바닷가에 쪼그려 앉아 손으로 물을 떠서 맛봄) -> s2(리액션+훅 질문, 짠맛에
 *  인상 쓰며 자문) -> s3(비가 바위를 조금씩 녹임) -> s4(바위 속 소금기가 물에 녹아 나옴)
 *  -> s5(강물이 소금기를 바다로 실어 나름) -> s6(바닷물은 증발해 비가 되지만 소금은
 *  남음) -> s7(그렇게 수십억 년 쌓여 바다가 짜짐, CountUp) -> s8(사해는 같은 원리로
 *  훨씬 더 짬, 장식 컷).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CountUp, FPS, OceanBg, PlainBg, POSES, SaltCycleDiagram, SW_THIN,
  W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- 공용: 바닷가 배경(s1, s2) ---------------- */
const SHORE_BG = {
  surface: 760, bubbles: 8, seed: 5,
};

/* ---------------- S1: 손으로 바닷물을 떠서 맛본다 (무성) ---------------- */

const CROUCH_DIP: Pose = { ...POSES.crouch, armR: { s: -66, e: -8 } };
const CROUCH_SIP: Pose = { ...POSES.crouch, armR: { s: -104, e: -76 } };

const S1_ACTOR_SIZE = 1400;

export const S1Taste: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  // 쪼그려 앉으며 손을 물 쪽으로(0~16), 그 자리에서 물을 뜬 뒤 손을 입으로(30~46)
  const entryT = progress(f, 0, 16);
  const sipT = progress(f, 30, 46);
  const settled: Pose = blendPose(POSES.idle, CROUCH_DIP, entryT);
  const pose = blendPose(settled, CROUCH_SIP, sipT);

  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      <OceanBg {...SHORE_BG} frame={f} />
      <Actor size={S1_ACTOR_SIZE} centerX={CX} pose={pose} />
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷, 짠맛에 인상 씀) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.touchForehead, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      <OceanBg {...SHORE_BG} frame={f} />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- 공용: 소금 순환 다이어그램 배치(s3~s7 고정 카메라) ---------------- */

const DIAG_WIDTH = 660;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 190;

/* ---------------- S3: 비가 바위를 조금씩 녹인다 ---------------- */

export const S3Dissolve: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const dissolveProgress = progress(f, frames * 0.06, frames * 0.9);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SaltCycleDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} dissolveProgress={dissolveProgress} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 소금기가 물에 녹아 나온다 ---------------- */

export const S4Release: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const releaseProgress = progress(f, frames * 0.1, frames * 0.85);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SaltCycleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolveProgress={1} releaseProgress={releaseProgress}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 강물이 소금기를 바다로 실어 나른다 ---------------- */

export const S5River: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const riverFlowProgress = progress(f, frames * 0.08, frames * 0.92);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SaltCycleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolveProgress={1} releaseProgress={1} riverFlowProgress={riverFlowProgress}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 물만 증발하고 소금은 남는다 ---------------- */

export const S6Evap: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const evapProgress = progress(f, frames * 0.08, frames * 0.85);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SaltCycleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolveProgress={1} releaseProgress={1} riverFlowProgress={1} evapProgress={evapProgress}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 수십억 년 쌓여서 바다가 짜졌다 (CountUp) ---------------- */

const S7_COUNT_Y = 140;

export const S7Accumulate: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; prefix: string; suffix: string;
}> = ({
  f, frames, lines, prefix, suffix,
}) => {
  const accumProgress = progress(f, frames * 0.06, frames * 0.85);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SaltCycleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolveProgress={1} releaseProgress={1} riverFlowProgress={1} evapProgress={1}
        accumProgress={accumProgress}
      />
      <CountUp
        x={CX} y={S7_COUNT_Y} to={40} at={Math.round(frames * 0.06)} duration={Math.round(frames * 0.5)}
        frame={f} size={104} color={C.ink} width={560} align="center" prefix={prefix} suffix={suffix}
        style={{ whiteSpace: 'nowrap' }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 사해는 같은 원리로 훨씬 더 짜다 (장식 컷) ---------------- */

function saltCrystal(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy - r} L ${cx + r * 0.86} ${cy - r * 0.18} L ${cx + r * 0.5} ${cy + r * 0.86}
          L ${cx - r * 0.5} ${cy + r * 0.86} L ${cx - r * 0.86} ${cy - r * 0.18} Z`;
}

const DEAD_SEA_CRYSTALS = [
  { x: 380, y: 1180, r: 74 },
  { x: 620, y: 1240, r: 60 },
  { x: 500, y: 1340, r: 50 },
];

export const S8DeadSea: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const revealP = progress(f, 0, frames * 0.4);
  return (
    <PlainBg top={C.sky} bottom={C.hillFar} ground={null}>
      <OceanBg
        surface={560} seabed={null} bubbles={4} seed={9} frame={f}
        waterTop={C.seaDeep} waterDeep={C.hill} skyColor={C.sky}
      />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: 'absolute', left: 0, top: 0 }}>
        {DEAD_SEA_CRYSTALS.map((c, i) => {
          const a = progress(f, i * 8, i * 8 + 24) * revealP;
          const bob = Math.sin((f + i * 30) / 26) * 6;
          return (
            <path
              key={i} d={saltCrystal(c.x, c.y + bob, c.r)} fill={C.paper} stroke={C.ink}
              strokeWidth={SW_THIN} strokeLinejoin="round" opacity={0.3 + 0.7 * a}
            />
          );
        })}
      </svg>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
