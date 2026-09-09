# 24화 빌드 보고 - 자석이 서로 붙는 이유

**이번 배치는 영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 한국어판만 제작한다.** `episode-en.mp4`는 만들지 않는다.

## 동시 작업 주의사항 확인

- 23화(`general-ep23-coffee-caffeine`)가 동시에 렌더 중이라는 안내에 따라 그 폴더는 전혀 건드리지 않았다.
- 렌더는 전부 `scripts/render.mjs`로 실행했고, 출력은 `episodes/general-ep24-magnet/out/`에만 생성됨을 매 렌더마다 확인했다.
- `precheck.mjs`가 공용 루트 `shortform/out/`의 `SHAREDOUT` 경고를 냈으나, `ls -la`로 확인한 결과 `frames-en/`·`frames-ko/`의 타임스탬프가 8/20·8/9로 이번 세션 이전(23화·24화 작업 시작 전)의 잔여물이었다. 다른 화 소유 가능성이 있어 삭제하지 않고 그대로 두었다.
- `assets/props/tabler-cache.json`·`scripts/icons.txt`에 `compass`/`compass-filled` 아이콘을 추가했다(`node scripts/sync_icons.mjs compass compass-filled`) - 기존 아이콘은 전혀 제거되지 않고 추가만 됐음을 `git diff`로 확인(순수 additive).

## 자산

- 재사용: `character/Actor`(`BustActor`), `character/poses`(idle, surprised), `backgrounds/PlainBg`, `scenes/Caption`(`Caption`, `Label`), `props/ThemedIcon`(world), `assets/brand/Intro`·`Outro`, `assets/scenes/TitleCard`, `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`/`mouthAt`/`mouthProp`), `assets/anim.ts`(`blendPose`/`progress`/`clamp01`/`easeIn`/`shake`) - 총 12종
- 신규 제작: `props/MagnetDiagram.tsx` 1종 (export: `MagnetDiagram`, `BarMagnet`, `CompassNeedle`, `MAGNET_N_COLOR`, `MAGNET_S_COLOR`)
  - REGISTRY.md 등록 여부: **등록 완료** (`assets/REGISTRY.md`의 props 표, "MagnetDiagram" 행)
  - REGISTRY 사전 대조 결과: 자석·전자 정렬·자기장 흐름을 보여주는 기존 자산이 없어(3~4절 확인) 신규 제작. `WaterMoleculeLattice`(격자 점 배치)를 참고했으나 "정렬 방향이 읽혀야 하는" 요구가 달라 화살 기반으로 새로 설계
  - 아이콘: `compass`/`compass-filled`를 Tabler Icons 캐시에 신규 추가(`world`/`magnet`은 기존 캐시에 이미 있었음)
  - 새로 만든 효과음 없음(원칙 7) - s1이 무성 스톱모션 구간이지만 애니메이션 자체(자석이 서서히 다가가 붙는 정지된 물체의 조용한 움직임)라 임팩트 효과음이 꼭 필요한 지점으로 보지 않았다. 필요하다는 판단이 서면 추후 추가 가능

## 시각 설계 메모 (오케스트레이터 지시 반영)

- "물질 속 작은 자석들이 같은 방향으로 줄을 맞춘다"(s3)와 "N극에서 나온 힘의 흐름이 S극으로 들어간다"(s4)의 대비가 한눈에 읽히도록, s3은 3x3(9개) 화살 격자의 무질서→정렬 전환 + 정렬 완료 시 N/S 라벨이 붙은 박스 색 전환으로, s4는 자석 하나당 화살 1개(자기 자신에게 돌아가는 큰 루프 → 다가온 자석 쪽으로 굽어 짧아지는 화살)로 설계했다.
- 화살 개수를 "크고 적게" 원칙에 따라 제한했다: 전자 정렬 격자 9개(3x3), 자기장 화살은 자석 하나당 1개. 점을 여러 개 흩뿌리는 표현은 쓰지 않았다.

## 언어별 실측 길이

한국어만 제작(영어 없음).

- 구간별 실측(edge-tts WordBoundary): s2 5.160s(rate+32%/pitch+55Hz) / s3 10.344s / s4 10.248s / s5 6.048s / s6 7.296s (s1은 무성 고정 2.0s)
- 내레이션 합계(s2~s6): 39.096초
- 본편(s1~s6) 총 길이: 42.67초(1280프레임) - 60초 상한 안
- 전체(Intro+TitleCard+본편+Outro): **49.77초(1493프레임, 1080x1920, 30fps)** - 상세 타임코드는 `02-script-final-ko.md`
- 리액션(s2, rate+32%/pitch+55Hz) → 설명(s3) 전환에 프로필 기본 여백(0.2s) 대신 확장 여백(0.6s) 적용(원칙 4)

