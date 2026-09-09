/** 이 화(general-ep15, "양파를 썰면 눈물이 나는 진짜 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  s3(세포가 터지며 효소와 황 성분이 만나는 과정)은 general-ep04(사과 갈변)를 위해 만든
 *  CellMergeDiagram("분리된 두 요소가 벽이 갈라지며 만나 반응한다")을 그대로 재사용한다
 *  (원칙 0 - REGISTRY 확인 결과 새로 만들지 않음). 다이어그램 자체에는 없는 "위로 피어오르는
 *  기체 구름"만 이 화 로컬 GasCloud 로 보강해 얹는다 - s3/s4/s5/s6 에서 반복 재사용한다.
 */
import React from 'react';
import { interpolateColors } from 'remotion';
import {
  Appear, BustActor, C, Caption, CellMergeDiagram, FPS, Label, PlainBg, POSES, SW,
  Sparkles, ThemedIcon, W, blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 삼각 envelope(0 -> 1 -> 0). 마늘 쪽 "잠깐 생겼다 바로 사라지는" 기체를 표현할 때 씀
 *  (ep11 FolderSnap 의 bump 와 동일 패턴, 화 전용이라 로컬로 다시 둔다). */
function bump(f: number, at: number, dur: number) {
  const rise = progress(f, at, at + dur * 0.4);
  const fall = 1 - progress(f, at + dur * 0.4, at + dur);
  return Math.min(rise, fall);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ---------------- 칼 (이 화 전용 - ep04 Knife 와 같은 정신, 재사용 소재 아님) ----------------
 * 손잡이가 위, 칼날이 아래로 뾰족해지는 모양 - 위에서 아래로 내리찍는 동작에 맞춘 형태. */
const Knife: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 140 260" width={130} style={style}>
    <rect x={46} y={4} width={48} height={92} rx={16} fill={C.ink} />
    <path
      d="M 44 96 L 96 96 L 70 252 Z"
      fill={C.hillFar} stroke={C.ink} strokeWidth={9} strokeLinejoin="round"
    />
  </svg>
);

/* ---------------- 양파 (이 화 전용) ---------------- */

const Onion: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <svg viewBox="0 0 220 240" width={width} style={style}>
    <path
      d="M110,50
         C150,50 186,92 186,152
         C186,204 152,226 110,226
         C68,226 34,204 34,152
         C34,92 70,50 110,50 Z"
      fill={C.goldSoft} stroke={C.ink} strokeWidth={SW * 0.7} strokeLinejoin="round"
    />
    {/* 세로 결 (양파 껍질 무늬) */}
    <path d="M110,54 C96,96 96,182 110,224" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.28} />
    <path d="M110,54 C124,96 124,182 110,224" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.28} />
    {/* 새싹 (위) */}
    <path d="M110,50 C108,30 116,16 110,4" fill="none" stroke={C.leaf} strokeWidth={9} strokeLinecap="round" />
    {/* 뿌리 (아래) */}
    <g stroke={C.inkSoft} strokeWidth={3.5} strokeLinecap="round" opacity={0.6}>
      <path d="M92,224 L86,238" />
      <path d="M110,226 L110,240" />
      <path d="M128,224 L134,238" />
    </g>
  </svg>
);

/* ---------------- 마늘 (이 화 전용) ---------------- */

const Garlic: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <svg viewBox="0 0 220 220" width={width} style={style}>
    <path
      d="M110,40
         C158,40 194,80 194,132
         C194,178 156,204 110,204
         C64,204 26,178 26,132
         C26,80 62,40 110,40 Z"
      fill={C.hillFar} stroke={C.ink} strokeWidth={SW * 0.7} strokeLinejoin="round"
    />
    {/* 쪽 나누는 선(clove) */}
    {[-52, -26, 0, 26, 52].map((dx) => (
      <path
        key={dx}
        d={`M${110 + dx},48 C${104 + dx},96 ${104 + dx},170 ${110 + dx},200`}
        fill="none" stroke={C.ink} strokeWidth={3} opacity={0.3}
      />
    ))}
    {/* 위 꼭지 */}
    <path d="M110,40 C108,24 114,12 110,2" fill="none" stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" />
    {/* 뿌리 */}
    <g stroke={C.inkSoft} strokeWidth={3} strokeLinecap="round" opacity={0.55}>
      <path d="M90,202 L84,216" />
      <path d="M110,204 L110,218" />
      <path d="M130,202 L136,216" />
    </g>
  </svg>
);

