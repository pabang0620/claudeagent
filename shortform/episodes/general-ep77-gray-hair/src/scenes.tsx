/** 이 화(general-ep77, "나이 들면 흰머리가 나는 이유") 전용 장면. 문구는 전부 strings.ts 에서
 *  읽는다(언어 무관 컴포넌트).
 *
 *  s1(거울 앞 발견 훅샷, BustActor + 돋보기 콜아웃으로 흰머리 확대) -> s2(HairFollicleDiagram
 *  follicle - 색소 세포 등장) -> s3(CompareBars - 나이대별 색소 세포 수 감소 그래프) ->
 *  s4(HairFollicleDiagram strand 2개 - 색소 있음/없음 비교) -> s5(strand 1개 - 공기 방울 +
 *  빛 반사로 하얗게 보임) -> s6(FingerGrip + 속설 X + 실제 단면도) -> s7(head 몽타주).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 색소가 가득한 젊은 모낭과 색소가 줄어든 나이든 모낭의 대비가 중심 - 모낭은 단순한 관
 *     형태, 색소 세포는 큰 도형 2개로만 표현한다(점 무리 금지, HairFollicleDiagram 참고).
 *   - 머리카락 색 자체(어두운 색 -> 흰색)로 색소 유무를 보여준다(s4/s5).
 *   - 모낭·두피를 사실적으로 그리지 않는다.
 *
 *  s6 속설 정정: X 표시는 "뽑으면 두 개 난다"(틀린 통념) 쪽 아이콘에만 붙고, "모낭 하나 =
 *  머리카락 하나"(실제 설명) 쪽 HairFollicleDiagram에는 붙지 않는다(70화 S6Myth와 동일
 *  배치 원칙 - 빌더 정의파일 "21화 이후 반복된 결함" F절). 스틸 선점검에서 X가 어느 쪽에
 *  붙는지 직접 확인했다(99-build-report.md 참고).
 *
 *  새 REGISTRY 자산은 HairFollicleDiagram(props/) 하나뿐이다. "속설: ~? 사실 아님" 표시는
 *  70화가 이미 QMark(glyph="X") + Label 조합으로 구현해 둔 패턴이라 별도 MythLabel
 *  컴포넌트를 새로 만들지 않고 그대로 재사용했다(02-script-v1.md 자산 목록은 MythLabel을
 *  "새로 만들어야 함"으로 적었으나, REGISTRY 우선 원칙 0에 따라 기존 QMark 조합으로 충분해
 *  새로 만들지 않기로 판단 - 29화와 같은 판단).
 */
