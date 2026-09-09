/** 이 화(general-ep35, "그 무거운 비행기가 하늘에 뜨는 이유") 전용 장면.
 *
 *  s1(무성, 활주로에서 여객기가 가속하다 하늘로 떠오름) -> s2(리액션+훅 질문, 저 무거운 게
 *  어떻게 뜨는지 궁금해함) -> s3(날개 밑을 지나는 공기가 받음각 때문에 아래로 꺾임) ->
 *  s4(그 반작용으로 공기가 날개를 위로 밀어올림, 대칭 화살표) -> s5(결론, 별도 그래픽 없이
 *  자막만) -> s6(위/아래 공기가 동시에 날개 끝에 도착하지 않는다는 정정 사실, 장식 컷).
 */
import React from 'react';
import {
  AirplaneSide, AirplaneWingDiagram, BustActor, C, Caption, FPS, Label, PlainBg, POSES,
  W, blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const lerp = (a: number, b: number, r: number) => a + (b - a) * r;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- S1: 활주로에서 가속하다 이륙한다 (무성) ---------------- */

const RUNWAY_Y = 1540;
const PLANE_WIDTH = 600;

/** PlainBg의 children은 svg 없는 일반 HTML 컨텍스트라, bare <g>는 렌더되지 않는다(실측
 *  확인: 렌더된 프레임에 구름이 전혀 안 보임). 자체 <svg>로 감싼 독립 오버레이로 고친다. */
function CloudPuff({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  const w = rx * 2.4;
  const h = ry * 2.4;
  return (
    <svg
      width={w} height={h} viewBox={`${-rx * 1.2} ${-ry * 1.2} ${w} ${h}`}
      style={{ position: 'absolute', left: cx - rx * 1.2, top: cy - ry * 1.2, overflow: 'visible' }}
    >
      <g opacity={0.6}>
        <ellipse cx={-rx * 0.4} cy={ry * 0.2} rx={rx * 0.55} ry={ry * 0.75} fill={C.paper} />
        <ellipse cx={rx * 0.42} cy={ry * 0.22} rx={rx * 0.6} ry={ry * 0.8} fill={C.paper} />
        <ellipse cx={0} cy={-ry * 0.14} rx={rx * 0.68} ry={ry * 0.86} fill={C.paper} />
      </g>
    </svg>
  );
}

export const S1Takeoff: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const rollP = smooth(progress(f, 0, frames * 0.6));
  const liftP = smooth(progress(f, frames * 0.52, frames));
  const posX = lerp(-460, W * 0.42, rollP) + lerp(0, 300, liftP);
  const posY = RUNWAY_Y - PLANE_WIDTH * 0.24 - liftP * 420;
  const angle = liftP * 13;

  return (
    <PlainBg top={C.sky} bottom={C.hillFar} ground={RUNWAY_Y} groundColor={C.hill} floorOpacity={0.5}>
      <CloudPuff cx={220} cy={340} rx={130} ry={46} />
      <CloudPuff cx={840} cy={520} rx={100} ry={38} />
      <AirplaneSide width={PLANE_WIDTH} x={posX} y={posY} angle={angle} />
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷, 놀람) ---------------- */

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
    <PlainBg top={C.sky} bottom={C.hillFar} ground={RUNWAY_Y} groundColor={C.hill}>
      <CloudPuff cx={180} cy={300} rx={110} ry={40} />
      <AirplaneSide width={360} x={720} y={200} angle={6} style={{ opacity: 0.55 }} />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- 공용: 날개 다이어그램 배치(s3, s4, s6 고정 카메라) ---------------- */

const DIAG_WIDTH = 900;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 380;
/** 다이어그램 위쪽 빈 공간(날개 형상은 로컬 y~266부터 시작)에 라벨을 둔다 - 공기줄·화살표와
 *  겹치지 않는 유일한 안전지대(원칙: 라벨이 도형·흐름선에 가려지지 않게 한다) */
const S3_LABEL_PT = { x: CX, y: DIAG_Y + 40 };
const S4_LABEL_PT = { x: CX, y: DIAG_Y + 40 };
const S6_LABEL_PT = { x: CX, y: DIAG_Y + 40 };

/* ---------------- S3: 날개 밑 공기가 아래로 꺾인다 ---------------- */

export const S3Deflect: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const deflectProgress = progress(f, frames * 0.08, frames * 0.9);
  const labelA = progress(f, frames * 0.45, frames * 0.6);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <AirplaneWingDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} deflectProgress={deflectProgress} />
      <Label x={S3_LABEL_PT.x} y={S3_LABEL_PT.y} text={t.s3Label} size={56} color={C.inkSoft} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 반작용으로 날개가 위로 밀린다 ---------------- */

export const S4Reaction: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const reactionProgress = progress(f, frames * 0.12, frames * 0.85);
  const labelA = progress(f, frames * 0.5, frames * 0.65);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <AirplaneWingDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        deflectProgress={1} reactionProgress={reactionProgress}
      />
      <Label x={S4_LABEL_PT.x} y={S4_LABEL_PT.y} text={t.s4Label} size={56} color={C.coral} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론(별도 그래픽 없이 자막만) ---------------- */

export const S5Conclusion: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, lines,
}) => (
  <PlainBg top={C.sky} bottom={C.hillFar} ground={null}>
    <CloudPuff cx={260} cy={520} rx={140} ry={50} />
    <CloudPuff cx={780} cy={760} rx={110} ry={42} />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
  </PlainBg>
);

/* ---------------- S6: 위/아래 공기가 동시에 도착하지 않는다(정정, 장식 컷) ---------------- */

export const S6Simultaneity: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const simultaneityCompare = progress(f, frames * 0.1, frames * 0.92);
  const labelA = progress(f, frames * 0.72, frames * 0.85);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <AirplaneWingDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} simultaneityCompare={simultaneityCompare} />
      <Label x={S6_LABEL_PT.x} y={S6_LABEL_PT.y} text={t.s6Label} size={56} color={C.inkSoft} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
