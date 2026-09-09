# 빌드 리포트 - 28화 "고양이가 골골거리는 이유" (general-ep28-cat-purring)

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 지시 명시). `episode-en.mp4`는 만들지 않았다.

## 자산

### REGISTRY 대조 결과

- `Actor`/`BustActor`, `Caption`/`Label`, `PlainBg`, `PopIn`, `ScentWaves`, `NerveSignal`, `ThemedIcon`(`bone`, `wave-sine` 캐시 확인), `POSES.crouch`, `FontLoader`/`theme.ts`/`timeline.ts`/`anim.ts` - 전부 기존 라이브러리 재사용
- **동물 캐릭터 자산 확인(오케스트레이터 지시대로 REGISTRY 사전 조회): 강아지(`DogStanding`/`DogNoseCloseup`)는 있으나 고양이 소품이 없었다.** 성대 진동을 보여주는 자산(`VoicePathDiagram`/`HiccupDiagram`)도 있었지만 "근육이 빠르게 실룩여 좁은 틈을 반복 여닫는다"는 구조와는 달라 재사용 불가로 판단하고 신규 제작했다.

### 신규 제작 (2개, REGISTRY 등록 완료)

| 자산 | 파일 | 비고 |
|---|---|---|
| `CatFull` | `assets/props/CatFull.tsx` | 고양이 전신(앉은 자세). `DogStanding`과 동일 조형 언어(둥근 도형·굵은 선·단순한 눈, 수염 2가닥만). 꼬리만 움직이는 정적 실루엣(`tailSwayT`). `hurt`(0~1)로 새 형태 없이 눈·꼬리·자세만 변형해 "다치거나 움츠린" 인상을 표현 |
| `CatPurrDiagram` | `assets/props/CatPurrDiagram.tsx` | 고양이 목 클로즈업. 진동은 **큰 물결선 2개**로만 표현(점 무리 금지 지시 반영). `vibrateT`로 성대 근육 빠른 떨림, `inhaleProgress`/`exhaleProgress`(반복 위상)로 들숨/날숨 화살표(DogNoseCloseup과 색 의미 통일: 들숨=`C.seaDeep`, 날숨=`C.coral`) |

두 자산 모두 `assets/props/index.ts`, `assets/REGISTRY.md`에 기존 줄을 건드리지 않고 끝에 추가로 등록했다.

### 신규 효과음 (1개, REGISTRY 등록 완료)

| 자산 | 파일 | 비고 |
|---|---|---|
| `cat_purr_loop` | `assets/audio/cat_purr_loop.mp3` | ffmpeg lavfi 합성(70Hz/140Hz 사인을 26Hz로 진폭변조 + 브라운노이즈). 2.2초, s1 무성 구간(2.2초)과 정확히 일치. 실측 mean -24.5dB / max -15.8dB(내레이션 트랙 대비 충분히 작음 - 아래 오디오 검증 참고) |

기존 재사용 효과음: `intro_ding.mp3`, `outro_ding.mp3`(Intro/Outro 내장, 변경 없음).

재사용 자산 수: 약 11개(위 목록) / 신규 제작: 2개(소품) + 1개(효과음) = 3개. 전부 REGISTRY 등록 완료(공용이므로 언어별로 세지 않음).

## TTS·타임코드 (한국어만, 원칙 1·4)

- `voice=ko-KR-SunHiNeural`, 설명 구간 `rate=+20%/pitch=+30Hz`(프로필 기본값), 리액션 구간(s2) `rate=+32%/pitch=+55Hz`(원칙 - 리액션은 확실히 다른 톤)
- 구간별 실측 길이: s2=4.968s, s3=6.384s, s4=7.680s, s5=5.280s, s6=6.120s, s7=5.256s (s1은 무성, 대본 지정 2.0초 고정)
- s2->s3(리액션->설명) 전환에 0.6초 여백(원칙 4의 확장 여백 규칙), 나머지는 기본 0.2초
- 본편 총 39.5초, 인트로+제목카드 4.1초, 아웃트로 3.0초 -> **최종 mp4 실측 46.656초**(1398프레임@30fps, 60초 상한 이내)
- 상세 타임코드: `02-script-final-ko.md`

