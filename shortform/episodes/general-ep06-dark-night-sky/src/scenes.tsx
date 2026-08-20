/** 이 화(general-ep06, "온통 별인데 밤하늘이 캄캄한 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  전 장면이 밤하늘(NightSkyBg) 위에서 진행되는 단일 배경 화이므로, 배경+디밍을 한 번에 처리하는
 *  로컬 `Sky` 래퍼를 두고 모든 씬이 재사용한다(REGISTRY 규칙 2 - 에피소드 전용 조합, 라이브러리
 *  등록 불필요. NightSkyBg 자체는 이미 공용 자산).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, Appear, BustActor, C, Card, Caption, CountUp, FPS, FS, H, Label, NightSkyBg,
  POSES, SpeechBubble, StarlightDiagram, ThemedIcon, W, blendPose, mouthAt, mouthProp,
  popIn, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

/** 이 화는 전 장면이 밤하늘(어두운) 배경이라, 캐릭터의 팔·다리(채움 없이 색선만 그려지는
 *  Bone 요소)가 배경과 명암 대비가 낮아 잘 안 보이는 문제가 있었다(6화 사용자 피드백,
 *  2026-08-10). 스트로크 색 자체를 바꾸면 얼굴(눈·입) 디테일까지 같이 흐려지므로, 대신
 *  캐릭터 전체에 옅은 크림색 외곽 발광(글로우)을 CSS drop-shadow 로 얹는다 - 원본 ink 선은
 *  그대로 두고 실루엣 알파를 따라 밝은 halo만 추가되므로 얼굴 디테일은 안 바뀌고 가는
 *  팔다리 선만 배경과 확실히 분리되어 보인다(shortform-builder 원칙 5 예방책 (a)). 이
 *  에피소드 로컬 스타일이라 character/Actor.tsx 등 공용 컴포넌트는 건드리지 않는다. */
const NIGHT_GLOW_STYLE: React.CSSProperties = {
  filter:
    'drop-shadow(0 0 4px rgba(255,244,228,0.95)) drop-shadow(0 0 12px rgba(255,244,228,0.6)) drop-shadow(0 0 22px rgba(255,244,228,0.35))',
};

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- 공용 배경 래퍼 ---------------- */

const Sky: React.FC<{
  f: number;
  stars?: number;
  moon?: number | null;
  horizon?: number | null;
  dim?: number;
  children?: React.ReactNode;
}> = ({ f, stars = 60, moon = 0.55, horizon = null, dim = 0, children }) => (
  <AbsoluteFill>
    <NightSkyBg stars={stars} frame={f} moon={moon} horizon={horizon} />
    {dim > 0 ? <AbsoluteFill style={{ background: C.night, opacity: dim }} /> : null}
    {children}
  </AbsoluteFill>
);

/* ---------------- S1: 하늘 올려다보기 (무성) ---------------- */

const ACTOR_SIZE = 900;
const ACTOR_GROUND = 1650;
const LOOK_UP_POSE: Pose = { ...POSES.idle, headTilt: -16 };

export const S1Look: React.FC<{ f: number }> = ({ f }) => (
  <Sky f={f} stars={60} moon={0.6} horizon={1650}>
    <Actor
      size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={LOOK_UP_POSE} breathAmp={1}
      style={NIGHT_GLOW_STYLE}
    />
  </Sky>
);

/* ---------------- S2: 놀란 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const BUST_SIZE = 950;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 430;

export const S2Surprised: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <Sky f={f} stars={60} moon={0.6} horizon={null}>
      <BustActor
        size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen}
        style={NIGHT_GLOW_STYLE}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S3: 눈에 보이는 별 개수 -> 도시 불빛 -> 은하 전체 개수 ---------------- */

