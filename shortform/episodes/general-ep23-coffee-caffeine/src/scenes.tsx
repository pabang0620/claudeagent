/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(무성 - 하품하다 커피를 한 모금 마심) -> s2(리액션+훅 "왜 이러지?")
 *  -> s3(아데노신이 서서히 쌓임) -> s4(카페인이 자리를 대신 차지함)
 *  -> s5(졸음 신호가 막힘) -> s6(핵심 결론, 그래픽 정지) -> s7(효과가 떨어지면 몰려옴)
 *
 *  s3~s5·s7은 같은 CaffeineReceptorDiagram 을 같은 화면 위치(DIAG_X/DIAG_Y/DIAG_W)에 그려
 *  "같은 수용체 자리"라는 연속성을 시각적으로 유지한다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CaffeineReceptorDiagram, FONT, FPS, FS, NerveSignal, PlainBg, POSES,
  PopIn, PulseRing, QMark, RECEPTOR_SOCKET_PT, RECEPTOR_VB_W, ThemedIcon,
  blendPose, buildPeakRelease, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 화면에 떠 있는 라벨. position+opacity+transform 을 한 div 에 결합해 `Appear` 안에 absolute
 *  자식을 넣는 함정(REGISTRY 4절 주의문)을 피한다(ep19/ep21과 동일 패턴). s3/s4 라벨에 쓴다. */
function popLabelStyle(x: number, y: number, p: number): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `translate(-50%, ${(1 - cp) * -14}px) scale(${0.85 + 0.15 * cp})`,
    opacity: cp, fontFamily: FONT, fontWeight: 800, fontSize: FS.label, color: C.ink,
    whiteSpace: 'nowrap', wordBreak: 'keep-all',
  };
}

/* ---------------- S1: 무성 - 하품하다 커피를 한 모금 마신다 ---------------- */

export const S1_TOTAL_FRAMES = 90; // 3.0초(30fps) - Episode.tsx 의 S1_DURATION_SEC 이 이 값을 그대로 쓴다

const S1_ACTOR_SIZE = 700;
const S1_ACTOR_CX = 540;

const S1_YAWN_START = 4, S1_YAWN_BUILD = 18, S1_YAWN_PEAK = 14, S1_YAWN_RELEASE = 18;
// buildEnd=22, peakEnd=36 -> 정점 구간 [22,36] 중간
export const S1_YAWN_SFX_FRAME = 29;

const S1_LIFT_START = 46, S1_LIFT_END = 66;
const S1_SIP_START = 60, S1_SIP_BUILD = 10, S1_SIP_PEAK = 10, S1_SIP_RELEASE = 10;
// buildEnd=70, peakEnd=80 -> 정점 구간 [70,80] 중간
export const S1_SIP_SFX_FRAME = 75;

const S1_CUP_PARK = { x: 620, y: 1160 };
const S1_CUP_MOUTH = { x: 610, y: 860 };

function yawnMouth(env: number) {
  return 0.45 + 0.55 * clamp01(env);
}

export const S1Sip: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const yawnEnv = buildPeakRelease(f, S1_YAWN_START, S1_YAWN_BUILD, S1_YAWN_PEAK, S1_YAWN_RELEASE);
  const liftP = progress(f, S1_LIFT_START, S1_LIFT_END);
  const sipEnv = buildPeakRelease(f, S1_SIP_START, S1_SIP_BUILD, S1_SIP_PEAK, S1_SIP_RELEASE);
  const pose: Pose = blendPose(POSES.idle, POSES.yawn, yawnEnv);
  const mouthOpen = yawnMouth(yawnEnv);

  const cupX = S1_CUP_PARK.x + (S1_CUP_MOUTH.x - S1_CUP_PARK.x) * liftP;
  const cupY = S1_CUP_PARK.y + (S1_CUP_MOUTH.y - S1_CUP_PARK.y) * liftP;
  const cupTilt = -20 * sipEnv;
  const cupOpacity = progress(f, S1_LIFT_START - 4, S1_LIFT_START + 6);

  return (
    <PlainBg>
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CX} pose={pose} mouthOpen={mouthOpen} />
      {cupOpacity > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: cupX - 70, top: cupY - 70, width: 140, height: 140,
            opacity: cupOpacity, transform: `rotate(${cupTilt}deg)`, transformOrigin: '50% 80%',
          }}
        >
          <ThemedIcon name="coffee" size={140} color={C.ink} />
        </div>
      ) : null}
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 - "어, 잠이 확 깨네. 왜 이러지?" ---------------- */

