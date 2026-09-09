/** "지구는 자전축이 살짝(약 23.5도) 기울어진 채로 태양 둘레를 돌고, 이 기울기 때문에 궤도
 *  위치에 따라 어떤 반구는 햇빛을 더 똑바로(강하게) 받고 어떤 반구는 더 비스듬히(약하게)
 *  받는다 - 거리가 아니라 이 각도 차이가 계절을 만든다"는 구조를 보여주는 범용 다이어그램
 *  (계절이 바뀌는 진짜 이유, general-ep62). ParallaxDiagram·TideDiagram과 같은 설계(독립
 *  progress props, undefined/0이면 해당 레이어를 안 그린다). 태양·지구 모두 표면 디테일 없는
 *  단순한 원으로 그리고, 자전축은 선 하나로만 표시한다(오케스트레이터 지시 - 사실적으로
 *  그리지 않는다).
 *
 *  핵심 설계: 자전축 방향(`NORTH_DIR`)은 궤도 위 어느 지점에 있든 **화면상 항상 같은 방향으로
 *  고정**돼 있다(실제 지구가 우주 공간에서 자전축 방향을 계속 유지하는 것과 같은 물리
 *  - "지구는 항상 같은 방향으로 기울어진 채 고정되고"라는 대본 자산 목록 설명 그대로). 그래서
 *  "북반구가 태양 쪽으로 기운 위치=여름"이라는 판정을 컴포넌트가 orbitAngle로부터 벡터
 *  내적(`earthOrbitNorthTiltDot`)으로 직접 계산한다 - 호출부가 "이 각도가 여름이다"를 손으로
 *  정해 반구 배정을 반대로 다는 사고(55화 밀물/썰물 방향 반전 사고와 같은 유형)를 원천
 *  차단한다. 이 계산에서 나온 고정 각도 상수(`EARTH_ORBIT_NORTH_SUMMER_ANGLE` 등)를 호출부가
 *  그대로 갖다 쓰면 항상 물리적으로 옳은 배정이 된다.
 *
 *  `orbitAngle`(도, 0~360 - 태양 둘레 궤도 위 지구의 위치. 궤도는 아주 살짝 찌그러진 타원으로
 *  둬 `EARTH_ORBIT_CLOSEST_ANGLE`에서 반지름이 최소(근일점)가 되게 했다 - "지구가 태양과 제일
 *  가까운 때는 오히려 북반구 한겨울"이라는 대본 곁가지 사실을 별도 스위치 없이 궤도 형태
 *  자체로 표현한다). `showOrbitRing`(기본 true), `spinDeg`(연속값, 장식용 - 자오선 3가닥이
 *  구면 위를 도는 것처럼 보이게 하는 순수 시각 효과, 계절 계산과 무관), `showRays`(0~1 -
 *  태양에서 온 두 굵은 화살표가 각각 북극 근처/남극 근처에 도달하며, 도달점 옆 짧은 기준선
 *  - "만약 똑바로 닿는다면"의 수직 방향 - 과 실제 화살표가 이루는 각도로 "이 지점은 거의
 *  똑바로, 저 지점은 많이 비스듬히"를 동시에 대비해서 보여준다. orbitAngle이 바뀌면 두 화살표의
 *  각도가 자동으로 뒤바뀐다 - 별도 파라미터 없이 순수 기하로 나온다), `showTiltGuide`(대본
 *  s3용 - 수직 기준 점선 + 기울기 호를 그려 "이만큼 기울었다"를 시각화, 숫자 라벨 자체는
 *  호출 씬이 `earthOrbitAxisTopAt`로 위치를 얻어 `Label`로 얹는다 - RainbowDiagram과 같은
 *  라벨 분리 관례), `showClosestMarker`(0~1 - 근일점 지점에 강조 점을 얹는다, s6용).
 *
 *  같은 파일에 `SunAngleGroundView`(s5 전용 - 지평선 클로즈업에서 직사광/긴 낮 vs 비스듬한
 *  빛/짧은 낮을 나란히 비교하는 보조 시각 언어)도 함께 둔다(TideDiagram/ShoreLevel과 같은
 *  "핵심 다이어그램 + 같은 소재의 보조 시각 언어를 한 파일에" 관례).
 *
 *  "천체가 궤도를 돌며 위치에 따라 빛이 닿는 각도가 달라진다"는 구조를 갖는 다른 소재(낮과
 *  밤의 길이, 일식·월식 등)에도 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다
 *  (02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

const SW_HAIR_LOCAL = 6;

export const EARTH_ORBIT_VB_W = 900;
export const EARTH_ORBIT_VB_H = 900;

const SUN_CX = 450;
const SUN_CY = 450;
const SUN_R = 62;
const ORBIT_R = 300;
const ORBIT_ECCENTRICITY = 0.06; // 아주 살짝만 - "거의 원이지만 완전한 원은 아니다"
const EARTH_R = 60;
const RING_STEPS = 96;

export const EARTH_ORBIT_AXIS_TILT_DEG = 23.5;
const AXIS_TILT_RAD = (EARTH_ORBIT_AXIS_TILT_DEG * Math.PI) / 180;

/** 자전축(북극 방향) 화면 고정 벡터. orbitAngle과 무관하게 항상 같다 - 이 파일의 핵심 설계. */
const NORTH_DIR = { x: Math.sin(AXIS_TILT_RAD), y: -Math.cos(AXIS_TILT_RAD) };
/** 적도 방향(자전축과 수직) */
const EQUATOR_DIR = { x: -NORTH_DIR.y, y: NORTH_DIR.x };

