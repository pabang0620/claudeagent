# 빌드 리포트 - general-ep10-self-tickle ("내가 나를 못 간지럽히는 이유")

대본 소스: `02-script-v2.md`

## 1. 자산 (공용, 언어 무관)

### REGISTRY 대조 결과 (`assets/REGISTRY.md`)

**재사용**: `character/Actor`/`BustActor`(미사용, `Actor`만 실사용) + `POSES.cheer`(s1)·`POSES.shrug`
(s2·s3 구석·s6·s8), `props/ThemedIcon`(`feather` - ep06에서 이미 검증, `brain`·`bolt` - 기존
캐시에 이미 존재), `scenes/Card`(s3, ep06 s10과 동일 패턴), `scenes/Effects`의 `Sparkles`(s1·s8)·
`Shake`(s1), `scenes/Caption`/`Label`, `backgrounds/PlainBg`, `scenes/TitleCard`, `brand/Intro`/
`Outro`, 효과음 `audio/ui_tap.mp3`(REGISTRY에 "화면 UI 탭·버튼 누름 동작 전반 재사용 가능"으로
명시된 대로 포크 접촉음으로 재사용)·`audio/cold_zing.mp3`("순간적 통증·놀람 리액션 전반
재사용 가능"으로 명시된 대로 스파크 접촉음으로 재사용) - 둘 다 신규 제작 없이 그대로 가져다 씀.

**신규 제작(1개, 대본이 지정한 스펙 그대로)**:
- `assets/props/TouchPredictionDiagram.tsx` - "손길이 예상 가능한지에 따라 반응(스파크) 크기가
  달라진다"는 구조의 범용 다이어그램. `mode`(`unpredictable`/`predicted`) + 신규 `agent`
  (`hand`/`robot`) + 신규 `delayProgress`(시간차 마커) 2개 옵션 프롭까지 대본 v2 스펙대로
  구현. REGISTRY에 등록 완료.
- 신규 아이콘 2종: `hand-finger`(포크하는 손), `robot`(로봇 팔) - `scripts/sync_icons.mjs
  hand-finger robot`으로 로컬 tabler 캐시(`assets/props/tabler-cache.json`)에 추가. 네트워크
  조회 없이 `@iconify-json/tabler` 로컬 패키지에서 뽑음. `brain`/`feather`/`bolt`는 이미 캐시에
  있어 추가 작업 불필요.

**정적 검사**: `node scripts/precheck.mjs episodes/general-ep10-self-tickle` - 에러 0 / 경고 1
(`SHAREDOUT` - 공용 루트 `shortform/out/`에 다른 화의 잔여 frames 폴더가 있다는 경고, 이 화와
무관 - 이 화는 `episodes/general-ep10-self-tickle/out/`에만 썼다).

### 렌더 중 발견해 수정한 결함 2건 (렌더 후 프레임 검수로 발견)

1. **s1·s2·s6·s8 포크 지점이 옆구리가 아니라 얼굴/뺨에 겹쳐 보임.** 이 캐릭터는 머리가 몸통보다
   훨씬 큰 비례(전신 높이의 절반 이상이 머리)라, "몸통 중간 높이"로 어림잡은 좌표(y=700)가
   실제로는 뺨 높이였다. 렌더된 프레임을 실측해 y=950(몸통 팔 아래)으로 재조정했고, 동시에
   `PlainBg`의 기본 바닥선(1250)이 이 장면들의 `ACTOR_GROUND`(1300)와 어긋나 발이 바닥선 위로
   떠 보이던 것도 `Scene` 래퍼에 `ground` prop을 추가해 맞췄다.
2. **s3 구석 캐릭터가 화면에 아예 안 보임.** `Actor`는 자체적으로 `position: absolute`로 화면
   전체 좌표계를 기준으로 배치되는데, 이를 `<div style={{position:'absolute', left:0,
   bottom:0}}>`로 한 번 더 감싸면서 `Actor`의 절대좌표 기준점이 화면 전체가 아니라 이 빈 래퍼
   div(크기 0)로 바뀌어 화면 밖으로 밀려났다. 래퍼 div를 제거하고 `Actor`를 직접 배치해 해결.

두 건 모두 코드 리뷰만으로는 안 잡히고 실제 렌더 프레임을 봐야 드러나는 결함이라, 원칙 5(렌더
후 프레임 검수)가 실제로 결함을 잡은 사례다.

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 내용 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|---|
| s1(무성) | 남이 옆구리를 찌르자 웃음 | 3.000(고정, 대본 지정) | 90 |
| s2(리액션+훅) | "어, 하나도 안 간지럽네..." | 3.744 | 130(+0.6s 특수 pad) |
| s3 | 고대 그리스 철학자 일화 | 5.424 | 169 |
| s4 | 예상 못한 손길 = 큰 반응 | 5.424 | 169 |
| s5 | 뇌가 미리 계산 = 작은 반응 | 5.712 | 177 |
| s6 | 놀랄 이유가 없다 | 4.128 | 130 |
| s7 | 로봇 팔 + 시간차 | 6.456 | 200 |
| s8 | 예측이 어긋나면 다시 간지럽다 | 4.416 | 138 |
| 본편 합계 | | 38.304 | 1203 |
| 전체(인트로+제목카드+본편+아웃트로) | | | 1416프레임 = 47.200초(ffprobe 47.253s) |

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz 리액션 부스트)

