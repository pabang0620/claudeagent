# REGISTRY.md 등록 대기 (오케스트레이터가 배치 종료 후 병합)

이 화(general-ep102, "손가락 꺾을 때 뚝 소리 나는 이유")에서 새로 만든 자산 2개.
REGISTRY.md/assets/props/index.ts는 병렬 배치 충돌 방지를 위해 이 화 작업에서는
직접 수정하지 않았다(동봉 지시 2번). 아래 내용을 REGISTRY.md에 그대로 옮겨 등록해달라.

## 1. 소품 (assets/props/)

| id | 종류 | 파일경로 | 파라미터 | 한 줄 설명 | 최초 사용 에피소드 |
|---|---|---|---|---|---|
| JointCrackDiagram | 소품 | `props/JointCrackDiagram.tsx` | `width` `x` `y` `gapWiden`(0~1) `bubbleForm`(0~1) `bubbleDissolve`(0~1) `stroke` `fill` `liquidColor` `gasColor` `strokeWidth` `style`, 별도 export `JOINT_VB_W`/`JOINT_VB_H`/`JOINT_BONE_LABEL_PT`/`JOINT_BUBBLE_LABEL_PT` | 손가락 관절 단면(뼈 2개 + 관절낭 + 관절액). `gapWiden`으로 간격이 벌어지고, `bubbleForm`으로 흩어진 기체 방울 6개가 중앙 기포 하나로 합쳐지고, `bubbleDissolve`로 그 기포가 다시 작아지며 사라진다. REGISTRY 확인 완료 - `props/Hand.tsx`(관절 내부 구조 없음), `props/SodaCan.tsx`(캔 전용 좌표계)로는 재사용 불가해 신설. "밀폐된 액체 속 용해 기체가 압력 변화로 기포가 된다"는 구조를 갖는 다른 소재(탄산음료, 감압증 등) 재사용 가능 | general-ep102 |

## 2. 오디오 (assets/audio/)

| id | 파일경로 | 설명 | 길이 | 합성 레시피 | 재사용성 | 최초 사용 에피소드 |
|---|---|---|---|---|---|---|
| knuckle_crack | `audio/knuckle_crack.mp3` | 손가락 관절이 "뚝" 꺾이는 순간의 짧고 건조한 스냅음. 저음 감쇠 사인(뼈마디 울림) + 대역 노이즈 버스트(스냅 트랜지언트)를 겹침 | 0.14초 | `aevalsrc` 저음 감쇠 사인(`0.5*sin(2*PI*150*t)*exp(-60*t)`) + `anoisesrc=color=white`(highpass 2200Hz/lowpass 7000Hz, volume 0.7, afade in 1ms/out 90ms) 를 `amix` + `afade` out + `volume=-3dB` + `alimiter=limit=0.98`. 실측 max_volume -5.8dB(volumedetect) | **관절·뼈·마디가 꺾이거나 부딪히는 짧은 스냅음 전반 재사용 가능**(다른 관절 소재, 딱딱한 물체가 꺾이는 소리 등) | general-ep102 |
