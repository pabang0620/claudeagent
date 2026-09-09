# 55화 "바다가 하루 두 번 들어왔다 나가는 이유" - 빌드 리포트

## 산출물 (한국어판만 - 영어 채널 운영 중단, 오케스트레이터 지시)

- 배포 경로: `/home/lee/project/shorts/ko/[55화] 바다가 하루 두 번 들어왔다 나가는 이유.mp4`
- 실측 재생시간: 56.021초 (ffprobe)
- 렌더 횟수: 1회 (스틸 선점검에서 결함을 미리 잡아 전체 렌더는 1회로 끝남)
- md5 배포 대조: `out/`과 `shorts/ko/` 일치 확인 후 `out/episode-ko.mp4` 삭제(`frames-ko/`는 보존)

## 자산

### 재사용 (5개)
- `character/Actor.tsx`(`BustActor`) - s2 리액션 바스트샷, 립싱크 연결
- `character/poses.ts`/`anim.ts`(`blendPose`) - s2 포즈 전환
- `scenes/Caption.tsx`(`Caption`, `Label`) - 자막 + 화면 라벨(달 쪽으로 볼록/반대쪽도 볼록/
  하루 두 번/밀물·썰물/사리)
- `backgrounds/NightSkyBg.tsx` - s3·s4·s5·s7 "우주에서 본 지구" 배경(moon/horizon 끔, 별만)
- `backgrounds/PlainBg.tsx`, `props/ThemedIcon.tsx`(arrow-up/arrow-down) - s2·s6 배경 및 아이콘

### 신규 제작 (1개, REGISTRY 등록 완료)
- `props/TideDiagram.tsx` - `TideDiagram`(지구+바다 팽대, bulgeNearProgress/bulgeFarProgress/
  rotateProgress/alignProgress) + `ShoreLevel`(해안 수위선 하나로 밀물/썰물을 보여주는 패널).
  REGISTRY.md 251번째 줄(WoundHealDiagram 다음)에 등록, `assets/props/index.ts`에 export 추가.
  REGISTRY 사전 대조: 42화 `ParallaxDiagram`(지구-달 거리 시차)과 33화 `SaltCycleDiagram`을
  확인했으나 둘 다 "달 조석 팽대" 구조를 다루지 않아 신규 제작이 맞다고 판단.

## 언어별 실측 길이

한국어만 제작(영어 채널 Whymo 운영 중단, 2026-09-02 오케스트레이터 명시 지시). 구간별 실측은
`02-script-final-ko.md` 참고. 총 길이 56.021초.

## 기술 점검

- **precheck.mjs**: 에러 0 / 경고 1(`SHAREDOUT`). 이 경고는 공용 루트 `shortform/out/frames-en`,
  `frames-ko`에 2026-08-20 타임스탬프로 남아있던 파일 때문으로, 이번 55화 작업과 무관한 이전
  세션의 잔재로 판단(현재 세션에서 만든 산출물은 전부 `episodes/general-ep55-tide/out/`
  안에만 있음, `ls -la` 타임스탬프로 확인). 병렬 렌더 중일 수 있는 다른 화(54화)의 소유물일
  가능성을 배제할 수 없어 삭제하지 않고 그대로 뒀다.
- **오디오 파일**: `public/audio/`에 `ko_s2~s7.mp3`, `ko_words.json`, `ko_mouth.json`,
  `intro_ding.mp3`, `outro_ding.mp3`, `water_splash.mp3`, `realize_ding.mp3` 전부 확인 후 렌더.
- **loudnorm**: Input Integrated -13.7 LUFS / True Peak -2.5 dBTP - 클리핑 없음.
- **효과음 레벨 vs 내레이션**: `water_splash`(volume 0.65 적용 후 max -7.1dB)는 s1이 무성
  구간이라 내레이션과 겹치지 않음. `realize_ding`(volume 0.8 적용 후 max -6.1dB)은 s2 narration
  (volume 1.6 적용 후 max 0.0dB)과 겹치는 구간이나, 개별 소스에 실제 볼륨 배율을 적용해 각각
  측정한 결과 SFX 피크(-6.1dB)가 내레이션 피크(0.0dB)보다 낮음을 확인(원칙 7 - 최종 믹스가
  아니라 개별 소스+volume 배율로 측정).

