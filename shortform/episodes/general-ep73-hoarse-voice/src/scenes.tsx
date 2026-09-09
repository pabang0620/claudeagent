/** 이 화(general-ep73, "소리 지르고 나면 목이 쉬는 이유") 전용 장면. 문구는 전부 strings.ts
 *  에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(소리 지르는 캐릭터 -> 갈라진 음성 파형으로 전환, 립싱크) -> s2(VocalCordVibrationDiagram
 *  vibrateProgress - 성대 두 겹이 규칙적으로 부드럽게 진동) -> s3(같은 다이어그램 2개를 나란히
 *  둬 "평소" vs "소리 지를 때" 대비, strainProgress) -> s4(strainProgress=1 유지 + swellProgress
 *  - 성대 표면이 붉게 붓는 애니메이션) -> s5(swellProgress=1 유지 + hoarseProgress - 부은 성대가
 *  울퉁불퉁 불규칙하게 떨림 + VoiceWaveform으로 거칠어진 목소리 파형) -> s6(whisperProgress -
 *  속삭이면 성대가 꽉 조여져 마찰이 커짐. "속삭이면 편할까?"라는 틀린 생각엔 X, 실제 기전
 *  다이어그램엔 X 없음) -> s7(vibrateProgress=0 정지 상태 + "휴식" 라벨, 립싱크).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 성대가 세게 부딪히는 것(소리 지름)과 억지로 좁게 접촉시키는 것(속삭임)의 대비가
 *     이 화의 중심이다 - s3(강도 대비)와 s6(속삭임 좁은 틈)로 각각 구현했다.
 *   - 성대를 해부도로 그리지 않는다 - VocalCordVibrationDiagram이 단순 캡슐 두 개로만 표현.
 *   - 부은 상태는 색 변화(빨갛게)로만 표현한다(질감·주름 등 추가 디테일 없음).
 *   - 속삭이는 캐릭터 동작은 과장하지 않는다 - s6은 idle(가만히 선) 포즈를 쓴다.
 *   - "속삭이면 목에 더 안 좋다"는 반전이 핵심이라, s6에서 X 표시는 "속삭이면 편할까?"라는
 *     틀린 가정 쪽에만 붙이고, 실제 기전(성대를 더 꽉 조임 -> 마찰 커짐) 다이어그램에는
 *     X를 붙이지 않는다 - 70화 X 반전 사고(REGISTRY "21화 이후 결함" 절)가 재발하지 않도록
 *     스틸 선점검에서 반드시 재확인한다(99-build-report.md 참고).
 *
 *  s1·s6·s7만 캐릭터(Actor)가 화면에 등장해 mouth.json을 쓴다. s2~s5는 다이어그램만 진행되는
 *  3인칭 설명 구간이라 캐릭터가 등장하지 않는다(ep69와 동일 원칙).
 */
