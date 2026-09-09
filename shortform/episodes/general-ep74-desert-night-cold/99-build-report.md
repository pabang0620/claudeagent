# 빌드 리포트 - general-ep74-desert-night-cold (사막이 낮엔 뜨겁고 밤엔 추운 이유)

한국어판만 제작(오케스트레이터 명시 지시 - 영어 채널 Whymo 운영 중단, 2026-09-02). 73화
(`general-ep73-hoarse-voice`)와 동시 작업 중이라 그 폴더는 건드리지 않았고, `assets/REGISTRY.md`·
`assets/props/index.ts`·`assets/backgrounds/index.ts`는 기존 줄을 보존한 채 파일 끝에만 추가했다.
`episodes/README.md`도 건드리지 않았다.

## 1. 자산

### 기존 라이브러리 재사용 검토 (오케스트레이터 지시)

- `general-ep66-fog`의 `FogLayerDiagram` - "뿌연 면 + 큰 물결선 2~3가닥" 안개 표현 레시피를
  참고해 `HeatBlanketDiagram`의 수증기 band에 그대로 계승했다(점을 뿌리지 않는 원칙 포함).
  다만 FogLayerDiagram 자체는 "지표 바로 위에 낮게 깔리는 안개"가 목적이라 이 화의 "하늘
  전체를 가로지르는 담요층 + 그 층을 뚫고 오가는 열 화살표" 구조와는 레이아웃이 근본적으로
  달라 재사용하지 못하고 새로 만들었다(오케스트레이터가 예상한 대로).
- `general-ep53-window-condensation`의 `WindowPane` - 실내/실외 온도 대비 구도를 참고했으나,
  이 화는 "온도차"가 아니라 "보온층의 유무"가 핵심이라 구조가 다르다.
- `general-ep63-chocolate-melt`의 `ThermoScale` - 세로 온도계에 여러 지점(낮/밤)을 놓고 브래킷으로
  차이를 보여주는 용도가 s6와 정확히 일치해 **그대로 재사용**했다(신규 제작 없음).

### 재사용
- `assets/brand/Intro.tsx`(`INTRO_FRAMES=69`), `assets/scenes/TitleCard.tsx`(`TITLE_CARD_FRAMES=54`),
  `assets/brand/Outro.tsx`(`OUTRO_FRAMES=90`) - 표준 인트로/제목카드/아웃트로
- `assets/backgrounds/PlainBg.tsx` - s2~s7 배경(위/아래 그라데이션)
- `assets/scenes/Caption.tsx`의 `Caption`/`Label` - 자막·화면 라벨
- `assets/scenes/Counter.tsx`의 `CountUp` - s4/s5 온도 숫자 상승/하강
- `assets/scenes/CompareBars.tsx` - s7 사막 vs 습한 지역 일교차 비교 막대
- `assets/props/ThermoScale.tsx` - s6 낮/밤 온도 비교 온도계 (신규 제작 없이 그대로 재사용)
- `assets/audio/intro_ding.mp3`, `assets/audio/outro_ding.mp3` - 인트로·아웃트로 효과음(공용 확정 자산)
- `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`), `assets/props/ThemedIcon.tsx`
  (`sun`/`moon` 아이콘) - 타이밍 유틸·아이콘

### 신규 제작 (REGISTRY.md에 추록 등록 완료, `assets/props/index.ts`·`assets/backgrounds/index.ts`에 export 추가)

- `assets/backgrounds/DesertBg.tsx` - 사막 배경. `night`(boolean)로 낮(밝은 하늘+해)/밤(어두운
  하늘+별+달)을 전환하되, 모래언덕 실루엣 경로(`DUNE_NEAR_D`/`DUNE_FAR_D`)는 낮·밤 공용 1개만
  써서 "같은 장소의 다른 시간"으로 보이게 했다. s1의 좌우 스플릿 훅샷에서 이 컴포넌트를 두 번
  (night=false/true) 겹쳐 CSS `clipPath`로 반씩 잘라 쓴다.
- `assets/props/HeatBlanketDiagram.tsx` - 이 화 핵심 다이어그램. 대기 단면에서 하늘 중간을 가로지르는
  수증기 "담요" 층을 그린다. `blanketProgress`(정상/습한 상태 - 뿌연 면+되돌아오는 곡선 화살표),
  `dryProgress`(사막/건조 상태 - 같은 자리를 점선 윤곽선+배지로 "비어있음" 표시), `dayHeatIn`/
  `nightHeatOut`(각 0~1, 그 빈 자리를 뚫고 땅<->하늘로 오가는 굵은 화살표 3개 + 땅 색 온도 변화)을
  독립 진행도로 받는다. "보온층의 유무가 지표 열의 출입을 좌우한다"는 구조를 갖는 다른 기상 소재
  전반 재사용 가능성을 명시해 등록했다.

두 자산 모두 REGISTRY.md "추록" 절(파일 끝, 동시 편집 충돌 방지용 절)에 등록 완료
(`| DesertBg | ... |`, `| HeatBlanketDiagram | ... |`).

