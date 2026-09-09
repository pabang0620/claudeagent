/** 이 화(general-ep99, "사람마다 목소리가 다 다른 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트, 현재는 ko 하나뿐).
 *
 *  s1(캐릭터 셋이 각자 다른 파형의 말풍선으로 인사, 무성) -> s2(BustActor 리액션 "근데
 *  목소리는 왜...") -> s3(VoiceIdentityDiagram cordCompareProgress 0~0.55, 저음/고음 성대
 *  모양) -> s4(같은 레이어 0.55~1, 대응 파형 추가) -> s5(resonanceCompareProgress, 공명
 *  공간 크기 차이 + 같은 떨림이 다르게 물듦) -> s6(캐릭터 셋이 각자 다른 색 파형을 내며
 *  나란히 서 있는 마무리, 립싱크) -> s7(pubertyGrowProgress, 어린이<->청소년 성대 성장 +
 *  MiniCharacter 두 명).
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 여러 사람을 그리기보다 한 캐릭터의 성대·공명 공간 치수를 슬라이더처럼 바꿔가며
 *     대비를 보여준다 - s3~s5는 VoiceIdentityDiagram 안에서 캡슐/타원 두 개를 나란히
 *     비교하는 것으로 처리하고, 캐릭터 몸 전체를 두 번 그리지 않는다.
 *   - s1/s6의 "여러 캐릭터"는 "사람마다 목소리가 다르다"는 도입/마무리 컷으로만 쓰고,
 *     성대·공명 공간의 치수 비교 자체는 캐릭터가 아니라 다이어그램이 전담한다.
 *   - 사춘기 변화(s7)는 성대 캡슐이 자라는 크기 변화로만 단순하게 보여준다.
 *
 *  원칙 7(무성 구간 효과음): s1은 무성이라 말풍선 3개가 팝인할 때마다 짧은 ui_tap을
 *  붙인다(재사용 - "화면 UI 탭·버튼 누름 동작 전반", 여기서는 "말풍선이 톡 뜨는" 소리로
 *  전용). 세 번 모두 같은 소리를 재사용한다.
 */
import React from 'react';
import {
  Actor, BustActor, C, Caption, FEET_VB, FPS, GROUND, HEAD_TOP_VB, MiniCharacter, PlainBg,
  POSES, PopIn, RIG, SpeechBubble, VoiceIdentityDiagram, VoiceWaveform, W,
  blendPose, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile } from '../../../assets';

const CX = W / 2;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** 캐릭터 머리 꼭대기 화면 y (말풍선·파형을 머리 위에 앵커할 때 씀).
 *  general-ep11의 headTopY와 같은 공식 - 지역성 우선 원칙에 따라 이 파일에서 다시 짠다. */
function headTopY(size: number, ground: number) {
  return ground - (FEET_VB - HEAD_TOP_VB) * (size / RIG.H);
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: MouthFile['mouth'] }

/* ============================================================
 * S1: 캐릭터 셋이 각자 다른 파형의 말풍선으로 인사 (무성)
 * ============================================================ */
const S1_SIZE = 420;
const S1_CX = [190, 540, 890];
const S1_BUBBLE_R = 96;
const S1_WAVE_COLORS = [C.coral, C.gold, C.ink];
const S1_WAVE_CYCLES = [2.2, 4.4, 6.4];
/** 말풍선이 팝인하는 순간 - Episode.tsx가 ui_tap SFX를 이 프레임들에 맞춘다 */
export const S1_BUBBLE_AT = [8, 22, 36];
const S1_BUBBLE_BUILD = 12;

export const S1Greet: React.FC<{ f: number; frames: number }> = ({ f, frames }) => {
  void frames;
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={GROUND} groundColor={C.hill}>
      {S1_CX.map((cx, i) => {
        const bubbleP = progress(f, S1_BUBBLE_AT[i], S1_BUBBLE_AT[i] + S1_BUBBLE_BUILD);
        const bubbleCy = headTopY(S1_SIZE, GROUND) - S1_BUBBLE_R - 26;
        const pose = i === 1 ? blendPose(POSES.idle, POSES.wave, 0.7) : POSES.idle;
        return (
          <React.Fragment key={i}>
            <Actor size={S1_SIZE} centerX={cx} ground={GROUND} pose={pose} blinkOffset={i * 17} />
            {bubbleP > 0.02 ? (
              <SpeechBubble
                x={cx} y={bubbleCy} r={S1_BUBBLE_R} shape="round"
                tail={i === 0 ? 'bottomRight' : 'bottomLeft'} progress={bubbleP}
              >
                <VoiceWaveform
                  f={f} width={130} cycles={S1_WAVE_CYCLES[i]} color={S1_WAVE_COLORS[i]}
                  strokeWidth={9} style={{ position: 'static' }}
                />
              </SpeechBubble>
            ) : null}
          </React.Fragment>
        );
      })}
    </PlainBg>
  );
};

