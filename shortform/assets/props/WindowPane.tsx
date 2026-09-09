/** 유리창 소품. 실내(따뜻함)/실외(차가움) 경계에서 김이 서리고 물방울이 맺히는 과정을 보여준다
 *  (겨울에 유리창에 김 서리는 이유, general-ep53). REGISTRY 3절 확인 완료 - IceFloatCup·SodaCan
 *  같은 컵/캔류에는 "면 전체에 김이 번지는" 창문 표현이 없어 새로 만든다. Bathtub.tsx의 김
 *  기법(고정 배열 + Math.sin 살랑거림)을 계승했다.
 *
 *  기본(window) 모드: 창틀 안 유리 1장 뒤로 단순한 실외 실루엣(하늘 + 언덕 곡선 하나뿐,
 *  건물·나무 등 세부 묘사 없음)이 비치고, `fogProgress`(0~1)에 따라 유리 아래쪽부터 김이 위로
 *  번진다(HiccupDiagram과 같은 원칙 - "지금 이 순간의 상태"만 그리고 시간 곡선은 호출 씬이
 *  만든다). 김은 옅은 흰 면 + 큰 물결선 2~3가닥으로만 그려 "작은 점을 잔뜩 뿌리는" 표현을
 *  피한다(오케스트레이터 지시). `contactProgress`(0~1)는 실내 공기가 유리에 닿는 자리만 온도가
 *  뚝 떨어지는 것을 보여주는 국소 냉각 발광(옅은 청색 patch)이다 - "닿는 자리만 급격히 식는다"는
 *  구조를 갖는 다른 냉각 접촉면 소재 전반 재사용 가능.
 *
 *  crossSection 모드: 같은 viewBox를 좌(실외, 차가움)/우(실내, 따뜻함)로 분할해 색 대비로
 *  보여주고, 그 경계(유리)의 실내 쪽 면에만 김 패치가 맺힌다 - "바깥이 워낙 추워서 유리창
 *  안쪽 면이 실내 공기보다 훨씬 빨리 식는다"는 s6 전용 구도. `fogProgress`를 그대로 공유해서
 *  호출 씬이 prop을 따로 만들 필요가 없다.
 *
 *  `CondensationDroplets`는 유리뿐 아니라 IceFloatCup 같은 다른 차가운 용기 위에도 그대로
 *  얹어 "차가운 표면에 물방울이 맺히는" 소재 전반(음료 컵 결로 등, s7 실사용례) 재사용할 수
 *  있게 별도로 export한다. 물방울은 큰 tabler droplet 아이콘 3~4개 고정 배치로만 그려
 *  "작은 점을 잔뜩 뿌리지 않는다"는 오케스트레이터 지시를 지킨다.
 */
