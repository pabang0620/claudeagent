/** 이 화(general-ep67, "소금에 절이면 음식이 안 상하는 이유") 전용 장면.
 *
 *  s1(장아찌·자반고등어 클로즈업) -> s2(OsmosisDiagram: 삼투로 물이 빠짐) ->
 *  s3(같은 다이어그램, 세균 쪼그라듦) -> s4(같은 다이어그램, 증식 막힘) ->
 *  s5(상한 음식 vs 절인 음식 비교 카드) -> s6(옛날 저장법 실루엣) ->
 *  s7(소금 농도 비교 막대).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 세균은 점 무리 대신 단순한 도형 1~2마리로만,
 *  세포가 물을 뺏기는 과정은 형태 변화(쪼그라듦)+화살표 1~2개로만, 절인 음식은 먹음직스럽고
 *  깔끔하게, 소금 입자는 작은 결정 도형 몇 개로만(잔뜩 뿌리지 않음).
 */
import React from 'react';
import {
  C, Caption, CompareBars, FPS, FS, Label, OsmosisDiagram, PlainBg, PopIn,
  SW, SW_THIN, W, clamp01, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerpPx = (a: number, b: number, t: number) => a + (b - a) * t;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** 소금 결정 하나 - OsmosisDiagram/SaltCycleDiagram과 같은 다이아몬드 글리프(잔뜩 뿌리지 않고
 *  씬마다 몇 개만 정적으로 배치). */
function SaltFleck({
  x, y, r, opacity = 1,
}: { x: number; y: number; r: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <path
        d={`M 0 ${-r} L ${r * 0.82} 0 L 0 ${r} L ${-r * 0.82} 0 Z`}
        fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.7} strokeLinejoin="round"
      />
    </g>
  );
}

/* ============================================================
 * S1: 장아찌(유리병) + 자반고등어(접시) 클로즈업
 * ============================================================ */

/** PopIn(이미 position:absolute로 중심 배치된 박스) 안에 넣는 순수 block svg.
 *  내부에 또 position:absolute를 주면 PopIn의 중심 오프셋 위에 한 번 더 오프셋이
 *  겹쳐 어긋난다(21화 이후 반복된 결함 A절과 같은 함정) - 그래서 여기선 절대 좌표를
 *  쓰지 않고 viewBox 크기 그대로 채우는 block svg로만 그린다. */
function PickleJar({ size }: { size: number }) {
  const w = size * 0.62;
  const h = size;
  return (
    <svg width={w * 1.3} height={h * 1.1} viewBox={`0 0 ${w * 1.3} ${h * 1.1}`} style={{ overflow: 'visible' }}>
      <g transform={`translate(${w * 0.15} ${h * 0.05})`}>
        {/* 병 몸통 */}
        <rect x={0} y={h * 0.18} width={w} height={h * 0.78} rx={w * 0.16} fill="rgba(255,255,255,0.5)" stroke={C.ink} strokeWidth={SW_THIN} />
        {/* 절임 채소 조각들 - 깔끔하게 층층이 */}
        <rect x={w * 0.1} y={h * 0.55} width={w * 0.8} height={h * 0.36} rx={w * 0.1} fill={C.leaf} />
        <ellipse cx={w * 0.3} cy={h * 0.66} rx={w * 0.2} ry={h * 0.06} fill="#C9DE9E" />
        <ellipse cx={w * 0.68} cy={h * 0.78} rx={w * 0.22} ry={h * 0.06} fill="#C9DE9E" />
        <ellipse cx={w * 0.3} cy={h * 0.88} rx={w * 0.2} ry={h * 0.06} fill="#C9DE9E" />
        {/* 절임 국물 */}
        <rect x={w * 0.06} y={h * 0.42} width={w * 0.88} height={h * 0.16} fill={C.goldSoft} opacity={0.55} />
        {/* 병목 + 뚜껑 */}
        <rect x={w * 0.28} y={h * 0.02} width={w * 0.44} height={h * 0.2} rx={w * 0.06} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} />
        <rect x={w * 0.22} y={-h * 0.02} width={w * 0.56} height={h * 0.12} rx={w * 0.05} fill={C.coral} stroke={C.ink} strokeWidth={SW_THIN} />
      </g>
    </svg>
  );
}

function SaltedFish({ size }: { size: number }) {
  const w = size * 1.5;
  const h = size * 0.9;
  return (
    <svg width={w * 1.15} height={h * 1.3} viewBox={`0 0 ${w * 1.15} ${h * 1.3}`} style={{ overflow: 'visible' }}>
      {/* 접시 */}
      <ellipse cx={w * 0.575} cy={h * 1.05} rx={w * 0.56} ry={h * 0.22} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} />
      {/* 생선 몸통 */}
      <ellipse cx={w * 0.45} cy={h * 0.55} rx={w * 0.36} ry={h * 0.3} fill={C.coralSoft} stroke={C.ink} strokeWidth={SW_THIN} />
      {/* 꼬리 */}
      <path d={`M ${w * 0.78} ${h * 0.55} L ${w * 1.05} ${h * 0.3} L ${w * 1.0} ${h * 0.55} L ${w * 1.05} ${h * 0.8} Z`} fill={C.coralSoft} stroke={C.ink} strokeWidth={SW_THIN} strokeLinejoin="round" />
      {/* 눈 */}
      <circle cx={w * 0.24} cy={h * 0.48} r={w * 0.03} fill={C.ink} />
      {/* 소금 결정 몇 개만 등에 */}
      <g>
        <SaltFleck x={w * 0.36} y={h * 0.32} r={w * 0.045} />
        <SaltFleck x={w * 0.52} y={h * 0.4} r={w * 0.04} />
        <SaltFleck x={w * 0.44} y={h * 0.55} r={w * 0.035} />
      </g>
    </svg>
  );
}

