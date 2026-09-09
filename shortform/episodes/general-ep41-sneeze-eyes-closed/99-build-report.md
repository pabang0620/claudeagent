# 41화 빌드 리포트 - 재채기할 때 눈이 저절로 감기는 이유

영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 **한국어판만** 제작했다. 40화(`general-ep40-motion-sickness`)가 다른 세션에서 동시에 렌더 중이었으므로, 공용 파일(`assets/REGISTRY.md`, `assets/props/index.ts`)은 끝에 덧붙이기만 했고 `episodes/README.md`는 건드리지 않았다.

## 자산

### 재사용 (7개)
- `character/Actor.tsx` (`Actor`/`BustActor`) - 캐릭터 배치
- `character/poses.ts` (`POSES.idle`) - 기본 포즈, s1의 눈/입 값은 pose를 직접 확장해 계산
- `props/CilantroDiagram.tsx`의 `NOSE_PT` - 코 위치 앵커 재사용(새 좌표 안 지어냄)
- `props/HeadNerveDiagram.tsx`의 `MOUTH_PT`/`FOREHEAD_PT` - 입/이마(뇌 상징) 앵커 재사용
- `scenes/PopIn.tsx` - s6 아이콘 팝(bounceIn과 조합), s5 QMark는 자체 style로 배치
- `props/Symbols.tsx`의 `QMark` - s5 확신 낮은 설명 표시
- `props/ThemedIcon.tsx` - `bolt`(코 자극) `wind`(코·입) `droplet`(침방울) `meteor`(먼지) `eye`/`x`(s6 속설)

### 신규 제작 (2개, 둘 다 REGISTRY 등록 완료)
- `props/SneezeReflexDiagram.tsx` (`SneezeReflexDiagram`, export `SNEEZE_EYE_PT`/`SNEEZE_BRAIN_PT`) - "하나의 반사 신호가 뇌에서 두 근육군(코·입/눈꺼풀)으로 동시에 분기된다"는 구조 전용 오버레이. HeadNerveDiagram·VoicePathDiagram과 같은 원칙(새 얼굴 안 그림, BustActor 위에 오버레이). `REGISTRY.md` 4절(소품)에 `general-ep41`로 등록.
- `audio/sneeze_burst.mp3` - "에취!" 재채기가 터지는 순간 소리. ffmpeg lavfi(`aevalsrc`+`anoisesrc`) 합성(외부 음원 미사용, 기존 원칙 그대로). `REGISTRY.md` 7절(오디오)에 등록.

### 대본이 "신규"로 지정했지만 재사용으로 대체한 것은 없음
대본 자산 목록에 적힌 신규 항목은 `SneezeReflexDiagram` 하나뿐이었고, REGISTRY 조회 결과 유사 컴포넌트(HeadNerveDiagram/LegNerveDiagram/VoicePathDiagram)가 전부 단일 목적지 구조라 "한 신호가 두 갈래로 동시 분기"를 직접 표현하는 자산이 없어 그대로 신규 제작했다(대본의 판단과 일치).

## 언어별 실측 길이 (한국어만)

- 구간별 발화 길이(edge-tts 실측): s1 4.608s / s2 5.616s / s3 5.520s / s4 5.112s / s5 6.000s / s6 5.904s
- 총 내레이션 길이: 32.76s (구간 여백 0.2s x 6 포함 전체 본편 1018프레임 = 33.93s)
- 전체 영상 길이(ffprobe 실측): **41.088초** (1231프레임 @ 30fps, Intro 69 + TitleCard 54 + 본편 1018 + Outro 90)
- 60초 상한 대비 여유 있음. 영어판이 없어 언어 간 길이 차이 비교는 해당 없음.

## 검수 체크리스트 (한국어, 관찰 기록)

