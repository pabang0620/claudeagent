/** 장면 전환. 나가는 장면이 xfade 프레임 동안 사라지고 들어오는 장면이 그 위로 겹친다.
 *
 *  숏폼은 컷이 잦아서 전환을 화려하게 하면 피로하다. 아주 짧은 크로스페이드 +
 *  아주 약한 확대만 준다(기본 6프레임 = 0.2초).
 *
 *  씬 컴포넌트는 구간 로컬 프레임 f 를 받는다. 전역 프레임을 쓰면 씬을 옮길 때마다
 *  안의 타이밍을 전부 다시 계산해야 한다.
 */
import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';

/** 씬 하나의 명세. 씬 컴포넌트는 구간 로컬 프레임 f 를 필수로 받고,
 *  나머지 props 는 props 필드로 그대로 전달된다. */
export interface SceneSpec {
  Component: React.ComponentType<Record<string, unknown> & { f: number }>;
  /** 씬 길이(프레임) */
  frames: number;
  /** 씬에 넘길 추가 props */
  props?: Record<string, unknown>;
}

const Wrap: React.FC<{
  scene: SceneSpec;
  last: boolean;
  xfade: number;
  fadeIn: number;
  zoom: number;
}> = ({ scene, last, xfade, fadeIn, zoom }) => {
  const f = useCurrentFrame();
  const { Component, frames, props } = scene;
  const inA = interpolate(f, [0, fadeIn], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outA = last
    ? 1
    : interpolate(f, [frames, frames + xfade], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: Math.min(inA, outA), transform: `scale(${1 + zoom * (1 - inA)})` }}>
      <Component {...(props ?? {})} f={f} />
    </AbsoluteFill>
  );
};

export interface SceneSwitcherProps {
  scenes: SceneSpec[];
  /** 각 씬의 시작 프레임 (timeline.sceneStarts 결과) */
  starts: number[];
  /** 겹치는 프레임 수 */
  xfade?: number;
  /** 들어올 때 밝아지는 프레임 수 */
  fadeIn?: number;
  /** 들어올 때 살짝 축소되며 들어오는 정도 */
  zoom?: number;
}

export const SceneSwitcher: React.FC<SceneSwitcherProps> = ({
  scenes, starts, xfade = 6, fadeIn = 8, zoom = 0.03,
}) => (
  <>
    {scenes.map((sc, i) => (
      <Sequence
        key={i}
        from={starts[i]}
        durationInFrames={sc.frames + (i === scenes.length - 1 ? 0 : xfade)}
        layout="none"
      >
        <Wrap
          scene={sc}
          last={i === scenes.length - 1}
          xfade={xfade}
          fadeIn={fadeIn}
          zoom={zoom}
        />
      </Sequence>
    ))}
  </>
);

export default SceneSwitcher;
