/** 이 화(general-ep72, "안 터진 풍선이 쪼그라드는 이유") 전용 장면. 문구는 전부 strings.ts 에서
 *  읽는다(언어 무관 컴포넌트).
 *
 *  s1(며칠 전 vs 지금 풍선 대비 + 구멍 없음 배지, 무성 훅샷) -> s2(BalloonPermeationDiagram
 *  gapVisible - 고무 그물망과 그 사이 미세한 틈) -> s3(leakProgress - 기체 알갱이가 틈으로
 *  하나씩 빠져나감) -> s4(풍선 3개가 순서대로 작아지는 타임랩스) -> s5(moleculeCompareProgress
 *  헬륨/공기 알갱이 크기 비교 + 풍선 2개 + CompareBars 속도 비교) -> s6(coatingProgress - 헬륨
 *  풍선 안쪽 특수 코팅) -> s7(고무 vs 은박 풍선 + materialCompareProgress 틈 촘촘함 비교).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시):
 *   - 고무 표면의 미세한 틈으로 기체 분자가 빠져나가는 모습이 중심이다 - 확대한 단면(고무
 *     띠)으로 보여주고 분자는 큰 원 2~3개로만 표현한다(BalloonPermeationDiagram 내부
 *     STRAND_YS/GAP_PTS/LEAK_PATHS가 각각 3/2/3개로 고정 - 작은 점을 잔뜩 뿌리지 않는다).
 *   - 헬륨/공기 분자 크기 비교는 원 2개를 나란히 놓고 크기 대비만 준다(s5 moleculeCompareProgress).
 *   - 풍선이 쪼그라드는 과정은 풍선 전체 크기 변화(Balloon.fullness)로 보여준다(s1, s4, s5).
 *   - 시간에 따라 작아지는 변화(s1, s4)와 헬륨/공기 속도 차이(s5)를 다루므로, 시작-끝 프레임을
 *     나란히 대조해 방향이 맞는지, 헬륨 쪽이 실제로 더 빨리 작아지는지 스틸 선점검에서 직접
 *     확인했다(99-build-report.md 참고) - s1은 왼쪽(며칠 전, fullness=1) -> 오른쪽(지금,
 *     fullness가 시간에 따라 1에서 0.55로 줄어듦)으로 방향이 고정되어 있고, s5는 같은 경과
 *     시간을 전제로 공기 풍선(fullness=0.85, 조금만 줄어듦)보다 헬륨 풍선(fullness=0.5, 더 많이
 *     줄어듦)이 더 작게 그려지도록 값 자체를 다르게 줬다(애니메이션 방향이 아니라 도달 상태
 *     값으로 "더 빨리/많이 줄었다"를 표현).
 *
 *  어느 장면도 캐릭터가 직접 말하는 순간이 아니라(전부 3인칭 설명 내레이션, 대본 자산 목록에도
 *  캐릭터 재사용이 없다) mouth.json 립싱크를 쓰지 않는다(ep19/ep21/ep23/ep25/ep60/ep62/ep70과
 *  동일 원칙 - ko_mouth.json은 파이프라인 표준 절차로 만들었지만 이 화 어디서도 import하지 않는다).
 */
