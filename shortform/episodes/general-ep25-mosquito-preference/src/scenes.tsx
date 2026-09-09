/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(여럿이 있어도 유독 한 사람만 물림) -> s2(이산화탄소 냄새로 멀리서 접근)
 *  -> s3(가까이 오면 피부 냄새로 대상을 고름) -> s4(세균·땀 성분 차이로 사람마다 다름)
 *  -> s5(체온·땀도 영향) -> s6(혈액형 연구도 있음, 확정 아님) -> s7(유전 영향, 일란성 쌍둥이)
 *
 *  어느 장면도 캐릭터가 직접 말하는 순간이 아니라(전부 3인칭 설명 내레이션) mouth.json
 *  립싱크를 쓰지 않는다(ep19/ep21/ep23과 동일 원칙 - rms_mouth.py 는 파이프라인 표준 절차라
 *  ko_mouth.json 은 만들었지만 이 화 어디서도 import 하지 않는다).
 *
 *  모기(Mosquito)는 사실적으로 그리면 징그러워지는 소재라 둥근 몸통 2덩이 + 날개 2장 +
 *  다리 2개 + 눈 1개(원 하나) + 침(단일 선)으로만 구성했다(assets/props/Mosquito.tsx 참고).
 *  이산화탄소·냄새 확산은 점을 흩뿌리지 않고 ScentWaves(호 2~3개)로만 표현한다.
 */
