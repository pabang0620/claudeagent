/** 이 화(general-ep34, "배 안 고픈데도 꼬르륵 소리 나는 이유") 전용 장면.
 *
 *  s1(캐릭터가 조용한 자리에서 갑자기 배에서 소리가 나 당황) -> s2(위·장 근육이 내용물을
 *  밀어내며 나는 소리라는 기본 설명) -> s3(사실 이 소리는 소화되는 내내 항상 난다, 시계
 *  루프) -> s4(공복이 되면 청소 운동이 시작 - 빈 위 + 빗자루 등장) -> s5(빗자루가 관 속을
 *  쓸며 더 강하게 움직인다) -> s6(청소 운동은 한두 시간마다 반복, 그때마다 소리가 크다) ->
 *  s7(빈 속에서는 소리를 흡수할 게 없어 벽에 부딪혀 더 크게 울린다).
 *
 *  s2~s7은 전부 3인칭 설명 내레이션이 GutTubeDiagram 위에 흐르는 구간이라 립싱크를 쓰지
 *  않는다(원칙 - 채널 전반의 "s2=리액션+훅 질문일 때만 립싱크" 관례와 동일, 이 화는 그런
 *  1인칭 대사 구간이 없다). s1도 캐릭터가 등장하지만 내레이션이 캐릭터 본인의 대사(따옴표)가
 *  아니라 상황을 설명하는 3인칭 문장이라 idle 입 모양만 쓴다.
 *
 *  꼬르륵 소리(stomach_growl.mp3, 원칙 7)는 s1/s2/s6/s7에서 재생되고, 각 재생 시점에
 *  ScentWaves(소리 파형, 재사용)를 GutTubeDiagram의 gutPointAt()으로 얻은 좌표에 맞춰
 *  함께 터뜨려 소리와 화면을 동기화한다. 재생 비율(프레임 대비)은 Episode.tsx의 오디오
 *  Sequence 배치와 공유하기 위해 이 파일에서 export한다.
 */
