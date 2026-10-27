# 설계 집사 참고 문서 (spec_ref.md)
규칙은 `spec.md`(core)가 기준이다. 이 문서는 구조·코드 조각·실측값·절차·사례를 담는다. 필요한 절만 읽는다.

목차: 1 구조·접근 / 2 코드 조각 / 3 절차·수치 / 4 실측값 / 5 웰콘 DB / 6 WAS-02 결정 기록 / 7 시행착오 / 8 속도·생성 도구

## 1. 구조·접근
- 슬라이드는 번호로 다룬다(`Slides(n)`). 아비님이 화면에서 다른 장으로 가도 상관없다 (R006). 현재 보고 있는 장 = `ActiveWindow.View.Slide.SlideIndex` (M01)
- 그룹 이름이 붙은 표도 `Shapes('Group 1019').Table`처럼 접근된다 (M03)
- 기능설명 표 = `Group 1019`(이름은 Group이지만 표 도형, Type 19). 2열이 내용, 줄 구분은 `` `r `` 문단 (N02)
- 개요 = `Group 25`(Type 6 그룹). `GroupItems`를 돌며 글을 읽는다. 제목은 `Rectangle 7`, 페이지 ID·화면 ID는 `Rectangle 105` 중 하나에 `페이지ID`r화면ID` 두 문단으로 들어 있다. 빈 장은 글이 `` `r ``뿐. 1·2장(표지·개정이력)에는 Group 25가 없어 순회할 때 건너뛴다(`Shapes('Group 25')`는 오류) (N01)
- 같은 이름 도형이 여러 개(예: `Rectangle 49` 번호 박스)라 이름으로 하나를 못 집는다. `foreach`로 돌며 위치·글로 고른다

## 2. 코드 조각 (PowerShell)
- PowerShell 도구에 한글 스크립트를 직접 넣어 실행하면 된다. 파일로 저장할 때만 `.ps1`을 UTF-8 BOM으로 (N13)(R008)
- 변수 표기: `$r:` → `${r}` (R009). `"$si장"`처럼 변수 뒤에 한글이 붙으면 빈 값이 된다 → `"${si}장"` (N10)
- 칸 전체를 `.Text=`로 새로 쓰면 첫 글자 서식을 따른다 (R011). 서식을 살리려면 `Replace`
```powershell
function Rep($tr,$a,$b){ $r=$tr.Replace($a,$b); if($r -eq $null){ throw "못 찾음: $a" } }   # 못 찾으면 멈춤
```
- 행 높이 맞추기 (N03, R012)
```powershell
$c=$tbl.Cell($r,2); $tf=$c.Shape.TextFrame
$tbl.Rows($r).Height = $tf.TextRange.BoundHeight + $tf.MarginTop + $tf.MarginBottom
```
- `Lines().Count`·`Height`는 늦게 갱신될 때가 있다. 꺾였는지는 캡처로 판단한다 (N04)
- 참고 줄 추가 (N09, N08)
```powershell
$null=$cell.Shape.TextFrame.TextRange.InsertAfter("`r> 참고 : $id")
$tr=$cell.Shape.TextFrame.TextRange; $p=$tr.Paragraphs($tr.Paragraphs().Count); $p.Font.Bold=0
$pre='> 참고 : '.Length
$p.Characters(1,$pre).Font.Color.RGB=2500134                          # #262626
$p.Characters($pre+1,$id.Length).Font.Color.ObjectThemeColor=13       # 텍스트1
$cell.Shape.TextFrame2.TextRange.Characters($p.Start+$pre,$id.Length).Font.Highlight.RGB=65535  # 노란 형광펜
```
  - `TextFrame2.TextRange.Paragraphs`를 번호로 돌리면 "색인이 범위를 벗어났습니다" 오류 → 위치는 `TextRange`(옛 방식)로 찾고 칠하기만 `TextFrame2`로 (N08)
- 문단 삭제: `$tr.Characters($p.Start-1, $p.Length+1).Delete()` (앞 줄바꿈까지)
- 일괄 치환·번호 밀기 (N06)
```powershell
function Walk($sh,[scriptblock]$f){ if($sh.Type -eq 6){ foreach($g in $sh.GroupItems){ Walk $g $f } }
  elseif($sh.HasTable){ $t=$sh.Table; for($r=1;$r -le $t.Rows.Count;$r++){ for($c=1;$c -le $t.Columns.Count;$c++){ & $f $t.Cell($r,$c).Shape.TextFrame.TextRange } } }
  elseif($sh.HasTextFrame -and $sh.TextFrame.HasText){ & $f $sh.TextFrame.TextRange } }
