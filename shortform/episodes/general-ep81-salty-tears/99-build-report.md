# 81화 빌드 보고 - 울고 나면 입가가 짭짤한 이유

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시 2026-09-02).

## 자산

### 재사용 (신규 제작 없이 REGISTRY에서 가져다 씀)
- `character/Actor`, `character/BustActor`, `character/poses`(idle, touchForehead - `blendPose`로 idle<->touchForehead 보간)
- `backgrounds/PlainBg`
- `scenes/Caption`, `scenes/Label`
- `scenes/CompareBars`(s4 - 눈물·혈액·땀 염분 농도 비교)
- `scenes/Card`의 `Card`/`CardGrid`(s5 카드 3장, s6 확대 카드)
- `scenes/Effects`의 `Sparkles`(s6 - 감정 눈물의 호르몬 성분을 반짝임으로 표현)
- `props/PalmSweatDiagram`의 `SweatDroplet`(s1 - 손등에 묻은 눈물방울 표시, 큰 물방울 1개만 재사용)
- `props/ThemedIcon`(eye/droplet/wind/heart-filled 아이콘, s5·s6)
- `assets/audio`의 `sip_slurp.mp3`(s1 - 손등의 눈물을 맛보는 순간, general-ep33의 "바닷물을 손으로 떠서 맛보는" 장면과 동일 용법으로 재사용), `intro_ding.mp3`, `outro_ding.mp3` - 전부 기존 화에서 검증된 파일 그대로, 새 SFX 합성 없음

### 신규 제작
- `assets/props/TearDropDiagram.tsx` - 눈물방울 단면(대부분 물, 그 안에 작은 소금 알갱이 최대 2개가 녹아 있음)을 `saltRevealProgress`(0~1)로 표현하는 소품. `PalmSweatDiagram`의 `dropletShape`(물방울 윤곽 path 공식)와 `SaltCycleDiagram`의 `SaltDiamond`(소금 결정 글리프) 공식을 그대로 재사용해 새 좌표를 눈대중으로 그리지 않았다(원칙 0-1). **REGISTRY.md·`assets/props/index.ts` 양쪽에 등록 완료**(둘 다 append-only로 파일 끝에 추가, 기존 줄 미변경 - 77화 사고 재발 방지 확인).

REGISTRY.md·props/index.ts는 기존 내용을 건드리지 않고 파일 끝에 새 항목만 추가했다(80화가 다른 세션에서 동시 렌더 중이라 append-only로 진행, `episodes/README.md`는 건드리지 않음).

## 언어별 실측 길이 (한국어만)

| 구간 | 실측 발화 길이 |
|---|---|
| s1 (무성, 고정 길이) | 2.000s |
| s2 (리액션+훅 질문) | 4.656s |
| s3 | 5.880s |
| s4 | 7.080s |
| s5 | 10.920s |
| s6 | 5.544s |
| s7 | 4.872s |
| 내레이션 합계(s1 제외) | 38.952s |

전체 영상(Intro+TitleCard+본편+Outro): **49.685초**(ffprobe 실측, 1489프레임 @ 30fps, 1080x1920). 상세 타임코드는 `02-script-final-ko.md` 참고. 영어판이 없으므로 언어 간 길이 비교는 해당 없음.

## 렌더 횟수

- 렌더 전 `remotion still` 스틸 선점검: 9장(각 구간 시작/정점 프레임) - 결함 없이 배치·애니메이션 방향 확인
- 전체 mp4 렌더: **2회**
  - 1차: 원칙 5·7 기준 시각 요소 전부 통과. 다만 s1(무성 구간)에 원칙 7이 요구하는 짧은 효과음이 빠져 있어 보완 필요 판단
  - 2차: s1에 `sip_slurp.mp3`(손등의 눈물을 맛보는 순간) 효과음을 `Episode.tsx`에 추가한 뒤 재렌더 - 최종본

## 검수 체크리스트 (관찰 기록)

