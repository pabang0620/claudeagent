# 빌드 리포트 - general-ep07-hiccups ("딸꾹질 소리가 나는 진짜 이유")

대본 소스: `02-script-v2.md`

## 1. 자산 (공용, 언어 무관 - 1회만 수행)

### REGISTRY 대조 결과

`assets/REGISTRY.md`를 먼저 읽고 대본의 "자산 목록" 절과 대조했다.

**재사용**: `character/Actor`+`POSES`(idle·surprised·crouch), `character/BustActor`, `scenes/Effects`(Shake·FlashOverlay),
`scenes/Counter`(CountUp), `scenes/Caption`(Caption·Label), `props/Symbols`(QMark), `backgrounds/PlainBg`,
`brand/Intro`/`Outro`, `scenes/TitleCard`, `scenes/SceneSwitcher`, `audio/intro_ding`·`audio/outro_ding`(브랜드에 내장).

**신규 제작(2개, 대본이 지정한 그대로)**:
- `assets/props/HiccupDiagram.tsx` - 몸통 옆모습 단순 다이어그램. `spasmProgress`(횡격막 경련)·`snapProgress`
  (목 입구 폐쇄)를 독립 0~1 값으로 받는다(CellMergeDiagram과 동일 설계 원칙 - "이 순간의 상태"만 그리고
  시간 곡선은 호출 씬이 만든다). 라벨 앵커(`HICCUP_DIAPHRAGM_PT`/`HICCUP_THROAT_PT`)를 함께 export.
  REGISTRY 4절에 등록, "근육 경련 -> 통로 반사적 폐쇄" 구조의 다른 신체 반사 소재 전반 재사용 가능.
- `assets/audio/hiccup_pop.mp3` - "딸꾹" 소리. ffmpeg lavfi 합성(저음 thump + 상승 처프 + 고역 노이즈
  트랜지언트), 0.20초, 실측 피크 -2.4dB. REGISTRY 7절에 등록.

재사용 자산 수: 11개(공용 씬·캐릭터·브랜드 부품 기준). 신규 자산 수: 2개.

## 2. 언어별 실측 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 실측 길이(초) | 프레임(pad 포함) |
|---|---|---|
| s1(무성) | 2.000(대본 지정) | 60 |
| s2(리액션+훅) | 4.272 | 146 |
| s3(횡격막) | 7.128 | 220 |
| s4(목 폐쇄) | 7.632 | 235 |
| s5(68년) | 7.056 | 218 |
| s6(속설) | 6.960 | 215 |

본편 합계 1094프레임(36.467초). 전체(인트로+제목카드+본편+아웃트로) = 1307프레임 = **43.567초**.

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz)

| 구간 | 실측 길이(초) | 프레임(pad 포함) |
|---|---|---|
| s1(silent) | 2.000(script-fixed) | 60 |
| s2(reaction+hook) | 3.792 | 132 |
| s3(diaphragm) | 7.176 | 221 |
| s4(throat closes) | 7.344 | 226 |
| s5(68 years) | 6.816 | 210 |
| s6(myth) | 8.064 | 248 |

본편 합계 1097프레임(36.567초). 전체 = 1310프레임 = **43.667초**.

**언어 간 차이**: EN이 KO보다 3프레임(0.100초) 더 길다. 매우 근소한 차이(대부분 구간이 서로 상쇄됨 -
s2/s5는 KO가 더 길고 s3/s4/s6는 EN이 더 길다). 어느 쪽도 늘리거나 줄이지 않았다 - 실측 그대로다.

## 3. 렌더 (언어별 각 3회 - v1 초안 -> 검수 결함 발견·수정 -> v2 -> 잔여 결함(CountUp 오버플로) 발견·수정 -> v3 최종)

```
node scripts/precheck.mjs episodes/general-ep07-hiccups   # 렌더 전 정적 검사, 에러 0/경고 0 확인
npx remotion render --public-dir=episodes/general-ep07-hiccups/public \
  episodes/general-ep07-hiccups/src/index.ts EpisodeKo out/episode-ko-vN.mp4
npx remotion render --public-dir=episodes/general-ep07-hiccups/public \
  episodes/general-ep07-hiccups/src/index.ts EpisodeEn out/episode-en-vN.mp4
```
shortform 루트에서 실행. 세 버전 모두 프레임 수 동일(KO 1307 / EN 1310) - 시각적 수정만 있었고 타이밍
변경은 없었다.

## 4. 검수에서 발견하고 수정한 결함 (전부 실제 관찰 사실 근거)

