/** 밀폐 김치통 소품(general-ep57, "김치가 시어지고 익는 이유"). REGISTRY 확인 결과
 *  발효·미생물 다이어그램(MilkCurdleDiagram·DoughDiagram)은 "액체/반죽 속을 확대해서 보는"
 *  단면 시점이라 "통 바깥에서 본 밀폐 용기" 자체를 표현하는 소품이 없었다. SodaCan.tsx의
 *  뚜껑 개폐(`open`)·기포 연속보간(`shaken`) 설계를 그대로 가져와 밀폐/개봉·기포 상승에
 *  적용했다.
 *
 *  "신체 표현은 최소한으로" 원칙(builder 지침)에 따라 세균은 촘촘한 점 무리가 아니라 크고
 *  단순한 도형 각 1개(유산균은 MilkCurdleDiagram·DoughDiagram과 동일한 얼굴 도형, 다른 균은
 *  얼굴 없는 무채색 타원 1개)로만 그려 "유산균이 다른 균보다 잘 자란다"는 경쟁 구도를
 *  표현한다. 신맛 정도는 세로 게이지 막대 하나로만 표현하고(물결선·기호 남발 금지, 오케스트
 *  레이터 지시), 기포도 SodaCan과 달리 최대 3개까지만 그린다. 김치 채움색(진한 코랄/레드)
 *  위에 균을 바로 올리면 안 읽혀서(2026-09-02 스틸 선점검 발견) 균 뒤에 항상 흰 받침 원
 *  (`ReadabilityDisc`)을 깐다.
 *
 *   - sealProgress   : 0~1. 뚜껑이 살짝 뜬 상태 -> 몸통에 딱 맞게 닫히고(0~1), 양옆에 밀폐
 *     클립이 나타나며(0.5~1), 소금 결정 2개가 팝인(0~0.4)하고, 유산균 1마리가 자라는 동안
 *     (0.3~1) 다른 균 1마리는 작아지며 옅어진다(0.2~0.9). s4용.
 *   - lidOpen        : 0~1. sealProgress 로 정해진 뚜껑 위치에서 더 위로 들리며 살짝
 *     기울어진다(뚜껑을 여는 동작). 0이면 sealProgress 가 정한 위치 그대로. s6~s7용.
 *   - bubbleProgress  : 0~1. 김치 표면 아래에서 기포 3개가 시차를 두고 올라오다 위쪽에서
 *     옅어지며 사라진다. s6~s7용.
 *   - acidityProgress : 0~1. 오른쪽 세로 게이지 막대가 옅은 색에서 짙은 신맛 색으로 차오른다.
 *     showGauge=true 일 때만 그려진다(s7용, 단독으로도 쓸 수 있다).
 *   - showGauge       : 기본 false. true면 오른쪽 산도 게이지를 그린다. s4·s6처럼 산도를
 *     아직 다루지 않는 장면에서 빈 게이지가 불필요하게 떠 있지 않게 기본값을 꺼뒀다.
 *  전부 0이면 "뚜껑이 살짝 뜬 채 아무 반응도 없는 김치통"만 보이는 정지 다이어그램이 된다.
 */
import React, { useId } from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';

export const FERMENT_JAR_VB_W = 620;
export const FERMENT_JAR_VB_H = 680;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function diamond(cx: number, cy: number, r: number) {
  return `M ${cx},${cy - r} L ${cx + r * 0.72},${cy} L ${cx},${cy + r} L ${cx - r * 0.72},${cy} Z`;
}

const JAR = { x: 160, y: 260, w: 280, h: 340, rx: 26 };
const LID = { w: 328, h: 58 };
const LID_X = JAR.x + (JAR.w - LID.w) / 2;
const LID_Y_UNSEALED = JAR.y - 70;
const LID_Y_SEALED = JAR.y - 30;
const LID_OPEN_LIFT = 96;

