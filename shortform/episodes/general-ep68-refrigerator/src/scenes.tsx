/** 이 화(general-ep68, "냉장고 안이 차가워지는 진짜 이유") 전용 장면.
 *
 *  s1(캐릭터가 냉장고 문을 열고 서늘한 바람을 느낌, 립싱크 있음) -> s2(냉장고 단면 다이어그램
 *  리빌, "냉매" 라벨) -> s3(증발기 구간이 부풀며 파란 온도계 급강하, "팽창 -> 온도 뚝") ->
 *  s4(실내 열이 파이프로 빨려 들어감, "열 흡수") -> s5(압축기를 지나며 빨간 온도계 급상승,
 *  "압축 -> 온도 확") -> s6(응축기에서 열 물결이 바깥으로 퍼짐, "열 방출") -> s7(뒷면을 손으로
 *  만지는 클로즈업 + 전체 순환 루프 요약).
 *
 *  이 화의 핵심 그림은 FridgeCycleDiagram(신규, props/에 등록) - s2~s7 내내 같은 x/y/width로
 *  배치해 좌표 앵커가 장면 전환 사이에서 어긋나지 않게 했다(원칙 5). "차갑게 만드는 게 아니라
 *  안의 열을 밖으로 퍼낸다"는 반전이 s6의 열 방출 물결에서 시각적으로 완성된다.
 */
import React from 'react';
import {
  Actor, blendPose, C, Caption, FPS, Label, FridgeCycleDiagram, FRIDGE_BACK_PT, FRIDGE_VB_W,
  GROUND, POSES, PlainBg, ScentWaves, SW, SW_THIN, W, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const smooth = (v: number) => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * S1: 냉장고 문을 열고 서늘한 바람을 느낀다 (립싱크 있음)
 * ================================================================ */

const FRIDGE1_X = 640;
const FRIDGE1_Y = 470;
const FRIDGE1_W = 340;
const FRIDGE1_H = 980;

export const S1Open: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: MouthFile['mouth'];
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const bt = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const doorSwing = smooth(progress(f, 0, 18)) * 8;
  const breezeP = (f % 50) / 50;

  return (
    <PlainBg top={C.room} bottom={C.roomDeep}>
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* 냉장고 본체 */}
        <rect x={FRIDGE1_X} y={FRIDGE1_Y} width={FRIDGE1_W} height={FRIDGE1_H} rx={30} fill={C.paper} stroke={C.ink} strokeWidth={SW} />
        {/* 안쪽 - 문이 살짝 열려 서늘한 빛이 새어나옴 */}
        <rect
          x={FRIDGE1_X + 26} y={FRIDGE1_Y + 40} width={FRIDGE1_W - 52 - doorSwing} height={FRIDGE1_H - 80}
          rx={16} fill={C.water} stroke={C.ink} strokeWidth={SW_THIN} opacity={0.85}
        />
        {/* 손잡이 */}
        <rect x={FRIDGE1_X + FRIDGE1_W - 40 - doorSwing} y={FRIDGE1_Y + 240} width={14} height={110} rx={7} fill={C.inkSoft} />
      </svg>

      <ScentWaves cx={FRIDGE1_X - 10} cy={FRIDGE1_Y + 360} angle={180} count={3} spread={230} progress={breezeP} fanDeg={36} color={C.waterCool} />

      <Actor size={700} centerX={300} ground={GROUND} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S2~S7 공용: 다이어그램 좌표 (전환 사이에도 앵커 고정)
 * ================================================================ */

const DIAG_W = 640;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 430;
const LABEL_Y = DIAG_Y - 70;

/* -------- S2: 파이프 루프 리빌 + "냉매" 라벨 -------- */

export const S2Reveal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const reveal = progress(f, 6, frames - 10);
  const labelP = progress(f, frames * 0.45, frames * 0.7);

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={null}>
      <FridgeCycleDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} revealProgress={reveal} />
      <Label x={CX} y={LABEL_Y} text={t.s2Label} size={52} color={C.ink} style={{ opacity: smooth(labelP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S3: 증발기가 부풀며 파란 온도계 급강하 -------- */

export const S3Expand: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const expand = progress(f, frames * 0.16, frames * 0.86);
  const labelP = progress(f, 6, 26);

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={null}>
      <FridgeCycleDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} revealProgress={1} expandProgress={expand} />
      <Label x={CX} y={LABEL_Y} text={t.s3Label} size={52} color={C.waterCool} style={{ opacity: smooth(labelP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S4: 실내 열이 파이프로 빨려 들어감 -------- */

export const S4Absorb: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const absorb = progress(f, frames * 0.14, frames * 0.88);
  const labelP = progress(f, 6, 26);

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={null}>
      <FridgeCycleDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        revealProgress={1} expandProgress={1} absorbProgress={absorb}
      />
      <Label x={CX} y={LABEL_Y} text={t.s4Label} size={52} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S5: 압축기를 지나며 빨간 온도계 급상승 -------- */

export const S5Compress: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const compress = progress(f, frames * 0.16, frames * 0.86);
  const labelP = progress(f, 6, 26);

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={null}>
      <FridgeCycleDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        revealProgress={1} expandProgress={1} absorbProgress={1} compressProgress={compress}
      />
      <Label x={CX} y={LABEL_Y} text={t.s5Label} size={52} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S6: 응축기에서 열 물결이 바깥으로 퍼짐 (반전의 완성) -------- */

export const S6Release: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const release = progress(f, frames * 0.14, frames * 0.9);
  const labelP = progress(f, 6, 26);

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={null}>
      <FridgeCycleDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        revealProgress={1} expandProgress={1} absorbProgress={1} compressProgress={1} releaseProgress={release}
      />
      <Label x={CX} y={LABEL_Y} text={t.s6Label} size={52} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 뒷면을 손으로 만지는 클로즈업(따뜻함) + 전체 순환 루프 요약
 * ================================================================ */

const HAND_SCALE = DIAG_W / FRIDGE_VB_W;
const BACK_SX = DIAG_X + FRIDGE_BACK_PT.x * HAND_SCALE;
const BACK_SY = DIAG_Y + FRIDGE_BACK_PT.y * HAND_SCALE;

export const S7Summary: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const loop = progress(f, 6, frames - 10);
  const handP = smooth(progress(f, 4, 30));
  const warmP = (f % 46) / 46;
  const labelP = progress(f, 6, 26);

  return (
    <PlainBg top={C.room} bottom={C.roomDeep} ground={null}>
      <FridgeCycleDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        revealProgress={1} expandProgress={1} absorbProgress={1} compressProgress={1} releaseProgress={1}
        loopProgress={loop}
      />
      {/* 손을 대는 동작 - 가볍게, 손가락 없이 둥근 손바닥 형태 하나만 */}
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: handP }}>
        <ScentWaves cx={BACK_SX} cy={BACK_SY} angle={0} count={3} spread={110} progress={warmP} fanDeg={40} color={C.coral} />
        <svg width={160} height={160} style={{ position: 'absolute', left: BACK_SX + 20, top: BACK_SY - 42, overflow: 'visible' }}>
          <ellipse cx={40} cy={42} rx={34} ry={40} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} opacity={0.95} />
        </svg>
      </div>
      <Label x={CX} y={LABEL_Y} text={t.s7Label} size={48} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
