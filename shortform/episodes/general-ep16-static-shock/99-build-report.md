# 빌드 보고 - general-ep16-static-shock (겨울에 문손잡이 잡으면 따끔한 이유 / Why Doorknobs Zap You in Winter)

## 자산 (공용, 언어 무관)

### 재사용
- `backgrounds/PlainBg`
- `character/Actor`, `character/MiniCharacter`, `character/poses`(`idle`, `surprised`, `POINT_UP` 등 blendPose 베이스)
- `scenes/Caption`, `scenes/Label`, `scenes/Card`, `scenes/CompareBars`, `scenes/SpeechBubble`
- `scenes/Effects`(`FlashOverlay`, `Shake`), `scenes/PopIn`(신규 도입 - 아래 결함 3 참고)
- `scenes/TitleCard`, `brand/Intro`, `brand/Outro`
- `props/ThemedIcon`(`bolt`, `droplets`, `snowflake`, `feather`, `key`, `diamond`)
- `audio/cold_zing.mp3`, `audio/intro_ding.mp3`, `audio/outro_ding.mp3` (REGISTRY에 이미 "감전·따끔거림 리액션 전반 재사용 가능"으로 등록돼 있던 자산을 그대로 씀 - 이번 화가 그 재사용 사례)

### 신규 제작 (REGISTRY.md 등록 완료)
- `props/DoorHandle.tsx` - 레버형 문손잡이. `DOOR_HANDLE_GRIP_PT` export로 스파크·손·열쇠 앵커 지점 제공
- `props/StaticChargeDiagram.tsx` - "+ 축적 -> 와이프/방전" 오버레이. `buildProgress`/`dischargeProgress`/`wipeProgress` 3개 독립 진행도

둘 다 `assets/props/index.ts`에 등록하고 `REGISTRY.md` "4. 소품" 절에 재사용 가능성과 함께 기재했다.
새 아이콘 2개(`diamond`, `key`)는 `node scripts/sync_icons.mjs diamond key`로 로컬 캐시(`tabler-cache.json`)에 동기화했다.

이 화는 언어 공용 코드(REGISTRY 대조·신규 자산 제작·등록)를 1회만 수행했다(원칙 6).

## TTS·립싱크 (언어별)

- 프로필: `general` (voice `ko-KR-SunHiNeural`/`en-US-AnaNeural`, 기본 rate+20%/pitch+30Hz(ko)·+15Hz(en))
- s2(리액션 "앗, 따가워...")만 구간별 rate/pitch 오버라이드: ko `+32%`/`+55Hz`, en `+30%`/`+35Hz` (ep15 s2와 동일 수치 - 원칙 1의 "확실히 다르게" 기준 충족, 재사용 근거는 ep15 실측 검증됨)
- `scripts/tts.py --lang ko|en`, `scripts/rms_mouth.py --prefix ko|en` 각각 1회 실행. s2만 `BustActor`/`Actor` 클로즈업이라 립싱크 사용, s1·s3~s8은 다이어그램/카드/속설 표시 장면이라 립싱크 미사용(ep07·ep08·ep11·ep15와 동일 원칙)

### 언어별 실측 길이

| # | ko(초) | en(초) |
|---|---|---|
| s1(무성 고정) | 2.000 | 2.000 |
| s2 | 4.032 | 4.632 |
| s3 | 4.392 | 5.616 |
| s4 | 6.696 | 7.008 |
| s5 | 5.952 | 7.008 |
| s6 | 11.712 | 12.336 |
| s7 | 9.144 | 8.976 |
| s8 | 5.592 | 6.072 |
| **본편 합계(여백 포함, 프레임)** | 1540f = 51.33s | 1662f = 55.4s |
| **전체(인트로+제목카드+본편+아웃트로)** | 1753f = 58.43s | 1875f = 62.5s |

두 언어 총 길이 차이: 4.07초(en이 더 김) - 정상, 무음 채움이나 배속 조정 없이 그대로 냈다. 둘 다 프로필 60초 상한(본편 기준) 안에 있다.

## 렌더 횟수

