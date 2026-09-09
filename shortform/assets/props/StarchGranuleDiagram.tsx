/** "쌀알 속 전분 알갱이가 물과 열을 만나 부풀어서 말랑해지고, 식으면 다시 단단하게 뭉치며
 *  머금었던 물을 밀어낸다"는 전분 팽윤(swelling) + 노화(retrogradation) 구조를 보여주는
 *  쌀알 확대 단면 다이어그램(general-ep71, 식은 밥이 딱딱해지는 이유). REGISTRY 확인 완료 -
 *  DoughDiagram(general-ep27, 발효로 기체가 그물에 갇혀 부피가 커지는 구조)과
 *  WetSoilAerosolDiagram(general-ep26, 충격으로 갇힌 것이 방출되는 구조)을 먼저 검토했으나
 *  둘 다 "같은 입자가 물을 먹고 커졌다가 식으며 다시 줄어들고 물을 내보낸다"는 왕복 구조
 *  자체는 다루지 않아 새로 만들었다. CellMergeDiagram·SaltCycleDiagram과 같은 원칙(독립
 *  progress, 이전 단계가 1인 상태를 전제로 이어받음, undefined/0이면 그 레이어를 안 그림)을
 *  따른다.
 *
 *  "신체 표현은 최소한으로/작은 점을 여러 개 뿌리지 않는다" 원칙에 따라 전분 알갱이는
 *  큰 원 3개로만, 물방울·물이 빠져나가는 표시는 점 무리 대신 큼직한 물방울 도형과 굵은
 *  화살표 2~3개로만 그린다(오케스트레이터 지시 - "물결선이나 화살표로 표현, 작은 점 금지").
 *
 *   - swellProgress      : 0~1. 물방울 2개가 위에서 떨어져 알갱이에 흡수되고(0~0.4), 열
 *     화살표가 아래에서 올라오며(0.1~0.6), 전분 알갱이 3개가 작고 단단한 상태에서 크고
 *     말랑한(반투명) 상태로 부푼다(0.25~1). s2용.
 *   - retrogradeProgress : 0~1. swellProgress=1(알갱이가 이미 부푼 상태)을 전제로, 알갱이가
 *     다시 조여들어 작아지고(0~0.55) 서로 살짝 가까워지며 뭉치고(0~0.6), 각 알갱이에서 큰
 *     물 화살표가 바깥으로 빠져나간다(0.15~1, 알갱이별 시차). 이 단계에서는 swellProgress의
 *     물방울·열 표시가 함께 옅어져 사라진다("이제 식는 중"이라는 국면 전환). s3용.
 *  전부 undefined/0이면 "물기 없이 작고 단단한 전분 알갱이 3개가 든 쌀알 단면"만 보이는
 *  정지 다이어그램이 된다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const STARCH_VB_W = 700;
export const STARCH_VB_H = 700;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255; const ag = (pa >> 8) & 255; const ab = pa & 255;
  const br = (pb >> 16) & 255; const bg = (pb >> 8) & 255; const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
};

/** 쌀알 단면 윤곽 - 위아래로 길쭉한 캡슐형(참고 이미지 없이 손으로 그린 단순 도형이라
 *  원칙 0-1 벡터화 대상이 아니다) */
const GRAIN_D = `
  M 350,80
  C 460,80 520,220 520,380
  C 520,560 460,650 350,650
  C 240,650 180,560 180,380
  C 180,220 240,80 350,80
  Z
`;

/** 전분 알갱이 3개 자리 + 물이 빠져나가는(retrograde) 방향 */
const GRANULES = [
  { x: 300, y: 300, outDx: -180, outDy: -120 },
  { x: 420, y: 320, outDx: 180, outDy: -100 },
  { x: 355, y: 470, outDx: 0, outDy: 230 },
];
const GRANULE_CENTER = { x: 358, y: 363 };

const R_FIRM = 54;
const R_SWELL = 108;
const R_HARD = 64;

/** 물방울(낙하용) - 위쪽 두 알갱이를 향해 떨어진다 */
const DROP_IN = [
  { fromX: 278, fromY: 90, toX: 300, toY: 252 },
  { fromX: 434, fromY: 100, toX: 420, toY: 268 },
];