| 구간 | 내용 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|---|
| s1(무성) | 고정 | 3.000(고정) | 90 |
| s2(리액션+훅) | "Huh, that doesn't tickle..." | 3.504 | 123(+0.6s 특수 pad) |
| s3 | Ancient Greek philosopher story | 5.856 | 182 |
| s4 | Unpredictable touch = big reaction | 4.848 | 151 |
| s5 | Brain predicts it = tiny reaction | 5.688 | 177 |
| s6 | Nothing left to be surprised about | 4.704 | 147 |
| s7 | Robot arm + delay | 6.240 | 193 |
| s8 | Break the prediction | 4.536 | 142 |
| 본편 합계 | | 38.376 | 1205 |
| 전체(인트로+제목카드+본편+아웃트로) | | | 1418프레임 = 47.267초(ffprobe 47.317s) |

**두 언어 길이 차이**: EN이 KO보다 2프레임(0.07초) 길다 - 우연히 거의 같은 길이가 나왔다.
맞추기 위한 배속·무음 조정은 하지 않았다(원칙 4).

## 3. 렌더

```
node scripts/render.mjs general-ep10-self-tickle both
```
`episodes/general-ep10-self-tickle/out/`(절대경로)에만 쓰도록 `render.mjs` 래퍼를 통해 실행
(공용 루트 `shortform/out/`은 다른 화가 병렬 렌더 중이라 건드리지 않음).

**렌더 횟수**: KO 3회, EN 3회.
- v1: `intro_ding.mp3`/`outro_ding.mp3`를 `public/audio/`에 복사하지 않아 404로 실패(렌더 미완료,
  횟수에서 제외).
- v2: 성공. 프레임 검수에서 위 결함 1(포크 위치)을 발견해 좌표 수정 후 재렌더.
- v3: 성공. 프레임 검수에서 위 결함 2(s3 구석 캐릭터 안 보임)를 발견해 코드 수정 후 재렌더.
- v4(최종): 성공. 재검수로 두 결함 모두 해결 확인, 배포.

(내부적으로는 v1 실패/v2/v3/v4가 실제 `render.mjs` 호출 4회였으나, 실패한 v1은 mp4가 안
나왔으므로 "렌더 횟수"에는 성공한 3회만 센다.)

## 4. 검수 (원칙 5 - 관찰 기록, 자체 최종판정 아님)

프레임은 언어별 `sceneStarts`/`sceneFrames` 재계산 결과로 각 구간의 시작 직후·중간 지점 +
SFX 접촉 프레임(s1 포크 30F, s2 포크 10F, s4/s7 스파크 접촉 프레임)을 뽑았다(KO 25장, EN 25장).
최종 렌더(v4) 기준.

