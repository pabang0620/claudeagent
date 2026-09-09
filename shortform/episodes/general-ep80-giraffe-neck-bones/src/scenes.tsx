/** 이 화(general-ep80, "기린 목뼈가 사람과 개수가 같은 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(기린+사람 전신, 목을 따라 카메라 상승) -> s2(무성 - BoneStack 두 벌로 사람/기린 목뼈
 *  7칸을 나란히 순서대로 점등 + StepCounter로 "7" 표시) -> s3(NeckVertebraeDiagram
 *  lengthCompareProgress - 칸 수는 그대로 7개, 기린 칸만 길게 늘어남) -> s4(HandBoneCompare -
 *  기린 목뼈 하나 vs 사람 손바닥 크기 대비) -> s5(쥐·고래·사람·기린 실루엣 + NeckCountBadge
 *  7점 체인으로 공통 개수 강조) -> s6(나무늘보·매너티 - 예외 동물) -> s7(기린 전신 마무리 컷).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 사람 목뼈 7칸과 기린 목뼈 7칸을 나란히 놓고 "개수는 같은데 길이만 다르다"는 대비가
 *     중심 - 해부학적으로 그리지 않고 단순한 마디 도형을 이어붙인 형태로만 표현한다.
 *   - 기린은 단순하고 귀여운 도형(기존 Giraffe 소품)으로 그린다.
 *   - 개수를 셀 때 숫자가 순서대로 뚜렷하게 보이게 한다 (StepCounter, width+nowrap 지정).
 *
 *  새 REGISTRY 자산은 `NeckVertebraeDiagram`/`HandBoneCompare`/`NeckCountBadge`/`Manatee`
 *  4개뿐이다. 02-script-v1.md 자산 목록이 "신규"로 적었던 countProgress(개수 세기)는
 *  REGISTRY 우선 원칙에 따라 기존 `BoneStack`(1화에서 이미 이 목뼈 소재로 만들어진 것) 두
 *  벌로 대체했다 - 자세한 판단 근거는 `assets/props/NeckVertebraeDiagram.tsx` 상단 주석과
 *  99-build-report.md 참고(29화·77화와 같은 판단).
 */
import React from 'react';
import {
  Actor, BoneStack, C, Caption, FPS, FS, GROUND, Giraffe, HAND_BONE_LABEL_PT, HAND_BONE_VB_H,
  HAND_BONE_VB_W, HAND_PALM_LABEL_PT, HandBoneCompare, Label, Manatee, MiniCharacter, Mouse,
  NECK_BADGE_VB_H, NECK_GIRAFFE_LABEL_PT, NECK_HUMAN_LABEL_PT, NECK_VB_H, NECK_VB_W,
  NeckCountBadge, NeckVertebraeDiagram, PlainBg, POSES, PopIn, PulseRing, SavannaBg, Sloth,
  StepCounter, W, Whale, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface SilentSceneProps { f: number; frames: number }

/** Giraffe(viewBox 620x1000, 발끝 vb y=950)를 화면 좌표에 세운다. Actor 의 grounding 방식과
 *  같은 계산을 Giraffe 전용으로 로컬 구현했다(Giraffe 자체엔 x/y 가 없다 - REGISTRY 규약 그대로,
 *  이 화만 쓰는 배치 계산이라 라이브러리로 승격하지 않고 지역성 우선 원칙을 따름). */
function giraffeStyle(centerX: number, renderWidth: number, groundY: number = GROUND): React.CSSProperties {
  const h = (renderWidth * 1000) / 620;
  return { position: 'absolute', left: centerX - renderWidth / 2, top: groundY - h * 0.95, width: renderWidth };
}

/* ============================================================
 * S1: 기린 + 사람 전신, 목을 따라 카메라가 서서히 상승
 * ============================================================ */
const S1_GIRAFFE_W = 640;
const S1_ACTOR_SIZE = 560;

export const S1Hook: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const riseP = progress(f, 4, Math.max(30, frames - 16));
  const shiftY = -170 * riseP;
  const scale = 1 + 0.14 * riseP;

  return (
    <>
      <SavannaBg sun />
      <div
        style={{
          position: 'absolute', inset: 0,
          transform: `translateY(${shiftY}px) scale(${scale})`,
          transformOrigin: '50% 74%',
        }}
      >
        <Actor size={S1_ACTOR_SIZE} centerX={CX - 250} pose={POSES.idle} />
        <div style={giraffeStyle(CX + 260, S1_GIRAFFE_W)}>
          <Giraffe width={S1_GIRAFFE_W} />
        </div>
      </div>
      <Caption line={line} t={f / FPS} />
    </>
  );
};

