# 빌드 리포트 - 32화 "고수가 비누 맛으로 느껴지는 이유" (general-ep32-cilantro-soap)

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 지시 명시). `episode-en.mp4`는 만들지 않았다.

## 동시 작업 안내

31화(`general-ep31-microwave`)가 동시에 다른 세션에서 렌더 중이라는 안내를 받았다. 그 폴더는 건드리지 않았고, 렌더는 항상 `scripts/render.mjs`로만 실행해 공용 루트 `out/`에 쓰지 않았다. `precheck.mjs`가 잡은 `SHAREDOUT` 경고(공용 루트 `out/`의 `frames-en/`·`frames-ko/`)는 타임스탬프(Aug 20)로 확인한 결과 이번 작업·31화 어느 쪽과도 무관한 과거 잔재라 건드리지 않았다. 작업 도중 `assets/props/index.ts`에 다른 세션이 `SaltCycleDiagram` export를 끝에 추가한 것을 확인했는데(append-only), 내가 추가한 `CilantroDiagram` export 줄과 충돌 없이 공존했다.

## 자산

### REGISTRY 대조 결과

- `character/Actor.tsx`(`Actor`/`BustActor`), `scenes/Caption.tsx`(`Caption`/`Label`), `scenes/PopIn.tsx`(`PopIn`), `scenes/SpeechBubble.tsx`(`SpeechBubble`), `backgrounds/PlainBg.tsx`, `props/PlateFoodIcon.tsx`, `props/ThemedIcon.tsx`("leaf" 아이콘), `POSES.idle`, `FontLoader`/`theme.ts`/`timeline.ts`/`anim.ts` - 전부 기존 라이브러리 재사용
- `CaffeineReceptorDiagram`(경쟁적 결합, ep23), `HeadNerveDiagram`(BustActor 오버레이 원칙, ep01), `ScentWaves`(ep25) 확인 - `CaffeineReceptorDiagram`의 "같은 도형 함수를 색만 다르게 써서 닮음을 보여준다" 원칙은 신규 컴포넌트 설계에 그대로 차용했지만, "두 화학 구조를 나란히 놓았다 겹치는" 자산 자체는 REGISTRY에 없어 신규 제작했다(대본이 이미 신규로 명시)
- 오디오: `bite.mp3`(s1 무성 구간 베어 무는 소리, 1화부터 재사용), `intro_ding.mp3`/`outro_ding.mp3`(Intro/Outro 내장, 재사용) - 신규 효과음 제작 없음

### 신규 제작 (1개 파일, 2개 컴포넌트, REGISTRY 등록 완료)

| 자산 | 파일 | 비고 |
|---|---|---|
| `CilantroDiagram` | `assets/props/CilantroDiagram.tsx` | "구조가 닮은 두 분자를 나란히 놓았다가 겹쳐서 닮음을 보여준다"는 범용 다이어그램. `CaffeineReceptorDiagram`의 moleculeGroup 원칙대로 두 분자를 같은 도형 함수(지그재그 결합선 + 끝의 이중결합·빈 원)로 그리고 색만 다르게 써서 "모양이 같다"를 시각적으로 증명한다. `compareProgress` 하나로 결정 |
| `NoseGlowOverlay` | (같은 파일) | `HeadNerveDiagram`과 같은 원칙(새 얼굴 안 그림, BustActor 위에 오버레이)으로 코 위치(RIG 눈·입 좌표 중점) 글로우로 수용체 반응 세기 차이를 보여준다. `intensity` 하나로 결정 |

`props/index.ts`, `REGISTRY.md`에 기존 줄을 건드리지 않고 끝에 추가로 등록했다.

재사용 자산 수: 약 10개(위 목록) / 신규 제작: 1개 파일(컴포넌트 2개). 전부 REGISTRY 등록 완료(공용이므로 언어별로 세지 않음).

## TTS·타임코드 (한국어만, 원칙 1·4)

- `voice=ko-KR-SunHiNeural`, 설명 구간(s3~s6) `rate=+20%/pitch=+30Hz`(프로필 기본값), 리액션 구간(s2) `rate=+32%/pitch=+55Hz`(원칙 - 리액션은 확실히 다른 톤, ep28/ep30과 동일 수치)
- 구간별 실측 길이: s2=4.800s, s3=7.920s, s4=6.840s, s5=6.048s, s6=5.136s (s1은 무성, 대본 지정 3.0초 고정)
- s2->s3(리액션->설명) 전환에 0.6초 여백(원칙 4의 확장 여백 규칙), 나머지는 기본 0.2초
- 본편 총 35.3초, 인트로+제목카드 4.1초, 아웃트로 3.0초 -> **최종 mp4 실측 42.496초**(1273프레임@30fps, 60초 상한 이내)
- 상세 타임코드: `02-script-final-ko.md`

## 렌더

