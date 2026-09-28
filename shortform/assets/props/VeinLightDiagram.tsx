/** "손등 핏줄은 왜 파랗게 보이는가"(general-ep101) 전용 소품 3종을 한 파일에 묶는다
 *  (`props/Hand.tsx`가 Finger/FingerCrossSection/FingerGrip을 묶는 것과 같은 방식).
 *  REGISTRY 확인 완료 - `props/Hand.tsx`는 손가락 클로즈업(주름·수축)만 다루고, 손등
 *  전체 실루엣이나 핏줄 경로, 피부 단면의 빛 침투 표현이 없다. `props/LightScatterDiagram.tsx`는
 *  대기 중 빛의 산란(ep22) 전용으로 화살(Arrow) 연출 스타일만 참고하고 색 상수(LIGHT_BLUE/
 *  LIGHT_RED)를 그대로 재사용한다 - "빛의 색"이라는 같은 개념이라 새로 정의하지 않는다.
 *
 *   - ArmVein: 손등 실루엣 + 핏줄 경로. `reveal`(0~1)로 겉보기(피부 위에서 파랗게 보이는
 *     핏줄) -> 단면 속 실제(안에 흐르는 빨간 피)를 연속 전환한다. `showBadges`가 true면
 *     겉보기 파란 핏줄(피가 파란색이라는 흔한 오해) 쪽에 X, 단면 속 빨간 피(사실) 쪽에
 *     O를 겹쳐 표시한다 - X는 항상 틀린 진술(피가 파랗다)에, O는 항상 맞는 진술(피는
 *     빨갛다)에 붙는다(21화 이후 결함 목록 F "속설 정정 장면" 경고 반영).
 *   - SkinLightCrossSection: 피부 단면 옆모습(표피/진피 레이어 + 얕게 지나가는 핏줄).
 *     `blueBounce`(0~1, 파란빛이 얕은 층에서 바로 튕겨 나오는 진행도) · `redPenetrate`
 *     (0~1, 빨간빛이 깊이 파고들며 옅어져 사라지는 진행도) · `toEye`(0~1, 튕겨 나온
 *     파란빛이 눈까지 이어지는 진행도, 지정 시에만 눈 아이콘과 마지막 구간을 그린다)를
 *     독립적으로 받는다(undefined면 그 레이어를 안 그림 - LightScatterDiagram과 같은 설계).
 *   - VeinDepthCompare: 얕은 핏줄(밝은 파랑)과 깊은 핏줄(어두운 남색)을 나란히 놓고
 *     간단한 주사기 모양이 얕은 쪽을 가리키는 비교 그림. `progress`(0~1)로 전체 등장.
 *
 *  신체 표현 주의(builder 원칙): 피부 단면을 사실적인 의학 단면도로 그리지 않는다 -
 *  레이어를 색 띠 2단으로만 단순화하고, 혈관도 매끈한 캡슐 하나로만 그린다(잔점·질감
 *  반복 없음).
 *
 *  Math.random 미사용 - 전부 0~1 progress만 받는 순수 함수라 결정적이다(원칙 3).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { LIGHT_BLUE, LIGHT_RED } from './LightScatterDiagram';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 피부 위로 비쳐 보이는 핏줄의 색(실제 빛 색인 LIGHT_BLUE보다 살짝 탁하게 - 피부를
 *  한 겹 거쳐 보이는 느낌). ArmVein·SkinLightCrossSection이 같은 핏줄을 가리키므로
 *  두 컴포넌트가 이 색을 공유한다. */
export const VEIN_SURFACE_BLUE = '#5C7FA8';
/** 실제 피(단면 속) 색. LIGHT_RED(빛의 빨강)와 개념이 달라 채널 기본 accent(coral)를 쓴다 */
export const BLOOD_RED = C.coral;

/* ============================================================
 * ArmVein: 손등 실루엣 + 핏줄 (겉보기 파랑 <-> 단면 속 빨강)
 * ============================================================ */
