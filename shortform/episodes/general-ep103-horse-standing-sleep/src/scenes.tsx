/** 이 화(general-ep103, "말이 서서 잠을 자는 이유") 전용 장면. 문구는 전부 strings.ts 에서
 *  읽는다(언어 무관 컴포넌트).
 *
 *  s1(초원, 말이 서서 눈을 살짝 감고 조는 모습, 무성) -> s2(BustActor 리액션 "왜 안 쓰러지지?")
 *  -> s3(말 전신 + PulseRing + 도주 대기 동작선 - "늘 도망칠 준비가 되어 있어야 하는 동물")
 *  -> s4(HorseLegLockDiagram lockProgress - 무릎·발목에 걸쇠가 순차 팝인) -> s5(같은 다이어그램
 *  muscleFadeProgress - 넓적다리 근육 하이라이트가 옅어짐, 걸쇠는 유지) -> s6(달 아이콘 + 서 있는
 *  말 옆에 작게 누운 말 실루엣 - "하루 중 잠깐은 누워야 해요") -> s7(다시 서서 조는 말 +
 *  고개를 끄덕이는 캐릭터로 마무리).
 *
 *  이 화의 시각 주의사항:
 *   - 새 동물(Horse)·다이어그램(HorseLegLockDiagram)은 신체 내부를 사실적으로 그리지 않고
 *     단순 캡슐 도형 위에 상태 표시(하이라이트·자물쇠 아이콘)만 얹는다(LegNerveDiagram과
 *     동일 원칙, "신체 표현은 최소한으로").
 *   - 걸쇠(자물쇠) 아이콘은 tabler-cache.json에 'lock'이 없어 다이어그램 안에 직접 그린
 *     단순 모양으로 대체했다(대본의 대체 지시를 따름, HorseLegLockDiagram.tsx 참고).
 *   - s4->s5는 같은 다이어그램을 재사용하며 lockProgress를 s5에서도 1로 유지한다(ep23 교훈 -
 *     다음 장면에서 이전 상태를 명시적으로 유지하지 않으면 순간적으로 리셋된 것처럼 보인다).
 *   - s7의 캐릭터는 대사 없이 고개만 끄덕이는 자세라 립싱크(mouthOpen)를 연결하지 않는다
 *     (대본이 "고개를 끄덕이며 정리하는 자세"로 명시 - 말하는 장면이 아니다).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, GROUND, PlainBg, POSES, PulseRing, SavannaBg, ThemedIcon, W,
  blendPose, breathe, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import {
  HORSE_LYING_VB_H, HORSE_LYING_VB_W, HORSE_STANDING_GROUND_VB, HORSE_STANDING_VB_H,
  HORSE_STANDING_VB_W, Horse, HorseLying,
} from '../../../assets/props/Horse';
import { HorseLegLockDiagram } from '../../../assets/props/HorseLegLockDiagram';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** Horse(viewBox 640x780, 발굽 vb y=740)를 화면 좌표에 세운다(Actor의 grounding 계산과 동일
 *  원칙 - 정확한 비율로 발굽을 바닥선에 맞춘다). */
function horseStyle(centerX: number, renderWidth: number, groundY: number = GROUND): React.CSSProperties {
  const h = (renderWidth * HORSE_STANDING_VB_H) / HORSE_STANDING_VB_W;
  const footFrac = HORSE_STANDING_GROUND_VB / HORSE_STANDING_VB_H;
  return { position: 'absolute', left: centerX - renderWidth / 2, top: groundY - h * footFrac, width: renderWidth };
}

/** HorseLying(viewBox 480x220)을 화면 좌표에 놓는다. 몸통 바닥이 viewBox 하단 근처라
 *  top = groundY - height 로 충분하다. */
function horseLyingStyle(leftX: number, renderWidth: number, groundY: number = GROUND): React.CSSProperties {
  const h = (renderWidth * HORSE_LYING_VB_H) / HORSE_LYING_VB_W;
  return { position: 'absolute', left: leftX, top: groundY - h, width: renderWidth };
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 초원, 말이 서서 눈을 살짝 감고 조는 모습 (무성)
 * ============================================================ */
const S1_HORSE_W = 620;
/** 야외 무성 구간 - 바람에 풀이 스치는 배경음(leaf_rustle, 원칙 7, 재사용).
 *  Episode.tsx가 이 상수를 그대로 쓴다. */
export const S1_RUSTLE_AT = 24;

export const S1Doze: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const b = breathe(f, 0.8);
  return (
    <>
      <SavannaBg />
      <div style={{ ...horseStyle(CX, S1_HORSE_W), transform: `translateY(${b.dy}px) scale(${b.scale})`, transformOrigin: '50% 95%' }}>
        <Horse width={S1_HORSE_W} eyesClosed={0.72} />
      </div>
    </>
  );
};

/* ============================================================
 * S2: "어, 저 말 눈 감고 조는 거 같은데. 왜 안 쓰러지지?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;
const S2_HORSE_W = 230;
const S2_HORSE_X = W - 300;
const S2_HORSE_GROUND = 1420;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = blendPose(POSES.idle, POSES.thinking, 0.85);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      {/* 지금 얘기하고 있는 그 말 - s3~s5가 설명할 대상을 먼저 눈에 담아둔다 */}
      <div style={horseStyle(S2_HORSE_X, S2_HORSE_W, S2_HORSE_GROUND)}>
        <Horse width={S2_HORSE_W} eyesClosed={0.7} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 말 전신 + 도망칠 준비 강조 (PulseRing + 뒷다리 쪽 동작선)
 * ============================================================ */
