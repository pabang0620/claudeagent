/** 이 화(general-ep17, "얼음이 물 위에 뜨는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher가 넘기는 구간 로컬 프레임 f를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props로만 받는다).
 *
 *  s1(캐릭터가 컵에 물을 따르고 얼음을 넣는 모습)·s2(리액션)만 캐릭터가 등장하고,
 *  s3~s8은 전부 순수 도식이다(대본 "화면이 담당" 열 참고 - 캐릭터 언급 없음).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, C, Caption, FONT, FPS, FS, Label, IceFloatCup, PlainBg, POSES, QMark, ThemedIcon,
  WaterMoleculeLattice, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------- 공용 배경 래퍼 ---------------- */

const Scene: React.FC<{ ground?: number | null; children?: React.ReactNode }> = ({ ground, children }) => (
  <AbsoluteFill>
    <PlainBg ground={ground} />
    {children}
  </AbsoluteFill>
);

/** 절대좌표 요소를 등장시킬 때 쓰는 헬퍼. `Appear`로 감싸지 않고 position·opacity·transform을
 *  한 div에 결합한다(REGISTRY 경고 - Appear+절대좌표 자식 조합 금지, general-ep13 사고). */
const PopBox: React.FC<{ cx: number; cy: number; w: number; h: number; p: number; children: React.ReactNode }> = ({
  cx, cy, w, h, p, children,
}) => {
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h,
        opacity: Math.min(1, p * 2), transform: `scale(${0.3 + 0.7 * p})`, transformOrigin: '50% 50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
};

/** PopBox 안에서 쓰는 텍스트 - Label(절대좌표+align transform 전제)을 flex 안에 그대로 넣으면
 *  translateX(-50%)가 flex 중앙정렬과 이중으로 적용돼 어긋난다. 그래서 플레인 div로 별도로 둔다. */
const PopText: React.FC<{ text: React.ReactNode; size: number; color: string }> = ({ text, size, color }) => (
  <div
    style={{
      fontFamily: FONT, fontWeight: 700, fontSize: size, color, textAlign: 'center',
      whiteSpace: 'nowrap', wordBreak: 'keep-all',
    }}
  >
    {text}
  </div>
);

const ACTOR_GROUND = 1300;
const ACTOR_SIZE = 1500;

/* ================================================================
 * S1: 캐릭터가 컵에 물을 따르고 얼음을 넣는다 - 얼음이 동동 뜬다 (무성)
 * ================================================================ */

export const S1IcePour: React.FC<{ f: number }> = ({ f }) => {
  const pourP = progress(f, 4, 16);
  const liquidLevel = 0.55 * pourP;
  const floatCube = progress(f, 14, 54);
  const cheerT = progress(f, 48, 64);
  const pose = blendPose(POSES.idle, POSES.cheer, cheerT * 0.6);

  return (
    <Scene ground={ACTOR_GROUND}>
      <Actor size={820} centerX={200} ground={ACTOR_GROUND} pose={pose} />
      <IceFloatCup
        width={420} x={600} y={430}
        liquidLevel={liquidLevel} mode="liquid" floatCube={floatCube} temp="cold" f={f}
      />
    </Scene>
  );
};

/* ================================================================
 * S2: 컵을 보며 고개를 갸웃 (리액션 + 훅 질문)
 * ================================================================ */

