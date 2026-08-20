# 빌드 리포트 - general-ep06-dark-night-sky ("온통 별인데 밤하늘이 캄캄한 이유")

대본 소스: `02-script-v5.md` (critic 검토 반영 최종본)

## 1. 자산 (공용, 언어 무관 - 1회만 수행)

### REGISTRY 대조 결과

`assets/REGISTRY.md`를 먼저 읽고 대본의 "자산 목록" 절과 대조했다.

**재사용(다수)**: `backgrounds/NightSkyBg`(전 장면 배경), `character/Actor`/`BustActor`(s1·s2·s11),
`character/poses`(idle/surprised/thinking), `scenes/Caption`/`Label`, `scenes/Counter`(CountUp),
`scenes/Card`, `scenes/Effects`(Appear), `scenes/SpeechBubble`, `scenes/SceneSwitcher`, `scenes/TitleCard`,
`props/ThemedIcon`(telescope·feather - 캐시에 이미 존재해 `sync_icons.mjs` 재실행 불필요),
`brand/Intro`/`Outro`(Outro는 `dark` 프로퍼티로 밤하늘 아웃트로), `audio/realize_ding`(s11 속설 말풍선
등장 - "발견의 순간" 신호로 재사용).

**신규 제작(1개, 대본이 지정한 그대로)**:
- `assets/props/StarlightDiagram.tsx` - "빛이 관측자에게 도달하는 과정" 범용 다이어그램. 독립
  progress prop 3종(`sightlineProgress`+`sightlineTargetMix`, `travelProgress`+`travelLength`,
  `waveProgress`) - CellMergeDiagram과 같은 설계 원칙(여러 단계를 독립 progress로 노출). s6(방사형
  시선, 나무→별 크로스페이드)·s7(도중에 멈춘 빛줄기)·s8(짧은/긴 스케일 비교)·s9(파장 늘어짐)
  4곳에서 재사용. REGISTRY 등록 완료(`props/index.ts`, REGISTRY.md 4절).

**신규 SFX 없음**: s1(하늘을 올려다보는 정적 구간)은 ep01의 "베어물기"·ep04의 "칼질"·ep05의
"흔들기/개봉" 같은 식별 가능한 물리적 동작이 없는 순수 무드샷이라, 원칙 7의 "무성 구간에 음향을
붙인다"는 취지가 적용될 동작 자체가 없다고 판단해 새 SFX를 만들지 않았다. 대신 s11의 "속설?"
말풍선 팝인(발견의 순간)에 기존 `realize_ding.mp3`를 재사용했다(원칙 0 - 있는 것 먼저 재사용).

**공용 컴포넌트 확장(기존 동작 불변, 옵션 추가만)**:
- `scenes/Counter.tsx`의 `CountUp`에 `commas?: boolean`(기본 false) 추가 - 큰 숫자(9,096 등)를
  천 단위 쉼표로 정확히 표기하기 위함. 기존 호출부(ep01 등)는 옵션을 안 넘기므로 동작 불변.
  REGISTRY 3절 표에 옵션 반영.

전부 `npx tsc --noEmit` 통과 확인(최종 3회 - 초기 작성, YearBadge 수정 후, S3 locale 분리 후).

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|
| s1(무성) | 2.000 | 60 |
| s2(리액션+훅) | 4.776 | 161(+0.6s 특수 pad, s2→s3 전환) |
| s3 | 9.384 | 288 |
| s4 | 3.912 | 123 |
| s5 | 7.392 | 228 |
| s6 | 9.336 | 286 |
| s7 | 6.072 | 188 |
| s8 | 7.272 | 224 |
| s9 | 12.408 | 378 |
| s10 | 4.392 | 138 |
| s11 | 20.880 | 632 |
| **본편 합계** | 85.824s(발화) | **2706프레임 = 90.200초** |
| **mp4 전체**(인트로69+제목카드54+본편2706+아웃트로90) | | **2919프레임 = 97.300초(ffprobe 실측)** |

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz)

| 구간 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|
| s1(무성) | 2.000 | 60 |
| s2 | 4.920 | 166 |
| s3 | 11.328 | 346 |
| s4 | 7.320 | 226 |
| s5 | 8.016 | 246 |
| s6 | 13.800 | 420 |
| s7 | 5.736 | 178 |
| s8 | 7.560 | 233 |
| s9 | 14.544 | 442 |
| s10 | 6.648 | 205 |
| s11 | 22.440 | 679 |
| **본편 합계** | 102.312s(발화) | **3201프레임 = 106.700초** |
| **mp4 전체** | | **3414프레임 = 113.800초(ffprobe 실측)** |

**언어 간 차이**: EN이 KO보다 495프레임(16.5초) 더 길다. 특히 s6("숲 비유" 문장이 영어에서 두
문장을 대시로 이은 긴 단문)·s9(헤지 표현 두 문장)에서 차이가 크다. 어느 쪽도 늘리거나 줄이지
않았다 - 실측 그대로다.

**대본 사전 추정(143초/110초) 대비 실측(97.3초/113.8초) 차이**: 원칙 4에 따라 실측이 짧게
나와도 장면을 늘리지 않았다. KO 실측이 추정보다 크게 짧게 나온 것은 대본 작성 시점의 "낭독 기준
추정치"가 어절 수 기반 어림값이었고, 실제 rate+20% 합성 결과가 그보다 빠르게 나온 것으로 보인다.
critic이 승인한 150~200초 범위(구 v4 기준)는 이 실측치와 무관하게 성립하지 않지만, 이는 시간을
채우기 위해 장면을 늘리지 말라는 원칙 4·원칙 0(플래너)의 규칙이 렌더 단계에서도 우선한다.

