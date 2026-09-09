/** 이 화(general-ep70, "태풍이 소용돌이 모양인 이유") 전용 장면. 문구는 전부 strings.ts 에서
 *  읽는다(언어 무관 컴포넌트).
 *
 *  s1(큰 소용돌이 훅샷, 무성) -> s2(TyphoonSpiralDiagram inflowProgress - 저기압 중심으로
 *  곧장 빨려드는 직선 화살표) -> s3(coriolisProgress - 직선 안내선 vs 실제로 휘어지는 곡선의
 *  대비 + 지구 자전 표시 아이콘) -> s4(spiralProgress - 휘어짐이 쌓여 완성된 소용돌이) ->
 *  s5(hemisphereProgress - 지구본 한 개 위에서 북반구 반시계·남반구 시계 대비) -> s6(Bathtub +
 *  mythProgress 배수구 아이콘 + "속설: 사실 아님" 명시 라벨) -> s7(요약 - 지구 자전 축 + 완성된
 *  소용돌이).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 공기가 중심으로 곧장 빨려 들어가는 것(휘지 않음)과 실제로 휘어져 들어가는 것의
 *     대비가 핵심이다 - s2(직선만)와 s3(직선 안내선+곡선 대비)로 구현했다.
 *   - 위에서 내려다본 지구와 태풍을 단순한 원과 소용돌이 화살표로만 그린다(위성사진처럼
 *     사실적으로 그리지 않는다) - PlainBg + TyphoonSpiralDiagram만 쓰고 OceanBg/NightSkyBg의
 *     수면선·별 디테일은 이 화의 추상적인 다이어그램 톤과 맞지 않아 쓰지 않았다.
 *   - 북반구 반시계·남반구 시계가 실제로 맞는지는 TyphoonSpiralDiagram.tsx의
 *     `curlSignFor`/`hemisphereAt`가 "적도선 기준 위/아래 위치"에서 직접 계산하고(62화
 *     EarthOrbitDiagram과 같은 정신), s5의 렌더 결과를 스틸 선점검에서 실제로 눈으로
 *     확인했다(99-build-report.md 참고).
 *   - 소용돌이 팔은 굵은 곡선 2~3개로만 표현하고 얇은 선을 촘촘히 그리지 않는다
 *     (TyphoonSpiralDiagram 내부 SPIRAL_ARM_BASES/HEMI 배열이 3개/2개로 고정).
 *
 *  어느 장면도 캐릭터가 직접 말하는 순간이 아니라(전부 3인칭 설명 내레이션, 대본 자산
 *  목록에도 캐릭터 재사용이 없다) mouth.json 립싱크를 쓰지 않는다(ep19/ep21/ep23/ep25/ep60/
 *  ep62와 동일 원칙 - ko_mouth.json은 파이프라인 표준 절차로 만들었지만 이 화 어디서도
 *  import하지 않는다).
 */
