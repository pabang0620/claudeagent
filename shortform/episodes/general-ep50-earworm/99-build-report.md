# 빌드 리포트 - general-ep50-earworm (50화, 노래가 하루 종일 맴도는 이유)

영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)에 따라 **한국어판 1개만** 제작했다. `episode-en.mp4`는 만들지 않았다.

## 자산

### 재사용 (REGISTRY 대조 후 그대로 사용, 신규 제작 없음)
- `character/Actor`, `character/BustActor`, `character/poses`(idle, surprised, cheer)
- `backgrounds/PlainBg`
- `scenes/Card`(개별 카드 - `CardGrid`는 쓰지 않고 `Card`를 직접 3회 호출해 씬 경계를 넘어 "이미 채워진 카드" 상태를 유지)
- `scenes/Caption`, `scenes/Label`
- `scenes/Effects`의 `PulseRing`
- `props/Symbols`의 `QMark`
- `props/ThemedIcon` - 'music'·'bug'·'ear' 3개 아이콘을 이번에 처음 캐시에 추가(`scripts/sync_icons.mjs music bug ear`, `assets/props/tabler-cache.json`·`scripts/icons.txt`에 등록됨). 'bug'와 'ear'는 Tabler에 이미 있던 것을 새로 캐시에 반영, 'music'도 동일
- `brand/Intro`, `brand/Outro`(`lang="ko"`), `scenes/TitleCard`
- `assets/audio/intro_ding.mp3`, `outro_ding.mp3` (기존 확정 효과음 그대로 재사용, 별도 효과음 신규 제작 없음)

### 신규 제작 (REGISTRY 등록 완료)
- `assets/props/MelodyLoopDiagram.tsx` - "짧은 구간이 원형 경로를 따라 계속 반복 재생되는" 루프 구조를 보여주는 다이어그램. `loopProgress`(0~1, 루프의 존재감 - 등장/소멸 양쪽에 재사용)와 `cutProgress`(0~1, 트랙 위 고정 지점에 끊긴 틈이 자라며 노트 하나가 처지고 옅어짐)를 독립 진행도로 받는다. `assets/props/index.ts`에 export 추가, `assets/REGISTRY.md`에 한 줄 등록(기존 줄은 건드리지 않고 MirrorDiagram 행 바로 뒤에 추가).
- 이 화 로컬 소품(등록하지 않음, `src/scenes.tsx` 안에만 존재): `PredictableWave`(완만하게 오르내리는 정적 sine 경로, strokeDashoffset로 리빌) - 소재 자체가 이 화 전용이라 라이브러리로 승격하지 않았다.

## 언어별 실측 길이

- **한국어만.** `02-script-final-ko.md` 참고.
- 발화 실측 합계(s2~s9, 무성 s1 제외): 36.984초
- 본편(s1~s9) 합계: 1231프레임 = 41.033초
- 전체(인트로+타이틀카드+본편+아웃트로): **1444프레임 = 48.133초**(ffprobe 실측 `duration=48.192000`, 컨테이너 오차 범위 내)

## 렌더 횟수

- precheck: 2회(1차 통과 후 코드 수정 없음, 최종 1회로 충분 - 에러 0 유지)
- `remotion still` 프리뷰: 총 15프레임(레이아웃 확정 전 2라운드 - 1라운드에서 s4 상하 여백 과다·s5~s8 카드 세로 여백 과다·s9 캐릭터-루프 겹침 3건 발견 후 좌표 수정, 2라운드에서 해소 확인)
- 전체 mp4 렌더: **1회** (`node scripts/render.mjs general-ep50-earworm ko`, 첫 시도는 `intro_ding.mp3`/`outro_ding.mp3`를 `public/audio/`에 복사하지 않아 404로 실패 - 복사 후 재실행해 1444/1444 프레임 성공)

## 기술 점검 (관찰 사실 기록, 최종 판정 아님)

