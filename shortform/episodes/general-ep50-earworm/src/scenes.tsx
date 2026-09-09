/** 이 화(general-ep50, "노래가 하루 종일 맴도는 이유") 전용 장면.
 *
 *  s1(캐릭터가 집안일을 하며 무의식적으로 같은 멜로디를 흥얼거림, 무성) -> s2(BustActor
 *  리액션 "이 노래 왜 자꾸 맴돌지?") -> s3(MelodyLoopDiagram - 원형 루프 + "이어웜" 이름표)
 *  -> s4(벌레 아이콘이 귀 아이콘으로 들어가는 짧은 아이콘 컷, 이름의 유래) -> s5(물음표가
 *  옅게 떴다 사라지고 빈 카드 3장이 자리를 잡음) -> s6(카드1에 짧은 반복 루프 채워짐) ->
 *  s7(카드2에 완만한 예측 가능한 파형 채워짐) -> s8(카드3에 중간에 끊긴 루프 + "그런
 *  이야기가 있음" 배지) -> s9(캐릭터가 노래를 끝까지 크게 부르자 위에서 돌던 루프가
 *  잦아들며 멎음).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 같은 구간이 반복해서 도는 느낌이 핵심이라
 *  MelodyLoopDiagram(신규, props/에 등록)의 원형 루프를 s3·s6·s9에서 반복 재사용한다.
 *  음표는 화면에 잔뜩 뿌리지 않고 큰 음표 2~3개(noteCount=3)로만 표현한다. 뇌를 해부도로
 *  그리지 않는다(신체 표현 최소화 원칙) - 이 화는 애초에 뇌 내부를 그릴 필요가 없는
 *  소재라 아예 그리지 않았다. 답답한 느낌은 캐릭터 표정(SURPRISED류)으로 가볍게만
 *  표현하고 과장하지 않는다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, Card, FONT, FPS, FEET_VB, GROUND, Label, MelodyLoopDiagram,
  PlainBg, POSES, PulseRing, QMark, RADIUS, RIG, ThemedIcon, W,
  blendPose, breathe, buildPeakRelease, handPos, mouthAt, mouthProp, popIn, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * S1: 집안일을 하며 무의식적으로 같은 멜로디를 흥얼거림 (무성)
 * ================================================================ */

const ACTOR_SIZE = 1600;
const ACTOR_GROUND = 1370;
const BROOM_SIZE = 260;

export const S1Hum: React.FC<{ f: number }> = ({ f }) => {
  const centerX = CX;
  const ground = ACTOR_GROUND;
  const size = ACTOR_SIZE;
  const top = ground - (FEET_VB * size) / RIG.H;
  const left = centerX - (RIG.CX * size) / RIG.W;
  const scale = size / RIG.W;

  // 고개를 아주 살짝 까딱이며 흥얼거림 - 팔다리를 새로 리깅하지 않고 IDLE 그대로 두고
  // headTilt만 살짝 얹는다(원칙 4 - 기존 컴포넌트 내장 감쇠·이징을 또 곡선으로 만들지 않는다,
  // 여기선 별도 progress가 아니라 sin 하나뿐이라 해당 없음)
  const pose: Pose = { ...POSES.idle, headTilt: (POSES.idle.headTilt ?? 0) + 5 * Math.sin(f / 7) };
  // 흥얼거림은 입을 크게 벌리지 않는다(허밍) - s9(크게 부름)와 대비되도록 작게 유지
  const mouthOpen = 0.08 + 0.09 * Math.max(0, Math.sin((f % 22) / 22 * Math.PI));
  const b = breathe(f, 1);

  const hand = handPos('R', pose.armR!);
  const broomX = left + hand.x * scale;
  const broomY = top + hand.y * scale + b.dy;

  return (
    <PlainBg ground={ground} groundColor={C.roomDeep} top={C.room} bottom={C.paper}>
      <Actor size={size} centerX={centerX} ground={ground} pose={pose} mouthOpen={mouthOpen} />
      <svg
        width={BROOM_SIZE} height={BROOM_SIZE} viewBox="0 0 100 100"
        style={{
          position: 'absolute', left: broomX - BROOM_SIZE * 0.28, top: broomY - BROOM_SIZE * 0.7,
          overflow: 'visible', transform: `rotate(${18 + 3 * Math.sin(f / 14)}deg)`, transformOrigin: '50% 90%',
        }}
      >
        <line x1={50} y1={8} x2={50} y2={54} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <path d="M 34 54 L 66 54 L 74 90 L 26 90 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      </svg>
    </PlainBg>
  );
};

