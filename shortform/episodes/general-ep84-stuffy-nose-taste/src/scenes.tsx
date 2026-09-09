/** 이 화(general-ep84, "코가 막히면 음식 맛이 안 느껴지는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(BustActor가 코를 훌쩍이며 음식을 한 입 먹는데 표정이 밍밍함, 무성) -> s2(BustActor
 *  리액션 "어? 이거 원래 이런 맛이었나. 왜 아무 맛도 안 나지?") -> s3(CardGrid - 다섯 기본
 *  미각 아이콘이 순서대로 팝인) -> s4(같은 그리드가 남은 채 Actor가 아래에서 위로 가리킴,
 *  립싱크) -> s5(SmellTasteDiagram - 입에서 목구멍 뒤쪽을 타고 코로 올라가는 경로,
 *  pathwayProgress) -> s6(같은 다이어그램, 코가 막혀 경로가 끊김 - blocked) -> s7(다섯
 *  미각 아이콘은 그대로 밝고, 나머지 풍미(체리·커피 아이콘)는 옅어지는 대비) -> s8(BustActor가
 *  코를 막고 사탕을 먹으며 무슨 맛인지 모르겠다는 표정, 립싱크).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 혀->코 경로는 굵은 선 하나(SmellTasteDiagram)로만 표현하고, 코가 막히는 것은 그 선이
 *     중간(SMELL_TASTE_BREAK_PT)에서 끊기는 형태로 단순하게 보여준다.
 *   - 해부도를 사실적으로 그리지 않는다 - SmellTasteDiagram은 HeadNerveDiagram과 같은 원칙
 *     (BustActor 위에 오버레이만, 새 얼굴 형태를 그리지 않음).
 *   - 다섯 기본 맛은 CardGrid 아이콘 + 라벨로 담백하게 표현한다(ep13과 동일한 아이콘 선택 -
 *     candy/salt/lemon-2/coffee/meat, REGISTRY 확인 완료로 새로 만들지 않음).
 *
 *  s5·s6은 BustActor 클로즈업 다이어그램 장면이라 HeadNerveDiagram·SneezeReflexDiagram과
 *  같은 관례로 립싱크를 넣지 않는다(원칙 - 다이어그램이 초점인 장면은 얼굴이 아니라 다이어그램이
 *  주인공). 캐릭터가 실제로 프레임에 등장해 말하는 s2·s4·s8만 mouthAt/mouthProp을 쓴다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CardGrid, FPS, FS, Label, NOSE_PT, PlainBg, POSES, QMark,
  RIG, SmellTasteDiagram, ThemedIcon, W, GROUND,
  blendPose, clamp01, mouthAt, mouthProp, progress, sway,
} from '../../../assets';
import type { CaptionLine, CardItem, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/** BustActor 위 오버레이 좌표(BUST_VIEWBOX 기준)를 화면 좌표로 바꾼다.
 *  SmellTasteDiagram·HeadNerveDiagram과 동일한 크롭(BUST_VIEWBOX='236 132 780 780')을
 *  전제로 한다 - 새 좌표를 지어내지 않고 기존 MOUTH_PT/NOSE_PT를 그대로 재사용할 때 쓴다. */
const BUST_VB_X = 236;
const BUST_VB_Y = 132;
const BUST_VB_SIZE = 780;
function bustPt(pt: { x: number; y: number }, size: number, left: number, top: number) {
  const scale = size / BUST_VB_SIZE;
  return { x: left + (pt.x - BUST_VB_X) * scale, y: top + (pt.y - BUST_VB_Y) * scale };
}

/* ============================================================
 * S1: 코를 훌쩍이며 음식을 한 입 먹는데 표정이 밍밍함 (바스트샷, 무성)
 * ============================================================ */
const S1_BUST_SIZE = 950;
const S1_BUST_LEFT = (W - S1_BUST_SIZE) / 2;
const S1_BUST_TOP = 470;

export const S1Bite: React.FC<{ f: number }> = ({ f }) => {
  // 훌쩍임(0~0.7s, 살짝 고개 흔들림) -> 한 입 먹음(0.7~1.6s, 입이 벌어졌다 닫힘) ->
  // 밍밍한 표정으로 정지(1.6~2.6s)
  const sniffT = progress(f, 2, 20);
  const biteOpen = progress(f, 26, 40);
  const biteClose = progress(f, 40, 55);
  const mouthOpen = 0.05 + 0.55 * biteOpen * (1 - biteClose);
  const headTilt = (POSES.idle.headTilt ?? 0) + 3 * Math.sin(sniffT * Math.PI * 3) * (1 - sniffT);
  const settleT = progress(f, 56, 72);

  const pose: Pose = {
    ...POSES.idle,
    headTilt,
    mouthOpen,
    eyeOpen: 1 - 0.15 * settleT,
  };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S1_BUST_SIZE} left={S1_BUST_LEFT} top={S1_BUST_TOP} pose={pose} />
    </PlainBg>
  );
};

