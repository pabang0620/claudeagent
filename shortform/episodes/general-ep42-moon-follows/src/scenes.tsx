/** 이 화(general-ep42, "차 타고 가면 달이 계속 따라오는 이유") 전용 장면.
 *
 *  s1(무성 - 밤에 자전거로 달림, 가로수는 빠르게 스치는데 달은 같은 자리) -> s2(리액션+
 *  훅질문 "달은 왜 계속 따라오지?", 바스트샷 유성 - 립싱크 연결) -> s3(ParallaxDiagram
 *  nearAngleProgress 단독 - 가까운 나무를 보는 각도가 크게 바뀜) -> s4(가로수·건물이 반복
 *  스쳐 지나가는 모습, ScrollingLayer 재사용) -> s5(ParallaxDiagram distanceProgress -
 *  지구-달 거리) -> s6(ParallaxDiagram near+far 동시 - 짧은 이동 vs 거의 0인 각도 대비) ->
 *  s7(s1과 같은 구도로 복귀, 달이 그대로인 모습 + 유성 자막) -> s8(ParallaxDiagram near+far
 *  재사용, 기차 창밖 논밭/산 대비).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 가까운 것과 먼 달의 이동 속도 대비가 핵심이라
 *  s1/s7의 나무는 빠르게, 달은 완전히 고정으로 그린다. 밤하늘 별은 성기게(NightSkyBg
 *  stars 낮은 값). 거리 축척은 사실적으로 그리지 않고 굵은 선·각도로 단순화한다
 *  (ParallaxDiagram 자체가 이 원칙을 구현).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, NightSkyBg, ParallaxDiagram, PlainBg,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = 540; // W/2
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = Math.max(0, Math.min(1, v));
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * 공용: 밤거리 스크롤 레이어 (가까운 가로수는 빠르게, 먼 건물 실루엣은 느리게)
 * ================================================================ */

function ScrollingSilhouettes({
  f, groundY, speed, spacing, kind, color, scaleBase,
}: {
  f: number; groundY: number; speed: number; spacing: number;
  kind: 'tree' | 'block'; color: string; scaleBase: number;
}) {
  const offset = ((f * speed) % spacing + spacing) % spacing;
  const count = Math.ceil(1080 / spacing) + 3;
  const items = Array.from({ length: count }, (_, i) => {
    const x = -spacing + i * spacing - offset;
    const s = scaleBase * (i % 2 === 0 ? 1 : 0.82);
    return { x, s, i };
  });
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      {items.map(({ x, s, i }) => (
        kind === 'tree' ? (
          <g key={i} transform={`translate(${x} ${groundY}) scale(${s})`}>
            <rect x={-9} y={-46} width={18} height={46} fill={color} rx={4} />
            <polygon points="-52,-42 52,-42 0,-168" fill={color} />
          </g>
        ) : (
          <g key={i} transform={`translate(${x} ${groundY}) scale(${s})`}>
            <rect x={-46} y={-190} width={92} height={190} fill={color} rx={6} />
          </g>
        )
      ))}
    </svg>
  );
}

/* ================================================================
 * S1 / S7 공용: 밤에 자전거로 달리는 장면 (달은 고정, 가로수는 빠르게 스침)
 * ================================================================ */

const NIGHT_GROUND = 1380;
const MOON_X = 760;
const MOON_Y = 300;
const MOON_R = 108;

/** 자전거를 사실적으로 태우려면 새 다리 리깅이 필요해지는데(팔다리 각도만으로는 페달을
 *  밟는 자세가 부자연스럽게 겹쳐 보임 - 1차 스틸 확인으로 실측), 이 화의 핵심은 "가까운
 *  것과 먼 달의 이동 속도 대비"이지 자전거 그 자체가 아니다. bike 아이콘을 캐릭터 옆에
 *  따로 배치해봤지만 스쳐가는 나무 실루엣과 색이 겹치는 프레임에서 뒤엉켜 보여
 *  ("완전히 다른 방식으로 바꾼다" 원칙 - 신체 표현은 최소한으로) 아예 빼고, 캐릭터는
 *  단순한 서 있는 자세(살짝 앞으로 기움)만 유지한다 - "달리는 이동" 자체는 빠르게 스치는
 *  나무·건물과 고정된 달의 대비만으로 전달된다(이 화면이 담당하는 핵심 시각 포인트). */
