# 39화 빌드 보고 - 하~는 따뜻한데 후~는 시원한 이유

영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 **한국어판만 제작**했다.

## 1. 자산

### 재사용 (REGISTRY 대조 후 그대로 사용, 신규 제작 없음)

- `character/Actor.tsx`(`Actor`, `BustActor`) - 캐릭터 배치·바스트샷
- `character/poses.ts`(`idle`, `shrug`, `surprised`, `wide`) - 포즈 프리셋
- `scenes/Caption.tsx`(`Caption`, `Label`) - 자막·화면 라벨
- `scenes/PopIn.tsx`(`PopIn`) - s5 손 아이콘 팝인
- `scenes/SceneSwitcher.tsx`, `scenes/TitleCard.tsx` - 표준 조립 부품
- `backgrounds/PlainBg.tsx` - 전 장면 배경(색만 warm/cool로 조정)
- `props/ThemedIcon.tsx`(`hand-finger`, `flame`, `snowflake`) - s5 온도 비교
- `props/ScentWaves.tsx` - s6 선풍기 바람 표현(REGISTRY에 "숨결이 퍼진다" 재사용 예시로 이미 명시돼 있던 대로 사용)
- `brand/Intro.tsx`, `brand/Outro.tsx` - 인트로·아웃트로(`lang="ko"` 명시)
- `assets/timeline.ts`, `assets/anim.ts`, `assets/theme.ts` - 공용 유틸
- `audio/intro_ding.mp3`, `audio/outro_ding.mp3` - 공용 브랜드 SFX

### 신규 제작 (REGISTRY 등록 완료)

- `props/BreathFlowDiagram.tsx`
  - `BreathFlowDiagram` - "입을 크게 벌리면 넓고 느린 공기가, 좁게 오므리면 빠르고 좁은 공기 + 주변 찬 공기 합류가" 나오는 오버레이 다이어그램. `HeadNerveDiagram`과 같은 원칙(새 얼굴을 그리지 않고 `BustActor` 위에 오버레이). `mode`(`'wide'`/`'narrow'`), `airSpeed`(0~1), `mixWithCold`(0~1, narrow 전용) prop.
  - `ElectricFan` - 날개 3개 + 보호망 + 스탠드로만 이뤄진 단순 선풍기 실루엣(s6).
  - REGISTRY 4절(소품)에 신규 행 등록 완료.
- SFX 2종: `audio/hand_rub.mp3`(추위에 손 비비는 마찰음, 0.30초), `audio/fan_whir.mp3`(선풍기 스위치 켜는 순간, 0.35초). 전부 ffmpeg lavfi 코드 합성(외부 음원 미사용). REGISTRY 7절(오디오)에 등록 완료.
- Tabler 아이콘 `fan`을 추가 시도했으나 Tabler Icons 세트에 없어(sync_icons.mjs 확인) `ElectricFan`을 직접 도형으로 그리는 방식으로 대체했다.

**신규 자산 2개(BreathFlowDiagram/ElectricFan 1파일, SFX 2개), 재사용 자산 다수. 전부 REGISTRY.md에 등록 완료.**

## 2. 실측 길이 (한국어)

| 구간 | 실측 길이 |
|---|---|
| s1(무성) | 2.0s(고정) |
| s2 | 4.944s |
| s3 | 7.944s |
| s4 | 8.904s |
| s5 | 5.736s |
| s6 | 8.424s |
| 합계(본편, pad 포함) | 39.53s |

**전체 영상 길이(ffprobe 실측): 46.677초** (1399프레임 @ 30fps, Intro 69 + TitleCard 54 + 본편 1186 + Outro 90). 60초 상한 대비 여유 있음. 대본 추정치(약 46초)와 실측치가 거의 일치해 장면을 늘리거나 줄이지 않았다.

## 3. 렌더 횟수

- ko: 2회 (v1 - 초기 렌더 성공, 검수 중 s4 찬 공기 합류 화살 2가닥의 색·위치 결함 발견 -> v2 - 수정 후 재렌더, 최종 채택)

## 4. 기술 검증 (관찰 기록)

### precheck.mjs

- 에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `out/`에 `frames-ko/`·`frames-en/`가 있음을 확인). 타임스탬프 확인 결과 2026-08-20 생성분으로 오늘(2026-09-02) 세션과 무관한 과거 잔재였다. 이 화의 렌더가 원인이 아님을 확인했고, 소유자 불명 상태로 건드리지 않고 그대로 뒀다.

### 프레임 검수 (v1 -> v2, 언어: 한국어만)

`sceneStarts`/`sceneFrames` 계산 결과에 따라 각 구간 시작+중간 지점 프레임을 뽑아 확인했다.

