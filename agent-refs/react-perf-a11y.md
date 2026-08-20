# react-specialist 참조: 성능·에러·접근성·공용 훅 구현체

> 이 파일은 `.claude/agents/react-specialist.md` 의 참조 파일이다. 메모이제이션·가상화·ErrorBoundary·모달/포커스/스크롤락 훅을 실제로 작성할 때만 읽는다.

## 성능 최적화

### 메모이제이션 - 측정 후 적용
```typescript
// ❌ 과도한 메모이제이션 (오히려 성능 저하)
const value = useMemo(() => a + b, [a, b]) // 단순 계산은 불필요

// ✅ 비싼 연산에만
const filteredList = useMemo(
  () => largeList.filter(item => item.active && item.score > threshold),
  [largeList, threshold]
)

// ✅ 자식에게 넘기는 함수
const handleSubmit = useCallback(async (data: FormData) => {
  await submitForm(data)
}, []) // 의존성 없으면 빈 배열
```

### 지연 로딩
```typescript
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))
const AdminPanel = lazy(() => import('./AdminPanel'))

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### 가상화 - 대용량 리스트
```typescript
// 1000개 이상 리스트는 가상화 적용
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 에러 처리

### Error Boundary
```typescript
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// ⚠️ React 제약: ErrorBoundary는 React 19에서도 클래스 컴포넌트만 지원 - "함수형 컴포넌트만 사용" 원칙의 유일한 예외
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info)
    }
    // TODO(필수): 프로덕션 에러 리포팅 연결 - 미연결 시 운영 에러 무음 소멸
    // errorReporter?.capture(error, info)
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

```typescript
// ✅ 시맨틱 HTML + ARIA
function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <dialog
      open={isOpen}
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="모달 닫기">×</button>
    </dialog>
  )
}

// ✅ 로딩 상태 스크린 리더 알림
function LoadingButton({ isLoading, children, ...props }: ButtonProps) {
  return (
    <button {...props} aria-busy={isLoading} aria-disabled={isLoading}>
      {isLoading ? <span aria-hidden>로딩 중...</span> : children}
    </button>
  )
}
```

---

## 공용 훅 구현체

### useShallow (Zustand v5)
```typescript
// Zustand v5 - useShallow (import 경로 변경됨)
import { useShallow } from 'zustand/react/shallow'

// 사용 예시:
const { count, increment } = useStore(useShallow((s) => ({ count: s.count, increment: s.increment })))
```

### useIsMobile
```typescript
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}
```

### useScrollLock
```typescript
// useScrollLock - body 스크롤 잠금 (iOS Safari 포함)
function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}
```

### useReturnFocus / useFocusTrap
```typescript
// useReturnFocus - 모달 닫을 때 트리거 요소로 포커스 복원
export function useReturnFocus() {
  const triggerRef = useRef<HTMLElement | null>(null)

  const returnFocus = useCallback(() => {
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }, [])

  return { triggerRef, returnFocus }
}

// 사용 예시
function PageWithModal() {
  const { triggerRef, returnFocus } = useReturnFocus()
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    returnFocus() // 명시적 호출 - isOpen useEffect 패턴의 언마운트 버그 방지
  }

  return (
    <>
      <button ref={triggerRef} onClick={() => setIsOpen(true)}>모달 열기</button>
      {isOpen && <Modal onClose={handleClose} />}
    </>
  )
}
```
```typescript
export function useFocusTrap(active = true) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { containerRef.current?.dispatchEvent(new CustomEvent('focustrap:escape')); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return containerRef
}
```
```typescript
// useFocusTrap ESC 구독 예시 (Modal에서 사용)
useEffect(() => {
  const container = containerRef.current
  if (!container) return
  const handleEscape = () => onClose()
  container.addEventListener('focustrap:escape', handleEscape)
  return () => container.removeEventListener('focustrap:escape', handleEscape)
}, [containerRef, onClose])
```
