/** 이 화(general-long01, "시계 초침이 순간 멈춰 보이는 이유") 전용 장면. 16:9(가로) 롱폼 첫 화.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  캐릭터는 s1·s2·s13 에만 등장(오프닝·리액션·클로징). s3~s12 는 화면 전용 다이어그램 장면이다.
 *  배경은 전 장면 공용 PlainBgLandscape(밝은 톤, 특정 장소 고정 안 함).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  AnalogClock, Actor, Appear, BustActor, C, Card, Caption, CountUp, FPS, FS, Label,
  PlainBgLandscape as PlainBg, POSES, ThemedIcon, W_LANDSCAPE as W, H_LANDSCAPE as H,
  blendPose, mouthAt, mouthProp, popIn, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- 공용: 자막 위치 (가로 1920x1080 캔버스용) ----------------
 * 세로판 CAP_BOTTOM(300)/H(1920)=0.156, CAP_SIDE(70) 비율을 유지하되, 가로 캔버스는 폭이
 * 훨씬 넓어 side 여백을 늘리고 maxWidth 도 넓혔다(원칙 4의 "언어별로 다시 계산" 대상은 구간
 * 길이이고, 이 캔버스 좌표는 포맷 고정값이라 언어 무관 - ko/en 동일하게 쓴다). */
const CAP_BOTTOM_LS = 170;
const CAP_SIDE_LS = 260;
const CAP_MAXWIDTH_LS = 1400;

const Cap: React.FC<{ line: CaptionLine | null; t: number }> = ({ line, t }) => (
  <Caption line={line} t={t} dark={false} bottom={CAP_BOTTOM_LS} side={CAP_SIDE_LS} maxWidth={CAP_MAXWIDTH_LS} />
);

/* ---------------- 공용: 구석에 걸린 벽시계 (s1/s2/s13 수미상관용) ---------------- */
const CORNER_CLOCK_X = 1610;
const CORNER_CLOCK_Y = 70;
const CORNER_CLOCK_W = 190;

const CornerClock: React.FC<{ f: number; opacity?: number }> = ({ f, opacity = 1 }) => (
  <div style={{ opacity }}>
    <AnalogClock
      width={CORNER_CLOCK_W} x={CORNER_CLOCK_X} y={CORNER_CLOCK_Y}
      hourDeg={95} minuteDeg={210} secondDeg={(f * 6) % 360}
    />
  </div>
);

/* ---------------- S1: 벽시계로 고개를 홱 돌린다 (무성, 2.0초 고정) ---------------- */

const ACTOR_SIZE = 540;
const ACTOR_GROUND = 930;
const GLANCE_POSE: Pose = { ...POSES.idle, headTilt: 20, lean: 5 };

export const S1Look: React.FC<{ f: number }> = ({ f }) => {
  const turnP = progress(f, 5, 15);
  const pose = blendPose(POSES.idle, GLANCE_POSE, turnP);
  return (
    <PlainBg>
      <CornerClock f={f} />
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} breathAmp={1} />
    </PlainBg>
  );
};

/* ---------------- S2: 놀란 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const BUST_SIZE = 560;
const BUST_LEFT = CX - BUST_SIZE / 2;
const BUST_TOP = 230;

export const S2Surprised: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <CornerClock f={f} />
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: "방금 눈이 옮겨왔을 때" vs "계속 보고 있을 때" 대비 ----------------
 * 텍스트 라벨 없이 아이콘 움직임만으로 조건을 보여준다(대본 지시). 왼쪽은 주기적으로 눈이
 * 날아와 도착하는 순간 초침이 멈췄다 점프하고, 오른쪽은 눈이 계속 고정돼 있고 초침도 계속
 * 매끄럽게 돈다 - 절대 멈추지 않는다. */

const PERIOD_S3 = 110;
const LEFT_CX = 620;
const RIGHT_CX = 1300;
const CLOCK_W_S3 = 300;
const CLOCK_Y_S3 = 300;
const EYE_Y_S3 = 700;