# 번호를 한 칸씩 밀 때는 큰 번호부터(012→013, 011→012 …) - 작은 번호부터 하면 연쇄로 겹침
for($k=12;$k -ge 1;$k--){ $a='X-{0:000}' -f $k; $b='X-{0:000}' -f ($k+1)
  foreach($s in $p.Slides){ foreach($sh in $s.Shapes){ Walk $sh { param($tr) while($tr.Replace($a,$b) -ne $null){} } } } }
```
- 캡처: `$p.Slides(n).Export('경로.png','PNG',1600,900)` → Read로 본다 (R027)

## 3. 절차·수치
### 3.1 새 표 만들기 (R017, R018)
- 내용과 서식(글꼴·크기·굵기·색·바탕·여백 0.1cm·열 너비·병합)을 한 번에 정의 → `python -I` python-pptx로 스크래치패드 임시 pptx에 표 완성 → COM으로 임시 파일 열기(FullName이 다른지 확인) → 표 도형 `Copy()` → 대상 슬라이드 `Shapes.Paste()` → 위치·크기 지정 → 임시 파일만 닫기
- 시험: 12×6 표 생성 0.03초 + 붙여넣기 0.5초, 위치·글꼴·여백 그대로 들어감 (R018)
### 3.2 표 전체 여백 (R013, R014, R016)
- 아비님이 화면에서 표 전체 선택 후 한 번에 적용하는 게 가장 빠르다. 직접 하실 때는 표 전체 선택 방법을 안내한다
- COM에는 표 전체 여백 속성이 없다(표 도형 `TextFrame2` 여백은 오류, 2026-10-20 시험) → 칸 반복. 140칸 약 1.4초
### 3.3 글꼴 일괄 (R020~R025)
- `Presentation.Fonts.Replace("원래 글꼴","새 글꼴")` = 홈 > 바꾸기 > 글꼴 바꾸기
- 굵기별 이름(`Pretendard SemiBold` 등)이 따로라 이름마다 한 번씩 (R021)
- 일부 구간만 바꿀 때만 칸 단위 (R023). 바꾼 뒤 꺾임·넘침 점검은 바뀐 장 몇 장만 (R024)
- 사례: 런 3,200개를 하나씩 돌려 오래 걸림 (R025)

## 4. 실측값
- 슬라이드 960×540pt, 레이아웃 `7_사용자 지정 레이아웃`
- 안내선 색: 빨강 = 마스터(`SlideMaster.Guides`), 주황 = 레이아웃(`CustomLayout.Guides`), 회색 = 슬라이드에서 직접(`Presentation.Guides`) (R063). 빨강 값 위 74·왼 21·오 741·아래 508
- 칸 여백 0.1cm = 2.835pt. 기능설명 빈 행 14.1pt, 한 줄 표 행(10pt) 약 17.7pt
- 참고 줄 색: `> 참고 :` RGB 2500134(#262626), ID `ObjectThemeColor=13`(텍스트1), 형광펜 RGB 65535(노랑)
- 기능설명 줄 한 줄(7pt) ≈ 10.4pt

## 5. 웰콘 DB (M09)
- 정의서 폴더: `D:\01_2026\01_한국콘텐츠진흥원\02_정량 검증\00_2025\99_테이블명세서`(테이블명세서·엔터티·속성·코드·도메인·표준용어 v1.2, ERD, 마켓플레이스는 `_마켓플레이스`)
- 접두어 `CO_`(공통)·`TW_`(웰콘)·`COMTN…`(전자정부). ID varchar(20). 기본 컬럼 INSERT_ID/DT·UPDATE_ID/DT·DELETE_YN
- 코드: `CO_CODE_MST` / `CO_CODE_DTL`(PK CODE_ID+CODE, `SORT_ORDR` bigint NOT NULL = 화면 표시 순서, USE_YN). 복수 코드는 `TW_CODE_MAPPING`·`TW_GENRE_MAPPING`(TABLE_NAME+DATA_ID+FIELD_NAME+코드) 패턴
- 읽는 법: openpyxl로 xlsx를 UTF-8 txt로 덤프해서 Read(Bash 출력은 한글이 깨짐)

## 6. WAS-02 결정 기록 (2026-10-26) (N15)
- 화면 ID: 포지션 5~17장 `AL-SUB-USER-02-001~013`(5장 업무 단계 매핑 = 001), 상세장르 18~28장 `KR-SUB-MYPG-02-001~011`, 29·30장 `AL-ETC-USER-01-001~002` (R057)
- 기타 장르(002010) 포지션 = WC049(가칭) 049001 기타 하나(IP 사업개발 제외). 음악 043012·패션 044013·신기술융합 045010·스토리 046007 기타 신규
- 기타 포지션 직접 입력 = TW_ETC_POSITION(가칭), 노출 조건은 "기타 장르 선택 시에만" 유지
- 다른 파일(WAS-01) 참조 줄은 모두 뺌. "(WAS-01)" 같은 본문 표기도 필요할 때만
- 가칭 때문인 확인 사항은 "자체 DB 설계 정책 우선"으로 씀
- 상세장르 표시 순서 = `CO_CODE_DTL.SORT_ORDR`, 변경 코드 상세 표 머리글 "표시 순서(SORT_ORDR)"
- 삭제 코드의 대체 코드 7건은 제안대로 확정
- 4장 "2) 자문 반영 결과" 표는 조사 기준이라 코드 개수가 바뀌어도 그대로

## 7. 시행착오
- 2026-10-20: 열린 WAS-02와 같은 경로로 Open 후 Close → 아비님 창이 저장 없이 닫혀 어니 수정분 + 아비님 6장 표 간격 손실(자동 복구 없음) (R028)
- 2026-10-26: 5장 ※ 주석 문구가 길어지자 끝이 번호 박스와 겹침 → 문구를 줄여 해결. 글을 늘리면 오른쪽 끝 도형을 캡처로 확인
- 2026-10-26: 표 머리글 "표시 순서(SORT_ORDR)"가 꺾여 행 높이 29.7로 늘었는데, 열을 넓혀 한 줄이 된 뒤에도 행이 안 줄어 20장 표가 508 밖으로 나감 → 머리글 행 높이를 직접 17.67로 (N03)
- 2026-10-26: 아비님이 고친 뒤의 파일을 다시 읽지 않고 옛 내용으로 설명해 다시 물으심 (N14)
- 2026-10-20: 렌더 스크립트가 PowerPoint를 `Quit()`해서 아비님이 열어 둔 PPT가 꺼짐. 열린 창이 0개였을 때만 Quit 허용
- 2026-10-20: 바꿀 글이 찾을 글을 포함하는 Replace 반복문이 끝나지 않아 같은 문장이 13,595번 삽입됨. 반복 상한을 두고, 오래 걸리면 Windows 쪽 프로세스부터 찾아 종료
- 2026-10-20: 표 290칸을 COM으로 칸마다 칠하다 5분 넘게 걸려 끊김. 새 표는 python-pptx 임시 pptx로 만들어 붙여넣기

## 8. 속도·생성 도구 (이 폴더의 파일)
- 새 PPT 생성 전: `style-WAS02.md`를 먼저 읽는다(색상·글꼴·도형 값)
- 새 PPT를 python-pptx로 만들 때: `lib.py`(표·제목 막대·소제목·흐름 상자·화살표·안내 상자·기능설명 채우기 함수), 예시 `example_build_WAS03.py`(틀 장 복제 → 내용 채우기 → 원본 장 삭제)
- 결과 확인: `render.ps1`로 전 장 PNG를 뽑는다. 열린 파일은 복사본으로 렌더하고 Quit하지 않는다
- 열린 PPT의 같은 번호 장을 새로 만든 장으로 교체: `live.ps1`(InsertFromFile)
- 열린 PPT에 큰 표 넣기: `paste_table_example.py`로 임시 pptx를 만들고 `paste_table_example.ps1`로 복사·붙여넣기(세로 병합 포함)
- 장 복제는 열린 PPT에서 `Slide.Duplicate()`
- 행 높이 맞추기: 모든 행 `Height=1`로 줄인 뒤 가장 큰 높이를 읽어 전부 그 값으로(표 하나에 1초 안쪽)
- 열 너비: 칸 글 길이를 재서 나눈다(PIL + malgun.ttf/malgunbd.ttf로 글 폭 측정, 합이 표 너비 안이면 남는 폭을 비례 배분, 넘으면 긴 열만 줄바꿈 허용)
- 규칙 번호 추적: `trace/`(rules_data.py·check.py·coverage.md·compare.md). check.py는 원본 백업 경로를 보므로 인자로 경로를 넘겨 쓴다

