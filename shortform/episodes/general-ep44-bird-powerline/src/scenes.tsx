/** 이 화(general-ep44, "전깃줄에 앉은 새가 감전되지 않는 이유") 전용 장면.
 *
 *  s1(전봇대+전깃줄, 새 여러 마리가 나란히 앉음, 평화로운 톤) -> s2(전선 확대, 두 지점 사이
 *  전압 차이 개념 + 번개 아이콘) -> s3(새 발 두 개 클로즈업, 거의 0인 간격) -> s4(새 몸 vs
 *  전선 저항 비교 막대) -> s5(전류가 새를 피해 전선을 타고 흐름) -> s6(다른 전선에 다른 발을
 *  걸치는 위험 자세, 경고색 전환) -> s7(스파크가 몸을 관통, "위험" 라벨) -> s8(독수리·매가
 *  전선 두 줄에 걸쳐 있는 실제 사례).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 새가 한 줄에 앉은 경우(발이 거의 붙음)와 두
 *  줄에 걸친 경우(발이 멀리 벌어짐)의 대비가 중심이다 - `Bird`의 `footGap`(props/Bird.tsx)
 *  하나로 s3(0)부터 s6~s8(1)까지 이어서 표현한다. 감전 장면은 무섭거나 잔인하지 않게 -
 *  `PowerlineDiagram`의 굵은 지그재그 스파크 선 1가닥 + 경고 아이콘(ThemedIcon
 *  alert-triangle)만 쓰고 새가 다치는 모습은 그리지 않는다. 전류는 굵은 화살표 한두 개로만
 *  표현하고 작은 점·번개 모양을 잔뜩 뿌리지 않는다. "붉은 경고색 전환"(s6)은 새 색 토큰을
 *  만들지 않고 이미 승인된 액센트(coral)의 배경 톤을 진하게 써서 표현한다(general 프로필
 *  6절 "2색을 넘기지 않는다").
 */
import React from 'react';
import {
  Bird, BIRD_FOOT_BASE_Y, BIRD_LEFT_FOOT_X, BIRD_RIGHT_FOOT_SPREAD_DX,
  BIRD_RIGHT_FOOT_X_AT_0, BIRD_VB_H, BIRD_VB_W, C, Caption, CompareBars, FlashOverlay, FPS,
  GROUND, Label, PlainBg, PopIn, PowerlineDiagram, ThemedIcon, W, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** 새의 중심 y를 계산 - 왼발(고정 다리)이 정확히 wireY에 닿도록 맞춘다 */
function birdYForWire(width: number, wireY: number) {
  const scale = width / BIRD_VB_W;
  const height = (width * BIRD_VB_H) / BIRD_VB_W;
  return wireY - BIRD_FOOT_BASE_Y * scale + height / 2;
}
/** 새의 왼발 x(화면 절대좌표) */
function birdLeftFootX(width: number, birdX: number) {
  const scale = width / BIRD_VB_W;
  return birdX - width / 2 + BIRD_LEFT_FOOT_X * scale;
}
/** 새의 오른발 x(화면 절대좌표, footGap에 따라 이동) */
function birdRightFootX(width: number, birdX: number, footGap: number) {
  const scale = width / BIRD_VB_W;
  return birdX - width / 2 + (BIRD_RIGHT_FOOT_X_AT_0 + footGap * BIRD_RIGHT_FOOT_SPREAD_DX) * scale;
}
/* ================================================================
 * S1: 전봇대 + 전깃줄, 새 여러 마리가 나란히 앉아 있음 (평화로운 톤)
 * ================================================================ */

const S1_WIRE_Y = 1020;
const S1_WIRE_LEFT = 120;
const S1_WIRE_RIGHT = 980;
const S1_POLE_X = 210;
const S1_POLE_TOP = S1_WIRE_Y - 140;
const S1_CROSSBAR_TOP = S1_WIRE_Y - 156;

export const S1Perch: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* 전봇대 */}
        <rect x={S1_POLE_X - 15} y={S1_POLE_TOP} width={30} height={GROUND - S1_POLE_TOP} fill={C.roomDeep} stroke={C.ink} strokeWidth={9} />
        <rect x={S1_POLE_X - 90} y={S1_CROSSBAR_TOP} width={180} height={26} rx={12} fill={C.roomDeep} stroke={C.ink} strokeWidth={9} />
        {/* 전깃줄 - 살짝 처진 곡선 */}
        <path
          d={`M ${S1_WIRE_LEFT} ${S1_WIRE_Y} Q ${(S1_WIRE_LEFT + S1_WIRE_RIGHT) / 2} ${S1_WIRE_Y + 24} ${S1_WIRE_RIGHT} ${S1_WIRE_Y}`}
          fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round"
        />
      </svg>
      {[380, 590, 790].map((bx, i) => (
        <Bird
          key={i} width={180} x={bx} y={birdYForWire(180, S1_WIRE_Y)} footGap={0}
          style={{ opacity: progress(f, 6 + i * 6, 30 + i * 6) }}
        />
      ))}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S2: 전선 확대 - 두 지점 사이 전압 차이(전위차) 개념 + 번개 아이콘
 * ================================================================ */

