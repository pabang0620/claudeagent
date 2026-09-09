# 67화 빌드 리포트 - 소금에 절이면 음식이 안 상하는 이유

한국어판만 제작(영어 채널 운영 중단, 2026-09-02 오케스트레이터 명시 지시).

## 자산

### 재사용 (신규 등록 없음)
- `assets/scenes/Caption.tsx`의 `Caption`/`Label`
- `assets/scenes/CompareBars.tsx`의 `CompareBars` (s7 소금 농도 비교)
- `assets/scenes/PopIn.tsx`의 `PopIn` (s1 음식 등장)
- `assets/backgrounds/PlainBg.tsx`
- `assets/brand/Intro.tsx`, `Outro.tsx`, `assets/scenes/TitleCard.tsx`
- 공용 유틸: `theme.ts`(C, SW, SW_THIN, FS 등), `anim.ts`(clamp01, progress), `timeline.ts`(sceneFrames, sceneStarts, buildCaptions, wrapCounts)

### 신규 제작 + REGISTRY 등록 완료
- `assets/props/OsmosisDiagram.tsx` (`OsmosisDiagram`, `OSMOSIS_VB_W`/`OSMOSIS_VB_H`) - 삼투 현상(세포에서 물이 소금 쪽으로 빠져나가는 구조) 다이어그램. s2~s4에서 재사용. `assets/props/index.ts`와 `assets/REGISTRY.md` "4. 소품" 절 끝에 신규 행으로 등록(기존 행은 건드리지 않고 파일 끝에 추가만 했다).
  - REGISTRY 확인 결과: 36화 `MilkCurdleDiagram`(여러 입자가 하나로 뭉치는 응집 구조)과 57화 `FermentJar`(밀폐 용기 바깥 시점)는 이번 화의 핵심 원리(삼투로 인한 탈수-쪼그라듦)와 방향이 반대이거나 시점이 달라 재사용하지 못하고 새로 만들었다(오케스트레이터 지시사항과 일치).
  - 세균은 점 무리 대신 도형 1마리(몸통+눈2개+미소, MilkCurdleDiagram과 동일 설계)로, 소금은 SaltCycleDiagram과 같은 다이아몬드 결정 글리프를 최대 4개까지만, 세포는 큼직한 알약 모양 2개로만 표현해 "신체 표현은 최소한으로" 원칙을 지켰다.

### 에피소드 로컬(재사용 가능성 낮아 REGISTRY 미등록)
- `src/scenes.tsx` 내 `PickleJar`/`SaltedFish`(s1 절임 음식 클로즈업), `Germ`(s5 상한 음식 카드용 균 얼굴), `PersonSilhouette`/`BarrelJar`(s6 옛날 저장법 실루엣), `SaltFleck`(소금 결정 정적 배치용 다이아몬드 글리프, OsmosisDiagram의 SaltDiamond와 같은 디자인 언어를 씬에서 재사용)

## 언어별 실측 길이

한국어만 제작. 구간별 실측 길이·프레임은 `02-script-final-ko.md` 참고. 총 재생시간 47.2초(1416프레임 @30fps), 60초 상한 내.

## 립싱크

이 화는 캐릭터 바스트샷 없이 다이어그램·비교카드·실루엣만으로 진행돼 립싱크 대상이 없다. `ko_mouth.json`은 표준 파이프라인(원칙 2)에 따라 그대로 생성했지만 `Episode.tsx`/`scenes.tsx`에서는 import하지 않았다.

## 효과음(SFX)

무성 구간이 없다(전 구간 내레이션이 화면 동작을 커버). 인트로/아웃트로 내장 딩(`intro_ding.mp3`/`outro_ding.mp3`) 외 추가 SFX는 넣지 않았다.

## precheck.mjs 결과

```
node scripts/precheck.mjs episodes/general-ep67-salt-preserve
```
- 에러 0 / 경고 1 (`SHAREDOUT`)
- `SHAREDOUT` 경고는 공용 루트 `shortform/out/frames-en`·`frames-ko`를 가리키는데, 실측 확인 결과 2026-08-20 타임스탬프의 기존 잔재(이 세션·이 화의 산출물 아님)였다. 병렬 렌더(66화) 소유 여부도 아니라고 판단했고(66화 프레임 수와도 무관, 훨씬 오래된 타임스탬프), 이 화 작업과 무관해 손대지 않았다.

## 렌더 전 스틸 선점검에서 잡은 결함 (렌더 태우기 전에 코드에서 수정)

`npx remotion still`로 각 구간 시작/중간/끝 지점을 뽑아 확인한 결과, 아래 3건을 렌더 전에 발견해 고쳤다.

1. **s1(절임 음식) 배치가 화면 중하단에 치우침** - 병/생선 소품의 `cy`를 위로 올리고 크기를 키워 화면 중앙~중하단에 더 잘 채워지도록 조정(`PopIn cx/cy/size` 값 조정).
2. **s3(세균 쪼그라듦)에서 세균 몸속 물 배출 화살표와 세포->소금 화살표가 서로 교차(X자로 겹침)** - 시각적으로 "막힘"을 뜻하는 s4의 X 표시와 혼동될 수 있어, `OsmosisDiagram.tsx`의 `BACTERIA_DRAIN_ARROW` 목표 좌표를 오른쪽으로 옮겨 두 화살표가 교차하지 않게 수정.
3. **s6(옛날 저장법) 생선이 항아리 안으로 들어가는 게 아니라 항아리 오른쪽 바깥에 걸쳐 보임** - `S6History`의 생선 낙하 궤적(시작/도착 좌표)을 항아리 입구 안쪽으로 재계산(`lerpPx` 헬퍼 추가).

