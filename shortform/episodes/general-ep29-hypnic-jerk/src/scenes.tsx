/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(침대에서 잠들다 갑자기 움찔 튀어 오름) -> s2(온몸의 힘이 순식간에 빠짐, 근육 이완)
 *  -> s3(뇌가 위험 신호로 착각) -> s4(뇌 -> 근육 신호 전달) -> s5(그 결과 몸이 튀어 오름,
 *  s1과 짝을 이루는 클라이맥스) -> s6(속설: 나무 위 조상 이야기) -> s7(떨어지는 느낌·번쩍임)
 *  -> s8(카페인·피로·스트레스와의 상관관계).
 *
 *  8개 구간 전부 3인칭 설명 내레이션이다("~있어요", "~하는 거예요" 류) - 캐릭터가 카메라를
 *  보고 직접 말을 거는 1인칭 리액션 대사(ep27의 "어, 반죽이...", ep23의 "어?" 류)가 한 군데도
 *  없다. general-ep21과 동일한 이유로 mouth.json 립싱크를 쓰지 않는다.
 *
 *  뇌 내부를 해부도처럼 그리지 않는다(오케스트레이터 지시) - 신호는 굵은 선(NerveSignal) 한
 *  줄기로만 표현하고, 피부 위에 작은 요소를 여러 개 반복해서 찍지 않는다("징그럽다" 재발 방지
 *  원칙, 근육 긴장 표시도 몸 바깥쪽에 큼직한 볼트 아이콘 3개로만 표시).
 */
