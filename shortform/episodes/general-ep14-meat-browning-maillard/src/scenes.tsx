/** 이 화(general-ep14, "고기가 구워야만 갈색 되는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다.
 *
 *  캐릭터는 s1(리액션+훅)·s7(마무리, ep04 S6Wrap과 같은 북엔드 구조)에서만 바스트샷으로
 *  등장하고, s2~s6은 대본의 "화면이 담당" 열이 전부 그래픽·다이어그램·온도계로 지정돼
 *  있어(ep04 S3/S4/S5와 같은 패턴) 캐릭터 없이 그래픽만으로 구성한다.
 */
import React from 'react';
import {
  Appear, BustActor, C, Caption, CellMergeDiagram, FONT, FPS, Label, Meat, PlainBg, POSES, SW,
  SW_THIN, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { Locale, STRINGS } from './strings';

const CX = W / 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- 공용 배경 래퍼 ---------------- */
// 이 화의 모든 장면은 소품·다이어그램이 화면 중상단에 떠 있는 구도라 기본 바닥선이 필요
// 없다(ep04와 동일 이유 - 2026-08-09 검수에서 기본 바닥선이 소품 한가운데를 가로지르는
// 결함이 발견된 뒤 정착된 관례) - ground=null 로 전 장면에서 끈다.
const Scene: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <PlainBg ground={null}>{children}</PlainBg>
);

/* ---------------- 이 화 전용 소품 (재사용 소재 아님 - REGISTRY 승격 보류) ---------------- */

const Pan: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <svg viewBox="0 0 400 260" width={width} style={style} shapeRendering="geometricPrecision">
    <ellipse cx={180} cy={140} rx={150} ry={90} fill={C.ink} opacity={0.14} />
    <ellipse cx={180} cy={128} rx={150} ry={90} fill={C.paper} stroke={C.ink} strokeWidth={SW} />
    <ellipse cx={180} cy={128} rx={122} ry={70} fill={C.roomDeep} stroke={C.ink} strokeWidth={SW_THIN} />
    <rect x={318} y={110} width={132} height={36} rx={18} fill={C.ink} />
  </svg>
);

const Pot: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <svg viewBox="0 0 380 320" width={width} style={style} shapeRendering="geometricPrecision">
    <rect x={40} y={110} width={300} height={190} rx={26} fill={C.paper} stroke={C.ink} strokeWidth={SW} />
    <rect x={44} y={150} width={292} height={146} rx={20} fill={C.water} opacity={0.55} />
    <ellipse cx={190} cy={110} rx={150} ry={26} fill={C.paper} stroke={C.ink} strokeWidth={SW} />
    <rect x={-6} y={148} width={54} height={26} rx={13} fill={C.ink} />
    <rect x={332} y={148} width={54} height={26} rx={13} fill={C.ink} />
  </svg>
);

const PaperTowel: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <svg viewBox="0 0 220 160" width={width} style={style} shapeRendering="geometricPrecision">
    <rect x={6} y={6} width={208} height={148} rx={18} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} />
    <g stroke={C.hill} strokeWidth={4} opacity={0.7}>
      <line x1={30} y1={6} x2={30} y2={154} />
      <line x1={70} y1={6} x2={70} y2={154} />
      <line x1={110} y1={6} x2={110} y2={154} />
      <line x1={150} y1={6} x2={150} y2={154} />
      <line x1={190} y1={6} x2={190} y2={154} />
      <line x1={6} y1={44} x2={214} y2={44} />
      <line x1={6} y1={82} x2={214} y2={82} />
      <line x1={6} y1={120} x2={214} y2={120} />
    </g>
  </svg>
);

const Droplet: React.FC<{ size: number; opacity?: number; style?: React.CSSProperties }> = ({
  size, opacity = 1, style,
}) => (
  <svg viewBox="0 0 60 80" width={size} style={{ opacity, ...style }} shapeRendering="geometricPrecision">
    <path
      d="M30,4 C46,34 54,48 54,60 C54,71 43,78 30,78 C17,78 6,71 6,60 C6,48 14,34 30,4 Z"
      fill={C.water} stroke={C.ink} strokeWidth={SW_THIN}
    />
  </svg>
);

