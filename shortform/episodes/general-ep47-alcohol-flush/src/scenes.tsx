/** 이 화(general-ep47, "술만 마시면 얼굴 빨개지는 이유") 전용 장면.
 *
 *  s1(캐릭터가 술잔을 들어 한 모금 마심, 무성) -> s2(BustActor 리액션 "나만 왜 빨개지지",
 *  옅은 홍조 시작) -> s3(AlcoholBreakdownDiagram - 알코올 -> 독성 물질 전환) -> s4(같은
 *  다이어그램, 효소 게이지가 약하게 채워짐) -> s5(CheekFlushDiagram - 볼 혈관이 넓어지며
 *  얼굴이 붉어짐) -> s6(자주 마심 vs 가끔 마심 캐릭터 비교, 같은 홍조로 "마시는 양과 무관"
 *  강조) -> s7(조용한 결론, 캐릭터 클로즈업 + 캡션만).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 얼굴이 붉어지는 변화는 색 오버레이로
 *  자연스럽게(우스꽝스럽거나 불쾌하지 않게) 보여준다. 분해 과정은 큰 도형이 단계별로
 *  바뀌는 형태로 단순화하고 분자 구조식을 그리지 않는다(AlcoholBreakdownDiagram). 술은
 *  잔 하나로 담백하게 그리고(ThemedIcon 'glass-full' 재사용, 새 SVG 안 그림) 여러 병을
 *  늘어놓지 않는다. 혈관은 굵은 선 몇 가닥(CheekFlushDiagram - 볼마다 3가닥)으로만
 *  표현하고 점을 흩뿌리지 않는다("신체 표현은 최소한으로" 원칙).
 */
import React from 'react';
import {
  Actor, AlcoholBreakdownDiagram, BustActor, C, Caption, CheekFlushDiagram, FEET_VB, FPS,
  GROUND, Label, PlainBg, POSES, RIG, ThemedIcon, W, blendPose, breathe, buildPeakRelease,
  handPos, mouthAt, mouthProp, progress,
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
 * S1: 술잔을 들어 한 모금 마심 (무성)
 * ================================================================ */

const ACTOR_SIZE = 1600;
const ACTOR_GROUND = 1370;
const GLASS_ICON_SIZE = 190;

/** 잔을 들어 입가로 가져가는 팔 각도 - EAT_POSE(general-ep01)와 같은 방식(팔이 접혀 손이
 *  얼굴 앞에 온다), 술잔 소품이라 손 각도만 살짝 다르게 잡았다 */
const RAISE_POSE: Pose = { armL: { s: 96, e: 32 }, armR: { s: -42, e: -18 } };

/** 잔이 입에 닿는 순간(빌드 종료) - Episode.tsx가 sip_slurp SFX를 이 프레임에 맞춘다 */
export const S1_SIP_PEAK_LOCAL = 24;

export const S1Sip: React.FC<{ f: number }> = ({ f }) => {
  // 들어올림(0~24) - 유지(24~40) - 내려놓음(40~56)
  const raiseT = buildPeakRelease(f, 6, S1_SIP_PEAK_LOCAL - 6, 16, 16);
  const pose = blendPose(POSES.idle, RAISE_POSE, raiseT);
  // 잔이 입에 닿아 있는 동안 한 모금 마시는 작은 입 벌림
  const sipT = buildPeakRelease(f, S1_SIP_PEAK_LOCAL + 2, 4, 8, 8);
  const mouthOpen = 0.14 + sipT * 0.22;

  const size = ACTOR_SIZE;
  const centerX = CX;
  const ground = ACTOR_GROUND;
  const top = ground - (FEET_VB * size) / RIG.H;
  const left = centerX - (RIG.CX * size) / RIG.W;
  const hand = handPos('L', pose.armL!);
  const scale = size / RIG.W;
  const b = breathe(f, 1);
  const glassX = left + hand.x * scale;
  const glassY = top + hand.y * scale + b.dy;

  return (
    <PlainBg ground={ground} groundColor={C.roomDeep} top={C.room} bottom={C.paper}>
      <Actor size={size} centerX={centerX} ground={ground} pose={pose} mouthOpen={mouthOpen} />
      <div
        style={{
          position: 'absolute', left: glassX - GLASS_ICON_SIZE * 0.36, top: glassY - GLASS_ICON_SIZE * 0.82,
          transform: `rotate(${-14 + raiseT * -6}deg)`, transformOrigin: '50% 88%',
        }}
      >
        <ThemedIcon name="glass-full" size={GLASS_ICON_SIZE} color={C.ink} strokePx={11} />
      </div>
    </PlainBg>
  );
};

/* ================================================================
 * S2: "나만 왜 이렇게 얼굴이 빨개지지" 리액션 (바스트샷, 립싱크)
 * ================================================================ */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const blushT = progress(f, 8, frames - 10);
  const pose: Pose = { ...POSES.surprised, blush: 1 + 0.35 * blushT };
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3/S4 공용 레이아웃: AlcoholBreakdownDiagram
 * ================================================================ */

// 다이어그램 viewBox(820x520)가 가로로 납작해 원래 폭(760)으로는 위아래 여백이 과도했다
// (out/stills/f_375.png 실측 - 체크리스트 16번, 27·33·35·40·42·43화와 같은 유형). 세로 안전
// 영역(SAFE_TOP~자막 상단, 대략 240~1550)에 맞춰 폭을 키우고 중앙에 오도록 재배치했다.
const DIAG_W = 1000;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 580;

export const S3Convert: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const convertProgress = progress(f, 10, frames - 20);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <AlcoholBreakdownDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} toxicLabel={t.s3Toxic} convertProgress={convertProgress}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S4Enzyme: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const breakdownProgress = progress(f, 10, frames - 30);
  const labelP = progress(f, frames - 26, frames - 6);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <AlcoholBreakdownDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} toxicLabel={t.s3Toxic}
        convertProgress={1} breakdownProgress={breakdownProgress} enzymeWeak
      />
      <Label x={CX} y={358} text={t.s4Label} size={48} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 볼 혈관이 넓어지며 얼굴이 붉어짐 (CheekFlushDiagram)
 * ================================================================ */

