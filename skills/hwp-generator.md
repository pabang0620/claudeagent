---
name: hwp-generator
description: HWPX 공문서를 kordoc으로 생성한다. "hwp 만들어", "hwpx 만들어", "계약서 만들어", "제안요청서", "보고서 만들어", "공문 작성", "회의록", "계획서" 키워드로 활성화. DOCX 생성은 doc-generator를 쓴다.
allowed-tools: [Bash]
---

## 쓸 때 / 쓰지 않을 때

- **쓸 때**: 계약서·용역계약서·제안요청서·보고서·공문·기안문·계획서·회의록 → `.hwpx` 파일로 생성
- **쓰지 않을 때**: DOCX → `doc-generator` / 발표자료(PT) → `proposal-pt-builder`

## 실행

1. 환경 확인 (최초 1회):
   ```bash
   node -e "require('/home/pabang/myapp/node_modules/kordoc')" 2>/dev/null && echo "OK" || echo "MISSING"
   ```
   - `MISSING` → `cd /home/pabang/myapp && npm install kordoc`

2. 확인 통과 후 `hwp-generator` 에이전트 실행, 사용자 원문 메시지와 컨텍스트를 그대로 전달.

## 지원 문서 유형 & 프리셋

| 문서 | 프리셋 |
|------|--------|
| 계약서, 용역계약서, 위탁계약서 | 공문 |
| 제안요청서, RFP, 제안서 | 보고서 |
| 보고서, 결과보고서 | 보고서 |
| 공문, 기안문, 시행문 | 공문 |
| 계획서, 사업계획서 | 계획서 |
| 회의록 | 회의록 |

## 산출물

- `.hwpx` 파일 (한글 2010+ 에서 바로 열기/수정 가능)
- 기본 저장 위치: `~/Documents/{문서종류}_{날짜}.hwpx`
- 핵심 스크립트: `/home/pabang/myapp/scripts/gen_hwpx.js`