- ko: 3회(v1 초회, v2 - StaticChargeDiagram 캔버스 클리핑/EraTag 노출/S5 박스 폭 수정, v3 - S4 PopIn 전환 결함 수정)
- en: 3회(동일 사유, 공용 코드 수정이라 언어 무관하게 같이 재렌더)

## 발견·수정한 결함 (렌더 중)

1. **StaticChargeDiagram의 `+` 마크 궤도가 넓은 박스에서 캔버스 밖으로 잘림** - S3(폭 860px) 오른쪽 마크 1개가 화면 우측 경계에서 반쯤 잘렸다. `plusPositions`의 `rx`/`ry` 비율을 0.64/0.5 -> 0.54/0.46으로 낮춰 해결(공용 컴포넌트 수정, REGISTRY에 근거 기록).
2. **S5Discharge의 몸 주변 박스가 화면 왼쪽으로 반 이상 나가 마크 대부분이 안 보임** - `ACTOR_CENTER_X=330`에 `ACTOR_SIZE=820` 그대로 박스를 잡아 `x=-80`(캔버스 밖)이 됐다. 박스 폭을 `ACTOR_SIZE*0.6`으로 좁혀 캐릭터 중심에 맞게 재배치.
3. **S6Etymology의 "고대 그리스" 태그(EraTag)가 Card 내부 art 영역(`overflow:hidden`)에 가려 전혀 안 보임** - Card의 children으로 넣었던 것을 Card의 형제 요소로 독립시켜 해결.
4. **S4Humidity의 `Appear`+절대좌표 자식 조합이 팝인 도중 캐릭터를 위로 쏠리게 하는 결함(2026-08-20 REGISTRY 신규 기록 패턴)** - `MiniCharacter`를 `Appear`로 감싸면서 안에 `position:absolute` div를 또 넣었다. 공용 헬퍼 `PopIn`(`scenes/PopIn.tsx`)으로 교체해 해결(정지 프레임으로는 안 잡히는 결함이라 REGISTRY 권고대로 "시작 후 8프레임" 지점을 검수 프레임에 추가해 발견).

4건 모두 재렌더 후 해당 프레임을 다시 확인해 수정 확인했다(1·2번은 ko/en 프레임으로, 3번은 ko/en 카드 프레임으로, 4번은 ko/en 각각 popin 중간 프레임으로).

## 검수 관찰 기록 (v3, 배포본)

### 한국어

- 자막 화면이탈: 전 구간 프레임에서 자막 박스가 좌우 여백(`CAP_SIDE=70`) 안에 들어옴을 확인. 가장 긴 s6 자막도 2줄 분할로 폭 초과 없음
- 장면 전환 잔상: s2->s3, s4->s5 전환 프레임(글로벌 322, 667)에서 크로스페이드 중 이전 장면이 옅게 겹쳐 보이는 것 확인 - 이건 `SceneSwitcher`의 의도된 xfade(6프레임) 동작이지 잔상 결함이 아님
- 등장 전 요소 잔상: S3/S4/S5의 StaticChargeDiagram, S6의 amber+feather, S8의 key 전부 opacity 기반 등장이라 등장 전 점처럼 남는 것 없음 확인
- 라벨 잘림: S4 `여름 - 습함`/`겨울 - 건조함`, S6 `고대 그리스`/`호박 = elektron`, S7 `정전기 스파크 - 훨씬 높음`/`벽 콘센트 - 낮음`, S8 `효과 있다는 얘기?` 전부 박스 안에 여유 있게 들어옴 확인(프레임 f011/f016/f018/f021 직접 확인)
- 요소 겹침: 없음(S1/S2/S5/S8의 액터-손잡이 배치, S6의 amber+card 배치 확인)
- 화면 하단 여백: 상단 여백이 다른 화 대비 다소 넓은 편(예: S1은 헤드탑 y=842, 화면 44%)이나 ep11(38%)과 같은 범위대이고 문손잡이 소품이 우측 공간을 채움 - 하단은 24% 내외로 과다하지 않음. 상단 여백을 더 줄이려면 캐릭터 종횡비상 큰 재작업이 필요해 이번 범위에서는 조정하지 않음(사용자 확인 필요)
- 음량: `loudnorm` 측정 Input Integrated -13.4 LUFS / True Peak -2.1 dBTP - 클리핑 없음, 너무 작지 않음
- 효과음: cold_zing 재생 구간(s2 스파크 f193, s5 방전 f730 부근) `astats`로 에너지 확인(Peak -11.6dB/-10.0dB), 전체 트랙 피크(-2.1dB)보다 낮아 원칙 7 충족
- 자막 스타일: 프로필(하단 23%, 흰 글자+검은 외곽선, 20자 상한) 그대로 적용
- 화면 문자 언어 분기: ko 프레임에 영어 문자열 없음 확인
- 캐릭터 윤곽선 대비: 전 장면 밝은 배경(`PlainBg`)이라 `C.ink` 스트로크가 명확히 구분됨

