---
name: psych-shorts
description: 심리학 쇼츠 채널(한국어 "마음해석소" / 영어 "Mind Decoded")의 에피소드를 기획부터 한·영 쇼츠(1080x1920)와 16:9 영상(1920x1080)까지 만드는 오케스트레이션 스킬. 16:9 손그림 일러스트를 크로스페이드로 이어 붙이고 edge-tts로 읽는 방식이며, 베이스 영상을 편당 1번만 렌더하고 언어·화면비 4종은 합성으로 뽑는다. "심리 쇼츠 만들어줘", "마음해석소 영상", "Mind Decoded 영상", "심리학 영상 N편 뽑아줘", "/psych-shorts" 요청 시 사용. 업로드 예약·16:9 묶음본·성과 판정 도구도 이 스킬이 안내한다(docs/OPERATIONS.md). "심리 쇼츠 업로드해줘", "묶음 영상 만들어줘", "형식 판정해줘"도 여기.
---

# 심리학 쇼츠 제작

프로젝트 루트: `/home/lee/project/psych-shorts/`. 전략 SSOT는 `docs/PLAN.md`, 진행 상태는 `docs/STATUS.md`, 계정은 `docs/CHANNELS.md`. 시작할 때 STATUS.md부터 읽는다.

## 순서

```
1. 기획 (psych-shorts-planner) + lint  ->  2. 그림 (Flow, 메인)  ->  3. 렌더 (make.sh / batch.sh)  ->  4. G 드라이브 이관·보고
```

### 1. 기획
- `psych-shorts-planner` 에이전트에 편 수와 원하는 형식·주제를 넘긴다. 여러 편이면 한 번에 묶어서 맡긴다(병렬로 쪼갤 때는 편 번호를 미리 나눠 준다)
- 돌아온 script.json·meta.md는 메인이 훑어 출처 없는 수치, 단정 표현, 글자가 들어갈 그림 묘사가 있으면 고친다
- 그다음 `python3 engine/flowbridge/lint.py`로 전체 점검(JSON, 장면 수 8~11, 공유 장면 문장, 금지 표현, 한국어 분량, 글자를 부를 소품). 걸린 편은 고친 뒤 그림으로 넘긴다
- 수십 편을 한꺼번에 기획할 때는 소재 목록(`docs/BATCH-100.md` 형식)을 먼저 만들고 에이전트마다 편 번호 구간을 나눠 준다. 소재를 바꾼 편은 목록 끝 "기획 중 바뀐 것"에 적게 한다
- 사용자가 대본 승인을 따로 요구하지 않았으면 바로 2단계로 간다

### 2. 그림
- 데스크톱 앱(Code 탭)에서는 앱 내장 브라우저의 Flow로 뽑는다(아래 2-1, 2026-10-18~19 ep004~050 400여 장 실측). Playwright MCP 브라우저가 있는 세션이면 `flow-nanobanana` 스킬을 따른다
- 브라우저는 한 번에 한 세션만 쓴다. 그림은 메인이 직접 돌리고, 렌더는 `batch.sh`가 뒤에서 알아서 따라온다(3절)
- 모델 Nano Banana 2.1, x1, 16:9. 참조 이미지는 Flow 프로젝트에 올려 둔 소재 "Character poses on white background"(원본 `engine/flowbridge/sheet_nb21_try1.jpg`)를 장면마다 붙인다. 안 붙은 채 나간 그림은 후드 없는 캐릭터가 나왔다(ep036 s07)
- 프롬프트 = `Generate a single static IMAGE (not a video): ` + 화풍 문장 + `Scene: ` + 장면 `img` + 빈 소품 꼬리말("책·종이·화면·표·판은 완전히 비어 있음"). 화풍 문장은 `flow_page.js`의 `STYLE`에 들어 있으니 `assets/style.json`을 바꾸면 같이 바꾼다
- 저장 `episodes/<편>/img/s01.jpg`~. 마지막 공유 장면은 `flowjobs.py`가 ep001 s10을 자동 복사하고 큐에서 뺀다. 이미 있는 파일은 건너뛴다
- 받은 그림은 글자가 들어갔거나 캐릭터가 크게 망가진 것, 대본과 반대되는 소품(무기 등)만 다시 뽑는다. 편마다 1~2장, 재시도가 끼었던 장면은 꼭 열어 본다(늦게 끝난 앞 시도가 다음 장면으로 잘못 들어가지 않았는지)

