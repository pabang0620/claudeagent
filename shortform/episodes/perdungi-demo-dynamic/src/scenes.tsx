/** 퍼둥이 "역동적인 점프/착지" 데모 - 대사 없는 5초 무언극.
 *
 *  배경: perdungi-demo-active(제자리 홉 + MotionSwoosh)는 이펙트가 "너무 작아서 잘 안 보인다"는
 *  피드백을 받았다. 이번엔 (a) 동작 자체를 제자리 홉이 아니라 크게 도약->착지하는 한 번의
 *  단일 점프로 단순화하고, (b) 라이선스 확인된 벡터 소스로 만든 큰 이펙트 2종
 *  (`DustCloud`/`ImpactBurst`, assets/scenes/ImpactEffects.tsx)을 발밑/착지 지점에 크게 얹었다.
 *
 *  v2(2026-08-11): "팔 휘젓기/다리 뛰는 모션을 왜 MotionSwoosh로 안 넣어주냐"는 피드백으로
 *  MotionSwoosh(팔·다리 스와시)를 다시 붙였다 - DustCloud/ImpactBurst로 갈아탄 게 아니라
 *  **추가**다. 팔다리 좌표는 새로 창작하지 않는다(원칙 0-1) - 이 파일 아래 ARM_SWOOSH/
 *  FOOT_SWOOSH_L/R 은 perdungi-demo-active/src/scenes.tsx 가 이미 실측해 둔 값을 그대로
 *  재사용한다(같은 PERDUNGI_X=540/PERDUNGI_SIZE=820/STAGE_GROUND=1350 이라 좌표계가 동일 -
 *  그 파일 주석: "stand 포즈를 실제 렌더한 프레임을 numpy 커넥티드 컴포넌트로 분석해
 *  armRight 캡슐(팔)과 body 발가락 뭉치(다리)의 실제 잉크 픽셀 bbox를 측정"). 크기만 이번
 *  요청("최소 2~3배")에 맞춰 3배로 키웠다. active 데모는 dizzy 하드컷 구간에서 스와시를
 *  껐지만(실루엣이 달라 앵커가 안 맞음), 이번엔 "전 구간 내내 지속" 요청이 있어 dizzy
 *  구간(공중 정점)도 포함해 항상 렌더한다 - 짧은 22프레임 구간이라 앵커 오차가 눈에 띄지
 *  않고, 어차피 몸 전체가 translateY/scale 로 크게 움직이는 구간이라 튀지 않는다.
 *
 *  팔다리 좌표는 새로 창작하지 않는다(원칙 0-1) - 기존 9포즈(poseArt.ts) 중 stand/dizzy만
 *  재사용한다. 점프 물리(크라우치->도약->정점->낙하->착지 recoil)는 perdungi-demo-active의
 *  BeatJump 로직을 그대로 재사용하되(같은 곡선·같은 dizzy 하드컷 판단 근거), 홉 반복 없이
 *  단일 점프 1회로 압축했다.
 *
 *  스토리 없는 데모라 assets/ 로 승격하지 않는다(episodes/README.md 규칙 - 이 화 전용 장면).
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { C, PlainBg, bounceIn, clamp01, DustCloud, ImpactBurst, MotionSwoosh } from '../../../assets';
import { Actor, PerdungiPose } from '../../../assets/character-perdungi';

/* ================= 타이밍 (5.0초 = 150프레임, 늘리지 않는다) ================= */
export const CROUCH_END = 15; // 0.5s - 도약 준비로 눌림
export const LAUNCH_END = 42; // 0.9s - 쭉 뻗으며 솟구침 (프레임 15에 발이 바닥을 떠남)
export const APEX_END = 64; // 0.73s - 정점, dizzy 하드컷(공중 회전 암시)
export const LAND_FRAME = 90; // 낙하 종료 = 착지 순간
export const TOTAL_FRAMES = 150; // 5.0s

const PERDUNGI_X = 540;
const PERDUNGI_SIZE = 820;
const STAGE_GROUND = 1350;

/** 팔·다리(발) 스와시 앵커 - perdungi-demo-active/src/scenes.tsx 의 실측값 그대로(좌표 재발명
 *  아님, 원칙 0-1). 그 파일과 PERDUNGI_X/PERDUNGI_SIZE/STAGE_GROUND 가 동일해 좌표계가
 *  그대로 맞는다. size 만 이번 요청("최소 2~3배")에 맞춰 정확히 3배로 키웠다(팔 30->90,
 *  다리 22->66). strokeWidth·opacity 도 커진 크기에 맞춰 함께 올렸다(선이 상대적으로 가늘어
 *  보이지 않도록). */
const ARM_SWOOSH = { x: 840, y: 1248, rotation: 35 };
const FOOT_SWOOSH_L = { x: 560, y: 1290, rotation: 160 };
const FOOT_SWOOSH_R = { x: 648, y: 1286, rotation: 95 };

