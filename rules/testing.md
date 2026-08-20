# Testing Requirements

> 판정 기준 SSOT는 `~/.claude/agents/lee-wonho.md`. 테스트 전략(유닛/통합 범위·커버리지 수치)은 CLAUDE_DISCRETION 목록에 해당 - 사용자에게 묻지 말고 Claude가 필요하다고 판단하면 넣는다.

## 실제 워크플로우

- 최종 손테스트 직전에는 항상 Claude가 Playwright로 E2E 테스트를 수행한다. 그 다음 사용자가 최종 손테스트를 진행한다.
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

1. Use **tdd-guide** agent
2. Check test isolation
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)

## Agent Support

- **tdd-guide** - Use PROACTIVELY for new features, enforces write-tests-first
- **playwright-verify-loop** - 브라우저를 직접 운전하며 기능 워크스루·오류 수집 (최종 손테스트 직전 E2E 담당)
