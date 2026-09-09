# 43화 "라면이 다 꼬불꼬불한 이유" - 빌드 리포트

## 산출물 (배포 완료)

- `/home/lee/project/shorts/ko/[43화] 라면이 다 꼬불꼬불한 이유.mp4`
- 실측 재생시간: 50.624초 (1517프레임, 30fps)
- `out/` 안의 mp4는 배포(md5 일치 확인) 후 삭제함. `out/frames-ko/`(검수 프레임)는 보존.
- **영어판 없음** - 영어 채널(Whymo) 운영 중단(오케스트레이터 명시 지시)으로 한국어판 1개만 제작.

## 자산

### 재사용 (신규 제작 없이 그대로 가져다 씀)

- `character/Actor.tsx`(`BustActor`, `POSES.thinking`) - s2 리액션
- `scenes/Caption.tsx`(`Label`) - 자막·화면 라벨
- `scenes/PopIn.tsx` - 아이콘·배지 등장 모션
- `backgrounds/PlainBg.tsx` - 단색 배경
- `props/ThemedIcon.tsx`(`clock`, `history` 아이콘) - s5 타이머, s7 회상
- `audio/ui_tap.mp3` - s6 "컵에 쏙 맞아떨어짐" SFX로 재사용
- `audio/intro_ding.mp3`, `audio/outro_ding.mp3` - 인트로·아웃트로 공용
- `assets/timeline.ts`(`sceneFrames`, `sceneStarts`, `buildCaptions`, `wrapCounts`), `assets/anim.ts`(`progress`, `blendPose`)

### 신규 제작 (REGISTRY 등록 완료)

- `props/NoodleDiagram.tsx` - `NoodleDiagram`(waveProgress로 곧은 면 -> 구불한 면 전환 + flowProgress로 틈 사이 열/물 반복 흐름), `NoodleCupFit`(cupFit으로 원형 컵 단면에 들어참). REGISTRY.md 소품 표에 등록, `assets/props/index.ts`에 export 추가.
- `audio/bag_tear.mp3` - 봉지를 뜯는 "부스럭" SFX(ffmpeg lavfi 합성, 화이트+핑크 노이즈에 트레몰로). REGISTRY.md 오디오 표에 등록.
- 재사용 판단: REGISTRY의 `PlateFoodIcon`(31화, 접시+음식), `IceFloatCup`(17화, 액체 컵), `Meat`/`Apple`(browning 연속보간)을 먼저 확인했으나 "곧은 것이 접혀 파형이 되는 변형 과정" 자체를 표현하는 자산이 없어 신규 제작함(planner의 자산 목록 판단과 일치).

## 시각 주의사항 반영

- 면발은 4가닥(굵은 이중 스트로크: ink 외곽선 + gold 채움)만 사용, 가는 선 다발 없음.
- 곧은 면 vs 구불한 면 대비를 `waveProgress`의 좌->우 스윕 애니메이션 하나로 동시에 보여줌(s3).
- 봉지·컵은 큰 도형(사각형 3장, 원 1개) 몇 개로만 표현.
- 1차 렌더 스틸 검토에서 s4 열 화살촉이 gold-on-gold로 대비가 약해 ink+coral 이중 스트로크로 교체(코드 수정 후 재검증 완료).
- 1차 렌더 스틸 검토에서 s1 상단 여백이 과다(빈 공간 900px)해 봉지 위치를 화면 중앙으로 올림(BAG_TOP 900->520).

## 기술 점검 (관찰 기록, 최종 판정은 사용자 몫)

- **precheck.mjs**: 에러 0 / 경고 1(`SHAREDOUT` - 공용 루트 `out/`에 다른 화의 잔여 산출물 발견, 타임스탬프 2026-08-20으로 확인해 42/43화와 무관한 과거 잔재임을 확인, 손대지 않음).
- **`npx tsc --noEmit`**: `assets/props/NoodleDiagram.tsx`, `episodes/general-ep43-ramen-wavy/src/*` 관련 에러 0 (타 에피소드의 기존 lint 경고는 이 화와 무관).
- **자막 화면이탈**: f001~f020(대표 20프레임, 인트로/타이틀/s1~s7/아웃트로 각 장면 시작·중간) 전체 확인, 모든 자막 박스가 좌우 여백 안에 들어옴.
- **장면 전환 잔상/등장 전 요소**: SceneSwitcher 표준 크로스페이드(8프레임 fade-in)로 각 장면 시작 직후 몇 프레임은 옅게 보이는 것이 정상 동작(다른 41개 화와 동일 패턴)임을 프레임 121~125(TitleCard->s1 전환 경계) 실측으로 확인. 별도 잔상·점 아티팩트 없음.
- **라벨 겹침**: s3~s7 라벨(일부러 만든 모양/틈 사이로 골고루/3분/컵에 쏙/1958년)이 다이어그램과 겹치지 않는 위치(상단 또는 하단)에 배치된 것을 f008,f011,f013,f015,f017에서 확인.
- **화면 하단 여백 과다**: s1의 상단 여백을 축소(위 "시각 주의사항" 참고)한 뒤 재확인, 나머지 장면은 다이어그램+라벨+자막이 화면 세로 중앙~하단을 채우는 것을 확인.
- **음량**: `volumedetect` mean -17.5dB / max -2.2dB (mp4 전체). `loudnorm summary` Input Integrated -13.6 LUFS / True Peak -2.2 dBTP - 기존 화들과 유사한 범위.
- **SFX 타이밍**: bag_tear(s1, 절대 프레임 151 = 5.03s) 구간에서 `-ss` input-seek 방식으로 측정 시 mean -27.2dB/max -10.2dB(진짜 무음 구간인 t=1.0s는 -91dB로 확인돼 대비됨) - 의도한 시점에 에너지가 있음을 확인. ui_tap(s6, 절대 프레임 1152 = 38.4s) 구간 mean -14.7dB/max -3.5dB로 뚜렷한 피크 확인.
- **효과음 vs 내레이션 피크**: 내레이션 트랙 volume=1.6, bag_tear volume=0.8, ui_tap volume=0.75로 보조 효과음이 내레이션보다 낮게 설정됨(REGISTRY 관례와 동일).
- **한국어 전용 확인**: strings.ts에 `en` 블록 없음(원칙에 따라 en 채널 중단 반영), 화면에 노출된 모든 문자가 한국어(자막·라벨·인트로·아웃트로)로 일관됨을 f001~f020에서 확인.
- **캐릭터 윤곽선 대비**: 전 장면 배경이 밝은 톤(sky/goldSoft/browningSoft)이라 ink 스트로크 대비 문제 없음(어두운 배경 미사용).

## 프로필(general) 추가 체크

- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 라면을 먹어본 사람이면 누구나 본 모양이지만 이유는 잘 모른다는 점에서 부합.

## 렌더 이력

- `remotion still` 사전 확인: 2회(1차 - 초기 배치 확인, 2차 - 색상/레이아웃 수정 후 재확인)
- `render.mjs ... ko`: 1회 성공(1517프레임)
