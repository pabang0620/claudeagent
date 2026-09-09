# 빌드 리포트 - general-ep09-pins-and-needles ("다리 저릴 때 찌릿한 이유")

대본 소스: `02-script-v2.md`

**작업 정황**: 이전 세션이 대본→TTS→립싱크→씬 조립→v1~v3 렌더까지 진행한 상태에서 중단됐다.
이번 세션은 그 산출물(`src/`, `public/audio/`, `script-ko.json`/`script-en.json`)이 온전한지
확인한 뒤 이어서 검수·배포까지 마쳤다. 코드는 전혀 수정하지 않았다.

## 1. 자산 (공용, 언어 무관 - 이전 세션이 완료, 이번 세션은 검증만)

### REGISTRY 대조 결과 (`assets/REGISTRY.md`)

**재사용**: `character/Actor` + `POSES.surprised`(s2 휘청 리액션) / `POSES.touchForehead`
(s6 이마 짚기, 기존 "차가운 음식 이마 찌릿" 리액션용 포즈 재사용), `character/BustActor`,
`props/AnalogClock`(s7 시계 타임랩스, general-long01에서 최초 제작), `props/Symbols`의 `QMark`
(s6 속설 표시 배지), `scenes/Caption`/`Label`, `backgrounds/PlainBg`, `brand/Intro`/`Outro`,
`scenes/TitleCard`, 효과음 `audio/hop_thump.mp3`(착지음, perdungi-demo-dynamic에서 최초 제작)·
`audio/cold_zing.mp3`(따끔거림, general-ep01에서 최초 제작) - 둘 다 REGISTRY에 "재사용 가능"으로
명시된 대로 신규 제작 없이 그대로 가져다 썼다.

**신규 제작(1개, 대본이 지정한 그대로)**:
- `assets/props/LegNerveDiagram.tsx` - 다리 옆모습(허벅지+종아리+발 캡슐 실루엣) + 무릎 뒤쪽을
  지나는 신경 경로 오버레이. `compressProgress`(0~1, 체중이 눌리며 신호가 옅어짐)·
  `releaseProgress`(0~1, 눌림이 풀리며 결정적 위상차로 불균일하게 스파크가 튐 - frame 기반 sin,
  `Math.random` 미사용) 독립 progress 2종으로 s1·s3·s4·s5를 컴포넌트 하나로 커버했다.
  REGISTRY에 등록 완료, "자세·눌림을 소재로 한 다른 화에서도 재사용 가능"으로 명시.

**정적 검사**: `node scripts/precheck.mjs episodes/general-ep09-pins-and-needles` -
에러 0 / 경고 0 (이번 세션에서 재확인, KO-STR·RANDOM·NOWRAP·WORDBRK·FORMAT·IMPORT 전부 통과).

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 내용 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|---|
| s1(무성) | 다리 눌림 트리거 | 2.200(고정, 대본 지정) | 66 |
| s2(리액션+훅) | "으엇 다리가 왜..." | 2.760 | 101(+0.6s 특수 pad, s2→s3 훅 전환) |
| s3 | 신경 눌려 신호 약해짐 | 4.872 | 152 |
| s4 | 눌림 풀리며 신호 튐 | 7.176 | 221 |
| s5 | 양반다리 맥락 | 7.488 | 231 |
| s6 | 이마 십자 민간요법 | 11.712 | 357 |
| s7 | 약 1분 후 안정 | 4.824 | 151 |
| 본편 합계 | | 41.032 | 1279 |
| 전체(인트로+제목카드+본편+아웃트로) | | | 1492프레임 = 49.733초(ffprobe 49.792s) |

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz 리액션 부스트)

| 구간 | 내용 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|---|
| s1(무성) | 다리 눌림 트리거 | 2.200(고정) | 66 |
| s2(리액션+훅) | "Whoa, why does..." | 3.384 | 120(+0.6s 특수 pad) |
| s3 | 신경 눌려 신호 약해짐 | 6.264 | 194 |
| s4 | 눌림 풀리며 신호 튐 | 7.440 | 229 |
| s5 | Sitting cross-legged 맥락 | 7.128 | 220 |
| s6 | 이마 십자 folk trick | 12.264 | 374 |
| s7 | About a minute later | 5.328 | 166 |
| 본편 합계 | | 44.008 | 1369 |
| 전체(인트로+제목카드+본편+아웃트로) | | | 1582프레임 = 52.733초(ffprobe 52.779s) |

**두 언어 길이 차이**: EN이 KO보다 90프레임(3.0초) 길다. 영어 발화가 전반적으로 더 길기 때문이며
(s2·s3·s4·s6·s7 전부 EN > KO), 맞추기 위한 배속·무음 조정은 하지 않았다(원칙 4).

