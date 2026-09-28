/** 말(horse). general-ep103("말이 서서 잠을 자는 이유")에서 처음 필요해 만들었다.
 *  참고 이미지 없이 이 채널 공용 스타일(단색 잉크선 + 흰/옅은 채움, 플랫, 그림자 없음)로 처음부터
 *  그린 순수 도형이라 원칙 0-1(참고 이미지 벡터화)의 적용 대상이 아니다(`Giraffe.tsx`/`DogFull.tsx`
 *  와 동일 사유). 동물 편 전반에서 재사용 가능성이 높아 에피소드 로컬이 아니라 여기 등록한다.
 *
 *  `Horse`(서 있는 자세, viewBox 640x780, 바닥선 740) - eyesClosed(0~1)로 조는 표정(뜬 눈 <->
 *  감은 눈 곡선)을 블렌드한다. 다리·목·꼬리·갈기는 Giraffe/DogStanding과 같은 단순 도형
 *  조합(캡슐 다리 + 사다리꼴 목 + 타원 머리·주둥이)이고 리깅 없이 정적이다
 *  (feedback_perdungi_no_limb_rigging와 동일 원칙 - 팔다리를 코드로 움직이지 않는다).
 *
 *  `HorseLying`(작게 표시하는 누운 실루엣, viewBox 480x220) - s6 "잠깐은 누워야 해요"에서
 *  서 있는 말 옆에 작게 곁들이는 참고용 실루엣. 항상 눈을 감은 상태로만 그린다(자는 중이므로
 *  eyesClosed prop 없음).
 *
 *  신체 표현은 최소한으로 - 피부 위에 점·돌기 등 작은 요소를 반복해서 찍지 않는다(원칙,
 *  shortform-builder.md "신체 표현은 최소한으로" 절). 갈기는 목 위 짧은 곡선 3~4개로만
 *  표현하고(다리 사이 반복 무늬가 아니라 "선의 형태 변화"에 해당), 액센트는 spot 1색만 쓴다.
 */
import React from 'react';
import { C, SW } from '../theme';

