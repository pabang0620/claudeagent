# cinematic-3d-shorts 팀 모드 (공정·과정형 30~90초)

기준 샘플: `/home/lee/project/claude-animation/showcase/tower-rise/` (2026-10-08, 초고층 빌딩 시공 62초, 사용자 평 "일전에 있던 것보다 좋다"). 읽기 전용 참고용, 고치지 않는다.
2026-10-05 집 짓기 시리즈(메인 혼자, 디오라마)는 "포크레인이 땅 파는 게 안 읽힌다"로 폐기됐다. 팀 모드는 그 실패를 반복하지 않으려고 만든 구조다.

## 언제 팀 모드인가
- 장면 종류가 4개 이상이고(기계·구조물·지형·인물 등) 각자 정밀한 동작이 필요한 "과정" 영상: 건물 시공, 다리·터널, 로켓 조립, 공장 공정 등.
- 10~20초 반전형 1장면 영상은 팀 모드를 쓰지 않는다(SKILL.md 단발 모드, 메인 직접).

## 역할 (fork로 병렬 스폰, 한 메시지에 함께)
| 역할 | 맡는 것 | 산출물 |
|---|---|---|
| 리서치 | 실측 수치·공정 순서·훅 후보, 출처·등급 A/B/C, 내레이션 초안 | `research/FACTS.md` |
| 모듈 담당 2~4명 | 서로 다른 피사체 하나씩(예: 지형+장비 / 크레인 / 건물 본체) | `src/<name>.js` + `tests/<name>_test.js` + 시트·클립 |
| 사운드 | numpy 효과음 라이브러리, 루프, 연출음, BGM 후보 실측 | `audio/sfx/*.wav`, `audio/SFX.md` |
| 메인(감독) | 공용 world·배경·HUD, 계약 문서, 스토리보드, 내레이션 녹음, 통합(main.js), 카메라, 미리보기 점검, 믹스, 최종 렌더 | `CONTRACT.md`, `research/STORYBOARD.md`, `src/main.js`, `audio/mix.py` |

모듈 담당 fork에 넘기는 프롬프트 필수 항목: CONTRACT.md 정독 지시, 담당 파일과 손대지 말 파일, 만들 대상의 실사 스케일 치수, "원인 -> 결과가 화면에서 읽혀야 한다"는 품질 기준과 구체적 판정 질문(예: 버킷이 닿은 자리가 패이는가), 히어로(실시간)·타임랩스 두 속도 지원, 렌더해서 직접 보고 고치기(같은 문제 3회 실패 시 멈춤), 보고 15줄.
스토리보드가 확정되면 해당 모듈 담당에게 SendMessage로 필수 연출(예: 크레인 해체)을 바로 알린다.

## 순서
1. 메인: 프로젝트 생성(`scripts/new_project.sh <slug> process`), `CONTRACT.md` 작성(좌표계·치수·인터페이스·테스트 방법), GPU 스모크 렌더로 환경 확인.
2. 리서치·모듈·사운드 fork 동시 스폰. 그동안 메인은 배경(city.js 등)·HUD·보조 모듈.
3. 리서치 결과로 내레이션 줄별 녹음 -> 길이 측정 -> `STORYBOARD.md`(구간·내레이션 시작초·화면 핵심·소리).
4. 모듈이 다 오면 `main.js`: 비디오 시각 v -> 공정 시계 M(v) -> 각 모듈 상태. 훅(완성본)·역재생은 M을 거꾸로 돌리는 것으로 처리한다. 모듈 기본 스케줄 대신 감독이 상태 함수(towerState 등)로 장면별 속도를 정한다.
5. 미리보기 15~24컷 시트로 점검 -> 고침 -> 반복. 전체 렌더는 미리보기가 깨끗해진 뒤 1회.
6. 렌더와 병행해 믹스. 줄별 내레이션 여유(배경 대비 8dB 이상)를 숫자로 확인.

## 모듈 계약 (tower-rise CONTRACT.md 형식)
- `export async function create(ctx, cfg) -> { group, update(t), events }`, `ctx = { THREE, scene, renderer, pbr, rep, rng, tl }`.
- 상태는 t만의 함수. 누적·`Math.random` 금지. 직접 상태 지정 API(`setState`/`pose`)를 같이 노출하게 한다(감독이 장면별 속도를 바꿔야 하므로).
- `events: [{t, type, x, y, z}]`는 믹스가 그대로 읽는다(main.js가 `window.EVENTS`로 모아 render.js가 events.json에 쓴다).

## 실측 함정 (tower-rise에서 걸린 것)
- `logarithmicDepthBuffer: true`면 높이맵 지형이 검게 나온다. 끈다.
- 페이지 첫 렌더는 텍스처 GPU 업로드 전이라 어둡거나 거울처럼 나온다. 준비 단계에서 여러 시각을 렌더하고 1초 대기한 뒤 `__ready`. 모듈 담당 2명이 같은 현상을 보고했다.
- 배경 바닥 판이 대지·구덩이를 덮지 않게 그 자리를 뚫는다(ShapeGeometry hole).
- 카메라 구간 조건에 타임라인 상수(T.crown 등)를 재사용하면 상수를 옮길 때 카메라가 엉뚱한 구간을 탄다. 카메라 경계는 숫자로 고정한다.
- 크레인처럼 다른 구조물에 붙는 장비는 기준 높이를 실제로 보이는 위치에 맞춘다(코어 꼭대기 -14m면 거푸집에 가려 안 보였고 -2m로 고쳤다).
- 노을 HDRI에서 노란 도장이 블룸에 걸려 번진다. 노을 장면 블룸 임계값 2.2.
- 효과음 이벤트를 짧은 간격으로 그대로 깔면(크레인 윈치 5초짜리 3중첩) 내레이션을 덮는다. 같은 종류는 간격(`spaced`)과 길이 자르기(`dur`)로 솎는다.
- Flow Music BGM은 영상 3초 지점 시작이 tower-rise 구성에 맞았다(베이스 진입·빌드업·정점이 철근·코어·크레인 장면과 맞음). 사운드 담당이 곡 구조를 초 단위로 실측하게 한다.

## 렌더
- `node render.js --gpu --workers 1 --fps 60 --crf 14 --pipe build/video.mp4` (RTX 3050, 약 0.4초/프레임, 62초 = 23분, run_in_background).
- 미리보기: `--list a,b,c --out preview` 후 `tile=8x3` 시트. 최종 확인은 `fps=0.5,tile=8x4` 시트.
- 결합: `ffmpeg -n -i build/video.mp4 -i build/audio.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart <slug>-v1.mp4` (기존 파일 덮어쓰지 않는다).