export interface ArmVeinProps {
  width: number;
  x?: number;
  y?: number;
  /** 0 = 피부 표면(파랗게 보이는 핏줄만), 1 = 단면이 열려 실제 빨간 피가 보임 */
  reveal?: number;
  /** true면 겉보기(파란 핏줄)에 X, 단면 속 실제(빨간 피)에 O를 겹쳐 표시한다 */
  showBadges?: boolean;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

const ARM_VB_W = 600;
const ARM_VB_H = 420;
/** 핏줄 경로(손등 위를 가로지르는 완만한 곡선) */
const VEIN_PATH = 'M 150 340 Q 220 260 260 220 Q 320 160 300 100 Q 290 70 320 40';
/** 단면(절개) 위치 - 경로의 대략 중간 지점 */
const CUT_CENTER = { x: 262, y: 218 };

export const ArmVein: React.FC<ArmVeinProps> = ({
  width, x = 0, y = 0, reveal = 0, showBadges = false,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const r = clamp01(reveal);
  const cutR = 92 * r;
  const bloodR = 50 * r;
  const oRingR = 68 * r;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: (width * ARM_VB_H) / ARM_VB_W, ...style }}>
      <svg
        width="100%" height="100%" viewBox={`0 0 ${ARM_VB_W} ${ARM_VB_H}`}
        shapeRendering="geometricPrecision" style={{ overflow: 'visible' }}
      >
        {/* 손등 실루엣 */}
        <rect x={40} y={40} width={520} height={340} rx={130} fill={fill} stroke={stroke} strokeWidth={SW} />
        {/* 피부 아래로 비쳐 보이는 핏줄 (절개 부위 안쪽은 뒤에서 덮인다) */}
        <path
          d={VEIN_PATH} fill="none" stroke={VEIN_SURFACE_BLUE} strokeWidth={30}
          strokeLinecap="round" opacity={0.85 - r * 0.35}
        />
        {/* 단면(절개) - 안쪽에 실제 빨간 피 */}
        {cutR > 1 ? (
          <g>
            <circle cx={CUT_CENTER.x} cy={CUT_CENTER.y} r={cutR} fill={fill} stroke={stroke} strokeWidth={SW * 0.75} />
            <circle cx={CUT_CENTER.x} cy={CUT_CENTER.y} r={bloodR} fill={BLOOD_RED} />
            <ellipse
              cx={CUT_CENTER.x - bloodR * 0.28} cy={CUT_CENTER.y - bloodR * 0.32}
              rx={bloodR * 0.32} ry={bloodR * 0.2} fill={C.paper} opacity={0.35}
            />
            {oRingR > 1 ? (
              <circle cx={CUT_CENTER.x} cy={CUT_CENTER.y} r={oRingR} fill="none" stroke={C.gold} strokeWidth={SW * 0.55} />
            ) : null}
          </g>
        ) : null}
        {/* X 배지 - 겉보기(파란 핏줄 = "피가 파랗다"는 오해)에 붙는다. reveal이 커질수록 옅어짐 */}
        {showBadges ? (
          <g transform="translate(150 340)" opacity={1 - r}>
            <circle r={38} fill={C.paper} stroke={BLOOD_RED} strokeWidth={SW * 0.55} />
            <g transform="translate(-27 -27)">
              <ThemedIcon name="x" size={54} color={BLOOD_RED} strokePx={11} />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============================================================
 * SkinLightCrossSection: 피부 단면 옆모습 (파란빛 반사 / 빨간빛 흡수 / 눈까지 도달)
 * ============================================================ */
export interface SkinLightCrossSectionProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1: 파란빛이 얕은 층에서 바로 튕겨 나오는 진행도. undefined면 안 그림 */
  blueBounce?: number;
  /** 0~1: 빨간빛이 깊이 파고들다 옅어져 사라지는 진행도. undefined면 안 그림 */
  redPenetrate?: number;
  /** 0~1: 튕겨 나온 파란빛이 눈까지 이어지는 진행도. 지정 시에만 눈 아이콘 + 마지막 구간을 그림 */
  toEye?: number;
  stroke?: string;
  style?: React.CSSProperties;
}

const SKIN_VB_W = 700;
const SKIN_VB_H = 480;
const SKIN_SURFACE_Y = 90;
const EPIDERMIS_BOTTOM_Y = 150;
const DERMIS_BOTTOM_Y = 380;
const ENTRY_X = 220;
const VEIN_Y = 210; // 얕은 층 - "얕게 지나가는 핏줄"
const EYE_POS = { x: 610, y: 60 };

/** 화살(선 + 화살촉). LightScatterDiagram의 Arrow와 같은 시각 관례(점 대신 방향이
 *  뚜렷한 화살)를 이 파일 안에서 자체 구현한다(그 파일의 Arrow는 export되지 않음). */
function LightArrow({
  x1, y1, x2, y2, reveal, color, strokeWidth = 12,
}: { x1: number; y1: number; x2: number; y2: number; reveal: number; color: string; strokeWidth?: number }) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const tipX = lerp(x1, x2, r);
  const tipY = lerp(y1, y2, r);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / len;
  const uy = dy / len;
  const headLen = Math.min(22, len * r * 0.5);
  const backX = tipX - ux * headLen;
  const backY = tipY - uy * headLen;
  const perpX = -uy;
  const perpY = ux;
  const headW = headLen * 0.6;
  return (
    <g opacity={Math.min(1, r * 4)}>
      <line x1={x1} y1={y1} x2={backX} y2={backY} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path
        d={`M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`}
        fill={color}
      />
    </g>
  );
}

export const SkinLightCrossSection: React.FC<SkinLightCrossSectionProps> = ({
  width, x = 0, y = 0, blueBounce, redPenetrate, toEye, stroke = C.ink, style,
}) => {
  const bounceExitY = SKIN_SURFACE_Y - 60;
  const bounceExitX = ENTRY_X + 110;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: (width * SKIN_VB_H) / SKIN_VB_W, ...style }}>
      <svg
        width="100%" height="100%" viewBox={`0 0 ${SKIN_VB_W} ${SKIN_VB_H}`}
        shapeRendering="geometricPrecision" style={{ overflow: 'visible' }}
      >
        {/* 피부 레이어(표피/진피 2단만 - 사실적 단면도로 그리지 않는다) */}
        <rect x={0} y={SKIN_SURFACE_Y} width={SKIN_VB_W} height={EPIDERMIS_BOTTOM_Y - SKIN_SURFACE_Y} fill={C.coralSoft} />
        <rect x={0} y={EPIDERMIS_BOTTOM_Y} width={SKIN_VB_W} height={DERMIS_BOTTOM_Y - EPIDERMIS_BOTTOM_Y} fill={C.room} />
        <line x1={0} y1={SKIN_SURFACE_Y} x2={SKIN_VB_W} y2={SKIN_SURFACE_Y} stroke={stroke} strokeWidth={SW} />
        <line x1={0} y1={EPIDERMIS_BOTTOM_Y} x2={SKIN_VB_W} y2={EPIDERMIS_BOTTOM_Y} stroke={stroke} strokeWidth={SW_THIN} strokeDasharray="14 10" opacity={0.5} />

        {/* 얕게 지나가는 핏줄 */}
        <ellipse cx={ENTRY_X + 70} cy={VEIN_Y} rx={54} ry={26} fill={VEIN_SURFACE_BLUE} stroke={stroke} strokeWidth={SW_THIN * 0.7} />

        {/* 빨간빛: 깊이 파고들다 옅어져 사라진다 */}
        {redPenetrate !== undefined ? (
          <g opacity={1 - clamp01(redPenetrate) * 0.92}>
            <LightArrow x1={ENTRY_X} y1={0} x2={ENTRY_X} y2={SKIN_SURFACE_Y} reveal={1} color={LIGHT_RED} strokeWidth={14} />
            <LightArrow
              x1={ENTRY_X} y1={SKIN_SURFACE_Y} x2={ENTRY_X + 30} y2={DERMIS_BOTTOM_Y - 20}
              reveal={redPenetrate} color={LIGHT_RED} strokeWidth={14}
            />
          </g>
        ) : null}

        {/* 파란빛: 얕은 층에서 바로 튕겨 나온다 */}
        {blueBounce !== undefined ? (
          <g>
            <LightArrow x1={ENTRY_X} y1={0} x2={ENTRY_X} y2={SKIN_SURFACE_Y} reveal={1} color={LIGHT_BLUE} strokeWidth={14} />
            <LightArrow
              x1={ENTRY_X} y1={SKIN_SURFACE_Y} x2={bounceExitX} y2={bounceExitY}
              reveal={blueBounce} color={LIGHT_BLUE} strokeWidth={14}
            />
          </g>
        ) : null}

        {/* 튕겨 나온 파란빛이 눈까지 이어짐 (s6 전용) */}
        {toEye !== undefined ? (
          <LightArrow x1={bounceExitX} y1={bounceExitY} x2={EYE_POS.x} y2={EYE_POS.y} reveal={toEye} color={LIGHT_BLUE} strokeWidth={14} />
        ) : null}
      </svg>
      {/* 눈 아이콘은 svg 바깥의 형제 요소로 둔다 - svg 안에 position:absolute 자식 svg를
       *  중첩하면 CSS 위치 지정이 무시되는 결함(21화 이후 결함 목록 A)을 피하기 위함 */}
      {toEye !== undefined ? (
        <div
          style={{
            position: 'absolute', left: (EYE_POS.x / SKIN_VB_W) * width - 32,
            top: (EYE_POS.y / SKIN_VB_W) * width - 32, opacity: clamp01(toEye),
          }}
        >
          <ThemedIcon name="eye" size={64} color={stroke} />
        </div>
      ) : null}
    </div>
  );
};

