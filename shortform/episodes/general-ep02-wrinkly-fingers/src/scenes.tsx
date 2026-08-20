/** 이 화(general-ep02, "목욕하면 손가락 쭈글쭈글해지는 이유") 전용 장면.
 *
 *  씬은 SceneSwitcher 가 넘기는 구간 로컬 프레임 f 를 기준으로 전부 결정론적으로 그린다.
 *  화면 문구는 strings.ts 에서만 읽는다.
 */
import React from 'react';
import {
  Actor, Appear, Bathtub, BustActor, C, Card, Caption, FPS, Finger, FingerCrossSection, FingerGrip,
  Label, PlainBg, POSES, SAFE_TOP, ThemedIcon, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { Locale, STRINGS } from './strings';

const CX = W / 2;

/* ---------------- 자막 헬퍼 (ep01 과 동일 패턴, 프로필 general.md 5절: 한글 15자/영문 22자) --- */
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

/* ---------------- S1: 욕조 (목욕 상황 도입, v5 - 무성: 눈 감음 -> 눈 뜸 -> 느낌표 팝인+SFX) ---------------- */

const ACTOR_SIZE = 1500;
const ACTOR_GROUND = 1533;
// v1 검수에서 발견: SHOULDER(RIG y=647)를 수면으로 잡았더니 이 캐릭터는 머리가 커서
// 어깨가 곧 "턱 밑" 높이라 물 위에 머리만 둥둥 떠 있는 것처럼 보였다(팔을 들어도 팔이
// 뺨에 붙어 있는 것처럼 읽힘). 가슴 높이(RIG y~750)로 수면을 낮춰 목·어깨·팔이 드러나게 한다.
const TUB_WATER_Y = 1200;
// 손을 드는 동작: 오른팔만 idle 대비 크게 들어올려 수면 위로 꺼낸다. POINT_UP과 비슷한 각도로
// 확실히 수면(TUB_WATER_Y) 위까지 올라오게 한다 - 어중간하면 "물 밖으로 꺼낸다"는 동작이 안 읽힌다.
const RAISE_HAND: Pose = { ...POSES.idle, armR: { s: -114, e: -20 } };

// v5: s1 이 완전히 무성이 되며(02-script-v5.md) 내레이션 실측 대신 이 상수들이 s1 의 실제
// 길이를 결정한다. Episode.tsx 의 S1_DURATION_SEC 는 이 총합(S1_LOCAL_FRAMES)과 반드시
// 같이 맞춰 바뀌어야 한다 - 둘 중 하나만 고치면 애니메이션과 장면 길이가 어긋난다.
// 비트 배분(대본 4비트, 각 비율은 "약"이라 정확히 맞출 필요는 없다 - 근사):
//   비트1(0~55%)  0~38   : 눈 감고 가만히(무성, 목욕 중)
//   비트2(55~70%) 38~47  : 눈이 스르륵 뜨임(9프레임=0.3초)
//   비트3(70~90%) 47~59  : 눈뜨는 순간 느낌표 팝인 + SFX(realize_ding)
//   비트4(90~100%) 59~69 : 아이콘 홀드 후 s2 로 컷
export const S1_LOCAL_FRAMES = 69; // 2.3초 (대본 추정치와 일치)
const EYE_CLOSE_HOLD_END = 38;
const EYE_OPEN_END = 47; // 38~47 = 9프레임(0.3초) 스르륵 뜸
const HAND_RAISE_START = 20;
const HAND_RAISE_END = EYE_OPEN_END; // 손이 수면 위로 다 나오는 타이밍 = 눈 뜨는 타이밍(대본 지시)
export const ICON_POPIN_START = EYE_OPEN_END; // Episode.tsx 의 realize_ding SFX 타이밍과 공유
const ICON_POPIN_FRAMES = 12;
const ICON_SIZE = 150;

export const S1Bath: React.FC<{ f: number }> = ({ f }) => {
  const armT = progress(f, HAND_RAISE_START, HAND_RAISE_END);
  const armPose = blendPose(POSES.idle, RAISE_HAND, armT);
  // eyeOpen 을 이 장면 로컬에서 직접 0->0(홀드)->1(스르륵 뜸)으로 보간해 인라인 오버라이드한다.
  // Actor 가 이미 `Math.min(pose.eyeOpen, eyeOpenAt(frame) * pose.eyeOpen)` 로 합성하는 구조라
  // (character/Actor.tsx), 이렇게 pose.eyeOpen 만 덮어써도 자동 깜빡임과 자연스럽게 섞인다.
  const eyeT = progress(f, EYE_CLOSE_HOLD_END, EYE_OPEN_END);
  const pose: Pose = { ...armPose, eyeOpen: eyeT };
  const steamT = 1 - progress(f, 0, 60);
  const iconP = progress(f, ICON_POPIN_START, ICON_POPIN_START + ICON_POPIN_FRAMES);

  return (
    <PlainBg top={C.sky} bottom={C.water} ground={null}>
      <Actor size={ACTOR_SIZE} centerX={CX} ground={ACTOR_GROUND} pose={pose} />
      <Bathtub f={f} waterY={TUB_WATER_Y} steamT={steamT} />
      {iconP > 0.001 ? (
        <Appear progress={iconP} from="scale" origin="50% 50%">
          <div
            style={{
              position: 'absolute', left: CX - ICON_SIZE / 2, top: SAFE_TOP + 20,
              width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2,
              background: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ThemedIcon name="exclamation-mark" size={100} color={C.coral} strokePx={13} />
          </div>
        </Appear>
      ) : null}
    </PlainBg>
  );
};

/* ---------------- S2: 쭈글쭈글 리액션 (바스트샷 + 손가락 클로즈업 인서트) ---------------- */

const BUST_SIZE = 950;
const BUST_TOP = 430;
const BUST_LEFT = (W - BUST_SIZE) / 2;

export const S2Wrinkle: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const iconP = progress(f, 10, 26);

  return (
    <PlainBg>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={POSES.surprised} mouthOpen={mouthOpen} />
      <Card x={718} y={230} w={300} h={340} progress={iconP} bg={C.paper} border={C.ink} artBottom={26}>
        <Finger width={220} wrinkle={1} />
      </Card>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 통설(X) vs 실제(O) 비교 + 혈관 좁아짐 인서트 ---------------- */

const CARD_W = 420;
const CARD_H = 420;
const CARD_Y = 260;
const CARD_GAP = 40;

export const S3Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[]; locale: Locale }> = ({
  f, frames, lines, locale,
}) => {
  const line = activeLine(lines, f / FPS);
  const cardP = progress(f, 4, 20);
  const veinNarrow = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.85));
  const strings = STRINGS[locale];

  return (
    <PlainBg>
      <Card
        x={100} y={CARD_Y} w={CARD_W} h={CARD_H} progress={cardP}
        bg={C.paper} border={C.ink} label={strings.s3Wrong}
        badge={<ThemedIcon name="x" size={44} color={C.ink} strokePx={13} />} badgeColor={C.hill}
      >
        <ThemedIcon name="droplet" size={140} color={C.inkSoft} strokePx={12} />
      </Card>
      <Card
        x={100 + CARD_W + CARD_GAP} y={CARD_Y} w={CARD_W} h={CARD_H} progress={cardP}
        bg={C.paper} border={C.coral} label={strings.s3Right}
        badge={<ThemedIcon name="check" size={44} color={C.paper} strokePx={13} />} badgeColor={C.coral}
      >
        <FingerCrossSection width={220} veinNarrow={veinNarrow} />
      </Card>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4/S5: 그립 비교 (매끈함 -> 미끄러짐 / 쭈글쭈글 -> 꽉 잡음) ---------------- */

const GRIP_SIZE = 460;
const GRIP_X = CX - GRIP_SIZE / 2;
const GRIP_Y = 480;
const GRIP_LABEL_Y = GRIP_Y + GRIP_SIZE + 40;

export const S4Slip: React.FC<{ f: number; frames: number; lines: CaptionLine[]; locale: Locale }> = ({
  f, frames, lines, locale,
}) => {
  const line = activeLine(lines, f / FPS);
  const beadY = progress(f, Math.round(frames * 0.35), Math.round(frames * 0.85));

  return (
    <PlainBg>
      <div style={{ position: 'absolute', left: GRIP_X, top: GRIP_Y, width: GRIP_SIZE }}>
        <FingerGrip width={GRIP_SIZE} wrinkle={0} beadY={beadY} gripped={false} />
      </div>
      <Label x={CX} y={GRIP_LABEL_Y} text={STRINGS[locale].s4Label} size={52} align="center" wrapWidth={880} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

export const S5Grip: React.FC<{ f: number; frames: number; lines: CaptionLine[]; locale: Locale }> = ({
  f, frames, lines, locale,
}) => {
  const line = activeLine(lines, f / FPS);
  const checkT = progress(f, Math.round(frames * 0.3), Math.round(frames * 0.55));

  return (
    <PlainBg>
      <div style={{ position: 'absolute', left: GRIP_X, top: GRIP_Y, width: GRIP_SIZE }}>
        <FingerGrip width={GRIP_SIZE} wrinkle={1} gripped checkT={checkT} />
      </div>
      <Label x={CX} y={GRIP_LABEL_Y} text={STRINGS[locale].s5Label} size={52} align="center" wrapWidth={880} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
