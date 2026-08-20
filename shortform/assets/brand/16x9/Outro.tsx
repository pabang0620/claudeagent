/** 아웃트로 - 16:9(가로) 캔버스 버전. `assets/brand/Outro.tsx`(세로 9:16)와 같은 톤·같은 구성
 *  요소(다음 편 예고 카드 + 구독 유도(종) + 손 흔드는 캐릭터)를 쓰되, 좌표는 1920x1080 캔버스에
 *  맞게 새로 잡았다.
 *
 *  세로판은 카드 -> 구독 유도 -> 캐릭터가 위에서 아래로 쌓이는 구조였다. 가로 캔버스는
 *  **손 흔드는 캐릭터를 왼쪽에, 채널명~카드~구독 유도를 오른쪽 컬럼에** 배치해 좌우 구도로
 *  다시 짰다(Intro 16x9 와 동일한 원칙 - 세로 스택을 늘리지 않고 새로 구도를 잡는다).
 *
 *  길이 기본 90프레임 = 3.0초(세로판과 동일). 종 딸랑임 감쇠, 반짝임(sparkT) 등 절대 프레임
 *  타이밍은 세로판과 동일하게 유지해 브랜드 인상이 같게 느껴지도록 했다.
 *
 *  `dark` 배경 옵션: 세로판은 `NightSkyBg`(별+달)를 썼지만, 그 컴포넌트는 내부적으로 세로
 *  W/H(1080x1920)를 하드코딩하고 있어 16:9 캔버스에 그대로 쓰면 별이 화면 왼쪽 1080px 안에만
 *  찍혀 어색해진다(이번 작업 범위는 16x9 NightSkyBg 신규 제작을 포함하지 않는다). 대신 이 파일의
 *  `dark` 모드는 어두운 톤의 `backgrounds/16x9/PlainBg`(night/nightMid)로 대체했다 - "다음 편
 *  본편 마지막이 어두우면 이어붙인다"는 목적은 동일하게 달성한다.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PlainBg } from '../../backgrounds/16x9/PlainBg';
import { Actor } from '../../character/Actor';
import { WAVE } from '../../character/poses';
import { blendPose, progress } from '../../anim';
import { Appear, Sparkles } from '../../scenes/Effects';
import { ThemedIcon } from '../../props/ThemedIcon';
import { C, CHANNEL_NAME_BY_LANG, FONT, RADIUS, SUBSCRIBE_TEXT_BY_LANG, SW } from '../../theme';

// 구독 벨(로고 역할) 팝인 사운드. 아래 subFadeOpacity 가 시작하는 프레임(progress(f, 21, 33))과
// 정확히 같은 지점에서 울리도록 이 상수를 그 시작 프레임과 함께 맞춘다. (세로판과 동일)
const DING_AT = 21;
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
  /** 어두운 배경 버전 (NightSkyBg 대신 어두운 톤 PlainBg - 위 파일 상단 주석 참고) */
  dark?: boolean;
  accent?: string;
  /** 언어. subscribeText/channelName을 명시적으로 안 받았을 때 이 값으로 자동 전환한다. 기본값 'ko' */
  lang?: 'ko' | 'en';
}

export const OUTRO_FRAMES = 90;

// 캐릭터 구역 (왼쪽)
const CHAR_X = 430;
const CHAR_GROUND = 900;
const CHAR_SIZE = 480;

