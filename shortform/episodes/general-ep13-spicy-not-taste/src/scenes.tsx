/** 이 화(general-ep13, "매운맛이 사실 맛이 아닌 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *  스코빌 지수(s7)는 대본 지시대로 구체적 수치를 화면에 노출하지 않고, 고추 아이콘 개수 +
 *  막대 길이 대비로만 "더 매운 정도"를 정성적으로 표현한다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, C, Caption, Card, CardGrid, CompareBars, FEET_VB, FONT, FPS, FS, GROUND,
  KimchiPiece, Label, NerveSignal, PlainBg, POSES, PulseRing, RADIUS, RIG, SW, ThemedIcon, W, blendPose,
  mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CardItem, CaptionLine } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** Actor 배치 공식(Actor.tsx)과 동일한 방식으로, 캐릭터 viewBox(RIG) 위의 한 점을 화면 좌표로
 *  바꾼다. 캐릭터 얼굴 근처에 이펙트(입 열감 펄스, 이마 통증 표시 등)를 겹칠 때 쓴다
 *  (general-ep08 armPatchScreenPos 와 동일 원칙). */
function vbToScreen(pt: { x: number; y: number }, size: number, centerX: number, ground: number, feetVb = FEET_VB) {
  const scale = size / RIG.W;
  return { x: centerX + (pt.x - RIG.CX) * scale, y: ground + (pt.y - feetVb) * scale, scale };
}

/** 중심점 기준으로 팝인하는 아이콘/소품 래퍼.
 *
 *  `Appear`(scenes/Effects.tsx)는 opacity·transform을 감싸는 별도 div에 얹는데, 그 div가
 *  `AbsoluteFill`(display:flex; flexDirection:column)의 flex item이 되면서 내용물이
 *  전부 `position:absolute`인 경우 자기 자신은 높이 0으로 collapse되어 화면 상단 중앙
 *  (transform-origin 50% 50%가 곧 그 지점)으로 쏠린다 - 애니메이션 도중(p<1)에는 아이콘이
 *  의도한 위치가 아니라 화면 위쪽에서 날아오는 것처럼 보이다가 p=1이 돼서야 제자리를 찾는
 *  버그가 실측으로 확인됐다(스코빌 s5 소품 위치가 최대 150px 이상 어긋남). 그래서 이 씬에서
 *  화면에 떠 있는 아이콘을 팝인시킬 때는 `Appear`를 쓰지 않고, position·opacity·transform을
 *  전부 같은 div 하나에 얹는다(Card.tsx·CompareBars.tsx와 동일 원칙 - 좌표를 가진 요소 자신이
 *  애니메이션도 스스로 갖는다). */
const PopIcon: React.FC<{ cx: number; cy: number; size: number; p: number; children: React.ReactNode }> = ({
  cx, cy, size, p, children,
}) => {
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size,
        opacity: Math.min(1, p * 2), transform: `scale(${0.3 + 0.7 * p})`, transformOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- 공용 배경 래퍼 ---------------- */

const Scene: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <PlainBg />
    {children}
  </AbsoluteFill>
);

/* ---------------- S1: 리액션 + 훅 질문 - 매운 음식 한 입, 화들짝 ---------------- */

const S1_ACTOR_SIZE = 800;

// 배추김치 조각(v3 신규) 배치 지점 - 캐릭터 viewBox 상 가슴 높이(RIG.SHOULDER.y=647 과
// RIG.HIP.y=820 사이) 를 기준으로 잡는다. RIG.MOUTH.y(505)보다 화면상 충분히 아래라
// 얼굴과 겹치지 않으면서도(1차 렌더에서 y=900·size=230 으로 뒀더니 캐릭터 발밑 GROUND
// 선(1250)을 뚫고 나가 "김치 대야에 앉은" 것처럼 보이는 결함을 실측 프레임에서 발견 -
// 크기를 줄이고 위치를 올려 가슴 앞에서 들고 있는 크기감으로 재조정했다) 발 밑 GROUND
// 라인과도 겹치지 않도록 크기·위치를 함께 낮춘다. SURPRISED 포즈는 양팔이 위로 번쩍
// 올라가는 동작이라 이 위치에는 손도 겹치지 않는다.
const S1_KIMCHI_VB = { x: RIG.CX, y: 700 };
const S1_KIMCHI_SIZE = 150;

