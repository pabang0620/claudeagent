/** 이 화 전용 장면들. 문구는 전부 strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *  s1(무성, 두 캐릭터가 나란히 고수 음식을 먹는데 반응이 갈림 - 왼쪽=찡그림/오른쪽=만족)
 *  -> s2(왼쪽 캐릭터 리액션+훅 질문, 립싱크) -> s3(고수 향 분자 vs 비누 성분 비교 - 겹침)
 *  -> s4(같은 향인데 코 수용체 반응 세기가 사람마다 다름 - 왼쪽 강함/오른쪽 약함)
 *  -> s5(결론 - 두 캐릭터 정지, 각자 반응 대사만 자막으로) -> s6(속설: 자꾸 먹으면 옅어진다)
 *
 *  s2만 캐릭터가 직접 대사를 말하는 구간이라 mouth.json 립싱크를 쓴다(원칙 - ep24/ep28/ep30과
 *  동일). s3~s6은 3인칭 설명 내레이션이 다이어그램 위에 흐르는 구간이라 립싱크를 쓰지 않는다.
 *
 *  왼쪽 캐릭터(찡그림)는 처음부터 끝까지 "비누 맛 강하게 느끼는 사람" 역할을 유지하고,
 *  오른쪽 캐릭터(만족)는 "향긋하게 느끼는 사람" 역할을 유지한다(s1/s2/s4/s5 전 구간 동일
 *  배치 - 캐릭터 정체성 일관성).
 *
 *  Character 에는 "찡그림" 전용 포즈가 없어(mouthOpen 은 항상 살짝 웃는 곡선으로 고정된
 *  형태) eyeOpen 을 낮추고(찡그려 실눈) blush 를 0으로, headTilt 를 음식에서 살짝 비끼는
 *  방향으로 주는 조합으로 불쾌한 표정을 표현한다(ep26/ep29 의 "eyeOpen 낮춤" 기법과 같은
 *  원칙, 새 얼굴 파츠를 그리지 않는다).
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, CILANTRO_LABEL_PT, CILANTRO_VB_W, CilantroDiagram, FONT, FPS, FS,
  Label, NoseGlowOverlay, PlainBg, PlateFoodIcon, POSES, PopIn, RIG, SpeechBubble, ThemedIcon, W,
  blendPose, breathe, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';

const CX = W / 2; // 540

function activeLine(lines: CaptionLine[], t: number): CaptionLine | null {
  for (const ln of lines) if (t >= ln.start && t < ln.end) return ln;
  return null;
}

/* ---------------- 공용: 두 캐릭터 배치 상수 (s1/s5가 같은 좌표를 공유) ---------------- */

const PAIR_SIZE = 560;
const PAIR_LEFT_CX = 300;
const PAIR_RIGHT_CX = 780;
const PAIR_GROUND = 1360;

const DISGUST_POSE: Pose = { headTilt: -9, lean: -2, eyeOpen: 0.28, blush: 0 };
const HAPPY_POSE: Pose = { headTilt: 6, lean: 2, eyeOpen: 1, blush: 1.1 };

function mouthTopFor(size: number, ground: number) {
  return ground - (1026 * size) / RIG.H;
}

/* ---------------- S1: 무성 - 두 캐릭터가 나란히 고수 음식을 먹는다 (반응이 갈림) ---------------- */

const S1_PLATE_W = 260;
export const S1_BITE_SFX_FRAME = 40;

