# 46화 빌드 리포트 - 번개 치고 천둥이 늦게 들리는 이유

영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)에 따라 **한국어판 1개만** 제작했다.

## 자산

### 재사용 (REGISTRY 대조 후 그대로 씀)
- `character/Actor` `character/BustActor` `character/poses`(idle/surprised/count)
- `backgrounds/NightSkyBg`
- `scenes/Caption` `scenes/Label` `scenes/PopIn` `scenes/CompareBars` `scenes/Counter`(StepCounter)
- `scenes/TitleCard` `brand/Intro` `brand/Outro`
- `props/ThemedIcon`(아이콘: bolt·cloud·eye·ear·wave-sine - 전부 기존 tabler 캐시에 있어 새로 추가하지 않음)
- 오디오: `realize_ding.mp3`(재사용, 빛 도착 신호음), `intro_ding.mp3`/`outro_ding.mp3`(브랜드 공용)
- general-ep06(`dark-night-sky`)의 `NIGHT_GLOW_STYLE`(캐릭터 외곽 크림색 drop-shadow) 기법을 이 화 로컬로 재사용 - 어두운 밤하늘 배경에서 캐릭터 팔다리 선이 묻히는 문제를 예방하기 위해 처음부터 적용(원칙 5 예방 체크리스트, general-ep06 사용자 피드백 반영)

### 신규 제작 (REGISTRY 등록 완료)
- `props/LightningThunderDiagram.tsx` - 구름(출발점)에서 빛(굵은 직선 화살표)과 소리(큰 물결 2.5주기 곡선)가 같은 지점에서 출발해 서로 다른 속도로 관측자(눈/귀)에 도달하는 모습을 `launchProgress`(펼쳐지지 않음, 실제로는 launchPulse) `lightProgress`/`soundProgress`(0~1, 출발점->관측자 이동 비율) `lightArrivedPulse`/`soundArrivedPulse`로 표현하는 범용 소품. "동시에 출발한 두 신호가 속도차로 도착 시점이 갈리는" 구조를 갖는 다른 소재(지진파 P파·S파 등)에 재사용 가능성이 있어 등록. s3·s4·s6 세 장면에서 각각 다른 progress 조합으로 재사용
- 오디오 `thunder_boom.mp3`(0.60초, 저역 하강 사인+브라운노이즈, ffmpeg lavfi 합성) - 천둥이 낮게 우르릉거리는 소리. s1(무성)->s2 전환 시 캐릭터가 움찔하는 순간과 s6에서 소리가 귀에 늦게 도착하는 순간(더 조용히 재사용) 2곳에 배치. "천둥·낮은 우르릉 울림 전반 재사용 가능"으로 등록

두 신규 자산 모두 `assets/REGISTRY.md`에 기존 줄을 건드리지 않고 끝에 추가로 등록했다(동시 렌더 중인 44화와 충돌 없음).

## 언어별 실측 길이

한국어만 제작. TTS 실측(`public/audio/ko_words.json`):

| 구간 | 실측 발화 길이 | 여백 | 최종 프레임(30fps) |
|---|---|---|---|
| s1(무성) | - | - | 60 (2.00초, 대본 지시 고정) |
| s2 | 3.600초 | +0.6초(훅 전환) | 126 (4.20초) |
| s3 | 3.912초 | +0.2초 | 123 (4.10초) |
| s4 | 4.320초 | +0.2초 | 136 (4.53초) |
| s5 | 4.920초 | +0.2초 | 154 (5.13초) |
| s6 | 6.264초 | +0.2초 | 194 (6.47초) |
| s7 | 6.000초 | +0.2초 | 186 (6.20초) |

본편 합계 979프레임(32.63초) + 인트로 69 + 제목카드 54 + 아웃트로 90 = **총 1192프레임(39.79초, ffprobe 실측)**.

s2는 리액션 구간이라 프로필 기본값(rate+20%/pitch+30Hz)보다 rate·pitch를 확실히 올려
(+32%/+55Hz, general-ep16과 동일 기준값) 놀란 감정을 실었다.

## 검수 체크리스트 (관찰 기록, 한국어만)

렌더 전 `remotion still`로 대표 프레임 다수를 먼저 확인해 결함 1건을 렌더 전에 잡았고(아래
"발견·수정" 절), 이후 최종 mp4에서 `out/frames-ko/`로 재추출해 재확인했다.

