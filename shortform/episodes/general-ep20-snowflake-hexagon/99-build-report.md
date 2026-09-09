# 빌드 리포트 - general-ep20-snowflake-hexagon (눈송이가 육각형인 이유 / Why Every Snowflake Has Six Sides)

## 1. 자산 재사용 판단 (원칙 0)

### WaterMoleculeLattice 재사용 여부와 판단 근거 (지시 필수 항목)

**재사용했다.** `assets/props/WaterMoleculeLattice.tsx`(general-ep17이 만든 컴포넌트, `crystallizeProgress`
0~1로 "빽빽한 액체 배열 -> 육각형으로 성기게 벌어진 고체 결정 격자"를 분자(점)+육각 고리(결합선)로
보여주는 순수 함수 컴포넌트)를 s3("눈이 얼음으로 바뀔 때 물 분자들이 정해진 각도로만 이어 붙어서,
육각형 모양의 결정 구조가 만들어져요")에 그대로 가져다 썼다. `crystallizeProgress`를 0->1로
애니메이션했을 뿐 새 props도, 새 파라미터도 추가하지 않았다.

판단 근거: 이 화의 s3가 요구하는 시각 요소("작은 원(물 분자)들이 정해진 각도로 서로 붙으며
육각형 벌집 구조를 이루는 정지+형성 애니메이션")와 WaterMoleculeLattice의 설계 목적("분자가
정해진 각도로 이어 붙어 육각형 결정 격자를 이루는 과정")이 완전히 동일했다. 액체 상태(촘촘한
점 배열)에서 얼음 상태(육각 벌집 격자)로 진행되는 그 자체가 곧 s3의 요구사항이라, props를
확장할 필요조차 없이 그대로 재사용했다.

**재사용하지 않고 새로 만든 부분**: s4(가지가 6방향으로 뻗어나가는 타임랩스 성장), s5/s6/s8(완성된
눈송이 실루엣, variant가 다른 눈송이)는 분자 격자와는 전혀 다른 스케일·형태(점·고리가 아니라
중심에서 뻗어나가는 나뭇가지형 선)라 WaterMoleculeLattice로 표현할 수 없었다. 그래서
`assets/props/SnowflakeDiagram.tsx`(`SnowflakeGrowth`, `SnowflakeIcon`)를 새로 만들어
REGISTRY.md에 등록했다(151~155행 근처, props/index.ts에도 배럴 등록). 6방향 대칭은 "가지 하나"를
만들고 60도씩 회전 복제하는 순수 함수 방식이고, `variant`(0 표준/1 뾰족/2 넓적)로 s6·s8이 요구하는
"같은 육각형 틀 안에서도 가지 모양이 다른 눈송이"를 결정적으로(Math.random 미사용) 만든다.

### 그 외 재사용 자산 (전부 REGISTRY 기존 항목, 신규 등록 없음)

- `character/Actor`(`BustActor`), `character/poses`(`idle`, `surprised`) - s2 리액션, s5 idle 복귀
- `scenes/Caption` - 자막 전체
- `scenes/Card` - s7 카드(원형 뱃지 + 카메라 아이콘)
- `backgrounds/PlainBg` - 전 장면 배경
- `props/ThemedIcon`(`camera`, `thermometer`, `droplet`) - `camera`는 캐시에 없어
  `node scripts/sync_icons.mjs camera`로 동기화(REGISTRY 규칙 7). `thermometer`/`droplet`은
  이미 캐시에 있었다
- `assets/audio/realize_ding.mp3` - s1의 "발견의 순간"(눈송이 실루엣이 드러나는 줌인 완료 시점)
  효과음으로 재사용(원칙 0, 신규 합성 없음. ep06/ep11/ep12와 같은 용도)
- `assets/audio/intro_ding.mp3`, `outro_ding.mp3` - 인트로/아웃트로 고정 효과음
- `FontLoader`, `theme.ts`, `timeline.ts`, `anim.ts` - 공용 유틸

### 신규 제작 및 REGISTRY 등록 (공용 승격)

- `assets/props/SnowflakeDiagram.tsx` (`SnowflakeGrowth`, `SnowflakeIcon`, `SnowflakeVariant`) -
  위 판단 근거 참고. REGISTRY.md 155행에 등록, `assets/props/index.ts` 배럴에도 등록.
  "중심에서 여러 방향으로 대칭 성장하는" 다른 소재(결정 성장, 방사형 균열 등) 전반 재사용
  가능성을 명시했다.
- `assets/props/tabler-cache.json`에 `camera` 아이콘 추가(1개, 순수 추가라 기존 항목에 영향 없음)

## 2. 언어별 실측 길이 (원칙 4)

### 한국어 (voice=ko-KR-SunHiNeural, rate+20%/pitch+30Hz, s2만 +32%/+55Hz 리액션 부스트)

| 구간 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|
| s1(무성) | 2.000 | 60 |
| s2(리액션) | 4.680 | 158 (pad 0.6s, s2->s3 전환 확장) |
| s3 | 6.792 | 210 |
| s4 | 5.304 | 165 |
| s5 | 5.880 | 182 |
| s6 | 4.728 | 148 |
| s7 | 4.632 | 145 |
| s8 | 4.872 | 152 |

본편 합계: 40.67s (1220 프레임). 전체(인트로 69 + 제목카드 54 + 본편 1220 + 아웃트로 90) = 1433 프레임 = 47.77s.
ffprobe 실측 mp4: nb_frames=1433, 1080x1920, 30fps.

### 영어 (voice=en-US-AnaNeural, rate+20%/pitch+15Hz, s2만 +30%/+35Hz 리액션 부스트)

| 구간 | 길이(초, TTS 실측) | 프레임(+pad) |
|---|---|---|
| s1(무성) | 2.000 | 60 |
| s2(리액션) | 4.464 | 152 (pad 0.6s, s2->s3 전환 확장) |
| s3 | 7.296 | 225 |
| s4 | 6.288 | 195 |
| s5 | 7.032 | 217 |
| s6 | 5.688 | 177 |
| s7 | 6.312 | 195 |
| s8 | 4.872 | 152 |

본편 합계: 45.77s (1373 프레임). 전체(69+54+1373+90) = 1586 프레임 = 52.87s.
ffprobe 실측 mp4: nb_frames=1586, 1080x1920, 30fps.

### 두 언어 총 길이 차이

en이 ko보다 153프레임(약 5.1초) 더 길다. s3(물 분자 결정 구조 설명)·s5(결론)·s7(역사)에서 영어
문장이 한국어보다 상당히 길어(예: s7 "In fact, a man named Wilson Bentley became the first
person to photograph a snowflake up close." vs "실제로 윌슨 벤틀리라는 사람이 눈송이를 처음
사진으로 남겼어요.") 발화 시간이 늘어난 것이 주 원인이다. 원칙 4에 따라 이 차이를 맞추려고
무음을 채우거나 배속을 조정하지 않았다.

## 3. 렌더 횟수

- ko: 2회 (1차 렌더 후 s6 옆 실루엣 화면 밖 clipping + s8 안내박스/자막 겹침 결함 발견 -> 코드
  수정 후 재렌더)
- en: 2회 (동일 결함이 공용 씬 컴포넌트에서 왔으므로 ko와 함께 재렌더)

## 4. precheck.mjs 결과

에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `shortform/out/`에 다른 화의 `frames-en/`·`frames-ko/`가
보임. 이 화가 만든 파일이 아니며, 병렬 작업 중인 다른 화 소유로 판단해 건드리지 않았다).

## 5. 검수 체크리스트 (언어별 관찰 기록)

### 한국어 (out/frames-ko/, 1차+2차 렌더 각각에서 프레임 추출해 확인)

- [x] **자막 화면이탈**: s1~s8 전 구간 시작/중간 프레임(f001~f019, 총 19장) 확인. 모든 자막이
  좌우 여백을 두고 화면 안에 들어옴. "육각형 결정 구조" 라벨(en "Six-sided crystal structure",
  27자)도 CAP_SIDE 안전영역 안에서 줄바꿈 없이 한 줄로 들어감.
- [x] **장면 전환 캐릭터 잔상**: SceneSwitcher 기본 크로스페이드(6프레임) 사용, s2(캐릭터 등장)
  시작 직후 프레임(f005, 190프레임=s2 start+7)에서 이전 장면(s1, 캐릭터 없음) 요소가 남아있지
  않음을 확인.
- [x] **등장 전 요소가 점처럼 남는 문제**: `SnowflakeGrowth`/`SnowflakeIcon`은 opacity 기반
  팝인(스케일+opacity를 한 div에 결합, `PopIn`과 동일 원칙)이라 scale-0 잔점 없음. s4 시작+7
  프레임(f009)에서 성장 전 중심 육각 장식만 옅게 보이고 가지는 안 보임(정상 - growProgress≈0.02).
- [x] **라벨 화면 밖 잘림**: s7 "1885년" 원형 뱃지(YearBadge, 크기 156, 폰트 38) - f016(1118프레임)
  에서 5글자(1,8,8,5,년)가 원 안에 완전히 들어감, 삐져나옴 없음.
- [x] **요소 겹침 (1차 렌더에서 결함 발견 -> 수정)**: s6에서 옆 실루엣 2개(variant 1/2)가 화면
  좌우 경계 밖으로 잘려 나가는 것을 f014(972프레임)에서 발견 - `S6_SIDE_SIZE` 420->380,
  오프셋 420->300으로 축소해 좌우 여백 50px 이상 확보 후 재렌더, out/frames-ko/f001.png(972프레임)
  에서 두 실루엣 모두 화면 안에 완전히 들어옴을 재확인.
  s8에서 안내 박스("얘기가 있어요: ...")와 자막 박스가 겹쳐 안내 문구가 가려지는 결함을
  f018(구버전 1267프레임)에서 발견 - `S8_NOTICE_Y` 1440->1120으로 위로 올려 재렌더,
  out/frames-ko/f003.png(1231프레임)에서 두 박스가 겹치지 않고 분리됨을 재확인.
- [x] **하단 여백 과다**: s1(무성) 낙하 눈송이 확대 장면, s3~s8 다이어그램 전부 화면 폭 720~900px
  대의 큰 그래픽을 중상단~중하단에 배치하고 캐릭터(s2/s5)는 화면 대부분을 채우는 크기(780/480)로
  둬 하단 안전영역 안에서 콘텐츠가 충분히 참.
- [x] **음량**: `ffmpeg loudnorm` 측정 Input Integrated -13.6 LUFS / Input True Peak -2.1 dBTP
  (클리핑 없음, 0dBTP 미만).
- [x] **효과음 타이밍**: realize_ding.mp3(s1 눈송이 실루엣 확대 완료 시점) - astats로 확인 결과
  reveal 프레임 직전(5.0~5.4s) 무음(-inf dB), reveal 윈도우(5.55~5.95s, 프레임171=starts[0]+48)
  peak -33.4dB로 에너지 상승 확인. 내레이션 구간(s2, 7.0~7.4s) peak -6.6dB보다 뚜렷이 작아
  원칙 7("내레이션보다 작게") 충족.
- [x] **자막 스타일**: `CAPTION_STYLE`(흰 배경/검정 테두리) 그대로, 프로필 general 규칙(하단 위
  23%, 폰트 50px, 20자 줄바꿈) 준수 - 커스텀 스타일 미적용.
- [x] **화면 언어 분리**: ko 프레임 19장 전수 확인, 영어 문자·로마자 섞임 없음.
- [x] **캐릭터 윤곽선 대비**: 배경이 전부 밝은 `PlainBg`(하늘색~흰색)라 어두운 배경 위 스트로크
  묻힘 문제 해당 없음.

### 영어 (out/frames-en/, out/frames-en2/에서 프레임 추출해 확인)

- [x] **자막 화면이탈**: intro/title/s1~s8/outro 전 구간 확인(16+3장). 가장 긴 영어 자막
  "Six-sided crystal structure"(f006, 447프레임)와 s8 안내 박스 "They say: no two snowflakes
  are alike?"(out/frames-en/f003.png, 1420프레임)도 줄바꿈 없이 한 줄로 박스 안에 들어감(각각
  최대폭 950px 이내).
