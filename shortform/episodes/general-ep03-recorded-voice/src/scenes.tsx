/** 이 화(general-ep03, "녹음된 내 목소리가 낯선 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다(이 화는 자막 외 정적 라벨이 없어 strings.ts 에는
 *  제목만 있다).
 */
import React from 'react';
import {
  Actor, Appear, BustActor, C, Caption, FPS, POSES, PlainBg, ThemedIcon, VoicePathDiagram,
  W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { Locale } from './strings';

const CX = W / 2;

/* ---------------- 자막 헬퍼 (ep01 과 동일 원칙 - 한 줄 최대 15자(ko)/22자(en), 화 전용이라
 * 공용으로 승격하지 않고 이 파일에 그대로 둔다. locality 우선, coding-style.md 참고) ---------------- */
function wrapByChars(words: { w: string }[], maxChars: number): number[] {
  const counts: number[] = [];
  let cur = 0;
  let curLen = 0;
  for (const { w } of words) {
    const nextLen = curLen === 0 ? w.length : curLen + 1 + w.length;
    if (curLen > 0 && nextLen > maxChars) {
      counts.push(cur);
      cur = 1;
      curLen = w.length;
    } else {
      cur += 1;
      curLen = nextLen;
    }
  }
  if (cur > 0) counts.push(cur);
  return counts;
}

export function wrapCounts(words: { w: string }[], locale: Locale): number[] {
  return wrapByChars(words, locale === 'ko' ? 15 : 22);
}

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- S1: 녹음 -> 정지 -> 재생 탭 (무성) ---------------- */

const S1_ACTOR_SIZE = 1500;
const S1_ACTOR_GROUND = 1370;
const PHONE_SIZE = 220;
// 캐릭터 머리(화면상 대략 x 235~845, y 378~988)를 완전히 벗어난 오른쪽 어깨 옆에 둔다.
// 처음엔 얼굴 옆(눈 위치)에 뒀다가 오른쪽 눈을 가리는 결함이 실측 프레임에서 발견되어
// 머리 바깥(가슴 옆, 어깨 아래)으로 옮겼다.
const PHONE_X = CX + 300;
const PHONE_Y = 1000;

/** 탭 순간의 "톡" 튀는 강조. at 프레임에서 dur 프레임에 걸쳐 0->1->0 */
function tapPulse(f: number, at: number, dur = 10) {
  const d = f - at;
  if (d < 0 || d > dur) return 0;
  return Math.sin((d / dur) * Math.PI);
}

/** 정지 탭이 일어나는 지점(구간 진행도 비율). Episode.tsx 의 ui_tap 효과음 배치가 이 값을
 *  그대로 가져다 쓴다 - 시각 애니메이션과 효과음이 같은 기준값을 공유해야 어긋나지 않는다. */
export const S1_STOP_TAP_FRAC = 0.42;
/** 재생 탭이 일어나는 지점(구간 진행도 비율) */
export const S1_PLAY_TAP_FRAC = 0.7;

export const S1RecordTap: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  const t1 = Math.round(frames * S1_STOP_TAP_FRAC);
  const t2 = Math.round(frames * S1_PLAY_TAP_FRAC);
  const state: 'record' | 'stop' | 'play' = f < t1 ? 'record' : f < t2 ? 'stop' : 'play';

  // 녹음 중(record)에만 입을 움직여 "말하는 중"으로 읽히게 한다
  const talk = state === 'record' ? 0.14 + 0.34 * Math.abs(Math.sin(f / 3.4)) : 0.08;
  const pulse = tapPulse(f, t1) + tapPulse(f, t2);
  const badgeScale = 1 + 0.16 * pulse;

  return (
    <PlainBg ground={S1_ACTOR_GROUND} groundColor={C.hill}>
      <Actor size={S1_ACTOR_SIZE} centerX={CX} ground={S1_ACTOR_GROUND} pose={POSES.present} mouthOpen={talk} />
      <div
        style={{
          position: 'absolute', left: PHONE_X - PHONE_SIZE / 2, top: PHONE_Y - PHONE_SIZE / 2,
          width: PHONE_SIZE, height: PHONE_SIZE,
          transform: `scale(${badgeScale})`, transformOrigin: '50% 50%',
        }}
      >
        <ThemedIcon name="device-mobile" size={PHONE_SIZE} color={C.ink} strokePx={14} />
        <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%, -50%)' }}>
          {state === 'record' ? (
            <div
              style={{
                width: 34, height: 34, borderRadius: 17, background: C.coral,
                opacity: 0.6 + 0.4 * Math.abs(Math.sin(f / 6)),
              }}
            />
          ) : state === 'stop' ? (
            <div style={{ width: 30, height: 30, background: C.ink, borderRadius: 6 }} />
          ) : (
            <svg width={38} height={38} viewBox="0 0 38 38">
              <polygon points="9,5 33,19 9,33" fill={C.coral} />
            </svg>
          )}
        </div>
      </div>
    </PlainBg>
  );
};

