/** 냉장고 단면(내부 파이프+압축기+뒤쪽 코일) 위에 냉매 순환을 보여주는 다이어그램
 *  (냉장고는 어떻게 안을 차갑게 만드는가 - 사실은 "차갑게 만드는" 게 아니라 안의 열을
 *  밖으로 퍼내는 것이라는 반전이 핵심, general-ep68).
 *
 *  오케스트레이터 지시에 따라 냉장고를 사실적으로 그리지 않는다 - 큰 사각 상자 하나 안을
 *  세로 분할선으로 "안(선반+음식)"과 "뒤(방열판+압축기)" 두 영역으로만 나눈다. 냉매 파이프는
 *  굵은 선 하나로 안쪽(증발기, 왼쪽 위 지그재그) -> 뒤쪽 아래(압축기, 원) -> 뒤쪽 위(응축기,
 *  오른쪽 지그재그) -> 다시 안쪽으로 돌아오는 닫힌 루프 하나로 그린다(CounterCurrentDiagram과
 *  같은 원칙 - 파이프는 굵은 선 2~3줄로만 표현하고 사실적 배관도로 그리지 않는다).
 *
 *  CellMergeDiagram·HiccupDiagram·DoughDiagram과 같은 다단계 독립 progress 설계.
 *  각 progress는 "이전 단계가 이미 1인 상태"를 전제로 이어받는다(SaltCycleDiagram과 동일 순서 원칙).
 *
 *   - revealProgress  : 0~0.4 구간은 상자+선반+음식이 자라며 등장, 0.4~1 구간은 파이프
 *     루프 전체가 strokeDashoffset으로 순서대로 리빌된다. s2용.
 *   - expandProgress   : 0~1. 증발기(안쪽 파이프, 왼쪽 위 지그재그) 구간만 확 부풀어
 *     오르며(strokeWidth 증가) 파란 온도계 게이지가 급강하한다(반전의 시작 - "팽창하며
 *     온도가 뚝 떨어진다"). revealProgress=1 전제. s3용.
 *   - absorbProgress   : 0~1. 선반 쪽 실내 공기에서 짧은 주황 화살표 3개가 증발기 파이프
 *     쪽으로 빨려 들어간다("차가운 파이프가 실내 열을 빨아들인다"). expandProgress=1 전제. s4용.
 *   - compressProgress : 0~1. 파이프가 압축기(원 아이콘)를 지나며 살짝 눌리는 펄스 +
 *     빨간 온도계 게이지가 급상승한다. absorbProgress=1 전제. s5용.
 *   - releaseProgress  : 0~1. 응축기(뒤쪽 오른쪽 지그재그) 구간이 뜨거운 색으로 물들고,
 *     그 옆에서 열 물결(반원 아치 3겹)이 바깥으로 퍼져나간다 - "안에서 빨아들인 열을 뒤로
 *     내보낸다"는 반전의 완성. compressProgress=1 전제. s6용.
 *   - loopProgress     : 0~1. 파이프 루프 전체를 따라 작은 화살촉 마크들이 f 기반으로
 *     계속 흘러가며 "이 순환이 멈추지 않고 계속된다"를 보여준다(s7 요약 루프). 다른
 *     progress와 독립적으로 켤 수 있다.
 *
 *  전부 0이면 문이 닫힌 냉장고 상자만 있는 정지 다이어그램이 된다.
 *
 *  `f`(프레임)는 파이프 흐름 마크(loopProgress)와 열 물결·압축기 펄스의 은은한 맥동에만
 *  쓴다(Math.random 미사용, 원칙 3).
 *
 *  "안쪽에서 열을 흡수해 바깥으로 퍼내는" 열펌프 순환 구조를 갖는 다른 소재(에어컨, 히트펌프
 *  전반) 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React, { useId } from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const FRIDGE_VB_W = 720;
export const FRIDGE_VB_H = 820;

/** 뒤(방열판+압축기) 영역 바깥쪽 가장자리 앵커, 응축기 지그재그·온도계와 겹치지 않는 중간
 *  높이로 잡았다 - s7 "손을 대는 동작" 아이콘을 얹을 때 쓴다.
 *    scale = width / FRIDGE_VB_W
 *    screenX = diagramX + anchor.x * scale, screenY = diagramY + anchor.y * scale */
