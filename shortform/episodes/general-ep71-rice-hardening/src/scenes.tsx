/** 이 화(general-ep71, "식은 밥이 딱딱해지는 이유") 전용 장면.
 *
 *  s1(갓 지은 밥그릇 클로즈업, 김+말랑한 질감) -> s2(StarchGranuleDiagram swellProgress:
 *  전분 알갱이가 물+열을 만나 부풂) -> s3(같은 다이어그램 retrogradeProgress: 식으며 다시
 *  뭉치고 물을 밀어냄) -> s4(밥알 질감이 말랑함->뻣뻣함으로 굳는 비교) -> s5(전자레인지로
 *  다시 데움, MicrowaveDiagram 재사용 + 부드러움 게이지가 절반만 참) -> s6(볶음밥 팬 -
 *  찬밥은 흩어지고 뜨거운 밥은 뭉침) -> s7(냉장실 vs 냉동실 굳는 속도 비교).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 부드러운 밥알과 딱딱해진 밥알의 단면 대비가
 *  중심 - 전분 재결합은 큰 도형(원) 몇 개가 서로 붙는 형태로 단순하게, 물이 빠지는 것은
 *  작은 점이 아니라 큰 물결선·화살표로. 밥은 먹음직스럽고 깔끔하게(작은 점 텍스처 금지 -
 *  builder "신체 표현은 최소한으로/작은 점 여러 개 금지" 원칙과 동일 정신을 음식에도 적용).
 *  시간이 지나며 굳는 방향성이 중요해 s1(가장 말랑)->s4(굳어감)->s5(절반만 회복)까지
 *  hardness 진행 방향이 거꾸로 가지 않는지 스틸 선점검에서 시작-끝 프레임을 나란히 확인한다.
 *
 *  새 REGISTRY 자산은 StarchGranuleDiagram(props/) 하나뿐이다(02-script-v1.md 자산 목록).
 *  밥그릇·밥알 뭉치(RiceMound/BowlRim)는 이 화 전용 소도구라 등록하지 않는다(ep69의
 *  ExamPaper와 동일 판단 - 다른 화 재사용 가능성보다 이 장면 전용 장식에 가깝다).
 */
import React from 'react';
import {
  C, Caption, CompareBars, FPS, FS, Label, MicrowaveDiagram, PlainBg, ScentWaves,
  StarchGranuleDiagram, SW, SW_THIN, ThemedIcon, W, breathe, clamp01, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpColor = (a: string, b: string, p: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255; const ag = (pa >> 8) & 255; const ab = pa & 255;
  const br = (pb >> 16) & 255; const bg = (pb >> 8) & 255; const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * p);
  const g = Math.round(ag + (bg - ag) * p);
  const bl = Math.round(ab + (bb - ab) * p);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * 이 화 전용 소도구: 밥그릇 테두리 + 밥알 뭉치(큰 도형 6개, 점 텍스처 없음)
 * ============================================================ */

function BowlRim({ cx, cy, w, stroke = C.ink }: { cx: number; cy: number; w: number; stroke?: string }) {
  const rx = w / 2;
  const ry = w * 0.16;
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.paper} stroke={stroke} strokeWidth={SW} />
      <ellipse cx={cx} cy={cy - ry * 0.25} rx={rx * 0.86} ry={ry * 0.7} fill={C.sky} opacity={0.5} />
    </>
  );
}

/** 밥알 뭉치를 이루는 큰 덩어리 6개의 상대 좌표(중심 기준). 개별 낱알을 촘촘히 찍지 않고
 *  큰 덩어리 몇 개로만 "밥알 뭉침"을 표현한다(builder 시각 주의사항). */
const GRAIN_OFFSETS = [
  { dx: -78, dy: 6, r: 58 },
  { dx: 0, dy: -48, r: 64 },
  { dx: 78, dy: 4, r: 60 },
  { dx: -46, dy: 66, r: 54 },
  { dx: 46, dy: 70, r: 54 },
  { dx: 0, dy: 108, r: 50 },
];

