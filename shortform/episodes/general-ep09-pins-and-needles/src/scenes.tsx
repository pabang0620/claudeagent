/** 이 화(general-ep09, "다리 저릴 때 찌릿한 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher가 넘기는 구간 로컬 프레임 f를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props로만 받는다).
 *
 *  전 장면이 밝고 캐주얼한 단색 배경(PlainBg) 위에서 진행되는 단일 톤의 화라, 배경을 한 번에
 *  처리하는 로컬 `Scene` 래퍼를 두고 모든 씬이 재사용한다(REGISTRY 규칙 2 - 에피소드 전용
 *  조합, 라이브러리 등록 불필요. PlainBg 자체는 이미 공용 자산).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  AnalogClock, Actor, BustActor, C, Caption, FPS, FS, GROUND, Label, LegNerveDiagram,
  PlainBg, POSES, QMark, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

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

/* ---------------- 다이어그램 공용 레이아웃 (S3~S5) ---------------- */

const DIAGRAM_WIDTH = 620;
const DIAGRAM_X = CX - DIAGRAM_WIDTH / 2;
const DIAGRAM_Y = 330;
const LABEL_Y = 1300;

/* ---------------- S1: 오래 눌리는 모습 (무성, 훅) ---------------- */

/** s1의 압박이 완전히 가라앉는 프레임(로컬). Episode.tsx가 이 프레임 근처에 hop_thump
 *  SFX를 맞춰 재생한다 - 두 파일이 같은 상수를 공유해 "애니메이션 정점 프레임에 정확히
 *  맞춘다"(원칙 7)를 손으로 맞추지 않고 보장한다. */
export const S1_COMPRESS_LAND_FRAME = 50;

export const S1Press: React.FC<{ f: number }> = ({ f }) => {
  const compressProgress = progress(f, 4, S1_COMPRESS_LAND_FRAME);
  return (
    <Scene>
      <LegNerveDiagram
        f={f} width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y} compressProgress={compressProgress}
      />
    </Scene>
  );
};

/* ---------------- S2: 놀란 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const BUST_SIZE = 950;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 430;

export const S2Surprised: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 10);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <Scene>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S3: 눌려 있으면 신호가 옅어짐 ---------------- */

export const S3Weaken: React.FC<{
  f: number; lines: CaptionLine[]; label: string;
}> = ({ f, lines, label }) => {
  const labelOpacity = progress(f, 6, 20);
  return (
    <Scene>
      <LegNerveDiagram f={f} width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y} compressProgress={1} />
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S4: 눌림이 풀리며 불균일하게 튐 ---------------- */

export const S4Release: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const compressProgress = 1 - progress(f, 0, Math.max(10, frames * 0.45));
  const releaseProgress = progress(f, frames * 0.15, frames * 0.85);
  const labelOpacity = progress(f, frames * 0.2, frames * 0.32);
  return (
    <Scene>
      <LegNerveDiagram
        f={f} width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y} compressProgress={compressProgress}
        releaseProgress={releaseProgress}
      />
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S5: 양반다리 - 왜 하필 이 자세인지 ---------------- */

export const S5CrossLegged: React.FC<{
  f: number; lines: CaptionLine[]; label: string;
}> = ({ f, lines, label }) => {
  const compressProgress = 0.85 * progress(f, 0, 12);
  const labelOpacity = progress(f, 6, 20);
  return (
    <Scene>
      <LegNerveDiagram
        f={f} width={DIAGRAM_WIDTH} x={DIAGRAM_X} y={DIAGRAM_Y} compressProgress={compressProgress}
      />
      <div style={{ opacity: labelOpacity }}>
        <Label x={CX} y={LABEL_Y} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S6: 이마에 십자 긋기 - 민간요법 (속설 표시 필수, 원칙 1-2) ---------------- */

const QMARK_SIZE = 130;
const QMARK_X = CX + 260;
const QMARK_Y = 380;

export const S6FolkTrick: React.FC<{
  f: number; lines: CaptionLine[]; label: string;
}> = ({ f, lines, label }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.touchForehead, t);
  const qmarkT = progress(f, 10, 24);
  const labelOpacity = progress(f, 16, 30);
  return (
    <Scene>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} />
      {/* 물음표 배지: 이 내용이 검증된 사실이 아니라 "그런 얘기가 있다"는 속설임을
          화면에서도 명시한다(shortform-planner 원칙 1-2 가드레일). transform·opacity를
          QMark 자신의 style에 직접 얹는다 - 부모 div에 transform을 주면 그 div가
          position:absolute 자식의 containing block이 되어 QMark의 left/top 좌표가
          어긋난다. */}
      <QMark
        size={QMARK_SIZE}
        style={{
          left: QMARK_X, top: QMARK_Y, opacity: qmarkT,
          transform: `scale(${0.6 + 0.4 * qmarkT})`, transformOrigin: '50% 50%',
        }}
      />
      <div style={{ opacity: labelOpacity }}>
        <Label
          x={CX} y={1310} text={label} size={FS.label} color={C.ink} align="center" wrapWidth={860}
        />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S7: 약 1분 후 - 시계 타임랩스 + 안정 ---------------- */

const CLOCK_WIDTH = 420;
const CLOCK_X = CX - CLOCK_WIDTH / 2;
const CLOCK_Y = 360;
const ACTOR_SIZE = 760;

export const S7Recovery: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const settleT = progress(f, 0, frames);
  const pose: Pose = blendPose(POSES.surprised, POSES.idle, settleT);
  // 초침만 빠르게 여러 바퀴 돌려 "짧은 시간 타임랩스"를 표현한다(시침/분침은 실제로는
  // 1분 안팎이라 거의 안 움직이므로 굳이 돌리지 않는다 - 과장된 오해를 막는다).
  const secondDeg = progress(f, 0, frames) * 360 * 6;
  const labelOpacity = progress(f, 4, 16);
  return (
    <Scene>
      <div style={{ opacity: labelOpacity }}>
        <AnalogClock width={CLOCK_WIDTH} x={CLOCK_X} y={CLOCK_Y} hourDeg={40} minuteDeg={210} secondDeg={secondDeg} />
        <Label x={CX} y={CLOCK_Y + CLOCK_WIDTH + 40} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
