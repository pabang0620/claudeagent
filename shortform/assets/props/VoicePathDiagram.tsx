/** "소리가 몸에서 귀까지 가는 경로가 두 개다" 류의 설명에 쓰는 오버레이 다이어그램
 *  (ep03 s3~s5: 공기를 통한 경로 + 뼈를 통한 경로 -> 뼈 경로가 더 두껍고 풍부함 -> 녹음기는
 *  공기 경로만 담아서 뼈 경로가 마이크를 그냥 지나쳐 사라짐).
 *
 *  HeadNerveDiagram(ep01)과 같은 원칙을 따른다: 새 얼굴을 그리지 않고, 이미 승인된
 *  BustActor 얼굴 위에 오버레이만 얹는다. 정렬 방식도 동일 - 오버레이 <svg> 를 BustActor 와
 *  같은 viewBox(BUST_VIEWBOX)·같은 크기·같은 위치로 겹쳐서 좌표 변환 없이 얼굴에 맞춘다.
 *  breathAmp=0 으로 숨쉬기 모션을 꺼서 오버레이가 프레임마다 어긋나지 않게 한다.
 *
 *  두 경로 표현:
 *   - 공기 경로(마우스 -> 머리 바깥을 크게 돌아 -> 귀 바깥쪽으로): 항상 얇고 옅은 선.
 *   - 뼈 경로(마우스 -> 턱뼈/두개골 안쪽의 짧은 길 -> 귀 안쪽으로): boneThickness(0~1)에 따라
 *     선 굵기와 "출렁임 진폭"이 함께 커진다. 내레이션이 "더 낮고 굵어요" 라고 직접 말하는
 *     문장을 그대로 시각화한 것 - 화면에 텍스트 라벨은 없다(REGISTRY 규칙 - 화면 문구는
 *     자막이 담당, 다이어그램은 순수 시각).
 *   - 두 경로 모두 SVG `pathLength=1` 트릭으로 그려서 showAirPath/showBonePath(0~1) 만큼
 *     stroke-dashoffset 을 줄이면 그려지는 것처럼 보인다 (HeadNerveDiagram 신경선과 동일 기법).
 *   - 경로 자체를 살짝 물결치게(perpendicular sine offset) 그려 "파형"으로 읽히게 했다 -
 *     뼈 경로는 진폭이 크고 굵어 "풍부한 소리", 공기 경로는 진폭이 작고 얇아 "밋밋한 소리".
 *
 *  micCapture: 대본 문서(02-script-v2.md)는 이 prop 을 bool 로 적어뒀지만, 여기서는 0~1
 *  숫자 진행도로 구현했다 - 마이크가 팝인하는 동안 뼈 경로가 서서히 사라지는 애니메이션을
 *  만들려면 진행도가 필요하고, 다른 prop(showAirPath 등)도 전부 0~1 진행도라 타입을
 *  통일하는 편이 씬 코드에서 다루기 쉽다. boolean 이 필요하면 호출부에서 0 또는 1을 넘기면
 *  그대로 동작한다(하위 호환 유지).
 */
import React from 'react';
import { C } from '../theme';
import { ThemedIcon } from './ThemedIcon';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** 소리가 출발하는 지점: 캐릭터 실제 입 위치(RIG.MOUTH) 그대로 쓴다.
 *  이름을 MOUTH_PT 로 export 하지 않는 이유: HeadNerveDiagram.tsx 가 이미 같은 이름을
 *  export 하고 있어 배럴(props/index.ts)에서 이름이 겹친다 - 이 파일 안에서만 쓴다. */
const MOUTH_PT = { x: RIG.MOUTH.cx, y: RIG.MOUTH.y };
/** 귀 지점: RIG 에 귀 랜드마크가 없어 새로 잡았다. 지어낸 좌표가 아니라 Character.tsx 의
 *  실측 머리 윤곽 테이블(HEAD_R, 5도 간격 레이캐스트)에서 theta=0(머리 중심 기준 정면
 *  오른쪽, headPoint(0) = {x:882.3, y:452})을 그대로 가져왔다 - 머리 중심 높이(452, 눈과
 *  입 사이)에서 실제 머리 윤곽선과 만나는 점이라 귀 위치로 자연스럽다. */
export const VOICE_EAR_PT = { x: 882, y: 452 };

