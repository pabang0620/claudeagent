/** 이 화(general-ep93, "젖은 빨래가 마르는 이유") 전용 장면. 문구는 전부 strings.ts 에서
 *  읽는다(언어 무관 컴포넌트, 이 화는 title/outro 외 화면 텍스트가 없다).
 *
 *  s1(Actor 전신, 빨랫줄에 빨래를 널고 뿌듯해하는 장면 - 무성) -> s2(BustActor 리액션
 *  "근데 물이 안 끓는데 빨래는 대체 어떻게 마르는 거지?") -> s3(EvaporationDiagram
 *  escapeProgress - 물 분자 일부가 표면에서 날아감) -> s4(같은 다이어그램
 *  saturationProgress - 옷 위 공기가 수증기로 꽉 참) -> s5(windProgress - 바람이 그
 *  공기를 새 공기로 바꿔줌) -> s6(heatProgress - 햇빛이 분자에 힘을 더함) -> s7(빨랫줄의
 *  빨래가 색이 옅어지며 완전히 마른 상태로 전환).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시) 반영:
 *   - 물 분자는 EvaporationDiagram 내부에서 큰 도형 3개(잔류 2 + 탈출 1)로만 표현하고
 *     잔뜩 뿌리지 않는다(다이어그램 자체 주석 참고).
 *   - 포화(saturationProgress)와 환기(windProgress)는 haze 면의 밀도·폭 변화로만
 *     대비시킨다 - 점을 그리지 않는다.
 *   - 햇빛은 SunRaysBadge(ThemedIcon "sun" 하나)로 단순하게 표현한다.
 *   - 빨랫줄에 걸린 옷은 이 파일 로컬 ShirtSilhouette(단순 실루엣, 참고 이미지 없음 -
 *     원칙 0-1 벡터화 대상 아님)로 충분하다 - 라이브러리 승격은 다른 화에서 "빨래" 소재가
 *     다시 필요해질 때 검토한다(대본 자산 목록 메모와 동일 판단).
 *
 *  s1의 "빨래를 너는" 순간(옷이 줄에 걸리는 순간)에 wax_tap SFX를 붙인다(원칙 7 - 무성
 *  구간 핵심 액션. wax_tap은 REGISTRY에 "작고 부드러운 재료를 다듬어 마무리하는 무성
 *  동작 전반 재사용 가능"으로 등록돼 있어 빨래집게로 집는 마무리 동작에 재사용했다).
 *
 *  s3~s6은 전부 다이어그램 중심 장면이라 립싱크를 넣지 않는다(원칙 - 다이어그램이 초점인
 *  장면은 얼굴이 아니라 다이어그램이 주인공). 캐릭터가 실제로 등장해 말하는 s2만
 *  mouthAt/mouthProp을 쓴다. s7도 캐릭터 없는 3인칭 결과 장면이라 립싱크를 쓰지 않는다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, EvaporationDiagram, FPS, GROUND, PlainBg, POSES,
  SunRaysBadge, SW_THIN, W, WindBadge,
  blendPose, mouthAt, mouthProp, progress, sway,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
const CX = W / 2; // 540

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ============================================================
 * 로컬 소품: 빨랫줄(Rope) + 옷 실루엣(ShirtSilhouette) - s1/s7 공용
 * ============================================================ */
const ROPE_X1 = 90;
const ROPE_X2 = 990;

const Rope: React.FC<{ y: number; opacity?: number }> = ({ y, opacity = 1 }) => (
  <svg width={W} height={800} style={{ position: 'absolute', left: 0, top: 0 }}>
    <line
      x1={ROPE_X1} y1={y} x2={ROPE_X2} y2={y} stroke={C.ink} strokeWidth={SW_THIN}
      strokeLinecap="round" opacity={opacity}
    />
    <line x1={ROPE_X1} y1={y} x2={ROPE_X1} y2={y + 46} stroke={C.inkSoft} strokeWidth={SW_THIN} opacity={opacity} />
    <line x1={ROPE_X2} y1={y} x2={ROPE_X2} y2={y + 46} stroke={C.inkSoft} strokeWidth={SW_THIN} opacity={opacity} />
  </svg>
);

