/** 이 화(general-ep18, "비누가 기름을 씻어내는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  s1/s3/s4/s5는 이 화를 위해 새로 만든 `SoapMicelleDiagram`(assets/props, REGISTRY 등록)을
 *  재사용한다 - 물/기름 분리 -> 비누 분자가 감쌈 -> 미셀이 떠내려감의 3단 인과를 컴포넌트
 *  하나로 커버한다.
 *
 *  라벨 팝인은 전부 `Appear`로 감싸지 않는다 - `Appear`가 절대좌표 자식을 감쌀 때 초반
 *  프레임에서 좌표가 150px 이상 밀리는 결함이 general-ep13에서 실측됐다(REGISTRY 4절 하단
 *  주의문). 대신 position·opacity·transform을 한 div에 결합하는 `popLabelStyle`/
 *  `pillBadgeStyle` 헬퍼를 쓴다.
 */
import React from 'react';
import { interpolateColors } from 'remotion';
import {
  BustActor, C, Caption, Card, CountUp, FONT, FPS, FS, PlainBg, POSES, PulseRing,
  RADIUS, SOAP_HEAD_LABEL_PT, SOAP_MICELLE_LABEL_PT, SOAP_TAIL_LABEL_PT,
  SOAP_TERM_LABEL_PT, SOAP_VB_W, SW, SW_THIN, SoapMicelleDiagram, ThemedIcon, blendPose,
  clamp01, mouthAt, mouthProp, progress, soapFloatOffset,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** 위치·불투명도·이동을 한 div에 결합한 팝업 라벨 스타일 (Appear 미사용 - 위 파일 헤더 참고) */
function popLabelStyle(
  x: number, y: number, p: number, size: number, color: string,
  align: 'center' | 'left' = 'center'
): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `${align === 'center' ? 'translateX(-50%) ' : ''}translateY(${(1 - cp) * 14}px)`,
    opacity: cp, fontFamily: FONT, fontWeight: 700, fontSize: size, color,
    whiteSpace: 'nowrap', wordBreak: 'keep-all', textAlign: align,
  };
}

/** 알약 모양 배지 스타일 (s8 "아주 오래전"/"Ancient Times" - 영어가 길어 Card의 원형
 *  badge 슬롯 대신 별도 알약 배지로 뺐다. 원형 배지에 긴 텍스트를 넣으면 6화에서 실제로
 *  글자가 원 밖으로 삐져나온 사례가 있다 - REGISTRY 예방 체크리스트) */
function pillBadgeStyle(x: number, y: number, p: number): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `translateX(-50%) translateY(${(1 - cp) * -16}px) scale(${0.85 + 0.15 * cp})`,
    opacity: cp, background: C.gold, border: `${Math.round(SW * 0.6)}px solid ${C.ink}`,
    borderRadius: RADIUS.pill, padding: '12px 34px', fontFamily: FONT, fontWeight: 700,
    fontSize: FS.small, color: C.ink, whiteSpace: 'nowrap', wordBreak: 'keep-all',
  };
}

/* ---------------- S1: 물로만 헹궈도 기름이 안 지워짐 (무성, 2.0초 고정) ---------------- */

const S1_BUST_SIZE = 520;
const S1_BUST_LEFT = CX - S1_BUST_SIZE / 2;
const S1_BUST_TOP = 70;
// 세로 9:16 하단이 비어 보이지 않도록(원칙 5 체크리스트) 다이어그램을 화면 폭 대부분과
// 중하단까지 크게 채운다 - 1차 버전은 다이어그램이 작고 위쪽에 몰려 하단 500px가 빈
// 여백으로 남았다(2026-08-20 검수).
const S1_DIAG_W = 900;
const S1_DIAG_X = CX - S1_DIAG_W / 2;
const S1_DIAG_Y = 760;
const S1_DROP_X = CX - 20;
const S1_DROP_TOP = S1_BUST_TOP + S1_BUST_SIZE * 0.72;
const S1_DROP_BOTTOM = S1_DIAG_Y + 60;
const S1_DROP_PERIOD = 34;

/** 첫 물방울이 접시(다이어그램 물통)에 닿는 프레임 - Episode.tsx가 water_splash.mp3를
 *  여기에 맞춰 재생한다(원칙 7 - 무성 구간엔 핵심 액션에 짧은 효과음). */
