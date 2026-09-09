/** "식물 세포 안에는 중력이 어느 쪽인지 감지하는 작은 부분이 있고, 그 신호로 성장호르몬
 *  (옥신)이 한쪽으로 몰리면서 뿌리는 아래로·줄기는 위로 자라는 방향이 정해진다"는 인과를
 *  보여주는 다이어그램(나무가 위로만 곧게 자라는 이유, general-ep96).
 *
 *  78화 SunflowerTrackingDiagram과 같은 설계 원칙(독립 레이어, 값을 안 주면 그 레이어는
 *  그리지 않는다)을 따르되, 이 화의 핵심은 "손으로 방향을 지정하지 않고 중력에서 직접
 *  계산한다"는 점이다(오케스트레이터 지시 - 78화가 줄기 기울기를 해의 위치에서 삼각함수로
 *  직접 계산해 방향 오류를 구조적으로 차단한 방식을 그대로 따름):
 *
 *   - 화면 좌표계에서 "true 아래"는 항상 angleDeg=180, "true 위"는 항상 angleDeg=0으로
 *     고정한다(SunflowerIcon과 동일한 각도 표기 - 0=위, 90=오른쪽, 180=아래, -90=왼쪽,
 *     dx=sin(rad)*len, dy=-cos(rad)*len).
 *   - `potTiltDeg`(기본 180=똑바로 심음)는 씨앗이 "처음에 어느 방향으로 놓였는지"만
 *     결정한다. 뿌리 극(radicle)의 초기 방향이 potTiltDeg, 줄기 극(plumule)의 초기 방향은
 *     그 반대(potTiltDeg+180)다. **뿌리·줄기가 최종적으로 수렴하는 각도는 potTiltDeg와
 *     무관하게 코드에 상수로 고정돼 있다** - 뿌리는 항상 180(true down), 줄기는 항상
 *     0(true up)으로 lerpAngleShortest 를 통해 보간된다. 즉 potTiltDeg 를 어떤 값으로
 *     넘겨도(똑바로/눕힘/뒤집힘) 다 자란 시점의 방향은 손으로 지정할 필요 없이 항상 같은
 *     결과가 나온다 - 이게 "방향 오류를 구조적으로 차단"한다는 뜻이다.
 *
 *  세 가지 독립 모드(각각 undefined 면 그 모드로 렌더하지 않는다, Sunflower와 동일 패턴):
 *   - growProgress(0~1)      : 기본 모드. 0~0.3=씨앗 속 감지 기관(작은 점)이 항상 true
 *     down 쪽(potTiltDeg 와 무관)으로 자리잡는 구간(감지), 0.3~1=뿌리는 potTiltDeg ->
 *     180으로, 줄기는 (potTiltDeg+180) -> 0으로 굽어가며 자라는 구간(방향 결정).
 *     `gravityArrow`(bool)를 같이 주면 화면 기준 고정 아래쪽 화살표를 그린다(s3).
 *     `auxinProgress`(0~1)를 같이 주면 growProgress=1(다 자란 직립) 상태를 전제로, 줄기
 *     아래쪽(중력 쪽)에 호르몬 입자가 몰리며 줄기가 아주 살짝 치우친 각도에서 완전한
 *     true up으로 마저 교정되는 강조 애니메이션을 겹쳐 그린다(s5, "옥신" 라벨용
 *     AUXIN_LABEL_PT 는 potTiltDeg=180 기본값 기준 좌표).
 *   - microgravityConfused(0~1) : 독립 모드. 뿌리·줄기가 true up/down 으로 수렴하지 못하고
 *     여러 방향으로 흔들리기만 한다(중력이 거의 없는 우주정거장, s7). progress 자체가
 *     frame 에서 결정적으로 파생되므로 sin(progress*...) 도 여전히 결정적이다(원칙 3).
 *   - tiltCorrectProgress(0~1)  : 독립 모드. 이미 potTiltDeg 방향으로 자란 뿌리·줄기의
 *     "밑동"은 그대로 두고(기울어진 하부), 그 끝에서 이어지는 새 성장분이 true up(줄기)/
 *     true down(뿌리)으로 다시 굽어가는 과정을 그린다(화분이 기울어진 뒤에도 결국 곧게
 *     서는 모습, s8). 밑동과 지면선은 potTiltDeg 그대로 유지된다 - "기울어진 채로 시작한
 *     부분은 안 바뀌고, 그 다음에 자란 부분만 다시 위로 향한다"는 실제 굴지성 재교정과
 *     같은 그림이다.
 *
 *  씨앗·뿌리·줄기는 전부 단순 도형(타원 씨앗, 곡선 뿌리/줄기, 짧은 잎 2장)으로만 그리고
 *  점 텍스처를 촘촘히 뿌리지 않는다(신체 표현 관련 채널 원칙과 같은 취지 - 반복되는 작은
 *  요소 금지, 옥신 입자도 5~6개로 제한).
 *
 *  GravitropismTree 는 s1(무성 - 기울어진 언덕 위 나무들이 다 위로 곧게 뻗은 모습)에서
 *  쓰는 단순 나무 실루엣이다. 몸통을 "밑동은 기울어진 방향, 꼭대기는 항상 true up"으로
 *  향하는 3차 베지어로 그려 s1 자체가 이 화 전체의 결론(어느 쪽으로 기울어져도 결국 위로
 *  곧게 선다)을 무성으로 미리 보여준다. "나무가 자라며 기울어진 상태를 교정하는" 소재
 *  전반(계절·지형 변화 등)에서 재사용 가능성이 있어 별도 export.
 */
