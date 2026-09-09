/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(하품을 보면 따라 하는 순간) -> s2(글자만 읽어도 옮음) -> s3(친밀도가 관련 있다)
 *  -> s4(가족·친구 vs 낯선 사람 비교) -> s5(친밀도 = 마음이 통하는 정도, 결론 정지)
 *  -> s6(개도 주인을 따라 하품) -> s7(아기->어린이, 공감 능력 발달)
 *
 *  어느 장면도 캐릭터가 직접 말하는 순간이 아니라(전부 3인칭 설명 내레이션) mouth.json
 *  립싱크를 쓰지 않는다 - Episode.tsx 상단 주석과 동일 근거. s1/s2/s6의 하품 입 모양은
 *  `buildPeakRelease`(anim.ts, general-ep21 신설)로 직접 만든 mouthOpen 곡선을 쓴다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CompareBars, DogStanding, DOG_STANDING_GROUND_VB,
  DOG_STANDING_VB_W, FONT, FPS, FS, GROUND, GrowthTimeline, Label, PlainBg, POSES, PopIn,
  PulseRing, RADIUS, SW, ThemedIcon,
  blendPose, buildPeakRelease, clamp01, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 화면에 떠 있는 알약 배지. 등장(position+opacity+transform)을 한 div 에 결합해
 *  `Appear` 안에 absolute 자식을 넣는 함정(REGISTRY 4절 주의문)을 피한다(ep19와 동일 패턴).
 *  s6/s7 라벨에 쓴다. */
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

/** 하품 입 모양. env=0(평상시) -> 0.45(기본 미소, DEFAULT_POSE.mouthOpen 과 동일), env=1(정점) -> 1.0 */
function yawnMouth(env: number) {
  return 0.45 + 0.55 * clamp01(env);
}

/* ---------------- S1: 옆에서 하품하는 걸 보면 저절로 따라 한다 ---------------- */

const S1_LEFT_CX = 300;
const S1_RIGHT_CX = 780;
const S1_SIZE = 560;

const S1_A_START = 6, S1_A_BUILD = 28, S1_A_PEAK = 24, S1_A_RELEASE = 26;
const S1_B_START = 50, S1_B_BUILD = 28, S1_B_PEAK = 24, S1_B_RELEASE = 26;

