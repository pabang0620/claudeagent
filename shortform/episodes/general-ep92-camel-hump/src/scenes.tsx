/** 이 화(general-ep92, "낙타 혹에 물이 들어 있지 않은 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(낙타가 사막을 걸어가고 카메라가 혹으로 줌인, 무성) -> s2(BustActor 리액션 "혹 안에
 *  물이 가득 차 있는 거 아니었어?") -> s3(CamelHumpDiagram revealProgress - 물방울에 큰
 *  X, 지방으로 채워짐) -> s4(같은 다이어그램 breakdownProgress - 지방이 살짝 줄고 부산물
 *  물방울 2개만 새어나옴) -> s5(CompareBars - 부산물 물 vs 낙타에게 필요한 물, 수치 없이
 *  길이 비율로만 비교) -> s6(DesertBg pond + Camel drink - 물웅덩이에서 벌컥벌컥 마심) ->
 *  s7(CamelHumpDiagram 정지 컷 + "지방 창고" 라벨 + 낙타 실루엣 마무리).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 혹 안이 물이 아니라 지방으로 가득한 것을 보여주는 단면이 이 화의 중심이다. 지방은
 *     크고 단순한 노란빛 도형으로(CamelHumpDiagram 내부에 이미 반영 - 큰 도형 1개+하이라이트
 *     1개만, 작은 점을 뿌리지 않는다).
 *   - 낙타는 단순하고 귀여운 도형(Camel)으로 그린다.
 *   - s6 "벌컥벌컥" 장면은 과장해서 우스꽝스럽게 그리지 않는다 - 목을 숙여 마시는 자세 +
 *     옅은 파동 링 정도로만 표현한다.
 *   - 사막·낙타 실루엣은 단순하게 그린다(DesertBg의 모래언덕 실루엣, 선인장·바위 없음).
 *
 *  70화 사고 재발 방지: s3의 X 표시는 반드시 "물방울" 위에만 찍는다. 지방(정답) 쪽에는
 *  어떤 부정 기호도 얹지 않는다 - CamelHumpDiagram 내부에 그렇게 고정돼 있다(waterGroupOpacity
 *  안에만 X 마크가 있고 fat 그룹에는 없음, 소품 자체 설계로 스틸 검수 시 재확인한다).
 */
import React from 'react';
import {
  BustActor, C, Camel, CamelHumpDiagram, Caption, CompareBars, DesertBg, FPS, GROUND, Label,
  PlainBg, POSES, PulseRing, W,
  CAMEL_HUMP_LABEL_PT, CAMEL_HUMP_VB_W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** Camel(viewBox 640x1000, 발끝 vb y=950)을 화면 좌표에 세운다. Actor 의 grounding 방식과
 *  같은 계산을 Camel 전용으로 로컬 구현했다(Giraffe/ep80 giraffeStyle 과 동일 원칙 - Camel
 *  자체엔 x/y 가 없다, REGISTRY 규약 그대로 - 이 화만 쓰는 배치 계산이라 지역성 우선). */
function camelStyle(centerX: number, renderWidth: number, groundY: number = GROUND): React.CSSProperties {
  const h = (renderWidth * 1000) / 640;
  return { position: 'absolute', left: centerX - renderWidth / 2, top: groundY - h * 0.95, width: renderWidth };
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 낙타가 사막을 걸어가고, 카메라가 혹으로 줌인 (무성)
 * ============================================================ */
const S1_CAMEL_W = 500;
const S1_START_X = 300;
const S1_END_X = 640;
/** 낙타 걸음 중 몸이 살짝 위아래로 흔들리는 지점(보폭 1회 완주 근처) - 이 프레임에서
 *  hop_thump(부드러운 발소리, 원칙 7)를 재생한다. Episode.tsx가 이 상수를 그대로 쓴다. */
export const S1_STEP_AT = 40;

export const S1Walk: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const walkEnd = Math.max(30, frames - 24);
  const walkP = progress(f, 4, walkEnd);
  const zoomP = progress(f, Math.round(frames * 0.42), frames);
  const centerX = S1_START_X + (S1_END_X - S1_START_X) * walkP;
  const bob = walkP > 0 && walkP < 1 ? Math.sin(f / 6) * 5 : 0;
  const scale = 1 + 0.85 * zoomP;

  return (
    <>
      <DesertBg night={false} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: '62% 47%' }}>
        <div style={{ ...camelStyle(centerX, S1_CAMEL_W), transform: `translateY(${bob}px)` }}>
          <Camel width={S1_CAMEL_W} drink={0} />
        </div>
      </div>
    </>
  );
};

