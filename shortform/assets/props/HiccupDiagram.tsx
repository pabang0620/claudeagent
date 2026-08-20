/** "몸속 근육이 순간 경련하고, 그 직후 통로 입구가 반사적으로 좁아져 닫힌다"는 2단 인과를
 *  보여주는 몸통 옆모습 다이어그램. 딸꾹질(횡격막 경련 -> 목 입구 반사적 폐쇄, general-ep07)을
 *  위해 만들었지만 "근육 경련 -> 통로가 반사적으로 좁아짐" 구조를 갖는 다른 신체 반사 소재
 *  전반에도 재사용할 수 있도록 라벨 없이 순수 도형만 그린다 - "횡격막"/"목 입구가 탁 닫힘" 같은
 *  이름 라벨은 이 컴포넌트가 아니라 호출하는 씬이 별도 Label 오버레이로 얹는다(REGISTRY 규칙 3-6,
 *  화면 문구는 컴포넌트에 하드코딩하지 않는다).
 *
 *  CellMergeDiagram(general-ep04)과 동일한 설계 원칙을 따른다: 이 컴포넌트는 "지금 이 순간의
 *  상태"만 그리고, 시간에 따른 변화 곡선(반복 트윗치, 단발성 스냅 등)은 호출하는 씬이 frame을
 *  가지고 직접 만들어 0~1 값으로 넘긴다.
 *   - spasmProgress : 근육 부위(횡격막)가 지금 얼마나 수축해 있는지 (0=평상시, 1=최대 수축).
 *     수축할수록 아치가 가슴 쪽(위)에서 배 쪽(아래)으로 당겨져 내려온다 + 은은한 발광.
 *   - snapProgress   : 통로 입구(목)가 지금 얼마나 닫혀 있는지 (0=완전히 열림, 1=완전히 닫힘).
 *     위/아래 두 "눈꺼풀"이 중앙으로 좁혀져 만나는 방식으로 표현(닫히는 동작이 직관적으로
 *     읽히는 셔터/눈꺼풀 은유). 닫히는 중간 지점(0.5 부근)에서 짧게 반짝인다.
 *  둘 다 0이면 "평상시 정지 상태"만 보여주는 정지 다이어그램이 된다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** viewBox 크기(px). width prop 은 이 폭 기준으로 스케일된다. 라벨을 이 다이어그램 밖에서
 *  Label 로 얹으려면 이 값과 아래 앵커 포인트로 화면 좌표를 계산한다:
 *    scale = width / HICCUP_VB_W
 *    screenX = diagramX + anchor.x * scale, screenY = diagramY + anchor.y * scale */
export const HICCUP_VB_W = 560;
export const HICCUP_VB_H = 820;

/** 횡격막(근육) 라벨 앵커 - 아치 아래 배 쪽 여백 */
export const HICCUP_DIAPHRAGM_PT = { x: 280, y: 655 };
/** 목 입구(통로) 라벨 앵커 - 목 오른쪽 옆 여백 */
export const HICCUP_THROAT_PT = { x: 430, y: 230 };

export interface HiccupDiagramProps {
  /** 화면상 폭(px). viewBox(560x820) 비율로 높이가 자동으로 정해진다 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 횡격막이 지금 얼마나 수축해 있는지. 기본 0(평상시) */
  spasmProgress?: number;
  /** 0~1. 목 입구가 지금 얼마나 닫혀 있는지. 기본 0(완전히 열림) */
  snapProgress?: number;
  stroke?: string;
  fill?: string;
  /** 횡격막 아치 색 */
  accent?: string;
  style?: React.CSSProperties;
}