## 2. 실측 길이 (한국어, 전체는 `02-script-final-ko.md` 참고)

| 구간 | 실측(초) |
|---|---|
| s1 | 4.032 |
| s2 | 6.528 |
| s3 | 4.536 |
| s4 | 4.608 |
| s5 | 7.272 |
| s6 | 5.304 |
| s7 | 6.696 |
| **내레이션 합계** | **38.976** |

전체 mp4 길이(인트로+제목카드+본편+아웃트로): **47.53초**(ffprobe 실측, 1424프레임 @ 30fps,
`nb_frames=1424`/`duration=47.530667`). 대본 추정 약 53초보다 짧게 나왔으나 원칙 4에 따라 늘리지
않았다.

## 3. 방향 검증 (이 화의 핵심 리스크 - 오케스트레이터 지시)

**s4/s5 화살표 방향**: `HeatBlanketDiagram`의 SVG `<marker orient="auto">`를 처음에 "지역좌표에서부터
아래/위를 가리키는 모양"으로 그렸다가, 스틸 선점검에서 화살촉이 옆으로 눕는 결함을 발견했다
(`orient="auto"`는 marker를 path 접선각만큼 "추가로" 회전시키므로, 지역좌표 자체는 항상 오른쪽을
가리키는 기본형이어야 한다 - 코드 주석에 원인을 남겼다). 세 marker(`heatDownArrow`/`heatUpArrow`/
`heatBackArrow`) 모두 오른쪽을 가리키는 삼각형으로 통일해 고친 뒤, s4(`s4_peak.png`, 태양 화살표
3개가 하늘에서 모래로 아래 방향으로 꽂힘)와 s5(`s5_peak.png`, 같은 화살표가 땅에서 하늘로 위
방향으로 빠져나감)를 나란히 재확인해 방향이 반대임을 확인했다 - 55화 밀물/썰물 사고(정지 프레임
각각은 그럴듯해 보여 방향이 뒤집힌 걸 놓친 사례)를 의식해 두 장을 나란히 놓고 봤다.

**s6 온도계**: `ThermoScale`의 `posT`(0=아래/차가움, 1=위/뜨거움) 규약에 맞춰 밤(-2°C)을
`posT=0.06`(아래), 낮(43°C)을 `posT=0.94`(위)로 배치했다. `s6_peak.png`에서 온도계 위쪽에
"낮 43°C"(코랄), 아래쪽에 "밤 -2°C"(파랑)가 정확히 배치됨을 확인했다.

**s1 좌우 스플릿**: `DesertBg`가 낮/밤 공용으로 같은 언덕 경로를 그리므로, 화면 중앙(clip 경계)에서
언덕 능선이 좌우로 어긋나지 않고 이어지는지 `s1_mid.png`에서 확인했다 - 이어짐을 확인.

## 4. 스틸 선점검(`npx remotion still`)에서 잡은 결함 (렌더 전)

1차로 12장(s1_mid, s2/s3/s4/s5/s7의 start+peak, s6_peak)을 뽑아 아래 3건을 발견하고 코드를
고친 뒤 관련 프레임을 재확인했다.

1. **s1 해(sun) 아이콘이 아예 안 보임**: `DesertBg`의 해 아이콘을 x=760(화면 오른쪽 절반)에
   뒀는데, s1에서 낮 인스턴스는 `clipPath: 'inset(0 50% 0 0)'`로 왼쪽 절반(x:0~540)만 남기고
   오른쪽을 잘라내므로 해가 통째로 잘려나가 안 보였다. 왼쪽 절반 안(x=300)으로 옮겨 해결했다.
2. **s1 "밤" 라벨과 달 아이콘 겹침**: 달 아이콘 중심(x=800,y=240)과 "밤" 라벨(x=800,y=220)이
   같은 자리에 겹쳐 "밤"이라는 두 글자와 초승달이 뭉개져 보였다. 달 아이콘을 y=380으로
   내려 라벨과 세로로 분리했다(해 아이콘도 대칭으로 y=380 이동).
3. **화살표 방향 결함**: 위 3절 참고. `orient="auto"` marker 회전 원리를 잘못 적용해 화살촉이
   옆으로 누워 있었다.

추가로 렌더 전 육안 판단으로(스틸 없이) s2~s5 다이어그램 폭을 820 -> 920, y를 380 -> 460으로
키우고 s7의 두 다이어그램(420 -> 460)·CompareBars(pxPerUnit 11 -> 13, rowGap 110 -> 140, thickness
44 -> 50)도 함께 키워, "화면 아래쪽 여백 과다"(21화 이후 반복 결함 B절 - 10회 발생, 가장 잦음)를
예방적으로 완화했다 - 다이어그램 하단이 y~1018 -> y~1176(s2~s5), y~950 -> y~1147대(s7)까지
내려와 72화 수정 후 기준(y=1000~1300대)과 비슷한 수준으로 채워졌다.

수정 후 영향받은 프레임(s1_mid, s2_peak, s3_peak, s4_start/peak, s5_start/peak, s7_start/peak)을
전부 다시 뽑아 재확인했다.

## 5. 렌더 후에야 발견한 결함

