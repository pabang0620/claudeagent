/** 이 화(general-ep09, "다리 눌렸다 풀리면 찌릿한 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher가 넘기는 구간 로컬 프레임 f를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props로만 받는다).
 *
 *  전 장면이 밝고 캐주얼한 단색 배경(PlainBg) 위에서 진행되는 단일 톤의 화라, 배경을 한 번에
 *  처리하는 로컬 `Scene` 래퍼를 두고 모든 씬이 재사용한다(REGISTRY 규칙 2 - 에피소드 전용
 *  조합, 라이브러리 등록 불필요. PlainBg 자체는 이미 공용 자산).
 *
 *  v3: 신규 S3BloodMyth("피 때문?" 팝인 -> 취소선 -> 페이드아웃)을 추가하며 구 S3~S7을
 *  S4~S8로 재번호했다. 취소선 연출은 ep14(general-ep14-meat-browning-maillard) s2
 *  "산소 때문?" 패턴을 그대로 재사용한다(원칙 0) - StrikeLabel을 이 화 로컬로 복제하되
 *  좌표 계산 로직은 손대지 않았다. ep14에서 실측된 영어판 두 줄 줄바꿈 버그(취소선이
 *  첫 줄에만 그어짐)를 막기 위해 whiteSpace:'nowrap'을 유지한다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  AnalogClock, Actor, BustActor, C, Caption, FONT, FPS, FS, GROUND, Label, LegNerveDiagram,
  PlainBg, POSES, QMark, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

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

/* ---------------- 다이어그램 공용 레이아웃 (S4~S6) ---------------- */

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

/* ---------------- 취소선 라벨 (ep14 general-ep14 S2Oxygen 패턴 재사용, 원칙 0) ---------------- */

const STRIKE_COLOR = '#FF6B5B';

const StrikeLabel: React.FC<{ text: string; strike: number; size: number }> = ({ text, strike, size }) => (
  <span
    style={{
      position: 'relative', display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: size,
      color: C.ink, whiteSpace: 'nowrap',
    }}
  >
    {text}
    <span
      style={{
        position: 'absolute', left: 0, top: '54%', height: 8, borderRadius: 4,
        width: `${clamp01(strike) * 100}%`, background: STRIKE_COLOR,
        transform: 'translateY(-50%)', boxShadow: '0 0 12px rgba(255,107,91,0.7)',
      }}
    />
  </span>
);

/* ---------------- S3(신규): "피 때문?" 팝인 -> 취소선 -> 페이드아웃 (통념 반박) ---------------- */

export const S3BloodMyth: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const popP = progress(f, 2, Math.round(frames * 0.28));
  const strikeP = progress(f, Math.round(frames * 0.34), Math.round(frames * 0.6));
  const fadeOut = progress(f, Math.round(frames * 0.74), Math.round(frames * 0.92));
  const scale = 0.7 + 0.3 * popP;
  return (
    <Scene>
      <div
        style={{
          position: 'absolute', left: '50%', top: 780, transform: `translateX(-50%) scale(${scale})`,
          opacity: popP * (1 - fadeOut),
        }}
      >
        <StrikeLabel text={label} strike={strikeP} size={92} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S4(구 S3): 눌려 있으면 신호가 옅어짐 ---------------- */

export const S4Weaken: React.FC<{
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

/* ---------------- S5(구 S4): 눌림이 풀리며 불균일하게 튐 ---------------- */

export const S5Release: React.FC<{
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

/* ---------------- S6(구 S5): 양반다리 - 왜 하필 이 자세인지 ---------------- */

export const S6CrossLegged: React.FC<{
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

/* ---------------- S7(구 S6): 이마에 십자 긋기 - 민간요법 (속설 표시 필수, 원칙 1-2) ---------------- */

/** 이 씬은 일반 바스트샷(BUST_SIZE=950, BUST_TOP=430)보다 캐릭터를 작고 높게 배치한다 -
 *  기본 크기 그대로 쓰면 캐릭터 하반신(BUST_VIEWBOX 크롭 기준 골반 부근)이 아래쪽 라벨·
 *  자막 박스와 겹친다(육안 검수로 발견, v1). */
const S7_BUST_SIZE = 780;
const S7_BUST_LEFT = (W - S7_BUST_SIZE) / 2;
const S7_BUST_TOP = 250;
const QMARK_SIZE = 120;
const QMARK_X = CX + 220;
const QMARK_Y = 300;
const S7_LABEL_Y = S7_BUST_TOP + S7_BUST_SIZE + 60;

export const S7FolkTrick: React.FC<{
  f: number; lines: CaptionLine[]; label: string;
}> = ({ f, lines, label }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.touchForehead, t);
  const qmarkT = progress(f, 10, 24);
  const labelOpacity = progress(f, 16, 30);
  return (
    <Scene>
      <BustActor size={S7_BUST_SIZE} left={S7_BUST_LEFT} top={S7_BUST_TOP} pose={pose} />
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
          x={CX} y={S7_LABEL_Y} text={label} size={FS.small} color={C.ink} align="center" wrapWidth={820}
        />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S8(구 S7): 약 1분 후 - 시계 타임랩스 + 안정 ---------------- */

const CLOCK_WIDTH = 420;
const CLOCK_X = CX - CLOCK_WIDTH / 2;
const CLOCK_Y = 360;
const ACTOR_SIZE = 760;

export const S8Recovery: React.FC<{
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
        {/* 라벨을 시계 "아래"(캐릭터 머리 높이와 겹침, 육안 검수로 발견)가 아니라 "위"
            안전영역(SAFE_TOP=240) 바로 아래에 둔다 - 캐릭터 머리가 시계 바로 밑에서
            시작해 그 자리엔 라벨이 들어갈 틈이 없다. */}
        <Label x={CX} y={250} text={label} size={FS.label} color={C.ink} align="center" />
        <AnalogClock width={CLOCK_WIDTH} x={CLOCK_X} y={CLOCK_Y} hourDeg={40} minuteDeg={210} secondDeg={secondDeg} />
      </div>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