export const S1_SPLASH_FRAME = 16;

export const S1Rinse: React.FC<{ f: number }> = ({ f }) => {
  const pose: Pose = { ...POSES.idle, headTilt: 16 };
  const t = (f % S1_DROP_PERIOD) / S1_DROP_PERIOD;
  const dropY = lerp(S1_DROP_TOP, S1_DROP_BOTTOM, t);
  const dropOpacity = f < 4 ? 0 : t < 0.82 ? 0.95 : (0.95 * (1 - t)) / 0.18;

  return (
    <PlainBg ground={null}>
      <BustActor size={S1_BUST_SIZE} left={S1_BUST_LEFT} top={S1_BUST_TOP} pose={pose} />
      <SoapMicelleDiagram width={S1_DIAG_W} x={S1_DIAG_X} y={S1_DIAG_Y} frame={f} />
      <ThemedIcon
        name="droplet" size={40} color={C.waterCool}
        style={{ position: 'absolute', left: S1_DROP_X, top: dropY, opacity: dropOpacity }}
      />
    </PlainBg>
  );
};

/* ---------------- S2: 캐릭터 리액션 - "왜 이러지?" (shrug, 립싱크) ---------------- */

const S2_BUST_SIZE = 950;
const S2_BUST_TOP = 430;
const S2_BUST_LEFT = (1080 - S2_BUST_SIZE) / 2;

export const S2Shrug: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.shrug, poseT);

  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 물과 기름은 절대 안 섞인다 ---------------- */

const S3_DIAG_W = 780;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 480;

