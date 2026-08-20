import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from '../../../assets';
import { Episode, TOTAL_FRAMES } from './Episode';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PerdungiDemoDynamic"
      component={Episode}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
  </>
);

export default RemotionRoot;
