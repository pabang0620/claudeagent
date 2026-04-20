---
name: frontend-patterns
description: React 19 + Vite 7 프론트엔드 개발 패턴. React 19 신규 API, 컴포넌트 설계, 상태관리, 성능 최적화, 접근성 베스트 프랙티스
---

# 프론트엔드 개발 패턴 (React 19 + Vite 7)

## React 19 신규 API

### use() — 비동기 언래핑
```javascript
import { use, Suspense } from 'react'

function UserProfile({ userPromise }) {
  const user = use(userPromise) // Suspense 경계 안에서만 사용
  return <div>{user.name}</div>
}

<Suspense fallback={<Skeleton />}>
  <UserProfile userPromise={fetchUser(id)} />
</Suspense>
```

### useOptimistic — 낙관적 업데이트
```javascript
import { useOptimistic, useTransition } from 'react'

function LikeButton({ post }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    post.likes,
    (current, delta) => current + delta
  )
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    startTransition(async () => {
      addOptimisticLike(1)
      await likePost(post.id)
    })
  }

  return <button onClick={handleLike}>{optimisticLikes} 좋아요</button>
}
```

### useActionState — 폼 액션 상태
```javascript
import { useActionState } from 'react'

async function submitForm(prevState, formData) {
  const name = formData.get('name')
  if (!name) return { error: '이름을 입력하세요' }
  await saveUser({ name })
  return { error: null, success: true }
}

function UserForm() {
  const [state, formAction, isPending] = useActionState(submitForm, { error: null })

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
```

---

## 컴포넌트 설계 원칙

### 파일 분류 기준
```
pages/          → 라우트 진입점 (데이터 페칭 담당)
features/       → 도메인 기능 단위 (비즈니스 로직 포함)
components/ui/  → 순수 UI (재사용 가능, 비즈니스 로직 없음)
hooks/          → 커스텀 훅 (상태·사이드이펙트 로직)
utils/          → 순수 함수 유틸리티
```

### Compound Component 패턴
```javascript
const Card = {
  Root: ({ children, className }) => (
    <div className={`rounded-lg border p-4 ${className}`}>{children}</div>
  ),
  Header: ({ children }) => <div className="font-semibold mb-3">{children}</div>,
  Body: ({ children }) => <div className="text-sm">{children}</div>,
}

// 사용
<Card.Root>
  <Card.Header>제목</Card.Header>
  <Card.Body>내용</Card.Body>
</Card.Root>
```

### 상속보다 조합
```javascript
// ❌ Props drilling 3단계 이상 → Context로 교체
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>

// ✅ Context
const DataContext = createContext()
<DataContext.Provider value={data}>
  <GrandChild /> // useContext(DataContext)로 접근
</DataContext.Provider>
```

---

## 커스텀 훅 패턴

### 데이터 페칭 훅
```javascript
function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, isLoading: false })

  const execute = useCallback(async () => {
    setState({ data: null, error: null, isLoading: true })
    try {
      const data = await asyncFn()
      setState({ data, error: null, isLoading: false })
    } catch (error) {
      setState({ data: null, error, isLoading: false })
    }
  }, deps)

  useEffect(() => { execute() }, [execute])

  return { ...state, refetch: execute }
}

// 사용
const { data: users, isLoading, error, refetch } = useAsync(() => getUsers(), [])
```

### 디바운스 훅
```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

### 로컬스토리지 훅
```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    localStorage.setItem(key, JSON.stringify(valueToStore))
  }, [key, storedValue])

  return [storedValue, setValue]
}
```

---

## 상태관리 결정 기준

| 범위 | 방법 |
|------|------|
| 단일 컴포넌트 | `useState` |
| 복잡한 폼 | `useActionState` / `useReducer` |
| 서버 데이터 | React Query / SWR |
| 전역 UI 상태 (모달·테마) | Zustand or Context |
| URL 상태 | `searchParams` |

**주의**: 자주 변경되는 값을 Context에 넣으면 하위 트리 전체 리렌더링 발생

### Context + Reducer (전역 UI)
```javascript
const AppContext = createContext()

function appReducer(state, action) {
  switch (action.type) {
    case 'OPEN_MODAL': return { ...state, modal: { isOpen: true, data: action.payload } }
    case 'CLOSE_MODAL': return { ...state, modal: { isOpen: false, data: null } }
    default: return state
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, { modal: { isOpen: false, data: null } })
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp은 AppProvider 안에서만 사용 가능')
  return context
}
```

---

## 성능 최적화

### 메모이제이션 — 측정 후 적용
```javascript
// ❌ 과도한 메모이제이션 (단순 계산은 불필요)
const value = useMemo(() => a + b, [a, b])