- [x] **자막이 화면 밖으로 나가지 않는가** - f001(s1 시작), f009(s3 중간), f013(s4 중간), f016(s5 중간), f021(s6 중간) 등 추출 프레임 전체에서 자막 박스가 화면 좌우 안쪽에 들어오는 것을 확인. 가장 긴 문장(s3 "이 반사 신호가...")도 2줄로 자연스럽게 분리되어 박스를 벗어나지 않음.
- [x] **장면 전환 시 캐릭터 잔상** - s3->s4(f611/613 인근), s4->s5(774/776/778), s5->s6(958/960/962) 크로스페이드 중간 프레임(2프레임 간격)을 별도 추출해 확인. s1~s4는 전부 같은 BUST_SIZE/BUST_LEFT/BUST_TOP으로 얼굴을 그려 크로스페이드 중에도 두 겹으로 안 보이고 하나의 얼굴처럼 자연스럽게 블렌딩됨(ep01 교훈 적용 결과). s5->s6은 얼굴이 사라지고 아이콘만 남는 구조라 겹침 우려가 없음.
- [x] **등장 전 요소가 점처럼 남아 있지 않은가** - s6의 눈/X 아이콘은 `PopIn`(progress<=0.001이면 null 반환) + `bounceIn` 조합이라 delay 이전 프레임(f960/962, s6 로컬 2프레임)에서 아이콘이 전혀 보이지 않는 것을 확인.
- [x] **라벨이 화면 밖에서 잘리지 않는가** - s2 라벨("재채기 반사")과 s3 라벨("코·입"/"눈꺼풀")을 처음엔 진단 좌표(코/입/눈) 근처에 배치했다가, remotion still 사전 점검에서 이마 안테나와 겹치는 결함을 발견해 화면 상단 고정 위치(y=260)로 재배치했다. 재배치 후 f430/f591에서 라벨이 머리 위 여백에 깔끔하게 들어오는 것을 확인.
- [x] **요소끼리 겹치지 않는가** - s2 코 자극 글로우(bolt 아이콘)가 최초 구현에서 입 곡선과 겹치는 결함을 발견해, 반경을 40->30·중심을 14px 위로 조정(`SneezeReflexDiagram.tsx`). 재조정 후 f377에서 글로우가 입 위에서 분리된 것을 확인. s3/s4의 도착 마커(코·입/눈꺼풀)는 의도적으로 실제 입/눈 위치를 덮는데(HeadNerveDiagram의 하이라이트 관례와 동일), 서로 겹치지는 않음을 확인.
- [x] **화면 아래쪽 여백이 과다하지 않은가** - s1~s5는 캐릭터가 화면 중앙~하단(발끝까지) 채움. s6은 위쪽 여백이 넓은 대신 아이콘+2줄 라벨+자막이 화면 중앙~하단에 배치되어(다른 화의 단일 아이콘형 장면과 동일한 채널 관례) 하단 여백 과다는 아님.
- [x] **음량이 충분한가** - `ffmpeg loudnorm` 실측: Input Integrated -13.3 LUFS, Input True Peak -2.3 dBTP(클리핑 없음). sneeze_burst.mp3 개별 실측 mean -20.0dB/max -3.7dB로 내레이션보다 낮게 유지(원칙 7).
- [x] **자막이 프로필 스타일을 따르는가** - `Caption` 컴포넌트(공용 `CAPTION_STYLE`)를 그대로 사용, 별도 커스텀 없음.
- [x] **화면에 등장하는 모든 문자열이 언어별로 분기됐는가** - 영어판을 만들지 않으므로 해당 사항 아님(한국어 단일 채널). `strings.ts`는 `STRINGS.ko`만 채웠고, 화면 문구(제목/s2~s6 라벨/아웃트로)는 전부 이 테이블을 거쳐 컴포넌트에 하드코딩된 문자열이 없음(precheck.mjs `KO-STR` 규칙 확인).
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가** - 배경이 전부 밝은 톤(sky/goldSoft/seaTop/coralSoft)이라 기본 `C.ink` 스트로크로 충분히 대비됨. 어두운 배경(night 계열)을 쓴 장면 없음.

## 프로필(general) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 재채기와 눈 감김을 겪어봤지만 왜 같이 일어나는지는 잘 모르는 상식형 소재로 적합.
- [x] 어미가 친근한 대화체를 유지하는가 - "~거든요", "~요" 등 확인, 유아어/학술체 없음.
- [x] 전문용어가 등장 자리에서 바로 풀렸는가 - "반사" 외 별도 전문용어 없어 해당 없음.
- [x] 자막 한 줄이 한국어 20자를 넘지 않는가 - `wrapCounts(words, 'ko')` 기본값(20자) 그대로 사용, 커스텀 없음.
- [x] 60초 상한을 넘지 않는가 - 41.09초로 통과.

## 렌더 횟수

- `remotion still` 사전 점검(레이아웃 확인용, 정식 렌더 아님): 총 18프레임(1차 12장 + 라벨/글로우 수정 후 재확인 3장 + intro/titlecard/outro 3장)
- 정식 렌더(`node scripts/render.mjs general-ep41-sneeze-eyes-closed ko`): **1회** (에러 없이 1231/1231 프레임 성공)

## 배포

기술 점검(길이 41.088초 실측, 음성 싱크, 자막 잘림, 팝인 중간 프레임, 크로스페이드 겹침, 애니메이션 정점 프레임 전부 확인)을 통과해 즉시 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[41화] 재채기할 때 눈이 저절로 감기는 이유.mp4`
- md5 대조: 렌더 산출물(`out/episode-ko.mp4`)과 배포본이 동일(`ed7bc06895fc789ec4f7afd83415c348`) 확인 후 `out/episode-ko.mp4` 삭제(정책에 따라 `out/frames-ko/`는 검수 기록으로 보존)

위 항목들은 이 에이전트가 실제로 관찰한 기술적 사실이다. 최종적으로 이 영상을 그대로 써도 되는지는 사용자가 `shorts/ko/`에서 직접 확인해 판단해주시기 바란다.