export const S1Food: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const sec = f / FPS;
  const jarP = smooth(progress(f, 4, 26));
  const fishP = smooth(progress(f, 16, 38));
  const centerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <PopIn cx={CX - 230} cy={760} size={380} height={500} progress={jarP} fromScale={0.6} style={centerStyle}>
        <PickleJar size={400} />
      </PopIn>
      <PopIn cx={CX + 250} cy={840} size={420} height={340} progress={fishP} fromScale={0.6} style={centerStyle}>
        <SaltedFish size={260} />
      </PopIn>
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 삼투 현상 - 물이 세포 밖으로, 소금 결정 등장
 * ============================================================ */

const DIA_WIDTH = 620;
const DIA_X = CX - DIA_WIDTH / 2;
const DIA_Y = 560;

export const S2Osmosis: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const saltP = smooth(progress(f, 6, frames * 0.42));
  const waterP = smooth(progress(f, frames * 0.32, frames * 0.92));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s2Label} size={FS.label} color={C.ink} />
      <OsmosisDiagram width={DIA_WIDTH} x={DIA_X} y={DIA_Y} saltProgress={saltP} waterOutProgress={waterP} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 세균도 수분을 뺏겨 쪼그라듦
 * ============================================================ */

export const S3BacteriaShrink: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const shrinkP = smooth(progress(f, 8, frames * 0.9));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s3Label} size={FS.label} color={C.ink} />
      <OsmosisDiagram
        width={DIA_WIDTH} x={DIA_X} y={DIA_Y}
        saltProgress={1} waterOutProgress={1} bacteriaShrinkProgress={shrinkP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 증식 시도가 막힘
 * ============================================================ */

export const S4GrowthBlock: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const blockP = smooth(progress(f, 6, frames * 0.85));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s4Label} size={FS.label} color={C.ink} />
      <OsmosisDiagram
        width={DIA_WIDTH} x={DIA_X} y={DIA_Y}
        saltProgress={1} waterOutProgress={1} bacteriaShrinkProgress={1} growthBlockProgress={blockP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 상한 음식 vs 절인 음식 비교 카드
 * ============================================================ */

function Germ({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.86} fill={C.leaf} stroke={C.ink} strokeWidth={SW_THIN * 0.8} />
      <circle cx={-r * 0.3} cy={-r * 0.06} r={r * 0.1} fill={C.ink} />
      <circle cx={r * 0.3} cy={-r * 0.06} r={r * 0.1} fill={C.ink} />
      <path d={`M ${-r * 0.22} ${r * 0.3} Q 0 ${r * 0.14} ${r * 0.22} ${r * 0.3}`} fill="none" stroke={C.ink} strokeWidth={SW_THIN * 0.6} strokeLinecap="round" />
    </g>
  );
}

const S5_CARD_W = 400;
const S5_CARD_H = 460;
const S5_GAP = 40;
const S5_LEFT_X = CX - S5_GAP / 2 - S5_CARD_W;
const S5_RIGHT_X = CX + S5_GAP / 2;
const S5_CARD_Y = 640;

