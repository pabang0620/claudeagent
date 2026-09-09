# 빌드 보고 - general-ep36-milk-curdling (우유가 상하면 덩어리지는 이유)

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시). `episode-en.mp4`는 만들지 않는다.

## 자산

### 재사용 (REGISTRY 대조 후 재사용, 신규 제작 없이)
- `character/Actor.tsx`(`BustActor`), `character/poses.ts`(`POSES.idle`/`POSES.surprised`)
- `props/IceFloatCup.tsx` - 유리컵(`mode='liquid'`, `liquidColor` 오버라이드로 우유색 표현)
- `props/ThemedIcon.tsx` - 아이콘 `milk`, `lemon-2`(둘 다 기존 `tabler-cache.json`에 이미 캐시돼 있어 새로 sync하지 않음)
- `scenes/Caption.tsx`(`Caption`, `Label`), `scenes/PopIn.tsx`(`PopIn`), `backgrounds/PlainBg.tsx`
- `brand/Intro.tsx`, `brand/Outro.tsx`, `scenes/TitleCard.tsx`
- `audio/water_splash.mp3`(s1 붓는 소리), `audio/bubble_pop.mp3`(s6 응고 순간), `audio/intro_ding.mp3`, `audio/outro_ding.mp3`
- `scripts/tts.py`, `scripts/rms_mouth.py`, `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`)

### 신규 제작 (REGISTRY 등록 완료)
- `props/MilkCurdleDiagram.tsx` - `MilkCurdleDiagram`(세균이 당분을 먹고 산성 물질을 만들고, 그 산성화로 단백질 입자 4개가 흩어진 상태에서 서로 뭉쳐 하나의 덩어리가 되는 과정을 보여주는 확대 다이어그램)과 `MilkClump`(컵 수면 위에 얹는 "뭉친 덩어리" 오버레이, s1/s5/s6 매크로 샷에 재사용)를 함께 담았다. 사유: 대본이 "신규"로 지정했고, REGISTRY 4절을 직접 대조한 결과 `CellMergeDiagram`(2개 요소가 만나 반응)·`SoapMicelleDiagram`(특수 분자가 물질을 감싸 뭉침)은 각각 구조가 달라 "고르게 퍼진 여러 입자가 하나의 조건에 따라 서로 모여 하나로 합쳐진다"는 다대일 응집 구조를 그대로 재사용할 수 없었다(대본 자체 자기검토도 이 판단을 기록해뒀다). `CellMergeDiagram`의 "독립 progress로 단계를 나눈다" 설계 원칙은 그대로 따랐다.
- REGISTRY.md 4절(소품)에 등록 완료(기존 줄 보존, 끝에 한 줄 추가). `assets/props/index.ts`에도 export 추가(기존 줄 보존).
- 요거트 통(`YogurtTub`)·치즈 조각(`CheeseWedge`)은 이 화 s7 전용 단순 장식 도형이라 라이브러리로 승격하지 않고 `episodes/general-ep36-milk-curdling/src/scenes.tsx`에 로컬로 두었다(REGISTRY 규칙 2 - "이 화에서만 성립한다" 판단).

## 시각 표현 원칙 준수
- 세균은 점 무리가 아니라 도형 1마리(몸통+눈2개+미소, DoughDiagram 효모와 동일 설계)로, 산성 물질도 최대 3개의 큰 원으로만 표현했다. 프레임 검수에서 확대해 봐도 징그럽지 않고 귀엽게 보이는 것을 확인했다(f011/f012/f014/f015 - 젖산·카세인 장면).
- 단백질(카세인)은 큰 원 4개가 흩어져 있다가 서로 겹쳐 하나의 덩어리로 보이는 방식(CellMergeDiagram과 동일한 "원이 이동해 겹친다" 기법)으로 표현했고, 곰팡이·불쾌한 질감은 전혀 그리지 않았다.

## 언어별 실측 길이 (한국어만)

