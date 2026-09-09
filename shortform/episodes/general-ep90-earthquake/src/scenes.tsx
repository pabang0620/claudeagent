/** 이 화(general-ep90, "지진이 나는 이유") 전용 장면. 문구는 전부 strings.ts 에서 읽는다
 *  (언어 무관 컴포넌트). 캐릭터가 등장해 말하는 장면이 없다(순수 다이어그램 구성 - ep71/72/79와
 *  같은 구조, 02-script-v1.md 자산 목록에도 Actor/BustActor가 없다).
 *
 *  s1(FaultStressDiagram, plateDriftProgress - 개관: 두 판이 서로를 향해 아주 천천히 움직임) ->
 *  s2(같은 다이어그램, 확대: 경계에서 밀고 부딪힘 + 라벨 "단층") -> s3(stressProgress 0->0.35 -
 *  경계가 톱니처럼 맞물려 꽉 붙잡힘) -> s4(stressProgress 0.35->1 - 오른쪽 게이지가 차오르며
 *  힘이 쌓임) -> s5(판 이동 속도 vs 손톱 자라는 속도 비교, 이 화 전용 로컬 그래픽) ->
 *  s6(slipProgress 0->1 - 한계를 넘어 순간적으로 미끄러짐, FlashOverlay) ->
 *  s7(slipProgress=1 유지 + f로 동심원 지속, Shake로 화면 흔들림 + 라벨 "지진") ->
 *  s8(aftershockProgress - 감쇠하는 여진 파형).
 *
 *  s2~s8은 같은 FaultStressDiagram 인스턴스를 같은 위치·크기로 이어서 쓴다(VolcanoDiagram·
 *  WallVibrationDiagram과 같은 "단일 컴포넌트로 여러 화면 커버" 설계, 21화 이후 결함 D -
 *  "다음 장면에서 이전 상태를 명시적으로 유지시킨다"). s3->s4는 stressProgress를 0.35 지점에서
 *  이어받고, s6~s8은 stressProgress=1을 유지한 채 slipProgress/aftershockProgress만 이어간다.
 *
 *  이 화의 시각 주의사항(오케스트레이터 지시):
 *   - 판은 굵은 블록 2개로 단순하게 그린다(FaultStressDiagram 내부에 이미 반영) - 판구조·
 *     지층을 사실적으로 그리지 않는다.
 *   - 85화(화산)와 소재가 인접하지만 원리가 다르다 - 마그마·화산 이미지를 이 화에 섞지
 *     않는다(FaultStressDiagram은 화산 요소를 전혀 참조하지 않는다).
 *   - "꽉 붙잡힌 채 힘이 쌓이는 상태"와 "한계를 넘어 갑자기 미끄러지는 순간"의 대비가 중심이다
 *     - s3~s4(축적)와 s6(방출)의 색·형태 변화로 대비시킨다.
 *   - 미끄러지는 순간의 흔들림은 화면 전체 진동(Shake)으로 표현한다(s7).
 *   - 지진을 무섭게 그리지 않는다 - 채널의 밝고 담백한 톤을 유지한다(FlashOverlay는 짧고
 *     옅게, Shake는 진폭을 크게 주지 않는다).
 */
import React from 'react';
import {
  C, Caption, FAULT_GAUGE_TOP_PT, FAULT_VB_W, FPS, FS, FaultStressDiagram,
  FlashOverlay, Label, PlainBg, SW_THIN, Shake, ThemedIcon, W, clamp01, progress,
} from '../../../assets';
import type { CaptionLine } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2; // W=1080
const t = STRINGS.ko;

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }

/* ============================================================
 * 공용 다이어그램 배치 (s2~s8, VolcanoDiagram과 같은 "같은 자리에 계속 재사용" 방식)
 * ============================================================ */
const DIAG_WIDTH = 760;
const DIAG_X = CX - DIAG_WIDTH / 2;
const DIAG_Y = 330;
const DIAG_SCALE = DIAG_WIDTH / FAULT_VB_W;

