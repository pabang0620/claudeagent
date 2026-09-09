/** 이 화(general-ep52, "펭귄이 얼음 위에서도 발이 안 시린 이유") 전용 장면.
 *
 *  s1(펭귄이 얼음 위에 가만히 서 있음) -> s2a(다리 실루엣으로 줌인 시작) -> s2b(동맥·정맥이
 *  나란히 붙어 지나가는 다이어그램) -> s3(열교환 화살표 애니메이션) -> s4(몸통 vs 발 온도
 *  비교 막대) -> s5(발 vs 얼음 온도 비교 막대 + 작은 열손실 화살표) -> s6(발 클로즈업 +
 *  "차갑지만 안 얼어요" 배지) -> s7(북극여우·순록 비교 카드).
 *
 *  이 화의 핵심 그림은 CounterCurrentDiagram(신규, props/에 등록) - 나가는 혈관(동맥)과
 *  들어오는 혈관(정맥)이 나란히 붙어 열을 주고받는 모습이다. s2a~s3에서 같은 x/y/width로
 *  다이어그램을 배치해 좌표 앵커가 장면 전환 사이에서 어긋나지 않게 했다(원칙 5).
 *  혈관은 굵은 파이프 2줄로만 표현하고(오케스트레이터 지시), 눈송이는 화면에 잔뜩 뿌리지
 *  않고 s1에 성기게 3개만 정지 배치했다.
 */
import React from 'react';
import {
  C, CardGrid, Caption, CompareBars, CounterCurrentDiagram, FONT, FPS, Penguin, RADIUS,
  ThemedIcon, PlainBg, W, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * S1: 펭귄이 얼음 위에 가만히 서 있음
 * ================================================================ */

const S1_PENGUIN_W = 620;
const S1_PENGUIN_Y = 1300;
const SNOWFLAKE_PTS = [
  { x: 190, y: 420, size: 60 },
  { x: 880, y: 560, size: 46 },
  { x: 760, y: 260, size: 40 },
];

export const S1Still: React.FC<{
  f: number; frames: number; lines: CaptionLine[];
}> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.water} bottom={C.paper} groundColor={C.hill}>
      {SNOWFLAKE_PTS.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, opacity: 0.32 }}>
          <ThemedIcon name="snowflake" size={p.size} color={C.inkSoft} strokePx={7} />
        </div>
      ))}
      <Penguin width={S1_PENGUIN_W} x={CX} y={S1_PENGUIN_Y} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S2a / S2b / S3 공용: 다리 단면 다이어그램 좌표 (전환 사이에도 앵커 고정)
 * ================================================================ */

const DIAG_W = 520;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 440;

/* -------- S2a: 다리 실루엣으로 줌인 시작 (혈관은 아직 안 보임) -------- */

export const S2aZoom: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const reveal = progress(f, 8, frames - 16) * 0.35;

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <CounterCurrentDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} revealProgress={reveal} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S2b: 동맥(오른쪽, 발로)과 정맥(왼쪽, 몸통으로)이 나란히 붙어 지나감 -------- */

export const S2bVessels: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const reveal = 0.35 + progress(f, 6, frames - 12) * 0.65;

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <CounterCurrentDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} revealProgress={reveal} heatProgress={0} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* -------- S3: 동맥에서 정맥 쪽으로 열이 옮겨가는 애니메이션 -------- */

export const S3Heat: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const heat = progress(f, 8, frames - 20);

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <CounterCurrentDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} revealProgress={1} heatProgress={heat} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 몸통 vs 발 온도 비교 막대
 * ================================================================ */

const S4_X = 210;
const S4_Y = 580;
const S4_ROW_GAP = 280;
const S4_PX_PER_UNIT = 4.4;

export const S4CompareTemp: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <CompareBars
        x={S4_X} y={S4_Y} pxPerUnit={S4_PX_PER_UNIT} rowGap={S4_ROW_GAP} labelSize={52} frame={f}
        items={[
          { label: t.bodyLabel, value: 100, color: C.coral, at: 6, thickness: 64 },
          { label: t.footLabel, value: 46, color: C.waterCool, at: 30, thickness: 64 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 발 vs 얼음 온도 비교 막대 + 작은 열손실 화살표
 * ================================================================ */

const S5_X = 210;
const S5_Y = 580;
const S5_ROW_GAP = 280;
const S5_PX_PER_UNIT = 4.4;

export const S5CompareIce: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const arrowP = progress(f, frames * 0.55, frames * 0.55 + 20);
  const pulse = 0.6 + 0.4 * Math.sin(f / 9);
  // 발 막대(두번째 행, at=26) 끝 부근에 작은 열손실 화살표(발->얼음 방향, 짧고 옅게)
  const barY = S5_Y + S5_ROW_GAP + 56 + 32;
  const barEndX = S5_X + 100 * S5_PX_PER_UNIT;

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <CompareBars
        x={S5_X} y={S5_Y} pxPerUnit={S5_PX_PER_UNIT} rowGap={S5_ROW_GAP} labelSize={52} frame={f}
        items={[
          { label: t.iceLabel, value: 88, color: C.hill, at: 6, thickness: 64 },
          { label: t.footLabel, value: 100, color: C.waterCool, at: 26, thickness: 64 },
        ]}
      />
      {arrowP > 0.01 ? (
        <svg
          width={70} height={70} viewBox="0 0 70 70"
          style={{ position: 'absolute', left: barEndX + 30, top: barY - 40, opacity: arrowP * pulse }}
        >
          <path
            d="M 35 10 L 35 46 M 20 32 L 35 50 L 50 32" fill="none" stroke={C.inkSoft} strokeWidth={8}
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 발 클로즈업 + "차갑지만 안 얼어요" 배지
 * ================================================================ */

const S6_PENGUIN_W = 2100;
const S6_PENGUIN_Y = 1380;

export const S6FeetCloseup: React.FC<{
  f: number; frames: number; lines: CaptionLine[];
}> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const badgeP = progress(f, 14, frames > 40 ? 40 : frames);

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <Penguin width={S6_PENGUIN_W} x={CX} y={S6_PENGUIN_Y} />
      <div
        style={{
          position: 'absolute', left: CX, top: 300, transform: 'translate(-50%, 0)', opacity: badgeP,
          padding: '20px 36px', background: C.goldSoft, border: `7px solid ${C.ink}`,
          borderRadius: RADIUS.pill, fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {t.s6Badge}
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 북극여우·순록 비교 카드
 * ================================================================ */

const CARD_SIZE = 380;
const CARD_GAP = 44;
const CARD_ROW_X = CX - (2 * CARD_SIZE + CARD_GAP) / 2;
const CARD_ROW_Y = 700;

export const S7Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg top={C.water} bottom={C.paper} ground={null}>
      <CardGrid
        items={[
          { key: 'fox', label: t.s7ArcticFox, art: <ThemedIcon name="paw" size={190} color={C.ink} /> },
          { key: 'reindeer', label: t.s7Reindeer, art: <ThemedIcon name="paw" size={190} color={C.ink} /> },
        ]}
        x={CARD_ROW_X} y={CARD_ROW_Y} size={CARD_SIZE} columns={2} gap={CARD_GAP}
        appearAt={(i) => 10 + i * 22} frame={f}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
