/** 방과 방 사이의 문틀 + 경계선 플래시.
 *
 *  general-ep11("방문을 넘으면 방금 생각이 날아가는 이유")을 위해 만들었지만, "이 지점을
 *  지나는 순간 상태가 바뀐다"는 구조를 갖는 다른 소재(문턱·체크포인트·경계 통과 전반)에도
 *  재사용할 수 있도록 door 자체는 순수 도형(문설주 두 개 + 상인방 + 문턱)만 그리고, 인물이
 *  실제로 지나가는 움직임은 호출하는 씬이 Actor 의 centerX 를 따로 움직여 만든다(HiccupDiagram/
 *  CellMergeDiagram과 동일한 설계 원칙 - 이 컴포넌트는 "지금 이 순간의 상태"만 그린다).
 *
 *  crossProgress(0~1): 문을 넘는 진행도. 0.5(문 정중앙을 지나는 순간)에서 경계선 플래시가
 *  가장 밝다 - 뾰족한 삼각 envelope 라 0.25~0.75 구간 밖에서는 플래시가 안 보인다. 호출하는
 *  씬이 이 값을 캐릭터의 좌우 이동 progress 와 그대로 맞춰 쓰면(같은 progress 값을 캐릭터 x
 *  좌표 보간과 crossProgress 양쪽에 동시에 쓰면) "문 앞에 실제로 섰을 때 플래시가 터진다"가
 *  자동으로 맞아떨어진다.
 */
import React from 'react';
import { C, SW } from '../theme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface DoorFrameProps {
  /** 화면상 문틀 폭(px) */
  width: number;
  /** 화면상 문틀 높이(px) */
  height: number;
  /** 문틀 좌상단 x */
  x?: number;
  /** 문틀 좌상단 y */
  y?: number;
  /** 0~1. 문을 넘는 진행도 - 0.5 에서 경계선 플래시가 최고조 */
  crossProgress?: number;
  stroke?: string;
  fill?: string;
  /** 경계선 플래시 색 */
  flashColor?: string;
  style?: React.CSSProperties;
}

export const DoorFrame: React.FC<DoorFrameProps> = ({
  width, height, x = 0, y = 0, crossProgress = 0,
  stroke = C.ink, fill = C.paper, flashColor = C.gold, style,
}) => {
  const p = clamp01(crossProgress);
  // 뾰족한 삼각 envelope: p=0.5 에서 1, p<=0.25 또는 p>=0.75 에서 0
  const flash = Math.max(0, 1 - Math.abs(p - 0.5) * 4);
  const jamb = Math.max(12, width * 0.05);

  return (
    <svg
      width={width} height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 문 안쪽(열린 공간) - 살짝 어두운 톤으로 "저 너머 방"을 암시 */}
      <rect x={jamb} y={jamb} width={width - jamb * 2} height={height - jamb} fill={fill} opacity={0.35} />
      {/* 좌우 문설주 */}
      <rect x={0} y={0} width={jamb} height={height} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={width - jamb} y={0} width={jamb} height={height} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
      {/* 상인방 */}
      <rect x={0} y={0} width={width} height={jamb} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
      {/* 문턱 */}
      <rect x={jamb} y={height - jamb * 0.5} width={width - jamb * 2} height={jamb * 0.5} fill={stroke} opacity={0.3} />
      {/* 경계선 플래시 (문 정중앙 세로선) */}
      {flash > 0.01 ? (
        <rect
          x={width / 2 - 7} y={jamb * 0.6} width={14} height={height - jamb * 1.1}
          fill={flashColor} opacity={flash}
        />
      ) : null}
    </svg>
  );
};

export default DoorFrame;
