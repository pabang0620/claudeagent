/** 이 화(general-ep75, "껌은 씹어도 안 녹는 이유") 전용 장면.
 *
 *  s1(계속 씹히는 껌 vs 스르륵 녹아 사라지는 사탕 대비) -> s2(GumBaseDiagram
 *  flavorDissolve: 단맛·향 입자가 물방울에 씻겨 나감) -> s3(껌맛 세기 게이지가 씹는
 *  시간에 따라 줄어듦, 이 화 전용 로컬 게이지) -> s4(같은 다이어그램 baseInsoluble: 물이
 *  표면을 스치지만 그물망은 그대로 남음) -> s5(껌 덩어리가 그대로 남아있음, "안 사라짐"
 *  라벨 + PulseRing 강조) -> s6(oilDissolve: 초콜릿(기름)을 만나 그물망이 풀어짐) ->
 *  s7(속설 "삼키면 7년" 정정 - GutTubeDiagram 재사용, 껌이 며칠 안에 소화관을 통과).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 물에 녹는 성분(단맛·향)과 안 녹는 껌 베이스의 대비가 중심 - 녹는 성분은 흩어져
 *     사라지고, 베이스는 형태만 남는 형태로 GumBaseDiagram이 구현한다.
 *   - 소화기관 내부는 34화 GutTubeDiagram(굵고 매끈한 관, 주름·혈관 없음)을 그대로
 *     재사용한다. 침·물 분자는 작은 점으로 뿌리지 않는다(GumBaseDiagram도 물방울·기름방울
 *     각 2~3개, 다이아몬드 3개로만 표현 - 점 무리 없음).
 *   - s7의 X 표시는 "속설: 삼키면 7년"(틀린 통념) 쪽에만 붙이고, "실제로는 며칠 안에
 *     통과"(맞는 설명) 쪽에는 붙이지 않는다(70화 사고 재발 방지 - builder "21화 이후
 *     반복된 결함" F절). 스틸 선점검에서 X가 어느 문장에 붙는지 직접 확인한다.
 *
 *  새 REGISTRY 자산은 GumBaseDiagram(props/) 하나뿐이다(02-script-v1.md 자산 목록 갱신).
 *  s7은 GumBaseDiagram이 아니라 34화 GutTubeDiagram을 재사용했다(자산 우선 재사용 원칙,
 *  REGISTRY GumBaseDiagram 설명에 사유 명시). 사탕(Candy)·게이지(TasteGauge)는 이 화
 *  전용 소도구라 등록하지 않는다(ep71 RiceMound/BowlRim과 동일 판단 - 다른 화 재사용
 *  가능성보다 이 장면 전용 장식에 가깝다).
 */
import React from 'react';
import {
  C, Caption, Chocolate, FPS, FS, GUM_VB_H, GUM_VB_W, GUT_VB_W, GumBaseDiagram, GutTubeDiagram,
  Label, PlainBg, PulseRing, QMark, SW, SW_THIN, W, clamp01, gutPointAt, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * 이 화 전용 소도구: 포장 사탕(줄어들며 사라짐) - RiceMound/BowlRim(ep71)과 같은 판단으로
 * 에피소드 로컬에만 둔다 (다른 화 재사용 가능성보다 이 장면 전용 장식에 가까움)
 * ============================================================ */
function Candy({
  cx, cy, r, dissolveP,
}: { cx: number; cy: number; r: number; dissolveP: number }) {
  const s = clamp01(1 - dissolveP);
  if (s <= 0.02) return null;
  const rx = r * s;
  const ry = r * 0.78 * s;
  return (
    <g opacity={s}>
      {/* 비틀린 포장지 양 끝 */}
      <path
        d={`M ${cx - rx} ${cy} L ${cx - rx - r * 0.34} ${cy - r * 0.22} L ${cx - rx - r * 0.34} ${cy + r * 0.22} Z`}
        fill={C.gold} stroke={C.ink} strokeWidth={SW_THIN}
      />
      <path
        d={`M ${cx + rx} ${cy} L ${cx + rx + r * 0.34} ${cy - r * 0.22} L ${cx + rx + r * 0.34} ${cy + r * 0.22} Z`}
        fill={C.gold} stroke={C.ink} strokeWidth={SW_THIN}
      />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.coral} stroke={C.ink} strokeWidth={SW} />
      <path
        d={`M ${cx - rx * 0.5} ${cy - ry * 0.5} Q ${cx} ${cy - ry * 0.9} ${cx + rx * 0.5} ${cy - ry * 0.5}`}
        fill="none" stroke={C.paper} strokeWidth={SW_THIN} strokeLinecap="round" opacity={0.75}
      />
    </g>
  );
}