/** 유산균 1마리(얼굴 있음) - MilkCurdleDiagram·DoughDiagram과 동일 설계 */
function LacticBacterium({
  x, y, r, appear, stroke, fill,
}: { x: number; y: number; r: number; appear: number; stroke: string; fill: string }) {
  if (appear <= 0.001) return null;
  const s = 0.5 + 0.5 * appear;
  return (
    <g style={{ opacity: appear }} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.88} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={-r * 0.3} cy={-r * 0.06} r={r * 0.1} fill={stroke} />
      <circle cx={r * 0.3} cy={-r * 0.06} r={r * 0.1} fill={stroke} />
      <path
        d={`M ${-r * 0.24} ${r * 0.32} Q 0 ${r * 0.48} ${r * 0.24} ${r * 0.32}`}
        fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.7} strokeLinecap="round"
      />
    </g>
  );
}

/** 다른 균 1마리 - 얼굴 없는 무채색 타원(경쟁에서 밀려 작아지고 옅어진다는 대비만 준다) */
function OtherGerm({
  x, y, r, opacity, stroke, fill,
}: { x: number; y: number; r: number; opacity: number; stroke: string; fill: string }) {
  if (opacity <= 0.02) return null;
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.82} fill={fill} stroke={stroke} strokeWidth={SW_THIN * 0.7} opacity={opacity} />;
}

/** 균 뒤에 까는 밝은 받침 원 - 김치 채움색(진한 코랄/레드)이 균 색과 겹치면 잘 안 읽혀서
 *  (2026-09-02 스틸 선점검 발견) 항상 흰 받침을 깔아 대비를 확보한다 */
function ReadabilityDisc({ x, y, r, opacity }: { x: number; y: number; r: number; opacity: number }) {
  if (opacity <= 0.02) return null;
  return <circle cx={x} cy={y} r={r} fill={C.paper} opacity={opacity} />;
}

const SALT_PTS = [
  { x: JAR.x + 92, y: JAR.y + 70, r: 20 },
  { x: JAR.x + 196, y: JAR.y + 56, r: 16 },
];

const BUBBLE_PTS = [
  { dx: -66, phase: 0, r: 16 },
  { dx: 6, phase: 0.32, r: 19 },
  { dx: 74, phase: 0.6, r: 14 },
];

export interface FermentJarProps {
  /** 화면상 폭(px). viewBox(620x680) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 뚜껑이 닫히며 밀폐 클립·소금이 나타나고, 유산균이 자라는 동안 다른 균은 작아진다. s4용 */
  sealProgress?: number;
  /** 0~1. 뚜껑이 더 위로 들리며 기울어져 열린다. s6~s7용 */
  lidOpen?: number;
  /** 0~1. 기포 3개가 시차를 두고 올라와 위에서 사라진다. s6~s7용 */
  bubbleProgress?: number;
  /** 0~1. 오른쪽 세로 게이지가 옅은 색에서 짙은 신맛 색으로 차오른다. s7용 */
  acidityProgress?: number;
  /** true면 오른쪽 산도 게이지 막대를 그린다. 기본 false - s4·s6처럼 산도를 아직 다루지
   *  않는 장면에서 빈 게이지가 불필요하게 떠 있지 않게 한다. s7에서만 true로 켠다 */
  showGauge?: boolean;
  stroke?: string;
  jarColor?: string;
  lidColor?: string;
  kimchiColor?: string;
  saltColor?: string;
  bacteriaColor?: string;
  otherGermColor?: string;
  acidColor?: string;
  style?: React.CSSProperties;
}

