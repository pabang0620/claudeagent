/** 이 화(general-ep26, "비 온 뒤 유독 흙냄새가 진해지는 이유") 전용 장면.
 *
 *  s1(무성, 문을 열고 나가 숨을 크게 들이쉼) -> s2(리액션+훅 질문, 바스트샷) ->
 *  s3(흙 속 미생물이 냄새 물질을 만듦) -> s4(그 물질의 이름 "지오스민" 라벨) ->
 *  s5(평소엔 흙 속에 갇혀 있는 정적 상태) -> s6(빗방울 충격으로 공기 방울이 터지며
 *  냄새가 방출 - 이 화에서 가장 긴 핵심 구간) -> s7(다시 냄새를 맡는 만족스러운 표정,
 *  s1·s2와 짝) -> s8(이름의 유래 카드, petrichor/1964).
 *
 *  냄새·미생물은 작은 점을 여러 개 흩뿌리지 않는다(과거 "징그럽다" 피드백) - 미생물은
 *  WetSoilAerosolDiagram이 큰 도형 2개로, 냄새는 ScentWaves의 큰 물결선 2~3개로 그린다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, Card, DoorFrame, FONT, FPS, GROUND, Label, PlainBg, POSES,
  ScentWaves, ThemedIcon, W, WETSOIL_MOLECULE_LABEL_PT, WETSOIL_VB_W, WetSoilAerosolDiagram,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

const lerp = (a: number, b: number, r: number) => a + (b - a) * r;

/** 냄새를 깊이 들이쉬는 표정 - 고개가 살짝 젖혀지고 눈은 편안하게 감기며 입은 살짝만
 *  벌어진다. 이 화 전용 로컬 포즈(공용 poses.ts에는 등록하지 않는다 - 재사용이
 *  필요해지면 그때 승격한다, 원칙 0). */
const SNIFF: Pose = {
  headTilt: -9, lean: -1,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -44.83, e: -21.29 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
  eyeOpen: 0.18, mouthOpen: 0.06, blush: 1.05,
};

const ACTOR_SIZE = 760;
const ACTOR_GROUND = GROUND;

/* ---------------- S1: 문을 열고 나가 숨을 크게 들이쉰다 (무성) ---------------- */

const S1_DOOR_W = 300;
const S1_DOOR_H = 880;
const S1_DOOR_X = CX - 480;
const S1_DOOR_Y = ACTOR_GROUND - S1_DOOR_H;
const S1_START_CX = S1_DOOR_X + S1_DOOR_W / 2;
const S1_REST_CX = CX + 60;