export const FRIDGE_BACK_PT = { x: 650, y: 380 };

const BOX_X = 40;
const BOX_Y = 30;
const BOX_W = 600;
const BOX_H = 750;
const BOX_RX = 30;

const DIVIDER_X = 400;
const INTERIOR_X = BOX_X + 20;
const CAVITY_X = DIVIDER_X;
const CAVITY_W = BOX_X + BOX_W - 20 - CAVITY_X;

const SHELF_XS: [number, number] = [90, 390];
const SHELF_YS = [280, 460];

const COMP_CX = 500;
const COMP_CY = 650;
const COMP_R = 55;

/** 파이프 루프 전체(닫힌 폴리라인) - 증발기(0~7) -> 세로 하강(8~9) -> 압축기 진입/이탈(10~13)
 *  -> 상승(14) -> 응축기(15~18) -> 상단 복귀(19~21, 21은 0과 같은 좌표로 루프가 닫힘) */
const PIPE_PTS: [number, number][] = [
  [110, 130], [150, 95], [190, 130], [230, 95], [270, 130], [310, 95], [350, 130], [390, 110],
  [420, 150], [420, 560],
  [460, 600],
  [495, 635], [545, 635],
  [580, 600], [580, 140],
  [622, 115], [580, 90], [620, 65], [582, 50],
  [582, 45], [110, 45], [110, 130],
];
/** 증발기 구간(안쪽 파이프) - expandProgress가 부풀리는 자리 */
const EVAP_SEG: [number, number][] = PIPE_PTS.slice(0, 8);
/** 응축기 구간(뒤쪽 방열 파이프) - releaseProgress가 뜨겁게 물들이는 자리 */
const COND_SEG: [number, number][] = PIPE_PTS.slice(14, 19);

