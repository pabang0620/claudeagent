# 빌드 리포트 - general-ep11-doorway-forgetting ("방문을 넘으면 방금 생각이 날아가는 이유")

대본 소스: `02-script-v2.md`(v2-2 수정판, s3에서 목소리가 "문지방 효과" 이름을 직접 말하고
화면 텍스트 라벨은 제거한 버전)

## 1. 자산 (공용, 언어 무관 - 1회만 수행)

### REGISTRY 대조 결과

`assets/REGISTRY.md`를 먼저 Read하고 대본의 "자산 목록" 절과 대조했다.

**재사용(공용, 신규 제작 없음)**: `character/Actor` + `POSES.idle/pointUp/shrug/surprised`
(blendPose로 결심->멍함->놀람 전환), `scenes/SpeechBubble`(s1·s2·s5·s8 생각풍선),
`scenes/Effects`의 `Appear`(s3 텍스트 없는 포커스 플래시·s4/s5/s7 라벨 등장·s5/s7 아이콘
팝인)·`Sparkles`(s8), `scenes/Caption`·`Label`, `backgrounds/PlainBg`, `props/ThemedIcon`
(`droplet` s1, `folder`/`book`/`device-gamepad-2`), `scenes/TitleCard`, `brand/Intro`/`Outro`
(intro_ding/outro_ding 내장 사운드 포함).

**아이콘 캐시 추가(신규 SVG 제작 아님, 기존 도구 `scripts/sync_icons.mjs` 재사용)**:
`folder`(REGISTRY 자산 목록 지정)·`device-gamepad-2`(REGISTRY 자산 목록 지정, s7)를
`node scripts/sync_icons.mjs folder device-gamepad-2`로 로컬 캐시에 추가했다(원칙 0 - 인라인
우회 없이 기존 스크립트를 그대로 불렀다). `bacteria`가 기본 목록에 있었지만 소스에 없어
누락 경고가 났는데, 기존에도 미사용 상태였던 항목이라 이번 작업과 무관하다.

