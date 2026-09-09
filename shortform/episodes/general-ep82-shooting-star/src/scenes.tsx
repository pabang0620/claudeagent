/** 이 화(general-ep82, "별똥별이 사실은 별이 아닌 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(밤하늘 풀샷, 별똥별 하나가 대각선으로 지나감 - MeteorEntryDiagram entryProgress) ->
 *  s2(우주를 떠도는 작은 돌조각 하나, 정적 등장 - MeteorRock) -> s3(돌조각·모래알·자갈을
 *  나란히 놓고 크기 대비) -> s4(돌조각이 대기에 진입, 속도 라벨 - entryProgress 0~0.55) ->
 *  s5(총알 vs 돌조각 속도 - CompareBars) -> s6(클로즈업 - 마찰로 타버리는 순간, entryProgress
 *  0.5~1) -> s7(다시 밤하늘 풀샷, 이미 환하게 빛나는 긴 빛줄기 - entryProgress 0.75~1로
 *  시작해 유지) -> s8(혜성 궤도 + 파편 트레일 - cometTrailProgress) -> s9(지구가 궤도를
 *  통과하며 여러 빛줄기가 동시에 나타나는 유성우 - showerProgress).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 작은 돌조각(실제 크기)과 화면에 보이는 밝고 긴 빛줄기의 크기 대비가 핵심 - s3(정지
 *     크기 비교)과 s6(클로즈업 소멸)에서 이 대비를 직접 보여준다.
 *   - 돌조각은 작은 도형 1개(MeteorRock)로 충분, 마찰은 굵은 빛줄기 하나로 표현.
 *   - 배경 별은 성기게(37화 원칙 계승) - NightSkyBg stars 를 낮게 유지.
 *   - 혜성 자취의 파편은 점 몇 개로 절제(DEBRIS_T 5개 고정, MeteorEntryDiagram 내부).
 *
 *  MeteorEntryDiagram 의 ENTRY_END 가 viewBox 정중앙이라 `x = screenCX - width/2`
 *  만으로 s4(넓은 구도)와 s6(클로즈업)이 같은 계산식을 공유한다(REGISTRY 설명 참고).
 */
