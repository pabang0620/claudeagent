/** 이 화(general-ep12, "나이 들수록 시간이 빨리 가는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher가 넘기는 구간 로컬 프레임 f를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props로만 받는다).
 *
 *  s4~s6은 같은 CompareBars 좌표(BARS_X/BARS_Y/ROW_GAP 등)를 공유해, 5살(20%) 막대가
 *  s4에서 자라난 뒤 s5에서 20살(5%)·50살(2%) 막대가 순서대로 더해지고, s6에서는 세 막대가
 *  전부 이미 자란 채로 정지 컷처럼 보이게 한다(원칙 0 - CompareBars 컴포넌트 자체는 무변경,
 *  items 배열의 `at`만 화면별로 다르게 준다). 이미 다 자란 막대는 `at`을 아주 작은 음수로
 *  줘서(스프링이 scene 시작 프레임에 이미 수렴한 상태) 팝인 없이 바로 정지 상태로 보이게 한다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, Appear, BarItem, BustActor, C, Caption, CompareBars, FPS, FS, GROUND, Label,
  PlainBg, POSES, Sparkles, SpeechBubble, StepCounter, ThemedIcon, W, blendPose, mouthAt,
  mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- 공용 배경 래퍼 ---------------- */

const Scene: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <PlainBg />
    {children}
  </AbsoluteFill>
);

/** StepCounter 래퍼. width 고정 + whiteSpace: nowrap 을 항상 같이 준다(원칙 5 예방 체크리스트 -
 *  숫자가 2~3줄로 깨지거나 화면 밖으로 잘리는 걸 막는다). */
const StepCounterFlip: React.FC<{ x: number; y: number; steps: number[]; frame: number }> = ({
  x, y, steps, frame,
}) => (
  <StepCounter
    x={x} y={y} steps={steps} frame={frame} size={110} color={C.ink} width={220} align="center"
    style={{ whiteSpace: 'nowrap' }}
  />
);

const SpeechBubbleWithIcon: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <SpeechBubble x={x} y={y} r={r} shape="round" tail="bottomLeft" bg={C.paper} border={C.ink}>
    <ThemedIcon name="calendar" size={110} color={C.coral} />
  </SpeechBubble>
);

/* ---------------- CompareBars 공용 좌표 (S4~S6 공유) ---------------- */

const BARS_X = 170;
const BARS_Y = 520;
const ROW_GAP = 160;
const LABEL_GAP = 44;
const THICKNESS = 40;
const PX_PER_UNIT = 26;
const MIN_LENGTH = 36;
/** 이미 자란 막대를 정지 상태로 보이려고 쓰는 값. frame(로컬) - at 이 커서 스프링이
 *  scene 시작(f=0) 시점에 이미 수렴해 있다 - 팝인 애니메이션 없이 바로 고정된 것처럼 보인다. */
const ALREADY_GROWN_AT = -200;

/* ---------------- S1: 5살 - 여름방학이 길게 느껴짐 (첫 막대 1개) ---------------- */

const S1_ACTOR_SIZE = 800;
const S1_BAR_Y = 460;
const S1_LABEL_Y = 380;

