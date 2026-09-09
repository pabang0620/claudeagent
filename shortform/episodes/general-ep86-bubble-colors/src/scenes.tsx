/** 이 화(general-ep86, "비눗방울이 무지개색으로 보이는 이유") 전용 장면.
 *
 *  s1(캐릭터가 비눗방울을 불고, 방울 표면에 무지개색이 어른거림) -> s2(무지개 아이콘 vs
 *  비눗방울 아이콘 사이에 X 표시 - "원리가 아예 달라요") -> s3(BubbleFilmDiagram 막 단면
 *  클로즈업, reflectProgress 0~0.5 - 겉면에서 즉시 튕겨나감) -> s4(같은 단면,
 *  reflectProgress 0.5~1 - 나머지가 막을 통과해 안쪽 면에서 튕겨 나옴) -> s5(reflectProgress=1
 *  고정 + interferenceProgress - 두 빛이 만나 겹치며 한 색만 남음) -> s6(막 두께가 다른 두
 *  지점을 나란히 비교, 서로 다른 resultColor) -> s7(BubbleSurface 전체 화면, 소용돌이치는
 *  무지개 무늬) -> s8(BubbleSurface, blackenProgress로 색이 사라지고 까매진 뒤 popProgress로
 *  터짐 + bubble_pop SFX).
 *
 *  BubbleFilmDiagram/BubbleSurface(props/, general-ep86 신설)는 s3~s6이 막 단면(같은
 *  좌표계, width로 확대율만 바꿈), s1/s2/s7/s8이 비눗방울 전체(BubbleSurface)를 재사용한다
 *  (HiccupDiagram과 같은 "단일 컴포넌트로 여러 화면 커버" 설계).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - s3/s4/s5는 "같은 단면"이라는 서술대로 동일 좌표계(BubbleFilmDiagram)를 그대로
 *     이어 쓴다 - 장면마다 다른 다이어그램을 새로 그리지 않는다.
 *   - s2는 무지개(30화 RainbowDiagram)와 비눗방울(이 화 BubbleSurface)을 나란히 놓고
 *     X로 "원리가 다르다"는 것 자체를 보여준다(자산을 그대로 재사용하되 대조 구도로 배치).
 *   - 막 두께에 따른 색 변화는 s6에서 색 자체(연속적 색 변화, resultColor)로 표현한다.
 *   - s8은 색이 사라지고 까맣게 변하다 터지는 데까지 다룬다(BubbleSurface.blackenProgress
 *     + popProgress).
 */
import React from 'react';
import {
  Actor, BubbleFilmDiagram, BubbleSurface, C, Caption, FPS, PlainBg, POSES, RainbowDiagram, Sparkles, W,
  LIGHT_GREEN, LIGHT_ORANGE, LIGHT_VIOLET,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/** 두 대상이 "원리가 다르다"는 것을 보여주는 X 표시(s2 전용, 에피소드 로컬 - 지역성 우선).
 *  촘촘한 점 대신 두꺼운 대각선 두 가닥 + 원 배지로만 그린다. */
const XMark: React.FC<{ cx: number; cy: number; size: number; reveal: number }> = ({ cx, cy, size, reveal }) => {
  const r = clamp01(reveal);
  if (r <= 0.01) return null;
  const s = size / 2;
  const k = 0.15 + 0.85 * Math.min(1, r * 2.2);
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: cx - s, top: cy - s, overflow: 'visible' }}>
      <circle cx={s} cy={s} r={s} fill={C.paper} stroke={C.ink} strokeWidth={7} opacity={Math.min(1, r * 3)} />
      <g style={{ opacity: Math.min(1, r * 3) }} transform={`translate(${s} ${s}) scale(${k})`}>
        <line x1={-s * 0.5} y1={-s * 0.5} x2={s * 0.5} y2={s * 0.5} stroke={C.coral} strokeWidth={16} strokeLinecap="round" />
        <line x1={s * 0.5} y1={-s * 0.5} x2={-s * 0.5} y2={s * 0.5} stroke={C.coral} strokeWidth={16} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/* ============================================================
 * S1: 캐릭터가 비눗방울을 불고, 방울 표면에 무지개색이 어른거림
 * ============================================================ */
const S1_ACTOR_GROUND = 1280;
const S1_BUBBLE_W = 320;
const S1_BUBBLE_X = CX + 60;
const S1_BUBBLE_Y = 430;

