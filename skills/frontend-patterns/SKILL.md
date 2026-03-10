---
name: frontend-patterns
description: React, 상태 관리, 성능 최적화, UI 베스트 프랙티스를 위한 프론트엔드 개발 패턴
---

# 프론트엔드 개발 패턴

React 및 고성능 사용자 인터페이스를 위한 현대적인 프론트엔드 패턴

## 컴포넌트 패턴

### 상속보다 조합

```javascript
// ✅ 좋은 예: 컴포넌트 조합
function Card({ children, variant = 'default' }) {
  return <div className={`card card-${variant}`}>{children}</div>;
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

// 사용법
<Card>
  <CardHeader>제목</CardHeader>
  <CardBody>내용</CardBody>
</Card>
```

### 복합 컴포넌트 (Compound Components)

```javascript
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab은 Tabs 내에서 사용해야 합니다');

  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

// 사용법
<Tabs defaultTab="overview">
  <TabList>
    <Tab id="overview">개요</Tab>
    <Tab id="details">상세</Tab>
  </TabList>
</Tabs>
```

### Render Props 패턴

```javascript
function DataLoader({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// 사용법
<DataLoader url="/api/markets">
  {(markets, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error error={error} />;
    return <MarketList markets={markets} />;
  }}
</DataLoader>
```

## 커스텀 Hooks 패턴

### 상태 관리 Hook

```javascript
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle];
}

// 사용법
const [isOpen, toggleOpen] = useToggle();
```

### 비동기 데이터 페칭 Hook

```javascript
function useQuery(key, fetcher, options) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const error = err;
      setError(error);
      options?.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetcher, options]);

  useEffect(() => {
    if (options?.enabled !== false) {
      refetch();
    }
  }, [key, refetch, options?.enabled]);

  return { data, error, loading, refetch };
}

// 사용법
const { data: markets, loading, error, refetch } = useQuery(
  'markets',
  () => fetch('/api/markets').then(r => r.json()),
  {
    onSuccess: data => console.log('조회함', data.length, '개 마켓'),
    onError: err => console.error('실패:', err)
  }
);
```

### 디바운스 Hook

```javascript
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
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

## 상태 관리 패턴

### Context + Reducer 패턴

```javascript
const MarketContext = createContext();

function marketReducer(state, action) {
  switch (action.type) {
    case 'SET_MARKETS':
      return { ...state, markets: action.payload };
    case 'SELECT_MARKET':
      return { ...state, selectedMarket: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

function MarketProvider({ children }) {
  const [state, dispatch] = useReducer(marketReducer, {
    markets: [],
    selectedMarket: null,
    loading: false
  });

  return (
    <MarketContext.Provider value={{ state, dispatch }}>
      {children}
    </MarketContext.Provider>
  );
}

function useMarkets() {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarkets는 MarketProvider 내에서 사용해야 합니다');
  return context;
}
```

## 성능 최적화

### 메모이제이션

```javascript
import { useMemo, useCallback } from 'react';

// ✅ 비용이 큰 계산을 useMemo로
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume);
}, [markets]);

// ✅ 자식에게 전달되는 함수를 useCallback으로
const handleSearch = useCallback((query) => {
  setSearchQuery(query);
}, []);

// ✅ 순수 컴포넌트에 React.memo
const MarketCard = React.memo(({ market }) => {
  return (
    <div className="market-card">
      <h3>{market.name}</h3>
      <p>{market.description}</p>
    </div>
  );
});
```

### 코드 분할 & 지연 로딩

```javascript
import { lazy, Suspense } from 'react';

// ✅ 무거운 컴포넌트 지연 로딩
const HeavyChart = lazy(() => import('./HeavyChart'));
const ThreeJsBackground = lazy(() => import('./ThreeJsBackground'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>

      <Suspense fallback={null}>
        <ThreeJsBackground />
      </Suspense>
    </div>
  );
}
```

### 긴 목록 가상화

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualMarketList({ markets }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: markets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,  // 예상 행 높이
    overscan: 5  // 추가로 렌더링할 항목
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <MarketCard market={markets[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 폼 처리 패턴

### 제어 컴포넌트 + 유효성 검사

```javascript
function CreateMarketForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endDate: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다';
    } else if (formData.name.length > 200) {
      newErrors.name = '이름은 200자 이하여야 합니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명은 필수입니다';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜는 필수입니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createMarket(formData);
      // 성공 처리
    } catch (error) {
      // 에러 처리
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="마켓 이름"
      />
      {errors.name && <span className="error">{errors.name}</span>}

      {/* 다른 필드 */}

      <button type="submit">마켓 생성</button>
    </form>
  );
}
```

## Error Boundary 패턴

```javascript
class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary가 에러를 잡음:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>문제가 발생했습니다</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 사용법
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 애니메이션 패턴

### Framer Motion 애니메이션

```javascript
import { motion, AnimatePresence } from 'framer-motion';

// ✅ 리스트 애니메이션
function AnimatedMarketList({ markets }) {
  return (
    <AnimatePresence>
      {markets.map(market => (
        <motion.div
          key={market.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <MarketCard market={market} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// ✅ 모달 애니메이션
function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## 접근성 패턴

### 키보드 내비게이션

```javascript
function Dropdown({ options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(options[activeIndex]);
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onKeyDown={handleKeyDown}
    >
      {/* 드롭다운 구현 */}
    </div>
  );
}
```

### 포커스 관리

```javascript
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousFocusRef.current = document.activeElement;

      // 모달에 포커스
      modalRef.current?.focus();
    } else {
      // 닫을 때 포커스 복원
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      {children}
    </div>
  ) : null;
}
```

## 일반적인 실수 피하기

### ❌ 잘못됨: Props Drilling
```javascript
// 여러 단계를 거쳐 props 전달
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>
```

### ✅ 올바름: Context 사용
```javascript
const DataContext = createContext();

<DataContext.Provider value={data}>
  <Parent>
    <Child>
      <GrandChild />  {/* useContext(DataContext)로 접근 */}
    </Child>
  </Parent>
</DataContext.Provider>
```

### ❌ 잘못됨: useEffect 의존성 누락
```javascript
useEffect(() => {
  fetchData(userId);  // userId가 변경되어도 재실행 안됨
}, []);
```

### ✅ 올바름: 모든 의존성 포함
```javascript
useEffect(() => {
  fetchData(userId);
}, [userId]);  // userId 변경 시 재실행
```

### ❌ 잘못됨: 인라인 객체/함수
```javascript
// 매 렌더링마다 새 객체 생성 → 불필요한 재렌더링
<Component config={{ option: 'value' }} />
<Component onClick={() => handleClick()} />
```

### ✅ 올바름: 메모이제이션
```javascript
const config = useMemo(() => ({ option: 'value' }), []);
const handleClick = useCallback(() => { /* ... */ }, []);

<Component config={config} />
<Component onClick={handleClick} />
```

---

**핵심**: 현대 프론트엔드 패턴은 유지보수 가능하고 성능이 좋은 사용자 인터페이스를 가능하게 합니다. 프로젝트 복잡도에 맞는 패턴을 선택하세요.
