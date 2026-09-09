/** "구조가 닮은 두 분자를 나란히 놓았다가 겹쳐서 닮음을 보여준다"는 구조를 갖는 범용
 *  다이어그램(고수 향 알데하이드 vs 비누·세제 성분, general-ep32). CaffeineReceptorDiagram의
 *  moleculeGroup 원칙을 그대로 따른다 - 두 분자를 "같은 도형 함수" 하나로 그리고 색만 다르게
 *  써서 "모양이 같다"는 서술을 시각적으로 직접 증명한다(임의로 다른 모양 두 개를 지어내지
 *  않는다). 탄소 사슬은 지그재그 결합선(스켈레톤식)만 그리고, 끝의 알데하이드기(C=O)는
 *  이중결합선 + 빈 원(산소, 텍스트 라벨 없음)으로 표현한다 - 원자·분자를 사실적으로 그리지
 *  않고 순수 도형으로만 구성한다(신체 표현 최소화 원칙과 같은 방향 - 화학식도 "정교하게"
 *  그리지 않는다).
 *
 *  - compareProgress(0~1): 0이면 두 분자가 화면 좌/우로 떨어져 각자의 색으로 서 있고,
 *    1에 가까워질수록 같은 지점으로 미끄러져 겹친다. 완전히 겹쳐도(1) 사슬을 위/아래로
 *    아주 살짝(각 8px) 어긋나게 그려서 두 색 윤곽선이 전부 보이게 한다(하나가 다른 하나를
 *    완전히 덮어버리면 "닮았다"를 눈으로 확인할 수 없다). compareProgress가 0.6을 넘으면
 *    겹친 자리 뒤에 옅은 강조 후광이 페이드인한다.
 *
 *  "두 화합물의 골격이 실제로 닮았다"를 보여주는 다른 소재(냄새 성분 비교, 유사 약물 구조
 *  비교 등) 전반에 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { C, SW } from '../theme';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (p: number) => p * p * (3 - 2 * p);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const CILANTRO_VB_W = 900;
export const CILANTRO_VB_H = 460;

const BASE_Y = 260;
const SEG = 68;
/** 지그재그 결합선 꼭짓점(사슬 원점 기준 상대좌표). 두 분자가 완전히 같은 함수를 공유한다. */
const CHAIN_PTS: Array<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: SEG, y: -SEG * 0.6 },
  { x: SEG * 2, y: 0 },
  { x: SEG * 3, y: -SEG * 0.6 },
  { x: SEG * 4, y: 0 },
  { x: SEG * 5, y: -SEG * 0.6 },
];
/** 알데하이드기(C=O) 산소 원자 위치 (사슬 마지막 꼭짓점에서 대각선 위) */
const O_OFFSET = { x: SEG * 0.95, y: -SEG * 0.95 };
const O_R = 17;
/** 이 분자 도형 하나가 차지하는 대략적 폭(anchor 계산용) */
const CHAIN_W = SEG * 5 + O_OFFSET.x + O_R;

/** 두 분자가 완전히 겹쳤을 때도 색이 둘 다 보이도록 주는 수직 미세 오프셋(px) */
const OVERLAP_DY = 8;

