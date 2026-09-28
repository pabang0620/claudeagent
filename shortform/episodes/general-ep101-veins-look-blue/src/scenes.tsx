/** 이 화(general-ep101, "손등 핏줄이 파랗게 보이는 이유") 전용 장면.
 *  문구는 전부 strings.ts에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(손등 클로즈업, 카메라가 핏줄을 따라 서서히 줌인, 무성) -> s2(BustActor 리액션
 *  "어, 손등에 핏줄이 파랗게 보이네... 피는 원래 빨간색 아닌가?") -> s3(ArmVein 단면을
 *  열어 실제 빨간 피를 보여줌, 겉보기에 X / 단면 속 실제에 O) -> s4(SkinLightCrossSection
 *  파란빛이 얕은 층에서 튕겨 나옴) -> s5(같은 단면, 빨간빛이 깊이 파고들다 흡수돼 사라짐)
 *  -> s6(같은 단면, 튕겨 나온 파란빛이 눈까지 이어짐) -> s7(VeinDepthCompare로 얕은
 *  핏줄 vs 깊은 핏줄 비교 + 주사기).
 *
 *  자산: props/VeinLightDiagram.tsx(신규, ArmVein/SkinLightCrossSection/VeinDepthCompare)를
 *  배럴을 거치지 않고 상대경로로 직접 import한다(이번 배치 한정 규칙 - 오케스트레이터가
 *  배치 종료 후 REGISTRY.md/assets/index.ts에 일괄 반영한다).
 *
 *  원칙 7(무성 구간 효과음): s1은 대사 없이 카메라 줌인만 있는 구간이라 시작 시점에
 *  옅은 head_whoosh SFX를 붙인다(Episode.tsx가 처리, 기존 head_whoosh.mp3 재사용).
 */
import React from 'react';
import {
  BustActor, C, Caption, FPS, Label, PlainBg, POSES, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { ArmVein, SkinLightCrossSection, VeinDepthCompare } from '../../../assets/props/VeinLightDiagram';

const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 손등 클로즈업, 카메라가 핏줄을 따라 서서히 줌인 (무성)
 * ============================================================ */
const S1_VEIN_WIDTH = 760;

export const S1Zoom: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const zoomP = progress(f, 0, frames);
  const scale = 1 + 0.55 * zoomP;
  // 핏줄 경로가 화면 좌상단 쪽으로 치우쳐 있어(ArmVein 내부 VEIN_PATH), 줌인하면서
  // 그 방향으로 살짝 팬(pan)해 "핏줄을 따라간다"는 인상을 준다.
  const panX = -30 * zoomP;
  const panY = -20 * zoomP;
  return (
    <PlainBg>
      <div
        style={{
          position: 'absolute', left: CX - S1_VEIN_WIDTH / 2, top: 620,
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
          transformOrigin: '58% 55%',
        }}
      >
        <ArmVein width={S1_VEIN_WIDTH} reveal={0} showBadges={false} />
      </div>
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어, 손등에 핏줄이 파랗게 보이네... 피는 원래 빨간색 아닌가?" (바스트샷, 립싱크)
 *  - 리액션 바스트샷 장면에는 소품을 넣지 않는다(원칙)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = { ...blendPose(POSES.idle, POSES.surprised, 0.55), headTilt: 14 };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: "맞아요, 핏줄 속 피는 늘 빨간색이에요" - 단면을 열어 실제 빨간 피를 보여줌
 * ============================================================ */
const S3_VEIN_WIDTH = 820;

export const S3Reveal: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const revealP = progress(f, 6, Math.max(24, frames - 24));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ position: 'absolute', left: CX - S3_VEIN_WIDTH / 2, top: 520 }}>
        <ArmVein width={S3_VEIN_WIDTH} reveal={revealP} showBadges />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4~S6: 피부 단면 - 파란빛 반사 / 빨간빛 흡수 / 눈까지 도달
 *  세 장면이 같은 위치·크기의 SkinLightCrossSection을 공유한다(시각적 연속성).
 * ============================================================ */
const SKIN_WIDTH = 880;
const SKIN_LEFT = CX - SKIN_WIDTH / 2;
const SKIN_TOP = 560;
const BLUE_LABEL_X = CX + 60;
const BLUE_LABEL_Y = 420;
const RED_LABEL_X = CX - 30;
const RED_LABEL_Y = 1080;

interface LightSceneProps extends SceneProps { label: string }

export const S4BlueBounce: React.FC<LightSceneProps> = ({ f, frames, lines, label }) => {
  const line = activeLine(lines, f / FPS);
  const blueP = progress(f, 6, Math.max(20, frames - 20));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SkinLightCrossSection width={SKIN_WIDTH} x={SKIN_LEFT} y={SKIN_TOP} blueBounce={blueP} />
      {blueP > 0.15 ? (
        <Label x={BLUE_LABEL_X} y={BLUE_LABEL_Y} text={label} size={46} color={C.ink} />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S5RedPenetrate: React.FC<LightSceneProps> = ({ f, frames, lines, label }) => {
  const line = activeLine(lines, f / FPS);
  const redP = progress(f, 6, Math.max(20, frames - 16));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SkinLightCrossSection width={SKIN_WIDTH} x={SKIN_LEFT} y={SKIN_TOP} redPenetrate={redP} />
      {redP > 0.1 && redP < 0.95 ? (
        <Label x={RED_LABEL_X} y={RED_LABEL_Y} text={label} size={46} color={C.ink} />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S6ToEye: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const eyeP = progress(f, 8, Math.max(24, frames - 20));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* 빨간빛은 이미 흡수되어 남아있지 않다 - blueBounce만 1로 고정해 그대로 유지하고
       *  toEye만 진행시킨다 */}
      <SkinLightCrossSection width={SKIN_WIDTH} x={SKIN_LEFT} y={SKIN_TOP} blueBounce={1} toEye={eyeP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: "피부가 얇은 손목이나 손등에서 핏줄이 유독 파랗게 잘 보이는 거예요" (비교 + 주사기)
 * ============================================================ */
const CMP_WIDTH = 900;
const CMP_LEFT = CX - CMP_WIDTH / 2;
const CMP_TOP = 620;

export const S7Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const appearP = progress(f, 4, Math.max(20, frames - 30));

  return (
    <PlainBg top={C.sky} bottom={C.paper} stop={0.4} ground={null}>
      <VeinDepthCompare width={CMP_WIDTH} x={CMP_LEFT} y={CMP_TOP} progress={appearP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