export const S3Separate: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const sepP = progress(f, 8, Math.round(frames * 0.5));

  return (
    <PlainBg ground={null}>
      <SoapMicelleDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} frame={f} separateProgress={sepP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 비누 분자(계면활성제)가 기름 방울을 감싼다 ---------------- */

const S4_DIAG_W = 780;
const S4_DIAG_X = CX - S4_DIAG_W / 2;
const S4_DIAG_Y = 480;
const S4_SCALE = S4_DIAG_W / SOAP_VB_W;

function soapScreenPt(pt: { x: number; y: number }) {
  return { x: S4_DIAG_X + pt.x * S4_SCALE, y: S4_DIAG_Y + pt.y * S4_SCALE };
}

export const S4Surfactant: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; headLabel: string; tailLabel: string; termLabel: string;
}> = ({ f, frames, lines, headLabel, tailLabel, termLabel }) => {
  const line = activeLine(lines, f / FPS);
  const surEnd = Math.round(frames * 0.62);
  // 링 전체를 한 번에 선형으로 채우면 "예시 분자"(i=0, 12시 방향)에 물을/기름을 좋아함
  // 라벨을 붙이는 타이밍에 이웃 분자(i=1,i=7)가 이미 상당히 드러나 라벨과 겹치는 결함이
  // 실측됐다(2026-08-20 검수, "기름을 좋아함" 라벨이 이웃 분자 머리와 겹침). 그래서
  // surroundProgress를 0.125(=1/8, 예시 분자 하나만 완전히 드러나는 지점)에서 잠깐
  // 붙들어 두는 2단 곡선으로 바꿨다 - 라벨이 다 사라진 뒤에야 나머지 분자가 이어서 드러난다.
  const SOLO_TARGET = 1 / 8;
  const soloHoldEnd = Math.round(frames * 0.30);
  const surP = f < soloHoldEnd
    ? SOLO_TARGET * progress(f, 10, Math.round(frames * 0.16))
    : SOLO_TARGET + (1 - SOLO_TARGET) * progress(f, soloHoldEnd, surEnd);

  const headInP = progress(f, Math.round(frames * 0.17), Math.round(frames * 0.17) + 12);
  const headOutP = progress(f, Math.round(frames * 0.26), Math.round(frames * 0.26) + 10);
  const headP = Math.min(headInP, 1 - headOutP);
  const tailInP = progress(f, Math.round(frames * 0.21), Math.round(frames * 0.21) + 12);
  const tailOutP = progress(f, Math.round(frames * 0.28), Math.round(frames * 0.28) + 10);
  const tailP = Math.min(tailInP, 1 - tailOutP);
  const termP = progress(f, Math.round(frames * 0.68), Math.round(frames * 0.68) + 16);

  const headPt = soapScreenPt(SOAP_HEAD_LABEL_PT);
  const tailPt = soapScreenPt(SOAP_TAIL_LABEL_PT);
  const termPt = soapScreenPt(SOAP_TERM_LABEL_PT);

  return (
    <PlainBg ground={null}>
      <SoapMicelleDiagram
        width={S4_DIAG_W} x={S4_DIAG_X} y={S4_DIAG_Y} frame={f} separateProgress={1} surroundProgress={surP}
      />
      {headP > 0.001 ? (
        <div style={popLabelStyle(headPt.x, headPt.y, headP, FS.small, C.inkSoft)}>{headLabel}</div>
      ) : null}
      {tailP > 0.001 ? (
        <div style={popLabelStyle(tailPt.x, tailPt.y, tailP, FS.small, C.inkSoft)}>{tailLabel}</div>
      ) : null}
      {termP > 0.001 ? (
        <div style={popLabelStyle(termPt.x, termPt.y, termP, FS.label, C.ink)}>{termLabel}</div>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 미셀이 되어 물속에 떠서 씻겨 나감 ---------------- */

const S5_DIAG_W = 780;
const S5_DIAG_X = CX - S5_DIAG_W / 2;
const S5_DIAG_Y = 480;
const S5_SCALE = S5_DIAG_W / SOAP_VB_W;

export const S5Float: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; micelleLabel: string;
}> = ({ f, frames, lines, micelleLabel }) => {
  const line = activeLine(lines, f / FPS);
  const floatP = progress(f, 8, Math.round(frames * 0.72));
  const micelleInP = progress(f, Math.round(frames * 0.08), Math.round(frames * 0.08) + 16);
  const micelleOutP = progress(f, Math.round(frames * 0.55), Math.round(frames * 0.70));
  const micelleOpacity = Math.min(micelleInP, 1 - micelleOutP);

  const { dx, dy } = soapFloatOffset(floatP);
  const base = { x: S5_DIAG_X + SOAP_MICELLE_LABEL_PT.x * S5_SCALE, y: S5_DIAG_Y + SOAP_MICELLE_LABEL_PT.y * S5_SCALE };
  const labelX = base.x + dx * S5_SCALE;
  const labelY = base.y + dy * S5_SCALE;

  return (
    <PlainBg ground={null}>
      <SoapMicelleDiagram
        width={S5_DIAG_W} x={S5_DIAG_X} y={S5_DIAG_Y} frame={f}
        separateProgress={1} surroundProgress={1} floatProgress={floatP}
      />
      {micelleOpacity > 0.001 ? (
        <div style={popLabelStyle(labelX, labelY, micelleOpacity, FS.label, C.ink)}>{micelleLabel}</div>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 손 씻을 때 20초 ---------------- */

/** 손을 문지르는 모습. 타원 두 개만 겹치면 벤 다이어그램처럼 보여 "손"으로 안 읽히는 문제가
 *  1차 검수에서 발견됐다(2026-08-20) - 손바닥 타원마다 작은 엄지 돌기를 붙이고, 겹치는
 *  손바닥 사이에 거품 점을 몇 개 얹어 "비누 거품으로 문지르는" 동작임을 분명히 했다. */
const Hands: React.FC<{ width: number; rub: number; style?: React.CSSProperties }> = ({ width, rub, style }) => {
  const dx = Math.sin(rub) * 16;
  return (
    <svg viewBox="0 0 320 220" width={width} style={style}>
      {/* 왼손(뒤) */}
      <g transform={`translate(${-dx} 0)`}>
        <ellipse cx={124} cy={122} rx={94} ry={64} fill={C.paper} stroke={C.ink} strokeWidth={SW * 0.7} />
        <ellipse
          cx={62} cy={80} rx={26} ry={36} fill={C.paper} stroke={C.ink} strokeWidth={SW * 0.6}
          transform="rotate(-30 62 80)"
        />
      </g>
      {/* 오른손(앞) */}
      <g transform={`translate(${dx} 0)`}>
        <ellipse cx={198} cy={110} rx={94} ry={64} fill={C.paper} stroke={C.ink} strokeWidth={SW * 0.7} />
        <ellipse
          cx={260} cy={70} rx={26} ry={36} fill={C.paper} stroke={C.ink} strokeWidth={SW * 0.6}
          transform="rotate(30 260 70)"
        />
      </g>
      {/* 맞닿는 부분의 거품 점 */}
      {[[150, 96], [170, 118], [156, 138]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={9} fill={C.sky} stroke={C.ink} strokeWidth={SW * 0.35} />
      ))}
    </svg>
  );
};

const S6_HANDS_W = 460;
const S6_HANDS_Y = 700;
const S6_COUNT_Y = 1280;
/** 결정론적 버블 시드(인덱스 기반, Math.random 미사용 - 원칙 3) */
const S6_BUBBLES = [
  { dx: -172, delay: 0 }, { dx: -96, delay: 9 }, { dx: -14, delay: 4 },
  { dx: 60, delay: 13 }, { dx: 132, delay: 6 }, { dx: 196, delay: 16 },
];
const S6_BUBBLE_PERIOD = 76;

export const S6Wash: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; suffix: string;
}> = ({ f, frames, lines, suffix }) => {
  const line = activeLine(lines, f / FPS);
  const handsP = progress(f, 0, 16);
  const countAt = Math.round(frames * 0.16);
  const countDur = Math.round(frames * 0.58);

  return (
    <PlainBg ground={1750} groundColor={C.hill} floorOpacity={0.85}>
      <div
        style={{
          position: 'absolute', left: CX - S6_HANDS_W / 2, top: S6_HANDS_Y,
          opacity: handsP, transform: `scale(${0.7 + 0.3 * handsP})`, transformOrigin: '50% 50%',
        }}
      >
        <Hands width={S6_HANDS_W} rub={f / 6} />
      </div>
      {S6_BUBBLES.map((b, i) => {
        if (f < b.delay) return null;
        const t = ((f - b.delay) % S6_BUBBLE_PERIOD) / S6_BUBBLE_PERIOD;
        const bx = CX + b.dx + Math.sin(f / 20 + i) * 8;
        const by = S6_HANDS_Y - 10 - t * 280;
        const op = t < 0.8 ? 0.85 : (0.85 * (1 - t)) / 0.2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: bx - 10, top: by, width: 20, height: 20, borderRadius: 10,
              background: C.sky, border: `${SW_THIN * 0.6}px solid ${C.ink}`, opacity: op,
            }}
          />
        );
      })}
      <CountUp
        x={CX} y={S6_COUNT_Y} to={20} at={countAt} duration={countDur} frame={f}
        size={FS.hero} color={C.coral} suffix={suffix} width={460} style={{ whiteSpace: 'nowrap' }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 코로나 바이러스의 기름막을 비누가 터뜨림 ---------------- */

const S7_VIRUS_SIZE = 280;
const S7_VIRUS_CX = CX;
const S7_VIRUS_CY = 780;
const S7_VIRUS_X = S7_VIRUS_CX - S7_VIRUS_SIZE / 2;
const S7_VIRUS_Y = S7_VIRUS_CY - S7_VIRUS_SIZE / 2;
const S7_RING_SIZE = S7_VIRUS_SIZE * 1.32;
const S7_LABEL_Y = S7_VIRUS_Y - 90;

/** 막이 터지는 프레임(구간 길이 비례). 언어별로 frames가 달라 함수로 노출한다 -
 *  Episode.tsx가 bubble_pop.mp3 재생 시점을 여기에 맞춘다(원칙 7). */
export function s7BurstFrame(frames: number) {
  return Math.round(frames * 0.56);
}

const MiniSoap: React.FC<{ cx: number; cy: number; angleDeg: number; opacity: number }> = ({
  cx, cy, angleDeg, opacity,
}) => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tailX = cx - cos * 40;
  const tailY = cy - sin * 40;
  return (
    <g opacity={opacity}>
      <line x1={tailX} y1={tailY} x2={cx} y2={cy} stroke={C.gold} strokeWidth={12} strokeLinecap="round" />
      <circle cx={tailX} cy={tailY} r={16} fill={C.waterCool} stroke={C.ink} strokeWidth={SW_THIN * 0.7} />
    </g>
  );
};

export const S7Virus: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; beforeLabel: string; afterLabel: string;
}> = ({ f, frames, lines, beforeLabel, afterLabel }) => {
  const line = activeLine(lines, f / FPS);
  const burstAt = s7BurstFrame(frames);
  const virusP = progress(f, 0, 14);
  const membraneP = f < burstAt ? 1 : Math.max(0, 1 - (f - burstAt) / 5);
  const approachP = progress(f, 12, burstAt);
  const beforeLabelP = progress(f, 20, 34) * (f < burstAt ? 1 : Math.max(0, 1 - (f - burstAt) / 8));
  const afterLabelP = progress(f, burstAt + 8, burstAt + 24);
  const virusColorT = progress(f, burstAt, burstAt + 18);
  const virusColor = interpolateColors(virusColorT, [0, 1], [C.ink, C.coralSoft]) as unknown as string;
  const flashP = burstAt <= f && f < burstAt + 14
    ? 1 - Math.abs((f - burstAt) / 7 - 1)
    : 0;

  const soapAngle = -160;
  const soapCx = lerp(S7_VIRUS_X - 140, S7_VIRUS_CX + Math.cos((soapAngle * Math.PI) / 180) * (S7_VIRUS_SIZE / 2 + 4), approachP);
  const soapCy = lerp(S7_VIRUS_CY - 40, S7_VIRUS_CY + Math.sin((soapAngle * Math.PI) / 180) * (S7_VIRUS_SIZE / 2 + 4), approachP);

  return (
    <PlainBg ground={null}>
      {flashP > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: S7_VIRUS_CX - S7_RING_SIZE / 2, top: S7_VIRUS_CY - S7_RING_SIZE / 2,
            width: S7_RING_SIZE, height: S7_RING_SIZE, borderRadius: '50%',
            background: C.coralSoft, opacity: flashP * 0.85, transform: `scale(${0.8 + 0.5 * flashP})`,
          }}
        />
      ) : null}
      {membraneP > 0.01 ? (
        <PulseRing
          x={S7_VIRUS_CX - S7_RING_SIZE / 2} y={S7_VIRUS_CY - S7_RING_SIZE / 2} size={S7_RING_SIZE}
          frame={f} progress={membraneP} color={C.goldSoft} opacity={0.65}
        />
      ) : null}
      <ThemedIcon
        name="virus" size={S7_VIRUS_SIZE} color={virusColor}
        style={{
          position: 'absolute', left: S7_VIRUS_X, top: S7_VIRUS_Y, opacity: virusP,
          transform: `scale(${0.7 + 0.3 * virusP})`, transformOrigin: '50% 50%',
        }}
      />
      {approachP > 0.001 && approachP < 1.001 ? (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <MiniSoap cx={soapCx} cy={soapCy} angleDeg={soapAngle} opacity={f < burstAt + 4 ? 1 : 0} />
        </svg>
      ) : null}
      {beforeLabelP > 0.001 ? (
        <div style={popLabelStyle(S7_VIRUS_CX, S7_LABEL_Y, beforeLabelP, FS.label, C.inkSoft)}>{beforeLabel}</div>
      ) : null}
      {afterLabelP > 0.001 ? (
        <div style={popLabelStyle(S7_VIRUS_CX, S7_LABEL_Y, afterLabelP, FS.label, C.coral)}>{afterLabel}</div>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 비누의 역사 - 아주 오래전, 기름 + 재 ---------------- */

const S8_CARD_W = 620;
const S8_CARD_H = 700;
const S8_CARD_X = CX - S8_CARD_W / 2;
const S8_CARD_Y = 560;
const S8_BADGE_Y = S8_CARD_Y - 76;

export const S8History: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; badge: string; label: string;
}> = ({ f, frames, lines, badge, label }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const cardP = progress(f, 4, 24);
  const badgeP = progress(f, 14, 30);

  return (
    <PlainBg>
      <Card
        x={S8_CARD_X} y={S8_CARD_Y} w={S8_CARD_W} h={S8_CARD_H} progress={cardP} label={label} labelSize={FS.label}
      >
        <ThemedIcon name="flask" size={230} color={C.ink} />
      </Card>
      <div style={pillBadgeStyle(CX, S8_BADGE_Y, badgeP)}>{badge}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
