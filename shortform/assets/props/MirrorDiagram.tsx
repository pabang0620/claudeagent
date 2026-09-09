/** "거울이 실제로 뒤집는 방향은 좌우가 아니라 앞뒤다 + 좌우가 바뀐 것처럼 느껴지는 건
 *  거울 속 나와 마주 보려고 머릿속에서 몸을 세로로 돌려 상상하기 때문이다"라는 2단 사슬을
 *  보여주는 범용 다이어그램(general-ep48, "거울이 좌우만 바꾸는 것처럼 보이는 이유").
 *
 *  두 독립 모드:
 *   1. mode='plane' - 거울면을 옆(위)에서 본 그림. 왼쪽에 작은 캐릭터(관찰자), 오른쪽에
 *      거울면(수직선 + 뒷면 해칭)을 그리고, 그 사이를 화살표가 갔다가 그대로 되돌아오는
 *      왕복(arrowProgress 0~1)으로 "거울면에 수직인 방향만 반사되어 되돌아온다"를 보여준다.
 *      flipT(0~1)는 거울면 자체를 강조색으로 하이라이트해 "여기가 바뀌는 축"임을 표시한다.
 *      좌표축 세 개를 그리는 대신 화살표 하나의 왕복만 쓴다(오케스트레이터 지시).
 *   2. mode='rotate' - 세로축(정수리-발끝) 을 기준으로 캐릭터가 180도 "돌아서는" 상상을
 *      보여준다. 캐릭터를 새로 그리지 않고 이미 승인된 CharacterGroup을 그대로 쓰되,
 *      scaleX 만 cos(π·rotateT) 로 -1~1 사이를 움직이고 scaleY 는 고정해 "가로만 뒤집히고
 *      세로는 그대로"라는 사실 자체를 애니메이션 축으로 표현한다(회전하는 그룹 안에
 *      글자를 넣지 않는다 - 라벨은 별도 배지로 분리). 왼쪽/오른쪽 배지는 캐릭터 위로
 *      아치를 그리며 자리를 맞바꾸고(좌우가 바뀜), 위/아래 배지는 rotateT 와 무관하게
 *      완전히 고정된 자리에 머문다(위아래는 안 바뀜). axis=false 면 축선·배지를 모두
 *      생략하고 캐릭터 회전만 남겨 작은 생각풍선 안(미니 실루엣)에도 쓸 수 있다.
 *
 *  "거울/반사/관찰자 회전 상상"류 착시를 다루는 다른 소재에도 재사용 가능성이 있어
 *  에피소드 로컬이 아니라 여기 등록한다(02-script-v1.md 자산 목록).
 */
import React from 'react';
import { C, FONT, SW } from '../theme';
import { CharacterGroup } from '../character/Character';
import { POSES } from '../character/poses';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/* ================================================================
 * mode='plane'
 * ================================================================ */

export const MIRROR_PLANE_VB_W = 900;
export const MIRROR_PLANE_VB_H = 560;

const PLANE_FIGURE_CX = 170;
const PLANE_FIGURE_CY = 280;
const PLANE_FIGURE_W = 220;

const PLANE_START_X = 250;
const PLANE_MIRROR_X = 620;
const PLANE_GAP = 22;
const PLANE_OUT_Y = 254;
const PLANE_BACK_Y = 326;

function Arrowhead({ x, y, dir, color }: { x: number; y: number; dir: 1 | -1; color: string }) {
  const s = 22;
  return (
    <path
      d={`M ${x - dir * s} ${y - s * 0.78} L ${x} ${y} L ${x - dir * s} ${y + s * 0.78}`}
      fill="none" stroke={color} strokeWidth={SW * 0.85} strokeLinecap="round" strokeLinejoin="round"
    />
  );
}

