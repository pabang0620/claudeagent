/** 이 화(general-ep83, "집에서 얼린 얼음이 뿌연 이유") 전용 장면.
 *
 *  s1(캐릭터가 얼음 하나를 컵에 떨어뜨린다, 무성) -> s2(BustActor 리액션 "어? 이 얼음, 가운데만
 *  왜 이렇게 뿌옇지?") -> s3(IceCloudinessDiagram 클로즈업 - 물속에 녹아 있는 공기·미네랄
 *  드러남, dissolveProgress) -> s4(같은 다이어그램, 얼음이 가장자리부터 얼며 입자가 가운데로
 *  밀려남, freezeProgress+pushProgress) -> s5(가운데에 기포가 잔뜩 갇히고 빛이 흩어짐,
 *  trapProgress+scatterProgress) -> s6(집 얼음 vs 가게 얼음 나란히 비교, mode='trapped' vs
 *  'directional') -> s7(투명 얼음과 뿌연 얼음이 나란히 놓인 마무리 컷, 캐릭터 없음 - 대본
 *  "화면" 열에 캐릭터 언급 없음).
 *
 *  IceCloudinessDiagram(props/, general-ep83 신설)은 s3~s7 전부 같은 얼음틀 한 칸 단면
 *  레이아웃을 재사용한다(HiccupDiagram과 같은 "단일 컴포넌트로 여러 화면 커버" 설계) -
 *  호출 씬이 width로 확대율만 바꾼다. 이전 단계 progress=1을 전제로 다음 단계를 이어받는다
 *  (StarchGranuleDiagram과 같은 관례).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 가장자리부터 얼며 공기가 가운데로 밀려나는 과정이 중심이라, s4 얼음틀 단면에서
 *     투명한 가장자리(iceColor)와 뿌연 중심(liquid 잔류 + trapProgress 기포)이 대비되게
 *     그린다.
 *   - 공기 방울은 작은 점 무리로 뿌리지 않는다 - IceCloudinessDiagram은 입자 4개(공기 원
 *     2 + 미네랄 다이아몬드 2)까지만, 갇힌 기포 뭉침도 큰 반투명 원 3개로만 표현한다.
 *   - 집 얼음(뿌연 중심)과 가게 얼음(투명)을 s6에서 나란히 비교한다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, FS, IceCloudinessDiagram, IceFloatCup, Label, PlainBg,
  POSES, W,
  ICE_AIR_LABEL_PT, ICE_CLOUD_VB_W, ICE_DIRECTIONAL_LABEL_PT, ICE_MINERAL_LABEL_PT,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 냉동실에서 꺼낸 얼음 하나를 컵에 떨어뜨린다 (전신, 무성)
 * ============================================================ */
const S1_ACTOR_GROUND = 1300;
export const S1_DROP_START = 8;
export const S1_DROP_END_FRAC = 0.72;
/** 낙하 진행도가 이 값 부근일 때 컵 바닥에 닿는 "쨍" 소리(ice_clink)를 재생한다.
 *  IceFloatCup.floatCube의 settle 구간(cube 0.68~0.82)의 중간값과 맞춘다 - Episode.tsx가
 *  이 상수와 S1_DROP_START/S1_DROP_END_FRAC을 그대로 가져다 SFX 시작 프레임을 계산한다. */
export const S1_LANDING_FRAC = 0.75;

export const S1Drop: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const dropEnd = Math.round(frames * S1_DROP_END_FRAC);
  const floatCube = progress(f, S1_DROP_START, dropEnd);
  const cloudyCenter = progress(f, dropEnd, dropEnd + 14);
  const leanT = progress(f, 0, 18);
  const pose: Pose = blendPose(POSES.idle, POSES.present, leanT * 0.4);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={S1_ACTOR_GROUND}>
      <Actor size={820} centerX={220} ground={S1_ACTOR_GROUND} pose={pose} />
      <IceFloatCup
        width={420} x={560} y={420}
        liquidLevel={0.18} mode="liquid" floatCube={floatCube} temp="cold" f={f}
        cloudyCenter={cloudyCenter}
      />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어? 이 얼음, 가운데만 왜 이렇게 뿌옇지?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;
const S2_ICE_W = 220;
const S2_ICE_X = CX + 300;
const S2_ICE_Y = 520;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = blendPose(POSES.idle, POSES.thinking, 0.85);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      {/* 지금 들여다보고 있는 그 뿌연 얼음 - s3~s5가 설명할 대상을 먼저 눈에 담아둔다 */}
      <IceCloudinessDiagram
        width={S2_ICE_W} x={S2_ICE_X} y={S2_ICE_Y} mode="trapped"
        dissolveProgress={1} freezeProgress={1} pushProgress={1} trapProgress={1}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 물방울 클로즈업 - 녹아 있는 공기·미네랄이 드러남
 * ============================================================ */
const S3_DIAG_W = 560;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 480;
const S3_SCALE = S3_DIAG_W / ICE_CLOUD_VB_W;

