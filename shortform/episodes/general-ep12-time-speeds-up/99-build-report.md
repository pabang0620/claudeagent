# 빌드 리포트 - general-ep12-time-speeds-up ("나이 들수록 시간이 빨리 가는 이유")

대본 소스: `02-script-v2.md`

## 1. 자산 (공용, 언어 무관)

### REGISTRY 대조 결과

**재사용(전부)**: `character/Actor`+`BustActor` + `POSES.cheer`(s1)·`POSES.thinking`(s2·s3·s4 전환)·
`POSES.idle`(s4·s5·s7)·`POSES.shrug`(s6), `scenes/CompareBars`(s1 막대 1개, s4~s6 막대 1~3개로
확장 사용 - 컴포넌트 자체는 무변경, `items` 배열의 `at`만 화면별로 다르게 줘서 5살 막대가 s4에서
자라고 s5에서 20살·50살 막대가 더해지고 s6에서 세 막대가 정지 컷으로 남게 했다), `scenes/Counter`의
`StepCounter`(s2 달력 페이지 빠른 넘김), `scenes/SpeechBubble`(s7, 원형+달력 아이콘),
`props/ThemedIcon`(`calendar` s2·s7, `history` s3 - 아래 참고), `scenes/Effects`의 `Appear`(s3
아이콘 등장, s7 말풍선 등장)·`Sparkles`(s7), `scenes/Caption`·`Label`, `backgrounds/PlainBg`,
`scenes/TitleCard`, `brand/Intro`·`Outro`, 효과음 `audio/realize_ding.mp3`(s2 자각 시점,
REGISTRY에 "재사용 가능"으로 이미 등록됨) + `intro_ding.mp3`/`outro_ding.mp3`(브랜드 표준).

**아이콘 캐시 갱신(신규 제작 아님, 코드 변경 없음)**: `history` 아이콘이 로컬 tabler 캐시에
없어 `node scripts/sync_icons.mjs history`로 추가했다(`scripts/icons.txt`에도 영구 등재해
다음 화부터는 재실행 없이 바로 쓸 수 있다). `ThemedIcon` 컴포넌트 자체는 무변경 - 대본 자산
목록이 예고한 그대로("렌더 전 sync_icons.mjs history 확인 필요") 처리했다.

**신규 제작**: 없음. 대본 자산 목록의 예상("CompareBars·ThemedIcon만으로 커버, 신규 컴포넌트
불필요")대로 기존 컴포넌트만으로 s1~s7을 전부 구현했다. REGISTRY 신규 등록 없음.

**정적 검사**: `node scripts/precheck.mjs episodes/general-ep12-time-speeds-up` - 에러 0 /
경고 1(`SHAREDOUT`, 공용 루트 `shortform/out/`에 다른 화의 프레임이 남아있다는 경고 - 이 화와
무관, 손대지 않았다).

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 내용 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|---|
| s1 | 5살 여름방학 | 4.176 | 131 |
| s2(리액션+훅) | "어, 벌써 한 해가..." | 4.200 | 144(+0.6s 특수 pad, s2→s3 훅 전환) |
| s3 | 100년 넘은 이론 | 8.040 | 247 |
| s4 | 뇌의 비교 방식 | 5.616 | 174 |
| s5 | 5/20/50살 격차 | 5.520 | 172 |
| s6 | 결론 | 5.184 | 162 |
| s7 | 참신함 이야기 | 5.616 | 174 |
| 본편 합계 | | 38.352 | 1204 |
| 전체(인트로69+제목카드54+본편+아웃트로90) | | | 1417프레임 = 47.233초(ffprobe 47.296s) |

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz 리액션 부스트)

| 구간 | 내용 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|---|
| s1 | Age 5 summer | 3.696 | 117 |
| s2(리액션+훅) | "Whoa, another year's..." | 4.896 | 165(+0.6s 특수 pad) |
| s3 | Century-old theory | 8.304 | 255 |
| s4 | Brain comparison | 5.112 | 159 |
| s5 | 5/20/50 gap | 4.968 | 155 |
| s6 | Conclusion | 4.896 | 153 |
| s7 | Novelty story | 6.264 | 194 |
| 본편 합계 | | 38.136 | 1198 |
| 전체 | | | 1411프레임 = 47.033초(ffprobe 47.083s) |