import React from 'react';
import {
  Actor, AnalogClock, C, Caption, FS, GUT_VB_W, GutTubeDiagram, BroomIcon,
  Label, PlainBg, PopIn, ScentWaves, SW_THIN, ThemedIcon, W, blendPose, clamp01,
  gutPointAt, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** 소리 파형(ScentWaves)을 GutTubeDiagram의 t(0~1) 지점에 맞춰 그리는 공용 헬퍼.
 *  diagX/diagY/diagWidth는 해당 씬에서 GutTubeDiagram에 넘긴 값과 같아야 한다. */
function gutScreenPt(diagX: number, diagY: number, diagWidth: number, tt: number) {
  const scale = diagWidth / GUT_VB_W;
  const p = gutPointAt(tt);
  return { x: diagX + p.x * scale, y: diagY + p.y * scale, angle: p.angle };
}

/** 꼬르륵 파형(ScentWaves) 진행도. ScentWaves 자체가 "0->1로 커지며 퍼졌다 옅어지는" 1회성
 *  곡선을 이미 내장하고 있어(내부 fadeOut), 여기서 다시 sin 봉우리를 씌우면 두 감쇠가
 *  겹쳐 대부분의 구간에서 opacity가 아주 낮게 나온다(실측: 봉우리에서도 arc 최대 불투명도
 *  0.17~0.28). 그래서 단조 증가값만 그대로 넘긴다 - dur 이후에는 1로 clamp돼 ScentWaves가
 *  스스로 다 옅어진 상태를 유지한다. */
function burstProgress(f: number, at: number, dur = 26) {
  return progress(f, at, at + dur);
}

/* ================================================================
 * S1: 조용한 자리에서 갑자기 배에서 소리가 나 당황 (캐릭터, 무성 대사 없음)
 * ================================================================ */

const S1_SIZE = 700;
const S1_CX = CX;
const S1_GROUND = 1250;
const S1_BELLY_VB = 690;
const S1_BELLY_Y = S1_GROUND - (1026 - S1_BELLY_VB) * (S1_SIZE / 1254);

/** s1 구간 길이(frames) 대비 꼬르륵이 터지는 지점(비율). Episode.tsx의 오디오 Sequence와
 *  같은 비율을 써서 소리와 화면 파형을 맞춘다. */
export const S1_GROWL_AT = 0.42;
export const S2_GROWL_AT = 0.30;
export const S6_GROWL_AT = 0.34;
export const S7_GROWL_AT = 0.30;
/** stomach_growl.mp3 실측 0.5초(30fps 15프레임) + 여유 */
export const GROWL_SFX_FRAMES = 16;

const CALM_POSE: Pose = { headTilt: 0, lean: 0, eyeOpen: 0.95, blush: 0 };
const EMBARRASSED_POSE: Pose = { headTilt: -6, lean: 3, eyeOpen: 0.55, blush: 1.3, mouthOpen: 0.18 };

export const S1Embarrassed: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / 30);
  const growlFrame = frames * S1_GROWL_AT;
  const reactP = progress(f, growlFrame, growlFrame + 20);
  const pose: Pose = blendPose(CALM_POSE, EMBARRASSED_POSE, reactP);
  const mouthOpen = 0.06 + reactP * 0.16 * Math.max(0, Math.sin((f / 14)));

  const burstP = burstProgress(f, growlFrame, 26);

  return (
    <PlainBg>
      {/* 조용한 자리(도서관/교실) 힌트 - 책장 실루엣, 은은하게 */}
      <svg width={260} height={340} viewBox="0 0 260 340" style={{ position: 'absolute', left: 60, top: 300, opacity: 0.5 }}>
        <rect x={10} y={10} width={240} height={320} rx={10} fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN} />
        {[
          { w: 26, h: 250, c: C.coralSoft }, { w: 34, h: 220, c: C.goldSoft }, { w: 22, h: 260, c: C.hillFar },
          { w: 30, h: 200, c: C.coralSoft }, { w: 26, h: 240, c: C.goldSoft },
        ].map((b, i, arr) => {
          const gap = 8;
          const totalW = arr.reduce((s, x) => s + x.w, 0) + gap * (arr.length - 1);
          let left = 10 + (240 - totalW) / 2;
          for (let j = 0; j < i; j++) left += arr[j].w + gap;
          return (
            <rect key={i} x={left} y={310 - b.h} width={b.w} height={b.h} fill={b.c} stroke={C.inkSoft} strokeWidth={SW_THIN * 0.5} />
          );
        })}
      </svg>
      <ThemedIcon name="book" size={64} color={C.inkSoft} style={{ position: 'absolute', left: 850, top: 340, opacity: 0.45 }} />

      <Actor size={S1_SIZE} centerX={S1_CX} ground={S1_GROUND} pose={pose} mouthOpen={mouthOpen} />

      {burstP > 0.01 && burstP < 1 && (
        <ScentWaves
          cx={S1_CX} cy={S1_BELLY_Y} angle={90} count={2} spread={190} fanDeg={58}
          progress={burstP} color={C.coral} strokeWidth={SW_THIN * 1.7}
        />
      )}

      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S2: 위·장 근육이 음식물/가스/물을 밀어내며 나는 소리 (기본 설명)
 * ================================================================ */

const DIAG_W = 480;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 560;