import React from 'react';
import {
  Actor, Bed, C, Caption, FONT, FPS, FS, GROUND, Label, MiniCharacter, NerveSignal, PlainBg,
  POSES, PopIn, RADIUS, SW, SW_THIN, ThemedIcon,
  blendPose, buildPeakRelease, clamp01, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = 540; // W/2
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

const lerp = (a: number, b: number, r: number) => a + (b - a) * r;

/** 화면에 떠 있는 알약 배지 (ep19/ep21과 동일 패턴 - Appear 대신 position+opacity+transform을
 *  한 div에 결합해 팝인 도중 위로 쏠리는 함정을 피한다). s6 속설 라벨에 쓴다. */
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

/* ---------------- 로컬 포즈 ----------------
 * 졸린 표정 - 눈이 거의 감기고 고개가 옆으로 기운다. "깜짝 놀람"은 기존 POSES.surprised
 * (두 손 번쩍, eyeOpen 1.28)를 그대로 재사용한다(원칙 0 - 새 포즈를 만들지 않는다). */
const DROWSY: Pose = {
  headTilt: 14, lean: 3,
  armL: { s: 28, e: 26 }, armR: { s: -28, e: -26 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
  eyeOpen: 0.15, mouthOpen: 0.08, blush: 0.9,
};

/** 온몸에 힘이 빠져 늘어진 자세. s2(근육 이완)에서 쓴다 */
const LOOSE: Pose = {
  headTilt: 16, lean: 6,
  armL: { s: 18, e: 12 }, armR: { s: -18, e: -12 },
  legL: { h: 14, k: 8 }, legR: { h: -14, k: -8 },
  eyeOpen: 0.2, mouthOpen: 0.15,
};

/* ================= S1: 잠들다 갑자기 움찔 튀어 오름 ================= */

const S1_ACTOR_SIZE = 1500;
const S1_ACTOR_GROUND = 1533;
const S1_BLANKET_Y = 1200;
const S1_JUMP_PX = 90;

const S1_DROWSY_START = 6, S1_DROWSY_END = 34;
const S1_JOLT_START = 46;
const S1_AWAKE_START = 46, S1_AWAKE_END = 60;

/** SFX(cold_zing) 재생 프레임 - "움찔하면서" 어절 실측 시작(1.623s=frame48.7)에 맞춤
 *  (ko_words.json s1 실측, 원칙 7). Episode.tsx가 Audio Sequence 배치에 그대로 쓴다. */
export const S1_JOLT_SFX_FRAME = 48;

export const S1JoltAwake: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const drowsyT = progress(f, S1_DROWSY_START, S1_DROWSY_END);
  const poseDrowsy = blendPose(POSES.idle, DROWSY, drowsyT);
  const awakeT = progress(f, S1_AWAKE_START, S1_AWAKE_END);
  const pose = blendPose(poseDrowsy, POSES.surprised, awakeT);
  const jumpEnv = buildPeakRelease(f, S1_JOLT_START, 6, 6, 20);
  const groundY = S1_ACTOR_GROUND - jumpEnv * S1_JUMP_PX;

  return (
    <PlainBg top={C.roomDeep} bottom={C.room} ground={null}>
      <ThemedIcon name="moon" size={90} color={C.inkSoft} style={{ position: 'absolute', left: 110, top: 130 }} />
      <Bed layer="back" blanketY={S1_BLANKET_Y} />
      <Actor size={S1_ACTOR_SIZE} centerX={CX} ground={groundY} pose={pose} />
      <Bed layer="front" blanketY={S1_BLANKET_Y} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S2: 온몸의 힘이 순식간에 빠진다(근육 이완) ================= */

const S2_ACTOR_SIZE = 760;
const S2_RELAX_START = 4, S2_RELAX_END = 100;

/** 긴장 표시 - 몸 바깥쪽에 큼직한 볼트 아이콘 3개(피부 위 점 여러 개 대신, 원칙 0-1/징그럽다
 *  재발 방지). 각각 다른 시점에 옅어져 사라지며 "힘이 빠진다"를 표현한다(고정 스태거,
 *  Math.random 미사용) */
const S2_TENSION_ICONS = [
  { x: 380, y: 1000, fadeStart: 10, fadeEnd: 40 },
  { x: 700, y: 1000, fadeStart: 35, fadeEnd: 65 },
  { x: 540, y: 1260, fadeStart: 60, fadeEnd: 92 },
];

export const S2MuscleRelax: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const relaxT = progress(f, S2_RELAX_START, S2_RELAX_END);
  const pose = blendPose(POSES.idle, LOOSE, relaxT);

  return (
    <PlainBg ground={GROUND}>
      <Actor size={S2_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} />
      {S2_TENSION_ICONS.map((icon, i) => {
        const op = 1 - progress(f, icon.fadeStart, icon.fadeEnd);
        if (op <= 0.01) return null;
        return (
          <ThemedIcon
            key={i} name="bolt" size={70} color={C.gold}
            style={{ position: 'absolute', left: icon.x - 35, top: icon.y - 35, opacity: op }}
          />
        );
      })}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S3: 뇌가 위험 신호로 착각 ================= */

const S3_BRAIN_CX = CX, S3_BRAIN_CY = 1020, S3_BRAIN_SIZE = 680;
const S3_Q_CX = 300, S3_Q_CY = 480, S3_Q_SIZE = 150;
const S3_ALERT_CX = 780, S3_ALERT_CY = 480, S3_ALERT_SIZE = 150;

/** SFX(realize_ding) 재생 프레임 - "위험" 어절 실측 시작(1.988s=frame59.6)에 맞춤 */
export const S3_ALERT_SFX_FRAME = 60;

export const S3BrainWarning: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const brainP = progress(f, 4, 26);
  const qP = progress(f, 20, 42);
  const alertP = progress(f, 58, 76);

  return (
    <PlainBg ground={null}>
      <PopIn cx={S3_BRAIN_CX} cy={S3_BRAIN_CY} size={S3_BRAIN_SIZE} progress={brainP} fromScale={0.5}>
        <ThemedIcon name="brain" size={S3_BRAIN_SIZE} color={C.ink} />
      </PopIn>
      <PopIn cx={S3_Q_CX} cy={S3_Q_CY} size={S3_Q_SIZE} progress={qP} fromScale={0.4}>
        <ThemedIcon name="question-mark" size={S3_Q_SIZE} color={C.inkSoft} />
      </PopIn>
      <PopIn cx={S3_ALERT_CX} cy={S3_ALERT_CY} size={S3_ALERT_SIZE} progress={alertP} fromScale={0.4}>
        <ThemedIcon name="alert-triangle" size={S3_ALERT_SIZE} color={C.coral} />
      </PopIn>
      <Label
        x={S3_ALERT_CX} y={S3_ALERT_CY + S3_ALERT_SIZE / 2 + 14} text={t.s3AlertLabel}
        size={FS.small} color={C.coral} style={{ opacity: clamp01(alertP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S4: 뇌에서 근육으로 신호 전달 ================= */

const S4_BRAIN_CX = CX, S4_BRAIN_CY = 480, S4_BRAIN_SIZE = 320;
const S4_TARGET_CX = CX, S4_TARGET_CY = 1560, S4_TARGET_SIZE = 380;
const S4_FROM_PT = { x: S4_BRAIN_CX, y: S4_BRAIN_CY + S4_BRAIN_SIZE / 2 - 10 };
const S4_TO_PT = { x: S4_TARGET_CX, y: S4_TARGET_CY - S4_TARGET_SIZE / 2 + 20 };

export const S4SignalArrow: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const brainP = progress(f, 2, 16);
  const pathP = progress(f, 12, 50);
  const signalT = progress(f, 50, 92);
  const boltP = progress(f, 90, 106);

  return (
    <PlainBg ground={null}>
      <PopIn cx={S4_BRAIN_CX} cy={S4_BRAIN_CY} size={S4_BRAIN_SIZE} progress={brainP} fromScale={0.5}>
        <ThemedIcon name="brain" size={S4_BRAIN_SIZE} color={C.ink} />
      </PopIn>
      <div
        style={{
          position: 'absolute', left: S4_TARGET_CX - S4_TARGET_SIZE / 2,
          top: S4_TARGET_CY - S4_TARGET_SIZE / 2, width: S4_TARGET_SIZE, height: S4_TARGET_SIZE,
        }}
      >
        <MiniCharacter width={S4_TARGET_SIZE} pose={POSES.idle} />
      </div>
      {pathP > 0.01 ? (
        <NerveSignal
          from={S4_FROM_PT} to={S4_TO_PT} bow={90} showPath={pathP}
          signalT={signalT > 0.01 && signalT < 1 ? signalT : undefined}
          pathColor={C.ink} strokeWidth={14} dotColor={C.coral} dotRadius={20}
        />
      ) : null}
      {boltP > 0.01 ? (
        <PopIn cx={S4_TO_PT.x} cy={S4_TO_PT.y} size={130} progress={boltP} fromScale={0.4}>
          <ThemedIcon name="bolt" size={130} color={C.gold} />
        </PopIn>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S5: 그 바람에 몸이 움찔 튀어 오름 (클라이맥스, s1과 짝) ================= */

const S5_JUMP_PX = 140;
const S5_JOLT_START = 27;
const S5_AWAKE_START = 27, S5_AWAKE_END = 35;

/** SFX(hop_thump) 재생 프레임 - "움찔" 어절 실측 시작(0.894s=frame26.8)+build 6프레임 뒤
 *  정점 부근(frame33)에 맞춤 */
export const S5_JOLT_SFX_FRAME = 33;

export const S5JoltUp: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const awakeT = progress(f, S5_AWAKE_START, S5_AWAKE_END);
  const pose = blendPose(DROWSY, POSES.surprised, awakeT);
  const jumpEnv = buildPeakRelease(f, S5_JOLT_START, 6, 8, 20);
  const groundY = S1_ACTOR_GROUND - jumpEnv * S5_JUMP_PX;

  return (
    <PlainBg top={C.roomDeep} bottom={C.room} ground={null}>
      <ThemedIcon name="moon" size={90} color={C.inkSoft} style={{ position: 'absolute', left: 110, top: 130 }} />
      <Bed layer="back" blanketY={S1_BLANKET_Y} />
      <Actor size={S1_ACTOR_SIZE} centerX={CX} ground={groundY} pose={pose} />
      <Bed layer="front" blanketY={S1_BLANKET_Y} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S6: 속설 - 나무 위 조상 이야기 ================= */

const S6_BRANCH_A = { x: 160, y: 760 };
const S6_BRANCH_B = { x: 940, y: 1040 };
const S6_START_R = 0.16;
const S6_SLIP_R = 0.82;
const S6_SLIP_START = 42, S6_SLIP_END = 70;
const S6_CATCH_START = 68, S6_CATCH_END = 74;
const S6_ACTOR_SIZE = 640;

function branchPoint(r: number) {
  return { x: lerp(S6_BRANCH_A.x, S6_BRANCH_B.x, r), y: lerp(S6_BRANCH_A.y, S6_BRANCH_B.y, r) };
}

/** SFX(cold_zing) 재생 프레임 - "움찔했던" 어절 실측 시작(2.352s=frame70.6)에 맞춰 살짝
 *  앞서(붙잡는 동작 시작점) 배치 */
export const S6_CATCH_SFX_FRAME = 71;

export const S6CavemanTree: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const slipT = progress(f, S6_SLIP_START, S6_SLIP_END);
  const pos = branchPoint(lerp(S6_START_R, S6_SLIP_R, slipT));
  const catchT = progress(f, S6_CATCH_START, S6_CATCH_END);
  const pose = blendPose(DROWSY, POSES.surprised, catchT);
  const badgeP = progress(f, 10, 30);

  return (
    <PlainBg top={C.sky} bottom={C.leaf} stop={0.75} ground={null}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line
          x1={S6_BRANCH_A.x - 80} y1={S6_BRANCH_A.y - 40} x2={S6_BRANCH_B.x + 60} y2={S6_BRANCH_B.y + 30}
          stroke={C.browning} strokeWidth={SW * 1.6} strokeLinecap="round"
        />
        <ellipse cx={S6_BRANCH_A.x - 40} cy={S6_BRANCH_A.y - 120} rx={150} ry={90} fill={C.leaf} stroke={C.ink} strokeWidth={SW_THIN} />
        <ellipse cx={S6_BRANCH_B.x + 40} cy={S6_BRANCH_B.y - 60} rx={170} ry={100} fill={C.leaf} stroke={C.ink} strokeWidth={SW_THIN} />
      </svg>
      <Actor
        size={S6_ACTOR_SIZE} centerX={pos.x} ground={pos.y + S6_ACTOR_SIZE * 0.36} pose={pose}
        color={C.night} accent={C.night} fill={C.nightSoft}
      />
      <div style={pillBadgeStyle(CX, 220, badgeP)}>{t.s6Badge}</div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S7: 떨어지는 느낌 + 번쩍임 ================= */

const S7_ARROWS = [
  { x: 340, start: 10 },
  { x: 540, start: 16 },
  { x: 740, start: 22 },
];
const S7_ARROW_DUR = 30;

/** SFX(head_whoosh) - "번쩍하는" 어절 직전(1.363s=frame41부터 시작하는 단어)에 살짝 앞서
 *  배치해 "스치는" 느낌을 준다. FlashOverlay는 같은 어절 시작점(frame41)에 맞춘다 */
export const S7_WHOOSH_SFX_FRAME = 36;
export const S7_FLASH_FRAME = 41;

function fallFade(p: number) {
  const c = clamp01(p);
  if (c < 0.15) return c / 0.15;
  if (c > 0.85) return (1 - c) / 0.15;
  return 1;
}

export const S7FallFlash: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const flash = (() => {
    const rise = 4, fall = 16, at = S7_FLASH_FRAME, peak = 0.75;
    if (f < at) return 0;
    if (f < at + rise) return ((f - at) / rise) * peak;
    if (f < at + fall) return peak * (1 - (f - at - rise) / (fall - rise));
    return 0;
  })();

  return (
    <PlainBg top={C.roomDeep} bottom={C.room} ground={null}>
      <Bed layer="back" blanketY={S1_BLANKET_Y} />
      <Actor size={S1_ACTOR_SIZE} centerX={CX} ground={S1_ACTOR_GROUND} pose={POSES.surprised} />
      <Bed layer="front" blanketY={S1_BLANKET_Y} />
      {S7_ARROWS.map((a, i) => {
        const p = progress(f, a.start, a.start + S7_ARROW_DUR);
        const op = fallFade(p);
        if (op <= 0.01) return null;
        const y = lerp(260, 980, p);
        return (
          <ThemedIcon
            key={i} name="arrow-down" size={90} color={C.inkSoft}
            style={{ position: 'absolute', left: a.x - 45, top: y - 45, opacity: op * 0.8 }}
          />
        );
      })}
      {flash > 0.01 ? (
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: C.paper, opacity: flash }} />
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================= S8: 카페인 · 피로 · 스트레스 ================= */

const S8_COFFEE_CX = 320, S8_COFFEE_CY = 560, S8_ICON_SIZE = 180;
const S8_CLOUD_CX = 760, S8_CLOUD_CY = 560;
const S8_ACTOR_SIZE = 680;
const S8_ACTOR_GROUND = 1720;

export const S8CoffeeStress: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const coffeeP = progress(f, 4, 26);
  const cloudP = progress(f, 40, 64);
  const tiredT = progress(f, 30, 100);
  const pose = blendPose(POSES.idle, LOOSE, tiredT);

  return (
    <PlainBg ground={null}>
      <PopIn cx={S8_COFFEE_CX} cy={S8_COFFEE_CY} size={S8_ICON_SIZE} progress={coffeeP} fromScale={0.5}>
        <ThemedIcon name="coffee" size={S8_ICON_SIZE} color={C.ink} />
      </PopIn>
      <Label
        x={S8_COFFEE_CX} y={S8_COFFEE_CY + S8_ICON_SIZE / 2 + 20} text={t.s8CaffeineLabel}
        size={FS.small} color={C.ink} style={{ opacity: clamp01(coffeeP) }}
      />
      <PopIn cx={S8_CLOUD_CX} cy={S8_CLOUD_CY} size={S8_ICON_SIZE} progress={cloudP} fromScale={0.5}>
        <ThemedIcon name="cloud" size={S8_ICON_SIZE} color={C.inkSoft} />
      </PopIn>
      <Label
        x={S8_CLOUD_CX} y={S8_CLOUD_CY + S8_ICON_SIZE / 2 + 20} text={t.s8StressLabel}
        size={FS.small} color={C.inkSoft} style={{ opacity: clamp01(cloudP) }}
      />
      <Actor size={S8_ACTOR_SIZE} centerX={CX} ground={S8_ACTOR_GROUND} pose={pose} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