const ptsToPath = (pts: [number, number][]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

/** 폴리라인 총 길이 및 t(0~1) 위치의 점 - loopProgress 흐름 마크용 */
const segLens = PIPE_PTS.slice(1).map((p, i) => {
  const a = PIPE_PTS[i];
  return Math.hypot(p[0] - a[0], p[1] - a[1]);
});
const totalLen = segLens.reduce((a, b) => a + b, 0);
function pointAtT(t: number): { x: number; y: number } {
  const target = clamp01(t) * totalLen;
  let acc = 0;
  for (let i = 0; i < segLens.length; i++) {
    const len = segLens[i];
    if (acc + len >= target || i === segLens.length - 1) {
      const a = PIPE_PTS[i];
      const b = PIPE_PTS[i + 1];
      const localT = len > 0.001 ? (target - acc) / len : 0;
      return { x: a[0] + (b[0] - a[0]) * localT, y: a[1] + (b[1] - a[1]) * localT };
    }
    acc += len;
  }
  return { x: PIPE_PTS[0][0], y: PIPE_PTS[0][1] };
}

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

/** 작은 온도계(스템+구근) - level 0(바닥, 비움)~1(꼭대기, 가득) */
const MiniThermo: React.FC<{
  cx: number; topY: number; height: number; level: number; color: string; stroke: string;
}> = ({ cx, topY, height, level, color, stroke }) => {
  const stemW = 26;
  const bulbR = 20;
  const bottomY = topY + height;
  const lv = clamp01(level);
  const fillH = height * lv;
  const fillTopY = bottomY - fillH;
  return (
    <g>
      <rect x={cx - stemW / 2} y={topY} width={stemW} height={height} rx={stemW / 2} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
      <circle cx={cx} cy={bottomY + bulbR * 0.5} r={bulbR} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
      {fillH > 0.5 ? (
        <rect x={cx - stemW / 2 + 5} y={fillTopY} width={stemW - 10} height={fillH} rx={(stemW - 10) / 2} fill={color} />
      ) : null}
      <circle cx={cx} cy={bottomY + bulbR * 0.5} r={bulbR - 7} fill={color} />
    </g>
  );
};

export interface FridgeCycleDiagramProps {
  /** 씬 로컬 프레임. 흐름 마크·압축기 펄스·열 물결 맥동에 쓴다 */
  f: number;
  width: number;
  x?: number;
  y?: number;
  revealProgress?: number;
  expandProgress?: number;
  absorbProgress?: number;
  compressProgress?: number;
  releaseProgress?: number;
  loopProgress?: number;
  stroke?: string;
  boxFill?: string;
  interiorColor?: string;
  cavityColor?: string;
  pipeColor?: string;
  coldColor?: string;
  hotColor?: string;
  style?: React.CSSProperties;
}

export const FridgeCycleDiagram: React.FC<FridgeCycleDiagramProps> = ({
  f, width, x = 0, y = 0,
  revealProgress = 0, expandProgress = 0, absorbProgress = 0, compressProgress = 0,
  releaseProgress = 0, loopProgress = 0,
  stroke = C.ink, boxFill = C.paper, interiorColor = C.room, cavityColor = C.roomDeep,
  pipeColor = C.inkSoft, coldColor = C.waterCool, hotColor = C.coral, style,
}) => {
  const uid = useId().replace(/[:]/g, '');
  const clipId = `fridge-pipe-clip-${uid}`;

  const reveal = clamp01(revealProgress);
  const expand = clamp01(expandProgress);
  const absorb = clamp01(absorbProgress);
  const compress = clamp01(compressProgress);
  const release = clamp01(releaseProgress);
  const loop = clamp01(loopProgress);

  const height = (width * FRIDGE_VB_H) / FRIDGE_VB_W;

  const boxGrow = smooth(clamp01(reveal / 0.4));
  const pipeReveal = clamp01((reveal - 0.4) / 0.6);
  const dashLen = totalLen + 20;

  const evapPath = ptsToPath(EVAP_SEG);
  const condPath = ptsToPath(COND_SEG);
  const evapSW = SW_THIN + 20 * smooth(expand);
  const condSW = SW_THIN + 6 * smooth(release);

  const compPulse = compress > 0.01 ? 1 - 0.07 * Math.abs(Math.sin(f / 5)) * compress : 1;

  const absorbArrows = [
    { sx: 210, sy: 340, tx: 195, ty: 150 },
    { sx: 280, sy: 430, tx: 270, ty: 150 },
    { sx: 350, sy: 340, tx: 345, ty: 150 },
  ];

  const flowMarks = loop > 0.02 ? Array.from({ length: 8 }, (_, i) => {
    const t = ((i / 8 + f * 0.0028) % 1 + 1) % 1;
    return { ...pointAtT(t), key: i };
  }) : [];

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${FRIDGE_VB_W} ${FRIDGE_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={BOX_X - 6} y={BOX_Y - 6} width={BOX_W + 12} height={BOX_H * boxGrow + 12} />
          </clipPath>
        </defs>

        {boxGrow > 0.02 ? (
          <g clipPath={`url(#${clipId})`} opacity={boxGrow}>
            {/* 뒤(방열판+압축기) 영역 - 진한 톤으로 안과 구분 */}
            <rect x={CAVITY_X} y={BOX_Y} width={CAVITY_W} height={BOX_H} fill={cavityColor} />
            {/* 안(선반+음식) 영역 */}
            <rect x={BOX_X} y={BOX_Y} width={DIVIDER_X - BOX_X} height={BOX_H} fill={interiorColor} />
            {/* 선반 */}
            {SHELF_YS.map((sy, i) => (
              <line key={i} x1={SHELF_XS[0]} y1={sy} x2={SHELF_XS[1]} y2={sy} stroke={stroke} strokeWidth={SW_THIN * 0.6} strokeLinecap="round" opacity={0.55} />
            ))}
            {/* 음식 - 최소 개수(사과 하나, 통 하나)만 */}
            <circle cx={150} cy={252} r={26} fill={C.coral} stroke={stroke} strokeWidth={SW_THIN * 0.5} />
            <rect x={272} y={412} width={72} height={44} rx={10} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.5} />
            {/* 안/뒤 구분 경계선 */}
            <line x1={DIVIDER_X} y1={BOX_Y} x2={DIVIDER_X} y2={BOX_Y + BOX_H} stroke={stroke} strokeWidth={SW_THIN * 0.5} strokeDasharray="14 12" opacity={0.6} />
            {/* 상자 외곽 */}
            <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={BOX_RX} fill="none" stroke={stroke} strokeWidth={SW} />
          </g>
        ) : null}

        {pipeReveal > 0.01 ? (
          <>
            {/* 기본 파이프 루프 (리빌 애니메이션) */}
            <path
              d={ptsToPath(PIPE_PTS)} fill="none" stroke={pipeColor} strokeWidth={SW_THIN}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={dashLen} strokeDashoffset={dashLen * (1 - pipeReveal)}
            />

            {/* 압축기 아이콘 */}
            <g transform={`translate(${COMP_CX} ${COMP_CY}) scale(${compPulse})`}>
              <circle cx={0} cy={0} r={COMP_R} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} opacity={0.35 + 0.65 * compress} />
              <path d={`M -18 0 L -4 -14 L -4 14 Z M 18 0 L 4 -14 L 4 14 Z`} fill={hotColor} opacity={0.3 + 0.7 * compress} />
            </g>

            {/* 증발기 구간 - 부풀며 파란색으로 물듦 */}
            {expand > 0.01 ? (
              <path d={evapPath} fill="none" stroke={coldColor} strokeWidth={evapSW} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            ) : null}

            {/* 응축기 구간 - 뜨거운 색으로 물듦 */}
            {release > 0.01 ? (
              <path d={condPath} fill="none" stroke={hotColor} strokeWidth={condSW} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            ) : null}

            {/* 열 흡수 화살표 - 실내 공기 -> 증발기 */}
            {absorb > 0.01 ? absorbArrows.map((a, i) => {
              const revealed = clamp01(absorb * 3 - i * 0.6);
              if (revealed <= 0.02) return null;
              const pulse = 0.7 + 0.3 * Math.sin(f / 7 + i * 1.6);
              const mx = a.sx + (a.tx - a.sx) * 0.5;
              const my = a.sy + (a.ty - a.sy) * 0.5;
              return (
                <g key={i} opacity={revealed * pulse}>
                  <path d={`M ${a.sx} ${a.sy} L ${a.tx} ${a.ty}`} stroke={hotColor} strokeWidth={9} strokeLinecap="round" />
                  <path
                    d={`M ${a.tx} ${a.ty} L ${a.tx - 14} ${a.ty + 16} M ${a.tx} ${a.ty} L ${a.tx + 16} ${a.ty + 10}`}
                    stroke={hotColor} strokeWidth={9} strokeLinecap="round"
                  />
                  <circle cx={mx} cy={my} r={5} fill={hotColor} opacity={0.6} />
                </g>
              );
            }) : null}

            {/* 열 방출 물결 - 응축기 오른쪽에서 바깥으로 3겹 아치 */}
            {release > 0.01 ? [0, 1, 2].map((i) => {
              const r = 42 + i * 34;
              const wobble = 0.6 + 0.4 * Math.sin(f / 10 - i * 1.1);
              const op = release * (0.55 - i * 0.13) * wobble;
              if (op <= 0.02) return null;
              const cx = 615;
              const cy = 95;
              return (
                <path
                  key={i}
                  d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`}
                  fill="none" stroke={hotColor} strokeWidth={9} strokeLinecap="round" opacity={op}
                />
              );
            }) : null}

            {/* 순환 흐름 마크 (s7 요약) */}
            {flowMarks.map((m) => (
              <circle key={m.key} cx={m.x} cy={m.y} r={9} fill={stroke} opacity={0.5 * loop} />
            ))}

            {/* 온도계 게이지 2개 - 증발기(파랑, 급강하) / 응축기 옆(빨강, 급상승) */}
            {expand > 0.01 ? (
              <g opacity={smooth(clamp01(expand * 1.4))}>
                <MiniThermo cx={22} topY={80} height={150} level={1 - smooth(expand)} color={coldColor} stroke={stroke} />
              </g>
            ) : null}
            {compress > 0.01 ? (
              <g opacity={smooth(clamp01(compress * 1.4))}>
                <MiniThermo cx={698} topY={80} height={150} level={smooth(compress)} color={hotColor} stroke={stroke} />
              </g>
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default FridgeCycleDiagram;
