/** 이 화(general-ep24, "자석이 서로 붙는 이유") 전용 장면.
 *
 *  s1(무성, 책상 위 자석 두 개가 저절로 끌려 붙음) -> s2(리액션+훅 질문) -> s3(전자 정렬 ->
 *  자석이 되는 과정) -> s4(N-S 자기장 흐름이 반대 극을 향해 이어지며 서로 끌어당김) ->
 *  s5(결론, 별도 그래픽 없이 s4의 최종 상태를 유지한 채 자막만) -> s6(지구도 하나의
 *  자석 - 나침반 바늘이 북쪽을 가리킴).
 */
import React from 'react';
import {
  BarMagnet, BustActor, C, Caption, CompassNeedle, FPS, H, Label, MagnetDiagram,
  PlainBg, POSES, ThemedIcon, W,
  blendPose, clamp01, easeIn, mouthAt, mouthProp, progress, shake,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const lerp = (a: number, b: number, ratio: number) => a + (b - a) * ratio;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- S1: 책상 위 자석 두 개가 저절로 끌려 붙는다 (무성) ---------------- */

/** 화면 중앙에 크게 배치한다(다른 다이어그램 씬들과 비슷한 세로 점유 비율 - 작은 막대
 *  두 개만 화면 하단에 놓으면 위쪽이 텅 비어 보인다는 builder 원칙 5 체크리스트 대응) */
const S1_MAG_W = 440;
const S1_MAG_H = 220;
const S1_MAG_CY = 950;
const S1_A_CX = CX - S1_MAG_W / 2;
const S1_TOUCH_B_CX = S1_A_CX + S1_MAG_W;
const S1_START_B_CX = S1_TOUCH_B_CX + 260;
const S1_ARRIVE_DELAY = 8;
const S1_SNAP_AT = 34;

/** 자석 아래 옅은 그림자 - "표면 위에 놓여 있다"는 느낌만 주는 최소 장치 */
function DeskShadow({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  return <ellipse cx={cx} cy={cy} rx={w * 0.42} ry={w * 0.07} fill={C.ink} opacity={0.1} />;
}

export const S1Snap: React.FC<{ f: number }> = ({ f }) => {
  const arrive = clamp01(easeIn(f, FPS, S1_ARRIVE_DELAY));
  const bCx = lerp(S1_START_B_CX, S1_TOUCH_B_CX, arrive) + shake(f, S1_SNAP_AT, 10, 5, 2.4);
  const shadowY = S1_MAG_CY + S1_MAG_H / 2 + 20;
  return (
    <PlainBg ground={null}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <DeskShadow cx={S1_A_CX} cy={shadowY} w={S1_MAG_W} />
        <DeskShadow cx={bCx} cy={shadowY} w={S1_MAG_W} />
        <BarMagnet cx={S1_A_CX} cy={S1_MAG_CY} w={S1_MAG_W} h={S1_MAG_H} labelSize={120} />
        <BarMagnet cx={bCx} cy={S1_MAG_CY} w={S1_MAG_W} h={S1_MAG_H} labelSize={120} />
      </svg>
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
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 전자들이 무질서한 방향 -> 정렬 -> 하나의 큰 자석 ---------------- */

const DIAG_WIDTH = 780;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 420;

export const S3Align: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const alignP = progress(f, frames * 0.08, frames * 0.86);
  const labelP = progress(f, frames * 0.7, frames * 0.9);
  return (
    <PlainBg ground={null}>
      <MagnetDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} alignProgress={alignP} />
      <Label
        x={CX} y={DIAG_Y - 70} text={t.s3Label} size={54} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: N -> S 자기장 흐름이 반대 극을 향해 이어지며 끌어당긴다 ---------------- */

export const S4Attract: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const fieldP = progress(f, frames * 0.04, frames * 0.34);
  const attractRaw = progress(f, frames * 0.4, frames * 0.94);
  const attractP = f > frames * 0.32 ? attractRaw : undefined;
  return (
    <PlainBg ground={null}>
      <MagnetDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        fieldFlowProgress={fieldP} attractProgress={attractP}
      />
      <Label x={CX} y={DIAG_Y - 70} text={t.s4Label} size={54} color={C.ink} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론 - 새 그래픽 없이 s4의 최종 상태를 유지, 자막만 ---------------- */

export const S5Conclusion: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => (
  <PlainBg ground={null}>
    <MagnetDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} fieldFlowProgress={1} attractProgress={1} />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
  </PlainBg>
);

/* ---------------- S6: 지구도 하나의 자석 - 나침반 바늘이 북쪽을 가리킨다 ---------------- */

const S6_GLOBE_SIZE = 320;
const S6_GLOBE_CX = CX - 220;
const S6_GLOBE_CY = 760;
const S6_COMPASS_SIZE = 400;
const S6_COMPASS_CX = CX + 210;
const S6_COMPASS_CY = 780;

export const S6Earth: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const globeP = progress(f, frames * 0.03, frames * 0.22);
  const compassP = progress(f, frames * 0.16, frames * 0.36);
  const settleP = progress(f, frames * 0.32, frames * 0.82);
  const angle = lerp(-58, 0, smooth(settleP));
  const labelP = progress(f, frames * 0.06, frames * 0.24);
  return (
    <PlainBg ground={null}>
      <div
        style={{
          position: 'absolute',
          left: S6_GLOBE_CX - S6_GLOBE_SIZE / 2, top: S6_GLOBE_CY - S6_GLOBE_SIZE / 2,
          opacity: smooth(globeP), transform: `scale(${0.5 + 0.5 * smooth(globeP)})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="world" size={S6_GLOBE_SIZE} color={C.ink} />
      </div>
      {compassP > 0.01 ? (
        <svg
          width={S6_COMPASS_SIZE} height={S6_COMPASS_SIZE}
          viewBox={`0 0 ${S6_COMPASS_SIZE} ${S6_COMPASS_SIZE}`}
          style={{
            position: 'absolute',
            left: S6_COMPASS_CX - S6_COMPASS_SIZE / 2, top: S6_COMPASS_CY - S6_COMPASS_SIZE / 2,
            opacity: smooth(compassP), transform: `scale(${0.5 + 0.5 * smooth(compassP)})`, transformOrigin: '50% 50%',
          }}
        >
          <CompassNeedle cx={S6_COMPASS_SIZE / 2} cy={S6_COMPASS_SIZE / 2} size={S6_COMPASS_SIZE - 20} angleDeg={angle} />
        </svg>
      ) : null}
      <Label
        x={CX} y={S6_GLOBE_CY + S6_GLOBE_SIZE / 2 + 130} text={t.s6Label} size={54} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
