/** "긴장하면 손에 땀이 나는 이유"(general-ep69) 신설 소품. REGISTRY 3절 확인 완료 -
 *  47화 CheekFlushDiagram·40화 SensoryConflictDiagram·8화 GoosebumpDiagram을 먼저 살펴봤지만
 *  전부 얼굴 오버레이거나 피부 단면 소재라, "손바닥/발바닥에만 땀샘 밀도가 높고 그중 일부는
 *  온도가 아니라 긴장에만 반응하는 별도 종류"라는 밀도+종류 구분을 보여줄 자산이 없었다.
 *
 *  `mode`로 4가지 화면을 한 컴포넌트에 묶는다(GoosebumpDiagram처럼 여러 레이어를 독립
 *  progress로 받되, 여기서는 화면 구성 자체가 서로 달라 discriminator를 추가했다):
 *   - 'hand'(s2·s3): 손바닥 실루엣(점묘) + 팔뚝 참고 패널(점묘, 항상 더 성김)을 나란히.
 *     `densityProgress`(0~1)가 오르면 두 패널의 점이 정해진 순서로 팝인(점 밀도 차이를
 *     그대로 보여줌 - 손바닥엔 많이, 팔뚝엔 적게). `typeHighlight`(0~1)가 오르면 손바닥
 *     점의 1/3(고정 인덱스)만 코랄(긴장 반응 땀샘)로 물들고 나머지와 팔뚝 점은 계속
 *     중립색(inkSoft, 온도 반응 땀샘)으로 남는다 - "손바닥에만 긴장 전용 땀샘이 섞여
 *     있다"를 팔뚝과의 대비로 보여준다.
 *   - 'body'(s4): 전신 실루엣(머리+몸통+팔다리, GoosebumpDiagram과 같은 원칙으로 관절·
 *     근육을 그리지 않고 캡슐 도형만 사용). `densityProgress`로 몸 전체에 중립색(inkSoft,
 *     온도 반응 땀샘) 점이 고르게 팝인하고, `typeHighlight`로 손끝·발끝 4곳에만 코랄
 *     점 무리가 추가로 팝인하며, 머리(뇌)에서 오른손 끝까지 굵은 코랄 신호선이
 *     dash-reveal된다("신호가 뇌에서 손으로 이어지는 경로" - 오케스트레이터 지시).
 *   - 'ancestor'(s5·s6): 나뭇가지를 붙잡은 조상 실루엣. `ancestorProgress`로 실루엣이
 *     먼저 팝인하고(0~0.4), 그다음 잡은 손 위에 큰 물방울 2개가 팝인한다(0.5~1) - 작은
 *     점을 여러 개 뿌리지 않고 큰 물방울로만 표현한다(오케스트레이터 지시,
 *     "신체 표현은 최소한으로" 원칙과 동일 이유).
 *   - 'polygraph'(s7): 거짓말탐지기 미니 다이어그램(본체+화면 그래프+클립). 손가락을
 *     그리지 않고 클립 아이콘만으로 "손끝에 잰다"를 표현한다. `polygraphProgress`로
 *     본체가 팝인하고 화면 속 그래프 선이 dash-reveal되며 막판에 뾰족한 스파이크가 튄다.
 *
 *  점은 Math.random 없이 인덱스 기반 고정 배열로 배치한다(원칙 3). 색은 `SweatDroplet`
 *  (큰 물방울, ancestor/모던 크로스페이드 양쪽에서 재사용)을 별도 export해 s6에서 캐릭터
 *  손 옆에도 그대로 쓸 수 있게 했다.
 *
 *  "몸 전체에 반응하는 신호와 특정 부위에만 반응하는 별도 신호가 공존한다"는 구조를 갖는
 *  다른 소재(체온 조절 vs 국소 반응 전반) 재사용 가능성이 있어 에피소드 로컬이 아니라
 *  여기 등록한다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
/** 인덱스 o(0..N-1)가 순서대로 팝인하는 결정론적 스태거 - Math.random 없이 배열 순서만 쓴다. */
function staggerReveal(order: number, count: number, p: number) {
  const start = order / count;
  const span = 1.4 / count;
  return smooth((p - start) / span);
}

export const PALM_SWEAT_VB_W = 840;
export const PALM_SWEAT_VB_H = 680;

