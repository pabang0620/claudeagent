/** 컵(유리잔) 소품 - 물/얼음의 부피·온도 비교에 재사용하는 범용 컨테이너.
 *
 *  `SodaCan.tsx`와 같은 원칙(장면마다 새 컴포넌트를 만들지 않고 하나로 여러 장면을 커버)을
 *  따른다. 몸체는 곧은 원통형 유리잔(SodaCan처럼 taper 없는 rounded-rect)이라 clipPath 없이
 *  liquid 채움 높이를 rect 하나로 정확히 계산할 수 있다(여러 인스턴스를 한 화면에 동시에 놓아도
 *  clipPath id 충돌이 생기지 않는다 - general-ep17에서 s4/s5/s8이 컵 2개를 나란히 쓴다).
 *
 *  general-ep17("얼음이 물 위에 뜨는 이유")
 *    s1: mode='liquid' + floatCube 0->1(얼음이 위에서 떨어져 수면에 뜸)
 *    s4/s5: 두 컵을 나란히 - 왼쪽 mode='liquid'(물, liquidLevel 낮음) / 오른쪽 mode='ice'
 *           (같은 무게의 얼음, liquidLevel 높음 - "부피가 더 크다"를 수위선 차이로 보여줌)
 *    s8: 두 컵을 나란히 - temp='hot'/'cold'(물의 온도 대비, 음펨바 속설)
 *  "물/음료를 담는 컵" 소재 전반(다른 화의 액체 비교·온도 비교) 재사용 가능.
 */
import React from 'react';
import { C, SW, SW_THIN } from '../theme';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** viewBox: 위쪽에 200px 여유를 둬서(0..620) 얼음이 컵 위에서 떨어지는 시작 위치가
 *  화면(뷰박스) 밖으로 잘리지 않게 한다 - svg 는 overflow 가 기본 hidden 취급될 수 있어
 *  좌표를 음수로 잡지 않고 뷰박스 자체를 넉넉히 잡는 방식을 쓴다. */
const VB_W = 300;
const VB_H = 620;
const CUP_X = 62;
const CUP_TOP = 230;
const CUP_W = 176;
const CUP_H = 340;
const CUP_BOTTOM = CUP_TOP + CUP_H; // 570
const CUP_RX = 22;
/** 액체가 실제로 채워지는 안쪽 영역(테두리 안쪽으로 살짝 인셋) */
const FILL_INSET = 11;
const FILL_X = CUP_X + FILL_INSET;
const FILL_W = CUP_W - FILL_INSET * 2;
const FILL_MAX_H = CUP_H - FILL_INSET - 14; // 바닥 여유 14px

export interface IceFloatCupProps {
  /** 화면상 폭(px). viewBox(300x620)와 같은 비율로 스케일 */
  width: number;
  x: number;
  y: number;
  /** 0~1. 액체(or 고체 얼음)가 컵 안에서 차지하는 높이 비율 */
  liquidLevel: number;
  /** 'liquid' = 물(청색 액체) / 'ice' = 같은 자리를 채운 고체 얼음(더 창백한 색 + 결 무늬) */
  mode?: 'liquid' | 'ice';
  /** 0~1. 0=컵 위에서 아직 안 보임, 1=수면에 뜬 채로 안착. undefined면 얼음 큐브를 안 그림 */
  floatCube?: number;
  /** 온도 뉘앙스. 'hot'이면 붉은 색조 + 김, 'cold'면 파란 색조(기본) */
  temp?: 'hot' | 'cold' | 'neutral';
  /** 김이 살랑거리는 데만 쓰는 프레임(옵션, temp='hot'일 때만 의미 있음) */
  f?: number;
  liquidColor?: string;
  iceColor?: string;
  cupFill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** 0~1. undefined(기본)면 안 그림. 뜬 얼음 큐브 가운데에 뿌연 반투명 원을 겹쳐
   *  "가운데만 뿌옇다"를 보여준다(general-ep83, 집 얼음의 뿌연 중심 - IceCloudinessDiagram과
   *  같은 서사를 컵 위에 뜬 완성된 얼음 큐브에 얹는 용도). 기존 화(ep17 등)는 이 prop을 넘기지
   *  않으므로 동작에 영향 없다(REGISTRY 규칙 6, 기존 기본값 유지) */
  cloudyCenter?: number;
  style?: React.CSSProperties;
}

const STEAM_WISPS = [
  { dx: -34, delay: 0, h: 70 },
  { dx: 6, delay: 9, h: 92 },
  { dx: 40, delay: 4, h: 62 },
];

