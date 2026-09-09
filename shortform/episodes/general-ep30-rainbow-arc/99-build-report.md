# 빌드 리포트 - 30화 "무지개가 반원인 이유" (general-ep30-rainbow-arc)

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 지시 명시). `episode-en.mp4`는 만들지 않았다.

## 동시 작업 안내

29화(`general-ep29-hypnic-jerk`)가 동시에 다른 세션에서 렌더 중이었다. 그 폴더는 건드리지 않았고, 렌더는 항상 `scripts/render.mjs`로만 실행해 공용 루트 `out/`에 쓰지 않았다. 공용 루트 `out/`에서 발견된 `frames-ko/`·`frames-en/`는 2026-08-20 타임스탬프의 과거 잔재(8화 관련 사고 잔여물)로 이번 작업·29화 어느 쪽과도 무관해 건드리지 않았다.

## 자산

### REGISTRY 대조 결과

- `character/Actor.tsx`(`BustActor`), `scenes/Caption.tsx`(`Caption`/`Label`), `scenes/Effects.tsx`·`scenes/PopIn.tsx`(`PopIn`), `backgrounds/PlainBg.tsx`, `POSES.idle`/`POSES.surprised`, `props/LightScatterDiagram.tsx`의 `LIGHT_BLUE`/`LIGHT_GREEN`/`LIGHT_ORANGE`/`LIGHT_RED` 색 상수, `FontLoader`/`theme.ts`/`timeline.ts`/`anim.ts` - 전부 기존 라이브러리 재사용
- **광학 다이어그램 계열(`StarlightDiagram`/`LightScatterDiagram`) 확인(오케스트레이터 지시대로 REGISTRY 사전 조회, 대본에도 이미 검토 완료로 기재됨):** `StarlightDiagram`은 광원-관측자 직선 이동/방사형 시선 비유용, `LightScatterDiagram`은 빛이 매질에서 갈라지고 흩어지는 산란 구조용이라 둘 다 "빗방울 내부에서 굴절-반사-굴절되는 경로 + 그 결과로 하늘에 원이 그려지는 구조"와는 맞지 않아 재사용 불가로 판단하고 신규 제작했다. 단 `LightScatterDiagram`이 export하는 `LIGHT_*` 색 상수는 그대로 재사용해 새 색을 만들지 않았다.

### 신규 제작 (1개, REGISTRY 등록 완료)

| 자산 | 파일 | 비고 |
|---|---|---|
| `RainbowDiagram` | `assets/props/RainbowDiagram.tsx` | 독립 레이어 3종(`rayProgress`/`arcProgress`/`groundMask`, undefined면 안 그림 - StarlightDiagram·LightScatterDiagram과 같은 설계). 빗방울은 참고 이미지 없는 절차적 원(+하이라이트 점 1개)이라 원칙 0-1(벡터화) 대상이 아니다. 무지개 색 띠는 얇은 선 여러 겹이 아니라 두꺼운 밴드 4겹(각 28px)으로 그려 "촘촘한 표현 금지" 원칙을 지켰다. `props/index.ts`, `REGISTRY.md`에 기존 줄을 건드리지 않고 끝에 추가로 등록했다 |

기존 재사용 효과음: `intro_ding.mp3`, `outro_ding.mp3`(Intro/Outro 내장), `realize_ding.mp3`(s1 무성 구간, "어? 무지개다" 발견 순간 - 신규 제작 없이 기존 REGISTRY 자산을 그대로 재사용). 이번 화에서 새로 만든 효과음은 없다.

재사용 자산 수: 약 9개(위 목록) / 신규 제작: 1개(소품). 전부 REGISTRY 등록 완료(공용이므로 언어별로 세지 않음).

## TTS·타임코드 (한국어만, 원칙 1·4)

- `voice=ko-KR-SunHiNeural`, 설명 구간(s3~s6) `rate=+20%/pitch=+30Hz`(프로필 기본값), 리액션 구간(s2) `rate=+32%/pitch=+55Hz`(원칙 - 리액션은 확실히 다른 톤, ep28과 동일 수치)
- 구간별 실측 길이: s2=4.224s, s3=9.888s, s4=6.144s, s5=6.264s, s6=5.856s (s1은 무성, 대본 지정 3.0초 고정)
- s2->s3(리액션->설명) 전환에 0.6초 여백(원칙 4의 확장 여백 규칙), 나머지는 기본 0.2초
- 본편 총 37.0초, 인트로+제목카드 4.1초, 아웃트로 3.0초 -> **최종 mp4 실측 44.1초**(1323프레임@30fps, 60초 상한 이내)
- 상세 타임코드: `02-script-final-ko.md`

