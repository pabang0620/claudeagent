/** 이 화(general-ep79, "압력밥솥이 밥을 빨리 익히는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(일반 냄비 vs 압력밥솥 조리시간 CompareBars) -> s2(PressureBoilingDiagram graph -
 *  낮은/높은 압력 지점 정적 비교) -> s3(같은 graph - 압력 화살표+이동점 애니메이션) ->
 *  s4(cooker - 뚜껑 밀폐+압력 게이지) -> s5(cooker 이어서 - 온도계 100도 초과+쌀알 익음) ->
 *  s6(altitude - 높은 산 저기압 대조) -> s7(bowl - 완성된 밥 클로즈업).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 밀폐된 용기 안 압력이 높아지는 것과 끓는점이 함께 올라가는 대비가 중심 - s2/s3 그래프와
 *     s4/s5 압력 게이지+온도계가 이 대비를 담당한다.
 *   - 수증기·기포는 큰 기포 몇 개로만(PressureBoilingDiagram 내부 원칙).
 *   - s6(높은 산)은 s2~s5와 반대 방향(압력↓ -> 끓는점↓)이라는 것을 저기압 게이지가 반대쪽으로
 *     기울고 온도계가 100도 아래에 머무는 것으로 명확히 대비시켰다 - 스틸 선점검에서 방향이
 *     실제로 반대인지 직접 확인했다(99-build-report.md 참고, 55화 밀물/썰물 뒤바뀜 재발 방지).
 *   - 밥솥·냄비는 단순한 형태로 그린다.
 *
 *  새 REGISTRY 자산은 PressureBoilingDiagram(props/) 하나뿐이다(mode 4종으로 s2~s7을 커버).
 *  s1의 냄비/압력밥솥 아이콘은 이 화 전용 비교 연출이라 지역성 우선 원칙(coding-style.md)에
 *  따라 여기 로컬로 뒀다 - 다른 화에서 재사용될 만큼 일반화되지 않았다(CompareBars 위에
 *  얹는 장식 아이콘일 뿐).
 */
import React from 'react';
import {
  C, Caption, CompareBars, FPS, FS, Label, PB_AXIS_BOIL_PT, PB_AXIS_PRESSURE_PT, PB_HIGH_PT,
  PB_LOW_PT, PB_THERMO_PT, PRESSURE_VB_W, PlainBg, PressureBoilingDiagram, SW, SW_THIN, W, progress,
} from '../../../assets';
import type { BarItem, CaptionLine } from '../../../assets';
import { CountUp } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 일반 냄비 vs 압력밥솥 조리시간 비교 (CompareBars)
 * ============================================================ */
const ICON_W = 200;
const ICON_H = 170;

const PotIcon: React.FC<{ x: number; y: number; lidded: boolean; opacity: number }> = ({ x, y, lidded, opacity }) => (
  <svg
    width={ICON_W} height={ICON_H + 40} viewBox={`0 0 ${ICON_W} ${ICON_H + 40}`}
    style={{ position: 'absolute', left: x, top: y, opacity, overflow: 'visible' }}
  >
    <path
      d={`M ${ICON_W * 0.12} 40 L ${ICON_W * 0.06} ${ICON_H + 30} Q ${ICON_W * 0.06} ${ICON_H + 40} ${ICON_W * 0.16} ${ICON_H + 40} L ${ICON_W * 0.84} ${ICON_H + 40} Q ${ICON_W * 0.94} ${ICON_H + 40} ${ICON_W * 0.94} ${ICON_H + 30} L ${ICON_W * 0.88} 40 Z`}
      fill={C.paper} stroke={C.ink} strokeWidth={SW}
    />
    <rect x={-8} y={58} width={28} height={18} rx={9} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.7} />
    <rect x={ICON_W - 20} y={58} width={28} height={18} rx={9} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.7} />
    {lidded ? (
      <>
        <path d={`M ${ICON_W * 0.08} 40 Q ${ICON_W * 0.5} -8 ${ICON_W * 0.92} 40 Z`} fill={C.room} stroke={C.ink} strokeWidth={SW} />
        <circle cx={ICON_W * 0.5} cy={-10} r={13} fill={C.coral} stroke={C.ink} strokeWidth={SW_THIN * 0.6} />
      </>
    ) : (
      <rect x={ICON_W * 0.06} y={24} width={ICON_W * 0.88} height={18} rx={9} fill={C.room} stroke={C.ink} strokeWidth={SW_THIN * 0.8} />
    )}
  </svg>
);

const S1_ICON_Y = 340;
const S1_LEFT_CX = CX - 260;
const S1_RIGHT_CX = CX + 260;

