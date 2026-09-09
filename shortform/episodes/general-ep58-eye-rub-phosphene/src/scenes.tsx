/** 이 화(general-ep58, "눈 비비면 별처럼 보이는 이유") 전용 장면.
 *
 *  s1(피곤해서 눈을 비비다 손을 떼자 반짝임이 잠깐 보이는 모습, 무성) -> s2(리액션+훅 질문,
 *  바스트샷) -> s3(빛이 들어와 망막에 닿고 신호선이 뻗는 모습, RetinaPressureDiagram
 *  lightHitProgress) -> s4(빛 없이 손가락 압력만으로도 같은 신호가 뜨는 모습,
 *  RetinaPressureDiagram pressureHitProgress) -> s5(신호가 뇌에 도착해 "빛"으로 해석되는
 *  순간, NerveSignal + 뇌 아이콘) -> s6(캐릭터 시야에 별 무늬가 떠오르는 모습) ->
 *  s7(진짜 빛이 아니라는 X 표시 + 세게 누르면 위험하다는 경고 아이콘).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 눈을 세게 비비라고 부추기는 연출 금지(대본에
 *  없는 지시형 문구를 화면에 넣지 않음), 어두운 화면에 빛 점이 나타나는 대비가 중심,
 *  빛 점은 크고 또렷하게 몇 개만(작은 점 잔뜩 뿌리지 않음), 망막·시신경은 사실적 해부도로
 *  그리지 않고 단순 도형+신호선으로, 압력은 굵은 화살표나 눌리는 형태 변화로, 캐릭터의
 *  눈 비비는 동작은 과장하지 않음(기존 touchForehead 포즈 재사용, 새 리깅 없음).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, Label, NerveSignal, PlainBg, POSES,
  RetinaPressureDiagram, RETINA_EXIT_PT, RETINA_HIT_PT, RETINA_PRESSURE_VB_W,
  SpeechBubble, ThemedIcon, W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * 공용: 포스핀(반짝이는 별 무늬) - 어두운 배경 위에 크고 또렷한 별 몇 개만.
 * 씬 로컬(등장 위치·개수가 이 화 전용이라 라이브러리 미등록, ScarAccent와 같은 원칙).
 * inline=true 면 SpeechBubble children처럼 이미 위치가 잡힌 컨테이너 안에 그대로 채운다.
 * ============================================================ */

const PHOSPHENE_STARS = [
  { fx: 0.34, fy: 0.32, size: 1.15, phase: 0.0 },
  { fx: 0.66, fy: 0.22, size: 0.82, phase: 0.12 },
  { fx: 0.48, fy: 0.62, size: 1.0, phase: 0.24 },
];

