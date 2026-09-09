/** 이 화(general-ep56, "헬륨 풍선 불면 목소리가 이상해지는 이유") 전용 장면.
 *
 *  s1(캐릭터가 풍선을 든 채 말풍선 안에 삐죽삐죽한 웃긴 파형이 뜬다, 전신) -> s2(목 안
 *  성대 클로즈업, VocalResonanceDiagram showCords) -> s3(성대+공명을 함께 보여준다,
 *  showCords+showResonance heliumMix=0) -> s4(공기 vs 헬륨 소리 속도 비교, CompareBars
 *  재사용) -> s5(공명 파형이 heliumMix 0->1로 위로 이동, "음색 UP") -> s6(성대는 그대로 +
 *  공명만 확 바뀐 최종 대비, 라벨 2개) -> s7(산소 부족 주의, 경고 아이콘).
 *
 *  이 화의 안전 관련 주의(오케스트레이터 지시): 헬륨을 들이마시는 동작을 클로즈업하거나
 *  반복해서 보여주지 않는다. s1은 캐릭터가 풍선을 손에 든 전신 와이드샷 1컷뿐이고, 풍선이
 *  입에 닿거나 기체가 입으로 들어가는 과정 자체는 그리지 않는다(손에 든 풍선 + 말풍선 결과만
 *  보여준다). 목소리가 변한 것을 신나게 반복하는 연출도 없다(말풍선 파형은 1회만 등장).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 성대·목 안을 사실적 해부도로 그리지 않고
 *  단순한 관+캡슐 도형만 쓴다(VocalResonanceDiagram). 기체 입자를 점으로 뿌리지 않고
 *  CompareBars 막대 2개로만 공기/헬륨을 비교한다. 소리는 큰 물결선 2~3개로 표현하고,
 *  물결 간격 차이로 음색 변화를 보여준다(VocalResonanceDiagram 내부 규약).
 */
import React from 'react';
import {
  Actor, C, Caption, CompareBars, FEET_VB, FPS, GROUND, Label, PlainBg, POSES,
  RIG, SpeechBubble, ThemedIcon, VocalResonanceDiagram, W, blendPose, handPos, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * 공용: 얼굴 프레이밍 (s2/s3/s5/s6이 전부 같은 크기·위치로 컷 전환 시 점프 방지)
 * ============================================================ */

const BUST_SIZE = 880;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 560;

/* ============================================================
 * S1: 캐릭터가 풍선을 손에 든 채 말한다 -> 말풍선에 삐죽삐죽한 웃긴 파형
 *  (전신 와이드샷 1컷. 풍선이 입에 닿는 순간·기체가 들어가는 과정은 그리지 않는다)
 * ============================================================ */

const S1_ACTOR_SIZE = 820;
const S1_CENTER_X = CX;
const S1_BALLOON_SIZE = 156;

/** 풍선 + 매듭 + 손까지 이어지는 줄. 화면 절대좌표로 바로 그린다(중첩 svg absolute 결함
 *  회피 - REGISTRY "21화 이후 결함 A" 참고, 단일 최상위 svg만 쓴다). */
function BalloonAndString({ handX, handY, riseT }: { handX: number; handY: number; riseT: number }) {
  const cx = handX;
  const cy = handY - S1_BALLOON_SIZE * (0.35 + 0.55 * riseT) - 20;
  const rx = S1_BALLOON_SIZE * 0.5;
  const ry = S1_BALLOON_SIZE * 0.58;
  const knotY = cy + ry;
  return (
    <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <path
        d={`M ${cx} ${knotY + 20} Q ${cx + 12} ${(knotY + handY) / 2} ${handX} ${handY}`}
        fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round"
      />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.coral} stroke={C.ink} strokeWidth={11} />
      <ellipse cx={cx - rx * 0.32} cy={cy - ry * 0.38} rx={rx * 0.22} ry={ry * 0.3} fill={C.paper} opacity={0.55} />
      <path d={`M ${cx - 15} ${knotY - 4} L ${cx} ${knotY + 20} L ${cx + 15} ${knotY - 4} Z`} fill={C.coral} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    </svg>
  );
}

/** 삐죽삐죽 웃긴 파형 - 곧고 날카로운 지그재그(만화적 "이상한 목소리"). 소품이 아니라 이
 *  화면 하나에만 쓰는 장식이라 씬 로컬에 둔다. */
