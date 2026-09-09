# 84화 빌드 보고 - 코가 막히면 음식 맛이 안 느껴지는 이유

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시 2026-09-02).

83화(`general-ep83-cloudy-ice`)가 다른 세션에서 동시 렌더 중이었다. `REGISTRY.md`·`assets/props/index.ts`는
기존 줄을 건드리지 않고 파일 끝(추록 절)에만 추가했고, `episodes/README.md`는 건드리지 않았다.
`scripts/icons.txt`·`assets/props/tabler-cache.json`에 `cherry` 아이콘 1개만 추가(append)했다 - 84화
전용 신규 아이콘.

## 자산

### 재사용 (신규 제작 없이 REGISTRY에서 가져다 씀)
- `character/Actor`(`Actor`/`BustActor`), `character/poses`(idle, surprised, pointUp, touchForehead - `blendPose`로 보간)
- `backgrounds/PlainBg`
- `scenes/Card`의 `Card`/`CardGrid` - s3·s4·s7 다섯 미각 아이콘 그리드. **ep13(`general-ep13-spicy-not-taste`)과 동일한 아이콘 조합**(candy=단맛/salt=짠맛/lemon-2=신맛/coffee=쓴맛/meat=감칠맛)을 그대로 재사용 - REGISTRY 확인 결과 이 다섯 아이콘 선택 자체가 이미 확정된 관례라 신규 소품 아님
- `scenes/Caption`, `Label`
- `props/ThemedIcon`(candy/salt/lemon-2/coffee/meat/x/cherry - cherry만 신규 캐시 추가)
- `props/Symbols`의 `QMark` - s8 confusion 표시
- `props/HeadNerveDiagram`의 `MOUTH_PT` - 새 SmellTasteDiagram의 입 앵커로 재사용(새 좌표 안 지어냄)
- `props/CilantroDiagram`의 `NOSE_PT` - 새 SmellTasteDiagram의 코 앵커 + s8의 "코 막힘" 배지 위치로 재사용
- `assets/audio`의 `bite.mp3`(s1 한 입 먹기 + s8 사탕 물기, 재사용 범위에 이미 "음식·씹기 소재 전반" 명시), `sniff_snort.mp3`(s1 훌쩍임 - 원래 개 킁킁용이지만 "동물 킁킁·냄새 맡기 동작 전반 재사용 가능"으로 등록돼 있어 사람 훌쩍임에도 일반화해 재사용), `intro_ding.mp3`, `outro_ding.mp3` - 전부 기존 화에서 검증된 파일 그대로, 새 SFX 합성 없음

### 32화(`general-ep32-cilantro-soap`) 자산 재사용 검토 결과 (오케스트레이터 지시 사항)
- `CilantroDiagram`: "두 화합물의 화학 구조를 나란히 놓고 비교"하는 다이어그램이라 이 화의 "입-코 경로"와는 구조가 달라 그대로 쓸 수 없었다. 대신 이 파일이 export하는 `NOSE_PT`(코 위치 앵커)만 좌표로 재사용.
- `NoseGlowOverlay`: "같은 자극에 대한 코 반응 세기"를 글로우로 보여주는 오버레이라 "경로가 이어지다 끊긴다"는 이 화의 핵심 구조를 표현할 수 없어 재사용 불가 - 대신 이 컴포넌트가 세운 원칙(BustActor 위에 오버레이만, 새 얼굴 안 그림)만 계승.
- 결론: 32화 자산은 좌표(`NOSE_PT`)만 재사용하고, 다이어그램 자체는 새로 만들었다(사유는 REGISTRY 등록 문구에도 명시).

### 신규 제작
- `assets/props/SmellTasteDiagram.tsx` (`SmellTasteDiagram`, `SMELL_TASTE_BREAK_PT`) - 입에서 목구멍 뒤쪽을 타고 코로 올라가는 경로 오버레이. `pathwayProgress`(0~1, 경로 리빌+이동 신호점)와 `blocked`(0~1, 고정 지점에서 경로가 끊기는 정도)를 독립 진행도로 받는다. **REGISTRY.md·`assets/props/index.ts` 양쪽에 등록 완료**(둘 다 append-only로 파일 끝에 추가, 기존 줄 미변경 확인).
  - 스틸 선점검 중 발견해 수정한 것: 처음엔 경로 차단 지점(`BREAK_T`)을 0.62(코 진입부 근처)로 잡았는데, 그 지점이 왼쪽 눈과 너무 가까워(실측 거리 약 48px < X 배지 반경 34px + 눈 반경) 렌더된 스틸에서 X 표시 배지가 눈을 가리는 것을 확인했다. `BREAK_T`를 0.35(뺨 아래 빈 공간, 눈·입 어느 것과도 안 겹침)로 옮겨 해결했다.

