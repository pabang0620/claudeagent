/** 종이 섬유 다이어그램. general-ep98("한번 접은 종이가 다시는 안 펴지는 이유") 전용으로
 *  신설했다. REGISTRY 3절 확인 완료 - 섬유 단위의 접힘-손상-영구 변형을 보여줄 기존 자산이
 *  없었다(38화 PaperEdgeDiagram은 종이 "단면 톱니 모양"을 다뤄 소재가 다르다).
 *
 *  오케스트레이터 시각 주의사항을 그대로 반영한다: 섬유는 가는 선 여러 가닥이 아니라
 *  굵은 선 몇 가닥으로 단순화한다(FIBER_PATHS 6개, CREASE_FIBERS 4개). 손상은 "끊어짐(crack -
 *  틈이 벌어지고 자잘한 균열 표시)"과 "눌림(flatten - 정점이 납작한 타원으로 눌린 자국)"
 *  두 가지 시각 언어로만 표현하고, 피부·신체 표현이 아니라서 반복되는 작은 점 패턴은
 *  쓰지 않는다(원칙 - 신체 표현 최소화와 별개로, 여기서도 과도한 디테일 반복은 피한다).
 *
 *  세 레이어를 독립 progress로 노출한다(PaperEdgeDiagram·GoosebumpDiagram과 같은 설계,
 *  undefined면 그 레이어를 안 그린다):
 *   - weaveProgress(0~1): s1. 종이 표면 확대 - 굵은 섬유 6가닥이 얽힌 모습이 순차적으로
 *     그려진다.
 *   - creaseProgress(0~1) + mode('multi'|'single') + pressProgress(0~1, 선택):
 *     접힌 선에서 섬유가 꺾이다가 버틸 수 있는 한계를 넘으면 손상되는 과정.
 *     mode='multi'(s2): 접힌 선 위 섬유 4가닥이 나란히 꺾인다(2가닥은 끊어짐, 2가닥은
 *       눌림 - "일부는 끊어지고 일부는 눌린다"를 여러 섬유로 보여준다).
 *     mode='single'(s3·s6): 섬유 하나를 크게 확대 - 꺾이는 정점에서 끊어짐과, 그 옆
 *       구간의 눌림이 한 섬유 위에 함께 나타난다("섬유 하나가... 일부는 끊어지고 일부는
 *       눌린 채로"). pressProgress(s6 전용, 손톱/자로 누르는 추가 압력)를 얹으면 손상이
 *       더 깊어지고 위에서 손끝 모양이 내려와 누르는 동작을 보여준다.
 *   - springBackProgress(0~1): s4. 왼쪽(정상) 섬유는 곧게 펴지고, 오른쪽(손상된) 섬유는
 *     꺾인 채 그대로 남는 비교. 라벨은 COMPARE_LEFT_LABEL_PT/COMPARE_RIGHT_LABEL_PT 로
 *     앵커만 내보내고, 실제 텍스트는 호출부가 strings.ts를 거쳐 <Label>로 얹는다(원칙 6).
 *
 *  스프링백 등 시간에 따른 이징은 이 컴포넌트가 아니라 호출부(scenes.tsx)가 anim.ts의
 *  spring 계열 함수로 계산해 progress 값으로 넘긴다 - 이 컴포넌트 내부에서 progress를
 *  다시 감쇠 곡선으로 바꾸지 않는다(21화 이후 결함 목록 D. "이중 감쇠" 방지).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const PAPER_FIBER_VB_W = 640;
export const PAPER_FIBER_VB_H = 640;

const CRACK_THRESH = 0.55;

/* ============================================================
 * S1: 얽힌 섬유 (weaveProgress)
 * ============================================================ */
const CARD = { x: 60, y: 60, w: 520, h: 520, rx: 30 };

/** 굵은 섬유 6가닥 - 촘촘한 잔니 대신 큼직한 커브 몇 개로 단순화 */
const FIBER_PATHS = [
  'M 92 150 C 220 96, 380 214, 566 152',
  'M 92 262 C 250 342, 350 182, 566 260',
  'M 92 380 C 224 320, 402 440, 566 358',
  'M 104 480 C 262 428, 340 522, 540 468',
  'M 132 100 C 182 300, 258 402, 222 560',
  'M 462 90 C 420 262, 500 380, 470 560',
];

