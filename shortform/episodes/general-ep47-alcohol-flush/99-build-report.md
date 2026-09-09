# 빌드 보고 - general-ep47-alcohol-flush (술만 마시면 얼굴 빨개지는 이유)

**언어**: 한국어만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시). `episode-en.mp4`는
만들지 않았다.

## 1. 자산 재사용 / 신규

### 재사용 (REGISTRY 대조 후 그대로 사용, 신규 제작 없음)

- `character/Character.tsx` / `character/Actor.tsx`(`Actor`, `BustActor`) - 캐릭터 본체·`blush` prop
- `character/poses.ts`(`POSES.idle`, `POSES.surprised`) - 기본 포즈
- `props/ThemedIcon.tsx` - `glass-full`(술잔), `alert-triangle`(경고), `repeat`(반복/자주), `calendar`(가끔), `equal`(=) 5개 tabler 아이콘
- `scenes/Caption.tsx`(`Caption`, `Label`) - 자막·화면 라벨
- `scenes/TitleCard.tsx`, `brand/Intro.tsx`, `brand/Outro.tsx` - 표준 인트로/제목카드/아웃트로
- `scenes/SceneSwitcher.tsx` - 장면 전환
- `backgrounds/PlainBg.tsx` - 배경
- `anim.ts`(`blendPose`, `breathe`, `buildPeakRelease`, `progress`) - 애니메이션 유틸
- `timeline.ts`(`sceneFrames`, `sceneStarts`, `buildCaptions`, `wrapCounts`, `mouthAt`, `mouthProp`) - 타이밍
- `audio/intro_ding.mp3`, `audio/outro_ding.mp3` - 브랜드 SFX(기존 확정본)
- `audio/sip_slurp.mp3` - "음료를 한 모금 마시는 무성 동작"용 기존 SFX(general-ep23 최초 제작분을 그대로 재사용, 새로 합성하지 않음)

### 신규 제작 (REGISTRY 등록 완료)

- `props/AlcoholBreakdownDiagram.tsx` - "원료 -> 중간 독성 물질 전환(`convertProgress`) + 그 물질을 치우는 효소 게이지(`breakdownProgress`, `enzymeWeak`)" 2단 인과 다이어그램. s3·s4에서 공용으로 재사용(같은 컴포넌트, progress만 다르게 넘김). 분자 구조식 없이 상자·화살표·게이지만 사용(채널 원칙 준수).
- `props/CheekFlushDiagram.tsx` - BustActor 위에 볼 혈관(굵은 곡선 3가닥 x 2볼)을 오버레이하는 얼굴 확장 컴포넌트. 새 얼굴을 그리지 않고 `RIG.BLUSH` 실측 좌표를 그대로 재사용(HeadNerveDiagram과 같은 원칙). `flushProgress` 하나로 blush 수치(1.0->1.5)와 혈관 두께·채도를 동시에 제어.

두 자산 모두 `assets/REGISTRY.md`의 props 표에 등록 완료(기존 행은 건드리지 않고 표 끝에 2행만 추가).

## 2. 타임코드 실측 (한국어, 전체 세부는 `02-script-final-ko.md`)

| 구간 | 실측 길이(초) | 비고 |
|---|---|---|
| s1 | 2.000(무성, 대본 지정 고정값) | 술잔을 들어 한 모금 |
| s2 | 3.120 | 리액션(+32%/+55Hz), s2->s3 전환에 0.6초 추가 여백(원칙 4) |
| s3 | 5.952 | 알코올 -> 아세트알데하이드 |
| s4 | 9.360 | 효소 게이지(약함) |
| s5 | 6.504 | 혈관 확장·홍조 |
| s6 | 6.672 | 자주/가끔 비교 |
| s7 | 6.360 | 결론 |

본편 합계 1248프레임(41.6초). 전체(Intro 69 + TitleCard 54 + 본편 1248 + Outro 90) = **1461프레임 / 48.75초**.
실측 mp4(`ffprobe`): 1461프레임 / 48.746667초 / 1080x1920 / 30fps - 계산값과 정확히 일치.

s2(리액션+훅 질문) 다음이 곧바로 s3(설명)로 이어지는 구조라, 처음엔 균일 0.2초 여백으로 만들었다가
검수 중 원칙 4를 다시 확인해 s2->s3 전환만 0.6초로 늘려 재렌더했다(1449프레임 -> 1461프레임).

## 3. 렌더 횟수

- 정적 검사(`precheck.mjs`): 2회(둘 다 에러 0, 경고는 공용 루트 `out/`의 무관한 타 화 잔여 파일 1건뿐 - 지우지 않고 보고만 함)
- `remotion still` 프리뷰(렌더 전 배치 확인): 다수(약 25장) - 다이어그램 여백 과다, 술잔 위치 어색함 등 결함을 이 단계에서 미리 발견·수정
- 전체 mp4 렌더(`render.mjs ... ko`): **2회**
  - 1차: s2->s3 전환 여백 0.2초 상태로 렌더(1449프레임) - 검수 중 원칙 4 위반 발견
  - 2차(최종): s2->s3 전환 0.6초로 수정 후 재렌더(1461프레임) - 이 버전을 배포

## 4. 검수 체크리스트 (한국어, 관찰 기록)

