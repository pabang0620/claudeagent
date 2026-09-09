/** 이 화(general-ep64, "똑같이 딱딱한데 유리만 투명한 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(무성 - 유리창 너머로 풍경을 보다가 옆 벽을 톡톡 두드림) -> s2(리액션+훅 질문, 바스트샷
 *  립싱크) -> s3(빛이 물체에 부딪혔을 때 세 갈래 - 통과/튕김/흡수 - 로 갈라지는 개념도) ->
 *  s4(유리 블록 속을 빛줄기가 곧게 뚫고 지나감) -> s5(유리 반대편 풍경이 그대로 비쳐 보이는
 *  완성 장면) -> s6(벽 블록 표면에서 빛이 사방으로 튕기고 일부는 흡수됨) -> s7(벽 반대편이
 *  캄캄히 막힌 완성 장면, s5와 대구) -> s8(같은 유리의 표면만 거칠어지며 젖빛으로 흐려짐).
 *
 *  s4~s8은 같은 "블록 뒤에 해가 있다" 구도(DEMO_BLOCK_*, SUN_*)를 공유해 유리/벽의 결과를
 *  직접 비교할 수 있게 했다(s5·s7 "대구" 요구를 좌표까지 동일하게 맞춰 만족). 원자 배열은
 *  점을 뿌리지 않고 TransparencyBlock의 큰 도형(반투명/불투명 + 하이라이트/이음선)만으로
 *  표현한다(오케스트레이터 시각 주의사항).
 *
 *  s2만 캐릭터가 직접 말하는 순간이라 mouth.json 립싱크를 쓴다. s3~s8은 3인칭 설명
 *  내레이션이 다이어그램 위에 흐르는 구간이라 캐릭터가 등장하지 않는다(ep58과 동일 원칙).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, Label, LightScatterDiagram, POSES, PlainBg,
  TransparencyBlock, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = 540; // W/2
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * 공용: "블록 뒤에 해가 있다" 구도 (s4~s8 공유)
 * ============================================================ */
const DEMO_BLOCK_W = 640;
const DEMO_BLOCK_H = 900;
const DEMO_BLOCK_X = CX - DEMO_BLOCK_W / 2;
const DEMO_BLOCK_Y = 460;
const SUN_CX = CX;
const SUN_CY = DEMO_BLOCK_Y + 320;
const SUN_R = 120;

const SunDisc: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    <circle cx={SUN_CX} cy={SUN_CY} r={SUN_R} fill={C.gold} stroke={C.ink} strokeWidth={10} opacity={opacity} />
  </svg>
);

// 빛줄기 다이어그램(s4/s6 공용) - 700x700 프레임을 스케일 1:1로 놓아 vb좌표=화면좌표-오프셋
const DIAG_X = CX - 350;
const DIAG_Y = DEMO_BLOCK_Y + DEMO_BLOCK_H / 2 - 350;
const RAY_Y_SCREEN = DEMO_BLOCK_Y + DEMO_BLOCK_H / 2;
const toVb = (px: number, py: number) => ({ x: px - DIAG_X, y: py - DIAG_Y });
const RAY_FROM = toVb(DEMO_BLOCK_X - 160, RAY_Y_SCREEN);
const RAY_THROUGH_TO = toVb(DEMO_BLOCK_X + DEMO_BLOCK_W + 160, RAY_Y_SCREEN);
const RAY_HIT = toVb(DEMO_BLOCK_X, RAY_Y_SCREEN);

/* ============================================================
 * S1: 유리창 너머로 풍경을 보다가 옆 벽을 톡톡 두드린다 (무성)
 * ============================================================ */

const S1_BLOCK_W = 460;
const S1_BLOCK_H = 760;
const S1_GAP = 40;
const S1_GLASS_X = CX - S1_BLOCK_W - S1_GAP / 2;
const S1_WALL_X = CX + S1_GAP / 2;
const S1_BLOCK_Y = 300;
const S1_TAP_X = S1_WALL_X + 90;
const S1_TAP_Y = S1_BLOCK_Y + 420;