export const S3Compare: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const phase = f % PERIOD_S3;
  const freezing = phase >= 28 && phase < 58;
  const periodStart = f - phase;
  const leftAngle = freezing ? ((periodStart + 28) * 6) % 360 : (f * 6) % 360;
  const freezeGlow = freezing
    ? Math.min(progress(phase, 28, 32), 1 - progress(phase, 54, 58))
    : 0;
  const eyeArriveP = progress(phase, 0, 26);
  const eyeXLeft = LEFT_CX - 300 + 300 * eyeArriveP;

  const rightAngle = (f * 6) % 360;

  return (
    <PlainBg>
      <AnalogClock width={CLOCK_W_S3} x={LEFT_CX - CLOCK_W_S3 / 2} y={CLOCK_Y_S3}
        hourDeg={40} minuteDeg={130} secondDeg={leftAngle} freeze={freezeGlow} />
      <div style={{ position: 'absolute', left: eyeXLeft - 44, top: EYE_Y_S3, opacity: eyeArriveP }}>
        <ThemedIcon name="eye" size={88} color={C.ink} />
      </div>

      <AnalogClock width={CLOCK_W_S3} x={RIGHT_CX - CLOCK_W_S3 / 2} y={CLOCK_Y_S3}
        hourDeg={40} minuteDeg={130} secondDeg={rightAngle} />
      <div style={{ position: 'absolute', left: RIGHT_CX - 44, top: EYE_Y_S3 }}>
        <ThemedIcon name="eye" size={88} color={C.ink} />
      </div>

      {/* 중앙 구분선 */}
      <div style={{ position: 'absolute', left: CX - 2, top: 220, width: 4, height: 560, background: C.hill }} />

      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 눈이 아주 빠르게 점프 (사카드 용어 팝인) ---------------- */

const PERIOD_S4 = 74;
const S4_LEFT_X = 420;
const S4_RIGHT_X = 1500;
const S4_Y = 470;

export const S4Saccade: React.FC<{ f: number; lines: CaptionLine[]; term: string }> = ({ f, lines, term }) => {
  const phase = f % PERIOD_S4;
  const jumpP = progress(phase, 0, 6);
  const eyeX = S4_LEFT_X + (S4_RIGHT_X - S4_LEFT_X) * jumpP;
  const trail = [1, 2, 3].map((d) => {
    const pj = progress(phase - d * 1.4, 0, 6);
    return S4_LEFT_X + (S4_RIGHT_X - S4_LEFT_X) * pj;
  });
  const termP = progress(f, 40, 56);

  return (
    <PlainBg>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {trail.map((tx, i) => (
          <line key={i} x1={tx - 60} y1={S4_Y + 44} x2={tx + 10} y2={S4_Y + 44}
            stroke={C.coral} strokeWidth={10} strokeLinecap="round" opacity={0.16 * (3 - i)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: eyeX - 44, top: S4_Y }}>
        <ThemedIcon name="eye" size={88} color={C.ink} />
      </div>
      {termP > 0.001 ? (
        <Appear progress={termP} from="scale">
          <Label x={CX} y={760} text={term} size={FS.title} color={C.coral} />
        </Appear>
      ) : null}
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 빠른 잔상(블러) -> 완전 암전 ---------------- */

export const S5Blackout: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = (
  { f, frames, lines }
) => {
  const blur = 22 * progress(f, 0, frames * 0.5);
  const blackP = progress(f, frames * 0.6, frames * 0.86);
  return (
    <PlainBg>
      <div style={{ filter: `blur(${blur}px)`, opacity: 1 - blackP * 0.4 }}>
        <AnalogClock width={420} x={CX - 210} y={300} hourDeg={40} minuteDeg={130}
          secondDeg={(f * 9) % 360} />
      </div>
      <AbsoluteFill style={{ background: C.ink, opacity: blackP }} />
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 암전이 걷히며 -> 이미지가 과거로 늘어나 빈틈을 채운다 ---------------- */

const TIMELINE_Y = 760;
const TIMELINE_RIGHT = 1440;
const TIMELINE_LEFT = 480;

export const S6Stretch: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = (
  { f, frames, lines }
) => {
  const clearP = progress(f, 4, frames * 0.22);
  const stretchP = progress(f, frames * 0.34, frames * 0.86);
  const barW = (TIMELINE_RIGHT - TIMELINE_LEFT) * stretchP;

  return (
    <PlainBg>
      <AnalogClock width={360} x={CX - 180} y={220} hourDeg={40} minuteDeg={130} secondDeg={230}
        freeze={1} />

      {/* 타임라인: 오른쪽(지금)에 고정된 막대가 왼쪽(과거)으로 늘어난다 */}
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={TIMELINE_LEFT} y1={TIMELINE_Y} x2={TIMELINE_RIGHT} y2={TIMELINE_Y}
          stroke={C.hill} strokeWidth={10} strokeLinecap="round" />
        <rect x={TIMELINE_RIGHT - barW} y={TIMELINE_Y - 34} width={Math.max(6, barW)} height={68}
          rx={16} fill={C.coralSoft} stroke={C.coral} strokeWidth={6} />
        <circle cx={TIMELINE_RIGHT} cy={TIMELINE_Y} r={14} fill={C.ink} />
      </svg>

      <AbsoluteFill style={{ background: C.ink, opacity: 1 - clearP }} />
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 핵심 페이오프 - 초침이 멈췄다가 다시 움직인다 ---------------- */

export const S7Payoff: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = (
  { f, frames, lines }
) => {
  const resumeAt = Math.round(frames * 0.55);
  const held = 230;
  const running = held + (f - resumeAt) * 6;
  const angle = f < resumeAt ? held : running % 360;
  const freezeGlow = 1 - progress(f, resumeAt - 4, resumeAt + 6);

  return (
    <PlainBg>
      <AnalogClock width={520} x={CX - 260} y={190} hourDeg={40} minuteDeg={130} secondDeg={angle}
        freeze={Math.max(0, freezeGlow)} />
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: "크로노스타시스" 이름 + 연도 카드 ---------------- */

const CARD_W = 560;
const CARD_H = 620;
const CARD_X = CX - CARD_W / 2;
const CARD_Y = 160;
const BADGE_SIZE = 190;

const EraBadge: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize: 32, lineHeight: 1.16, textAlign: 'center', width: 148 }}>
    {text.split('\n').map((line, i) => (
      <div key={i} style={{ whiteSpace: 'nowrap' }}>{line}</div>
    ))}
  </div>
);

export const S8Name: React.FC<{ f: number; lines: CaptionLine[]; badge: string; label: string }> = (
  { f, lines, badge, label }
) => (
  <PlainBg>
    <Card
      x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} progress={popIn(f, FPS, 4)}
      badge={<EraBadge text={badge} />} badgeSize={BADGE_SIZE} label={label}
      bg={C.paper} border={C.ink} labelColor={C.ink} badgeColor={C.gold}
    >
      <ThemedIcon name="clock" size={220} color={C.ink} />
    </Card>
    <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
  </PlainBg>
);

/* ---------------- S9: 하루 발생 빈도 카운트업 ---------------- */

export const S9Count: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; to: number; prefix: string; suffix: string;
}> = ({ f, frames, lines, to, prefix, suffix }) => {
  const blink = Math.floor(f / 6) % 2 === 0;
  return (
    <PlainBg>
      <CountUp x={CX} y={420} to={to} frame={f} at={10} duration={Math.round(frames * 0.42)}
        size={150} color={C.coral} prefix={prefix} suffix={suffix} commas width={1400}
        style={{ whiteSpace: 'nowrap' }} />
      <div style={{ position: 'absolute', left: CX - 55, top: 620, opacity: blink ? 1 : 0.35 }}>
        <ThemedIcon name="eye" size={110} color={C.ink} />
      </div>
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S10: 하루 24시간 원형 타임라인 위에 검은 조각이 누적 ---------------- */

/** 고정 각도 배열 (Math.random 금지 - 결정적 간격이되 단조롭지 않게 폭을 살짝 흔든다) */
const SLICE_ANGLES = Array.from({ length: 46 }, (_, i) => {
  const base = (360 / 46) * i;
  const jitter = ((i * 53) % 17) - 8; // -8~8도, 고정 시드
  return base + jitter;
});

const RING_R = 300;

export const S10Accumulate: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const revealCount = Math.floor(SLICE_ANGLES.length * progress(f, 8, frames * 0.82));
  const labelP = progress(f, frames * 0.55, frames * 0.72);
  return (
    <PlainBg>
      <svg width={640} height={640} style={{ position: 'absolute', left: CX - 320, top: 170 }}>
        <circle cx={320} cy={320} r={RING_R} fill="none" stroke={C.hill} strokeWidth={14} />
        {SLICE_ANGLES.slice(0, revealCount).map((deg, i) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const x1 = 320 + (RING_R - 20) * Math.cos(rad);
          const y1 = 320 + (RING_R - 20) * Math.sin(rad);
          const x2 = 320 + (RING_R + 20) * Math.cos(rad);
          const y2 = 320 + (RING_R + 20) * Math.sin(rad);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={9}
              strokeLinecap="round" />
          );
        })}
        <circle cx={320} cy={320} r={70} fill={C.paper} stroke={C.ink} strokeWidth={8} />
      </svg>
      <div style={{ position: 'absolute', left: CX - 40, top: 450 }}>
        <ThemedIcon name="clock" size={80} color={C.ink} />
      </div>
      {labelP > 0.001 ? (
        <Appear progress={labelP} from="scale">
          <Label x={CX} y={860} text={label} size={FS.label} color={C.ink} />
        </Appear>
      ) : null}
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S11: 마술사의 손기술 + 필름 편집 컷, 둘 다 눈 점프 타이밍에 맞춰 일어난다 ---------------- */

const PERIOD_S11 = 90;
const MAGE_CX = 560;
const MAGE_Y = 260;
const FILM_LEFT = 1080;
const FILM_TOP = 300;
const FILM_FRAME_W = 130;
const FILM_FRAME_H = 170;
const FILM_GAP = 14;
const FILM_N = 5;

export const S11Sync: React.FC<{ f: number; lines: CaptionLine[]; cue: string }> = ({ f, lines, cue }) => {
  const phase = f % PERIOD_S11;
  const swapAt = 30;
  const swapWindow = phase >= swapAt - 3 && phase < swapAt + 9;
  const swapFlash = swapWindow ? Math.sin(((phase - (swapAt - 3)) / 12) * Math.PI) : 0;
  const cueP = progress(phase, swapAt - 3, swapAt + 3) * (1 - progress(phase, swapAt + 20, swapAt + 32));

  const activeFrameIdx = Math.floor(phase / (PERIOD_S11 / FILM_N)) % FILM_N;

  return (
    <PlainBg>
      {/* 마술사 실루엣 - 모자·망토·지팡이만으로 간단히 구성 (전 좌표를 양수 범위로 유지) */}
      <svg width={420} height={520} style={{ position: 'absolute', left: MAGE_CX - 210, top: MAGE_Y }}>
        <rect x={165} y={20} width={90} height={68} rx={8} fill={C.ink} />
        <rect x={150} y={82} width={120} height={24} rx={6} fill={C.ink} />
        <circle cx={210} cy={182} r={54} fill={C.paper} stroke={C.ink} strokeWidth={9} />
        <path d="M 90 480 Q 210 230 330 480 Z" fill={C.ink} />
        <line
          x1={300} y1={340} x2={380 + swapFlash * 30} y2={300 - swapFlash * 40}
          stroke={C.ink} strokeWidth={9} strokeLinecap="round"
        />
        {swapFlash > 0.05 ? (
          <g transform={`translate(${384 + swapFlash * 30} ${296 - swapFlash * 40})`} opacity={swapFlash}>
            <circle r={20} fill={C.gold} stroke={C.ink} strokeWidth={5} />
          </g>
        ) : null}
      </svg>

      {/* 필름 편집 타임라인 - 눈 점프 타이밍에 컷(강조 테두리)이 옮겨간다 */}
      <svg width={800} height={260} style={{ position: 'absolute', left: FILM_LEFT - 40, top: FILM_TOP }}>
        {Array.from({ length: FILM_N }, (_, i) => {
          const x = i * (FILM_FRAME_W + FILM_GAP);
          const active = i === activeFrameIdx;
          return (
            <rect key={i} x={x} y={0} width={FILM_FRAME_W} height={FILM_FRAME_H} rx={10}
              fill={active ? C.coralSoft : C.paper} stroke={C.ink} strokeWidth={active ? 10 : 6} />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: FILM_LEFT + 320 - 44, top: FILM_TOP + FILM_FRAME_H + 26 }}>
        <ThemedIcon name="eye" size={88} color={C.ink} />
      </div>

      {cueP > 0.001 ? (
        <div style={{ opacity: cueP }}>
          <Label x={CX} y={860} text={cue} size={FS.small} color={C.coral} />
        </div>
      ) : null}

      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S12: 청각 버전 (귀 + 소리 파형이 과거로 늘어남, s6 축소판) ---------------- */

const S12_WAVE_LEFT = 600;
const S12_WAVE_RIGHT = 1320;
const S12_WAVE_Y = 560;

export const S12Ear: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = (
  { f, frames, lines }
) => {
  const turnP = progress(f, 6, 20);
  const waveP = progress(f, frames * 0.3, frames * 0.82);
  const waveW = (S12_WAVE_RIGHT - S12_WAVE_LEFT) * waveP;

  const pts = React.useMemo(() => {
    const N = 60;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      out.push({ x: t * (S12_WAVE_RIGHT - S12_WAVE_LEFT), y: 26 * Math.sin(t * 26) });
    }
    return out;
  }, []);

  return (
    <PlainBg>
      <div
        style={{
          position: 'absolute', left: CX - 70, top: 220,
          transform: `rotate(${-18 * turnP}deg)`, transformOrigin: '50% 100%',
        }}
      >
        <ThemedIcon name="ear" size={140} color={C.ink} />
      </div>

      <svg width={S12_WAVE_RIGHT - S12_WAVE_LEFT} height={120}
        style={{ position: 'absolute', left: S12_WAVE_LEFT, top: S12_WAVE_Y - 60, overflow: 'visible' }}>
        <line x1={0} y1={60} x2={S12_WAVE_RIGHT - S12_WAVE_LEFT} y2={60} stroke={C.hill} strokeWidth={6} />
        {pts.slice(0, Math.max(2, Math.round((pts.length - 1) * (waveW / (S12_WAVE_RIGHT - S12_WAVE_LEFT))) + 1))
          .slice(0, -1).map((p, i, arr) => {
            const n = arr[i + 1] ?? p;
            return (
              <line key={i} x1={p.x} y1={p.y + 60} x2={n.x} y2={n.y + 60} stroke={C.coral}
                strokeWidth={7} strokeLinecap="round" />
            );
          })}
      </svg>

      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S13: 클로징 - 캐릭터 복귀, 주변을 훑다가 시계로 시선이 돌아온다 ---------------- */

export const S13Closing: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's13', f));
  const toThinkP = progress(f, 0, 16);
  const basePose = blendPose(POSES.idle, POSES.thinking, toThinkP);

  // 시선(headTilt)이 창문 -> 책상 -> 시계 순으로 살짝살짝 옮겨간다 (전부 frame 기반 결정 함수)
  const lookWindow = progress(f, frames * 0.18, frames * 0.3) * (1 - progress(f, frames * 0.34, frames * 0.4));
  const lookDesk = progress(f, frames * 0.42, frames * 0.52) * (1 - progress(f, frames * 0.56, frames * 0.62));
  const lookClock = progress(f, frames * 0.7, frames * 0.86);
  const headTilt = (basePose.headTilt ?? 0) - lookWindow * 10 + lookDesk * 6 + lookClock * 16;
  const pose: Pose = { ...basePose, headTilt };

  return (
    <PlainBg>
      <CornerClock f={f} opacity={0.3 + 0.7 * lookClock} />

      {/* 창문 실루엣 */}
      <div style={{ position: 'absolute', left: 260, top: 300, opacity: 0.5 + 0.5 * lookWindow }}>
        <svg width={220} height={260}>
          <rect x={4} y={4} width={212} height={252} rx={12} fill="none" stroke={C.inkSoft} strokeWidth={8} />
          <line x1={110} y1={4} x2={110} y2={256} stroke={C.inkSoft} strokeWidth={6} />
          <line x1={4} y1={130} x2={216} y2={130} stroke={C.inkSoft} strokeWidth={6} />
        </svg>
      </div>

      {/* 책상 실루엣 */}
      <div style={{ position: 'absolute', left: 1440, top: 640, opacity: 0.5 + 0.5 * lookDesk }}>
        <svg width={260} height={140}>
          <rect x={0} y={30} width={260} height={16} fill={C.inkSoft} />
          <rect x={16} y={46} width={16} height={80} fill={C.inkSoft} />
          <rect x={228} y={46} width={16} height={80} fill={C.inkSoft} />
        </svg>
      </div>

      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen}
        breathAmp={1} />
      <Cap line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
