---
description: 테스트 주도 개발 워크플로우 강제. 인터페이스 스캐폴딩, 테스트 먼저 생성, 그 다음 테스트를 통과하는 최소한의 코드 구현. 80%+ 커버리지 보장.
---

# TDD Command

이 명령은 **tdd-guide** 에이전트를 호출하여 테스트 주도 개발 방법론을 강제합니다.

## 이 명령이 하는 일

1. **인터페이스 스캐폴딩** - 타입/인터페이스 먼저 정의
2. **테스트 먼저 생성** - 실패하는 테스트 작성 (RED)
3. **최소한의 코드 구현** - 테스트를 통과하는 만큼만 작성 (GREEN)
4. **리팩토링** - 테스트를 통과 상태로 유지하면서 코드 개선 (REFACTOR)
5. **커버리지 검증** - 80%+ 테스트 커버리지 보장

## 언제 사용하나요

다음 경우 `/tdd` 사용:
- 새 기능 구현
- 새 함수/컴포넌트 추가
- 버그 수정 (버그를 재현하는 테스트를 먼저 작성)
- 기존 코드 리팩토링
- 중요한 비즈니스 로직 구축

## 작동 방식

tdd-guide 에이전트는:

1. **인터페이스 정의** - 입력/출력용
2. **실패할 테스트 작성** (코드가 아직 존재하지 않기 때문에)
3. **테스트 실행** 및 올바른 이유로 실패하는지 검증
4. **최소한의 구현 작성** - 테스트를 통과하도록
5. **테스트 실행** 및 통과 검증
6. **리팩토링** - 테스트를 통과 상태로 유지하면서 코드 개선
7. **커버리지 확인** - 80% 미만이면 더 많은 테스트 추가

## TDD 사이클

```
RED → GREEN → REFACTOR → REPEAT

RED:      실패하는 테스트 작성
GREEN:    테스트를 통과하는 최소한의 코드 작성
REFACTOR: 테스트를 통과 상태로 유지하며 코드 개선
REPEAT:   다음 기능/시나리오
```

## 사용 예시

```
User: /tdd 마켓 유동성 점수를 계산하는 함수가 필요해

Agent (tdd-guide):
# TDD 세션: 마켓 유동성 점수 계산기

## 단계 1: 인터페이스 정의 (SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

## 단계 2: 실패하는 테스트 작성 (RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('유동성이 높은 마켓은 높은 점수를 반환해야 한다', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## Step 3: Run Tests - Verify FAIL

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ Tests fail as expected. Ready to implement.

## Step 4: Implement Minimal Code (GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // Handle zero volume edge case
  if (market.totalVolume === 0) {
    return 0
  }

  // Calculate component scores (0-100 scale)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // Recent activity bonus
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // Weighted average
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // Clamp to 0-100
}
```

## Step 5: Run Tests - Verify PASS

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ All tests passing!

## Step 6: Refactor (IMPROVE)

```typescript
// lib/liquidity.ts - Refactored with constants and better readability
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## Step 7: Verify Tests Still Pass

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ Refactoring complete, tests still passing!

## Step 8: Check Coverage

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD session complete!
```

## TDD 모범 사례

**해야 할 것:**
- ✅ 구현 전에 테스트를 먼저 작성
- ✅ 구현하기 전에 테스트를 실행하여 실패 확인
- ✅ 테스트를 통과하는 최소한의 코드 작성
- ✅ 테스트가 통과한 후에만 리팩토링
- ✅ 엣지 케이스와 에러 시나리오 추가
- ✅ 80%+ 커버리지 목표 (중요한 코드는 100%)

**하지 말아야 할 것:**
- ❌ 테스트 전에 구현 작성
- ❌ 각 변경 후 테스트 실행 생략
- ❌ 한 번에 너무 많은 코드 작성
- ❌ 실패하는 테스트 무시
- ❌ 구현 세부사항 테스트 (동작을 테스트)
- ❌ 모든 것을 mock (통합 테스트 선호)

## 포함할 테스트 타입

**단위 테스트** (함수 레벨):
- Happy path 시나리오
- 엣지 케이스 (빈 값, null, 최대값)
- 에러 조건
- 경계값

**통합 테스트** (컴포넌트 레벨):
- API 엔드포인트
- 데이터베이스 작업
- 외부 서비스 호출
- 훅이 있는 React 컴포넌트

**E2E 테스트** (`/e2e` 명령 사용):
- 중요한 사용자 플로우
- 다단계 프로세스
- 풀스택 통합

## 커버리지 요구사항

- **모든 코드 80% 최소**
- **다음은 100% 필수:**
  - 금융 계산
  - 인증 로직
  - 보안 중요 코드
  - 핵심 비즈니스 로직

## 중요 참고사항

**필수**: 테스트는 구현 전에 작성되어야 합니다. TDD 사이클은:

1. **RED** - 실패하는 테스트 작성
2. **GREEN** - 테스트를 통과하도록 구현
3. **REFACTOR** - 코드 개선

RED 단계를 절대 건너뛰지 마세요. 테스트 전에 코드를 작성하지 마세요.

## 다른 명령과의 통합

- `/plan` - 먼저 무엇을 만들지 이해
- `/tdd` - 테스트와 함께 구현
- `/build-fix` - 빌드 에러 발생 시
- `/code-review` - 구현 검토
- `/test-coverage` - 커버리지 검증

## 관련 에이전트

이 명령은 다음 위치의 `tdd-guide` 에이전트를 호출합니다:
`~/.claude/agents/tdd-guide.md`

다음 위치의 `tdd-workflow` 스킬도 참조할 수 있습니다:
`~/.claude/skills/tdd-workflow/`
