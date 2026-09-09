/** 이 화(general-ep31, "전자레인지가 음식을 데우는 이유") 전용 장면.
 *
 *  s1(무성, 식은 음식이 전자레인지 안에 놓이고 문이 닫히며 시작 버튼이 눌리고 회전판이
 *  돌기 시작) -> s2(리액션+훅 질문, 김이 나는 음식을 보고 놀람) -> s3(전자기파가 방향을
 *  빠르게 뒤집고 물 분자가 그 방향을 따라 뒤집힌다) -> s4(분자들이 서로 부딪히며 마찰이
 *  생기고 음식이 뜨거워진다) -> s5(결론, 접시는 그대로인데 음식만 뜨거워지는 색 비교) ->
 *  s6(1945년 레이더 연구 중 우연히 발견된 역사, 장식 컷).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FPS, Label, MicrowaveDiagram, PlainBg, PlateFoodIcon, POSES,
  ScentWaves, SW, SW_THIN, W, blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;
const lerp = (a: number, b: number, ratio: number) => a + (b - a) * ratio;
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ---------------- S1: 음식이 전자레인지에 놓이고 문이 닫히며 시작 버튼이 눌린다 (무성) ---------------- */

const OVEN_X = 150;
const OVEN_Y = 560;
const OVEN_W = 780;
const OVEN_H = 800;
const WIN_X = OVEN_X + 70;
const WIN_Y = OVEN_Y + 90;
const WIN_W = 480;
const WIN_H = 600;
const PANEL_X = WIN_X + WIN_W + 30;
const PANEL_W = OVEN_X + OVEN_W - PANEL_X - 40;
const BTN_CX = PANEL_X + PANEL_W / 2;
const BTN_CY = OVEN_Y + WIN_H / 2 + 90;

