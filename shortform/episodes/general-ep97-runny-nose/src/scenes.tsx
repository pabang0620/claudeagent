/** 이 화(general-ep97, "감기에 걸리면 콧물이 나는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(담요를 두르고 힘없이 앉아 훌쩍이는 캐릭터, 무성) -> s2(BustActor 리액션 "콧물이 왜
 *  이렇게 계속 나오지?") -> s3(NasalImmuneDiagram immuneProgress - 바이러스+면역세포 반응) ->
 *  s4(같은 다이어그램 mucusProgress - 혈관 확장 + 점액이 바이러스·먼지를 붙잡아 씻어냄,
 *  immuneProgress=1 유지) -> s5(colorProgress - 점액 색이 맑음->노랑->초록, immuneProgress/
 *  mucusProgress=1 유지) -> s6(같은 다이어그램 정지 + "세균 감염?" 말풍선이 떴다가 X 표시와
 *  함께 사라지는 정정 연출) -> s7(담요를 두른 채 살짝 편안해진 표정으로 마무리, 립싱크).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 콧물이 바이러스·먼지를 붙잡아 씻어내는 과정이 핵심 그림이다. 바이러스는 작은 도형
 *     1~2개, 콧물은 큰 액체 형태(ThemedIcon droplet)로 표현하고 점을 잔뜩 뿌리지 않는다
 *     (NasalImmuneDiagram 내부에 이미 반영).
 *   - 콧물 색은 옅음->진함을 색 자체로 보여준다. 면역세포는 작은 도형 몇 개(최대 2개)로만
 *     섞인 정도를 표현한다.
 *   - 코를 풀거나 콧물이 흐르는 모습을 불쾌하게 그리지 않는다 - 이 화에서 캐릭터는 담요를
 *     두르고 훌쩍이는 정도로만 그리고, 콧물 자체는 캐릭터 몸이 아니라 다이어그램(단면도)
 *     안에서만 보여준다.
 *   - 겁주는 톤으로 가지 않는다 - 바이러스·면역세포 모두 단순한 도형으로만 그리고, 배경도
 *     밝은 톤을 유지한다.
 *
 *  70화 사고 재발 방지: s6의 X 표시는 반드시 "세균 감염?" 말풍선(오해) 위에만 찍는다.
 *  다이어그램 자체(맞는 설명)에는 어떤 부정 기호도 얹지 않는다 - NasalImmuneDiagram은 X를
 *  내부에 굽지 않게 설계했고, X는 이 씬이 QMark로 별도로 얹는다. "색이 진하다고 무조건
 *  세균 감염은 아니다"라는 대본의 뉘앙스를 살려, 말풍선 문구는 단정("세균 아님")이 아니라
 *  물음표를 단 "세균 감염?"으로 두어 "그렇게 단정할 수 없다"는 담백한 정정으로만 처리한다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, GROUND, NasalImmuneDiagram, PlainBg, POSES, QMark,
  SW_THIN, SpeechBubble, W,
  blendPose, buildPeakRelease, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: MouthFile['mouth'] }

/* ============================================================
 * 담요 - 어깨에 걸친 숄 형태로 허리~엉덩이 선까지만 덮는다(다리는 그대로 보여 서 있는
 * 자세임을 유지). 이 화 로컬 헬퍼(지역성 우선 - 재사용 가능성이 뚜렷해지면 다음에
 * 라이브러리로 승격한다).
 *
 * 시도 이력(스틸 선점검, 원칙 5): (1) 상자를 얼굴 턱 밑까지(topY=ground-0.46*size) 덮었더니
 * 캐릭터가 상자 뒤에 파묻힌 것처럼 보임 -> (2) `Bed.tsx`처럼 화면 전체 폭+바닥까지 덮었더니
 * 이번엔 담요가 너무 커서 캐릭터가 파묻혀 보임 -> (3) 어깨선(ground-0.33*size)에서 시작해
 * 골반선(ground-0.164*size, RIG.HIP.y=820 실측) 약간 아래까지만 내려오는 좁은 숄로 좁혀
 * 다리가 그대로 보이게 했다(idle 포즈 실측 비율 - Character.tsx RIG: SHOULDER.y=647,
 * HIP.y=820, FEET_VB=1026, RIG.H=1254). */
const BLANKET_COLOR = C.hillFar;
const BLANKET_STRIPE = C.coralSoft;

const BlanketWrap: React.FC<{ centerX: number; ground: number; size: number }> = ({
  centerX, ground, size,
}) => {
  const w = size * 0.62;
  const topY = ground - size * 0.33;
  const bottomY = ground - size * 0.12;
  const h = bottomY - topY;
  const x = centerX - w / 2;
  return (
    <svg
      width={w} height={h}
      style={{ position: 'absolute', left: x, top: topY, overflow: 'visible' }}
      shapeRendering="geometricPrecision"
    >
      <path
        d={`M ${w * 0.06} ${h * 0.16} Q ${w * 0.5} ${-h * 0.1} ${w * 0.94} ${h * 0.16} L ${w} ${h * 0.9} Q ${w * 0.5} ${h} 0 ${h * 0.9} Z`}
        fill={BLANKET_COLOR} stroke={C.ink} strokeWidth={SW_THIN}
      />
      <line x1={w * 0.2} y1={h * 0.42} x2={w * 0.8} y2={h * 0.42} stroke={BLANKET_STRIPE} strokeWidth={9} opacity={0.6} strokeLinecap="round" />
      <line x1={w * 0.24} y1={h * 0.66} x2={w * 0.76} y2={h * 0.66} stroke={BLANKET_STRIPE} strokeWidth={9} opacity={0.6} strokeLinecap="round" />
    </svg>
  );
};