/** 팔(1) + 다리(2) 스와시. 다리 두 개는 프레임을 어긋나게(+4) 줘 좌우 번갈아 펄스하는
 *  "달리는" 인상을 낸다(perdungi-demo-active와 동일 기법). 펄스 주기는 초당 3~5회
 *  구간(periodFrames 7~9 -> 30fps 기준 4.3~3.3Hz)을 그대로 유지한다. active 데모와 달리
 *  pose 조건 없이 크라우치~도약~공중(dizzy)~착지 전 구간에서 항상 렌더한다(이번 요청:
 *  "전 구간 내내 지속"). */
const LimbSwooshes: React.FC<{ f: number }> = ({ f }) => (
  <>
    <MotionSwoosh
      x={ARM_SWOOSH.x} y={ARM_SWOOSH.y} rotation={ARM_SWOOSH.rotation} frame={f}
      size={90} periodFrames={7} strokeWidth={9} opacity={0.85}
    />
    <MotionSwoosh
      x={FOOT_SWOOSH_L.x} y={FOOT_SWOOSH_L.y} rotation={FOOT_SWOOSH_L.rotation} frame={f}
      size={66} periodFrames={9} strokeWidth={7} opacity={0.85}
    />
    <MotionSwoosh
      x={FOOT_SWOOSH_R.x} y={FOOT_SWOOSH_R.y} rotation={FOOT_SWOOSH_R.rotation} frame={f + 4}
      size={66} periodFrames={9} strokeWidth={7} opacity={0.85}
    />
  </>
);

/** 점프 물리 곡선. perdungi-demo-active의 BeatJump와 같은 형태(크라우치/도약/정점/낙하/착지
 *  recoil)를 단일 점프 1회 분량으로 재구성했다 - 좌표 발명이 아니라 이미 검증된 곡선 재사용. */
function jumpFrame(f: number) {
  let dy = 0;
  let scaleY = 1;
  let scaleX = 1;
  let poseId: PerdungiPose['pose'] = 'stand';
  let lean = 0;

  if (f < CROUCH_END) {
    const t = clamp01(f / CROUCH_END);
    dy = interpolate(t, [0, 1], [0, 16]);
    scaleY = interpolate(t, [0, 1], [1, 0.85]);
    scaleX = interpolate(t, [0, 1], [1, 1.14]);
  } else if (f < LAUNCH_END) {
    const t = clamp01((f - CROUCH_END) / (LAUNCH_END - CROUCH_END));
    dy = interpolate(t, [0, 1], [16, -260]);
    scaleY = interpolate(t, [0, 1], [0.85, 1.12]);
    scaleX = interpolate(t, [0, 1], [1.14, 0.9]);
  } else if (f < APEX_END) {
    const t = f - LAUNCH_END;
    const span = APEX_END - LAUNCH_END;
    dy = -260 + 6 * Math.sin((t / span) * Math.PI);
    scaleY = 1.1;
    scaleX = 0.92;
    poseId = 'dizzy';
    lean = 16 * Math.sin((t / span) * Math.PI * 1.5);
  } else if (f < LAND_FRAME) {
    const t = clamp01((f - APEX_END) / (LAND_FRAME - APEX_END));
    dy = interpolate(t, [0, 1], [-260, 0]);
    scaleY = interpolate(t, [0, 1], [1.1, 0.92]);
    scaleX = interpolate(t, [0, 1], [0.92, 1.08]);
  } else {
    const recoil = bounceIn(f - LAND_FRAME, 30, 0);
    dy = interpolate(recoil, [0, 1], [10, 0]);
    scaleY = interpolate(recoil, [0, 1], [0.78, 1]);
    scaleX = interpolate(recoil, [0, 1], [1.2, 1]);
  }

  return { dy, scaleY, scaleX, pose: { pose: poseId, lean } as PerdungiPose };
}

export const PerdungiDynamicStage: React.FC = () => {
  const frame = useCurrentFrame();
  const { dy, scaleX, scaleY, pose } = jumpFrame(frame);

  return (
    <PlainBg top={C.sky} bottom={C.paper} stop={0.55} ground={STAGE_GROUND} groundColor={C.hill}>
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
          transform: `translateY(${dy}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: `${PERDUNGI_X}px ${STAGE_GROUND}px`,
        }}
      >
        <Actor size={PERDUNGI_SIZE} centerX={PERDUNGI_X} ground={STAGE_GROUND} pose={pose} />
        <LimbSwooshes f={frame} />
      </div>

      {/* 도약 순간 발밑에서 작게 퍼지는 먼지(발이 땅을 박차는 느낌) */}
      <DustCloud x={PERDUNGI_X} y={STAGE_GROUND} frame={frame} at={CROUCH_END} duration={26} size={260} />

      {/* 착지 순간 - 큰 먼지 구름 + 별 모양 충격파를 동시에 터뜨린다 (요청: "눈에 띄게 크게") */}
      <DustCloud x={PERDUNGI_X} y={STAGE_GROUND} frame={frame} at={LAND_FRAME} duration={36} size={480} />
      <ImpactBurst x={PERDUNGI_X} y={STAGE_GROUND - 30} frame={frame} at={LAND_FRAME} duration={18} size={400} />
    </PlainBg>
  );
};

export default PerdungiDynamicStage;
