/** 자산 라이브러리 진입점.
 *
 *  에피소드 코드는 하위 파일을 직접 import 하지 말고 여기서 가져온다.
 *  (자산 위치가 바뀌어도 에피소드를 고칠 일이 없게 한다)
 *
 *    import { Actor, POSES, Caption, SavannaBg, Intro, C } from '../../assets';
 */

/* 토큰·유틸 */
export * from './theme';
export * from './anim';
export * from './timeline';
export { FontLoader, DEFAULT_FONTS } from './FontLoader';
export type { FontSpec } from './FontLoader';

/* 캐릭터 */
export {
  Character, CharacterGroup, RIG, DEFAULT_POSE, armIK, armStretch, handPos,
  dir, mouthPathD, eyeRy, BUST_VIEWBOX, MINI_VIEWBOX,
} from './character/Character';
export type { CharacterProps, Pose, ArmAngles, LegAngles } from './character/Character';
export * from './character/poses';
export { Actor, BustActor, MiniCharacter } from './character/Actor';
export type { ActorProps, BustActorProps } from './character/Actor';

/* 씬·소품·배경·브랜드 */
export * from './scenes';
export * from './props';
export * from './backgrounds';
export * from './brand';