import React from 'react';
import { C, SW } from '../theme';
import { AUTUMN_GREEN } from './Leaf';

export const GRAV_VB_W = 560;
export const GRAV_VB_H = 640;
const CX = GRAV_VB_W / 2;
const CY = GRAV_VB_H * 0.55;

/** 각도 표기: 0=true up, 90=오른쪽, 180=true down, -90=왼쪽 (SunflowerIcon과 동일 규약) */
export const UP_DEG = 0;
export const DOWN_DEG = 180;

const ROOT_COLOR = '#8A5A2E';
const ROOT_COLOR_DARK = '#6E4522';
const STEM_COLOR = AUTUMN_GREEN;
const SEED_COLOR = '#D8B27C';
const AUXIN_COLOR = C.gold;

/** s5 "옥신" 라벨 고정 좌표 - potTiltDeg=180(기본, 똑바로 심긴 상태) 기준 */
export const AUXIN_LABEL_PT = { x: CX + 108, y: CY - 210 };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 최단 경로로 각도를 보간한다 (예: 350deg -> 10deg 가 340도가 아니라 20도만 돌게) */
function lerpAngleShortest(a: number, b: number, t: number): number {
  const diff = (((b - a + 540) % 360) + 360) % 360 - 180;
  return a + diff * t;
}

function pointAt(cx: number, cy: number, angleDeg: number, len: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + Math.sin(rad) * len, y: cy - Math.cos(rad) * len };
}

/** 씨앗 중심에서 initAngle 방향으로 살짝 굽어 나가다 curAngle 방향의 tip 으로 향하는 곡선 */
function curvedPath(cx: number, cy: number, initAngle: number, curAngle: number, len: number) {
  const tip = pointAt(cx, cy, curAngle, len);
  const mid = pointAt(cx, cy, initAngle, len * 0.52);
  return `M ${cx} ${cy} Q ${mid.x} ${mid.y} ${tip.x} ${tip.y}`;
}

/* ============================================================
 * GravitropismTree: 밑동은 기울어진 방향, 꼭대기는 항상 true up
 * ============================================================ */
export interface GravitropismTreeProps {
  /** 밑동(땅에 닿는 지점) 화면 좌표 */
  baseX: number;
  baseY: number;
  height?: number;
  /** 밑동이 기운 방향(도, 0=true up 그대로 - 안 기움). 크기가 클수록 초반에 더 눕는다 */
  baseLeanDeg?: number;
  trunkWidth?: number;
  canopyR?: number;
  canopyColor?: string;
  trunkColor?: string;
  stroke?: string;
  strokeWidth?: number;
}