/* ================================================================
 * S2: "이 노래 왜 자꾸 맴돌지?" 리액션 (바스트샷, 립싱크)
 * ================================================================ */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const pose: Pose = POSES.surprised;
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 원형 루프 + "이어웜" 이름표
 * ================================================================ */

const S3_DIAG_W = 620;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 500;
const S3_RING_SIZE = 760;

export const S3Loop: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const loopP = progress(f, 8, 36);
  const labelP = progress(f, frames - 78, frames - 46);
  void frames;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PulseRing
        x={CX - S3_RING_SIZE / 2} y={S3_DIAG_Y + S3_DIAG_W / 2 - S3_RING_SIZE / 2}
        size={S3_RING_SIZE} frame={f} progress={loopP} color={C.coralSoft} opacity={0.5}
      />
      <MelodyLoopDiagram f={f} width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} loopProgress={loopP} />
      <Label
        x={CX} y={S3_DIAG_Y + S3_DIAG_W + 46} text={t.s3Term} size={68} color={C.ink}
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 벌레가 귀로 들어가는 짧은 아이콘 컷
 * ================================================================ */

const EAR_SIZE = 560;
const EAR_X = CX - EAR_SIZE / 2;
const EAR_Y = 760;
const EAR_CENTER = { x: CX, y: EAR_Y + EAR_SIZE / 2 };
const BUG_SIZE = 150;
const BUG_START = { x: CX - 380, y: 440 };
const BUG_END = { x: EAR_CENTER.x - 40, y: EAR_CENTER.y + 30 };