// 채널명~카드~구독 유도 블록 (오른쪽 컬럼)
const COL_LEFT = 830;
const COL_WIDTH = 1010;
const COL_CX = COL_LEFT + COL_WIDTH / 2;
const CARD_LEFT = COL_LEFT + 30;
const CARD_WIDTH = 950;

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
  const resolvedSubscribeText = subscribeText ?? SUBSCRIBE_TEXT_BY_LANG[lang];
  const resolvedChannelName = channelName ?? CHANNEL_NAME_BY_LANG[lang];

  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fg = dark ? C.cream : C.ink;
  const cardBg = dark ? C.nightMid : C.paper;
  const subText = dark ? C.cream : C.ink;

  const charP = spring({ frame: f, fps, config: { damping: 13, mass: 0.7, stiffness: 150 } });
  const cardP = spring({ frame: f - 7, fps, config: { damping: 14, mass: 0.7, stiffness: 130 } });
  const subFadeOpacity = progress(f, 21, 33);
  const subFadeSlide = (1 - progress(f, 21, 35)) * 14;
  const nameP = progress(f, 34, 50);
  const sparkT = progress(f, 22, 74);

  const waveT = 0.5 + 0.5 * Math.sin((f - 4) / 3.2);
  const wavePose = blendPose(
    WAVE,
    { ...WAVE, armL: { s: 118, e: 26 }, headTilt: 3 },
    Math.max(0, Math.min(1, waveT))
  );

  const outP = progress(f, durationInFrames - 6, durationInFrames);

  return (
    <AbsoluteFill>
      {dark
        ? <PlainBg top={C.night} bottom={C.nightMid} ground={null} />
        : <PlainBg top={C.sky} bottom={C.paper} ground={null} />}

      <Sequence from={DING_AT} durationInFrames={DING_FRAMES} layout="none">
        <Audio src={staticFile('audio/outro_ding.mp3')} volume={0.7} />
      </Sequence>

      {/* 채널명 (작게, 컬럼 위쪽) */}
      <div
        style={{
          position: 'absolute', left: COL_LEFT, width: COL_WIDTH, top: 190, textAlign: 'center',
          fontFamily: FONT, fontWeight: 700, fontSize: 42, letterSpacing: '-1px',
          color: dark ? C.nightSoft : C.inkSoft, opacity: nameP,
        }}
      >
        {resolvedChannelName}
      </div>

      {/* 다음 편 예고 카드 */}
      <Appear progress={cardP} from="up" distance={56}>
        <div
          style={{
            position: 'absolute', left: CARD_LEFT, top: 260, width: CARD_WIDTH, minHeight: 220,
            background: cardBg, border: `${SW}px solid ${dark ? C.cream : C.ink}`,
            borderRadius: RADIUS.lg, boxSizing: 'border-box',
            padding: '46px 44px 30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.28,
            color: fg, textAlign: 'center',
            wordBreak: 'keep-all',
          }}
        >
          {nextHint}
        </div>
        <div
          style={{
            position: 'absolute', left: CARD_LEFT + 50, top: 242,
            background: C.gold, border: `9px solid ${dark ? C.cream : C.ink}`,
            borderRadius: RADIUS.pill, padding: '6px 30px',
            fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.ink,
          }}
        >
          {nextTitle}
        </div>
      </Appear>

      {/* 구독 유도 - fade_minimal: opacity + 미세한 하강만, 스프링 팝인 없음 (세로판과 동일 톤).
          text 줄바꿈 폭은 컬럼 전체(COL_WIDTH)로 넉넉히 줘서 짧은 텍스트가 의도치 않게
          두 줄로 꺾이지 않게 한다(세로판은 폭 제한이 아예 없어 한 줄로 나온다 - 좁게
          잡으면 "구독·팔로우하고 다음 편" / "보기" 처럼 어색하게 꺾인다, 렌더 검수로 발견).
          top 을 카드(top 260, minHeight 220)에서 충분히 떨어뜨려 nextHint 가 2~3줄로 늘어나도
          카드 하단과 겹치지 않게 여유를 둔다(렌더 검수로 발견 - 긴 영어 nextHint 스트레스 테스트) */}
      {subFadeOpacity > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: COL_LEFT, top: 660, width: COL_WIDTH,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
            opacity: subFadeOpacity,
            transform: `translateY(${subFadeSlide}px)`,
          }}
        >
          <div
            style={{
              width: 150, height: 150, borderRadius: 75, background: C.gold,
              border: `${SW}px solid ${dark ? C.cream : C.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${Math.sin(f / 2.6) * 9 * Math.max(0, 1 - (f - 21) / 48)
                + Math.sin(f / 12) * 2}deg)`,
            }}
          >
            <ThemedIcon name="bell" size={84} color={C.ink} strokePx={10} />
          </div>
          <div
            style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 48, color: subText, textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {resolvedSubscribeText}
          </div>
        </div>
      ) : null}

      {sparkT > 0 && sparkT < 1 ? (
        <Sparkles box={{ x: COL_CX - 260, y: 570, w: 520, h: 260 }} t={sparkT} scale={0.85} />
      ) : null}

      {/* 손 흔드는 캐릭터 (왼쪽) */}
      <div
        style={{
          transform: `translateY(${(1 - charP) * 220}px)`,
          opacity: Math.min(1, charP * 2),
        }}
      >
        <Actor size={CHAR_SIZE} centerX={CHAR_X} ground={CHAR_GROUND} pose={wavePose} mouthOpen={0.62} breathAmp={0.8} />
      </div>

      {outP > 0 ? (
        <AbsoluteFill style={{ background: dark ? C.night : C.paper, opacity: outP }} />
      ) : null}
    </AbsoluteFill>
  );
};

export default Outro;
