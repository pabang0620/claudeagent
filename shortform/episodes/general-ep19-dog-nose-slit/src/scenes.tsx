/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(강아지 등장, v3 신규) -> s2(발견+리액션) -> s3(구조: 옆트임) -> s4(동작: 들숨/날숨 동시 흐름)
 *  -> s5(핵심 결론, 그래픽 정지) -> s6(빠른 반복 호흡) -> s7(촬영 검증) -> s8(속설: 촉촉한 코)
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, DOG_HOLE_L_PT, DOG_HOLE_R_PT, DOG_NOSE_VB_W, DOG_SLIT_LABEL_PT,
  DOG_STANDING_GROUND_VB, DOG_STANDING_VB_W, DogNoseCloseup, DogStanding, FONT, FPS, FS, GROUND,
  Label, MotionSwoosh, PlainBg, POSES, RADIUS, SW, Sparkles,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 화면에 떠 있는 알약 배지. 등장(position+opacity+transform)을 한 div 에 결합해
 *  `Appear` 안에 absolute 자식을 넣는 함정(REGISTRY 4절 주의문)을 피한다. s7/s8 라벨에 쓴다. */
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

/** DogNoseCloseup 의 viewBox 앵커(anchor)를 지금 그려진 화면 좌표로 바꾼다.
 *  스케일은 width/DOG_NOSE_VB_W 로 균일(정사각 아님이지만 x/y 동일 스케일)하다. */
function noseAnchor(
  diagX: number, diagY: number, diagWidth: number, anchor: { x: number; y: number }
) {
  const scale = diagWidth / DOG_NOSE_VB_W;
  return { x: diagX + anchor.x * scale, y: diagY + anchor.y * scale };
}

/* ---------------- S1: 강아지 등장 - 캐릭터가 부르고("몽뭉아!") 강아지가 통통 튀며 들어와
 *  멈춰 선다 (v3 신규, 02-script-v3.md "s1 재구성" 참고). 개 코 클로즈업은 s2로 밀렸다. */

const S1_ACTOR_SIZE = 760;
const S1_ACTOR_CX = 760;
const S1_DOG_WIDTH = 280;
/** 강아지가 멈춰 서는 최종 위치(DogStanding 박스 왼쪽 위 기준 화면 x) */
const S1_DOG_TARGET_X = 90;
/** 등장 시작 시 화면 완전히 밖(왼쪽) */
const S1_DOG_START_X = -S1_DOG_WIDTH - 40;
/** 강아지가 목표 지점까지 도달하는 데 걸리는 프레임 수 */
const S1_DOG_ENTER_FRAMES = 32;
/** 통통 튀는 높이(px). 도착할수록(hopEnvelope -> 0) 잦아든다 */
const S1_DOG_HOP_H = 46;
const S1_DOG_HOP_PERIOD = 11;

/** DogStanding 의 바닥선(viewBox 좌표 660/620)을 화면 GROUND 에 맞추는 y(top) 계산 */
function dogGroundY(width: number) {
  return GROUND - (DOG_STANDING_GROUND_VB / DOG_STANDING_VB_W) * width;
}

export const S1Greet: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const poseT = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.wave, poseT);

  // 강아지 등장: 화면 밖(왼쪽) -> 목표 지점, ease-in-out(smoothstep) 이동 + 도착할수록
  // 잦아드는 통통 튐. ease-out(1-(1-p)^3)은 첫 8프레임(SceneSwitcher 페이드인 구간, 아직
  // 안 보임)에 이미 58%가 이동해버려 실제로 보이는 구간엔 "화면 밖에서 들어오는" 느낌이
  // 약했다(실측: f=8/32일 때 58%). smoothstep은 같은 지점에서 16%뿐이라 화면 밖 출발이
  // 눈에 보인다.
  const travelP = progress(f, 0, S1_DOG_ENTER_FRAMES);
  const travelEase = travelP * travelP * (3 - 2 * travelP);
  const dogX = S1_DOG_START_X + (S1_DOG_TARGET_X - S1_DOG_START_X) * travelEase;
  const hopEnvelope = 1 - travelEase;
  const hopY = -S1_DOG_HOP_H * hopEnvelope * Math.abs(Math.sin((f / S1_DOG_HOP_PERIOD) * Math.PI));
  const dogY = dogGroundY(S1_DOG_WIDTH) + hopY;
  // 도착 직후부터 꼬리를 흔든다
  const tailWagT = progress(f, S1_DOG_ENTER_FRAMES, S1_DOG_ENTER_FRAMES + 8);

  return (
    <PlainBg>
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CX} pose={pose} mouthOpen={mouthOpen} />
      <DogStanding f={f} width={S1_DOG_WIDTH} x={dogX} y={dogY} tailWagT={tailWagT} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S2: 발견 - 캐릭터가 옆에서 가리키며 "이게 뭐지?" ---------------- */

const S2_BUST_SIZE = 620;
const S2_BUST_LEFT = -60;
const S2_BUST_TOP = 560;
const S2_DIAG_W = 620;
const S2_DIAG_X = 500;
const S2_DIAG_Y = 500;

export const S2Discover: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const poseT = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, poseT);
  const slitHighlight = progress(f, 18, 48) * 0.45;

  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <DogNoseCloseup
        f={f} width={S2_DIAG_W} x={S2_DIAG_X} y={S2_DIAG_Y} sniffT={0.5} slitHighlight={slitHighlight}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 구조 - "옆트임" 하이라이트 + 라벨 ---------------- */

const S3_DIAG_W = 860;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 470;

