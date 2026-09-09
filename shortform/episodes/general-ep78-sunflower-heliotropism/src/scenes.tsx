/** 이 화(general-ep78, "해바라기가 해를 따라 도는 이유") 전용 장면. 문구는 전부
 *  strings.ts 에서 읽는다(언어 무관 컴포넌트).
 *
 *  s1(통념 훅샷 - 해가 하늘을 이동하는 동안 해바라기가 고개를 돌리는 낮 구간만 보여준다,
 *  밤은 아직 등장 안 함) -> s2(어린 vs 다 자란 해바라기 실루엣 비교, SunflowerIcon 2개
 *  정적 배치) -> s3(SunflowerTrackingDiagram trackingProgress 0->1, 낮에는 서쪽으로
 *  기울고 밤사이 다시 동쪽으로 돌아가는 하루 전체 타임랩스 - 이 화의 핵심 장면) ->
 *  s4(matureProgress 0->1 클로즈업 - 줄기가 굵어지며 동쪽 각도로 고정되고 정지 배지가
 *  뜬다) -> s5(들판 항공샷 - 작은 SunflowerIcon 여러 개가 전부 동쪽을 보고 고정된 모습)
 *  -> s6(pollinatorProgress 0->1 - 동쪽 꽃에 아침 햇살과 온기 후광, 벌이 그쪽으로 날아감)
 *  -> s7(마무리 컷 - 배경에 고정된 다 자란 개체들, 전경에 아직 흔들리는 어린 개체 하나를
 *  함께 보여주는 몽타주).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 어린 해바라기가 낮 동안 해를 따라 휘었다 밤에 돌아오는 움직임과, 다 자란 해바라기가
 *     고정된 것의 대비가 중심이다 - s3(움직임)과 s4~s5(고정)가 이 대비를 전담한다.
 *   - 시간 경과(낮->밤)에 따른 방향 변화는 SunflowerTrackingDiagram의 줄기 기울기와
 *     해/달의 위치로 표현한다(굵은 화살표 대신 줄기 자체의 기울기).
 *   - 여러 시점(아침/정오/저녁/밤)에서 줄기가 해가 있는 쪽으로 기우는지 확인 필요 -
 *     SunflowerTrackingDiagram 내부에서 stemAngle = MAX_LEAN*cos(theta)로 해의 수평
 *     위치(cos 성분)에 직접 연동시켜, 아침(해 오른쪽/동)엔 오른쪽으로, 저녁(해 왼쪽/서)엔
 *     왼쪽으로 기울도록 구조적으로 보장했다(스틸 선점검에서 프레임별 실측 확인).
 *   - 해바라기·줄기는 단순 도형(직선/완만한 곡선 줄기, 꽃잎 8장)으로만 그린다 - 촘촘한
 *     꽃잎이나 점 텍스처를 쓰지 않는다.
 *
 *  s4의 "matureProgress" 클로즈업은 trackingProgress 없이 단독으로 넘긴다(컴포넌트
 *  주석의 "단독으로 넘기면 수직 기준에서 고정 각도로 보간" 규칙) - s3에서 이미 보여준
 *  하루 주기 대신, "줄기가 굵어지며 멈춘다"는 이번 장면의 핵심에 집중한다.
 *
 *  s4(정지 배지가 뚜렷해지는 순간)엔 ui_tap.mp3(원칙 7, REGISTRY "화면 UI 탭·버튼 누름
 *  동작 전반" 재사용 - 여기서는 "줄기가 멈춰 고정된다"는 무성 액션에), s6(벌이 동쪽 꽃에
 *  도달하는 순간)엔 realize_ding.mp3(REGISTRY "발견·자각 리액션 전반" 재사용 - "왜 이
 *  꽃에 벌이 더 많이 오는지" 발견하는 순간)를 Episode.tsx에서 재생한다. 이 화는 별도
 *  캐릭터가 등장하지 않는 3인칭 설명 내레이션이라 mouth.json 립싱크는 쓰지 않는다
 *  (ep63·ep66 s2~s7·ep72·ep74·ep76과 동일 원칙).
 */
import React from 'react';
import {
  Appear, C, Caption, FPS, Label, PlainBg, SunflowerIcon, SunflowerTrackingDiagram,
  SUNFLOWER_VB_H, SUNFLOWER_VB_W, W,
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

/* 공통 다이어그램 박스(s1/s3/s4/s6). ep76 WetFabricLightDiagram과 동일 사이징 원칙(폭을
 * viewBox 비율로 스케일). SUNFLOWER_VB_W/H = 900/900(정사각) */
const DIAG_W = 800;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 474;
const DIAG_H = DIAG_W * (SUNFLOWER_VB_H / SUNFLOWER_VB_W);
const LABEL_Y = DIAG_Y - 70;

const FIELD_GROUND_Y = 1180;

/** s4: 정지 배지가 뚜렷해지는 프레임(lockBadge가 절반 이상 드러나는 지점) -
 *  Episode.tsx가 ui_tap.mp3(원칙 7)를 이 프레임에 맞춰 재생한다. */
export function s4LockFrame(frames: number): number {
  return Math.round(frames * 0.78);
}

/** s6: 벌이 동쪽 꽃에 도달하는 프레임(SunflowerTrackingDiagram 내부 beeT가 1이 되는
 *  pollinatorProgress=0.85 지점) - Episode.tsx가 realize_ding.mp3(원칙 7)를 이 프레임에
 *  맞춰 재생한다. */
export function s6ArriveFrame(frames: number): number {
  return Math.round(frames * 0.85);
}

/* ============================================================
 * S1: 통념 훅샷 - 해가 하늘을 지나는 동안 고개를 돌리는 해바라기(낮 구간만)
 * ============================================================ */
export const S1Hook: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  // 낮 구간(DAY_END=0.72) 중 앞쪽 절반 정도만 보여준다 - "하루 종일 도는 것처럼
  // 보인다"는 통념의 도입부라 밤까지 갈 필요가 없다.
  const trackingProgress = clamp01(f / frames) * 0.5;

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunflowerTrackingDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} trackingProgress={trackingProgress} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 어린 vs 다 자란 해바라기 실루엣 비교
 * ============================================================ */