/* ============================================================
 * S2: 무성 - 사람/기린 목뼈 7칸을 나란히 순서대로 점등 + "7" 표시
 * ============================================================ */
const S2_BLOCK_W = 140;
const S2_BLOCK_H = 90;
const S2_GAP = 14;
const S2_COL_TOTAL_H = 7 * S2_BLOCK_H + 6 * S2_GAP;
/** GROUND(1250)에 바로 붙이면 화면 하단 40% 가까이가 빈 채로 남는다(스틸 선점검 실측 -
 *  99-build-report.md 참고). s2는 무성 구간이라 자막 안전영역 제약이 없어 더 아래로 내려도
 *  된다 - 바닥 기준을 1600으로 낮춰 안전영역 안에서 세로 중앙~하단까지 채운다(원칙 5
 *  체크리스트 "화면 아래쪽 여백이 과다하지 않은가"). */
const S2_GROUND = 1600;
const S2_COL_TOP = S2_GROUND - S2_COL_TOTAL_H;
const S2_HUMAN_X = CX - 260;
const S2_GIRAFFE_X = CX + 260;
/** Episode.tsx가 무성 구간(원칙 7)에 ui_tap 효과음을 이 프레임에 맞춰 붙이므로 export한다. */
export const S2_STEPS = [6, 16, 26, 36, 46, 56, 66];

export const S2Count: React.FC<SilentSceneProps> = ({ f }) => {
  const lit = S2_STEPS.filter((s) => f >= s).length;
  const popAt = (i: number) => progress(f, S2_STEPS[i], S2_STEPS[i] + 10);
  const numY = S2_COL_TOP - 168;
  const labelY = numY - 66;

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <div style={{ position: 'absolute', left: S2_HUMAN_X, top: S2_COL_TOP, transform: 'translateX(-50%)' }}>
        <BoneStack
          count={7} lit={lit} blockW={S2_BLOCK_W} blockH={S2_BLOCK_H} gap={S2_GAP}
          litColor={C.gold} popAt={popAt}
        />
      </div>
      <div style={{ position: 'absolute', left: S2_GIRAFFE_X, top: S2_COL_TOP, transform: 'translateX(-50%)' }}>
        <BoneStack
          count={7} lit={lit} blockW={S2_BLOCK_W} blockH={S2_BLOCK_H} gap={S2_GAP}
          litColor={C.coral} popAt={popAt}
        />
      </div>

      <Label x={S2_HUMAN_X} y={labelY} text={t.s2HumanLabel} size={FS.label} />
      <Label x={S2_GIRAFFE_X} y={labelY} text={t.s2GiraffeLabel} size={FS.label} />
      <StepCounter
        x={S2_HUMAN_X} y={numY} steps={S2_STEPS} frame={f} size={110} color={C.gold}
        width={200} style={{ whiteSpace: 'nowrap' }}
      />
      <StepCounter
        x={S2_GIRAFFE_X} y={numY} steps={S2_STEPS} frame={f} size={110} color={C.coral}
        width={200} style={{ whiteSpace: 'nowrap' }}
      />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 칸 수는 그대로 7개, 기린 칸만 길게 늘어남
 * ============================================================ */
const S3_DIAG_W = 940;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
/** 560 -> 760: 스틸 선점검에서 화면 하단이 과다하게 비는 것을 실측해 아래로 내렸다
 *  (99-build-report.md 참고, 자막 안전영역 CAP_BOTTOM=300 위로는 여전히 여유가 넉넉하다). */
const S3_DIAG_Y = 760;
const S3_SCALE = S3_DIAG_W / NECK_VB_W;

export const S3LengthCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const lenP = progress(f, 12, Math.max(24, frames - 20));

  const humanLabelX = S3_DIAG_X + NECK_HUMAN_LABEL_PT.x * S3_SCALE;
  const humanLabelY = S3_DIAG_Y + NECK_HUMAN_LABEL_PT.y * S3_SCALE;
  const giraffeLabelX = S3_DIAG_X + NECK_GIRAFFE_LABEL_PT.x * S3_SCALE;
  const giraffeLabelY = S3_DIAG_Y + NECK_GIRAFFE_LABEL_PT.y * S3_SCALE;

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <NeckVertebraeDiagram
        width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} lengthCompareProgress={lenP}
      />
      <Label x={humanLabelX} y={humanLabelY} text={t.s3HumanLabel} size={FS.label} align="left" />
      <Label x={giraffeLabelX} y={giraffeLabelY} text={t.s3GiraffeLabel} size={FS.label} align="left" />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 기린 목뼈 하나 vs 사람 손바닥 크기 대비
 * ============================================================ */
