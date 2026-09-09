/** 이 화(general-ep07, "딸꾹질 소리가 나는 진짜 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(여기서는 이미 결정된 라벨 문자열을 props 로만 받는다).
 */
import React from 'react';
import {
  Actor, Appear, BustActor, C, Caption, CountUp, FPS, FS, FlashOverlay, HICCUP_DIAPHRAGM_PT,
  HICCUP_VB_W, HiccupDiagram, Label, POSES, PlainBg, QMark, Shake, W,
  blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- S1: 딸꾹질 임팩트 (무성) ---------------- */

const ACTOR_SIZE = 1550;
const ACTOR_GROUND = 1400;

/** 딸꾹질이 터지는 로컬 프레임. Episode.tsx 가 Shake·FlashOverlay·hiccup_pop.mp3 타이밍을
 *  전부 이 값 하나로 맞춘다(원칙 7 - 애니메이션 정점 프레임에 SFX를 정확히 맞춘다). */
export const S1_IMPACT_LOCAL_FRAME = 22;

export const S1Impact: React.FC<{ f: number; popText: string }> = ({ f, popText }) => {
  // 딸꾹 순간 입이 훅 벌어졌다 닫힌다 (한 번의 짧은 트윗치)
  const gasp = Math.max(0, Math.sin(Math.min(1, progress(f, S1_IMPACT_LOCAL_FRAME - 6, S1_IMPACT_LOCAL_FRAME + 10)) * Math.PI));
  const mouthOpen = 0.06 + gasp * 0.7;
  const popP = progress(f, S1_IMPACT_LOCAL_FRAME + 2, S1_IMPACT_LOCAL_FRAME + 12);

  return (
    <PlainBg ground={ACTOR_GROUND} groundColor={C.hill}>
      <Shake frame={f} at={S1_IMPACT_LOCAL_FRAME - 4} duration={14} amp={14}>
        <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={POSES.idle} mouthOpen={mouthOpen} />
      </Shake>
      <FlashOverlay frame={f} at={S1_IMPACT_LOCAL_FRAME} color={C.paper} peak={0.35} rise={2} fall={10} />
      {popP > 0.001 ? (
        // QMark은 텍스트 기반이라 자동 줄바꿈 폭을 스스로 정하지 않는다(shrink-to-fit) -
        // position:absolute 래퍼 div로 한 번 더 감싸면 그 래퍼가 "out-of-flow 자식만 있는
        // 0폭 블록"이 되어 텍스트가 글자 단위로 세로 줄바꿈되는 결함이 있었다(실측 발견,
        // 2026-08-20). general-ep09의 QMark 사용 패턴과 동일하게 위치·등장 애니메이션을
        // QMark 자신의 style에 직접 얹어 우회한다(추가 래퍼 없이).
        <QMark
          size={110} color={C.coral} outline={C.ink} glyph={popText}
          style={{
            left: CX + 160, top: 300, whiteSpace: 'nowrap',
            opacity: Math.min(1, popP * 2),
            transform: `rotate(-7deg) scale(${0.3 + 0.7 * popP})`,
            transformOrigin: '0% 50%',
          }}
        />
      ) : null}
    </PlainBg>
  );
};

/* ---------------- S2: 놀란 리액션 + 훅 질문 (바스트샷, 립싱크) ---------------- */

const BUST_SIZE = 950;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const BUST_TOP = 430;

export const S2Surprised: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const basePose = blendPose(POSES.idle, POSES.surprised, t);
  // 두리번거리는 느낌 - 잔잔한 고개 좌우 흔들림(결정적 sin, Math.random 미사용)
  const lookAround = Math.sin(f / 14) * 6 * t;
  const pose: Pose = { ...basePose, headTilt: (basePose.headTilt ?? 0) + lookAround };
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const line = activeLine(lines, f / FPS);

  return (
    <PlainBg>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3/S4 공용: 다이어그램 레이아웃 ---------------- */

const DIAG_W = 520;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 380;
const DIAG_SCALE = DIAG_W / HICCUP_VB_W;

/** viewBox 좌표(HICCUP_DIAPHRAGM_PT) -> 이 화면 배치(DIAG_X/Y/W) 기준 화면 좌표로 변환.
 *  HiccupDiagram 자체는 라벨을 그리지 않으므로(REGISTRY 규칙) 이 화면 좌표에 Label 을
 *  별도로 얹는다. 목 입구 라벨(S4)은 HICCUP_THROAT_PT 근방(머리·목 사이 좁은 공간)에
 *  놓으면 머리 원과 겹쳐(실측 발견, 2026-08-20) 대신 다이어그램 위쪽 여백에 고정 배치한다. */
const diaphragmScreen = { x: DIAG_X + HICCUP_DIAPHRAGM_PT.x * DIAG_SCALE, y: DIAG_Y + HICCUP_DIAPHRAGM_PT.y * DIAG_SCALE };
const THROAT_LABEL_X = CX;
const THROAT_LABEL_Y = 290;

/* ---------------- S3: 횡격막 경련 + 이름 라벨 ---------------- */

/** 반복 트윗치 주기(프레임). "저 혼자 움찔 경련"을 한 번이 아니라 계속 보여준다 */
const SPASM_PERIOD = 42;
const SPASM_SHARPNESS = 6;

function spasmPulseAt(f: number) {
  const f2 = Math.max(0, f - 10); // 등장 직후 살짝 여유를 두고 시작
  const phase = (f2 % SPASM_PERIOD) / SPASM_PERIOD;
  return Math.pow(Math.max(0, Math.sin(Math.PI * phase)), SPASM_SHARPNESS);
}

export const S3Diaphragm: React.FC<{ f: number; lines: CaptionLine[]; label: string }> = (
  { f, lines, label }
) => {
  const spasmP = spasmPulseAt(f);
  const labelP = progress(f, 14, 24);

  return (
    <PlainBg ground={null}>
      <HiccupDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} spasmProgress={spasmP} snapProgress={0} />
      {labelP > 0.001 ? (
        <Appear progress={labelP} from="scale">
          <Label x={diaphragmScreen.x} y={diaphragmScreen.y} text={label} size={FS.label} color={C.ink} wrapWidth={480} />
        </Appear>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 목 입구 반사적 폐쇄 (s3에서 이어짐) ---------------- */

/** 목이 닫히기 시작/완전히 닫히는 프레임 비율. Episode.tsx 가 hiccup_pop.mp3 타이밍을
 *  S4_SNAP_END_FRAC(완전히 닫히는 시점)에 정확히 맞춘다(원칙 7). */
export const S4_SNAP_START_FRAC = 0.30;
export const S4_SNAP_END_FRAC = 0.40;

export const S4Snap: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = (
  { f, frames, lines, label }
) => {
  // s3에서 이어지는 잔여 경련 - 한 번 더 짧게 움찔한 뒤 가라앉는다
  const spasmP = Math.sin(Math.min(1, progress(f, 0, frames * 0.28)) * Math.PI);
  const snapP = progress(f, frames * S4_SNAP_START_FRAC, frames * S4_SNAP_END_FRAC);
  const labelP = progress(f, frames * 0.44, frames * 0.54);

  return (
    <PlainBg ground={null}>
      <HiccupDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} spasmProgress={spasmP} snapProgress={snapP} />
      {labelP > 0.001 ? (
        <Appear progress={labelP} from="scale">
          <Label
            x={THROAT_LABEL_X} y={THROAT_LABEL_Y} text={label} size={FS.label} color={C.ink}
            align="center" wrapWidth={480}
          />
        </Appear>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 최장 기록 68년 트리비아 ---------------- */

export const S5Record: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; usualLabel: string; recordLabel: string; recordSuffix: string;
}> = ({ f, frames, lines, usualLabel, recordLabel, recordSuffix }) => {
  const usualIn = progress(f, 6, frames * 0.14);
  const usualOut = progress(f, frames * 0.26, frames * 0.36);
  const usualOp = usualIn * (1 - usualOut);
  const recordOp = progress(f, frames * 0.28, frames * 0.40);

  return (
    <PlainBg>
      {usualOp > 0.001 ? (
        <div style={{ opacity: usualOp }}>
          <Label x={CX} y={860} text={usualLabel} size={FS.title} color={C.inkSoft} />
        </div>
      ) : null}
      {recordOp > 0.001 ? (
        <div style={{ opacity: recordOp }}>
          <Label x={CX} y={640} text={recordLabel} size={FS.label} color={C.inkSoft} />
          {/* width를 CX 기준 안전영역(70~1010)에 맞춰 넉넉히 잡는다 - 영어 접미사
           *  (" years")가 한국어("년")보다 훨씬 길어 width=520(한국어 기준)에서는 화면
           *  오른쪽 밖으로 텍스트가 잘렸다(실측 발견, 2026-08-20). */}
          <CountUp
            x={CX} y={720} to={68} frame={f} at={Math.round(frames * 0.30)} duration={40}
            size={150} color={C.coral} suffix={recordSuffix} width={940} style={{ whiteSpace: 'nowrap' }}
          />
        </div>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 숨 참기 속설 (전신, 립싱크) ---------------- */

const S6_ACTOR_SIZE = 1050;
const S6_ACTOR_GROUND = 1560;

export const S6Myth: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>; mythLabel: string;
}> = ({ f, lines, mouth, mythLabel }) => {
  const t = progress(f, 0, 16);
  const pose = blendPose(POSES.idle, POSES.crouch, t);
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  const badgeP = progress(f, 12, 24);

  return (
    <PlainBg ground={S6_ACTOR_GROUND} groundColor={C.hill}>
      <Actor size={S6_ACTOR_SIZE} centerX={CX - 100} ground={S6_ACTOR_GROUND} pose={pose} mouthOpen={mouthOpen} />
      {badgeP > 0.001 ? (
        // S1Impact과 동일한 이유로 QMark를 추가 래퍼 없이 직접 스타일링한다(0폭 줄바꿈 우회).
        <>
          <QMark
            size={130} color={C.gold} outline={C.ink}
            style={{
              left: CX + 190, top: 480, whiteSpace: 'nowrap',
              opacity: Math.min(1, badgeP * 2),
              transform: `scale(${0.3 + 0.7 * badgeP})`,
              transformOrigin: '50% 50%',
            }}
          />
          <div style={{ opacity: Math.min(1, badgeP * 2) }}>
            <Label x={CX + 255} y={660} text={mythLabel} size={FS.label} color={C.ink} align="center" wrapWidth={380} />
          </div>
        </>
      ) : null}
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};