const S2_BUST_SIZE = 760;
const S2_BUST_LEFT = 160;
const S2_BUST_TOP = 620;
const S2_POSE_START = 0, S2_POSE_END = 20;
const S2_CUP_X = 800, S2_CUP_Y = 540;
const S2_CUP_POP_START = 2, S2_CUP_POP_FRAMES = 14;
const S2_QMARK_START = 78, S2_QMARK_END = 96;

export const S2Reaction: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const poseT = progress(f, S2_POSE_START, S2_POSE_END);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, poseT);
  const cupP = progress(f, S2_CUP_POP_START, S2_CUP_POP_START + S2_CUP_POP_FRAMES);
  const qP = progress(f, S2_QMARK_START, S2_QMARK_END);

  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <PopIn cx={S2_CUP_X} cy={S2_CUP_Y} size={140} progress={cupP} fromScale={0.6}>
        <ThemedIcon name="coffee" size={140} color={C.ink} />
      </PopIn>
      <PopIn cx={230} cy={500} size={140} progress={qP} fromScale={0.4}>
        <QMark size={140} color={C.coral} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- 공용: 수용체 다이어그램 앵커 (s3/s4/s5/s7 이 같은 자리를 공유) ---------------- */

const DIAG_X = 160;
const DIAG_Y = 560;
const DIAG_W = 760;
const DIAG_SCALE = DIAG_W / RECEPTOR_VB_W;
const SOCKET_SCREEN = {
  x: DIAG_X + RECEPTOR_SOCKET_PT.x * DIAG_SCALE,
  y: DIAG_Y + RECEPTOR_SOCKET_PT.y * DIAG_SCALE,
};

/* ---------------- S3: 아데노신이 서서히 쌓인다 ---------------- */

const S3_DOCK_START = 10, S3_DOCK_END = 150;
const S3_LABEL_START = 80, S3_LABEL_END = 108;

export const S3Buildup: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const dockP = progress(f, S3_DOCK_START, S3_DOCK_END);
  const labelP = progress(f, S3_LABEL_START, S3_LABEL_END);

  return (
    <PlainBg>
      <PulseRing
        x={SOCKET_SCREEN.x - 140} y={SOCKET_SCREEN.y - 140} size={280} frame={f}
        progress={dockP} color={C.goldSoft} periodFrames={50}
      />
      <CaffeineReceptorDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} dockProgress={dockP} />
      <div style={popLabelStyle(SOCKET_SCREEN.x, DIAG_Y - 110, labelP)}>{label}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 카페인이 등장해 자리를 대신 차지한다 ---------------- */

const S4_BLOCK_START = 15, S4_BLOCK_END = 120;
const S4_LABEL_START = 95, S4_LABEL_END = 123;

export const S4Block: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const blockP = progress(f, S4_BLOCK_START, S4_BLOCK_END);
  const labelP = progress(f, S4_LABEL_START, S4_LABEL_END);

  return (
    <PlainBg>
      <CaffeineReceptorDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} dockProgress={1} blockProgress={blockP} />
      <div style={popLabelStyle(SOCKET_SCREEN.x, DIAG_Y - 110, labelP)}>{label}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 졸음 신호가 카페인에 막혀 멈춘다 ---------------- */

