/** 이 화(general-ep89, "벽 너머로 소리가 들리는 이유") 전용 장면. 문구는 전부 strings.ts
 *  에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(Actor 전신, 벽 옆에서 머리를 기울여 벽에 귀를 가져다 대는 동작, 무성) -> s2(BustActor
 *  리액션 "어? 벽 너머인데 왜 이렇게 소리가 다 들리지?") -> s3(WallVibrationDiagram,
 *  emitProgress - 음원 쪽 공기에 파동이 퍼져나감) -> s4(같은 다이어그램, vibrateProgress -
 *  벽이 아주 살짝 떨림) -> s5(transmitProgress - 벽 반대쪽 공기가 다시 흔들려 귀까지 전달) ->
 *  s6(freqProgress - 고음/짧은 파장 vs 저음/긴 파장이 같은 벽을 통과하는 정도 비교, "높은
 *  소리"/"낮은 소리" 라벨) -> s7(같은 다이어그램을 freqProgress=1로 유지한 채 저음 쪽에만
 *  리듬 펄스를 얹어 "가사보다 쿵쿵거리는 저음만 유독 크게 들린다"는 마무리를 시각으로 전달,
 *  텍스트 없음).
 *
 *  s3~s7은 같은 WallVibrationDiagram 인스턴스를 같은 위치·크기로 이어서 쓴다(VolcanoDiagram·
 *  NailRootDiagram과 같은 "단일 컴포넌트로 여러 화면 커버" 설계, 21화 이후 결함 D - "다음
 *  장면에서 이전 상태를 명시적으로 유지시킨다"). s4/s5는 emitProgress=1을 그대로 유지하고,
 *  s7은 s6의 freqProgress=1 상태를 그대로 유지한 채 펄스만 얹는다.
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 물결선은 굵게 2~3개로만 표현한다(WallVibrationDiagram 내부에 이미 반영, 여기서는
 *     그 소품을 호출만 한다). 작은 점을 뿌리지 않는다.
 *   - 벽은 단순한 사각 블록으로만 그린다(WallVibrationDiagram·WallPanel 둘 다 이 원칙을
 *     지킨다 - 벽돌 무늬 등 질감 묘사 없음).
 *   - 저음이 벽을 더 잘 통과한다는 것을 s6에서 진폭(벽 통과 후 물결 크기) 차이로 확실히
 *     보여준다.
 *
 *  s3~s7은 전부 다이어그램 중심 장면이라 립싱크를 넣지 않는다(원칙 - 다이어그램이 초점인
 *  장면은 얼굴이 아니라 다이어그램이 주인공). 캐릭터가 실제로 등장해 말하는 s2만
 *  mouthAt/mouthProp을 쓴다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, GROUND, H, Label, PlainBg, POSES, PulseRing, W,
  WallVibrationDiagram, WALL_VIBRATION_HIGH_LABEL_PT, WALL_VIBRATION_LOW_LABEL_PT,
  WALL_VIBRATION_VB_W, WALL_VIBRATION_WALL_PT,
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

/** 방 사이를 가르는 벽(에피소드 로컬 - 단순한 사각 패널 하나 + 이음선 하나, 질감 묘사 없음,
 *  오케스트레이터 지시). s1·s7에서 실사 장면 배경으로 재사용한다 */
const WallPanel: React.FC<{ x: number; width: number; opacity?: number }> = ({ x, width, opacity = 1 }) => (
  <svg width={width} height={H} style={{ position: 'absolute', left: x, top: 0, opacity }}>
    <rect x={0} y={0} width={width} height={H} fill={C.roomDeep} />
    <line x1={width * 0.4} y1={0} x2={width * 0.4} y2={H} stroke={C.ink} strokeWidth={4} opacity={0.16} />
    <rect x={0} y={H - 90} width={width} height={90} fill={C.ink} opacity={0.06} />
  </svg>
);

/** 벽 근처에 옅게 어른거리는 물결 힌트(에피소드 로컬 - "이미 소리가 들려오고 있다"는 것을
 *  글자 없이 예고). WallVibrationDiagram의 잔떨림선과 같은 레시피(짧은 세로 sine)를 이
 *  화면 좌표계에 맞춰 로컬로 다시 그린다(지역성 우선 - 파일 간 강제 공통화 안 함) */
function vWave(x: number, y0: number, y1: number, amp: number, cycles: number): string {
  const len = y1 - y0; const steps = 12; const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const ly = (len * i) / steps;
    const xx = x + Math.sin((ly / len) * Math.PI * 2 * cycles) * amp;
    pts.push(`${xx.toFixed(1)},${(y0 + ly).toFixed(1)}`);
  }
  return pts.join(' ');
}

/* ============================================================
 * S1: 벽 옆에서 머리를 기울여 귀를 벽에 가져다 댐 (전신, 무성)
 * ============================================================ */
const S1_WALL_X = 760;
const S1_WALL_W = 320;
/** 처음 780/GROUND(1250)으로 스틸을 뽑아보니 캐릭터가 화면 상하로 지나치게 작고
 *  위·아래 여백이 과다했다(스틸 선점검에서 발견, 원칙 5). 키우고 바닥선을 낮춰 세로 채움을
 *  늘렸다 */
