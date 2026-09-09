/** 이 화(general-ep55, "바다가 하루 두 번 들어왔다 나가는 이유") 전용 장면.
 *
 *  s1(무성 - 해변 타임랩스, ShoreLevel 수위선이 서서히 내려가며 모래사장이 드러남) ->
 *  s2(리액션+훅 "왜 벌써 이렇게 빠졌지", 바스트샷 - 립싱크 연결) -> s3(TideDiagram
 *  bulgeNearProgress 단독 - 달 쪽 바다가 볼록해짐) -> s4(TideDiagram bulgeFarProgress,
 *  bulgeNearProgress=1 유지 - 반대쪽도 대칭으로 볼록해짐) -> s5(TideDiagram rotateProgress -
 *  자전 핀이 두 볼록한 자리를 하루 두 번 지나감) -> s6(ShoreLevel 소형 패널 2개 - 밀물/썰물
 *  용어 정리) -> s7(TideDiagram alignProgress - 해-달-지구 일직선, 사리로 팽대가 더 커짐).
 *
 *  이 화의 핵심 그림은 TideDiagram/ShoreLevel(신규, props/에 등록) - REGISTRY 확인 완료,
 *  조석·해안 수위 소품이 라이브러리에 없어 새로 만들었다. 오케스트레이터 지시대로 지구·달을
 *  사실적으로 그리지 않고 단순한 원+표면색 구분만 쓰고, 힘은 굵은 화살표 2개로만, 해변
 *  수위는 수위선 하나의 높낮이로만 표현한다. s3~s5·s7은 "우주에서 본 지구" 구도라 NightSkyBg
 *  (moon/horizon 없이 별만)를 쓰고, 어두운 배경에서 캐릭터·다이어그램이 묻히지 않도록
 *  TideDiagram의 stroke를 C.cream으로, Caption을 dark로 override했다(42화에서 어두운
 *  배경에 묻힌 적이 있어 예방 - 원칙 5 예방 체크리스트).
 */
import React from 'react';
import {
  BustActor, C, Caption, FPS, Label, NightSkyBg, PlainBg, ShoreLevel, ThemedIcon,
  TideDiagram, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2; // 540
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: Record<string, number[]> }

/* ================================================================
 * S1: 무성 - 해변 타임랩스. 수위선이 서서히 내려가며 모래사장이 드러난다.
 * ================================================================ */

export const S1Shore: React.FC<{ f: number }> = ({ f }) => {
  const lv = 1 - 0.85 * smooth(progress(f, 6, 84));
  return <ShoreLevel width={W} level={lv} frame={f} />;
};

/* ================================================================
 * S2: 리액션 - "어, 아까는 여기까지 물이 차 있었는데 왜 벌써 이렇게 빠졌지" (바스트샷, 립싱크)
 * ================================================================ */

const S2_SIZE = 900;
const S2_LEFT = CX - S2_SIZE / 2;
const S2_TOP = 420;

const LOOK_DOWN_POSE: Pose = {
  headTilt: 8, lean: 3,
  armL: { s: 60, e: 34 }, armR: { s: -46, e: -84 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
  eyeOpen: 1.1,
};

export const S2Question: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  const reactT = smooth(progress(f, 0, frames * 0.4));
  const pose = blendPose({}, LOOK_DOWN_POSE, reactT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.sky} bottom={C.goldSoft} groundColor={C.gold}>
      <BustActor size={S2_SIZE} left={S2_LEFT} top={S2_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3 / S4 / S5 / S7 공용: 우주에서 본 지구 - TideDiagram (어두운 배경)
 * ================================================================ */

const DIAG_W = 780;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 520;
const LABEL_Y = 360;

function SpaceStage({
  f, children, label,
}: { f: number; children: React.ReactNode; label?: string }) {
  return (
    <>
      <NightSkyBg stars={44} seed={11} frame={f} moon={null} horizon={null} />
      {children}
      {label ? <Label x={CX} y={LABEL_Y} text={label} size={54} color={C.cream} /> : null}
    </>
  );
}

/* ---- S3: 달 쪽 바다가 볼록해진다 ---- */
export const S3BulgeNear: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const nP = smooth(progress(f, frames * 0.08, frames * 0.85));
  const labelOp = progress(f, frames * 0.62, frames * 0.8);
  return (
    <SpaceStage f={f} label={labelOp > 0.01 ? t.s3Label : undefined}>
      <TideDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} bulgeNearProgress={nP} stroke={C.cream} mutedStroke={C.nightSoft} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </SpaceStage>
  );
};