const rad = (deg: number) => (deg * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Pt { x: number; y: number }

/** 벡터를 고정된 방향(시계방향)으로 rad만큼 돌린다. showRays에서 "곧장 내리꽂히는 방향"을
 *  항상 같은 쪽으로만 기울여 각도를 표현할 때 쓴다(부호가 프레임마다 안 바뀌어 결정적). */
function rotateVec(v: Pt, radAmt: number): Pt {
  const c = Math.cos(radAmt);
  const s = Math.sin(radAmt);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

/** 태양->지구 방향 단위벡터(=햇빛이 실제로 진행하는 방향과 같다) */
function sunToEarthUnit(orbitDeg: number): Pt {
  const a = rad(orbitDeg);
  return { x: Math.cos(a), y: Math.sin(a) };
}

/** 궤도 반지름(아주 살짝 찌그러진 타원 - EARTH_ORBIT_CLOSEST_ANGLE에서 최소) */
function orbitRadiusAt(orbitDeg: number) {
  const d = Math.cos(rad(orbitDeg - EARTH_ORBIT_CLOSEST_ANGLE));
  return ORBIT_R * (1 - ORBIT_ECCENTRICITY * d);
}

/** 태양-지구 벡터에 대해 북반구가 태양을 향한 정도. 1=북반구가 태양 쪽으로 최대로 기움(북반구
 *  여름 정점), -1=반대(북반구 겨울 정점), 0=춘분·추분에 해당. 이 파일 밖에서 "이 각도가
 *  여름이다"를 다시 판단할 필요가 없도록 공개 함수로 둔다. */
export function earthOrbitNorthTiltDot(orbitDeg: number): number {
  const off = sunToEarthUnit(orbitDeg);
  const toSun = { x: -off.x, y: -off.y };
  return NORTH_DIR.x * toSun.x + NORTH_DIR.y * toSun.y;
}

// 위 내적이 각각 +1 / -1이 되는 각도를 직접 풀어 상수로 굳힌다(대수적으로
// dot(orbitDeg) = sin(orbitDeg_rad - AXIS_TILT_RAD)이므로 +1은 orbitDeg=tilt+90,
// -1은 orbitDeg=tilt-90이다 - 계산 과정을 주석에 남겨 다음에 고칠 사람이 검산할 수 있게 한다).
export const EARTH_ORBIT_NORTH_SUMMER_ANGLE = (EARTH_ORBIT_AXIS_TILT_DEG + 90 + 360) % 360;
export const EARTH_ORBIT_NORTH_WINTER_ANGLE = (EARTH_ORBIT_AXIS_TILT_DEG - 90 + 360) % 360;
/** 근일점(태양과 가장 가까운 지점). 실제 지구도 근일점(1월 초)이 북반구 겨울 근처라 같은
 *  각도로 겹쳐 둔다 - "가장 가까운데 왜 겨울이지"라는 대본의 반박 포인트를 그대로 반영. */
export const EARTH_ORBIT_CLOSEST_ANGLE = EARTH_ORBIT_NORTH_WINTER_ANGLE;

function toScreen(p: Pt, width: number, x: number, y: number): Pt {
  const s = width / EARTH_ORBIT_VB_W;
  return { x: x + p.x * s, y: y + p.y * s };
}

/** 지구 중심의 화면 좌표 (호출부가 라벨·카드를 지구 옆에 붙일 때 쓴다) */
export function earthOrbitCenterAt(orbitDeg: number, width: number, x: number, y: number): Pt {
  const r = orbitRadiusAt(orbitDeg);
  const off = sunToEarthUnit(orbitDeg);
  return toScreen({ x: SUN_CX + off.x * r, y: SUN_CY + off.y * r }, width, x, y);
}

/** 자전축 북극 끝의 화면 좌표 (기울기 각도 라벨을 붙일 위치) */
export function earthOrbitAxisTopAt(orbitDeg: number, width: number, x: number, y: number): Pt {
  const c = earthOrbitCenterAt(orbitDeg, width, x, y);
  const s = width / EARTH_ORBIT_VB_W;
  return { x: c.x + NORTH_DIR.x * EARTH_R * 1.55 * s, y: c.y + NORTH_DIR.y * EARTH_R * 1.55 * s };
}

/** 근일점(최근접) 지점의 화면 좌표 */
export function earthOrbitClosestPointAt(width: number, x: number, y: number): Pt {
  return earthOrbitCenterAt(EARTH_ORBIT_CLOSEST_ANGLE, width, x, y);
}

function ringPath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= RING_STEPS; i++) {
    const deg = (i / RING_STEPS) * 360;
    const r = orbitRadiusAt(deg);
    const a = rad(deg);
    pts.push(`${(SUN_CX + Math.cos(a) * r).toFixed(1)},${(SUN_CY + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

/** 반지름 r 원을 axisAngle(북극 방향) 쪽으로 부풀린 반원(half-disc) 경로 */
function halfDiscPath(cx: number, cy: number, r: number, dirAngleRad: number, steps = 36): string {
  const pts: string[] = [];
  const start = dirAngleRad - Math.PI / 2;
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * Math.PI;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function ThickArrow({
  x1, y1, x2, y2, color, width = 15,
}: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const headLen = width * 2.1;
  const hx = x2 - Math.cos(ang) * headLen;
  const hy = y2 - Math.sin(ang) * headLen;
  const perp = ang + Math.PI / 2;
  const lx = hx + Math.cos(perp) * width * 0.9;
  const ly = hy + Math.sin(perp) * width * 0.9;
  const rx = hx - Math.cos(perp) * width * 0.9;
  const ry = hy - Math.sin(perp) * width * 0.9;
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${lx},${ly} ${rx},${ry}`} fill={color} />
    </g>
  );
}