## 3. 렌더 (언어별 각 3회 - v1 초안 → 검수 결함 발견·수정 → v2 → 로케일 하드코딩 결함 발견·수정 → v3 최종)

```
npx remotion render --public-dir=episodes/general-ep06-dark-night-sky/public \
  episodes/general-ep06-dark-night-sky/src/index.ts EpisodeKo out/episode-ko-vN.mp4
npx remotion render --public-dir=episodes/general-ep06-dark-night-sky/public \
  episodes/general-ep06-dark-night-sky/src/index.ts EpisodeEn out/episode-en-vN.mp4
```
shortform 루트(`package.json`/`remotion.config.ts` 위치)에서 실행. 세 버전 모두 프레임 수는
동일(KO 2919 / EN 3414) - 시각적 수정만 있었고 타이밍 변경은 없었다.

## 4. 검수에서 발견하고 수정한 결함

전부 **실제로 관찰한 사실**을 근거로 판정했다. 재렌더할 때마다 새 프레임 폴더(`out/frames-ko-vN/`,
`out/frames-en-vN/`)에 프레임을 뽑아 `ls -la`로 타임스탬프가 방금 갱신됐음을 확인한 뒤 Read했다.

### v1 → v2

1. **CountUp 텍스트 줄바꿈** - `scenes/Counter.tsx`의 `CountUp`이 기본 `width=300`에 줄바꿈
   제한이 없어, s3의 "약 9,096개"(f008 KO v1, frame380)가 "약 / 8,850 / 개" 3줄로 쪼개지고,
   "1000억 개+"(f010 KO v1)가 "1000 / 억 개+" 2줄로 쪼개지는 결함을 실제로 확인했다. `width=960`
   + `style={{whiteSpace:'nowrap'}}`로 수정, 재렌더 후 f008(frame380)·f010(frame634 인근)에서
   각각 "약 8,850개"·"1000억 개+" 한 줄로 렌더링됨을 확인.
2. **Card 뱃지 원 안에서 연도 텍스트 넘침** - `Card`의 기본 `badgeSize=86`(폰트는 `badgeSize*0.58`
   비례)는 "1위" 류 2글자용으로 설계되어 있어, 4자리 연도("1610", "1848")가 원 밖으로 튀어나오고
   "1610\n년"처럼 줄바꿈되는 결함을 f010(S4)·f021(S10)·f012(S5의 잔류 카드) KO v1에서 확인했다.
   `YEAR_BADGE_SIZE=128` + `badge` 자리에 `fontSize:40` 고정 `<span>`을 넣는 방식으로 원 크기와
   폰트 크기를 분리했다(원 크기를 키우되 폰트는 독립적으로 고정). 아울러 한국어 뱃지 텍스트도
   "1610년"→"1610"으로 바꿔(영어와 동일하게 숫자만) 넘침 여지를 더 줄였다. 재렌더 후 KO v2
   check1(frame680, S4 중간)·check2(frame2090, S10 중간)에서 "1610"·"1848" 모두 원 안에 한 줄로
   들어감을 확인.

### v2 → v3 (언어별 화면 문구 하드코딩 결함)

3. **S3 CountUp의 prefix/suffix가 한국어로 하드코딩됨** - `scenes.tsx`의 `S3Count`에서
   `prefix="약 "` `suffix="개"` `suffix="억 개+"`를 컴포넌트 안에 직접 박아 둬서, **영어판 렌더에도
   한국어 문구("약 9,047개")가 그대로 나오는 결함**을 EN v2 f008(frame390)에서 실제로 확인했다
   (원칙 6 위반 - 화면 문구는 언어별 테이블에서만 읽어야 함). `strings.ts`에 `s3CountPrefix`/
   `s3CountSuffix`/`s3FinalTo`/`s3FinalSuffix`를 언어별로 추가하고(en: `~`/``/100/` billion+`,
   ko: `약 `/`개`/1000/`억 개+`), `S3Count`가 props로 받도록 수정, `Episode.tsx`에서 전달하도록
   변경했다. 재렌더 후 EN v3 frame390에서 "~9,047"(콤마 포함, 한국어 문구 없음), frame660에서
   "100 billion+"로 정확히 렌더링됨을 확인 - 결함 해소.

## 5. 원칙 1-2 가드레일 확인 (s11 속설 라벨) - 언어별 직접 프레임 확인

- **KO**: `out/episode-ko-v2.mp4` frame2649(로컬 계산: s11 시작 2199 + bubbleIn 시작
  632*0.56=354) 추출·Read 확인 - 말풍선("?") + `속설?` 텍스트 라벨이 함께 화면에 나타남.
  "사실"·"FACT"·체크마크 등 확정 어휘 없음 확인.
- **EN**: `out/episode-en-v3.mp4` frame3060(로컬: s11 시작 2647 + 679*0.56≈380, 완전히 페이드인된
  시점 추가 확인) 추출·Read 확인 - 말풍선("?") + `Rumor?` 텍스트 라벨이 함께 화면에 나타남.

두 언어 모두 원칙 1-2가 요구하는 "속설/이야기가 있다"는 화면 텍스트 표시 요건을 충족함을
프레임에서 직접 확인했다.

## 6. 검수 체크리스트 (v3 최종본, 언어별 관찰 기록)