const WeaveLayer: React.FC<{ weaveProgress: number; fill: string; stroke: string }> = ({
  weaveProgress, fill, stroke,
}) => {
  const wp = clamp01(weaveProgress);
  const frameA = Math.min(1, wp / 0.12);
  return (
    <g>
      <rect
        x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.rx}
        fill={fill} stroke={stroke} strokeWidth={SW} opacity={frameA}
      />
      {FIBER_PATHS.map((d, i) => {
        const stagger = (i / FIBER_PATHS.length) * 0.5;
        const fp = clamp01((wp - stagger) / 0.5);
        if (fp <= 0) return null;
        return (
          <path
            key={i} d={d} fill="none" stroke={C.gold} strokeWidth={24} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fp}
          />
        );
      })}
      {FIBER_PATHS.map((d, i) => {
        const stagger = (i / FIBER_PATHS.length) * 0.5;
        const fp = clamp01((wp - stagger) / 0.5);
        if (fp <= 0) return null;
        return (
          <path
            key={`ol-${i}`} d={d} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round"
            opacity={0.35} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fp}
          />
        );
      })}
    </g>
  );
};

/* ============================================================
 * 꺾이는 섬유 하나 - crease/single/compare 공용 렌더러
 * ============================================================ */
type Damage = 'none' | 'crack' | 'flatten' | 'both';

interface ChevronProps {
  x1: number; x2: number; baseY: number; bendDepth: number;
  p: number; // 0~1 꺾임 진행도
  damage: Damage;
  extra?: number; // 0~1 추가 손상(누르기 등)
  strokeWidth?: number;
  stroke: string;
  accent: string;
}