function diagPt(p: { x: number; y: number }) {
  return { x: DIAG_X + p.x * DIAG_SCALE, y: DIAG_Y + p.y * DIAG_SCALE };
}

/** "단층"/"지진" 라벨은 다이어그램 상단(경계 시작점) 바로 위에 앉혔더니 블록 모서리와
 *  겹쳤다(스틸 선점검 f375/f1091에서 확인 - 라벨 하단이 블록 상단 테두리를 침범). 화면
 *  안전영역(SAFE_TOP=240) 바로 아래, 이동 화살표(로컬 y=BLOCK_TOP-70)보다도 위인 고정
 *  위치로 뺐다 - 21화 이후 결함 B("라벨이 도형 테두리에 가려지거나 겹친다") 재발 방지 */
const TOP_LABEL_PT = { x: CX, y: 300 };
const gaugeLabelPt = diagPt({ x: FAULT_GAUGE_TOP_PT.x, y: FAULT_GAUGE_TOP_PT.y - 40 });

/* ============================================================
 * S1: 개관 - 두 판이 서로를 향해 아주 천천히 움직인다 (축소된 프레이밍)
 * ============================================================ */
const S1_DIAG_WIDTH = 680;
const S1_DIAG_X = CX - S1_DIAG_WIDTH / 2;
const S1_DIAG_Y = 380;

