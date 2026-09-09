/** "입을 크게 벌리면 숨이 천천히 넓게 퍼져 체온 그대로 닿고, 입술을 좁게 오므리면 바람이
 *  빨라지며 주변 찬 공기를 끌고 와 식어서 닿는다"를 보여주는 다이어그램(하~는 따뜻한데
 *  후~는 시원한 이유, general-ep39). HeadNerveDiagram·CatPurrDiagram과 같은 원칙(새 얼굴을
 *  그리지 않고 이미 승인된 BustActor 위에 오버레이만 얹는다, 원칙 5 예방 체크리스트).
 *
 *  정렬 원리: HeadNerveDiagram과 동일 - 오버레이 <svg>를 BustActor와 같은
 *  viewBox={BUST_VIEWBOX}·같은 크기·같은 위치로 겹치면 좌표 변환 없이 얼굴과 정렬된다.
 *  BustActor 호출에는 breathAmp={0}을 줘서 숨쉬기 모션이 오버레이와 어긋나지 않게 한다.
 *
 *  mode='wide'  (하~): mouthOpen을 크게 고정(포즈 그대로, 새 입 모양 없음) + 마스크 밖으로
 *    부드럽게 넓어지는 곡선 화살 3가닥(화살촉 없이 끝이 옅어짐, "느리고 넓게"). 온기
 *    글로우(coral/gold)를 입 주변에 얹는다.
 *  mode='narrow'(후~): 기본 입 모양 위에 작은 원(pursed lips)을 오버레이해 좁고 둥근 입
 *    모양으로 바꾼다(새 얼굴 좌표를 짓지 않고 기존 입 위에 작은 원 하나만 겹친다). 그
 *    앞으로 화살촉이 뚜렷한 굵은 화살 1가닥이 빠르게 뻗어나가고("빠르고 좁게"), 위아래에서
 *    찬 공기를 뜻하는 화살 2가닥이 그 줄기로 합류한다(mixWithCold, "주변 공기가 딸려
 *    들어와 섞인다"를 화살 2개가 합류하는 형태로 단순 표현, 오케스트레이터 지시). 찬기
 *    글로우(seaTop/seaDeep)를 입 주변에 얹는다.
 *
 *  "좁은 통로를 지나면 속도가 빨라지고, 그 빠른 흐름이 주변 유체를 끌고 들어와 섞인다"는
 *  구조를 갖는 다른 유체 소재(빨대, 노즐, 바람 등) 전반 재사용 가능성이 있어 에피소드
 *  로컬이 아니라 여기 등록. 같은 파일의 `ElectricFan`은 "빠른 바람이 시원하게 느껴지는
 *  건 같은 원리"를 보여주는 s6용 단순 선풍기 실루엣(날개 3개 + 보호망 + 스탠드)으로,
 *  바람·냉방 소재 전반 재사용 가능하도록 별도 export했다.
 */
import React from 'react';
import { clamp01 } from '../anim';
import { C, SW, SW_THIN } from '../theme';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import type { Pose } from '../character/Character';

/** 캐릭터 실제 입 위치(RIG.MOUTH) 그대로 쓴다 - 새로 지어내지 않는다 */
export const BREATH_MOUTH_PT = { x: RIG.MOUTH.cx, y: RIG.MOUTH.y };

interface Pt { x: number; y: number }

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

const rad = (deg: number) => (deg * Math.PI) / 180;

/** origin -> target 을 잇는 화살의 angleDeg/length 를 역산한다(합류 지점을 좌표로 지정하고
 *  싶을 때, 손으로 각도를 추정하지 않기 위한 헬퍼) */
function angleLenTo(origin: Pt, target: Pt) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return { angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI, length: Math.hypot(dx, dy) };
}

/** 화살(선+화살촉). AirplaneWingDiagram의 BoldArrow와 같은 원칙(reveal 0~1로 자람) */
function BoldArrow({
  origin, angleDeg, length, reveal, color, strokeWidth = SW, head = true,
}: {
  origin: Pt; angleDeg: number; length: number; reveal: number; color: string;
  strokeWidth?: number; head?: boolean;
}) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const len = length * r;
  const tipX = origin.x + dx * len;
  const tipY = origin.y + dy * len;
  const headLen = head ? Math.min(30, len * 0.32) : 0;
  const backX = tipX - dx * headLen;
  const backY = tipY - dy * headLen;
  const perpX = -dy;
  const perpY = dx;
  const headW = headLen * 0.62;
  return (
    <g opacity={head ? 1 : 0.85 - 0.55 * r}>
      <line
        x1={origin.x} y1={origin.y} x2={backX} y2={backY}
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      />
      {head ? (
        <path
          d={`M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(backX + perpX * headW).toFixed(1)} ${(backY + perpY * headW).toFixed(1)} L ${(backX - perpX * headW).toFixed(1)} ${(backY - perpY * headW).toFixed(1)} Z`}
          fill={color}
        />
      ) : null}
    </g>
  );
}