### English

- 자막 화면이탈: 전 구간 확인, 가장 긴 문장(s6 "Actually, the word...")도 2줄 분할로 여유 있게 들어옴
- 라벨 잘림(영어가 더 길어지는 경우 특히 확인): `Summer - Humid`/`Winter - Dry`, `Ancient Greece`/`Amber = "elektron"`, `Static Spark - Much Higher`/`Wall Outlet - Lower`, `Does it actually work?`(2줄 자동 줄바꿈이지만 SpeechBubble 박스 안에 여유 있게 들어옴) 전부 확인(프레임 f011/f016/f018/f021)
- 화면 문자 언어 분기: en 프레임에 한국어 문자열 없음 확인(채널명 "Whymo", "Follow for more" 등 출력 전용 문구까지 확인)
- 음량: Input Integrated -16.7 LUFS / True Peak -2.6 dBTP - 클리핑 없음
- PopIn 결함 수정 후 s4 popin 중간 프레임(글로벌 522)에서 캐릭터가 라벨/아이콘과 같은 x축에 정확히 위치함을 ko와 동일하게 확인

### 프로필 추가 체크 (general.md 8절)

- 소재: "겨울에 문손잡이를 잡을 때 따끔한 이유"는 전연령이 겪어본 일상 경험 - 통과
- 어미: "~거든요", "~것 같아요" 류 대화체 유지, 유아어·학술 문어체 없음 확인
- 전문용어: "정전기", "전류", "전압" 모두 일상어 수준이라 별도 풀이 불필요(대본 자체 판단, v2 문서 근거)
- 자막 글자수: 20자(ko)/29자(en) 상한 내(직접 세어 확인한 대표 예 - "옷이랑 몸이 스치기만 해도" 등)
- 60초 상한: 본편 51.33s(ko)/55.4s(en) - 통과

## 배포

- md5 확인 후 `shorts/`에 반영 완료:
  - `/home/lee/project/shorts/ko/[16화] 겨울에 문손잡이 잡으면 따끔한 이유.mp4`
  - `/home/lee/project/shorts/en/[Ep. 16] Why Doorknobs Zap You in Winter.mp4`
- `out/`의 mp4(episode-ko.mp4, episode-en.mp4, -v2, -v3 총 6개) 전부 삭제, `out/frames-ko/`·`out/frames-en/`는 검수 기록으로 유지

## 확인 요청

위는 기술적 관찰 기록이다. 실제로 보기 좋은지, 상단 여백 비율이 괜찮은지, 캐릭터가 손잡이를 "만지는" 느낌이 충분한지(원칙상 손과 소품의 픽셀 단위 접촉은 보장하지 않음, ep11/ep15와 동일한 설계) 등 최종 판단은 직접 확인해 주시기 바란다.

---

## v3 갱신 (2026-08-21, 제목만 변경)

`02-script-v3.md` 반영. 내레이션·장면 구성·타임코드는 v2와 완전 동일 - TTS 재합성 없이 기존 `public/audio/`(ko_*.mp3, en_*.mp3, ko_words.json, en_words.json, ko_mouth.json, en_mouth.json) 그대로 재사용.

### 변경 사항
- `src/strings.ts`: `title` 값만 교체
  - KO: `겨울에 문손잡이 잡으면 따끔한 이유` → `겨울에 정전기가 더 잘 통하는 이유`
  - EN: `Why Doorknobs Zap You in Winter` → `Why Static Shocks Are Worse in Winter`
