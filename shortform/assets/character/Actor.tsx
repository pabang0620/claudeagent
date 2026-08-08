/** 캐릭터를 화면에 "세우는" 배치 컴포넌트.
 *
 *  Character 는 순수 SVG 라 화면 좌표를 모른다. 발끝을 바닥선에 맞추고 호흡·눈깜빡임을
 *  자동으로 얹는 일은 전부 여기서 한다. 에피소드 코드는 Character 를 직접 쓰지 말고
 *  Actor / BustActor 를 쓴다.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Character, CharacterProps, Pose, BUST_VIEWBOX, MINI_VIEWBOX, RIG } from './Character';
import { breathe, eyeOpenAt } from '../anim';
import { FEET_VB, GROUND } from '../theme';

export interface ActorProps {
  /** 캐릭터 SVG 한 변의 화면 크기(px) */
  size: number;
  /** 캐릭터 중심선이 놓일 화면 x */
  centerX: number;
  /** 발이 닿을 화면 y (기본 GROUND) */
  ground?: number;
  /** viewBox 안에서의 발끝 y. 포즈에 feetVb 가 있으면 그 값이 우선 */
  feetVb?: number;
  pose?: Pose;
  /** 립싱크 값 (timeline.mouthProp 결과). 지정하면 포즈의 mouthOpen 을 덮는다 */
  mouthOpen?: number;
  /** 호흡 진폭. 0 이면 완전 정지 */
  breathAmp?: number;
  /** 눈깜빡임 위상 오프셋. 캐릭터가 둘 이상일 때 어긋나게 한다 */
  blinkOffset?: number;
  /** 색 오버라이드 (실루엣 등) */
  color?: string;
  accent?: string;
  fill?: string;
  style?: React.CSSProperties;
}

/** 발끝(viewBox y = feetVb)이 화면의 ground 에 닿도록 SVG 를 놓는다.
 *  포즈가 바뀌어도 발이 같은 바닥선에 서 있게 하는 것이 목적이다. */
export const Actor: React.FC<ActorProps> = ({
  size, centerX, ground = GROUND, feetVb, pose = {},
  breathAmp = 1, blinkOffset = 0, mouthOpen, color, accent, fill, style,
}) => {
  const frame = useCurrentFrame();
  const b = breathe(frame, breathAmp);
  const feet = feetVb ?? pose.feetVb ?? FEET_VB;
  const top = ground - (feet * size) / RIG.H;
  const left = centerX - (RIG.CX * size) / RIG.W;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        transform: `translateY(${b.dy}px) scale(${b.scale})`,
        transformOrigin: '50% 90%',
        ...style,
      }}
    >
      <Character
        {...(pose as CharacterProps)}
        width={size}
        height={size}
        color={color}
        accent={accent}
        fill={fill}
        mouthOpen={mouthOpen ?? pose.mouthOpen}
        eyeOpen={Math.min(pose.eyeOpen ?? 1, eyeOpenAt(frame, blinkOffset) * (pose.eyeOpen ?? 1))}
      />
    </div>
  );
};

export interface BustActorProps {
  size: number;
  left: number;
  top: number;
  pose?: Pose;
  mouthOpen?: number;
  blinkOffset?: number;
  breathAmp?: number;
  color?: string;
  accent?: string;
  fill?: string;
  style?: React.CSSProperties;
}

/** 바스트샷(얼굴 클로즈업). 캐릭터 viewBox 의 머리 영역만 잘라 크게 쓴다. */
export const BustActor: React.FC<BustActorProps> = ({
  size, left, top, pose = {}, mouthOpen, blinkOffset = 0, breathAmp = 1.4,
  color, accent, fill, style,
}) => {
  const frame = useCurrentFrame();
  const b = breathe(frame, breathAmp);
  return (
    <div
      style={{
        position: 'absolute', left, top, width: size, height: size,
        transform: `translateY(${b.dy}px) scale(${b.scale})`,
        transformOrigin: '50% 50%',
        ...style,
      }}
    >
      <Character
        {...(pose as CharacterProps)}
        viewBox={BUST_VIEWBOX}
        width={size}
        height={size}
        color={color}
        accent={accent}
        fill={fill}
        mouthOpen={mouthOpen ?? pose.mouthOpen}
        eyeOpen={Math.min(pose.eyeOpen ?? 1, eyeOpenAt(frame, blinkOffset) * (pose.eyeOpen ?? 1))}
      />
    </div>
  );
};

/** 카드·아이콘 자리에 넣는 정지 미니 캐릭터. 호흡·깜빡임 없음(카드가 흔들려 보이지 않게) */
export const MiniCharacter: React.FC<{
  width: number;
  pose?: Pose;
  color?: string;
  accent?: string;
  fill?: string;
}> = ({ width, pose = {}, color, accent, fill }) => (
  <Character
    {...(pose as CharacterProps)}
    width={width}
    viewBox={MINI_VIEWBOX}
    color={color}
    accent={accent}
    fill={fill}
  />
);
