/** "혀에서 목구멍 뒤쪽을 타고 코 안쪽으로 냄새 분자가 이동한다"는 후비강 경로(retronasal
 *  pathway)를 보여주는 오버레이(코가 막히면 음식 맛이 안 느껴지는 이유, general-ep84).
 *  HeadNerveDiagram·CilantroDiagram(NoseGlowOverlay)·SneezeReflexDiagram과 같은 원칙 -
 *  새 얼굴을 그리지 않고 이미 승인된 BustActor 위에 오버레이만 얹는다(breathAmp=0으로
 *  숨쉬기 모션을 꺼 오버레이와 정렬을 유지). 좌표는 새로 지어내지 않고 기존 실측 앵커를
 *  그대로 재사용한다 - MOUTH_PT(HeadNerveDiagram이 이미 export), NOSE_PT(CilantroDiagram이
 *  이미 export, 눈·입 좌표 중점).
 *
 *  실제 해부학적 경로(입 뒤쪽 -> 물렁입천장 -> 코안)는 정면 얼굴 크롭에서 그릴 화면이 없어
 *  사실적으로 그리지 않는다(오케스트레이터 지시 - 해부도를 사실적으로 그리지 않는다). 대신
 *  입에서 왼쪽 뺨 쪽으로 크게 휘었다가 코로 올라오는 굵은 곡선 하나로 "안쪽 통로를 거쳐
 *  올라간다"는 인상만 준다(HeadNerveDiagram의 입->관자놀이->이마 곡선과 같은 스타일 언어 -
 *  얼굴 옆선을 따라 바깥으로 부풀리는 방식).
 *
 *  pathwayProgress(0~1): 이 경로가 드러나며 그 위를 냄새 분자(작은 점)가 입에서 코까지
 *  이동하는 진행도. blocked(0~1)와 무관하게 "얼마나 멀리 가려 했는지"를 나타낸다.
 *  blocked(0~1): 코 막힘으로 경로가 고정된 지점(BREAK_T, 코 쪽 진입부)에서 끊기는 정도.
 *  0이면 pathwayProgress가 그대로 코까지 닿고, 1에 가까워질수록 실제로 열려 있는 구간이
 *  BREAK_T까지로 줄어들며(cap) 그 지점에 X 표시가 자라난다. blocked가 0.05를 넘으면
 *  이동 중이던 신호점은 사라진다(신호가 더 못 가고 막혔다는 뜻이지, 뒤로 물러나는 것처럼
 *  보이면 안 되므로 - 점을 남겨서 되돌아가는 것처럼 보이는 것을 방지). 막힌 구간(BREAK_T
 *  이후)은 옅은 점선으로 "통로 자체는 있지만 막혔다"를 표시한다.
 *
 *  "두 지점을 잇는 경로가 특정 지점에서 조건부로 막힌다"는 구조를 갖는 다른 신체 소재
 *  전반(다른 통로가 막히는 소재 등) 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { BustActor } from '../character/Actor';
import { BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';
import { MOUTH_PT } from './HeadNerveDiagram';
import { NOSE_PT } from './CilantroDiagram';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Pt = { x: number; y: number };

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

// 경로 제어점: 입 -> 왼쪽 뺨 바깥으로 크게 휘었다가(아래로 한 번 처졌다 위로 올라오는 루프) ->
// 코. HeadNerveDiagram의 입->이마 곡선과 대칭되는 반대쪽(왼쪽)을 써서 같은 화면에 함께 써도
// 겹치지 않게 한다. x=430 은 머리 중심(626.5)에서 왼쪽으로 196.5 - 그 높이의 머리 반경
// (약 230~250) 안쪽이라 얼굴 실루엣을 벗어나지 않는다.
const PATH_C1: Pt = { x: 430, y: 585 };
const PATH_C2: Pt = { x: 430, y: 400 };

/** 코가 막혔을 때 경로가 끊기는 고정 지점. 처음엔 0.62(코 쪽 진입부 근처)로 잡았으나 그
 *  지점이 왼쪽 눈과 가까워 X 표시 배지(반경 34)가 눈 아래쪽과 겹치는 것을 스틸 프레임에서
 *  실측으로 확인했다(BUST_VIEWBOX 좌표 기준 거리 약 48px < 배지 반경+눈 반경). 대신 곡선이
 *  뺨 아래쪽 빈 공간을 지나는 지점(0.35, 입에서 -135px/+9px - 눈·입 어느 쪽과도 안 겹침)으로
 *  옮겼다. */
