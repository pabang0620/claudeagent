/** 이 화(general-ep60, "개미들이 한 줄로 줄지어 다니는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(개미들이 한 줄로 걷는 모습, 위에서 내려다본 시점 - "약속처럼" 줄지어 다니는 광경만
 *  먼저 보여준다) -> s2(개미 한 마리가 걸으며 바닥에 페로몬 자국을 옅게 남김, "페로몬" 라벨)
 *  -> s3(먹이에서 돌아오는 개미가 같은 길에 훨씬 진한 자국을 남김) -> s4(다른 개미가 더듬이로
 *  그 자국을 감지하며 그대로 따라감, 감지 순간 sniff_snort) -> s5(왼쪽/가운데/오른쪽 세 길의
 *  냄새 농도를 막대로 비교 - 가운데 길이 가장 진해짐) -> s6(안 쓰는 왼쪽 길의 자국이 옅어지다
 *  사라짐, 가운데 길은 그대로) -> s7(세 길을 다시 보여주며 가운데 길만 최대로 진해지고 나머지
 *  둘은 사라지는 최종 정리) -> s8(s1과 같은 구도로 개미들이 다시 한 줄로 걷되, 이번엔 발밑에
 *  진한 페로몬 자국이 함께 보인다 - "그래서 줄 맞춰 걷는 것처럼 보인다").
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 개미를 작은 점 여러 개로 뿌리지 않는다. 단순한 도형 몇 마리(Ant, 최대 4마리)로만 그린다.
 *   - 페로몬 자국은 호(arc)로 뿌리지 않고 "바닥에 남는 자국"(굵기·불투명도·점선 밀도로
 *     진하기를 나타내는 선)으로 표현한다(PheromoneTrailDiagram).
 *   - 여러 갈래 길은 2~3개로 단순화한다(왼쪽/가운데/오른쪽 프리셋 3개, 복잡한 미로 없음).
 *   - 시간에 따라 진해지는 장면(s2·s3·s7의 승자 경로)과 옅어지는 장면(s6·s7의 패자 경로)의
 *     방향을 시작/끝 프레임으로 각각 확인했다(55화 사고 재발 방지). 아래 각 씬 주석에
 *     시작값 -> 끝값을 명시해뒀다.
 *
 *  s2~s7 어디도 캐릭터가 직접 말하는 순간이 아니라(전부 3인칭 설명 내레이션) mouth.json
 *  립싱크를 쓰지 않는다(ep19/ep21/ep23/ep25와 동일 원칙 - ko_mouth.json은 파이프라인 표준
 *  절차로 만들었지만 이 화 어디서도 import하지 않는다).
 */
