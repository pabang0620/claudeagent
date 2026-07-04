---
name: proposal-pt
description: 나라장터·공공기관 정부사업 RFP 제안 발표자료(PT)를 Marp + Mermaid로 생성하고 PPTX로 변환한다. "/proposal-pt", "제안PT 만들어", "발표자료 만들어", "제안서 슬라이드" 호출 시 사용. "RFP·입찰·제안서" 맥락이 없는 일반 발표자료 요청, 일반 문서(.docx)나 사내 보고서 슬라이드에는 쓰지 않는다.
allowed-tools: [Bash]
---

## 사용 시점
- **쓸 때**: 나라장터·공공기관(NIA·IITP·KIAT 등) RFP 대응 제안 발표자료(PT/PPTX)
- **쓰지 않을 때**: 일반 Word 문서(.docx → `doc-generator`), 사내 일반 보고서, 단순 텍스트 문서

## 실행
1. 환경 점검 (최초 1회):
   ```bash
   command -v marp >/dev/null && echo "marp OK" || echo "marp 미설치 — npm install -g @marp-team/marp-cli"
   ls ~/.claude/templates/marp/gov-proposal.css >/dev/null 2>&1 && echo "테마 OK" || echo "테마 없음 — ~/.claude/templates/marp/gov-proposal.css 필요"
   ```
   점검 실패 시: 설치 안내 메시지를 사용자에게 출력하고 에이전트 실행을 중단한다.
2. 점검 통과 후 `proposal-pt-builder` 에이전트(`~/.claude/agents/proposal-pt-builder.md`)를 실행하고 사용자 원문 메시지와 현재 대화 컨텍스트를 그대로 전달한다.
3. 에이전트가 **저장 위치를 가장 먼저 질문**하므로, 호출 전에 저장 경로를 미리 알려주면 단계가 줄어든다.

## 산출물
- Marp 마크다운(`.md`) + 변환된 발표자료(`.pptx`)
  예: `[기관명]-[사업명]-proposal.md` / `[기관명]-[사업명]-proposal.pptx`
- 저장 위치: 에이전트가 사용자에게 직접 질문해 확정
