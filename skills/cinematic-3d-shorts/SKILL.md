---
name: cinematic-3d-shorts
description: 채널·캐릭터와 무관한 10~20초 "시네마틱 3D 지식 쇼츠"를 영상 생성 AI 없이 코드로 만드는 스킬. Three.js 3D 장면(파티클·블룸·그림자·모션블러·색보정)을 헤드리스 Chromium에서 프레임 단위로 결정적 렌더하고, numpy로 효과음·배경음을 직접 합성하고, edge-tts 나레이션을 붙여 1080x1920 60fps mp4로 낸다. 기준 샘플은 "80억 명을 꽉 누르면 각설탕 하나, 4억 톤"(`claude-animation/showcase/sugar-cube/`). "유튜브 영상 만들어줘", "쇼츠 하나 만들어봐", "최고 퀄리티로 영상 만들어", "3D 영상 코드로", "시네마틱 쇼츠" 요청 시 사용. 굼구미 채널 손그림풍 2D는 gumgumi-cinematic, 씬 라이브러리 조립형 대본 숏폼은 shortform, Google Flow/Readdy 생성 영상은 flow-nanobanana/readdy-cinematic 담당.
---

# cinematic-3d-shorts

2026-10-03 "할 수 있는 최고 퀄리티로 10초 유튜브 영상" 요청에서 만든 각설탕 영상이 기준이다.
기준 샘플 폴더: `/home/lee/project/claude-animation/showcase/sugar-cube/` (읽기 전용 참고용, 고치지 않는다).
메인이 직접 만든다. 장면 코드와 화면 판단이 한 맥락에 있어야 품질이 나오므로 서브에이전트에 넘기지 않는다.

## 1. 주제와 사실 (먼저 끝낸다)

- 10초 안에 **반전 하나**가 있는 주제를 고른다. 형식: 익숙한 대상 -> 극단적 변환 -> 예상 밖 수치.
  (예: 지구 80억 명 -> 원자 빈 공간 제거 -> 각설탕 하나, 무게 4억 톤)
- 화면·나레이션에 나오는 **모든 수치를 직접 계산해 검증**한다. 기준 샘플도 처음 잡은 "5억 톤, 1cm³"가
  계산상 틀려 "4억 톤(평균 50kg x 80억), 2cm³(÷ 핵밀도 2.3e17 kg/m³)"로 고쳤다. 흔히 도는 수치를 그대로 쓰지 않는다.
- 주제 선택은 Claude 재량이다. 사용자가 주제를 주면 그걸 쓴다.

## 2. 나레이션 먼저, 화면은 그 타이밍에 맞춘다

```bash
T=/home/lee/project/.claude/shortform/.venv/bin/edge-tts
$T --voice ko-KR-InJoonNeural --rate=+8% --pitch=-6Hz --text "..." --write-media audio/n1.mp3
ffmpeg -i audio/n1.mp3 -af silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse -ar 48000 -ac 1 audio/n1.wav
ffmpeg -i audio/n1.wav -af silencedetect=n=-38dB:d=0.08 -f null -   # 문장 안 쉼 위치
```
- 줄마다 따로 뽑아 앞뒤 무음을 자르고 길이를 잰다. 숫자는 한글로 쓴다("팔십억", "사억").
- 쉼표 뒤 쉼이 0.5초를 넘으면 `audio.py`의 `NARR` 잘라내기 구간으로 쪼개 템포를 조인다.
- 잰 길이로 `src/timeline.js`의 `K`(장면 경계)와 `src/hud.js`의 `CAPTIONS`, `audio.py`의 `NARR` 배치 시각을 같은 값으로 맞춘다.
- 결정적 순간(충돌 등)은 나레이션 쉼 사이에 두고, 직전 0.1초는 소리를 비워 대비를 만든다.

## 3. 프로젝트 만들기

```bash
bash /home/lee/project/.claude/skills/cinematic-3d-shorts/scripts/new_project.sh <slug>
```
기준 샘플을 `claude-animation/showcase/<slug>/`로 복제한다. 파일 역할:

| 파일 | 역할 | 새 주제에서 |
|---|---|---|
| `src/timeline.js` | 장면 경계 `K`, 이징, 섬광 `flashAt`, 흔들림 `shakeAt` | 값 교체 |
| `src/scene.js` | 렌더러·후처리·카메라 경로·`update(t)` | 장면 구성 재작성, 후처리 체인은 유지 |
| `src/build.js` | 파티클·텍스처·지오메트리 생성(시드 고정) | 재작성 |
| `src/shaders.js` | GLSL | 필요한 것만 추가 |
| `src/hud.js` | 자막·상단 수치·지시선·치수선·마지막 타이틀 | 문구·배치 교체 |
| `render.js` | 로컬 http 서버 + playwright로 `renderFrame(f)` 호출, PNG 저장 | 그대로 |
| `audio.py` | 효과음·배경음 합성, 나레이션 배치·덕킹, 잔향 | 큐 시각·구성 교체 |