/** 빵(토스트) - Apple/Meat 와 같은 browning 오버레이 규약. 이 화 전용(REGISTRY 승격 보류) */
const Toast: React.FC<{ width: number; browning?: number; style?: React.CSSProperties }> = ({
  width, browning = 0, style,
}) => {
  const b = clamp01(browning);
  return (
    <svg viewBox="0 0 200 220" width={width} style={style} shapeRendering="geometricPrecision">
      <path
        d="M14,220 L14,92 C14,36 52,12 100,12 C148,12 186,36 186,92 L186,220 Z"
        fill={C.goldSoft} stroke={C.ink} strokeWidth={SW}
      />
      {b > 0.001 ? (
        <path
          d="M14,220 L14,92 C14,36 52,12 100,12 C148,12 186,36 186,92 L186,220 Z"
          fill={C.browning} opacity={b * 0.8}
        />
      ) : null}
      <path
        d="M40,210 L40,96 C40,58 66,36 100,36 C134,36 160,58 160,96 L160,210"
        fill="none" stroke={C.paper} strokeWidth={SW_THIN * 0.7} opacity={0.5}
      />
    </svg>
  );
};

/** 커피 원두 - 같은 browning 규약, roast(0~1) */
const CoffeeBean: React.FC<{ width: number; roast?: number; style?: React.CSSProperties }> = ({
  width, roast = 0, style,
}) => {
  const r = clamp01(roast);
  return (
    <svg viewBox="0 0 200 260" width={width} style={style} shapeRendering="geometricPrecision">
      <ellipse cx={100} cy={130} rx={88} ry={120} fill={C.goldSoft} stroke={C.ink} strokeWidth={SW} />
      {r > 0.001 ? (
        <ellipse cx={100} cy={130} rx={88} ry={120} fill={C.browning} opacity={r * 0.85} />
      ) : null}
      <path
        d="M100,18 C78,80 122,178 100,242" fill="none" stroke={C.ink} strokeWidth={SW_THIN}
        strokeLinecap="round"
      />
    </svg>
  );
};

/* ---------------- 취소선 라벨 (ep06 S5Olbers 패턴 재사용) ---------------- */

const STRIKE_COLOR = '#FF6B5B';

const StrikeLabel: React.FC<{ text: string; strike: number; size: number }> = ({ text, strike, size }) => (
  <span
    style={{
      position: 'relative', display: 'inline-block', fontFamily: FONT, fontWeight: 800, fontSize: size,
      color: C.ink, whiteSpace: 'nowrap',
    }}
  >
    {text}
    <span
      style={{
        position: 'absolute', left: 0, top: '54%', height: 8, borderRadius: 4,
        width: `${clamp01(strike) * 100}%`, background: STRIKE_COLOR,
        transform: 'translateY(-50%)', boxShadow: '0 0 12px rgba(255,107,91,0.7)',
      }}
    />
  </span>
);

/* ---------------- 세로 온도계 (Ruler 세로 응용이 안 맞아 이 화 로컬로 처리, 승격 보류) ---------------- */

const THERMO_VB_W = 140;
const THERMO_VB_H = 460;
const THERMO_TUBE_W = 46;
const THERMO_TUBE_X = (THERMO_VB_W - THERMO_TUBE_W) / 2;
const THERMO_TUBE_TOP = 20;
const THERMO_TUBE_BOTTOM = 360;
const THERMO_BULB_R = 58;
const THERMO_BULB_CY = THERMO_TUBE_BOTTOM + THERMO_BULB_R * 0.55;