## 렌더 횟수 (한국어)

4회
1. 최초 렌더 - S1(책상 위 자석) 배치가 화면 하단에 작게 몰려 상단 여백이 과다(체크리스트 위반 소지) 발견
2. S1 확대·재배치 후 재렌더 - 좌표 계산 실수(`S1_A_CX = CX - S1_MAG_W`)로 자석 쌍이 화면 왼쪽으로 치우쳐 좌측이 잘림 발견
3. 좌표 수정(`CX - S1_MAG_W / 2`) 후 재렌더 - 정상 확인, 단 S2(리액션 대사) 구간에 `mouth.json` 립싱크를 연결하지 않은 결함을 코드 리뷰 중 자체 발견(캐릭터가 대사 중인데 입 모양이 고정)
4. `mouthAt`/`mouthProp`로 S2에 립싱크 연결 후 최종 렌더 - 프레임 수(1493) 불변 확인, 최종본으로 채택

## 발견·수정한 결함

1. **S1 자석 배치가 화면 하단에 작게 몰려 위쪽이 텅 빔** - 초기 크기(340x170)·위치(GROUND=1250 기준)가 다른 다이어그램 씬들(화면 중앙 60% 안팎을 채움)에 비해 훨씬 작고 낮았다. 크기를 440x220으로 키우고 화면 중앙(y=950)으로 옮기고, `PlainBg`의 큰 바닥 음영 대신 자석 아래 옅은 그림자(ellipse)만 남겨 "표면 위에 놓여 있다"는 느낌만 최소한으로 유지했다(builder 원칙 5 예방 체크리스트, "화면 아래쪽 여백 과다" 대응).
2. **S1 좌표 계산 실수로 자석 쌍이 화면 왼쪽으로 삐져나감** - "두 자석이 붙은 상태의 전체 폭이 화면 중앙에 오도록" 계산할 때 `S1_A_CX = CX - S1_MAG_W`(자석 하나의 전체 폭만큼 왼쪽으로 이동)로 잘못 써서 왼쪽 자석 좌측 절반이 화면 밖으로 나갔다. `CX - S1_MAG_W / 2`(자석 폭의 절반만 이동)로 수정 - 렌더 후 프레임 검수(f005, s1 mid)에서 발견.
3. **S2(리액션 대사) 구간에 립싱크 미연결** - `ko_mouth.json`을 생성해뒀으나 `S2Question` 컴포넌트가 `mouthOpen`을 받지 않아 대사 중에도 입 모양이 고정 미소로 유지됐다. `mouthAt(mouth, 's2', f)` → `mouthProp()`을 연결해 립싱크를 붙였다(ep22와 동일 패턴) - 렌더 후 코드 자체 재점검 중 발견(프레임 비교가 아니라 "mouth.json을 만들었는데 어디서 쓰는가"를 되짚다가 발견).

## 기술 검증 (관찰 기록, 한국어만)

렌더 명령은 전부 `scripts/render.mjs`로 실행했고 출력은 `episodes/general-ep24-magnet/out/`에만 생성됨을 확인했다(공용 루트 `shortform/out/`에는 쓰지 않음). `precheck.mjs`는 매번 에러 0(경고 1 - 위 무관한 SHAREDOUT)으로 렌더를 진행했다.

