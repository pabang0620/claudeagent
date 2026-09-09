# 38화 빌드 리포트 - 종이에 베이면 유독 아픈 이유

영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 **한국어판만 제작**했다. 영어 관련 항목은 전부 해당 없음.

## 자산

### 재사용 (신규 제작 없음)
- `character/Actor`, `BustActor`, `POSES`(idle, surprised) - 내레이터 캐릭터
- `backgrounds/PlainBg` - 배경
- `scenes/Caption`, `scenes/Label` - 자막·화면 라벨
- `scenes/Effects.RadialSpikes` - s1 컷 순간 통증 이펙트(방사형 스파이크, 큰 물결선 계열)
- `assets/audio/cold_zing.mp3` - s1 통증 SFX (REGISTRY 기재상 재사용 가능 명시된 자산)
- `assets/audio/intro_ding.mp3` / `outro_ding.mp3` - 인트로·아웃트로 고정 사운드

### 신규 제작 (REGISTRY.md 등록 완료)
- `FingertipNerveDiagram` (`assets/props/FingertipNerveDiagram.tsx`) - 손가락 끝 신경 다발 클로즈업. 밑동 5곳에서 손끝 한 점으로 모이는 굵은 선 5가닥(점 무리 금지 원칙 반영), `nerveProgress` 진행도.
- `PaperEdgeDiagram` (`assets/props/PaperEdgeDiagram.tsx`) - 종이 단면(톱니, 큼직한 요철 3개) vs 칼날 단면(매끈) 비교 + 피부 단면이 톱니선을 따라 살짝 벌어지는 애니메이션(붉은 액체 없이 두 조각이 벌어지는 것만으로 표현). `edgeRevealProgress`/`compareProgress`/`tearProgress` 3개 독립 진행도.
- `WoundCrossSectionDiagram` (`assets/props/WoundCrossSectionDiagram.tsx`) - 상처 단면 클로즈업(`FingerCrossSection`과 같은 원형 단면 시각 문법 재사용). 절개는 가는 선 하나, 핏방울은 아주 작은 droplet 아이콘 하나(`bloodAmount`), 딱지는 중앙 틈을 항상 남기며 자라는 두 조각(`scabProgress`), 신경 강조(`nerveGlow`).

신규 자산 3개 모두 `assets/props/index.ts`(끝에 추가), `assets/REGISTRY.md`(TwinkleDiagram 행 다음에 3행 추가)에 등록 완료. 기존 줄은 건드리지 않았다(끝에 덧붙이기만).

REGISTRY 사전 조회 결과: `HeadNerveDiagram`(머리), `LegNerveDiagram`(다리), `VoicePathDiagram`(머리/귀)는 있었으나 손가락 끝 신경 밀도, 종이 단면 톱니, 상처 피딱지를 다루는 자산은 없어 신규 제작이 타당했다(대본이 "신규"로 표기한 3개와 정확히 일치).

## 언어별 실측 길이 (한국어만)

내레이션 구간 합계 34.944초(s1 5.088 + s2 6.648 + s3 5.592 + s4 5.112 + s5 5.952 + s6 6.552), 여백 포함 화면 구간(main) 36.567초. Intro 2.3s + TitleCard 1.8s + Outro 3.0s 포함 **전체 43.712초**(1310프레임 @ 30fps, ffprobe 실측). 대본 추정치(약 53초)보다 짧게 나왔으나 원칙 4에 따라 늘리지 않고 실측 그대로 냈다.

상세 타임코드는 `02-script-final-ko.md` 참고.

## 검수 체크리스트 (관찰 기록)

프레임은 `sceneStarts`로 계산한 각 구간의 시작 직후 + 중간 지점 위주로 24장(intro/title/s1~s6/outro)을 추출해 확인했다(`out/frames-ko/`, 재렌더 시 폴더 비우고 새로 추출).