## 언어별 실측 길이 (한국어만)

`02-script-final-ko.md` 참고. 요약: 내레이션 실측 합계 40.176s, 최종 mp4 실측 재생시간 **51.754667초** (1551프레임/30fps), 60초 상한 이내. 하한을 채우지 않았고(45~52초대가 자연스러운 길이), 늘리지 않았다.

## 렌더 횟수 및 경위

**한국어 2회 렌더.**

1. 1차 렌더(`episode-ko.mp4`) 후 렌더 전 스틸 선점검·최종 mp4 프레임 검수 중 두 가지 결함을 발견해 수정하고 2차 렌더(`episode-ko-v2.mp4`)를 진행했다. 최종 배포본은 v2다.

### 스틸 선점검(렌더 전)에서 잡은 결함
- **`SmellTasteDiagram`의 X 표시(코 막힘 배지)가 왼쪽 눈과 겹침** (`BREAK_T=0.62` -> `0.35`로 수정). `remotion still`로 s6(코 막힘) 장면의 근접 완성 프레임을 미리 뽑아보다가 발견했다 - 실제 mp4를 렌더하기 전이라 재렌더 비용 없이 고쳤다.

### 렌더 후(최종 mp4)에야 발견한 결함
- **S3->S4 장면 전환(크로스페이드) 프레임에서 미각 카드 그리드가 두 개로 겹쳐 보임.** S3·S7(캐릭터 없음)은 그리드를 y=680으로, S4(캐릭터가 그리드 아래에 서는 구도)는 y=220으로 서로 다르게 둔 것이 원인 - SceneSwitcher의 6~8프레임 크로스페이드 구간에서 두 위치의 그리드가 동시에 반투명하게 겹쳐 그려졌다. 최종 mp4에서 S4 시작 직후 프레임(전환 구간)을 실측 확인하다가 발견했고, 렌더 전 스틸 선점검 때는 각 장면을 "정착 상태"로만 뽑아 이 전환 프레임 자체를 보지 않아 놓쳤다. 세 장면(S3·S4·S7) 모두 그리드 y를 320으로 통일하고, S4의 `Actor` 크기를 540->500으로 줄여 그리드 아래 여유 공간을 확보해 해결했다(재렌더로 겹침 소멸 확인).
- 참고: S1->S2 전환에서 idle(팔 내림) -> surprised(팔 위로) 포즈가 바뀌며 팔 위치의 옅은 잔상이 크로스페이드 프레임 한 장에 보이는 것도 관찰했으나, 이건 SceneSwitcher의 의도된 크로스페이드 동작(6프레임=0.2초)이 다른 포즈로 넘어가며 자연스럽게 나타나는 것이라 별도 결함으로 처리하지 않았다(ep81 빌드 보고서의 동일 판단과 같은 기준).

## 검수 체크리스트 (관찰 기록, 최종 mp4 `episode-ko-v2.mp4` 기준)