function JaggedVoiceWave({ a }: { a: number }) {
  const w = 220;
  const pts = [
    [0, 0], [22, -46], [44, 30], [66, -58], [88, 20], [110, -50], [132, 34], [154, -40], [176, 18], [198, -30], [w, 0],
  ];
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  return (
    <svg width={w} height={140} viewBox={`0 -70 ${w} 140`} style={{ opacity: a }}>
      <path d={d} fill="none" stroke={C.coral} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const S1Balloon: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const raiseT = smooth(progress(f, 0, 22));
  const pose: Pose = blendPose(POSES.idle, POSES.present, raiseT);
  const bubbleP = progress(f, Math.floor(frames * 0.42), Math.floor(frames * 0.42) + 16);

  const scale = S1_ACTOR_SIZE / RIG.W;
  const top = GROUND - (FEET_VB * S1_ACTOR_SIZE) / RIG.H;
  const left = S1_CENTER_X - (RIG.CX * S1_ACTOR_SIZE) / RIG.W;
  const hand = handPos('L', pose.armL!);
  const handX = left + hand.x * scale;
  const handY = top + hand.y * scale;

  return (
    <PlainBg>
      <Actor size={S1_ACTOR_SIZE} centerX={S1_CENTER_X} ground={GROUND} pose={pose} />
      <BalloonAndString handX={handX} handY={handY} riseT={raiseT} />
      <SpeechBubble x={CX + 40} y={480} r={190} tail="bottomLeft" progress={bubbleP} bg={C.paper} border={C.ink}>
        <JaggedVoiceWave a={1} />
      </SpeechBubble>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 목 안 성대 클로즈업 - "성대: 그대로"
 * ============================================================ */

export const S2Cords: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const cordsP = progress(f, 4, 22);
  const labelA = progress(f, 20, 36);
  return (
    <PlainBg>
      <VocalResonanceDiagram f={f} width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP} showCords={cordsP} />
      <Label x={CX} y={BUST_TOP - 90} text={t.s2Label} size={54} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 성대(기본음) + 공명(울림)을 함께 보여준다 - "기본음 + 공명 = 목소리"
 * ============================================================ */

export const S3Combine: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const cordsP = progress(f, 4, 20);
  const resP = progress(f, 14, 32);
  const labelA = progress(f, 34, 52);
  return (
    <PlainBg>
      <VocalResonanceDiagram
        f={f} width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP}
        showCords={cordsP} showResonance={resP} heliumMix={0}
      />
      <Label x={CX} y={BUST_TOP - 90} text={t.s3Label} size={48} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 공기 속 소리 vs 헬륨 속 소리의 이동 속도 비교 (CompareBars 재사용)
 * ============================================================ */

const S4_BAR_X = 150;
const S4_BAR_Y = 780;
const S4_PX_PER_UNIT = 230;

export const S4Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg ground={null}>
      <CompareBars
        items={[
          { label: t.s4LabelAir, value: 1, color: C.coralSoft, at: 6 },
          { label: t.s4LabelHelium, value: 2.8, color: C.gold, at: 20 },
        ]}
        x={S4_BAR_X} y={S4_BAR_Y} pxPerUnit={S4_PX_PER_UNIT} rowGap={230} frame={f}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 공명 파형이 위로 이동한다 - "음색 UP"
 * ============================================================ */

export const S5TimbreUp: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const heliumMix = progress(f, Math.floor(frames * 0.15), Math.floor(frames * 0.85));
  const labelA = progress(f, Math.floor(frames * 0.5), Math.floor(frames * 0.5) + 16);
  return (
    <PlainBg>
      <VocalResonanceDiagram
        f={f} width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP}
        showCords={1} showResonance={1} heliumMix={heliumMix}
      />
      <Label x={CX} y={BUST_TOP - 90} text={t.s5Label} size={58} color={C.gold} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 성대는 그대로, 공명만 확 바뀐 최종 대비
 * ============================================================ */

export const S6Contrast: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const labelA = progress(f, 10, 28);
  return (
    <PlainBg>
      <VocalResonanceDiagram
        f={f} width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP}
        showCords={1} showResonance={1} heliumMix={1}
      />
      <Label
        x={CX - 190} y={BUST_TOP - 90} text={t.s6LabelPitch} size={38} wrapWidth={330}
        style={{ opacity: labelA }}
      />
      <Label
        x={CX + 190} y={BUST_TOP - 90} text={t.s6LabelTimbre} size={38} color={C.gold} wrapWidth={330}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 산소 부족 주의 (사실 서술만 - 훈계조 문구·과장 연출 없음)
 * ============================================================ */

const S7_ICON_SIZE = 210;
const S7_ICON_Y = 780;

export const S7Warning: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const warnA = progress(f, 4, 20);
  const pulse = 0.96 + 0.04 * Math.sin(f / 16);
  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <div
        style={{
          position: 'absolute', left: CX - S7_ICON_SIZE / 2, top: S7_ICON_Y,
          opacity: warnA, transform: `scale(${pulse})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="alert-triangle" size={S7_ICON_SIZE} color={C.coral} strokePx={16} />
      </div>
      <Label x={CX} y={S7_ICON_Y + S7_ICON_SIZE + 70} text={t.s7Label} size={62} color={C.coral} style={{ opacity: warnA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