const Chevron: React.FC<ChevronProps> = ({
  x1, x2, baseY, bendDepth, p, damage, extra = 0, strokeWidth = 22, stroke, accent,
}) => {
  const bend = clamp01(p);
  const vx = (x1 + x2) / 2;
  const vy = baseY - bendDepth * bend;
  const dmgBase = clamp01((bend - CRACK_THRESH) / (1 - CRACK_THRESH));
  const dmg = clamp01(dmgBase + clamp01(extra) * 0.9);

  const alongLeft = (t: number) => ({ x: lerp(x1, vx, t), y: lerp(baseY, vy, t) });
  const alongRight = (t: number) => ({ x: lerp(vx, x2, t), y: lerp(vy, baseY, t) });

  if (damage === 'none' || dmg <= 0.001) {
    return (
      <path
        d={`M ${x1} ${baseY} L ${vx} ${vy} L ${x2} ${baseY}`}
        fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      />
    );
  }

  const gap = 10 + 24 * dmg;
  const leftEnd = { x: vx - gap / 2, y: vy + 5 * dmg };
  const rightStart = { x: vx + gap / 2, y: vy + 5 * dmg };

  const flattenAt = (pt: { x: number; y: number }, rBase: number) => {
    const rx = rBase * (0.9 + 0.5 * dmg);
    const ry = rBase * (0.42 - 0.16 * dmg);
    return (
      <ellipse
        cx={pt.x} cy={pt.y} rx={rx} ry={Math.max(4, ry)}
        fill={C.gold} stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={0.5 + 0.5 * dmg}
      />
    );
  };

  if (damage === 'crack') {
    return (
      <g>
        <path d={`M ${x1} ${baseY} L ${leftEnd.x} ${leftEnd.y}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d={`M ${rightStart.x} ${rightStart.y} L ${x2} ${baseY}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          d={`M ${vx - 8} ${vy - 16} L ${vx + 8} ${vy + 8} M ${vx + 10} ${vy - 12} L ${vx - 6} ${vy + 12}`}
          stroke={accent} strokeWidth={5} strokeLinecap="round" opacity={dmg}
        />
      </g>
    );
  }

  if (damage === 'flatten') {
    return (
      <g>
        <path d={`M ${x1} ${baseY} L ${vx} ${vy} L ${x2} ${baseY}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        {flattenAt({ x: vx, y: vy }, strokeWidth * 1.1)}
      </g>
    );
  }

  // 'both' - 정점은 끊어지고(crack), 오른쪽 구간 일부는 눌린다(flatten)
  const flatPt = alongRight(0.4);
  return (
    <g>
      <path d={`M ${x1} ${baseY} L ${leftEnd.x} ${leftEnd.y}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={`M ${rightStart.x} ${rightStart.y} L ${x2} ${baseY}`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path
        d={`M ${vx - 8} ${vy - 16} L ${vx + 8} ${vy + 8} M ${vx + 10} ${vy - 12} L ${vx - 6} ${vy + 12}`}
        stroke={accent} strokeWidth={5} strokeLinecap="round" opacity={dmg}
      />
      {flattenAt(flatPt, strokeWidth * 0.9)}
    </g>
  );
};

/* ============================================================
 * S2/S3/S6: 접힌 선의 섬유 (multi/single) + 누르기(press)
 * ============================================================ */
const MULTI_FIBERS: { y: number; damage: Damage }[] = [
  { y: 190, damage: 'flatten' },
  { y: 280, damage: 'crack' },
  { y: 380, damage: 'flatten' },
  { y: 470, damage: 'crack' },
];
const CREASE_X = PAPER_FIBER_VB_W / 2;
const MULTI_X1 = 90;
const MULTI_X2 = 550;
const MULTI_BEND = 46;

const SINGLE_BASE_Y = 340;
const SINGLE_X1 = 60;
const SINGLE_X2 = 580;
const SINGLE_BEND = 130;

const NailPress: React.FC<{ vx: number; vy: number; pressProgress: number; stroke: string }> = ({
  vx, vy, pressProgress, stroke,
}) => {
  const pp = clamp01(pressProgress);
  const a = Math.min(1, pp / 0.15);
  const topY = vy - 190;
  const y = lerp(topY, vy - 70, pp);
  return (
    <g opacity={a} transform={`translate(${vx} ${y})`}>
      <path d="M -34 0 C -34 -70, 34 -70, 34 0 L 26 46 C 20 60, -20 60, -26 46 Z" fill={C.paper} stroke={stroke} strokeWidth={SW_THIN} />
      <path d="M -20 -6 C -20 -34, 20 -34, 20 -6" fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={0.5} />
    </g>
  );
};

export interface PaperFiberDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. s1 - 얽힌 섬유가 순차적으로 그려짐 */
  weaveProgress?: number;
  /** 0~1. 접힌 선의 섬유가 꺾이다가(0.55 이후) 손상됨 */
  creaseProgress?: number;
  /** 'multi'(섬유 4가닥) | 'single'(섬유 1가닥 확대). creaseProgress와 함께 쓴다 */
  mode?: 'multi' | 'single';
  /** 0~1. single 모드 전용 - 손톱/자로 더 눌러 손상을 심화(s6) */
  pressProgress?: number;
  /** 0~1. s4 - 왼쪽(정상)은 펴지고 오른쪽(손상)은 그대로 */
  springBackProgress?: number;
  stroke?: string;
  fill?: string;
  accent?: string;
  style?: React.CSSProperties;
}

/** s4 비교 레이어의 라벨 앵커(viewBox 좌표) - 실제 텍스트는 호출부가 strings.ts에서 읽어 얹는다 */
export const COMPARE_LEFT_LABEL_PT = { x: 185, y: 190 };
export const COMPARE_RIGHT_LABEL_PT = { x: 455, y: 190 };

export const PaperFiberDiagram: React.FC<PaperFiberDiagramProps> = ({
  width, x = 0, y = 0, weaveProgress, creaseProgress, mode = 'multi', pressProgress, springBackProgress,
  stroke = C.ink, fill = C.paper, accent = C.coral, style,
}) => (
  <svg
    viewBox={`0 0 ${PAPER_FIBER_VB_W} ${PAPER_FIBER_VB_H}`}
    width={width} height={(width * PAPER_FIBER_VB_H) / PAPER_FIBER_VB_W}
    style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    shapeRendering="geometricPrecision"
  >
    {weaveProgress !== undefined ? (
      <WeaveLayer weaveProgress={weaveProgress} fill={fill} stroke={stroke} />
    ) : null}

    {creaseProgress !== undefined ? (
      <g>
        <line
          x1={CREASE_X} y1={30} x2={CREASE_X} y2={PAPER_FIBER_VB_H - 30}
          stroke={stroke} strokeWidth={3} strokeDasharray="4 12" opacity={0.22}
        />
        {mode === 'multi'
          ? MULTI_FIBERS.map((fb, i) => (
            <Chevron
              key={i} x1={MULTI_X1} x2={MULTI_X2} baseY={fb.y} bendDepth={MULTI_BEND}
              p={clamp01(creaseProgress)} damage={fb.damage} strokeWidth={20} stroke={stroke} accent={accent}
            />
          ))
          : (
            <>
              <Chevron
                x1={SINGLE_X1} x2={SINGLE_X2} baseY={SINGLE_BASE_Y} bendDepth={SINGLE_BEND}
                p={clamp01(creaseProgress)} damage="both" extra={pressProgress ?? 0}
                strokeWidth={34} stroke={stroke} accent={accent}
              />
              {pressProgress !== undefined ? (
                <NailPress
                  vx={CREASE_X}
                  vy={SINGLE_BASE_Y - SINGLE_BEND * clamp01(creaseProgress)}
                  pressProgress={pressProgress}
                  stroke={stroke}
                />
              ) : null}
            </>
          )}
      </g>
    ) : null}

    {springBackProgress !== undefined ? (
      <g>
        <Chevron
          x1={90} x2={280} baseY={340} bendDepth={90}
          p={1 - clamp01(springBackProgress)} damage="none"
          strokeWidth={22} stroke={stroke} accent={accent}
        />
        <Chevron
          x1={360} x2={550} baseY={340} bendDepth={90}
          p={1} damage="both"
          strokeWidth={22} stroke={stroke} accent={accent}
        />
      </g>
    ) : null}
  </svg>
);

export default PaperFiberDiagram;