## 렌더

- `node scripts/precheck.mjs episodes/general-ep28-cat-purring` - 에러 0 / 경고 1(`SHAREDOUT`, 공용 루트 `out/`의 `frames-ko/en/`은 2026-08-20 타임스탬프의 과거 잔재로 이 화와 무관 - 건드리지 않음)
- `node scripts/render.mjs general-ep28-cat-purring ko` - **총 2회 렌더**(1차 렌더 후 라벨 겹침 결함 발견 -> `CatPurrDiagram`의 `CAT_PURR_LABEL_PT` 좌표 수정 -> 2차 렌더로 확정)
- 두 렌더 모두 1398/1398 프레임, 최종 mp4 46.656초로 동일(수정이 좌표 상수 하나였을 뿐 길이에 영향 없음)

## 검수 체크리스트 (관찰 기록, 한국어만)

프레임 번호는 `sceneStarts`/`sceneFrames` 계산값 기준(인트로 69f+제목카드 54f=123f 오프셋 포함): 인트로 mid=34, 제목카드 mid=96, s1 시작/mid=123/156, s2 시작/mid=189/272, s3 시작/mid=356/455, s4 시작/mid=554/672, s5 시작/mid=790/872, s6 시작/mid=954/1049, s7 시작/mid=1144/1226, 아웃트로 시작/mid=1308/1353.

- [x] **자막이 화면 밖으로 나가지 않는가** - f006(272)·f008(455 수정 후)·f010(672)·f012(872)·f014(1049)·f016(1226) 등 전 구간 캡션을 확인. 전부 좌우 안전영역(`CAP_SIDE=70`) 안에서 줄바꿈되고 화면 밖으로 잘리지 않음
- [x] **장면 전환 시 캐릭터 잔상** - f003(frame123, s1 로컬 f=0)이 완전히 흰 배경으로 비어 보였으나, 이는 `SceneSwitcher`의 `fadeIn=8`(모든 화 공용) 때문에 새 장면이 로컬 f=0~8에서 서서히 나타나는 표준 동작이고 직전 장면(제목카드)이 이미 사라진 직후라 겹치는 시점에만 잔상이 남을 수 있는데, f005(frame189, s2 로컬 f=0)에서는 오히려 직전 s1이 완전히 보이는 상태(정상 크로스페이드)를 확인함 - 이상 잔상 없음
- [x] **등장 전 요소가 점처럼 남아있지 않은가** - `PopIn`(s7 아이콘)·pillBadge(s6/s7)는 opacity 기반 등장이라 f015(1144, s7 시작 직전 상태)에서 아이콘·배지가 안 보이다가 f016(1226)에서 정상 등장하는 것을 확인, 잔점 없음
- [x] **라벨이 화면 밖에서 잘리지 않는가** - s3/s6/s7 라벨 전부 화면 안쪽에서 렌더됨(f008/f014/f016)
- [x] **요소끼리 겹치지 않는가** - **1차 렌더에서 f008(455)·f010(672)에 `CatPurrDiagram`의 s3/s4 라벨("1초에 수십 번 떨림"/"들숨에도, 날숨에도")이 고양이 귀 삼각형과 정확히 겹쳐 텍스트가 읽히지 않는 결함을 발견.** `CAT_PURR_LABEL_PT`를 viewBox y=6(귀 끝 위쪽 여백, DogNose 관례를 그대로 따랐던 좌표)에서 y=360(머리 아래·근육 위의 빈 목 공간)으로 옮겨 재렌더, f001/f002(수정 후 재추출한 455/672)에서 라벨이 귀와 완전히 분리되어 겹치지 않음을 확인
- [x] **화면 아래쪽 여백이 과다하지 않은가** - s1/s2/s6(고양이 서있는 장면)은 캐릭터가 화면 세로 중하단을 채우고(catGroundY 계산으로 발끝이 `GROUND=1250`에 닿음), s3~s5/s7(클로즈업·아이콘 장면)은 `ground=null`로 그래픽이 화면 상~중단, 캡션이 하단을 채워 빈 공간이 과다하지 않음(f004/f006/f014/f016 확인)
- [x] **음량이 충분한가** - `loudnorm=print_format=summary` 측정: Input Integrated -13.1 LUFS / True Peak -2.3 dBTP(클리핑 없음). `cat_purr_loop.mp3` 개별 피크(max -15.8dB, Remotion volume=0.75 적용 시 더 낮아짐)가 내레이션 트랙(narration mp3 실측 max -3.6dB, volume=1.6 적용)보다 명확히 작음 - 원칙 7 기준 충족
- [x] 자막이 프로필 스타일(폰트·크기·위치)을 따르는가 - `Caption`/`CAPTION_STYLE` 공용 컴포넌트 그대로 사용, 별도 오버라이드 없음
- [x] **화면에 등장하는 모든 문자열이 실제로 언어별로 분기됐는가** - `strings.ts`의 `STRINGS.ko` 테이블에서만 문구를 읽음(title/s3Label/s4Label/s6Badge/s7Badge/outro 문구). 컴포넌트 내부에 하드코딩된 한국어 문자열 없음(`precheck.mjs`가 `src/`의 JSX 내 한국어 리터럴을 에러로 잡는데 0건이었음). 영어판은 만들지 않으므로 ko/en 대조는 해당 없음
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가** - 전 장면이 밝은 배경(`C.sky`/`C.goldSoft`+`C.paper`)이라 `C.ink` 스트로크가 뚜렷하게 대비됨. 어두운 배경(`C.night` 계열)을 쓴 장면 없음