/** s1 안에서 훌쩍이는 순간(sniff_snort)과 한 입 먹는 순간(bite)의 로컬 프레임 -
 *  Episode.tsx가 SFX를 이 프레임에 맞춰 배치한다(원칙 7) */
export const S1_SNIFF_SFX_AT_FRAME = 2;
export const S1_BITE_SFX_AT_FRAME = 34;

/* ============================================================
 * S2: "어? 이거 원래 이런 맛이었나. 왜 아무 맛도 안 나지?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const puzzleT = progress(f, 0, 18);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3 · S4 공용: 3x2 미각 카드 그리드 (다섯 칸만 채움, ep13과 동일 아이콘 선택)
 * ============================================================ */
const GRID_COLS = 3;
const GRID_SIZE = 230;
const GRID_H = 250;
const GRID_GAP = 26;
const GRID_W = GRID_COLS * GRID_SIZE + (GRID_COLS - 1) * GRID_GAP;
const GRID_X = (W - GRID_W) / 2;
/** S3·S4·S7 모두 같은 Y를 쓴다. 처음엔 S3/S7(캐릭터 없음)은 680, S4(캐릭터 있음)는 220으로
 *  다르게 뒀었는데, 최종 mp4의 S3->S4 전환 프레임(크로스페이드 구간)에서 두 그리드가 서로
 *  다른 위치에 겹쳐 그려져 순간적으로 "그리드가 2개"로 보이는 결함을 실측으로 확인해
 *  하나로 통일했다(단순 포즈 블렌드 잔상보다 뚜렷한 이중 그리드라 판단해 수정 - S4의
 *  Actor 크기를 500으로 줄여 그리드 아래 공간을 확보했다) */
const GRID_Y = 320;
/** 이미 등장이 끝난 상태로 고정(ep12 ALREADY_GROWN_AT과 같은 원칙) */
const ALREADY_IN = -200;

function tasteItems(): CardItem[] {
  return [
    { key: 'sweet', label: t.tasteSweet, art: <ThemedIcon name="candy" size={110} color={C.coral} /> },
    { key: 'salty', label: t.tasteSalty, art: <ThemedIcon name="salt" size={110} color={C.ink} /> },
    { key: 'sour', label: t.tasteSour, art: <ThemedIcon name="lemon-2" size={110} color={C.gold} /> },
    { key: 'bitter', label: t.tasteBitter, art: <ThemedIcon name="coffee" size={110} color={C.ink} /> },
    { key: 'umami', label: t.tasteUmami, art: <ThemedIcon name="meat" size={110} color={C.coral} /> },
  ];
}

/* ---------------- S3: 다섯 미각 아이콘이 순서대로 팝인 ---------------- */