**두 언어 길이 차이**: EN이 KO보다 6프레임(0.2초) 짧다. s1(-14f)·s4(-15f)·s5(-17f)·s6(-9f)는 EN이
짧고, s2(+21f)·s3(+8f)·s7(+20f)는 EN이 길다 - 문장별로 방향이 갈렸고 상쇄되어 총 길이는 거의
같게 나왔다. 맞추기 위한 배속·무음 조정은 하지 않았다(원칙 4). 60초 상한 안에 여유 있게 들어온다.

## 3. 렌더

`node scripts/render.mjs general-ep12-time-speeds-up both`로 렌더(KO 1회, EN 1회, 재렌더 없이
1차 결과가 검수를 통과함 - 단, intro_ding.mp3 등 브랜드 효과음 3종을 이 화의 `public/audio/`에
복사하지 않아 첫 KO 렌더가 404로 실패했고, 복사 후 재시도한 것이 실질적 최초 성공 렌더다).

출력: `out/episode-ko.mp4`(1417프레임, 1080x1920), `out/episode-en.mp4`(1411프레임, 1080x1920).
`ffprobe` 프레임 수가 `sceneFrames`/`sceneStarts` 계산값과 정확히 일치함을 확인했다.

## 4. 검수 (원칙 5 - 관찰 기록, 자체 최종판정 아님)

프레임은 언어별 `sceneStarts`/`sceneFrames` 재계산 결과로 인트로·제목카드·s1~s7·아웃트로 각
시작+중간 지점을 뽑았다(총 17장×2언어). 재렌더 시 프레임 폴더를 비우고 새로 뽑았으며,
`ls -la` 타임스탬프로 이번 렌더 직후 갱신됐음을 확인했다.

- **자막 화면이탈**: KO/EN 전 구간(f01~f17) 확인 - 좌우 안전영역 안에 들어옴. EN 가장 긴
  s3(21단어) 캡션도 wrapCounts 기준 줄바꿈되어 이탈 없음.
- **장면 전환 캐릭터 잔상**: s1→s2, s2→s3, s3→s4, s4→s5, s5→s6, s6→s7 경계 프레임(f03/f07/f09/f11/f13/f15)에서
  전환 시점엔 SceneSwitcher의 xfade(6프레임) 특성상 나가는 장면이 여전히 우세하게 보이는
  것을 확인했다(예: f07=s3 시작 프레임인데도 s2의 달력·리액션 포즈가 보임 - xfade 구간이
  6프레임이고 s2 duration 144프레임 경계와 겹쳐 outA≈1이라 정상 동작, ep09 build report의
  동일 현상과 일치). 각 구간의 "중간" 프레임(f04/f06/f08/f10/f12/f14/f16)에서는 전환이 끝나
  단일 장면만 보임 - 잔상 없음.
- **등장 전 요소 잔상**: s1 라벨·s3 라벨·s7 태그가 전부 `opacity` 진행값으로 등장(scale 0 방식
  아님) - 등장 전 프레임에서 점처럼 남는 요소 없음.
- **라벨 화면 밖 잘림**: KO `100년 넘은 이론`/`5살: 20%`/`20살: 5%`/`50살: 2%`/`새로운 경험 →
  길게 느껴짐?`/`이야기?`, EN `A theory over 100 years old`/`Age 5: 20%`/`Age 20: 5%`/
  `Age 50: 2%`/`New experiences -> feels longer?`(2줄 wrap)/`Story?` 전부 안전영역 안에서
  확인, 잘림 없음. s1의 서술형 라벨(`5살: 1년 = 인생의 20%`/`Age 5: 1 year = 20% of your life`)도
  `Label`의 `wrapWidth=860`으로 감싸 두 언어 모두 한 줄에 들어옴(EN이 더 길어질 걸 대비해
  CompareBars 내장 라벨이 아니라 별도 `Label`+`wrapWidth`로 분리한 설계가 의도대로 동작).
