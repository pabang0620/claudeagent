/** 이 화(general-ep63, "초콜릿이 입에서 순식간에 녹는 이유") 전용 장면.
 *
 *  s1(초콜릿 한 조각이 입에 들어가자마자 순식간에 녹아 사라지는 모습, 무성) -> s2(리액션+훅
 *  질문, 바스트샷) -> s3(WaterMoleculeLattice로 카카오버터 분자가 촘촘한 결정을 이루는 모습,
 *  crystallizeProgress 0->1) -> s4(ThermoScale로 상온/녹는점/체온을 한 눈금 위에 놓고 녹는점과
 *  체온이 거의 붙어 있음을 브래킷으로 보여줌) -> s5(WaterMoleculeLattice crystallizeProgress
 *  1->0으로 결정이 급격히 무너짐 + 입 안 클로즈업에 "37도" 라벨) -> s6(여름 햇볕 아래 주머니
 *  속 초콜릿이 서서히 녹는 모습, Chocolate melt 서서히 진행) -> s7(버터 vs 초콜릿의 "녹는
 *  온도 범위"를 CompareBars로 비교 - 버터는 넓고 완만해 긴 막대, 초콜릿은 좁고 뾰족해 짧은
 *  막대).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 고체 초콜릿이 액체로 변하는 과정을 단면/형태
 *  변화로 보여줄 것, 초콜릿은 먹음직스럽고 깔끔하게 그릴 것, 온도 비교는 막대/온도계로 단순히
 *  보여줄 것, 손 위와 입 안 두 곳에서 녹는 속도 차이를 대비시킬 것(s2는 손에 있을 땐 멀쩡했다는
 *  자문으로, s1/s5는 입 안에서 순식간에 녹는 모습으로 대비).
 *  builder 원칙 5 "리액션 바스트샷 장면에는 소품을 넣지 않는다"를 따라 s2에는 캐릭터와
 *  자막만 두고 초콜릿 소품을 겹치지 않는다.
 */
import React from 'react';
import {
  BustActor, C, Caption, Chocolate, FPS, FS, Label, PlainBg, POSES, RADIUS, SW, ThemedIcon,
  ThermoScale, CompareBars, WaterMoleculeLattice, W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * S1: 초콜릿 한 조각이 입에 들어가자마자 순식간에 녹아 사라진다 (무성)
 * ============================================================ */

const S1_BUST_SIZE = 900;
const S1_BUST_LEFT = (W - S1_BUST_SIZE) / 2;
const S1_BUST_TOP = 460;
/** BustActor는 원본 캐릭터의 780x780 얼굴 크롭(BUST_VIEWBOX)을 size 배율로 그린다.
 *  RIG.MOUTH(627,505)를 크롭 원점(236,132) 기준으로 정규화하면 입 좌표를 화면 절대좌표로
 *  환산할 수 있다(HeadNerveDiagram 등이 쓰는 방식과 동일 원칙 - 좌표를 눈대중으로 잡지 않음). */
const MOUTH_NX = (627 - 236) / 780;
const MOUTH_NY = (505 - 132) / 780;
const S1_MOUTH_X = S1_BUST_LEFT + MOUTH_NX * S1_BUST_SIZE;
const S1_MOUTH_Y = S1_BUST_TOP + MOUTH_NY * S1_BUST_SIZE;

const S1_CHOC_START = { x: S1_MOUTH_X + 250, y: S1_MOUTH_Y - 300 };
const S1_CHOC_TARGET = { x: S1_MOUTH_X - 6, y: S1_MOUTH_Y - 16 };
const S1_CHOC_WIDTH = 130;

export const S1Bite: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const moveT = smooth(progress(f, 0, frames * 0.34));
  const bitePulse = progress(f, frames * 0.26, frames * 0.34) * (1 - progress(f, frames * 0.42, frames * 0.5));
  const meltT = progress(f, frames * 0.36, frames * 0.78);
  const fadeT = progress(f, frames * 0.8, frames * 0.98);

  const cx = S1_CHOC_START.x + (S1_CHOC_TARGET.x - S1_CHOC_START.x) * moveT;
  const cy = S1_CHOC_START.y + (S1_CHOC_TARGET.y - S1_CHOC_START.y) * moveT;
  const chocW = S1_CHOC_WIDTH * (1 - 0.55 * meltT);
  const chocOpacity = 1 - fadeT;
  const mouthOpen = Math.max(bitePulse * 0.9, meltT > 0.02 ? 0.14 : 0);

  return (
    <PlainBg>
      <BustActor size={S1_BUST_SIZE} left={S1_BUST_LEFT} top={S1_BUST_TOP} pose={POSES.idle} mouthOpen={mouthOpen} />
      {chocOpacity > 0.01 ? (
        <Chocolate
          width={chocW} x={cx - chocW / 2} y={cy - chocW / 2}
          melt={meltT} style={{ opacity: chocOpacity }}
        />
      ) : null}
    </PlainBg>
  );
};

