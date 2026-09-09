/** "알코올이 간에서 분해되며 독성 중간 물질이 생기고, 그 물질을 없애는 효소가 약하면 몸에
 *  오래 남는다"는 2단 인과를 보여주는 범용 다이어그램(술 마시면 얼굴 빨개지는 이유).
 *  CellMergeDiagram·SaltCycleDiagram과 같은 원칙(이 순간의 상태만 그린다, 시간 곡선은
 *  호출 씬이 progress()로 만든다) - 상자·화살표·게이지 모두 큰 도형으로만 단순화했고
 *  분자 구조식은 그리지 않는다("신체 표현은 최소한으로" 원칙).
 *
 *  두 독립 진행도:
 *   1. convertProgress (0~1) - 왼쪽 "원료" 상자에서 화살표가 그려지며 오른쪽 "중간 물질"
 *      상자가 점점 또렷한 경고색으로 바뀐다(빈 점선 테두리 -> 채워진 경고 상자).
 *   2. breakdownProgress (0~1) - 오른쪽 상자 아래 게이지(효소가 물질을 치우는 정도)가
 *      채워진다. `enzymeWeak=true`면 게이지가 도달하는 최대치 자체를 낮게 잡아
 *      ("느리게/약하게" 채워지는 인상을 실제 도달치 차이로 보여준다) 상자의 경고색도
 *      더 오래 진하게 남는다.
 *
 *  "원료가 중간 산물로 바뀌고, 그 중간 산물을 치우는 처리 능력이 사람마다 다르다"는 구조를
 *  갖는 다른 대사·해독 소재 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, FONT, SW } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** hex 색 두 개를 t(0~1)로 보간한다. CSS color-mix() 대신 직접 계산해 렌더 엔진 호환성
 *  걱정 없이 결정적으로 동작한다. */
