---
name: bgm-factory
description: Google Flow Music(Lyria 3.5)으로 instrumental BGM을 생성하고 마스터링·루프·패키징을 거쳐 판매 가능한 상태까지 만드는 Playwright 자동화 + 후처리 파이프라인 스킬. "BGM 만들어줘", "배경음악 제작", "Flow Music으로 곡 뽑아줘", "게임 BGM 에셋 팩", "작업용 음악 롱폼", "브이로그 배경음악", "루프 BGM" 요청 시 사용. 판매용 BGM 카탈로그의 작업 폴더는 /home/lee/project/음악생성 이고 분석·마스터링·루프·패키징 스크립트가 이미 구축되어 있으므로 새로 만들지 않는다. 다른 프로젝트(게임 레포 등)에 쓸 BGM이면 생성 절차만 가져다 쓰고 산출물은 그 프로젝트 안에 저장한다. 커버·썸네일 이미지 생성은 이 스킬이 담당하지 않고 flow-nanobanana 스킬을 쓴다.
---

# bgm-factory

2026-09-20 실측으로 확정. 전제는 두 가지다.

1. Google AI Pro 구독이 있다.
2. Playwright MCP 브라우저에 그 Google 계정이 로그인되어 있다.

판매용 카탈로그의 작업 폴더는 `/home/lee/project/음악생성` 하나다. 여기에 새 폴더를 만들지 않는다. 다른 프로젝트용 BGM이면 0절 7항을 따른다.

## 0. 정책

1. 브라우저는 로그인된 하나뿐이라 동시에 두 세션이 조작하지 않는다. 서브에이전트에 맡길 때는 그 에이전트의 도구 목록에 `mcp__playwright__*`가 있는지 먼저 확인하고, 없으면 메인 세션이 직접 실행한다.
2. 곡은 전부 instrumental이다. 가사·보컬은 쓰지 않는다.
3. Gemini API의 Lyria RealTime 경로는 쓰지 않는다. AI Pro 구독과 무관한 별도 종량 과금이다(곡당 $0.08, 무료 티어 없음).
4. `03_생성곡/`의 생성 원본은 어떤 단계에서도 덮어쓰지 않는다. 후처리 산출물은 전부 `04_납품/`으로 나간다.
5. 사용자 이메일을 프롬프트·URL·페이로드에 넣지 않는다.
6. 이미지(커버·썸네일 배경)는 `flow-nanobanana` 스킬이 담당한다. 9절 참조.
7. **이 폴더는 판매용 카탈로그 전용이다.** 다른 프로젝트(게임 레포 등)에 쓸 BGM을 만들 때 이 스킬의 생성 절차는 그대로 써도 되지만, **산출물은 그 프로젝트 안에 저장한다.** `03_생성곡/`에 넣으면 품질검사(`16_qc.py`)와 에셋 팩 패키징(`10_package.py`)이 폴더 전체를 훑기 때문에 판매 패키지에 딸려 들어간다. 2026-09-20 실제로 발생한 사고다.
8. **다른 세션이 동시에 Flow Music을 쓸 수 있다.** 다운로드 경로가 공유되므로 5절의 충돌 규칙을 반드시 지킨다.

## 1. 폴더와 파일명

```
음악생성/
  01_레퍼런스/<장르>/     분석 대상 음원
  02_분석결과/           지표/features.csv, 프롬프트카드/*.md, 장르별_프롬프트.md
  03_생성곡/<장르>/       Flow Music 생성 원본 (수정 금지)
  04_납품/<장르>/         마스터·루프 산출물. _팩/ _롱폼/ _문서/ 청음.html
  05_이미지/             커버·썸네일
  scripts/               01~14번 파이프라인
  venv-main/             파이썬 환경. run_all.sh가 이 인터프리터를 쓴다
```

