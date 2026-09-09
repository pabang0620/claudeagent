# 빌드 보고 - general-ep85-volcano (화산이 갑자기 펑 터지는 이유)

한국어판 1개만 제작했다(영어 채널 Whymo 운영 중단, 2026-09-02 오케스트레이터 명시 지시).

## 1. 자산 재사용 / 신규

### 재사용 (REGISTRY 대조 완료, 새로 만들지 않음)
- `character/Actor`, `character/BustActor`, `character/poses`(idle, surprised) - 캐릭터 배치·포즈
- `backgrounds/PlainBg` - 기본 배경
- `scenes/Caption`, `scenes/Label` - 자막·라벨
- `scenes/Effects`의 `FlashOverlay` - s6 폭발 임팩트 섬광
- `assets/timeline.ts`의 `sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`
- `audio/intro_ding.mp3`, `audio/outro_ding.mp3` - 인트로·아웃트로 확정 사운드(공용)
- `audio/thunder_boom.mp3`(general-ep46 신설, REGISTRY에 "폭발·먼 충격음 등 낮은 rumble 전반 재사용
  가능"으로 이미 등록돼 있어 새로 합성하지 않고 그대로 재사용 - s1 무성 구간 SFX)

### 신규 제작 (REGISTRY.md·`assets/props/index.ts` 등록 완료, 추록 절에 기존 줄 보존한 채 끝에 추가)
- `props/VolcanoDiagram.tsx` - 화산 땅속 단면(마그마 방 + 화산 통로 + 정상 분화구) 다이어그램.
  REGISTRY 확인 결과 `PressureBoilingDiagram`(general-ep79)이 압력-끓는점 상관관계를 다루지만
  인과 방향이 반대이고(압력↑→끓는점↑ vs 이 화는 압력↓→기체팽창→폭발), 화산 단면 자체를 다루는
  소품이 없어 새로 만들었다. `dissolvedGasProgress`/`pressureProgress`/`risingProgress`/
  `expandProgress`/`eruptProgress`/`viscosity` 6개 독립 progress로 s3~s7 전부를 커버한다.
  `SaltCycleDiagram`의 산 실루엣 좌표 관례를 계승했고, clipPath id는 `useId()`로 인스턴스별
  고유화해 s7에서 2개를 나란히 써도 충돌하지 않는다.

REGISTRY.md "추록" 절과 `assets/props/index.ts` 양쪽에 등록했다. 기존 줄은 건드리지 않고 파일 끝에
덧붙이기만 했다(동시 작업 중인 general-ep84 폴더·`episodes/README.md`는 손대지 않았다).

## 2. 한국어 실측 길이 (원칙 1·4)

TTS voice=ko-KR-SunHiNeural. 기본 rate+20%/pitch+30Hz, s2(리액션+훅 질문 "우와, 화산은 왜
저렇게 갑자기 펑 터지는 거지?")만 rate+32%/pitch+55Hz로 부스트했다(원칙 1, ep02~84 기준값 준용).

| 구간 | 실측(초) |
|---|---|
| s1(무성, 고정) | 2.200 |
| s2 | 3.504 |
| s3 | 5.976 |
| s4 | 6.168 |
| s5 | 7.128 |
| s6 | 7.824 |
| s7 | 9.000 |
| 본편 합계 | 41.800(순수 발화+무성) / 43.40초(여백 포함, 1302F) |
| 전체(인트로+제목카드+본편+아웃트로) | 50.50초(1515F, 30fps) |

상세 프레임 표는 `02-script-final-ko.md` 참고. 60초 상한(profiles/general.md) 안에 있다.

## 3. 기술 점검 (원칙 5)

### precheck.mjs
`node scripts/precheck.mjs episodes/general-ep85-volcano` - 에러 0, 경고 1(`SHAREDOUT`).
경고는 공용 루트 `shortform/out/`에 남아 있는 2026-08-20 타임스탬프의 구버전 프레임 폴더
(`frames-ko/`, `frames-en/`, f001~f002 확인 결과 이 화의 프레임 수와 무관한 오래된 잔재)를
가리킨 것으로, 이번 렌더가 만든 것이 아니다. 다른 화가 소유했을 수 있어 삭제하지 않고 그대로
두었다.

### TypeScript
`npx tsc --noEmit -p tsconfig.json` - `general-ep85`·`VolcanoDiagram` 관련 에러 0건. (전체 결과에는
다른 화·공용 소품의 기존 `noUnusedLocals` 경고가 섞여 있으나 이 화와 무관해 건드리지 않았다.)

### 렌더
`node scripts/render.mjs general-ep85-volcano ko` 1회. 1515/1515 프레임 렌더 성공,
`out/episode-ko.mp4`(6.4MB, 1080x1920, 30fps, 50.56초 실측) 생성.

### 오디오 레벨
- 전체 믹스: `ffmpeg loudnorm=print_format=summary` - Input Integrated -13.9 LUFS, Input True Peak
  -2.3 dBTP (클리핑 없음)
- 개별 소스(Episode.tsx가 실제로 곱하는 volume 적용, 원칙 7 - s1은 SFX와 내레이션이 겹치지 않는
  구간이라 개별 측정만으로 충분): `thunder_boom.mp3`(volume=0.9) max -8.1dB / mean -18.5dB
  vs `ko_s2.mp3`(volume=1.6, 리액션 구간) max -0.0dB, `ko_s6.mp3`(volume=1.6, 폭발 구간) max
  0.0dB. SFX 피크가 내레이션 피크보다 뚜렷이 낮다(약 8dB 차이) - 원칙 7 충족.

## 4. 검수 체크리스트 (관찰 기록, 원칙 5 - "통과" 자체판정 아님)

**스틸 선점검(렌더 전, `remotion still`)에서 잡아 렌더 전에 고친 것:**
- s7(묽은 마그마 vs 끈적한 마그마 비교) 초기 배치(`S7_DIAG_W=380, S7_Y=320`)에서 다이어그램
  하단(y≈863)과 자막 영역(y≈1478) 사이에 약 615px의 과다한 빈 공간이 관찰됐다("21화 이후
  결함 B - 화면 아래쪽 여백 과다"). 렌더 전에 `S7_DIAG_W=440, S7_Y=560`으로 키우고 내려서
  하단 여백을 약 289px로 줄인 뒤(f`s7_v2_f1349.png` 재확인) 최종 렌더에 반영했다. 이 수정
  덕분에 최종 렌더는 1회로 끝났다.
- s6 FlashOverlay의 "at" 프레임(정확히 그 프레임)에서는 opacity가 아직 0(램프 시작점)이라
  섬광이 안 보인다는 것을 스틸로 미리 확인해, 검수 프레임을 "at+rise" 시점으로 옮겨 실제
  피크 밝기(f`s6_flashpeak_f1012.png`, 화면 전체가 옅은 골드 톤으로 밝아짐)를 별도로
  확인했다 - 컴포넌트 결함이 아니라 검수 프레임 선택 문제였다.

**렌더 후(최종 mp4에서 ffmpeg로 추출한 프레임)에서 관찰만 하고 결함으로 이어지지 않은 것:**
- s6→s7 전환 경계(글로벌 프레임 1149 부근, `SceneSwitcher`의 기본 6프레임 크로스페이드
  구간)에서 화산 3개(직전 s6의 큰 다이어그램 1개 + 전환 중인 s7의 작은 다이어그램 2개)가
  겹쳐 보이는 과도기 프레임(f1152)을 확인했다. 이는 이 화의 컴포넌트 결함이 아니라
  `assets/scenes/SceneSwitcher.tsx`의 표준 크로스페이드(xfade=6프레임=0.2초)가 레이아웃이
  크게 다른 두 장면(큰 다이어그램 1개 -> 작은 다이어그램 2개) 사이를 이을 때 항상 나타나는
  과도기 현상이며, ep83 등 기존 화의 유사한 "단일 확대 -> 좌우 비교" 전환에서도 동일하게
  발생하는 시스템 공용 동작이다. 0.2초로 매우 짧고 mp4를 실제로 재생하면 자연스러운
  디졸브로 지나간다.

각 항목의 관찰 기록:

- [x] **자막이 화면 밖으로 나가지 않는가**: f001~f029(29개 대표 프레임) 전체 확인. 모든 자막이
  중앙 배지 박스 안에 들어오고 좌우 잘림 없음(가장 긴 줄 "번에 터지면서 훨씬 격렬하게
  폭발해요" 포함, s7 f1349 확인)
- [x] **장면 전환 시 캐릭터 잔상**: 캐릭터가 등장하는 장면(s1·s2)은 서로 인접해 있지 않고
  s3~s7(다이어그램 전용, 캐릭터 없음) 사이에 있어 잔상 문제가 발생할 여지가 없음. s1↔s2
  전환(프레임 189 부근)도 확인 - 잔상 없음
- [x] **등장 전 요소가 점처럼 남아 있지 않은가**: `VolcanoDiagram`의 기체 방울은 `opacity`로만
  등장하고(reveal 계산이 `clamp01(reveal)` 곱셈), scale-0 방식을 쓰지 않아 s3 시작 직후
  프레임(f320, local 8)에서 미등장 방울이 점처럼 남지 않음을 확인
- [x] **라벨이 화면 밖에서 잘리지 않는가**: s7 라벨("묽은 마그마"/"끈적한 마그마")이 좌우 70px
  여백 안에 들어오는 것을 f1160·f1250·f1349에서 확인
- [x] **요소끼리 겹치지 않는가**: 압력 화살표·기체 방울·마그마 방·산 실루엣이 s3~s6 전 구간에서
  서로 가리지 않는 것을 f320~f1120 구간 확인. 폭발 시 튀는 마그마 방울(burst blobs)도 정상
  경계 안에서만 움직여 화면 밖으로 나가지 않음
- [x] **화면 아래쪽 여백이 과다하지 않은가**: s3~s6은 `DIAG_WIDTH=720`로 하단 여백 약 150px
  (충분히 촘촘), s7은 위 스틸 선점검에서 잡아 `S7_DIAG_W=440`으로 조정해 약 289px로 줄임.
  s1·s2는 캐릭터+사진/아이콘 배치로 세로 중간~하단을 채움
- [x] **음량이 충분한가**: 위 3절 오디오 레벨 참고. 전체 -13.9 LUFS, 클리핑 없음
- [x] **자막이 프로필 스타일(폰트·크기·위치)을 따르는가**: `assets/theme.ts`의 `CAPTION_STYLE`·
  `FS.caption`(50px)을 그대로 쓰고 하드코딩하지 않음 - 실제 프레임에서 흰 글자+검은 외곽선,
  화면 하단에서 위로 약 23% 지점 배치 확인
- [해당없음] **영어판 화면 문자열 분기**: 영어판을 만들지 않아 해당 없음
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가**: 전 장면이 밝은 하늘색(`C.sky`)~흰색
  배경이라 어두운 배경(밤하늘 등) 대비 문제가 발생하지 않음. `C.ink` 스트로크가 f001~f008
  전 구간에서 뚜렷이 구분됨

### 프로필(general.md) 추가 체크
- [x] "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가: 화산 폭발을 사진·영상으로는 봤지만
  "왜 갑자기 터지는지"는 검색까지 안 해봤을 만한 소재 - 대본 그대로 유지, 수정 없음
- [x] 어미가 유아어·학술 문어체로 치우치지 않았는가: "~해요", "~거예요" 친근한 대화체 유지
  (대본 원문 그대로, builder는 문장을 고치지 않음)
- [x] 전문용어가 등장한 자리에서 바로 풀렸는가: "마그마"는 s3에서 "녹은 뜨거운 바위인 마그마"로
  즉시 풀이됨(대본 원문)
- [x] 자막 한 줄이 한국어 20자를 넘지 않는가: `wrapCounts(words, 'ko')` 기본값(20자) 그대로 사용,
  직접 오버라이드하지 않음
- [x] 60초 상한을 넘지 않는가: 본편 43.40초(브랜드 제외), 전체 50.50초 - 상한 안

## 5. 배포

기술 점검(precheck 에러 0, tsc 에러 0, 렌더 성공, 오디오 레벨 정상)을 통과해 즉시 배포했다.

- 배포 절대경로: `/home/lee/project/shorts/ko/[85화] 화산이 갑자기 펑 터지는 이유.mp4`
- md5 일치 확인 후 `episodes/general-ep85-volcano/out/episode-ko.mp4` 삭제 완료
  (`out/frames-ko/`는 검수 기록으로 보존)
- 렌더 횟수: 1회(ko). 스틸 선점검에서 s7 여백 결함을 미리 잡아 재렌더 없이 1회로 끝났다.

이 보고는 관찰된 사실을 기록한 것이지 "검수 통과"·"합격" 판정이 아니다. 최종 확인은 사용자
몫이다.
