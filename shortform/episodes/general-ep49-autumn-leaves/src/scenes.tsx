/** 이 화(general-ep49, "가을 되면 나뭇잎 색이 변하는 이유") 전용 장면.
 *
 *  s1(초록 나무 실루엣이 통째로 노랑·주황·빨강으로 물든다) -> s2(잎 하나를 크게 확대,
 *  아직은 거의 안 보이지만 초록 아래 원래 색이 살짝 비친다) -> s3(초록이 화면을 꽉
 *  채우듯 진해지며 "엽록소" 라벨) -> s4(해 고도가 낮아지고 온도계가 내려가면서 초록이
 *  잎자루=아래쪽부터 걷히기 시작) -> s5(초록이 더 걷혀 노랑·주황이 넓게 드러남) ->
 *  s6(단풍잎으로 전환, 드러난 자리에 빨간 색소가 아래에서부터 차오름, "보호 효과?"
 *  라벨) -> s7(정리 - 원래 있던 색 vs 새로 생긴 색 두 잎을 나란히 대비).
 *
 *  색소는 분자 도형이 아니라 색 자체로 보여준다(오케스트레이터 지시). 설명용 잎은
 *  `props/Leaf`(REGISTRY 신규 등록) 하나를 크게 재사용하고, s1의 배경 나무는 아주 단순한
 *  실루엣(트렁크 + 캐노피 블롭 4개)만 쓴다 - 잎을 화면 가득 뿌리지 않는다.
 *
 *  `chlorophyllProgress`는 전 장면에 걸쳐 단조 증가(0 -> 0.12 -> 0.15 -> 0.5 -> 0.88 -> 유지)
 *  한다. 장면이 바뀔 때 이전 상태를 명시적으로 이어받는다(원칙 - 23화 교훈): 뒤로 되돌리지
 *  않고, 값을 낮게 유지하는 구간(s2->s3)도 "그대로 유지 후 라벨만 추가"이지 리셋이 아니다.
 */