- [x] **자막이 화면 밖으로 나가지 않는가**: f001~f020(인트로/타이틀카드/전 장면 시작+중간/아웃트로/마지막 프레임) 전체 확인 - 모든 자막이 좌우 안전영역(`CAP_SIDE=70`) 안에 들어오고, 2줄로 넘칠 때도 `wordBreak: keep-all`로 어절 단위 줄바꿈됨(예: f002 타이틀카드 "코가 막히면 음식 맛이 안 / 느껴지는 이유", f011 "딸기맛이나 커피맛처럼 구체적인 / 풍미는").
- [x] **장면 전환 시 캐릭터 잔상**: 전 장면 전환 지점(s1->s2, s2->s3, ..., s7->s8)의 crossfade 프레임을 실측 확인. S3->S4에서 그리드 이중 노출 결함을 발견해 수정(위 "렌더 후 발견" 절 참고, 재수정 후 f009로 재확인해 단일 그리드만 보임을 확인). S1->S2의 포즈 전환 잔상은 SceneSwitcher 설계상 정상 크로스페이드로 판단.
- [x] **등장 전 요소가 점처럼 남아있지 않은가**: `SmellTasteDiagram`의 경로·신호점·X 배지, `CardGrid`의 카드, s8의 candy/nose-block 배지/QMark 전부 `opacity`/`Card`의 progress prop으로 처리(scale-0 트랩 없음). f011(s5 시작 직후, pathwayProgress≈0.02)에서 경로가 입 근처에 아주 작은 점으로만 보이고 화면 다른 곳에 잔점이 없음을 확인.
- [x] **라벨이 화면 밖에서 잘리지 않는가**: s3/s4/s7 카드 라벨(단맛/짠맛/신맛/쓴맛/감칠맛) 전부 카드 안에 들어옴(f008, f010, f016 확인). `SmellTasteDiagram`의 X 배지는 수정 후 눈·입과 겹치지 않음(f013, f014 확인).
- [x] **요소끼리 겹치지 않는가**: 위 그리드 이중노출 결함과 X-배지/눈 겹침 결함, 둘 다 발견해 수정 완료. s8의 candy 아이콘·nose-block 배지·QMark가 서로 겹치지 않음을 f017(candy 표시 구간, local f≈183/abs 1342), f018(QMark 구간, abs 1372)에서 확인.
- [x] **화면 아래쪽 여백이 과다하지 않은가**: 1차 스틸에서 S3(그리드만 y=220)의 그리드-자막 사이 빈 공간이 과도한 것을 발견해 y=680으로 내렸다가, 위 이중노출 결함 수정 과정에서 S3/S4/S7 공통 y=320으로 재조정했다. 이 값은 220보다는 채워지지만 680만큼 꽉 차지는 않는 절충안이다(그리드 하단~자막 사이 약 630px 여백 잔존, f008/f016 관찰) - 과도하다고 판단하면 다음 화에서 더 조정할 여지 있음.
- [x] **음량이 충분한가**: `ffmpeg loudnorm` 실측 Input Integrated -13.9 LUFS / Input True Peak -1.9 dBTP(클리핑 없음, 다른 화들과 유사 범위).
- [x] **자막이 프로필 스타일(폰트·크기·위치)을 따르는가**: `assets/scenes/Caption.tsx`·`assets/theme.ts`의 `CAPTION_STYLE`/`FS.caption` 그대로 사용, 컴포넌트에 하드코딩 없음.
- [x] **캐릭터 윤곽선이 배경과 명확히 구분되는가**: 전 장면이 밝은 배경(`C.sky`/`C.room`/`C.paper`)이라 기본 `C.ink` 스트로크로 충분(어두운 배경 없음, override 불필요).
- 영어판 없음(원칙 6 예외 - Whymo 운영 중단) - 언어별 이중검수 대상 아님.

### 원칙 7(무성 구간·핵심 액션 SFX) 체크
- s1(무성): sniff_snort(f≈4.17s), bite(f≈5.23s) 배치 확인. 최종 mp4에서 각 타임스탬프 0.35초 구간의 `volumedetect` mean이 -26.8dB/-22.7dB로 직전 무음 구간(-91.0dB mean)보다 뚜렷이 높음을 실측 확인.
- s8(사탕 물기, 핵심 액션): bite 재사용, f≈45.73s. 같은 방식으로 mean -14.4dB(무음 대비 확연한 에너지) 실측 확인.
- SFX 개별 피크(볼륨 배율 적용) vs 내레이션 개별 피크(볼륨 1.6 적용) 비교: 내레이션 -0.3~0.0dB > SFX(sniff -10.4dB, bite@0.85 -3.8dB, bite@0.8 -4.3dB) - 전부 SFX가 내레이션보다 낮음 확인.

## 배포

기술 점검(위 체크리스트)을 통과해 즉시 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[84화] 코가 막히면 음식 맛이 안 느껴지는 이유.mp4`
- 배포 후 md5 대조 완료(일치), `episodes/general-ep84-stuffy-nose-taste/out/`의 mp4(`episode-ko.mp4`, `episode-ko-v2.mp4`) 둘 다 삭제. `out/frames-ko/`(검수 프레임)·`out/stills/`(선점검 스틸)는 보존.

이렇게 나왔습니다. 확인해주세요.
