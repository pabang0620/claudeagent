/** 이 화(general-ep74, "사막이 낮엔 뜨겁고 밤엔 추운 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(사막 낮 vs 밤 좌우 스플릿 훅샷, 무성 - 실제로는 내레이션이 있지만 캐릭터 대사가
 *  아니라 3인칭 훅이라 립싱크는 쓰지 않는다) -> s2(HeatBlanketDiagram blanketProgress -
 *  수증기가 담요처럼 열을 붙잡음) -> s3(같은 다이어그램 dryProgress - 사막은 그 수증기가
 *  거의 없음) -> s4(dryProgress=1 유지 + dayHeatIn - 태양열이 그대로 꽂힘 + 온도 급상승
 *  CountUp) -> s5(dryProgress=1 유지 + nightHeatOut, night=true - 열이 그대로 빠져나감
 *  + 온도 급하강 CountUp) -> s6(ThermoScale로 낮 43도 vs 밤 -2도 비교) -> s7(사막 vs
 *  습한 지역 다이어그램 대비 + CompareBars로 일교차 크기 비교).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 낮/밤 대비는 화살표 방향(HeatBlanketDiagram의 dayHeatIn=아래로 꽂힘 /
 *     nightHeatOut=위로 빠져나감)으로 표현한다. 스틸 선점검에서 s4(꽂힘, 아래 방향)와
 *     s5(빠져나감, 위 방향) 화살표 방향이 실제로 반대인지 나란히 확인했다(99-build-report
 *     참고) - 55화 밀물/썰물 사고처럼 방향이 뒤집히면 정지 프레임만으로는 못 잡는다.
 *   - 습한 vs 건조 대비는 HeatBlanketDiagram의 수증기 band를 FogLayerDiagram과 동일한
 *     "뿌연 면 + 큰 물결선 2~3가닥" 레시피로 그리고(점을 뿌리지 않는다), 사막 쪽은 같은
 *     자리를 점선 윤곽선만으로 비워 대비시킨다(HeatBlanketDiagram.dryProgress).
 *   - 낮/밤 온도는 온도계(ThermoScale, s6)와 색(coral=따뜻함/waterCool=차가움, s4/s5
 *     CountUp·땅 색)로 표현한다.
 *   - 사막 풍경(s1)은 DesertBg의 단순한 모래언덕 실루엣 + 해/별로 충분하다.
 *
 *  s4의 "dryProgress={1}" 은 s3에서 이미 지나간 건조 상태를 이 장면에서도 명시적으로
 *  유지시키는 것이다(23화 이후 반복 원칙 - 여러 progress를 가진 다이어그램은 새 장면에서
 *  이전 상태를 다시 명시해야 한다. 장면마다 별도 컴포넌트 인스턴스라 자동으로 이어지지
 *  않는다). s5도 동일하게 dryProgress={1}을 유지한다.
 *
 *  어느 장면도 캐릭터가 등장하지 않는 3인칭 설명 내레이션이라(대본 자산 목록에도 캐릭터
 *  재사용이 없다) mouth.json 립싱크를 쓰지 않는다(ep63·ep66 s2~s7·ep72와 동일 원칙 -
 *  ko_mouth.json은 파이프라인 표준 절차로 만들었지만 이 화 어디서도 import하지 않는다).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  C, Caption, CompareBars, CountUp, DesertBg, FPS, HEAT_VB_H, HEAT_VB_W, HeatBlanketDiagram,
  Label, PlainBg, ThermoScale, W,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2; // 540
const STR = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* 공통 다이어그램 박스(s2~s5). ep66 FogLayerDiagram과 동일한 사이징 원칙(폭 820을
 * viewBox 비율로 스케일). HEAT_VB_H/HEAT_VB_W = 700/900 이라 FogLayerDiagram(620/900)
 * 보다 세로로 조금 더 길다. */
const DIAG_W = 920;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 460;
const DIAG_H = DIAG_W * (HEAT_VB_H / HEAT_VB_W);
const LABEL_Y = DIAG_Y - 60;

/* ============================================================
 * S1: 사막 낮 vs 밤 좌우 스플릿 훅샷
 * ============================================================ */
export const S1Hook: React.FC<SceneProps> = ({ f, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dayA = clamp01((f - 6) / 22);
  const nightA = clamp01((f - 6) / 22);

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(0 50% 0 0)' }}>
        <DesertBg night={false} frame={f} />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(0 0 0 50%)' }}>
        <DesertBg night frame={f} />
      </div>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={CX} y1={0} x2={CX} y2={1920} stroke={C.ink} strokeWidth={8} opacity={0.35} />
      </svg>
      <Label x={CX - 260} y={220} text={STR.dayLabel} size={72} color={C.coral} style={{ opacity: dayA }} />
      <Label x={CX + 260} y={220} text={STR.nightLabel} size={72} color={C.cream} style={{ opacity: nightA }} />
      <Caption line={line} t={f / FPS} />
    </AbsoluteFill>
  );
};

/* ============================================================
 * S2: 수증기·구름이 담요처럼 열을 붙잡음
 * ============================================================ */
