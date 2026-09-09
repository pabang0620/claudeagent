# 45화 빌드 리포트 - 처음 온 곳인데 와본 것 같은 이유 (데자뷔)

**언어**: 한국어만 (영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시 - 원칙 4 이중언어 기본값의 명시적 예외)

## 자산 요약

### 재사용 (공용 라이브러리, REGISTRY.md 대조 후 그대로 사용)
- `character/Actor`, `character/BustActor`, `POSES.idle`, `POSES.thinking` - s1(전신 걸음), s3(바스트샷 thinking)
- `props/DoorFrame` - s1 아치문(문설주+상인방+플래시). `crossProgress`를 절반 스케일로 넘겨 캐릭터가 문 정중앙에 도착하는 순간(moveT=1)에 플래시가 최고조가 되도록 씬에서 조합
- `props/HeadNerveDiagram`(+ `FOREHEAD_PT` export) - s6 이마 하이라이트+bolt 아이콘 펄스를 그대로 재사용(새 얼굴/전극 다이어그램을 만들지 않음)
- `scenes/Effects`의 `RadialSpikes` - s6 전극 접촉 스파크
- `scenes/CompareBars` - s7 연령대별 상대적 빈도 막대(수치 텍스트 없이 길이·색만)
- `props/Symbols`의 `QMark`, `props/ThemedIcon` - s3 물음표, s2 "repeat" 아이콘
- `scenes/PopIn`, `scenes/Caption`(Label 포함), `backgrounds/PlainBg` - 전 장면 공통
- `brand/Intro`, `brand/Outro`, `scenes/TitleCard`, `scenes/SceneSwitcher` - 표준 조립 순서(Intro -> TitleCard -> 본편 -> Outro)
- `assets/timeline.ts`의 `sceneFrames`/`sceneStarts`/`wrapCounts`/`buildCaptions` - 타이밍·자막 계산
- 오디오(신규 합성 없음, 기존 재사용): `intro_ding.mp3`, `outro_ding.mp3`, `realize_ding.mp3`(s5 "메아리" 순간), `cold_zing.mp3`(s6 전기 자극 순간)

### 신규 제작 (REGISTRY.md·`assets/props/index.ts`에 등록, 끝에 덧붙이는 방식으로 기존 줄 보존)
- `props/MemoryOverlapDiagram.tsx` - "지금 장면과 흐릿한 옛 기억이 겹치는 이중노출"(`overlapProgress`)과 "좌우 반구 신호 시간차"(`processProgress`) 두 시각 언어를 하나로 묶은 소품. 뇌는 해부도가 아니라 굵은 선으로 세로로 반 가른 둥근 사각형만 쓰고, 장면은 실제 골목을 그리지 않고 "장소" 아이콘(map-pin) 하나를 담은 액자로 추상화했다. 데자뷔·착각 기억류 소재가 반복될 가능성을 고려해 에피소드 로컬이 아니라 공용으로 등록.

새로 만든 자산 수: **1개**(MemoryOverlapDiagram). 재사용 자산 수: **15개 이상**(위 목록). REGISTRY.md·`assets/props/index.ts` 둘 다 기존 줄을 건드리지 않고 끝에만 추가했다.

## 타임코드 실측 (한국어만)

02-script-final-ko.md 참고. 본편 1295프레임(43.17초), 전체(인트로+제목카드+본편+아웃트로) 1508프레임(50.27초, 실측 mp4 50.33초).

## 렌더 검증 (렌더 전 - `remotion still` 스틸 프레임)

렌더를 태우기 전에 `npx remotion still`로 각 장면의 대표 프레임을 먼저 확인해 결함 2건을 렌더 1회로 끝내기 전에 잡았다.

1. **s1 DoorFrame 플래시 위치 불일치**: 처음 구현은 캐릭터가 x=170에서 x=CX(540)까지만 걸어가는데 DoorFrame의 `crossProgress`를 이동 진행도(moveT) 그대로 넘겨, 플래시가 절정(crossProgress=0.5)에 도달하는 시점에 캐릭터가 아직 문 중앙에 도착하지 못한 상태(x=355)였다. 캐릭터를 문 안쪽 중앙(x=CX)에서 멈추도록 하고, `crossProgress={smooth * 0.5}`로 넘겨 캐릭터가 도착하는 순간(moveT=1)에 정확히 플래시가 최고조가 되도록 수정. 재확인 스틸로 문 기둥과 캐릭터가 겹치지 않고 플래시 타이밍이 도착 순간과 일치함을 확인.
2. **s2 "데자뷔" 큰 글자 중앙정렬 깨짐**: `Label`에 `style={{ transform: 'scale(...)' }}`를 직접 얹으면서 `Label` 내부의 기본 정렬 트랜스폼(`translateX(-50%)`)을 완전히 덮어써 글자가 카드 오른쪽으로 치우쳐 보였다. `transform: 'translateX(-50%) scale(...)'`로 두 트랜스폼을 합쳐 수정. 재확인 스틸로 "데자뷔" 글자가 카드 중앙에 정확히 오는 것을 확인.