function teardrop(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy - r * 1.3}
    C ${cx + r} ${cy - r * 0.2} ${cx + r} ${cy + r * 0.7} ${cx} ${cy + r}
    C ${cx - r} ${cy + r * 0.7} ${cx - r} ${cy - r * 0.2} ${cx} ${cy - r * 1.3}
    Z`;
}

function arrowHead(tipX: number, tipY: number, dirX: number, dirY: number, size: number) {
  const len = Math.hypot(dirX, dirY) || 1;
  const ux = dirX / len; const uy = dirY / len;
  const px = -uy; const py = ux;
  const backX = tipX - ux * size; const backY = tipY - uy * size;
  return `M ${tipX} ${tipY} L ${backX + px * size * 0.6} ${backY + py * size * 0.6} L ${backX - px * size * 0.6} ${backY - py * size * 0.6} Z`;
}

export interface StarchGranuleDiagramProps {
  /** 화면상 폭(px). viewBox(700x700) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 물+열을 만나 알갱이가 부풀어 말랑해지는 진행도. s2용 */
  swellProgress?: number;
  /** 0~1. swellProgress=1을 전제로, 식으며 다시 조여들고 물을 밀어내는 진행도. s3용 */
  retrogradeProgress?: number;
  stroke?: string;
  grainColor?: string;
  granuleFirmColor?: string;
  granuleSoftColor?: string;
  granuleHardColor?: string;
  waterColor?: string;
  heatColor?: string;
  style?: React.CSSProperties;
}

export const StarchGranuleDiagram: React.FC<StarchGranuleDiagramProps> = ({
  width, x = 0, y = 0, swellProgress = 0, retrogradeProgress = 0,
  stroke = C.ink, grainColor = C.goldSoft,
  granuleFirmColor = C.gold, granuleSoftColor = C.paper, granuleHardColor = C.browningSoft,
  waterColor = C.waterCool, heatColor = C.coral, style,
}) => {
  const height = (width * STARCH_VB_H) / STARCH_VB_W;
  const swellP = clamp01(swellProgress);
  const retroP = clamp01(retrogradeProgress);

  // swell 하위 단계
  const dropletP = clamp01(swellP / 0.4);
  const heatP = clamp01((swellP - 0.1) / 0.5);
  const growP = smooth(clamp01((swellP - 0.25) / 0.75));

  // retrograde 하위 단계 (swellP=1 전제)
  const contractP = smooth(clamp01(retroP / 0.55));
  const pullP = smooth(clamp01(retroP / 0.6));
  // 냉각이 시작되면 물방울·열 표시는 옅어져 사라진다
  const coolFade = 1 - retroP;

  const baseR = lerp(R_FIRM, R_SWELL, growP);
  const curR = lerp(baseR, R_HARD, contractP);
  const baseColor = lerpColor(granuleFirmColor, granuleSoftColor, growP);
  const curColor = lerpColor(baseColor, granuleHardColor, contractP);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${STARCH_VB_W} ${STARCH_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 쌀알 단면 */}
        <path d={GRAIN_D} fill={grainColor} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />

        {/* 열 화살표 - 아래에서 위로 (냉각 시작되면 옅어짐) */}
        {heatP > 0.01 ? (
          <g opacity={heatP * coolFade}>
            <path
              d={`M 350,660 C 322,580 378,520 350,470 C 322,420 378,380 350,340`}
              fill="none" stroke={heatColor} strokeWidth={SW_THIN} strokeLinecap="round"
            />
            <path d={arrowHead(350, 320, 0, -40, 26)} fill={heatColor} stroke={stroke} strokeWidth={SW_THIN * 0.5} />
          </g>
        ) : null}

        {/* 물방울 낙하 (흡수) */}
        {dropletP > 0.01 ? DROP_IN.map((d, i) => {
          const local = clamp01((dropletP - i * 0.15) / (1 - i * 0.15));
          if (local <= 0.01) return null;
          const fade = local > 0.75 ? 1 - (local - 0.75) / 0.25 : 1;
          const cx = lerp(d.fromX, d.toX, local);
          const cy = lerp(d.fromY, d.toY, local);
          return (
            <path
              key={i} d={teardrop(cx, cy, 22)} fill={waterColor} stroke={stroke}
              strokeWidth={SW_THIN * 0.6} opacity={fade * coolFade}
            />
          );
        }) : null}

        {/* 전분 알갱이 3개 - 부풀었다가(swell) 다시 조여들며 뭉친다(retrograde) */}
        {GRANULES.map((g, i) => {
          const gx = lerp(g.x, GRANULE_CENTER.x, pullP * 0.16);
          const gy = lerp(g.y, GRANULE_CENTER.y, pullP * 0.16);
          return (
            <circle
              key={i} cx={gx} cy={gy} r={curR} fill={curColor} stroke={stroke}
              strokeWidth={SW_THIN} opacity={0.96}
            />
          );
        })}

        {/* 물이 빠져나가는 큰 화살표 3개 (retrograde 전용, 알갱이별 시차) */}
        {retroP > 0.01 ? GRANULES.map((g, i) => {
          const local = clamp01((retroP - 0.15 - i * 0.12) / (1 - 0.15 - i * 0.12));
          if (local <= 0.01) return null;
          const gx = lerp(g.x, GRANULE_CENTER.x, pullP * 0.16);
          const gy = lerp(g.y, GRANULE_CENTER.y, pullP * 0.16);
          const tipX = gx + g.outDx * local;
          const tipY = gy + g.outDy * local;
          const fade = local > 0.7 ? 1 - (local - 0.7) / 0.3 : 1;
          return (
            <g key={`out${i}`} opacity={fade}>
              <path
                d={`M ${gx} ${gy} Q ${gx + g.outDx * 0.5} ${gy + g.outDy * 0.5 - 20} ${tipX} ${tipY}`}
                fill="none" stroke={waterColor} strokeWidth={SW_THIN * 1.1} strokeLinecap="round"
              />
              <path
                d={arrowHead(tipX, tipY, g.outDx, g.outDy, 24)}
                fill={waterColor} stroke={stroke} strokeWidth={SW_THIN * 0.5}
              />
            </g>
          );
        }) : null}
      </svg>
    </div>
  );
};

export default StarchGranuleDiagram;