## 렌더

- `node scripts/precheck.mjs episodes/general-ep30-rainbow-arc` - 에러 0 / 경고 1(`SHAREDOUT`, 공용 루트 `out/`의 `frames-ko/en/`은 2026-08-20 타임스탬프의 과거 잔재로 이 화와 무관 - 건드리지 않음)
- `node scripts/render.mjs general-ep30-rainbow-arc ko` - **총 1회 렌더**(재렌더 없이 1차 렌더가 검수를 통과함)
- 1323/1323 프레임, 최종 mp4 44.1초

## 검수 체크리스트 (관찰 기록, 한국어만)

프레임 번호는 `sceneStarts`/`sceneFrames` 계산값 기준(인트로 69f+제목카드 54f=123f 오프셋 포함): 인트로 mid=34, 제목카드 mid=96, s1 시작/mid/줌아웃완료=123/171/208, s2 시작/mid=219/291, s3 시작/중간(내부반사)/각도표시=364/460/614, s4 시작/형성중/완성직전=667/767/852, s5 시작/중간마스크/거의완료=857/952/1042, s6 시작(팝인)/정착=1051/1120, 아웃트로 시작/mid=1233/1278.

- [x] **자막이 화면 밖으로 나가지 않는가** - f007(291)·f009~f012(s3 전 구간)·f015~f017(s4)·f019~f022(s5)·f024(s6) 등 대사가 있는 전 구간 캡션을 확인. 전부 좌우 안전영역(`CAP_SIDE=70`) 안에서 줄바꿈되고 화면 밖으로 잘리지 않음(예: f007 "와 무지개 떴다 근데 왜 맨날 반원", f024 "그래서 비행기를 타고 위에서")
- [x] **장면 전환 시 캐릭터 잔상** - f008(abs364, s3 로컬f=0)·f013(abs667, s4 로컬f=0)에서 직전 장면(각각 s2 캐릭터, s3 다이어그램)이 크로스페이드 구간(SceneSwitcher xfade=6, fadeIn=8, 표준 동작) 동안 여전히 선명하게 남아 있는 것을 확인 - 새 장면의 progress prop이 초반(예: arcProgress<0.03)에는 시각 요소를 거의 안 그리기 때문에 자연스러운 크로스페이드로 보이고, 정지된 채 겹쳐 남는 이상 잔상은 없음(abs675 이후 새 장면 콘텐츠가 정상적으로 나타남을 f014=abs720에서 확인)
- [x] **등장 전 요소가 점처럼 남아 있지 않은가** - S4의 빗방울 점(`SkyArc` dot)은 `local<=0.01`이면 `null` 반환(opacity 기반 아님, 아예 미렌더링)이라 f013(arcProgress=0)에서 점 흔적이 전혀 없음을 확인. S6의 `PopIn` 창문도 f023(abs1051, winP=0 근처)에서 스케일 0.86·투명 상태로 시작해 점으로 남지 않음
- [x] **라벨이 화면 밖에서 잘리지 않는가** - f012(614)의 "약 42˚" 라벨이 빗방울 아래 여백에 완전히 화면 안으로 표시됨(RAINBOW_ANGLE_LABEL_PT를 EXIT 지점 바깥쪽으로 옮겨 겹침 방지)
- [x] **요소끼리 겹치지 않는가** - f012에서 "약 42˚" 라벨이 빗방울 원·탈출광선(빨간선)·점선 기준선과 겹치지 않고 아래쪽 여백에 분리되어 있음을 확인. f017(852, S4 링 완성 직전)·f025(1120, S6 완성된 원)에서 빗방울 점(원)이 색 밴드 위에 올라앉아 있으나 서로 다른 레이어(밴드=원경로, 점=개별 빗방울)로 의도된 배치이며 텍스트·라벨과는 겹치지 않음
- [x] **애니메이션이 최대치에 도달한 프레임에서 겹침을 확인한다** - S3 rayProgress=1(f012, 614): 굴절-반사-굴절 3단 경로 + 각도호 + 라벨이 서로 겹치지 않고 모두 화면 안에 있음. S4 arcProgress=1(f017, 852): 색 밴드 4겹 + 점 10개로 이뤄진 완전한 원이 화면 중앙에 여유 있게 들어감(좌우 244~836px, 상하 759~1351px, 캔버스 1080x1920 안). S5 groundMask=1(f022, 1042): 원 아래 절반이 초록 지평선에 가려지고 위쪽 반원만 남아 s1의 최종 상태와 동일한 모양을 확인. S6 완성된 원(f025, 1120): 비행기 창문 프레임 안에 원 전체가 잘리지 않고 들어가며 구름과 겹치지 않음
- [x] **화면 아래쪽 여백이 과다하지 않은가** - s1/s4/s5(하늘의 원 장면)는 `PlainBg`의 top(하늘)->bottom(C.leaf, 땅) 그라데이션이 화면 전체를 채우고 원이 화면 세로 중앙~중하단을 차지해 빈 공간이 아니라 색이 채워진 배경으로 처리됨(f004/f015/f020 확인). s3(빗방울 클로즈업)·s6(창문)은 다이어그램이 화면 상~중단을 채우고 캡션이 하단을 채워 빈 공간 과다 없음(f009/f024 확인)
- [x] **음량이 충분한가** - `loudnorm=print_format=summary` 측정: Input Integrated -13.8 LUFS / True Peak -2.3 dBTP(클리핑 없음, ep28의 -13.1 LUFS/-2.3dBTP와 유사한 수준). `realize_ding.mp3` 개별 피크(raw max -4.2dB, Remotion volume=0.8 적용)가 내레이션 트랙(`ko_s3.mp3` 실측 raw max -3.4dB, volume=1.6 적용)보다 원본 기준으로도 낮고 게인 배율까지 고려하면 훨씬 더 작음 - 원칙 7 기준 충족
- [x] 자막이 프로필 스타일(폰트·크기·위치)을 따르는가 - `Caption`/`CAPTION_STYLE` 공용 컴포넌트 그대로 사용, 별도 오버라이드 없음
- [x] **화면에 등장하는 모든 문자열이 실제로 언어별로 분기됐는가** - `strings.ts`의 `STRINGS.ko` 테이블에서만 문구를 읽음(title/s3Label/outro 문구). 컴포넌트 내부에 하드코딩된 한국어 문자열 없음(`precheck.mjs`가 `src/`의 JSX 안 한국어 리터럴을 에러로 잡는데 0건이었음). 영어판은 만들지 않으므로 ko/en 대조는 해당 없음
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가** - 전 장면이 밝은 배경(`C.sky`/`C.leaf`/`C.paper`/`C.room` 계열)이라 `C.ink` 스트로크가 뚜렷하게 대비됨. 어두운 배경(`C.night` 계열)을 쓴 장면 없음

