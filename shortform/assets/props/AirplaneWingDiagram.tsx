/** "날개가 받음각(공기가 흐르는 방향에 대해 앞이 살짝 든 각도)으로 날면서 날개 밑을 지나는
 *  공기를 아래로 꺾어 밀어내고, 그 반작용으로 공기가 날개를 정확히 반대 방향(위)으로 밀어
 *  올린다"는 인과를 보여주는 다이어그램(그 무거운 비행기가 하늘에 뜨는 이유, general-ep35).
 *  SaltCycleDiagram·CaffeineReceptorDiagram과 같은 설계(독립 레이어, undefined면 안 그림,
 *  이전 단계가 이미 1인 상태를 전제로 이어받아 하나의 긴 인과를 이어 그릴 수 있다).
 *
 *  날개 단면(옆모습)은 리딩엣지(LE)-트레일링엣지(TE)를 잇는 두 3차 베지어(위/아래 표면)
 *  만으로 이뤄진 단순 캠버 도형이다. 받음각은 별도 회전 계산 없이 LE를 TE보다 위(작은 y)에
 *  두는 좌표 자체에 이미 반영해뒀다(고정 약 9.7도). 공기 흐름은 지시사항대로 굵은 선
 *  3~4가닥으로만 그리고, 작은 점·화살표를 잔뜩 뿌리지 않는다.
 *
 *   - deflectProgress      : 0~1. 날개 밑을 지나는 굵은 공기줄 3가닥이 왼쪽에서 들어와
 *     트레일링엣지를 지나며 아래로 꺾인다(각 줄은 pathLength=1 트릭으로 순차 리빌, 인덱스
 *     기반 시차). s3용.
 *   - reactionProgress      : 0~1. deflectProgress=1을 전제로, 트레일링엣지 뒤쪽에 "공기가
 *     아래로" 굵은 화살표가 먼저 자라나고, 뒤이어 날개 위로 "날개는 위로" 굵은 화살표가
 *     자란다 - 작용-반작용을 대칭 화살표 쌍으로 보여준다. s4용.
 *   - simultaneityCompare   : 0~1. 위/아래 표면을 따라 점 마커 2개가 LE에서 동시에 출발해
 *     TE까지 이동한다. 위쪽 마커가 더 빨리 도착해 작은 도착 표시(burst)가 먼저 뜨고, 아래쪽
 *     마커는 한참 뒤에 도착한다 - 수치 라벨 없이 "동시 도착이 아님"만 시각으로 보여준다.
 *     s6용.
 *  전부 undefined/0이면 날개 단면만 보이는 정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const WING_VB_W = 700;
export const WING_VB_H = 900;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const band = (v: number, a: number, b: number) => smooth((v - a) / Math.max(0.0001, b - a));

interface Pt { x: number; y: number }

/** 받음각(약 9.7도, 앞이 살짝 위로 든 각도)이 좌표 자체에 이미 반영된 날개 컨트롤포인트 */
const LE: Pt = { x: 110, y: 380 };
const TE: Pt = { x: 520, y: 450 };
const UPPER_C1: Pt = { x: 190, y: 278 };
const UPPER_C2: Pt = { x: 400, y: 266 };
const LOWER_C1: Pt = { x: 380, y: 500 };
const LOWER_C2: Pt = { x: 210, y: 480 };

function bez(t: number, p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt {
  const mt = 1 - t;
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}

const upperAt = (t: number) => bez(t, LE, UPPER_C1, UPPER_C2, TE);
const lowerAt = (t: number) => bez(t, LE, LOWER_C2, LOWER_C1, TE);

const WING_PATH = `M ${LE.x} ${LE.y}
  C ${UPPER_C1.x} ${UPPER_C1.y} ${UPPER_C2.x} ${UPPER_C2.y} ${TE.x} ${TE.y}
  C ${LOWER_C1.x} ${LOWER_C1.y} ${LOWER_C2.x} ${LOWER_C2.y} ${LE.x} ${LE.y} Z`;

/** 날개 밑을 지나는 공기줄 3가닥의 시작 높이(under-wing 통로) */
const AIR_LINE_Y = [478, 536, 596];

function airLinePath(startY: number): string {
  const bendCtrlX = TE.x + 90;
  const endX = TE.x + 168;
  const endY = startY + 132;
  return `M 20 ${startY} L ${TE.x - 6} ${startY} Q ${bendCtrlX} ${startY + 18} ${endX} ${endY}`;
}

/** 화살(선+화살촉 삼각형). LightScatterDiagram의 Arrow와 같은 원칙(reveal 0~1로 자람) */
function BoldArrow({
  origin, angleDeg, length, reveal, color, strokeWidth = SW,
}: { origin: Pt; angleDeg: number; length: number; reveal: number; color: string; strokeWidth?: number }) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const len = length * r;
  const tipX = origin.x + dx * len;
  const tipY = origin.y + dy * len;
  const headLen = Math.min(34, len * 0.4);
  const backX = tipX - dx * headLen;
  const backY = tipY - dy * headLen;
  const perpX = -dy;
  const perpY = dx;
  const headW = headLen * 0.62;
  return (
    <g>
      <line
        x1={origin.x} y1={origin.y} x2={backX} y2={backY}
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      />
      <path
        d={`M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`}
        fill={color}
      />
    </g>
  );
}

