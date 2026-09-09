/** 차창 소품. 창 프레임(둥근 사각 + 두꺼운 테두리)은 화면에 고정돼 있는데, 창 안쪽 풍경만
 *  옆으로 빠르게(또는 느리게) 스쳐 지나가는 모습을 보여준다("차 안은 가만히 있는데 창밖은
 *  움직인다"는 이 화(멀미)의 핵심 대비를 s1에서 무성으로 보여주기 위해 신설).
 *
 *  풍경은 실제 나무·건물을 그리지 않고 추상적인 "속도선"(대각선 줄무늬, 하늘/땅 2색)으로만
 *  표현한다 - 점 무리·디테일 묘사 없이 굵은 선 몇 가닥으로 속도감만 전달하는 채널 관례를
 *  그대로 따른다. 줄무늬는 SVG <pattern>으로 구현하지 않는다 - patternTransform(가로 이동)과
 *  내부 rect 의 skewX(대각선) 를 같이 쓰면 변형된 도형이 타일(0~spacing) 밖으로 완전히
 *  밀려나 아무것도 안 보이는 결함이 실측으로 확인됐다(SVG pattern 은 타일 로컬 좌표 0~width
 *  범위 밖 콘텐츠를 그 타일에서 클리핑하고, 그 범위는 모든 반복 타일에서 동일해 결국
 *  어디에도 안 그려진다). 그래서 평행사변형(polygon) 여러 개를 매 프레임 JS 로 직접
 *  계산해 그린다(Math.random 미사용, frame 만의 결정적 함수) - 창 프레임의 둥근 모서리
 *  밖으로 새지 않도록 clipPath 를 씌운다.
 *
 *  "차 안(정지된 느낌)과 창밖 풍경(빠르게 움직임)의 대비"가 목적이므로, 이 소품은 창 자체의
 *  위치는 고정 prop(x/y/width/height)으로만 받고 흔들리지 않는다 - 흔들리는 건 안쪽 무늬뿐이다.
 *
 *  "자동차 실내·이동감을 보여줄 소품"이 REGISTRY에 없어 신설했다(02-script-v1.md 자산 목록).
 *  창문·이동수단을 통해 "안은 고정, 밖은 흐른다"를 보여줘야 하는 다른 소재(기차·비행기 창,
 *  트레드밀 등) 전반에도 재사용 가능성이 있어 등록 대상이다.
 */
import React from 'react';
import { C } from '../theme';

let uid = 0;

export interface CarWindowViewProps {
  /** 현재 프레임 (풍경 스크롤에 쓴다) */
  f: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
  /** 창밖 풍경이 흐르는 속도(픽셀/프레임). 0이면 완전히 멈춘 풍경(비교용) */
  speed?: number;
  /** 창틀 모서리 반경 */
  radius?: number;
  frameColor?: string;
  skyColor?: string;
  groundColor?: string;
  stripeColor?: string;
  style?: React.CSSProperties;
}

export const CarWindowView: React.FC<CarWindowViewProps> = ({
  f, width, height, x = 0, y = 0, speed = 14, radius = 28,
  frameColor = C.ink, skyColor = C.sky, groundColor = C.hill, stripeColor = C.waterCool, style,
}) => {
  const id = React.useMemo(() => `car-window-${uid++}`, []);
  const clipId = `${id}-clip`;

  const horizonY = height * 0.58;
  const spacing = 96;
  const stripeW = 30;
  const skew = height * 0.22; // 위->아래로 기울어지는 정도(대각선 느낌)
  const offset = ((f * speed) % spacing + spacing) % spacing;
  const frameW = 18;
  const stripeCount = Math.ceil((width + skew) / spacing) + 5;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id={clipId}>
            <rect x={frameW} y={frameW} width={width - frameW * 2} height={height - frameW * 2} rx={radius} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={0} width={width} height={horizonY} fill={skyColor} />
          <rect x={0} y={horizonY} width={width} height={height - horizonY} fill={groundColor} />
          {/* 속도선: 평행사변형 여러 개, offset 만큼 매 프레임 가로로 흘러간다 */}
          {Array.from({ length: stripeCount }).map((_, i) => {
            const xTop = -spacing * 2 + i * spacing + offset;
            const xBot = xTop + skew;
            return (
              <polygon
                key={i}
                points={`${xTop},0 ${xTop + stripeW},0 ${xBot + stripeW},${height} ${xBot},${height}`}
                fill={stripeColor}
                opacity={0.5}
              />
            );
          })}
          <line x1={0} y1={horizonY} x2={width} y2={horizonY} stroke={C.inkSoft} strokeWidth={4} opacity={0.35} />
        </g>

        {/* 창틀 - 화면에 완전히 고정 (풍경과 대비되는 정지 기준점) */}
        <rect
          x={frameW / 2} y={frameW / 2} width={width - frameW} height={height - frameW}
          rx={radius + frameW / 2} fill="none" stroke={frameColor} strokeWidth={frameW}
        />
      </svg>
    </div>
  );
};

export default CarWindowView;
