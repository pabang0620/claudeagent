# 29화 빌드 보고 - 잠들기 직전 몸이 움찔하는 이유

**이 화는 한국어판만 제작한다.** 영어 채널(Whymo) 운영 중단(2026-09-02, 오케스트레이터 명시 지시)으로 `episode-en.mp4`는 만들지 않는다.

## 동시 작업 주의사항 확인

- 28화(`general-ep28-cat-purring`)가 다른 세션에서 동시에 렌더 중이라는 안내에 따라 그 폴더는 전혀 건드리지 않았다.
- 렌더는 전부 `scripts/render.mjs`로 실행했고, 출력이 `episodes/general-ep29-hypnic-jerk/out/`에만 생성됨을 매 렌더 후 `ls -la`로 확인했다.
- `precheck.mjs`가 공용 루트 `shortform/out/`의 `SHAREDOUT` 경고(`frames-en/`, `frames-ko/`)를 냈으나, `find`로 대조한 결과 `*ep29*` 관련 파일이 하나도 없어 다른 화(28화 등)의 잔여물로 판단하고 건드리지 않았다.
- `assets/props/index.ts`·`assets/REGISTRY.md`는 기존 줄을 건드리지 않고 파일 끝(각 표 마지막 행 뒤)에만 새 항목(`Bed`)을 추가했다.

## 자산

- 재사용: `character/Actor`(`Actor`/`BustActor`/`MiniCharacter`), `character/poses`(idle, surprised), `backgrounds/PlainBg`, `scenes/Caption`(`Caption`/`Label`), `scenes/PopIn`, `scenes/TitleCard`, `props/ThemedIcon`(brain/coffee/cloud/moon/bolt/question-mark/alert-triangle/arrow-down), `props/NerveSignal`, `assets/brand/Intro`·`Outro`, `assets/timeline.ts`(`sceneFrames`/`sceneStarts`/`buildCaptions`/`wrapCounts`), `assets/anim.ts`(`blendPose`/`buildPeakRelease`/`progress`/`clamp01`) - 총 15종
- 신규 제작: `props/Bed.tsx` 1종 (export: `Bed`, `BedProps`)
  - REGISTRY.md 사전 대조 결과: "침대에서 잠드는 장면"을 보여주는 기존 소품이 없어(3절 확인 완료, `Bathtub.tsx`가 "하반신을 앞판이 가리는" 구조적으로 가장 가까운 선례) 신규 제작. Bathtub과 동일한 "앞판이 하반신을 가린다" 설계를 그대로 따르되, 베개는 캐릭터 뒤로 가야 해서 `layer`('back'|'front'|'both') prop으로 헤드보드+베개(Actor 이전)와 이불 앞판(Actor 이후)을 나눠 그리도록 일반화했다.
  - REGISTRY.md 등록 여부: **등록 완료** (`assets/REGISTRY.md` 3절 props 표, "Bed" 행. 수면·잠 소재 전반 재사용 가능하다고 명시)
  - "brain-signal-arrow"(대본 자산 목록의 신규 항목)는 기존 `props/NerveSignal.tsx`(두 점을 잇는 신호 이동 범용 오버레이, general-ep13)로 이미 커버되어 **새로 만들지 않고 그대로 재사용**했다(원칙 0).
  - "muscle-relax-loop"(대본 자산 목록의 신규 항목)는 기존 `Actor`+로컬 포즈(`LOOSE`, 이 화 전용)+`ThemedIcon`(bolt) 조합만으로 표현 가능해 별도 라이브러리 컴포넌트를 만들지 않고 씬 로컬로 구성했다.
  - "caveman-tree-silhouette"(대본 자산 목록의 신규 항목)는 새 신체를 그리지 않고 기존 `Actor`를 단색(`color=accent=C.night`, `fill=C.nightSoft`)으로 오버라이드해 실루엣으로 표현했다(참고 이미지가 없는 도형이라 원칙 0-1의 벡터화 대상이 아님). 나무 가지·잎 클러스터는 이 화 전용 로컬 SVG(재사용 가능성이 낮아 라이브러리에 승격하지 않음)로 그렸다.
  - 새로 만든 효과음 없음(원칙 7) - 기존 `cold_zing`(놀람 리액션)·`realize_ding`(인지 신호)·`hop_thump`(착지/스냅)·`head_whoosh`(스치는 느낌) 4종을 그대로 재사용했다.

## 시각 설계 메모 (오케스트레이터 지시 반영)