function PhospheneStars({
  box, t: pt, color = C.gold, color2 = C.coral, inline = false,
}: {
  box: { x: number; y: number; w: number; h: number };
  t: number;
  color?: string;
  color2?: string;
  inline?: boolean;
}) {
  return (
    <svg
      width={box.w} height={box.h}
      style={inline
        ? { overflow: 'visible' }
        : { position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}
    >
      {PHOSPHENE_STARS.map((s, i) => {
        const popT = clamp01((pt - s.phase) / 0.22);
        const fadeT = clamp01((pt - 0.86) / 0.14);
        const scale = smooth(popT) * (1 - fadeT);
        if (scale <= 0.02) return null;
        const r = 44 * s.size;
        return (
          <g key={i} transform={`translate(${s.fx * box.w} ${s.fy * box.h}) scale(${scale})`}>
            <path
              d={`M 0 ${-r} Q ${r * 0.3} ${-r * 0.3} ${r} 0 Q ${r * 0.3} ${r * 0.3} 0 ${r} Q ${-r * 0.3} ${r * 0.3} ${-r} 0 Q ${-r * 0.3} ${-r * 0.3} 0 ${-r} Z`}
              fill={i % 2 === 0 ? color : color2}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ============================================================
 * S1: 피곤해서 눈을 비비다, 손을 떼자 반짝임이 잠깐 보인다 (무성)
 * ============================================================ */

const S1_BUST_SIZE = 940;
const S1_BUST_LEFT = (W - S1_BUST_SIZE) / 2;
const S1_BUST_TOP = 460;
const S1_STAR_BOX = { x: S1_BUST_LEFT + 150, y: S1_BUST_TOP + 40, w: S1_BUST_SIZE - 300, h: 420 };

export const S1Rub: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  // 손이 눈으로 다가가 머문다(0~0.55) -> 손을 뗀다(0.55~0.85)
  const approachT = smooth(progress(f, 0, frames * 0.35));
  const retreatT = smooth(progress(f, frames * 0.55, frames * 0.85));
  const handT = approachT * (1 - retreatT);
  const pose: Pose = blendPose(POSES.idle, POSES.touchForehead, handT);
  const starsT = progress(f, frames * 0.6, frames);

  return (
    <PlainBg>
      <BustActor size={S1_BUST_SIZE} left={S1_BUST_LEFT} top={S1_BUST_TOP} pose={pose} />
      <PhospheneStars box={S1_STAR_BOX} t={starsT} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 리액션 + 훅 질문 (바스트샷, "어? 방금 눈에서 뭔가 반짝였는데?")
 * ============================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const surpriseT = smooth(progress(f, 0, 14));
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, surpriseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 공용: RetinaPressureDiagram 고정 배치(s3~s4)
 * ============================================================ */

const DIAG_WIDTH = 560;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 680;

/* ============================================================
 * S3: 빛이 들어와 망막에 닿고, 전기 신호로 바뀐다
 * ============================================================ */

export const S3Light: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const lightHitProgress = progress(f, frames * 0.12, frames * 0.85);
  const labelA = progress(f, frames * 0.55, frames * 0.75);
  return (
    <PlainBg>
      <RetinaPressureDiagram f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} lightHitProgress={lightHitProgress} />
      <Label x={CX} y={DIAG_Y - 80} text={t.s3Label} size={52} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 빛 없이, 눌리는 압력만으로도 똑같이 신호가 만들어진다
 * ============================================================ */

export const S4Pressure: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const pressureHitProgress = progress(f, frames * 0.1, frames * 0.9);
  return (
    <PlainBg>
      <RetinaPressureDiagram f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} pressureHitProgress={pressureHitProgress} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 신호가 뇌에 도착해 "빛"으로 해석된다
 * ============================================================ */

const S5_DIAG_WIDTH = 340;
const S5_DIAG_X = CX - S5_DIAG_WIDTH / 2;
const S5_DIAG_Y = 1120;
const S5_DIAG_SCALE = S5_DIAG_WIDTH / RETINA_PRESSURE_VB_W;
const S5_BRAIN_PT = { x: CX, y: 420 };

export const S5Brain: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const brainA = progress(f, 0, 12);
  const showPathT = progress(f, frames * 0.05, frames * 0.45);
  const signalT = progress(f, frames * 0.35, frames * 0.85);
  const labelA = progress(f, frames * 0.75, frames * 0.95);
  const exitPt = {
    x: S5_DIAG_X + RETINA_EXIT_PT.x * S5_DIAG_SCALE,
    y: S5_DIAG_Y + RETINA_EXIT_PT.y * S5_DIAG_SCALE,
  };
  return (
    <PlainBg>
      <div style={{ position: 'absolute', left: S5_BRAIN_PT.x - 90, top: S5_BRAIN_PT.y - 90, opacity: brainA }}>
        <ThemedIcon name="brain" size={180} color={C.ink} />
      </div>
      {showPathT > 0.01 ? (
        <NerveSignal
          from={exitPt} to={S5_BRAIN_PT} bow={-90} showPath={showPathT}
          signalT={signalT < 0.01 ? undefined : signalT}
          strokeWidth={8} dotRadius={14}
        />
      ) : null}
      <RetinaPressureDiagram
        width={S5_DIAG_WIDTH} x={S5_DIAG_X} y={S5_DIAG_Y} lightHitProgress={1}
      />
      <Label x={S5_BRAIN_PT.x} y={S5_BRAIN_PT.y + 110} text={t.s5BrainLabel} size={52} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 캐릭터 시야에 별·반짝이는 무늬(포스핀)가 나타난다
 * ============================================================ */

const S6_ACTOR_SIZE = 620;
const S6_ACTOR_CENTER_X = 250;
const S6_BUBBLE_X = CX + 60;
const S6_BUBBLE_Y = 760;
const S6_BUBBLE_R = 320;
const S6_STAR_BOX_SIZE = 460;

export const S6Sparkle: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const bubbleA = smooth(progress(f, 0, 16));
  const starsT = progress(f, frames * 0.18, frames * 0.92);
  return (
    <PlainBg>
      <Actor size={S6_ACTOR_SIZE} centerX={S6_ACTOR_CENTER_X} pose={POSES.idle} />
      <SpeechBubble
        x={S6_BUBBLE_X} y={S6_BUBBLE_Y} r={S6_BUBBLE_R} shape="round" tail="bottomLeft"
        progress={bubbleA} bg={C.night} border={C.ink}
      >
        <PhospheneStars
          box={{ x: 0, y: 0, w: S6_STAR_BOX_SIZE, h: S6_STAR_BOX_SIZE }} t={starsT} inline
        />
      </SpeechBubble>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 진짜 빛이 아니다(X 표시) + 세게 누르면 위험하다(경고 아이콘)
 * ============================================================ */

const S7_BULB_PT = { x: CX - 150, y: 760 };
const S7_HAND_PT = { x: CX + 150, y: 760 };

export const S7Warning: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const bulbA = progress(f, 0, 14);
  const xA = progress(f, frames * 0.15, frames * 0.35);
  const labelA = progress(f, frames * 0.3, frames * 0.5);
  const handA = progress(f, frames * 0.42, frames * 0.6);
  const warnA = progress(f, frames * 0.58, frames * 0.78);
  return (
    <PlainBg>
      <div style={{ position: 'absolute', left: S7_BULB_PT.x - 90, top: S7_BULB_PT.y - 90, opacity: bulbA }}>
        <ThemedIcon name="bulb" size={180} color={C.gold} />
      </div>
      <div style={{ position: 'absolute', left: S7_BULB_PT.x - 90, top: S7_BULB_PT.y - 90, opacity: xA }}>
        <ThemedIcon name="x" size={180} color={C.coral} />
      </div>
      <Label
        x={S7_BULB_PT.x} y={S7_BULB_PT.y + 110} text={t.s7Label} size={42}
        wrapWidth={320} style={{ opacity: labelA }}
      />
      <div style={{ position: 'absolute', left: S7_HAND_PT.x - 90, top: S7_HAND_PT.y - 90, opacity: handA }}>
        <ThemedIcon name="hand-finger" size={180} color={C.ink} />
      </div>
      <div style={{ position: 'absolute', left: S7_HAND_PT.x + 70, top: S7_HAND_PT.y - 160, opacity: warnA }}>
        <ThemedIcon name="alert-triangle" size={110} color={C.coral} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
