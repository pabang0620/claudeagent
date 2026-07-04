# 제안서 PPT 에셋 라이브러리 — 구축 명세 (BUILD_SPEC)

목적: 사용자가 PPT를 요청하면 이 라이브러리의 **편집 가능한 네이티브 에셋**을 조합해 제안서 PPTX를 자동 생성한다.
루트: `/home/pabang/myapp/.claude/pptx-asset-library/` · 하드스톱: 2026-07-04 05:00 KST

## 1. 아키텍처 원칙
- 최종 에셋은 전부 PowerPoint 네이티브(도형·표·차트·텍스트). **페이지 전체 이미지 금지, SmartArt 금지.**
- 생성=python-pptx, 조합=pptx-automizer(Node). 각 에셋 앵커 = `asset:<ID>`.
- 디자인 토큰 단일 출처: `design-tokens.json`. 한글은 `common.set_kfont`(latin/ea/cs 3계열) 강제.
- 라이선스 리스크 회피 = **자체 생성 우선**. 수집은 ICN(오픈소스 아이콘)·BGP(CC0 배경)에 한정.

### 1-1. 앵커 그룹화 규약 (조합 PoC로 확정 — 필수)
- **다중 도형 에셋은 반드시 `asset:<ID>` 이름의 `<p:grpSp>`(그룹)로 묶는다.** 생성 시 `common.group_asset(slide, shapes, id)` 호출(id_caption 제외).
- 이유: pptx-automizer `addElement`가 앵커 하나를 복사하는데, 앵커가 배경도형 하나면 나머지 형제 도형이 안 딸려온다. 그룹이면 에셋당 1콜로 완결.
- 단일 객체 에셋(표=graphicFrame, 차트=graphicFrame)은 그 자체가 앵커 → 그룹 불필요, 이름만 `asset:<ID>`.
- 기존 덱은 `generators/regroup.py`(1에셋=1슬라이드 덱 후처리 그룹화)로 소급 적용. 다중배치 슬라이드(HDR/ICN)는 생성단계 그룹화 또는 재생성 필요.
- **조합 PoC 결과(pptx-automizer 0.8.2, node 22)**: addElement/addSlide 둘 다 동작, 텍스트·표셀 치환 정상, 네이티브 편집성 유지(pic 0). 실현성 = 그룹화 전제 시 **上**.

## 2. 카테고리 체계 (12)
| 코드 | 카테고리 | 폴더 | 주 생성방식 | 도구 |
|---|---|---|---|---|
| TBL | 표 디자인 | 01_tables | 자체생성 | python-pptx |
| KPI | KPI 카드/숫자강조 | 02_kpi | 자체생성 | python-pptx(도형) |
| PRC | 프로세스 화살표/단계흐름 | 03_process | 자체생성 | python-pptx(CHEVRON 등) |
| CMP | 비교표/평가표/매트릭스 | 04_compare | 자체생성 | python-pptx |
| TML | 타임라인/로드맵 | 05_timeline | 자체생성 | python-pptx(도형+커넥터) |
| ORG | 조직도/추진체계도 | 06_org | 자체생성 | python-pptx(박스+커넥터) |
| SVC | 서비스구조도/사업흐름/운영프로세스 | 07_service | 자체생성+보조 | python-pptx (+draw.io 실험) |
| CHT | 차트 스타일 | 08_charts | 자체생성 | python-pptx native chart |
| HDR | 섹션헤더/배지/라벨/강조박스 | 09_headers | 자체생성 | python-pptx(도형) |
| BGP | 표지/섹션배경·패널 | 10_backgrounds | 재구성+수집 | python-pptx + CC0 이미지 |
| ICN | 아이콘형 도식 | 11_icons | 수집(라이선스안전) | 오픈소스 아이콘 PNG/EMF |
| MCK | 목업/디바이스 프레임 | 12_mockups | 자체생성/수집 | python-pptx 도형 |

## 3. 폴더 구조
```
pptx-asset-library/
  BUILD_SPEC.md  INDEX.md  manifest.json  design-tokens.json
  decks/01_tables .. 12_mockups/   *.pptx (카테고리별 분산, 파일당 3~6슬라이드)
  thumbnails/      <deck>_sNN.png  (LibreOffice 설치 후 생성)
  generators/lib/common.py         (공통 유틸) + generators/*.py
  _incoming/       manifest_<CAT>.json (에이전트 조각) + 수집 원본(라이선스 검토 대기)
  _rejected/       중복/품질 탈락(감사용)
```

