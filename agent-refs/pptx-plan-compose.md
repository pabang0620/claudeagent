# 제안 PT 4~5단계 - 슬라이드 플랜 작성·compose 실행 상세

proposal-pt-builder 참조. 4단계에 들어가기 전에 읽는다. 원문 그대로 옮겼다(2026-09-29).

## 4단계: 슬라이드 플랜 구성 (에셋 선택 + 내용 바인딩)

3단계 목차의 각 섹션에 맞는 에셋을 라이브러리에서 골라 **슬라이드 플랜 JSON**을 만든다. `<저장위치>`는 1단계에서 받은 실제 절대경로, `<파일명>`은 `{사업명약칭}_제안PT` 형식으로 **리터럴 치환**한다.

0. **참조 템플릿 우선** - `/home/lee/project/.claude/pptx-asset-library/reference/`에 `*.plan.json`이 있으면, 그것을 **슬라이드 구조·에셋 선택·배치의 뼈대로 삼고** 현재 RFP 내용만 갈아끼운다(사용자가 손수 만든 템플릿이 항상 우선). 여러 개면 사업 성격에 가까운 것을, 애매하면 사용자에게 어느 템플릿을 쓸지 묻는다. 참조 템플릿이 없을 때만 아래 **표준 스켈레톤**을 쓴다.
   - **gov 트랙**일 때는 `reference/proposal-gov.plan.json`(동작검증됨, master=gov 전용 30개 에셋 스팟체크 플랜)을 gov 참조 템플릿으로 우선 사용한다.

**표준 슬라이드 스켈레톤** (15장 기준. 에셋 ID는 INDEX.md에서 **스타일을 통일해** 고른 실제 ID로 대체):

| # | 섹션 | 배치 에셋(예) | 위치 |
|---|---|---|---|
| 1 | 표지 | BGP(표지배경) + 제목 | 전면 |
| 2 | 목차 | HDR(넘버링)/BGP(간지) | 전면 |
| 3 | 사업 이해 | HDR(섹션헤더) + TBL(요구사항표) | 헤더 상단·표 중앙 |
| 4 | RFP 대응 | HDR + CMP(매트릭스)/TBL | 헤더 상단·본문 중앙 |
| 5~6 | 수행 방법론 | HDR + PRC(프로세스) | 헤더 상단·프로세스 중앙 |
| 7 | 서비스/시스템 구조 | HDR + SVC(구조도) | 헤더 상단·도해 중앙 |
| 8 | 추진 체계 | HDR + ORG(조직도) | 헤더 상단·조직도 중앙 |
| 9 | 수행 일정 | HDR + TML(간트/타임라인) | 헤더 상단·일정 중앙 |
| 10~11 | 유사 실적 | HDR + TBL(실적표) + KPI | 헤더 상단·표 좌·KPI 우 |
| 12~13 | 기대 효과 | HDR + KPI + CHT(차트) | 헤더 상단·KPI 좌·차트 우 |
| 14 | 리스크·품질 | HDR + TBL/PRC | 헤더 상단·본문 중앙 |
| 15 | 마무리 | BGP(간지) + 마무리 문구 | 전면 |

**배치·응집 규칙**:
- **색 테마를 하나 고정**(예: 네이비 헤더)하고 전 슬라이드에서 같은 계열 에셋을 골라 통일한다.
- 배경(BGP)은 **표지·간지에만**. 콘텐츠 슬라이드는 헤더(HDR) 1 + 콘텐츠 에셋 1~2개로 여백을 둔다(과밀 금지).
- 표준 위치(인치): 섹션 헤더 `y=0.4`, 단일 콘텐츠 `x=0.7, y=1.6`, 2단 배치 좌 `x=0.5`·우 `x=7.0`(`y=1.6`).
- plan.json에 쓰기 전 **에셋 ID 존재 확인**: `grep -c '"id": "<ID>"' /home/lee/project/.claude/pptx-asset-library/manifest.json`. 없는 ID는 compose 오류로 중단된다.
- 16장 이상으로 확장할 때는 번호 배지(HDR)가 두 자리 수에서 폭이 좁을 수 있으니 폭 넓은 헤더 계열을 고른다.

1. **에셋 카탈로그 조회** - `/home/lee/project/.claude/pptx-asset-library/INDEX.md`를 Read하거나 `manifest.json`을 grep해 섹션별 적합 에셋 ID를 고른다. 섹션↔카테고리 매핑:
   - 표지/간지 → BGP(배경/패널) · 섹션 제목 → HDR(헤더/pill)
   - 사업 이해·RFP 분석 → TBL(요구사항/비교 표) · CMP(매트릭스)
   - 수행 방법론·사업 흐름 → PRC(프로세스) · SVC(구조도)
   - 추진 체계 → ORG(조직도)
   - 수행 일정 → TML(타임라인/간트)
   - 유사 실적 → TBL · KPI(지표)
   - 기대 효과 → KPI · CHT(차트)
   - 태그·추천용도(recommended_use)로 후보를 좁히고, 색/스타일은 발주기관 톤(네이비 계열 권장)에 맞춰 통일한다.