/* ---- S4: 반대쪽 바다도 똑같이 볼록해진다 (bulgeNear=1 유지) ---- */
export const S4BulgeFar: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const fP = smooth(progress(f, frames * 0.1, frames * 0.85));
  const labelOp = progress(f, frames * 0.62, frames * 0.8);
  return (
    <SpaceStage f={f} label={labelOp > 0.01 ? t.s4Label : undefined}>
      <TideDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        bulgeNearProgress={1} bulgeFarProgress={fP} stroke={C.cream} mutedStroke={C.nightSoft}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </SpaceStage>
  );
};

/* ---- S5: 지구가 자전하며 이 볼록한 자리를 하루 두 번 지나간다 ---- */
export const S5Rotate: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const rP = progress(f, frames * 0.04, frames * 0.96);
  const labelOp = progress(f, frames * 0.82, frames * 0.94);
  return (
    <SpaceStage f={f} label={labelOp > 0.01 ? t.s5Label : undefined}>
      <TideDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        bulgeNearProgress={1} bulgeFarProgress={1} rotateProgress={rP}
        stroke={C.cream} mutedStroke={C.nightSoft}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </SpaceStage>
  );
};

/* ================================================================
 * S6: 밀물 · 썰물 용어 정리 (ShoreLevel 소형 패널 2개, 밝은 배경)
 * ================================================================ */

const S6_PANEL_W = 380;
const S6_LEFT_X = CX - S6_PANEL_W - 20;
const S6_RIGHT_X = CX + 20;
const S6_PANEL_Y = 480;
const S6_ICON_Y = S6_PANEL_Y - 118;
const S6_TEXT_Y = S6_PANEL_Y - 52;

export const S6Terms: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const inLv = 0.22 + 0.62 * smooth(progress(f, frames * 0.1, frames * 0.6));
  const outLv = 0.84 - 0.62 * smooth(progress(f, frames * 0.1, frames * 0.6));

  return (
    <PlainBg top={C.sky} bottom={C.goldSoft} groundColor={C.gold}>
      <Label x={CX} y={230} text={t.s6Label} size={60} color={C.ink} weight={800} />

      <div style={{ position: 'absolute', left: S6_LEFT_X, top: S6_ICON_Y }}>
        <ThemedIcon name="arrow-up" size={72} color={C.coral} strokePx={12} />
      </div>
      <Label x={S6_LEFT_X + S6_PANEL_W / 2} y={S6_TEXT_Y} text={t.s6In} size={42} color={C.ink} />
      <ShoreLevel width={S6_PANEL_W} x={S6_LEFT_X} y={S6_PANEL_Y} level={inLv} frame={f} />

      <div style={{ position: 'absolute', left: S6_RIGHT_X + S6_PANEL_W - 72, top: S6_ICON_Y }}>
        <ThemedIcon name="arrow-down" size={72} color={C.waterCool} strokePx={12} />
      </div>
      <Label x={S6_RIGHT_X + S6_PANEL_W / 2} y={S6_TEXT_Y} text={t.s6Out} size={42} color={C.ink} />
      <ShoreLevel width={S6_PANEL_W} x={S6_RIGHT_X} y={S6_PANEL_Y} level={outLv} frame={f} />

      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 해-달-지구가 일직선으로 나란히 놓이는 날 - 사리 (TideDiagram alignProgress)
 * ================================================================ */

export const S7Align: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const aP = smooth(progress(f, frames * 0.06, frames * 0.9));
  const labelOp = progress(f, frames * 0.78, frames * 0.92);
  return (
    <SpaceStage f={f} label={labelOp > 0.01 ? t.s7Label : undefined}>
      <TideDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} alignProgress={aP} stroke={C.cream} mutedStroke={C.nightSoft} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </SpaceStage>
  );
};
