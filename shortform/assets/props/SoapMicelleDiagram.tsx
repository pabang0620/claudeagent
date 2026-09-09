/** "물과 기름이 서로 밀어내며 안 섞인다 -> 막대 모양 분자들이 기름 방울을 하나씩 둘러싸
 *  작은 덩어리(미셀)를 만든다 -> 그 덩어리가 물속에 떠서 함께 씻겨 나간다"는 3단 인과를
 *  보여주는 다이어그램. general-ep18(비누가 기름을 씻어내는 이유)을 위해 만들었지만
 *  "성질이 다른 두 물질을 특수한 분자가 감싸 하나로 묶어 옮긴다"는 구조를 갖는 다른 소재
 *  (지질막 파괴, 유화, 캡슐화 등)에도 재사용할 수 있도록 이름 라벨 없이 순수 도형만 그린다 -
 *  "계면활성제"/"미셀" 같은 이름은 이 컴포넌트가 아니라 호출하는 씬이 Label 오버레이로
 *  얹는다(REGISTRY 규칙 3 - 화면 문구는 컴포넌트에 하드코딩하지 않는다).
 *
 *  CellMergeDiagram·HiccupDiagram과 동일한 설계 원칙: 이 컴포넌트는 "지금 이 순간의 상태"만
 *  그리고, 시간에 따른 변화는 호출하는 씬이 frame을 가지고 0~1 progress로 만들어 넘긴다.
 *   - separateProgress : 물방울 3개가 기름 방울 쪽으로 다가왔다 밀려나길 반복한다
 *     (0=안 보임, 1=최대 진폭으로 반복 왕복). "물과 기름은 절대 안 섞인다"는 상태를 보여준다.
 *   - surroundProgress : 막대 모양 분자(머리=친수성/물성분 색, 꼬리=친유성/기름 색)들이
 *     기름 방울 둘레에 하나씩 순서대로 나타나 링을 이룬다 (0=없음, 1=전부 등장).
 *   - floatProgress    : surroundProgress로 완성된 덩어리(기름+분자 링)가 통째로 옆으로
 *     떠내려가며 점점 옅어진다 (0=제자리, 1=화면 밖으로 사라짐).
 *  셋 다 0이면 "물속에 기름 방울이 그대로 있는" 정지 상태가 된다(이 화의 s1).
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** viewBox 크기(px). width prop 은 이 폭 기준으로 스케일된다. 라벨을 이 다이어그램 밖에서
 *  Label 로 얹으려면 이 값과 아래 앵커 포인트로 화면 좌표를 계산한다:
 *    scale = width / SOAP_VB_W
 *    screenX = diagramX + anchor.x * scale, screenY = diagramY + anchor.y * scale */
export const SOAP_VB_W = 800;
export const SOAP_VB_H = 800;

const BOX = { x: 90, y: 170, w: 620, h: 520 };
/** 기름 방울(=이후 미셀)의 중심. 세 단계 내내 고정된 기준점이다 */
export const SOAP_OIL_CENTER = { x: 400, y: 460 };
const R_OIL = 108;
const HEAD_R = 20;
const TAIL_LEN = 58;
/** 분자 머리(바깥쪽, 물을 좋아함) 중심이 놓이는 반지름 */
const RING_R = R_OIL + TAIL_LEN + HEAD_R + 14;
const SOAP_COUNT_DEFAULT = 8;

/** i=0(정각 12시 방향)이 revealed 순서상 가장 먼저 나타나는 "예시 분자" - s4에서 이
 *  분자의 머리/꼬리를 가리켜 "물을 좋아함"/"기름을 좋아함" 라벨을 붙이는 데 쓴다. */
export const SOAP_HEAD_LABEL_PT = { x: SOAP_OIL_CENTER.x, y: SOAP_OIL_CENTER.y - RING_R - HEAD_R - 30 };
export const SOAP_TAIL_LABEL_PT = { x: SOAP_OIL_CENTER.x + 168, y: SOAP_OIL_CENTER.y - R_OIL - TAIL_LEN * 0.35 };
/** "계면활성제" 라벨 - 박스 위쪽 바깥 */
export const SOAP_TERM_LABEL_PT = { x: SOAP_OIL_CENTER.x, y: BOX.y - 46 };
/** "미셀" 라벨 - 덩어리 오른쪽. floatProgress 이동량은 soapFloatOffset() 으로 동기화한다 */
export const SOAP_MICELLE_LABEL_PT = { x: SOAP_OIL_CENTER.x + RING_R + 96, y: SOAP_OIL_CENTER.y - 30 };

/** floatProgress -> 덩어리 이동량(dx,dy)·불투명도. 라벨을 같은 좌표계로 따라붙이려면
 *  씬 쪽에서 이 함수를 그대로 다시 호출해 SOAP_MICELLE_LABEL_PT 에 더한다. */
export function soapFloatOffset(floatProgress: number) {
  const p = clamp01(floatProgress);
  const dx = 250 * p;
  const dy = -186 * p;
  const opacity = 1 - clamp01((p - 0.55) / 0.45);
  return { dx, dy, opacity };
}