## 3. 렌더

이전 세션이 v1~v3까지 렌더(코드 수정과 함께 반복 검수)했고, 이번 세션 진입 시점의 `out/`에는
v3(ko/en) mp4와 그로부터 뽑은 프레임(18장×2언어, 임의 프레임 번호)이 남아 있었다. v3의 mtime이
`scenes.tsx` 최종 수정 시각(18:10:31)보다 늦어(18:11~18:12) 코드와 일치함을 확인하고, `sceneFrames`/
`sceneStarts` 재계산값과 `ffprobe` 실측 프레임 수(KO 1492, EN 1582)가 정확히 일치함도 확인했다.

이번 세션에서 v3 프레임을 장면 경계 기준(각 구간 시작 직후 + 중간 지점, `sceneStarts`/`sceneFrames`
로 언어별 재계산)으로 다시 뽑아 전수 검수했다(아래 4절). 검수 도중 다중 프레임 일괄 추출
(`ffmpeg select` 필터에 프레임 여러 개를 한 번에 지정)에서 프레임 하나가 다른 화(goosebumps
ep08)의 캐릭터·자막과 겹쳐 보이는 것을 발견해 조사한 결과, `out/`이 여러 화 세션이 공유하는
디렉토리라 동시에 다른 세션이 ep07/ep08을 같은 파일명 패턴(`out/episode-ko-v*.mp4`)으로 렌더링
중이었던 것으로 파악됐다(실제로 이번 세션 도중 `shorts/ko|en/`에 `[7화]`·`[8화]` 파일이 새로
나타남). 개별 프레임을 `-frames:v 1`로 하나씩 다시 뽑자 정상 내용으로 확인되어, 일괄 추출 방식의
디코딩 문제였음을 확인했다(비디오 자체는 손상되지 않음).

검수를 마친 직후 `out/`에서 ep09 v3 mp4 2개가 사라진 것을 발견했다 - 다른 세션이 완료 후
"배포 완료 시 out/의 mp4 전부 삭제" 정책을 `out/` 디렉토리 전체 기준으로 수행하며 함께 삭제한
것으로 보인다(코드는 무변경 확인됨, `src/` mtime 그대로). 이미 검증까지 마친 동일 코드였으므로
v4로 재렌더했고, `ffprobe` 프레임 수·길이가 v3와 정확히 일치(KO 1492/49.792s, EN 1582/52.779s)
하고 대표 프레임 1장을 v3와 픽셀 대조해 동일함을 확인한 뒤 그대로 배포했다.

**렌더 횟수(이번 세션 기준)**: KO 1회(v4), EN 1회(v4). v1~v3는 이전 세션이 수행.

## 4. 검수 (원칙 5 - 관찰 기록, 자체 최종판정 아님)

프레임은 언어별 `sceneStarts`/`sceneFrames` 재계산 결과로 각 구간의 시작 직후·중간 지점을 뽑았다
(인트로 35, 제목카드 96, s1~s7 각 시작+중간, 아웃트로 1개, 총 18장×2언어). 재렌더(v4) 후 대표
프레임 1장(s6, frame 1072)을 v3와 픽셀 단위로 재대조해 동일함을 확인했다.

- **자막 화면이탈**: KO/EN 전 구간 캡션이 좌우 안전영역 안에 들어옴(f001~f018 전수 확인). EN
  긴 문장(s6 "There's an old Korean folk trick...")도 wrapCounts 기준 줄바꿈되어 이탈 없음.
- **장면 전환 캐릭터 잔상**: s1→s2(f005, frame192), s2→s3(f008, frame293), s4→s5(f012, frame666),
  s5→s6(f014, frame897), s6→s7(f016, frame1254) 크로스페이드 경계 프레임을 확인 - 두 장면 콘텐츠가
  겹쳐 보이는 것은 SceneSwitcher의 의도된 xfade(6프레임)/fadeIn(8프레임) 동작이고, 전환이 끝난
  중간 지점 프레임에서는 잔상 없이 단일 장면만 보임.
- **등장 전 요소 잔상**: s3~s5 라벨(Label)이 `opacity` 트랜지션으로 등장(스케일 0 방식 아님) -
  등장 전 프레임(f008 등)에서 점처럼 남는 요소 없음.
- **라벨 화면 밖 잘림**: KO `양반다리 자세`/`이마에 십자 긋기 - 민간요법`, EN `Sitting cross-legged`/
  `Drawing a cross on your forehead - old folk trick` 전부 안전영역 안(f009,f013,f015 / EN 대응
  프레임)에서 확인, 잘림 없음.
