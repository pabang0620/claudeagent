# 빌드 리포트 - general-ep52-penguin-feet (52화, 펭귄이 얼음 위에서도 발이 안 시린 이유)

영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)에 따라 **한국어판 1개만** 제작했다. `episode-en.mp4`는 만들지 않았다.

동시에 51화(`general-ep51-fried-crispy`)가 다른 세션에서 병렬 렌더 중이었다. 51화 폴더는 건드리지 않았고, 공용 파일(`assets/props/index.ts`, `assets/REGISTRY.md`)은 기존 줄을 그대로 두고 끝에만 추가했다. `episodes/README.md`는 지시대로 건드리지 않았다.

## 자산

### 재사용 (REGISTRY 대조 후 그대로 사용)
- `scenes/CompareBars` - s4(몸통 vs 발), s5(얼음 vs 발) 온도 비교 막대
- `scenes/CardGrid` - s7 북극여우·순록 비교 카드(각 카드는 `ThemedIcon name="paw"`로 채움 - 새 동물 소품을 만들지 않고 발자국 아이콘으로 대체)
- `props/ThemedIcon` - 'paw'(s7), 'snowflake'(s1) 둘 다 기존 캐시에 이미 있던 아이콘이라 신규 동기화 없이 그대로 사용
- `scenes/TitleCard`, `brand/Intro`, `brand/Outro`(`lang="ko"`)
- `assets/audio/intro_ding.mp3`, `outro_ding.mp3` - 기존 확정 효과음 재사용, 신규 효과음 제작 없음(이 화는 무성 동작 구간이 없어 별도 효과음도 필요하지 않았다)
- `backgrounds/PlainBg` - `top=C.water`(얼음빛) `bottom=C.paper`(눈) 조합으로 얼음·설원 톤 구현

### 신규 제작 (REGISTRY 등록 완료, `assets/props/index.ts`에도 export 추가)
- `assets/props/Penguin.tsx` - 펭귄 전신(정면). 대본 자산 목록이 "신규"로 지정한 항목이었고, 44화 `Bird`(옆모습 참새류)로는 "두 발이 동시에 보여야 하는" 이 화의 요구를 채울 수 없어(측면 관례로는 한쪽 발만 보임) 새로 만들었다. 볼링핀형 단일 실루엣 + 흰 배 패치(ink 외곽선 포함, 배경과의 대비 확보) + 부리 + 지느러미 2 + 발 2 + 눈 2로만 구성.
- `assets/props/CounterCurrentDiagram.tsx` - 동맥·정맥이 나란히 붙어 열을 주고받는 역류 열교환 다이어그램. 대본이 지정한 대로 LegNerveDiagram(신경 압박용, 혈관과 무관)을 재사용하지 않고 신규 제작. `revealProgress`/`heatProgress`/`f` 3개 진행도로 s2a~s3 전 구간을 커버.

두 자산 모두 `assets/REGISTRY.md`에 `FriedCrustDiagram`(51화) 행 바로 뒤에 추가했다(기존 줄 변경 없음).

## 언어별 실측 길이

- **한국어만.** `02-script-final-ko.md` 참고.
- 발화 실측 합계(s1~s7): 37.776초
- 본편(s1~s7) 합계: 1180프레임 = 39.33초
- 전체(인트로+타이틀카드+본편+아웃트로): **1393프레임 = 46.43초** (ffprobe 실측 `duration=46.485333`, 컨테이너 오차 범위 내)
- 모든 구간이 설명형 서술이라(리액션+훅 질문 구간 없음) 전 구간 프로필 기본 여백(0.2초)만 사용, 별도 전환 여백 확대 없음.

## 렌더 횟수

- precheck: 2회 (1차 에러 0/경고 1(SHAREDOUT, 51화 이전 산출물로 확인 후 무시), 코드 수정 후 2차도 동일)
- `remotion still` 프리뷰: 총 13프레임 (1라운드 10프레임에서 s4/s5 온도 비교 막대의 상단 여백 과다, s6 발 클로즈업이 자막 박스와 거의 붙는 문제 2건 발견 -> 좌표 수정 -> 2라운드 3프레임으로 해소 확인)
- 전체 mp4 렌더: **1회** (`node scripts/render.mjs general-ep52-penguin-feet ko`, 1393/1393 프레임 성공. intro_ding/outro_ding mp3를 렌더 전에 미리 `public/audio/`에 복사해둬 25·29·50화의 404 재발을 막았다)

## 기술 점검 (관찰 사실 기록, 최종 판정 아님)

