/** 이 화(general-ep100, "사람이 자꾸 궁금해지는 이유", 21~100화 시리즈 마지막 화) 전용
 *  장면. 문구는 전부 strings.ts에서 읽는다(언어 무관 컴포넌트).
 *
 *  100화이지만 대본에 자축·감사 인사·구독 유도 문구가 없어(오케스트레이터 지시) 화면
 *  연출도 다른 화와 동일한 담백한 톤으로 만든다 - 특별 연출을 추가하지 않는다.
 *
 *  s1(캐릭터가 걷다 멈춰 이상한 구름을 올려다봄, 무성) -> s2(BustActor 리액션 "이렇게
 *  사소한 것도 자꾸 궁금해지네") -> s3(뇌 아이콘 + NerveSignal로 "예측" 화살표가 점선
 *  프레임까지 뻗어나감) -> s4(같은 점선 프레임 옆에 실선 프레임이 어긋나게 겹쳐 나타나며
 *  충돌 스파크 + PulseRing = "예측과 실제가 안 맞아떨어짐") -> s5(뇌 옆에 QMark 팝인 =
 *  "이게 호기심") -> s6(뇌 위로 Sparkles = 보상) -> s7(캐릭터가 담담하게 다시 걸음) ->
 *  s8(지금까지 다룬 소재를 상징하는 작은 아이콘들이 화면 가장자리에 옅게 스쳐가는 마무리).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 예측-불일치-호기심-해소-보상의 반복 구조가 중심. 뇌는 45화 MemoryOverlapDiagram과
 *     같은 원칙으로 사실적으로 그리지 않고 ThemedIcon "brain" 하나로 추상화한다(신체
 *     표현은 최소한으로).
 *   - s8은 지난 화들을 과시하듯 나열하지 않는다 - 작은 아이콘 6개를 낮은 불투명도로
 *     가장자리에만 옅게 흘려보낸다(화면 중앙의 캡션·캐릭터를 가리지 않음).
 *   - 걷는 동작은 팔다리를 관절별로 흔드는 리깅을 새로 만들지 않는다(퍼둥이 캐릭터
 *     리깅 금지 원칙과 같은 맥락) - camelStyle 걷기(ep92 S1Walk)와 동일한 방식으로
 *     "몸 전체 좌우 이동 + 미세한 상하 bob"만으로 걷는 인상을 낸다.
 *
 *  원칙 7(무성 구간·핵심 액션 효과음): s1이 구름을 알아채는 순간에 realize_ding SFX를
 *  붙인다(ep95 S1_REALIZE_SFX_FRAME과 동일 패턴). Episode.tsx가 S1_REALIZE_SFX_FRAME을
 *  그대로 가져다 쓴다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, GROUND, NerveSignal, PlainBg, POSES, PulseRing,
  QMark, RadialSpikes, Sparkles, ThemedIcon, Appear, W,
  blendPose, buildPeakRelease, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 걷다가 멈춰서 이상하게 생긴 구름을 올려다본다 (무성)
 * ============================================================ */
const S1_ACTOR_SIZE = 850;
const S1_START_X = 260;
const S1_STOP_X = CX;
const S1_CLOUD_X = CX + 210;
const S1_CLOUD_Y = 480;
const S1_CLOUD_SIZE = 220;
/** 캐릭터가 멈춰 서서 이상한 구름을 알아채는 순간 - Episode.tsx가 이 프레임에
 *  realize_ding SFX를 배치한다(원칙 7, general-ep95 S1_REALIZE_SFX_FRAME과 동일 패턴) */
export const S1_REALIZE_SFX_FRAME = 42;