import React from 'react';
import {
  Actor, C, Caption, FPS, FlashOverlay, GROUND, Label, PlainBg, POSES, QMark, Shake, ThemedIcon,
  VOCAL_CORD_LABEL_PT, VOCAL_CORD_SWELL_COLOR, VOCAL_CORD_VB_W, VocalCordVibrationDiagram,
  VoiceWaveform, W, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/** VocalCordVibrationDiagram 내부 라벨 앵커(viewBox 좌표)를 화면 좌표로 환산한다. */
function diagramLabelPt(diagX: number, diagY: number, diagWidth: number) {
  const scale = diagWidth / VOCAL_CORD_VB_W;
  return { x: diagX + VOCAL_CORD_LABEL_PT.x * scale, y: diagY + VOCAL_CORD_LABEL_PT.y * scale };
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: MouthFile['mouth'] }

/* ============================================================
 * S1: 목이 터져라 소리를 지르고 나면 목소리가 갈라진다 (립싱크)
 * ============================================================ */
export const S1Hook: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  const sec = f / FPS;
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  const waveReveal = progress(f, frames * 0.42, frames * 0.94);
  const roughness = progress(f, frames * 0.5, frames * 0.95);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Shake frame={f} at={6} duration={16} amp={9} freq={2.6}>
        <Actor size={780} centerX={CX} ground={GROUND} pose={POSES.cheer} mouthOpen={mouthOpen} />
      </Shake>
      <FlashOverlay frame={f} at={9} peak={0.5} rise={3} fall={14} />
      {waveReveal > 0.01 ? (
        <VoiceWaveform f={f} width={760} x={CX - 380} y={330} roughness={roughness} reveal={waveReveal} color={C.ink} />
      ) : null}
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 목소리는 성대 두 겹이 빠르게 부딪히고 떨리면서 나는 소리
 * ============================================================ */
const S2_DIAG_WIDTH = 640;
const S2_DIAG_X = CX - S2_DIAG_WIDTH / 2;
const S2_DIAG_Y = 560;

export const S2Vibrate: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const vibA = progress(f, 6, frames * 0.6);
  const labelA = progress(f, 14, 40);
  const labelPt = diagramLabelPt(S2_DIAG_X, S2_DIAG_Y, S2_DIAG_WIDTH);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VocalCordVibrationDiagram f={f} width={S2_DIAG_WIDTH} x={S2_DIAG_X} y={S2_DIAG_Y} vibrateProgress={vibA} />
      <Label x={labelPt.x} y={labelPt.y} text={t.vocalCordsLabel} size={54} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 크게 소리 지르면 평소보다 훨씬 세고 빠르게 부딪힌다 ("평소" vs "소리 지를 때" 대비)
 * ============================================================ */
const S3_DIAG_WIDTH = 430;
const S3_LEFT_X = CX - 470;
const S3_RIGHT_X = CX + 40;
const S3_DIAG_Y = 560;
/** strainProgress가 충분히 올라 실제로 세게 부딪히는 지점(전체 씬 길이 대비 비율).
 *  Episode.tsx가 이 지점에 hop_thump.mp3(부딪힘 SFX)를 맞춘다(원칙 7). */
export const S3_IMPACT_FRAC = 0.87;

export const S3Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const vibA = progress(f, 4, 28);
  const strainA = progress(f, frames * 0.22, frames * 0.85);
  const labelA = progress(f, 16, 42);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VocalCordVibrationDiagram
        f={f} width={S3_DIAG_WIDTH} x={S3_LEFT_X} y={S3_DIAG_Y} vibrateProgress={vibA} strainProgress={0}
      />
      <VocalCordVibrationDiagram
        f={f} width={S3_DIAG_WIDTH} x={S3_RIGHT_X} y={S3_DIAG_Y} vibrateProgress={vibA} strainProgress={strainA}
      />
      <Label
        x={S3_LEFT_X + S3_DIAG_WIDTH / 2} y={S3_DIAG_Y - 60} text={t.normalLabel} size={46} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Label
        x={S3_RIGHT_X + S3_DIAG_WIDTH / 2} y={S3_DIAG_Y - 60} text={t.screamLabel} size={46} color={C.coral}
        style={{ opacity: labelA }}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 성대 표면이 붓고 살짝 상한다 (강한 진동 유지 + swellProgress)
 * ============================================================ */
const S4_DIAG_WIDTH = 640;
const S4_DIAG_X = CX - S4_DIAG_WIDTH / 2;
const S4_DIAG_Y = 560;

export const S4Swell: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const swellA = progress(f, 10, frames * 0.78);
  const labelA = progress(f, 20, 48);
  const labelPt = diagramLabelPt(S4_DIAG_X, S4_DIAG_Y, S4_DIAG_WIDTH);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VocalCordVibrationDiagram
        f={f} width={S4_DIAG_WIDTH} x={S4_DIAG_X} y={S4_DIAG_Y}
        vibrateProgress={1} strainProgress={1} swellProgress={swellA}
      />
      <Label
        x={labelPt.x} y={labelPt.y} text={t.swellLabel} size={50} color={VOCAL_CORD_SWELL_COLOR}
        style={{ opacity: labelA }}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 부은 성대는 울퉁불퉁 불규칙하게 떨려서 목소리가 거칠어진다
 * ============================================================ */
const S5_DIAG_WIDTH = 520;
const S5_DIAG_X = CX - S5_DIAG_WIDTH / 2;
const S5_DIAG_Y = 420;
const S5_WAVE_WIDTH = 760;
const S5_WAVE_X = CX - S5_WAVE_WIDTH / 2;
const S5_WAVE_Y = 1000;

export const S5Hoarse: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const hoarseA = progress(f, frames * 0.14, frames * 0.8);
  const labelA = progress(f, 16, 44);
  const labelPt = diagramLabelPt(S5_DIAG_X, S5_DIAG_Y, S5_DIAG_WIDTH);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <VocalCordVibrationDiagram
        f={f} width={S5_DIAG_WIDTH} x={S5_DIAG_X} y={S5_DIAG_Y}
        vibrateProgress={1} strainProgress={0} swellProgress={1} hoarseProgress={hoarseA}
      />
      <Label
        x={labelPt.x} y={labelPt.y} text={t.hoarseLabel} size={42} color={VOCAL_CORD_SWELL_COLOR}
        wrapWidth={S5_DIAG_WIDTH + 60} style={{ opacity: labelA }}
      />
      <VoiceWaveform f={f} width={S5_WAVE_WIDTH} x={S5_WAVE_X} y={S5_WAVE_Y} roughness={hoarseA} reveal={1} color={C.ink} />
      <Label
        x={CX} y={S5_WAVE_Y + S5_WAVE_WIDTH * 0.34 + 26} text={t.roughVoiceLabel} size={38} color={C.inkSoft}
        style={{ opacity: labelA }}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 속삭이면 오히려 더 안 좋다 - 성대를 꽉 조인 채 바람을 억지로 내보내 마찰이 커진다.
 * "속삭이면 편할까?"는 틀린 생각(X), 실제 기전(마찰 커짐) 다이어그램엔 X 없음.
 * ============================================================ */
const S6_ACTOR_SIZE = 380;
const S6_ACTOR_GROUND = 560;
const S6_ICON_CX = CX - 230;
const S6_ICON_CY = 870;
const S6_ICON_R = 70;
const S6_DIAG_WIDTH = 300;
const S6_DIAG_X = CX + 80;
const S6_DIAG_Y = S6_ICON_CY + S6_ICON_R - S6_DIAG_WIDTH;
const S6_LABEL_ROW_Y = S6_ICON_CY + S6_ICON_R + 30;
/** whisperProgress가 거의 완성돼 마찰 바람이 뚜렷해지는 지점(전체 씬 길이 대비 비율).
 *  Episode.tsx가 이 지점에 head_whoosh.mp3(마찰 바람 SFX)를 맞춘다(원칙 7). */
export const S6_WHOOSH_FRAC = 0.4;

export const S6Whisper: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  const sec = f / FPS;
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  const whisperA = progress(f, frames * 0.12, frames * 0.5);
  // 아이콘·라벨은 먼저 자리잡고("속삭이면 편할까?"라는 생각이 먼저 보임), X는 그보다 늦게
  // 그어져 "틀렸다"고 정정하는 순서로 읽히게 한다(ep70 S6Myth와 동일한 iconA/xA 분리 관례).
  const labelA = progress(f, 18, 46);
  const xA = progress(f, 50, 78);
  const topLabelA = progress(f, 6, 30);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={100} text={t.mythTopLabel} size={50} color={C.coral} style={{ opacity: topLabelA }} />

      <Actor size={S6_ACTOR_SIZE} centerX={CX} ground={S6_ACTOR_GROUND} pose={POSES.idle} mouthOpen={mouthOpen} />

      {/* 왼쪽: "속삭이면 편할까?"라는 틀린 생각 - 중립적인 깃털(가벼움) 아이콘 위에 X */}
      <svg
        width={S6_ICON_R * 2 + 20} height={S6_ICON_R * 2 + 20}
        style={{ position: 'absolute', left: S6_ICON_CX - S6_ICON_R - 10, top: S6_ICON_CY - S6_ICON_R - 10, opacity: labelA }}
      >
        <circle cx={S6_ICON_R + 10} cy={S6_ICON_R + 10} r={S6_ICON_R} fill={C.paper} stroke={C.inkSoft} strokeWidth={9} />
      </svg>
      <ThemedIcon
        name="feather" size={S6_ICON_R * 1.1} color={C.inkSoft}
        style={{ position: 'absolute', left: S6_ICON_CX - S6_ICON_R * 0.55, top: S6_ICON_CY - S6_ICON_R * 0.55, opacity: labelA }}
      />
      {xA > 0.02 ? (
        <QMark
          size={S6_ICON_R * 2} glyph="X" color={C.coral} outline={C.paper}
          style={{
            left: S6_ICON_CX, top: S6_ICON_CY,
            transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * xA})`, opacity: xA,
          }}
        />
      ) : null}
      <Label
        x={S6_ICON_CX} y={S6_LABEL_ROW_Y} text={t.mythSubLabel} size={32} color={C.inkSoft}
        wrapWidth={S6_ICON_R * 2 + 30} style={{ opacity: labelA }}
      />

      {/* 오른쪽: 실제 기전 - 성대가 꽉 조여진 좁은 틈으로 바람이 지나감(마찰 커짐), X 없음 */}
      <VocalCordVibrationDiagram
        f={f} width={S6_DIAG_WIDTH} x={S6_DIAG_X} y={S6_DIAG_Y} vibrateProgress={1} whisperProgress={whisperA}
      />
      <Label
        x={S6_DIAG_X + S6_DIAG_WIDTH / 2} y={S6_LABEL_ROW_Y} text={t.truthSubLabel} size={32} color={C.ink}
        wrapWidth={S6_DIAG_WIDTH + 30} style={{ opacity: labelA }}
      />

      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 그래서 목이 쉬었을 땐 소리를 적게 내는 게 성대를 쉬게 하는 방법
 * ============================================================ */
const S7_DIAG_WIDTH = 260;
const S7_DIAG_X = CX - S7_DIAG_WIDTH / 2;
const S7_DIAG_Y = 150;

export const S7Rest: React.FC<MouthSceneProps> = ({ f, lines, mouth }) => {
  const sec = f / FPS;
  const mouthOpen = mouthProp(mouthAt(mouth, 's7', f));
  const labelA = progress(f, 8, 32);

  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <ThemedIcon name="moon" size={60} color={C.inkSoft} style={{ position: 'absolute', left: CX - 160, top: 68, opacity: labelA }} />
      <Label x={CX + 24} y={98} text={t.restLabel} size={54} color={C.ink} style={{ opacity: labelA }} />
      <VocalCordVibrationDiagram f={f} width={S7_DIAG_WIDTH} x={S7_DIAG_X} y={S7_DIAG_Y} vibrateProgress={0} />
      <Actor size={760} centerX={CX} ground={GROUND} pose={POSES.idle} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};