- **자막 화면이탈**: f008(s2 mid, "붙네 왜 이러는 거지"), f009(s2 end), f011(s3 mid, "물질에서는 이 작은 자석들이 같은"), f015(s4 mid, "들어가려고 하는데 다른 자석의 반대"), f019(s5 mid, "자석의 보이지 않는 힘의 흐름이 서로"), f022(s6 mid, "자석이에요 그래서 나침반 바늘이 항상") 등 캡션이 표시된 모든 검수 프레임에서 텍스트 박스가 좌우 안전영역(`CAP_SIDE=70`) 안에 들어오는 것을 직접 확인. 좌우로 잘리는 프레임 없음.
- **장면 전환 시 캐릭터/다이어그램 잔상**: 전환 경계 프레임(f013=677=s3 끝 직전, f014=678=s4 시작 직후)에서 크로스페이드(0.2초, 6프레임) 동안 직전 장면(S3의 정렬 완료 상태)이 겹쳐 보이는 것을 확인 - `SceneSwitcher`의 의도된 크로스페이드 동작이며, xfade 구간을 벗어난 프레임(f015=835)에서는 새 장면(S4)만 정상 표시됨을 확인.
- **등장 전 요소가 점처럼 남아있는지**: `MagnetDiagram`의 화살은 전부 `opacity`+`pathLength` dash reveal(fieldFlow) 또는 `arrowsOpacity`(align)로 등장하며 `scale(0)` 방식을 쓰지 않음. `PopIn`은 이 화에서 사용하지 않았다(오케스트레이터 지시의 "팝인은 PopIn을 쓴다"는 원칙에 해당하는 등장 아이콘이 없어 미사용 - S6의 globe/compass는 opacity+scale을 직접 구현했는데, `PopIn`이 중심점 고정 트랩 방지용이라는 취지에 맞춰 같은 "위치를 감싸는 div 자체에 opacity+transform을 얹는" 방식을 그대로 따랐음을 f020~f022(s6, globe/compass 등장 구간)에서 위치 어긋남(Δy 튐) 없이 확인).
- **라벨이 화면 밖에서 잘리는지**: s3 "전자 정렬 = 자석"(f011~f013), s4 "N → S"(f014~f016), s6 "지구도 하나의 자석"(f021~f023) 전부 화면 중앙에 위치하고 `Label` 컴포넌트의 `wordBreak: keep-all`·`whiteSpace: nowrap`(래핑 없음)이 기본 적용되어 잘리지 않음을 확인.
- **요소끼리 겹치는지**: S6에서 globe(중심 x=320)와 compass(중심 x=750, 박스 폭 400)가 서로 다른 x좌표에 배치되어 겹치지 않음을 f022에서 확인. S1에서 두 자석이 최종적으로 서로 "붙는" 것은 의도된 접촉이지 겹침 결함이 아님.
- **화면 하단 여백 과다 여부**: S1(f005, 자석 두 개가 화면 중앙 y=950 부근에 크게 배치, 위 결함 1 수정 결과), s3~s6(다이어그램·라벨·캡션이 화면 상~중단부터 하단 캡션까지 채움) 전부 안전영역 안에서 세로 중앙~하단까지 콘텐츠가 채워짐을 확인.
- **음량**: `ffmpeg loudnorm=print_format=summary` 측정 결과 Input Integrated -13.9 LUFS / True Peak -2.2 dBTP - 정상 청취 가능한 수준(내레이션 볼륨 1.6배 적용, ep22의 -13.6 LUFS와 유사한 범위).
- **자막 스타일**: 프로필(`general.md`) 기준 폰트 크기(`FS.caption=50`)·위치(`CAP_BOTTOM=300`)·글자수 상한(`wrapCounts` 20자)을 공용 `Caption` 컴포넌트 그대로 사용 - 별도 override 없음.
- **모든 화면 문자열이 한국어로만 노출되는지**: `strings.ts`에 `ko` 블록만 존재하고 `Root.tsx`도 `EpisodeKo` Composition 하나만 등록 - 영어 문자열이 섞일 여지 자체가 없음(영어 Composition 미등록). `MagnetDiagram`의 N/S 라벨은 국제 관례 기호(언어 무관)라 `strings.ts`를 거치지 않는다(숫자·기호류와 동일 취급).
- **캐릭터 윤곽선과 배경 대비**: 이 화는 모든 장면이 밝은 `PlainBg` 배경이라(밤하늘·우주 등 어두운 배경 없음) 기본 `C.ink` 스트로크로 충분히 구분됨을 f003/f008/f009 프레임에서 확인 - 별도 글로우 처리 불필요.
- **팝인 중간 프레임 포함 확인**: S6의 globe(f021~f022, opacity/scale 0→1 진행 중)·compass(같은 구간, 나침반 바늘이 -58°→0°로 settle)에서 중간값 프레임에서도 아이콘 중심 좌표가 고정된 채 스케일·회전만 바뀌는 것을 확인(Δ위치 튐 없음).
- **팀 프로필 추가 체크(general.md)**: 전문용어 노출 없음(대본이 "N극", "S극", "전자" 등 초등 고학년~성인이 이해 가능한 수준의 용어만 쓰고 별도 설명 없이도 자막·화면 라벨이 보완), 자막 글자수 20자 상한 준수(직접 육안 확인, 자동 계산이므로 초과 없음).

## 배포

기술 검증(위 항목)을 통과해 즉시 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[24화] 자석이 서로 붙는 이유.mp4`
- 배포 직후 md5 대조로 원본과 일치 확인(`4392bad4d21cc09e152cca1f0791c240`), `episodes/general-ep24-magnet/out/`의 mp4는 정책에 따라 삭제(`out/frames-ko/`는 검수 기록으로 남김)

이렇게 나왔습니다. 확인 부탁드립니다 - 특히 `MagnetDiagram`의 전자 정렬·N-S 자기장 흐름 연출이 "왜 자석이 서로 붙는지"를 실제로 잘 전달하는지, S1의 스톱모션 느낌(무성 구간)이 자연스러운지는 최종 시청 판단을 부탁드립니다.
