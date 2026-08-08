/** "입천장과 이마가 신경을 공유한다" 류의 설명에 재사용하는 오버레이 컴포넌트
 *  (1화 s3~s5: 냉기·혈관 펄스 -> 신경선 -> 신호 오작동).
 *
 *  v3 접근 (2026-08-08, 3차 재설계): 새 얼굴을 그리지 않는다.
 *  이전 두 번의 시도(정면 실루엣 새로 그리기, 옆모습 실루엣 새로 그리기)는 전부
 *  "징그럽다"/"뇌처럼 보인다"는 평가를 받았다. 원인은 얼굴 해부학적 형태(이마·코·입·턱
 *  윤곽)를 좌표로 직접 지어내려 한 것 자체였다. 그래서 이번에는 이미 승인된 실제 캐릭터
 *  얼굴(`BustActor`)을 그대로 재사용하고, 그 위에 이마·입 하이라이트(원형 글로우)와 둘을
 *  잇는 곡선(신경선)만 오버레이로 얹는다. 새로 지어낸 얼굴 좌표는 이 파일에 하나도 없다.
 *
 *  정렬 원리: `BustActor` 는 `Character` 에 `viewBox={BUST_VIEWBOX}` 를 넘겨 캐릭터의
 *  머리 영역만 크롭해 그린다. 오버레이 <svg> 를 똑같이 `viewBox={BUST_VIEWBOX}` 로,
 *  BustActor 와 같은 크기(width)·같은 위치(left/top)에 겹치면 좌표 변환 계산 없이
 *  캐릭터 얼굴과 100% 정렬된다 (RIG 좌표를 그대로 cx/cy 에 쓰면 된다).
 *  이 겹침을 지키기 위해 이 오버레이 전용 BustActor 호출에는 `breathAmp={0}` 을 줘서
 *  숨쉬기 모션(translateY/scale)을 끈다 - 오버레이 <svg> 는 이 변형을 받지 않는 별도
 *  형제 엘리먼트라, 얼굴이 움직이는데 마커만 고정돼 있으면 프레임마다 미세하게 어긋난다.
 *
 *  신경선은 3차 베지어 한 가닥으로, SVG 의 `pathLength=1` 트릭으로 그려서 showNerve(0~1)
 *  진행도만큼 stroke-dashoffset 을 줄이면 그려지는 것처럼 보인다. signalT(0~1) 로 넘긴
 *  위치는 같은 베지어 제어점을 JS 로 다시 계산해 정확히 그 선 위에 찍는다(DOM measurement
 *  없이 같은 곡선식을 공유하는 방식이라 프레임 결정론이 깨지지 않는다).
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';

/** 입 하이라이트 반경(px, RIG 좌표계). BLUSH.dx(167.5)보다 확실히 작게 잡아
 *  양쪽 볼터치를 집어삼키지 않게 한다 */
const MOUTH_GLOW_R = 76;
/** 이마 하이라이트 반경(px, RIG 좌표계). 안테나 밑동(y~236)과 눈 윗변(y~398) 사이
 *  좁은 이마 피부 영역 안에 들어가야 한다 */
const FOREHEAD_GLOW_R = 68;
/** 하이라이트 펄스 주기 (프레임, 30fps 기준 약 2.7초) */
const PULSE_PERIOD_FRAMES = 80;
/** 하이라이트 안에 얹는 아이콘 한 변 크기 */
const ICON_SIZE = 92;

/** 입 하이라이트 지점: 캐릭터 실제 입 위치(RIG.MOUTH) 그대로 쓴다 - 새로 지어내지 않는다 */
export const MOUTH_PT = { x: RIG.MOUTH.cx, y: RIG.MOUTH.y };
/** 이마 하이라이트 지점: 안테나(머리카락) 밑동과 눈 사이, 이마 피부 중앙 */
export const FOREHEAD_PT = { x: RIG.HEAD_CX, y: 317 };

/** 신경선 제어점: 입 -> 오른쪽 볼/관자놀이(바깥으로 휨) -> 이마.
 *  머리 중심(626.5,452)에서 오른쪽으로 바깥으로 부풀어 얼굴 옆선을 따라가는 곡선이 되도록
 *  잡았다(직선 아님). 머리 반경(~255)보다 안쪽이라 얼굴 윤곽을 벗어나지 않는다 */
const NERVE_C1 = { x: 880, y: 478 };
const NERVE_C2 = { x: 850, y: 356 };