const FLUSH_SIZE = 900;
const FLUSH_LEFT = (W - FLUSH_SIZE) / 2;
const FLUSH_TOP = 470;

export const S5Flush: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const flushProgress = progress(f, 8, frames - 30);
  const labelP = progress(f, frames - 26, frames - 6);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <CheekFlushDiagram
        f={f} width={FLUSH_SIZE} x={FLUSH_LEFT} y={FLUSH_TOP} flushProgress={flushProgress}
      />
      <Label x={CX} y={370} text={t.s5Label} size={50} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 자주 마심 vs 가끔 마심 - 같은 홍조, "마시는 양과 무관"
 * ================================================================ */

const CMP_BUST_SIZE = 460;
const CMP_GAP = 150;
const CMP_LEFT_X = CX - CMP_GAP / 2 - CMP_BUST_SIZE;
const CMP_RIGHT_X = CX + CMP_GAP / 2;
const CMP_TOP = 620;
const CMP_ICON_Y = CMP_TOP - 130;
/** 두 캐릭터가 같은 진하기의 홍조를 보이는 정도(고정 - "같다"는 게 핵심이라 애니메이션으로
 *  차이를 주지 않는다) */
const CMP_BLUSH = 1.4;

export const S6Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const popP = progress(f, 8, 30);
  const eqP = progress(f, 24, 44);
  const labelP = progress(f, 40, 60);

  const pose: Pose = { ...POSES.idle, blush: CMP_BLUSH };

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      <div style={{ opacity: popP, transform: `scale(${0.85 + 0.15 * popP})`, transformOrigin: `${CMP_LEFT_X + CMP_BUST_SIZE / 2}px ${CMP_TOP + CMP_BUST_SIZE / 2}px` }}>
        <BustActor size={CMP_BUST_SIZE} left={CMP_LEFT_X} top={CMP_TOP} pose={pose} breathAmp={0.8} />
      </div>
      <div style={{ opacity: popP, transform: `scale(${0.85 + 0.15 * popP})`, transformOrigin: `${CMP_RIGHT_X + CMP_BUST_SIZE / 2}px ${CMP_TOP + CMP_BUST_SIZE / 2}px` }}>
        <BustActor size={CMP_BUST_SIZE} left={CMP_RIGHT_X} top={CMP_TOP} pose={pose} breathAmp={0.8} blinkOffset={11} />
      </div>

      <div style={{ position: 'absolute', left: CMP_LEFT_X + CMP_BUST_SIZE / 2 - 44, top: CMP_ICON_Y, opacity: popP }}>
        <ThemedIcon name="repeat" size={88} color={C.inkSoft} strokePx={11} />
      </div>
      <div style={{ position: 'absolute', left: CMP_RIGHT_X + CMP_BUST_SIZE / 2 - 44, top: CMP_ICON_Y, opacity: popP }}>
        <ThemedIcon name="calendar" size={88} color={C.inkSoft} strokePx={11} />
      </div>

      <Label x={CMP_LEFT_X + CMP_BUST_SIZE / 2} y={CMP_TOP + CMP_BUST_SIZE + 30} text={t.s6Frequent} size={38} color={C.inkSoft} style={{ opacity: popP }} />
      <Label x={CMP_RIGHT_X + CMP_BUST_SIZE / 2} y={CMP_TOP + CMP_BUST_SIZE + 30} text={t.s6Occasional} size={38} color={C.inkSoft} style={{ opacity: popP }} />

      {eqP > 0.01 ? (
        <div style={{ position: 'absolute', left: CX - 40, top: CMP_TOP + CMP_BUST_SIZE / 2 - 40, opacity: eqP }}>
          <ThemedIcon name="equal" size={80} color={C.ink} strokePx={13} />
        </div>
      ) : null}

      <Label x={CX} y={340} text={t.s6Label} size={50} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 조용한 결론 - 클로즈업, 그래픽 없이 캡션만
 * ================================================================ */

const S7_BUST_SIZE = 1000;
const S7_BUST_LEFT = (W - S7_BUST_SIZE) / 2;
const S7_BUST_TOP = 480;

export const S7Outro: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const pose: Pose = { ...POSES.idle, blush: 1.5 };

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={S7_BUST_SIZE} left={S7_BUST_LEFT} top={S7_BUST_TOP} pose={pose} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
