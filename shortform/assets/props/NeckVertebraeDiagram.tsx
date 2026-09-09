/** "기린 목뼈도 사람과 똑같이 7개인데, 뼈 개수를 늘리는 대신 뼈 하나하나의 길이를 확 늘렸다"는
 *  구조를 보여주는 다이어그램 세트(기린 목뼈가 사람과 개수가 같은 이유).
 *
 *  02-script-v1.md 자산 목록은 이 파일 하나에 countProgress까지 포함한 4개 독립 progress를
 *  가진 단일 컴포넌트로 계획했으나, REGISTRY 우선 원칙(빌더 정의파일 원칙 0)에 따라 재검토한
 *  결과 "N개를 순서대로 세는" 연출은 이미 `props/BoneStack.tsx`(1화에서 실제로 이 목뼈 소재로
 *  만들어진 것)가 완전히 커버한다 - 그래서 s2(개수 세기)는 BoneStack을 사람/기린 두 벌로 그대로
 *  재사용하고, 이 파일은 BoneStack이 커버하지 못하는 3가지(길이 비교/손바닥 대비/여러 종 공통
 *  개수 배지)만 새로 만든다(29화·77화와 같은 판단 - "신규"로 적힌 자산도 기존 조합으로 충분하면
 *  줄인다).
 *
 *  - NeckVertebraeDiagram: 사람 목뼈 7칸(짧고 균일) vs 기린 목뼈 7칸(칸 수는 그대로 7개, 칸
 *    하나하나의 "길이"만 lengthCompareProgress에 따라 훨씬 길어짐)을 가로로 이어붙인 마디
 *    도형으로 비교한다. HiccupDiagram과 같은 원칙("지금 이 순간의 상태"만 그림, 시간 곡선은
 *    호출 씬이 만듦). 해부학적 뼈 모양을 그리지 않고 둥근 사각형 마디만 이어붙인다(오케스트레이터
 *    지시). 두 줄 다 왼쪽 시작점을 맞춰 "칸 수는 같은데 전체 길이만 다르다"는 것을 직접 대비한다.
 *  - HandBoneCompare: 기린 목뼈 마디 하나 vs 사람 손바닥 실루엣의 크기 대비(손바닥은 손가락
 *    마디 없이 뭉툭한 손가락 4개+엄지 1개로만 단순화, "신체 표현은 최소한으로" 원칙).
 *  - NeckCountBadge: 여러 포유류 아래에 공통으로 붙이는 작은 점 7개 체인 배지. "몇 종이든
 *    이 개수만큼 갖고 있다"는 걸 보여주는 다른 소재(치아 개수, 다리 개수 등)에도 재사용 가능성이
 *    있어 별도 export로 뒀다.
 *  - Manatee: 매너티 실루엣(예외 동물 표시용). REGISTRY에 없어 새로 그렸다(Sloth는 기존 자산
 *    재사용). "신체 표현은 최소한으로" 원칙에 따라 뭉툭한 몸통 하나 + 노 모양 꼬리 + 지느러미
 *    2개 + 눈 1개(옆모습 관례)로만 구성했다.
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ============================================================
 * NeckVertebraeDiagram - 사람 vs 기린 목뼈 칸 길이 비교
 * ============================================================ */

export const NECK_VB_W = 1450;
export const NECK_VB_H = 620;

const SEG_COUNT = 7;
const SEG_GAP = 10;
const SEG_H = 70;
const START_X = 250;
const HUMAN_Y = 140;
const GIRAFFE_Y = 400;
const HUMAN_SEG_W = 50;
const GIRAFFE_SEG_W_MAX = 130;

/** 라벨 앵커(다이어그램 밖 Label에서 쓴다). scale = width / NECK_VB_W */
/** 34 오프셋으로는 Label(FS.label=46, 줄높이 약 85 local 단위) 이 다음 줄의 마디 도형과
 *  겹치는 결함이 스틸 선점검에서 실측됐다(99-build-report.md 참고) - 150으로 늘려 텍스트
 *  높이 + 여유 간격을 확보했다. */
export const NECK_HUMAN_LABEL_PT = { x: START_X, y: HUMAN_Y - 150 };
export const NECK_GIRAFFE_LABEL_PT = { x: START_X, y: GIRAFFE_Y - 150 };

function segChain(
  startX: number, y: number, segW: number, count: number, color: string, stroke: string, strokeWidth: number,
) {
  const out: React.ReactNode[] = [];
  let cx = startX;
  for (let i = 0; i < count; i++) {
    out.push(
      <rect
        key={i} x={cx} y={y} width={segW} height={SEG_H} rx={SEG_H * 0.3}
        fill={color} stroke={stroke} strokeWidth={strokeWidth}
      />,
    );
    cx += segW + SEG_GAP;
  }
  return out;
}

