/** 다리 단면 안에서 "나가는 혈관(동맥, 발로 향하는 따뜻한 피)"과 "들어오는 혈관(정맥, 몸통으로
 *  돌아오는 차가운 피)"이 나란히 붙어 지나가며 열을 주고받는 구조(역류 열교환)를 보여주는
 *  다이어그램(펭귄이 얼음 위에서도 발이 안 시린 이유). REGISTRY 4절 확인 완료 - LegNerveDiagram은
 *  신경 압박용이라 혈관·열 이동 구조와 무관해 새로 만든다.
 *
 *  HiccupDiagram/CellMergeDiagram과 같은 원칙("지금 이 순간의 상태"만 그리고, 시간에 따른
 *  변화는 호출 씬이 0~1 progress로 넘긴다). 혈관은 사실적으로 그리지 않고 굵은 파이프 2줄로만
 *  표현한다(오케스트레이터 지시) - 다리 실루엣도 단순한 세로 캡슐 하나뿐이다.
 *
 *  `revealProgress`(0~1) - 0~0.35 구간은 다리 실루엣만 자라며 나타나고(s2a "다리 실루엣으로
 *  줌인 시작"), 0.35~1 구간에서 두 파이프(동맥·정맥)가 위에서부터 리빌된다(s2b "동맥과 정맥이
 *  나란히 붙어 지나가는 다이어그램"). 두 구간을 하나의 진행도로 이어 s2a->s2b가 자연스러운
 *  연속 동작처럼 읽히게 했다.
 *
 *  `heatProgress`(0~1) - (1) 동맥은 위(따뜻)->아래(식음), 정맥은 아래(차가움)->위(데워짐)로
 *  옅은 색 오버레이 그라데이션이 진해진다(s4 "발까지 가는 피는 이미 식어 있다"의 근거를
 *  색으로 시각화) + (2) 파이프 경계를 가로지르는 짧은 열교환 화살표 5개가 아래에서부터
 *  순차로 나타나며 옅게 맥동한다(s3 "열을 옆에 붙은 차가운 피한테 바로 넘겨준다"). 색은
 *  런타임에 두 hex를 섞어 새 rgb() 문자열을 계산하지 않는다 - 고정 색 위에 `stop-opacity`
 *  만 progress로 바꾸는 방식이라 값 형식이 항상 숫자로 유지된다(49화 색 보간 버그 재발 방지).
 *
 *  `f`(프레임) - 두 파이프 안을 흐르는 방향 표시 마크(동맥은 아래로, 정맥은 위로) 애니메이션과
 *  열교환 화살표의 은은한 맥동에 쓴다. frame 기반 결정적 계산만 쓴다(Math.random 미사용, 원칙 3).
 */
import React, { useId } from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const COUNTERCURRENT_VB_W = 420;
export const COUNTERCURRENT_VB_H = 680;

/** 다리 실루엣(윗쪽=몸통 방향, 아래쪽=발 방향) 라벨을 이 다이어그램 밖에서 얹을 때 쓰는 앵커.
 *    scale = width / COUNTERCURRENT_VB_W
 *    screenX = diagramX + anchor.x * scale, screenY = diagramY + anchor.y * scale */
export const COUNTERCURRENT_TOP_PT = { x: 210, y: 14 };
export const COUNTERCURRENT_BOTTOM_PT = { x: 210, y: 666 };

const LEG_X = 40;
const LEG_Y = 30;
const LEG_W = 340;
const LEG_H = 620;
const LEG_RX = 70;

/** 정맥(왼쪽, 발->몸통) / 동맥(오른쪽, 몸통->발) - 서로 붙어 지나가도록 4px 간격만 둔다 */
const VEIN_X = 120;
const ARTERY_X = 212;
const PIPE_W = 88;
const PIPE_Y = 70;
const PIPE_H = 560;
const PIPE_RX = 44;

