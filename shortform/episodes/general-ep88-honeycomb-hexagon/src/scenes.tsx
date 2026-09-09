/** 이 화(general-ep88, "벌집이 육각형인 이유") 전용 장면.
 *
 *  s1(무성, 벌 1마리가 육각형 방 3칸을 순서대로 짓는다) -> s2(캐릭터 리액션+훅 질문, "같은
 *  이유일까?") -> s3(눈송이 아이콘 vs 벌집 아이콘 사이에 X - "원리가 완전히 달라요", 20화와의
 *  반전을 시각으로 대조) -> s4(밀랍 방울 아이콘 + "에너지 소모 큼" 라벨) -> s5(원->사각형
 *  타일링 비교, HoneycombShapeDiagram.shapeIndex) -> s6(같은 다이어그램에서 육각형으로 전환,
 *  면적 강조) -> s7(완성된 벌집 + 캐릭터 복귀).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 벌은 s1에서 정확히 1마리만 그린다(HoneycombShapeDiagram.showBee).
 *   - 벌집 구조는 육각형 몇 개(3칸)를 이어 붙인 정도로 단순화한다 - 촘촘한 격자로 화면을
 *     채우지 않는다(s1/s3/s7 전부 3칸 클러스터 재사용).
 *   - s5/s6은 원/삼각형·사각형/육각형 세 도형의 효율(빈틈·면적) 대비가 중심이다 -
 *     HoneycombShapeDiagram이 이미 이 대비를 shapeIndex 하나로 커버한다(새 다이어그램을
 *     장면마다 새로 만들지 않는다).
 *   - s3은 20화(눈송이)와 소재가 겹치지만 원리가 다르다는 반전을 X 표시로 명시한다 - "어느
 *     쪽이 틀렸다"가 아니라 "서로 다른 이유"라는 뜻이라 원칙 F(속설 정정)의 대상이 아니다
 *     (ep86 s2와 동일한 XMark 관례 - 두 대상 다 유효하되 원리가 다르다는 것만 표시).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, HoneycombShapeDiagram, Label, PlainBg, POSES, PulseRing,
  SnowflakeIcon, ThemedIcon,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = 540; // W/2 (W=1080)

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * S1: 무성 - 벌 1마리가 육각형 방 3칸을 순서대로 짓는다
 * ============================================================ */
export const S1_GROWTH_START = 5;
export const S1_GROWTH_END = 85;
/** 칸이 완성되는 3번의 순간(로컬 프레임) - Episode.tsx가 wax_tap SFX 타이밍에 그대로 가져다 쓴다.
 *  매직넘버 중복 없이 S1_GROWTH_START/END에서 유도한다. */
export const S1_HEX_TAP_FRAMES = [1, 2, 3].map((k) => (
  Math.round(S1_GROWTH_START + (S1_GROWTH_END - S1_GROWTH_START) * (k / 3))
));

const S1_DIAG_SIZE = 1000;
const S1_DIAG_X = CX - S1_DIAG_SIZE / 2;
const S1_DIAG_Y = 425;

