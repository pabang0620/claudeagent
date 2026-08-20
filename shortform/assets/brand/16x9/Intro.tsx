/** 인트로 - 16:9(가로) 캔버스 버전. `assets/brand/Intro.tsx`(세로 9:16)와 같은 톤·같은 비트 타이밍을
 *  쓰되, 좌표는 1920x1080 캔버스에 맞게 새로 잡았다.
 *
 *  세로판은 캐릭터(위) -> 로고뱃지 -> 채널명 -> 밑줄 -> 태그라인(아래)이 위에서 아래로 쌓이는
 *  구조였다. 가로 캔버스는 세로 여백이 훨씬 좁은 대신 가로 여백이 넉넉하므로, 세로 스택을 억지로
 *  욱여넣지 않고 **캐릭터는 왼쪽, 로고뱃지~태그라인 블록은 오른쪽**의 좌우 배치로 새로 구성했다.
 *  타이밍(비트 진행 프레임 수) 자체는 세로판과 동일하게 유지해 브랜드 인상이 같게 느껴지도록 했다.
 *
 *  길이 기본 69프레임 = 2.3초(세로판과 동일 - 인트로가 2.5초를 넘기지 않는 규칙도 동일 적용).
 *  길이를 바꿀 때 아래 비트 타이밍(뱃지/채널명/밑줄/태그라인/반짝임)을 같이 재배치할 것 -
 *  세로판 Intro.tsx 상단 주석과 동일한 주의사항이 적용된다.
 *
 *  채널명은 theme.CHANNEL_NAME_BY_LANG[lang] 에서 온다(여기에 채널명 문자열을 직접 쓰지 않는다).
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PlainBg } from '../../backgrounds/16x9/PlainBg';
import { Actor } from '../../character/Actor';
import { CHEER, IDLE } from '../../character/poses';
import { blendPose, progress } from '../../anim';
import { Sparkles } from '../../scenes/Effects';
import { C, CHANNEL_MARK_BY_LANG, CHANNEL_NAME_BY_LANG, FONT, H_LANDSCAPE, SW, W_LANDSCAPE } from '../../theme';

// 로고 뱃지 팝인 사운드. 뱃지 fade 가 시작하는 프레임(아래 fadeOpacity, progress(f, 12, 24))과
// 정확히 같은 지점에서 울리도록 이 상수를 fadeOpacity 의 시작 프레임과 함께 맞춘다. (세로판과 동일)
const DING_AT = 12;
const DING_FRAMES = 15;

export interface IntroProps {
  /** 명시적으로 안 넘기면 lang에 따라 CHANNEL_NAME_BY_LANG에서 자동 결정 */
  channelName?: string;
  /** 로고 뱃지 안 기호. 명시적으로 안 넘기면 lang에 따라 CHANNEL_MARK_BY_LANG에서 자동 결정 */
  mark?: string;
  /** 채널명 아래 한 줄 (없으면 표시 안 함) */
  tagline?: string;
  durationInFrames?: number;
  bgTop?: string;
  bgBottom?: string;
  accent?: string;
  /** 언어. channelName/mark를 명시적으로 안 받았을 때 이 값으로 자동 전환한다. 기본값 'ko' */
  lang?: 'ko' | 'en';
}

export const INTRO_FRAMES = 69;

// 캐릭터 구역 (왼쪽)
const CHAR_X = 470;
const CHAR_GROUND = 760;
const CHAR_SIZE = 460;
// 캐릭터의 실제 시각적 중심(머리끝~발끝 중간) - 링·반짝임을 여기 맞춘다.
// FEET_VB=1026, HEAD_TOP_VB=172, RIG.H=1254 실측값 기준 계산치(세로판 Intro 와 동일 공식).
const CHAR_VIS_CY = 603;

// 로고뱃지~태그라인 블록 (오른쪽 컬럼)
const COL_LEFT = 980;
const COL_WIDTH = 860;
const COL_CX = COL_LEFT + COL_WIDTH / 2;