export const S1StepOut: React.FC<{ f: number }> = ({ f }) => {
  const walkP = smooth(progress(f, 0, 30));
  const cx = lerp(S1_START_CX, S1_REST_CX, walkP);
  const sniffT = progress(f, 26, 56);
  const pose: Pose = blendPose(POSES.idle, SNIFF, sniffT);
  const scentP = progress(f, 32, 60);

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.hill} bottom={C.paper} groundColor={C.browningSoft} floorOpacity={0.7}>
      <DoorFrame width={S1_DOOR_W} height={S1_DOOR_H} x={S1_DOOR_X} y={S1_DOOR_Y} crossProgress={walkP} />
      {/* 젖은 바닥 - 작은 물웅덩이 하나만, 점을 흩뿌리지 않는다 */}
      <ellipse cx={CX + 160} cy={ACTOR_GROUND + 30} rx={150} ry={26} fill={C.waterCool} opacity={0.28} />
      <Actor size={ACTOR_SIZE} centerX={cx} ground={ACTOR_GROUND} pose={pose} />
      {scentP > 0.01 ? (
        <ScentWaves cx={cx} cy={ACTOR_GROUND - 520} angle={-90} count={2} spread={180} progress={scentP} fanDeg={26} color={C.inkSoft} />
      ) : null}
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 16);
  const pose: Pose = blendPose(SNIFF, POSES.shrug, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg ground={null} top={C.hill} bottom={C.paper}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- 흙 다이어그램 공통 배치 (s3~s6) ---------------- */

const DIAG_WIDTH = 700;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 420;
const DIAG_SCALE = DIAG_WIDTH / WETSOIL_VB_W;
const LABEL_SCREEN_X = DIAG_X + WETSOIL_MOLECULE_LABEL_PT.x * DIAG_SCALE;
const LABEL_SCREEN_Y = DIAG_Y + WETSOIL_MOLECULE_LABEL_PT.y * DIAG_SCALE;
/** s6 splash 연출에서 쓰는 표면 충돌 지점의 화면 좌표(ScentWaves 발신원으로 재사용) */
const RAINDROP_X = 360;
const SURFACE_SCREEN_X = DIAG_X + RAINDROP_X * DIAG_SCALE;
const SURFACE_SCREEN_Y = DIAG_Y + 300 * DIAG_SCALE;

/* ---------------- S3: 미생물이 냄새 물질을 만든다 ---------------- */

export const S3Microbe: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const microbeP = progress(f, frames * 0.08, frames * 0.92);
  return (
    <PlainBg ground={null}>
      <WetSoilAerosolDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} microbeProgress={microbeP} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 그 물질의 이름 - 지오스민 ---------------- */

export const S4Name: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const labelP = progress(f, frames * 0.12, frames * 0.36);
  return (
    <PlainBg ground={null}>
      <WetSoilAerosolDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} microbeProgress={1} />
      <Label
        x={LABEL_SCREEN_X} y={LABEL_SCREEN_Y - 120} text={t.s4Label} size={54} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 평소엔 흙 속에 갇혀 있다 (정적 상태) ---------------- */

export const S5Trapped: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const trappedP = progress(f, frames * 0.1, frames * 0.82);
  return (
    <PlainBg ground={null}>
      <WetSoilAerosolDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} microbeProgress={1} trappedProgress={trappedP}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 빗방울 충격 -> 공기방울 파열 -> 냄새 방출 (핵심, 최장 구간) ---------------- */

const S6_SPLASH_START_RATIO = 0.06;
const S6_SPLASH_END_RATIO = 0.94;
const S6_BURST_LOCAL_T = 0.57;

function splashRange(frames: number) {
  const start = frames * S6_SPLASH_START_RATIO;
  const end = frames * S6_SPLASH_END_RATIO;
  return { start, end };
}

/** bubble_pop 효과음을 정확히 파열 프레임에 맞추기 위해 Episode.tsx가 이 함수로
 *  구간 로컬 프레임을 계산한다(원칙 7, general-ep18 s7BurstFrame과 동일 패턴). */
export function s6BurstFrame(frames: number) {
  const { start, end } = splashRange(frames);
  return Math.round(start + S6_BURST_LOCAL_T * (end - start));
}

export const S6Splash: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const { start, end } = splashRange(frames);
  const splashP = progress(f, start, end);
  const releaseWaveP = clamp01((splashP - 0.55) / 0.45);
  return (
    <PlainBg ground={null}>
      <WetSoilAerosolDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} microbeProgress={1} trappedProgress={1}
        splashProgress={splashP} raindropX={RAINDROP_X}
      />
      {releaseWaveP > 0.01 ? (
        <ScentWaves
          cx={SURFACE_SCREEN_X} cy={SURFACE_SCREEN_Y} angle={-90} count={3} spread={260}
          progress={releaseWaveP} fanDeg={34} color={C.inkSoft}
        />
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 다시 냄새를 맡는 만족스러운 표정 (s1·s2와 짝) ---------------- */

export const S7Satisfied: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));
  const scentP = progress(f, 0, 26);
  return (
    <PlainBg ground={null} top={C.hill} bottom={C.paper}>
      <ScentWaves cx={CX} cy={S2_BUST_TOP + 60} angle={-90} count={2} spread={170} progress={scentP} fanDeg={26} color={C.inkSoft} />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={SNIFF} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 이름의 유래 - petrichor, 1964 ---------------- */

const S8_CARD_W = 800;
const S8_CARD_H = 760;
const S8_CARD_X = CX - S8_CARD_W / 2;
const S8_CARD_Y = 500;

export const S8History: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const cardP = progress(f, 6, 26);
  return (
    <PlainBg ground={null}>
      <Card
        x={S8_CARD_X} y={S8_CARD_Y} w={S8_CARD_W} h={S8_CARD_H} progress={cardP}
        label={t.s8Label} labelSize={58}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <ThemedIcon name="droplet" size={140} color={C.coral} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontStyle: 'italic', fontSize: 110, color: C.ink }}>
            {t.s8Term}
          </div>
        </div>
      </Card>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
