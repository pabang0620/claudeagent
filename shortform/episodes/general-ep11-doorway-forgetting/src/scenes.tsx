/** 이 화(general-ep11, "방문을 넘으면 방금 생각이 날아가는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 *
 *  s3("문지방 효과"라는 이름을 목소리가 직접 말하는 구간)은 v2-2 수정에 따라 화면에 같은
 *  단어를 텍스트로 중복 표기하지 않는다(원칙 3 화면 중복 낭독 금지) - Appear 로 감싼 은은한
 *  글로우 버스트 + 화면 톤 살짝 어두워졌다 복귀하는 포커스 플래시만 남긴다.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Actor, Appear, C, Caption, DoorFrame, FEET_VB, FPS, HEAD_TOP_VB, Label, MiniCharacter,
  PlainBg, POSES, RIG, SW, Sparkles, SpeechBubble, ThemedIcon, W, blendPose, mouthAt,
  mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;
const ACTOR_SIZE = 760;
const ACTOR_GROUND = 1250;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/** 캐릭터 머리 꼭대기 화면 y (말풍선을 머리 위에 앵커할 때 씀) */
function headTopY(size: number, ground: number) {
  return ground - (FEET_VB - HEAD_TOP_VB) * (size / RIG.H);
}

/** 삼각 envelope(0 -> 1 -> 0). FolderSnap 의 "스냅" 순간, 글로우 펄스 등에 재사용 */
function bump(f: number, at: number, dur: number) {
  const rise = progress(f, at, at + dur * 0.4);
  const fall = 1 - progress(f, at + dur * 0.4, at + dur);
  return Math.min(rise, fall);
}

/** 문틀 표준 크기·위치 (화면 중앙, 발이 닿는 바닥선까지) */
const DOOR_W = 340;
const DOOR_H = 900;
const DOOR_X = CX - DOOR_W / 2;
const DOOR_Y = ACTOR_GROUND - DOOR_H;

/** 캐릭터가 문을 지나가며 좌우로 이동하는 x 좌표. p=0.5 일 때 정확히 문 중앙(CX)을 지나
 *  DoorFrame 의 crossProgress 플래시 최고조와 위치가 자동으로 맞아떨어진다(같은 p 를 씀). */
function walkX(p: number, span = 320) {
  return CX - span + span * 2 * p;
}

const BUBBLE_W = 460;
const BUBBLE_H = 170;

/* ---------------- 서류함이 "탁" 닫히는 모션(팝인 + 세로 스냅 + 글로우) ---------------- */

const FolderSnap: React.FC<{
  x: number; y: number; size: number; f: number; appearAt: number; snapAt: number;
}> = ({ x, y, size, f, appearAt, snapAt }) => {
  const appearP = progress(f, appearAt, appearAt + 10);
  if (appearP <= 0.001) return null;
  const squish = 1 - 0.32 * bump(f, snapAt, 14);
  const glow = bump(f, snapAt, 14);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, opacity: appearP,
        transform: `translate(-50%, -100%) scale(${0.7 + 0.3 * appearP}) scaleY(${squish})`,
        transformOrigin: '50% 100%',
      }}
    >
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%', width: size * 1.6, height: size * 1.6,
          transform: 'translate(-50%,-50%)', borderRadius: '50%', background: C.goldSoft,
          opacity: glow * 0.6,
        }}
      />
      <ThemedIcon name="folder" size={size} color={C.ink} />
    </div>
  );
};

/* ---------------- S1: 방 A, 결심 -> 문 쪽으로 걷기 (무성) ---------------- */

export const S1Decide: React.FC<{ f: number; frames: number; bubble: string }> = ({ f, frames, bubble }) => {
  const poseT = progress(f, 0, 20);
  const pose: Pose = blendPose(POSES.idle, POSES.pointUp, poseT);
  const walkP = progress(f, 18, frames);
  const cx = CX - 260 + 260 * walkP;
  const bubbleP = progress(f, 6, 22);
  const bubbleY = headTopY(ACTOR_SIZE, ACTOR_GROUND) - BUBBLE_H - 30;

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.sky} bottom={C.paper} groundColor={C.hill}>
      <ThemedIcon
        name="droplet" size={90} color={C.coral}
        style={{ position: 'absolute', left: CX + 230, top: 560 }}
      />
      <Actor size={ACTOR_SIZE} centerX={cx} ground={ACTOR_GROUND} pose={pose} />
      <SpeechBubble
        x={cx - BUBBLE_W / 2} y={bubbleY} shape="rect" tail="bottomLeft" progress={bubbleP}
        text={bubble} w={BUBBLE_W} h={BUBBLE_H} textSize={46}
      />
    </PlainBg>
  );
};

/* ---------------- S2: 문을 넘어 방 B로 (리액션+훅) ---------------- */

