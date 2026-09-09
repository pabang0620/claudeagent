/** 이 화(general-ep69, "긴장하면 손에 땀이 나는 이유") 전용 장면.
 *
 *  s1(시험/면접 앞 긴장한 캐릭터) -> s2(PalmSweatDiagram hand: 손바닥 vs 팔뚝 땀샘 밀도) ->
 *  s3(같은 손바닥 다이어그램, 긴장 반응 땀샘만 코랄로 구분) -> s4(PalmSweatDiagram body:
 *  전신 온도 땀샘 vs 손발 감정 땀샘 + 뇌->손 신호선) -> s5(PalmSweatDiagram ancestor:
 *  나뭇가지를 잡은 조상 + 큰 물방울) -> s6(조상 -> 현대인 크로스페이드) ->
 *  s7(PalmSweatDiagram polygraph: 거짓말탐지기 미니 다이어그램).
 *
 *  이 화 시각 주의사항(오케스트레이터 지시): 몸 전체 땀샘과 손발 땀샘이 서로 다른 신호에
 *  반응한다는 대비가 중심 - 뇌->손 신호선을 굵게. 땀방울은 작은 점 무리가 아니라 손바닥 위
 *  큰 물방울 2~3개로만. 긴장 표정은 확실히 하되 과장해서 우스꽝스럽게 그리지 않는다.
 *  뇌는 해부도가 아니라 45화 MemoryOverlapDiagram처럼 단순 도형으로 추상화한다(여기서는
 *  아예 뇌 형상을 그리지 않고 머리 자체를 신호의 출발점으로만 쓴다 - 더 단순한 선택).
 */
import React from 'react';
import {
  Actor, C, Caption, FPS, FS, GROUND, Label, PalmSweatDiagram, PlainBg, POSES,
  SW_THIN, SweatDroplet, W, clamp01, mouthAt, mouthProp, progress,
} from '../../../assets';
import type { CaptionLine, MouthFile } from '../../../assets';
import { STRINGS } from './strings';

const CX = W / 2;
const t = STRINGS.ko;

const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

function activeLine(lines: CaptionLine[], sec: number): CaptionLine | null {
  for (const ln of lines) if (sec >= ln.start && sec < ln.end) return ln;
  return null;
}

interface SceneProps { f: number; frames: number; lines: CaptionLine[] }
interface MouthSceneProps extends SceneProps { mouth: MouthFile['mouth'] }

/* ============================================================
 * S1: 시험지 앞에서 긴장한 캐릭터 (thinking 포즈)
 * ============================================================ */

/** 이 화 전용 소품(에피소드 로컬) - 책상 위 시험지. 다른 화 재사용 가능성이 낮은
 *  단순 장식이라 REGISTRY에 올리지 않는다(원칙 0 "정말 없는 것만" 기준에서, 이건
 *  "재사용 가능한 부품"이 아니라 이 장면 전용 소도구에 가깝다). */