- `src/scenes.tsx` 파일 상단 주석의 화 제목 표기도 동일하게 갱신(화면에 안 나가는 주석, 동작 영향 없음)

### precheck
`node scripts/precheck.mjs episodes/general-ep16-static-shock` → 에러 0, 경고 1(`SHAREDOUT`). 이 경고는 공용 루트 `shortform/out/frames-ko|en`에 있는 별도 세션(ep19, 타임스탬프 08-20 20:56)의 산출물을 가리킨 것으로, 이 화의 산출물이 아니라 손대지 않음.

### 렌더
`node scripts/render.mjs general-ep16-static-shock both` - ko/en 각 1회, 총 2회.

### 프레임수·길이 (v2와 완전 일치 확인)
| | ko | en |
|---|---|---|
| 프레임 | 1753 | 1875 |
| 길이 | 58.496s (ffprobe 실측, 보고서 표기 58.43s와 반올림 차이) | 62.549s (표기 62.5s와 일치) |

99-build-report.md 상단 41~42행에 기록된 v2 수치(1753f=58.43s / 1875f=62.5s)와 프레임 수가 정확히 일치 - 타임라인이 실제로 손대지 않았음을 확인.

### 검수 (제목 카드만, 가볍게 - builder 원칙 5 "검증 강도는 위험도에 비례")
`TITLE_CARD_FRAMES=54`, `INTRO_FRAMES=69` (글로벌 프레임 69~123 구간, ko/en 공통 - TitleCard는 언어 무관 고정 길이). 프레임 74(도입부, opacity 낮은 페이드인 상태)/96(중간, 완전 표시)/118(끝부분)을 ko/en 각각 추출해 확인.

- **f096(중간, 완전 표시) 관찰**:
  - KO: "겨울에 정전기가 더 잘" / "통하는 이유" 2줄로 자동 줄바꿈. 단어(어절) 경계에서 정확히 나뉘어 단어 중간 절단 없음. 좌우 안전영역 안에 여유 있게 들어옴. 위아래 오렌지색 구분선과 캐릭터 위치 관계 v2와 동일하게 유지됨
  - EN: "Why Static Shocks Are" / "Worse in Winter" 2줄로 자동 줄바꿈. 단어 경계에서 정확히 나뉨. 좌우 여백 여유 있음
- **f074(페이드인 도입부) 관찰**: KO 프레임에서 텍스트가 옅은 회색조로(투명도 낮은 상태) 표시되며 레이아웃(줄바꿈 위치)은 f096과 동일 - 애니메이션 중 레이아웃 재계산 흔들림 없음을 확인
- 한글 제목 글자수: "겨울에 정전기가 더 잘 통하는 이유" 14자(공백 포함) - 기존 "겨울에 문손잡이 잡으면 따끔한 이유"(15자)보다 오히려 짧아 폭 초과 위험은 없었음. `wordBreak: 'keep-all'` 적용 상태에서 실제 렌더로 어절 중간 절단 없음을 직접 확인
- 본편(s1~s8)·인트로·아웃트로는 v3에서 코드·자막·자산 변경이 전혀 없으므로 재검수하지 않음(원칙 5 "가벼운 검증으로 충분한 경우" - 파일 하나, 좁은 범위 텍스트 값 변경)

### 배포
- md5 대조 후 신규 파일명으로 복사, 확인 후 구 파일명 삭제, 이 화 `out/`의 mp4 삭제(frames-ko/frames-en은 검수 기록으로 유지)
- 신규: `/home/lee/project/shorts/ko/[16화] 겨울에 정전기가 더 잘 통하는 이유.mp4` (md5 `5db24be74aa16420d16ce0a1acd5e48e`)
- 신규: `/home/lee/project/shorts/en/[Ep. 16] Why Static Shocks Are Worse in Winter.mp4` (md5 `5bb8a9eef51600ed2138939cc10292e7`)
- 구 파일명 삭제 확인: `[16화] 겨울에 문손잡이 잡으면 따끔한 이유.mp4`, `[Ep. 16] Why Doorknobs Zap You in Winter.mp4` 둘 다 `shorts/ko`, `shorts/en`에서 제거됨(재확인 `ls` 결과 없음)