최종 mp4에서 ffmpeg로 20개 대표 프레임을 추출해 직접 확인했다(인트로 중간, 제목카드, s1 시작/한모금 순간/중간, s1-s2 경계, s2 중간, s2 꼬리(연장 여백), s2-s3 경계, s3 중간, s4 시작, s4 중간, s4 라벨 등장, s5 시작, s5 중간, s5-s6 경계(라벨 최종), s6 중간, s6-s7 경계, s7 중간, 아웃트로).

- [x] **자막 화면이탈**: 20개 프레임 전체에서 좌우 여백(CAP_SIDE) 안에 들어옴을 확인. 가장 긴 문장(s4)도 2줄로 자동 개행되어 잘리지 않음.
- [x] **장면 전환 시 캐릭터 잔상**: s1->s2, s2->s3, s5->s6, s6->s7 경계 프레임을 직접 봤고 이중노출·유령 실루엣 없음. SceneSwitcher 기본 크로스페이드(6프레임)만 적용됨.
- [x] **등장 전 요소가 점처럼 남음**: s3/s4의 AlcoholBreakdownDiagram 게이지·경고 아이콘은 opacity 기반으로 등장/소멸(`iconOpacityB`/`labelOpacityB`), scale-0 아티팩트 없음을 프레임으로 확인.
- [x] **라벨이 화면 밖에서 잘림**: s4("효소가 약한 사람 많음"), s5("혈관이 넓어짐"), s6("마시는 양과 무관"/"자주 마심"/"가끔 마심") 전부 화면 안에 완전히 들어옴.
- [x] **요소끼리 겹침**: s6의 두 캐릭터 + 아이콘 + "=" + 라벨 배치를 프레임으로 확인, 겹침 없음. s4의 게이지도 상자 아래 여유 있게 배치되어 겹치지 않음.
- [x] **화면 하단 여백 과다**: s3/s4 다이어그램이 원래 폭(760px)일 때 상하 여백이 과도해(f_375.png 실측) 폭을 1000px로 키우고 위치를 재조정한 뒤 재확인함(체크리스트 16번, 27·33·35·40·42·43화와 같은 유형 재발 방지).
- [x] **음량**: `loudnorm` 측정 Input Integrated -13.5 LUFS / True Peak -2.0 dBTP - 클리핑 없음. sip_slurp SFX(raw peak -3.3dB, volume=0.9)가 내레이션(raw peak -3.6~-3.8dB, volume=1.6) 대비 믹스 후 더 조용함을 확인(원칙 7).
- [x] **자막 스타일**: `CAPTION_STYLE`(공용 테마) 그대로 사용, 폰트·크기·위치 커스터마이즈 없음.
- [x] **화면 문자열 언어별 분기**: 한국어 채널만 제작하므로 영어 프레임 대조는 해당 없음. 화면에 노출되는 모든 문자열(제목·s3 독성물질명·s4/s5/s6 라벨·s6 빈도명·아웃트로 문구)이 `strings.ts`의 `STRINGS.ko`에서 온다(컴포넌트 하드코딩 없음, `AlcoholBreakdownDiagram`의 `toxicLabel`도 prop으로 주입).
- [x] **캐릭터 윤곽선과 배경 대비**: 전 장면이 밝은 파스텔 배경(room/sky/coralSoft/leaf)이라 `C.ink` 기본 스트로크로 충분히 구분됨을 프레임으로 확인. 어두운 배경(`C.night` 계열) 사용 없음.

### 이 화 고유 시각 주의사항 확인

- 얼굴 붉어짐: `CheekFlushDiagram`으로 blush 수치(1.0->1.5) 연속 보간 + 볼마다 굵은 곡선 3가닥(점 무리 없음)만 사용. s5/s7 프레임에서 과하게 우스꽝스럽거나 불쾌하지 않음을 확인.
- 분해 과정: `AlcoholBreakdownDiagram`이 상자 2개 + 화살표 + 게이지만 사용, 분자 구조식 없음.
- 술: 잔 1개(`glass-full` 아이콘)만 등장, s1 전체 및 s3의 원료 상자 아이콘 포함해도 병 여러 개 없음.
- 혈관: `FingerCrossSection` 같은 사실적 단면 대신 굵은 곡선 3가닥짜리 오버레이만 사용.

### 프로필(general) 추가 체크

- `profiles/general.md` 확인 결과 이 화에 적용할 별도 "검수 추가 체크" 섹션은 공통 체크리스트로 충분(자막 글자수 상한은 `wrapCounts` 공용 함수를 그대로 사용, 로컬 재정의 없음).

## 5. 배포

기술 점검(위 체크리스트) 통과 후 즉시 배포 완료.

- 배포 경로: `/home/lee/project/shorts/ko/[47화] 술만 마시면 얼굴 빨개지는 이유.mp4`
- md5 대조: `out/episode-ko.mp4`와 배포본 일치 확인 후 `out/episode-ko.mp4` 삭제(정책에 따름, `out/frames-ko/`는 보존)
- 실측 재생시간: 48.746667초(1461프레임, 30fps, 1080x1920)

## 6. 하지 않은 것 확인

- 영어판 렌더 없음(오케스트레이터 명시 지시)
- 대본 문장 수정 없음
- 길이를 채우기 위한 장면 연장·배속 조정 없음
- em-dash 미사용