export const S1Walk: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  const walkP = progress(f, 2, 30);
  const centerX = S1_START_X + (S1_STOP_X - S1_START_X) * walkP;
  const bob = walkP > 0 && walkP < 1 ? Math.sin(f / 6) * 5 : 0;
  const lookP = progress(f, 30, 50);
  const cloudP = progress(f, 24, 46);
  const pose: Pose = { headTilt: -16 * lookP, lean: -3 * lookP, eyeOpen: 1 + 0.12 * lookP };

  return (
    <PlainBg>
      <div
        style={{
          position: 'absolute',
          left: S1_CLOUD_X - S1_CLOUD_SIZE / 2,
          top: S1_CLOUD_Y - S1_CLOUD_SIZE / 2,
          opacity: cloudP,
          transform: `scale(${0.8 + 0.2 * cloudP}) scaleX(1.28) scaleY(0.72) rotate(-9deg)`,
        }}
      >
        <ThemedIcon name="cloud" size={S1_CLOUD_SIZE} color={C.ink} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${bob}px)` }}>
        <Actor size={S1_ACTOR_SIZE} centerX={centerX} ground={GROUND} pose={pose} />
      </div>
    </PlainBg>
  );
};

/* ============================================================
 * S2: "이렇게 사소한 것도 자꾸 궁금해지네" 리액션 (바스트샷, 립싱크)
 *  - 소품 없음(리액션 바스트샷 장면에는 소품을 넣지 않는다 원칙)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const pose: Pose = blendPose(POSES.idle, POSES.thinking, 0.85);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 뇌 아이콘 - s3~s6이 공유하는 위치(시각적 연속성)
 * ============================================================ */
const BRAIN_X = CX;
const BRAIN_Y = 760;
const BRAIN_SIZE = 260;
const PRED_BOX = { x: 700, y: 420, w: 260, h: 170 };
const ACT_BOX = { x: 630, y: 480, w: 260, h: 170 };

/* ============================================================
 * S3: 뇌는 늘 다음에 무슨 일이 벌어질지 미리 예상한다 (예측 화살표 -> 점선 프레임)
 * ============================================================ */
export const S3Predict: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const showPath = progress(f, 6, Math.max(30, frames - 26));
  const boxP = progress(f, 18, Math.max(40, frames - 16));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <ThemedIcon
        name="brain" size={BRAIN_SIZE} color={C.ink}
        style={{ position: 'absolute', left: BRAIN_X - BRAIN_SIZE / 2, top: BRAIN_Y - BRAIN_SIZE / 2 }}
      />
      <NerveSignal
        from={{ x: BRAIN_X + BRAIN_SIZE * 0.28, y: BRAIN_Y - BRAIN_SIZE * 0.24 }}
        to={{ x: PRED_BOX.x + PRED_BOX.w / 2, y: PRED_BOX.y + PRED_BOX.h }}
        bow={-30} showPath={showPath} pathColor={C.coral} strokeWidth={9}
      />
      <Appear progress={boxP} from="scale">
        <svg
          width={PRED_BOX.w} height={PRED_BOX.h}
          style={{ position: 'absolute', left: PRED_BOX.x, top: PRED_BOX.y, overflow: 'visible' }}
        >
          <rect
            x={4} y={4} width={PRED_BOX.w - 8} height={PRED_BOX.h - 8} rx={20}
            fill={C.paper} stroke={C.ink} strokeWidth={7} strokeDasharray="14 12"
          />
        </svg>
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 예상이랑 실제로 보이는 게 안 맞아떨어지면 -> 실선 프레임이 어긋나게 겹치며 충돌
 * ============================================================ */
export const S4Mismatch: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const actP = progress(f, 4, 26);
  const spikeT = buildPeakRelease(f, 22, 6, 10, 20);
  const pulseP = progress(f, 4, 20);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PulseRing
        x={BRAIN_X - BRAIN_SIZE * 0.62} y={BRAIN_Y - BRAIN_SIZE * 0.62}
        size={BRAIN_SIZE * 1.24} frame={f} progress={pulseP} color={C.coralSoft} opacity={0.5}
      />
      <ThemedIcon
        name="brain" size={BRAIN_SIZE} color={C.ink}
        style={{ position: 'absolute', left: BRAIN_X - BRAIN_SIZE / 2, top: BRAIN_Y - BRAIN_SIZE / 2 }}
      />
      <svg
        width={PRED_BOX.w} height={PRED_BOX.h}
        style={{ position: 'absolute', left: PRED_BOX.x, top: PRED_BOX.y, overflow: 'visible' }}
      >
        <rect
          x={4} y={4} width={PRED_BOX.w - 8} height={PRED_BOX.h - 8} rx={20}
          fill={C.paper} stroke={C.ink} strokeWidth={7} strokeDasharray="14 12" opacity={0.7}
        />
      </svg>
      <Appear progress={actP} from="scale">
        <svg
          width={ACT_BOX.w} height={ACT_BOX.h}
          style={{ position: 'absolute', left: ACT_BOX.x, top: ACT_BOX.y, overflow: 'visible' }}
        >
          <rect
            x={4} y={4} width={ACT_BOX.w - 8} height={ACT_BOX.h - 8} rx={20}
            fill={C.goldSoft} stroke={C.ink} strokeWidth={7}
          />
        </svg>
      </Appear>
      <RadialSpikes
        cx={(PRED_BOX.x + PRED_BOX.w / 2 + ACT_BOX.x + ACT_BOX.w / 2) / 2}
        cy={(PRED_BOX.y + PRED_BOX.h / 2 + ACT_BOX.y + ACT_BOX.h / 2) / 2}
        rx={40} ry={36} frame={f} progress={spikeT} count={12} length={38} width={9} color={C.coral}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 이게 바로 호기심이에요 (뇌 옆 QMark 팝인)
 * ============================================================ */
export const S5Curiosity: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const qP = progress(f, 4, 22);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <ThemedIcon
        name="brain" size={BRAIN_SIZE} color={C.ink}
        style={{ position: 'absolute', left: BRAIN_X - BRAIN_SIZE / 2, top: BRAIN_Y - BRAIN_SIZE / 2 }}
      />
      <Appear progress={qP} from="scale" style={{ position: 'absolute', left: BRAIN_X + 150, top: BRAIN_Y - 300 }}>
        <QMark size={150} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 궁금증이 풀리는 순간 뇌에서 기분 좋은 반응 (Sparkles)
 * ============================================================ */
export const S6Reward: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  /** Sparkles의 t는 정지된 정점(plateau)이 아니라 계속 올라가는 progress여야 각
   *  파티클의 위상(ph)별로 순차적으로 부풀었다 옅어지는 "반짝임"이 실제로 보인다
   *  (t를 buildPeakRelease로 고정하면 전 파티클이 t=1 근방에 몰려 sin(pi*1)=0이 되어
   *  아무것도 안 보이는 결함을 스틸 선점검에서 발견 - general-ep81/86과 동일하게
   *  progress()로 계속 흘려보낸다). */
  const sparkT = progress(f, 6, Math.max(20, frames - 20));
  const ringP = progress(f, 4, 26);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} stop={0.5} ground={null}>
      <PulseRing
        x={BRAIN_X - BRAIN_SIZE * 0.58} y={BRAIN_Y - BRAIN_SIZE * 0.58}
        size={BRAIN_SIZE * 1.16} frame={f} progress={ringP} color={C.goldSoft} opacity={0.6}
      />
      <ThemedIcon
        name="brain" size={BRAIN_SIZE} color={C.ink}
        style={{ position: 'absolute', left: BRAIN_X - BRAIN_SIZE / 2, top: BRAIN_Y - BRAIN_SIZE / 2 }}
      />
      <Sparkles
        box={{ x: BRAIN_X - 220, y: BRAIN_Y - 260, w: 440, h: 440 }}
        t={sparkT}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 사람이 자꾸 '왜?'를 묻는 건, 뇌가 원래 그렇게 만들어져 있어서 (다시 걸음)
 * ============================================================ */
const S7_ACTOR_SIZE = 850;
const S7_START_X = CX;
/** S8(마무리 몽타주)의 캐릭터가 CX(화면 중앙)에 다시 나타나므로, s7 끝에서 너무 멀리
 *  걸어가면 s7->s8 크로스페이드 구간(6프레임)에서 서로 다른 위치의 두 캐릭터가 겹쳐
 *  보이는 잔상이 두드러진다(스틸 선점검에서 발견 - 21화 이후 결함 "장면 전환 시 캐릭터
 *  잔상" 항목). 걷는 느낌은 유지하되 도착점을 중앙 가까이로 좁혔다. */
const S7_END_X = CX + 100;

export const S7Resume: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));
  const walkP = progress(f, 0, frames);
  const centerX = S7_START_X + (S7_END_X - S7_START_X) * walkP;
  const bob = Math.sin(f / 6) * 5;
  const pose: Pose = { headTilt: 0, lean: 0 };

  return (
    <PlainBg>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${bob}px)` }}>
        <Actor size={S7_ACTOR_SIZE} centerX={centerX} ground={GROUND} pose={pose} mouthOpen={mouthOpen} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 지금까지 다뤄온 사소한 질문들도 다 이 호기심에서 시작됨 (마무리 몽타주)
 *  - 이전 화 소재를 상징하는 작은 아이콘 6개가 가장자리에서 옅게 흘러간다.
 *    화면 중앙(캐릭터·캡션)은 가리지 않는다.
 * ============================================================ */