import React from 'react';
import {
  Balloon, BalloonPermeationDiagram, BALLOON_PERM_VB, C, Caption, CompareBars, FPS, Label, PlainBg, W,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const STR = STRINGS.ko;

/** 은박(mylar) 풍선 전용 색 - 테마 토큰에 금속성 색이 없어 이 화 로컬로만 둔다(등록하지 않음,
 *  이 화 1회성 사용) */
const MYLAR_COLOR = '#CBD5DF';

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ============================================================
 * S1: 며칠 전(빵빵함) vs 지금(쪼그라듦) 대비 + 구멍 없음 배지 (무성 훅샷)
 * ============================================================ */
const S1_BW = 380;
const S1_Y = 540;
const S1_LEFT_X = CX - 455;
const S1_RIGHT_X = CX + 75;
const S1_BH = (S1_BW * 620) / 460;

export const S1Hook: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const leftA = clamp01((f - 4) / 20);
  const rightA = clamp01((f - 18) / 20);
  const shrinkT = clamp01((f - 30) / (frames * 0.55));
  const rightFullness = 1 - 0.45 * shrinkT;
  const arrowA = clamp01((f - 14) / 20);
  const noHoleA = clamp01((f - frames * 0.55) / 28);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={S1_LEFT_X + S1_BW / 2} y={S1_Y - 70} text={STR.beforeLabel} size={44} color={C.inkSoft} style={{ opacity: leftA }} />
      <Balloon width={S1_BW} x={S1_LEFT_X} y={S1_Y} fullness={1} style={{ opacity: leftA }} />

      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: arrowA }}>
        <path
          d={`M ${S1_LEFT_X + S1_BW + 15} ${S1_Y + S1_BH / 2} L ${S1_RIGHT_X - 15} ${S1_Y + S1_BH / 2}`}
          stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round"
        />
        <path
          d={`M ${S1_RIGHT_X - 35} ${S1_Y + S1_BH / 2 - 20} L ${S1_RIGHT_X - 9} ${S1_Y + S1_BH / 2} L ${S1_RIGHT_X - 35} ${S1_Y + S1_BH / 2 + 20}`}
          fill="none" stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>

      <Label x={S1_RIGHT_X + S1_BW / 2} y={S1_Y - 70} text={STR.afterLabel} size={44} color={C.ink} style={{ opacity: rightA }} />
      <Balloon
        width={S1_BW} x={S1_RIGHT_X} y={S1_Y} fullness={rightFullness}
        noHoleMark={noHoleA} style={{ opacity: rightA }}
      />
      <Label
        x={S1_RIGHT_X + S1_BW / 2} y={S1_Y + S1_BH + 60} text={STR.noHoleLabel} size={34} color={C.coral}
        style={{ opacity: noHoleA }}
      />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 고무 그물망 + 미세한 틈
 * ============================================================ */
const DIAG_W = 840;
const DIAG_X = CX - DIAG_W / 2;
const DIAG_Y = 470;

export const S2Gap: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const gapA = clamp01((f - 6) / (frames * 0.8));
  const labelA = clamp01((f - 20) / 26);

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BalloonPermeationDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} gapVisible={gapA} />
      <Label
        x={CX} y={DIAG_Y - 60} text={STR.gapLabel} size={54} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 기체 알갱이가 틈으로 빠져나감
 * ============================================================ */
export const S3Leak: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const leakA = clamp01((f - 10) / (frames * 0.85));

  return (
    <PlainBg top={C.room} bottom={C.paper} ground={null}>
      <BalloonPermeationDiagram width={DIAG_W} x={DIAG_X} y={DIAG_Y} gapVisible={1} leakProgress={leakA} />
      <Label
        x={CX} y={DIAG_Y - 60} text={STR.leakLabel} size={48} color={C.ink}
        style={{ opacity: labelA }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 풍선 3개가 순서대로 작아지는 타임랩스
 * ============================================================ */
const S4_BW = 300;
const S4_GAP = 40;
const S4_TOTAL_W = S4_BW * 3 + S4_GAP * 2;
const S4_START_X = CX - S4_TOTAL_W / 2;
const S4_Y = 620;
const S4_BH = (S4_BW * 620) / 460;
const S4_FULLNESS = [1, 0.8, 0.55];

export const S4Shrink: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01(f / 24);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={S4_Y - 70} text={STR.shrinkOverTimeLabel} size={50} color={C.ink} style={{ opacity: labelA }} />
      {S4_FULLNESS.map((full, i) => {
        const at = 10 + i * 18;
        const a = clamp01((f - at) / 18);
        const x = S4_START_X + i * (S4_BW + S4_GAP);
        return (
          <Balloon
            key={`b${i}`} width={S4_BW} x={x} y={S4_Y} fullness={full}
            style={{ opacity: a, transform: `scale(${0.85 + 0.15 * a})`, transformOrigin: 'center bottom' }}
          />
        );
      })}
      <svg width={W} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: clamp01((f - 70) / 20) }}>
        <path
          d={`M ${S4_START_X} ${S4_Y + S4_BH + 70} L ${S4_START_X + S4_TOTAL_W - 30} ${S4_Y + S4_BH + 70}`}
          stroke={C.inkSoft} strokeWidth={7} strokeLinecap="round"
        />
        <path
          d={`M ${S4_START_X + S4_TOTAL_W - 50} ${S4_Y + S4_BH + 52} L ${S4_START_X + S4_TOTAL_W - 22} ${S4_Y + S4_BH + 70} L ${S4_START_X + S4_TOTAL_W - 50} ${S4_Y + S4_BH + 88}`}
          fill="none" stroke={C.inkSoft} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 헬륨 vs 공기 - 알갱이 크기 비교 + 풍선 대비 + 속도 비교 막대
 * ============================================================ */