export const GravitropismTree: React.FC<GravitropismTreeProps> = ({
  baseX, baseY, height = 260, baseLeanDeg = 0, trunkWidth = 20, canopyR = 66,
  canopyColor = STEM_COLOR, trunkColor = ROOT_COLOR_DARK, stroke = C.ink, strokeWidth = SW * 0.6,
}) => {
  const top = { x: baseX, y: baseY - height };
  const leanRad = (baseLeanDeg * Math.PI) / 180;
  const c1 = { x: baseX + Math.sin(leanRad) * height * 0.34, y: baseY - height * 0.16 };
  const c2 = { x: baseX, y: baseY - height * 0.78 };
  const path = `M ${baseX} ${baseY} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${top.x} ${top.y}`;

  return (
    <g>
      <path d={path} fill="none" stroke={trunkColor} strokeWidth={trunkWidth} strokeLinecap="round" />
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />
      <circle cx={top.x} cy={top.y - canopyR * 0.55} r={canopyR} fill={canopyColor} stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx={top.x - canopyR * 0.62} cy={top.y - canopyR * 0.18} r={canopyR * 0.68} fill={canopyColor} stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx={top.x + canopyR * 0.62} cy={top.y - canopyR * 0.18} r={canopyR * 0.68} fill={canopyColor} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
};

/* ============================================================
 * GravitropismDiagram
 * ============================================================ */
export interface GravitropismDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 씨앗이 처음에 놓인 방향(도, 뿌리 극 기준 - 기본 180=true down, 즉 똑바로 심은 상태).
   *  뿌리·줄기의 "최종" 방향 계산에는 관여하지 않는다(위 설계 노트 참고) */
  potTiltDeg?: number;
  growProgress?: number;
  gravityArrow?: boolean;
  auxinProgress?: number;
  microgravityConfused?: number;
  tiltCorrectProgress?: number;
  stroke?: string;
  style?: React.CSSProperties;
}

