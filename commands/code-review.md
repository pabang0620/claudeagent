---
description: 사용자가 리뷰를 요청했을 때만 code-reviewer 스킬을 실행한다. "/code-review", "리뷰해줘", "검토해봐". 코드 변경 뒤 자동 실행 금지(전역 규칙).
---

# Code Review

code-reviewer 스킬을 실행한다(에이전트가 아니다). 범위·체크 항목·보고 형식은 스킬 본문(`skills/code-reviewer/SKILL.md`)을 따른다.

인자로 범위를 넘긴다: 프로젝트 절대경로, 커밋 범위 또는 "미커밋 변경". 없으면 `git diff HEAD` 기준.

보고는 한국어, 심각도순, 파일·줄 번호·수정안 포함. CRITICAL·HIGH가 있으면 맨 위에 "커밋 보류 권장"을 적는다(커밋을 막는 훅은 없다). 보안은 diff에 보이는 것만 보고, 인증·결제·업로드가 바뀌었으면 security-reviewer를 권한다.
