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

/** 임팩트 순간 잠깐 흔들기. 0 이면 정지 */
export function shake(frame: number, at: number, duration = 12, amp = 10) {
  if (frame < at || frame >= at + duration) return 0;
  const t = (frame - at) / duration;
  return Math.sin((frame - at) * 2.2) * amp * (1 - t);
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