export interface HorseProps {
  width: number;
  x?: number;
  y?: number;
  /** 0 = 눈 뜸, 1 = 완전히 감음(조는 표정) */
  eyesClosed?: number;
  /** 선 색 (기본 ink) */
  stroke?: string;
  /** 채움 (기본 paper) */
  fill?: string;
  /** 갈기·액센트 (기본 coral) */
  spot?: string;
  /** 단색 실루엣. 지정하면 위 3개를 모두 덮는다 */
  silhouette?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const HORSE_STANDING_VB_W = 640;
export const HORSE_STANDING_VB_H = 780;
/** 바닥선(발굽이 닿는 화면 y, viewBox 좌표) */
export const HORSE_STANDING_GROUND_VB = 740;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const Horse: React.FC<HorseProps> = ({
  width, x = 0, y = 0, eyesClosed = 0,
  stroke, fill, spot, silhouette, strokeWidth = SW, style,
}) => {
  const st = silhouette ?? stroke ?? C.ink;
  const bg = silhouette ?? fill ?? C.paper;
  const ac = silhouette ?? spot ?? C.coral;
  const ec = clamp01(eyesClosed);
  const height = (width * HORSE_STANDING_VB_H) / HORSE_STANDING_VB_W;
  /** 조는 정도가 커질수록 머리가 살짝 더 숙여진다 */
  const headDroop = 6 + 12 * ec;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${HORSE_STANDING_VB_W} ${HORSE_STANDING_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        {/* 다리 (앞다리 2 + 뒷다리 2, 얇고 곧게) */}
        <g stroke={st} strokeWidth={17} strokeLinecap="round">
          <line x1={232} y1={470} x2={222} y2={738} />
          <line x1={272} y1={476} x2={282} y2={738} />
          <line x1={430} y1={470} x2={418} y2={738} />
          <line x1={470} y1={476} x2={482} y2={738} />
        </g>

        {/* 꼬리 - 뒤쪽에서 아래로 길게 흘러내림 */}
        <path
          d="M 168 392 C 106 424, 86 522, 108 612 C 118 652, 142 670, 164 662"
          fill="none" stroke={st} strokeWidth={20} strokeLinecap="round"
        />

        {/* 몸통 */}
        <ellipse cx={350} cy={430} rx={190} ry={116} fill={bg} stroke={st} strokeWidth={strokeWidth} />

        {/* 목 - 몸통 앞쪽에서 위로 비스듬히 뻗는 사다리꼴 */}
        <path d="M 476 392 L 564 142 L 606 146 L 528 398 Z" fill={bg} stroke={st}
          strokeWidth={strokeWidth} strokeLinejoin="round" />

        {/* 갈기 - 목 뒤쪽 능선을 따라 짧은 곡선 3개 (반복 점무늬가 아니라 결 표현) */}
        <g stroke={ac} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M 500 372 C 512 358, 522 350, 536 344" />
          <path d="M 528 300 C 540 286, 550 278, 562 272" />
          <path d="M 556 228 C 566 214, 576 206, 588 200" />
        </g>

        {/* 머리 (목 끝에서 살짝 숙여짐) */}
        <g transform={`translate(586 144) rotate(${headDroop})`}>
          {/* 귀 */}
          <path d="M -20 -18 L -34 -78 L 6 -46 Z" fill={bg} stroke={st} strokeWidth={strokeWidth}
            strokeLinejoin="round" />
          {/* 정수리 갈기 술 */}
          <path d="M -10 -34 C -20 -50, -14 -62, -2 -70" fill="none" stroke={ac} strokeWidth={8}
            strokeLinecap="round" />
          {/* 두상 */}
          <ellipse cx={0} cy={20} rx={46} ry={42} fill={bg} stroke={st} strokeWidth={strokeWidth} />
          {/* 주둥이 */}
          <ellipse cx={95} cy={52} rx={62} ry={28} fill={bg} stroke={st} strokeWidth={strokeWidth} />
          {/* 콧구멍 */}
          <ellipse cx={150} cy={58} rx={10} ry={7} fill={st} />
          {/* 입 */}
          <path d="M 120 74 Q 140 82 158 74" fill="none" stroke={st} strokeWidth={6} strokeLinecap="round" />
          {/* 눈 - 뜬 눈 <-> 감은 눈 블렌드 */}
          <g opacity={1 - ec}>
            <circle cx={40} cy={6} r={13} fill={st} />
            <circle cx={35} cy={0} r={4} fill={C.paper} />
          </g>
          <path d="M 26 4 Q 40 14 54 4" fill="none" stroke={st} strokeWidth={6} strokeLinecap="round"
            opacity={ec} />
        </g>

        {/* 발굽 */}
        {[[222, 738], [282, 738], [418, 738], [482, 738]].map(([hx, hy]) => (
          <ellipse key={`${hx}-${hy}`} cx={hx} cy={hy} rx={15} ry={9} fill={st} />
        ))}
      </svg>
    </div>
  );
};

export const HORSE_LYING_VB_W = 480;
export const HORSE_LYING_VB_H = 220;

export interface HorseLyingProps {
  width: number;
  x?: number;
  y?: number;
  stroke?: string;
  fill?: string;
  spot?: string;
  silhouette?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** 누워서 자는 작은 실루엣. 눈은 항상 감은 상태로만 그린다. */
export const HorseLying: React.FC<HorseLyingProps> = ({
  width, x = 0, y = 0, stroke, fill, spot, silhouette, strokeWidth = SW, style,
}) => {
  const st = silhouette ?? stroke ?? C.ink;
  const bg = silhouette ?? fill ?? C.paper;
  const ac = silhouette ?? spot ?? C.coral;
  const height = (width * HORSE_LYING_VB_H) / HORSE_LYING_VB_W;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${HORSE_LYING_VB_W} ${HORSE_LYING_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        {/* 접힌 다리 (몸통 아래 살짝 보이는 짧은 곡선 2개) */}
        <g stroke={st} strokeWidth={13} strokeLinecap="round" fill="none">
          <path d="M 220 196 C 236 180, 246 168, 234 154" />
          <path d="M 300 198 C 316 182, 326 170, 314 156" />
        </g>

        {/* 꼬리 */}
        <path d="M 384 128 C 424 118, 444 138, 432 164" fill="none" stroke={st} strokeWidth={14}
          strokeLinecap="round" />

        {/* 몸통 - 옆으로 누운 큰 타원 */}
        <ellipse cx={230} cy={142} rx={172} ry={62} fill={bg} stroke={st} strokeWidth={strokeWidth} />

        {/* 갈기 술 (목~머리 사이) */}
        <path d="M 96 118 C 88 104, 90 92, 100 82" fill="none" stroke={ac} strokeWidth={8}
          strokeLinecap="round" />

        {/* 귀 */}
        <path d="M 58 132 L 40 100 L 76 116 Z" fill={bg} stroke={st} strokeWidth={strokeWidth}
          strokeLinejoin="round" />
        {/* 두상 */}
        <ellipse cx={70} cy={168} rx={40} ry={32} fill={bg} stroke={st} strokeWidth={strokeWidth} />
        {/* 주둥이 (바닥 쪽으로) */}
        <ellipse cx={22} cy={188} rx={34} ry={19} fill={bg} stroke={st} strokeWidth={strokeWidth} />
        {/* 감은 눈 */}
        <path d="M 56 158 Q 68 166 80 158" fill="none" stroke={st} strokeWidth={5} strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default Horse;
