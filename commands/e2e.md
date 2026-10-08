---
description: Playwright `npx playwright test` 스위트를 만들고 실행한다. "/e2e <플로우>", "E2E 테스트 짜줘". 브라우저를 직접 눌러보는 검증은 playwright-verify-loop 에이전트이고 이 커맨드가 아니다.
---

# E2E

`npx playwright test` 스위트 생성·실행. 전담 에이전트는 없다(e2e-runner는 2026-08-20 보관). 시나리오가 1~2개면 메인이 직접 쓰고, 많으면 general-purpose에 아래 규칙을 실어 위임한다.

규칙:
- 테스트 파일은 대상 프로젝트의 기존 `tests/e2e/` 또는 `e2e/` 구조와 `playwright.config` 실측을 따른다. 없으면 만들기 전에 보고한다.
- 선택자는 `data-testid` 우선, 대기는 요소·응답 기준(고정 timeout 금지).
- 실패 시 스크린샷·trace는 `playwright-report/`에 남기고, 통과 후 캡처는 삭제한다.
- 불안정 테스트는 3회 재실행 결과를 적고 `test.fixme()`로 격리한다.

보고(15줄 이내): 생성 파일 / 통과·실패·불안정 수 / 실패 원인 요약 / 리포트 경로.

커버리지 수치는 측정값만 보고한다(80%는 "테스트 맡길게" 인수 게이트에서만).
