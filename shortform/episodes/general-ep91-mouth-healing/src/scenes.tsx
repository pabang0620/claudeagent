/** 이 화(general-ep91, "혀 깨물었을 때 상처가 금방 낫는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(BustActor, 음식을 씹다가 혀를 깨물어 아파하다 -> 하드 컷으로 며칠 뒤 다 나은 모습,
 *  무성. general-ep84 S1Bite와 같은 "food 소품 없이 mouthOpen 애니메이션만으로 씹는
 *  동작을 표현" 패턴을 따른다) -> s2(BustActor 리액션 "어? 혀 깨문 거 며칠 전인데 벌써 다
 *  나았네. 왜 이렇게 빨리 낫지?") -> s3(MouthHealDiagram salivaProgress - 침방울 + 보호
 *  성분 입자 + 세균 차단) -> s4(같은 다이어그램 vesselCompareProgress - 입 안 점막 vs 팔
 *  피부 단면, 혈관 밀도 차이) -> s5(vesselCompareProgress=1 유지 + deliverProgress - 촘촘한
 *  혈관에서 상처로 입자가 몰려듦) -> s6(CompareBars - 회복 일수 비교, 수치는 화면만) ->
 *  s7(흉터 유무 비교 아이콘, 에피소드 로컬) -> s8(치과 장면, 발치 회복 빠름).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 피와 상처를 사실적으로 그리지 않는다. 38화·54화 표현(가는 선 하나로 벤 자리, 핏방울
 *     하나, 진물 없음)을 그대로 따른다 - MouthHealDiagram 내부에 이미 반영, 여기서는
 *     그 소품을 호출만 한다.
 *   - 혈관이 촘촘한 것은 굵은 선 몇 가닥으로 표현한다(점 무리 금지) - MouthHealDiagram이
 *     이미 6가닥/2가닥 굵은 선으로만 표현한다.
 *   - 침 속 성분은 작은 도형 1~2개로 표현한다 - MouthHealDiagram이 원 2개로만 표현한다.
 *
 *  s3~s6·s8은 전부 다이어그램·그래픽 중심 장면이라 립싱크를 넣지 않는다(원칙 - 다이어그램이
 *  초점인 장면은 얼굴이 아니라 다이어그램이 주인공). s7도 마찬가지로 비교 아이콘이 주인공.
 *  캐릭터가 실제로 등장해 말하는 s2만 mouthAt/mouthProp을 쓴다.
 */
import React from 'react';
import {
  BustActor, C, Caption, CompareBars, FPS, Label, MouthHealDiagram,
  MOUTH_HEAL_MOUTH_LABEL_PT, MOUTH_HEAL_SKIN_LABEL_PT, MOUTH_HEAL_VB_W,
  PlainBg, POSES, PulseRing, SW_THIN, ThemedIcon, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * 공용: 바스트 프레이밍 (s1/s2/s8이 같은 크기·위치로 컷 전환 시 점프 방지)
 * ============================================================ */
const BUST_SIZE = 950;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 470;

/* ============================================================
 * S1: 음식을 씹다가 혀를 깨물어 아파함 -> 하드 컷으로 며칠 뒤 다 나은 모습 (무성)
 * ============================================================ */
/** 씹는 동작이 끝나며 깨무는 순간(cold_zing SFX) / 컷 전환 순간(realize_ding SFX) -
 *  Episode.tsx가 이 프레임에 SFX를 배치한다(원칙 7) */
export const S1_BITE_SFX_AT_FRAME = 28;
export const S1_CUT_FRAME = 46;
const S1_CHECK_X = BUST_LEFT + BUST_SIZE * 0.72;
const S1_CHECK_Y = BUST_TOP + BUST_SIZE * 0.2;

export const S1BiteHeal: React.FC<{ f: number }> = ({ f }) => {
  const healed = f >= S1_CUT_FRAME;
  const biteOpenT = progress(f, 4, 18);
  const biteCloseT = progress(f, 18, 28);
  const chewMouth = 0.06 + 0.6 * biteOpenT * (1 - biteCloseT);
  const winceT = progress(f, 24, 38);
  const eyeOpen = healed ? 1 : 1 - 0.55 * winceT;
  const mouthOpen = healed ? 0.08 : Math.max(chewMouth, 0.14 * winceT);
  const headTilt = (POSES.idle.headTilt ?? 0) + (healed ? 0 : -7 * winceT);
  const checkT = healed ? progress(f, S1_CUT_FRAME, S1_CUT_FRAME + 14) : 0;

  const pose: Pose = { ...POSES.idle, headTilt, mouthOpen, eyeOpen };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} />
      {checkT > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: S1_CHECK_X, top: S1_CHECK_Y,
            opacity: checkT, transform: `scale(${0.7 + 0.3 * checkT})`, transformOrigin: '50% 50%',
          }}
        >
          <ThemedIcon name="check" size={90} color={C.gold} strokePx={14} bg={C.paper} bgPad={0.3} />
        </div>
      ) : null}
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어? 혀 깨문 거 며칠 전인데 벌써 다 나았네. 왜 이렇게 빨리 낫지?" (바스트샷, 립싱크)
 * ============================================================ */
