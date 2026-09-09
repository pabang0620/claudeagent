/** 이 화(general-ep43, "라면이 다 꼬불꼬불한 이유") 전용 장면.
 *
 *  s1(무성 - 봉지를 뜯어 마른 면 덩어리를 꺼냄) -> s2(리액션+훅 "처음부터 이렇게
 *  꼬불꼬불했나", 바스트샷 유성 - 립싱크 연결) -> s3(NoodleDiagram waveProgress 0->1,
 *  곧은 가닥이 왼쪽부터 접히며 구불구불해짐) -> s4(waveProgress=1 고정 + flowProgress로
 *  틈 사이 뜨거운 바람) -> s5(flowMode='water'로 틈 사이 물 + 타이머 "3분") -> s6
 *  (NoodleCupFit cupFit 0->1, 컵 단면에 빈틈없이 들어참) -> s7(흑백톤 회상 + "1958년").
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 곧은 면과 꼬불꼬불한 면의 대비가 중심이다
 *  (NoodleDiagram의 waveProgress 스윕이 한 애니메이션 안에서 곧은 구간과 파형 구간을 동시에
 *  보여준다). 면발은 굵은 선 4가닥(NoodleDiagram STRAND_COUNT)만 쓰고 가는 선 다발을 쓰지
 *  않는다. 봉지 안에 면이 담기는 것/물이 스며드는 것은 큰 도형 몇 개로만 표현한다(s1 봉지
 *  = 사각형 3장, s5 물방울 = 큰 물방울 도형 5개). 음식 소재라 먹음직스럽고 깔끔하게 그린다
 *  (면발 색은 gold 계열, 자극적인 색 안 씀).
 */
import React from 'react';
import {
  BustActor, C, Caption, FPS, Label, NOODLE_CUP_VB_H, NOODLE_CUP_VB_W, NOODLE_VB_H,
  NOODLE_VB_W, NoodleCupFit, NoodleDiagram, PlainBg, POSES, PopIn, ThemedIcon, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* 공용 다이어그램 배치(s3/s4가 같은 자리를 써서 장면 전환에도 위치가 안 튄다) */
const DIAG_W = 860;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 560;

/* ================================================================
 * S1: 무성 - 봉지를 뜯어 마른 면 덩어리를 꺼냄
 * ================================================================ */

const BAG_W = 700;
const BAG_X = CX - BAG_W / 2;
const BAG_TOP = 520;
const BAG_TEAR_Y = 650;
const BAG_BOTTOM = 1280;

/** 뜯긴 봉지 상단 가장자리 - 고정된 지그재그 패턴(결정론, Math.random 미사용) */
const TEAR_OFFSETS = [0, -16, 8, -24, 4, -18, 10, -14, 0];
function tearPath(topY: number) {
  const n = TEAR_OFFSETS.length - 1;
  const pts = TEAR_OFFSETS.map((dy, i) => {
    const xx = BAG_X + (i / n) * BAG_W;
    return `${i === 0 ? 'M' : 'L'} ${xx.toFixed(1)} ${(topY + dy).toFixed(1)}`;
  });
  return pts.join(' ');
}

const BLOCK_W = 460;

export const S1RamenPull: React.FC<{ f: number }> = ({ f }) => {
  const riseT = progress(f, 12, 62);
  const smooth = riseT * riseT * (3 - 2 * riseT);
  // 봉지 안(거의 안 보임) -> 찢어진 부분 위로 완전히 드러남
  const blockTop = BAG_TEAR_Y + 60 - smooth * 320;

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      {/* 봉지 뒤판 */}
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect
          x={BAG_X} y={BAG_TOP} width={BAG_W} height={BAG_BOTTOM - BAG_TOP} rx={26}
          fill={C.room} stroke={C.ink} strokeWidth={13}
        />
      </svg>

      {/* 면 덩어리 - 이미 완성된 구불한 형태(waveProgress=1)를 작게 잘라 보여줌 */}
      <div
        style={{
          position: 'absolute', left: CX - BLOCK_W / 2, top: blockTop,
          width: BLOCK_W, height: BLOCK_W * (NOODLE_VB_H / NOODLE_VB_W) * 0.62,
          overflow: 'hidden',
        }}
      >
        <NoodleDiagram
          width={BLOCK_W * 1.35} x={-BLOCK_W * 0.175} y={-40} waveProgress={1}
        />
      </div>

      {/* 봉지 앞판(찢어진 입구 아래쪽만) - 면 덩어리 아랫부분을 가려 "봉지 속에서 꺼내는" 느낌 */}
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path
          d={`${tearPath(BAG_TEAR_Y)} L ${BAG_X + BAG_W} ${BAG_BOTTOM} L ${BAG_X} ${BAG_BOTTOM} Z`}
          fill={C.room} opacity={0.94} stroke={C.ink} strokeWidth={9}
        />
        <circle cx={CX} cy={BAG_TEAR_Y + 230} r={54} fill={C.coral} opacity={0.85} />
      </svg>
    </PlainBg>
  );
};