const SHIRT_W = 220;
const SHIRT_H = 260;
const SHIRT_D = 'M 70 10 L 40 10 L 4 55 L 46 82 L 60 72 L 60 250 L 160 250 L 160 72 '
  + 'L 174 82 L 216 55 L 180 10 L 150 10 Q 110 46 70 10 Z';

/** dryProgress: 0=흠뻑 젖음(진한 파란 오버레이) -> 1=완전히 마름(옅은 오버레이 거의 없음).
 *  wobble: 살랑거리는 각도(도) - sway() 로 계산한 값을 그대로 받는다. */
const ShirtSilhouette: React.FC<{
  cx: number; topY: number; scale?: number; dryProgress?: number; opacity?: number; wobble?: number;
}> = ({ cx, topY, scale = 1, dryProgress = 0, opacity = 1, wobble = 0 }) => {
  if (opacity <= 0.01) return null;
  const wetOpacity = (1 - clamp01(dryProgress)) * 0.6;
  return (
    <svg
      width={SHIRT_W * scale + 40} height={SHIRT_H * scale + 20}
      viewBox={`0 0 ${SHIRT_W} ${SHIRT_H}`}
      style={{
        position: 'absolute', left: cx - (SHIRT_W * scale) / 2, top: topY,
        width: SHIRT_W * scale, height: SHIRT_H * scale, opacity,
        transform: `rotate(${wobble}deg)`, transformOrigin: '50% 0%', overflow: 'visible',
      }}
    >
      <path d={SHIRT_D} fill={C.hillFar} stroke={C.ink} strokeWidth={SW_THIN} strokeLinejoin="round" />
      <path d={SHIRT_D} fill={C.waterCool} opacity={wetOpacity} />
      <circle cx={110} cy={6} r={11} fill={C.gold} stroke={C.ink} strokeWidth={SW_THIN * 0.7} />
    </svg>
  );
};

/* ============================================================
 * S1: 빨랫줄에 빨래를 널고 뿌듯해함 (전신, 무성)
 * ============================================================ */
/** 처음 size=900/ground=GROUND(1250)으로 스틸을 뽑아보니 콘텐츠(빨랫줄+캐릭터)가 화면
 *  위쪽 2/3에만 몰리고 하단 1/3이 텅 비었다(스틸 선점검에서 발견, 원칙 5 "21화 이후 반복
 *  결함 B" - 화면 아래쪽 여백 과다). 무성 장면이라 캡션이 없어 SAFE_BOTTOM 경계
 *  (H-520=1400)까지 안전하게 채울 수 있어 ground를 낮추고 캐릭터를 키웠다. */
const S1_ACTOR_SIZE = 1080;
const S1_ACTOR_CENTER_X = CX + 250;
const S1_GROUND = 1400;
const S1_ROPE_Y = 400;
const S1_LEFT_SHIRT_X = CX - 260;
const S1_RIGHT_SHIRT_X = CX + 30;

/** 오른쪽 옷이 줄에 걸리는(팝인) 순간 - Episode.tsx가 이 프레임에 wax_tap SFX를 배치한다
 *  (원칙 7) */
export const S1_HANG_SFX_AT_FRAME = 20;