function lerpHex(hexA: string, hexB: string, t: number): string {
  const c = clamp01(t);
  const pa = parseInt(hexA.slice(1), 16);
  const pb = parseInt(hexB.slice(1), 16);
  const ar = (pa >> 16) & 255; const ag = (pa >> 8) & 255; const ab = pa & 255;
  const br = (pb >> 16) & 255; const bg = (pb >> 8) & 255; const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * c);
  const g = Math.round(ag + (bg - ag) * c);
  const b2 = Math.round(ab + (bb - ab) * c);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b2).toString(16).slice(1)}`;
}

export const ALCOHOL_VB_W = 820;
export const ALCOHOL_VB_H = 520;

const BOX_A = { x: 50, y: 170, w: 260, h: 190 };
const BOX_B = { x: 510, y: 170, w: 260, h: 190 };
const ARROW_Y = BOX_A.y + BOX_A.h / 2;
const ARROW_X0 = BOX_A.x + BOX_A.w + 12;
const ARROW_X1 = BOX_B.x - 12;

const GAUGE = { x: BOX_B.x, y: BOX_B.y + BOX_B.h + 40, w: BOX_B.w, h: 46 };

export interface AlcoholBreakdownDiagramProps {
  /** 화면상 폭(px). viewBox 는 화면 픽셀과 1:1(820x520) */
  width: number;
  x?: number;
  y?: number;
  /** 왼쪽 상자 아이콘 아래 라벨(예: "알코올") */
  sourceLabel?: string;
  /** 오른쪽 상자 라벨(예: "아세트알데하이드"). strings.ts에서 읽어 호출부가 넘긴다 */
  toxicLabel: string;
  /** 0~1. 화살표 리빌 + 오른쪽 상자가 경고색으로 채워지는 진행도. 기본 0 */
  convertProgress?: number;
  /** 0~1. 효소 게이지가 채워지는 진행도. 기본 0(게이지 안 그림) */
  breakdownProgress?: number;
  /** 효소가 약하게 타고난 경우 - 게이지 도달 상한을 낮추고 상자 경고색이 더 오래 남는다 */
  enzymeWeak?: boolean;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const AlcoholBreakdownDiagram: React.FC<AlcoholBreakdownDiagramProps> = ({
  width, x = 0, y = 0, sourceLabel, toxicLabel,
  convertProgress = 0, breakdownProgress = 0, enzymeWeak = false,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const convP = clamp01(convertProgress);
  const breakP = clamp01(breakdownProgress);

  // 게이지가 실제로 도달하는 상한 - 효소가 약하면 절반에도 못 미치게 잡아
  // "느리게/약하게 채워진다"는 인상을 프레임마다 다시 계산하지 않고 상한 차이로 표현한다.
  const gaugeTarget = enzymeWeak ? 0.32 : 0.92;
  const gaugeFill = breakP * gaugeTarget;

  // 오른쪽 상자 경고색 진하기 - 변환은 다 됐어도(convP=1) 효소가 약하면 게이지가 차올라도
  // 상자 색이 크게 옅어지지 않는다(물질이 몸에 오래 남는다는 서사).
  const boxBWarmth = convP * (1 - gaugeFill * (enzymeWeak ? 0.15 : 0.7));
  const boxBFill = boxBWarmth > 0.02 ? lerpHex(fill, C.coral, boxBWarmth) : fill;
  const boxBStroke = boxBWarmth > 0.4 ? C.coral : stroke;
  const boxBDash = convP < 0.15 ? '14 12' : undefined;

  const iconOpacityB = clamp01((convP - 0.35) / 0.5);
  const labelOpacityB = clamp01((convP - 0.55) / 0.4);

  const gaugeShown = breakdownProgress !== undefined && breakdownProgress > 0;

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width, height: (width * ALCOHOL_VB_H) / ALCOHOL_VB_W,
        overflow: 'visible', ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${ALCOHOL_VB_W} ${ALCOHOL_VB_H}`} width={width}
        height={(width * ALCOHOL_VB_H) / ALCOHOL_VB_W} style={{ overflow: 'visible' }}
      >
        {/* 왼쪽 상자: 원료 */}
        <rect
          x={BOX_A.x} y={BOX_A.y} width={BOX_A.w} height={BOX_A.h} rx={36}
          fill={fill} stroke={stroke} strokeWidth={SW}
        />
        <g transform={`translate(${BOX_A.x + BOX_A.w / 2 - 54} ${BOX_A.y + 26})`}>
          <ThemedIcon name="glass-full" size={108} color={stroke} strokePx={11} />
        </g>
        {sourceLabel ? (
          <text
            x={BOX_A.x + BOX_A.w / 2} y={BOX_A.y + BOX_A.h - 24} textAnchor="middle"
            style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, fill: stroke }}
          >
            {sourceLabel}
          </text>
        ) : null}

        {/* 화살표: pathLength 트릭으로 convP만큼 리빌 */}
        <path
          d={`M ${ARROW_X0} ${ARROW_Y} L ${ARROW_X1 - 26} ${ARROW_Y}`}
          fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - convP}
        />
        {convP > 0.85 ? (
          <path
            d={`M ${ARROW_X1 - 48} ${ARROW_Y - 26} L ${ARROW_X1 - 4} ${ARROW_Y} L ${ARROW_X1 - 48} ${ARROW_Y + 26}`}
            fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
            opacity={clamp01((convP - 0.85) / 0.15)}
          />
        ) : null}

        {/* 오른쪽 상자: 중간 독성 물질 - 처음엔 빈 점선, 변환될수록 경고색으로 채워짐 */}
        <rect
          x={BOX_B.x} y={BOX_B.y} width={BOX_B.w} height={BOX_B.h} rx={36}
          fill={boxBFill} stroke={boxBStroke} strokeWidth={SW} strokeDasharray={boxBDash}
        />
        {iconOpacityB > 0.01 ? (
          <g transform={`translate(${BOX_B.x + BOX_B.w / 2 - 46} ${BOX_B.y + 30})`} opacity={iconOpacityB}>
            <ThemedIcon name="alert-triangle" size={92} color={stroke} strokePx={11} />
          </g>
        ) : null}
        {labelOpacityB > 0.01 ? (
          <text
            x={BOX_B.x + BOX_B.w / 2} y={BOX_B.y + BOX_B.h - 22} textAnchor="middle"
            style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, fill: stroke }}
            opacity={labelOpacityB}
          >
            {toxicLabel}
          </text>
        ) : null}

        {/* 효소 게이지 - 오른쪽 상자 아래, 채워진 만큼만 없앤 것으로 표시 */}
        {gaugeShown ? (
          <g>
            <rect
              x={GAUGE.x} y={GAUGE.y} width={GAUGE.w} height={GAUGE.h} rx={GAUGE.h / 2}
              fill={fill} stroke={stroke} strokeWidth={SW * 0.7}
            />
            <rect
              x={GAUGE.x + 6} y={GAUGE.y + 6} width={Math.max(0, gaugeFill * (GAUGE.w - 12))}
              height={GAUGE.h - 12} rx={(GAUGE.h - 12) / 2} fill={C.gold}
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default AlcoholBreakdownDiagram;
