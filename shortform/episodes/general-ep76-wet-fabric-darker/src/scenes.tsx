/** 이 화(general-ep76, "옷이 물에 젖으면 색이 진해지는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(마른 회색 티셔츠에 물방울이 떨어져 그 자리만 색이 진해지는 클로즈업 훅샷, 무성 -
 *  3인칭 훅이라 립싱크 없음) -> s2(WetFabricLightDiagram scatterProgress - 마른 섬유
 *  표면에서 빛이 사방으로 흩어짐) -> s3(같은 다이어그램 wetProgress + absorbProgress
 *  일부 - 물이 틈을 채우며 빛이 안으로 꺾여 들어감) -> s4(wetProgress=1 유지 +
 *  absorbProgress 0->1 - 안에서 여러 번 튕기다 흡수됨) -> s5(CompareBars로 마른 상태 vs
 *  젖은 상태의 반사광 양 비교) -> s6(비 온 도로 vs 젖은 나무 - 같은 원리의 확장 사례
 *  몽타주) -> s7(WetShirt 역방향 - 마르면서 원래 색으로 돌아오는 타임랩스).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 마른 섬유(빛이 사방으로 튕겨나감)와 젖은 섬유(빛이 안으로 들어가 흡수됨)의 대비가
 *     이 화의 중심이다 - s2/s3/s4가 WetFabricLightDiagram 하나로 이 대비를 전담한다.
 *   - 섬유 표면은 사실적으로 그리지 않는다. WetFabricLightDiagram은 확대 단면을 물결치는
 *     굵은 곡선 3가닥(fiber bundle)만으로 표현한다.
 *   - 물이 스며드는 것은 큰 물방울(s1/s6의 Droplet)이나 물결선(WetFabricLightDiagram의
 *     틈 안 잔물결)으로 표현한다 - 점 텍스처를 쓰지 않는다.
 *   - 옷 색이 진해지는 것은 색 자체(명도 변화, WetShirt의 spotColor 오버레이)로 보여준다.
 *
 *  s4의 "wetProgress={1}"은 s3에서 이미 채워진 상태를 이 장면에서도 명시적으로 유지시키는
 *  것이다(23화 이후 반복 원칙 - 여러 progress를 가진 다이어그램은 새 장면에서 이전 상태를
 *  다시 명시해야 한다. 장면마다 별도 컴포넌트 인스턴스라 자동으로 이어지지 않는다).
 *
 *  s1의 티셔츠(WetShirt)는 이 화 전용의 단순한 도형(참고 이미지 없음, 원칙 0-1 벡터화
 *  대상 아님)이라 라이브러리로 승격하지 않고 이 파일에 로컬로 둔다. s5의 CompareBars는
 *  "반사되어 눈으로 돌아오는 빛의 상대적 양"이라는 정성적 비교라 실제 수치가 없으므로
 *  valueText(숫자 라벨)를 넣지 않는다 - 있지도 않은 통계를 지어내지 않는다.
 *
 *  어느 장면도 캐릭터가 등장하지 않는 3인칭 설명 내레이션이라(대본 자산 목록에도 캐릭터
 *  재사용이 없다) mouth.json 립싱크를 쓰지 않는다(ep63·ep66 s2~s7·ep72·ep74와 동일 원칙 -
 *  ko_mouth.json은 파이프라인 표준 절차로 만들었지만 이 화 어디서도 import하지 않는다).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  C, Caption, CompareBars, FPS, Label, PlainBg, W, WETFABRIC_VB_H, WETFABRIC_VB_W,
  WetFabricLightDiagram,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2; // 540
const STR = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* 공통 다이어그램 박스(s2~s4). HeatBlanketDiagram(ep74)과 동일 사이징 원칙(폭을
 * viewBox 비율로 스케일). WETFABRIC_VB_H/WETFABRIC_VB_W = 680/900 */
const DIAG_W = 900;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 470;
const DIAG_H = DIAG_W * (WETFABRIC_VB_H / WETFABRIC_VB_W);
const LABEL_Y = DIAG_Y - 70;

