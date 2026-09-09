/** 이 화(general-ep81, "울고 나면 입가가 짭짤한 이유") 전용 장면.
 *
 *  s1(BustActor가 손등으로 눈물을 훔치다 무심코 핥아보는 동작, 무성) -> s2(BustActor 리액션
 *  "어? 눈물 맛보니까 짜네. 눈물은 왜 짤까?") -> s3(TearDropDiagram - 눈물방울 단면 + 소금
 *  알갱이 최대 2개) -> s4(CompareBars - 눈물·혈액·땀 염분 농도 비교, "약 0.9%" 공통 라벨) ->
 *  s5(CardGrid - 기초/반사/감정 눈물 3종) -> s6(감정 눈물 카드 확대 + 반짝임) -> s7(BustActor가
 *  다시 손등으로 눈물을 훔치는 마무리 리액션, 립싱크).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 눈물방울 안 소금 결정은 1~2개만(TearDropDiagram, saltRevealProgress) - 점 무리 금지.
 *   - 눈물이 볼을 타고 입가까지 흐르는 경로는 별도로 그리지 않는다 - s1/s7이 BustActor
 *     클로즈업이라 뺨을 타고 흐르는 긴 경로를 그릴 화면 공간이 없고, "손등으로 훔치는" 동작
 *     자체로 "눈물이 흘렀다"는 것을 충분히 읽을 수 있어 별도 선을 추가하지 않았다.
 *   - 평소 눈물(기초)과 감정 눈물의 차이는 카드 라벨 + 아이콘(하트)로만 가볍게 구분한다.
 *     성분표·그래프 등 복잡한 비교는 만들지 않는다.
 *   - 우는 표정은 과장하지 않는다 - TOUCH_FOREHEAD(기존 포즈, 새 리깅 없음)의 살짝 찡그린
 *     정도로만 표현하고, 눈물방울 아이콘(SweatDroplet 재사용)도 큰 것 1개만 잠깐 비춘다.
 *
 *  새 REGISTRY 자산은 TearDropDiagram(props/) 하나뿐이다. 손 위치를 정밀 추적한 소품 부착은
 *  general-ep58(눈 비비기)이 이미 "정확한 손 좌표 없이 독립 박스로 배치"한 선례를 따라
 *  SweatDroplet도 손 좌표 역산 없이 얼굴 옆 고정 박스에 둔다.
 */
