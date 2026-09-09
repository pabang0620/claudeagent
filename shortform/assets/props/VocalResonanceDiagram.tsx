/** "목소리는 성대가 떠는 소리(기본음)에 목·입 안 공간을 지나며 울리는 소리(공명)가 더해져
 *  만들어진다" -> "헬륨 속에서는 공명만 확 바뀌고 성대 떨림(진짜 음높이)은 그대로다"를
 *  보여주는 얼굴 오버레이 다이어그램(헬륨 마시면 목소리가 변하는 이유, general-ep56).
 *
 *  HeadNerveDiagram·VoicePathDiagram·CheekFlushDiagram과 같은 원칙(새 얼굴을 그리지 않고
 *  이미 승인된 BustActor 위에 오버레이만 얹음, breathAmp=0으로 정렬 유지). 성대·목 안을
 *  사실적인 해부도로 그리지 않고 "단순한 관과 도형"(캡슐 하나 + 얇은 연결관)으로만
 *  표현한다(오케스트레이터 지시). 기체 입자를 점으로 뿌리지 않고, 소리는 큰 물결선
 *  2~3개(성대 파형 1개 + 공명 파형 2개(본선+halo))로만 표현한다.
 *
 *  핵심 대비: `showCords`(성대)가 켜지면 목 아래 캡슐 안에서 항상 같은 진폭·주기로
 *  진동하는 파형을 그린다 - `heliumMix` 값과 무관하게 절대 바뀌지 않는다("성대: 그대로"를
 *  글자 없이도 시각적으로 증명). `showResonance`(공명)가 켜지면 입에서 오른쪽으로 뻗어나가는
 *  큰 물결선이 나오는데, 이건 `heliumMix`(0=공기, 1=헬륨)에 따라 물결 간격이 좁아지고
 *  (촘촘해지고) 파형 전체가 위로 이동하며 색이 코랄(낮은 톤)에서 골드(밝고 높은 톤)로
 *  바뀐다 - "울림만 확 바뀐다"의 시각화.
 *
 *  좌표는 새로 지어내지 않는다: 성대 자리는 HEAD_PIVOT(606)~SHOULDER(647) 사이 목 위치에
 *  잡았고, 공명 파형의 출발점은 RIG.MOUTH(627,505) 그대로다.
 */
import React from 'react';
import { C } from '../theme';
import { BustActor } from '../character/Actor';
import { RIG, BUST_VIEWBOX } from '../character/Character';
import { POSES } from '../character/poses';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** 성대 자리 - 머리 회전축(HEAD_PIVOT.y=606)과 어깨(SHOULDER.y=647) 사이 목 위치.
 *  새 좌표를 지어낸 게 아니라 이미 실측된 두 앵커 사이 지점을 그대로 잡았다. */
export const VOCAL_CORDS_PT = { x: RIG.CX, y: 630 };
/** 공명 파형이 시작되는 자리 - 캐릭터 실제 입 위치(RIG.MOUTH) 그대로. */
export const VOCAL_MOUTH_PT = { x: RIG.MOUTH.cx, y: RIG.MOUTH.y };

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** 두 hex 색을 t(0~1)로 보간해 hex 문자열을 반환한다. 반환값을 다시 보간에 넣지 않는다
 *  (49화에서 rgb() 문자열을 재보간해 색이 깨진 사고 - REGISTRY "21화 이후 결함 A" 참고). */
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** 진행 방향이 수평인 단순 사인파 폴리라인 "d" 문자열 (베지어 불필요 - 직선 구간용) */
function sineWaveD(x0: number, y0: number, length: number, amplitude: number, cycles: number, phase = 0, segments = 48): string {
  const parts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = x0 + t * length;
    const y = y0 + amplitude * Math.sin(t * cycles * Math.PI * 2 + phase);
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(' ');
}

const CORDS_WAVE_LEN = 84;
const CORDS_WAVE_AMP = 9;
const CORDS_WAVE_CYCLES = 2.4;

/** 파형 시작 x - 입에서 바로 뻗지 않고 눈(RIG.EYE 오른쪽 눈 우측 끝, dx=102+rx=28=130,
 *  CX+130=756.5) 을 가로지르지 않도록 그보다 오른쪽에서 시작한다. heliumMix로 파형이
 *  위로 이동해도(RES_RISE_MAX) x축은 절대 시작점보다 왼쪽으로 가지 않는 단조 함수라
 *  (sineWaveD가 t 증가에 따라 x만 증가), 시작점만 눈 바깥에 두면 어떤 상태에서도 눈과
 *  겹치지 않는다(스틸 선점검에서 발견 - heliumMix=1일 때 파형이 눈을 가로지름). */
const RES_START_DX = 165;
const RES_WAVE_LEN = 260;
const RES_AMP_AIR = 32;
const RES_AMP_HELIUM = 30;
const RES_CYCLES_AIR = 2.0;
const RES_CYCLES_HELIUM = 4.2;
const RES_RISE_MAX = 92; // heliumMix=1일 때 파형이 위로 이동하는 픽셀량

export interface VocalResonanceDiagramProps {
  /** 씬 로컬 프레임(선택). 성대 파형의 "항상 같은" 진동을 살짝 움직이게 하는 데만 쓴다 */
  f?: number;
  /** 화면상 한 변 크기(px). BUST_VIEWBOX가 정사각형이라 폭=높이 */
  width: number;
  x?: number;
  y?: number;
  /** 0~1. 성대(목 캡슐+파형) 노출. heliumMix와 무관하게 항상 같은 파형 - "성대: 그대로" */
  showCords?: number;
  /** 0~1. 공명 파형(입에서 뻗어나가는 큰 물결선) 노출 */
  showResonance?: number;
  /** 0~1. 0=공기(넓은 간격, 낮은 위치, 코랄) -> 1=헬륨(좁은 간격, 높은 위치, 골드) */
  heliumMix?: number;
  stroke?: string;
  fill?: string;
  style?: React.CSSProperties;
}

