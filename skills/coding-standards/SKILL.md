---
name: coding-standards
description: JavaScript, TypeScript, React, Node.js 개발을 위한 범용 코딩 표준 및 베스트 프랙티스
---

# 코딩 표준 & 베스트 프랙티스

모든 프로젝트에 적용 가능한 범용 코딩 표준

## 코드 품질 원칙

### 1. 가독성 우선
- 코드는 쓰는 것보다 읽는 것이 더 많다
- 명확한 변수명과 함수명
- 주석보다 자체 설명이 가능한 코드 선호
- 일관된 포맷팅

### 2. KISS (Keep It Simple, Stupid)
- 가장 단순한 해결책 선택
- 과도한 엔지니어링 지양
- 조기 최적화 금지
- 영리한 코드보다 이해하기 쉬운 코드

### 3. DRY (Don't Repeat Yourself)
- 공통 로직을 함수로 추출
- 재사용 가능한 컴포넌트 생성
- 모듈 간 유틸리티 공유
- 복사-붙여넣기 프로그래밍 지양

### 4. YAGNI (You Aren't Gonna Need It)
- 필요하기 전에 기능 만들지 않기
- 추측성 일반화 지양
- 필요할 때만 복잡성 추가
- 단순하게 시작, 필요시 리팩토링

## JavaScript/TypeScript 표준

### 변수 네이밍

```javascript
// ✅ 좋은 예: 설명적인 이름
const marketSearchQuery = 'election';
const isUserAuthenticated = true;
const totalRevenue = 1000;

// ❌ 나쁜 예: 불명확한 이름
const q = 'election';
const flag = true;
const x = 1000;
```

### 함수 네이밍

```javascript
// ✅ 좋은 예: 동사-명사 패턴
async function fetchMarketData(marketId) { }
function calculateSimilarity(a, b) { }
function isValidEmail(email) { return true; }

// ❌ 나쁜 예: 불명확하거나 명사만 사용
async function market(id) { }
function similarity(a, b) { }
function email(e) { }
```

### 불변성 패턴 (중요)

```javascript
// ✅ 항상 스프레드 연산자 사용
const updatedUser = {
  ...user,
  name: '새 이름'
};

const updatedArray = [...items, newItem];

// ❌ 절대 직접 변경 금지
user.name = '새 이름';  // 나쁜 예
items.push(newItem);     // 나쁜 예
```

### 에러 처리

```javascript
// ✅ 좋은 예: 포괄적인 에러 처리
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('요청 실패:', error);
    throw new Error('데이터 조회에 실패했습니다.');
  }
}

// ❌ 나쁜 예: 에러 처리 없음
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
```

### Async/Await 베스트 프랙티스

```javascript
// ✅ 좋은 예: 가능하면 병렬 실행
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
]);

// ❌ 나쁜 예: 불필요한 순차 실행
const users = await fetchUsers();
const markets = await fetchMarkets();
const stats = await fetchStats();
```

### 타입 안전성

```javascript
// ✅ 좋은 예: 적절한 타입 (TypeScript)
interface Market {
  id: string;
  name: string;
  status: 'active' | 'resolved' | 'closed';
  created_at: Date;
}

function getMarket(id: string): Promise<Market> {
  // 구현
}

// ❌ 나쁜 예: any 사용
function getMarket(id: any): Promise<any> {
  // 구현
}
```

## React 베스트 프랙티스

### 컴포넌트 구조

```javascript
// ✅ 좋은 예: 타입이 있는 함수형 컴포넌트
function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ 나쁜 예: 타입 없음, 불명확한 구조
function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### 커스텀 Hooks

```javascript
// ✅ 좋은 예: 재사용 가능한 커스텀 훅
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// 사용법
const debouncedQuery = useDebounce(searchQuery, 500);
```

### 상태 관리

```javascript
// ✅ 좋은 예: 적절한 상태 업데이트
const [count, setCount] = useState(0);

