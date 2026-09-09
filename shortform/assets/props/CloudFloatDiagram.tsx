/** "구름은 눈에 안 보일 만큼 작은 물방울 수십억 개가 뭉친 것이고, 그 물방울 하나하나가
 *  너무 작아 떨어지는 속도가 아주 느린 데다, 밑에서 데워진 공기가 계속 올라오며 떠받쳐서
 *  하늘에 머문다"는 인과를 보여주는 다이어그램(그 무거운 구름이 하늘에 떠 있는 이유,
 *  general-ep59). AirplaneWingDiagram·SaltCycleDiagram과 같은 설계(독립 레이어, undefined면
 *  안 그림) - 단 이 화는 s3~s6의 화면 구성이 서로 크게 달라(구름 확대/낙하 비교/상승기류/
 *  저울) 레이어마다 자기 완결적인 하위 구성을 갖는다. 4개 레이어 중 `weighProgress`만 큰
 *  구름을 안 그리고 저울 구도로 독립 전환한다(둘 다 그리면 화면이 복잡해져서, 스틸
 *  선점검 관찰 기준).
 *
 *  구름 실루엣은 Tabler Icons(MIT, 이미 이 프로젝트가 쓰는 아이콘셋)의 `cloud` 아이콘
 *  path를 그대로 가져와 큰 사이즈로 썼다(원칙 0-1과 같은 정신 - 좌표를 눈대중으로 다시
 *  그리지 않는다). 원본 stroke-only path가 시작점과 끝점이 정확히 일치해(H6.657로
 *  복귀) 닫힌 실루엣으로 채울 수 있다.
 *
 *  오케스트레이터 지시(이 화 시각 주의사항) 반영:
 *   - 구름 자체는 뭉게뭉게한 단순한 실루엣 하나로 충분하다(내부 텍스처 없음).
 *   - 작은 물방울과 큰 빗방울의 "크기 대비"가 이 화의 중심이라 fallProgress는 반드시
 *     둘을 나란히 놓고 같은 시간 동안 서로 다른 거리를 떨어지는 모습으로 보여준다
 *     (물방울을 화면에 잔뜩 뿌리지 않고 비교용 2개만 크게).
 *   - 공기 저항(상승기류)은 굵은 화살표 딱 2개로만(작은 화살표 방사형 금지).
 *   - "징그럽다" 재발 방지: 물방울은 전부 매끈한 원/눈물방울 도형이고, 세균·질감 텍스처는
 *     없다.
 *
 *   - dropletsProgress : 0~1. 큰 구름 실루엣(항상 그림) 오른쪽 아래에 돋보기 모양 확대
 *     콜아웃 원이 자라나고, 그 안에 물방울 점 여러 개가 순서대로 팝인한다("확대하면
 *     이렇게 작은 물방울들로 이루어져 있다"). s3용.
 *   - fallProgress     : 0~1. 작은 구름(같은 실루엣, 작게) 아래로 아주 작은 물방울 하나와
 *     훨씬 큰 눈물방울(빗방울) 하나가 나란히 낙하한다. 같은 시간(progress) 동안 작은
 *     물방울은 아주 조금만, 큰 빗방울은 훨씬 멀리 떨어져 궤적 길이 자체가 속도 차이를
 *     보여준다. 뒤에 옅어지는 궤적선을 남긴다. s4용.
 *   - updraftProgress  : 0~1. 큰 구름(항상 그림) 아래쪽에 작은 물방울 4개가 매달려 있고,
 *     구름 밑에서 굵은 상승기류 화살표 2개가 자라나며 물방울들을 살짝 밀어 올린다. s5용.
 *   - weighProgress    : 0~1. 저울(받침대+빔+두 접시). 왼쪽 접시엔 작은 구름, 오른쪽
 *     접시엔 코끼리 실루엣이 순서대로 팝인. weighProgress가 올라갈수록 빔이 코끼리 쪽으로
 *     기운다(정확한 숫자 없이 "무겁다"만 표현). 이 레이어가 정의되면 위쪽 큰 구름은
 *     안 그린다(화면이 복잡해지는 것을 막기 위한 독립 전환). s6용.
 *
 *  전부 undefined면 큰 구름 실루엣만 보이는 정지 다이어그램이 된다(s1 무성 구간에서
 *  "하늘 위 구름"으로 재사용).
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const CLOUD_FLOAT_VB_W = 640;
export const CLOUD_FLOAT_VB_H = 820;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const band = (v: number, a: number, b: number) => smooth((v - a) / Math.max(0.0001, b - a));

/* ---------------- 구름 실루엣 (Tabler `cloud` 아이콘 path, MIT, 24x24 원본) ---------------- */
const CLOUD_D = 'M6.657 18C4.085 18 2 15.993 2 13.517s2.085-4.482 4.657-4.482c.393-1.762 1.794-3.2 '
  + '3.675-3.773c1.88-.572 3.956-.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 '
  + '3.464 3.486s-1.551 3.487-3.465 3.487H6.657';
