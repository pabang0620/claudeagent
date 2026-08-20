/** 퍼둥이를 화면에 세우는 배치기 - v4 (9포즈 대응, 2026-08-10).
 *
 *  굼구미 character/Actor.tsx 의 "발끝을 바닥선에 맞추고 호흡을 자동 적용한다"는 인터페이스
 *  아이디어만 참고하고 코드는 새로 작성했다(지역성 우선 - 두 캐릭터는 rig 좌표계가 다르다).
 *
 *  v4 변경: 포즈가 3개에서 9개로 늘고 포즈별 viewBox/앵커가 `poseArt.ts`에 데이터로만
 *  있으므로, 이전처럼 run/think/lean을 하드코딩 분기하지 않고 `POSE_ART[poseId]`에서 직접
 *  읽는다. 깜빡임(eyeOpen)은 v4 Character가 지원하지 않으므로(Character.tsx 상단 주석 참고)
 *  breathe(호흡)만 자동 적용한다.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Character, CharacterProps, PerdungiPose, POSE_ART, FACE_OF, PoseId9 } from './Character';
import { breathe } from '../anim';
import { GROUND } from '../theme';

export interface ActorProps {
  /** 화면 렌더 폭(px). 포즈별 종횡비가 달라 height 는 자동 계산된다 */
  size: number;
  /** 캐릭터 중심선이 놓일 화면 x */
  centerX: number;
  /** 발이 닿을 화면 y */
  ground?: number;
  pose?: PerdungiPose;
  /** 호흡 진폭. 0 이면 완전 정지 */
  breathAmp?: number;
  color?: string;
  style?: React.CSSProperties;
}

/** 얼굴(눈+코+입 뭉치) 중심의 화면 좌표 - 먹물 등 이펙트가 이 좌표에 정렬을 맞춘다. */
export function faceScreenCenter(size: number, centerX: number, ground = GROUND, poseId: PoseId9 = 'stand') {
  const art = POSE_ART[poseId];
  const h = size * (art.vbH / art.vbW);
  const top = ground - (art.feetY * h) / art.vbH;
  const left = centerX - (art.cx * size) / art.vbW;
  const fc = FACE_OF[poseId];
  return { x: left + (fc.x * size) / art.vbW, y: top + (fc.y * h) / art.vbH };
}

export const Actor: React.FC<ActorProps> = ({
  size, centerX, ground = GROUND, pose = {}, breathAmp = 1, color, style,
}) => {
  const frame = useCurrentFrame();
  const poseId = pose.pose ?? 'stand';
  const art = POSE_ART[poseId];
  const h = size * (art.vbH / art.vbW);
  const b = breathe(frame, breathAmp);
  const top = ground - (art.feetY * h) / art.vbH;
  const left = centerX - (art.cx * size) / art.vbW;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: h,
        transform: `translateY(${b.dy}px) scale(${b.scale})`,
        transformOrigin: '50% 88%',
        ...style,
      }}
    >
      <Character {...(pose as CharacterProps)} width={size} height={h} color={color} />
    </div>
  );
};

export default Actor;