export const FermentJar: React.FC<FermentJarProps> = ({
  width, x = 0, y = 0,
  sealProgress = 0, lidOpen = 0, bubbleProgress = 0, acidityProgress = 0, showGauge = false,
  stroke = C.ink, jarColor = C.paper, lidColor = C.hill, kimchiColor = C.coral,
  saltColor = C.paper, bacteriaColor = C.gold, otherGermColor = C.inkSoft, acidColor = '#E2543C',
  style,
}) => {
  const clipId = `fermentJarClip-${useId()}`;
  const height = (width * FERMENT_JAR_VB_H) / FERMENT_JAR_VB_W;
  const sealP = clamp01(sealProgress);
  const openP = clamp01(lidOpen);
  const bubbleP = clamp01(bubbleProgress);
  const acidP = clamp01(acidityProgress);

  const lidBaseY = lerp(LID_Y_UNSEALED, LID_Y_SEALED, smooth(sealP));
  const lidY = lidBaseY - LID_OPEN_LIFT * smooth(openP);
  const lidTilt = -10 * smooth(openP);
  const clipA = smooth(clamp01((sealP - 0.5) / 0.5));

  const saltA = smooth(clamp01(sealP / 0.4));
  const lacticAppear = smooth(clamp01((sealP - 0.3) / 0.7));
  const lacticR = lerp(20, 56, lacticAppear);
  const otherShrink = smooth(clamp01((sealP - 0.2) / 0.7));
  const otherR = lerp(38, 10, otherShrink);
  const otherOpacity = 0.85 * (1 - otherShrink * 0.75);

  const kimchiTop = JAR.y + 36;
  const kimchiBottom = JAR.y + JAR.h - 22;
  /** 기포가 도달하는 최고 높이 - 항상 김치 채움 클립 영역(kimchiTop 근처) 안에 머문다.
   *  이전에는 lidOpen 에 비례해 클립 영역 밖(JAR.y-40)까지 올라가도록 했는데, 클립된
   *  <g> 밖으로 나가면 그냥 안 보이게 잘려서 진행도가 높을수록(기포가 위로 갈수록)
   *  오히려 기포가 안 보이는 결함이 있었다(2026-09-02 스틸 선점검, s7 f1250에서 기포
   *  0개로 확인). 기포 자체의 fadeOut(local>0.82)이 사라지는 연출을 담당하게 하고,
   *  이 값은 항상 클립 안쪽에 둔다. */
  const bubbleTopY = kimchiTop + 6;

  const gaugeX = JAR.x + JAR.w + 62;
  const gaugeYTop = JAR.y + 30;
  const gaugeH = 280;
  const gaugeW = 46;
  const gaugeFillH = gaugeH * smooth(acidP);
  const gaugeColor = acidP <= 0.01 ? C.goldSoft
    : `rgb(${Math.round(lerp(255, parseInt(acidColor.slice(1, 3), 16), smooth(acidP)))},`
      + `${Math.round(lerp(240, parseInt(acidColor.slice(3, 5), 16), smooth(acidP)))},`
      + `${Math.round(lerp(206, parseInt(acidColor.slice(5, 7), 16), smooth(acidP)))})`;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg viewBox={`0 0 ${FERMENT_JAR_VB_W} ${FERMENT_JAR_VB_H}`} width={width} height={height} style={{ overflow: 'visible' }}>
        {/* 항아리 몸체 */}
        <rect
          x={JAR.x} y={JAR.y} width={JAR.w} height={JAR.h} rx={JAR.rx}
          fill={jarColor} stroke={stroke} strokeWidth={SW}
        />
        {/* 김치 채움 */}
        <clipPath id={clipId}>
          <rect x={JAR.x + 6} y={JAR.y + 6} width={JAR.w - 12} height={JAR.h - 12} rx={JAR.rx - 6} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <rect
            x={JAR.x} y={kimchiTop} width={JAR.w} height={kimchiBottom - kimchiTop}
            fill={kimchiColor}
          />
          {/* 기포 - 최대 3개, 시차를 두고 상승하며 위에서 옅어짐 */}
          {bubbleP > 0.01 ? BUBBLE_PTS.map((pt, i) => {
            const local = clamp01((bubbleP - pt.phase) / (1 - pt.phase));
            if (local <= 0.01) return null;
            const by = lerp(kimchiBottom - 10, bubbleTopY, smooth(local));
            const fadeOut = local > 0.82 ? 1 - (local - 0.82) / 0.18 : 1;
            return (
              <circle
                key={`bub${i}`} cx={JAR.x + JAR.w / 2 + pt.dx} cy={by} r={pt.r}
                fill={C.paper} stroke={stroke} strokeWidth={SW_THIN * 0.55} opacity={0.9 * fadeOut}
              />
            );
          }) : null}
        </g>
        <rect x={JAR.x} y={JAR.y} width={JAR.w} height={JAR.h} rx={JAR.rx} fill="none" stroke={stroke} strokeWidth={SW} />

        {/* 소금 결정 2개 */}
        {saltA > 0.02 ? SALT_PTS.map((pt, i) => (
          <path
            key={`salt${i}`} d={diamond(pt.x, pt.y, pt.r)} fill={saltColor} stroke={stroke}
            strokeWidth={SW_THIN * 0.6} opacity={saltA}
          />
        )) : null}

        {/* 유산균 vs 다른 균 - 경쟁 구도. 진한 김치색 위에서도 읽히도록 밝은 받침을 먼저 깐다 */}
        <ReadabilityDisc x={JAR.x + 196} y={kimchiBottom - 46} r={otherR + 8} opacity={otherOpacity} />
        <OtherGerm
          x={JAR.x + 196} y={kimchiBottom - 46} r={otherR} opacity={otherOpacity}
          stroke={stroke} fill={otherGermColor}
        />
        <ReadabilityDisc x={JAR.x + 96} y={kimchiBottom - 46} r={lacticR * (0.5 + 0.5 * lacticAppear) + 8} opacity={lacticAppear} />
        <LacticBacterium
          x={JAR.x + 96} y={kimchiBottom - 46} r={lacticR} appear={lacticAppear}
          stroke={stroke} fill={bacteriaColor}
        />

        {/* 뚜껑 - 밀폐 클립 2개 + 뚜껑 본체 */}
        <g transform={`translate(${LID_X + LID.w / 2} ${lidY}) rotate(${lidTilt}) translate(${-(LID_X + LID.w / 2)} ${-lidY})`}>
          {clipA > 0.02 ? (
            <>
              <path
                d={`M ${JAR.x - 4},${lidY + LID.h - 10} Q ${JAR.x - 26},${lidY + LID.h + 6} ${JAR.x - 4},${lidY + LID.h + 22}`}
                fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" opacity={clipA}
              />
              <path
                d={`M ${JAR.x + JAR.w + 4},${lidY + LID.h - 10} Q ${JAR.x + JAR.w + 26},${lidY + LID.h + 6} ${JAR.x + JAR.w + 4},${lidY + LID.h + 22}`}
                fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" opacity={clipA}
              />
            </>
          ) : null}
          <rect x={LID_X} y={lidY} width={LID.w} height={LID.h} rx={20} fill={lidColor} stroke={stroke} strokeWidth={SW} />
          <ellipse cx={LID_X + LID.w / 2} cy={lidY + LID.h} rx={LID.w / 2 - 14} ry={12} fill={lidColor} stroke={stroke} strokeWidth={SW_THIN} opacity={0.9} />
        </g>

        {/* 산도 게이지 - 세로 막대 하나. showGauge 일 때만(s7) */}
        {showGauge ? (
          <>
            <rect
              x={gaugeX} y={gaugeYTop} width={gaugeW} height={gaugeH} rx={gaugeW / 2}
              fill={C.hillFar} stroke={stroke} strokeWidth={SW_THIN}
            />
            {gaugeFillH > 1 ? (
              <rect
                x={gaugeX} y={gaugeYTop + gaugeH - gaugeFillH} width={gaugeW} height={gaugeFillH} rx={gaugeW / 2}
                fill={gaugeColor}
              />
            ) : null}
            <rect
              x={gaugeX} y={gaugeYTop} width={gaugeW} height={gaugeH} rx={gaugeW / 2}
              fill="none" stroke={stroke} strokeWidth={SW_THIN}
            />
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default FermentJar;