2. **바인딩 확인** - 고른 각 에셋의 `manifest.json` 엔트리에서 `bindings`(치환 슬롯 + 현재 더미값)를 읽는다.
   - 표: `table` = 새 행 배열(전체 셀 교체 - 더미 텍스트 몰라도 됨).
   - 차트: `chart` = `{categories, series}` (스타일 유지, 데이터만 교체).
   - 텍스트(헤더 제목·KPI 숫자 등): `text` = `{현재더미값: 새값}` (bindings의 더미값을 키로). compose.mjs가 **모든 run·모든 occurrence를 치환**하므로 반복 더미(카드 4개의 동일 라벨 등)도 한 번에 바뀐다.
     - ⚠ **bindings 신뢰성 주의**: manifest의 bindings 더미값이 실제 도형 텍스트와 다른 에셋이 있다(특히 CMP류의 `q1/q2` 같은 구조 플레이스홀더). 텍스트 치환이 핵심인 슬라이드는, 의심되면 그 에셋의 원본 덱 pptx를 Read로 열어 **실제 문구를 확인한 뒤** 키로 쓴다. 너무 짧은 키(1~2글자)는 오매칭 위험이 있으니 피한다.
     - **가능하면 텍스트 치환보다 데이터 치환을 쓴다**: 표는 `table`(전체 셀 교체), 차트는 `chart`(데이터 교체) - 더미 문구를 몰라도 안전하다. 텍스트 치환은 헤더 제목·짧은 라벨 등 불가피한 곳에만.
3. **플랜 JSON 작성** (Write 도구 → `<저장위치>/<파일명>.plan.json`):
   ```json
   { "slides": [
     { "assets": [ { "id": "BGP-001", "text": {"제목을 입력하세요": "2026 ○○ 구축 사업 제안"} } ] },
     { "assets": [
       { "id": "HDR-001", "x": 0.5, "y": 0.4, "text": {"사업추진 전략": "사업 개요"} },
       { "id": "TBL-013", "x": 0.5, "y": 1.6, "table": [["요구항목","대응 방안","비고"], ["...","...","..."]] },
       { "id": "CHT-001", "x": 7.0, "y": 1.6, "chart": {"categories":["게임","음악"], "series":[{"label":"2024","values":[850,180]}]} }
     ] }
   ] }
   ```
   - 슬라이드당 헤더 1 + 콘텐츠 에셋 1~3개가 표준(과밀 금지). x/y는 인치(슬라이드 13.33×7.5).
   - 2단계 **커버리지 매트릭스**의 각 요구항목이 최소 한 슬라이드의 에셋으로 대응되게 배치한다.
   - 근거자료(evidence)를 활용한 수치엔 근거ID를 텍스트에 함께 넣는다(예: "150조원[E-contents2026-01]").
   - 성과 목표 수치는 산출 근거 병기(예: "120억원 = 40개사 × 3억"). 근거를 세울 수 없으면 지어내지 말고 "목표(협의 후 확정)"로.

**gov 트랙 추가 규칙 (마스터=gov일 때만 적용, standard 트랙은 기존 규칙 그대로 유지)**:
- **팔레트/폰트 일관성**: gov 트랙에서는 `design-tokens.json`의 `gov_theme` 토큰(색: `bg_panel` E9EAF1·`table_header` 8F99AF·`accent_navy` 2E4692·`line_accent` D05548·`warn` C00000 등, 폰트: Pretendard GOV 계열 + KoPub돋움체/페이퍼로지 강조숫자)만 쓴다. standard 트랙의 최상위 `color`/`font`(navy_800 등)와 섞지 않는다.
- **표 인포그래픽 우선(하이브리드)**: 일정·비교·평가·현황을 보여주는 슬라이드는 표 인포그래픽(TBL_gov 계열, 예 TBL-201~206)을 1순위로 쓴다. 네이티브 차트(CHT)는 정량 추세(증가·감소 추이 등)를 보여줄 때만 2순위로 쓴다.
- **병합표는 정적 배치(compose.mjs 현재 상태 기준)**: gov TBL-201/202/204/205/206처럼 `gridSpan`/`rowSpan` 병합 셀이 있는 표는 compose.mjs의 `ModifyTableHelper.setTableData`가 병합 구조를 인식하지 못해 텍스트를 셀 순서대로 채우면서 오정렬을 일으킨다(`reference/proposal-gov.plan.json` 주석에 기록된 실측 이슈). **기본 원칙: 병합표는 `table` 바인딩(텍스트 치환)을 쓰지 않고 원본 셀 내용 그대로 정적 배치한다.** compose.mjs에 병합인식 패딩 래퍼가 추가되는 경우에만(예: pptx-asset-generator 에이전트가 compose.mjs를 확장) 동적 치환으로 전환한다 - 적용 여부는 compose.mjs 소스에 `gridSpan`/`rowSpan`/패딩 관련 처리 로직이 실제로 있는지 직접 확인한 뒤 판단한다.
- **실사·이미지는 MCK로만**: 풀페이지 실사·사진 배경은 금지(BGP 표지 슬라이드만 예외). 실제 스크린샷·사진을 넣어야 하면 MCK(목업 프레임) 에셋 안에 삽입해 프레임으로 감싼다.

