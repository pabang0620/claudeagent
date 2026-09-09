# 71화 빌드 리포트 - 식은 밥이 딱딱해지는 이유

## 자산

- 새로 만든 자산: `props/StarchGranuleDiagram.tsx` 1개 (전분 팽윤+노화 다이어그램, `swellProgress`/`retrogradeProgress`). REGISTRY.md 추록 절에 등록 완료, `assets/props/index.ts`에 export 추가 완료.
- 재사용한 자산: `backgrounds/PlainBg`, `scenes/Caption`·`Label`, `scenes/CompareBars`, `props/MicrowaveDiagram`(ep31, 물 분자 진동 - "다시 데워 물+열을 만난다"에 그대로 재사용), `props/ThemedIcon`("snowflake"), `assets/brand/Intro`·`Outro`, `assets/scenes/TitleCard`, `assets/timeline.ts`(sceneFrames/sceneStarts/buildCaptions/wrapCounts), `assets/anim.ts`(breathe/clamp01/progress).
- 이 화 전용(REGISTRY 미등록) 소도구: `BowlRim`·`RiceMound`(밥그릇·밥알 뭉치, `src/scenes.tsx` 내부). ep69의 `ExamPaper`와 같은 판단 - 재사용 가능성보다 이 장면 전용 장식에 가까워 등록하지 않음.

## 언어별 실측 길이

한국어판만 제작(원칙 6 - 영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시). 영어판 없음.

- 구간별 실측: `02-script-final-ko.md` 표 참고. 본편 1307프레임(43.57초).
- 전체: Intro(69) + TitleCard(54) + 본편(1307) + Outro(90) = 1520프레임 = 50.667초(계산상). 실측 mp4 컨테이너 길이 50.731초(ffmpeg 반올림 차이 수준).
- 대본 원안 추정(약 52초) 대비 실측이 조금 짧게 나왔으나 장면을 늘리지 않고 그대로 냈다(원칙 4). 프로필 상한(60초) 이내.

## 기술 점검 (원칙 5)

`node scripts/precheck.mjs episodes/general-ep71-rice-hardening` 결과: **에러 0 / 경고 1**.
- 경고 `SHAREDOUT`: 공용 루트 `shortform/out/`에 `frames-ko/`·`frames-en/`가 있다는 경고. 확인 결과 이 화(71화)가 만든 것이 아니라 동시 진행 중인 다른 화의 잔재로 보이며, 이 화의 산출물은 전부 `episodes/general-ep71-rice-hardening/out/` 안에만 있는 것을 확인했다(지우지 않고 그대로 둠 - 다른 화 소유일 가능성).

`npx tsc --noEmit` 결과: 이 화의 신규 파일(`StarchGranuleDiagram.tsx`, `episodes/general-ep71.../src/*`)에서 발생한 에러는 0개. 출력에 잡힌 다른 에러(`unused variable` 계열, `AirplaneWingDiagram.tsx` 등)는 전부 이 화 이전부터 존재하던 다른 파일의 기존 결함으로, 이번 작업과 무관해 손대지 않았다.

### 스틸 선점검 (렌더 전, 결함을 여기서 잡음)

`npx remotion still`로 각 구간의 시작·중간·끝 프레임을 렌더 전에 확인했다. **여기서 발견해 렌더 전에 고친 문제는 없었다** - 다만 검증 과정에서 다음을 확인:
- s3(전분 재결합) 마지막 프레임(retrogradeProgress≈0.98)에서는 물-화살표가 이미 다 빠져나가 페이드아웃된 뒤라 화살표가 안 보이는 것이 정상 동작임을 중간 프레임(retrogradeProgress≈0.5, 물이 빠져나가는 화살표가 뚜렷이 보임)과 대조해 확인했다.
- 프레임 번호를 처음 계산할 때 인트로(69F)+타이틀카드(54F) 오프셋을 s2 이후 구간에 누적 반영하지 않아 s2용으로 뽑은 스틸 2장이 실제로는 s1(직전 장면)을 보여주는 것을 발견 - `node -e`로 `sceneFrames`/`sceneStarts`를 직접 계산해 전 구간 global 프레임 범위를 표로 뽑은 뒤 재확인해 바로잡았다(렌더 전 단계, 실제 렌더에는 영향 없음 - 프레임 선택 실수였지 코드 결함이 아니었음).

### 렌더 후 발견한 문제

