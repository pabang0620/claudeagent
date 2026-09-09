# 35화 빌드 보고 - 그 무거운 비행기가 하늘에 뜨는 이유

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시 2026-09-02).

## 자산

### 재사용 (신규 제작 없이 REGISTRY에서 가져다 씀)
- `character/BustActor`, `character/poses`(idle, surprised)
- `backgrounds/PlainBg`
- `scenes/Caption`, `scenes/Label`
- `assets/audio`의 `intro_ding.mp3`, `outro_ding.mp3` - 기존 화에서 검증된 파일 그대로 재사용

### 신규 제작
- `assets/props/AirplaneWingDiagram.tsx` - 대본이 "신규"로 지정한 자산. REGISTRY 조회 결과 비행기 날개·양력·공기 흐름을 보여주는 기존 자산이 없어 새로 만들었다(재사용 우선 원칙에 따라 먼저 확인함). 날개 단면(캠버 도형, LE-TE 3차 베지어 2개)과 `deflectProgress`/`reactionProgress`/`simultaneityCompare` 3개의 독립 progress, 그리고 같은 파일에 `AirplaneSide`(단순 실루엣, 창문·엔진 디테일 없음)를 소품으로 추가했다. **REGISTRY.md에 등록 완료**(공용 props 섹션, `WING_VB_W`/`WING_VB_H`/`AIRPLANE_SIDE_VB_W`/`AIRPLANE_SIDE_VB_H` 포함 export).
- `assets/audio/engine_takeoff.mp3` - s1 무성 구간(활주로 이륙)에 붙일 신규 SFX. 기존 SFX 중 의미가 가장 가까운 `head_whoosh`(고개를 홱 돌리는 소리)를 검토했으나 엔진 로어와는 소재가 확연히 달라 재사용하지 않고 ffmpeg lavfi로 새로 합성했다(브라운노이즈 로어 + 화이트노이즈 바람 질감 + 상승 처프). **REGISTRY.md 오디오 섹션에 등록 완료**.

REGISTRY.md·props/index.ts는 기존 내용을 건드리지 않고 파일 끝에 새 항목만 추가했다(34화 동시 렌더 중이라 append-only로 진행).

## 언어별 실측 길이 (한국어만)

| 구간 | 실측 발화 길이 |
|---|---|
| s2 | 4.536s |
| s3 | 8.040s |
| s4 | 7.656s |
| s5 | 5.640s |
| s6 | 10.056s |
| 내레이션 합계 | 35.928s |

전체 영상(Intro+TitleCard+본편+Outro): **46.677초**(ffprobe 실측, 1399프레임 @ 30fps). 상세 타임코드는 `02-script-final-ko.md` 참고. 영어판이 없으므로 언어 간 길이 비교는 해당 없음.

## 렌더 횟수

- 정지 프레임(remotion still) 프리뷰: `AirplaneSide` 실루엣 형태 확정(v1→v2, 날개·꼬리날개 비례 조정), 다이어그램 라벨 위치·`DIAG_Y` 배치 확정(560→380으로 상단 여백 축소)까지 다수 회 - 전체 mp4 렌더는 아님, 비용 낮은 반복.
- 전체 mp4 렌더: **2회**. 1차 렌더 후 프레임 검수에서 두 가지를 발견해 코드 수정 후 2차(최종) 렌더로 확정했다:
  1. `CloudPuff`가 `<svg>` 래퍼 없이 bare `<g>`를 `PlainBg`의 non-svg 자식으로 반환해 구름이 전혀 렌더되지 않음 - 자체 `<svg>`로 감싸도록 수정.
  2. `AirplaneWingDiagram`의 다이어그램 배치(`DIAG_Y=560`)가 위쪽 여백을 과도하게 남김(원칙 9) - `DIAG_Y=380`으로 낮춰 상단 여백을 줄이고 캡션과의 간격은 유지되는지 재확인.
  둘 다 precheck.mjs 통과 후 프레임 검수 단계에서 발견된 것으로, precheck가 못 잡는 "렌더 결과를 직접 봐야 아는" 결함이었다.

## 검수 체크리스트 (관찰 기록)