- **자막 화면이탈**: KO/EN 전 구간 캡션이 좌우 안전영역 안에 들어옴. EN 최장 문장(s3 "Turns
  out, even an ancient Greek philosopher...")도 wrapCounts 기준 줄바꿈되어 이탈 없음(f010 EN
  확인). 제목 카드 "Why You Can't Tickle Yourself"도 2줄로 안전하게 줄바꿈(f002 EN).
- **장면 전환 캐릭터 잔상**: s6->s7 전환(f018/f019 KO·EN)에서 이전 장면이 옅게 겹쳐 보이는 것은
  SceneSwitcher의 의도된 xfade(6프레임)/fadeIn(8프레임) 동작이고, 전환이 끝난 지점(f020)에서는
  단일 장면만 보임.
- **등장 전 요소 잔상**: s3 카드·라벨·"이야기?" 태그가 전부 `opacity` 트랜지션으로 등장(스케일
  0 방식 아님) - 등장 전 프레임에서 점처럼 남는 요소 없음.
- **라벨 화면 밖 잘림**: KO `예상 못한 손길 = 큰 반응`/`뇌가 미리 계산 = 작은 반응`/`로봇 팔 +
  시간차 = 다시 간지럽다`, EN `Unpredictable touch = big reaction`/`Brain predicts it = tiny
  reaction`/`Robot arm + delay = tickle's back` 전부 안전영역 안(f012~f020 KO/EN)에서 확인,
  잘림 없음. EN이 KO보다 문구가 길지만(특히 s7 라벨) `Label`이 `wrapWidth` 없이 `nowrap`인데도
  화면 폭 안에 들어옴을 실측 확인.
- **요소 겹침**: s3 구석 캐릭터(x~150)와 카드(x=260~840) 사이 겹침 없음(수정 후 f010 KO/EN
  확인). s1·s2·s6·s8 포크 지점(y=950)이 몸통(팔 아래) 위치에 정확히 얹혀 얼굴과 안 겹침(수정
  후 f004·f006·f016·f021 확인).
- **화면 하단 여백**: PlainBg 바닥선을 전신 장면에서 `ACTOR_GROUND`(1300)로 맞춰, 발이 바닥선
  위에 정확히 붙음(f003·f004 등). 다이어그램 장면(s4·s5·s7)은 바닥선 없이 다이어그램+라벨+
  자막으로 화면 중하단까지 채워져 과다 여백 없음.
- **음량**: `loudnorm=print_format=summary` 측정 - KO Input Integrated -13.6 LUFS/True Peak
  -2.3dBTP, EN -16.5 LUFS/-2.5dBTP. 클리핑 없음(0dBTP 미만), 다른 화(ep09 KO -13.7/-2.0,
  EN -16.5/-2.2)와 유사한 수준.
- **SFX 타이밍**: s1 포크(무음 구간, 5.1초 지점) 윈도우에서 `volumedetect` max -8.6dB(주변
  무음 대비 뚜렷한 피크 - ui_tap 재생 확인), s4·s7 스파크 접촉 지점(20.4초·37.6초)에서도
  피크 확인(-2.7dB/-2.3dB, 내레이션과 겹치는 구간이라 완전 분리 측정은 아니지만 에너지 상승
  확인). 효과음 볼륨(`ui_tap` 0.7~0.75, `cold_zing` 0.75)이 내레이션(1.6)보다 낮게 설정돼
  피크가 내레이션을 넘지 않음.
- **자막 스타일**: 공용 `Caption.tsx`/`theme.ts`의 `FS.caption`(50) 그대로 사용, 프로필 커스텀
  없음.
- **언어별 문자열 분기**: KO/EN 프레임을 나란히 대조 - EN 프레임(intro/title/s1~s8/outro 전수)에
  한국어 글자 없음 확인(채널명 "Whymo", "Follow for more", "Next up" 등 전부 영어). KO 프레임에도
  영어 잔존 없음. `strings.ts` 테이블 경유(코드 리뷰로 확인 - `s3EraLabel`/`s3NameLabel`/
  `s3StoryTag`/`s4Label`/`s5Label`/`s7Label` 전부 `STRINGS[locale]`에서만 읽음, 컴포넌트
  하드코딩 없음).