- 뇌 내부를 해부도처럼 그리지 않았다 - `ThemedIcon name="brain"`(Tabler 아이콘, 단순 윤곽선)만 쓰고 내부 구조를 추가로 그리지 않았다.
- 신호는 점 무리가 아니라 `NerveSignal`의 굵은 선(strokeWidth 14) 한 줄기 + 이동하는 신호점(dotRadius 20) 하나로만 표현했다(s4).
- 근육 긴장 표시(s2)도 피부 위에 점을 여러 개 찍지 않고, 몸 바깥쪽에 큼직한 볼트 아이콘 3개(각기 다른 시점에 옅어져 사라짐)로만 표현해 "징그럽다" 재발을 막았다.
- 캐릭터가 침대에서 스르륵 잠들다 한 번 크게 움찔하는 동작이 핵심 연출이라, s1(첫 예고성 움찔)과 s5(원인이 설명된 뒤의 클라이맥스 움찔)를 짝으로 두고 s5의 점프 높이(140px)를 s1(90px)보다 크게 줘 "이게 진짜 클라이맥스"임이 프레임 비교로 확인된다(f006 대비 f015/f016).

## 언어별 실측 길이

한국어만 제작(영어 없음).

- 구간별 실측(edge-tts WordBoundary, 프로필 기본값 voice=ko-KR-SunHiNeural/rate+20%/pitch+30Hz): s1 4.464s / s2 3.528s / s3 3.912s / s4 4.296s / s5 2.952s / s6 5.520s / s7 4.296s / s8 5.400s
- 내레이션 합계(s1~s8): 34.368초
- 본편(s1~s8) 총 길이: 36.00초(1080프레임) - 60초 상한 안
- 전체(Intro+TitleCard+본편+Outro): **43.157333초(1293프레임, ffprobe 실측, 1080x1920, 30fps)** - 상세 타임코드는 `02-script-final-ko.md`
- 전 구간(s1~s8)이 3인칭 설명 내레이션이라 원칙 4의 "리액션→설명 확장 여백"(0.5~0.7초) 대상 전환이 없어 전 구간 기본 여백(0.2초)을 동일하게 적용했다.

## 렌더 횟수 (한국어)

2회

1. 1차 렌더 실패 - `Intro`/`Outro`가 내장 참조하는 `audio/intro_ding.mp3`·`audio/outro_ding.mp3`, 그리고 이 화에서 쓰는 `cold_zing.mp3`·`realize_ding.mp3`·`hop_thump.mp3`·`head_whoosh.mp3`를 `public/audio/`에 미리 복사하지 않아 404로 렌더가 중단됨(작업 지시에 명시된 "25화 1차 렌더 실패 원인"과 동일 유형). `assets/audio/`에서 6개 파일을 `public/audio/`로 복사 후 재시도.
2. 2차 렌더(`episode-ko.mp4`) 성공 - 프레임 검수(f001~f026, 8개 구간의 시작/중간/클라이맥스 프레임 + 인트로·타이틀카드·아웃트로) 결과 결함 발견 없이 그대로 채택.

## 발견·수정한 결함

없음. 1차 렌더 실패는 자산 파일 누락(위 렌더 횟수 절 참고)이었고, 코드 로직 결함이 아니었다.

## 기술 검증 (관찰 기록, 한국어만)

렌더 명령은 전부 `scripts/render.mjs`로 실행했고 출력은 `episodes/general-ep29-hypnic-jerk/out/`에만 생성됨을 확인했다(공용 루트 `shortform/out/`에는 쓰지 않음). `precheck.mjs`는 에러 0(경고 1 - 위 무관한 SHAREDOUT)으로 렌더를 진행했다.

