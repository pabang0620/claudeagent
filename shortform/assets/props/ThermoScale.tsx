/** 세로 온도계 다이어그램 - 특정 값들(상온/녹는점/체온 등)을 하나의 눈금 위에 나란히
 *  표시하고, 그중 두 값이 "거의 붙어 있을 만큼 가깝다"는 것을 대괄호 브래킷으로 보여준다
 *  (초콜릿 녹는점이 사람 체온과 거의 같은 이유).
 *
 *  `CompareBars`/`Ruler`/`PowerlineDiagram`과 같은 원칙으로 화면 절대좌표(px)를 직접 받는다
 *  (자체 축소 viewBox 없음) - 다른 소품과 함께 한 화면에 정확히 정렬해 배치하기 위해서다.
 *  각 점은 독립 `progress`(0~1, 호출 씬이 계산해 넘김 - CellMergeDiagram과 같은 순수 함수
 *  원칙)로 팝인하고, `closeBracket`은 두 점의 인덱스를 지정하면 그 사이에만 브래킷을 그린다.
 *
 *  "값 여러 개를 하나의 척도 위에 놓고 두 값이 얼마나 가까운지 비교"하는 다른 소재(끓는점,
 *  어는점, 알레르기 반응 역치 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록.
 */
import React from 'react';
import { C, FONT, FS, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface ThermoPoint {
  /** 0(트랙 맨 아래, 차가움) ~ 1(트랙 맨 위, 뜨거움) */
  posT: number;
  label: string;
  color?: string;
  /** 0~1. 이 점의 등장 진행도(팝인+라벨 페이드). 기본 1(항상 보임) */
  progress?: number;
}

export interface ThermoScaleCloseBracket {
  aIndex: number;
  bIndex: number;
  label: string;
  /** 0~1. 기본 1 */
  progress?: number;
  color?: string;
}

export interface ThermoScaleProps {
  /** 온도계 중심 x(화면 절대좌표) */
  cx: number;
  /** 눈금 트랙 맨 위 y */
  topY: number;
  /** 눈금 트랙 길이(px) - 이 구간 안에서 posT 0~1이 매핑된다 */
  trackHeight: number;
  tubeWidth?: number;
  points: ThermoPoint[];
  closeBracket?: ThermoScaleCloseBracket;
  stroke?: string;
  tubeColor?: string;
  coldColor?: string;
  hotColor?: string;
  labelColor?: string;
  labelSize?: number;
  style?: React.CSSProperties;
}

export const ThermoScale: React.FC<ThermoScaleProps> = ({
  cx, topY, trackHeight, tubeWidth = 46, points, closeBracket,
  stroke = C.ink, tubeColor = C.paper, coldColor = C.waterCool, hotColor = C.coral,
  labelColor = C.ink, labelSize = FS.small, style,
}) => {
  const bulbR = tubeWidth * 1.15;
  const bottomY = topY + trackHeight;
  const gradId = 'thermoFillGrad';
  const yOf = (posT: number) => bottomY - clamp01(posT) * trackHeight;

  return (
    <svg
      width={cx + 320} height={bottomY + bulbR + 40}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={coldColor} />
          <stop offset="1" stopColor={hotColor} />
        </linearGradient>
      </defs>

      {/* 온도계 몸통 - 튜브 + 아래 둥근 구근(bulb) */}
      <rect
        x={cx - tubeWidth / 2} y={topY - tubeWidth / 2} width={tubeWidth} height={trackHeight + tubeWidth}
        rx={tubeWidth / 2} fill={tubeColor} stroke={stroke} strokeWidth={SW}
      />
      <circle cx={cx} cy={bottomY + bulbR * 0.35} r={bulbR} fill={tubeColor} stroke={stroke} strokeWidth={SW} />
      {/* 안쪽 채움(차가움 아래 -> 뜨거움 위, 항상 은은하게) */}
      <rect
        x={cx - tubeWidth / 2 + 10} y={topY - tubeWidth / 2 + 10}
        width={tubeWidth - 20} height={trackHeight + tubeWidth - 20}
        rx={(tubeWidth - 20) / 2} fill={`url(#${gradId})`} opacity={0.55}
      />
      <circle cx={cx} cy={bottomY + bulbR * 0.35} r={bulbR - 12} fill={hotColor} opacity={0.75} />

      {/* 각 지점 눈금 + 라벨 */}
      {points.map((pt, i) => {
        const p = clamp01(pt.progress ?? 1);
        if (p <= 0.01) return null;
        const py = yOf(pt.posT);
        const color = pt.color ?? C.ink;
        const tickX2 = cx + tubeWidth / 2 + 34;
        return (
          <g key={i} opacity={p}>
            <line
              x1={cx + tubeWidth / 2 - 4} y1={py} x2={tickX2} y2={py}
              stroke={color} strokeWidth={SW_THIN * 0.85} strokeLinecap="round"
            />
            <circle cx={cx} cy={py} r={12} fill={color} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
            <text
              x={tickX2 + 14} y={py + labelSize * 0.34} textAnchor="start"
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: labelSize, fill: labelColor }}
            >
              {pt.label}
            </text>
          </g>
        );
      })}

      {/* 두 지점이 "거의 붙어 있다"는 것을 보여주는 브래킷 */}
      {closeBracket ? (() => {
        const bp = clamp01(closeBracket.progress ?? 1);
        if (bp <= 0.01) return null;
        const a = points[closeBracket.aIndex];
        const b = points[closeBracket.bIndex];
        if (!a || !b) return null;
        const yA = yOf(a.posT);
        const yB = yOf(b.posT);
        const top = Math.min(yA, yB);
        const bot = Math.max(yA, yB);
        const bx = cx + tubeWidth / 2 + 160;
        const col = closeBracket.color ?? C.coral;
        return (
          <g opacity={bp}>
            <path
              d={`M ${bx - 14} ${top} L ${bx} ${top} L ${bx} ${bot} L ${bx - 14} ${bot}`}
              fill="none" stroke={col} strokeWidth={SW_THIN * 0.85} strokeLinecap="round" strokeLinejoin="round"
            />
            <text
              x={bx + 16} y={(top + bot) / 2 + labelSize * 0.34} textAnchor="start"
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: labelSize, fill: col }}
            >
              {closeBracket.label}
            </text>
          </g>
        );
      })() : null}
    </svg>
  );
};

export default ThermoScale;
