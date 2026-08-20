/** 이 화(general-ep04, "사과 잘라두면 갈색이 되는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다.
 */
import React from 'react';
import {
  Apple, BustActor, C, Caption, CellMergeDiagram, FONT, FPS, PlainBg, POSES, Sparkles, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS, Locale } from './strings';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- 칼 (이 화 전용 - 재사용 소재는 아니라 라이브러리로 올리지 않음) ---------------- */

const Knife: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 140 260" width={140} style={style}>
    <path
      d="M 70 4 L 92 150 L 48 150 Z"
      fill={C.hillFar} stroke={C.ink} strokeWidth={9} strokeLinejoin="round"
    />
    <rect x={46} y={150} width={48} height={92} rx={16} fill={C.ink} />
  </svg>
);

/* ---------------- S1: 도마 위 사과 -> 칼로 자르기 (무성) ---------------- */

const KNIFE_START_Y = -180;
const KNIFE_CONTACT_Y = 640;
const KNIFE_CONTACT_FRAME = 20;
const CUT_REVEAL_FRAME = 23;

const BOARD_Y = 900;
const BOARD_W = 640;
const BOARD_H = 120;

export const S1Cut: React.FC<{ f: number }> = ({ f }) => {
  const revealed = f >= CUT_REVEAL_FRAME;
  const knifeP = Math.min(1, f / KNIFE_CONTACT_FRAME);
  const knifeY = KNIFE_START_Y + knifeP * (KNIFE_CONTACT_Y - KNIFE_START_Y);
  // 칼이 닿는 순간 살짝 튕기는 임팩트 스케일
  const impact = f >= KNIFE_CONTACT_FRAME && f < KNIFE_CONTACT_FRAME + 6
    ? 1 + 0.05 * Math.sin(((f - KNIFE_CONTACT_FRAME) / 6) * Math.PI)
    : 1;

  // 이 화의 모든 장면은 사과·다이어그램이 화면 공중에 떠 있는 구도라 기본 바닥선(GROUND=1250)이
  // 필요 없다 - 2026-08-09 검수에서 기본 바닥선+바닥면이 사과 단면·다이어그램 한가운데를
  // 가로지르는 결함을 발견해 이 화의 모든 PlainBg 에 ground={null} 을 명시했다.
  return (
    <PlainBg ground={null}>
      {!revealed ? (
        <>
          <div
            style={{
              position: 'absolute', left: CX - BOARD_W / 2, top: BOARD_Y, width: BOARD_W, height: BOARD_H,
              borderRadius: 30, background: C.goldSoft, border: `${9}px solid ${C.ink}`,
            }}
          />
          <div
            style={{
              position: 'absolute', left: CX - 170, top: BOARD_Y - 300, width: 340,
              transform: `scale(${impact})`, transformOrigin: '50% 100%',
            }}
          >
            <Apple width={340} cut={false} />
          </div>
          <Knife style={{ position: 'absolute', left: CX - 70, top: knifeY }} />
        </>
      ) : (
        <div style={{ position: 'absolute', left: CX - 320, top: 520 }}>
          <Apple width={640} cut browning={0} />
        </div>
      )}
    </PlainBg>
  );
};

export const S1_KNIFE_CONTACT_FRAME = KNIFE_CONTACT_FRAME;

/* ---------------- S2: 타임랩스로 갈변 + 캐릭터 리액션 ---------------- */

const BUST_SIZE = 560;
const BUST_LEFT = -70;
const BUST_TOP = 560;
const APPLE_S2_SIZE = 620;
const APPLE_S2_LEFT = CX - APPLE_S2_SIZE / 2 + 60;
const APPLE_S2_TOP = 560;

export const S2Browning: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const browning = progress(f, 8, Math.max(9, frames - 6)) * 0.38;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg ground={null}>
      <div style={{ position: 'absolute', left: APPLE_S2_LEFT, top: APPLE_S2_TOP }}>
        <Apple width={APPLE_S2_SIZE} cut browning={browning} />
      </div>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3/S4 공용: 사과 앵커 + CellMergeDiagram 레이아웃 ---------------- */

const ANCHOR_APPLE_SIZE = 260;
const ANCHOR_APPLE_LEFT = CX - ANCHOR_APPLE_SIZE / 2;
const ANCHOR_APPLE_TOP = 260;

const DIAG_W = 820;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 640;

const DiagramScene: React.FC<{
  f: number;
  lines: CaptionLine[];
  locale: Locale;
  anchorBrowning: number;
  wallProgress?: number;
  mergeProgress?: number;
  catalystProgress?: number;
  reactProgress?: number;
}> = ({ f, lines, locale, anchorBrowning, wallProgress, mergeProgress, catalystProgress, reactProgress }) => {
  const t = f / FPS;
  const line = activeLine(lines, t);
  const s = STRINGS[locale];
  return (
    <PlainBg ground={null}>
      <div style={{ position: 'absolute', left: ANCHOR_APPLE_LEFT, top: ANCHOR_APPLE_TOP }}>
        <Apple width={ANCHOR_APPLE_SIZE} cut browning={anchorBrowning} />
      </div>
      <CellMergeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        leftLabel={s.enzymeLabel} rightLabel={s.colorLabel}
        wallProgress={wallProgress} mergeProgress={mergeProgress}
        catalystProgress={catalystProgress} catalystLabel="O₂"
        reactProgress={reactProgress}
      />
      <Caption line={line} t={t} />
    </PlainBg>
  );
};

