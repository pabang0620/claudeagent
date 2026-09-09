/** 이 화(general-ep62, "계절이 바뀌는 진짜 이유") 전용 장면. 문구는 전부 strings.ts 에서
 *  읽는다(언어 무관 컴포넌트).
 *
 *  s1(여름/겨울 대비 캐릭터, 무성 대구) -> s2(지구가 태양에 바짝 다가가는 잘못된 거리 가설
 *  애니메이션 + X 표시) -> s3(EarthOrbitDiagram - 지구가 살짝 기울어진 채 자리에서 도는 모습,
 *  "23.5도" 라벨) -> s4(EarthOrbitDiagram - 지구가 궤도를 이동하며 두 극 지점에 닿는 햇빛의
 *  각도가 바뀌는 모습, showRays) -> s5(SunAngleGroundView 두 패널 - 직사광+긴 낮 vs 비스듬한
 *  빛+짧은 낮 비교) -> s6(EarthOrbitDiagram - 근일점에 "1월, 태양과 가장 가까움" 카드 + 눈
 *  아이콘) -> s7(EarthOrbitDiagram 정지 요약 - 궤도+기울기 전체).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 거리 때문이 아니라는 정정이 핵심이다. s2는 "틀린 가설"을 분명히 X 표시로 반박하고,
 *     EarthOrbitDiagram(s3~s4·s6~s7)은 실제 물리(자전축 방향 고정 + 궤도 위치)만으로 반구별
 *     계절을 계산하므로 호출부가 "이 각도가 여름이다"를 손으로 정하지 않는다(55화 방향
 *     반전 사고 재발 방지 - EarthOrbitDiagram.tsx 파일 상단 주석 참고).
 *   - 지구·태양은 표면 디테일 없는 단순한 원, 자전축은 선 하나로만 표시(사실적으로 그리지
 *     않는다).
 *   - 화살표는 굵은 것 2~3개로 충분하다(EarthOrbitDiagram의 showRays, SunAngleGroundView의
 *     3가닥 화살표).
 *   - s4는 궤도 위 orbitAngle을 300도 스윕시켜 EARTH_ORBIT_NORTH_SUMMER_ANGLE과
 *     EARTH_ORBIT_NORTH_WINTER_ANGLE을 모두 지나가게 해, "북반구가 태양 쪽으로 기운 위치에서
 *     여름"이 실제로 맞게 나오는지 스틸 선점검에서 두 지점 모두 확인했다(아래 각 씬 주석에
 *     시작/끝 각도를 명시).
 *
 *  어느 장면도 캐릭터가 직접 말하는 순간이 아니라(전부 3인칭 설명 내레이션) mouth.json
 *  립싱크를 쓰지 않는다(ep19/ep21/ep23/ep25/ep60과 동일 원칙 - ko_mouth.json은 파이프라인
 *  표준 절차로 만들었지만 이 화 어디서도 import하지 않는다).
 */
import React from 'react';
import {
  Actor, blendPose, C, Caption, Card, EARTH_ORBIT_CLOSEST_ANGLE, EARTH_ORBIT_NORTH_SUMMER_ANGLE,
  EarthOrbitDiagram, earthOrbitAxisTopAt, earthOrbitCenterAt, FPS, FlashOverlay, H, Label, PlainBg,
  POSES, progress, QMark, RadialSpikes, RIG, Shake, SnowflakeIcon, SunAngleGroundView, W,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const STR = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * S1: 왼쪽 - 더워하는 캐릭터 / 오른쪽 - 추워서 떠는 캐릭터 (무성 대구)
 * ============================================================ */

const S1_LEFT_CX = 280;
const S1_RIGHT_CX = 800;
const S1_ACTOR_SIZE = 520;
const S1_GROUND = 1260;
const S1_POSE_BLEND_END = 18;
const S1_AURA_IN_END = 34;

function auraPos(centerX: number, size: number, ground: number) {
  const top = ground - (1026 * size) / RIG.H; // FEET_VB=1026
  const scale = size / RIG.W;
  const vbTop = 190;
  const vbCy = (vbTop + 1026) / 2;
  const vbRy = (1026 - vbTop) / 2;
  return { cx: centerX, cy: top + vbCy * scale, rx: 280 * scale, ry: vbRy * scale };
}

export const S1HotCold: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const blendT = progress(f, 0, S1_POSE_BLEND_END);
  const hotPose: Pose = blendPose(POSES.idle, POSES.wide, blendT);
  const coldPose: Pose = blendPose(POSES.idle, POSES.shrug, blendT);
  const auraP = progress(f, S1_POSE_BLEND_END - 6, S1_AURA_IN_END);
  const hotAura = auraPos(S1_LEFT_CX, S1_ACTOR_SIZE, S1_GROUND);
  const coldAura = auraPos(S1_RIGHT_CX, S1_ACTOR_SIZE, S1_GROUND);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* 좌우 색 대비 - 왼쪽은 따뜻한 톤, 오른쪽은 차가운 톤 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: W / 2, height: H, background: C.coralSoft, opacity: 0.35 }} />
      <div style={{ position: 'absolute', left: W / 2, top: 0, width: W / 2, height: H, background: C.water, opacity: 0.4 }} />
      <div style={{ position: 'absolute', left: W / 2 - 4, top: 0, width: 8, height: H, background: C.paper, opacity: 0.7 }} />

      <Actor size={S1_ACTOR_SIZE} centerX={S1_LEFT_CX} ground={S1_GROUND} pose={hotPose} />
      <RadialSpikes
        cx={hotAura.cx} cy={hotAura.cy} rx={hotAura.rx} ry={hotAura.ry} frame={f} progress={auraP}
        count={12} length={26} width={7} color={C.coral}
      />

      <Shake frame={f} at={S1_POSE_BLEND_END} duration={70} amp={3.2} freq={3.4}>
        <Actor size={S1_ACTOR_SIZE} centerX={S1_RIGHT_CX} ground={S1_GROUND} pose={coldPose} />
        <RadialSpikes
          cx={coldAura.cx} cy={coldAura.cy} rx={coldAura.rx} ry={coldAura.ry} frame={f} progress={auraP}
          count={12} length={26} width={7} color={C.waterCool}
        />
      </Shake>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 지구가 태양에 바짝 다가가는 잘못된 거리 가설 애니메이션 + X 표시
 * ============================================================ */