재렌더할 때마다 `out/frames-ko/`·`out/frames-en/`를 비우고 새로 프레임을 뽑아 `ls -la`로 타임스탬프가
방금 갱신됐음을 확인한 뒤 Read했다.

1. **QMark(물음표/팝텍스트)가 위치 지정용 래퍼 div 안에 감싸일 때 글자 단위로 세로 줄바꿈됨**
   (s1 "딸꾹!"/"Hic!" 팝텍스트, v1 KO f005/f006에서 실측). 원인: QMark 자신은 position:absolute이고
   left/top이 없어 "정적 위치"로 배치되는데, 이를 담는 래퍼 div가 out-of-flow 자식만 가져 폭이 0으로
   붕괴 -> shrink-to-fit 텍스트 폭 계산이 0에 가깝게 제한되어 글자마다 줄바꿈됨. 수정: 래퍼 div를 없애고
   QMark 자신의 `style`에 `left`/`top`/`transform`/`opacity`/`whiteSpace:'nowrap'`을 직접 얹는 방식으로
   변경(general-ep09의 기존 QMark 사용 패턴과 동일 원칙, 코드 주석에 근거 명시). v2 재렌더로 확인,
   f005(KO)·f005(EN) 모두 "딸꾹!"/"Hic!"가 한 줄로 정상 표시됨.
2. **S3 "횡격막" 라벨이 몸통 다이어그램 박스 하단 테두리와 겹침** (v1 KO f010/f011, EN f010 실측).
   `HICCUP_DIAPHRAGM_PT`가 박스 내부(y=655, 박스는 y=295~755)에 있어 라벨(높이 46px 1~2줄)이 박스
   테두리와 시각적으로 충돌. 수정: `HICCUP_DIAPHRAGM_PT.y`를 655 -> 790(박스 바깥 아래)으로 이동.
   v2 재렌더로 확인, 박스 밖 깔끔한 여백에 라벨이 표시됨(KO f010, EN f010).
3. **S4 "목 입구가 탁 닫힘"/"Throat snaps shut" 라벨이 머리 원과 겹침** (v1 KO f013 실측).
   `HICCUP_THROAT_PT` 근방(머리·목 사이 좁은 공간)에 배치해 머리 원 테두리와 텍스트가 충돌. 수정:
   라벨을 다이어그램 위쪽 고정 여백(x=CX, y=290, align=center)으로 재배치, `throatScreen` 계산 제거.
   v2 재렌더로 확인, 머리 위 안전영역에 한 줄로 깔끔히 표시됨(KO f013, EN f013).
4. **S5 CountUp "68 years"(영어)가 화면 오른쪽 밖으로 잘림** (v2 EN f015 실측, KO는 "68년"으로 짧아
   문제 없었음). 원인: `width=520`(한국어 접미사 "년" 기준)이 영어 접미사 " years"에는 너무 좁아 실제
   렌더 텍스트 폭이 화면 우측 안전영역을 넘어섰다(PlainBg의 `overflow:hidden` 캔버스 경계에서 잘림).
   수정: `size` 190->150, `width` 520->940(CX 기준 안전영역 70~1010에 맞춤). v3 재렌더로 확인,
   EN f015에서 "68 years" 전체가 화면 안에 여유 있게 들어옴, KO f015도 여전히 중앙 정렬 정상.

## 5. 검수 체크리스트 (언어별 관찰 기록, v3 최종 기준)

프레임 번호는 `sceneStarts`/`sceneFrames` 실측값에서 계산한 구간별 시작+중간 프레임(원칙 5). 인트로
69F(2.3s)+제목카드 54F(1.8s)=123F 오프셋을 본편 구간 로컬 프레임에 더해 전역 프레임을 구했다.

### 한국어 (out/frames-ko/, f001~f019, 19장)

- [x] **자막 화면이탈**: f007(s2)·f010(s3)·f013(s4)·f015(s5)·f017(s6) 전체 확인, 모든 캡션 박스가
  좌우 안전영역(CAP_SIDE=70) 안에 들어옴. 잘림 없음.
- [x] **장면 전환 시 캐릭터 잔상**: f003(123, s1 시작 직후)이 흰 배경만 보이는 것을 확인 - SceneSwitcher
  크로스페이드 특성상 신규 장면 fade-in이 8프레임 걸려 경계 프레임에는 이전 장면이 여전히 100%
  불투명하고(f006=183, f009=329, f011=549, f014=784, f016=1002, f018=1217 모두 직전 장면이 그대로
  보임 - 이는 결함이 아니라 xfade=6/fadeIn=8 설계 그대로다), 잔상(두 장면이 겹쳐 흐릿하게 보이는 것)은
  관찰되지 않았다.