/* ---------------- 숫돌 (이 화 전용) ---------------- */

const Whetstone: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <svg viewBox="0 0 300 110" width={width} style={style}>
    <rect x={10} y={10} width={280} height={90} rx={18} fill={C.room} stroke={C.ink} strokeWidth={SW * 0.6} />
    <rect x={30} y={30} width={240} height={16} rx={8} fill={C.roomDeep} opacity={0.7} />
  </svg>
);

/* ---------------- 기체 구름 (이 화 로컬, s3~s6 반복 재사용) ----------------
 * "눈을 자극하는 기체가 피어오른다"는 이 화 전체를 관통하는 시각 모티프라 컴포넌트 하나로
 * s3(세포에서 발생) -> s4(눈까지 이동) -> s5(차갑게/칼갈기로 작아짐) -> s6(마늘은 거의 없음)
 * 4곳에서 반복 재사용한다. x/y 를 호출부가 매 프레임 계산해서 넘기므로 "제자리에서 피어오름"
 * 이든 "이동하며 피어오름"이든 호출부 책임으로 자유롭게 쓸 수 있다. */
const GasCloud: React.FC<{ x: number; y: number; growP: number; scale?: number; frame: number }> = ({
  x, y, growP, scale = 1, frame,
}) => {
  const p = clamp01(growP);
  if (p <= 0.01) return null;
  const sway = Math.sin(frame / 16) * 8 * scale;
  const opacity = Math.min(1, p * 1.5) * 0.6;
  const s = (0.55 + 0.45 * p) * scale;
  return (
    <div
      style={{
        position: 'absolute', left: x + sway, top: y, opacity,
        transform: `translate(-50%,-50%) scale(${s})`, filter: 'blur(3px)', pointerEvents: 'none',
      }}
    >
      <svg width={170} height={140} viewBox="-85 -70 170 140" style={{ overflow: 'visible' }}>
        <circle cx={-34} cy={8} r={44} fill={C.leaf} />
        <circle cx={12} cy={-16} r={52} fill={C.leaf} />
        <circle cx={44} cy={6} r={38} fill={C.leaf} />
        <circle cx={2} cy={24} r={40} fill={C.leaf} />
      </svg>
    </div>
  );
};

/* ---------------- S1: 도마 위 양파를 칼로 썰기 시작 (무성) ---------------- */

