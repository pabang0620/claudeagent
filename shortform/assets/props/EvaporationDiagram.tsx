/** "액체 표면의 물 분자 일부가 100도로 끓지 않아도 조금씩 공기 중으로 날아가는데, 그
 *  바로 위 공기가 수증기로 꽉 차면 더 날아갈 자리가 없어 증발이 느려지고, 바람이 그
 *  공기를 계속 새 공기로 바꿔주고 햇빛이 분자에 에너지를 더해줘서 증발이 빨라진다"는
 *  인과를 보여주는 다이어그램(젖은 빨래가 마르는 이유, general-ep93).
 *
 *  REGISTRY 확인 완료 - 66화 FogLayerDiagram(공기 중 수증기가 식어 안개로 "응결"되는
 *  과정)과 53화 CondensationDroplets(차가운 표면에 수증기가 물방울로 "맺히는" 과정,
 *  ep53 scenes.tsx 로컬)은 둘 다 기체->액체 방향(결로)이라, 이 화가 다루는 액체->기체
 *  방향(증발)과 반대 구조다. 재사용할 수 없어 새로 만들었다. WetFabricLightDiagram(옷이
 *  젖으면 색이 진해지는 이유, 빛의 반사/흡수)도 "젖은 섬유" 소재이지만 다루는 물리가
 *  전혀 달라(빛의 산란/흡수 vs 증발) 재사용 대상이 아니다.
 *
 *  HeatBlanketDiagram·FogLayerDiagram과 같은 설계 원칙(독립 레이어, undefined/0이면 그
 *  레이어는 안 그려진다)을 따른다. 오케스트레이터 지시(이 화 시각 주의사항) 반영:
 *   - 물 분자는 큰 도형 딱 3개(표면에 머무는 "잔류 분자" 2개 + "탈출 분자" 1개)로만
 *     표현하고, 작은 점을 잔뜩 뿌리지 않는다. heatProgress가 높아져도 분자 개수를
 *     늘리지 않고 탈출 분자 하나의 주기(더 짧게)와 진폭(더 크게)만 키운다.
 *   - 옷 위 공기가 수증기로 꽉 차는 것(saturationProgress)과 바람이 새 공기로 바꿔주는
 *     것(windProgress)은 점을 그리지 않고 뿌연 면(haze)의 밀도(불투명도)·폭 변화로만
 *     대비시킨다.
 *   - 햇빛은 ThemedIcon "sun" 하나 + 굵은 화살(광선) 2~3가닥으로 단순하게 표현한다.
 *   - 빨랫줄에 걸린 옷 실루엣은 이 컴포넌트가 아니라 에피소드 로컬 소품(Clothesline,
 *     scenes.tsx)이 담당한다 - 이 다이어그램은 "표면 확대 단면"만 다룬다.
 *
 *  독립 레이어(전부 undefined/0이면 젖은 표면 + 잔류 분자 2개만 있는 정지 배경이 된다):
 *   - escapeProgress    : 0~1. 표면 위 "탈출 분자" 1개가 frame 기반으로 반복해서
 *     표면에서 튀어 올라 위로 갔다가 옅어지며 사라지는 루프 애니메이션이 서서히
 *     또렷해진다(값 자체가 그 루프의 최대 불투명도를 정하는 게이트). s3용.
 *   - saturationProgress: 0~1. 표면 바로 위 공기층에 뿌연 면(haze)이 왼쪽 끝부터 채워져
 *     0.6 불투명도까지 짙어진다 - "날아갈 자리가 없어짐". s4용.
 *   - windProgress      : 0~1. saturationProgress가 채운 뿌연 면을 왼쪽에서 오른쪽으로
 *     쓸어내며(밀어내며) 폭을 줄인다 - windProgress=1이면 공기층 전체가 다시 맑아진다.
 *     쓸려나가는 경계선 앞에 작은 화살(쐐기) 2개 + ThemedIcon "wind"(좌상단)가 함께
 *     나타나 바람 방향(왼쪽->오른쪽)을 보여준다. s5용.
 *   - heatProgress      : 0~1. 우상단에 ThemedIcon "sun" + 굵은 광선 화살 2가닥이
 *     나타나고, 탈출 분자의 애니메이션 주기가 짧아지고(더 자주) 상승 높이가 커지며
 *     (더 힘차게), 잔류 분자 2개의 흔들림 진폭도 함께 커진다("더 활발하게 움직임").
 *
 *  Math.random 미사용 - 전부 frame·progress(0~1)의 순수 함수라 결정적이다(원칙 3).
 *  "액체 표면에서 분자 일부가 기체로 빠져나가고, 그 위 공간의 포화도·환기·에너지 공급이
 *  그 속도에 영향을 준다"는 구조를 갖는 다른 소재(물웅덩이가 마름, 손 소독제 증발, 젖은
 *  머리카락이 마름 등) 전반 재사용 가능성이 있어 에피소드 로컬이 아니라 여기 등록한다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';
import { ThemedIcon } from './ThemedIcon';

export const EVAP_VB_W = 900;
export const EVAP_VB_H = 760;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

/* 표면(젖은 옷 단면) 기하 */
const AIR_LEFT = 40;
const AIR_RIGHT = 860;
const AIR_TOP = 90;
const SURF_Y = 560; // 공기층과 표면의 경계(대략)
const CLOTH_BOTTOM = 740;

