/** 이 화(general-ep08, "소름이 오돌토돌 돋는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 */
import React from 'react';
import {
  Actor, Appear, C, Caption, FEET_VB, FPS, GOOSEBUMP_SKIN_ONLY_CENTER_X, GOOSEBUMP_VB_H,
  GOOSEBUMP_VB_W, GoosebumpDiagram, Label, PlainBg, POSES, RadialSpikes, RIG, Shake, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** GoosebumpDiagram 을 화면 중앙에 놓기 위한 x 좌표. 실루엣이 안 보일 때(skinOnly)는
 *  실제 그림이 viewBox 왼쪽에 몰려 있어(피부 단면만), 그 시각적 중심을 화면 중앙에 맞춘다. */
function diagramX(width: number, skinOnly: boolean) {
  const centerVb = skinOnly ? GOOSEBUMP_SKIN_ONLY_CENTER_X : GOOSEBUMP_VB_W / 2;
  return CX - centerVb * (width / GOOSEBUMP_VB_W);
}
function diagramHeight(width: number) {
  return width * (GOOSEBUMP_VB_H / GOOSEBUMP_VB_W);
}

/* ---------------- 캐릭터 배치 공통 (viewBox 좌표 -> 화면 좌표) ----------------
 * 캐릭터 배치 공식(Actor.tsx)과 동일하게 계산해 몸통 위치에 오버레이를 붙인다
 * (general-ep01 S1Bite, general-ep05 S1Burst 와 동일한 패턴).
 */
const ACTOR_SIZE = 1550;
const ACTOR_GROUND = 1260;

/** 캐릭터 몸통 전체를 감싸는 대략의 타원(viewBox 기준) -> 화면 좌표. RadialSpikes(냉기 선)를
 *  몸 주위에 두를 때 이 타원 경계에서 바깥으로 뻗게 한다. 머리 위쪽(HEAD_CY - 최대 반경 약
 *  257)부터 발끝(FEET_VB)까지를 세로로, 머리 최대 폭보다 살짝 넉넉하게 가로로 잡았다 -
 *  팔이 벌어져도 스파이크가 손을 가리지 않도록 가로는 보수적으로(머리 폭 기준) 잡는다. */
const AURA_VB_TOP = 190;
const AURA_VB_RX = 280;

function bodyAuraScreenPos(size: number, centerX: number, ground: number) {
  const top = ground - (FEET_VB * size) / RIG.H;
  const scale = size / RIG.W;
  const vbCy = (AURA_VB_TOP + FEET_VB) / 2;
  const vbRy = (FEET_VB - AURA_VB_TOP) / 2;
  return { cx: centerX, cy: top + vbCy * scale, rx: AURA_VB_RX * scale, ry: vbRy * scale };
}

/* ---------------- S1: 찬바람 -> 몸을 웅크리고 떨림 -> 소름 (무성) ----------------
 * 사용자 피드백 이력:
 *  1) (2026-08-20) "오돌토돌을 좀 이상하게 했는데 추워서 떠는듯한 모션을 넣은 뒤 어라 피부가
 *     왜 오돌토돌해졌지 이렇게 하면 될 거 같다" - 몸을 웅크려 추위를 표현 -> 좌우로 미세하게
 *     빠르게 떠는 구간을 확실히 넣는 구조로 재구성(현재도 유지).
 *  2) (2026-08-21) "추워서 떠는게 아니라 지진같아 캐릭터만 떨리도록하고 추위를 표현하는
 *     뾰족한 선 같은걸 몸 주위에 둘르면 돼 그리고 너가 표현한 점 여러개 나오는건 없애 엄청
 *     징그러워" - amp=9 그대로면 프레임마다 부호가 거의 무작위로 뒤집혀(2.2rad/frame 은 표본
 *     주기가 2.86프레임이라 Nyquist 에 가까움) 큰 진폭이 여러 프레임 유지되는 것처럼 보여
 *     "지진"으로 읽혔다. amp 를 9->3.2 로 낮추고 freq 를 2.2->3.4 로 올려 "덜덜거리는 고주파
 *     미세 진동"으로 바꿨다(Shake 는 흔드는 대상을 Actor 하나로만 좁혀 배경은 원래도 흔들리지
 *     않았다 - PlainBg 는 Shake 바깥에서 그려진다). 팔뚝 위 점 여러 개(BumpCluster/BumpDot)는
 *     완전히 제거했고, 대신 RadialSpikes(냉기 선, assets/scenes/Effects.tsx 신설)를 몸 둘레에
 *     둘렀다 - 피부에 닿지 않고 바깥으로만 뻗는 방사형 스파이크라 "피부 위에 작은 요소 반복"
 *     문제가 재현되지 않는다. "오돌토돌해진 피부"는 이제 화면에 직접 그리지 않고(피부 위 반복
 *     요소를 아예 쓰지 않기로 한 결정), S2 의 리액션(놀란 표정 + "왜 이렇게 오돌토돌하지?"
 *     대사)과 S3 의 클로즈업 다이어그램(GoosebumpDiagram)이 그 몫을 담당한다. */

const SHRUG_BLEND_END = 20;
const SHIVER_AT = 8;
/** 진폭을 낮춘 대신(9->3.2) 프레임당 위상(freq)을 2.2->3.4 로 올려 "잘게 떠는" 느낌을 낸다.
 *  duration=50 이라 감쇠가 아주 느슨하게 SHIVER_AT+50=58 프레임 부근에서 0에 수렴한다. */
const SHIVER_DURATION = 50;
const SHIVER_AMP = 3.2;
const SHIVER_FREQ = 3.4;
/** 냉기 선(RadialSpikes) 등장/유지/소멸 구간. 떨림과 거의 같이 나타났다가, 떨림이 잦아들고도
 *  조금 더 남아있다(체감 냉기는 떨림보다 살짝 늦게 가심) 서서히 사라진다. */
const AURA_FADE_IN_END = SHIVER_AT + 16;
const AURA_HOLD_END = 68;
const AURA_FADE_OUT_END = 88;
/** 마지막까지 애니메이션이 다 끝난 뒤 잠깐 정지 상태로 보여주고 s2 로 넘어간다(애니메이션이
 *  끝나자마자 컷 되면 뚝 끊긴 느낌이 나서 여유 프레임을 둔다). */
export const S1_TOTAL_FRAMES = 96; // 3.2초

export const S1Shrug: React.FC<{ f: number }> = ({ f }) => {
  const blendT = progress(f, 0, SHRUG_BLEND_END);
  const pose: Pose = blendPose(POSES.idle, POSES.shrug, blendT);
  const aura = bodyAuraScreenPos(ACTOR_SIZE, CX, ACTOR_GROUND);
  const auraIn = progress(f, SHIVER_AT, AURA_FADE_IN_END);
  const auraOut = 1 - progress(f, AURA_HOLD_END, AURA_FADE_OUT_END);
  const auraP = Math.max(0, Math.min(auraIn, auraOut));

  return (
    <PlainBg ground={ACTOR_GROUND} groundColor={C.hill}>
      <Shake frame={f} at={SHIVER_AT} duration={SHIVER_DURATION} amp={SHIVER_AMP} freq={SHIVER_FREQ}>
        <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} />
        <RadialSpikes
          cx={aura.cx} cy={aura.cy} rx={aura.rx} ry={aura.ry} frame={f} progress={auraP}
          count={14} length={30} width={7} color={C.waterCool}
        />
      </Shake>
    </PlainBg>
  );
};