function ArriveBurst({ pt, a, color }: { pt: Pt; a: number; color: string }) {
  const c = clamp01(a);
  if (c <= 0.02) return null;
  const r = 14 + 26 * c;
  return <circle cx={pt.x} cy={pt.y} r={r} fill="none" stroke={color} strokeWidth={SW_THIN * 0.7} opacity={1 - c} />;
}

export interface AirplaneWingDiagramProps {
  width: number;
  x: number;
  y: number;
  deflectProgress?: number;
  reactionProgress?: number;
  simultaneityCompare?: number;
  stroke?: string;
  wingFill?: string;
  airColor?: string;
  downColor?: string;
  upColor?: string;
  topMarkerColor?: string;
  bottomMarkerColor?: string;
  style?: React.CSSProperties;
}

export const AirplaneWingDiagram: React.FC<AirplaneWingDiagramProps> = ({
  width, x, y,
  deflectProgress, reactionProgress, simultaneityCompare,
  stroke = C.ink, wingFill = C.paper, airColor = C.waterCool,
  downColor = C.inkSoft, upColor = C.coral,
  topMarkerColor = C.coral, bottomMarkerColor = C.inkSoft,
  style,
}) => {
  const scale = width / WING_VB_W;
  const height = WING_VB_H * scale;

  const dp = deflectProgress !== undefined ? clamp01(deflectProgress) : undefined;
  const rp = reactionProgress !== undefined ? clamp01(reactionProgress) : undefined;
  const sc = simultaneityCompare !== undefined ? clamp01(simultaneityCompare) : undefined;

  // 공기줄 3가닥 - 인덱스 기반 시차(원칙 3: 순수 함수, Math.random 미사용)
  const airReveal = dp !== undefined ? AIR_LINE_Y.map((_, i) => band(dp, i * 0.14, i * 0.14 + 0.66)) : null;
  // 반작용 화살표가 등장하면 공기줄은 "이미 자리잡은" 낮은 밝기로 유지
  const airSettled = rp !== undefined;

  // 반작용 화살표: 아래 화살표가 먼저, 위 화살표가 뒤이어 자란다
  const downReveal = rp !== undefined ? band(rp, 0, 0.5) : 0;
  const upReveal = rp !== undefined ? band(rp, 0.32, 1) : 0;
  const downOrigin: Pt = { x: TE.x + 46, y: TE.y + 70 };
  const upOrigin: Pt = { x: (LE.x + TE.x) / 2 + 10, y: lowerAt(0.42).y - 14 };

  // 위/아래 표면 마커 - 위가 sc=0.55에서 도착, 아래는 sc=1에서 도착
  const topT = sc !== undefined ? clamp01(sc / 0.55) : 0;
  const bottomT = sc !== undefined ? clamp01(sc / 1.0) : 0;
  const topPt = upperAt(topT);
  const bottomPt = lowerAt(bottomT);
  // 마커가 사라지는(topT/bottomT===1) 시점 바로 전부터 밝기를 올려, 도착 순간 "마커도
  // 버스트도 없는" 빈 프레임이 생기지 않게 한다.
  const topArriveA = sc !== undefined ? band(sc, 0.52, 0.72) : 0;
  const bottomArriveA = sc !== undefined ? band(sc, 0.86, 1.0) : 0;

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${WING_VB_W} ${WING_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* ---- 위/아래 표면 진행 안내선(sc 레이어에서만, 얇고 옅게) ---- */}
      {sc !== undefined ? (
        <>
          <path d={`M ${LE.x} ${LE.y} C ${UPPER_C1.x} ${UPPER_C1.y} ${UPPER_C2.x} ${UPPER_C2.y} ${TE.x} ${TE.y}`} fill="none" stroke={topMarkerColor} strokeWidth={SW_THIN * 0.6} strokeDasharray="4 10" opacity={0.4} />
          <path d={`M ${LE.x} ${LE.y} C ${LOWER_C2.x} ${LOWER_C2.y} ${LOWER_C1.x} ${LOWER_C1.y} ${TE.x} ${TE.y}`} fill="none" stroke={bottomMarkerColor} strokeWidth={SW_THIN * 0.6} strokeDasharray="4 10" opacity={0.4} />
        </>
      ) : null}

      {/* ---- 공기줄 3가닥(날개 밑, 트레일링엣지 뒤에서 아래로 꺾임) ---- */}
      {airReveal ? AIR_LINE_Y.map((sy, i) => (
        <path
          key={i}
          d={airLinePath(sy)}
          fill="none" stroke={airColor} strokeWidth={SW} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - airReveal[i]}
          opacity={airSettled ? 0.45 : 0.95}
        />
      )) : null}

      {/* ---- 날개 단면(항상 그림, 받음각은 좌표에 이미 반영) ---- */}
      <path d={WING_PATH} fill={wingFill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />

      {/* ---- 반작용 화살표 쌍 ---- */}
      {rp !== undefined ? (
        <>
          <BoldArrow origin={downOrigin} angleDeg={112} length={190} reveal={downReveal} color={downColor} />
          <BoldArrow origin={upOrigin} angleDeg={-90} length={210} reveal={upReveal} color={upColor} />
        </>
      ) : null}

      {/* ---- s6: 위/아래 마커 + 도착 버스트 ---- */}
      {sc !== undefined ? (
        <>
          <ArriveBurst pt={TE} a={topArriveA} color={topMarkerColor} />
          <ArriveBurst pt={TE} a={bottomArriveA} color={bottomMarkerColor} />
          {topT < 0.999 ? <circle cx={topPt.x} cy={topPt.y} r={16} fill={topMarkerColor} /> : null}
          {bottomT < 0.999 ? <circle cx={bottomPt.x} cy={bottomPt.y} r={16} fill={bottomMarkerColor} /> : null}
        </>
      ) : null}
    </svg>
  );
};