## 5단계: 조합 실행 + 검증 (compose.mjs)

플랜 JSON을 조합 엔진에 넘겨 편집 가능한 pptx를 생성한다. `<저장위치>`·`<파일명>`은 리터럴 치환:

기존 동명 파일이 있으면 사용자가 명시적으로 승인한 경우에만 compose.mjs 실행을 계속한다(승인 없으면 다른 파일명을 제안한다). 아래 게이트가 이를 강제한다.

```bash
mkdir -p "<저장위치>" && [ -w "<저장위치>" ] || { echo "오류: 폴더 생성/쓰기 불가"; exit 1; }
if [ -f "<저장위치>/<파일명>.pptx" ]; then
  echo "기존 파일 발견 - 덮어쓰기는 사용자 승인 후에만 진행한다. 대화로 확인하라."
  exit 2
fi

node /home/lee/project/.claude/pptx-asset-library/composer/compose.mjs \
  --plan "<저장위치>/<파일명>.plan.json" \
  --out  "<저장위치>/<파일명>.pptx" 2>&1

# 검증 - 파일 존재 + 콘텐츠(슬라이드 수·잔여 플레이스홀더)까지 확인
if [ -s "<저장위치>/<파일명>.pptx" ]; then
  ls -lh "<저장위치>/<파일명>.pptx"
  python3 - "<저장위치>/<파일명>.pptx" <<'PY'
import sys, zipfile, re
z=zipfile.ZipFile(sys.argv[1])
sl=[n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)]
resid=set()
for n in sl:
    t=z.read(n).decode('utf-8')
    for m in re.findall(r'입력하세요|[A-Z]{2,4}-\d{2,3} · | · ', t): resid.add(m.strip())
print(f'슬라이드 {len(sl)}장 / 잔여 플레이스홀더·캡션:', sorted(resid) if resid else '없음')
expected = <요청 슬라이드 수>
if len(sl) != expected:
    print(f'⚠ 슬라이드 수 불일치: 기대 {expected}장, 실제 {len(sl)}장 - 선두/말미 공백 슬라이드 확인')
PY
  echo "조합 완료 (네이티브 편집 가능). 위 '잔여 플레이스홀더'가 있으면 6단계 검토에서 실데이터 교체 대상으로 표기한다."
else
  echo "오류: pptx 생성 실패. 확인:"
  echo "  1) plan.json의 에셋 ID가 실제 존재하는가 (INDEX.md 대조) - 없는 ID는 오류로 중단됨"
  echo "  2) Node/pptx-automizer 설치:  cd /home/lee/project/.claude/pptx-asset-library/composer && npm install"
  echo "  3) plan.json 문법(JSON) 유효성"
fi
```

- compose.mjs가 각 에셋을 addElement로 얹고 `text`/`table`/`chart`를 치환한다. 산출물은 전 요소가 네이티브라 **파워포인트에서 텍스트·도형·표·차트를 직접 편집** 가능하다(이미지 평탄화 없음).
- Marp 시절의 `--pptx-editable`·Chrome·테마 CSS는 더 이상 쓰지 않는다.

**gov 트랙일 때는 `--master` 인자를 추가한다** (standard 트랙은 `--master` 생략 시 기존과 100% 동일하게 `base.pptx`가 기본값이므로 그대로 둔다):

```bash
node /home/lee/project/.claude/pptx-asset-library/composer/compose.mjs \
  --master base_gov.pptx \
  --plan "<저장위치>/<파일명>.plan.json" \
  --out  "<저장위치>/<파일명>.pptx" 2>&1
```

- compose.mjs는 `--master` 값의 kind(standard/gov)와 plan.json에 쓰인 각 에셋의 manifest `master` 필드를 대조해, 하나라도 불일치하면 `마스터 호환성 위반` 에러로 즉시 중단한다(원칙 4). gov 트랙 plan.json에 standard 에셋 ID가 잘못 섞이면 이 단계에서 바로 걸러지지만, 조합 전에 4단계에서 고른 에셋 목록이 전부 같은 트랙인지 육안으로도 한 번 확인한다.

