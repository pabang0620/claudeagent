/** 이 화(general-ep61, "멍이 시간 지나면 색 변하는 이유") 전용 장면.
 *
 *  s1(팔에 이미 든 멍을 들여다보다 손끝으로 살짝 눌러보는 모습, 무성) -> s2(리액션+훅 질문,
 *  바스트샷) -> s3(단면에서 혈관이 터져 웅덩이가 커지는 모습, BruiseDiagram poolProgress) ->
 *  s4(고인 피가 붉고 퍼렇게 비쳐 보이는 초기 색, BruiseDiagram healProgress 고정) ->
 *  s5(백혈구 2개가 웅덩이 쪽으로 모여드는 모습, BruiseDiagram cellsProgress) ->
 *  s6(색이 빨강/보라에서 초록 쪽으로 바뀜, healProgress 0.2->0.62) -> s7(초록에서 노랑으로,
 *  그리고 옅어짐, healProgress 0.62->1) -> s8(색 순서 카드 4장 + "대략 언제 다쳤을까" 라벨).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 피부를 사실적으로 그리지 않는다(팔/단면을
 *  단순 도형으로만), 멍은 색이 있는 얼룩(웅덩이)으로 표현하고 색소를 점으로 뿌리지
 *  않는다(49화 단풍잎과 같은 접근), 네 단계 색(빨강-보라-초록-노랑)이 인접 단계와 섞여
 *  보이지 않게 뚜렷이 구분한다, 백혈구는 점 무리가 아니라 큰 원 2개로만.
 */
import React from 'react';
import {
  BRUISE_CELL_LABEL_PT, BRUISE_VB_W, BRUISE_VESSEL_PT, BruiseDiagram,
  BustActor, C, Caption, CardGrid, FPS, FS, Label, LIGHT_GREEN, LIGHT_RED, LIGHT_VIOLET, LIGHT_YELLOW,
  PlainBg, POSES, SW_THIN, W,
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
 * S1: 팔에 이미 든 멍을 들여다보다 손끝으로 살짝 눌러본다 (무성)
 * ============================================================ */

const S1_DIAG_WIDTH = 760;
const S1_DIAG_X = CX - S1_DIAG_WIDTH / 2;
/** surface 모드는 정사각 viewBox 안에서 살결 밴드가 가운데 48%만 차지해(위아래로 여백이
 *  큼) cross-section(DIAG_Y=700, 원이 상자를 거의 다 채움)과 같은 y를 쓰면 화면 위쪽이
 *  휑해 보인다(실측 결함 수정). 폭을 키우고(620->760) 밴드 자체가 화면 세로 중앙 근처에
 *  오도록 더 위로 올려 무성 구간의 화면 여백 과다를 줄인다. */
const S1_DIAG_Y = 480;
const S1_SCALE = S1_DIAG_WIDTH / BRUISE_VB_W;
const S1_POOL_CX = S1_DIAG_X + 150 * S1_SCALE;
const S1_POOL_CY = S1_DIAG_Y + 150 * S1_SCALE;
/** 이미 며칠 된 멍이라는 인상을 주는 초기 색(빨강[0]과 보라[0.22] 사이, 붉은보라 톤) */
const S1_HEAL = 0.16;

const S1_FINGER_START = { x: S1_POOL_CX + 260, y: S1_POOL_CY - 380 };
const S1_FINGER_TARGET = { x: S1_POOL_CX + 26, y: S1_POOL_CY - 66 };

/** 손끝(작은 캡슐 하나, 손톱 표시) - ep54 ReachingHand와 같은 원칙(점 무리 아닌 지점 도형
 *  1개, 씬 로컬). 위쪽에서 대각선으로 다가와 멍 위를 살짝 누른다. */
function TouchingFinger({ cx, cy }: { cx: number; cy: number }) {
  return (
    <svg
      width={100} height={150} viewBox="0 0 100 150"
      style={{
        position: 'absolute', left: cx - 50, top: cy - 20, overflow: 'visible',
        transform: 'rotate(18deg)', transformOrigin: '50 20',
      }}
    >
      <rect x={18} y={20} width={64} height={120} rx={32} fill={C.paper} stroke={C.ink} strokeWidth={11} />
      <ellipse cx={50} cy={50} rx={20} ry={24} fill={C.coralSoft} stroke={C.ink} strokeWidth={7} opacity={0.9} />
    </svg>
  );
}

export const S1Look: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const popT = smooth(progress(f, 0, 14));
  const pressT = smooth(progress(f, frames * 0.42, frames * 0.62));
  const fx = S1_FINGER_START.x + (S1_FINGER_TARGET.x - S1_FINGER_START.x) * pressT;
  const fy = S1_FINGER_START.y + (S1_FINGER_TARGET.y - S1_FINGER_START.y) * pressT;
  return (
    <PlainBg>
      <BruiseDiagram
        mode="surface" width={S1_DIAG_WIDTH} x={S1_DIAG_X} y={S1_DIAG_Y}
        healProgress={S1_HEAL} poolProgress={1}
        style={{ opacity: popT, transform: `scale(${0.92 + 0.08 * popT})`, transformOrigin: 'center center' }}
      />
      <TouchingFinger cx={fx} cy={fy} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 리액션 + 훅 질문 (바스트샷, "어, 근데 이 멍 색깔이 계속 바뀌네?")
 * ============================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const puzzleT = smooth(progress(f, 0, 14));
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 공용: BruiseDiagram(cross-section) 고정 배치(s3~s7)
 * ============================================================ */

const DIAG_WIDTH = 560;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 700;
const DIAG_SCALE = DIAG_WIDTH / BRUISE_VB_W;

const VESSEL_LABEL_PT = {
  x: DIAG_X + BRUISE_VESSEL_PT.x * DIAG_SCALE, y: DIAG_Y + BRUISE_VESSEL_PT.y * DIAG_SCALE,
};
const CELL_LABEL_PT = {
  x: DIAG_X + BRUISE_CELL_LABEL_PT.x * DIAG_SCALE, y: DIAG_Y + BRUISE_CELL_LABEL_PT.y * DIAG_SCALE,
};

/* ============================================================
 * S3: 혈관에서 터진 피가 살 속 웅덩이에 고인다
 * ============================================================ */

export const S3Vessel: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const poolT = progress(f, frames * 0.12, frames * 0.85);
  const labelA = progress(f, frames * 0.06, frames * 0.26);
  return (
    <PlainBg>
      <BruiseDiagram mode="cross-section" width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} poolProgress={poolT} healProgress={0.04} />
      <Label x={VESSEL_LABEL_PT.x} y={VESSEL_LABEL_PT.y - 34} text={t.s3Label} size={FS.label} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 고인 피가 처음엔 붉고 퍼렇게 비쳐 보인다
 * ============================================================ */

export const S4InitialColor: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, lines }) => (
  <PlainBg>
    <BruiseDiagram mode="cross-section" width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} poolProgress={1} healProgress={0.2} />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
  </PlainBg>
);