**신규 제작(1개, 대본이 지정한 그대로)**:
- `assets/props/DoorFrame.tsx` - 방과 방 사이 문틀(문설주 2개+상인방+문턱) + 경계선 플래시.
  `crossProgress`(0~1) 뾰족한 삼각 envelope로 0.5(문 정중앙)에서 플래시 최고조. 캐릭터가
  실제로 지나가는 움직임은 그리지 않고(HiccupDiagram/CellMergeDiagram과 같은 원칙 - "지금
  이 순간의 상태"만 그림), 호출 씬이 Actor의 centerX를 door의 crossProgress와 같은 progress
  값으로 움직여 "문 앞에 실제로 섰을 때 플래시가 터진다"를 자동으로 맞춘다. s2·s4(클로즈업,
  1.3배 확대 래퍼)·s6(연속 2회, 소형 두 짝)·s7(모니터 프레임 안 재사용)까지 추가 props 없이
  그대로 재사용했다. REGISTRY 소품 절에 등록 완료(`props/index.ts`도 갱신).
- s7의 "모니터 프레임"은 대본 지시대로 단순 사각 테두리(얇은 stroke 사각형)라 별도 컴포넌트로
  등록하지 않고 에피소드 로컬 스타일로 처리했다(REGISTRY 규칙 2, ep06 "도시 불빛 오버레이"와
  같은 원칙).

**신규 SFX 없음**: 대본 자산 목록에 새 효과음 지정이 없었고(`audio/realize_ding`은 "재사용
가능하나 필수 아님"으로만 명시), 문을 넘는 순간은 화면(경계선 플래시)+캐릭터 리액션 대사로
이미 명확히 읽혀서 추가하지 않았다.

전부 `node scripts/precheck.mjs episodes/general-ep11-doorway-forgetting` 에러 0/경고 0
확인(1회).

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|
| s1(무성) | 3.000 | 90 |
| s2(리액션+훅) | 4.584 | 156(+0.6s 특수 pad, s2->s3 전환) |
| s3 | 4.800 | 150 |
| s4 | 5.472 | 170 |
| s5 | 6.408 | 198 |
| s6 | 5.400 | 168 |
| s7 | 5.448 | 169 |
| s8 | 4.680 | 146 |
| **본편 합계** | 36.792s(발화) | **1247프레임 = 41.567초** |
| **mp4 전체**(인트로69+제목카드54+본편1247+아웃트로90) | | **1460프레임 = 48.667초(ffprobe 실측)** |

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz)

| 구간 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|
| s1(무성) | 3.000 | 90 |
| s2 | 4.464 | 152 |
| s3 | 4.872 | 152 |
| s4 | 5.832 | 181 |
| s5 | 6.600 | 204 |
| s6 | 5.064 | 158 |
| s7 | 5.112 | 159 |
| s8 | 5.664 | 176 |
| **본편 합계** | 37.608s(발화) | **1272프레임 = 42.400초** |
| **mp4 전체** | | **1485프레임 = 49.500초(ffprobe 실측)** |

**언어 간 차이**: EN이 KO보다 25프레임(0.833초) 더 길다. s3(콜론 뒤 이름을 덧붙이는 영어식
어순)·s4·s5·s7에서 영어 문장이 조금씩 더 길게 나온 것이 누적됐다. 어느 쪽도 늘리거나 줄이지
않고 실측 그대로 냈다.

## 3. 렌더

```
cd /home/lee/project/.claude/shortform
node scripts/render.mjs general-ep11-doorway-forgetting both
```
출력 경로는 `episodes/general-ep11-doorway-forgetting/out/` 로 래퍼가 고정한다(병렬 렌더 중
공용 루트 오염 방지, 2026-08-20 8화 사고 이후 표준 절차). 언어별 각 1회 렌더로 결함 없이
완료됐다(재렌더 없음) - ko 1460프레임/en 1485프레임, ffprobe duration이 sceneFrames 계산과
정확히 일치함을 확인.

precheck 경고 1건(`SHAREDOUT`)은 공용 루트 `shortform/out/`에 다른 화(타 세션)의
`frames-en/`·`frames-ko/`가 남아있다는 경고였다 - 타임스탬프 확인 결과 이 화가 만든 것이
아니었고(내 렌더 시작 전부터 존재), 지시사항대로 손대지 않았다.

## 4. 검수 (관찰 기록, 언어별로 각각)

`sceneStarts`/`sceneFrames` 실측 결과로 각 언어의 구간별 시작+중간 프레임을 계산해
`out/frames-ko/`·`out/frames-en/`(19장씩)와 라벨/스냅 확인용 `out/frames-ko-extra/`·
`out/frames-en-extra/`(6장씩)를 새로 뽑아(ffmpeg 실행 직후 `ls -la`로 타임스탬프 갱신 확인)
직접 Read로 확인했다.

### 한국어

- [x] **자막 화면이탈**: f001~f019, g001~g006 전체 확인. 모든 구간에서 자막이 좌우 여백을
  두고 화면 안에 들어옴. 가장 긴 s5 자막도 CAP_SIDE 안쪽에서 줄바꿈됨.
- [x] **장면 전환 잔상**: f005(s1->s2 전환, start+2)에서 SceneSwitcher 크로스페이드로 두
  캐릭터가 겹쳐 보이는 것을 확인 - 이는 xfade=6프레임 크로스페이드의 정상 동작이지 결함이
  아니다(6프레임 이후 f006에서 완전히 s2 단독 상태로 전환됨을 확인).
- [x] **등장 전 요소 잔상**: s5의 book 아이콘·s7의 gamepad 아이콘 모두 `Appear`(opacity 0
  시작)로 처리되어 등장 전 프레임에 점 형태로 남지 않음을 g002·g005에서 확인.
- [x] **라벨 화면 밖 잘림**: s4 라벨(g001, "문 = 생각이 정리되는 경계")·s5 라벨(g002, "이전
  생각 보관됨")·s7 라벨(g005, "가상의 방에서도 똑같이") 모두 wrapWidth=920 안에서 1줄로
  들어가고 화면 중앙 정렬, 잘림 없음.
- [x] **요소 겹침**: f006(s2 문 중앙 통과 플래시)에서 캐릭터·문틀·플래시선이 자연스럽게
  겹치는 의도된 구도이고 텍스트·아이콘과의 원치 않는 겹침은 없음을 확인. f010(s4 클로즈업)에서
  folder 아이콘이 문틀 상단 안쪽에 자연스럽게 배치되고 캐릭터·라벨과 겹치지 않음을 확인.
- [x] **하단 여백 과다 여부**: f004(s1), f006(s2), f019(outro) 등에서 캐릭터가 화면
  중앙~하단까지 채우고 있음을 확인. 세로 하단에 큰 빈 공간 없음.
- [x] **음량**: `loudnorm=print_format=summary` 측정 결과 Input Integrated -13.7 LUFS /
  True Peak -2.1 dBTP. 클리핑 없고 이전 화들과 유사한 범위.
- [x] **자막 스타일**: 흰 배경 검은 텍스트+검은 테두리, `FS.caption`(50px) 그대로 적용됨을
  전 프레임에서 확인.
- [x] **화면 문자열 언어 분기**: ko 프레임에 한국어만, 별도로 en 프레임과 나란히 대조해
  영어가 섞이지 않음을 확인(4절 "언어 대조" 참고).
- [x] **캐릭터 윤곽선 대비**: 전 장면이 밝은 톤 배경(`C.sky`/`C.room`)이라 `C.ink` 스트로크가
  배경과 충분히 구분됨을 확인. 어두운 배경(`C.night` 계열)을 쓰는 장면 없음.
- [x] **s3 화면에 이름 텍스트 없음(이번 화 특이사항)**: f007·f008·g003 확인 결과 s3 화면에
  "문지방 효과" 텍스트가 어디에도 없다 - 자막(내레이션 자동 캡션)에만 목소리가 말한 대로
  등장하고, 화면 전용 Label 컴포넌트는 s3에서 아예 호출되지 않는다(darken 오버레이 + 골드
  글로우 버스트만 `Appear`로 렌더). 대본 지시(v2-2 수정)와 일치.

### 영어

- [x] **자막 화면이탈**: f001~f019, g001~g006 전체 확인. 영어 자막이 한국어보다 길어지는
  구간(s4 라벨 "Doorway = where thoughts get filed away" 등)에서도 wrapCounts(29자 상한)로
  자동 줄바꿈되어 화면 안에 들어옴 - g001에서 라벨이 2줄로 접히지만 좌우 여백 안에 있음을 확인.
- [x] **장면 전환 잔상**: ko와 동일 구조라 같은 크로스페이드 동작(정상) 확인.
- [x] **등장 전 요소 잔상**: ko와 동일 컴포넌트라 동일하게 확인.
- [x] **라벨 화면 밖 잘림**: g001("Doorway = where thoughts get filed away", 2줄)·g002("Old
  thought: filed away")·g005("Even in a virtual room") 전부 화면 안에 들어옴, 잘림 없음.
- [x] **요소 겹침**: f006·f010 상당 프레임에서 ko와 동일하게 겹침 문제 없음 확인.
- [x] **하단 여백 과다 여부**: ko와 동일 레이아웃, 문제 없음.
- [x] **음량**: Input Integrated -16.6 LUFS / True Peak -3.6 dBTP. 클리핑 없음.
- [x] **자막 스타일**: ko와 동일 스타일 적용됨.
- [x] **화면 문자열 언어 분기(직전 화 결함 재발 여부 집중 확인)**: en 프레임 19장+extra 6장
  전부 확인 결과 한국어 글자가 한 글자도 섞이지 않음. 채널명도 f001에서 "Whymo"로 정확히
  나옴("lang" prop 누락으로 한국어 채널명이 새는 결함 없음).
- [x] **캐릭터 윤곽선 대비**: ko와 동일.
- [x] **s3 화면에 이름 텍스트 없음**: f007·f008·g003 확인 결과 "the doorway effect" 텍스트가
  화면 어디에도 없음(자막에만 등장). 대본 지시와 일치.

### 프로필(general) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 방에 들어가서 뭐 하려 했는지
  잊는 경험은 실측 캡션 전 구간에서 확인한 대로 일상 체감 기반 소재.
- [x] 어미가 친근한 대화체("~거든요", "~것 같아요")를 유지 - 대본 문장 자체를 그대로 썼고
  builder는 수정하지 않았다(하지 않는 것 원칙).
- [x] 전문용어("사건 경계"류)는 여전히 쉬운 말로 풀렸는가 - "생각을 새 칸에 정리한다"로
  대본이 이미 풀어썼고 화면 라벨도 같은 쉬운 표현("문 = 생각이 정리되는 경계")을 씀.
- [x] 자막 한 줄 상한(ko 20자/en 29자) - `wrapCounts` 기본값을 그대로 썼고, 위 자막이탈 항목
  확인에서 초과 사례 없음.
- [x] 60초 상한 - 본편만 ko 41.6초/en 42.4초, 전체(인트로+제목카드+아웃트로 포함)도
  48.7초/49.5초로 60초 미만.

## 5. 산출물

- `episodes/general-ep11-doorway-forgetting/out/frames-ko/`, `out/frames-ko-extra/`,
  `out/frames-en/`, `out/frames-en-extra/` - 검수용 프레임(유지)
- 최종 mp4는 배포 완료 후 `out/`에서 삭제(아래 6절)

## 6. 배포

기술 검증(4절) 통과 후 곧바로 배포, md5 일치 확인 후 `out/`의 mp4 삭제 완료.

| 언어 | 배포 경로 | md5 |
|---|---|---|
| ko | `/home/lee/project/shorts/ko/[11화] 방문을 넘으면 방금 생각이 날아가는 이유.mp4` | `8bd3e672d94f6b1620a1638e6cd0eff0` |
| en | `/home/lee/project/shorts/en/[Ep. 11] Why You Forget Why You Walked Into a Room.mp4` | `e1a201fac9ca4efc1f39f875294d336f` |

`episodes/general-ep11-doorway-forgetting/out/episode-ko.mp4`·`episode-en.mp4` 삭제 완료
(md5 일치 확인 후, frames-*는 유지).

이 보고는 기술적 관찰 기록이다. "검수 통과"·"합격" 같은 최종 판정은 이 에이전트의 권한이
아니며, 위 관찰 내용을 바탕으로 사용자가 최종 확인해주기를 요청한다.