const CLOTH_D = `M ${AIR_LEFT} ${SURF_Y + 12}
  Q ${(AIR_LEFT + 450) / 2} ${SURF_Y - 26} 450 ${SURF_Y - 4}
  Q ${(450 + AIR_RIGHT) / 2} ${SURF_Y + 18} ${AIR_RIGHT} ${SURF_Y - 6}
  L ${AIR_RIGHT} ${CLOTH_BOTTOM} L ${AIR_LEFT} ${CLOTH_BOTTOM} Z`;

/** 잔류 분자 2개의 고정 앵커(표면 바로 위) - Math.random 미사용, 고정 좌표 */
const RESIDENT_ANCHORS = [
  { x: 250, y: SURF_Y - 46, phase: 0, r: 34 },
  { x: 610, y: SURF_Y - 62, phase: 2.1, r: 38 },
];
/** 탈출 분자 시작점(표면 위, 두 잔류 분자 사이) */
const ESCAPE_ORIGIN = { x: 440, y: SURF_Y - 30 };

/** 물 분자 글리프 - 원 하나 + 작은 하이라이트 하나로만 구성(점 무리 금지 원칙) */
const MoleculeGlyph: React.FC<{ cx: number; cy: number; r: number; opacity: number; color: string }> = ({
  cx, cy, r, opacity, color,
}) => (
  opacity <= 0.01 ? null : (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke={C.ink} strokeWidth={SW_THIN} />
      <circle cx={cx - r * 0.32} cy={cy - r * 0.34} r={r * 0.26} fill="#FFFFFF" opacity={0.55} />
    </g>
  )
);

/** 바람 앞머리를 알리는 작은 쐐기(화살) 하나 */
const WindWedge: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  opacity <= 0.01 ? null : (
    <path
      d={`M ${x - 22} ${y - 16} L ${x + 14} ${y} L ${x - 22} ${y + 16}`}
      fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN} strokeLinecap="round" strokeLinejoin="round"
      opacity={opacity}
    />
  )
);

