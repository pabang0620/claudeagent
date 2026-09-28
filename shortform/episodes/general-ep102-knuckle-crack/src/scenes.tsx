/** 이 화(general-ep102, "손가락 꺾을 때 뚝 소리 나는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트, 현재는 ko 하나뿐).
 *
 *  s1(무성 - 손가락 클로즈업, 살짝 당겨졌다가 "뚝" 꺾이는 순간 + 효과음) -> s2(BustActor
 *  리액션 "어, 방금 손가락에서 뚝 소리가 났다...") -> s3(JointCrackDiagram 정지 상태 -
 *  좁은 간격 + 흩어진 기체 방울) -> s4(gapWiden 0~1 이어서 bubbleForm 0~1, "뼈" X / "기포"
 *  O 라벨) -> s5(gapWiden=1·bubbleForm=1 유지 + bubbleDissolve 0~1, 타이머 아이콘) ->
 *  s6(캐릭터 정면, "관절염?" 텍스트 + X 표시 정지 컷, 립싱크).
 *
 *  이 화의 시각 주의사항:
 *   - s1은 새 라이브러리 자산을 만들지 않고 기존 `Finger`(props/Hand.tsx)를 밑동 기준으로
 *     회전시켜 "당겨졌다 꺾인다"는 동작만 표현한다(REGISTRY 우선 원칙 - 3초 무성 컷에
 *     전용 다이어그램을 새로 만들 필요는 없다고 판단).
 *   - s3~s5는 JointCrackDiagram(assets/props/, 이 화 신설 - 아직 REGISTRY.md/배럴 미등록,
 *     상대경로로 직접 import) 하나를 이어 쓴다(같은 좌표계, 레이어만 바뀜).
 *   - s4의 X/O 배지는 "틀린 진술(뼈)에 X, 맞는 진술(기포)에 O"를 반드시 지킨다
 *     (70화 사고 재발 방지 - 정정 대상을 헷갈리면 내용 자체가 뒤집힌다).
 *   - s6은 리액션 바스트샷이 아니라 캐릭터 전신 정면 컷이라 소품을 넣지 않는 원칙(36화)의
 *     대상이 아니지만, 그래도 텍스트+배지 외 다른 소품은 두지 않는다.
 *
 *  원칙 7(무성 구간 효과음): s1 "뚝" 순간에 knuckle_crack(이 화 신설, assets/audio/)을
 *  Shake+ImpactBurst+FlashOverlay와 함께 정확히 CRACK_AT 프레임에 맞춘다.
 */
import React from 'react';
import {
  Actor, Appear, BustActor, C, Caption, FEET_VB, FlashOverlay, FPS, Finger, GROUND, HEAD_TOP_VB,
  ImpactBurst, Label, PlainBg, POSES, RIG, Shake, ThemedIcon, W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile } from '../../../assets';
import {
  JOINT_BONE_LABEL_PT, JOINT_BUBBLE_LABEL_PT, JOINT_VB_W, JointCrackDiagram,
} from '../../../assets/props/JointCrackDiagram';
import { STRINGS } from './strings';

const t = STRINGS.ko;
const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

function headTopY(size: number, ground: number) {
  return ground - (FEET_VB - HEAD_TOP_VB) * (size / RIG.H);
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: MouthFile['mouth'] }

/** 두 대상이 "이것은 틀리고 저것은 맞다"는 것을 보여주는 X/O 배지(이 화 전용, 지역성
 *  우선 - ep86/ep88의 XMark와 같은 시각 문법을 재사용해 이 파일에 다시 짠다). */
const WrongBadge: React.FC<{ cx: number; cy: number; size: number; reveal: number }> = ({ cx, cy, size, reveal }) => {
  const r = clamp01(reveal);
  if (r <= 0.01) return null;
  const s = size / 2;
  const k = 0.15 + 0.85 * Math.min(1, r * 2.2);
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: cx - s, top: cy - s, overflow: 'visible' }}>
      <circle cx={s} cy={s} r={s} fill={C.paper} stroke={C.ink} strokeWidth={7} opacity={Math.min(1, r * 3)} />
      <g style={{ opacity: Math.min(1, r * 3) }} transform={`translate(${s} ${s}) scale(${k})`}>
        <line x1={-s * 0.5} y1={-s * 0.5} x2={s * 0.5} y2={s * 0.5} stroke={C.coral} strokeWidth={14} strokeLinecap="round" />
        <line x1={s * 0.5} y1={-s * 0.5} x2={-s * 0.5} y2={s * 0.5} stroke={C.coral} strokeWidth={14} strokeLinecap="round" />
      </g>
    </svg>
  );
};

const RightBadge: React.FC<{ cx: number; cy: number; size: number; reveal: number }> = ({ cx, cy, size, reveal }) => {
  const r = clamp01(reveal);
  if (r <= 0.01) return null;
  const s = size / 2;
  const k = 0.15 + 0.85 * Math.min(1, r * 2.2);
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: cx - s, top: cy - s, overflow: 'visible' }}>
      <circle cx={s} cy={s} r={s} fill={C.gold} stroke={C.ink} strokeWidth={7} opacity={Math.min(1, r * 3)} />
      <g style={{ opacity: Math.min(1, r * 3), transform: `scale(${k})`, transformOrigin: '50% 50%' }}>
        <g transform={`translate(${s - 26} ${s - 26})`}>
          <ThemedIcon name="check" size={52} color={C.paper} strokePx={9} />
        </g>
      </g>
    </svg>
  );
};

/* ============================================================
 * S1: 손가락 클로즈업 - 살짝 당겨졌다가 "뚝" 꺾인다 (무성)
 * ============================================================ */