- **요소 겹침**: s6 QMark 배지(우측 상단)와 캐릭터 머리·라벨 사이 겹침 없음(f015 KO, f015 EN).
- **화면 하단 여백**: PlainBg의 GROUND(y=1250, 전체 1920 대비 약 65% 지점)를 기준으로 콘텐츠가
  중앙~하단까지 채워짐(f001~f018 공통), 하단 과다 여백 없음.
- **음량**: `loudnorm=print_format=summary` 측정 - KO Input Integrated -13.7 LUFS/True Peak
  -2.0dBTP, EN -16.5 LUFS/-2.2dBTP. 클리핑 없음(0dBTP 미만), 조용하지 않은 수준.
- **자막 스타일**: 공용 `Caption.tsx`/`theme.ts`의 `FS.caption`(50) 그대로 사용, 프로필 커스텀 없음.
- **언어별 문자열 분기**: KO/EN 프레임을 나란히 대조 - EN 프레임(intro/title/s1~s7/outro 전수)에
  한국어 글자 없음 확인(채널명 "Whymo", "Follow for more" 등 전부 영어). KO 프레임에도 영어 잔존
  없음. `strings.ts` 테이블 경유 확인(코드 리뷰 + 프레임 대조 이중 확인).
- **캐릭터 윤곽선 대비**: 전 장면이 밝은 PlainBg 배경이라 어두운 스트로크(C.ink)와 대비 문제 없음
  (ep06과 달리 밤하늘류 어두운 배경 아님, 원칙 5 글로우 검토 대상 아님).

**속설 표시 특별 확인(planner 원칙 1-2)**: s6 라벨이 KO `이마에 십자 긋기 - 민간요법`, EN
`Drawing a cross on your forehead - old folk trick`로 "민간요법/old folk trick"임을 화면에 명시.
추가로 금색 QMark 배지가 캐릭터 옆에 함께 표시되어 이중으로 속설임을 알림(f015 KO/EN 확인).

### 프로필 추가 체크 (general.md 8절)

일반 프로필은 별도 자막 글자수 상한·전문용어 노출 제약이 공용 규칙(FS.caption/wrapCounts)과
동일하게 적용되며, 이번 화에서 전문용어(비골신경 등 특정 신경명)는 대본 자체가 "다리 속 신경"으로
정성적 표현을 유지해 별도 위반 없음(02-script-v2.md 1절 "용어 점검" 참고).

## 5. 배포

기술 검증(정적 검사 + 프레임 검수 + 음량 측정)을 마친 뒤 곧바로 `shorts/`에 반영했다.

- KO: `/home/lee/project/shorts/ko/[9화] 다리 저릴 때 찌릿한 이유.mp4`
  (md5 `45d5dfd6af4b82ca9ab8e994eb857aca`, out/ 원본과 일치 확인)
- EN: `/home/lee/project/shorts/en/[Ep. 9] Why Your Leg Feels 'Pins and Needles'.mp4`
  (md5 `82683dff8f81f90cf197676614ab89b6`, out/ 원본과 일치 확인)

배포 확인 후 `out/`의 mp4(episode-ko-v4.mp4, episode-en-v4.mp4)는 삭제했다.
`out/frames-ko/`·`out/frames-en/`(각 18장, 검수용)는 유지한다.

**결론이 아니라 관찰 기록**: 위 항목들은 실제로 확인한 사실이며, 최종 사용 가능 여부 판단은
사용자 몫이다.

---

## 6. v3 수정 (제목·통념 반박 구조 추가)

### 수정 내용

1. **제목 변경**: KO "다리 저릴 때 찌릿한 이유" -> **"다리 눌렸다 풀리면 찌릿한 이유"**,
   EN "Why Your Leg Feels 'Pins and Needles'" -> **"Why Your Leg Tingles When It 'Wakes Up'"**.
   `src/strings.ts`의 `title` 갱신(제목카드가 이 값을 읽는다). 상세 근거는
   `02-script-v3.md`의 "제목" 절(후보 A/B/C 검토, 선정 이유) 참고.
2. **통념 반박 구조 신규 추가**: s2 리액션에 "피가 안 통해서 그런가?" 추측을 붙이고, 신규
   s3("피 때문?" 팝인 -> 취소선 -> 페이드아웃, 내레이션 "이 찌릿한 느낌, 사실 피가 안 통해서
   생기는 게 아니에요")를 삽입했다. 이후 구 s3~s7이 s4~s8로 한 칸씩 밀렸다(내용 자체는 s4에서
   "혈관도 같이 눌리지만" 양보절 추가 외에는 변경 없음, s7은 문장 압축).