- [x] **등장 전 요소가 점처럼 남음**: S1 팝텍스트(f004=145에서 아직 안 보이다가 f005=157에서 팝인),
  S3/S4 라벨(f010/f011, f012/f013), S5 CountUp/라벨(f014에서 안 보이다 f015에서 나타남), S6 QMark
  배지(f016에서 안 보이다 f017에서 나타남) 전부 `progress()`/`Appear` 기반 opacity 0 처리로 등장 전
  점 잔상 없음을 확인.
- [x] **라벨이 화면 밖에서 잘림**: 위 4번 결함(CountUp) 수정 후 f015 재확인 - 잘림 없음. 나머지 라벨
  (f010, f013, f017)도 전부 화면 안.
- [x] **요소끼리 겹침**: 위 2·3번 결함 수정 후 f010·f013 재확인 - 라벨과 다이어그램 박스/머리 원이
  겹치지 않음.
- [x] **화면 아래쪽 여백 과다**: f004(s1, ACTOR_SIZE 1550/GROUND 1400)·f017(s6, 1050/1560) 확인,
  캐릭터가 화면 세로 중앙~하단을 채우고 캡션 박스가 하단 안전영역에 위치, 과도한 여백 없음.
- [x] **음량**: `ffmpeg loudnorm` 측정 Input Integrated -13.6 LUFS / Input True Peak -2.1 dBTP
  (클리핑 없음, 6화 실측 -13.5LUFS/-2.0dBTP와 유사한 범위).
- [x] **자막 스타일**: FS.caption=50px, 하단 23% 지점, 흰 글자+검은 외곽선 - 프로필(general.md) 값
  그대로, 하드코딩 변경 없음.
- [x] **화면 문자열 언어별 분기**: 아래 EN 절과 나란히 대조(원칙 6). KO 프레임 19장 전체에 영어 문자가
  섞이지 않음을 육안 확인.
- [x] **캐릭터 윤곽선-배경 대비**: 전 장면이 밝은 PlainBg(하늘색~흰색 그라데이션) 위 진한 남색
  (`C.ink`) 스트로크라 대비 충분(어두운 배경 아님, 글로우 처리 불필요 - ep06과 다른 경우).

### 영어 (out/frames-en/, f001~f019, 19장)

- [x] **자막 화면이탈**: f007(s2 "Whoa what was that Wait why")·f010(s3)·f013(s4)·f017(s6) 확인,
  영어 자막이 한국어보다 어절이 잘게 나뉘어(wrapCounts en=29자) 좌우 안전영역 안에 들어옴.
- [x] **장면 전환 잔상**: KO와 동일 크로스페이드 설계, f009(315, s3 경계)·f011(536, s4 경계) 등에서
  이전 장면이 100% 유지되는 것을 확인(결함 아님), 흐릿한 겹침 잔상 없음.
- [x] **등장 전 점 잔상**: f005("Hic!" 팝텍스트 팝인 확인), f015(S5 "Record:"/"68 years" 팝인) 등
  전부 opacity 0 처리 확인.
- [x] **라벨 화면이탈**: 4번 결함(CountUp 오버플로)이 EN에서 발견되고 수정됐다 - f015 재확인 결과
  "68 years" 전체가 좌우 여백을 두고 화면 안에 들어옴(스크린샷 실측, 좌측 약 245px·우측 약 245px 여유).