장르 폴더는 `숏폼` / `게임` / `로파이` 3개 고정이다. 판매 경로가 장르별로 다르기 때문에 생성곡도 같은 3분류로 넣는다.

파일명 규칙은 `<장르영문>_<NN>_<BPM>bpm_<조성>[_태그].wav` 다.

```
shortform_01_120bpm_Gmajor.wav
game_01_140bpm_Cminor_arcade.wav
lofi_01_86bpm_Bbminor.wav
```

`scripts/10_package.py`가 트랙리스트의 BPM·조성을 **파일명에서 파싱**한다. 규칙을 어기면 그 칸이 빈 채로 출고된다. 없는 값을 추정해 채우지 않는다.

## 2. Flow Music 접속과 등급 확인

1. `browser_navigate`로 `https://flow.google.com/` 이동, 로그인 상태를 확인한다.
2. 상단 "Flow Music"을 클릭한다. `flowmusic.app`으로 이동한다. 로그인 화면이 뜨면 "Continue with Google".
3. **처음엔 등급이 FREE로 뜬다.** 상단 배너의 "Grant access to your Google One subscription"을 눌러야 PLUS로 바뀐다. 이 단계를 건너뛰면 생성 한도가 다르다.
4. PLUS 확인. AI Pro = PLUS = 월 10,000 크레딧(약 2,000곡), 동시 생성 12개.
5. 등급이 FREE로 남아 있으면 배너를 다시 찾고, 배너가 없으면 페이지를 새로고침한 뒤 다시 확인한다.

## 3. 생성 (Playwright 조작 규칙)

**Compose 패널 요소에는 `browser_click`이 먹지 않는다.** 오버레이가 pointer event를 가로채서 타임아웃이 난다. 이 절의 세 조작은 전부 `browser_evaluate`로 한다.

### 3-1. instrumental 토글

```js
const b = document.querySelector('button[aria-label="Toggle instrumental mode"]');
if (b.getAttribute('aria-checked') === 'false') b.click();
b.getAttribute('aria-checked');
```

**클릭 직후에 읽은 값은 갱신 전이라 여전히 'false'로 보인다.** `browser_evaluate`를 한 번 더 호출해 `aria-checked`가 'true'인지 확인한다. 확인 전에 다음 단계로 넘어가지 않는다.

### 3-2. 프롬프트 입력

`textarea[aria-label="Sound description"]`는 width가 0이라 Playwright가 "not visible"로 판정한다. `browser_type`은 실패한다. React 제어 컴포넌트이므로 네이티브 setter로 값을 넣고 이벤트를 디스패치한다.

```js
const ta = document.querySelector('textarea[aria-label="Sound description"]');
const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(ta, text);
ta.dispatchEvent(new Event('input', { bubbles: true }));
ta.value.length;
```

반환된 길이가 넣으려던 프롬프트 길이와 같은지 확인한다. 다르면 다시 넣는다.

### 3-3. Generate

```js
Array.from(document.querySelectorAll('button'))
  .find(b => b.textContent.trim() === 'Generate').click();
```

### 3-4. 성공 신호와 대기

생성이 시작되면 URL이 `/session/<uuid>`로 바뀐다. **이게 성공 신호다.** URL이 그대로면 Generate가 눌리지 않은 것이므로 3-3을 다시 한다.

대기는 25~30초. `browser_wait_for time:30` 후 스냅샷을 찍는다.

## 4. 길이 제어

구조 타임스탬프 없이 생성하면 **2분 41초**가 나온다. 프롬프트 끝에 구조 블록을 넣고 마지막 줄의 끝 시각을 지정하면 짧아진다.

```
[0:55 - 1:00] Outro: sparse, fade out
```

실측: 끝 시각을 1:00으로 지정한 곡이 60.0초로 나왔다. 같은 방식으로 1:40, 2:00 길이의 곡도 얻었다. 지정값과 정확히 일치하지는 않지만 확실히 줄어든다. 길이가 중요하면 생성 후 실측하고, 어긋나면 끝 시각을 조정해 다시 생성한다.

