# 26화 빌드 보고 - 비 온 뒤 유독 흙냄새가 진해지는 이유

**이번 배치는 영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 제작한다.** `episode-en.mp4`는 만들지 않는다.

## 동시 작업 주의사항 확인

- 25화(`general-ep25-mosquito-preference`)가 동시에 렌더 중이라는 안내에 따라 그 폴더는 전혀 건드리지 않았다.
- 렌더는 전부 `scripts/render.mjs`로 실행했고, 출력은 `episodes/general-ep26-petrichor/out/`에만 생성됨을 매 렌더마다 확인했다.
- `precheck.mjs`가 공용 루트 `shortform/out/`의 `SHAREDOUT` 경고를 냈으나, `ls -la`로 확인한 결과 `frames-en/`·`frames-ko/`의 타임스탬프가 2026-08-20 20:56으로 이번 세션 이전(작업 시작 전)의 잔여물이었다. 다른 화 소유 가능성이 있어 삭제하지 않고 그대로 두었다.
- `assets/REGISTRY.md`·`assets/props/index.ts`는 기존 줄을 건드리지 않고 끝(ScentWaves 다음 행)에 새 행만 덧붙였다.

## 자산

- 재사용: `character/Actor`(`Actor`, `BustActor`)·`character/poses`(idle, shrug), `backgrounds/PlainBg`, `scenes/Caption`(`Caption`, `Label`), `scenes/Card`(`Card`), `props/DoorFrame`, `props/ThemedIcon`(droplet), `props/ScentWaves`(general-ep25 신규 자산, 이번 화에서 처음 재사용 - "냄새가 퍼진다" 원 설계 의도 그대로 적용), `assets/brand/Intro`·`Outro`, `assets/scenes/TitleCard`, `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`), `assets/anim.ts`(`blendPose`/`progress`/`clamp01`), `audio/bubble_pop.mp3`(general-ep18 신규 자산, REGISTRY에 "막·거품이 순간 터지는 소리" 전반 재사용 가능이라 명시돼 있던 것을 정확히 그 용도로 재사용) - 총 13종
- 신규 제작: `props/WetSoilAerosolDiagram.tsx` 1종 (export: `WetSoilAerosolDiagram`, `WETSOIL_VB_W`, `WETSOIL_VB_H`, `WETSOIL_MOLECULE_LABEL_PT`)
  - REGISTRY.md 등록 여부: **등록 완료** (`assets/REGISTRY.md`의 props 표, "WetSoilAerosolDiagram" 행)
  - REGISTRY 사전 대조 결과: "액체가 다공성 표면에 부딪혀 안에 갇혀 있던 것이 공기 중으로 방출되는" 구조를 가진 기존 자산이 없어(4절 확인, `SoapMicelleDiagram`은 유화 구조라 다름) 신규 제작. 미생물·냄새 분자·흙 알갱이 텍스처 모두 "신체 표현은 최소한으로" 절(작은 점 무리 금지)을 지켜 큰 도형 소수로만 구성
  - 새로 만든 효과음 없음 - `bubble_pop.mp3`(general-ep18 산출물)를 REGISTRY에 명시된 재사용 용도 그대로 사용

## 시각 설계 메모 (오케스트레이터 지시 반영)

- "냄새·미생물을 작은 점 무리로 촘촘하게 뿌리지 않는다"는 지시에 따라, 미생물은 2마리(둥근 얼굴 + 눈 2개만)로, 냄새 분자(지오스민)는 최대 3개의 큼직한 별 모양 입자로, 흙 알갱이 텍스처조차 점이 아니라 큰 얼룩(ellipse) 4개로만 표현했다.
- 냄새가 퍼지는 장면(s1의 심호흡, s6의 방출, s7의 재확인)은 전부 `ScentWaves`(큰 물결 호 2~3개)로 통일해 "냄새는 물결선으로" 원칙을 시각적으로 일관되게 유지했다.
- s6의 빗방울 충격→공기방울 파열→분자 방출은 `WetSoilAerosolDiagram`의 `splashProgress` 하나가 내부적으로 5단계(낙하→충돌→팽창→파열→방출)를 스스로 나누도록 설계했다(`DoorFrame.crossProgress`와 동일 원칙). 파열 순간은 `s6BurstFrame()` 함수 하나로 계산해 화면의 파열 플래시와 `bubble_pop.mp3` 재생 프레임이 항상 같은 값을 쓰도록 했다(ep18의 `s7BurstFrame` 패턴 재사용).