- [x] **자막 화면이탈**: s1~s7 전 구간 자막 프레임(f188, f204, f328, f500, f668, f757, f906 등)을
  확인, 전부 화면 안전영역 안에 들어오고 좌우로 잘리지 않음. 가장 긴 문장(s6 "그러니까 빛은
  거의 순식간에 우리 눈에 도착하고, 소리는 그보다 한참 늦게 귀에 닿는 거예요")도 어절 단위로
  두 줄까지 자동 줄바꿈되어 화면 안에 수렴
- [x] **장면 전환 잔상**: SceneSwitcher의 기본 크로스페이드(xfade=6프레임) 구간(예: 절대프레임
  188, local s2=2)에서 직전 장면(s1, 전신 캐릭터)과 다음 장면(s2, 바스트샷)이 잠깐 겹쳐
  보이는 것을 확인했으나 이는 전 화 공용 SceneSwitcher의 의도된 동작(0.2초 크로스페이드)이라
  결함으로 보지 않음 - 전환이 끝난 직후 프레임(f204)에서는 깨끗하게 s2만 보임
- [x] **등장 전 요소가 점으로 남는지**: LightningThunderDiagram의 빛/소리 경로는 opacity가
  아니라 실제 길이(tipX 계산)로 그려서 progress=0 근처에서도 점 아티팩트 없이 자연스럽게
  사라짐(f328에서 아주 짧은 화살표/물결 조각만 보이고 완전히 숨겨지진 않지만 의도된 "막 출발"
  상태)
- [x] **라벨이 화면 밖/도형과 겹치는지**: s7의 거리 라벨("3초 ≈ 1km") PopIn을 처음엔 캐릭터
  몸 중앙(`S7_ACTOR_GROUND-300`)에 배치했다가 f1066 스틸 확인 중 **캐릭터 얼굴과 겹치는
  결함을 발견** - 캐릭터 머리 위 트인 하늘 공간(`S7_ACTOR_GROUND-880`)으로 옮겨 재확인,
  겹침 해소됨(f1066b)
- [x] **요소끼리 겹침**: s5 CompareBars의 빛/소리 막대 라벨(아이콘+텍스트)과 막대 자체가
  겹치지 않고 위/아래로 명확히 분리됨(f668). s3~s6 다이어그램의 구름·화살표·물결·눈·귀
  아이콘도 서로 다른 y좌표(150/330, viewBox 기준)에 고정돼 겹치지 않음
- [x] **화면 하단 여백 과다 여부**: s1(캐릭터+지평선), s2(바스트샷+자막), s7(캐릭터+카운터+
  라벨+자막)까지 안전영역 안에서 세로 중앙~하단까지 채워짐. s3~s6 다이어그램은 캔버스 상단
  절반 이하(y 760~1220)에 배치해 자막 공간과 겹치지 않으면서도 화면 하단이 비어 보이지 않음
- [x] **음량**: `ffmpeg loudnorm` 실측 Input Integrated -13.7 LUFS / Input True Peak -2.2
  dBTP - 클리핑 없음. SFX(thunder_boom 0.6~0.9, realize_ding 0.8)는 내레이션(volume=1.6)보다
  낮게 설정, `volumedetect`로 s2 시작 구간(t=6.0~6.3s, thunder_boom) 피크 -7.4~-11.1dB,
  s6 빛 도착 구간(t=25.1~25.5s, realize_ding) 피크 -5.0dB, s6 소리 도착 구간(t=30.0~30.5s,
  thunder_boom 재사용·조용히) 피크 -13.0~-14.6dB로 전부 내레이션 피크(약 -2~-3dB대)보다 낮음을
  확인
- [x] **자막 스타일이 프로필을 따르는지**: `assets/theme.ts`의 `CAPTION_STYLE`·`FS.caption`
  공용 토큰을 그대로 사용, 컴포넌트에서 폰트 크기·위치를 하드코딩하지 않음
- [x] **화면 문자열이 하드코딩 없이 strings.ts를 거치는지**: title/s5LightLabel/s5SoundLabel/
  s7Label/outroNextTitle/outroNextHint 전부 `strings.ts`에서 읽음. `node scripts/precheck.mjs`
  실행 결과 `KO-STR`(한국어 하드코딩) 경고 0건
- [x] **캐릭터 윤곽선과 배경 대비**: 어두운 밤하늘 배경(`C.night`/`C.nightMid`) 위에 general-ep06과
  동일한 크림색 drop-shadow 글로우를 처음부터 적용(s1/s2/s7의 캐릭터). f128/f163/f204/f1066b에서
  팔다리 끝부분까지 배경과 명확히 분리되어 보이는 것을 확인
- [x] **다이어그램 요소 대비**: LightningThunderDiagram·CompareBars 모두 `stroke=C.cream`
  `lightColor=C.gold` `soundColor=C.sky`로 override, 밤하늘 배경 위에서 전부 뚜렷하게 읽힘(f328,
  f500, f668, f757, f906, f916)

## precheck.mjs

`node scripts/precheck.mjs episodes/general-ep46-thunder-delay` 실행 결과: **에러 0 / 경고 1**
(`SHAREDOUT` - 공용 루트 `out/`에 다른 화(44화 등 병렬 렌더 중으로 추정)의 `frames-ko/`·
`frames-en/`이 남아 있다는 경고. 이 화의 산출물이 아니고, 병렬 렌더 중일 수 있어 삭제하지
않고 그대로 둠).

## 렌더 횟수

- `remotion still` 사전 확인: 14회(정적 스틸, 렌더 아님) - 캐릭터·다이어그램·속도막대·카운터·
  인트로/제목카드/아웃트로 배치를 렌더 전에 미리 확인해 s7 라벨 겹침 결함 1건을 렌더 전에
  잡음
- 전체 mp4 렌더: **1회** (`node scripts/render.mjs general-ep46-thunder-delay ko`). 1차 시도는
  `intro_ding.mp3`/`outro_ding.mp3`를 `public/audio/`에 복사하지 않아 404로 실패했고, 복사 후
  재시도해 성공 - 최종 성공 렌더는 1회

## 배포

기술 점검(위 체크리스트)을 통과해 즉시 `shorts/ko/`에 배포하고 `out/`의 mp4는 삭제했다
(md5 대조로 배포본과 원본 산출물 일치 확인 후 삭제). `out/frames-ko/`는 검수용으로 보존.

- 배포 경로: `/home/lee/project/shorts/ko/[46화] 번개 치고 천둥이 늦게 들리는 이유.mp4`
- 실측 재생시간: 39.79초 (1192프레임 @ 30fps)
- 해상도: 1080x1920 (9:16), 코덱 h264/aac

이 보고는 기술적 관찰 사실까지만 담는다 - "검수 통과"·"합격" 판정은 아니며, 실제 시청
품질(듣기·보기에 자연스러운지)의 최종 확인은 사용자 몫이다.
