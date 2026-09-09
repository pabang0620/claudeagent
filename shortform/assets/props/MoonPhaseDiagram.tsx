/** "태양은 항상 달의 절반을 비추고, 달이 지구 둘레를 도는 동안 그 빛나는 절반 중 지구에서
 *  보이는 부분이 계속 달라져서 초승달~보름달로 보인다"는 구조를 보여주는 범용 다이어그램
 *  (달 모양이 바뀌는 게 그림자 때문이 아닌 이유, general-ep94). REGISTRY 확인 완료 -
 *  EarthOrbitDiagram(ep62, 지구-태양 궤도+자전축 기울기)과 ParallaxDiagram(ep42, 지구-달
 *  거리·시차)을 먼저 봤으나 둘 다 "고정된 절반이 빛나고, 보는 각도에 따라 보이는 부분이
 *  달라진다"는 위상 변화 구조 자체는 다루지 않아 새로 만들었다. EarthOrbitDiagram과 같은
 *  설계 원칙(독립 progress props, undefined면 그 레이어를 안 그림, 천체는 표면 디테일 없는
 *  단순한 원)을 그대로 따른다.
 *
 *  X 표시는 이 파일 안에 굽지 않는다. ep62 S2WrongDistance와 같은 관례로, 오해(그림자가
 *  달을 덮는 이미지)를 그리는 `mythProgress` 레이어는 틀린 이미지만 그리고, X 자체는
 *  호출하는 씬이 `QMark`(props/Symbols.tsx)를 그 이미지 위에 별도로 얹는다(70화 사고 재발
 *  방지 - X가 붙는 대상을 다이어그램 내부 좌표 계산과 분리해 잘못 붙일 여지를 줄인다).
 *
 *  월식(`eclipseProgress`)은 오해가 아니라 실제로 일어나는 별개의 드문 현상이다 - 태양-
 *  지구-달이 일직선으로 정렬되고 지구 그림자가 실제로 달에 닿는 장면을 그대로 보여주며,
 *  이 레이어에는 X를 절대 얹지 않는다(달이 매일 모양을 바꾸는 이유와 헷갈리지 않도록 별도
 *  정렬 구도 + "월식" 라벨은 호출 씬이 Label로 붙인다).
 *
 *  핵심 물리: 태양은 항상 고정된 절대 방향(SUN_DIR=위쪽)에서 빛을 비추므로, 궤도 위 어느
 *  위치에 있든 달의 "빛나는 절반"은 항상 화면상 같은 방향(위쪽)을 향한다(`orbitAngle`
 *  모드에서 halfDiscPath를 고정 axisAngle로 그리는 이유 - EarthOrbitDiagram의 NORTH_DIR
 *  고정과 같은 정신). 지구에서 실제로 보이는 위상(초승~보름)은 지구-달을 잇는 시선 방향과
 *  이 고정된 태양 방향 사이의 각도로 정해지며, 이 각도 관계에서 정확한 초승달/반달/보름달
 *  실루엣을 뽑아내는 `moonPhasePath` 함수는 표준 천문 다이어그램에 쓰이는 타원 터미네이터
 *  공식(반달에서 터미네이터가 직선, 신월/보름에서 원과 겹치는 두 극단)을 그대로 구현한
 *  것이라 궤도 위 어느 지점에서도 항상 물리적으로 올바른 실루엣이 나온다(좌표를 손으로
 *  다시 그리지 않는다 - 원칙 0-1과 같은 정신을 수식에도 적용).
 *
 *  같은 파일에 `MoonPhaseIcon`(독립 재사용 가능한 작은 위상 아이콘 - s5 초승달/반달/보름달
 *  순서 나열, s7 그믐/보름 나란히 비교에 그대로 씀)도 함께 둔다(EarthOrbitDiagram+
 *  SunAngleGroundView와 같은 "핵심 다이어그램 + 같은 소재의 보조 시각 언어를 한 파일에"
 *  관례).
 *
 *  "고정된 광원 방향과 관측 각도의 관계로 보이는 형태가 달라지는" 구조를 갖는 다른 소재
 *  (인공위성 위상, 행성 위상 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기
 *  등록한다(02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const MOON_PHASE_VB_W = 900;
export const MOON_PHASE_VB_H = 900;

const CX = 450;
const CY = 450;
const SW_HAIR_MOON = 6;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

interface Pt { x: number; y: number }

/* ============================================================
 * 위상 실루엣 경로 (타원 터미네이터 공식)
 * p: 0 = 그믐(신월), 0.25 = 상현(오른쪽 반달), 0.5 = 보름, 0.75 = 하현(왼쪽 반달), 1 = 그믐
 * 유도·검증 근거는 파일 상단 주석 참고 - 반달(p=0.25/0.75)에서 터미네이터가 정확히 직선이
 * 되고, 그믐/보름에서 안쪽 타원 호가 바깥 반원과 정확히 겹쳐 각각 면적 0/전체 원이 된다.
 * ============================================================ */
