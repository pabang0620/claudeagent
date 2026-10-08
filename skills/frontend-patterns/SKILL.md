---
name: frontend-patterns
description: React 19 + Vite 7 프론트엔드 코드를 작성·수정할 때 자동 적용하는 이 사용자의 컨벤션. React 19 API 선택 기준, 커스텀 훅(useAsync·useDebounce·useLocalStorage) 표준형, 상태관리 선택표, 모바일 퍼스트·디자인 토큰·Zustand·blob·scrollLock 등 WeCom 회고 기반 금지 사항. 일반 React 지식은 담지 않는다. 정적 검사 룰은 error-prevention-rules·mobile-first-checker·convention-enforcer가 담당.
---

# 프론트엔드 개발 패턴 (React 19 + Vite 7)

## React 19 기준
- 폼 제출 상태는 `useActionState`, 낙관적 업데이트는 `useOptimistic`, 상위에서 만든 promise 언래핑은 `use()` + Suspense 경계. 렌더 중 `use(fetch(...))`로 promise를 새로 만들지 않는다 (매 렌더 재요청).
- `forwardRef` 없이 `ref`를 prop으로 받는다. Context는 `<Ctx value={...}>`로 직접 제공한다.

---

## 커스텀 훅 패턴

### 데이터 페칭 훅
```javascript
function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, isLoading: false })

  const execute = useCallback(async (signal) => {
    setState({ data: null, error: null, isLoading: true })
    try {
      const data = await asyncFn(signal)
      setState({ data, error: null, isLoading: false })
    } catch (error) {
      if (error.name === 'AbortError') return
      setState({ data: null, error, isLoading: false })
    }
  }, deps)

  useEffect(() => {
    const ac = new AbortController()
    execute(ac.signal)
    return () => ac.abort()
  }, [execute])

  return { ...state, refetch: execute }
}

// 사용 (signal을 API 함수까지 전달, ep-001)
const { data: users, isLoading, error, refetch } = useAsync((signal) => getUsers({ signal }), [])
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
    try {
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      console.warn('storage 저장 실패', e) // iOS Safari 프라이빗 모드·용량 초과 (ep-010)
    }
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

---

## 성능 최적화
- `useMemo`/`useCallback`은 측정 후, 비싼 연산과 memo된 자식에 내려주는 참조에만 쓴다.
- 무거운 화면은 `lazy` + Suspense로 분할한다. 1000개 이상 리스트는 가상화한다(프로젝트에 이미 있는 훅 우선, 예: wecom `useVirtualList`).

---

## 폼 처리

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
- 라우트 단위 ErrorBoundary 1개 + 기능 단위 fallback. 프로젝트에 공용 ErrorBoundary가 있으면 그것을 쓴다. 없을 때의 최소형:

```javascript
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error('컴포넌트 오류:', error, info) }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}
```

---

## 접근성
- 모달은 `<dialog>` 또는 `role="dialog"` + `aria-labelledby`, 열릴 때 포커스 이동, 닫힐 때 이전 포커스 복귀. 아이콘 버튼은 `aria-label` 필수.
- 아이콘은 CSS/인라인 SVG. OS 기본 이모지를 화면에 쓰지 않는다 (메모리 feedback_no_default_emoji_in_ui).

---

## 자주 하는 실수

### useEffect 의존성 누락 (ep-001·ep-012)
```javascript
useEffect(() => { fetchData(userId) }, []) // userId 변경 무시
// 올바른 형태
useEffect(() => {
  const ac = new AbortController()
  fetchData(userId, { signal: ac.signal })
  return () => ac.abort()
}, [userId])
```

### memo된 자식에 인라인 객체/함수 전달 (ep-008)
```javascript
<MemoChild config={{ option: 'value' }} />      // 매번 새 객체
<MemoChild onClick={() => handleClick()} />     // 매번 새 함수
// 올바른 형태
const config = useMemo(() => ({ option: 'value' }), [])
const handleClick = useCallback(() => { /* ... */ }, [])
```

### 상태 직접 변이 (rules/coding-style.md 불변성)
```javascript
user.name = '새 이름'  // 렌더링 안됨
items.push(newItem)
// 올바른 형태
setUser(prev => ({ ...prev, name: '새 이름' }))
setItems(prev => [...prev, newItem])
```

---

## WeCom 회고 기반 프론트엔드 패턴 (347 fix 분석 교훈)

### 모바일 퍼스트 원칙
- CSS 기본: 모바일(375px) → `@media (min-width: 768px)` PC 확장만
- `pages/mobile/*` 복제 파일 금지 → 프로젝트의 모바일 감지 훅(`useIsMobile`, wecom은 `useMobileDetect`)으로 조건부 렌더
- 고정 `width: Npx` 금지 (아이콘 80px 미만 예외) → `max-width`/`min()` 사용
- 전역 reset 7종 필수 (box-sizing, img max-width, button font, overflow-x hidden 등)
- 모바일 하단 고정 네비·툴바는 `position: fixed` 금지, `position: sticky` + bottom 여유값. viewport-fit·translateZ(0)·safe-area 높이 재계산은 전부 롤백된 시도이니 반복하지 않는다 (메모리 feedback_ios_safari_sticky_bottomnav)
- 페이지·카드 배경은 순백(#ffffff). 베이지·크림(#f5f5f3, #faf9f6 등) 금지 (메모리 feedback_no_beige_background)

### 디자인 토큰 필수
- 모든 color/spacing/radius/shadow/font-weight 는 `var(--토큰)` 참조
- 하드코딩 hex `#RRGGBB`, `border-radius: Npx`, `box-shadow: N` 금지
- 토큰 수정 시 sed 일괄 수정 금지 → Edit 개별 수정

### 상태관리 안전 패턴
- 필터 "전체" 값: `null` 금지 → `ALL` 센티넬 상수 사용
- Zustand: `useStore((s) => s)` 금지 → 개별 셀렉터
- blob URL 생성 즉시 `useEffect return` 에 `revokeObjectURL` 짝
- Modal/BottomSheet: 프로젝트의 scrollLock 유틸(wecom `utils/scrollLock.js`) 필수 (document.body.style.overflow 직접 조작 금지)

### 이벤트 핸들러 안전
- 드래그: window/document 레벨 Pointer Events API (`onPointerDown` → `window.addEventListener`)
- 터치: React 합성 `onTouchMove` + `preventDefault` 금지 → `addEventListener('touchmove', fn, { passive: false })`
- Mutation 버튼: `pendingRef` 즉시 락 + `try/finally` 해제
