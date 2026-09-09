/** "달의 중력이 지구를 잡아당겨 가까운 쪽 바닷물이 볼록해지고, 반대쪽 바닷물도 똑같이
 *  볼록해진다. 지구가 자전하며 이 두 볼록한 자리를 하루 동안 한 바퀴 돌면서 지나가서(=하루
 *  두 번) 밀물·썰물이 반복된다"는 조석 구조를 보여주는 다이어그램(바다가 하루 두 번 들어왔다
 *  나가는 이유). 지구를 위에서 본 단순한 원(대륙 디테일 없음)과 그걸 감싼 바다 링으로만
 *  그리고, 달/해도 표면 디테일 없는 원으로 그린다(오케스트레이터 지시 - 사실적으로 그리지
 *  않는다, 축척도 화면에 읽히게만 잡는다). 힘은 굵은 화살표 2개로만 표시하고 방사형 잔
 *  화살표는 쓰지 않는다.
 *
 *  `bulgeNearProgress`(0~1, 달과 가까운 쪽 바다가 볼록해지는 정도, s3)와
 *  `bulgeFarProgress`(0~1, 반대쪽 바다가 볼록해지는 정도, s4)를 독립 진행도로 받는다 -
 *  SaltCycleDiagram·CaffeineReceptorDiagram과 같은 원칙대로 bulgeFarProgress는
 *  bulgeNearProgress=1이 이미 유지된 상태를 전제로 이어받는다. `rotateProgress`(0~1, s5 -
 *  지구 표면의 관측 지점 핀이 정북에서 시작해 시계방향으로 한 바퀴(360°) 돌면서 두 볼록한
 *  자리를 각각 한 번씩=하루 두 번 지나간다. 볼록 모양 자체는 nearAmp/farAmp 고정, 핀만
 *  돈다. 통과 시점은 progress 0.25/0.75 - 매 프레임 같은 각도 계산에서 나오는 고정값이라
 *  임의성이 없다, 원칙 3)를 받는다. `alignProgress`(0~1, s7 전용 별도 모드 - bulgeNear/Far/
 *  rotate와 동시에 쓰지 않는다. 해-달이 지구 한쪽에 나란히 서고 두 힘이 겹쳐 지구의 조석
 *  팽대가 평소보다 크게 부푼다 - 사리)를 받는다.
 *
 *  같은 파일에 `ShoreLevel`(해안 수위선 하나의 높낮이로 밀물/썰물을 보여주는 패널, s1·s6)도
 *  같이 둔다 - MilkCurdleDiagram/MilkClump, AirplaneWingDiagram/AirplaneSide와 같은 "핵심
 *  다이어그램 + 같은 소재의 보조 시각 언어를 한 파일에" 관례.
 *
 *  "가까운 쪽과 먼 쪽이 대칭으로 부푸는" 구조를 갖는 다른 소재(다른 궤도 천체의 조석 등),
 *  "수위선 하나의 높낮이 변화" 구조를 갖는 다른 소재(강물 범람, 저수지 수위 등) 재사용
 *  가능성이 있어 에피소드 로컬이 아니라 여기 등록한다(02-script-v1.md 자산 목록).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW_THIN } from '../theme';

export const TIDE_VB_W = 900;
export const TIDE_VB_H = 760;

const EARTH_CX = 330;
const EARTH_CY = 400;
const EARTH_R = 190;
const MOON_CX = 770;
const MOON_CY = 400;
const MOON_R = 64;
const OCEAN_BASE = 22;
const OCEAN_BULGE = 92;
const RING_STEPS = 96;

/** 정렬 모드 좌표는 "해-달-지구가 겹치지 않고 한 줄에 들어가야" 하므로 bulge/rotate
 *  모드보다 몸통을 작게 잡았다. 팽대가 최대(ap=1)일 때도 지구 팽대 왼쪽 끝(near 방향)이
 *  달의 오른쪽 끝을 침범하지 않도록 간격을 실측으로 맞췄다(v1에서 달이 팽대 안에 파묻히는
 *  결함이 실제로 나서 재조정 - 스틸 선점검) */