function moonPhasePath(cx: number, cy: number, r: number, p: number): string {
  const pp = ((p % 1) + 1) % 1;
  const t = (1 - Math.cos(2 * Math.PI * pp)) / 2; // 밝은 비율 0~1
  const litRight = pp < 0.5;
  const outerSweep = litRight ? 1 : 0;
  const innerSweep = t < 0.5 ? 1 - outerSweep : outerSweep;
  const rx = r * Math.abs(1 - 2 * t);
  const top = `${cx},${(cy - r).toFixed(2)}`;
  const bot = `${cx},${(cy + r).toFixed(2)}`;
  return `M ${top} A ${r},${r} 0 0,${outerSweep} ${bot} A ${rx.toFixed(2)},${r} 0 0,${innerSweep} ${top}`;
}

/** 궤도 각도(도, orbitAngle 과 같은 관례 - 표준 수학각 (cosθ,sinθ)) -> 위상 파라미터(0~1).
 *  SUN_DIR=(0,-1)(태양이 항상 화면 위쪽) 고정 전제에서 유도한 값이라, 이 파일의 orbitAngle
 *  모드와 반드시 짝을 이뤄 쓴다. θ=270°(달이 지구-태양 사이, 즉 지구에서 볼 때 태양 쪽)에서
 *  그믐(p=0), θ=90°(지구가 태양-달 사이)에서 보름(p=0.5)이 나온다 - 파일 상단 주석에 임의의
 *  θ 에 대해서도 t 가 실제 조도 공식과 일치함을 검증해 뒀다. */
export function moonOrbitPhaseParam(orbitDeg: number): number {
  return (((orbitDeg - 270) % 360) + 360) % 360 / 360;
}

/* ============================================================
 * MoonPhaseIcon: 독립 재사용 가능한 작은 위상 아이콘 (s5 순서 나열, s7 그믐/보름 비교)
 * ============================================================ */
export const MOON_PHASE_ICON_VB = 220;

export interface MoonPhaseIconProps {
  width: number;
  x: number;
  y: number;
  /** 0=그믐 ~ 0.5=보름 ~ 1=그믐(순환) */
  phase: number;
  /** 0~1. 등장(스케일+불투명도) */
  reveal?: number;
  stroke?: string;
  litColor?: string;
  darkColor?: string;
  style?: React.CSSProperties;
}

