/** 이 화(general-ep98, "한번 접은 종이가 다시는 안 펴지는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트). 캐릭터는 등장하지 않는다(대본 장면표에
 *  캐릭터 언급 없음 - general-ep82·ep94와 같은 전례, 원칙적으로 매 화 강제하지 않는다).
 *
 *  s1(PaperFiberDiagram weaveProgress - 섬유가 얽혀 있는 모습) -> s2(PaperSheetFold
 *  foldProgress로 종이가 접히는 매크로 동작 + 아래 인셋에 PaperFiberDiagram mode=multi로
 *  접힌 선 위 섬유들이 꺾이기 시작하는 확대 - 아직 손상 임계값(0.55) 전) -> s3(같은 섬유가
 *  버틸 수 있는 한계를 넘어 끊어지고 눌리는 것을 mode=single로 확대) -> s4(springBackProgress
 *  - 정상 섬유는 펴지고 손상된 섬유는 그대로) -> s5(PaperSheetFold creaseMarkProgress - 펼친
 *  종이에 자국이 남음) -> s6(손톱으로 눌러 자국을 심화 - PaperSheetFold 자국 위 + 아래
 *  인셋에 PaperFiberDiagram mode=single pressProgress로 추가 손상) -> s7(OrigamiCrane
 *  revealProgress - 종이접기 활용 사례를 가볍게).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시) 반영:
 *   - 섬유는 굵은 선 몇 가닥으로 단순화(PaperFiberDiagram 자체 설계, 촘촘한 잔니 금지).
 *   - 접힌 선 확대 단면에서 섬유가 꺾이고 일부 끊어지는 것을 s2->s3 흐름으로 보여준다.
 *   - 손톱/자로 누르는 s6에서 그 압력이 섬유를 더 많이 끊는 것으로 직접 연결(pressProgress).
 *   - 종이접기 활용은 s7에서 가볍게(정교한 사실 묘사 대신 단순 실루엣).
 *
 *  원칙 7: s2(접히는 순간)·s6(누르는 순간)의 paper_crease SFX 프레임 상수를 여기서
 *  export해 Episode.tsx가 그대로 갖다 쓴다(ep96의 S1_RUSTLE_AT_FRAME 패턴과 동일).
 */