// tap1/tap2 프레임 비율(Episode.tsx의 SFX 타이밍과 맞춰 쓴다)
export const S1_TAP1_AT = 0.4;
export const S1_TAP2_AT = 0.62;

function tapBump(f: number, atFrame: number) {
  const d = f - atFrame;
  if (d < 0) return 0;
  return Math.exp(-d / 6);
}

export const S1TapWall: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const tap = Math.min(1, tapBump(f, frames * S1_TAP1_AT) + tapBump(f, frames * S1_TAP2_AT));
  const pose: Pose = blendPose(POSES.idle, POSES.pointUp, 0.3);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={1250}>
      <TransparencyBlock type="glass" width={S1_BLOCK_W} height={S1_BLOCK_H} x={S1_GLASS_X} y={S1_BLOCK_Y} />
      <TransparencyBlock type="wall" width={S1_BLOCK_W} height={S1_BLOCK_H} x={S1_WALL_X} y={S1_BLOCK_Y} />
      <div
        style={{
          position: 'absolute', left: S1_TAP_X - 40, top: S1_TAP_Y - 40, width: 80, height: 80,
          borderRadius: 40, background: C.coralSoft, opacity: 0.6 * tap,
          transform: `scale(${0.7 + 0.4 * tap})`,
        }}
      />
      <Actor size={560} centerX={CX} ground={1250} pose={pose} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 리액션 + 훅 질문 (바스트샷, "어? 유리는 그냥 넘어다 보이는데, 벽은 왜 하나도 안 보이지?")
 * ============================================================ */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = CX - S2_BUST_SIZE / 2;
const S2_BUST_TOP = 260;

export const S2Question: React.FC<{ lines: CaptionLine[]; mouth: MouthFile['mouth']; f: number }> = ({
  lines, mouth, f,
}) => {
  const puzzleT = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.thinking, puzzleT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 빛이 물체에 부딪히면 세 갈래(통과/튕김/흡수)로 갈라지는 개념도
 * ============================================================ */

const S3_COL_W = 280;
const S3_COL_GAP = 40;
const S3_COL_XS = [80, 80 + S3_COL_W + S3_COL_GAP, 80 + (S3_COL_W + S3_COL_GAP) * 2];
const S3_COL_Y = 560;
const S3_LABEL_Y = S3_COL_Y + S3_COL_W + 44;

export const S3ForkDiagram: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);

  // 통과: 위->아래로 곧게 뻗는다
  const passProgress = progress(f, frames * 0.12, frames * 0.75);

  // 튕김: 중앙까지 도달 -> 사방으로 흩어짐
  const bounceArrive = progress(f, frames * 0.1, frames * 0.42);
  const bounceScatter = progress(f, frames * 0.42, frames * 0.95);

  // 흡수: 중앙까지 도달 -> 서서히 사라짐(옅어짐)
  const absorbArrive = progress(f, frames * 0.1, frames * 0.42);
  const absorbFade = 1 - progress(f, frames * 0.58, frames * 0.94);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* 통과 */}
      <LightScatterDiagram
        width={S3_COL_W} x={S3_COL_XS[0]} y={S3_COL_Y}
        pathFrom={{ x: 350, y: 40 }} pathTo={{ x: 350, y: 660 }} pathProgress={passProgress}
      />
      {/* 튕김 */}
      <LightScatterDiagram
        width={S3_COL_W} x={S3_COL_XS[1]} y={S3_COL_Y}
        pathFrom={{ x: 350, y: 40 }} pathTo={{ x: 350, y: 350 }} pathProgress={bounceArrive}
        scatterProgress={bounceScatter} scatterOrigins={[{ x: 350, y: 350 }]} scatterArrowLength={160}
      />
      {/* 흡수 - 도달 후 서서히 옅어져 사라진다 */}
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: absorbFade }}>
        <LightScatterDiagram
          width={S3_COL_W} x={S3_COL_XS[2]} y={S3_COL_Y}
          pathFrom={{ x: 350, y: 40 }} pathTo={{ x: 350, y: 350 }} pathProgress={absorbArrive}
        />
      </div>
      <Label x={S3_COL_XS[0] + S3_COL_W / 2} y={S3_LABEL_Y} text={t.passLabel} size={44} />
      <Label x={S3_COL_XS[1] + S3_COL_W / 2} y={S3_LABEL_Y} text={t.bounceLabel} size={44} />
      <Label x={S3_COL_XS[2] + S3_COL_W / 2} y={S3_LABEL_Y} text={t.absorbLabel} size={44} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 유리 블록 속으로 빛줄기가 곧게 뚫고 지나간다
 * ============================================================ */

