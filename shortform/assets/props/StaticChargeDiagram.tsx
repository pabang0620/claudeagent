/** "몸에 정전기(+)가 쌓였다가 - 씻겨나가거나(와이프) - 한번에 터진다(방전)"는 구조를
 *  캐릭터 실루엣과 분리해서 그리는 오버레이 소품. general-ep16("겨울에 문손잡이를 잡으면
 *  따끔한 이유")을 위해 만들었다.
 *
 *  HiccupDiagram·GoosebumpDiagram과 같은 설계 원칙 - 새 신체를 그리지 않고, 호출하는 씬이
 *  이미 그린 몸(실제 마스코트 Actor·MiniCharacter 등 무엇이든) 주변의 바운딩 박스(x/y/width/
 *  height)만 받아 그 둘레에 "+" 마크를 배치한다. 그래서 이 컴포넌트 자체는 신체를 그리지
 *  않고 "무언가에 전하가 쌓이고 빠진다"는 구조를 갖는 다른 소재(배터리 충전, 압력 축적 등)
 *  전반에도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 *
 *  buildProgress(0~1)   : + 마크가 순서대로 하나씩 팝인
 *  dischargeProgress(0~1): 뾰족한 삼각 envelope로 중심에서 각 마크 방향으로 스파크 선이
 *                          뻗어나가고, + 마크는 빠르게 사라진다(한번에 방전)
 *  wipeProgress(0~1)    : 위->아래로 물방울이 지나가며, 지나간 자리의 + 마크가 사라진다
 *                          (습도가 정전기를 흘려보내는 연출 - "여름/습함" 쪽에 씀)
 *  세 progress는 서로 독립적이라 buildProgress=1 을 유지한 채 dischargeProgress 또는
 *  wipeProgress 만 움직이는 식으로 조합해 쓴다.
 */
import React from 'react';
import { C } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function plusPositions(w: number, h: number, n: number) {
  const cx = w / 2;
  const cy = h * 0.42;
  const rx = w * 0.54;
  const ry = h * 0.46;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rf = i % 2 === 0 ? 1 : 0.84; // 결정적 반지름 변화(교대) - Math.random 미사용
    out.push({ x: cx + Math.cos(a) * rx * rf, y: cy + Math.sin(a) * ry * rf });
  }
  return out;
}

const PlusMark: React.FC<{ size: number; opacity: number; color: string }> = ({ size, opacity, color }) => {
  if (opacity <= 0.01) return null;
  return (
    <g opacity={opacity}>
      <rect x={-size / 2} y={-size * 0.16} width={size} height={size * 0.32} rx={size * 0.16} fill={color} />
      <rect x={-size * 0.16} y={-size / 2} width={size * 0.32} height={size} rx={size * 0.16} fill={color} />
    </g>
  );
};

export interface StaticChargeDiagramProps {
  /** + 마크가 둘러싸는 영역(바디 실루엣의 바운딩 박스) */
  x: number;
  y: number;
  width: number;
  height: number;
  plusCount?: number;
  buildProgress?: number;
  dischargeProgress?: number;
  wipeProgress?: number;
  markSize?: number;
  color?: string;
  sparkColor?: string;
  style?: React.CSSProperties;
}

export const StaticChargeDiagram: React.FC<StaticChargeDiagramProps> = ({
  x, y, width, height, plusCount = 6, buildProgress = 0, dischargeProgress = 0, wipeProgress = 0,
  markSize = 34, color = C.coral, sparkColor = C.gold, style,
}) => {
  const positions = plusPositions(width, height, plusCount);
  const cx = width / 2;
  const cy = height * 0.42;
  const build = clamp01(buildProgress);
  const discharge = clamp01(dischargeProgress);
  const wipe = clamp01(wipeProgress);

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute', left: x, top: y, overflow: 'visible', pointerEvents: 'none', ...style,
      }}
    >
      {positions.map((p, i) => {
        const per = clamp01(build * plusCount - i);
        const dischargeFade = 1 - clamp01(discharge * 1.6);
        const localY = p.y / height;
        const wiped = wipe > 0 ? clamp01((wipe - localY) * 6) : 0;
        const opacity = per * dischargeFade * (1 - wiped);
        const scale = 0.5 + 0.5 * per;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${scale})`}>
            <PlusMark size={markSize} opacity={opacity} color={color} />
          </g>
        );
      })}

      {discharge > 0.001 ? positions.map((p, i) => {
        const stagger = clamp01(discharge * 1.6 - i * 0.05);
        const env = stagger < 0.4 ? stagger / 0.4 : Math.max(0, 1 - (stagger - 0.4) / 0.5);
        if (env <= 0.01) return null;
        const ex = cx + (p.x - cx) * 1.55;
        const ey = cy + (p.y - cy) * 1.55;
        return (
          <line
            key={`s${i}`} x1={cx} y1={cy} x2={ex} y2={ey}
            stroke={sparkColor} strokeWidth={7} strokeLinecap="round" opacity={env}
          />
        );
      }) : null}

      {wipe > 0.001 && wipe < 0.999 ? (
        <circle cx={cx} cy={wipe * height} r={17} fill={C.sky} opacity={0.85} />
      ) : null}
    </svg>
  );
};

export default StaticChargeDiagram;