#### 2-1. 내장 브라우저 절차
1. Flow 프로젝트 탭을 연다(사용자가 로그인해 둔 상태. 이번 프로젝트 `flow.google.com/project/c392b527-d2af-45d2-83b5-97ecc9d72167`)
2. `engine/flowbridge/flow_page.js` 내용을 `javascript_tool`로 그대로 실행한다. 탭을 새로 열거나 새로고침하면 다시 실행한다(큐·결과는 localStorage에 남는다)
3. `python3 engine/flowbridge/flowjobs.py next 40 --from epNNN` 출력 JSON을 `__F.add(<JSON>)`로 큐에 넣는다. 남은 양은 `flowjobs.py status`
4. 한 사이클: `computer wait 10` x7(약 85초) -> `await __F.prep()` -> Escape -> 입력창 focus -> Return. `browser_batch` 한 번에 두 사이클(동작 25개·약 200초 한도)
5. 한 편(8장)쯤 모이면 `JSON.stringify(__F.take())` 결과를 `wsl -e python3 /home/lee/project/psych-shorts/engine/flowbridge/flowjobs.py save '<JSON>'`로 저장한다(PowerShell에서는 JSON 안 따옴표를 `\"`로). 서명 URL은 약 6시간 뒤 만료되니 미루지 않는다
6. `prep()` 결과 읽기: `got <장면>`·`ready <장면> +ref` 정상 / `waiting` 생성 중(99%에서 2~3분 머물기도 한다) / `timeout` 240초 넘어 자동 재제출(최대 3번) / `NOREF-skip` 참조 이미지가 안 붙어 제출 안 함 / `BLOCKED` 차단 문구 -> 즉시 멈추고 사용자에게 알린다
- 생성 버튼은 JS 클릭·합성 이벤트로 눌리지 않는다. 신뢰 키 입력(Return)만 먹힌다. Escape는 소재 메뉴를 닫는다
- 탭이 백그라운드면 JS 타이머가 늘어진다. 기다림은 페이지 안 sleep이 아니라 `computer wait`로 한다
- 내장 브라우저는 localhost에 못 붙는다(로컬 네트워크 접근 거부). 그래서 URL을 메인이 받아 WSL로 넘긴다
- "Policy check temporarily unavailable" 오류는 일시적이니 같은 호출을 다시 한다

#### 2-2. 속도와 차단
- 약 85~100초에 1장, 한 편(8장) 약 13분. 실패 타일("이미지를 생성할 수 없습니다", 요금 없음)이 가끔 나오고 자동 재시도로 넘어간다
- 2026-10-18 이 간격으로 하루 약 300장 제출한 뒤 "비정상적인 활동이 감지되었습니다"로 막혔다. 다음 날 같은 간격으로 120장은 문제없었다. 하루 250장 안쪽에서 끊고 다음 날 잇는다
- 차단되면 우회하지 않는다(flow-nanobanana 7절). Codex 대체는 이 PC에서 안 된다(WSL의 `codex`가 Windows 실행 파일이라 실행 불가). 사용자가 풀렸다고 하거나 다음 날까지 기다린다

### 3. 렌더
```bash
cd /home/lee/project/psych-shorts/engine
./make.sh ../episodes/ep004-xxx ../episodes/ep005-yyy     # TTS 병렬 -> 편별 베이스 렌더 -> 4종 합성(다음 편 렌더와 겹침)
SKIP_TTS=1 ./make.sh ../episodes/ep004-xxx                # 그림만 바뀐 경우
/home/lee/project/.claude/shortform/.venv/bin/python compose.py ../episodes/ep004-xxx   # 자막·제목만 바뀐 경우
```
- `tts.py`: 장면마다 두 언어를 합성하고 장면 길이(`dur`)를 긴 쪽 말 + 여유로 확정해 script.json에 써넣는다. 짧은 쪽은 -10%까지 늦춘다
- 여러 편을 그림이 나오는 대로 렌더할 때는 `batch.sh`를 뒤에 띄워 둔다. 그림이 다 모인 편만 순서대로 TTS -> 베이스 -> 합성 -> 중간 파일 삭제 -> `offload.sh`(G 드라이브로 이관)까지 한다. PC 부담을 줄이려고 nice 15에 코어를 제한한다(편당 약 4분, 화질 설정은 그대로)
```bash
cd /home/lee/project/psych-shorts/engine
rm -f STOP; PSY_JOBS=2 PSY_COMPOSE_JOBS=1 nohup ./batch.sh >> batch.log 2>&1 &   # 멈출 때는 touch STOP
```
  - 끝난 편은 `episodes/<편>/DONE`, 실패한 편은 `FAILED`가 생기고 건너뛴다. 원인을 고친 뒤 FAILED를 지우면 다시 잡힌다
  - `PSY_JOBS`(base.py 프로세스 수, 기본 전체 코어), `PSY_COMPOSE_JOBS`(합성 동시 수, 기본 4종 전부)