export interface PalmSweatDiagramProps {
  width: number;
  x?: number;
  y?: number;
  mode?: 'hand' | 'body' | 'ancestor' | 'polygraph';
  /** hand: 손바닥+팔뚝 점 밀도 팝인 / body: 전신 온도 반응 땀샘(중립색) 점 팝인 */
  densityProgress?: number;
  /** hand: 손바닥 점 일부가 코랄(긴장 반응 땀샘)로 물듦 / body: 손발 끝 코랄 점 무리 + 신호선 */
  typeHighlight?: number;
  /** ancestor: 실루엣 등장 -> 큰 물방울 2개 등장 */
  ancestorProgress?: number;
  /** polygraph: 본체 등장 -> 그래프 dash-reveal -> 스파이크 */
  polygraphProgress?: number;
  stroke?: string;
  fill?: string;
  /** 긴장 반응 땀샘 / 신호선 색 */
  accent?: string;
  /** 온도 반응 땀샘(중립) 색 */
  neutral?: string;
  style?: React.CSSProperties;
}

/* ---------------- 큰 물방울 (점묘 아님) ----------------
 * teardrop 도형 자체는 `dropletShape()`로 공유한다. 이 소품은 두 컨텍스트에서 쓰인다:
 *  (1) 이미 <svg> 안(PalmSweatDiagram 자체의 ancestor 모드)에서 <g> 로만 - 아래
 *      `dropletShape()`를 직접 호출.
 *  (2) HTML/div 컨텍스트(scenes.tsx에서 Actor 같은 div 기반 캐릭터 옆에 화면 절대좌표로
 *      배치)에서 - 아래 `SweatDroplet`(자체 <svg> 래퍼 포함)을 호출.
 *  <svg> 안에 position:absolute 자식 <svg>를 중첩하면 CSS 위치가 무시되는 결함
 *  (21화 이후 반복된 결함 A절)을 피하려고 이렇게 나눴다 - SweatDroplet을
 *  PalmSweatDiagram 내부의 <svg> 안에서는 절대 쓰지 않는다.
 */
function dropletShape(w: number, h: number, stroke: string, fill: string) {
  return (
    <>
      <path
        d={`M ${w / 2} 0
            C ${w * 0.1} ${h * 0.42} 0 ${h * 0.6} 0 ${h * 0.76}
            A ${w / 2} ${w / 2} 0 0 0 ${w} ${h * 0.76}
            C ${w} ${h * 0.6} ${w * 0.9} ${h * 0.42} ${w / 2} 0 Z`}
        fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.75} strokeLinejoin="round"
      />
      <ellipse cx={w * 0.36} cy={h * 0.62} rx={w * 0.1} ry={w * 0.16} fill={C.paper} opacity={0.75} />
    </>
  );
}

/** PalmSweatDiagram 자체 <svg> 안에서만 쓰는 내부 헬퍼(<g> 반환, svg 래퍼 없음). */
function DropletGroup({
  cx, cy, size, opacity,
}: { cx: number; cy: number; size: number; opacity: number }) {
  if (opacity <= 0.005) return null;
  const w = size;
  const h = size * 1.3;
  return (
    <g transform={`translate(${cx - w / 2} ${cy - h})`} opacity={opacity}>
      {dropletShape(w, h, C.ink, C.water)}
    </g>
  );
}

export interface SweatDropletProps {
  /** 화면 절대좌표 중심 x (물방울 아래쪽 뾰족한 끝이 아니라 전체 도형의 가로 중심) */
  x: number;
  /** 화면 절대좌표, 물방울 아래쪽 끝 y */
  y: number;
  size: number;
  opacity?: number;
  stroke?: string;
  fill?: string;
}

/** 독립 배치용(HTML/div 컨텍스트). 자체 <svg>로 완전히 감싸 position:absolute 로 화면에 놓는다
 *  - Actor(div 기반 캐릭터) 옆에 땀방울을 붙일 때 이걸 쓴다(scenes.tsx 등). */
export const SweatDroplet: React.FC<SweatDropletProps> = ({
  x, y, size, opacity = 1, stroke = C.ink, fill = C.water,
}) => {
  if (opacity <= 0.005) return null;
  const w = size;
  const h = size * 1.3;
  return (
    <svg
      width={w} height={h}
      style={{ position: 'absolute', left: x - w / 2, top: y - h, overflow: 'visible' }}
    >
      {dropletShape(w, h, stroke, fill)}
    </svg>
  );
};

/* ---------------- hand 모드 좌표·점 배열 ---------------- */