## 검수 체크리스트 (관찰 기록, 최종 mp4에서 ffmpeg로 19개 대표 프레임 추출해 확인 - 인트로/제목카드/s1 시작+중간/s2~s7 시작+중간/일부 핵심 프레임/아웃트로)

- [x] **자막 화면 밖 이탈**: 19개 프레임 전체 확인. 모든 자막이 좌우 여백(CAP_SIDE=70px) 안에서 중앙 정렬되고, 가장 긴 s4 문장도 여러 줄로 자연스럽게 나뉘어 화면 폭을 넘지 않았다.
- [x] **장면 전환 시 캐릭터 잔상**: SceneSwitcher 표준 크로스페이드(6프레임)만 관찰됨. s4->s5 전환 프레임(f012, 전체 프레임 850 근처)에서 이전 장면(이중노출 액자)과 다음 장면(반구 다이어그램)이 짧게 겹쳐 보이나 이는 의도된 크로스페이드이지 잔상 버그가 아니다.
- [x] **등장 전 요소가 점처럼 남음**: 전 장면 `PopIn`/`opacity` 기반 등장(fromScale 0.3~0.4)만 썼고, 19개 프레임 중 등장 전 시점 프레임(예: f009 - QMark 진행 중, f012 - 라벨 페이드인 중)에서도 스케일 0에 가까운 잔여 점은 관찰되지 않았다.
- [x] **라벨이 화면 밖에서 잘림**: s4/s5 라벨("가설 1"/"가설 2")과 s6 라벨("전기 자극 실험")이 화면 중앙에 완전히 들어오는 것을 f012/f017에서 확인.
- [x] **요소끼리 겹침**: s1에서 캐릭터가 문설주와 겹치는 결함을 스틸 검증 단계에서 발견해 수정(위 "렌더 검증" 절 1번). 최종 프레임(f005)에서 캐릭터와 문설주 사이 여유 공간을 확인. 그 외 겹침 없음.
- [x] **화면 아래쪽 여백 과다**: s7(f018)은 막대 그래프가 화면 중하단까지 채우고, s1/s6(전신·바스트샷)은 캐릭터가 화면 중앙~하단을 채운다. s4/s5(다이어그램) 장면은 다른 화(ep43 등)와 동일한 표준 배치(DIAG_Y=560)를 그대로 따라 채널 전반과 일관된 여백이다.
- [x] **음량**: `ffmpeg loudnorm` 측정 결과 Input Integrated -13.6 LUFS, Input True Peak -1.0 dBTP - 클리핑 없이 적정 수준.
- [x] **자막 스타일**: `assets/theme.ts`의 `CAPTION_STYLE`을 그대로 사용(에피소드 로컬 오버라이드 없음).
- [x] **화면 문자열 하드코딩 여부**: `node scripts/precheck.mjs` 결과 에러 0, `KO-STR`/`RANDOM`/`NOWRAP`/`WORDBRK`/`FORMAT`/`IMPORT` 경고 전부 0건(공용 루트 `out/`에 대한 `SHAREDOUT` 경고 1건만 있었고, 이는 이 화가 만들기 전부터 남아있던 다른 화의 잔재로 타임스탬프 확인 결과 이번 작업과 무관함).
- [x] **효과음 타이밍·레벨**: `realize_ding.mp3`는 예정 시점(34.43초) 근처(34.3~34.6초)에서 피크 -6.8dB로 명확한 에너지 상승을 확인. `cold_zing.mp3`는 예정 시점(37.3초) 근처에서 피크 -5.0dB로 확인. 둘 다 내레이션 트랙의 True Peak(-1.0dBTP)보다 낮아 내레이션을 넘지 않음.

프로필(`profiles/general.md`)에 별도의 "검수 추가 체크" 섹션은 없어 공통 체크리스트만 적용했다.

## 렌더 횟수
- `node scripts/render.mjs general-ep45-deja-vu ko`: **1회** (렌더 전 `remotion still`로 결함 2건을 먼저 잡아 재렌더 없이 1회로 끝남)

## 배포

기술적 검증(위 체크리스트)을 통과해 곧바로 배포를 완료했다.

- 배포 경로: `/home/lee/project/shorts/ko/[45화] 처음 온 곳인데 와본 것 같은 이유.mp4`
- md5 대조로 배포본과 렌더 산출물이 동일함을 확인 후 `out/episode-ko.mp4` 삭제(`out/frames-ko/`는 검수 기록으로 보존)

이 보고는 "이렇게 나왔습니다, 확인해주세요"이며, 최종 합격 판정은 사용자 몫이다.