02-script-final-ko.md 참고. 요약:

| 구간 | 실측(초) | 여백(초) | 프레임 |
|---|---|---|---|
| s1(무성) | 3.000(추정) | 0.2 | 96 |
| s2(리액션, rate+32%/pitch+55Hz) | 4.104 | 0.6 | 141 |
| s3 | 7.104 | 0.2 | 219 |
| s4 | 7.488 | 0.2 | 231 |
| s5 | 3.720 | 0.2 | 118 |
| s6 | 5.448 | 0.2 | 169 |
| s7 | 4.368 | 0.2 | 137 |

본편 합계 1111프레임(37.033초) + Intro 69(2.3초) + TitleCard 54(1.8초) + Outro 90(3.0초) = 총 1324프레임.
**ffprobe 실측 재생시간: 44.181초.**

영어판은 만들지 않으므로 언어 간 길이 비교는 해당 없음.

## 렌더 횟수
- 한국어 2회 (`episode-ko.mp4` 1차, `episode-ko-v2.mp4` 2차 - s2 자막-소품 겹침 결함 수정 후 재렌더).

## 검수 체크리스트 (관찰 기록, 한국어만)

`sceneStarts`/`sceneFrames` 실측으로 계산한 구간별 시작+중간+끝 프레임(1324프레임 mp4, v2 기준)을 ffmpeg로 추출해 Read 도구로 직접 확인했다.

- [x] **자막 화면이탈**: f001~f025(전 구간 대표 프레임) 전체 확인. 모든 캡션이 `maxWidth=900` 박스 안에 들어오고 좌우 잘림 없음. 가장 긴 문장(s3 "우유가 오래되면 세균이 우유 속...")도 2줄 이내로 자동 줄바꿈되어 박스 폭을 넘지 않음.
- [x] **장면 전환 캐릭터 잔상**: SceneSwitcher 전환 경계(각 구간 시작+2프레임, f003/f006/f009/f013/f016/f019/f022)를 먼저 뽑아 확인 - 진입 크로스페이드(fadeIn=8프레임) 중이라 화면이 옅게 보이는 것은 정상 동작(원래 그렇게 설계됨)이지 잔상이 아님을 확인. 잔상(이전 장면 요소가 겹쳐 남는 현상)은 관찰되지 않음.
- [x] **등장 전 요소가 점처럼 남는 문제**: MilkCurdleDiagram의 모든 레이어(`bacteriaProgress`/`acidProgress`/`proteinAppear`/`curdProgress`)가 `opacity`/`local<=0.001` 가드로 처리돼 있어 f009(s3 시작 직후)에서 세균·산성물질이 아직 안 보이는 상태를 확인. PopIn(s7 요거트·치즈)도 progress<=0.001에서 렌더 안 함.
- [x] **라벨이 화면 밖에서 잘림**: "젖산"(f011)·"카세인"(f013/f014) 라벨 모두 다이어그램 박스 아래(DIAG_LABEL_Y=1020)에 위치, 화면 안전영역 안에 있고 잘리지 않음.
- [x] **요소끼리 겹침**: **1차 렌더(f006, s2 시작+2프레임 상당 프레임)에서 결함 발견** - S2Question에 넣었던 작은 컵+MilkClump 소품이 화면 하단 캡션 박스와 겹쳤다(컵 시각적 높이가 캐릭터 하단과 캡션 안전영역 사이 좁은 틈에 들어가지 않음). **원인**: IceFloatCup 폭 대비 높이 비율(약 2.07배)을 고려하지 않고 캡션 영역(`CAP_BOTTOM=300`, 실측 박스 상단 y≈1400~1500) 바로 위에 배치. **조치**: s2 리액션 샷에서 이 소품을 제거(s1에서 이미 덩어리진 우유를 충분히 보여줬으므로, ep33 S2Question 등 다른 화의 리액션 바스트샷 관례처럼 캐릭터만 노출)하고 재렌더(v2). v2의 s2 프레임(frames-ko-v2/s001~s003)에서 겹침이 사라진 것을 확인.
- [x] **화면 하단 여백 과다**: 모든 구간이 캐릭터/컵/다이어그램을 화면 세로 중앙~하단까지 채우고 있고(s1 컵 y=560~1330대, s3/s4 다이어그램 y=330~950, s5/s6 컵 y=380~1250대, s7 아이콘 y≈610~910), 안전영역 안에서 과도한 빈 공간은 관찰되지 않음.
- [x] **음량**: `loudnorm=print_format=summary` 측정 - Input Integrated -13.3 LUFS, Input True Peak -0.1 dBTP(클리핑 없음, 다만 s6의 bubble_pop+내레이션 동시 재생 구간이 전체 영상에서 가장 큰 순간피크). 너무 작지 않음.
- [x] **자막 스타일**: `assets/theme.ts`의 `FS.caption`(50px)·`CAPTION_STYLE`을 그대로 사용, 프로필 지정 위치(화면 하단에서 위로 약 23%)·색(흰 배경+검은 외곽선)과 일치.
- [x] **화면 문자열 언어별 분기**: 영어판을 만들지 않으므로 ko/en 대조는 해당 없음. 화면에 등장하는 모든 문자열(제목·라벨 "젖산"/"카세인"·아웃트로 문구)이 `strings.ts`의 `STRINGS.ko`에서만 읽히고 컴포넌트에 하드코딩되지 않았음을 소스 검토로 확인.
- [x] **캐릭터 윤곽선-배경 대비**: 배경이 전 구간 밝은 `PlainBg`(하늘색-흰색 그라데이션)라 `C.ink` 스트로크가 명확히 구분됨(f002/f025 인트로·아웃트로, f006/mo001 s2 리액션에서 확인). 어두운 배경 구간 없음.