const HAND_CX = 260;
const HAND_CY = 380;
const PALM_TOP = HAND_CY - 60;
const FA_CX = 630;
const FA_CY = 390;

const FINGERS = [
  { dx: -55, len: 100 }, { dx: -18, len: 122 }, { dx: 18, len: 110 }, { dx: 55, len: 84 },
];

const PALM_DOTS = Array.from({ length: 24 }).map((_, i) => {
  const col = i % 6;
  const row = Math.floor(i / 6);
  const jitterX = (i % 2 === 0 ? 1 : -1) * 3;
  const jitterY = ((i * 7) % 5) - 2;
  return {
    dx: -63 + col * 25 + jitterX,
    dy: -40 + row * 32 + jitterY,
    tension: i % 3 === 0,
    order: i,
  };
});

const FOREARM_DOTS = [
  { dx: -52, dy: -92 }, { dx: 4, dy: -98 }, { dx: 55, dy: -86 },
  { dx: -38, dy: -18 }, { dx: 32, dy: -12 },
  { dx: -14, dy: 55 }, { dx: 42, dy: 60 },
].map((d, i) => ({ ...d, order: i }));

/* ---------------- body 모드 좌표·점 배열 ---------------- */

const BODY_CX = 420;
const HEAD_CY = 148;
const HEAD_R = 44;
const TORSO_Y = 195;
const TORSO_H = 190;
const L_HAND = { x: BODY_CX - 196, y: 330 };
const R_HAND = { x: BODY_CX + 196, y: 330 };
const L_FOOT = { x: BODY_CX - 72, y: 600 };
const R_FOOT = { x: BODY_CX + 72, y: 600 };
const L_SHOULDER = { x: BODY_CX - 50, y: TORSO_Y + 14 };
const R_SHOULDER = { x: BODY_CX + 50, y: TORSO_Y + 14 };
const L_HIP = { x: BODY_CX - 28, y: TORSO_Y + TORSO_H - 6 };
const R_HIP = { x: BODY_CX + 28, y: TORSO_Y + TORSO_H - 6 };