- **자막 화면이탈**: `out/frames-ko/`에서 추출한 16개 대표 프레임(각 구간 시작+중간 지점, 인트로·타이틀카드·아웃트로 포함) + 렌더 전 `remotion still` 9장을 Read로 직접 확인. 모든 자막 알약이 좌우 여백을 두고 화면 안에 들어온다(s5의 "눈물 먼지나 하품 때문에 갑자기" 등 긴 문장도 줄바꿈 후 화면 안에 들어옴).
- **장면 전환 시 캐릭터 잔상**: 경계 프레임(frame 341, s2→s3 정확한 전환 경계)을 일부러 확인한 결과, SceneSwitcher의 의도된 크로스페이드(8프레임 인, 6프레임 아웃)로 인해 전 장면이 아직 보이는 것을 관찰 - 별도의 비정상 잔상은 아니며, 그 직후 프레임(353)에서는 TearDropDiagram이 정상적으로 단독 표시됨을 확인.
- **등장 전 요소가 점처럼 남음**: TearDropDiagram의 소금 알갱이는 `SaltDiamond`의 `opacity`+`scale` 기반 팝인(scale 0 방치 없음)이라, frame 341(진행도 0)에서 소금 알갱이가 전혀 보이지 않고 frame 496(진행도 약 0.62)에서 2개가 모두 드러남을 확인. CardGrid의 카드도 `Card`의 `progress` opacity 기반이라 등장 전 잔상 없음.
- **라벨이 화면 밖에서 잘림**: s4의 "눈물"/"혈액"/"땀" 라벨과 "약 0.9%" 공통 라벨, s5·s6의 카드 라벨("기초 눈물"/"반사 눈물"/"감정 눈물") 모두 화면 안에 온전히 들어오고 도형에 가려지지 않음을 확인.
- **요소끼리 겹침**: s6(감정 눈물 카드 확대) 프레임에서 Sparkles 파티클 일부가 eye/heart 아이콘 가장자리에 근접하나 아이콘 자체를 가리지 않음을 확인(frame 1075, 1161, 1247, 1420 4곳에서 확인).
- **화면 아래쪽 여백 과다**: 세로 9:16 기준 모든 장면에서 캐릭터/다이어그램/카드가 화면 중앙~중하단까지 채워지고, 자막이 그 아래 안전영역에 위치함을 확인. 유독 하단이 비는 장면은 관찰되지 않았다.
- **음량**: `ffmpeg -af loudnorm=print_format=summary` 실측 - Input Integrated -13.1 LUFS / Input True Peak -1.9 dBTP.
- **효과음(원칙 7) 검증**: sip_slurp SFX가 의도한 프레임(글로벌 167, s1 로컬 44) 근처에서 실제로 재생되는지 `ffmpeg astats`로 확인 - 직전 무음 구간(4.8~5.5s)은 Peak -inf인 반면 SFX 구간(5.5~5.9s)은 Peak -37.8dB/RMS -57.6dB로 명확한 에너지 상승을 확인. 내레이션과 SFX가 겹치지 않는 구간이라(s1은 무성) 최종 믹스에서 직접 측정 가능했다. 실제 볼륨 배율 적용 후 개별 소스 피크 비교: 내레이션(`ko_s3.mp3`, volume=1.6) Peak -0.08dBTP vs SFX(`sip_slurp.mp3`, volume=0.8) Peak -5.29dBTP - SFX가 내레이션보다 확실히 낮다.
- **자막 스타일**: 프로필(`general`) 표준 `Caption` 컴포넌트를 그대로 사용, 별도 폰트·크기 오버라이드 없음.
- **화면 텍스트 언어 분기**: 한국어판만 제작하므로 언어 간 대조는 해당 없음. 화면 문구(라벨류)는 전부 `strings.ts`의 `STRINGS.ko`에서 props로 전달받아 컴포넌트에 하드코딩하지 않았다(precheck.mjs `KO-STR` 에러 0건으로 교차 확인).
- **캐릭터 윤곽선 vs 배경 대비**: 배경이 전부 밝은 톤(`C.room`/`C.sky`/`C.paper`)이라 기본 `C.ink` 스트로크로 충분히 구분됨(어두운 배경 없음, 글로우 오버레이 불필요).

### 이 화 시각 주의사항 반영 확인
- 눈물 속 소금 결정: TearDropDiagram에서 최대 2개(SaltDiamond)만 그림 - 점 무리 없음.
- 눈물이 볼을 타고 입가까지 흐르는 경로: 별도 선으로 그리지 않고, s1/s7의 "손등으로 훔치는" 동작 자체로 표현(캡션·동작만으로 전달, 복잡한 경로선 없음).
- 평소 눈물 vs 감정 눈물 차이: 카드 라벨+아이콘(물방울/바람/하트)으로만 가볍게 구분, 성분표·그래프 없음.
- 우는 표정: 기존 `touchForehead` 포즈(새 리깅 없음)를 그대로 재사용, 과장 없음.

## 배포

기술 점검(precheck 에러 0, 스틸 선점검, 렌더 후 16+9 프레임 육안 확인, loudnorm 실측, SFX 타이밍/레벨 실측)을 통과해 즉시 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[81화] 울고 나면 입가가 짭짤한 이유.mp4`
- md5 대조: `out/episode-ko.mp4`(배포 후 삭제됨)와 배포본이 일치함을 확인(`e23f3dd886d699d8593bcd2400db4307`)
- `out/`의 mp4는 배포 확인 후 삭제 완료(`out/frames-ko/`는 검수 기록으로 보존)

이 보고는 기술적 관찰 기록이며, 최종 합격 판정은 사용자 몫이다.