const ALIGN_EARTH_CX = 660;
const ALIGN_EARTH_CY = 430;
const ALIGN_EARTH_R = 130;
const ALIGN_MOON_CX = 350;
const ALIGN_MOON_CY_START = 200;
const ALIGN_MOON_CY_END = 430;
const ALIGN_MOON_R = 50;
const ALIGN_SUN_CX = 130;
const ALIGN_SUN_R = 62;
const ALIGN_OCEAN_BASE = 16;
const ALIGN_OCEAN_BULGE = 80;

const smoothstep = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const wrapPi = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** raised-cosine 팽대 lobe. bulgeAngle 기준 ±90도 안에서만 값을 갖고 중심에서 최대다 */
function lobe(theta: number, bulgeAngle: number, amp: number) {
  const c = Math.cos(wrapPi(theta - bulgeAngle));
  return c > 0 ? amp * c * c : 0;
}

function oceanPath(
  cx: number, cy: number, baseR: number, nearAmp: number, farAmp: number, nearAngle: number, farAngle: number,
) {
  const pts: string[] = [];
  for (let i = 0; i <= RING_STEPS; i++) {
    const theta = (i / RING_STEPS) * Math.PI * 2;
    const r = baseR + lobe(theta, nearAngle, nearAmp) + lobe(theta, farAngle, farAmp);
    pts.push(`${(cx + Math.cos(theta) * r).toFixed(1)},${(cy + Math.sin(theta) * r).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function ThickArrow({
  x1, y1, x2, y2, color, width = 16,
}: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const headLen = width * 2.2;
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

function SunIcon({
  cx, cy, r, color, stroke,
}: { cx: number; cy: number; r: number; color: string; stroke: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  return (
    <g>
      {rays.map((ang) => (
        <line
          key={ang}
          x1={cx + Math.cos(ang) * (r + 14)} y1={cy + Math.sin(ang) * (r + 14)}
          x2={cx + Math.cos(ang) * (r + 42)} y2={cy + Math.sin(ang) * (r + 42)}
          stroke={color} strokeWidth={12} strokeLinecap="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={color} stroke={stroke} strokeWidth={SW_THIN} />
    </g>
  );
}

interface BulgeContentProps {
  nearP: number; farP: number; rp?: number;
  stroke: string; mutedStroke: string; landColor: string; oceanColor: string; moonColor: string; accent: string;
}

function BulgeContent({
  nearP, farP, rp, stroke, mutedStroke, landColor, oceanColor, moonColor, accent,
}: BulgeContentProps) {
  const nearAmp = OCEAN_BULGE * smoothstep(nearP);
  const farAmp = OCEAN_BULGE * smoothstep(farP);
  const nearAngle = 0; // 동쪽(달 방향)
  const farAngle = Math.PI;

  const pinAngle = rp !== undefined ? -Math.PI / 2 + rp * Math.PI * 2 : undefined;
  const nearPass = rp !== undefined ? clamp01((rp - 0.25) / 0.05) : 0;
  const farPass = rp !== undefined ? clamp01((rp - 0.75) / 0.05) : 0;
  const nearClose = pinAngle !== undefined ? Math.max(0, 1 - Math.abs(wrapPi(pinAngle - nearAngle)) / 0.5) : 0;
  const farClose = pinAngle !== undefined ? Math.max(0, 1 - Math.abs(wrapPi(pinAngle - farAngle)) / 0.5) : 0;
  const closeMax = Math.max(nearClose, farClose);

  const arrowOpacityNear = clamp01(nearP / 0.25);
  const arrowOpacityFar = clamp01(farP / 0.25);

  return (
    <>
      {(nearP > 0.02 || farP > 0.02 || rp !== undefined) ? (
        <line
          x1={EARTH_CX} y1={EARTH_CY} x2={MOON_CX} y2={MOON_CY}
          stroke={mutedStroke} strokeWidth={SW_THIN} strokeDasharray="10 12" opacity={0.5}
        />
      ) : null}

      <path
        d={oceanPath(EARTH_CX, EARTH_CY, EARTH_R + OCEAN_BASE, nearAmp, farAmp, nearAngle, farAngle)}
        fill={oceanColor} opacity={0.92}
      />
      <circle cx={EARTH_CX} cy={EARTH_CY} r={EARTH_R} fill={landColor} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={MOON_CX} cy={MOON_CY} r={MOON_R} fill={moonColor} stroke={stroke} strokeWidth={SW_THIN} />

      {arrowOpacityNear > 0.01 ? (
        <g opacity={arrowOpacityNear}>
          {/* 달 표면에서 시작해 팽대 바로 앞까지 - 팽대가 자랄수록 화살표가 짧아지며
              "당겨서 저기까지 부풀었다"는 인상을 준다(스틸 선점검에서 너무 짧아 거의 안 보이던
              v1을 고쳤다 - 시작점을 달 가장자리 그대로, 끝점을 팽대 가장자리 바로 앞으로) */}
          <ThickArrow
            x1={MOON_CX - MOON_R} y1={MOON_CY}
            x2={EARTH_CX + EARTH_R + OCEAN_BASE + nearAmp - 8} y2={EARTH_CY}
            color={accent}
          />
        </g>
      ) : null}
      {arrowOpacityFar > 0.01 ? (
        <g opacity={arrowOpacityFar}>
          <ThickArrow
            x1={EARTH_CX - EARTH_R * 0.35} y1={EARTH_CY}
            x2={EARTH_CX - EARTH_R - OCEAN_BASE - farAmp - 26} y2={EARTH_CY}
            color={accent}
          />
        </g>
      ) : null}

      {pinAngle !== undefined ? (
        <g>
          <circle
            cx={EARTH_CX + Math.cos(nearAngle) * (EARTH_R - 14)} cy={EARTH_CY + Math.sin(nearAngle) * (EARTH_R - 14)}
            r={14} fill={accent} opacity={nearPass}
          />
          <circle
            cx={EARTH_CX + Math.cos(farAngle) * (EARTH_R - 14)} cy={EARTH_CY + Math.sin(farAngle) * (EARTH_R - 14)}
            r={14} fill={accent} opacity={farPass}
          />
          <circle
            cx={EARTH_CX + Math.cos(pinAngle) * (EARTH_R - 14)} cy={EARTH_CY + Math.sin(pinAngle) * (EARTH_R - 14)}
            r={30 + closeMax * 26} fill={accent} opacity={closeMax * 0.35}
          />
          <circle
            cx={EARTH_CX + Math.cos(pinAngle) * (EARTH_R - 14)} cy={EARTH_CY + Math.sin(pinAngle) * (EARTH_R - 14)}
            r={17} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN}
          />
        </g>
      ) : null}
    </>
  );
}

interface AlignContentProps {
  ap: number;
  stroke: string; mutedStroke: string; landColor: string; oceanColor: string; moonColor: string; sunColor: string; accent: string;
}

function AlignContent({
  ap, stroke, mutedStroke, landColor, oceanColor, moonColor, sunColor, accent,
}: AlignContentProps) {
  const settleT = smoothstep(clamp01(ap / 0.5));
  const moonCy = lerp(ALIGN_MOON_CY_START, ALIGN_MOON_CY_END, settleT);
  const bulgeT = smoothstep(clamp01((ap - 0.45) / 0.5));
  const amp = ALIGN_OCEAN_BULGE * bulgeT;
  const lineOpacity = clamp01((ap - 0.42) / 0.2);
  const arrowOpacity = clamp01((ap - 0.55) / 0.35);
  const nearAngle = Math.PI; // 왼쪽(해-달 방향)
  const farAngle = 0;
  const earthEdgeX = ALIGN_EARTH_CX - ALIGN_EARTH_R - ALIGN_OCEAN_BASE - amp - 20;

  return (
    <>
      <line
        x1={ALIGN_SUN_CX} y1={ALIGN_EARTH_CY} x2={ALIGN_EARTH_CX} y2={ALIGN_EARTH_CY}
        stroke={mutedStroke} strokeWidth={SW_THIN} strokeDasharray="10 12" opacity={lineOpacity}
      />
      <path
        d={oceanPath(ALIGN_EARTH_CX, ALIGN_EARTH_CY, ALIGN_EARTH_R + ALIGN_OCEAN_BASE, amp, amp, nearAngle, farAngle)}
        fill={oceanColor} opacity={0.92}
      />
      <circle cx={ALIGN_EARTH_CX} cy={ALIGN_EARTH_CY} r={ALIGN_EARTH_R} fill={landColor} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={ALIGN_MOON_CX} cy={moonCy} r={ALIGN_MOON_R} fill={moonColor} stroke={stroke} strokeWidth={SW_THIN} />
      <SunIcon cx={ALIGN_SUN_CX} cy={ALIGN_EARTH_CY} r={ALIGN_SUN_R} color={sunColor} stroke={stroke} />

      {arrowOpacity > 0.01 ? (
        <g opacity={arrowOpacity}>
          <ThickArrow x1={ALIGN_SUN_CX + ALIGN_SUN_R + 50} y1={ALIGN_EARTH_CY - 26} x2={earthEdgeX} y2={ALIGN_EARTH_CY - 26} color={accent} />
          <ThickArrow x1={ALIGN_MOON_CX} y1={moonCy + 24} x2={earthEdgeX} y2={ALIGN_EARTH_CY + 26} color={accent} />
        </g>
      ) : null}
    </>
  );
}

export interface TideDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 달과 가까운 쪽 바다가 볼록해지는 정도. 0~1 (s3) */
  bulgeNearProgress?: number;
  /** 반대쪽 바다가 볼록해지는 정도. 0~1 - bulgeNearProgress=1 전제 (s4) */
  bulgeFarProgress?: number;
  /** 자전 핀이 볼록한 두 자리를 지나가는 정도. 0~1, 정북 시작 시계방향 1바퀴 (s5) */
  rotateProgress?: number;
  /** 해-달-지구 일직선 배치 모드(별도, 위 3개와 동시에 안 씀). 0~1 (s7) */
  alignProgress?: number;
  /** 선·핀·기준선 색. 어두운 배경(NightSkyBg 등)에서는 밝은 색(C.cream 등)으로 override한다 */
  stroke?: string;
  mutedStroke?: string;
  landColor?: string;
  oceanColor?: string;
  moonColor?: string;
  sunColor?: string;
  /** 힘 화살표·통과 마커 색 */
  accent?: string;
  style?: React.CSSProperties;
}

export const TideDiagram: React.FC<TideDiagramProps> = ({
  width, x = 0, y = 0,
  bulgeNearProgress, bulgeFarProgress, rotateProgress, alignProgress,
  stroke = C.ink, mutedStroke = C.inkSoft,
  landColor = C.leaf, oceanColor = C.waterCool, moonColor = C.hillFar, sunColor = C.gold,
  accent = C.coral, style,
}) => {
  const scale = width / TIDE_VB_W;
  const height = TIDE_VB_H * scale;
  const ap = alignProgress !== undefined ? clamp01(alignProgress) : undefined;
  const nearP = bulgeNearProgress !== undefined ? clamp01(bulgeNearProgress) : 0;
  const farP = bulgeFarProgress !== undefined ? clamp01(bulgeFarProgress) : 0;
  const rp = rotateProgress !== undefined ? clamp01(rotateProgress) : undefined;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${TIDE_VB_W} ${TIDE_VB_H}`} style={{ overflow: 'visible' }}>
        {ap !== undefined ? (
          <AlignContent
            ap={ap} stroke={stroke} mutedStroke={mutedStroke} landColor={landColor}
            oceanColor={oceanColor} moonColor={moonColor} sunColor={sunColor} accent={accent}
          />
        ) : (
          <BulgeContent
            nearP={nearP} farP={farP} rp={rp} stroke={stroke} mutedStroke={mutedStroke}
            landColor={landColor} oceanColor={oceanColor} moonColor={moonColor} accent={accent}
          />
        )}
      </svg>
    </div>
  );
};