function cubicPoint(
  p0: { x: number; y: number }, p1: { x: number; y: number },
  p2: { x: number; y: number }, p3: { x: number; y: number }, t: number
) {
  const u = 1 - t;
  const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
  const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface HeadNerveDiagramProps {
  /** 씬 로컬 프레임 (SceneSwitcher 가 자동으로 넘긴다). 펄스·신호 애니메이션에 쓴다 */
  f: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX 가 정사각형이라 폭=높이다 */
  width: number;
  x?: number;
  y?: number;
  /** 입천장 냉기 표시 + 혈관 좁아졌다 넓어지는 펄스 */
  highlightMouth?: boolean;
  /** 이마 통증 표시 */
  highlightForehead?: boolean;
  /** 신경선 그려지는 진행도 0~1. 생략하면 신경선을 그리지 않는다 */
  showNerve?: number;
  /** 신경선 위를 이동하는 신호 위치 0~1. 생략하면 표시하지 않는다 */
  signalT?: number;
  /** 캐릭터 선 색 (기본 ink) - BustActor 의 color 로 그대로 전달 */
  stroke?: string;
  /** 캐릭터 채움 색 (기본 paper) - BustActor 의 fill 로 그대로 전달 */
  fill?: string;
  style?: React.CSSProperties;
}

export const HeadNerveDiagram: React.FC<HeadNerveDiagramProps> = ({
  f, width, x = 0, y = 0, highlightMouth, highlightForehead, showNerve, signalT,
  stroke = C.ink, fill = C.paper, style,
}) => {
  // 혈관 펄스: 좁아졌다 넓어지는 리듬
  const pulse = 0.5 + 0.5 * Math.sin((f / PULSE_PERIOD_FRAMES) * Math.PI * 2);
  const mouthR = MOUTH_GLOW_R + 10 * pulse;
  const mouthOpacity = 0.55 + 0.25 * pulse;
  const foreheadR = FOREHEAD_GLOW_R + 8 * pulse;

  const nerveP = clamp01(showNerve ?? 0);
  const sigP = signalT === undefined ? null : clamp01(signalT);
  const sigPos = sigP !== null ? cubicPoint(MOUTH_PT, NERVE_C1, NERVE_C2, FOREHEAD_PT, sigP) : null;

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style,
      }}
    >
      {/* 캐릭터 얼굴 그대로. 오버레이와 어긋나지 않도록 숨쉬기 모션을 끈다 */}
      <BustActor size={width} left={0} top={0} pose={POSES.idle} breathAmp={0} color={stroke} fill={fill} />

      {/* BustActor 와 같은 viewBox 를 써서 좌표 변환 없이 얼굴 위에 정확히 겹친다 */}
      <svg
        viewBox={BUST_VIEWBOX}
        width={width}
        height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 입천장 냉기 + 혈관 펄스 */}
        {highlightMouth ? (
          <g>
            <circle cx={MOUTH_PT.x} cy={MOUTH_PT.y} r={mouthR + 22} fill={C.seaTop} opacity={mouthOpacity * 0.55} />
            <circle cx={MOUTH_PT.x} cy={MOUTH_PT.y} r={mouthR} fill="none" stroke={C.seaDeep} strokeWidth={9} opacity={mouthOpacity} />
            <g transform={`translate(${MOUTH_PT.x - ICON_SIZE / 2} ${MOUTH_PT.y - ICON_SIZE / 2})`}>
              <ThemedIcon name="snowflake" size={ICON_SIZE} color={C.seaDeep} strokePx={11} />
            </g>
          </g>
        ) : null}

        {/* 신경선 (입 -> 볼/관자놀이 -> 이마, 오른쪽으로 바깥으로 휘는 곡선) */}
        {showNerve !== undefined ? (
          <path
            d={`M ${MOUTH_PT.x} ${MOUTH_PT.y} C ${NERVE_C1.x} ${NERVE_C1.y}, ${NERVE_C2.x} ${NERVE_C2.y}, ${FOREHEAD_PT.x} ${FOREHEAD_PT.y}`}
            fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - nerveP}
          />
        ) : null}

        {/* 이동하는 신호 */}
        {sigPos ? (
          <circle cx={sigPos.x} cy={sigPos.y} r={16} fill={C.coral} stroke={C.ink} strokeWidth={5} />
        ) : null}

        {/* 이마 통증 표시 */}
        {highlightForehead ? (
          <g>
            <circle cx={FOREHEAD_PT.x} cy={FOREHEAD_PT.y} r={foreheadR} fill={C.coralSoft} opacity={0.75} />
            <g transform={`translate(${FOREHEAD_PT.x - ICON_SIZE / 2} ${FOREHEAD_PT.y - ICON_SIZE / 2})`}>
              <ThemedIcon name="bolt" size={ICON_SIZE} color={C.coral} strokePx={11} />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default HeadNerveDiagram;