export const S1Start: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  // 문이 닫히는 구간(왼쪽에서 슬라이드해 들어와 정렬)
  const doorCloseP = smooth(progress(f, frames * 0.14, frames * 0.4));
  const doorOffset = lerp(-70, 0, doorCloseP);
  // 버튼이 눌리는 순간(플래시)
  const btnPressP = progress(f, frames * 0.46, frames * 0.56);
  const btnFlash = Math.sin(btnPressP * Math.PI);
  // 버튼을 누른 뒤 회전판(접시)이 서서히 돌기 시작
  const spinP = progress(f, frames * 0.58, frames);
  const spinAngle = spinP * 26;

  return (
    <PlainBg ground={null} top={C.room} bottom={C.roomDeep}>
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* 전자레인지 본체 */}
        <rect x={OVEN_X} y={OVEN_Y} width={OVEN_W} height={OVEN_H} rx={36} fill={C.paper} stroke={C.ink} strokeWidth={SW} />
        {/* 창문 프레임(고정) */}
        <rect x={WIN_X} y={WIN_Y} width={WIN_W} height={WIN_H} rx={16} fill={C.roomDeep} stroke={C.ink} strokeWidth={SW_THIN} />
        {/* 조작 패널 */}
        <rect x={PANEL_X} y={OVEN_Y + 40} width={PANEL_W} height={WIN_H + 100} rx={16} fill={C.room} stroke={C.ink} strokeWidth={SW_THIN} />
        {/* 시작 버튼 */}
        <circle cx={BTN_CX} cy={BTN_CY} r={54} fill={btnFlash > 0.01 ? C.coral : C.goldSoft} stroke={C.ink} strokeWidth={SW_THIN} opacity={0.6 + 0.4 * btnFlash} />
      </svg>

      {/* 창문 안 - 접시 위 음식(식은 상태, heat=0). 버튼 누른 뒤 서서히 회전 */}
      <div
        style={{
          position: 'absolute', left: WIN_X + WIN_W / 2 - 190, top: WIN_Y + WIN_H / 2 - 130,
          transform: `rotate(${spinAngle}deg)`, transformOrigin: '190px 130px',
        }}
      >
        <PlateFoodIcon width={380} x={0} y={0} heat={0} />
      </div>

      {/* 문 - 왼쪽에서 슬라이드해 닫힌다 */}
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect
          x={OVEN_X + doorOffset} y={OVEN_Y} width={WIN_X + WIN_W - OVEN_X + 20} height={OVEN_H} rx={36}
          fill="none" stroke={C.ink} strokeWidth={SW}
        />
      </svg>
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 (바스트샷, 김이 모락모락) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2Question: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, POSES.surprised, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const steamP = (f % 42) / 42;
  return (
    <PlainBg>
      <ScentWaves cx={CX} cy={S2_BUST_TOP + S2_BUST_SIZE - 40} angle={-90} count={3} spread={220} progress={steamP} fanDeg={30} color={C.inkSoft} />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 전자기파가 방향을 뒤집고 물 분자가 따라 뒤집힌다 ---------------- */

const DIAG_WIDTH = 700;
const DIAG_X = (W - DIAG_WIDTH) / 2;
const DIAG_Y = 380;

export const S3Wave: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const waveT = progress(f, frames * 0.06, frames * 0.26);
  const flipT = progress(f, frames * 0.24, frames * 0.48);
  const labelP = progress(f, frames * 0.08, frames * 0.24);
  return (
    <PlainBg ground={null}>
      <MicrowaveDiagram f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} waveT={waveT} moleculeFlipT={flipT} />
      <Label
        x={CX} y={DIAG_Y - 70} text={t.s3Label} size={50} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 분자들이 부딪히며 마찰이 생기고 음식이 뜨거워진다 ---------------- */

export const S4Friction: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const sparkT = progress(f, frames * 0.1, frames * 0.3);
  const heat = progress(f, frames * 0.14, frames * 0.88);
  const labelP = progress(f, frames * 0.05, frames * 0.2);
  return (
    <PlainBg ground={null}>
      <MicrowaveDiagram f={f} width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} waveT={1} moleculeFlipT={1} sparkT={sparkT} />
      <Label
        x={CX} y={DIAG_Y - 70} text={t.s4Label} size={50} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <PlateFoodIcon width={380} x={CX - 190} y={DIAG_Y + 650} heat={heat} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론 - 접시는 그대로, 음식만 뜨거워지는 색 비교 ---------------- */

export const S5Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const warmT = progress(f, frames * 0.18, frames * 0.7);
  return (
    <PlainBg ground={null}>
      <PlateFoodIcon width={640} x={CX - 320} y={560} heat={1} plateWarmT={warmT} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 1945년, 레이더를 연구하던 중 우연히 발견된 역사 (장식 컷) ---------------- */

const RADAR_CX = 720;
const RADAR_BASE_Y = 1250;

function radarDishPath() {
  const cx = RADAR_CX;
  const baseY = RADAR_BASE_Y - 260;
  return `
    M ${cx - 130},${baseY - 10}
    Q ${cx},${baseY - 150} ${cx + 130},${baseY - 10}
    Q ${cx},${baseY + 50} ${cx - 130},${baseY - 10}
    Z
  `;
}

export const S6History: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const slideP = smooth(progress(f, frames * 0.04, frames * 0.4));
  const riseOffset = lerp(120, 0, slideP);
  const labelP = progress(f, frames * 0.06, frames * 0.22);
  return (
    <PlainBg ground={1250} groundColor={C.hill}>
      {/* 레이더 - 기둥 + 포물선 안테나(슬라이드 업 + 페이드인) */}
      <svg
        width={W} height={1920} viewBox={`0 0 ${W} 1920`}
        style={{ position: 'absolute', left: 0, top: 0, opacity: slideP, transform: `translateY(${riseOffset}px)` }}
      >
        <line x1={RADAR_CX} y1={RADAR_BASE_Y} x2={RADAR_CX} y2={RADAR_BASE_Y - 260} stroke={C.inkSoft} strokeWidth={SW} opacity={0.55} strokeLinecap="round" />
        <path d={radarDishPath()} fill={C.inkSoft} opacity={0.55} />
      </svg>
      {/* 엔지니어 실루엣 - 마스코트를 단색으로 override(원칙 "새 몸을 그리지 않는다") + 페이드인 */}
      <Actor
        size={620} centerX={380} ground={1250}
        pose={POSES.measure}
        color={C.inkSoft} accent={C.inkSoft} fill={C.inkSoft}
        style={{ opacity: 0.55 * slideP }}
      />
      {/* 녹은 초콜릿 - 주머니 위치 근처에서 아래로 처지는 작은 방울(슬라이드 업 + 페이드인) */}
      <svg
        width={W} height={1920} viewBox={`0 0 ${W} 1920`}
        style={{ position: 'absolute', left: 0, top: 0, opacity: slideP, transform: `translateY(${riseOffset}px)` }}
      >
        <path
          d="M 470,1080 C 486,1076 502,1084 500,1102 C 498,1118 476,1122 464,1110 C 452,1098 456,1084 470,1080 Z M 480,1108 C 484,1120 480,1136 470,1142"
          fill={C.browning} stroke={C.ink} strokeWidth={SW_THIN * 0.6} strokeLinecap="round"
        />
      </svg>
      <Label
        x={CX} y={420} text={t.s6Label} size={50} color={C.ink}
        style={{ opacity: smooth(labelP) }}
      />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