- **캐릭터 윤곽선 대비**: 전 장면이 밝은 `PlainBg` 배경이라 어두운 스트로크(`C.ink`)와 대비
  문제 없음(밤하늘류 어두운 배경 아님, 원칙 5 글로우 검토 대상 아님).

**속설 표시 특별 확인(planner 원칙 1-2)**: s3 라벨이 KO `이야기?`, EN `Story?`로 확정 사실이
아님을 화면에 명시(f010 KO/EN 확인). 목소리도 "궁금해했다는 이야기가 있어요"/"or so the story
goes"로 단정하지 않음(내레이션 대조표 확인).

### 프로필 추가 체크 (general.md 8절)

- 소재: "내가 나를 못 간지럽히는 이유"는 일상 체감형 소재(누구나 자기 손으로 찔러본 경험이
  있다)로 general.md 8절의 "겪어봤지만 검색까진 안 해본 사소한 궁금증" 기준에 부합.
- 어미: 대본 전체가 "~거든요"/"~것 같아요"류 친근한 대화체 유지(내레이션 대조표 확인), 유아어·
  학술 문어체 없음.
- 자막 한 줄 글자수: KO 20자/EN 29자 상한(`wrapCounts` 기본값) 그대로 적용, 별도 프로필
  커스텀 없음.
- 60초 상한: 본편+범퍼 합계 KO 47.2초/EN 47.3초로 상한 안에 여유 있게 들어옴.

## 5. 배포

기술 검증(정적 검사 + 프레임 검수 + 음량/SFX 측정)을 마친 뒤 곧바로 `shorts/`에 반영했다.

- KO: `/home/lee/project/shorts/ko/[10화] 내가 나를 못 간지럽히는 이유.mp4`
  (md5 `70a27d32ddffc6af45694bc6f44f4acf`, out/ 원본과 일치 확인)
- EN: `/home/lee/project/shorts/en/[Ep. 10] Why You Can't Tickle Yourself.mp4`
  (md5 `e300d51461fe910e6d124ffe6d32f27b`, out/ 원본과 일치 확인)

배포 확인 후 `out/`의 mp4(episode-ko.mp4, episode-en.mp4)는 삭제했다(이 화의 out/ 안에서만
삭제, 공용 루트나 다른 화 폴더는 건드리지 않음). `out/frames-ko/`·`out/frames-en/`(각 25장,
검수용)는 유지한다.

**결론이 아니라 관찰 기록**: 위 항목들은 실제로 확인한 사실이며, 최종 사용 가능 여부 판단은
사용자 몫이다.

---

## 6. 수정 사이클 v5 (2026-08-20, 사용자 피드백 - s1 간지럼 모션 강화)

### 피드백 원문

"[10화] 내가 나를 못 간지럽히는 이유 이것도 간지르는 모션이 너무 약한 것 같아 너무 짧기도하고
반대팔로 겨드랑이를 간지럽히는듯한 모션을 1초정도는 준 뒤 어 왜 안간지럽지? 로 가야지"

### 변경 내용 (s1 전용, s2~s8·strings.ts·자산 라이브러리는 무변경)