const S3_HORSE_W = 560;
const S3_RING_SIZE = 620;
/** 말 렌더 박스 세로 중심(horseStyle(CX, S3_HORSE_W) 계산과 동일 비율) 근처에 링을 겹친다 */
const S3_RING_Y = 630;

/** 뒷다리 쪽에 짧게 트레일링되는 동작선 - "늘 도망칠 준비가 되어 있다"는 긴장감을 장식적으로만
 *  표현한다(동물 종류 무관 범용화 없이 이 장면 전용 - 지역성 우선). frame 기반 결정적 sin으로만
 *  움직인다(Math.random 미사용, 원칙 3). */
const DASH_Y = [1180, 1230, 1280];
const DashTrail: React.FC<{ x: number; f: number }> = ({ x, f }) => (
  <svg width={220} height={160} style={{ position: 'absolute', left: x, top: 1150, overflow: 'visible' }}>
    {DASH_Y.map((dy, i) => {
      const wob = 0.5 + 0.5 * Math.sin(f / 5 + i * 1.6);
      const len = 60 + 50 * wob;
      const localY = dy - 1150;
      return (
        <line
          key={i} x1={200} y1={localY} x2={200 - len} y2={localY}
          stroke={C.inkSoft} strokeWidth={9} strokeLinecap="round" opacity={0.35 + 0.35 * wob}
        />
      );
    })}
  </svg>
);

export const S3Ready: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const ringP = progress(f, 4, Math.max(24, frames - 20));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={GROUND} groundColor={C.hill}>
      <PulseRing x={CX - S3_RING_SIZE / 2} y={S3_RING_Y} size={S3_RING_SIZE} frame={f}
        progress={ringP} color={C.coralSoft} opacity={0.5} />
      <DashTrail x={CX - 330} f={f} />
      <div style={horseStyle(CX, S3_HORSE_W)}>
        <Horse width={S3_HORSE_W} eyesClosed={0} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 다리 클로즈업 - 무릎·발목에 걸쇠가 순차 팝인
 * ============================================================ */
const S4_DIAG_W = 440;
const S4_DIAG_X = CX - S4_DIAG_W / 2;
const S4_DIAG_Y = 260;

export const S4Lock: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const lockP = progress(f, 8, Math.max(30, frames - 14));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HorseLegLockDiagram width={S4_DIAG_W} x={S4_DIAG_X} y={S4_DIAG_Y}
        lockProgress={lockP} muscleFadeProgress={0} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 같은 다리 - 넓적다리 근육 하이라이트가 옅어짐 (걸쇠는 유지)
 * ============================================================ */
export const S5Relax: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const fadeP = progress(f, 6, Math.max(24, frames - 12));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HorseLegLockDiagram width={S4_DIAG_W} x={S4_DIAG_X} y={S4_DIAG_Y}
        lockProgress={1} muscleFadeProgress={fadeP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 달 아이콘 + 서 있는 말 옆에 작게 누운 말 실루엣
 * ============================================================ */
const S6_STAND_W = 460;
const S6_STAND_X = CX - 150;
const S6_LYING_W = 250;
const S6_LYING_X = CX + 90;
const S6_MOON_X = 800;
const S6_MOON_Y = 140;

export const S6Nap: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const moonP = progress(f, 4, 26);
  const lyingP = progress(f, 14, 40);
  return (
    <>
      <SavannaBg />
      <div style={{ position: 'absolute', left: S6_MOON_X, top: S6_MOON_Y, opacity: moonP }}>
        <ThemedIcon name="moon" size={120} color={C.inkSoft} />
      </div>
      <div style={horseStyle(S6_STAND_X, S6_STAND_W)}>
        <Horse width={S6_STAND_W} eyesClosed={0.5} />
      </div>
      <div style={{
        ...horseLyingStyle(S6_LYING_X, S6_LYING_W),
        opacity: lyingP, transform: `scale(${0.82 + 0.18 * lyingP})`, transformOrigin: '50% 100%',
      }}>
        <HorseLying width={S6_LYING_W} />
      </div>
      <Caption line={line} t={f / FPS} />
    </>
  );
};

/* ============================================================
 * S7: 다시 서서 조는 말 + 고개를 끄덕이는 캐릭터로 마무리
 * ============================================================ */
const S7_HORSE_W = 540;
const S7_HORSE_X = CX - 120;
const S7_ACTOR_SIZE = 520;
const S7_ACTOR_X = CX + 300;

export const S7Final: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  /** 대사 없이 고개만 끄덕이는 자세 - 립싱크 없음(대본이 "정리하는 자세"로 명시) */
  const nodPose: Pose = { ...POSES.idle, headTilt: (POSES.idle.headTilt ?? 0) + Math.sin(f / 11) * 6 };
  return (
    <>
      <SavannaBg />
      <div style={horseStyle(S7_HORSE_X, S7_HORSE_W)}>
        <Horse width={S7_HORSE_W} eyesClosed={0.75} />
      </div>
      <Actor size={S7_ACTOR_SIZE} centerX={S7_ACTOR_X} pose={nodPose} />
      <Caption line={line} t={f / FPS} />
    </>
  );
};