export interface NeckVertebraeDiagramProps {
  /** 화면상 폭(px). viewBox(1450x620) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0 = 사람·기린 칸이 같은 크기(s2 종료 상태와 동일), 1 = 기린 칸이 훨씬 길어짐.
   *  기본 0(정지 상태 - 칸 수만 보여줌) */
  lengthCompareProgress?: number;
  stroke?: string;
  humanColor?: string;
  giraffeColor?: string;
  style?: React.CSSProperties;
}

export const NeckVertebraeDiagram: React.FC<NeckVertebraeDiagramProps> = ({
  width, x = 0, y = 0, lengthCompareProgress = 0,
  stroke = C.ink, humanColor = C.gold, giraffeColor = C.coral, style,
}) => {
  const p = clamp01(lengthCompareProgress);
  const height = (width * NECK_VB_H) / NECK_VB_W;
  const giraffeSegW = HUMAN_SEG_W + (GIRAFFE_SEG_W_MAX - HUMAN_SEG_W) * p;

  return (
    <svg
      viewBox={`0 0 ${NECK_VB_W} ${NECK_VB_H}`} width={width} height={height}
      style={{ position: 'absolute', left: x, top: y, ...style }}
      shapeRendering="geometricPrecision"
    >
      {segChain(START_X, HUMAN_Y, HUMAN_SEG_W, SEG_COUNT, humanColor, stroke, SW)}
      {segChain(START_X, GIRAFFE_Y, giraffeSegW, SEG_COUNT, giraffeColor, stroke, SW)}
    </svg>
  );
};

/* ============================================================
 * HandBoneCompare - 기린 목뼈 하나 vs 사람 손바닥 크기 대비
 * ============================================================ */

export const HAND_BONE_VB_W = 900;
export const HAND_BONE_VB_H = 480;

const PALM_X = 560;
const PALM_Y = 120;
const PALM_W = 210;
const PALM_H = 240;

/** 라벨 앵커(다이어그램 밖 Label에서 쓴다). scale = width / HAND_BONE_VB_W.
 *  뼈 라벨은 growProgress=1일 때의 최대 길이 중앙 기준으로 고정해 뒀다(뼈 길이가 자라는
 *  중에도 라벨이 튀지 않도록 - HiccupDiagram과 동일하게 라벨은 컴포넌트 밖에서 정적으로 얹는다) */
export const HAND_BONE_LABEL_PT = { x: 285, y: 150 };
export const HAND_PALM_LABEL_PT = { x: PALM_X + PALM_W / 2, y: PALM_Y - 50 };

export interface HandBoneCompareProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 0 = 손바닥과 비슷한 짧은 마디, 1 = 손바닥보다 뚜렷하게 긴 뼈 마디. 기본 0 */
  growProgress?: number;
  stroke?: string;
  fill?: string;
  boneColor?: string;
  style?: React.CSSProperties;
}

export const HandBoneCompare: React.FC<HandBoneCompareProps> = ({
  width, x = 0, y = 0, growProgress = 0,
  stroke = C.ink, fill = C.paper, boneColor = C.coral, style,
}) => {
  const p = clamp01(growProgress);
  const height = (width * HAND_BONE_VB_H) / HAND_BONE_VB_W;
  const boneW = 140 + (430 - 140) * p; // 짧음 -> 손바닥보다 확실히 긴 길이
  const boneH = 92;
  const boneX = 70;
  const boneY = 194;

  return (
    <svg
      viewBox={`0 0 ${HAND_BONE_VB_W} ${HAND_BONE_VB_H}`} width={width} height={height}
      style={{ position: 'absolute', left: x, top: y, ...style }}
      shapeRendering="geometricPrecision"
    >
      {/* 기린 목뼈 마디 하나 (둥근 캡슐) */}
      <rect
        x={boneX} y={boneY} width={boneW} height={boneH} rx={boneH / 2}
        fill={boneColor} stroke={stroke} strokeWidth={SW}
      />

      {/* 사람 손바닥 - 손바닥 뭉치 + 손가락 4개(뭉툭한 마디) + 엄지 1개 */}
      <rect x={PALM_X} y={PALM_Y + 70} width={PALM_W} height={PALM_H - 70} rx={40}
        fill={fill} stroke={stroke} strokeWidth={SW} />
      {[0, 1, 2, 3].map((i) => {
        const fw = 34;
        const gap = 10;
        const totalW = fw * 4 + gap * 3;
        const fx = PALM_X + (PALM_W - totalW) / 2 + i * (fw + gap);
        const fh = 96 - Math.abs(i - 1.5) * 10; // 가운데 손가락이 살짝 더 길다
        return (
          <rect
            key={i} x={fx} y={PALM_Y + 70 - fh + 18} width={fw} height={fh} rx={fw / 2}
            fill={fill} stroke={stroke} strokeWidth={SW}
          />
        );
      })}
      {/* 엄지 */}
      <rect
        x={PALM_X - 44} y={PALM_Y + 150} width={70} height={34} rx={17}
        fill={fill} stroke={stroke} strokeWidth={SW}
        transform={`rotate(-28 ${PALM_X - 44} ${PALM_Y + 150})`}
      />
    </svg>
  );
};