/* ============================================================
 * S2: "근데 목소리는 왜 사람마다 이렇게 다 다르게 들리지?" 리액션 (바스트샷, 립싱크)
 * ============================================================ */
const S2_BUST_SIZE = 950;
const S2_BUST_LEFT = (W - S2_BUST_SIZE) / 2;
const S2_BUST_TOP = 460;

export const S2React: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's2', f));
  // "다른 캐릭터들을 번갈아 보며" - 좌우로 살짝 고개를 갸웃거리는 결정적 흔들림
  const glance = Math.sin(f * 0.14) * 9;
  const pose = { ...blendPose(POSES.idle, POSES.thinking, 0.65), headTilt: (POSES.idle.headTilt ?? 0) + glance };

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BustActor size={S2_BUST_SIZE} left={S2_BUST_LEFT} top={S2_BUST_TOP} pose={pose} mouthOpen={mouthOpen} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * 다이어그램 공통 배치 (s3~s5)
 * ============================================================ */
const DIAG_W = 640;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 460;

/* ============================================================
 * S3: 저음(길고 두꺼운)/고음(짧고 얇은) 성대 모양 대비 (cordCompareProgress 0~0.55)
 * ============================================================ */
export const S3CordShapes: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const raw = progress(f, 6, Math.max(30, frames - 14));
  const cordCompareProgress = raw * 0.55;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VoiceIdentityDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} cordCompareProgress={cordCompareProgress} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 대응하는 저음/고음 파형 추가 (cordCompareProgress 0.55~1, 이전 상태 유지)
 * ============================================================ */
export const S4CordWaves: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const raw = progress(f, 6, Math.max(30, frames - 14));
  const cordCompareProgress = 0.55 + raw * 0.45;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VoiceIdentityDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} cordCompareProgress={cordCompareProgress} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 공명 공간 크기 차이 - 같은 떨림이 다르게 물든다
 * ============================================================ */
export const S5Resonance: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const resonanceCompareProgress = progress(f, 8, Math.max(30, frames - 14));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VoiceIdentityDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} f={f} resonanceCompareProgress={resonanceCompareProgress} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 캐릭터 셋이 각자 다른 색 파형을 내며 나란히 서 있는 마무리 (립싱크)
 * ============================================================ */
const S6_SIZE = 460;
const S6_CX = [190, 540, 890];
const S6_WAVE_COLORS = [C.coral, C.gold, C.ink];
const S6_WAVE_CYCLES = [2.4, 4, 6];

export const S6Finale: React.FC<MouthSceneProps> = ({ f, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={GROUND} groundColor={C.hill}>
      {S6_CX.map((cx, i) => {
        const waveY = headTopY(S6_SIZE, GROUND) - 118;
        const waveP = progress(f, 6 + i * 8, 40 + i * 8);
        return (
          <React.Fragment key={i}>
            <Actor size={S6_SIZE} centerX={cx} ground={GROUND} pose={POSES.idle} mouthOpen={mouthOpen} blinkOffset={i * 21} />
            <VoiceWaveform
              f={f} width={190} x={cx - 95} y={waveY} cycles={S6_WAVE_CYCLES[i]}
              color={S6_WAVE_COLORS[i]} strokeWidth={11} reveal={waveP}
            />
          </React.Fragment>
        );
      })}
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 사춘기 성대 성장 (어린이 <-> 청소년, MiniCharacter 둘 + 성장 캡슐)
 * ============================================================ */
const S7_DIAG_W = 420;
const S7_DIAG_X = CX - S7_DIAG_W / 2;
const S7_DIAG_Y = 560;
const S7_BASE_Y = 880;
const S7_CHILD_W = 170;
const S7_CHILD_CX = 150;
const S7_TEEN_W = 300;
const S7_TEEN_CX = 910;

export const S7Puberty: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const pubertyGrowProgress = progress(f, 6, Math.max(30, frames - 14));
  const childFade = clamp01(1 - pubertyGrowProgress * 1.3);
  const teenFade = clamp01((pubertyGrowProgress - 0.15) / 0.6);
  const enter = progress(f, 0, 16);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <PopIn cx={S7_CHILD_CX} cy={S7_BASE_Y - S7_CHILD_W / 2} size={S7_CHILD_W} progress={enter} style={{ opacity: childFade * Math.min(1, enter / 0.5) }}>
        <MiniCharacter width={S7_CHILD_W} pose={POSES.idle} />
      </PopIn>
      <VoiceIdentityDiagram width={S7_DIAG_W} x={S7_DIAG_X} y={S7_DIAG_Y} f={f} pubertyGrowProgress={pubertyGrowProgress} />
      <PopIn cx={S7_TEEN_CX} cy={S7_BASE_Y - S7_TEEN_W / 2} size={S7_TEEN_W} progress={enter} style={{ opacity: teenFade }}>
        <MiniCharacter width={S7_TEEN_W} pose={POSES.idle} />
      </PopIn>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