export const S1SeeYawn: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const envA = buildPeakRelease(f, S1_A_START, S1_A_BUILD, S1_A_PEAK, S1_A_RELEASE);
  const envB = buildPeakRelease(f, S1_B_START, S1_B_BUILD, S1_B_PEAK, S1_B_RELEASE);
  const poseA: Pose = blendPose(POSES.idle, POSES.yawn, envA);
  const poseB: Pose = blendPose(POSES.idle, POSES.yawn, envB);

  return (
    <PlainBg>
      <Actor
        size={S1_SIZE} centerX={S1_LEFT_CX} pose={poseA} mouthOpen={yawnMouth(envA)} blinkOffset={0}
      />
      <Actor
        size={S1_SIZE} centerX={S1_RIGHT_CX} pose={poseB} mouthOpen={yawnMouth(envB)} blinkOffset={40}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S2: 글자만 읽어도 하품이 나온다 ---------------- */

const S2_WORD_Y = 420;
const S2_BUST_SIZE = 760;
const S2_BUST_LEFT = 160;
const S2_BUST_TOP = 640;

const S2_WORD_POP_START = 4, S2_WORD_POP_FRAMES = 18;
const S2_YAWN_START = 44, S2_YAWN_BUILD = 26, S2_YAWN_PEAK = 22, S2_YAWN_RELEASE = 24;

export const S2ReadWord: React.FC<{ f: number; frames: number; lines: CaptionLine[]; word: string }> = ({
  f, frames, lines, word,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const wordP = progress(f, S2_WORD_POP_START, S2_WORD_POP_START + S2_WORD_POP_FRAMES);
  const env = buildPeakRelease(f, S2_YAWN_START, S2_YAWN_BUILD, S2_YAWN_PEAK, S2_YAWN_RELEASE);
  const pose: Pose = blendPose(POSES.idle, POSES.yawn, env);

  return (
    <PlainBg>
      <PopIn cx={CX} cy={S2_WORD_Y} size={620} height={220} progress={wordP} fromScale={0.6}>
        <div
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 800, fontSize: 160, color: C.ink,
            wordBreak: 'keep-all',
          }}
        >
          {word}
        </div>
      </PopIn>
      <BustActor
        size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={yawnMouth(env)}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 친밀도가 관련 있다 - 두 사람 사이 하트 연결 ---------------- */

const S3_LEFT_CX = 290;
const S3_RIGHT_CX = 790;
const S3_SIZE = 520;
const S3_HEART_Y = 960;
const S3_HEART_SIZE = 190;

export const S3Closeness: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const heartP = progress(f, 14, 40);

  return (
    <PlainBg>
      <Actor size={S3_SIZE} centerX={S3_LEFT_CX} pose={POSES.idle} />
      <Actor size={S3_SIZE} centerX={S3_RIGHT_CX} pose={POSES.idle} blinkOffset={40} />

      <PulseRing
        x={CX - S3_HEART_SIZE * 0.75} y={S3_HEART_Y - S3_HEART_SIZE * 0.75}
        size={S3_HEART_SIZE * 1.5} frame={f} progress={heartP} color={C.coralSoft}
      />
      <PopIn cx={CX} cy={S3_HEART_Y} size={S3_HEART_SIZE} progress={heartP} fromScale={0.4}>
        <ThemedIcon name="heart-filled" size={S3_HEART_SIZE} color={C.coral} strokePx={0} />
      </PopIn>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 가족·친구 vs 낯선 사람 (상대적 길이만, 숫자 없음) ---------------- */

const S4_BAR_X = 150;
const S4_BAR_Y = 820;

export const S4CompareBars: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; closeLabel: string; strangerLabel: string;
}> = ({ f, frames, lines, closeLabel, strangerLabel }) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg>
      <CompareBars
        x={S4_BAR_X} y={S4_BAR_Y} pxPerUnit={62} frame={f}
        items={[
          { label: closeLabel, value: 9, color: C.coral, at: 8 },
          { label: strangerLabel, value: 3, color: C.goldSoft, at: 26 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 마음이 통하는 정도 - 결론, 화면 텍스트 없이 하트만 맥동 ---------------- */

const S5_HEART_Y = 860;
const S5_HEART_SIZE = 260;

export const S5Pulse: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const enterP = progress(f, 0, 20);

  return (
    <PlainBg>
      <PulseRing
        x={CX - S5_HEART_SIZE} y={S5_HEART_Y - S5_HEART_SIZE}
        size={S5_HEART_SIZE * 2} frame={f} progress={enterP} color={C.coralSoft} periodFrames={70}
      />
      <PulseRing
        x={CX - S5_HEART_SIZE * 0.7} y={S5_HEART_Y - S5_HEART_SIZE * 0.7}
        size={S5_HEART_SIZE * 1.4} frame={f + 20} progress={enterP} color={C.goldSoft} periodFrames={70}
      />
      <PopIn cx={CX} cy={S5_HEART_Y} size={S5_HEART_SIZE} progress={enterP} fromScale={0.5}>
        <ThemedIcon name="heart-filled" size={S5_HEART_SIZE} color={C.coral} strokePx={0} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 개도 주인이 하품하면 따라 한다 ---------------- */

const S6_OWNER_CX = 760;
const S6_OWNER_SIZE = 640;
const S6_DOG_WIDTH = 340;
const S6_DOG_X = 90;

const S6_OWNER_START = 10, S6_OWNER_BUILD = 26, S6_OWNER_PEAK = 22, S6_OWNER_RELEASE = 24;
const S6_DOG_START = 34, S6_DOG_BUILD = 26, S6_DOG_PEAK = 22, S6_DOG_RELEASE = 24;
const S6_BADGE_X = 300;
const S6_BADGE_Y = 480;

function dogGroundY(width: number) {
  return GROUND - (DOG_STANDING_GROUND_VB / DOG_STANDING_VB_W) * width;
}

export const S6Dog: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const envOwner = buildPeakRelease(f, S6_OWNER_START, S6_OWNER_BUILD, S6_OWNER_PEAK, S6_OWNER_RELEASE);
  const envDog = buildPeakRelease(f, S6_DOG_START, S6_DOG_BUILD, S6_DOG_PEAK, S6_DOG_RELEASE);
  const pose: Pose = blendPose(POSES.idle, POSES.yawn, envOwner);
  const badgeP = progress(f, S6_DOG_START + 6, S6_DOG_START + 26);
  const tailWagT = progress(f, 0, 20);

  return (
    <PlainBg>
      <DogStanding
        f={f} width={S6_DOG_WIDTH} x={S6_DOG_X} y={dogGroundY(S6_DOG_WIDTH)}
        tailWagT={tailWagT} mouthOpen={yawnMouth(envDog)}
      />
      <Actor size={S6_OWNER_SIZE} centerX={S6_OWNER_CX} pose={pose} mouthOpen={yawnMouth(envOwner)} />
      <div style={pillBadgeStyle(S6_BADGE_X, S6_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 아기 -> 어린이, 공감 능력 발달 ---------------- */

const S7_DIAG_W = 780;
const S7_DIAG_X = 150;
const S7_DIAG_Y = 700;
const S7_BADGE_X = CX;
const S7_BADGE_Y = 500;

export const S7Growth: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const revealP = progress(f, 6, 74);
  const glow = progress(f, 70, 96);
  const badgeP = progress(f, 66, 88);

  return (
    <PlainBg>
      <GrowthTimeline
        width={S7_DIAG_W} x={S7_DIAG_X} y={S7_DIAG_Y} revealProgress={revealP} empathyGlow={glow}
      />
      <div style={pillBadgeStyle(S7_BADGE_X, S7_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
