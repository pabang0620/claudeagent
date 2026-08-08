/** 아웃트로. 매 영상 맨 뒤에 붙는 고정 브랜드 구간.
 *
 *  길이 기본 90프레임 = 3.0초. 구독 유도 + 다음 편 예고 두 가지만 담는다.
 *  다음 편 문구는 nextTitle / nextHint props 로 매 화 바꾼다.
 *
 *  길이를 바꿀 때 상수만 올리면 안 된다. 카드/구독/채널명 등장과 반짝임(sparkT),
 *  종 딸랑임 감쇠 구간이 전부 절대 프레임이라 같이 재배치해야 한다.
 *  손 흔들기(waveT)와 호흡은 주기 함수라 길이와 무관하게 끝까지 움직인다.
 *
 *  기본은 밝은 배경이다. 본편 마지막 장면이 어두우면 dark 를 켜서 이어 붙인다.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PlainBg } from '../backgrounds/PlainBg';
import { NightSkyBg } from '../backgrounds/NightSkyBg';
import { Actor } from '../character/Actor';
import { WAVE } from '../character/poses';
import { blendPose, progress } from '../anim';
import { Appear, Sparkles } from '../scenes/Effects';
import { ThemedIcon } from '../props/ThemedIcon';
import { C, CHANNEL_NAME_BY_LANG, FONT, RADIUS, SUBSCRIBE_TEXT_BY_LANG, SW, W } from '../theme';

// 구독 벨(로고 역할) 팝인 사운드. 아래 subFadeOpacity 가 시작하는 프레임(progress(f, 21, 33))과
// 정확히 같은 지점에서 울리도록 이 상수를 그 시작 프레임과 함께 맞춘다.
const DING_AT = 21;
// 원본(assets/audio/outro_ding.mp3) 실측 0.32초(30fps 기준 약 9.6프레임)에 여유를 더했다.
const DING_FRAMES = 16;

export interface OutroProps {
  /** 다음 편 예고 문구. 매 화 바꾼다 */
  nextHint?: string;
  /** 예고 카드 위 작은 라벨 */
  nextTitle?: string;
  /** 명시적으로 안 넘기면 lang에 따라 SUBSCRIBE_TEXT_BY_LANG에서 자동 결정 */
  subscribeText?: string;
  /** 명시적으로 안 넘기면 lang에 따라 CHANNEL_NAME_BY_LANG에서 자동 결정 */
  channelName?: string;
  durationInFrames?: number;
  /** 어두운 배경 버전 */
  dark?: boolean;
  accent?: string;
  /** 언어. subscribeText/channelName을 명시적으로 안 받았을 때 이 값으로 자동 전환한다.
   *  기본값 'ko' (하위 호환 - lang을 안 넘기는 기존 호출부는 지금과 동일하게 동작) */
  lang?: 'ko' | 'en';
}

export const OUTRO_FRAMES = 90;