const S1_FINGER_W = 680;
const S1_FINGER_H = (S1_FINGER_W * 400) / 300;
const S1_LEFT = CX - S1_FINGER_W / 2;
const S1_TOP = 370;
/** "뚝" 소리가 나는 순간 - Episode.tsx가 knuckle_crack SFX를 이 프레임에 맞춘다 */
export const CRACK_AT = 44;
const CREASE_MID_FRAC = 240 / 400; // Finger 컴포넌트의 가운데 주름선 위치(뷰박스 400 기준)

export const S1Crack: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const pullT = progress(f, 4, CRACK_AT - 4);
  const snapT = progress(f, CRACK_AT, CRACK_AT + 10);
  const bounce = snapT > 0 && snapT < 1 ? Math.sin(snapT * Math.PI * 3) * 3 * (1 - snapT) : 0;
  const angle = f < CRACK_AT ? -16 * pullT : -16 * (1 - snapT) + bounce;
  const jointX = CX;
  const jointY = S1_TOP + S1_FINGER_H * CREASE_MID_FRAC;

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <Shake frame={f} at={CRACK_AT} duration={10} amp={7}>
        <div
          style={{
            position: 'absolute', left: S1_LEFT, top: S1_TOP, width: S1_FINGER_W, height: S1_FINGER_H,
            transform: `rotate(${angle}deg)`, transformOrigin: '50% 100%',
          }}
        >
          <Finger width={S1_FINGER_W} wrinkle={0} />
        </div>
      </Shake>
      <ImpactBurst x={jointX} y={jointY} frame={f} at={CRACK_AT} size={260} />
      <FlashOverlay frame={f} at={CRACK_AT} peak={0.28} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어, 방금 손가락에서 뚝 소리가 났다..." 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const tiltT = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.surprised, tiltT);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 다이어그램 공통 배치 (s3~s5)
 * ============================================================ */
const DIAG_W = 460;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 420;
const DIAG_SCALE = DIAG_W / JOINT_VB_W;
const boneLabelX = DIAG_X + JOINT_BONE_LABEL_PT.x * DIAG_SCALE;
const boneLabelY = DIAG_Y + JOINT_BONE_LABEL_PT.y * DIAG_SCALE;
const bubbleLabelX = DIAG_X + JOINT_BUBBLE_LABEL_PT.x * DIAG_SCALE;
const bubbleLabelY = DIAG_Y + JOINT_BUBBLE_LABEL_PT.y * DIAG_SCALE;

/* ============================================================
 * S3: 평소 상태 - 좁은 간격 + 흩어진 기체 방울 (정지)
 * ============================================================ */
export const S3Normal: React.FC<SceneProps> = ({ f, lines }) => {
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <JointCrackDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} gapWiden={0} bubbleForm={0} bubbleDissolve={0} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 간격이 벌어지고(gapWiden 0~1) 이어서 기포가 뭉친다(bubbleForm 0~1) + "뼈" X / "기포" O
 * ============================================================ */
export const S4Crack: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const gapWiden = progress(f, 6, Math.max(20, frames * 0.42));
  const bubbleForm = progress(f, Math.max(21, frames * 0.35), Math.max(30, frames * 0.72));
  const labelReveal = progress(f, Math.max(31, frames * 0.62), Math.max(40, frames * 0.86));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <JointCrackDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} gapWiden={gapWiden} bubbleForm={bubbleForm} />
      <Label x={boneLabelX} y={boneLabelY} text={t.boneLabel} size={44} align="left" style={{ opacity: labelReveal }} />
      <WrongBadge cx={boneLabelX - 44} cy={boneLabelY + 20} size={64} reveal={labelReveal} />
      <Label x={bubbleLabelX} y={bubbleLabelY} text={t.bubbleLabel} size={44} align="left" style={{ opacity: labelReveal }} />
      <RightBadge cx={bubbleLabelX - 44} cy={bubbleLabelY + 20} size={64} reveal={labelReveal} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 간격 유지(gapWiden=1) + 기포 유지(bubbleForm=1) + 서서히 사라짐(bubbleDissolve 0~1)
 *     + 타이머 아이콘
 * ============================================================ */
const S5_CLOCK_X = DIAG_X + DIAG_W - 20;
const S5_CLOCK_Y = DIAG_Y - 30;

export const S5Dissolve: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const bubbleDissolve = progress(f, 8, Math.max(30, frames - 14));
  const iconT = progress(f, 6, 26);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <JointCrackDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} gapWiden={1} bubbleForm={1} bubbleDissolve={bubbleDissolve} />
      <Appear progress={iconT} from="scale" style={{ position: 'absolute', left: S5_CLOCK_X, top: S5_CLOCK_Y }}>
        <ThemedIcon name="clock" size={100} color={C.ink} bg={C.paper} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 캐릭터 정면 - "관절염?" 텍스트 + X 표시 (정지 컷, 립싱크)
 * ============================================================ */
const S6_SIZE = 620;

export const S6Myth: React.FC<MouthSceneProps> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  const pose = blendPose(POSES.idle, POSES.shrug, 0.5);
  const labelX = CX;
  const labelY = headTopY(S6_SIZE, GROUND) - 170;
  const xReveal = progress(f, 24, 46);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={GROUND} groundColor={C.hill}>
      <Actor size={S6_SIZE} centerX={CX} ground={GROUND} pose={pose} mouthOpen={mouthOpen} />
      <Label x={labelX} y={labelY} text={t.arthritisLabel} size={64} />
      <WrongBadge cx={labelX + 190} cy={labelY + 32} size={92} reveal={xReveal} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
