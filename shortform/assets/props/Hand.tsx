/** 손가락 소품. "목욕 후 손가락이 쭈글쭈글해지는" 소재 때문에 신설했다(general-ep02).
 *  REGISTRY 3절 확인 완료 - 기존 `props/`에 손·손가락을 그린 자산이 없었다.
 *
 *  세 그림을 한 파일에 묶는다 (`props/Animals.tsx`가 Mouse/Whale/Sloth 를 묶는 것과 같은 방식):
 *   - Finger: 손가락 클로즈업. `wrinkle`(0~1)로 매끈함 <-> 주름진 정도를 잔주름 선의
 *     진폭·불투명도로 연속 보간한다. 외곽선 실루엣 자체는 고정해 단순함을 유지하고
 *     (IceCream 의 와플격자선과 같은 방식 - 표면 디테일 선으로 질감만 바꾼다).
 *   - FingerCrossSection: 손가락 단면. 중심의 혈관(캡슐)이 `veinNarrow`(0~1)에 따라 좁아진다.
 *   - FingerGrip: 두 손가락이 구슬을 집는 그림. `wrinkle`로 질감을, `beadY`/`gripped`로
 *     "미끄러져 떨어짐"(그립 실패) vs "꽉 쥠"(그립 성공) 두 결과를 표현한다.
 *
 *  프레임을 직접 받지 않는다(REGISTRY 규칙 3) - 애니메이션 진행도는 호출부(scenes.tsx)가
 *  anim.ts 의 `progress()`로 계산해 0~1 prop 으로 넘긴다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ---------------- Finger: 손가락 클로즈업 ---------------- */