## 효과음 검증 (원칙 7, 객관적 지표)
- `water_splash.mp3`(s1, 우유 붓는 순간): 무음 구간(t=3.5~4.0s, max -91dB) 대비 SFX 재생 구간(t=4.4~5.0s, max -8.7dB)에서 명확한 에너지 상승 확인.
- `bubble_pop.mp3`(s6, 레몬즙으로 응고되는 순간): 재생 직전 구간(t=30.6~31.0s, 대사 사이 무음, max -91dB) 대비 SFX 구간(t=32.2~32.5s, max -0.1dB)에서 뚜렷한 피크 확인.
- 효과음 개별 피크가 내레이션 피크보다 낮은지: `bubble_pop.mp3`에 Remotion `volume=0.85` 적용 후 실측 피크 -3.1dB, `ko_s6.mp3`(해당 구간 내레이션)에 `volume=1.6` 적용 후 실측 피크 0.0dB로, 효과음이 내레이션보다 확실히 낮음을 확인.
- 실제로 듣기 좋은지·타이밍이 체감상 자연스러운지는 사용자가 직접 들어 확인 바람 - 이 항목은 이 에이전트가 판정하지 않는다.

## 배포
기술적 검증(위 체크리스트)을 통과해 별도 승인 질문 없이 곧바로 배포했다(2026-09-02 정책).

- 배포 경로: `/home/lee/project/shorts/ko/[36화] 우유가 상하면 덩어리지는 이유.mp4`
- md5 대조로 배포본과 렌더본이 동일함을 확인 후, `episodes/general-ep36-milk-curdling/out/`의 mp4(episode-ko.mp4, episode-ko-v2.mp4)는 정책에 따라 삭제. `out/frames-*/`(검수용 프레임)는 남겨둠.

**주의: 위 체크리스트는 이 에이전트가 관찰한 기술적 사실이다. "검수 통과"·"합격"이라는 최종 판정이 아니며, 실제로 이 영상을 써도 되는지는 사용자가 직접 확인해야 한다.**
