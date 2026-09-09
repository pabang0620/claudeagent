# 빌드 리포트 - 34화 "배 안 고픈데도 꼬르륵 소리 나는 이유" (general-ep34-stomach-growl)

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 지시 명시). `episode-en.mp4`는 만들지 않았다.

## 동시 작업 안내

33화(`general-ep33-salty-sea`)가 다른 세션에서 동시에 렌더 중이라는 안내를 받았다. 그 폴더는 건드리지 않았고, 렌더는 항상 `scripts/render.mjs`로만 실행해 공용 루트 `out/`에 쓰지 않았다. `precheck.mjs`가 잡은 `SHAREDOUT` 경고(공용 루트 `out/`의 `frames-en/`·`frames-ko/`)는 타임스탬프(Aug 20)로 확인한 결과 이번 작업·33화 어느 쪽과도 무관한 과거 잔재라 건드리지 않았다. `assets/props/index.ts`, `assets/REGISTRY.md`에는 기존 줄을 건드리지 않고 끝에만 추가했다.

## 자산

### REGISTRY 대조 결과

- `character/Actor.tsx`(`Actor`), `scenes/Caption.tsx`(`Caption`/`Label`), `scenes/PopIn.tsx`(`PopIn`), `backgrounds/PlainBg.tsx`, `props/AnalogClock.tsx`, `props/ScentWaves.tsx`, `props/ThemedIcon.tsx`("book" 아이콘), `POSES`, `FontLoader`/`theme.ts`/`timeline.ts`/`anim.ts` - 전부 기존 라이브러리 재사용
- `SaltCycleDiagram`(ep33, 다단계 독립 progress + "지도는 항상 옅게, 그 위에 레이어" 설계 원칙 확인), `CatPurrDiagram`(반복 진동에 `f` 프레임 직접 수신하는 예외 패턴 확인), `ScentWaves`(냄새·소리 등 확산을 큰 호 2~3개로 표현하는 기존 자산, 소리 파형 표현에 그대로 재사용) - "소화관 내부 튜브" 자산은 REGISTRY에 없어 신규 제작(대본이 이미 신규로 명시, `sound-wave-resonance`는 ScentWaves 재사용으로 대체해 신규 제작하지 않았다)
- 오디오: `intro_ding.mp3`/`outro_ding.mp3`(Intro/Outro 내장, 재사용) - "꼬르륵" 소리 자체는 기존 라이브러리에 없어 신규 제작(아래)

### 신규 제작 (컴포넌트 파일 1개 + 오디오 1개, REGISTRY 등록 완료)

| 자산 | 파일 | 비고 |
|---|---|---|
| `GutTubeDiagram` | `assets/props/GutTubeDiagram.tsx` | "굵고 매끈한 관 하나"로 단순화한 소화관 다이어그램. 내용물(음식/가스/물)은 큰 원 3개만, 근육 수축은 관을 따라 이동하는 밴드 하나로 표현(주름·혈관 없음). `flowT`(누적값, 내부 mod 1)·`waveAmp`·`contentsT`·`sweepT`·`echoGlowT` 독립 progress. `gutPointAt(t)`를 export해 호출 씬이 ScentWaves를 정확한 위치에 얹을 수 있게 했다. `BroomIcon`(손잡이+사다리꼴 솔, Tabler에 broom 아이콘 없어 직접 그림)도 별도 export |
| `stomach_growl` | `assets/audio/stomach_growl.mp3` | "꼬르륵" 소리 자체. 저역 하강 사인(rumble) + 브라운노이즈(버블 질감)를 각각 트레몰로로 흔들어 겹침, ffmpeg lavfi 합성(원칙 7). 0.5초, 실측 mean -11.0dB/max -2.6dB |

`props/index.ts`, `REGISTRY.md`(자산 표 1줄 + 오디오 표 1줄)에 기존 줄을 건드리지 않고 끝에 추가로 등록했다.

재사용 자산 수: 약 9개(위 목록) / 신규 제작: 컴포넌트 1개 파일(+ `BroomIcon` 서브 export) + 오디오 1개. 전부 REGISTRY 등록 완료(공용이므로 언어별로 세지 않음).