export const HiccupDiagram: React.FC<HiccupDiagramProps> = ({
  width, x = 0, y = 0, spasmProgress = 0, snapProgress = 0,
  stroke = C.ink, fill = C.paper, accent = C.coral, style,
}) => {
  const spasmP = clamp01(spasmProgress);
  const snapP = clamp01(snapProgress);
  const height = (width * HICCUP_VB_H) / HICCUP_VB_W;

  // 횡격막 아치: 평상시엔 가슴 쪽으로 둥글게 솟아 있다가(controlY 작음 = 위로),
  // 수축하면 배 쪽으로 당겨져 내려온다(controlY 커짐 = 아래로).
  const restControlY = 490;
  const contractedControlY = 590;
  const controlY = restControlY + (contractedControlY - restControlY) * spasmP;

  // 목 입구: 위/아래 두 "눈꺼풀"이 snapP 만큼 중앙(230)으로 좁혀져 만난다
  const passageTop = 205;
  const passageMid = 230;
  const passageBottom = 255;
  const topFlapY = passageTop + (passageMid - passageTop) * snapP;
  const bottomFlapY = passageBottom - (passageBottom - passageMid) * snapP;
  // 닫히는 중간 지점(snapP=0.5)에서 가장 밝게 반짝
  const snapFlash = 4 * snapP * (1 - snapP);
  // 공기가 훅 들어가는 화살표 - 수축은 시작됐는데 아직 다 안 닫혔을 때만 보인다
  const airArrowOpacity = spasmP * (1 - snapP);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${HICCUP_VB_W} ${HICCUP_VB_H}`} width={width} height={height}
        style={{ overflow: 'visible' }}
      >
        {/* 몸통 실루엣 */}
        <rect x={90} y={295} width={380} height={460} rx={90} ry={90} fill={fill} stroke={stroke} strokeWidth={SW} />
        {/* 갈비뼈 (문맥용 장식 - 그 아래가 횡격막이라는 걸 읽히게 함) */}
        {[350, 390, 430].map((ry) => (
          <path
            key={ry} d={`M 130 ${ry} Q 280 ${ry - 22} 430 ${ry}`} fill="none"
            stroke={C.inkSoft} strokeWidth={SW_THIN} opacity={0.45} strokeLinecap="round"
          />
        ))}
        {/* 목 */}
        <rect x={310} y={185} width={80} height={110} fill={fill} stroke={stroke} strokeWidth={SW} />
        {/* 머리 (단순 실루엣 - 캐릭터 얼굴과 혼동되지 않도록 이목구비 없이) */}
        <circle cx={350} cy={110} r={85} fill={fill} stroke={stroke} strokeWidth={SW} />

        {/* 목 입구 통로 - 항상 있는 빈 통로 배경 */}
        <rect x={326} y={passageTop} width={48} height={passageBottom - passageTop} fill={C.roomDeep} opacity={0.5} />
        {/* 위 눈꺼풀(닫히는 조직) */}
        <rect
          x={326} y={passageTop} width={48} height={Math.max(0, topFlapY - passageTop)}
          fill={fill} stroke={stroke} strokeWidth={SW_THIN}
        />
        {/* 아래 눈꺼풀 */}
        <rect
          x={326} y={bottomFlapY} width={48} height={Math.max(0, passageBottom - bottomFlapY)}
          fill={fill} stroke={stroke} strokeWidth={SW_THIN}
        />
        {/* 닫히는 순간 반짝 */}
        {snapFlash > 0.01 ? (
          <circle cx={350} cy={passageMid} r={40 + 30 * snapFlash} fill={C.gold} opacity={snapFlash * 0.55} />
        ) : null}

        {/* 공기가 훅 들어가는 화살표 (수축 중 + 아직 닫히기 전에만) */}
        {airArrowOpacity > 0.01 ? (
          <path
            d="M 350 240 L 336 264 L 346 264 L 346 280 L 354 280 L 354 264 L 364 264 Z"
            fill={C.sky} opacity={airArrowOpacity}
          />
        ) : null}

        {/* 횡격막(근육) 아치 */}
        <path
          d={`M 130 560 Q 280 ${controlY} 430 560`}
          fill="none" stroke={accent} strokeWidth={22} strokeLinecap="round"
          style={spasmP > 0.01 ? { filter: `drop-shadow(0 0 ${8 + 14 * spasmP}px ${accent})` } : undefined}
        />
      </svg>
    </div>
  );
};

export default HiccupDiagram;