export const S2Mechanism: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / 30);
  const flowT = f / 70;
  const ampIn = clamp01(progress(f, 0, 24));
  const contentsIn = clamp01(progress(f, 0, 24));
  const labelP = clamp01(progress(f, 18, 40));

  // 라벨은 관 안(내용물이 지나가는 자리)이 아니라 관 아래 빈 공간에 둔다 -
  // GUT_LABEL_PT는 관 위쪽(음식물이 지나는 자리)과 겹쳐 보여 여기서는 쓰지 않는다.
  const diagH = DIAG_W * (920 / GUT_VB_W);
  const labelX = CX;
  const labelY = DIAG_Y + diagH + 40;

  const growlFrame = frames * S2_GROWL_AT;
  const burstP = burstProgress(f, growlFrame, 26);
  const burstPt = gutScreenPt(DIAG_X, DIAG_Y, DIAG_W, flowT % 1);

  return (
    <PlainBg ground={null}>
      <GutTubeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        flowT={flowT} waveAmp={0.55 * ampIn} contentsT={contentsIn}
      />
      <Label x={labelX} y={labelY} text={t.s2Label} size={FS.small} color={C.ink} align="center" style={{ opacity: labelP }} />
      {burstP > 0.01 && burstP < 1 && (
        <ScentWaves
          cx={burstPt.x} cy={burstPt.y} angle={-90} count={2} spread={170} fanDeg={56}
          progress={burstP} color={C.coral} strokeWidth={SW_THIN * 1.5}
        />
      )}
      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 사실 이 소리는 배가 고플 때만 나는 게 아니라 늘 나고 있다 (시계 루프)
 * ================================================================ */

const S3_DIAG_W = 420;
const S3_DIAG_X = 90;
const S3_DIAG_Y = 610;
const S3_CLOCK_W = 260;
const S3_CLOCK_X = 700;
const S3_CLOCK_Y = 380;

export const S3AlwaysOn: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / 30);
  const flowT = f / 60;
  const in1 = clamp01(progress(f, 0, 20));
  const labelP = clamp01(progress(f, 14, 34));

  // 시계는 하루 종일 계속 도는 인상을 주도록 빠르게 회전 반복
  const secondDeg = (f * 9) % 360;
  const minuteDeg = (f * 1.4) % 360;

  return (
    <PlainBg ground={null}>
      <GutTubeDiagram
        width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y}
        flowT={flowT} waveAmp={0.5 * in1} contentsT={in1}
      />
      <AnalogClock
        width={S3_CLOCK_W} x={S3_CLOCK_X} y={S3_CLOCK_Y}
        secondDeg={secondDeg} minuteDeg={minuteDeg} hourDeg={(f * 0.3) % 360}
        style={{ opacity: in1 }}
      />
      <Label
        x={CX} y={1260} text={t.s3Label} size={FS.small} color={C.ink} align="center"
        style={{
          opacity: labelP, background: C.goldSoft, border: `6px solid ${C.ink}`, borderRadius: 999,
          padding: '14px 34px', transform: 'translateX(-50%)',
        }}
      />
      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 밥을 안 먹은 지 시간이 지나면 몸이 청소 운동을 시작한다 (빈 위 + 빗자루 등장)
 * ================================================================ */

const S4_BROOM_X = DIAG_X + 470;
const S4_BROOM_Y = DIAG_Y + 60;

