/** 직접 그린 동물 소품. 1화(포유류 목뼈)에서 만들었지만 동물·생물 편에서 재사용한다.
 *
 *  공통 규약
 *   - viewBox 는 화면 픽셀과 1:1, width 만 주면 비율이 유지된다
 *   - stroke / fill / spot 으로 색을 개별 지정, silhouette 하나로 단색 실루엣 전환
 *   - 캐릭터와 같은 미니멀 라인 스타일 (잉크 선 + 흰 채움 + 코랄 액센트, 둥근 선끝)
 */
import React from 'react';
import { C, SW } from '../theme';

export interface AnimalProps {
  width: number;
  /** 선 색 (기본 ink) */
  stroke?: string;
  /** 채움 (기본 paper) */
  fill?: string;
  /** 액센트 (기본 coral) */
  spot?: string;
  /** 단색 실루엣. 지정하면 위 3개를 모두 덮는다 */
  silhouette?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

function skin(p: AnimalProps) {
  return {
    st: p.silhouette ?? p.stroke ?? C.ink,
    bg: p.silhouette ?? p.fill ?? C.paper,
    ac: p.silhouette ?? p.spot ?? C.coral,
    sw: p.strokeWidth ?? SW,
  };
}

/** 쥐 */
export const Mouse: React.FC<AnimalProps> = (p) => {
  const { st, bg, ac, sw } = skin(p);
  return (
    <svg viewBox="0 0 320 230" width={p.width} style={p.style} shapeRendering="geometricPrecision">
      <path d="M 250 150 C 285 140, 300 108, 288 82" fill="none" stroke={st}
        strokeWidth={11} strokeLinecap="round" />
      <ellipse cx={112} cy={80} rx={40} ry={38} fill={bg} stroke={st} strokeWidth={sw} />
      <ellipse cx={112} cy={80} rx={18} ry={17} fill={ac} />
      <ellipse cx={196} cy={78} rx={34} ry={32} fill={bg} stroke={st} strokeWidth={sw} />
      <ellipse cx={196} cy={78} rx={15} ry={14} fill={ac} />
      <ellipse cx={160} cy={150} rx={98} ry={62} fill={bg} stroke={st} strokeWidth={sw} />
      <circle cx={112} cy={140} r={9} fill={st} />
      <circle cx={68} cy={158} r={9} fill={ac} />
      <g stroke={st} strokeWidth={7} strokeLinecap="round">
        <line x1={72} y1={176} x2={30} y2={192} />
        <line x1={76} y1={146} x2={32} y2={138} />
      </g>
    </svg>
  );
};

/** 고래 */
export const Whale: React.FC<AnimalProps> = (p) => {
  const { st, bg, ac, sw } = skin(p);
  return (
    <svg viewBox="0 0 400 250" width={p.width} style={p.style} shapeRendering="geometricPrecision">
      {/* 꼬리 - 고래 특유의 좌우로 갈라진 수평 꼬리 */}
      <path d="M 300 148 C 330 128, 356 96, 392 92 C 380 128, 372 140, 356 150
               C 372 160, 380 174, 392 206 C 356 200, 330 172, 300 152 Z"
        fill={bg} stroke={st} strokeWidth={sw} strokeLinejoin="round" />
      {/* 몸통 - 앞머리가 크고 꼬리로 갈수록 급격히 가늘어진다 */}
      <path
        d="M 22 132 C 22 78, 82 52, 152 52 C 236 52, 288 92, 310 148
           C 286 186, 232 212, 152 212 C 78 212, 22 186, 22 132 Z"
        fill={bg} stroke={st} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* 아래턱 선 - 길게 뻗은 고래 입 */}
      <path d="M 24 150 C 70 182, 140 192, 206 178" fill="none" stroke={st} strokeWidth={9}
        strokeLinecap="round" />
      {/* 가슴 지느러미 */}
      <path d="M 128 168 C 152 182, 176 198, 168 212 C 148 210, 128 190, 122 174 Z"
        fill={ac} stroke={st} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx={66} cy={126} r={10} fill={st} />
      {/* 숨구멍 물줄기 */}
      <g stroke={st} strokeWidth={10} strokeLinecap="round">
        <line x1={126} y1={54} x2={120} y2={12} />
        <line x1={148} y1={54} x2={160} y2={16} />
        <line x1={104} y1={62} x2={84} y2={28} />
      </g>
    </svg>
  );
};

/** 나무늘보. 나뭇가지에 매달린 자세. 실루엣으로 쓰는 경우가 많아 팔다리가 몸통 밖으로 크게 나온다. */
export const Sloth: React.FC<AnimalProps> = (p) => {
  const { st, bg, ac, sw } = skin(p);
  return (
    <svg viewBox="0 0 400 360" width={p.width} style={p.style} shapeRendering="geometricPrecision">
      <line x1={14} y1={38} x2={386} y2={38} stroke={st} strokeWidth={24} strokeLinecap="round" />
      {/* 나뭇가지를 감싼 긴 팔 - 몸통 바깥으로 크게 돌아 내려온다 */}
      <g stroke={st} strokeWidth={28} strokeLinecap="round" fill="none">
        <path d="M 92 44 C 46 96, 56 176, 116 214" />
        <path d="M 306 44 C 352 96, 342 176, 282 214" />
        <path d="M 152 286 C 132 330, 168 348, 200 330" />
        <path d="M 246 286 C 266 330, 232 348, 200 332" />
      </g>
      <ellipse cx={200} cy={232} rx={92} ry={78} fill={bg} stroke={st} strokeWidth={sw} />
      <ellipse cx={200} cy={136} rx={70} ry={62} fill={bg} stroke={st} strokeWidth={sw} />
      <ellipse cx={172} cy={132} rx={22} ry={26} fill={ac} transform="rotate(-16 172 132)" />
      <ellipse cx={230} cy={132} rx={22} ry={26} fill={ac} transform="rotate(16 230 132)" />
      <circle cx={175} cy={134} r={9} fill={st} />
      <circle cx={227} cy={134} r={9} fill={st} />
      <path d="M 180 166 C 192 178, 210 178, 222 166" fill="none" stroke={st} strokeWidth={9}
        strokeLinecap="round" />
    </svg>
  );
};
