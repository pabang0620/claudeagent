# Testing Requirements

> 판정 기준 SSOT는 `agents/lee-wonho.md`. 테스트 전략(유닛/통합 범위·커버리지 수치)은 CLAUDE_DISCRETION 목록에 해당 - 사용자에게 묻지 말고 Claude가 필요하다고 판단하면 넣는다.

## 실제 워크플로우

- 사용자가 요청하면 최종 손테스트 전에 Claude가 Playwright로 E2E 워크스루를 한다. 이 문장은 트리거가 아니다: "손테스트 진행할게"는 사용자가 직접 테스트한다는 뜻이므로 환경 기동(서버·계정)까지만 해두고 대기하며, Playwright는 명시 요청 시에만 돌린다(메모리 feedback_hand_test_means_user_tests, feedback_no_unsolicited_playwright).
- 유닛 테스트·통합 테스트의 범위와 커버리지 수치는 Claude 재량이다. 사용자는 이 영역에 의견을 갖지 않는다.
- 사용자 원문: "유닛테스트가 뭔데 그것도 필요하면 넣어야지. 너가 항상 테스트해줘서 몰라. 그냥 최종 손테스트 전에는 항상 e2e 테스트를 시켰을 뿐"
- 80% 커버리지 등 상시 강제 수치는 없다. `feedback_test_policy_is_handoff_gate` 참고 - 커버리지 기준은 "테스트 맡길게" 시점의 인수 게이트로만 적용되고, 개발 중 상시 기준이 아니다.

## Test-Driven Development

TDD 절차 (Claude 재량 영역 - 필요하다고 판단될 때 적용):
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage as needed

## Troubleshooting Test Failures

1. 원인이 분명하면 메인이 직접 고친다. 재현이 어렵거나 회귀 위험이 크면 tdd-guide에 맡긴다
2. Check test isolation
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)

## Agent Support

- **tdd-guide** - 재현이 어렵거나 회귀 위험이 큰 버그·로직에 실패 테스트를 먼저 쓴다 (`rules/agents.md` 버그 수정 행)
- **playwright-verify-loop** - 브라우저를 직접 운전하며 기능 워크스루·오류 수집 (최종 손테스트 직전 E2E 담당)
