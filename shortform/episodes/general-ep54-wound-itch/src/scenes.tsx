/** 이 화(general-ep54, "딱지 앉은 상처가 간지러운 이유") 전용 장면.
 *
 *  s1(무릎에 딱지 앉은 상처 클로즈업, 손이 다가가 긁으려다 멈칫 - 무성) -> s2(리액션+훅 질문,
 *  바스트샷) -> s3(새 살이 차올라 피부가 다시 이어짐, WoundHealDiagram healProgress) ->
 *  s4(히스타민 입자 방출, WoundHealDiagram histamineProgress) -> s5(입자가 신경에 닿아
 *  신경선이 반짝임, WoundHealDiagram nerveGlow + NerveSignal 짧은 연결) -> s6(딱지가 마르며
 *  당겨져 같은 신경을 또 건드림, WoundHealDiagram scabTightenProgress) -> s7(신경 신호가
 *  뇌까지 이동, NerveSignal signalT) -> s8(긁으려던 손을 참는 모습, 흉터 액센트 대비).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 피·상처를 사실적으로 그리지 않는다(가는 선
 *  하나, 핏방울 없음, 딱지는 도형 하나), 새 살은 큰 도형 하나가 아래에서 차오르는 형태로만,
 *  신경 자극은 굵은 선 몇 가닥(점 무리 금지), 히스타민은 점 무리가 아니라 큰 원 3개로,
 *  간지러운 느낌은 표정으로 가볍게, 긁지 말라는 훈계조 문구·아이콘은 넣지 않는다(사실
 *  서술만 시각화).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, Label, NerveSignal, PlainBg, POSES, ThemedIcon, W,
  WoundHealDiagram, WOUND_HEAL_NERVE_PT, WOUND_HEAL_VB_W,
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
 * S1: 무릎에 딱지 앉은 상처 클로즈업, 손이 다가가 긁으려다 멈칫 (무성)
 * ============================================================ */

const S1_WIDTH = 640;
const S1_X = CX - S1_WIDTH / 2;
const S1_Y = 680;
const S1_SCALE = S1_WIDTH / WOUND_HEAL_VB_W;
const S1_CIRCLE_CX = S1_X + 150 * S1_SCALE;
const S1_CIRCLE_CY = S1_Y + 150 * S1_SCALE;

/** 손이 원 밖에서 멀리 대기하는 자리 -> 원 가장자리 바로 바깥까지(닿지 않고 hover) 다가온다 */
const HAND_START = { x: S1_CIRCLE_CX + 430, y: S1_CIRCLE_CY - 360 };
const HAND_TARGET = { x: S1_CIRCLE_CX + 195, y: S1_CIRCLE_CY - 195 };

/** 손(작은 캡슐 하나, 손끝이 아래를 향하게 22도 기울여 "위에서 다가오는" 방향을 읽히게 한다) -
 *  상처 쪽으로 다가갔다가 멈칫하며 살짝 물러난다. ep38 SlidingFingertip과 같은 원칙
 *  (점 무리 아닌 지점 도형 1개, 씬 로컬) */
function ReachingHand({ cx, cy }: { cx: number; cy: number }) {
  return (
    <svg
      width={110} height={170} viewBox="0 0 110 170"
      style={{
        position: 'absolute', left: cx - 55, top: cy - 30, overflow: 'visible',
        transform: 'rotate(22deg)', transformOrigin: '55 30',
      }}
    >
      <rect x={20} y={30} width={70} height={130} rx={35} fill={C.paper} stroke={C.ink} strokeWidth={12} />
      <ellipse cx={55} cy={62} rx={22} ry={26} fill={C.coralSoft} stroke={C.ink} strokeWidth={8} opacity={0.9} />
    </svg>
  );
}