export const S1TwoEaters: React.FC<{ f: number }> = ({ f }) => {
  // 왼쪽: 한 입 크게 베어 무는 동작 (33~48 프레임에서 정점, bite 효과음과 동기)
  const bite = Math.max(0, Math.sin(Math.min(1, progress(f, 24, 56)) * Math.PI));
  const leftMouth = 0.08 + bite * 0.55;
  // 오른쪽: 계속 오물오물 씹는 작은 반복 동작
  const rightMouth = 0.28 + 0.22 * Math.max(0, Math.sin(f / 9));

  const leftTop = mouthTopFor(PAIR_SIZE, PAIR_GROUND);
  const b = breathe(f, 1);
  const plateY = leftTop + 505 * (PAIR_SIZE / RIG.H) + b.dy - 60;

  return (
    <PlainBg ground={PAIR_GROUND} groundColor={C.hill}>
      <Actor
        size={PAIR_SIZE} centerX={PAIR_LEFT_CX} ground={PAIR_GROUND}
        pose={DISGUST_POSE} mouthOpen={leftMouth}
      />
      <Actor
        size={PAIR_SIZE} centerX={PAIR_RIGHT_CX} ground={PAIR_GROUND}
        pose={HAPPY_POSE} mouthOpen={rightMouth} blinkOffset={40}
      />
      <PlateFoodIcon width={S1_PLATE_W} x={PAIR_LEFT_CX - S1_PLATE_W / 2} y={plateY} heat={0.15} />
      <ThemedIcon
        name="leaf" size={64} color="#4E9A63"
        style={{ position: 'absolute', left: PAIR_LEFT_CX - 20, top: plateY + 60 }}
      />
      <PlateFoodIcon width={S1_PLATE_W} x={PAIR_RIGHT_CX - S1_PLATE_W / 2} y={plateY} heat={0.15} />
      <ThemedIcon
        name="leaf" size={64} color="#4E9A63"
        style={{ position: 'absolute', left: PAIR_RIGHT_CX - 20, top: plateY + 60 }}
      />
    </PlainBg>
  );
};

/* ---------------- S2: 리액션 + 훅 질문 - 왼쪽 캐릭터 클로즈업 (립싱크) ---------------- */

const S2_BUST_SIZE = 940;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2 - 60;
const S2_BUST_TOP = 480;
const GRIMACE_POSE: Pose = { headTilt: -8, eyeOpen: 0.3, blush: 0 };

// 배경의 오른쪽 캐릭터(계속 맛있게 먹는 중) - 작게, 화면 오른쪽 위
const S2_BG_SIZE = 360;
const S2_BG_LEFT = W - S2_BG_SIZE + 40;
const S2_BG_TOP = 210;

export const S2Reaction: React.FC<{
  f: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, lines, mouth }) => {
  const bt = progress(f, 0, 14);
  const pose: Pose = blendPose(POSES.idle, GRIMACE_POSE, bt);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  const bgMouth = 0.3 + 0.25 * Math.max(0, Math.sin(f / 8));

  return (
    <PlainBg>
      <BustActor
        size={S2_BG_SIZE} left={S2_BG_LEFT} top={S2_BG_TOP}
        pose={{ ...POSES.idle, blush: 1.1 }} mouthOpen={bgMouth} blinkOffset={40}
        style={{ opacity: 0.92 }}
      />
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, f / FPS)} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S3: 고수 향 분자 vs 비누 성분 - 겹쳐서 닮음을 보여줌 ---------------- */

const S3_DIAG_W = 860;
const S3_DIAG_X = (W - S3_DIAG_W) / 2;
const S3_DIAG_Y = 640;
const S3_SCALE = S3_DIAG_W / CILANTRO_VB_W;
const S3_LABEL_X = S3_DIAG_X + CILANTRO_LABEL_PT.x * S3_SCALE;
const S3_LABEL_Y = S3_DIAG_Y + CILANTRO_LABEL_PT.y * S3_SCALE;