### 제작 중 발견·수정한 결함 (렌더 후 프레임 검수에서 실제로 잡힌 것)

1. **ScentWaves burst가 거의 안 보임** - 처음엔 growl 시점의 progress를 `sin(...)` 봉우리(올라갔다 내려오는 곡선)로 만들어 ScentWaves에 넘겼는데, ScentWaves 자체가 이미 "등장-확산-페이드아웃"의 내장 감쇠 곡선을 갖고 있어 두 감쇠가 겹쳐 봉우리에서도 arc 불투명도가 0.17~0.28에 그쳤다(1차 렌더 프레임 실측). 단조 증가하는 progress로 바꾸고(`burstProgress` 헬퍼), count를 줄이고 strokeWidth를 키워 해결(2차 렌더에서 확인).
2. **GutTubeDiagram의 `BroomIcon`(sweepT)이 관을 따라 움직이지 않고 시작점 근처에 고정됨** - `BroomIcon`은 자기 자신이 `<svg style={position:absolute}}>`를 그리는 컴포넌트다. HTML `<div>` 안에서는 이 CSS로 정상 배치되지만(S4의 `PopIn` 안에서는 정상 동작), `GutTubeDiagram`처럼 **부모가 이미 `<svg>`인 경우 중첩 `<svg>` 자식에는 `position:absolute` CSS가 적용되지 않고** SVG 좌표계의 기본 원점(0,0) 근처에 그대로 렌더링된다 - `sweepT` 값과 무관하게 항상 관 시작점 근처에 떠 있었다(2차 렌더 프레임 실측, `remotion still`로 디버그 텍스트/마커를 얹어 `gutPointAt()` 자체는 정확한 값을 계산하고 있음을 확인 후 원인 특정). `BroomIcon`을 `<svg>` 안이 아니라 바깥(형제 위치)에서 뷰박스 좌표를 화면 절대좌표로 변환해 그리도록 수정(3차 렌더에서 관을 따라 정상적으로 이동하는 것을 확인). **다른 씬 안에 SVG를 중첩시키면서 그 안에 `position:absolute` div/svg 자식을 넣는 패턴은 이 채널의 다른 컴포넌트에서도 같은 결함을 낼 수 있어 주의가 필요하다.**
3. **S2 라벨("위·장 근육")이 관 안의 음식물 원(gold)과 겹침** - `GUT_LABEL_PT`(관 위쪽 앵커)가 s2의 음식물 초기 위치와 가까워 겹쳤다(1차 렌더 프레임 실측). 라벨을 관 아래 빈 공간으로 옮겨 해결(2차 렌더에서 확인).

## TTS·타임코드 (한국어만, 원칙 1·4)

- `voice=ko-KR-SunHiNeural`, 전 구간 `rate=+20%/pitch=+30Hz`(프로필 기본값) - "리액션+훅 질문" 형식의 1인칭 대사 구간이 대본에 없어(전 구간 3인칭 설명 내레이션) 원칙 2-1의 리액션 톤 분리를 적용할 대상이 없었다
- 구간별 실측 길이: s1=4.056s, s2=5.328s, s3=5.112s, s4=4.272s, s5=4.560s, s6=5.880s, s7=5.232s (7구간 전부 발화 있음, 무성 구간 없음)
- 전 구간 균일 0.2초 여백(원칙 4의 확장 여백 규칙을 적용할 리액션->설명 전환이 없음)
- 본편 총 35.83초, 인트로+제목카드 4.1초, 아웃트로 3.0초 -> **최종 mp4 실측 42.987초**(1288프레임@30fps, 60초 상한 이내)
- 상세 타임코드: `02-script-final-ko.md`

## 렌더