- [x] **요소 겹침**: f010("Diaphragm (breathing muscle)" 2줄 랩, 박스와 안 겹침)·f013("Throat snaps
  shut" 머리 위, 안 겹침) 확인.
- [x] **하단 여백**: f004·f017 KO와 동일 레이아웃(언어 무관 씬 좌표) 확인, 과다 여백 없음.
- [x] **음량**: Input Integrated -16.7 LUFS / Input True Peak -3.3 dBTP(클리핑 없음, 6화 실측
  -16.4LUFS/-2.9dBTP와 유사).
- [x] **자막 스타일**: KO와 동일 토큰 사용, 폰트 크기만 언어 무관 동일값(50px).
- [x] **화면 문자열 언어별 분기 - 한글 미검출**: f001(Whymo)·f002(Why Hiccups Sound Like 'Hic')·
  f005(Hic!)·f007(영어 캡션)·f010(Diaphragm)·f013(Throat snaps shut)·f015(Record:/68 years/record
  holder reportedly)·f017(Hold your breath - some say it helps/carbon dioxide and the spasm)·
  f019(Whymo/Next up/Another curious question, coming up!/Follow for more) 19장 전체를 육안 대조한
  결과 한국어 글자가 단 하나도 섞이지 않음을 확인.
- [x] **캐릭터 윤곽선-배경 대비**: KO와 동일(밝은 배경, 문제 없음).

### 프로필(general.md) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 딸꾹질 소리의 원인, 해당.
- [x] 어미가 친근한 대화체("~거든요", "~것 같아요")를 유지 - 대본(02-script-v2.md) 원문 그대로 렌더,
  builder가 문장을 고치지 않음(원칙 준수).
- [x] 전문용어("횡격막")가 등장 자리에서 바로 풀림 - 화면 라벨 "횡격막 (숨 쉬는 근육)"으로 병기.
- [x] 자막 한 줄 20자(ko)/29자(en) 상한 - `wrapCounts(words, locale)` 그대로 사용, 하드코딩 변경 없음.
- [x] 60초 상한 - KO 43.567초, EN 43.667초, 모두 60초 미만.

## 6. 오디오 SFX 타이밍·레벨 (원칙 7, 객관적 수치만)

- `hiccup_pop.mp3`: 0.20초, 코드 합성(ffmpeg lavfi: 저음 감쇠 사인 + 상승 처프 + 고역 노이즈 버스트),
  네이티브 피크 -2.4dBFS.
- **s1 임팩트**: `S1_IMPACT_LOCAL_FRAME=22`(scenes.tsx export) 프레임에 Shake·FlashOverlay·SFX를
  동일 상수로 정렬. KO/EN 공통 전역 프레임 145(=4.833초, s1이 언어 무관 고정 2.0초라 양 언어 동일).
  측정: SFX 재생 구간(4.7~5.0초 창) max_volume -6.9dB vs 그 직전 구간(3.5~3.8초) -9.2dB - SFX로 인한
  피크 상승이 관찰됨.
- **s4 목 폐쇄**: `S4_SNAP_END_FRAC=0.40`(scenes.tsx export)을 Episode.tsx가 그대로 읽어
  `starts[3] + round(frames[3]*0.40)`으로 SFX 프레임을 계산(KO 전역 643=21.433초, EN은 언어별 frames[3]
  값이 달라 다른 전역 프레임).
- **효과음이 내레이션보다 작은지**: 파일 자체(unity gain) 피크는 hiccup_pop -2.4dBFS, s4 내레이션
  (`ko_s4.mp3`) -4.1dBFS로 SFX가 더 크지만, 실제 믹스 볼륨(`Audio volume` prop)이 SFX=0.85, 내레이션
  =1.6로 다르므로 이를 반영한 실효 피크는 SFX ≈ -3.8dBFS, 내레이션 ≈ -0.02dBFS로 **SFX가 내레이션보다
  약 3.8dB 낮다** - "효과음이 내레이션보다 작아야 한다" 조건을 만족한다(계산: 20*log10(gain)dB 보정).
- 청취 기반 판단(타이밍이 체감상 자연스러운지, 소리 자체가 듣기 좋은지)은 이 에이전트가 내릴 수 없다 -
  위 수치만 객관적으로 확인했다.

## 7. 렌더 횟수

- 한국어: 3회(v1 초안, v2 QMark·라벨 겹침 수정, v3 CountUp 오버플로 수정)
- 영어: 3회(동일 사유, v3에서 EN 전용 결함인 CountUp 오버플로 수정)

## 8. 배포

기술적 검증(정적 검사 precheck 통과, 프레임 검수, 음량 측정, SFX 타이밍·레벨 확인)을 마쳤으므로
곧바로 `shorts/`에 반영했다(원칙 5, 2026-08-09 정책).

- 한국어: `/home/lee/project/shorts/ko/[7화] 딸꾹질 소리가 나는 진짜 이유.mp4`
  (md5 `374a8d16d1e0c73de27a6322f312b2ef`, `out/episode-ko-v3.mp4`와 일치 확인)
- 영어: `/home/lee/project/shorts/en/[Ep. 7] Why Hiccups Sound Like 'Hic'.mp4`
  (md5 `ca65d64c2e7bd031d6fd38fcc0ff188e`, `out/episode-en-v3.mp4`와 일치 확인)

md5 일치 확인 후 `out/`의 mp4(v1~v3, 언어별 총 6개) 전부 삭제했다. `out/frames-ko/`·`out/frames-en/`
(검수 프레임, v3 최종본 기준 19장씩)는 유지했다.

이렇게 나왔습니다. 확인해주세요 - 위 체크리스트는 이 에이전트가 관찰한 기술적 사실이고, 최종 합격
판단은 사용자 몫입니다.