export const S3Tastes: React.FC<SceneProps> = ({ f, lines }) => {
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CardGrid
        items={tasteItems()} x={GRID_X} y={GRID_Y} size={GRID_SIZE} height={GRID_H}
        gap={GRID_GAP} columns={GRID_COLS} appearAt={(i) => 4 + i * 9} frame={f}
        cardProps={{ labelSize: FS.small, artBottom: 66 }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 그리드가 남은 채 캐릭터가 아래에서 위로 가리킴 (립싱크) ---------------- */
const S4_ACTOR_SIZE = 500;

export const S4Point: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const raiseT = progress(f, 0, 20);
  const pose: Pose = blendPose(POSES.idle, POSES.pointUp, raiseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's4', f));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <CardGrid
        items={tasteItems()} x={GRID_X} y={GRID_Y} size={GRID_SIZE} height={GRID_H}
        gap={GRID_GAP} columns={GRID_COLS} appearAt={() => ALREADY_IN} frame={f}
        cardProps={{ labelSize: FS.small, artBottom: 66 }}
      />
      <Actor size={S4_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} mouthOpen={mouthOpen} breathAmp={1} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 입 -> 목구멍 뒤쪽 -> 코로 올라가는 경로 (SmellTasteDiagram, pathwayProgress)
 * ============================================================ */
const S5_BUST_SIZE = 950;
const S5_BUST_LEFT = (W - S5_BUST_SIZE) / 2;
const S5_BUST_TOP = 460;

export const S5Pathway: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const pathwayP = progress(f, 10, Math.max(24, frames - 20));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SmellTasteDiagram
        f={f} width={S5_BUST_SIZE} x={S5_BUST_LEFT} y={S5_BUST_TOP}
        pathwayProgress={pathwayP} blocked={0}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 코가 막혀 경로가 중간에서 끊김 (SmellTasteDiagram, blocked)
 * ============================================================ */
export const S6Blocked: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  // s5에서 이어지는 상태를 명시적으로 유지한다(원칙: 다음 장면에서 이전 상태 리셋 금지) -
  // pathwayProgress=1로 "경로는 이미 다 드러난 상태"에서 시작하고, blocked만 0->1로 자란다
  const blockedP = progress(f, 6, Math.max(20, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SmellTasteDiagram
        f={f} width={S5_BUST_SIZE} x={S5_BUST_LEFT} y={S5_BUST_TOP}
        pathwayProgress={1} blocked={blockedP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 다섯 미각 아이콘만 밝게, 나머지 풍미(체리·커피)는 옅어지는 대비
 * ============================================================ */
const S7_FLAVOR_Y = 900;
const S7_CHERRY_X = CX - 150;
const S7_COFFEE_X = CX + 150;

export const S7Contrast: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const fadeP = progress(f, Math.round(frames * 0.18), Math.round(frames * 0.72));
  const flavorOpacity = 1 - 0.82 * fadeP;
  const flavorGray = fadeP;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CardGrid
        items={tasteItems()} x={GRID_X} y={GRID_Y} size={GRID_SIZE} height={GRID_H}
        gap={GRID_GAP} columns={GRID_COLS} appearAt={() => ALREADY_IN} frame={f}
        cardProps={{ labelSize: FS.small, artBottom: 66 }}
      />
      <div
        style={{
          position: 'absolute', left: S7_CHERRY_X - 60, top: S7_FLAVOR_Y - 60, width: 120, height: 120,
          opacity: flavorOpacity, filter: `grayscale(${flavorGray})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ThemedIcon name="cherry" size={100} color={C.coral} />
      </div>
      <div
        style={{
          position: 'absolute', left: S7_COFFEE_X - 60, top: S7_FLAVOR_Y - 60, width: 120, height: 120,
          opacity: flavorOpacity, filter: `grayscale(${flavorGray})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ThemedIcon name="coffee" size={100} color={C.coral} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 코를 막고 사탕을 먹으며 "무슨 맛인지 모르겠다" (바스트샷, 립싱크)
 * ============================================================ */
const S8_BUST_SIZE = 950;
const S8_BUST_LEFT = (W - S8_BUST_SIZE) / 2;
const S8_BUST_TOP = 460;

export const S8Confused: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const pinchT = progress(f, 0, 22);
  const pose: Pose = blendPose(POSES.idle, POSES.touchForehead, pinchT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's8', f));

  const nosePt = bustPt(NOSE_PT, S8_BUST_SIZE, S8_BUST_LEFT, S8_BUST_TOP);
  const mouthPt = bustPt({ x: RIG.MOUTH.cx, y: RIG.MOUTH.y }, S8_BUST_SIZE, S8_BUST_LEFT, S8_BUST_TOP);

  const pinchMarkA = progress(f, 8, 26);
  const candyA = progress(f, 14, 30) * (1 - progress(f, Math.round(frames * 0.5), Math.round(frames * 0.66)));
  const qMarkA = clamp01(progress(f, Math.round(frames * 0.58), Math.round(frames * 0.8)));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S8_BUST_SIZE} left={S8_BUST_LEFT} top={S8_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />

      {/* 코를 막았다는 표시 - SmellTasteDiagram의 X 표시와 같은 시각 언어(코가 막힘) */}
      {pinchMarkA > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: nosePt.x - 34, top: nosePt.y - 34, width: 68, height: 68,
            opacity: pinchMarkA, borderRadius: 34, background: C.paper, border: `${6}px solid ${C.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ThemedIcon name="x" size={44} color={C.coral} strokePx={10} />
        </div>
      ) : null}

      {/* 입에 문 사탕 */}
      {candyA > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: mouthPt.x + 46, top: mouthPt.y - 30, width: 90, height: 90,
            opacity: candyA, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ThemedIcon name="candy" size={80} color={C.gold} />
        </div>
      ) : null}

      {qMarkA > 0.01 ? (
        <QMark size={110} style={{ left: S8_BUST_LEFT + S8_BUST_SIZE * 0.66, top: S8_BUST_TOP - 40, opacity: qMarkA }} />
      ) : null}

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
