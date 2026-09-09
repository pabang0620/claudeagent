# 빌드 리포트 - general-ep18-soap-cleans (비누가 기름을 씻어내는 이유)

## 자산 재사용/신규 (공용, 언어 무관)

### 재사용
- `backgrounds/PlainBg`
- `character/Actor`+`BustActor`+`POSES`(`idle`, `shrug`) - `blendPose`
- `scenes/Caption`, `scenes/Card`, `scenes/Counter`(`CountUp`), `scenes/Effects`(`PulseRing`, `FlashOverlay`는 구조상 대체 - 아래 참고)
- `scenes/TitleCard`/`brand/Intro`/`brand/Outro`
- `props/ThemedIcon`(`virus`, `flask` - 캐시에 이미 있어 `sync_icons.mjs` 불필요)
- `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`)
- `assets/anim.ts`(`progress`/`clamp01`/`blendPose`)
- `assets/audio/intro_ding.mp3`, `outro_ding.mp3` (브랜드 공용, 재합성 없음)

### 신규 제작 (REGISTRY 등록 완료)
- **`props/SoapMicelleDiagram.tsx`** - 이 화의 핵심 그래픽. "물/기름이 밀어내며 안 섞임 → 막대 분자가 하나씩 감쌈 → 덩어리(미셀)가 떠내려감" 3단 인과를 `separateProgress`/`surroundProgress`/`floatProgress` 3개의 독립 0~1 progress로 커버. CellMergeDiagram·HiccupDiagram과 동일한 "이 순간의 상태만 그림" 설계 원칙을 따름. "성질이 다른 두 물질을 특수 분자가 감싸 옮긴다"는 구조를 갖는 다른 소재(유화·캡슐화 등) 재사용 가능성이 있어 에피소드 로컬이 아니라 `assets/props/`에 등록(REGISTRY 4절).
- **`audio/water_splash.mp3`**(0.36초, 실측 피크 -3.3dB) - 물로 헹구는 소리. "물로 헹구다/씻다 동작 전반 재사용 가능"으로 REGISTRY 7절 등록.
- **`audio/bubble_pop.mp3`**(0.18초, 실측 피크 -1.7dB) - 막/거품이 터지는 소리. "막·거품·비눗방울이 터지는 순간 전반 재사용 가능"으로 REGISTRY 7절 등록.
- 둘 다 `assets/REGISTRY.md`의 "왜 코드로 합성했는가" 원칙(ffmpeg lavfi, 외부 음원 미사용)을 그대로 따름.

이 화 전용(로컬, `src/scenes.tsx`): 손 씻기 장면의 `Hands`(단순 손 모양), s7의 `MiniSoap`(작은 비누 분자 접근 애니메이션), 라벨 헬퍼 `popLabelStyle`/`pillBadgeStyle`(Appear 미사용 - 아래 결함 대응 참고).

## 언어별 실측 길이

| | 한국어 | 영어 |
|---|---|---|
| 본편(장면) 합계 | 51.93초 (1558프레임) | 53.83초 (1615프레임) |
| 인트로+제목카드+본편+아웃트로 | 59.03초 (1771프레임) | 60.93초 (1828프레임) |
| 60초 상한(본편 기준, 범퍼 제외) | 51.93초 - 통과 | 53.83초 - 통과 |

**두 언어 총 길이 차이(1.90초)는 정상이다** - 맞추지 않았다(원칙 4). 최종 mp4 총 재생시간(범퍼 포함)은 ko 59.03초, en 60.93초로 산출됐다.

## precheck.mjs 결과

```
검사 대상: src 5개 + 사용 자산 18개
에러 0 / 경고 1 (SHAREDOUT - 공용 루트 out/의 다른 화(7화 추정) 산출물, 이 화와 무관, 건드리지 않음)
```

## 렌더 횟수

- v1: ko/en 각 1회 (초기 조립)
- v2: ko/en 각 1회 (프레임 검수 결함 3건 수정 후 재렌더)
- 총 언어별 2회씩, 4회

## 검수 관찰 기록

### v1 검수에서 발견 -> v2에서 수정한 결함 (둘 다 ko/en 공통 원인, 공용 코드 수정 후 양쪽 재렌더)