function SunIcon({ cx, cy, r, color, stroke }: { cx: number; cy: number; r: number; color: string; stroke: string }) {
  const rays = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  return (
    <g>
      {rays.map((a) => (
        <line
          key={a}
          x1={cx + Math.cos(a) * (r + 12)} y1={cy + Math.sin(a) * (r + 12)}
          x2={cx + Math.cos(a) * (r + 36)} y2={cy + Math.sin(a) * (r + 36)}
          stroke={color} strokeWidth={11} strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={color} stroke={stroke} strokeWidth={SW_THIN} />
    </g>
  );
}

export interface EarthOrbitDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 궤도 위 지구 위치(도, 0~360). 기본 EARTH_ORBIT_NORTH_SUMMER_ANGLE */
  orbitAngle?: number;
  showOrbitRing?: boolean;
  showSun?: boolean;
  /** 자오선 3가닥이 도는 장식용 회전 위상(도, 연속값). 계절 계산과 무관 */
  spinDeg?: number;
  /** 0~1. 태양->북극/남극 두 지점으로 향하는 굵은 화살표 + 기준 수직선 */
  showRays?: number;
  /** 수직 기준 점선 + 기울기 호 (s3 "23.5도" 설명용) */
  showTiltGuide?: boolean;
  /** 0~1. 근일점 지점 강조 마커 */
  showClosestMarker?: number;
  hemisphereSplit?: boolean;
  stroke?: string;
  mutedStroke?: string;
  sunColor?: string;
  earthColor?: string;
  northColor?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const EarthOrbitDiagram: React.FC<EarthOrbitDiagramProps> = ({
  width, x, y, orbitAngle = EARTH_ORBIT_NORTH_SUMMER_ANGLE, showOrbitRing = true, showSun = true,
  spinDeg = 0, showRays = 0, showTiltGuide = false, showClosestMarker = 0, hemisphereSplit = true,
  stroke = C.ink, mutedStroke = C.inkSoft, sunColor = C.gold, earthColor = C.sky, northColor = C.leaf,
  accent = C.coral, style,
}) => {
  const earthR = orbitRadiusAt(orbitAngle);
  const off = sunToEarthUnit(orbitAngle);
  const ecx = SUN_CX + off.x * earthR;
  const ecy = SUN_CY + off.y * earthR;
  const axisAngle = Math.atan2(NORTH_DIR.y, NORTH_DIR.x);
  const northTipX = ecx + NORTH_DIR.x * EARTH_R * 1.4;
  const northTipY = ecy + NORTH_DIR.y * EARTH_R * 1.4;
  const southTipX = ecx - NORTH_DIR.x * EARTH_R * 1.4;
  const southTipY = ecy - NORTH_DIR.y * EARTH_R * 1.4;

  // showRays: 북극 근처 고정 한 지점에 닿는 햇빛의 각도를 orbitAngle에 따라 보여준다.
  // 두 극(남/북) 양쪽에 화살표를 각각 그리는 방식은 두 착륙점이 자전축상 정반대라 어떤
  // orbitAngle에서도 화살표 진행방향이 서로 거의 겹쳐 보이는 문제가 있었다(스틸 선점검에서
  // f575/f699 확인 - 화살표 하나만 보이는 것처럼 보임). 대신 착륙점을 하나로 고정하고,
  // earthOrbitNorthTiltDot(-1~1)을 "곧장 내리꽂히는 방향"에서 얼마나 기울어졌는지로 직접
  // 매핑한다(14도=거의 수직/여름 정점, 76도=많이 비스듬/겨울 정점) - 항상 같은 쪽으로만
  // 기울여 부호가 안 바뀌므로 결정적이고, 극단에서도 "완전히 안 보임" 없이 항상 뚜렷한
  // 화살표가 나온다.
  const tiltDot = earthOrbitNorthTiltDot(orbitAngle);
  const hitDeg = lerp(14, 76, (1 - tiltDot) / 2);
  const hitRad = (hitDeg * Math.PI) / 180;
  const straightDown: Pt = { x: -NORTH_DIR.x, y: -NORTH_DIR.y };
  const approachDir = rotateVec(straightDown, hitRad);
  const landX = ecx + NORTH_DIR.x * EARTH_R * 0.92;
  const landY = ecy + NORTH_DIR.y * EARTH_R * 0.92;
  const rayLen = EARTH_R * 3.2;
  const beamSpread = EARTH_R * 0.46;

  const rp = clamp01(showRays);
  const cp = clamp01(showClosestMarker);
  const closestR = orbitRadiusAt(EARTH_ORBIT_CLOSEST_ANGLE);
  const closestLocal = {
    x: SUN_CX + Math.cos(rad(EARTH_ORBIT_CLOSEST_ANGLE)) * closestR,
    y: SUN_CY + Math.sin(rad(EARTH_ORBIT_CLOSEST_ANGLE)) * closestR,
  };

  const spinRad = (spinDeg * Math.PI) / 180;
  const meridians = [0, 1, 2].map((i) => {
    const theta = spinRad + (i * Math.PI * 2) / 3;
    const xScale = Math.sin(theta) * EARTH_R;
    const front = Math.cos(theta) >= 0;
    const steps = 24;
    const pts: string[] = [];
    for (let s = 0; s <= steps; s++) {
      const t = -1 + (2 * s) / steps; // -1(남극) ~ 1(북극)
      const bulge = Math.sqrt(Math.max(0, 1 - t * t)) * xScale;
      const px = ecx + EQUATOR_DIR.x * bulge + NORTH_DIR.x * EARTH_R * t;
      const py = ecy + EQUATOR_DIR.y * bulge + NORTH_DIR.y * EARTH_R * t;
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return { d: `M ${pts.join(' L ')}`, front, key: i };
  });

  return (
    <svg
      viewBox={`0 0 ${EARTH_ORBIT_VB_W} ${EARTH_ORBIT_VB_H}`} width={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {showOrbitRing ? (
        <path d={ringPath()} fill="none" stroke={mutedStroke} strokeWidth={SW_THIN} strokeDasharray="4 14" opacity={0.6} />
      ) : null}

      {showSun ? <SunIcon cx={SUN_CX} cy={SUN_CY} r={SUN_R} color={sunColor} stroke={stroke} /> : null}

      {/* 지구 몸통 */}
      <circle cx={ecx} cy={ecy} r={EARTH_R} fill={earthColor} stroke={stroke} strokeWidth={SW_THIN} />
      {hemisphereSplit ? (
        <path d={halfDiscPath(ecx, ecy, EARTH_R, axisAngle)} fill={northColor} opacity={0.9} />
      ) : null}
      <circle cx={ecx} cy={ecy} r={EARTH_R} fill="none" stroke={stroke} strokeWidth={SW_THIN} />

      {/* 장식용 자오선(자전 중임을 암시) */}
      {meridians.map((m) => (
        <path
          key={m.key} d={m.d} fill="none" stroke={stroke} strokeWidth={SW_HAIR_LOCAL}
          opacity={m.front ? 0.4 : 0.16}
        />
      ))}

      {/* 자전축 선 + 양극 점 */}
      <line x1={southTipX} y1={southTipY} x2={northTipX} y2={northTipY} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={northTipX} cy={northTipY} r={9} fill={stroke} />
      <circle cx={southTipX} cy={southTipY} r={9} fill={stroke} />

      {cp > 0.01 ? (
        // 지구가 정확히 근일점(closestLocal)에 있을 수도 있어(s6) 지구 몸통에 가려지지 않도록
        // 지구 반지름보다 큰 고리(halo, 채움 없음)로 그리고, 화면 밖으로 삐져나온 작은 강조
        // 점을 바깥쪽에 하나 더 붙인다(마커가 지구 원 뒤에 완전히 덮이던 결함 - 스틸 선점검).
        <g opacity={cp}>
          <circle
            cx={closestLocal.x} cy={closestLocal.y} r={EARTH_R * 1.55 + 6 * Math.sin(spinRad)}
            fill="none" stroke={accent} strokeWidth={SW_THIN} strokeDasharray="10 10"
          />
          <circle
            cx={closestLocal.x + EARTH_R * 1.55} cy={closestLocal.y - EARTH_R * 1.55}
            r={16} fill={accent} stroke={stroke} strokeWidth={SW_THIN}
          />
        </g>
      ) : null}

      {showTiltGuide ? (
        <g>
          <line
            x1={ecx} y1={ecy - EARTH_R * 1.6} x2={ecx} y2={ecy + EARTH_R * 1.6}
            stroke={mutedStroke} strokeWidth={SW_THIN} strokeDasharray="6 10"
          />
          <path
            d={(() => {
              const r2 = EARTH_R * 0.62;
              const a0 = -Math.PI / 2;
              const a1 = axisAngle;
              const steps = 20;
              const pts: string[] = [];
              for (let s = 0; s <= steps; s++) {
                const a = lerp(a0, a1, s / steps);
                pts.push(`${(ecx + Math.cos(a) * r2).toFixed(1)},${(ecy + Math.sin(a) * r2).toFixed(1)}`);
              }
              return `M ${pts.join(' L ')}`;
            })()}
            fill="none" stroke={accent} strokeWidth={SW_THIN}
          />
        </g>
      ) : null}

      {rp > 0.01 ? (
        <g opacity={rp}>
          {/* 기준선(만약 똑바로 닿는다면의 방향) */}
          <line
            x1={landX} y1={landY}
            x2={landX + NORTH_DIR.x * 44} y2={landY + NORTH_DIR.y * 44}
            stroke={mutedStroke} strokeWidth={SW_HAIR_LOCAL} strokeDasharray="3 8"
          />
          {/* 굵은 화살표 3가닥(빛 다발) - 전부 같은 approachDir로 평행하게 접근한다.
              간격은 approachDir에 수직인 방향으로 벌려야 각도가 아주 비스듬해져도(그레이징)
              3가닥이 서로 겹쳐 하나처럼 보이지 않는다(EQUATOR_DIR 고정 오프셋을 썼을 때
              approachDir가 거의 EQUATOR_DIR와 나란해지는 겨울 근접 구간에서 3가닥이 겹쳐
              1가닥처럼 보이던 결함 - 스틸 선점검 f699). */}
          {[-beamSpread, 0, beamSpread].map((off2, i) => {
            const perp = { x: -approachDir.y, y: approachDir.x };
            const lx = landX + perp.x * off2;
            const ly = landY + perp.y * off2;
            return (
              <ThickArrow
                key={i}
                x1={lx - approachDir.x * rayLen} y1={ly - approachDir.y * rayLen}
                x2={lx} y2={ly} color={accent} width={12}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================
 * SunAngleGroundView: 지평선 클로즈업 - 직사광/긴 낮 vs 비스듬한 빛/짧은 낮 비교 (s5)
 * ============================================================ */

export const SUN_ANGLE_GROUND_VB_W = 620;
export const SUN_ANGLE_GROUND_VB_H = 620;

const GROUND_Y = 460;
const SKY_CX = 310;
const SKY_R = 300;

export interface SunAngleGroundViewProps {
  width: number;
  x: number;
  y: number;
  /** 0=직사광(수직에 가까움) ~ 1=비스듬한 빛(수평에 가까움) */
  obliqueT: number;
  /** 하늘 아치에서 "낮" 구간이 차지하는 비율 (0~1, 기본 0.5) */
  dayFraction?: number;
  /** 0~1, 화살표 등장 */
  rayProgress?: number;
  stroke?: string;
  skyDayColor?: string;
  skyNightColor?: string;
  groundColor?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const SunAngleGroundView: React.FC<SunAngleGroundViewProps> = ({
  width, x, y, obliqueT, dayFraction = 0.5, rayProgress = 1,
  stroke = C.ink, skyDayColor = C.gold, skyNightColor = C.nightMid, groundColor = C.leaf, accent = C.coral,
  style,
}) => {
  const t = clamp01(obliqueT);
  const rp = clamp01(rayProgress);
  const df = clamp01(dayFraction);

  // 하늘 반원(180도)을 낮/밤 두 구간으로 나눈다 - 낮 구간은 왼쪽부터 df 비율만큼
  const dayEndDeg = 180 * df;
  const arcPoint = (deg: number) => {
    const a = Math.PI - (deg * Math.PI) / 180; // 180deg(왼쪽)->0deg(오른쪽)
    return { x: SKY_CX + Math.cos(a) * SKY_R, y: GROUND_Y - Math.sin(a) * SKY_R };
  };
  const dayArcPts: string[] = [];
  for (let i = 0; i <= 30; i++) dayArcPts.push(`${arcPoint((i / 30) * dayEndDeg).x.toFixed(1)},${arcPoint((i / 30) * dayEndDeg).y.toFixed(1)}`);
  const nightArcPts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const d = dayEndDeg + (i / 30) * (180 - dayEndDeg);
    nightArcPts.push(`${arcPoint(d).x.toFixed(1)},${arcPoint(d).y.toFixed(1)}`);
  }

  // 각도 보간 - 0(steep, 거의 수직 79도) ~ 1(oblique, 아주 낮음 22도)
  const hitDeg = lerp(79, 22, t);
  const hitRad = (hitDeg * Math.PI) / 180;
  const landX = SKY_CX;
  const landY = GROUND_Y;
  const rayDirV = { x: -Math.cos(hitRad), y: -Math.sin(hitRad) };
  const rayLen = 300;
  const spread = t < 0.001 ? 34 : 34 + t * 46; // 비스듬할수록 같은 빛다발이 더 넓게 퍼져 약해 보임

  return (
    <svg
      viewBox={`0 0 ${SUN_ANGLE_GROUND_VB_W} ${SUN_ANGLE_GROUND_VB_H}`} width={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      <path d={`M ${dayArcPts.join(' L ')} L ${SKY_CX} ${GROUND_Y} Z`} fill={skyDayColor} opacity={0.32} />
      <path d={`M ${nightArcPts.join(' L ')} L ${SKY_CX} ${GROUND_Y} Z`} fill={skyNightColor} opacity={0.22} />
      <line x1={SKY_CX - SKY_R} y1={GROUND_Y} x2={SKY_CX + SKY_R} y2={GROUND_Y} stroke={stroke} strokeWidth={SW_THIN} strokeDasharray="4 12" opacity={0.5} />

      <rect x={0} y={GROUND_Y} width={SUN_ANGLE_GROUND_VB_W} height={SUN_ANGLE_GROUND_VB_H - GROUND_Y} fill={groundColor} />
      <line x1={0} y1={GROUND_Y} x2={SUN_ANGLE_GROUND_VB_W} y2={GROUND_Y} stroke={stroke} strokeWidth={SW} strokeLinecap="round" />

      {rp > 0.01 ? (
        <g opacity={rp}>
          <line
            x1={landX} y1={landY} x2={landX} y2={landY - 60}
            stroke={C.inkSoft} strokeWidth={SW_HAIR_LOCAL} strokeDasharray="3 8"
          />
          {[-spread, 0, spread].map((off, i) => (
            <ThickArrow
              key={i}
              x1={landX + off - rayDirV.x * rayLen * rp} y1={landY - rayDirV.y * rayLen * rp}
              x2={landX + off} y2={landY}
              color={accent} width={14}
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
};
