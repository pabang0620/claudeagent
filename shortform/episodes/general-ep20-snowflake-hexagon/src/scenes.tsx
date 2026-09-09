/** 이 화(general-ep20, "눈송이가 육각형인 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  s3은 general-ep17이 만든 `WaterMoleculeLattice`(assets/props, REGISTRY 등록)를 그대로
 *  재사용한다 - "물 분자가 정해진 각도로 붙어 육각형으로 배열된다"는 이 화의 핵심 장면과
 *  그 컴포넌트의 목적이 정확히 같다(원칙 0, 재사용 판단 근거는 assets/props/SnowflakeDiagram.tsx
 *  헤더 주석과 REGISTRY.md에도 남겼다). s4/s5/s6/s8의 "가지가 자라나는 눈송이"는 분자 격자와는
 *  전혀 다른 스케일이라 이 화에서 새로 만든 `SnowflakeGrowth`/`SnowflakeIcon`을 쓴다.
 *
 *  라벨 팝인은 `Appear`로 절대좌표 자식을 감싸지 않는다(REGISTRY 4절 하단 주의문 - 팝인 중
 *  위로 쏠리는 결함) - position·opacity·transform을 한 div에 결합하는 `popLabelStyle`/
 *  `noticeBoxStyle` 헬퍼를 쓴다(ep18과 동일 패턴).
 */
import React from 'react';
import {
  BustActor, C, Caption, Card, FONT, FPS, FS, PlainBg, POSES, RADIUS, SW, SW_THIN,
  SnowflakeGrowth, SnowflakeIcon, ThemedIcon, WaterMoleculeLattice, blendPose, clamp01,
  mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = 540; // W/2

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 위치·불투명도·이동을 한 div에 결합한 팝업 라벨 스타일 (Appear 미사용 - 위 파일 헤더 참고) */
function popLabelStyle(
  x: number, y: number, p: number, size: number, color: string
): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y,
    transform: `translateX(-50%) translateY(${(1 - cp) * 14}px)`,
    opacity: cp, fontFamily: FONT, fontWeight: 700, fontSize: size, color,
    whiteSpace: 'nowrap', wordBreak: 'keep-all', textAlign: 'center',
  };
}

/** s8 "얘기가 있어요류" 안내 박스 - 줄바꿈을 허용해 긴 영어 문장도 화면 밖으로 안 나가게 한다 */
function noticeBoxStyle(x: number, y: number, w: number, p: number): React.CSSProperties {
  const cp = clamp01(p);
  return {
    position: 'absolute', left: x, top: y, width: w,
    transform: `translateX(-50%) translateY(${(1 - cp) * 16}px)`,
    opacity: cp, background: C.goldSoft, border: `${Math.round(SW * 0.6)}px solid ${C.ink}`,
    borderRadius: RADIUS.lg, padding: '30px 36px', fontFamily: FONT, fontWeight: 700,
    fontSize: FS.small, color: C.ink, textAlign: 'center', lineHeight: 1.34,
    wordBreak: 'keep-all', whiteSpace: 'normal',
  };
}

/** 결정적 위치·위상을 갖는 눈 입자(인덱스 기반, Math.random 미사용 - 원칙 3) */
const SNOW_DOTS = Array.from({ length: 12 }, (_, i) => ({
  x: 70 + (i * 97) % 960,
  size: 7 + (i % 4) * 3,
  speed: 2.4 + (i % 3) * 0.7,
  phase: (i * 53) % 140,
}));

/* ---------------- S1: 눈이 내리다가 눈송이 하나가 확대되며 육각 실루엣이 어렴풋이 (무성, 2.0초 고정) ---------------- */

const S1_ZOOM_END = 56;
const S1_DIAG_SIZE = 760;
const S1_DIAG_X = CX - S1_DIAG_SIZE / 2;
const S1_DIAG_Y = 560;
/** 눈송이 실루엣이 다 확대된 직후 - Episode.tsx가 realize_ding.mp3를 여기에 맞춰 재생한다
 *  (원칙 7 - 무성 구간엔 핵심 액션에 짧은 효과음). */
export const S1_REVEAL_FRAME = 48;

export const S1Snowfall: React.FC<{ f: number }> = ({ f }) => {
  const zoomP = progress(f, 0, S1_ZOOM_END);
  const scale = 0.14 + 0.86 * zoomP;
  const haze = 0.12 + 0.6 * zoomP;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      {SNOW_DOTS.map((d, i) => {
        const y = ((f * d.speed + d.phase) % (1920 + 60)) - 40;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: d.x, top: y, width: d.size, height: d.size,
              borderRadius: d.size / 2, background: C.paper,
              border: `${SW_THIN * 0.4}px solid ${C.waterCool}`, opacity: 0.55,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute', left: S1_DIAG_X, top: S1_DIAG_Y, width: S1_DIAG_SIZE,
          height: S1_DIAG_SIZE, opacity: haze, transform: `scale(${scale})`, transformOrigin: '50% 50%',
        }}
      >
        <SnowflakeGrowth width={S1_DIAG_SIZE} x={0} y={0} growProgress={1} variant={0} color={C.ink} />
      </div>
    </PlainBg>
  );
};