export const S4GlassPass: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const passT = progress(f, frames * 0.1, frames * 0.85);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunDisc />
      <LightScatterDiagram
        width={700} x={DIAG_X} y={DIAG_Y}
        pathFrom={RAY_FROM} pathTo={RAY_THROUGH_TO} pathProgress={passT}
      />
      <TransparencyBlock type="glass" width={DEMO_BLOCK_W} height={DEMO_BLOCK_H} x={DEMO_BLOCK_X} y={DEMO_BLOCK_Y} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 유리 반대편 풍경이 그대로 비쳐 보이는 완성 장면
 * ============================================================ */

export const S5GlassFinal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const enter = progress(f, 0, 12);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: enter }}>
        <SunDisc />
        <TransparencyBlock
          type="glass" width={DEMO_BLOCK_W} height={DEMO_BLOCK_H} x={DEMO_BLOCK_X} y={DEMO_BLOCK_Y}
        />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 벽 표면에서 빛이 사방으로 튕기고 일부는 흡수된다
 * ============================================================ */

export const S6WallScatter: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const arriveT = progress(f, frames * 0.06, frames * 0.28);
  const scatterT = progress(f, frames * 0.28, frames * 0.95);
  const labelA = progress(f, frames * 0.35, frames * 0.55);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunDisc />
      <Label x={CX} y={DEMO_BLOCK_Y - 90} text={t.mixLabel} size={44} style={{ opacity: labelA }} />
      <LightScatterDiagram
        width={700} x={DIAG_X} y={DIAG_Y}
        pathFrom={RAY_FROM} pathTo={RAY_HIT} pathProgress={arriveT}
        scatterProgress={scatterT} scatterOrigins={[RAY_HIT]} scatterArrowLength={130}
      />
      <TransparencyBlock type="wall" width={DEMO_BLOCK_W} height={DEMO_BLOCK_H} x={DEMO_BLOCK_X} y={DEMO_BLOCK_Y} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 벽 반대편은 캄캄하게 막힌 채로 남는 완성 장면 (s5와 대구, 같은 좌표)
 * ============================================================ */

export const S7WallFinal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const enter = progress(f, 0, 12);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: enter }}>
        <SunDisc />
        <TransparencyBlock type="wall" width={DEMO_BLOCK_W} height={DEMO_BLOCK_H} x={DEMO_BLOCK_X} y={DEMO_BLOCK_Y} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 같은 유리 블록의 표면만 거칠게 바뀌며(젖빛 유리) 반대편이 뿌옇게 흐려진다
 * ============================================================ */

export const S8FrostedGlass: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const rough = progress(f, frames * 0.15, frames * 0.85) * 0.9;
  const labelA = progress(f, frames * 0.35, frames * 0.55);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunDisc opacity={1 - rough * 0.55} />
      <TransparencyBlock
        type="glass" width={DEMO_BLOCK_W} height={DEMO_BLOCK_H} x={DEMO_BLOCK_X} y={DEMO_BLOCK_Y}
        roughSurface={rough}
      />
      <Label x={CX} y={DEMO_BLOCK_Y - 90} text={t.frostLabel} size={48} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
