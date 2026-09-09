# 33화 빌드 보고 - 강물은 안 짠데 바닷물만 짠 이유

한국어판만 제작(영어 채널 Whymo 운영 중단, 오케스트레이터 명시 지시 2026-09-02).

## 자산

### 재사용 (신규 제작 없이 REGISTRY에서 가져다 씀)
- `character/Actor`, `character/BustActor`, `character/poses`(idle, crouch, touchForehead)
- `backgrounds/OceanBg`(s1, s2, s8 - s8은 waterTop/waterDeep/skyColor 팔레트만 override해 사해로 재사용)
- `backgrounds/PlainBg`
- `scenes/Caption`, `scenes/Label`(미사용), `scenes/Counter`의 `CountUp`(s7 "약 40억 년")
- `assets/audio`의 `water_splash.mp3`(s1 손이 물에 닿는 순간), `sip_slurp.mp3`(s1 손이 입에 닿는 순간), `intro_ding.mp3`, `outro_ding.mp3` - 전부 기존 화에서 검증된 파일 그대로 재사용, 새 SFX 합성 없음

### 신규 제작
- `assets/props/SaltCycleDiagram.tsx` - "물질이 빗물에 조금씩 녹아 나와 강물을 타고 이동한 뒤, 도착지에서 물만 빠져나가고 남은 물질이 시간이 지나며 계속 쌓인다"는 순환+선택적 축적 구조를 보여주는 범용 다이어그램. `dissolveProgress`/`releaseProgress`/`riverFlowProgress`/`evapProgress`/`accumProgress` 5개의 독립 progress를 받는다(대본이 지정한 3개 - dissolveProgress/riverFlowProgress/evapProgress - 에 releaseProgress·accumProgress 2개를 추가해 s4·s7의 별도 서사를 커버). **REGISTRY.md에 등록 완료**(공용 props 섹션, `SALT_VB_W`/`SALT_VB_H` 포함 export).

REGISTRY.md·props/index.ts는 기존 내용을 건드리지 않고 파일 끝에 새 항목만 추가했다(다른 화 동시 작업 중이라 append-only로 진행).

## 언어별 실측 길이 (한국어만)

| 구간 | 실측 발화 길이 |
|---|---|
| s2 | 4.992s |
| s3 | 4.800s |
| s4 | 3.864s |
| s5 | 3.528s |
| s6 | 5.904s |
| s7 | 4.296s |
| s8 | 7.176s |
| 내레이션 합계 | 30.564s |

전체 영상(Intro+TitleCard+본편+Outro): **45.717초**(ffprobe 실측, 1370프레임 @ 30fps). 상세 타임코드는 `02-script-final-ko.md` 참고. 영어판이 없으므로 언어 간 길이 비교는 해당 없음.

## 렌더 횟수

- 정지 프레임(remotion still) 프리뷰: 다이어그램 좌표·캐릭터 포즈 검증용으로 다수 회 (전체 mp4 렌더는 아님, 비용 낮은 반복)
- 전체 mp4 렌더: **1회** (첫 시도는 `intro_ding.mp3`/`outro_ding.mp3`를 `public/audio/`에 복사하지 않아 404로 실패 - 두 파일 복사 후 재렌더해서 성공. precheck.mjs 통과 후 진행했으므로 코드 결함은 아니었다)

## 검수 체크리스트 (관찰 기록)