import React from 'react';
import {
  C, Caption, CompareBars, FPS, FS, Label, MeteorEntryDiagram, MeteorRock, METEOR_COMET_LABEL_PT,
  METEOR_DEBRIS_LABEL_PT, METEOR_SHOWER_LABEL_PT, METEOR_VB_H, METEOR_VB_W, NightSkyBg, PopIn, W,
  progress, sway,
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

/* ============================================================
 * S1: 밤하늘 풀샷 - 별똥별 하나가 대각선으로 지나감
 * ============================================================ */
const S1_WIDTH = 1040;
const S1_X = CX - S1_WIDTH / 2;
const S1_Y = 520;

export const S1Hook: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const entryP = progress(f, 6, Math.max(20, frames - 12));

  return (
    <>
      <NightSkyBg stars={24} seed={4} frame={f} moon={0.55} horizon={1560} />
      <MeteorEntryDiagram width={S1_WIDTH} x={S1_X} y={S1_Y} entryProgress={entryP} />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S2: 무성 아님 - 우주를 떠도는 작은 돌조각 하나
 * ============================================================ */
const S2_ROCK_SIZE = 200;
const S2_ROCK_Y = 880;

export const S2Drift: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const popP = progress(f, 4, 26);
  const rotate = sway(f, 10, 4.5);

  return (
    <>
      <NightSkyBg stars={18} seed={8} frame={f} moon={null} horizon={null} />
      <PopIn cx={CX} cy={S2_ROCK_Y} size={S2_ROCK_SIZE} progress={popP}>
        <div style={{ transform: `rotate(${rotate}deg)`, width: '100%', height: '100%' }}>
          <MeteorRock size={S2_ROCK_SIZE} color={C.nightSoft} />
        </div>
      </PopIn>
      <Label x={CX} y={S2_ROCK_Y - S2_ROCK_SIZE / 2 - 70} text={t.s2RockLabel} size={FS.label} color={C.cream} style={{ opacity: popP }} />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S3: 돌조각 · 모래알 · 자갈을 나란히 놓고 크기 대비
 * ============================================================ */
const S3_ROW_Y = 900;
const S3_SAND_X = CX - 280;
const S3_GRAVEL_X = CX;
const S3_ROCK_X = CX + 280;
const S3_SAND_SIZE = 26;
const S3_GRAVEL_SIZE = 78;
const S3_ROCK_SIZE = 150;

export const S3SizeCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const popSand = progress(f, 4, 24);
  const popGravel = progress(f, 18, 40);
  const popRock = progress(f, 32, 56);
  const labelY = S3_ROW_Y + S3_ROCK_SIZE / 2 + 56;

  return (
    <>
      <NightSkyBg stars={14} seed={12} frame={f} moon={null} horizon={null} />
      <PopIn cx={S3_SAND_X} cy={S3_ROW_Y} size={S3_SAND_SIZE} progress={popSand}>
        <MeteorRock size={S3_SAND_SIZE} color={C.nightSoft} />
      </PopIn>
      <PopIn cx={S3_GRAVEL_X} cy={S3_ROW_Y} size={S3_GRAVEL_SIZE} progress={popGravel}>
        <MeteorRock size={S3_GRAVEL_SIZE} color={C.nightSoft} />
      </PopIn>
      <PopIn cx={S3_ROCK_X} cy={S3_ROW_Y} size={S3_ROCK_SIZE} progress={popRock}>
        <MeteorRock size={S3_ROCK_SIZE} color={C.nightSoft} />
      </PopIn>

      <Label x={S3_SAND_X} y={labelY} text={t.s3SandLabel} size={FS.small} color={C.cream} style={{ opacity: popSand }} />
      <Label x={S3_GRAVEL_X} y={labelY} text={t.s3GravelLabel} size={FS.small} color={C.cream} style={{ opacity: popGravel }} />
      <Label x={S3_ROCK_X} y={labelY} text={t.s3RockLabel} size={FS.small} color={C.cream} style={{ opacity: popRock }} />

      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S4: 돌조각이 대기에 진입 - 속도 라벨
 * ============================================================ */
const S4_WIDTH = 780;
const S4_X = CX - S4_WIDTH / 2;
const S4_Y = 560;

export const S4Entry: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const localP = progress(f, 8, Math.max(20, frames - 10));
  const entryP = 0.55 * localP;
  const labelA = progress(f, 20, 44);

  return (
    <>
      <NightSkyBg stars={12} seed={16} frame={f} moon={null} horizon={null} />
      <MeteorEntryDiagram width={S4_WIDTH} x={S4_X} y={S4_Y} entryProgress={entryP} />
      <Label
        x={CX} y={340} text={t.s4SpeedLabel} size={FS.label} color={C.cream} align="center"
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S5: 총알 vs 돌조각 속도 비교
 * ============================================================ */
const S5_X = 150;
const S5_Y = 780;
const S5_PX_PER_UNIT = 7.2;

export const S5SpeedCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);

  return (
    <>
      <NightSkyBg stars={10} seed={20} frame={f} moon={null} horizon={null} />
      <CompareBars
        x={S5_X} y={S5_Y} pxPerUnit={S5_PX_PER_UNIT} frame={f}
        stroke={C.cream} labelColor={C.cream}
        items={[
          { label: t.s5BulletLabel, value: 4, color: C.coral, at: 4 },
          { label: t.s5RockLabel, value: 88, color: C.gold, valueText: t.s5RockValueText, at: 18 },
        ]}
      />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S6: 클로즈업 - 마찰로 뜨거워지며 타버리는 순간
 * ============================================================ */
const S6_WIDTH = 2000;
const S6_HEIGHT = (S6_WIDTH * METEOR_VB_H) / METEOR_VB_W;
const S6_X = CX - S6_WIDTH / 2;
const S6_Y = 960 - S6_HEIGHT / 2;

export const S6Burn: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const localP = progress(f, 6, Math.max(18, frames - 10));
  const entryP = 0.5 + 0.5 * localP;

  return (
    <>
      <NightSkyBg stars={8} seed={24} frame={f} moon={null} horizon={null} />
      <MeteorEntryDiagram width={S6_WIDTH} x={S6_X} y={S6_Y} entryProgress={entryP} />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S7: 다시 밤하늘 풀샷 - 이미 환하게 빛나는 긴 빛줄기
 * ============================================================ */
export const S7Wrap: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const localP = progress(f, 4, Math.max(14, frames - 30));
  const entryP = 0.72 + 0.28 * localP;

  return (
    <>
      <NightSkyBg stars={24} seed={28} frame={f} moon={0.55} horizon={1560} />
      <div style={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}>
        <MeteorEntryDiagram width={S1_WIDTH} x={S1_X} y={S1_Y} entryProgress={entryP} />
      </div>
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S8: 혜성 궤도 + 파편 트레일
 * ============================================================ */
const S8_WIDTH = 980;
const S8_X = CX - S8_WIDTH / 2;
const S8_Y = 560;
const S8_SCALE = S8_WIDTH / METEOR_VB_W;

export const S8Comet: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const cometP = progress(f, 8, Math.max(20, frames - 12));
  const cometLabelA = progress(f, 10, 30);
  const debrisLabelA = progress(f, 46, 66);

  const cometLabelX = S8_X + METEOR_COMET_LABEL_PT.x * S8_SCALE;
  const cometLabelY = S8_Y + METEOR_COMET_LABEL_PT.y * S8_SCALE;
  const debrisLabelX = S8_X + METEOR_DEBRIS_LABEL_PT.x * S8_SCALE;
  const debrisLabelY = S8_Y + METEOR_DEBRIS_LABEL_PT.y * S8_SCALE;

  return (
    <>
      <NightSkyBg stars={16} seed={32} frame={f} moon={null} horizon={null} />
      <MeteorEntryDiagram width={S8_WIDTH} x={S8_X} y={S8_Y} cometTrailProgress={cometP} />
      <Label x={cometLabelX} y={cometLabelY} text={t.s8CometLabel} size={FS.small} color={C.cream} style={{ opacity: cometLabelA }} />
      <Label x={debrisLabelX} y={debrisLabelY} text={t.s8DebrisLabel} size={FS.small} color={C.cream} style={{ opacity: debrisLabelA }} />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S9: 지구가 궤도를 통과하며 나타나는 유성우
 * ============================================================ */
const S9_SCALE = S8_WIDTH / METEOR_VB_W;

export const S9Shower: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const showerP = progress(f, 6, Math.max(20, frames - 10));
  const labelA = progress(f, 60, 84);

  const labelX = S8_X + METEOR_SHOWER_LABEL_PT.x * S9_SCALE;
  const labelY = S8_Y + METEOR_SHOWER_LABEL_PT.y * S9_SCALE;

  return (
    <>
      <NightSkyBg stars={16} seed={36} frame={f} moon={null} horizon={null} />
      <MeteorEntryDiagram width={S8_WIDTH} x={S8_X} y={S8_Y} showerProgress={showerP} />
      <Label x={labelX} y={labelY} text={t.s9ShowerLabel} size={FS.label} color={C.cream} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};
