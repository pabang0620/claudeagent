import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from '../../../assets';
import { Episode, EpisodeProps, totalFramesFor } from './Episode';

// 영어 채널(Whymo) 운영 중단으로 한국어판만 만든다(오케스트레이터 지시 명시).
// 그래서 EpisodeEn Composition 은 등록하지 않는다 - render.mjs 는 'ko' 인자로 호출되므로
// EpisodeKo 만 있으면 된다.
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