- **자막 화면이탈**: f003~f026 전체(8개 구간 시작·중간·클라이맥스 프레임)에서 캡션 박스가 좌우 안전영역(`CAP_SIDE=70`) 안에 들어오는 것을 직접 Read로 확인. 좌우로 잘리는 프레임 없음. 가장 긴 문장(s6 "나무 위에서 자던 조상들이 떨어지지 않으려고 움찔했던 습관이 남은 거라는 얘기도 있어요", 어절 12개)도 `wrapCounts`(ko 20자 상한)로 2줄 이하로 자동 분할되어 화면 안에 들어옴을 f017~f019에서 확인.
- **장면 전환 시 캐릭터 잔상**: `SceneSwitcher`의 크로스페이드(0.2초, 6프레임)는 공용 컴포넌트를 그대로 사용했고, 검수한 각 구간 시작 프레임(f003, f007, f009, f011/f014, f017, f020, f023)에서 이전 장면 요소가 남아있는 사례는 관찰되지 않았다.
- **등장 전 요소가 점처럼 남아있는지**: 아이콘 등장은 전부 `PopIn`(`opacity`+`scale`을 한 div에 결합)으로 처리했다. `scale(0)` 단독 트랩 방식은 쓰지 않았다. S2의 긴장 아이콘(볼트)은 `opacity`만으로 페이드아웃해 등장/퇴장 모두 점 잔상이 없다.
- **라벨이 화면 밖에서 잘리는지**: s3 "위험!"(f010, alert 아이콘 아래), s8 "카페인"/"피로 · 스트레스"(f024, 아이콘 아래) 모두 화면 중앙 근처에 위치하고 `Label`이 기본 `wordBreak: keep-all`을 적용해 잘리지 않음을 확인.
- **요소끼리 겹치는지**: S4(f012/f013)에서 신호 경로·신호점·타깃 볼트 아이콘이 서로 겹치지 않고 순서대로(경로→점 이동→도착 시 볼트) 나타남을 확인. S1/S5/S7(f003~f006, f014~f016, f020~f022, 플래시 정점 f945)에서 캐릭터가 이불 앞판(`Bed layer="front"`)에 자연스럽게 가려지고, S5 클라이맥스(점프 최대 높이, f015/f016)에서도 헤드보드·달 아이콘과 겹치거나 잘리는 부분이 없음을 확인 - **애니메이션 최대 상태 프레임 확인 완료**(원칙 7).
- **화면 아래쪽 여백 과다**: S1/S5/S7(침대 장면)은 이불이 화면 하단을 전부 채우고, S2(근육 이완)·S8(카페인/스트레스)은 캐릭터가 화면 하단~중앙까지 채우며, S3(뇌)·S4(신호)·S6(나무)도 콘텐츠가 화면 중단~하단에 걸쳐 배치되어 하단이 비어 보이는 프레임이 없음을 f003~f026 전체 육안 확인으로 판단.
- **음량**: `ffmpeg -af loudnorm=print_format=summary` 측정 결과 Input Integrated -13.1 LUFS / Input True Peak -1.8 dBTP(클리핑 없음). 효과음 4종(`cold_zing`/`realize_ding`/`hop_thump`/`head_whoosh`)은 각각 재생 프레임 부근 0.5초 구간에서 `astats` Peak level -3.3~-10.8dB로 무음이 아닌 실제 에너지가 있음을 확인했고, Episode.tsx에서 내레이션(volume=1.6)보다 낮은 볼륨(0.75~1.0)으로 믹스되도록 코드에 명시했다(각 mp3 원본 자체도 REGISTRY 기재상 개별 피크 -1.7~-5.6dB로 사전 정규화된 소스). 어느 쪽이 실제로 듣기에 자연스러운지는 청취 판단이 필요해 사용자 확인이 필요하다.
- **자막 스타일**: 프로필(general.md) 폰트 크기(50px)·위치(하단에서 23% 지점)·글자수 상한(20자)을 컴포넌트 수정 없이 공용 `Caption`/`CAPTION_STYLE`/`wrapCounts` 기본값 그대로 사용했으므로 프로필 규칙을 그대로 따름.
- **화면 문자열의 언어별 분기**: 이 화는 한국어판만 제작하므로 ko/en 대조는 해당 없음. 대신 화면에 노출되는 모든 문자열(제목, "위험!", "그런 이야기도 있음", "카페인", "피로 · 스트레스", 다음 편 안내)이 컴포넌트에 하드코딩되지 않고 전부 `src/strings.ts`의 `STRINGS.ko`를 거치는 것을 코드로 확인했다.
- **캐릭터 윤곽선과 배경 대비**: S1/S5/S7(어두운 톤 배경 top=`C.roomDeep`/bottom=`C.room`)에서 캐릭터 기본 스트로크(`C.ink`)가 배경과 명확히 구분됨을 f003~f006, f014~f016, f020~f022, flash_peak에서 확인(배경이 `C.night` 계열만큼 어둡지 않은 실내 톤이라 별도 글로우 처리 없이도 대비가 충분했다). S6(실루엣, `color=accent=C.night`/`fill=C.nightSoft`)은 밝은 하늘~잎 배경(top=`C.sky`/bottom=`C.leaf`) 위에서 명확히 구분됨을 f017/f019에서 확인.

## 배포

- 배포 절대경로: `/home/lee/project/shorts/ko/[29화] 잠들기 직전 몸이 움찔하는 이유.mp4`
- 배포 직후 md5 대조로 원본과 동일함을 확인했고, `episodes/general-ep29-hypnic-jerk/out/episode-ko.mp4`는 삭제했다(`out/frames-ko/`는 검수 근거로 보존).
- 위 관찰 기록까지가 이 보고의 기술적 검증 범위다. "검수 통과"·"합격" 같은 최종판정은 이 보고에 쓰지 않았고, 실제 사용 가능 여부의 최종 판단은 사용자 몫이다.
