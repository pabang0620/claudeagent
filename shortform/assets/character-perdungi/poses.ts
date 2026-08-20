/** 퍼둥이 포즈 프리셋 - v4 (9포즈 대응, 2026-08-10).
 *
 *  v4는 원본 SVG 9개가 이미 완성된 포즈 아트워크라 v2/v3처럼 "1개 중립 포즈 + eyeWide/
 *  mouthOpen 파라미터로 표정 합성" 방식을 쓰지 않는다. 대신 스토리 비트마다 맞는 포즈를
 *  9개 중에서 고르는 방식이다(Character.tsx 상단 주석 참고).
 */
import { PerdungiPose, PoseId9 } from './Character';

/** 9개 원본 포즈 전부를 lean=0 기본값으로 그대로 노출한다. 다른 화에서 이 캐릭터를 쓸 때
 *  표준 포즈 세트로 재사용한다. */
export const PERDUNGI_POSES: Record<PoseId9, PerdungiPose> = {
  lookback: { pose: 'lookback' },
  think: { pose: 'think' },
  wine: { pose: 'wine' },
  dizzy: { pose: 'dizzy' },
  stand: { pose: 'stand' },
  cry: { pose: 'cry' },
  pillarWide: { pose: 'pillarWide' },
  pillarNarrow: { pose: 'pillarNarrow' },
  pillarPeek: { pose: 'pillarPeek' },
};

/** 오징어 먹물 파일럿(perdungi-pilot-squid-ink) 전용 - 스토리 비트별로 고른 포즈.
 *  - feed(먹인다): 차분히 서서 먹이는 느낌 -> stand
 *  - watch(지켜본다): 몸을 틀어 기대하며 주시 -> lookback(원본 "왼쪽을 바라보며 앉아있는
 *    자세, 손가락 팔 제스처"가 지켜보는 동작과 잘 맞는다)
 *  - impact(명중 직후): 놀라서 어지러운 반응 -> dizzy(원본에 별 표시가 있어 충격 표현에 맞음)
 *  - aftermath(리액션): 먹물이 흘러내리는 멍한 슬픔 -> cry(원본에 눈물/웅덩이가 있어 "흘러
 *    내림" 연출과 그대로 맞아떨어진다) */
export const SQUID_PILOT_BEAT_POSE: Record<'feed' | 'watch' | 'impact' | 'aftermath', PoseId9> = {
  feed: 'stand',
  watch: 'lookback',
  impact: 'dizzy',
  aftermath: 'cry',
};
