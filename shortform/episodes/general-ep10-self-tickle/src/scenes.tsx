/** 이 화(general-ep10, "내가 나를 못 간지럽히는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher가 넘기는 구간 로컬 프레임 f를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props로만 받는다).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, C, Card, Caption, FPS, FS, Label, PlainBg, POSES, Sparkles, ThemedIcon,
  TouchPredictionDiagram, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------- 전신 캐릭터 공용 레이아웃 (S1·S2·S6·S8) ---------------- */

const ACTOR_SIZE = 1500;
const ACTOR_GROUND = 1300;

/* ---------------- 공용 배경 래퍼 ---------------- */

/** ground를 넘기면 PlainBg의 바닥선을 그 값에 맞춘다 - 전신 캐릭터 장면(ACTOR_GROUND=1300)은
 *  기본 바닥선(GROUND=1250)과 어긋나 발이 살짝 떠 보이는 걸 막기 위함. */
const Scene: React.FC<{ ground?: number; children?: React.ReactNode }> = ({ ground, children }) => (
  <AbsoluteFill>
    <PlainBg ground={ground} />
    {children}
  </AbsoluteFill>
);

/* 옆구리 접촉 지점(화면 좌표) - 손 아이콘이 다가와 닿는 자리 */
const POKE_TARGET = { x: CX + 190, y: 950 };
const HAND_ICON_SIZE = 190;

/* ---------------- 다이어그램 공용 레이아웃 (S4·S5·S7) ---------------- */

const DIAGRAM_WIDTH = 760;
const DIAGRAM_X = (W - DIAGRAM_WIDTH) / 2;
const DIAGRAM_Y = 380;
const LABEL_Y = 1150;

/* ---------------- S1: 반대팔로 겨드랑이를 간지럽혀 보지만 아무 반응 없음 (무성, 훅 도입) ----------------
 * 사용자 피드백(2026-08-20): 기존엔 외부 손 아이콘이 옆구리를 콕 찌르고 바로 웃는 리액션으로
 * 끝나 "간지럽히는 동작"이 8프레임(약 0.27초)짜리 접촉 한 번뿐이라 너무 약하고 짧았다. 이제는
 * 캐릭터가 반대쪽 팔을 뻗어 스스로 겨드랑이 부근을 간지럽히는 시도를 최소 1초 이상(아래
 * S1_TICKLE_START_FRAME~S1_WIGGLE_END_FRAME = 80프레임 = 2.67초) 반복 동작으로 보여준 뒤,
 * s2의 "어, 하나도 안 간지럽네. 왜 그런 거지?" 리액션으로 이어진다.
 */

/** 팔이 겨드랑이 부근에 도달하는 프레임(로컬). Episode.tsx가 이 프레임에 ui_tap SFX를 맞춘다. */
export const S1_TICKLE_START_FRAME = 10;
/** 반복 간지럼 시도가 끝나는 프레임 - 10~90 = 80프레임(2.67초) 동안 진동이 이어져
 *  "1초 이상 반복 움직임" 요구를 크게 상회한다. */
const S1_WIGGLE_END_FRAME = 90;
/** 이 씬의 총 길이(로컬 프레임). 무성 구간이라 TTS와 무관하게 조정 가능(원칙 4) -
 *  Episode.tsx의 SILENT_DURATION_S1(3.4초)과 반드시 같은 값(3.4*30=102)으로 맞춘다. */
export const S1_TOTAL_FRAMES = 102;

/** 왼팔을 몸통 오른쪽 겨드랑이 부근(캐릭터 로컬 viewBox 좌표 x=700,y=750)까지 뻗는 각도.
 *  character/Character.tsx의 armIK(shoulderL(), {x:700,y:750})로 역산했다 - 어깨(560,647)에서
 *  173.8만큼 뻗으면 닿는다(최대 리치 117+76.6=193.6 이내, 스트레치 불필요). 팔꿈치·손 위치 모두
 *  머리 윤곽 반지름보다 120 이상 더 멀리 떨어져 있어(렌더 전 별도 스크립트로 좌표 실측 확인)
 *  얼굴과 겹치지 않는다. 이 화 로컬 전용 각도라 공용 character/poses.ts에는 추가하지 않았다
 *  (병렬 작업 중인 다른 화에 영향 없음). */
const TICKLE_ARM_L = { s: -32.9, e: -53.54 };
/** 오른팔을 들어 올려 오른쪽 겨드랑이 쪽을 "연다". |s|=116(POSES 권장 105~120 범위)까지
 *  올려보면 팔꿈치가 머리 윤곽 안쪽으로 파고들어(실측 마진 -0.5, 렌더 프레임에서 확인)
 *  100으로 낮춰 마진 29를 확보했다. */
