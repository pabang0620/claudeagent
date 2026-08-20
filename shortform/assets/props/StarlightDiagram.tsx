/** "빛이 관측자에게 도달하는 과정"을 보여주는 범용 다이어그램. 세 가지 독립된 레이어를
 *  각자의 progress prop(undefined면 그 레이어를 그리지 않는다)으로 노출한다 - CellMergeDiagram과
 *  같은 설계(여러 단계를 독립 progress로 노출해 소재를 몰라도 재사용 가능하게 한다).
 *
 *  1. sightlineProgress - 방사형 시선: 중심(관측자)에서 8방향으로 점선이 뻗어나가 끝에
 *     나무 또는 별이 나타난다("어느 방향을 보든 결국 뭔가에 닿는다"는 비유). sightlineTargetMix
 *     로 나무<->별을 크로스페이드한다(general-ep06 s6: 숲 비유 -> 별 전제로 전환).
 *  2. travelProgress - 빛 이동: 위쪽(먼 광원)에서 아래쪽(관측자)으로 빛줄기가 그려진다.
 *     "도중에 멈춰 있는" 연출은 이 컴포넌트가 아니라 호출부가 progress 자체를 낮게 캡해서
 *     넘기면 된다(예: Math.min(t, 0.55)) - 컴포넌트는 그 값을 그대로 그린다.
 *  3. waveProgress - 파형 늘어짐: 좌(광원, 짧은 파장·밝음)에서 우(관측자, 긴 파장·옅음)로
 *     진행하며 파장이 늘어지고 옅어지는 파동을 그린다(적색편이 비유, general-ep06 s9).
 *
 *  용도 무관 범용 소품이라 "별"/"나무" 외 소재에도 sightlineTargetMix 로 다른 대상 크로스페이드에
 *  재사용할 수 있다(REGISTRY 규칙 3 - 텍스트·색은 전부 props).
 */
import React from 'react';
import { C } from '../theme';

export interface StarlightDiagramProps {
  /** 화면상 한 변 크기(px). 내부 정사각 viewBox 를 이 크기로 스케일한다 */
  width: number;
  x: number;
  y: number;

  /** 방사형 시선 진행도(0~1). undefined 면 이 레이어를 그리지 않는다 */
  sightlineProgress?: number;
  /** 0 = 선 끝에 나무, 1 = 선 끝에 별 (크로스페이드). 기본 1(별) */
  sightlineTargetMix?: number;

  /** 빛 이동 진행도(0~1, 광원->관측자). undefined 면 이 레이어를 그리지 않는다 */
  travelProgress?: number;
  /** 빛줄기 전체 길이(px, viewBox 기준 아님 - width 스케일 이후 실제 화면 px).
   *  짧은/긴 스케일 비교(s8)에 쓴다. 기본 width*0.62 */
  travelLength?: number;