export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const puzzleT = progress(f, 0, 18);
  const pose: Pose = blendPose(POSES.idle, POSES.touchNeck, puzzleT * 0.8);
  pose.headTilt = (pose.headTilt ?? 0) + 4 * Math.sin((f / 42) * Math.PI * 2) * progress(f, 18, 34);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3~S5: MouthHealDiagram 공유 좌표 헬퍼
 * ============================================================ */
interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

function diagPt(
  p: { x: number; y: number }, diagX: number, diagY: number, diagScale: number,
) {
  return { x: diagX + p.x * diagScale, y: diagY + p.y * diagScale };
}

/* ---------------- S3: 침방울 + 보호 성분 + 세균 차단 ---------------- */
/** 처음 480px으로 스틸을 뽑아보니 침방울이 화면 대비 지나치게 작아 화면 상하좌우에
 *  빈 공간이 과다했다(스틸 선점검에서 발견, 원칙 5). MouthHealDiagram 내부 침방울 비율도
 *  함께 키운 뒤, 화면상 크기도 620으로 키우고 세로 위치를 낮춰 안전영역을 더 채운다. */
const S3_DIAG_WIDTH = 620;
const S3_DIAG_X = CX - S3_DIAG_WIDTH / 2;
const S3_DIAG_Y = 280;