export const S1Reaction: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 10);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const mouthPt = vbToScreen({ x: RIG.MOUTH.cx, y: RIG.MOUTH.y }, S1_ACTOR_SIZE, CX, GROUND);
  const kimchiPt = vbToScreen(S1_KIMCHI_VB, S1_ACTOR_SIZE, CX, GROUND);
  const pulseP = progress(f, 0, 8);
  const kimchiP = progress(f, 0, 8);
  return (
    <Scene>
      <Actor size={S1_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} mouthOpen={mouthOpen} breathAmp={1} />
      {/* 방금 베어문 배추김치 조각 - Actor 다음(위)에 그려야 몸통에 가리지 않는다.
          PopIcon 으로 팝인(원칙: Appear 대신 좌표를 가진 요소 자신이 애니메이션도 갖는다) */}
      <PopIcon cx={kimchiPt.x} cy={kimchiPt.y} size={S1_KIMCHI_SIZE} p={kimchiP}>
        <KimchiPiece width={S1_KIMCHI_SIZE} />
      </PopIcon>
      {/* 열감 펄스는 입 위치에 겹치는 하이라이트라 Actor보다 먼저 그리면 얼굴 몸통에 가려
          안 보인다(S9 통증 표시와 동일한 이유로 렌더 순서를 뒤로 옮김) - Actor 다음(위)에 그린다. */}
      <PulseRing
        x={mouthPt.x - 95} y={mouthPt.y - 95} size={190} frame={f}
        progress={pulseP} color={C.coralSoft} opacity={0.65} periodFrames={30}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S2 · S3 공용: 3x2 미각 카드 그리드 ---------------- */

const GRID_COLS = 3;
const GRID_SIZE = 280;
const GRID_H = 300;
const GRID_GAP = 32;
const GRID_W = GRID_COLS * GRID_SIZE + (GRID_COLS - 1) * GRID_GAP;
const GRID_X = (W - GRID_W) / 2;
const GRID_Y = 600;
/** 이미 등장이 끝난 상태로 고정하고 싶을 때 쓰는 값(ep12 ALREADY_GROWN_AT 과 같은 원칙) */
const ALREADY_IN = -200;

export interface TasteLabels {
  sweet: string; salty: string; sour: string; bitter: string; umami: string;
}

function tasteItems(labels: TasteLabels): CardItem[] {
  return [
    { key: 'sweet', label: labels.sweet, art: <ThemedIcon name="candy" size={130} color={C.coral} /> },
    { key: 'salty', label: labels.salty, art: <ThemedIcon name="salt" size={130} color={C.ink} /> },
    { key: 'sour', label: labels.sour, art: <ThemedIcon name="lemon-2" size={130} color={C.gold} /> },
    { key: 'bitter', label: labels.bitter, art: <ThemedIcon name="coffee" size={130} color={C.ink} /> },
    { key: 'umami', label: labels.umami, art: <ThemedIcon name="meat" size={130} color={C.coral} /> },
  ];
}

function slotPos(i: number) {
  return {
    x: GRID_X + (i % GRID_COLS) * (GRID_SIZE + GRID_GAP),
    y: GRID_Y + Math.floor(i / GRID_COLS) * (GRID_H + GRID_GAP),
  };
}

/* ---------------- S2: 다섯 개 미각이 순서대로 팝인 ---------------- */

export const S2Tastes: React.FC<{ f: number; lines: CaptionLine[]; labels: TasteLabels }> = ({ f, lines, labels }) => (
  <Scene>
    <CardGrid
      items={tasteItems(labels)} x={GRID_X} y={GRID_Y} size={GRID_SIZE} height={GRID_H}
      gap={GRID_GAP} columns={GRID_COLS} appearAt={(i) => 4 + i * 9} frame={f}
      cardProps={{ labelSize: FS.small, artBottom: 78 }}
    />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
  </Scene>
);

/* ---------------- S3: 여섯 번째 칸 "매운맛?" 이 떴다가 취소선과 함께 사라짐 ---------------- */

const SPICY_SLOT_INDEX = 5;

export const S3NoSpicy: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; labels: TasteLabels; spicyText: string;
}> = ({ f, frames, lines, labels, spicyText }) => {
  const slot = slotPos(SPICY_SLOT_INDEX);
  const tagIn = progress(f, Math.round(frames * 0.06), Math.round(frames * 0.26));
  const strikeP = progress(f, Math.round(frames * 0.34), Math.round(frames * 0.54));
  const fadeOut = progress(f, Math.round(frames * 0.74), Math.round(frames * 0.94));
  const cardP = tagIn * (1 - fadeOut);
  return (
    <Scene>
      <CardGrid
        items={tasteItems(labels)} x={GRID_X} y={GRID_Y} size={GRID_SIZE} height={GRID_H}
        gap={GRID_GAP} columns={GRID_COLS} appearAt={() => ALREADY_IN} frame={f}
        cardProps={{ labelSize: FS.small, artBottom: 78 }}
      />
      <div
        style={{
          position: 'absolute', left: slot.x, top: slot.y, width: GRID_SIZE, height: GRID_H,
          background: C.paper, border: `${SW}px solid ${C.ink}`, borderRadius: RADIUS.lg,
          opacity: cardP, transform: `scale(${0.9 + 0.1 * cardP})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 700, fontSize: FS.label, color: C.ink, whiteSpace: 'nowrap' }}>
          {spicyText}
          <div
            style={{
              position: 'absolute', left: '-10%', right: '-10%', top: '50%', height: 8,
              background: C.coral, borderRadius: 4, transformOrigin: 'center',
              transform: `translateY(-50%) scaleX(${strikeP})`,
            }}
          />
        </div>
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S4: 캡사이신 카드 -> 신경 신호 -> 뇌 ---------------- */

const S4_CARD_X = 130;
const S4_CARD_Y = 620;
const S4_CARD_W = 360;
const S4_CARD_H = 420;
const S4_BRAIN = { x: 830, y: 610 };

export const S4Capsaicin: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const cardP = progress(f, 0, 14);
  const brainAt = Math.round(frames * 0.14);
  const brainP = progress(f, brainAt, brainAt + 16);
  const pathAt = Math.round(frames * 0.26);
  const pathDur = Math.round(frames * 0.2);
  const pathP = progress(f, pathAt, pathAt + pathDur);
  const sigAt = pathAt + pathDur;
  const sigDur = Math.round(frames * 0.22);
  const sigP = progress(f, sigAt, sigAt + sigDur);
  const from = { x: S4_CARD_X + S4_CARD_W - 20, y: S4_CARD_Y + S4_CARD_H * 0.42 };
  return (
    <Scene>
      <Card x={S4_CARD_X} y={S4_CARD_Y} w={S4_CARD_W} h={S4_CARD_H} progress={cardP} label={label} labelSize={FS.label}>
        <ThemedIcon name="pepper" size={190} color={C.coral} />
      </Card>
      <PopIcon cx={S4_BRAIN.x} cy={S4_BRAIN.y} size={190} p={brainP}>
        <ThemedIcon name="brain" size={190} color={C.ink} />
      </PopIcon>
      <NerveSignal
        from={from} to={S4_BRAIN} bow={-95} showPath={pathP}
        signalT={pathP > 0.95 ? sigP : undefined}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S5: 뜨거운 냄비 vs 고추 - 같은 경로로 동시에 뇌까지 ---------------- */

const S5_LEFT = { x: 250, y: 780 };
const S5_RIGHT = { x: 830, y: 780 };
const S5_BRAIN = { x: 540, y: 400 };

export const S5DualSignal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const iconP = progress(f, 0, 14);
  const brainP = progress(f, 8, 24);
  const pathAt = Math.round(frames * 0.22);
  const pathDur = Math.round(frames * 0.22);
  const pathP = progress(f, pathAt, pathAt + pathDur);
  const sigAt = pathAt + pathDur;
  const sigDur = Math.round(frames * 0.22);
  const sigP = progress(f, sigAt, sigAt + sigDur);
  const pulseP = iconP;
  return (
    <Scene>
      <PulseRing x={S5_LEFT.x - 90} y={S5_LEFT.y - 90} size={180} frame={f} progress={pulseP} color={C.coralSoft} opacity={0.5} periodFrames={40} />
      <PulseRing x={S5_RIGHT.x - 90} y={S5_RIGHT.y - 90} size={180} frame={f} progress={pulseP} color={C.coralSoft} opacity={0.5} periodFrames={40} />
      <PopIcon cx={S5_LEFT.x} cy={S5_LEFT.y} size={170} p={iconP}>
        <ThemedIcon name="soup" size={170} color={C.ink} />
      </PopIcon>
      <PopIcon cx={S5_RIGHT.x} cy={S5_RIGHT.y} size={170} p={iconP}>
        <ThemedIcon name="pepper" size={170} color={C.coral} />
      </PopIcon>
      <PopIcon cx={S5_BRAIN.x} cy={S5_BRAIN.y} size={190} p={brainP}>
        <ThemedIcon name="brain" size={190} color={C.ink} />
      </PopIcon>
      <NerveSignal from={S5_LEFT} to={S5_BRAIN} bow={-75} showPath={pathP} signalT={pathP > 0.95 ? sigP : undefined} />
      <NerveSignal from={S5_RIGHT} to={S5_BRAIN} bow={75} showPath={pathP} signalT={pathP > 0.95 ? sigP : undefined} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S6: 땀방울 + 심장이 같은 박자로 맥동 ---------------- */

const S6_ACTOR_SIZE = 640;
const S6_DROPLET_OFFSET = { dx: -230, dy: -70 };
const S6_HEART_OFFSET = { dx: 230, dy: -70 };

export const S6SweatHeart: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  const headPt = vbToScreen({ x: RIG.HEAD_CX, y: RIG.HEAD_CY }, S6_ACTOR_SIZE, CX, GROUND);
  const dropletPt = { x: headPt.x + S6_DROPLET_OFFSET.dx, y: headPt.y + S6_DROPLET_OFFSET.dy };
  const heartPt = { x: headPt.x + S6_HEART_OFFSET.dx, y: headPt.y + S6_HEART_OFFSET.dy };
  const iconP = progress(f, 0, 12);
  return (
    <Scene>
      <PulseRing x={dropletPt.x - 80} y={dropletPt.y - 80} size={160} frame={f} progress={iconP} color={C.coralSoft} opacity={0.5} periodFrames={26} />
      <PulseRing x={heartPt.x - 80} y={heartPt.y - 80} size={160} frame={f} progress={iconP} color={C.coralSoft} opacity={0.5} periodFrames={26} />
      <PopIcon cx={dropletPt.x} cy={dropletPt.y} size={130} p={iconP}>
        <ThemedIcon name="droplets" size={130} color={C.ink} />
      </PopIcon>
      <PopIcon cx={heartPt.x} cy={heartPt.y} size={130} p={iconP}>
        <ThemedIcon name="heart" size={130} color={C.coral} />
      </PopIcon>
      <Actor size={S6_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={POSES.idle} mouthOpen={mouthOpen} breathAmp={1} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S7: 고추 3종 매운 정도 막대(정성적) + 스코빌 지수 라벨 ---------------- */

const BARS_X = 170;
const BARS_Y = 800;
const ROW_GAP = 180;
const LABEL_GAP = 54;
const BAR_THICKNESS = 54;
const PX_PER_UNIT = 42;

const PepperRow: React.FC<{ count: number }> = ({ count }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {Array.from({ length: count }).map((_, i) => (
      <ThemedIcon key={i} name="pepper" size={40} color={C.coral} />
    ))}
  </div>
);

export const S7Scoville: React.FC<{ f: number; lines: CaptionLine[]; label: string }> = ({ f, lines, label }) => {
  const labelP = progress(f, 6, 22);
  const items = [
    { label: <PepperRow count={1} />, value: 4, at: 8, color: C.coral, thickness: BAR_THICKNESS },
    { label: <PepperRow count={2} />, value: 8, at: 28, color: C.coral, thickness: BAR_THICKNESS },
    { label: <PepperRow count={3} />, value: 13, at: 52, color: C.coral, thickness: BAR_THICKNESS },
  ];
  return (
    <Scene>
      <div style={{ opacity: labelP }}>
        <Label
          x={CX} y={430} text={label} size={FS.label} color={C.paper} align="center"
          style={{ background: C.coral, border: `${SW}px solid ${C.ink}`, borderRadius: 999, padding: '16px 44px' }}
        />
      </div>
      <CompareBars
        x={BARS_X} y={BARS_Y} pxPerUnit={PX_PER_UNIT} rowGap={ROW_GAP} labelGap={LABEL_GAP}
        frame={f} items={items} minLength={40}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S8: 물(X) vs 우유(체크) - 지방 방울이 우유 쪽으로 이동 ---------------- */

const S8_PEPPER = { x: CX, y: 380 };
const S8_WATER = { x: 130, y: 600, w: 380, h: 520 };
const S8_MILK = { x: 570, y: 600, w: 380, h: 520 };

export const S8WaterMilk: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; waterLabel: string; milkLabel: string;
}> = ({ f, frames, lines, waterLabel, milkLabel }) => {
  const pepperP = progress(f, 0, 12);
  const cardP = progress(f, 8, 24);
  const badgeAt = Math.round(frames * 0.42);
  const badgeP = progress(f, badgeAt, badgeAt + 10);
  const dropAt = Math.round(frames * 0.5);
  const dropDur = Math.round(frames * 0.3);
  const pathP = progress(f, dropAt, dropAt + Math.round(dropDur * 0.5));
  const sigP = progress(f, dropAt + Math.round(dropDur * 0.5), dropAt + dropDur);
  const dropFrom = { x: S8_PEPPER.x, y: S8_PEPPER.y + 75 };
  const dropTo = { x: S8_MILK.x + S8_MILK.w / 2, y: S8_MILK.y };
  return (
    <Scene>
      <PopIcon cx={S8_PEPPER.x} cy={S8_PEPPER.y} size={150} p={pepperP}>
        <ThemedIcon name="pepper" size={150} color={C.coral} />
      </PopIcon>
      <Card
        x={S8_WATER.x} y={S8_WATER.y} w={S8_WATER.w} h={S8_WATER.h} progress={cardP}
        label={waterLabel} labelSize={FS.label} badgeColor={C.paper}
        badge={badgeP > 0.4 ? <ThemedIcon name="x" size={54} color={C.ink} /> : undefined}
      >
        <ThemedIcon name="glass-full" size={190} color={C.inkSoft} />
      </Card>
      <Card
        x={S8_MILK.x} y={S8_MILK.y} w={S8_MILK.w} h={S8_MILK.h} progress={cardP}
        label={milkLabel} labelSize={FS.label} badgeColor={C.goldSoft}
        badge={badgeP > 0.4 ? <ThemedIcon name="check" size={54} color={C.ink} /> : undefined}
      >
        <ThemedIcon name="milk" size={190} color={C.ink} />
      </Card>
      <NerveSignal
        from={dropFrom} to={dropTo} bow={90} showPath={pathP} signalT={pathP > 0.9 ? sigP : undefined}
        dotColor={C.gold} strokeWidth={7}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S9: 캐릭터 복귀 - 미각 아이콘은 흐려지고 통증 표시만 밝게 ---------------- */

const S9_ACTOR_SIZE = 760;
const S9_ICON_SIZE = 70;
const S9_ROW_Y = 380;
const S9_GAP = 26;
const S9_TASTE_ICONS = ['candy', 'salt', 'lemon-2', 'coffee', 'meat'] as const;

export const S9Recap: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's9', f));
  const fadeAt = Math.round(frames * 0.1);
  const fadeDur = Math.round(frames * 0.5);
  const fadeP = progress(f, fadeAt, fadeAt + fadeDur);
  const iconOpacity = 1 - 0.75 * fadeP;
  const painP = progress(f, 0, 14);
  // 이마(RIG의 얼굴 상단 근처, HeadNerveDiagram의 FOREHEAD_PT와 같은 원리) 위치를 화면
  // 좌표로 변환한다. 통증 표시는 캐릭터 "얼굴 위"에 남아야 하는 하이라이트라, Actor보다
  // 먼저 그리면 캐릭터 몸통에 가려 안 보인다(실측으로 확인) - 그래서 Actor 다음(위)에 그린다.
  const foreheadPt = vbToScreen({ x: RIG.HEAD_CX, y: 317 }, S9_ACTOR_SIZE, CX, GROUND);
  const total = S9_TASTE_ICONS.length * S9_ICON_SIZE + (S9_TASTE_ICONS.length - 1) * S9_GAP;
  const startX = CX - total / 2;
  return (
    <Scene>
      {S9_TASTE_ICONS.map((n, i) => (
        <div
          key={n}
          style={{ position: 'absolute', left: startX + i * (S9_ICON_SIZE + S9_GAP), top: S9_ROW_Y, opacity: iconOpacity }}
        >
          <ThemedIcon name={n} size={S9_ICON_SIZE} color={C.inkSoft} />
        </div>
      ))}
      <Actor size={S9_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={POSES.idle} mouthOpen={mouthOpen} breathAmp={1} />
      <PulseRing x={foreheadPt.x - 60} y={foreheadPt.y - 60} size={120} frame={f} progress={painP} color={C.coralSoft} opacity={0.8} periodFrames={30} />
      <div style={{ position: 'absolute', left: foreheadPt.x - 38, top: foreheadPt.y - 38, opacity: painP }}>
        <ThemedIcon name="bolt" size={76} color={C.coral} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