- **자막 화면이탈**: f001~f024 전체 확인. 모든 자막이 좌우 여백을 두고 박스 안에 들어온다. 가장 긴 줄("종이에 손가락 끝을 살짝 베였을")도 화면 폭을 넘지 않았다.
- **장면 전환 캐릭터 잔상**: s1(캐릭터 등장) -> s2(다이어그램, 캐릭터 없음) 전환 프레임(f005~f006, 260->300)에서 캐릭터 잔상 없음.
- **등장 전 요소가 점처럼 남음**: 1차 렌더에서 `FingertipNerveDiagram`의 신경 다발이 `nerveProgress=0`일 때 5가닥이 만나는 지점(TIP)에 서브픽셀 점 아티팩트가 뭉쳐 보이는 결함을 f006(s2 시작, 로컬 6프레임)에서 발견 - `pathLength=1`/`strokeDasharray=1` dashoffset 트릭이 offset=1(정확히 dash/gap 경계)일 때 생기는 렌더링 경계 케이스였다. `nerveProgress > 0.001`일 때만 그리도록 가드를 추가해 재렌더 후 f006에서 점이 사라진 것을 확인했다.
- **라벨이 화면 밖에서 잘림**: 없음. 다만 1차 렌더에서 **라벨이 도형과 겹치는** 결함 2건을 발견해 고쳤다(아래 참고).
- **요소끼리 겹침**: 1차 렌더 f010(s3, 505+55=560)에서 "종이 단면" 라벨 텍스트가 종이 블록 상단 테두리 선과 겹쳐 글자가 선에 걸려 잘려 보이는 결함을 발견. `PAPER_EDGE_LABEL_PT`/`BLADE_EDGE_LABEL_PT`의 y 오프셋을 늘려(-34 -> 각각 -110/-70) 재렌더 후 f010~f012에서 겹침이 해소된 것을 확인. 같은 1차 렌더 f020(s6, 1017+63=1080)에서 `WoundCrossSectionDiagram`의 딱지(scab) 조각이 원형 단면 바깥 테두리를 벗어나 삐져나오는 결함도 발견 - 딱지 폭(`R_INNER*0.72`)과 상단 y좌표가 그 높이의 원 폭을 넘어섰던 것이 원인. 폭을 `R_INNER*0.5`로 줄이고 y좌표를 원 안쪽으로 조정해 재렌더 후 f020~f022에서 원 밖으로 삐져나오지 않는 것을 확인.
- **화면 하단 여백 과다**: s2·s5·s6의 다이어그램(폭 380~520px)이 화면 세로 중앙~중하단(y=560~700 부근)에 배치되어 안전영역 안에서 시각적으로 채워진다. s1은 캐릭터(높이 820px, ground=1460)가 화면 하단까지 자연스럽게 채운다.
- **음량**: `ffmpeg -af loudnorm=print_format=summary` 실측 - Input Integrated -13.4 LUFS, Input True Peak -0.5 dBTP. 극단적으로 작지 않다(다른 화와 유사한 볼륨 설정 - 내레이션 volume=1.6, SFX volume=0.85~0.7로 SFX가 내레이션보다 작게 믹스됨).
- **자막 스타일**: `assets/theme.ts`의 `CAPTION_STYLE`/`FS.caption`(50px)을 그대로 썼고, `wrapCounts`(ko 20자 상한)로 줄바꿈했다. 프로필 지정 위치(화면 하단에서 위로 약 23%)를 `CAP_BOTTOM` 공용 상수 그대로 사용.
- **화면 문자열 언어별 분기**: 이 화는 한국어만 제작하므로 ko/en 대조는 해당 없음. 다만 화면에 노출되는 모든 라벨 문자열("신경 밀도 최고", "종이 단면", "칼날 단면", "피 적음", "공기에 그대로 노출", 제목)은 컴포넌트에 하드코딩하지 않고 전부 `strings.ts`의 `STRINGS.ko`에서 읽는다(컴포넌트 안에 문자열 리터럴 없음, `node scripts/precheck.mjs`의 `KO-STR`/`JSX 한국어` 규칙과 별개로 육안 확인).
- **캐릭터 윤곽선과 배경 명암비**: 모든 장면이 밝은 `PlainBg`(하늘색~흰색) 배경이라 어두운 배경용 글로우 처리는 필요하지 않았다(원칙 5 예방책 (a)는 밤하늘 등 어두운 배경 전용이며 이 화는 해당 없음).

### 프로필(general) 추가 체크
- 소재는 "종이에 베였는데 유독 아픈" 생활 체감 경험 - 일상 체감 없는 순수 백과사전형 지식이 아니다.
- 어미는 "~있어요", "~거든요", "~거예요" 등 친근한 대화체를 유지했고 유아어·학술 문어체 없음.
- 전문용어("신경", "피딱지")는 일상어 수준이라 별도 풀이 없이도 이해 가능한 범위(대본이 이미 이렇게 판단해 승인됨).
- 자막 한 줄 20자 상한 확인(위 자막 화면이탈 항목과 동일 확인).
- 43.712초로 60초 상한 이내.

### 이 화 전용 시각 주의사항 이행 확인
- 베인 자리: `PaperEdgeDiagram`(s4)과 `WoundCrossSectionDiagram`(s5·s6) 모두 가는 선/작은 틈으로만 표시, 붉은 액체·벌어진 살 사실적 묘사 없음(f013~f022 확인).
- 종이 톱니: `PAPER_EDGE_PTS`/`TEAR_PTS` 둘 다 큼직한 요철 3개로 단순화, 촘촘한 잔니 없음(f009~f015 확인).
- 손끝 신경: `FingertipNerveDiagram`의 신경 다발은 굵은 선 5가닥, 점 무리 없음(f007~f008 확인).
- 통증 표현: s1 컷 순간 `RadialSpikes`(큰 방사형 스파이크) + 캐릭터 `POSES.surprised` 블렌드 표정으로 표현(f004~f005 확인).

## 렌더 횟수

한국어 2회(1차: 라벨 겹침·아티팩트 결함 있음 -> 결함 3건 수정 후 2차 재렌더로 확정).

## 배포

기술 점검(위 체크리스트)을 통과해 즉시 배포했다.

- 최종 mp4: `/home/lee/project/shorts/ko/[38화] 종이에 베이면 유독 아픈 이유.mp4`
- 배포 직후 md5 대조 완료(원본 `out/episode-ko.mp4`와 일치 확인) 후 `out/`의 mp4는 삭제(`out/frames-ko/`는 검수 기록으로 보존).
- 실측 재생시간: 43.712초 (1310프레임 @ 30fps)

이 리포트는 관찰 사실만 기록한 것이며, "검수 통과"·"합격" 같은 최종 판정은 포함하지 않는다. `shorts/ko/`에 반영된 상태이니 실제 확인은 사용자가 진행해달라.