- `base.py`: 1920x1080 베이스(그림 전환·확대·`num`)를 장면 단위로 병렬 렌더. 그림이 없으면 회색 자리표시
- `compose.py`: 쇼츠(흰 캔버스 + 채널명 + 2줄 제목 형광펜 + 축소 베이스 + 자막 박스)와 16:9(베이스 + 자막) x KO/EN. 자막 끊기는 `subs.py`(한국어 형태소 분석으로 조사·어미 뒤에서만 끊음)
- 파이썬은 shortform venv(`/home/lee/project/.claude/shortform/.venv/bin/python`, edge-tts·kiwipiepy 설치됨)
- edge-tts가 403을 내면 venv에서 `pip install -U edge-tts`

### 4. 보관과 보고
- 렌더 결과는 `episodes/<편>/out/<id>_<ko|en>_<shorts|long>.mp4` 4개. D 드라이브 여유가 2GB 안팎이라 로컬에 두지 않는다: `offload.sh`가 C 임시 폴더(`C:\Users\admin\Videos\psych-shorts\<편>`)로 복사·크기 비교 -> `out/` 삭제 -> `to_gdrive.ps1`이 `G:\내 드라이브\psych-shorts\<편>\`(4종 + meta.md)로 옮기고 임시 폴더를 비운다(2026-10-18 사용자 지시 "G 드라이브로 이관, 이관된 건 제거"). `batch.sh`는 자동으로 부른다. `make.sh`로 따로 만든 편은 `./offload.sh ../episodes/<편>`
- 다 끝나면 G 드라이브에서 편마다 mp4 4개 + meta.md가 있는지 센다. 경로·편 수·총 용량만 보고한다
- 영상 내용 검수(프레임 추출·감상)는 하지 않는다. 사용자가 직접 본다
- STATUS.md 편 목록에서 해당 편을 "완성, G 드라이브"(로컬에 남겼으면 "렌더 완료")로 바꾼다

## 막혔던 것 (2026-10-18~19 50편 제작)
- 디스크: WSL 안 `df`는 vhdx 최대 크기 기준이라 여유가 748GB처럼 보이지만 실제 D 드라이브(`D:\WSL\Ubuntu\ext4.vhdx`) 여유는 1.9GB였다. 여유는 Windows 쪽 `Get-PSDrive D`로 본다
- WSL 네트워크만 끊기는 일이 있다(Windows는 정상). TTS가 실패해 편마다 FAILED가 찍힌다. **WSL은 재시작하지 않는다**(같은 WSL에서 다른 작업이 돈다, 사용자 지시). `engine/resume_when_online.sh`가 복구를 기다렸다가 FAILED를 지우고 batch.sh를 다시 띄운다
- Windows에서 UNC 경로(`\\wsl.localhost\...`)로 `.sh`를 고치면 CRLF가 되고 실행 권한이 빠진다(exit 126). 고친 뒤 `sed -i 's/\r$//' <파일> && chmod +x <파일>`
- `to_gdrive.ps1`은 UTF-8 BOM으로 저장한다. BOM이 없으면 한글 경로에서 파싱 오류가 난다
- PowerShell에서 `wsl -e bash -c "..."` 안에 `python -c`나 heredoc, `$(...)`를 넣으면 따옴표가 깨진다. 스크립트 파일로 만들어 실행한다. `pkill -f <패턴>`은 그 패턴이 든 자기 셸까지 죽일 수 있다
- G 드라이브는 구글 드라이브 데스크톱 앱이 띄운다. 브라우저로 드라이브에 올리는 길은 없다(파일 업로드 도구 없음)

## 운영 (업로드 · 묶음본 · 판정)
절차 SSOT는 `docs/OPERATIONS.md`. 요약:
- 업로드: `upload/make_uploads.py <yt|tt|ig> <ko|en> <시작> <끝>` -> runner `up.sh`로 브라우저 3개 -> `go.js`로 실행. 한국어 19:00, 영어 09:00(한국 시간), 하루 1편. 틱톡·인스타는 대상 계정이 로그인돼 있지 않으면 `ACCOUNT_MISMATCH`로 멈춘다
- 묶음본: 쇼츠 10편마다 `engine/compile.py <이름> <lang> <편...>` (장 카드 + 챕터 + 썸네일)
- 판정: `metrics/metrics.csv`에 7일 뒤 숫자 기록 -> `metrics/verdict.py`
- 주제 후보는 `docs/RESEARCH.md`

## 바꾸면 안 되는 것
- 화면 규격·색·폰트·채널명(`engine/common.py`), 제목 2줄 형광펜 형식(사용자가 "타이틀 정말 잘 해줬어"로 확정)
- 두 언어 공용 타임라인 구조(렌더 1번 원칙). 언어별로 장면 길이를 따로 두지 않는다
- 그림 안 글자 금지(숫자는 `num`으로 엔진이 얹는다)
- 한국어 자막은 조사·어미 단위로 끊는다("부탁할 때 이 한 / 단어만" 같은 끊김 금지)
