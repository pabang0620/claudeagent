/** 캐릭터 포즈 프리셋.
 *
 *  각도 규약은 Character.tsx 와 동일 (0 = 아래, 양수 = 왼쪽으로 벌어짐).
 *  팔을 들 때는 어깨각 |s| 를 105~120 부근에 두는 것이 손이 머리 밖으로 가장 잘 나온다.
 *  |s| 가 150 을 넘어가면 팔이 머리 쪽으로 접근해 다시 파묻히므로 쓰지 않는다.
 *
 *  발끝이 기본 위치(1026)보다 올라오는 포즈는 feetVb 를 함께 넣어 둔다.
 *  Actor 가 이 값을 읽어 바닥선을 자동으로 맞춘다.
 */
import { Pose } from './Character';

/** 기본 서 있는 자세 (원본 PNG 와 동일) */
export const IDLE: Pose = {
  headTilt: 0, lean: 0,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -44.83, e: -21.29 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
};

/** 위를 올려다보며 오른팔로 가리킨다 */
export const POINT_UP: Pose = {
  headTilt: -7, lean: -2,
  armL: { s: 40, e: 24 }, armR: { s: -116, e: -22 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

/** 어깨 으쓱 "글쎄?" - 질문·퀴즈 제시 */
export const SHRUG: Pose = {
  headTilt: 6, lean: 0,
  armL: { s: 76, e: 64 }, armR: { s: -76, e: -64 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

/** 두 손을 앞으로 모아 개수를 센다 */
export const COUNT: Pose = {
  headTilt: -2, lean: 0,
  armL: { s: 62, e: 66 }, armR: { s: -62, e: -66 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

/** 두 손 번쩍 - 정답 공개·놀람 리액션 */
export const SURPRISED: Pose = {
  headTilt: 0, lean: -1,
  armL: { s: 116, e: 20 }, armR: { s: -116, e: -20 },
  legL: { h: 9, k: 0 }, legR: { h: -9, k: 0 },
  eyeOpen: 1.28, blush: 1.35,
};

/** 양팔을 크게 벌려 길이를 잰다 */
export const MEASURE: Pose = {
  headTilt: 0, lean: 0,
  armL: { s: 100, e: 4 }, armR: { s: -100, e: -4 },
  legL: { h: 7, k: 0 }, legR: { h: -7, k: 0 },
  eyeOpen: 1.12,
};

/** 한 손을 옆으로 펴서 그래픽을 제시 */
export const PRESENT: Pose = {
  headTilt: -4, lean: 0,
  armL: { s: 108, e: 16 }, armR: { s: -38, e: -20 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
};

/** 턱에 손을 대고 생각 */
export const THINKING: Pose = {
  headTilt: 7, lean: 2,
  armL: { s: 40, e: 26 }, armR: { s: -95, e: -75 },
  legL: { h: 3, k: 0 }, legR: { h: -3, k: 0 },
  mouthOpen: 0.05, eyeOpen: 0.75,
};

/** 한 손 흔들며 인사 (전신) */
export const WAVE: Pose = {
  headTilt: 6, lean: -1,
  armL: { s: 100, e: 40 }, armR: { s: -44.83, e: -21.29 },
  legL: { h: 4, k: 0 }, legR: { h: -4, k: 0 },
  mouthOpen: 0.7,
};

/** 두 팔을 수평으로 활짝 - "짜잔" */
export const WIDE: Pose = {
  headTilt: 0, lean: 0,
  armL: { s: 95, e: 2 }, armR: { s: -95, e: -2 },
  legL: { h: 6, k: 0 }, legR: { h: -6, k: 0 },
  mouthOpen: 0.55, eyeOpen: 1.1,
};

/** 만세 환호 - 인트로·성공 리액션 (다리도 벌어져 신남이 읽힌다) */
export const CHEER: Pose = {
  headTilt: -3, lean: 0,
  armL: { s: 128, e: 14 }, armR: { s: -128, e: -14 },
  legL: { h: 12, k: 0 }, legR: { h: -12, k: 0 },
  mouthOpen: 0.85, eyeOpen: 1.15, blush: 1.25,
};

/** 목에 손을 대 보라고 시범 (바스트샷 전용) */
export const TOUCH_NECK: Pose = {
  headTilt: 4, lean: 0,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -58, e: -74 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
};

/** 손 흔들며 마무리 (바스트샷 전용) */
export const WAVE_BYE: Pose = {
  headTilt: 5, lean: 0,
  armL: { s: 44.83, e: 21.29 }, armR: { s: -112, e: -26 },
  legL: { h: 3.8, k: 0 }, legR: { h: -3.8, k: 0 },
};

/** 쭈그려 앉아 관찰.
 *  무릎각을 고관절각과 정확히 반대(k = -h)로 둬야 정강이가 수직이 되고 발끝이 바깥을
 *  향한다. h + k 가 0 에서 멀어지면 발이 정강이와 함께 회전해 뒤로 꺾인다. */
export const CROUCH_FEET = 955;
export const CROUCH: Pose = {
  headTilt: -7, lean: 9,
  armL: { s: 30, e: 44 }, armR: { s: -26, e: -48 },
  legL: { h: 76, k: -76 }, legR: { h: -76, k: 76 },
  feetVb: CROUCH_FEET,
};

/** 이름 -> 포즈. 카탈로그·에디터에서 목록으로 훑을 때 쓴다 */
export const POSES = {
  idle: IDLE,
  pointUp: POINT_UP,
  shrug: SHRUG,
  count: COUNT,
  surprised: SURPRISED,
  measure: MEASURE,
  present: PRESENT,
  thinking: THINKING,
  wave: WAVE,
  wide: WIDE,
  cheer: CHEER,
  touchNeck: TOUCH_NECK,
  waveBye: WAVE_BYE,
  crouch: CROUCH,
} as const;

export type PoseName = keyof typeof POSES;
