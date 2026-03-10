---
name: tdd-workflow
description: 새 기능, 버그 수정, 리팩토링 시 사용. Jest, Playwright를 활용한 TDD 워크플로우 및 80% 이상 커버리지 강제
---

# 테스트 주도 개발 (TDD) 워크플로우

모든 코드 개발이 TDD 원칙을 따르고 포괄적인 테스트 커버리지를 갖추도록 보장합니다.

## 언제 활성화하나

- 새로운 기능 또는 기능 작성 시
- 버그 또는 이슈 수정 시
- 기존 코드 리팩토링 시
- API 엔드포인트 추가 시
- 새 컴포넌트 생성 시

## 핵심 원칙

### 1. 코드보다 테스트가 먼저
항상 테스트를 먼저 작성하고, 테스트를 통과시키기 위해 코드를 구현합니다.

### 2. 커버리지 요구사항
- 최소 80% 커버리지 (단위 + 통합 + E2E)
- 모든 엣지 케이스 커버
- 에러 시나리오 테스트
- 경계 조건 검증

### 3. 테스트 유형

#### 단위 테스트 (Jest)
- 개별 함수와 유틸리티
- 컴포넌트 로직
- 순수 함수
- 헬퍼 및 유틸리티

#### 통합 테스트
- API 엔드포인트
- 데이터베이스 작업
- 서비스 상호작용
- 외부 API 호출

#### E2E 테스트 (Playwright)
- 핵심 사용자 플로우
- 완전한 워크플로우
- 브라우저 자동화
- UI 상호작용

## TDD 워크플로우 단계

### 1단계: 사용자 여정 작성
```
[역할]로서, [액션]을 하고 싶다, 그래서 [이익]을 얻을 수 있다.

예시:
사용자로서, 의미론적으로 마켓을 검색하고 싶다,
그래서 정확한 키워드 없이도 관련 마켓을 찾을 수 있다.
```

### 2단계: 테스트 케이스 생성
각 사용자 여정에 대해 포괄적인 테스트 케이스 생성:

```javascript
describe('의미론적 검색', () => {
  it('쿼리에 대해 관련 마켓을 반환한다', async () => {
    // 테스트 구현
  });

  it('빈 쿼리를 우아하게 처리한다', async () => {
    // 엣지 케이스 테스트
  });

  it('Redis 사용 불가 시 부분 문자열 검색으로 폴백한다', async () => {
    // 폴백 동작 테스트
  });

  it('유사도 점수로 결과를 정렬한다', async () => {
    // 정렬 로직 테스트
  });
});
```

### 3단계: 테스트 실행 (실패해야 함)
```bash
npm test
# 테스트가 실패해야 함 - 아직 구현하지 않음
```

### 4단계: 코드 구현
테스트를 통과시키기 위한 최소한의 코드 작성:

```javascript
// 테스트에 의해 가이드되는 구현
async function searchMarkets(query) {
  // 여기에 구현
}
```

### 5단계: 테스트 재실행
```bash
npm test
# 이제 테스트가 통과해야 함
```

### 6단계: 리팩토링
테스트를 green 상태로 유지하면서 코드 품질 개선:
- 중복 제거
- 네이밍 개선
- 성능 최적화
- 가독성 향상

### 7단계: 커버리지 검증
```bash
npm run test:coverage
# 80% 이상 커버리지 달성 확인
```

## 테스트 패턴

