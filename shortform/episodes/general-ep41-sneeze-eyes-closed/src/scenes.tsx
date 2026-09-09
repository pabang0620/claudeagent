/** 이 화(general-ep41, "재채기할 때 눈이 저절로 감기는 이유") 전용 장면.
 *
 *  s1(재채기 직전 표정 -> 순식간에 눈을 질끈 감으며 재채기, 바스트샷) -> s2(코 자극 ->
 *  뇌로 올라가는 신호, SneezeReflexDiagram 상승 경로 + 라벨 "재채기 반사") -> s3(뇌에서
 *  코·입 / 눈꺼풀로 동시에 갈라지는 두 갈래 신호, SneezeReflexDiagram 분기 + 라벨 2개
 *  동시 팝인) -> s4(코·입 아이콘과 눈꺼풀 아이콘이 정확히 같은 타이밍에 반짝, 텍스트 없음)
 *  -> s5(눈 앞에서 먼지·침방울 입자가 튕겨나가는 보호 효과 - 확신 낮은 설명이라 QMark)
 *  -> s6(눈알이 튀어나온다는 속설 위에 큰 X, "사실 아님").
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 재채기 순간의 표정을 크게 과장해서 확실히
 *  살린다. 침방울은 작은 점을 잔뜩 뿌리지 않고 날숨은 굵은 선 2~3가닥으로. 신호가 갈라지는
 *  것은 굵은 선이 갈라지는 형태로 단순하게 그리고, 뇌를 사실적인 해부도로 그리지 않는다
 *  (SneezeReflexDiagram은 뇌 자리를 "표시점 하나"로만 나타낸다). 눈을 억지로 뜨려다 실패하는
 *  느낌은 s5의 squint(찡그림)로 가볍게 표현한다.
 */
import React from 'react';
import {
  BustActor, C, Caption, FPS, Label, PlainBg, POSES, PopIn, QMark, SneezeReflexDiagram,
  SNEEZE_EYE_PT, ThemedIcon, W, bounceIn, buildPeakRelease, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- 공용: 얼굴 프레이밍(s1~s5 전부 같은 크기·위치로 컷 전환 시 점프 방지) ---------------- */

const BUST_SIZE = 940;
const BUST_TOP = 460;
const BUST_LEFT = (W - BUST_SIZE) / 2;

/** BUST_VIEWBOX('236 132 780 780') 로컬 좌표(RIG 앵커) -> 화면 좌표 변환.
 *  SneezeReflexDiagram/BustActor 가 전부 이 viewBox 로 얼굴을 크롭하므로, 같은 size/x/y 로
 *  겹쳐 부른 경우 이 변환 하나로 어느 오버레이의 앵커든 화면 위치를 구할 수 있다. */
const VB_X0 = 236;
const VB_Y0 = 132;
const VB_SPAN = 780;
function overlayToScreen(pt: { x: number; y: number }, size: number, x: number, y: number) {
  const scale = size / VB_SPAN;
  return { x: x + (pt.x - VB_X0) * scale, y: y + (pt.y - VB_Y0) * scale };
}

const EYE_SCREEN = overlayToScreen(SNEEZE_EYE_PT, BUST_SIZE, BUST_LEFT, BUST_TOP);

/* ---------------- S1: 재채기 직전 -> 순식간에 눈을 질끈 감으며 재채기 (바스트샷) ---------------- */

export const S1Sneeze: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);

  // 빌드업(간지럼 참는 중) -> 스냅(순식간에 재채기) -> 릴리즈(가라앉으며 눈이 반쯤 풀림)
  const buildT = progress(f, 18, 66);
  const snapT = progress(f, 66, 76);
  const releaseT = progress(f, 110, frames - 6);

  const eyeBuild = 1 - 0.3 * buildT; // 1 -> 0.7 (참으며 살짝 찡그림)
  const mouthBuild = 0.45 - 0.2 * buildT; // 0.45 -> 0.25 (입을 오므리며 참음)
  const eyeSnap = eyeBuild + (0.1 - eyeBuild) * snapT; // -> 0.10 질끈 감김
  const mouthSnap = mouthBuild + (1 - mouthBuild) * snapT; // -> 1.0 활짝
  const eyeOpen = eyeSnap + (0.55 - eyeSnap) * releaseT; // 재채기 직후 눈이 반쯤 풀리며 뜨임
  const mouthOpen = mouthSnap + (0.32 - mouthSnap) * releaseT;

  // 참는 동안 살짝 뒤로, 재채기가 터지는 순간 앞으로 훅 숙이는 머리 움직임
  const headJerk = -8 * buildT * (1 - snapT) + 15 * snapT * (1 - 0.5 * releaseT);

  const pose: Pose = {
    ...POSES.idle,
    headTilt: (POSES.idle.headTilt ?? 0) + headJerk,
    eyeOpen,
    mouthOpen,
    blush: 1 + 0.35 * snapT,
  };

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/** s1 안에서 재채기가 터지는 순간(스냅 중간 지점) - Episode.tsx 가 sneeze_burst.mp3 를
 *  이 프레임에 맞춰 배치한다 */
export const S1_SNEEZE_SFX_AT_FRAME = 72;

/* ---------------- S2: 코 자극 -> 뇌로 올라가는 신호 ---------------- */

export const S2Ascend: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const itchGlow = progress(f, 4, 20) * (1 - progress(f, 96, 128));
  const ascendProgress = progress(f, 24, frames - 24);
  const labelP = progress(f, frames - 34, frames - 12);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <SneezeReflexDiagram
        width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP}
        itchGlow={itchGlow} ascendProgress={ascendProgress}
      />
      <Label
        x={CX} y={260} text={t.s2Label} size={52} color={C.ink}
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 뇌 -> 코·입 / 눈꺼풀 두 갈래로 동시 분기 ---------------- */