const S2_SUN_CX = CX;
const S2_SUN_CY = 1080;
const S2_SUN_R = 150;
const S2_EARTH_FAR_R = 560;
const S2_EARTH_NEAR_R = 260; // 태양 표면과 지구 표면 사이 50px 여유(겹침 방지)
const S2_EARTH_RADIUS = 62;
const S2_X_AT = 0.62;
// X 표시는 태양-지구 전체 구성을 통째로 덮지 않고, 둘이 가장 가까워지는 위쪽 구간만
// 가로지르도록 작게(300) 잡는다 - 420이었을 때 X 하나가 태양·지구를 통째로 가려버리는
// 결함이 스틸 선점검에서 발견됨(f354).
const S2_X_SIZE = 300;
const S2_X_CY = S2_SUN_CY - (S2_SUN_R + S2_EARTH_NEAR_R) / 2;

export const S2WrongDistance: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  // "지구가 태양에 바짝 다가간다"는 틀린 애니메이션 - 반복적으로 가까워졌다 멀어지는 펄스
  const wobble = 0.5 + 0.5 * Math.sin(f * 0.11);
  const dist = S2_EARTH_FAR_R - (S2_EARTH_FAR_R - S2_EARTH_NEAR_R) * wobble;
  const earthX = S2_SUN_CX;
  const earthY = S2_SUN_CY - dist;
  const guessLabelA = progress(f, 8, 26);
  const xAt = Math.round(frames * S2_X_AT);
  const xA = progress(f, xAt, xAt + 14);

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={S2_SUN_CX} cy={S2_SUN_CY} r={S2_SUN_R} fill={C.gold} stroke={C.cream} strokeWidth={9} />
        <circle cx={earthX} cy={earthY} r={S2_EARTH_RADIUS} fill={C.sky} stroke={C.cream} strokeWidth={7} />
      </svg>
      <Label
        x={CX} y={S2_SUN_CY + S2_SUN_R + 110} text={STR.distanceGuess} size={62} color={C.cream}
        style={{ opacity: guessLabelA }}
      />
      {xA > 0.01 ? (
        <QMark
          size={S2_X_SIZE} glyph="X" color={C.coral} outline={C.cream}
          style={{ left: CX, top: S2_X_CY, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * xA})`, opacity: xA }}
        />
      ) : null}
      <FlashOverlay frame={f} at={xAt} color={C.coral} peak={0.35} rise={4} fall={20} />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S3: EarthOrbitDiagram - 지구가 살짝 기울어진 채 자리에서 도는 모습, "23.5도" 라벨
 * ============================================================ */

// 태양·궤도링은 안 그리고(showSun/showOrbitRing false) 지구만 크게 클로즈업한다. 지구
// 중심을 화면 중앙(S3_TARGET_Y)에 오도록 실제 x/y를 역산한다(earthOrbitCenterAt으로 폭=0
// 오프셋 기준 로컬 좌표를 구한 뒤 그만큼 빼는 방식) - 태양이 안 보이므로 태양 기준(뷰박스
// 중앙=항상 화면 중앙)으로 그냥 두면 지구가 화면 위쪽 구석에 작게 치우쳐 보였다(스틸
// 선점검 f466 - 지구·태양이 뚝 떨어진 두 개의 작은 아이콘처럼 보이고 화면 상하 여백이
// 과다했던 결함).
const S3_DIAG_WIDTH = 2600;
const S3_ORBIT_ANGLE = EARTH_ORBIT_NORTH_SUMMER_ANGLE;
const S3_TARGET_Y = 860;

export const S3TiltSpin: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const guideA = progress(f, 20, 42);
  const local = earthOrbitCenterAt(S3_ORBIT_ANGLE, S3_DIAG_WIDTH, 0, 0);
  const diagX = CX - local.x;
  const diagY = S3_TARGET_Y - local.y;
  const labelPt = earthOrbitAxisTopAt(S3_ORBIT_ANGLE, S3_DIAG_WIDTH, diagX, diagY);

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <EarthOrbitDiagram
        width={S3_DIAG_WIDTH} x={diagX} y={diagY}
        orbitAngle={S3_ORBIT_ANGLE} showOrbitRing={false} showSun={false} spinDeg={f * 5.2}
        showTiltGuide showRays={0} showClosestMarker={0}
      />
      <Label
        x={labelPt.x} y={labelPt.y - 90} text={STR.tiltLabel} size={58} color={C.cream}
        style={{ opacity: guideA }}
      />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S4: EarthOrbitDiagram - 궤도를 이동하며 두 극에 닿는 햇빛 각도가 바뀐다
 * (orbitAngle: EARTH_ORBIT_NORTH_SUMMER_ANGLE-40 -> +260, 즉 여름 정점과 겨울 정점을
 *  모두 지나간다 - 스틸 선점검에서 두 지점 모두 확인)
 * ============================================================ */

const S4_DIAG_WIDTH = 1000;
const S4_DIAG_X = CX - S4_DIAG_WIDTH / 2;
const S4_DIAG_Y = 380; // 태양이 화면 y=880 부근에 오도록(뷰박스 정중앙=태양 고정 위치)
const S4_START_ANGLE = EARTH_ORBIT_NORTH_SUMMER_ANGLE - 40;
const S4_SWEEP_DEG = 300;

export const S4AngleChange: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const t = progress(f, frames * 0.06, frames * 0.96);
  const orbitAngle = (S4_START_ANGLE + t * S4_SWEEP_DEG + 360) % 360;
  const raysA = progress(f, 6, 24);

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <EarthOrbitDiagram
        width={S4_DIAG_WIDTH} x={S4_DIAG_X} y={S4_DIAG_Y}
        orbitAngle={orbitAngle} showOrbitRing showRays={raysA}
      />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 왼쪽 - 직사광+긴 낮(여름) / 오른쪽 - 비스듬한 빛+짧은 낮(겨울) 비교
 * ============================================================ */

const S5_PANEL_WIDTH = 460;
const S5_LEFT_X = CX - S5_PANEL_WIDTH - 30;
const S5_RIGHT_X = CX + 30;
const S5_PANEL_Y = 640;

export const S5CompareGround: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const leftA = progress(f, 6, 26);
  const rightA = progress(f, 20, 40);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunAngleGroundView
        width={S5_PANEL_WIDTH} x={S5_LEFT_X} y={S5_PANEL_Y}
        obliqueT={0} dayFraction={0.64} rayProgress={leftA}
      />
      <SunAngleGroundView
        width={S5_PANEL_WIDTH} x={S5_RIGHT_X} y={S5_PANEL_Y}
        obliqueT={1} dayFraction={0.36} rayProgress={rightA}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: EarthOrbitDiagram - 근일점(1월, 태양과 가장 가까움) 카드 + 겨울 아이콘
 * ============================================================ */

const S6_DIAG_WIDTH = 900;
const S6_DIAG_X = CX - S6_DIAG_WIDTH / 2;
const S6_DIAG_Y = 460; // 카드(y=280,h=190, 바닥 470)와 겹치지 않게 궤도 위쪽에 여유를 둔다

export const S6Closest: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const markerA = progress(f, 12, 32);
  const cardA = progress(f, 18, 40);

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <EarthOrbitDiagram
        width={S6_DIAG_WIDTH} x={S6_DIAG_X} y={S6_DIAG_Y}
        orbitAngle={EARTH_ORBIT_CLOSEST_ANGLE} showOrbitRing spinDeg={f * 3.4}
        showClosestMarker={markerA}
      />
      <Card
        x={CX - 320} y={280} w={640} h={190} progress={cardA}
        label={STR.closestLabel} labelSize={50}
      />
      <SnowflakeIcon width={130} x={W - 210} y={300} progress={cardA} color={C.cream} />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};

/* ============================================================
 * S7: EarthOrbitDiagram 정지 요약 - 궤도 + 기울기 전체
 * ============================================================ */

const S7_DIAG_WIDTH = 1000;
const S7_DIAG_X = CX - S7_DIAG_WIDTH / 2;
const S7_DIAG_Y = 380;

export const S7Summary: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <EarthOrbitDiagram
        width={S7_DIAG_WIDTH} x={S7_DIAG_X} y={S7_DIAG_Y}
        orbitAngle={EARTH_ORBIT_NORTH_SUMMER_ANGLE} showOrbitRing showTiltGuide spinDeg={f * 2.2}
      />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};