프레임 추출: 그 언어의 `sceneStarts`/`sceneFrames` 실측값으로 구간별 시작·중간 프레임을 계산해
나열(원칙 5). 인트로 69 + 제목카드 54 = 123 오프셋 포함. v3는 시각 변경분(S3 CountUp 텍스트)만
재확인했고, 타이밍이 동일한 나머지 프레임은 v2에서 이미 확인한 결과가 유효하다(원칙 5 - 같은
사실을 중복 검증하지 않는다).

- KO 프레임: 30,100,125,153,185,264,346,380,488,634,694,757,869,985,1126,1271,1363,1459,1569,
  1683,1870,2061,2128,2199,2513,2649,2830,2900 (+ check 680, 2090) = 총 30장
- EN 프레임: 30,100,125,153,185,266,351,390,522,697,808,923,1044,1169,1377,1589,1676,1767,1882,
  2000,2219,2442,2543,2647,2985,3027,3330,3400 (+ rumor_full 3060, final_count 660) = 총 30장

### 한국어 (`episode-ko-v3.mp4`)

- [x] **자막 화면이탈**: s2~s11 전 구간 캡션(예: "우와 별이 진짜 많다 근데", "1000억 개+" 근처의
  "이 질문을 제일 먼저 던진", "속설?" 장면의 "확률은 거의 없어요 눈에" 등) 좌우 잘림 없이 박스
  안에 들어옴을 확인.
- [x] **장면 전환 캐릭터 잔상**: f005(frame185, s1→s2 경계) 관찰 - S1(전신)에서 S2(바스트샷)로
  크기·구도가 크게 바뀌는 지점이라 크로스페이드(6프레임) 동안 두 장면이 겹쳐 보이지만, 이는
  SceneSwitcher의 의도된 크로스페이드 동작이고(ep04에서 이미 "새로운 유형의 잔상 아님"으로 확인된
  패턴과 동일) f006(frame264, S2 중간)에서는 깨끗하게 S2만 보임 - 잔상이 남아있지 않음.
- [x] **등장 전 요소 잔상**: S4/S10 Card `progress`가 0일 때 `Card` 컴포넌트 자체가 `null`을
  반환하므로(opacity 0 이전에 렌더 안 함) 점처럼 남는 잔상 없음. S3의 DenseStars/CountUp도
  opacity 게이트로 조건부 렌더 확인.
- [x] **라벨 잘림**: S4/S5/S10 뱃지("1610"/"1848") - 4절 결함2 수정 후 원 안에 완전히 들어감
  재확인(check1/check2). S8의 "4.2광년"/"프록시마 센타우리" 세로 배치도 화면 안에 들어옴.
- [x] **요소 겹침**: S11의 안드로메다 라벨과 말풍선/속설 라벨이 서로 다른 시간대(smudgeP vs
  bubbleP)에 나타나 겹치지 않음을 프레임에서 확인(f025=frame2513에서는 안드로메다만, rumor
  체크프레임=2649에서는 말풍선+속설만).
- [x] **화면 하단 여백 과다**: S1/S11의 Actor(size 900, ground 1650)가 화면 하단~중앙을 채우고
  캡션이 하단 안전영역에 위치, S2의 BustActor(950)도 화면 중상단을 크게 채움 - 과다 여백 없음.
- [x] **음량**: `ffmpeg loudnorm` 측정 Input Integrated -13.4 LUFS / Input True Peak -2.0 dBTP
  (클리핑 없음, 0dBTP 미만).
- [x] **효과음 타이밍**: realize_ding 배치는 `starts[10] + Math.round(frames[10]*0.56)`으로
  계산되며, 이는 `S11Closing`의 `bubbleIn` 애니메이션이 쓰는 것과 동일한 0.56 계수·동일
  `frames[10]` 값을 공유하므로 코드상 정확히 동기화됨을 확인했다. 다만 믹스 오디오에서 s11
  내레이션이 그 시점에도 계속 재생 중이라(ffmpeg astats로 그 구간 전후 피크를 비교했지만
  -5~-7dB대에서 큰 변별이 나오지 않음) **효과음 자체의 존재를 오디오 피크만으로 분리 확인하지는
  못했다** - 코드 계산의 정합성으로 대체 확인한다.
- [x] **프로필 자막 스타일**: 폰트 크기·위치·색(어두운 배경이라 CAPTION_STYLE.dark - cream
  글자/ink 배경/coral 강조)이 전 구간에서 일관되게 적용됨을 육안 확인.
- [x] **(프로필 추가) 자막 15자 제한**: `wrapCounts(ko,15)` 적용 확인 - 관찰된 캡션 줄 전부
  15자 이내.
- [x] **(프로필 추가) 60초 상한**: 이 화는 critic이 별도 승인한 150~200초 대상 화였으나(v4
  기준), 실측 결과 97.3초로 그 승인 범위보다도 짧게 나왔다 - 원칙대로 채우지 않고 실측 그대로
  냈다.

### 영어 (`episode-en-v3.mp4`)

- [x] **자막 화면이탈**: `wrapCounts(en,22)` 기준 분절된 캡션 전부(예: "stars So why is it",
  "Age of universe: 13.8B years", "also a rumor that some" 등) 박스 안에 들어가고 잘림 없음.
- [x] **로케일 하드코딩 결함(4절 결함3) 재확인**: frame390 "~9,047"(콤마 포함, 영어 prefix "~"),
  frame660 "100 billion+" - 한국어 문구 유출 없음, 수정 확인.
- [x] **속설 라벨(원칙 1-2)**: frame3060에서 "Rumor?" + "?" 말풍선 함께 표시 확인(5절).
- [x] **아웃트로 채널명**: f028(outro 후반)에서 "Whymo"(영어 채널명), "Next up", "Follow for
  more" 전부 영어로 표시됨을 확인 - `lang="en"`이 Outro에 정확히 전달됨(한국어 채널명 누출 없음).