- `node scripts/precheck.mjs episodes/general-ep34-stomach-growl` - 에러 0 / 경고 1(`SHAREDOUT`, 위 "동시 작업 안내" 절 참고, 이 화와 무관한 과거 잔재), 매 렌더 전 재확인
- `node scripts/render.mjs general-ep34-stomach-growl ko` -> v1, `... ko v2` -> v2(ScentWaves+라벨 수정), `... ko v3` -> v3(BroomIcon 위치 버그 수정) - **총 3회 렌더**(1·2차 렌더 후 프레임 검수에서 위 결함 3건을 발견해 재렌더)
- 최종 v3: 1288/1288 프레임, mp4 42.987초

## 검수 체크리스트 (관찰 기록, 한국어만, v3 기준)

프레임 번호는 `sceneStarts`/`sceneFrames` 계산값 기준(인트로 69f+제목카드 54f=123f 오프셋 포함): 인트로 mid=34, 제목카드 mid=96, s1 시작/growl직전/growl피크=123/180/188, s2 시작/growl직전/growl피크=251/300/310, s3 시작/중간=417/497, s4 시작/비움전환/중간/빗자루팝인최대=576/622/643/666, s5 시작/스윕초반/스윕중반/스윕후반/스윕거의완료=710/732/780/820/835, s6 시작/growl직전/growl피크/중간/시계프리즈피크=853/915/930/944/978, s7 시작/파형+반사직전/반사피크/중간/글로우잔광/거의끝=1035/1090/1105/1117/1134/1175, 아웃트로 시작/mid=1198/1250.