## 4. 화면 규칙 (기준 샘플에서 실제로 걸린 것)

- **결정적 렌더**: 모든 상태는 `t`만으로 계산한다. 프레임 간 누적(AfterimagePass 등) 금지, `Math.random` 금지(`rng(seed)` 사용).
- **9:16 구도**: `camera.setViewOffset`으로 피사체를 화면 44% 높이에 둔다. 상단 10~20%는 수치·제목, 75% 부근은 자막,
  80% 아래와 오른쪽 15%는 유튜브 UI에 가리므로 비운다.
- **NaN 방지**: GLSL `pow(x, y)`는 x가 음수면 llvmpipe에서 NaN이 되고, NaN 한 픽셀이 블룸에서 검은 사각형으로 번진다.
  제곱은 `x*x`로, 프레넬은 `pow(clamp(1.0 - dot(n,v), 0.0, 1.0), k)`로 쓴다. RenderPass 직후 NaN/Inf를 0으로 바꾸는 패스를 유지한다.
- **가산 합성 파티클 밝기**: 크게 보이는 점은 `alpha *= clamp(9/(size*size), 0.003, 1)`로 넓이만큼 나눈다.
  한곳에 모이는 파티클은 모일수록 알파를 0.02배까지 낮춘다. 안 하면 화면 전체가 하얗게 날아간다.
- **블룸 임계값을 장면별로**: 빛 자체가 주인공인 장면은 0.16, 조명받은 물체(질감이 보여야 하는 것)는 1.3.
  낮은 임계값을 물체 장면에 쓰면 질감 없는 흰 덩어리가 된다. 조명은 key 1.7 / rim 1.6 / hemi 0.15 부근에서 시작한다.
- 후처리 체인: RenderPass(FloatType, MSAA 4) -> NaN 제거 -> UnrealBloom -> OutputPass(ACES) -> 색수차·비네트·그레인·섬광 패스.
- 파티클 모션블러는 같은 지오메트리를 시간 오프셋만 다르게 3번 그린다(각 알파 1/3).
- 치수선·지시선처럼 3D에 붙는 HUD는 기준 모서리를 고정 시점에서 한 번 고른다. 매 프레임 고르면 회전 중 다른 모서리로 튄다.
- 한글 폰트: 시스템 `"Noto Sans CJK KR"`(700/400). `document.fonts.load` 후 `__ready`.

## 5. 점검과 렌더

```bash
node render.js --workers 1 --list 60,145,300,420,500,590 --out preview   # 장면별 대표 컷
ffmpeg -pattern_type glob -i 'preview/f*.png' -vf "scale=300:533,tile=6x1:padding=4" -frames:v 1 sheet.png
node render.js --fps 60 --workers 1 --out frames                          # 전체 (run_in_background)
```
- **워커는 1개**: 헤드리스는 하드웨어 GPU를 못 잡고 llvmpipe(CPU)로 돈다. 워커를 늘리면 코어를 나눠 써서 오히려 3배 느려졌다.
  10초 60fps 600프레임이 약 8분 걸린다.
- 대표 컷 시트로 깨짐·과노출·글자 겹침을 먼저 잡고 전체 렌더한다. 고친 뒤에는 해당 구간만 `--list $(seq -s, a b)`로 다시 렌더한다.
- 문제를 원인 모를 채로 계속 고치지 말고 진단 패스를 넣는다(예: `?nandbg=1`이 NaN을 빨강으로 표시).

## 6. 소리와 인코딩

```bash
python3 audio.py
ffmpeg -i build/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 build/audio.wav
ffmpeg -n -framerate 60 -i frames/f%04d.png -i build/audio.wav -c:v libx264 -preset slow -crf 16 \
  -pix_fmt yuv420p -profile:v high -c:a aac -b:a 256k -shortest -movflags +faststart <slug>-shorts.mp4
```
- 장면 경계마다 소리 이벤트를 하나씩 둔다(카운터 틱, 급강하 상승음, 타격, 역재생 스웰, 생성 차임, 낙하 바람, 충돌 붐+파열+잔해).
- 나레이션 구간은 배경음을 0.4배, 효과음을 약 0.6배로 덕킹한다. 충돌음이 바로 뒤 나레이션을 덮지 않게 한다.
- Claude는 소리를 들을 수 없다. `showwavespic` 파형과 `ebur128` 수치로만 확인하고, 보고할 때 "직접 듣고 확인 필요"를 명시한다.
- 완성 후 `fps=2,tile=10x2` 시트로 전체 흐름을 한 번 확인한다. 기존 mp4가 있으면 덮어쓰지 않고 새 이름으로 낸다(`-n`).

## 7. 보고

파일 경로, 규격(해상도·fps·길이·LUFS), 장면별 시간표, 검증한 수치와 계산 근거, 확인하지 못한 것(소리)을 적는다.