import React from 'react';
import {
  BarItem, BustActor, C, Caption, CompareBars, FPS, FS, FingerGrip, HAIR_FOLLICLE_ROOT_PT,
  HAIR_FOLLICLE_VB_H, HAIR_FOLLICLE_VB_W, HAIR_PIGMENT_LABEL_PT,
  HairFollicleDiagram, Label, PlainBg, POSES, QMark, SW, W, blendPose, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, Pose } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * S1: 거울 앞 발견 훅샷 - BustActor(touchForehead 포즈로 자연스럽게 머리 쪽에 손이 감) +
 * 돋보기 콜아웃(원형 클립 div, CloudFloatDiagram의 "돋보기 확대" 관례를 div 클립으로 구현
 * - SVG 중첩 대신 CSS overflow:hidden 원을 써서 "svg 안에 position:absolute 자식 svg를
 * 중첩하면 위치가 무시된다"는 결함(빌더 정의파일 21화 이후 결함 A절)을 원천 회피한다)
 * ============================================================ */
const BUST_SIZE = 780;
const BUST_TOP = 560;
const BUST_LEFT = (W - BUST_SIZE) / 2;
const LENS_CX = CX + 300;
const LENS_CY = 520;
const LENS_R = 130;

export const S1Hook: React.FC<{
  f: number; frames: number; lines: CaptionLine[]; mouth: Record<string, number[]>;
}> = ({ f, frames, lines, mouth }) => {
  const line = activeLine(lines, f / FPS);
  const poseT = progress(f, 0, 16);
  const pose: Pose = blendPose(POSES.idle, POSES.touchForehead, poseT);
  const lensA = progress(f, 10, 28);
  const reflA = progress(f, 18, Math.max(19, frames - 10));
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));

  return (
    <PlainBg>
      <BustActor size={BUST_SIZE} left={BUST_LEFT} top={BUST_TOP} pose={pose} mouthOpen={mouthOpen} />

      {lensA > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: LENS_CX - LENS_R, top: LENS_CY - LENS_R,
            width: LENS_R * 2, height: LENS_R * 2, borderRadius: '50%', overflow: 'hidden',
            background: C.paper, border: `${SW}px solid ${C.ink}`,
            opacity: lensA, transform: `scale(${0.7 + 0.3 * lensA})`, transformOrigin: '50% 50%',
          }}
        >
          <HairFollicleDiagram
            mode="strand" width={LENS_R * 2 * 1.35}
            x={-(LENS_R * 2 * 1.35 - LENS_R * 2) / 2} y={-(LENS_R * 2 * 1.35 - LENS_R * 2) / 2}
            transparentProgress={1} reflectProgress={reflA}
          />
        </div>
      ) : null}
      {lensA > 0.01 ? (
        <div
          style={{
            position: 'absolute', left: LENS_CX + LENS_R * 0.62, top: LENS_CY + LENS_R * 0.62,
            width: 12, height: 96, background: C.ink, borderRadius: 8,
            transform: 'rotate(45deg)', transformOrigin: 'top left', opacity: lensA,
          }}
        />
      ) : null}

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 모낭 단면도 - 색소 세포 등장
 * ============================================================ */
const S2_DIAG_W = 620;
const S2_DIAG_X = CX - S2_DIAG_W / 2;
const S2_DIAG_Y = 360;
const S2_SCALE = S2_DIAG_W / HAIR_FOLLICLE_VB_W;

function s2Pt(pt: { x: number; y: number }) {
  return { x: S2_DIAG_X + pt.x * S2_SCALE, y: S2_DIAG_Y + pt.y * S2_SCALE };
}