function ExamPaper({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  const h = w * 1.3;
  return (
    <svg
      width={w} height={h}
      style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, overflow: 'visible' }}
    >
      <g transform="rotate(-6 0 0)">
        <rect x={0} y={0} width={w} height={h} rx={14} fill={C.paper} stroke={C.ink} strokeWidth={SW_THIN} />
        {[0.22, 0.36, 0.5, 0.64].map((frac) => (
          <line
            key={frac}
            x1={w * 0.16} y1={h * frac} x2={w * 0.84} y2={h * frac}
            stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}

export const S1Nervous: React.FC<MouthSceneProps> = ({ f, lines, mouth }) => {
  const sec = f / FPS;
  const mouthOpen = mouthProp(mouthAt(mouth, 's1', f));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <ExamPaper cx={CX - 300} cy={980} w={220} />
      <Actor size={820} centerX={CX + 40} ground={GROUND} pose={POSES.thinking} mouthOpen={mouthOpen} />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S2: 손바닥 vs 팔뚝 - 땀샘 밀도 점묘 팝인
 * ============================================================ */

const HAND_DIA_W = 780;
const HAND_DIA_X = CX - HAND_DIA_W / 2;
const HAND_DIA_Y = 480;

export const S2Density: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const dP = smooth(progress(f, 6, frames * 0.85));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s2Label} size={FS.label} color={C.ink} />
      <PalmSweatDiagram
        mode="hand" width={HAND_DIA_W} x={HAND_DIA_X} y={HAND_DIA_Y} densityProgress={dP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S3: 같은 손바닥 다이어그램 - 긴장 반응 땀샘만 코랄로 구분
 * ============================================================ */

export const S3TypeHighlight: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const tP = smooth(progress(f, 6, frames * 0.88));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s3Label} size={FS.label} color={C.coral} />
      <PalmSweatDiagram
        mode="hand" width={HAND_DIA_W} x={HAND_DIA_X} y={HAND_DIA_Y}
        densityProgress={1} typeHighlight={tP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S4: 전신 - 온도 조절 땀샘(온몸) vs 감정 반응 땀샘(손발) + 뇌->손 신호선
 * ============================================================ */

const BODY_DIA_W = 880;
const BODY_DIA_X = CX - BODY_DIA_W / 2;
const BODY_DIA_Y = 360;

export const S4BodyCompare: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const dP = smooth(progress(f, 4, frames * 0.48));
  const tP = smooth(progress(f, frames * 0.42, frames * 0.95));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s4Label} size={FS.label} color={C.ink} />
      <PalmSweatDiagram
        mode="body" width={BODY_DIA_W} x={BODY_DIA_X} y={BODY_DIA_Y}
        densityProgress={dP} typeHighlight={tP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S5: 나뭇가지를 잡은 조상 실루엣 + 큰 물방울
 * ============================================================ */

const ANC_DIA_W = 680;
const ANC_DIA_X = CX - ANC_DIA_W / 2;
const ANC_DIA_Y = 380;

export const S5Ancestor: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const aP = smooth(progress(f, 4, frames * 0.9));
  return (
    <PlainBg top={C.goldSoft} bottom={C.paper} stop={0.5}>
      <Label x={CX} y={300} text={t.s5Label} size={FS.label} color={C.ink} />
      <PalmSweatDiagram
        mode="ancestor" width={ANC_DIA_W} x={ANC_DIA_X} y={ANC_DIA_Y} ancestorProgress={aP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S6: 조상 -> 현대인(캐릭터) 크로스페이드
 * ============================================================ */

export const S6Crossfade: React.FC<MouthSceneProps> = ({ f, frames, lines, mouth }) => {
  const sec = f / FPS;
  const mixT = smooth(progress(f, frames * 0.18, frames * 0.82));
  const mouthOpen = mouthProp(mouthAt(mouth, 's6', f));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s6Label} size={FS.label} color={C.ink} />
      <PalmSweatDiagram
        mode="ancestor" width={ANC_DIA_W} x={ANC_DIA_X} y={ANC_DIA_Y} ancestorProgress={1}
        style={{ opacity: 1 - mixT }}
      />
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: mixT }}>
        <Actor size={820} centerX={CX + 40} ground={GROUND} pose={POSES.thinking} mouthOpen={mouthOpen} />
        <SweatDroplet x={CX + 176} y={956} size={34} />
        <SweatDroplet x={CX + 210} y={982} size={24} opacity={0.9} />
      </div>
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};

/* ============================================================
 * S7: 거짓말탐지기 미니 다이어그램
 * ============================================================ */

const POLY_DIA_W = 700;
const POLY_DIA_X = CX - POLY_DIA_W / 2;
const POLY_DIA_Y = 480;

export const S7Polygraph: React.FC<SceneProps> = ({ f, frames, lines }) => {
  const sec = f / FPS;
  const pP = smooth(progress(f, 4, frames * 0.92));
  return (
    <PlainBg top={C.sky} bottom={C.paper}>
      <Label x={CX} y={300} text={t.s7Label} size={FS.label} color={C.ink} />
      <PalmSweatDiagram
        mode="polygraph" width={POLY_DIA_W} x={POLY_DIA_X} y={POLY_DIA_Y} polygraphProgress={pP}
      />
      <Caption line={activeLine(lines, sec)} t={sec} />
    </PlainBg>
  );
};
