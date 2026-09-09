/** 이 화(general-ep45, "처음 온 곳인데 와본 것 같은 이유") 전용 장면.
 *
 *  s1(캐릭터가 낯선 공간의 아치문을 지나 들어서다 멈칫 - 문 정중앙을 지나는 순간 DoorFrame
 *  플래시 + 뒤이어 옅은 잔상 실루엣이 살짝 겹침) -> s2("데자뷔" 용어 카드 팝인, 프랑스어
 *  뜻풀이) -> s3(캐릭터 thinking 포즈 + QMark) -> s4(MemoryOverlapDiagram 이중노출 모드,
 *  "가설 1") -> s5(MemoryOverlapDiagram 좌우 반구 시간차 모드, "가설 2") -> s6(HeadNerveDiagram
 *  이마 하이라이트 재사용 + 전극 막대가 내려와 닿는 순간 스파크, "전기 자극 실험") -> s7
 *  (CompareBars로 10대~50대+ 상대적 빈도, 나이가 들수록 옅어지는 색).
 *
 *  이 화는 전 구간이 내레이션 위주 설명이라(첫 문장부터 사실로 시작, general 프로필 규칙)
 *  캐릭터가 직접 대사를 "말하는" 리액션 구간이 없다 - 립싱크(mouthAt)를 쓰지 않는다
 *  (ep06/ep22/ep24/ep33/ep35/ep37/ep39/ep41과 같은 원칙).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): "처음인데 익숙하다"는 감각을 같은 장면이
 *  옅게 겹쳐 보이는 식으로 표현한다(s1 잔상, s4 이중노출). 뇌를 해부도로 그리지 않고
 *  단순한 도형과 굵은 선으로만 표현한다(MemoryOverlapDiagram, HeadNerveDiagram 재사용).
 *  가설이 여럿이라는 것은 물음표를 남발하지 않고 "가설 1"/"가설 2" 라벨 2개로만 정리한다.
 *  신비롭거나 무서운 분위기로 가지 않는다 - 배경은 전부 밝은 파스텔 톤(sky/room/goldSoft
 *  등)만 쓰고 어두운 톤(C.night 계열)은 쓰지 않는다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CompareBars, DoorFrame, FOREHEAD_PT, FPS, GROUND,
  HeadNerveDiagram, Label, MemoryOverlapDiagram, PlainBg, POSES, PopIn, QMark, RadialSpikes,
  ThemedIcon, W, buildPeakRelease, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* 공용 다이어그램 배치(s4/s5가 같은 자리를 써서 장면 전환에도 위치가 안 튄다) */
const DIAG_W = 700;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 560;

/* ================================================================
 * S1: 아치문을 지나 낯선 공간에 들어섬 -> 정중앙에서 멈칫 -> 잔상이 살짝 겹침
 * ================================================================ */

const DOOR_W = 600;
const DOOR_H = 860;
const DOOR_X = CX - DOOR_W / 2;
const DOOR_Y = GROUND - DOOR_H;
const ACTOR_SIZE = 640;
/** 문 안쪽 중앙(CX)에서 멈춰 선다 - 양쪽 문설주에서 충분히 떨어져 캐릭터가 기둥과
 *  겹치지 않는다. DoorFrame 의 플래시는 crossProgress=0.5 에서 최고조이므로, 캐릭터가
 *  도착하는 순간(moveT=1)에 정확히 crossProgress=0.5 가 되도록 절반 스케일로 넘긴다
 *  (아래 crossProgress={smooth * 0.5}) - "문 정중앙에 실제로 섰을 때 플래시가 터진다"를
 *  캐릭터가 문 기둥까지 걸어가지 않고도 만족시킨다. */
const WALK_START_X = 220;
const WALK_END_X = CX;
const WALK_END_FRAME = 108;