/* ============================================================
 * 로컬 소품: 물방울(Droplet) - s1/s6 공용, 순수 도형이라 라이브러리 승격 안 함
 * ============================================================ */
const DROPLET_D = 'M 0 -20 C -13 -4 -16 8 -11 16 C -6 24 6 24 11 16 C 16 8 13 -4 0 -20 Z';

const Droplet: React.FC<{ cx: number; cy: number; scale?: number; opacity?: number; color?: string }> = ({
  cx, cy, scale = 1, opacity = 1, color = C.waterCool,
}) => (
  opacity <= 0.01 ? null : (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={opacity}>
      <path d={DROPLET_D} fill={color} stroke={C.ink} strokeWidth={3} />
      <circle cx={-4} cy={6} r={3} fill="#FFFFFF" opacity={0.55} />
    </g>
  )
);

/* ============================================================
 * 로컬 소품: 티셔츠(WetShirt) - s1/s7 공용, 참고 이미지 없는 단순 도형
 * ============================================================ */
type ShirtCmd = ['M' | 'L', number, number] | ['Q', number, number, number, number] | ['Z'];
const TSHIRT_CMDS: ShirtCmd[] = [
  ['M', 170, 60], ['L', 90, 60], ['L', 30, 140], ['L', 95, 178], ['L', 112, 168],
  ['L', 112, 400], ['L', 348, 400], ['L', 348, 168], ['L', 365, 178], ['L', 430, 140],
  ['L', 370, 60], ['L', 290, 60], ['Q', 230, 110, 170, 60], ['Z'],
];
function tshirtPathD(scale: number, ox: number, oy: number): string {
  return TSHIRT_CMDS.map((c) => {
    if (c[0] === 'Z') return 'Z';
    if (c[0] === 'Q') {
      const [, cx1, cy1, ex, ey] = c;
      return `Q ${(cx1 * scale + ox).toFixed(1)} ${(cy1 * scale + oy).toFixed(1)} `
        + `${(ex * scale + ox).toFixed(1)} ${(ey * scale + oy).toFixed(1)}`;
    }
    const [cmd, px, py] = c;
    return `${cmd} ${(px * scale + ox).toFixed(1)} ${(py * scale + oy).toFixed(1)}`;
  }).join(' ');
}

const SHIRT_SCALE = 1.6;
const SHIRT_OX = CX - 230 * SHIRT_SCALE;
const SHIRT_OY = 520;
const SHIRT_SPOT_LOCAL = { x: 230, y: 230 };
const SHIRT_SPOT_X = SHIRT_SPOT_LOCAL.x * SHIRT_SCALE + SHIRT_OX;
const SHIRT_SPOT_Y = SHIRT_SPOT_LOCAL.y * SHIRT_SCALE + SHIRT_OY;
const SHIRT_GRAY = '#D7DBE2';
const SHIRT_WET = '#3B4252';

interface WetShirtProps {
  spotProgress: number;
  dropletProgress?: number;
  maxRadius?: number;
  clipId: string;
}
const WetShirt: React.FC<WetShirtProps> = ({ spotProgress, dropletProgress, maxRadius = 120, clipId }) => {
  const d = tshirtPathD(SHIRT_SCALE, SHIRT_OX, SHIRT_OY);
  const spotT = smooth(spotProgress);
  const coreR = maxRadius * spotT;
  const dropOpacity = dropletProgress === undefined ? 0 : clamp01((0.95 - dropletProgress) / 0.15);
  const dropY = dropletProgress === undefined ? 0 : 560 + (SHIRT_SPOT_Y - 560) * clamp01(dropletProgress);

  return (
    <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <clipPath id={clipId}><path d={d} /></clipPath>
      </defs>
      <path d={d} fill={SHIRT_GRAY} stroke={C.ink} strokeWidth={13} strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        {spotT > 0.01 ? (
          <>
            <circle cx={SHIRT_SPOT_X} cy={SHIRT_SPOT_Y} r={coreR * 1.35} fill={SHIRT_WET} opacity={0.28 * spotT} />
            <circle cx={SHIRT_SPOT_X} cy={SHIRT_SPOT_Y} r={coreR} fill={SHIRT_WET} opacity={0.85 * spotT} />
          </>
        ) : null}
      </g>
      {dropletProgress !== undefined ? (
        <Droplet cx={SHIRT_SPOT_X} cy={dropY} scale={1.8} opacity={dropOpacity} />
      ) : null}
    </svg>
  );
};