/** 결정적 의사난수 (NightSkyBg 와 동일 mulberry32). 밀도 연출용 - "우리 은하엔 훨씬 많다" 를
 *  보여주는 장식용 추가 별점이라 라이브러리로 승격하지 않는다(REGISTRY 규칙 2, 에피소드 로컬). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DENSE_PTS = (() => {
  const r = mulberry32(311);
  return Array.from({ length: 150 }, () => ({
    x: r() * W, y: r() * H * 0.82, s: 0.8 + r() * 2.2, ph: r() * Math.PI * 2,
  }));
})();

const DenseStars: React.FC<{ f: number; opacity: number }> = ({ f, opacity }) => {
  if (opacity <= 0.001) return null;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {DENSE_PTS.map((p, i) => {
        const tw = 0.5 + 0.5 * Math.sin(f / 11 + p.ph);
        return <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={C.cream} opacity={opacity * (0.3 + 0.5 * tw)} />;
      })}
    </svg>
  );
};

export const S3Count: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; cityLabel: string;
  countPrefix: string; countSuffix: string; finalTo: number; finalSuffix: string;
}> = ({ f, frames, lines, cityLabel, countPrefix, countSuffix, finalTo, finalSuffix }) => {
  const cityIn = progress(f, frames * 0.30, frames * 0.46);
  const cityOut = progress(f, frames * 0.60, frames * 0.74);
  const cityOpacity = cityIn * (1 - cityOut) * 0.85;

  const countOp = Math.max(0, Math.min(1, progress(f, 6, frames * 0.16)) - cityIn);
  const cityLabelOp = cityIn * (1 - progress(f, frames * 0.58, frames * 0.66));
  const finalOp = progress(f, frames * 0.76, frames * 0.92);

  return (
    <Sky f={f} stars={60} moon={null} horizon={null}>
      {cityOpacity > 0.001 ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(to top, rgba(255,180,80,${cityOpacity}) 0%, rgba(255,180,80,0) 62%)`,
          }}
        />
      ) : null}

      <DenseStars f={f} opacity={finalOp} />

      {countOp > 0.001 ? (
        <div style={{ opacity: countOp }}>
          <CountUp x={CX} y={760} to={9096} frame={f} at={8} duration={40} size={96} color={C.cream}
            prefix={countPrefix} suffix={countSuffix} commas width={960} style={{ whiteSpace: 'nowrap' }} />
        </div>
      ) : null}
      {cityLabelOp > 0.001 ? (
        <div style={{ opacity: cityLabelOp }}>
          <Label x={CX} y={780} text={cityLabel} size={100} color={C.cream} />
        </div>
      ) : null}
      {finalOp > 0.001 ? (
        <div style={{ opacity: finalOp }}>
          <CountUp x={CX} y={760} to={finalTo} frame={f} at={Math.round(frames * 0.76)} duration={26}
            size={96} color={C.gold} suffix={finalSuffix} width={960} style={{ whiteSpace: 'nowrap' }} />
        </div>
      ) : null}

      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S4 / S10 공용: 카드(연도 뱃지 + 이름 + 아이콘) ---------------- */

const CARD_W = 620;
const CARD_H = 760;
const CARD_X = CX - CARD_W / 2;
const CARD_Y = 480;
/** 뱃지 원 크기. Card 의 기본 badgeSize(86)는 "1위" 류 2글자용이라 4자리 연도("1610")가
 *  넘친다(v1 검수에서 실측). 원을 키우고 폰트는 별도 span 으로 작게 고정해 넘치지 않게 한다. */
const YEAR_BADGE_SIZE = 128;
const YearBadge: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ fontSize: 40, lineHeight: 1 }}>{text}</span>
);

export const S4Kepler: React.FC<{ f: number; lines: CaptionLine[]; badge: string; label: string }> = (
  { f, lines, badge, label }
) => (
  <Sky f={f} stars={40} moon={null} horizon={null} dim={0.28}>
    <Card
      x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} progress={popIn(f, FPS, 4)}
      badge={<YearBadge text={badge} />} badgeSize={YEAR_BADGE_SIZE} label={label}
      bg={C.nightMid} border={C.cream} labelColor={C.cream} badgeColor={C.gold}
    >
      <ThemedIcon name="telescope" size={220} color={C.cream} />
    </Card>
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
  </Sky>
);