export const S1Enter: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const moveT = progress(f, 8, WALK_END_FRAME);
  const smooth = moveT * moveT * (3 - 2 * moveT);
  const centerX = WALK_START_X + (WALK_END_X - WALK_START_X) * smooth;
  const pauseT = progress(f, WALK_END_FRAME, WALK_END_FRAME + 26);
  const ghostP = progress(f, WALK_END_FRAME + 14, frames - 10) * 0.3;

  const pose: Pose = {
    ...POSES.idle,
    eyeOpen: 1 + 0.25 * pauseT,
    headTilt: (POSES.idle.headTilt ?? 0) + 5 * pauseT,
  };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={GROUND} groundColor={C.roomDeep}>
      <DoorFrame width={DOOR_W} height={DOOR_H} x={DOOR_X} y={DOOR_Y} crossProgress={smooth * 0.5} />
      {ghostP > 0.01 ? (
        <Actor
          size={ACTOR_SIZE} centerX={centerX - 32} ground={GROUND - 22} pose={pose} breathAmp={0}
          style={{ opacity: ghostP }}
        />
      ) : null}
      <Actor size={ACTOR_SIZE} centerX={centerX} pose={pose} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S2: "데자뷔" 용어 카드 팝인 - 프랑스어로 "이미 봤다"
 * ================================================================ */

const CARD_W = 760;
const CARD_H = 360;
const CARD_X = CX - CARD_W / 2;
const CARD_Y = 640;