function alongLine(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

const BODY_DOTS = (() => {
  const pts: { x: number; y: number }[] = [];
  // 머리
  pts.push({ x: BODY_CX - 16, y: HEAD_CY - 6 }, { x: BODY_CX + 14, y: HEAD_CY + 10 });
  // 몸통 3x3
  for (let r = 0; r < 3; r += 1) {
    for (let cIdx = 0; cIdx < 3; cIdx += 1) {
      pts.push({
        x: BODY_CX - 34 + cIdx * 34,
        y: TORSO_Y + 40 + r * 55,
      });
    }
  }
  // 팔 (각 3점, 손끝 제외)
  [0.28, 0.52, 0.76].forEach((t) => pts.push(alongLine(L_SHOULDER, L_HAND, t)));
  [0.28, 0.52, 0.76].forEach((t) => pts.push(alongLine(R_SHOULDER, R_HAND, t)));
  // 다리 (각 3점, 발끝 제외)
  [0.3, 0.55, 0.8].forEach((t) => pts.push(alongLine(L_HIP, L_FOOT, t)));
  [0.3, 0.55, 0.8].forEach((t) => pts.push(alongLine(R_HIP, R_FOOT, t)));
  return pts.map((p, i) => ({ ...p, order: i }));
})();

const HANDFOOT_CLUSTERS = [L_HAND, R_HAND, L_FOOT, R_FOOT];
const HANDFOOT_DOTS = (() => {
  const pts: { x: number; y: number; order: number }[] = [];
  let order = 0;
  HANDFOOT_CLUSTERS.forEach((center) => {
    const offsets = [
      { dx: 0, dy: -10 }, { dx: -14, dy: 10 }, { dx: 14, dy: 10 },
    ];
    offsets.forEach((o) => {
      pts.push({ x: center.x + o.dx, y: center.y + o.dy, order });
      order += 1;
    });
  });
  return pts;
})();

/* ---------------- 렌더 헬퍼 ---------------- */

function Dot({
  cx, cy, r, color, opacity,
}: { cx: number; cy: number; r: number; color: string; opacity: number }) {
  if (opacity <= 0.005) return null;
  return <circle cx={cx} cy={cy} r={r} fill={color} opacity={opacity} />;
}

export const PalmSweatDiagram: React.FC<PalmSweatDiagramProps> = ({
  width, x = 0, y = 0, mode = 'hand',
  densityProgress = 0, typeHighlight = 0, ancestorProgress = 0, polygraphProgress = 0,
  stroke = C.ink, fill = C.paper, accent = C.coral, neutral = C.inkSoft, style,
}) => {
  const dP = clamp01(densityProgress);
  const tP = clamp01(typeHighlight);
  const aP = clamp01(ancestorProgress);
  const pP = clamp01(polygraphProgress);

  return (
    <svg
      viewBox={`0 0 ${PALM_SWEAT_VB_W} ${PALM_SWEAT_VB_H}`}
      width={width}
      height={(width * PALM_SWEAT_VB_H) / PALM_SWEAT_VB_W}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {mode === 'hand' && (
        <g>
          {/* 손바닥 실루엣 */}
          <g>
            {FINGERS.map((f, i) => (
              <rect
                key={i}
                x={HAND_CX + f.dx - 15} y={PALM_TOP - f.len + 16} width={30} height={f.len} rx={15}
                fill={fill} stroke={stroke} strokeWidth={SW_THIN}
              />
            ))}
            {/* 엄지 */}
            <rect
              x={HAND_CX - 100} y={HAND_CY - 6} width={32} height={82} rx={16}
              fill={fill} stroke={stroke} strokeWidth={SW_THIN}
              transform={`rotate(-42 ${HAND_CX - 84} ${HAND_CY + 30})`}
            />
            <rect
              x={HAND_CX - 85} y={PALM_TOP} width={170} height={140} rx={44}
              fill={fill} stroke={stroke} strokeWidth={SW_THIN}
            />
            <rect
              x={HAND_CX - 52} y={PALM_TOP + 138} width={104} height={64} rx={18}
              fill={fill} stroke={stroke} strokeWidth={SW_THIN}
            />
          </g>
          {/* 팔뚝 참고 패널 */}
          <rect
            x={FA_CX - 100} y={FA_CY - 130} width={200} height={260} rx={54}
            fill={fill} stroke={stroke} strokeWidth={SW_THIN} opacity={0.9}
          />

          {PALM_DOTS.map((d) => {
            const reveal = staggerReveal(d.order, PALM_DOTS.length, dP);
            const color = d.tension ? (accent) : neutral;
            const colorMix = d.tension ? lerp(0, 1, tP) : 0;
            const r = 8 + (d.tension ? colorMix * 3 : 0);
            return (
              <Dot
                key={d.order}
                cx={HAND_CX + d.dx} cy={HAND_CY + d.dy} r={r}
                color={d.tension && colorMix > 0.02 ? color : neutral}
                opacity={reveal}
              />
            );
          })}
          {FOREARM_DOTS.map((d) => (
            <Dot
              key={d.order}
              cx={FA_CX + d.dx} cy={FA_CY + d.dy} r={7}
              color={neutral}
              opacity={staggerReveal(d.order, FOREARM_DOTS.length, dP)}
            />
          ))}
        </g>
      )}

      {mode === 'body' && (
        <g>
          <circle cx={BODY_CX} cy={HEAD_CY} r={HEAD_R} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
          <rect x={BODY_CX - 58} y={TORSO_Y} width={116} height={TORSO_H} rx={46} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
          <line x1={L_SHOULDER.x} y1={L_SHOULDER.y} x2={L_HAND.x} y2={L_HAND.y} stroke={stroke} strokeWidth={26} strokeLinecap="round" />
          <line x1={R_SHOULDER.x} y1={R_SHOULDER.y} x2={R_HAND.x} y2={R_HAND.y} stroke={stroke} strokeWidth={26} strokeLinecap="round" />
          <line x1={L_HIP.x} y1={L_HIP.y} x2={L_FOOT.x} y2={L_FOOT.y} stroke={stroke} strokeWidth={30} strokeLinecap="round" />
          <line x1={R_HIP.x} y1={R_HIP.y} x2={R_FOOT.x} y2={R_FOOT.y} stroke={stroke} strokeWidth={30} strokeLinecap="round" />
          <circle cx={L_HAND.x} cy={L_HAND.y} r={20} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
          <circle cx={R_HAND.x} cy={R_HAND.y} r={20} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
          <circle cx={L_FOOT.x} cy={L_FOOT.y} r={22} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
          <circle cx={R_FOOT.x} cy={R_FOOT.y} r={22} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />

          {BODY_DOTS.map((d) => (
            <Dot
              key={d.order}
              cx={d.x} cy={d.y} r={8}
              color={neutral}
              opacity={staggerReveal(d.order, BODY_DOTS.length, dP)}
            />
          ))}

          {/* 뇌 -> 오른손 굵은 신호선 (dash-reveal) */}
          <path
            d={`M ${BODY_CX + 8} ${HEAD_CY + 30} Q ${BODY_CX + 120} ${TORSO_Y + 60} ${R_HAND.x} ${R_HAND.y}`}
            fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round"
            strokeDasharray={340} strokeDashoffset={340 * (1 - smooth(tP))}
            opacity={tP > 0.02 ? 1 : 0}
          />

          {HANDFOOT_DOTS.map((d) => (
            <Dot
              key={d.order}
              cx={d.x} cy={d.y} r={11}
              color={accent}
              opacity={staggerReveal(d.order, HANDFOOT_DOTS.length, tP)}
            />
          ))}
        </g>
      )}

      {mode === 'ancestor' && aP > 0.005 && (() => {
        const popP = smooth(clamp01(aP / 0.4));
        const dropP = smooth(clamp01((aP - 0.5) / 0.5));
        const ax = 330;
        const ay = 470;
        return (
          <g opacity={popP} transform={`translate(${ax} ${ay}) scale(${0.7 + 0.3 * popP})`}>
            {/* 나뭇가지 */}
            <line x1={70} y1={-330} x2={330} y2={-190} stroke={C.browning} strokeWidth={22} strokeLinecap="round" />
            {/* 조상 실루엣 - 몸통+다리 */}
            <circle cx={0} cy={-140} r={40} fill={C.inkSoft} />
            <path
              d="M -34 -104 C -50 -60 -46 20 -30 90 L -50 220 L -14 220 L 6 100 L 24 100 L 44 220 L 80 220 L 58 60 C 62 0 46 -70 34 -104 Z"
              fill={C.inkSoft}
            />
            {/* 뻗어 가지를 잡은 팔 */}
            <path d="M 24 -110 Q 120 -170 190 -220" stroke={C.inkSoft} strokeWidth={30} fill="none" strokeLinecap="round" />
            <circle cx={196} cy={-224} r={22} fill={C.inkSoft} />
            {/* 큰 물방울 2개 - 잡은 손 위 */}
            <DropletGroup cx={196} cy={-256} size={30} opacity={dropP} />
            <DropletGroup cx={222} cy={-236} size={24} opacity={dropP * 0.9} />
          </g>
        );
      })()}

      {mode === 'polygraph' && pP > 0.005 && (() => {
        const popP = smooth(clamp01(pP / 0.35));
        const graphP = smooth(clamp01((pP - 0.25) / 0.55));
        const spikeP = clamp01((pP - 0.75) / 0.25);
        const cx = 420;
        const cy = 380;
        return (
          <g opacity={popP} transform={`translate(${cx} ${cy}) scale(${0.75 + 0.25 * popP})`}>
            {/* 본체 */}
            <rect x={-170} y={-90} width={280} height={190} rx={28} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
            {/* 화면 */}
            <rect x={-146} y={-64} width={232} height={100} rx={14} fill={C.sky} stroke={stroke} strokeWidth={SW_THIN * 0.8} />
            <path
              d={`M ${-130} ${10} L ${-90} ${10} L ${-70} ${-20} L ${-50} ${28} L ${-20} ${-30 - spikeP * 40} L ${10} ${18} L ${60} ${8} L ${80} ${8}`}
              fill="none" stroke={accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={320} strokeDashoffset={320 * (1 - graphP)}
            />
            {/* 표시등 */}
            <circle cx={90} cy={-70} r={10} fill={pP > 0.7 ? accent : neutral} />
            {/* 클립으로 이어지는 선 + 클립(손가락을 그리지 않고 클립만) */}
            <path d="M 110 40 Q 190 60 250 30" fill="none" stroke={stroke} strokeWidth={7} strokeDasharray={220} strokeDashoffset={220 * (1 - popP)} />
            <g transform="translate(258 22)">
              <path d="M -8 -30 Q 30 -30 30 0 Q 30 30 -8 30" fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
              <circle cx={-8} cy={-30} r={9} fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.8} />
              <circle cx={-8} cy={30} r={9} fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.8} />
            </g>
          </g>
        );
      })()}
    </svg>
  );
};

export default PalmSweatDiagram;
