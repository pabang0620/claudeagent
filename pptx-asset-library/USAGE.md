# 사용 가이드 — 제안서 PPT 에셋 라이브러리

## 무엇인가
편집 가능한 PowerPoint 네이티브 에셋 200개(표·KPI·프로세스·비교·타임라인·조직도·구조도·차트·헤더·배경·아이콘·목업)를 카테고리별로 정리한 라이브러리. 최종 목표: PPT 요청 시 에셋을 **조합**해 편집 가능한 제안서 pptx를 자동 생성.

## 폴더
- `INDEX.md` — 사람이 읽는 전체 목록(자동 생성). 카테고리별 ID·이름·태그·용도.
- `manifest.json` — 기계용 SSOT. 각 에셋 file/slide/anchor/bindings/tags/license.
- `design-tokens.json` — 색·폰트·크기 단일 출처.
- `decks/01_tables … 12_mockups/` — 카테고리별 에셋 pptx.
- `generators/` — 생성기 + 도구(common.py, merge_manifest.py, regroup.py, audit.py).
- `composer/` — 조합 엔진(compose.mjs) + 데모.
- `_incoming/` — 카테고리별 매니페스트 조각. `_rejected/` — 탈락분.

## 에셋 브라우징
`INDEX.md`를 열어 카테고리·태그·추천용도로 찾는다. 각 에셋은 `decks/<카테고리>/<파일>.pptx`의 특정 슬라이드에 있고, `asset:<ID>` 이름의 그룹(또는 표/차트 graphicFrame)이 앵커.

## 도구 (generators/)
```bash
cd /home/pabang/myapp/.claude/pptx-asset-library
python3 generators/merge_manifest.py   # 조각 → manifest.json + INDEX.md 재생성(카테고리 자동교정)
python3 generators/regroup.py          # 1에셋=1슬라이드 덱의 도형을 asset:<ID> 그룹으로 묶음(멱등)
python3 generators/audit.py            # 독립 교차감사(앵커·네이티브·이미지부재·중복ID)
```
에셋을 추가하면: 생성기 실행 → merge → regroup → audit 순.

## 조합 (composer/)
`compose.mjs`가 슬라이드 플랜 JSON을 받아 편집가능 pptx 산출. 표준 방식 = **addElement 단일콜**(그룹·단일도형·표·차트 동일).
```bash
cd composer && node compose.mjs --plan sample_plan.json --out out/result.pptx
```
plan.json = 슬라이드별 asset_id + 위치 + 치환(text/table/chart). manifest의 anchor·bindings가 계약.

## 새 에셋 생성 규약 (생성기 작성 시)
- `common.py` import. 색은 `c.role()`/`c.C['navy_800']`만(하드코딩 금지). 한글은 `c.set_kfont`/`add_text` 경유.
- 다중 도형 에셋은 `c.group_asset(slide, [도형들], 'ID')`로 그룹화(id_caption 제외). 단일 표/차트는 graphicFrame.name='asset:ID'.
- 페이지 전체 이미지·SmartArt 금지. `c.id_caption(slide,'ID')` 부착.
- 매니페스트는 `c.entry(...)` → `c.write_fragment('<CAT>', entries)`.

## 환경 의존성
- python-pptx 1.0.2, pymupdf, node 22, pptx-automizer 0.8.2 — 설치됨.
- **LibreOffice(soffice) 미설치** → 썸네일·시각QA 보류. `sudo apt install -y libreoffice` 후 `common.try_thumbnail`로 썸네일 생성 가능.

## 알려진 개선점 (다음 단계)
- 일부 에셋의 서술형 라이브러리 캡션이 그룹 안에 포함됨 → 조합 시 빈 문자열 치환으로 숨김(compose.mjs가 처리). regroup에서 순수 라벨을 그룹 밖으로 빼면 더 깔끔.
- HDR/ICN 다중배치 슬라이드는 개별 단일 도형 앵커(그룹 아님) — addElement는 정상 동작하나 향후 개별 그룹화 시 일관성↑.
- 디자인 토큰에 amber/warn 계열 부재 → 신호등 상태표는 teal/blue/red/gray로 대체. 필요 시 토큰 추가.
- 그룹 자식 텍스트 치환은 현재 "기존 텍스트 매칭" 방식 → manifest bindings에 자식 도형명 매핑 추가 시 더 견고.