## 프로필 추가 체크 (`profiles/general.md` 8절)

- [x] **소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가** - "무지개가 왜 반원 모양인지"는 실제로 자주 목격하지만 검색까지는 잘 안 해보는 소재로, 일상 체감(비 갠 뒤 하늘의 무지개)이 있는 소재다. 순수 백과사전형 지식으로 흘러가지 않았음을 대본 확정 단계에서 이미 검토 완료(오케스트레이터가 승인한 확정 대본 그대로 렌더)

### precheck.mjs 자동 검사

- `KO-STR`(한국어 리터럴), `RANDOM`(Math.random), `NOWRAP`, `WORDBRK`, `FORMAT`(9:16/16:9 불일치), `IMPORT`(배럴 밖 import) - 전부 에러 0 / 관련 경고 0
- `SHAREDOUT` 경고 1건 - 위 "동시 작업 안내" 절 참고, 이 화와 무관한 과거 잔재

## 산출물

- 최종 배포: `/home/lee/project/shorts/ko/[30화] 무지개가 반원인 이유.mp4` (md5 `4a32032a0b7a48d12e0449fedfb936c7`, `out/`의 원본과 일치 확인 후 `out/episode-ko.mp4` 삭제)
- 검수 프레임: `episodes/general-ep30-rainbow-arc/out/frames-ko/` (28장 보존)
- 실측 재생시간: **44.1초** (1323프레임 @ 30fps, 60초 상한 이내)
- 렌더 횟수: 1회 (한국어만, 재렌더 없음)

이렇게 나왔습니다. 확인해주세요.
