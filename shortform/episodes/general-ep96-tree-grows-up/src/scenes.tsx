/** 이 화(general-ep96, "나무가 위로만 곧게 자라는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(무성 - 기울어진 언덕 위 나무들이 다 위로 곧게 뻗어 있음, GravitropismTree 정적 배치
 *  + 카메라 슬로우 팬) -> s2(BustActor 리액션 "왜 다 이 방향으로만 자라는 거지?") ->
 *  s3(GravitropismDiagram growProgress 0~0.34 - 씨앗 속 감지 기관이 항상 true down 쪽으로
 *  자리잡음 + gravityArrow) -> s4(같은 다이어그램을 potTiltDeg 세 가지(똑바로/옆으로/
 *  뒤집힘)로 나란히 - 어느 방향이어도 뿌리는 아래·줄기는 위로 수렴함을 직접 검증) ->
 *  s5(auxinProgress - 옥신이 몰리며 줄기가 마저 교정) -> s6(같은 growProgress, 캄캄한
 *  배경 - 빛 없이도 방향은 그대로 잡힘) -> s7(microgravityConfused - 우주정거장에서 방향을
 *  못 잡고 헤맴) -> s8(tiltCorrectProgress - 화분이 기울어져도 다시 곧게 섬, s1의 결론을
 *  다시 확인).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시) 반영:
 *   - 78화 SunflowerTrackingDiagram과 동일하게, 뿌리·줄기의 최종 방향은 potTiltDeg 와
 *     무관하게 코드가 직접 계산한다(GravitropismDiagram 파일 상단 주석 참고) - s4에서
 *     potTiltDeg=180/90/0 세 가지를 동시에 렌더해 실제로 항상 같은 방향(뿌리 아래/줄기
 *     위)으로 수렴하는지 화면에서 바로 확인할 수 있다.
 *   - 중력 감지는 사실적 세포 구조 대신 씨앗 안의 작은 점(센서)과 화살표로만 표현한다.
 *   - 나무·씨앗은 전부 단순 도형(GravitropismTree/GravitropismDiagram 자체 설계).
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s1(무성, 카메라 팬 중간)에 leaf_rustle을 붙이고,
 *  s3(감지 기관이 자리를 잡는 "어! 감지했다" 순간)과 s8(기울어진 화분이 마침내 곧게 서는
 *  결론 순간)에 realize_ding을 붙인다. 셋 다 Episode.tsx가 이 파일이 export하는 로컬
 *  프레임 상수에 맞춰 배치한다.
 */
