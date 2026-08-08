import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, INTRO_FRAMES, OUTRO_FRAMES, W } from '../assets';
import { Catalog, CAT_H, CAT_W } from './Catalog';
import { BrandTest, BRAND_TEST_FRAMES } from './BrandTest';
import { Intro } from '../assets/brand/Intro';
import { Outro } from '../assets/brand/Outro';

export const RemotionRoot: React.FC = () => (
  <>
    {/* 자산 전수 확인용 (정지 이미지로 뽑는다) */}
    <Composition
      id="Catalog"
      component={Catalog}
      durationInFrames={90}
      fps={FPS}
      width={CAT_W}
      height={CAT_H}
    />
    {/* 인트로 + 아웃트로 연속 재생 */}
    <Composition
      id="BrandTest"
      component={BrandTest}
      durationInFrames={BRAND_TEST_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ nextHint: '다음 편엔 이 친구 이야기!' }}
    />
    <Composition
      id="Intro"
      component={Intro}
      durationInFrames={INTRO_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{}}
    />
    <Composition
      id="Outro"
      component={Outro}
      durationInFrames={OUTRO_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ nextHint: '다음 편에서 알려줄게!' }}
    />
  </>
);