/* moleculeCompareProgress 는 헬륨(로컬 x=230)과 공기(로컬 x=470) 원을 700 뷰박스 안에서
 * 240단위 떨어뜨려 그린다. 너비를 작게 잡으면 화면상 간격이 좁아져 두 라벨("헬륨 알갱이"
 * /"공기 알갱이")이 겹친다(실측 결함, 스틸 선점검에서 발견) - 너비를 넉넉히 키워 간격을
 * 확보했다. 원 주변 외 나머지 영역은 투명이라 div 자체가 커져도 다른 레이어를 가리지 않는다. */
const S5_DIAG_W = 760;
const S5_DIAG_X = CX - S5_DIAG_W / 2;
const S5_DIAG_Y = 40;
const S5_DIAG_SCALE = S5_DIAG_W / BALLOON_PERM_VB;
const S5_HE_CX = S5_DIAG_X + 230 * S5_DIAG_SCALE;
const S5_AIR_CX = S5_DIAG_X + 470 * S5_DIAG_SCALE;
const S5_MOL_LABEL_Y = 560;

const S5_BW = 280;
/* 위쪽 moleculeCompareProgress 레이어는 헬륨(작은 원)이 항상 왼쪽(로컬 x=230), 공기(큰 원)가
 * 오른쪽(로컬 x=470)에 고정 배치된다(BalloonPermeationDiagram 내부). 아래 풍선 행도 같은
 * 좌우 순서(헬륨 왼쪽/공기 오른쪽)로 맞춰야 위아래 색이 세로로 정렬돼 헷갈리지 않는다. */
const S5_HE_X = CX - 365;
const S5_AIR_X = CX + 85;
const S5_BALLOON_Y = 700;
const S5_BALLOON_H = (S5_BW * 620) / 460;

const S5_BARS_X = CX - 260;
const S5_BARS_Y = 1180;

export const S5Compare: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const molA = clamp01((f - 6) / 40);
  const molLabelA = clamp01((f - 30) / 24);
  const balloonA = clamp01((f - 30) / 26);
  const barsA = clamp01((f - 60) / 20);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <BalloonPermeationDiagram width={S5_DIAG_W} x={S5_DIAG_X} y={S5_DIAG_Y} moleculeCompareProgress={molA} />
      <Label x={S5_HE_CX} y={S5_MOL_LABEL_Y} text={STR.heliumMoleculeLabel} size={32} color={C.ink} style={{ opacity: molLabelA }} />
      <Label x={S5_AIR_CX} y={S5_MOL_LABEL_Y} text={STR.airMoleculeLabel} size={32} color={C.ink} style={{ opacity: molLabelA }} />

      <Label x={S5_AIR_X + S5_BW / 2} y={S5_BALLOON_Y - 50} text={STR.airBalloonLabel} size={38} color={C.ink} style={{ opacity: balloonA }} />
      <Balloon width={S5_BW} x={S5_AIR_X} y={S5_BALLOON_Y} fullness={0.85} color={C.coral} style={{ opacity: balloonA }} />
      <Label x={S5_HE_X + S5_BW / 2} y={S5_BALLOON_Y - 50} text={STR.heliumBalloonLabel} size={38} color={C.ink} style={{ opacity: balloonA }} />
      <Balloon width={S5_BW} x={S5_HE_X} y={S5_BALLOON_Y} fullness={0.5} color={C.gold} style={{ opacity: balloonA }} />
      <Label
        x={CX} y={S5_BALLOON_Y + S5_BALLOON_H + 30} text={STR.shrinkSpeedLabel} size={36} color={C.inkSoft}
        style={{ opacity: barsA }}
      />

      {/* CompareBars 는 막대 길이만 자체 spring 으로 늦게 자라고, 항목 라벨 텍스트는 진행도와
          무관하게 즉시 그려진다(원본 컴포넌트 동작) - barsA 로 감싸지 않으면 "공기 풍선"/"헬륨
          풍선" 글자가 막대·"쪼그라드는 빠르기" 표제보다 훨씬 먼저(심지어 s4->s5 전환 크로스페이드
          중에도) 튀어나온다(스틸이 아니라 최종 mp4 프레임 검수에서 실측된 결함). 래퍼로 감싸
          barsA 에 맞춰 함께 나타나게 한다 */}
      <div style={{ opacity: barsA }}>
        <CompareBars
          x={S5_BARS_X} y={S5_BARS_Y} pxPerUnit={44} frame={f} rowGap={100}
          items={[
            { label: STR.airBalloonLabel, value: 3, color: C.coral, thickness: 40, at: 60 },
            { label: STR.heliumBalloonLabel, value: 7, color: C.gold, thickness: 40, at: 78 },
          ]}
        />
      </div>

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 헬륨 풍선 안쪽 특수 코팅
 * ============================================================ */