export const S2Cross: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>; oldBubble: string;
}> = ({ f, frames, lines, mouth, oldBubble }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const p = progress(f, 0, frames);
  const cx = walkX(p);
  const poseT = progress(f, 0, Math.round(frames * 0.5));
  const pose: Pose = blendPose(POSES.pointUp, POSES.shrug, poseT);
  const bubbleP = 1 - progress(f, 0, Math.round(frames * 0.22));
  const bubbleY = headTopY(ACTOR_SIZE, ACTOR_GROUND) - BUBBLE_H - 30;

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.room} bottom={C.paper} groundColor={C.roomDeep}>
      <DoorFrame width={DOOR_W} height={DOOR_H} x={DOOR_X} y={DOOR_Y} crossProgress={p} />
      <Actor size={ACTOR_SIZE} centerX={cx} ground={ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      {bubbleP > 0.02 ? (
        <SpeechBubble
          x={cx - BUBBLE_W / 2} y={bubbleY} shape="rect" tail="bottomLeft" progress={bubbleP}
          text={oldBubble} w={BUBBLE_W} h={BUBBLE_H} textSize={46}
        />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: "이름까지 있대요" - 텍스트 없는 포커스 전환 플래시 ---------------- */

export const S3Name: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const darkRise = progress(f, 4, Math.round(frames * 0.22));
  const darkFall = 1 - progress(f, Math.round(frames * 0.42), Math.round(frames * 0.7));
  const darkP = Math.min(darkRise, darkFall);
  const glowP = progress(f, Math.round(frames * 0.26), Math.round(frames * 0.4));

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.room} bottom={C.paper} groundColor={C.roomDeep}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={POSES.shrug} />
      <Appear progress={glowP} from="scale" origin="50% 55%">
        <div
          style={{
            position: 'absolute', left: CX - 260, top: headTopY(ACTOR_SIZE, ACTOR_GROUND) - 300,
            width: 520, height: 520, borderRadius: '50%', background: C.goldSoft,
            opacity: 0.55, filter: 'blur(2px)',
          }}
        />
      </Appear>
      <AbsoluteFill style={{ background: C.ink, opacity: Math.max(0, darkP) * 0.32, pointerEvents: 'none' }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 문 경계 클로즈업 - 서류함이 닫히는 모션 + 라벨 ---------------- */

export const S4Mechanism: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const line = activeLine(lines, f / FPS);
  const p = progress(f, 0, frames);
  const cx = walkX(p, 240);
  const labelP = progress(f, Math.round(frames * 0.58), Math.round(frames * 0.58) + 16);

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.room} bottom={C.paper} groundColor={C.roomDeep}>
      <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.3)', transformOrigin: `${CX}px ${ACTOR_GROUND}px` }}>
        <DoorFrame width={DOOR_W} height={DOOR_H} x={DOOR_X} y={DOOR_Y} crossProgress={p} />
        <Actor size={ACTOR_SIZE} centerX={cx} ground={ACTOR_GROUND} pose={POSES.shrug} />
        <FolderSnap
          x={CX - 30} y={DOOR_Y + 270} size={130} f={f}
          appearAt={Math.round(frames * 0.4)} snapAt={Math.round(frames * 0.58)}
        />
      </div>
      <Appear progress={labelP} from="up">
        <Label x={CX} y={ACTOR_GROUND + 90} text={label} size={50} align="center" wrapWidth={920} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 이전 생각이 서류함으로 -> 새 방 요소 등장 ---------------- */

export const S5Filed: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; label: string; oldBubble: string;
}> = ({ f, frames, lines, label, oldBubble }) => {
  const line = activeLine(lines, f / FPS);
  const suckP = progress(f, 4, Math.round(frames * 0.4));
  const startX = CX - 300; const startY = 560;
  const endX = CX + 40; const endY = ACTOR_GROUND - 640;
  const bubbleX = startX + (endX - startX) * suckP;
  const bubbleY = startY + (endY - startY) * suckP;
  const bubbleScale = 1 - 0.62 * suckP;
  const bubbleOpacity = 1 - progress(f, Math.round(frames * 0.3), Math.round(frames * 0.44));
  const folderGlow = bump(f, Math.round(frames * 0.4), 14);
  const newItemP = progress(f, Math.round(frames * 0.5), Math.round(frames * 0.5) + 16);
  const labelP = progress(f, Math.round(frames * 0.62), Math.round(frames * 0.62) + 16);

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.room} bottom={C.paper} groundColor={C.roomDeep}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={POSES.shrug} />
      {bubbleOpacity > 0.02 ? (
        <div style={{ position: 'absolute', left: bubbleX, top: bubbleY, opacity: bubbleOpacity, transform: `scale(${bubbleScale})`, transformOrigin: '0 0' }}>
          <SpeechBubble x={0} y={0} shape="rect" tail="none" progress={1} text={oldBubble} w={BUBBLE_W} h={BUBBLE_H} textSize={44} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute', left: endX, top: endY, width: 210, height: 210,
          transform: 'translate(-50%,-50%)', borderRadius: '50%', background: C.goldSoft, opacity: folderGlow * 0.6,
        }}
      />
      <ThemedIcon
        name="folder" size={130} color={C.ink}
        style={{ position: 'absolute', left: endX - 65, top: endY - 65 }}
      />
      <Appear progress={newItemP} from="scale" origin="50% 50%">
        <ThemedIcon
          name="book" size={110} color={C.coral}
          style={{ position: 'absolute', left: CX - 350, top: ACTOR_GROUND - 570 }}
        />
      </Appear>
      <Appear progress={labelP} from="up">
        <Label x={CX} y={ACTOR_GROUND + 90} text={label} size={50} align="center" wrapWidth={920} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 문을 연달아 2번 더 지나감 (빠른 컷 몽타주) ---------------- */