export const S1Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const iconA = progress(f, 0, 20);
  const labelA = progress(f, 6, 26);

  const items: BarItem[] = [
    { label: t.s1CookerLabel, value: 15, color: C.coral, at: 10, valueText: t.s1CookerTime },
    { label: t.s1PotLabel, value: 40, color: C.inkSoft, at: Math.round(frames * 0.34), valueText: t.s1PotTime },
  ];

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PotIcon x={S1_LEFT_CX - ICON_W / 2} y={S1_ICON_Y} lidded opacity={iconA} />
      <Label x={S1_LEFT_CX} y={S1_ICON_Y + ICON_H + 60} text={t.s1CookerLabel} size={FS.small} color={C.ink} style={{ opacity: labelA }} />
      <PotIcon x={S1_RIGHT_CX - ICON_W / 2} y={S1_ICON_Y} lidded={false} opacity={iconA} />
      <Label x={S1_RIGHT_CX} y={S1_ICON_Y + ICON_H + 60} text={t.s1PotLabel} size={FS.small} color={C.ink} style={{ opacity: labelA }} />

      <CompareBars
        items={items} x={140} y={800} pxPerUnit={13} rowGap={230} labelGap={60} frame={f}
        stroke={C.ink} labelColor={C.ink} labelSize={FS.small} minLength={30}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2/S3: 압력 vs 끓는점 그래프 (PressureBoilingDiagram mode='graph')
 * ============================================================ */
const DIAG_W = 620;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 440;
const DIAG_SCALE = DIAG_W / PRESSURE_VB_W;

function diagPt(pt: { x: number; y: number }) {
  return { x: DIAG_X + pt.x * DIAG_SCALE, y: DIAG_Y + pt.y * DIAG_SCALE };
}

const lowPt = diagPt(PB_LOW_PT);
const highPt = diagPt(PB_HIGH_PT);
const axisPressurePt = diagPt(PB_AXIS_PRESSURE_PT);
const axisBoilPt = diagPt(PB_AXIS_BOIL_PT);

export const S2Graph: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const axisA = progress(f, 6, frames * 0.55);
  const markA = progress(f, frames * 0.42, frames * 0.88);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PressureBoilingDiagram mode="graph" width={DIAG_W} x={DIAG_X} y={DIAG_Y} axisProgress={axisA} markersProgress={markA} />
      <Label x={axisPressurePt.x} y={axisPressurePt.y + 6} text={t.s2AxisPressure} size={FS.small} color={C.ink} align="left" style={{ opacity: axisA }} />
      <Label x={axisBoilPt.x + 6} y={axisBoilPt.y - 58} text={t.s2AxisBoil} size={FS.small} color={C.ink} align="left" style={{ opacity: axisA }} />
      <Label x={lowPt.x} y={lowPt.y + 46} text={t.s2LowLabel} size={FS.small} color={C.waterCool} style={{ opacity: markA }} />
      <Label x={highPt.x} y={highPt.y - 66} text={t.s2HighLabel} size={FS.small} color={C.coral} style={{ opacity: markA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S3Rise: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const presA = progress(f, 10, frames * 0.85);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PressureBoilingDiagram
        mode="graph" width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f}
        axisProgress={1} markersProgress={1} pressureProgress={presA}
      />
      <Label x={axisPressurePt.x} y={axisPressurePt.y + 6} text={t.s2AxisPressure} size={FS.small} color={C.ink} align="left" />
      <Label x={axisBoilPt.x + 6} y={axisBoilPt.y - 58} text={t.s2AxisBoil} size={FS.small} color={C.ink} align="left" />
      <Label x={lowPt.x} y={lowPt.y + 46} text={t.s2LowLabel} size={FS.small} color={C.waterCool} />
      <Label x={highPt.x} y={highPt.y - 66} text={t.s2HighLabel} size={FS.small} color={C.coral} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 압력밥솥 단면 - 뚜껑 밀폐 + 압력 게이지 상승
 * ============================================================ */
export const S4Seal: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const sealA = progress(f, 8, frames * 0.85);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PressureBoilingDiagram mode="cooker" width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} revealProgress={1} sealProgress={sealA} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 온도계 100도 초과 + 쌀알이 빠르게 익음
 * ============================================================ */
const thermoTopPt = diagPt(PB_THERMO_PT);

export const S5Overboil: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const overA = progress(f, 10, frames * 0.8);
  const numA = progress(f, 10, 22);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PressureBoilingDiagram mode="cooker" width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} revealProgress={1} sealProgress={1} overboilProgress={overA} />
      <CountUp
        x={thermoTopPt.x} y={thermoTopPt.y - 90} to={118} from={100} at={10} duration={Math.round(frames * 0.7)} frame={f}
        size={FS.label} color={C.coral} suffix={t.s5TempSuffix} width={280} align="center"
        style={{ opacity: numA, whiteSpace: 'nowrap' }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 높은 산 대조 - 저기압 + 물이 100도 아래에서 끓음 + 설익은 밥
 * ============================================================ */
export const S6Altitude: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const altA = progress(f, 10, frames * 0.85);

  return (
    <PlainBg top={C.sky} bottom={C.hillFar} ground={null}>
      <PressureBoilingDiagram mode="altitude" width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} altitudeProgress={altA} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 완성된 윤기 나는 밥 클로즈업
 * ============================================================ */
export const S7Bowl: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const bowlA = progress(f, 10, frames * 0.8);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PressureBoilingDiagram mode="bowl" width={DIAG_W + 60} x={CX - (DIAG_W + 60) / 2} y={DIAG_Y - 40} f={f} bowlProgress={bowlA} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
