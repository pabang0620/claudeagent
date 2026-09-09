/** 이 화(general-ep95, "자고 일어나면 베개가 젖어 있는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(엎드려 자다 깨서 베개의 젖은 침 자국을 발견 - 무성) -> s2(바스트샷 리액션+훅질문
 *  "어? 나 잘 때 침 흘렸나 봐. 이거 왜 이러지?") -> s3(DroolDiagram - 침샘이 계속 침을
 *  만듦) -> s4(같은 다이어그램 - 깨어있을 때 삼킴 반사가 활발, swallowRateBoost 1로 상승)
 *  -> s5(swallowRateBoost 1->0, 잠들며 반사가 느려짐) -> s6(poolLevel 다음 dripProgress -
 *  침이 고이다 흘러나옴) -> s7(DroolDiagram을 작게 두 번 써서 똑바로/옆으로 비교 + 중력
 *  화살표) -> s8(Bed로 복귀, 캐릭터가 어깨를 으쓱하며 웃어넘기는 마무리 - s1과 짝을 이루는
 *  bookend).
 *
 *  s2만 1인칭 리액션 대사(캐릭터가 직접 말을 검)라 mouthAt/mouthProp 립싱크를 쓴다.
 *  나머지(s3~s8)는 전부 3인칭 설명 내레이션이라 립싱크를 쓰지 않는다(general-ep29와 동일
 *  원칙 - 캐릭터가 등장해도 카메라를 보고 직접 말을 거는 장면이 아니면 립싱크 없음).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시) 반영:
 *   - 침이 고이는 것/흘러나오는 것은 DroolDiagram 내부에서 큰 물방울 하나(pool)와 큰
 *     물방울 하나(drip)로만 표현한다(작은 점 무리 금지).
 *   - 옆으로 잔 자세의 중력 방향은 s7에서 화살표 하나로 보여준다.
 *   - 자는 캐릭터(s1)는 편안한 표정(SLEEPY - 눈이 살짝 감기고 팔다리가 늘어짐)으로 그리고,
 *     민망하거나 지저분하게 그리지 않는다.
 *   - 29화 Bed 소품을 s1/s8에 재사용한다(대본 자산 목록 지시).
 *
 *  s1의 "베개 자국을 알아채는" 순간(무성 핵심 액션)에 realize_ding SFX를 붙인다(원칙 7 -
 *  REGISTRY에 "눈을 뜨거나 화면을 보다가 '어?' 하고 알아채는 발견·자각 리액션 전반 재사용
 *  가능"으로 이미 등록돼 있어 그대로 재사용, 새 SFX를 만들지 않는다).
 */
import React from 'react';
import {
  Actor, Bed, BustActor, C, Caption, DROOL_GLAND_LABEL_PT, DroolDiagram, FPS, Label,
  PlainBg, POSES, SW_THIN, ThemedIcon, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2; // 540

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * 로컬 포즈: 잠든 자세 - 눈이 거의 감기고 팔다리가 늘어진다 (편안하게, 민망하지 않게)
 * ============================================================ */
const SLEEPY: Pose = {
  headTilt: 12, lean: 3,
  armL: { s: 30, e: 26 }, armR: { s: -30, e: -26 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
  eyeOpen: 0.05, mouthOpen: 0.03,
};

/* ============================================================
 * 로컬 소품: 젖은 침 자국(WetMark) - s1/s2/s8 공용.
 * BruiseDiagram.blotchPathD 와 같은 기법(고정 각도·반지름 배열로 부드러운 유기적 얼룩을
 * 만드는 표준 기법, Math.random 미사용 - 원칙 3)을 이 화 전용 상수로 다시 적용했다.
 * ============================================================ */
const MARK_ANGLES = [0, 40, 80, 120, 160, 200, 240, 280, 320];
const MARK_RADII = [1.0, 0.8, 1.06, 0.78, 1.1, 0.84, 1.02, 0.8, 1.08];

function wetMarkPathD(cx: number, cy: number, baseR: number): string {
  const n = MARK_ANGLES.length;
  const pts = MARK_ANGLES.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const r = baseR * MARK_RADII[i];
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) * 0.62 };
  });
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => (
    { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  );
  const start = mid(pts[n - 1], pts[0]);
  let d = `M ${start.x} ${start.y}`;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const m = mid(cur, next);
    d += ` Q ${cur.x} ${cur.y} ${m.x} ${m.y}`;
  }
  return `${d} Z`;
}

const WetMark: React.FC<{ cx: number; cy: number; scale?: number; opacity?: number }> = ({
  cx, cy, scale = 1, opacity = 1,
}) => (
  <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    <path
      d={wetMarkPathD(cx, cy, 92 * scale)} fill={C.waterCool} stroke={C.waterCool}
      strokeWidth={SW_THIN * 0.5} opacity={0.55 * opacity}
    />
  </svg>
);