## 4. ID·파일명·태그 규칙
- **에셋 ID**: `<CAT>-<3자리>` 전역 유일 (TBL-001). 앵커 그룹명 `asset:TBL-001`.
- **파일명**: `<CAT>_<기능/스타일>_v<버전>.pptx` (TBL_header-styles_v1.pptx). 기능·구조·스타일이 드러나게.
- **태그**: 한국어 검색축 4종 — 카테고리 / 구조(3열·4단계·2x2) / 스타일(네이비·카드형·미니멀) / 용도(비교·흐름·강조·실적).

## 5. 메타데이터 스키마 (manifest 엔트리, common.entry)
`id, category, name, file, slide, anchor, tags[], params{}, bindings{}, editable[], source, license, recommended_use[], quality, thumbnail`
- **bindings**: 조합 파이프라인이 내용을 주입할 명명 슬롯(표=header/cells/row_count, KPI=cards[], PRC=steps[] 등). **라이브러리↔파이프라인 계약.**
- **source**: generated:python-pptx | collected:<출처> | reconstructed
- **license**: self | cc0 | commercial-ok | attribution | verify(불명확→_incoming 격리)

## 6. 확보 계획 (50 → 100 → 200)
| 단계 | 누계 | 구성 | 방식 |
|---|---|---|---|
| Phase 1 | ~60 | TBL12·KPI10·PRC12·CMP10·HDR16 | 전량 자체생성(Wave 1) |
| Phase 2 | ~110 | ORG·SVC·TML·CHT + TBL/PRC/CMP 변형 | 자체생성(Wave 2) |
| Phase 3 | ~200 | ICN30(수집) · BGP·MCK · 전카테고리 스타일변형 | 수집+자체생성(Wave 3~) |

## 7. 기술 판단
- **python-pptx**: 에셋 생성 전 영역의 주력(파라미터화·라이선스무결·무한변형). 버전 1.0.2 고정.
- **pptx-automizer(Node)**: 최종 **조합** 전용 — 여러 덱의 슬라이드/그룹 import + 텍스트·차트데이터 치환. python-pptx가 크로스파일 슬라이드복사를 기본 미지원하는 갭을 메움. (스타 220·단일메인테이너 → 리스크 대비: 에셋을 명명 그룹으로 깔끔히 유지해 XML레벨 복사 폴백 가능하게)
- **직접 도형 필수**: ORG/PRC/TML/SVC(커넥터 기반, SmartArt 회피).
- **수집이 나은 영역**: ICN(오픈소스 아이콘 세트가 자체그리기보다 고품질·효율).
- **회피**: svg2pptx(미성숙 하), LLM 좌표 직접생성(정밀도 낮음 → 초안용만+사람검수), Marp/Pandoc editable(품질/재현율 불가 — 앞선 리서치 결론).

## 8. 조합 자동화 연결 (파이프라인)
사용자 "PPT 만들어줘" →
1. **proposal-pt-builder v2**: 기존 로직(RFP분석·커버리지매트릭스·콘텐츠·레드팀) → **슬라이드 플랜 JSON**(슬라이드별 layout, asset_ids[], content 바인딩, chart data).
2. **에셋 셀렉터**: manifest.json + thumbnails 조회 → 콘텐츠 형태에 맞는 asset_id 선택("4단계 프로세스"→PRC-004).
3. **컴포저(pptx-automizer)**: 조합 템플릿(마스터) 위에 선택 에셋 import + bindings로 텍스트 주입 + 차트 데이터 치환.
4. **시각 QA**: LibreOffice→PNG→에이전트가 오버플로우/겹침/대비 점검→수정 루프.
5. 편집가능 .pptx 출력.
manifest의 `anchor`(그룹명) + `bindings`(슬롯) = 컴포저가 필요로 하는 전부.

## 9. 환경 의존성
- 설치됨: python-pptx 1.0.2, pymupdf, node 22.
- **미설치: LibreOffice(soffice)** — 썸네일·시각QA에 필요. 생성에는 불필요(현재 진행 가능). WSL에 `apt install libreoffice` 필요(설치 전까지 thumbnail=pending).
