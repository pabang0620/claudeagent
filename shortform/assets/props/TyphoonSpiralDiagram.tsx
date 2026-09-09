/** "태풍은 저기압 중심으로 사방에서 공기가 빨려 들어가며 생기는데, 지구가 자전하고 있어서
 *  코리올리 효과 때문에 그 공기가 일직선이 아니라 옆으로 휘어지고, 그 휘어짐이 쌓이며
 *  소용돌이 모양이 만들어진다"는 3단 사슬을 보여주는 범용 다이어그램(태풍이 소용돌이
 *  모양인 이유, general-ep70). 위성사진처럼 사실적으로 그리지 않고 단순한 원과 화살표로만
 *  그린다(오케스트레이터 지시).
 *
 *  독립 진행도 5개(EarthOrbitDiagram·CloudFloatDiagram과 같은 설계, undefined면 해당
 *  레이어를 안 그린다):
 *   - `inflowProgress`(0~1): 저기압 중심을 향해 곧장 뻗는 직선 화살표(휘지 않음) - "공기가
 *     중심으로 곧장 빨려 들어간다"만 보여준다(s2).
 *   - `coriolisProgress`(0~1): 같은 각도에서 출발한 화살표를, 언제나 함께 그리는 옅은 직선
 *     점선 안내선과, 실제로 휘어지는 굵은 곡선 화살표를 나란히 대비시킨다 - 진행도가
 *     오를수록 곡선이 직선 안내선에서 점점 더 크게 벌어진다(s3, 핵심 시각 주의사항의
 *     "직선과 휘어짐의 대비").
 *   - `spiralProgress`(0~1): 굵은 소용돌이 팔 3가닥이 바깥에서 안쪽으로 자라나며 완성된
 *     태풍 모양을 만든다(s1 훅샷, s4).
 *   - `hemisphereProgress`(0~1): 지구본 하나를 적도선으로 나눠 위쪽(북반구)엔 반시계,
 *     아래쪽(남반구)엔 시계 방향 소용돌이를 동시에 그려 방향 대비를 보여준다(s5).
 *   - `mythProgress`(0~1): 배수구 아이콘 하나(비대칭 형태로 "배수구 모양이 진짜 원인"임을
 *     암시) - 회전 방향에 대한 주장은 담지 않는다(s6, 욕조 속설은 회전 방향과 무관하다는
 *     정정이 핵심이므로 특정 반구 방향을 강요하지 않는 중립적 형태로 그린다).
 *
 *  **회전 방향 계산 원칙(오케스트레이터 지시 - 62화 EarthOrbitDiagram과 같은 정신)**: 북반구/
 *  남반구가 서로 반대로 도는 것을 손으로 두 개의 독립된 SVG path(하나는 시계, 하나는 반시계로
 *  각각 따로 그림)로 구현하면 복사-반전 실수로 방향이 뒤바뀌기 쉽다(55화 밀물/썰물 방향 반전
 *  사고와 같은 유형). 그래서 이 파일은 소용돌이 팔을 그리는 함수(`spiralArmPoints`) 단
 *  하나만 두고, 그 함수에 넘기는 부호(`curlSign`) 하나만 반구에 따라 바뀐다. 그 부호는
 *  `curlSignFor(hemisphere)` 한 곳에서만 계산하고, `hemisphere` 자체도 "적도선 기준으로
 *  위/아래 어느 쪽에 있는가"(`hemisphereAt`)라는 기하학적 위치 판정에서 나온다 - 어느
 *  반구를 반시계로 할지 문자열로 직접 못박지 않는다. 부호 도출 근거: SVG 좌표계는 y축이
 *  아래로 증가하므로 `polarPoint(cx,cy,r,angle)`에서 angle이 커질수록 점은 화면상
 *  시계방향(3시->6시->9시->12시)으로 움직인다 - 이 기하학적 사실 하나에서 "각도 증가=시계,
 *  각도 감소=반시계"가 자동으로 정해진다. 실제 기상학적 사실(북반구 저기압은 반시계, 남반구는
 *  시계로 도는 것이 위성사진으로 항상 관측된다)이 화면에 맞게 나오는지는 렌더된 프레임을
 *  직접 보고 확인했다(주석만으로 검증을 대신하지 않는다 - 99-build-report.md 참고).
 *
 *  "저기압 중심으로 빨려드는 흐름이 자전 때문에 휘어져 소용돌이가 되고, 반구에 따라 그
 *  휘어짐의 방향이 반대"라는 구조를 갖는 다른 소재(대양의 표층 해류 순환, 저기압/고기압
 *  바람 방향 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다
 *  (02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW } from '../theme';

export const TYPHOON_VB_W = 900;
export const TYPHOON_VB_H = 900;

const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

interface Pt { x: number; y: number }

function polarPoint(cx: number, cy: number, r: number, angleDeg: number): Pt {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function pointsToPath(pts: Pt[]): string {
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

/** p1->p2 방향을 향하는 화살촉 삼각형 path */
function arrowHeadPath(p1: Pt, p2: Pt, size: number): string {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const back = { x: p2.x - ux * size, y: p2.y - uy * size };
  const left = { x: back.x + nx * size * 0.55, y: back.y + ny * size * 0.55 };
  const right = { x: back.x - nx * size * 0.55, y: back.y - ny * size * 0.55 };
  return `M ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L ${left.x.toFixed(1)} ${left.y.toFixed(1)} L ${right.x.toFixed(1)} ${right.y.toFixed(1)} Z`;
}