const S2_GROUND_Y = 1180;
const S2_LEFT_CX = 330;
const S2_RIGHT_CX = 750;

export const S2Dry: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const youngA = clamp01((f - 4) / 24);
  const matureA = clamp01((f - 20) / 24);
  const labelA = clamp01((f - 30) / 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={80} y1={S2_GROUND_Y} x2={W - 80} y2={S2_GROUND_Y} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
      </svg>
      <Appear progress={youngA} from="scale" origin={`${S2_LEFT_CX}px ${S2_GROUND_Y}px`}>
        <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <SunflowerIcon cx={S2_LEFT_CX} cy={S2_GROUND_Y} angleDeg={-16} headR={58} stemLen={250} stemWidth={12} />
        </svg>
      </Appear>
      <Appear progress={matureA} from="scale" origin={`${S2_RIGHT_CX}px ${S2_GROUND_Y}px`}>
        <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <SunflowerIcon cx={S2_RIGHT_CX} cy={S2_GROUND_Y} angleDeg={32} headR={110} stemLen={300} stemWidth={30} />
        </svg>
      </Appear>
      <Label x={S2_LEFT_CX} y={S2_GROUND_Y - 420} text={STR.youngLabel} size={42} color={C.ink} style={{ opacity: labelA }} />
      <Label x={S2_RIGHT_CX} y={S2_GROUND_Y - 470} text={STR.matureLabel} size={42} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 하루 전체 타임랩스 - 낮에는 서쪽으로, 밤에는 다시 동쪽으로
 * ============================================================ */
export const S3Wetting: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const trackingProgress = clamp01(f / frames);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunflowerTrackingDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} trackingProgress={trackingProgress} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 클로즈업 - 줄기가 굵어지며 동쪽 각도로 고정, 정지 배지
 * ============================================================ */
export const S4Absorb: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 6) / 24);
  const matureProgress = clamp01(f / frames);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunflowerTrackingDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} matureProgress={matureProgress} />
      <Label x={CX} y={LABEL_Y} text={STR.stoppedLabel} size={48} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 들판 항공샷 - 전부 동쪽을 보고 고정
 * ============================================================ */
const S5_ROW_XS = [140, 330, 520, 710, 890];

export const S5Compare: React.FC<SceneProps> = ({ f, lines }) => {
  const line = activeLine(lines, f / FPS);
  const titleA = clamp01((f - 4) / 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={40} y1={FIELD_GROUND_Y} x2={W - 40} y2={FIELD_GROUND_Y} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
        {S5_ROW_XS.map((x, i) => {
          const a = smooth(clamp01((f - i * 6 - 4) / 20));
          return (
            <g key={i} style={{ opacity: a }} transform={`translate(0 ${(1 - a) * 30})`}>
              <SunflowerIcon
                cx={x} cy={FIELD_GROUND_Y - (i % 2 === 0 ? 0 : 18)} angleDeg={32}
                headR={46} stemLen={170} stemWidth={16}
              />
            </g>
          );
        })}
      </svg>
      <Label x={CX} y={FIELD_GROUND_Y - 620} text={STR.fixedEastLabel} size={46} color={C.inkSoft} style={{ opacity: titleA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 동쪽 꽃에 아침 햇살 + 온기 후광, 벌이 그쪽으로 날아감
 * ============================================================ */
export const S6Montage: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 6) / 24);
  const pollinatorProgress = clamp01(f / frames);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <SunflowerTrackingDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} pollinatorProgress={pollinatorProgress} />
      <Label x={CX} y={LABEL_Y} text={STR.warmerLabel} size={44} color={C.ink} style={{ opacity: labelA }} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 마무리 - 고정된 다 자란 개체들 배경 + 전경의 흔들리는 어린 개체
 * ============================================================ */
const S7_BACK_XS = [140, 340, 740, 940];
export const S7Dry: React.FC<SceneProps> = ({ f, lines }) => {
  const line = activeLine(lines, f / FPS);
  const sceneA = clamp01((f - 4) / 26);
  const wobble = 14 * Math.sin(f / 40);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: sceneA }}>
        <line x1={40} y1={S2_GROUND_Y} x2={W - 40} y2={S2_GROUND_Y} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
        {S7_BACK_XS.map((x, i) => (
          <SunflowerIcon
            key={i} cx={x} cy={S2_GROUND_Y - (i % 2 === 0 ? 0 : 20)} angleDeg={32}
            headR={46} stemLen={160} stemWidth={14} opacity={0.72}
          />
        ))}
        <SunflowerIcon cx={CX} cy={S2_GROUND_Y + 40} angleDeg={wobble} headR={78} stemLen={280} stemWidth={16} />
      </svg>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