export const S5Compare: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const sec = f / FPS;
  const leftP = smooth(progress(f, 4, 26));
  const rightP = smooth(progress(f, 14, 36));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      {/* 상한 음식 카드 */}
      <div
        style={{
          position: 'absolute', left: S5_LEFT_X, top: S5_CARD_Y, width: S5_CARD_W, height: S5_CARD_H,
          background: C.paper, border: `${SW}px solid ${C.ink}`, borderRadius: 40,
          opacity: leftP, transform: `translateY(${(1 - leftP) * 36}px)`,
        }}
      >
        <svg width={S5_CARD_W} height={S5_CARD_H - 100} viewBox={`0 0 ${S5_CARD_W} ${S5_CARD_H - 100}`}>
          <ellipse cx={S5_CARD_W / 2} cy={220} rx={140} ry={80} fill={C.browningSoft} stroke={C.ink} strokeWidth={SW_THIN} />
          <Germ x={S5_CARD_W / 2 - 60} y={190} r={44} />
          <Germ x={S5_CARD_W / 2 + 55} y={210} r={38} />
          <Germ x={S5_CARD_W / 2} y={150} r={32} />
        </svg>
        <Label x={S5_CARD_W / 2} y={S5_CARD_H - 74} text={t.s5SpoiledLabel} size={40} color={C.ink} />
      </div>

      {/* 절인 음식 카드 */}
      <div
        style={{
          position: 'absolute', left: S5_RIGHT_X, top: S5_CARD_Y, width: S5_CARD_W, height: S5_CARD_H,
          background: C.paper, border: `${SW}px solid ${C.ink}`, borderRadius: 40,
          opacity: rightP, transform: `translateY(${(1 - rightP) * 36}px)`,
        }}
      >
        <svg width={S5_CARD_W} height={S5_CARD_H - 100} viewBox={`0 0 ${S5_CARD_W} ${S5_CARD_H - 100}`}>
          <rect x={S5_CARD_W / 2 - 110} y={110} width={220} height={170} rx={30} fill={C.leaf} stroke={C.ink} strokeWidth={SW_THIN} />
          <ellipse cx={S5_CARD_W / 2 - 40} cy={160} rx={50} ry={18} fill="#C9DE9E" />
          <ellipse cx={S5_CARD_W / 2 + 40} cy={210} rx={54} ry={18} fill="#C9DE9E" />
          <SaltFleck x={S5_CARD_W / 2 - 70} y={90} r={16} />
          <SaltFleck x={S5_CARD_W / 2 + 60} y={80} r={14} />
        </svg>
        <Label x={S5_CARD_W / 2} y={S5_CARD_H - 74} text={t.s5PreservedLabel} size={40} color={C.ink} />
      </div>
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 냉장고 없던 시절 저장법 (단순 실루엣)
 * ============================================================ */

function PersonSilhouette({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const w = size;
  const h = size * 1.5;
  return (
    <svg
      width={w} height={h}
      style={{ position: 'absolute', left: cx - w / 2, top: cy - h, overflow: 'visible' }}
    >
      <circle cx={w * 0.5} cy={h * 0.12} r={w * 0.16} fill={C.ink} />
      <path
        d={`M ${w * 0.5} ${h * 0.26}
            C ${w * 0.2} ${h * 0.32} ${w * 0.14} ${h * 0.55} ${w * 0.2} ${h * 0.7}
            L ${w * 0.14} ${h * 0.98}
            L ${w * 0.34} ${h * 0.98}
            L ${w * 0.42} ${h * 0.72}
            L ${w * 0.5} ${h * 0.72}
            L ${w * 0.58} ${h * 0.98}
            L ${w * 0.78} ${h * 0.98}
            L ${w * 0.7} ${h * 0.6}
            C ${w * 0.68} ${h * 0.42} ${w * 0.62} ${h * 0.3} ${w * 0.5} ${h * 0.26} Z`}
        fill={C.ink}
      />
      {/* 뻗은 팔 - 생선을 항아리 쪽으로 내리는 동작 */}
      <path d={`M ${w * 0.66} ${h * 0.34} Q ${w * 0.9} ${h * 0.42} ${w * 0.86} ${h * 0.62}`} stroke={C.ink} strokeWidth={w * 0.09} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BarrelJar({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const w = size;
  const h = size * 0.9;
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: cx - w / 2, top: cy - h, overflow: 'visible' }}>
      <path
        d={`M ${w * 0.08} ${h * 0.1} Q 0 ${h * 0.5} ${w * 0.08} ${h * 0.9} L ${w * 0.92} ${h * 0.9} Q ${w} ${h * 0.5} ${w * 0.92} ${h * 0.1} Z`}
        fill={C.browningSoft} stroke={C.ink} strokeWidth={SW_THIN}
      />
      <ellipse cx={w * 0.5} cy={h * 0.1} rx={w * 0.42} ry={h * 0.06} fill={C.goldSoft} stroke={C.ink} strokeWidth={SW_THIN} />
    </svg>
  );
}

export const S6History: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const sec = f / FPS;
  const appearP = smooth(progress(f, 4, 26));
  const fishDrop = smooth(progress(f, 20, 60));
  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} stop={0.5}>
      <Label x={CX} y={300} text={t.s6Label} size={FS.label} color={C.ink} />
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: appearP }}>
        <BarrelJar cx={CX + 60} cy={1180} size={300} />
        <PersonSilhouette cx={CX - 130} cy={1180} size={340} />
        <div
          style={{
            position: 'absolute',
            left: lerpPx(CX + 20, CX - 10, fishDrop), top: lerpPx(830, 1010, fishDrop),
          }}
        >
          <svg width={140} height={70} style={{ overflow: 'visible' }}>
            <ellipse cx={60} cy={35} rx={54} ry={26} fill={C.coralSoft} stroke={C.ink} strokeWidth={SW_THIN} />
            <path d="M 108 35 L 138 18 L 128 35 L 138 52 Z" fill={C.coralSoft} stroke={C.ink} strokeWidth={SW_THIN} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 소금 농도 비교 막대
 * ============================================================ */

export const S7Concentration: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s7Label} size={FS.label} color={C.ink} />
      <CompareBars
        x={CX - 300}
        y={520}
        pxPerUnit={5.2}
        rowGap={190}
        frame={f}
        items={[
          { label: t.s7Weak, value: 24, color: C.goldSoft, at: 6 },
          { label: t.s7Enough, value: 92, color: C.coral, at: 24 },
        ]}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};