- [x] **장면 전환 잔상**: s2 시작+7(f003, 190프레임)에서 s1 요소 잔상 없음.
- [x] **등장 전 요소 잔점**: s4 시작+7(f007, 567프레임)에서 중심 장식만 옅게, 가지 없음(정상).
- [x] **라벨 잘림**: s7 "1885" 뱃지(4자리, out/frames-en3/f002.png, 1173프레임) - 원 안에 여유
  있게 들어감(한국어의 "1885년"보다 짧아 더 여유로움).
- [x] **요소 겹침 (ko와 동일 결함 -> 동일 수정으로 해결)**: s6 옆 실루엣 잘림(out/frames-en/f001.png,
  1060프레임 재검증 - 두 실루엣 모두 화면 안), s8 안내박스/자막 겹침(out/frames-en/f003.png,
  1420프레임 재검증 - 분리됨) 모두 ko와 같은 공용 씬 컴포넌트 수정으로 함께 해결됨을 확인.
- [x] **하단 여백**: ko와 동일 레이아웃(언어 무관 좌표) - 과다 여백 없음.
- [x] **음량**: Input Integrated -16.8 LUFS / Input True Peak -3.0 dBTP (클리핑 없음).
- [x] **효과음 타이밍**: s1 무성 구간 길이·realize_ding 배치 프레임이 ko와 동일(언어 무관 고정
  길이, starts[0]=123 공용) - 별도 재확인 불필요하나 코드상 동일 상수(`S1_REVEAL_FRAME=48`) 사용
  확인.