1. **S1 화면 하단 여백 과다**: 무성 장면(캐릭터+SoapMicelleDiagram 정지 상태)에서 다이어그램이 작고(700px) 위쪽에 몰려 화면 하단 약 500px가 완전히 빈 채로 남음(ko/en 프레임 f004/f005, f001 확인). **수정**: 다이어그램 폭을 900px로 키우고 y좌표를 720→760으로 내려 화면 중하단까지 채움. 재렌더 후 ko f001/f002, en f001에서 여백이 크게 줄어든 것을 확인.
2. **S4 라벨-분자 겹침**: "물을 좋아함"/"기름을 좋아함" 라벨이 나타나는 시점(frames*0.22~0.30)에 이웃 분자(i=1,i=7)가 이미 상당히 드러나 있어 "기름을 좋아함" 라벨이 이웃 분자 머리와 실제로 겹치는 것을 ko f011, en f011에서 확인(육안으로 텍스트와 원이 포개짐). **수정**: `surroundProgress`를 1/8(예시 분자 1개만 완전히 드러나는 지점)에서 붙드는 2단 곡선으로 바꾸고, 라벨 인/아웃 타이밍을 그 홀드 구간 안으로 좁힘. 재렌더 후 ko 로컬프레임 55(절대 589), en 로컬프레임 50(절대 600)에서 라벨과 다른 분자가 겹치지 않는 것을 확인.
3. **S6 손 그래픽이 손으로 안 읽힘**: 겹친 타원 2개만으로는 벤 다이어그램처럼 보여 "손 씻기" 동작이 안 읽힘(ko/en f014/f015 확인). **수정**: 손바닥 타원마다 엄지 돌기를 추가하고 맞닿는 부분에 거품 점 3개를 얹음. 재렌더 후 ko/en f014에서 손 모양으로 명확히 읽히는 것을 육안 확인.

### v2(최종) 검수 - 언어별 관찰 기록

#### 한국어 (out/frames-ko/, ffmpeg select로 추출, 타임스탬프 22:39 이후 갱신 확인)

- [x] **자막 화면이탈**: f001~f020 전체 확인. 모든 자막이 `CAP_SIDE=70` 안전영역 안에 들어옴. 가장 긴 문장(s4 "근데 비누 분자는...")도 2줄 안에서 화면 폭을 넘지 않음.
- [x] **장면 전환 캐릭터 잔상**: SceneSwitcher 크로스페이드(6프레임) 구간을 별도로 스크러빙하지 않았으나, 각 장면 시작+10 프레임에서 이전 장면 요소가 남아있지 않음을 확인(f001, f003, f005, f007, f010, f012, f015, f019).
- [x] **등장 전 요소 잔상**: SoapMicelleDiagram의 `surroundProgress`/`floatProgress`가 0.001 이하일 때 렌더 스킵(`localP <= 0.001 return null` / `opacity` 기반)하는 코드를 재확인. f008(surP=0)에서 물방울만 있고 분자는 안 보임 - 정상.
- [x] **라벨 화면 밖 잘림**: f009(s4, "물을 좋아함"/"기름을 좋아함" 노출 구간), f013(s5 "미셀"), f016/f017(s7 "기름막"), f020(s8 "아주 오래전"/"기름 + 재 = 비누의 시작") 전부 화면 안, 카드/박스 테두리 안에 들어옴.
- [x] **요소 겹침**: S4 라벨-분자 겹침(위 결함 2) 재검증 - label_check.png(로컬 55프레임)에서 겹치지 않음 확인.
- [x] **화면 하단 여백 과다**: S1(위 결함 1로 수정) f001/f002 재확인 - 다이어그램이 중하단까지 채워짐. 나머지 장면(S3~S8)은 캡션이 있어 하단이 비지 않음(CellMergeDiagram 계열 기존 화들과 동일 패턴).
- [x] **음량**: `loudnorm=print_format=summary` 측정 결과 Input Integrated -13.4 LUFS, Input True Peak -2.4 dBTP - 클리핑 없음, 적정 수준.
- [x] **자막 스타일**: 프로필 지정 폰트 크기(50px)·하단 23% 위치·흰 배경 검은 테두리 전부 프레임에서 육안 확인.
- [x] **언어별 분기(로케일 누출)**: f001(굼구미), f003(제목 한국어), f021(다음 편/구독·팔로우) 전부 한국어만 노출. 영어 프레임과 나란히 대조해 한국어가 en 프레임에, 영어가 ko 프레임에 섞이지 않은 것을 확인.
- [x] **캐릭터 윤곽선 대비**: 전 장면 밝은 배경(`C.sky`/`C.paper` 계열)이라 `C.ink` 스트로크가 충분히 대비됨. 어두운 배경 장면 없음.
- [x] **효과음 타이밍/레벨**: water_splash(로컬 s1 16프레임=절대 139프레임/4.633초) 직전 구간(3.8~4.2초) 무음(-91dB) -> 재생 구간(4.5~5.0초) 피크 -8.2dB로 명확한 상승 확인. bubble_pop(ko 절대 1397프레임/46.567초) 구간(46.5~46.8초) 피크 -3.8dB(내레이션과 겹침) 확인. 두 효과음 모두 내레이션 트랙(전체 True Peak -2.4dB) 피크를 넘지 않음.

