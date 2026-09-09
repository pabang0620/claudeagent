/** 전자레인지 내부 다이어그램 - "전자기파가 방향을 빠르게 뒤집고, 물 분자가 그 방향을 따라
 *  계속 뒤집힌다"는 구조를 보여준다.
 *
 *  채널 원칙(작은 점을 여러 개 흩뿌리지 않고 큰 도형 2~3개만 쓴다, builder 시각 주의사항)에
 *  따라 물 분자는 크고 단순한 극성 분자 도형 2개(O 원자 + H 원자 2개 + 극성 부호)만 그리고,
 *  전자기파는 물결선(sine) 2개만 그린다. 물결선의 위상은 `f`(프레임)로 빠르게 흘러가며
 *  "방향이 초당 수십억 번 바뀐다"는 것을 시각적으로 암시하고, 분자는 같은 위상에 맞춰
 *  좌우로 뒤집히듯 회전한다(`DogNoseCloseup`/`CatPurrDiagram`과 같은 예외 - 반복 진동이라
 *  `f`를 직접 받는다, Math.random 미사용, 원칙 3).
 *
 *  "파동을 따라 극성 입자가 진동한다"는 구조를 갖는 다른 전자기 소재 전반에도 재사용
 *  가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const SW_HAIR_LOCAL = 5;

export const MICROWAVE_VB_W = 700;
export const MICROWAVE_VB_H = 620;

const BOX_X = 40;
const BOX_Y = 60;
const BOX_W = MICROWAVE_VB_W - BOX_X * 2;
const BOX_H = MICROWAVE_VB_H - BOX_Y * 2 - 20;

interface MoleculeSpec {
  cx: number;
  cy: number;
  scale: number;
  phase: number;
}

/** 분자 2개 - 상자 안 좌/우에 여유 있게 배치(파동선과 겹치지 않도록 세로로 살짝 어긋냄) */
const MOLECULES: MoleculeSpec[] = [
  { cx: BOX_X + BOX_W * 0.32, cy: BOX_Y + BOX_H * 0.42, scale: 1, phase: 0 },
  { cx: BOX_X + BOX_W * 0.68, cy: BOX_Y + BOX_H * 0.62, scale: 0.92, phase: 2.1 },
];

/** 물결선(전자기파) 2개 - 상자를 가로지르는 sine 곡선. amp 는 waveT 로 페이드인,
 *  위상은 f 로 빠르게 흘러 "방향이 계속 뒤집힌다"는 인상을 만든다 */
function wavePath(f: number, rowY: number, amp: number, speed: number, freq: number, phaseOffset: number) {
  const steps = 40;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = BOX_X + BOX_W * t;
    const py = rowY + amp * Math.sin(t * Math.PI * freq + f * speed + phaseOffset);
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** 극성 물 분자 도형 - O 원자(큰 원) + H 원자 2개(작은 원) + 극성 부호(-/+).
 *  angle 만큼 통째로 회전해 "전자기파 방향을 따라 뒤집힌다"를 표현한다 */
function MoleculeIcon({
  cx, cy, size, angle, oColor, hColor, textColor,
}: {
  cx: number; cy: number; size: number; angle: number; oColor: string; hColor: string; textColor: string;
}) {
  const oR = size * 0.34;
  const hR = size * 0.2;
  const bond = size * 0.5;
  const hAngle = 52; // O 를 기준으로 H 두 개가 벌어진 각(대칭)
  const rad = (d: number) => (d * Math.PI) / 180;
  const h1 = { x: bond * Math.cos(rad(-90 - hAngle)), y: bond * Math.sin(rad(-90 - hAngle)) };
  const h2 = { x: bond * Math.cos(rad(-90 + hAngle)), y: bond * Math.sin(rad(-90 + hAngle)) };

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      {/* 결합선 */}
      <line x1={0} y1={0} x2={h1.x} y2={h1.y} stroke={C.ink} strokeWidth={SW_THIN * 0.7} strokeLinecap="round" />
      <line x1={0} y1={0} x2={h2.x} y2={h2.y} stroke={C.ink} strokeWidth={SW_THIN * 0.7} strokeLinecap="round" />
      {/* H 원자 2개 */}
      <circle cx={h1.x} cy={h1.y} r={hR} fill={hColor} stroke={C.ink} strokeWidth={SW_THIN * 0.6} />
      <circle cx={h2.x} cy={h2.y} r={hR} fill={hColor} stroke={C.ink} strokeWidth={SW_THIN * 0.6} />
      {/* O 원자 */}
      <circle cx={0} cy={0} r={oR} fill={oColor} stroke={C.ink} strokeWidth={SW_THIN * 0.75} />
      {/* 극성 부호 - O 쪽(위) 음극, H 쪽(아래) 양극. H 원자 2개가 위쪽에서 서로 가깝게
          모이므로(hAngle 52도) "-" 를 그 사이에 두면 H 테두리선에 가려 안 보인다(2026-09-02
          검수로 발견). H 원자 바깥, 분자 꼭대기 너머로 확실히 띄우고 배경용 흰 배지를 깐다 */}
      <circle cx={0} cy={-(bond + hR + 14)} r={size * 0.16} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.5} />
      <text
        x={0} y={-(bond + hR + 14)} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.28} fontWeight={800} fill={textColor}
      >-</text>
      <circle cx={0} cy={bond * 0.98} r={size * 0.15} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN * 0.5} />
      <text
        x={0} y={bond * 0.98} textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.26} fontWeight={800} fill={textColor}
      >+</text>
    </g>
  );
}