/* ================= AirplaneSide - 단순 실루엣(창문·엔진 디테일 없음) ================= */

export const AIRPLANE_SIDE_VB_W = 520;
export const AIRPLANE_SIDE_VB_H = 220;

const FUSELAGE_D = `M 55 110
  Q 57 86 115 84
  L 385 87
  Q 445 90 495 110
  Q 445 130 385 133
  L 115 136
  Q 57 134 55 110 Z`;

/** 꼬리날개 - 동체 뒤쪽(꼬리)에서 위로 스윕된 삼각형 */
const TAIL_FIN_D = 'M 150 87 L 100 87 L 118 42 Z';
/** 주날개 - 동체 중앙 배 밑에서 뒤로 스윕된 사다리꼴(옆모습이라 하나만 보임) */
const WING_SIDE_D = 'M 340 133 L 260 133 L 195 196 L 305 184 Z';

export interface AirplaneSideProps {
  width: number;
  x: number;
  y: number;
  /** 기수가 위로 드는 각도(도). 상승 구간 연출용 */
  angle?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const AirplaneSide: React.FC<AirplaneSideProps> = ({
  width, x, y, angle = 0, stroke = C.ink, fill = C.paper, style,
}) => {
  const scale = width / AIRPLANE_SIDE_VB_W;
  const height = AIRPLANE_SIDE_VB_H * scale;
  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${AIRPLANE_SIDE_VB_W} ${AIRPLANE_SIDE_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <g transform={`rotate(${-angle} 270 110)`}>
        <path d={WING_SIDE_D} fill={fill} stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round" />
        <path d={TAIL_FIN_D} fill={fill} stroke={stroke} strokeWidth={SW_THIN} strokeLinejoin="round" />
        <path d={FUSELAGE_D} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

export default AirplaneWingDiagram;
