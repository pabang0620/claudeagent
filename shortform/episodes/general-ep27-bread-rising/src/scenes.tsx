/** 이 화(general-ep27, "빵이 부풀어 오르는 이유") 전용 장면.
 *
 *  s1(무성, 볼 안 반죽 덩어리가 시간이 지나며 두 배로 부풀어 오르는 타임랩스) -> s2(리액션+
 *  훅 질문) -> s3(효모가 당분을 먹고 이산화탄소 기포를 만드는 과정) -> s4(글루텐 그물이
 *  드러나고 기포가 그 안에 갇혀 더 커지는 과정) -> s5(결론, 반죽 전체가 풍선처럼 부풀어
 *  오르는 정지 컷) -> s6(오븐 안에서 한 번 더 부풀고 표면이 갈색으로 굳는 과정) -> s7(오래된
 *  화덕 실루엣이 화면 하단에 살짝 겹쳐지는 장식 컷, 발효의 오랜 역사).
 */
import React from 'react';
import {
  BustActor, C, Caption, DoughDiagram, FPS, H, Label, PlainBg, POSES, W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const lerp = (a: number, b: number, ratio: number) => a + (b - a) * ratio;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- S1: 볼 안 반죽이 시간이 지나며 두 배로 부풀어 오른다 (무성) ---------------- */

/** 2026-09-02 검수에서 화면 위쪽 65%가 텅 비어 보이는 결함이 발견됐다(ep24 S1과 동일 유형).
 *  그릇+반죽 전체 구성의 세로 중심이 화면 중앙(y~950) 부근에 오도록 rim을 위로 올리고
 *  최대 크기를 키웠다 */
const RIM_Y = 1050;
const BOWL_HALF_W = 300;
const BOWL_DEPTH = 220;

/** 그릇 본체 - 둥근 바닥의 사다리꼴 컵 모양(참고 이미지 없이 직접 그린 단순 도형) */
function bowlBodyPath() {
  return `
    M ${CX - BOWL_HALF_W},${RIM_Y}
    L ${CX - BOWL_HALF_W * 0.7},${RIM_Y + BOWL_DEPTH}
    Q ${CX},${RIM_Y + BOWL_DEPTH + 40} ${CX + BOWL_HALF_W * 0.7},${RIM_Y + BOWL_DEPTH}
    L ${CX + BOWL_HALF_W},${RIM_Y}
    Z
  `;
}

/** 반죽 덩어리 - 완만한 두 봉우리를 가진 블롭. rx/ry 가 커질수록 위로 부풀어 오른다 */
function doughMoundPath(cx: number, baseY: number, rx: number, ry: number) {
  const top = baseY - ry;
  return `
    M ${cx - rx},${baseY}
    C ${cx - rx},${top + ry * 0.5} ${cx - rx * 0.55},${top - ry * 0.06} ${cx - rx * 0.18},${top}
    C ${cx},${top - ry * 0.1} ${cx + rx * 0.04},${top - ry * 0.1} ${cx + rx * 0.22},${top + ry * 0.02}
    C ${cx + rx * 0.6},${top + ry * 0.12} ${cx + rx},${top + ry * 0.5} ${cx + rx},${baseY}
    Z
  `;
}

/** 그릇 앞쪽 테두리 띠 - 반죽 아래쪽에 겹쳐 그려 "그릇 안에 담겨 있다"는 느낌을 만든다 */
function bowlRimBandPath() {
  return `
    M ${CX - BOWL_HALF_W},${RIM_Y - 8}
    Q ${CX},${RIM_Y + 30} ${CX + BOWL_HALF_W},${RIM_Y - 8}
    L ${CX + BOWL_HALF_W},${RIM_Y + 14}
    Q ${CX},${RIM_Y + 52} ${CX - BOWL_HALF_W},${RIM_Y + 14}
    Z
  `;
}

export const S1Rise: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const growP = smooth(progress(f, frames * 0.06, frames * 0.86));
  const rx = lerp(170, 340, growP);
  const ry = lerp(80, 420, growP);
  const baseY = RIM_Y + 40;
  return (
    <PlainBg ground={null}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={bowlBodyPath()} fill={C.room} stroke={C.ink} strokeWidth={13} strokeLinejoin="round" />
        <path d={doughMoundPath(CX, baseY, rx, ry)} fill={C.browningSoft} stroke={C.ink} strokeWidth={13} strokeLinejoin="round" />
        <path d={bowlRimBandPath()} fill={C.room} stroke={C.ink} strokeWidth={13} strokeLinejoin="round" />
      </svg>
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 효모가 당분을 먹고 이산화탄소 기포를 만든다 ---------------- */

const DIAG_WIDTH = 760;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 400;

export const S3Yeast: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const riseP = progress(f, frames * 0.08, frames * 0.9);
  const labelP = progress(f, frames * 0.05, frames * 0.22);
  return (
    <PlainBg ground={null}>
      <DoughDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} riseProgress={riseP} />
      <Label
        x={CX} y={DIAG_Y - 70} text={t.s3Label} size={54} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 가스가 글루텐 그물에 갇혀 커진다 ---------------- */

export const S4Net: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const netP = progress(f, frames * 0.06, frames * 0.92);
  const labelP = progress(f, frames * 0.28, frames * 0.46);
  return (
    <PlainBg ground={null}>
      <DoughDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} riseProgress={1} netProgress={netP} />
      <Label
        x={CX} y={DIAG_Y - 70} text={t.s4Label} size={54} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론 - 반죽 전체가 풍선처럼 부풀어 오르는 정지 컷 ---------------- */

export const S5Balloon: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const swellP = progress(f, frames * 0.04, frames * 0.7);
  return (
    <PlainBg ground={null}>
      <DoughDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        riseProgress={1} netProgress={1} swellProgress={swellP}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 오븐 안에서 한 번 더 부풀고 표면이 갈색으로 굳는다 ---------------- */

/** 2026-09-02 검수에서 최대 팽창 시(swellProgress=1 + bakeProgress 팽창분 누적) 반죽
 *  돔 꼭대기가 오븐 상자 위쪽 테두리를 살짝 뚫고 나오는 결함이 발견됐다. 상자를 위/좌우로
 *  더 넉넉하게 키워 여유를 뒀다(발열체 막대 위치는 그대로 유지) */
const OVEN_X = DIAG_X - 160;
const OVEN_Y = DIAG_Y - 240;
const OVEN_W = DIAG_WIDTH + 320;
const OVEN_H = DIAG_WIDTH * (680 / 700) + 220 + 150;

export const S6Bake: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const bakeP = progress(f, frames * 0.1, frames * 0.94);
  // 발열체 은은한 깜빡임(결정적 - Math.random 미사용, 원칙 3)
  const glow = 0.75 + 0.15 * Math.sin(f * 0.22);
  return (
    <PlainBg ground={null} top={C.room} bottom={C.roomDeep}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect
          x={OVEN_X} y={OVEN_Y} width={OVEN_W} height={OVEN_H} rx={36}
          fill="none" stroke={C.ink} strokeWidth={16}
        />
        <rect
          x={OVEN_X + 20} y={OVEN_Y + OVEN_H - 40} width={OVEN_W - 40} height={16} rx={8}
          fill={C.coral} opacity={glow}
        />
      </svg>
      <DoughDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        riseProgress={1} netProgress={1} swellProgress={1} bakeProgress={bakeP}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 오래된 화덕 실루엣이 화면 하단에 살짝 겹쳐지는 장식 컷 ---------------- */

/** 2026-09-02 검수에서 실루엣이 화면 맨 아래 작은 조각만 겨우 보일 만큼 작아 장식 효과가
 *  거의 안 읽히는 문제가 발견됐다. 크게 키워 캡션 자막과 실제로 겹치도록 했다(대본의
 *  "화면 하단에 살짝 겹쳐지는" 의도) */
const OVEN_SIL_CX = CX;
const OVEN_SIL_BASE_Y = H - 40;
const OVEN_SIL_W = 820;
const OVEN_SIL_H = 680;

/** 고대 화덕(토기) 실루엣 - 둥근 돔 몸체 + 아치형 아궁이. 참고 이미지 없이 손으로 그린
 *  단순 도형이라 원칙 0-1 벡터화 대상이 아니다 */
function ancientOvenPath() {
  const cx = OVEN_SIL_CX;
  const baseY = OVEN_SIL_BASE_Y;
  const halfW = OVEN_SIL_W / 2;
  const domeH = OVEN_SIL_H;
  return `
    M ${cx - halfW},${baseY}
    C ${cx - halfW},${baseY - domeH * 0.7} ${cx - halfW * 0.6},${baseY - domeH} ${cx},${baseY - domeH}
    C ${cx + halfW * 0.6},${baseY - domeH} ${cx + halfW},${baseY - domeH * 0.7} ${cx + halfW},${baseY}
    Z
  `;
}

export const S7History: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const slideP = smooth(progress(f, frames * 0.04, frames * 0.4));
  const riseOffset = lerp(120, 0, slideP);
  return (
    <PlainBg ground={null}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g style={{ opacity: slideP }} transform={`translate(0 ${riseOffset})`}>
          <path d={ancientOvenPath()} fill={C.inkSoft} opacity={0.5} />
          <ellipse
            cx={OVEN_SIL_CX} cy={OVEN_SIL_BASE_Y - 140} rx={140} ry={108}
            fill={C.coral} opacity={0.55 * slideP}
          />
        </g>
      </svg>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
