/** "원래 분리돼 있던 두 요소가 벽이 갈라지며 만나 반응한다" 는 구조를 보여주는 범용 다이어그램.
 *
 *  general-ep04(사과 갈변)를 위해 만들었지만 내용과 무관하게 결합-반응 구조를 설명하는
 *  화학·생물 소재 전반(예: 효소 A + 기질 B가 격리돼 있다가 막이 터지며 만난다는 서사)에
 *  재사용할 수 있도록 라벨·색을 전부 props로 받는다.
 *
 *  4단계를 각각 독립된 0~1 progress prop 으로 노출한다 (HeadNerveDiagram 의 showNerve/signalT
 *  패턴과 동일 - 씬 쪽에서 progress() 로 원하는 프레임 구간에 자유롭게 매핑한다):
 *   1. wallProgress   - 두 칸을 가르는 벽이 중앙에서부터 갈라져 사라진다
 *   2. mergeProgress  - 두 원이 벽이 있던 중앙으로 이동해 겹친다
 *   3. catalystProgress - 위에서 촉매(예: 산소) 방울이 내려와 합류 지점 근처에 자리잡는다
 *   4. reactProgress  - 합쳐진 자리에서부터 반응색이 번져나간다
 *
 *  정지 상태(전부 0)만 넘기면 "두 원이 각자 칸에 분리된" 정적 다이어그램이 된다(이 화의 s3).
 */
