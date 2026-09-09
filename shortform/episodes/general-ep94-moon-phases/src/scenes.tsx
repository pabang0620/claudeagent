/** 이 화(general-ep94, "달 모양이 바뀌는 게 그림자 때문이 아닌 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(오해 - 그림자가 달을 덮는 이미지 + X) -> s2(월식 - 실제 현상, 훨씬 드묾, 별개) ->
 *  s3(태양이 달의 절반을 비춤, 클로즈업) -> s4(궤도 위 여러 지점 - 같은 절반이 빛나지만
 *  보이는 부분이 달라짐, 지구에서 보이는 모습 인셋) -> s5(초승달-반달-보름달 순서) ->
 *  s6(약 한 달 주기 + '달'이라는 말의 유래 - 곁가지, 이런 이야기가 있어요 표시) ->
 *  s7(그믐/보름 나란히 비교).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - X 표시는 반드시 s1(오해: 그림자가 달을 가린다는 통념) 위에만 붙는다. s2(월식)는 실제로
 *     일어나는 현상이라 X를 얹지 않는다 - 대신 "월식"이라는 라벨과 함께 "지구 그림자 때문에
 *     모양이 바뀐다는 것과는 다른, 훨씬 드문 별개의 현상"임을 정렬 구도 자체(태양-지구-달이
 *     일직선일 때만 일어남)로 보여준다(70화 사고 재발 방지 - MoonPhaseDiagram.tsx 파일 상단
 *     주석 참고).
 *   - 천체는 표면 디테일 없는 단순한 원으로만 그린다(오케스트레이터 지시).
 *   - s5·s7의 위상 순서는 MoonPhaseDiagram.tsx의 moonPhasePath 공식(반달=직선 터미네이터,
 *     신월/보름=원과 겹침)으로 계산되므로 좌표를 손으로 다시 그리지 않는다.
 *
 *  어느 장면도 캐릭터가 직접 말하는 순간이 아니다(전부 3인칭 설명 내레이션, 이 화 자산
 *  목록에 캐릭터가 없다 - 62화 EarthOrbitDiagram과 같은 순수 다이어그램 구성). 그래서
 *  ko_mouth.json은 파이프라인 표준 절차로 만들었지만 이 화 어디서도 import하지 않는다
 *  (ep19/ep21/ep23/ep25/ep60/ep62와 동일 원칙).
 */
