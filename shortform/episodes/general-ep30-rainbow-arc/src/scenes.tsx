/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(무성, 이미 떠 있는 반원 무지개 - 카메라 줌아웃으로 훑음) -> s2(리액션+훅 질문, 립싱크)
 *  -> s3(빗방울 하나 클로즈업 - 굴절/반사/굴절 + 42도 각도) -> s4(같은 각도의 빗방울들이
 *  하늘에 원을 그림) -> s5(원의 아래 절반이 땅에 가려 반원만 남음) -> s6(비행기 창문 너머
 *  완전한 원 - 대비).
 *
 *  s2만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json 립싱크를 쓴다(원칙 - ep24/ep28과
 *  동일). s3~s6은 3인칭 설명 내레이션이 다이어그램 위에 흐르는 구간이라 립싱크를 쓰지 않는다.
 *
 *  s4->s5->s6 은 같은 "하늘의 큰 원"(RainbowDiagram 의 arcProgress 레이어)을 계속 보여주는
 *  연속 장면이라, s5/s6 에서는 arcProgress 를 다시 0에서 키우지 않고 1로 고정해서 넘긴다
 *  (원칙 - 여러 progress prop을 가진 다이어그램은 다음 장면에서 이전 상태를 명시적으로
 *  유지시킨다, ep23 리셋 사고 재발 방지).
 */
import React from 'react';
import {
  BustActor, C, Caption, FPS, Label, PlainBg, POSES, PopIn,
  RAINBOW_ANGLE_LABEL_PT, RAINBOW_VB_W, RainbowDiagram, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- S1: 무성 - 이미 떠 있는 반원 무지개, 카메라가 줌아웃하며 훑음 ---------------- */

const S1_DIAG_W = 900;
const S1_DIAG_X = (W - S1_DIAG_W) / 2;
const S1_DIAG_Y = 605;

export const S1Establish: React.FC<{ f: number }> = ({ f }) => {
  const camP = progress(f, 0, 80);
  const scale = 1.4 - 0.4 * camP;
  return (
    <PlainBg top={C.sky} bottom={C.leaf} stop={0.55} ground={null}>
      <div
        style={{
          position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: '50% 22%',
        }}
      >
        <RainbowDiagram
          width={S1_DIAG_W} x={S1_DIAG_X} y={S1_DIAG_Y}
          arcProgress={1} groundMask={1}
        />
      </div>
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 - 바스트샷 (립싱크) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Reaction: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  return (
    <PlainBg>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 빗방울 하나 클로즈업 - 굴절 -> 내부반사 -> 굴절, 약 42도 ---------------- */

const S3_DIAG_W = 820;
const S3_DIAG_X = (W - S3_DIAG_W) / 2;
const S3_DIAG_Y = 320;
const S3_SCALE = S3_DIAG_W / RAINBOW_VB_W;
const S3_LABEL_X = S3_DIAG_X + RAINBOW_ANGLE_LABEL_PT.x * S3_SCALE;
const S3_LABEL_Y = S3_DIAG_Y + RAINBOW_ANGLE_LABEL_PT.y * S3_SCALE;

export const S3RayPath: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const rayP = progress(f, 10, 260);
  const labelP = progress(f, 218, 240);

  return (
    <PlainBg ground={null}>
      <RainbowDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} rayProgress={rayP} />
      <Label
        x={S3_LABEL_X} y={S3_LABEL_Y} text={label} size={54} color={C.ink} align="center"
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 같은 각도의 빗방울들이 하늘에 큰 원을 그림 ---------------- */

const SKY_DIAG_W = 900;
const SKY_DIAG_X = (W - SKY_DIAG_W) / 2;
const SKY_DIAG_Y = 605;

export const S4ArcForm: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const arcP = progress(f, 5, frames - 25);
  return (
    <PlainBg top={C.sky} bottom={C.leaf} stop={0.55} ground={null}>
      <RainbowDiagram width={SKY_DIAG_W} x={SKY_DIAG_X} y={SKY_DIAG_Y} arcProgress={arcP} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 원의 아래 절반이 땅에 가려 반원만 남음 (arcProgress=1 유지) ---------------- */

export const S5GroundMask: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const maskP = progress(f, 5, frames - 20);
  return (
    <PlainBg top={C.sky} bottom={C.leaf} stop={0.55} ground={null}>
      <RainbowDiagram width={SKY_DIAG_W} x={SKY_DIAG_X} y={SKY_DIAG_Y} arcProgress={1} groundMask={maskP} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 비행기 창문 너머 완전한 원 무지개 (대비) ---------------- */

const WIN_W = 760;
const WIN_H = 980;
const WIN_Y = 380;
const WIN_DIAG_W = 620;
const WIN_DIAG_X = (WIN_W - WIN_DIAG_W) / 2;
const WIN_DIAG_Y = 130;

/** 구름 뭉치 하나. 겹친 타원 3개로 뭉게구름 실루엣만 (텍스처·점 없음) */
function CloudPuff({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  const h = w * 0.5;
  return (
    <svg width={w * 1.3} height={h * 1.6} style={{ position: 'absolute', left: cx - (w * 1.3) / 2, top: cy - (h * 1.6) / 2, overflow: 'visible' }}>
      <ellipse cx={w * 0.65} cy={h * 1.0} rx={w * 0.5} ry={h * 0.5} fill={C.paper} stroke={C.ink} strokeWidth={8} />
      <ellipse cx={w * 0.3} cy={h * 0.75} rx={w * 0.36} ry={h * 0.4} fill={C.paper} stroke={C.ink} strokeWidth={8} />
      <ellipse cx={w * 1.0} cy={h * 0.8} rx={w * 0.38} ry={h * 0.42} fill={C.paper} stroke={C.ink} strokeWidth={8} />
    </svg>
  );
}

export const S6PlaneWindow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const winP = progress(f, 0, 20);
  return (
    <PlainBg top={C.roomDeep} bottom={C.room} stop={0.4} ground={null}>
      <PopIn cx={CX} cy={WIN_Y + WIN_H / 2} size={WIN_W} height={WIN_H} progress={winP} fromScale={0.86} fadeInBy={0.6}>
        <div
          style={{
            position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
            borderRadius: '46% / 38%', border: `26px solid ${C.ink}`, background: C.sky,
          }}
        >
          <PlainBg top={C.sky} bottom={C.sky} ground={null} floor={false} />
          <RainbowDiagram width={WIN_DIAG_W} x={WIN_DIAG_X} y={WIN_DIAG_Y} arcProgress={1} />
          <CloudPuff cx={WIN_DIAG_X + 60} cy={WIN_H - 170} w={230} />
          <CloudPuff cx={WIN_DIAG_X + WIN_DIAG_W - 40} cy={WIN_H - 110} w={260} />
          <CloudPuff cx={WIN_DIAG_X + WIN_DIAG_W * 0.5} cy={WIN_H - 60} w={300} />
        </div>
      </PopIn>
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