/** 열교환 화살표 y 위치 5곳 (파이프 구간 안, 위아래 여백을 둔 균등 분할) */
const HEAT_YS = [150, 260, 370, 480, 590];

export interface CounterCurrentDiagramProps {
  /** 씬 로컬 프레임. 흐름 마크·열교환 화살표 맥동에 쓴다 */
  f: number;
  /** 화면상 폭(px) */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0~0.35=다리 실루엣만 성장, 0.35~1=동맥·정맥 파이프가 위에서부터 리빌 */
  revealProgress?: number;
  /** 0~1. 온도 그라데이션 + 열교환 화살표 순차 등장 */
  heatProgress?: number;
  /** 파이프 안 흐름 방향 마크를 보여줄지 (revealProgress로 파이프가 보일 때만 실제로 그려짐) */
  showFlow?: boolean;
  stroke?: string;
  /** 다리 실루엣 채움색 */
  fill?: string;
  /** 동맥(따뜻) 기본색 */
  arteryColor?: string;
  /** 정맥(차가움) 기본색 */
  veinColor?: string;
  style?: React.CSSProperties;
}

export const CounterCurrentDiagram: React.FC<CounterCurrentDiagramProps> = ({
  f, width, x = 0, y = 0, revealProgress = 0, heatProgress = 0, showFlow = true,
  stroke = C.ink, fill = C.paper, arteryColor = C.coral, veinColor = C.waterCool, style,
}) => {
  const uid = useId().replace(/[:]/g, '');
  const legClipId = `ccd-leg-clip-${uid}`;
  const arteryClipId = `ccd-artery-clip-${uid}`;
  const veinClipId = `ccd-vein-clip-${uid}`;
  const arteryGradId = `ccd-artery-cool-grad-${uid}`;
  const veinGradId = `ccd-vein-warm-grad-${uid}`;

  const reveal = clamp01(revealProgress);
  const heat = clamp01(heatProgress);
  const height = (width * COUNTERCURRENT_VB_H) / COUNTERCURRENT_VB_W;

  // 다리 실루엣: 0~0.35 구간에서 세로로 자라며 등장(위쪽 고정, 아래쪽 경계가 자란다)
  const legGrow = clamp01(reveal / 0.35);
  const legVisibleH = LEG_H * legGrow;

  // 파이프: 0.35~1 구간에서 위에서부터 리빌(파이프 자체가 위->아래로 그려짐)
  const pipeReveal = clamp01((reveal - 0.35) / 0.65);
  const pipeVisibleH = PIPE_H * pipeReveal;

  const showPipes = pipeVisibleH > 0.5;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${COUNTERCURRENT_VB_W} ${COUNTERCURRENT_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        <defs>
          <clipPath id={legClipId}>
            <rect x={LEG_X - 10} y={LEG_Y} width={LEG_W + 20} height={legVisibleH} />
          </clipPath>
          <clipPath id={arteryClipId}>
            <rect x={ARTERY_X - 10} y={PIPE_Y} width={PIPE_W + 20} height={pipeVisibleH} />
          </clipPath>
          <clipPath id={veinClipId}>
            <rect x={VEIN_X - 10} y={PIPE_Y} width={PIPE_W + 20} height={pipeVisibleH} />
          </clipPath>
          {/* 동맥: 위(따뜻, 투명)->아래(식음, 정맥색 오버레이 진해짐) */}
          <linearGradient id={arteryGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={veinColor} stopOpacity={0} />
            <stop offset="1" stopColor={veinColor} stopOpacity={0.6 * heat} />
          </linearGradient>
          {/* 정맥: 아래(차가움, 투명)->위(데워짐, 동맥색 오버레이 진해짐) */}
          <linearGradient id={veinGradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={arteryColor} stopOpacity={0} />
            <stop offset="1" stopColor={arteryColor} stopOpacity={0.6 * heat} />
          </linearGradient>
        </defs>

        {/* 다리 실루엣 */}
        {legVisibleH > 0.5 ? (
          <g clipPath={`url(#${legClipId})`}>
            <rect x={LEG_X} y={LEG_Y} width={LEG_W} height={LEG_H} rx={LEG_RX} fill={fill} stroke={stroke} strokeWidth={SW} />
          </g>
        ) : null}

        {showPipes ? (
          <>
            {/* 정맥(왼쪽) - 기본 채움 */}
            <g clipPath={`url(#${veinClipId})`}>
              <rect x={VEIN_X} y={PIPE_Y} width={PIPE_W} height={PIPE_H} rx={PIPE_RX} fill={veinColor} stroke={stroke} strokeWidth={SW_THIN} />
              <rect x={VEIN_X} y={PIPE_Y} width={PIPE_W} height={PIPE_H} rx={PIPE_RX} fill={`url(#${veinGradId})`} />
            </g>
            {/* 동맥(오른쪽) - 기본 채움 */}
            <g clipPath={`url(#${arteryClipId})`}>
              <rect x={ARTERY_X} y={PIPE_Y} width={PIPE_W} height={PIPE_H} rx={PIPE_RX} fill={arteryColor} stroke={stroke} strokeWidth={SW_THIN} />
              <rect x={ARTERY_X} y={PIPE_Y} width={PIPE_W} height={PIPE_H} rx={PIPE_RX} fill={`url(#${arteryGradId})`} />
            </g>

            {/* 흐름 방향 마크 - 동맥은 아래로, 정맥은 위로. 프레임 기반으로 순환 이동한다 */}
            {showFlow ? [0, 1, 2].map((i) => {
              const spacing = PIPE_H / 3;
              const arteryPhase = ((f * 2.4 + i * spacing) % PIPE_H + PIPE_H) % PIPE_H;
              const veinPhase = PIPE_H - (((f * 2.4 + i * spacing) % PIPE_H + PIPE_H) % PIPE_H);
              const arteryY = PIPE_Y + arteryPhase;
              const veinY = PIPE_Y + veinPhase;
              const edgeFade = (py: number) => clamp01(Math.min(py - PIPE_Y, PIPE_Y + PIPE_H - py) / 40);
              if (arteryY > PIPE_Y + pipeVisibleH - 20) return null;
              return (
                <g key={i}>
                  <path
                    d={`M ${ARTERY_X + 20} ${arteryY} L ${ARTERY_X + PIPE_W - 20} ${arteryY} L ${ARTERY_X + PIPE_W / 2} ${arteryY + 22} Z`}
                    fill={stroke} opacity={0.5 * edgeFade(arteryY)}
                  />
                  <path
                    d={`M ${VEIN_X + 20} ${veinY} L ${VEIN_X + PIPE_W - 20} ${veinY} L ${VEIN_X + PIPE_W / 2} ${veinY - 22} Z`}
                    fill={stroke} opacity={0.5 * edgeFade(veinY)}
                  />
                </g>
              );
            }) : null}

            {/* 열교환 화살표 - 동맥(오른쪽)에서 정맥(왼쪽)으로, 아래에서부터 순차 등장 + 은은한 맥동 */}
            {HEAT_YS.map((hy, i) => {
              if (hy > PIPE_Y + pipeVisibleH) return null;
              const idxFromBottom = HEAT_YS.length - 1 - i;
              const revealed = clamp01((heat - idxFromBottom * 0.16) * 4);
              if (revealed <= 0.02) return null;
              const pulse = 0.75 + 0.25 * Math.sin(f / 6 + i * 1.7);
              const ax = ARTERY_X + 6;
              const bx = VEIN_X + PIPE_W - 6;
              return (
                <g key={i} opacity={revealed * pulse}>
                  <path d={`M ${ax} ${hy} L ${bx + 14} ${hy}`} stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
                  <path d={`M ${bx + 14} ${hy} L ${bx + 30} ${hy - 12} M ${bx + 14} ${hy} L ${bx + 30} ${hy + 12}`} stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
                </g>
              );
            })}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default CounterCurrentDiagram;