/* ================================================================
 * ShoreLevel - 해안 수위선 하나의 높낮이로 밀물/썰물을 보여주는 패널 (s1, s6)
 * ================================================================ */

export const SHORE_VB_W = 1080;
export const SHORE_VB_H = 1920;
const SHORE_HORIZON_Y = 420;
/** shoreY(수위선 y좌표) 자체가 아니라 "물이 차지하는 면적"이 기준이다 - 수평선~shoreY 구간이
 *  바다이므로 shoreY가 클수록(화면 아래쪽일수록) 바다가 차지하는 면적이 넓어진다(밀물).
 *  v1에서 이 둘을 헷갈려 밀물/썰물이 뒤바뀐 채로 나갈 뻔했다(스틸 선점검, s1/s6에서
 *  물이 빠지는 장면인데 오히려 차오르는 것처럼 보여 발견) */
const SHORE_Y_AT_LOW_TIDE = 820; // 썰물 - 수위선이 수평선 가까이, 바다 면적이 작다
const SHORE_Y_AT_HIGH_TIDE = 1620; // 밀물 - 수위선이 화면 아래쪽까지, 바다 면적이 크다
const SHORE_WET_BAND_H = 60;

export interface ShoreLevelProps {
  width: number;
  x?: number;
  y?: number;
  /** 0(썰물, 물이 빠짐) ~ 1(밀물, 물이 참) */
  level: number;
  /** 물결선용. 없으면 정지 화면 */
  frame?: number;
  skyColor?: string;
  seaDeepColor?: string;
  sandColor?: string;
  wetSandColor?: string;
  lineColor?: string;
  style?: React.CSSProperties;
}