import React from 'react';
import {
  C, COMPARE_LEFT_LABEL_PT, COMPARE_RIGHT_LABEL_PT, Caption, FPS, FS, Label, OrigamiCrane,
  PAPER_FIBER_VB_W, PaperFiberDiagram, PaperSheetFold, PlainBg, W, easeIn, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2; // 540
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 종이 표면 확대 - 섬유가 촘촘히 얽힌 모습
 * ============================================================ */
const S1_W = 760;
const S1_X = CX - S1_W / 2;
const S1_Y = 470;

export const S1Weave: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const weaveP = progress(f, 6, Math.max(30, frames - 24));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PaperFiberDiagram width={S1_W} x={S1_X} y={S1_Y} weaveProgress={weaveP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 종이를 반으로 접는 장면 + 접힌 선 확대(섬유가 꺾이기 시작)
 * ============================================================ */
const S2_SHEET_W = 480;
const S2_SHEET_X = CX - S2_SHEET_W / 2;
const S2_SHEET_Y = 260;
const S2_SHEET_ASPECT = 4 / 3;
const S2_SHEET_BOTTOM = S2_SHEET_Y + S2_SHEET_W * S2_SHEET_ASPECT;
const S2_INSET_W = 400;
const S2_INSET_X = CX - S2_INSET_W / 2;
const S2_INSET_Y = 990;
/** 종이가 거의 다 접힌 순간 - Episode.tsx가 여기에 paper_crease SFX를 놓는다 */
export const S2_CREASE_SFX_FRAME = 96;

export const S2Fold: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const foldP = progress(f, 10, Math.min(100, frames - 30));
  const creaseP = progress(f, 40, Math.min(130, frames - 10)) * 0.5; // 0.55 임계값 전까지만 - 아직 손상 없음

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PaperSheetFold width={S2_SHEET_W} x={S2_SHEET_X} y={S2_SHEET_Y} aspect={S2_SHEET_ASPECT} foldProgress={foldP} />
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line
          x1={CX} y1={S2_SHEET_BOTTOM} x2={CX} y2={S2_INSET_Y}
          stroke={C.ink} strokeWidth={3} strokeDasharray="6 10" opacity={0.35}
        />
      </svg>
      <PaperFiberDiagram width={S2_INSET_W} x={S2_INSET_X} y={S2_INSET_Y} mode="multi" creaseProgress={creaseP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 섬유 하나가 꺾이며 끊어지고(crack) 눌리는(flatten) 애니메이션
 * ============================================================ */
const S3_W = 860;
const S3_X = CX - S3_W / 2;
const S3_Y = 520;

export const S3SingleFiber: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const creaseP = progress(f, 8, Math.max(60, frames - 40));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PaperFiberDiagram width={S3_W} x={S3_X} y={S3_Y} mode="single" creaseProgress={creaseP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 정상 섬유는 펴지고 손상된 섬유는 그대로 (비교)
 * ============================================================ */
const S4_W = 860;
const S4_X = CX - S4_W / 2;
const S4_Y = 460;
const S4_SCALE = S4_W / PAPER_FIBER_VB_W;
const S4_LABEL_Y = S4_Y + COMPARE_LEFT_LABEL_PT.y * S4_SCALE;
const S4_LEFT_X = S4_X + COMPARE_LEFT_LABEL_PT.x * S4_SCALE;
const S4_RIGHT_X = S4_X + COMPARE_RIGHT_LABEL_PT.x * S4_SCALE;

export const S4Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const springP = easeIn(f, FPS, 22);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PaperFiberDiagram width={S4_W} x={S4_X} y={S4_Y} springBackProgress={springP} />
      <Label x={S4_LEFT_X} y={S4_LABEL_Y} text={t.s4NormalLabel} size={FS.small} />
      <Label x={S4_RIGHT_X} y={S4_LABEL_Y} text={t.s4DamagedLabel} size={FS.small} color={C.coral} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 펼친 종이 위에 접힌 선 자국이 남음
 * ============================================================ */
const S5_W = 560;
const S5_X = CX - S5_W / 2;
const S5_Y = 470;
const S5_ASPECT = 4 / 3;

export const S5CreaseMark: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const markP = progress(f, 10, Math.max(50, frames - 30));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PaperSheetFold width={S5_W} x={S5_X} y={S5_Y} aspect={S5_ASPECT} creaseMarkProgress={markP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 손톱/자로 눌러 자국을 심화 - 섬유가 더 많이 끊어짐
 * ============================================================ */
const S6_SHEET_W = 380;
const S6_SHEET_X = CX - S6_SHEET_W / 2;
const S6_SHEET_Y = 250;
const S6_SHEET_ASPECT = 4 / 3;
const S6_INSET_W = 580;
const S6_INSET_X = CX - S6_INSET_W / 2;
const S6_INSET_Y = 800;
/** 손톱이 접힌 선을 다 누른 순간 - Episode.tsx가 여기에 paper_crease SFX를 놓는다 */
export const S6_CREASE_SFX_FRAME = 200;

export const S6Press: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const pressP = progress(f, 60, Math.min(210, frames - 20));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PaperSheetFold width={S6_SHEET_W} x={S6_SHEET_X} y={S6_SHEET_Y} aspect={S6_SHEET_ASPECT} creaseMarkProgress={1} />
      <PaperFiberDiagram
        width={S6_INSET_W} x={S6_INSET_X} y={S6_INSET_Y} mode="single" creaseProgress={1} pressProgress={pressP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 종이접기 활용 사례 (가볍게)
 * ============================================================ */
const S7_W = 760;
const S7_X = CX - S7_W / 2;
const S7_Y = 480;

export const S7Origami: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const revealP = progress(f, 10, Math.max(60, frames - 30));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <OrigamiCrane width={S7_W} x={S7_X} y={S7_Y} revealProgress={revealP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