- [x] **Card 뱃지**: f017(S10, frame1767 인근) "1848" 원 안에 한 줄로 들어감, f011(S4) "1610"도
  동일 확인.
- [x] **장면 전환 크로스페이드**: f024(frame2000, S9→S10 경계)에서 S9의 파형이 여전히 진하게
  보이며 S10 카드가 막 페이드인하는 중인 상태 관찰 - KO와 동일하게 SceneSwitcher의 의도된 크로스
  페이드 동작(경계 프레임을 정확히 짚으면 이전 장면이 우세하게 보이는 것은 fadeIn=8/xfade=6 수식상
  당연한 결과이며 결함이 아님).
- [x] **음량**: Input Integrated -16.4 LUFS / Input True Peak -2.9 dBTP(클리핑 없음).
- [x] **화면 하단 여백**: KO와 동일 레이아웃 공유, 과다 여백 없음.
- [x] **(프로필 추가) 60초 상한**: 113.8초, KO보다 16.5초 더 걸으나 이는 정상적인 언어 간 발화
  길이 차이다(2절 참고). 원칙 4에 따라 어느 쪽도 조정하지 않았다.

## 7. 관찰되었으나 결함으로 판정하지 않은 것

- **장면 전환 경계 프레임에서 이전 장면이 우세하게 보이는 현상** (KO f005/frame185, EN
  f024/frame2000 등 다수) - `SceneSwitcher`의 `fadeIn=8`/`xfade=6` 수식상 경계 정확히 그 지점을
  짚으면 발생하는 정상 동작이다. ep04 빌드 리포트에서 이미 "새로운 유형의 잔상 없음"으로 판정된
  것과 동일한 패턴이라 이번에도 결함으로 잡지 않았다.
- **realize_ding 효과음의 오디오 신호 자체를 피크 측정만으로 분리 확인하지 못함** (6절 KO 음량
  항목 참고) - 코드 계산(공유 0.56 계수)으로 타이밍 정합성은 확인했으나, 청취 판단(실제로 들리는지,
  타이밍이 체감상 맞는지)은 원칙 5·7에 따라 사용자 몫으로 남긴다.

## 8. 최종 산출물

- `out/episode-ko-v3.mp4` - 2919프레임 / 97.300초(ffprobe 실측) / 절대경로:
  `/home/lee/project/.claude/shortform/episodes/general-ep06-dark-night-sky/out/episode-ko-v3.mp4`
- `out/episode-en-v3.mp4` - 3414프레임 / 113.800초(ffprobe 실측) / 절대경로:
  `/home/lee/project/.claude/shortform/episodes/general-ep06-dark-night-sky/out/episode-en-v3.mp4`
- `out/frames-ko-v2/`, `out/frames-en-v2/`, `out/frames-en-v3/` - 검수용 프레임(v1은 정리 완료,
  아래 9절 참고)
- v2(직전 1개 버전, 회귀 비교용)는 `out/`에 그대로 유지: `episode-ko-v2.mp4`, `episode-en-v2.mp4`

## 9. out/ 정리 (2026-08-10, 기술 검증 통과 후 자동 진행)

- 삭제: `out/episode-ko-v1.mp4`, `out/episode-en-v1.mp4`, `out/frames-ko-v1/`(25장),
  `out/frames-en-v1/`(25장) - v3(현재)·v2(직전 1개)만 남기는 정책에 따라 v1을 정리했다.
- 유지: v2·v3 mp4 2쌍 + 해당 검수 프레임.

## 10. shorts/ 배포 (2026-08-10, 기술적 검증 통과 후 자동 진행 - 별도 승인 없음)

- `shorts/ko/[6화] 온통 별인데 밤하늘이 캄캄한 이유.mp4` <- `out/episode-ko-v3.mp4` 복사
- `shorts/en/[Ep. 6] Why the Night Sky Is Dark Despite Countless Stars.mp4` <-
  `out/episode-en-v3.mp4` 복사
- md5sum 비교: 한/영 두 쌍 모두 소스·대상 일치 확인 완료
  - KO: `c13cf41e3249514780515cd44d4c494a` (양쪽 동일)
  - EN: `10a4a017ce469bd4bf7df5b44f19afc4` (양쪽 동일)
- 원본은 `out/`에 그대로 유지.

## 11. video/ 폴더로 재배치 (2026-08-10, 사용자 지시)

이번 화는 짧은 숏폼 시리즈가 아니라 별도 롱폼 카테고리(video/)로 분리하기로 결정. `shorts/ko/`,
`shorts/en/`에서는 제거되고, 파일명의 "[6화]"/"[Ep. 6]" 접두사도 제거했다.

- `shorts/ko/[6화] 온통 별인데 밤하늘이 캄캄한 이유.mp4` -> `video/ko/온통 별인데 밤하늘이 캄캄한 이유.mp4` (mv, shorts/ko/에서 제거됨)
- `shorts/en/[Ep. 6] Why the Night Sky Is Dark Despite Countless Stars.mp4` -> `video/en/Why the Night Sky Is Dark Despite Countless Stars.mp4` (mv, shorts/en/에서 제거됨)
- 이동 전후 md5sum 일치 확인:
  - KO: `c13cf41e3249514780515cd44d4c494a` (이동 전후 동일)
  - EN: `10a4a017ce469bd4bf7df5b44f19afc4` (이동 전후 동일)
- `shorts/ko/`, `shorts/en/`에는 1~5화만 남음(확인 완료).

