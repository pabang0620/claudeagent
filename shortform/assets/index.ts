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

/* 16:9(가로, 유튜브 롱폼) 포맷 전용 자산. 세로 9:16 자산과 이름이 겹치므로 Landscape 접미사로
 * 구분한다. 포맷은 프로필과 별개 축이다 - 어느 프로필이든 이 자산들을 골라 쓸 수 있다
 * (assets/REGISTRY.md 참고). 하위 폴더 index.ts(backgrounds/index.ts 등)에는 합치지 않는다 -
 * 이름이 겹쳐 `export *` 가 충돌한다. */
export { PlainBg as PlainBgLandscape } from './backgrounds/16x9/PlainBg';
export type { PlainBgProps as PlainBgLandscapeProps } from './backgrounds/16x9/PlainBg';
export { Intro as IntroLandscape, INTRO_FRAMES as INTRO_FRAMES_LANDSCAPE } from './brand/16x9/Intro';
export type { IntroProps as IntroLandscapeProps } from './brand/16x9/Intro';
export { Outro as OutroLandscape, OUTRO_FRAMES as OUTRO_FRAMES_LANDSCAPE } from './brand/16x9/Outro';
export type { OutroProps as OutroLandscapeProps } from './brand/16x9/Outro';
export {
  TitleCard as TitleCardLandscape, TITLE_CARD_FRAMES as TITLE_CARD_FRAMES_LANDSCAPE,
} from './scenes/16x9/TitleCard';
export type { TitleCardProps as TitleCardLandscapeProps } from './scenes/16x9/TitleCard';