- `src/scenes.tsx`: `S1Poke`(외부 손 아이콘이 옆구리를 찌르고 바로 웃는 8프레임짜리 접촉 +
  `Shake`+`Sparkles` 리액션 구조)를 `S1Tickle`(캐릭터가 반대팔을 뻗어 스스로 겨드랑이 부근을
  간지럽히려 시도하는 구조)로 전면 교체.
  - 오른팔(`TICKLE_ARM_R = {s:-100, e:-22}`)을 들어 겨드랑이 쪽을 열고, 왼팔
    (`TICKLE_ARM_L = {s:-32.9, e:-53.54}`)을 캐릭터 로컬 viewBox (700,750)까지 뻗는다 -
    `character/Character.tsx`의 `armIK(shoulderL(), {x:700,y:750})`로 역산한 각도(어깨
    (560,647)에서 173.8만큼 뻗으면 닿음, 최대 리치 193.6 이내). 이 화 로컬 상수라 공용
    `character/poses.ts`에는 추가하지 않았다(병렬 작업 중인 다른 화 영향 없음, 원칙 0-원 취지
    준수).
  - 팔꿈치·어깨 각도를 결정적 사인파(`wiggle(f, amp, freq, phase) = sin(f*freq+phase)*amp`,
    Math.random 미사용 - 원칙 3)로 미세 진동시켜 손가락 없는 스틱피겨가 "꼼지락거리며
    간지럽히는" 동작을 표현. 몸통 `lean` 필드도 별도 위상으로 살짝 흔들어 squirm을 더했다.
  - 진동 활성 구간은 로컬 10~90프레임(80프레임 = 2.67초) - "1초 이상" 요구를 크게 상회.
    앞뒤 8프레임씩 `progress()`로 페이드해 뚝 끊기지 않게 했다.
  - 마지막 12프레임(90~102)은 "안 되네" 하고 표정(mouthOpen·eyeOpen)이 살짝 가라앉으며
    s2의 shrug 리액션으로 자연스럽게 이어진다.
  - s1 총 길이를 3.0초 -> 3.4초로 늘렸다(무성 구간, TTS와 무관 - 원칙 4). s2 이후 모든 구간의
    로컬 시작 프레임이 +12씩 밀렸다(자동 계산, 손으로 재계산 안 함 - `sceneFrames`/
    `sceneStarts` 그대로 사용).
- `src/Episode.tsx`: import를 `S1Poke/S1_POKE_FRAME` -> `S1Tickle/S1_TICKLE_START_FRAME`로
  교체, `SILENT_DURATION_S1`을 3.0 -> 3.4로 변경, s1 SFX(ui_tap) 시퀀스가 새 상수를 참조하도록
  수정.
- `02-script-v2.md`·`02-script-final-ko.md`·`02-script-final-en.md`: s1 장면 지시·타임코드를
  실제 구현에 맞게 갱신(위 "v1 -> v2 수정" 절 참고).

**얼굴 겹침 확인(사용자 지시 - 머리 비중이 큰 캐릭터라 상체 좌표를 잘못 잡으면 얼굴과
겹친다)**: 좌표를 코드에 넣기 전에 별도 스크립트로 `armIK`·`handPos`·머리 윤곽 반지름 테이블
(`HEAD_R`)을 그대로 복제해 목표 좌표(700,750)의 팔꿈치·손 위치가 머리 윤곽에서 얼마나
떨어져 있는지(margin) 미리 계산했다 - 팔꿈치 margin 122.9, 손 margin 122.5(둘 다 100 이상
여유). 오른팔 raise 각도도 처음 시도한 |s|=116에서는 팔꿈치가 머리 윤곽 안쪽으로 margin
-0.5만큼 파고드는 것을 계산으로 미리 발견해 |s|=100(margin 28.9)으로 낮췄다. 렌더 후
프레임 검수(KO f002~f009, 로컬 프레임 10/18/32/47/62/77/92/101 대응)에서도 전 프레임에서
팔·손이 얼굴과 겹치지 않음을 육안 확인했다.

### 렌더

```
node scripts/render.mjs general-ep10-self-tickle both
```
1회로 KO/EN 모두 성공(정적 검사 `precheck.mjs` 에러 0 확인 후 렌더, 경고 1건은 `SHAREDOUT`으로
다른 화의 잔여 산출물 - 이 화와 무관, 지우지 않음).

- KO: 1428프레임 = 47.600초(ffprobe 실측, 기존 1416프레임/47.2초에서 +12프레임/+0.4초)
- EN: 1430프레임 = 47.667초(ffprobe 실측, 기존 1418프레임/47.3초에서 +12프레임/+0.4초)
- 두 언어 모두 정확히 +12프레임(s1 길이 증가분)만큼만 늘어났다 - 이후 구간(s2~s8) 길이는
  그대로다(재확인: s2~s8 코드 무변경, 발화 길이도 무변경이므로 당연한 결과).

