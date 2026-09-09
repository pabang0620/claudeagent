/** 이 화(general-ep36, "우유가 상하면 덩어리지는 이유") 전용 장면.
 *
 *  s1(무성, 냉장고에서 꺼낸 우유를 컵에 따르는데 덩어리져 나옴) -> s2(리액션+훅 질문,
 *  컵을 들여다보며 "왜 이렇게 됐지?") -> s3(세균이 당분을 먹고 산성 물질을 만들어냄,
 *  MilkCurdleDiagram) -> s4(단백질이 산성화로 서로 뭉침, MilkCurdleDiagram 확장) ->
 *  s5(뭉친 덩어리가 뜬 정지 컷) -> s6(레몬즙 한 방울로도 즉시 같은 현상) -> s7(요거트·
 *  치즈도 같은 원리로 만든 식품).
 *
 *  s2(리액션+훅 질문)만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json으로 립싱크를
 *  쓴다. s3~s7은 3인칭 설명 내레이션이 다이어그램/장식 위에 흐르는 구간이라 립싱크를
 *  쓰지 않는다(채널 공통 관례).
 */
import React from 'react';
import {
  BustActor, C, Caption, FS, IceFloatCup, Label, MilkClump, MilkCurdleDiagram, PlainBg, POSES,
  PopIn, SW_THIN, ThemedIcon, W, blendPose, clamp01, mouthAt, mouthProp, progress,
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
 * 공용: IceFloatCup 내부 레이아웃을 그대로 옮겨온 상수 (IceFloatCup.tsx를 고치지 않고,
 * 그 viewBox 안에서 액체 표면이 화면 어디에 오는지만 계산하기 위함). MilkClump를 컵
 * 수면 위에 정확히 얹으려면 필요하다.
 * ================================================================ */
const CUP_VB_W = 300;
const CUP_X_VB = 62;
const CUP_TOP_VB = 230;
const CUP_W_VB = 176;
const CUP_H_VB = 340;
const CUP_BOTTOM_VB = CUP_TOP_VB + CUP_H_VB; // 570
const CUP_FILL_INSET = 11;
const CUP_FILL_MAX_H = CUP_H_VB - CUP_FILL_INSET - 14; // 315
const MILK_COLOR = C.goldSoft; // 우유(크림빛 흰색) - 기존 토큰 재사용

function cupLiquidSurface(x: number, y: number, width: number, level: number) {
  const scale = width / CUP_VB_W;
  const fillTopVb = CUP_BOTTOM_VB - CUP_FILL_INSET - level * CUP_FILL_MAX_H;
  return {
    cx: x + (CUP_X_VB + CUP_W_VB / 2) * scale,
    cy: y + fillTopVb * scale,
  };
}

/* ================================================================
 * S1: 냉장고에서 꺼낸 우유를 컵에 따르는데, 하얀 덩어리와 멀건 액체로 갈라져 나온다 (무성)
 * ================================================================ */

const S1_CUP_W = 380;
const S1_CUP_X = CX - S1_CUP_W / 2;
const S1_CUP_Y = 560;
const S1_CARTON_SIZE = 190;
const S1_CARTON_X = CX - S1_CARTON_SIZE / 2;
const S1_CARTON_Y = 250;
const S1_LIQUID_LEVEL = 0.6;

/** s1 구간 길이(frames) 대비 스트림이 컵에 닿는 지점(비율). Episode.tsx의 water_splash
 *  오디오 Sequence와 같은 비율을 써서 소리와 화면을 맞춘다. */
export const S1_SPLASH_SFX_AT = 15 / 96;

export const S1Pour: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const tiltIn = progress(f, 8, 22);
  const tiltOut = progress(f, 54, 68);
  const tilt = 46 * tiltIn * (1 - tiltOut);
  const streamIn = progress(f, 15, 24);
  const streamOut = progress(f, 46, 56);
  const streamP = clamp01(streamIn - streamOut);
  const liquidLevel = S1_LIQUID_LEVEL * progress(f, 15, 55);
  const clumpP = progress(f, 60, 86);

  const surface = cupLiquidSurface(S1_CUP_X, S1_CUP_Y, S1_CUP_W, S1_LIQUID_LEVEL);
  const streamTop = S1_CARTON_Y + S1_CARTON_SIZE * 0.62;
  const streamBottom = S1_CUP_Y + CUP_TOP_VB * (S1_CUP_W / CUP_VB_W) + 20;

  return (
    <PlainBg ground={null}>
      <ThemedIcon
        name="milk" size={S1_CARTON_SIZE} color={C.ink}
        style={{
          position: 'absolute', left: S1_CARTON_X, top: S1_CARTON_Y,
          transform: `rotate(${tilt}deg)`, transformOrigin: '32% 68%',
        }}
      />
      {streamP > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: CX - 7, top: streamTop, width: 14,
            height: Math.max(0, streamBottom - streamTop), background: MILK_COLOR,
            border: `3px solid ${C.ink}`, opacity: streamP, borderRadius: 8,
          }}
        />
      ) : null}
      <IceFloatCup
        width={S1_CUP_W} x={S1_CUP_X} y={S1_CUP_Y} liquidLevel={liquidLevel} mode="liquid"
        liquidColor={MILK_COLOR}
      />
      {clumpP > 0.01 ? (
        <MilkClump cx={surface.cx} cy={surface.cy} size={S1_CUP_W * 0.42} curdle={clumpP} />
      ) : null}
    </PlainBg>
  );
};