/* ============================================================
 * S1: 자다가 깨서 베개의 젖은 침 자국을 발견 (전신, 무성)
 * ============================================================ */
const S1_ACTOR_SIZE = 1050;
const S1_ACTOR_GROUND = 1500;
const S1_BLANKET_Y = 1200;
const S1_PILLOW_CX = CX;
const S1_PILLOW_Y = S1_BLANKET_Y - 60;
/** 캐릭터 실루엣(size=1050)의 어깨 폭 바깥, 베개 오른쪽 가장자리 안쪽에 자국을 둔다
 *  (원칙 5 스틸 선점검에서 처음 위치 - 팔 사이로 발견 - 가 캐릭터 몸에 완전히 가려지는
 *  결함을 발견해 재조정) */
const S1_MARK_CX = S1_PILLOW_CX + 210;
const S1_MARK_CY = S1_PILLOW_Y - 10;

/** 베개 자국을 알아채는 순간 - Episode.tsx가 이 프레임에 realize_ding SFX를 배치한다
 *  (원칙 7) */
export const S1_REALIZE_SFX_FRAME = 42;

/** 캐릭터를 베개 중심(S1_PILLOW_CX)보다 왼쪽으로 옮겨 오른쪽 베개 자리를 비워둔다 -
 *  캐릭터가 중앙에 있으면 몸통·팔에 자국이 거의 다 가려지는 결함이 스틸 선점검에서
 *  나왔다(원칙 5). */
const S1_ACTOR_CENTER_X = CX - 150;