### precheck.mjs 자동 검사

- 에러 0(로케일 누출·Math.random·포맷 불일치·잘못된 import 없음)
- 경고 1건(`SHAREDOUT`) - 공용 루트 `out/`의 잔여 프레임 폴더로, 타임스탬프(2026-08-20)상 이 화와 무관해 그대로 둠

## 배포

- 기술 점검 통과(위 체크리스트 관찰 기록) 후 즉시 배포
- 배포 경로: `/home/lee/project/shorts/ko/[28화] 고양이가 골골거리는 이유.mp4`
- md5 대조로 복사본 일치 확인 후 `episodes/general-ep28-cat-purring/out/episode-ko.mp4` 삭제(`out/frames-ko/`는 검수용으로 보존)

## 남은 관찰 / 참고 사항 (판정이 아니라 관찰 기록)

- s2에서 `POSES.crouch`를 `blendPose(idle, crouch, t)`로 사용해 "고양이를 쓰다듬는" 느낌을 의도했으나, 렌더 결과(f006, frame272)에서 캐릭터가 뚜렷이 웅크리기보다는 다리를 벌린 서 있는 자세에 가깝게 보인다. 리액션+립싱크라는 핵심 기능은 정상 동작하며 화면이 깨지거나 결함이 있는 상태는 아니지만, "쓰다듬는 동작"이 명확히 읽히는지는 취향 판단 영역이라 사용자 확인 요청
- `CatFull`은 앞발이 몸통 실루엣에 가려 사실상 안 보이는 "식빵(로프)" 형태로 렌더된다(코드상 다리·발 도형을 몸통보다 먼저 그려 몸통에 덮임). 흔한 "웅크려 앉은 고양이" 스타일과 부합해 의도적으로 그대로 두었으나, 발이 보이는 편을 선호하면 후속 화에서 레이어 순서를 조정할 수 있다