export const Outro: React.FC<OutroProps> = ({
  nextHint = '다음 편에서 알려줄게!',
  nextTitle = '다음 편',
  subscribeText,
  channelName,
  durationInFrames = OUTRO_FRAMES,
  dark = false,
  accent = C.coral,
  lang = 'ko',
}) => {
  // destructuring 기본값은 다른 prop(lang)을 참조하지 못하므로 본문에서 resolve 한다.
  // subscribeText/channelName을 명시적으로 넘긴 호출부는 여전히 그 값이 우선한다.
  const resolvedSubscribeText = subscribeText ?? SUBSCRIBE_TEXT_BY_LANG[lang];
  const resolvedChannelName = channelName ?? CHANNEL_NAME_BY_LANG[lang];

  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fg = dark ? C.cream : C.ink;
  const cardBg = dark ? C.nightMid : C.paper;
  const subText = dark ? C.cream : C.ink;

  const charP = spring({ frame: f, fps, config: { damping: 13, mass: 0.7, stiffness: 150 } });
  const cardP = spring({ frame: f - 7, fps, config: { damping: 14, mass: 0.7, stiffness: 130 } });
  // 구독 벨 등장은 스프링 팝인(오버슈트) 대신 opacity + 아주 미세한 위치 이동만 쓴다
  // (인트로 로고 뱃지와 같은 fade_minimal 톤 - out/intro-style-compare/ 참고).
  // 종이 딸랑거리며 흔들리는 rotate(아래 bell div 의 transform)는 여기에 영향받지 않는다 -
  // 그건 물리적으로 종이 울리는 표현이라 별도 프레임 함수로 유지한다.
  const subFadeOpacity = progress(f, 21, 33);
  const subFadeSlide = (1 - progress(f, 21, 35)) * 14; // 14px 위에서 살짝 내려앉는다
  const nameP = progress(f, 34, 50);
  // 반짝임을 뒤까지 길게 끌어 페이드 직전까지 화면이 멈추지 않게 한다
  const sparkT = progress(f, 22, 74);

  // 손 흔들기: 어깨각을 오가게 해서 실제로 흔드는 것처럼 보이게 한다
  const waveT = 0.5 + 0.5 * Math.sin((f - 4) / 3.2);
  const wavePose = blendPose(
    WAVE,
    { ...WAVE, armL: { s: 118, e: 26 }, headTilt: 3 },
    Math.max(0, Math.min(1, waveT))
  );

  const CX = W / 2;
  const outP = progress(f, durationInFrames - 6, durationInFrames);

  return (
    <AbsoluteFill>
      {dark
        ? <NightSkyBg stars={46} frame={f} moon={null} horizon={null} />
        : <PlainBg top={C.sky} bottom={C.paper} ground={null} />}

      {/* 구독 벨이 fade-in 을 시작하는 프레임(subFadeOpacity 의 시작점, DING_AT)에 맞춰 "딩" 사운드 */}
      <Sequence from={DING_AT} durationInFrames={DING_FRAMES} layout="none">
        <Audio src={staticFile('audio/outro_ding.mp3')} volume={0.7} />
      </Sequence>

      {/* 채널명 (작게, 위쪽) */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center',
          fontFamily: FONT, fontWeight: 700, fontSize: 50, letterSpacing: '-1px',
          color: dark ? C.nightSoft : C.inkSoft, opacity: nameP,
        }}
      >
        {resolvedChannelName}
      </div>

      {/* 다음 편 예고 카드 */}
      <Appear progress={cardP} from="up" distance={56}>
        <div
          style={{
            position: 'absolute', left: 90, top: 400, width: 900, minHeight: 300,
            background: cardBg, border: `${SW}px solid ${dark ? C.cream : C.ink}`,
            borderRadius: RADIUS.lg, boxSizing: 'border-box',
            padding: '64px 44px 44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: 76, lineHeight: 1.28,
            color: fg, textAlign: 'center',
            // 한국어는 어절 중간에서 줄이 끊기면 읽기 나빠진다
            wordBreak: 'keep-all',
          }}
        >
          {nextHint}
        </div>
        <div
          style={{
            position: 'absolute', left: 140, top: 358,
            background: C.gold, border: `9px solid ${dark ? C.cream : C.ink}`,
            borderRadius: RADIUS.pill, padding: '6px 30px',
            fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.ink,
          }}
        >
          {nextTitle}
        </div>
      </Appear>

      {/* 구독 유도 - fade_minimal: opacity + 미세한 하강만, 스프링 팝인 없음 */}
      {subFadeOpacity > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 840,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            opacity: subFadeOpacity,
            transform: `translateY(${subFadeSlide}px)`,
          }}
        >
          <div
            style={{
              width: 172, height: 172, borderRadius: 86, background: C.gold,
              border: `${SW}px solid ${dark ? C.cream : C.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              // 종이 딸랑거린다. 딸랑임이 잦아든 뒤에도 아주 느린 흔들림만 남겨
              // 뒷구간이 완전 정지 화면이 되지 않게 한다
              transform: `rotate(${Math.sin(f / 2.6) * 9 * Math.max(0, 1 - (f - 21) / 48)
                + Math.sin(f / 12) * 2}deg)`,
            }}
          >
            <ThemedIcon name="bell" size={96} color={C.ink} strokePx={11} />
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: subText }}>
            {resolvedSubscribeText}
          </div>
        </div>
      ) : null}

      {sparkT > 0 && sparkT < 1 ? (
        <Sparkles box={{ x: CX - 280, y: 782, w: 560, h: 250 }} t={sparkT} scale={0.9} />
      ) : null}

      {/* 손 흔드는 캐릭터 */}
      <div
        style={{
          transform: `translateY(${(1 - charP) * 260}px)`,
          opacity: Math.min(1, charP * 2),
        }}
      >
        <Actor size={560} centerX={CX} ground={1560} pose={wavePose} mouthOpen={0.62} breathAmp={0.8} />
      </div>

      {outP > 0 ? (
        <AbsoluteFill style={{ background: dark ? C.night : C.paper, opacity: outP }} />
      ) : null}
    </AbsoluteFill>
  );
};

export default Outro;