// 이전 상태 기반 함수형 업데이트
setCount(prev => prev + 1);

// ❌ 나쁜 예: 직접 참조 (비동기 시나리오에서 stale 가능)
setCount(count + 1);
```

### 조건부 렌더링

```javascript
// ✅ 좋은 예: 명확한 조건부 렌더링
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ 나쁜 예: 삼항 연산자 지옥
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API 설계 표준

### REST API 컨벤션

```
GET    /api/markets              # 모든 마켓 조회
GET    /api/markets/:id          # 특정 마켓 조회
POST   /api/markets              # 새 마켓 생성
PUT    /api/markets/:id          # 마켓 전체 업데이트
PATCH  /api/markets/:id          # 마켓 부분 업데이트
DELETE /api/markets/:id          # 마켓 삭제

# 필터링을 위한 쿼리 파라미터
GET /api/markets?status=active&limit=10&offset=0
```

### 응답 형식

```javascript
// ✅ 좋은 예: 일관된 응답 구조
// 성공 응답
return res.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 },
  msg: '마켓 목록 조회 성공'
});

// 에러 응답
return res.status(400).json({
  success: false,
  data: null,
  error: '잘못된 요청입니다.',
  msg: '요청 데이터가 유효하지 않습니다.'
});
```

### 입력 유효성 검사

```javascript
const { z } = require('zod');

// ✅ 좋은 예: 스키마 유효성 검사
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
});

async function createMarket(req, res) {
  const body = req.body;

  try {
    const validated = CreateMarketSchema.parse(body);
    // 검증된 데이터로 진행
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        msg: '유효성 검사 실패',
        details: error.errors
      });
    }
  }
}
```

## 파일 구조

### 프로젝트 구조

```
src/
├── app/                    # 애플리케이션 진입점
├── components/             # React 컴포넌트
│   ├── ui/                # 범용 UI 컴포넌트
│   ├── forms/             # 폼 컴포넌트
│   └── layouts/           # 레이아웃 컴포넌트
├── hooks/                 # 커스텀 React Hooks
├── lib/                   # 유틸리티 및 설정
│   ├── api/              # API 클라이언트
│   ├── utils/            # 헬퍼 함수
│   └── constants/        # 상수
├── types/                 # TypeScript 타입
└── styles/               # 전역 스타일
```

### 파일 네이밍

```
components/Button.jsx          # 컴포넌트는 PascalCase
hooks/useAuth.js              # 훅은 camelCase, 'use' 접두사
lib/formatDate.js             # 유틸리티는 camelCase
types/market.types.js         # 타입은 camelCase, .types 접미사
```

## 주석 & 문서화

### 언제 주석을 작성할까

```javascript
// ✅ 좋은 예: WHY를 설명, WHAT이 아니라
// API 중단 시 과부하를 방지하기 위해 지수 백오프 사용
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// 큰 배열에서 성능을 위해 의도적으로 mutation 사용
items.push(newItem);

// ❌ 나쁜 예: 명백한 것을 설명
// 카운터를 1 증가
count++;

// 이름을 사용자의 이름으로 설정
name = user.name;
```

### 공개 API를 위한 JSDoc

```javascript
/**
 * 의미론적 유사도를 사용하여 마켓을 검색합니다.
 *
 * @param {string} query - 자연어 검색 쿼리
 * @param {number} limit - 최대 결과 수 (기본값: 10)
 * @returns {Promise<Market[]>} 유사도 점수로 정렬된 마켓 배열
 * @throws {Error} OpenAI API 실패 또는 Redis 사용 불가 시
 *
 * @example
 * ```javascript
 * const results = await searchMarkets('election', 5);
 * console.log(results[0].name); // "Trump vs Biden"
 * ```
 */
async function searchMarkets(query, limit = 10) {
  // 구현
}
```

## 성능 베스트 프랙티스

### 메모이제이션