/* ============================================================
 * S2: 리액션 + 훅 질문 (바스트샷, "어? 손에 있을 땐 멀쩡했는데...")
 * ============================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const puzzleT = smooth(progress(f, 0, 14));
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 카카오버터 분자가 촘촘한 결정을 이루며 굳는다 (crystallizeProgress 0->1)
 * ============================================================ */

const S3_WIDTH = 760;
const S3_X = CX - S3_WIDTH / 2;
const S3_Y = 520;

export const S3Lattice: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const crystallizeT = progress(f, 10, Math.round(frames * 0.85));
  const labelA = smooth(progress(f, frames * 0.55, frames * 0.75));
  return (
    <PlainBg>
      <WaterMoleculeLattice
        width={S3_WIDTH} x={S3_X} y={S3_Y} crystallizeProgress={crystallizeT}
        moleculeColor={C.chocolate} bondColor={C.browning}
      />
      {/* WaterMoleculeLattice는 width=height 정사각 박스로 그려지므로, 라벨은 그 박스 아래
          (S3_Y + S3_WIDTH)보다 더 아래에 둬야 분자 점과 겹치지 않는다(스틸 선점검에서
          0.72배수 위치가 격자와 겹치는 것을 발견해 수정, general-ep63). */}
      <Label x={CX} y={S3_Y + S3_WIDTH + 40} text={t.s3Label} size={FS.label} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 상온 / 녹는점 / 체온을 한 온도계 위에 놓고, 녹는점과 체온이 거의 붙어 있음을 보여준다
 * ============================================================ */

const S4_CX = CX - 140;
const S4_TOP_Y = 480;
const S4_TRACK_H = 620;

export const S4Thermo: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const p1 = smooth(progress(f, frames * 0.05, frames * 0.22));
  const p2 = smooth(progress(f, frames * 0.3, frames * 0.5));
  const p3 = smooth(progress(f, frames * 0.44, frames * 0.64));
  const bracketP = smooth(progress(f, frames * 0.62, frames * 0.86));
  return (
    <PlainBg>
      <ThermoScale
        cx={S4_CX} topY={S4_TOP_Y} trackHeight={S4_TRACK_H}
        points={[
          { posT: 0.15, label: t.s4RoomTemp, color: C.waterCool, progress: p1 },
          { posT: 0.62, label: t.s4MeltPoint, color: C.chocolate, progress: p2 },
          { posT: 0.74, label: t.s4BodyTemp, color: C.coral, progress: p3 },
        ]}
        closeBracket={{ aIndex: 1, bIndex: 2, label: t.s4CloseLabel, progress: bracketP }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 결정이 순식간에 무너지며 액체로 흩어진다 + 입 안 클로즈업(37도)
 * ============================================================ */

const S5_LATTICE_WIDTH = 460;
const S5_LATTICE_X = CX - S5_LATTICE_WIDTH / 2;
const S5_LATTICE_Y = 260;

const S5_BUST_SIZE = 680;
const S5_BUST_LEFT = (W - S5_BUST_SIZE) / 2;
const S5_BUST_TOP = 760;
const S5_MOUTH_X = S5_BUST_LEFT + MOUTH_NX * S5_BUST_SIZE;
const S5_MOUTH_Y = S5_BUST_TOP + MOUTH_NY * S5_BUST_SIZE;

export const S5Melt: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const crystallizeT = Math.max(0, 1 - progress(f, frames * 0.05, frames * 0.5));
  const mouthPulse = progress(f, frames * 0.35, frames * 0.55) * (1 - progress(f, frames * 0.75, frames * 0.92));
  const labelA = smooth(progress(f, frames * 0.45, frames * 0.65));
  return (
    <PlainBg>
      <WaterMoleculeLattice
        width={S5_LATTICE_WIDTH} x={S5_LATTICE_X} y={S5_LATTICE_Y} crystallizeProgress={crystallizeT}
        moleculeColor={C.chocolate} bondColor={C.browning}
      />
      <BustActor
        size={S5_BUST_SIZE} left={S5_BUST_LEFT} top={S5_BUST_TOP} pose={POSES.idle}
        mouthOpen={Math.max(0.15, mouthPulse)}
      />
      {/* 스틸 선점검에서 mouthX+200 위치가 오른쪽 볼터치와 겹치는 것을 발견해, 얼굴 바깥
          (BustActor 오른쪽 바깥)으로 완전히 빼는 좌표로 수정했다(general-ep63). */}
      <Label
        x={S5_BUST_LEFT + S5_BUST_SIZE + 30} y={S5_MOUTH_Y - 40} text={t.s5Temp} size={FS.label} color={C.coral}
        align="left" style={{ opacity: labelA }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 여름 햇볕 아래 주머니 속 초콜릿이 서서히 녹는다
 * ============================================================ */

const S6_CHOC_WIDTH = 440;
const S6_CHOC_X = CX - S6_CHOC_WIDTH / 2;
const S6_CHOC_Y = 780;
const S6_POCKET_W = 600;
const S6_POCKET_H = 480;
const S6_POCKET_X = CX - S6_POCKET_W / 2;
const S6_POCKET_Y = 700;

export const S6Summer: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const sunA = smooth(progress(f, 0, 18));
  const meltT = progress(f, frames * 0.1, frames * 0.92) * 0.55;
  return (
    <PlainBg top={C.goldSoft} bottom={C.coralSoft}>
      <ThemedIcon
        name="sun" size={190} color={C.gold}
        style={{ position: 'absolute', left: W - 260, top: 160, opacity: sunA }}
      />
      <div
        style={{
          position: 'absolute', left: S6_POCKET_X, top: S6_POCKET_Y, width: S6_POCKET_W, height: S6_POCKET_H,
          borderRadius: RADIUS.lg, background: C.paper, border: `${SW}px solid ${C.ink}`, opacity: 0.9,
        }}
      />
      <Chocolate width={S6_CHOC_WIDTH} x={S6_CHOC_X} y={S6_CHOC_Y} melt={meltT} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 버터 vs 초콜릿 - 녹는 온도 범위 비교 (버터는 넓고 완만, 초콜릿은 좁고 뾰족)
 * ============================================================ */

const S7_ICON_WIDTH = 180;
const S7_ICON_Y = 420;
const S7_BUTTER_X = CX - 220 - S7_ICON_WIDTH / 2;
const S7_CHOC_X = CX + 220 - S7_ICON_WIDTH / 2;
const S7_BARS_X = 170;
const S7_BARS_Y = 900;
const S7_PX_PER_UNIT = 11;

export const S7Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const iconA = smooth(progress(f, 0, 16));
  return (
    <PlainBg>
      <Chocolate
        width={S7_ICON_WIDTH} x={S7_BUTTER_X} y={S7_ICON_Y} melt={0} showGrid={false}
        color={C.goldSoft} style={{ opacity: iconA }}
      />
      <Label
        x={S7_BUTTER_X + S7_ICON_WIDTH / 2} y={S7_ICON_Y + S7_ICON_WIDTH + 30} text={t.s7Butter}
        size={FS.small} style={{ opacity: iconA }}
      />
      <Chocolate width={S7_ICON_WIDTH} x={S7_CHOC_X} y={S7_ICON_Y} melt={0} style={{ opacity: iconA }} />
      <Label
        x={S7_CHOC_X + S7_ICON_WIDTH / 2} y={S7_ICON_Y + S7_ICON_WIDTH + 30} text={t.s7Chocolate}
        size={FS.small} style={{ opacity: iconA }}
      />
      {/* value=5 x pxPerUnit=11(=55px)이 thickness(60px)보다 짧아 막대가 아니라 원처럼
          보이는 결함을 스틸 선점검에서 발견해, 초콜릿 막대도 thickness보다 뚜렷이 긴
          길이(8x11=88px)로 조정했다(general-ep63) - 그래도 버터(176px)보다는 확실히 짧다. */}
      <CompareBars
        items={[
          { label: t.s7Butter, value: 16, color: C.goldSoft, at: Math.round(frames * 0.3), thickness: 60 },
          { label: t.s7Chocolate, value: 8, color: C.chocolate, at: Math.round(frames * 0.55), thickness: 60 },
        ]}
        x={S7_BARS_X} y={S7_BARS_Y} pxPerUnit={S7_PX_PER_UNIT} frame={f} rowGap={170}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