export interface FingerProps {
  width: number;
  /** 0 = 매끈, 1 = 완전히 쭈글쭈글 */
  wrinkle?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const CREASE_YS = [150, 195, 240, 285, 325];

export const Finger: React.FC<FingerProps> = ({
  width, wrinkle = 0, stroke = C.ink, fill = C.paper, strokeWidth = SW, style,
}) => {
  const w = clamp01(wrinkle);
  const cx = 150;
  const halfW = 80;
  return (
    <svg viewBox="0 0 300 400" width={width} style={style} shapeRendering="geometricPrecision">
      {/* 손가락 몸체 (고정 실루엣) */}
      <rect
        x={cx - halfW} y={30} width={halfW * 2} height={340} rx={halfW}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />
      {/* 손톱 */}
      <ellipse
        cx={cx} cy={92} rx={40} ry={50} fill={C.coralSoft} stroke={stroke}
        strokeWidth={strokeWidth * 0.7} opacity={0.9}
      />
      {/* 잔주름: wrinkle 이 커질수록 진하고 굵게(연속 보간) */}
      <g stroke={stroke} strokeWidth={SW_THIN * (0.5 + w * 0.7)} opacity={0.25 + w * 0.55} fill="none">
        {CREASE_YS.map((y, i) => {
          const amp = 4 + w * 12;
          const dir = i % 2 === 0 ? 1 : -1;
          return (
            <path
              key={y}
              d={`M ${cx - halfW + 14} ${y} Q ${cx - halfW * 0.35} ${y - amp * dir} ${cx} ${y} Q ${cx + halfW * 0.35} ${y + amp * dir} ${cx + halfW - 14} ${y}`}
            />
          );
        })}
      </g>
    </svg>
  );
};

/* ---------------- FingerCrossSection: 손가락 단면 (혈관 좁아짐) ---------------- */

export interface FingerCrossSectionProps {
  width: number;
  /** 0 = 이완(넓음), 1 = 수축(좁음) */
  veinNarrow?: number;
  stroke?: string;
  fill?: string;
  veinColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FingerCrossSection: React.FC<FingerCrossSectionProps> = ({
  width, veinNarrow = 0, stroke = C.ink, fill = C.paper, veinColor = C.coral,
  strokeWidth = SW, style,
}) => {
  const n = clamp01(veinNarrow);
  const cx = 150;
  const cy = 150;
  const veinHalfW = 30 - n * 19; // 지름 60 -> 22 로 좁아짐
  const arrowInset = 26 * n;
  return (
    <svg viewBox="0 0 300 300" width={width} style={style} shapeRendering="geometricPrecision">
      <circle cx={cx} cy={cy} r={122} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx={cx} cy={cy} r={98} fill={C.coralSoft} opacity={0.35} />
      <rect
        x={cx - veinHalfW} y={cy - 78} width={veinHalfW * 2} height={156} rx={veinHalfW}
        fill={veinColor} stroke={stroke} strokeWidth={strokeWidth * 0.6}
      />
      {/* 좁아짐을 가리키는 화살촉 두 개 - 안쪽으로 이동하며 수축을 강조 */}
      <g opacity={0.3 + n * 0.6} fill={stroke}>
        <path d={`M ${cx - 92 + arrowInset - 16} ${cy - 12} L ${cx - 92 + arrowInset + 14} ${cy} L ${cx - 92 + arrowInset - 16} ${cy + 12} Z`} />
        <path d={`M ${cx + 92 - arrowInset + 16} ${cy - 12} L ${cx + 92 - arrowInset - 14} ${cy} L ${cx + 92 - arrowInset + 16} ${cy + 12} Z`} />
      </g>
    </svg>
  );
};

/* ---------------- FingerGrip: 두 손가락으로 구슬 쥐기 ---------------- */

export interface FingerGripProps {
  width: number;
  /** 0 = 매끈, 1 = 쭈글쭈글 (양쪽 손가락 질감) */
  wrinkle?: number;
  /** gripped 가 false 일 때만 쓰인다: 0 = 틈 중앙, 1 = 틈 아래로 미끄러져 빠짐 */
  beadY?: number;
  /** true 면 손가락 틈이 좁아지고 구슬이 중앙에 고정된다(꽉 잡음) */
  gripped?: boolean;
  /** gripped 일 때 체크 배지 등장 진행도 0~1 */
  checkT?: number;
  stroke?: string;
  fill?: string;
  beadColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const FingerGrip: React.FC<FingerGripProps> = ({
  width, wrinkle = 0, beadY = 0, gripped = false, checkT = 0,
  stroke = C.ink, fill = C.paper, beadColor = C.gold, strokeWidth = SW, style,
}) => {
  const w = clamp01(wrinkle);
  const cx = 160;
  const half = 50;
  const tipTop = gripped ? 150 : 104; // 위 손가락 끝 y (닫히면 더 아래로 내려온다)
  const baseBottom = gripped ? 172 : 222; // 아래 손가락 시작 y (닫히면 더 위로 올라온다)
  const gapMid = (tipTop + baseBottom) / 2;
  const beadR = 34;
  const beadCy = gripped ? gapMid : gapMid + clamp01(beadY) * 150;
  const beadOpacity = gripped ? 1 : 1 - clamp01(beadY) * 0.9;
  const creaseW = SW_THIN * (0.5 + w * 0.6);
  const creaseOp = 0.2 + w * 0.55;

  return (
    <svg viewBox="0 0 320 340" width={width} style={style} shapeRendering="geometricPrecision">
      {/* 위 손가락 (뷰박스 위로 삐져나가 화면 밖으로 이어지는 손의 일부처럼 보이게 한다) */}
      <rect x={cx - half} y={-40} width={half * 2} height={tipTop + 40} rx={half}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <path
        d={`M ${cx - half + 10} ${(20 + tipTop) / 2} Q ${cx} ${(20 + tipTop) / 2 - (3 + w * 8)} ${cx + half - 10} ${(20 + tipTop) / 2}`}
        stroke={stroke} strokeWidth={creaseW} opacity={creaseOp} fill="none"
      />

      {/* 아래 손가락 (뷰박스 아래로 삐져나감) */}
      <rect x={cx - half} y={baseBottom} width={half * 2} height={340 - baseBottom + 40} rx={half}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <path
        d={`M ${cx - half + 10} ${(baseBottom + 320) / 2} Q ${cx} ${(baseBottom + 320) / 2 + (3 + w * 8)} ${cx + half - 10} ${(baseBottom + 320) / 2}`}
        stroke={stroke} strokeWidth={creaseW} opacity={creaseOp} fill="none"
      />

      {/* 구슬 - 항상 손가락 위(마지막)에 그려 미끄러질 때도 가려지지 않게 한다 */}
      <circle cx={cx} cy={beadCy} r={beadR} fill={beadColor} stroke={stroke}
        strokeWidth={strokeWidth * 0.75} opacity={beadOpacity} />
      <circle cx={cx - 10} cy={beadCy - 10} r={8} fill={C.paper} opacity={beadOpacity * 0.7} />

      {gripped && checkT > 0.001 ? (
        <g
          transform={`translate(${cx + 70} ${gapMid - 90}) scale(${0.5 + 0.5 * clamp01(checkT)})`}
          opacity={clamp01(checkT)}
        >
          <circle cx={0} cy={0} r={44} fill={C.coral} stroke={stroke} strokeWidth={strokeWidth * 0.6} />
          <g transform="translate(-32 -32)">
            <ThemedIcon name="check" size={64} color={C.paper} strokePx={11} />
          </g>
        </g>
      ) : null}
    </svg>
  );
};

export default Finger;
