/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(무성, 고양이가 무릎 위에서 편안히 골골) -> s2(리액션+훅 질문, 립싱크)
 *  -> s3(성대 근육이 빠르게 떨림) -> s4(들숨/날숨 양방향 - 성대 틈 여닫힘)
 *  -> s5(결론, 새 그래픽 없이 s4 상태 유지) -> s6(아플 때도 골골 - 대비)
 *  -> s7(속설: 회복에 도움된다는 얘기, 원칙 1-2 가드레일 - "그런 얘기도 있대요" 배지)
 *
 *  s2만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json 립싱크를 쓴다(원칙 - ep24/ep07과
 *  동일). s3~s7은 3인칭 설명 내레이션이 다이어그램/고양이 위에 흐르는 구간이라 립싱크를
 *  쓰지 않는다.
 */
import React from 'react';
import {
  Actor, C, Caption, CatFull, CatPurrDiagram, CAT_STANDING_GROUND_VB, CAT_STANDING_VB_W,
  CAT_PURR_LABEL_PT, CAT_PURR_VB_W, FONT, FPS, FS, GROUND, Label, NerveSignal, PlainBg, POSES,
  PopIn, RADIUS, ScentWaves, SW, ThemedIcon,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 화면에 떠 있는 알약 배지. 등장(position+opacity+transform)을 한 div 에 결합해
 *  `Appear` 안에 absolute 자식을 넣는 함정(REGISTRY 4절 주의문)을 피한다(ep19/ep21과 동일 패턴).
 *  s6/s7 라벨에 쓴다. */
function pillBadgeStyle(x: number, y: number, p: number): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `translateX(-50%) translateY(${(1 - cp) * -16}px) scale(${0.85 + 0.15 * cp})`,
    opacity: cp, background: C.gold, border: `${Math.round(SW * 0.6)}px solid ${C.ink}`,
    borderRadius: RADIUS.pill, padding: '12px 34px', fontFamily: FONT, fontWeight: 700,
    fontSize: FS.small, color: C.ink, whiteSpace: 'nowrap', wordBreak: 'keep-all',
  };
}

function catGroundY(width: number) {
  return GROUND - (CAT_STANDING_GROUND_VB / CAT_STANDING_VB_W) * width;
}

/* ---------------- S1: 무성 - 무릎 위에서 편안히 골골거리는 고양이 ---------------- */

const S1_CAT_WIDTH = 660;
const S1_CAT_X = CX - S1_CAT_WIDTH / 2;

export const S1RestPurr: React.FC<{ f: number }> = ({ f }) => {
  const tailT = progress(f, 0, 20);
  const y = catGroundY(S1_CAT_WIDTH);
  const height = (S1_CAT_WIDTH * 700) / 620;
  // 가슴 언저리 - 골골 진동을 큰 물결 2~3개로 보여주는 앵커(작은 점 무리 금지 원칙)
  const chestX = S1_CAT_X + S1_CAT_WIDTH * 0.66;
  const chestY = y + height * 0.62;
  const waveLoop = (f % 44) / 44;

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper}>
      <CatFull f={f} width={S1_CAT_WIDTH} x={S1_CAT_X} y={y} tailSwayT={tailT} />
      <ScentWaves cx={chestX} cy={chestY} angle={-25} count={2} spread={150} progress={waveLoop} color={C.inkSoft} />
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 - 쓰다듬으며 궁금해함 (립싱크) ---------------- */

const S2_ACTOR_SIZE = 780;
const S2_ACTOR_CX = 730;
const S2_CAT_WIDTH = 400;
const S2_CAT_X = 90;