- **자막 화면이탈**: `out/frames-ko/`에서 추출한 30개 대표 프레임(각 구간 시작+2프레임·중간·전환 경계, Intro/TitleCard/Outro 포함)을 Read로 직접 확인. 모든 자막 알약(pill)이 좌우 여백을 두고 화면 안에 들어온다.
- **장면 전환 시 캐릭터 잔상**: s4→s5 전환(global frame 826~832 부근)에서 `SceneSwitcher`의 의도된 6프레임 크로스페이드(날개 다이어그램이 옅어지며 s5의 구름+자막이 겹쳐 나타남)를 실제로 관찰했다. 이는 모든 화가 공유하는 `assets/scenes/SceneSwitcher.tsx`의 표준 동작(xfade=6, fadeIn=8)이며 이 화에서 새로 발생한 결함이 아니다 - 코드를 확인해 의도된 동작임을 검증했다.
- **등장 전 요소가 점처럼 남음**: 공기줄 3가닥은 `pathLength=1` + `strokeDashoffset` 트릭으로 리빌하고(scale 0 방치 없음), 반작용 화살표는 `reveal` 기반 length 성장, s6 마커는 `topT<0.999`/`bottomT<0.999` 조건으로 도착 시 사라진다. f012~f029 구간에서 진행도 0인 요소가 점으로 남는 경우를 확인하지 못했다.
- **라벨이 화면 밖에서 잘림 / 도형에 가려짐**: 최초 버전은 라벨(`공기를 아래로` 등)을 다이어그램 하단(`DIAG_Y+660`)에 둬 공기줄과 겹치는 문제가 있었다 - `DIAG_Y+40`(다이어그램 상단 빈 공간)으로 옮겨 f013·f018·f025에서 라벨이 어떤 선·화살표와도 겹치지 않음을 재확인했다.
- **요소끼리 겹침**: f018(frame704, downReveal 완료 시점)·f019(frame790, upReveal 완료 시점)에서 반작용 화살표 2개가 날개 도형과 겹치지 않고 명확히 구분됨을 확인. f025(frame1100, s6 진행 중)에서 위/아래 마커가 날개 윤곽선과 겹치지 않음을 확인.
- **화면 아래쪽/위쪽 여백 과다**: 위 "렌더 횟수" 절에 기록한 대로 `DIAG_Y`를 560→380으로 낮춰 다이어그램 상단 여백을 축소했다(재렌더 후 f013·f018·f025로 재확인). s1(활주로)·s2(캐릭터)는 캐릭터·비행기가 화면 하단에 고정 배치되는 이 채널의 기존 관례(ep33 s1 등)를 따랐다.
- **음량**: `ffmpeg -af loudnorm=print_format=summary` 실측 - Input Integrated -13.8 LUFS / Input True Peak -2.2 dBTP. 조용하지 않다.
- **자막 스타일**: 프로필(`general`) 표준 `Caption` 컴포넌트를 그대로 사용, 별도 폰트·크기 오버라이드 없음.
- **화면 텍스트 언어 분기**: 한국어판만 제작하므로 언어 간 대조는 해당 없음. 코드를 직접 훑어 확인 - `t.s3Label`/`t.s4Label`/`t.s6Label`/`t.title`/`t.outroNextTitle`/`t.outroNextHint` 전부 `strings.ts`의 `STRINGS.ko`에서 props로 전달받고, 컴포넌트에 하드코딩된 화면 문자열은 없다.
- **캐릭터 윤곽선 vs 배경 대비**: 배경이 전부 밝은 톤(`C.sky`/`C.hillFar`/`C.paper`)이라 기본 `C.ink` 스트로크로 충분히 구분됨(어두운 배경 없음, 글로우 오버레이 불필요).
- **SFX 타이밍 객관 검증**: `ffmpeg astats`로 t=5.1~5.8s(엔진 이륙음 SFX 예정 구간) 창에서 Peak -7.24dB / RMS -18.64dB 확인(그 직전 구간은 -inf, 완전 무음). 같은 방식으로 s2 내레이션 구간(t=6.5~11.0s) Peak -2.36dB를 측정해 SFX 피크(-7.24dB)가 내레이션 피크보다 낮음을 확인 - 원칙 7 요건 충족.
- **애니메이션 최대 상태 겹침**: s3 `deflectProgress`→1(f016, frame589) 직후 s4가 `deflectProgress={1}`을 명시적으로 이어받아 공기줄이 리셋되지 않는 것을 f017(frame590, s4 첫 프레임)에서 확인(원칙 3-1, "이전 상태 유지"). s6 도착 버스트는 마커가 사라지는 시점(topT/bottomT=1)과 버스트가 나타나는 시점 사이에 빈 프레임이 생기지 않도록 `band()` 임계값을 조정(top: 0.55→0.52 시작)해 f025~f027에서 끊김 없이 이어짐을 확인.

이 체크리스트는 관찰된 사실까지만 기록한 것이며, 최종 합격 판정은 사용자 몫이다.

## 배포

기술 점검(위 체크리스트)을 통과해 즉시 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[35화] 그 무거운 비행기가 하늘에 뜨는 이유.mp4`
- md5 대조: 렌더 산출물과 배포본 md5 일치 확인(`d4905d5d75374731bde9ac7b6aadd52c`)
- 배포 후 `episodes/general-ep35-airplane-lift/out/episode-ko.mp4` 삭제 완료(`out/frames-ko/`는 검수용으로 보존)
