/** 인트로. 매 영상 맨 앞에 붙는 고정 브랜드 구간.
 *
 *  길이 기본 69프레임 = 2.3초. 숏폼에서 인트로가 길면 그 자리에서 이탈하므로
 *  2.5초를 넘기지 않는다. 늘리고 싶으면 durationInFrames 를 올리되 2.5초까지만.
 *
 *  길이를 바꿀 때 상수만 올리면 안 된다. 아래 비트 타이밍이 절대 프레임이라
 *  끝부분이 통째로 정지 화면이 된다. 상수를 바꾸면 링/뱃지/채널명/밑줄/태그라인
 *  타이밍과 마지막 반짝임(shineT) 구간을 같이 재배치할 것.
 *
 *  채널명은 theme.CHANNEL_NAME_BY_LANG[lang] 에서 온다. 언어별 채널명을 바꾸려면 theme.ts 한 곳만 고치면 된다.
 *  (여기에 채널명 문자열을 직접 쓰지 말 것)
 */
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PlainBg } from '../backgrounds/PlainBg';
import { Actor } from '../character/Actor';
import { CHEER, IDLE } from '../character/poses';
import { blendPose, progress } from '../anim';
import { Sparkles } from '../scenes/Effects';
import { C, CHANNEL_MARK_BY_LANG, CHANNEL_NAME_BY_LANG, FONT, SW, W } from '../theme';

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
  /** 언어. channelName/mark를 명시적으로 안 받았을 때 이 값으로 자동 전환한다.
   *  기본값 'ko' (하위 호환 - lang을 안 넘기는 기존 호출부는 지금과 동일하게 동작) */
  lang?: 'ko' | 'en';
}

export const INTRO_FRAMES = 69;

export const Intro: React.FC<IntroProps> = ({
  channelName, mark, tagline,
  durationInFrames = INTRO_FRAMES,
  bgTop = C.sky, bgBottom = C.paper, accent = C.coral,
  lang = 'ko',
}) => {
  // destructuring 기본값은 다른 prop(lang)을 참조하지 못하므로 본문에서 resolve 한다.
  // channelName/mark를 명시적으로 넘긴 호출부는 여전히 그 값이 우선한다.
  const resolvedChannelName = channelName ?? CHANNEL_NAME_BY_LANG[lang];
  const resolvedMark = mark ?? CHANNEL_MARK_BY_LANG[lang];

  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 캐릭터: 바로 튀어 올라온다 (기다리는 시간 없음)
  // 첫 임팩트는 늘리지 않는다. 여기가 느려지면 인트로 전체가 늘어져 보인다.
  const rise = spring({ frame: f, fps, config: { damping: 12, mass: 0.6, stiffness: 170 } });
  const poseT = spring({ frame: f - 5, fps, config: { damping: 11, mass: 0.5, stiffness: 180 } });

  // 뒤에서 퍼지는 링 2개 - 등장 임팩트만 주고 바로 사라진다
  const burst = progress(f, 0, 20);
  const burst2 = progress(f, 6, 28);

  // 로고 뱃지 -> 채널명 -> 밑줄 -> 태그라인 순서로 들어온다
  const badgeP = spring({ frame: f - 12, fps, config: { damping: 10, mass: 0.5, stiffness: 190 } });
  const nameP = spring({ frame: f - 19, fps, config: { damping: 13, mass: 0.6, stiffness: 150 } });
  const barP = progress(f, 27, 41);
  const tagP = progress(f, 34, 46);

  // 로고 뱃지가 앉은 뒤 아주 얕게 숨쉬듯 커졌다 작아진다 (뒷구간이 완전 정지가 되지 않게)
  const badgeIdle = 1 + 0.02 * Math.sin((f - 12) / 6.2);

  // 마지막 비트: 로고 + 채널명 위로 반짝임이 한 번 훑고 지나간다.
  // 요소가 다 자리잡은 46프레임 이후 페이드 직전까지 화면에 움직임을 남기는 역할이다.
  const shineT = progress(f, 44, 66);

  // 마지막 5프레임은 살짝 밝아지며 본편으로 넘어간다 (컷이 튀지 않게)
  const outP = progress(f, durationInFrames - 5, durationInFrames);

  const CX = W / 2;
  const ring = (t: number, r0: number, color: string, wdt: number) => {
    if (t <= 0.001 || t >= 1) return null;
    return (
      <circle
        cx={CX} cy={760} r={r0 + 520 * t}
        fill="none" stroke={color} strokeWidth={wdt * (1 - t)} opacity={0.55 * (1 - t)}
      />
    );
  };

  return (
    <AbsoluteFill>
      <PlainBg top={bgTop} bottom={bgBottom} ground={null} />

      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {ring(burst, 60, accent, 26)}
        {ring(burst2, 40, C.gold, 20)}
      </svg>

      {/* 캐릭터 - 아래에서 튀어 올라오며 만세 */}
      <div
        style={{
          transform: `translateY(${(1 - rise) * 420}px) scale(${0.86 + 0.14 * rise})`,
          transformOrigin: '50% 100%',
          opacity: Math.min(1, rise * 2.2),
        }}
      >
        <Actor
          size={680}
          centerX={CX}
          ground={1040}
          pose={blendPose(IDLE, CHEER, poseT)}
          breathAmp={0.9}
        />
      </div>

      {burst > 0.15 && burst < 1 ? (
        <Sparkles box={{ x: CX - 380, y: 420, w: 760, h: 560 }} t={burst} scale={1.15} />
      ) : null}

      {/* 로고 뱃지 */}
      {badgeP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: CX - 84, top: 1150,
            width: 168, height: 168, borderRadius: 84,
            background: C.gold, border: `${SW}px solid ${C.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: 104, color: C.ink,
            transform: `scale(${badgeP * badgeIdle}) rotate(${(1 - badgeP) * -24}deg)`,
          }}
        >
          {resolvedMark}
        </div>
      ) : null}

      {/* 채널명 */}
      {nameP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 1372, textAlign: 'center',
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
            position: 'absolute', left: CX - 190, top: 1510,
            width: 380 * barP, height: 16, borderRadius: 8, background: accent,
          }}
        />
      ) : null}

      {tagline && tagP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 1556, textAlign: 'center',
            fontFamily: FONT, fontWeight: 400, fontSize: 46, color: C.inkSoft,
            opacity: tagP,
          }}
        >
          {tagline}
        </div>
      ) : null}

      {/* 로고 블록 위 마무리 반짝임 - 뱃지(1150)부터 태그라인(1600)까지 덮는다 */}
      {shineT > 0 && shineT < 1 ? (
        <Sparkles box={{ x: CX - 330, y: 1120, w: 660, h: 480 }} t={shineT} scale={0.85} />
      ) : null}

      {outP > 0 ? <AbsoluteFill style={{ background: C.paper, opacity: outP * 0.85 }} /> : null}
    </AbsoluteFill>
  );
};

export default Intro;