/* ============================================================
 * 이 화 전용 소도구: 껌맛 세기 게이지 (씹을수록 줄어듦) - CompareBars는 "0에서 목표까지
 * 자라는" 용도라 이 화의 "계속 줄어드는" 방향과 맞지 않아 로컬 게이지를 직접 그린다
 * ============================================================ */
const GAUGE_W = 420;
const GAUGE_H = 64;
function TasteGauge({
  x, y, level,
}: { x: number; y: number; level: number }) {
  const lv = clamp01(level);
  return (
    <>
      <div
        style={{
          position: 'absolute', left: x, top: y, width: GAUGE_W, height: GAUGE_H,
          border: `${SW}px solid ${C.ink}`, borderRadius: GAUGE_H / 2, boxSizing: 'border-box',
          background: C.paper, overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: GAUGE_W * lv,
            background: C.gold,
          }}
        />
      </div>
    </>
  );
}

/* ============================================================
 * S1: 계속 씹히는 껌 vs 스르륵 녹아 사라지는 사탕 대비
 * ============================================================ */
const S1_GUM_W = 400;
const S1_GUM_CX = CX - 250;
const S1_GUM_Y = 560;
const S1_CANDY_CX = CX + 250;
const S1_CANDY_Y = 800;
const S1_CANDY_R = 150;

export const S1Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const sec = f / FPS;
  const revealP = smooth(progress(f, 0, 20));
  const labelP = progress(f, 12, 32);
  // 껌 씹기 - 세로로 살짝 눌렸다 펴지는 반복 스퀴시(결정적 사인, Math.random 미사용)
  const chewSquish = 1 - 0.07 * Math.abs(Math.sin((f / FPS) * 2 * Math.PI * 1.6));
  // 사탕은 씬 전체에 걸쳐 서서히 녹아 사라짐(반복 없이 1회)
  const candyDissolve = clamp01(progress(f, 20, 130));

  const gumH = (S1_GUM_W * GUM_VB_H) / GUM_VB_W;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* GumBaseDiagram은 자기 자신이 <div><svg>...</svg></div>를 그리는 컴포넌트라
          <svg> 안에 중첩하지 않고 형제로 배치한다(21화 이후 반복된 결함 A절 - svg 안에
          position:absolute 자식 svg를 넣으면 좌표가 무시되는 함정과 같은 원리). 스퀴시는
          이 컴포넌트의 style prop(내부에서 ...style로 마지막에 병합됨)으로 직접 준다 */}
      <GumBaseDiagram
        width={S1_GUM_W} x={S1_GUM_CX - S1_GUM_W / 2} y={S1_GUM_Y - gumH / 2}
        style={{
          opacity: revealP,
          transform: `scale(1, ${chewSquish})`,
          transformOrigin: '50% 50%',
        }}
      />
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g opacity={revealP}>
          <Candy cx={S1_CANDY_CX} cy={S1_CANDY_Y} r={S1_CANDY_R} dissolveP={candyDissolve} />
        </g>
      </svg>
      <Label x={S1_GUM_CX} y={S1_GUM_Y - 340} text={t.s1LabelGum} size={FS.label} color={C.ink} style={{ opacity: labelP }} />
      <Label x={S1_CANDY_CX} y={S1_CANDY_Y - 260} text={t.s1LabelCandy} size={FS.label} color={C.coral} style={{ opacity: labelP }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 단맛·향 입자가 물방울에 씻겨 침에 녹아 빠져나감 (GumBaseDiagram.flavorDissolve)
 * ============================================================ */
const DIAG_W = 620;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 420;

export const S2Flavor: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const flavorP = smooth(progress(f, 6, frames * 0.92));
  const labelP = progress(f, 6, 26);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={280} text={t.s2Label} size={FS.label} color={C.ink} style={{ opacity: smooth(labelP) }} />
      <GumBaseDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} flavorDissolve={flavorP} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 껌맛 세기 게이지가 씹는 시간에 따라 줄어듦
 * ============================================================ */
