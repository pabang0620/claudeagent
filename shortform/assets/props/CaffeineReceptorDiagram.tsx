/** "모양이 비슷한 두 분자가 하나의 결합 자리를 두고 경쟁한다"는 구조를 보여주는 범용
 *  다이어그램. 카페인이 아데노신 수용체 자리를 대신 차지해 졸음 신호를 막는 과정
 *  (general-ep23, 커피와 카페인)을 위해 만들었지만, "구조가 비슷한 물질이 원래 자리를
 *  대신 차지해 신호·작용을 막는다"는 경쟁적 결합(competitive binding) 구조를 갖는 다른
 *  소재(약물 길항작용, 효소 억제 등) 전반에도 재사용할 수 있도록 라벨 없이 순수 도형만
 *  그린다 - "아데노신"/"카페인" 이름은 이 컴포넌트가 아니라 호출하는 씬이 Label로 얹는다
 *  (REGISTRY 규칙 3-6).
 *
 *  CellMergeDiagram·HiccupDiagram과 같은 설계 원칙: 이 컴포넌트는 "지금 이 순간의 상태"만
 *  그리고, 시간에 따른 변화 곡선은 호출 씬이 progress()로 만들어 넘긴다. 신체 표현은
 *  최소한으로 - 두 분자는 전부 "큰 원 2개"로만 구성한 단순 도형이다(작은 점·알갱이를 여러
 *  개 찍는 표현 금지, general-ep08 "징그럽다" 피드백 반영). 같은 도형 함수(moleculeGroup)를
 *  아데노신·카페인 양쪽에 그대로 재사용해 "모양이 비슷하다"는 서술을 색만 다르게 함으로써
 *  시각적으로 직접 보여준다.
 *
 *  - dockProgress   : 아데노신 분자가 위에서 내려와 수용체 자리에 앉는 진행도(0=빈 자리)
 *  - blockProgress  : 카페인 분자가 등장해 아데노신을 밀어내고 자리를 대신 차지하는 진행도
 *                      (0=카페인 없음, 1=카페인이 자리를 완전히 차지)
 *  - releaseProgress: 카페인이 자리를 떠나고, 쌓여 있던 아데노신 2개가 한꺼번에 몰려와 다시
 *                      채우는 진행도. 0보다 크면 "카페인이 자리를 차지한 상태"를 시작점으로
 *                      간주해 거기서부터 애니메이션한다(호출부가 blockProgress를 따로 1로
 *                      유지할 필요 없음).
 *
 *  신호가 수용체에서 뇌로 전달되다 막히는 장면(general-ep23 s5)은 이 컴포넌트가 아니라
 *  기존 범용 컴포넌트 `NerveSignal`(두 지점을 잇는 신호 이동)을 이 컴포넌트가 export하는
 *  `RECEPTOR_SOCKET_PT` 앵커에서 시작해 호출 씬이 조합한다.
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (p: number) => p * p * (3 - 2 * p);

/** viewBox 크기(px). width prop 은 이 폭 기준으로 스케일된다. */
export const RECEPTOR_VB_W = 720;
export const RECEPTOR_VB_H = 640;
/** 수용체 소켓 중심(viewBox 좌표). 호출 씬이 Label/NerveSignal 앵커로 쓴다.
 *  screenX = diagramX + RECEPTOR_SOCKET_PT.x * (width/RECEPTOR_VB_W), y도 동일 스케일. */
export const RECEPTOR_SOCKET_PT = { x: 360, y: 300 };

const SOCKET_R = 108;
const MEMBRANE_Y = 330;
const MEMBRANE_H = 100;

function moleculeGroup(
  key: string, cx: number, cy: number, scale: number, color: string, opacity: number, stroke: string
) {
  if (opacity <= 0.005) return null;
  const r1 = 62 * scale;
  const r2 = 27 * scale;
  const bx = cx + r1 * 0.6;
  const by = cy - r1 * 0.6;
  return (
    <g key={key} opacity={clamp01(opacity)}>
      <circle cx={cx} cy={cy} r={r1} fill={color} stroke={stroke} strokeWidth={SW * 0.8} />
      <circle cx={bx} cy={by} r={r2} fill={color} stroke={stroke} strokeWidth={SW * 0.7} />
    </g>
  );
}