export const S4Emptying: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / 30);
  const emptyP = clamp01(progress(f, 4, 46));
  const contentsT = 0.9 * (1 - emptyP);
  const flowT = f / 90;
  const broomP = clamp01(progress(f, 52, 76));

  return (
    <PlainBg ground={null}>
      <GutTubeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        flowT={flowT} waveAmp={0.15} contentsT={contentsT}
      />
      <PopIn cx={S4_BROOM_X} cy={S4_BROOM_Y} size={140} progress={broomP} fromScale={0.4}>
        <BroomIcon x={70} y={70} size={140} angle={40} />
      </PopIn>
      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 빗자루가 위/장 속 남은 찌꺼기를 밀어내며 더 강하게 움직인다
 * ================================================================ */

export const S5Sweep: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / 30);
  const sweepP = clamp01(progress(f, 10, frames - 14));
  const flowT = f / 34;
  const residue = 0.32 * (1 - sweepP);

  return (
    <PlainBg ground={null}>
      <GutTubeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        flowT={flowT} waveAmp={0.85} contentsT={residue} sweepT={sweepP}
      />
      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 청소 운동은 한두 시간마다 반복되고, 그때마다 소리가 유독 크게 난다
 * ================================================================ */

const S6_DIAG_W = 380;
const S6_DIAG_X = CX - S6_DIAG_W / 2;
const S6_DIAG_Y = 820;
const S6_CLOCK_W = 220;
const S6_CLOCK_X = CX - S6_CLOCK_W / 2;
const S6_CLOCK_Y = 380;

export const S6Repeating: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / 30);
  const in1 = clamp01(progress(f, 0, 20));
  const cyclePos = (f % 100) / 100;
  const flowT = f / 46;

  const growlFrame = frames * S6_GROWL_AT;
  const burstP = burstProgress(f, growlFrame, 30);
  const burstPt = gutScreenPt(S6_DIAG_X, S6_DIAG_Y, S6_DIAG_W, flowT % 1);

  return (
    <PlainBg ground={null}>
      <AnalogClock
        width={S6_CLOCK_W} x={S6_CLOCK_X} y={S6_CLOCK_Y}
        hourDeg={cyclePos * 60} minuteDeg={cyclePos * 360} secondDeg={(f * 11) % 360}
        freeze={0.4 + 0.4 * Math.max(0, Math.sin(cyclePos * Math.PI * 2))}
        style={{ opacity: in1 }}
      />
      <Label
        x={CX} y={S6_CLOCK_Y + S6_CLOCK_W + 30} text={t.s6Label} size={FS.small} color={C.ink} align="center"
        style={{ opacity: in1 }}
      />
      <GutTubeDiagram
        width={S6_DIAG_W} x={S6_DIAG_X} y={S6_DIAG_Y}
        flowT={flowT} waveAmp={1} contentsT={0.75 * in1}
      />
      {burstP > 0.01 && burstP < 1 && (
        <ScentWaves
          cx={burstPt.x} cy={burstPt.y} angle={90} count={3} spread={280} fanDeg={56}
          progress={burstP} color={C.coral} strokeWidth={SW_THIN * 1.8}
        />
      )}
      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 배 속이 비어 있으면 소리를 흡수할 음식이 없어 더 크게 울린다 (벽 반사 연출)
 * ================================================================ */

export const S7Echo: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / 30);
  const flowT = f / 100;

  const growlFrame = frames * S7_GROWL_AT;
  // 벽에 부딪혀 되울리는 연출 - 바깥으로 나가는 파형(outP)이 먼저, 벽에서 반사돼 돌아오는
  // 파형(echoP)이 살짝 늦게 시작해 "부딪히고 되돌아온다"는 시차를 준다.
  const outP = burstProgress(f, growlFrame, 22);
  const echoP = burstProgress(f, growlFrame + 16, 26);
  const glowP = clamp01(progress(f, growlFrame, growlFrame + 12)) - clamp01(progress(f, growlFrame + 34, growlFrame + 70));
  const burstPt = gutScreenPt(DIAG_X, DIAG_Y, DIAG_W, flowT % 1);

  return (
    <PlainBg ground={null}>
      <GutTubeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        flowT={flowT} waveAmp={0.25} contentsT={0} echoGlowT={clamp01(glowP)}
      />
      {outP > 0.01 && outP < 1 && (
        <ScentWaves
          cx={burstPt.x} cy={burstPt.y} angle={-90} count={2} spread={240} fanDeg={60}
          progress={outP} color={C.coral} strokeWidth={SW_THIN * 1.6}
        />
      )}
      {echoP > 0.01 && echoP < 1 && (
        <ScentWaves
          cx={burstPt.x} cy={burstPt.y} angle={90} count={2} spread={190} fanDeg={50}
          progress={echoP} color={C.gold} strokeWidth={SW_THIN * 1.3}
        />
      )}
      <Caption line={line} t={f / 30} />
    </PlainBg>
  );
};
