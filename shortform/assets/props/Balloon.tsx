/** 풍선 1개 소품 (general-ep72, "안 터진 풍선이 쪼그라드는 이유"). 몸통+매듭만 있는 단순
 *  형태로 그린다("신체 표현은 최소한으로" 원칙과 같은 정신 - 장식을 과하게 얹지 않는다).
 *
 *  REGISTRY 확인 완료: 기존에 풍선 소품이 없었다(56화 VocalResonanceDiagram은 성대·공명
 *  오버레이일 뿐 풍선 모양 자체를 그리지 않는다). 그래서 새로 만들었다.
 *
 *   - fullness         : 0~1. 1=빵빵한 풍선, 값이 작을수록 쪼그라든다(최소 0.55배까지 축소).
 *     매듭(BALLOON_KNOT_PT) 을 고정 앵커로 스케일하므로 바닥선이 흔들리지 않는다.
 *   - noHoleMark        : 0~1. 표면에 구멍이 없다는 것을 보여주는 원형 배지("검사했지만
 *     구멍 없음" - 원 안에 X). 구멍 자체를 그리는 게 아니라 "찾아봤는데 없다"는 표시다.
 *   - coatingProgress   : 0~1. 몸통 안쪽에 코팅제 막이 살짝 얇게 발리는 애니메이션(general-ep72
 *     s6, 헬륨 풍선 안쪽 특수 코팅용).
 *  fullness가 0.7 미만이면 쪼그라든 티가 나도록 몸통에 잔주름 선 2개가 옅게 겹쳐진다(점
 *  무리가 아니라 큰 곡선 2개만 - "신체 표현은 최소한으로" 원칙과 같은 이유로 반복 요소를
 *  피했다).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const BALLOON_VB_W = 460;
export const BALLOON_VB_H = 620;
/** 매듭 좌표 - fullness 스케일의 고정 앵커. 다른 컴포넌트가 풍선 기준점을 잡을 때도 쓴다 */
export const BALLOON_KNOT_PT = { x: 230, y: 560 };

const smooth = (v: number) => { const c = clamp01(v); return c * c * (3 - 2 * c); };

const BODY_PATH = `
  M 230 40
  C 350 40 410 140 410 270
  C 410 380 350 460 280 500
  L 250 540
  L 210 540
  C 140 460 50 380 50 270
  C 50 140 110 40 230 40
  Z
`;
const KNOT_PATH = 'M 214 540 L 246 540 L 230 575 Z';

export interface BalloonProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 1=빵빵한 풍선, 0에 가까울수록 쪼그라든다(최소 0.55배). 기본 1 */
  fullness?: number;
  color?: string;
  stroke?: string;
  /** 0~1. "검사했지만 구멍 없음" 원형 배지 */
  noHoleMark?: number;
  /** 0~1. 몸통 안쪽에 코팅제 막이 얇게 발리는 애니메이션 */
  coatingProgress?: number;
  coatingColor?: string;
  style?: React.CSSProperties;
}

export const Balloon: React.FC<BalloonProps> = ({
  width, x = 0, y = 0, fullness = 1, color = C.coral, stroke = C.ink,
  noHoleMark = 0, coatingProgress = 0, coatingColor = C.gold, style,
}) => {
  const height = (width * BALLOON_VB_H) / BALLOON_VB_W;
  const f = clamp01(fullness);
  const scale = 0.55 + 0.45 * f;
  const anchor = BALLOON_KNOT_PT;
  const wrinkleA = smooth(clamp01((0.7 - f) / 0.7));
  const coatA = clamp01(coatingProgress);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${BALLOON_VB_W} ${BALLOON_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        <g transform={`translate(${anchor.x} ${anchor.y}) scale(${scale}) translate(${-anchor.x} ${-anchor.y})`}>
          <path d={BODY_PATH} fill={color} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
          {/* 안쪽 코팅막 - 몸통 색 자체를 바꾸지 않고, 안쪽 벽을 따라 도는 굵은 띠(스트로크만,
              채움 없음)로 "막이 발렸다"를 표현한다. 채움으로 겹치면 색이 섞여 탁해진다(예:
              골드+블루=올리브 톤으로 어울리지 않게 보인 실측 결함 - 스트로크 방식으로 교체) */}
          {coatA > 0.01 ? (
            <path
              d={BODY_PATH} fill="none" stroke={coatingColor}
              strokeWidth={26 * smooth(coatA)} strokeLinejoin="round"
              opacity={0.9 * coatA}
              transform="translate(230 270) scale(0.9) translate(-230 -270)"
            />
          ) : null}
          <path d={KNOT_PATH} fill={color} stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round" />
          <ellipse cx={170} cy={170} rx={55} ry={85} fill="#FFFFFF" opacity={0.26} />
          {wrinkleA > 0.02 ? (
            <g opacity={wrinkleA} stroke={stroke} strokeWidth={SW_THIN * 0.65} fill="none" strokeLinecap="round">
              <path d="M 120 230 Q 230 262 340 224" />
              <path d="M 110 330 Q 230 366 350 322" />
            </g>
          ) : null}
        </g>
      </svg>
      {noHoleMark > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: '52%', top: '38%',
            transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * smooth(clamp01(noHoleMark))})`,
            opacity: clamp01(noHoleMark),
          }}
        >
          <svg width={width * 0.34} height={width * 0.34} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={44} fill={C.paper} stroke={C.coral} strokeWidth={8} />
            <line x1={32} y1={32} x2={68} y2={68} stroke={C.coral} strokeWidth={9} strokeLinecap="round" />
            <line x1={68} y1={32} x2={32} y2={68} stroke={C.coral} strokeWidth={9} strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

export default Balloon;