/* ============================================================
 * S5: 백혈구 2개가 웅덩이 쪽으로 모여든다
 * ============================================================ */

export const S5Cells: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const cellsT = progress(f, frames * 0.15, frames * 0.88);
  const labelA = progress(f, frames * 0.55, frames * 0.75);
  return (
    <PlainBg>
      <BruiseDiagram
        mode="cross-section" width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        poolProgress={1} healProgress={0.2} cellsProgress={cellsT}
      />
      <Label x={CELL_LABEL_PT.x} y={CELL_LABEL_PT.y} text={t.s5Label} size={FS.label} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 색이 빨강/보라에서 초록 쪽으로 서서히 바뀐다 (healProgress 0.2 -> 0.62)
 * ============================================================ */

export const S6ToGreen: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const healT = 0.2 + (0.62 - 0.2) * progress(f, frames * 0.05, frames * 0.95);
  return (
    <PlainBg>
      <BruiseDiagram
        mode="cross-section" width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        poolProgress={1} healProgress={healT} cellsProgress={1}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 초록빛을 거쳐 노르스름한 색으로, 그리고 서서히 사라진다 (healProgress 0.62 -> 1)
 * ============================================================ */

export const S7ToYellow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const healT = 0.62 + (1 - 0.62) * progress(f, frames * 0.05, frames * 0.95);
  return (
    <PlainBg>
      <BruiseDiagram
        mode="cross-section" width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        poolProgress={1} healProgress={healT} cellsProgress={1}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 색 순서 카드 4장 (빨강 -> 보라 -> 초록 -> 노랑) + "대략 언제 다쳤을까"
 * ============================================================ */

const S8_CARD_SIZE = 200;
const S8_CARD_GAP = 24;
const S8_CARD_Y = 780;
const S8_SWATCH = 108;

const S8_CARDS = [
  { key: 'red', color: LIGHT_RED, label: t.s8Red },
  { key: 'purple', color: LIGHT_VIOLET, label: t.s8Purple },
  { key: 'green', color: LIGHT_GREEN, label: t.s8Green },
  { key: 'yellow', color: LIGHT_YELLOW, label: t.s8Yellow },
] as const;

function s8CardX() {
  const total = S8_CARDS.length * S8_CARD_SIZE + (S8_CARDS.length - 1) * S8_CARD_GAP;
  return CX - total / 2;
}

export const S8Order: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const noteA = progress(f, frames * 0.55, frames * 0.78);
  return (
    <PlainBg>
      <CardGrid
        items={S8_CARDS.map((c) => ({
          key: c.key,
          label: c.label,
          art: (
            <div
              style={{
                width: S8_SWATCH, height: S8_SWATCH, borderRadius: S8_SWATCH / 2,
                background: c.color, border: `${SW_THIN}px solid ${C.ink}`,
              }}
            />
          ),
        }))}
        x={s8CardX()} y={S8_CARD_Y} size={S8_CARD_SIZE} gap={S8_CARD_GAP} columns={4}
        appearAt={(i) => 6 + i * 10} frame={f}
      />
      <Label
        x={CX} y={S8_CARD_Y + S8_CARD_SIZE + 46} text={t.s8Note} size={FS.small} color={C.inkSoft}
        style={{ opacity: clamp01(noteA) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