export const S2Blanket: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 16) / 24);
  const blanketA = clamp01((f - 6) / (frames * 0.75));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HeatBlanketDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} blanketProgress={blanketA} />
      <Label x={CX} y={LABEL_Y} text={STR.holdHeatLabel} size={50} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 사막은 이 수증기가 거의 없다
 * ============================================================ */
export const S3Dry: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const dryA = clamp01((f - 10) / (frames * 0.8));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HeatBlanketDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} dryProgress={dryA} />
      <Label x={CX} y={LABEL_Y} text={STR.littleVaporLabel} size={46} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 낮 - 태양열이 그대로 꽂힘, 온도 급상승
 * ============================================================ */
const TEMP_Y = DIAG_Y + DIAG_H + 60;

export const S4HeatIn: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const inA = clamp01((f - 12) / (frames * 0.8));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HeatBlanketDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} night={false} dryProgress={1} dayHeatIn={inA}
      />
      <Label x={CX} y={LABEL_Y} text={STR.heatInLabel} size={44} color={C.ink} style={{ opacity: labelA }} />
      <CountUp
        x={CX - 150} y={TEMP_Y} to={43} from={25} at={16} duration={Math.round(frames * 0.55)} frame={f}
        size={110} color={C.coral} digits={0} suffix="°C" width={300} align="center"
        style={{ whiteSpace: 'nowrap' }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 밤 - 열이 그대로 빠져나감, 온도 급하강
 * ============================================================ */
export const S5HeatOut: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const outA = clamp01((f - 14) / (frames * 0.75));

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <HeatBlanketDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} night dryProgress={1} nightHeatOut={outA}
      />
      <Label x={CX} y={LABEL_Y} text={STR.heatOutLabel} size={44} color={C.cream} style={{ opacity: labelA }} />
      <CountUp
        x={CX - 150} y={TEMP_Y} to={-2} from={25} at={18} duration={Math.round(frames * 0.55)} frame={f}
        size={110} color={C.waterCool} digits={0} suffix="°C" width={300} align="center"
        style={{ whiteSpace: 'nowrap' }}
      />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 온도계 - 낮 43도 vs 밤 -2도 비교
 * ============================================================ */
const S6_CX = CX;
const S6_TOP_Y = 420;
const S6_TRACK_H = 760;

export const S6Thermo: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const dayPointA = clamp01((f - 8) / 30);
  const nightPointA = clamp01((f - 46) / 30);
  const bracketA = clamp01((f - 84) / 30);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <ThermoScale
        cx={S6_CX} topY={S6_TOP_Y} trackHeight={S6_TRACK_H} tubeWidth={58}
        points={[
          { posT: 0.06, label: `${STR.nighttimeLabel} -2°C`, color: C.waterCool, progress: nightPointA },
          { posT: 0.94, label: `${STR.daytimeLabel} 43°C`, color: C.coral, progress: dayPointA },
        ]}
        closeBracket={{ aIndex: 0, bIndex: 1, label: STR.dailyRangeLabel, progress: bracketA, color: C.gold }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 사막 vs 습한 지역 - 일교차 크기 비교
 * ============================================================ */
const S7_DIAG_W = 460;
const S7_GAP = 40;
const S7_TOTAL_W = S7_DIAG_W * 2 + S7_GAP;
const S7_START_X = CX - S7_TOTAL_W / 2;
const S7_LEFT_X = S7_START_X;
const S7_RIGHT_X = S7_START_X + S7_DIAG_W + S7_GAP;
const S7_DIAG_Y = 300;
const S7_DIAG_H = S7_DIAG_W * (HEAT_VB_H / HEAT_VB_W);
const S7_PANEL_LABEL_Y = S7_DIAG_Y + S7_DIAG_H + 50;

const S7_BARS_X = CX - 220;
const S7_BARS_Y = S7_PANEL_LABEL_Y + 130;

export const S7Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const diagA = clamp01((f - 6) / 30);
  const barsA = clamp01((f - 60) / 20);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HeatBlanketDiagram width={S7_DIAG_W} x={S7_LEFT_X} y={S7_DIAG_Y} f={f} dryProgress={diagA} />
      <Label x={S7_LEFT_X + S7_DIAG_W / 2} y={S7_PANEL_LABEL_Y} text={STR.desertLabel} size={38} color={C.ink} style={{ opacity: diagA }} />

      <HeatBlanketDiagram width={S7_DIAG_W} x={S7_RIGHT_X} y={S7_DIAG_Y} f={f} blanketProgress={diagA} />
      <Label x={S7_RIGHT_X + S7_DIAG_W / 2} y={S7_PANEL_LABEL_Y} text={STR.humidLabel} size={38} color={C.ink} style={{ opacity: diagA }} />

      <Label x={CX} y={S7_BARS_Y - 60} text={STR.dailyRangeLabel} size={36} color={C.inkSoft} style={{ opacity: barsA }} />
      <div style={{ opacity: barsA }}>
        <CompareBars
          x={S7_BARS_X} y={S7_BARS_Y} pxPerUnit={13} frame={f} rowGap={140}
          items={[
            { label: STR.desertLabel, value: 45, color: C.coral, thickness: 50, at: 60, valueText: '45°C' },
            { label: STR.humidLabel, value: 8, color: C.waterCool, thickness: 50, at: 78, valueText: '8°C' },
          ]}
        />
      </div>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