export const S1Drift: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const driftP = progress(f, 6, Math.round(frames * 0.85));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FaultStressDiagram
        width={S1_DIAG_WIDTH} x={S1_DIAG_X} y={S1_DIAG_Y} f={f} plateDriftProgress={driftP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 확대 - 경계에서 계속 밀고 부딪힌다 + 라벨 "단층"
 * ============================================================ */
export const S2Push: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const labelP = progress(f, 6, 22);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FaultStressDiagram width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f} plateDriftProgress={1} />
      <Label
        x={TOP_LABEL_PT.x} y={TOP_LABEL_PT.y} text={t.s2FaultLabel} size={FS.label} color={C.ink}
        style={{ opacity: clamp01(labelP) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 마찰 때문에 경계가 톱니처럼 맞물려 꽉 붙잡힌다 (stressProgress 0->0.35)
 * ============================================================ */
export const S3Lock: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const stressP = 0.35 * progress(f, 0, Math.round(frames * 0.86));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FaultStressDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
        plateDriftProgress={1} stressProgress={stressP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 그 상태로 오랫동안 힘이 쌓인다 (stressProgress 0.35->1, 게이지가 차오름)
 * ============================================================ */
export const S4Build: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const stressP = 0.35 + 0.65 * progress(f, 0, Math.round(frames * 0.88));
  const labelP = progress(f, 8, 26);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FaultStressDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
        plateDriftProgress={1} stressProgress={stressP}
      />
      <Label
        x={gaugeLabelPt.x} y={gaugeLabelPt.y} text={t.s4StressLabel} size={FS.small} color={C.ink}
        wrapWidth={200} style={{ opacity: clamp01(labelP) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 판 이동 속도 vs 손톱 자라는 속도 비교 (이 화 전용 로컬 그래픽 - 등록하지 않음,
 *     지역성 우선. 두 트랙의 마커를 완전히 같은 진행 함수로 움직여 "비슷하게 느리다"는
 *     대본의 비유를 좌표로 그대로 보여준다)
 * ============================================================ */
const S5_ICON_SIZE = 150;
const S5_ICON_X = 150;
const S5_TRACK_X0 = 400;
const S5_TRACK_X1 = 950;
const S5_TRACK_W = S5_TRACK_X1 - S5_TRACK_X0;
const S5_ROW1_Y = 660;
const S5_ROW2_Y = 1040;
/** 트랙 전체 길이 대비 마커가 실제로 이동하는 비율 - "거의 안 보일 만큼" 작게, 그러나
 *  0은 아니게(0이면 "멈춰 있다"로 오독된다) */
const S5_MOVE_FRAC = 0.15;

const S5CompareRow: React.FC<{
  icon: string; label: string; y: number; moveP: number; iconAppear: number;
}> = ({ icon, label, y, moveP, iconAppear }) => {
  const dotX = S5_TRACK_X0 + S5_TRACK_W * S5_MOVE_FRAC * clamp01(moveP);
  return (
    <>
      <div style={{ position: 'absolute', left: S5_ICON_X - S5_ICON_SIZE / 2, top: y - S5_ICON_SIZE / 2, opacity: iconAppear }}>
        <ThemedIcon name={icon} size={S5_ICON_SIZE} color={C.ink} />
      </div>
      <Label x={S5_ICON_X} y={y + S5_ICON_SIZE / 2 + 14} text={label} size={FS.small} color={C.ink} style={{ opacity: iconAppear }} />
      <svg width={S5_TRACK_X1 - S5_TRACK_X0 + 60} height={80} style={{ position: 'absolute', left: S5_TRACK_X0, top: y - 40, overflow: 'visible', opacity: iconAppear }}>
        <line
          x1={0} y1={0} x2={S5_TRACK_W} y2={0} stroke={C.ink} strokeWidth={SW_THIN} strokeDasharray="6 16"
          opacity={0.4} transform="translate(0 40)"
        />
        <circle cx={dotX - S5_TRACK_X0} cy={40} r={17} fill={C.coral} stroke={C.ink} strokeWidth={SW_THIN * 0.8} />
      </svg>
    </>
  );
};

export const S5Compare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const iconAppear = clamp01(progress(f, 4, 22));
  const moveP = progress(f, 20, Math.round(frames * 0.92));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <S5CompareRow icon="world" label={t.s5PlateLabel} y={S5_ROW1_Y} moveP={moveP} iconAppear={iconAppear} />
      <S5CompareRow icon="hand-finger" label={t.s5NailLabel} y={S5_ROW2_Y} moveP={moveP} iconAppear={iconAppear} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 한계를 넘으면 한순간에 미끄러지며 확 풀려난다 (slipProgress 0->1, 순간 스냅)
 * ============================================================ */
/** 슬립이 순간적으로 튀는 시작 프레임(로컬) - "확 풀려나가요"에 맞춘다.
 *  Episode.tsx가 SFX 타이밍에 그대로 가져다 쓴다 */
export const S6_SNAP_AT_FRAC = 0.68;

export const S6Slip: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const snapAt = Math.round(frames * S6_SNAP_AT_FRAC);
  const slipP = progress(f, snapAt, snapAt + 8);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FaultStressDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
        stressProgress={1} slipProgress={slipP}
      />
      <FlashOverlay frame={f} at={snapAt} color={C.paper} peak={0.5} rise={3} fall={14} />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 그 순간 터져 나온 에너지가 땅을 흔드는 게 지진이다 (Shake + 동심원 + 라벨 "지진")
 * ============================================================ */
export const S7Quake: React.FC<SceneProps> = ({ f, frames, lines }) => {
  void frames;
  const line = activeLine(lines, f / FPS);
  const labelP = progress(f, 4, 22);
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <Shake frame={f} at={2} duration={40} amp={7} freq={2.4}>
        <FaultStressDiagram
          width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
          stressProgress={1} slipProgress={1}
        />
      </Shake>
      <Label
        x={TOP_LABEL_PT.x} y={TOP_LABEL_PT.y} text={t.s7QuakeLabel} size={FS.title} color={C.coral}
        style={{ opacity: clamp01(labelP) }}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};

/* ============================================================
 * S8: 큰 지진 뒤에 작은 흔들림이 몇 번 더 이어진다 (aftershockProgress, 감쇠 파형)
 * ============================================================ */
export const S8Aftershock: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const line = activeLine(lines, f / FPS);
  const aftershockP = progress(f, 4, Math.round(frames * 0.92));
  return (
    <PlainBg top={C.sky} bottom={C.paper} ground={null}>
      <FaultStressDiagram
        width={DIAG_WIDTH} x={DIAG_X} y={DIAG_Y} f={f}
        stressProgress={1} slipProgress={1} aftershockProgress={aftershockP}
      />
      <Caption line={line} t={f / FPS} />
    </PlainBg>
  );
};