export const S1Wound: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  // 다가감(0~0.5) -> 멈칫하며 살짝 물러남(0.62~0.92)
  const approachT = smooth(progress(f, 0, frames * 0.5));
  const retreatT = smooth(progress(f, frames * 0.62, frames * 0.92));
  const reach = approachT * (1 - 0.35 * retreatT);
  const handX = HAND_START.x + (HAND_TARGET.x - HAND_START.x) * reach;
  const handY = HAND_START.y + (HAND_TARGET.y - HAND_START.y) * reach;

  return (
    <PlainBg>
      <WoundHealDiagram width={S1_WIDTH} x={S1_X} y={S1_Y} healProgress={0.5} />
      <ReachingHand cx={handX} cy={handY} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 리액션 + 훅 질문 (바스트샷, "왜 이렇게 간지럽지?")
 * ============================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const puzzleT = smooth(progress(f, 0, 14));
  const pose: Pose = blendPose(POSES.idle, POSES.touchForehead, puzzleT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 공용: WoundHealDiagram 고정 배치(s3~s6)
 * ============================================================ */

const DIAG_WIDTH = 520;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 640;

/* ============================================================
 * S3: 새 살이 차올라 피부가 다시 이어진다
 * ============================================================ */

export const S3Heal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const healProgress = progress(f, frames * 0.08, frames * 0.9);
  return (
    <PlainBg>
      <WoundHealDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} healProgress={healProgress} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 히스타민이라는 물질을 내보낸다
 * ============================================================ */

export const S4Histamine: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const histamineProgress = progress(f, frames * 0.15, frames * 0.85);
  const labelA = progress(f, frames * 0.3, frames * 0.5);
  return (
    <PlainBg>
      <WoundHealDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} healProgress={1} histamineProgress={histamineProgress}
      />
      <Label x={CX} y={DIAG_Y - 70} text={t.s4Label} size={56} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 그 물질이 피부 속 신경을 자극한다
 * ============================================================ */

export const S5NerveHit: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  // 입자 원점과 신경선이 다이어그램 안에서 이미 바로 붙어 있어(20px 남짓), 별도
  // NerveSignal 곡선을 그리면 점 하나로 뭉개져 보인다(스틸 선점검에서 발견). 대신
  // WoundHealDiagram 자체의 nerveGlow로 "입자가 신경에 닿아 반짝인다"를 표현한다.
  const nerveGlow = progress(f, frames * 0.18, frames * 0.5);
  return (
    <PlainBg>
      <WoundHealDiagram
        f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        healProgress={1} histamineProgress={1} nerveGlow={nerveGlow}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 딱지가 마르며 피부를 당겨 같은 신경을 건드린다
 * ============================================================ */

export const S6Tighten: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const scabTightenProgress = progress(f, frames * 0.1, frames * 0.75);
  return (
    <PlainBg>
      <WoundHealDiagram
        f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        healProgress={1} histamineProgress={1} scabTightenProgress={scabTightenProgress} nerveGlow={1}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 그 자극이 뇌한테는 가려움 신호로 전달된다
 * ============================================================ */

const S7_DIAG_WIDTH = 380;
const S7_DIAG_X = CX - S7_DIAG_WIDTH / 2;
const S7_DIAG_Y = 1080;
const S7_DIAG_SCALE = S7_DIAG_WIDTH / WOUND_HEAL_VB_W;
const S7_BRAIN_PT = { x: CX, y: 400 };

export const S7ToBrain: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const brainA = progress(f, 0, 12);
  const showPathT = progress(f, frames * 0.05, frames * 0.45);
  const signalT = progress(f, frames * 0.35, frames * 0.85);
  const nervePt = {
    x: S7_DIAG_X + WOUND_HEAL_NERVE_PT.x * S7_DIAG_SCALE,
    y: S7_DIAG_Y + WOUND_HEAL_NERVE_PT.y * S7_DIAG_SCALE,
  };
  return (
    <PlainBg>
      <div style={{ position: 'absolute', left: S7_BRAIN_PT.x - 90, top: S7_BRAIN_PT.y - 90, opacity: brainA }}>
        <ThemedIcon name="brain" size={180} color={C.ink} />
      </div>
      {showPathT > 0.01 ? (
        <NerveSignal
          from={nervePt} to={S7_BRAIN_PT} bow={-90} showPath={showPathT}
          signalT={signalT < 0.01 ? undefined : signalT}
          strokeWidth={8} dotRadius={14}
        />
      ) : null}
      <WoundHealDiagram
        f={f} width={S7_DIAG_WIDTH} x={S7_DIAG_X} y={S7_DIAG_Y}
        healProgress={1} histamineProgress={1} scabTightenProgress={1} nerveGlow={1}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 긁으려던 손을 참는다 - 긁으면 흉터가 남기 쉽다
 * ============================================================ */

const S8_ACTOR_SIZE = 1100;
const S8_ACTOR_CENTER_X = 380;
/** 크라우치 포즈는 feetVb가 낮아져 다리가 화면 아래로 더 내려온다. 1560처럼 큰 값을 쓰면
 *  발이 자막 박스와 겹친다(스틸 선점검에서 발견, 42화와 같은 유형의 결함). ep33의 CROUCH
 *  사용 관례(별도 ground 오버라이드 없이 theme 기본값)에 맞춰 낮춘다. */
const S8_ACTOR_GROUND = 1240;

/** 크라우치 + 무릎 쪽으로 손을 뻗는 포즈 (ep33 CROUCH_DIP과 같은 값 - 손이 자연스럽게
 *  무릎 근처에 오는 구도를 그대로 재사용) */
const REACH_KNEE_POSE: Pose = { ...POSES.crouch, armR: { s: -66, e: -8 } };

const SCAR_X = 800;
const SCAR_Y = 700;

/** 흉터 액센트 - 훈계조 문구·경고 아이콘 없이, 딱지 도형과 같은 언어(도형+가는 선)로
 *  "긁으면 이렇게 된다"는 사실만 그린다 (씬 로컬, 일회성 장식이라 라이브러리 미등록) */
function ScarAccent({ a }: { a: number }) {
  return (
    <svg
      width={160} height={160}
      style={{ position: 'absolute', left: SCAR_X - 80, top: SCAR_Y - 80, overflow: 'visible', opacity: a }}
    >
      <circle cx={80} cy={80} r={68} fill={C.paper} stroke={C.ink} strokeWidth={9} />
      <path
        d="M 44 92 Q 64 60 80 84 Q 96 60 116 74"
        fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export const S8Restrain: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const reachT = smooth(progress(f, 0, frames * 0.4));
  const pose: Pose = blendPose(POSES.idle, REACH_KNEE_POSE, reachT);
  const scarA = progress(f, frames * 0.5, frames * 0.75);

  return (
    <PlainBg ground={S8_ACTOR_GROUND + 40} groundColor={C.hill}>
      <Actor size={S8_ACTOR_SIZE} centerX={S8_ACTOR_CENTER_X} ground={S8_ACTOR_GROUND} pose={pose} />
      <ScarAccent a={scarA} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