export interface CaffeineReceptorDiagramProps {
  /** 화면상 폭(px). viewBox(720x640) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 아데노신이 위에서 내려와 자리잡는 진행도. 기본 0(빈 자리) */
  dockProgress?: number;
  /** 0~1. 카페인이 등장해 아데노신을 밀어내고 자리를 차지하는 진행도. 기본 0 */
  blockProgress?: number;
  /** 0~1. 카페인이 떠나고 아데노신 2개가 몰려와 다시 채우는 진행도. 기본 0(비활성) */
  releaseProgress?: number;
  stroke?: string;
  fill?: string;
  adenosineColor?: string;
  caffeineColor?: string;
  style?: React.CSSProperties;
}

export const CaffeineReceptorDiagram: React.FC<CaffeineReceptorDiagramProps> = ({
  width, x = 0, y = 0,
  dockProgress = 0, blockProgress = 0, releaseProgress = 0,
  stroke = C.ink, fill = C.paper,
  adenosineColor = C.gold, caffeineColor = C.coral,
  style,
}) => {
  const height = (width * RECEPTOR_VB_H) / RECEPTOR_VB_W;
  const dockP = clamp01(dockProgress);
  const blockP = clamp01(blockProgress);
  const relP = clamp01(releaseProgress);
  const releasing = relP > 0.001;

  const SX = RECEPTOR_SOCKET_PT.x;
  const SY = RECEPTOR_SOCKET_PT.y;

  // ---- 아데노신: 위에서 내려와 자리잡고(dockP), 카페인이 오면 오른쪽 위로 밀려나며 옅어진다(blockP) ----
  const dockEase = smoothstep(dockP);
  const adenoBaseCy = SY - (1 - dockEase) * 360;
  const adenoCx = SX + blockP * 210;
  const adenoCy = adenoBaseCy - blockP * 90;
  const adenoScale = 0.55 + 0.45 * dockEase;
  const adenoOpacity = dockP * (1 - blockP);

  // ---- 카페인: 왼쪽에서 등장해 자리를 차지한다(blockP) ----
  const blockEase = smoothstep(blockP);
  const caffCx = SX - (1 - blockEase) * 360;
  const caffScale = 0.55 + 0.45 * blockEase;

  // ---- 방출: 카페인이 오른쪽 아래로 떠나며 옅어지고(0~0.4), 아데노신 2개가 몰려와
  //      다시 채운다(0.25~1, 살짝 겹쳐 매끄럽게 이어짐) ----
  const exitP = clamp01(relP / 0.4);
  const rushP = clamp01((relP - 0.25) / 0.75);
  const rushEase = smoothstep(rushP);
  const caffExitCx = SX + exitP * 300;
  const caffExitCy = SY + exitP * 160;
  const caffExitOpacity = 1 - exitP;
  const rushLeftCx = SX - 260 + rushEase * 260;
  const rushLeftCy = SY - 220 + rushEase * 220;
  const rushRightCx = SX + 230 - rushEase * 150;
  const rushRightCy = SY - 240 + rushEase * 210;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${RECEPTOR_VB_W} ${RECEPTOR_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
      >
        {/* 세포막 표면 */}
        <rect
          x={40} y={MEMBRANE_Y} width={RECEPTOR_VB_W - 80} height={MEMBRANE_H} rx={26}
          fill={C.roomDeep} stroke={stroke} strokeWidth={SW}
        />
        {/* 신호가 향하는 방향(뇌 쪽) 안내 경로 */}
        <line
          x1={SX} y1={MEMBRANE_Y + MEMBRANE_H} x2={SX} y2={RECEPTOR_VB_H - 40}
          stroke={C.inkSoft} strokeWidth={8} strokeDasharray="4 16" strokeLinecap="round" opacity={0.5}
        />
        {/* 수용체 소켓(빈 자리) */}
        <circle
          cx={SX} cy={SY} r={SOCKET_R} fill={fill} stroke={stroke} strokeWidth={SW}
          strokeDasharray={dockP < 0.02 && !releasing ? '10 12' : undefined}
        />

        {!releasing ? moleculeGroup('adeno', adenoCx, adenoCy, adenoScale, adenosineColor, adenoOpacity, stroke) : null}
        {!releasing
          ? moleculeGroup('caff', caffCx, SY, caffScale, caffeineColor, blockEase, stroke)
          : moleculeGroup('caff-exit', caffExitCx, caffExitCy, 1, caffeineColor, caffExitOpacity, stroke)}
        {releasing
          ? moleculeGroup('rush-l', rushLeftCx, rushLeftCy, 0.5 + 0.5 * rushEase, adenosineColor, rushEase, stroke)
          : null}
        {releasing
          ? moleculeGroup('rush-r', rushRightCx, rushRightCy, 0.4 + 0.5 * rushEase, adenosineColor, rushEase, stroke)
          : null}
      </svg>
    </div>
  );
};

export default CaffeineReceptorDiagram;