/* ---------------- S2: "어, 목소리가 다르게 들려." 리액션 (바스트샷) ---------------- */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

/** 재생 아이콘이 팝인해 "스피커에서 소리가 나온다"는 걸 표시하고, 캐릭터는 idle->surprised
 *  로 표정이 전환된다. 실제 발화("어, 목소리가 다르게 들려.")는 mouth.json 립싱크로 입에
 *  반영한다(ep01 v4 S2Forehead 와 동일 패턴 - BustActor 의 mouthOpen 이 포즈 정적값을 덮음). */
export const S2React: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const t = progress(f, 0, 14);
  const pose = blendPose(POSES.idle, POSES.surprised, t);
  const iconP = progress(f, 8, 22);
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));

  return (
    <PlainBg>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />

      {iconP > 0.001 ? (
        <Appear progress={iconP} from="scale" origin="50% 50%">
          <div
            style={{
              position: 'absolute', left: CX + 190, top: 300, width: 132, height: 132,
              borderRadius: 66, background: C.goldSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${Math.sin(f / 6) * 5}deg)`,
            }}
          >
            <ThemedIcon name="player-play" size={80} color={C.ink} strokePx={12} />
          </div>
        </Appear>
      ) : null}

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3/S4/S5 공용: 소리 경로 다이어그램 레이아웃 ----------------
 * S2 의 BustActor 와 완전히 같은 크기·위치로 맞춘다 - SceneSwitcher 크로스페이드(6프레임)
 * 동안 같은 얼굴이 갑자기 커지거나 작아지는 점프를 막기 위함 (ep01 s2->s3 검수에서
 * 확인된 원칙을 그대로 따랐다). */
const DIAG_W = BUST_SIZE;
const DIAG_X = BUST_LEFT;
const DIAG_Y = BUST_TOP;

const DiagramScene: React.FC<{
  f: number;
  lines: CaptionLine[];
  showAirPath?: number;
  showBonePath?: number;
  boneThickness?: number;
  micCapture?: number;
}> = ({ f, lines, showAirPath, showBonePath, boneThickness, micCapture }) => {
  const t = f / FPS;
  const line = activeLine(lines, t);
  return (
    <PlainBg>
      <VoicePathDiagram
        f={f} width={DIAG_W} x={DIAG_X} y={DIAG_Y}
        showAirPath={showAirPath} showBonePath={showBonePath}
        boneThickness={boneThickness} micCapture={micCapture}
      />
      <Caption line={line} t={t} />
    </PlainBg>
  );
};

/** s3: "목소리는 두 가지 길로 귀에 와요. 이 중 한 길은 나만 들어요." - 두 경로가 함께
 *  그려진다(공기 경로 먼저 시작, 뼈 경로가 살짝 뒤이어). 아직 굵기 강조는 없다(plain arrow). */
export const S3VoicePaths: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const airP = progress(f, 6, Math.max(7, Math.round(frames * 0.55)));
  const boneP = progress(f, Math.round(frames * 0.16), Math.max(17, Math.round(frames * 0.68)));
  return <DiagramScene f={f} lines={lines} showAirPath={airP} showBonePath={boneP} boneThickness={0} />;
};

/** s4: "몸속 길 소리는 더 낮고 굵어요." - 두 경로는 이미 다 그려진 상태에서 뼈 경로만
 *  점점 굵고 출렁이는 파형으로 바뀐다(narration 문장을 그대로 시각화). */
export const S4VoicePaths: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const thickT = progress(f, 6, Math.max(7, frames - 12));
  return (
    <DiagramScene f={f} lines={lines} showAirPath={1} showBonePath={1} boneThickness={thickT} />
  );
};

/** s5: "녹음기는 공기를 타고 온 소리만 담아요... 더 낯설게 들리는 거예요." - 마이크가 공기
 *  경로만 붙잡고, 뼈 경로(두껍고 풍부한 파형)는 서서히 사라진다. boneThickness 는 s4의
 *  최종값(1)을 유지해 전환이 매끄럽다. */
export const S5VoicePaths: React.FC<{ f: number; lines: CaptionLine[]; frames: number }> = ({ f, lines, frames }) => {
  const micP = progress(f, Math.round(frames * 0.22), Math.max(23, frames - 10));
  return (
    <DiagramScene
      f={f} lines={lines} showAirPath={1} showBonePath={1} boneThickness={1} micCapture={micP}
    />
  );
};

export const DIAG_LAYOUT = { x: DIAG_X, y: DIAG_Y, w: DIAG_W };