// ✅ 비싼 연산에만
const filtered = useMemo(
  () => largeList.filter(item => item.active && item.score > threshold),
  [largeList, threshold]
)

// ✅ 자식에게 내려주는 함수
const handleSubmit = useCallback(async (data) => {
  await submit(data)
}, []) // 의존성 없으면 빈 배열
```

### 지연 로딩
```javascript
const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### 가상화 — 1000개 이상 리스트
```javascript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }) {
  const parentRef = useRef(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <div
            key={row.key}
            style={{ position: 'absolute', top: 0, transform: `translateY(${row.start}px)`, width: '100%' }}
          >
            <ItemRow item={items[row.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 폼 처리

### useActionState (React 19 권장)
```javascript
// 위 React 19 섹션 참조
```

### 제어 컴포넌트 + zod 검증
```javascript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  name: z.string().min(1).max(50),
})

function Form() {
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = schema.safeParse(Object.fromEntries(new FormData(e.target)))
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }
    await submit(result.data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      {errors.email && <span role="alert">{errors.email[0]}</span>}
    </form>
  )
}
```

---

## 에러 처리

### Error Boundary
```javascript
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('컴포넌트 오류:', error, info)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// 사용
<ErrorBoundary fallback={<ErrorPage />}>
  <FeatureComponent />
</ErrorBoundary>
```

---

## 접근성 (a11y)

```javascript
// ✅ 시맨틱 HTML + ARIA
function Modal({ isOpen, onClose, title, children }) {
  return (
    <dialog open={isOpen} aria-labelledby="modal-title" aria-modal="true">
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="모달 닫기">×</button>
    </dialog>
  )
}

// ✅ 포커스 관리
function useModalFocus(isOpen) {
  const ref = useRef(null)
  const previousFocus = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement
      ref.current?.focus()
    } else {
      previousFocus.current?.focus()
    }
  }, [isOpen])

  return ref
}
```

---

## 자주 하는 실수

### ❌ useEffect 의존성 누락
```javascript
useEffect(() => { fetchData(userId) }, []) // userId 변경 무시
// ✅
useEffect(() => { fetchData(userId) }, [userId])
```

### ❌ 인라인 객체/함수 → 매 렌더 재생성
```javascript
<Component config={{ option: 'value' }} />      // 매번 새 객체
<Component onClick={() => handleClick()} />     // 매번 새 함수
// ✅
const config = useMemo(() => ({ option: 'value' }), [])
const handleClick = useCallback(() => { /* ... */ }, [])
```

### ❌ 상태 직접 변이
```javascript
user.name = '새 이름'  // 렌더링 안됨
items.push(newItem)
// ✅
setUser(prev => ({ ...prev, name: '새 이름' }))
setItems(prev => [...prev, newItem])
```

---

**핵심**: React 19는 서버 통합과 낙관적 업데이트를 위한 API가 강화됐습니다. Profile first, optimize what matters.

---

## WeCom 회고 기반 프론트엔드 패턴 (347 fix 분석 교훈)

### 모바일 퍼스트 원칙
- CSS 기본: 모바일(375px) → `@media (min-width: 768px)` PC 확장만
- `pages/mobile/*` 복제 파일 금지 → `useIsMobile()` 조건부 렌더
- 고정 `width: Npx` 금지 (아이콘 80px 미만 예외) → `max-width`/`min()` 사용
- 전역 reset 7종 필수 (box-sizing, img max-width, button font, overflow-x hidden 등)

### 디자인 토큰 필수
- 모든 color/spacing/radius/shadow/font-weight 는 `var(--토큰)` 참조
- 하드코딩 hex `#RRGGBB`, `border-radius: Npx`, `box-shadow: N` 금지
- 토큰 수정 시 sed 일괄 수정 금지 → Edit 개별 수정

### 상태관리 안전 패턴
- 필터 "전체" 값: `null` 금지 → `ALL` 센티넬 상수 사용
- Zustand: `useStore((s) => s)` 금지 → 개별 셀렉터
- blob URL 생성 즉시 `useEffect return` 에 `revokeObjectURL` 짝
- Modal/BottomSheet: `useScrollLock` 필수 (document.body.style.overflow 직접 조작 금지)

### 이벤트 핸들러 안전
- 드래그: window/document 레벨 Pointer Events API (`onPointerDown` → `window.addEventListener`)
- 터치: React 합성 `onTouchMove` + `preventDefault` 금지 → `addEventListener('touchmove', fn, { passive: false })`
- Mutation 버튼: `pendingRef` 즉시 락 + `try/finally` 해제