const S8_ACTOR_SIZE = 620;
const S8_ICONS: { name: string; x: number; y: number; size: number; phase: number }[] = [
  { name: 'cloud', x: 150, y: 260, size: 96, phase: 0 },
  { name: 'tree', x: 930, y: 300, size: 96, phase: 11 },
  { name: 'moon', x: 130, y: 640, size: 88, phase: 23 },
  { name: 'paw', x: 950, y: 700, size: 90, phase: 7 },
  { name: 'coffee', x: 160, y: 1000, size: 84, phase: 17 },
  { name: 'leaf', x: 920, y: 1040, size: 88, phase: 29 },
];

export const S8Montage: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const fadeIn = progress(f, 0, 20);
  const fadeOut = 1 - progress(f, Math.max(0, frames - 24), frames);
  const edgeA = Math.min(fadeIn, fadeOut);
  const pose: Pose = blendPose(POSES.idle, POSES.present, 0.35);

  return (
    <PlainBg>
      {S8_ICONS.map((ic, i) => {
        const drift = Math.sin((f + ic.phase * 8) / 90) * 22;
        return (
          <div
            key={ic.name}
            style={{
              position: 'absolute', left: ic.x - ic.size / 2 + drift, top: ic.y - ic.size / 2,
              opacity: 0.4 * edgeA,
            }}
          >
            <ThemedIcon name={ic.name} size={ic.size} color={C.ink} />
          </div>
        );
      })}
      <Actor size={S8_ACTOR_SIZE} centerX={CX} ground={GROUND} pose={pose} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
