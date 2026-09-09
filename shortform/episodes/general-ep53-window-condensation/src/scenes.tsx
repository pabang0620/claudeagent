/** 이 화(general-ep53, "겨울에 유리창에 김 서리는 이유") 전용 장면.
 *
 *  s1(캐릭터가 실내에서 창문을 봄, 아래쪽부터 김이 번짐) -> s2(눈에 안 보이는 수증기 입자,
 *  점선 원으로 표시) -> s3(따뜻한 공기일수록 수증기를 더 머금음, CompareBars) -> s4(실내
 *  공기가 유리에 닿는 순간 그 접촉면만 온도가 뚝 떨어짐) -> s5(입자가 사라지고 그 자리에
 *  큰 물방울이 맺힘) -> s6(유리창 단면: 실외 차가움/실내 따뜻함, 안쪽 면에만 김) -> s7(차가운
 *  음료 컵 표면에도 같은 원리로 물방울이 맺힘).
 *
 *  이 화의 핵심 그림은 WindowPane(신규, props/에 등록) - REGISTRY 3절 확인 완료, 유리창·창문
 *  소품이 라이브러리에 없어 새로 만들었다. 오케스트레이터 지시대로 물방울은 큰 것 3~4개로만
 *  (CondensationDroplets, 점 여러 개 금지), 수증기는 큰 물결선 2~3개로만, 창밖 풍경은 하늘+
 *  언덕 실루엣 하나로만 단순화했다. s6는 WindowPane crossSection 모드로 실외/실내를 색 대비로
 *  나눈다. s7는 기존 IceFloatCup 위에 CondensationDroplets를 그대로 얹어 재사용했다(오버레이
 *  좌표는 IceFloatCup 내부 geometry - CUP_X/CUP_TOP/CUP_W/CUP_H, VB_W=300 - 를 그대로
 *  옮겨온 것이라 IceFloatCup.tsx가 바뀌면 같이 맞춰야 한다).
 */
import React from 'react';
import {
  Actor, C, Caption, CompareBars, CondensationDroplets, FONT, FPS, GROUND, IceFloatCup, POSES,
  RADIUS, ThemedIcon, PlainBg, W, WindowPane, WINDOW_VB_H, WINDOW_VB_W, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: Record<string, number[]> }

/* ================================================================
 * S1: 캐릭터가 실내에서 창문을 봄. 아래쪽부터 김이 서서히 번진다.
 * ================================================================ */

/* 창은 화면 오른쪽, 캐릭터는 왼쪽 - 각 바운딩박스 사이에 충분한 간격을 둬서
 * "캐릭터가 다이어그램을 가리지 않게" 한다(원칙 5 예방 체크리스트 B절, RIG.CX/RIG.W ≈ 0.5
 * 이므로 캐릭터 박스는 centerX 좌우로 거의 대칭이다) */
const S1_WINDOW_W = 520;
const S1_WINDOW_X = 540;
const S1_WINDOW_Y = 300;
const S1_ACTOR_CENTER_X = 190;
const S1_ACTOR_SIZE = 460;

export const S1Window: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const fog = progress(f, 12, frames - 8) * 0.75;
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} groundColor={C.roomDeep}>
      <WindowPane f={f} width={S1_WINDOW_W} x={S1_WINDOW_X} y={S1_WINDOW_Y} fogProgress={fog} />
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={GROUND} pose={POSES.idle} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S2: 공기 중 눈에 안 보이는 수증기 입자(점선 원)
 * ================================================================ */

/** 고정 배치(Math.random 미사용, 원칙 3). 점을 촘촘하게 뿌리지 않고 중간 크기 원 5개로 제한 */
const VAPOR_SPOTS = [
  { x: 300, y: 620, r: 46, delay: 0, phase: 0 },
  { x: 640, y: 520, r: 58, delay: 6, phase: 2 },
  { x: 820, y: 760, r: 42, delay: 12, phase: 4 },
  { x: 380, y: 900, r: 50, delay: 18, phase: 1 },
  { x: 700, y: 980, r: 40, delay: 24, phase: 3 },
];