import React from 'react';
import {
  C, Caption, FONT, FPS, FlashOverlay, MoonPhaseDiagram, MoonPhaseIcon, NightSkyBg, QMark,
  W, clamp01, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const STR = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** MoonPhaseDiagram 의 로컬 viewBox 좌표(0~900)를 화면 좌표로 변환한다. 다이어그램 내부의
 *  고정 배치(오해 달/월식 태양-지구-달)는 좌표가 정해져 있어(파일 상단 주석) 눈대중이 아니라
 *  이 변환식으로 정확히 라벨 위치를 잡는다. */
function toScreen(lx: number, ly: number, width: number, x: number, y: number) {
  const s = width / 900;
  return { x: x + lx * s, y: y + ly * s };
}

/** 정사각형 viewBox 다이어그램을 화면 중심점에 맞추는 좌상단 좌표 */
function centeredXY(width: number, targetX: number, targetY: number) {
  return { x: targetX - width / 2, y: targetY - width / 2 };
}

/** 작은 알약 모양 뱃지 ("이런 이야기가 있어요" 등 곁가지 표시). 이 화 로컬 - 다른 화에서
 *  두 번째로 필요해지면 assets/scenes 로 승격을 검토한다(원칙 0). */
const FolkloreBadge: React.FC<{ x: number; y: number; text: string; opacity: number }> = ({
  x, y, text, opacity,
}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity,
      padding: '16px 34px', borderRadius: 999, border: `5px solid ${C.cream}`,
      background: 'rgba(255,244,228,0.14)', color: C.cream, fontFamily: FONT, fontWeight: 700,
      fontSize: 38, whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

/* ============================================================
 * S1: 오해 - 지구 그림자가 달을 덮는다는 통념 + X 표시
 * ============================================================ */
const S1_WIDTH = 820;
const S1_TARGET_Y = 800;

export const S1Myth: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const { x, y } = centeredXY(S1_WIDTH, CX, S1_TARGET_Y);
  const mythP = progress(f, 4, Math.round(frames * 0.56));
  const xAt = Math.round(frames * 0.62);
  const xA = progress(f, xAt, xAt + 16);

  return (
    <>
      <NightSkyBg stars={40} seed={94} frame={f} moon={null} horizon={null} />
      <MoonPhaseDiagram
        width={S1_WIDTH} x={x} y={y} mythProgress={mythP}
        stroke={C.cream} moonDarkColor={C.nightSoft}
      />
      {xA > 0.01 ? (
        <QMark
          size={460} glyph="X" color={C.coral} outline={C.cream}
          style={{
            left: CX, top: S1_TARGET_Y,
            transform: `translate(-50%,-50%) scale(${0.72 + 0.28 * xA})`, opacity: xA,
          }}
        />
      ) : null}
      <FlashOverlay frame={f} at={xAt} color={C.coral} peak={0.28} rise={4} fall={18} />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S2: 월식 - 실제로 일어나는, 훨씬 드문 별개의 현상 (태양-지구-달 일직선)
 * ============================================================ */
const S2_WIDTH = 820;
const S2_TARGET_Y = 800;

export const S2Eclipse: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const { x, y } = centeredXY(S2_WIDTH, CX, S2_TARGET_Y);
  const eclipseP = progress(f, 10, Math.round(frames * 0.82));
  const labelA = progress(f, 16, 40);
  const moonPt = toScreen(792, 450, S2_WIDTH, x, y);

  return (
    <>
      <NightSkyBg stars={30} seed={95} frame={f} moon={null} horizon={null} />
      <MoonPhaseDiagram
        width={S2_WIDTH} x={x} y={y} eclipseProgress={eclipseP}
        stroke={C.cream}
      />
      <div
        style={{
          position: 'absolute', left: moonPt.x, top: moonPt.y - 130, transform: 'translate(-50%,-50%)',
          opacity: labelA, color: C.cream, fontFamily: FONT, fontWeight: 700, fontSize: 54,
          background: C.ink, border: `5px solid ${C.cream}`, borderRadius: 20, padding: '10px 28px',
        }}
      >
        {STR.s2EclipseLabel}
      </div>
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S3: 태양이 달의 절반을 비춤 (클로즈업, 항상 오른쪽 절반)
 * ============================================================ */
const S3_WIDTH = 860;
const S3_TARGET_Y = 820;

export const S3LitHalf: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const { x, y } = centeredXY(S3_WIDTH, CX, S3_TARGET_Y);
  const litP = progress(f, 6, Math.round(frames * 0.68));

  return (
    <>
      <NightSkyBg stars={26} seed={96} frame={f} moon={null} horizon={null} />
      <MoonPhaseDiagram
        width={S3_WIDTH} x={x} y={y} litHalfProgress={litP}
        stroke={C.cream} moonDarkColor={C.nightSoft}
      />
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S4: 궤도 위 여러 지점 - 같은 절반이 빛나지만 보이는 부분이 달라짐
 * ============================================================ */
const S4_WIDTH = 820;
const S4_TARGET_Y = 800;
const S4_START_ANGLE = 250;
const S4_SWEEP_DEG = 340;

export const S4Orbit: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const { x, y } = centeredXY(S4_WIDTH, CX, S4_TARGET_Y);
  const orbitAngle = S4_START_ANGLE + progress(f, 4, frames - 6) * S4_SWEEP_DEG;
  const orbitReveal = progress(f, 0, 20);
  const insetPt = toScreen(148, 762, S4_WIDTH, x, y);
  const labelA = progress(f, 24, 46);

  return (
    <>
      <NightSkyBg stars={28} seed={97} frame={f} moon={null} horizon={null} />
      <MoonPhaseDiagram
        width={S4_WIDTH} x={x} y={y} orbitAngle={orbitAngle} orbitReveal={orbitReveal}
        stroke={C.cream} moonDarkColor={C.nightSoft}
      />
      <div
        style={{
          position: 'absolute', left: insetPt.x, top: insetPt.y + 110, transform: 'translate(-50%,-50%)',
          opacity: labelA, color: C.cream, fontFamily: FONT, fontWeight: 700, fontSize: 32,
          textAlign: 'center', width: 320, wordBreak: 'keep-all',
        }}
      >
        {STR.s4EarthViewLabel}
      </div>
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S5: 초승달 - 반달 - 보름달 순서로 나타남
 * ============================================================ */
const S5_ICON_Y = 800;
const S5_ICON_W = 320;
const S5_PHASES = [
  { p: 0.14, dx: -300, label: STR.s5CrescentLabel },
  { p: 0.25, dx: 0, label: STR.s5HalfLabel },
  { p: 0.5, dx: 300, label: STR.s5FullLabel },
];

export const S5Sequence: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  void frames;

  return (
    <>
      <NightSkyBg stars={24} seed={98} frame={f} moon={null} horizon={null} />
      {S5_PHASES.map((ph, i) => {
        const appearAt = 10 + i * 42;
        const reveal = progress(f, appearAt, appearAt + 20);
        const labelA = progress(f, appearAt + 8, appearAt + 26);
        return (
          <React.Fragment key={i}>
            <MoonPhaseIcon
              width={S5_ICON_W} x={CX + ph.dx} y={S5_ICON_Y} phase={ph.p} reveal={reveal}
              stroke={C.cream} litColor={C.goldSoft} darkColor={C.nightSoft}
            />
            <div
              style={{
                position: 'absolute', left: CX + ph.dx, top: S5_ICON_Y + S5_ICON_W / 2 + 30,
                transform: 'translate(-50%,-50%)', opacity: labelA, color: C.cream, fontFamily: FONT,
                fontWeight: 700, fontSize: 40, whiteSpace: 'nowrap',
              }}
            >
              {ph.label}
            </div>
          </React.Fragment>
        );
      })}
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S6: 약 한 달 주기(위상 8칸 링) + '달'이라는 말의 유래 (곁가지, 이런 이야기가 있어요)
 * ============================================================ */
const S6_RING_CX = CX;
const S6_RING_CY = 860;
const S6_RING_R = 300;
const S6_ICON_W = 148;
const S6_STEPS = 8;

export const S6Cycle: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const entranceEnd = Math.round(frames * 0.42);
  const badgeA = progress(f, 6, 30);
  const wordA = progress(f, 18, 46);
  const activeIdx = Math.floor(progress(f, entranceEnd, Math.max(entranceEnd + 1, frames - 12)) * S6_STEPS) % S6_STEPS;

  return (
    <>
      <NightSkyBg stars={22} seed={99} frame={f} moon={null} horizon={null} />
      <FolkloreBadge x={CX} y={270} text={STR.s6FolkloreBadge} opacity={badgeA} />
      {Array.from({ length: S6_STEPS }, (_, i) => {
        const angle = (i / S6_STEPS) * Math.PI * 2 - Math.PI / 2;
        const ix = S6_RING_CX + Math.cos(angle) * S6_RING_R;
        const iy = S6_RING_CY + Math.sin(angle) * S6_RING_R;
        const appearAt = 20 + i * 8;
        const reveal = progress(f, appearAt, appearAt + 16);
        const isActive = f >= entranceEnd && i === activeIdx;
        return (
          <React.Fragment key={i}>
            {isActive ? (
              <div
                style={{
                  position: 'absolute', left: ix, top: iy, width: S6_ICON_W + 34, height: S6_ICON_W + 34,
                  transform: 'translate(-50%,-50%)', borderRadius: '50%',
                  border: `7px solid ${C.coral}`, opacity: 0.9,
                }}
              />
            ) : null}
            <MoonPhaseIcon
              width={S6_ICON_W} x={ix} y={iy} phase={i / S6_STEPS} reveal={reveal}
              stroke={C.cream} litColor={C.goldSoft} darkColor={C.nightSoft}
            />
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: 'absolute', left: S6_RING_CX, top: S6_RING_CY, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * wordA})`,
          opacity: wordA, color: C.coral, fontFamily: FONT, fontWeight: 800, fontSize: 190,
          WebkitTextStroke: `4px ${C.cream}`, paintOrder: 'stroke fill',
        }}
      >
        {STR.s6MoonWord}
      </div>
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};

/* ============================================================
 * S7: 그믐 / 보름 나란히 비교
 * ============================================================ */
const S7_ICON_Y = 800;
const S7_ICON_W = 380;

export const S7NewFull: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  void frames;
  const revealL = progress(f, 8, 32);
  const revealR = progress(f, 26, 50);

  return (
    <>
      <NightSkyBg stars={20} seed={100} frame={f} moon={null} horizon={null} />
      <MoonPhaseIcon
        width={S7_ICON_W} x={CX - 260} y={S7_ICON_Y} phase={0} reveal={revealL}
        stroke={C.cream} litColor={C.goldSoft} darkColor={C.nightSoft}
      />
      <div
        style={{
          position: 'absolute', left: CX - 260, top: S7_ICON_Y + S7_ICON_W / 2 + 34,
          transform: 'translate(-50%,-50%)', opacity: revealL, color: C.cream, fontFamily: FONT,
          fontWeight: 700, fontSize: 46,
        }}
      >
        {STR.s7NewMoonLabel}
      </div>
      <MoonPhaseIcon
        width={S7_ICON_W} x={CX + 260} y={S7_ICON_Y} phase={0.5} reveal={revealR}
        stroke={C.cream} litColor={C.goldSoft} darkColor={C.nightSoft}
      />
      <div
        style={{
          position: 'absolute', left: CX + 260, top: S7_ICON_Y + S7_ICON_W / 2 + 34,
          transform: 'translate(-50%,-50%)', opacity: revealR, color: C.cream, fontFamily: FONT,
          fontWeight: 700, fontSize: 46,
        }}
      >
        {STR.s7FullMoonLabel}
      </div>
      <Caption line={line} t={f / FPS} dark />
    </>
  );
};