import React from 'react';
import { C, FONT, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 라벨 폰트 크기 + 칸 폭(약 300) 안에 강제로 맞추는 헬퍼. 한국어 4자 라벨은 문제 없지만
 *  영어 두 단어 라벨은 자연 폭이 칸을 넘어 옆 라벨과 겹친다(2026-08-09 검수 발견) - 8자를
 *  넘으면 textLength 로 압축한다. */
const LABEL_FS = 30;
const LABEL_MAX_W = 260;
function labelFitProps(text: string) {
  return text.length > 7 ? { textLength: LABEL_MAX_W, lengthAdjust: 'spacingAndGlyphs' as const } : {};
}

export interface CellMergeDiagramProps {
  /** 화면상 한 변 크기(px). viewBox 는 정사각(0 0 800 800) */
  width: number;
  x?: number;
  y?: number;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  /** 0~1. 칸을 가르는 벽이 중앙부터 갈라져 사라지는 진행도. 기본 0(벽이 그대로 있음) */
  wallProgress?: number;
  /** 0~1. 두 원이 중앙으로 이동해 겹치는 진행도. 기본 0(제자리) */
  mergeProgress?: number;
  /** 0~1. 촉매 방울(예: O2)이 내려와 자리잡는 진행도. 기본 0(안 보임) */
  catalystProgress?: number;
  catalystLabel?: string;
  catalystColor?: string;
  /** 0~1. 합쳐진 자리에서 반응색이 번지는 진행도. 기본 0(반응 전) */
  reactProgress?: number;
  reactColor?: string;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const CellMergeDiagram: React.FC<CellMergeDiagramProps> = ({
  width, x = 0, y = 0,
  leftLabel, rightLabel, leftColor = C.coral, rightColor = C.gold,
  wallProgress = 0, mergeProgress = 0,
  catalystProgress = 0, catalystLabel = 'O₂', catalystColor = C.sky,
  reactProgress = 0, reactColor = C.browning,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const wallP = clamp01(wallProgress);
  const mergeP = clamp01(mergeProgress);
  const catP = clamp01(catalystProgress);
  const reactP = clamp01(reactProgress);

  const BOX = { x: 90, y: 260, w: 620, h: 320 };
  const midX = BOX.x + BOX.w / 2; // 400
  const rowY = BOX.y + BOX.h / 2; // 420
  const leftHome = midX - 160;
  const rightHome = midX + 160;
  const leftCx = leftHome + (midX - 40 - leftHome) * mergeP;
  const rightCx = rightHome + (midX + 40 - rightHome) * mergeP;
  const R = 70;

  // 벽: 중앙(rowY)에서부터 위/아래로 갈라져 사라진다
  const wallTopY2 = rowY - 140 * wallP; // 위쪽 조각의 아래 끝
  const wallBottomY1 = rowY + 140 * wallP; // 아래쪽 조각의 위 끝

  // 자르는 순간 잠깐 번쩍이는 대각선 슬래시 (wallProgress 초반부에서만)
  const slashOpacity = wallP > 0.001 && wallP < 0.3 ? Math.sin(Math.min(1, wallP / 0.3) * Math.PI) : 0;

  const catY = 140 + (BOX.y - 40 - 140) * catP;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <svg viewBox="0 0 800 800" width={width} height={width} style={{ overflow: 'visible' }}>
        {/* 칸 경계 상자 */}
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={44} fill={fill} stroke={stroke} strokeWidth={SW} />

        {/* 가르는 벽 - 중앙에서부터 위/아래로 갈라져 사라진다 */}
        <line x1={midX} y1={BOX.y + 20} x2={midX} y2={wallTopY2} stroke={stroke} strokeWidth={SW} strokeLinecap="round" />
        <line x1={midX} y1={wallBottomY1} x2={midX} y2={BOX.y + BOX.h - 20} stroke={stroke} strokeWidth={SW} strokeLinecap="round" />

        {/* 절단 슬래시 */}
        {slashOpacity > 0.01 ? (
          <line
            x1={midX - 46} y1={rowY - 90} x2={midX + 46} y2={rowY + 90}
            stroke={C.coral} strokeWidth={12} strokeLinecap="round" opacity={slashOpacity}
          />
        ) : null}

        {/* 반응색 번짐 - 합쳐진 자리에서부터. 라벨·상자 테두리를 통째로 덮지 않도록 반경 상한을
         *  둔다(두 원 반경 R=70보다 조금 더 넓은 정도로만 - "합쳐진 자리 부근"이라는 뜻이 읽혀야
         *  하지, 다이어그램 전체를 지우면 안 된다. 2026-08-09 검수에서 라벨을 통째로 삼키는
         *  결함을 발견해 150 -> 105 로 축소) */}
        {reactP > 0.001 ? (
          <circle cx={midX} cy={rowY} r={reactP * 105} fill={reactColor} opacity={reactP * 0.6} />
        ) : null}

        {/* 두 원 */}
        <circle cx={leftCx} cy={rowY} r={R} fill={leftColor} stroke={stroke} strokeWidth={SW} />
        <circle cx={rightCx} cy={rowY} r={R} fill={rightColor} stroke={stroke} strokeWidth={SW} />

        {/* 촉매 방울 (예: O2) */}
        {catP > 0.001 ? (
          <g opacity={catP}>
            <line x1={midX} y1={catY + 46} x2={midX} y2={rowY - R - 6} stroke={C.inkSoft} strokeWidth={6} strokeDasharray="10 10" opacity={0.6} />
            <circle cx={midX} cy={catY} r={46} fill={catalystColor} stroke={stroke} strokeWidth={SW * 0.8} />
            <text x={midX} y={catY + 15} textAnchor="middle" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, fill: stroke }}>
              {catalystLabel}
            </text>
          </g>
        ) : null}

        {/* 라벨. 한 칸 폭(~300) 안에 영어 두 단어 라벨("Browning enzyme" 등)도 들어가야 해서
         *  2026-08-09 검수에서 겹침이 발견돼 폰트를 줄이고(40->30), 8자를 넘는 라벨은
         *  textLength 로 칸 폭 안에 강제로 눌러 담는다(줄바꿈 대신 - 다이어그램이 작아
         *  두 줄을 놓을 세로 여유가 없다) */}
        <text
          x={leftHome} y={rowY + R + 54} textAnchor="middle"
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: LABEL_FS, fill: C.ink }}
          {...labelFitProps(leftLabel)}
        >
          {leftLabel}
        </text>
        <text
          x={rightHome} y={rowY + R + 54} textAnchor="middle"
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: LABEL_FS, fill: C.ink }}
          {...labelFitProps(rightLabel)}
        >
          {rightLabel}
        </text>
      </svg>
    </div>
  );
};

export default CellMergeDiagram;
