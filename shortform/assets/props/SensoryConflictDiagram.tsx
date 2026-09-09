/** "몸 안의 서로 다른 두 감각 신호가 어긋나서 충돌하고, 나중에 다시 맞아떨어진다" 류의
 *  설명에 쓰는 오버레이(차 멀미: 눈은 "정지"라고 보는데 귀 속 균형 기관은 "움직임"이라고
 *  보내는 신호가 뇌에서 충돌한다).
 *
 *  HeadNerveDiagram·VoicePathDiagram과 같은 원칙을 그대로 따른다: 새 얼굴을 그리지 않고,
 *  이미 승인된 BustActor 얼굴 위에 배지(원+아이콘)와 신호선만 오버레이로 얹는다. 정렬 방식도
 *  동일 - 오버레이 <svg>를 BustActor와 같은 viewBox(BUST_VIEWBOX)·크기·위치로 겹치고,
 *  breathAmp={0}으로 숨쉬기 모션을 꺼서 오버레이가 프레임마다 어긋나지 않게 한다.
 *
 *  눈 배지(실제 오른쪽 눈 근처)는 항상 가만히 고정돼 있고("정지"), 귀 배지(실제 귀 위치 -
 *  VoicePathDiagram이 실측해 둔 VOICE_EAR_PT와 같은 x)는 애니메이션 내내 아주 작은 진폭으로
 *  위아래로 흔들린다("움직임") - 텍스트 라벨 없이도 두 신호의 성격 차이가 바로 읽히게 하는
 *  장치다. 눈·귀 아이콘 옆에 "정지"/"움직임"을 뜻하는 보조 아이콘(minus / wave-sine)을
 *  작게 곁들인다.
 *
 *  conflictProgress(0~1) 하나로 "배지 팝인 -> 신호선이 뇌 쪽으로 그려짐 -> 충돌 스파크"까지
 *  이어지는 한 흐름을 표현한다(s3에서 0~0.55 정도까지, s4에서 나머지를 이어서 진행 - 원칙
 *  "다음 장면에서 이전 상태를 명시적으로 유지"에 따라 s4는 0에서 다시 시작하지 않고 s3가
 *  끝난 값에서 이어받는다). resolveProgress(0~1, conflictProgress=1 전제)는 창밖 먼 곳을
 *  보면 두 신호가 다시 맞아떨어지는 상태 - 충돌 스파크가 옅어지고, 귀 배지의 흔들림이
 *  잦아들고, 뇌 위치에 체크 배지가 뜬다. 두 신호선 색도 서로의 색으로 섞여 "같아졌다"를
 *  보여준다.
 *
 *  "서로 다른 두 신호가 충돌했다가 다시 맞아떨어지는" 구조를 갖는 다른 소재(감각 착각,
 *  균형감각 전반)에도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다
 *  (02-script-v1.md 자산 목록).
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';
import { blendPose } from '../anim';
import { RadialSpikes } from '../scenes/Effects';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** BUST_VIEWBOX 원점(236,132) / 한 변(780). 여기 등록된 좌표는 전부 이 원점을 뺀 "0 기준"
 *  값이라, 다른 오버레이 다이어그램(PaperEdgeDiagram 등)의 `LABEL_PT.x * scale` 관례와
 *  똑같이 `x + PT.x * (width/SENSORY_VB_W)` 식으로 화면 좌표를 구할 수 있다. */
const VB_ORIGIN_X = 236;
const VB_ORIGIN_Y = 132;
export const SENSORY_VB_W = 780;

/** 원본(BUST_VIEWBOX 좌표계) 배지 위치. 눈 배지는 실제 오른쪽 눈(RIG.EYE) 바로 위 이마
 *  피부 밴드(안테나 머리카락 아래 236 ~ 실제 눈 위 398.5 사이) 안에 놓아 안테나·실제 눈
 *  그림과 겹치지 않게 했다(v1 실측: y=300은 안테나(y172~236, x596~703)와 겹치는 결함이
 *  있었다 - v2에서 y=318로 내려 여백을 확보). 귀 배지는 VoicePathDiagram이 실측해 둔 귀
 *  위치(x=882, 머리 윤곽 theta=0)와 같은 x 위. 뇌 배지는 안테나보다 위(y<172) 빈 공간의
 *  앵커점(얼굴 형태를 지어내지 않고 "머리 위 빈 공간"이라 원칙 0-1 대상이 아니다 -
 *  HeadNerveDiagram의 FOREHEAD_PT처럼 실측 지점이 아니라 순수 배치용 좌표). */