export const S3Slit: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const highlightP = progress(f, 6, 30);
  const labelP = progress(f, 16, 40);
  const anchor = noseAnchor(S3_DIAG_X, S3_DIAG_Y, S3_DIAG_W, DOG_SLIT_LABEL_PT);

  return (
    <PlainBg ground={null}>
      <DogNoseCloseup f={f} width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} sniffT={0.3} slitHighlight={highlightP} />
      <div style={{ opacity: labelP, transform: `translateY(${(1 - labelP) * -10}px)` }}>
        <Label x={anchor.x} y={anchor.y} text={label} size={FS.label} color={C.ink} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 동작 - 들숨/날숨이 동시에 서로 다른 통로로 ---------------- */

const S4_DIAG_W = 860;
const S4_DIAG_X = CX - S4_DIAG_W / 2;
const S4_DIAG_Y = 470;
const S4_CYCLE_FRAMES = 40;

export const S4Airflow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const flowT = progress(f, 8, S4_CYCLE_FRAMES) >= 1
    ? ((f - 8) % S4_CYCLE_FRAMES) / S4_CYCLE_FRAMES
    : 0;
  const gateP = progress(f, 8, 20);

  return (
    <PlainBg ground={null}>
      <DogNoseCloseup
        f={f} width={S4_DIAG_W} x={S4_DIAG_X} y={S4_DIAG_Y} sniffT={0.25} slitHighlight={0.4}
        inhaleProgress={flowT * gateP} exhaleProgress={flowT * gateP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 핵심 결론 - 그래픽 정지, 캐릭터 idle 복귀 ---------------- */

const S5_DIAG_W = 520;
const S5_DIAG_X = 280;
const S5_DIAG_Y = 420;
const S5_BUST_SIZE = 440;
const S5_BUST_LEFT = 640;
const S5_BUST_TOP = 980;

export const S5Recap: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.surprised, POSES.idle, poseT);

  return (
    <PlainBg>
      <DogNoseCloseup f={f} width={S5_DIAG_W} x={S5_DIAG_X} y={S5_DIAG_Y} sniffT={0} />
      <BustActor size={S5_BUST_SIZE} left={S5_BUST_LEFT} top={S5_BUST_TOP} pose={pose} breathAmp={1.2} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 빠른 반복 호흡 ---------------- */

const S6_DIAG_W = 860;
const S6_DIAG_X = CX - S6_DIAG_W / 2;
const S6_DIAG_Y = 470;

export const S6FastBreath: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const rampP = progress(f, 0, 14);
  const holeR = noseAnchor(S6_DIAG_X, S6_DIAG_Y, S6_DIAG_W, DOG_HOLE_R_PT);
  const holeL = noseAnchor(S6_DIAG_X, S6_DIAG_Y, S6_DIAG_W, DOG_HOLE_L_PT);
  const swooshOpacity = rampP;

  return (
    <PlainBg ground={null}>
      <DogNoseCloseup
        f={f} width={S6_DIAG_W} x={S6_DIAG_X} y={S6_DIAG_Y} sniffT={rampP} sniffRateBoost={1}
      />
      {swooshOpacity > 0.02 ? (
        <>
          <MotionSwoosh x={holeR.x + 34} y={holeR.y - 46} size={24} rotation={-40} frame={f} periodFrames={7}
            color={C.inkSoft} opacity={0.7 * swooshOpacity} />
          <MotionSwoosh x={holeL.x - 34} y={holeL.y - 46} size={24} rotation={220} frame={f} periodFrames={7}
            color={C.inkSoft} opacity={0.7 * swooshOpacity} />
          <MotionSwoosh x={holeR.x + 20} y={holeR.y + 44} size={20} rotation={20} frame={f} periodFrames={7}
            color={C.inkSoft} opacity={0.55 * swooshOpacity} />
        </>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 촬영 검증 - 슐리렌 흐름 + "실제 촬영 이미지" 배지 ---------------- */

const S7_DIAG_W = 860;
const S7_DIAG_X = CX - S7_DIAG_W / 2;
const S7_DIAG_Y = 470;
const S7_BADGE_Y = 1620;

export const S7Footage: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const schlierenP = progress(f, 10, 48);
  const badgeP = progress(f, 20, 40);

  return (
    <PlainBg ground={null}>
      <DogNoseCloseup
        f={f} width={S7_DIAG_W} x={S7_DIAG_X} y={S7_DIAG_Y} sniffT={0.2} schlierenOverlay={schlierenP}
      />
      <div style={pillBadgeStyle(CX, S7_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 속설 - 촉촉한 코 + "그런 얘기가 있어요" 배지 ---------------- */

const S8_DIAG_W = 860;
const S8_DIAG_X = CX - S8_DIAG_W / 2;
const S8_DIAG_Y = 470;
const S8_BADGE_Y = 1620;
const S8_SPARK_BOX = { x: CX - 260, y: 200, w: 520, h: 420 };

export const S8WetNose: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const shineP = progress(f, 10, 42);
  const badgeP = progress(f, 16, 34);
  const sparkT = clamp01(progress(f, 20, 40) * (1 - progress(f, frames - 24, frames)));

  return (
    <PlainBg ground={null}>
      <DogNoseCloseup f={f} width={S8_DIAG_W} x={S8_DIAG_X} y={S8_DIAG_Y} sniffT={0.15} wetShineOpacity={shineP} />
      <Sparkles box={S8_SPARK_BOX} t={sparkT} colorA={C.gold} colorB={C.coral} scale={0.85} />
      <div style={pillBadgeStyle(CX, S8_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