- **자막 화면이탈**: `out/frames-ko/`에서 추출한 16개 대표 프레임(각 구간 시작+2프레임, 중간 지점) + Intro/TitleCard/Outro 3프레임, 총 19프레임을 Read로 직접 확인. 모든 자막 알약(pill)이 좌우 여백을 두고 화면 안에 들어온다. s7 CountUp("약 40억 년")도 폭 560px 고정+`whiteSpace:nowrap`으로 줄바꿈 없이 한 줄에 표시됨을 확인.
- **장면 전환 시 캐릭터 잔상**: f003(frame191, s1→s2 전환 직후)·f005(frame359, s2→s3 전환 직후)에서 SceneSwitcher의 의도된 크로스페이드(겹침 6프레임)만 관찰됨 - 별도의 비정상 잔상(예상치 못한 요소가 남는 것)은 없음.
- **등장 전 요소가 점처럼 남음**: SaltCycleDiagram의 모든 팝인 요소(소금 다이아몬드·크리스털·증발 화살표)는 `appear`/`opacity` 기반으로 구현했고(scale 0 방치 없음), f006~f014에서 진행도 0인 요소가 화면에 점으로 남아있는 경우를 확인하지 못했다.
- **라벨이 화면 밖에서 잘림**: CountUp(s7)이 화면 밖으로 나가지 않음(f013·f014에서 확인). 다이어그램 자체에는 텍스트 라벨이 없음(화면 문구는 s7의 CountUp 하나뿐).
- **요소끼리 겹침**: f014(frame992, accumProgress 최대 근접)에서 소금 더미(mound) 크리스털 3개가 sea rect 하단 경계 안에 들어오고 서로 겹치지 않음을 확인. f016(s8)에서도 크리스털 3개가 서로 겹치지 않고 배치됨을 확인.
- **화면 아래쪽 여백 과다**: 1차 렌더(스틸 프리뷰) 시 다이어그램 폭 560px 기준으로 하단에 약 300px 이상의 빈 공간이 발견되어, 폭을 660px로 키우고 y좌표를 260→190으로 낮춰 재조정했다(수정 후 스틸로 재확인, f420/f700/f990 v2). 최종 mp4의 f006~f014에서 다이어그램이 화면 상단~중하단까지 고르게 채우는 것을 확인.
- **음량**: `ffmpeg -af loudnorm=print_format=summary` 실측 - Input Integrated -14.0 LUFS / Input True Peak -2.1 dBTP. 조용하지 않다.
- **자막 스타일**: 프로필(`general`) 표준 `Caption` 컴포넌트를 그대로 사용, 별도 폰트·크기 오버라이드 없음.
- **화면 텍스트 언어 분기**: 한국어판만 제작하므로 언어 간 대조는 해당 없음. `strings.ts`를 거치지 않고 하드코딩된 화면 문구가 있는지 코드를 직접 훑어 확인 - S7Accumulate의 CountUp `prefix`/`suffix`는 `strings.ts`(`s7Prefix`/`s7Suffix`)에서 props로 전달받아 컴포넌트에 하드코딩하지 않았다.
- **캐릭터 윤곽선 vs 배경 대비**: 배경이 전부 밝은 톤(`C.sky`/`C.seaTop`/`C.paper`/`C.hillFar`)이라 기본 `C.ink` 스트로크로 충분히 구분됨(어두운 배경 없음, 글로우 오버레이 불필요).
- **SFX 타이밍 객관 검증**: `ffmpeg volumedetect`로 t=4.0s(스플래시 전, s1 무성 구간)에서 mean/max -91dB(완전 무음) 확인, t=4.7s(스플래시 예정 지점)에서 max -8.8dB로 뚜렷한 에너지 상승 확인, t=5.05s(감쇠 구간)에서 다시 -35dB로 낮아짐 확인, t=5.8s(sip 예정 지점)에서 max -8.3dB로 재상승 확인. 두 SFX 모두 내레이션 트랙 피크(t=6.5~10.5s 구간 max -2.8dB)보다 낮다(-8.8dB, -8.3dB < -2.8dB) - 원칙 7의 "효과음이 내레이션보다 작아야 한다" 요건 충족을 수치로 확인.

이 체크리스트는 관찰된 사실까지만 기록한 것이며, 최종 합격 판정은 사용자 몫이다.

## 배포

기술 점검(위 체크리스트)을 통과해 즉시 배포했다.

- 배포 경로: `/home/lee/project/shorts/ko/[33화] 강물은 안 짠데 바닷물만 짠 이유.mp4`
- md5 대조: 렌더 산출물과 배포본 md5 일치 확인(`1391856dba8cc2f7db2a09e3c0338bc5`)
- 배포 후 `episodes/general-ep33-salty-sea/out/episode-ko.mp4` 삭제 완료(`out/frames-ko/`는 검수용으로 보존)