/* ============================================================
 * S1: 담요를 두르고 힘없이 앉아 훌쩍인다 (무성)
 * ============================================================ */
const S1_SIZE = 760;
/** 훌쩍이는 순간(작은 머리 들썩임) - Episode.tsx가 sniff_snort SFX를 이 프레임에 맞춘다 */
export const S1_SNIFF_AT = 20;

export const S1Sniffle: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const sniffP = buildPeakRelease(f, S1_SNIFF_AT - 6, 6, 3, 12);
  const bob = -sniffP * 10;
  const pose = { ...blendPose(POSES.idle, POSES.thinking, 0.35), eyeOpen: 0.65 };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={GROUND} groundColor={C.hill}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${bob}px)` }}>
        <Actor size={S1_SIZE} centerX={CX} ground={GROUND} pose={pose} />
      </div>
      <BlanketWrap centerX={CX} ground={GROUND} size={S1_SIZE} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "아, 콧물이 왜 이렇게 계속 나오지?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose = blendPose(POSES.idle, POSES.thinking, 0.7);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 다이어그램 공통 배치 (s3~s6)
 * ============================================================ */
const DIAG_W = 680;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 500;

/* ============================================================
 * S3: 바이러스가 점막에 들어오고 면역세포가 반응한다
 * ============================================================ */
export const S3Invade: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const immuneProgress = progress(f, 6, Math.max(30, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <NasalImmuneDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} immuneProgress={immuneProgress} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 혈관이 넓어지고 점액이 늘어나 바이러스·먼지를 붙잡아 씻어낸다
 * ============================================================ */
export const S4Mucus: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const mucusProgress = progress(f, 8, Math.max(30, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <NasalImmuneDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        immuneProgress={1} mucusProgress={mucusProgress}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 점액 색이 맑음 -> 노랑 -> 초록으로 바뀌며 면역세포가 섞인다
 * ============================================================ */
export const S5Color: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const colorProgress = progress(f, 8, Math.max(30, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <NasalImmuneDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        immuneProgress={1} mucusProgress={1} colorProgress={colorProgress}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: "세균 감염?" 말풍선이 떴다가 X 표시와 함께 사라지는 정정 연출
 * ============================================================ */
const S6_BUBBLE_W = 380;
const S6_BUBBLE_H = 150;
const S6_BUBBLE_X = CX + 30;
const S6_BUBBLE_Y = 760;

export const S6Myth: React.FC<SceneProps & { t: (typeof STRINGS)['ko'] }> = ({ f, frames, lines, t }) => {
  const line = activeLine(lines, f / FPS);
  const bubbleBuild = 14;
  const bubbleRelease = 26;
  const bubblePeak = Math.max(8, frames - 6 - bubbleBuild - bubbleRelease - 8);
  const bubbleProgress = buildPeakRelease(f, 6, bubbleBuild, bubblePeak, bubbleRelease);
  const xRaw = clamp01(progress(f, 6 + bubbleBuild + 8, 6 + bubbleBuild + 22));
  const xOpacity = xRaw * bubbleProgress;
  const bubbleCx = S6_BUBBLE_X + S6_BUBBLE_W / 2;
  const bubbleCy = S6_BUBBLE_Y + S6_BUBBLE_H / 2;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <NasalImmuneDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        immuneProgress={1} mucusProgress={1} colorProgress={1}
      />
      {bubbleProgress > 0.01 ? (
        <SpeechBubble
          x={S6_BUBBLE_X} y={S6_BUBBLE_Y} w={S6_BUBBLE_W} h={S6_BUBBLE_H}
          shape="rect" tail="bottomLeft" progress={bubbleProgress}
          text={t.s6MythText} textSize={58}
        />
      ) : null}
      {xOpacity > 0.01 ? (
        <QMark
          glyph="✕" size={110} color={C.coral} outline={C.ink}
          style={{ left: bubbleCx, top: bubbleCy, transform: 'translate(-50%, -50%)', opacity: xOpacity }}
        />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 담요를 두른 채 살짝 편안해진 표정으로 마무리 (립싱크)
 * ============================================================ */
const S7_SIZE = 760;

export const S7Final: React.FC<MouthSceneProps> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));
  const pose = { ...POSES.idle, eyeOpen: 1, blush: 1.1 };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={GROUND} groundColor={C.hill}>
      <Actor size={S7_SIZE} centerX={CX} ground={GROUND} pose={pose} mouthOpen={mouthOpen} />
      <BlanketWrap centerX={CX} ground={GROUND} size={S7_SIZE} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