- **요소 겹침**: s4~s6에서 CompareBars(막대 3줄, x170 기준)와 캐릭터(s4/s5 centerX=800,
  s6 centerX=540)가 좌표상 겹치지 않도록 사전 계산했고(막대 최대 폭 대비 캐릭터 시작 x가
  항상 크게 유지), 실제 프레임(f10/f11/f12/f13/f14)에서도 겹침이 관찰되지 않았다. s2의 달력
  아이콘이 캐릭터 머리 바로 위에 얹힌 형태로 보이는데(f05~f06), 이는 얼굴·눈·입을 가리지
  않는 장식적 배치이고 텍스트·수치를 가리는 결함은 아니다 - 이 배치가 의도한 만큼 마음에
  드는지는 사용자 판단을 요청한다.
- **화면 하단 여백**: PlainBg GROUND(y=1250, 전체 1920 대비 약 65%)를 기준으로 전 구간 콘텐츠가
  중앙~하단까지 채워짐, 하단 과다 여백 없음.
- **음량**: `loudnorm=print_format=summary` - KO Input Integrated -13.6 LUFS/True Peak -2.1dBTP,
  EN -16.5 LUFS/-3.2dBTP. 클리핑 없음(0dBTP 미만).
- **자막 스타일**: 공용 `Caption.tsx`/`theme.ts`의 `FS.caption`(50) 그대로, 프로필 커스텀 없음.
- **언어별 문자열 분기**: KO/EN 프레임 전수(intro/title/s1~s7/outro) 대조 - EN 프레임에 한국어
  글자 없음(채널명 "Whymo", "Follow for more", "Next up" 전부 영어로 정상 출력). KO 프레임에도
  영어 잔존 없음.
- **캐릭터 윤곽선 대비**: 전 장면이 밝은 PlainBg(s3만 옅은 세피아 필터)라 어두운 스트로크(C.ink)와
  배경의 대비 문제 없음(밤하늘류 어두운 배경 아님, 원칙 5 글로우 검토 대상 아님).
- **s7 "이야기?" 태그 표시(원칙 1-2)**: KO `이야기?`/EN `Story?` 배지가 코랄 배경+잉크 테두리로
  뚜렷하게 표시되고, "새로운 경험이 많았던 해는... 이야기도 있어요"라는 내레이션 헤지와 함께
  확정된 사실처럼 보이지 않게 처리됨을 확인했다(f16 KO/EN).

### 프로필 추가 체크 (general.md 8절)

- 소재: "나이 들수록 시간이 빨리 가는 이유"는 겪어봤을 일상 체감(다섯 살 여름방학 vs 지금)에서
  출발 - 순수 백과사전형 지식으로 흐르지 않음.
- 어미: 대본 원문 그대로 "~거든요"/"~것 같아요"류 대화체 유지(builder는 대본 문장을 고치지
  않음, 확인만).
- 전문용어: 이 화는 "뇌"만 언급하고 낯선 전문용어를 쓰지 않는다 - 대본 v2 4절에서 이미 점검됨.
- 자막 글자수 상한(ko 20자/en 29자, `wrapCounts` 기본값): 전 구간 준수 확인(위 자막 화면이탈
  항목과 동일 프레임에서 확인).
- 60초 상한: KO 47.30초 / EN 47.08초로 여유 있게 통과.

## 5. 배포

기술 검증(정적 검사 + 프레임 검수 + 음량 측정)을 마친 뒤 곧바로 `shorts/`에 반영했다.

- KO: `/home/lee/project/shorts/ko/[12화] 나이 들수록 시간이 빨리 가는 이유.mp4`
  (md5 `98447fa02d4910609b9d7d92d5e7ffb2`, out/ 원본과 일치 확인)
- EN: `/home/lee/project/shorts/en/[Ep. 12] Why Time Speeds Up As You Get Older.mp4`
  (md5 `ff2d8abc9bbaec340a62bf2e76c9efd9`, out/ 원본과 일치 확인)

배포 확인 후 이 화의 `out/`에 있던 mp4(episode-ko.mp4, episode-en.mp4)만 삭제했다(다른 화가
공유하는 공용 루트 `shortform/out/`은 건드리지 않았다). `out/frames-ko/`·`out/frames-en/`(각 17장,
검수용)는 유지한다.

**결론이 아니라 관찰 기록**: 위 항목들은 실제로 확인한 사실이며, 최종 사용 가능 여부 판단은
사용자 몫이다. 특히 s2의 달력 아이콘이 캐릭터 머리 위에 얹힌 배치는 결함은 아니지만 의도한
연출인지 확인을 요청한다.