export const S3Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[]; label: string }> = ({
  f, frames, lines, label,
}) => {
  const line = activeLine(lines, f / FPS);
  const compareP = progress(f, 12, frames - 50);
  const labelP = progress(f, frames - 44, frames - 20);

  return (
    <PlainBg ground={null}>
      <CilantroDiagram width={S3_DIAG_W} x={S3_DIAG_X} y={S3_DIAG_Y} compareProgress={compareP} />
      <Label
        x={S3_LABEL_X} y={S3_LABEL_Y} text={label} size={52} color={C.ink} align="center"
        style={{ opacity: labelP }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S4: 같은 향인데 수용체 반응 세기가 다르다 (왼쪽 강함/오른쪽 약함) ---------------- */

const S4_SIZE = 560;
const S4_LEFT_X = 20;
const S4_RIGHT_X = W - S4_SIZE - 20;
const S4_TOP = 470;

export const S4Receptor: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const p = progress(f, 8, 70);
  const strongIntensity = p * 0.95;
  const weakIntensity = p * 0.22;

  return (
    <PlainBg>
      <NoseGlowOverlay
        f={f} width={S4_SIZE} x={S4_LEFT_X} y={S4_TOP} intensity={strongIntensity} color={C.coral}
      />
      <NoseGlowOverlay
        f={f} width={S4_SIZE} x={S4_RIGHT_X} y={S4_TOP} intensity={weakIntensity} color={C.gold}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S5: 결론 - 두 캐릭터 정지 + 각자 반응 대사만 자막으로 ---------------- */

const S5_BUBBLE_W = 420;
const S5_BUBBLE_H = 190;
const S5_BUBBLE_GAP = 20;

export const S5Verdict: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; leftQuote: string; rightQuote: string;
}> = ({ f, frames, lines, leftQuote, rightQuote }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const bubbleP = progress(f, 6, 26);
  const leftTop = mouthTopFor(PAIR_SIZE, PAIR_GROUND);
  const bubbleY = leftTop - S5_BUBBLE_GAP - S5_BUBBLE_H;

  return (
    <PlainBg ground={PAIR_GROUND} groundColor={C.hill}>
      <Actor size={PAIR_SIZE} centerX={PAIR_LEFT_CX} ground={PAIR_GROUND} pose={DISGUST_POSE} mouthOpen={0.1} />
      <Actor
        size={PAIR_SIZE} centerX={PAIR_RIGHT_CX} ground={PAIR_GROUND} pose={HAPPY_POSE} mouthOpen={0.5}
        blinkOffset={40}
      />
      <SpeechBubble
        x={PAIR_LEFT_CX - S5_BUBBLE_W / 2} y={bubbleY} w={S5_BUBBLE_W} h={S5_BUBBLE_H}
        shape="rect" tail="bottomRight" progress={bubbleP}
        bg={C.coralSoft} text={leftQuote} textSize={44}
      />
      <SpeechBubble
        x={PAIR_RIGHT_CX - S5_BUBBLE_W / 2} y={bubbleY} w={S5_BUBBLE_W} h={S5_BUBBLE_H}
        shape="rect" tail="bottomLeft" progress={bubbleP}
        bg={C.goldSoft} text={rightQuote} textSize={44}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ---------------- S6: 속설 - 자꾸 먹으면 비누 맛이 옅어진다? (원칙 1-2 가드레일) ---------------- */

const S6_LEAF_Y = 760;
const S6_LEAF_XS = [300, 540, 780];
const S6_LEAF_SIZES = [150, 120, 92];
const S6_LEAF_OPACITY = [1, 0.62, 0.32];

export const S6Fading: React.FC<{ f: number; frames: number; lines: CaptionLine[]; badge: string }> = ({
  f, frames, lines, badge,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const badgeP = progress(f, 44, 68);

  return (
    <PlainBg ground={null}>
      {S6_LEAF_XS.map((cx, i) => {
        const at = 6 + i * 16;
        const p = clamp01(progress(f, at, at + 16));
        return (
          <PopIn key={i} cx={cx} cy={S6_LEAF_Y} size={S6_LEAF_SIZES[i]} progress={p} fromScale={0.5}>
            <ThemedIcon name="leaf" size={S6_LEAF_SIZES[i]} color="#4E9A63" style={{ opacity: S6_LEAF_OPACITY[i] }} />
          </PopIn>
        );
      })}
      <div
        style={{
          position: 'absolute', left: S6_LEAF_XS[0] + 90, top: S6_LEAF_Y - 4, width: S6_LEAF_XS[2] - S6_LEAF_XS[0] - 180,
          borderTop: `6px dashed ${C.inkSoft}`, opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute', left: CX, top: S6_LEAF_Y + 150, transform: 'translateX(-50%)',
          opacity: clamp01(badgeP), maxWidth: 900,
          background: C.gold, border: `9px solid ${C.ink}`, borderRadius: 999, padding: '18px 40px',
          fontFamily: FONT, fontWeight: 700, fontSize: FS.small, color: C.ink,
          whiteSpace: 'normal', wordBreak: 'keep-all', textAlign: 'center',
        }}
      >
        {badge}
      </div>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
