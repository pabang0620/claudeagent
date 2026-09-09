/** 이 화(general-ep22, "햇빛은 흰색인데 하늘이 파란 이유") 전용 장면.
 *
 *  s1(무성, 하늘을 올려다봄) -> s2(리액션+훅 질문) -> s3(햇빛이 무지개색으로 갈라짐)
 *  -> s4(갈라진 빛이 알갱이에 부딪혀 파란빛만 사방으로 흩어짐) -> s5(흩어진 파란빛이
 *  하늘 전체에서 눈으로 모여듦) -> s6(하늘색이 낮->노을로 전환) -> s7(노을엔 빛이 대기를
 *  길게 통과하며 파란빛이 먼저 다 흩어지고 빨간빛만 남음) -> s8(보라색이 더 잘 흩어지지만
 *  눈은 파란색을 더 잘 느낌).
 *
 *  대본의 "화면 문자" 열이 전 구간 "(없음)"이라 이 화는 제목 카드를 빼면 화면에 문구를
 *  전혀 띄우지 않는다 - 색 자체와 화살(방향이 읽히는 산란 표현)로만 전달한다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, LightScatterDiagram, LIGHT_BLUE, LIGHT_RED, LIGHT_VIOLET,
  PlainBg, POSES, PopIn, SavannaBg, ThemedIcon, W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose, ScatterPoint } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 노을 하늘 색(SavannaBg 기본 낮 톤과 확실히 대비되도록 따뜻한 주황~빨강 계열로 잡았다) */
const SUNSET_TOP = '#E3673F';
const SUNSET_BOTTOM = '#FFD79A';

/** LightScatterDiagram 의 viewBox(700) 좌표를 화면 좌표로 옮긴다(수렴점에 눈 아이콘을
 *  겹쳐 그릴 때 씀 - 두 컴포넌트가 같은 상수를 눈대중으로 다시 맞추지 않게 한다) */
function vb2screen(pt: ScatterPoint, boxX: number, boxY: number, boxWidth: number): ScatterPoint {
  return { x: boxX + (pt.x / 700) * boxWidth, y: boxY + (pt.y / 700) * boxWidth };
}

const DIAG_WIDTH = 820;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 430;

/* ---------------- S1: 하늘을 올려다본다 (무성) ---------------- */

const LOOK_UP_POSE: Pose = { ...POSES.idle, headTilt: -14 };
const S1_ACTOR_SIZE = 900;

export const S1LookUp: React.FC<{ f: number }> = () => (
  <>
    <SavannaBg sun />
    <Actor size={S1_ACTOR_SIZE} centerX={CX} pose={LOOK_UP_POSE} />
  </>
);

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.pointUp, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <>
      <SavannaBg sun />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </>
  );
};

/* ---------------- S3: 햇빛이 프리즘처럼 무지개색으로 갈라진다 ---------------- */

export const S3Split: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const splitP = progress(f, frames * 0.06, frames * 0.85);
  return (
    <PlainBg ground={null}>
      <LightScatterDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} splitProgress={splitP} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 갈라진 빛이 알갱이에 부딪혀 파란빛만 사방으로 튄다 ---------------- */

const S4_PATH_FROM: ScatterPoint = { x: 350, y: 70 };
const S4_PATH_TO: ScatterPoint = { x: 350, y: 610 };
const S4_ORIGIN: ScatterPoint = { x: 350, y: 340 };

