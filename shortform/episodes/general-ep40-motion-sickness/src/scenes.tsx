/** 이 화(general-ep40, "차만 타면 속이 울렁거리는 이유") 전용 장면.
 *
 *  s1(무성 - 달리는 차 안, 정지된 느낌 vs 빠르게 스치는 창밖) -> s2(속이 울렁거리는 리액션,
 *  바스트샷 유성 - 립싱크 연결) -> s3(눈=정지, 귀=움직임 두 신호, SensoryConflictDiagram
 *  conflictProgress 0~0.55) -> s4(두 신호가 뇌에서 충돌, conflictProgress 0.55~1로 이어받음)
 *  -> s5(뇌 위 물음표가 경고 아이콘으로 바뀜) -> s6(전신 멀미 리액션) -> s7(창밖을 보면 신호가
 *  다시 일치, resolveProgress 0~1) -> s8(화면을 오래 보는 것도 같은 원리).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 귀 속 균형 기관을 사실적인 해부도로 그리지
 *  않는다(SensoryConflictDiagram은 실제 캐릭터 얼굴 위에 배지+선만 얹는 방식이라 해부학적
 *  묘사가 없다). 속이 울렁거리는 것을 불쾌하게 그리지 않고 표정+가벼운 흔들림으로만
 *  표현한다. 신호는 굵은 선 몇 가닥(SensoryConflictDiagram의 신호선 2개)으로만 표현하고
 *  점 무리를 쓰지 않는다.
 */
import React from 'react';
import {
  Actor, BRAIN_PT, BustActor, C, Caption, CarWindowView, EAR_BADGE_PT, EYE_BADGE_PT, FPS,
  Label, PlainBg, RIG, SENSORY_VB_W, SensoryConflictDiagram, Shake, ThemedIcon, W,
  blendPose, handPos, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

function lerpColorLocal(a: string, b: string, tt: number) {
  const c = Math.max(0, Math.min(1, tt));
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * c));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* SensoryConflictDiagram 공용 배치(s3/s4/s7이 같은 자리를 써서 장면 전환에도 위치가 안
 * 튄다) */
const DIAG_W = 620;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 440;
const SENSORY_SCALE = DIAG_W / SENSORY_VB_W;
/** s3가 끝나는 시점의 conflictProgress 값. s4는 여기서 이어받아 1까지 진행한다(원칙 -
 *  다음 장면에서 이전 상태를 명시적으로 유지) */
const CONFLICT_S3_END = 0.55;

function sensoryScreenPt(pt: { x: number; y: number }) {
  return { x: DIAG_X + pt.x * SENSORY_SCALE, y: DIAG_Y + pt.y * SENSORY_SCALE };
}

/* ================================================================
 * S1: 무성 - 달리는 차 안. 캐릭터는 휴대폰을 보며 가만히 있고, 창밖만 빠르게 흐른다
 * ================================================================ */

const S1_ACTOR_SIZE = 620;
const S1_ACTOR_CX = 300;
const S1_GROUND = 1520;
const S1_WINDOW_X = 560;
const S1_WINDOW_Y = 460;
const S1_WINDOW_W = 440;
const S1_WINDOW_H = 620;

const PHONE_POSE: Pose = {
  headTilt: 14, lean: 3,
  armL: { s: 50, e: 62 }, armR: { s: -46, e: -60 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
  eyeOpen: 0.82,
};

export const S1CarRide: React.FC<{ f: number }> = ({ f }) => {
  const settleT = smooth(progress(f, 0, 18));
  const pose = blendPose({}, PHONE_POSE, settleT);

  const top = S1_GROUND - (1026 * S1_ACTOR_SIZE) / RIG.H;
  const left = S1_ACTOR_CX - (RIG.CX * S1_ACTOR_SIZE) / RIG.W;
  const handScale = S1_ACTOR_SIZE / RIG.W;
  const hand = handPos('R', pose.armR!);
  const phoneX = left + hand.x * handScale;
  const phoneY = top + hand.y * handScale;

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={S1_GROUND + 60} groundColor={C.roomDeep}>
      <CarWindowView
        f={f} width={S1_WINDOW_W} height={S1_WINDOW_H} x={S1_WINDOW_X} y={S1_WINDOW_Y}
        speed={16}
      />
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CX} ground={S1_GROUND} pose={pose} />
      <div
        style={{
          position: 'absolute', left: phoneX - 32, top: phoneY - 50, width: 64, height: 100,
          borderRadius: 14, background: C.ink,
        }}
      >
        <div
          style={{
            position: 'absolute', left: 6, top: 10, right: 6, bottom: 10,
            background: C.seaTop, borderRadius: 6,
          }}
        />
      </div>
    </PlainBg>
  );
};