/** 넓게 퍼지는 곡선 한 가닥(화살촉 없이 끝이 옅어짐 - "느리고 넓게" 인상) */
function SoftFlowLine({
  origin, angleDeg, length, spreadDeg, reveal, color, strokeWidth = SW,
}: {
  origin: Pt; angleDeg: number; length: number; spreadDeg: number; reveal: number;
  color: string; strokeWidth?: number;
}) {
  const r = clamp01(reveal);
  if (r <= 0.02) return null;
  const rad = (angleDeg * Math.PI) / 180;
  const endRad = ((angleDeg + spreadDeg) * Math.PI) / 180;
  const endX = origin.x + Math.cos(endRad) * length;
  const endY = origin.y + Math.sin(endRad) * length;
  const ctrlX = origin.x + Math.cos(rad) * length * 0.6;
  const ctrlY = origin.y + Math.sin(rad) * length * 0.6;
  return (
    <path
      d={`M ${origin.x} ${origin.y} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`}
      fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      pathLength={1} strokeDasharray={1} strokeDashoffset={1 - r}
      opacity={0.85}
    />
  );
}

export interface BreathFlowDiagramProps {
  /** 화면상 한 변 크기(px). BUST_VIEWBOX가 정사각형이라 폭=높이다 */
  width: number;
  x?: number;
  y?: number;
  /** 'wide' = 하~(크게 벌린 입), 'narrow' = 후~(좁게 오므린 입) */
  mode: 'wide' | 'narrow';
  /** 공기 흐름 화살 진행도 0~1 */
  airSpeed: number;
  /** narrow에서만 의미 있음: 주변 찬 공기가 딸려 들어와 섞이는 화살 2가닥 진행도 0~1 */
  mixWithCold?: number;
  /** BustActor 색 오버라이드 */
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

const IDLE_POSE: Pose = {};

export const BreathFlowDiagram: React.FC<BreathFlowDiagramProps> = ({
  width, x = 0, y = 0, mode, airSpeed, mixWithCold = 0,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const speed = clamp01(airSpeed);
  const mix = clamp01(mixWithCold);
  const mouthOpen = mode === 'wide' ? 0.94 : 0;

  // 입 옆(화면 기준 오른쪽 아래 방향)으로 공기가 빠져나가는 기준 각도. y+ = 아래.
  const BASE_ANGLE = 24;
  const warmColor = C.coral;
  const warmGlow = C.gold;
  const coolColor = C.waterCool;
  const coolGlow = C.seaTop;

  const glowR = mode === 'wide' ? 96 + 26 * speed : 78 + 30 * Math.max(speed, mix);
  const glowOpacity = mode === 'wide' ? 0.28 * speed : 0.3 * Math.max(speed, mix * 0.8);

  // narrow 모드 전용 좌표. 메인 제트는 입에서 BASE_ANGLE 방향으로 곧게 나가고, 합류 화살
  // 2가닥은 얼굴 바깥(오른쪽 여백)에서 출발해 제트 중간 지점(mergePt)으로 모인다.
  const jetOrigin: Pt = { x: BREATH_MOUTH_PT.x + 26, y: BREATH_MOUTH_PT.y + 10 };
  const mergePt: Pt = {
    x: jetOrigin.x + Math.cos(rad(BASE_ANGLE)) * 210,
    y: jetOrigin.y + Math.sin(rad(BASE_ANGLE)) * 210,
  };
  const mixTopOrigin: Pt = { x: BREATH_MOUTH_PT.x + 333, y: BREATH_MOUTH_PT.y - 175 };
  const mixBottomOrigin: Pt = { x: BREATH_MOUTH_PT.x + 363, y: BREATH_MOUTH_PT.y + 275 };
  const mixTop = angleLenTo(mixTopOrigin, mergePt);
  const mixBottom = angleLenTo(mixBottomOrigin, mergePt);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      {/* 캐릭터 얼굴 그대로. 오버레이와 어긋나지 않도록 숨쉬기 모션을 끈다 */}
      <BustActor
        size={width} left={0} top={0} pose={{ ...IDLE_POSE, mouthOpen }} breathAmp={0}
        color={stroke} fill={fill}
      />

      {/* BustActor와 같은 viewBox를 써서 좌표 변환 없이 얼굴 위에 정확히 겹친다 */}
      <svg
        viewBox={BUST_VIEWBOX} width={width} height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 온기/찬기 글로우 - 입 주변 */}
        <circle
          cx={BREATH_MOUTH_PT.x} cy={BREATH_MOUTH_PT.y} r={glowR}
          fill={mode === 'wide' ? warmGlow : coolGlow} opacity={glowOpacity}
        />

        {mode === 'wide' ? (
          <>
            {/* 넓게 퍼지는 화살 3가닥. 인덱스 시차로 순차 리빌(원칙 3: 순수 함수) */}
            {[-22, 0, 22].map((offset, i) => (
              <SoftFlowLine
                key={i}
                origin={BREATH_MOUTH_PT}
                angleDeg={BASE_ANGLE + offset}
                spreadDeg={offset * 0.9}
                length={330 + i * 8}
                reveal={clamp01((speed - i * 0.08) / 0.7)}
                color={warmColor}
                strokeWidth={SW * (1 - Math.abs(offset) / 90)}
              />
            ))}
          </>
        ) : (
          <>
            {/* 좁게 오므린 입(pursed lips) - 기존 입 모양 위에 작은 둥근 원 하나만 겹친다 */}
            <circle
              cx={BREATH_MOUTH_PT.x} cy={BREATH_MOUTH_PT.y} r={22}
              fill={fill} stroke={stroke} strokeWidth={SW_THIN * 1.3}
            />

            {/* 빠르고 좁은 화살 1가닥(화살촉 뚜렷 - "빠르고 좁게") */}
            <BoldArrow
              origin={jetOrigin}
              angleDeg={BASE_ANGLE} length={360} reveal={speed}
              color={coolColor} strokeWidth={SW * 1.05}
            />

            {/* 주변 찬 공기가 딸려 들어와 섞이는 화살 2가닥. 얼굴 바깥(오른쪽 여백)에서
                출발해 메인 줄기 중간 지점(mergePt)으로 합류한다 - 볼터치와 겹치지 않도록
                얼굴 윤곽 밖에서 시작하고, seaTop(연한 글로우색) 대신 더 또렷한 seaDeep을
                써서 밝은 배경 위에서도 눈에 띄게 한다 */}
            <BoldArrow
              origin={mixTopOrigin} {...mixTop} reveal={smooth(mix)}
              color={C.seaDeep} strokeWidth={SW_THIN * 1.6}
            />
            <BoldArrow
              origin={mixBottomOrigin} {...mixBottom} reveal={smooth(mix)}
              color={C.seaDeep} strokeWidth={SW_THIN * 1.6}
            />
          </>
        )}
      </svg>
    </div>
  );
};

