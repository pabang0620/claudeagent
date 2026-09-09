/** 이 화(general-ep51, "튀김이 유독 바삭한 이유") 전용 장면.
 *
 *  s1(뜨거운 기름 냄비에 튀김 반죽을 넣음, 무성 - FriedCrustDiagram을 progress 전부 0인
 *  "생반죽" 상태로 재사용) -> s2(BustActor 'thinking' 리액션 "이 소리, 뭔가 계속
 *  보글보글 올라오네") -> s3(FriedCrustDiagram steamProgress - 물이 증발해 빠져나감) ->
 *  s4(같은 다이어그램 poreProgress - 빈 구멍이 남고 크러스트가 마름) -> s5(같은 다이어그램
 *  확대, crackProgress - 씹는 순간 파삭 갈라짐) -> s6(같은 다이어그램 정지, 겉/속 라벨
 *  병렬 배치) -> s7(같은 다이어그램 resoakProgress + AnalogClock 배속 회전, 시간이 지나며
 *  수분이 되돌아옴).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 구멍은 큰 원 4개로만 그리고 촘촘하게
 *  뚫지 않는다(FriedCrustDiagram). 기름 방울을 화면에 잔뜩 뿌리지 않는다 - 끓는 기름은
 *  s1에서 큰 기포 3개로만 표현한다. 음식이 소재이니 먹음직스럽고 깔끔하게 그리고 기름때
 *  느낌을 내지 않는다.
 */
import React from 'react';
import {
  AnalogClock, BustActor, C, Caption, FPS, FriedCrustDiagram, Label, POSES, PlainBg,
  ThemedIcon, W, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * S1: 뜨거운 기름 냄비에 튀김 반죽을 넣음 (무성)
 * ================================================================ */

const POT_CX = CX;
/** 화면 세로 안전영역(SAFE_TOP=240 ~ 1400)을 최대한 채우도록 냄비를 크게 배치한다
 *  (24화 결함 재발 방지 - 콘텐츠가 한쪽에 몰리면 안 된다). 가로는 캔버스 폭(1080, 중심
 *  ±540)에 손잡이까지 포함해 여유 있게 들어가는 폭(rx=430, 손잡이까지 480 안쪽)으로
 *  고정하고, 세로만 깊게 키워 채운다 - out/stills-preview/f160을 3차에 걸쳐 다시 확인하며
 *  잡았다(1차는 냄비가 너무 작았고, 2차는 가로를 키우다 손잡이가 화면 밖으로 잘렸다) */
const POT_RIM_Y = 610;
const POT_RX = 430;
const POT_RY = 75;
const POT_GROUND = 1250;
const BATTER_W = 320;
const BATTER_START_Y = 140;
/** 반죽이 기름 표면에 닿는 순간(로컬 프레임) - Episode.tsx가 SFX를 이 프레임 근처에 맞춘다 */
export const S1_LAND_FRAME = 20;
/** "보글보글" 기포가 터지는 순간들(로컬 프레임) - Episode.tsx가 bubble_pop SFX 3회를 여기에 맞춘다 */
export const S1_BUBBLE_POP_FRAMES = [22, 40, 58];

const BUBBLE_PTS = [
  { dx: -190, phase: 0, r: 26 },
  { dx: 6, phase: 14, r: 30 },
  { dx: 204, phase: 27, r: 22 },
];
const BUBBLE_PERIOD = 42;

export const S1Fry: React.FC<{ f: number }> = ({ f }) => {
  const fallT = clamp01(f / S1_LAND_FRAME);
  const eased = fallT * fallT * (3 - 2 * fallT);
  const oilCy = POT_RIM_Y + 8;
  const batterCenterY = eased < 1
    ? BATTER_START_Y + (oilCy - BATTER_START_Y) * eased
    : oilCy + Math.sin((f - S1_LAND_FRAME) / 7) * 6;
  const batterH = (BATTER_W * 620) / 640;
  const batterX = POT_CX - BATTER_W / 2;
  const batterY = batterCenterY - batterH / 2;

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={POT_GROUND} groundColor={C.roomDeep}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* 냄비 몸체 - 폭은 안전하게(손잡이 포함 480 이내), 깊이만 크게 키운 깊은 냄비 */}
        <path
          d={`M ${POT_CX - 383},${POT_RIM_Y} C ${POT_CX - 442},935 ${POT_CX - 265},1056 ${POT_CX},1060
              C ${POT_CX + 265},1056 ${POT_CX + 442},935 ${POT_CX + 383},${POT_RIM_Y} Z`}
          fill={C.hillFar} stroke={C.ink} strokeWidth={18}
        />
        {/* 손잡이 2개 */}
        <ellipse cx={POT_CX - 442} cy={715} rx={38} ry={64} fill="none" stroke={C.ink} strokeWidth={15} />
        <ellipse cx={POT_CX + 442} cy={715} rx={38} ry={64} fill="none" stroke={C.ink} strokeWidth={15} />
        {/* 기름 */}
        <ellipse cx={POT_CX} cy={oilCy} rx={409} ry={64} fill={C.gold} />
        {/* 기포 3개 - 결정적 프레임 기반 반복(모듈로), Math.random 미사용 */}
        {f >= S1_LAND_FRAME ? BUBBLE_PTS.map((b, i) => {
          const local = (f - S1_LAND_FRAME + b.phase) % BUBBLE_PERIOD;
          const bt = local / BUBBLE_PERIOD;
          const by = POT_RIM_Y - bt * 110;
          const bo = 1 - bt;
          return (
            <circle
              key={i} cx={POT_CX + b.dx} cy={by} r={b.r} fill={C.goldSoft}
              stroke={C.ink} strokeWidth={7} opacity={bo * 0.85}
            />
          );
        }) : null}
        {/* 냄비 입구 테두리 - 기름 위에 겹쳐 그려 깊이감 */}
        <ellipse cx={POT_CX} cy={POT_RIM_Y} rx={POT_RX} ry={POT_RY} fill="none" stroke={C.ink} strokeWidth={18} />
      </svg>

      {/* 불 */}
      <div style={{ position: 'absolute', left: POT_CX - 140, top: 1081 }}>
        <ThemedIcon name="flame" size={100} color={C.coral} strokePx={14} />
      </div>
      <div style={{ position: 'absolute', left: POT_CX + 40, top: 1081 }}>
        <ThemedIcon name="flame" size={100} color={C.coral} strokePx={14} />
      </div>

      {/* 튀김 반죽 - 아직 안 튀겨진 상태(모든 progress 0) */}
      <FriedCrustDiagram width={BATTER_W} x={batterX} y={batterY} />
    </PlainBg>
  );
};