- `node scripts/precheck.mjs episodes/general-ep32-cilantro-soap` - 에러 0 / 경고 1(`SHAREDOUT`, 위 "동시 작업 안내" 절 참고, 이 화와 무관한 과거 잔재)
- `node scripts/render.mjs general-ep32-cilantro-soap ko` - **총 1회 렌더**(재렌더 없이 1차 렌더가 검수를 통과함)
- 1273/1273 프레임, 최종 mp4 42.496초

## 검수 체크리스트 (관찰 기록, 한국어만)

프레임 번호는 `sceneStarts`/`sceneFrames` 계산값 기준(인트로 69f+제목카드 54f=123f 오프셋 포함): 인트로 mid=34, 제목카드 mid=96, s1 시작/베어무는순간/중간=123/163/171, s2 시작/그리마스전환완료/중간=219/235/300, s3 시작/분자분리상태/겹침+라벨직전=381/430/581, s4 시작(크로스페이드로 s3잔상)/최대강도직전/중간=625/695/730, s5 시작/말풍선등장완료/중간=836/862/929, s6 시작/잎3개다등장/뱃지등장=1023/1077/1103, 아웃트로 시작/mid=1183/1228.

- [x] **자막이 화면 밖으로 나가지 않는가** - f007(219,235)·f008(300)·f009~f011(s3)·f013~f014(s4)·f016~f017(s5)·f019~f020(s6) 등 대사가 있는 전 구간 캡션을 확인. 전부 좌우 안전영역(`CAP_SIDE`) 안에서 줄바꿈되고 화면 밖으로 잘리지 않음(예: f007 "으 이거 꼭 비누 씹는 맛 같아 근데", f020 "맛이 점점 옅어진다는 얘기도 있어요")
- [x] **장면 전환 시 캐릭터 잔상** - f006(abs219, s2 로컬f=0)·f012(abs625, s4 로컬f=0)에서 직전 장면(각각 s1 두 캐릭터, s3 분자 다이어그램)이 크로스페이드 구간 동안 여전히 선명하게 남아 있는 것을 확인 - SceneSwitcher의 표준 크로스페이드 동작(새 장면 progress가 초반엔 opacity 0에 가까워 자연스럽게 이전 장면이 비쳐 보임)이고, 정지된 채 겹쳐 남는 이상 잔상은 아님(f007=abs235, f013=abs695에서 새 장면 콘텐츠가 정상적으로 나타남을 확인)
- [x] **등장 전 요소가 점처럼 남아 있지 않은가** - f003(abs123, s1 시작 직후 compareProgress/mouthOpen 등 전부 0에 가까운 지점)이 크로스페이드로 거의 백지에 가까웠고, 실제 캐릭터·플레이트가 점으로 남지 않고 페이드로 자연스럽게 등장(f004=abs163에서 완전히 보임). S3의 `CilantroDiagram`은 `compareProgress` 0에서도 분자 두 개가 이미 좌우로 온전한 모양(zigzag 전체)으로 그려지고 점 흔적이 없음(f010=abs430 확인). S6의 잎 아이콘은 `PopIn`(scale 0.5 -> 1 + opacity)이라 점으로 남지 않음(f018=abs1023, 첫 잎 팝인 시작 지점 확인)
- [x] **라벨이 화면 밖에서 잘리지 않는가** - f012(abs625)의 "알데하이드" 라벨이 겹친 분자 위 여백에 완전히 화면 안으로 표시됨(`CILANTRO_LABEL_PT` 앵커가 다이어그램 위쪽 빈 공간을 가리키도록 계산). S6의 속설 뱃지(가장 긴 화면 문구, 23자)도 f019(abs1077)에서 pill 안에 2줄로 자동 줄바꿈되어 화면 안에 완전히 들어감(`wordBreak:'keep-all'`, `maxWidth:900`)
- [x] **요소끼리 겹치지 않는가** - f012(알데하이드 라벨)이 분자 그래픽·캡션과 겹치지 않고 분리된 여백에 위치. f016(abs862, S5 말풍선)이 두 캐릭터 머리 위에 각각 배치되어 서로 겹치지 않음(`S5_BUBBLE_W=420`으로 좌우 버블 사이 약 60px 간격 확보, 애초에 겹침 방지를 위해 기본 버블 폭(560)보다 좁혀 잡음). f018(S6 잎 3개 + 배지)도 세로로 분리 배치되어 겹치지 않음
- [x] **애니메이션이 최대치에 도달한 프레임에서 겹침을 확인한다** - S3 compareProgress=1 근접(f011, abs581): 두 분자가 겹쳐도 8px 오프셋으로 두 색 모두 보이고 후광이 자연스럽게 뒤에 깔려 텍스트·다른 요소와 겹치지 않음. S4 intensity 최대 근접(f013, abs695): 왼쪽 캐릭터 코 글로우(강함, 반경 큼)가 캐릭터 얼굴 윤곽 안에 들어가고 오른쪽 캐릭터 위치와 겹치지 않음(두 BustActor가 좌우 각각 20px/500px 오프셋으로 충분히 분리). S6 잎 3개 전부 팝인 완료(f019, abs1077): 3개 잎이 가로로 겹치지 않고 늘어서 있고 점선이 잎들 사이 여백을 지나가며 잎과 겹치지 않음(점선 x범위를 `S6_LEAF_XS[0]+90`~`S6_LEAF_XS[2]-90`로 좁혀 잎 아이콘 자체와 안 겹치게 계산)
- [x] **화면 아래쪽 여백이 과다하지 않은가** - s1/s5(두 캐릭터 전신 장면)는 `PAIR_GROUND=1360`으로 기본 GROUND(1250)보다 낮게 잡아 캐릭터가 화면 중하단까지 채움(f005/f017 확인). s2/s4(바스트샷)·s3(다이어그램)·s6(아이콘+배지)은 다이어그램·캡션이 화면 중단~하단을 채워 빈 공간 과다 없음(f008/f014/f020 확인)
- [x] **음량이 충분한가** - `loudnorm=print_format=summary` 측정: Input Integrated -13.5 LUFS / True Peak -2.6 dBTP(클리핑 없음, ep30의 -13.8 LUFS/-2.3dBTP와 유사한 수준). `bite.mp3` 개별 피크(raw max -2.4dB, Remotion volume=0.8 적용 -> 실효 약 -4.3dB)가 내레이션 트랙(`ko_s2.mp3` raw max -3.9dB, volume=1.6 적용 -> 실효 약 +0.2dB)보다 낮음 - 원칙 7 기준 충족
- [x] 자막이 프로필 스타일(폰트·크기·위치)을 따르는가 - `Caption`/`CAPTION_STYLE` 공용 컴포넌트 그대로 사용, 별도 오버라이드 없음
- [x] **화면에 등장하는 모든 문자열이 실제로 언어별로 분기됐는가** - `strings.ts`의 `STRINGS.ko` 테이블에서만 문구를 읽음(title/s3Label/s5LeftQuote/s5RightQuote/s6Badge/outro 문구). `precheck.mjs`의 `KO-STR` 검사가 `src/`(strings.ts 제외)의 JSX 안 한국어 텍스트를 0건으로 확인. 영어판은 만들지 않으므로 ko/en 대조는 해당 없음
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가** - 전 장면이 밝은 배경(`PlainBg` 기본 `C.sky`/`C.paper`/`C.hill` 계열)이라 `C.ink` 스트로크가 뚜렷하게 대비됨. 어두운 배경(`C.night` 계열)을 쓴 장면 없음
- [x] **신체 표현이 최소한인가(원칙 - 징그러움 방지)** - `CilantroDiagram`은 분자를 지그재그 선+원 하나로만(점 여러 개 반복 없음), `NoseGlowOverlay`는 코 위치에 단색 글로우 원 1개(해부학적 디테일 없음)로만 표현. 두 캐릭터의 "찡그림/만족" 대비도 새 얼굴 파츠를 그리지 않고 기존 eyeOpen/blush/headTilt 조합으로만 구현