용도별 기본 길이:

| 용도 | 끝 시각 |
|---|---|
| 크몽 STANDARD 납품 | 1:00 |
| 크몽 DELUXE 납품 | 1:30 ~ 2:00 |
| 게임 루프 원본 | 1:00 ~ 2:00 (08_loop.py가 마디 단위로 다시 자른다) |
| 롱폼 소재 | 지정하지 않음 (기본 2분 41초) |

## 5. 다운로드와 저장

**다운로드는 반대로 `browser_click`을 쓴다.** `browser_evaluate`의 `.click()`은 Radix 메뉴를 열지 못한다.

1. `#player button[aria-label^="More options for"]` 클릭
2. `[role="menuitem"]:has-text("Download")` 클릭
3. `[role="menuitem"]:has-text("WAV")` 클릭

주의 사항.

- `:text-is("WAV")`는 실패한다. 반드시 `:has-text`를 쓴다.
- 포맷은 M4A / MP3 / WAV를 고를 수 있다. 7절의 Matchering 후처리를 쓰므로 **WAV를 받는다.**
- 곡 단위로 "Get stems" / "Split stems"도 같은 메뉴에 있다. 크몽 PREMIUM 패키지의 스템 분리 항목이 여기서 나온다.
- 다운로드 이벤트가 몇 초 늦게 뜰 수 있다. 파일이 안 보이면 도구를 한 번 더 호출해 확인한다.
- 저장 위치는 `.playwright-mcp/Untitled.wav` 다. **매번 같은 이름이라 곧바로 옮기지 않으면 다음 곡이 덮어쓴다.**

받자마자 이동한다.

```bash
mv .playwright-mcp/Untitled.wav "/home/lee/project/음악생성/03_생성곡/숏폼/shortform_03_120bpm_Gmajor.wav"
```

`.playwright-mcp/`에는 예전 다운로드가 남아 있다. 도구 결과에 찍힌 경로만 믿는다. 이 폴더를 `rm -rf` 하지 않는다.

### 5-1. 다른 세션과의 다운로드 충돌 (2026-09-20 실사고)

`.playwright-mcp/` 는 **브라우저 프로필이 달라도 세션 간에 공유된다.** Flow Music 다운로드는 항상 `Untitled.wav` 라는 같은 이름으로 떨어지므로, 다른 세션이 동시에 곡을 받으면 서로 덮어쓰거나 남의 파일을 집는다. 실제로 두 세션이 서로의 파일을 1개씩 잃었다.

지킬 것.

1. **`Untitled.wav` 를 절대 지우지 않는다.** 내 다운로드가 중복으로 떨어진 것처럼 보여도 남의 파일일 수 있다. 지우지 말고 그대로 두면 주인이 몇 초 안에 가져간다.
2. **옮기기 전에 내 것인지 확인한다.** 파일 크기와 mtime 을 보고, 방금 요청한 곡의 예상 길이와 맞는지 대조한다. 48kHz 스테레오 16bit 기준 대략 `바이트 / 192000 = 초` 다.
3. 유실됐으면 재생성하지 말고 **그 곡의 세션 URL(`/session/<uuid>`)로 돌아가 다시 받는다.** 생성분은 계정에 남아 있으므로 크레딧을 또 쓸 필요가 없다.
4. 동시에 돌고 있는 세션이 있으면 `ListAgents` 로 확인하고 `SendMessage` 로 알린다. 근본 해결은 한쪽이 `outputDir` 을 다른 경로로 잡는 것인데, **설정 변경은 사용자 승인 없이 하지 않는다.**