- [x] **자막 화면이탈**: 최종 mp4에서 뽑은 25개 대표 프레임(인트로~아웃트로 전 구간 시작·중간) 전부 Read로 직접 확인. 가장 긴 캡션(s5 "정리되진 않았는데 공통적으로 나타나는"이 2줄로 자동 줄바꿈)도 좌우 여백 안에 들어옴. 좌우 잘림 없음.
- [x] **장면 전환 시 캐릭터 잔상**: s8->s9 경계 프레임(f1204, global)에서 SceneSwitcher 기본 6프레임 크로스페이드로 s8 카드 3장이 옅게 남아있는 것을 확인 - 의도된 크로스페이드이지 잔상 결함 아님(다음 프레임 f1244에서 s9로 완전히 전환됨을 확인).
- [x] **등장 전 요소가 점처럼 남는 문제**: `Card`(scale+opacity 결합), `PopIn`류 컴포넌트, `MelodyLoopDiagram`(loopProgress<=0.001이면 `null` 반환)이 전부 opacity/조건부 렌더 방식이라 scale-0 잔점 없음을 코드·프레임 양쪽에서 확인.
- [x] **라벨이 화면 밖에서 잘림**: s3 "이어웜" Label(중앙 정렬), s8 "그런 이야기가 있음" 배지(카드3 아래, x=880 중심, 폭 약 340px, 캔버스 우측 한계 1080 안에 여유 있게 들어옴) 모두 화면 안에 있음.
- [x] **요소끼리 겹침**: s4에서 PulseRing을 ear 아이콘보다 먼저(뒤에) 그리도록 순서를 바꿔, 진입 순간 골드 발광이 귀 윤곽선 위로 덮이지 않게 수정(초안에서는 순서가 반대라 귀 색이 갈색으로 오염돼 보이는 문제가 있었음 - 재렌더 전 스틸 프리뷰에서 발견해 수정). s9에서 캐릭터 크기를 1600->900으로 줄여 머리끝(y≈757)이 루프 다이어그램 하단(y=660)과 겹치지 않게 확보(초안 실측: 캐릭터 head top≈280 vs 다이어그램 y=260~720이 정면으로 겹쳐 루프가 캐릭터 흰 얼굴에 완전히 가려짐 - 스틸 프리뷰로 발견, 재조정 후 f1244·f1279·f1344에서 겹침 없음 확인).
- [x] **화면 아래쪽 여백 과다**: s5~s8 카드 3장 레이아웃을 1차 초안(CARD_H=400, Y=640)에서 2차(CARD_H=520, Y=700)로 키워 하단 여백을 줄였다. s9 마지막 프레임(f1344, 루프 소멸 직후)은 캐릭터가 화면 중앙에 작게 남아 상하 여백이 큰 편이나, 이는 "루프가 멎었다"는 결말 비트로 의도한 정지 구간이다.
- [x] **음량**: `ffmpeg -af loudnorm=print_format=summary` 측정 - Input Integrated -13.4 LUFS / Input True Peak -1.8 dBTP. 클리핑 없음(다른 화 실측치 -13~-14 LUFS 대와 일치).
- [x] **자막 스타일**: `Caption`/`Label` 공용 컴포넌트를 그대로 사용, 프로필 기본 폰트·크기·위치를 그대로 따름(별도 오버라이드 없음).
- [x] **화면 문자열 언어 분기**: 한국어 단일 채널이라 언어 대조는 해당 없음. 화면에 나오는 모든 문자열("이어웜", "그런 이야기가 있음", 제목, 아웃트로 문구)이 `strings.ts`의 `STRINGS.ko`를 거쳐 나오는지 코드로 확인 - 컴포넌트에 하드코딩된 한국어 리터럴 없음(precheck의 `KO-STR` 규칙도 에러 0으로 통과).
- [x] **캐릭터 윤곽선-배경 대비**: 이 화는 어두운 배경(`C.night` 계열)을 쓰는 장면이 없다(전부 `sky`/`room`/`leaf` 등 밝은 톤) - 대비 문제 해당 없음.
- [x] **precheck.mjs**: 에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `out/`에 있는 `frames-ko/`·`frames-en/`는 타임스탬프가 2026-08-20으로 이 화 작업 이전의 다른 화 산출물이라 확인됨, 지우지 않고 그대로 둠).

## 산출물

- 배포 완료: `/home/lee/project/shorts/ko/[50화] 노래가 하루 종일 맴도는 이유.mp4` (md5 `460844ac95325ebf23792c2afb6aca2c`, `out/`의 원본과 일치 확인 후 `out/episode-ko.mp4` 삭제)
- 검수용 프레임: `episodes/general-ep50-earworm/out/frames-ko/` (25장, 최종 mp4에서 재추출)
- 실측 재생시간: 48.13초 (ffprobe `duration=48.192000`, nb_frames=1444, 30fps)

이렇게 나왔습니다. 확인해주세요.