function moleculeGroup(
  key: string, anchorX: number, anchorY: number, color: string, strokeW: number, opacity: number,
) {
  if (opacity <= 0.005) return null;
  const last = CHAIN_PTS[CHAIN_PTS.length - 1];
  const d = CHAIN_PTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${anchorX + p.x} ${anchorY + p.y}`).join(' ');
  const oCx = anchorX + last.x + O_OFFSET.x;
  const oCy = anchorY + last.y + O_OFFSET.y;
  // 이중결합: 사슬 방향에 수직으로 살짝 벌어진 평행선 2개
  const dx = O_OFFSET.x; const dy = O_OFFSET.y;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * 7; const ny = (dx / len) * 7;
  return (
    <g key={key} opacity={clamp01(opacity)}>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
      <line
        x1={anchorX + last.x + nx} y1={anchorY + last.y + ny} x2={oCx + nx} y2={oCy + ny}
        stroke={color} strokeWidth={strokeW} strokeLinecap="round"
      />
      <line
        x1={anchorX + last.x - nx} y1={anchorY + last.y - ny} x2={oCx - nx} y2={oCy - ny}
        stroke={color} strokeWidth={strokeW} strokeLinecap="round"
      />
      <circle cx={oCx} cy={oCy} r={O_R} fill={C.paper} stroke={color} strokeWidth={strokeW} />
      {/* 사슬 시작점(왼쪽 끝)도 원으로 마무리해 선이 허공에 뜬 것처럼 보이지 않게 한다 */}
      <circle cx={anchorX} cy={anchorY} r={9} fill={color} />
    </g>
  );
}

export interface CilantroDiagramProps {
  /** 화면상 폭(px). viewBox(900x460) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0=좌우로 분리, 1=같은 자리로 겹침(색은 살짝 어긋나 둘 다 보임). 기본 0 */
  compareProgress?: number;
  cilantroColor?: string;
  soapColor?: string;
  style?: React.CSSProperties;
}

export const CilantroDiagram: React.FC<CilantroDiagramProps> = ({
  width, x = 0, y = 0, compareProgress = 0,
  cilantroColor = '#4E9A63', soapColor = C.waterCool, style,
}) => {
  const height = (width * CILANTRO_VB_H) / CILANTRO_VB_W;
  const t = smoothstep(clamp01(compareProgress));

  const leftStart = 60;
  const rightStart = CILANTRO_VB_W - CHAIN_W - 60;
  const target = (CILANTRO_VB_W - CHAIN_W) / 2;

  const cilantroX = lerp(leftStart, target, t);
  const soapX = lerp(rightStart, target, t);
  const cilantroY = BASE_Y - OVERLAP_DY;
  const soapY = BASE_Y + OVERLAP_DY;

  const glowP = clamp01((compareProgress - 0.6) / 0.4);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${CILANTRO_VB_W} ${CILANTRO_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
      >
        {glowP > 0.01 ? (
          <rect
            x={target - 30} y={BASE_Y - SEG * 0.6 - 60} width={CHAIN_W + 60} height={SEG * 0.6 + 140}
            rx={40} fill={C.goldSoft} opacity={0.6 * glowP}
          />
        ) : null}
        {moleculeGroup('cilantro', cilantroX, cilantroY, cilantroColor, SW * 0.9, 1)}
        {moleculeGroup('soap', soapX, soapY, soapColor, SW * 0.9, 1)}
      </svg>
    </div>
  );
};

/** "알데하이드" 라벨을 호출 씬이 붙이기 좋은 앵커(겹침 지점 위쪽, viewBox 좌표) */
export const CILANTRO_LABEL_PT = { x: CILANTRO_VB_W / 2, y: BASE_Y - SEG * 0.6 - 90 };

export default CilantroDiagram;

/* ================================================================================
 * NoseGlowOverlay: "같은 자극인데 수용체 반응 세기가 사람마다 다르다"를 보여주는 오버레이.
 *
 * HeadNerveDiagram(general-ep01)과 같은 원칙: 새 얼굴을 그리지 않고 BustActor 위에
 * 코 위치(눈과 입 사이) 하이라이트 원만 오버레이한다. 새 얼굴 좌표를 지어내지 않고
 * 기존 RIG의 눈(EYE.y)·입(MOUTH.y) 좌표 사이 중점을 코 위치로 쓴다.
 *
 * intensity(0~1)만으로 글로우 반경·불투명도·맥동 폭이 전부 결정되므로, 같은 컴포넌트를
 * 두 캐릭터에 값만 다르게 줘서(약함/강함) 반응 세기 차이를 시각적으로 대비시킨다.
 * ================================================================================ */

/** 코 위치: 눈과 입 사이 중점, 머리 중심 x. 새로 지어내지 않고 기존 RIG 좌표로 계산 */
export const NOSE_PT = { x: RIG.HEAD_CX, y: (RIG.EYE.y + RIG.MOUTH.y) / 2 };

const NOSE_PULSE_PERIOD = 70;

export interface NoseGlowOverlayProps {
  /** 씬 로컬 프레임. 맥동 애니메이션에 쓴다 */
  f: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX가 정사각형이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 수용체 반응 세기 - 0이면 글로우 없음, 1이면 크고 뚜렷하게 맥동 */
  intensity?: number;
  color?: string;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const NoseGlowOverlay: React.FC<NoseGlowOverlayProps> = ({
  f, width, x = 0, y = 0, intensity = 0, color = C.coral, stroke = C.ink, fill = C.paper, style,
}) => {
  const it = clamp01(intensity);
  const pulse = 0.5 + 0.5 * Math.sin((f / NOSE_PULSE_PERIOD) * Math.PI * 2);
  const r = 30 + it * 46 + pulse * it * 10;
  const opacity = it * (0.35 + 0.35 * pulse);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <BustActor size={width} left={0} top={0} pose={POSES.idle} breathAmp={0} color={stroke} fill={fill} />
      {it > 0.01 ? (
        <svg
          viewBox={BUST_VIEWBOX} width={width} height={width}
          style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        >
          <circle cx={NOSE_PT.x} cy={NOSE_PT.y} r={r} fill={color} opacity={opacity} />
          <circle cx={NOSE_PT.x} cy={NOSE_PT.y} r={r * 0.5} fill="none" stroke={color} strokeWidth={7} opacity={Math.min(1, opacity + 0.25)} />
        </svg>
      ) : null}
    </div>
  );
};