/* ================================================================
 * S2: 리액션 - "처음부터 이렇게 꼬불꼬불했나" (바스트샷, 립싱크 연결)
 * ================================================================ */

const S2_SIZE = 900;
const S2_LEFT = CX - S2_SIZE / 2;
const S2_TOP = 420;

export const S2Wonder: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const reactT = progress(f, 0, 20);
  const smoothT = reactT * reactT * (3 - 2 * reactT);
  const pose: Pose = blendPose({}, POSES.thinking, smoothT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg>
      <BustActor size={S2_SIZE} left={S2_LEFT} top={S2_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 곧은 면이 벨트 위에서 구불구불하게 접힘 (waveProgress 0->1)
 * ================================================================ */

export const S3Fold: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const waveProgress = progress(f, 10, frames - 40);
  const labelP = progress(f, frames - 34, frames - 10);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <NoodleDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} waveProgress={waveProgress} />
      <Label x={CX} y={370} text={t.s3Label} size={54} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 틈 사이로 뜨거운 바람이 골고루 통과 (waveProgress=1 고정 + flowProgress)
 * ================================================================ */

export const S4Dry: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const flowProgress = f / FPS; // 계속 순환(내부에서 mod 처리)
  const labelP = progress(f, 6, 30);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <NoodleDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} waveProgress={1}
        flowProgress={flowProgress} flowMode="heat"
      />
      <Label x={CX} y={370} text={t.s4Label} size={54} color={C.ink} style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 틈 사이로 물이 훨씬 빨리 스며듦 + 타이머 "3분"
 * ================================================================ */

export const S5Soak: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const flowProgress = f / FPS;
  const badgeP = progress(f, 14, 40);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <NoodleDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y} waveProgress={1}
        flowProgress={flowProgress} flowMode="water"
      />
      <PopIn cx={CX + 260} cy={340} size={110} progress={badgeP} fromScale={0.3}>
        <ThemedIcon name="clock" size={110} color={C.waterCool} />
      </PopIn>
      <Label
        x={CX + 260} y={410} text={t.s5Label} size={56} color={C.waterCool}
        style={{ opacity: badgeP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 컵라면 - 원형 컵 단면에 빈틈없이 들어참 (cupFit 0->1)
 * ================================================================ */

const CUP_W = 700;
const CUP_X = CX - CUP_W / 2;
const CUP_Y = 540;
/** cupFit이 이 값에 도달하면 "쏙" 맞아떨어지는 소리(ui_tap)를 재생 - Episode.tsx가 이
 *  비율로 SFX 프레임을 계산한다 */
export const S6_FIT_SFX_AT = 0.72;

export const S6CupFit: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const cupFit = progress(f, 12, Math.round(frames * S6_FIT_SFX_AT));
  const labelP = progress(f, Math.round(frames * S6_FIT_SFX_AT), Math.round(frames * S6_FIT_SFX_AT) + 22);

  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} ground={null}>
      <NoodleCupFit width={CUP_W} x={CUP_X} y={CUP_Y} cupFit={cupFit} />
      <Label
        x={CX} y={CUP_Y + CUP_W * (NOODLE_CUP_VB_H / NOODLE_CUP_VB_W) + 40} text={t.s6Label}
        size={56} color={C.ink} style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 흑백톤 회상 - "1958년"
 * ================================================================ */

export const S7History: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const fadeIn = progress(f, 0, 24);
  const badgeP = progress(f, 30, 56);

  return (
    <PlainBg top={C.browningSoft} bottom={C.room} ground={null}>
      <div style={{ opacity: fadeIn, filter: 'grayscale(0.7) sepia(0.3)' }}>
        <NoodleDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y + 40} waveProgress={1} />
      </div>
      <PopIn cx={CX - 190} cy={380} size={100} progress={badgeP} fromScale={0.3}>
        <ThemedIcon name="history" size={100} color={C.ink} />
      </PopIn>
      <Label x={CX + 60} y={330} text={t.s7Label} size={70} color={C.ink} style={{ opacity: badgeP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
