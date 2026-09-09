/** 이 화(general-ep87, "손톱이 발톱보다 빨리 자라는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(Actor 전신, 쭈그려 앉아 손톱을 깎다가 발톱을 보며 고개를 갸웃함, 무성) -> s2(BustActor
 *  리액션 "어? 손톱은 자주 깎는데, 발톱은 왜 이렇게 안 자라지?") -> s3(CompareBars - 손톱/발톱
 *  한 달 성장 길이 비교, 수치만 화면에 표시) -> s4(NailRootDiagram - 손톱 뿌리 부위 소개+강조,
 *  혈류·자극 효과는 아직 0) -> s5(같은 NailRootDiagram - 혈류 화살 맥동 + 움직임 잔상이 함께
 *  강조) -> s6(자주 쓰는 손 vs 반대쪽 손 손톱 비교, "그런 얘기도 있음" 배지로 속설임을 명시,
 *  원칙 1-2) -> s7(손가락이 활발히 움직이는 마무리 컷).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 이 화는 원인 설명(사용 빈도 -> 혈류 -> 자극)을 확신도 낮은 정성적 설명으로 다룬다
 *     (01-research.md 주장 2). s4·s5는 "화살+맥동"으로 활발함만 암시할 뿐, 단정적인
 *     인과 화살표나 "이것이 원인이다"류의 확정적 그래픽을 쓰지 않는다.
 *   - s6은 원칙 1-2 속설 가드레일에 따라 "그런 얘기도 있음" 배지를 반드시 표시한다(반박
 *     조사는 하지 않는다 - 01-research.md 주장 3).
 *   - 신체 표현은 최소한으로: 혈관을 사실적으로 그리지 않고 굵은 곡선+펄스로만 혈류를,
 *     손의 움직임/부딪힘은 점 무리 대신 옅은 윤곽선 잔상 2겹으로만 표현한다(NailRootDiagram
 *     내부에 이미 반영됨 - 여기서는 그 소품을 그대로 호출만 한다).
 *
 *  s3~s7은 전부 다이어그램·그래픽 중심 장면이라 HeadNerveDiagram·SmellTasteDiagram 등과 같은
 *  관례로 립싱크를 넣지 않는다(원칙 - 다이어그램이 초점인 장면은 얼굴이 아니라 다이어그램이
 *  주인공). 캐릭터가 실제로 등장해 말하는 s2만 mouthAt/mouthProp을 쓴다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CompareBars, FEET_VB, FPS, FS, FONT, Finger, GROUND, Label,
  NailRootDiagram, NAIL_ROOT_PT, NAIL_ROOT_VB_W, PlainBg, POSES, PulseRing,
  RADIUS, RIG, SW, ThemedIcon, MotionSwoosh, W,
  blendPose, clamp01, handPos, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** 팔 각도로부터 손끝의 화면 좌표를 구한다(Actor 가 발끝 기준으로 배치되는 것과 같은 방식으로
 *  손끝 기준 역산). 소품(손톱깎이 등)을 손 근처에 정확히 붙일 때 쓴다. 좌표를 눈대중으로
 *  지어내지 않기 위한 것(원칙 0-1과 같은 정신 - 캐릭터 리그의 실측 관절 공식을 그대로 쓴다). */
function actorHandPt(pose: Pose, side: 'L' | 'R', size: number, centerX: number, ground: number) {
  const feet = pose.feetVb ?? FEET_VB;
  const top = ground - (feet * size) / RIG.H;
  const left = centerX - (RIG.CX * size) / RIG.W;
  const arm = (side === 'L' ? pose.armL : pose.armR) ?? { s: 0, e: 0 };
  const hv = handPos(side, arm);
  return { x: left + (hv.x * size) / RIG.W, y: top + (hv.y * size) / RIG.H };
}

/** 손톱깎이 장식 아이콘(에피소드 로컬 - 참고 이미지가 없는 단순 도형이라 벡터화 대상이
 *  아니다, 원칙 0-1). 몸체(집게) + 지렛대 + 힌지 3덩이만으로 단순화했다. */