없음. 최종 mp4에서 새로 추출한 전환 경계 프레임(s1->s2 크로스페이드, s5->s6, s6->s7 전환) 확인
결과 스틸에서 못 보던 결함은 나오지 않았다 - 아래 6절 참고.

## 6. 검수 체크리스트 (관찰 기록)

- **자막 화면이탈**: `wrapByChars`(20자 상한) 계산 결과 가장 긴 줄은 s5 "열이 담요 없이 그대로
  하늘로 빠르게"(20자 이내)였고, `s5_start.png`·f001~f008(최종 mp4에서 새로 추출한 8프레임) 전체
  확인 결과 모든 자막이 좌우 여백을 두고 박스 안에 들어옴.
- **장면 전환 시 잔상**: 이 화는 캐릭터(Actor)를 쓰지 않는 3인칭 설명 전용 화라 캐릭터 잔상은
  해당 없음(63·66 s2~s7·72와 동일 유형). 최종 mp4에서 s1->s2 경계(프레임 247/253, `f001.png`/
  `f002.png`)를 확인한 결과 표준 6프레임 크로스페이드로 자연스럽게 겹쳐 보임 - 다른 화와 동일한
  정도.
- **등장 전 요소가 점처럼 남음**: `HeatBlanketDiagram`은 모든 레이어를 `progress > 0.02`일 때만
  그리는 방식(`{blanketT > 0.02 ? ... : null}` 등)이라 scale 0 잔점 문제 없음. `s4_start.png`(f=10,
  dayHeatIn=0.067 미만이라 화살표 미표시)에서 화살표가 점으로 남아있지 않음을 확인.
- **라벨이 화면 밖에서 잘림**: s2~s7의 모든 상단 라벨("열을 붙잡음", "수증기 거의 없음",
  "태양열이 그대로 들어옴", "열이 그대로 빠져나감")과 s6의 "낮 43°C"/"밤 -2°C"/"낮밤 기온 차이",
  s7의 "사막"/"습한 지역" 라벨 전부 화면 안에 완전히 들어옴(전체 스틸+최종 프레임 확인).
- **요소끼리 겹침**: 4절의 s1 해/달-라벨 겹침을 스틸 단계에서 발견해 수정. 재확인 결과(`s1_mid.png`)
  겹침 없음.
- **화면 아래쪽 여백 과다**: 4절에서 스틸 단계에 발견해 다이어그램·비교막대 크기를 확대. 재렌더
  후 s2~s5(`_peak.png`)·s7(`_peak.png`)에서 콘텐츠가 화면 중앙~하단부(대략 y=1150~1300대)까지
  채워짐을 확인. s6(ThermoScale, y=420~1250대)과 s1(스플릿 배경샷)은 원래도 세로 전체를 채우는
  구도라 해당 없음.
- **음량**: ffmpeg loudnorm 측정 결과 Input Integrated -13.7 LUFS, Input True Peak -2.2 dBTP -
  72화(-13.7 LUFS)와 동일 수준으로 너무 작지 않음.
- **자막 스타일**: `assets/theme.ts`의 `CAPTION_STYLE`/프로필 기본값(흰 글자+검은 외곽선, 하단
  23% 지점) 그대로 사용. s5만 어두운 밤 배경이라 `Caption dark` prop을 명시적으로 켰다(다른 구간은
  기본 light).
- **영어판 로케일 누출**: 해당 없음(한국어판만 제작). `precheck.mjs`의 `KO-STR` 규칙도 에러 0.
- **캐릭터 윤곽선 대비**: 이 화는 3인칭 설명 장면(s2~s7)에 캐릭터를 쓰지 않는다. TitleCard의
  기본 캐릭터만 밝은 배경 위에 그려져(대비 문제 없음). s5(어두운 밤 배경) 라벨·CountUp 텍스트는
  밝은 색(C.cream/C.waterCool)으로 이미 지정되어 어두운 배경과 명확히 구분됨을 `s5_peak.png`에서
  확인.

이 화는 프로필이 general(공통)이라 별도 "프로필별 추가 체크" 절이 없다.

## 7. 렌더 횟수

- 스틸(`npx remotion still`) 선점검: 1차 12장 + 수정 후 재확인 8장 = 총 20장, 렌더(video) 아님
- 전체 영상 렌더: **1회** (`node scripts/render.mjs general-ep74-desert-night-cold ko`) - 스틸
  단계에서 결함(해 아이콘 누락, 라벨 겹침, 화살표 방향, 여백 과다)을 전부 렌더 전에 잡아
  렌더는 한 번으로 끝냈다.

## 8. 배포

- 기술 점검(원칙 5) 통과 확인 후 즉시 배포 완료.
- 배포 경로: `/home/lee/project/shorts/ko/[74화] 사막이 낮엔 뜨겁고 밤엔 추운 이유.mp4`
  (md5 `77ee25d09f02f48d955b2e035f579ef7` - `out/episode-ko.mp4`와 일치 확인 후 `out/`의 mp4는
  삭제, `out/frames-ko/`·`out/stills/`는 보존)
