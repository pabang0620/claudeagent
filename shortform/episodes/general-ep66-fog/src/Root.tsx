import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from '../../../assets';
import { Episode, EpisodeProps, totalFramesFor } from './Episode';

// 영어 채널(Whymo) 운영 중단(2026-09-02)으로 한국어판만 만든다. render.mjs는 'ko' 인자로
// 호출되므로 EpisodeKo Composition만 등록하면 된다.
const EpisodeComponent = Episode as unknown as React.ComponentType<Record<string, unknown>>;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="EpisodeKo"
    component={EpisodeComponent}
    durationInFrames={totalFramesFor('ko')}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{ locale: 'ko' } satisfies EpisodeProps}
  />
);

export default RemotionRoot;
