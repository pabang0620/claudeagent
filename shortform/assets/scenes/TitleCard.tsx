/** 제목 카드. 인트로 직후, 본편(s1) 시작 전에 1.5~2초간 그 화의 제목을 띄우는 표준 요소.
 *
 *  brand/Intro·Outro 와 같은 자리(고정 브랜드 구간)에 있지만, 화면 문구(title)는 매 화 바뀌므로
 *  props 로 받는다(REGISTRY 규칙 3 - 화면 문구 하드코딩 금지). 톤은 Intro 의 fade_minimal 로직을
 *  그대로 따른다: 스프링 오버슛·회전 팝인 없이 opacity + 아주 미세한 이동만 쓴다.
 *
 *  Intro/Outro 와 동일하게 이 컴포넌트는 SceneSwitcher 배열에 여러 번 재사용되는 게 아니라
 *  자체 <Sequence> 안에 한 번만 놓인다. 그래서 REGISTRY 규칙 5(씬은 frame 을 prop 으로 받는다)의
 *  예외로, Intro/Outro 와 같은 방식으로 useCurrentFrame() 을 직접 쓴다(브랜드 구간과 동일한
 *  선례). Catalog.tsx 등에서 특정 프레임을 고정해 미리 보고 싶을 때는 frame prop 을 넘기면
 *  useCurrentFrame() 대신 그 값을 쓴다.
 *
 *  제목은 화면 폭(maxWidth)에 맞춰 1~2줄로 자연 줄바꿈된다(언어별로 줄 수가 다를 수 있어
 *  고정 줄바꿈을 강제하지 않는다). 줄 수가 달라져도 겹치지 않도록 accent 점 - 제목 - 밑줄을
 *  flex column 으로 쌓아 title 블록 높이에 따라 아래 요소가 자동으로 밀리게 했다.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PlainBg } from '../backgrounds/PlainBg';
import { Actor } from '../character/Actor';
import { POINT_UP } from '../character/poses';
import type { Pose } from '../character/Character';
import { progress } from '../anim';
import { C, FONT, W } from '../theme';

export interface TitleCardProps {
  /** 화면에 뜨는 제목 문구. 언어별 문자열은 호출부(strings.ts)에서 넘긴다 */
  title: string;
  /** 로컬 프레임. 생략하면 useCurrentFrame() 을 쓴다(Intro/Outro 와 동일 패턴) */
  frame?: number;
  durationInFrames?: number;
  bgTop?: string;
  bgBottom?: string;
  textColor?: string;
  accent?: string;
  fontSize?: number;
  /** 제목 아래 캐릭터를 세울지. 기본 true(pointUp - 제목을 가리키는 포즈) */
  showCharacter?: boolean;
  pose?: Pose;
}

/** 1.8초(30fps 기준). 프로필 지침(1.5~2초) 중간값 - 읽기엔 충분하되 늘어지지 않는 길이 */
export const TITLE_CARD_FRAMES = 54;

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  frame,
  durationInFrames = TITLE_CARD_FRAMES,
  bgTop = C.sky,
  bgBottom = C.paper,
  textColor = C.ink,
  accent = C.coral,
  fontSize = 78,
  showCharacter = true,
  pose = POINT_UP,
}) => {
  const hookFrame = useCurrentFrame();
  const f = frame ?? hookFrame;

  // 등장: opacity + 위에서 아주 살짝 내려앉음 (Intro 뱃지 fade_minimal 과 동일한 폭 - 14px 대)
  const textP = progress(f, 0, 12);
  const textY = (1 - textP) * 18;

  // accent 점 -> 제목 -> 밑줄 순서로 살짝 시차를 둔다 (전부 opacity 기반, 스프링 팝인 없음)
  const dotP = progress(f, 0, 10);
  const barP = progress(f, 16, 30);

  // 캐릭터는 제목이 자리잡은 뒤 따라 들어온다
  const charP = progress(f, 10, 24);
  const charY = (1 - charP) * 22;

  // 퇴장: 마지막 10프레임 동안 paper 로 덮으며 다음 장면(SceneSwitcher 첫 씬)과 자연스럽게 이어진다
  // (brand/Intro.tsx 의 outP 와 동일한 방식 - 이미 확정된 톤을 그대로 따른다)
  const outP = progress(f, durationInFrames - 10, durationInFrames);

  const CX = W / 2;

  return (
    <PlainBg top={bgTop} bottom={bgBottom} ground={null}>
      <div
        style={{
          position: 'absolute', left: 70, right: 70, top: 560,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26,
        }}
      >
        <div
          style={{
            width: 60, height: 10, borderRadius: 5, background: accent,
            opacity: dotP,
          }}
        />
        <div
          style={{
            maxWidth: 900, textAlign: 'center', fontFamily: FONT, fontWeight: 800,
            fontSize, lineHeight: 1.3, letterSpacing: '-1px', color: textColor,
            opacity: textP, transform: `translateY(${textY}px)`,
            wordBreak: 'keep-all',
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 130 * barP, height: 14, borderRadius: 7, background: accent,
          }}
        />
      </div>

      {showCharacter && charP > 0.001 ? (
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: W, height: '100%',
            opacity: charP, transform: `translateY(${charY}px)`,
          }}
        >
          <Actor size={700} centerX={CX} ground={1650} pose={pose} breathAmp={0.8} />
        </div>
      ) : null}

      {outP > 0 ? (
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
            background: bgBottom, opacity: outP * 0.85,
          }}
        />
      ) : null}
    </PlainBg>
  );
};

export default TitleCard;