import React from 'react';
import {
  Ant, C, Caption, CompareBars, FPS, Label, PheromoneTrailDiagram, PlainBg, PulseRing, W,
  pheromonePointAt, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const STR = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const mod1 = (v: number) => v - Math.floor(v);

/* ============================================================
 * 공용: 화면 전체를 가로지르는 "행진 경로"(s1·s8 전용, 대구 구도).
 * PheromoneTrailDiagram은 둥지<->먹이 소형 다이어그램(s2~s7)용이라, 화면 전체를 쓰는 이
 * 광각 구도는 별도의 로컬 베지어로 둔다(GutTubeDiagram·NerveSignal 등도 파일마다 로컬
 * cubicPoint를 따로 두는 것과 같은 관례).
 * ============================================================ */

interface Pt { x: number; y: number }
const MARCH_P0: Pt = { x: 240, y: 600 };
const MARCH_C1: Pt = { x: 500, y: 480 };
const MARCH_C2: Pt = { x: 600, y: 1250 };
const MARCH_P3: Pt = { x: 840, y: 1500 };

function cubicPoint(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}
function cubicTangent(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  return {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}
const marchPoint = (t: number) => cubicPoint(t, MARCH_P0, MARCH_C1, MARCH_C2, MARCH_P3);
const marchAngle = (t: number) => {
  const d = cubicTangent(t, MARCH_P0, MARCH_C1, MARCH_C2, MARCH_P3);
  return (Math.atan2(d.y, d.x) * 180) / Math.PI;
};

const MARCH_COUNT = 4;
const MARCH_SPACING = 0.22;
const MARCH_SPEED = 0.0023;
const MARCH_ANT_WIDTH = 190;
const MARCH_BASE_T = 0.66;

/** i번째 개미의 t(0~1 경로 진행도). 프레임이 늘수록 앞으로 나아가고, 경로 끝을 넘으면
 *  mod1로 처음부터 다시 잇는다(안전장치 - 이 화 장면 길이 안에서는 실제로 넘지 않는다). */
function marchAntT(i: number, f: number) {
  return mod1(MARCH_BASE_T - i * MARCH_SPACING + f * MARCH_SPEED);
}

const MARCH_TRAIL_SEGMENTS = 40;
const MARCH_TRAIL_D = (() => {
  let d = '';
  for (let s = 0; s <= MARCH_TRAIL_SEGMENTS; s++) {
    const p = marchPoint(s / MARCH_TRAIL_SEGMENTS);
    d += `${s === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  return d;
})();

const MarchTrailLine: React.FC = () => (
  <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    <path
      d={MARCH_TRAIL_D} fill="none" stroke={C.coral} strokeWidth={22} strokeLinecap="round"
      strokeDasharray="16 5" opacity={0.85}
    />
  </svg>
);

/* ============================================================
 * S1: 개미들이 한 줄로 걷는다 (위에서 내려다본 시점, 자국은 아직 안 보임)
 * ============================================================ */

export const S1March: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      {Array.from({ length: MARCH_COUNT }).map((_, i) => {
        const tPos = marchAntT(i, f);
        const p = marchPoint(tPos);
        return <Ant key={i} f={f} width={MARCH_ANT_WIDTH} x={p.x} y={p.y} angle={marchAngle(tPos)} />;
      })}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 공용: 둥지<->먹이 소형 다이어그램 배치(s2~s7)
 * ============================================================ */

const DIAG_WIDTH = 600;
const DIAG_SCALE = DIAG_WIDTH / 700; // PHEROMONE_VB_W
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 420;
const diagPt = (vb: Pt): Pt => ({ x: DIAG_X + vb.x * DIAG_SCALE, y: DIAG_Y + vb.y * DIAG_SCALE });

/* ============================================================
 * S2: 개미가 걸으며 바닥에 페로몬 자국을 옅게 남긴다 (가운데 길, 시작 0 -> 끝 0.4 강도로 증가)
 * ============================================================ */

const S2_ANT_WIDTH = 120;

export const S2Trail: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const antT = progress(f, frames * 0.08, frames * 0.92) * 0.92;
  const pt = pheromonePointAt(1, antT);
  const antPos = diagPt(pt);
  const labelA = progress(f, frames * 0.3, frames * 0.5);
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <PheromoneTrailDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        paths={[{ strength: 0 }, { strength: 0.4, from: 0, to: antT }, { strength: 0 }]}
      />
      <Ant f={f} width={S2_ANT_WIDTH} x={antPos.x} y={antPos.y} angle={pt.angle} />
      <Label x={CX} y={DIAG_Y - 90} text={STR.pheromoneLabel} size={52} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 먹이에서 돌아오는 개미가 훨씬 진한 자국을 남긴다
 * (가운데 길, 마킹된 구간이 먹이 쪽 끝에서 시작해 둥지 쪽으로 자라난다 - 시작 거의 0 -> 끝 약 0.85)
 * ============================================================ */

const S3_ANT_WIDTH = 120;

export const S3Return: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const raw = progress(f, frames * 0.08, frames * 0.92);
  const antT = 1 - raw * 0.85; // 1(먹이) -> 0.15(둥지 근처)로 이동
  const pt = pheromonePointAt(1, antT);
  const antPos = diagPt(pt);
  const angle = pt.angle + 180; // 진행 방향(둥지 쪽)을 바라보도록 반대로
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <PheromoneTrailDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        paths={[{ strength: 0 }, { strength: 0.78, from: antT, to: 1 }, { strength: 0 }]}
      />
      <Ant f={f} width={S3_ANT_WIDTH} x={antPos.x} y={antPos.y} angle={angle} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 다른 개미가 더듬이로 그 자국을 감지하고 그대로 따라간다 (자국은 이미 완성된 상태로 고정)
 * ============================================================ */

const S4_ANT_WIDTH = 120;
export const S4_SNIFF_SFX_AT = 0.16; // Episode.tsx에서 sniff_snort 타이밍 계산에 재사용

export const S4Follow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const antT = progress(f, frames * 0.06, frames * 0.92) * 0.94;
  const pt = pheromonePointAt(1, antT);
  const antPos = diagPt(pt);
  const sensing = 0.65 + 0.35 * Math.max(0, Math.sin(f * 0.32));
  const aheadX = antPos.x + Math.cos(rad(pt.angle)) * 66;
  const aheadY = antPos.y + Math.sin(rad(pt.angle)) * 66;
  const ringSize = 96;
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <PheromoneTrailDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        paths={[{ strength: 0 }, { strength: 0.85, from: 0, to: 1 }, { strength: 0 }]}
      />
      <PulseRing
        x={aheadX - ringSize / 2} y={aheadY - ringSize / 2} size={ringSize}
        frame={f} progress={1} color={C.coralSoft} opacity={0.5} periodFrames={40}
      />
      <Ant f={f} width={S4_ANT_WIDTH} x={antPos.x} y={antPos.y} angle={pt.angle} sensing={sensing} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 왼쪽/가운데/오른쪽 세 길의 냄새 농도를 막대로 비교(가운데 길이 가장 진해짐)
 * ============================================================ */

const S5_BAR_X = 240;
const S5_BAR_Y = 560;

export const S5Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <CompareBars
        x={S5_BAR_X} y={S5_BAR_Y} pxPerUnit={5.6} frame={f} rowGap={220} labelGap={64} labelSize={44}
        items={[
          { label: STR.pathLeft, value: 38, color: C.coralSoft, at: 0 },
          { label: STR.pathCenter, value: 100, color: C.coral, at: 6 },
          { label: STR.pathRight, value: 32, color: C.coralSoft, at: 12 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 안 쓰는 왼쪽 길의 자국이 옅어지다 사라진다 (시작 0.5 -> 끝 0, 가운데 길은 0.55로 고정)
 * ============================================================ */

export const S6Fade: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const fadeT = progress(f, frames * 0.12, frames * 0.9);
  const loserStrength = 0.5 * (1 - fadeT);
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <PheromoneTrailDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        paths={[{ strength: loserStrength }, { strength: 0.55 }, { strength: 0 }]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 세 길을 다시 보여주며 가운데 길만 최대로 진해지고 나머지 둘은 사라진다
 * (승자: 시작 0.4 -> 끝 1.0 / 패자 둘: 시작 0.4 -> 끝 0)
 * ============================================================ */

export const S7Final: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const t2 = progress(f, frames * 0.08, frames * 0.92);
  const winnerStrength = 0.4 + 0.6 * t2;
  const loserStrength = 0.4 * (1 - t2);
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <PheromoneTrailDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        paths={[{ strength: loserStrength }, { strength: winnerStrength }, { strength: loserStrength }]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: s1과 같은 구도로 다시 한 줄 - 이번엔 발밑에 진한 페로몬 자국이 함께 보인다 (s1과 대구)
 * ============================================================ */

export const S8MarchWithTrail: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.leaf} bottom={C.leaf} ground={null}>
      <MarchTrailLine />
      {Array.from({ length: MARCH_COUNT }).map((_, i) => {
        const tPos = marchAntT(i, f);
        const p = marchPoint(tPos);
        return <Ant key={i} f={f} width={MARCH_ANT_WIDTH} x={p.x} y={p.y} angle={marchAngle(tPos)} />;
      })}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
