/** 이 화(general-ep38, "종이에 베이면 유독 아픈 이유") 전용 장면.
 *
 *  s1(종이 끝에 손가락을 베고 움찔, 유성 - 훅 문장 자체가 이 장면의 내레이션이라 원칙 6대로
 *  립싱크를 연결한다) -> s2(손가락 끝 신경 밀도, FingertipNerveDiagram) -> s3(종이 단면
 *  톱니 vs 칼날 매끈함 비교, PaperEdgeDiagram edgeReveal/compare) -> s4(그 톱니가 살을
 *  뜯듯 가름, PaperEdgeDiagram tearProgress) -> s5(상처가 얕아 피가 적음,
 *  WoundCrossSectionDiagram bloodAmount) -> s6(피딱지가 잘 안 덮여 신경이 계속 노출,
 *  WoundCrossSectionDiagram scabProgress+nerveGlow).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 피·상처를 사실적으로 그리지 않는다. 베인
 *  자리는 가는 선 하나, 종이 톱니는 큼직한 요철 몇 개(촘촘한 잔니 금지), 손끝 신경은
 *  굵은 선 몇 가닥(점 무리 금지), 통증은 표정+큰 물결선(Sparkles)으로 표현한다.
 */
import React from 'react';
import {
  Actor, BLADE_EDGE_LABEL_PT, C, Caption, FPS, FingertipNerveDiagram, Label, PAPER_EDGE_LABEL_PT,
  PAPER_EDGE_VB_W, PaperEdgeDiagram, PlainBg, POSES, RadialSpikes, W, WoundCrossSectionDiagram,
  blendPose, clamp01, mouthAt, mouthProp, progress,
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

/* ============================================================
 * S1: 종이 끝에 손가락을 베고 움찔 (유성, 립싱크 연결)
 * ============================================================ */

const ACTOR_SIZE = 820;
const ACTOR_CENTER_X = 320;
const ACTOR_GROUND = 1400;

const PAPER_X = 600;
const PAPER_Y = 560;
const PAPER_W = 300;
const PAPER_H = 440;
const PAPER_EDGE_X = PAPER_X + PAPER_W; // 오른쪽(날) 변
const PAPER_TOP = PAPER_Y + 30;
const PAPER_BOTTOM = PAPER_Y + PAPER_H - 60;

/** 종이를 향해 손을 뻗는 포즈 (ep16 REACH_POSE와 같은 관례 - 정확한 손 IK 대신
 *  대략적인 리치 각도로 통일) */
const HOLD_PAPER_POSE: Pose = {
  headTilt: -3, lean: 2,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -104, e: -18 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

/** 손가락(작은 캡슐) 하나가 종이 오른쪽 날을 따라 위에서 아래로 스치듯 내려온다.
 *  Finger(props/Hand.tsx)의 세부(손톱 등)까지는 필요 없어, 이 장면 전용으로 단순화한
 *  캡슐 하나만 그린다(점 무리 아님 - 지점을 나타내는 도형 1개) */
function SlidingFingertip({ cx, cy }: { cx: number; cy: number }) {
  return (
    <svg
      width={64} height={100} viewBox="0 0 64 100"
      style={{ position: 'absolute', left: cx - 32, top: cy - 50, overflow: 'visible' }}
    >
      <rect x={6} y={4} width={52} height={92} rx={26} fill={C.paper} stroke={C.ink} strokeWidth={11} />
      <ellipse cx={32} cy={26} rx={17} ry={20} fill={C.coralSoft} stroke={C.ink} strokeWidth={7} opacity={0.9} />
    </svg>
  );
}

export const S1Cut: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const reachT = smooth(progress(f, 0, frames * 0.34));
  const cutAt = frames * 0.56;
  const winceT = smooth(progress(f, cutAt, cutAt + frames * 0.22));
  const pose: Pose = blendPose(blendPose(POSES.idle, HOLD_PAPER_POSE, reachT), POSES.surprised, winceT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));

  const slideT = smooth(progress(f, frames * 0.1, cutAt));
  const fingerY = PAPER_TOP + slideT * (PAPER_BOTTOM - PAPER_TOP);
  const sparkT = Math.max(0, 1 - Math.abs(f - cutAt) / (frames * 0.14));
  const cutMarkA = progress(f, cutAt, cutAt + 4);

  return (
    <PlainBg ground={ACTOR_GROUND + 60} groundColor={C.hill}>
      <Actor
        size={ACTOR_SIZE} centerX={ACTOR_CENTER_X} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen}
      />

      {/* 종이 (오른쪽 변만 살짝 들쭉날쭉하게 - s3에서 확대해서 보여줄 톱니의 예고) */}
      <svg
        width={PAPER_W + 20} height={PAPER_H}
        style={{ position: 'absolute', left: PAPER_X, top: PAPER_Y, overflow: 'visible' }}
      >
        <path
          d={`M 0 0 L ${PAPER_W - 14} 0 L ${PAPER_W} 40 L ${PAPER_W - 12} 90 L ${PAPER_W} 150 L ${PAPER_W - 12} 210 L ${PAPER_W} 270 L ${PAPER_W - 12} 330 L ${PAPER_W} ${PAPER_H - 40} L ${PAPER_W - 14} ${PAPER_H} L 0 ${PAPER_H} Z`}
          fill={C.paper} stroke={C.ink} strokeWidth={13}
        />
      </svg>

      <SlidingFingertip cx={PAPER_EDGE_X - 4} cy={fingerY} />

      {/* 컷 마크 - 가는 선 하나, 큰 물결선(Sparkles)으로 통증 표현 */}
      {cutMarkA > 0.01 ? (
        <svg
          width={40} height={40}
          style={{ position: 'absolute', left: PAPER_EDGE_X - 24, top: fingerY - 20, overflow: 'visible' }}
        >
          <path
            d="M 6 30 Q 16 14 30 8" fill="none" stroke={C.ink} strokeWidth={5}
            strokeLinecap="round" opacity={cutMarkA}
          />
        </svg>
      ) : null}
      {sparkT > 0.02 ? (
        <RadialSpikes
          cx={PAPER_EDGE_X} cy={fingerY} rx={8} ry={8} frame={f} progress={sparkT}
          count={7} length={46} width={11} color={C.coral}
        />
      ) : null}

      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 손가락 끝 신경 밀도 (FingertipNerveDiagram)
 * ============================================================ */

const S2_WIDTH = 380;
const S2_X = CX - S2_WIDTH / 2;
const S2_Y = 560;

export const S2NerveDensity: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const nerveProgress = progress(f, frames * 0.12, frames * 0.85);
  const labelA = progress(f, frames * 0.5, frames * 0.68);
  return (
    <PlainBg>
      <FingertipNerveDiagram f={f} width={S2_WIDTH} x={S2_X} y={S2_Y} nerveProgress={nerveProgress} />
      <Label x={CX} y={S2_Y - 70} text={t.s2Label} size={56} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 종이 단면(톱니) vs 칼날 단면(매끈함)
 * ============================================================ */

const S3_WIDTH = 560;
const S3_X = CX - S3_WIDTH / 2;
const S3_Y = 460;
const S3_SCALE = S3_WIDTH / PAPER_EDGE_VB_W;

export const S3PaperVsBlade: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const edgeRevealProgress = progress(f, frames * 0.06, frames * 0.55);
  const compareProgress = progress(f, frames * 0.5, frames * 0.95);
  const paperLabelA = progress(f, frames * 0.1, frames * 0.25);
  const bladeLabelA = progress(f, frames * 0.58, frames * 0.75);
  return (
    <PlainBg>
      <PaperEdgeDiagram
        width={S3_WIDTH} x={S3_X} y={S3_Y}
        edgeRevealProgress={edgeRevealProgress} compareProgress={compareProgress}
      />
      <Label
        x={S3_X + PAPER_EDGE_LABEL_PT.x * S3_SCALE} y={S3_Y + PAPER_EDGE_LABEL_PT.y * S3_SCALE}
        text={t.s3PaperLabel} size={44} style={{ opacity: paperLabelA }}
      />
      <Label
        x={S3_X + BLADE_EDGE_LABEL_PT.x * S3_SCALE} y={S3_Y + BLADE_EDGE_LABEL_PT.y * S3_SCALE}
        text={t.s3BladeLabel} size={44} style={{ opacity: bladeLabelA }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 톱니 모양 단면이 살을 뜯듯 가른다
 * ============================================================ */

const S4_WIDTH = 620;
const S4_X = CX - S4_WIDTH / 2;
const S4_Y = 520;

export const S4Tear: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const tearProgress = progress(f, frames * 0.15, frames * 0.85);
  return (
    <PlainBg>
      <PaperEdgeDiagram width={S4_WIDTH} x={S4_X} y={S4_Y} tearProgress={tearProgress} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 상처가 얕아 피가 적게 난다
 * ============================================================ */

const S5_WIDTH = 520;
const S5_X = CX - S5_WIDTH / 2;
const S5_Y = 620;

export const S5LittleBlood: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const bloodAmount = progress(f, frames * 0.2, frames * 0.7) * 0.6;
  const labelA = progress(f, frames * 0.4, frames * 0.58);
  return (
    <PlainBg>
      <WoundCrossSectionDiagram f={f} width={S5_WIDTH} x={S5_X} y={S5_Y} bloodAmount={bloodAmount} />
      <Label x={CX} y={S5_Y - 70} text={t.s5Label} size={56} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 피딱지가 잘 안 덮여 신경이 계속 노출된다
 * ============================================================ */

const S6_WIDTH = 520;
const S6_X = CX - S6_WIDTH / 2;
const S6_Y = 620;

export const S6NerveExposed: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const scabProgress = progress(f, frames * 0.08, frames * 0.5);
  const nerveGlow = progress(f, frames * 0.45, frames * 0.75);
  const labelA = progress(f, frames * 0.5, frames * 0.68);
  return (
    <PlainBg>
      <WoundCrossSectionDiagram
        f={f} width={S6_WIDTH} x={S6_X} y={S6_Y} bloodAmount={0.3}
        scabProgress={scabProgress} nerveGlow={nerveGlow}
      />
      <Label x={CX} y={S6_Y - 70} text={t.s6Label} size={50} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