const CUT_POSE: Pose = {
  headTilt: -5, lean: 3,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -60, e: -30 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

// 바스트(위쪽)와 도마+칼(아래쪽)을 Y 구간으로 완전히 분리해 겹침을 원천 차단한다 - 처음
// 버전은 전신 Actor 를 크게 세우고 칼을 얼굴 위로 지나가게 했다가 칼끝이 얼굴을 관통하는
// 결함이 나왔다(2026-08-20 검수). 좌표를 미세조정하는 대신 "겹칠 수 없는 배치"로 바꿨다 -
// 바스트가 차지하는 Y 범위(BUST_TOP ~ BUST_TOP+BUST_SIZE)와 칼의 Y 범위가 항상 떨어져
// 있도록 칼의 시작점을 바스트 하단보다 아래로 고정한다.
const S1_BUST_SIZE = 680;
const S1_BUST_LEFT = CX - S1_BUST_SIZE / 2;
const S1_BUST_TOP = 180; // 바스트 하단 = 180+680 = 860

// 세로 9:16 하단이 비어 보이지 않도록(원칙 5 체크리스트) 도마 구성을 화면 중하단까지 크게
// 채운다 - 1차 버전은 도마 아래로 빈 여백이 과도했다(2026-08-20 검수).
const BOARD_Y = 1600;
const BOARD_W = 760;
const BOARD_H = 170;
const BOARD_X = CX - BOARD_W / 2;
const ONION_SIZE = 230;
const ONION_X = CX - ONION_SIZE / 2;
const ONION_Y = BOARD_Y - ONION_SIZE + 26;

const KNIFE_TIP_OFFSET = 234; // svg 상단에서 칼끝까지 (viewBox 260 높이 기준, width=130 렌더 시 실측)
const KNIFE_CONTACT_Y = ONION_Y + 20 - KNIFE_TIP_OFFSET; // 칼끝이 양파 위쪽을 살짝 파고드는 지점
const KNIFE_START_Y = 900; // 바스트 하단(860)보다 아래 - 항상 860을 넘지 않도록 유지
const KNIFE_X = CX - 65;

/** 칼끝이 양파에 닿는 프레임 (down 이 1에 도달). Episode.tsx 가 chop.mp3 를 여기에 정확히
 *  맞춰 재생한다(원칙 7 - 무성 구간 핵심 액션에는 짧은 효과음, ep04 KNIFE_CONTACT_FRAME과 동일 패턴). */
export const S1_KNIFE_CONTACT_FRAME = 32;

export const S1Cut: React.FC<{ f: number }> = ({ f }) => {
  const down = progress(f, 4, 32);
  const riseBack = progress(f, 34, 56);
  const knifeY = KNIFE_START_Y + (KNIFE_CONTACT_Y - KNIFE_START_Y) * down - 36 * riseBack;
  const squish = 1 - 0.12 * bump(f, 30, 20);
  const poseT = progress(f, 0, 22);
  // 아래(도마)를 내려다보는 느낌으로 고개를 살짝 숙인다
  const pose: Pose = { ...blendPose(POSES.idle, CUT_POSE, poseT), headTilt: 14 };

  return (
    <PlainBg ground={1830} groundColor={C.hill} floorOpacity={0.9}>
      <BustActor size={S1_BUST_SIZE} left={S1_BUST_LEFT} top={S1_BUST_TOP} pose={pose} />
      <div
        style={{
          position: 'absolute', left: BOARD_X, top: BOARD_Y, width: BOARD_W, height: BOARD_H,
          borderRadius: 26, background: C.goldSoft, border: `${SW}px solid ${C.ink}`,
        }}
      />
      <div
        style={{
          position: 'absolute', left: ONION_X, top: ONION_Y, width: ONION_SIZE,
          transform: `scaleY(${squish})`, transformOrigin: '50% 100%',
        }}
      >
        <Onion width={ONION_SIZE} />
      </div>
      <Knife style={{ position: 'absolute', left: KNIFE_X, top: knifeY }} />
    </PlainBg>
  );
};

/* ---------------- S2: 눈가에 눈물이 맺히는 리액션 (바스트샷) ---------------- */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;
// 바스트샷 viewBox(BUST_VIEWBOX="236 132 780 780") 안에서 화면 오른쪽 눈(캐릭터 본인 기준
// 왼쪽 눈, RIG.CX+102, RIG.EYE.y=442.5) 이 놓이는 화면 좌표. scale = BUST_SIZE/780.
const EYE_SCREEN_X = BUST_LEFT + (728.5 - 236) * (BUST_SIZE / 780);
const EYE_SCREEN_Y = BUST_TOP + (442.5 - 132) * (BUST_SIZE / 780);

export const S2Cry: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, poseT);
  const tearP = progress(f, 12, 30);
  const dropY = 22 * progress(f, 42, frames);

  return (
    <PlainBg>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      {tearP > 0.01 ? (
        <Appear progress={tearP} from="scale" origin="50% 0%">
          <div
            style={{
              position: 'absolute', left: EYE_SCREEN_X - 28, top: EYE_SCREEN_Y + 24 + dropY,
            }}
          >
            <ThemedIcon name="droplet" size={58} color={C.sky} strokePx={11} />
          </div>
        </Appear>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 세포가 터지며 효소 + 황 성분이 만나 기체가 생김 ---------------- */

const DIAG_W = 720;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 540;
const DIAG_SCALE = DIAG_W / 800;
const DIAG_MERGE_X = DIAG_X + 400 * DIAG_SCALE;
const DIAG_MERGE_Y = DIAG_Y + 420 * DIAG_SCALE;

export const S3Merge: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; enzymeLabel: string; sulfurLabel: string;
}> = ({ f, frames, lines, enzymeLabel, sulfurLabel }) => {
  const line = activeLine(lines, f / FPS);
  const wallProgress = progress(f, 6, Math.round(frames * 0.3));
  const mergeProgress = progress(f, Math.round(frames * 0.22), Math.round(frames * 0.55));
  const reactProgress = progress(f, Math.round(frames * 0.5), Math.round(frames * 0.92));
  const gasRise = 130 * clamp01((reactProgress - 0.15) / 0.85);

  return (
    <PlainBg ground={null}>
      <GasCloud
        x={DIAG_MERGE_X} y={DIAG_MERGE_Y - 70 - gasRise} growP={reactProgress} frame={f}
      />
      <CellMergeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        leftLabel={enzymeLabel} rightLabel={sulfurLabel}
        leftColor={C.coral} rightColor={C.gold}
        wallProgress={wallProgress} mergeProgress={mergeProgress} reactProgress={reactProgress}
        reactColor={C.leaf}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 기체가 눈까지 올라가 눈물과 만나 자극 성분으로 ---------------- */

const S4_EYE_SIZE = 230;
const S4_EYE_X = W - 300 - S4_EYE_SIZE;
const S4_EYE_Y = 560;
const S4_EYE_CX = S4_EYE_X + S4_EYE_SIZE / 2;
const S4_EYE_CY = S4_EYE_Y + S4_EYE_SIZE / 2;
const S4_GAS_START = { x: CX - 60, y: 1220 };

export const S4Reach: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const travelP = progress(f, 6, Math.round(frames * 0.76));
  const gasX = lerp(S4_GAS_START.x, S4_EYE_CX, travelP);
  const gasY = lerp(S4_GAS_START.y, S4_EYE_CY, travelP);
  const growIn = progress(f, 4, 20);
  const fadeOut = progress(f, Math.round(frames * 0.82), frames);
  const gasP = Math.min(growIn, 1 - fadeOut);
  const contactP = progress(f, Math.round(frames * 0.72), Math.round(frames * 0.72) + 18);
  const eyeColor = interpolateColors(contactP, [0, 1], [C.ink, C.coral]) as unknown as string;
  const haloP = bump(f, Math.round(frames * 0.74), 22);

  return (
    <PlainBg ground={null}>
      {haloP > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: S4_EYE_CX, top: S4_EYE_CY, width: S4_EYE_SIZE * 1.35,
            height: S4_EYE_SIZE * 1.35, transform: 'translate(-50%,-50%)', borderRadius: '50%',
            background: C.coralSoft, opacity: haloP * 0.6, filter: 'blur(4px)',
          }}
        />
      ) : null}
      <ThemedIcon
        name="eye" size={S4_EYE_SIZE} color={eyeColor}
        style={{ position: 'absolute', left: S4_EYE_X, top: S4_EYE_Y }}
      />
      <GasCloud x={gasX} y={gasY} growP={gasP} frame={f} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 차갑게 / 칼 갈기 - 화면 분할 비교 ---------------- */

const S5_LEFT_CX = CX - 270;
const S5_RIGHT_CX = CX + 270;
const S5_ICON_Y = 760;

export const S5Tips: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; chillLabel: string; sharpenLabel: string;
}> = ({ f, frames, lines, chillLabel, sharpenLabel }) => {
  const line = activeLine(lines, f / FPS);
  const appearL = progress(f, 6, 22);
  const appearR = progress(f, 12, 28);
  const gasSmallGrow = progress(f, Math.round(frames * 0.4), Math.round(frames * 0.7)) * 0.55;
  const slide = Math.sin(f / 6) * 16;
  const sparkT = (Math.sin(f / 10) + 1) / 2;
  const labelP = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.3) + 16);

  return (
    <PlainBg ground={null}>
      <div
        style={{
          position: 'absolute', left: CX - 2, top: 600, width: 4, height: 560, background: C.hill,
        }}
      />

      {/* 왼쪽: 차갑게 (얼음이 양파를 감싼다) */}
      <Appear progress={appearL} from="scale" origin="50% 50%">
        <ThemedIcon
          name="snowflake" size={280} color={C.sky} strokePx={14}
          style={{ position: 'absolute', left: S5_LEFT_CX - 140, top: S5_ICON_Y - 140, opacity: 0.7 }}
        />
        <Onion
          width={150}
          style={{ position: 'absolute', left: S5_LEFT_CX - 75, top: S5_ICON_Y - 75 }}
        />
      </Appear>
      <GasCloud x={S5_LEFT_CX + 90} y={S5_ICON_Y - 150} growP={gasSmallGrow} scale={0.5} frame={f} />
      <Appear progress={labelP} from="up">
        <Label x={S5_LEFT_CX} y={S5_ICON_Y + 180} text={chillLabel} size={48} align="center" wrapWidth={420} />
      </Appear>

      {/* 오른쪽: 칼을 잘 갈아서 쓰기 */}
      <Appear progress={appearR} from="scale" origin="50% 50%">
        <Whetstone
          width={300}
          style={{ position: 'absolute', left: S5_RIGHT_CX - 150, top: S5_ICON_Y - 20 }}
        />
        <div
          style={{
            position: 'absolute', left: S5_RIGHT_CX - 60 + slide, top: S5_ICON_Y - 120,
            transform: 'rotate(72deg)',
          }}
        >
          <Knife style={{ width: 90 }} />
        </div>
      </Appear>
      <Sparkles
        box={{ x: S5_RIGHT_CX - 60, y: S5_ICON_Y - 40, w: 120, h: 80 }} t={sparkT * appearR}
        colorA={C.gold} colorB={C.coral} scale={0.7}
      />
      <GasCloud x={S5_RIGHT_CX + 90} y={S5_ICON_Y - 150} growP={gasSmallGrow} scale={0.5} frame={f} />
      <Appear progress={labelP} from="up">
        <Label x={S5_RIGHT_CX} y={S5_ICON_Y + 180} text={sharpenLabel} size={48} align="center" wrapWidth={420} />
      </Appear>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 마늘과 비교 - 마늘은 기체가 거의 안 생김 ---------------- */

const S6_LEFT_CX = CX - 190;
const S6_RIGHT_CX = CX + 190;
const S6_BASE_Y = 900;

export const S6Garlic: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const garlicAppearP = progress(f, 4, 20);
  const onionGasGrow = progress(f, Math.round(frames * 0.25), Math.round(frames * 0.85));
  const onionGasRise = 110 * clamp01((onionGasGrow - 0.1) / 0.9);
  const garlicGasP = bump(f, Math.round(frames * 0.3), 22) * 0.35;

  return (
    <PlainBg ground={null}>
      <GasCloud
        x={S6_LEFT_CX} y={S6_BASE_Y - 130 - onionGasRise} growP={onionGasGrow} frame={f}
      />
      <Onion width={220} style={{ position: 'absolute', left: S6_LEFT_CX - 110, top: S6_BASE_Y - 110 }} />

      <GasCloud x={S6_RIGHT_CX} y={S6_BASE_Y - 130 - 16 * garlicGasP} growP={garlicGasP} scale={0.6} frame={f} />
      <Appear progress={garlicAppearP} from="scale" origin="50% 50%">
        <Garlic width={210} style={{ position: 'absolute', left: S6_RIGHT_CX - 105, top: S6_BASE_Y - 100 }} />
      </Appear>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 눈에서 눈물이 뚝뚝 떨어지며 마무리 ---------------- */

const S7_EYE_SIZE = 280;
const S7_EYE_X = CX - S7_EYE_SIZE / 2;
const S7_EYE_Y = 560;
const S7_TEAR_OFFSETS = [0, 26, 52];
const S7_TEAR_DX = [-30, 34, 4];

export const S7Drip: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const eyeInP = progress(f, 0, 12);

  return (
    <PlainBg ground={null}>
      <Appear progress={eyeInP} from="scale" origin="50% 50%">
        <ThemedIcon
          name="eye" size={S7_EYE_SIZE} color={C.coral}
          style={{ position: 'absolute', left: S7_EYE_X, top: S7_EYE_Y }}
        />
      </Appear>
      {S7_TEAR_OFFSETS.map((offset, i) => {
        const lf = f - offset;
        if (lf < 0) return null;
        const cyclePos = (lf % 60) / 60;
        const y = S7_EYE_Y + S7_EYE_SIZE * 0.6 + cyclePos * 300;
        const opacity = cyclePos < 0.8 ? 1 : Math.max(0, (1 - cyclePos) / 0.2);
        return (
          <ThemedIcon
            key={i}
            name="droplet" size={46} color={C.sky}
            style={{
              position: 'absolute', left: CX + S7_TEAR_DX[i] - 23, top: y, opacity: opacity * eyeInP,
            }}
          />
        );
      })}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