## 12. video/ 경로 정정 - shorts/video/ 하위로 재이동 (2026-08-10, 사용자 정정)

11절에서 `/home/lee/project/video/`(프로젝트 루트 직속)로 옮긴 것은 사용자 의도와 다른 경로였다.
사용자 정정: "shorts 안에 video 폴더를 만들어서 넣어달란거였어" - 올바른 경로는
`/home/lee/project/shorts/video/`(shorts/ 하위)다. 아래와 같이 재이동했다.

- `video/ko/온통 별인데 밤하늘이 캄캄한 이유.mp4` -> `shorts/video/ko/온통 별인데 밤하늘이 캄캄한
  이유.mp4` (mv)
- `video/en/Why the Night Sky Is Dark Despite Countless Stars.mp4` -> `shorts/video/en/Why the
  Night Sky Is Dark Despite Countless Stars.mp4` (mv)
- 이동 전후 md5sum 일치 확인:
  - KO: `c13cf41e3249514780515cd44d4c494a` (이동 전후 동일)
  - EN: `10a4a017ce469bd4bf7df5b44f19afc4` (이동 전후 동일)
- 비게 된 `/home/lee/project/video/ko/`, `/home/lee/project/video/en/`,
  `/home/lee/project/video/` 폴더는 빈 폴더임을 확인한 뒤 삭제(rmdir)했다.
- 최종 경로: `/home/lee/project/shorts/video/ko/온통 별인데 밤하늘이 캄캄한 이유.mp4`,
  `/home/lee/project/shorts/video/en/Why the Night Sky Is Dark Despite Countless Stars.mp4`.
  `/home/lee/project/video/`는 더 이상 존재하지 않는다.

---

## 13. v6 재렌더 (2026-08-10, `02-script-v6.md` 반영 - 제목·s4/s5·s5 화면 연출 + 오늘 결정된 공용 변경 3건)

대본 소스가 `02-script-v5.md` → `02-script-v6.md`로 바뀌면서 다음을 반영했다: (1) 제목 교체,
(2) s4·s5 내레이션 지시 대상 정합성 수정, (3) s5 화면을 "케플러 라벨 취소선 → 올베르스의 역설
팝인" 대비 연출로 신규 지정. 여기에 더해 오늘 별도로 확정된 공용 변경 2건(자막 크기 축소,
어두운 배경 캐릭터 대비 보강 원칙)도 이 화에 처음 적용했다.

### 13-1. 반영 내용

1. **자막 크기/글자수** - `assets/theme.ts`의 `FS.caption`(66→50)과 `assets/timeline.ts`의
   `wrapCounts` 기본값(ko 15→20자, en 22→29자)은 이미 수정되어 있었다. 이 화의
   `Episode.tsx`는 `wrapCounts(words, locale)`를 오버라이드 없이 호출하므로 공용 기본값을
   그대로 상속받아 별도 코드 수정이 필요 없었다. **다만 `profiles/general.md` 5절·8절에
   "15자"·"77px"로 옛 값이 문서로 남아 있어 코드값(20/29자, 50px)과 어긋나 있었다** - 이
   프로필 문서를 실제 코드값에 맞춰 갱신했다(builder 지시사항 1번 확인 결과: "프로필 쪽 제한이
   timeline.ts 기본값을 덮어써서 반영 안 되는 상황"은 아니었다 - 코드는 이미 정상 동작했고,
   문서만 옛 값이었다).
2. **캐릭터-배경 대비** - `character/Actor.tsx`/`Character.tsx`(공용)는 건드리지 않고, 이 화
   로컬 `scenes.tsx`에 `NIGHT_GLOW_STYLE`(CSS `drop-shadow` 3중 - tight/mid/wide 반경) 상수를
   추가해 s1(`S1Look`)·s2(`S2Surprised`)·s11(`S11Closing`)의 `Actor`/`BustActor` 호출에
   `style` prop으로 얹었다(shortform-builder 원칙 5 예방책 (a) 글로우 방식 채택 - 스트로크
   색 자체를 바꾸는 (b) override 방식은 눈·입 등 얼굴 디테일 색까지 같이 바뀌어 버려서
   기각했다).
3. **s5 화면 연출** - `S5Olbers`를 전면 재작성. 기존 "케플러 카드가 통째로 크로스페이드로
   사라짐" 대신, (a) "케플러" 라벨 위로 옅은 빨간(`#FF6B5B`, 이 화 로컬 상수) 취소선이
   왼쪽에서 오른쪽으로 그어지고, (b) 취소선이 완성된 직후 "케플러" 글자만 먼저 흐려지고,
   (c) 카드 전체(뱃지+아이콘+테두리)가 살짝 늦게 퇴장하고, (d) 카드가 사라진 직후
   "올베르스의 역설"이 s4 카드보다 훨씬 크게 팝인하는 4단계로 나눴다. 새 로컬 컴포넌트
   `StrikeLabel`(취소선 전용) 하나만 추가했고, `Card`/`Appear`/`Label`은 그대로 재사용했다
   (REGISTRY 규칙 2 - 에피소드 로컬, 라이브러리 미등록).
4. **제목** - `strings.ts`의 `title`을 KO `별들이 빛나는데 밤하늘이 캄캄한 이유` / EN
   `Why the Night Sky Stays Dark When Every Star Is Shining`으로 교체(`02-script-v6.md` "제목"
   절 확정값 그대로, 재작성하지 않음).
5. **s4·s5 내레이션** - `script-ko.json`/`script-en.json`의 s4(ko·en)·s5(ko만, en은 v5부터
   이미 "puzzle"을 쓰고 있어 무변경) 텍스트를 대본 그대로 반영하고 재합성했다.