export type Hemisphere = 'north' | 'south';

/** 화면 y좌표가 적도(equatorY)보다 위면 북반구, 아래면 남반구 - 문자열로 못박지 않고
 *  위치에서 판정한다(62화 EarthOrbitDiagram과 같은 정신, earthOrbitNorthTiltDot 참고). */
export function hemisphereAt(localCy: number, equatorY: number): Hemisphere {
  return localCy < equatorY ? 'north' : 'south';
}

/** 코리올리 편향에 따른 소용돌이 회전 부호. 유일한 부호 결정 지점 - 파일 상단 주석 참고. */
export function curlSignFor(hemisphere: Hemisphere): 1 | -1 {
  // angle 증가 = 화면상 시계방향(polarPoint 정의에서 기하학적으로 도출).
  // 북반구(반시계가 실제 물리)는 각도가 감소해야 하므로 -1, 남반구(시계)는 +1.
  return hemisphere === 'north' ? -1 : 1;
}

/** 소용돌이 팔 하나의 점 배열. r=rOuter(t=0, 바깥)에서 r=rInner(t=1, 중심 가까이)로 가면서
 *  각도가 baseAngleDeg 에서 curlSign*twistDeg 만큼 누적으로 휘어진다. */
function spiralArmPoints(
  cx: number, cy: number, rOuter: number, rInner: number,
  baseAngleDeg: number, twistDeg: number, curlSign: 1 | -1, samples = 28,
): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const r = rOuter - (rOuter - rInner) * t;
    const angle = baseAngleDeg + curlSign * twistDeg * t;
    pts.push(polarPoint(cx, cy, r, angle));
  }
  return pts;
}

function revealSlice(pts: Pt[], revealT: number): Pt[] {
  const n = Math.max(2, Math.round(pts.length * clamp01(revealT)));
  return pts.slice(0, n);
}

/* ============================================================
 * inflowProgress: 저기압 중심을 향해 곧장 뻗는 직선 화살표(휘지 않음)
 * ============================================================ */
const INFLOW_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const INFLOW_R_OUT = 380;
const INFLOW_R_IN = 90;
const INFLOW_TAIL = 120;