export const S10Poe: React.FC<{ f: number; lines: CaptionLine[]; badge: string; label: string }> = (
  { f, lines, badge, label }
) => (
  <Sky f={f} stars={40} moon={null} horizon={null} dim={0.28}>
    <Card
      x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} progress={popIn(f, FPS, 4)}
      badge={<YearBadge text={badge} />} badgeSize={YEAR_BADGE_SIZE} label={label}
      bg={C.nightMid} border={C.cream} labelColor={C.cream} badgeColor={C.gold}
    >
      <ThemedIcon name="feather" size={200} color={C.cream} />
    </Card>
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
  </Sky>
);

/* ---------------- S5: 케플러 라벨 취소선 -> 올베르스의 역설 팝인 (v6 신규 연출) ----------------
 * v5까지는 케플러 카드가 단순 크로스페이드로 사라졌는데, "이 역설에는 케플러 이름이 안
 * 붙어 있다"는 내레이션과 화면이 안 맞는다는 지적(v6 사유 3)을 반영해 "이름이 안 붙었다"를
 * 취소선으로 직접 보여주도록 바꿨다. 기존 Card/Appear/Label을 그대로 재사용하고, 취소선
 * 모션만 이 화 로컬 컴포넌트로 새로 만든다(REGISTRY 규칙 2 - 재사용 패턴이 다시 필요해지면
 * 그때 props/로 승격 검토). */

/** 취소선 전용 로컬 색 - "옅은 빨간 취소선"(대본 s5 화면 지시). theme.ts 에 빨간 계열 토큰이
 *  없고 이 연출 하나에만 쓰이므로 전역 토큰으로 승격하지 않고 이 파일 로컬 상수로 둔다. */
const STRIKE_COLOR = '#FF6B5B';

const StrikeLabel: React.FC<{ text: string; strike: number; textOpacity: number }> = ({
  text, strike, textOpacity,
}) => (
  <span style={{ position: 'relative', display: 'inline-block', opacity: textOpacity }}>
    {text}
    <span
      style={{
        position: 'absolute', left: 0, top: '54%', height: 6, borderRadius: 3,
        width: `${Math.max(0, Math.min(1, strike)) * 100}%`, background: STRIKE_COLOR,
        transform: 'translateY(-50%)', boxShadow: `0 0 10px rgba(255,107,91,0.7)`,
      }}
    />
  </span>
);