### 13-2. 언어별 재실측 (원칙 4 - s4·s5만 재합성, 나머지는 문장 무변경)

**한국어**: s4 3.912s→4.008s(126f, +3f), s5 7.392s→7.296s(225f, -3f) - 두 구간 프레임 변화가
정확히 상쇄되어 **본편 합계 2706프레임(90.200초)으로 v5와 완전히 동일**하다. mp4 전체
2919프레임/**97.344초**(ffprobe 실측, v5의 97.300초 대비 +0.044초 - 문장이 안 바뀐 나머지
구간의 TTS 재합성 미세 오차, 프레임 수 자체는 무변동).

**영어**: s4 텍스트만 바뀌었으나(ask→notice, question→puzzle) 재합성 결과 길이가
7.320s→7.320s로 **동일**(226f 무변동, 단어 수도 17개로 동일). 본편 합계 3201프레임
(106.700초) v5와 동일. mp4 전체 3414프레임/**113.856초**(ffprobe 실측, v5의 113.800초 대비
+0.056초 - 역시 나머지 구간 TTS 미세 오차).

**두 언어 모두 총 프레임 수가 v5와 정확히 같게 나온 것은 우연이다** - s4·s5 반올림이 KO에서는
서로 상쇄됐고, EN은 애초에 재합성 길이가 거의 동일했다. 의도적으로 맞춘 것이 아니라 실측
결과다(원칙 4 - 두 언어의 길이를 맞추려 조정하지 않는다는 원칙과 무관하게 각자 독립 계산한
결과가 이렇게 나왔을 뿐이다).

갱신된 타임코드 표는 `02-script-final-ko.md`(v6 재렌더), `02-script-final-en.md`(v6 재렌더)
참고.

### 13-3. 렌더 (언어별 각 1회, v3 → v4)

```
npx remotion render --public-dir=episodes/general-ep06-dark-night-sky/public \
  episodes/general-ep06-dark-night-sky/src/index.ts EpisodeKo out/episode-ko-v4.mp4
npx remotion render --public-dir=episodes/general-ep06-dark-night-sky/public \
  episodes/general-ep06-dark-night-sky/src/index.ts EpisodeEn out/episode-en-v4.mp4
```

`npx tsc --noEmit` 통과 확인(스타일/컴포넌트 수정 후 1회).

### 13-4. 검수 (v4, 언어별 관찰 기록 - `sceneStarts`/`sceneFrames` 실측값으로 프레임 계산)

프레임 추출: `out/frames-ko-v4/`, `out/frames-en-v4/`에 각 언어 30장(+extra 2장 인트로/제목카드
확인용)을 새로 뽑았다(`ls -la`로 타임스탬프 갱신 확인 후 Read).

**공통 체크리스트**:
- [x] **자막 화면이탈**: KO f010("근데 정작 이 역설에는 케플러 이름이"), f019("모습이에요
  근데 다른 별빛은 그것보다", 18자), EN f010("Except this puzzle isn't")·f015("universe went
  on forever with", 29자 - char 상한에 딱 맞닿았지만 박스 안 여유 있게 들어감) 등 다수 프레임
  확인 - 좌우 잘림 없음.
- [x] **장면 전환 캐릭터 잔상**: 없음(기존 SceneSwitcher 크로스페이드 동작, v3에서 이미 확인된
  패턴과 동일 - 이번엔 s4/s5/제목만 바뀌었으므로 전환 자체는 재확인 생략, 원칙 5 "같은 사실
  중복 검증 금지").
- [x] **등장 전 요소 잔상**: S5의 새 `StrikeLabel`도 `cardOpacity>0.01`/`bigP>0.001` 조건부
  렌더라 점 잔상 없음(f009 카드 시작 프레임에서 취소선·큰 라벨 모두 미표시 확인).
- [x] **라벨 잘림**: S5 "케플러"/"올베르스의 역설"(f009~f013, EN f009~f013) 모두 카드/화면
  안에 들어옴. S10 "1848"/"에드거 앨런 포"(f023) 원 안에 정상.
- [x] **요소 겹침**: 없음(S5 카드↔큰 라벨이 서로 다른 시간대에 등장, f011에서 카드만 흐려지는
  중·f012에서 카드 완전히 사라지고 큰 라벨만 존재함을 확인).
- [x] **화면 하단 여백 과다**: S1/S11 Actor·S2 BustActor 레이아웃 무변경, 여백 과다 없음.
- [x] **음량**: KO Input Integrated -13.5 LUFS / True Peak -2.0 dBTP, EN -16.4 LUFS / -2.9
  dBTP - 둘 다 클리핑 없음(v3 실측과 거의 동일, 오디오 트랙 자체는 s4/s5만 재합성이라 나머지
  구간 레벨 무변동).
- [x] **자막 스타일**: 폰트 크기가 눈에 띄게 작아졌고(f010/f019/EN f015 등에서 확인) 한 줄에
  들어가는 글자 수가 늘어남을 직접 확인(예: "돼요 도시에서는 그마저 확 줄어요" 16자 한 줄,
  이전 15자 상한 기준이면 두 줄로 쪼개졌을 문장).
- [x] **화면 문자열 언어별 분기**: EN 프레임 전체(제목카드·s4~s5·아웃트로 "Follow for
  more"/"Next up" 등)에서 한국어 글자 미검출.
- [x] **캐릭터 윤곽선-배경 대비**: KO f002(S1)·f004(S2)·f026/f027(S11), EN f003(S1) 등에서
  크림색 글로우가 팔다리 가는 선 바깥에 뚜렷하게 형성되어 배경(진한 남색 `C.night`)과 분리되어
  보임을 확인. S11 말풍선(f027)과 글로우가 서로 간섭하지 않음도 확인.

**(프로필 추가) 자막 글자수 상한**: KO 20자/EN 29자 기준 관찰된 캡션 전부 상한 이내(EN
"universe went on forever with" 29자가 관찰된 최댓값).

**(프로필 추가) 60초 상한**: 이 화는 `03-critique-r1.md`에서 150~200초 별도 승인된 화다.
KO 97.344초/EN 113.856초 모두 v5와 사실상 동일(±0.05초), 여전히 그 범위보다 짧지만 원칙대로
채우지 않았다.

### 13-5. 관찰되었으나 이번 작업 범위 밖으로 판단한 것 (수정하지 않음)

- **제목카드 줄바꿈이 단어 중간에서 끊김** - KO 제목카드에서 "캄캄한"이 "캄" / "캄한"으로
  두 줄에 걸쳐 쪼개짐(f-extra2, frame96). 이는 `assets/scenes/TitleCard.tsx`(공용 컴포넌트)가
  폭 기준으로 글자 단위 줄바꿈을 하기 때문이며, 이번 지시 범위(제목 "문구" 교체)에 포함되지
  않은 기존 컴포넌트 동작이다. 다른 화에도 영향을 주는 공용 컴포넌트라 이번 작업 범위에서
  임의로 고치지 않았다 - 필요하면 별도로 지시해 달라.
- **Outro의 미니 캐릭터(브랜드 공용 `Outro.tsx`)에는 글로우를 넣지 않았다** - 이번 지시가
  가리킨 "캐릭터가 등장하는 장면"은 이 화의 본편 장면(s1·s2·s11)이고, Outro는 전 화 공용
  브랜드 자산이라 이 화 로컬 스타일을 얹지 않았다. Outro 배경이 어두운 톤이라 동일한 대비
  이슈가 원칙적으로 있을 수 있으나, 전 화 공용 요소를 이 화 단독 판단으로 바꾸지 않았다.

### 13-6. out/ 버전 정리 (2026-08-10, 기술 검증 통과 후 자동 진행)

직전 1개 버전만 남기는 정책(2026-08-09)에 따라 v4가 새 current, v3가 새 previous가 됐다.

- 삭제: `out/episode-ko-v2.mp4`, `out/episode-en-v2.mp4`, `out/frames-ko-v2/`(28장+check2),
  `out/frames-en-v2/`(28장+rumor3), `out/frames-en-v3/`(count·final_count 2장, 비교용 잔여
  산출물) - v2는 이제 2버전 전이라 정리 대상.
- 유지: `episode-ko-v3.mp4`, `episode-en-v3.mp4`(직전 버전, 회귀 비교용), `episode-ko-v4.mp4`,
  `episode-en-v4.mp4`(현재), `out/frames-ko-v4/`, `out/frames-en-v4/`(이번 검수 프레임).

### 13-7. shorts/video/ 배포 (2026-08-10, 기술적 검증 통과 후 자동 진행 - 별도 승인 없음)

제목이 바뀌어 파일명도 바뀐다. 사용자 지시대로 접두사(`[6화]`/`[Ep. 6]`) 없이 제목만 쓴다.

- 구 파일 삭제: `shorts/video/ko/온통 별인데 밤하늘이 캄캄한 이유.mp4`,
  `shorts/video/en/Why the Night Sky Is Dark Despite Countless Stars.mp4` (제목 변경으로 인한
  구버전 교체 삭제)
- 신규 배포: `shorts/video/ko/별들이 빛나는데 밤하늘이 캄캄한 이유.mp4` ←
  `out/episode-ko-v4.mp4`, `shorts/video/en/Why the Night Sky Stays Dark When Every Star Is
  Shining.mp4` ← `out/episode-en-v4.mp4`
- md5sum 비교: 양쪽 다 소스·대상 일치 확인
  - KO: `75403825df9cddde9449cb55e0941bc0` (양쪽 동일)
  - EN: `4455e2af9938e9cfd458deb962773508` (양쪽 동일)
- 배포 후 `shorts/video/ko/`, `shorts/video/en/`에 각각 새 파일 1개씩만 존재함을 `ls -la`로
  확인(구 파일명 잔존 없음).

### 13-8. 최종 산출물 (v4)

- `out/episode-ko-v4.mp4` - 2919프레임 / 97.344초(ffprobe 실측) / 절대경로:
  `/home/lee/project/.claude/shortform/episodes/general-ep06-dark-night-sky/out/episode-ko-v4.mp4`
- `out/episode-en-v4.mp4` - 3414프레임 / 113.856초(ffprobe 실측) / 절대경로:
  `/home/lee/project/.claude/shortform/episodes/general-ep06-dark-night-sky/out/episode-en-v4.mp4`
- `shorts/video/ko/별들이 빛나는데 밤하늘이 캄캄한 이유.mp4`
- `shorts/video/en/Why the Night Sky Stays Dark When Every Star Is Shining.mp4`

## 14. 공용 컴포넌트 결함 수정 - TitleCard 제목 줄바꿈 (2026-08-10, v4 → v5)

13-5절에서 "이번 작업 범위 밖"으로 보류했던 **제목카드 단어 중간 줄바꿈 결함**을 별도 지시로
수정했다. 대상은 `assets/scenes/TitleCard.tsx`(1~6화 전부가 쓰는 공용 컴포넌트) - 이 화 전용
파일이 아니다.

**원인**: 제목 텍스트 `style`에 `word-break` 지정이 없어, 브라우저가 폭 제약에 맞춰 한글을
음절 단위로 아무 데서나 끊었다("캄캄한"이 "캄" / "캄한"으로 분리).

**수정**: 제목 텍스트 `style`에 `wordBreak: 'keep-all'` 한 줄 추가(어절 경계에서만 줄바꿈,
영어는 원래 공백 기준이라 무해).

**검증 (렌더 전 - 컴포넌트 격리 stills)**: `npx remotion still`로 6개 화(ep01~06) x 2개 언어
= 12장을 각 화 `EpisodeKo`/`EpisodeEn` 컴포지션에서 프레임 99(인트로 69 + 제목카드 로컬 프레임
30, 텍스트 등장 완료 후 안정 구간)로 직접 추출해 Read로 확인했다.
- ep06 KO(이번 수정의 근거 사례): "별들이 빛나는데 밤하늘이" / "캄캄한 이유" 2줄, "캄캄한"이
  더 이상 쪼개지지 않고 한 줄에 온전히 들어감을 확인.
- ep01~05 KO 5장: 전부 어절 경계에서만 줄바꿈, 화면 밖 이탈·글자 겹침 없음(회귀 없음).
- ep01~06 EN 6장: 전부 단어 경계 줄바꿈 유지(원래도 `keep-all` 영향을 안 받는 대상), 3줄까지
  가는 긴 제목(ep03 "Stranger's", ep05 "Open It", ep06 "Shining")도 화면 안에 들어감.

**렌더 (v4 → v5, 언어별 각 1회)**:
```
npx remotion render --public-dir=episodes/general-ep06-dark-night-sky/public \
  episodes/general-ep06-dark-night-sky/src/index.ts EpisodeKo out/episode-ko-v5.mp4
npx remotion render --public-dir=episodes/general-ep06-dark-night-sky/public \
  episodes/general-ep06-dark-night-sky/src/index.ts EpisodeEn out/episode-en-v5.mp4
```
`ffprobe`로 프레임 수·길이 재확인: KO 2919프레임/97.300초, EN 3414프레임/113.800초 -
v4(2919/97.344초, 3414/113.856초)와 **프레임 수 완전 동일**(±0.05초 미세 오차는 v3→v4때도
있었던 ffprobe 컨테이너 duration 반올림 수준, 타이밍 변경 없음 - TitleCard는 스타일 1줄만
바꿨을 뿐 프레임 로직 무변경).

**최종 mp4 실프레임 재확인**: `out/episode-ko-v5.mp4`/`episode-en-v5.mp4`에서 ffmpeg로 프레임
99를 직접 추출(`out/frames-ko-v5/titlecard_f099.png`, `out/frames-en-v5/titlecard_f099.png`)해
Read로 재확인 - stills 검증과 동일하게 "캄캄한" 한 줄 온전, EN 3줄 정상.

**이 수정 범위에서 확인하지 않은 것**: TitleCard 외 다른 장면(s1~s11)·Intro·Outro는 이번
변경과 무관해(같은 컴포넌트를 쓰지 않음) 재검수하지 않았다(원칙 5 "같은 사실 중복 검증
금지"). 오디오 트랙도 무변경이라 재측정하지 않았다.

**out/ 버전 정리**: 직전 1개 버전만 남기는 정책에 따라 `episode-ko-v3.mp4`·`episode-en-v3.mp4`
삭제(2버전 전), `frames-ko-v4/`·`frames-en-v4/` 삭제(이전 라운드 검수 프레임, v5가 현재
라운드가 되며 v4가 "직전 버전"으로 격하 - mp4는 유지하되 프레임 폴더는 v2→v4 전환 때와 동일한
패턴으로 정리). 유지: `episode-ko-v4.mp4`·`episode-en-v4.mp4`(직전 버전, 회귀 비교용),
`episode-ko-v5.mp4`·`episode-en-v5.mp4`(현재), `frames-ko-v5/`·`frames-en-v5/`(이번 검수).

**shorts/video/ 재배포 (기술적 검증 통과 후 자동 진행, 별도 승인 없음)**: 파일명 무변경(제목
안 바뀜, 내용만 갱신).
- `shorts/video/ko/별들이 빛나는데 밤하늘이 캄캄한 이유.mp4` ← `out/episode-ko-v5.mp4`
  (md5 `c5d4230815f73c8375d2949140e78a9c`, 양쪽 동일 확인)
- `shorts/video/en/Why the Night Sky Stays Dark When Every Star Is Shining.mp4` ←
  `out/episode-en-v5.mp4` (md5 `1f0e3de85f8aab6261032202573f3e9a`, 양쪽 동일 확인)

**최종 산출물 (v5)**:
- `/home/lee/project/.claude/shortform/episodes/general-ep06-dark-night-sky/out/episode-ko-v5.mp4`
- `/home/lee/project/.claude/shortform/episodes/general-ep06-dark-night-sky/out/episode-en-v5.mp4`
- `/home/lee/project/shorts/video/ko/별들이 빛나는데 밤하늘이 캄캄한 이유.mp4`
- `/home/lee/project/shorts/video/en/Why the Night Sky Stays Dark When Every Star Is Shining.mp4`

---

**위 관찰 결과(4·5·6·7·13·14절)를 사용자에게 제시하고 확인을 기다립니다.** 이 문서의
체크리스트는 관찰한 사실만 기록했고, "검수 통과"·"합격" 같은 최종 판정은 포함하지 않았습니다 -
최종 판단은 사용자 몫입니다.