### 단위 테스트 패턴 (Jest)

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button 컴포넌트', () => {
  it('올바른 텍스트로 렌더링된다', () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByText('클릭하세요')).toBeInTheDocument();
  });

  it('클릭 시 onClick을 호출한다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled prop이 true일 때 비활성화된다', () => {
    render(<Button disabled>클릭</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### API 통합 테스트 패턴

```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/markets', () => {
  it('마켓을 성공적으로 반환한다', async () => {
    const response = await request(app)
      .get('/api/markets')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('쿼리 파라미터를 검증한다', async () => {
    const response = await request(app)
      .get('/api/markets?limit=invalid')
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('데이터베이스 에러를 우아하게 처리한다', async () => {
    // 데이터베이스 실패 모킹
    // 에러 처리 테스트
  });
});
```

### E2E 테스트 패턴 (Playwright)

```javascript
const { test, expect } = require('@playwright/test');

test('사용자가 마켓을 검색하고 필터링할 수 있다', async ({ page }) => {
  // 마켓 페이지로 이동
  await page.goto('/');
  await page.click('a[href="/markets"]');

  // 페이지 로딩 확인
  await expect(page.locator('h1')).toContainText('마켓');

  // 마켓 검색
  await page.fill('input[placeholder="마켓 검색"]', 'election');

  // 디바운스 및 결과 대기
  await page.waitForTimeout(600);

  // 검색 결과 표시 확인
  const results = page.locator('[data-testid="market-card"]');
  await expect(results).toHaveCount(5, { timeout: 5000 });

  // 결과에 검색어 포함 확인
  const firstResult = results.first();
  await expect(firstResult).toContainText('election', { ignoreCase: true });

  // 상태로 필터링
  await page.click('button:has-text("활성")');

  // 필터링된 결과 확인
  await expect(results).toHaveCount(3);
});

test('사용자가 새 마켓을 생성할 수 있다', async ({ page }) => {
  // 먼저 로그인
  await page.goto('/creator-dashboard');

  // 마켓 생성 폼 작성
  await page.fill('input[name="name"]', '테스트 마켓');
  await page.fill('textarea[name="description"]', '테스트 설명');
  await page.fill('input[name="endDate"]', '2025-12-31');

  // 폼 제출
  await page.click('button[type="submit"]');

  // 성공 메시지 확인
  await expect(page.locator('text=마켓이 성공적으로 생성되었습니다')).toBeVisible();

  // 마켓 페이지로 리디렉트 확인
  await expect(page).toHaveURL(/\/markets\/test-market/);
});
```

## 테스트 파일 구조

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.jsx          # 단위 테스트
│   │   └── Button.stories.jsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.jsx
│       └── MarketCard.test.jsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.js
│           └── route.test.js         # 통합 테스트
└── e2e/
    ├── markets.spec.js               # E2E 테스트
    ├── trading.spec.js
    └── auth.spec.js
```

## 외부 서비스 모킹

### Prisma 모킹
```javascript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    market: {
      findMany: jest.fn(() => Promise.resolve([
        { id: 1, name: '테스트 마켓' }
      ]))
    }
  }
}));
```

### Redis 모킹
```javascript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}));
```

### OpenAI 모킹
```javascript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // 1536차원 임베딩 모킹
  ))
}));
```

## 테스트 커버리지 검증

### 커버리지 리포트 실행
```bash
npm run test:coverage
```

### 커버리지 임계값
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 피해야 할 일반적인 테스트 실수

### ❌ 잘못됨: 구현 세부사항 테스트
```javascript
// 내부 상태 테스트하지 않기
expect(component.state.count).toBe(5);
```

### ✅ 올바름: 사용자 관점에서 테스트
```javascript
// 사용자가 보는 것 테스트
expect(screen.getByText('카운트: 5')).toBeInTheDocument();
```

### ❌ 잘못됨: 취약한 셀렉터
```javascript
// 쉽게 깨짐
await page.click('.css-class-xyz');
```

### ✅ 올바름: 의미론적 셀렉터
```javascript
// 변경에 강함
await page.click('button:has-text("제출")');
await page.click('[data-testid="submit-button"]');
```

### ❌ 잘못됨: 테스트 격리 없음
```javascript
// 테스트가 서로 의존
test('사용자 생성', () => { /* ... */ });
test('같은 사용자 업데이트', () => { /* 이전 테스트에 의존 */ });
```

### ✅ 올바름: 독립적인 테스트
```javascript
// 각 테스트가 자체 데이터 설정
test('사용자 생성', () => {
  const user = createTestUser();
  // 테스트 로직
});

test('사용자 업데이트', () => {
  const user = createTestUser();
  // 업데이트 로직
});
```

## 지속적인 테스트

### 개발 중 Watch 모드
```bash
npm test -- --watch
# 파일 변경 시 자동으로 테스트 실행
```

### Pre-Commit Hook
```bash
# 모든 커밋 전에 실행
npm test && npm run lint
```

### CI/CD 통합
```yaml
# GitHub Actions
- name: 테스트 실행
  run: npm test -- --coverage
- name: 커버리지 업로드
  uses: codecov/codecov-action@v3
```

## 베스트 프랙티스

1. **테스트 먼저 작성** - 항상 TDD
2. **테스트당 하나의 검증** - 단일 동작에 집중
3. **설명적인 테스트 이름** - 무엇을 테스트하는지 설명
4. **AAA 패턴** - Arrange-Act-Assert 명확한 구조
5. **외부 의존성 모킹** - 단위 테스트 격리
6. **엣지 케이스 테스트** - null, undefined, empty, large
7. **에러 경로 테스트** - happy path만이 아님
8. **테스트 빠르게 유지** - 단위 테스트 각 50ms 미만
9. **테스트 후 정리** - 부작용 없음
10. **커버리지 리포트 검토** - 빈 곳 식별

## 성공 지표

- 80% 이상 코드 커버리지 달성
- 모든 테스트 통과 (green)
- 건너뛰거나 비활성화된 테스트 없음
- 빠른 테스트 실행 (단위 테스트 30초 미만)
- E2E 테스트가 핵심 사용자 플로우 커버
- 프로덕션 전에 버그를 잡는 테스트

---

**핵심**: 테스트는 선택 사항이 아닙니다. 테스트는 자신감 있는 리팩토링, 빠른 개발, 프로덕션 안정성을 가능하게 하는 안전망입니다.