/* ================================================================
 * S2: 속이 울렁거리는 리액션 (바스트샷, 립싱크 연결)
 * ================================================================ */

const S2_SIZE = 900;
const S2_LEFT = CX - S2_SIZE / 2;
const S2_TOP = 420;

const QUEASY_BUST_POSE: Pose = {
  headTilt: -5, lean: 2,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -60, e: -78 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
  eyeOpen: 0.62, blush: 0.5,
};

export const S2Queasy: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const reactT = smooth(progress(f, 0, frames * 0.4));
  const sway = Math.sin(f / 10) * 2.4 * reactT;
  const base = blendPose({}, QUEASY_BUST_POSE, reactT);
  const pose: Pose = { ...base, headTilt: (base.headTilt ?? 0) + sway };
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg>
      <BustActor size={S2_SIZE} left={S2_LEFT} top={S2_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 눈=정지, 귀=움직임 두 신호가 동시에 표시된다
 * ================================================================ */

export const S3EyeEar: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const cP = smooth(progress(f, frames * 0.08, frames * 0.92)) * CONFLICT_S3_END;
  const eyeLabelA = progress(f, frames * 0.18, frames * 0.4);
  const earLabelA = progress(f, frames * 0.24, frames * 0.46);
  const eyePt = sensoryScreenPt(EYE_BADGE_PT);
  const earPt = sensoryScreenPt(EAR_BADGE_PT);

  return (
    <PlainBg>
      <SensoryConflictDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} conflictProgress={cP} />
      <Label
        x={eyePt.x - 16} y={eyePt.y - 150} text={t.s3EyeLabel} align="right" size={40}
        style={{ opacity: eyeLabelA }}
      />
      <Label
        x={earPt.x + 16} y={earPt.y - 160} text={t.s3EarLabel} align="left" size={40}
        style={{ opacity: earLabelA }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 두 신호가 뇌 쪽으로 향하다 충돌해 스파크가 튄다
 * ================================================================ */

/** s4 구간 길이(frames) 대비 스파크가 최고조에 이르는 지점(비율). Episode.tsx의
 *  bubble_pop SFX Sequence와 같은 비율을 써서 소리와 화면 스파크를 맞춘다. */
export const S4_SPARK_SFX_AT = 0.6;

export const S4Collision: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const raise = smooth(progress(f, frames * 0.05, frames * 0.65));
  const cP = CONFLICT_S3_END + raise * (1 - CONFLICT_S3_END);

  return (
    <PlainBg>
      <SensoryConflictDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} conflictProgress={cP} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 뇌 위 물음표가 경고(느낌표) 아이콘으로 바뀐다
 * ================================================================ */

const S5_CX = CX;
const S5_CY = 900;
const S5_BRAIN_R = 190;
const S5_BADGE_SIZE = 116;

export const S5BrainConfused: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const appearT = smooth(progress(f, 0, frames * 0.3));
  const switchT = smooth(progress(f, frames * 0.42, frames * 0.8));
  const brainScale = 0.55 + 0.45 * appearT;
  const glowColor = lerpColorLocal(C.goldSoft, C.coralSoft, switchT);
  const badgeRing = lerpColorLocal(C.gold, C.coral, switchT);

  return (
    <PlainBg>
      <div
        style={{
          position: 'absolute', left: S5_CX - S5_BRAIN_R, top: S5_CY - S5_BRAIN_R,
          width: S5_BRAIN_R * 2, height: S5_BRAIN_R * 2, opacity: appearT,
          transform: `scale(${brainScale})`, transformOrigin: '50% 50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: glowColor }} />
        {/* position:'relative' 필수 - 안 주면 static 배치라 앞의 position:absolute 글로우
            div 가 DOM 순서와 무관하게 항상 위에 페인트되어 아이콘을 완전히 가린다(실측
            확인된 결함: CSS는 static 요소보다 positioned 요소를 항상 나중에 그린다) */}
        <ThemedIcon
          name="brain" size={S5_BRAIN_R * 1.1} color={C.ink} strokePx={11}
          style={{ position: 'relative' }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: S5_CX + S5_BRAIN_R * 0.32, top: S5_CY - S5_BRAIN_R * 1.02,
          width: S5_BADGE_SIZE, height: S5_BADGE_SIZE, opacity: appearT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: C.paper,
            border: `9px solid ${badgeRing}`,
          }}
        />
        <div style={{ position: 'absolute', opacity: 1 - switchT }}>
          <ThemedIcon name="question-mark" size={64} color={C.ink} strokePx={10} />
        </div>
        <div style={{ position: 'absolute', opacity: switchT }}>
          <ThemedIcon name="alert-triangle" size={64} color={C.coral} strokePx={10} />
        </div>
      </div>

      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 전신 멀미 리액션
 * ================================================================ */

const S6_SIZE = 900;
const S6_GROUND = 1460;

const QUEASY_FULL_POSE: Pose = {
  headTilt: -8, lean: 5,
  armL: { s: 42, e: 78 }, armR: { s: -66, e: -92 },
  legL: { h: 6, k: 0 }, legR: { h: -4, k: 0 },
  eyeOpen: 0.55, blush: 0.55, mouthOpen: 0.22,
};

export const S6FullQueasy: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const reactT = smooth(progress(f, 0, frames * 0.35));
  const wobble = Math.sin(f / 11) * 3 * reactT;
  const base = blendPose({}, QUEASY_FULL_POSE, reactT);
  const pose: Pose = { ...base, lean: (base.lean ?? 0) + wobble };

  return (
    <PlainBg ground={S6_GROUND + 60} groundColor={C.hill}>
      <Actor size={S6_SIZE} centerX={CX} ground={S6_GROUND} pose={pose} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 창밖을 보면 신호가 다시 일치(체크 표시), 표정이 나아진다
 * ================================================================ */

export const S7Resolve: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const rP = smooth(progress(f, frames * 0.12, frames * 0.88));
  const matchLabelA = progress(f, frames * 0.55, frames * 0.78);
  const brainPt = sensoryScreenPt(BRAIN_PT);

  return (
    <PlainBg>
      <SensoryConflictDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        conflictProgress={1} resolveProgress={rP} moodT={rP}
      />
      <Label
        x={brainPt.x} y={brainPt.y - 112} text={t.s7MatchLabel} size={42}
        style={{ opacity: matchLabelA }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S8: 화면(휴대폰)을 오래 보는 것도 같은 원리
 * ================================================================ */

const S8_BUST_SIZE = 620;
const S8_BUST_LEFT = 60;
const S8_BUST_TOP = 600;
const S8_SCREEN_CX = 850;
const S8_SCREEN_CY = 850;
const S8_SCREEN_SIZE = 260;

const TIRED_POSE: Pose = { eyeOpen: 0.55, mouthOpen: 0.12 };

export const S8Screen: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const appearT = smooth(progress(f, 0, frames * 0.3));
  const pose = blendPose({}, TIRED_POSE, appearT);

  return (
    <PlainBg>
      <Shake frame={f} at={frames * 0.62} duration={16} amp={4} freq={3.4}>
        <BustActor size={S8_BUST_SIZE} left={S8_BUST_LEFT} top={S8_BUST_TOP} pose={pose} />
      </Shake>
      <div
        style={{
          position: 'absolute', left: S8_SCREEN_CX - S8_SCREEN_SIZE / 2,
          top: S8_SCREEN_CY - S8_SCREEN_SIZE / 2, width: S8_SCREEN_SIZE, height: S8_SCREEN_SIZE,
          opacity: appearT, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 36, background: C.seaTop,
            border: `10px solid ${C.ink}`,
          }}
        />
        {/* position:'relative' 필수 - S5BrainConfused와 같은 이유(static 요소는 앞의
            position:absolute 배경보다 항상 먼저 그려져 가려진다) */}
        <ThemedIcon
          name="device-mobile" size={140} color={C.ink} strokePx={11}
          style={{ position: 'relative' }}
        />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