export const S1HangProud: React.FC<{ f: number }> = ({ f }) => {
  const popT = progress(f, 10, 26);
  const popBounce = popT < 1 ? popT : 1 - 0.06 * Math.sin((f - 26) / 6);
  const cheerT = progress(f, 20, 50);
  const pose: Pose = blendPose(POSES.idle, POSES.cheer, cheerT);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={S1_GROUND}>
      <Rope y={S1_ROPE_Y} />
      <ShirtSilhouette cx={S1_LEFT_SHIRT_X} topY={S1_ROPE_Y} scale={1.2} dryProgress={0} opacity={1} />
      <ShirtSilhouette
        cx={S1_RIGHT_SHIRT_X} topY={S1_ROPE_Y} scale={1.05 * popBounce} dryProgress={0} opacity={popT}
      />
      <Actor size={S1_ACTOR_SIZE} centerX={S1_ACTOR_CENTER_X} ground={S1_GROUND} pose={pose} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: "근데 물이 안 끓는데 빨래는 대체 어떻게 마르는 거지?" (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 470;

export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const puzzleT = progress(f, 0, 18);
  const glanceWag = 5 * Math.sin((f / 45) * Math.PI * 2) * progress(f, 18, 34);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, puzzleT);
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
 * S3~S6: EvaporationDiagram 공유 좌표
 * ============================================================ */
interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/** 처음 width=820으로 스틸을 뽑아보니 다이어그램 아래 캡션까지 빈 공간이 과다했다(스틸
 *  선점검에서 발견, 원칙 5). 화면 폭에 가깝게 키워 안전영역을 더 채운다. */
const DIAG_WIDTH = 980;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 320;
const BADGE_Y = DIAG_Y - 60;

/* ---------------- S3: 표면에서 물 분자 일부가 날아감 ---------------- */
export const S3Escape: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const escapeP = progress(f, 4, Math.round(frames * 0.9));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <EvaporationDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} frame={f} escapeProgress={escapeP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 옷 위 공기가 수증기로 꽉 참 ---------------- */
export const S4Saturate: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const satP = progress(f, 6, Math.round(frames * 0.85));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <EvaporationDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} frame={f} escapeProgress={1} saturationProgress={satP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 바람이 그 공기를 새 공기로 바꿔줌 ---------------- */
export const S5Wind: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const windP = progress(f, 6, Math.round(frames * 0.85));
  const badgeT = progress(f, 4, 20);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <EvaporationDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} frame={f}
        escapeProgress={1} saturationProgress={1} windProgress={windP}
      />
      <WindBadge x={DIAG_X - 30} y={BADGE_Y} opacity={badgeT} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 햇빛이 분자에 힘을 더함 ---------------- */
export const S6Heat: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const heatP = progress(f, 6, Math.round(frames * 0.85));
  const badgeT = progress(f, 4, 20);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <EvaporationDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} frame={f}
        escapeProgress={1} saturationProgress={1} windProgress={1} heatProgress={heatP}
      />
      <SunRaysBadge x={DIAG_X + DIAG_WIDTH - 90} y={BADGE_Y} opacity={badgeT} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 빨래가 색이 옅어지며 완전히 마름 (캐릭터 없는 결과 장면)
 * ============================================================ */
/** 처음 rope_y=640/scale=1.3 로 스틸을 뽑아보니 옷이 화면 중앙에 작게 몰리고 위아래에
 *  빈 공간이 과다했다(스틸 선점검에서 발견, 원칙 5). rope를 내리고 옷을 키워 캡션 위
 *  안전영역까지 채운다. */
const S7_ROPE_Y = 760;
const S7_LEFT_SHIRT_X = CX - 250;
const S7_RIGHT_SHIRT_X = CX + 250;

export const S7DryResult: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dryP = progress(f, 6, Math.round(frames * 0.92));
  const wobbleL = sway(f, 2.2, 3.4);
  const wobbleR = sway(f + 20, 2.2, 3.1);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={GROUND}>
      <Rope y={S7_ROPE_Y} />
      <ShirtSilhouette
        cx={S7_LEFT_SHIRT_X} topY={S7_ROPE_Y} scale={1.6} dryProgress={dryP} opacity={1} wobble={wobbleL}
      />
      <ShirtSilhouette
        cx={S7_RIGHT_SHIRT_X} topY={S7_ROPE_Y} scale={1.6} dryProgress={dryP} opacity={1} wobble={wobbleR}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