export const S4Bug: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const earP = progress(f, 0, 14);
  const flightP = progress(f, 10, frames - 34);
  const enterP = progress(f, frames - 30, frames - 12);
  const bugX = BUG_START.x + (BUG_END.x - BUG_START.x) * flightP;
  const bugY = BUG_START.y + (BUG_END.y - BUG_START.y) * flightP - 40 * Math.sin(flightP * Math.PI);
  const bugScale = 1 - 0.7 * enterP;
  const bugOpacity = (1 - enterP) * earP;

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      {enterP > 0.001 ? (
        <PulseRing
          x={EAR_CENTER.x - 180} y={EAR_CENTER.y - 180} size={360} frame={f}
          progress={enterP} color={C.gold} opacity={0.45}
        />
      ) : null}
      <div style={{ position: 'absolute', left: EAR_X, top: EAR_Y, opacity: earP }}>
        <ThemedIcon name="ear" size={EAR_SIZE} color={C.ink} strokePx={14} />
      </div>
      <div
        style={{
          position: 'absolute', left: bugX - BUG_SIZE / 2, top: bugY - BUG_SIZE / 2,
          opacity: bugOpacity, transform: `scale(${bugScale})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="bug" size={BUG_SIZE} color={C.coral} strokePx={13} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5~S8 공용: 특징 카드 3장 레이아웃
 * ================================================================ */

const CARD_W = 300;
const CARD_H = 520;
const CARD_GAP = 40;
const CARD_ROW_X = CX - (3 * CARD_W + 2 * CARD_GAP) / 2;
const CARD_ROW_Y = 700;
function cardX(i: number) { return CARD_ROW_X + i * (CARD_W + CARD_GAP); }
function cardCenter(i: number) { return { x: cardX(i) + CARD_W / 2, y: CARD_ROW_Y + CARD_H / 2 }; }

/* -------- S5: 물음표 -> 빈 카드 3장 자리잡기 -------- */

export const S5Setup: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const qMarkP = buildPeakRelease(f, 6, 18, 22, 20);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <QMark
        size={170} color={C.gold} outline={C.ink}
        style={{ left: CX, top: 420, transform: 'translate(-50%, -50%)', opacity: qMarkP }}
      />
      {[0, 1, 2].map((i) => (
        <Card
          key={i} x={cardX(i)} y={CARD_ROW_Y} w={CARD_W} h={CARD_H}
          progress={popIn(f, FPS, 50 + i * 10)}
        />
      ))}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S6: 카드1 - 짧고 반복되는 구절 -------- */

export const S6Short: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const loopP = progress(f, 10, frames - 24);
  const c0 = cardCenter(0);
  const diagW = CARD_W - 90;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {[0, 1, 2].map((i) => (
        <Card key={i} x={cardX(i)} y={CARD_ROW_Y} w={CARD_W} h={CARD_H} progress={1} />
      ))}
      <MelodyLoopDiagram
        f={f} width={diagW} x={c0.x - diagW / 2} y={c0.y - diagW / 2} loopProgress={loopP} noteCount={3}
        periodFrames={70}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S7: 카드2 - 완만하고 예측 가능한 멜로디 파형 -------- */

const WAVE_D = 'M 10 100 Q 75 30 140 100 Q 205 170 270 100 Q 335 30 400 100';
const WAVE_VB_W = 410;
const WAVE_VB_H = 200;

const PredictableWave: React.FC<{ x: number; y: number; width: number; progress: number }> = ({
  x, y, width, progress: p,
}) => (
  <svg
    width={width} height={(width * WAVE_VB_H) / WAVE_VB_W} viewBox={`0 0 ${WAVE_VB_W} ${WAVE_VB_H}`}
    style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}
  >
    <path
      d={WAVE_D} fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round"
      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p}
    />
  </svg>
);

export const S7Predictable: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const loopP = 1;
  const waveP = progress(f, 10, frames - 24);
  const c0 = cardCenter(0);
  const c1 = cardCenter(1);
  const diagW = CARD_W - 90;
  const waveW = CARD_W - 90;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {[0, 1, 2].map((i) => (
        <Card key={i} x={cardX(i)} y={CARD_ROW_Y} w={CARD_W} h={CARD_H} progress={1} />
      ))}
      <MelodyLoopDiagram
        f={f} width={diagW} x={c0.x - diagW / 2} y={c0.y - diagW / 2} loopProgress={loopP} noteCount={3}
        periodFrames={70}
      />
      <PredictableWave x={c1.x - waveW / 2} y={c1.y - (waveW * WAVE_VB_H) / WAVE_VB_W / 2} width={waveW} progress={waveP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S8: 카드3 - 중간에 끊긴 노래 + "그런 이야기가 있음" 배지 -------- */

export const S8Cut: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const cutP = progress(f, 10, frames - 30);
  const badgeP = progress(f, frames - 26, frames - 8);
  const c0 = cardCenter(0);
  const c1 = cardCenter(1);
  const c2 = cardCenter(2);
  const diagW = CARD_W - 90;
  const waveW = CARD_W - 90;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {[0, 1, 2].map((i) => (
        <Card key={i} x={cardX(i)} y={CARD_ROW_Y} w={CARD_W} h={CARD_H} progress={1} />
      ))}
      <MelodyLoopDiagram
        f={f} width={diagW} x={c0.x - diagW / 2} y={c0.y - diagW / 2} loopProgress={1} noteCount={3}
        periodFrames={70}
      />
      <PredictableWave x={c1.x - waveW / 2} y={c1.y - (waveW * WAVE_VB_H) / WAVE_VB_W / 2} width={waveW} progress={1} />
      <MelodyLoopDiagram
        f={f} width={diagW} x={c2.x - diagW / 2} y={c2.y - diagW / 2} loopProgress={1} cutProgress={cutP}
        noteCount={3}
      />
      <div
        style={{
          position: 'absolute', left: c2.x, top: CARD_ROW_Y + CARD_H + 40, transform: 'translate(-50%, 0)',
          opacity: badgeP, padding: '16px 30px', background: C.goldSoft, border: `5px solid ${C.ink}`,
          borderRadius: RADIUS.pill, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {t.s8Badge}
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S9: 노래를 끝까지 크게 부르자 돌던 루프가 잦아들며 멎음
 * ================================================================ */

// 캐릭터를 다른 씬보다 작게 잡는다(900) - 루프 다이어그램이 캐릭터 머리 위에 겹치지 않고
// 자리 잡을 세로 공간(SAFE_TOP=240 ~ 머리끝)이 필요하기 때문이다. 실측: 이 크기·바닥선
// 조합에서 머리끝이 y≈757이라 다이어그램(y=240, width=420, 바닥=660)과 97px 여유가 생긴다
const S9_ACTOR_SIZE = 900;
const S9_ACTOR_GROUND = 1370;
const S9_DIAG_W = 420;
const S9_DIAG_X = CX - S9_DIAG_W / 2;
const S9_DIAG_Y = 240;

export const S9SingItOut: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const singT = progress(f, 6, 30);
  const pose = blendPose(POSES.idle, POSES.cheer, singT);
  // blendPose는 mouthOpen을 보간하지 않으므로(포즈 각도만 담당) 직접 계산해 Actor에 넘긴다
  const mouthOpen = (POSES.cheer.mouthOpen ?? 0) * singT;
  const loopFadeStart = frames * 0.4;
  const loopP = 1 - progress(f, loopFadeStart, frames - 10);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={S9_ACTOR_GROUND} groundColor={C.hill}>
      {loopP > 0.001 ? (
        <MelodyLoopDiagram f={f} width={S9_DIAG_W} x={S9_DIAG_X} y={S9_DIAG_Y} loopProgress={loopP} noteCount={3} />
      ) : null}
      <Actor size={S9_ACTOR_SIZE} centerX={CX} ground={S9_ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