export const S1WakeDiscover: React.FC<{ f: number }> = ({ f }) => {
  const wakeT = progress(f, 18, 40);
  const poseWake = blendPose(SLEEPY, POSES.idle, wakeT);
  const noticeT = progress(f, 40, 64);
  const pose = blendPose(poseWake, POSES.surprised, noticeT);

  return (
    <PlainBg top={C.roomDeep} bottom={C.room} ground={null}>
      <ThemedIcon name="moon" size={90} color={C.inkSoft} style={{ position: 'absolute', left: 110, top: 130 }} />
      <Bed layer="back" blanketY={S1_BLANKET_Y} pillowCX={S1_PILLOW_CX} />
      <WetMark cx={S1_MARK_CX} cy={S1_MARK_CY} scale={0.85} />
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={S1_ACTOR_GROUND} pose={pose} />
      <Bed layer="front" blanketY={S1_BLANKET_Y} pillowCX={S1_PILLOW_CX} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어? 나 잘 때 침 흘렸나 봐. 이거 왜 이러지?" (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 430;

/** 리액션 바스트샷 장면에는 소품을 넣지 않는다(36화 사고 - 소품이 자막 박스와 겹침, 이
 *  채널의 관례). 베개는 s1에서 이미 보여줬으므로 s2는 캐릭터 리액션과 대사만으로
 *  "베개를 보며 자문"하는 상황을 전달한다. */
export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const puzzleT = progress(f, 0, 18);
  const glanceWag = -6 * progress(f, 18, 34);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT);
  pose.headTilt = (pose.headTilt ?? 0) + glanceWag;
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3~S6: DroolDiagram 공유 좌표
 * ============================================================ */
interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

const DIAG_WIDTH = 780;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 300;

/* ---------------- S3: 침은 자는 동안에도 계속 만들어진다 ---------------- */
export const S3GlandMaking: React.FC<SceneProps & { t: { glandLabel: string } }> = ({
  f, frames, lines, t,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const scale = DIAG_WIDTH / 700;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <DroolDiagram
        f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        swallowRateBoost={0.5} poolLevel={0} dripProgress={0}
      />
      <Label
        x={DIAG_X + DROOL_GLAND_LABEL_PT.x * scale} y={DIAG_Y + DROOL_GLAND_LABEL_PT.y * scale}
        text={t.glandLabel} size={40}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 깨어있을 때는 삼키는 반사가 활발 ---------------- */
export const S4SwallowActive: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const boostP = progress(f, 4, Math.round(frames * 0.6));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <DroolDiagram
        f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        swallowRateBoost={boostP} poolLevel={0} dripProgress={0}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 잠들면 이 반사가 느려진다 ---------------- */
export const S5SwallowSlow: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const slowP = 1 - progress(f, 4, Math.round(frames * 0.85));
  const moonT = progress(f, 6, 24);
  return (
    <PlainBg top={C.roomDeep} bottom={C.room} ground={null}>
      <ThemedIcon
        name="moon" size={80} color={C.inkSoft}
        style={{ position: 'absolute', left: 120, top: 150, opacity: moonT }}
      />
      <DroolDiagram
        f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        swallowRateBoost={slowP} poolLevel={0} dripProgress={0}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 침이 고이다가 흘러나온다 ---------------- */
export const S6PoolDrip: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const poolP = progress(f, 4, Math.round(frames * 0.55));
  const dripP = progress(f, Math.round(frames * 0.5), Math.round(frames * 0.92));
  return (
    <PlainBg top={C.roomDeep} bottom={C.room} ground={null}>
      <DroolDiagram
        f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        swallowRateBoost={0} poolLevel={poolP} dripProgress={dripP} gravityTilt={0}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 똑바로 누움 vs 옆으로 누움 비교 + 중력 화살표
 * ============================================================ */
/** 처음 width=300/y=560 로 스틸을 뽑아보니 다이어그램이 화면 상단에만 몰리고 캡션까지
 *  빈 공간이 과다했다(스틸 선점검에서 발견, 원칙 5). 다이어그램을 키우고 화살표를
 *  오른쪽이 아니라 오른쪽 다이어그램 아래에 세로로 둬서 안전영역을 더 채운다. */
const S7_DIAG_WIDTH = 380;
const S7_GAP = 60;
const S7_LEFT_X = CX - S7_DIAG_WIDTH - S7_GAP / 2;
const S7_RIGHT_X = CX + S7_GAP / 2;
const S7_DIAG_Y = 620;
const S7_DIAG_HEIGHT = (S7_DIAG_WIDTH * 860) / 700;
const S7_LABEL_Y = S7_DIAG_Y - 74;
const S7_ARROW_X = S7_RIGHT_X + S7_DIAG_WIDTH / 2;
const S7_ARROW_Y_TOP = S7_DIAG_Y + S7_DIAG_HEIGHT + 30;
const S7_ARROW_Y_BOTTOM = S7_ARROW_Y_TOP + 170;

export const S7SideCompare: React.FC<SceneProps & { t: { straightLabel: string; sideLabel: string } }> = ({
  f, frames, lines, t,
}) => {
  const line = activeLine(lines, f / FPS);
  const appearT = progress(f, 0, 16);
  const dripP = progress(f, Math.round(frames * 0.15), Math.round(frames * 0.75));
  const arrowT = progress(f, Math.round(frames * 0.2), Math.round(frames * 0.5));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1920, opacity: appearT }}>
        <Label x={S7_LEFT_X + S7_DIAG_WIDTH / 2} y={S7_LABEL_Y} text={t.straightLabel} size={40} />
        <DroolDiagram
          f={f} width={S7_DIAG_WIDTH} x={S7_LEFT_X} y={S7_DIAG_Y}
          swallowRateBoost={0} poolLevel={1} dripProgress={0} gravityTilt={0}
        />

        <Label x={S7_RIGHT_X + S7_DIAG_WIDTH / 2} y={S7_LABEL_Y} text={t.sideLabel} size={40} />
        <DroolDiagram
          f={f} width={S7_DIAG_WIDTH} x={S7_RIGHT_X} y={S7_DIAG_Y}
          swallowRateBoost={0} poolLevel={1} dripProgress={dripP} gravityTilt={1}
        />

        {/* 중력 화살표 - 선 하나 + 삼각형 머리 하나(점 무리 없음) */}
        <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: arrowT }}>
          <line
            x1={S7_ARROW_X} y1={S7_ARROW_Y_TOP} x2={S7_ARROW_X} y2={S7_ARROW_Y_BOTTOM - 26}
            stroke={C.ink} strokeWidth={SW_THIN} strokeLinecap="round"
          />
          <polygon
            points={`${S7_ARROW_X},${S7_ARROW_Y_BOTTOM} ${S7_ARROW_X - 24},${S7_ARROW_Y_BOTTOM - 40} ${S7_ARROW_X + 24},${S7_ARROW_Y_BOTTOM - 40}`}
            fill={C.ink}
          />
        </svg>
      </div>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 어깨를 으쓱하며 웃어넘기는 마무리 (전신, Bed 재사용 - s1과 짝을 이루는 bookend)
 * ============================================================ */
export const S8ShrugItOff: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const shrugT = progress(f, 4, 30);
  const pose = blendPose(POSES.idle, POSES.shrug, shrugT);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Bed layer="back" blanketY={S1_BLANKET_Y} pillowCX={S1_PILLOW_CX} />
      <WetMark cx={S1_MARK_CX} cy={S1_MARK_CY} scale={0.85} opacity={0.85} />
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={S1_ACTOR_GROUND} pose={pose} />
      <Bed layer="front" blanketY={S1_BLANKET_Y} pillowCX={S1_PILLOW_CX} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

