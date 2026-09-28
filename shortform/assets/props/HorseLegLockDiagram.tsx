/** "말은 왜 서서 자도 다리가 안 아픈가"에 쓰는 말 다리 클로즈업 다이어그램.
 *  general-ep103("말이 서서 잠을 자는 이유")에서 처음 필요해 만들었다. 힘줄·인대가 무릎·발목
 *  관절을 걸쇠(자물쇠)처럼 고정해 근육 힘을 거의 안 써도 서 있을 수 있다는 구조를 보여준다.
 *
 *  `LegNerveDiagram`(사람 다리 저림용)과 같은 설계 원칙: 새 신체를 정교하게 그리지 않고
 *  단순 실루엣(캡슐 도형 2단 + 발굽) 위에 상태 표시만 오버레이한다. 자물쇠 아이콘은
 *  tabler-cache.json에 'lock'이 없어(확인 완료) 아이콘 캐시를 새로 만들지 않고(배치 병렬
 *  작업 중 공용 캐시 파일 동시 수정 충돌을 피하기 위해) 직접 그린 단순 자물쇠 모양(몸체+고리+
 *  열쇠구멍 1개)으로 대체했다 - 대본의 "다이어그램 안에 직접 그린 걸쇠 모양으로 대체" 지시를
 *  따른 것이다.
 *
 *  lockProgress(0~1) - 무릎(위쪽 관절) 자물쇠가 먼저, 발목(아래쪽 관절) 자물쇠가 뒤이어
 *  순차 팝인한다(스케일+투명도, PopIn과 동일한 감쇠 없는 선형 팝 곡선 - LegNerveDiagram의
 *  pinchOpacity 임계값 패턴과 동일하게 로컬 스레숄드로 구현).
 *  muscleFadeProgress(0~1) - 넓적다리 근육 하이라이트가 밝게 보이던 상태(0)에서 옅게
 *  사라지는 상태(1)로 바뀌어 "근육 힘을 거의 안 쓴다"를 시각화한다. 두 progress는 독립적이라
 *  s4(lockProgress만 0->1, muscleFadeProgress=0) -> s5(lockProgress=1로 유지, muscleFadeProgress만
 *  0->1)를 이 컴포넌트 하나로 커버한다(ep23 교훈 - 다음 장면에서 이전 상태를 명시적으로 유지).
 */
import React, { useId } from 'react';
import { C, SW } from '../theme';

export interface HorseLegLockDiagramProps {
  width: number;
  x?: number;
  y?: number;
  /** 관절 걸쇠(자물쇠) 팝인 진행도 0~1. 생략(0)이면 자물쇠를 안 그린다 */
  lockProgress?: number;
  /** 넓적다리 근육 하이라이트가 옅어지는 진행도 0~1. 0=밝게 유지, 1=거의 안 보임 */
  muscleFadeProgress?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

const VB_W = 420;
const VB_H = 760;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 관절 팝인 스케일·불투명도 (from~to 구간에서 0->1로 살짝 오버슛 없이 선형 상승) */
function jointPop(p: number, from: number, to: number) {
  const t = clamp01((p - from) / Math.max(1e-6, to - from));
  return { scale: 0.4 + 0.6 * t, opacity: t };
}

/** 단순 자물쇠(걸쇠) 모양. 원점(0,0)을 몸체 중앙 기준으로 그린다. */
const LockIcon: React.FC<{ scale: number; opacity: number; color: string; stroke: string }> = ({
  scale, opacity, color, stroke,
}) => {
  if (opacity <= 0.001) return null;
  return (
    <g transform={`scale(${scale})`} opacity={opacity}>
      {/* 고리(shackle) */}
      <path d="M -14 -8 L -14 -22 C -14 -38, 14 -38, 14 -22 L 14 -8" fill="none" stroke={stroke}
        strokeWidth={7} strokeLinecap="round" />
      {/* 몸체 */}
      <rect x={-23} y={-8} width={46} height={40} rx={8} fill={color} stroke={stroke} strokeWidth={6} />
      {/* 열쇠구멍 */}
      <circle cx={0} cy={10} r={6} fill={stroke} />
      <rect x={-3} y={14} width={6} height={10} fill={stroke} />
    </g>
  );
};

export const HorseLegLockDiagram: React.FC<HorseLegLockDiagramProps> = ({
  width, x = 0, y = 0, lockProgress = 0, muscleFadeProgress = 0, stroke = C.ink, fill = C.paper, style,
}) => {
  const lp = clamp01(lockProgress);
  const mf = clamp01(muscleFadeProgress);
  const height = (width * VB_H) / VB_W;
  const uid = useId().replace(/[:]/g, '');
  const clipId = `horse-thigh-clip-${uid}`;

  const knee = jointPop(lp, 0, 0.55);
  const ankle = jointPop(lp, 0.45, 1);
  const muscleOpacity = 0.62 * (1 - mf);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}
        shapeRendering="geometricPrecision">
        <defs>
          {/* 넓적다리 하이라이트가 캡슐 테두리 밖으로 삐져나오지 않게 자른다.
              같은 컴포넌트가 한 화면에 여러 번 쓰일 수 있어 id를 useId로 고유하게 만든다
              (CamelHumpDiagram과 동일 관례). */}
          <clipPath id={clipId}>
            <rect x={140} y={60} width={140} height={260} rx={70} />
          </clipPath>
        </defs>
        {/* 넓적다리(위쪽 근육 구간) */}
        <rect x={140} y={60} width={140} height={260} rx={70} fill={fill} stroke={stroke} strokeWidth={SW} />
        {/* 정강이(아래쪽 관절 사이) */}
        <rect x={178} y={320} width={64} height={280} rx={32} fill={fill} stroke={stroke} strokeWidth={SW} />
        {/* 발목~발굽 사이 짧은 구간 */}
        <rect x={185} y={600} width={50} height={90} rx={20} fill={fill} stroke={stroke} strokeWidth={SW} />
        {/* 발굽 */}
        <path d="M 168 686 L 252 686 L 240 748 C 220 760, 200 760, 180 748 Z" fill={stroke} />

        {/* 넓적다리 근육 하이라이트 - 밝게 보이다가 muscleFadeProgress 에 따라 옅어짐.
            캡슐 테두리로 클립해 하이라이트가 다리 윤곽 밖으로 삐져나오지 않게 한다. */}
        <g clipPath={`url(#${clipId})`}>
          <ellipse cx={210} cy={180} rx={90} ry={140} fill={C.coral} opacity={muscleOpacity} />
        </g>

        {/* 무릎(위쪽) 관절 표시 링 + 자물쇠 */}
        <circle cx={210} cy={320} r={30} fill="none" stroke={C.inkSoft} strokeWidth={6} opacity={0.5} />
        <g transform="translate(210 320)">
          <LockIcon scale={knee.scale} opacity={knee.opacity} color={C.gold} stroke={stroke} />
        </g>

        {/* 발목(아래쪽) 관절 표시 링 + 자물쇠 */}
        <circle cx={210} cy={600} r={26} fill="none" stroke={C.inkSoft} strokeWidth={6} opacity={0.5} />
        <g transform="translate(210 600)">
          <LockIcon scale={ankle.scale * 0.86} opacity={ankle.opacity} color={C.gold} stroke={stroke} />
        </g>
      </svg>
    </div>
  );
};

export default HorseLegLockDiagram;
