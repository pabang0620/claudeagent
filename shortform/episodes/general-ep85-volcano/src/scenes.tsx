/** 이 화(general-ep85, "화산이 갑자기 펑 터지는 이유") 전용 장면.
 *
 *  s1(캐릭터가 화산 폭발 사진을 보는 장면, 무성) -> s2(BustActor 리액션 "우와, 화산은 왜
 *  저렇게 갑자기 펑 터지는 거지?") -> s3(VolcanoDiagram, dissolvedGasProgress - 마그마 속에
 *  기체가 원래 녹아 있음) -> s4(같은 다이어그램, pressureProgress - 압력에 눌려 기체가 갇혀
 *  있음) -> s5(risingProgress+expandProgress - 마그마가 올라오며 기체가 부풀기 시작) ->
 *  s6(eruptProgress+FlashOverlay - 정상에서 폭발) -> s7(같은 다이어그램 2벌, viscosity 0
 *  vs 1 - 묽은 마그마의 잔잔한 흐름 vs 끈적한 마그마의 격렬한 폭발 비교).
 *
 *  VolcanoDiagram(props/, general-ep85 신설)은 s3~s7 전부 같은 땅속 단면 레이아웃을
 *  재사용한다(SaltCycleDiagram·HiccupDiagram과 같은 "단일 컴포넌트로 여러 화면 커버" 설계) -
 *  호출 씬이 width로 확대율만 바꾼다. 이전 단계 progress=1을 전제로 다음 단계를 이어받는다
 *  (21화 이후 결함 D - "다음 장면에서 이전 상태를 명시적으로 유지시킨다").
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 압력이 높을 때 갇혀 있던 기체와 압력이 낮아지며 부푸는 기체의 대비가 중심이다.
 *     기포는 VolcanoDiagram 안에서 큰 원 3개로만 표현하고 잔뜩 뿌리지 않는다.
 *   - 묽은 마그마(잔잔한 흐름) vs 끈적한 마그마(격렬한 폭발)의 대비는 흐름의 부드러움/
 *     거침으로 표현한다(s7, viscosity prop).
 *   - 화산 폭발 장면을 무섭게 그리지 않는다. 튀는 마그마는 전부 둥근 원(blob)이다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, FS, FlashOverlay, Label, PlainBg, POSES, VolcanoDiagram, W,
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

const DIAG_WIDTH = 720;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 300;

/* ============================================================
 * S1: 캐릭터가 화산 폭발 사진을 본다 (전신, 무성)
 * ============================================================ */
const S1_ACTOR_GROUND = 1300;
const S1_PHOTO_W = 320;
const S1_PHOTO_X = 620;
const S1_PHOTO_Y = 500;
/** thunder_boom(먼 우르릉 소리)을 재생할 시점 - Episode.tsx가 이 상수를 그대로 가져다 쓴다 */
export const S1_RUMBLE_AT_FRAC = 0.4;

export const S1Watch: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const revealT = progress(f, 4, 16);
  const surpriseT = progress(f, 10, Math.round(frames * 0.75));
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, surpriseT * 0.8);
  const scale = 0.82 + 0.18 * clamp01(revealT);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={S1_ACTOR_GROUND}>
      <Actor size={780} centerX={260} ground={S1_ACTOR_GROUND} pose={pose} />
      <div
        style={{
          position: 'absolute', left: S1_PHOTO_X, top: S1_PHOTO_Y, width: S1_PHOTO_W, height: S1_PHOTO_W * 1.2,
          opacity: clamp01(revealT), transform: `scale(${scale})`, transformOrigin: '50% 50%',
        }}
      >
        <svg width={S1_PHOTO_W} height={S1_PHOTO_W * 1.2} viewBox={`0 0 ${S1_PHOTO_W} ${S1_PHOTO_W * 1.2}`} style={{ overflow: 'visible' }}>
          <rect x={0} y={0} width={S1_PHOTO_W} height={S1_PHOTO_W * 1.2} rx={24} fill={C.paper} stroke={C.ink} strokeWidth={10} />
        </svg>
        <VolcanoDiagram
          width={S1_PHOTO_W * 0.82} x={S1_PHOTO_W * 0.09} y={S1_PHOTO_W * 0.12}
          dissolvedGasProgress={1} risingProgress={1} expandProgress={1} eruptProgress={1} viscosity={1}
        />
      </div>
    </PlainBg>
  );
};