/* ============================================================
 * VeinDepthCompare: 얕은 핏줄 vs 깊은 핏줄 비교 + 주사기
 * ============================================================ */
export interface VeinDepthCompareProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1: 전체 등장 진행도 */
  progress?: number;
  stroke?: string;
  style?: React.CSSProperties;
}

const CMP_VB_W = 700;
const CMP_VB_H = 460;

/** 아주 단순화한 주사기 모양(원통 + 바늘). ThemedIcon 캐시에 syringe/needle이 없어
 *  직접 그린다(다른 소품 파일의 PressureDial처럼 작은 복합 도형을 로컬로 그리는 방식). */
function Syringe({ cx, topY, height, stroke }: { cx: number; topY: number; height: number; stroke: string }) {
  const barrelW = 46;
  const barrelH = height * 0.62;
  const needleH = height * 0.34;
  return (
    <g>
      <rect x={cx - barrelW / 2} y={topY} width={barrelW} height={barrelH} rx={10} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.8} />
      <rect x={cx - barrelW / 2 - 10} y={topY - 14} width={barrelW + 20} height={16} rx={6} fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
      <rect x={cx - 8} y={topY + barrelH * 0.28} width={16} height={barrelH * 0.5} fill={C.coralSoft} />
      <line x1={cx} y1={topY + barrelH} x2={cx} y2={topY + barrelH + needleH} stroke={stroke} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
}

