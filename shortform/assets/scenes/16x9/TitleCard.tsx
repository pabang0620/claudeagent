/** 제목 카드 - 16:9(가로) 캔버스 버전. `assets/scenes/TitleCard.tsx`(세로 9:16)와 같은 톤
 *  (accent 점 -> 제목 -> 밑줄, fade_minimal - 스프링 오버슛·회전 팝인 없이 opacity + 아주 미세한
 *  이동만)을 그대로 따르되, 좌표는 1920x1080 캔버스에 맞게 새로 잡았다.
 *
 *  세로판은 텍스트 블록과 캐릭터가 화면 세로 전체에 걸쳐 쌓였지만, 가로 캔버스는 세로 여백이
 *  훨씬 좁으므로 텍스트 블록을 화면 상단부에 좁게 모으고 캐릭터를 그 아래 중앙에 작게 둔다
 *  (세로 스택 구조 자체는 유지 - 가로 폭이 넓다고 좌우로 텍스트+캐릭터를 나누면 "제목을
 *  가리키는" 포즈의 의미가 흐트러진다).
 *
 *  Intro/Outro 16x9 와 동일하게 이 컴포넌트도 자체 `<Sequence>` 안에 한 번만 놓이는 브랜드류
 *  구간이라 `useCurrentFrame()` 을 직접 쓴다(REGISTRY 규칙 5 예외, 세로판과 동일 선례).
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PlainBg } from '../../backgrounds/16x9/PlainBg';
import { Actor } from '../../character/Actor';
import { POINT_UP } from '../../character/poses';
import type { Pose } from '../../character/Character';
import { progress } from '../../anim';
import { C, FONT, W_LANDSCAPE } from '../../theme';

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

/** 1.8초(30fps 기준). 세로판과 동일 길이 - 브랜드 인상 통일 */
export const TITLE_CARD_FRAMES = 54;

// 텍스트 블록 (상단)
const TEXT_TOP = 270;
const TEXT_MAX_WIDTH = 1500;

// 캐릭터 (텍스트 블록 아래, 화면 중앙)
const CHAR_GROUND = 980;
const CHAR_SIZE = 380;

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

  // 등장: opacity + 위에서 아주 살짝 내려앉음 (세로판과 동일 - 14px 대)
  const textP = progress(f, 0, 12);
  const textY = (1 - textP) * 18;

  // accent 점 -> 제목 -> 밑줄 순서로 살짝 시차를 둔다 (전부 opacity 기반, 스프링 팝인 없음)
  const dotP = progress(f, 0, 10);
  const barP = progress(f, 16, 30);

  // 캐릭터는 제목이 자리잡은 뒤 따라 들어온다
  const charP = progress(f, 10, 24);
  const charY = (1 - charP) * 22;

  // 퇴장: 마지막 10프레임 동안 paper 로 덮으며 다음 장면(SceneSwitcher 첫 씬)과 자연스럽게 이어진다
  const outP = progress(f, durationInFrames - 10, durationInFrames);

  const CX = W_LANDSCAPE / 2;

  return (
    <PlainBg top={bgTop} bottom={bgBottom} ground={null}>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: TEXT_TOP,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
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
            maxWidth: TEXT_MAX_WIDTH, textAlign: 'center', fontFamily: FONT, fontWeight: 800,
            fontSize, lineHeight: 1.3, letterSpacing: '-1px', color: textColor,
            opacity: textP, transform: `translateY(${textY}px)`,
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
            position: 'absolute', left: 0, top: 0, width: W_LANDSCAPE, height: '100%',
            opacity: charP, transform: `translateY(${charY}px)`,
          }}
        >
          <Actor size={CHAR_SIZE} centerX={CX} ground={CHAR_GROUND} pose={pose} breathAmp={0.8} />
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