export const S1Growth: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const growth = progress(f, S1_GROWTH_START, S1_GROWTH_END);
  return (
    <PlainBg ground={null}>
      <HoneycombShapeDiagram
        width={S1_DIAG_SIZE} x={S1_DIAG_X} y={S1_DIAG_Y}
        honeycombGrowth={growth} showBee f={f}
      />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 캐릭터 리액션 - "와, 벌집은 다 육각형이네. 같은 이유일까?" (surprised, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 780;
const S2_BUST_TOP = 620;
const S2_BUST_LEFT = CX - S2_BUST_SIZE / 2 - 140;
const S2_ICON_SIZE = 420;
const S2_ICON_X = CX + 90;
const S2_ICON_Y = 360;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, poseT);

  return (
    <PlainBg>
      <HoneycombShapeDiagram
        width={S2_ICON_SIZE} x={S2_ICON_X} y={S2_ICON_Y}
        honeycombGrowth={1} showBee={false}
      />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 눈송이 vs 벌집 - "원리가 완전히 달라요" (20화와의 반전을 X로 대조)
 * ============================================================ */
const S3_ICON_W = 300;
const S3_LEFT_X = 130;
const S3_RIGHT_X = 1080 - S3_ICON_W - 130;
const S3_ICON_Y = 560;
const S3_X_CX = CX;
const S3_X_CY = S3_ICON_Y + S3_ICON_W / 2;

/** 두 대상이 "원리가 다르다"는 것을 보여주는 X 표시(ep86 S2Compare와 동일 관례, 지역성
 *  우선 - 에피소드 로컬). "어느 쪽이 틀렸다"가 아니라 "서로 다른 이유"라는 뜻이다. */
const XMark: React.FC<{ cx: number; cy: number; size: number; reveal: number }> = ({ cx, cy, size, reveal }) => {
  const r = clamp01(reveal);
  if (r <= 0.01) return null;
  const s = size / 2;
  const k = 0.15 + 0.85 * Math.min(1, r * 2.2);
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: cx - s, top: cy - s, overflow: 'visible' }}>
      <circle cx={s} cy={s} r={s} fill={C.paper} stroke={C.ink} strokeWidth={7} opacity={Math.min(1, r * 3)} />
      <g style={{ opacity: Math.min(1, r * 3) }} transform={`translate(${s} ${s}) scale(${k})`}>
        <line x1={-s * 0.5} y1={-s * 0.5} x2={s * 0.5} y2={s * 0.5} stroke={C.coral} strokeWidth={16} strokeLinecap="round" />
        <line x1={s * 0.5} y1={-s * 0.5} x2={-s * 0.5} y2={s * 0.5} stroke={C.coral} strokeWidth={16} strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const S3Contrast: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const iconA = progress(f, 0, 16);
  const xReveal = progress(f, 20, 42);

  return (
    <PlainBg ground={null}>
      <SnowflakeIcon
        width={S3_ICON_W} x={S3_LEFT_X} y={S3_ICON_Y} variant={0} color={C.ink} progress={1}
        style={{ opacity: iconA, transform: `scale(${0.85 + 0.15 * iconA})`, transformOrigin: '50% 50%' }}
      />
      <HoneycombShapeDiagram
        width={S3_ICON_W} x={S3_RIGHT_X} y={S3_ICON_Y}
        honeycombGrowth={1} showBee={false}
        style={{ opacity: iconA, transform: `scale(${0.85 + 0.15 * iconA})`, transformOrigin: '50% 50%' }}
      />
      <XMark cx={S3_X_CX} cy={S3_X_CY} size={140} reveal={xReveal} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 밀랍 방울 + "에너지 소모 큼"
 * ============================================================ */
const S4_DROP_SIZE = 420;
const S4_DROP_X = CX - S4_DROP_SIZE / 2;
const S4_DROP_Y = 500;
const S4_BOLT_BADGE = 200;
const S4_BOLT_CX = S4_DROP_X + S4_DROP_SIZE - 40;
const S4_BOLT_CY = S4_DROP_Y + 60;
const S4_LABEL_Y = S4_DROP_Y + S4_DROP_SIZE + 40;

export const S4Energy: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; t: (typeof STRINGS)['ko'];
}> = ({ f, frames, lines, t }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const dropT = progress(f, 0, 16);
  const boltT = progress(f, 14, 30);

  return (
    <PlainBg ground={null}>
      <ThemedIcon
        name="droplet" size={S4_DROP_SIZE} color={C.gold}
        style={{
          position: 'absolute', left: S4_DROP_X, top: S4_DROP_Y,
          opacity: dropT, transform: `scale(${0.85 + 0.15 * dropT})`, transformOrigin: '50% 50%',
        }}
      />
      <PulseRing x={S4_BOLT_CX - S4_BOLT_BADGE / 2} y={S4_BOLT_CY - S4_BOLT_BADGE / 2} size={S4_BOLT_BADGE} frame={f} progress={boltT} color={C.coralSoft} />
      <div
        style={{
          position: 'absolute', left: S4_BOLT_CX - S4_BOLT_BADGE / 2, top: S4_BOLT_CY - S4_BOLT_BADGE / 2,
          width: S4_BOLT_BADGE, height: S4_BOLT_BADGE, borderRadius: S4_BOLT_BADGE / 2,
          background: C.paper, border: `7px solid ${C.coral}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: boltT, transform: `scale(${0.7 + 0.3 * boltT})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="bolt" size={S4_BOLT_BADGE * 0.6} color={C.coral} />
      </div>
      <Label x={CX} y={S4_LABEL_Y} text={t.energyLabel} size={54} weight={800} color={C.ink} style={{ opacity: dropT }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 원 -> 사각형 타일링 비교 (빈틈 vs 좁은 면적)
 * ============================================================ */
const SHAPE_DIAG_SIZE = 740;
const SHAPE_DIAG_X = CX - SHAPE_DIAG_SIZE / 2;
const SHAPE_DIAG_Y = 520;

export const S5CircleSquare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const fillCircle = progress(f, 8, 90);
  const toSquare = progress(f, 110, 190);
  const shapeIndex = toSquare; // 0(원) -> 1(사각형)
  const fillProgress = Math.max(fillCircle, toSquare > 0.001 ? 1 : fillCircle);

  return (
    <PlainBg ground={null}>
      <HoneycombShapeDiagram
        width={SHAPE_DIAG_SIZE} x={SHAPE_DIAG_X} y={SHAPE_DIAG_Y}
        shapeIndex={shapeIndex} fillProgress={fillProgress}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 같은 다이어그램에서 육각형으로 전환, 면적이 가장 넓게 강조
 * ============================================================ */
export const S6Hexagon: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const toHex = progress(f, 15, 90);
  const shapeIndex = 1 + toHex; // 1(사각형) -> 2(육각형)
  const pulseT = progress(f, 100, 130);

  return (
    <PlainBg ground={null}>
      <HoneycombShapeDiagram
        width={SHAPE_DIAG_SIZE} x={SHAPE_DIAG_X} y={SHAPE_DIAG_Y}
        shapeIndex={shapeIndex} fillProgress={1}
      />
      <PulseRing
        x={CX - 380} y={SHAPE_DIAG_Y - 40} size={760} frame={f} progress={pulseT}
        color={C.goldSoft} opacity={0.35}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 완성된 벌집 + 캐릭터 복귀
 * ============================================================ */
const S7_ACTOR_SIZE = 760;
const S7_ACTOR_CENTER_X = 300;
const S7_ACTOR_GROUND = 1280;
const S7_ICON_SIZE = 480;
const S7_ICON_X = 580;
const S7_ICON_Y = 470;

export const S7Recap: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.present, poseT * 0.6);

  return (
    <PlainBg>
      <HoneycombShapeDiagram
        width={S7_ICON_SIZE} x={S7_ICON_X} y={S7_ICON_Y}
        honeycombGrowth={1} showBee={false}
      />
      <Actor size={S7_ACTOR_SIZE} centerX={S7_ACTOR_CENTER_X} ground={S7_ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
