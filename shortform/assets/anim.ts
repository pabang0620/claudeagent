/** 프레임 -> 값 변환 헬퍼. 전부 순수 함수라 같은 프레임이면 항상 같은 값이 나온다.
 *
 *  Math.random() 을 쓰면 Remotion 이 프레임마다 다시 그릴 때 값이 달라져 화면이 떨린다.
 *  이 파일의 함수는 전부 frame 을 입력으로 받는 결정적 함수여야 한다.
 */
import { spring } from 'remotion';
import { FPS } from './theme';
import { Pose } from './character/Character';

/* ---------------- 결정적 눈깜빡임 ----------------
 * 고정 스케줄을 모듈 로드 시 1회 계산해 프레임 -> eyeOpen 을 순수 함수로 만든다.
 */
const BLINK_AT: number[] = (() => {
  const out: number[] = [];
  let f = 22;
  for (let i = 0; i < 200; i++) {
    out.push(f);
    f += 84 + ((i * 37) % 7) * 9; // 84~138 프레임 = 2.8~4.6초 간격, 규칙적이되 단조롭지 않게
  }
  return out;
})();

/** 눈 깜빡임: 7프레임에 걸쳐 감았다 뜬다. offset 으로 캐릭터마다 위상을 어긋나게 할 수 있다 */
export function eyeOpenAt(frame: number, offset = 0) {
  const f = frame + offset;
  for (const b of BLINK_AT) {
    if (f < b) break;
    const d = f - b;
    if (d < 7) {
      const k = d < 3 ? (d + 1) / 3 : (7 - d) / 4;
      return Math.max(0, 1 - Math.min(1, k));
    }
  }
  return 1;
}

/* ---------------- 호흡 ----------------
 * 가만히 서 있을 때도 죽어 보이지 않게 2.5초 주기로 아주 얕게 위아래로 움직인다.
 */
export function breathe(frame: number, amp = 1, periodSec = 2.5) {
  const p = (frame / (FPS * periodSec)) * Math.PI * 2;
  return {
    scale: 1 + 0.006 * amp * Math.sin(p),
    dy: -2.2 * amp * Math.sin(p + 0.6),
  };
}

/** 좌우로 살랑거림 (기린 목·매달린 소품 등) */
export function sway(frame: number, amp = 2, periodSec = 3) {
  return Math.sin((frame / (FPS * periodSec)) * Math.PI * 2) * amp;
}

/* ---------------- 스프링 ---------------- */

/** 등장용 기본 스프링. 0 -> 1 로 살짝 오버슛하며 올라온다 */
export function popIn(frame: number, fps = FPS, delay = 0, damping = 13) {
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.6, stiffness: 140 } });
}

/** 오버슛 없이 부드럽게 도달 (포즈 전환 등 튀면 안 되는 곳) */
export function easeIn(frame: number, fps = FPS, delay = 0) {
  return spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.9, stiffness: 110 } });
}

/** 크게 튕기는 강조용 */
export function bounceIn(frame: number, fps = FPS, delay = 0) {
  return spring({ frame: frame - delay, fps, config: { damping: 9, mass: 0.5, stiffness: 150 } });
}

/** 0..1 진행도를 구간으로 잘라 쓰기 */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** [a,b] 구간을 0..1 진행도로 (interpolate 의 clamp 버전 축약) */
export function progress(frame: number, a: number, b: number) {
  return clamp01((frame - a) / Math.max(1e-6, b - a));
}

/** 올라갔다(build) - 정점에서 머물렀다(peak) - 내려가는(release) 3단 사다리꼴 envelope.
 *  0..1 을 반환한다(0 = 평상시, 1 = 정점). 하품·기지개·놀람처럼 "서서히 커졌다가 잠깐
 *  유지된 뒤 서서히 가라앉는" 반응 애니메이션에서 반복적으로 필요해 general-ep21에서
 *  공용으로 승격했다(원칙 0 - 두 번째로 필요해지면 라이브러리로). progress() 를 세 구간에
 *  나눠 적용한 순수 함수라 결정적이다(Math.random 미사용, 원칙 3). */
export function buildPeakRelease(
  frame: number, start: number, buildFrames: number, peakFrames: number, releaseFrames: number
) {
  const buildEnd = start + buildFrames;
  const peakEnd = buildEnd + peakFrames;
  const releaseEnd = peakEnd + releaseFrames;
  if (frame < start) return 0;
  if (frame < buildEnd) return progress(frame, start, buildEnd);
  if (frame < peakEnd) return 1;
  if (frame < releaseEnd) return 1 - progress(frame, peakEnd, releaseEnd);
  return 0;
}

/** 임팩트 순간 잠깐 흔들기(감쇠형). 0 이면 정지.
 *  freq: 프레임당 위상 증가량(rad). 기본 2.2 는 짧은 충격(10~14프레임)에 맞춘 값이라
 *  general-ep05/07/10/16 이 그대로 쓴다. 추위에 떠는 것처럼 더 길게(40~60프레임) 미세하게
 *  떠는 연출은 amp 를 크게 낮추고 freq 를 이 값보다 높여써야 "덜덜거림"으로 읽힌다
 *  (general-ep08 v2, 2026-08-21 - amp=9 그대로 두면 프레임마다 부호가 거의 무작위로
 *  뒤집혀 진폭이 큰 채로 유지되는 구간이 많아 "지진처럼 보인다"는 피드백이 있었다). */
export function shake(frame: number, at: number, duration = 12, amp = 10, freq = 2.2) {
  if (frame < at || frame >= at + duration) return 0;
  const t = (frame - at) / duration;
  return Math.sin((frame - at) * freq) * amp * (1 - t);
}

/* ---------------- 포즈 보간 ----------------
 * 포즈를 뚝뚝 갈아끼우지 않기 위한 장치. t = 0 이면 a, 1 이면 b.
 */
export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const l = (x = 0, y = 0) => x + (y - x) * t;
  return {
    headTilt: l(a.headTilt ?? 0, b.headTilt ?? 0),
    lean: l(a.lean ?? 0, b.lean ?? 0),
    armL: { s: l(a.armL?.s ?? 44.83, b.armL?.s ?? 44.83), e: l(a.armL?.e ?? 21.29, b.armL?.e ?? 21.29) },
    armR: { s: l(a.armR?.s ?? -44.83, b.armR?.s ?? -44.83), e: l(a.armR?.e ?? -21.29, b.armR?.e ?? -21.29) },
    legL: { h: l(a.legL?.h ?? 3.8, b.legL?.h ?? 3.8), k: l(a.legL?.k ?? 0, b.legL?.k ?? 0) },
    legR: { h: l(a.legR?.h ?? -3.8, b.legR?.h ?? -3.8), k: l(a.legR?.k ?? 0, b.legR?.k ?? 0) },
    eyeOpen: l(a.eyeOpen ?? 1, b.eyeOpen ?? 1),
    blush: l(a.blush ?? 1, b.blush ?? 1),
    // 발끝 위치도 같이 보간해야 바닥선이 미끄러지지 않는다
    feetVb: l(a.feetVb ?? 1026, b.feetVb ?? 1026),
  };
}