- [x] **자막 화면이탈**: 최종 mp4에서 뽑은 20개 대표 프레임(인트로~아웃트로 전 구간 시작·중간, `out/frames-ko/f001~f020.png` + 타이틀카드 1장) 전부 Read로 직접 확인. 가장 긴 캡션도 좌우 여백 안에 들어옴. 좌우 잘림 없음.
- [x] **장면 전환 시 캐릭터 잔상**: f005(글로벌 264, s2a 첫 프레임)에서 SceneSwitcher 기본 크로스페이드(xfade=6, fadeIn=8) 구간이라 직전 s1 펭귄이 아직 불투명하게 남아있는 것을 확인 - 코드상 s1 시퀀스 길이가 `frames[0]+xfade`로 6프레임 더 연장되는 설계이므로 의도된 크로스페이드다(f007 s2b 시작 프레임에서는 완전히 넘어감을 확인).
- [x] **등장 전 요소가 점처럼 남는 문제**: `CounterCurrentDiagram`은 `legVisibleH`/`pipeVisibleH`가 0.5px 이하면 그룹 자체를 안 그리는 조건부 렌더(scale-0 방식이 아님), `CompareBars`/`CardGrid`는 이미 검증된 opacity+spring 방식 그대로 재사용 - 프레임 확인 결과 잔점 없음.
- [x] **라벨이 화면 밖에서 잘림**: s4/s5 "몸통"/"발"/"얼음" 라벨, s6 "차갑지만 안 얼어요" 배지(중앙 정렬), s7 "북극여우"/"순록" 카드 라벨 전부 화면 안에 여유 있게 들어옴(f012, f014, f016, f018 확인).
- [x] **요소끼리 겹침**: CounterCurrentDiagram의 SVG `<defs>` clipPath/gradient id를 `useId()` 기반으로 개별 생성해 SceneSwitcher 크로스페이드 중 두 인스턴스가 동시에 마운트돼도 서로의 clip을 참조하지 않게 했다(고정 문자열 id였다면 s2a/s2b/s3 전환 6프레임 구간에서 충돌 가능성이 있었음 - 코드 리뷰로 발견해 처음부터 useId로 구현). f008/f010에서 열교환 화살표·흐름 마크가 파이프 경계를 정확히 지나는 것을 확인.
- [x] **화면 아래쪽 여백 과다**: 1라운드 스틸 프리뷰에서 s4/s5(CompareBars, Y=760)와 s6(Penguin 클로즈업, Y=1480)이 상단 여백 과다·자막 박스와 거의 붙음 문제로 발견됨 -> S4/S5는 Y=580·rowGap=280·thickness=64로 재배치(상단 gap 760->580, 막대 굵기 확대로 존재감 보강), S6은 Y=1480->1380으로 100px 올려 자막 박스와 확실히 분리. 재렌더 후 f012/f014/f016에서 개선 확인.
- [x] **음량**: `ffmpeg -af loudnorm=print_format=summary` 측정 - Input Integrated -13.5 LUFS / Input True Peak -2.2 dBTP. 클리핑 없음(다른 화 실측치 -13~-14 LUFS 대와 일치).
- [x] **자막 스타일**: `Caption` 공용 컴포넌트 그대로 사용, 프로필 기본 폰트·크기·위치 그대로 따름(오버라이드 없음).
- [x] **화면 문자열 언어 분기**: 한국어 단일 채널이라 언어 대조는 해당 없음. 화면에 나오는 모든 문자열(제목, "몸통"/"발"/"얼음", "차갑지만 안 얼어요", "북극여우"/"순록", 아웃트로 문구)이 `strings.ts`의 `STRINGS.ko`를 거치는지 코드로 확인 - 컴포넌트에 하드코딩된 한국어 리터럴 없음(`precheck.mjs`의 `KO-STR` 규칙도 에러 0으로 통과).
- [x] **캐릭터 윤곽선-배경 대비**: 어두운 배경(`C.night` 계열) 장면이 없어(전부 `C.water`/`C.paper` 밝은 톤) 해당 사항 없음. 대신 이 화 고유 위험(밝은 배경 위 흰 배 패치)을 확인 - Penguin의 배 패치에 몸통과 동일 두께(`SW`)의 ink 외곽선을 둘러 f003/f005/f016/f018에서 흰 배경과 흰 배 패치가 뚜렷이 구분되는 것을 확인.
- [x] **precheck.mjs**: 에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `out/`의 `frames-ko/`·`frames-en/`는 타임스탬프 2026-08-20으로 이 화 작업 이전의 다른 화 산출물임을 확인, 지우지 않고 그대로 둠).

## 산출물

- 배포 완료: `/home/lee/project/shorts/ko/[52화] 펭귄이 얼음 위에서도 발이 안 시린 이유.mp4` (md5 `7d1b2fd64c642d7962e32e643abf288a`, `out/`의 원본과 일치 확인 후 `out/episode-ko.mp4` 삭제)
- 검수용 프레임: `episodes/general-ep52-penguin-feet/out/frames-ko/` (f001~f020 + title.png, 최종 mp4에서 재추출)
- 실측 재생시간: 46.43초 (ffprobe `duration=46.485333`, nb_frames=1393, 30fps)

이렇게 나왔습니다. 확인해주세요.
