# 79화 "압력밥솥이 밥을 빨리 익히는 이유" 빌드 리포트

## 산출물

- 배포: `/home/lee/project/shorts/ko/[79화] 압력밥솥이 밥을 빨리 익히는 이유.mp4`
  (md5 `c4cf373ed47c03e40aea5e8a28a03c0c`, 배포 전후 원본과 md5 일치 확인)
- 실측 재생시간: 41.344s (ffprobe), 1239 frame @ 30fps, 1080x1920
- 영어판은 만들지 않았다(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시). `episode-en.mp4` 없음.
- 배포 후 `out/episode-ko.mp4`는 삭제했다. `out/frames-ko/`(검수 프레임 17장), `out/stills/`(스틸 선점검 14+1장)는 보존.

## 자산 재사용/신규

### 재사용 (공용 라이브러리)
- `backgrounds/PlainBg`
- `scenes/Caption`의 `Label`
- `scenes/CompareBars` (s1 압력밥솥 vs 일반 냄비 조리시간 비교)
- `scenes/Counter`의 `CountUp` (s5 온도 상승 숫자)
- `brand/Intro`, `brand/Outro`, `scenes/TitleCard` (표준 인트로/아웃트로/제목카드)

### 신규 - REGISTRY 등록 완료
- `PressureBoilingDiagram` (`assets/props/PressureBoilingDiagram.tsx`)
  - REGISTRY.md 추록 절에 등록 완료 (등록 여부 재확인함 - `grep -n "PressureBoilingDiagram" assets/REGISTRY.md`로 존재 확인)
  - `assets/props/index.ts`에 export 추가도 함께 확인 (등록 누락 없음 - 77화에서 export만 하고 REGISTRY 등록을 빠뜨린 사고 재발 방지 차원에서 두 파일 모두 grep으로 재확인)
  - `mode` prop(`'graph'|'cooker'|'altitude'|'bowl'`) 하나로 압력-끓는점 그래프(s2/s3), 압력밥솥 단면(s4/s5), 높은 산 대조(s6), 완성된 밥(s7)까지 4개 화면을 커버
  - REGISTRY 확인 절차: `MicrowaveDiagram`/`PlateFoodIcon`(31화), `FridgeCycleDiagram`(68화)를 먼저 검토했으나 "압력이 오르면 끓는점도 같이 오른다"는 상관관계 자체와 그래프 표현은 다루지 않아 새로 만들었다(REGISTRY.md 본문에 검토 근거 기재)

### 에피소드 로컬 (지역성 우선 원칙 - 등록하지 않음)
- `PotIcon` (s1 냄비/압력밥솥 비교 아이콘) - CompareBars 위에 얹는 이 화 전용 장식 아이콘이라 재사용 가능성이 낮아 `src/scenes.tsx`에 로컬로 뒀다

## TTS/립싱크

- 화 전체가 3인칭 설명 내레이션(리액션+훅 질문 구조 없음)이라 리액션 구간 톤 분리 불필요 - 전 구간 프로필 기본값(`ko-KR-SunHiNeural`, rate+20%, pitch+30Hz) 그대로 사용
- 캐릭터가 등장해 말하는 장면이 없음(ep71/ep72와 동일한 순수 다이어그램 구성) - `rms_mouth.py`는 파이프라인 표준 절차대로 실행해 `ko_mouth.json`을 생성했으나 실제 씬 코드에서는 사용하지 않음
- 내레이션 실측 합계 32.784s (s1 4.032 / s2 3.624 / s3 3.840 / s4 5.592 / s5 4.992 / s6 5.640 / s7 5.064), 대본 추정치(약 44s)보다 짧게 나왔으나 늘리지 않았다(원칙 4)

## 기술 점검

- `precheck.mjs`: 에러 0, 경고 1(`SHAREDOUT` - 공용 루트 `shortform/out/`에 `frames-en/`·`frames-ko/`가 있었음. 이 화가 아닌 다른 화의 잔여물로 판단해 손대지 않음)
- 렌더: `node scripts/render.mjs general-ep79-pressure-cooker ko` 1회로 완료 (재렌더 없음 - 스틸 선점검에서 결함을 미리 잡음)
- `ffprobe`: duration=41.344s, 1080x1920, 30fps, nb_frames=1239 (계산값 1239와 일치)
- `loudnorm` 실측: Input Integrated -13.9 LUFS / Input True Peak -2.3 dBTP (스트리밍 관행치 -14 LUFS에 근접 - 재정규화가 필요한지는 사용자가 직접 청취 후 판단할 부분)

## 스틸 선점검에서 잡은 결함 (렌더 전, 2건)