export const S1Blow: React.FC<{ f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]> }> = ({
  f, frames, lines, mouth,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const leanT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.present, leanT * 0.5);
  const colorIntensity = progress(f, 6, 40);
  const bubbleScale = 0.82 + 0.18 * Math.min(1, progress(f, 0, 22) * 1.1);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={S1_ACTOR_GROUND}>
      <Actor size={800} centerX={280} ground={S1_ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      <BubbleSurface
        width={S1_BUBBLE_W} x={S1_BUBBLE_X} y={S1_BUBBLE_Y} swirlT={f} colorIntensity={colorIntensity}
        style={{ transform: `scale(${bubbleScale})`, transformOrigin: '50% 50%' }}
      />
      <Sparkles box={{ x: S1_BUBBLE_X - 30, y: S1_BUBBLE_Y - 30, w: S1_BUBBLE_W + 60, h: S1_BUBBLE_W + 60 }} t={colorIntensity} scale={0.8} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 무지개 아이콘 vs 비눗방울 아이콘, 사이에 X - "원리가 아예 달라요"
 * ============================================================ */
const S2_ICON_W = 300;
const S2_LEFT_X = 130;
const S2_RIGHT_X = W - S2_ICON_W - 130;
const S2_ICON_Y = 560;
const S2_X_CX = CX;
const S2_X_CY = S2_ICON_Y + S2_ICON_W / 2;

export const S2Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const iconA = progress(f, 0, 16);
  const xReveal = progress(f, 20, 42);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <RainbowDiagram
        width={S2_ICON_W} x={S2_LEFT_X} y={S2_ICON_Y} arcProgress={1}
        style={{ opacity: iconA, transform: `scale(${0.85 + 0.15 * iconA})`, transformOrigin: '50% 50%' }}
      />
      <BubbleSurface
        width={S2_ICON_W} x={S2_RIGHT_X} y={S2_ICON_Y} swirlT={f} colorIntensity={1}
        style={{ opacity: iconA, transform: `scale(${0.85 + 0.15 * iconA})`, transformOrigin: '50% 50%' }}
      />
      <XMark cx={S2_X_CX} cy={S2_X_CY} size={140} reveal={xReveal} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 막 단면 - 겉면에서 빛 일부가 즉시 튕겨나감 (reflectProgress 0~0.5)
 * ============================================================ */
const S3_DIAG_W = 640;
const S3_DIAG_X = CX - S3_DIAG_W / 2 - 30;
const S3_DIAG_Y = 380;

export const S3OuterReflect: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const rp = progress(f, 4, Math.round(frames * 0.9)) * 0.5;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BubbleFilmDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} reflectProgress={rp} resultColor={LIGHT_GREEN} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 같은 단면 - 나머지가 막을 통과해 안쪽 면에서 튕겨 나옴 (reflectProgress 0.5~1)
 * ============================================================ */
export const S4InnerReflect: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const rp = 0.5 + progress(f, 4, Math.round(frames * 0.92)) * 0.5;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BubbleFilmDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} reflectProgress={rp} resultColor={LIGHT_GREEN} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 두 빛이 다시 만나 겹치며 어떤 색은 강해지고 어떤 색은 사라짐
 * ============================================================ */
export const S5Interfere: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const ip = progress(f, 4, Math.round(frames * 0.88));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BubbleFilmDiagram
        width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} reflectProgress={1} interferenceProgress={ip}
        resultColor={LIGHT_GREEN}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 막 두께가 살짝 다른 두 지점 비교 - 각각 다른 색
 * ============================================================ */
const S6_DIAG_W = 460;
const S6_GAP = 50;
const S6_TOTAL_W = S6_DIAG_W * 2 + S6_GAP;
const S6_LEFT_X = (W - S6_TOTAL_W) / 2;
const S6_RIGHT_X = S6_LEFT_X + S6_DIAG_W + S6_GAP;
const S6_Y = 440;

export const S6ThicknessCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const ip = progress(f, 6, Math.round(frames * 0.82));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BubbleFilmDiagram
        width={S6_DIAG_W} x={S6_LEFT_X} y={S6_Y} reflectProgress={1} interferenceProgress={ip}
        filmGapPx={55} resultColor={LIGHT_VIOLET}
      />
      <BubbleFilmDiagram
        width={S6_DIAG_W} x={S6_RIGHT_X} y={S6_Y} reflectProgress={1} interferenceProgress={ip}
        filmGapPx={95} resultColor={LIGHT_ORANGE}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 방울 표면 전체에서 색깔 무늬가 소용돌이치듯 움직임
 * ============================================================ */
const S7_BUBBLE_W = 660;
const S7_BUBBLE_X = CX - S7_BUBBLE_W / 2;
const S7_BUBBLE_Y = 470;

export const S7Swirl: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const appearA = progress(f, 0, 16);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BubbleSurface
        width={S7_BUBBLE_W} x={S7_BUBBLE_X} y={S7_BUBBLE_Y} swirlT={f} colorIntensity={1}
        style={{ opacity: appearA, transform: `scale(${0.9 + 0.1 * appearA})`, transformOrigin: '50% 50%' }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 얇아지며 색이 사라지고 까매지다 터짐
 * ============================================================ */
const S8_BUBBLE_W = 620;
const S8_BUBBLE_X = CX - S8_BUBBLE_W / 2;
const S8_BUBBLE_Y = 490;
/** popProgress가 시작되는 로컬 진행 비율. Episode.tsx가 bubble_pop SFX 시작 프레임을
 *  이 상수로 계산해 시각 파열과 소리를 맞춘다(매직넘버 중복 없이 export). */
export const S8_POP_START_FRAC = 0.66;

export const S8FadeToBlack: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const popStart = Math.round(frames * S8_POP_START_FRAC);
  const blacken = progress(f, 4, popStart);
  const pop = progress(f, popStart, Math.round(frames * 0.94));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BubbleSurface
        width={S8_BUBBLE_W} x={S8_BUBBLE_X} y={S8_BUBBLE_Y} swirlT={f} colorIntensity={1}
        blackenProgress={blacken} popProgress={pop}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
