/** 탄산음료 캔. `shaken`(0~1)으로 캔 벽에 붙은 기포 소수 <-> 음료 속에 흩어진 기포 다수를
 *  연속 보간하고, `open`(0~1)으로 뚜껑 닫힘 <-> 열림(+뚜껑 위 미세 팝 스파크)을 표현한다.
 *  `Giraffe`의 `drink` 0~1 연속보간 설계를 참고해 하나의 컴포넌트로 general-ep05 의 s1(개봉
 *  임팩트)·s2(압력 비교 옆 아이콘)·s3(기포 확산)·s4(동시 분출) 네 장면을 전부 커버한다
 *  (REGISTRY 규칙 1 - 장면마다 별도 파티클 시스템을 새로 만들지 않는다).
 *
 *  viewBox 300x400, 화면 픽셀과 1:1. 캔을 쥐는 지점(CAN_GRIP)은 하단 좌측 벽 부근에 고정해뒀다 -
 *  `IceCream.tsx`의 `ICE_GRIP`과 같은 목적(손 위치에 이 점을 맞추고 이 점을 축으로 회전시키면
 *  각도를 바꿔도 손에서 캔이 미끄러지지 않는다).
 *
 *  화면 전체를 덮는 "확 뿜어져 나오는" 큰 임팩트는 이 컴포넌트가 맡지 않는다. 그건 화면 전체
 *  연출이라 씬 쪽에서 `scenes/Effects.tsx`의 `FlashOverlay`/`Sparkles`를 별도로 얹는다
 *  (02-script-v2.md 자산 목록에 이미 그렇게 정리되어 있다). 이 컴포넌트는 캔 몸체 자체 -
 *  기포 분포, 뚜껑/탭, 뚜껑 바로 위의 작은 팝 스파크만 그린다.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** 부드러운 0~1 등장/소멸 곡선 (시작·끝이 뚝뚝 끊기지 않게) */
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

export interface SodaCanProps {
  /** 화면상 폭(px). 비율 유지, viewBox 는 화면 픽셀과 1:1 (300x400) */
  width: number;
  /** 0 = 벽에 기포 소수 고정, 1 = 음료 속에 기포 다수 흩어짐 */
  shaken?: number;
  /** 0 = 뚜껑 닫힘, 1 = 뚜껑 열림(탭이 들리고 뚜껑 위에 작은 팝 스파크) */
  open?: number;
  /** 캔 몸체 채움색 (기본 gold) */
  fill?: string;
  /** 뚜껑 채움색 (기본 hill - 팔레트에 은색이 없어 채도 낮은 톤으로 대체) */
  lidColor?: string;
  /** 기포 채움색 (기본 paper - 캔 색과 대비) */
  bubbleColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/** 캔을 쥐는 지점 (viewBox 좌표) */
export const CAN_GRIP = { x: 108, y: 300 };

/** 벽에 붙어 있는 "몇 개"(6개) - 흔들리기 전 위치 */
const WALL_PTS: [number, number][] = [
  [100, 130], [200, 140], [97, 210], [203, 215], [100, 300], [200, 305],
];
/** 위 6개가 흔들리며 옮겨가는 음료 속 위치 (같은 인덱스끼리 대응) */
const SCATTER_PTS: [number, number][] = [
  [135, 150], [170, 170], [115, 230], [185, 245], [140, 310], [165, 290],
];
/** 흔들릴수록 "다수"로 늘어난 걸 보여주는 추가 기포 - 흔들리기 전엔 안 보이다가 나타난다 */
const EXTRA_PTS: [number, number][] = [
  [150, 120], [120, 170], [180, 190], [150, 230],
  [112, 270], [188, 280], [150, 320], [135, 250],
];

export const SodaCan: React.FC<SodaCanProps> = ({
  width, shaken = 0, open = 0,
  fill = C.gold, lidColor = C.hill, bubbleColor = C.paper,
  stroke = C.ink, strokeWidth = SW, style,
}) => {
  const sh = clamp01(shaken);
  const op = clamp01(open);
  const tabAngle = -46 * smooth(op);
  const holeOpacity = smooth((op - 0.35) / 0.5);
  const popSpark = clamp01((op - 0.72) / 0.28);

  return (
    <svg viewBox="0 0 300 400" width={width} style={style} shapeRendering="geometricPrecision">
      {/* 몸체 */}
      <rect
        x={76} y={80} width={148} height={280} rx={30}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      />
      {/* 라벨 띠 (밋밋하지 않게 살짝 대비) */}
      <rect x={76} y={190} width={148} height={64} fill={C.paper} opacity={0.22} />

      {/* 기포 - 6개는 벽 <-> 음료 속으로 이동, 8개는 흔들릴수록 늘어난다 */}
      <g stroke={stroke} strokeWidth={SW_THIN * 0.5} opacity={0.9}>
        {WALL_PTS.map(([wx, wy], i) => {
          const [sx, sy] = SCATTER_PTS[i];
          const x = lerp(wx, sx, sh);
          const y = lerp(wy, sy, sh);
          const r = lerp(6, 9, sh);
          return <circle key={`w${i}`} cx={x} cy={y} r={r} fill={bubbleColor} />;
        })}
        {EXTRA_PTS.map(([ex, ey], i) => {
          const a = smooth((sh - 0.28 - i * 0.02) / 0.55);
          if (a <= 0.02) return null;
          const y = ey - (1 - a) * 14; // 떠오르며 나타난다
          return <circle key={`e${i}`} cx={ex} cy={y} r={7} fill={bubbleColor} opacity={a} />;
        })}
      </g>

      {/* 뚜껑 */}
      <ellipse cx={150} cy={80} rx={74} ry={18} fill={lidColor} stroke={stroke} strokeWidth={strokeWidth} />
      {/* 열린 틈 (팝 순간 이후) */}
      {holeOpacity > 0.02 ? (
        <ellipse cx={138} cy={80} rx={16} ry={7} fill={stroke} opacity={holeOpacity * 0.85} />
      ) : null}
      {/* 탭 - 뚜껑이 열리며 들린다 */}
      <g transform={`rotate(${tabAngle} 150 80)`}>
        <ellipse cx={150} cy={74} rx={18} ry={8} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
        <circle cx={168} cy={80} r={5} fill={stroke} />
      </g>

      {/* 팝 순간 뚜껑 바로 위 미세 스파크 (화면 전체 Sparkles 는 씬에서 별도로 얹는다) */}
      {popSpark > 0.02 ? (
        <g stroke={C.coral} strokeWidth={SW_THIN} strokeLinecap="round" opacity={popSpark}>
          {[[-1, -1], [1, -1.3], [0, -1.6], [-0.6, -1.4], [0.7, -1]].map(([dx, dy], i) => (
            <line
              key={i}
              x1={140 + dx * 6} y1={70 + dy * 6}
              x2={140 + dx * (18 + popSpark * 20)} y2={70 + dy * (18 + popSpark * 20)}
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

export default SodaCan;