const NailClipper: React.FC<{ cx: number; cy: number; size: number; opacity: number }> = ({
  cx, cy, size, opacity,
}) => {
  if (opacity <= 0.01) return null;
  const s = size;
  return (
    <svg
      width={s} height={s} viewBox="0 0 100 100"
      style={{ position: 'absolute', left: cx - s / 2, top: cy - s / 2, opacity, overflow: 'visible' }}
    >
      <path
        d="M 20 60 Q 50 30 80 60 L 68 62 Q 50 46 32 62 Z"
        fill={C.paper} stroke={C.ink} strokeWidth={5} strokeLinejoin="round"
      />
      <rect x="44" y="12" width="12" height="34" rx="5" fill={C.gold} stroke={C.ink} strokeWidth={4} />
      <circle cx="50" cy="58" r="7" fill={C.ink} />
    </svg>
  );
};

function pillBadgeStyle(x: number, y: number, p: number): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `translateX(-50%) translateY(${(1 - cp) * -16}px) scale(${0.85 + 0.15 * cp})`,
    opacity: cp, background: C.gold, border: `${Math.round(SW * 0.6)}px solid ${C.ink}`,
    borderRadius: RADIUS.pill, padding: '12px 34px', fontFamily: FONT, fontWeight: 700,
    fontSize: FS.small, color: C.ink, whiteSpace: 'nowrap', wordBreak: 'keep-all',
  };
}

/* ============================================================
 * S1: 쭈그려 앉아 손톱을 깎다가 발톱을 보며 고개를 갸웃함 (전신, 무성)
 * ============================================================ */
/** ep33 CROUCH 전신 히어로샷 관례(size=1400, 기본 GROUND)를 그대로 재사용 - CROUCH는
 *  feetVb(955)가 기본(1026)보다 낮아 같은 size라도 실제 실루엣이 화면을 덜 채운다. 처음
 *  1100/1240으로 스틸을 뽑아보니 상하 여백이 과다했다(스틸 선점검에서 발견, 원칙 5). */
const S1_ACTOR_SIZE = 1400;
const S1_ACTOR_CENTER_X = CX;
const S1_ACTOR_GROUND = GROUND;

export const S1Clip: React.FC<{ f: number }> = ({ f }) => {
  const clipPopT = progress(f, 0, 10);
  const clipFadeT = progress(f, 40, 55);
  const clipOpacity = clipPopT * (1 - clipFadeT);
  const wag = 6 * Math.sin((f / 24) * Math.PI * 2) * progress(f, 14, 30);

  const pose: Pose = { ...POSES.crouch, headTilt: (POSES.crouch.headTilt ?? 0) + wag };
  const handPt = actorHandPt(pose, 'R', S1_ACTOR_SIZE, S1_ACTOR_CENTER_X, S1_ACTOR_GROUND);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={S1_ACTOR_GROUND}>
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={S1_ACTOR_GROUND} pose={pose} />
      <NailClipper cx={handPt.x} cy={handPt.y} size={110} opacity={clipOpacity} />
    </PlainBg>
  );
};

/** s1 안에서 손톱을 깎는 순간(딸깍 소리)의 로컬 프레임 - Episode.tsx가 SFX를 이 프레임에
 *  맞춰 배치한다(원칙 7) */
export const S1_CLIP_SFX_AT_FRAME = 8;

/* ============================================================
 * S2: "어? 손톱은 자주 깎는데, 발톱은 왜 이렇게 안 자라지?" (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const puzzleT = progress(f, 0, 18);
  const glanceWag = 5 * Math.sin((f / 45) * Math.PI * 2) * progress(f, 18, 34);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT);
  pose.headTilt = (pose.headTilt ?? 0) + glanceWag;
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 손톱 vs 발톱 한 달 성장 길이 비교 (CompareBars, 수치는 화면만)
 * ============================================================ */