export const S3Gauge: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const labelP = progress(f, 6, 26);
  const level = 1 - progress(f, 8, frames - 6) * 0.72;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={620} text={t.s3Gauge} size={FS.label} color={C.ink} style={{ opacity: smooth(labelP) }} />
      <TasteGauge x={CX - GAUGE_W / 2} y={700} level={level} />
      <GumBaseDiagram width={340} x={CX - 170} y={880} flavorDissolve={1} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 물이 표면을 스치지만 껌 베이스(그물망)는 그대로 남음 (baseInsoluble)
 * ============================================================ */
export const S4Insoluble: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const insolubleP = smooth(progress(f, 6, frames * 0.9));
  const labelP = progress(f, 6, 26);
  const subP = progress(f, frames * 0.35, frames * 0.6);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={280} text={t.s4Label} size={FS.label} color={C.coral} style={{ opacity: smooth(labelP) }} />
      <GumBaseDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} flavorDissolve={1} baseInsoluble={insolubleP} />
      <Label
        x={CX} y={DIAG_Y + (DIAG_W * GUM_VB_H) / GUM_VB_W + 70} text={t.s4Sub} size={FS.small} color={C.ink}
        style={{ opacity: smooth(subP) }}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 단맛이 빠져도 껌 자체는 그대로 남음 ("안 사라짐")
 * ============================================================ */
export const S5StillHere: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const sec = f / FPS;
  const revealP = smooth(progress(f, 0, 22));
  const labelP = progress(f, 14, 34);
  const ringP = (f % 70) / 70;
  const diagH5 = (DIAG_W * GUM_VB_H) / GUM_VB_W;
  const ringSize = DIAG_W * 0.9;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PulseRing
        x={CX - ringSize / 2} y={DIAG_Y + diagH5 / 2 - ringSize / 2} size={ringSize}
        frame={f} progress={ringP} color={C.coral} opacity={0.35 * revealP}
      />
      <g style={{ opacity: revealP }}>
        <GumBaseDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} flavorDissolve={1} baseInsoluble={1} />
      </g>
      <Label x={CX} y={280} text={t.s5Label} size={FS.label} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 초콜릿(기름진 음식)을 만나 그물망이 풀어짐 (oilDissolve)
 * ============================================================ */
const S6_CHOCO_W = 190;
const S6_CHOCO_CX = CX + 300;
const S6_CHOCO_Y = 330;

