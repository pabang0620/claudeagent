# REGISTRY.md 추가분 (오케스트레이터가 배치 종료 후 병합)

이 화(general-ep103-horse-standing-sleep)에서 만든 신규 자산. 원칙 0에 따라 REGISTRY.md에
직접 쓰지 않고 여기 별도 파일로 남긴다.

## props

| id | 종류 | 파일경로 | 파라미터(props) | 한 줄 설명 | 최초 사용 에피소드 |
|---|---|---|---|---|---|
| Horse | 소품(동물) | `props/Horse.tsx` | `width` `x` `y` `eyesClosed`(0~1) `stroke` `fill` `spot` `silhouette` `strokeWidth` `style`, 별도 export `HORSE_STANDING_VB_W/H` `HORSE_STANDING_GROUND_VB` | 서 있는 말(측면) 실루엣. `eyesClosed`로 뜬 눈<->조는 눈(감은 곡선)을 블렌드. 참고 이미지 없이 채널 스타일로 새로 그린 순수 도형(원칙 0-1 대상 아님) - 동물 편 전반 재사용 가능 | general-ep103 |
| HorseLying | 소품(동물) | `props/Horse.tsx` (Horse와 같은 파일) | `width` `x` `y` `stroke` `fill` `spot` `silhouette` `strokeWidth` `style`, 별도 export `HORSE_LYING_VB_W/H` | 작게 곁들이는 누운 말 실루엣(항상 눈 감음, "하루 중 잠깐은 누워야 한다"류 장면에서 서 있는 말 옆에 소품으로 재사용 가능) | general-ep103 |
| HorseLegLockDiagram | 소품(다이어그램) | `props/HorseLegLockDiagram.tsx` | `width` `x` `y` `lockProgress`(0~1) `muscleFadeProgress`(0~1) `stroke` `fill` `style` | 말 다리 클로즈업 - 무릎·발목 관절에 힘줄·인대가 걸쇠(자물쇠)처럼 고정되는 구조 + 넓적다리 근육 하이라이트가 옅어지는 것(근육 힘을 거의 안 씀)을 보여주는 다이어그램. 자물쇠 아이콘은 tabler-cache.json에 'lock'이 없어 직접 그린 단순 모양(몸체+고리+열쇠구멍)으로 대체(공용 아이콘 캐시 동시 수정 충돌 회피). `LegNerveDiagram`과 같은 설계 원칙(단순 캡슐 실루엣 + 상태 오버레이) - 관절이 잠겨 고정되는 구조를 보여주는 다른 소재(다른 동물의 스테이 장치, 기계식 걸쇠 등) 전반 재사용 가능성 있음 | general-ep103 |

## 오디오

신규 효과음 없음. 기존 공용 효과음만 재사용:
- `leaf_rustle.mp3` (야외 무성 구간 배경음) - s1 초원 무성 구간에 재사용
- `intro_ding.mp3` / `outro_ding.mp3` - 인트로·아웃트로 공용 브랜드 사운드

## 비고

- 걸쇠(lock) 아이콘: `tabler-cache.json`에 'lock'/'lock-open' 없음을 확인(2026-09-27). 배치
  병렬 작업 중 공용 캐시 파일(JSON) 동시 수정 충돌을 피하기 위해 `sync_icons.mjs`를 돌리지
  않고 `HorseLegLockDiagram.tsx` 안에 직접 그린 단순 자물쇠 모양으로 대체했다(대본이 명시한
  대체 지시를 따름). 오케스트레이터가 이후 'lock' 아이콘을 캐시에 추가하더라도 이 다이어그램은
  그대로 두면 된다(이미 완성된 자체 도형이라 교체 불필요).