const TICKLE_ARM_R = { s: -100, e: -22 };

const TICKLE_POSE: Pose = {
  headTilt: -4, lean: 0,
  armL: TICKLE_ARM_L, armR: TICKLE_ARM_R,
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
  mouthOpen: 0.32, eyeOpen: 1.12,
};

/** 결정적 진동(원칙 3 - Math.random 금지, frame만의 순수 함수). 팔꿈치·어깨 각도를 빠르게
 *  흔들어 손가락 없는 스틱피겨가 "꼼지락거리며 간지럽히는" 동작을 표현하고, lean(몸통 기울임)을
 *  살짝 흔들어 반응을 기다리는 몸통 squirm을 더한다. */
function wiggle(f: number, amp: number, freq: number, phase = 0) {
  return Math.sin(f * freq + phase) * amp;
}

export const S1Tickle: React.FC<{ f: number }> = ({ f }) => {
  const riseT = progress(f, 0, S1_TICKLE_START_FRAME);
  const basePose = blendPose(POSES.idle, TICKLE_POSE, riseT);

  // 간지럼 시도 구간(10~90)에서만 진동을 켠다. 앞뒤 8프레임씩 페이드해 뚝 끊기지 않게 한다.
  const wiggleEnvelope =
    progress(f, S1_TICKLE_START_FRAME, S1_TICKLE_START_FRAME + 8) *
    (1 - progress(f, S1_WIGGLE_END_FRAME - 8, S1_WIGGLE_END_FRAME));
  const elbowJitter = wiggle(f, 9, 0.62) * wiggleEnvelope;
  const shoulderJitter = wiggle(f, 3, 0.62, 0.4) * wiggleEnvelope;
  const leanJitter = wiggle(f, 2.4, 0.34, 1.1) * wiggleEnvelope;

  // 마지막 구간(90~102)은 "안 되네" 하고 살짝 가라앉는 표정으로 다음 장면(s2 shrug+훅 질문)에
  // 자연스럽게 이어진다.
  const settleT = progress(f, S1_WIGGLE_END_FRAME, S1_TOTAL_FRAMES);
  const mouthOpen = lerp(basePose.mouthOpen ?? 0.32, 0.18, settleT);
  const eyeOpen = lerp(basePose.eyeOpen ?? 1.12, 0.95, settleT);

  const pose: Pose = {
    ...basePose,
    lean: (basePose.lean ?? 0) + leanJitter,
    armL: {
      s: (basePose.armL?.s ?? TICKLE_ARM_L.s) + shoulderJitter,
      e: (basePose.armL?.e ?? TICKLE_ARM_L.e) + elbowJitter,
    },
    mouthOpen,
    eyeOpen,
  };

  return (
    <Scene ground={ACTOR_GROUND}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} />
    </Scene>
  );
};

/* ---------------- S2: 자기 손으로 찔러봐도 무표정 (리액션+훅 질문) ---------------- */

/** s2 자기 접촉 순간(로컬 프레임). Episode.tsx가 이 프레임에 ui_tap SFX를 맞춘다. */
export const S2_POKE_FRAME = 10;