export const ShoreLevel: React.FC<ShoreLevelProps> = ({
  width, x = 0, y = 0, level, frame = 0,
  skyColor = C.sky, seaDeepColor = C.seaDeep, sandColor = C.goldSoft, wetSandColor = C.gold,
  lineColor = C.waterCool, style,
}) => {
  const lv = clamp01(level);
  const scale = width / SHORE_VB_W;
  const height = SHORE_VB_H * scale;
  const shoreY = lerp(SHORE_Y_AT_LOW_TIDE, SHORE_Y_AT_HIGH_TIDE, lv);
  const wob = Math.sin(frame / 34) * 8;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'hidden', ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${SHORE_VB_W} ${SHORE_VB_H}`}>
        <rect x={0} y={0} width={SHORE_VB_W} height={SHORE_HORIZON_Y} fill={skyColor} />
        <rect x={0} y={SHORE_HORIZON_Y} width={SHORE_VB_W} height={shoreY - SHORE_HORIZON_Y} fill={seaDeepColor} />
        <path
          d={`M -20 ${shoreY + wob} Q ${SHORE_VB_W * 0.25} ${shoreY - 18 + wob} ${SHORE_VB_W * 0.5} ${shoreY + wob}
              T ${SHORE_VB_W + 20} ${shoreY + wob}`}
          fill="none" stroke={lineColor} strokeWidth={8} strokeLinecap="round" opacity={0.7}
        />
        <rect x={0} y={shoreY} width={SHORE_VB_W} height={SHORE_WET_BAND_H} fill={wetSandColor} />
        <rect
          x={0} y={shoreY + SHORE_WET_BAND_H} width={SHORE_VB_W}
          height={SHORE_VB_H - shoreY - SHORE_WET_BAND_H} fill={sandColor}
        />
      </svg>
    </div>
  );
};

export default TideDiagram;