export const S2Reaction: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const t = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.crouch, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const tailT = progress(f, 0, 20);
  const y = catGroundY(S2_CAT_WIDTH);

  return (
    <PlainBg>
      <CatFull f={f} width={S2_CAT_WIDTH} x={S2_CAT_X} y={y} tailSwayT={tailT} />
      <Actor size={S2_ACTOR_SIZE} centerX={S2_ACTOR_CX} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 성대 근육이 빠르게 떨린다 ---------------- */

const DIAG_W = 760;
const DIAG_X = (1080 - DIAG_W) / 2;
const DIAG_Y = 340;
const DIAG_SCALE = DIAG_W / CAT_PURR_VB_W;
const DIAG_LABEL_X = DIAG_X + CAT_PURR_LABEL_PT.x * DIAG_SCALE;
const DIAG_LABEL_Y = DIAG_Y + CAT_PURR_LABEL_PT.y * DIAG_SCALE;

export const S3Vibrate: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const vibrateT = progress(f, 4, 26);
  const labelP = progress(f, 18, 38);

  return (
    <PlainBg ground={null}>
      <CatPurrDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} vibrateT={vibrateT} />
      <Label
        x={DIAG_LABEL_X} y={DIAG_LABEL_Y} text={label} size={50} color={C.ink} align="center"
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 들숨에도 날숨에도 - 성대 틈이 반복해서 여닫힘 ---------------- */

const S4_BREATH_CYCLE = 44;

export const S4Breath: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const labelP = progress(f, 4, 22);
  // 반복 위상: 전반부는 들숨, 후반부는 날숨이 흐르도록 절반씩 나눈다(DogNoseCloseup과 동일 설계)
  const phase = (f % S4_BREATH_CYCLE) / S4_BREATH_CYCLE;
  const inhaleProgress = phase < 0.5 ? phase * 2 : 0;
  const exhaleProgress = phase >= 0.5 ? (phase - 0.5) * 2 : 0;

  return (
    <PlainBg ground={null}>
      <CatPurrDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} vibrateT={1}
        inhaleProgress={inhaleProgress} exhaleProgress={exhaleProgress}
      />
      <Label
        x={DIAG_LABEL_X} y={DIAG_LABEL_Y} text={label} size={50} color={C.ink} align="center"
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론 - 새 그래픽 없이 s4의 최종 상태(떨림)를 유지, 자막만 ---------------- */

export const S5Conclusion: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => (
  <PlainBg ground={null}>
    <CatPurrDiagram f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y} vibrateT={1} />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
  </PlainBg>
);

/* ---------------- S6: 아플 때도 골골 - 움츠린 고양이 (대비) ---------------- */

const S6_CAT_WIDTH = 620;
const S6_CAT_X = CX - S6_CAT_WIDTH / 2;
const S6_BADGE_X = CX;
const S6_BADGE_Y = 480;

export const S6HurtStill: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const hurtT = progress(f, 0, 14);
  const badgeP = progress(f, 10, 30);
  const y = catGroundY(S6_CAT_WIDTH);
  const height = (S6_CAT_WIDTH * 700) / 620;
  const chestX = S6_CAT_X + S6_CAT_WIDTH * 0.66;
  const chestY = y + height * 0.6;
  const waveLoop = (f % 44) / 44;

  return (
    <PlainBg>
      <CatFull f={f} width={S6_CAT_WIDTH} x={S6_CAT_X} y={y} tailSwayT={1} hurt={hurtT} />
      <ScentWaves cx={chestX} cy={chestY} angle={-25} count={2} spread={140} progress={waveLoop} color={C.inkSoft} />
      <div style={pillBadgeStyle(S6_BADGE_X, S6_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 속설 - 떨림이 회복을 돕는다는 얘기 + "그런 얘기도 있대요" 배지 ---------------- */

const S7_WAVE_PT = { x: 340, y: 760 };
const S7_BONE_PT = { x: 740, y: 760 };
const S7_ICON_SIZE = 240;
const S7_BADGE_X = CX;
const S7_BADGE_Y = 480;

export const S7Recovery: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const waveP = progress(f, 6, 26);
  const boneP = progress(f, 22, 42);
  const signalT = progress(f, 40, 76);
  const badgeP = progress(f, 50, 72);

  return (
    <PlainBg ground={null}>
      <NerveSignal
        from={{ x: S7_WAVE_PT.x + S7_ICON_SIZE * 0.4, y: S7_WAVE_PT.y }}
        to={{ x: S7_BONE_PT.x - S7_ICON_SIZE * 0.4, y: S7_BONE_PT.y }}
        bow={-70} showPath={boneP} signalT={signalT} pathColor={C.goldSoft} dotColor={C.coral}
      />
      <PopIn cx={S7_WAVE_PT.x} cy={S7_WAVE_PT.y} size={S7_ICON_SIZE} progress={waveP} fromScale={0.5}>
        <ThemedIcon name="wave-sine" size={S7_ICON_SIZE} color={C.ink} />
      </PopIn>
      <PopIn cx={S7_BONE_PT.x} cy={S7_BONE_PT.y} size={S7_ICON_SIZE} progress={boneP} fromScale={0.5}>
        <ThemedIcon name="bone" size={S7_ICON_SIZE} color={C.ink} />
      </PopIn>
      <div style={pillBadgeStyle(S7_BADGE_X, S7_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