/* ============================================================
 * S2: "혹 안에 물이 가득 차 있는 거 아니었어?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;
const S2_CAMEL_W = 230;
const S2_CAMEL_X = W - 300;
const S2_CAMEL_GROUND = 1420;

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
      {/* 지금 얘기하고 있는 그 혹 - s3~s5가 설명할 대상을 먼저 눈에 담아둔다 */}
      <div style={camelStyle(S2_CAMEL_X, S2_CAMEL_W, S2_CAMEL_GROUND)}>
        <Camel width={S2_CAMEL_W} drink={0} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 혹 단면 - 물방울(오해)에 X, 지방(정답)으로 채워짐
 * ============================================================ */
const S3_DIAG_W = 720;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 520;

export const S3Reveal: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const revealProgress = progress(f, 6, Math.max(30, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CamelHumpDiagram
        width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y}
        revealProgress={revealProgress} breakdownProgress={0}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 같은 단면 - 지방이 살짝 줄고 부산물 물방울 2개만 새어나옴
 * ============================================================ */
export const S4Breakdown: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const breakdownProgress = progress(f, 10, Math.max(30, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CamelHumpDiagram
        width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y}
        revealProgress={1} breakdownProgress={breakdownProgress}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 부산물 물 vs 낙타에게 필요한 물 (CompareBars, 수치 없이 길이 비율만)
 * ============================================================ */
const S5_BAR_X = 170;
const S5_BAR_Y = 800;
const S5_PX_PER_UNIT = 64;

export const S5Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CompareBars
        x={S5_BAR_X} y={S5_BAR_Y} pxPerUnit={S5_PX_PER_UNIT} rowGap={280} labelGap={64} frame={f}
        labelSize={48} items={[
          { label: t.s5WaterLabel, value: 1, at: 6, color: C.waterCool, thickness: 64 },
          { label: t.s5NeedLabel, value: 9, at: 30, color: C.gold, thickness: 64 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 물웅덩이 앞에서 벌컥벌컥 마심
 * ============================================================ */
const S6_CAMEL_W = 560;
const S6_CAMEL_GROUND = GROUND;
/** 립싱크 없는 동물 장면이지만, 원칙 7에 따라 "마시는" 핵심 액션에 sip_slurp SFX를
 *  붙인다. Episode.tsx가 이 상수를 그대로 가져다 쓴다(고개가 다 숙여진 직후). */
export const S6_SIP_AT = 52;

export const S6Drink: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dip = progress(f, 10, 48);
  /** 목만 숙이는 것으로는 앞다리 너머 물웅덩이까지 닿지 않아(스틸 선점검에서 발견 -
   *  머리가 다리 사이로 꽂혀 보임), 낙타 전체를 물가 쪽으로 더 낮게 기울인다 */
  const leanY = dip * 190;
  const leanX = dip * 60;
  const rippleP = clamp01(progress(f, 50, frames));

  return (
    <>
      <DesertBg night={false} pond={1} />
      <div
        style={{
          ...camelStyle(CX - 60, S6_CAMEL_W, S6_CAMEL_GROUND),
          transform: `translate(${leanX}px, ${leanY}px)`,
        }}
      >
        <Camel width={S6_CAMEL_W} drink={dip} />
      </div>
      {/* 물결 링 - 낙타 입 옆 수면 위(스틸 선점검으로 머리에 겹치지 않는 자리를 실측) */}
      {rippleP > 0 ? (
        <>
          <PulseRing x={830} y={1330} size={80} frame={f} progress={rippleP} color={C.paper} opacity={0.55} />
          <PulseRing x={890} y={1360} size={54} frame={f + 20} progress={rippleP} color={C.paper} opacity={0.45} />
        </>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </>
  );
};

/* ============================================================
 * S7: 혹 단면이 다시 지방으로 가득한 정지 컷 + "지방 창고" 라벨 + 낙타 마무리
 * ============================================================ */
const S7_DIAG_W = 560;
const S7_DIAG_X = CX - S7_DIAG_W / 2;
const S7_DIAG_Y = 300;
const S7_DIAG_SCALE = S7_DIAG_W / CAMEL_HUMP_VB_W;
const S7_LABEL_Y = S7_DIAG_Y + CAMEL_HUMP_LABEL_PT.y * S7_DIAG_SCALE;
const S7_CAMEL_W = 460;

export const S7Final: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const popT = progress(f, 4, 22);
  const labelP = progress(f, 14, 34);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={GROUND + 40} groundColor={C.hill}>
      <div style={{ position: 'absolute', left: S7_DIAG_X, top: S7_DIAG_Y, transform: `scale(${0.9 + 0.1 * popT})`, transformOrigin: '50% 30%', opacity: popT }}>
        <CamelHumpDiagram width={S7_DIAG_W} x={0} y={0} revealProgress={1} breakdownProgress={0} />
      </div>
      <Label
        x={CX} y={S7_LABEL_Y} text={t.s7FatLabel} size={52} color={C.ink} align="center"
        style={{ opacity: labelP, transform: `translate(-50%, ${(1 - labelP) * 14}px)` }}
      />
      <div style={camelStyle(CX, S7_CAMEL_W, GROUND + 40)}>
        <Camel width={S7_CAMEL_W} drink={0} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