/* ============================================================
 * S2: "우와, 화산은 왜 저렇게 갑자기 펑 터지는 거지?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;
const S2_ICON_W = 190;
const S2_ICON_X = CX + 300;
const S2_ICON_Y = 540;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, 0.85);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      {/* 지금 놀라서 보고 있는 그 화산 - s3~s6이 설명할 대상을 먼저 눈에 담아둔다 */}
      <VolcanoDiagram
        width={S2_ICON_W} x={S2_ICON_X} y={S2_ICON_Y}
        dissolvedGasProgress={1} risingProgress={1} expandProgress={1} eruptProgress={1} viscosity={1}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 마그마 속에 기체가 원래 녹아 있다 (dissolvedGasProgress)
 * ============================================================ */
export const S3Dissolve: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dissolveP = progress(f, 4, Math.round(frames * 0.82));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VolcanoDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} dissolvedGasProgress={dissolveP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 압력이 세서 기체가 갇힌 채 있다 (pressureProgress)
 * ============================================================ */
export const S4Pressure: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const pressureP = progress(f, 0, Math.round(frames * 0.7));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VolcanoDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolvedGasProgress={1} pressureProgress={pressureP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 마그마가 올라오며 압력이 낮아지고, 기체가 거품처럼 부풀기 시작한다
 *     (risingProgress + expandProgress)
 * ============================================================ */
export const S5Rise: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const risingP = progress(f, 0, Math.round(frames * 0.92));
  const expandP = progress(f, Math.round(frames * 0.16), frames);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VolcanoDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolvedGasProgress={1} pressureProgress={1} risingProgress={risingP} expandProgress={expandP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 정상에서 폭발한다 (eruptProgress + FlashOverlay)
 * ============================================================ */
/** 폭발 임팩트 섬광이 터지는 진행도(0~1). Episode.tsx가 필요로 하지 않고 이 파일 안에서만
 *  쓰지만, 상수로 빼 eruptProgress 램프의 기준과 어긋나지 않게 한다 */
const S6_FLASH_AT_FRAC = 0.42;

export const S6Erupt: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const eruptP = progress(f, Math.round(frames * 0.12), Math.round(frames * 0.62));
  const flashAt = Math.round(frames * S6_FLASH_AT_FRAC);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VolcanoDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        dissolvedGasProgress={1} pressureProgress={0} risingProgress={1} expandProgress={1}
        eruptProgress={eruptP} viscosity={1}
      />
      <FlashOverlay frame={f} at={flashAt} color={C.gold} peak={0.55} rise={3} fall={14} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 묽은 마그마(잔잔히 흐름) vs 끈적한 마그마(격렬히 폭발) 비교
 * ============================================================ */
const S7_DIAG_W = 440;
const S7_GAP = 60;
const S7_TOTAL_W = S7_DIAG_W * 2 + S7_GAP;
const S7_LEFT_X = CX - S7_TOTAL_W / 2;
const S7_RIGHT_X = S7_LEFT_X + S7_DIAG_W + S7_GAP;
const S7_Y = 560;
const S7_LABEL_Y = S7_Y - 50;

export const S7Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const eruptP = progress(f, 4, Math.round(frames * 0.75));
  const labelA = progress(f, 6, 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VolcanoDiagram
        width={S7_DIAG_W} x={S7_LEFT_X} y={S7_Y}
        dissolvedGasProgress={1} risingProgress={1} expandProgress={1}
        eruptProgress={eruptP} viscosity={0}
      />
      <VolcanoDiagram
        width={S7_DIAG_W} x={S7_RIGHT_X} y={S7_Y}
        dissolvedGasProgress={1} risingProgress={1} expandProgress={1}
        eruptProgress={eruptP} viscosity={1}
      />
      <Label x={S7_LEFT_X + S7_DIAG_W / 2} y={S7_LABEL_Y} text={t.s7LowLabel} size={FS.label} color={C.ink} style={{ opacity: clamp01(labelA) }} />
      <Label x={S7_RIGHT_X + S7_DIAG_W / 2} y={S7_LABEL_Y} text={t.s7HighLabel} size={FS.label} color={C.ink} style={{ opacity: clamp01(labelA) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
