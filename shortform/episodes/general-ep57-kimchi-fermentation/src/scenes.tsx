/** 이 화(general-ep57, "김치가 시어지고 익는 이유") 전용 장면.
 *
 *  s1(갓 담근 김치 vs 며칠 지난 김치, KimchiPiece 색 대비) -> s2(같은 카드 레이아웃에
 *  "슴슴"/"새콤·톡" 표정 아이콘 대비) -> s3(MilkCurdleDiagram bacteriaProgress, 유산균 등장) ->
 *  s4(FermentJar sealProgress, 밀폐+소금 환경에서 유산균이 다른 균을 압도) -> s5(같은
 *  MilkCurdleDiagram acidProgress, 당분을 먹고 산을 만듦) -> s6(FermentJar bubbleProgress +
 *  SodaCan 나란히 비교) -> s7(FermentJar acidityProgress+bubbleProgress + 미니 타임라인,
 *  시간이 지날수록 둘 다 늘어남).
 *
 *  이 화는 훅 질문·리액션 대사가 없는 전 구간 서술문이라(ep49-autumn-leaves와 동일 패턴)
 *  캐릭터(Actor/BustActor)를 쓰지 않는다.
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 세균은 점 무리 대신 도형 한두 개로 크게
 *  (MilkCurdleDiagram·FermentJar 모두 이 원칙을 따름). 시간 경과는 같은 김치통이 단계별로
 *  변하는 형태로. 김치는 먹음직스럽고 깔끔하게(곰팡이·불쾌한 질감 없음). 신맛 정도는 색
 *  변화·막대 하나로만(물결선·기호 남발 금지). 신맛 색(SOUR_RED)과 강조색(coral)이 서로
 *  다른 색조(주황 코랄 vs 짙은 붉은색)라 겹쳐도 묻히지 않는다(43화 금색-금색 사고 재발 방지).
 */
import React from 'react';
import {
  C, Caption, FPS, FermentJar, KimchiPiece, Label, MilkCurdleDiagram, PlainBg, SodaCan, ThemedIcon, W,
  clamp01, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

/** 신맛(젖산)을 상징하는 색 - 김치 양념의 코랄(주황빛)과 뚜렷이 구분되는 짙은 붉은색.
 *  s1 카드(며칠 지난 김치)·s5(산 원)·s7(산도 게이지)에서 동일하게 써서 "이게 신맛"이라는
 *  시각 언어를 영상 전체에서 하나로 통일한다. */
const SOUR_RED = '#E2543C';

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, v: number) => a + (b - a) * v;

/** 간단한 표정 얼굴 아이콘(이 화 로컬). 슴슴(무표정)/새콤(찡그린 표정) 대비용.
 *  KimchiPiece 와 동일하게 절대좌표를 받지 않는 순수 <svg> 라 CardShell 의 flex 컨테이너
 *  안에서 자동으로 중앙 정렬된다(2026-09-02 스틸 선점검 발견 - 절대좌표를 쓰면 이미
 *  position:absolute 인 조상 체인 안에서 좌표가 이중으로 어긋난다). */