```javascript
import { useMemo, useCallback } from 'react';

// ✅ 좋은 예: 비용이 큰 계산 메모이제이션
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume);
}, [markets]);

// ✅ 좋은 예: 콜백 메모이제이션
const handleSearch = useCallback((query) => {
  setSearchQuery(query);
}, []);
```

### 지연 로딩

```javascript
import { lazy, Suspense } from 'react';

// ✅ 좋은 예: 무거운 컴포넌트 지연 로딩
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### 데이터베이스 쿼리

```javascript
// ✅ 좋은 예: 필요한 컬럼만 선택 (Prisma)
const markets = await prisma.market.findMany({
  select: {
    id: true,
    name: true,
    status: true
  },
  take: 10
});

// ❌ 나쁜 예: 모든 것 선택
const markets = await prisma.market.findMany();
```

## 테스트 표준

### 테스트 구조 (AAA 패턴)

```javascript
test('유사도를 올바르게 계산한다', () => {
  // Arrange (준비)
  const vector1 = [1, 0, 0];
  const vector2 = [0, 1, 0];

  // Act (실행)
  const similarity = calculateCosineSimilarity(vector1, vector2);

  // Assert (검증)
  expect(similarity).toBe(0);
});
```

### 테스트 네이밍

```javascript
// ✅ 좋은 예: 설명적인 테스트 이름
test('쿼리와 일치하는 마켓이 없을 때 빈 배열을 반환한다', () => { });
test('OpenAI API 키가 없을 때 에러를 발생시킨다', () => { });
test('Redis 사용 불가 시 부분 문자열 검색으로 폴백한다', () => { });

// ❌ 나쁜 예: 모호한 테스트 이름
test('작동한다', () => { });
test('검색 테스트', () => { });
```

## 코드 스멜 탐지

주의해야 할 안티패턴:

### 1. 긴 함수
```javascript
// ❌ 나쁜 예: 50줄 이상의 함수
function processMarketData() {
  // 100줄의 코드
}

// ✅ 좋은 예: 작은 함수로 분리
function processMarketData() {
  const validated = validateData();
  const transformed = transformData(validated);
  return saveData(transformed);
}
```

### 2. 깊은 중첩
```javascript
// ❌ 나쁜 예: 5단계 이상 중첩
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // 무언가 수행
        }
      }
    }
  }
}

// ✅ 좋은 예: 조기 반환
if (!user) return;
if (!user.isAdmin) return;
if (!market) return;
if (!market.isActive) return;
if (!hasPermission) return;

// 무언가 수행
```

### 3. 매직 넘버
```javascript
// ❌ 나쁜 예: 설명 없는 숫자
if (retryCount > 3) { }
setTimeout(callback, 500);

// ✅ 좋은 예: 이름이 있는 상수
const MAX_RETRIES = 3;
const DEBOUNCE_DELAY_MS = 500;

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS);
```

---

**핵심**: 코드 품질은 타협할 수 없습니다. 명확하고 유지보수 가능한 코드는 빠른 개발과 자신감 있는 리팩토링을 가능하게 합니다.

---

## WeCom 회고 기반 추가 표준 (347 fix 분석 교훈)

### 컨벤션 강제 (convention-enforcer 스킬 참조)
- navigate/Link 경로 문자열 리터럴 금지 → ROUTES 상수 사용
- useParams 변수명은 라우트 정의 `:paramName` 과 일치 필수
- admin*Routes.js 에 requireAdmin 미사용 시 부팅 실패
- .env.example 필수, zod 런타임 검증

### 파일 규칙
- 컴포넌트: PascalCase.jsx
- 훅: use*.js
- 함수 50줄 미만, 파일 800줄 미만
- pages/mobile/* 복제 디렉터리 금지

### 에러 방지 (error-prevention-rules 스킬 참조)
- useEffect fetch → AbortController cleanup
- img onError → onerror=null 자기 해제
- setTimeout/setInterval/Observer → useEffect cleanup
- addEventListener → removeEventListener
- localStorage.setItem → try/catch (iOS Safari)
