/** 이 화(general-ep65, "쌍둥이도 지문이 다른 이유") 전용 장면.
 *
 *  s1(잉크 스탬프에 손끝을 찍어 지문을 남기고 들여다봄, 무성) -> s2(리액션+훅 질문,
 *  바스트샷) -> s3(손끝 피부 단면, 표피/진피 라벨 소개, growProgress 고정 낮은값) ->
 *  s4(growProgress 0->1, 경계가 물결치는 굴곡 패턴으로 자리 잡음) -> s5(자궁 속 손끝
 *  클로즈업 + 미세한 흐름·압력이 스치는 연출) -> s6(쌍둥이 두 캐릭터 + 서로 다른 지문
 *  카드 비교) -> s7(지문 무늬 클로즈업으로 마무리).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 지문은 소용돌이·활 모양 등 큰 곡선 패턴으로
 *  단순하게(촘촘한 융선 금지 - FingerprintSwirl), 피부층은 굵은 곡선 두 겹으로만
 *  (FingerprintFormationDiagram), 손가락 끝은 단순한 도형으로 크게.
 */
import React from 'react';
import {
  BustActor, C, Caption, CardGrid, FP_FORM_DERMIS_PT, FP_FORM_EPI_PT, FP_FORM_VB_H, FP_FORM_VB_W,
  FPS, FS, Finger, FingerprintFormationDiagram, FingerprintSwirl, Label, PlainBg, POSES, SW_THIN, W,
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
 * S1: 잉크 스탬프에 손끝을 찍어 지문을 남기고 들여다본다 (무성)
 * ============================================================ */

const S1_CARD_W = 360;
const S1_CARD_H = 280;
const S1_CARD_X = CX - S1_CARD_W / 2;
const S1_CARD_Y = 900;
const S1_PRINT_CX = CX;
const S1_PRINT_CY = S1_CARD_Y + S1_CARD_H / 2;
const S1_PRINT_W = 220;

/** 손끝(작은 캡슐 하나 + 손톱, 씬 로컬) - ep61 TouchingFinger와 같은 원칙(점 무리 아닌
 *  지점 도형 1개). 위에서 대각선으로 다가와 카드 위를 눌러 지문을 남긴다. */
function PressFinger({ cx, cy }: { cx: number; cy: number }) {
  return (
    <svg
      width={120} height={180} viewBox="0 0 120 180"
      style={{
        position: 'absolute', left: cx - 60, top: cy - 24, overflow: 'visible',
        transform: 'rotate(14deg)', transformOrigin: '60 24',
      }}
    >
      <rect x={22} y={24} width={76} height={140} rx={38} fill={C.paper} stroke={C.ink} strokeWidth={12} />
      <ellipse cx={60} cy={58} rx={24} ry={29} fill={C.coralSoft} stroke={C.ink} strokeWidth={7} opacity={0.9} />
    </svg>
  );
}

export const S1Stamp: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const popT = smooth(progress(f, 0, 14));
  const moveT = smooth(progress(f, frames * 0.06, frames * 0.42));
  const liftT = smooth(progress(f, frames * 0.62, frames * 0.86));
  const start = { x: S1_PRINT_CX + 240, y: S1_PRINT_CY - 440 };
  const press = { x: S1_PRINT_CX - 4, y: S1_PRINT_CY - 78 };
  const lifted = { x: S1_PRINT_CX + 90, y: S1_PRINT_CY - 460 };
  const fx = moveT < 1
    ? start.x + (press.x - start.x) * moveT
    : press.x + (lifted.x - press.x) * liftT;
  const fy = moveT < 1
    ? start.y + (press.y - start.y) * moveT
    : press.y + (lifted.y - press.y) * liftT;
  const printT = smooth(progress(f, frames * 0.4, frames * 0.62));
  const zoomT = smooth(progress(f, frames * 0.82, frames));
  return (
    <PlainBg>
      <div
        style={{
          position: 'absolute', left: S1_CARD_X, top: S1_CARD_Y, width: S1_CARD_W, height: S1_CARD_H,
          background: C.paper, border: `${SW_THIN}px solid ${C.ink}`, borderRadius: 32,
          opacity: popT, transform: `scale(${0.92 + 0.08 * popT}) scale(${1 + 0.07 * zoomT})`,
          transformOrigin: 'center center',
        }}
      />
      <div
        style={{
          position: 'absolute', left: S1_PRINT_CX, top: S1_PRINT_CY,
          transform: `scale(${1 + 0.1 * zoomT})`, transformOrigin: '0 0',
        }}
      >
        <FingerprintSwirl width={S1_PRINT_W} x={-S1_PRINT_W / 2} y={-S1_PRINT_W / 2} variantSeed={1} drawProgress={printT} />
      </div>
      {liftT < 1 || moveT < 1 ? <PressFinger cx={fx} cy={fy} /> : null}
    </PlainBg>
  );
};