1. **s2/s3 그래프 y축 "끓는점" 라벨이 축 화살촉과 겹침.** `remotion still --frame=350`(s2 peak)에서 "끓는점" 글자가 화살촉 도형과 뭉개져 보임을 확인 -> `scenes.tsx`의 Label y 오프셋을 `axisBoilPt.y - 10`에서 `axisBoilPt.y - 58`로 올려 화살촉 위로 분리. 재렌더한 스틸(`s2_peak_f350.png`, `s3_peak_f465.png`)에서 겹침 해소 확인.
2. **s5 압력밥솥 온도계의 "100" 눈금 숫자가 뚜껑 밀폐 클립(검은 사각형)에 가려짐.** `remotion still --frame=790`(s5 peak)에서 "100"의 뒤 두 자리가 클립 뒤로 숨어 "1"만 보임을 확인 -> `PressureBoilingDiagram.tsx`의 온도계 위치를 `cx=110`에서 `cx=40`으로 왼쪽으로 옮기고, 앵커 `PB_THERMO_PT`도 `{x:110,y:360}`에서 `{x:40,y:300}`으로 함께 수정. `scenes.tsx`의 `CountUp` 오프셋도 새 앵커에 맞춰 `-200`에서 `-90`으로 조정. 재렌더한 스틸(`s5_peak_f790.png`)에서 "100"·"118°C"·클립이 서로 안 겹치는 것을 확인.

이 2건은 **전부 스틸 선점검(렌더 전)에서 발견해 렌더를 태우기 전에 고쳤다.** 최종 mp4 렌더는 두 수정을 반영한 코드로 1회만 실행했고, **렌더 후에 새로 발견한 결함은 없다.**

## 검수 체크리스트 (관찰 기록, `out/frames-ko/f001~f017` + `out/stills/` 전체 확인)

- [x] 자막 화면이탈: f001~f017 전체 확인. 가장 긴 문장(s4, "압력밥솥은 뚜껑을 꽉 막아서...")도 캡션 박스 폭 안에서 1줄로 들어가고 좌우 잘림 없음(`s4_early_f506.png`)
- [x] 장면 전환 캐릭터 잔상: 캐릭터가 등장하는 화면 없음(ep71/72와 동일한 순수 다이어그램 구성). Intro/Outro/TitleCard의 캐릭터는 표준 공용 브랜드 자산이라 이 화에서 새로 발생하는 잔상 없음
- [x] 등장 전 요소가 점처럼 남아 있는지: 코드 확인 결과 전부 `opacity`(progress() 기반) 페이드인만 쓰고 `scale(0)` 방식을 쓴 곳이 없음 - 점 잔상 발생 구조 자체가 없음
- [x] 라벨이 화면 밖에서 잘리는지: 14개 스틸 + 17개 최종 프레임 전체에서 라벨이 캔버스(1080x1920) 경계를 벗어난 곳 없음
- [x] 요소끼리 겹침: 위 "스틸 선점검에서 잡은 결함" 2건을 렌더 전에 수정. 이후 재검토한 스틸+최종 프레임에서 추가 겹침 관찰되지 않음
- [x] 화면 아래쪽 여백 과다: s4~s7은 다이어그램(y=440~1150)과 캡션(y~1478 시작) 사이에 약 300~350px 공백이 있으나, 이는 71/77화 등 같은 `PlainBg`+단일 다이어그램+`Caption` 구성 화들이 공유하는 기존 레이아웃 패턴이며 이 화에서 새로 벌어진 것이 아님. 콘텐츠는 세로 중앙~하단까지 채워짐
- [x] 음량: `loudnorm` 실측치 위 기재. 정량 수치만 보고하며 "충분하다"는 최종 판단은 하지 않음
- [x] 자막 스타일: `FS.caption`(50px)·`CAPTION_STYLE`(흰 배경+검은 테두리) 프로필 표준 그대로, 로컬 커스텀 없음
- [ ] 영어판 화면 문자열 언어별 분기: 해당 없음(한국어판만 제작 - 원칙 6 명시 예외)
- [x] 캐릭터 윤곽선 대비: 캐릭터가 등장하는 장면은 Intro/Outro/TitleCard뿐이고 전부 밝은 배경(`C.sky`/`C.paper`) 위 `C.ink` 스트로크의 기존 검증된 공용 브랜드 자산 - 이 화에서 새로 확인이 필요한 어두운 배경 장면 없음

### 프로필(general) 추가 체크
- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가: 압력밥솥 조리시간 체감 소재
- [x] 어미가 친근한 대화체("~거든요", "~올라가요", "~거예요")를 유지하고 유아어/문어체로 치우치지 않았는가: `script-ko.json` 원문 그대로 확인
- [x] 전문용어("압력", "끓는점")가 등장 즉시 그래프·수치로 풀렸는가: s2 그래프+s5 온도 숫자로 시각화
- [x] 자막 한 줄 20자 상한: `wrapCounts(words, 'ko')` 공용 함수 그대로 사용, 별도 상한 초과 없음
- [x] 60초 상한: 41.3s로 이내

## 렌더 횟수

- ko: 1회 (스틸 선점검에서 결함 2건을 렌더 전에 잡아 재렌더 없이 완료)
- en: 0회 (제작하지 않음)

---

위 내용은 관찰한 사실과 기술 점검 결과이며, "검수 통과"·"합격" 같은 최종 판정은 아니다. 실제 배포본(`/home/lee/project/shorts/ko/[79화] 압력밥솥이 밥을 빨리 익히는 이유.mp4`)을 직접 확인해주세요.