/* ============================================================
 * NeckCountBadge - 여러 종 공통 "목뼈 7개" 점 체인 배지
 * ============================================================ */

export const NECK_BADGE_VB_W = 360;
export const NECK_BADGE_VB_H = 60;

export interface NeckCountBadgeProps {
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 왼쪽부터 순서대로 점이 나타나는 진행도. 기본 0(안 보임) */
  revealProgress?: number;
  color?: string;
  stroke?: string;
  style?: React.CSSProperties;
}

export const NeckCountBadge: React.FC<NeckCountBadgeProps> = ({
  width, x = 0, y = 0, revealProgress = 0, color = C.coral, stroke = C.ink, style,
}) => {
  const p = clamp01(revealProgress);
  const height = (width * NECK_BADGE_VB_H) / NECK_BADGE_VB_W;
  const count = 7;
  const r = 20;
  const gap = 22;
  const totalW = count * r * 2 + (count - 1) * gap;
  const startX = (NECK_BADGE_VB_W - totalW) / 2 + r;
  const shown = p * count;

  return (
    <svg
      viewBox={`0 0 ${NECK_BADGE_VB_W} ${NECK_BADGE_VB_H}`} width={width} height={height}
      style={{ position: 'absolute', left: x, top: y, ...style }}
      shapeRendering="geometricPrecision"
    >
      {Array.from({ length: count }).map((_, i) => {
        const on = shown > i;
        const localT = clamp01(shown - i);
        const s = on ? 0.7 + 0.3 * Math.sin(Math.min(1, localT) * Math.PI * 0.5 + Math.PI * 0.5) + 0.3 * (1 - Math.min(1, localT)) : 0;
        const cx = startX + i * (r * 2 + gap);
        const cy = NECK_BADGE_VB_H / 2;
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill={color} stroke={stroke} strokeWidth={SW * 0.55}
            opacity={on ? 1 : 0}
            transform={`translate(${cx} ${cy}) scale(${on ? Math.max(0.001, s) : 0.001}) translate(${-cx} ${-cy})`}
          />
        );
      })}
    </svg>
  );
};

/* ============================================================
 * Manatee - 매너티 실루엣 (예외 동물)
 * ============================================================ */

export const MANATEE_VB_W = 520;
export const MANATEE_VB_H = 280;

export interface ManateeProps {
  width: number;
  stroke?: string;
  fill?: string;
  spot?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Manatee: React.FC<ManateeProps> = ({
  width, stroke = C.ink, fill = C.paper, spot = C.coral, strokeWidth = SW, style,
}) => (
  <svg viewBox={`0 0 ${MANATEE_VB_W} ${MANATEE_VB_H}`} width={width} style={style} shapeRendering="geometricPrecision">
    {/* 뭉툭한 몸통 */}
    <path
      d="M 60 150 C 60 96, 130 62, 250 62 C 360 62, 430 90, 452 140
         C 430 190, 360 214, 250 214 C 130 214, 60 204, 60 150 Z"
      fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
    />
    {/* 노 모양 꼬리 */}
    <path
      d="M 440 118 C 480 100, 512 110, 512 150 C 512 190, 480 200, 440 182 Z"
      fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
    />
    {/* 앞지느러미 */}
    <path
      d="M 168 188 C 176 216, 168 240, 140 238 C 122 220, 126 196, 148 182 Z"
      fill={spot} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
    />
    {/* 눈 (옆모습 관례 - 하나만) */}
    <circle cx={112} cy={128} r={10} fill={stroke} />
    {/* 코 주름(단일 선 하나로만 - 촘촘한 표현 금지) */}
    <path d="M 66 152 C 78 160, 92 160, 100 150" fill="none" stroke={stroke} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

export default NeckVertebraeDiagram;