export const S1Cheer: React.FC<{ f: number; lines: CaptionLine[]; label: string }> = ({ f, lines, label }) => {
  const t = progress(f, 0, 10);
  const pose = blendPose(POSES.idle, POSES.cheer, t);
  const labelOpacity = progress(f, 2, 16);
  return (
    <Scene>
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={S1_LABEL_Y} text={label} size={40} color={C.ink} align="center" wrapWidth={860} />
      </div>
      <CompareBars
        x={BARS_X} y={S1_BAR_Y} pxPerUnit={PX_PER_UNIT} labelGap={LABEL_GAP} frame={f}
        items={[{ value: 20, at: 6, color: C.coral, thickness: 44 }]}
        minLength={MIN_LENGTH}
      />
      <Actor size={S1_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 - 달력이 빠르게 넘어감 (바스트샷, 립싱크) ---------------- */

const BUST_SIZE = 900;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 470;
const CAL_SIZE = 240;
const CAL_X = CX + 40;
const CAL_Y = 340;

export const S2Calendar: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const t = progress(f, 0, 10);
  const pose = blendPose(POSES.idle, POSES.thinking, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const iconOpacity = progress(f, 4, 14);
  // 12번 빠르게 페이지가 넘어간다 - 화 길이(frames)에 비례해 간격을 잡아 언어별 길이가
  // 달라도 같은 리듬으로 보이게 한다.
  const FLIP_COUNT = 12;
  const gap = Math.max(3, Math.floor((frames * 0.7) / FLIP_COUNT));
  const steps = Array.from({ length: FLIP_COUNT }, (_, i) => 10 + i * gap);
  return (
    <Scene>
      <div style={{ opacity: iconOpacity }}>
        <ThemedIcon
          name="calendar" size={CAL_SIZE} color={C.coral}
          style={{ position: 'absolute', left: CAL_X - CAL_SIZE / 2, top: CAL_Y }}
        />
      </div>
      <StepCounterFlip x={CAL_X} y={CAL_Y + CAL_SIZE * 0.3} steps={steps} frame={f} />
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S3: 100년 넘은 오래된 이론 (옅은 세피아 회상, 바스트샷) ---------------- */

const HISTORY_ICON_SIZE = 130;
const HISTORY_ICON_X = CX;
const HISTORY_ICON_Y = 300;
const S3_LABEL_Y = 470;

export const S3History: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>; label: string;
}> = ({ f, lines, mouth, label }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's3', f));
  const sepiaAmt = progress(f, 0, 15) * 0.5;
  const iconP = progress(f, 6, 20);
  const labelOpacity = progress(f, 14, 28);
  return (
    <div style={{ position: 'absolute', inset: 0, filter: `sepia(${sepiaAmt}) saturate(${1 - sepiaAmt * 0.35})` }}>
      <Scene>
        <Appear progress={iconP} from="scale" origin="50% 50%">
          <ThemedIcon
            name="history" size={HISTORY_ICON_SIZE} color={C.ink}
            style={{ position: 'absolute', left: HISTORY_ICON_X - HISTORY_ICON_SIZE / 2, top: HISTORY_ICON_Y }}
          />
        </Appear>
        <div style={{ opacity: labelOpacity }}>
          <Label x={CX} y={S3_LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" wrapWidth={860} />
        </div>
        <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={POSES.thinking} mouthOpen={mouthOpen} />
        <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
      </Scene>
    </div>
  );
};

/* ---------------- S4: 카메라가 물러나고 - 첫 막대(5살)가 새 자리에서 자란다 ---------------- */

const SIDE_ACTOR_SIZE = 520;
const SIDE_ACTOR_X = 800;

export const S4BarsStart: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.thinking, POSES.idle, t);
  const items: BarItem[] = [
    { value: 20, at: 6, color: C.coral, thickness: THICKNESS },
  ];
  return (
    <Scene>
      <CompareBars
        x={BARS_X} y={BARS_Y} pxPerUnit={PX_PER_UNIT} rowGap={ROW_GAP} labelGap={LABEL_GAP}
        frame={f} items={items} minLength={MIN_LENGTH} labelSize={40}
      />
      <Actor size={SIDE_ACTOR_SIZE} centerX={SIDE_ACTOR_X} ground={GROUND} pose={pose} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S5: 20살·50살 막대가 순서대로 더해진다 ---------------- */

export const S5BarsGrow: React.FC<{
  f: number; lines: CaptionLine[]; bar1: string; bar2: string; bar3: string;
}> = ({ f, lines, bar1, bar2, bar3 }) => {
  const items: BarItem[] = [
    { label: bar1, value: 20, at: ALREADY_GROWN_AT, color: C.coral, thickness: THICKNESS },
    { label: bar2, value: 5, at: 8, color: C.coral, thickness: THICKNESS },
    { label: bar3, value: 2, at: 36, color: C.coral, thickness: THICKNESS },
  ];
  return (
    <Scene>
      <CompareBars
        x={BARS_X} y={BARS_Y} pxPerUnit={PX_PER_UNIT} rowGap={ROW_GAP} labelGap={LABEL_GAP}
        frame={f} items={items} minLength={MIN_LENGTH} labelSize={40}
      />
      <Actor size={SIDE_ACTOR_SIZE} centerX={SIDE_ACTOR_X} ground={GROUND} pose={POSES.idle} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S6: 캐릭터가 중앙으로 - 세 막대가 남은 정지 컷 ---------------- */

const CENTER_ACTOR_SIZE = 420;

export const S6Compare: React.FC<{
  f: number; lines: CaptionLine[]; bar1: string; bar2: string; bar3: string;
}> = ({ f, lines, bar1, bar2, bar3 }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.shrug, t);
  const items: BarItem[] = [
    { label: bar1, value: 20, at: ALREADY_GROWN_AT, color: C.coral, thickness: THICKNESS },
    { label: bar2, value: 5, at: ALREADY_GROWN_AT, color: C.coral, thickness: THICKNESS },
    { label: bar3, value: 2, at: ALREADY_GROWN_AT, color: C.coral, thickness: THICKNESS },
  ];
  return (
    <Scene>
      <CompareBars
        x={BARS_X} y={BARS_Y} pxPerUnit={PX_PER_UNIT} rowGap={ROW_GAP} labelGap={LABEL_GAP}
        frame={f} items={items} minLength={MIN_LENGTH} labelSize={40}
      />
      <Actor size={CENTER_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S7: 덧붙임 이야기 - 말풍선(달력+반짝임) + "이야기?" 태그 ---------------- */

const S7_ACTOR_SIZE = 620;
const S7_ACTOR_X = 360;
const BUBBLE_X = 860;
const BUBBLE_Y = 480;
const BUBBLE_R = 140;

export const S7Story: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; tag: string; storyTag: string;
}> = ({ f, frames, lines, tag, storyTag }) => {
  const bubbleP = progress(f, 4, 18);
  const sparkleT = progress(f, 12, 36);
  const tagIn = progress(f, frames * 0.16, frames * 0.3);
  const tagOut = progress(f, frames * 0.82, frames * 0.94);
  const tagP = tagIn * (1 - tagOut);
  return (
    <Scene>
      <Appear progress={bubbleP} from="scale">
        <SpeechBubbleWithIcon x={BUBBLE_X} y={BUBBLE_Y} r={BUBBLE_R} />
      </Appear>
      {sparkleT > 0.001 ? (
        <Sparkles box={{ x: BUBBLE_X - 130, y: BUBBLE_Y - 130, w: 260, h: 260 }} t={sparkleT} scale={0.9} />
      ) : null}
      <div style={{ opacity: tagP }}>
        <Label
          x={BUBBLE_X} y={BUBBLE_Y + BUBBLE_R + 40} text={tag} size={38} color={C.ink} align="center"
          wrapWidth={440}
        />
        <Label
          x={BUBBLE_X} y={BUBBLE_Y + BUBBLE_R + 130} text={storyTag} size={34} color={C.paper} align="center"
          style={{ background: C.coral, border: `4px solid ${C.ink}`, borderRadius: 999, padding: '8px 30px' }}
        />
      </div>
      <Actor size={S7_ACTOR_SIZE} centerX={S7_ACTOR_X} ground={GROUND} pose={POSES.idle} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
