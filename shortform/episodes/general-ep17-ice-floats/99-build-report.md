# 빌드 리포트 - general-ep17-ice-floats (얼음이 물 위에 뜨는 이유 / Why Ice Floats Instead of Sinking)

## 자산 (공용, 언어 무관)

### 재사용 (기존 라이브러리)
- `backgrounds/PlainBg`, `character/Actor`+`POSES`(`idle`/`cheer`/`thinking`), `scenes/Caption`, `scenes/Label`,
  `props/Symbols`(`QMark`), `props/ThemedIcon`(`fish`, `arrow-down`, `arrow-up`), `scenes/TitleCard`,
  `brand/Intro`/`brand/Outro`, `assets/audio/intro_ding.mp3`/`outro_ding.mp3`(공용 확정본),
  `assets/audio/cold_zing.mp3`(6화 등 기존 리액션 SFX, 이번 화 s6 파이프 동파 크랙에 재사용),
  `assets/audio/ink_splat.mp3`(폐기된 구 프로젝트 산출물이지만 REGISTRY에 "액체가 사물에 정통으로
  맞는 임팩트 전반 재사용 가능"으로 명시돼 있어 s1 얼음 낙하 스플래시에 재사용) - 총 재사용 자산 12종

### 신규 제작 (REGISTRY 승격 - 공용)
- `props/IceFloatCup.tsx` (`IceFloatCup`) - 곧은 원통형 유리잔. `liquidLevel`/`mode`(liquid·ice)/
  `floatCube`(낙하-안착-부양 애니메이션)/`temp`(hot·cold, 김 포함)를 조합해 s1·s4·s5·s8 네 장면을
  전부 커버. clipPath를 쓰지 않아(taper 없는 곧은 몸체 + rect 채움만으로 계산) 화면에 컵 2개를
  동시에 놓아도 안전 - REGISTRY에 등록
- `props/WaterMoleculeLattice.tsx` (`WaterMoleculeLattice`) - "조밀한 액체 배열 -> 육각형 벌집
  얼음 격자"를 분자(점)+육각 고리로 보여주는 범용 다이어그램. `crystallizeProgress` 하나로 전체
  결정 - REGISTRY에 등록(20화 눈송이 소재에서 재사용 가능성 있으나 이번 화 범위에서 억지로
  범용화하지 않았음, 프롬프트 지시대로)

### 신규 제작 (에피소드 로컬, 승격 안 함 - 대본 자산 목록 지시대로)
- `FrozenPipeCrack` (s6 전용) - 파이프에 살얼음이 차오르다 균열이 가는 1회성 장식
- `FrozenLakeCrossSection` (s7 전용) - 호수 단면 + 표면 얼음층 + 헤엄치는 물고기

### 신규 재사용 가능성 판단
- 새로 만든 자산 2종(공용) + 로컬 2종(에피소드 전용) = 총 4종 신규, 재사용 12종

## 렌더 (버전 이력)
- v1: 최초 렌더(ko/en 각 1회) 후 프레임 검수에서 결함 3건 발견(아래 "검수 중 발견해 수정" 참고)
- v2: 결함 수정 후 재렌더(ko/en 각 1회). 최종 배포본
- 언어별 렌더 횟수: ko 2회, en 2회 (총 4회)

## 언어별 실측 길이

### 한국어 (ko)
| 구간 | 로컬 타임코드 | 프레임 | 실측 발화 |
|---|---|---:|---|
| s1(무성) | 0.00-2.20s | 66f | - (고정 2.2s) |
| s2(리액션) | 2.20-7.17s | 149f | 4.368s |
| s3 | 7.17-12.80s | 169f | 5.448s |
| s4 | 12.80-16.47s | 110f | 3.480s |
| s5 | 16.47-22.90s | 193f | 6.240s |
| s6 | 22.90-28.47s | 167f | 5.376s |
| s7 | 28.47-37.33s | 266f | 8.664s |
| s8 | 37.33-47.70s | 311f | 10.152s |

본편 합계 1431f = 47.70s / 전체(Intro+TitleCard+본편+Outro) 1644f = 54.848s

### 영어 (en)
| 구간 | 로컬 타임코드 | 프레임 | 실측 발화 |
|---|---|---:|---|
| s1(무성) | 0.00-2.20s | 66f | - (고정 2.2s) |
| s2(리액션) | 2.20-7.73s | 166f | 4.920s |
| s3 | 7.73-15.00s | 218f | 7.080s |
| s4 | 15.00-19.00s | 120f | 3.792s |
| s5 | 19.00-26.73s | 232f | 7.536s |
| s6 | 26.73-32.47s | 172f | 5.520s |
| s7 | 32.47-43.77s | 339f | 11.088s |
| s8 | 43.77-53.90s | 304f | 9.936s |

본편 합계 1617f = 53.90s / 전체(Intro+TitleCard+본편+Outro) 1830f = 61.056s

### 두 언어 총 길이 차이
- 전체 mp4 기준: en(61.056s) - ko(54.848s) = **+6.208s** (en이 더 김 - 정상. 늘리거나 맞추지 않음)

## 검수 중 발견해 수정한 결함 (v1 -> v2)

1. **[버그] S5(밀도) 화살표 라벨 텍스트 클리핑** - `S5Density`의 "물 - 높음"/"Water - Higher",
   "얼음 - 낮음"/"Ice - Lower" 라벨이 `IceFloatCup`의 컵 바닥 둥근 모서리 경계선과 겹치는
   위치(cy=1140)에 있어, 한글은 자모가 위아래로 쪼개진 것처럼 보이고 영문은 아래쪽이 잘려
   보이는 렌더링 결함이 있었다(원인은 정확히 특정 못 했으나 컵 바닥 경계와의 겹침이 트리거임을
   실측으로 확인). `still` 명령으로 무압축 프레임을 직접 뽑아 재현 확인 후, 라벨 위치를
   컵 바닥(화면 y≈1182) 아래로 완전히 이동(cy=1140 -> 1290)해 겹침 자체를 제거하는 방식으로
   수정. ko/en 모두 재확인해 텍스트가 온전히 나오는 것을 확인
2. **[개선] `WaterMoleculeLattice` 분자 크기가 화면에서 작게 보임** - 고정 viewBox(780)가 실제
   분자 배치의 바운딩박스(390x338)보다 훨씬 커서, 액체 상태(더 촘촘함)는 특히 화면의 절반 이하만
   차지했다. viewBox를 460으로 좁혀 분자가 화면에서 뚜렷하게 커지도록 수정(REGISTRY 설명에 반영)
3. **[개선] `FrozenPipeCrack` 얼음 채움과 파이프 몸체의 색 대비 부족** - 둘 다 저채도 회백색이라
   "얼음이 차오른다"는 진행이 잘 안 보였다. 파이프 몸체를 `C.paper`(흰색), 채움을 `C.water`
   (연한 파랑)로 바꿔 대비를 확보

## 검수 체크리스트 관찰 기록

### 한국어(ko), v2 기준
- [x] **자막 화면이탈**: 전 구간(s1~s8, 인트로~아�웃트로) 프레임 확인. 자막 박스가 좌우 `CAP_SIDE=70` 안전영역 안에 들어오며 화면 밖으로 나가지 않음
- [x] **장면 전환 시 캐릭터 잔상**: s2->s3, s3->s4, s5->s6, s6->s7, s7->s8 전환 경계 프레임(start+3) 확인. SceneSwitcher의 6프레임 크로스페이드 동안 두 장면이 겹쳐 보이는 것은 의도된 크로스페이드이고, 전환이 끝난 뒤(mid 프레임)에는 이전 장면 요소가 전혀 남지 않음을 확인(s3->s4 전환에서 s3의 육각 격자가 옅게 겹친 뒤 s4 컵으로 완전히 대체됨)
- [x] **등장 전 요소가 점처럼 남는 문제**: `PopBox`/`PopText` 헬퍼가 `opacity: Math.min(1,p*2)` + `scale(0.3+0.7*p)`로 동시에 처리해 p=0일 때 완전히 안 그려짐(`if (p<=0.001) return null`) - scale 0 잔상 없음 확인
- [x] **라벨이 화면 밖에서 잘림**: s4/s5 "얼음(부피 더 큼)"(wrapWidth 340)까지 포함해 전부 화면 안. s5 버그(위 1번) 수정 후 재확인 완료
- [x] **요소끼리 겹침**: s5 버그(컵 경계와 라벨 겹침) 수정 완료. 그 외 s8의 얼음 트레이(3칸)와 컵 사이 여백 확인, 겹침 없음
- [x] **화면 하단 여백 과다**: s4/s5/s6/s7/s8 전부 안전영역(SAFE_BOTTOM=520) 안에서 콘텐츠가 화면 중하단까지 채워짐(캡션 박스 + 라벨이 하단부를 채움). s1/s2 캐릭터 장면도 GROUND=1300 기준으로 하단이 비지 않음
- [x] **음량**: `loudnorm=print_format=summary` 측정 - Input Integrated -13.7 LUFS, Input True Peak -1.8 dBTP (클리핑 없음, 상용 숏폼 기준 정상 범위)
- [x] **자막 스타일(프로필 general)**: `FS.caption=50`, 하단 23% 지점(`CAP_BOTTOM=300`), 흰 배경+검은 외곽선, 어절별 강조(coral) - 전 구간 확인
- [x] **언어별 문자열 분기**: ko 프레임 19장을 전수 확인, 영어 문자열이 섞인 곳 없음(en 쪽도 마찬가지로 한국어 미검출)
- [x] **캐릭터 윤곽선-배경 대비**: 배경이 전부 밝은 톤(`PlainBg` 기본값)이라 `C.ink` 스트로크가 명확히 구분됨. 어두운 배경(`C.night`) 미사용

### 영어(en), v2 기준
- [x] **자막 화면이탈**: s7 "Since ice is lighter than water..." 등 긴 문장 포함 전 구간 확인, 좌우 여백 안에서 줄바꿈됨
- [x] **텍스트 오버플로**: s8 최장 라벨 "The Mpemba Effect - Still Debated"(영문 기준 가장 긴 화면 라벨) 확인 - 화면 폭 안에 완전히 들어옴(여백 있음). s5 "Water - Higher"/"Ice - Lower" 버그 수정 후 재확인, 완전히 표시됨
- [x] **장면 전환 잔상**: ko와 동일 패턴 확인(크로스페이드 정상 동작)
- [x] **라벨 잘림**: s4 "Ice (More Volume)"(en이 ko보다 김에도) wrapWidth=340 안에서 자연스럽게 줄바꿈, 잘리지 않음
- [x] **음량**: Input Integrated -16.5 LUFS, Input True Peak -3.0 dBTP (클리핑 없음)
- [x] **채널명 로케일 확인**: 인트로/아웃트로에서 "Whymo" 정상 표시(한국어 "굼구미" 누출 없음), `lang="en"` 정상 전달 확인

### 프로필(general) 추가 체크
- [x] **소재 적합성**: "얼음이 물에 뜨는 이유"는 겪어봤지만 검색까진 안 해본 사소한 궁금증 범주에 부합
- [x] **한 편 사실 개수 1개 원칙**: 핵심 사슬(s3 분자 배열 -> s4 부피 증가 -> s5 밀도/결론)은 하나의 사실이고, s6(수도관 동파)·s7(호수·물고기)은 같은 결론의 다른 실생활 함의, s8(음펨바)은 v1부터 유지된 속설 곁가지 - 대본 확정 시점의 구성을 그대로 구현, 추가 사실 없음

## 원칙 1-2 가드레일(속설 표시) 확인

s8(음펨바 효과) 화면에 아래 요소가 모두 명시적으로 표시됨(ko/en 공통):
- 물음표(`QMark`) 아이콘이 두 컵 위에 팝인
- 화면 라벨 "음펨바 효과 - 아직 논쟁 중" / "The Mpemba Effect - Still Debated" (coral 색상으로 강조)
- 내레이션도 "~라는 얘기가 있어요", "아직도 의견이 갈린대요" / "There's also a claim...", "people still argue about why"로 단정하지 않는 어조 유지

f017/f018(ko), f017/f018(en) 프레임에서 위 3요소가 동시에 화면에 나타나는 것을 직접 확인함.

## 오디오 SFX 검증 (원칙 7)

객관적 측정치만 기록(청취 판단은 하지 않음):
- **s1 스플래시** (`ink_splat.mp3`, 원본 피크 -2.8dB): `silencedetect=noise=-30dB:d=0.1`로 ko/en 공통 확인
  결과 t=5.482s~5.746s(0.264s, ink_splat 실측 길이 0.28s와 근접) 구간에서만 소리가 감지됨 -
  의도한 재생 시점(계산상 t≈5.43s, 애니메이션상 안착 구간과 일치)과 일치. s1 전체가 무성
  구간이라 이 SFX가 유일한 음원임을 이용해 정확히 격리 확인
- **s6 크랙** (`cold_zing.mp3`, 원본 피크 -1.2dB): s6 전체가 내레이션이 깔린 구간이라
  `silencedetect`로 SFX만 격리하지는 못했다(내레이션이 이미 그 구간을 계속 채우고 있음).
  대신 (a) `cold_zing.mp3` 원본 파일 자체가 실제 오디오 신호를 담고 있음을 ffprobe로 재확인,
  (b) 코드상 `<Audio>` Sequence가 `s6CrackFrame(frames[5])`(씬 코드가 export한 상수를 그대로
  사용, 손으로 다시 계산하지 않음)에 정확히 맞춰 배치돼 있음을 재확인 - 완전한 음원 격리 확인은
  아니지만 재생 위치가 코드상 올바름은 확인함
- **효과음 볼륨**: `ink_splat` volume=0.7, `cold_zing` volume=0.8 - 내레이션 트랙 volume=1.6보다
  낮게 설정(보조 요소로 유지)
- **인트로/아웃트로 딩**: 기존 확정 공용 파일(`intro_ding.mp3`/`outro_ding.mp3`) 그대로 사용, 코드
  내장 로직이라 이번 화에서 별도 배치 작업 없음

## 배포

기술적 검증(프레임 관찰 + 오디오 dB/silencedetect + md5)을 통과해 곧바로 배포 완료:
- `/home/lee/project/shorts/ko/[17화] 얼음이 물 위에 뜨는 이유.mp4` (md5 e89713ba575c1fb0325720994a2e7f12)
- `/home/lee/project/shorts/en/[Ep. 17] Why Ice Floats Instead of Sinking.mp4` (md5 40bf424e89c033a528fb0d0f9d31e2bc)

`out/`의 mp4(v1, v2 전부)는 배포 완료 후 삭제함. `out/frames-ko/`, `out/frames-en/`는 검수 기록으로 유지.

## 신규 REGISTRY 등록

- `IceFloatCup` (`assets/props/IceFloatCup.tsx`) - REGISTRY.md 152번째 줄에 등록
- `WaterMoleculeLattice` (`assets/props/WaterMoleculeLattice.tsx`) - REGISTRY.md 153번째 줄에 등록
- `assets/props/index.ts`에 두 컴포넌트 export 추가

---

**보고**: 위 관찰 사실이 이렇게 나왔습니다. 최종 확인 부탁드립니다. (자체 "검수 통과"·"합격" 판정은
이 보고에 포함하지 않았습니다 - 원칙 5)