## 렌더 후 최종 mp4에서 확인한 것 (스틸 선점검을 통과한 뒤 최종 mp4에서 재확인, 중복 아님 - 크로스페이드 전환은 정지 스틸로는 못 본다)

- **장면 전환 크로스페이드**: s2/s3, s4/s5, s6/s7 경계에서 `+3프레임` 지점을 뽑아 확인. 라벨 텍스트와 캡션이 짧게(6프레임=0.2초) 겹쳐 보이는 것은 `SceneSwitcher` 기본 `xfade=6` 설정에 따른 의도된 크로스페이드였고, 이전 장면 요소가 다음 장면 진행 중까지 남아있는 "잔상" 현상은 관찰되지 않았다.
- **장면 시작 경계(로컬 프레임 0) 프레임**: `fadeIn=8`로 인해 완전 투명(흰 배경)으로 시작하는 것을 확인 - 이전 장면 내용이 새지 않고 깨끗하게 전환됨을 재확인.

## 검수 체크리스트 (관찰 기록)

- [x] 자막 화면이탈: f=202(s1), f=372/455(s2), f=559/645(s3), f=732/800(s4), f=898(s5), f=1072/1150(s6), f=1242(s7) 전체 확인. 모든 프레임에서 자막 박스가 좌우 여백(`CAP_SIDE=70`)을 유지하며 화면 안에 들어옴.
- [x] 장면 전환 시 캐릭터 잔상: 이 화는 본편에 캐릭터(마스코트)가 등장하지 않아(다이어그램·카드·실루엣 위주) 해당 없음. Intro/TitleCard/Outro의 캐릭터는 각각 독립 Sequence라 겹치지 않음.
- [x] 등장 전 요소가 점처럼 남는 문제: `PopIn`/`opacity` 기반 등장을 전 구간에서 사용, scale-0 잔점 없음(s1, s5 카드, s6 인물/항아리/생선 전부 opacity 등장 확인).
- [x] 라벨이 화면 밖에서 잘림: s2~s4, s6, s7 라벨(`Label x=CX align=center`) 전부 화면 중앙 고정이라 잘림 없음. s5 카드 내부 라벨(`S5_CARD_H-74` 위치)도 카드 폭 안에 들어옴.
- [x] 요소 겹침: s3/s4 화살표 교차 문제(위 "렌더 전 스틸 선점검" 2번)를 렌더 전에 수정. s4 X마크와 성장 화살표가 소금 결정과 근접하지만 색이 달라(파랑/코랄/검정) 구분 가능함을 f=732/800에서 확인.
- [x] 화면 아래쪽 여백 과다: s1~s7 전 구간에서 콘텐츠가 화면 상단 안전영역(240px) 아래~하단 안전영역(1400px) 사이에 배치됨을 확인. 상단에 여백이 있는 것은 65화 등 기존 화와 동일한 채널 표준 레이아웃(라벨-다이어그램-자막 세로배치)이라 결함이 아님.
- [x] 음량: `ffmpeg -af loudnorm=print_format=summary` 측정 결과 Input Integrated -13.6 LUFS, Input True Peak -2.2 dBTP(클리핑 없음). 내레이션 `volume=1.6` 배율은 다른 화와 동일 값.
- [x] 자막 스타일: `Caption`/`CAPTION_STYLE` 공용 토큰 그대로 사용, 프로필(general) 오버라이드 없이 표준값(`FS.caption=50`, 한글 20자 줄바꿈 상한) 적용 확인.
- [x] 캐릭터 윤곽선 대비: 본편에 캐릭터 없음(위와 동일 사유로 해당 없음). Intro/Outro의 캐릭터는 밝은 배경(`C.sky`~`C.paper`) 위라 기존 표준대로 `C.ink` 스트로크로 충분히 대비됨.

## 프로필(general) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가: 장아찌·자반고등어처럼 실생활에서 접하는 절임 음식의 보존 원리를 다뤄 해당.
- [x] 어미 톤: "~가죠", "~거예요", "~해서" 등 친근한 대화체 유지, 유아어·학술 문어체 없음(대본 원문 그대로, 수정 없음).
- [x] 전문용어 풀이: "삼투 현상"은 s2 내레이션에서 "물이 짠 쪽으로 빠지는" 이라고 그 자리에서 풀이됨(대본 원문).
- [x] 자막 한 줄 20자 상한: `wrapCounts(words, 'ko')`로 자동 처리, 표준 상한 그대로 사용(프로필 오버라이드 없음).
- [x] 60초 상한: 47.2초로 상한 내.

## 배포

- md5 대조 완료 후 `out/episode-ko.mp4` 삭제(`out/frames-ko/`, `out/stills/`는 보존).
- 배포 경로: `/home/lee/project/shorts/ko/[67화] 소금에 절이면 음식이 안 상하는 이유.mp4`

이상은 관찰된 사실이며, 최종 합격 판정은 사용자 확인을 기다립니다.