export const S4Scatter: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const pathP = progress(f, frames * 0.02, frames * 0.3);
  const scatterP = progress(f, frames * 0.26, frames * 0.92);
  return (
    <PlainBg ground={null}>
      <LightScatterDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        pathFrom={S4_PATH_FROM} pathTo={S4_PATH_TO} pathProgress={pathP} surviveColor={C.gold}
        scatterProgress={scatterP} scatterOrigins={[S4_ORIGIN]} scatterColor={LIGHT_BLUE}
        scatterArrowLength={130}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 하늘 전체에서 흩어진 파란빛이 눈으로 모여든다 ---------------- */

const S5_ORIGINS: ScatterPoint[] = [
  { x: 90, y: 110 }, { x: 250, y: 60 }, { x: 420, y: 90 }, { x: 580, y: 130 }, { x: 630, y: 260 },
];
const S5_CONVERGE: ScatterPoint = { x: 350, y: 560 };

export const S5Converge: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const scatterP = progress(f, frames * 0.08, frames * 0.85);
  const eyeP = progress(f, frames * 0.55, frames * 0.9);
  const eyeScreen = vb2screen(S5_CONVERGE, DIAG_X, DIAG_Y, DIAG_WIDTH);
  return (
    <PlainBg ground={null}>
      <LightScatterDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        scatterProgress={scatterP} scatterOrigins={S5_ORIGINS} scatterColor={LIGHT_BLUE}
        convergeTo={S5_CONVERGE}
      />
      <PopIn cx={eyeScreen.x} cy={eyeScreen.y} size={140} progress={eyeP} fromScale={0.4}>
        <ThemedIcon name="eye" size={140} color={LIGHT_BLUE} bg={C.paper} />
      </PopIn>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 하늘색이 낮 -> 노을로 전환 ---------------- */

export const S6SunsetShift: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const shiftP = progress(f, frames * 0.1, frames * 0.9);
  return (
    <>
      <SavannaBg sun />
      <div style={{ position: 'absolute', inset: 0, opacity: shiftP }}>
        <SavannaBg sun skyTop={SUNSET_TOP} skyBottom={SUNSET_BOTTOM} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </>
  );
};

/* ---------------- S7: 노을엔 빛이 대기를 길게 통과 -> 파란빛 먼저 사라지고 빨간빛만 남음 ---------------- */

const S7_PATH_FROM: ScatterPoint = { x: 40, y: 520 };
const S7_PATH_TO: ScatterPoint = { x: 660, y: 560 };
function lerpPt(a: ScatterPoint, b: ScatterPoint, t: number): ScatterPoint {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
const S7_ORIGINS: ScatterPoint[] = [0.18, 0.4, 0.62, 0.82].map((t) => lerpPt(S7_PATH_FROM, S7_PATH_TO, t));

export const S7LongPath: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const pathP = progress(f, frames * 0.04, frames * 0.94);
  const scatterP = progress(f, frames * 0.16, frames * 0.94);
  return (
    <>
      <SavannaBg skyTop={SUNSET_TOP} skyBottom={SUNSET_BOTTOM} sun={false} />
      <LightScatterDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        pathFrom={S7_PATH_FROM} pathTo={S7_PATH_TO} pathProgress={pathP}
        scatterProgress={scatterP} scatterOrigins={S7_ORIGINS} scatterColor={LIGHT_BLUE}
        scatterArrowLength={70} surviveColor={LIGHT_RED}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </>
  );
};

/* ---------------- S8: 보라색이 더 잘 흩어지지만, 눈은 파란색을 더 잘 느낀다 ---------------- */

const S8_BOX_W = 460;
const S8_VIOLET_X = 50;
const S8_BLUE_X = W - S8_BOX_W - 50;
const S8_BOX_Y = 460;
const S8_ORIGIN: ScatterPoint = { x: 350, y: 260 };
const S8_EYE_TARGET: ScatterPoint = { x: 350, y: 600 };

export const S8VioletBlue: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const violetP = progress(f, frames * 0.05, frames * 0.55);
  const blueP = progress(f, frames * 0.3, frames * 0.8);
  const eyeP = progress(f, frames * 0.62, frames * 0.92);
  const eyeGlow = clamp01((blueP - 0.4) / 0.6);
  const eyeScreen = vb2screen(S8_EYE_TARGET, S8_BLUE_X, S8_BOX_Y, S8_BOX_W);
  return (
    <PlainBg ground={null}>
      <LightScatterDiagram
        width={S8_BOX_W} x={S8_VIOLET_X} y={S8_BOX_Y}
        scatterProgress={violetP} scatterOrigins={[S8_ORIGIN]} scatterColor={LIGHT_VIOLET}
        scatterArrowCount={11} scatterArrowLength={210}
      />
      <LightScatterDiagram
        width={S8_BOX_W} x={S8_BLUE_X} y={S8_BOX_Y}
        scatterProgress={blueP} scatterOrigins={[S8_ORIGIN]} scatterColor={LIGHT_BLUE}
        convergeTo={S8_EYE_TARGET} scatterArrowCount={5}
      />
      <PopIn cx={eyeScreen.x} cy={eyeScreen.y} size={130} progress={eyeP} fromScale={0.4}>
        <ThemedIcon
          name="eye" size={130}
          color={eyeGlow > 0.5 ? LIGHT_BLUE : C.inkSoft} bg={C.paper}
        />
      </PopIn>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