const S4_DIAG_W = 800;
const S4_DIAG_X = CX - S4_DIAG_W / 2;
/** 620 -> 800: S3와 같은 이유로 아래로 내렸다(원칙 5 체크리스트, 99-build-report.md 참고). */
const S4_DIAG_Y = 800;
const S4_SCALE = S4_DIAG_W / HAND_BONE_VB_W;

export const S4HandCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const growP = progress(f, 10, Math.max(22, frames - 24));

  const boneLabelX = S4_DIAG_X + HAND_BONE_LABEL_PT.x * S4_SCALE;
  const boneLabelY = S4_DIAG_Y + HAND_BONE_LABEL_PT.y * S4_SCALE;
  const palmLabelX = S4_DIAG_X + HAND_PALM_LABEL_PT.x * S4_SCALE;
  const palmLabelY = S4_DIAG_Y + HAND_PALM_LABEL_PT.y * S4_SCALE;

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <HandBoneCompare width={S4_DIAG_W} x={S4_DIAG_X} y={S4_DIAG_Y} growProgress={growP} />
      <Label x={boneLabelX} y={boneLabelY} text={t.s4BoneLabel} size={FS.small} align="center" />
      <Label x={palmLabelX} y={palmLabelY} text={t.s4PalmLabel} size={FS.small} align="center" />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 쥐·고래·사람·기린 - 공통 목뼈 개수 강조
 * ============================================================ */
/** 820 -> 1080: S3와 같은 이유로 아래로 내렸다(원칙 5 체크리스트, 99-build-report.md 참고). */
const S5_BASE_Y = 1080;
const S5_MOUSE_X = 180;
const S5_WHALE_X = 420;
const S5_HUMAN_X = 660;
const S5_GIRAFFE_X = 900;
const S5_MOUSE_W = 190;
const S5_WHALE_W = 230;
const S5_HUMAN_W = 170;
const S5_GIRAFFE_W = 170;
const S5_BADGE_Y = S5_BASE_Y + 44;
const S5_BADGE_W = 200;

function whAt(w: number, vbW: number, vbH: number) {
  return (w * vbH) / vbW;
}