export const S2Follicle: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const pigA = progress(f, 10, frames * 0.75);
  const rootLabelA = progress(f, 4, 24);
  const pigLabelAt = Math.round(frames * 0.42);
  const pigLabelA = progress(f, pigLabelAt, pigLabelAt + 24);
  const rootPt = s2Pt(HAIR_FOLLICLE_ROOT_PT);
  const pigPt = s2Pt(HAIR_PIGMENT_LABEL_PT);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HairFollicleDiagram width={S2_DIAG_W} x={S2_DIAG_X} y={S2_DIAG_Y} pigmentCellProgress={pigA} />
      <Label
        x={rootPt.x} y={rootPt.y} text={t.s2RootLabel} size={FS.label} color={C.ink}
        wrapWidth={560} style={{ opacity: rootLabelA }}
      />
      <Label
        x={pigPt.x} y={pigPt.y} text={t.s2PigmentLabel} size={FS.small} color={C.browning}
        wrapWidth={420} style={{ opacity: pigLabelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 나이대별 색소 세포 수 감소 그래프 (CompareBars 재사용)
 * ============================================================ */
export const S3Graph: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const gaugeLabelA = progress(f, 4, 20);

  const items: BarItem[] = [
    { label: t.s3Age10, value: 100, color: C.browning, at: 6 },
    { label: t.s3Age30, value: 70, color: C.browning, at: Math.round(frames * 0.24) },
    { label: t.s3Age50, value: 35, color: C.browning, at: Math.round(frames * 0.46) },
    { label: t.s3Age70, value: 0, color: C.browning, at: Math.round(frames * 0.66) },
  ];

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={300} text={t.s3Gauge} size={FS.label} color={C.ink} style={{ opacity: gaugeLabelA }} />
      <CompareBars
        items={items} x={140} y={420} pxPerUnit={7} rowGap={210} labelGap={60} frame={f}
        stroke={C.ink} labelColor={C.ink} labelSize={FS.small} minLength={0}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 색소 있는 머리카락 단면 vs 색소 없는(투명) 단면 나란히 비교
 * ============================================================ */
const S4_STRAND_W = 340;
const S4_L_CX = CX - 220;
const S4_R_CX = CX + 220;
const S4_Y = 640;

export const S4Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const revealAt = Math.round(frames * 0.35);
  const revealR = progress(f, revealAt, revealAt + 26);
  const labelA = progress(f, 6, 26);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HairFollicleDiagram mode="strand" width={S4_STRAND_W} x={S4_L_CX - S4_STRAND_W / 2} y={S4_Y} transparentProgress={0} />
      <Label
        x={S4_L_CX} y={S4_Y + S4_STRAND_W + 50} text={t.s4LabelPigment} size={FS.small} color={C.ink}
        style={{ opacity: labelA }}
      />

      <HairFollicleDiagram
        mode="strand" width={S4_STRAND_W} x={S4_R_CX - S4_STRAND_W / 2} y={S4_Y} transparentProgress={revealR}
      />
      <Label
        x={S4_R_CX} y={S4_Y + S4_STRAND_W + 50} text={t.s4LabelClear} size={FS.small} color={C.inkSoft}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 투명 머리카락 단면 확대 - 공기 방울 + 빛 반사로 하얗게 보임
 * ============================================================ */
const S5_STRAND_W = 640;
const S5_Y = 560;

export const S5Reflect: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const reflA = progress(f, 8, frames * 0.8);
  const labelAt = Math.round(frames * 0.5);
  const labelA = progress(f, labelAt, labelAt + 26);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <HairFollicleDiagram
        mode="strand" width={S5_STRAND_W} x={CX - S5_STRAND_W / 2} y={S5_Y}
        transparentProgress={1} reflectProgress={reflA}
      />
      <Label
        x={CX} y={S5_Y + S5_STRAND_W + 60} text={t.s5Label} size={FS.label} color={C.ink}
        wrapWidth={860} style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 속설 정정 - "뽑으면 두 개 난다"(틀린 통념, X 표시) vs "모낭 하나 = 머리카락 하나"
 * (실제 설명, X 없음). FingerGrip(기존 등록 자산)으로 "손으로 뽑는 모습"을 표현한다.
 * ============================================================ */
// HairFollicleDiagram의 로컬 HAIR_GRAY(#D7DBE2)와 같은 색을 써서 "색 빠진 흰머리" 톤을
// 시각적으로 일관되게 맞춘다(그 상수는 export하지 않으므로 값만 그대로 복제 - 지역성 우선).
const S6_BEAD_COLOR = '#D7DBE2';
const S6_GRIP_W = 260;
const S6_GRIP_X = CX - S6_GRIP_W / 2;
const S6_GRIP_Y = 20;

const S6_ICON_CX = CX - 230;
const S6_ICON_CY = 580;
const S6_ICON_R = 70;

const S6_DIAG_W = 300;
const S6_DIAG_X = CX + 20;
const S6_DIAG_Y = 420;
const S6_DIAG_H = (S6_DIAG_W * HAIR_FOLLICLE_VB_H) / HAIR_FOLLICLE_VB_W;

export const S6Myth: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const gripA = progress(f, 0, 20);
  const iconAt = Math.round(frames * 0.3);
  const iconA = progress(f, iconAt, iconAt + 24);
  const xAt = Math.round(frames * 0.5);
  const xA = progress(f, xAt, xAt + 16);
  const diagAt = Math.round(frames * 0.62);
  const diagA = progress(f, diagAt, diagAt + 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <div style={{ opacity: gripA }}>
        <FingerGrip
          width={S6_GRIP_W} gripped beadColor={S6_BEAD_COLOR}
          style={{ position: 'absolute', left: S6_GRIP_X, top: S6_GRIP_Y }}
        />
      </div>

      {/* 왼쪽: "뽑으면 두 개 난다"는 틀린 통념 - 모낭 하나에서 선 두 가닥이 갈라져 나오는
          중립적 아이콘 위에 X (70화 S6Myth와 동일 배치 - X는 이 아이콘·라벨 쪽에만 붙는다) */}
      <svg
        width={S6_ICON_R * 2 + 20} height={S6_ICON_R * 2 + 20}
        style={{
          position: 'absolute', left: S6_ICON_CX - S6_ICON_R - 10, top: S6_ICON_CY - S6_ICON_R - 10,
          opacity: iconA,
        }}
      >
        <circle cx={S6_ICON_R + 10} cy={S6_ICON_R + 10} r={S6_ICON_R} fill={C.paper} stroke={C.inkSoft} strokeWidth={9} />
        <line
          x1={S6_ICON_R + 10} y1={S6_ICON_R + 10 + 30} x2={S6_ICON_R + 10 - 26} y2={S6_ICON_R + 10 - 32}
          stroke={C.inkSoft} strokeWidth={10} strokeLinecap="round"
        />
        <line
          x1={S6_ICON_R + 10} y1={S6_ICON_R + 10 + 30} x2={S6_ICON_R + 10 + 26} y2={S6_ICON_R + 10 - 32}
          stroke={C.inkSoft} strokeWidth={10} strokeLinecap="round"
        />
      </svg>
      {xA > 0.01 ? (
        <QMark
          size={S6_ICON_R * 2} glyph="X" color={C.coral} outline={C.paper}
          style={{
            left: S6_ICON_CX, top: S6_ICON_CY,
            transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * xA})`, opacity: xA,
          }}
        />
      ) : null}
      <Label
        x={S6_ICON_CX} y={S6_ICON_CY + S6_ICON_R + 34} text={t.s6MythLabel} size={FS.small}
        color={C.inkSoft} wrapWidth={300} style={{ opacity: iconA }}
      />
      <Label
        x={S6_ICON_CX} y={S6_ICON_CY + S6_ICON_R + 104} text={t.s6RealLabel} size={FS.small}
        color={C.coral} style={{ opacity: xA }}
      />

      {/* 오른쪽: 실제로는 모낭 하나에 머리카락 한 가닥만 자란다 - X 표시 없음 */}
      <HairFollicleDiagram
        width={S6_DIAG_W} x={S6_DIAG_X} y={S6_DIAG_Y} pigmentCellProgress={1}
        style={{ opacity: diagA }}
      />
      <Label
        x={S6_DIAG_X + S6_DIAG_W / 2} y={S6_DIAG_Y + S6_DIAG_H + 40} text={t.s6SubLabel} size={FS.small}
        color={C.ink} wrapWidth={340} style={{ opacity: diagA }}
      />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 요약 몽타주 - 같은 과정이 머리 전체에서 반복되며 흰머리가 늘어남
 * ============================================================ */
const S7_HEAD_W = 760;
const S7_HEAD_X = CX - S7_HEAD_W / 2;
const S7_HEAD_Y = 520;

export const S7Summary: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const grayA = progress(f, 6, frames * 0.85);
  const labelA = progress(f, 4, 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label
        x={CX} y={320} text={t.s7Label} size={FS.label} color={C.ink} wrapWidth={780}
        style={{ opacity: labelA }}
      />
      <HairFollicleDiagram mode="head" width={S7_HEAD_W} x={S7_HEAD_X} y={S7_HEAD_Y} grayProgress={grayA} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
