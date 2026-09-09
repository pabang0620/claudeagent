# 23화 빌드 보고 - 커피 마시면 잠이 깨는 이유

한국어판만 제작(영어 채널 Whymo 운영 중단, 대본에도 한국어만 존재).

## 자산

### 재사용(기존 REGISTRY 자산 그대로)
- `character/Actor.tsx`(`Actor`, `BustActor`) - idle/yawn/surprised 포즈 블렌드
- `character/poses.ts` - `POSES.idle` `POSES.yawn` `POSES.surprised`
- `scenes/Caption.tsx`(`Caption`)
- `scenes/PopIn.tsx`(`PopIn`) - 커피 아이콘·QMark·X마크 팝인
- `scenes/Effects.tsx`(`PulseRing`)
- `scenes/NerveSignal.tsx`(`NerveSignal`) - s5 "신호가 막힘" 연출(bow=0 직선 경로로 사용)
- `props/ThemedIcon.tsx`(`ThemedIcon`) - `coffee` `brain` `x` 아이콘(전부 tabler-cache.json에 이미 캐시돼 있어 sync-icons 불필요했음)
- `props/Symbols.tsx`(`QMark`)
- `backgrounds/PlainBg.tsx`
- `brand/Intro.tsx` `brand/Outro.tsx` `scenes/TitleCard.tsx`
- `assets/anim.ts`(`blendPose` `buildPeakRelease` `clamp01` `progress`)
- `assets/timeline.ts`(`sceneFrames` `sceneStarts` `buildCaptions` `wrapCounts` `mouthAt` `mouthProp`)
- 오디오: `yawn_sigh.mp3`(general-ep21) `realize_ding.mp3`(general-ep02) `ui_tap.mp3`(general-ep03) `bubble_pop.mp3`(general-ep18) `intro_ding.mp3` `outro_ding.mp3`(공용 브랜드)

### 신규 제작 + REGISTRY 등록
- `props/CaffeineReceptorDiagram.tsx`(신규 소품) - "모양이 비슷한 두 분자가 하나의 결합 자리를 두고 경쟁한다"는 경쟁적 결합(competitive binding) 구조를 보여주는 범용 다이어그램. `dockProgress`/`blockProgress`/`releaseProgress` 3개 독립 진행도. `assets/props/index.ts` export 추가 완료, `assets/REGISTRY.md` "4. 소품" 절에 등록 완료(다음 화 재사용 가능 - 약물 길항작용·효소 억제 등)
- `assets/audio/sip_slurp.mp3`(신규 효과음) - 음료를 한 모금 마시는 짧은 "훌쩍" 소리. ffmpeg lavfi 합성(pink noise bandpass + 하강 처프), 0.30초, 실측 피크 -3.3dB. `assets/REGISTRY.md` "7. 오디오" 절에 등록 완료(음료를 마시는 무성 동작 전반 재사용 가능)

재사용 12건(자산 9종+오디오 4종 기존분), 신규 2건(다이어그램 1 + 오디오 1). 둘 다 REGISTRY 등록 완료.

## 실측 길이 (한국어, TTS 실측)

| 구간 | 실측 길이 | 여백 | 프레임 |
|---|---|---|---|
| s1(무성) | 3.000s(고정, 애니메이션 길이) | 0 | 90F |
| s2 | 4.008s | 0.6s | 138F |
| s3 | 6.144s | 0.2s | 190F |
| s4 | 5.640s | 0.2s | 175F |
| s5 | 5.376s | 0.2s | 167F |
| s6 | 4.728s | 0.2s | 148F |
| s7 | 5.664s | 0.2s | 176F |

본편 합계 1084F(36.13s). Intro(69F)+TitleCard(54F)+본편(1084F)+Outro(90F) = 1297F.
ffprobe 실측 총 재생시간 **43.285초**(30fps, 1297프레임 정확히 일치). 60초 상한 대비 여유 있음 - 늘리지 않고 실측 그대로 반영했다.

## 리액션 톤 분리

s2("어, 커피 마시니까 잠이 확 깨네. 왜 이러지?")는 리액션+훅 질문이라 프로필 기본값(rate +20%/pitch +30Hz)보다 확실히 높인 rate +32%/pitch +55Hz로 별도 합성(ep19 s2와 동일 수치 재사용). 나머지 설명 구간(s3~s7)은 프로필 기본값 그대로.

## 전환 여백