export const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({
  width, x, y, phase, reveal = 1, stroke = C.ink, litColor = C.goldSoft, darkColor = C.nightSoft, style,
}) => {
  const rv = clamp01(reveal);
  if (rv <= 0.001) return null;
  const r = MOON_PHASE_ICON_VB / 2 - 12;
  return (
    <svg
      viewBox={`0 0 ${MOON_PHASE_ICON_VB} ${MOON_PHASE_ICON_VB}`} width={width}
      style={{
        position: 'absolute', left: x, top: y, overflow: 'visible',
        transform: `translate(-50%,-50%) scale(${0.72 + 0.28 * rv})`, opacity: rv, ...style,
      }}
      shapeRendering="geometricPrecision"
    >
      <circle cx={110} cy={110} r={r} fill={darkColor} stroke={stroke} strokeWidth={SW_THIN} />
      <path d={moonPhasePath(110, 110, r, phase)} fill={litColor} />
      <circle cx={110} cy={110} r={r} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
    </svg>
  );
};

/* ============================================================
 * MoonPhaseDiagram: 오해(그림자가 덮음) / 월식 / 절반 조명 / 궤도-위상 4개 독립 레이어
 * ============================================================ */

function halfDiscPath(cx: number, cy: number, r: number, dirAngleRad: number, steps = 40): string {
  const pts: string[] = [];
  const start = dirAngleRad - Math.PI / 2;
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * Math.PI;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function ThickArrow({
  x1, y1, x2, y2, color, width = 13,
}: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const headLen = width * 2.1;
  const hx = x2 - Math.cos(ang) * headLen;
  const hy = y2 - Math.sin(ang) * headLen;
  const perp = ang + Math.PI / 2;
  const lx = hx + Math.cos(perp) * width * 0.9;
  const ly = hy + Math.sin(perp) * width * 0.9;
  const rx2 = hx - Math.cos(perp) * width * 0.9;
  const ry2 = hy - Math.sin(perp) * width * 0.9;
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${lx},${ly} ${rx2},${ry2}`} fill={color} />
    </g>
  );
}

function SunGlyph({ cx, cy, r, color, stroke }: { cx: number; cy: number; r: number; color: string; stroke: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  return (
    <g>
      {rays.map((a) => (
        <line
          key={a}
          x1={cx + Math.cos(a) * (r + 10)} y1={cy + Math.sin(a) * (r + 10)}
          x2={cx + Math.cos(a) * (r + 30)} y2={cy + Math.sin(a) * (r + 30)}
          stroke={color} strokeWidth={9} strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={color} stroke={stroke} strokeWidth={SW_THIN} />
    </g>
  );
}

const ORBIT_R = 280;
const ORBIT_EARTH_R = 72;
const ORBIT_MOON_R = 42;
/** orbitAngle 모드에서 궤도 위 달 위치(화면 좌표). 호출 씬이 라벨을 붙일 때 쓴다 */
export function moonPhaseMoonAt(orbitDeg: number, width: number, x: number, y: number): Pt {
  const s = width / MOON_PHASE_VB_W;
  const a = rad(orbitDeg);
  return { x: x + (CX + Math.cos(a) * ORBIT_R) * s, y: y + (CY + Math.sin(a) * ORBIT_R) * s };
}
/** orbitAngle 모드의 지구 중심(화면 좌표) */
export function moonPhaseEarthAt(width: number, x: number, y: number): Pt {
  const s = width / MOON_PHASE_VB_W;
  return { x: x + CX * s, y: y + CY * s };
}
const INSET_X = 148;
const INSET_Y = 762;
/** orbitAngle 모드의 "지구에서 보이는 모습" 인셋 아이콘 중심(화면 좌표) */
export function moonPhaseInsetAt(width: number, x: number, y: number): Pt {
  const s = width / MOON_PHASE_VB_W;
  return { x: x + INSET_X * s, y: y + INSET_Y * s };
}

export interface MoonPhaseDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 0~1. 오해 - 어두운 그림자 원이 달을 밀고 들어와 덮는 모습(X 는 호출 씬이 얹는다) */
  mythProgress?: number;
  /** 0~1. 월식 - 태양-지구-달이 일직선, 지구 그림자가 실제로 달에 닿아 어두워짐 */
  eclipseProgress?: number;
  /** 0~1. 클로즈업 - 태양 빛이 달의 절반을 비춤(항상 오른쪽이 빛나는 절반) */
  litHalfProgress?: number;
  /** 도(연속값). 지구 둘레 궤도 위 달의 위치. 이 값이 있어야 궤도 레이어를 그린다 */
  orbitAngle?: number;
  /** 0~1. 궤도 레이어 전체의 등장(궤도링·지구·달·인셋 아이콘) */
  orbitReveal?: number;
  stroke?: string;
  mutedStroke?: string;
  moonLitColor?: string;
  moonDarkColor?: string;
  earthColor?: string;
  sunColor?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export const MoonPhaseDiagram: React.FC<MoonPhaseDiagramProps> = ({
  width, x, y, mythProgress, eclipseProgress, litHalfProgress, orbitAngle, orbitReveal = 1,
  stroke = C.ink, mutedStroke = C.inkSoft, moonLitColor = C.goldSoft, moonDarkColor = C.nightSoft,
  earthColor = C.sky, sunColor = C.gold, accent = C.coral, style,
}) => {
  const myth = mythProgress !== undefined ? clamp01(mythProgress) : undefined;
  const ecl = eclipseProgress !== undefined ? clamp01(eclipseProgress) : undefined;
  const lit = litHalfProgress !== undefined ? clamp01(litHalfProgress) : undefined;
  const orbitOn = orbitAngle !== undefined;
  const orv = clamp01(orbitReveal);

  return (
    <svg
      viewBox={`0 0 ${MOON_PHASE_VB_W} ${MOON_PHASE_VB_H}`} width={width}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
      shapeRendering="geometricPrecision"
    >
      {myth !== undefined ? (
        <g>
          {/* 오해: 밝은 달 원 위로 어두운 "그림자" 원이 오른쪽에서 밀고 들어와 덮는다 -
              지구 그림자가 매일 조금씩 더 달을 가려서 모양이 바뀐다는 흔한 착각을 그대로
              그린 것이다. X 는 이 씬을 호출하는 컴포넌트가 QMark 로 이 위에 얹는다. */}
          <circle cx={CX} cy={CY} r={210} fill={moonLitColor} stroke={stroke} strokeWidth={SW} />
          <circle
            cx={CX + lerp(210 * 2.3, 210 * 0.9, myth)} cy={CY} r={230}
            fill={moonDarkColor} stroke={stroke} strokeWidth={SW_THIN}
          />
          <circle cx={CX} cy={CY} r={210} fill="none" stroke={stroke} strokeWidth={SW} />
        </g>
      ) : null}

      {ecl !== undefined ? (
        (() => {
          const sunX = 120; const sunY = 450; const sunR = 66;
          const earthX = 450; const earthY = 450; const earthR = 92;
          const moonX = 792; const moonY = 450; const moonR = 54;
          const reach = clamp01(ecl / 0.7);
          const darken = clamp01((ecl - 0.5) / 0.5);
          const tipX = lerp(earthX + earthR + 20, moonX, reach);
          const nearHalf = earthR * 0.92;
          const farHalf = lerp(earthR * 0.92, moonR * 0.85, reach);
          const eclipseColor = C.browning; // 채널 팔레트 안에서 가장 가까운 "어두운 적갈색" 톤
          return (
            <g>
              <line
                x1={sunX} y1={450} x2={moonX} y2={450} stroke={mutedStroke} strokeWidth={SW_HAIR_MOON}
                strokeDasharray="4 14" opacity={0.5}
              />
              <SunGlyph cx={sunX} cy={sunY} r={sunR} color={sunColor} stroke={stroke} />
              <circle cx={earthX} cy={earthY} r={earthR} fill={earthColor} stroke={stroke} strokeWidth={SW_THIN} />
              {reach > 0.01 ? (
                <polygon
                  points={`${earthX + earthR - 6},${earthY - nearHalf} ${earthX + earthR - 6},${earthY + nearHalf} ${tipX},${earthY + farHalf} ${tipX},${earthY - farHalf}`}
                  fill={C.nightMid} opacity={0.62 * reach}
                />
              ) : null}
              <circle
                cx={moonX} cy={moonY} r={moonR}
                fill={darken > 0.01 ? eclipseColor : moonLitColor}
                stroke={stroke} strokeWidth={SW_THIN}
                opacity={1 - darken * 0.15}
              />
            </g>
          );
        })()
      ) : null}

      {lit !== undefined ? (
        <g opacity={lit > 0.02 ? 1 : 0}>
          <circle cx={CX} cy={CY} r={260} fill={moonDarkColor} stroke={stroke} strokeWidth={SW} />
          <path d={halfDiscPath(CX, CY, 260, 0)} fill={moonLitColor} opacity={0.15 + 0.85 * lit} />
          <circle cx={CX} cy={CY} r={260} fill="none" stroke={stroke} strokeWidth={SW} />
          <g opacity={lit}>
            <SunGlyph cx={CX + 470} cy={CY} r={70} color={sunColor} stroke={stroke} />
            {[-140, 0, 140].map((dy, i) => (
              <ThickArrow
                key={i}
                x1={CX + 380} y1={CY + dy * 0.6} x2={CX + 268} y2={CY + dy * 0.42}
                color={accent} width={12}
              />
            ))}
          </g>
        </g>
      ) : null}

      {orbitOn && orv > 0.01 ? (
        <g opacity={orv}>
          <circle cx={CX} cy={CY} r={ORBIT_R} fill="none" stroke={mutedStroke} strokeWidth={SW_THIN} strokeDasharray="4 14" opacity={0.6} />
          {/* 태양은 항상 위쪽(고정)에서 빛을 비춘다 - 화면 위쪽에서 내려오는 굵은 화살 3가닥 */}
          {[-170, 0, 170].map((dx, i) => (
            <ThickArrow key={i} x1={CX + dx} y1={6} x2={CX + dx * 0.6} y2={92} color={sunColor} width={11} />
          ))}
          <circle cx={CX} cy={CY} r={ORBIT_EARTH_R} fill={earthColor} stroke={stroke} strokeWidth={SW_THIN} />

          {(() => {
            const a = rad(orbitAngle as number);
            const mx = CX + Math.cos(a) * ORBIT_R;
            const my = CY + Math.sin(a) * ORBIT_R;
            const p = moonOrbitPhaseParam(orbitAngle as number);
            return (
              <g>
                <line x1={CX} y1={CY} x2={mx} y2={my} stroke={accent} strokeWidth={SW_HAIR_MOON} strokeDasharray="3 10" opacity={0.7} />
                <circle cx={mx} cy={my} r={ORBIT_MOON_R} fill={moonDarkColor} stroke={stroke} strokeWidth={SW_THIN} />
                <path d={halfDiscPath(mx, my, ORBIT_MOON_R, -Math.PI / 2)} fill={moonLitColor} />
                <circle cx={mx} cy={my} r={ORBIT_MOON_R} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
                {/* 지구에서 보이는 모습 인셋 */}
                <line x1={INSET_X} y1={INSET_Y - 96} x2={CX} y2={CY} stroke={mutedStroke} strokeWidth={SW_HAIR_MOON} strokeDasharray="2 10" opacity={0.5} />
                <circle cx={INSET_X} cy={INSET_Y} r={86} fill={moonDarkColor} stroke={stroke} strokeWidth={SW_THIN} />
                <path d={moonPhasePath(INSET_X, INSET_Y, 86, p)} fill={moonLitColor} />
                <circle cx={INSET_X} cy={INSET_Y} r={86} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
              </g>
            );
          })()}
        </g>
      ) : null}
    </svg>
  );
};

export default MoonPhaseDiagram;