function RiceMound({
  cx, cy, scale = 1, hardness = 0, spread = 0, stroke = C.ink,
  softColor = C.goldSoft, hardColor = C.browningSoft,
}: {
  cx: number; cy: number; scale?: number; hardness?: number; spread?: number; stroke?: string;
  softColor?: string; hardColor?: string;
}) {
  const fill = lerpColor(softColor, hardColor, hardness);
  const sw = lerp(SW_THIN, SW, hardness);
  const spreadMul = 1 + spread * 1.7;
  return (
    <>
      {GRAIN_OFFSETS.map((gpt, i) => {
        const gx = cx + gpt.dx * spreadMul * scale;
        const gy = cy + gpt.dy * spreadMul * scale;
        const r = gpt.r * scale;
        return (
          <React.Fragment key={i}>
            <ellipse cx={gx} cy={gy} rx={r} ry={r * 0.86} fill={fill} stroke={stroke} strokeWidth={sw} />
            {hardness < 0.9 ? (
              <ellipse
                cx={gx - r * 0.28} cy={gy - r * 0.3} rx={r * 0.32} ry={r * 0.2}
                fill={C.paper} opacity={0.5 * (1 - hardness)}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ============================================================
 * S1: 갓 지은 밥그릇 클로즈업 - 김 + 말랑한 질감(살짝 숨쉬듯 움직임)
 * ============================================================ */

const BOWL_CX = CX;
const BOWL_MOUND_CY = 880;
const BOWL_RIM_CY = 1000;

export const S1Bowl: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const sec = f / FPS;
  const revealP = smooth(progress(f, 0, 20));
  const br = breathe(f, 1.8, 1.7);
  const steamP1 = (f % 90) / 90;
  const steamP2 = ((f + 45) % 90) / 90;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <BowlRim cx={BOWL_CX} cy={BOWL_RIM_CY} w={700} />
        <g
          opacity={revealP}
          transform={`translate(${BOWL_CX} ${BOWL_MOUND_CY}) scale(${br.scale}) translate(${-BOWL_CX} ${-BOWL_MOUND_CY + br.dy})`}
        >
          <RiceMound cx={BOWL_CX} cy={BOWL_MOUND_CY} scale={1.35} hardness={0} />
        </g>
      </svg>
      <ScentWaves cx={BOWL_CX - 60} cy={BOWL_MOUND_CY - 260} angle={-90} count={3} spread={210} progress={steamP1} fanDeg={24} color={C.inkSoft} />
      <ScentWaves cx={BOWL_CX + 100} cy={BOWL_MOUND_CY - 230} angle={-90} count={3} spread={180} progress={steamP2} fanDeg={22} color={C.inkSoft} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 전분 알갱이가 물+열을 만나 부푼다 (StarchGranuleDiagram)
 * ============================================================ */

const DIAG_W = 640;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 420;

export const S2Swell: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const swellP = smooth(progress(f, 6, frames * 0.9));
  const labelP = progress(f, 6, 26);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={300} text={t.s2Label} size={FS.label} color={C.ink} style={{ opacity: smooth(labelP) }} />
      <StarchGranuleDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} swellProgress={swellP} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 식으며 다시 뭉치고 물을 밀어낸다 (같은 다이어그램, retrogradeProgress)
 * ============================================================ */

export const S3Retrograde: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const retroP = smooth(progress(f, 6, frames * 0.92));
  const labelP = progress(f, 6, 26);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={300} text={t.s3Label} size={FS.label} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <StarchGranuleDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} swellProgress={1} retrogradeProgress={retroP} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 밥알 질감 - 말랑함(soft) -> 뻣뻣함(hard) 비교
 * ============================================================ */

export const S4Texture: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const hardP = smooth(progress(f, 6, frames - 10));
  const softLabelP = clamp01(1 - hardP * 1.4);
  const hardLabelP = clamp01((hardP - 0.35) / 0.65);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <BowlRim cx={CX} cy={1000} w={640} />
        <RiceMound cx={CX} cy={860} scale={1.3} hardness={hardP} />
      </svg>
      <Label x={CX - 250} y={400} text={t.s4LabelSoft} size={FS.label} color={C.ink} style={{ opacity: softLabelP }} />
      <Label x={CX + 250} y={400} text={t.s4LabelHard} size={FS.label} color={C.browning} style={{ opacity: hardLabelP }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 전자레인지로 다시 데움 - 절반만 부드러워짐
 * ============================================================ */

export const S5Reheat: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const waveP = smooth(progress(f, 6, frames * 0.6));
  const softenP = clamp01(progress(f, frames * 0.15, frames * 0.78));
  const hardness = 1 - softenP * 0.5;
  const labelP = progress(f, 6, 26);
  const gaugeAt = Math.round(frames * 0.32);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={300} text={t.s5Label} size={FS.label} color={C.ink} style={{ opacity: smooth(labelP) }} />
      <MicrowaveDiagram f={f} width={480} x={CX - 240} y={370} waveT={waveP} moleculeFlipT={waveP} />
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <RiceMound cx={CX} cy={1060} scale={0.72} hardness={hardness} />
      </svg>
      <CompareBars
        items={[{ label: t.s5Gauge, value: 0.5, color: C.gold, at: gaugeAt }]}
        x={CX - 210} y={1260} pxPerUnit={420} frame={f} labelSize={44}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 볶음밥 팬 - 찬밥은 흩어지고 뜨거운 밥은 뭉친다
 * ============================================================ */

export const S6FriedRice: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const sec = f / FPS;
  const revealP = smooth(progress(f, 6, 40));
  const labelP = progress(f, 10, 34);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path
          d={`M ${CX - 360},760 Q ${CX},900 ${CX + 360},760`}
          fill="none" stroke={C.ink} strokeWidth={SW} strokeLinecap="round"
        />
        <ellipse cx={CX} cy={758} rx={360} ry={36} fill="none" stroke={C.ink} strokeWidth={SW_THIN} opacity={0.4} />
        <g opacity={revealP}>
          <RiceMound cx={CX - 230} cy={700} scale={0.6} hardness={1} spread={0.9} />
        </g>
        <g opacity={revealP}>
          <RiceMound cx={CX + 230} cy={700} scale={0.7} hardness={0.1} spread={0} />
        </g>
      </svg>
      <Label x={CX - 230} y={430} text={t.s6LabelCold} size={FS.label} color={C.ink} style={{ opacity: labelP }} />
      <Label x={CX + 230} y={430} text={t.s6LabelHot} size={FS.label} color={C.coral} style={{ opacity: labelP }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 냉장실 vs 냉동실 - 굳는 속도 비교
 * ============================================================ */

export const S7FridgeSpeed: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const labelP = progress(f, frames * 0.55, frames * 0.8);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={300} text={t.s7Highlight} size={FS.label} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <CompareBars
        items={[
          { label: t.s7LabelFridge, value: 0.9, color: C.coral, at: 6 },
          { label: t.s7LabelFreezer, value: 0.38, color: C.waterCool, at: 6 },
        ]}
        x={CX - 260} y={560} pxPerUnit={520} rowGap={220} labelGap={70} frame={f} labelSize={44}
      />
      <ThemedIcon name="snowflake" size={90} color={C.waterCool} style={{ position: 'absolute', left: CX + 260, top: 820 }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};