/* ---------------- S2: "어, 팔이 왜 이렇게 오돌토돌하지?" (전신 리액션) ----------------
 * 팔뚝 위 점 여러 개(BumpCluster/BumpDot) 완전 제거(2026-08-21, "징그럽다" 피드백).
 * 대체 후보로 팔뚝 뒤에 PulseRing(원 하나, 피부 질감 흉내 아님) 을 깔아 "여기를 보고
 * 있다"는 힌트를 주는 안도 만들어 비교했으나, POSES.surprised 는 두 팔을 번쩍 든 자세라
 * 링이 손목 옆에 애매하게 떠 있어 "팔을 가리키는 표시"로 잘 안 읽혔다(있으나 없으나
 * 차이가 거의 안 보임 - f245 With/Without 스틸 비교). 애매하면 단순한 쪽을 고른다는
 * 원칙에 따라 없앴다 - 이 장면은 놀란 표정 + 대사 + 자막만으로 전달한다. */

export const S2Surprised: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg ground={ACTOR_GROUND} groundColor={C.hill}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={POSES.surprised} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 입모근 수축 -> 돌기 애니메이션 + 이름 라벨 ---------------- */

export const S3Muscle: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const line = activeLine(lines, f / FPS);
  const c = progress(f, 10, Math.round(frames * 0.55));
  const labelP = progress(f, Math.round(frames * 0.42), Math.round(frames * 0.42) + 16);
  const DIAG_WIDTH = 760;
  const diagY = 440;

  return (
    <PlainBg ground={null}>
      <GoosebumpDiagram width={DIAG_WIDTH} x={diagramX(DIAG_WIDTH, true)} y={diagY} contractProgress={c} />
      <Appear progress={labelP} from="up">
        <Label x={CX} y={diagY + diagramHeight(DIAG_WIDTH) + 30} text={label} size={50} align="center" wrapWidth={900} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 조상 실루엣 비교 (등장 -> 소멸) ---------------- */

export const S4Vestige: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const line = activeLine(lines, f / FPS);
  const riseEnd = Math.round(frames * 0.4);
  const fallStart = Math.round(frames * 0.66);
  const fallEnd = Math.round(frames * 0.9);
  const vestige = Math.max(0, Math.min(progress(f, 16, riseEnd), 1 - progress(f, fallStart, fallEnd)));
  const labelP = progress(f, 6, 22);
  const DIAG_WIDTH = 820;
  const diagY = 400;

  return (
    <PlainBg ground={null}>
      <GoosebumpDiagram
        width={DIAG_WIDTH} x={diagramX(DIAG_WIDTH, false)} y={diagY}
        contractProgress={1} vestigeProgress={vestige}
      />
      <Appear progress={labelP} from="up">
        <Label x={CX} y={diagY + diagramHeight(DIAG_WIDTH) + 20} text={label} size={50} align="center" wrapWidth={900} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 돌기 애니메이션 재생 + 고양이/고슴도치 라벨 순차 팝인 ---------------- */

const Chip: React.FC<{ cx: number; cy: number; text: string; p: number }> = ({ cx, cy, text, p }) => (
  <Appear progress={p} from="scale" origin="50% 50%">
    <div
      style={{
        position: 'absolute', left: cx, top: cy, transform: 'translateX(-50%)',
        width: 300, padding: '26px 18px', borderRadius: 28,
        background: C.paper, border: `7px solid ${C.ink}`, textAlign: 'center',
        fontWeight: 700, fontSize: 46, color: C.ink, whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  </Appear>
);

export const S5Animals: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; animal1: string; animal2: string; tagline: string;
}> = ({ f, frames, lines, animal1, animal2, tagline }) => {
  const line = activeLine(lines, f / FPS);
  const c = progress(f, 8, Math.round(frames * 0.45));
  const DIAG_WIDTH = 480;
  const diagY = 230;
  const chipY = diagY + diagramHeight(DIAG_WIDTH) + 50;
  const p1 = progress(f, Math.round(frames * 0.1), Math.round(frames * 0.1) + 14);
  const p2 = progress(f, Math.round(frames * 0.28), Math.round(frames * 0.28) + 14);
  const tagP = progress(f, Math.round(frames * 0.46), Math.round(frames * 0.46) + 14);

  return (
    <PlainBg ground={null}>
      <GoosebumpDiagram width={DIAG_WIDTH} x={diagramX(DIAG_WIDTH, true)} y={diagY} contractProgress={c} />
      <Chip cx={CX - 160} cy={chipY} text={animal1} p={p1} />
      <Chip cx={CX + 160} cy={chipY} text={animal2} p={p2} />
      <Appear progress={tagP} from="up">
        <Label x={CX} y={chipY + 150} text={tagline} size={54} color={C.coral} align="center" wrapWidth={900} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 영어 단어 vs 한국어 단어 ---------------- */

export const S6WordOrigin: React.FC<{
  f: number; lines: CaptionLine[]; word: string; meaning: string;
}> = ({ f, lines, word, meaning }) => {
  const line = activeLine(lines, f / FPS);
  const p1 = progress(f, 6, 24);
  const p2 = progress(f, 22, 40);

  return (
    <PlainBg ground={null}>
      <Appear progress={p1} from="scale" origin="50% 50%">
        <Label x={CX} y={760} text={word} size={104} color={C.coral} align="center" wrapWidth={960} />
      </Appear>
      <Appear progress={p2} from="up">
        <Label x={CX} y={920} text={meaning} size={54} align="center" wrapWidth={960} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