const S5_BRAIN_CX = 540;
const S5_BRAIN_CY = 330;
const S5_BRAIN_SIZE = 170;
const S5_SIGNAL_FROM = { x: SOCKET_SCREEN.x, y: SOCKET_SCREEN.y - 150 };
const S5_SIGNAL_TO = { x: S5_BRAIN_CX, y: S5_BRAIN_CY + S5_BRAIN_SIZE / 2 };
const S5_STOP_T = 0.55;
const S5_TRAVEL_START = 15, S5_TRAVEL_END = 60;
const S5_BLOCK_MARK_START = 50, S5_BLOCK_MARK_END = 65;
const S5_BRAIN_FADE_START = 0, S5_BRAIN_FADE_END = 20;

export const S5Blocked: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const travel = progress(f, S5_TRAVEL_START, S5_TRAVEL_END);
  const signalT = travel * S5_STOP_T;
  const brainP = progress(f, S5_BRAIN_FADE_START, S5_BRAIN_FADE_END);
  const markP = progress(f, S5_BLOCK_MARK_START, S5_BLOCK_MARK_END);
  // 직선(bow=0) 경로. NerveSignal 은 bow=0 이면 제어점이 현이 중점이라 2차 베지어가 그대로
  // 선형보간과 같아진다 - stopX/stopY 를 signalT 와 동일한 선형식으로 구해도 정확히 일치한다.
  const stopX = S5_SIGNAL_FROM.x + (S5_SIGNAL_TO.x - S5_SIGNAL_FROM.x) * S5_STOP_T;
  const stopY = S5_SIGNAL_FROM.y + (S5_SIGNAL_TO.y - S5_SIGNAL_FROM.y) * S5_STOP_T;

  return (
    <PlainBg>
      <CaffeineReceptorDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} dockProgress={1} blockProgress={1} />
      <NerveSignal
        from={S5_SIGNAL_FROM} to={S5_SIGNAL_TO} bow={0} showPath={1}
        signalT={signalT > 0.005 ? signalT : undefined}
        pathColor={C.inkSoft} strokeWidth={8} dotColor={C.gold} dotRadius={17}
      />
      <PopIn cx={stopX} cy={stopY} size={90} progress={markP} fromScale={0.4}>
        <ThemedIcon name="x" size={90} color={C.coral} strokePx={16} />
      </PopIn>
      <div
        style={{
          position: 'absolute', left: S5_BRAIN_CX - S5_BRAIN_SIZE / 2, top: S5_BRAIN_CY - S5_BRAIN_SIZE / 2,
          width: S5_BRAIN_SIZE, height: S5_BRAIN_SIZE, opacity: brainP,
        }}
      >
        <ThemedIcon name="brain" size={S5_BRAIN_SIZE} color={C.ink} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 핵심 결론 - 그래픽 없이 자막만 ---------------- */

export const S6Conclusion: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg>
      <Actor size={760} centerX={CX} pose={POSES.idle} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 효과가 떨어지면 아데노신이 몰려온다 ---------------- */

const S7_RELEASE_START = 15, S7_RELEASE_END = 150;

export const S7Rush: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const relP = progress(f, S7_RELEASE_START, S7_RELEASE_END);

  return (
    <PlainBg>
      {/* dockProgress=1/blockProgress=1 은 s5 가 끝난 상태(카페인이 자리를 차지한 채 정지)를
          그대로 잇는 기준선이다. releaseProgress 가 0.001 을 넘는 순간부터 컴포넌트 내부에서
          release 애니메이션으로 전환되므로, relP=0 인 처음 몇 프레임에도 소켓이 비어 보이지
          않고 카페인이 그대로 앉아 있는 상태로 이어진다(연속성 - s5 프레임 검수로 발견해 수정). */}
      <CaffeineReceptorDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} dockProgress={1} blockProgress={1} releaseProgress={relP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