import React from 'react';
import {
  C, Caption, FPS, H, Label, Leaf, PlainBg, PopIn, QMark, ThemedIcon, W, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

function hexToRgb(hex: string) {
  const v = hex.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function toHex2(n: number) {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/** hex -> hex 보간. 결과도 hex라 다른 lerpColor 호출에 다시 넣을 수 있다
 *  (rgb(...) 문자열을 반환하면 hexToRgb가 다시 못 읽어 NaN이 나는 걸 방지) */
function lerpColor(a: string, b: string, tt: number) {
  const p = Math.max(0, Math.min(1, tt));
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = ca.r + (cb.r - ca.r) * p;
  const g = ca.g + (cb.g - ca.g) * p;
  const bl = ca.b + (cb.b - ca.b) * p;
  return `#${toHex2(r)}${toHex2(g)}${toHex2(bl)}`;
}

/* ================================================================
 * S1: 배경 나무 실루엣 - 캐노피 색이 통째로 물든다
 * ================================================================ */

const TREE_GROUND = 1360;
const TREE_CX = CX;

const CANOPY_BLOBS = [
  { dx: 0, dy: -430, rx: 210, ry: 160, hue: 0.15 },
  { dx: -190, dy: -300, rx: 150, ry: 120, hue: 0.55 },
  { dx: 190, dy: -320, rx: 160, ry: 126, hue: 0.85 },
  { dx: 0, dy: -270, rx: 190, ry: 130, hue: 0.35 },
];

function canopyColor(colorT: number, hue: number) {
  const end = hue < 0.5
    ? lerpColor('#FFC24B', '#F2934A', hue * 2)
    : lerpColor('#F2934A', '#E2543C', (hue - 0.5) * 2);
  return lerpColor('#4CAF6B', end, colorT);
}

const AutumnTree: React.FC<{ colorT: number }> = ({ colorT }) => (
  <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
    <rect x={TREE_CX - 26} y={TREE_GROUND - 210} width={52} height={220} rx={20} fill={C.browning} />
    {CANOPY_BLOBS.map((b, i) => (
      <ellipse
        key={i}
        cx={TREE_CX + b.dx}
        cy={TREE_GROUND + b.dy}
        rx={b.rx}
        ry={b.ry}
        fill={canopyColor(colorT, b.hue)}
        stroke={C.ink}
        strokeWidth={9}
      />
    ))}
  </svg>
);

export const S1Tree: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const colorT = progress(f, 10, frames - 8) * 0.85;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={TREE_GROUND} groundColor={C.hill}>
      <AutumnTree colorT={colorT} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S2~S5, S7: 잎 확대 공용 배치
 * ================================================================ */

const LEAF_WIDTH = 620;
const LEAF_X = CX - LEAF_WIDTH / 2;
const LEAF_Y = 480;
const LEAF_HEIGHT = (LEAF_WIDTH * 500) / 420;
// S3~S5 는 style={left,top} 로 직접 배치한다(top = LEAF_Y). S2 만 PopIn 으로 등장시키는데,
// PopIn 은 중심(cx,cy) 기준이라 같은 top 이 되도록 cy 를 역산해야 크로스페이드 때 잎이
// 위아래로 튀지 않는다(장면 전환 시 좌표가 어긋나면 안 된다 - 검수 체크리스트).
const LEAF_POPIN_CY = LEAF_Y + LEAF_HEIGHT / 2;

export const S2Hidden: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const popP = progress(f, 4, 22);
  const chloroT = progress(f, 20, 130) * 0.12;

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      <PopIn cx={CX} cy={LEAF_POPIN_CY} size={LEAF_WIDTH} height={LEAF_HEIGHT} progress={popP} fromScale={0.6}>
        <Leaf width={LEAF_WIDTH} variant="oval" chlorophyllProgress={chloroT} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S3Covered: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const labelP = progress(f, 16, 40);
  const chloroT = 0.12 + progress(f, 0, frames) * 0.03;

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      <Leaf width={LEAF_WIDTH} variant="oval" chlorophyllProgress={chloroT}
        style={{ position: 'absolute', left: LEAF_X, top: LEAF_Y }} />
      <PopIn cx={CX} cy={LEAF_Y - 60} size={280} progress={labelP} fromScale={0.5}>
        <Label x={140} y={0} text={t.s3Label} size={58} color={C.ink} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

const S4_ICON_X = 130;

export const S4Withdraw: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const chloroT = 0.15 + progress(f, 10, frames - 10) * 0.35;
  const iconP = progress(f, 6, 30);
  const sunY = 300 + progress(f, 20, frames - 20) * 90;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Leaf width={LEAF_WIDTH} variant="oval" chlorophyllProgress={chloroT}
        style={{ position: 'absolute', left: LEAF_X, top: LEAF_Y }} />
      <PopIn cx={S4_ICON_X} cy={sunY} size={110} progress={iconP}>
        <ThemedIcon name="sun" size={110} color={C.gold} />
      </PopIn>
      <PopIn cx={S4_ICON_X} cy={sunY + 170} size={90} progress={iconP}>
        <ThemedIcon name="temperature" size={90} color={C.inkSoft} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S5Reveal: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const chloroT = 0.5 + progress(f, 6, frames - 8) * 0.38;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {/* S4 와 정확히 같은 크기·위치를 유지한다 - 장면이 바뀌어도 "같은 잎이 계속 걷히는
          중"임을 크로스페이드로 자연스럽게 이어 보이게 한다(좌표가 튀면 안 된다) */}
      <Leaf width={LEAF_WIDTH} variant="oval" chlorophyllProgress={chloroT}
        style={{ position: 'absolute', left: LEAF_X, top: LEAF_Y }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 단풍잎 - 빨간 색소가 새로 채워짐
 * ================================================================ */

const S6_LEAF_W = 500;
const S6_LEAF_X = 110;
const S6_LEAF_Y = 470;
const S6_QMARK_LEFT = 780;
const S6_QMARK_TOP = 480;

export const S6Maple: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const anthoT = progress(f, 20, frames - 30);
  const labelP = progress(f, frames - 70, frames - 40);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <Leaf width={S6_LEAF_W} variant="maple" chlorophyllProgress={0.88} anthocyaninProgress={anthoT}
        style={{ position: 'absolute', left: S6_LEAF_X, top: S6_LEAF_Y }} />
      <QMark size={110} color={C.coral} style={{ left: S6_QMARK_LEFT, top: S6_QMARK_TOP, opacity: labelP }} />
      <Label x={S6_QMARK_LEFT + 55} y={S6_QMARK_TOP + 150} text={t.s6Label} size={48} color={C.ink}
        style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 정리 - 원래 있던 색 vs 새로 생긴 색
 * ================================================================ */

const S7_LEAF_W = 380;
const S7_LEFT_X = 240;
const S7_RIGHT_X = 700;
const S7_Y = 500;
const S7_LABEL_Y = 1160;

export const S7Recap: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const popP = progress(f, 6, 28);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PopIn cx={S7_LEFT_X + S7_LEAF_W / 2} cy={S7_Y + 320} size={S7_LEAF_W} height={(S7_LEAF_W * 500) / 420} progress={popP}>
        <Leaf width={S7_LEAF_W} variant="oval" chlorophyllProgress={1} anthocyaninProgress={0} />
      </PopIn>
      <PopIn cx={S7_RIGHT_X + S7_LEAF_W / 2} cy={S7_Y + 300} size={S7_LEAF_W} height={(S7_LEAF_W * 500) / 420} progress={popP}>
        <Leaf width={S7_LEAF_W} variant="maple" chlorophyllProgress={1} anthocyaninProgress={1} />
      </PopIn>
      <Label x={S7_LEFT_X + S7_LEAF_W / 2} y={S7_LABEL_Y} text={t.s7OriginalLabel} size={42} color={C.ink}
        style={{ opacity: popP }} />
      <Label x={S7_RIGHT_X + S7_LEAF_W / 2} y={S7_LABEL_Y} text={t.s7NewLabel} size={42} color={C.ink}
        style={{ opacity: popP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
