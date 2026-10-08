# react-specialist 참조: 성능·에러·접근성·공용 훅 구현체

> 이 파일은 `.claude/agents/react-specialist.md` 의 참조 파일이다. 메모이제이션·가상화·ErrorBoundary·모달/포커스/스크롤락 훅을 실제로 작성할 때만 읽는다.

## 성능 최적화

메모이제이션·`lazy`/`Suspense`는 일반 지식이라 적지 않는다. 이 프로젝트군의 판단 기준만: React DevTools로 측정한 뒤 적용하고, 단순 계산에 `useMemo`를 붙이지 않는다. `@tanstack/react-virtual`은 package.json에 있을 때만 쓴다(없으면 설치 제안을 보고에 적는다).

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

// [주의] React 제약: ErrorBoundary는 React 19에서도 클래스 컴포넌트만 지원 - "함수형 컴포넌트만 사용" 원칙의 유일한 예외
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

필수 항목(정의파일 "핵심 원칙" 접근성 줄과 같다): 모달은 `role="dialog"` + `aria-modal` + focus trap + return focus + ESC 닫기, 토스트는 심각도별 `role="alert"`/`"status"`, `outline: none` 금지(포커스 링 유지), `prefers-reduced-motion` 대응, 아이콘 버튼은 `aria-label`. 모달은 아래 `useFocusTrap` + `useReturnFocus` + `useScrollLock` 세 훅을 함께 쓴다.

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
// useScrollLock - body 스크롤 잠금. iOS Safari(overflow:hidden 무시)까지 막으려면 position:fixed 방식이 필요하고,
// 중첩 모달을 위해 카운터를 둔다. ui-design-bootstrap-mode.md의 hooks/useScrollLock.js와 같은 구현이다 - 한쪽을 고치면 다른 쪽도 맞춘다.
const getStore = () => {
  if (typeof window === 'undefined') return { count: 0, scrollY: 0 }
  if (window.__scrollLockStore == null) window.__scrollLockStore = { count: 0, scrollY: 0 } // HMR 안전
  return window.__scrollLockStore
}

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return
    const store = getStore()
    if (store.count === 0) {
      store.scrollY = window.scrollY
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${store.scrollY}px`
      document.body.style.width = '100%'
      document.body.style.paddingRight = `${scrollbarWidth}px` // 스크롤바 너비 보정 (레이아웃 쉬프트 방지)
    }
    store.count++
    return () => {
      store.count--
      if (store.count === 0) {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.paddingRight = ''
        window.scrollTo(0, store.scrollY)
      }
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