export const S2Vapor: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const reveal = progress(f, 4, 30);
  const badgeP = progress(f, 20, 50);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1400} style={{ position: 'absolute', left: 0, top: 0 }}>
        {VAPOR_SPOTS.map((v) => {
          const local = progress(f, v.delay, v.delay + 24);
          const bob = Math.sin((f + v.phase * 10) / 26) * 10;
          return (
            <circle
              key={`${v.x}-${v.y}`}
              cx={v.x} cy={v.y + bob} r={v.r * (0.6 + 0.4 * local)}
              fill="none" stroke={C.waterCool} strokeWidth={7} strokeDasharray="10 12"
              opacity={reveal * local * 0.85}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute', left: CX, top: 420, transform: 'translate(-50%, 0)', opacity: badgeP,
          padding: '18px 34px', background: C.paper, border: `7px solid ${C.ink}`,
          borderRadius: RADIUS.pill, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.ink,
          whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <span>{t.s2Label}</span>
        <span style={{ color: C.inkSoft, fontSize: 32 }}>{t.s2Badge}</span>
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3: 따뜻한 공기일수록 수증기를 더 많이 머금는다 (CompareBars)
 * ================================================================ */

const S3_X = 190;
const S3_Y = 640;
const S3_ROW_GAP = 300;
const S3_PX_PER_UNIT = 6.2;

export const S3Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <CompareBars
        x={S3_X} y={S3_Y} pxPerUnit={S3_PX_PER_UNIT} rowGap={S3_ROW_GAP} labelSize={48} frame={f}
        items={[
          { label: t.s3CoolAir, value: 38, color: C.waterCool, at: 6, thickness: 70 },
          { label: t.s3WarmAir, value: 100, color: C.coral, at: 28, thickness: 70 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S4: 실내 공기가 유리에 닿는 순간, 그 접촉면만 온도가 뚝 떨어짐
 * ================================================================ */

const S4_WINDOW_W = 620;
const S4_WINDOW_X = CX - S4_WINDOW_W / 2;
const S4_WINDOW_Y = 380;

export const S4Contact: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const contact = progress(f, 10, frames - 20);
  const dropY = 8 + contact * 46;
  const iconOpacity = progress(f, 10, 34);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <WindowPane f={f} width={S4_WINDOW_W} x={S4_WINDOW_X} y={S4_WINDOW_Y} contactProgress={contact} />
      <div
        style={{
          position: 'absolute', left: CX - 44, top: S4_WINDOW_Y - 150 + dropY, opacity: iconOpacity,
        }}
      >
        <ThemedIcon name="thermometer" size={88} color={C.coral} strokePx={11} />
      </div>
      <div
        style={{
          position: 'absolute', left: CX - 34, top: S4_WINDOW_Y - 44, opacity: contact,
        }}
      >
        <ThemedIcon name="arrow-down" size={68} color={C.waterCool} strokePx={11} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: 온도가 떨어져 입자가 사라지고 그 자리에 큰 물방울이 맺힘
 * ================================================================ */

const S5_WINDOW_W = 600;
const S5_WINDOW_X = CX - S5_WINDOW_W / 2;
const S5_WINDOW_Y = 320;

/** s2와 같은 시각 언어(점선 원)를 재사용해 "입자가 사라지고 물방울로 바뀐다"는 인과를
 *  좌표로 보여준다. 유리 앞쪽에 옅게 겹쳐두고 dropletProgress가 오를수록 사라진다 */
const S5_VAPOR_SPOTS = [
  { fx: 0.28, fy: 0.32, r: 26 },
  { fx: 0.68, fy: 0.24, r: 22 },
  { fx: 0.5, fy: 0.5, r: 24 },
];

/** WindowPane.tsx 내부 geometry(FRAME_X=10/GLASS_PAD=34, viewBox 520x700)를 그대로 옮겨와
 *  유리 영역의 화면 좌표를 계산한다. WindowPane.tsx의 GLASS_PAD 값이 바뀌면 같이 맞춰야 한다 */
const S5_SCALE = S5_WINDOW_W / WINDOW_VB_W;
const S5_GLASS_X = S5_WINDOW_X + 44 * S5_SCALE;
const S5_GLASS_Y = S5_WINDOW_Y + 44 * S5_SCALE;
const S5_GLASS_W = (WINDOW_VB_W - 20 - 68) * S5_SCALE;
const S5_GLASS_H = (WINDOW_VB_H - 20 - 68) * S5_SCALE;

export const S5Droplets: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const drop = progress(f, 16, frames - 16);
  const fog = 0.4;
  const glassX = S5_GLASS_X;
  const glassY = S5_GLASS_Y;
  const glassW = S5_GLASS_W;
  const glassH = S5_GLASS_H;

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <WindowPane f={f} width={S5_WINDOW_W} x={S5_WINDOW_X} y={S5_WINDOW_Y} fogProgress={fog} dropletProgress={drop} />
      <svg width={W} height={1400} style={{ position: 'absolute', left: 0, top: 0 }}>
        {S5_VAPOR_SPOTS.map((v) => (
          <circle
            key={`${v.fx}-${v.fy}`}
            cx={glassX + v.fx * glassW} cy={glassY + v.fy * glassH} r={v.r}
            fill="none" stroke={C.waterCool} strokeWidth={6} strokeDasharray="8 10"
            opacity={(1 - drop) * 0.8}
          />
        ))}
      </svg>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: 유리창 단면 - 실외(차가움)/실내(따뜻함), 안쪽 면에만 김
 * ================================================================ */

const S6_WINDOW_W = 640;
const S6_WINDOW_X = CX - S6_WINDOW_W / 2;
const S6_WINDOW_Y = 440;

export const S6CrossSection: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const fog = progress(f, 20, frames - 20);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WindowPane
        f={f} width={S6_WINDOW_W} x={S6_WINDOW_X} y={S6_WINDOW_Y} crossSection fogProgress={fog}
        outdoorLabel={t.s6Outdoor} indoorLabel={t.s6Indoor}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 차가운 음료 컵 표면에도 물방울이 맺힘 (같은 원리)
 * ================================================================ */

/** IceFloatCup 내부 geometry(300x620 viewBox)를 그대로 옮겨와 CondensationDroplets 오버레이
 *  좌표를 계산한다. IceFloatCup.tsx의 CUP_X/CUP_TOP/CUP_W/CUP_H 가 바뀌면 같이 맞춰야 한다 */
const CUP_VB_W = 300;
const CUP_X_LOCAL = 62;
const CUP_TOP_LOCAL = 230;
const CUP_W_LOCAL = 176;
const CUP_H_LOCAL = 340;

const S7_CUP_W = 380;
const S7_CUP_X = CX - S7_CUP_W / 2;
const S7_CUP_Y = 420;

export const S7Cup: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const drop = progress(f, 10, frames - 14);
  const scale = S7_CUP_W / CUP_VB_W;

  return (
    <PlainBg top={C.sky} bottom={C.paper} groundColor={C.hill}>
      <IceFloatCup width={S7_CUP_W} x={S7_CUP_X} y={S7_CUP_Y} liquidLevel={0.62} mode="liquid" temp="cold" />
      {/* color를 명시적으로 ink 로 준다 - 기본값(C.waterCool)은 컵 안 액체색(temp='cold')과
          똑같아서 액체 위에 겹치는 물방울이 배경에 묻혀 안 보이는 결함이 실측으로 확인됐다
          (스틸 선점검, f1257 크롭에서 4개 중 1개만 보임) */}
      <CondensationDroplets
        x={S7_CUP_X + CUP_X_LOCAL * scale} y={S7_CUP_Y + CUP_TOP_LOCAL * scale}
        width={CUP_W_LOCAL * scale} height={CUP_H_LOCAL * scale} dropletProgress={drop} color={C.ink}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