export const S5Commonality: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const mouseH = whAt(S5_MOUSE_W, 320, 230);
  const whaleH = whAt(S5_WHALE_W, 400, 250);
  const giraffeH = whAt(S5_GIRAFFE_W, 620, 1000);

  const popMouse = progress(f, 4, 26);
  const popWhale = progress(f, 26, 48);
  const popHuman = progress(f, 48, 70);
  const popGiraffe = progress(f, 70, 92);

  const badgeMouse = progress(f, 20, 50);
  const badgeWhale = progress(f, 42, 72);
  const badgeHuman = progress(f, 64, 94);
  const badgeGiraffe = progress(f, 86, Math.max(87, frames - 20));

  const labelY = S5_BADGE_Y + NECK_BADGE_VB_H * (S5_BADGE_W / 360) + 14;

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PopIn cx={S5_MOUSE_X} cy={S5_BASE_Y - mouseH / 2} size={S5_MOUSE_W} height={mouseH} progress={popMouse}>
        <Mouse width={S5_MOUSE_W} />
      </PopIn>
      <PopIn cx={S5_WHALE_X} cy={S5_BASE_Y - whaleH / 2} size={S5_WHALE_W} height={whaleH} progress={popWhale}>
        <Whale width={S5_WHALE_W} />
      </PopIn>
      <PopIn cx={S5_HUMAN_X} cy={S5_BASE_Y - S5_HUMAN_W / 2} size={S5_HUMAN_W} progress={popHuman}>
        <MiniCharacter width={S5_HUMAN_W} pose={POSES.idle} />
      </PopIn>
      <PopIn cx={S5_GIRAFFE_X} cy={S5_BASE_Y - giraffeH / 2} size={S5_GIRAFFE_W} height={giraffeH} progress={popGiraffe}>
        <Giraffe width={S5_GIRAFFE_W} />
      </PopIn>

      <NeckCountBadge width={S5_BADGE_W} x={S5_MOUSE_X - S5_BADGE_W / 2} y={S5_BADGE_Y} revealProgress={badgeMouse} />
      <NeckCountBadge width={S5_BADGE_W} x={S5_WHALE_X - S5_BADGE_W / 2} y={S5_BADGE_Y} revealProgress={badgeWhale} />
      <NeckCountBadge width={S5_BADGE_W} x={S5_HUMAN_X - S5_BADGE_W / 2} y={S5_BADGE_Y} revealProgress={badgeHuman} />
      <NeckCountBadge width={S5_BADGE_W} x={S5_GIRAFFE_X - S5_BADGE_W / 2} y={S5_BADGE_Y} revealProgress={badgeGiraffe} />

      <Label x={S5_MOUSE_X} y={labelY} text={t.s5MouseLabel} size={FS.small} />
      <Label x={S5_WHALE_X} y={labelY} text={t.s5WhaleLabel} size={FS.small} />
      <Label x={S5_HUMAN_X} y={labelY} text={t.s5HumanLabel} size={FS.small} />
      <Label x={S5_GIRAFFE_X} y={labelY} text={t.s5GiraffeLabel} size={FS.small} />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 나무늘보 / 매너티 - 예외 동물
 * ============================================================ */
/** 980 -> 1150 (그리고 "예외인 동물도 있어요" 제목도 410 -> 520): S3와 같은 이유로 아래로
 *  내렸다(원칙 5 체크리스트, 99-build-report.md 참고). */
const S6_BASE_Y = 1150;
const S6_SLOTH_X = 340;
const S6_MANATEE_X = 740;
const S6_SLOTH_W = 440;
const S6_MANATEE_W = 460;

export const S6Exception: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const slothH = whAt(S6_SLOTH_W, 400, 360);
  const manateeH = whAt(S6_MANATEE_W, 520, 280);

  const popSloth = progress(f, 4, 30);
  const popManatee = progress(f, 24, 50);
  const labelA = progress(f, 4, 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PopIn cx={S6_SLOTH_X} cy={S6_BASE_Y - slothH / 2} size={S6_SLOTH_W} height={slothH} progress={popSloth}>
        <Sloth width={S6_SLOTH_W} />
      </PopIn>
      <PopIn cx={S6_MANATEE_X} cy={S6_BASE_Y - manateeH / 2} size={S6_MANATEE_W} height={manateeH} progress={popManatee}>
        <Manatee width={S6_MANATEE_W} />
      </PopIn>

      <Label
        x={CX} y={520} text={t.s6ExceptionLabel} size={FS.label} align="center"
        style={{ opacity: labelA }}
      />
      <Label x={S6_SLOTH_X} y={S6_BASE_Y + 20} text={t.s6SlothLabel} size={FS.small} />
      <Label x={S6_MANATEE_X} y={S6_BASE_Y + 20} text={t.s6ManateeLabel} size={FS.small} />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 기린 전신 마무리 컷
 * ============================================================ */
const S7_GIRAFFE_W = 760;
const S7_NECK_RING_SIZE = 620;

export const S7Wrap: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const ringP = progress(f, 6, 30);

  return (
    <>
      <SavannaBg sun />
      <PulseRing
        x={CX - S7_NECK_RING_SIZE / 2} y={330} size={S7_NECK_RING_SIZE} frame={f}
        progress={ringP} color={C.goldSoft} opacity={0.5}
      />
      <div style={giraffeStyle(CX, S7_GIRAFFE_W)}>
        <Giraffe width={S7_GIRAFFE_W} />
      </div>
      <Caption line={line} t={f / FPS} />
    </>
  );
};