export const S3Dissolve: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dissolveP = progress(f, 4, Math.round(frames * 0.85));
  const labelA = progress(f, Math.round(frames * 0.32), Math.round(frames * 0.58));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <IceCloudinessDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} mode="trapped" dissolveProgress={dissolveP} />
      <Label
        x={S3_DIAG_X + ICE_AIR_LABEL_PT.x * S3_SCALE} y={S3_DIAG_Y + ICE_AIR_LABEL_PT.y * S3_SCALE}
        text={t.s3AirLabel} size={FS.small} color={C.ink} style={{ opacity: clamp01(labelA) }}
      />
      <Label
        x={S3_DIAG_X + ICE_MINERAL_LABEL_PT.x * S3_SCALE} y={S3_DIAG_Y + ICE_MINERAL_LABEL_PT.y * S3_SCALE}
        text={t.s3MineralLabel} size={FS.small} color={C.ink} style={{ opacity: clamp01(labelA) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 가장자리부터 얼며 입자가 가운데로 밀려남
 * ============================================================ */
const S4_DIAG_W = 600;
const S4_DIAG_X = CX - S4_DIAG_W / 2;
const S4_DIAG_Y = 470;

export const S4Freeze: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const freezeP = progress(f, 0, Math.round(frames * 0.72));
  const pushP = progress(f, Math.round(frames * 0.24), Math.round(frames * 0.96));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <IceCloudinessDiagram
        width={S4_DIAG_W} x={S4_DIAG_X} y={S4_DIAG_Y} mode="trapped"
        dissolveProgress={1} freezeProgress={freezeP} pushProgress={pushP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 가운데에 기포가 잔뜩 갇히고, 빛이 이리저리 흩어져 뿌옇게 보인다
 * ============================================================ */
const S5_DIAG_W = 600;
const S5_DIAG_X = CX - S5_DIAG_W / 2;
const S5_DIAG_Y = 470;

export const S5Scatter: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const trapP = progress(f, 0, Math.round(frames * 0.55));
  const scatterP = progress(f, Math.round(frames * 0.38), frames);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <IceCloudinessDiagram
        width={S5_DIAG_W} x={S5_DIAG_X} y={S5_DIAG_Y} mode="trapped"
        dissolveProgress={1} freezeProgress={1} pushProgress={1} trapProgress={trapP} scatterProgress={scatterP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 집 얼음(뿌연 중심) vs 가게 얼음(투명, 한 방향으로 천천히) 비교
 * ============================================================ */
const S6_DIAG_W = 380;
const S6_GAP = 60;
const S6_TOTAL_W = S6_DIAG_W * 2 + S6_GAP;
const S6_LEFT_X = CX - S6_TOTAL_W / 2;
const S6_RIGHT_X = S6_LEFT_X + S6_DIAG_W + S6_GAP;
const S6_Y = 540;
const S6_SCALE = S6_DIAG_W / ICE_CLOUD_VB_W;
const S6_LABEL_Y = S6_Y - 60;

export const S6Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const rightFreeze = progress(f, 0, Math.round(frames * 0.82));
  const labelA = progress(f, 4, 20);
  const noteA = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.55));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <IceCloudinessDiagram
        width={S6_DIAG_W} x={S6_LEFT_X} y={S6_Y} mode="trapped"
        dissolveProgress={1} freezeProgress={1} pushProgress={1} trapProgress={1} scatterProgress={1}
      />
      <IceCloudinessDiagram
        width={S6_DIAG_W} x={S6_RIGHT_X} y={S6_Y} mode="directional"
        dissolveProgress={1} freezeProgress={rightFreeze} pushProgress={rightFreeze}
        scatterProgress={progress(f, Math.round(frames * 0.78), frames)}
      />
      <Label x={S6_LEFT_X + S6_DIAG_W / 2} y={S6_LABEL_Y} text={t.s6HomeLabel} size={FS.label} color={C.ink} style={{ opacity: clamp01(labelA) }} />
      <Label x={S6_RIGHT_X + S6_DIAG_W / 2} y={S6_LABEL_Y} text={t.s6ShopLabel} size={FS.label} color={C.ink} style={{ opacity: clamp01(labelA) }} />
      <Label
        x={S6_RIGHT_X + ICE_DIRECTIONAL_LABEL_PT.x * S6_SCALE} y={S6_Y + ICE_DIRECTIONAL_LABEL_PT.y * S6_SCALE}
        text={t.s6DirectionalLabel} size={FS.tiny} color={C.inkSoft} style={{ opacity: clamp01(noteA) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 투명 얼음과 뿌연 얼음이 나란히 놓인 마무리 컷 (캐릭터 없음 - 대본 지시)
 * ============================================================ */
const S7_DIAG_W = 440;
const S7_GAP = 50;
const S7_TOTAL_W = S7_DIAG_W * 2 + S7_GAP;
const S7_LEFT_X = CX - S7_TOTAL_W / 2;
const S7_RIGHT_X = S7_LEFT_X + S7_DIAG_W + S7_GAP;
const S7_Y = 560;

export const S7Final: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const appearA = progress(f, 0, 16);
  const appearScale = 0.86 + 0.14 * clamp01(appearA);

  const appearStyle: React.CSSProperties = {
    opacity: appearA, transform: `scale(${appearScale})`, transformOrigin: '50% 50%',
  };

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <IceCloudinessDiagram
        width={S7_DIAG_W} x={S7_LEFT_X} y={S7_Y} mode="trapped"
        dissolveProgress={1} freezeProgress={1} pushProgress={1} trapProgress={1} scatterProgress={1}
        style={appearStyle}
      />
      <IceCloudinessDiagram
        width={S7_DIAG_W} x={S7_RIGHT_X} y={S7_Y} mode="directional"
        dissolveProgress={1} freezeProgress={1} pushProgress={1} scatterProgress={1}
        style={appearStyle}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
