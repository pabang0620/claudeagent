/** 사막 배경. 모래언덕 실루엣 하나를 낮/밤 두 조명으로 공유한다(general-ep74, "사막이
 *  낮엔 뜨겁고 밤엔 추운 이유").
 *
 *  기존 SavannaBg는 나무·풀이 있는 사바나 톤이라 모래언덕만 있는 건조한 사막과 다르고,
 *  NightSkyBg는 지평선 실루엣이 언덕형이라 낮 장면(태양·밝은 하늘)을 표현할 수 없어서
 *  새로 만들었다. `night` 로 낮/밤을 스위치하되, 두 모드가 "같은 장소의 다른 시간"으로
 *  보이도록 언덕 실루엣 경로(DUNE_NEAR_D/DUNE_FAR_D)는 낮·밤 공용으로 하나만 쓰고 색만
 *  바꾼다 - s1(좌우 스플릿으로 낮/밤 대비)에서 이 컴포넌트를 두 번(night=false/true) 겹쳐
 *  clip-path 로 반씩 잘라 쓰므로, 지형이 서로 다르면 이어붙였을 때 어색해진다.
 *
 *  오케스트레이터 지시: "사막 풍경은 단순한 실루엣(모래언덕)으로 충분하다" - 그래서 언덕
 *  실루엣 2겹(원경/근경) + 해 또는 별만 그리고, 선인장·바위 등 세부 소품은 넣지 않는다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, H, W } from '../theme';
import { ThemedIcon } from '../props/ThemedIcon';

const DUNE_Y = 1400;

const DUNE_FAR_D = `M -60 ${H} L -60 ${DUNE_Y - 10} Q 220 ${DUNE_Y - 110} 520 ${DUNE_Y - 50} `
  + `Q 800 ${DUNE_Y + 6} 1140 ${DUNE_Y - 86} L 1140 ${H} Z`;

const DUNE_NEAR_D = `M -60 ${H} L -60 ${DUNE_Y + 130} Q 270 ${DUNE_Y - 30} 540 ${DUNE_Y + 40} `
  + `Q 810 ${DUNE_Y + 108} 1140 ${DUNE_Y + 4} L 1140 ${H} Z`;

/** 이 화 로컬 색(테마 토큰에 모래·야간 모래 톤이 없어 여기서만 정의, 등록하지 않음 -
 *  ep72 의 MYLAR_COLOR 와 같은 원칙) */
const SAND_NEAR = C.browningSoft; // '#E8C9A0'
const SAND_FAR = '#F3E4C8';
const SAND_NEAR_NIGHT = '#3E4257';
const SAND_FAR_NIGHT = '#2E3245';

const NIGHT_STARS: { x: number; y: number; r: number }[] = [
  { x: 140, y: 260, r: 3.2 }, { x: 320, y: 180, r: 2.4 }, { x: 520, y: 300, r: 3.6 },
  { x: 700, y: 160, r: 2.6 }, { x: 860, y: 260, r: 3.2 }, { x: 960, y: 420, r: 2.2 },
  { x: 220, y: 460, r: 2.4 }, { x: 620, y: 500, r: 2.8 }, { x: 420, y: 120, r: 2.2 },
  { x: 940, y: 140, r: 2.6 },
];

export interface DesertBgProps {
  /** true = 밤(어두운 하늘 + 별), false = 낮(밝은 하늘 + 해). 기본 false */
  night?: boolean;
  skyTop?: string;
  skyBottom?: string;
  duneNearColor?: string;
  duneFarColor?: string;
  /** 낮에 해를 표시할지. 기본 true */
  sun?: boolean;
  /** 밤에 별을 표시할지. 기본 true */
  stars?: boolean;
  /** 별 반짝임용 프레임(옵션, 없으면 정지) */
  frame?: number;
  /** 오아시스 물웅덩이 표시 0~1(옵션, 기본 0 - SavannaBg의 pond와 같은 메커니즘을 재사용,
   *  general-ep92 추가). 기본값이 0이라 기존 호출부(general-ep74)는 영향받지 않는다 */
  pond?: number;
  waterColor?: string;
}

export const DesertBg: React.FC<DesertBgProps> = ({
  night = false,
  skyTop, skyBottom,
  duneNearColor, duneFarColor,
  sun = true, stars = true, frame,
  pond = 0, waterColor = C.waterCool,
}) => {
  const top = skyTop ?? (night ? C.night : C.goldSoft);
  const bottom = skyBottom ?? (night ? C.nightMid : C.paper);
  const nearColor = duneNearColor ?? (night ? SAND_NEAR_NIGHT : SAND_NEAR);
  const farColor = duneFarColor ?? (night ? SAND_FAR_NIGHT : SAND_FAR);

  return (
    <AbsoluteFill style={{ background: bottom, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 68%)` }} />

      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {!night && sun ? (
          // s1(스플릿 훅샷)에서 이 배경 인스턴스는 왼쪽 절반(x: 0~540)만 clip-path로
          // 남기고 오른쪽은 잘려 나간다 - 해를 화면 중앙보다 오른쪽(예: x=760)에 두면
          // 잘려서 아예 안 보인다(스틸 선점검에서 실측된 결함). 왼쪽 절반 안에 확실히
          // 들어오는 x=300 부근에 둔다.
          <g transform="translate(226 306)">
            <circle cx={74} cy={74} r={150} fill={C.goldSoft} opacity={0.55} />
            <ThemedIcon name="sun" size={148} color={C.gold} strokePx={9} />
          </g>
        ) : null}

        {night && stars ? (
          <>
            {NIGHT_STARS.map((s, i) => {
              const tw = frame === undefined ? 1 : 0.55 + 0.45 * Math.sin(frame / 15 + i * 1.7);
              return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C.cream} opacity={0.4 + 0.5 * tw} />;
            })}
            {/* 오른쪽 절반(x: 540~1080) 안에 확실히 들어오도록 x=800, 그리고 s1의
                "밤" 라벨(y=220)과 겹치지 않게 y를 아래로 내렸다(스틸 선점검 발견) */}
            <g transform="translate(754 306)">
              <circle cx={46} cy={46} r={70} fill={C.cream} opacity={0.1} />
              <ThemedIcon name="moon" size={92} color={C.cream} strokePx={8} />
            </g>
          </>
        ) : null}

        <path d={DUNE_FAR_D} fill={farColor} />
        <path d={DUNE_NEAR_D} fill={nearColor} stroke={night ? C.nightMid : C.ink} strokeWidth={7} strokeLinejoin="round" />

        {/* 오아시스 물웅덩이 - SavannaBg pond와 동일 path·메커니즘(general-ep92 추가) */}
        {pond > 0 ? (
          <path
            d="M -20 1356 C 160 1330, 360 1376, 548 1350 C 736 1324, 920 1368, 1100 1344
               L 1100 1940 L -20 1940 Z"
            fill={waterColor} stroke={night ? C.nightMid : C.ink} strokeWidth={11}
            strokeLinejoin="round" opacity={pond}
          />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

export default DesertBg;