function InflowArrows({
  cx, cy, prog, color,
}: { cx: number; cy: number; prog: number; color: string }) {
  return (
    <g>
      {INFLOW_ANGLES.map((a, i) => {
        const armT = clamp01(prog * 1.3 - i * 0.045);
        if (armT <= 0) return null;
        const e = smooth(armT);
        const tipR = INFLOW_R_OUT - (INFLOW_R_OUT - INFLOW_R_IN) * e;
        const tailR = Math.min(INFLOW_R_OUT, tipR + INFLOW_TAIL);
        const tip = polarPoint(cx, cy, tipR, a);
        const tail = polarPoint(cx, cy, tailR, a);
        return (
          <g key={a} opacity={Math.min(1, armT * 3)}>
            <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={14} strokeLinecap="round" />
            <path d={arrowHeadPath(tail, tip, 30)} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

/* ============================================================
 * coriolisProgress: 직선 안내선 vs 실제로 휘어지는 곡선 화살표 대비
 * ============================================================ */
const CORIOLIS_ANGLES = [0, 120, 240];
const CORIOLIS_R_OUT = 380;
const CORIOLIS_R_IN = 90;
const CORIOLIS_MAX_TWIST = 72; // 도

function CoriolisContrast({
  cx, cy, prog, curlSign, guideColor, armColor,
}: { cx: number; cy: number; prog: number; curlSign: 1 | -1; guideColor: string; armColor: string }) {
  const guideA = smooth(clamp01(prog * 3));
  return (
    <g>
      {CORIOLIS_ANGLES.map((a) => {
        const outerPt = polarPoint(cx, cy, CORIOLIS_R_OUT, a);
        const innerPt = polarPoint(cx, cy, CORIOLIS_R_IN, a);
        const curve = spiralArmPoints(cx, cy, CORIOLIS_R_OUT, CORIOLIS_R_IN, a, CORIOLIS_MAX_TWIST * prog, curlSign, 24);
        const tip = curve[curve.length - 1];
        const preTip = curve[curve.length - 2];
        return (
          <g key={a}>
            <line
              x1={outerPt.x} y1={outerPt.y} x2={innerPt.x} y2={innerPt.y}
              stroke={guideColor} strokeWidth={7} strokeDasharray="14 12" opacity={guideA * 0.7}
            />
            <path
              d={pointsToPath(curve)} fill="none" stroke={armColor} strokeWidth={17}
              strokeLinecap="round" strokeLinejoin="round" opacity={guideA}
            />
            <path d={arrowHeadPath(preTip, tip, 32)} fill={armColor} opacity={guideA} />
          </g>
        );
      })}
    </g>
  );
}

/* ============================================================
 * spiralProgress: 완성된 소용돌이(굵은 팔 3가닥)
 * ============================================================ */
const SPIRAL_ARM_BASES = [0, 120, 240];
const SPIRAL_R_OUT = 400;
const SPIRAL_R_IN = 60;
const SPIRAL_TWIST = 165; // 도, "완성된 형태" 느낌을 위해 크게 감아 돈다

function SpiralArms({
  cx, cy, prog, curlSign, stroke, armColor,
}: { cx: number; cy: number; prog: number; curlSign: 1 | -1; stroke: string; armColor: string }) {
  return (
    <g>
      {SPIRAL_ARM_BASES.map((base, i) => {
        const full = spiralArmPoints(cx, cy, SPIRAL_R_OUT, SPIRAL_R_IN, base, SPIRAL_TWIST, curlSign, 36);
        const revealed = revealSlice(full, prog);
        if (revealed.length < 2) return null;
        const tip = revealed[revealed.length - 1];
        const preTip = revealed[revealed.length - 2];
        return (
          <g key={base}>
            <path
              d={pointsToPath(revealed)} fill="none" stroke={armColor} strokeWidth={32}
              strokeLinecap="round" strokeLinejoin="round" opacity={0.92}
            />
            {revealed.length === full.length ? (
              <path d={arrowHeadPath(preTip, tip, 30)} fill={armColor} opacity={0.92} />
            ) : null}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={42} fill={C.paper} stroke={stroke} strokeWidth={SW * 0.7} opacity={smooth(prog)} />
    </g>
  );
}

/* ============================================================
 * hemisphereProgress: 지구본 하나 위 북/남반구 회전 방향 비교
 * ============================================================ */
const GLOBE_R = 360;
const HEMI_ARM_R_OUT = 165;
const HEMI_ARM_R_IN = 28;
const HEMI_TWIST = 145;

function HemisphereCompare({
  cx, cy, prog, stroke, armColor, oceanColor,
}: { cx: number; cy: number; prog: number; stroke: string; armColor: string; oceanColor: string }) {
  const equatorY = cy;
  const northCy = cy - GLOBE_R * 0.5;
  const southCy = cy + GLOBE_R * 0.5;
  // 위치(적도선 기준 위/아래)에서 반구를 판정한다 - 문자열로 직접 지정하지 않는다.
  const northHemi = hemisphereAt(northCy, equatorY);
  const southHemi = hemisphereAt(southCy, equatorY);
  const northCurl = curlSignFor(northHemi);
  const southCurl = curlSignFor(southHemi);

  const armsFor = (localCy: number, curl: 1 | -1) => [0, 180].map((base) =>
    revealSlice(spiralArmPoints(cx, localCy, HEMI_ARM_R_OUT, HEMI_ARM_R_IN, base, HEMI_TWIST, curl, 24), prog));

  const northArms = armsFor(northCy, northCurl);
  const southArms = armsFor(southCy, southCurl);

  const renderArms = (arms: Pt[][], keyPrefix: string) => arms.map((pts, i) => {
    if (pts.length < 2) return null;
    const tip = pts[pts.length - 1];
    const preTip = pts[pts.length - 2];
    return (
      <g key={keyPrefix + i}>
        <path d={pointsToPath(pts)} fill="none" stroke={armColor} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
        <path d={arrowHeadPath(preTip, tip, 24)} fill={armColor} />
      </g>
    );
  });

  return (
    <g>
      <circle cx={cx} cy={cy} r={GLOBE_R} fill={oceanColor} stroke={stroke} strokeWidth={SW * 0.8} />
      <line
        x1={cx - GLOBE_R} y1={equatorY} x2={cx + GLOBE_R} y2={equatorY}
        stroke={stroke} strokeWidth={5} strokeDasharray="16 12" opacity={0.5}
      />
      {renderArms(northArms, 'n')}
      {renderArms(southArms, 's')}
    </g>
  );
}

/* ============================================================
 * mythProgress: 배수구 아이콘(속설 반박용, 방향에 대한 주장 없음)
 * ============================================================ */
function DrainIcon({
  cx, cy, prog, stroke, accent,
}: { cx: number; cy: number; prog: number; stroke: string; accent: string }) {
  const r = 130;
  const a = smooth(prog);
  const notch = polarPoint(cx, cy, r * 1.1, 35);
  const notchB = polarPoint(cx, cy, r * 0.92, 55);
  return (
    <g opacity={a}>
      <circle cx={cx} cy={cy} r={r} fill={C.paper} stroke={stroke} strokeWidth={11} />
      <circle cx={cx} cy={cy} r={r * 0.4} fill={stroke} />
      {/* 배수구 테두리의 비대칭 돌출부 - "배수구 모양 자체가 원인"이라는 실제 요인을
          중립적인(회전 방향을 암시하지 않는) 형태로 표시한다 */}
      <path
        d={`M ${notch.x.toFixed(1)} ${notch.y.toFixed(1)} L ${notchB.x.toFixed(1)} ${notchB.y.toFixed(1)} L ${cx.toFixed(1)} ${(cy - r * 0.78).toFixed(1)} Z`}
        fill={accent} stroke={stroke} strokeWidth={6}
      />
    </g>
  );
}

/* ============================================================
 * 본체
 * ============================================================ */
export interface TyphoonSpiralDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 저기압 중심으로 곧장 뻗는 직선 화살표(휘지 않음) - s2 */
  inflowProgress?: number;
  /** 직선 안내선 대비, 실제로 휘어지는 곡선 화살표 - s3 */
  coriolisProgress?: number;
  /** 완성된 소용돌이(굵은 팔 3가닥) - s1, s4 */
  spiralProgress?: number;
  /** 지구본 위 북반구/남반구 회전 방향 비교 - s5 */
  hemisphereProgress?: number;
  /** 욕조 배수구 아이콘(속설 반박용, 방향 중립) - s6 */
  mythProgress?: number;
  /** inflow/coriolis/spiral 레이어(메인 소용돌이 하나)가 어느 반구인지. 기본 북반구 */
  hemisphere?: Hemisphere;
  stroke?: string;
  mutedStroke?: string;
  armColor?: string;
  oceanColor?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const TyphoonSpiralDiagram: React.FC<TyphoonSpiralDiagramProps> = ({
  width, x, y,
  inflowProgress, coriolisProgress, spiralProgress, hemisphereProgress, mythProgress,
  hemisphere = 'north',
  stroke = C.ink, mutedStroke = C.inkSoft, armColor = C.waterCool, oceanColor = C.seaTop,
  accent = C.coral,
  style,
}) => {
  const scale = width / TYPHOON_VB_W;
  const height = TYPHOON_VB_H * scale;
  const cx = TYPHOON_VB_W / 2;
  const cy = TYPHOON_VB_H / 2;

  const ip = inflowProgress !== undefined ? clamp01(inflowProgress) : undefined;
  const cp = coriolisProgress !== undefined ? clamp01(coriolisProgress) : undefined;
  const sp = spiralProgress !== undefined ? clamp01(spiralProgress) : undefined;
  const hp = hemisphereProgress !== undefined ? clamp01(hemisphereProgress) : undefined;
  const mp = mythProgress !== undefined ? clamp01(mythProgress) : undefined;

  const mainCurl = curlSignFor(hemisphere);
  const showEye = ip !== undefined || cp !== undefined || sp !== undefined;

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${TYPHOON_VB_W} ${TYPHOON_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {showEye ? (
        <circle cx={cx} cy={cy} r={34} fill={oceanColor} stroke={stroke} strokeWidth={SW * 0.6} opacity={0.9} />
      ) : null}
      {ip !== undefined ? <InflowArrows cx={cx} cy={cy} prog={ip} color={mutedStroke} /> : null}
      {cp !== undefined ? (
        <CoriolisContrast cx={cx} cy={cy} prog={cp} curlSign={mainCurl} guideColor={mutedStroke} armColor={armColor} />
      ) : null}
      {sp !== undefined ? (
        <SpiralArms cx={cx} cy={cy} prog={sp} curlSign={mainCurl} stroke={stroke} armColor={armColor} />
      ) : null}
      {hp !== undefined ? (
        <HemisphereCompare cx={cx} cy={cy} prog={hp} stroke={stroke} armColor={armColor} oceanColor={oceanColor} />
      ) : null}
      {mp !== undefined ? <DrainIcon cx={cx} cy={cy} prog={mp} stroke={stroke} accent={accent} /> : null}
    </svg>
  );
};

export default TyphoonSpiralDiagram;
