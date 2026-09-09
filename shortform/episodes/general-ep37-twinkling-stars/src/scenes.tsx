/** 이 화(general-ep37, "별만 유독 반짝반짝 흔들려 보이는 이유") 전용 장면.
 *
 *  s1(무성, 밤하늘 별 하나를 가리킴) -> s2(리액션+훅 질문) -> s3(별을 확대하니 점 하나로
 *  보임, TwinkleDiagram.pointProgress) -> s4(그 빛이 대기층 여러 겹을 통과, beamProgress)
 *  -> s5(층마다 살짝씩 꺾임, jitterProgress) -> s6(그게 반짝임으로 보임, s1과 짝) ->
 *  s7(행성은 가까워서 작은 원반으로 보임, diskProgress) -> s8(원반 여러 지점 빛이 평균화돼
 *  덜 반짝임, diskAverageProgress).
 *
 *  주의사항(오케스트레이터 지시): 배경 별은 성기게 뿌리고 설명용 별은 크게 1~2개만 쓴다.
 *  대기 흔들림은 굵은 물결선 2~3개(TwinkleDiagram 내부에서 이미 처리)로만 표현한다.
 *  별(점)과 행성(작은 원반)의 크기 차이를 확실히 보여준다(S7의 점선 비교 원이 그 역할).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, Label, NightSkyBg, PlainBg, POSES, TwinkleDiagram,
  W, blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** 어두운 배경 위에서 캐릭터 윤곽선이 묻히지 않도록 밝은 글로우를 얹는다(원칙 5 예방책 (a),
 *  general-ep06과 동일한 스타일 - 얼굴 디테일은 그대로 두고 가는 팔다리 선만 분리해 보이게 함). */
const NIGHT_GLOW_STYLE: React.CSSProperties = {
  filter:
    'drop-shadow(0 0 4px rgba(255,244,228,0.95)) drop-shadow(0 0 12px rgba(255,244,228,0.6)) drop-shadow(0 0 22px rgba(255,244,228,0.35))',
};
/** 다이어그램의 빛줄기(gold)도 밤하늘 배경 위에서는 어두운 stroke가 묻히므로 밝은 색으로 */
const NIGHT_DIAGRAM_STROKE = C.cream;

/* ---------------- S1: 밤하늘 별 하나를 가리킨다 (무성) ---------------- */

const ACTOR_SIZE = 900;
const ACTOR_GROUND = 1650;
const POINT_UP_POSE: Pose = { ...POSES.pointUp };

const S1_STAR_WIDTH = 420;
const S1_STAR_X = 620;
const S1_STAR_Y = 250;

export const S1Point: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const pointT = smooth(progress(f, 0, frames * 0.55));
  const pose: Pose = blendPose(POSES.idle, POINT_UP_POSE, pointT);
  return (
    <>
      <NightSkyBg stars={10} seed={3} frame={f} moon={null} horizon={1650} />
      <TwinkleDiagram
        width={S1_STAR_WIDTH} x={S1_STAR_X} y={S1_STAR_Y}
        pointProgress={0} twinkleT={f} sourceColor={C.gold} stroke={C.cream}
        style={{ opacity: pointT > 0.15 ? 1 : pointT / 0.15 }}
      />
      <Actor
        size={ACTOR_SIZE} centerX={340} ground={ACTOR_GROUND} pose={pose} breathAmp={1}
        style={NIGHT_GLOW_STYLE}
      />
    </>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <>
      <NightSkyBg stars={10} seed={3} frame={f} moon={null} horizon={null} />
      <BustActor
        size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen}
        style={NIGHT_GLOW_STYLE}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </>
  );
};

/* ---------------- 공용: 다이어그램 배치(s3~s8 고정 카메라) ---------------- */

const DIAG_WIDTH = 620;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 330;
/** 광원(별/원반)이 S3·S7에서 계속 커지므로, 라벨은 다이어그램 박스 위쪽(안전영역 안)에
 *  충분히 띄워 겹치지 않게 한다(실측 확인: DIAG_Y+40은 다 자란 원반 상단과 겹쳤다). */
const DIAG_LABEL_PT = { x: CX, y: DIAG_Y - 70 };

/* ---------------- S3: 별을 확대하니 점 하나로 보인다 ---------------- */

export const S3PointZoom: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const pointProgress = progress(f, frames * 0.1, frames * 0.85);
  const labelA = progress(f, frames * 0.55, frames * 0.72);
  return (
    <>
      <NightSkyBg stars={10} seed={3} frame={f} moon={null} horizon={null} />
      <TwinkleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} pointProgress={pointProgress}
        sourceColor={C.gold} stroke={NIGHT_DIAGRAM_STROKE}
      />
      <Label x={DIAG_LABEL_PT.x} y={DIAG_LABEL_PT.y} text={t.s3Label} size={56} color={C.cream} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </>
  );
};

/* ---------------- S4: 빛이 대기층 여러 겹을 통과한다 ---------------- */

export const S4Beam: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const beamProgress = progress(f, frames * 0.06, frames * 0.92);
  return (
    <PlainBg top={C.night} bottom={C.sky} stop={0.5} ground={null}>
      <TwinkleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} pointProgress={1} beamProgress={beamProgress}
        sourceColor={C.gold} stroke={C.ink}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 대기층 경계마다 빛이 살짝씩 꺾인다 ---------------- */

export const S5Jitter: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const jitterProgress = progress(f, frames * 0.08, frames * 0.9);
  return (
    <PlainBg top={C.night} bottom={C.sky} stop={0.5} ground={null}>
      <TwinkleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} pointProgress={1} beamProgress={1}
        jitterProgress={jitterProgress} sourceColor={C.gold} stroke={C.ink}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 그게 반짝임으로 보인다 (s1과 짝) ---------------- */

const S6_STAR_WIDTH = 600;
const S6_STAR_X = CX - 300;
const S6_STAR_Y = 620;

export const S6Twinkle: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, lines,
}) => (
  <>
    <NightSkyBg stars={10} seed={3} frame={f} moon={null} horizon={1650} />
    <TwinkleDiagram
      width={S6_STAR_WIDTH} x={S6_STAR_X} y={S6_STAR_Y}
      pointProgress={0} twinkleT={f} sourceColor={C.gold} stroke={C.cream}
    />
    <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
  </>
);

/* ---------------- S7: 행성은 가까워서 점이 아니라 작은 동그라미로 보인다 ---------------- */

export const S7Disk: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const diskProgress = progress(f, frames * 0.12, frames * 0.85);
  const labelA = progress(f, frames * 0.55, frames * 0.72);
  return (
    <>
      <NightSkyBg stars={8} seed={21} frame={f} moon={null} horizon={null} />
      <TwinkleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} diskProgress={diskProgress}
        sourceColor={C.gold} stroke={NIGHT_DIAGRAM_STROKE}
      />
      <Label x={DIAG_LABEL_PT.x} y={DIAG_LABEL_PT.y} text={t.s7Label} size={56} color={C.cream} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} dark />
    </>
  );
};

/* ---------------- S8: 원반 여러 지점 빛이 평균화되어 덜 반짝인다 ---------------- */

export const S8Average: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const diskAverageProgress = progress(f, frames * 0.08, frames * 0.92);
  return (
    <PlainBg top={C.night} bottom={C.sky} stop={0.5} ground={null}>
      <TwinkleDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} diskProgress={1}
        diskAverageProgress={diskAverageProgress} sourceColor={C.gold} stroke={C.ink}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
