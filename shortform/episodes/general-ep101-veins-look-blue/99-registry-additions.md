# REGISTRY.md 추가분 (general-ep101-veins-look-blue)

배치 규칙에 따라 REGISTRY.md/assets/props/index.ts를 직접 수정하지 않았다. 아래를
오케스트레이터가 배치 종료 후 REGISTRY.md 3절(소품)·7절(오디오) 및 assets/props/index.ts에
일괄 반영한다.

## 신규 소품 (`assets/props/VeinLightDiagram.tsx`)

| id | 종류 | 파일경로 | 파라미터(props) | 한 줄 설명 | 최초 사용 에피소드 |
|---|---|---|---|---|---|
| ArmVein | 소품 | `props/VeinLightDiagram.tsx` | `width` `x` `y` `reveal`(0~1, 겉보기 파란 핏줄 -> 단면 속 빨간 피) `showBadges`(X/O 배지 표시) `stroke` `fill` `style` | 손등 실루엣 + 핏줄. reveal로 겉보기(파랑)와 단면 속 실제(빨강)를 연속 전환, X(오해)/O(사실) 배지 포함 | general-ep101 |
| SkinLightCrossSection | 소품 | `props/VeinLightDiagram.tsx` | `width` `x` `y` `blueBounce`(0~1) `redPenetrate`(0~1) `toEye`(0~1, 지정 시 눈 아이콘 등장) `stroke` `style` | 피부 단면 옆모습(표피/진피 2단 단순화) + 파란빛 반사/빨간빛 흡수/눈까지 도달을 화살로 표현 | general-ep101 |
| VeinDepthCompare | 소품 | `props/VeinLightDiagram.tsx` | `width` `x` `y` `progress`(0~1) `stroke` `style` | 얕은 핏줄(밝은 파랑) vs 깊은 핏줄(어두운 남색) 비교 + 자체 그린 간단 주사기 도형 | general-ep101 |

부가 export: `VEIN_SURFACE_BLUE`(피부 위로 비쳐 보이는 핏줄 색, ArmVein·SkinLightCrossSection
공유), `BLOOD_RED`(=C.coral, 실제 피 색). `LightScatterDiagram.tsx`의 `LIGHT_BLUE`/`LIGHT_RED`를
"빛의 색"으로 그대로 재사용했다(새로 정의하지 않음).

REGISTRY 확인 사유(원칙 0): `props/Hand.tsx`는 손가락 클로즈업(주름·수축)만 다루고 손등
전체 실루엣·핏줄 경로가 없음. `props/LightScatterDiagram.tsx`는 대기 중 빛 산란(ep22) 전용이라
피부 조직 깊이별 흡수/반사 레이어가 없어 화살 연출 스타일과 색 상수만 재사용하고 컴포넌트는
신규 제작.

신체 표현 주의: 피부 단면을 사실적 의학 단면도로 그리지 않고 색 띠 2단(표피/진피)으로만
단순화, 혈관도 매끈한 캡슐 하나로만 표현(잔점·질감 반복 없음) - builder 신체 표현 원칙 준수.

## 오디오

신규 없음. 기존 `assets/audio/head_whoosh.mp3`를 s1(무성 줌인 구간) 효과음으로 재사용,
`assets/audio/intro_ding.mp3`/`outro_ding.mp3`를 기존 그대로 재사용. REGISTRY 오디오 절에
"head_whoosh - 무성 카메라 줌인/전환 연출 전반 재사용 가능" 항목이 이미 있다면 별도 추가 불필요,
없다면 이 화를 "재사용 확인 에피소드"로 추가.