export const S6Chain: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const trackLeft = CX - 360;
  const trackRight = CX + 360;
  const p = progress(f, Math.round(frames * 0.08), Math.round(frames * 0.86));
  const charX = trackLeft + (trackRight - trackLeft) * p;
  const doorXs = [CX - 200, CX + 200];
  const doorW = 190;
  const doorH = 480;
  const doorY = 520;
  const snapFractions = [0.25, 0.69];

  return (
    <PlainBg ground={null} top={C.room} bottom={C.paper}>
      {doorXs.map((dx, i) => {
        const doorP = progress(charX, dx - 90, dx + 90);
        return (
          <React.Fragment key={i}>
            <DoorFrame width={doorW} height={doorH} x={dx - doorW / 2} y={doorY} crossProgress={doorP} />
            <FolderSnap
              x={dx + 4} y={doorY - 20} size={78} f={f}
              appearAt={0} snapAt={Math.round(frames * snapFractions[i])}
            />
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: charX - 90, top: doorY + doorH - 220 }}>
        <MiniCharacter width={180} pose={POSES.shrug} />
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S7: 가상 공간(비디오 게임) 속에서도 같은 효과 ---------------- */

export const S7Virtual: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const line = activeLine(lines, f / FPS);
  const monW = 640;
  const monH = 860;
  const monX = CX - monW / 2;
  const monY = 420;
  const p = progress(f, Math.round(frames * 0.16), Math.round(frames * 0.78));
  const doorW = 150;
  const doorH = 380;
  const doorLocalX = monW / 2 - doorW / 2;
  const doorLocalY = monH - doorH - 60;
  const charX0 = 90;
  const charX1 = monW - 90;
  const charLocalX = charX0 + (charX1 - charX0) * p;
  const gpP = progress(f, 8, 24);
  const labelP = progress(f, Math.round(frames * 0.62), Math.round(frames * 0.62) + 16);

  return (
    <PlainBg ground={null} top={C.room} bottom={C.paper}>
      <div
        style={{
          position: 'absolute', left: monX, top: monY, width: monW, height: monH,
          border: `${SW}px solid ${C.ink}`, borderRadius: 20, background: C.paper,
          boxSizing: 'border-box', overflow: 'hidden',
        }}
      >
        <DoorFrame width={doorW} height={doorH} x={doorLocalX} y={doorLocalY} crossProgress={p} />
        <div style={{ position: 'absolute', left: charLocalX - 55, top: doorLocalY + doorH - 190 }}>
          <MiniCharacter width={140} pose={POSES.shrug} />
        </div>
      </div>
      <Appear progress={gpP} from="left">
        <ThemedIcon
          name="device-gamepad-2" size={120} color={C.coral}
          style={{ position: 'absolute', left: monX + monW + 30, top: monY + monH / 2 - 60 }}
        />
      </Appear>
      <Appear progress={labelP} from="up">
        <Label x={CX} y={monY + monH + 60} text={label} size={50} align="center" wrapWidth={920} />
      </Appear>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S8: 방 A로 되돌아가며 생각이 다시 떠오름 ---------------- */

export const S8Return: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; bubble: string;
}> = ({ f, frames, lines, bubble }) => {
  const line = activeLine(lines, f / FPS);
  const p = progress(f, 0, frames);
  const cx = walkX(1 - p);
  const poseT = progress(f, Math.round(frames * 0.4), Math.round(frames * 0.4) + 14);
  const pose: Pose = blendPose(POSES.shrug, POSES.surprised, poseT);
  const bubbleP = progress(f, Math.round(frames * 0.44), Math.round(frames * 0.44) + 14);
  const sparkT = progress(f, Math.round(frames * 0.44), Math.round(frames * 0.44) + 24);
  const bubbleY = headTopY(ACTOR_SIZE, ACTOR_GROUND) - BUBBLE_H - 30;

  return (
    <PlainBg ground={ACTOR_GROUND} top={C.sky} bottom={C.paper} groundColor={C.hill}>
      <DoorFrame width={DOOR_W} height={DOOR_H} x={DOOR_X} y={DOOR_Y} crossProgress={p} />
      <Actor size={ACTOR_SIZE} centerX={cx} ground={ACTOR_GROUND} pose={pose} />
      {bubbleP > 0.02 ? (
        <SpeechBubble
          x={cx - BUBBLE_W / 2} y={bubbleY} shape="rect" tail="bottomLeft" progress={bubbleP}
          text={bubble} w={BUBBLE_W} h={BUBBLE_H} textSize={46}
        />
      ) : null}
      {bubbleP > 0.3 ? (
        <Sparkles box={{ x: cx - BUBBLE_W / 2, y: bubbleY - 60, w: BUBBLE_W, h: BUBBLE_H + 60 }} t={sparkT} />
      ) : null}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