- [x] **자막이 화면 밖으로 나가지 않는가** - f180·f251·f300·f417·f497·f576·f622·f710·f780·f853·f915·f930·f1035·f1105 등 대사가 있는 전 구간 캡션을 확인. 가장 긴 s6 캡션("이 청소 운동은 보통 한두 시간에 한 번씩 반복되는데, 그때마다 소리가 유독 크게 나요")도 2줄로 자동 줄바꿈되어 좌우 안전영역(`CAP_SIDE`) 안에서 잘리지 않음
- [x] **장면 전환 시 캐릭터 잔상** - f251(s2 로컬f=0)·f576(s4 로컬f=0)·f710(s5 로컬f=0)·f853(s6 로컬f=0)·f1035(s7 로컬f=0)에서 SceneSwitcher의 표준 크로스페이드(fadeIn 8프레임)로 전 장면이 옅게 비쳐 보이다 자연스럽게 사라지는 것을 확인, 정지된 채 겹쳐 남는 이상 잔상 없음
- [x] **등장 전 요소가 점처럼 남아 있지 않은가** - S4의 빗자루는 `PopIn`(scale 0.4 -> 1 + opacity)이라 점으로 안 남음(f643~f666 구간에서 서서히 팝인 확인). S2~S7의 `GutTubeDiagram` 내용물(음식/가스/물 원)은 `contentsT` opacity로만 제어되고 `edgeFade`로 이음매에서 부드럽게 사라져 점 잔상 없음
- [x] **라벨이 화면 밖에서 잘리지 않는가** - S2 "위·장 근육"(f310에서 관 아래 빈 공간에 완전히 표시, 음식물 원과 안 겹침 - 위 "결함 3" 수정 결과), S3 "항상 발생"·S6 "한두 시간마다" 배지 전부 화면 안전영역 안에 완전히 표시(f497, f915)
- [x] **요소끼리 겹치지 않는가** - f310(S2 라벨-내용물 원 비겹침, 수정 확인), f666(S4 빗자루-관 비겹침, 관 바깥 여백에 팝인), f978(S6 시계-라벨-다이어그램 세로 분리 배치, 겹침 없음)
- [x] **애니메이션이 최대치에 도달한 프레임에서 겹침을 확인한다** - S5 sweepP 거의 1(f835): 빗자루가 관 끝단(우하단) 근처에 있고 화면 밖으로 잘리지 않음(위 "결함 2" 수정 확인). S6 waveAmp=1(f930): 근육 수축 밴드가 커져도 내용물 원·시계·라벨과 겹치지 않음. S7 echoGlowT 피크(f1105): 벽 발광이 관 외곽에 옅게 퍼져도 텍스트·캡션과 안 겹침
- [x] **화면 아래쪽 여백이 과다하지 않은가** - S1(전신 캐릭터, `GROUND=1250`)은 화면 중하단까지 채움(f188 확인). S2~S7(다이어그램+라벨/시계+캡션)은 다이어그램이 화면 중단, 라벨/배지가 그 아래, 캡션이 하단에 위치해 빈 공간 과다 없음(f310, f497, f978 확인)
- [x] **음량이 충분한가** - `loudnorm=print_format=summary` 측정: Input Integrated -13.1 LUFS / True Peak -0.5 dBTP(클리핑 없음). `stomach_growl.mp3` 개별 피크(raw max -2.6dB, Remotion volume 0.70~0.95 적용 -> 실효 약 -3.1~-5.7dB)가 내레이션 트랙(`ko_s*.mp3` raw max -3.5~-4.6dB, volume=1.6 적용 -> 실효 약 -0.5~+0.3dB)보다 전 구간에서 낮음 - 원칙 7 기준 충족. growl SFX 재생 구간(예: 5.85~6.45초, 9.98~10.58초)을 별도로 volumedetect한 결과 해당 구간에 오디오 에너지(max -0.6dB, 혼합 트랙 기준)가 실제로 존재함을 확인해 의도한 프레임 근처에 재생되는 것을 검증
- [x] 자막이 프로필 스타일(폰트·크기·위치)을 따르는가 - `Caption`/`CAPTION_STYLE` 공용 컴포넌트 그대로 사용, 별도 오버라이드 없음
- [x] **화면에 등장하는 모든 문자열이 실제로 언어별로 분기됐는가** - `strings.ts`의 `STRINGS.ko` 테이블에서만 문구를 읽음(title/s2Label/s3Label/s6Label/outro 문구). `precheck.mjs`의 `KO-STR` 검사가 `src/`(strings.ts 제외)의 JSX 안 한국어 텍스트를 0건으로 확인. 영어판은 만들지 않으므로 ko/en 대조는 해당 없음
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가** - 전 장면이 밝은 배경(`PlainBg` 기본 `C.sky`/`C.paper`/`C.hill` 계열)이라 `C.ink` 스트로크가 뚜렷하게 대비됨. 어두운 배경(`C.night` 계열)을 쓴 장면 없음
- [x] **신체 표현이 최소한인가(원칙 - 징그러움 방지)** - `GutTubeDiagram`은 소화관을 굵고 매끈한 관 하나(주름·혈관·질감 없음)로만 그리고, 내용물은 큰 원 3개로만 표현(작은 점 흩뿌림 없음). 소리는 `ScentWaves`의 큰 물결선 2~3개로만 표현. 캐릭터 얼굴도 기존 blush/eyeOpen 조합만으로 당황 표정을 만들었고 새 신체 파츠를 그리지 않음

### precheck.mjs 자동 검사

- `KO-STR`(한국어 리터럴), `RANDOM`(Math.random), `NOWRAP`, `WORDBRK`, `FORMAT`(9:16/16:9 불일치), `IMPORT`(배럴 밖 import) - 전부 에러 0 / 관련 경고 0
- `SHAREDOUT` 경고 1건 - 위 "동시 작업 안내" 절 참고, 이 화와 무관한 과거 잔재

## 산출물

- 최종 배포: `/home/lee/project/shorts/ko/[34화] 배 안 고픈데도 꼬르륵 소리 나는 이유.mp4` (md5 `a945fcd7cce80e7790652a38093e4dd4`, `out/`의 v3 원본과 일치 확인 후 `out/`의 mp4 3개(v1/v2/v3) 전부 삭제)
- 검수 프레임: `episodes/general-ep34-stomach-growl/out/frames-ko/` (32장 보존, v3 기준 재추출)
- 실측 재생시간: **42.987초** (1288프레임 @ 30fps, 60초 상한 이내)
- 렌더 횟수: 3회 (한국어만; ScentWaves 가시성·라벨 겹침·BroomIcon 위치 버그를 프레임 검수로 발견해 순차 수정)

이렇게 나왔습니다. 확인해주세요.