import React from 'react';
import {
  Bathtub, C, Caption, FPS, Label, PlainBg, QMark, TyphoonSpiralDiagram, W,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const STR = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

/* ============================================================
 * 공통: TyphoonSpiralDiagram 배치 좌표 (정사각 viewBox 900x900이므로
 * 화면 중심 = (x + width/2, y + width/2))
 * ============================================================ */
const DIAG_WIDTH = 920;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 380;
const DIAG_CENTER_Y = DIAG_Y + DIAG_WIDTH / 2;

/* ============================================================
 * S1: 큰 소용돌이 훅샷 (무성) - 완성된 spiral 형태를 빠르게 그려 보인다
 * ============================================================ */
export const S1Hook: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const spiralA = Math.max(0, Math.min(1, f / 70));

  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      <TyphoonSpiralDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        spiralProgress={spiralA} hemisphere="north"
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 저기압 중심으로 곧장 빨려드는 직선 화살표 (휘지 않음)
 * ============================================================ */
export const S2Inflow: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const inflowA = Math.max(0, Math.min(1, (f - 6) / (frames * 0.75)));
  const labelA = Math.max(0, Math.min(1, (f - 14) / 24));

  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      <TyphoonSpiralDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        inflowProgress={inflowA} hemisphere="north"
      />
      <Label
        x={CX} y={DIAG_Y - 60} text={STR.inflowLabel} size={56} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 지구 자전 표시 + 직선 안내선 vs 실제로 휘어지는 곡선의 대비
 * ============================================================ */
const SPIN_ICON_CX = 150;
const SPIN_ICON_CY = 300;
const SPIN_ICON_R = 60;

export const S3Coriolis: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const coriolisA = Math.max(0, Math.min(1, (f - 10) / (frames * 0.7)));
  const labelA = Math.max(0, Math.min(1, (f - 16) / 24));
  const spinDeg = f * 4; // 장식용 연속 회전 - 결정적(원칙 3), 계절 계산과 무관

  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      {/* 지구 자전 표시: 회전하는 화살표 링 - 태풍이 도는 이유가 지구 자전이라는 것을
          시각적으로 짚어준다 */}
      <svg width={W} height={200 + SPIN_ICON_CY} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={SPIN_ICON_CX} cy={SPIN_ICON_CY} r={SPIN_ICON_R} fill="none" stroke={C.inkSoft} strokeWidth={7} opacity={0.4} />
        <g style={{ transformOrigin: `${SPIN_ICON_CX}px ${SPIN_ICON_CY}px`, transform: `rotate(${spinDeg}deg)` }}>
          <path
            d={`M ${SPIN_ICON_CX + SPIN_ICON_R} ${SPIN_ICON_CY} A ${SPIN_ICON_R} ${SPIN_ICON_R} 0 0 1 ${SPIN_ICON_CX} ${SPIN_ICON_CY - SPIN_ICON_R}`}
            fill="none" stroke={C.coral} strokeWidth={10} strokeLinecap="round"
          />
          <path
            d={`M ${SPIN_ICON_CX - 14} ${SPIN_ICON_CY - SPIN_ICON_R + 10} L ${SPIN_ICON_CX} ${SPIN_ICON_CY - SPIN_ICON_R - 14} L ${SPIN_ICON_CX + 16} ${SPIN_ICON_CY - SPIN_ICON_R + 6} Z`}
            fill={C.coral}
          />
        </g>
      </svg>
      <Label x={SPIN_ICON_CX} y={SPIN_ICON_CY + SPIN_ICON_R + 20} text={STR.earthSpinLabel} size={38} color={C.inkSoft} />

      <TyphoonSpiralDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        coriolisProgress={coriolisA} hemisphere="north"
      />
      <Label
        x={CX} y={DIAG_Y - 60} text={STR.coriolisLabel} size={56} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 휘어짐이 쌓여 완성된 소용돌이 모양이 되는 애니메이션
 * ============================================================ */
export const S4Spiral: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const spiralA = Math.max(0, Math.min(1, (f - 8) / (frames * 0.75)));
  const labelA = Math.max(0, Math.min(1, (f - 14) / 24));

  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      <TyphoonSpiralDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y}
        spiralProgress={spiralA} hemisphere="north"
      />
      <Label
        x={CX} y={DIAG_Y - 60} text={STR.spiralLabel} size={56} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 지구본 하나 위 북반구·남반구 회전 방향 비교
 * ============================================================ */
const HEMI_DIAG_WIDTH = 820;
const HEMI_DIAG_X = CX - HEMI_DIAG_WIDTH / 2;
const HEMI_DIAG_Y = 420;
// TyphoonSpiralDiagram의 viewBox는 900x900 정사각형이므로 화면 좌표 = (x + width*frac, y + width*frac)
const HEMI_SCALE = HEMI_DIAG_WIDTH / 900;
const HEMI_EQUATOR_Y = HEMI_DIAG_Y + 450 * HEMI_SCALE;
const HEMI_TOP_Y = HEMI_DIAG_Y + 90 * HEMI_SCALE; // 지구본 위 가장자리
const HEMI_BOTTOM_Y = HEMI_DIAG_Y + 810 * HEMI_SCALE; // 지구본 아래 가장자리