export const S2SelfPoke: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const poseT = progress(f, 2, 14);
  const pose = blendPose(POSES.idle, POSES.shrug, poseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const handOpacity = progress(f, 2, S2_POKE_FRAME) * (1 - progress(f, S2_POKE_FRAME + 10, S2_POKE_FRAME + 28));

  return (
    <Scene ground={ACTOR_GROUND}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      {handOpacity > 0.01 ? (
        <div style={{ position: 'absolute', left: POKE_TARGET.x - HAND_ICON_SIZE / 2, top: POKE_TARGET.y - HAND_ICON_SIZE / 2, opacity: handOpacity }}>
          <ThemedIcon name="hand-finger" size={HAND_ICON_SIZE} color={C.ink} />
        </div>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S3: 회상 - 고대 그리스 철학자도 궁금해했다는 이야기 ---------------- */

const CARD_W = 580;
const CARD_H = 760;
const CARD_X = (W - CARD_W) / 2;
const CARD_Y = 420;

const CORNER_SIZE = 260;
const CORNER_CENTERX = 150;
const CORNER_GROUND = 1000;

export const S3Aristotle: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
  eraLabel: string; nameLabel: string; storyTag: string;
}> = ({ f, lines, mouth, eraLabel, nameLabel, storyTag }) => {
  const cardP = progress(f, 4, 22);
  const eraOpacity = progress(f, 14, 26);
  // "이야기?" 태그는 잠깐 떴다가 사라진다(원문 지시: 페이드인-아웃, 확정 라벨 아님을 표시)
  const tagOpacity = progress(f, 20, 34) * (1 - progress(f, 110, 130));
  const mouthOpen = mouthProp(mouthAt(mouth, 's3', f));

  return (
    <Scene>
      <Actor size={CORNER_SIZE} centerX={CORNER_CENTERX} ground={CORNER_GROUND} pose={POSES.shrug} mouthOpen={mouthOpen} />
      <div style={{ opacity: eraOpacity }}>
        <Label x={CX} y={CARD_Y - 76} text={eraLabel} size={FS.small} color={C.inkSoft} align="center" />
      </div>
      <Card
        x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} progress={cardP} label={nameLabel}
        bg={C.paper} border={C.ink} labelColor={C.ink}
      >
        <ThemedIcon name="feather" size={220} color={C.gold} />
      </Card>
      <div style={{ opacity: tagOpacity }}>
        <Label x={CX} y={CARD_Y + CARD_H + 44} text={storyTag} size={FS.tiny} color={C.coral} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S4: 예상 못한 손길 -> 큰 반응 ---------------- */

export function s4ContactFrame(frames: number) {
  return Math.round(frames * 0.62);
}

export const S4Unpredictable: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const contactFrame = s4ContactFrame(frames);
  const touchP = progress(f, 6, contactFrame);
  const sparkP = progress(f, contactFrame, contactFrame + 8);
  const labelOpacity = progress(f, 6, 20);

  return (
    <Scene>
      <TouchPredictionDiagram
        mode="unpredictable" width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y}
        touchProgress={touchP} sparkSize={sparkP}
      />
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S5: 뇌가 미리 계산 -> 작은 반응 ---------------- */

export const S5Predicted: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const arrowEnd = Math.round(frames * 0.42);
  const contactFrame = Math.round(frames * 0.66);
  const arrowP = progress(f, 6, arrowEnd);
  const touchP = progress(f, 6, contactFrame);
  const sparkP = 0.32 * progress(f, contactFrame, contactFrame + 8);
  const labelOpacity = progress(f, 6, 20);

  return (
    <Scene>
      <TouchPredictionDiagram
        mode="predicted" width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y}
        touchProgress={touchP} sparkSize={sparkP} predictArrowProgress={arrowP}
      />
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S6: 놀랄 이유가 없다 - 스파크가 닿기 전에 사그라듦 ---------------- */

export const S6Fizzle: React.FC<{ f: number; lines: CaptionLine[]; mouth: Record<string, number[]> }> = (
  { f, lines, mouth }
) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  const fizzleOpacity = 1 - progress(f, 0, 18);
  const fizzleScale = lerp(1.1, 0.3, progress(f, 0, 18));

  return (
    <Scene ground={ACTOR_GROUND}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={POSES.shrug} mouthOpen={mouthOpen} />
      {fizzleOpacity > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: POKE_TARGET.x - 60, top: POKE_TARGET.y - 60,
            opacity: fizzleOpacity, transform: `scale(${fizzleScale})`,
          }}
        >
          <ThemedIcon name="bolt" size={120} color={C.gold} />
        </div>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S7: 로봇 팔 + 시간차 -> 다시 간지럽다 ---------------- */

export function s7ContactFrame(frames: number) {
  return Math.round(frames * 0.72);
}

export const S7RobotDelay: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const approachEnd = Math.round(frames * 0.42);
  const delayEnd = Math.round(frames * 0.58);
  const contactFrame = s7ContactFrame(frames);

  const p1 = progress(f, 6, approachEnd) * 0.55;
  const p2 = progress(f, delayEnd, contactFrame) * 0.45;
  const touchP = Math.min(1, p1 + p2);
  const delayP = progress(f, approachEnd, approachEnd + 8) * (1 - progress(f, delayEnd - 8, delayEnd + 4));
  const sparkP = progress(f, contactFrame, contactFrame + 8);
  const labelOpacity = progress(f, 6, 20);

  return (
    <Scene>
      <TouchPredictionDiagram
        mode="predicted" agent="robot" width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y}
        touchProgress={touchP} sparkSize={sparkP} predictArrowProgress={0} delayProgress={delayP}
      />
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S8: 예측이 어긋나면 간지럼도 돌아온다 (마무리) ---------------- */

export const S8Settle: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's8', f));
  const poseT = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.6));
  const pose = blendPose(POSES.shrug, POSES.idle, poseT * 0.6);
  const sparkT = progress(f, 0, Math.round(frames * 0.6));

  return (
    <Scene ground={ACTOR_GROUND}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      {sparkT > 0.001 ? (
        <Sparkles
          box={{ x: POKE_TARGET.x - 150, y: POKE_TARGET.y - 150, w: 300, h: 300 }}
          t={sparkT} scale={0.5}
        />
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