/** s1: 물방울이 셔츠에 닿는 프레임(dropletProgress가 1에 도달하는 지점). Episode.tsx가
 *  water_splash.mp3(원칙 7)를 이 프레임에 맞춰 재생한다 - s1은 언어 무관 정지 비주얼이라
 *  frames(그 언어의 s1 실측 길이)만 넘기면 언어별로 정확히 재계산된다. */
export function s1SplashFrame(frames: number): number {
  return Math.round(frames * 0.42);
}

/* ============================================================
 * S1: 마른 티셔츠에 물방울이 떨어져 그 자리만 색이 진해지는 클로즈업
 * ============================================================ */
export const S1Hook: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const dropletProgress = clamp01(f / (frames * 0.42));
  const spotProgress = clamp01((f - frames * 0.38) / (frames * 0.42));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WetShirt spotProgress={spotProgress} dropletProgress={dropletProgress} maxRadius={110} clipId="s1shirtclip" />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 마른 섬유 - 빛이 표면에서 바로 사방으로 흩어짐
 * ============================================================ */
export const S2Dry: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 6) / 24);
  const scatterA = clamp01((f - 14) / (frames * 0.72));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WetFabricLightDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} scatterProgress={scatterA} />
      <Label x={CX} y={LABEL_Y} text={STR.dryFiberLabel} size={50} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 물이 틈을 채우며 빛이 겉에서 못 튕겨나가고 안으로 꺾여 들어감
 * ============================================================ */
export const S3Wetting: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const wetA = clamp01((f - 10) / (frames * 0.68));
  const absorbA = clamp01((f - frames * 0.42) / (frames * 0.5)) * 0.4;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WetFabricLightDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} wetProgress={wetA} absorbProgress={absorbA} />
      <Label x={CX} y={LABEL_Y} text={STR.wetFiberLabel} size={50} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 안에서 이리저리 튕기다가 색소에 흡수되는 양이 늘어남
 * ============================================================ */
export const S4Absorb: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const absorbA = clamp01((f - 10) / (frames * 0.8));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WetFabricLightDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} wetProgress={1} absorbProgress={absorbA} />
      <Label x={CX} y={LABEL_Y} text={STR.absorbLabel} size={50} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 눈으로 돌아오는 빛의 양 - 마른 상태 vs 젖은 상태 막대 비교
 * ============================================================ */
/* 최대 막대(value=92, pxPerUnit=7 => 644px)가 화면(W=1080) 안에 안전하게 들어오도록
 * 중앙 정렬 x를 계산한다(220 = (1080-644)/2 반올림). 기존 CX-90=450은 644px 막대의
 * 우측 끝이 1094px로 화면 밖으로 14px 삐져나가는 결함이 있었다(스틸 선점검에서 발견). */
const S5_BARS_X = 220;
const S5_BARS_Y = 720;