const EYE_BADGE_RAW = { x: RIG.CX + RIG.EYE.dx - 28, y: 318 };
const EAR_BADGE_RAW = { x: 882, y: 350 };
const BRAIN_RAW = { x: RIG.HEAD_CX, y: 100 };

function shift(pt: { x: number; y: number }) {
  return { x: pt.x - VB_ORIGIN_X, y: pt.y - VB_ORIGIN_Y };
}

/** 씬(scenes.tsx)에서 라벨(`Label`)을 배치할 때 쓰는 화면 좌표계 기준 앵커.
 *  사용법: `x + EYE_BADGE_PT.x * (width / SENSORY_VB_W)` */
export const EYE_BADGE_PT = shift(EYE_BADGE_RAW);
export const EAR_BADGE_PT = shift(EAR_BADGE_RAW);
export const BRAIN_PT = shift(BRAIN_RAW);

const BADGE_SIZE = 108;
const ICON_SIZE = 56;
const MINI_ICON_SIZE = 34;

function lerpColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], t)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function Badge({
  cx, cy, pop, wobble, color, iconName, miniIconName,
}: {
  cx: number; cy: number; pop: number; wobble: number; color: string; iconName: string; miniIconName: string;
}) {
  if (pop <= 0.001) return null;
  const scale = 0.3 + 0.7 * clamp01(pop / 0.85);
  const opacity = clamp01(pop / 0.5);
  const y = cy + wobble;
  return (
    <g transform={`translate(${cx} ${y}) scale(${scale})`} opacity={opacity}>
      <circle r={BADGE_SIZE / 2} fill={C.paper} stroke={color} strokeWidth={9} />
      <g transform={`translate(${-ICON_SIZE / 2} ${-ICON_SIZE / 2})`}>
        <ThemedIcon name={iconName} size={ICON_SIZE} color={C.ink} strokePx={10} />
      </g>
      <g transform={`translate(${BADGE_SIZE / 2 - MINI_ICON_SIZE * 0.55} ${-BADGE_SIZE / 2 - MINI_ICON_SIZE * 0.15})`}>
        <circle
          cx={MINI_ICON_SIZE / 2} cy={MINI_ICON_SIZE / 2} r={MINI_ICON_SIZE / 2 + 4}
          fill={color}
        />
        <ThemedIcon name={miniIconName} size={MINI_ICON_SIZE} color={C.paper} strokePx={9} />
      </g>
    </g>
  );
}