const BREAK_T = 0.35;

/** 코 막힘 표시(X)가 자리잡는 지점 - 새 좌표를 지어내지 않고 같은 베지어 공식으로 계산 */
export const SMELL_TASTE_BREAK_PT = cubicPoint(MOUTH_PT, PATH_C1, PATH_C2, NOSE_PT, BREAK_T);

export interface SmellTasteDiagramProps {
  /** 씬 로컬 프레임(선택). 이동 신호점의 은은한 맥동에만 쓴다 - 생략하면 고정 크기로 그려진다 */
  f?: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX가 정사각형이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 경로가 드러나며 냄새 분자가 입에서 코까지 이동하는 진행도. 생략하면 0(안 그림) */
  pathwayProgress?: number;
  /** 0~1. 코 막힘으로 경로가 BREAK_T 지점에서 끊기는 정도. 생략하면 0(안 막힘) */
  blocked?: number;
  /** 캐릭터 선 색 (기본 ink) */
  stroke?: string;
  /** 캐릭터 채움 색 (기본 paper) */
  fill?: string;
  style?: React.CSSProperties;
}

export const SmellTasteDiagram: React.FC<SmellTasteDiagramProps> = ({
  f, width, x = 0, y = 0, pathwayProgress = 0, blocked = 0,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const pathP = clamp01(pathwayProgress);
  const blockP = clamp01(blocked);
  // blockP=0 -> cap=1(코까지 전부 열림), blockP=1 -> cap=BREAK_T(그 지점에서만 열림)
  const cap = 1 - blockP * (1 - BREAK_T);
  const effP = Math.min(pathP, cap);

  const pulse = f === undefined ? 1 : 0.85 + 0.15 * Math.sin((f / 22) * Math.PI * 2);
  const showDot = blockP < 0.05 && effP > 0.01;
  const dotPos = showDot ? cubicPoint(MOUTH_PT, PATH_C1, PATH_C2, NOSE_PT, effP) : null;

  // X 표시는 막힘이 어느 정도 진행된 뒤(0.15)부터 페이드인해 0.65에서 완전히 자리잡는다
  const markOpacity = clamp01((blockP - 0.15) / 0.5);
  const markScale = 0.5 + 0.5 * markOpacity;

  const fullPathD = `M ${MOUTH_PT.x} ${MOUTH_PT.y} C ${PATH_C1.x} ${PATH_C1.y}, ${PATH_C2.x} ${PATH_C2.y}, ${NOSE_PT.x} ${NOSE_PT.y}`;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      {/* 캐릭터 얼굴 그대로. 오버레이와 어긋나지 않도록 숨쉬기 모션을 끈다 */}
      <BustActor size={width} left={0} top={0} pose={POSES.idle} breathAmp={0} color={stroke} fill={fill} />

      <svg
        viewBox={BUST_VIEWBOX}
        width={width}
        height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 막힌 구간의 옅은 점선 - "통로 자체는 있지만 막혔다"를 배경으로 깔아둔다.
            그 위에 열려 있는 만큼(effP)만 진한 선으로 덮어 그린다 */}
        {blockP > 0.02 ? (
          <path
            d={fullPathD} fill="none" stroke={C.inkSoft} strokeWidth={7} strokeLinecap="round"
            strokeDasharray="4 24" opacity={0.4 * blockP}
          />
        ) : null}

        {/* 열려 있는 구간(effP) - 냄새 분자가 실제로 지나간/지나갈 수 있는 통로 */}
        {effP > 0.005 ? (
          <path
            d={fullPathD} fill="none" stroke={C.gold} strokeWidth={10} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - effP}
          />
        ) : null}

        {dotPos ? (
          <circle cx={dotPos.x} cy={dotPos.y} r={15 * pulse} fill={C.coral} stroke={C.ink} strokeWidth={5} />
        ) : null}

        {/* 코 막힘 표시 (X) - 통로가 끊기는 지점에 자란다 */}
        {markOpacity > 0.01 ? (
          <g opacity={markOpacity} transform={`translate(${SMELL_TASTE_BREAK_PT.x} ${SMELL_TASTE_BREAK_PT.y}) scale(${markScale})`}>
            <circle r={34} fill={C.paper} stroke={C.ink} strokeWidth={6} />
            <g transform="translate(-22 -22)">
              <ThemedIcon name="x" size={44} color={C.coral} strokePx={10} />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default SmellTasteDiagram;