## 언어별 실측 길이

한국어만 제작(영어 없음).

- 구간별 실측(edge-tts WordBoundary): s2 4.992s(rate+32%/pitch+55Hz) / s3 4.248s / s4 4.032s / s5 3.768s / s6 7.392s / s7 4.056s / s8 6.840s (s1은 무성 고정 2.0s)
- 내레이션 합계(s2~s8): 35.328초
- 본편(s1~s8) 총 길이: 39.68초(1180프레임) - 60초 상한 안
- 전체(Intro+TitleCard+본편+Outro): **46.43초(1393프레임, 1080x1920, 30fps)** - 실측 ffprobe 46.49초(반올림 오차). 상세 타임코드는 `02-script-final-ko.md`
- 리액션(s2, rate+32%/pitch+55Hz) → 설명(s3) 전환에 프로필 기본 여백(0.2s) 대신 확장 여백(0.6s) 적용(원칙 4)

## 렌더 횟수 (한국어)

2회
1. 최초 렌더 - 전체 구조·타이밍·립싱크 정상 확인. s4(지오스민 라벨) 프레임 검수 중 라벨 텍스트가 흙 블록 상단 테두리선과 겹쳐 읽기 어려운 결함 발견(`WETSOIL_MOLECULE_LABEL_PT` 기준 오프셋 -70px이 텍스트 높이 대비 부족)
2. 라벨 y오프셋을 -70 → -120으로 수정 후 재렌더(`episode-ko-v2.mp4`) - s4 프레임 재확인, 라벨이 흙 블록과 충분한 여백을 두고 표시됨을 확인. 최종본으로 채택해 배포

## 발견·수정한 결함

1. **s4 "지오스민" 라벨이 흙 블록 상단 테두리선과 겹침** - `Label`을 `WETSOIL_MOLECULE_LABEL_PT`에서 y축으로 -70px만 띄웠는데, 폰트 크기 54px 텍스트의 실제 높이(중심 기준 상하 약 32px)가 흙 블록 상단(화면 y≈720)까지의 여유(25px)보다 커서 텍스트 하단이 테두리선을 가로질렀다. 오프셋을 -120px로 늘려 텍스트 하단과 테두리선 사이에 약 43px 여백을 확보했다 - 렌더 후 프레임 검수(f011, s4 mid)에서 발견.

## 기술 검증 (관찰 기록, 한국어만)

렌더 명령은 전부 `scripts/render.mjs`로 실행했고 출력은 `episodes/general-ep26-petrichor/out/`에만 생성됨을 확인했다(공용 루트 `shortform/out/`에는 쓰지 않음). `precheck.mjs`는 매번 에러 0(경고 1 - 위 무관한 SHAREDOUT)으로 렌더를 진행했다.