/** 마찰 스파크 - 분자 두 개 사이 지점에서 짧게 뻗치는 방사선 6개(작은 점 대신 큰 선,
 *  builder 시각 주의사항 준수). sparkT 로 등장, f 로 깜빡인다 */
function FrictionSpark({ cx, cy, t, f, color }: { cx: number; cy: number; t: number; f: number; color: string }) {
  if (t <= 0.01) return null;
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f * 0.62));
  const r1 = 10;
  const r2 = 30 * (0.7 + 0.3 * pulse);
  return (
    <g stroke={color} strokeWidth={SW_THIN * 0.8} strokeLinecap="round" opacity={t * pulse}>
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)}
            x2={cx + r2 * Math.cos(rad)} y2={cy + r2 * Math.sin(rad)}
          />
        );
      })}
    </g>
  );
}

export interface MicrowaveDiagramProps {
  /** 현재 프레임(진동 위상 계산용) */
  f: number;
  width: number;
  x: number;
  y: number;
  /** 0~1. 전자기파 물결선이 나타나는 정도(페이드인) */
  waveT?: number;
  /** 0~1. 물 분자가 뒤집히는 회전 진폭(페이드인) */
  moleculeFlipT?: number;
  /** 0~1. 분자 사이 마찰 스파크가 나타나는 정도(페이드인). 0/undefined 면 안 그림 */
  sparkT?: number;
  stroke?: string;
  waveColor?: string;
  oColor?: string;
  hColor?: string;
  sparkColor?: string;
  style?: React.CSSProperties;
}

export const MicrowaveDiagram: React.FC<MicrowaveDiagramProps> = ({
  f, width, x, y, waveT = 1, moleculeFlipT = 1, sparkT = 0, stroke = C.ink,
  waveColor = C.coral, oColor = C.waterCool, hColor = C.paper, sparkColor = C.gold, style,
}) => {
  const wt = clamp01(waveT);
  const mt = clamp01(moleculeFlipT);
  const st = clamp01(sparkT);
  const amp = 46 * wt;
  const flipDeg = 58 * mt;
  const speed = 0.62;
  const sparkCx = (MOLECULES[0].cx + MOLECULES[1].cx) / 2;
  const sparkCy = (MOLECULES[0].cy + MOLECULES[1].cy) / 2;

  return (
    <svg
      viewBox={`0 0 ${MICROWAVE_VB_W} ${MICROWAVE_VB_H}`}
      width={width} height={(width * MICROWAVE_VB_H) / MICROWAVE_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 전자레인지 내부 상자 */}
      <rect
        x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H} rx={28}
        fill={C.paper} stroke={stroke} strokeWidth={SW}
      />
      {/* 상단 발열 그릴 힌트(가로줄 몇 개, 장식용 - 과하지 않게) */}
      <g stroke={C.roomDeep} strokeWidth={SW_HAIR_LOCAL} opacity={0.6}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i} x1={BOX_X + 24} x2={BOX_X + BOX_W - 24}
            y1={BOX_Y + 20 + i * 10} y2={BOX_Y + 20 + i * 10}
          />
        ))}
      </g>

      {/* 전자기파 물결선 2개 */}
      {wt > 0.01 ? (
        <g fill="none" strokeLinecap="round">
          <path
            d={wavePath(f, BOX_Y + BOX_H * 0.28, amp, speed, 2.4, 0)}
            stroke={waveColor} strokeWidth={SW_THIN} opacity={0.85 * wt}
          />
          <path
            d={wavePath(f, BOX_Y + BOX_H * 0.82, amp * 0.85, speed, 2.1, 1.7)}
            stroke={waveColor} strokeWidth={SW_THIN} opacity={0.7 * wt}
          />
        </g>
      ) : null}

      {/* 마찰 스파크 - 분자 사이 지점 */}
      <FrictionSpark cx={sparkCx} cy={sparkCy} t={st} f={f} color={sparkColor} />

      {/* 물 분자 2개 - 파동과 같은 위상으로 뒤집힘 */}
      {MOLECULES.map((m, i) => {
        const angle = flipDeg * Math.sin(f * speed * 1.15 + m.phase);
        return (
          <MoleculeIcon
            key={i}
            cx={m.cx} cy={m.cy} size={128 * m.scale} angle={angle}
            oColor={oColor} hColor={hColor} textColor={C.ink}
          />
        );
      })}
    </svg>
  );
};

export default MicrowaveDiagram;