import React from 'react';
import {
  AUXIN_LABEL_PT, BustActor, C, Caption, FPS, FS, GRAV_VB_W, GravitropismDiagram,
  GravitropismTree, Label, NightSkyBg, PlainBg, POSES, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2; // 540
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface SilentSceneProps { f: number; frames: number }

/* ============================================================
 * S1: 무성 - 기울어진 언덕 위 나무들이 다 위로 곧게 뻗어 있음
 * ============================================================ */
const S1_HILL_LEFT_Y = 1520;
const S1_HILL_RIGHT_Y = 1220;
const S1_TREES = [
  { x: 190, height: 300, baseLeanDeg: -22, canopyR: 66 },
  { x: 420, height: 340, baseLeanDeg: -30, canopyR: 76 },
  { x: 650, height: 280, baseLeanDeg: -20, canopyR: 60 },
  { x: 880, height: 320, baseLeanDeg: -28, canopyR: 72 },
];
/** 카메라 팬이 언덕 전체를 다 보여준 직후 - Episode.tsx가 여기에 leaf_rustle SFX를 놓는다 */
export const S1_RUSTLE_AT_FRAME = 38;

function hillY(x: number) {
  return S1_HILL_LEFT_Y - ((S1_HILL_LEFT_Y - S1_HILL_RIGHT_Y) * x) / W;
}

export const S1Hillside: React.FC<SilentSceneProps> = ({ f, frames }) => {
  const panP = progress(f, 0, frames);
  const shiftY = -46 * panP;
  const scale = 1 + 0.05 * panP;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null} floor={false}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path
          d={`M 0 ${S1_HILL_LEFT_Y} L ${W} ${S1_HILL_RIGHT_Y} L ${W} 1920 L 0 1920 Z`}
          fill={C.hill} opacity={0.55}
        />
        <path
          d={`M 0 ${S1_HILL_LEFT_Y} L ${W} ${S1_HILL_RIGHT_Y}`}
          fill="none" stroke={C.hill} strokeWidth={10} strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${shiftY}px) scale(${scale})`, transformOrigin: '50% 74%' }}>
        <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          {S1_TREES.map((tr, i) => (
            <GravitropismTree
              key={i} baseX={tr.x} baseY={hillY(tr.x)} height={tr.height}
              baseLeanDeg={tr.baseLeanDeg} canopyR={tr.canopyR}
            />
          ))}
        </svg>
      </div>
    </PlainBg>
  );
};

/* ============================================================
 * S2: "왜 다 이 방향으로만 자라는 거지?" (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 470;

export const S2React: React.FC<SceneProps & { mouth: Record<string, number[]> }> = ({
  f, frames, lines, mouth,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const surpriseT = progress(f, 0, 20);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, surpriseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 씨앗 속 감지 기관이 항상 true down 쪽으로 자리잡음 + 중력 화살표
 * ============================================================ */
const S3_DIAG_W = 640;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 560;
/** 감지 기관(센서)이 자리를 다 잡는 순간 - Episode.tsx가 여기에 realize_ding SFX를 놓는다 */
export const S3_DING_AT_FRAME = 55;

export const S3Sense: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const growP = progress(f, 6, Math.min(60, Math.max(30, frames - 40))) * 0.34;

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <GravitropismDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} growProgress={growP} gravityArrow />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 세 가지 방향(똑바로/옆으로/뒤집힘) 동시 검증
 * ============================================================ */
const S4_PANEL_W = 270;
const S4_PANEL_Y = 620;
const S4_XS = [220, 540, 860];
const S4_TILTS = [180, 90, 0];
const S4_LABELS = [t.s4UprightLabel, t.s4SideLabel, t.s4UpsideDownLabel];
const S4_PANEL_H = S4_PANEL_W * (640 / 560);
const S4_LABEL_Y = S4_PANEL_Y + S4_PANEL_H + 46;

export const S4MultiAngle: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  void frames;
  const growP = 0.05 + 0.95 * progress(f, 10, 140);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      {S4_XS.map((x, i) => (
        <GravitropismDiagram
          key={i} width={S4_PANEL_W} x={x - S4_PANEL_W / 2} y={S4_PANEL_Y}
          potTiltDeg={S4_TILTS[i]} growProgress={growP}
        />
      ))}
      {S4_XS.map((x, i) => (
        <Label key={i} x={x} y={S4_LABEL_Y} text={S4_LABELS[i]} size={FS.small} />
      ))}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 옥신이 몰리며 줄기가 마저 교정됨
 * ============================================================ */
const S5_DIAG_W = 760;
const S5_DIAG_X = CX - S5_DIAG_W / 2;
const S5_DIAG_Y = 500;
const S5_SCALE = S5_DIAG_W / GRAV_VB_W;

export const S5Auxin: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  void frames;
  const auxinP = progress(f, 12, 170);
  const labelA = progress(f, 26, 60);
  const labelX = S5_DIAG_X + AUXIN_LABEL_PT.x * S5_SCALE;
  const labelY = S5_DIAG_Y + AUXIN_LABEL_PT.y * S5_SCALE;

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <GravitropismDiagram width={S5_DIAG_W} x={S5_DIAG_X} y={S5_DIAG_Y} growProgress={1} auxinProgress={auxinP} />
      <Label x={labelX} y={labelY} text={t.s5AuxinLabel} size={FS.label} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 캄캄한 곳에서도 방향은 그대로 잡힘
 * ============================================================ */
const S6_DIAG_W = 720;
const S6_DIAG_X = CX - S6_DIAG_W / 2;
const S6_DIAG_Y = 520;

export const S6Dark: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  void frames;
  const growP = 0.1 + 0.85 * progress(f, 8, 150);

  return (
    <PlainBg top={C.nightMid} bottom={C.ink} ground={null}>
      <GravitropismDiagram width={S6_DIAG_W} x={S6_DIAG_X} y={S6_DIAG_Y} growProgress={growP} stroke={C.cream} />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 우주정거장 - 방향을 못 잡고 헤맴
 * ============================================================ */
const S7_DIAG_W = 720;
const S7_DIAG_X = CX - S7_DIAG_W / 2;
const S7_DIAG_Y = 520;

export const S7Confused: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const confusedP = progress(f, 8, Math.max(20, frames - 30));

  return (
    <>
      <NightSkyBg moon={null} />
      <GravitropismDiagram
        width={S7_DIAG_W} x={S7_DIAG_X} y={S7_DIAG_Y} microgravityConfused={confusedP} stroke={C.cream}
      />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S8: 화분이 기울어져도 결국 곧게 섬
 * ============================================================ */
const S8_DIAG_W = 760;
const S8_DIAG_X = CX - S8_DIAG_W / 2;
const S8_DIAG_Y = 500;
/** 교정이 거의 끝나 곧게 서는 순간 - Episode.tsx가 여기에 realize_ding SFX를 놓는다 */
export const S8_DING_AT_FRAME = 150;

export const S8TiltCorrect: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const correctP = progress(f, 10, Math.max(40, frames - 26));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <GravitropismDiagram width={S8_DIAG_W} x={S8_DIAG_X} y={S8_DIAG_Y} potTiltDeg={60} tiltCorrectProgress={correctP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
