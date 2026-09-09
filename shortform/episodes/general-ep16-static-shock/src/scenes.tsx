/** 이 화(general-ep16, "겨울에 정전기가 더 잘 통하는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  s1/s2/s5/s8 은 같은 문손잡이(DoorHandle, assets/props)를 반복해서 쓴다 - "reach 포즈로
 *  다가가서 손잡이에 손이 닿는다"는 동일한 구도를 4번 재사용해 화면 언어를 하나로 통일했다
 *  (원칙 0). StaticChargeDiagram(assets/props)은 s3(축적)·s4(습도 비교)·s5(방전)에서
 *  buildProgress/wipeProgress/dischargeProgress 를 독립적으로 조합해 재사용한다.
 */
import React from 'react';
import {
  C, Caption, Actor, CompareBars, Card, DoorHandle, DOOR_HANDLE_GRIP_PT,
  DOOR_HANDLE_VB_W, FEET_VB, FONT, FPS, FlashOverlay, HEAD_TOP_VB, Label,
  MiniCharacter, PlainBg, POSES, PopIn, RIG, SW, Shake, SpeechBubble, StaticChargeDiagram, SW_THIN,
  ThemedIcon, W, blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 삼각 envelope(0 -> 1 -> 0). ep11/ep15 의 bump 와 동일 패턴, 화 전용이라 로컬로 다시 둔다. */
function bump(f: number, at: number, dur: number) {
  const rise = progress(f, at, at + dur * 0.4);
  const fall = 1 - progress(f, at + dur * 0.4, at + dur);
  return Math.min(rise, fall);
}

/* ---------------- 공용 배치 상수 (s1/s2/s5/s8 이 같은 손잡이 구도를 공유) ---------------- */

const ACTOR_SIZE = 820;
const ACTOR_GROUND = 1400;
const ACTOR_CENTER_X = 330;

const HANDLE_WIDTH = 280;
const HANDLE_X = 640;
const HANDLE_Y = 780;
const HANDLE_SCALE = HANDLE_WIDTH / DOOR_HANDLE_VB_W;
const GRIP_X = HANDLE_X + DOOR_HANDLE_GRIP_PT.x * HANDLE_SCALE;
const GRIP_Y = HANDLE_Y + DOOR_HANDLE_GRIP_PT.y * HANDLE_SCALE;

/** 캐릭터 머리 꼭대기 화면 y (말풍선 앵커용) */
function headTopY(size: number, ground: number) {
  return ground - (FEET_VB - HEAD_TOP_VB) * (size / RIG.H);
}

/** "손잡이 쪽으로 뻗는" 리치 포즈. WAVE 를 베이스로 팔을 좀 더 곧게 편다(s1/s2/s5/s8 공용). */
const REACH_POSE: Pose = {
  headTilt: -6, lean: 3,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -108, e: -14 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

/* ---------------- S1: 문손잡이로 손을 뻗는다 (무성) ---------------- */

export const S1Reach: React.FC<{ f: number }> = ({ f }) => {
  const poseT = progress(f, 4, 46);
  const pose: Pose = blendPose(POSES.idle, REACH_POSE, poseT);

  return (
    <PlainBg ground={ACTOR_GROUND + 60} groundColor={C.hill}>
      <Actor size={ACTOR_SIZE} centerX={ACTOR_CENTER_X} ground={ACTOR_GROUND} pose={pose} />
      <DoorHandle width={HANDLE_WIDTH} x={HANDLE_X} y={HANDLE_Y} />
    </PlainBg>
  );
};

/* ---------------- S2: 스파크 + 놀람 리액션 (훅) ---------------- */

export const S2_SPARK_AT = 10;

export const S2Zap: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const shockT = progress(f, S2_SPARK_AT, S2_SPARK_AT + 14);
  const pose: Pose = blendPose(REACH_POSE, POSES.surprised, shockT);
  const sparkP = bump(f, S2_SPARK_AT, 16);
  const glow = Math.max(0, 1 - progress(f, S2_SPARK_AT, S2_SPARK_AT + 26));

  return (
    <PlainBg ground={ACTOR_GROUND + 60} groundColor={C.hill}>
      <Shake frame={f} at={S2_SPARK_AT} duration={10} amp={8}>
        <Actor size={ACTOR_SIZE} centerX={ACTOR_CENTER_X} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
        <DoorHandle width={HANDLE_WIDTH} x={HANDLE_X} y={HANDLE_Y} glow={glow} />
        {sparkP > 0.01 ? (
          <div
            style={{
              position: 'absolute', left: GRIP_X - 44, top: GRIP_Y - 44,
              opacity: sparkP, transform: `scale(${0.6 + 0.6 * sparkP})`,
            }}
          >
            <ThemedIcon name="bolt" size={88} color={C.gold} strokePx={SW} />
          </div>
        ) : null}
      </Shake>
      <FlashOverlay frame={f} at={S2_SPARK_AT} color={C.goldSoft} peak={0.55} rise={3} fall={14} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 몸 주변에 정전기(+)가 쌓인다 ---------------- */

const S3_ACTOR_SIZE = 860;
const S3_ACTOR_GROUND = 1480;
const S3_HEAD_TOP = headTopY(S3_ACTOR_SIZE, S3_ACTOR_GROUND);
const S3_BOX = { x: CX - S3_ACTOR_SIZE / 2, y: S3_HEAD_TOP, width: S3_ACTOR_SIZE, height: S3_ACTOR_GROUND - S3_HEAD_TOP };

export const S3Build: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const sway = Math.sin(f / 22) * 3;
  const pose: Pose = { ...blendPose(POSES.idle, POSES.idle, 0), lean: sway * 0.4 };
  const buildP = progress(f, 10, Math.round(frames * 0.85));

  return (
    <PlainBg ground={null}>
      <Actor size={S3_ACTOR_SIZE} centerX={CX} ground={S3_ACTOR_GROUND} pose={pose} />
      <StaticChargeDiagram {...S3_BOX} plusCount={7} buildProgress={buildP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 습함(왼쪽) vs 건조함(오른쪽) 비교 ---------------- */

const S4_LEFT_CX = CX - 260;
const S4_RIGHT_CX = CX + 260;
const S4_MINI_W = 260;
const S4_TOP = 760;
const S4_LABEL_Y = 1220;
const S4_WIPE_CYCLE = 96; // 3.2초 주기(30fps)

export const S4Humidity: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; summerLabel: string; winterLabel: string;
}> = ({ f, frames, lines, summerLabel, winterLabel }) => {
  const line = activeLine(lines, f / FPS);
  const enterP = progress(f, 4, 22);

  const cyc = f % S4_WIPE_CYCLE;
  const leftBuild = clamp01(cyc / 26);
  const leftWipe = clamp01((cyc - 26) / (S4_WIPE_CYCLE - 26));

  const rightBuild = progress(f, 10, Math.round(frames * 0.5));

  return (
    <PlainBg ground={1560} groundColor={C.hill}>
      <div
        style={{
          position: 'absolute', left: CX - 2, top: 640, width: 4, height: 760, background: C.hill,
        }}
      />

      <PopIn cx={S4_LEFT_CX} cy={S4_TOP + S4_MINI_W / 2} size={S4_MINI_W} progress={enterP}>
        <MiniCharacter width={S4_MINI_W} />
      </PopIn>
      <StaticChargeDiagram
        x={S4_LEFT_CX - S4_MINI_W / 2} y={S4_TOP} width={S4_MINI_W} height={S4_MINI_W}
        plusCount={5} buildProgress={leftBuild} wipeProgress={leftWipe} color={C.coral}
      />
      <ThemedIcon
        name="droplets" size={64} color={C.sky} strokePx={SW_THIN}
        style={{ position: 'absolute', left: S4_LEFT_CX - 32, top: S4_TOP - 78, opacity: enterP }}
      />
      <Label x={S4_LEFT_CX} y={S4_LABEL_Y} text={summerLabel} size={44} align="center" wrapWidth={420} />

      <PopIn cx={S4_RIGHT_CX} cy={S4_TOP + S4_MINI_W / 2} size={S4_MINI_W} progress={enterP}>
        <MiniCharacter width={S4_MINI_W} />
      </PopIn>
      <StaticChargeDiagram
        x={S4_RIGHT_CX - S4_MINI_W / 2} y={S4_TOP} width={S4_MINI_W} height={S4_MINI_W}
        plusCount={5} buildProgress={rightBuild} color={C.coral}
      />
      <ThemedIcon
        name="snowflake" size={60} color={C.inkSoft} strokePx={SW_THIN}
        style={{ position: 'absolute', left: S4_RIGHT_CX - 30, top: S4_TOP - 76, opacity: enterP * 0.8 }}
      />
      <Label x={S4_RIGHT_CX} y={S4_LABEL_Y} text={winterLabel} size={44} align="center" wrapWidth={420} />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 손잡이에 닿는 순간 한번에 방전 ---------------- */

export const S5_CONTACT_FRAME_RATIO = 0.34;

export const S5Discharge: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const contactAt = Math.round(frames * S5_CONTACT_FRAME_RATIO);
  const approachT = progress(f, 0, contactAt);
  const pose: Pose = blendPose(POSES.idle, REACH_POSE, approachT);
  const dischargeP = progress(f, contactAt, contactAt + 22);
  const glow = Math.max(0, 1 - progress(f, contactAt, contactAt + 10)) * (approachT > 0.9 ? 1 : approachT);

  // 몸 주변 박스 - S3 보다 좁게 잡아 캐릭터가 화면 왼쪽에 있어도 + 마크가 캔버스 밖으로
  // 나가지 않게 한다(ACTOR_SIZE 그대로 쓰면 왼쪽 절반이 화면 밖으로 나가 마크가 누락됐다)
  const BODY_BOX_W = ACTOR_SIZE * 0.6;
  const bodyBox = {
    x: ACTOR_CENTER_X - BODY_BOX_W / 2, y: headTopY(ACTOR_SIZE, ACTOR_GROUND),
    width: BODY_BOX_W, height: ACTOR_GROUND - headTopY(ACTOR_SIZE, ACTOR_GROUND),
  };

  return (
    <PlainBg ground={ACTOR_GROUND + 60} groundColor={C.hill}>
      <Shake frame={f} at={contactAt} duration={10} amp={9}>
        <Actor size={ACTOR_SIZE} centerX={ACTOR_CENTER_X} ground={ACTOR_GROUND} pose={pose} />
        <StaticChargeDiagram {...bodyBox} plusCount={7} buildProgress={1} dischargeProgress={dischargeP} />
        <DoorHandle width={HANDLE_WIDTH} x={HANDLE_X} y={HANDLE_Y} glow={glow} />
        {dischargeP > 0.01 && dischargeP < 0.7 ? (
          <div
            style={{
              position: 'absolute', left: GRIP_X - 50, top: GRIP_Y - 50,
              opacity: 1 - dischargeP / 0.7, transform: `scale(${0.7 + 0.6 * Math.min(1, dischargeP * 3)})`,
            }}
          >
            <ThemedIcon name="bolt" size={100} color={C.gold} strokePx={SW} />
          </div>
        ) : null}
      </Shake>
      <FlashOverlay frame={f} at={contactAt} color={C.goldSoft} peak={0.6} rise={3} fall={16} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: '전기'라는 말의 유래 - 호박(elektron) ---------------- */

const AMBER_CX = CX;
const AMBER_CY = 560;
const CARD_W = 700;
const CARD_H = 560;
const CARD_X = CX - CARD_W / 2;
const CARD_Y = 840;

/** 카드 위에 얹는 작은 태그. Card 의 아트 영역은 overflow:hidden 이라 Card 의 children 으로
 *  넣으면 카드 밖으로 튀어나온 부분이 잘린다(2026-08-20 실측) - 그래서 Card 의 형제 요소로
 *  독립된 절대좌표에 그린다(cx = 카드 가로 중심, topY = 카드 상단 바로 위). */
const EraTag: React.FC<{ text: string; cx: number; topY: number; opacity: number }> = ({
  text, cx, topY, opacity,
}) => {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute', left: cx, top: topY, opacity,
        transform: 'translate(-50%, -50%)',
        background: C.gold, border: `${Math.round(SW * 0.7)}px solid ${C.ink}`, borderRadius: 999,
        padding: '12px 32px', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.ink,
        whiteSpace: 'nowrap', wordBreak: 'keep-all',
      }}
    >
      {text}
    </div>
  );
};

export const S6Etymology: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; badge: string; label: string;
}> = ({ f, frames, lines, badge, label }) => {
  const line = activeLine(lines, f / FPS);
  const amberP = progress(f, 4, 20);
  const stickP = progress(f, 16, 40);
  const cardP = progress(f, Math.round(frames * 0.32), Math.round(frames * 0.32) + 20);
  const upperFade = 1 - Math.min(1, cardP) * 0.55;

  const featherX = AMBER_CX + 190 - 100 * stickP;
  const featherY = AMBER_CY - 40 + 6 * Math.sin(f / 9) * (1 - stickP);

  return (
    <PlainBg ground={null}>
      <div style={{ opacity: upperFade }}>
        {amberP > 0.01 ? (
          <div
            style={{
              position: 'absolute', left: AMBER_CX - 90, top: AMBER_CY - 90,
              opacity: amberP, transform: `scale(${0.6 + 0.4 * amberP})`,
            }}
          >
            <ThemedIcon name="diamond" size={180} color={C.gold} strokePx={SW} />
          </div>
        ) : null}
        {amberP > 0.3 ? (
          <div
            style={{
              position: 'absolute', left: featherX - 30, top: featherY - 30,
              opacity: Math.min(1, (amberP - 0.3) / 0.4),
            }}
          >
            <ThemedIcon name="feather" size={60} color={C.inkSoft} strokePx={SW_THIN} />
          </div>
        ) : null}
      </div>

      <Card
        x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} label={label} progress={cardP}
        bg={C.paper} border={C.ink} labelColor={C.ink} labelSize={44}
      >
        <ThemedIcon name="diamond" size={220} color={C.gold} strokePx={SW} />
      </Card>
      <EraTag
        text={badge} cx={CARD_X + CARD_W / 2} topY={CARD_Y}
        opacity={Math.max(0, Math.min(1, (cardP - 0.6) / 0.3))}
      />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 방전 전압 vs 콘센트 (정성적 비교) ---------------- */

export const S7Voltage: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; sparkLabel: string; outletLabel: string;
}> = ({ f, frames, lines, sparkLabel, outletLabel }) => {
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg ground={1560} groundColor={C.hill}>
      <CompareBars
        x={150} y={760} pxPerUnit={46} rowGap={300} labelGap={64} frame={f}
        items={[
          { label: sparkLabel, value: 9, color: C.coral, at: 8, thickness: 78 },
          { label: outletLabel, value: 3.2, color: C.sky, at: 30, thickness: 78 },
        ]}
        labelSize={42}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 열쇠로 먼저 대면 덜 따끔하다는 속설 ---------------- */

const KEY_POSE: Pose = {
  headTilt: -4, lean: 2,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -96, e: -20 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

export const S8KeyTip: React.FC<{ f: number; frames: number; lines: CaptionLine[]; rumor: string }> = (
  { f, frames, lines, rumor },
) => {
  const line = activeLine(lines, f / FPS);
  const approachT = progress(f, 0, Math.round(frames * 0.4));
  const pose: Pose = blendPose(POSES.idle, KEY_POSE, approachT);
  const contactAt = Math.round(frames * 0.42);
  const sparkP = bump(f, contactAt, 14);
  const bubbleIn = progress(f, contactAt + 6, contactAt + 24);
  const bubbleOut = progress(f, Math.round(frames * 0.82), frames);
  const bubbleP = bubbleIn * (1 - bubbleOut);
  const bubbleY = headTopY(ACTOR_SIZE, ACTOR_GROUND) - 60;

  return (
    <PlainBg ground={ACTOR_GROUND + 60} groundColor={C.hill}>
      <Actor size={ACTOR_SIZE} centerX={ACTOR_CENTER_X} ground={ACTOR_GROUND} pose={pose} />
      <DoorHandle width={HANDLE_WIDTH} x={HANDLE_X} y={HANDLE_Y} />
      <div
        style={{
          position: 'absolute', left: GRIP_X - 130, top: GRIP_Y - 30, opacity: approachT,
          transform: `translateX(${(1 - approachT) * 60}px)`,
        }}
      >
        <ThemedIcon name="key" size={72} color={C.inkSoft} strokePx={SW_THIN} />
      </div>
      {sparkP > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: GRIP_X - 30, top: GRIP_Y - 30,
            opacity: sparkP, transform: `scale(${0.5 + 0.6 * sparkP})`,
          }}
        >
          <ThemedIcon name="bolt" size={52} color={C.gold} strokePx={SW_THIN} />
        </div>
      ) : null}
      {bubbleP > 0.01 ? (
        <div style={{ opacity: bubbleP }}>
          <SpeechBubble
            x={ACTOR_CENTER_X - 260} y={bubbleY - 210} w={520} h={190}
            shape="rect" tail="bottomRight" text={rumor} textSize={44}
          />
        </div>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