const S1_ACTOR_SIZE = 1050;
const S1_ACTOR_CENTER_X = 560;
const S1_ACTOR_GROUND = 1350;
const S1_TILT_MAX = 30;
/** 귀가 벽에 닿는 순간 - Episode.tsx가 wall_thump SFX를 이 프레임에 맞춰 배치한다(원칙 7) */
export const S1_CONTACT_AT_FRAME = 20;

export const S1Listen: React.FC<{ f: number }> = ({ f }) => {
  const leanT = progress(f, 0, 24);
  const hintT = progress(f, S1_CONTACT_AT_FRAME + 4, S1_CONTACT_AT_FRAME + 34);
  const pose: Pose = { ...POSES.idle, headTilt: (POSES.idle.headTilt ?? 0) + S1_TILT_MAX * leanT };

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={S1_ACTOR_GROUND}>
      <WallPanel x={S1_WALL_X} width={S1_WALL_W} />
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={S1_ACTOR_GROUND} pose={pose} />
      {hintT > 0.02 ? (
        <svg
          width={100} height={200}
          style={{ position: 'absolute', left: S1_WALL_X - 46, top: S1_ACTOR_GROUND - 700, opacity: hintT * 0.55 }}
        >
          <polyline
            points={vWave(30, 20, 180, 9, 2.4)} fill="none" stroke={C.coral} strokeWidth={8}
            strokeLinecap="round" strokeLinejoin="round"
          />
          <polyline
            points={vWave(64, 40, 160, 7, 2.2)} fill="none" stroke={C.coral} strokeWidth={8}
            strokeLinecap="round" strokeLinejoin="round" opacity={0.7}
          />
        </svg>
      ) : null}
    </PlainBg>
  );
};

/* ============================================================
 * S2: "어? 벽 너머인데 왜 이렇게 소리가 다 들리지?" (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const puzzleT = progress(f, 0, 18);
  const glanceWag = 5 * Math.sin((f / 40) * Math.PI * 2) * progress(f, 18, 34);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT * 0.75);
  pose.headTilt = (pose.headTilt ?? 0) + glanceWag;
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3~S7: WallVibrationDiagram 공유 레이아웃
 * ============================================================ */
/** WallVibrationDiagram의 viewBox가 세로로 긴 700x1000이라(원칙 5 - 처음 900x520 가로
 *  비율로 스틸을 뽑아보니 화면 상하 여백이 과다했다), 폭 760으로 띄우면 세로 안전영역을
 *  충분히 채운다 */
const DIAG_WIDTH = 760;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 340;
const DIAG_SCALE = DIAG_WIDTH / WALL_VIBRATION_VB_W;

function diagPt(p: { x: number; y: number }) {
  return { x: DIAG_X + p.x * DIAG_SCALE, y: DIAG_Y + p.y * DIAG_SCALE };
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ---------------- S3: 음원 쪽 공기에 파동이 퍼져나감 ---------------- */
export const S3Emit: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const emitP = progress(f, 6, Math.round(frames * 0.82));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WallVibrationDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} emitProgress={emitP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 벽이 아주 살짝 떨림 ---------------- */
export const S4Vibrate: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const vibrateP = progress(f, 4, Math.round(frames * 0.7));
  const wallPt = diagPt(WALL_VIBRATION_WALL_PT);
  const ringSize = 190;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WallVibrationDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
        emitProgress={1} vibrateProgress={vibrateP}
      />
      <PulseRing
        x={wallPt.x - ringSize / 2} y={wallPt.y - ringSize / 2} size={ringSize} frame={f}
        progress={vibrateP} color={C.coralSoft} periodFrames={30}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 벽 반대쪽 공기가 다시 흔들려 귀까지 전달 ---------------- */
export const S5Transmit: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const transmitP = progress(f, 6, Math.round(frames * 0.8));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WallVibrationDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
        emitProgress={1} vibrateProgress={1} transmitProgress={transmitP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 고음 vs 저음이 벽을 통과하는 정도 비교 ---------------- */
export const S6FreqCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const freqP = progress(f, 8, Math.round(frames * 0.82));
  const labelP = progress(f, 4, 26);
  const highPt = diagPt(WALL_VIBRATION_HIGH_LABEL_PT);
  const lowPt = diagPt(WALL_VIBRATION_LOW_LABEL_PT);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WallVibrationDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} freqProgress={freqP} />
      <Label x={highPt.x} y={highPt.y} text={t.s6HighLabel} size={42} align="center" style={{ opacity: labelP }} />
      <Label x={lowPt.x} y={lowPt.y} text={t.s6LowLabel} size={42} align="center" style={{ opacity: labelP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 저음 쪽에만 리듬 펄스를 얹은 마무리 (텍스트 없음) ---------------- */
export const S7Beat: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const beatT = progress(f, 0, 10);
  const sourcePt = diagPt({ x: 100, y: 720 }); // WallVibrationDiagram의 LOW_Y 음원 지점
  const earPt = diagPt({ x: 600, y: 720 }); // 같은 레인의 귀 지점
  const ringSize = 150;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WallVibrationDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} freqProgress={1} />
      <PulseRing
        x={sourcePt.x - ringSize / 2} y={sourcePt.y - ringSize / 2} size={ringSize} frame={f}
        progress={beatT} color={C.goldSoft} periodFrames={22}
      />
      <PulseRing
        x={earPt.x - ringSize / 2} y={earPt.y - ringSize / 2} size={ringSize} frame={f}
        progress={beatT} color={C.goldSoft} periodFrames={22}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