import React from 'react';
import { C, FONT, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

export const WINDOW_VB_W = 520;
export const WINDOW_VB_H = 700;

const FRAME_X = 10;
const FRAME_Y = 10;
const FRAME_W = WINDOW_VB_W - 20;
const FRAME_H = WINDOW_VB_H - 20;
const FRAME_RX = 22;
const GLASS_PAD = 34;
const GLASS_X = FRAME_X + GLASS_PAD;
const GLASS_Y = FRAME_Y + GLASS_PAD;
const GLASS_W = FRAME_W - GLASS_PAD * 2;
const GLASS_H = FRAME_H - GLASS_PAD * 2;

/** 크로스섹션 모드 레이아웃 (같은 viewBox 를 좌/우로 나눈다) */
const XS_OUTDOOR_W = WINDOW_VB_W * 0.42;
const XS_GLASS_W = WINDOW_VB_W * 0.1;
const XS_GLASS_X = XS_OUTDOOR_W;
const XS_INDOOR_X = XS_GLASS_X + XS_GLASS_W;

/** 김 물결선 위치(고정, Math.random 미사용 - 원칙 3) */
const FOG_WISPS = [
  { dx: -0.28, delay: 0, hFrac: 0.16 },
  { dx: 0.02, delay: 10, hFrac: 0.2 },
  { dx: 0.3, delay: 5, hFrac: 0.14 },
];

export interface WindowPaneProps {
  /** 씬 로컬 프레임. 김 물결선의 살랑거림에만 쓴다(옵션, 기본 0 = 정지) */
  f?: number;
  /** 화면상 폭(px). viewBox(520x700)와 같은 비율로 스케일 */
  width: number;
  x?: number;
  y?: number;
  /** true 면 실외(왼쪽,차가움)/실내(오른쪽,따뜻함) 단면 구도로 그린다 */
  crossSection?: boolean;
  /** 0~1. 유리 아래쪽부터(window 모드) 또는 실내쪽 접촉면(crossSection 모드) 김이 번지는 정도 */
  fogProgress?: number;
  /** 0~1. 유리 위에 큰 물방울 3~4개가 순서대로 맺히는 정도(window 모드 전용) */
  dropletProgress?: number;
  /** 0~1. 실내 공기가 유리에 닿는 자리만 온도가 뚝 떨어지는 국소 냉각 발광(window 모드 전용) */
  contactProgress?: number;
  /** crossSection 모드에서만 쓰는 좌/우 라벨 텍스트. 지정하지 않으면 라벨을 그리지 않는다 */
  outdoorLabel?: string;
  indoorLabel?: string;
  stroke?: string;
  frameColor?: string;
  glassColor?: string;
  outdoorSkyColor?: string;
  outdoorHillColor?: string;
  indoorColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const WindowPane: React.FC<WindowPaneProps> = ({
  f = 0, width, x = 0, y = 0, crossSection = false,
  fogProgress = 0, dropletProgress = 0, contactProgress = 0,
  outdoorLabel, indoorLabel,
  stroke = C.ink, frameColor = C.paper, glassColor = C.water,
  outdoorSkyColor = C.sky, outdoorHillColor = C.hill, indoorColor = C.room,
  strokeWidth = SW, style,
}) => {
  const scale = width / WINDOW_VB_W;
  const height = width * (WINDOW_VB_H / WINDOW_VB_W);
  const fog = clamp01(fogProgress);
  const drop = clamp01(dropletProgress);
  const contact = clamp01(contactProgress);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
      <svg
        viewBox={`0 0 ${WINDOW_VB_W} ${WINDOW_VB_H}`} width="100%" height="100%"
        style={{ overflow: 'visible' }} shapeRendering="geometricPrecision"
      >
        {!crossSection ? (
          <>
            {/* 창틀 */}
            <rect
              x={FRAME_X} y={FRAME_Y} width={FRAME_W} height={FRAME_H} rx={FRAME_RX}
              fill={frameColor} stroke={stroke} strokeWidth={strokeWidth}
            />
            {/* 유리 + 실외 실루엣(하늘 + 언덕 곡선 하나) */}
            <rect x={GLASS_X} y={GLASS_Y} width={GLASS_W} height={GLASS_H} fill={outdoorSkyColor} />
            <path
              d={`M ${GLASS_X} ${GLASS_Y + GLASS_H * 0.62} Q ${GLASS_X + GLASS_W * 0.5} ${GLASS_Y + GLASS_H * 0.44} ${GLASS_X + GLASS_W} ${GLASS_Y + GLASS_H * 0.6} L ${GLASS_X + GLASS_W} ${GLASS_Y + GLASS_H} L ${GLASS_X} ${GLASS_Y + GLASS_H} Z`}
              fill={outdoorHillColor}
            />
            <rect
              x={GLASS_X} y={GLASS_Y} width={GLASS_W} height={GLASS_H}
              fill={glassColor} opacity={0.28} stroke={stroke} strokeWidth={strokeWidth * 0.6}
            />

            {/* 국소 냉각 발광: 실내 공기가 유리에 닿는 자리만 온도가 뚝 떨어짐 */}
            {contact > 0.01 ? (
              <ellipse
                cx={GLASS_X + GLASS_W / 2} cy={GLASS_Y + GLASS_H * 0.42}
                rx={GLASS_W * 0.34 * smooth(contact)} ry={GLASS_H * 0.22 * smooth(contact)}
                fill={C.waterCool} opacity={0.4 * contact}
              />
            ) : null}

            {/* 김: 아래쪽부터 위로 번짐. 실제 서리김은 유리를 거의 가릴 만큼 뿌옇기 때문에
                거의 불투명한 흰 면(fill 자체가 명암 대비를 만든다) + 경계선 + 큰 물결선
                2~3가닥(흰 면과 구분되는 톤)으로 그린다 - 옅은 반투명만으로는 밝은 하늘색
                배경과 거의 구분되지 않는 문제가 있어(general-ep53 스틸 선점검 실측) 불투명도를
                크게 올리고 물결선 색을 흰 면과 대비되는 톤(C.water)으로 바꿨다 */}
            {fog > 0.01 ? (
              <>
                <rect
                  x={GLASS_X} y={GLASS_Y + GLASS_H * (1 - 0.74 * fog)}
                  width={GLASS_W} height={GLASS_H * 0.74 * fog + 6}
                  fill={C.paper} opacity={Math.min(0.95, fog * 1.15)}
                  stroke={C.inkSoft} strokeWidth={SW_THIN * 0.8}
                />
                <g
                  opacity={Math.min(0.85, fog * 1.1)} stroke={C.water} strokeWidth={SW_THIN * 1.3} fill="none"
                  strokeLinecap="round"
                >
                  {FOG_WISPS.map((wsp) => {
                    const sway = Math.sin((f + wsp.delay) / 20) * 10;
                    const wx = GLASS_X + GLASS_W / 2 + wsp.dx * GLASS_W;
                    const wy = GLASS_Y + GLASS_H * (1 - 0.74 * fog) + GLASS_H * wsp.hFrac * 0.55;
                    const wh = GLASS_H * wsp.hFrac;
                    return (
                      <path
                        key={wsp.dx}
                        d={`M ${wx - GLASS_W * 0.16} ${wy + wh} Q ${wx + sway} ${wy}, ${wx + GLASS_W * 0.16} ${wy + wh}`}
                      />
                    );
                  })}
                </g>
              </>
            ) : null}

            {/* 창틀 십자 살(mullion) */}
            <rect
              x={GLASS_X + GLASS_W / 2 - 8} y={GLASS_Y} width={16} height={GLASS_H}
              fill={frameColor} stroke={stroke} strokeWidth={strokeWidth * 0.7}
            />
            <rect
              x={GLASS_X} y={GLASS_Y + GLASS_H / 2 - 8} width={GLASS_W} height={16}
              fill={frameColor} stroke={stroke} strokeWidth={strokeWidth * 0.7}
            />

            {drop > 0.01 ? (
              <CondensationDropletsSvg
                x={GLASS_X} y={GLASS_Y} width={GLASS_W} height={GLASS_H} dropletProgress={drop}
              />
            ) : null}
          </>
        ) : (
          <>
            {/* 실외(왼쪽, 차가움) */}
            <rect x={0} y={0} width={XS_OUTDOOR_W} height={WINDOW_VB_H} fill={C.water} />
            <rect x={0} y={0} width={XS_OUTDOOR_W} height={WINDOW_VB_H} fill={C.waterCool} opacity={0.32} />
            <g transform={`translate(${XS_OUTDOOR_W * 0.28} ${WINDOW_VB_H * 0.16})`}>
              <ThemedIcon name="snowflake" size={54} color={C.paper} strokePx={7} />
            </g>
            <g transform={`translate(${XS_OUTDOOR_W * 0.5} ${WINDOW_VB_H * 0.68})`}>
              <ThemedIcon name="snowflake" size={40} color={C.paper} strokePx={7} />
            </g>

            {/* 유리 */}
            <rect
              x={XS_GLASS_X} y={0} width={XS_GLASS_W} height={WINDOW_VB_H}
              fill={glassColor} stroke={stroke} strokeWidth={strokeWidth}
            />

            {/* 실내(오른쪽, 따뜻함) */}
            <rect x={XS_INDOOR_X} y={0} width={WINDOW_VB_W - XS_INDOOR_X} height={WINDOW_VB_H} fill={indoorColor} />

            {/* 김: 유리의 실내 쪽 면, 접촉 지점에만 패치로 맺힌다. 유리 경계선(x=XS_INDOOR_X)에
                왼쪽 변이 flush하게 붙고 오른쪽 변은 물결(2단 굴곡)로 번지는 세로로 긴 패치다.
                처음엔 원(ellipse)을 유리에서 띄워 그렸다가 유리와 무관한 얼룩처럼 보였고,
                다음엔 반원 bulge로 바꿨다가 문손잡이처럼 보이는 결함이 스틸 선점검에서 각각
                나와(general-ep53) 세로로 긴 물결 패치로 다시 바꿨다. window 모드와 같은 이유로
                거의 불투명한 흰 면 + 경계선 + 대비되는 톤의 물결선을 쓴다 */}
            {fog > 0.01 ? (
              <>
                <path
                  d={`M ${XS_INDOOR_X} ${WINDOW_VB_H * 0.5 - 150 * smooth(fog)} `
                    + `L ${XS_INDOOR_X} ${WINDOW_VB_H * 0.5 + 150 * smooth(fog)} `
                    + `Q ${XS_INDOOR_X + 66 * smooth(fog)} ${WINDOW_VB_H * 0.5 + 75 * smooth(fog)}, `
                    + `${XS_INDOOR_X + 46 * smooth(fog)} ${WINDOW_VB_H * 0.5} `
                    + `Q ${XS_INDOOR_X + 66 * smooth(fog)} ${WINDOW_VB_H * 0.5 - 75 * smooth(fog)}, `
                    + `${XS_INDOOR_X} ${WINDOW_VB_H * 0.5 - 150 * smooth(fog)} Z`}
                  fill={C.paper} opacity={Math.min(0.92, fog * 1.15)}
                  stroke={C.inkSoft} strokeWidth={SW_THIN * 0.7}
                />
                <path
                  d={`M ${XS_INDOOR_X + 6} ${WINDOW_VB_H * 0.5 - 96 * smooth(fog)} Q ${XS_INDOOR_X + 26 * smooth(fog) + Math.sin(f / 20) * 5} ${WINDOW_VB_H * 0.5 - 40 * smooth(fog)}, ${XS_INDOOR_X + 6} ${WINDOW_VB_H * 0.5 + 12 * smooth(fog)}`}
                  fill="none" stroke={C.water} strokeWidth={SW_THIN * 1.1} opacity={Math.min(0.85, fog * 1.1)}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${XS_INDOOR_X + 6} ${WINDOW_VB_H * 0.5 + 30 * smooth(fog)} Q ${XS_INDOOR_X + 26 * smooth(fog) + Math.sin((f + 12) / 20) * 5} ${WINDOW_VB_H * 0.5 + 86 * smooth(fog)}, ${XS_INDOOR_X + 6} ${WINDOW_VB_H * 0.5 + 138 * smooth(fog)}`}
                  fill="none" stroke={C.water} strokeWidth={SW_THIN * 1.1} opacity={Math.min(0.85, fog * 1.1)}
                  strokeLinecap="round"
                />
              </>
            ) : null}

            {outdoorLabel ? (
              <XsLabel x={XS_OUTDOOR_W / 2} text={outdoorLabel} color={C.ink} />
            ) : null}
            {indoorLabel ? (
              <XsLabel x={XS_INDOOR_X + (WINDOW_VB_W - XS_INDOOR_X) / 2} text={indoorLabel} color={C.ink} />
            ) : null}
          </>
        )}
      </svg>
    </div>
  );
};

const XsLabel: React.FC<{ x: number; text: string; color: string }> = ({ x, text, color }) => (
  <g>
    <rect x={x - 68} y={26} width={136} height={54} rx={27} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} />
    <text
      x={x} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={700}
      fontSize={30} fill={color}
    >
      {text}
    </text>
  </g>
);

/** 큰 물방울 3~4개 고정 배치(상대 좌표). Math.random 미사용(원칙 3) */
const DROPLET_SPOTS = [
  { fx: 0.26, fy: 0.4, sizeFrac: 0.2, delay: 0 },
  { fx: 0.6, fy: 0.28, sizeFrac: 0.16, delay: 0.16 },
  { fx: 0.36, fy: 0.62, sizeFrac: 0.24, delay: 0.34 },
  { fx: 0.76, fy: 0.56, sizeFrac: 0.17, delay: 0.5 },
];

export interface CondensationDropletsProps {
  /** 물방울이 맺히는 표면의 화면 x(왼쪽 위) */
  x: number;
  y: number;
  /** 표면의 화면 폭/높이 */
  width: number;
  height: number;
  /** 0~1. 물방울이 순서대로 맺히는 정도 */
  dropletProgress: number;
  color?: string;
  style?: React.CSSProperties;
}

/** IceFloatCup 등 다른 소품 위에 얹는 절대좌표 오버레이 버전 (svg 밖에서 쓸 때) */
export const CondensationDroplets: React.FC<CondensationDropletsProps> = ({
  x, y, width, height, dropletProgress, color, style,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width, height, overflow: 'visible', ...style }}>
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <CondensationDropletsSvg
        x={0} y={0} width={width} height={height} dropletProgress={dropletProgress} color={color}
      />
    </svg>
  </div>
);

/** WindowPane 내부의 <svg> 안에 직접 그릴 때 쓰는 <g> 버전(중첩 <svg> position:absolute 금지
 *  원칙 - "21화 이후 실제로 반복된 결함" A절 - 을 지키려고 별도로 뒀다) */
const CondensationDropletsSvg: React.FC<CondensationDropletsProps> = ({
  x, y, width, height, dropletProgress, color = C.waterCool,
}) => {
  const p = clamp01(dropletProgress);
  return (
    <g>
      {DROPLET_SPOTS.map((d) => {
        const local = smooth((p - d.delay) / (1 - d.delay));
        if (local <= 0.01) return null;
        const size = width * d.sizeFrac * (0.4 + 0.6 * local);
        const cx = x + d.fx * width;
        const cy = y + d.fy * height;
        return (
          <g key={`${d.fx}-${d.fy}`} transform={`translate(${cx - size / 2} ${cy - size / 2})`} opacity={local}>
            <ThemedIcon name="droplet" size={size} color={color} strokePx={9} />
          </g>
        );
      })}
    </g>
  );
};

export default WindowPane;