s2(리액션+훅 질문) -> s3(설명) 전환만 0.6초로 확장(원칙 4의 5번). 다른 전환은 기본 0.2초.

## 무성 구간 SFX (원칙 7)

- s1: 하품 정점(프레임 29, 로컬)에 `yawn_sigh.mp3`(volume 0.75), 커피를 마시는 정점(프레임 75, 로컬)에 `sip_slurp.mp3`(volume 0.8, 신규)
- s2: "확 깨네"를 말하는 순간(어절 "확" 시작 1.613s ≈ 프레임 48)에 `realize_ding.mp3`(volume 0.7)
- s4: 카페인이 자리에 완전히 정착하는 순간(프레임 120, 로컬)에 `ui_tap.mp3`(volume 0.6) - "딱 들어맞는" 클릭감
- s5: 신호가 막혀 X 표시가 뜨는 순간(프레임 50, 로컬)에 `bubble_pop.mp3`(volume 0.65) - "차단됨" 팝

전부 내레이션(volume 1.6)보다 낮은 볼륨으로 배치. ffmpeg 구간별 volumedetect 실측(v2 최종본 기준):
- 5.06s(s1 yawn 정점) mean -18.8dB / max -10.1dB (기준 무음 구간 3.0s는 mean -91.0dB - 명확한 대비)
- 6.6s(s1 sip 정점) mean -18.8dB / max -8.3dB
- 8.7s(s2 realize) mean -14.8dB / max -2.0dB
- 22.03s(s4 ui_tap) mean -15.1dB / max -2.3dB
- 25.53s(s5 bubble_pop) mean -16.4dB / max -5.1dB

전체 믹스: Input Integrated -13.9 LUFS / True Peak -2.0 dBTP(클리핑 없음).

## 시각 설계 - 경쟁적 결합(competitive binding) 표현

과거 "징그럽다" 피드백(ep08 소름 점 표현)을 피하기 위해, 아데노신·카페인 분자를 전부 "큰 원 2개"(주 원 + 작은 결합 돌기)로만 구성했다. 두 분자는 **같은 도형 함수**(`moleculeGroup`)를 색만 바꿔(아데노신=gold, 카페인=coral) 재사용해 "모양이 비슷하다"는 대본 서술을 시각적으로 직접 보여준다. 작은 점·알갱이를 여러 개 찍는 표현은 전혀 쓰지 않았다.

s3~s5·s7은 같은 화면 좌표(x=160, y=560, width=760)에 `CaffeineReceptorDiagram`을 그려 "같은 수용체 자리"라는 연속성을 유지했다 - 프레임 검수(f013)에서 이 연속성이 실제로 관찰됨(s3 끝 상태 그대로 s4가 시작).

**렌더 중 발견 및 수정한 결함**: v1 렌더 프레임 검수에서 s7(f021, 로컬 프레임 8) 시작 시점에 수용체 소켓이 순간적으로 완전히 빈 상태(점선 원)로 보이는 결함을 발견했다 - `releaseProgress`가 0.001을 넘기 전까지는 컴포넌트가 기본값(dockProgress=0, blockProgress=0)으로 렌더링되어, s5 종료 시점(카페인이 자리를 차지한 상태)과 s7 시작 사이에 시각적 불연속(깜빡임)이 생겼다. `S7Rush` 씬에서 `dockProgress={1} blockProgress={1}`을 기준선으로 명시해 이 결함을 수정했다(v2). 두 상태의 카페인 렌더 좌표·불투명도가 수학적으로 동일해 이음매 없이 이어짐을 재렌더 프레임(f004, frame 1046)으로 확인했다.

## 검수 체크리스트 (관찰 기록)

