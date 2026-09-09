/** "재질 블록" 소품 - 유리/벽 재질을 단순한 사각 블록으로 비교한다(똑같이 딱딱한데 유리만
 *  투명한 이유, general-ep64). 원자 배열을 사실적인 격자로 그리지 않는다(오케스트레이터
 *  지시 - "점 여러 개를 촘촘히 뿌리면 징그러워 보일 수 있으니, 큰 도형 몇 개로 배열의
 *  규칙성/불규칙성 차이만 보여준다"). 대신 블록 표면의 재질감만으로 차이를 암시한다.
 *
 *  glass: 옅은 청록 반투명 채움(opacity 낮음) + 대각선 하이라이트 띠 + 가장자리 얇은
 *  하이라이트 선 - 뒤에 놓인 배경(PlainBg 등)이 그대로 비쳐 보인다.
 *  wall: 불투명한 따뜻한 색(나무 질감 암시 - 가로 이음선 3개) - 뒤 배경을 완전히 가린다.
 *
 *  roughSurface(0~1, glass 전용, s8 "젖빛 유리"): 표면이 거칠어질수록 흰 안개 오버레이가
 *  짙어지고 옅은 물결선 3개가 나타나 "뒤가 뿌옇게 흐려진다"를 표현한다. wall에는 영향 없다.
 *  Math.random 미사용 - roughSurface(호출 씬이 계산해 넘기는 순수 progress)만으로 결정된다.
 *
 *  "재질에 따라 빛을 통과시키거나 막는 블록 자체"를 그리는 소품이 REGISTRY에 없어 신설했다
 *  (02-script-v1.md 자산 목록). 다른 "재질 비교" 소재(플라스틱 종류 비교 등)에도 재사용
 *  가능성이 있어 에피소드 로컬이 아니라 라이브러리에 등록한다.
 */
import React from 'react';
import { C, SW } from '../theme';

export interface TransparencyBlockProps {
  width: number;
  height: number;
  x: number;
  y: number;
  type: 'glass' | 'wall';
  /** 0~1(glass 전용): 표면이 거칠어져 뿌옇게 흐려지는 정도(젖빛 유리, s8). wall에는 영향 없음 */
  roughSurface?: number;
  stroke?: string;
  style?: React.CSSProperties;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const TransparencyBlock: React.FC<TransparencyBlockProps> = ({
  width, height, x, y, type, roughSurface = 0, stroke = C.ink, style,
}) => {
  const r = clamp01(roughSurface);
  const radius = 20;

  return (
    <svg
      width={width} height={height}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {type === 'glass' ? (
        <>
          <rect
            x={0} y={0} width={width} height={height} rx={radius}
            fill={C.water} opacity={0.24} stroke={stroke} strokeWidth={SW}
          />
          {/* 유리 하이라이트: 왼쪽 위에서 대각선으로 스치는 밝은 띠 */}
          <polygon
            points={`${width * 0.08},${height * 0.06} ${width * 0.24},${height * 0.06} ${width * 0.08},${height * 0.42} ${width * -0.02},${height * 0.42}`}
            fill="#FFFFFF" opacity={0.35}
          />
          <line
            x1={width * 0.04} y1={4} x2={width * 0.04} y2={height - 4}
            stroke="#FFFFFF" strokeWidth={6} opacity={0.4} strokeLinecap="round"
          />
          <line
            x1={4} y1={height * 0.03} x2={width - 4} y2={height * 0.03}
            stroke="#FFFFFF" strokeWidth={6} opacity={0.4} strokeLinecap="round"
          />
          {r > 0.02 ? (
            <>
              <rect x={0} y={0} width={width} height={height} rx={radius} fill="#FFFFFF" opacity={r * 0.72} />
              {[0.32, 0.55, 0.78].map((fy, i) => (
                <path
                  key={i}
                  d={`M 0 ${height * fy} Q ${width * 0.25} ${height * fy - 22} ${width * 0.5} ${height * fy} T ${width} ${height * fy}`}
                  fill="none" stroke="#FFFFFF" strokeWidth={9} opacity={r * 0.55} strokeLinecap="round"
                />
              ))}
            </>
          ) : null}
        </>
      ) : (
        <>
          <rect
            x={0} y={0} width={width} height={height} rx={radius}
            fill={C.browning} stroke={stroke} strokeWidth={SW}
          />
          {[0.28, 0.56, 0.84].map((fy, i) => (
            <line
              key={i}
              x1={10} y1={height * fy} x2={width - 10} y2={height * fy}
              stroke={stroke} strokeWidth={5} opacity={0.3} strokeLinecap="round"
            />
          ))}
        </>
      )}
    </svg>
  );
};

export default TransparencyBlock;
