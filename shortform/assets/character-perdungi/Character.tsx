/** 퍼둥이 캐릭터 SVG 본체 - v5 (부위 분리 리깅, 2026-08-10).
 *
 *  v1~v3는 원본 PNG를 cv2 컨투어·육안 판독으로 "재실측"해서 손으로 베지어를 새로 그렸다가
 *  충실도 지적을 받았다. v4는 외부 AI가 정밀 벡터 트레이싱한 9개 포즈 SVG(`poseArt.ts` 참고)
 *  의 `<path d>` 값을 재해석 없이 그대로 옮겨 "포즈 전체를 하나의 완성 그림으로 스위칭"하는
 *  방식으로 바꿨다. 그 결과 몸통 전체가 한 덩어리라 움직임이 딱딱하다는 피드백을 받았다.
 *
 *  v5는 v4의 원본 path 데이터(`poseArt.ts`, 불변)를 **좌표 재계산 없이 프로그램적으로
 *  재분류**해서 body/face/armRight를 독립된 그룹으로 나눴다(`poseRig.ts`, 생성 스크립트는
 *  svgpathtools로 각 path의 sub-path를 파싱해 위치·면적·winding으로 분류 - 눈대중 재작도 아님).
 *
 *  분리 성공 범위(포즈마다 다르다 - 원본에 실제로 있는 것만 분리했다):
 *   - face(눈+코+입 뭉치): lookback/think/wine/dizzy/stand/cry/pillarWide 7포즈에서 성공
 *     (원본에서 이미 몸통과 물리적으로 분리된 별도 잉크 영역이었다 - 절단 불필요).
 *     pillarNarrow/pillarPeek는 기둥에 얼굴이 가려 원본 자체가 몸통과 한 덩어리로 합쳐져
 *     있어 분리 불가(poseRig.ts 참고).
 *   - armRight(오른팔): stand/cry 2포즈에서만 성공. 원본 몸통 링이 팔까지 포함한 하나의
 *     연속 윤곽선이라, 팔이 몸통에 붙는 지점(진행 경로가 급격히 꺾이는 실제 정점)을 찾아
 *     그 정점에서 잘라 별도 링으로 재구성했다(이음매는 body 레이어 위에 겹쳐 그려 가려짐 -
 *     표준 2D 컷아웃 리깅 기법, 새 좌표 발명 아님). lookback/dizzy/wine에도 팔처럼 보이는
 *     부분이 있지만 몸통과의 경계가 이렇게 뚜렷하지 않거나 확신도가 낮아 이번 라운드에서는
 *     보류했다 - 억지로 자르면 원본과 다른 실루엣이 나올 위험이 있어서다.
 *   - 다리(leg): pillarWide/Narrow/Peek 3포즈에만 다리 형태가 있고, 나머지 6포즈(이번
 *     파일럿이 쓰는 stand/lookback/dizzy/cry 포함)는 원본 자체가 다리 없는 몸통 실루엣이다.
 *     없는 걸 새로 그려 붙이지 않았다.
 *   - 눈 좌우 분리: 시도했으나 원본에서 두 눈이 눈썹 사이 다리로 연결된 하나의 윈딩
 *     그룹이라(같은 절단 기법이 필요) 이번 라운드에서는 face를 통째로만 분리했다.
 *
 *  `eyeOpen`/`mouthOpen`/`eyeWide`/`earPerk` 프레임 파라미터는 v4와 동일하게 미지원
 *  (귀는 여전히 몸통 실루엣에 고정 - 분리 안 됨). 대신 v5에서 새로 생긴 것:
 *   - body에 미세한 숨쉬기(scale 진동, 이 컴포넌트 전용 신규 구현 - anim.ts의 breathe 재사용
 *     아님. Actor.tsx가 이미 anim.ts breathe로 전신 bob을 주고 있어, 이 body-scale은 그 위에
 *     얹히는 추가 레이어다)
 *   - armRight가 있는 포즈(stand/cry)는 어깨 이음매(`armPivotRaw`)를 중심으로 살짝 흔들림
 *   - face가 있는 포즈는 아주 미세한 좌우 sway(독립 존재감)
 *   - 전부 frame 기반 결정적 사인파(Math.random 미사용)
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C } from '../theme';
import { POSE_ART, PoseId9, PoseArt } from './poseArt';
import { POSE_RIG, PoseRig } from './poseRig';

export type PoseId = PoseId9;
export { POSE_ART, POSE_RIG };
export type { PoseId9, PoseArt, PoseRig };

const n = (v: number) => Math.round(v * 100) / 100;

/** Actor.tsx 발끝 정렬용 - poseArt.ts 의 측정값을 그대로 노출한다. */
export const RIG = {
  CX_OF: Object.fromEntries(Object.entries(POSE_ART).map(([k, v]) => [k, v.cx])) as Record<PoseId9, number>,
  FEET_VB_OF: Object.fromEntries(Object.entries(POSE_ART).map(([k, v]) => [k, v.feetY])) as Record<PoseId9, number>,
} as const;