/** s3: 정지 - 두 성분이 각자 칸에 분리된 상태 그대로 */
export const S3Separated: React.FC<{ f: number; lines: CaptionLine[]; locale: Locale }> = ({ f, lines, locale }) => (
  <DiagramScene f={f} lines={lines} locale={locale} anchorBrowning={0} />
);

/** s4: 벽이 갈라지고 -> 두 원이 만나고 -> 산소가 합류하고 -> 반응(갈변)이 번진다.
 *  사과 앵커의 browning 도 reactProgress 에 맞춰 같이 옅게 올라가 "지금 이게 사과 안에서
 *  일어나는 일"이라는 연결을 시각적으로 유지한다. */
export const S4React: React.FC<{ f: number; lines: CaptionLine[]; locale: Locale; frames: number }> = ({
  f, lines, locale, frames,
}) => {
  const wallProgress = progress(f, 4, Math.max(5, frames * 0.32));
  const mergeProgress = progress(f, frames * 0.24, Math.max(frames * 0.24 + 1, frames * 0.58));
  const catalystProgress = progress(f, frames * 0.42, Math.max(frames * 0.42 + 1, frames * 0.72));
  const reactProgress = progress(f, frames * 0.62, Math.max(frames * 0.62 + 1, frames * 0.94));
  return (
    <DiagramScene
      f={f} lines={lines} locale={locale} anchorBrowning={reactProgress * 0.32}
      wallProgress={wallProgress} mergeProgress={mergeProgress}
      catalystProgress={catalystProgress} reactProgress={reactProgress}
    />
  );
};

/* ---------------- S5: 레몬즙 비교 ---------------- */

const CMP_APPLE_SIZE = 420;
const CMP_LEFT_X = 70;
const CMP_RIGHT_X = W - 70 - CMP_APPLE_SIZE;
const CMP_TOP = 520;

export const S5Compare: React.FC<{ f: number; lines: CaptionLine[]; locale: Locale; frames: number }> = ({
  f, lines, locale, frames,
}) => {
  const t = f / FPS;
  const line = activeLine(lines, t);
  const s = STRINGS[locale];
  // 왼쪽(레몬즙): 반응이 크게 억제되어 아주 조금만 갈변. 오른쪽(그대로): 정상 속도로 갈변.
  const leftBrowning = progress(f, 10, Math.max(11, frames - 6)) * 0.12;
  const rightBrowning = progress(f, 10, Math.max(11, frames - 6)) * 0.55;
  const coatP = progress(f, 4, 20);

  return (
    <PlainBg ground={null}>
      <div style={{ position: 'absolute', left: CMP_LEFT_X, top: CMP_TOP }}>
        <Apple width={CMP_APPLE_SIZE} cut browning={leftBrowning} />
      </div>
      {/* 레몬즙 코팅 - 옅은 노란 광택 + 반짝임 */}
      <div
        style={{
          position: 'absolute', left: CMP_LEFT_X, top: CMP_TOP, width: CMP_APPLE_SIZE, height: CMP_APPLE_SIZE,
          borderRadius: CMP_APPLE_SIZE / 2, background: C.goldSoft, opacity: coatP * 0.35,
        }}
      />
      <Sparkles
        box={{ x: CMP_LEFT_X - 20, y: CMP_TOP - 20, w: CMP_APPLE_SIZE + 40, h: CMP_APPLE_SIZE + 40 }}
        t={coatP} colorA={C.gold} colorB={C.coral} scale={0.7}
      />
      <div
        style={{
          position: 'absolute', left: CMP_LEFT_X, top: CMP_TOP + CMP_APPLE_SIZE + 30, width: CMP_APPLE_SIZE,
          textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.ink, opacity: coatP,
        }}
      >
        {s.lemonLabel}
      </div>

      <div style={{ position: 'absolute', left: CMP_RIGHT_X, top: CMP_TOP }}>
        <Apple width={CMP_APPLE_SIZE} cut browning={rightBrowning} />
      </div>

      <Caption line={line} t={t} />
    </PlainBg>
  );
};

/* ---------------- S6: 마무리 - idle 복귀 ---------------- */

const S6_APPLE_SIZE = 560;
const S6_APPLE_LEFT = CX - S6_APPLE_SIZE / 2 + 60;
const S6_APPLE_TOP = 560;

export const S6Wrap: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  return (
    <PlainBg ground={null}>
      <div style={{ position: 'absolute', left: S6_APPLE_LEFT, top: S6_APPLE_TOP }}>
        <Apple width={S6_APPLE_SIZE} cut browning={0.55} />
      </div>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={POSES.idle} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