export interface SensoryConflictDiagramProps {
  /** 씬 로컬 프레임. 귀 배지 흔들림·스파크 펄스에 쓴다 */
  f: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX가 정사각형이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** 눈·귀 배지 팝인 -> 신호선이 뇌로 그려짐 -> 충돌 스파크. 0~1, 생략하면 아무것도 안 그림 */
  conflictProgress?: number;
  /** 신호가 다시 맞아떨어지는 진행도. 0~1. conflictProgress=1 전제 */
  resolveProgress?: number;
  /** 표정이 편해지는 정도 0~1(눈·입만 살짝 바뀐다 - headTilt/lean은 그대로 둬서 배지 정렬이
   *  깨지지 않는다). 생략하면 기본 idle 표정 */
  moodT?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

/** eyeOpen/blush만 살짝 바꾸는 "편해진 표정" 튜닝값. headTilt/lean을 건드리지 않아야
 *  RIG 기준으로 고정한 배지 좌표(EYE_BADGE_RAW 등)가 실제 얼굴과 계속 정렬된다. */
const RELIEVED_TWEAK = { eyeOpen: 1.05, blush: 1.3 };

export const SensoryConflictDiagram: React.FC<SensoryConflictDiagramProps> = ({
  f, width, x = 0, y = 0, conflictProgress, resolveProgress, moodT,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const cP = clamp01(conflictProgress ?? 0);
  const rP = clamp01(resolveProgress ?? 0);
  const mT = clamp01(moodT ?? 0);
  const facePose = blendPose(POSES.idle, { ...POSES.idle, ...RELIEVED_TWEAK }, mT);
  const scale = width / SENSORY_VB_W;

  const badgePop = clamp01(cP / 0.35);
  const lineP = clamp01((cP - 0.3) / 0.45);
  const sparkRaise = clamp01((cP - 0.75) / 0.25);
  const sparkPulse = 0.75 + 0.25 * Math.sin(f / 9);
  const sparkP = sparkRaise * sparkPulse * (1 - rP * 0.85);

  // 귀 배지만 흔들린다("움직임") - resolveProgress가 오르면 잦아든다(맞아떨어짐)
  const wobbleAmp = 9 * (1 - rP);
  const earWobble = badgePop > 0.01 ? Math.sin(f / 7) * wobbleAmp : 0;

  const eyeColor = C.waterCool;
  const earColorBase = C.coral;
  const earColor = lerpColor(earColorBase, eyeColor, rP);

  const checkP = clamp01((rP - 0.15) / 0.7);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <BustActor size={width} left={0} top={0} pose={facePose} breathAmp={0} color={stroke} fill={fill} />

      <svg
        viewBox={BUST_VIEWBOX}
        width={width}
        height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 신호선: 각 배지 -> 뇌 배지. pathLength 트릭으로 lineP만큼 그려진다 */}
        {lineP > 0.001 ? (
          <>
            <path
              d={`M ${EYE_BADGE_RAW.x} ${EYE_BADGE_RAW.y} Q ${(EYE_BADGE_RAW.x + BRAIN_RAW.x) / 2 - 20} ${(EYE_BADGE_RAW.y + BRAIN_RAW.y) / 2}, ${BRAIN_RAW.x} ${BRAIN_RAW.y}`}
              fill="none" stroke={eyeColor} strokeWidth={11} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP}
            />
            <path
              d={`M ${EAR_BADGE_RAW.x} ${EAR_BADGE_RAW.y + earWobble} Q ${(EAR_BADGE_RAW.x + BRAIN_RAW.x) / 2 + 24} ${(EAR_BADGE_RAW.y + BRAIN_RAW.y) / 2}, ${BRAIN_RAW.x} ${BRAIN_RAW.y}`}
              fill="none" stroke={earColor} strokeWidth={11} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP}
            />
          </>
        ) : null}

        <Badge
          cx={EYE_BADGE_RAW.x} cy={EYE_BADGE_RAW.y} pop={badgePop} wobble={0}
          color={eyeColor} iconName="eye" miniIconName="minus"
        />
        <Badge
          cx={EAR_BADGE_RAW.x} cy={EAR_BADGE_RAW.y} pop={badgePop} wobble={earWobble}
          color={earColorBase} iconName="ear" miniIconName="wave-sine"
        />

        {/* 뇌 위치 - 충돌 스파크는 RadialSpikes(화면좌표)를 형제로 그려야 해서 svg 밖에 둔다.
            체크 배지는 여기서 함께 그린다 */}
        {checkP > 0.001 ? (
          <g transform={`translate(${BRAIN_RAW.x} ${BRAIN_RAW.y}) scale(${0.4 + 0.6 * clamp01(checkP / 0.7)})`} opacity={clamp01(checkP / 0.4)}>
            <circle r={BADGE_SIZE / 2 - 6} fill={C.leaf} stroke={C.ink} strokeWidth={9} />
            <g transform={`translate(${-ICON_SIZE / 2} ${-ICON_SIZE / 2})`}>
              <ThemedIcon name="check" size={ICON_SIZE} color={C.ink} strokePx={10} />
            </g>
          </g>
        ) : null}
      </svg>

      {/* 충돌 스파크 - svg viewBox 밖(형제 위치)에서 화면좌표로 그린다 */}
      {sparkP > 0.01 ? (
        <RadialSpikes
          cx={(BRAIN_RAW.x - VB_ORIGIN_X) * scale} cy={(BRAIN_RAW.y - VB_ORIGIN_Y) * scale}
          rx={BADGE_SIZE * 0.3 * scale} ry={BADGE_SIZE * 0.3 * scale} frame={f} progress={sparkP}
          count={9} length={40 * scale} width={9 * scale} color={C.coral}
        />
      ) : null}
    </div>
  );
};

export default SensoryConflictDiagram;