export const S2Term: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const cardP = progress(f, 8, 30);
  const wordP = progress(f, 20, 42);
  const subP = progress(f, 40, 62);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <div
        style={{
          position: 'absolute', left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H,
          borderRadius: 40, background: C.paper, border: `13px solid ${C.ink}`,
          opacity: cardP, transform: `scale(${0.85 + 0.15 * cardP})`, transformOrigin: '50% 50%',
        }}
      />
      <PopIn cx={CX} cy={CARD_Y - 70} size={100} progress={wordP} fromScale={0.4}>
        <ThemedIcon name="repeat" size={100} color={C.gold} />
      </PopIn>
      <Label
        x={CX} y={CARD_Y + 60} text={t.s2Term} size={120} color={C.ink}
        style={{
          opacity: wordP,
          transform: `translateX(-50%) scale(${0.7 + 0.3 * wordP})`, transformOrigin: '50% 50%',
        }}
      />
      <Label
        x={CX} y={CARD_Y + 210} text={t.s2Sub} size={46} color={C.inkSoft}
        style={{ opacity: subP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: thinking 포즈 + 물음표
 * ================================================================ */

const S3_BUST_SIZE = 900;
const S3_BUST_LEFT = (W - S3_BUST_SIZE) / 2;
const S3_BUST_TOP = 520;

export const S3Wonder: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const qP = progress(f, 14, 40);
  const bob = Math.sin(f / 14) * 6 * Math.min(1, qP);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={S3_BUST_SIZE} left={S3_BUST_LEFT} top={S3_BUST_TOP} pose={POSES.thinking} />
      <QMark size={130} style={{ left: CX + 210, top: 300 + bob, opacity: qP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 이중노출 - 지금 장면과 흐릿한 옛 기억이 겹침 (가설 1)
 * ================================================================ */

export const S4Overlap: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const overlapProgress = progress(f, 10, frames - 40);
  const labelP = progress(f, frames - 34, frames - 10);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MemoryOverlapDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} overlapProgress={overlapProgress}
      />
      <Label x={CX} y={370} text={t.s4Label} size={54} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 좌우 반구 신호 도착 시간차 (가설 2)
 * ================================================================ */

/** 오른쪽(지연) 신호가 도착해 잔상이 맥동하기 시작하는 지점(processProgress 기준) -
 *  MemoryOverlapDiagram 내부 HEMI_LAG(0.18)+HEMI_TRAVEL(0.62) = 0.80과 맞춘다.
 *  Episode.tsx가 이 비율로 realize_ding SFX 프레임을 계산한다. */
export const S5_ECHO_AT = 0.8;

export const S5Process: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const processProgress = progress(f, 10, frames - 30);
  const labelP = progress(f, frames - 26, frames - 4);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MemoryOverlapDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} processProgress={processProgress}
      />
      <Label x={CX} y={370} text={t.s5Label} size={54} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 전극이 이마에 닿고 스파크가 튐 (HeadNerveDiagram 재사용)
 * ================================================================ */

const S6_BUST_SIZE = 940;
const S6_BUST_LEFT = (W - S6_BUST_SIZE) / 2;
const S6_BUST_TOP = 460;

const VB_X0 = 236;
const VB_Y0 = 132;
const VB_SPAN = 780;
function overlayToScreen(pt: { x: number; y: number }, size: number, x: number, y: number) {
  const scale = size / VB_SPAN;
  return { x: x + (pt.x - VB_X0) * scale, y: y + (pt.y - VB_Y0) * scale };
}
const FOREHEAD_SCREEN = overlayToScreen(FOREHEAD_PT, S6_BUST_SIZE, S6_BUST_LEFT, S6_BUST_TOP);

/** 전극 막대가 이마에 닿는 프레임 - Episode.tsx가 cold_zing SFX를 이 프레임에 맞춘다 */
export const S6_CONTACT_FRAME = 40;

const PROBE_LEN = 210;
const PROBE_W = 34;

export const S6Electrode: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const descendT = progress(f, 6, S6_CONTACT_FRAME);
  const sparkP = buildPeakRelease(f, S6_CONTACT_FRAME, 4, 14, 30);
  const forehead = progress(f, S6_CONTACT_FRAME - 2, S6_CONTACT_FRAME + 8);
  const labelP = progress(f, S6_CONTACT_FRAME + 20, S6_CONTACT_FRAME + 44);

  const tipY = FOREHEAD_SCREEN.y - 44 - (1 - descendT) * 320;
  const rodTop = tipY - PROBE_LEN;

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <HeadNerveDiagram
        f={f} width={S6_BUST_SIZE} x={S6_BUST_LEFT} y={S6_BUST_TOP}
        highlightForehead={forehead > 0.01}
      />
      {/* 전극 막대 - 순수 도형(둥근 막대 + 끝의 원형 팁) */}
      <div
        style={{
          position: 'absolute', left: FOREHEAD_SCREEN.x - PROBE_W / 2, top: rodTop,
          width: PROBE_W, height: PROBE_LEN, borderRadius: PROBE_W / 2,
          background: C.paper, border: `9px solid ${C.ink}`,
        }}
      />
      <div
        style={{
          position: 'absolute', left: FOREHEAD_SCREEN.x - 22, top: tipY - 22,
          width: 44, height: 44, borderRadius: 22,
          background: C.coral, border: `9px solid ${C.ink}`,
        }}
      />
      {sparkP > 0.01 ? (
        <RadialSpikes
          cx={FOREHEAD_SCREEN.x} cy={FOREHEAD_SCREEN.y} rx={30} ry={30} frame={f}
          progress={sparkP} count={10} length={30} width={7} color={C.coral}
        />
      ) : null}
      <Label x={CX} y={340} text={t.s6Label} size={52} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 연령대별 상대적 빈도 비교 (수치 없이 막대 길이만, 색은 나이 들수록 옅어짐)
 * ================================================================ */

/** 값·색만 정의한다(수치 없이 상대적 길이·색 대비만 보여준다는 대본 취지 - 라벨은
 *  strings.ts의 t.s7Age1~5에서 읽어 아래 S7AgeBars가 CompareBars items에 조립한다) */
const AGE_ROWS: { value: number; color: string }[] = [
  { value: 100, color: C.coral },
  { value: 90, color: '#FCA48F' },
  { value: 66, color: '#FDC3B4' },
  { value: 42, color: C.inkSoft },
  { value: 22, color: '#C7CFDC' },
];

export const S7AgeBars: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const ageLabels = [t.s7Age1, t.s7Age2, t.s7Age3, t.s7Age4, t.s7Age5];
  const items = AGE_ROWS.map((row, i) => ({
    label: ageLabels[i], value: row.value, color: row.color, at: 6 + i * 8, thickness: 60,
  }));

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      <CompareBars
        items={items} x={180} y={470} pxPerUnit={6.2} rowGap={162} labelGap={54} frame={f}
        labelSize={44}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