- [x] **자막 스타일**: ko와 동일 공용 스타일.
- [x] **화면 언어 분리**: en 프레임 19장 전수 확인 - "Whymo"/"Follow for more"/"Next up" 등 전부
  영어, 한국어 글자 섞임 없음. 인트로 로고(원형 스파클) 자체는 언어 무관 그래픽이라 텍스트 없음.
- [x] **캐릭터 윤곽선 대비**: ko와 동일(밝은 배경).

### 프로필(general) 추가 체크

- [x] 소재: "눈송이가 왜 육각형인지"는 겨울철 누구나 봤지만 검색까진 안 해본 사소한 궁금증에
  해당 - 프로필 취지에 부합.
- [x] 어미: "~만들어져요", "~뻗어나가요", "~거예요" 등 친근한 대화체 유지, 유아어·학술 문어체 없음.
- [x] 전문용어("결정 구조")는 s3에서 시각 자료(육각 격자)와 함께 등장해 그 자리에서 바로 의미가
  드러남(대본 v2가 "뼈대"->"결정 구조"로 교체하며 이미 반영).
- [x] 자막 한 줄 20자(ko)/29자(en) 상한: `wrapCounts(locale)` 그대로 사용, 별도 커스텀 없음 -
  실측 프레임에서도 상한 위반 없음.
- [x] 60초 상한: ko 47.77s / en 52.87s 모두 상한 이내.

## 6. 산출물

- ko: `/home/lee/project/shorts/ko/[20화] 눈송이가 육각형인 이유.mp4` (md5 e9e695af26698a6e597b12cc674f3d9a)
- en: `/home/lee/project/shorts/en/[Ep. 20] Why Every Snowflake Has Six Sides.mp4` (md5 689018cc9bb19fdd18de83da1e1f695b)
- `out/` 안의 mp4는 배포 확인(md5 일치) 후 삭제 완료. `out/frames-ko/`, `out/frames-en/`은 최종
  검수에 쓰인 프레임 일부를 보존.

이렇게 나왔습니다. 확인해주세요 - 특히 s6 옆 실루엣 위치·s8 안내박스 위치를 한 번 더 재수정한
버전이라, 실제 배포된 mp4가 의도한 레이아웃인지 직접 봐주시면 좋겠습니다.