function PlaneDiagram({
  x, y, width, arrowProgress, flipT, stroke, fill, style,
}: {
  x: number; y: number; width: number; arrowProgress: number; flipT: number; stroke: string; fill: string;
  style?: React.CSSProperties;
}) {
  const height = width * (MIRROR_PLANE_VB_H / MIRROR_PLANE_VB_W);

  const tOut = clamp01(arrowProgress * 2);
  const tBack = clamp01((arrowProgress - 0.5) * 2);
  const outTipX = lerp(PLANE_START_X, PLANE_MIRROR_X - PLANE_GAP, tOut);
  const backTipX = lerp(PLANE_MIRROR_X - PLANE_GAP, PLANE_START_X + PLANE_GAP, tBack);
  const contactP = 1 - Math.min(1, Math.abs(arrowProgress - 0.5) / 0.14);

  const mirrorColor = flipT > 0.02 ? C.gold : stroke;
  const mirrorSW = SW * (1 + flipT * 0.5);

  const figScale = PLANE_FIGURE_W / 954;
  const figTx = PLANE_FIGURE_CX - 627 * figScale;
  const figTy = PLANE_FIGURE_CY - 617 * figScale;

  const hatches: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    const hy = 96 + i * 44;
    hatches.push(
      <line
        key={i} x1={PLANE_MIRROR_X + 12} y1={hy} x2={PLANE_MIRROR_X + 42} y2={hy + 32}
        stroke={stroke} strokeWidth={SW * 0.55} strokeLinecap="round" opacity={0.55}
      />,
    );
  }

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${MIRROR_PLANE_VB_W} ${MIRROR_PLANE_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 바닥선 */}
        <line x1={40} y1={460} x2={860} y2={460} stroke={stroke} strokeWidth={SW * 0.5} opacity={0.35} />

        {/* 관찰자(작은 캐릭터) */}
        <g transform={`translate(${figTx} ${figTy}) scale(${figScale})`}>
          <CharacterGroup {...POSES.idle} color={stroke} fill={fill} />
        </g>

        {/* 거울면 - 강조되면 금색으로 */}
        <line
          x1={PLANE_MIRROR_X} y1={70} x2={PLANE_MIRROR_X} y2={478}
          stroke={mirrorColor} strokeWidth={mirrorSW} strokeLinecap="round"
        />
        {hatches}

        {/* 왕복 화살표 */}
        {tOut > 0.001 ? (
          <>
            <line x1={PLANE_START_X} y1={PLANE_OUT_Y} x2={outTipX} y2={PLANE_OUT_Y} stroke={stroke} strokeWidth={SW * 0.85} strokeLinecap="round" />
            {tOut > 0.85 ? <Arrowhead x={outTipX} y={PLANE_OUT_Y} dir={1} color={stroke} /> : null}
          </>
        ) : null}
        {arrowProgress > 0.5 ? (
          <>
            <line x1={PLANE_MIRROR_X - PLANE_GAP} y1={PLANE_BACK_Y} x2={backTipX} y2={PLANE_BACK_Y} stroke={C.coral} strokeWidth={SW * 0.85} strokeLinecap="round" />
            {tBack > 0.85 ? <Arrowhead x={backTipX} y={PLANE_BACK_Y} dir={-1} color={C.coral} /> : null}
          </>
        ) : null}

        {/* 접촉 순간 살짝 반짝 */}
        {contactP > 0.05 ? (
          <circle cx={PLANE_MIRROR_X} cy={(PLANE_OUT_Y + PLANE_BACK_Y) / 2} r={16 + contactP * 20} fill={C.gold} opacity={contactP * 0.55} />
        ) : null}
      </svg>
    </div>
  );
}

/* ================================================================
 * mode='rotate'
 * ================================================================ */

export const MIRROR_ROTATE_VB_W = 820;
export const MIRROR_ROTATE_VB_H = 960;

const ROT_CX = 410;
const ROT_CY = 475;
const ROT_CHAR_W = 420;
const ROT_AXIS_Y0 = 150;
const ROT_AXIS_Y1 = 800;
const ROT_BADGE_R = 64;
const ROT_LR_DX = 310;
const ROT_ARC_H = 250;
const ROT_ARC_H_INNER = 110;
const ROT_UP_Y = 90;
const ROT_DOWN_Y = 880;

function Badge({
  cx, cy, text, color,
}: { cx: number; cy: number; text: string; color: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={ROT_BADGE_R} fill={C.paper} stroke={color} strokeWidth={SW * 0.75} />
      <text
        x={0} y={0} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, fill: C.ink }}
      >
        {text}
      </text>
    </g>
  );
}