export const S3Branch: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  // s2 에서 이어지는 상태를 명시적으로 유지한다 (원칙: 다음 장면에서 이전 상태 리셋 금지)
  const branchProgress = progress(f, 10, frames - 24);
  const labelP = progress(f, frames - 30, frames - 8);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <SneezeReflexDiagram
        width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP}
        ascendProgress={1} branchProgress={branchProgress}
      />
      {/* 얼굴 위 마커(코·입/눈꺼풀)와 겹치지 않도록 라벨은 머리 위쪽에 색으로 짝지어 배치 */}
      <Label
        x={CX - 150} y={260} text={t.s3LabelMouth} size={50} color={C.coral}
        style={{ opacity: labelP }}
      />
      <Label
        x={CX + 150} y={260} text={t.s3LabelEye} size={50} color={C.waterCool}
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 코·입 아이콘과 눈꺼풀 아이콘이 정확히 같은 타이밍에 반짝 ---------------- */

export const S4Sync: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const fadeEdge = Math.min(progress(f, 0, 18), 1 - progress(f, frames - 18, frames));
  const syncPulse = Math.max(0, 0.5 + 0.5 * Math.sin((f / 15) * Math.PI * 2)) * fadeEdge;

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <SneezeReflexDiagram
        width={BUST_SIZE} x={BUST_LEFT} y={BUST_TOP}
        ascendProgress={1} branchProgress={1} syncPulse={syncPulse}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 보호 효과? - 눈 앞에서 먼지·침방울이 튕겨나감 ---------------- */

type Pt = { x: number; y: number };
const lerpPt = (a: Pt, b: Pt, u: number): Pt => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });

const PARTICLE_SIZE = 66;

const ParticleIcon: React.FC<{ pos: Pt; opacity: number; icon: string; color: string }> = ({
  pos, opacity, icon, color,
}) => (
  <div style={{ position: 'absolute', left: pos.x - PARTICLE_SIZE / 2, top: pos.y - PARTICLE_SIZE / 2, opacity }}>
    <ThemedIcon name={icon} size={PARTICLE_SIZE} color={color} strokePx={11} />
  </div>
);

export const S5Protect: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const pose: Pose = { ...POSES.idle, eyeOpen: 0.72 };

  const approachT = progress(f, 16, 92);
  const deflectT = progress(f, 92, frames - 34);
  const fadeOut = 1 - progress(f, frames - 40, frames - 10);
  const enterA = Math.min(1, progress(f, 16, 40) * 2);

  const dropStart: Pt = { x: EYE_SCREEN.x - 300, y: EYE_SCREEN.y - 240 };
  const dropArrive: Pt = { x: EYE_SCREEN.x - 46, y: EYE_SCREEN.y - 30 };
  const dropDeflect: Pt = { x: EYE_SCREEN.x - 320, y: EYE_SCREEN.y - 330 };
  const dustStart: Pt = { x: EYE_SCREEN.x + 300, y: EYE_SCREEN.y - 240 };
  const dustArrive: Pt = { x: EYE_SCREEN.x + 46, y: EYE_SCREEN.y - 30 };
  const dustDeflect: Pt = { x: EYE_SCREEN.x + 320, y: EYE_SCREEN.y - 330 };

  const dropPos = approachT < 1 ? lerpPt(dropStart, dropArrive, approachT) : lerpPt(dropArrive, dropDeflect, deflectT);
  const dustPos = approachT < 1 ? lerpPt(dustStart, dustArrive, approachT) : lerpPt(dustArrive, dustDeflect, deflectT);

  const shieldPulse = buildPeakRelease(f, 84, 8, 12, 22);

  const labelP = progress(f, 20, 44);

  return (
    <PlainBg top={C.seaTop} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} />
      {shieldPulse > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: EYE_SCREEN.x - 60 * (0.6 + shieldPulse),
            top: EYE_SCREEN.y - 60 * (0.6 + shieldPulse),
            width: 120 * (0.6 + shieldPulse),
            height: 120 * (0.6 + shieldPulse),
            borderRadius: '50%',
            border: `7px solid ${C.waterCool}`,
            opacity: shieldPulse * 0.8,
          }}
        />
      ) : null}
      <ParticleIcon pos={dropPos} opacity={enterA * fadeOut} icon="droplet" color={C.waterCool} />
      <ParticleIcon pos={dustPos} opacity={enterA * fadeOut} icon="meteor" color={C.gold} />
      <QMark
        size={90}
        style={{ left: CX - 45, top: 190, opacity: labelP }}
      />
      <Label x={CX} y={300} text={t.s5Label} size={54} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 눈알이 튀어나온다는 속설 - 사실 아님 ---------------- */

const EYEBALL_SIZE = 300;
const X_SIZE = 340;

export const S6Myth: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const eyeScale = bounceIn(f, FPS, 10);
  const xScale = bounceIn(f, FPS, 44);
  const labelP = progress(f, 60, 86);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <PopIn cx={CX} cy={760} size={EYEBALL_SIZE} progress={eyeScale} fromScale={0.2} fadeInBy={0.5}>
        <ThemedIcon name="eye" size={EYEBALL_SIZE} color={C.ink} />
      </PopIn>
      <PopIn cx={CX} cy={760} size={X_SIZE} progress={xScale} fromScale={0.2} fadeInBy={0.5}>
        <ThemedIcon name="x" size={X_SIZE} color={C.coral} strokePx={20} />
      </PopIn>
      <Label x={CX} y={1000} text={t.s6LabelA} size={54} color={C.ink} style={{ opacity: labelP }} />
      <Label x={CX} y={1064} text={t.s6LabelB} size={44} color={C.coral} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