function FaceIcon({ size, sour }: { size: number; sour: boolean }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <circle cx={r} cy={r} r={r - 10} fill={C.paper} stroke={C.ink} strokeWidth={10} />
      {sour ? (
        <>
          {/* 찡그린 눈 (^ ^) */}
          <path d={`M ${r - 34} ${r - 14} L ${r - 16} ${r - 24} L ${r - 2} ${r - 12}`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M ${r + 2} ${r - 12} L ${r + 16} ${r - 24} L ${r + 34} ${r - 14}`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          {/* 오므린 입 */}
          <circle cx={r} cy={r + 26} r={12} fill="none" stroke={C.ink} strokeWidth={9} />
          {/* 볼 홍조 */}
          <circle cx={r - 44} cy={r + 14} r={12} fill={C.coralSoft} />
          <circle cx={r + 44} cy={r + 14} r={12} fill={C.coralSoft} />
        </>
      ) : (
        <>
          <circle cx={r - 24} cy={r - 10} r={9} fill={C.ink} />
          <circle cx={r + 24} cy={r - 10} r={9} fill={C.ink} />
          <path d={`M ${r - 22} ${r + 26} Q ${r} ${r + 30} ${r + 22} ${r + 26}`} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/* ============================================================
 * 공용: 카드 두 장 나란히 배치(s1·s2)
 * ============================================================ */
const CARD_W = 420;
const CARD_H = 560;
const CARD_GAP = 40;
const CARD_LEFT_X = CX - (CARD_W * 2 + CARD_GAP) / 2;
const CARD_RIGHT_X = CARD_LEFT_X + CARD_W + CARD_GAP;
const CARD_Y = 540;

function CardShell({
  x, label, progressV, children,
}: { x: number; label: string; progressV: number; children: React.ReactNode }) {
  const p = smooth(progressV);
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: CARD_Y, width: CARD_W, height: CARD_H,
        transform: `translateY(${(1 - p) * 48}px) scale(${0.86 + 0.14 * p})`, opacity: p,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: C.paper, border: `13px solid ${C.ink}`, borderRadius: 44 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 26, bottom: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center',
          fontFamily: "'NanumSquareRound', sans-serif", fontWeight: 700, fontSize: 46, color: C.ink,
          wordBreak: 'keep-all',
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ============================================================
 * S1: 갓 담근 김치 vs 며칠 지난 김치
 * ============================================================ */

export const S1Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const p1 = progress(f, 0, 18);
  const p2 = progress(f, 8, 26);
  return (
    <PlainBg>
      <CardShell x={CARD_LEFT_X} label={t.s1CardFresh} progressV={p1}>
        <KimchiPiece width={230} />
      </CardShell>
      <CardShell x={CARD_RIGHT_X} label={t.s1CardAged} progressV={p2}>
        <KimchiPiece width={230} seasonedColor={SOUR_RED} />
      </CardShell>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "슴슴" vs "새콤·톡" 표정 대비 (같은 카드 레이아웃)
 * ============================================================ */

export const S2Taste: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const p1 = progress(f, 0, 18);
  const p2 = progress(f, 10, 28);
  return (
    <PlainBg>
      <CardShell x={CARD_LEFT_X} label={t.s2FaceNeutral} progressV={p1}>
        <FaceIcon size={220} sour={false} />
      </CardShell>
      <CardShell x={CARD_RIGHT_X} label={t.s2FaceSour} progressV={p2}>
        <FaceIcon size={220} sour />
      </CardShell>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 공용: MilkCurdleDiagram 고정 배치(s3·s5)
 * ============================================================ */
const DIAG_WIDTH = 480;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 660;

/* ============================================================
 * S3: 유산균이라는 작은 세균이 자란다
 * ============================================================ */

export const S3Bacteria: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const bacteriaProgress = progress(f, frames * 0.1, frames * 0.9);
  const labelA = progress(f, frames * 0.35, frames * 0.55);
  return (
    <PlainBg>
      <MilkCurdleDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} bacteriaProgress={bacteriaProgress} />
      <Label x={CX} y={DIAG_Y - 76} text={t.s3Label} size={56} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 소금기 + 밀폐 환경 - 유산균이 다른 균보다 잘 자란다
 * ============================================================ */

const JAR_WIDTH_S4 = 460;
const JAR_X_S4 = CX - JAR_WIDTH_S4 / 2;
const JAR_Y_S4 = 600;

export const S4Seal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const sealProgress = progress(f, frames * 0.08, frames * 0.95);
  return (
    <PlainBg>
      <FermentJar width={JAR_WIDTH_S4} x={JAR_X_S4} y={JAR_Y_S4} sealProgress={sealProgress} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 당분을 먹으며 신맛 나는 산을 만든다
 * ============================================================ */

export const S5Acid: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const acidProgress = progress(f, frames * 0.12, frames * 0.85);
  const lemonA = progress(f, frames * 0.5, frames * 0.72);
  const lemonScale = 0.5 + 0.5 * smooth(lemonA);
  return (
    <PlainBg>
      <MilkCurdleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} bacteriaProgress={1} acidProgress={acidProgress}
        acidColor={SOUR_RED}
      />
      {lemonA > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: DIAG_X + DIAG_WIDTH - 30, top: DIAG_Y - 40,
            opacity: lemonA, transform: `scale(${lemonScale})`, transformOrigin: '50% 50%',
          }}
        >
          <ThemedIcon name="lemon-2" size={100} color={SOUR_RED} />
        </div>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 이산화탄소 기포 - 탄산음료 거품과 나란히 비교
 * ============================================================ */

const S6_JAR_W = 380;
const S6_SODA_W = 260;
const S6_GAP = 60;
const S6_TOTAL_W = S6_JAR_W + S6_GAP + S6_SODA_W;
const S6_LEFT_X = CX - S6_TOTAL_W / 2;
const S6_JAR_Y = 560;
const S6_JAR_H = (S6_JAR_W * 680) / 620;
const S6_SODA_H = (S6_SODA_W * 400) / 300;
const S6_SODA_X = S6_LEFT_X + S6_JAR_W + S6_GAP;
const S6_SODA_Y = S6_JAR_Y + S6_JAR_H - S6_SODA_H;
const S6_LABEL_Y = S6_JAR_Y + S6_JAR_H + 34;

export const S6Bubble: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const lidOpen = progress(f, 0, frames * 0.3);
  const bubbleProgress = progress(f, frames * 0.15, frames * 0.95);
  return (
    <PlainBg>
      <FermentJar
        width={S6_JAR_W} x={S6_LEFT_X} y={S6_JAR_Y} sealProgress={1} lidOpen={lidOpen}
        bubbleProgress={bubbleProgress}
      />
      <Label x={S6_LEFT_X + S6_JAR_W / 2} y={S6_LABEL_Y} text={t.s6JarLabel} size={44} />
      <SodaCan width={S6_SODA_W} shaken={1} open={1} style={{ position: 'absolute', left: S6_SODA_X, top: S6_SODA_Y }} />
      <Label x={S6_SODA_X + S6_SODA_W / 2} y={S6_LABEL_Y} text={t.s6SodaLabel} size={44} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 시간이 지날수록 산도·기포가 함께 늘어난다
 * ============================================================ */

const S7_JAR_W = 460;
const S7_JAR_X = CX - S7_JAR_W / 2;
const S7_JAR_Y = 620;
const S7_LINE_Y = 440;
const S7_LINE_X1 = CX - 340;
const S7_LINE_X2 = CX + 340;

export const S7Timelapse: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const timeP = progress(f, frames * 0.06, frames * 0.94);
  const dotX = lerp(S7_LINE_X1, S7_LINE_X2, smooth(timeP));
  return (
    <PlainBg>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={S7_LINE_X1} y1={S7_LINE_Y} x2={S7_LINE_X2} y2={S7_LINE_Y} stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" />
        <circle cx={S7_LINE_X1} cy={S7_LINE_Y} r={10} fill={C.ink} />
        <circle cx={S7_LINE_X2} cy={S7_LINE_Y} r={10} fill={C.ink} />
        <circle cx={dotX} cy={S7_LINE_Y} r={20} fill={SOUR_RED} stroke={C.ink} strokeWidth={8} />
      </svg>
      <Label x={S7_LINE_X1} y={S7_LINE_Y - 58} text={t.s7TimeStart} size={38} color={C.inkSoft} />
      <Label x={S7_LINE_X2} y={S7_LINE_Y - 58} text={t.s7TimeEnd} size={38} color={C.inkSoft} />
      <FermentJar
        width={S7_JAR_W} x={S7_JAR_X} y={S7_JAR_Y} sealProgress={1} lidOpen={1}
        acidityProgress={timeP} bubbleProgress={timeP} showGauge
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