## 스틸 선점검에서 잡은 결함 (렌더 전, `remotion still`로 발견 - 전체 렌더 태우기 전에 수정)

1. **TideDiagram 근거리(달 쪽) 힘 화살표가 거의 안 보임**: `MOON_CX-MOON_R-20`에서
   `EARTH_CX+EARTH_R+OCEAN_BASE+nearAmp+26`까지로 계산해 화살표 길이가 약 26px로 너무 짧았다
   (s3_end 스틸에서 발견). 시작점을 달 가장자리 그대로, 끝점을 팽대 가장자리 바로 앞(-8px)으로
   고쳐 팽대 진행에 따라 화살표가 자연스럽게 짧아지도록 수정.
2. **alignProgress(s7, 사리) 모드에서 달이 지구의 조석 팽대 안에 파묻힘**: 기존 좌표
   (`ALIGN_EARTH_R=150, ALIGN_OCEAN_BULGE=130, ALIGN_MOON_CX=430`)로는 팽대가 최대로 부풀 때
   왼쪽 끝(x=402)이 달의 몸통(x=372~488)을 침범해 달과 지구 팽대가 겹쳐 보였고, 힘 화살표도
   방향이 반대로 그려졌다(s7_end 스틸에서 발견). 지구 반지름·팽대 최대치를 줄이고
   (150→130, 130→80) 달 위치를 왼쪽으로 옮겨(430→350) 최대 팽대 상태에서도 겹치지 않는 간격을
   확보, 화살표 방향도 함께 바로잡았다.

두 결함 모두 `assets/props/TideDiagram.tsx`(공용 자산) 수정 후 관련 스틸을 다시 뽑아 확정,
전체 렌더는 이 수정을 반영한 상태로 1회만 돌렸다.

## 렌더 후에야 발견한 결함 (풀 렌더 이후, 최종 mp4에서 발견)

1. **ShoreLevel의 밀물/썰물 방향이 완전히 뒤바뀜**: s1(해변 타임랩스, 물이 빠지는 장면인데
   렌더된 mp4에서는 오히려 물이 차오르는 것처럼 보임)과 s6(밀물 패널이 되레 물이 적고 썰물
   패널이 물이 많음)에서 발견. 원인은 `shoreY = lerp(SHORE_LOW_Y=1620, SHORE_HIGH_Y=820, lv)`
   의 변수명과 실제 화면 기하가 반대였던 것 - `shoreY`가 클수록(화면 아래쪽일수록) 바다가
   차지하는 면적이 넓어지는(밀물) 구조인데, 이름표를 반대로 붙여놓고 lerp 방향도 그대로
   따라가서 `level=1`(밀물)일 때 오히려 물이 가장 적게 나오는 상태가 됐었다. 상수를
   `SHORE_Y_AT_LOW_TIDE=820`/`SHORE_Y_AT_HIGH_TIDE=1620`으로 이름과 값의 대응을 바로잡고
   lerp 인자 순서를 맞춰 수정, 이 화면은 `remotion still`로 개별 프레임만 봐서는 "물이 있다/
   없다" 자체는 맞아 보여 스틸 선점검에서 놓쳤고, s1의 시작/끝 프레임을 나란히 비교하는
   최종 mp4 검수 단계에서야 방향(증가/감소)이 반대라는 게 드러났다. (이 컴포넌트는 아직
   다른 화에서 쓰인 적이 없어 55화 자체 렌더 1회로 발견·수정·재확인까지 끝냈고, 다른 화
   재렌더는 필요 없었다.)

수정 후 `s1_start`/`s1_end`, `s6_mid`/`s6_end` 스틸을 다시 뽑아 밀물 쪽이 실제로 물이 많고
썰물 쪽이 물이 적은지 육안 확인했고, 이 상태로 최종 렌더 1회를 진행했다(위 "렌더 횟수: 1회"는
이 수정이 반영된 최종본 기준).

## 검수 체크리스트 (관찰 기록)