export interface EvaporationDiagramProps {
  width: number;
  x: number;
  y: number;
  /** 로컬 프레임 - 탈출 분자 루프·잔류 분자 흔들림에 쓴다. 없으면 정지(0). */
  frame?: number;
  escapeProgress?: number;
  saturationProgress?: number;
  windProgress?: number;
  heatProgress?: number;
  stroke?: string;
  clothColor?: string;
  hazeColor?: string;
  moleculeColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const EvaporationDiagram: React.FC<EvaporationDiagramProps> = ({
  width, x, y, frame = 0,
  escapeProgress = 0, saturationProgress = 0, windProgress = 0, heatProgress = 0,
  stroke = C.ink, clothColor = C.water, hazeColor = C.nightSoft, moleculeColor = C.waterCool,
  strokeWidth = SW, style,
}) => {
  const scale = width / EVAP_VB_W;
  const height = EVAP_VB_H * scale;
  const escP = clamp01(escapeProgress);
  const satP = clamp01(saturationProgress);
  const windP = clamp01(windProgress);
  const heatP = clamp01(heatProgress);

  /* 잔류 분자: 완만한 상하 흔들림, heatProgress가 높을수록 진폭·속도 증가 */
  const bobAmp = 5 + 9 * heatP;
  const bobSpeed = 42 - 14 * heatP;

  /* 탈출 분자: heatProgress가 높을수록 주기가 짧아지고(더 자주) 상승 높이가 커진다(더 힘차게) */
  const escPeriod = Math.round(lerp(96, 54, heatP));
  const escRise = lerp(300, 400, heatP);
  const escPhase = (frame % escPeriod) / escPeriod;
  const escT = smooth(escPhase);
  const escY = ESCAPE_ORIGIN.y - escRise * escT;
  const escX = ESCAPE_ORIGIN.x + 26 * Math.sin(escPhase * Math.PI);
  const escLocalFade = Math.sin(clamp01(escPhase) * Math.PI); // 표면에서 등장 -> 위로 갈수록 옅어짐
  const escOpacity = escP * escLocalFade;

  /* 공기층 haze: saturationProgress가 최대 밀도를, windProgress가 왼쪽부터 쓸어낸 폭을 정한다 */
  const hazeMaxOpacity = 0.6 * satP;
  const hazeX = lerp(AIR_LEFT, AIR_RIGHT, windP);
  const hazeWidth = Math.max(0, AIR_RIGHT - hazeX);

  /* haze 물결선 2가닥(점 텍스처 대신) - 바람에 쓸려나간 구간(x < hazeX)에서는 사라진다 */
  const wispY = [AIR_TOP + 90, AIR_TOP + 220];
  const wispVisible = wispY.map((_, i) => (i === 0 ? AIR_LEFT + 260 : AIR_LEFT + 560) >= hazeX);

  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${EVAP_VB_W} ${EVAP_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 공기층 테두리(안내선) */}
      <rect
        x={AIR_LEFT} y={AIR_TOP} width={AIR_RIGHT - AIR_LEFT} height={SURF_Y - AIR_TOP}
        fill="none" stroke={stroke} strokeWidth={SW_THIN} strokeDasharray="4 14" opacity={0.35}
      />

      {/* 포화된 공기(haze) - windProgress가 왼쪽부터 쓸어낸다 */}
      {hazeWidth > 1 ? (
        <rect
          x={hazeX} y={AIR_TOP + 6} width={hazeWidth} height={SURF_Y - AIR_TOP - 10}
          fill={hazeColor} opacity={hazeMaxOpacity}
        />
      ) : null}
      {wispY.map((wy, i) => (
        <path
          key={i}
          d={`M ${hazeX + 10} ${wy} Q ${hazeX + hazeWidth * 0.25 + 30} ${wy - 16} ${hazeX + hazeWidth * 0.5} ${wy} T ${AIR_RIGHT - 20} ${wy}`}
          fill="none" stroke={C.inkSoft} strokeWidth={SW_THIN * 0.8} strokeLinecap="round"
          opacity={wispVisible[i] ? satP * 0.4 : 0}
        />
      ))}

      {/* 바람 표시: 앞머리 쐐기 2개 + 방향 아이콘 */}
      {windP > 0.01 && windP < 0.995 ? (
        <>
          <WindWedge x={hazeX - 30} y={AIR_TOP + 130} opacity={0.8} />
          <WindWedge x={hazeX - 60} y={AIR_TOP + 250} opacity={0.6} />
        </>
      ) : null}

      {/* 젖은 표면(옷 단면) */}
      <path d={CLOTH_D} fill={clothColor} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />

      {/* 잔류 분자 2개 */}
      {RESIDENT_ANCHORS.map((a, i) => {
        const dy = bobAmp * Math.sin(frame / bobSpeed + a.phase);
        return (
          <MoleculeGlyph key={i} cx={a.x} cy={a.y + dy} r={a.r} opacity={1} color={moleculeColor} />
        );
      })}

      {/* 탈출 분자 1개 */}
      <MoleculeGlyph cx={escX} cy={escY} r={30} opacity={escOpacity} color={moleculeColor} />
    </svg>
  );
};

/** 우상단 햇빛 표시 - EvaporationDiagram과 같은 로컬 좌표계(x,y,width 기준)를 쓰지 않고
 *  호출 씬이 화면 절대좌표로 직접 배치한다(SVG 중첩 위치 지정 무시 문제 예방, 34화 결함
 *  재발 방지 - 원칙 "21화 이후 반복된 결함" B). ThemedIcon은 <svg> 바깥 형제로 둔다. */
export const SunRaysBadge: React.FC<{ x: number; y: number; size?: number; opacity: number }> = ({
  x, y, size = 120, opacity,
}) => (
  opacity <= 0.01 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, opacity }}>
      <ThemedIcon name="sun" size={size} color={C.gold} strokePx={9} />
    </div>
  )
);

/** 좌상단 바람 표시 - SunRaysBadge와 같은 원칙(절대좌표 형제 배치) */
export const WindBadge: React.FC<{ x: number; y: number; size?: number; opacity: number }> = ({
  x, y, size = 110, opacity,
}) => (
  opacity <= 0.01 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, opacity }}>
      <ThemedIcon name="wind" size={size} color={C.inkSoft} strokePx={9} />
    </div>
  )
);