옮긴 뒤 실측으로 확인한다.

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=sample_rate,channels -of default=nw=1 "<경로>"
```

## 6. 프롬프트 작성

Lyria 3.5(Flow Music UI)는 **자연어만 받는다.** `bpm`, `scale`, `density`, `brightness` 같은 수치 파라미터를 실제로 받는 것은 Lyria RealTime(Gemini API)이고 그건 쓰지 않는다(0절 3항). `02_분석결과/장르별_프롬프트.md`의 "Lyria RealTime 파라미터" 블록은 근거 기록일 뿐 UI에 넣는 값이 아니다.

### 6-1. 구성

한 문단 + 배제 지시 + 구조 블록, 이 세 덩어리다.

1. **한 문단**: 템포 - 조성 - 밝기 - 밀도 - 악기 - 잔향 - 스테레오 순서로 쉼표로 잇는다.
2. **배제 지시**: `no vocals, no vocal chops` 처럼 `no ~`를 한 줄로.
3. **구조 블록**: `[0:00 - 0:07] Intro: ...` 형식. 마지막 줄의 끝 시각이 곡 길이를 정한다(4절).

확정된 프롬프트 5종이 `02_분석결과/장르별_프롬프트.md`에 있다. **그대로 복사해 쓴다.** 5종은 숏폼 / 게임(서사) / 게임(아케이드) / 로파이(드럼) / 로파이(앰비언트) 다. 이 파일은 `scripts/09_genre_prompts.py`가 자동 생성하므로 손으로 고치지 말고 스크립트를 다시 돌린다.

### 6-2. 제어할 수 없는 것

프롬프트에 넣어도 소용없다. 넣지 않는다.

- LUFS, true peak, 다이내믹 레인지 - 후처리 영역이다(7절 07_master.py)
- 정확한 코드 진행
- 리버브의 초 단위 길이

잔향은 초로 못 넣으므로 형용사로 번역한다.

| 실측 T20 | 프롬프트 어휘 |
|---|---|
| 0.15초 이하 | `dry close-mic` / `subtle room reverb` |
| 0.15 ~ 0.40초 | `spacious hall reverb` |
| 0.40초 초과 | `cavernous reverb` |

### 6-3. 클리핑

생성 원본은 0 dBFS에 붙어 **클리핑된 상태로 나온다.** 프롬프트로 못 막는다. 마스터링 단계에서 리미터로 -1.0 dBTP까지 내린다(7절).

## 7. 파이프라인

스크립트는 전부 `/home/lee/project/음악생성/scripts/`에 이미 있다. **새로 만들지 않는다.** 실행은 `venv-main/bin/python`으로 한다.

| 스크립트 | 하는 일 |
|---|---|
| `01_ingest.py` | `input/tracks.csv`의 음원을 분석용 wav 2종(44.1k 스테레오 / 22.05k 모노)으로 변환 |
| `02_core.py` | BPM·조성·LUFS·LRA·밝기·onset·crest 추출 (essentia + pyloudnorm + librosa) |
| `03_stems.py` | demucs 4스템 분리, 편성 비율 + 잔향 대리지표 3종 |
| `06_merge.py` | 지표를 합쳐 `features.csv` + 곡별 프롬프트 카드 생성 |
| `07_patterns.py` | 카테고리·집단별 패턴 리포트 집계 (분석 단계) |
| `07_master.py` | 마스터링. Matchering 2.0 1순위, ffmpeg loudnorm 폴백, true peak 상한 |
| `08_loop.py` | 심리스 루프. 8마디 + 30ms 등파워 크로스페이드, 이음새 수치 검증 |
| `09_genre_prompts.py` | 장르별 마스터 프롬프트 5종 생성 |
| `10_package.py` | itch.io 에셋 팩 패키징 (WAV 16bit + OGG + 루프 + 문서) |
| `11_review_page.py` | 청음 평가 페이지 `04_납품/청음.html` 생성 |
| `12_longform.py` | 마스터본을 이어붙여 1~2시간 롱폼 트랙 + 트랙리스트 생성 |
| `13_video.py` | 롱폼 오디오 + 정지 이미지 1장 -> 유튜브용 mp4 (저 fps, 긴 GOP) |
| `14_thumbnail_text.py` | 썸네일 이미지에 한글 헤드라인 합성 |
| `16_qc.py` | 박자 안정도 등 기계 품질검사. `04_납품/_qc/qc.json`에 PASS/WARN/FAIL/판정불가 판정만 기록(이동·삭제 없음) |
| `18_triage.py` | 16_qc.py 판정에 자동 승인 정책을 적용. PASS·WARN 자동 승인(이동 없음), FAIL 자동 폐기(`04_납품/_폐기/`로 이동), 판정불가만 `청음필요.md`로 사람에게 넘김. 이미 청음 완료(사용자평가_*.md 기록)된 곡은 재처리하지 않는다 |

> `07_patterns.py`와 `07_master.py`는 번호만 겹치고 하는 일이 다르다. patterns는 생성 전 분석, master는 생성 후 후처리다.

### 7-1. 실행 순서

레퍼런스 분석(생성 전, 레퍼런스를 새로 넣었을 때만):

```bash
scripts/run_all.sh          # 01 -> 02 -> 03 -> 06
venv-main/bin/python scripts/09_genre_prompts.py
```

생성 후:

```bash
venv-main/bin/python scripts/07_master.py     # -> 04_납품/<장르>/*_mastered.wav + .mp3 + .md
venv-main/bin/python scripts/08_loop.py       # -> *_loop.wav + _loop.md (게임 에셋용)
venv-main/bin/python scripts/11_review_page.py  # -> 04_납품/청음.html (채택·보류·폐기 선별)
venv-main/bin/python scripts/10_package.py --genre 게임 --name <팩이름>
```

롱폼:

```bash
venv-main/bin/python scripts/12_longform.py
venv-main/bin/python scripts/13_video.py --audio 04_납품/_롱폼/<파일>.wav
```

11번(선별)과 10번(출고)은 곡이 늘어나면 다시 돌린다. 이전 산출물을 읽기만 한다.

### 7-2. 검증

- 마스터링은 `_mastered.md`에 전후 LUFS·true peak·LRA·선택된 레퍼런스가 남는다. true peak가 -1.0 dBTP 이하인지 확인한다(Unity Asset Store 기술기준 -0.3 dB 충족).
- 루프는 `_loop.md`의 **step ratio가 1.0 이하**면 이음새가 곡 내부 변화와 구분되지 않는 수준이다. 넘으면 `--bars`를 바꿔 재시도한다.
- 이 측정은 파형 연속성만 본다. 마디 경계가 실제 프레이즈와 어긋나 음악적으로 어색한지는 사람이 듣고 판단한다. 청음 판정을 대신하지 않는다.
- **QC 자동 승인 정책 (2026-09-20, 18곡 전수 청음으로 확정)**: PASS 11/11 채택(100%), WARN 5/5 채택(오탐 100%), FAIL 1/1 폐기(100%), 판정불가 1/1 채택(기권 적절). 이 결과에 따라 `python scripts/18_triage.py`를 돌리면 PASS·WARN은 자동 승인(파일 이동 없음), FAIL은 `04_납품/_폐기/`로 자동 이동(삭제 아님), 판정불가만 `04_납품/_qc/청음필요.md`에 남아 사람이 반드시 청음한다. `--dry-run`으로 먼저 무엇이 옮겨지는지 확인할 수 있다. 16_qc.py -> 11_review_page.py(청음) 다음, 또는 그 대신 18_triage.py를 돌려 반복 배치를 자동 분류한다.

## 8. 수익 경로와 제약

상세는 `docs/실행계획.md`가 SSOT다. 여기서는 판단에 필요한 것만 둔다.

| 순위 | 경로 | 장르 |
|---|---|---|
| 1 | 크몽 BGM 외주 | 숏폼 |
| 2 | itch.io 에셋 팩 | 게임 |
| 3 | Unity Asset Store | 게임 |
| 4 | 해외 스트리밍(TuneCore) | 전체 |
| 5 | 유튜브 롱폼 | 로파이 |

### 하지 말 것

1. **스톡 뮤직 사이트 업로드** - AI 음원 금지. 계정 정지 대상이다.
2. **Bandcamp** - AI 음원 전면 금지.
3. **음저협 허위등록** - 규정 제5조 "본인이 창작한 저작물임을 확인 보증" 위반. 약관 제18조로 사용료 지급이 유보된다.
4. **대량 양산 업로드** - 곡 수를 늘리는 전략은 스트리밍에서 통하지 않는다. 곡당 유입 설계가 필요하다.
5. **재생수 조작.**
6. **AI 사용 은폐** - itch.io는 AI 태그 누락 시 브라우즈 색인에서 빠지고, Unity Asset Store는 AI 생성 콘텐츠의 투명한 공개를 명문으로 요구한다. 숨기지 않고 "레퍼런스 분석 + 스템 제공 + 빠른 초안"으로 각을 잡는다.

### 권리

- 저작권(작곡·작사)은 성립하지 않는다.
- **음반제작자 저작인접권은 남는다.** 국내 스트리밍에서 권리자 몫의 73.3%가 여기에 해당한다.
- 외주 계약서에서 "저작권 양도"를 그대로 쓰면 허위진술 리스크가 생긴다. `docs/실행계획.md` 7절의 4단 구조(권리 귀속 / 독점적 이용허락 / 음반제작자 권리 이전 / AI 고지 + 보증 범위 제한)를 쓴다. 그 조항은 국내 판례로 검증되지 않은 초안이므로 고액 계약 전에는 변호사 검토를 권한다.

## 9. 이미지

커버 아트·유튜브 썸네일 배경·크몽 썸네일 배경은 **`flow-nanobanana` 스킬**로 만든다. 절차·워터마크·크로마키 규칙은 전부 그쪽에 있다. 여기 옮겨 적지 않는다.

이번 작업에서 추가로 확인한 두 가지만 둔다.

1. **워터마크는 잘라낸다.** Nano Banana의 우측 하단 워터마크를 ffmpeg `delogo`로 지우면 번진 자국이 남는다. 커버·썸네일은 크롭이 자유로우므로 **우측 12%를 여분으로 잡고 잘라낸다.**
2. **"우측 하단을 비워라"고 쓰지 않는다.** 모델이 진짜로 단색 사각형을 그려 넣는다.

텍스트 합성은 `scripts/14_thumbnail_text.py`가 한다. 문구를 바꿀 때 이미지를 다시 만들지 않는다.

## 체크리스트

생성 전:

- [ ] 등급이 PLUS인가 (FREE면 배너를 눌렀는가)
- [ ] instrumental 토글의 `aria-checked`를 **두 번째 읽기로** 확인했는가
- [ ] 프롬프트를 `장르별_프롬프트.md`에서 가져왔는가
- [ ] 구조 블록 마지막 줄의 끝 시각이 목표 길이와 맞는가

생성 후:

- [ ] URL이 `/session/<uuid>`로 바뀌었는가
- [ ] WAV로 받았는가
- [ ] `.playwright-mcp/Untitled.wav`를 **곧바로** 장르 폴더로 옮기고 규칙대로 이름을 바꿨는가
- [ ] ffprobe로 길이·샘플레이트를 실측했는가
- [ ] `03_생성곡/`의 원본을 건드리지 않았는가

출고 전:

- [ ] `_mastered.md`의 true peak가 -1.0 dBTP 이하인가
- [ ] 게임 곡이면 `_loop.md`의 step ratio가 1.0 이하인가
- [ ] 청음 선별을 거쳤는가
- [ ] 판매처의 AI 표기 요건을 지켰는가 (8절)
