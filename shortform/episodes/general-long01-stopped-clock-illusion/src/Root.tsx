import React from 'react';
import { Composition } from 'remotion';
import { FPS, H_LANDSCAPE, W_LANDSCAPE } from '../../../assets';
import { Episode, EpisodeProps, totalFramesFor } from './Episode';

// Composition 의 Props 제네릭이 defaultProps 만으로는 EpisodeProps(locale: 'ko'|'en') 를
// 안정적으로 추론하지 못해 component 를 넓혀 캐스팅한다 (동작에는 영향 없음, 타입 단언일 뿐).
const EpisodeComponent = Episode as unknown as React.ComponentType<Record<string, unknown>>;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="EpisodeKo"
      component={EpisodeComponent}
      durationInFrames={totalFramesFor('ko')}
      fps={FPS}
      width={W_LANDSCAPE}
      height={H_LANDSCAPE}
      defaultProps={{ locale: 'ko' } satisfies EpisodeProps}
    />
    <Composition
      id="EpisodeEn"
      component={EpisodeComponent}
      durationInFrames={totalFramesFor('en')}
      fps={FPS}
      width={W_LANDSCAPE}
      height={H_LANDSCAPE}
      defaultProps={{ locale: 'en' } satisfies EpisodeProps}
    />
  </>
);

export default RemotionRoot;