3. TTS 재합성: s2(문장 변경)·s3(신규)·s4(문장 변경)·s7(문장 압축)을 포함해 s2~s8 전체를
   다시 합성했다(구간 id가 s2~s8로 밀렸으므로 전량 재생성이 더 안전, 부분 재사용 시 파일명
   충돌 위험).

### precheck.mjs 결과

에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `out/`에 다른 병행 작업 중인 화(ep08/ep10/ep13/ep19/
ep20 추정)의 `frames-ko/`·`frames-en/`가 있음, 이 화가 남긴 것이 아니므로 무시, 지시사항대로
건드리지 않음).

### "피 때문?" 취소선 연출 구현 방식 (14화 재사용 여부)

`episodes/general-ep14-meat-browning-maillard/src/scenes.tsx`의 `StrikeLabel`·`S2Oxygen`
패턴을 그대로 재사용했다(원칙 0) - 좌표·타이밍 계산 로직(`popP`/`strikeP`/`fadeOut`을
`frames`의 비율로 나누는 방식, `position:absolute; left:'50%'; transform:translateX(-50%)`로
`Appear` 컴포넌트를 거치지 않고 직접 좌표+opacity+transform을 한 요소에 얹는 방식)을 손대지
않고 이 화(`src/scenes.tsx`)에 `S3BloodMyth` 컴포넌트로 로컬 복제했다. 14화에서 실측된 영어판
두 줄 줄바꿈 버그(취소선이 첫 줄에만 그어짐)의 원인이었던 `whiteSpace` 누락을 `StrikeLabel`의
`span` 스타일에 `whiteSpace: 'nowrap'`으로 유지해 재현을 막았다 - 프레임 검수(아래)에서 EN
"Blood flow?"가 실제로 한 줄에 유지되며 취소선이 전체를 가로지르는 것을 확인했다.

### 프레임수·길이 (ko/en, v3)

| | KO | EN |
|---|---|---|
| 본편 합계 | 1369프레임 = 45.633초 | 1464프레임 = 48.800초 |
| 전체(인트로+제목카드+본편+아웃트로) | **1582프레임 = 52.733초**(ffprobe 실측 52.733초) | **1677프레임 = 55.900초**(ffprobe 실측 55.900초) |

v2 대비 본편이 KO +90프레임(3.0초)/EN +95프레임(3.17초) 늘었다 - 신규 s3(132/146프레임)가
추가된 반면 s7 압축으로 일부 상쇄됐다. 60초 상한 안(EN 55.9초, 약 4.1초 여유).

두 언어의 총 길이 차이(52.733초 vs 55.900초, 약 3.17초)는 발화 길이 차이에 따른 정상적인
결과이며 맞추지 않았다(원칙 4).

### 검수 체크리스트 (v3, 언어별 관찰 기록)

프레임은 각 언어의 `sceneStarts`/`sceneFrames` 실측으로 계산한 구간별 시작+5/10프레임(팝인
구간 확인용)·중간 프레임을 사용했다. 재렌더 전 `out/frames-ko/`·`out/frames-en/`를 비우고
새로 뽑은 뒤 타임스탬프로 최신 생성 확인(둘 다 렌더 직후 시각, 14개 프레임씩).

- [x] **자막 화면이탈**: KO/EN 전 프레임(title/s1~s8/outro)에서 자막 박스가 좌우 안전영역 안에
  있음을 확인. 특히 EN s2 캡션("like pins and needles Is it")이 문장 경계 없이 이어붙는 형태로
  보이나(두 문장이 한 캡션 조각으로 wrap됨) 화면 밖으로 잘리지는 않음 - 기존 `buildCaptions`
  wrap 로직의 일반 동작이며 이번 화 신규 결함 아님.
- [x] **장면 전환 시 캐릭터 잔상**: s2->s3 전환 경계(KO f abs350=s3 local f5, EN f abs385)에서
  이전 장면(S2Surprised) 캐릭터가 옅게 겹쳐 보이나, 이는 `SceneSwitcher`의 6프레임 크로스페이드
  설계(원칙과 무관, 전 화 공통 동작)이지 결함이 아님 - 크로스페이드 구간을 벗어난 프레임
  (local f10 이후)에서는 깨끗하게 "피 때문?"/"Blood flow?"만 보임을 확인.
- [x] **등장 전 요소가 점처럼 남는 문제**: `S3BloodMyth`는 `opacity: popP * (1 - fadeOut)`로
  진입 전(f<2) `popP=0`이라 완전히 안 보임(`Appear`의 collapse 함정과 무관 - 좌표·투명도를
  한 요소에 얹는 방식이라 해당 없음). 프레임 관찰상 점 잔상 없음.