## 프로필 추가 체크 (`profiles/general.md` 8절)

- [x] **소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가** - "고수가 비누 맛으로 느껴지는 이유"는 실제로 자주 겪는 호불호 경험(고수 특유의 향)이지만 그 원인(유전자 개인차)까지 검색해보진 않는 소재로, 대본 확정 단계에서 이미 검토 완료(오케스트레이터가 승인한 확정 대본 그대로 렌더)
- [x] **한 편에 담는 사실 개수 1개(사슬 2단) 준수** - 대본이 이미 확정한 구조(향 성분의 정체 -> 감지 유전자 개인차)를 그대로 시각화했고, 렌더 단계에서 새 사실을 추가하지 않음

### precheck.mjs 자동 검사

- `KO-STR`(한국어 리터럴), `RANDOM`(Math.random), `NOWRAP`, `WORDBRK`, `FORMAT`(9:16/16:9 불일치), `IMPORT`(배럴 밖 import) - 전부 에러 0 / 관련 경고 0
- `SHAREDOUT` 경고 1건 - 위 "동시 작업 안내" 절 참고, 이 화와 무관한 과거 잔재

## 산출물

- 최종 배포: `/home/lee/project/shorts/ko/[32화] 고수가 비누 맛으로 느껴지는 이유.mp4` (md5 `debae108ebed9f84eec6bc7ae8ef9c14`, `out/`의 원본과 일치 확인 후 `out/episode-ko.mp4` 삭제)
- 검수 프레임: `episodes/general-ep32-cilantro-soap/out/frames-ko/` (22장 보존)
- 실측 재생시간: **42.496초** (1273프레임 @ 30fps, 60초 상한 이내)
- 렌더 횟수: 1회 (한국어만, 재렌더 없음)

이렇게 나왔습니다. 확인해주세요.