/* ================================================================
 * S2: "이 소리, 뭔가 계속 보글보글 올라오네" 리액션 (바스트샷, 립싱크)
 * ================================================================ */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = { ...POSES.thinking };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3~S7 공용 레이아웃: FriedCrustDiagram
 * ================================================================ */

/** 세로 안전영역(SAFE_TOP=240 ~ 1400)을 최대한 채우도록 크게, 위쪽으로 배치한다
 *  (24화 결함 재발 방지 - out/stills-preview/f350·f700 1차 확인에서 다이어그램이
 *  너무 작고 낮게 배치돼 화면 위 70%가 빈 채 렌더된 것을 실측으로 확인해 다시 잡았다) */
const DIAG_W = 940;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 380;
const CRACK_W = 1040;
const CRACK_X = CX - CRACK_W / 2;
const CRACK_Y = 340;

export const S3Steam: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const steamProgress = progress(f, 10, frames - 20);
  const labelP = progress(f, frames - 26, frames - 6);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <FriedCrustDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} steamProgress={steamProgress} />
      <Label x={CX} y={400} text={t.s3Label} size={50} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S4Pore: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const poreProgress = progress(f, 10, frames - 20);
  const labelP = progress(f, frames - 26, frames - 6);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <FriedCrustDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} steamProgress={1} poreProgress={poreProgress} />
      <Label x={CX} y={400} text={t.s4Label} size={50} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S5Crack: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const crackProgress = progress(f, 10, frames - 30);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <FriedCrustDiagram
        width={CRACK_W} x={CRACK_X} y={CRACK_Y} steamProgress={1} poreProgress={1} crackProgress={crackProgress}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/** s5의 crackProgress 곡선(progress(f,10,frames-30))과 짝을 맞춰, 균열이 실제로
 *  "밝게 벌어지는" 지점(crackProgress≈0.55, FriedCrustDiagram의 gapOpen 시작점)에
 *  Episode.tsx가 bite SFX를 맞출 수 있도록 로컬 프레임을 계산해 준다. */
export function crackSnapFrame(frames: number): number {
  const start = 10;
  const end = frames - 30;
  return Math.round(start + 0.55 * (end - start));
}

export const S6Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const popP = progress(f, 8, 30);

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      <FriedCrustDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} steamProgress={1} poreProgress={1} />
      <Label x={CX - 190} y={400} text={t.s6OuterLabel} size={48} color={C.ink} style={{ opacity: popP }} />
      <Label x={CX + 190} y={400} text={t.s6InnerLabel} size={48} color={C.ink} style={{ opacity: popP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

const CLOCK_SIZE = 170;
const CLOCK_X = 860;
const CLOCK_Y = 260;

export const S7Resoak: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const resoakProgress = progress(f, 20, frames - 20);
  const labelP = progress(f, 10, 30);
  // 시계가 배속으로 빙글빙글 돌아 "시간이 빨리 지나감"을 표현 (frame 기반 결정적 회전)
  const spin = f * 9;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FriedCrustDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} steamProgress={1} poreProgress={1} resoakProgress={resoakProgress} />
      <AnalogClock
        width={CLOCK_SIZE} x={CLOCK_X} y={CLOCK_Y}
        hourDeg={spin * 0.08} minuteDeg={spin} secondDeg={spin * 12}
      />
      <Label x={CX} y={400} text={t.s7Label} size={50} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