- [x] **자막이 화면 밖으로 나가지 않는가**: f001~f025(대표 25프레임) 전체 확인, 모든 자막이
      좌우 여백(CAP_SIDE=70px) 안에서 렌더됨. 가장 긴 줄(s5 "같은 바닷가도 하루에 물이
      들어왔다")도 화면 폭 안에 여유 있게 들어감.
- [x] **장면 전환 시 캐릭터 잔상**: s2→s3(f008, frame 360) 전환 프레임에서 s2 캐릭터의
      옅은 잔상이 SceneSwitcher의 6프레임 크로스페이드 구간 안에서만 보이고, 6프레임(0.2초)
      뒤(f009, s3_mid)에는 완전히 사라짐 - 다른 화와 동일한 표준 크로스페이드 동작.
- [x] **등장 전 요소가 점처럼 남아있지 않은가**: TideDiagram의 근거리/원거리 화살표는
      `opacity` 기반으로 등장하며(scale 0 방식 아님), progress<0.01일 때 아예 렌더하지 않도록
      조건부 처리(`arrowOpacityNear > 0.01 ? ... : null`)해 잔점 없음을 s3/s4/s5 시작 프레임에서
      확인.
- [x] **라벨이 화면 밖에서 잘리지 않는가**: s3~s7의 Label(`x=CX` 중앙 정렬)과 s6의 밀물/썰물
      개별 라벨(패널 중앙 정렬) 전부 f008~f022에서 화면 안에 완전히 들어옴을 확인.
- [x] **요소끼리 겹치지 않는가**: TideDiagram 스틸 선점검에서 실제로 겹침 결함(달-팽대 겹침)이
      나와서 수정했고(위 "스틸 선점검" 2번), 수정 후 s7_mid/s7_end에서 해/달/지구가 서로
      겹치지 않고 분리돼 보이는 것을 확인. s2 BustActor와 자막 박스도 겹치지 않음(f006 확인).
- [x] **화면 아래쪽 여백이 과다하지 않은가**: s3~s5·s7은 다이어그램(DIAG_Y=520~1178)이 화면
      중상단~중하단을 채우고 라벨(위)+자막(아래)이 나머지를 채워 하단 여백이 크지 않음.
      s6은 패널(480~1156)+캡션으로 유사하게 채움. s1(ShoreLevel 풀스크린)·s2(BustActor+캡션)도
      화면 세로 대부분을 채움.
- [x] **음량이 충분한가**: loudnorm 측정 Input Integrated -13.7 LUFS / True Peak -2.5 dBTP.
      클리핑 없이 충분한 레벨.
- [x] **자막이 프로필 스타일을 따르는가**: `CAPTION_STYLE`/`FS.caption`(50px)/`wrapCounts`
      (ko 20자) 기본값을 그대로 썼고, 별도 오버라이드 없음. s3~s5·s7은 `dark` prop으로 어두운
      배경용 스타일을 사용(캡션 컴포넌트 기본 동작).
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가**: s2(밝은 배경)는 기본 `C.ink` 스트로크로
      충분히 구분됨(f006 확인). 어두운 배경(NightSkyBg) 장면(s3~s5·s7)에는 캐릭터가 등장하지
      않아(다이어그램 전용 장면) 이 항목은 캐릭터에 해당하는 프레임이 없음 - 대신 TideDiagram의
      `stroke`를 `C.cream`으로 override해 지구·달·화살표 윤곽선이 어두운 배경과 명확히
      구분되는지 s3_end/s4_end/s5_end/s7_end에서 확인(달의 옅은 채움색 `C.hillFar`도 `C.cream`
      스트로크 덕에 경계가 뚜렷함).

### 프로필(general) 추가 체크
- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가: 해변에서 물이 들어왔다 빠지는
      경험은 일상적으로 접할 수 있는 상황이며, "왜 하루 두 번인가"라는 구체적 반전 포인트가
      있어 프로필 톤에 부합.

## 참고

- s1(무성) 대본이 정한 길이 3.0초를 그대로 썼다(늘리지 않음).
- s2→s3 전환에만 0.6초 확장 여백을 줬다(리액션+훅 질문 다음 설명 구간 전환, 원칙 4의 5번).
- 리액션(s2) rate/pitch를 프로필 기본값보다 확실히 높여(+32%/+55Hz vs +20%/+30Hz) 놀람 톤을
  실었다.