/* ================================================================
 * S2: 컵을 들여다보며 리액션 + 훅 질문 (바스트샷)
 * ================================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 380;
/** 작은 컵 소품을 바스트샷 아래에 두려 했으나, 이 크기의 컵(IceFloatCup 비율상 폭의 약
 *  2.07배 높이)은 캐릭터 하단부와 자막 안전영역(CAP_BOTTOM=300, 실측 자막 박스 상단
 *  y≈1400~1500) 사이의 좁은 틈에 들어가지 않아 자막과 겹쳤다(2026-09-02 첫 렌더 검수에서
 *  발견). s1에서 이미 덩어리진 우유를 충분히 보여줬으므로, s2는 다른 리액션 바스트샷
 *  구간(ep33 S2Question 등)과 동일하게 캐릭터만 보여주는 것으로 단순화했다. */

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const poseT = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, poseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / 30)} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * 공용: MilkCurdleDiagram 배치(s3, s4 고정 카메라)
 * ================================================================ */

const DIAG_W = 620;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 330;
const DIAG_LABEL_Y = DIAG_Y + DIAG_W + 70;

/* ================================================================
 * S3: 세균이 당분을 먹고 젖산(산성 물질)을 만들어낸다
 * ================================================================ */

export const S3Acid: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const bacteriaProgress = progress(f, 6, 40);
  const acidProgress = progress(f, 55, frames - 22);
  const proteinAppear = progress(f, frames - 60, frames - 24);
  const labelP = clamp01(progress(f, 62, 84));

  return (
    <PlainBg ground={null}>
      <MilkCurdleDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        bacteriaProgress={bacteriaProgress} acidProgress={acidProgress} proteinAppear={proteinAppear}
      />
      <Label x={CX} y={DIAG_LABEL_Y} text={t.s3Label} size={FS.small} color={C.ink} align="center" style={{ opacity: labelP }} />
      <Caption line={activeLine(lines, f / 30)} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 단백질(카세인)이 산성화로 서로 밀어내던 힘을 잃고 뭉친다
 * ================================================================ */

export const S4Curdle: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const curdProgress = progress(f, 24, frames - 30);
  const labelP = clamp01(progress(f, 8, 26));

  return (
    <PlainBg ground={null}>
      <MilkCurdleDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        bacteriaProgress={1} acidProgress={1} proteinAppear={1} curdProgress={curdProgress}
      />
      <Label x={CX} y={DIAG_LABEL_Y} text={t.s4Label} size={FS.small} color={C.ink} align="center" style={{ opacity: labelP }} />
      <Caption line={activeLine(lines, f / 30)} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 뭉친 덩어리가 컵 안에서 떠 있는 정지 컷 (핵심 결론)
 * ================================================================ */

const S5_CUP_W = 420;
const S5_CUP_X = CX - S5_CUP_W / 2;
const S5_CUP_Y = 380;
const S5_LIQUID_LEVEL = 0.62;

export const S5Result: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const surface = cupLiquidSurface(S5_CUP_X, S5_CUP_Y, S5_CUP_W, S5_LIQUID_LEVEL);
  const bob = Math.sin(f / 20) * 6;

  return (
    <PlainBg ground={null}>
      <IceFloatCup
        width={S5_CUP_W} x={S5_CUP_X} y={S5_CUP_Y} liquidLevel={S5_LIQUID_LEVEL} mode="liquid"
        liquidColor={MILK_COLOR}
      />
      <MilkClump cx={surface.cx} cy={surface.cy + bob} size={S5_CUP_W * 0.44} curdle={1} />
      <Caption line={activeLine(lines, f / 30)} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 레몬즙 한 방울만 떨어뜨려도 산 때문에 우유가 순식간에 덩어리진다
 * ================================================================ */

const S6_CUP_W = 420;
const S6_CUP_X = CX - S6_CUP_W / 2;
const S6_CUP_Y = 380;
const S6_LIQUID_LEVEL = 0.62;
const S6_LEMON_SIZE = 130;
const S6_LEMON_START_Y = 60;

/** 레몬즙이 수면에 닿아 응고가 시작되는 지점(구간 프레임 대비 비율). Episode.tsx의
 *  bubble_pop 오디오 Sequence와 같은 비율을 써서 소리와 화면을 맞춘다. */
export const S6_POP_SFX_AT = 40 / 169;

export const S6Lemon: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const surface = cupLiquidSurface(S6_CUP_X, S6_CUP_Y, S6_CUP_W, S6_LIQUID_LEVEL);
  const dropP = clamp01(progress(f, 10, 40));
  const lemonY = S6_LEMON_START_Y + (surface.cy - S6_LEMON_START_Y - 40) * dropP;
  const curdle = progress(f, 40, 62);

  return (
    <PlainBg ground={null}>
      <IceFloatCup
        width={S6_CUP_W} x={S6_CUP_X} y={S6_CUP_Y} liquidLevel={S6_LIQUID_LEVEL} mode="liquid"
        liquidColor={MILK_COLOR}
      />
      {dropP < 1 ? (
        <ThemedIcon
          name="lemon-2" size={S6_LEMON_SIZE} color={C.gold}
          style={{ position: 'absolute', left: surface.cx - S6_LEMON_SIZE / 2, top: lemonY - S6_LEMON_SIZE / 2 }}
        />
      ) : null}
      {curdle > 0.01 ? (
        <MilkClump cx={surface.cx} cy={surface.cy} size={S6_CUP_W * 0.42} curdle={curdle} />
      ) : null}
      <Caption line={activeLine(lines, f / 30)} t={f / 30} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 요거트·치즈도 이 원리를 이용해 만든 식품이다 (팝인)
 * ================================================================ */

/** 요거트 통 - 단순한 사다리꼴 몸통 + 뚜껑 띠 (담백하게, 점 무리 없이) */
const YogurtTub: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 220" style={{ overflow: 'visible' }}>
    <path
      d="M 44 66 L 156 66 L 140 196 Q 138 208 126 208 L 74 208 Q 62 208 60 196 Z"
      fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} strokeLinejoin="round"
    />
    <rect x={34} y={40} width={132} height={34} rx={10} fill={C.coral} stroke={C.ink} strokeWidth={SW_THIN} />
    <line x1={60} y1={110} x2={140} y2={110} stroke={C.goldSoft} strokeWidth={16} strokeLinecap="round" />
  </svg>
);

/** 치즈 조각 - 둥근 삼각 웨지 + 구멍 2개 */
const CheeseWedge: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
    <path
      d="M 26 178 L 96 22 Q 102 10 108 22 L 178 178 Q 182 188 170 188 L 34 188 Q 22 188 26 178 Z"
      fill={C.gold} stroke={C.ink} strokeWidth={SW_THIN} strokeLinejoin="round"
    />
    <circle cx={108} cy={120} r={16} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.7} />
    <circle cx={78} cy={160} r={12} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.7} />
  </svg>
);

const S7_ICON_SIZE = 300;
const S7_Y = 760;
const S7_LEFT_X = CX - 200;
const S7_RIGHT_X = CX + 200;

export const S7Foods: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const yogurtP = clamp01(progress(f, 4, 30));
  const cheeseP = clamp01(progress(f, 18, 44));

  return (
    <PlainBg ground={null}>
      <PopIn cx={S7_LEFT_X} cy={S7_Y} size={S7_ICON_SIZE} progress={yogurtP} fromScale={0.4}>
        <YogurtTub size={S7_ICON_SIZE} />
      </PopIn>
      <PopIn cx={S7_RIGHT_X} cy={S7_Y} size={S7_ICON_SIZE} progress={cheeseP} fromScale={0.4}>
        <CheeseWedge size={S7_ICON_SIZE} />
      </PopIn>
      <Caption line={activeLine(lines, f / 30)} t={f / 30} />
    </PlainBg>
  );
};