const S3_BAR_X = 170;
/** 처음 210px/unit 으로 스틸을 뽑아보니 손톱(3mm/월) 막대 끝의 valueText("약 3mm/월")가
 *  화면 오른쪽 밖으로 잘렸다(스틸 선점검에서 발견, 원칙 5). 최대 막대 길이를 줄여
 *  valueText 자리를 확보했다. */
const S3_BAR_Y = 560;
const S3_PX_PER_UNIT = 140;

export const S3Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CompareBars
        x={S3_BAR_X} y={S3_BAR_Y} pxPerUnit={S3_PX_PER_UNIT} rowGap={230} labelGap={64} frame={f}
        labelSize={56}
        items={[
          { label: t.s3FingerLabel, value: 3, at: 6, valueText: t.s3FingerValue, color: C.coral },
          { label: t.s3ToeLabel, value: 1, at: 24, valueText: t.s3ToeValue, color: C.gold },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 손톱 뿌리(조모) 소개 + 강조 (NailRootDiagram, 혈류·자극 아직 0)
 * ============================================================ */
const S4_DIAG_WIDTH = 480;
const S4_DIAG_X = CX - S4_DIAG_WIDTH / 2;
const S4_DIAG_Y = 560;
const S4_DIAG_SCALE = S4_DIAG_WIDTH / NAIL_ROOT_VB_W;
/** 라벨을 뿌리 지점 바로 아래에 겹쳐 놨더니 다이어그램 몸체와 텍스트가 서로 가려 읽기
 *  어려웠다(스틸 선점검에서 발견, 원칙 5). 다이어그램 위쪽 안전영역(SAFE_TOP=240)으로
 *  아예 옮겨 겹침을 원천 차단했다. */
const S4_LABEL_Y = 300;

export const S4RootIntro: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const popT = progress(f, 0, 22);
  const labelP = progress(f, 30, 52);

  const rootPt = {
    x: S4_DIAG_X + NAIL_ROOT_PT.x * S4_DIAG_SCALE,
    y: S4_DIAG_Y + NAIL_ROOT_PT.y * S4_DIAG_SCALE,
  };

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label
        x={CX} y={S4_LABEL_Y} text={t.s4RootLabel} size={50} align="center"
        wrapWidth={700} style={{ opacity: labelP }}
      />
      <div
        style={{
          position: 'absolute', left: S4_DIAG_X, top: S4_DIAG_Y, width: S4_DIAG_WIDTH,
          transformOrigin: '50% 35%', transform: `scale(${0.6 + 0.4 * popT})`, opacity: popT,
        }}
      >
        <NailRootDiagram width={S4_DIAG_WIDTH} x={0} y={0} f={f} bloodFlowProgress={0} stimulateProgress={0} />
      </div>
      <PulseRing
        x={rootPt.x - 74} y={rootPt.y - 74} size={148} frame={f} progress={labelP} color={C.coralSoft}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 혈류 화살 맥동 + 손 움직임 잔상 강조 (NailRootDiagram)
 * ============================================================ */
const S5_DIAG_WIDTH = 640;
const S5_DIAG_X = CX - S5_DIAG_WIDTH / 2;
const S5_DIAG_Y = 440;

export const S5Blood: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const bloodP = progress(f, 0, 26);
  const stimP = progress(f, 22, 60);
  const enterT = Math.min(1, f / 6);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ opacity: enterT }}>
        <NailRootDiagram
          width={S5_DIAG_WIDTH} x={S5_DIAG_X} y={S5_DIAG_Y} f={f}
          bloodFlowProgress={bloodP} stimulateProgress={stimP}
        />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 자주 쓰는 손 vs 반대쪽 손 손톱 비교 - "그런 얘기도 있음" 배지(원칙 1-2)
 * ============================================================ */
const S6_FINGER_W = 280;
const S6_GAP = 80;
const S6_TOTAL_W = S6_FINGER_W * 2 + S6_GAP;
const S6_START_X = CX - S6_TOTAL_W / 2;
const S6_FINGER_Y = 440;
const S6_FINGER_A_X = S6_START_X;
const S6_FINGER_B_X = S6_START_X + S6_FINGER_W + S6_GAP;
const S6_FINGER_H = (S6_FINGER_W * 400) / 300;
const S6_BADGE_X = CX;
const S6_BADGE_Y = 280;