export const S5Hemisphere: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const hemiA = Math.max(0, Math.min(1, (f - 8) / (frames * 0.75)));
  const labelA = Math.max(0, Math.min(1, (f - 16) / 26));

  return (
    <PlainBg top={C.sky} bottom={C.seaTop} ground={null}>
      <TyphoonSpiralDiagram
        width={HEMI_DIAG_WIDTH} x={HEMI_DIAG_X} y={HEMI_DIAG_Y}
        hemisphereProgress={hemiA}
      />
      <Label
        x={CX} y={HEMI_TOP_Y - 70} text={STR.hemisphereNorthLabel} size={50} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Label
        x={CX} y={HEMI_BOTTOM_Y + 26} text={STR.hemisphereSouthLabel} size={50} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Label
        x={CX} y={HEMI_EQUATOR_Y - 26} text={STR.equatorLabel} size={34} color={C.inkSoft} align="center"
        style={{ opacity: labelA * 0.8 }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 욕조 속설 - "사실 아님" 명시 반박. 왼쪽엔 "회전 방향 때문?"이라는 틀린 생각에
 * X 표시, 오른쪽엔 mythProgress 배수구 아이콘("진짜 원인")을 나란히 대비시킨다 -
 * X는 배수구가 아니라 회전-방향 가설 쪽에 찍는다(의미가 뒤바뀌지 않도록).
 * ============================================================ */
const S6_WATER_Y = 1280;
const S6_ICON_Y = 920;
const S6_LEFT_X = CX - 220;
const S6_RIGHT_X = CX + 220;
const S6_ICON_R = 60;
const S6_DRAIN_DIAG_WIDTH = 415; // DrainIcon 내부 r=130(VB 900)이 화면상 S6_ICON_R와 비슷해지도록 역산
const S6_DRAIN_X = S6_RIGHT_X - S6_DRAIN_DIAG_WIDTH / 2;
const S6_DRAIN_Y = S6_ICON_Y - S6_DRAIN_DIAG_WIDTH / 2;

export const S6Myth: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const iconA = Math.max(0, Math.min(1, (f - 6) / 26));
  const xAt = Math.round(frames * 0.42);
  const xA = Math.max(0, Math.min(1, (f - xAt) / 14));
  const labelA = Math.max(0, Math.min(1, (f - 6) / 22));

  return (
    <PlainBg top={C.sky} bottom={C.room} ground={null}>
      <Bathtub f={f} waterY={S6_WATER_Y} steamT={0} />

      <Label
        x={CX} y={S6_ICON_Y - S6_ICON_R - 130} text={STR.mythLabel} size={54} color={C.coral}
        style={{ opacity: labelA }}
      />

      {/* 왼쪽: "회전 방향 때문?"이라는 틀린 생각 - 중립적인 작은 회전 아이콘 위에 X */}
      <svg width={S6_ICON_R * 2 + 20} height={S6_ICON_R * 2 + 20} style={{
        position: 'absolute', left: S6_LEFT_X - S6_ICON_R - 10, top: S6_ICON_Y - S6_ICON_R - 10,
        opacity: iconA,
      }}
      >
        <circle cx={S6_ICON_R + 10} cy={S6_ICON_R + 10} r={S6_ICON_R} fill={C.paper} stroke={C.inkSoft} strokeWidth={9} />
        <path
          d={`M ${S6_ICON_R + 10 + 46} ${S6_ICON_R + 10} A 46 46 0 0 1 ${S6_ICON_R + 10} ${S6_ICON_R + 10 - 46}`}
          fill="none" stroke={C.inkSoft} strokeWidth={12} strokeLinecap="round"
        />
        <path
          d={`M ${S6_ICON_R + 10 - 40} ${S6_ICON_R + 10} A 46 46 0 0 1 ${S6_ICON_R + 10} ${S6_ICON_R + 10 + 46}`}
          fill="none" stroke={C.inkSoft} strokeWidth={12} strokeLinecap="round"
        />
      </svg>
      {xA > 0.01 ? (
        <QMark
          size={S6_ICON_R * 2} glyph="X" color={C.coral} outline={C.paper}
          style={{
            left: S6_LEFT_X, top: S6_ICON_Y,
            transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * xA})`, opacity: xA,
          }}
        />
      ) : null}
      <Label
        x={S6_LEFT_X} y={S6_ICON_Y + S6_ICON_R + 30} text={STR.mythRotationSubLabel} size={34}
        color={C.inkSoft} style={{ opacity: iconA }}
      />

      {/* 오른쪽: 배수구 모양(비대칭) - 진짜 원인, X 표시 없음 */}
      <TyphoonSpiralDiagram
        width={S6_DRAIN_DIAG_WIDTH} x={S6_DRAIN_X} y={S6_DRAIN_Y}
        mythProgress={iconA}
      />
      <Label
        x={S6_RIGHT_X} y={S6_ICON_Y + S6_ICON_R + 30} text={STR.mythDrainSubLabel} size={34}
        color={C.ink} style={{ opacity: iconA }}
      />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 요약 - 지구 자전 축 + 완성된 태풍 소용돌이
 * ============================================================ */
const S7_GLOBE_CX = CX;
const S7_GLOBE_CY = 760;
const S7_GLOBE_R = 300;
const S7_DIAG_WIDTH = 720;
const S7_DIAG_X = CX - S7_DIAG_WIDTH / 2;
const S7_DIAG_Y = S7_GLOBE_CY - S7_DIAG_WIDTH / 2;

export const S7Summary: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const axisA = Math.max(0, Math.min(1, f / 26));
  const spiralA = Math.max(0, Math.min(1, (f - 10) / 60));

  return (
    <PlainBg top={C.night} bottom={C.nightMid} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* 자전축: 살짝 기울어진 선 하나 (사실적으로 그리지 않는다) */}
        <line
          x1={S7_GLOBE_CX - 40} y1={S7_GLOBE_CY - S7_GLOBE_R - 90}
          x2={S7_GLOBE_CX + 40} y2={S7_GLOBE_CY + S7_GLOBE_R + 90}
          stroke={C.cream} strokeWidth={8} strokeDasharray="4 14" strokeLinecap="round" opacity={axisA * 0.85}
        />
      </svg>
      <TyphoonSpiralDiagram
        width={S7_DIAG_WIDTH} x={S7_DIAG_X} y={S7_DIAG_Y}
        spiralProgress={spiralA} hemisphere="north"
        armColor={C.cream} stroke={C.cream} mutedStroke={C.nightSoft} oceanColor={C.nightSoft}
      />
      <Caption line={line} t={f / FPS} dark />
    </PlainBg>
  );
};
