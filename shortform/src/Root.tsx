import React from 'react';
import { Composition } from 'remotion';
import {
  FPS, H, INTRO_FRAMES, INTRO_FRAMES_LANDSCAPE, OUTRO_FRAMES, OUTRO_FRAMES_LANDSCAPE,
  TITLE_CARD_FRAMES_LANDSCAPE, W, W_LANDSCAPE, H_LANDSCAPE,
} from '../assets';
import { Catalog, CAT_H, CAT_W } from './Catalog';
import { BrandTest, BRAND_TEST_FRAMES } from './BrandTest';
import { Intro } from '../assets/brand/Intro';
import { Outro } from '../assets/brand/Outro';
import { Intro as IntroLandscape } from '../assets/brand/16x9/Intro';
import { Outro as OutroLandscape } from '../assets/brand/16x9/Outro';
import { TitleCard as TitleCardLandscape } from '../assets/scenes/16x9/TitleCard';
import { PlainBg as PlainBgLandscape } from '../assets/backgrounds/16x9/PlainBg';

/** TitleCardLandscape 는 title 이 필수 prop 이라 Composition 의 defaultProps 타입 추론이
 *  안 맞는다(TitleCard 세로판도 Catalog 에서 직접 값을 넘겨 쓰지, Composition 으로 등록하지
 *  않는 이유와 동일). 미리보기 전용으로 title 에 기본값을 준 얇은 래퍼를 하나 둔다. */
const TitleCardLandscapePreview: React.FC<{ title?: string }> = ({
  title = '아이스크림 먹다 이마가 아픈 이유',
}) => <TitleCardLandscape title={title} />;

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

    {/* 16:9(가로) 포맷 자산 미리보기용. 세로 자산과 별개 컴포지션이라 회귀에 영향 없음 */}
    <Composition
      id="PlainBgLandscape"
      component={PlainBgLandscape}
      durationInFrames={90}
      fps={FPS}
      width={W_LANDSCAPE}
      height={H_LANDSCAPE}
      defaultProps={{}}
    />
    <Composition
      id="IntroLandscape"
      component={IntroLandscape}
      durationInFrames={INTRO_FRAMES_LANDSCAPE}
      fps={FPS}
      width={W_LANDSCAPE}
      height={H_LANDSCAPE}
      defaultProps={{}}
    />
    <Composition
      id="OutroLandscape"
      component={OutroLandscape}
      durationInFrames={OUTRO_FRAMES_LANDSCAPE}
      fps={FPS}
      width={W_LANDSCAPE}
      height={H_LANDSCAPE}
      defaultProps={{ nextHint: '다음 편에서 알려줄게!' }}
    />
    <Composition
      id="TitleCardLandscape"
      component={TitleCardLandscapePreview}
      durationInFrames={TITLE_CARD_FRAMES_LANDSCAPE}
      fps={FPS}
      width={W_LANDSCAPE}
      height={H_LANDSCAPE}
      defaultProps={{}}
    />
  </>
);
