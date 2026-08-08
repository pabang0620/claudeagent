/** 인트로 + 아웃트로를 이어 붙인 검수용 컴포지션.
 *  실제 에피소드에서는 본편 장면들 앞뒤에 같은 방식으로 Sequence 로 붙인다.
 */
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { FontLoader, Intro, INTRO_FRAMES, Outro, OUTRO_FRAMES } from '../assets';

/** 사이에 본편이 있다고 가정하고 짧은 더미 구간을 넣는다 */
export const GAP_FRAMES = 21;
export const BRAND_TEST_FRAMES = INTRO_FRAMES + GAP_FRAMES + OUTRO_FRAMES;

const Gap: React.FC = () => (
  <AbsoluteFill
    style={{
      background: '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'NanumSquareRound', sans-serif", fontWeight: 700, fontSize: 72, color: '#67738A',
    }}
  >
    (본편 자리)
  </AbsoluteFill>
);

export const BrandTest: React.FC<{ nextHint?: string }> = ({ nextHint = '다음 편엔 이 친구 이야기!' }) => (
  <AbsoluteFill>
    <FontLoader />
    <Sequence from={0} durationInFrames={INTRO_FRAMES} layout="none">
      <Intro />
    </Sequence>
    <Sequence from={INTRO_FRAMES} durationInFrames={GAP_FRAMES} layout="none">
      <Gap />
    </Sequence>
    <Sequence from={INTRO_FRAMES + GAP_FRAMES} durationInFrames={OUTRO_FRAMES} layout="none">
      <Outro nextHint={nextHint} />
    </Sequence>
  </AbsoluteFill>
);

export default BrandTest;
