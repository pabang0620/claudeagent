/** 이 화(general-ep01, "차가운 거 먹으면 왜 이마가 아플까") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다.
 */
import React from 'react';
import {
  Actor, Appear, BustActor, C, Caption, FPS, HeadNerveDiagram, IceCream, Label,
  PlainBg, POSES, RIG, SAFE_TOP, ThemedIcon, W, blendPose, breathe, handPos, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS, Locale } from './strings';

const CX = W / 2;

/* ---------------- 자막 헬퍼 ----------------
 * 프로필 규칙(general.md 5절): 한 줄 최대 15자, 넘으면 두 줄로. 영어는 어절 자체가 길어
 * 같은 "글자수" 기준이 어색하므로 화면 폭 기준으로 살짝 더 넉넉하게 잡는다(실측 검수로 확정).
 */
function wrapByChars(words: { w: string }[], maxChars: number): number[] {
  const counts: number[] = [];
  let cur = 0;
  let curLen = 0;
  for (const { w } of words) {
    const nextLen = curLen === 0 ? w.length : curLen + 1 + w.length;
    if (curLen > 0 && nextLen > maxChars) {
      counts.push(cur);
      cur = 1;
      curLen = w.length;
    } else {
      cur += 1;
      curLen = nextLen;
    }
  }
  if (cur > 0) counts.push(cur);
  return counts;
}

export function wrapCounts(words: { w: string }[], locale: Locale): number[] {
  return wrapByChars(words, locale === 'ko' ? 15 : 22);
}

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- S1: 아이스크림 한입 (무성) ---------------- */

const EAT_POSE: Pose = {
  headTilt: -3, lean: 0,
  armL: { s: 92, e: 30 }, armR: { s: -44.83, e: -21.29 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

// 세로 9:16 화면을 캐릭터가 충분히 채우도록 크게 잡는다 (기본 GROUND=1250 은 이 화면비에서
// 너무 작고 위로 치우쳐 보인다 - 육안 검수로 확정한 값).
const ACTOR_SIZE = 1600;
const ACTOR_GROUND = 1370;

export const S1Bite: React.FC<{ f: number }> = ({ f }) => {
  // 아이스크림을 크게 한입 베어 무는 동작: 입이 확 벌어졌다 닫힌다 (한 번의 chomp)
  const bite = Math.max(0, Math.sin(Math.min(1, progress(f, 12, 34)) * Math.PI));
  const mouthOpen = 0.12 + bite * 0.75;

  // Actor 배치 수식과 동일하게 계산해 손 위치에 아이스크림을 정확히 붙인다
  const size = ACTOR_SIZE;
  const centerX = CX;
  const ground = ACTOR_GROUND;
  const top = ground - (1026 * size) / RIG.H; // FEET_VB(1026) 기준, Actor 와 동일한 공식
  const left = centerX - (RIG.CX * size) / RIG.W;
  const hand = handPos('L', EAT_POSE.armL!);
  const scale = size / RIG.W;
  const b = breathe(f, 1);
  const iceX = left + hand.x * scale;
  const iceY = top + hand.y * scale + b.dy;

  return (
    <PlainBg ground={ground} groundColor={C.hill}>
      <div
        style={{
          position: 'absolute', left: iceX - 115, top: iceY - 300,
          transform: `rotate(-18deg) scale(${1 + 0.006 * Math.sin(f / 25)})`,
        }}
      >
        <IceCream width={380} />
      </div>
      <Actor size={size} centerX={centerX} ground={ground} pose={EAT_POSE} mouthOpen={mouthOpen} />
    </PlainBg>
  );
};

/* ---------------- S2: 이마 찌릿 (바스트샷) ---------------- */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

export const S2Forehead: React.FC<{ f: number; locale: Locale }> = ({ f, locale }) => {
  const t = progress(f, 0, 16);
  const pose = blendPose(POSES.idle, POSES.touchForehead, t);
  const iconP = progress(f, 10, 24);
  const labelP = progress(f, 16, 30);
  const label = STRINGS[locale].s2Label;

  return (
    <PlainBg>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} />

      {iconP > 0.001 ? (
        <Appear progress={iconP} from="scale" origin="50% 50%">
          <div
            style={{
              position: 'absolute', left: CX - 70, top: 250, width: 140, height: 140,
              borderRadius: 70, background: C.coralSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${Math.sin(f / 6) * 6}deg)`,
            }}
          >
            <ThemedIcon name="bolt" size={94} color={C.coral} strokePx={12} />
          </div>
        </Appear>
      ) : null}

      {labelP > 0.001 ? (
        <Appear progress={labelP} from="up" distance={30}>
          <Label x={CX} y={405} text={label} size={78} color={C.ink} wrapWidth={880} />
        </Appear>
      ) : null}
    </PlainBg>
  );
};

/* ---------------- S3/S4/S5 공용: 다이어그램 레이아웃 ---------------- */

const DIAG_W = 780;
const DIAG_X = (W - DIAG_W) / 2;
const DIAG_Y = 350;

const DiagramScene: React.FC<{
  f: number;
  lines: CaptionLine[];
  highlightMouth?: boolean;
  highlightForehead?: boolean;
  showNerve?: number;
  signalT?: number;
}> = ({ f, lines, highlightMouth, highlightForehead, showNerve, signalT }) => {
  const t = f / FPS;
  const line = activeLine(lines, t);
  return (
    <PlainBg>
      <HeadNerveDiagram
        f={f}
        width={DIAG_W}
        x={DIAG_X}
        y={DIAG_Y}
        highlightMouth={highlightMouth}
        highlightForehead={highlightForehead}
        showNerve={showNerve}
        signalT={signalT}
      />
      <Caption line={line} t={t} />
    </PlainBg>
  );
};

/** s3: 입천장 냉기 + 혈관 펄스 (이마는 아직 표시 없음) */
export const S3Cold: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => (
  <DiagramScene f={f} lines={lines} highlightMouth />
);

/** s4: 냉기 유지 + 신경선이 그려짐 */
export const S4Nerve: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const nerveP = progress(f, 6, Math.max(7, frames - 10));
  return <DiagramScene f={f} lines={lines} highlightMouth showNerve={nerveP} />;
};

/** s5: 신호가 입천장 -> 뇌 -> 이마로 튀어 이마 통증으로 착각. 마지막에 캐릭터 컷으로 돌아온다 */
export const S5Signal: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const holdFrames = Math.min(34, Math.round(frames * 0.28));
  const diagramEnd = frames - holdFrames;
  const signalT = progress(f, 4, Math.max(5, diagramEnd - 8));
  const foreheadOn = signalT > 0.88;

  // 캐릭터 컷으로 크로스페이드 (마지막 holdFrames 구간)
  const charP = progress(f, diagramEnd - 10, diagramEnd + 6);

  return (
    <PlainBg>
      <div style={{ opacity: 1 - charP }}>
        <HeadNerveDiagram
          f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
          highlightMouth showNerve={1} signalT={signalT} highlightForehead={foreheadOn}
        />
      </div>
      {charP > 0.001 ? (
        <div style={{ opacity: charP }}>
          <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={POSES.touchForehead} />
        </div>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

export const DIAG_LAYOUT = { x: DIAG_X, y: DIAG_Y, w: DIAG_W };
export { SAFE_TOP };