- [x] **자막 화면이탈**: 전체 캡션 프레임(f003·f007·f008·f009·f011·f012·f014·f015·f016~f020 등)에서 자막 박스가 좌우 여백(CAP_SIDE=70px) 안에 있음을 확인. 가장 긴 s3 첫 줄("우리 뇌에는 활동할수록 아데노신이라는") 포함 전 구간 이탈 없음
- [x] **장면 전환 캐릭터 잔상**: SceneSwitcher 크로스페이드 구간(각 구간 시작+8프레임 지점, f003·f010·f013·f016·f019·f021)을 확인. 이전 장면 요소가 남아 보이는 잔상 없음
- [x] **PopIn 등장 전 요소 잔상(중간 프레임)**: PopIn을 쓰는 요소(s1 커피컵, s2 커피아이콘·QMark, s5 X마크)의 등장 시작+5~10프레임 지점(f005·f007·f009·f018)을 확인. `PopIn`이 position+opacity+transform을 한 div에 결합하는 안전한 헬퍼라 과거 `Appear` 결함(REGISTRY 4절 경고)이 재현되지 않음을 확인
- [x] **라벨 화면 밖 잘림**: s3 라벨 "아데노신"(f012), s4 라벨 "카페인"(f015) 둘 다 화면 중앙(x=540)에 위치, 잘림 없음
- [x] **요소 겹침**: s2에서 QMark(x=230)·커피아이콘(x=800)·BustActor(left=160~920) 상호 겹침 없음(f007~f009). s5에서 브레인 아이콘(y=245~415)·수용체 다이어그램(y=560~1236)·X마크(y≈555) 사이 겹침 없음(f016~f018)
- [x] **화면 아래쪽 여백 과다**: 전 장면에서 자막 박스가 화면 하단(bottom=300px 기준)에 앵커되고, 캐릭터/다이어그램이 화면 중앙~중상단을 채움(예: s3~s5·s7 다이어그램은 y=560~1236으로 세로 중앙을 관통). 다른 화(ep19·ep21 등)와 동일한 레이아웃 관례를 따름
- [x] **음량**: Input Integrated -13.9 LUFS, True Peak -2.0dBTP(클리핑 없음). SFX 5건 전부 무음 구간 대비(-91.0dB) 명확한 dB 상승 확인(위 표)
- [x] **자막 스타일**: 프로필(general) 기본값(`CAPTION_STYLE`, 하단 23%, 폭 50px, 흰 글자+검은 외곽선) 그대로 사용, 프로필 로컬 오버라이드 없음
- [x] **화면 문구 언어 분기**: 이 화는 한국어만 제작하므로 언어 대조는 해당 없음. 모든 화면 문구(제목·s3Label·s4Label·아웃트로 문구)는 `strings.ts`의 `STRINGS.ko`에서만 읽고 컴포넌트에 하드코딩하지 않음(코드 검토로 확인)
- [x] **캐릭터 윤곽선-배경 대비**: 배경이 전 구간 밝은 `PlainBg`(C.sky~paper)라 기본 `C.ink` 스트로크가 명확히 대비됨. 어두운 배경(NightSkyBg 등) 미사용

### 프로필(general) 추가 체크
- [x] 소재가 "겪어봤지만 검색까진 안 해본 사소한 궁금증"인가 - 커피 마시고 잠 깨는 경험은 일상적, 아데노신·수용체 원리는 검색까진 안 해봤을 개념
- [x] 어미가 친근한 대화체("~거든요", "~것 같아요") 유지 - 대본 문장 확인(빌더는 대본을 고치지 않음, planner 확정본 그대로 TTS)
- [x] 전문용어("아데노신", "카페인 분자", "수용체" - 화면 라벨/자막에만 등장) 등장 시 바로 풀이됨 - s3 "아데노신이라는 물질이 쌓이는데, 이게 쌓일수록 졸리다고 느껴져요"
- [x] 자막 한 줄 20자(한국어) 상한 - `wrapCounts` 그대로 사용, f008/f012 등에서 줄바꿈 정상 확인(예: "어 커피 마시니까 잠이 확 깨네 왜" / "이러지?" 2줄 분리)
- [x] 60초 상한 - 43.285초로 여유 있음

## 렌더 횟수

한국어 2회(v1: 렌더 성공했으나 프레임 검수에서 s7 연속성 결함 발견 -> 코드 수정 -> v2: 재렌더로 결함 해결 확인).

## 배포

기술 검증(길이·음성 싱크·자막 잘림·PopIn 중간 프레임 포함) 통과 확인 후 즉시 배포 완료.

- 배포 경로: `/home/lee/project/shorts/ko/[23화] 커피 마시면 잠이 깨는 이유.mp4`
- md5 대조: 렌더 산출물과 배포본 일치 확인(`a48fc40ff2390e3bc6af3ad0c70ea2d1`)
- 실측 재생시간: 43.285초 / 1297프레임(30fps) / 1080x1920
- 배포 후 `out/`의 mp4 전부 삭제 완료(`frames-ko/`는 검수 기록으로 보존, `frames-ko-v2/`는 확인 후 정리)

위 사실들을 확인했습니다. 최종 합격 여부는 사용자 확인 부탁드립니다.