export const S6Dominant: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const fingersP = progress(f, 0, 20);
  const badgeP = progress(f, 20, 42);
  const arrowP = progress(f, 30, 50);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ opacity: fingersP }}>
        <Finger
          width={S6_FINGER_W}
          style={{ position: 'absolute', left: S6_FINGER_A_X, top: S6_FINGER_Y }}
        />
        <Finger
          width={S6_FINGER_W}
          style={{ position: 'absolute', left: S6_FINGER_B_X, top: S6_FINGER_Y }}
        />
      </div>
      <div
        style={{
          position: 'absolute', left: S6_FINGER_A_X + S6_FINGER_W / 2 - 34, top: S6_FINGER_Y - 76,
          opacity: arrowP, transform: `translateY(${(1 - arrowP) * 10}px)`,
        }}
      >
        <ThemedIcon name="arrow-up" size={68} color={C.coral} />
      </div>
      <Label
        x={S6_FINGER_A_X + S6_FINGER_W / 2} y={S6_FINGER_Y + S6_FINGER_H + 24}
        text={t.s6DominantLabel} size={40} align="center" style={{ opacity: fingersP }}
      />
      <Label
        x={S6_FINGER_B_X + S6_FINGER_W / 2} y={S6_FINGER_Y + S6_FINGER_H + 24}
        text={t.s6OtherLabel} size={40} align="center" style={{ opacity: fingersP }}
      />
      <div style={pillBadgeStyle(S6_BADGE_X, S6_BADGE_Y, badgeP)}>{t.s6Badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 손가락이 활발히 움직이는 마무리 컷
 * ============================================================ */
const S7_FINGER_W = 260;
const S7_GAP = 70;
const S7_TOTAL_W = S7_FINGER_W * 2 + S7_GAP;
const S7_START_X = CX - S7_TOTAL_W / 2;
const S7_FINGER_Y = 500;
const S7_FINGER_A_X = S7_START_X;
const S7_FINGER_B_X = S7_START_X + S7_FINGER_W + S7_GAP;
const S7_FINGER_H = (S7_FINGER_W * 400) / 300;

export const S7Active: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const ampT = progress(f, 0, 16);
  const angleA = ampT * 10 * Math.sin((f / 9) * Math.PI * 2);
  const angleB = ampT * 10 * Math.sin((f / 9) * Math.PI * 2 + Math.PI);
  const fingersP = progress(f, 0, 14);

  const aCenterX = S7_FINGER_A_X + S7_FINGER_W / 2;
  const aCenterY = S7_FINGER_Y + S7_FINGER_H * 0.35;
  const bCenterX = S7_FINGER_B_X + S7_FINGER_W / 2;
  const bCenterY = S7_FINGER_Y + S7_FINGER_H * 0.35;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ opacity: fingersP }}>
        <div
          style={{
            position: 'absolute', left: S7_FINGER_A_X, top: S7_FINGER_Y, width: S7_FINGER_W,
            height: S7_FINGER_H, transformOrigin: '50% 100%', transform: `rotate(${angleA}deg)`,
          }}
        >
          <Finger width={S7_FINGER_W} />
        </div>
        <div
          style={{
            position: 'absolute', left: S7_FINGER_B_X, top: S7_FINGER_Y, width: S7_FINGER_W,
            height: S7_FINGER_H, transformOrigin: '50% 100%', transform: `rotate(${angleB}deg)`,
          }}
        >
          <Finger width={S7_FINGER_W} />
        </div>
      </div>
      <MotionSwoosh x={aCenterX - 130} y={aCenterY} size={38} rotation={180} frame={f} periodFrames={9} color={C.coral} />
      <MotionSwoosh x={bCenterX + 130} y={bCenterY} size={38} rotation={0} frame={f} periodFrames={9} color={C.coral} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