export const VocalResonanceDiagram: React.FC<VocalResonanceDiagramProps> = ({
  f = 0, width, x = 0, y = 0, showCords, showResonance, heliumMix = 0,
  stroke = C.ink, fill = C.paper, style,
}) => {
  const cordsP = showCords === undefined ? null : clamp01(showCords);
  const resP = showResonance === undefined ? null : clamp01(showResonance);
  const mix = clamp01(heliumMix);

  const tubeVisible = (cordsP ?? 0) > 0.02 || (resP ?? 0) > 0.02;
  const tubeOpacity = Math.max(cordsP ?? 0, resP ?? 0) * 0.4;

  const resColor = lerpColor(C.coral, C.gold, mix);
  const resHaloColor = lerpColor(C.coralSoft, C.goldSoft, mix);
  const resCycles = lerp(RES_CYCLES_AIR, RES_CYCLES_HELIUM, mix);
  const resAmp = lerp(RES_AMP_AIR, RES_AMP_HELIUM, mix);
  const resY0 = VOCAL_MOUTH_PT.y - lerp(0, RES_RISE_MAX, mix);
  const resPhase = f * 0.05;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width, height: width, overflow: 'visible', ...style }}>
      <BustActor size={width} left={0} top={0} pose={POSES.idle} breathAmp={0} color={stroke} fill={fill} />

      <svg
        viewBox={BUST_VIEWBOX}
        width={width}
        height={width}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        {/* 단순한 관 - 성대(목)와 입 사이를 잇는, 해부도가 아닌 순수 도형 하나 */}
        {tubeVisible ? (
          <path
            d={`M ${VOCAL_MOUTH_PT.x - 14} ${VOCAL_MOUTH_PT.y + 18}
                Q ${VOCAL_CORDS_PT.x - 30} ${(VOCAL_MOUTH_PT.y + VOCAL_CORDS_PT.y) / 2}
                  ${VOCAL_CORDS_PT.x - 34} ${VOCAL_CORDS_PT.y - 4}
                L ${VOCAL_CORDS_PT.x + 34} ${VOCAL_CORDS_PT.y - 4}
                Q ${VOCAL_CORDS_PT.x + 30} ${(VOCAL_MOUTH_PT.y + VOCAL_CORDS_PT.y) / 2}
                  ${VOCAL_MOUTH_PT.x + 14} ${VOCAL_MOUTH_PT.y + 18} Z`}
            fill={C.sky}
            stroke={C.inkSoft}
            strokeWidth={5}
            opacity={tubeOpacity}
          />
        ) : null}

        {/* 공명 파형 - 입에서 뻗어나간다. heliumMix가 오를수록 간격이 좁아지고 위로 이동, 색이 골드로.
            짧은 연결선으로 입과 파형 시작점을 이어 "입에서 나온다"는 것을 보여준다(파형 자체는
            눈과 겹치지 않도록 눈 바깥에서 시작 - 위 RES_START_DX 주석 참고). */}
        {resP !== null && resP > 0.02 ? (
          <g opacity={resP}>
            <path
              d={`M ${VOCAL_MOUTH_PT.x + 16} ${VOCAL_MOUTH_PT.y - 6} L ${VOCAL_MOUTH_PT.x + RES_START_DX} ${resY0}`}
              fill="none" stroke={resColor} strokeWidth={7} strokeLinecap="round" opacity={0.7}
            />
            <path
              d={sineWaveD(VOCAL_MOUTH_PT.x + RES_START_DX, resY0, RES_WAVE_LEN, resAmp * 1.4, resCycles, resPhase)}
              fill="none" stroke={resHaloColor} strokeWidth={26}
              strokeLinecap="round" strokeLinejoin="round" opacity={0.55}
            />
            <path
              d={sineWaveD(VOCAL_MOUTH_PT.x + RES_START_DX, resY0, RES_WAVE_LEN, resAmp, resCycles, resPhase)}
              fill="none" stroke={resColor} strokeWidth={13}
              strokeLinecap="round" strokeLinejoin="round"
            />
          </g>
        ) : null}

        {/* 성대 - 목 위 캡슐 + 항상 같은 파형(heliumMix와 무관) */}
        {cordsP !== null && cordsP > 0.02 ? (
          <g opacity={cordsP} transform={`translate(${VOCAL_CORDS_PT.x} ${VOCAL_CORDS_PT.y}) scale(${0.75 + 0.25 * cordsP}) translate(${-VOCAL_CORDS_PT.x} ${-VOCAL_CORDS_PT.y})`}>
            <rect
              x={VOCAL_CORDS_PT.x - 60} y={VOCAL_CORDS_PT.y - 36} width={120} height={72} rx={36}
              fill={fill} stroke={stroke} strokeWidth={9}
            />
            <path
              d={sineWaveD(
                VOCAL_CORDS_PT.x - CORDS_WAVE_LEN / 2, VOCAL_CORDS_PT.y,
                CORDS_WAVE_LEN, CORDS_WAVE_AMP, CORDS_WAVE_CYCLES, f * 0.4,
              )}
              fill="none" stroke={C.coral} strokeWidth={9}
              strokeLinecap="round" strokeLinejoin="round"
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export default VocalResonanceDiagram;