export const S6Oil: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const oilP = smooth(progress(f, 10, frames * 0.92));
  const labelP = progress(f, 6, 26);
  const chocoP = smooth(progress(f, 0, 22));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX - 60} y={230} text={t.s6Sub} size={FS.small} color={C.ink} style={{ opacity: labelP }} />
      <GumBaseDiagram
        width={DIAG_W} x={DIAG_X - 50} y={DIAG_Y + 40}
        flavorDissolve={1} baseInsoluble={1} oilDissolve={oilP}
      />
      {/* Chocolate은 자기 자신이 <svg style={position:absolute}>를 그리는 컴포넌트라
          <g>로 감싸지 않고 style prop으로 직접 opacity/transform을 준다(S1의 GumBaseDiagram과
          동일한 이유 - 21화 이후 반복된 결함 A절) */}
      <Chocolate
        width={S6_CHOCO_W} x={S6_CHOCO_CX - S6_CHOCO_W / 2} y={S6_CHOCO_Y - S6_CHOCO_W / 2}
        style={{
          opacity: chocoP,
          transform: `scale(${0.7 + 0.3 * chocoP})`,
          transformOrigin: '50% 50%',
        }}
      />
      <Label x={S6_CHOCO_CX} y={S6_CHOCO_Y + 140} text={t.s6LabelChoco} size={FS.small} color={C.browning} style={{ opacity: chocoP }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 속설 "삼키면 7년" 정정 - GutTubeDiagram 재사용, 껌이 며칠 안에 통과
 * X 표시는 "속설: 삼키면 7년"(틀린 통념) 쪽에만 붙인다 - "실제로는 며칠 안에 통과"에는
 * 붙지 않는다(70화 사고 재발 방지, 파일 상단 주석 참고)
 * ============================================================ */
const S7_DIAG_W = 520;
const S7_DIAG_X = CX - S7_DIAG_W / 2;
const S7_DIAG_Y = 520;
const S7_MYTH_X = CX;
const S7_ICON_Y = 260;
const S7_ICON_R = 60;
const S7_MYTH_LABEL_Y = S7_ICON_Y + S7_ICON_R + 40;

function gutScreenPt(diagX: number, diagY: number, diagWidth: number, tt: number) {
  const scale = diagWidth / GUT_VB_W;
  const p = gutPointAt(tt);
  return { x: diagX + p.x * scale, y: diagY + p.y * scale };
}

export const S7Myth: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const sec = f / FPS;
  const flowT = f / 80;
  const ampIn = clamp01(progress(f, 0, 24));
  const mythLabelP = progress(f, 4, 24);
  const xAt = 20;
  const xP = clamp01(progress(f, xAt, xAt + 16));
  const realLabelP = progress(f, 40, 62);

  // 껌 덩어리가 관을 따라 이동하며 통과하는 모습 (조각별 시차 없이 하나만, "며칠 안에
  // 통과"를 압축해 한 번에 리빌)
  const gumT = smooth(progress(f, 30, frames - 20 <= 30 ? frames : frames - 20));
  const gumPt = gutScreenPt(S7_DIAG_X, S7_DIAG_Y, S7_DIAG_W, 0.03 + gumT * 0.94);
  const gumScale = S7_DIAG_W / GUT_VB_W;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* 중립적인 시계 아이콘 위에 X를 겹쳐 "7년" 속설(틀린 통념) 자체를 가리킨다 - X는
          이 아이콘·라벨 쪽에만 붙고, 아래쪽 "실제로는 며칠 안에 통과" 라벨과는 겹치지
          않는다(70화 S6Myth와 동일 배치 - 아이콘에 X, 라벨은 아이콘 아래 별도 위치) */}
      <svg width={S7_ICON_R * 2 + 20} height={S7_ICON_R * 2 + 20} style={{
        position: 'absolute', left: S7_MYTH_X - S7_ICON_R - 10, top: S7_ICON_Y - S7_ICON_R - 10,
        opacity: mythLabelP,
      }}
      >
        <circle cx={S7_ICON_R + 10} cy={S7_ICON_R + 10} r={S7_ICON_R} fill={C.paper} stroke={C.inkSoft} strokeWidth={9} />
        <circle cx={S7_ICON_R + 10} cy={S7_ICON_R + 10} r={S7_ICON_R * 0.62} fill="none" stroke={C.inkSoft} strokeWidth={8} />
        <line x1={S7_ICON_R + 10} y1={S7_ICON_R + 10} x2={S7_ICON_R + 10} y2={S7_ICON_R + 10 - S7_ICON_R * 0.4} stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" />
        <line x1={S7_ICON_R + 10} y1={S7_ICON_R + 10} x2={S7_ICON_R + 10 + S7_ICON_R * 0.28} y2={S7_ICON_R + 10} stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" />
      </svg>
      {xP > 0.01 ? (
        <QMark
          size={S7_ICON_R * 2} glyph="X" color={C.coral} outline={C.paper}
          style={{
            left: S7_MYTH_X, top: S7_ICON_Y,
            transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * xP})`, opacity: xP,
          }}
        />
      ) : null}
      <Label
        x={S7_MYTH_X} y={S7_MYTH_LABEL_Y} text={t.s7MythLabel} size={FS.small} color={C.inkSoft}
        style={{ opacity: mythLabelP }}
      />

      <GutTubeDiagram width={S7_DIAG_W} x={S7_DIAG_X} y={S7_DIAG_Y} flowT={flowT} waveAmp={0.5 * ampIn} />
      {gumT > 0.001 && gumT < 0.999 && (
        <div
          style={{
            position: 'absolute', left: gumPt.x - 30 * gumScale, top: gumPt.y - 26 * gumScale,
            width: 60 * gumScale, height: 52 * gumScale, borderRadius: '50%',
            background: C.goldSoft, border: `${SW_THIN}px solid ${C.ink}`,
          }}
        />
      )}

      <Label
        x={CX} y={1440} text={t.s7RealLabel} size={FS.small} color={C.ink}
        style={{ opacity: realLabelP }}
      />

      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};