import React from 'react';
import {
  BustActor, C, Card, CardGrid, Caption, FPS, FS, Label, PlainBg, POSES, RADIUS, SW_THIN,
  Sparkles, SweatDroplet, TearDropDiagram, ThemedIcon, W,
  BarItem, CompareBars,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
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
 * S1: 손등으로 눈물을 훔치다 무심코 핥아보는 동작 (바스트샷, 무성)
 * ============================================================ */
const S1_BUST_SIZE = 950;
const S1_BUST_LEFT = (W - S1_BUST_SIZE) / 2;
const S1_BUST_TOP = 470;
const S1_DROPLET_X = CX + 300;
const S1_DROPLET_Y = 560;

export const S1Wipe: React.FC<{ f: number }> = ({ f }) => {
  // 손이 올라와 눈가를 훔치고(0~40%) -> 잠깐 머물다(40~65%) -> 살짝 내려오며 맛을 본다(65~100%)
  const riseT = smooth(progress(f, 0, 24));
  const settleT = smooth(progress(f, 34, 50));
  const handT = Math.max(riseT * (1 - settleT * 0.35), 0);
  const pose: Pose = blendPose(POSES.idle, POSES.touchForehead, handT);
  // 손등에 묻은 눈물방울은 훔치는 동안만 보이다가, 맛보는 순간(핥기) 사라진다
  const dropletA = smooth(progress(f, 10, 22)) * (1 - smooth(progress(f, 44, 56)));
  // 핥아보는 순간 입이 살짝 벌어졌다 오므라든다
  const mouthOpen = 0.05 + 0.28 * smooth(progress(f, 42, 50)) * (1 - smooth(progress(f, 54, 60)));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S1_BUST_SIZE} left={S1_BUST_LEFT} top={S1_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <SweatDroplet x={S1_DROPLET_X} y={S1_DROPLET_Y} size={70} opacity={dropletA} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어? 눈물 맛보니까 짜네. 눈물은 왜 짤까?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={POSES.touchForehead} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 눈물방울 단면 - 대부분 물 + 작은 소금 알갱이 1~2개
 * ============================================================ */
const S3_DROP_W = 520;
const S3_DROP_X = CX - S3_DROP_W / 2;
const S3_DROP_Y = 500;

export const S3Droplet: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const saltP = smooth(progress(f, Math.round(frames * 0.28), Math.round(frames * 0.8)));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <TearDropDiagram width={S3_DROP_W} x={S3_DROP_X} y={S3_DROP_Y} saltRevealProgress={saltP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 눈물·혈액·땀 염분 농도 비교 (CompareBars, "약 0.9%" 공통 라벨)
 * ============================================================ */
export const S4Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = progress(f, Math.round(frames * 0.62), Math.round(frames * 0.8));

  const items: BarItem[] = [
    { label: t.s4TearLabel, value: 90, color: C.waterCool, at: 6 },
    { label: t.s4BloodLabel, value: 90, color: C.coral, at: Math.round(frames * 0.22) },
    { label: t.s4SweatLabel, value: 90, color: C.gold, at: Math.round(frames * 0.42) },
  ];

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CompareBars
        items={items} x={200} y={480} pxPerUnit={6.4} rowGap={200} labelGap={60} frame={f}
        stroke={C.ink} labelColor={C.ink} labelSize={FS.small} minLength={0}
      />
      <Label
        x={CX} y={1220} text={t.s4ValueLabel} size={FS.label} color={C.ink}
        style={{ opacity: clamp01(labelA) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 눈물 세 종류 카드 (기초 / 반사 / 감정) - CardGrid
 * ============================================================ */
const S5_CARD_SIZE = 300;
const S5_GAP = 30;
const S5_COLS = 3;
const S5_GRID_W = S5_CARD_SIZE * S5_COLS + S5_GAP * (S5_COLS - 1);
const S5_GRID_X = CX - S5_GRID_W / 2;
const S5_GRID_Y = 620;

function TearTypeArt({ secondary, secondaryColor }: { secondary: string; secondaryColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <ThemedIcon name="eye" size={108} color={C.ink} />
      <ThemedIcon name={secondary} size={62} color={secondaryColor} />
    </div>
  );
}

export const S5Types: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  void frames;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CardGrid
        items={[
          { key: 'basal', label: t.s5BasalLabel, art: <TearTypeArt secondary="droplet" secondaryColor={C.waterCool} /> },
          { key: 'reflex', label: t.s5ReflexLabel, art: <TearTypeArt secondary="wind" secondaryColor={C.inkSoft} /> },
          { key: 'emotional', label: t.s5EmotionalLabel, art: <TearTypeArt secondary="heart-filled" secondaryColor={C.coral} /> },
        ]}
        x={S5_GRID_X} y={S5_GRID_Y} size={S5_CARD_SIZE} gap={S5_GAP} columns={S5_COLS}
        appearAt={(i) => 6 + i * 14} frame={f}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 감정 눈물 카드 확대 + 호르몬 입자(반짝임)
 * ============================================================ */
const S6_CARD_SIZE = 660;
const S6_CARD_X = CX - S6_CARD_SIZE / 2;
const S6_CARD_Y = 560;

export const S6Emotional: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const cardP = smooth(progress(f, 0, 22));
  const sparkleT = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.85));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Card
        x={S6_CARD_X} y={S6_CARD_Y} w={S6_CARD_SIZE} h={S6_CARD_SIZE} progress={cardP}
        label={t.s5EmotionalLabel} labelSize={FS.label} border={C.ink} borderWidth={SW_THIN}
        radius={RADIUS.lg}
      >
        <ThemedIcon name="eye" size={240} color={C.ink} />
        <div style={{ position: 'absolute', right: S6_CARD_SIZE * 0.16, bottom: S6_CARD_SIZE * 0.3 }}>
          <ThemedIcon name="heart-filled" size={120} color={C.coral} />
        </div>
      </Card>
      <Sparkles
        box={{ x: S6_CARD_X, y: S6_CARD_Y, w: S6_CARD_SIZE, h: S6_CARD_SIZE }}
        t={sparkleT} colorA={C.gold} colorB={C.coral} scale={0.9}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 다시 손등으로 눈물을 훔치는 마무리 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S7_BUST_SIZE = 950;
const S7_BUST_LEFT = (W - S7_BUST_SIZE) / 2;
const S7_BUST_TOP = 460;

export const S7Wipe: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S7_BUST_SIZE} left={S7_BUST_LEFT} top={S7_BUST_TOP} pose={POSES.touchForehead} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
