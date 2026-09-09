/** 배추김치 한 조각 소품 (general-ep13 v3, s1 "매운 음식 한 입" 리액션용으로 신설).
 *
 *  참고 사진 없이(원칙 0-1은 참고 이미지가 있을 때만 벡터화 도구를 강제한다 - 여기는 설명
 *  기반 신규 스타일 소품이라 Apple.tsx/IceCream.tsx 와 동일하게 손으로 그린 path 를 쓴다)
 *  이 채널 스타일(단색 잉크선 + 흰/옅은 채움, 플랫, 그림자·그라데이션 없음)에 맞춰 제작했다.
 *
 *  구성:
 *   - 바깥 윤곽 하나(`OUTLINE_D`)가 물결진 배추잎 형태다. 오른쪽 위 가장자리는 일부러
 *     안쪽으로 파인 곡선을 넣어 "한 입 베어문 자국"을 표현한다(배경색과 무관하게 항상
 *     보이도록 실제 path 굴곡으로 노치를 만들었다 - 원 겹쳐 지우기 방식이 아니다).
 *   - 아래쪽은 옅은 톤(`ribColor`, 기본 leaf 토큰)의 속대, 위쪽은 진한 코랄(`seasonedColor`)
 *     양념색으로 나뉜다. 양념 영역은 `clipPath` 로 바깥 윤곽에 맞춰 잘라 겹침 없이 붙는다
 *     (IceCream.tsx 의 콘 격자선 clip 과 동일 기법).
 *   - 양념 영역 위에 고춧가루 양념 점(`flakeColor`)을 흩뿌려 텍스처를 준다.
 *
 *  다른 화에서 매운 음식 예시가 다시 필요하면 색만 바꿔 재사용할 수 있도록 이름을
 *  KimchiPiece 로 좁히되 구조(윤곽+양념 오버레이+점 텍스처)는 범용으로 짰다.
 */
import React, { useId } from 'react';
import { C, SW, SW_THIN } from '../theme';

const OUTLINE_D = `
  M 118 240
  C 90 236, 62 220, 52 190
  C 42 165, 44 138, 56 112
  C 44 92, 46 68, 68 50
  C 84 36, 98 46, 112 36
  C 126 26, 140 42, 156 34
  C 174 25, 194 34, 200 52
  C 214 48, 228 60, 222 78
  C 236 88, 240 106, 226 118
  C 214 108, 198 118, 208 134
  C 220 142, 232 150, 224 166
  C 232 178, 228 196, 210 206
  C 206 222, 190 236, 168 240
  C 152 248, 134 246, 118 240
  Z
`;

/** 양념(코랄) 영역 - 윤곽 clip 안에서 위쪽 2/3 가량을 덮는 물결진 경계 */
const SEASONED_D = 'M 15 15 L 245 15 L 245 175 C 200 200, 150 210, 110 200 C 70 192, 40 175, 15 150 Z';

/** 고춧가루 양념 점(양념 영역 안쪽 좌표, 화면 좌표 그대로) */
const FLAKES: Array<[number, number, number]> = [
  [95, 70, 4], [130, 55, 3.5], [160, 75, 4], [185, 95, 3],
  [110, 100, 3.5], [150, 115, 3], [80, 120, 3], [175, 130, 3.5],
  [125, 140, 3], [200, 70, 3], [95, 150, 3], [140, 165, 3],
];

export interface KimchiPieceProps {
  /** 화면상 폭(px). 정사각 viewBox(0 0 260 260), 비율 유지 */
  width: number;
  /** 양념(고추장/고춧가루) 영역 색 (기본 coral) */
  seasonedColor?: string;
  /** 속대(아래쪽 옅은 부분) 색 (기본 leaf - 옅은 청록빛 흰색) */
  ribColor?: string;
  /** 고춧가루 양념 점 색 */
  flakeColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const KimchiPiece: React.FC<KimchiPieceProps> = ({
  width, seasonedColor = C.coral, ribColor = C.leaf, flakeColor = C.ink,
  stroke = C.ink, strokeWidth = SW, style,
}) => {
  const clipId = `kimchiClip-${useId()}`;
  return (
    <svg viewBox="0 0 260 260" width={width} style={style} shapeRendering="geometricPrecision">
      <defs>
        <clipPath id={clipId}>
          <path d={OUTLINE_D} />
        </clipPath>
      </defs>
      {/* 속대(바탕) - 윤곽 전체를 옅은 톤으로 먼저 채운다 */}
      <path d={OUTLINE_D} fill={ribColor} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {/* 양념 오버레이 - 윤곽 밖으로 새지 않게 clip */}
      <g clipPath={`url(#${clipId})`}>
        <path d={SEASONED_D} fill={seasonedColor} stroke={stroke} strokeWidth={SW_THIN * 0.7} />
        <g fill={flakeColor} opacity={0.5}>
          {FLAKES.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </g>
      {/* 바깥 윤곽선을 맨 위에 다시 그려 clip 경계의 이음매를 덮는다(베어문 노치 포함) */}
      <path d={OUTLINE_D} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
};

export default KimchiPiece;