export const S5Compare: React.FC<SceneProps> = ({ f, lines }) => {
  const line = activeLine(lines, f / FPS);
  const titleA = clamp01((f - 6) / 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={S5_BARS_Y - 90} text={STR.reflectedLightLabel} size={46} color={C.inkSoft} style={{ opacity: titleA }} />
      <CompareBars
        x={S5_BARS_X} y={S5_BARS_Y} pxPerUnit={7} frame={f} rowGap={180}
        items={[
          { label: STR.dryStateLabel, value: 92, color: C.gold, thickness: 56, at: 20 },
          { label: STR.wetStateLabel, value: 40, color: SHIRT_WET, thickness: 56, at: 44 },
        ]}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 비 온 도로 vs 젖은 나무 - 같은 원리의 확장 사례
 * ============================================================ */
const S6_PANEL_W = 420;
const S6_PANEL_H = 460;
const S6_GAP = 40;
const S6_LEFT_X = CX - S6_PANEL_W - S6_GAP / 2;
const S6_RIGHT_X = CX + S6_GAP / 2;
const S6_PANEL_Y = 420;
const S6_LABEL_Y = S6_PANEL_Y + S6_PANEL_H + 60;

const ASPHALT = '#9AA3AF';
const ASPHALT_WET = '#3B4252';
const BARK = '#9C7A54';
const BARK_WET = '#4A3521';

export const S6Montage: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const panelA = clamp01((f - 6) / 24);
  const wetT = smooth(clamp01((f - 20) / (frames * 0.7)));
  const dropOpacity = clamp01(1 - (f - 6) / 30);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: panelA }}>
        {/* 도로 패널 */}
        <rect x={S6_LEFT_X} y={S6_PANEL_Y} width={S6_PANEL_W} height={S6_PANEL_H} rx={24} fill={ASPHALT} stroke={C.ink} strokeWidth={13} />
        <rect x={S6_LEFT_X} y={S6_PANEL_Y} width={S6_PANEL_W} height={S6_PANEL_H} rx={24} fill={ASPHALT_WET} opacity={0.6 * wetT} />
        {[0.22, 0.5, 0.78].map((t, i) => (
          <rect key={i} x={S6_LEFT_X + S6_PANEL_W * t - 8} y={S6_PANEL_Y + 60} width={16} height={70} fill={C.paper} opacity={0.85} />
        ))}

        {/* 나무 패널 */}
        <rect x={S6_RIGHT_X} y={S6_PANEL_Y} width={S6_PANEL_W} height={S6_PANEL_H} rx={24} fill={BARK} stroke={C.ink} strokeWidth={13} />
        <rect x={S6_RIGHT_X} y={S6_PANEL_Y} width={S6_PANEL_W} height={S6_PANEL_H} rx={24} fill={BARK_WET} opacity={0.62 * wetT} />
        <line x1={S6_RIGHT_X + S6_PANEL_W * 0.32} y1={S6_PANEL_Y + 40} x2={S6_RIGHT_X + S6_PANEL_W * 0.32} y2={S6_PANEL_Y + S6_PANEL_H - 40} stroke={C.ink} strokeWidth={7} opacity={0.3} />
        <line x1={S6_RIGHT_X + S6_PANEL_W * 0.62} y1={S6_PANEL_Y + 30} x2={S6_RIGHT_X + S6_PANEL_W * 0.62} y2={S6_PANEL_Y + S6_PANEL_H - 30} stroke={C.ink} strokeWidth={7} opacity={0.3} />
      </svg>
      <Droplet cx={S6_LEFT_X + S6_PANEL_W * 0.5} cy={S6_PANEL_Y - 40} scale={1.4} opacity={dropOpacity} />
      <Droplet cx={S6_RIGHT_X + S6_PANEL_W * 0.5} cy={S6_PANEL_Y - 40} scale={1.4} opacity={dropOpacity} />
      <Label x={S6_LEFT_X + S6_PANEL_W / 2} y={S6_LABEL_Y} text={STR.roadLabel} size={40} color={C.ink} style={{ opacity: panelA }} />
      <Label x={S6_RIGHT_X + S6_PANEL_W / 2} y={S6_LABEL_Y} text={STR.treeLabel} size={40} color={C.ink} style={{ opacity: panelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 마르면서 원래 색으로 돌아오는 타임랩스
 * ============================================================ */
export const S7Dry: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const spotProgress = 1 - clamp01((f - frames * 0.15) / (frames * 0.65));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <WetShirt spotProgress={spotProgress} maxRadius={190} clipId="s7shirtclip" />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