/* ---------------- S2: 캐릭터 리액션 - "왜 이렇게 생겼지?" (surprised, 립싱크) ---------------- */

const S2_BUST_SIZE = 780;
const S2_BUST_TOP = 620;
const S2_BUST_LEFT = CX - S2_BUST_SIZE / 2 - 140;
const S2_FLAKE_SIZE = 420;
const S2_FLAKE_X = CX + 90;
const S2_FLAKE_Y = 360;

export const S2Reveal: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, poseT);

  return (
    <PlainBg>
      <SnowflakeIcon width={S2_FLAKE_SIZE} x={S2_FLAKE_X} y={S2_FLAKE_Y} variant={0} color={C.ink} progress={1} />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 물 분자가 육각형 결정 구조로 이어 붙는다 (WaterMoleculeLattice 재사용) ---------------- */

const S3_DIAG_W = 720;
const S3_DIAG_X = CX - S3_DIAG_W / 2;
const S3_DIAG_Y = 480;
const S3_LABEL_Y = S3_DIAG_Y + S3_DIAG_W + 70;

export const S3Lattice: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const line = activeLine(lines, f / FPS);
  const crystallizeP = progress(f, 6, Math.round(frames * 0.72));
  const labelP = progress(f, Math.round(frames * 0.74), Math.round(frames * 0.74) + 16);

  return (
    <PlainBg ground={null}>
      <WaterMoleculeLattice width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} crystallizeProgress={crystallizeP} />
      {labelP > 0.001 ? (
        <div style={popLabelStyle(CX, S3_LABEL_Y, labelP, FS.label, C.ink)}>{label}</div>
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 가지가 육각형 결정 구조를 따라 6방향으로 뻗어나간다 (타임랩스 성장) ---------------- */

const S4_DIAG_SIZE = 820;
const S4_DIAG_X = CX - S4_DIAG_SIZE / 2;
const S4_DIAG_Y = 540;

export const S4Growth: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const growP = progress(f, 4, Math.round(frames * 0.92));

  return (
    <PlainBg ground={null}>
      <SnowflakeGrowth width={S4_DIAG_SIZE} x={S4_DIAG_X} y={S4_DIAG_Y} growProgress={growP} variant={0} color={C.waterCool} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 완성된 눈송이 정지, 캐릭터 idle 복귀 (핵심 결론, 별도 그래픽 없음) ---------------- */

const S5_DIAG_SIZE = 760;
const S5_DIAG_X = CX - S5_DIAG_SIZE / 2;
const S5_DIAG_Y = 300;
const S5_BUST_SIZE = 480;
const S5_BUST_LEFT = CX - S5_BUST_SIZE / 2;
const S5_BUST_TOP = 1180;

export const S5Complete: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  void f;
  void frames;
  const line = activeLine(lines, f / FPS);
  const pose: Pose = POSES.idle;

  return (
    <PlainBg ground={null}>
      <SnowflakeGrowth width={S5_DIAG_SIZE} x={S5_DIAG_X} y={S5_DIAG_Y} growProgress={1} variant={0} color={C.ink} />
      <BustActor size={S5_BUST_SIZE} left={S5_BUST_LEFT} top={S5_BUST_TOP} pose={pose} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 온도·습도에 따라 가지 모양이 조금씩 달라진다 (아이콘만, 숫자 없음) ---------------- */

const S6_CENTER_SIZE = 520;
const S6_CENTER_X = CX - S6_CENTER_SIZE / 2;
const S6_CENTER_Y = 420;
/** 옆 실루엣 2개 - 화면 밖으로 잘려나가지 않도록 오프셋·크기를 화면 폭(1080) 안에서 계산
 *  (좌우 끝 여백 최소 50px 확보). 중앙 눈송이와 살짝 겹치는 것은 "흐릿하게 겹쳐 나타났다
 *  사라짐"이라는 대본 지시 그대로다. */
const S6_SIDE_SIZE = 380;
const S6_SIDE_OFFSET = 300;
const S6_LEFT_X = CX - S6_SIDE_OFFSET - S6_SIDE_SIZE / 2;
const S6_RIGHT_X = CX + S6_SIDE_OFFSET - S6_SIDE_SIZE / 2;
const S6_SIDE_Y = 480;
const S6_ICON_Y = 1360;

export const S6Variation: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const sideInA = progress(f, Math.round(frames * 0.10), Math.round(frames * 0.32));
  const sideOutA = progress(f, Math.round(frames * 0.62), Math.round(frames * 0.86));
  const sideOpacity = Math.min(sideInA, 1 - sideOutA);
  const iconInA = progress(f, Math.round(frames * 0.18), Math.round(frames * 0.36));
  const iconOutA = progress(f, Math.round(frames * 0.68), Math.round(frames * 0.9));
  const iconOpacity = Math.min(iconInA, 1 - iconOutA);

  return (
    <PlainBg ground={null}>
      <SnowflakeGrowth
        width={S6_CENTER_SIZE} x={S6_CENTER_X} y={S6_CENTER_Y} growProgress={1} variant={0} color={C.ink}
      />
      <SnowflakeGrowth
        width={S6_SIDE_SIZE} x={S6_LEFT_X} y={S6_SIDE_Y} growProgress={1} variant={1} color={C.inkSoft}
        opacity={sideOpacity * 0.65}
      />
      <SnowflakeGrowth
        width={S6_SIDE_SIZE} x={S6_RIGHT_X} y={S6_SIDE_Y} growProgress={1} variant={2} color={C.inkSoft}
        opacity={sideOpacity * 0.65}
      />
      <ThemedIcon
        name="thermometer" size={100} color={C.coral}
        style={{ position: 'absolute', left: CX - 190, top: S6_ICON_Y, opacity: iconOpacity }}
      />
      <ThemedIcon
        name="droplet" size={100} color={C.waterCool}
        style={{ position: 'absolute', left: CX + 90, top: S6_ICON_Y, opacity: iconOpacity }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 윌슨 벤틀리 - 화면엔 연도(1885년)만, 이름은 내레이션이 전담 ---------------- */

const S7_CARD_W = 620;
const S7_CARD_H = 700;
const S7_CARD_X = CX - S7_CARD_W / 2;
const S7_CARD_Y = 560;
/** Card 의 기본 badgeSize(86)는 "1위" 류 2글자용이라 "1885년"(5자, 년 포함) 이 넘친다
 *  (ep06 YearBadge 와 동일 이유로 원을 키우고 폰트를 별도 span 으로 작게 고정) */
const S7_BADGE_SIZE = 156;
const YearBadge: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ fontSize: 38, lineHeight: 1 }}>{text}</span>
);

export const S7History: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; badge: string;
}> = ({ f, frames, lines, badge }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const cardP = progress(f, 4, 24);

  return (
    <PlainBg>
      {/* 배경을 살짝 어둡게 디밍 */}
      <div style={{ position: 'absolute', inset: 0, background: C.ink, opacity: 0.1 }} />
      <Card
        x={S7_CARD_X} y={S7_CARD_Y} w={S7_CARD_W} h={S7_CARD_H} progress={cardP}
        badge={<YearBadge text={badge} />} badgeSize={S7_BADGE_SIZE} badgeColor={C.gold}
      >
        <ThemedIcon name="camera" size={220} color={C.ink} />
      </Card>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 벤틀리가 남긴 얘기 - 속설임을 라벨로 명시(원칙 1-2) ---------------- */

const S8_NOTICE_W = 900;
const S8_NOTICE_X = CX;
/** CAP_BOTTOM(300) 기준 자막 박스가 화면 하단에서 위로 약 1440px 지점부터 차지한다 -
 *  안내 박스를 1440에 두면 자막과 겹치는 결함이 실측됐다(2026-08-21 검수). 자막 위에
 *  여유를 두고 더 위로 올린다. */
const S8_NOTICE_Y = 1120;
/** 다른 모양(variant)의 눈송이 4개를 나란히 - 순서는 결정적(0,1,2,1) */
const S8_VARIANTS: [0 | 1 | 2, number][] = [
  [0, 0], [1, 6], [2, 12], [1, 18],
];
const S8_ICON_SIZE = 240;
const S8_ROW_Y = 460;
const S8_GAP = 30;
const S8_ROW_W = S8_VARIANTS.length * S8_ICON_SIZE + (S8_VARIANTS.length - 1) * S8_GAP;
const S8_ROW_X = CX - S8_ROW_W / 2;

export const S8Legend: React.FC<{ f: number; frames: number; lines: CaptionLine[]; text: string }> = ({
  f, frames, lines, text,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const noticeP = progress(f, 10, 28);

  return (
    <PlainBg ground={null}>
      {S8_VARIANTS.map(([variant, delay], i) => {
        const p = progress(f, delay, delay + 14);
        return (
          <SnowflakeIcon
            key={i}
            width={S8_ICON_SIZE}
            x={S8_ROW_X + i * (S8_ICON_SIZE + S8_GAP)}
            y={S8_ROW_Y}
            variant={variant}
            color={C.ink}
            progress={p}
          />
        );
      })}
      <div style={noticeBoxStyle(S8_NOTICE_X, S8_NOTICE_Y, S8_NOTICE_W, noticeP)}>{text}</div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