  /** 파형 늘어짐 진행도(0~1, 왼쪽에서 오른쪽으로 퍼짐+옅어짐). undefined 면 그리지 않는다 */
  waveProgress?: number;

  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

const VB = 700;

function polarPoint(cx: number, cy: number, angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** 5각 별 path (중심 기준 상대 좌표) */
function starPath(outerR: number, innerR: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${r * Math.cos(a)} ${r * Math.sin(a)}`);
  }
  return `M ${pts[0]} ` + pts.slice(1).map((p) => `L ${p}`).join(' ') + ' Z';
}

const TREE_PATH = 'M 0 -32 L -17 8 L -7 8 L -22 34 L 22 34 L 7 8 L 17 8 Z';
const STAR_PATH = starPath(24, 10);
const DIRS = [0, 45, 90, 135, 180, 225, 270, 315];

export const StarlightDiagram: React.FC<StarlightDiagramProps> = ({
  width, x, y,
  sightlineProgress, sightlineTargetMix = 1,
  travelProgress, travelLength,
  waveProgress,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const cx = VB / 2;
  const cy = VB / 2;
  const maxR = VB * 0.4;
  const tLen = (travelLength ?? width * 0.62) / (width / VB);

  // 파형: 왼쪽(짧은 파장, 밝음) -> 오른쪽(긴 파장, 옅음). 고정 함수라 프레임마다 흔들리지 않는다.
  const wavePts = React.useMemo(() => {
    const pts: { x: number; y: number; op: number }[] = [];
    const N = 140;
    const midY = VB * 0.5;
    for (let i = 0; i <= N; i++) {
      const t = i / N; // 0..1 좌->우
      const localWavelen = 26 + t * 120; // 파장이 점점 늘어남
      const amp = 34;
      const px = t * VB;
      const py = midY + amp * Math.sin((px / localWavelen) * Math.PI * 2);
      const op = 1 - t * 0.82; // 갈수록 옅어짐
      pts.push({ x: px, y: py, op });
    }
    return pts;
  }, []);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, ...style }}>
      <svg width={width} height={width} viewBox={`0 0 ${VB} ${VB}`} style={{ overflow: 'visible' }}>
        {sightlineProgress !== undefined ? (
          <g>
            <circle cx={cx} cy={cy} r={16} fill={C.coral} stroke={stroke} strokeWidth={4} />
            {DIRS.map((deg, i) => {
              const r = maxR * Math.min(1, sightlineProgress);
              if (r <= 2) return null;
              const p0 = polarPoint(cx, cy, deg, 30);
              const p1 = polarPoint(cx, cy, deg, r);
              const reach = Math.max(0, Math.min(1, (sightlineProgress - 0.82) / 0.18));
              return (
                <g key={i}>
                  <line
                    x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
                    stroke={C.inkSoft} strokeWidth={6} strokeDasharray="5 15"
                    strokeLinecap="round" opacity={0.85}
                  />
                  {reach > 0.001 ? (
                    <g transform={`translate(${p1.x} ${p1.y}) scale(${0.6 + 0.4 * reach})`} opacity={reach}>
                      <g opacity={1 - sightlineTargetMix}>
                        <path d={TREE_PATH} fill={C.leaf} stroke={stroke} strokeWidth={4} />
                      </g>
                      <g opacity={sightlineTargetMix}>
                        <path d={STAR_PATH} fill={C.gold} stroke={stroke} strokeWidth={4} />
                      </g>
                    </g>
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}

        {travelProgress !== undefined ? (
          <g>
            {/* 광원(먼 별) - 항상 표시, 관측자(도착점)는 옅게 항상 표시 */}
            <g transform={`translate(${cx} ${cy - tLen / 2})`}>
              <path d={STAR_PATH} fill={C.gold} stroke={stroke} strokeWidth={4} />
            </g>
            <circle cx={cx} cy={cy + tLen / 2} r={16} fill={fill} stroke={stroke} strokeWidth={5} opacity={0.5} />
            <line
              x1={cx} y1={cy - tLen / 2 + 30}
              x2={cx} y2={cy - tLen / 2 + 30 + (tLen - 30) * Math.max(0, Math.min(1, travelProgress))}
              stroke={C.gold} strokeWidth={10} strokeLinecap="round"
            />
          </g>
        ) : null}

        {waveProgress !== undefined ? (
          (() => {
            const wp = Math.max(0, Math.min(1, waveProgress));
            const visible = wavePts.filter((p) => p.x <= wp * VB);
            if (visible.length < 2) return null;
            return (
              <g>
                {visible.slice(0, -1).map((p, i) => {
                  const n = visible[i + 1];
                  return (
                    <line
                      key={i} x1={p.x} y1={p.y} x2={n.x} y2={n.y}
                      stroke={C.coral} strokeWidth={9} strokeLinecap="round"
                      opacity={(p.op + n.op) / 2}
                    />
                  );
                })}
              </g>
            );
          })()
        ) : null}
      </svg>
    </div>
  );
};

export default StarlightDiagram;