/** 얼굴(눈+코+입 뭉치) 중심 - InkSplatFace 등 이펙트 타겟팅용. poseArt.ts 참고. */
export const FACE_OF: Record<PoseId9, { x: number; y: number }> = Object.fromEntries(
  Object.entries(POSE_ART).map(([k, v]) => [k, { x: v.faceX, y: v.faceY }])
) as Record<PoseId9, { x: number; y: number }>;

export interface PerdungiPose {
  /** 9개 원본 포즈 중 하나. 기본 'stand'(가장 무난한 정지 자세). */
  pose?: PoseId9;
  /** 몸 전체 기울임(도) - path는 건드리지 않고 group rotate만 적용한다. */
  lean?: number;
}

export interface CharacterProps extends PerdungiPose {
  width: number;
  height?: number;
  /** 단색 잉크 색상(원본 fill=#000000 대체). 기본 C.ink. */
  color?: string;
  style?: React.CSSProperties;
}

export const DEFAULT_POSE: PerdungiPose = { pose: 'stand', lean: 0 };

/** body 숨쉬기 - 이 컴포넌트 전용 신규 구현(anim.ts의 breathe 재사용 아님).
 *  진폭을 아주 작게(1.5%) 잡아 Actor.tsx가 이미 주는 전신 bob 위에 얹히는 미세 층으로만
 *  작동하게 한다. frame만의 함수라 결정적이다. */
function bodyBreathScale(frame: number): number {
  return 1 + 0.015 * Math.sin((frame / 44) * Math.PI * 2);
}

/** 팔 미세 흔들림 - 어깨 이음매(armPivotRaw) 중심 회전각(도). */
function armSwayDeg(frame: number): number {
  return Math.sin((frame / 37) * Math.PI * 2 + 0.6) * 2.4;
}

/** 얼굴(눈+코+입 뭉치) 미세 sway - 아주 살짝 좌우 이동(원본 좌표계 단위, gTransform 이전이라
 *  10배 스케일임에 유의 - 최종 화면 기준 ±0.5px 안팎이 되도록 작게 잡았다). */
function faceSwayRaw(frame: number): number {
  return Math.sin((frame / 53) * Math.PI * 2 + 2.1) * 3.5;
}

export const Character: React.FC<CharacterProps> = ({
  width, height, color = C.ink, style, pose = 'stand', lean = 0,
}) => {
  const frame = useCurrentFrame();
  const art = POSE_ART[pose];
  const rig: PoseRig = POSE_RIG[pose];
  const h = height ?? width * (art.vbH / art.vbW);

  const breath = bodyBreathScale(frame);
  // 몸통 scale 중심: 발끝 위쪽 절반 지점 근처(허리~가슴 부근)를 원점으로 잡아야 발이 안 뜬다
  const bodyPivotX = n(art.cx);
  const bodyPivotY = n(art.feetY * 0.62);

  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${art.vbW} ${art.vbH}`}
      style={{ overflow: 'visible', ...style }}
    >
      {/* lean: path 데이터는 그대로 두고 바닥 중심점 기준으로만 회전시킨다 */}
      <g transform={`rotate(${n(lean)} ${n(art.cx)} ${n(art.feetY)})`}>
        {/* 원본 <g transform="translate(0,H) scale(0.1,-0.1)"> 그대로 - potrace 좌표계 복원.
            fill만 원본 #000000 대신 color prop을 쓴다. */}
        <g transform={art.gTransform} fill={color} stroke="none">
          {/* body: 숨쉬기 scale 진동 (독립 그룹) */}
          <g
            transform={`translate(${bodyPivotX} ${bodyPivotY}) scale(${n(breath)}) translate(${-bodyPivotX} ${-bodyPivotY})`}
          >
            {rig.body.map((d, i) => (
              <path key={`b${i}`} d={d} />
            ))}
          </g>
          {/* armRight: 어깨 이음매 중심 미세 회전 (분리 성공한 포즈만) */}
          {rig.armRight && rig.armPivotRaw && (
            <g transform={`rotate(${n(armSwayDeg(frame))} ${n(rig.armPivotRaw.x)} ${n(rig.armPivotRaw.y)})`}>
              {rig.armRight.map((d, i) => (
                <path key={`a${i}`} d={d} />
              ))}
            </g>
          )}
          {/* face: 눈+코+입 뭉치 미세 sway (분리 성공한 포즈만) */}
          {rig.face && (
            <g transform={`translate(${n(faceSwayRaw(frame))} 0)`}>
              {rig.face.map((d, i) => (
                <path key={`f${i}`} d={d} />
              ))}
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

export default Character;
