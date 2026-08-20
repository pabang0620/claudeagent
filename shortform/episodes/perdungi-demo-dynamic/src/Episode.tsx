import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { PerdungiDynamicStage, CROUCH_END, LAND_FRAME, TOTAL_FRAMES } from './scenes';

export { TOTAL_FRAMES };

export const Episode: React.FC = () => (
  <AbsoluteFill>
    <PerdungiDynamicStage />
    {/* 도약 순간 - 발이 땅을 박차는 가벼운 소리 (기존 hop_thump 재사용, 볼륨 낮춤) */}
    <Sequence from={CROUCH_END} durationInFrames={12} layout="none">
      <Audio src={staticFile('audio/hop_thump.mp3')} volume={0.35} />
    </Sequence>
    {/* 착지 순간 - 임팩트음 (풀 볼륨) */}
    <Sequence from={LAND_FRAME} durationInFrames={12} layout="none">
      <Audio src={staticFile('audio/hop_thump.mp3')} volume={0.7} />
    </Sequence>
  </AbsoluteFill>
);

export default Episode;
