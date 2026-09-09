/** 이 화(general-ep66, "새벽에 안개가 자욱해지는 이유") 전용 장면. 문구는 전부 strings.ts
 *  에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(캐릭터가 새벽 안개 속에서 앞이 잘 안 보이는 걸 봄, 립싱크) -> s2(밤 배경, 지표면
 *  냉각 - coolProgress 0->1) -> s3(공기 중 물방울이 좁게 응결되기 시작 - dropletProgress
 *  0->1) -> s4(물방울이 표면에 안 붙고 공중에 뜬 채 퍼짐 - floatProgress 0->0.6, "표면
 *  비부착" 대비 배지) -> s5(안개층이 두껍게 깔린 와이드샷 - floatProgress 0.6->1, 배지
 *  없음) -> s6(구름=높은 안개 비교 패널 - cloudCompareProgress 0->1) -> s7(해가 뜨며
 *  안개가 걷힘 - clearProgress 0->1).
 *
 *  이 화의 핵심 그림은 FogLayerDiagram(신규, props/에 등록) - REGISTRY 확인 완료, 지표
 *  냉각+안개 형성을 함께 보여주는 다이어그램이 라이브러리에 없어 새로 만들었다(53화
 *  WindowPane의 fogProgress 레시피를 계승, 26화 WetSoilAerosolDiagram과 같은 "독립
 *  progress" 설계). 오케스트레이터 지시대로 안개는 낮은 채도의 넓은 면으로만 표현하고
 *  점을 촘촘히 뿌리지 않았고, 지표 냉각은 색 변화만으로 표현했다. s1은 53화 S1Window와
 *  같은 원칙(캐릭터-다이어그램 좌우 분리 배치, "21화 이후 반복된 결함" B절 - 캐릭터가
 *  다이어그램을 가리지 않게)을 그대로 따른다. s1만 캐릭터가 직접 대사를 말하는 구간이라
 *  mouth.json 립싱크를 쓴다. s2~s7은 3인칭 설명 내레이션이 다이어그램 위에 흐르는
 *  구간이라 캐릭터가 등장하지 않는다(ep53·ep63과 동일 원칙).
 */
import React from 'react';
import {
  Actor, C, Caption, FOG_VB_H, FOG_VB_W, FPS, FS, FogLayerDiagram, GROUND, Label, POSES, PlainBg,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = 540; // W/2
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: Record<string, number[]> }

/* 공통 다이어그램 박스(s2~s7). 폭820을 900 viewBox에 맞춰 스케일하면 높이는 565가 된다 -
 * 그 아래 40px 여백을 두고 라벨을 놓으면 자막 안전영역(CAP_BOTTOM=300, 화면 y~1620부터)
 * 과 충분히 떨어진다. */
const DIAG_W = 820;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 460;
const DIAG_H = DIAG_W * (FOG_VB_H / FOG_VB_W);
const LABEL_Y = DIAG_Y + DIAG_H + 40;

/* ============================================================
 * S1: 새벽 안개 속, 앞이 잘 안 보인다 (캐릭터 왼쪽 / 안개 다이어그램 오른쪽)
 * ============================================================ */

/* 53화 S1Window와 같은 원칙 - 캐릭터(왼쪽)와 다이어그램(오른쪽)을 좌우로 분리해 겹치지
 * 않게 하고("21화 이후 반복된 결함" B절), 처음 시도(다이어그램 560폭)가 화면에 비해
 * 너무 작아 구석에 붕 뜬 카드처럼 보이는 결함을 스틸 선점검에서 발견해 두 요소 모두
 * 키웠다. */
const S1_DIAG_W = 650;
const S1_DIAG_X = 380;
const S1_DIAG_Y = 300;
const S1_ACTOR_CENTER_X = 190;
const S1_ACTOR_SIZE = 560;

export const S1FoggyRoad: React.FC<MouthSceneProps> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const pose = blendPose(POSES.idle, POSES.shrug, 0.3);

  return (
    <PlainBg top={C.water} bottom={C.paper}>
      <FogLayerDiagram
        width={S1_DIAG_W} x={S1_DIAG_X} y={S1_DIAG_Y} f={f}
        floatProgress={1} floatBadge={false}
      />
      <Actor
        size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={GROUND} pose={pose} mouthOpen={mouthOpen}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 밤사이 지표면이 식으며 그 위 공기도 함께 식는다 (coolProgress 0->1)
 * ============================================================ */

export const S2GroundCool: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const coolT = progress(f, 8, frames - 10);
  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <FogLayerDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f}
        coolProgress={coolT} skyColor={C.nightMid}
      />
      <Label x={CX} y={LABEL_Y} text={t.s2Label} size={FS.label} color={C.cream} />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 차가워진 공기가 수증기를 다 못 붙잡고 작은 물방울로 응결된다 (dropletProgress 0->1)
 * ============================================================ */

export const S3Droplet: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dropT = progress(f, 8, frames - 10);
  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <FogLayerDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} dropletProgress={dropT} />
      <Label x={CX} y={LABEL_Y} text={t.s3Label} size={FS.label} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 물방울은 표면에 붙지 않고 공중에 뜬 채 뭉친다 (floatProgress 0->0.6, 대비 배지)
 * ============================================================ */

export const S4Float: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const floatT = progress(f, 8, frames - 10) * 0.6;
  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <FogLayerDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} floatProgress={floatT} floatBadge />
      <Label x={CX} y={LABEL_Y} text={t.s4Label} size={FS.label} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 눈높이에 물방울 무리가 두껍게 깔리면 그게 안개다 (floatProgress 0.6->1, 배지 없음)
 * ============================================================ */

export const S5Fog: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const floatT = 0.6 + 0.4 * progress(f, 0, Math.round(frames * 0.85));
  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <FogLayerDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} floatProgress={floatT} floatBadge={false}
      />
      <Label x={CX} y={LABEL_Y} text={t.s5Label} size={FS.label} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 안개는 하늘 높이 뜬 구름이 땅까지 내려온 것과 같다 (cloudCompareProgress 0->1)
 * ============================================================ */

export const S6Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const cmpT = progress(f, 8, frames - 10);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FogLayerDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} cloudCompareProgress={cmpT} />
      <Label x={CX} y={DIAG_Y - 40} text={t.s6CloudLabel} size={FS.label} />
      <Label x={CX + 74} y={DIAG_Y + 366} text={t.s6EqualLabel} size={FS.small} align="left" />
      <Label x={CX} y={LABEL_Y} text={t.s6FogLabel} size={FS.label} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 해가 떠서 공기가 데워지면 물방울이 도로 수증기가 되며 안개가 걷힌다 (clearProgress 0->1)
 * ============================================================ */

export const S7Clear: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const clearT = progress(f, 8, frames - 10);
  return (
    <PlainBg top={C.goldSoft} bottom={C.coralSoft} ground={null}>
      <FogLayerDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} clearProgress={clearT} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