export const S3Saliva: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const salivaP = progress(f, 4, Math.round(frames * 0.9));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MouthHealDiagram width={S3_DIAG_WIDTH} x={S3_DIAG_X} y={S3_DIAG_Y} salivaProgress={salivaP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 입 안 점막 vs 팔 피부 - 혈관 밀도 비교 ---------------- */
/** 처음 640px으로 스틸을 뽑아보니 단면 원 두 개가 화면 대비 작아 빈 공간이 과다했다
 *  (스틸 선점검에서 발견, 원칙 5). 780으로 키우고 세로 위치를 낮췄다. */
const S4_DIAG_WIDTH = 780;
const S4_DIAG_X = CX - S4_DIAG_WIDTH / 2;
const S4_DIAG_Y = 280;
const S4_DIAG_SCALE = S4_DIAG_WIDTH / MOUTH_HEAL_VB_W;

export const S4VesselCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const vesselP = progress(f, 6, Math.round(frames * 0.85));
  const labelT = progress(f, 4, 26);
  const mouthLabelPt = diagPt(MOUTH_HEAL_MOUTH_LABEL_PT, S4_DIAG_X, S4_DIAG_Y, S4_DIAG_SCALE);
  const skinLabelPt = diagPt(MOUTH_HEAL_SKIN_LABEL_PT, S4_DIAG_X, S4_DIAG_Y, S4_DIAG_SCALE);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MouthHealDiagram
        width={S4_DIAG_WIDTH} x={S4_DIAG_X} y={S4_DIAG_Y} vesselCompareProgress={vesselP}
      />
      <Label
        x={mouthLabelPt.x} y={mouthLabelPt.y} text={t.s4MouthLabel} size={38} align="center"
        style={{ opacity: labelT }}
      />
      <Label
        x={skinLabelPt.x} y={skinLabelPt.y} text={t.s4SkinLabel} size={38} align="center"
        style={{ opacity: labelT }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 촘촘한 혈관에서 상처로 입자가 몰려듦 ---------------- */
export const S5Deliver: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const deliverP = progress(f, 6, Math.round(frames * 0.85));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MouthHealDiagram
        width={S4_DIAG_WIDTH} x={S4_DIAG_X} y={S4_DIAG_Y} f={f}
        vesselCompareProgress={1} deliverProgress={deliverP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 회복 일수 비교 (CompareBars, 수치는 화면만)
 * ============================================================ */
const S6_BAR_X = 200;
const S6_BAR_Y = 620;
const S6_PX_PER_UNIT = 70;

export const S6DaysCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CompareBars
        x={S6_BAR_X} y={S6_BAR_Y} pxPerUnit={S6_PX_PER_UNIT} rowGap={230} labelGap={64} frame={f}
        labelSize={56}
        items={[
          { label: t.s6SkinLabel, value: 7, at: 6, valueText: t.s6SkinValue, color: C.inkSoft },
          { label: t.s6MouthLabel, value: 3, at: 24, valueText: t.s6MouthValue, color: C.coral },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 흉터 유무 비교 (에피소드 로컬 - 단순 패치 2개, 반복 요소 없음)
 * ============================================================ */
const S7_PATCH_W = 260;
const S7_PATCH_H = 200;
const S7_LEFT_CX = CX - 210;
const S7_RIGHT_CX = CX + 210;
const S7_PATCH_Y = 620;
const S7_LABEL_Y = S7_PATCH_Y - 90;
const S7_SUBLABEL_Y = S7_PATCH_Y + S7_PATCH_H + 40;

const ScarPatch: React.FC<{ cx: number; y: number; scarred: boolean; t: number }> = ({ cx, y, scarred, t }) => (
  <g opacity={t} transform={`translate(${cx} ${y}) scale(${0.85 + 0.15 * t})`}>
    <rect
      x={-S7_PATCH_W / 2} y={0} width={S7_PATCH_W} height={S7_PATCH_H} rx={28}
      fill={scarred ? C.hill : C.coralSoft} stroke={C.ink} strokeWidth={SW_THIN}
    />
    {scarred ? (
      <path
        d={`M ${-70} ${S7_PATCH_H * 0.5} L ${-30} ${S7_PATCH_H * 0.38} L ${10} ${S7_PATCH_H * 0.58} L ${60} ${S7_PATCH_H * 0.42}`}
        fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.8} strokeLinecap="round" strokeLinejoin="round"
      />
    ) : null}
  </g>
);

export const S7ScarCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const leftT = progress(f, 4, 22);
  const rightT = progress(f, 16, 34);
  const checkT = progress(f, 22, 38);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={S7_LEFT_CX} y={S7_LABEL_Y} text={t.s7SkinLabel} size={44} align="center" style={{ opacity: leftT }} />
      <Label x={S7_RIGHT_CX} y={S7_LABEL_Y} text={t.s7MouthLabel} size={44} align="center" style={{ opacity: rightT }} />
      <svg width={W} height={900} style={{ position: 'absolute', left: 0, top: 0 }}>
        <ScarPatch cx={S7_LEFT_CX} y={S7_PATCH_Y} scarred t={leftT} />
        <ScarPatch cx={S7_RIGHT_CX} y={S7_PATCH_Y} scarred={false} t={rightT} />
      </svg>
      {checkT > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: S7_RIGHT_CX - 40, top: S7_PATCH_Y + S7_PATCH_H / 2 - 40,
            opacity: checkT,
          }}
        >
          <ThemedIcon name="check" size={80} color={C.coral} strokePx={13} />
        </div>
      ) : null}
      <Label
        x={S7_LEFT_CX} y={S7_SUBLABEL_Y} text={t.s7ScarLabel} size={34} color={C.inkSoft} align="center"
        style={{ opacity: leftT }}
      />
      <Label
        x={S7_RIGHT_CX} y={S7_SUBLABEL_Y} text={t.s7CleanLabel} size={34} color={C.inkSoft} align="center"
        style={{ opacity: rightT }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 치과 장면 - 발치 부위 회복 빠름
 * ============================================================ */
const S8_DENTAL_X = BUST_LEFT + BUST_SIZE * 0.62;
const S8_DENTAL_Y = BUST_TOP + BUST_SIZE * 0.5;
/** 처음 BUST_TOP+BUST_SIZE*0.08(캐릭터 머리 바로 위)로 스틸을 뽑아보니 캐릭터 안테나
 *  머리카락과 겹쳤다(21화 이후 결함 B, 스틸 선점검에서 발견 - 원칙 5). ep56의
 *  `BUST_TOP - 90` 관례를 그대로 따라 안테나 위로 옮겼다. */
const S8_LABEL_Y = BUST_TOP - 90;

export const S8Dental: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const settleT = progress(f, 0, 16);
  const iconT = progress(f, 10, 28);
  const pose: Pose = {
    ...POSES.idle,
    headTilt: (POSES.idle.headTilt ?? 0) - 6 * settleT,
    lean: (POSES.idle.lean ?? 0) - 3 * settleT,
    eyeOpen: 0.9,
  };
  const ringSize = 150;
  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} />
      {iconT > 0.01 ? (
        <>
          <PulseRing
            x={S8_DENTAL_X - ringSize / 2} y={S8_DENTAL_Y - ringSize / 2} size={ringSize} frame={f}
            progress={iconT} color={C.goldSoft} periodFrames={26}
          />
          <div
            style={{
              position: 'absolute', left: S8_DENTAL_X - 45, top: S8_DENTAL_Y - 45, opacity: iconT,
            }}
          >
            <ThemedIcon name="dental" size={90} color={C.ink} strokePx={14} />
          </div>
        </>
      ) : null}
      <Label
        x={CX} y={S8_LABEL_Y} text={t.s8FastLabel} size={40} align="center" color={C.coral}
        style={{ opacity: iconT }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