export const Intro: React.FC<IntroProps> = ({
  channelName, mark, tagline,
  durationInFrames = INTRO_FRAMES,
  bgTop = C.sky, bgBottom = C.paper, accent = C.coral,
  lang = 'ko',
}) => {
  const resolvedChannelName = channelName ?? CHANNEL_NAME_BY_LANG[lang];
  const resolvedMark = mark ?? CHANNEL_MARK_BY_LANG[lang];

  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame: f, fps, config: { damping: 12, mass: 0.6, stiffness: 170 } });
  const poseT = spring({ frame: f - 5, fps, config: { damping: 11, mass: 0.5, stiffness: 180 } });

  // 뒤에서 퍼지는 링 2개 - 캐릭터 중심에 맞춘다. 반경 성장폭(400)은 오른쪽 텍스트 컬럼
  // (COL_LEFT=980)까지 침범하지 않도록 세로판(520)보다 좁혔다.
  const burst = progress(f, 0, 20);
  const burst2 = progress(f, 6, 28);

  const fadeOpacity = progress(f, 12, 24);
  const fadeSlide = (1 - progress(f, 12, 26)) * 14;
  const nameP = spring({ frame: f - 19, fps, config: { damping: 13, mass: 0.6, stiffness: 150 } });
  const barP = progress(f, 27, 41);
  const tagP = progress(f, 34, 46);

  const badgeIdle = 1 + 0.02 * Math.sin((f - 12) / 6.2);
  const shineT = progress(f, 44, 66);
  const outP = progress(f, durationInFrames - 5, durationInFrames);

  const ring = (t: number, r0: number, color: string, wdt: number) => {
    if (t <= 0.001 || t >= 1) return null;
    return (
      <circle
        cx={CHAR_X} cy={CHAR_VIS_CY} r={r0 + 400 * t}
        fill="none" stroke={color} strokeWidth={wdt * (1 - t)} opacity={0.55 * (1 - t)}
      />
    );
  };

  return (
    <AbsoluteFill>
      <PlainBg top={bgTop} bottom={bgBottom} ground={null} />

      <Sequence from={DING_AT} durationInFrames={DING_FRAMES} layout="none">
        <Audio src={staticFile('audio/intro_ding.mp3')} volume={0.7} />
      </Sequence>

      <svg width={W_LANDSCAPE} height={H_LANDSCAPE} style={{ position: 'absolute', left: 0, top: 0 }}>
        {ring(burst, 60, accent, 26)}
        {ring(burst2, 40, C.gold, 20)}
      </svg>

      {/* 캐릭터 - 왼쪽에서 아래로부터 튀어 올라오며 만세 */}
      <div
        style={{
          transform: `translateY(${(1 - rise) * 300}px) scale(${0.86 + 0.14 * rise})`,
          transformOrigin: '50% 100%',
          opacity: Math.min(1, rise * 2.2),
        }}
      >
        <Actor
          size={CHAR_SIZE}
          centerX={CHAR_X}
          ground={CHAR_GROUND}
          pose={blendPose(IDLE, CHEER, poseT)}
          breathAmp={0.9}
        />
      </div>

      {burst > 0.15 && burst < 1 ? (
        <Sparkles box={{ x: CHAR_X - 250, y: 357, w: 500, h: 363 }} t={burst} scale={1.0} />
      ) : null}

      {/* 로고 뱃지 - fade_minimal: opacity + 미세한 하강만, 스프링 팝인/회전 없음 (세로판과 동일 톤) */}
      {fadeOpacity > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: COL_CX - 84, top: 340,
            width: 168, height: 168, borderRadius: 84,
            background: C.gold, border: `${SW}px solid ${C.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: 104, color: C.ink,
            opacity: fadeOpacity,
            transform: `translateY(${fadeSlide}px) scale(${badgeIdle})`,
          }}
        >
          {resolvedMark}
        </div>
      ) : null}

      {/* 채널명 */}
      {nameP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: COL_LEFT, width: COL_WIDTH, top: 528, textAlign: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: 108, lineHeight: 1.1, color: C.ink,
            letterSpacing: '-2px',
            transform: `translateY(${(1 - nameP) * 34}px) scale(${0.82 + 0.18 * nameP})`,
            opacity: Math.min(1, nameP * 1.6),
          }}
        >
          {resolvedChannelName}
        </div>
      ) : null}

      {/* 채널명 밑줄 - 왼쪽에서 오른쪽으로 그어진다 */}
      {barP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: COL_CX - 190, top: 658,
            width: 380 * barP, height: 16, borderRadius: 8, background: accent,
          }}
        />
      ) : null}

      {tagline && tagP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: COL_LEFT, width: COL_WIDTH, top: 696, textAlign: 'center',
            fontFamily: FONT, fontWeight: 400, fontSize: 46, color: C.inkSoft,
            opacity: tagP,
          }}
        >
          {tagline}
        </div>
      ) : null}

      {/* 로고 블록 위 마무리 반짝임 - 뱃지(340)부터 태그라인(742)까지 덮는다 */}
      {shineT > 0 && shineT < 1 ? (
        <Sparkles box={{ x: COL_CX - 330, y: 320, w: 660, h: 440 }} t={shineT} scale={0.85} />
      ) : null}

      {outP > 0 ? <AbsoluteFill style={{ background: C.paper, opacity: outP * 0.85 }} /> : null}
    </AbsoluteFill>
  );
};

export default Intro;