export const VeinDepthCompare: React.FC<VeinDepthCompareProps> = ({
  width, x = 0, y = 0, progress: p = 1, stroke = C.ink, style,
}) => {
  const t = clamp01(p);
  const leftCx = 220;
  const rightCx = 480;
  const blockTop = 140;
  const blockH = 240;
  const blockW = 220;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: (width * CMP_VB_H) / CMP_VB_W, opacity: t, ...style }}>
      <svg
        width="100%" height="100%" viewBox={`0 0 ${CMP_VB_W} ${CMP_VB_H}`}
        shapeRendering="geometricPrecision" style={{ overflow: 'visible' }}
      >
        {/* 얕은 핏줄 블록 */}
        <rect x={leftCx - blockW / 2} y={blockTop} width={blockW} height={blockH} rx={28} fill={C.paper} stroke={stroke} strokeWidth={SW} />
        <ellipse cx={leftCx} cy={blockTop + blockH * 0.32} rx={44} ry={22} fill={VEIN_SURFACE_BLUE} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
        {/* 깊은 핏줄 블록 */}
        <rect x={rightCx - blockW / 2} y={blockTop} width={blockW} height={blockH} rx={28} fill={C.paper} stroke={stroke} strokeWidth={SW} />
        <ellipse cx={rightCx} cy={blockTop + blockH * 0.68} rx={44} ry={22} fill={C.nightMid} stroke={stroke} strokeWidth={SW_THIN * 0.7} />

        {/* 주사기 - 얕은 쪽을 가리킴 */}
        <g style={{ transform: `translateY(${(1 - t) * -40}px)`, opacity: t }}>
          <Syringe cx={leftCx} topY={blockTop - 150} height={130} stroke={stroke} />
        </g>
      </svg>
    </div>
  );
};

export default ArmVein;