export const S2Reaction: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const poseT = progress(f, 3, 18);
  const pose = blendPose(POSES.idle, POSES.thinking, poseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const qP = progress(f, 8, 24) * (1 - progress(f, 200, 220));

  return (
    <Scene ground={ACTOR_GROUND}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      <IceFloatCup
        width={220} x={40} y={950} liquidLevel={0.55} mode="liquid" floatCube={1} temp="cold" f={f}
        style={{ opacity: 0.85 }}
      />
      <PopBox cx={CX + 300} cy={520} w={140} h={140} p={qP}>
        <QMark size={130} />
      </PopBox>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ================================================================
 * S3: 분자 배열이 빽빽함 -> 육각형으로 성김
 * ================================================================ */

export const S3Molecules: React.FC<{
  f: number; frames: number; lines: CaptionLine[];
}> = ({ f, frames, lines }) => {
  const crystallizeProgress = progress(f, 10, Math.round(frames * 0.86));

  return (
    <Scene>
      <WaterMoleculeLattice
        width={760} x={(W - 760) / 2} y={520} crystallizeProgress={crystallizeProgress}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ================================================================
 * S4/S5 공용: 두 컵(물 vs 얼음) 비교 레이아웃
 * ================================================================ */

const CUP_W = 380;
const CUP_Y = 460;
const LEFT_CUP_X = 90;
const RIGHT_CUP_X = 560;
const LEFT_CUP_CENTER = LEFT_CUP_X + CUP_W * ((62 + 176 / 2) / 300);
const RIGHT_CUP_CENTER = RIGHT_CUP_X + CUP_W * ((62 + 176 / 2) / 300);
const CUP_BELOW_Y = 1230;

const CompareCups: React.FC<{ appearP: number }> = ({ appearP }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, opacity: appearP }}>
    <IceFloatCup width={CUP_W} x={LEFT_CUP_X} y={CUP_Y} liquidLevel={0.46} mode="liquid" />
    <IceFloatCup width={CUP_W} x={RIGHT_CUP_X} y={CUP_Y} liquidLevel={0.62} mode="ice" />
  </div>
);

export const S4Volume: React.FC<{
  f: number; lines: CaptionLine[]; sameWeightLabel: string; waterLabel: string; iceLabel: string;
}> = ({ f, lines, sameWeightLabel, waterLabel, iceLabel }) => {
  const appearP = progress(f, 2, 16);
  const labelP = progress(f, 10, 26);

  return (
    <Scene>
      <CompareCups appearP={appearP} />
      <div style={{ opacity: labelP }}>
        <Label x={CX} y={330} text={sameWeightLabel} size={FS.label} color={C.ink} align="center" />
        <Label x={LEFT_CUP_CENTER} y={CUP_BELOW_Y} text={waterLabel} size={FS.small} color={C.inkSoft} align="center" />
        <Label x={RIGHT_CUP_CENTER} y={CUP_BELOW_Y} text={iceLabel} size={FS.small} color={C.inkSoft} align="center" wrapWidth={340} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ================================================================
 * S5: 같은 화면 유지 + "밀도" 이름 붙이기 + 낮음/높음 비교
 * ================================================================ */

export const S5Density: React.FC<{
  f: number; lines: CaptionLine[];
  densityLabel: string; iceLowerLabel: string; waterHigherLabel: string;
}> = ({ f, lines, densityLabel, iceLowerLabel, waterHigherLabel }) => {
  const densityP = progress(f, 4, 20);
  const arrowP = progress(f, 20, 36);

  return (
    <Scene>
      <CompareCups appearP={1} />
      <PopBox cx={CX} cy={720} w={420} h={140} p={densityP}>
        <PopText text={densityLabel} size={FS.title} color={C.coral} />
      </PopBox>
      <PopBox cx={RIGHT_CUP_CENTER} cy={1290} w={300} h={160} p={arrowP}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <ThemedIcon name="arrow-down" size={64} color={C.coral} />
          <PopText text={iceLowerLabel} size={FS.small} color={C.ink} />
        </div>
      </PopBox>
      <PopBox cx={LEFT_CUP_CENTER} cy={1290} w={300} h={160} p={arrowP}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <ThemedIcon name="arrow-up" size={64} color={C.inkSoft} />
          <PopText text={waterHigherLabel} size={FS.small} color={C.ink} />
        </div>
      </PopBox>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ================================================================
 * S6: 부피가 커지는 힘 - 수도관이 얼어 터진다
 * ================================================================ */

const PIPE_VB_W = 700;
const PIPE_VB_H = 340;

/** 균열 지그재그 경로(고정 좌표, Math.random 미사용) */
const CRACK_D = 'M 380 50 L 355 110 L 400 150 L 360 200 L 395 250 L 370 300';
const CRACK_LEN = 460; // 대략 실측 경로 길이(strokeDasharray reveal 용, 정밀하지 않아도 시각 효과엔 충분)

/** s6 전용 로컬 소품. 파이프 안에 살얼음이 차오르다 균열이 간다(대본 "화면이 담당" 열).
 *  s7 전용 FrozenLakeCrossSection과 같은 원칙(이 순간의 상태만 그림) - 에피소드 로컬 1회성
 *  장식이라 REGISTRY 승격은 하지 않는다(대본 자산 목록 지시). */
const FrozenPipeCrack: React.FC<{
  width: number; x: number; y: number; fillProgress: number; crackProgress: number;
}> = ({ width, x, y, fillProgress, crackProgress }) => {
  const fp = clamp01(fillProgress);
  const cp = clamp01(crackProgress);
  const pipeX = 60, pipeY = 70, pipeW = 580, pipeH = 200, rx = 46;
  const fillH = fp * (pipeH - 24);
  const fillY = pipeY + pipeH - 12 - fillH;
  const burstOpacity = clamp01((cp - 0.85) / 0.15);

  return (
    <svg
      viewBox={`0 0 ${PIPE_VB_W} ${PIPE_VB_H}`} width={width} height={width * (PIPE_VB_H / PIPE_VB_W)}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}
    >
      <rect x={pipeX} y={pipeY} width={pipeW} height={pipeH} rx={rx} fill={C.paper} stroke={C.ink} strokeWidth={13} />
      {fillH > 1 ? (
        <rect x={pipeX + 18} y={fillY} width={pipeW - 36} height={fillH} rx={20} fill={C.water} />
      ) : null}
      {cp > 0.02 ? (
        <path
          d={CRACK_D} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={CRACK_LEN} strokeDashoffset={CRACK_LEN * (1 - cp)}
        />
      ) : null}
      {burstOpacity > 0.02 ? (
        <g stroke={C.coral} strokeWidth={9} strokeLinecap="round" opacity={burstOpacity}>
          {[[-1, -1], [1, -1.2], [0, -1.6], [-0.7, 1.1], [0.8, 1], [0, 1.5]].map(([dx, dy], i) => (
            <line
              key={i}
              x1={378 + dx * 10} y1={150 + dy * 10}
              x2={378 + dx * (30 + burstOpacity * 26)} y2={150 + dy * (30 + burstOpacity * 26)}
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

/** s6의 균열이 터지는 순간(로컬 프레임). Episode.tsx가 cold_zing SFX를 여기 맞춘다. */
export function s6CrackFrame(frames: number) {
  return Math.round(frames * 0.78);
}

export const S6Pipe: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const fillProgress = progress(f, 4, Math.round(frames * 0.6));
  const crackStart = Math.round(frames * 0.6);
  const crackEnd = s6CrackFrame(frames) + 6;
  const crackProgress = progress(f, crackStart, crackEnd);
  const labelP = progress(f, 6, 20);

  return (
    <Scene>
      <FrozenPipeCrack
        width={760} x={(W - 760) / 2} y={560} fillProgress={fillProgress} crackProgress={crackProgress}
      />
      <div style={{ opacity: labelP }}>
        <Label x={CX} y={1130} text={label} size={FS.label} color={C.ink} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ================================================================
 * S7: 호수는 표면만 언다 - 그 아래에서 물고기가 겨울을 난다
 * ================================================================ */

const LAKE_VB_W = 700;
const LAKE_VB_H = 560;

/** s7 전용 로컬 소품(대본 자산 목록 지시로 REGISTRY 미승격) */
const FrozenLakeCrossSection: React.FC<{
  f: number; width: number; x: number; y: number; iceProgress: number;
}> = ({ f, width, x, y, iceProgress }) => {
  const ip = clamp01(iceProgress);
  const waterX = 40, waterY = 40, waterW = 620, waterH = 480, rx = 30;
  const iceH = 34 * ip;
  const scale = width / LAKE_VB_W;
  const fishLocalX = waterX + waterW * 0.5 + Math.sin(f / 42) * 150;
  const fishLocalY = waterY + 240 + Math.sin(f / 27) * 20;
  const fishFacingLeft = Math.sin(f / 42) < 0;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width * (LAKE_VB_H / LAKE_VB_W) }}>
      <svg
        viewBox={`0 0 ${LAKE_VB_W} ${LAKE_VB_H}`} width={width} height={width * (LAKE_VB_H / LAKE_VB_W)}
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <rect x={waterX} y={waterY} width={waterW} height={waterH} rx={rx} fill={C.waterCool} stroke={C.ink} strokeWidth={13} />
        {iceH > 1 ? (
          <rect x={waterX + 8} y={waterY + 6} width={waterW - 16} height={iceH} rx={12} fill="#EAF6FB" stroke={C.ink} strokeWidth={7} />
        ) : null}
      </svg>
      <div
        style={{
          position: 'absolute', left: fishLocalX * scale - 34, top: fishLocalY * scale - 34,
          transform: `scaleX(${fishFacingLeft ? -1 : 1})`,
        }}
      >
        <ThemedIcon name="fish" size={68} color={C.ink} />
      </div>
    </div>
  );
};

export const S7Lake: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; surfaceLabel: string; belowLabel: string;
}> = ({ f, frames, lines, surfaceLabel, belowLabel }) => {
  const iceProgress = progress(f, 4, Math.round(frames * 0.4));
  const labelP = progress(f, 10, 26);

  return (
    <Scene>
      <FrozenLakeCrossSection
        f={f} width={700} x={(W - 700) / 2} y={470} iceProgress={iceProgress}
      />
      <div style={{ opacity: labelP }}>
        <Label x={CX} y={520} text={surfaceLabel} size={FS.small} color={C.ink} align="center" />
        <Label x={CX} y={860} text={belowLabel} size={FS.small} color={C.paper} align="center" />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ================================================================
 * S8: 음펨바 효과 - 뜨거운 물이 먼저 얼 수도 있다는 속설(논쟁 중)
 * ================================================================ */

export const S8Mpemba: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string;
}> = ({ f, frames, lines, label }) => {
  const appearP = progress(f, 2, 16);
  const qP = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.3) + 16);
  const labelP = progress(f, Math.round(frames * 0.36), Math.round(frames * 0.36) + 18);

  return (
    <Scene>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, opacity: appearP }}>
        <IceFloatCup width={CUP_W} x={LEFT_CUP_X} y={CUP_Y} liquidLevel={0.5} mode="liquid" temp="hot" f={f} />
        <IceFloatCup width={CUP_W} x={RIGHT_CUP_X} y={CUP_Y} liquidLevel={0.5} mode="liquid" temp="cold" f={f} />
      </div>
      {/* 얼음 트레이 - 작은 큐브 3개, 두 컵 사이 아래쪽 */}
      <div style={{ position: 'absolute', left: CX - 90, top: CUP_BELOW_Y - 40, display: 'flex', gap: 12, opacity: appearP }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 56, height: 56, borderRadius: 10, background: '#EAF6FB',
              border: `6px solid ${C.ink}`,
            }}
          />
        ))}
      </div>
      <PopBox cx={CX} cy={330} w={140} h={140} p={qP}>
        <QMark size={120} />
      </PopBox>
      <div style={{ opacity: labelP }}>
        <Label x={CX} y={CUP_BELOW_Y + 60} text={label} size={FS.label} color={C.coral} align="center" wrapWidth={880} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
