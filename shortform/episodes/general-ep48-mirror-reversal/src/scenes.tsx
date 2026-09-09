/** 이 화(general-ep48, "거울이 좌우만 바꾸는 것처럼 보이는 이유") 전용 장면.
 *
 *  s1(거울 앞에서 오른손을 든다 - 실물 캐릭터 + scaleX(-1) 반사 이미지, 반사는 왼손을 든
 *  것처럼 보인다) -> s2(같은 구도 유지, 머리·발 위치가 "그대로"임을 점선+라벨로 표시) ->
 *  s3(MirrorDiagram plane - "좌우" 가정에 취소선이 그어지고 "앞뒤"가 강조색으로 등장) ->
 *  s4(같은 plane 다이어그램, 화살표가 거울을 향했다가 그대로 되돌아오는 왕복으로 "앞뒤만
 *  바뀐다"를 시연) -> s5(BustActor + 생각풍선 안에서 미니 캐릭터가 세로축으로 홱 돌아서는
 *  상상) -> s6(MirrorDiagram rotate 큰 버전 - 좌/우 라벨은 자리를 맞바꾸고 위/아래 라벨은
 *  고정) -> s7(plane·rotate 두 다이어그램을 나란히 놓은 정리 화면).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시): 좌표축 세 개 대신 화살표 하나의 왕복만
 *  쓴다(s4, MirrorDiagram plane 모드). 반전은 scaleX(-1)로 처리하되 그 안에 텍스트를 넣지
 *  않는다(글자는 항상 반전 그룹 밖의 별도 레이어에 둔다) - s1의 캐릭터는 텍스트가 없는
 *  실루엣이라 안전하고, 라벨(Label/Badge)은 전부 반전 그룹 밖에서 그린다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FONT, FPS, H, Label, MirrorDiagram, PlainBg, POSES, RADIUS, RIG, SW,
  SpeechBubble, ThemedIcon, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ================================================================
 * S1 / S2 공용: 거울 앞 실물 + 반사(scaleX(-1)) 캐릭터
 * ================================================================ */

/** 오른손을 위로 든다 - CHEER 의 오른팔 각도를 한쪽만 가져왔다(왼팔은 idle 유지) */
const RAISE_HAND_POSE: Pose = {
  headTilt: 0, lean: 0,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -122, e: -18 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
};

const ACTOR_SIZE = 860;
const ACTOR_GROUND = 1250;
const REAL_CX = 250;
const MIRROR_CX = 800;

const FEET_VB_LOCAL = 1026;
const HEAD_TOP_VB_LOCAL = 172;
const HEAD_TOP_Y = ACTOR_GROUND - (FEET_VB_LOCAL * ACTOR_SIZE) / RIG.H + (HEAD_TOP_VB_LOCAL * ACTOR_SIZE) / RIG.H;
const FEET_Y = ACTOR_GROUND;

const FRAME_HALF_W = 230;
const FRAME_LEFT = MIRROR_CX - FRAME_HALF_W;
const FRAME_RIGHT = MIRROR_CX + FRAME_HALF_W;
const FRAME_TOP = HEAD_TOP_Y - 90;
const FRAME_BOTTOM = FEET_Y + 60;
const FRAME_R = 46;

function MirrorFrame({ glowP }: { glowP: number }) {
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect
          x={FRAME_LEFT} y={FRAME_TOP} width={FRAME_RIGHT - FRAME_LEFT} height={FRAME_BOTTOM - FRAME_TOP}
          rx={FRAME_R} fill={C.sky}
        />
      </svg>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <rect
          x={FRAME_LEFT} y={FRAME_TOP} width={FRAME_RIGHT - FRAME_LEFT} height={FRAME_BOTTOM - FRAME_TOP}
          rx={FRAME_R} fill="none" stroke={C.ink} strokeWidth={SW * 1.3}
        />
        <polygon
          points={`${FRAME_LEFT + 24},${FRAME_TOP + 20} ${FRAME_LEFT + 84},${FRAME_TOP + 20} ${FRAME_LEFT + 24},${FRAME_TOP + 220}`}
          fill={C.paper} opacity={0.35}
        />
        {glowP > 0.01 ? (
          <rect
            x={FRAME_LEFT} y={FRAME_TOP} width={FRAME_RIGHT - FRAME_LEFT} height={FRAME_BOTTOM - FRAME_TOP}
            rx={FRAME_R} fill="none" stroke={C.gold} strokeWidth={SW * 0.6} opacity={glowP * 0.7}
          />
        ) : null}
      </svg>
    </>
  );
}