- **Intro(f35)/TitleCard(f96)**: 로고 팝인 전 캐릭터 등장 단계, 제목 카드에 "하~는 따뜻한데 후~는 시원한 이유" 정상 표시. 화면 밖으로 나가는 텍스트 없음.
- **s1 무성(f128, f156)**: 두 손을 비비는 SHRUG 블렌드 포즈로 자연스럽게 전환. f128은 장면 전환 크로스페이드 구간(SceneSwitcher fadeIn 8프레임 내)이라 캐릭터가 옅게 보이는 것을 확인했다 - 결함이 아니라 기존 전 화 공통의 의도된 크로스페이드 동작.
- **s2 리액션(f194, f272)**: f194는 s1->s2 크로스페이드 잔상이 겹쳐 보이는 구간(전환 6프레임 이내, 정상 동작). f272에서 "시원하네" 발화 시점에 입이 벌어진 립싱크(`mouthAt`/`mouthProp`)와 캡션 강조 단어가 일치하는 것을 확인.
- **s3 하~(f360, f477, f562)**: 크게 벌린 입(mouthOpen 0.94)에서 코랄색 곡선 화살 3가닥이 부채꼴로 점점 넓게 퍼지는 것을 f477(52% 진행)·f562(약 85% 진행)에서 확인. 라벨 "하~ : 느리고 넓게"가 화면 안에 온전히 들어옴.
- **s4 후~(f604, f735, f850)**: 기본 입 위에 작은 원(pursed lips)이 겹쳐 그려져 s3의 넓은 입과 뚜렷이 대비됨을 확인. f604/f735에서 파란 화살 1가닥(waterCool)이 빠르게 자라나는 것을, f850(믹스 진행도 100%)에서 **주변 찬 공기 합류 화살 2가닥이 메인 제트 중간 지점으로 합류하는 것을 명확히 확인**(v1에서는 이 두 화살이 `C.seaTop`(연한 글로우색)이라 밝은 배경 위에서 거의 안 보이고, 원점도 볼터치와 겹쳐 부자연스러웠던 결함을 발견 - `C.seaDeep`으로 색을 바꾸고 원점을 얼굴 바깥(오른쪽 여백)으로 옮겨 재렌더 후 두 화살이 뚜렷이 보이고 메인 제트로 자연스럽게 합류하는 것을 v2에서 재확인).
- **s5 결론(f877, f970)**: f877은 크로스페이드 구간(정상). f970에서 왼쪽 손(불꽃 배지, 코랄)과 오른쪽 손(눈꽃 배지, waterCool)이 좌우 대칭으로 겹침 없이 표시되는 것을 확인. 화면 문자 라벨 없음(대본 지시대로 캡션만).
- **s6 선풍기(f1055, f1180)**: `ElectricFan`(날개 3개 + 보호망 + 스탠드)과 캐릭터가 겹치지 않게 배치된 것을, 날개가 프레임마다 결정적으로 회전(`spinDeg = (f*26)%360`, `Math.random` 미사용)하는 것을 확인. f1180에서 `ScentWaves` 바람 호가 반복 주기(42프레임 톱니파, 프레임 기반 결정적) 초입에서 옅게 보이는 것을 확인 - 결함이 아니라 주기 시작 지점의 정상 상태.
- **Outro(f1354, f1390)**: 채널명 "굼구미", 구독·팔로우 문구, 다음 편 카드 정상 표시. 화면 밖으로 나가는 요소 없음.

### 자막·화면이탈

- 검수한 모든 프레임에서 자막 박스가 좌우 여백을 두고 화면 안에 들어옴(가장 긴 캡션 줄에서도 여유 있음).

### 캐릭터 윤곽선·배경 대비

- 전 장면 밝은 톤 배경(`PlainBg` top=sky/goldSoft/seaTop/room, bottom=paper)이라 어두운 배경 글로우 처리가 필요한 상황은 없었다.

### 음량

- `loudnorm=print_format=summary` 실측: Input Integrated -13.5 LUFS, **Input True Peak -2.2 dBTP**(클리핑 없음).
- 신규 SFX 개별 피크: `hand_rub.mp3` mean -19.3dB/max -4.8dB, `fan_whir.mp3` mean -11.7dB/max -3.3dB - 둘 다 내레이션 트랙(volume=1.6 적용) 피크보다 낮다.

### SFX 타이밍

- `hand_rub.mp3`: 의도한 절대 프레임 149(4.97s) 부근. silencedetect(-35dB) 실측으로 4.3~5.5s 구간에서 5.02s~5.31s(약 0.29초) 유의미한 에너지 구간을 확인 - 합성 파일 실측 길이(0.30초)와 일치.
- `fan_whir.mp3`: 의도한 절대 프레임 1056(35.2s) 부근. silencedetect 실측으로 34.7~35.9s 구간에서 35.23s부터 에너지 구간 시작 - 의도 시점과 약 0.03초 이내로 일치.

## 5. 배포

기술 검증(프레임·오디오 레벨·SFX 타이밍)을 통과해 곧바로 `shorts/ko/`에 복사했다.

- 배포 경로: `/home/lee/project/shorts/ko/[39화] 하~는 따뜻한데 후~는 시원한 이유.mp4`
- md5 대조로 `out/`의 최종본과 동일 파일임을 확인 후 `out/`의 mp4는 전부 삭제했다(`frames-ko/`, `frames-ko-v2/`는 검수 기록으로 보존).

이 보고는 기술적 관찰 기록이다. 최종 합격 판정("검수 통과"·"품질 확인 완료" 등)은 이 에이전트의 권한이 아니며, 위 프레임·수치 확인 결과를 사용자가 직접 확인해 판단해야 한다.