없음. 최종 mp4에서 대표 프레임 2장(f001=타이틀카드, f008=s7 냉장/냉동 비교)을 ffmpeg로 추출해 Read로 확인한 결과 스틸 선점검 때 본 것과 동일하게 정상 렌더링됨을 확인했다.

## 검수 체크리스트 (관찰 기록)

- [x] **자막이 화면 밖으로 나가지 않는가**: s1~s7 전 구간 대표 프레임에서 자막 박스가 좌우 여백을 두고 화면 안에 들어옴을 확인(`CAP_SIDE`/`CAP_BOTTOM` 기본값 그대로 사용, 커스텀 폭 조정 없음).
- [x] **장면 전환 시 캐릭터 잔상**: 이 화는 캐릭터가 등장하는 구간이 없어(전부 다이어그램/소품 클로즈업) 해당 없음.
- [x] **등장 전 요소가 점처럼 남아 있지 않은가**: RiceMound·StarchGranuleDiagram 모두 `opacity` 기반 등장(스케일 0 방식 미사용)이라 등장 전 잔점 없음. f133/f203(s1), f300/f435(s2) 프레임에서 확인.
- [x] **라벨이 화면 밖에서 잘리지 않는가**: s2~s7 각 Label을 f143(취소), f300, f435, f480, f550, f635, f669, f748, f761, f876, f996, f1007, f1092, f1197, f1417 프레임에서 확인 - 전부 화면 안에 들어오고 잘림 없음.
- [x] **요소끼리 겹치지 않는가**: s5(f876/f996)에서 MicrowaveDiagram·RiceMound·CompareBars 게이지가 세로로 겹치지 않게 배치됨을 확인(y=370/1060/1260 순).
- [x] **화면 아래쪽 여백이 과다하지 않은가**: 라벨(y=300)-다이어그램(중앙~하단)-캡션(y≈1600대) 배치로 이 채널의 기존 화들(ep68·ep69)과 동일한 여백 패턴. 하단 여백이 과도하게 비어 있지는 않음(캡션이 항상 하단 안전영역에 위치).
- [x] **음량이 충분한가**: `ffmpeg loudnorm` 측정 결과 Input Integrated -13.6 LUFS, Input True Peak -2.3 dBTP. 너무 작지 않고 클리핑도 없음.
- [x] **자막이 프로필 스타일(폰트·크기·위치)을 따르는가**: `Caption` 컴포넌트를 커스텀 없이 그대로 사용(별도 fontSize/side override 없음).
- [x] **캐릭터 윤곽선 대비**: 캐릭터가 등장하는 장면은 인트로/타이틀카드/아웃트로뿐이고 전부 밝은 배경(`C.sky`/`C.paper`) 위 기본 스트로크라 해당 결함 유형 없음.
- 영어판 미제작이라 "화면 문자열 언어별 분기" 체크는 해당 없음(원칙 6 예외).

### 프로필 추가 체크 (general.md 8절)

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가: 찬밥이 굳는 경험은 보편적이고 원인(전분 재결합)은 검색 없이는 잘 모르는 지식 - 부합.
- [x] 어미가 친근한 대화체("~거든요", "~것 같아요")를 유지: 대본 문장 그대로 사용(수정 없음), "~거든요/~해요/~죠" 톤 확인.
- [x] 전문용어가 등장 자리에서 바로 풀렸는가: "전분 알갱이"는 화면 라벨+시각화로 즉시 풀이됨. "노화" 같은 학술 용어는 대본에 아예 등장하지 않아 풀이가 필요한 용어 자체가 없음.
- [x] 자막 한 줄 20자(한국어) 이내: `wrapCounts` 기본값 그대로 사용(커스텀 상한 없음).
- [x] 60초 상한: 50.73초로 상한 이내.

## 렌더 횟수

- 스틸(정지 프레임): 15장 선점검 + 2장 보정 + 1장 중간확인 + 2장(타이틀/아웃트로) = 20장.
- 전체 mp4 렌더: **1회** (한국어판, 재렌더 없음).

## 배포

- 배포 경로: `/home/lee/project/shorts/ko/[71화] 식은 밥이 딱딱해지는 이유.mp4`
- 배포 직후 md5 대조 완료(일치 확인), `episodes/general-ep71-rice-hardening/out/`의 mp4는 삭제함. `out/frames-ko/`·`out/stills/`는 보존.
- 영어판(`shorts/en/`)은 만들지 않음 - 원칙 6 예외 적용.

이 보고는 관찰된 사실까지만 정리한 것이고, "검수 통과"·"합격" 여부의 최종 판단은 사용자 몫이다.