const Thermometer: React.FC<{
  width: number; x: number; y: number; value: number; maxValue?: number; markAt?: number;
  fillColor?: string; label?: React.ReactNode; markLabel?: string; markLabelOpacity?: number;
}> = ({ width, x, y, value, maxValue = 160, markAt, fillColor = C.coral, label, markLabel, markLabelOpacity = 1 }) => {
  const v = clamp01(value / maxValue);
  const tubeH = THERMO_TUBE_BOTTOM - THERMO_TUBE_TOP;
  const fillH = tubeH * v;
  const fillY = THERMO_TUBE_BOTTOM - fillH;
  const markY = markAt !== undefined
    ? THERMO_TUBE_BOTTOM - tubeH * Math.min(1, markAt / maxValue)
    : undefined;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, textAlign: 'center' }}>
      <svg viewBox={`0 0 ${THERMO_VB_W} ${THERMO_VB_H}`} width={width} style={{ overflow: 'visible' }}>
        <rect
          x={THERMO_TUBE_X} y={THERMO_TUBE_TOP} width={THERMO_TUBE_W} height={tubeH}
          rx={THERMO_TUBE_W / 2} fill={C.paper} stroke={C.ink} strokeWidth={SW}
        />
        <rect
          x={THERMO_TUBE_X + 6} y={fillY} width={THERMO_TUBE_W - 12} height={Math.max(0, fillH)}
          rx={(THERMO_TUBE_W - 12) / 2} fill={fillColor}
        />
        <circle cx={THERMO_VB_W / 2} cy={THERMO_BULB_CY} r={THERMO_BULB_R} fill={fillColor} stroke={C.ink} strokeWidth={SW} />
        {markY !== undefined ? (
          <line
            x1={THERMO_TUBE_X - 16} y1={markY} x2={THERMO_TUBE_X + THERMO_TUBE_W + 16} y2={markY}
            stroke={C.inkSoft} strokeWidth={5} strokeDasharray="10 8"
          />
        ) : null}
      </svg>
      {markLabel && markY !== undefined ? (
        <div
          style={{
            position: 'absolute', left: width + 8, top: markY * (width / THERMO_VB_W) - 20,
            fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.inkSoft, opacity: markLabelOpacity, whiteSpace: 'nowrap',
          }}
        >
          {markLabel}
        </div>
      ) : null}
      {label ? (
        <div
          style={{
            marginTop: 14, marginLeft: (width - 280) / 2, width: 280,
            fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.ink,
            wordBreak: 'keep-all', whiteSpace: 'normal',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/* ---------------- S1: 리액션 + 훅 - 팬 위 고기가 갈변, 바스트샷 립싱크 ---------------- */

const BUST_SIZE = 560;
const BUST_LEFT = -70;
const BUST_TOP = 620;
const PAN_WIDTH = 620;
const PAN_LEFT = CX - PAN_WIDTH / 2 + 90;
const PAN_TOP = 260;
const MEAT_WIDTH = 360;
// 팬(viewBox 400x260) 안쪽 타원 중심은 (180,128) - 고기를 그 중심에 맞춘다
const MEAT_LEFT = PAN_LEFT + (180 / 400) * PAN_WIDTH - MEAT_WIDTH / 2;
const MEAT_TOP = PAN_TOP + (128 / 260) * (PAN_WIDTH * 260 / 400) - (MEAT_WIDTH * 220 / 320) / 2;

export const S1Sear: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const t = progress(f, 0, 16);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const sear = progress(f, 4, Math.max(5, frames * 0.5));
  const panP = progress(f, 0, 14);
  return (
    <Scene>
      <div style={{ opacity: panP, transform: `scale(${0.9 + 0.1 * panP})`, transformOrigin: '60% 30%' }}>
        <Pan width={PAN_WIDTH} style={{ position: 'absolute', left: PAN_LEFT, top: PAN_TOP }} />
        <Meat width={MEAT_WIDTH} sear={sear} style={{ position: 'absolute', left: MEAT_LEFT, top: MEAT_TOP }} />
      </div>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S2: "산소 때문?" 팝인 -> 취소선 -> 페이드아웃 ---------------- */

export const S2Oxygen: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const popP = progress(f, 2, Math.round(frames * 0.28));
  const strikeP = progress(f, Math.round(frames * 0.34), Math.round(frames * 0.6));
  const fadeOut = progress(f, Math.round(frames * 0.74), Math.round(frames * 0.92));
  const scale = 0.7 + 0.3 * popP;
  return (
    <Scene>
      <div
        style={{
          position: 'absolute', left: '50%', top: 780, transform: `translateX(-50%) scale(${scale})`,
          opacity: popP * (1 - fadeOut),
        }}
      >
        <StrikeLabel text={label} strike={strikeP} size={92} />
      </div>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S3: 단백질 + 당분 -> 열 -> 마이야르 반응 (CellMergeDiagram) ---------------- */

const DIAG_W = 820;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 560;
const REACT_LABEL_Y = DIAG_Y + 700;

export const S3Maillard: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; proteinLabel: string; sugarLabel: string;
  heatLabel: string; maillardLabel: string;
}> = ({ f, frames, lines, proteinLabel, sugarLabel, heatLabel, maillardLabel }) => {
  const wallProgress = progress(f, 4, Math.max(5, frames * 0.3));
  const mergeProgress = progress(f, frames * 0.22, Math.max(frames * 0.22 + 1, frames * 0.52));
  const catalystProgress = progress(f, frames * 0.38, Math.max(frames * 0.38 + 1, frames * 0.62));
  const reactProgress = progress(f, frames * 0.56, Math.max(frames * 0.56 + 1, frames * 0.86));
  const labelP = progress(f, frames * 0.68, frames * 0.86);
  return (
    <Scene>
      <CellMergeDiagram
        width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        leftLabel={proteinLabel} rightLabel={sugarLabel}
        leftColor={C.coral} rightColor={C.gold}
        wallProgress={wallProgress} mergeProgress={mergeProgress}
        catalystProgress={catalystProgress} catalystLabel={heatLabel} catalystColor={C.gold}
        reactProgress={reactProgress} reactColor={C.browning}
      />
      {labelP > 0.001 ? (
        <Appear progress={labelP} from="scale">
          <Label x={CX} y={REACT_LABEL_Y} text={maillardLabel} size={52} color={C.ink} align="center" wrapWidth={780} />
        </Appear>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S4: 온도 비교 - 물 100도 vs 고기 겉면 140도+ ---------------- */

const THERMO4_W = 190;
const THERMO4_LEFT_X = CX - 320;
const THERMO4_RIGHT_X = CX + 130;
const THERMO4_Y = 300;

export const S4Compare: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; waterLabel: string; meatLabel: string;
}> = ({ f, frames, lines, waterLabel, meatLabel }) => {
  const fillP = progress(f, 6, Math.max(7, frames * 0.5));
  return (
    <Scene>
      <Thermometer
        width={THERMO4_W} x={THERMO4_LEFT_X} y={THERMO4_Y} value={fillP * 100} maxValue={160}
        fillColor={C.waterCool} label={waterLabel}
      />
      <Thermometer
        width={THERMO4_W} x={THERMO4_RIGHT_X} y={THERMO4_Y} value={fillP * 140} maxValue={160}
        fillColor={C.coral} label={meatLabel}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S5: 물기 닦아내기 -> 표면 온도가 100도 선을 넘는다 ---------------- */

const S5_MEAT_WIDTH = 300;
const S5_MEAT_LEFT = CX - S5_MEAT_WIDTH / 2;
const S5_MEAT_TOP = 260;
const S5_TOWEL_WIDTH = 260;
const S5_TOWEL_Y = 300;
const S5_TOWEL_START_X = -320;
const S5_TOWEL_END_X = CX - S5_TOWEL_WIDTH / 2 + 30;
const S5_DROPLET_LEFT = CX - 18;
const S5_DROPLET_TOP = 300;
const S5_THERMO_X = CX - THERMO4_W / 2;
const S5_THERMO_Y = 600;

export const S5DryOff: React.FC<{ f: number; frames: number; lines: CaptionLine[]; markLabel: string }> = ({
  f, frames, lines, markLabel,
}) => {
  const contactFrame = Math.round(frames * 0.42);
  const towelP = progress(f, Math.round(frames * 0.06), contactFrame);
  const towelX = S5_TOWEL_START_X + (S5_TOWEL_END_X - S5_TOWEL_START_X) * towelP;
  const dropletOpacity = 1 - progress(f, contactFrame, contactFrame + 8);
  const beforeVal = 55;
  const riseP = progress(f, contactFrame, Math.max(contactFrame + 1, frames * 0.92));
  const value = beforeVal + (150 - beforeVal) * riseP;
  const markLabelOpacity = progress(f, contactFrame + 10, contactFrame + 30);
  return (
    <Scene>
      <Meat width={S5_MEAT_WIDTH} sear={0.12} style={{ position: 'absolute', left: S5_MEAT_LEFT, top: S5_MEAT_TOP }} />
      {dropletOpacity > 0.01 ? (
        <Droplet size={70} opacity={dropletOpacity} style={{ position: 'absolute', left: S5_DROPLET_LEFT, top: S5_DROPLET_TOP }} />
      ) : null}
      {towelP > 0.001 && towelP < 1 ? (
        <PaperTowel width={S5_TOWEL_WIDTH} style={{ position: 'absolute', left: towelX, top: S5_TOWEL_Y }} />
      ) : null}
      <Thermometer
        width={THERMO4_W} x={S5_THERMO_X} y={S5_THERMO_Y} value={value} maxValue={160} markAt={100}
        fillColor={C.coral} markLabel={markLabel} markLabelOpacity={markLabelOpacity}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S6: 빵 껍질 / 커피 로스팅도 같은 원리 - 3분할 ---------------- */

const PANEL_W = 300;
const PANEL_GAP = 40;
const PANEL_TOTAL_W = PANEL_W * 3 + PANEL_GAP * 2;
const PANEL_LEFT0 = CX - PANEL_TOTAL_W / 2;
const PANEL_Y = 760;

export const S6SameReaction: React.FC<{ f: number; lines: CaptionLine[] }> = ({ f, lines }) => {
  const p1 = progress(f, 4, 26);
  const p2 = progress(f, 16, 38);
  const p3 = progress(f, 28, 50);
  const x0 = PANEL_LEFT0;
  const x1 = PANEL_LEFT0 + PANEL_W + PANEL_GAP;
  const x2 = PANEL_LEFT0 + (PANEL_W + PANEL_GAP) * 2;
  return (
    <Scene>
      <Appear progress={p1} from="scale">
        <Meat width={PANEL_W} sear={0.78} style={{ position: 'absolute', left: x0 + (PANEL_W - PANEL_W) / 2, top: PANEL_Y }} />
      </Appear>
      <Appear progress={p2} from="scale">
        <Toast width={PANEL_W * 0.72} browning={0.68} style={{ position: 'absolute', left: x1 + PANEL_W * 0.14, top: PANEL_Y - 40 }} />
      </Appear>
      <Appear progress={p3} from="scale">
        <CoffeeBean width={PANEL_W * 0.68} roast={0.8} style={{ position: 'absolute', left: x2 + PANEL_W * 0.16, top: PANEL_Y - 30 }} />
      </Appear>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};

/* ---------------- S7: 마무리 - 팬(갈색) vs 냄비(옅은 색), 바스트샷 립싱크 ---------------- */

// 팬(왼쪽)+냄비(오른쪽)를 안전영역(좌우 60px) 안에 나란히 배치한다. 이전 버전은 냄비가
// CX+220에서 시작해 화면 오른쪽 경계(W=1080)를 60px 넘겨 잘리는 결함이 있었다(프레임 검수
// f016에서 발견) - 두 소품 폭을 좌우 여백을 뺀 나머지 안에서 계산하도록 고쳤다.
const S7_PAN_WIDTH = 400;
const S7_PAN_LEFT = 60;
const S7_PAN_TOP = 320;
const S7_MEAT1_WIDTH = 250;
const S7_MEAT1_LEFT = S7_PAN_LEFT + (180 / 400) * S7_PAN_WIDTH - S7_MEAT1_WIDTH / 2;
const S7_MEAT1_TOP = S7_PAN_TOP + (128 / 260) * (S7_PAN_WIDTH * 260 / 400) - (S7_MEAT1_WIDTH * 220 / 320) / 2;

const S7_POT_WIDTH = 360;
const S7_POT_LEFT = W - 60 - S7_POT_WIDTH;
const S7_POT_TOP = 320;
// Pot viewBox(380x320)의 물 영역은 x=44~336, y=150~296. POT_WIDTH(360)로 스케일된 실제 표시
// 좌표로 다시 계산한다(뷰박스 폭과 표시 폭이 다르므로 1:1로 가정하지 않는다).
const S7_POT_SCALE = S7_POT_WIDTH / 380;
const S7_MEAT2_WIDTH = 190;
const S7_MEAT2_LEFT = S7_POT_LEFT + 190 * S7_POT_SCALE - S7_MEAT2_WIDTH / 2;
const S7_MEAT2_TOP = S7_POT_TOP + 223 * S7_POT_SCALE - (S7_MEAT2_WIDTH * 220 / 320) / 2;

export const S7Wrap: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));
  const revealP = progress(f, 2, 18);
  return (
    <Scene>
      <div style={{ opacity: revealP }}>
        <Pan width={S7_PAN_WIDTH} style={{ position: 'absolute', left: S7_PAN_LEFT, top: S7_PAN_TOP }} />
        <Meat width={S7_MEAT1_WIDTH} sear={1} style={{ position: 'absolute', left: S7_MEAT1_LEFT, top: S7_MEAT1_TOP }} />
        <Pot width={S7_POT_WIDTH} style={{ position: 'absolute', left: S7_POT_LEFT, top: S7_POT_TOP }} />
        <Meat width={S7_MEAT2_WIDTH} sear={0} style={{ position: 'absolute', left: S7_MEAT2_LEFT, top: S7_MEAT2_TOP }} />
      </div>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={POSES.idle} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </Scene>
  );
};