/* ================= ElectricFan - 단순 선풍기 실루엣(s6, "선풍기도 같은 원리") ================= */

export const FAN_VB_W = 420;
export const FAN_VB_H = 520;

export interface ElectricFanProps {
  width: number;
  x: number;
  y: number;
  /** 날개 회전 각도(도). 계속 도는 느낌은 호출부가 frame 기반으로 넘긴다 */
  spinDeg?: number;
  stroke?: string;
  fill?: string;
  bladeColor?: string;
  style?: React.CSSProperties;
}

/** 날개 3개 + 원형 보호망 + 목/스탠드. 창문·모터 디테일 없이 단순 실루엣만(채널 원칙) */
export const ElectricFan: React.FC<ElectricFanProps> = ({
  width, x, y, spinDeg = 0, stroke = C.ink, fill = C.paper, bladeColor = C.roomDeep, style,
}) => {
  const scale = width / FAN_VB_W;
  const height = FAN_VB_H * scale;
  const cx = FAN_VB_W / 2;
  const cy = 150;
  const guardR = 130;
  return (
    <svg
      width={width} height={height} viewBox={`0 0 ${FAN_VB_W} ${FAN_VB_H}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', ...style }}
    >
      {/* 스탠드 */}
      <line x1={cx} y1={cy + guardR + 4} x2={cx} y2={470} stroke={stroke} strokeWidth={SW} strokeLinecap="round" />
      <ellipse cx={cx} cy={492} rx={92} ry={20} fill={fill} stroke={stroke} strokeWidth={SW_THIN} />

      {/* 날개(회전) - 뒤에 그려 보호망 살대에 가려지게 */}
      <g transform={`rotate(${spinDeg} ${cx} ${cy})`}>
        {[0, 120, 240].map((a) => (
          <ellipse
            key={a}
            cx={cx} cy={cy - 52}
            rx={30} ry={54}
            fill={bladeColor} stroke={stroke} strokeWidth={SW_THIN * 0.8}
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={16} fill={stroke} />
      </g>

      {/* 보호망(원 + 방사형 살대) */}
      <circle cx={cx} cy={cy} r={guardR} fill="none" stroke={stroke} strokeWidth={SW_THIN} />
      <circle cx={cx} cy={cy} r={guardR * 0.62} fill="none" stroke={stroke} strokeWidth={SW_THIN * 0.6} opacity={0.6} />
      {[0, 45, 90, 135].map((a) => {
        const rad = (a * Math.PI) / 180;
        const dx = Math.cos(rad) * guardR;
        const dy = Math.sin(rad) * guardR;
        return (
          <line
            key={a}
            x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy}
            stroke={stroke} strokeWidth={SW_THIN * 0.5} opacity={0.55}
          />
        );
      })}
    </svg>
  );
};

export default BreathFlowDiagram;