const RIDE_POSE: Pose = {
  headTilt: -3, lean: 7,
  armL: { s: 58, e: 40 }, armR: { s: -58, e: -40 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

function NightBikeScene({ f }: { f: number }) {
  const settleT = smooth(progress(f, 0, 16));
  const pose = blendPose({}, RIDE_POSE, settleT);
  const bob = Math.sin(f / 7) * 5;

  return (
    <>
      <NightSkyBg
        stars={16} seed={21} frame={f} moon={1} moonX={MOON_X} moonY={MOON_Y} moonR={MOON_R}
        horizon={NIGHT_GROUND - 60}
      />
      <ScrollingSilhouettes
        f={f} groundY={NIGHT_GROUND + 40} speed={4} spacing={340} kind="block"
        color={C.nightMid} scaleBase={0.9}
      />
      <ScrollingSilhouettes
        f={f} groundY={NIGHT_GROUND} speed={24} spacing={230} kind="tree"
        color={C.nightSoft} scaleBase={1.05}
      />
      <Actor size={640} centerX={330} ground={NIGHT_GROUND + bob} pose={pose} color={C.cream} />
    </>
  );
}

export const S1MoonRide: React.FC<{ f: number }> = ({ f }) => <NightBikeScene f={f} />;

export const S7MoonSteady: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  return (
    <>
      <NightBikeScene f={f} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </>
  );
};

/* ================================================================
 * S2: 리액션 - "어, 달은 왜 계속 따라오지?" (바스트샷, 립싱크 연결)
 * ================================================================ */

const S2_SIZE = 900;
const S2_LEFT = CX - S2_SIZE / 2;
const S2_TOP = 420;

const LOOK_UP_POSE: Pose = {
  headTilt: -10, lean: -4,
  armL: { s: 50, e: 30 }, armR: { s: -108, e: -22 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
  eyeOpen: 1.1,
};

export const S2Question: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const reactT = smooth(progress(f, 0, frames * 0.4));
  const pose = blendPose({}, LOOK_UP_POSE, reactT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <BustActor size={S2_SIZE} left={S2_LEFT} top={S2_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 가까운 나무를 보는 각도가 짧은 이동만으로 크게 바뀐다 (근거리 단독)
 * ================================================================ */

const DIAG_W = 760;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 560;

export const S3NearAngle: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const nP = smooth(progress(f, frames * 0.1, frames * 0.85));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <ParallaxDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} nearAngleProgress={nP} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 가로수·건물이 반복해서 화면 옆으로 빠르게 스쳐 지나간다
 * ================================================================ */

export const S4PassingScenery: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const groundY = 1560;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={groundY + 60} groundColor={C.hill}>
      <ScrollingSilhouettes
        f={f} groundY={groundY - 340} speed={5} spacing={360} kind="block"
        color={C.hillFar} scaleBase={1.3}
      />
      <ScrollingSilhouettes
        f={f} groundY={groundY} speed={30} spacing={200} kind="tree"
        color={C.hill} scaleBase={1.9}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 지구-달 사이 거리 (ParallaxDiagram distanceProgress)
 * ================================================================ */

export const S5MoonDistance: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const dP = smooth(progress(f, frames * 0.12, frames * 0.9));
  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <ParallaxDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y - 40} distanceProgress={dP}
        distanceLabel={t.distanceLabel}
        stroke={C.cream} mutedStroke={C.nightSoft} fill={C.nightMid}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 짧은 이동(근거리 자리 재사용) vs 거의 0인 각도(원거리) 대비
 * ================================================================ */

export const S6TinyChange: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const nP = smooth(progress(f, frames * 0.1, frames * 0.85));
  const fP = smooth(progress(f, frames * 0.16, frames * 0.9));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <ParallaxDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        nearAngleProgress={nP} farAngleProgress={fP}
        nearIcon="map-pin" farIcon="moon"
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S8: 기차 창밖 - 가까운 논밭 vs 먼 산 (ParallaxDiagram near+far 재사용)
 * ================================================================ */

export const S8TrainCompare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const nP = smooth(progress(f, frames * 0.1, frames * 0.85));
  const fP = smooth(progress(f, frames * 0.16, frames * 0.9));
  return (
    <PlainBg top={C.sky} bottom={C.leaf}>
      <ParallaxDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        nearAngleProgress={nP} farAngleProgress={fP}
        nearIcon="plant" farIcon="mountain"
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