### 검수 (원칙 5 - 관찰 기록)

- **간지럼 모션 지속 시간**: 로컬 10~90프레임(2.67초) 동안 진동이 이어짐 - "최소 1초"
  요구를 크게 상회. f002(로컬10)·f003(로컬18)·f004(로컬32)·f005(로컬47)·f007(로컬77) 프레임을
  비교한 결과 프레임마다 팔꿈치·어깨 각도가 눈에 띄게 달라져(f002 대비 f003·f004에서 팔뚝
  각도·손 위치가 이동) 반복 움직임이 실제로 보임을 확인. f009(로컬101, 진동 종료 후 정지
  구간)는 안정적으로 정지해 다음 장면 전환을 준비하는 모습.
- **얼굴 겹침**: KO f002~f009 전 구간에서 팔·손이 얼굴 윤곽과 겹치지 않음(위 "변경 내용"
  절의 margin 계산 + 육안 확인). EN f002(로컬10)도 동일 코드라 동일 결과 확인.
- **장면 전환**: s1 마지막 프레임(t001, 로컬101) -> s2 전환 크로스페이드(t002, SceneSwitcher의
  기존 xfade 6프레임) -> s2 안정 프레임(t003, s2의 `hand-finger` 재확인 포즈 + "어 하나도 안
  간지럽네 왜 그런 거지" 자막)까지 확인 - s1의 팔 든 자세에서 s2의 shrug + 손가락 재확인
  동작으로 자연스럽게 이어짐(전환 중 겹침·잔상 없음, 기존에 문서화된 xfade 동작과 동일).
- **SFX 타이밍**: s1 접촉 시작(로컬프레임10 = 절대 133F = 4.433초) 지점 윈도우에서
  `volumedetect` max -8.6dB, 인접 무음 구간(3.9~4.2초, 1.0~1.3초) max -9.2dB로 배경음 대비
  근소한 상승 확인(값 자체는 기존 v4 빌드 때 측정한 -8.6dB와 동일 - ui_tap 볼륨 설정이
  그대로이므로 일관된 결과).
- **음량**: `loudnorm=print_format=summary` - KO Input Integrated -13.6 LUFS/True Peak
  -2.3dBTP(v4와 동일), EN -16.5 LUFS/-2.5dBTP(v4와 동일) - s1만 바뀌고 내레이션 음성 트랙은
  무변경이므로 예상대로 동일.
- **다른 구간 영향 여부**: s2~s8 코드는 이번에 손대지 않았고, s2 전환 프레임(t003)에서 캡션·
  포즈가 정상 렌더됨을 확인 - 회귀 없음.

### 배포 (덮어쓰기)

- KO: `/home/lee/project/shorts/ko/[10화] 내가 나를 못 간지럽히는 이유.mp4`
  (신규 md5 `f866436a0a35cceae2aa480117b3296a`, 기존 `70a27d32ddffc6af45694bc6f44f4acf`에서
  교체, out/ 원본과 일치 확인)
- EN: `/home/lee/project/shorts/en/[Ep. 10] Why You Can't Tickle Yourself.mp4`
  (신규 md5 `3aefccd490835b4c4f46721ccb408c14`, 기존 `e300d51461fe910e6d124ffe6d32f27b`에서
  교체, out/ 원본과 일치 확인)

배포 확인 후 `out/`의 mp4(episode-ko.mp4, episode-en.mp4)는 삭제했다(이 화의 out/ 안에서만
삭제). `out/frames-ko/`·`out/frames-en/`는 이번 검수용 프레임(각 9장 + 전환 확인용 3장)으로
갱신했다.

**결론이 아니라 관찰 기록**: 위 항목들은 실제로 확인한 사실이며, 최종 사용 가능 여부 판단은
사용자 몫이다.