- [x] **라벨 화면 밖 잘림**: KO `피 때문?`, EN `Blood flow?` 전부 `whiteSpace:'nowrap'`으로
  한 줄 유지, 화면 중앙에 온전히 표시(f006/f007 KO, f006/f007 EN 등).
- [x] **요소끼리 겹침**: s3 신규 씬은 캡션 박스와 라벨(y=780) 사이 충분한 간격 확인, 겹침 없음.
- [x] **화면 하단 여백 과다**: v2와 동일 레이아웃 유지, 신규 s3도 라벨을 화면 중상단(y=780)에
  배치해 과다 여백 없음.
- [x] **음량**: KO Input Integrated -13.6 LUFS/True Peak -2.4dBTP, EN -16.4 LUFS/-2.2dBTP.
  클리핑 없음(0dBTP 미만), v2와 유사한 수준 유지.
- [x] **자막 스타일**: 공용 `Caption.tsx`/`theme.ts`의 `FS.caption`(50) 그대로 사용, 프로필
  커스텀 없음(변경 없음).
- [x] **언어별 문자열 분기**: EN 프레임(title/s1~s8/outro 전수) 전체에 한국어 글자 없음 확인
  (제목 "Why Your Leg Tingles When It 'Wakes Up'", "Blood flow?" 포함 전부 영어). KO 프레임에도
  영어 잔존 없음.
- [x] **캐릭터 윤곽선 대비**: 전 장면 밝은 PlainBg, 대비 문제 없음(v2와 동일 배경).

**통념 반박 특별 확인(취소선 연출)**: KO "피 때문?"·EN "Blood flow?" 모두 (1) 팝인 (2) 좌->우
취소선 드로잉 (3) 페이드아웃 3단계가 프레임상 순서대로 관찰됨. EN이 한 줄로 유지되어 취소선이
전체 단어를 가로지르는 것을 f007(local f65, strikeP~0.59)·f008(local f108, strikeP=1.0)에서
확인 - ep14에서 발견된 두 줄 분리 버그가 이 화에서는 재현되지 않았다.

### 프로필 추가 체크 (general.md 8절, v3)

- 자막 한 줄 상한(KO 20자/EN 29자): 신규 s3 라벨("피 때문?"/"Blood flow?")과 캡션 모두 상한
  이내(가장 긴 캡션 조각도 20자/29자를 넘지 않음, wrap된 2줄 캡션 각 줄 기준).
- 60초 상한: EN 55.900초로 여유 약 4.1초 확보, 상한 미준수 없음.
- 소재 적합성: 통념 반박(피가 아니라 신경)도 "겪어봤지만 검색까진 안 해본 사소한 궁금증"
  범주 안 - 대본 v3 상단의 "사실 개수" 절에서 이미 근거 서술(오답 배제이지 새 사실 추가 아님).

## 7. 배포 (v3, 제목 변경으로 파일명 갱신)

기술 검증(precheck + 프레임 검수 + 음량 측정)을 마친 뒤 곧바로 새 파일명으로 `shorts/`에
반영했다. **제목이 바뀌어 파일명이 달라지므로**, 새 파일 배포 + md5 일치 확인을 먼저 하고
그 다음에 구 파일명을 삭제했다(순서 준수).

- 신규 KO: `/home/lee/project/shorts/ko/[9화] 다리 눌렸다 풀리면 찌릿한 이유.mp4`
  (md5 `7208f3c69bdc3f4bd185c1d875dea807`, out/ 원본과 일치 확인)
- 신규 EN: `/home/lee/project/shorts/en/[Ep. 9] Why Your Leg Tingles When It 'Wakes Up'.mp4`
  (md5 `f687be30b6329a998675aa5c3917c930`, out/ 원본과 일치 확인)
- 삭제(구 파일명, md5 확인 후 제거): `/home/lee/project/shorts/ko/[9화] 다리 저릴 때 찌릿한 이유.mp4`,
  `/home/lee/project/shorts/en/[Ep. 9] Why Your Leg Feels 'Pins and Needles'.mp4` - 둘 다 삭제
  완료 확인(`ls`로 부재 확인).

배포 확인 후 `out/`의 mp4(episode-ko.mp4, episode-en.mp4)는 삭제했다. `out/frames-ko/`·
`out/frames-en/`(각 14장, v3 검수용, 이전 v2용 18장은 이번 재추출로 덮어써짐)는 유지한다.

**결론이 아니라 관찰 기록**: 위 항목들은 실제로 확인한 사실이며, 최종 사용 가능 여부 판단은
사용자 몫이다.