export const S5Olbers: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; keplerBadge: string; keplerLabel: string; olbersLabel: string;
}> = ({ f, frames, lines, keplerBadge, keplerLabel, olbersLabel }) => {
  // 1) "케플러" 라벨 위로 빨간 취소선이 스치듯 지나간다 (전반 내레이션 "케플러 이름이 안
  //    붙어 있어요"와 동기화)
  const strikeP = progress(f, Math.round(frames * 0.08), Math.round(frames * 0.24));
  // 2) 취소선이 다 그어진 직후 "케플러" 글자만 먼저 흐려진다
  const labelTextOpacity = 1 - progress(f, Math.round(frames * 0.24), Math.round(frames * 0.32));
  // 3) 카드 전체(뱃지+아이콘+테두리)는 취소선 결과를 잠깐 보여준 뒤 조금 늦게 퇴장한다
  const cardOpacity = 1 - progress(f, Math.round(frames * 0.30), Math.round(frames * 0.40));
  // 4) 카드가 다 사라진 직후 "올베르스의 역설"이 s4 카드보다 훨씬 크게 팝인 (후반 내레이션
  //    "다른 천문학자 이름이 붙었거든요"와 동기화, 실제로 이름이 붙은 대상과의 대비)
  const bigP = progress(f, Math.round(frames * 0.42), Math.round(frames * 0.66));

  return (
    <Sky f={f} stars={40} moon={null} horizon={null} dim={0.28}>
      {cardOpacity > 0.01 ? (
        <div style={{ opacity: cardOpacity }}>
          <Card
            x={CARD_X} y={CARD_Y} w={CARD_W} h={CARD_H} progress={1}
            badge={<YearBadge text={keplerBadge} />} badgeSize={YEAR_BADGE_SIZE}
            label={<StrikeLabel text={keplerLabel} strike={strikeP} textOpacity={labelTextOpacity} />}
            bg={C.nightMid} border={C.cream} labelColor={C.cream} badgeColor={C.gold}
          >
            <ThemedIcon name="telescope" size={220} color={C.cream} />
          </Card>
        </div>
      ) : null}
      {bigP > 0.001 ? (
        <Appear progress={bigP} from="scale">
          <Label x={CX} y={860} text={olbersLabel} size={82} color={C.cream} wrapWidth={880} />
        </Appear>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S6: 숲 비유 -> 별 전제 (방사형 시선) ---------------- */

const DIAG_W = 720;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 560;

export const S6Sightline: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = (
  { f, frames, lines }
) => {
  const sightlineProgress = progress(f, 6, frames * 0.42);
  const targetMix = progress(f, frames * 0.48, frames * 0.86);
  return (
    <Sky f={f} stars={40} moon={null} horizon={null}>
      <StarlightDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} sightlineProgress={sightlineProgress}
        sightlineTargetMix={targetMix} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S7: 아직 도착 못한 별빛 (도중에 멈춘 빛줄기) ---------------- */

export const S7Travel: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = (
  { f, frames, lines, label }
) => {
  const raw = progress(f, 6, frames * 0.6);
  const travelProgress = Math.min(raw, 0.55); // 끝까지 못 감 - 아직 도착 전이라는 연출
  const labelP = progress(f, frames * 0.4, frames * 0.6);
  return (
    <Sky f={f} stars={46} moon={null} horizon={null}>
      <StarlightDiagram width={560} x={CX - 280} y={420} travelProgress={travelProgress} travelLength={780} />
      {labelP > 0.001 ? (
        <Appear progress={labelP} from="scale">
          <Label x={CX} y={1420} text={label} size={FS.label} color={C.cream} />
        </Appear>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S8: 태양빛(짧음) vs 다른 별빛(훨씬 긺) 체감 비교 ---------------- */

export const S8Compare: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; shortLabel: string; longLabel: string; longSub: string;
}> = ({ f, frames, lines, shortLabel, longLabel, longSub }) => {
  const phase2 = frames * 0.46;
  const shortOpacity = 1 - progress(f, phase2 - 10, phase2 + 8);
  const longOpacity = progress(f, phase2 - 4, phase2 + 18);
  const shortProgress = progress(f, 6, Math.max(7, phase2 * 0.5));
  const longRaw = progress(f, phase2 + 12, frames * 0.98);
  const longProgress = Math.min(longRaw, 0.68); // 훨씬 오래 걸린다 - 끝까지 안 감

  return (
    <Sky f={f} stars={46} moon={null} horizon={null}>
      {shortOpacity > 0.01 ? (
        <div style={{ opacity: shortOpacity, position: 'absolute', inset: 0 }}>
          <StarlightDiagram width={380} x={CX - 190} y={440} travelProgress={shortProgress} travelLength={260} />
          <Label x={CX} y={880} text={shortLabel} size={FS.label} color={C.cream} />
        </div>
      ) : null}
      {longOpacity > 0.01 ? (
        <div style={{ opacity: longOpacity, position: 'absolute', inset: 0 }}>
          <StarlightDiagram width={620} x={CX - 310} y={400} travelProgress={longProgress} travelLength={760} />
          <Label x={CX} y={1350} text={longLabel} size={FS.label} color={C.cream} />
          <Label x={CX} y={1414} text={longSub} size={FS.small} color={C.nightSoft} />
        </div>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S9: 파장 늘어짐(적색편이) + 은하 하나가 서서히 희미해짐 ---------------- */

export const S9Fade: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; seeLabel: string; unseeLabel: string;
}> = ({ f, frames, lines, seeLabel, unseeLabel }) => {
  const waveProgress = progress(f, 6, frames * 0.5);
  const seeOp = 1 - progress(f, frames * 0.30, frames * 0.46);
  const unseeOp = progress(f, frames * 0.34, frames * 0.50);
  const galaxyStart = frames * 0.56;
  const galaxyIn = progress(f, galaxyStart, galaxyStart + 20);
  const galaxyFade = progress(f, galaxyStart + 46, frames * 0.96);
  // 헤지 표현(v9 전반과 동일 원칙) - 완전히 0으로 꺼지지 않고 아주 흐릿하게만 남는다
  const galaxyOpacity = galaxyIn * (1 - galaxyFade * 0.8);
  const twinkle = 0.6 + 0.4 * Math.sin(f / 9);

  return (
    <Sky f={f} stars={50} moon={null} horizon={null}>
      <StarlightDiagram width={800} x={CX - 400} y={540} waveProgress={waveProgress} />
      <div style={{ opacity: seeOp }}>
        <Label x={CX} y={420} text={seeLabel} size={FS.label} color={C.cream} />
      </div>
      <div style={{ opacity: unseeOp }}>
        <Label x={CX} y={420} text={unseeLabel} size={FS.label} color={C.nightSoft} />
      </div>
      {galaxyOpacity > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: CX + 210, top: 980, width: 26, height: 26, borderRadius: 13,
            background: C.cream, opacity: galaxyOpacity * twinkle,
            boxShadow: `0 0 34px 12px rgba(255,244,228,${0.3 * galaxyOpacity})`,
          }}
        />
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};

/* ---------------- S11: 클로징 - 캐릭터 복귀 + 안드로메다 + 속설 반박 ---------------- */

export const S11Closing: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
  galaxyLabel: string; galaxySub: string; rumorLabel: string;
}> = ({ f, frames, lines, mouth, galaxyLabel, galaxySub, rumorLabel }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's11', f));
  const pose = blendPose(POSES.idle, POSES.thinking, progress(f, 0, 16));

  const trailP = progress(f, 6, frames * 0.24);
  const smudgeP = progress(f, frames * 0.22, frames * 0.36);
  const bubbleIn = progress(f, frames * 0.56, frames * 0.68);
  const bubbleOut = progress(f, frames * 0.84, frames * 0.92);
  const bubbleP = bubbleIn * (1 - bubbleOut);

  return (
    <Sky f={f} stars={60} moon={0.6} horizon={1650}>
      {trailP > 0.001 ? (
        <svg width={W} height={900} style={{ position: 'absolute', left: 0, top: 200, overflow: 'visible' }}>
          <path
            d="M 900 40 Q 620 260 400 520" stroke={C.gold} strokeWidth={7} strokeLinecap="round" fill="none"
            strokeDasharray={620} strokeDashoffset={620 * (1 - trailP)} opacity={0.75}
          />
        </svg>
      ) : null}

      {smudgeP > 0.001 ? (
        <>
          <div
            style={{
              position: 'absolute', left: 740, top: 330, width: 180, height: 116, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,244,228,0.55), rgba(255,244,228,0) 70%)',
              opacity: smudgeP,
            }}
          />
          <div style={{ opacity: smudgeP }}>
            <Label x={830} y={462} text={galaxyLabel} size={FS.small} color={C.cream} />
            <Label x={830} y={506} text={galaxySub} size={FS.tiny} color={C.nightSoft} />
          </div>
        </>
      ) : null}

      <Actor
        size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} breathAmp={1}
        style={NIGHT_GLOW_STYLE}
      />

      {bubbleP > 0.001 ? (
        <div style={{ opacity: bubbleP }}>
          <SpeechBubble
            x={300} y={520} r={130} shape="round" tail="bottomRight" text="?" textSize={110}
            bg={C.paper} border={C.ink}
          />
          <Label x={300} y={676} text={rumorLabel} size={FS.label} color={C.cream} />
        </div>
      ) : null}

      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </Sky>
  );
};