function RotateDiagram({
  x, y, width, rotateT, axis, leftLabel, rightLabel, upLabel, downLabel, stroke, fill, style,
}: {
  x: number; y: number; width: number; rotateT: number; axis: boolean;
  leftLabel?: string; rightLabel?: string; upLabel?: string; downLabel?: string;
  stroke: string; fill: string; style?: React.CSSProperties;
}) {
  const height = width * (MIRROR_ROTATE_VB_H / MIRROR_ROTATE_VB_W);
  const t = clamp01(rotateT);

  const charScale = ROT_CHAR_W / 954;
  // 가로만 cos(π·t) 로 -1~1 을 오가고(좌우가 뒤집힘), 세로 배율은 손대지 않는다(위아래는 그대로).
  // 순수 cos 는 t=0.5 부근에서 폭이 거의 0 이 돼 한동안 안 보이는 것처럼 보인다 - 부호는
  // 그대로 두고 크기만 제곱근으로 완만하게 키워서(sqrt(|cos|)) 순간적으로 사라지는 느낌을 줄인다.
  const rawCos = Math.cos(Math.PI * t);
  const spinX = Math.sign(rawCos || 1) * Math.sqrt(Math.abs(rawCos));

  const leftStartX = ROT_CX - ROT_LR_DX;
  const rightStartX = ROT_CX + ROT_LR_DX;
  // 왼쪽/오른쪽 배지가 서로 다른 높이의 아치를 타고 자리를 바꾼다(같은 높이면 t=0.5 에서
  // 정확히 같은 좌표에 겹친다 - s6 실측에서 실제로 발견된 결함, 두 아치 높이를 다르게 벌린다)
  const arcYOuter = ROT_CY - ROT_ARC_H * Math.sin(Math.PI * t);
  const arcYInner = ROT_CY - ROT_ARC_H_INNER * Math.sin(Math.PI * t);
  const leftNowX = lerp(leftStartX, rightStartX, t);
  const rightNowX = lerp(rightStartX, leftStartX, t);

  const guideDOuter = `M ${leftStartX} ${ROT_CY} Q ${ROT_CX} ${ROT_CY - ROT_ARC_H}, ${rightStartX} ${ROT_CY}`;
  const guideDInner = `M ${leftStartX} ${ROT_CY} Q ${ROT_CX} ${ROT_CY - ROT_ARC_H_INNER}, ${rightStartX} ${ROT_CY}`;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${MIRROR_ROTATE_VB_W} ${MIRROR_ROTATE_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {axis ? (
          <line
            x1={ROT_CX} y1={ROT_AXIS_Y0} x2={ROT_CX} y2={ROT_AXIS_Y1}
            stroke={stroke} strokeWidth={SW * 0.55} strokeDasharray="4 20" strokeLinecap="round" opacity={0.5}
          />
        ) : null}

        {axis && leftLabel ? (
          <path d={guideDOuter} fill="none" stroke={C.coral} strokeWidth={SW * 0.5} strokeDasharray="10 14" opacity={0.35} />
        ) : null}
        {axis && rightLabel ? (
          <path d={guideDInner} fill="none" stroke={C.waterCool} strokeWidth={SW * 0.5} strokeDasharray="10 14" opacity={0.35} />
        ) : null}

        {/* 캐릭터 - translate 로 중심에 놓고 scale(spinX*charScale, charScale) 로 가로만 뒤집는다 */}
        <g transform={`translate(${ROT_CX} ${ROT_CY}) scale(${spinX * charScale} ${charScale}) translate(${-627} ${-617})`}>
          <CharacterGroup {...POSES.idle} color={stroke} fill={fill} />
        </g>

        {axis && upLabel ? <Badge cx={ROT_CX} cy={ROT_UP_Y} text={upLabel} color={stroke} /> : null}
        {axis && downLabel ? <Badge cx={ROT_CX} cy={ROT_DOWN_Y} text={downLabel} color={stroke} /> : null}
        {axis && leftLabel ? <Badge cx={leftNowX} cy={arcYOuter} text={leftLabel} color={C.coral} /> : null}
        {axis && rightLabel ? <Badge cx={rightNowX} cy={arcYInner} text={rightLabel} color={C.waterCool} /> : null}
      </svg>
    </div>
  );
}

/* ================================================================
 * 공개 컴포넌트
 * ================================================================ */

export interface MirrorDiagramProps {
  mode: 'plane' | 'rotate';
  /** 화면상 폭(px) */
  width: number;
  x?: number;
  y?: number;
  /** plane 전용. 0~1, 화살표가 거울을 향했다가 그대로 돌아오는 왕복 진행도. 기본 0 */
  arrowProgress?: number;
  /** plane 전용. 0~1, 거울면을 강조색(금색)으로 하이라이트하는 정도. 기본 0 */
  flipT?: number;
  /** rotate 전용. 0~1, 세로축 기준 180도 "돌아서는" 상상 진행도. 기본 0 */
  rotateT?: number;
  /** rotate 전용. 축선·배지를 그릴지. false 면 캐릭터 회전만 남는다(생각풍선 안 미니용). 기본 true */
  axis?: boolean;
  /** rotate 전용, strings.ts에서 읽어 호출부가 넘긴다. 생략한 배지는 그리지 않는다 */
  leftLabel?: string;
  rightLabel?: string;
  upLabel?: string;
  downLabel?: string;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const MirrorDiagram: React.FC<MirrorDiagramProps> = ({
  mode, width, x = 0, y = 0, arrowProgress = 0, flipT = 0, rotateT = 0, axis = true,
  leftLabel, rightLabel, upLabel, downLabel, stroke = C.ink, fill = C.paper, style,
}) => {
  if (mode === 'plane') {
    return (
      <PlaneDiagram
        x={x} y={y} width={width} arrowProgress={clamp01(arrowProgress)} flipT={clamp01(flipT)}
        stroke={stroke} fill={fill} style={style}
      />
    );
  }
  return (
    <RotateDiagram
      x={x} y={y} width={width} rotateT={clamp01(rotateT)} axis={axis}
      leftLabel={leftLabel} rightLabel={rightLabel} upLabel={upLabel} downLabel={downLabel}
      stroke={stroke} fill={fill} style={style}
    />
  );
};

export default MirrorDiagram;
