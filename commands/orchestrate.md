---
description: 여러 파일에 걸친 신규 기능·큰 리팩토링을 계획-구현 순서로 돌린다. "/orchestrate feature|refactor <설명>". 단건 수정·버그에는 쓰지 않는다(메인 직접).
---

# Orchestrate

`rules/agents.md` "표준 워크플로우"를 그대로 실행한다. 이 커맨드는 순서를 고정할 뿐 새 규칙을 만들지 않는다.

## feature
1. planner: 계획 문서(단계·파일·완료 조건). 리뷰 단계·시간 견적은 넣지 않는다.
2. 구현: 지금 대화 맥락이 필요하면 fork로 묶음을 나눠 병렬, 아니면 react-specialist / express-engineer. 파일 소유를 겹치지 않게 나눈다.
3. 메인이 diff·빌드·실행으로 확인한다. 인증·결제·업로드·개인정보를 건드렸으면 security-reviewer를 추가한다.

## refactor
- 구조 개편·컴포넌트 분리: planner → react-specialist / express-engineer
- 미사용 코드·패키지 정리: refactor-cleaner (1단계 후보 보고 → 승인 목록만 제거)

## bugfix
커맨드로 돌리지 않는다. 메인이 직접 고치고, 재현이 어렵거나 회귀 위험이 크면 tdd-guide로 실패 테스트만 먼저 쓴다.

## 인계
에이전트 간 인계는 스폰 프롬프트에 직접 적는다: 바뀐 파일 목록, 결정 사항, 미해결 항목. 별도 인계 문서 파일은 만들지 않는다.

## 보고
변경 파일 목록 / 확인 방법과 결과 / 남은 항목. 리뷰는 사용자가 요청할 때만.