export const IceFloatCup: React.FC<IceFloatCupProps> = ({
  width, x, y, liquidLevel, mode = 'liquid', floatCube, temp = 'cold', f = 0,
  liquidColor, iceColor = '#EAF6FB', cupFill = 'rgba(255,255,255,0.35)',
  stroke = C.ink, strokeWidth = SW, cloudyCenter, style,
}) => {
  const scale = width / VB_W;
  const lvl = clamp01(liquidLevel);
  const fillColor = mode === 'ice' ? iceColor : (liquidColor ?? (temp === 'hot' ? '#F6C9B8' : C.waterCool));
  const fillH = lvl * FILL_MAX_H;
  const fillTopY = CUP_BOTTOM - FILL_INSET - fillH;
  const fillRx = Math.min(14, fillH / 2);

  // 얼음 큐브 낙하 -> 부양 애니메이션
  const cube = floatCube;
  const cubeSize = 78;
  const restY = fillTopY - cubeSize * 0.32; // 표면 위로 살짝 뜬 위치(가라앉지 않음을 시각화)
  const dropStartY = 24;
  let cubeY = 0;
  let cubeOpacity = 0;
  let splashOpacity = 0;
  if (cube !== undefined) {
    const fall = smooth(clamp01(cube / 0.72));
    cubeY = lerp(dropStartY, restY, fall);
    cubeOpacity = cube > 0.01 ? 1 : 0;
    const settle = clamp01((cube - 0.68) / 0.14);
    splashOpacity = settle > 0 && settle < 1 ? Math.sin(settle * Math.PI) : 0;
    const bob = cube >= 0.98 ? Math.sin(f / 14) * 3 : 0;
    cubeY += cube >= 0.98 ? bob : 0;
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={width * (VB_H / VB_W)}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 김 (온도='hot'일 때만) */}
      {temp === 'hot' ? (
        <g opacity={0.5} stroke={C.inkSoft} strokeWidth={SW_THIN * 0.6} fill="none" strokeLinecap="round">
          {STEAM_WISPS.map((s) => {
            const sway = Math.sin((f + s.delay) / 16) * 8;
            const x0 = CUP_X + CUP_W / 2 + s.dx;
            return (
              <path
                key={s.dx}
                d={`M ${x0} ${CUP_TOP} C ${x0 + sway} ${CUP_TOP - s.h * 0.4}, ${x0 - sway} ${CUP_TOP - s.h * 0.7}, ${x0 + sway * 0.5} ${CUP_TOP - s.h}`}
              />
            );
          })}
        </g>
      ) : null}

      {/* 컵 몸체(테두리) - 채움보다 먼저 그려 안쪽 배경 역할 */}
      <rect
        x={CUP_X} y={CUP_TOP} width={CUP_W} height={CUP_H} rx={CUP_RX}
        fill={cupFill} stroke="none"
      />

      {/* 채움(액체 or 고체 얼음) */}
      {fillH > 1 ? (
        <>
          <rect
            x={FILL_X} y={fillTopY} width={FILL_W} height={CUP_BOTTOM - FILL_INSET - fillTopY}
            rx={fillRx} fill={fillColor}
          />
          {/* 수면선 - 아주 완만한 물결 */}
          <path
            d={`M ${FILL_X} ${fillTopY} Q ${FILL_X + FILL_W * 0.5} ${fillTopY - 6} ${FILL_X + FILL_W} ${fillTopY}`}
            fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.45} opacity={0.5}
          />
          {mode === 'ice' ? (
            // 얼음 결 무늬 - 옅은 대각선 몇 가닥으로 "고체"임을 표시
            <g stroke="rgba(255,255,255,0.9)" strokeWidth={SW_THIN * 0.5} opacity={0.8}>
              {[0.2, 0.45, 0.7].map((r) => (
                <line
                  key={r}
                  x1={FILL_X + FILL_W * r} y1={Math.max(fillTopY + 6, CUP_BOTTOM - FILL_INSET - 18)}
                  x2={FILL_X + FILL_W * Math.min(1, r + 0.18)} y2={fillTopY + 10}
                />
              ))}
            </g>
          ) : null}
        </>
      ) : null}

      {/* 컵 테두리(윤곽선) - 채움 위에 그려 컵 벽이 액체를 가리는 느낌 유지 */}
      <rect
        x={CUP_X} y={CUP_TOP} width={CUP_W} height={CUP_H} rx={CUP_RX}
        fill="none" stroke={stroke} strokeWidth={strokeWidth}
      />
      {/* 입구 타원(유리잔 두께감) */}
      <ellipse
        cx={CUP_X + CUP_W / 2} cy={CUP_TOP} rx={CUP_W / 2} ry={10}
        fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.7} opacity={0.7}
      />

      {/* 튀는 물방울(안착 순간) */}
      {splashOpacity > 0.02 ? (
        <g stroke={stroke} strokeWidth={SW_THIN} strokeLinecap="round" opacity={splashOpacity}>
          {[[-1, -1.2], [1, -1.3], [0, -1.6], [-0.6, -1.4], [0.7, -1]].map(([dx, dy], i) => (
            <line
              key={i}
              x1={CUP_X + CUP_W / 2 + dx * 8} y1={fillTopY + dy * 6}
              x2={CUP_X + CUP_W / 2 + dx * 22} y2={fillTopY + dy * 20}
            />
          ))}
        </g>
      ) : null}

      {/* 뜬 얼음 큐브 */}
      {cube !== undefined && cubeOpacity > 0.01 ? (
        <g transform={`translate(${CUP_X + CUP_W / 2 - cubeSize / 2} ${cubeY})`}>
          <rect
            width={cubeSize} height={cubeSize} rx={12}
            fill={iceColor} stroke={stroke} strokeWidth={strokeWidth * 0.75}
          />
          <line
            x1={cubeSize * 0.22} y1={cubeSize * 0.22} x2={cubeSize * 0.6} y2={cubeSize * 0.6}
            stroke="rgba(255,255,255,0.9)" strokeWidth={SW_THIN * 0.5}
          />
          {/* 가운데 뿌연 중심(general-ep83) - 반투명 원 2개를 겹쳐 "뿌옇다"를 표현
           *  (점 무리 대신 큰 원, 채널 원칙) */}
          {cloudyCenter !== undefined && cloudyCenter > 0.01 ? (
            <g opacity={clamp01(cloudyCenter) * 0.8}>
              <circle cx={cubeSize * 0.5} cy={cubeSize * 0.52} r={cubeSize * 0.24} fill="#FFFFFF" />
              <circle cx={cubeSize * 0.58} cy={cubeSize * 0.46} r={cubeSize * 0.16} fill="#FFFFFF" />
            </g>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
};

export default IceFloatCup;