type Pt = { x: number; y: number };

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function cubicTangent(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

/** 베지어 곡선을 따라가되, 진행 방향에 수직으로 sin 파형만큼 흔들리는 폴리라인 "d" 문자열.
 *  amplitude 가 클수록 "굵고 풍부한 소리", 작을수록 "얇고 밋밋한 소리"로 읽힌다. */
function wavyPathD(p0: Pt, p1: Pt, p2: Pt, p3: Pt, amplitude: number, cycles: number, segments = 56): string {
  const parts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = cubicPoint(p0, p1, p2, p3, t);
    const tan = cubicTangent(p0, p1, p2, p3, t);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const nx = -tan.y / len;
    const ny = tan.x / len;
    const off = amplitude * Math.sin(t * cycles * Math.PI * 2);
    const x = pt.x + nx * off;
    const y = pt.y + ny * off;
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(' ');
}

function arrowTriangle(tip: Pt, dirTan: Pt, size: number): string {
  const len = Math.hypot(dirTan.x, dirTan.y) || 1;
  const dx = dirTan.x / len;
  const dy = dirTan.y / len;
  const nx = -dy;
  const ny = dx;
  const backX = tip.x - dx * size;
  const backY = tip.y - dy * size;
  const p1 = { x: backX + nx * size * 0.55, y: backY + ny * size * 0.55 };
  const p2 = { x: backX - nx * size * 0.55, y: backY - ny * size * 0.55 };
  return `${tip.x},${tip.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`;
}

/* 경로 제어점.
 * 공기 경로: 입 -> 턱 아래로 내려가 머리 윤곽(반지름 약 255) 바깥으로 크게 돌아 -> 귀에
 *   바깥쪽(x=930, 귀 좌표 882 보다 오른쪽)에서 도착한다. "공기를 통해 밖으로 나갔다가
 *   귀로 들어오는" 경로임을 머리 실루엣을 벗어나는 것으로 표현했다.
 * 뼈 경로: 입 -> 턱뼈(입 바로 아래)를 지나 -> 귀에 안쪽(귀 윤곽 아주 살짝 안쪽)에서 도착.
 *   입 모양(mouthPathD, y~505 부근 작은 루프)과 겹쳐 보이지 않도록 곧장 아래로 내려갔다가
 *   가로질러 올라가는 경로로 잡아, 입 윤곽선과 시각적으로 분리되게 했다. */
const AIR_C1: Pt = { x: 690, y: 660 };
const AIR_C2: Pt = { x: 990, y: 560 };
const AIR_END: Pt = { x: 934, y: 452 };
const BONE_C1: Pt = { x: 662, y: 588 };
const BONE_C2: Pt = { x: 792, y: 558 };
const BONE_END: Pt = { x: 874, y: 462 };

const AIR_AMP = 3;
const AIR_CYCLES = 5;
const AIR_STROKE = 7; // SW_HAIR 상당
const BONE_CYCLES = 4;
const BONE_STROKE_MIN = 7;
const BONE_STROKE_MAX = 22;
const BONE_AMP_MIN = 2;
const BONE_AMP_MAX = 20;

const MIC_ICON_SIZE = 88;

export interface VoicePathDiagramProps {
  /** 씬 로컬 프레임 (SceneSwitcher 가 자동으로 넘긴다). 마이크 등장 pop, 은은한 펄스에 쓴다 */
  f: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX 가 정사각형이라 폭=높이다 */
  width: number;
  x?: number;
  y?: number;
  /** 공기 경로(마우스->머리 바깥->귀) 진행도 0~1. 생략하면 그리지 않는다 */
  showAirPath?: number;
  /** 뼈 경로(마우스->두개골 안쪽->귀) 진행도 0~1. 생략하면 그리지 않는다 */
  showBonePath?: number;
  /** 뼈 경로 굵기·출렁임 강조 0~1 (s4: "더 낮고 굵다"의 시각화) */
  boneThickness?: number;
  /** 마이크가 공기 경로만 붙잡고 뼈 경로가 사라지는 진행도 0~1 (s5) */
  micCapture?: number;
  /** 캐릭터 선 색 (기본 ink) */
  stroke?: string;
  /** 캐릭터 채움 색 (기본 paper) */
  fill?: string;
  style?: React.CSSProperties;
}

export const VoicePathDiagram: React.FC<VoicePathDiagramProps> = ({
  f, width, x = 0, y = 0, showAirPath, showBonePath, boneThickness, micCapture,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const airP = showAirPath === undefined ? null : clamp01(showAirPath);
  const boneP = showBonePath === undefined ? null : clamp01(showBonePath);
  const thickT = clamp01(boneThickness ?? 0);
  const micP = clamp01(micCapture ?? 0);

  const boneStroke = lerp(BONE_STROKE_MIN, BONE_STROKE_MAX, thickT);
  const boneAmp = lerp(BONE_AMP_MIN, BONE_AMP_MAX, thickT);
  const boneOpacity = (boneP ?? 0) * (1 - micP);
  // 굵어질수록(풍부해질수록) 뒤에 은은한 온기 halo 를 살짝 얹는다 - 아주 느린 펄스
  const halo = 0.5 + 0.5 * Math.sin(f / 46);

  const airTip = cubicPoint(MOUTH_PT, AIR_C1, AIR_C2, AIR_END, 1);
  const airTan = cubicTangent(MOUTH_PT, AIR_C1, AIR_C2, AIR_END, 1);
  const boneTip = cubicPoint(MOUTH_PT, BONE_C1, BONE_C2, BONE_END, 1);
  const boneTan = cubicTangent(MOUTH_PT, BONE_C1, BONE_C2, BONE_END, 1);

  // 마이크는 공기 경로가 귀에 닿는 지점(바깥쪽) 근처에서, 뼈 경로가 사라지는 것과 반대로
  // "붙잡는" 느낌을 주도록 살짝 위로 띄워 배치한다.
  const micX = AIR_END.x - MIC_ICON_SIZE / 2 + 4;
  const micY = AIR_END.y - MIC_ICON_SIZE - 14;
  const micScale = 0.5 + 0.5 * micP;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      {/* 캐릭터 얼굴 그대로. 오버레이와 어긋나지 않도록 숨쉬기 모션을 끈다 */}
      <BustActor size={width} left={0} top={0} pose={POSES.idle} breathAmp={0} color={stroke} fill={fill} />

      <svg
        viewBox={BUST_VIEWBOX}
        width={width}
        height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 공기 경로 - 항상 얇고 옅게 */}
        {airP !== null ? (
          <>
            <path
              d={wavyPathD(MOUTH_PT, AIR_C1, AIR_C2, AIR_END, AIR_AMP, AIR_CYCLES)}
              fill="none" stroke={C.inkSoft} strokeWidth={AIR_STROKE}
              strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - airP}
            />
            {airP > 0.9 ? (
              <polygon
                points={arrowTriangle(airTip, airTan, 20)}
                fill={C.inkSoft}
                opacity={(airP - 0.9) / 0.1}
              />
            ) : null}
          </>
        ) : null}

        {/* 뼈 경로 - boneThickness 가 커질수록 굵고 출렁이는 "풍부한" 파형이 된다 */}
        {boneP !== null ? (
          <>
            {thickT > 0.05 ? (
              <path
                d={wavyPathD(MOUTH_PT, BONE_C1, BONE_C2, BONE_END, boneAmp * 1.35, BONE_CYCLES)}
                fill="none" stroke={C.coralSoft} strokeWidth={boneStroke * 1.7}
                strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - boneP}
                opacity={boneOpacity * thickT * (0.45 + 0.2 * halo)}
              />
            ) : null}
            <path
              d={wavyPathD(MOUTH_PT, BONE_C1, BONE_C2, BONE_END, boneAmp, BONE_CYCLES)}
              fill="none" stroke={C.coral} strokeWidth={boneStroke}
              strokeLinecap="round" strokeLinejoin="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - boneP}
              opacity={boneOpacity}
            />
            {boneP > 0.9 && boneOpacity > 0.05 ? (
              <polygon
                points={arrowTriangle(boneTip, boneTan, 20 + 10 * thickT)}
                fill={C.coral}
                opacity={((boneP - 0.9) / 0.1) * boneOpacity}
              />
            ) : null}
          </>
        ) : null}

        {/* 마이크: 공기 경로만 붙잡는다 */}
        {micP > 0.02 ? (
          <g
            transform={`translate(${micX} ${micY}) scale(${micScale})`}
            style={{ opacity: micP }}
          >
            <circle
              cx={MIC_ICON_SIZE / 2} cy={MIC_ICON_SIZE / 2} r={MIC_ICON_SIZE / 2 + 14}
              fill={C.goldSoft}
            />
            <ThemedIcon name="microphone" size={MIC_ICON_SIZE} color={C.ink} strokePx={11} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default VoicePathDiagram;