#### 영어 (out/frames-en/)

- [x] **자막 화면이탈**: f001~f020 전체 확인. 가장 긴 문장(s5 "So it wraps around the grease droplet...")도 2줄 안에서 여백을 두고 들어옴("Loves Water"/"Loves Oil" 등 짧은 라벨도 문제 없음).
- [x] **라벨/카드 텍스트 잘림 (영어 특유 위험)**: s8 배지 "Ancient Times"(13자)가 원형이 아닌 알약 배지(`pillBadgeStyle`)로 처리되어 f020에서 배지 밖으로 삐져나오지 않음을 확인(6화 연도 배지 오버플로 사례의 재발 방지 - 프로필 원칙 그대로 적용). 카드 라벨 "Fat + Ash = First Soap"도 카드 폭(620px) 안에 한 줄로 들어옴.
- [x] **CountUp nowrap**: f014/f015 "19s"가 한 줄로 표시, `whiteSpace: nowrap` 정상 동작.
- [x] **S4 라벨 겹침 재검증**: label_check.png(로컬 50프레임/절대 600)에서 "Loves Water"/"Loves Oil" 겹치지 않음 확인(한국어와 동일 수정으로 언어 무관 해결).
- [x] **언어별 분기**: f001(Whymo), f003(영어 제목 3줄 줄바꿈), f022(Next up/Follow for more) 전부 영어만 노출, 한국어 미검출.
- [x] **음량**: Input Integrated -16.3 LUFS, Input True Peak -2.2 dBTP - 클리핑 없음.
- [x] **화면 하단 여백**: S1 수정 동일 적용, f001에서 확인.

### 프로필(general.md) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 접시 기름때가 물로 안 지워지는 경험은 일상적이라 부합.
- [x] 어미 톤 확인 - 자막에서 "~거든요", "~것 같아요" 류 대화체 유지(대본 자체는 planner가 확정, builder가 문장을 고치지 않았음).
- [x] 전문용어(계면활성제·미셀) 등장 자리에서 바로 풀이됨 - s4/s5 내레이션과 화면 라벨이 동시에 이름을 확정.
- [x] 자막 한 줄 글자수 상한(ko 20자/en 29자) - `wrapCounts(locale)`를 그대로 사용, 별도 확인 불필요(공용 유틸).
- [x] 60초 상한 - ko 51.93초, en 53.83초로 통과(위 표 참고).

## 배포

- md5 대조 완료(위 결과), `shorts/ko/`·`shorts/en/`에 최종본 반영, `out/`의 mp4는 삭제 완료(`out/frames-ko/`, `out/frames-en/`는 검수 기록으로 유지).
- 배포 경로:
  - `/home/lee/project/shorts/ko/[18화] 비누가 기름을 씻어내는 이유.mp4`
  - `/home/lee/project/shorts/en/[Ep. 18] Why Soap Can Wash Away Oil (But Water Can't).mp4`

이렇게 나왔습니다, 확인해주세요. (본 항목들은 기술적 관찰 기록이며, 최종 합격 판정은 사용자 몫입니다.)