const S2_WIRE_Y = 1140;
const S2_LEFT = 130;
const S2_RIGHT = 950;
const S2_PT_A = 350;
const S2_PT_B = 730;

export const S2Voltage: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const gapP = progress(f, 10, 40);
  const iconP = progress(f, 18, 42);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PowerlineDiagram left={S2_LEFT} right={S2_RIGHT} wireY={S2_WIRE_Y} pointAX={S2_PT_A} pointBX={S2_PT_B} gapProgress={gapP} />
      <PopIn cx={CX} cy={S2_WIRE_Y - 190} size={110} progress={iconP} fromScale={0.3}>
        <ThemedIcon name="bolt" size={110} color={C.gold} />
      </PopIn>
      <Label x={CX} y={S2_WIRE_Y - 290} text={t.s2Label} size={54} color={C.ink} style={{ opacity: iconP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 새 발 두 개 클로즈업 - 전압 차이 거의 0
 * ================================================================ */

const S3_WIRE_Y = 1200;
const S3_LEFT = 100;
const S3_RIGHT = 980;
const S3_BIRD_WIDTH = 620;
const S3_BIRD_X = CX + 40;
const S3_BIRD_HEIGHT = (S3_BIRD_WIDTH * BIRD_VB_H) / BIRD_VB_W;
const S3_BIRD_TOP = birdYForWire(S3_BIRD_WIDTH, S3_WIRE_Y) - S3_BIRD_HEIGHT / 2;

export const S3FeetCloseup: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const gapP = progress(f, 12, 42);
  const labelP = progress(f, 26, 50);
  const ptA = birdLeftFootX(S3_BIRD_WIDTH, S3_BIRD_X) - 30;
  const ptB = birdRightFootX(S3_BIRD_WIDTH, S3_BIRD_X, 0) + 40;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* 라벨을 새 머리 위 충분한 여백에 둬 겹치지 않게 한다(새 크기에 따라 동적 계산) */}
      <Label x={CX} y={S3_BIRD_TOP - 90} text={t.s3Label} size={56} color={C.ink} style={{ opacity: labelP }} />
      <PowerlineDiagram left={S3_LEFT} right={S3_RIGHT} wireY={S3_WIRE_Y} pointAX={ptA} pointBX={ptB} gapProgress={gapP} />
      <Bird width={S3_BIRD_WIDTH} x={S3_BIRD_X} y={birdYForWire(S3_BIRD_WIDTH, S3_WIRE_Y)} footGap={0} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 새 몸 저항 vs 전선 저항 비교 막대
 * ================================================================ */

export const S4ResistanceBars: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CompareBars
        x={190} y={920} pxPerUnit={62} frame={f} rowGap={230}
        items={[
          { label: t.s4LabelBird, value: 11, color: C.coral, at: 8, thickness: 64 },
          { label: t.s4LabelWire, value: 1, color: C.gold, at: 26, thickness: 64 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 전류가 새를 피해 전선을 타고 흐름
 * ================================================================ */

const S5_WIRE_Y = 1150;
const S5_LEFT = 100;
const S5_RIGHT = 980;
const S5_BIRD_WIDTH = 340;
const S5_BIRD_X = CX;

export const S5CurrentBypass: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const currentP = f / FPS; // 계속 순환(내부 mod 1)

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PowerlineDiagram
        left={S5_LEFT} right={S5_RIGHT} wireY={S5_WIRE_Y}
        pointAX={birdLeftFootX(S5_BIRD_WIDTH, S5_BIRD_X)} currentProgress={currentP}
      />
      <Bird width={S5_BIRD_WIDTH} x={S5_BIRD_X} y={birdYForWire(S5_BIRD_WIDTH, S5_WIRE_Y)} footGap={0} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 다른 전선에 다른 발을 걸치는 위험 자세 (경고색 전환)
 * ================================================================ */

const S6_WIRE1_Y = 840;
/** 두 번째 전선 y - s7이 그대로 이어받는다(다음 장면에서 상태를 명시적으로 유지) */
export const S6_WIRE2_Y = S6_WIRE1_Y + 320;
const S6_LEFT = 90;
const S6_RIGHT = 990;
const S6_BIRD_WIDTH = 300;
const S6_BIRD_X = CX - 40;

export const S6DangerPose: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const spreadP = progress(f, 8, 46);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <PowerlineDiagram
        left={S6_LEFT} right={S6_RIGHT} wireY={S6_WIRE1_Y} wire2Y={S6_WIRE2_Y}
        pointAX={birdLeftFootX(S6_BIRD_WIDTH, S6_BIRD_X)}
        pointBX={birdRightFootX(S6_BIRD_WIDTH, S6_BIRD_X, spreadP)}
        pointBOnWire2
      />
      <Bird width={S6_BIRD_WIDTH} x={S6_BIRD_X} y={birdYForWire(S6_BIRD_WIDTH, S6_WIRE1_Y)} footGap={spreadP} />
      <PopIn cx={CX + 280} cy={S6_WIRE1_Y - 60} size={90} progress={progress(f, 30, 52)} fromScale={0.3}>
        <ThemedIcon name="alert-triangle" size={90} color={C.coral} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 스파크가 몸을 관통 - "위험" 라벨
 * ================================================================ */

const S7_BIRD_WIDTH = S6_BIRD_WIDTH;
const S7_BIRD_X = S6_BIRD_X;
/** 스파크가 정점에 도달하는 지점 - Episode.tsx가 이 비율로 SFX/FlashOverlay 프레임을 계산한다 */
export const S7_SHOCK_PEAK_AT = 0.42;

export const S7Shock: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const peakFrame = Math.round(frames * S7_SHOCK_PEAK_AT);
  const shockP = progress(f, peakFrame - 14, peakFrame);
  const labelP = progress(f, peakFrame - 6, peakFrame + 14);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <PowerlineDiagram
        left={S6_LEFT} right={S6_RIGHT} wireY={S6_WIRE1_Y} wire2Y={S6_WIRE2_Y}
        pointAX={birdLeftFootX(S7_BIRD_WIDTH, S7_BIRD_X)}
        pointBX={birdRightFootX(S7_BIRD_WIDTH, S7_BIRD_X, 1)}
        pointBOnWire2 shockProgress={shockP}
      />
      {/* footGap=1 고정 - s6에서 이어받은 위험 자세를 그대로 유지 */}
      <Bird width={S7_BIRD_WIDTH} x={S7_BIRD_X} y={birdYForWire(S7_BIRD_WIDTH, S6_WIRE1_Y)} footGap={1} />
      <PopIn cx={CX + 250} cy={S6_WIRE1_Y + 80} size={130} progress={labelP} fromScale={0.4}>
        <ThemedIcon name="alert-triangle" size={130} color={C.coral} />
      </PopIn>
      <Label x={CX + 250} y={S6_WIRE1_Y + 160} text={t.s7Label} size={60} color={C.coral} style={{ opacity: labelP }} />
      <FlashOverlay frame={f} at={peakFrame} color={C.coral} peak={0.5} rise={3} fall={14} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S8: 독수리·매가 전선 두 줄에 걸쳐 있는 실제 사례
 * ================================================================ */

const S8_WIRE1_Y = 800;
const S8_WIRE2_Y = 1220;
const S8_LEFT = 60;
const S8_RIGHT = 1020;
const S8_BIRD_WIDTH = 560;
const S8_BIRD_X = CX + 20;

export const S8Raptor: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const enterP = progress(f, 4, 32);
  const labelP = progress(f, 24, 48);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PowerlineDiagram
        left={S8_LEFT} right={S8_RIGHT} wireY={S8_WIRE1_Y} wire2Y={S8_WIRE2_Y}
        pointAX={birdLeftFootX(S8_BIRD_WIDTH, S8_BIRD_X)}
        pointBX={birdRightFootX(S8_BIRD_WIDTH, S8_BIRD_X, 1)}
        pointBOnWire2
      />
      <div style={{ opacity: enterP }}>
        <Bird
          width={S8_BIRD_WIDTH} x={S8_BIRD_X} y={birdYForWire(S8_BIRD_WIDTH, S8_WIRE1_Y)}
          footGap={1} wingSpread={1}
        />
      </div>
      <PopIn cx={CX - 320} cy={S8_WIRE1_Y - 40} size={80} progress={labelP} fromScale={0.3}>
        <ThemedIcon name="alert-triangle" size={80} color={C.coral} />
      </PopIn>
      <Label x={CX - 320} y={S8_WIRE1_Y + 60} text={t.s8Label} size={44} color={C.coral} style={{ opacity: labelP }} wrapWidth={280} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