/* ============================================================
 * S2: 리액션 + 훅 질문 (바스트샷, "이 무늬, 왜 사람마다 다 다르게 생긴 거지?")
 * ============================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const puzzleT = smooth(progress(f, 0, 14));
  const pose: Pose = blendPose(POSES.idle, POSES.thinking, puzzleT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 공용: FingerprintFormationDiagram 고정 배치(s3~s4)
 * ============================================================ */

const DIAG_WIDTH = 640;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 680;
const DIAG_SCALE = DIAG_WIDTH / FP_FORM_VB_W;
const DIAG_HEIGHT = DIAG_WIDTH * (FP_FORM_VB_H / FP_FORM_VB_W);

const EPI_LABEL_PT = { x: DIAG_X + FP_FORM_EPI_PT.x * DIAG_SCALE, y: DIAG_Y - 56 };
const DERMIS_LABEL_PT = { x: DIAG_X + FP_FORM_DERMIS_PT.x * DIAG_SCALE, y: DIAG_Y + DIAG_HEIGHT + 60 };

/* ============================================================
 * S3: 손끝 피부 단면 - 표피/진피 소개 (경계는 아직 거의 평평)
 * ============================================================ */

export const S3Layers: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const labelA = progress(f, frames * 0.1, frames * 0.32);
  return (
    <PlainBg>
      <FingerprintFormationDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} growProgress={0.04} />
      <Label x={EPI_LABEL_PT.x} y={EPI_LABEL_PT.y} text={t.s3Epidermis} size={FS.label} style={{ opacity: labelA }} />
      <Label
        x={DERMIS_LABEL_PT.x} y={DERMIS_LABEL_PT.y} text={t.s3Dermis} size={FS.label}
        style={{ opacity: labelA }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 두 층이 자라는 속도 차이로 경계가 굴곡진 패턴으로 자리 잡는다
 * ============================================================ */

export const S4Grow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const growT = progress(f, frames * 0.08, frames * 0.92);
  return (
    <PlainBg>
      <FingerprintFormationDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} growProgress={growT} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 자궁 속 손끝 클로즈업 위로 미세한 흐름·압력이 스친다
 * ============================================================ */

const S5_FINGER_WIDTH = 460;
const S5_FINGER_X = CX - S5_FINGER_WIDTH / 2;
const S5_FINGER_Y = 620;

/** 스치는 흐름/압력 화살표 3개 - 고정 좌표·고정 타이밍(무작위 아님, 원칙 3).
 *  각자 rise(등장) -> hold -> fall(소멸)의 삼각 envelope로 "스치듯" 지나간다. */
const FLOW_ARROWS = [
  { from: { x: CX - 300, y: 760 }, to: { x: CX - 90, y: 900 }, riseAt: 0.05, fallAt: 0.3 },
  { from: { x: CX + 260, y: 700 }, to: { x: CX + 50, y: 830 }, riseAt: 0.32, fallAt: 0.58 },
  { from: { x: CX - 210, y: 1080 }, to: { x: CX + 20, y: 970 }, riseAt: 0.55, fallAt: 0.84 },
] as const;

function arrowEnvelope(f: number, frames: number, riseAt: number, fallAt: number): number {
  const riseStart = frames * riseAt;
  const riseEnd = riseStart + frames * 0.1;
  const fallStart = frames * fallAt - frames * 0.06;
  const fallEnd = frames * fallAt;
  if (f < riseStart) return 0;
  if (f < riseEnd) return progress(f, riseStart, riseEnd);
  if (f < fallStart) return 1;
  if (f < fallEnd) return 1 - progress(f, fallStart, fallEnd);
  return 0;
}

function FlowArrow({ from, to, t: a }: { from: { x: number; y: number }; to: { x: number; y: number }; t: number }) {
  if (a <= 0.01) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const drawLen = len * Math.min(1, a * 1.3);
  const ex = from.x + ux * drawLen;
  const ey = from.y + uy * drawLen;
  const headSize = 16;
  const px = -uy;
  const py = ux;
  return (
    <svg
      width={W} height={1920}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      <path
        d={`M ${from.x} ${from.y} L ${ex} ${ey}`}
        stroke={C.waterCool} strokeWidth={9} strokeLinecap="round" opacity={a}
      />
      <path
        d={`M ${ex + px * headSize - ux * headSize} ${ey + py * headSize - uy * headSize} L ${ex + ux * 8} ${ey + uy * 8} L ${ex - px * headSize - ux * headSize} ${ey - py * headSize - uy * headSize} Z`}
        fill={C.waterCool} opacity={a}
      />
    </svg>
  );
}

export const S5Flow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const labelA = progress(f, frames * 0.5, frames * 0.7);
  return (
    <PlainBg top={C.water} bottom={C.sky} stop={0.5}>
      <Finger
        width={S5_FINGER_WIDTH} wrinkle={0}
        style={{ position: 'absolute', left: S5_FINGER_X, top: S5_FINGER_Y }}
      />
      {FLOW_ARROWS.map((arrow, i) => (
        <FlowArrow key={i} from={arrow.from} to={arrow.to} t={arrowEnvelope(f, frames, arrow.riseAt, arrow.fallAt)} />
      ))}
      <Label x={CX} y={330} text={t.s5Flow} size={FS.label} color={C.inkSoft} style={{ opacity: clamp01(labelA) }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 일란성 쌍둥이 두 캐릭터 + 서로 다른 지문 카드 비교
 * ============================================================ */

const S6_BUST_SIZE = 480;
const S6_GAP = 40;
const S6_LEFT_BUST_LEFT = CX - S6_GAP / 2 - S6_BUST_SIZE;
const S6_RIGHT_BUST_LEFT = CX + S6_GAP / 2;
const S6_BUST_TOP = 340;

const S6_CARD_SIZE = 380;
const S6_CARD_GAP = 40;
const S6_CARD_Y = 1010;
const S6_PRINT_SIZE = 220;

function s6CardX() {
  const total = 2 * S6_CARD_SIZE + S6_CARD_GAP;
  return CX - total / 2;
}

export const S6Twins: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const popT = smooth(progress(f, 0, 16));
  const titleA = progress(f, 4, 20);
  return (
    <PlainBg>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: popT }}>
        <BustActor size={S6_BUST_SIZE} left={S6_LEFT_BUST_LEFT} top={S6_BUST_TOP} pose={POSES.idle} blinkOffset={0} />
        <BustActor size={S6_BUST_SIZE} left={S6_RIGHT_BUST_LEFT} top={S6_BUST_TOP} pose={POSES.idle} blinkOffset={40} />
      </div>
      <Label x={CX} y={252} text={t.s6Compare} size={FS.label} style={{ opacity: clamp01(titleA) }} />
      <CardGrid
        items={[
          {
            key: 'twinA',
            art: (
              <div style={{ position: 'relative', width: S6_PRINT_SIZE, height: S6_PRINT_SIZE }}>
                <FingerprintSwirl width={S6_PRINT_SIZE} x={0} y={0} variantSeed={2} drawProgress={1} />
              </div>
            ),
          },
          {
            key: 'twinB',
            art: (
              <div style={{ position: 'relative', width: S6_PRINT_SIZE, height: S6_PRINT_SIZE }}>
                <FingerprintSwirl width={S6_PRINT_SIZE} x={0} y={0} variantSeed={7} drawProgress={1} />
              </div>
            ),
          },
        ]}
        x={s6CardX()} y={S6_CARD_Y} size={S6_CARD_SIZE} gap={S6_CARD_GAP} columns={2}
        appearAt={(i) => 10 + i * 10} frame={f}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 지문 무늬 클로즈업으로 마무리
 * ============================================================ */

const S7_PRINT_SIZE = 640;

export const S7Close: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const zoomT = smooth(progress(f, 0, frames));
  const scale = 0.94 + 0.14 * zoomT;
  return (
    <PlainBg>
      <FingerprintSwirl
        width={S7_PRINT_SIZE} x={CX - S7_PRINT_SIZE / 2} y={780 - S7_PRINT_SIZE / 2}
        variantSeed={3} drawProgress={1}
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