/** 원본 path의 대략적 중심(bounding box 중심, x:2~22.9 y:5.26~18) - translate 기준점 */
const CLOUD_CENTER_RAW = { x: 12.45, y: 11.6 };

function CloudPuff({
  cx, cy, scale, fill, stroke, strokeWidth,
}: { cx: number; cy: number; scale: number; fill: string; stroke: string; strokeWidth: number }) {
  const tx = cx - CLOUD_CENTER_RAW.x * scale;
  const ty = cy - CLOUD_CENTER_RAW.y * scale;
  return (
    <g transform={`translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(3)})`}>
      <path d={CLOUD_D} fill={fill} stroke={stroke} strokeWidth={strokeWidth / scale} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- 큰 구름(항상 그림, dropletsProgress·updraftProgress·s1 정지화면 공용) ---------------- */
const MAIN_CLOUD_CX = 320;
const MAIN_CLOUD_CY = 260;
const MAIN_CLOUD_SCALE = 18.5;
/** MAIN_CLOUD_SCALE 기준 대략적 폭(22.9-2)*scale, 높이(18-5.26)*scale - 콜아웃·화살표 배치 기준 */
const MAIN_CLOUD_HALF_W = ((22.9 - 2) / 2) * MAIN_CLOUD_SCALE;
const MAIN_CLOUD_BOTTOM_Y = MAIN_CLOUD_CY + (18 - CLOUD_CENTER_RAW.y) * MAIN_CLOUD_SCALE;

/* ---------------- s3: 돋보기 확대 콜아웃 안 물방울들 (golden-angle spiral, 결정적) ---------------- */
const DOT_COUNT = 14;
const CALLOUT_CX = MAIN_CLOUD_CX + MAIN_CLOUD_HALF_W - 30;
const CALLOUT_CY = MAIN_CLOUD_BOTTOM_Y + 150;
const CALLOUT_R = 128;
const GOLDEN_DEG = 137.50776;
const DOT_PTS: { x: number; y: number; r: number }[] = Array.from({ length: DOT_COUNT }, (_, i) => {
  const rad = (i * GOLDEN_DEG * Math.PI) / 180;
  const rr = CALLOUT_R * 0.72 * Math.sqrt((i + 0.5) / DOT_COUNT);
  return {
    x: CALLOUT_CX + rr * Math.cos(rad),
    y: CALLOUT_CY + rr * Math.sin(rad),
    r: 9 + (i % 3) * 2.5,
  };
});

/* ---------------- 화살(선+화살촉). AirplaneWingDiagram의 BoldArrow와 동일 원칙 ---------------- */
interface Pt { x: number; y: number }
function BoldArrow({
  origin, angleDeg, length, reveal, color, strokeWidth = SW,
}: { origin: Pt; angleDeg: number; length: number; reveal: number; color: string; strokeWidth?: number }) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const len = length * r;
  const tipX = origin.x + dx * len;
  const tipY = origin.y + dy * len;
  const headLen = Math.min(38, len * 0.4);
  const backX = tipX - dx * headLen;
  const backY = tipY - dy * headLen;
  const perpX = -dy;
  const perpY = dx;
  const headW = headLen * 0.6;
  return (
    <g>
      <line x1={origin.x} y1={origin.y} x2={backX} y2={backY} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path
        d={`M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`}
        fill={color}
      />
    </g>
  );
}

/* ---------------- 눈물방울(teardrop) - WetSoilAerosolDiagram의 raindrop 공식과 동일 형태 ---------------- */
function Teardrop({ cx, cy, r, fill, stroke, strokeWidth }: { cx: number; cy: number; r: number; fill: string; stroke: string; strokeWidth: number }) {
  const k = r / 26; // 원본 공식 기준(26px) 스케일
  return (
    <path
      d={`M ${cx} ${cy - 26 * k} C ${cx + 20 * k} ${cy - 6 * k} ${cx + 20 * k} ${cy + 14 * k} ${cx} ${cy + 22 * k}`
        + ` C ${cx - 20 * k} ${cy + 14 * k} ${cx - 20 * k} ${cy - 6 * k} ${cx} ${cy - 26 * k} Z`}
      fill={fill} stroke={stroke} strokeWidth={strokeWidth}
    />
  );
}

/* ---------------- s6: 코끼리 실루엣(참고 이미지 없음 - Penguin/Bird와 같은 원칙, 절차적 도형) ----------------
 * 저울 접시 위 "무게 토큰" 크기(작게 여러 개)로 쓰이므로, 몸통+다리까지 갖춘 전신
 * 실루엣(1·2차 시도 - 다리가 z-order 실수로 가려지거나, 작은 크기에서 디테일이 뭉개져
 * "코끼리로 안 읽힌다"는 스틸 선점검 결과로 둘 다 폐기)이 아니라, 이 채널의 다른 동물
 * 소품(Mouse/Whale/DogStanding)과 같은 "눈 하나·귀 하나 옆모습" 관례를 그대로 따르는
 * 큼직한 머리+귀+코 아이콘으로 단순화했다 - 작은 크기에서도 귀(가장 상징적인 특징)와
 * 늘어진 코만으로 코끼리임이 분명히 읽힌다. */
export const ELEPHANT_VB_W = 220;
export const ELEPHANT_VB_H = 170;

/** 몸통 밑에 서는 다리 - 작은 크기(저울 접시 위 아이콘)에서 다리를 4개 촘촘히 그리면
 *  "이빨"처럼 뭉개져 보여(스틸 선점검 결과) 굵고 짧은 2개로 줄였다. 몸통·머리를 그린
 *  "다음"에 그려야 가려지지 않는다(1차 시도의 z-order 버그 재발 방지 - 채움색이 같으면
 *  나중에 그린 도형이 먼저 그린 도형을 완전히 덮는다) */
const ELE_LEG_XS = [92, 168];

function ElephantMarks({ stroke, fill }: { stroke: string; fill: string }) {
  return (
    <>
      {/* 귀 - 머리보다 먼저 그려 위쪽에 살짝 삐져나오게(가장 상징적인 특징이라 크게) */}
      <ellipse cx={72} cy={40} rx={34} ry={38} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
      {/* 몸통(뒤, 옆으로 긴 타원) + 머리(앞, 작은 원) - 옆모습 코끼리의 전형적인 땅콩형 실루엣 */}
      <ellipse cx={132} cy={85} rx={75} ry={48} fill={fill} stroke={stroke} strokeWidth={SW} />
      <circle cx={54} cy={68} r={38} fill={fill} stroke={stroke} strokeWidth={SW} />
      {/* 다리 2개 - 몸통 다음에 그려야 보인다 */}
      {ELE_LEG_XS.map((lx, i) => (
        <rect key={i} x={lx - 16} y={124} width={32} height={38} rx={13} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
      ))}
      {/* 코 - 머리 앞쪽에서 길게 아래로 늘어져 끝이 살짝 말린다(가장 상징적인 특징이라
       *  머리 실루엣 밖으로 눈에 띄게 길게 뺐다 - 1·2차 시도는 코가 짧아 "코끼리로 안
       *  읽힌다"는 스틸 선점검 결과로 폐기) */}
      <path
        d="M 22 92 C 6 104 0 128 10 150 C 16 164 32 172 46 164"
        fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* 꼬리 */}
      <path d="M 206 76 C 218 82 220 96 212 104" fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" />
      {/* 눈 */}
      <circle cx={42} cy={60} r={7} fill={stroke} />
    </>
  );
}