const S6_BW = 540;
const S6_X = CX - S6_BW / 2;
const S6_Y = 460;

export const S6Coating: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  const line = activeLine(lines, f / FPS);
  const labelA = clamp01((f - 4) / 24);
  const coatA = clamp01((f - 14) / (frames * 0.75));

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={CX} y={S6_Y - 60} text={STR.coatingLabel} size={54} color={C.ink} style={{ opacity: labelA }} />
      <Balloon
        width={S6_BW} x={S6_X} y={S6_Y} fullness={1} color={C.gold}
        coatingProgress={coatA} coatingColor={C.waterCool}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 고무 vs 은박 풍선 + 재질별 틈 촘촘함 비교
 * ============================================================ */
const S7_BW = 300;
const S7_LEFT_X = CX - 400;
const S7_RIGHT_X = CX + 100;
const S7_BALLOON_Y = 340;
const S7_BALLOON_H = (S7_BW * 620) / 460;

const S7_DIAG_W = 700;
const S7_DIAG_X = CX - S7_DIAG_W / 2;
const S7_DIAG_Y = 840;
const S7_DIAG_SCALE = S7_DIAG_W / BALLOON_PERM_VB;
const S7_LEFT_PANEL_CX = S7_DIAG_X + 225 * S7_DIAG_SCALE;
const S7_RIGHT_PANEL_CX = S7_DIAG_X + 475 * S7_DIAG_SCALE;
const S7_PANEL_LABEL_Y = S7_DIAG_Y + 500 * S7_DIAG_SCALE + 34;

export const S7Material: React.FC<{ f: number; frames: number; lines: CaptionLine[] }> = ({
  f, frames, lines,
}) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const balloonA = clamp01((f - 4) / 26);
  const diagA = clamp01((f - 34) / 40);

  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Label x={S7_LEFT_X + S7_BW / 2} y={S7_BALLOON_Y - 50} text={STR.rubberBalloonLabel} size={38} color={C.ink} style={{ opacity: balloonA }} />
      <Balloon width={S7_BW} x={S7_LEFT_X} y={S7_BALLOON_Y} fullness={1} color={C.coral} style={{ opacity: balloonA }} />
      <Label x={S7_RIGHT_X + S7_BW / 2} y={S7_BALLOON_Y - 50} text={STR.mylarBalloonLabel} size={38} color={C.ink} style={{ opacity: balloonA }} />
      <Balloon width={S7_BW} x={S7_RIGHT_X} y={S7_BALLOON_Y} fullness={1} color={MYLAR_COLOR} style={{ opacity: balloonA }} />
      <Label
        x={CX} y={S7_BALLOON_Y + S7_BALLOON_H + 20} text={STR.gapLabel} size={32} color={C.inkSoft}
        style={{ opacity: diagA }}
      />

      <BalloonPermeationDiagram width={S7_DIAG_W} x={S7_DIAG_X} y={S7_DIAG_Y} materialCompareProgress={diagA} />
      <Label x={S7_LEFT_PANEL_CX} y={S7_PANEL_LABEL_Y} text={STR.rubberGapLabel} size={30} color={C.ink} style={{ opacity: diagA }} />
      <Label x={S7_RIGHT_PANEL_CX} y={S7_PANEL_LABEL_Y} text={STR.mylarGapLabel} size={30} color={C.ink} style={{ opacity: diagA }} />

      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
