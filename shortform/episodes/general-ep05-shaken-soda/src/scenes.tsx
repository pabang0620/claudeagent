/** 이 화(general-ep05, "탄산음료 흔든 뒤 따면 넘치는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 */
import React from 'react';
import {
  Actor, C, CAN_GRIP, Caption, CompareBars, FEET_VB, FPS, FlashOverlay, PlainBg, POSES,
  RIG, Shake, SodaCan, Sparkles, W, breathe, handPos, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- S1: 흔들고 개봉 - 분출 (무성) ---------------- */

const ACTOR_SIZE = 1550;
const ACTOR_GROUND = 1380;
const CAN_WIDTH = 380;
const CAN_HOLD_ROTATE = -10;

// 흔드는 동작 - 30프레임(1초)에 걸쳐 흔들고, 그 직후 짧게 열어 분출한다 (총 60프레임 = 2.0초)
const SHAKE_START = 4;
const SHAKE_DURATION = 30;
const SHAKE_END = SHAKE_START + SHAKE_DURATION; // 34
const OPEN_START = 38;
const OPEN_END = 46;
/** bite/cold_zing 과 동일한 방식(builder 원칙 7) - 애니메이션 정점(개봉 순간)에 정확히 맞춰
 *  fizz_open.mp3 를 재생한다. Episode.tsx 가 이 상수를 그대로 가져다 쓴다. */
export const S1_BURST_PEAK_LOCAL = OPEN_END;

export const S1Burst: React.FC<{ f: number }> = ({ f }) => {
  const shakenAmt = progress(f, SHAKE_START, SHAKE_END - 4);
  const openAmt = progress(f, OPEN_START, OPEN_END);

  // Actor 가 내부적으로 쓰는 배치 공식과 동일하게 계산해 손 위치에 캔을 정확히 붙인다
  // (props/IceCream.tsx 를 쓴 general-ep01 의 S1Bite 와 동일한 패턴).
  const size = ACTOR_SIZE;
  const centerX = CX;
  const ground = ACTOR_GROUND;
  const top = ground - (FEET_VB * size) / RIG.H;
  const left = centerX - (RIG.CX * size) / RIG.W;
  const hand = handPos('L', POSES.present.armL!);
  const scale = size / RIG.W;
  const b = breathe(f, 1);
  const canX = left + hand.x * scale;
  const canY = top + hand.y * scale + b.dy;

  const canScale = CAN_WIDTH / 300;
  const gripX = CAN_GRIP.x * canScale;
  const gripY = CAN_GRIP.y * canScale;

  const burstT = f >= S1_BURST_PEAK_LOCAL - 2
    ? progress(f, S1_BURST_PEAK_LOCAL - 2, S1_BURST_PEAK_LOCAL + 26)
    : 0;

  return (
    <PlainBg ground={ground} groundColor={C.hill}>
      <Shake frame={f} at={SHAKE_START} duration={SHAKE_DURATION} amp={12}>
        <Actor size={size} centerX={centerX} ground={ground} pose={POSES.present} />
        <div
          style={{
            position: 'absolute', left: canX - gripX, top: canY - gripY,
            transformOrigin: `${gripX}px ${gripY}px`,
            transform: `rotate(${CAN_HOLD_ROTATE}deg)`,
          }}
        >
          <SodaCan width={CAN_WIDTH} shaken={shakenAmt} open={openAmt} />
        </div>
      </Shake>

      <FlashOverlay frame={f} at={S1_BURST_PEAK_LOCAL} color={C.paper} peak={0.65} rise={3} fall={14} />
      {burstT > 0.001 ? (
        <Sparkles box={{ x: canX - 200, y: canY - 300, w: 400, h: 340 }} t={burstT} scale={1.1} />
      ) : null}
    </PlainBg>
  );
};

/* ---------------- S2: 압력 통념 반박 - 비교 막대 ---------------- */

/** v1 검수에서 발견: 작은 캔 아이콘을 s2 상단에 두면, s3/s4 의 큰 캔(DIAG_CAN_X/Y, 620px)과
 *  화면상 같은 자리(상단~중단)를 차지해서 크로스페이드 0.2초 동안 "크기가 다른 캔 두 개가
 *  겹쳐 보이는" 잔상이 생긴다(out/preview-ep05/xfade_349.png 실측). 캔은 s1·s3·s4 에서 이미
 *  충분히 보여주므로 s2 는 비교 막대만으로 승부한다 - 막대는 추상적 그래픽이라 큰 캔과
 *  겹쳐도 "물체 두 개가 부딪힌" 것처럼 읽히지 않는다. */
export const S2Compare: React.FC<{
  f: number; lines: CaptionLine[]; beforeLabel: string; afterLabel: string;
}> = ({ f, lines, beforeLabel, afterLabel }) => {
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg ground={null}>
      {/* 두 막대를 같은 색으로 맞춘다 - "거의 같다"가 메시지인데 색까지 다르면(예: 빈 막대
       *  vs 꽉 찬 막대) 길이는 비슷해도 "전/후가 확 다르다"는 잘못된 인상을 줄 수 있다.
       *  길이 차이(5%)만으로 비교가 읽히게 둘 다 coral 로 통일했다. */}
      <CompareBars
        x={190}
        y={760}
        pxPerUnit={7}
        rowGap={260}
        labelGap={64}
        frame={f}
        items={[
          { label: beforeLabel, value: 100, color: C.coral, thickness: 78, at: 8 },
          { label: afterLabel, value: 95, color: C.coral, thickness: 78, at: 20 },
        ]}
      />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 기포가 벽 -> 음료 속으로 흩어짐 ---------------- */

const DIAG_CAN_WIDTH = 620;
const DIAG_CAN_X = CX - DIAG_CAN_WIDTH / 2;
const DIAG_CAN_Y = 470;

export const S3Scatter: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const shakenAmt = progress(f, 6, Math.max(7, frames - 10));
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg ground={null}>
      <div style={{ position: 'absolute', left: DIAG_CAN_X, top: DIAG_CAN_Y }}>
        <SodaCan width={DIAG_CAN_WIDTH} shaken={shakenAmt} open={0} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 뚜껑 여는 순간 다수 지점에서 동시에 분출 (s1 과 순환) ---------------- */

/** open 이 열리는 구간을 씬 길이(frames)에 비례해 계산한다 - s4 는 언어별로 길이가 달라
 *  scenes.tsx 와 Episode.tsx(효과음 배치) 양쪽에서 같은 공식을 써야 어긋나지 않는다. */
export function s4OpenWindow(frames: number) {
  const end = frames - 10;
  const start = Math.max(6, end - 16);
  return { start, end };
}

export const S4AllAtOnce: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const { start, end } = s4OpenWindow(frames);
  const openAmt = progress(f, start, end);
  const line = activeLine(lines, f / FPS);

  const burstT = f >= end - 2 ? progress(f, end - 2, end + 24) : 0;
  const canMidX = DIAG_CAN_X + DIAG_CAN_WIDTH / 2;

  return (
    <PlainBg ground={null}>
      <div style={{ position: 'absolute', left: DIAG_CAN_X, top: DIAG_CAN_Y }}>
        <SodaCan width={DIAG_CAN_WIDTH} shaken={1} open={openAmt} />
      </div>

      <FlashOverlay frame={f} at={end} color={C.paper} peak={0.7} rise={3} fall={16} />
      {burstT > 0.001 ? (
        <>
          <Sparkles box={{ x: DIAG_CAN_X - 60, y: DIAG_CAN_Y - 40, w: 260, h: 260 }} t={burstT} scale={0.9} />
          <Sparkles box={{ x: canMidX - 150, y: DIAG_CAN_Y - 70, w: 300, h: 300 }} t={burstT} scale={1.15} />
          <Sparkles
            box={{ x: DIAG_CAN_X + DIAG_CAN_WIDTH - 200, y: DIAG_CAN_Y - 40, w: 260, h: 260 }}
            t={burstT} scale={0.9}
          />
        </>
      ) : null}

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