export const ElephantSide: React.FC<{
  width: number; x: number; y: number; stroke?: string; fill?: string; style?: React.CSSProperties;
}> = ({ width, x, y, stroke = C.ink, fill = C.paper, style }) => {
  const scale = width / ELEPHANT_VB_W;
  const height = ELEPHANT_VB_H * scale;
  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${ELEPHANT_VB_W} ${ELEPHANT_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      <ElephantMarks stroke={stroke} fill={fill} />
    </svg>
  );
};

/* ================================================================
 * 본체
 * ================================================================ */
export interface CloudFloatDiagramProps {
  width: number;
  x: number;
  y: number;
  dropletsProgress?: number;
  fallProgress?: number;
  updraftProgress?: number;
  weighProgress?: number;
  stroke?: string;
  cloudFill?: string;
  dropColor?: string;
  bigDropColor?: string;
  airColor?: string;
  style?: React.CSSProperties;
}

export const CloudFloatDiagram: React.FC<CloudFloatDiagramProps> = ({
  width, x, y,
  dropletsProgress, fallProgress, updraftProgress, weighProgress,
  stroke = C.ink, cloudFill = C.paper, dropColor = C.waterCool, bigDropColor = C.waterCool,
  airColor = C.coral,
  style,
}) => {
  const scale = width / CLOUD_FLOAT_VB_W;
  const height = CLOUD_FLOAT_VB_H * scale;

  const dp = dropletsProgress !== undefined ? clamp01(dropletsProgress) : undefined;
  const fp = fallProgress !== undefined ? clamp01(fallProgress) : undefined;
  const up = updraftProgress !== undefined ? clamp01(updraftProgress) : undefined;
  const wp = weighProgress !== undefined ? clamp01(weighProgress) : undefined;

  const showMainCloud = wp === undefined;

  /* ---- s3: 돋보기 콜아웃 ---- */
  const calloutGrow = dp !== undefined ? band(dp, 0, 0.32) : 0;
  const calloutR = CALLOUT_R * smooth(calloutGrow);

  /* ---- s4: 낙하 비교 (작은 구름 + 물방울 2개) ---- */
  const FALL_CLOUD_CX = 320;
  const FALL_CLOUD_CY = 130;
  const FALL_CLOUD_SCALE = 8.5;
  const FALL_START_Y = 300;
  const SMALL_X = 210;
  const BIG_X = 430;
  const SMALL_DIST = 78; // 아주 짧게
  const BIG_DIST = 430; // 훨씬 멀리 - 같은 시간에 5배 이상 이동
  const smallY = fp !== undefined ? FALL_START_Y + SMALL_DIST * fp : FALL_START_Y;
  const bigY = fp !== undefined ? FALL_START_Y + BIG_DIST * fp : FALL_START_Y;

  /* ---- s5: 상승기류가 매단 물방울 4개 ---- */
  const HOLD_PTS = [
    { dx: -78, dy: 6 }, { dx: -18, dy: 26 }, { dx: 42, dy: 10 }, { dx: 96, dy: 30 },
  ];
  const liftY = up !== undefined ? -18 * smooth(up) : 0;

  /* ---- s6: 저울 ---- */
  const PIVOT: Pt = { x: 320, y: 470 };
  const BEAM_HALF = 220;
  const TILT_DEG = wp !== undefined ? 15 * smooth(wp) : 0;
  const rad = (TILT_DEG * Math.PI) / 180;
  const leftEnd: Pt = { x: PIVOT.x - BEAM_HALF * Math.cos(rad), y: PIVOT.y + BEAM_HALF * Math.sin(rad) };
  const rightEnd: Pt = { x: PIVOT.x + BEAM_HALF * Math.cos(rad), y: PIVOT.y - BEAM_HALF * Math.sin(rad) };
  const ROPE_LEN = 96;
  const leftPan: Pt = { x: leftEnd.x, y: leftEnd.y + ROPE_LEN };
  const rightPan: Pt = { x: rightEnd.x, y: rightEnd.y + ROPE_LEN };
  const elephant1A = wp !== undefined ? band(wp, 0.05, 0.4) : 0;
  const elephant2A = wp !== undefined ? band(wp, 0.4, 0.75) : 0;
  /** 코끼리 최종 크기(스케일) - 팝인 시 0.7배 -> 1배로 살짝 커지며 등장. 작은 저울 접시
   *  위에서도 귀·코가 뚜렷이 읽히도록 크게 잡았다(스틸 선점검에서 작은 크기가 원인이던
   *  "안 읽힘" 결함을 확인하고 키움) */
  const ELE_SCALE = 0.62;
  const eleTransform = (centerX: number, a: number) => {
    const s = ELE_SCALE * lerp(0.7, 1, smooth(a));
    const w = ELEPHANT_VB_W * s;
    const h = ELEPHANT_VB_H * s;
    const bottomY = rightPan.y - 4; // 접시 중심선 바로 위에 서 있는 것처럼
    return `translate(${(centerX - w / 2).toFixed(1)} ${(bottomY - h).toFixed(1)}) scale(${s.toFixed(3)})`;
  };

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${CLOUD_FLOAT_VB_W} ${CLOUD_FLOAT_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* ---- 큰 구름(항상, weighProgress 모드 제외) ---- */}
      {showMainCloud ? (
        <CloudPuff cx={MAIN_CLOUD_CX} cy={MAIN_CLOUD_CY} scale={MAIN_CLOUD_SCALE} fill={cloudFill} stroke={stroke} strokeWidth={SW} />
      ) : null}

      {/* ---- s3: 돋보기 확대 콜아웃 ---- */}
      {dp !== undefined && calloutR > 1 ? (
        <>
          <line
            x1={MAIN_CLOUD_CX + MAIN_CLOUD_HALF_W * 0.4} y1={MAIN_CLOUD_BOTTOM_Y - 6}
            x2={CALLOUT_CX} y2={CALLOUT_CY - calloutR}
            stroke={stroke} strokeWidth={SW_THIN * 0.7} strokeDasharray="6 10" opacity={0.55}
          />
          <circle cx={CALLOUT_CX} cy={CALLOUT_CY} r={calloutR} fill={C.sky} stroke={stroke} strokeWidth={SW} />
          <clipPath id="cloudCalloutClip">
            <circle cx={CALLOUT_CX} cy={CALLOUT_CY} r={Math.max(0, calloutR - SW / 2)} />
          </clipPath>
          <g clipPath="url(#cloudCalloutClip)">
            {DOT_PTS.map((pt, i) => {
              const a = band(dp, 0.3 + i * 0.028, 0.3 + i * 0.028 + 0.22);
              if (a <= 0.02) return null;
              return <circle key={i} cx={pt.x} cy={pt.y} r={pt.r * smooth(a)} fill={dropColor} opacity={0.92} />;
            })}
          </g>
        </>
      ) : null}

      {/* ---- s4: 작은 구름 + 낙하 비교 ---- */}
      {fp !== undefined ? (
        <>
          <CloudPuff cx={FALL_CLOUD_CX} cy={FALL_CLOUD_CY} scale={FALL_CLOUD_SCALE} fill={cloudFill} stroke={stroke} strokeWidth={SW} />
          {/* 궤적선 - 이동 거리만큼 옅게 남긴다 */}
          <line x1={SMALL_X} y1={FALL_START_Y} x2={SMALL_X} y2={smallY} stroke={dropColor} strokeWidth={SW_THIN * 0.6} strokeDasharray="3 9" opacity={0.5} strokeLinecap="round" />
          <line x1={BIG_X} y1={FALL_START_Y} x2={BIG_X} y2={bigY} stroke={bigDropColor} strokeWidth={SW_THIN * 0.8} strokeDasharray="3 9" opacity={0.5} strokeLinecap="round" />
          <circle cx={SMALL_X} cy={smallY} r={11} fill={dropColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
          <Teardrop cx={BIG_X} cy={bigY} r={44} fill={bigDropColor} stroke={stroke} strokeWidth={SW_THIN} />
        </>
      ) : null}

      {/* ---- s5: 상승기류 + 매달린 물방울 4개 ---- */}
      {up !== undefined ? (
        <>
          <BoldArrow origin={{ x: MAIN_CLOUD_CX - 90, y: 660 }} angleDeg={-90} length={330} reveal={band(up, 0, 0.85)} color={airColor} />
          <BoldArrow origin={{ x: MAIN_CLOUD_CX + 90, y: 700 }} angleDeg={-90} length={330} reveal={band(up, 0.1, 0.95)} color={airColor} />
          {HOLD_PTS.map((pt, i) => (
            <circle
              key={i}
              cx={MAIN_CLOUD_CX + pt.dx} cy={MAIN_CLOUD_BOTTOM_Y - 18 + pt.dy + liftY}
              r={13} fill={dropColor} stroke={stroke} strokeWidth={SW_THIN * 0.6}
            />
          ))}
        </>
      ) : null}

      {/* ---- s6: 저울 ---- */}
      {wp !== undefined ? (
        <>
          {/* 받침대 */}
          <path d={`M ${PIVOT.x - 70} 700 L ${PIVOT.x + 70} 700 L ${PIVOT.x + 16} ${PIVOT.y} L ${PIVOT.x - 16} ${PIVOT.y} Z`} fill={C.hill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
          {/* 빔 */}
          <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke={stroke} strokeWidth={SW} strokeLinecap="round" />
          <circle cx={PIVOT.x} cy={PIVOT.y} r={16} fill={stroke} />
          {/* 로프 */}
          <line x1={leftEnd.x} y1={leftEnd.y} x2={leftPan.x} y2={leftPan.y} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
          <line x1={rightEnd.x} y1={rightEnd.y} x2={rightPan.x} y2={rightPan.y} stroke={stroke} strokeWidth={SW_THIN * 0.6} />
          {/* 접시 - 오른쪽은 코끼리 2마리가 겹치는 폭에 맞춰 더 넓게 */}
          <ellipse cx={leftPan.x} cy={leftPan.y + 18} rx={92} ry={20} fill={C.hillFar} stroke={stroke} strokeWidth={SW_THIN} />
          <ellipse cx={rightPan.x} cy={rightPan.y + 18} rx={122} ry={20} fill={C.hillFar} stroke={stroke} strokeWidth={SW_THIN} />
          {/* 왼쪽: 구름 */}
          <CloudPuff cx={leftPan.x} cy={leftPan.y - 34} scale={7.2} fill={cloudFill} stroke={stroke} strokeWidth={SW} />
          {/* 오른쪽: 코끼리 2마리(순서대로 팝인) */}
          {elephant1A > 0.02 ? (
            <g transform={eleTransform(rightPan.x - 58, elephant1A)} opacity={elephant1A}>
              <ElephantMarks fill={cloudFill} stroke={stroke} />
            </g>
          ) : null}
          {elephant2A > 0.02 ? (
            <g transform={eleTransform(rightPan.x + 52, elephant2A)} opacity={elephant2A}>
              <ElephantMarks fill={cloudFill} stroke={stroke} />
            </g>
          ) : null}
        </>
      ) : null}
    </svg>
  );
};

export default CloudFloatDiagram;