export interface SoapMicelleDiagramProps {
  /** 화면상 폭(px). viewBox(800x800, 정사각) 기준으로 스케일된다 */
  width: number;
  x?: number;
  y?: number;
  /** 결정론적 idle 애니메이션(물방울 왕복)에 쓰는 현재 프레임 */
  frame: number;
  /** 0~1. 물방울이 기름 방울 쪽으로 다가왔다 밀려나길 반복. 기본 0(안 보임) */
  separateProgress?: number;
  /** 0~1. 분자가 기름 방울을 하나씩 둘러싼다. 기본 0(없음) */
  surroundProgress?: number;
  /** 0~1. 완성된 덩어리가 옆으로 떠내려가며 옅어진다. 기본 0(제자리) */
  floatProgress?: number;
  soapCount?: number;
  oilColor?: string;
  waterColor?: string;
  /** 분자 머리(친수성) 색 */
  headColor?: string;
  /** 분자 꼬리(친유성) 색 - 기름과 같은 계열을 기본값으로 둬서 "기름을 좋아함"이 시각적으로 읽히게 함 */
  tailColor?: string;
  stroke?: string;
  style?: React.CSSProperties;
}

export const SoapMicelleDiagram: React.FC<SoapMicelleDiagramProps> = ({
  width, x = 0, y = 0, frame,
  separateProgress = 0, surroundProgress = 0, floatProgress = 0,
  soapCount = SOAP_COUNT_DEFAULT,
  oilColor = C.gold, waterColor = C.water, headColor = C.waterCool, tailColor = C.gold,
  stroke = C.ink, style,
}) => {
  const sepP = clamp01(separateProgress);
  const surP = clamp01(surroundProgress);
  const height = (width * SOAP_VB_H) / SOAP_VB_W;
  const { dx, dy, opacity: floatOpacity } = soapFloatOffset(floatProgress);

  // 분자가 감싸기 시작하면 "밀려나는 물방울" 데모는 더 이상 필요 없으니 옅어진다
  const repelOpacity = sepP * (1 - clamp01(surP * 2));
  // 결정론적 왕복(다가왔다 밀려남). frame 기반이라 항상 같은 결과.
  const bounce = 0.5 + 0.5 * Math.sin(frame / 14);
  const approach = 0.55 + 0.45 * bounce; // 0.1~1 정도로 왕복

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${SOAP_VB_W} ${SOAP_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
      >
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={44} fill={waterColor} stroke={stroke} strokeWidth={SW} />

        {/* 밀어내는 물방울 3개 - 기름 방울 오른쪽에서 다가왔다 튕겨나가길 반복한다 */}
        {repelOpacity > 0.01 ? (
          <g opacity={repelOpacity}>
            {[0, 1, 2].map((i) => {
              const cx = SOAP_OIL_CENTER.x + R_OIL + 176 - approach * 66;
              const cy = SOAP_OIL_CENTER.y - 66 + i * 66;
              return <circle key={i} cx={cx} cy={cy} r={27} fill={C.sky} stroke={stroke} strokeWidth={SW_THIN} />;
            })}
          </g>
        ) : null}

        {/* 기름 방울 + 분자 링. float 단계에서 하나의 덩어리로 함께 이동·페이드된다 */}
        <g transform={`translate(${dx} ${dy})`} opacity={floatOpacity}>
          <circle cx={SOAP_OIL_CENTER.x} cy={SOAP_OIL_CENTER.y} r={R_OIL} fill={oilColor} stroke={stroke} strokeWidth={SW} />
          {surP > 0.001 ? Array.from({ length: soapCount }).map((_, i) => {
            const revealed = surP * soapCount - i;
            const localP = clamp01(revealed);
            if (localP <= 0.001) return null;
            const angle = (-90 + (360 / soapCount) * i) * (Math.PI / 180);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const headCx = SOAP_OIL_CENTER.x + cos * RING_R;
            const headCy = SOAP_OIL_CENTER.y + sin * RING_R;
            const tailX1 = SOAP_OIL_CENTER.x + cos * (R_OIL - 4);
            const tailY1 = SOAP_OIL_CENTER.y + sin * (R_OIL - 4);
            const tailX2 = SOAP_OIL_CENTER.x + cos * (R_OIL + TAIL_LEN);
            const tailY2 = SOAP_OIL_CENTER.y + sin * (R_OIL + TAIL_LEN);
            const pop = 0.5 + 0.5 * Math.min(1, localP * 1.6);
            return (
              <g
                key={i}
                opacity={Math.min(1, localP * 2)}
                transform={`translate(${headCx} ${headCy}) scale(${pop}) translate(${-headCx} ${-headCy})`}
              >
                <line x1={tailX1} y1={tailY1} x2={tailX2} y2={tailY2} stroke={tailColor} strokeWidth={16} strokeLinecap="round" />
                <circle cx={headCx} cy={headCy} r={HEAD_R} fill={headColor} stroke={stroke} strokeWidth={SW_THIN} />
              </g>
            );
          }) : null}
        </g>
      </svg>
    </div>
  );
};

export default SoapMicelleDiagram;
