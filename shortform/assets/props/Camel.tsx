/** 낙타(단봉낙타, 혹 1개). 사막·동물 소재 전반 재사용 가능(general-ep92 신설).
 *
 *  viewBox 640x1000, 화면 픽셀과 1:1. 바닥선 y = 950 (Giraffe.tsx 와 같은 규약 - 이
 *  컴포넌트 자체엔 x/y 가 없고, 호출 씬이 발끝(vb y=950)을 화면 바닥선에 맞춰 배치한다).
 *
 *  drink 0 = 서 있음(고개를 살짝 든 자세), 1 = 목을 앞으로 쭉 뻗어 물을 마시는 자세
 *  (Giraffe 의 neck beam 보간과 같은 방식 - 단일 사다리꼴 목을 각도만 회전시킨다).
 *  혹은 몸통 위에 별도 돔 형태로 얹어(겉모습은 항상 꽉 찬 것처럼 보이는 단색 실루엣) -
 *  혹 내부 성분(물 vs 지방)은 이 컴포넌트가 아니라 CamelHumpDiagram(단면도)이 보여준다.
 */
import React from 'react';
import { C, SW } from '../theme';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const RAD = Math.PI / 180;

export interface CamelProps {
  width: number;
  /** 0 = 서 있음, 1 = 물 마시는 자세(목을 앞으로 뻗어 고개가 지면 가까이) */
  drink?: number;
  /** 선 색 (기본 ink) */
  stroke?: string;
  /** 채움 (기본 paper) */
  fill?: string;
  /** 혹 채움 (기본 fill 과 동일 - 겉에서는 몸통과 같은 색) */
  humpFill?: string;
  /** 전부 한 색으로 칠한 실루엣. 지정하면 위 색을 모두 덮는다 */
  silhouette?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const Camel: React.FC<CamelProps> = ({
  width, drink = 0, stroke, fill, humpFill, silhouette, strokeWidth = SW, style,
}) => {
  const d = Math.max(0, Math.min(1, drink));
  const st = silhouette ?? stroke ?? C.ink;
  const bg = silhouette ?? fill ?? C.paper;
  const hp = silhouette ?? humpFill ?? bg;

  // 목: 몸통 앞쪽 위(bx,by)에서 시작해 각도(ang)·길이(len)만큼 뻗은 사다리꼴.
  // 서 있을 때도 낙타 특유의 완만한 전방 기울기를 주고, 마실 때는 앞다리를 넘어서는
  // 지점까지 앞으로 크게 기울인다. 처음엔 각도만 156도까지 키웠다가 스틸 선점검에서
  // 목이 앞다리 사이로 그대로 꽂혀버리는(다리와 겹쳐 보이는) 결함을 발견했다 - 각도를
  // 118도로 낮추고 앞으로 뻗는 성분(dx)을 키워 앞다리를 확실히 넘어서게 했다.
  const ang = lerp(48, 118, d) * RAD;
  const len = lerp(258, 360, d);
  const bx = 205;
  const by = 590;
  const dx = Math.sin(ang);
  const dy = -Math.cos(ang);
  const px = -dy;
  const py = dx;
  const hw0 = 50;
  const hw1 = 32;
  const tipX = bx + dx * len;
  const tipY = by + dy * len;
  const neckD =
    `M ${bx + px * hw0} ${by + py * hw0} ` +
    `L ${tipX + px * hw1} ${tipY + py * hw1} ` +
    `L ${tipX - px * hw1} ${tipY - py * hw1} ` +
    `L ${bx - px * hw0} ${by - py * hw0} Z`;

  const headRot = lerp(-6, 92, d);
  const hx = tipX + dx * 18;
  const hy = tipY + dy * 18;

  return (
    <svg viewBox="0 0 640 1000" width={width} style={style} shapeRendering="geometricPrecision">
      {/* 다리 4개 */}
      <g stroke={st} strokeWidth={22} strokeLinecap="round" fill="none">
        <line x1={252} y1={686} x2={240} y2={950} />
        <line x1={298} y1={694} x2={306} y2={950} />
        <line x1={392} y1={694} x2={384} y2={950} />
        <line x1={438} y1={686} x2={450} y2={950} />
      </g>

      {/* 꼬리 */}
      <path d="M 495 616 C 526 654, 528 690, 512 712" fill="none" stroke={st} strokeWidth={11}
        strokeLinecap="round" />

      {/* 목 (몸통보다 먼저 그려 몸통 아래로 자연스럽게 이어지게) */}
      <path d={neckD} fill={bg} stroke={st} strokeWidth={strokeWidth} strokeLinejoin="round" />

      {/* 몸통 */}
      <ellipse cx={345} cy={650} rx={165} ry={105} fill={bg} stroke={st} strokeWidth={strokeWidth} />

      {/* 혹: 몸통 등 위, 뒤쪽으로 치우쳐 얹힌 돔(목 밑동과 겹치지 않게 간격을 둠).
          겉모습은 항상 단색으로 꽉 차 보인다 */}
      <path
        d="M 315 585 C 320 470, 380 405, 420 400 C 470 405, 505 470, 495 570
           C 460 598, 355 598, 315 585 Z"
        fill={hp} stroke={st} strokeWidth={strokeWidth} strokeLinejoin="round"
      />

      {/* 머리 */}
      <g transform={`translate(${hx} ${hy}) rotate(${headRot})`}>
        {/* 귀 2개 */}
        <ellipse cx={-6} cy={-72} rx={16} ry={22} fill={bg} stroke={st} strokeWidth={strokeWidth}
          transform="rotate(-18 -6 -72)" />
        <ellipse cx={34} cy={-74} rx={16} ry={22} fill={bg} stroke={st} strokeWidth={strokeWidth}
          transform="rotate(14 34 -74)" />
        {/* 얼굴(주둥이가 긴 편) */}
        <path
          d="M -34 -40 C -34 -66, -8 -84, 30 -84 C 66 -84, 92 -64, 100 -34
             C 106 -8, 96 18, 62 30 C 30 40, -10 34, -26 12 C -38 -6, -38 -22, -34 -40 Z"
          fill={bg} stroke={st} strokeWidth={strokeWidth} strokeLinejoin="round"
        />
        {/* 낙타 특유의 갈라진 윗입술 */}
        <path d="M 78 22 C 84 28, 84 34, 78 40 M 88 18 C 96 22, 98 30, 92 38" fill="none"
          stroke={st} strokeWidth={7} strokeLinecap="round" />
        <circle cx={2} cy={-30} r={9} fill={st} />
        <circle cx={82} cy={2} r={5} fill={st} />
      </g>
    </svg>
  );
};

export default Camel;