- **자막 화면이탈**: f006(s2 시작+5), f007(s2 mid), f008~f009(s3), f010~f011(s4, v2로 재확인), f012~f013(s5), f014~f017(s6, 시작·파열·후반), f018~f019(s7), f020~f021(s8) 전부 캡션 박스가 좌우 안전영역(`CAP_SIDE=70`, 박스 `maxWidth=900`) 안에 표시됨을 직접 확인. 좌우로 잘리는 프레임 없음.
- **장면 전환 시 캐릭터/다이어그램 잔상**: 전환 경계 프레임(f006=s2 시작+5, f008=s3 시작+5, f012=s5 시작+5, f018=s7 시작+5, f020=s8 시작+5, f022=Outro 시작+5)에서 `SceneSwitcher`의 의도된 크로스페이드(0.2초, 6프레임) 동안 직전 장면이 옅게 겹쳐 보이는 것을 확인 - 설계된 동작이며, 각 구간의 mid 프레임(예: f007=s2 mid, f009=s3 mid, f013=s5 mid)에서는 이전 장면 잔상 없이 해당 장면만 정상 표시됨을 확인.
- **등장 전 요소가 점처럼 남아있는지**: `WetSoilAerosolDiagram`의 미생물·분자는 전부 `opacity`+`scale`(같은 `<g transform>` 안에 얹음, `PopIn`과 동일하게 "위치를 가진 요소 자신이 애니메이션도 갖는" 원칙)로 등장하며 별도로 감싸는 flex 부모가 없어 `Appear` 트랩 대상이 아니다. s3 시작 직후(f008)~중간(f009) 사이에서 미생물·분자가 위치 어긋남(Δy 튐) 없이 서서히 나타나는 것을 확인.
- **라벨이 화면 밖에서 잘리는지**: s4 "지오스민"(f010~f011, v2에서 위치 수정 확인), s8 "petrichor"/"페트리코 (1964)"(f020~f021, `Card` 컴포넌트 내부라 `wordBreak: keep-all` 자동 적용) 전부 화면 중앙에 위치하고 잘리지 않음을 확인.
- **요소끼리 겹치는지**: s4에서 수정 전 라벨-흙블록 테두리 겹침(위 결함 1)을 제외하면, s6의 빗방울·공기방울·파열 플래시·방출 분자가 서로 다른 좌표(표면 충돌점 x=550 기준)에 순차 배치되어 겹치지 않음을 f014~f017에서 확인.
- **화면 하단 여백 과다 여부**: s1(f004~f005, 문틀+캐릭터가 화면 상~중단, 젖은 바닥이 하단), s3~s6(다이어그램이 y=420~1155, 캡션이 그 아래), s8(카드가 y=500~1260) 전부 안전영역 안에서 세로 중앙~하단까지 콘텐츠가 채워짐을 확인. 다이어그램 하단(≈1155)과 캡션 상단 사이 약 320px 여백은 `MagnetDiagram`(ep24) 등 기존 다이어그램 씬과 동일한 배치 관례다.
- **화면에 등장하는 모든 문자열이 한국어인지**: 한국어판만 제작하므로 별도 언어 대조는 없음. `s8Term`("petrichor")은 실제 영단어 표기이며 대본이 "'petrichor'라는 문자와 1964년 표기가 함께 뜨는 카드"로 명시한 화면 문자이지 언어 누출이 아니다.
- **캐릭터 윤곽선-배경 대비**: 배경이 전부 밝은 톤(`C.sky`/`C.hill`/`C.paper`)이라 기본 스트로크색(`C.ink`)으로 충분히 구분됨을 f003~f007, f018~f019에서 확인.
- **음량**: `ffmpeg loudnorm=print_format=summary` 측정 결과 Input Integrated -13.6 LUFS / True Peak -1.6 dBTP - 정상 청취 가능한 수준(내레이션 볼륨 1.6배 적용, ep24의 -13.9 LUFS와 유사한 범위).
- **효과음 타이밍·레벨**: `bubble_pop.mp3`를 s6BurstFrame()이 계산한 전역 프레임 864(28.80s)에 배치했고, 시각적 파열 플래시(`WetSoilAerosolDiagram`의 `burstFlash`)도 같은 함수값을 써서 프레임 단위로 항상 일치하도록 구조적으로 보장했다(코드 리뷰로 확인, 두 값 모두 `s6BurstFrame(frames[5])` 단일 소스). 효과음 볼륨(0.9)이 내레이션 볼륨(1.6)보다 낮게 설정되어 있음을 `Episode.tsx` 코드에서 확인(ep18과 동일 값). 다만 그 시각 narration이 "터지면서"를 발화 중이라 음성 에너지가 커, RMS 윈도우 비교만으로는 bubble_pop 자체의 피크를 음성과 분리해 식별하기 어려웠다 - 코드상 볼륨 비율과 프레임 정렬은 확인했으나, 실제 청취 시 "톡" 소리가 체감되는지는 사용자가 직접 들어 확인해달라.
- **총 길이**: ffprobe 실측 46.485초 (60초 상한 안).

## 배포

기술 검증(자막·전환·립싱크·다이어그램 애니메이션·음량 확인)을 통과해 아래 경로로 즉시 복사를 완료했다(md5 일치 확인).

- `/home/lee/project/shorts/ko/[26화] 비 온 뒤 유독 흙냄새가 진해지는 이유.mp4`
- 배포 후 `out/`의 mp4(v1, v2) 전부 삭제했다. `out/frames-ko/`(v1 결함 확인용)·`out/frames-ko-v2/`(라벨 수정 확인용)는 검수 기록으로 남겨뒀다.

이렇게 나왔습니다 - "이 정도면 됐다"는 최종 판단이 아니라 위 관찰 기록을 근거로 확인을 요청드립니다.