export const GravitropismDiagram: React.FC<GravitropismDiagramProps> = ({
  width, x = 0, y = 0, potTiltDeg = 180, growProgress, gravityArrow = false,
  auxinProgress, microgravityConfused, tiltCorrectProgress, stroke = C.ink, style,
}) => {
  const height = width * (GRAV_VB_H / GRAV_VB_W);
  const maxLen = 232;
  const rootPole = potTiltDeg;
  const shootPole = potTiltDeg + 180;

  /* ---------- 무중력 - 헤맴 (독립 모드) ---------- */
  if (microgravityConfused !== undefined) {
    const m = clamp01(microgravityConfused);
    const tendrils = [
      { base: 25, freq: 5.2, phase: 0.3, len: 0.72 },
      { base: 95, freq: 4.1, phase: 1.1, len: 0.6 },
      { base: 170, freq: 4.7, phase: 2.0, len: 0.68 },
      { base: -70, freq: 3.6, phase: 0.7, len: 0.58 },
      { base: -150, freq: 5.6, phase: 1.6, len: 0.5 },
    ];
    const grow = smooth(clamp01(m / 0.35));
    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
        <svg width={width} height={height} viewBox={`0 0 ${GRAV_VB_W} ${GRAV_VB_H}`} style={{ overflow: 'visible' }}>
          <ellipse cx={CX} cy={CY} rx={34} ry={26} fill={SEED_COLOR} stroke={stroke} strokeWidth={SW * 0.55} />
          {tendrils.map((tn, i) => {
            const wobble = Math.sin(m * tn.freq * Math.PI * 2 + tn.phase) * 34 * m;
            const angle = tn.base + wobble;
            const len = maxLen * tn.len * grow;
            const isStem = i % 2 === 0;
            const d = curvedPath(CX, CY, tn.base, angle, len);
            return (
              <path
                key={i} d={d} fill="none"
                stroke={isStem ? STEM_COLOR : ROOT_COLOR} strokeWidth={14} strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
          <circle cx={CX} cy={CY} r={12} fill={stroke} opacity={0.55 * grow} />
        </svg>
      </div>
    );
  }

  /* ---------- 기울어진 뒤 재교정 (독립 모드) ---------- */
  if (tiltCorrectProgress !== undefined) {
    const c = smooth(clamp01(tiltCorrectProgress));
    const baseLen = maxLen * 0.42;
    const rootBaseTip = pointAt(CX, CY, rootPole, baseLen);
    const shootBaseTip = pointAt(CX, CY, shootPole, baseLen);
    const rootFinalAngle = lerpAngleShortest(rootPole, DOWN_DEG, c);
    const shootFinalAngle = lerpAngleShortest(shootPole, UP_DEG, c);
    const rootTip = pointAt(rootBaseTip.x, rootBaseTip.y, rootFinalAngle, maxLen * 0.62 * c + 6);
    const shootTip = pointAt(shootBaseTip.x, shootBaseTip.y, shootFinalAngle, maxLen * 0.62 * c + 6);
    const rootMid = pointAt(rootBaseTip.x, rootBaseTip.y, rootPole, maxLen * 0.3 * c);
    const shootMid = pointAt(shootBaseTip.x, shootBaseTip.y, shootPole, maxLen * 0.3 * c);
    const groundAngle = potTiltDeg + 90;
    const g1 = pointAt(CX, CY, groundAngle, 150);
    const g2 = pointAt(CX, CY, groundAngle + 180, 150);

    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
        <svg width={width} height={height} viewBox={`0 0 ${GRAV_VB_W} ${GRAV_VB_H}`} style={{ overflow: 'visible' }}>
          <line x1={g1.x} y1={g1.y} x2={g2.x} y2={g2.y} stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" opacity={0.4} />

          {/* 밑동 (기울어진 채 고정) */}
          <path
            d={`M ${CX} ${CY} L ${rootBaseTip.x} ${rootBaseTip.y}`}
            fill="none" stroke={ROOT_COLOR} strokeWidth={16} strokeLinecap="round"
          />
          <path
            d={`M ${CX} ${CY} L ${shootBaseTip.x} ${shootBaseTip.y}`}
            fill="none" stroke={STEM_COLOR} strokeWidth={16} strokeLinecap="round"
          />

          {/* 재교정 성장분 */}
          <path
            d={`M ${rootBaseTip.x} ${rootBaseTip.y} Q ${rootMid.x} ${rootMid.y} ${rootTip.x} ${rootTip.y}`}
            fill="none" stroke={ROOT_COLOR} strokeWidth={14} strokeLinecap="round"
          />
          <path
            d={`M ${shootBaseTip.x} ${shootBaseTip.y} Q ${shootMid.x} ${shootMid.y} ${shootTip.x} ${shootTip.y}`}
            fill="none" stroke={STEM_COLOR} strokeWidth={14} strokeLinecap="round"
          />
          <ellipse cx={shootTip.x - 22} cy={shootTip.y + 6} rx={26} ry={13} fill={STEM_COLOR} stroke={stroke} strokeWidth={SW * 0.5} transform={`rotate(-24 ${shootTip.x - 22} ${shootTip.y + 6})`} />
          <ellipse cx={shootTip.x + 22} cy={shootTip.y - 6} rx={24} ry={12} fill={STEM_COLOR} stroke={stroke} strokeWidth={SW * 0.5} transform={`rotate(24 ${shootTip.x + 22} ${shootTip.y - 6})`} />

          <ellipse cx={CX} cy={CY} rx={30} ry={22} fill={SEED_COLOR} stroke={stroke} strokeWidth={SW * 0.55} />
        </svg>
      </div>
    );
  }

  /* ---------- 기본: 감지 -> 뿌리/줄기 방향 결정 ---------- */
  const g = growProgress ?? 0;
  const sensorT = smooth(clamp01(g / 0.3));
  const growT = smooth(clamp01((g - 0.25) / 0.75));

  const sensorPt = pointAt(CX, CY, DOWN_DEG, 16 * sensorT);

  const rootAngle = lerpAngleShortest(rootPole, DOWN_DEG, growT);
  const shootAngleBase = lerpAngleShortest(shootPole, UP_DEG, growT);

  const auxinT = auxinProgress !== undefined ? smooth(clamp01(auxinProgress)) : 0;
  // 옥신이 몰리며 줄기가 아주 살짝 치우친 각도에서 완전한 true up 으로 마저 교정된다
  const shootAngle = auxinProgress !== undefined
    ? lerpAngleShortest(UP_DEG + 15, UP_DEG, auxinT)
    : shootAngleBase;

  const rootLen = maxLen * growT;
  const stemLen = maxLen * (growProgress !== undefined ? Math.max(growT, auxinProgress !== undefined ? 1 : 0) : growT);

  const rootPath = curvedPath(CX, CY, rootPole, rootAngle, rootLen);
  const stemPath = curvedPath(CX, CY, shootPole, shootAngle, stemLen);
  const stemTip = pointAt(CX, CY, shootAngle, stemLen);
  const rootTip = pointAt(CX, CY, rootAngle, rootLen);

  const gravityTip = pointAt(CX, CY - 250, DOWN_DEG, 140);
  const gravityStart = { x: CX, y: CY - 250 };

  // 옥신 입자: 줄기 아래쪽 30~60% 구간, 중력 쪽(아래)으로 살짝 치우친 위치에 5개
  const auxinDots = auxinProgress !== undefined
    ? [0.18, 0.28, 0.38, 0.46, 0.54].map((tt, i) => {
      const base = pointAt(CX, CY, shootAngle, stemLen * tt);
      const off = pointAt(base.x, base.y, DOWN_DEG + (i % 2 === 0 ? -18 : 18), 20);
      return { ...off, d: (i % 3) * 0.08 };
    })
    : [];

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${GRAV_VB_W} ${GRAV_VB_H}`} style={{ overflow: 'visible' }}>
        {gravityArrow ? (
          <g stroke={C.inkSoft} strokeWidth={10} strokeLinecap="round" opacity={0.7}>
            <line x1={gravityStart.x} y1={gravityStart.y} x2={gravityTip.x} y2={gravityTip.y} />
            <line x1={gravityTip.x} y1={gravityTip.y} x2={gravityTip.x - 24} y2={gravityTip.y - 26} />
            <line x1={gravityTip.x} y1={gravityTip.y} x2={gravityTip.x + 24} y2={gravityTip.y - 26} />
          </g>
        ) : null}

        {rootLen > 1 ? (
          <path d={rootPath} fill="none" stroke={ROOT_COLOR} strokeWidth={15} strokeLinecap="round" />
        ) : null}
        {rootLen > 30 ? (
          <g stroke={ROOT_COLOR} strokeWidth={10} strokeLinecap="round" fill="none">
            <path d={`M ${rootTip.x} ${rootTip.y} l ${-18} ${14}`} opacity={clamp01((rootLen - 30) / 40)} />
            <path d={`M ${rootTip.x} ${rootTip.y} l ${18} ${16}`} opacity={clamp01((rootLen - 30) / 40)} />
          </g>
        ) : null}

        {stemLen > 1 ? (
          <path d={stemPath} fill="none" stroke={STEM_COLOR} strokeWidth={15} strokeLinecap="round" />
        ) : null}
        {stemLen > 30 ? (
          <g opacity={clamp01((stemLen - 30) / 40)}>
            <ellipse cx={stemTip.x - 20} cy={stemTip.y + 4} rx={24} ry={12} fill={STEM_COLOR} stroke={stroke} strokeWidth={SW * 0.5} transform={`rotate(-26 ${stemTip.x - 20} ${stemTip.y + 4})`} />
            <ellipse cx={stemTip.x + 20} cy={stemTip.y - 4} rx={22} ry={11} fill={STEM_COLOR} stroke={stroke} strokeWidth={SW * 0.5} transform={`rotate(26 ${stemTip.x + 20} ${stemTip.y - 4})`} />
          </g>
        ) : null}

        {auxinDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={13} fill={AUXIN_COLOR} stroke={stroke} strokeWidth={SW * 0.4} opacity={auxinT} />
        ))}

        <ellipse cx={CX} cy={CY} rx={32} ry={24} fill={SEED_COLOR} stroke={stroke} strokeWidth={SW * 0.55} />
        {sensorT > 0.01 ? (
          <circle cx={sensorPt.x} cy={sensorPt.y} r={9} fill={stroke} opacity={sensorT} />
        ) : null}
      </svg>
    </div>
  );
};

export default GravitropismDiagram;