function MirroredActor({ pose, mouthOpen }: { pose: Pose; mouthOpen: number }) {
  return (
    <div
      style={{
        position: 'absolute', left: 0, top: 0, width: W, height: H,
        transform: 'scaleX(-1)', transformOrigin: `${MIRROR_CX}px 0`,
      }}
    >
      <Actor size={ACTOR_SIZE} centerX={MIRROR_CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
    </div>
  );
}

export const S1Raise: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const raiseT = progress(f, 6, 30);
  const pose = blendPose(POSES.idle, RAISE_HAND_POSE, raiseT);
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={ACTOR_GROUND} groundColor={C.roomDeep}>
      <MirrorFrame glowP={0} />
      <Actor size={ACTOR_SIZE} centerX={REAL_CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      <MirroredActor pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

function SameIndicator({
  y, dir, p, label,
}: { y: number; dir: 1 | -1; p: number; label: string }) {
  if (p <= 0.001) return null;
  return (
    <div style={{ opacity: p }}>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={REAL_CX} y1={y} x2={MIRROR_CX} y2={y} stroke={C.coral} strokeWidth={SW * 0.6} strokeDasharray="10 14" strokeLinecap="round" />
        <line x1={REAL_CX} y1={y - 16 * dir} x2={REAL_CX} y2={y + 16 * dir} stroke={C.coral} strokeWidth={SW * 0.6} strokeLinecap="round" />
        <line x1={MIRROR_CX} y1={y - 16 * dir} x2={MIRROR_CX} y2={y + 16 * dir} stroke={C.coral} strokeWidth={SW * 0.6} strokeLinecap="round" />
      </svg>
      <Label x={(REAL_CX + MIRROR_CX) / 2} y={dir === -1 ? y - 74 : y + 30} text={label} size={44} color={C.coral} />
    </div>
  );
}

export const S2Same: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const pose = blendPose(POSES.idle, RAISE_HAND_POSE, 1);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const headP = progress(f, 6, 28);
  const feetP = progress(f, 20, 42);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={ACTOR_GROUND} groundColor={C.roomDeep}>
      <MirrorFrame glowP={0} />
      <Actor size={ACTOR_SIZE} centerX={REAL_CX} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      <MirroredActor pose={pose} mouthOpen={mouthOpen} />
      <SameIndicator y={HEAD_TOP_Y - 40} dir={-1} p={headP} label={t.s2Same} />
      <SameIndicator y={FEET_Y + 40} dir={1} p={feetP} label={t.s2Same} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S3 / S4 공용: MirrorDiagram(mode='plane')
 * ================================================================ */

const PLANE_W = 850;
const PLANE_X = CX - PLANE_W / 2;
const PLANE_Y = 760;

function StrikeLabel({ x, y, text, strikeT }: { x: number; y: number; text: string; strikeT: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 800, fontSize: 54, color: C.ink, whiteSpace: 'nowrap' }}>
        {text}
        <div
          style={{
            position: 'absolute', left: 0, top: '50%', height: 7, background: C.coral,
            width: `${strikeT * 100}%`, transform: 'translateY(-50%)', borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

function TruthPill({ x, y, text, p }: { x: number; y: number; text: string; p: number }) {
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, opacity: p,
        transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p})`,
        background: C.goldSoft, border: `${Math.round(SW * 0.6)}px solid ${C.ink}`,
        borderRadius: RADIUS.pill, padding: '14px 34px', fontFamily: FONT, fontWeight: 800,
        fontSize: 54, color: C.ink, whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
}

export const S3Assume: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const half = Math.floor(frames * 0.5);
  const strikeT = progress(f, 14, half);
  const emphP = progress(f, half, half + 18);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <StrikeLabel x={CX - 160} y={560} text={t.s3Assumed} strikeT={strikeT} />
      {emphP > 0.01 ? (
        <div style={{ position: 'absolute', left: CX - 20, top: 560 - 27, opacity: emphP }}>
          <ThemedIcon name="arrow-right" size={54} color={C.ink} strokePx={11} />
        </div>
      ) : null}
      <TruthPill x={CX + 190} y={560} text={t.s3Truth} p={emphP} />
      <MirrorDiagram mode="plane" width={PLANE_W} x={PLANE_X} y={PLANE_Y} arrowProgress={0} flipT={emphP} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S4Bounce: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const arrowProgress = progress(f, 8, frames - 18);
  const note1P = progress(f, Math.floor(frames * 0.42), Math.floor(frames * 0.42) + 16);
  const note2P = progress(f, Math.floor(frames * 0.78), Math.floor(frames * 0.78) + 16);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MirrorDiagram mode="plane" width={PLANE_W} x={PLANE_X} y={PLANE_Y} arrowProgress={arrowProgress} flipT={1} />
      <Label x={CX} y={1330} text={t.s4Note1} size={48} color={C.ink} style={{ opacity: note1P }} />
      <Label x={CX} y={1400} text={t.s4Note2} size={40} color={C.inkSoft} style={{ opacity: note2P }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S5: BustActor + 생각풍선 안 미니 회전
 * ================================================================ */

const S5_BUST_SIZE = 800;
const S5_BUST_LEFT = (W - S5_BUST_SIZE) / 2;
const S5_BUST_TOP = 620;
const S5_BUBBLE_R = 170;
const S5_BUBBLE_Y = 420;

export const S5Imagine: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's5', f));
  const bubbleP = progress(f, 4, 20);
  const spinT = progress(f, 16, frames - 16);

  return (
    <PlainBg top={C.coralSoft} bottom={C.paper} ground={null}>
      <BustActor size={S5_BUST_SIZE} left={S5_BUST_LEFT} top={S5_BUST_TOP} pose={POSES.thinking} mouthOpen={mouthOpen} />
      <SpeechBubble x={CX} y={S5_BUBBLE_Y} r={S5_BUBBLE_R} tail="bottomLeft" progress={bubbleP} bg={C.paper} border={C.ink}>
        <MirrorDiagram mode="rotate" width={220} x={60} y={40} axis={false} rotateT={spinT} />
      </SpeechBubble>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S6: MirrorDiagram(mode='rotate') 큰 버전 - 좌우 교환, 위아래 고정
 * ================================================================ */

const S6_W = 700;
const S6_X = CX - S6_W / 2;
const S6_Y = 560;

export const S6Rotate: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const rotateT = progress(f, 12, frames - 16);

  return (
    <PlainBg top={C.leaf} bottom={C.paper} ground={null}>
      <MirrorDiagram
        mode="rotate" width={S6_W} x={S6_X} y={S6_Y} rotateT={rotateT}
        leftLabel={t.s6Left} rightLabel={t.s6Right} upLabel={t.s6Up} downLabel={t.s6Down}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ================================================================
 * S7: 정리 - plane / rotate 나란히 배치
 * ================================================================ */

const S7_PLANE_W = 430;
const S7_PLANE_X = 90;
const S7_PLANE_Y = 760;
const S7_ROTATE_W = 430;
const S7_ROTATE_X = 560;
const S7_ROTATE_Y = 642;
const S7_LABEL_Y = 1200;

export const S7Recap: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const popP = progress(f, 6, 28);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <MirrorDiagram
        mode="plane" width={S7_PLANE_W} x={S7_PLANE_X} y={S7_PLANE_Y} arrowProgress={1} flipT={1}
        style={{ opacity: popP, transform: `scale(${0.85 + 0.15 * popP})`, transformOrigin: `${S7_PLANE_X + S7_PLANE_W / 2}px ${S7_PLANE_Y}px` }}
      />
      <MirrorDiagram
        mode="rotate" width={S7_ROTATE_W} x={S7_ROTATE_X} y={S7_ROTATE_Y} rotateT={1}
        leftLabel={t.s6Left} rightLabel={t.s6Right} upLabel={t.s6Up} downLabel={t.s6Down}
        style={{ opacity: popP, transform: `scale(${0.85 + 0.15 * popP})`, transformOrigin: `${S7_ROTATE_X + S7_ROTATE_W / 2}px ${S7_ROTATE_Y}px` }}
      />
      <Label x={S7_PLANE_X + S7_PLANE_W / 2} y={S7_LABEL_Y} text={t.s7PlaneLabel} size={42} color={C.ink} style={{ opacity: popP }} />
      <Label x={S7_ROTATE_X + S7_ROTATE_W / 2} y={S7_LABEL_Y} text={t.s7RotateLabel} size={42} color={C.ink} style={{ opacity: popP }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