import React from 'react';
import {
  Actor, C, Caption, Card, CardGrid, CompareBars, FONT, FPS, FS, Label, Mosquito, PlainBg, POSES,
  PulseRing, ScentWaves, ThemedIcon,
  clamp01, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------- S1: 여럿이 있어도 유독 한 사람만 물린다 ---------------- */

const S1_CXS = [190, 540, 890];
const S1_SIZE = 400;
const S1_TARGET = 2; // 오른쪽 사람이 선택된다
const S1_TARGET_X = S1_CXS[S1_TARGET];
const S1_HOVER = { x: S1_TARGET_X, y: 900 };
const S1_START = { x: 140, y: 260 };
const S1_ARRIVE = 74;
const S1_RING_START = 58;
const S1_RING_PEAK = 92;
export const S1_RING_SFX_FRAME = 58; // ui_tap - "이 사람"으로 정해지는 순간

export const S1Group: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const approach = progress(f, 0, S1_ARRIVE);
  const arcLift = Math.sin(approach * Math.PI) * -70;
  let mx = lerp(S1_START.x, S1_HOVER.x, approach);
  let my = lerp(S1_START.y, S1_HOVER.y, approach) + arcLift;
  if (f > S1_ARRIVE) {
    const orbitT = (f - S1_ARRIVE) * 0.14;
    mx = S1_HOVER.x + Math.cos(orbitT) * 30;
    my = S1_HOVER.y + Math.sin(orbitT) * 18;
  }
  const ringP = progress(f, S1_RING_START, S1_RING_PEAK);
  const ringSize = 520;

  return (
    <PlainBg>
      <PulseRing
        x={S1_TARGET_X - ringSize / 2} y={1080 - ringSize / 2} size={ringSize}
        frame={f} progress={ringP} color={C.coralSoft} opacity={0.6}
      />
      {S1_CXS.map((cx, i) => (
        <Actor key={i} size={S1_SIZE} centerX={cx} pose={POSES.idle} blinkOffset={i * 30} />
      ))}
      <Mosquito f={f} width={110} x={mx} y={my} landed={0} angle={Math.sin(f * 0.12) * 8} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S2: 이산화탄소 냄새로 멀리서부터 접근 ---------------- */

const S2_BUST_SIZE = 800;
const S2_BUST_LEFT = 90;
const S2_BUST_TOP = 540;
const S2_BREATH_X = 660;
const S2_BREATH_Y = 1000;
const S2_LABEL_X = 840;
const S2_LABEL_Y = 760;

export const S2Breath: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const waveP = progress(f, 16, 96);
  const labelP = progress(f, 34, 58);
  const mosqP = progress(f, 88, 158);
  const mx = lerp(1000, 760, mosqP);
  const my = lerp(760, 900, mosqP) + Math.sin(mosqP * Math.PI) * -30;

  return (
    <PlainBg>
      <Actor size={S2_BUST_SIZE} centerX={S2_BUST_LEFT + S2_BUST_SIZE / 2} pose={POSES.idle} breathAmp={1.6} />
      <ScentWaves cx={S2_BREATH_X} cy={S2_BREATH_Y} angle={-18} count={3} spread={300} progress={waveP} />
      <div
        style={{
          position: 'absolute', left: S2_LABEL_X, top: S2_LABEL_Y,
          transform: `translate(-50%, ${(1 - clamp01(labelP)) * -14}px) scale(${0.85 + 0.15 * clamp01(labelP)})`,
          opacity: clamp01(labelP), fontFamily: FONT, fontWeight: 800, fontSize: FS.label, color: C.ink,
          whiteSpace: 'nowrap', wordBreak: 'keep-all',
        }}
      >
        {label}
      </div>
      {mosqP > 0.001 ? (
        <Mosquito f={f} width={130} x={mx} y={my} landed={0} angle={-14} style={{ opacity: Math.min(1, mosqP * 3) }} />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 가까이 오면 피부 냄새로 대상을 고른다 ---------------- */

const S3_SKIN = { x: 140, y: 760, w: 800, h: 360 };
const S3_MOSQ_X = 540;

export const S3SkinDetect: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const skinP = progress(f, 0, 20);
  const landedP = progress(f, 24, 78);
  const my = lerp(680, 810, landedP);
  const sniffP = progress(f, 30, 70);
  const labelP = progress(f, 26, 50);

  return (
    <PlainBg>
      <div
        style={{
          position: 'absolute', left: S3_SKIN.x, top: S3_SKIN.y, width: S3_SKIN.w, height: S3_SKIN.h,
          borderRadius: 60, background: C.hillFar, border: `13px solid ${C.ink}`,
          opacity: skinP, transform: `scale(${0.92 + 0.08 * skinP})`, transformOrigin: '50% 50%',
        }}
      />
      <ScentWaves
        cx={S3_MOSQ_X - 70} cy={my - 10} angle={180} count={2} spread={90} fanDeg={26}
        progress={sniffP > 0.001 ? 0.4 + 0.6 * ((f % 26) / 26) : 0}
      />
      <Mosquito f={f} width={260} x={S3_MOSQ_X} y={my} landed={landedP} angle={4} />
      <div
        style={{
          position: 'absolute', left: S3_MOSQ_X, top: 560,
          transform: `translate(-50%, ${(1 - clamp01(labelP)) * -14}px) scale(${0.85 + 0.15 * clamp01(labelP)})`,
          opacity: clamp01(labelP), fontFamily: FONT, fontWeight: 800, fontSize: FS.label, color: C.ink,
          whiteSpace: 'nowrap', wordBreak: 'keep-all',
        }}
      >
        {label}
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S3_SNIFF_SFX_FRAME = 58;

/* ---------------- S4: 세균·땀 성분이 사람마다 달라서 입맛이 다르다 ---------------- */

const S4_BAR_X = 170;
const S4_BAR_Y = 760;

export const S4CompareSkin: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; labelA: string; labelB: string;
}> = ({ f, frames, lines, labelA, labelB }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mosqP = progress(f, 96, 150);
  const targetX = S4_BAR_X + 9 * 58 + 30;
  const mx = lerp(900, targetX, mosqP);
  const my = lerp(860, S4_BAR_Y + 148 + 26, mosqP);

  return (
    <PlainBg>
      <CompareBars
        x={S4_BAR_X} y={S4_BAR_Y} pxPerUnit={58} frame={f}
        items={[
          { label: labelA, value: 4, color: C.goldSoft, at: 22 },
          { label: labelB, value: 9, color: C.coral, at: 38 },
        ]}
      />
      {mosqP > 0.001 ? (
        <Mosquito f={f} width={110} x={mx} y={my} landed={0} angle={Math.sin(f * 0.12) * 6} style={{ opacity: Math.min(1, mosqP * 3) }} />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 체온·땀도 영향을 준다 ---------------- */

const S5_ACTOR_SIZE = 560;
const S5_ICON_Y = 760;
const S5_ICON_SIZE = 180;

export const S5TempSweat: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; labelTemp: string; labelSweat: string;
}> = ({ f, frames, lines, labelTemp, labelSweat }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const tempP = progress(f, 4, 26);
  const sweatP = progress(f, 26, 48);

  return (
    <PlainBg>
      <Actor size={S5_ACTOR_SIZE} centerX={CX} pose={POSES.idle} />
      <div
        style={{
          position: 'absolute', left: 260 - S5_ICON_SIZE / 2, top: S5_ICON_Y - S5_ICON_SIZE / 2,
          width: S5_ICON_SIZE, height: S5_ICON_SIZE,
          opacity: clamp01(tempP), transform: `scale(${0.6 + 0.4 * clamp01(tempP)})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="thermometer" size={S5_ICON_SIZE} color={C.coral} />
      </div>
      <Label x={260} y={S5_ICON_Y + S5_ICON_SIZE / 2 + 18} text={labelTemp} size={FS.small} style={{ opacity: clamp01(tempP) }} />
      <div
        style={{
          position: 'absolute', left: 820 - S5_ICON_SIZE / 2, top: S5_ICON_Y - S5_ICON_SIZE / 2,
          width: S5_ICON_SIZE, height: S5_ICON_SIZE,
          opacity: clamp01(sweatP), transform: `scale(${0.6 + 0.4 * clamp01(sweatP)})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="droplet" size={S5_ICON_SIZE} color={C.waterCool} />
      </div>
      <Label x={820} y={S5_ICON_Y + S5_ICON_SIZE / 2 + 18} text={labelSweat} size={FS.small} style={{ opacity: clamp01(sweatP) }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 혈액형에 따라 다르다는 연구도 있다(확정 아님) ---------------- */

const S6_CARD_SIZE = 200;
const S6_CARD_GAP = 24;
const S6_CARD_Y = 780;
const S6_CARDS = ['O', 'A', 'B', 'AB'];

function s6CardX() {
  const total = S6_CARDS.length * S6_CARD_SIZE + (S6_CARDS.length - 1) * S6_CARD_GAP;
  return (1080 - total) / 2;
}

export const S6BloodType: React.FC<{ f: number; frames: number; lines: CaptionLine[]; note: string }> = ({
  f, frames, lines, note,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const noteP = progress(f, 52, 76);

  return (
    <PlainBg>
      <CardGrid
        items={S6_CARDS.map((k) => ({
          key: k,
          art: (
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, color: C.ink }}>{k}</div>
          ),
        }))}
        x={s6CardX()} y={S6_CARD_Y} size={S6_CARD_SIZE} gap={S6_CARD_GAP} columns={4}
        appearAt={(i) => 6 + i * 10} frame={f}
      />
      <Label
        x={CX} y={S6_CARD_Y + S6_CARD_SIZE + 46} text={note} size={FS.small} color={C.inkSoft}
        style={{ opacity: clamp01(noteP) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S6_CARD_SFX_FRAME = 44; // 마지막(AB) 카드가 튀어나오는 시점 근방

/* ---------------- S7: 유전 영향, 일란성 쌍둥이는 비슷하게 물린다 ---------------- */

const S7_LEFT_CX = 300;
const S7_RIGHT_CX = 780;
const S7_SIZE = 460;
const S7_BADGE_X = CX;
const S7_BADGE_Y = 500;

function pillBadgeStyle(x: number, y: number, p: number): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `translateX(-50%) translateY(${(1 - cp) * -16}px) scale(${0.85 + 0.15 * cp})`,
    opacity: cp, background: C.gold, border: `9px solid ${C.ink}`,
    borderRadius: 999, padding: '12px 34px', fontFamily: FONT, fontWeight: 700,
    fontSize: FS.small, color: C.ink, whiteSpace: 'nowrap', wordBreak: 'keep-all',
  };
}

export const S7Twins: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mosqP = progress(f, 62, 88);
  const badgeP = progress(f, 60, 82);
  const headY = S7_BADGE_Y + 300;

  return (
    <PlainBg>
      <Actor size={S7_SIZE} centerX={S7_LEFT_CX} pose={POSES.idle} />
      <Actor size={S7_SIZE} centerX={S7_RIGHT_CX} pose={POSES.idle} blinkOffset={40} />
      {mosqP > 0.001 ? (
        <>
          <Mosquito f={f} width={90} x={S7_LEFT_CX} y={headY} landed={0.6} style={{ opacity: Math.min(1, mosqP * 3) }} />
          <Mosquito f={f + 6} width={90} x={S7_RIGHT_CX} y={headY} landed={0.6} style={{ opacity: Math.min(1, mosqP * 3) }} />
        </>
      ) : null}
      <div style={pillBadgeStyle(S7_BADGE_X, S7_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S7_MOSQ_SFX_FRAME = 62;
