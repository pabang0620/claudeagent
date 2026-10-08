---
description: 코드 변경을 README·docs/에 반영한다. "/update-docs", "README 갱신", "문서 반영해줘". doc-updater 에이전트에 위임.
---

# Update Documentation

doc-updater 에이전트에 위임한다. 스폰 프롬프트에 대상 프로젝트 절대경로와 반영할 변경 요약을 적는다.

1. 정본은 코드다: package.json scripts, .env.example, 실제 라우트·폴더 구조를 읽고 문서가 다르면 문서를 고친다.
2. 기존 문서(README, docs/*)를 갱신한다. 새 문서(CONTRIB·RUNBOOK 등)는 레포에 그 관례가 이미 있을 때만 만든다. 문서 삭제·이동은 하지 않는다.
3. 90일 이상 안 바뀐 문서는 고치지 않고 목록으로 보고한다.
4. 보고(15줄 이내): 고친 파일 / 바뀐 내용 요약 / 손봐야 할 낡은 문서 목록.
